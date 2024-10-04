let util = require("../../../util");

const TelemetryType = Object.freeze({
    TELEMETRY: "TELEMETRY",
    TELEMETRY_MODE_BATCH: "TELEMETRY_MODE_BATCH"
})
// for more details to telemetry refer to https://github.com/actility/device-catalog/blob/main/template/sample-vendor/drivers/ONTOLOGY.md
const OntologyConstants = Object.freeze({
    RESISTANCE: {
        id: 1,
        ontology: "resistance",
        type: "int16",
        unit: "Ohm"
    },
    TEMPERATURE: {
        id: 2,
        ontology: "temperature",
        type: "float",
        unit: "Cel"
    },
    HUMIDITY: {
        id: 3,
        ontology: "humidity",
        type: "int16",
        unit: "%RH", 
        factor: 10
    }
});

// Construct counters based on OntologyConstants
const counters = Object.keys(OntologyConstants).reduce((acc, key) => {
    const ontology = OntologyConstants[key];
    acc[ontology.ontology] = 0;
    return acc;
}, {});

function floatFromBytes(bytes) {
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    for (let i = 0; i < 4; i++) {
        view.setUint8(i, bytes[i]);
    }
    return view.getFloat32(0, false); // true for little-endian
}
function formatFloat(float, decimals = 2) {
    return Number(float.toFixed(decimals));
}

function determineTelemetryMeasurements(data) {
    let index = 0;
    const ontologies = {};
    const dataLength = data.length;
    while (index < dataLength) {
        if (index >= dataLength) {
            throw new Error("Unexpected end of data.");
        }
        let ontology = determineOntology(data[index] & 0x7F);
        let valueSize = (data[index] >> 7) & 0x01;
        let value;
        if (ontology.type === 'float') {
            if (valueSize === 1) {
                if (index + 4 >= dataLength) {
                    throw new Error("Not enough data for a 4-byte float.");
                }
                value = floatFromBytes(data.slice(index + 1, index + 5));
                value = formatFloat(value);
                index += 5; // Move to the next data element
            } else {
                throw new Error("Unexpected value size for float.");
            }
            
        } else {
            if (valueSize === 1) {
                throw new Error("Unexpected value size for int.");
            }
            if (index + 2 >= dataLength) {
                throw new Error("Not enough data for a 2-byte value.");
            }
            value = util.convertNegativeInt((data[index + 1] << 8) + data[index + 2],2);
            index += 3; // Move to the next data element
        }

        const ontologyName = ontology.ontology;
        const unit = ontology.unit;
        const counter = counters[ontologyName];
        const key = `${ontologyName}:${counter}`;

        // Add the telemetry measurement to the result
        ontologies[key] = { unitId: unit, record: value };

        // Update the counter
        counters[ontologyName]++;
    }
    Object.keys(ontologies).forEach(key => {
        const baseKey = key.split(':')[0];
        if (counters[baseKey] === 1) {
            const value = ontologies[key];
            delete ontologies[key];
            ontologies[baseKey] = value;
        }
    });
    return ontologies;
}

function determineOntology(value) {
    const ontology = Object.values(OntologyConstants).find(o => o.id === value);
    if (ontology) {
        return ontology;
    } else {
        throw new Error("Ontology Unknown");
    }
}


module.exports = {
    TelemetryType: TelemetryType,
    determineTelemetryMeasurements: determineTelemetryMeasurements
}
