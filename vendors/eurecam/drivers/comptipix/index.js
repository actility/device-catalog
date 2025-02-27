/**
 * @typedef {Object} DecodedUplink
 * @property {Object} data - The open JavaScript object representing the decoded uplink payload when no errors occurred
 * @property {string[]} errors - A list of error messages while decoding the uplink payload
 * @property {string[]} warnings - A list of warning messages that do not prevent the driver from decoding the uplink payload
 */

/**
 * Decode uplink
 * @param {Object} input - An object provided by the IoT Flow framework
 * @param {number[]} input.bytes - Array of bytes represented as numbers as it has been sent from the device
 * @param {number} input.fPort - The Port Field on which the uplink has been sent
 * @param {Date} input.recvTime - The uplink message time recorded by the LoRaWAN network server
 * @returns {DecodedUplink} The decoded object
 */

// Driver from manufacturer
function decodeUplink(input) {
    let result = {
        data: {},
        errors: [],
        warnings: []
    };

    try {
        const rawHex = Buffer.from(input.bytes).toString('hex');

        let jsonString = '';
        for (let i = 0; i < rawHex.length; i += 2) {
            jsonString += String.fromCharCode(parseInt(rawHex.substr(i, 2), 16));
        }

        result.data = JSON.parse(jsonString);
    } catch (error) {
        result.errors.push("Failed to decode uplink data");
    }

    return result;
}


exports.decodeUplink = decodeUplink;