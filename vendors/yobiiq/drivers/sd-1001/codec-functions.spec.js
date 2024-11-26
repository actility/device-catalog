const path = require("path");
const fs = require("fs-extra");

const codec = require('./index');


/**
 * Read the examples according to the signature of driver, wrap them if needed
 */
const examples = (() =>{
    // for default (lora-alliance) signature,
    // all examples are stored in one file on the root `examples.json`
    if(fs.pathExistsSync(path.join(__dirname, "examples.json"))){
        return fs.readJsonSync(path.join(__dirname, "examples.json"));
    }

    // for the rest of signature,
    // examples are stored in a separate folder, in one or several json files that ends with `.examples.json`
    // Get the list of files in the directory `examples`
    // The examples are stored in a legacy format
    // They should be wrapped

    if(!fs.pathExistsSync(path.join(__dirname, "examples"))){
        return [];
    }
    let examplesFiles = fs.readdirSync("examples");

    // Wrap and store all the examples in an array
    let examples = [];
    for (const exampleFile of examplesFiles) {
        if (exampleFile.endsWith(".examples.json")) {
            let neWExamples = fs.readJsonSync(path.join(__dirname, "examples", exampleFile));
            for(const example of neWExamples){
                if(example.type === "uplink"){
                    let wrappedExample = {
                        type: example.type,
                        description: example.description,
                        input: {
                            bytes: example.bytes,
                            fPort: example.fPort,
                            time: example.time,
                            thing: example.thing
                        },
                        output: example.data
                    }
                    examples.push(wrappedExample);
                } else if(example.type === "downlink"){
                    // map to downlink-decode examples only on drivers which have this function
                    if(isDownlinkDecodeDefined){
                        let wrappedDecodeDownlink = {
                            type: "downlink-decode",
                            description: example.description,
                            input: {
                                bytes: example.bytes,
                                fPort: example.fPort,
                                time: example.time,
                                thing: example.thing
                            },
                            output: example.data
                        }
                        examples.push(wrappedDecodeDownlink);
                    }

                    let wrappedEncodeDownlink = {
                        type: "downlink-encode",
                        description: example.description,
                        input: {
                            data: example.data,
                            fPort: example.fPort
                        },
                        output: {
                            bytes: example.bytes,
                            fPort: example.fPort,
                        }
                    }
                    examples.push(wrappedEncodeDownlink);
                }
            }
        }
    }
    return examples;
})();



let versionKeys = [];
Object.values(codec.VERSION_CONTROL).forEach(element => {
    versionKeys.push(element.NAME);
});


describe("Codec functions", () => {
    examples.forEach((example) => {
        if (typeof example.helper === "object") {
            it(example.description, async () => {
                // Given
                let input = [];
                let expected = {};
                if(example.type == "uplink")
                {
                    input = example.input;
                    // ChirpStack v3
                    let decoded = codec.Decode(input.fPort, input.bytes, {});
                    expect(decoded).toStrictEqual(example.output.data);
                    input = input.bytes;
                    versionKeys.forEach(key => {
                        delete example.output.data[key];
                    });
                    expected = example.output.data;
                }
                if(example.type == "downlink-encode")
                {
                    input = example.input.data;
                    // ChirpStack v3
                    let encoded = codec.Encode(null, input, {});
                    expect(encoded).toStrictEqual(example.output.bytes);

                    input = input[input.Type];
                    expected = example.output.bytes;
                }

                // When
                const result = runFunction(example.helper.function, input);

                // Then
                expect(result).toStrictEqual(expected);
            });
        }
    });
});


function runFunction(name, input)
{
    switch (name) {
        case 'decodeBasicInformation':
            return codec.decodeBasicInformation(input)
        case 'decodeDeviceData':
            return codec.decodeDeviceData(input)
        case 'encodeDeviceConfiguration':
            return codec.encodeDeviceConfiguration(input)


        default:
            break;
    }
    throw new Error(`Unsupported function ${name} on this driver`);
}