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

