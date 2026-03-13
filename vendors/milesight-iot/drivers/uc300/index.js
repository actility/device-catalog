/**
 * Payload Decoder for The Things Network
 *
 * Copyright 2022 Milesight IoT
 *
 * @product UC300 series
 */

var gpio_in_chns = [0x03, 0x04, 0x05, 0x06];
var gpio_out_chns = [0x07, 0x08];
var pt100_chns = [0x09, 0x0a];
var ai_chns = [0x0b, 0x0c];
var av_chns = [0x0d, 0x0e];

function Decoder(bytes, fport) {
    var decoded = {};

    for (var i = 0; i < bytes.length; ) {
        var channel_id = bytes[i++];
        var channel_type = bytes[i++];

        // GPIO Input
        if (gpio_in_chns.includes(channel_id) && channel_type === 0x00) {
            var id = channel_id - gpio_in_chns[0] + 1;
            decoded[`gpio_in_${id}`] = bytes[i] === 0 ? "off" : "on";
            i += 1;
        }
        // GPIO Output
        else if (gpio_out_chns.includes(channel_id) && channel_type === 0x01) {
            var id = channel_id - gpio_out_chns[0] + 1;
            decoded[`gpio_out_${id}`] = bytes[i] === 0 ? "off" : "on";
            i += 1;
        }
        // GPIO AS counter
        else if (gpio_in_chns.includes(channel_id) && channel_type === 0xc8) {
            var id = channel_id - gpio_in_chns[0] + 1;
            decoded[`counter_${id}`] = readUInt32LE(bytes.slice(i, i + 4));
            i += 4;
        }
        // PT100
        else if (pt100_chns.includes(channel_id) && channel_type === 0x67) {
            var id = channel_id - pt100_chns[0] + 1;
            decoded[`pt100_${id}`] = readInt16LE(bytes.slice(i, i + 2)) / 10;
            i += 2;
        }
        // ADC CHANNEL
        else if (ai_chns.includes(channel_id) && channel_type === 0x02) {
            var id = channel_id - ai_chns[0] + 1;
            decoded[`adc_${id}`] = readUInt32LE(bytes.slice(i, i + 2)) / 100;
            i += 4;
            continue;
        }
        // ADC CHANNEL for voltage
        else if (av_chns.includes(channel_id) && channel_type === 0x02) {
            var id = channel_id - av_chns[0] + 1;
            decoded[`adv_${id}`] = readUInt32LE(bytes.slice(i, i + 2)) / 100;
            i += 4;
            continue;
        }
        // MODBUS
        else if (channel_id === 0xff && channel_type === 0x19) {
            var modbus_chn_id = bytes[i++] + 1;
            var data_length = bytes[i++];
            var data_type = bytes[i++];
            var chn = "chn" + modbus_chn_id;
            switch (data_type) {
                case 0:
                    decoded[chn] = bytes[i] ? "on" : "off";
                    i += 1;
                    break;
                case 1:
                    decoded[chn] = bytes[i];
                    i += 1;
                    break;
                case 2:
                case 3:
                    decoded[chn] = readUInt16LE(bytes.slice(i, i + 2));
                    i += 2;
                    break;
                case 4:
                case 6:
                case 8:
                case 9:
                case 10:
                case 11:
                    decoded[chn] = readUInt32LE(bytes.slice(i, i + 4));
                    i += 4;
                    break;
                case 5:
                case 7:
                    decoded[chn] = readFloatLE(bytes.slice(i, i + 4));
                    i += 4;
                    break;
            }
        }
    }

    return decoded;
}

/* ******************************************
 * bytes to number
 ********************************************/
function readUInt8LE(bytes) {
    return bytes & 0xff;
}

