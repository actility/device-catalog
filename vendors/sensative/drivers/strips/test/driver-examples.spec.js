var driver = require("../index");
const fs = require("fs");
const packageJson = require("../package.json");

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

                if (example.time !== undefined) {
                    input.time = example.time;
                }

                // When
                const result = driver.decodeUplink(input);

                // Then
                const expected = example.data;
                expect(result).toStrictEqual(expected);
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

                // When
                const result = driver.decodeDownlink(input);

                // Then
                const expected = example.data;
                expect(result).toStrictEqual(expected);
            });
        }
    });
});

describe("Encode downlink", () => {
    examples.forEach((example) => {
        if (example.type === "downlink") {
            it(example.description, () => {
                // When
                const result = driver.encodeDownlink(example.data);

                // Then
                const expected = {
                    bytes: hexToBytes(example.bytes),
                    fPort: example.fPort,
                };
                expect(result).toStrictEqual(expected);
            });
        }
    });
});

describe("Extract points", () => {
    examples.forEach((example) => {
        if (example.type === "uplink" && example.points !== undefined) {
            it(example.description, () => {
                // Given
                const input = {
                    message: example.data,
                    time: example.time,
                };

                // When
                const result = driver.extractPoints(input);
                const missingPointsPackage = [];
                const missingPointsExample = [];
                // Then
                Object.keys(result).forEach((point) => {
                    if(packageJson.driver.points[point] != null){
                        if(example.points[point] != null){
                            const expectedPoint = packageJson.driver.points[point];
                            if(Array.isArray(result[point]) && typeof result[point][0] == "object"){
                                delete expectedPoint.record;
                                expectedPoint.records = result[point];
                            } else {
                                delete expectedPoint.records;
                                expectedPoint.record = result[point];
                            }

                            expect(expectedPoint).toStrictEqual(example.points[point]);
                        } else {
                            missingPointsExample.push(point);
                        }

                    } else {
                        missingPointsPackage.push(point)
                    }
                });

                if(missingPointsExample.length !== 0){
                    throw new Error("The following points: [" + missingPointsExample + "] are missing in your example '" + example.description +"'");
                }
                if(missingPointsPackage.length !== 0){
                    throw new Error("The following points: [" + missingPointsPackage + "] are not defined in the package.json");
                }
            });
        }
    });
});
