/**
 * Payload Decoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product UC100 series
 */
/**
 * Payload Decoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product UC100
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
        // MODBUS
        else if (channel_id === 0xff && channel_type === 0x19) {
            var modbus_chn_id = readUInt8(bytes[i++]) + 1;
            readUInt8(bytes[i++]); // skip data_length
            var data_def = readUInt8(bytes[i++]);
            var sign = (data_def >>> 7) & 0x01;
            var data_type = data_def & 0x7f; // 0b01111111
            var modbus_chn_name = "modbus_chn_" + modbus_chn_id;

            switch (data_type) {
                case 0:
                case 1:
                    decoded[modbus_chn_name] = readOnOffStatus(bytes[i]);
                    i += 1;
                    break;
                case 2:
                case 3:
                    decoded[modbus_chn_name] = sign ? readInt16LE(bytes.slice(i, i + 2)) : readUInt16LE(bytes.slice(i, i + 2));
                    i += 2;
                    break;
                case 4:
                case 6:
                    decoded[modbus_chn_name] = sign ? readInt32LE(bytes.slice(i, i + 4)) : readUInt32LE(bytes.slice(i, i + 4));
                    i += 4;
                    break;
                case 8:
                case 9:
                case 10:
                case 11:
                    decoded[modbus_chn_name] = sign ? readInt16LE(bytes.slice(i, i + 2)) : readUInt16LE(bytes.slice(i, i + 2));
                    i += 4;
                    break;
                case 5:
                case 7:
                    decoded[modbus_chn_name] = readFloatLE(bytes.slice(i, i + 4));
                    i += 4;
                    break;
            }
        }
        // MODBUS READ ERROR
        else if (channel_id === 0xff && channel_type === 0x15) {
            var modbus_chn_id = readUInt8(bytes[i]) + 1;
            var channel_name = "modbus_chn_" + modbus_chn_id + "_alarm";
            decoded[channel_name] = readSensorStatus(1);
            i += 1;
        }
        // MODBUS ALARM (v1.7+)
        else if (channel_id === 0xff && channel_type === 0xee) {
            var chn_def = readUInt8(bytes[i++]);
            readUInt8(bytes[i++]); // skip data_length
            var data_def = readUInt8(bytes[i++]);

            var modbus_chn_id = (chn_def & 0x3f) + 1;
            var modbus_alarm_value = chn_def >>> 6;
            var sign = (data_def >>> 7) & 0x01;
            var data_type = data_def & 0x7f;

            var modbus_chn_name = "modbus_chn_" + modbus_chn_id;
            decoded[modbus_chn_name + "_alarm"] = readModbusAlarmType(modbus_alarm_value);
            switch (data_type) {
                case 0:
                case 1:
                    decoded[modbus_chn_name] = readOnOffStatus(bytes[i]);
                    i += 1;
                    break;
                case 2:
                case 3:
                    decoded[modbus_chn_name] = sign ? readInt16LE(bytes.slice(i, i + 2)) : readUInt16LE(bytes.slice(i, i + 2));
                    i += 2;
                    break;
                case 4:
                case 6:
                    decoded[modbus_chn_name] = sign ? readInt32LE(bytes.slice(i, i + 4)) : readUInt32LE(bytes.slice(i, i + 4));
                    i += 4;
                    break;
                case 8:
                case 9:
                case 10:
                case 11:
                    decoded[modbus_chn_name] = sign ? readInt16LE(bytes.slice(i, i + 2)) : readUInt16LE(bytes.slice(i, i + 2));
                    i += 4;
                    break;
                case 5:
                case 7:
                    decoded[modbus_chn_name] = readFloatLE(bytes.slice(i, i + 4));
                    i += 4;
                    break;
            }
        }
        // MODBUS MUTATION (v1.9+)
        else if (channel_id === 0xf9 && channel_type === 0x5f) {
            var chn_def = readUInt8(bytes[i]);
            var modbus_chn_id = (chn_def & 0x3f) + 1;
            var modbus_alarm_value = chn_def >>> 6;
            var modbus_chn_name = "modbus_chn_" + modbus_chn_id;
            if (modbus_alarm_value === 3) {
                decoded[modbus_chn_name + "_alarm"] = readModbusAlarmType(modbus_alarm_value);
                decoded[modbus_chn_name + "_mutation"] = readFloatLE(bytes.slice(i + 3, i + 7));
            }
            i += 7;
        }
        // MODBUS HISTORY (v1.7+)
        else if (channel_id === 0x20 && channel_type === 0xce) {
            var timestamp = readUInt32LE(bytes.slice(i, i + 4));
            var modbus_chn_id = readUInt8(bytes[i + 4]) + 1;
            var data_def = readUInt8(bytes[i + 5]);
            var sign = (data_def >>> 7) & 0x01;
            var data_type = (data_def >> 2) & 0x1f;
            var read_status = (data_def >>> 1) & 0x01;
            i += 6;

            var data = {};
            data.timestamp = timestamp;
            var modbus_chn_name = "modbus_chn_" + modbus_chn_id;
            // READ FAILED
            if (read_status === 0) {
                data[modbus_chn_name + "_alarm"] = readSensorStatus(1);
                i += 4;
            } else {
                switch (data_type) {
                    case 0: // MB_REG_COIL
                    case 1: // MB_REG_DISCRETE
                        data[modbus_chn_name] = readOnOffStatus(bytes[i]);
                        i += 4;
                        break;
                    case 2: // MB_REG_INPUT_AB
                    case 3: // MB_REG_INPUT_BA
                    case 14: // MB_REG_HOLD_INT16_AB
                    case 15: // MB_REG_HOLD_INT16_BA
                        data[modbus_chn_name] = sign ? readInt32LE(bytes.slice(i, i + 4)) : readUInt32LE(bytes.slice(i, i + 4));
                        i += 4;
                        break;
                    case 4: // MB_REG_INPUT_INT32_ABCD
                    case 5: // MB_REG_INPUT_INT32_BADC
                    case 6: // MB_REG_INPUT_INT32_CDAB
                    case 7: // MB_REG_INPUT_INT32_DCBA
                    case 16: // MB_REG_HOLD_INT32_ABCD
                    case 17: // MB_REG_HOLD_INT32_BADC
                    case 18: // MB_REG_HOLD_INT32_CDAB
                    case 19: // MB_REG_HOLD_INT32_DCBA
                        data[modbus_chn_name] = sign ? readInt32LE(bytes.slice(i, i + 4)) : readUInt32LE(bytes.slice(i, i + 4));
                        i += 4;
                        break;
                    case 8: // MB_REG_INPUT_INT32_AB
                    case 9: // MB_REG_INPUT_INT32_CD
                    case 20: // MB_REG_HOLD_INT32_AB
                    case 21: // MB_REG_HOLD_INT32_CD
                        data[modbus_chn_name] = sign ? readInt16LE(bytes.slice(i, i + 2)) : readUInt16LE(bytes.slice(i, i + 2));
                        i += 4;
                        break;
                    case 10: // MB_REG_INPUT_FLOAT_ABCD
                    case 11: // MB_REG_INPUT_FLOAT_BADC
                    case 12: // MB_REG_INPUT_FLOAT_CDAB
                    case 13: // MB_REG_INPUT_FLOAT_DCBA
                    case 22: // MB_REG_HOLD_FLOAT_ABCD
                    case 23: // MB_REG_HOLD_FLOAT_BADC
                    case 24: // MB_REG_HOLD_FLOAT_CDAB
                    case 25: // MB_REG_HOLD_FLOAT_DCBA
                        data[modbus_chn_name] = readFloatLE(bytes.slice(i, i + 4));
                        i += 4;
                        break;
                }
            }

            decoded.history = decoded.history || [];
            decoded.history.push(data);
        }
        // CUSTOM MESSAGE HISTORY (v1.7+)
        else if (channel_id === 0x20 && channel_type === 0xcd) {
            var timestamp = readUInt32LE(bytes.slice(i, i + 4));
            var msg_length = readUInt8(bytes[i + 4]);
            var msg = readAscii(bytes.slice(i + 5, i + 5 + msg_length));
            i += 5 + msg_length;

            var data = {};
            data.timestamp = timestamp;
            data.custom_message = msg;

            decoded.history = decoded.history || [];
            decoded.history.push(data);
        }
        // DOWNLINK RESPONSE
        else if (channel_id === 0xfe || channel_id === 0xff) {
            var result = handle_downlink_response(channel_type, bytes, i);
            decoded = Object.assign(decoded, result.data);
            i = result.offset;
        }
        // CUSTOM MESSAGE
        else {
            decoded.custom_message = readAscii(bytes.slice(i - 2, bytes.length));
            i = bytes.length;
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
        case 0x04:
            decoded.confirm_mode_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x10:
            decoded.reboot = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x27:
            decoded.clear_history = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x68:
            decoded.history_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x69:
            decoded.retransmit_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x6a:
            var data = readUInt8(bytes[offset]);
            if (data === 0x00) {
                decoded.retransmit_interval = readUInt16LE(bytes.slice(offset + 1, offset + 3));
            } else if (data === 0x01) {
                decoded.resend_interval = readUInt16LE(bytes.slice(offset + 1, offset + 3));
            }
            offset += 3;
            break;
        case 0xef:
            var data = readUInt8(bytes[offset]);
            // REMOVE MODBUS CHANNELS
            if (data === 0x00) {
                var channel_id = readUInt8(bytes[offset + 1]);
                var remove_modbus_channels = { channel_id: channel_id };
                offset += 4;
                decoded.remove_modbus_channels = decoded.remove_modbus_channels || [];
                decoded.remove_modbus_channels.push(remove_modbus_channels);
            }
            // ADD MODBUS CHANNELS
            else if (data === 0x01) {
                var modbus_channels = readModbusChannels(bytes.slice(offset + 1, offset + 7));
                offset += 7;
                decoded.modbus_channels = decoded.modbus_channels || [];
                decoded.modbus_channels.push(modbus_channels);
            }
            // MODIFY MODBUS CHANNELS NAME
            else if (data === 0x02) {
                var channel_id = readUInt8(bytes[offset + 1]);
                var length = readUInt8(bytes[offset + 2]);
                var name = readAscii(bytes.slice(offset + 3, offset + 3 + length));
                var modbus_channels_name = { channel_id: channel_id, name: name };
                offset += 3 + length;
                decoded.modbus_channels_name = decoded.modbus_channels_name || [];
                decoded.modbus_channels_name.push(modbus_channels_name);
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
    var status_map = { 0: "normal", 1: "reset" };
    return getValue(status_map, status);
}

function readDeviceStatus(status) {
    var status_map = { 0: "off", 1: "on" };
    return getValue(status_map, status);
}

function readSensorStatus(status) {
    var status_map = { 0: "normal", 1: "read error" };
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

function readOnOffStatus(status) {
    var status_map = { 0: "off", 1: "on" };
    return getValue(status_map, status);
}

function readModbusAlarmType(type) {
    var alarm_type_map = {
        0: "normal",
        1: "threshold alarm",
        2: "threshold release alarm",
        3: "mutation alarm",
    };
    return getValue(alarm_type_map, type);
}

function readModbusChannels(bytes) {
    var offset = 0;

    var modbus_channels = {};
    modbus_channels.channel_id = readUInt8(bytes[offset]);
    modbus_channels.slave_id = readUInt8(bytes[offset + 1]);
    modbus_channels.register_address = readUInt16LE(bytes.slice(offset + 2, offset + 4));
    modbus_channels.register_type = readRegisterType(readUInt8(bytes[offset + 4]));
    var data = bytes[offset + 5];
    modbus_channels.sign = readSignType((data >>> 4) & 0x01);
    modbus_channels.quantity = data & 0x0f;
    offset += 6;

    return modbus_channels;
}

function readRegisterType(type) {
    var register_type_map = {
        0: "MB_REG_COIL",
        1: "MB_REG_DIS",
        2: "MB_REG_INPUT_AB",
        3: "MB_REG_INPUT_BA",
        4: "MB_REG_INPUT_INT32_ABCD",
        5: "MB_REG_INPUT_INT32_BADC",
        6: "MB_REG_INPUT_INT32_CDAB",
        7: "MB_REG_INPUT_INT32_DCBA",
        8: "MB_REG_INPUT_INT32_AB",
        9: "MB_REG_INPUT_INT32_CD",
        10: "MB_REG_INPUT_FLOAT_ABCD",
        11: "MB_REG_INPUT_FLOAT_BADC",
        12: "MB_REG_INPUT_FLOAT_CDAB",
        13: "MB_REG_INPUT_FLOAT_DCBA",
        14: "MB_REG_HOLD_INT16_AB",
        15: "MB_REG_HOLD_INT16_BA",
        16: "MB_REG_HOLD_INT32_ABCD",
        17: "MB_REG_HOLD_INT32_BADC",
        18: "MB_REG_HOLD_INT32_CDAB",
        19: "MB_REG_HOLD_INT32_DCBA",
        20: "MB_REG_HOLD_INT32_AB",
        21: "MB_REG_HOLD_INT32_CD",
        22: "MB_REG_HOLD_FLOAT_ABCD",
        23: "MB_REG_HOLD_FLOAT_BADC",
        24: "MB_REG_HOLD_FLOAT_CDAB",
        25: "MB_REG_HOLD_FLOAT_DCBA",
        26: "MB_REG_INPUT_DOUBLE_ABCDEFGH",
        27: "MB_REG_INPUT_DOUBLE_GHEFCDAB",
        28: "MB_REG_INPUT_DOUBLE_BADCFEHG",
        29: "MB_REG_INPUT_DOUBLE_HGFEDCBA",
        30: "MB_REG_INPUT_INT64_ABCDEFGH",
        31: "MB_REG_INPUT_INT64_GHEFCDAB",
        32: "MB_REG_INPUT_INT64_BADCFEHG",
        33: "MB_REG_INPUT_INT64_HGFEDCBA",
        34: "MB_REG_HOLD_DOUBLE_ABCDEFGH",
        35: "MB_REG_HOLD_DOUBLE_GHEFCDAB",
        36: "MB_REG_HOLD_DOUBLE_BADCFEHG",
        37: "MB_REG_HOLD_DOUBLE_HGFEDCBA",
        38: "MB_REG_HOLD_INT64_ABCDEFGH",
        39: "MB_REG_HOLD_INT64_GHEFCDAB",
        40: "MB_REG_HOLD_INT64_BADCFEHG",
        41: "MB_REG_HOLD_INT64_HGFEDCBA",
    };
    return getValue(register_type_map, type);
}

function readSignType(type) {
    var sign_map = { 0: "unsigned", 1: "signed" };
    return getValue(sign_map, type);
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

function readFloatLE(bytes) {
    var bits = (bytes[3] << 24) | (bytes[2] << 16) | (bytes[1] << 8) | bytes[0];
    var sign = bits >>> 31 === 0 ? 1.0 : -1.0;
    var e = (bits >>> 23) & 0xff;
    var m = e === 0 ? (bits & 0x7fffff) << 1 : (bits & 0x7fffff) | 0x800000;
    var f = sign * m * Math.pow(2, e - 150);
    var n = Number(f.toFixed(2));
    return n;
}

function readAscii(bytes) {
    var str = "";
    for (var i = 0; i < bytes.length; i++) {
        str += String.fromCharCode(bytes[i]);
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
 * Copyright 2025 Milesight IoT
 *
 * @product UC100 series
 */
