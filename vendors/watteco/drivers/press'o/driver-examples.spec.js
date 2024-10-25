const path = require("path");
const fs = require("fs-extra");
const yaml = require("js-yaml");
const ivm = require("isolated-vm");

/**
 * Read predefined Isolated Buffer that acts exactly as the NodeJs Buffer library to prevent access to external from the isolated sandbox
 */
const isoBuffer = fs.readFileSync(path.join(__dirname, "../../../..", "iso-libraries", "iso-buffer.js"), "utf8");

/**
 * Read the driver's signature from `driver.yaml`
 */
const driverYaml = yaml.load(fs.readFileSync(path.join(__dirname, "driver.yaml"), "utf8"));
const signature = driverYaml.signature;

/**
 * Validate if decodeDownlink function is defined in the driver
 * as some drivers may have encodeDownlink but no decodeDownlink
 * and there exist examples with legacy type "downlink" that should be wrapped only to "downlink-encode"
 */
const isDownlinkDecodeDefined = (() =>{
    const packageJson = fs.readJsonSync(path.join(__dirname, "package.json"));
    const driverFns = require("./" + packageJson.main);
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
const examples = (() =>{
    // for default (lora-alliance) signature,
    // all examples are stored in one file on the root `examples.json`
    if(fs.pathExistsSync(path.join(__dirname, "examples.json"))){
        return fs.readJsonSync(path.join(__dirname, "examples.json"));
    }

    // for the rest of signature,
    // examples are stored in a separate folder, in one or several json files that ends with `.examples.json`
    // Get the list of files in the directory `examples`
    // The examples are stored in a legacy format
    // They should be wrapped

    if(!fs.pathExistsSync(path.join(__dirname, "examples"))){
        return [];
    }
    let examplesFiles = fs.readdirSync("examples");

    // Wrap and store all the examples in an array
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

    if(!fs.pathExistsSync(path.join(__dirname, "errors"))){
        return [];
    }
    let errorFiles = fs.readdirSync("errors");

    // Storing all the error files in an array
    let errors = [];
    for (const errorFile of errorFiles) {
        if (errorFile.endsWith(".errors.json")) {
            errors = examples.concat(fs.readJsonSync(path.join(__dirname, "errors", errorFile)));
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
    return fs.readFileSync(path.join(__dirname, "../../../..", "iso-libraries", fnCallRef), "utf8");
})();

/**
 * Read the driver code according to the main file specified in the npm package
 */
const code = (() => {
    const packageJson = fs.readJsonSync(path.join(__dirname, "package.json"));
    return fs.readFileSync(path.join(__dirname, packageJson.main), "utf8");
})();

/**
 * Checking whether the driver is trusted or not
 */
function isTrusted() {
    const packageJson = fs.readJsonSync(path.join(__dirname, "package.json"));
    return packageJson.trusted ?? false;
}

const trusted = isTrusted();
/**
 * Create an isolated-vm sandbox to run the code inside
 */
let isolate;
let script;

if(!trusted) {
    isolate = new ivm.Isolate();
    script = isolate.compileScriptSync(isoBuffer.concat("\n" + code).concat("\n" + fnCall));
}

/**
 * @param input : input from example to run the driver with
 * @param operation : operation to be operated on the input
 * @return result: output of the driver with the given input and operation
 */
async function run(input, operation){
    if(trusted) {
        let result;
        eval(
            code
            + ";\n"
            + `result = decodeUplink(input)`
        );
        return result;
    }
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

                // When
                const result = await run(input, "decodeUplink");

                // Then
                const expected = example.output;

                // Adaptations
                adaptDates(result, expected);

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


// UTIL
function adaptDates(result, expected) {
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

        let isDate = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/.test(value);
        isDate |= value instanceof Date;
        
        
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
    }
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