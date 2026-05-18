const fs = require('fs');
const driver = require('./index.js');
const examples = JSON.parse(fs.readFileSync('./examples.json', 'utf8'));
let failed = 0;

examples.forEach((example, idx) => {
    let result;
    if (example.type === 'uplink') {
        let bytes = [];
        for (let i = 0; i < example.input.bytes.length; i += 2) {
            bytes.push(parseInt(example.input.bytes.substr(i, 2), 16));
        }
        result = driver.decodeUplink({ bytes: bytes, fPort: example.input.fPort, recvTime: example.input.recvTime });
        try {
            require('assert').deepStrictEqual(result.data, example.output.data);
            console.log(`[PASS] ${example.description}`);
        } catch (e) {
            console.error(`[FAIL] ${example.description}\nExpected:\n`, JSON.stringify(example.output.data, null, 2), `\nGot:\n`, JSON.stringify(result.data, null, 2));
            failed++;
        }
    } else if (example.type === 'downlink-encode') {
        result = driver.encodeDownlink(example.input.data);
        let resultHex = Buffer.from(result.bytes).toString('hex');
        try {
            require('assert').strictEqual(resultHex, example.output.bytes);
            console.log(`[PASS] ${example.description}`);
        } catch(e) {
            console.error(`[FAIL] ${example.description}\nExpected:\n`, example.output.bytes, `\nGot:\n`, resultHex);
            failed++;
        }
    }
});

if (failed > 0) {
    console.error(`\nFAILED ${failed} tests!`);
    process.exit(1);
} else {
    console.log(`\nALL TESTS PASSED!`);
}
