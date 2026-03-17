/**
 * Payload Decoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product WS52x
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
        // VOLTAGE
        else if (channel_id === 0x03 && channel_type === 0x74) {
            decoded.voltage = readUInt16LE(bytes.slice(i, i + 2)) / 10;
            i += 2;
        }
        // ACTIVE POWER
        else if (channel_id === 0x04 && channel_type === 0x80) {
            decoded.active_power = readUInt32LE(bytes.slice(i, i + 4));
            i += 4;
        }
        // POWER FACTOR
        else if (channel_id === 0x05 && channel_type === 0x81) {
            decoded.power_factor = readUInt8(bytes[i]);
            i += 1;
        }
        // POWER CONSUMPTION
        else if (channel_id === 0x06 && channel_type == 0x83) {
            decoded.power_consumption = readUInt32LE(bytes.slice(i, i + 4));
            i += 4;
        }
        // CURRENT
        else if (channel_id === 0x07 && channel_type == 0xc9) {
            decoded.current = readUInt16LE(bytes.slice(i, i + 2));
            i += 2;
        }
        // SOCKET STATUS
        else if (channel_id === 0x08 && channel_type == 0x70) {
            var data = bytes[i++];
            decoded.socket_status = readSocketStatus(data & 0x01);
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
        case 0x10:
            decoded.reboot = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x28:
            decoded.report_status = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x22:
            // skip first byte
            decoded.delay_time = readUInt16LE(bytes.slice(offset + 1, offset + 3));
            decoded.socket_status = readOnOffStatus(bytes[offset + 3] & 0x0F);
            offset += 4;
            break;
        case 0x23:
            decoded.cancel_delay_task = readUInt8(bytes[offset]);
            // skip next byte
            offset += 2;
            break;
        case 0x24:
            decoded.current_alarm_config = {};
            decoded.current_alarm_config.enable = readEnableStatus(bytes[offset]);
            decoded.current_alarm_config.threshold = readUInt8(bytes[offset + 1]);
            offset += 2;
            break;
        case 0x25:
            var child_lock_data = readUInt16LE(bytes.slice(offset, offset + 2));
            decoded.child_lock_config = {};
            decoded.child_lock_config.enable = readEnableStatus((child_lock_data >>> 15) & 0x01);
            decoded.child_lock_config.lock_time = child_lock_data & 0x7fff;
            offset += 2;
            break;
        case 0x26:
            decoded.power_consumption_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x27:
            decoded.reset_power_consumption = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x2c:
            decoded.report_attribute = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x2f:
            decoded.led_indicator_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x30:
            decoded.over_current_protection = {};
            decoded.over_current_protection.enable = readEnableStatus(bytes[offset]);
            decoded.over_current_protection.trip_current = readUInt8(bytes[offset + 1]);
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

function readSocketStatus(status) {
    var on_off_map = { 0: "off", 1: "on" };
    return getValue(on_off_map, status);
}

function readEnableStatus(status) {
    var status_map = { 0: "disable", 1: "enable" };
    return getValue(status_map, status);
}

function readYesNoStatus(status) {
    var yes_no_map = { 0: "no", 1: "yes" };
    return getValue(yes_no_map, status);
}

function readOnOffStatus(status) {
    var on_off_map = { 0: "off", 1: "on" };
    return getValue(on_off_map, status);
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

function readUInt32LE(bytes) {
    var value = (bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
    return (value & 0xffffffff) >>> 0;
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
 * Copyright 2025 Milesight IoT
 *
 * @product WS52x
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
    if ("report_attribute" in payload) {
        encoded = encoded.concat(reportAttribute(payload.report_attribute));
    }
    if ("report_interval" in payload) {
        encoded = encoded.concat(setReportInterval(payload.report_interval));
    }
    if ("socket_status" in payload) {
        if ("delay_time" in payload) {
            encoded = encoded.concat(socketStatusWithDelay(payload.socket_status, payload.delay_time));
        } else {
            encoded = encoded.concat(socketStatus(payload.socket_status));
        }
    }
    if ("cancel_delay_task" in payload) {
        encoded = encoded.concat(cancelDelayTask(payload.cancel_delay_task));
    }
    if ("over_current_protection" in payload) {
        encoded = encoded.concat(setOverCurrentProtection(payload.over_current_protection));
    }
    if ("current_alarm_config" in payload) {
        encoded = encoded.concat(setCurrentAlarmConfig(payload.current_alarm_config));
    }
    if ("child_lock_config" in payload) {
        encoded = encoded.concat(setChildLock(payload.child_lock_config));
    }
    if ("power_consumption_enable" in payload) {
        encoded = encoded.concat(powerConsumptionEnable(payload.power_consumption_enable));
    }
    if ("reset_power_consumption" in payload) {
        encoded = encoded.concat(resetPowerConsumption(payload.reset_power_consumption));
    }
    if ("led_indicator_enable" in payload) {
        encoded = encoded.concat(setLedEnable(payload.led_indicator_enable));
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
 * report attribute
 * @param {number} report_attribute values: (0: no, 1: yes)
 * @example { "report_attribute": 1 }
 */
