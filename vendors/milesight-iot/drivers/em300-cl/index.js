/**
 * Payload Decoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product EM300-CL
 */
var RAW_VALUE = 0x00;

/* eslint no-redeclare: "off" */
/* eslint-disable */
// Chirpstack v4
function decodeUplink(input) {
    var decoded = milesightDeviceDecode(input.bytes);
    return { data: decoded };
}

// Chirpstack v3
function Decode(fPort, bytes) {
    return milesightDeviceDecode(bytes);
}

// The Things Network
function Decoder(bytes, port) {
    return milesightDeviceDecode(bytes);
}
/* eslint-enable */

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
        // BATTERY
        else if (channel_id === 0x01 && channel_type === 0x75) {
            decoded.battery = readUInt8(bytes[i]);
            i += 1;
        }
        // LIQUID
        else if (channel_id === 0x03 && channel_type === 0xed) {
            decoded.liquid = readLiquidStatus(bytes[i]);
            i += 1;
        }
        // CALIBRATION RESULT
        else if (channel_id === 0x04 && channel_type === 0xee) {
            decoded.calibration_result = readCalibrationResult(bytes[i]);
            i += 1;
        }
        // LIQUID ALARM
        else if (channel_id === 0x83 && channel_type === 0xed) {
            decoded.liquid = readLiquidStatus(bytes[i]);
            decoded.liquid_alarm = readAlarmType(bytes[i + 1]);
            i += 2;
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
        case 0x10:
            decoded.reboot = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x28:
            decoded.report_status = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x62:
            decoded.calibrate = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x7e:
            decoded.alarm_config = {};
            decoded.alarm_config.enable = readEnableStatus(bytes[offset] & 0x01);
            decoded.alarm_config.alarm_release_enable = readEnableStatus((bytes[offset] >> 7) & 0x01);
            decoded.alarm_config.alarm_interval = readUInt16LE(bytes.slice(offset + 1, offset + 3));
            decoded.alarm_config.alarm_counts = readUInt16LE(bytes.slice(offset + 3, offset + 5));
            offset += 5;
            break;
        case 0x8e:
            // ignore first byte
            decoded.report_interval = readUInt16LE(bytes.slice(offset + 1, offset + 3));
            offset += 3;
            break;
        case 0xbb:
            // ignore first byte
            decoded.collection_interval = readUInt16LE(bytes.slice(offset + 1, offset + 3));
            offset += 3;
            break;
        case 0xbe:
            var data = bytes[offset];
            if (data === 0x00) {
                decoded.query_capacitor_calibration_value = readYesNoStatus(1);
            } else if (data === 0x01) {
                decoded.query_capacitor_value = readYesNoStatus(1);
            } else if (data === 0x02) {
                decoded.query_capacitor_judge_value = readYesNoStatus(1);
            }
            offset += 1;
            break;
        case 0xbf:
            var data = bytes[offset];
            if (data === 0x00) {
                decoded.capacitor_config = {};
                decoded.capacitor_config.c1 = readUInt16LE(bytes.slice(offset + 1, offset + 3)) / 100;
                decoded.capacitor_config.c2 = readUInt16LE(bytes.slice(offset + 3, offset + 5)) / 100;
                decoded.capacitor_config.delta = readUInt16LE(bytes.slice(offset + 5, offset + 7)) / 100;
            } else if (data === 0x01) {
                decoded.capacitor_judge_config = {};
                decoded.capacitor_judge_config.c1 = readUInt16LE(bytes.slice(offset + 1, offset + 3)) / 100;
                decoded.capacitor_judge_config.c2 = readUInt16LE(bytes.slice(offset + 3, offset + 5)) / 100;
                decoded.capacitor_judge_config.delta = readUInt16LE(bytes.slice(offset + 5, offset + 7)) / 100;
            }
            offset += 9;
            break;
        case 0xc0:
            decoded.calibrate_delay_time = readUInt16LE(bytes.slice(offset, offset + 2));
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
    var major = (bytes[0] & 0xff).toString(16);
    var minor = (bytes[1] & 0xff) >> 4;
    return "v" + major + "." + minor;
}

