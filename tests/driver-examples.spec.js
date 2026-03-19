// External dependencies
const path = require("path");
const fs = require("fs-extra");
const yaml = require("js-yaml");
const ivm = require("isolated-vm");
const esl = require("eslint");
const esbuild = require('esbuild');
const {computeChecksum} = require("./crc32");

const DRIVER_PATH = path.resolve(process.env.DRIVER_PATH || __dirname);
const resolveDriverPath = (...paths) => path.join(DRIVER_PATH, ...paths);
const catalogRepos = ["device-catalog", "device-catalog-private", "device-catalog-shadow"];

function replaceRepoSegment(driverPath, repoName) {
    const driverPathSplit = driverPath.split(path.sep);
    const repoIndex = driverPathSplit.reduce((index, segment, currentIndex) => {
        if (catalogRepos.includes(segment)) {
            return currentIndex;
        }
        return index;
    }, -1);
    if (repoIndex === -1) {
        return null;
    }

    const newPath = [...driverPathSplit];
    newPath[repoIndex] = repoName;
    return newPath.join(path.sep);
}

function getDriverPathCandidates(driverPath) {
    const candidates = [driverPath];
    for (const repoName of catalogRepos) {
        const candidate = replaceRepoSegment(driverPath, repoName);
        if (candidate && !candidates.includes(candidate)) {
            candidates.push(candidate);
        }
    }
    return candidates;
}

function getTrustedYamlPath(driverPath) {
    if (driverPath.includes("device-catalog-shadow")) {
        return path.join(driverPath, "driver.yaml");
    }

    const privateDriverPath = replaceRepoSegment(driverPath, "device-catalog-private");
    if (!privateDriverPath) {
        return path.join(driverPath, "driver.yaml");
    }

    return path.join(privateDriverPath, "driver.yaml");
}

const privateDir = replaceRepoSegment(DRIVER_PATH, "device-catalog-private") ?? DRIVER_PATH;

let extractPoints;
if(fs.existsSync(path.join(privateDir, "extractPoints.js"))) {
    const extractPointsPath = path.join(privateDir, "extractPoints.js");
    extractPoints = require(extractPointsPath).extractPoints;
}
else if(fs.existsSync(resolveDriverPath("extractPoints.js"))) {
    const extractPointsPath = resolveDriverPath("extractPoints.js");
    extractPoints = require(extractPointsPath).extractPoints;
}

/**
 * Read the driver's package information
 */
const packageJson = fs.readJsonSync(resolveDriverPath("package.json"));
const mainPath = packageJson.main;

/**
 * Read the driver's signature from `driver.yaml`
 */
const driverYaml = yaml.load(fs.readFileSync(resolveDriverPath("driver.yaml")));
const signature = driverYaml.signature;

/**
 * Checking main code conformity with ESLint
 */
async function checkCode() {
    const eslint = new esl.ESLint({});
    const skipCodeCheck = ["mcf88", "senlab", "semtech"];
    const driverPathSplit = DRIVER_PATH.split(path.sep);
    if(!skipCodeCheck.includes(driverPathSplit[driverPathSplit.length - 3])) {
        let report;
        
        let code = "";
        if(fs.pathExistsSync(resolveDriverPath("index.js"))){
            code = fs.readFileSync(resolveDriverPath("index.js"), 'utf-8');

            if(fs.pathExistsSync(resolveDriverPath("extractPoints.js"))){
                
                const result = await esbuild.build({
                    target: "node8",
                    entryPoints: [resolveDriverPath("extractPoints.js")],
                    bundle: true,
                    format: 'cjs',
                    write: false,
                });

                const extractPointsCode = result.outputFiles[0].text;

                code += "\n\n" + extractPointsCode;
            }

            report = await eslint.lintText(code);
        }

        if(typeof report !== 'undefined' && typeof report[0] !== 'undefined' && report[0].errorCount) {
            throw new Error("Driver code is not compliant:\n" + report[0].messages.map(m => `${m.line}:${m.column}: ${m.message}`).join("\n"));
        }
    }
}

describe("Driver Code Compliance", () => {
    it("should pass ESLint checks", async () => {
        await checkCode(); 
    });
});


