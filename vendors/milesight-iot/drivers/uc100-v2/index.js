/**
 * Payload Decoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product UC100 v2
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
        else if (channel_id === 0xf9 && channel_type === 0x73) {
            var value_1 = readUInt8(bytes[i]);
            var value_2 = readUInt8(bytes[i + 1]);
            i += 2;

            var modbus_chn_id = (value_1 & 0x3f) + 1;
            var modbus_alarm_value = (value_1 >>> 6) & 0x03;
            var sign = (value_2 >>> 7) & 0x01;
            var reg_offset = (value_2 >>> 5) & 0x03;
            var data_type = value_2 & 0x1f;

            var value = 0;
            switch (data_type) {
                case 0:
                case 1:
                    value = readOnOffStatus(bytes[i]);
                    i += 1;
                    break;
                case 2:
                case 3:
                    value = sign ? readInt16LE(bytes.slice(i, i + 2)) : readUInt16LE(bytes.slice(i, i + 2));
                    i += 2;
                    break;
                case 4:
                case 6:
                    value = sign ? readInt32LE(bytes.slice(i, i + 4)) : readUInt32LE(bytes.slice(i, i + 4));
                    i += 4;
                    break;
                case 8:
                case 9:
                case 10:
                case 11:
                    value = sign ? readInt16LE(bytes.slice(i, i + 2)) : readUInt16LE(bytes.slice(i, i + 2));
                    i += 4;
                    break;
                case 5:
                case 7:
                    value = readFloatLE(bytes.slice(i, i + 4));
                    i += 4;
                    break;
                case 12:
                case 14:
                    value = sign ? readInt64LE(bytes.slice(i, i + 8)) : readUInt64LE(bytes.slice(i, i + 8));
                    i += 8;
                    break;
                case 13:
                case 15:
                    value = readDoubleLE(bytes.slice(i, i + 8));
                    i += 8;
                    break;
            }
            var modbus_chn_name = readModbusChannelName(modbus_chn_id, reg_offset);
            decoded[modbus_chn_name] = value;
            if (hasAlarm(modbus_alarm_value)) {
                var event = {};
                event[modbus_chn_name] = value;
                event[modbus_chn_name + "_alarm"] = readModbusAlarmType(modbus_alarm_value);
                decoded.event = decoded.event || [];
                decoded.event.push(event);
            }
        }
        // MODBUS READ ERROR
        else if (channel_id === 0xff && channel_type === 0x15) {
            var modbus_chn_id = readUInt8(bytes[i]) + 1;
            var channel_name = "modbus_chn_" + modbus_chn_id + "_alarm";
            decoded[channel_name] = readSensorStatus(1);
            i += 1;
        }
        // MODBUS MUTATION
        else if (channel_id === 0xf9 && channel_type === 0x74) {
            var chn_def = readUInt8(bytes[i]);
            var modbus_chn_id = (chn_def & 0x3f) + 1;
            var reg_offset = (chn_def >>> 6) & 0x03;
            var modbus_chn_name = readModbusChannelName(modbus_chn_id, reg_offset);
            decoded[modbus_chn_name + "_mutation"] = readDoubleLE(bytes.slice(i + 1, i + 9));
            i += 9;
        }
        // MODBUS HISTORY
        else if (channel_id === 0x21 && channel_type === 0xce) {
            var timestamp = readUInt32LE(bytes.slice(i, i + 4));
            var modbus_chn_id = readUInt8(bytes[i + 4]) + 1;
            var data_def = readUInt16LE(bytes.slice(i + 5, i + 7));
            var sign = (data_def >>> 15) & 0x01;
            var reg_type = (data_def >>> 9) & 0x3f;
            var read_status = (data_def >>> 8) & 0x01;
            var reg_counts = (data_def >>> 6) & 0x03;
            var event_type = (data_def >>> 4) & 0x03;
            var modbus_chn_name = "modbus_chn_" + modbus_chn_id;

            var data = {};
            data.timestamp = timestamp;
            if (read_status === 1) {
                data[modbus_chn_name] = readModbusHistoryV2(reg_type, sign, bytes.slice(i + 7, i + 15));
                if (reg_counts === 2) {
                    data[modbus_chn_name + "_reg_2"] = readModbusHistoryV2(reg_type, sign, bytes.slice(i + 15, i + 23));
                }
                data[modbus_chn_name + "_alarm"] = readModbusAlarmType(event_type);
            } else {
                data[modbus_chn_name + "_alarm"] = readSensorStatus(1);
            }
            i += 23;

            decoded.history = decoded.history || [];
            decoded.history.push(data);
        }
        // CUSTOM MESSAGE HISTORY
        else if (channel_id === 0x21 && channel_type === 0xcd) {
            var timestamp = readUInt32LE(bytes.slice(i, i + 4));
            var msg_length = bytes[i + 4];
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
            decoded = mergeObjects(decoded, result.data);
            i = result.offset;
        }
        // DOWNLINK RESPONSE
        else if (channel_id === 0xf8 || channel_id === 0xf9) {
            var result = handle_downlink_response_ext(channel_id, channel_type, bytes, i);
            decoded = mergeObjects(decoded, result.data);
            i = result.offset;
        }
        // HISTORY RESPONSE
        else if (channel_id === 0xfc) {
            i += 1;
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
        case 0x28:
            decoded.report_status = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x4a:
            decoded.sync_time = readYesNoStatus(1);
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
        case 0xbd:
            decoded.time_zone = readTimeZone(readInt16LE(bytes.slice(offset, offset + 2)));
            offset += 2;
            break;
        case 0xef:
            var data = bytes[offset];
            if (data === 0x00) {
                var channel_id = bytes[offset + 1];
                var remove_modbus_channels = { channel_id: channel_id };
                decoded.remove_modbus_channels = decoded.remove_modbus_channels || [];
                decoded.remove_modbus_channels.push(remove_modbus_channels);
                offset += 4;
            } else if (data === 0x01) {
                var modbus_channels = readModbusChannels(bytes.slice(offset + 1, offset + 7));
                decoded.modbus_channels = decoded.modbus_channels || [];
                decoded.modbus_channels.push(modbus_channels);
                offset += 7;
            } else if (data === 0x02) {
                var channel_id = bytes[offset + 1];
                var length = bytes[offset + 2];
                var name = readAscii(bytes.slice(offset + 3, offset + 3 + length));
                var modbus_channels_name = { channel_id: channel_id, name: name };
                decoded.modbus_channels_name = decoded.modbus_channels_name || [];
                decoded.modbus_channels_name.push(modbus_channels_name);
                offset += 3 + length;
            }
            break;
        default:
            throw new Error("unknown downlink response");
    }

    return { data: decoded, offset: offset };
}

function handle_downlink_response_ext(code, channel_type, bytes, offset) {
    var decoded = {};

    switch (channel_type) {
        case 0x0d:
            decoded.retransmit_config = readRetransmitConfig(bytes.slice(offset, offset + 3));
            offset += 3;
            break;
        case 0x0e:
            decoded.resend_interval = readUInt16LE(bytes.slice(offset, offset + 2));
            offset += 2;
            break;
        case 0x72:
            decoded.dst_config = readDstConfig(bytes.slice(offset, offset + 9));
            offset += 9;
            break;
        case 0x76:
            var batch_rules = readBatchRules(readUInt16LE(bytes.slice(offset, offset + 2)));
            var type = bytes[offset + 2];
            if (type === 0x01) {
                decoded.batch_enable_rules = batch_rules;
            } else if (type === 0x02) {
                decoded.batch_disable_rules = batch_rules;
            } else if (type === 0x03) {
                decoded.batch_remove_rules = batch_rules;
            }
            offset += 3;
            break;
        case 0x77:
            decoded.query_rule_config = readUInt8(bytes[offset]);
            offset += 1;
            break;
        case 0x78:
            decoded.modbus_serial_port_config = readModbusSerialPortConfig(bytes.slice(offset, offset + 7));
            offset += 7;
            break;
        case 0x79:
            decoded.modbus_config = readModbusConfig(bytes.slice(offset, offset + 7));
            offset += 7;
            break;
        case 0x7a:
            var query_request = readUInt8(bytes[offset]);
            if (query_request === 0x00) {
                decoded.query_modbus_serial_port_config = readYesNoStatus(1);
            } else if (query_request === 0x01) {
                decoded.query_modbus_config = readYesNoStatus(1);
            }
            offset += 1;
            break;
        case 0x7d:
            var result = handleRuleConfig(bytes, offset);
            var rule_config = result.data;
            offset = result.offset;

            var found = false;
            decoded.rule_config = decoded.rule_config || [];
            for (var x = 0; x < decoded.rule_config.length; x++) {
                if (decoded.rule_config[x].rule_id === rule_config.rule_id) {
                    decoded.rule_config[x] = mergeObjects(decoded.rule_config[x], rule_config);
                    found = true;
                    break;
                }
            }
            if (!found) {
                decoded.rule_config.push(rule_config);
            }
            break;
        default:
            throw new Error("unknown downlink response");
    }

    if (hasResultFlag(code)) {
        var result_value = readUInt8(bytes[offset]);
        offset += 1;

        if (result_value !== 0) {
            var request = decoded;
            decoded = {};
            decoded.device_response_result = {};
            decoded.device_response_result.channel_type = channel_type;
            decoded.device_response_result.result = readResultStatus(result_value);
            decoded.device_response_result.request = request;
        }
    }

    return { data: decoded, offset: offset };
}

function hasResultFlag(code) {
    return code === 0xf8;
}

function readResultStatus(status) {
    var status_map = { 0: "success", 1: "forbidden", 2: "invalid parameter" };
    return getValue(status_map, status);
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

function readOnOffStatus(status) {
    var status_map = { 0: "off", 1: "on" };
    return getValue(status_map, status);
}

function readModbusAlarmType(type) {
    var alarm_type_map = {
        0: "normal",
        1: "threshold alarm",
        2: "threshold alarm release",
        3: "mutation alarm",
    };
    return getValue(alarm_type_map, type);
}

function hasAlarm(type) {
    return type !== 0;
}

function readParityType(type) {
    var parity_type_map = { 0: "none", 1: "odd", 2: "even" };
    return getValue(parity_type_map, type);
}

function readYesNoStatus(status) {
    var status_map = { 0: "no", 1: "yes" };
    return getValue(status_map, status);
}

function readEnableStatus(status) {
    var status_map = { 0: "disable", 1: "enable" };
    return getValue(status_map, status);
}

function readModbusChannelName(index, offset) {
    if (offset === 0) {
        return "modbus_chn_" + index;
    }
    return "modbus_chn_" + index + "_reg_" + (offset + 1);
}

function readTimeZone(time_zone) {
    var timezone_map = { "-720": "UTC-12", "-660": "UTC-11", "-600": "UTC-10", "-570": "UTC-9:30", "-540": "UTC-9", "-480": "UTC-8", "-420": "UTC-7", "-360": "UTC-6", "-300": "UTC-5", "-240": "UTC-4", "-210": "UTC-3:30", "-180": "UTC-3", "-120": "UTC-2", "-60": "UTC-1", 0: "UTC", 60: "UTC+1", 120: "UTC+2", 180: "UTC+3", 210: "UTC+3:30", 240: "UTC+4", 270: "UTC+4:30", 300: "UTC+5", 330: "UTC+5:30", 345: "UTC+5:45", 360: "UTC+6", 390: "UTC+6:30", 420: "UTC+7", 480: "UTC+8", 540: "UTC+9", 570: "UTC+9:30", 600: "UTC+10", 630: "UTC+10:30", 660: "UTC+11", 720: "UTC+12", 765: "UTC+12:45", 780: "UTC+13", 840: "UTC+14" };
    return getValue(timezone_map, time_zone);
}

function readDstConfig(bytes) {
    var offset = 0;

    var data = bytes[offset];
    var enable_value = (data >> 7) & 0x01;
    var offset_value = data & 0x7f;

    var dst_config = {};
    dst_config.enable = readEnableStatus(enable_value);
    dst_config.offset = offset_value;
    if (enable_value === 1) {
        dst_config.start_month = readUInt8(bytes[offset + 1]);
        var start_week_value = readUInt8(bytes[offset + 2]);
        dst_config.start_week_num = start_week_value >> 4;
        dst_config.start_week_day = start_week_value & 0x0f;
        dst_config.start_time = readUInt16LE(bytes.slice(offset + 3, offset + 5));
        dst_config.end_month = readUInt8(bytes[offset + 5]);
        var end_week_value = readUInt8(bytes[offset + 6]);
        dst_config.end_week_num = end_week_value >> 4;
        dst_config.end_week_day = end_week_value & 0x0f;
        dst_config.end_time = readUInt16LE(bytes.slice(offset + 7, offset + 9));
    }
    offset += 9;

    return dst_config;
}

function readModbusSerialPortConfig(bytes) {
    var offset = 0;

    var modbus_serial_port_config = {};
    modbus_serial_port_config.baud_rate = readUInt32LE(bytes.slice(offset, offset + 4));
    modbus_serial_port_config.data_bits = readUInt8(bytes[offset + 4]);
    modbus_serial_port_config.stop_bits = readUInt8(bytes[offset + 5]);
    modbus_serial_port_config.parity = readParityType(readUInt8(bytes[offset + 6]));
    offset += 7;

    return modbus_serial_port_config;
}

function readModbusConfig(bytes) {
    var offset = 0;

    var modbus_config = {};
    modbus_config.exec_interval = readUInt16LE(bytes.slice(offset, offset + 2));
    modbus_config.max_response_time = readUInt16LE(bytes.slice(offset + 2, offset + 4));
    modbus_config.retry_times = readUInt8(bytes[offset + 4]);
    var data = bytes[offset + 5];
    modbus_config.pass_through_enable = readEnableStatus((data >>> 4) & 0x01);
    modbus_config.pass_through_direct = readDirection(data & 0x01);
    modbus_config.pass_through_port = readUInt8(bytes[offset + 6]);
    offset += 7;

    return modbus_config;
}

function readDirection(type) {
    var direction_map = { 0: "active", 1: "bidirectional" };
    return getValue(direction_map, type);
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

function readSignType(type) {
    var sign_map = { 0: "unsigned", 1: "signed" };
    return getValue(sign_map, type);
}

function readRetransmitConfig(bytes) {
    var offset = 0;

    var retransmit_config = {};
    retransmit_config.enable = readEnableStatus(bytes[offset]);
    retransmit_config.interval = readUInt16LE(bytes.slice(offset + 1, offset + 3));
    offset += 3;

    return retransmit_config;
}

function readBatchRules(value) {
    var rules_offset = { rule_1: 0, rule_2: 1, rule_3: 2, rule_4: 3, rule_5: 4, rule_6: 5, rule_7: 6, rule_8: 7, rule_9: 8, rule_10: 9, rule_11: 10, rule_12: 11, rule_13: 12, rule_14: 13, rule_15: 14, rule_16: 15 };

    var batch_rules = {};
    for (var key in rules_offset) {
        batch_rules[key] = readYesNoStatus((value >>> rules_offset[key]) & 0x01);
    }
    return batch_rules;
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

function readModbusHistoryV2(reg_type, sign, bytes) {
    var i = 0;
    var value = 0;
    switch (reg_type) {
        case 0: // MB_REG_COIL
        case 1: // MB_REG_DISCRETE
            value = readOnOffStatus(bytes[i]);
            break;
        case 2: // MB_REG_INPUT_AB
        case 3: // MB_REG_INPUT_BA
            value = sign ? readInt16LE(bytes.slice(i, i + 2)) : readUInt16LE(bytes.slice(i, i + 2));
            break;
        case 4: // MB_REG_INPUT_INT32_ABCD
        case 5: // MB_REG_INPUT_INT32_BADC
        case 6: // MB_REG_INPUT_INT32_CDAB
        case 7: // MB_REG_INPUT_INT32_DCBA
            value = sign ? readInt32LE(bytes.slice(i, i + 4)) : readUInt32LE(bytes.slice(i, i + 4));
            break;
        case 8: // MB_REG_INPUT_INT32_AB
        case 9: // MB_REG_INPUT_INT32_CD
        case 20: // MB_REG_HOLD_INT32_AB
        case 21: // MB_REG_HOLD_INT32_CD
            value = sign ? readInt16LE(bytes.slice(i, i + 2)) : readUInt16LE(bytes.slice(i, i + 2));
            break;
        case 10: // MB_REG_INPUT_FLOAT_ABCD
        case 11: // MB_REG_INPUT_FLOAT_BADC
        case 12: // MB_REG_INPUT_FLOAT_CDAB
        case 13: // MB_REG_INPUT_FLOAT_DCBA
            value = readFloatLE(bytes.slice(i, i + 4));
            break;
        case 14: // MB_REG_HOLD_INT16_AB
        case 15: // MB_REG_HOLD_INT16_BA
            value = sign ? readInt16LE(bytes.slice(i, i + 2)) : readUInt16LE(bytes.slice(i, i + 2));
            break;
        case 16: // MB_REG_HOLD_INT32_ABCD
        case 17: // MB_REG_HOLD_INT32_BADC
        case 18: // MB_REG_HOLD_INT32_CDAB
        case 19: // MB_REG_HOLD_INT32_DCBA
            value = sign ? readInt32LE(bytes.slice(i, i + 4)) : readUInt32LE(bytes.slice(i, i + 4));
            break;
        case 30: // MB_REG_INPUT_INT64_ABCDEFGH
        case 31: // MB_REG_INPUT_INT64_GHEFCDAB
        case 32: // MB_REG_INPUT_INT64_BADCFEHG
        case 33: // MB_REG_INPUT_INT64_HGFEDCBA
        case 38: // MB_REG_HOLD_INT64_ABCDEFGH
        case 39: // MB_REG_HOLD_INT64_GHEFCDAB
        case 40: // MB_REG_HOLD_INT64_BADCFEHG
        case 41: // MB_REG_HOLD_INT64_HGFEDCBA
            value = sign ? readInt64LE(bytes.slice(i, i + 8)) : readUInt64LE(bytes.slice(i, i + 8));
            break;
        case 22: // MB_REG_HOLD_FLOAT_ABCD
        case 23: // MB_REG_HOLD_FLOAT_BADC
        case 24: // MB_REG_HOLD_FLOAT_CDAB
        case 25: // MB_REG_HOLD_FLOAT_DCBA
            value = readFloatLE(bytes.slice(i, i + 4));
            break;
        case 26: // MB_REG_INPUT_DOUBLE_ABCDEFGH
        case 27: // MB_REG_INPUT_DOUBLE_GHEFCDAB
        case 28: // MB_REG_INPUT_DOUBLE_BADCFEHG
        case 29: // MB_REG_INPUT_DOUBLE_HGFEDCBA
        case 34: // MB_REG_HOLD_DOUBLE_ABCDEFGH
        case 35: // MB_REG_HOLD_DOUBLE_GHEFCDAB
        case 36: // MB_REG_HOLD_DOUBLE_BADCFEHG
        case 37: // MB_REG_HOLD_DOUBLE_HGFEDCBA
            value = readDoubleLE(bytes.slice(i, i + 8));
            break;
    }
    return value;
}

function handleRuleConfig(bytes, offset) {
    var value_1 = readUInt8(bytes[offset]);
    var value_2 = readUInt8(bytes[offset + 1]);

    var enable_value = (value_1 >>> 7) & 0x01;
    var rule_id = value_1 & 0x7f;
    var condition_or_action = (value_2 >>> 7) & 0x01;
    var rule_index = (value_2 >>> 4) & 0x07;
    var rule_type_value = value_2 & 0x0f;

    var rule_config = {};
    rule_config.rule_id = rule_id;
    rule_config.enable = readEnableStatus(enable_value);

    // condition
    if (condition_or_action === 0x00) {
        rule_config.condition = {};
        rule_config.condition.type = readConditionType(rule_type_value);
        switch (rule_type_value) {
            case 0x00: // NONE CONDITION
                offset += 2;
                break;
            case 0x01: // TIME CONDITION
                rule_config.condition.time_condition = readTimeCondition(bytes.slice(offset + 2, offset + 9));
                offset += 9;
                break;
            case 0x02: // MODBUS VALUE CONDITION
                rule_config.condition.modbus_value_condition = readModbusValueCondition(bytes.slice(offset + 2, offset + 20));
                offset += 20;
                break;
            case 0x03: // MODBUS CMD CONDITION
                var cmd_length = readUInt8(bytes[offset + 2]);
                rule_config.condition.modbus_cmd_condition = readModbusCmdCondition(bytes.slice(offset + 3, offset + 3 + cmd_length));
                offset += 3 + cmd_length;
                break;
            case 0x04: // MESSAGE CONDITION
                var message_length = readUInt8(bytes[offset + 2]);
                rule_config.condition.message_condition = readMessageCondition(bytes.slice(offset + 3, offset + 3 + message_length));
                offset += 3 + message_length;
                break;
            case 0x05: // D2D CONDITION
                rule_config.condition.d2d_condition = readD2DCondition(bytes.slice(offset + 2, offset + 5));
                offset += 5;
                break;
            case 0x06: // REBOOT CONDITION
                offset += 2;
                break;
        }
    }
    // action
    else if (condition_or_action === 0x01) {
        var action = {};
        action.type = readActionType(rule_type_value);
        action.index = rule_index;
        action.delay_time = readUInt32LE(bytes.slice(offset + 2, offset + 6));
        switch (rule_type_value) {
            case 0x00: // NONE ACTION
                offset += 6;
                break;
            case 0x01: // MESSAGE ACTION
                var message_length = readUInt8(bytes[offset + 6]);
                action.message_action = readMessageAction(bytes.slice(offset + 7, offset + 7 + message_length));
                offset += 7 + message_length;
                break;
            case 0x02: // D2D ACTION
                action.d2d_action = readD2DAction(bytes.slice(offset + 6, offset + 8));
                offset += 8;
                break;
            case 0x03: // MODBUS CMD ACTION
                var modbus_cmd_length = readUInt8(bytes[offset + 6]);
                action.modbus_cmd_action = readModbusCmdAction(bytes.slice(offset + 7, offset + 7 + modbus_cmd_length));
                offset += 7 + modbus_cmd_length;
                break;
            case 0x04: // REPORT STATUS ACTION
                offset += 6;
                break;
            case 0x05: // REPORT ALARM ACTION
                action.report_alarm_action = readReportAlarmAction(bytes[offset + 6]);
                offset += 7;
                break;
            case 0x06: // REBOOT ACTION
                offset += 6;
                break;
        }
        rule_config.action = rule_config.action || [];
        rule_config.action.push(action);
    }
    return { data: rule_config, offset: offset };
}

function readConditionType(condition_type_value) {
    var condition_type_map = { 0: "none", 1: "time", 2: "modbus_value", 3: "modbus_cmd", 4: "message", 5: "d2d", 6: "reboot" };
    return getValue(condition_type_map, condition_type_value);
}

function readTimeCondition(bytes) {
    var offset = 0;
    var cycle_mode_value = readUInt8(bytes[offset]);

    var time_condition = {};
    time_condition.mode = readCycleMode(cycle_mode_value);
    switch (cycle_mode_value) {
        case 0x00: // weekdays
            time_condition.weekdays = readWeekdays(readUInt32LE(bytes.slice(offset + 1, offset + 5)));
            break;
        case 0x01: // days
            time_condition.days = readDays(readUInt32LE(bytes.slice(offset + 1, offset + 5)));
            break;
    }
    time_condition.hour = readUInt8(bytes[offset + 5]);
    time_condition.minute = readUInt8(bytes[offset + 6]);
    return time_condition;
}

function readCycleMode(mode) {
    var cycle_mode_map = { 0: "weekdays", 1: "days" };
    return getValue(cycle_mode_map, mode);
}

function readWeekdays(value) {
    var weekdays = [];
    for (var i = 0; i < 7; i++) {
        if ((value >> i) & 0x01) {
            weekdays.push(i + 1);
        }
    }
    return weekdays;
}

function readDays(value) {
    var days = [];
    for (var i = 0; i < 31; i++) {
        if ((value >> i) & 0x01) {
            days.push(i + 1);
        }
    }
    return days;
}

function readModbusValueCondition(bytes) {
    var offset = 0;

    var channel_id = readUInt8(bytes[offset]);
    var condition_def = readUInt8(bytes[offset + 1]);
    var condition_value = condition_def & 0x0f;
    var holding_mode_value = (condition_def >>> 4) & 0x01;
    var continue_time = readUInt32LE(bytes.slice(offset + 2, offset + 6));
    var lock_time = readUInt32LE(bytes.slice(offset + 6, offset + 10));
    var value_1 = readFloatLE(bytes.slice(offset + 10, offset + 14));
    var value_2 = readFloatLE(bytes.slice(offset + 14, offset + 18));

    var modbus_value_condition = {};
    modbus_value_condition.channel_id = channel_id;
    modbus_value_condition.condition = readMathConditionType(condition_value);
    if (condition_value < 5) {
        modbus_value_condition.holding_mode = readHoldingModeType(holding_mode_value);
    }
    modbus_value_condition.continue_time = continue_time;
    modbus_value_condition.lock_time = lock_time;
    if (condition_value === 2 || condition_value === 4) {
        modbus_value_condition.threshold_min = value_1;
    } else if (condition_value === 3 || condition_value === 4) {
        modbus_value_condition.threshold_max = value_2;
    } else if (condition_value === 6 || condition_value === 7) {
        modbus_value_condition.mutation_duration = value_1;
        modbus_value_condition.mutation = value_2;
    }
    return modbus_value_condition;
}

function readMathConditionType(type) {
    var math_condition_type_map = { 0: "false", 1: "true", 2: "below", 3: "above", 4: "between", 5: "outside", 6: "change_with_time", 7: "change_without_time" };
    return getValue(math_condition_type_map, type);
}

function readHoldingModeType(type) {
    var holding_mode_map = { 0: "below", 1: "above" };
    return getValue(holding_mode_map, type);
}

function readModbusCmdCondition(bytes) {
    var modbus_cmd_condition = {};
    modbus_cmd_condition.cmd = readAscii(bytes);
    return modbus_cmd_condition;
}

function readMessageCondition(bytes) {
    var message_condition = {};
    message_condition.message = readAscii(bytes);
    return message_condition;
}

function readD2DCondition(bytes) {
    var offset = 0;

    var d2d_condition = {};
    d2d_condition.d2d_cmd = readD2DCommand(bytes.slice(offset, offset + 2));
    d2d_condition.d2d_status = readD2DStatus(bytes[offset + 2]);

    return d2d_condition;
}

function readD2DCommand(bytes) {
    return ("0" + (bytes[1] & 0xff).toString(16)).slice(-2) + ("0" + (bytes[0] & 0xff).toString(16)).slice(-2);
}

function readD2DStatus(type) {
    var d2d_status_map = { 0: "any", 1: "on", 2: "off" };
    return getValue(d2d_status_map, type);
}

function readActionType(type) {
    var action_map = { 0: "none", 1: "message", 2: "d2d", 3: "modbus_cmd", 4: "report_status", 5: "report_alarm", 6: "reboot" };
    return getValue(action_map, type);
}

function readMessageAction(bytes) {
    var message_action = {};
    message_action.message = readAscii(bytes);
    return message_action;
}

function readD2DAction(bytes) {
    var d2d_action = {};
    d2d_action.d2d_cmd = readD2DCommand(bytes);
    return d2d_action;
}

function readModbusCmdAction(bytes) {
    var modbus_cmd_action = {};
    modbus_cmd_action.cmd = readAscii(bytes);
    return modbus_cmd_action;
}

function readReportAlarmAction(type) {
    var report_alarm_action = {};
    report_alarm_action.release_enable = readEnableStatus(type);
    return report_alarm_action;
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

function readUInt64LE(bytes) {
    // JavaScript unable to handle 64-bit integers, so we split the 64-bit value into two 32-bit parts
    var low = readUInt32LE(bytes.slice(0, 4));
    var high = readUInt32LE(bytes.slice(4, 8));

    // For values less than 2^53, we can directly calculate
    if (high < 0x200000) {
        return high * 0x100000000 + low;
    }

    // For larger values, return a string or use BigInt (if supported)
    if (typeof BigInt !== "undefined") {
        return (BigInt(high) << BigInt(32)) + BigInt(low);
    } else {
        // Return an object containing the high and low parts
        return {
            high: high,
            low: low,
            toString: function () {
                // Simple string representation
                return high.toString(16) + low.toString(16).padStart(8, "0");
            },
        };
    }
}

function readInt64LE(bytes) {
    var low = readUInt32LE(bytes.slice(0, 4));
    var high = readUInt32LE(bytes.slice(4, 8));

    // check the sign bit
    var isNegative = (high & 0x80000000) !== 0;

    if (!isNegative) {
        // positive number is processed the same as UInt64
        if (high < 0x200000) {
            return high * 0x100000000 + low;
        }
    } else {
        // for negative numbers, if the absolute value is less than 2^53, we can directly calculate
        if ((high & 0x7fffffff) < 0x200000) {
            return -((~high & 0x7fffffff) * 0x100000000 + (~low & 0xffffffff) + 1);
        }
    }

    // for larger values, use BigInt (if supported)
    if (typeof BigInt !== "undefined") {
        var value = (BigInt(high) << BigInt(32)) | BigInt(low);
        if (isNegative) {
            // negative numbers need to be converted to signed integers
            value = value - BigInt("18446744073709551616");
        }
        return value;
    } else {
        // return an object containing the high, low, and sign
        return {
            high: high,
            low: low,
            isNegative: isNegative,
            toString: function () {
                if (!isNegative) {
                    return high.toString(16) + low.toString(16).padStart(8, "0");
                } else {
                    // for negative numbers, calculate the two's complement
                    var twoComp = ((~high & 0xffffffff) << 32) | ((~low & 0xffffffff) + 1);
                    return "-" + (twoComp >>> 0).toString(16);
                }
            },
        };
    }
}

function readFloat16LE(bytes) {
    var bits = (bytes[1] << 8) | bytes[0];
    var sign = bits >>> 15 === 0 ? 1.0 : -1.0;
    var e = (bits >>> 10) & 0x1f;
    var m = e === 0 ? (bits & 0x3ff) << 1 : (bits & 0x3ff) | 0x400;
    var f = sign * m * Math.pow(2, e - 25);
    return f;
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

function readDoubleLE(bytes) {
    // read from 8 bytes
    var low = bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24);
    var high = bytes[4] | (bytes[5] << 8) | (bytes[6] << 16) | (bytes[7] << 24);

    // extract the sign bit (bit 63)
    var sign = high >>> 31 === 0 ? 1.0 : -1.0;

    // extract the exponent (bit 62-52)
    var exponent = (high >>> 20) & 0x7ff;

    // extract the mantissa (bit 51-0)
    // high part (bit 51-32)
    var highMantissa = high & 0xfffff;
    // low part (bit 31-0)
    var lowMantissa = low;

    var result;

    if (exponent === 0) {
        // handle denormalized numbers
        if (highMantissa === 0 && lowMantissa === 0) {
            result = sign * 0; // zero
        } else {
            // denormalized numbers, exponent offset is -1022
            result = sign * Math.pow(2, -1022) * (highMantissa * Math.pow(2, -20) + lowMantissa * Math.pow(2, -52));
        }
    } else if (exponent === 0x7ff) {
        // handle infinity and NaN
        if (highMantissa === 0 && lowMantissa === 0) {
            result = sign === 1.0 ? Infinity : -Infinity; // infinity
        } else {
            result = NaN; // Not a Number
        }
    } else {
        // handle normalized numbers
        // IEEE 754 double precision floating point exponent offset is 1023
        result = sign * Math.pow(2, exponent - 1023) * (1 + highMantissa * Math.pow(2, -20) + lowMantissa * Math.pow(2, -52));
    }

    return result;
}

function readAscii(bytes) {
    var str = "";
    for (var i = 0; i < bytes.length; i++) {
        if (bytes[i] === 0x00) {
            break;
        }
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
 * @product UC100 v2
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
    if ("sync_time" in payload) {
        encoded = encoded.concat(syncTime(payload.sync_time));
    }
    if ("report_interval" in payload) {
        encoded = encoded.concat(setReportInterval(payload.report_interval));
    }
    if ("confirm_mode_enable" in payload) {
        encoded = encoded.concat(setConfirmModeEnable(payload.confirm_mode_enable));
    }
    if ("time_zone" in payload) {
        encoded = encoded.concat(setTimeZone(payload.time_zone));
    }
    if ("dst_config" in payload) {
        encoded = encoded.concat(setDaylightSavingTime(payload.dst_config));
    }
    if ("modbus_serial_port_config" in payload) {
        encoded = encoded.concat(setModbusSerialPortConfig(payload.modbus_serial_port_config));
    }
    if ("modbus_config" in payload) {
        encoded = encoded.concat(setModbusConfig(payload.modbus_config));
    }
    if ("query_modbus_serial_port_config" in payload) {
        encoded = encoded.concat(queryModbusSerialPortConfig(payload.query_modbus_serial_port_config));
    }
    if ("query_modbus_config" in payload) {
        encoded = encoded.concat(queryModbusConfig(payload.query_modbus_config));
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
    if ("retransmit_config" in payload) {
        encoded = encoded.concat(setRetransmitConfig(payload.retransmit_config));
    }
    if ("resend_interval" in payload) {
        encoded = encoded.concat(setResendInterval(payload.resend_interval));
    }
    if ("retransmit_enable" in payload) {
        encoded = encoded.concat(setRetransmitEnable(payload.retransmit_enable));
    }
    if ("history_enable" in payload) {
        encoded = encoded.concat(setHistoryEnable(payload.history_enable));
    }
    if ("fetch_history" in payload) {
        encoded = encoded.concat(fetchHistory(payload.fetch_history));
    }
    if ("clear_history" in payload) {
        encoded = encoded.concat(clearHistory(payload.clear_history));
    }
    if ("batch_enable_rules" in payload) {
        encoded = encoded.concat(setBatchEnableRules(payload.batch_enable_rules));
    }
    if ("batch_disable_rules" in payload) {
        encoded = encoded.concat(setBatchDisableRules(payload.batch_disable_rules));
    }
    if ("batch_remove_rules" in payload) {
        encoded = encoded.concat(setBatchRemoveRules(payload.batch_remove_rules));
    }
    if ("query_rule_config" in payload) {
        encoded = encoded.concat(queryRuleConfig(payload.query_rule_config));
    }
    if ("rule_config" in payload) {
        for (var i = 0; i < payload.rule_config.length; i++) {
            encoded = encoded.concat(setRuleConfig(payload.rule_config[i]));
        }
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
 * report device status
 * @since v2.0
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
 * sync time
 * @since v2.0
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
 * confirm mode enable
 * @param {number} confirm_mode_enable values: (0: disable, 1: enable)
 * @example { "confirm_mode_enable": 1 }
 */
