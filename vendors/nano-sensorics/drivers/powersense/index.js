/*
 * Nano sensorics PowerSense (PowerSense-L-NAT525XN1E) LoRaWAN energy submeter.
 *
 * Uplink, fPort 10, 51 bytes, big-endian:
 *   0       frame header (0x10 on every frame seen; meaning not documented)
 *   1..6    device clock, local time: year (2 digits), month, day, hour, minute, second
 *   7..26   energy counters, int32 / 100: kWh import, kWh export, kvarh import,
 *           kvarh export, kVAh export
 *   27..50  demand values, float32 (averages over the demand interval, not instantaneous):
 *           current L1, L2, L3 (A), active power (W), reactive power (var),
 *           apparent power (VA)
 *
 * Downlink, fPort 10: uplink interval, 1 to 10 or 15 minutes. Each frame is a prefix byte
 * followed by a Modbus RTU "write multiple registers" request (slave 0xF8, register 0x18D0,
 * 3 registers holding the interval in minutes) and its CRC-16/Modbus.
 */

var PORT = 10;
var UPLINK_LENGTH = 51;

var MODBUS_SLAVE = 0xf8;
var MODBUS_WRITE_MULTIPLE_REGISTERS = 0x10;
var UPLINK_INTERVAL_REGISTER = 0x18d0;
var UPLINK_INTERVAL_REGISTER_COUNT = 3;

// Prefix byte of the vendor's downlink for each supported interval (minutes). The prefixes
// are not in interval order and their meaning is not documented: only these values are sent.
var UPLINK_INTERVAL_PREFIX = {
    1: 0x07,
    2: 0x08,
    3: 0x09,
    4: 0x0a,
    5: 0x01,
    6: 0x02,
    7: 0x03,
    8: 0x04,
    9: 0x05,
    10: 0x06,
    15: 0x0b
};

function readInt32BE(bytes, index) {
    return (bytes[index] << 24) | (bytes[index + 1] << 16) | (bytes[index + 2] << 8) | bytes[index + 3];
}

function readFloat32BE(bytes, index) {
    var bits = ((bytes[index] << 24) | (bytes[index + 1] << 16) | (bytes[index + 2] << 8) | bytes[index + 3]) >>> 0;
    var sign = bits >>> 31 ? -1 : 1;
    var exponent = (bits >>> 23) & 0xff;
    var mantissa = bits & 0x7fffff;
    if (exponent === 0xff) {
        return mantissa ? NaN : sign * Infinity;
    }
    if (exponent === 0) {
        return sign * mantissa * Math.pow(2, -149);
    }
    return sign * (1 + mantissa / 0x800000) * Math.pow(2, exponent - 127);
}

// Same rounding as the vendor's decoder (toFixed(5)), kept as a number.
function roundDemand(value) {
    return Number(value.toFixed(5));
}

function pad2(value) {
    return value < 10 ? "0" + value : "" + value;
}

// The device clock is local time: ISO-8601 without offset.
function readDeviceTime(bytes, index) {
    var year = bytes[index];
    var month = bytes[index + 1];
    var day = bytes[index + 2];
    var hour = bytes[index + 3];
    var minute = bytes[index + 4];
    var second = bytes[index + 5];
    if (year > 99 || month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59 || second > 59) {
        return null;
    }
    return "20" + pad2(year) + "-" + pad2(month) + "-" + pad2(day) + "T" + pad2(hour) + ":" + pad2(minute) + ":" + pad2(second);
}

