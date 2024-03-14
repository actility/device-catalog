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
                const result = driver.decodeUplink(input);

                // Then
                const expected = example.output;

                // Adaptations
                checkDates(result, expected);

                expect(result).toStrictEqual(expected);
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

                // Adaptations
                checkDates(result, expected);

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
});


// UTIL
function checkDates(result, expected) {
    for(let property of listProperties(result)) {
        let keys = property.split('.');
        let value = result;
        for(let key of keys) {
            value = value[key];
        }

        let keysStr = keys.join("\"][\"");

        let isDate = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/.test(value);
        isDate |= value instanceof Date;
        
        if(isDate) {
            eval(`
                if(value instanceof Date) result["${keysStr}"] = value.toISOString();
                if(expected["${keysStr}"] === "XXXX-XX-XXTXX:XX:XX.XXXZ") result["${keysStr}"] = "XXXX-XX-XXTXX:XX:XX.XXXZ";
            `)
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