function readFirmwareVersion(bytes) {
    var major = (bytes[0] & 0xff).toString(16);
    var minor = (bytes[1] & 0xff).toString(16);
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

function readEnableStatus(status) {
    var status_map = { 0: "disable", 1: "enable" };
    return getValue(status_map, status);
}

function readYesNoStatus(status) {
    var status_map = { 0: "no", 1: "yes" };
    return getValue(status_map, status);
}

function readLiquidStatus(type) {
    var liquid_status_map = { 0: "uncalibrated", 1: "full", 2: "critical liquid level alert", 255: "error" };
    return getValue(liquid_status_map, type);
}

function readAlarmType(type) {
    var alarm_type_map = { 0: "critical liquid level alarm release", 1: "critical liquid level alarm" };
    return getValue(alarm_type_map, type);
}

function readCalibrationResult(type) {
    var calibration_result_map = { 0: "failed", 1: "success" };
    return getValue(calibration_result_map, type);
}

/* eslint-disable */
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

exports.decodeUplink = decodeUplink;

var __milesightDownlinkCodec = (function () {
/**
 * Payload Encoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product EM300-CL
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
    if ("report_status" in payload) {
        encoded = encoded.concat(reportStatus(payload.report_status));
    }
    if ("report_interval" in payload) {
        encoded = encoded.concat(setReportInterval(payload.report_interval));
    }
    if ("collection_interval" in payload) {
        encoded = encoded.concat(setCollectionInterval(payload.collection_interval));
    }
    if ("alarm_config" in payload) {
        encoded = encoded.concat(setAlarmConfig(payload.alarm_config));
    }
    if ("calibrate" in payload) {
        encoded = encoded.concat(calibrate(payload.calibrate));
    }
    if ("calibrate_delay_time" in payload) {
        encoded = encoded.concat(setCalibrateWithDelay(payload.calibrate_delay_time));
    }
    if ("query_capacitor_calibration_value" in payload) {
        encoded = encoded.concat(queryCapacitorCalibrationValue(payload.query_capacitor_calibration_value));
    }
    if ("query_capacitor_value" in payload) {
        encoded = encoded.concat(queryCapacitorValue(payload.query_capacitor_value));
    }
    if ("query_capacitor_judge_value" in payload) {
        encoded = encoded.concat(queryCapacitorJudgeValue(payload.query_capacitor_judge_value));
    }
    if ("capacitor_config" in payload) {
        encoded = encoded.concat(setCapacitorConfig(payload.capacitor_config));
    }
    if ("capacitor_judge_config" in payload) {
        encoded = encoded.concat(setCapacitorJudgeConfig(payload.capacitor_judge_config));
    }

    return encoded;
}

/**
 * reboot
 * @param {number} reboot values: (0: no, 1: yes)
 * @example { "reboot": 1 }
 */
function reboot(reboot) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(reboot) === -1) {
        throw new Error("reboot must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, reboot) === 0) {
        return [];
    }
    return [0xff, 0x10, 0xff];
}

/**
 * report device status
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
 * query capacitor calibration value
 * @param {number} query_capacitor_calibration_value values: (0: no, 1: yes)
 * @example { "query_capacitor_calibration_value": 1 }
 */
function queryCapacitorCalibrationValue(query_capacitor_calibration_value) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(query_capacitor_calibration_value) === -1) {
        throw new Error("query_capacitor_calibration_value must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, query_capacitor_calibration_value) === 0) {
        return [];
    }
    return [0xff, 0xbe, 0x00];
}

/**
 * query capacitor value
 * @param {number} query_capacitor_value values: (0: no, 1: yes)
 * @example { "query_capacitor_value": 1 }
 */
function queryCapacitorValue(query_capacitor_value) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(query_capacitor_value) === -1) {
        throw new Error("query_capacitor_value must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, query_capacitor_value) === 0) {
        return [];
    }
    return [0xff, 0xbe, 0x01];
}

/**
 * query capacitor judge value
 * @param {number} query_capacitor_judge_value values: (0: no, 1: yes)
 * @example { "query_capacitor_judge_value": 1 }
 */
function queryCapacitorJudgeValue(query_capacitor_judge_value) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(query_capacitor_judge_value) === -1) {
        throw new Error("query_capacitor_judge_value must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, query_capacitor_judge_value) === 0) {
        return [];
    }
    return [0xff, 0xbe, 0x02];
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
        throw new Error("report_interval must be in range [1, 1440]");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x8e);
    buffer.writeUInt8(0x00);
    buffer.writeUInt16LE(report_interval);
    return buffer.toBytes();
}

/**
 * set collection interval
 * @param {number} collection_interval unit: minute, range: [1, 1440]
 * @example { "collection_interval": 20 }
 */
function setCollectionInterval(collection_interval) {
    if (typeof collection_interval !== "number") {
        throw new Error("collection_interval must be a number");
    }
    if (collection_interval < 1 || collection_interval > 1440) {
        throw new Error("collection_interval must be in range [1, 1440]");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xbb);
    buffer.writeUInt8(0x00);
    buffer.writeUInt16LE(collection_interval);
    return buffer.toBytes();
}

/**
 * set alarm config
 * @param {object} alarm_config
 * @param {number} alarm_config.enable values: (0: disable, 1: enable)
 * @param {number} alarm_config.alarm_release_enable values: (0: disable, 1: enable)
 * @param {number} alarm_config.alarm_interval unit: minute, range: [1, 1440]
 * @param {number} alarm_config.alarm_counts range: [0, 65535]
 * @example { "alarm_config": { "enable": 1, "alarm_release_enable": 1, "alarm_interval": 10, "alarm_counts": 10 } }
 */
