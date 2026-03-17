/**
 * Payload Decoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product CT101 / CT103 / CT105
 */
var RAW_VALUE = 0x00;

// The Things Network
function Decoder(bytes, port) {
    return milesightDeviceDecode(bytes);
}

function milesightDeviceDecode(bytes) {
    var decoded = {};
    for (var i = 0; i < bytes.length;) {
        var channel_id = bytes[i++];
        var channel_type = bytes[i++];

        // IPSO VERSION
        if (channel_id === 0xff && channel_type === 0x01) {
            decoded.ipso_version = readProtocolVersion(bytes[i]);
            i += 1;
        }
        // HARDWARE VERSION
        else if (channel_id === 0xff && channel_type === 0x09) {
            decoded.hardware_version = readHardwareVersion(bytes.slice(i, i + 2));
            i += 2;
        }
        // FIRMWARE VERSION
        else if (channel_id === 0xff && channel_type === 0x0a) {
            decoded.firmware_version = readFirmwareVersion(bytes.slice(i, i + 2));
            i += 2;
        }
        // TSL VERSION
        else if (channel_id === 0xff && channel_type === 0xff) {
            decoded.tsl_version = readTslVersion(bytes.slice(i, i + 2));
            i += 2;
        }
        // SERIAL NUMBER
        else if (channel_id === 0xff && channel_type === 0x16) {
            decoded.sn = readSerialNumber(bytes.slice(i, i + 8));
            i += 8;
        }
        // LORAWAN CLASS TYPE
        else if (channel_id === 0xff && channel_type === 0x0f) {
            decoded.lorawan_class = readLoRaWANClass(bytes[i]);
            i += 1;
        }
        // RESET EVENT
        else if (channel_id === 0xff && channel_type === 0xfe) {
            decoded.reset_event = readResetEvent(1);
            i += 1;
        }
        // DEVICE STATUS
        else if (channel_id === 0xff && channel_type === 0x0b) {
            decoded.device_status = readDeviceStatus(1);
            i += 1;
        }
        // TOTAL CURRENT
        else if (channel_id === 0x03 && channel_type === 0x97) {
            decoded.total_current = readUInt32LE(bytes.slice(i, i + 4)) / 100;
            i += 4;
        }
        // CURRENT
        else if (channel_id === 0x04 && channel_type === 0x98) {
            var current_value = readUInt16LE(bytes.slice(i, i + 2));
            if (current_value === 0xffff) {
                decoded.current_sensor_status = readSensorStatus(2);
            } else {
                decoded.current = current_value / 100;
            }
            i += 2;
        }
        // TEMPERATURE
        else if (channel_id === 0x09 && channel_type === 0x67) {
            var temperature_value = readUInt16LE(bytes.slice(i, i + 2));
            if (temperature_value === 0xfffd) {
                decoded.temperature_sensor_status = readSensorStatus(1);
            } else if (temperature_value === 0xffff) {
                decoded.temperature_sensor_status = readSensorStatus(2);
            } else {
                decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
            }
            i += 2;
        }
        // CURRENT ALARM
        else if (channel_id === 0x84 && channel_type === 0x98) {
            decoded.current_max = readUInt16LE(bytes.slice(i, i + 2)) / 100;
            decoded.current_min = readUInt16LE(bytes.slice(i + 2, i + 4)) / 100;
            decoded.current = readUInt16LE(bytes.slice(i + 4, i + 6)) / 100;
            decoded.current_alarm = readCurrentAlarm(bytes[i + 6]);
            i += 7;
        }
        // TEMPERATURE ALARM
        else if (channel_id === 0x89 && channel_type === 0x67) {
            decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
            decoded.temperature_alarm = readTemperatureAlarm(bytes[i + 2]);
            i += 3;
        }
        // DOWNLINK RESPONSE
        else if (channel_id === 0xfe || channel_id === 0xff) {
            var result = handle_downlink_response(channel_type, bytes, i);
            decoded = mergeObjects(decoded, result.data);
            i = result.offset;
        }
        else {
            break;
        }
    }

    return decoded;
}

