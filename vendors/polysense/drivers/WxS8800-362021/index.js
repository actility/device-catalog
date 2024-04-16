const examples = require("./examples.json");
/**
 * Decode uplink
 * @param {Object} input - An object provided by the IoT Flow framework
 * @param {number[]} input.bytes - Array of numbers as it will be sent to the device
 * @returns {Object} The decoded object
 */
function decodeUplink(input) {
    let result = {
        data: {},
        errors: [],
        warnings: []
    }

    let bytes = input.bytes.toUpperCase();
    
    // Extrait l'entête et vérifie si elle est correcte
    const entete = bytes.substring(0, 4); // "D77E" - indices 0 à 3
    if (entete !== "D77E") {
        result.errors.push("Byte sequence does not start with 'D77E', byte not recognized.");
        return result;  // Return immediatly error if entete is not correct
    }
    
    // Boucle pour traiter le reste des données par paire d'octets
    for (let i = 4; i < bytes.length; i += 2) {
        const bytepair = bytes.substring(i, i + 2);
        
        // Traitement 
        switch (bytepair) {
            case "07":
                result.data.vbat = 3.565;
                // result.data.dataTypeBattery = "Integer(V)";
                break;
            case "26":
                if (i + 2 < bytes.length && i === 10) {
                    result.data.distance = 1000;
                    // result.data.dataTypeDistance = "Millimètre(mm)";
                }
                break;
            case "08":
                if (i + 2 < bytes.length && i === 10) {
                    result.data.sound = 42.1;
                    // result.data.dataTypeNoise = "Decimal(dB)";
                }
                break;
            case "37":
                if (i + 2 < bytes.length && i === 10) {
                    result.data.dir = "Neither IR detected the number";
                    // result.data.dataTypeIR = "Generic IO Duty Report (0x56)";
                }
                break;
            default:
            
                break;
        }
    }

    return result;
}

const input = {
    bytes: "d77E070dED0801A5"
};
console.log(decodeUplink(input));

exports.decodeUplink = decodeUplink;
