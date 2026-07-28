/**
 * Payload Decoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product WS558
 */
/**
 * Payload Decoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product WS558
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
        else if (channel_id === 0x06 && channel_type === 0x83) {
            decoded.power_consumption = readUInt32LE(bytes.slice(i, i + 4));
            i += 4;
        }
        // TOTAL CURRENT
        else if (channel_id === 0x07 && channel_type === 0xc9) {
            decoded.total_current = readUInt16LE(bytes.slice(i, i + 2));
            i += 2;
        }
        // SWITCH STATUS
        else if (channel_id === 0x08 && channel_type === 0x31) {
            var switchFlags = bytes[i + 1];

            // output all switch status
            for (var idx = 0; idx < 8; idx++) {
                var switchTag = "switch_" + (idx + 1);
                decoded[switchTag] = readSwitchStatus((switchFlags >> idx) & 1);
            }

            i += 2;
        }
        // POWER CONSUMPTION ENABLE
        else if (channel_id === 0xff && channel_type === 0x26) {
            decoded.power_consumption_enable = readEnableStatus(bytes[i]);
            i += 1;
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
        case 0x10:
            decoded.reboot = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x28:
            decoded.report_status = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x03:
            decoded.report_interval = readUInt16LE(bytes.slice(offset, offset + 2));
            offset += 2;
            break;
        case 0x23:
            decoded.cancel_delay_task = readUInt8(bytes[offset]);
            // skip 1 byte
            offset += 2;
            break;
        case 0x26:
            decoded.power_consumption_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x27:
            decoded.clear_power_consumption = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x32:
            decoded.delay_task = {};
            decoded.delay_task.task_id = readUInt8(bytes[offset]);
            decoded.delay_task.delay_time = readUInt16LE(bytes.slice(offset + 1, offset + 3));
            var mask = readUInt8(bytes[offset + 3]);
            var status = readUInt8(bytes[offset + 4]);
            offset += 5;
            var switch_bit_offset = { switch_1: 0, switch_2: 1, switch_3: 2, switch_4: 3, switch_5: 4, switch_6: 5, switch_7: 6, switch_8: 7 };
            for (var key in switch_bit_offset) {
                if ((mask >> switch_bit_offset[key]) & 0x01) {
                    decoded.delay_task[key] = readSwitchStatus((status >> switch_bit_offset[key]) & 0x01);
                }
            }
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
    var status_map = {
        0: "normal",
        1: "reset",
    };
    return getValue(status_map, status);
}

function readDeviceStatus(status) {
    var status_map = {
        0: "off",
        1: "on",
    };
    return getValue(status_map, status);
}

function readSwitchStatus(status) {
    var status_map = {
        0: "off",
        1: "on",
    };
    return getValue(status_map, status);
}

function readEnableStatus(status) {
    var status_map = { 0: "disable", 1: "enable" };
    return getValue(status_map, status);
}

function readYesNoStatus(status) {
    var yes_no_map = { 0: "no", 1: "yes" };
    return getValue(yes_no_map, status);
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
 * @product WS558
 */
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
    if ("switch_1" in payload || "switch_2" in payload || "switch_3" in payload || "switch_4" in payload || "switch_5" in payload || "switch_6" in payload || "switch_7" in payload || "switch_8" in payload) {
        if ("delay_time" in payload) {
            encoded = encoded.concat(controlSwitchWithDelay(payload));
        } else {
            encoded = encoded.concat(controlSwitch(payload));
        }
    }
    if ("cancel_delay_task" in payload) {
        encoded = encoded.concat(cancelDelayTask(payload.cancel_delay_task));
    }
    if ("power_consumption_enable" in payload) {
        encoded = encoded.concat(setPowerConsumptionEnable(payload.power_consumption_enable));
    }
    if ("clear_power_consumption" in payload) {
        encoded = encoded.concat(clearPowerConsumption(payload.clear_power_consumption));
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
 * Set report interval
 * @param {number} report_interval unit: second
 * @example { "report_interval": 300 }
 */
function setReportInterval(report_interval) {
    if (typeof report_interval !== "number") {
        throw new Error("report_interval must be a number");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x03);
    buffer.writeUInt16LE(report_interval);
    return buffer.toBytes();
}

/**
 * Control switch
 * @param {string} switch_1 values: (0: off, 1: on)
 * @param {string} switch_2 values: (0: off, 1: on)
 * @param {string} switch_3 values: (0: off, 1: on)
 * @param {string} switch_4 values: (0: off, 1: on)
 * @param {string} switch_5 values: (0: off, 1: on)
 * @param {string} switch_6 values: (0: off, 1: on)
 * @param {string} switch_7 values: (0: off, 1: on)
 * @param {string} switch_8 values: (0: off, 1: on)
 * @example { "switch_1": 1, "switch_2": 0, "switch_3": 1, "switch_4": 0, "switch_5": 1, "switch_6": 0, "switch_7": 1, "switch_8": 0 }
 */
function controlSwitch(switch_control) {
    var on_off_map = { 0: "off", 1: "on" };
    var on_off_values = getValues(on_off_map);

    var switch_bit_offset = { switch_1: 0, switch_2: 1, switch_3: 2, switch_4: 3, switch_5: 4, switch_6: 5, switch_7: 6, switch_8: 7 };

    var mask = 0;
    var status = 0;
    for (var key in switch_bit_offset) {
        if (key in switch_control) {
            if (on_off_values.indexOf(switch_control[key]) === -1) {
                throw new Error(key + " must be one of " + on_off_values.join(", "));
            }
            mask |= 1 << switch_bit_offset[key];
            status |= getValue(on_off_map, switch_control[key]) << switch_bit_offset[key];
        }
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0x08);
    buffer.writeUInt8(mask);
    buffer.writeUInt8(status);
    return buffer.toBytes();
}

/**
 * Control switch with delay
 * @param {object} delay_task
 * @param {number} delay_task.task_id value: (0: force control, > 0: task_id)
 * @param {number} delay_task.delay_time unit: second
 * @param {string} delay_task.switch_1 values: (0: off, 1: on)
 * @param {string} delay_task.switch_2 values: (0: off, 1: on)
 * @param {string} delay_task.switch_3 values: (0: off, 1: on)
 * @param {string} delay_task.switch_4 values: (0: off, 1: on)
 * @param {string} delay_task.switch_5 values: (0: off, 1: on)
 * @param {string} delay_task.switch_6 values: (0: off, 1: on)
 * @param {string} delay_task.switch_7 values: (0: off, 1: on)
 * @param {string} delay_task.switch_8 values: (0: off, 1: on)
 * @example { "delay_task": { "task_id": 1, "delay_time": 300, "switch_1": 1, "switch_2": 0, "switch_3": 1, "switch_4": 0, "switch_5": 1, "switch_6": 0, "switch_7": 1, "switch_8": 0 } }
 */
function controlSwitchWithDelay(delay_task) {
    var task_id = delay_task.task_id;
    var delay_time = delay_task.delay_time;

    var on_off_map = { 0: "off", 1: "on" };
    var on_off_values = getValues(on_off_map);

    var mask = 0;
    var status = 0;
    var switch_bit_offset = { switch_1: 0, switch_2: 1, switch_3: 2, switch_4: 3, switch_5: 4, switch_6: 5, switch_7: 6, switch_8: 7 };
    for (var key in switch_bit_offset) {
        if (key in delay_task) {
            var switch_status = delay_task[key];
            if (on_off_values.indexOf(switch_status) === -1) {
                throw new Error(key + " must be one of " + on_off_values.join(", "));
            }
            mask |= 1 << switch_bit_offset[key];
            status |= getValue(on_off_map, switch_status) << switch_bit_offset[key];
        }
    }

    if (task_id < 0) {
        throw new Error("task_id must be greater than 0");
    }
    if (delay_time < 0) {
        throw new Error("delay_time must be greater than 0");
    }

    var buffer = new Buffer(7);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x32);
    buffer.writeUInt8(task_id);
    buffer.writeUInt16LE(delay_time);
    buffer.writeUInt8(mask);
    buffer.writeUInt8(status);
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

    if (cancel_delay_task === 0) {
        return [];
    }
    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x23);
    buffer.writeUInt8(cancel_delay_task);
    buffer.writeUInt8(0xff);
    return buffer.toBytes();
}

