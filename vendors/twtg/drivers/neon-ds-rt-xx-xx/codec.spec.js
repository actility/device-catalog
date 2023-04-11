const driver = require('./index');
const fs = require('fs');

// Storing all the examples in an array
const examples = JSON.parse(
  fs.readFileSync(__dirname + '/examples.json', 'utf8', (err, content) => {
    if (err) {
      throw new Error(err.message);
    }
  })
);

/*..............
Test suites
..............*/

describe('Decode uplink', () => {
  examples.forEach((example) => {
    if (example.type === 'uplink') {
      it(example.description, () => {
        // Given
        const input = {
          bytes: Buffer.from(example.input.bytes, 'hex'),
          fPort: example.input.fPort
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

describe('Encode downlink', () => {
  examples.forEach((example) => {
    if (example.type === 'downlink-encode') {
      it(example.description, () => {
        // When
        const result = driver.encodeDownlink(example.input);
        if (typeof result.bytes !== 'undefined') {
          result.bytes = Buffer.from(result.bytes).toString('hex');
        }

        // Then
        const expected = example.output;
        expect(result).toStrictEqual(expected);
      });
    }
  });
});
