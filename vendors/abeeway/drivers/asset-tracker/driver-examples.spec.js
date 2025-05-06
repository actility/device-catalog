// External dependencies
const path = require("path");
const fs = require("fs-extra");
const yaml = require("js-yaml");
const ivm = require("isolated-vm");
const { get } = require("http");

const isoBuffer = loadIsoBufferLibrary();
const driverYaml = loadDriverMetadata();
const signature = driverYaml.signature;
const isDownlinkDecodeDefined = getIsDownlinkDecodeDefined();
const examples = loadExamples();
const errors = loadErrors();
const fnCall = whichSignatureCall();
const code = loadCode();
const trusted = isTrusted();

// Main runner used to execute driver operations
async function run(input, operation) {
    if (trusted) {
        const packageJson = fs.readJsonSync(path.join(__dirname, "package.json"));
        const driverPath = path.join(__dirname, packageJson.main);
        const driverModule = require(driverPath);
        let fn = driverModule;
        if (typeof driverModule.driver?.decodeUplink === 'function') {
            fn = driverModule.driver;
        }
        return fn[operation](input);
    }

    // Variables isolate + script déplacées ici
    const isolate = new ivm.Isolate();
    const script = isolate.compileScriptSync(
        isoBuffer.concat("\n" + code).concat("\n" + fnCall)
    );

    const context = await isolate.createContext();
    await context.global.set("operation", operation);
    await context.global.set("input", new ivm.ExternalCopy(input).copyInto());
    await context.global.set("exports", new ivm.ExternalCopy({}).copyInto());
    await context.global.set("context", new ivm.ExternalCopy(input.context ? input.context : []).copyInto());

    await script.run(context, { timeout: 1000 });
    const getDriverEngineResult = await context.global.get("getDriverEngineResult");
    const result = getDriverEngineResult();
    await context.release();
    return result;
}

describe("Test - Decode uplink", () => {
    test.each(examples.filter(e => e.type === "uplink").map(e => [e.description, e.input, e.output]))(
        "%s",
        async (_, input, expected) => {
            const result = await run({ ...input, bytes: adaptBytesArray(input.bytes) }, "decodeUplink");
            skipTypes(result, expected);
            expect(result).toStrictEqual(expected);
        }
    );
});

describe("Test - Decode downlink", () => {
    test.each(examples.filter(e => e.type === "downlink-decode").map(e => [e.description, e.input, e.output]))(
        "%s",
        async (_, input, expected) => {
            const result = await run({ ...input, bytes: adaptBytesArray(input.bytes) }, "decodeDownlink");
            expect(result).toStrictEqual(expected);
        }
    );
});

describe("Test - Encode downlink", () => {
    test.each(examples.filter(e => e.type === "downlink-encode").map(e => [e.description, e.input, e.output]))(
        "%s",
        async (_, input, expected) => {
            const result = await run(input, "encodeDownlink");
            if (result.bytes) result.bytes = adaptBytesArray(result.bytes);
            if (expected.bytes) expected.bytes = adaptBytesArray(expected.bytes);
            expect(result).toStrictEqual(expected);
        }
    );
});

// Load driver metadata
function loadDriverMetadata() {
    return yaml.load(fs.readFileSync(path.join(__dirname, "driver.yaml"), "utf8"));
}

// Load predefined isolated Buffer to prevent access to external from the sandbox
function loadIsoBufferLibrary() {
    return fs.readFileSync(path.join(__dirname, "../../../..", "iso-libraries", "iso-buffer.js"), "utf8");
}

// Determine if decodeDownlink is defined in the driver
function getIsDownlinkDecodeDefined() {
    const packageJson = fs.readJsonSync(path.join(__dirname, "package.json"));
    const driverFns = require("./" + packageJson.main);
    switch (signature) {
        case "ttn":
        case "chirpstack":
            return false;
        case "lora-alliance":
        case "actility":
        default:
            let fn;
            if(typeof driverFns.driver === 'undefined' || typeof driverFns.driver.decodeUplink !== 'function') {
                fn = driverFns;
            } else {
                fn = driverFns.driver;
            }
            return typeof fn.decodeDownlink === 'function';
    }
}

// Load and wrap all examples depending on the driver signature
function loadExamples(){
    if(fs.pathExistsSync(path.join(__dirname, "examples.json"))){
        return fs.readJsonSync(path.join(__dirname, "examples.json"));
    }
    if(!fs.pathExistsSync(path.join(__dirname, "examples"))){
        return [];
    }
    let examplesFiles = fs.readdirSync("examples");
    let examples = [];
    for (const exampleFile of examplesFiles) {
        if (exampleFile.endsWith(".examples.json")) {
            let neWExamples = fs.readJsonSync(path.join(__dirname, "examples", exampleFile));
            for(const example of neWExamples){
                if(example.type === "uplink"){
                    let wrappedExample = {
                        type: example.type,
                        description: example.description,
                        input: {
                            bytes: example.bytes,
                            fPort: example.fPort,
                            time: example.time,
                            thing: example.thing
                        },
                        output: example.data
                    }
                    examples.push(wrappedExample);
                } else if(example.type === "downlink"){
                    if(isDownlinkDecodeDefined){
                        let wrappedDecodeDownlink = {
                            type: "downlink-decode",
                            description: example.description,
                            input: {
                                bytes: example.bytes,
                                fPort: example.fPort,
                                time: example.time,
                                thing: example.thing
                            },
                            output: example.data
                        }
                        examples.push(wrappedDecodeDownlink);
                    }
                    let wrappedEncodeDownlink = {
                        type: "downlink-encode",
                        description: example.description,
                        input: {
                            data: example.data,
                            fPort: example.fPort
                        },
                        output: {
                            bytes: example.bytes,
                            fPort: example.fPort,
                        }
                    }
                    examples.push(wrappedEncodeDownlink);
                }
            }
        }
    }
    return examples;
}

// Load error examples
function loadErrors() {
    if(!fs.pathExistsSync(path.join(__dirname, "errors"))){
        return [];
    }
    let errorFiles = fs.readdirSync("errors");
    let errors = [];
    for (const errorFile of errorFiles) {
        if (errorFile.endsWith(".errors.json")) {
            errors = examples.concat(fs.readJsonSync(path.join(__dirname, "errors", errorFile)));
        }
    }
    return errors;
}

// Load driver code based on main file
function loadCode() {
    const packageJson = fs.readJsonSync(path.join(__dirname, "package.json"));
    return fs.readFileSync(path.join(__dirname, packageJson.main), "utf8");
}

// Load appropriate function call wrapper based on signature
function whichSignatureCall() {
    let fnCallRef;
    switch (signature){
        case "actility": fnCallRef = "tpxFnCall.js"; break;
        case "ttn": fnCallRef = "ttnFnCall.js"; break;
        case "chirpstack": fnCallRef =  "chirpstackFnCall.js"; break;
        case "lora-alliance":
        default: fnCallRef = "loraAllianceFnCall.js"; break;
    }
    return fs.readFileSync(path.join(__dirname, "../../../..", "iso-libraries", fnCallRef), "utf8");
};

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

