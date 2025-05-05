// External dependencies
const path = require("path");
const fs = require("fs-extra");
const yaml = require("js-yaml");
const ivm = require("isolated-vm");

const DRIVER_PATH = path.resolve(process.env.DRIVER_PATH || __dirname);
const resolveDriverPath = (...paths) => path.join(DRIVER_PATH, ...paths);

const isoBuffer = loadIsoBufferLibrary();
const driverYaml = loadDriverMetadata();
const signature = driverYaml.signature;
const isDownlinkDecodeDefined = getIsDownlinkDecodeDefined();
const examples = loadExamples();
const errors = loadErrors();
const fnCall = whichSignatureCall();
const code = loadCode();
const trusted = isTrusted();

async function run(input, operation) {
    if (trusted) {
        const packageJson = fs.readJsonSync(resolveDriverPath("package.json"));
        const driverPath = resolveDriverPath(packageJson.main);
        const driverModule = require(driverPath);
        const fn = driverModule.driver?.decodeUplink ? driverModule.driver : driverModule;
        return fn[operation](input);
    }

    const isolate = new ivm.Isolate();
    const script = isolate.compileScriptSync(
        isoBuffer.concat("\n" + code).concat("\n" + fnCall)
    );

    const context = await isolate.createContext();
    await context.global.set("operation", operation);
    await context.global.set("input", new ivm.ExternalCopy(input).copyInto());
    await context.global.set("exports", new ivm.ExternalCopy({}).copyInto());

    await script.run(context, { timeout: 1000 });
    const getDriverEngineResult = await context.global.get("getDriverEngineResult");
    const result = getDriverEngineResult();
    await context.release();
    return result;
}

// ---- TESTS ---- //
const uplinkExamples = examples.filter(e => e.type === "uplink");
if (uplinkExamples.length > 0) {
    describe("Test - Decode uplink", () => {
        test.each(uplinkExamples.map(e => [e.description, e.input, e.output]))(
            "%s",
            async (_, input, expected) => {
                const result = await run({ ...input, bytes: adaptBytesArray(input.bytes) }, "decodeUplink");
                skipTypes(result, expected);
                expect(result).toStrictEqual(expected);
            }
        );
    });
}

const downlinkDecodeExamples = examples.filter(e => e.type === "downlink-decode");
if (downlinkDecodeExamples.length > 0) {
    describe("Test - Decode downlink", () => {
        test.each(downlinkDecodeExamples.map(e => [e.description, e.input, e.output]))(
            "%s",
            async (_, input, expected) => {
                const result = await run({ ...input, bytes: adaptBytesArray(input.bytes) }, "decodeDownlink");
                expect(result).toStrictEqual(expected);
            }
        );
    });
}

const downlinkEncodeExamples = examples.filter(e => e.type === "downlink-encode");
if (downlinkEncodeExamples.length > 0) {
    describe("Test - Encode downlink", () => {
        test.each(downlinkEncodeExamples.map(e => [e.description, e.input, e.output]))(
            "%s",
            async (_, input, expected) => {
                const result = await run(input, "encodeDownlink");
                if (result.bytes) result.bytes = adaptBytesArray(result.bytes);
                if (expected.bytes) expected.bytes = adaptBytesArray(expected.bytes);
                expect(result).toStrictEqual(expected);
            }
        );
    });
}

// ---- Fonctions auxiliaires ---- //
function loadDriverMetadata() {
    return yaml.load(fs.readFileSync(resolveDriverPath("driver.yaml"), "utf8"));
}

function loadIsoBufferLibrary() {
    return fs.readFileSync(path.join(__dirname, "../", "iso-libraries", "iso-buffer.js"), "utf8");
}

function getIsDownlinkDecodeDefined() {
    const packageJson = fs.readJsonSync(resolveDriverPath("package.json"));
    const driverFns = require(resolveDriverPath(packageJson.main));
    const fn = driverFns.driver?.decodeUplink ? driverFns.driver : driverFns;
    return typeof fn.decodeDownlink === 'function';
}