function milesightDeviceEncode(payload) {
    var encoded = [];

    if ("reboot" in payload) {
        encoded = encoded.concat(reboot(payload.reboot));
    }
    if ("report_interval" in payload) {
        encoded = encoded.concat(setReportInterval(payload.report_interval));
    }
    if ("modbus_channels" in payload) {
        for (var i = 0; i < payload.modbus_channels.length; i++) {
            encoded = encoded.concat(setModbusChannel(payload.modbus_channels[i]));
        }
    }
    if ("modbus_channels_name" in payload) {
        for (var i = 0; i < payload.modbus_channels_name.length; i++) {
            encoded = encoded.concat(setModbusChannelName(payload.modbus_channels_name[i]));
        }
    }
    if ("remove_modbus_channels" in payload) {
        for (var i = 0; i < payload.remove_modbus_channels.length; i++) {
            encoded = encoded.concat(removeModbusChannel(payload.remove_modbus_channels[i]));
        }
    }
    if ("history_enable" in payload) {
        encoded = encoded.concat(setHistoryEnable(payload.history_enable));
    }
    if ("retransmit_enable" in payload) {
        encoded = encoded.concat(setRetransmitEnable(payload.retransmit_enable));
    }
    if ("retransmit_interval" in payload) {
        encoded = encoded.concat(setRetransmitInterval(payload.retransmit_interval));
    }
    if ("resend_interval" in payload) {
        encoded = encoded.concat(setResendInterval(payload.resend_interval));
    }
    if ("clear_history" in payload) {
        encoded = encoded.concat(clearHistory(payload.clear_history));
    }
    if ("stop_transmit" in payload) {
        encoded = encoded.concat(stopTransmit(payload.stop_transmit));
    }
    if ("fetch_history" in payload) {
        encoded = encoded.concat(fetchHistory(payload.fetch_history));
    }

    return encoded;
}

