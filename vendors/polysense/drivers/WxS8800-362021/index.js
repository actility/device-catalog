const examples = require("./examples.json");

/**
 * Decode uplink
 * @param {Object} input - An object provided by the IoT Flow framework
 * @param {string} input.bytes - String of hex numbers as it will be sent to the device
 * @returns {Object} The decoded object
 */
function decodeUplink(input) {
    let result = {
        data: {},
        errors: [],
        warnings: []
    }

    let bytes = input.bytes.toUpperCase();
    
    // Extracts the header and checks if it is correct
    const header = bytes.substring(0, 4); // "D77E" - indices 0 to 3
    if (header !== "D77E") {
        result.errors.push("Byte sequence does not start with 'D77E', byte not recognized.");
        return result;  // Return immediately if header is not correct
    }
    
    // Loop to process the rest of the data by pairs of bytes
    for (let i = 4; i < bytes.length; i += 2) {
        const bytePair = bytes.substring(i, i + 2);
        
        // Processing based on the byte pair
        switch (bytePair) {
            case "07":
                // Converts from Hex to Decimal and divides by 1000 if in millivolts
                result.data.vbat = parseInt(bytes.substring(i + 2, i + 6), 16); 
                break;
            case "26":
                if (i < bytes.length && i === 10) {
                    // Converts from Hex to Decimal for distance
                    result.data.distance = parseInt(bytes.substring(i + 2, i + 6), 16);
                }
                break;
            case "08":
                if (i + 2 < bytes.length && i === 10) {
                    // Multiplies by 0.1 to convert from decibels
                    result.data.sound = parseInt(bytes.substring(i + 2, i + 6), 16) * 0.1;
                }
                break;
            case "37":
                if (i + 2 < bytes.length && i === 10) {
                    result.data.dir = "Neither IR detected the number";
                }
                break;
            default:
                break;
        }
    }

    return result;
}

const input = {
    bytes: "d77E070dEF2603E8"
};
console.log(decodeUplink(input));

exports.decodeUplink = decodeUplink;