function loadExamples(){
    const exPath = resolveDriverPath("examples.json");
    if (fs.pathExistsSync(exPath)) return fs.readJsonSync(exPath);

    const folder = resolveDriverPath("examples");
    if (!fs.pathExistsSync(folder)) return [];

    const examplesFiles = fs.readdirSync(folder);
    let examples = [];
    for (const file of examplesFiles) {
        if (file.endsWith(".examples.json")) {
            const data = fs.readJsonSync(path.join(folder, file));
            for (const ex of data) {
                if (ex.type === "uplink") {
                    examples.push({
                        type: ex.type,
                        description: ex.description,
                        input: {
                            bytes: ex.bytes,
                            fPort: ex.fPort,
                            time: ex.time,
                            thing: ex.thing
                        },
                        output: ex.data
                    });
                } else if (ex.type === "downlink") {
                    if (isDownlinkDecodeDefined) {
                        examples.push({
                            type: "downlink-decode",
                            description: ex.description,
                            input: {
                                bytes: ex.bytes,
                                fPort: ex.fPort,
                                time: ex.time,
                                thing: ex.thing
                            },
                            output: ex.data
                        });
                    }
                    examples.push({
                        type: "downlink-encode",
                        description: ex.description,
                        input: {
                            data: ex.data,
                            fPort: ex.fPort
                        },
                        output: {
                            bytes: ex.bytes,
                            fPort: ex.fPort
                        }
                    });
                }
            }
        }
    }
    return examples;
}

// Load error examples
function loadErrors() {
    const folder = resolveDriverPath("errors");
    if (!fs.pathExistsSync(folder)) return [];
    const files = fs.readdirSync(folder);
    let errors = [];
    for (const file of files) {
        if (file.endsWith(".errors.json")) {
            errors = examples.concat(fs.readJsonSync(path.join(folder, file)));
        }
    }
    return errors;
}

function loadCode() {
    const packageJson = fs.readJsonSync(resolveDriverPath("package.json"));
    return fs.readFileSync(resolveDriverPath(packageJson.main), "utf8");
}

function whichSignatureCall() {
    let fnCallRef;
    switch (signature){
        case "actility": fnCallRef = "tpxFnCall.js"; break;
        case "ttn": fnCallRef = "ttnFnCall.js"; break;
        case "chirpstack": fnCallRef =  "chirpstackFnCall.js"; break;
        case "lora-alliance":
        default: fnCallRef = "loraAllianceFnCall.js"; break;
    }
    return fs.readFileSync(path.join(__dirname, "../", "iso-libraries", fnCallRef), "utf8");
}

// Determine trust status of the driver
function isTrusted() {
    const packageJson = fs.readJsonSync(path.join(__dirname, "package.json"));
    return packageJson.trusted ?? false;
}

// Convert hex string to byte array if needed
const adaptBytesArray = bytes =>
    typeof bytes === "string" ? Array.from(Buffer.from(bytes, "hex")) : bytes;

// Adjust result types for consistent comparison (dates, numbers)
const skipTypes = (result, expected) => {
    listProperties(result).forEach(prop => {
        const keys = prop.split('.');
        let resVal = result, expVal = expected;
        for (const key of keys) {
            resVal = resVal?.[key];
            expVal = expVal?.[key];
            if (expVal === undefined || expVal === null) return;
        }

        const updateValue = v => {
            let target = result;
            for (let i = 0; i < keys.length - 1; i++) {
                target = target[keys[i]] ||= {};
            }
            target[keys.at(-1)] = v;
        };

        const isDate = typeof resVal === 'string' && /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/.test(resVal);
        const isNumber = typeof resVal === 'number';

        if (isDate && expVal === "XXXX-XX-XXTXX:XX:XX.XXXZ") updateValue("XXXX-XX-XXTXX:XX:XX.XXXZ");
        if (isNumber && expVal === "SKIP_NUMBER") updateValue("SKIP_NUMBER");
    });
};

// List all leaf property paths (dot notation)
const listProperties = (obj, parent = '', result = []) => {
    for (const key in obj) {
        if (!obj.hasOwnProperty(key)) continue;
        const path = parent + key;
        if (typeof obj[key] === 'object' && obj[key] !== null && !(obj[key] instanceof Date)) {
            listProperties(obj[key], path + '.', result);
        } else {
            result.push(path);
        }
    }
    return result;
};
