function decodeUplink(input) {
    let result = {
        data: {},
        errors: [],
        warnings: []
    };

    // Assumes 'input.bytes' is already an array of integers (byte values)
    let bytes = input.bytes; // Array of bytes, no need to call toUpperCase

    // Converts the byte array back to a hex string for easier processing
    let hexString = bytes.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    
    // Extracts the header and checks if it is correct
    const header = hexString.substring(0, 4); // "D77E" - indices 0 to 3
    if (header !== "D77E") {
        result.errors.push("Byte sequence does not start with 'D77E', byte not recognized.");
        return result;  // Return immediately if header is not correct
    }
    
    // Loop to process the rest of the data by pairs of bytes
    for (let i = 4; i < hexString.length; i += 2) {
        const bytePair = hexString.substring(i, i + 2);
        
        // Processing based on the byte pair
        switch (bytePair) {
            case "07":
                // Converts from Hex to Decimal and divides by 1000 if in millivolts
                result.data.vbat = parseInt(hexString.substring(i + 2, i + 6), 16); 
                break;
            case "26":
                if (i < hexString.length && i === 10) {
                    // Converts from Hex to Decimal for distance
                    result.data.distance = parseInt(hexString.substring(i + 2, i + 6), 16);
                }
                break;
            case "08":
                if (i + 2 < hexString.length && i === 10) {
                    // Multiplies by 0.1 to convert from decibels
                    result.data.sound = parseInt(hexString.substring(i + 2, i + 6), 16) * 0.1;
                }
                break;
            case "37":
                if (i + 2 < hexString.length && i === 10) {
                    result.data.cnt = parseInt(hexString.substring(i + 2, i + 6), 16);
                   
                }
                break;
                default:
                break;
        }
    }

    return result;
}
exports.decodeUplink = decodeUplink;

