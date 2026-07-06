/**
 * Payload Decoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product EM310-TILT
 */
/**
 * Payload Decoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product EM310-TILT
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

    for (var i = 0; i < bytes.length; ) {
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
        // ANGLE
        else if (channel_id === 0x03 && channel_type === 0xcf) {
            decoded.angle_x = readInt16LE(bytes.slice(i, i + 2)) / 100;
            decoded.angle_y = readInt16LE(bytes.slice(i + 2, i + 4)) / 100;
            decoded.angle_z = readInt16LE(bytes.slice(i + 4, i + 6)) / 100;
            var threshold_value = readUInt8(bytes[i + 6]);
            decoded.threshold_x = readAngleStatus((threshold_value >>> 0) & 0x01);
            decoded.threshold_y = readAngleStatus((threshold_value >>> 1) & 0x01);
            decoded.threshold_z = readAngleStatus((threshold_value >>> 2) & 0x01);
            i += 7;
        }
        // DOWNLINK RESPONSE
        else if (channel_id === 0xfe || channel_id === 0xff) {
            var result = handle_downlink_response(channel_type, bytes, i);
            decoded = Object.assign(decoded, result.data);
            i = result.offset;
        } else {
            break;
        }
    }

    return decoded;
}

function handle_downlink_response(channel_type, bytes, offset) {
    var decoded = {};

    switch (channel_type) {
        case 0x03:
            decoded.report_interval = readUInt16LE(bytes.slice(offset, offset + 2));
            offset += 2;
            break;
        case 0x06:
            var value = readUInt8(bytes[offset]);
            var condition_type = (value >>> 0) & 0x07;
            var alarm_type = (value >>> 3) & 0x07;
            var config = {};
            config.condition = readMathConditionType(condition_type);
            config.threshold_min = readInt16LE(bytes.slice(offset + 1, offset + 3)) / 100;
            config.threshold_max = readInt16LE(bytes.slice(offset + 3, offset + 5)) / 100;
            config.lock_time = readUInt16LE(bytes.slice(offset + 5, offset + 7));
            config.continue_time = readUInt16LE(bytes.slice(offset + 7, offset + 9));
            offset += 9;
            if (alarm_type === 0x01) {
                decoded.angle_x_alarm_config = config;
            } else if (alarm_type === 0x02) {
                decoded.angle_y_alarm_config = config;
            } else if (alarm_type === 0x03) {
                decoded.angle_z_alarm_config = config;
            }
            break;
        case 0x10:
            decoded.reboot = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x28:
            decoded.query_device_status = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x4a:
            decoded.sync_time = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x62:
            decoded.initial_surface = readInitialSurfaceType(bytes[offset]);
            offset += 1;
            break;
        case 0x63:
            decoded.angle_alarm_condition = readUtf8(bytes.slice(offset, offset + 8));
            offset += 8;
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

function readAngleStatus(status) {
    var status_map = { 0: "normal", 1: "trigger" };
    return getValue(status_map, status);
}

function readMathConditionType(type) {
    var type_map = { 0: "disable", 1: "below", 2: "above", 3: "between", 4: "outside", 5: "mutation" };
    return getValue(type_map, type);
}

function readYesNoStatus(status) {
    var status_map = { 0: "no", 1: "yes" };
    return getValue(status_map, status);
}

function readInitialSurfaceType(type) {
    var type_map = { 255: "current_plane", 254: "reset_zero_reference_point", 253: "set_zero_calibration", 252: "clear_zero_calibration" };
    return getValue(type_map, type);
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
    return value & 0xffffffff;
}

function readUtf8(bytes) {
    var str = "";
    var i = 0;
    var byte1, byte2, byte3, byte4;
    while (i < bytes.length) {
        byte1 = bytes[i++];
        if (byte1 === 0x00) {
            break;
        }
        if (byte1 <= 0x7f) {
            str += String.fromCharCode(byte1);
        } else if (byte1 <= 0xdf) {
            byte2 = bytes[i++];
            str += String.fromCharCode(((byte1 & 0x1f) << 6) | (byte2 & 0x3f));
        } else if (byte1 <= 0xef) {
            byte2 = bytes[i++];
            byte3 = bytes[i++];
            str += String.fromCharCode(((byte1 & 0x0f) << 12) | ((byte2 & 0x3f) << 6) | (byte3 & 0x3f));
        } else if (byte1 <= 0xf7) {
            byte2 = bytes[i++];
            byte3 = bytes[i++];
            byte4 = bytes[i++];
            var codepoint = ((byte1 & 0x07) << 18) | ((byte2 & 0x3f) << 12) | ((byte3 & 0x3f) << 6) | (byte4 & 0x3f);
            codepoint -= 0x10000;
            str += String.fromCharCode((codepoint >> 10) + 0xd800);
            str += String.fromCharCode((codepoint & 0x3ff) + 0xdc00);
        }
    }
    return str;
}

function getValue(map, key) {
    if (RAW_VALUE) return key;

    var value = map[key];
    if (!value) value = "unknown";
    return value;
}

//if (!Object.assign) {
    Object.defineProperty(Object, "assign", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (target) {
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
                        // concat array
                        if (Array.isArray(to[nextKey]) && Array.isArray(nextSource[nextKey])) {
                            to[nextKey] = to[nextKey].concat(nextSource[nextKey]);
                        } else {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            return to;
        },
    });
//}


exports.decodeUplink = decodeUplink;

var __milesightDownlinkCodec = (function () {
/**
 * Payload Encoder
 *
 * @product EM310-TILT
 */