/**
 * Reboot device
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
 * set report interval
 * @param {number} report_interval unit: second
 * @example { "report_interval": 600 }
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
 * Set modbus channel config
 * @param {object} modbus_channels
 * @param {number} modbus_channels._item.channel_id range: [1, 32]
 * @param {number} modbus_channels._item.slave_id range: [0, 255]
 * @param {number} modbus_channels._item.register_address range: [0, 65535]
 * @param {number} modbus_channels._item.quantity range: [1, 16]
 * @param {number} modbus_channels._item.sign values: (0: unsigned, 1: signed)
 * @param {number} modbus_channels._item.register_type values: (
 *              0: MB_REG_COIL, 1: MB_REG_DIS,
 *              2: MB_REG_INPUT_AB, 3: MB_REG_INPUT_BA,
 *              4: MB_REG_INPUT_INT32_ABCD, 5: MB_REG_INPUT_INT32_BADC, 6: MB_REG_INPUT_INT32_CDAB, 7: MB_REG_INPUT_INT32_DCBA,
 *              8: MB_REG_INPUT_INT32_AB, 9: MB_REG_INPUT_INT32_CD,
 *              10: MB_REG_INPUT_FLOAT_ABCD, 11: MB_REG_INPUT_FLOAT_BADC, 12: MB_REG_INPUT_FLOAT_CDAB, 13: MB_REG_INPUT_FLOAT_DCBA,
 *              14: MB_REG_HOLD_INT16_AB, 15: MB_REG_HOLD_INT16_BA,
 *              16: MB_REG_HOLD_INT32_ABCD, 17: MB_REG_HOLD_INT32_BADC, 18: MB_REG_HOLD_INT32_CDAB, 19: MB_REG_HOLD_INT32_DCBA,
 *              20: MB_REG_HOLD_INT32_AB, 21: MB_REG_HOLD_INT32_CD,
 *              22: MB_REG_HOLD_FLOAT_ABCD, 23: MB_REG_HOLD_FLOAT_BADC, 24: MB_REG_HOLD_FLOAT_CDAB, 25: MB_REG_HOLD_FLOAT_DCBA)
 * @example { "modbus_channels": [ { "channel_id": 1, "slave_id": 1, "address": 1, "quantity": 1, "sign": 0, "register_type": 1 } ] }
 */