function setConfirmModeEnable(confirm_mode_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(confirm_mode_enable) === -1) {
        throw new Error("confirm_mode_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x04);
    buffer.writeUInt8(getValue(enable_map, confirm_mode_enable));
    return buffer.toBytes();
}

/**
 * set time zone
 * @param {number} time_zone unit: minute, convert: "hh:mm" -> "hh * 60 + mm", values: ( -720: UTC-12, -660: UTC-11, -600: UTC-10, -570: UTC-9:30, -540: UTC-9, -480: UTC-8, -420: UTC-7, -360: UTC-6, -300: UTC-5, -240: UTC-4, -210: UTC-3:30, -180: UTC-3, -120: UTC-2, -60: UTC-1, 0: UTC, 60: UTC+1, 120: UTC+2, 180: UTC+3, 240: UTC+4, 300: UTC+5, 360: UTC+6, 420: UTC+7, 480: UTC+8, 540: UTC+9, 570: UTC+9:30, 600: UTC+10, 660: UTC+11, 720: UTC+12, 765: UTC+12:45, 780: UTC+13, 840: UTC+14 )
 * @example { "time_zone": 480 }
 * @example { "time_zone": -240 }
 */
function setTimeZone(time_zone) {
    var timezone_map = { "-720": "UTC-12", "-660": "UTC-11", "-600": "UTC-10", "-570": "UTC-9:30", "-540": "UTC-9", "-480": "UTC-8", "-420": "UTC-7", "-360": "UTC-6", "-300": "UTC-5", "-240": "UTC-4", "-210": "UTC-3:30", "-180": "UTC-3", "-120": "UTC-2", "-60": "UTC-1", 0: "UTC", 60: "UTC+1", 120: "UTC+2", 180: "UTC+3", 210: "UTC+3:30", 240: "UTC+4", 270: "UTC+4:30", 300: "UTC+5", 330: "UTC+5:30", 345: "UTC+5:45", 360: "UTC+6", 390: "UTC+6:30", 420: "UTC+7", 480: "UTC+8", 540: "UTC+9", 570: "UTC+9:30", 600: "UTC+10", 630: "UTC+10:30", 660: "UTC+11", 720: "UTC+12", 765: "UTC+12:45", 780: "UTC+13", 840: "UTC+14" };
    var timezone_values = getValues(timezone_map);
    if (timezone_values.indexOf(time_zone) === -1) {
        throw new Error("time_zone must be one of " + timezone_values.join(", "));
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xbd);
    buffer.writeInt16LE(getValue(timezone_map, time_zone));
    return buffer.toBytes();
}

/**
 * set daylight saving time
 * @since v2.0
 * @param {object} dst_config
 * @param {number} dst_config.enable values: (0: disable, 1: enable)
 * @param {number} dst_config.offset, unit: minute
 * @param {number} dst_config.start_month, values: (1: January, 2: February, 3: March, 4: April, 5: May, 6: June, 7: July, 8: August, 9: September, 10: October, 11: November, 12: December)
 * @param {number} dst_config.start_week_num, range: [1, 5]
 * @param {number} dst_config.start_week_day, range: [1, 7]
 * @param {number} dst_config.start_time, unit: minute, convert: "hh:mm" -> "hh * 60 + mm"
 * @param {number} dst_config.end_month, values: (1: January, 2: February, 3: March, 4: April, 5: May, 6: June, 7: July, 8: August, 9: September, 10: October, 11: November, 12: December)
 * @param {number} dst_config.end_week_num, range: [1, 5]
 * @param {number} dst_config.end_week_day, range: [1, 7]
 * @param {number} dst_config.end_time, unit: minute, convert: "hh:mm" -> "hh * 60 + mm"
 * @example { "dst_config": { "enable": 1, "offset": 60, "start_month": 3, "start_week_num": 2, "start_week_day": 7, "start_time": 120, "end_month": 1, "end_week_num": 4, "end_week_day": 1, "end_time": 180 } } output: FFBA013C032778000141B400
 */
function setDaylightSavingTime(dst_config) {
    var enable = dst_config.enable;
    var offset = dst_config.offset;
    var start_month = dst_config.start_month;
    var start_week_num = dst_config.start_week_num;
    var start_week_day = dst_config.start_week_day;
    var start_time = dst_config.start_time;
    var end_month = dst_config.end_month;
    var end_week_num = dst_config.end_week_num;
    var end_week_day = dst_config.end_week_day;
    var end_time = dst_config.end_time;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("dst_config.enable must be one of " + enable_values.join(", "));
    }

    var week_values = [1, 2, 3, 4, 5, 6, 7];
    var month_values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    var enable_value = getValue(enable_map, enable);
    if (enable_value && month_values.indexOf(start_month) === -1) {
        throw new Error("dst_config.start_month must be one of " + month_values.join(", "));
    }
    if (enable_value && month_values.indexOf(end_month) === -1) {
        throw new Error("dst_config.end_month must be one of " + month_values.join(", "));
    }
    if (enable_value && week_values.indexOf(start_week_day) === -1) {
        throw new Error("dst_config.start_week_day must be one of " + week_values.join(", "));
    }
    if (enable_value && week_values.indexOf(end_week_day) === -1) {
        throw new Error("dst_config.end_week_day must be one of " + week_values.join(", "));
    }

    var data = 0x00;
    data |= getValue(enable_map, enable) << 7;
    data |= offset;

    var buffer = new Buffer(11);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x72);
    buffer.writeUInt8(data);
    buffer.writeUInt8(enable_value && start_month);
    buffer.writeUInt8(enable_value && (start_week_num << 4) | start_week_day);
    buffer.writeUInt16LE(enable_value && start_time);
    buffer.writeUInt8(enable_value && end_month);
    buffer.writeUInt8(enable_value && (end_week_num << 4) | end_week_day);
    buffer.writeUInt16LE(enable_value && end_time);
    return buffer.toBytes();
}

