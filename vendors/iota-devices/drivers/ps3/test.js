const assert = require('assert');
const codec = require('./index.js');
const examples = require('./examples.json');
for (const ex of examples) {
  const actual = ex.type === 'uplink' ? codec.decodeUplink(ex.input) : codec.encodeDownlink(ex.input);
  if (!('errors' in actual)) actual.errors = [];
  if (!('warnings' in actual)) actual.warnings = [];
  assert.deepStrictEqual(actual, ex.output, ex.description);
}
console.log('PASS: ' + examples.length + ' Actility-style examples');