function setModbusChannel(modbus_channels) {
    var channel_id = modbus_channels.channel_id;
    var slave_id = modbus_channels.slave_id;
    var register_address = modbus_channels.register_address;
    var quantity = modbus_channels.quantity;
    var sign = modbus_channels.sign;
    var register_type = modbus_channels.register_type;

    if (channel_id < 1 || channel_id > 32) {
        throw new Error("modbus_channels._item.channel_id must be between 1 and 32");
    }
    if (slave_id < 0 || slave_id > 255) {
        throw new Error("modbus_channels._item.slave_id must be between 0 and 255");
    }
    if (register_address < 0 || register_address > 65535) {
        throw new Error("modbus_channels._item.register_address must be between 0 and 65535");
    }
    if (quantity < 1 || quantity > 16) {
        throw new Error("modbus_channels._item.quantity must be between 1 and 16");
    }
    var register_type_map = {
        0: "MB_REG_COIL",
        1: "MB_REG_DIS",
        2: "MB_REG_INPUT_AB",
        3: "MB_REG_INPUT_BA",
        4: "MB_REG_INPUT_INT32_ABCD",
        5: "MB_REG_INPUT_INT32_BADC",
        6: "MB_REG_INPUT_INT32_CDAB",
        7: "MB_REG_INPUT_INT32_DCBA",
        8: "MB_REG_INPUT_INT32_AB",
        9: "MB_REG_INPUT_INT32_CD",
        10: "MB_REG_INPUT_FLOAT_ABCD",
        11: "MB_REG_INPUT_FLOAT_BADC",
        12: "MB_REG_INPUT_FLOAT_CDAB",
        13: "MB_REG_INPUT_FLOAT_DCBA",
        14: "MB_REG_HOLD_INT16_AB",
        15: "MB_REG_HOLD_INT16_BA",
        16: "MB_REG_HOLD_INT32_ABCD",
        17: "MB_REG_HOLD_INT32_BADC",
        18: "MB_REG_HOLD_INT32_CDAB",
        19: "MB_REG_HOLD_INT32_DCBA",
        20: "MB_REG_HOLD_INT32_AB",
        21: "MB_REG_HOLD_INT32_CD",
        22: "MB_REG_HOLD_FLOAT_ABCD",
        23: "MB_REG_HOLD_FLOAT_BADC",
        24: "MB_REG_HOLD_FLOAT_CDAB",
        25: "MB_REG_HOLD_FLOAT_DCBA",
    };
    var register_type_values = getValues(register_type_map);
    if (register_type_values.indexOf(register_type) === -1) {
        throw new Error("modbus_channels._item.register_type must be one of " + register_type_values.join(", "));
    }
    var sign_map = { 0: "unsigned", 1: "signed" };
    var sign_values = getValues(sign_map);
    if (sign_values.indexOf(sign) === -1) {
        throw new Error("modbus_channels._item.sign must be one of " + sign_values.join(", "));
    }

    var quantity_sign_value = 0x00;
    quantity_sign_value |= getValue(sign_map, sign) << 4;
    quantity_sign_value |= quantity & 0x0f;

    var buffer = new Buffer(9);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xef);
    buffer.writeUInt8(0x01); // config modbus channel
    buffer.writeUInt8(channel_id);
    buffer.writeUInt8(slave_id);
    buffer.writeUInt16LE(register_address);
    buffer.writeUInt8(getValue(register_type_map, register_type));
    buffer.writeUInt8(quantity_sign_value);
    return buffer.toBytes();
}

