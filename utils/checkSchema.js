const fs = require("fs");
const path = require("path");
const Ajv = require("ajv");
const ajv = new Ajv({ 
    allErrors: true
});

const examplesPath = path.join(__dirname, "examples.json");
const uplinkSchemaPath = path.join(__dirname, "uplink.schema.json");
const downlinkSchemaPath = path.join(__dirname, "downlink.schema.json");

const uplinkExamples = JSON.parse(fs.readFileSync(examplesPath, 'utf-8')).filter(ex => ex.type === "uplink");
const downlinkExamples = JSON.parse(fs.readFileSync(examplesPath, 'utf-8')).filter(ex => ex.type === "downlink-encode");

const uplinkSchema = JSON.parse(fs.readFileSync(uplinkSchemaPath, 'utf-8'));
const downlinkSchema = JSON.parse(fs.readFileSync(downlinkSchemaPath, 'utf-8'));

function checkData(examples, schema) {
    const validate = ajv.compile(schema);
    for(let example of examples) {
        let data = example.data ?? example.output?.data ?? example.input?.data;
        let exampleDescription = null;
        if(typeof data !== 'undefined') {
            if (!validate(data)) {
                let exampleErrors = [];
                for(let error of validate.errors) {
                    if(exampleDescription === null) {
                        exampleDescription = example.description;
                        errors.push("\n" + exampleDescription);
                    }
                    exampleErrors.push("- " + (error.instancePath.length > 0 ? error.instancePath : "The schema") + " " + error.message + " [" + error.schemaPath + "].");
                }
                if(exampleErrors.length > 0) {
                    errors.push(...new Set(exampleErrors));
                }
            }
        }
    }
}

let errors = [];

function main() {
    errors = ["\n------------------------------------------------------\nUplink Schema Check\n------------------------------------------------------"];
    checkData(uplinkExamples, uplinkSchema);
    
    errors.push("\n------------------------------------------------------\nDownlink Schema Check\n------------------------------------------------------");
    checkData(downlinkExamples, downlinkSchema);

    if(errors.length > 2) {
        throw new Error('\n' + errors.join('\n'));
    }
    else {
        console.log("SUCCESS.");
    }
}

main();