/**
 * Read predefined Isolated Buffer that acts exactly as the NodeJs Buffer library to prevent access to external from the isolated sandbox
 */
const isoBuffer = fs.readFileSync(path.join(__dirname, "../", "iso-libraries", "iso-buffer.js"), "utf8");

/**
 * Validate if decodeDownlink function is defined in the driver
 * as some drivers may have encodeDownlink but no decodeDownlink
 * and there exist examples with legacy type "downlink" that should be wrapped only to "downlink-encode"
 */
const isDownlinkDecodeDefined = (() =>{
    const driverFns = require(resolveDriverPath(mainPath));
    switch (signature){
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
})();

/**
 * Read the examples according to the signature of driver, wrap them if needed
 */
function wrapLegacyExamples(rawExamples = []) {
    const wrapped = [];
    console.log(rawExamples);
    for (const example of rawExamples) {
        if (!example || !example.type) continue;

        if (example.type === "uplink") {
            let thing = example.thing;
            if (thing != undefined && example.model != undefined) {
                thing.model = example.model;
            }

            wrapped.push({
                type: "uplink",
                description: example.description,
                useContext: example.useContext,
                input: {
                    bytes: example.bytes,
                    fPort: example.fPort,
                    time: example.time,
                    thing: example.thing,
                    context: example.context
                },
                output: example.data,
                points: example.points
            });
        }
        else if (example.type === "downlink") {
            // map to downlink-decode examples only on drivers which have this function
            if (isDownlinkDecodeDefined) {
                wrapped.push({
                    type: "downlink-decode",
                    description: example.description,
                    input: {
                        bytes: example.bytes,
                        fPort: example.fPort,
                        time: example.time,
                        thing: example.thing
                    },
                    output: example.data
                });
            }

            const enc = {
                type: "downlink-encode",
                description: example.description,
                input: {
                    data: example.data,
                    fPort: example.fPort
                },
                output: {
                    bytes: example.bytes,
                    fPort: example.fPort
                }
            };
            if (typeof example.errors !== "undefined") enc.output.errors = example.errors;
            if (typeof example.warnings !== "undefined") enc.output.warnings = example.warnings;

            wrapped.push(enc);
        }
        else {
            // Already wrapped format (uplink / downlink-encode / downlink-decode)
            wrapped.push(example);
        }
    }

    return wrapped;
}

function loadExamplesFromExamplesFolder() {
    if (!fs.pathExistsSync(resolveDriverPath("examples"))) {
        return [];
    }

    const examplesFiles = fs.readdirSync(resolveDriverPath("examples"));
    let all = [];

    for (const exampleFile of examplesFiles) {
        if (exampleFile.endsWith(".examples.json")) {
            const legacy = fs.readJsonSync(resolveDriverPath("examples/" + exampleFile));
            all = all.concat(wrapLegacyExamples(legacy));
        }
    }

    return all;
}

/**
 * Regular examples (existing behavior)
 */
const examples = (() => {
    // default (lora-alliance): root examples.json is already expected in wrapped format
    if (fs.pathExistsSync(resolveDriverPath("examples.json"))) {
        return fs.readJsonSync(resolveDriverPath("examples.json"));
    }

    // other signatures: legacy folder examples/*.examples.json
    return loadExamplesFromExamplesFolder();
})();

/**
 * Non-regression tests (separate dataset)
 * Supports both legacy format (uplink/downlink) and already-wrapped format.
 */
const nonRegressionTests = (() => {
    let examples
    if (fs.pathExistsSync(resolveDriverPath("non-regression.json"))) {
        examples = fs.readJsonSync(resolveDriverPath("non-regression.json"));
    }else{
        return loadExamplesFromExamplesFolder();
    }

    return examples
})();

function normalizeNonRegressionUplinkResult(result) {
    if (!result || typeof result !== "object") {
        return { data: result, errors: [], warnings: [] };
    }

    // Déjà au bon format
    if ("data" in result && "errors" in result && "warnings" in result) {
        return result;
    }

    // Si le driver renvoie errors/warnings au top-level mais pas data
    if (("errors" in result || "warnings" in result) && !("data" in result)) {
        return {
            data: result.data ?? (result.message ?? result.payload ?? result),
            errors: result.errors ?? [],
            warnings: result.warnings ?? []
        };
    }

    // Cas "data brut"
    if(result.data != null){
        return { data: result.data, errors: [], warnings: [] };
    }

    return { data: result, errors: [], warnings: [] };

}


/**
 * Read the legacy error examples if there is any
 */
const errors = (() =>{
    // error examples are stored in a separate folder, in one or several json files
    // Get the list of files in the directory `examples`

    if(!fs.pathExistsSync(resolveDriverPath("errors"))){
        return [];
    }
    let errorFiles = fs.readdirSync(resolveDriverPath("errors"));

    // Storing all the error files in an array
    let errors = [];
    for (const errorFile of errorFiles) {
        if (errorFile.endsWith(".errors.json")) {
            errors = examples.concat(fs.readJsonSync(resolveDriverPath("errors/" + errorFile)));
        }
    }
    return errors;
})();

/**
 * Read the functions call script according to the signature of driver
 */
const fnCall = (() => {
    let fnCallRef;
    switch (signature){
        case "actility":
            fnCallRef = "tpxFnCall.js";
            break;
        case "ttn":
            fnCallRef = "ttnFnCall.js";
            break;
        case "chirpstack":
            fnCallRef =  "chirpstackFnCall.js";
            break;
        case "lora-alliance":
        default:
            fnCallRef = "loraAllianceFnCall.js";
            break;
    }
    return fs.readFileSync(path.join(__dirname, "../", "iso-libraries", fnCallRef), "utf8");
})();

/**
 * Read the driver code according to the main file specified in the npm package
 */
const code = (() => {
    return fs.readFileSync(resolveDriverPath(mainPath), "utf8");
})();

/**
 * Checking whether the driver is trusted or not
 */
function isTrusted() {
    const driverYamlPath = getTrustedYamlPath(DRIVER_PATH);
    let driverYamlTrusted = false;
    if(fs.existsSync(driverYamlPath)) {
        const driverYaml = yaml.load(fs.readFileSync(driverYamlPath))
        const driverYamlTrustedCrc = driverYaml.trustedCRC;
        if (driverYamlTrustedCrc) {
            driverYamlTrusted = computeChecksum(DRIVER_PATH) === driverYamlTrustedCrc;
        }
    }
    return driverYamlTrusted;
}

const trusted = isTrusted();

/**
 * @param input : input from example to run the driver with
 * @param operation : operation to be operated on the input
 * @return result: output of the driver with the given input and operation
 */
async function run(input, operation){
    if (trusted) {
        const driverPath = resolveDriverPath(mainPath);
        const driverModule = require(driverPath);

        let fn = driverModule;
        if (typeof driverModule.driver?.decodeUplink === 'function') {
            fn = driverModule.driver;
        }

        // if(driverYaml.useContext) {
            if(input.useContext) {
                global.context = input.context ?? [];
            }
        // }

        if (signature === "ttn") {
            if (operation === "decodeUplink") {
                return fn.Decoder(input.bytes, input.fPort);
            }
            if (operation === "encodeDownlink") {
                return fn.Encoder(input.data, input.fPort);
            }
        } else if (signature === "chirpstack") {
            if (operation === "decodeUplink") {
                return fn.Decode(input.fPort, input.bytes);
            }
            if (operation === "encodeDownlink") {
                return fn.Encode(input.fPort, input.data);
            }
        } else if (signature === "actility" && operation === "encodeDownlink") {
            return fn[operation](input.data);
        }

        return fn[operation](input);
    }

    const isolate = new ivm.Isolate();
    const script = isolate.compileScriptSync(isoBuffer.concat("\n" + code).concat("\n" + fnCall));

    const context = await isolate.createContext();
    await context.global.set("operation", operation);
    await context.global.set("input", new ivm.ExternalCopy(input).copyInto());
    await context.global.set("exports", new ivm.ExternalCopy({}).copyInto());
    // if(driverYaml.useContext) {
        if(input.useContext) {
            await context.global.set("context", new ivm.ExternalCopy(input.context ?? []).copyInto());
        }
    // }

    await script.run(context, { timeout: 1000 });
    const getDriverEngineResult = await context.global.get("getDriverEngineResult");
    const result = getDriverEngineResult();
    context.release();
    return result;
}

function getExampleDecodedOutput(example) {
    return example.output?.data ?? example.output;
}

function getExpectedPoints(points) {
    return hasDefinedPoints(points) ? points : undefined;
}

function isEmptyPointsResult(points) {
    return points == null || (typeof points === "object" && Object.keys(points).length === 0);
}

async function expectDecodeUplinkExample(example, normalizeResult = false) {
    const input = example.input;
    input.bytes = adaptBytesArray(input.bytes);
    input.useContext = example.useContext;

    const raw = await run(input, "decodeUplink");
    const result = normalizeResult ? normalizeNonRegressionUplinkResult(raw) : raw;
    const expected = example.output;

    skipTypes(result, expected);
    dateIsLocal(example.description, input.time ?? input.recvTime);

    expect(result).toStrictEqual(expected);
}

async function expectDecodeDownlinkExample(example) {
    const input = example.input;
    input.bytes = adaptBytesArray(input.bytes);

    const result = await run(input, "decodeDownlink");
    const expected = example.output;

    dateIsLocal(example.description, input.time ?? input.recvTime);

    expect(result).toStrictEqual(expected);
}

async function expectEncodeDownlinkExample(example) {
    const input = example.input;

    const result = await run(input, "encodeDownlink");
    const expected = example.output;

    if (result.bytes) {
        result.bytes = adaptBytesArray(result.bytes);
    }
    if (expected.bytes) {
        expected.bytes = adaptBytesArray(expected.bytes);
    }
    dateIsLocal(example.description, input.time ?? input.recvTime);

    expect(result).toStrictEqual(expected);
}

function expectExtractPointsExample(example) {
    const decoded = getExampleDecodedOutput(example);
    const result = extractPoints({
        message: decoded,
        time: example.input?.time,
        thing: example.input?.thing
    });

    const currentPoints = getExpectedPoints(example.points);
    if (currentPoints) {
        checkEventTimes(example.description, currentPoints);
        expect(result).toEqual(currentPoints);
        return;
    }

    expect(isEmptyPointsResult(result)).toBe(true);
}

function defineExtractPointsSuite(suiteName, dataset) {
    if (!extractPoints) {
        return;
    }

    describe(suiteName, () => {
        dataset.forEach((example, index) => {
            if (example.type !== "uplink" || !example.output) {
                return;
            }

            test(`${index + 1} - ${example.description}`, () => {
                expectExtractPointsExample(example);
            });
        });
    });
}

function defineLegacyErrorSuite(suiteName, operation, shouldUseData) {
    describe(suiteName, () => {
        errors.forEach((error) => {
            if (error.type !== "uplink" || Boolean(error.data) !== shouldUseData) {
                return;
            }

            it(error.description, () => {
                const input = error.data ? error.data : {
                    bytes: adaptBytesArray(error.bytes),
                    fPort: error.fPort,
                    time: error.time
                };

                const expected = error.error;
                expect(async () => await run(input, operation).toThrow(expected));
            });
        });
    });
}

function defineCodecSuites(parentName, dataset, options = {}) {
    const { normalizeDecodeUplink = false } = options;

    describe(parentName, () => {
        describe("Decode uplink", () => {
            dataset.forEach((example) => {
                if (example.type !== "uplink") {
                    return;
                }

                it(example.description, async () => {
                    await expectDecodeUplinkExample(example, normalizeDecodeUplink);
                });
            });
        });

        describe("Decode downlink", () => {
            dataset.forEach((example) => {
                if (example.type !== "downlink-decode") {
                    return;
                }

                it(example.description, async () => {
                    await expectDecodeDownlinkExample(example);
                });
            });
        });

        describe("Encode downlink", () => {
            dataset.forEach((example) => {
                if (example.type !== "downlink-encode") {
                    return;
                }

                it(example.description, async () => {
                    await expectEncodeDownlinkExample(example);
                });
            });
        });
    });
}


/**
 Test suites compatible with all driver types
 */
defineCodecSuites("Non-regression tests", nonRegressionTests, { normalizeDecodeUplink: true });
defineExtractPointsSuite("extractPoints", nonRegressionTests);

defineCodecSuites("Examples", examples);
defineExtractPointsSuite("extractPoints - should extract expected points from decoded uplink", examples);

defineLegacyErrorSuite("Legacy Decode uplink errors", "decodeUplink", false);
defineLegacyErrorSuite("Legacy Decode downlink errors", "decodeDownlink", false);
defineLegacyErrorSuite("Legacy Encode downlink errors", "encodeDownlink", true);

/**
 Utils used for unusual inputs
 */
function adaptBytesArray(bytes){
    // if the bytes in example are in hexadecimal format instead of array of integers
    if(typeof bytes === "string"){
        return Array.from(Buffer.from(bytes, "hex"));
    }
    return bytes;
}

function dateIsLocal(description, time, throwError = false) {
    if(typeof description === 'string' && typeof time === 'string') {
        const isLocal = !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/.test(time);
        if(isLocal) {
            if(throwError) {
                throw new Error(description + "\nTimestamp should be UTC-relative");
            }
            else {
                console.warn(description + "\nTimestamp should be UTC-relative");
            }
        }
    }
}

// UTIL
function skipTypes(result, expected) {
    for(let property of listProperties(result)) {
        let keys = property.split('.');
        let value = result;
        let expectedValue = expected;
        let skipProperty = false;
        for (let key of keys) {
            value = value?.[key];
            expectedValue = expectedValue?.[key];
            if (expectedValue == null) {
                skipProperty = true;
                break;
            }
        }
        if(skipProperty) continue;

        let isDate = isValueDate(value);
        let isNumber = /[0-9]+( |.[0-9]+)/.test(value);
        isDate |= value instanceof Date;
        isNumber |= value instanceof Number;

        if(isDate) {
            let displayedResult = value;
            if(displayedResult instanceof Date) displayedResult = displayedResult.toISOString();
            if(expectedValue === "XXXX-XX-XXTXX:XX:XX.XXXZ") displayedResult = "XXXX-XX-XXTXX:XX:XX.XXXZ";

            value = result;
            for (let i = 0; i < keys.length - 1; i++) {
                if (!value[keys[i]] || typeof value[keys[i]] !== 'object') {
                    value[keys[i]] = {};
                }
                value = value[keys[i]];
            }
            value[keys[keys.length - 1]] = displayedResult;
        }

        else if(isNumber) {
            let displayedResult = value;
            if(displayedResult instanceof Number) displayedResult = displayedResult.toISOString();
            if(expectedValue === "SKIP_NUMBER") displayedResult = "SKIP_NUMBER";

            value = result;
            for (let i = 0; i < keys.length - 1; i++) {
                if (!value[keys[i]] || typeof value[keys[i]] !== 'object') {
                    value[keys[i]] = {};
                }
                value = value[keys[i]];
            }
            value[keys[keys.length - 1]] = displayedResult;
        }
    }
}

function isValueDate(value) {
    if (value instanceof Date) {
        return true;
    }

    if (typeof value === 'string') {
        const parsedDate = new Date(value);

        if (!isNaN(parsedDate.getTime())) {
            return true;
        }
    }

    return false;
}

function listProperties(obj, parent = '', result = []) {
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (typeof obj[key] === 'object' && !(obj[key] instanceof Date) && obj[key] !== null) {
                listProperties(obj[key], parent + key + '.', result);
            } else {
                result.push(parent + key);
            }
        }
    }
    return result;
}

function hasDefinedPoints(points) {
    return points != null && (typeof points !== "object" || Object.keys(points).length > 0);
}

function checkEventTimes(description, points) {
    for(let value of Object.values(points)) {
        if(value.records === undefined) {
            continue;
        }
        for(let record of value.records) {
            if(record.eventTime !== undefined) {
                if(record.eventTime === "XXXX-XX-XXTXX:XX:XX.XXXZ") {
                    continue;
                }
                dateIsLocal(description, record.eventTime, true);
            }
        }
    }
}
