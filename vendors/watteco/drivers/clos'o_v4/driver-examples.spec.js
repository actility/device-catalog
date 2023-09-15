let examples = require("./examples.json");
let driver = require("./clos'o.js");
/*..............
Test suites
..............*/
describe("Decode uplink", () => {
    examples.forEach((example) => {
        if (example.type === "uplink") {
            it(example.description, () => {
                // Given
                const input = {
                    bytes: Buffer.from(example.input.bytes, "hex"),
                    fPort: example.input.fPort,
                };

                if (example.input.recvTime !== undefined) {
                    input.recvTime = example.input.recvTime;
                }

                // When
                const result = driver.decodeUplink(input);

                // Then
                const expected = example.output;
                expect(result).toStrictEqual(expected);
            });
        }
    });
});

/*
describe("Decode downlink", () => {
    examples.forEach((example) => {
        if (example.type === "downlink-decode") {
            it(example.description, () => {
                // Given
                const input = {
                    bytes: example.input.bytes,
                    fPort: example.input.fPort,
                };

                if (example.input.recvTime !== undefined) {
                    input.recvTime = example.input.recvTime;
                }

                // When
                const result = driver.decodeDownlink(input);

                // Then
                const expected = example.output;
                expect(result).toStrictEqual(expected);
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
                expect(result).toStrictEqual(expected);
            });
        }
    });
});*/