/**
 * Set modbus serial port config
 * @since v2.0
 * @param {object} modbus_serial_port_config
 * @param {number} modbus_serial_port_config.baud_rate values: (1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200)
 * @param {number} modbus_serial_port_config.data_bits values: (7, 8, 9)
 * @param {number} modbus_serial_port_config.stop_bits values: (1, 2, 3)
 * @param {number} modbus_serial_port_config.parity values: (0: none, 1: odd, 2: even)
 * @example { "modbus_serial_port_config": { "baud_rate": 9600, "data_bits": 8, "stop_bits": 1, "parity": 0 } }
 */
function setModbusSerialPortConfig(modbus_serial_port_config) {
    var baud_rate = modbus_serial_port_config.baud_rate;
    var data_bits = modbus_serial_port_config.data_bits;
    var stop_bits = modbus_serial_port_config.stop_bits;
    var parity = modbus_serial_port_config.parity;

    var baud_rate_values = [1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200];
    if (baud_rate_values.indexOf(baud_rate) === -1) {
        throw new Error("modbus_serial_port_config.baud_rate must be one of " + baud_rate_values.join(", "));
    }
    var data_bits_values = [7, 8, 9];
    if (data_bits_values.indexOf(data_bits) === -1) {
        throw new Error("modbus_serial_port_config.data_bits must be one of " + data_bits_values.join(", "));
    }
    var stop_bits_values = [1, 2, 3];
    if (stop_bits_values.indexOf(stop_bits) === -1) {
        throw new Error("modbus_serial_port_config.stop_bits must be one of " + stop_bits_values.join(", "));
    }
    var parity_map = { 0: "none", 1: "odd", 2: "even" };
    var parity_values = getValues(parity_map);
    if (parity_values.indexOf(parity) === -1) {
        throw new Error("modbus_serial_port_config.parity must be one of " + parity_values.join(", "));
    }

    var buffer = new Buffer(9);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x78);
    buffer.writeUInt32LE(baud_rate);
    buffer.writeUInt8(data_bits);
    buffer.writeUInt8(stop_bits);
    buffer.writeUInt8(getValue(parity_map, parity));
    return buffer.toBytes();
}