function handle_downlink_response(channel_type, bytes, offset) {
    var decoded = {};

    switch (channel_type) {
        case 0x02:
            decoded.alarm_report_interval = readUInt16LE(bytes.slice(offset, offset + 2));
            offset += 2;
            break;
        case 0x06:
            var value = readUInt8(bytes[offset]);
            var channel_value = (value >>> 3) & 0x07;
            if (channel_value === 0x01) {
                decoded.current_threshold_alarm_config = {};
                decoded.current_threshold_alarm_config.condition = readConditionType(value & 0x07);
                decoded.current_threshold_alarm_config.min_threshold = readUInt16LE(bytes.slice(offset + 1, offset + 3));
                decoded.current_threshold_alarm_config.max_threshold = readUInt16LE(bytes.slice(offset + 3, offset + 5));
                decoded.current_threshold_alarm_config.alarm_interval = readUInt16LE(bytes.slice(offset + 5, offset + 7));
                decoded.current_threshold_alarm_config.alarm_counts = readUInt16LE(bytes.slice(offset + 7, offset + 9));
            } else if (channel_value === 0x04) {
                decoded.temperature_threshold_alarm_config = {};
                decoded.temperature_threshold_alarm_config.condition = readConditionType(value & 0x07);
                decoded.temperature_threshold_alarm_config.min_threshold = readInt16LE(bytes.slice(offset + 1, offset + 3)) / 10;
                decoded.temperature_threshold_alarm_config.max_threshold = readInt16LE(bytes.slice(offset + 3, offset + 5)) / 10;
            }
            offset += 9;
            break;
        case 0x10:
            decoded.reboot = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x27:
            decoded.clear_current_cumulative = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x28:
            decoded.report_status = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x8e:
            // ignore first byte
            decoded.report_interval = readUInt16LE(bytes.slice(offset + 1, offset + 3));
            offset += 3;
            break;
        case 0xf2:
            decoded.alarm_report_counts = readUInt16LE(bytes.slice(offset, offset + 2));
            offset += 2;
            break;
        default:
            throw new Error("unknown downlink response");
    }

    return { data: decoded, offset: offset };
}

function readProtocolVersion(bytes) {
    var major = (bytes & 0xf0) >> 4;
    var minor = bytes & 0x0f;
    return "v" + major + "." + minor;
}

function readHardwareVersion(bytes) {
    var major = bytes[0] & 0xff;
    var minor = (bytes[1] & 0xff) >> 4;
    return "v" + major + "." + minor;
}

function readFirmwareVersion(bytes) {
    var major = bytes[0] & 0xff;
    var minor = bytes[1] & 0xff;
    return "v" + major + "." + minor;
}

function readTslVersion(bytes) {
    var major = bytes[0] & 0xff;
    var minor = bytes[1] & 0xff;
    return "v" + major + "." + minor;
}

function readSerialNumber(bytes) {
    var temp = [];
    for (var idx = 0; idx < bytes.length; idx++) {
        temp.push(("0" + (bytes[idx] & 0xff).toString(16)).slice(-2));
    }
    return temp.join("");
}

function readLoRaWANClass(type) {
    var class_map = {
        0: "Class A",
        1: "Class B",
        2: "Class C",
        3: "Class CtoB",
    };
    return getValue(class_map, type);
}

function readResetEvent(status) {
    var status_map = { 0: "normal", 1: "reset" };
    return getValue(status_map, status);
}

function readDeviceStatus(status) {
    var status_map = { 0: "off", 1: "on" };
    return getValue(status_map, status);
}

function readYesNoStatus(status) {
    var status_map = { 0: "no", 1: "yes" };
    return getValue(status_map, status);
}

function readSensorStatus(status) {
    var status_map = { 0: "normal", 1: "over range alarm", 2: "read failed" };
    return getValue(status_map, status);
}

function readCurrentAlarm(value) {
    var alarm_bit_offset = { "current_threshold_alarm": 0, "current_threshold_alarm_release": 1, "current_over_range_alarm": 2, "current_over_range_alarm_release": 3 };

    var event = {};
    for (var key in alarm_bit_offset) {
        event[key] = readYesNoStatus((value >> alarm_bit_offset[key]) & 0x01);
    }
    return event;
}

function readTemperatureAlarm(type) {
    var alarm_map = { 0: "temperature threshold alarm release", 1: "temperature threshold alarm" };
    return getValue(alarm_map, type);
}

function readConditionType(type) {
    var condition_map = { 0: "disable", 1: "below", 2: "above", 3: "between", 4: "outside" };
    return getValue(condition_map, type);
}

