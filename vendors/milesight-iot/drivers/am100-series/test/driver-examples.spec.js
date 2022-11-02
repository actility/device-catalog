var driver = require("../index");
const fs = require("fs");
const vm2 = require("vm2");
const yaml = require("js-yaml");

const driverYaml = yaml.load(fs.readFileSync("../driver.yaml"));

// Get the list of files in the directory "examples"
let examplesFiles = fs.readdirSync("examples", function (err, files) {
    if (err) {
        throw err.message;
    }
    return files;
});

// Storing all the examples files in an array
let examples = [];
for (const exampleFile of examplesFiles) {
    if (exampleFile.endsWith(".examples.json")) {
        let example = fs.readFileSync("examples/" + exampleFile, "utf8", (err, content) => {
            if (err) {
                throw err.message;
            }
            return content;
        });
        const parsedExample = JSON.parse(example);
        examples = examples.concat(parsedExample);
    }
}

// Convert hex string to bytes array
function hexToBytes(hex) {
    let bytes = [];
    for (c = 0; c < hex.length; c += 2) bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}

//  get code of driver
let code = fs.readFileSync(__dirname + "/../index.js", "utf8");

/*..............
Test suites
..............*/

describe("Decode uplink", () => {
    examples.forEach((example) => {
        if (example.type === "uplink") {
            it(example.description, () => {

                // Given
                const input = {
                    bytes: hexToBytes(example.bytes),
                    fPort: example.fPort,
                };

                let result;
                let received;
                if(driverYaml.signature === "actility"){
                    // When
                    // result = driver.decodeUplink(input);
                    const check = "\n;let input = {bytes:[" + input.bytes + "],fPort:" + input.fPort + "};\ndecodeUplink(input);";
                    try {
                        result = new vm2.VM().run(new vm2.VMScript(code).wrap("", check).compile());
                    } catch (error) {
                        throw new Error("Unable to export decodeUplink function, driver code does not compile: " + error);
                    }
                    received = replaceNull(result.data);
                }
                else if(driverYaml.signature === "ttn"){
                    // When
                    // result = driver.Decoder(input.bytes, input.fPort);
                    const check = "\n;Decoder([" + input.bytes + "]," + input.fPort + ");";
                    try {
                        result = new vm2.VM().run(new vm2.VMScript(code).wrap("", check).compile());
                    } catch (error) {
                        throw new Error("Unable to export Decoder function, driver code does not compile: " + error);
                    }
                    received = replaceNull(result);
                }

                // Then
                const expected = replaceNull(example.data);
                expect(received).toStrictEqual(expected);
            });
        }
    });
});

describe("Decode downlink", () => {
    examples.forEach((example) => {
        if (example.type === "downlink") {
            it(example.description, () => {
                // Given
                const input = {
                    bytes: hexToBytes(example.bytes),
                    fPort: example.fPort,
                };

                let result;
                let received;
                if(driverYaml.signature === "actility"){
                    // When
                    // result = driver.decodeDownlink(input);
                    const check = "\n;let input = {bytes:[" + input.bytes + "],fPort:" + input.fPort + "};\ndecodeDownlink(input);";
                    try {
                        result = new vm2.VM().run(new vm2.VMScript(code).wrap("", check).compile());
                    } catch (error) {
                        throw new Error("Unable to export decodeDownlink function, driver code does not compile: " + error);
                    }
                    received = replaceNull(result.data);
                } else if(driverYaml.signature === "ttn"){
                    // When
                    // result = driver.Decoder(input.bytes, input.fPort);
                    const check = "\n;Decoder([" + input.bytes + "]," + input.fPort + ");";
                    try {
                        result = new vm2.VM().run(new vm2.VMScript(code).wrap("", check).compile());
                    } catch (error) {
                        throw new Error("Unable to export Decoder function, driver code does not compile: " + error);
                    }
                    received = replaceNull(result);
                }

                // Then
                if(received !== undefined){
                    const expected = replaceNull(example.data.data);
                    expect(received).toStrictEqual(expected);
                }
            });
        }
    });
});

describe("Encode downlink", () => {
    examples.forEach((example) => {
        if (example.type === "downlink") {
            it(example.description, () => {

                let result;
                if(driverYaml.signature === "actility"){
                    // When
                    let input = {
                        data: replaceNull(example.data)
                    }
                    // result = driver.encodeDownlink(input);
                    const check = "\n;let input = " + JSON.stringify(replaceNull(example.data)) + ";\nencodeDownlink(input);";
                    try {
                        result = new vm2.VM().run(new vm2.VMScript(code).wrap("", check).compile());
                    } catch (error) {
                        throw new Error("Unable to export encodeDownlink function, driver code does not compile: " + error);
                    }
                } else if(driverYaml.signature === "ttn"){
                    // When
                    // result = driver.Encoder(example.data, null);
                    const check = "\n;Encoder(" + JSON.stringify(replaceNull(example.data)) + ", null);";
                    try {
                        result = new vm2.VM().run(new vm2.VMScript(code).wrap("", check).compile());
                    } catch (error) {
                        throw new Error("Unable to export Encoder function, driver code does not compile: " + error);
                    }
                }
                const received = result;

                const expected = {
                    bytes: hexToBytes(example.bytes),
                    fPort: example.fPort
                }
                if(received.errors != null || received.warnings != null){
                    expected.errors = received.errors;
                    expected.warnings = received.warnings;
                }
                expect(received).toStrictEqual(expected);
            });
        }
    });
});

function replaceNull(data){
    for (let i in data) {
        if(data[i] !== null && typeof data[i] === "object"){
            replaceNull(data[i]);
        } else if(data[i] === null){
            data[i] = undefined;
        }
    }
    return data;
}
