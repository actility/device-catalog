var driver = require("../index");
const fs = require("fs");
const packageJson = require("../package.json");
const vm2 = require("vm2");

// Get the list of files in the directory "errors"
let errorsFiles = fs.readdirSync("errors", function (err, files) {
    if (err) {
        throw err.message;
    }
    return files;
});

// Storing all the errors files in an array
let errors = [];
for (const errorFile of errorsFiles) {
    if (errorFile.endsWith(".errors.json")) {
        let error = fs.readFileSync("errors/" + errorFile, "utf8", (err, content) => {
            if (err) {
                throw err.message;
            }
            return content;
        });
        const parsedError = JSON.parse(error);
        errors = errors.concat(parsedError);
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

describe("Decode uplink errors", () => {
    errors.forEach((error) => {
        if (error.type === "uplink" && error.data === undefined) {
            it(error.description, () => {
                // Given
                const input = {
                    bytes: hexToBytes(error.bytes),
                    fPort: error.fPort,
                };

                let result;
                if(packageJson.driver.type === "thingpark-x-js"){
                    // When
                    // result = driver.decodeUplink(input);
                    const check = "\n;let input = {bytes:[" + input.bytes + "],fPort:" + input.fPort + "};\ndecodeUplink(input);";
                    try {
                        result = new vm2.VM().run(new vm2.VMScript(code).wrap("", check).compile());
                    } catch (error) {
                        throw new Error("Unable to export decodeUplink function, driver code does not compile: " + error);
                    }
                } else if(packageJson.driver.type === "ttn"){
                    // When
                    // result = driver.Decoder(input.bytes, input.fPort);
                    const check = "\n;Decoder([" + input.bytes + "]," + input.fPort + ");";
                    try {
                        result = new vm2.VM().run(new vm2.VMScript(code).wrap("", check).compile());
                    } catch (error) {
                        throw new Error("Unable to export Decoder function, driver code does not compile: " + error);
                    }
                }

                // Then
                const expected = error.error;
                if(result.errors && Array.isArray(result.errors)){
                    const received = result.errors[0];
                    expect(received).toStrictEqual(expected);
                }
            });
        }
    });
});

describe("Decode downlink errors", () => {
    errors.forEach((error) => {
        if (error.type === "downlink" && error.data === undefined) {
            it(error.description, () => {
                // Given
                const input = {
                    bytes: hexToBytes(error.bytes),
                    fPort: error.fPort,
                };

                let result;
                if(packageJson.driver.type === "thingpark-x-js"){
                    // When
                    // result = driver.decodeDownlink(input);
                    const check = "\n;let input = {bytes:[" + input.bytes + "],fPort:" + input.fPort + "};\ndecodeDownlink(input);";
                    try {
                        result = new vm2.VM().run(new vm2.VMScript(code).wrap("", check).compile());
                    } catch (error) {
                        throw new Error("Unable to export decodeDownlink function, driver code does not compile: " + error);
                    }
                } else if(packageJson.driver.type === "ttn"){
                    // When
                    // result = driver.Decoder(input.bytes, input.fPort);
                    const check = "\n;Decoder([" + input.bytes + "]," + input.fPort + ");";
                    try {
                        result = new vm2.VM().run(new vm2.VMScript(code).wrap("", check).compile());
                    } catch (error) {
                        throw new Error("Unable to export Decoder function, driver code does not compile: " + error);
                    }
                }

                // Then
                const expected = error.error;
                if(result.errors && Array.isArray(result.errors)){
                    const received = result.errors[0];
                    expect(received).toStrictEqual(expected);
                }
            });
        }
    });
});

describe("Encode downlink errors", () => {
    errors.forEach((error) => {
        if (error.type === "downlink" && error.data !== undefined) {
            it(error.description, () => {
                let result;
                if(packageJson.driver.type === "thingpark-x-js"){
                    // When
                    let input = {
                        data: error.data
                    }
                    // result = driver.encodeDownlink(input);
                    const check = "\n;let input = {data:" + JSON.stringify(error.data) + "};\nencodeDownlink(input);";
                    try {
                        result = new vm2.VM().run(new vm2.VMScript(code).wrap("", check).compile());
                    } catch (error) {
                        throw new Error("Unable to export encodeDownlink function, driver code does not compile: " + error);
                    }
                } else if(packageJson.driver.type === "ttn"){
                    // When
                    // result = driver.Encoder(error.data, null);
                    const check = "\n;Encoder(" + JSON.stringify(error.data) + ", null);";
                    try {
                        result = new vm2.VM().run(new vm2.VMScript(code).wrap("", check).compile());
                    } catch (error) {
                        throw new Error("Unable to export Encoder function, driver code does not compile: " + error);
                    }
                }

                // Then
                const expected = error.error;
                if(result.errors && Array.isArray(result.errors)){
                    const received = result.errors[0];
                    expect(received).toStrictEqual(expected);
                }
            });
        }
    });
});