function readUInt8(bytes) {
    return bytes & 0xff;
}

function readInt8(bytes) {
    var ref = readUInt8(bytes);
    return ref > 0x7f ? ref - 0x100 : ref;
}

function readUInt16LE(bytes) {
    var value = (bytes[1] << 8) + bytes[0];
    return value & 0xffff;
}

function readInt16LE(bytes) {
    var ref = readUInt16LE(bytes);
    return ref > 0x7fff ? ref - 0x10000 : ref;
}

function readUInt32LE(bytes) {
    var value = (bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
    return (value & 0xffffffff) >>> 0;
}

function readInt32LE(bytes) {
    var ref = readUInt32LE(bytes);
    return ref > 0x7fffffff ? ref - 0x100000000 : ref;
}

function readFloatLE(bytes) {
    var bits = (bytes[3] << 24) | (bytes[2] << 16) | (bytes[1] << 8) | bytes[0];
    var sign = bits >>> 31 === 0 ? 1.0 : -1.0;
    var e = (bits >>> 23) & 0xff;
    var m = e === 0 ? (bits & 0x7fffff) << 1 : (bits & 0x7fffff) | 0x800000;
    var f = sign * m * Math.pow(2, e - 150);
    return f;
}

function getValue(map, key) {
    if (RAW_VALUE) return key;

    var value = map[key];
    if (!value) value = "unknown";
    return value;
}

function mergeObjects(target) {
    "use strict";
    if (target == null) {
        throw new TypeError("Cannot convert first argument to object");
    }

    var to = Object(target);
    for (var i = 1; i < arguments.length; i++) {
        var nextSource = arguments[i];
        if (nextSource == null) {
            continue;
        }
        nextSource = Object(nextSource);

        var keysArray = Object.keys(Object(nextSource));
        for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
            var nextKey = keysArray[nextIndex];
            var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
            if (desc !== undefined && desc.enumerable) {
                if (Array.isArray(to[nextKey]) && Array.isArray(nextSource[nextKey])) {
                    to[nextKey] = to[nextKey].concat(nextSource[nextKey]);
                } else {
                    to[nextKey] = nextSource[nextKey];
                }
            }
        }
    }
    return to;
}

function decodeUplink(input) {
    var decoded = milesightDeviceDecode(input.bytes);
    return { data: decoded };
}

function decodeDownlink(input) {
    var decoded = milesightDeviceDecode(input.bytes);
    return { data: decoded };
}

var __milesightDownlinkCodec = (function () {
/**
 * Payload Encoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product CT101 / CT103 / CT105
 */
var RAW_VALUE = 0x00;

/* eslint no-redeclare: "off" */
/* eslint-disable */
// Chirpstack v4
function encodeDownlink(input) {
    var encoded = milesightDeviceEncode(input.data);
    return { bytes: encoded };
}

// Chirpstack v3
function Encode(fPort, obj) {
    return milesightDeviceEncode(obj);
}

// The Things Network
function Encoder(obj, port) {
    return milesightDeviceEncode(obj);
}
/* eslint-enable */

function milesightDeviceEncode(payload) {
    var encoded = [];

    if ("reboot" in payload) {
        encoded = encoded.concat(reboot(payload.reboot));
    }
    if ("report_interval" in payload) {
        encoded = encoded.concat(setReportInterval(payload.report_interval));
    }
    if ("report_status" in payload) {
        encoded = encoded.concat(reportStatus(payload.report_status));
    }
    if ("clear_current_cumulative" in payload) {
        encoded = encoded.concat(clearCurrentCumulativeValue(payload.clear_current_cumulative));
    }
    if ("alarm_report_counts" in payload) {
        encoded = encoded.concat(alarmReportCounts(payload.alarm_report_counts));
    }
    if ("alarm_report_interval" in payload) {
        encoded = encoded.concat(alarmReportInterval(payload.alarm_report_interval));
    }
    if ("current_alarm_config" in payload) {
        encoded = encoded.concat(setCurrentThresholdAlarmConfig(payload.current_alarm_config));
    }
    if ("temperature_alarm_config" in payload) {
        encoded = encoded.concat(setTemperatureThresholdAlarmConfig(payload.temperature_alarm_config));
    }

    return encoded;
}

/**
 * reboot device
 * @param {number} reboot values: (0: no, 1: yes)
 * @example { "reboot": 1 }
 */
function reboot(reboot) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var reboot_values = getValues(yes_no_map);
    if (reboot_values.indexOf(reboot) === -1) {
        throw new Error("reboot must be one of " + reboot_values.join(", "));
    }

    if (getValue(yes_no_map, reboot) === 0) {
        return [];
    }
    return [0xff, 0x10, 0xff];
}

/**
 * set report interval
 * @param {number} report_interval unit: minute, range: [1, 1440]
 * @example { "report_interval": 20 }
 */
function setReportInterval(report_interval) {
    if (typeof report_interval !== "number") {
        throw new Error("report_interval must be a number");
    }
    if (report_interval < 1 || report_interval > 1440) {
        throw new Error("report_interval must be between 1 and 1440");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x8e);
    buffer.writeUInt8(0x00);
    buffer.writeUInt16LE(report_interval);
    return buffer.toBytes();
}

/**
 * report status
 * @param {number} report_status values: (0: no, 1: yes)
 * @example { "report_status": 1 }
 */
function reportStatus(report_status) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(report_status) === -1) {
        throw new Error("report_status must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, report_status) === 0) {
        return [];
    }
    return [0xff, 0x28, 0xff];
}