/**
 * Set modbus config
 * @since v2.0
 * @param {object} modbus_config
 * @param {number} modbus_config.exec_interval range: [100, 65535]
 * @param {number} modbus_config.max_response_time range: [100, 65535]
 * @param {number} modbus_config.retry_times range: [0, 255]
 * @param {number} modbus_config.pass_through_enable values: (0: disable, 1: enable)
 * @param {number} modbus_config.pass_through_direct values: (0: active, 1: bidirectional)
 * @param {number} modbus_config.pass_through_port range: [2, 223]
 * @example { "modbus_config": { "exec_interval": 1000, "max_response_time": 1000, "retry_times": 3, "pass_through_enable": 1, "pass_through_direct": 1, "pass_through_port": 52 } }
 */
function setModbusConfig(modbus_config) {
    var exec_interval = modbus_config.exec_interval;
    var max_response_time = modbus_config.max_response_time;
    var retry_times = modbus_config.retry_times;
    var pass_through_enable = modbus_config.pass_through_enable;
    var pass_through_direct = modbus_config.pass_through_direct;
    var pass_through_port = modbus_config.pass_through_port;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(pass_through_enable) === -1) {
        throw new Error("modbus_config.pass_through_enable must be one of " + enable_values.join(", "));
    }
    var mode_map = { 0: "active", 1: "bidirectional" };
    var mode_values = getValues(mode_map);
    if (mode_values.indexOf(pass_through_direct) === -1) {
        throw new Error("modbus_config.pass_through_direct must be one of " + mode_values.join(", "));
    }
    if (pass_through_port < 2 || pass_through_port > 223) {
        throw new Error("modbus_config.pass_through_port must be between 2 and 223");
    }

    var data = 0x00;
    data |= getValue(enable_map, pass_through_enable) << 4;
    data |= getValue(mode_map, pass_through_direct);

    var buffer = new Buffer(9);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x79);
    buffer.writeUInt16LE(exec_interval);
    buffer.writeUInt16LE(max_response_time);
    buffer.writeUInt8(retry_times);
    buffer.writeUInt8(data);
    buffer.writeUInt8(pass_through_port);
    return buffer.toBytes();
}