function milesightDeviceEncode(payload) {
    var encoded = [];

    if ("reboot" in payload) {
        encoded = encoded.concat(reboot(payload.reboot));
    }
    if ("report_interval" in payload) {
        encoded = encoded.concat(setReportInterval(payload.report_interval));
    }
    if ("query_device_status" in payload) {
        encoded = encoded.concat(queryDeviceStatus(payload.query_device_status));
    }
    if ("sync_time" in payload) {
        encoded = encoded.concat(syncTime(payload.sync_time));
    }
    if ("angle_x_alarm_config" in payload) {
        encoded = encoded.concat(setAngleAlarmConfig(payload.angle_x_alarm_config));
    }
    if ("angle_y_alarm_config" in payload) {
        encoded = encoded.concat(setAngleYAlarmConfig(payload.angle_y_alarm_config));
    }
    if ("angle_z_alarm_config" in payload) {
        encoded = encoded.concat(setAngleZAlarmConfig(payload.angle_z_alarm_config));
    }
    if ("angle_alarm_condition" in payload) {
        encoded = encoded.concat(setAngleAlarmCondition(payload.angle_alarm_condition));
    }
    if ("initial_surface" in payload) {
        encoded = encoded.concat(setInitialSurface(payload.initial_surface));
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
 * query device status
 * @param {number} query_device_status values: (0: no, 1: yes)
 * @example { "query_device_status": 1 }
 */
function queryDeviceStatus(query_device_status) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(query_device_status) === -1) {
        throw new Error("query_device_status must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, query_device_status) === 0) {
        return [];
    }
    return [0xff, 0x28, 0xff];
}

/**
 * sync time
 * @param {number} sync_time values: (0: no, 1: yes)
 * @example { "sync_time": 1 }
 */
function syncTime(sync_time) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(sync_time) === -1) {
        throw new Error("sync_time must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, sync_time) === 0) {
        return [];
    }
    return [0xff, 0x4a, 0x00];
}

/**
 * report interval configuration
 * @param {number} report_interval uint: second, range: [1, 64800]
 * @example { "report_interval": 600 }
 */
function setReportInterval(report_interval) {
    if (typeof report_interval !== "number") {
        throw new Error("report_interval must be a number");
    }
    if (report_interval < 1 || report_interval > 64800) {
        throw new Error("report_interval must be in range [1, 64800]");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x03);
    buffer.writeUInt16LE(report_interval);
    return buffer.toBytes();
}

/**
 * set angle x alarm config
 * @param {object} angle_x_alarm_config
 * @param {number} angle_x_alarm_config.condition values: (0: disable, 1: below, 2: above, 3: between, 4: outside, 5: mutation)
 * @param {number} angle_x_alarm_config.threshold_min unit: °
 * @param {number} angle_x_alarm_config.threshold_max unit: °
 * @param {number} angle_x_alarm_config.lock_time unit: second
 * @param {number} angle_x_alarm_config.continue_time unit: second
 * @example { "angle_x_alarm_config": { "condition": 1, "threshold_min": 10, "threshold_max": 20, "lock_time": 10, "continue_time": 10 } }
 */
function setAngleAlarmConfig(angle_x_alarm_config) {
    var condition = angle_x_alarm_config.condition;
    var threshold_min = angle_x_alarm_config.threshold_min;
    var threshold_max = angle_x_alarm_config.threshold_max;
    var lock_time = angle_x_alarm_config.lock_time;
    var continue_time = angle_x_alarm_config.continue_time;

    var condition_map = { 0: "disable", 1: "below", 2: "above", 3: "between", 4: "outside", 5: "mutation" };
    var condition_values = getValues(condition_map);
    if (condition_values.indexOf(condition) === -1) {
        throw new Error("angle_x_alarm_config.condition must be one of " + condition_values.join(", "));
    }

    var data = 0x00;
    data |= 0x01 << 3; // angle_x
    data |= getValue(condition_map, condition) << 0;

    var buffer = new Buffer(11);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x06);
    buffer.writeUInt8(data);
    buffer.writeInt16LE(threshold_min * 100);
    buffer.writeInt16LE(threshold_max * 100);
    buffer.writeUInt16LE(lock_time);
    buffer.writeUInt16LE(continue_time);
    return buffer.toBytes();
}

/**
 * set angle y alarm config
 * @param {object} angle_y_alarm_config
 * @param {number} angle_y_alarm_config.condition values: (0: disable, 1: below, 2: above, 3: between, 4: outside, 5: mutation)
 * @param {number} angle_y_alarm_config.threshold_min unit: °
 * @param {number} angle_y_alarm_config.threshold_max unit: °
 * @param {number} angle_y_alarm_config.lock_time unit: second
 * @param {number} angle_y_alarm_config.continue_time unit: second
 * @example { "angle_y_alarm_config": { "condition": 1, "threshold_min": 10, "threshold_max": 20, "lock_time": 10, "continue_time": 10 } }
 */
