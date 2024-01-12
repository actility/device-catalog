const driver = require("./index.js");
const examples = require("./examples.json");

/*..............
Test suites
..............*/
// Convert hex string to bytes array
function hexToBytes(hex) {
    if(Array.isArray(hex)){
        return hex;
    }
    let bytes = [];
    for (c = 0; c < hex.length; c += 2) bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}
describe("Decode uplink", () => {
    examples.forEach((example) => {
        if (example.type === "uplink") {
            it(example.description, () => {
                // Given
                const input = {
                    bytes: hexToBytes(example.input.bytes),
                    fPort: example.input.fPort,
                };

                if (example.input.recvTime !== undefined) {
                    input.recvTime = example.input.recvTime;
                }

                // When
                const result = driver.decodeUplink(input);

                // Then
                const expected = example.output;
                expect(result).toEqual(expected);
            });
        }
    });
});

describe("Decode downlink", () => {
    examples.forEach((example) => {
        if (example.type === "downlink-decode") {
            it(example.description, () => {
                // Given
                const input = {
                    bytes: hexToBytes(example.input.bytes),
                    fPort: example.input.fPort,
                };

                if (example.input.recvTime !== undefined) {
                    input.recvTime = example.input.recvTime;
                }

                // When
                const result = driver.decodeDownlink(input);

                // Then
                const expected = example.output;
                expect(result).toEqual(expected);
            });
        }
    });
});

describe("Encode downlink", () => {
    examples.forEach((example) => {
        if (example.type === "downlink-encode") {
            it(example.description, () => {
                // When
                const result = driver.encodeDownlink(example.input);

                // Then
                const expected = example.output;
                if(expected.bytes){
                    expected.bytes = hexToBytes(expected.bytes);
                }
                expect(result).toEqual(expected);
            });
        }
    });
});

describe("Backward compatibility - Encode downlink", () => {
    examples.forEach((example) => {
        if (example.type === "downlink-encode") {
            it(example.description, () => {
                // When
                const result = driver.encodeDownlink(example.input.data);

                // Then
                const expected = example.output;
                if(expected.bytes){
                    expected.bytes = hexToBytes(expected.bytes);
                }
                expect(result).toEqual(expected);
            });
        }
    });
});