/**
 * Set power consumption enable
 * @param {number} power_consumption_enable values: (0: disable, 1: enable)
 * @example { "power_consumption_enable": 1 }
 */
function setPowerConsumptionEnable(power_consumption_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(power_consumption_enable) === -1) {
        throw new Error("power_consumption_enable must one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x26);
    buffer.writeUInt8(getValue(enable_map, power_consumption_enable));
    return buffer.toBytes();
}

/**
 * clear power consumption
 * @param {number} clear_power_consumption values: (0: no, 1: yes)
 * @example payload: { "clear_power_consumption": 1 }
 */
function clearPowerConsumption(clear_power_consumption) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(clear_power_consumption) === -1) {
        throw new Error("clear_power_consumption must be one of: " + yes_no_values.join(", "));
    }

    if (clear_power_consumption === 0) {
        return [];
    }
    return [0xff, 0x27, 0xff];
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

    // These three names are not defined inside this IIFE: written bare, they
    // resolved to the hoisted outer functions, which call back into this object.
    // encodeDownlink recursed until the stack blew. Bind them to the codec's own
    // encoder instead.
    return {
        encodeDownlink: function (input) { return { bytes: milesightDeviceEncode(input.data) }; },
        Encode: function (fPort, obj) { return milesightDeviceEncode(obj); },
        Encoder: function (obj, port) { return milesightDeviceEncode(obj); },
    };
})();

function encodeDownlink(input) {
    var result = __milesightDownlinkCodec.encodeDownlink(input);
    if (result && typeof input.fPort !== "undefined" && typeof result.fPort === "undefined") {
        result.fPort = input.fPort;
    } else {
        result.fPort = 100;
    }
    return result;
}

function Encode(fPort, obj) { return __milesightDownlinkCodec.Encode(fPort, obj); }
function Encoder(obj, port) { return __milesightDownlinkCodec.Encoder(obj, port); }

exports.encodeDownlink = encodeDownlink;