/**
 * clear current cumulative value
 * @param {number} clear_current_cumulative values: (0: no, 1: yes)
 * @example { "clear_current_cumulative": 1 }
 */
function clearCurrentCumulativeValue(clear_current_cumulative) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(clear_current_cumulative) === -1) {
        throw new Error("clear_current_cumulative must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, clear_current_cumulative) === 0) {
        return [];
    }
    return [0xff, 0x27, 0x01];
}

/**
 * set current threshold alarm config
 * @param {object} current_alarm_config
 * @param {number} current_alarm_config.condition values: (0: disable, 1: below, 2: above, 3: between, 4: outside)
 * @param {number} current_alarm_config.threshold_min unit: A
 * @param {number} current_alarm_config.threshold_max unit: A
 * @param {number} current_alarm_config.alarm_interval unit: minute
 * @param {number} current_alarm_config.alarm_counts
 * @example { "current_alarm_config": { "condition": 1, "threshold_min": 100, "threshold_max": 200 } }
 */
function setCurrentThresholdAlarmConfig(current_alarm_config) {
    var condition = current_alarm_config.condition;
    var threshold_min = current_alarm_config.threshold_min;
    var threshold_max = current_alarm_config.threshold_max;
    var alarm_interval = current_alarm_config.alarm_interval;
    var alarm_counts = current_alarm_config.alarm_counts;

    var condition_map = { 0: "disable", 1: "below", 2: "above", 3: "between", 4: "outside" };
    var condition_values = getValues(condition_map);
    if (condition_values.indexOf(condition) === -1) {
        throw new Error("current_alarm_config.condition must be one of " + condition_values.join(", "));
    }

    var data = 0x00;
    data |= 0x01 << 3; // phrase A
    data |= getValue(condition_map, condition) << 0;

    var buffer = new Buffer(11);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x06);
    buffer.writeUInt8(data);
    buffer.writeUInt16LE(threshold_min);
    buffer.writeUInt16LE(threshold_max);
    buffer.writeUInt16LE(alarm_interval);
    buffer.writeUInt16LE(alarm_counts);
    return buffer.toBytes();
}

/**
 * set temperature threshold alarm config
 * @param {object} temperature_alarm_config
 * @param {number} temperature_alarm_config.condition values: (0: disable, 1: below, 2: above, 3: between, 4: outside)
 * @param {number} temperature_alarm_config.threshold_min unit: °C
 * @param {number} temperature_alarm_config.threshold_max unit: °C
 * @example { "temperature_alarm_config": { "condition": 1, "threshold_min": 100, "threshold_max": 200 } }
 */