/**
 * Set modbus channel name
 * @param {object} modbus_channels_name
 * @param {number} modbus_channels_name._item.channel_id range: [1, 32]
 * @param {string} modbus_channels_name._item.name
 * @example { "modbus_channels_name": [ { "channel_id": 1, "name": "modbus_channel_1" } ] }
 */
function setModbusChannelName(modbus_channels_name) {
    var channel_id = modbus_channels_name.channel_id;
    var name = modbus_channels_name.name;

    var buffer = new Buffer(5 + name.length);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xef);
    buffer.writeUInt8(0x02); // config modbus channel name
    buffer.writeUInt8(channel_id);
    buffer.writeUInt8(name.length);
    buffer.writeASCII(name);
    return buffer.toBytes();
}

/**
 * Remove modbus channel
 * @param {object} remove_modbus_channels
 * @param {number} remove_modbus_channels._item.channel_id range: [1, 32]
 * @example { "remove_modbus_channels": [ { "channel_id": 1 } ] }
 */
function removeModbusChannel(remove_modbus_channels) {
    var channel_id = remove_modbus_channels.channel_id;

    if (channel_id < 1 || channel_id > 32) {
        throw new Error("remove_modbus_channels._item.channel_id must be between 1 and 32");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xef);
    buffer.writeUInt8(0x00); // remove modbus channel
    buffer.writeUInt8(channel_id);
    return buffer.toBytes();
}