function readInt8LE(bytes) {
    var ref = readUInt8LE(bytes);
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

function readFloatLE(bytes) {
    // JavaScript bitwise operators yield a 32 bits integer, not a float.
    // Assume LSB (least significant byte first).
    var bits = (bytes[3] << 24) | (bytes[2] << 16) | (bytes[1] << 8) | bytes[0];
    var sign = bits >>> 31 === 0 ? 1.0 : -1.0;
    var e = (bits >>> 23) & 0xff;
    var m = e === 0 ? (bits & 0x7fffff) << 1 : (bits & 0x7fffff) | 0x800000;
    var f = sign * m * Math.pow(2, e - 150);
    return f;
}

exports.decodeUplink = decodeUplink;

function decodeUplink(input) {
    var decoded = Decoder(input.bytes, input.fPort);
    return { data: decoded };
}

var __milesightDownlinkCodec = (function () {
/**
 * Payload Encoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product UC300
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

    if ("collection_interval" in payload) {
        encoded = encoded.concat(setCollectionInterval(payload.collection_interval));
    }
    if ("report_interval" in payload) {
        encoded = encoded.concat(setReportInterval(payload.report_interval));
    }
    if ("rejoin" in payload) {
        encoded = encoded.concat(rejoin(payload.rejoin));
    }
    if ("reboot" in payload) {
        encoded = encoded.concat(reboot(payload.reboot));
    }
    if ("sync_time" in payload) {
        encoded = encoded.concat(syncTime(payload.sync_time));
    }
    if ("time_zone" in payload) {
        encoded = encoded.concat(setTimeZone(payload.time_zone));
    }
    if ("timestamp" in payload) {
        encoded = encoded.concat(setTimestamp(payload.timestamp));
    }
    if ("report_status" in payload) {
        encoded = encoded.concat(reportStatus(payload.report_status));
    }
    if ("jitter_config" in payload) {
        encoded = encoded.concat(setJitterConfig(payload.jitter_config));
    }
    if ("gpio_output_1_control" in payload) {
        encoded = encoded.concat(controlOutputStatusWithDuration(1, payload.gpio_output_1_control));
    }
    if ("gpio_output_2_control" in payload) {
        encoded = encoded.concat(controlOutputStatusWithDuration(2, payload.gpio_output_2_control));
    }
    if ("gpio_output_1" in payload) {
        encoded = encoded.concat(controlOutputStatus(1, payload.gpio_output_1));
    }
    if ("gpio_output_2" in payload) {
        encoded = encoded.concat(controlOutputStatus(2, payload.gpio_output_2));
    }

    return encoded;
}

/**
 * Set collection interval
 * @param {number} collection_interval unit: second
 * @example { "collection_interval": 300 }
 */
function setCollectionInterval(collection_interval) {
    if (typeof collection_interval !== "number") {
        throw new Error("collection_interval must be a number");
    }
    if (collection_interval < 0) {
        throw new Error("collection_interval must be greater than 0");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x02);
    buffer.writeUInt16LE(collection_interval);
    return buffer.toBytes();
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
    if (report_interval < 0) {
        throw new Error("report_interval must be greater than 0");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x03);
    buffer.writeUInt16LE(report_interval);
    return buffer.toBytes();
}

/**
 * Set rejoin
 * @param {number} rejoin values: (0: no, 1: yes)
 * @example { "rejoin": 1 }
 */
function rejoin(rejoin) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var rejoin_values = getValues(yes_no_map);
    if (rejoin_values.indexOf(rejoin) === -1) {
        throw new Error("rejoin must be one of " + rejoin_values.join(", "));
    }
    if (getValue(yes_no_map, rejoin) === 0) {
        return [];
    }
    return [0xff, 0x04, 0xff];
}

/**
 * Reboot
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
 * Set timestamp
 * @param {number} timestamp unit: second
 * @example { "timestamp": 1710489600 }
 */
function setTimestamp(timestamp) {
    if (typeof timestamp !== "number") {
        throw new Error("timestamp must be a number");
    }
    if (timestamp < 0) {
        throw new Error("timestamp must be greater than 0");
    }

    var buffer = new Buffer(6);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x11);
    buffer.writeUInt32LE(timestamp);
    return buffer.toBytes();
}

/**
 * set time zone
 * @param {number} time_zone unit: minute, UTC+8 -> 8 * 10 = 80
 * @example { "time_zone": 80 }
 */
function setTimeZone(time_zone) {
    var timezone_map = { "-120": "UTC-12", "-110": "UTC-11", "-100": "UTC-10", "-95": "UTC-9:30", "-90": "UTC-9", "-80": "UTC-8", "-70": "UTC-7", "-60": "UTC-6", "-50": "UTC-5", "-40": "UTC-4", "-35": "UTC-3:30", "-30": "UTC-3", "-20": "UTC-2", "-10": "UTC-1", 0: "UTC", 10: "UTC+1", 20: "UTC+2", 30: "UTC+3", 35: "UTC+3:30", 40: "UTC+4", 45: "UTC+4:30", 50: "UTC+5", 55: "UTC+5:30", 57: "UTC+5:45", 60: "UTC+6", 65: "UTC+6:30", 70: "UTC+7", 80: "UTC+8", 90: "UTC+9", 95: "UTC+9:30", 100: "UTC+10", 105: "UTC+10:30", 110: "UTC+11", 120: "UTC+12", 127: "UTC+12:45", 130: "UTC+13", 140: "UTC+14" };
    var timezone_values = getValues(timezone_map);
    if (timezone_values.indexOf(time_zone) === -1) {
        throw new Error("time_zone must be one of " + timezone_values.join(", "));
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x17);
    buffer.writeInt16LE(getValue(timezone_map, time_zone));
    return buffer.toBytes();
}

/**
 * Sync time
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
    return [0xff, 0x4a, 0xff];
}

/**
 * Report status
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
    return [0xff, 0x94, 0xff];
}

/**
 * Set jitter config
 * @param {object} jitter_config
 * @param {number} jitter_config.all unit: millisecond
 * @param {number} jitter_config.gpio_input_1 unit: millisecond
 * @param {number} jitter_config.gpio_input_2 unit: millisecond
 * @param {number} jitter_config.gpio_input_3 unit: millisecond
 * @param {number} jitter_config.gpio_input_4 unit: millisecond
 * @param {number} jitter_config.gpio_output_1 unit: millisecond
 * @param {number} jitter_config.gpio_output_2 unit: millisecond
 * @example { "jitter_config": { "all": 100 } }
 * @example { "jitter_config": { "gpio_input_1": 1000, "gpio_input_2": 1000 } }
 */
function setJitterConfig(jitter_config) {
    var channel_map = { all: 0, gpio_input_1: 1, gpio_input_2: 2, gpio_input_3: 3, gpio_input_4: 4, gpio_output_1: 5, gpio_output_2: 6 };

    var data = [];
    for (var key in channel_map) {
        if (key in jitter_config) {
            var buffer = new Buffer(7);
            buffer.writeUInt8(0xff);
            buffer.writeUInt8(0x91);
            buffer.writeUInt8(channel_map[key]);
            buffer.writeUInt32LE(jitter_config[key]);
            data.push(buffer.toBytes());
        }
    }
    return data;
}

/**
 * Control output with time
 * @param {object} gpio_output_x_control
 * @param {number} gpio_output_x_control.duration unit: millisecond
 * @param {number} gpio_output_x_control.status values: (0: off, 1: on)
 * @example { "gpio_output_1_control": { "duration": 1000, "status": 1 } }
 * @example { "gpio_output_2_control": { "duration": 1000, "status": 0 } }
 */
function controlOutputStatusWithDuration(gpio_index, gpio_output_x_control) {
    var duration = gpio_output_x_control.duration;
    var status = gpio_output_x_control.status;
    var gpio_chns = [1, 2];
    if (gpio_chns.indexOf(gpio_index) === -1) {
        throw new Error("gpio_output_x_control must be one of " + gpio_chns.join(", "));
    }
    var on_off_map = { 0: "off", 1: "on" };
    var on_off_values = getValues(on_off_map);
    if (on_off_values.indexOf(status) === -1) {
        throw new Error("gpio_output_" + gpio_index + "_control.status must be one of " + on_off_values.join(", "));
    }

    var buffer = new Buffer(7);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x92);
    buffer.writeUInt8(gpio_index);
    buffer.writeUInt8(getValue(on_off_map, status));
    buffer.writeUInt32LE(duration);
    return buffer.toBytes();
}