function decodeUplink(input) {
    var bytes = input.bytes;
    if (input.fPort !== PORT) {
        return { errors: ["Unsupported fPort " + input.fPort + ": the PowerSense sends its measurements on fPort " + PORT], warnings: [] };
    }
    if (!bytes || bytes.length !== UPLINK_LENGTH) {
        return { errors: ["Invalid payload length " + (bytes ? bytes.length : 0) + ": expected " + UPLINK_LENGTH + " bytes"], warnings: [] };
    }

    var warnings = [];
    var data = {};
    var deviceTime = readDeviceTime(bytes, 1);
    if (deviceTime === null) {
        warnings.push("Invalid device time in bytes 1 to 6");
    } else {
        data.deviceTime = deviceTime;
    }
    data.activeEnergyImport = readInt32BE(bytes, 7) / 100;
    data.activeEnergyExport = readInt32BE(bytes, 11) / 100;
    data.reactiveEnergyImport = readInt32BE(bytes, 15) / 100;
    data.reactiveEnergyExport = readInt32BE(bytes, 19) / 100;
    data.apparentEnergyExport = readInt32BE(bytes, 23) / 100;
    data.currentDemandL1 = roundDemand(readFloat32BE(bytes, 27));
    data.currentDemandL2 = roundDemand(readFloat32BE(bytes, 31));
    data.currentDemandL3 = roundDemand(readFloat32BE(bytes, 35));
    data.activePowerDemand = roundDemand(readFloat32BE(bytes, 39));
    data.reactivePowerDemand = roundDemand(readFloat32BE(bytes, 43));
    data.apparentPowerDemand = roundDemand(readFloat32BE(bytes, 47));

    return { data: data, errors: [], warnings: warnings };
}

function crc16Modbus(bytes) {
    var crc = 0xffff;
    for (var i = 0; i < bytes.length; i++) {
        crc ^= bytes[i];
        for (var bit = 0; bit < 8; bit++) {
            crc = crc & 1 ? (crc >>> 1) ^ 0xa001 : crc >>> 1;
        }
    }
    return crc;
}

function modbusUplinkIntervalRequest(minutes) {
    var request = [
        MODBUS_SLAVE,
        MODBUS_WRITE_MULTIPLE_REGISTERS,
        UPLINK_INTERVAL_REGISTER >> 8,
        UPLINK_INTERVAL_REGISTER & 0xff,
        0x00,
        UPLINK_INTERVAL_REGISTER_COUNT,
        UPLINK_INTERVAL_REGISTER_COUNT * 2
    ];
    for (var i = 0; i < UPLINK_INTERVAL_REGISTER_COUNT; i++) {
        request.push(minutes >> 8, minutes & 0xff);
    }
    var crc = crc16Modbus(request);
    request.push(crc & 0xff, crc >> 8);
    return request;
}

function supportedUplinkIntervals() {
    return Object.keys(UPLINK_INTERVAL_PREFIX).join(", ");
}

function encodeDownlink(input) {
    var data = input.data || {};
    var minutes = data.uplinkInterval;
    if (minutes === undefined || minutes === null) {
        return { errors: ["Missing uplinkInterval (minutes): the only supported command"], warnings: [] };
    }
    if (typeof minutes !== "number" || !UPLINK_INTERVAL_PREFIX.hasOwnProperty(minutes)) {
        return { errors: ["Unsupported uplinkInterval " + minutes + ": supported values are " + supportedUplinkIntervals() + " minutes"], warnings: [] };
    }
    return {
        bytes: [UPLINK_INTERVAL_PREFIX[minutes]].concat(modbusUplinkIntervalRequest(minutes)),
        fPort: PORT,
        errors: [],
        warnings: []
    };
}

function decodeDownlink(input) {
    var bytes = input.bytes;
    if (input.fPort !== PORT) {
        return { errors: ["Unsupported fPort " + input.fPort + ": the PowerSense takes its downlinks on fPort " + PORT], warnings: [] };
    }
    var requestLength = 7 + UPLINK_INTERVAL_REGISTER_COUNT * 2 + 2;
    if (!bytes || bytes.length !== 1 + requestLength) {
        return { errors: ["Unknown downlink: expected " + (1 + requestLength) + " bytes"], warnings: [] };
    }
    var request = Array.prototype.slice.call(bytes, 1);
    var minutes = (request[7] << 8) | request[8];
    var expected = modbusUplinkIntervalRequest(minutes);
    for (var i = 0; i < expected.length; i++) {
        if (request[i] !== expected[i]) {
            return { errors: ["Unknown downlink: not an uplink interval request with a valid CRC"], warnings: [] };
        }
    }
    var warnings = [];
    if (UPLINK_INTERVAL_PREFIX[minutes] !== bytes[0]) {
        warnings.push("Prefix byte " + bytes[0] + " differs from the vendor's command for " + minutes + " minutes");
    }
    return { data: { uplinkInterval: minutes }, errors: [], warnings: warnings };
}

exports.decodeUplink = decodeUplink;
exports.encodeDownlink = encodeDownlink;
exports.decodeDownlink = decodeDownlink;
