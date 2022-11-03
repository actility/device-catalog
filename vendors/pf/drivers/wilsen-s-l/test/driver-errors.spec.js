var driver = require("../index");
const fs = require("fs");

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

                if (error.time !== undefined) {
                    input.time = error.time;
                }

                // When / Then
                expect(() => driver.decodeUplink(input)).toThrow(error.error);
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

                // When / Then
                expect(() => driver.decodeDownlink(input)).toThrow(error.error);
            });
        }
    });
});

describe("Encode downlink errors", () => {
    errors.forEach((error) => {
        if (error.type === "downlink" && error.data !== undefined) {
            it(error.description, () => {
                // When / Then
                expect(() => driver.encodeDownlink(error.data)).toThrow(error.error);
            });
        }
    });
});

describe("Extract points errors", () => {
    errors.forEach((error) => {
        if (error.type === "uplink" && error.data !== undefined) {
            it(error.description, () => {
                // Given
                const input = {
                    message: error.data,
                    time: error.time,
                };

                // When / Then
                expect(() => driver.extractPoints(input)).toThrow(error.error);
            });
        }
    });
});
