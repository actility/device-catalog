const driver = require('./index');
const fs = require('fs');
const glob = require('glob');

examplesFiles = glob.sync(__dirname + '/examples/**/*.json');

// Storing all the examples files in an array
let examples = [];
for (const exampleFile of examplesFiles) {
  let example = fs.readFileSync(exampleFile, 'utf8', (err, content) => {
    if (err) {
      throw err.message;
    }
    return content;
  });
  const parsedExample = JSON.parse(example);
  examples = examples.concat(parsedExample);
}

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