function setAlarmConfig(alarm_config) {
    var enable = alarm_config.enable;
    var alarm_release_enable = alarm_config.alarm_release_enable;
    var alarm_interval = alarm_config.alarm_interval;
    var alarm_counts = alarm_config.alarm_counts;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("alarm_config.enable must be one of " + enable_values.join(", "));
    }
    if (enable_values.indexOf(alarm_release_enable) === -1) {
        throw new Error("alarm_config.alarm_release_enable must be one of " + enable_values.join(", "));
    }
    var data = 0x00;
    data |= getValue(enable_map, enable);
    data |= getValue(enable_map, alarm_release_enable) << 7;

    var buffer = new Buffer(7);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x7e);
    buffer.writeUInt8(data);
    buffer.writeUInt16LE(alarm_interval);
    buffer.writeUInt16LE(alarm_counts);
    return buffer.toBytes();
}

/**
 * calibrate
 * @param {number} calibrate values: (0: no, 1: yes)
 * @example { "calibrate": 1 }
 */
function calibrate(calibrate) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(calibrate) === -1) {
        throw new Error("calibrate must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, calibrate) === 0) {
        return [];
    }
    return [0xff, 0x62, 0xff];
}

/**
 * set calibrate with delay
 * @param {number} calibrate_delay_time unit: second, range: [0, 65535]
 * @example { "calibrate_delay_time": 10 }
 */
function setCalibrateWithDelay(calibrate_delay_time) {
    if (typeof calibrate_delay_time !== "number") {
        throw new Error("calibrate_delay_time must be a number");
    }
    if (calibrate_delay_time < 0 || calibrate_delay_time > 65535) {
        throw new Error("calibrate_delay_time must be in range [0, 65535]");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xc0);
    buffer.writeUInt16LE(calibrate_delay_time);
    return buffer.toBytes();
}

/**
 * set capacitor config
 * @param {object} capacitor_config
 * @param {number} capacitor_config.c1
 * @param {number} capacitor_config.c2
 * @param {number} capacitor_config.delta
 * @example { "capacitor_config": { "c1": 100, "c2": 200, "delta": 300 } }
 */
function setCapacitorConfig(capacitor_config) {
    var c1 = capacitor_config.c1;
    var c2 = capacitor_config.c2;
    var delta = capacitor_config.delta;

    var buffer = new Buffer(11);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xbf);
    buffer.writeUInt8(0x00);
    buffer.writeUInt16LE(c1 * 100);
    buffer.writeUInt16LE(c2 * 100);
    buffer.writeUInt16LE(delta * 100);
    buffer.writeUInt16LE(0x00);
    return buffer.toBytes();
}

/**
 * set capacitor judge config
 * @param {object} capacitor_judge_config
 * @param {number} capacitor_judge_config.c1
 * @param {number} capacitor_judge_config.c2
 * @param {number} capacitor_judge_config.delta
 * @example { "capacitor_judge_config": { "c1": 100, "c2": 200, "delta": 300 } }
 */
function setCapacitorJudgeConfig(capacitor_judge_config) {
    var c1 = capacitor_judge_config.c1;
    var c2 = capacitor_judge_config.c2;
    var delta = capacitor_judge_config.delta;

    var buffer = new Buffer(11);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xbf);
    buffer.writeUInt8(0x01);
    buffer.writeUInt16LE(c1 * 100);
    buffer.writeUInt16LE(c2 * 100);
    buffer.writeUInt16LE(delta * 100);
    buffer.writeUInt16LE(0x00);
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

Buffer.prototype.writeUInt24LE = function (value) {
    this._write(value, 3, true);
    this.offset += 3;
};

Buffer.prototype.writeInt24LE = function (value) {
    this._write(value < 0 ? value + 0x1000000 : value, 3, true);
    this.offset += 3;
};

Buffer.prototype.writeUInt32LE = function (value) {
    this._write(value, 4, true);
    this.offset += 4;
};

Buffer.prototype.writeInt32LE = function (value) {
    this._write(value < 0 ? value + 0x100000000 : value, 4, true);
    this.offset += 4;
};

Buffer.prototype.writeHex = function (hexString) {
    var bytes = [];
    for (var i = 0; i < hexString.length; i += 2) {
        bytes.push(parseInt(hexString.substr(i, 2), 16));
    }
    this.writeBytes(bytes);
};

Buffer.prototype.writeUtf8 = function (str) {
    var bytes = [];
    for (var i = 0; i < str.length; i++) {
        var charCode = str.charCodeAt(i);
        if (charCode < 0x80) {
            bytes.push(charCode);
        } else if (charCode < 0x800) {
            bytes.push(0xc0 | (charCode >> 6));
            bytes.push(0x80 | (charCode & 0x3f));
        } else if (charCode < 0x10000) {
            bytes.push(0xe0 | (charCode >> 12));
            bytes.push(0x80 | ((charCode >> 6) & 0x3f));
            bytes.push(0x80 | (charCode & 0x3f));
        } else if (charCode < 0x200000) {
            bytes.push(0xf0 | (charCode >> 18));
            bytes.push(0x80 | ((charCode >> 12) & 0x3f));
            bytes.push(0x80 | ((charCode >> 6) & 0x3f));
            bytes.push(0x80 | (charCode & 0x3f));
        }
    }
    this.writeBytes(bytes);
};

Buffer.prototype.writeBytes = function (bytes) {
    for (var i = 0; i < bytes.length; i++) {
        this.buffer[this.offset + i] = bytes[i];
    }
    this.offset += bytes.length;
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
