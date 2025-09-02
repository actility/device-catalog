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

    const bytes = Buffer.from(input.bytes);

    if (bytes.length === 0) {
        result.errors.push('Invalid uplink payload: payload is empty');
        delete result.data;
        return result;
    }

    const header = bytes[0];;
    let header2 = 0;
    let bytesProcessed = 1;

    // Digital-only packet
    if (checkBit(header, 0) == 1) {
        result.data.D1 = checkBit(header, 1);
        result.data.D2 = checkBit(header, 2);
        result.data.D3 = checkBit(header, 3);
        result.data.D4 = checkBit(header, 4);
        if (bytes.length > 1) {
            result.warnings.push("Spurious payload bytes ignored");
        }
        return result;
    }

    // Standard packet
    if (checkBit(header, 7)) {
        header2 = bytes[1];
        bytesProcessed = 2;
    }

    let validLength = true;

    // Next byte is digital
    if (validLength && checkBit(header, 1)) {
        validLength = bytes.length - bytesProcessed >= 1;
        if (validLength) {
            const digitals = bytes[bytesProcessed];
            result.data.D1 = checkBit(digitals, 0);
            result.data.D2 = checkBit(digitals, 1);
            result.data.D3 = checkBit(digitals, 2);
            result.data.D4 = checkBit(digitals, 3);
            bytesProcessed +=  1;
        }
    }

    // Analogue A1
    if (validLength && checkBit(header, 2)) {
        validLength = (bytes.length - bytesProcessed) >= 4;
        if (validLength) {
            result.data.A1 = floatFromBytes(bytes, bytesProcessed);
            bytesProcessed += 4;
        }
    }

    // Analogue A2
    if (validLength && checkBit(header, 3)) {
        validLength = (bytes.length - bytesProcessed) >= 4;
        if (validLength) {
            result.data.A2 = floatFromBytes(bytes, bytesProcessed);
            bytesProcessed += 4;
        }
    }

    // Analogue A3
    if (validLength && checkBit(header, 7) && checkBit(header2, 1)) {
        validLength = (bytes.length - bytesProcessed) >= 4;
        if (validLength) {
            result.data.A3 = floatFromBytes(bytes, bytesProcessed);
            bytesProcessed += 4;
        }
    }
    
    // Analogue A4
    if (validLength && checkBit(header, 7) && checkBit(header2, 2)) {
        validLength = (bytes.length - bytesProcessed) >= 4;
        if (validLength) {
            result.data.A4 = floatFromBytes(bytes, bytesProcessed);
            bytesProcessed += 4;
        }
    }

    // Analogue A5
    if (validLength && checkBit(header, 7) && checkBit(header2, 3)) {
        validLength = (bytes.length - bytesProcessed) >= 4;
        if (validLength) {
            result.data.A5 = floatFromBytes(bytes, bytesProcessed);
            bytesProcessed += 4;
        }
    }

    // CNT1
    if (validLength && checkBit(header, 4)) {
        validLength = (bytes.length - bytesProcessed) >= 4;
        if (validLength) {
            result.data.CNT1 = int32FromBytes(bytes, bytesProcessed);
            bytesProcessed += 4;
        }
    }

    // CNT2
    if (validLength && checkBit(header, 5)) {
        validLength = (bytes.length - bytesProcessed) >= 4;
        if (validLength) {
            result.data.CNT2 = int32FromBytes(bytes, bytesProcessed);
            bytesProcessed += 4;
        }
    }

    // DIAGNOSTIC
    if (validLength && checkBit(header, 6)) {
        validLength = (bytes.length - bytesProcessed) >= 6;
        if (validLength) {
            result.data.VOLT = (bytes[bytesProcessed] * 0.01) + 1.5;
            result.data.TEMP = (bytes[bytesProcessed + 1] * 0.5) - 20;
            const mydate = new Date(int32FromBytes(bytes, (bytesProcessed + 2)) * 1000);
            result.data.TIME = Math.floor(mydate.getTime()/1000);
            bytesProcessed += 6;
        }
    }

    // MODBUS
    if (validLength && checkBit(header, 7) && checkBit(header2, 0)) {
        if (bytes.length - bytesProcessed >= 4) {
            const packetSize = bytes[bytesProcessed];
            validLength = (bytes.length - bytesProcessed - 1) >= packetSize; 
            if (validLength) {
                result.data.MB_DATA = Array.from(bytes.subarray(bytesProcessed + 1, bytesProcessed + packetSize + 1));
                bytesProcessed = bytesProcessed + packetSize + 1;
            }
        } else {
            validLength = false;
        }
    }

    // RESERVED
    if (validLength && checkBit(header, 7) && checkBit(header2, 4)) {
        validLength = (bytes.length - bytesProcessed) >= 1;
        bytesProcessed += 1;
    }

    // HART
    if (validLength && checkBit(header, 7) && checkBit(header2, 5)) {
        if (bytes.length - bytesProcessed >= 2) {
            const hartHeader = bytes[bytesProcessed];
            bytesProcessed += 1;

            if (validLength && checkBit(hartHeader, 0)) {
                validLength = (bytes.length - bytesProcessed) >= 4;
                result.data.A1_H2 = floatFromBytes(bytes, bytesProcessed);
                bytesProcessed += 4;
            }
            if (validLength && checkBit(hartHeader, 1)) {
                validLength = (bytes.length - bytesProcessed) >= 4;
                result.data.A1_H3 = floatFromBytes(bytes, bytesProcessed);
                bytesProcessed += 4;
            }
            if (validLength && checkBit(hartHeader, 2)) {
                validLength = (bytes.length - bytesProcessed) >= 4;
                result.data.A1_H4 = floatFromBytes(bytes, bytesProcessed);
                bytesProcessed += 4;
            }
            if (validLength && checkBit(hartHeader, 3)) {
                validLength = (bytes.length - bytesProcessed) >= 4;
                result.data.A2_H2 = floatFromBytes(bytes, bytesProcessed);
                bytesProcessed += 4;
            }
            if (validLength && checkBit(hartHeader, 4)) {
                validLength = (bytes.length - bytesProcessed) >= 4;
                result.data.A2_H3 = floatFromBytes(bytes, bytesProcessed);
                bytesProcessed += 4;
            }
            if (validLength && checkBit(hartHeader, 5)) {
                validLength = (bytes.length - bytesProcessed) >= 4;
                result.data.A2_H4 = floatFromBytes(bytes, bytesProcessed);
                bytesProcessed += 4;
            }

        } else {
            validLength = false;
        }
    } 

    if (!validLength) {
        delete result.data;
        result.errors.push("Invalid uplink payload: payload too short");
    } else if (bytesProcessed > 50) {
        result.warnings.push("Payload is longer than 50 bytes");
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
/* function encodeDownlink(input) {
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
} */

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
/* function decodeDownlink(input) {
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

    for (let i = 0; i < raw.byteLength; i += 2) {
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
} */

var _rshift23 = Math.pow(2, -23);      // >> 23 for floats
var _rshift127 = Math.pow(2, -127);    // 2^-127
var _2eXp = new Array(); for (var i = 0; i < 1200; i++) _2eXp[i] = Math.pow(2, i);
var _2eXn = new Array(); for (var i = 0; i < 1200; i++) _2eXn[i] = Math.pow(2, -i);
function pow2(exp) {
    return (exp >= 0) ? _2eXp[exp] : _2eXn[-exp];
}

function checkBit(number, bitPos) {
    return (number & (1 << bitPos)) === 0 ? 0 : 1;
}

function int32FromBytes(bytes, start) {
    return ((bytes[start + 3] << 24) | (bytes[start + 2] << 16) | (bytes[start + 1] << 8) | bytes[start]);
}

function floatFromBytes(buf, offset) {
    const word = (((((buf[offset + 3] * 256) + buf[offset + 2]) * 256) + buf[offset + 1]) * 256) + buf[offset];
    const mantissa = (word & 0x007FFFFF);
    const exponent = (word & 0x7F800000) >>> 23;
    const sign = (word >> 31) || 1;       // -1, 1, or 1 if NaN

    let value;
    if (exponent === 0x000) {
        value = mantissa ? mantissa * _rshift23 * 2 * _rshift127 : 0.0;
    }
    else if (exponent < 0xff) {
        value = (1 + mantissa * _rshift23) * pow2(exponent - 127) // * _rshift127;
    }
    else {
        value = mantissa ? NaN : Infinity;
    }

    return (sign * value);
}

exports.decodeUplink = decodeUplink;
// exports.encodeDownlink = encodeDownlink;
// exports.decodeDownlink = decodeDownlink;