/**
 * Query modbus serial port config
 * @param {number} query_modbus_serial_port_config values: (0: no, 1: yes)
 * @example { "query_modbus_serial_port_config": 1 }
 */
function queryModbusSerialPortConfig(query_modbus_serial_port_config) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(query_modbus_serial_port_config) === -1) {
        throw new Error("query_modbus_serial_port_config must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, query_modbus_serial_port_config) === 0) {
        return [];
    }
    return [0xf9, 0x7a, 0x00];
}

/**
 * Query modbus config
 * @param {number} query_modbus_config values: (0: no, 1: yes)
 * @example { "query_modbus_config": 1 }
 */
function queryModbusConfig(query_modbus_config) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(query_modbus_config) === -1) {
        throw new Error("query_modbus_config must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, query_modbus_config) === 0) {
        return [];
    }
    return [0xf9, 0x7a, 0x01];
}

/**
 * Set modbus channel config
 * @param {object} modbus_channels
 * @param {number} modbus_channels._item.channel_id range: [1, 32]
 * @param {number} modbus_channels._item.slave_id range: [1, 255]
 * @param {number} modbus_channels._item.register_address range: [0, 65535]
 * @param {number} modbus_channels._item.register_type values: (
 *              0: MB_REG_COIL, 1: MB_REG_DIS,
 *              2: MB_REG_INPUT_AB, 3: MB_REG_INPUT_BA,
 *              4: MB_REG_INPUT_INT32_ABCD, 5: MB_REG_INPUT_INT32_BADC, 6: MB_REG_INPUT_INT32_CDAB, 7: MB_REG_INPUT_INT32_DCBA,
 *              8: MB_REG_INPUT_INT32_AB, 9: MB_REG_INPUT_INT32_CD,
 *              10: MB_REG_INPUT_FLOAT_ABCD, 11: MB_REG_INPUT_FLOAT_BADC, 12: MB_REG_INPUT_FLOAT_CDAB, 13: MB_REG_INPUT_FLOAT_DCBA,
 *              14: MB_REG_HOLD_INT16_AB, 15: MB_REG_HOLD_INT16_BA,
 *              16: MB_REG_HOLD_INT32_ABCD, 17: MB_REG_HOLD_INT32_BADC, 18: MB_REG_HOLD_INT32_CDAB, 19: MB_REG_HOLD_INT32_DCBA,
 *              20: MB_REG_HOLD_INT32_AB, 21: MB_REG_HOLD_INT32_CD,
 *              22: MB_REG_HOLD_FLOAT_ABCD, 23: MB_REG_HOLD_FLOAT_BADC, 24: MB_REG_HOLD_FLOAT_CDAB, 25: MB_REG_HOLD_FLOAT_DCBA,
 *              26: MB_REG_INPUT_DOUBLE_ABCDEFGH, 27: MB_REG_INPUT_DOUBLE_GHEFCDAB, 28: MB_REG_INPUT_DOUBLE_BADCFEHG, 29: MB_REG_INPUT_DOUBLE_HGFEDCBA,
 *              30: MB_REG_INPUT_INT64_ABCDEFGH, 31: MB_REG_INPUT_INT64_GHEFCDAB, 32: MB_REG_INPUT_INT64_BADCFEHG, 33: MB_REG_INPUT_INT64_HGFEDCBA,
 *              34: MB_REG_HOLD_DOUBLE_ABCDEFGH, 35: MB_REG_HOLD_DOUBLE_GHEFCDAB, 36: MB_REG_HOLD_DOUBLE_BADCFEHG, 37: MB_REG_HOLD_DOUBLE_HGFEDCBA,
 *              38: MB_REG_HOLD_INT64_ABCDEFGH, 39: MB_REG_HOLD_INT64_GHEFCDAB, 40: MB_REG_HOLD_INT64_BADCFEHG, 41: MB_REG_HOLD_INT64_HGFEDCBA,
 *              )
 * @param {number} modbus_channels._item.quantity range: [1, 16]
 * @param {number} modbus_channels._item.sign values: (0: unsigned, 1: signed)
 * @example { "modbus_channels": [ { "channel_id": 1, "slave_id": 1, "register_address": 1, "quantity": 1, "register_type": 1, "sign": 1 } ] }
 */
