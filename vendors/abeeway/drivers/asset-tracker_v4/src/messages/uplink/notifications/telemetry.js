let util = require("../../../util");
function Telemetry(telemetryMeasurements){
    this.telemetryMeasurements = telemetryMeasurements;
}
const TelemetryType = Object.freeze({
    TELEMETRY: "TELEMETRY",
    TELEMETRY_MODE_BATCH: "TELEMETRY_MODE_BATCH"
})


const IDOntology  = Object.freeze({
    RESISTANCE: "RESISTANCE",
    TEMPERATURE: "TEMPERATURE"
})


function telemetryMeasurements(ontology ,
    value
){
    this.ontology = ontology;
    this.value = value;
}
function determineTelemetryMeasurements(data) {
    let index = 0;
    const ontologies = [];
    const dataLength = data.length;
    while (index < dataLength) {
        if (index >= dataLength) {
            throw new Error("Unexpected end of data.");
        }
        let idOntology = determineOntology(data[index] & 0x7F);
        let valueSize = (data[index] >> 7) & 0x01;
        let value;

        if (valueSize === 1) {
            if (index + 4 >= dataLength) {
                throw new Error("Not enough data for a 4-byte value.");
            }
            value = util.twoComplement((data[index + 1] << 24) + (data[index + 2] << 16) + (data[index + 3] << 8) + data[index + 4]);
            index += 5; // Move to the next data element
        } else {
            if (index + 2 >= dataLength) {
                throw new Error("Not enough data for a 2-byte value.");
            }
            value = util.convertNegativeInt((data[index + 1] << 8) + data[index + 2],2);
            index += 3; // Move to the next data element
        }

        ontologies.push(new telemetryMeasurements(idOntology, value));
    }

    return ontologies;
}

function determineOntology(value)
{
    switch (value){
        case 1: 
            return IDOntology.RESISTANCE
        case 2:
            return IDOntology.TEMPERATURE
        default:
            throw new Error("ID Ontology Unknown");
    }
}


module.exports = {
    Telemetry: Telemetry,
    TelemetryType: TelemetryType,
    determineTelemetryMeasurements: determineTelemetryMeasurements
}
