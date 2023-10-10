const fs = require("fs");
const driver = require("../index.js");


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

//  get code of driver
let code = fs.readFileSync(__dirname + "/../index.js", "utf8");

/*..............
Test suites
..............*/

describe("Decoder", () => {
    examples.forEach((example) => {
        if (example.type === "uplink") {
            it(example.description, () => {

                // When
                let result = driver.Decoder(hexToBytes(example.bytes), example.fPort);
                let received = replaceNull(result);

                // Then
                const expected = replaceNull(example.data);
                expect(received).toStrictEqual(expected);
            });
        }
    });
});

function replaceNull(data){
    for (let i in data) {
        if(data[i] !== null && typeof data[i] === "object"){
            replaceNull(data[i]);
        } else if(data[i] === null){
            data[i] = undefined;
        }
    }
    return data;
}