function setModbusChannel(modbus_channels) {
    var channel_id = modbus_channels.channel_id;
    var slave_id = modbus_channels.slave_id;
    var register_address = modbus_channels.register_address;
    var quantity = modbus_channels.quantity;
    var register_type = modbus_channels.register_type;
    var sign = modbus_channels.sign;

    if (channel_id < 1 || channel_id > 32) {
        throw new Error("modbus_channels._item.channel_id must be between 1 and 32");
    }
    if (slave_id < 1 || slave_id > 255) {
        throw new Error("modbus_channels._item.slave_id must be between 1 and 255");
    }
    if (register_address < 0 || register_address > 65535) {
        throw new Error("modbus_channels._item.address must be between 0 and 65535");
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
    var register_type_values = getValues(register_type_map);
    if (register_type_values.indexOf(register_type) === -1) {
        throw new Error("modbus_channels._item.register_type must be one of " + register_type_values.join(", "));
    }
    var sign_map = { 0: "unsigned", 1: "signed" };
    var sign_values = getValues(sign_map);
    if (sign_values.indexOf(sign) === -1) {
        throw new Error("modbus_channels._item.sign must be one of " + sign_values.join(", "));
    }
    var quantity_values = [1, 2];
    if (quantity_values.indexOf(quantity) === -1) {
        throw new Error("modbus_channels._item.quantity must be one of " + quantity_values.join(", "));
    }

    var data = 0x00;
    data |= getValue(sign_map, sign) << 4;
    data |= quantity;

    var buffer = new Buffer(9);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xef);
    buffer.writeUInt8(0x01); // config modbus channel
    buffer.writeUInt8(channel_id);
    buffer.writeUInt8(slave_id);
    buffer.writeUInt16LE(register_address);
    buffer.writeUInt8(getValue(register_type_map, register_type));
    buffer.writeUInt8(data);
    return buffer.toBytes();
}

/**
 * set modbus channel name
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
 * remove modbus channel
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
 * set retransmit config
 * @since v2.0
 * @param {object} retransmit_config
 * @param {number} retransmit_config.enable values: (0: disable, 1: enable)
 * @param {number} retransmit_config.interval range: [30, 1200], unit: seconds
 * @example { "retransmit_config": { "enable": 1, "interval": 60 } }
 */
function setRetransmitConfig(retransmit_config) {
    var enable = retransmit_config.enable;
    var interval = retransmit_config.interval;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("retransmit_config.enable must be one of " + enable_values.join(", "));
    }
    if (typeof interval !== "number") {
        throw new Error("retransmit_config.interval must be a number");
    }
    if (interval < 30 || interval > 1200) {
        throw new Error("retransmit_config.interval must be in range [30, 1200]");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x0d);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt16LE(interval);
    return buffer.toBytes();
}

/**
 * set resend interval
 * @since v2.0
 * @param {number} resend_interval unit: second, range: [30, 1200]
 * @example { "resend_interval": 60 }
 */
function setResendInterval(resend_interval) {
    if (typeof resend_interval !== "number") {
        throw new Error("resend_interval must be a number");
    }
    if (resend_interval < 30 || resend_interval > 1200) {
        throw new Error("resend_interval must be in range [30, 1200]");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x0e);
    buffer.writeUInt16LE(resend_interval);
    return buffer.toBytes();
}

/**
 * set retransmit enable
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
 * fetch history
 * @since v2.0
 * @param {object} fetch_history
 * @param {number} fetch_history.start_time
 * @param {number} fetch_history.end_time
 * @example { "fetch_history": { "start_time": 1609459200, "end_time": 1609545600 } }
 */
function fetchHistory(fetch_history) {
    var start_time = fetch_history.start_time;
    var end_time = fetch_history.end_time || 0;

    if (typeof start_time !== "number") {
        throw new Error("fetch_history.start_time must be a number");
    }
    if (end_time && typeof end_time !== "number") {
        throw new Error("fetch_history.end_time must be a number");
    }
    if (end_time && start_time > end_time) {
        throw new Error("fetch_history.start_time must be less than fetch_history.end_time");
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
 * set batch enable rules
 * @param {object} batch_enable_rules
 * @param {number} batch_enable_rules.rule_1 values: (0: no, 1: yes)
 * @param {number} batch_enable_rules.rule_x values: (0: no, 1: yes)
 * @param {number} batch_enable_rules.rule_16 values: (0: no, 1: yes)
 * @example { "batch_enable_rules": { "rule_1": 1, "rule_15": 1, "rule_16": 1 } }
 */
function setBatchEnableRules(batch_enable_rules) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    var rules_offset = { rule_1: 0, rule_2: 1, rule_3: 2, rule_4: 3, rule_5: 4, rule_6: 5, rule_7: 6, rule_8: 7, rule_9: 8, rule_10: 9, rule_11: 10, rule_12: 11, rule_13: 12, rule_14: 13, rule_15: 14, rule_16: 15 };

    var data = 0x00;
    for (var key in rules_offset) {
        if (key in batch_enable_rules) {
            if (yes_no_values.indexOf(batch_enable_rules[key]) === -1) {
                throw new Error("batch_enable_rules." + key + " must be one of " + yes_no_values.join(", "));
            }
            data |= getValue(yes_no_map, batch_enable_rules[key]) << rules_offset[key];
        }
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x76);
    buffer.writeUInt16LE(data);
    buffer.writeUInt8(0x01);
    return buffer.toBytes();
}

/**
 * set batch disable rules
 * @param {object} batch_disable_rules
 * @param {number} batch_disable_rules.rule_1 values: (0: no, 1: yes)
 * @param {number} batch_disable_rules.rule_x values: (0: no, 1: yes)
 * @param {number} batch_disable_rules.rule_16 values: (0: no, 1: yes)
 * @example { "batch_disable_rules": { "rule_1": 1, "rule_15": 1, "rule_16": 1 } }
 */
function setBatchDisableRules(batch_disable_rules) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    var rules_offset = { rule_1: 0, rule_2: 1, rule_3: 2, rule_4: 3, rule_5: 4, rule_6: 5, rule_7: 6, rule_8: 7, rule_9: 8, rule_10: 9, rule_11: 10, rule_12: 11, rule_13: 12, rule_14: 13, rule_15: 14, rule_16: 15 };

    var data = 0x00;
    for (var key in rules_offset) {
        if (key in batch_disable_rules) {
            if (yes_no_values.indexOf(batch_disable_rules[key]) === -1) {
                throw new Error("batch_disable_rules." + key + " must be one of " + yes_no_values.join(", "));
            }
            data |= getValue(yes_no_map, batch_disable_rules[key]) << rules_offset[key];
        }
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x76);
    buffer.writeUInt16LE(data);
    buffer.writeUInt8(0x02);
    return buffer.toBytes();
}

/**
 * set batch remove rules
 * @param {object} batch_remove_rules
 * @param {number} batch_remove_rules.rule_1 values: (0: no, 1: yes)
 * @param {number} batch_remove_rules.rule_x values: (0: no, 1: yes)
 * @param {number} batch_remove_rules.rule_16 values: (0: no, 1: yes)
 * @example { "batch_remove_rules": { "rule_1": 1, "rule_15": 1, "rule_16": 1 } }
 */
function setBatchRemoveRules(batch_remove_rules) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    var rules_offset = { rule_1: 0, rule_2: 1, rule_3: 2, rule_4: 3, rule_5: 4, rule_6: 5, rule_7: 6, rule_8: 7, rule_9: 8, rule_10: 9, rule_11: 10, rule_12: 11, rule_13: 12, rule_14: 13, rule_15: 14, rule_16: 15 };

    var data = 0x00;
    for (var key in rules_offset) {
        if (key in batch_remove_rules) {
            if (yes_no_values.indexOf(batch_remove_rules[key]) === -1) {
                throw new Error("batch_remove_rules." + key + " must be one of " + yes_no_values.join(", "));
            }
            data |= getValue(yes_no_map, batch_remove_rules[key]) << rules_offset[key];
        }
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x76);
    buffer.writeUInt16LE(data);
    buffer.writeUInt8(0x03);
    return buffer.toBytes();
}

/**
 * query rule config
 * @param {number} query_rule_config range: [1, 16]
 * @example { "query_rule_config": 1 }
 */
function queryRuleConfig(query_rule_config) {
    if (typeof query_rule_config !== "number") {
        throw new Error("query_rule_config must be a number");
    }
    if (query_rule_config < 1 || query_rule_config > 16) {
        throw new Error("query_rule_config must be in range [1, 16]");
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x77);
    buffer.writeUInt8(query_rule_config);
    return buffer.toBytes();
}

/**
 * set rule config
 * @param {object} rule_config
 * @param {number} rule_config._item.rule_id range: [1, 16]
 * @param {number} rule_config._item.enable values: (0: disable, 1: enable)
 * @param {object} rule_config._item.condition
 * @param {Array} rule_config._item.action
 * @example { "rule_config": [{ "rule_id": 1, "enable": 1, "condition": { "type": 1, "time_condition": { "mode": 0, "week_mask": 0, "day_mask": 0, "hour": 0, "minute": 0 } }, "action": [{ "type": 1, "message_action": { "message": "Hello, world!" } }, { "type": 1, "message_action": { "message": "Hello, world!" } }, { "type": 1, "message_action": { "message": "Hello, world!" } }]     } }] }
 */
function setRuleConfig(rule_config) {
    var enable = rule_config.enable;
    var rule_id = rule_config.rule_id;
    var condition = rule_config.condition;
    var action = rule_config.action;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("rule_config._item.enable must be one of " + enable_values.join(", "));
    }
    if (rule_id < 1 || rule_id > 16) {
        throw new Error("rule_config._item.rule_id must be in range [1, 16]");
    }

    var chn_data = 0x00;
    chn_data |= getValue(enable_map, enable) << 7;
    chn_data |= rule_id;

    var encoded = [];
    if ("condition" in rule_config) {
        var data = writeCondition(condition);
        var buffer = new Buffer(3 + data.length);
        buffer.writeUInt8(0xf9);
        buffer.writeUInt8(0x7d);
        buffer.writeUInt8(chn_data);
        buffer.writeBytes(data);
        encoded = encoded.concat(buffer.toBytes());
    }
    if ("action" in rule_config) {
        for (var i = 0; i < action.length; i++) {
            var data = writeAction(action[i]);
            var buffer = new Buffer(3 + data.length);
            buffer.writeUInt8(0xf9);
            buffer.writeUInt8(0x7d);
            buffer.writeUInt8(chn_data);
            buffer.writeBytes(data);
            encoded = encoded.concat(buffer.toBytes());
        }
    }
    return encoded;
}