function reportAttribute(report_attribute) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(report_attribute) === -1) {
        throw new Error("report_attribute must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, report_attribute) === 0) {
        return [];
    }
    return [0xff, 0x2c, 0xff];
}

/**
 * set socket status
 * @param {string} socket_status values: (0: off, 1: on)
 * @example { "socket_status": 0 }
 */
function socketStatus(socket_status) {
    var on_off_map = { 0: "off", 1: "on" };
    var on_off_values = getValues(on_off_map);
    if (on_off_values.indexOf(socket_status) === -1) {
        throw new Error("socket_status must be one of " + on_off_values.join(", "));
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0x08);
    buffer.writeUInt8(getValue(on_off_map, socket_status));
    buffer.writeUInt16LE(0xffff);
    return buffer.toBytes();
}

/**
 * control socket status with delay
 * @param {number} socket_status values: (0: off, 1: on)
 * @param {number} delay_time unit: second, range: [0, 65535]
 * @example { "socket_status": 1, "delay_time": 10 }
 */
function socketStatusWithDelay(socket_status, delay_time) {
    var on_off_map = { 0: "off", 1: "on" };
    var on_off_values = getValues(on_off_map);
    if (on_off_values.indexOf(socket_status) === -1) {
        throw new Error("socket_status must be one of " + on_off_values.join(", "));
    }
    if (typeof delay_time !== "number") {
        throw new Error("delay_time must be a number");
    }
    if (delay_time < 0 || delay_time > 65535) {
        throw new Error("delay_time must be in the range [0, 65535]");
    }

    var data = (0x01 << 4) | getValue(on_off_map, socket_status);
    var buffer = new Buffer(6);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x22);
    buffer.writeUInt8(0x00);
    buffer.writeUInt16LE(delay_time);
    buffer.writeUInt8(data);
    return buffer.toBytes();
}

/**
 * cancel delay task
 * @param {number} cancel_delay_task task_id
 * @example { "cancel_delay_task": 1 }
 */
function cancelDelayTask(cancel_delay_task) {
    if (typeof cancel_delay_task !== "number") {
        throw new Error("cancel_delay_task must be a number");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x23);
    buffer.writeUInt8(cancel_delay_task);
    buffer.writeUInt8(0xff);
    return buffer.toBytes();
}

/**
 * update report interval
 * @param {number} report_interval uint: second
 * @example payload: { "report_interval": 600 }
 */
function setReportInterval(report_interval) {
    if (typeof report_interval !== "number") {
        throw new Error("report_interval must be a number");
    }
    if (report_interval < 1) {
        throw new Error("report_interval must be greater than 1");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x03);
    buffer.writeUInt16LE(report_interval);
    return buffer.toBytes();
}

/**
 * set over_current protection configuration
 * @param {object} over_current_protection
 * @param {number} over_current_protection.enable values: (0: disable, 1: enable)
 * @param {number} over_current_protection.trip_current unit: A
 * @example { "over_current_protection": { "enable": 1, "trip_current": 10 } }
 */