/**
 * history enable
 * @param {number} history_enable values: (0: disable, 1: enable)
 * @example { "history_enable": 1 }
 */
function setHistoryEnable(history_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(history_enable) === -1) {
        throw new Error("history_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x68);
    buffer.writeUInt8(getValue(enable_map, history_enable));
    return buffer.toBytes();
}

/**
 * history enable
 * @param {number} history_enable values: (0: disable, 1: enable)
 * @example { "history_enable": 1 }
 */
function setHistoryEnable(history_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(history_enable) === -1) {
        throw new Error("history_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x68);
    buffer.writeUInt8(getValue(enable_map, history_enable));
    return buffer.toBytes();
}

/**
 * retransmit enable
 * @param {number} retransmit_enable values: (0: disable, 1: enable)
 * @example { "retransmit_enable": 1 }
 */
function setRetransmitEnable(retransmit_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(retransmit_enable) === -1) {
        throw new Error("retransmit_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x69);
    buffer.writeUInt8(getValue(enable_map, retransmit_enable));
    return buffer.toBytes();
}

/**
 * retransmit interval
 * @param {number} retransmit_interval unit: seconds
 * @example { "retransmit_interval": 300 }
 */
function setRetransmitInterval(retransmit_interval) {
    if (typeof retransmit_interval !== "number") {
        throw new Error("retransmit_interval must be a number");
    }
    if (retransmit_interval < 1 || retransmit_interval > 64800) {
        throw new Error("retransmit_interval must be between 1 and 64800");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x6a);
    buffer.writeUInt8(0x00);
    buffer.writeUInt16LE(retransmit_interval);
    return buffer.toBytes();
}

/**
 * retransmit interval
 * @param {number} resend_interval unit: seconds
 * @example { "resend_interval": 300 }
 */
function setResendInterval(resend_interval) {
    if (typeof resend_interval !== "number") {
        throw new Error("resend_interval must be a number");
    }
    if (resend_interval < 1 || resend_interval > 64800) {
        throw new Error("resend_interval must be between 1 and 64800");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x6a);
    buffer.writeUInt8(0x01);
    buffer.writeUInt16LE(resend_interval);
    return buffer.toBytes();
}

/**
 * fetch history
 * @param {object} fetch_history
 * @param {number} fetch_history.start_time
 * @param {number} fetch_history.end_time
 * @example { "fetch_history": { "start_time": 1609459200, "end_time": 1609545600 } }
 */
function fetchHistory(fetch_history) {
    var start_time = fetch_history.start_time;
    var end_time = fetch_history.end_time || 0;

    if (typeof start_time !== "number") {
        throw new Error("start_time must be a number");
    }
    if ("end_time" in fetch_history && typeof end_time !== "number") {
        throw new Error("end_time must be a number");
    }
    if ("end_time" in fetch_history && start_time > end_time) {
        throw new Error("start_time must be less than end_time");
    }

    var buffer;
    if (end_time === 0) {
        buffer = new Buffer(6);
        buffer.writeUInt8(0xfd);
        buffer.writeUInt8(0x6b);
        buffer.writeUInt32LE(start_time);
    } else {
        buffer = new Buffer(10);
        buffer.writeUInt8(0xfd);
        buffer.writeUInt8(0x6c);
        buffer.writeUInt32LE(start_time);
        buffer.writeUInt32LE(end_time);
    }

    return buffer.toBytes();
}

/**
 * clear history
 * @param {number} clear_history values: (0: no, 1: yes)
 * @example { "clear_history": 1 }
 */
function clearHistory(clear_history) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(clear_history) === -1) {
        throw new Error("clear_history must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, clear_history) === 0) {
        return [];
    }
    return [0xff, 0x27, 0x01];
}

/**
 * history stop transmit
 * @param {number} stop_transmit values: (0: no, 1: yes)
 * @example { "stop_transmit": 1 }
 */
function stopTransmit(stop_transmit) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(stop_transmit) === -1) {
        throw new Error("stop_transmit must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, stop_transmit) === 0) {
        return [];
    }
    return [0xfd, 0x6d, 0xff];
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

Buffer.prototype.writeASCII = function (value) {
    for (var i = 0; i < value.length; i++) {
        this.buffer[this.offset + i] = value.charCodeAt(i);
    }
    this.offset += value.length;
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
    } else {
        result.fPort = 85;
    }
    return result;
}

function Encode(fPort, obj) { return __milesightDownlinkCodec.Encode(fPort, obj); }
function Encoder(obj, port) { return __milesightDownlinkCodec.Encoder(obj, port); }

exports.encodeDownlink = encodeDownlink;