/**
 * Control output status
 * @param {number} gpio_index values: (1: gpio_output_1, 2: gpio_output_2)
 * @param {number} status values: (0: off, 1: on)
 * @example { "gpio_output_1": 1 }
 * @example { "gpio_output_2": 0 }
 */
function controlOutputStatus(gpio_index, status) {
    var gpio_chns = [1, 2];
    if (gpio_chns.indexOf(gpio_index) === -1) {
        throw new Error("gpio_index must be one of " + gpio_chns.join(", "));
    }
    var on_off_map = { 0: "off", 1: "on" };
    var on_off_values = getValues(on_off_map);
    if (on_off_values.indexOf(status) === -1) {
        throw new Error("gpio_output_" + gpio_index + "_control.status must be one of " + on_off_values.join(", "));
    }

    var channel_ids = [0x07, 0x08];
    var buffer = new Buffer(3);
    buffer.writeUInt8(channel_ids[gpio_index - 1]);
    buffer.writeUInt8(getValue(on_off_map, status));
    buffer.writeUInt8(0xff);
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
    for (var index = 0; index < byteLength; index++) {
        var shift = isLittleEndian ? index << 3 : (byteLength - 1 - index) << 3;
        this.buffer[this.offset + index] = (value & (0xff << shift)) >> shift;
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
