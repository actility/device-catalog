// External dependencies
const path = require("path");
const fs = require("fs-extra");
const yaml = require("js-yaml");
const ivm = require("isolated-vm");
const esl = require("eslint");
const esbuild = require('esbuild');

const DRIVER_PATH = path.resolve(process.env.DRIVER_PATH || __dirname);
const resolveDriverPath = (...paths) => path.join(DRIVER_PATH, ...paths);
let privateDir = DRIVER_PATH;
if(!privateDir.includes("device-catalog-private")) {
    privateDir = path.join(privateDir.replace("device-catalog", "device-catalog-private"));
}
else if(privateDir.includes("tmp")) {
    let privateDirSplit = privateDir.split(path.sep);
    for(let i = privateDirSplit.length-1 ; i >= 0 ; i--) {
        if(privateDirSplit[i] === "device-catalog") {
            privateDirSplit[i] = "device-catalog-private";
            break;
        }
    }
    privateDir = privateDirSplit.join(path.sep);
}

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
const packageTrusted = packageJson.trusted ?? false;

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
        let errors = {};
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

        if(Object.keys(errors).length) {
            throw new Error("Driver code is not compliant:\n" + JSON.stringify(errors, null, 2));
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
const examples = (() => {
    // for default (lora-alliance) signature,
    // all examples are stored in one file on the root `examples.json`
    if(fs.pathExistsSync(resolveDriverPath("examples.json"))){
        return fs.readJsonSync(resolveDriverPath("examples.json"));
    }

    // for the rest of signature,
    // examples are stored in a separate folder, in one or several json files that ends with `.examples.json`
    // Get the list of files in the directory `examples`
    // The examples are stored in a legacy format
    // They should be wrapped

    if(!fs.pathExistsSync(resolveDriverPath("examples"))){
        return [];
    }
    let examplesFiles = fs.readdirSync(resolveDriverPath("examples"));

    // Wrap and store all the examples in an array
    let examples = [];
    for (const exampleFile of examplesFiles) {
        if (exampleFile.endsWith(".examples.json")) {
            let newExamples = fs.readJsonSync(resolveDriverPath("examples/" + exampleFile));
            for(const example of newExamples){
                if(example.type === "uplink"){

                    let thing = example.thing;
                    if(thing != undefined && example.model != undefined) {
                        thing.model = example.model;
                    }

                    let wrappedExample = {
                        type: example.type,
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
                    }
                    examples.push(wrappedExample);
                } else if(example.type === "downlink"){
                    // map to downlink-decode examples only on drivers which have this function
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
})();

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
    const driverYamlPath = path.join(privateDir, "driver.yaml");
    let driverYamlTrusted = false;
    if(fs.existsSync(driverYamlPath)) {
        driverYamlTrusted = yaml.load(fs.readFileSync(driverYamlPath)).trusted ?? false;
    }

    return (packageTrusted && DRIVER_PATH.includes("device-catalog-private")) || driverYamlTrusted;
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

        if(driverYaml.useContext) {
            if(input.useContext) {
                global.context = input.context ?? [];
            }
        }

        return fn[operation](input);
    }

    const isolate = new ivm.Isolate();
    const script = isolate.compileScriptSync(isoBuffer.concat("\n" + code).concat("\n" + fnCall));

    const context = await isolate.createContext();
    await context.global.set("operation", operation);
    await context.global.set("input", new ivm.ExternalCopy(input).copyInto());
    await context.global.set("exports", new ivm.ExternalCopy({}).copyInto());
    if(driverYaml.useContext) {
        if(input.useContext) {
            await context.global.set("context", new ivm.ExternalCopy(input.context ?? []).copyInto());
        }
    }

    await script.run(context, { timeout: 1000 });
    const getDriverEngineResult = await context.global.get("getDriverEngineResult");
    const result = getDriverEngineResult();
    context.release();
    return result;
}


/**
 Test suites compatible with all driver types
 */
describe("Decode uplink", () => {
    examples.forEach((example) => {
        if (example.type === "uplink") {
            it(example.description, async () => {
                // Given
                const input = example.input;

                // Adaptation
                input.bytes = adaptBytesArray(input.bytes);

                // Modifying input
                input.useContext = example.useContext;

                // When
                const result = await run(input, "decodeUplink");

                // Then
                const expected = example.output;

                // Adaptations
                skipTypes(result, expected);
                dateIsLocal(example.description, input.time ?? input.recvTime);

                expect(result).toStrictEqual(expected);
            });
        }
    });
});

describe("Decode downlink", () => {
    examples.forEach((example) => {
        if (example.type === "downlink-decode") {
            it(example.description, async () => {
                // Given
                const input = example.input;

                // Adaptation
                input.bytes = adaptBytesArray(input.bytes);

                // When
                const result = await run(input, "decodeDownlink");

                // Then
                const expected = example.output;

                // Adaptations
                dateIsLocal(example.description, input.time ?? input.recvTime);

                // Then
                expect(result).toStrictEqual(expected);
            });
        }
    });
});

describe("Encode downlink", () => {
    examples.forEach((example) => {
        if (example.type === "downlink-encode") {
            it(example.description, async () => {
                // Given
                const input = example.input;

                // When
                const result = await run(input, "encodeDownlink");

                // Then
                const expected = example.output;

                // Adaptation
                if(result.bytes){
                    result.bytes = adaptBytesArray(result.bytes);
                }
                if(expected.bytes){
                    expected.bytes = adaptBytesArray(expected.bytes);
                }
                dateIsLocal(example.description, input.time ?? input.recvTime);

                expect(result).toStrictEqual(expected);
            });
        }
    });
});

describe("Legacy Decode uplink errors", () => {
    errors.forEach((error) => {
        if (error.type === "uplink" && !error.data) {
            it(error.description, () => {
                // Given
                const input = {
                    bytes: adaptBytesArray(error.bytes),
                    fPort: error.fPort,
                    time: error.time
                };

                // When / Then
                const expected = error.error;
                expect(async () => await run(input, "decodeUplink").toThrow(expected));
            });
        }
    });
});

describe("Legacy Decode downlink errors", () => {
    errors.forEach((error) => {
        if (error.type === "uplink" && !error.data) {
            it(error.description, () => {
                // Given
                const input = {
                    bytes: adaptBytesArray(error.bytes),
                    fPort: error.fPort,
                    time: error.time
                };

                // When / Then
                const expected = error.error;
                expect(async () => await run(input, "decodeDownlink").toThrow(expected));
            });
        }
    });
});

if(extractPoints) {
    describe("extractPoints - should extract expected points from decoded uplink", () => {
        examples.forEach((example, index) => {
            if(example.type === "uplink" && example.output?.data && example.points) {
                test(`${index + 1} - ${example.description}`, () => {
                    const decoded = example.output.data;
                    const result = extractPoints(
                        { 
                            message: decoded,
                            time: example.input?.time,
                            thing: example.input?.thing
                        }
                    );

                    const currentPoints = example.points;
                    checkEventTimes(example.description, currentPoints);
                    
                    expect(result).toEqual(currentPoints);
                });
            }
            else if(example.type === "uplink" && example.output && example.points) {
                test(`${index + 1} - ${example.description}`, () => {
                    const decoded = example.output;
                    const result = extractPoints(
                        { 
                            message: decoded,
                            time: example.input?.time,
                            thing: example.input?.thing
                        }
                    );

                    const currentPoints = example.points;
                    
                    // Checking if all eventTimes are of the right format
                    checkEventTimes(example.description, currentPoints);

                    expect(result).toEqual(currentPoints);
                });
            }
        });
    });
}

describe("Legacy Encode downlink errors", () => {
    errors.forEach((error) => {
        if (error.type === "uplink" && error.data) {
            it(error.description, () => {
                // Given
                const input = error.data;

                // When / Then
                const expected = error.error;
                expect(async () => await run(input, "encodeDownlink").toThrow(expected));
            });
        }
    });
});

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
        for(let key of keys) {
            value = value[key];
            expectedValue = expectedValue[key];
            if(expectedValue == null) {
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

function checkEventTimes(description, points) {
    for(let value of Object.values(points)) {
        if(value.records === undefined) {
            continue;
        }
        for(let record of value.records) {
            if(record.eventTime !== undefined) {
                dateIsLocal(description, record.eventTime, true);
            }
        }
    }
}