/**
 * encode condition
 * @param {object} condition
 * @param {number} condition.type values: (0: none, 1: time, 2: value, 3: modbus_cmd, 4: message, 5: d2d, 6: reboot)
 * @param {object} condition.time_condition
 * @param {object} condition.modbus_value_condition
 * @param {object} condition.modbus_cmd_condition
 * @param {object} condition.message_condition
 * @param {object} condition.d2d_condition
 * @param {object} condition.reboot_condition
 * @example { "condition": { "type": 1, "time_condition": { } } }
 */
function writeCondition(condition) {
    var condition_type = condition.type;

    var condition_map = { 0: "none", 1: "time", 2: "modbus_value", 3: "modbus_cmd", 4: "message", 5: "d2d", 6: "reboot" };
    var condition_values = getValues(condition_map);
    if (condition_values.indexOf(condition_type) === -1) {
        throw new Error("condition.type must be one of " + condition_values.join(", "));
    }

    var params_data = [];
    var condition_value = getValue(condition_map, condition_type);
    switch (condition_value) {
        case 0x00: // NONE CONDITION
            break;
        case 0x01: // TIME CONDITION
            params_data = writeTimeCondition(condition.time_condition);
            break;
        case 0x02: // MODBUS VALUE CONDITION
            params_data = writeModbusValueCondition(condition.modbus_value_condition);
            break;
        case 0x03: // MODBUS CMD CONDITION
            params_data = writeModbusCmdCondition(condition.modbus_cmd_condition);
            break;
        case 0x04: // MESSAGE CONDITION
            params_data = writeMessageCondition(condition.message_condition);
            break;
        case 0x05: // D2D CONDITION
            params_data = writeD2DCondition(condition.d2d_condition);
            break;
        case 0x06: // REBOOT CONDITION
            break;
    }

    var condition_data = 0x00;
    condition_data |= 0 << 7; // condition type
    condition_data |= 1 << 4; // condition id
    condition_data |= getValue(condition_map, condition_type);

    var buffer = new Buffer(1 + params_data.length);
    buffer.writeUInt8(condition_data);
    if (params_data.length > 0) {
        buffer.writeBytes(params_data);
    }
    return buffer.toBytes();
}

/**
 * write time condition
 * @param {object} time_condition
 * @param {number} time_condition.mode values: (0: weekdays, 1: days)
 * @param {Array} time_condition.weekdays range: [1, 7]
 * @param {Array} time_condition.days range: [1, 31]
 * @param {number} time_condition.hour range: [0, 23]
 * @param {number} time_condition.minute range: [0, 59]
 * @example { "time_condition": { "mode": 0, "weekdays": [1, 2, 3, 4, 5], "days": [1, 2, 3, 4, 5], "hour": 8, "minute": 30 } }
 */
function writeTimeCondition(time_condition) {
    var mode = time_condition.mode;
    var weekdays = time_condition.weekdays;
    var days = time_condition.days;
    var hour = time_condition.hour;
    var minute = time_condition.minute;

    // validate values
    var cycle_mode_map = { 0: "weekdays", 1: "days" };
    var cycle_mode_values = getValues(cycle_mode_map);
    if (cycle_mode_values.indexOf(mode) === -1) {
        throw new Error("rule_config._item.condition.time_condition.mode must be one of " + cycle_mode_values.join(", "));
    }
    if ("weekdays" in time_condition) {
        for (var i = 0; i < weekdays.length; i++) {
            if (weekdays[i] < 1 || weekdays[i] > 7) {
                throw new Error("rule_config._item.condition.time_condition.weekdays must be in range [1, 7]");
            }
        }
    }
    if ("days" in time_condition) {
        for (var i = 0; i < days.length; i++) {
            if (days[i] < 1 || days[i] > 31) {
                throw new Error("rule_config._item.condition.time_condition.days must be in range [1, 31]");
            }
        }
    }
    if (hour < 0 || hour > 23) {
        throw new Error("rule_config._item.condition.time_condition.hour must be in range [0, 23]");
    }
    if (minute < 0 || minute > 59) {
        throw new Error("rule_config._item.condition.time_condition.minute must be in range [0, 59]");
    }

    // encode
    var mask = 0x00;
    if ("weekdays" in time_condition) {
        for (var i = 0; i < weekdays.length; i++) {
            mask |= 1 << (weekdays[i] - 1);
        }
    } else if ("days" in time_condition) {
        for (var i = 0; i < days.length; i++) {
            mask |= 1 << (days[i] - 1);
        }
    }

    var buffer = new Buffer(7);
    buffer.writeUInt8(getValue(cycle_mode_map, mode));
    buffer.writeUInt32LE(mask);
    buffer.writeUInt8(hour);
    buffer.writeUInt8(minute);
    return buffer.toBytes();
}

/**
 * write modbus value condition
 * @param {object} modbus_value_condition
 * @param {number} modbus_value_condition.channel_id
 * @param {number} modbus_value_condition.condition values: (0: false, 1: true, 2: below, 3: above, 4: between, 5: outside, 6: change_with_time, 7: change_without_time)
 * @param {number} modbus_value_condition.holding_mode values: (0: below, 1: above)
 * @param {number} modbus_value_condition.min
 * @param {number} modbus_value_condition.max
 * @param {number} modbus_value_condition.mutation
 * @param {number} modbus_value_condition.mutation_duration
 * @param {number} modbus_value_condition.continue_time
 * @param {number} modbus_value_condition.lock_time
 * @example { "modbus_value_condition": { "condition": 1, "min": 1, "max": 2, "mutation": 0 } }
 */
function writeModbusValueCondition(modbus_value_condition) {
    var channel_id = modbus_value_condition.channel_id;
    var condition = modbus_value_condition.condition;
    var holding_mode = modbus_value_condition.holding_mode;
    var threshold_min = modbus_value_condition.threshold_min || 0;
    var threshold_max = modbus_value_condition.threshold_max || 0;
    var mutation = modbus_value_condition.mutation || 0;
    var mutation_duration = modbus_value_condition.mutation_duration || 0;
    var continue_time = modbus_value_condition.continue_time || 0;
    var lock_time = modbus_value_condition.lock_time || 0;

    // validate values
    var condition_map = { 0: "false", 1: "true", 2: "below", 3: "above", 4: "between", 5: "outside", 6: "change_with_time", 7: "change_without_time" };
    var condition_values = getValues(condition_map);
    if (condition_values.indexOf(condition) === -1) {
        throw new Error("rule_config._item.condition.modbus_value_condition.condition must be one of " + condition_values.join(", "));
    }

    var condition_value = getValue(condition_map, condition);
    if (condition_value < 5) {
        var holding_mode_map = { 0: "below", 1: "above" };
        var holding_mode_values = getValues(holding_mode_map);
        if (holding_mode_values.indexOf(holding_mode) === -1) {
            throw new Error("rule_config._item.condition.modbus_value_condition.holding_mode must be one of " + holding_mode_values.join(", "));
        }
    }
    // value below condition (min, continue_time, lock_time)
    if (condition_value === 2 && !("min" in modbus_value_condition) && !("continue_time" in modbus_value_condition) && !("lock_time" in modbus_value_condition)) {
        throw new Error("rule_config._item.condition.modbus_value_condition.min and rule_config._item.condition.modbus_value_condition.continue_time are required");
    }
    // value above condition (max, continue_time, lock_time)
    if (condition_value === 3 && !("max" in modbus_value_condition) && !("continue_time" in modbus_value_condition) && !("lock_time" in modbus_value_condition)) {
        throw new Error("rule_config._item.condition.modbus_value_condition.max and rule_config._item.condition.modbus_value_condition.continue_time are required");
    }
    // value between condition (min, max, continue_time, lock_time)
    if (condition_value === 4 && !("min" in modbus_value_condition) && !("max" in modbus_value_condition) && !("continue_time" in modbus_value_condition) && !("lock_time" in modbus_value_condition)) {
        throw new Error("rule_config._item.condition.modbus_value_condition.min and rule_config._item.condition.modbus_value_condition.max are required");
    }
    // value outside condition (min, max, continue_time, lock_time)
    if (condition_value === 5 && !("min" in modbus_value_condition) && !("max" in modbus_value_condition) && !("continue_time" in modbus_value_condition) && !("lock_time" in modbus_value_condition)) {
        throw new Error("rule_config._item.condition.modbus_value_condition.min and rule_config._item.condition.modbus_value_condition.max are required");
    }
    // change with time condition (mutation, mutation_duration)
    if (condition_value === 6 && !("mutation" in modbus_value_condition) && !("mutation_duration" in modbus_value_condition)) {
        throw new Error("rule_config._item.condition.modbus_value_condition.mutation and rule_config._item.condition.modbus_value_condition.mutation_duration are required");
    }
    // change without time condition
    if (condition_value === 7 && !("mutation" in modbus_value_condition)) {
        throw new Error("rule_config._item.condition.modbus_value_condition.mutation is required");
    }

    var holding_mode_value = 0x00;
    if (condition_value < 5) {
        holding_mode_value = getValue(holding_mode_map, holding_mode);
    }
    // encode
    var condition_data = 0x00;
    condition_data |= getValue(condition_map, condition);
    condition_data |= holding_mode_value << 4;
    var value_1 = 0x00;
    var value_2 = 0x00;
    // condition(below, between)
    if (condition_value === 2 || condition_value === 4) {
        value_1 = threshold_min;
    } else if (condition_value === 3 || condition_value === 4) {
        value_2 = threshold_max;
    } else if (condition_value === 6 || condition_value === 7) {
        value_1 = mutation_duration;
        value_2 = mutation;
    }

    var buffer = new Buffer(18);
    buffer.writeUInt8(channel_id);
    buffer.writeUInt8(condition_data);
    buffer.writeUInt32LE(continue_time);
    buffer.writeUInt32LE(lock_time);
    buffer.writeFloatLE(value_1);
    buffer.writeFloatLE(value_2);
    return buffer.toBytes();
}