function setTemperatureThresholdAlarmConfig(temperature_alarm_config) {
    var condition = temperature_alarm_config.condition;
    var threshold_min = temperature_alarm_config.threshold_min;
    var threshold_max = temperature_alarm_config.threshold_max;

    var condition_map = { 0: "disable", 1: "below", 2: "above", 3: "between", 4: "outside" };
    var condition_values = getValues(condition_map);
    if (condition_values.indexOf(condition) === -1) {
        throw new Error("temperature_alarm_config.condition must be one of " + condition_values.join(", "));
    }
    var data = 0x00;
    data |= 0x04 << 3; // temperature
    data |= getValue(condition_map, condition) << 0;

    var buffer = new Buffer(11);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x06);
    buffer.writeUInt8(data);
    buffer.writeInt16LE(threshold_min * 10);
    buffer.writeInt16LE(threshold_max * 10);
    buffer.writeUInt32LE(0x00); // reserved
    return buffer.toBytes();
}

/**
 * alarm report counts
 * @param {number} alarm_report_counts, range: [1, 1000]
 * @example { "alarm_report_counts": 1000 }
 */
function alarmReportCounts(alarm_report_counts) {
    if (typeof alarm_report_counts !== "number") {
        throw new Error("alarm_report_counts must be a number");
    }
    if (alarm_report_counts < 1 || alarm_report_counts > 1000) {
        throw new Error("alarm_report_counts must be between 1 and 1000");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xf2);
    buffer.writeUInt16LE(alarm_report_counts);
    return buffer.toBytes();
}

/**
 * alarm report interval
 * @param {number} alarm_report_interval unit: minute, range: [1, 1440]
 * @example { "alarm_report_interval": 1 }
 */
function alarmReportInterval(alarm_report_interval) {
    if (typeof alarm_report_interval !== "number") {
        throw new Error("alarm_report_interval must be a number");
    }
    if (alarm_report_interval < 1 || alarm_report_interval > 1440) {
        throw new Error("alarm_report_interval must be between 1 and 1440");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x02);
    buffer.writeUInt16LE(alarm_report_interval);
    return buffer.toBytes();
}

function getValues(map) {
    var values = [];
    for (var key in map) {
        values.push(RAW_VALUE ? parseInt(key) : map[key]);
    }
    return values;
}

function getValue(map, value) {
    if (RAW_VALUE) return value;

    for (var key in map) {
        if (map[key] === value) {
            return parseInt(key);
        }
    }

    throw new Error("not match in " + JSON.stringify(map));
}

function Buffer(size) {
    this.buffer = new Array(size);
    this.offset = 0;

    for (var i = 0; i < size; i++) {
        this.buffer[i] = 0;
    }
}

Buffer.prototype._write = function (value, byteLength, isLittleEndian) {
    var offset = 0;
    for (var index = 0; index < byteLength; index++) {
        offset = isLittleEndian ? index << 3 : (byteLength - 1 - index) << 3;
        this.buffer[this.offset + index] = (value >> offset) & 0xff;
    }
};

Buffer.prototype.writeUInt8 = function (value) {
    this._write(value, 1, true);
    this.offset += 1;
};

Buffer.prototype.writeInt8 = function (value) {
    this._write(value < 0 ? value + 0x100 : value, 1, true);
    this.offset += 1;
};

Buffer.prototype.writeUInt16LE = function (value) {
    this._write(value, 2, true);
    this.offset += 2;
};

Buffer.prototype.writeInt16LE = function (value) {
    this._write(value < 0 ? value + 0x10000 : value, 2, true);
    this.offset += 2;
};

Buffer.prototype.writeUInt32LE = function (value) {
    this._write(value, 4, true);
    this.offset += 4;
};

Buffer.prototype.writeInt32LE = function (value) {
    this._write(value < 0 ? value + 0x100000000 : value, 4, true);
    this.offset += 4;
};

Buffer.prototype.toBytes = function () {
    return this.buffer;
};
    return {
        encodeDownlink: encodeDownlink,
        Encode: Encode,
        Encoder: Encoder,
    };
})();

function encodeDownlink(input) {
    var result = __milesightDownlinkCodec.encodeDownlink(input);
    if (result && typeof input.fPort !== "undefined" && typeof result.fPort === "undefined") {
        result.fPort = input.fPort;
    }
    return result;
}

function Encode(fPort, obj) {
    return __milesightDownlinkCodec.Encode(fPort, obj);
}

function Encoder(obj, port) {
    return __milesightDownlinkCodec.Encoder(obj, port);
}

exports.encodeDownlink = encodeDownlink;
exports.decodeDownlink = decodeDownlink;

exports.decodeUplink = decodeUplink;
