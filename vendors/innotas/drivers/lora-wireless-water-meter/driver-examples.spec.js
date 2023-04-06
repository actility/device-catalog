const driver = require("./index.js");
const examples = require("./examples.json");

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
                const result = driver.Decode(input.fPort, input.bytes, null);

                // Then
                const expected = example.output;
                expect(result).toStrictEqual(expected);
            });
        }
    });
});