/**
 * write modbus cmd condition
 * @param {object} modbus_cmd_condition
 * @param {string} modbus_cmd_condition.cmd
 * @example { "modbus_cmd_condition": { "cmd": "1234567890" } }
 */
function writeModbusCmdCondition(modbus_cmd_condition) {
    var cmd = modbus_cmd_condition.cmd;

    // validate values
    if (typeof cmd !== "string") {
        throw new Error("modbus_cmd_condition.cmd must be a string");
    }
    if (cmd.length > 48) {
        throw new Error("modbus_cmd_condition.cmd must be less than 48 characters");
    }
    if (!/^[0-9a-fA-F]+$/.test(cmd)) {
        throw new Error("modbus_cmd_condition.cmd must be hex string [0-9a-fA-F]");
    }

    // encode
    var buffer = new Buffer(1 + cmd.length);
    buffer.writeUInt8(cmd.length);
    buffer.writeASCII(cmd);
    return buffer.toBytes();
}

/**
 * write message condition
 * @param {object} message_condition
 * @param {string} message_condition.message
 * @example { "message_condition": { "message": "1234567890" } }
 */
function writeMessageCondition(message_condition) {
    var message = message_condition.message;

    // validate values
    if (typeof message !== "string") {
        throw new Error("message_condition.message must be a string");
    }
    if (message.length > 48) {
        throw new Error("message_condition.message must be less than 48 characters");
    }
    if (!/^[0-9a-zA-Z,.;:!? ]+$/.test(message)) {
        throw new Error("message_condition.message must be hex string [0-9a-zA-Z,.;:!? ]");
    }

    // encode
    var buffer = new Buffer(1 + message.length);
    buffer.writeUInt8(message.length);
    buffer.writeASCII(message);
    return buffer.toBytes();
}

/**
 * write d2d condition
 * @param {object} d2d_condition
 * @param {string} d2d_condition.d2d_cmd
 * @param {number} d2d_condition.d2d_status values: (0: any, 1: on, 2: off)
 * @example { "d2d_condition": { "d2d_cmd": "1234", "d2d_status": 0 } }
 */
function writeD2DCondition(d2d_condition) {
    var d2d_cmd = d2d_condition.d2d_cmd;
    var d2d_status = d2d_condition.d2d_status;

    // validate values
    var d2d_status_map = { 0: "any", 1: "on", 2: "off" };
    var d2d_status_values = getValues(d2d_status_map);
    if (d2d_status_values.indexOf(d2d_status) === -1) {
        throw new Error("rule_config._item.condition.d2d_condition.d2d_status must be one of " + d2d_status_values.join(", "));
    }

    // encode
    var buffer = new Buffer(3);
    buffer.writeD2DCommand(d2d_cmd, "0000");
    buffer.writeUInt8(getValue(d2d_status_map, d2d_status));
    return buffer.toBytes();
}

/**
 * write action
 * @param {object} action
 * @param {number} action.index range: [1, 3]
 * @param {number} action.type values: (0: none, 1: message, 2: d2d, 3: modbus_cmd, 4: report_status, 5: report_alarm, 6: reboot)
 * @param {number} action.delay_time
 * @param {object} action.message_action
 * @param {object} action.d2d_action
 * @param {object} action.modbus_cmd_action
 * @param {object} action.report_status_action
 * @param {object} action.report_alarm_action
 * @param {object} action.reboot_action
 * @param {number} action.delay_time
 * @example { "action": { "type": 1, "delay_time": 1000, "message_action": { "message": "1234567890" } } }
 */
function writeAction(action) {
    var index = action.index;
    var type = action.type;
    var delay_time = action.delay_time;

    var action_map = { 0: "none", 1: "message", 2: "d2d", 3: "modbus_cmd", 4: "report_status", 5: "report_alarm", 6: "reboot" };
    var action_values = getValues(action_map);
    if (action_values.indexOf(type) === -1) {
        throw new Error("rule_config._item.action.type must be one of " + action_values.join(", "));
    }

    var action_type_value = getValue(action_map, type);
    var params_data = [];
    switch (action_type_value) {
        case 0x00:
            break;
        case 0x01: // MESSAGE ACTION
            params_data = writeMessageAction(action.message_action);
            break;
        case 0x02: // D2D ACTION
            params_data = writeD2DAction(action.d2d_action);
            break;
        case 0x03: // MODBUS CMD ACTION
            params_data = writeModbusAction(action.modbus_cmd_action);
            break;
        case 0x04: // REPORT STATUS ACTION
            break;
        case 0x05: // REPORT ALARM ACTION
            params_data = writeReportAlarmAction(action.report_alarm_action);
            break;
        case 0x06: // REBOOT ACTION
            break;
        default:
            throw new Error("rule_config._item.action.type must be one of " + action_values.join(", "));
    }

    var action_data = 0x00;
    action_data |= 1 << 7; // action type
    action_data |= index << 4; // action id
    action_data |= action_type_value;

    var buffer = new Buffer(5 + params_data.length);
    buffer.writeUInt8(action_data);
    buffer.writeUInt32LE(delay_time);
    if (params_data.length > 0) {
        buffer.writeBytes(params_data);
    }
    return buffer.toBytes();
}

/**
 * write message action
 * @param {object} message_action
 * @param {string} message_action.message range: [1, 48]
 * @example { "message_action": { "message": "1234567890" } }
 */
function writeMessageAction(message_action) {
    var message = message_action.message;

    // validate values
    if (typeof message !== "string") {
        throw new Error("message_action.message must be a string");
    }
    if (message.length < 1 || message.length > 48) {
        throw new Error("message_action.message must be in range [1, 48]");
    }
    if (!/^[0-9a-zA-Z,.;:!? ]+$/.test(message)) {
        throw new Error("message_action.message must be hex string [0-9a-zA-Z,.;:!? ]");
    }

    // encode
    var buffer = new Buffer(1 + message.length);
    buffer.writeUInt8(message.length);
    buffer.writeASCII(message);
    return buffer.toBytes();
}

/**
 * write d2d action
 * @param {object} d2d_action
 * @param {string} d2d_action.d2d_cmd
 * @example { "d2d_action": { "d2d_cmd": "1234567890" } }
 */
function writeD2DAction(d2d_action) {
    var d2d_cmd = d2d_action.d2d_cmd || "";

    // validate values
    if (typeof d2d_cmd !== "string") {
        throw new Error("d2d_action.d2d_cmd must be a string");
    }
    if (d2d_cmd.length > 48) {
        throw new Error("d2d_action.d2d_cmd must be less than 48 characters");
    }
    if (!/^[0-9a-fA-F]+$/.test(d2d_cmd)) {
        throw new Error("d2d_action.d2d_cmd must be hex string [0-9a-fA-F]");
    }

    // encode
    var buffer = new Buffer(2);
    buffer.writeD2DCommand(d2d_cmd, "0000");
    return buffer.toBytes();
}

/**
 * write modbus action
 * @param {object} modbus_cmd_action
 * @param {string} modbus_cmd_action.cmd
 * @example { "modbus_cmd_action": { "cmd": 1 } }
 */
function writeModbusAction(modbus_cmd_action) {
    var cmd = modbus_cmd_action.cmd;

    // validate values
    if (typeof cmd !== "string") {
        throw new Error("modbus_cmd_action.cmd must be a string");
    }
    if (cmd.length > 48) {
        throw new Error("modbus_cmd_action.cmd must be less than 48 characters");
    }
    if (!/^[0-9a-fA-F]+$/.test(cmd)) {
        throw new Error("modbus_cmd_action.cmd must be hex string [0-9a-fA-F]");
    }

    // encode
    var buffer = new Buffer(1 + cmd.length);
    buffer.writeUInt8(cmd.length);
    buffer.writeASCII(cmd);
    return buffer.toBytes();
}

/**
 * write report alarm action
 * @param {object} report_alarm_action
 * @param {number} report_alarm_action.release_enable values: (0: disable, 1: enable)
 * @example { "report_alarm_action": { "release_enable": 1 } }
 */
function writeReportAlarmAction(report_alarm_action) {
    var release_enable = report_alarm_action.release_enable;

    // validate values
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(release_enable) === -1) {
        throw new Error("rule_config._item.action.report_alarm_action.release_enable must be one of " + enable_values.join(", "));
    }

    // encode
    var buffer = new Buffer(1);
    buffer.writeUInt8(getValue(enable_map, release_enable));
    return buffer.toBytes();
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

Buffer.prototype.writeFloatLE = function (value) {
    var sign = value < 0 ? 1 : 0;
    var absValue = Math.abs(value);

    if (absValue === 0) {
        this._write(0, 4, true);
    } else if (Number.isNaN(absValue)) {
        this._write(0x7fc00000, 4, true);
    } else if (absValue === Infinity) {
        this._write(0x7f800000, 4, true);
    } else {
        var exponent = Math.floor(Math.log(absValue) / Math.LN2);
        var mantissa = absValue / Math.pow(2, exponent) - 1;

        var biasedExponent = exponent + 127; // Bias

        var exponentBits = biasedExponent << 23;
        var mantissaBits = Math.round(mantissa * Math.pow(2, 23));

        var floatBits = (sign << 31) | exponentBits | mantissaBits;

        this._write(floatBits, 4, true);
    }
    this.offset += 4;
};

Buffer.prototype.writeASCII = function (value) {
    for (var i = 0; i < value.length; i++) {
        this.buffer[this.offset + i] = value.charCodeAt(i);
    }
    this.offset += value.length;
};

Buffer.prototype.writeD2DCommand = function (value, defaultValue) {
    if (typeof value !== "string") {
        value = defaultValue;
    }
    if (value.length !== 4) {
        throw new Error("d2d_cmd length must be 4");
    }
    this.buffer[this.offset] = parseInt(value.substr(2, 2), 16);
    this.buffer[this.offset + 1] = parseInt(value.substr(0, 2), 16);
    this.offset += 2;
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