function setAngleYAlarmConfig(angle_y_alarm_config) {
    var condition = angle_y_alarm_config.condition;
    var threshold_min = angle_y_alarm_config.threshold_min;
    var threshold_max = angle_y_alarm_config.threshold_max;
    var lock_time = angle_y_alarm_config.lock_time;
    var continue_time = angle_y_alarm_config.continue_time;

    var condition_map = { 0: "disable", 1: "below", 2: "above", 3: "between", 4: "outside", 5: "mutation" };
    var condition_values = getValues(condition_map);
    if (condition_values.indexOf(condition) === -1) {
        throw new Error("angle_y_alarm_config.condition must be one of " + condition_values.join(", "));
    }

    var data = 0x00;
    data |= 0x02 << 3; // angle_y
    data |= getValue(condition_map, condition) << 0;

    var buffer = new Buffer(11);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x06);
    buffer.writeUInt8(data);
    buffer.writeInt16LE(threshold_min * 100);
    buffer.writeInt16LE(threshold_max * 100);
    buffer.writeUInt16LE(lock_time);
    buffer.writeUInt16LE(continue_time);
    return buffer.toBytes();
}

/**
 * set angle z alarm config
 * @param {object} angle_z_alarm_config
 * @param {number} angle_z_alarm_config.condition values: (0: disable, 1: below, 2: above, 3: between, 4: outside, 5: mutation)
 * @param {number} angle_z_alarm_config.threshold_min unit: °
 * @param {number} angle_z_alarm_config.threshold_max unit: °
 * @param {number} angle_z_alarm_config.lock_time unit: second
 * @param {number} angle_z_alarm_config.continue_time unit: second
 * @example { "angle_z_alarm_config": { "condition": 1, "threshold_min": 10, "threshold_max": 20, "lock_time": 10, "continue_time": 10 } }
 */
function setAngleZAlarmConfig(angle_z_alarm_config) {
    var condition = angle_z_alarm_config.condition;
    var threshold_min = angle_z_alarm_config.threshold_min;
    var threshold_max = angle_z_alarm_config.threshold_max;
    var lock_time = angle_z_alarm_config.lock_time;
    var continue_time = angle_z_alarm_config.continue_time;

    var condition_map = { 0: "disable", 1: "below", 2: "above", 3: "between", 4: "outside", 5: "mutation" };
    var condition_values = getValues(condition_map);
    if (condition_values.indexOf(condition) === -1) {
        throw new Error("angle_z_alarm_config.condition must be one of " + condition_values.join(", "));
    }

    var data = 0x00;
    data |= 0x03 << 3; // angle_z
    data |= getValue(condition_map, condition) << 0;

    var buffer = new Buffer(11);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x06);
    buffer.writeUInt8(data);
    buffer.writeInt16LE(threshold_min * 100);
    buffer.writeInt16LE(threshold_max * 100);
    buffer.writeUInt16LE(lock_time);
    buffer.writeUInt16LE(continue_time);
    return buffer.toBytes();
}

/**
 * set angle alarm condition
 * @param {string} angle_alarm_condition
 * @example { "angle_alarm_condition": "X&Y|Z" }
 */
function setAngleAlarmCondition(angle_alarm_condition) {
    var buffer = new Buffer(10);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x63);
    buffer.writeUtf8(angle_alarm_condition);
    return buffer.toBytes();
}

/**
 * set initial surface
 * @param {number} initial_surface values: (255: current_plane, 254: reset_zero_reference_point, 253: set_zero_calibration, 252: clear_zero_calibration)
 * @example { "initial_surface": 255 }
 */
function setInitialSurface(initial_surface) {
    var mode_map = { 255: "current_plane", 254: "reset_zero_reference_point", 253: "set_zero_calibration", 252: "clear_zero_calibration" };
    var mode_values = getValues(mode_map);
    if (mode_values.indexOf(initial_surface) === -1) {
        throw new Error("initial_surface must be one of " + mode_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x62);
    buffer.writeUInt8(getValue(mode_map, initial_surface));
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


Buffer.prototype.writeBytes = function (bytes) {
    for (var i = 0; i < bytes.length; i++) {
        this.buffer[this.offset + i] = bytes[i];
    }
    this.offset += bytes.length;
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

Buffer.prototype.toBytes = function () {
    return this.buffer;
};

    return { encodeDownlink: encodeDownlink, Encode: Encode, Encoder: Encoder };
})();

function encodeDownlink(input) {
    var result = __milesightDownlinkCodec.encodeDownlink(input);
    if (result && typeof input.fPort !== 'undefined' && typeof result.fPort === 'undefined') { result.fPort = input.fPort; } else { result.fPort = 100; }
    return result;
}
function Encode(fPort, obj) { return __milesightDownlinkCodec.Encode(fPort, obj); }
function Encoder(obj, port) { return __milesightDownlinkCodec.Encoder(obj, port); }

exports.encodeDownlink = encodeDownlink;

