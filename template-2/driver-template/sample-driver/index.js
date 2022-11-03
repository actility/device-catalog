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
function decodeUplink(input) {
    let result = {
        data: {},
        errors: [],
        warnings: []
    };
    const raw = Buffer.from(input.bytes);

    if (raw.byteLength > 8) {
        result.errors.push("Invalid uplink payload: length exceeds 8 bytes");
        delete result.data;
        return result;
    }

    for (i = 0; i < raw.byteLength; i++) {
        switch (raw[i]) {
            // Temperature - 2 bytes
            case 0x00:
                if (raw.byteLength < i + 3) {
                    result.errors.push("Invalid uplink payload: index out of bounds when reading temperature");
                    delete result.data;
                    return result;
                }
                result.data.temperature = raw.readInt16BE(i+1)/100;
                i += 2;
                break;
            // Humidity - 2 bytes
            case 0x01:
                if (raw.byteLength < i + 3) {
                    result.errors.push("Invalid uplink payload: index out of bounds when reading humidity");
                    delete result.data;
                    return result;
                }
                result.data.humidity = raw.readInt16BE(i+1)/100;
                i += 2;
                break;
            // Pulse counter - 1 byte
            case 0x02:
                result.data.pulseCounter = raw.readInt8(i+1);
                i += 1;
                break;
            default:
                result.errors.push("Invalid uplink payload: unknown id '" + raw[i] + "'");
                delete result.data;
                return result;
        }
    }
    return result;
}

/**
 * @typedef {Object} EncodedDownlink
 * @property {number[]} bytes - Array of bytes represented as numbers as it will be sent to the device
 * @property {number} fPort - The Port Field on which the downlink must be sent
 * @property {string[]} errors - A list of error messages while encoding the downlink object
 * @property {string[]} warnings - A list of warning messages that do not prevent the driver from encoding the downlink object
 */

/**
 * Downlink encode
 * @param {Object} input - An object provided by the IoT Flow framework
 * @param {Object} input.data - The higher-level object representing your downlink
 * @returns {EncodedDownlink} The encoded object
 */
function encodeDownlink(input) {
    let result = {
        errors: [],
        warnings: []
    };
    let raw = new Buffer(4);
    let index = 0;

    if (typeof input.data.pulseCounterThreshold !== "undefined") {
        if (input.data.pulseCounterThreshold > 255) {
            result.errors.push("Invalid downlink: pulseCounterThreshold cannot exceed 255");
            delete result.data;
            return result;
        }
        raw.writeUInt8(0,index);
        index+=1;
        raw.writeUInt8(input.data.pulseCounterThreshold, index);
        index+=1;
    }
    if (typeof input.data.alarm !== "undefined") {
        raw.writeUInt8(1, index);
        index+=1;
        raw.writeUInt8(input.data.alarm === true? 1 : 0, index);
        index+=1;
    }
    result.bytes = Array.from(raw).slice(0,index);
    result.fPort = 16;
    return result;
}

/**
 * @typedef {Object} DecodedDownlink
 * @property {Object} data - The open JavaScript object representing the decoded downlink payload when no errors occurred
 * @property {string[]} errors - A list of error messages while decoding the downlink payload
 * @property {string[]} warnings - A list of warning messages that do not prevent the driver from decoding the downlink payload
 */

/**
 * Downlink decode
 * @param {Object} input - An object provided by the IoT Flow framework
 * @param {number[]} input.bytes - Array of bytes represented as numbers as it will be sent to the device
 * @param {number} input.fPort - The Port Field on which the downlink must be sent
 * @param {Date} input.recvTime - The uplink message time computed by the IoT Flow framework
 * @returns {DecodedDownlink} The decoded object
 */
function decodeDownlink(input) {
    let result = {
        data: {},
        errors: [],
        warnings: []
    };
    const raw = Buffer.from(input.bytes);

    if (raw.byteLength > 4) {
        result.errors.push("Invalid downlink payload: length exceeds 4 bytes");
        delete result.data;
        return result;
    }

    for (i = 0; i < raw.byteLength; i += 2) {
        switch (raw[i]) {
            // Pulse counter threshold - 1 byte
            case 0x00:
                if (raw.byteLength < i + 2) {
                    result.errors.push("Invalid downlink payload: index out of bounds when reading pulseCounterThreshold");
                    delete result.data;
                    return result;
                }
                result.data.pulseCounterThreshold = raw.readUInt8(i+1);
                break;
            // Alarm - 1 byte
            case 0x01:
                if (raw.byteLength < i + 2) {
                    result.errors.push("Invalid downlink payload: index out of bounds when reading alarm");
                    delete result.data;
                    return result;
                }
                result.data.alarm = raw.readUInt8(i+1) === 1;
                break;
            default:
                result.errors.push("Invalid downlink payload: unknown id '" + raw[i] + "'");
                delete result.data;
                return result;
        }
    }
    return result;
}

exports.decodeUplink = decodeUplink;
exports.encodeDownlink = encodeDownlink;
exports.decodeDownlink = decodeDownlink;