function setOverCurrentProtection(over_current_protection) {
    var enable = over_current_protection.enable;
    var trip_current = over_current_protection.trip_current;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("over_current_protection.enable must be one of " + enable_values.join(", "));
    }
    if (typeof trip_current !== "number") {
        throw new Error("over_current_protection.trip_current must be a number");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x30);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt8(trip_current);
    return buffer.toBytes();
}

/**
 * set current alarm configuration
 * @param {object} current_alarm_config
 * @param {number} current_alarm_config.enable values: (0: disable, 1: enable)
 * @param {number} current_alarm_config.threshold unit: A
 * @example { "current_alarm_config": { "enable": 1, "threshold": 10 } }
 */
function setCurrentAlarmConfig(current_alarm_config) {
    var enable = current_alarm_config.enable;
    var threshold = current_alarm_config.threshold;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("current_alarm_config.enable must be one of " + enable_values.join(", "));
    }
    if (typeof threshold !== "number") {
        throw new Error("current_alarm_config.threshold must be a number");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x24);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt8(threshold);
    return buffer.toBytes();
}

/**
 * set child lock configuration
 * @param {object} child_lock_config
 * @param {number} child_lock_config.enable values: (0: disable, 1: enable)
 * @param {number} child_lock_config.lock_time unit: min
 * @example { "child_lock_config": { "enable": 1, "lock_time": 10 } }
 */
function setChildLock(child_lock_config) {
    var enable = child_lock_config.enable;
    var lock_time = child_lock_config.lock_time;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("child_lock_config.enable must be one of " + enable_values.join(", "));
    }
    if (typeof lock_time !== "number") {
        throw new Error("child_lock_config.lock_time must be a number");
    }

    var data = (getValue(enable_map, enable) << 15) + lock_time;
    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x25);
    buffer.writeUInt16LE(data);
    return buffer.toBytes();
}

/**
 * set statistics enable configuration
 * @param {number} power_consumption_enable values: (0: disable, 1: enable)
 * @example { "power_consumption_enable": 1 }
 */
function powerConsumptionEnable(power_consumption_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(power_consumption_enable) === -1) {
        throw new Error("power_consumption_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x26);
    buffer.writeUInt8(getValue(enable_map, power_consumption_enable));
    return buffer.toBytes();
}

/**
 * reset power consumption
 * @param {number} reset_power_consumption values: (0: no, 1: yes)
 * @example { "reset_power_consumption": 1 }
 */
function resetPowerConsumption(reset_power_consumption) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(reset_power_consumption) === -1) {
        throw new Error("reset_power_consumption must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, reset_power_consumption) === 0) {
        return [];
    }
    return [0xff, 0x27, 0xff];
}

/**
 * set led enable configuration
 * @param {number} led_indicator_enable values: (0: disable, 1: enable)
 * @example { "led_indicator_enable": 1 }
 */
function setLedEnable(led_indicator_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(led_indicator_enable) === -1) {
        throw new Error("led_indicator_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x2f);
    buffer.writeUInt8(getValue(enable_map, led_indicator_enable));
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
    this._write(value, 1, 1);
    this.offset += 1;
};

Buffer.prototype.writeInt8 = function (value) {
    this._write(value < 0 ? value + 0x100 : value, 1, 1);
    this.offset += 1;
};

Buffer.prototype.writeUInt16LE = function (value) {
    this._write(value, 2, 1);
    this.offset += 2;
};

Buffer.prototype.writeInt16LE = function (value) {
    this._write(value < 0 ? value + 0x10000 : value, 2, 1);
    this.offset += 2;
};

Buffer.prototype.writeUInt32LE = function (value) {
    this._write(value, 4, 1);
    this.offset += 4;
};

Buffer.prototype.writeInt32LE = function (value) {
    this._write(value < 0 ? value + 0x100000000 : value, 4, 1);
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
