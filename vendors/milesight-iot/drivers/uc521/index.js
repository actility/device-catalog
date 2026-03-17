/**
 * Payload Decoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product UC521
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

var valve_chns = [0x03, 0x05];
var valve_pulse_chns = [0x04, 0x06];
var gpio_chns = [0x07, 0x08];
var pressure_chns = [0x09, 0x0a];
var pressure_alarm_chns = [0x0b, 0x0c];
var valve_exception_chns = [0xb3, 0xb5];
var pressure_exception_chns = [0xb9, 0xba];
var valve_opening_duration_chns = [0x0e, 0x0f];

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
        // VALVE
        else if (includes(valve_chns, channel_id) && channel_type === 0xf6) {
            var valve_chn_name = "valve_" + (valve_chns.indexOf(channel_id) + 1);
            var valve_type_value = bytes[i];
            var valve_type = readValveType(valve_type_value);
            var valve_opening = readUInt8(bytes[i + 1]);

            switch (valve_type_value) {
                case 0x00:
                    decoded[valve_chn_name + "_type"] = valve_type;
                    decoded[valve_chn_name + "_opening"] = valve_opening;
                    break;
                case 0x01:
                    decoded[valve_chn_name + "_type"] = valve_type;
                    if (valve_opening > 100) {
                        decoded[valve_chn_name + "_opening"] = valve_opening - 100;
                        decoded[valve_chn_name + "_direction"] = readValveDirection(1);
                    } else {
                        decoded[valve_chn_name + "_opening"] = valve_opening;
                        decoded[valve_chn_name + "_direction"] = readValveDirection(0);
                    }
                    break;
            }
            i += 2;
        }
        // VALVE PULSE
        else if (includes(valve_pulse_chns, channel_id) && channel_type === 0xc8) {
            var valve_pulse_chn_name = "valve_" + (valve_pulse_chns.indexOf(channel_id) + 1);
            decoded[valve_pulse_chn_name + "_pulse"] = readUInt32LE(bytes.slice(i, i + 4));
            i += 4;
        }
        // GPIO
        else if (includes(gpio_chns, channel_id) && channel_type === 0x01) {
            var gpio_chn_name = "gpio_" + (channel_id - gpio_chns[0] + 1);
            decoded[gpio_chn_name] = readGPIOStatus(bytes[i]);
            i += 1;
        }
        // PIPE PRESSURE
        else if (includes(pressure_chns, channel_id) && channel_type === 0x7b) {
            var pressure_chn_name = "pressure_" + (pressure_chns.indexOf(channel_id) + 1);
            decoded[pressure_chn_name] = readUInt16LE(bytes.slice(i, i + 2));
            i += 2;
        }
        // PIPE PRESSURE ALARM
        else if (includes(pressure_alarm_chns, channel_id) && channel_type === 0xf5) {
            var pressure_chn_name = "pressure_" + (pressure_alarm_chns.indexOf(channel_id) + 1);

            var source_type = readSourceType(bytes[i]);
            var condition_type_value = bytes[i + 1];
            var condition_type = readMathConditionType(condition_type_value);
            var min = readUInt16LE(bytes.slice(i + 2, i + 4));
            var max = readUInt16LE(bytes.slice(i + 4, i + 6));
            var pressure = readUInt16LE(bytes.slice(i + 6, i + 8));
            var alarm = readPressureAlarmType(bytes[i + 8]);
            i += 9;

            var event = {};
            event.source = source_type;
            event.condition = condition_type;
            switch (condition_type_value) {
                case 0x01:
                    event.threshold_min = min;
                    break;
                case 0x02:
                    event.threshold_max = max;
                    break;
                case 0x03:
                case 0x04:
                    event.threshold_min = min;
                    event.threshold_max = max;
                    break;
            }
            event.pressure = pressure;
            event.alarm = alarm;

            decoded[pressure_chn_name] = pressure;
            decoded[pressure_chn_name + "_alarm_event"] = event;
        }
        // VALVE CALIBRATION EVENT
        else if (channel_id === 0x0d && channel_type === 0xe3) {
            var valve_channel = readUInt8(bytes[i]) + 1;
            var valve_chn_name = "valve_" + valve_channel;

            var event = {};
            event.source_value = readUInt8(bytes[i + 1]);
            event.target_value = readUInt8(bytes[i + 2]);
            event.result = readCalibrationResult(bytes[i + 3]);
            i += 4;

            decoded[valve_chn_name + "_calibration_event"] = event;
        }
        // VALVE SENSOR STATUS
        else if (includes(valve_exception_chns, channel_id) && channel_type === 0xf6) {
            var valve_chn_name = "valve_" + (valve_exception_chns.indexOf(channel_id) + 1);
            var valve_type = readValveType(bytes[i]);
            var sensor_status = readValveSensorStatus(bytes[i + 1]);
            i += 2;

            decoded[valve_chn_name + "_type"] = valve_type;
            decoded[valve_chn_name + "_sensor_status"] = sensor_status;
        }
        // PIPE PRESSURE EXCEPTION
        else if (includes(pressure_exception_chns, channel_id) && channel_type === 0x7b) {
            var pressure_chn_name = "pressure_" + (pressure_exception_chns.indexOf(channel_id) + 1);
            var sensor_status = readPressureSensorStatus(bytes[i]);
            decoded[pressure_chn_name + "_sensor_status"] = sensor_status;
            i += 1;
        }
        // VALVE OPENING DURATION
        else if (includes(valve_opening_duration_chns, channel_id) && channel_type === 0x01) {
            var valve_chn_name = "valve_" + (valve_opening_duration_chns.indexOf(channel_id) + 1);
            decoded[valve_chn_name + "_opening_duration"] = readUInt8(bytes[i]);
            i += 1;
        }
        // CUSTOM MESSAGE
        else if (channel_id === 0xff && channel_type === 0x2a) {
            var length = bytes[i];
            decoded.custom_message = readAscii(bytes.slice(i + 1, i + length + 1));
            i += length + 1;
        }
        // DOWNLINK RESPONSE
        else if (channel_id === 0xfe || channel_id === 0xff) {
            var result = handle_downlink_response(channel_type, bytes, i);
            decoded = Object.assign(decoded, result.data);
            i = result.offset;
        }
        // DOWNLINK RESPONSE EXT
        else if (channel_id === 0xf8 || channel_id === 0xf9) {
            var result = handle_downlink_response_ext(channel_id, channel_type, bytes, i);
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
        case 0x1e:
            decoded.class_a_response_time = readUInt32LE(bytes.slice(offset, offset + 4));
            offset += 4;
            break;
        case 0x28:
            decoded.report_status = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x35:
            decoded.d2d_key = readHexString(bytes.slice(offset, offset + 8));
            offset += 8;
            break;
        case 0x46:
            decoded.gpio_jitter_time = readUInt8(bytes[offset]);
            offset += 1;
            break;
        case 0x4a:
            decoded.sync_time = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x4b: // batch_read_rules
            var type = readUInt8(bytes[offset]);
            var rule_bit_offset = { rule_1: 0, rule_2: 1, rule_3: 2, rule_4: 3, rule_5: 4, rule_6: 5, rule_7: 6, rule_8: 7, rule_9: 8, rule_10: 9, rule_11: 10, rule_12: 11, rule_13: 12, rule_14: 13, rule_15: 14, rule_16: 15 };
            // batch read rules
            if (type === 0) {
                decoded.batch_read_rules = {};
                var data = readUInt16LE(bytes.slice(offset + 1, offset + 3));
                for (var key in rule_bit_offset) {
                    decoded.batch_read_rules[key] = readYesNoStatus((data >>> rule_bit_offset[key]) & 0x01);
                }
            }
            // batch enable rules
            else if (type === 1) {
                decoded.batch_enable_rules = {};
                var data = readUInt16LE(bytes.slice(offset + 1, offset + 3));
                for (var key in rule_bit_offset) {
                    decoded.batch_enable_rules[key] = readEnableStatus((data >>> rule_bit_offset[key]) & 0x01);
                }
            }
            // batch remove rules
            else if (type === 2) {
                decoded.batch_remove_rules = {};
                var data = readUInt16LE(bytes.slice(offset + 1, offset + 3));
                for (var key in rule_bit_offset) {
                    decoded.batch_remove_rules[key] = readYesNoStatus((data >>> rule_bit_offset[key]) & 0x01);
                }
            }
            // enable single rule
            else if (type === 3) {
                var rule_index = readUInt8(bytes[offset + 1]);
                var rule_x_name = "rule_" + rule_index + "_enable";
                decoded[rule_x_name] = readEnableStatus(bytes[offset + 2]);
            }
            // remove single rule
            else if (type === 4) {
                var rule_index = readUInt8(bytes[offset + 1]);
                var rule_x_name = "rule_" + rule_index + "_remove";
                decoded[rule_x_name] = readYesNoStatus(bytes[offset + 2]);
            }
            offset += 3;
            break;
        case 0x4e:
            var valve_index = readUInt8(bytes[offset]);
            var valve_index_name = "clear_valve_" + valve_index + "_pulse";
            // ignore the next byte
            decoded[valve_index_name] = readYesNoStatus(1);
            offset += 2;
            break;
        case 0x52:
            // ignore the first byte
            decoded.valve_filter_config = {};
            decoded.valve_filter_config.mode = readValveFilterMode(readUInt8(bytes[offset + 1]));
            decoded.valve_filter_config.time = readUInt16LE(bytes.slice(offset + 2, offset + 4));
            offset += 4;
            break;
        case 0x53:
            var rule_index = readUInt8(bytes[offset]);
            var rule_index_name = "rule_" + rule_index;
            decoded.query_rule_config = decoded.query_rule_config || {};
            decoded.query_rule_config[rule_index_name] = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x55:
            var rule_config = {};
            rule_config.id = readUInt8(bytes[offset]);
            rule_config.enable = readEnableStatus(bytes[offset + 1]);
            rule_config.condition = readRuleCondition(bytes.slice(offset + 2, offset + 15));
            rule_config.action = readRuleAction(bytes.slice(offset + 15, offset + 28));
            offset += 29;

            decoded.rules_config = decoded.rules_config || [];
            decoded.rules_config.push(rule_config);
            break;
        case 0x84:
            decoded.d2d_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x8e:
            // ignore the first byte
            decoded.report_interval = readUInt16LE(bytes.slice(offset + 1, offset + 3));
            offset += 3;
            break;
        case 0x92:
            var valve_index = readUInt8(bytes[offset]);
            var valve_index_name = "valve_" + valve_index + "_pulse";
            decoded[valve_index_name] = readUInt32LE(bytes.slice(offset + 1, offset + 5));
            offset += 5;
            break;
        case 0xbd:
            decoded.time_zone = readTimeZone(readInt16LE(bytes.slice(offset, offset + 2)));
            offset += 2;
            break;
        case 0xf3:
            decoded.response_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        default:
            throw new Error("unknown downlink response");
    }

    return { data: decoded, offset: offset };
}

function handle_downlink_response_ext(code, channel_type, bytes, offset) {
    var decoded = {};

    switch (channel_type) {
        case 0x1a:
            var data = readUInt8(bytes[offset]);
            var valve_index = ((data >> 7) & 0x01) + 1;
            var valve_index_name = "valve_" + valve_index + "_config";
            decoded[valve_index_name] = {};
            decoded[valve_index_name].valve_type = readValveType((data >> 6) & 0x01);
            decoded[valve_index_name].auto_calibration_enable = readEnableStatus((data >> 5) & 0x01);
            decoded[valve_index_name].report_after_calibration_enable = readEnableStatus((data >> 4) & 0x01);
            decoded[valve_index_name].stall_strategy = readStallStrategy((data >> 3) & 0x01);
            decoded[valve_index_name].open_time_1 = bytes[offset + 1];
            decoded[valve_index_name].open_time_2 = bytes[offset + 2];
            decoded[valve_index_name].stall_current = readUInt16LE(bytes.slice(offset + 3, offset + 5));
            decoded[valve_index_name].stall_time = readUInt16LE(bytes.slice(offset + 5, offset + 7));
            decoded[valve_index_name].protect_time = bytes[offset + 7];
            decoded[valve_index_name].close_delay_time = bytes[offset + 8];
            decoded[valve_index_name].open_delay_time = bytes[offset + 9];
            offset += 10;
            break;
        case 0x19:
            var data = readUInt8(bytes[offset]);
            var valve_index = (data & 0x01) + 1;
            var time_control_enable_value = (data >> 7) & 0x01;
            var valve_pulse_control_enable_value = (data >> 6) & 0x01;
            var valve_index_name = "valve_" + valve_index + "_task";
            decoded[valve_index_name] = {};
            decoded[valve_index_name].time_control_enable = readEnableStatus(time_control_enable_value);
            decoded[valve_index_name].valve_pulse_control_enable = readEnableStatus(valve_pulse_control_enable_value);
            decoded[valve_index_name].task_id = readUInt8(bytes[offset + 1]);
            decoded[valve_index_name].valve_opening = readUInt8(bytes[offset + 2]);
            offset += 3;

            if (time_control_enable_value === 1) {
                decoded[valve_index_name].time = readUInt16LE(bytes.slice(offset, offset + 2));
                offset += 2;
            }
            if (valve_pulse_control_enable_value === 1) {
                decoded[valve_index_name].pulse = readUInt32LE(bytes.slice(offset, offset + 4));
                offset += 4;
            }
            break;
        case 0x5b:
            var pressure_index = readUInt8(bytes[offset]);
            var pressure_index_name = "pressure_" + pressure_index + "_calibration_settings";
            decoded[pressure_index_name] = {};
            decoded[pressure_index_name].enable = readEnableStatus(bytes[offset + 1]);
            decoded[pressure_index_name].calibration_value = readInt16LE(bytes.slice(offset + 2, offset + 4));
            offset += 4;
            break;
        case 0x68:
            var index = readUInt8(bytes[offset]);
            var index_name = "pressure_" + index + "_collection_interval";
            decoded[index_name] = {};
            decoded[index_name].enable = readEnableStatus(bytes[offset + 1]);
            decoded[index_name].collection_interval = readUInt16LE(bytes.slice(offset + 2, offset + 4));
            offset += 4;
            break;
        case 0x6e:
            decoded.wiring_switch_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x6f:
            decoded.valve_change_report_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x70:
            decoded.query_valve_opening_duration = decoded.query_valve_opening_duration || {};
            var valve_index = readUInt8(bytes[offset]);
            var valve_index_name = "valve_" + valve_index;
            decoded.query_valve_opening_duration[valve_index_name] = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x71:
            var index = readUInt8(bytes[offset]);
            var index_name = "gpio_" + index + "_type";
            decoded[index_name] = readGPIOType(bytes[offset + 1]);
            offset += 2;
            break;
        case 0x72:
            decoded.query_device_config = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x73:
            decoded.query_pressure_calibration_settings = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x74:
            decoded.query_gpio_type = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x75:
            decoded.query_valve_config = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x76:
            var index = readUInt8(bytes[offset]);
            var index_name = "pressure_" + index + "_config";
            decoded[index_name] = {};
            decoded[index_name].enable = readEnableStatus(bytes[offset + 1]);
            decoded[index_name].collection_interval = readUInt16LE(bytes.slice(offset + 2, offset + 4));
            decoded[index_name].display_unit = readPressureDisplayUnit(bytes[offset + 4]);
            decoded[index_name].mode = readPressureMode(bytes[offset + 5]);
            decoded[index_name].signal_type = readPressureSignalType(bytes[offset + 6]);
            decoded[index_name].osl = readUInt16LE(bytes.slice(offset + 7, offset + 9));
            decoded[index_name].osh = readUInt16LE(bytes.slice(offset + 9, offset + 11));
            decoded[index_name].power_supply_time = readUInt16LE(bytes.slice(offset + 11, offset + 13));
            decoded[index_name].range_min = readUInt16LE(bytes.slice(offset + 13, offset + 15));
            decoded[index_name].range_max = readUInt16LE(bytes.slice(offset + 15, offset + 17));
            offset += 17;
            break;
        case 0x77:
            decoded.query_pressure_config = readYesNoStatus(1);
            offset += 1;
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

function readGPIOStatus(status) {
    var status_map = { 0: "low", 1: "high" };
    return getValue(status_map, status);
}

function readGPIOType(type) {
    var type_map = { 0: "counter", 1: "feedback" };
    return getValue(type_map, type);
}

function readSourceType(bytes) {
    var source_map = {
        0: "every change",
        1: "valve 1 opening",
        2: "valve 2 opening",
        3: "valve 1 opening or valve 2 opening",
    };
    return getValue(source_map, bytes);
}

function readPressureAlarmType(bytes) {
    var alarm_map = {
        0: "pipe pressure threshold alarm release",
        1: "pipe pressure threshold alarm",
    };
    return getValue(alarm_map, bytes);
}

function readCalibrationResult(status) {
    var status_map = { 0: "failed", 1: "success" };
    return getValue(status_map, status);
}

function readValveType(type) {
    var type_map = { 0: "2_way_ball_valve", 1: "3_way_ball_valve" };
    return getValue(type_map, type);
}

function readValveDirection(direction) {
    var direction_map = { 0: "left", 1: "right" };
    return getValue(direction_map, direction);
}

function readValveSensorStatus(status) {
    var status_map = {
        0: "low battery power",
        1: "shutdown after getting io feedback",
        2: "incorrect opening time",
        3: "timeout",
        4: "valve stall",
    };
    return getValue(status_map, status);
}

function readPressureSensorStatus(status) {
    var status_map = { 1: "read error" };
    return getValue(status_map, status);
}

function readTimeZone(time_zone) {
    var timezone_map = { "-720": "UTC-12", "-660": "UTC-11", "-600": "UTC-10", "-570": "UTC-9:30", "-540": "UTC-9", "-480": "UTC-8", "-420": "UTC-7", "-360": "UTC-6", "-300": "UTC-5", "-240": "UTC-4", "-210": "UTC-3:30", "-180": "UTC-3", "-120": "UTC-2", "-60": "UTC-1", 0: "UTC", 60: "UTC+1", 120: "UTC+2", 180: "UTC+3", 210: "UTC+3:30", 240: "UTC+4", 270: "UTC+4:30", 300: "UTC+5", 330: "UTC+5:30", 345: "UTC+5:45", 360: "UTC+6", 390: "UTC+6:30", 420: "UTC+7", 480: "UTC+8", 540: "UTC+9", 570: "UTC+9:30", 600: "UTC+10", 630: "UTC+10:30", 660: "UTC+11", 720: "UTC+12", 765: "UTC+12:45", 780: "UTC+13", 840: "UTC+14" };
    return getValue(timezone_map, time_zone);
}

function readValveFilterMode(mode) {
    var mode_map = { 1: "hardware", 2: "software" };
    return getValue(mode_map, mode);
}

function readEnableStatus(status) {
    var status_map = { 0: "disable", 1: "enable" };
    return getValue(status_map, status);
}

function readYesNoStatus(status) {
    var status_map = { 0: "no", 1: "yes" };
    return getValue(status_map, status);
}

function readStallStrategy(strategy) {
    var strategy_map = { 0: "close", 1: "keep" };
    return getValue(strategy_map, strategy);
}

function readRuleCondition(bytes) {
    var condition = {};

    var offset = 0;
    var condition_type_value = readUInt8(bytes[offset]);
    condition.type = readConditionType(condition_type_value);
    switch (condition_type_value) {
        case 0x00:
            break;
        case 0x01:
            condition.start_time = readUInt32LE(bytes.slice(offset + 1, offset + 5));
            condition.end_time = readUInt32LE(bytes.slice(offset + 5, offset + 9));
            condition.repeat_enable = readEnableStatus(bytes[offset + 9]);
            var repeat_mode_value = readUInt8(bytes[offset + 10]);
            condition.repeat_mode = getRepeatMode(repeat_mode_value);
            if (repeat_mode_value === 0x00 || repeat_mode_value === 0x01) {
                condition.repeat_step = readUInt16LE(bytes.slice(offset + 11, offset + 13));
            } else if (repeat_mode_value === 0x02) {
                condition.repeat_week = readWeekday(bytes[offset + 11]);
            }
            break;
        case 0x02:
            condition.d2d_command = readD2DCommand(bytes.slice(offset + 1, offset + 3));
            break;
        case 0x03:
            condition.valve_index = readUInt8(bytes[offset + 1]);
            condition.duration = readUInt16LE(bytes.slice(offset + 2, offset + 4));
            condition.pulse_threshold = readUInt32LE(bytes.slice(offset + 4, offset + 8));
            break;
        case 0x04:
            condition.valve_index = readUInt8(bytes[offset + 1]);
            condition.pulse_threshold = readUInt32LE(bytes.slice(offset + 2, offset + 6));
            break;
        case 0x05:
            condition.valve_index = readUInt8(bytes[offset + 1]);
            condition.valve_strategy = readValveStrategy(readUInt8(bytes[offset + 2]));
            condition.condition_type = readMathConditionType(readUInt8(bytes[offset + 3]));
            condition.threshold_min = readUInt16LE(bytes.slice(offset + 4, offset + 6));
            condition.threshold_max = readUInt16LE(bytes.slice(offset + 6, offset + 8));
            break;
    }
    return condition;
}

function getRepeatMode(repeat_mode_value) {
    var repeat_mode_map = { 0: "monthly", 1: "daily", 2: "weekly" };
    return getValue(repeat_mode_map, repeat_mode_value);
}

function readD2DCommand(bytes) {
    return ("0" + (bytes[1] & 0xff).toString(16)).slice(-2) + ("0" + (bytes[0] & 0xff).toString(16)).slice(-2);
}

function readWeekday(weekday_value) {
    var weekday_bit_offset = { monday: 0, tuesday: 1, wednesday: 2, thursday: 3, friday: 4, saturday: 5, sunday: 6 };

    var weekday = {};
    for (var key in weekday_bit_offset) {
        weekday[key] = readEnableStatus((weekday_value >>> weekday_bit_offset[key]) & 0x01);
    }
    return weekday;
}

function readValveStrategy(strategy_value) {
    var valve_strategy_map = { 0: "always", 1: "valve 1 open", 2: "valve 2 open", 3: "valve 1 open or valve 2 open" };
    return getValue(valve_strategy_map, strategy_value);
}

function readConditionType(condition_type_value) {
    var condition_type_map = { 0: "none", 1: "time", 2: "d2d", 3: "time or pulse threshold", 4: "pulse threshold", 5: "pressure threshold" };
    return getValue(condition_type_map, condition_type_value);
}

function readMathConditionType(condition_type_value) {
    var condition_type_map = { 0: "none", 1: "below", 2: "above", 3: "between", 4: "outside" };
    return getValue(condition_type_map, condition_type_value);
}

function readRuleAction(bytes) {
    var action_type_map = { 0: "none", 1: "em valve control", 2: "valve control", 3: "report" };

    var offset = 0;
    var action = {};

    var type_value = readUInt8(bytes[offset]);
    action.type = getValue(action_type_map, type_value);
    switch (type_value) {
        case 0x00:
            break;
        case 0x01:
            action.valve_index = readUInt8(bytes[offset + 1]);
            action.valve_opening = readUInt8(bytes[offset + 2]);
            action.time_enable = readEnableStatus(bytes[offset + 3]);
            action.duration = readUInt32LE(bytes.slice(offset + 4, offset + 8));
            action.pulse_enable = readEnableStatus(bytes[offset + 8]);
            action.pulse_threshold = readUInt32LE(bytes.slice(offset + 9, offset + 13));
            break;
        case 0x02:
            action.valve_index = readUInt8(bytes[offset + 1]);
            action.valve_opening = readUInt8(bytes[offset + 2]);
            action.time_enable = readEnableStatus(bytes[offset + 3]);
            action.duration = readUInt32LE(bytes.slice(offset + 4, offset + 8));
            action.pulse_enable = readEnableStatus(bytes[offset + 8]);
            action.pulse_threshold = readUInt32LE(bytes.slice(offset + 9, offset + 13));
            break;
        case 0x03:
            action.report_type = readReportType(readUInt8(bytes[offset + 1]));
            action.report_content = readAscii(bytes.slice(offset + 2, offset + 10));
            // ignore the next byte
            action.report_counts = readUInt8(bytes[offset + 11]);
            action.threshold_release_enable = readEnableStatus(bytes[offset + 12]);
            break;
    }
    return action;
}

function readReportType(report_type_value) {
    var report_type_map = { 1: "valve 1", 2: "valve 2", 3: "custom message", 4: "pressure threshold alarm" };
    return getValue(report_type_map, report_type_value);
}

function readPressureDisplayUnit(unit_value) {
    var unit_map = { 0: "kPa", 1: "Bar", 2: "MPa" };
    return getValue(unit_map, unit_value);
}

function readPressureMode(mode_value) {
    var mode_map = { 0: "standard", 1: "custom" };
    return getValue(mode_map, mode_value);
}

function readPressureSignalType(signal_type_value) {
    var signal_type_map = { 0: "voltage", 1: "current" };
    return getValue(signal_type_map, signal_type_value);
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
    return f;
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

function readHexString(bytes) {
    var temp = [];
    for (var i = 0; i < bytes.length; i++) {
        temp.push(("0" + (bytes[i] & 0xff).toString(16)).slice(-2));
    }
    return temp.join("");
}

function getValue(map, key) {
    if (RAW_VALUE) return key;

    var value = map[key];
    if (!value) value = "unknown";
    return value;
}

function includes(items, item) {
    var size = items.length;
    for (var i = 0; i < size; i++) {
        if (items[i] == item) {
            return true;
        }
    }
    return false;
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
 * @product UC521
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
    if ("sync_time" in payload) {
        encoded = encoded.concat(syncTime(payload.sync_time));
    }
    if ("pressure_1_collection_interval" in payload) {
        encoded = encoded.concat(setCollectionInterval(1, payload.pressure_1_collection_interval));
    }
    if ("pressure_2_collection_interval" in payload) {
        encoded = encoded.concat(setCollectionInterval(2, payload.pressure_2_collection_interval));
    }
    if ("time_zone" in payload) {
        encoded = encoded.concat(setTimeZone(payload.time_zone));
    }
    if ("valve_1_task" in payload) {
        encoded = encoded.concat(setValveTask(0, payload.valve_1_task));
    }
    if ("valve_2_task" in payload) {
        encoded = encoded.concat(setValveTask(1, payload.valve_2_task));
    }
    if ("valve_1_pulse" in payload) {
        encoded = encoded.concat(setValvePulse(1, payload.valve_1_pulse));
    }
    if ("valve_2_pulse" in payload) {
        encoded = encoded.concat(setValvePulse(2, payload.valve_2_pulse));
    }
    if ("clear_valve_1_pulse" in payload) {
        encoded = encoded.concat(clearValvePulse(1, payload.clear_valve_1_pulse));
    }
    if ("clear_valve_2_pulse" in payload) {
        encoded = encoded.concat(clearValvePulse(2, payload.clear_valve_2_pulse));
    }
    if ("valve_1_config" in payload) {
        encoded = encoded.concat(setValveConfig(1, payload.valve_1_config));
    }
    if ("valve_2_config" in payload) {
        encoded = encoded.concat(setValveConfig(2, payload.valve_2_config));
    }
    if ("valve_filter_config" in payload) {
        encoded = encoded.concat(setValveFilterConfig(payload.valve_filter_config));
    }
    if ("pressure_1_calibration_settings" in payload) {
        encoded = encoded.concat(setPressureCalibration(1, payload.pressure_1_calibration_settings));
    }
    if ("pressure_2_calibration_settings" in payload) {
        encoded = encoded.concat(setPressureCalibration(2, payload.pressure_2_calibration_settings));
    }
    if ("wiring_switch_enable" in payload) {
        encoded = encoded.concat(setWiringSwitchEnable(payload.wiring_switch_enable));
    }
    if ("valve_change_report_enable" in payload) {
        encoded = encoded.concat(setValveChangeReportEnable(payload.valve_change_report_enable));
    }
    if ("query_valve_opening_duration" in payload) {
        encoded = encoded.concat(queryValveOpeningDuration(payload.query_valve_opening_duration));
    }
    if ("gpio_1_type" in payload) {
        encoded = encoded.concat(setGPIOType(1, payload.gpio_1_type));
    }
    if ("gpio_2_type" in payload) {
        encoded = encoded.concat(setGPIOType(2, payload.gpio_2_type));
    }
    if ("query_device_config" in payload) {
        encoded = encoded.concat(queryDeviceConfig(payload.query_device_config));
    }
    if ("query_pressure_calibration_settings" in payload) {
        encoded = encoded.concat(queryPressureCalibrationConfig(payload.query_pressure_calibration_settings));
    }
    if ("query_gpio_type" in payload) {
        encoded = encoded.concat(queryGPIOType(payload.query_gpio_type));
    }
    if ("query_valve_config" in payload) {
        encoded = encoded.concat(queryValveConfig(payload.query_valve_config));
    }
    if ("pressure_1_config" in payload) {
        encoded = encoded.concat(setPressureConfig(1, payload.pressure_1_config));
    }
    if ("pressure_2_config" in payload) {
        encoded = encoded.concat(setPressureConfig(2, payload.pressure_2_config));
    }
    if ("query_pressure_config" in payload) {
        encoded = encoded.concat(queryPressureConfig(payload.query_pressure_config));
    }
    if ("batch_read_rules" in payload) {
        encoded = encoded.concat(batchReadRules(payload.batch_read_rules));
    }
    if ("batch_enable_rules" in payload) {
        encoded = encoded.concat(batchEnableRules(payload.batch_enable_rules));
    }
    if ("batch_remove_rules" in payload) {
        encoded = encoded.concat(batchRemoveRules(payload.batch_remove_rules));
    }
    var rule_x_enable_map = { rule_1_enable: 1, rule_2_enable: 2, rule_3_enable: 3, rule_4_enable: 4, rule_5_enable: 5, rule_6_enable: 6, rule_7_enable: 7, rule_8_enable: 8, rule_9_enable: 9, rule_10_enable: 10, rule_11_enable: 11, rule_12_enable: 12, rule_13_enable: 13, rule_14_enable: 14, rule_15_enable: 15, rule_16_enable: 16 };
    for (var key in rule_x_enable_map) {
        if (key in payload) {
            encoded = encoded.concat(enableRule(rule_x_enable_map[key], payload[key]));
        }
    }
    var rule_x_remove_map = { rule_1_remove: 1, rule_2_remove: 2, rule_3_remove: 3, rule_4_remove: 4, rule_5_remove: 5, rule_6_remove: 6, rule_7_remove: 7, rule_8_remove: 8, rule_9_remove: 9, rule_10_remove: 10, rule_11_remove: 11, rule_12_remove: 12, rule_13_remove: 13, rule_14_remove: 14, rule_15_remove: 15, rule_16_remove: 16 };
    for (var key in rule_x_remove_map) {
        if (key in payload) {
            encoded = encoded.concat(removeRule(rule_x_remove_map[key], payload[key]));
        }
    }
    if ("rules_config" in payload) {
        for (var i = 0; i < payload.rules_config.length; i++) {
            encoded = encoded.concat(setRuleConfig(payload.rules_config[i]));
        }
    }
    if ("query_rule_config" in payload) {
        encoded = encoded.concat(queryRuleConfig(payload.query_rule_config));
    }
    if ("d2d_enable" in payload) {
        encoded = encoded.concat(setD2DEnable(payload.d2d_enable));
    }
    if ("d2d_key" in payload) {
        encoded = encoded.concat(setD2DKey(payload.d2d_key));
    }
    if ("response_enable" in payload) {
        encoded = encoded.concat(setResponseEnable(payload.response_enable));
    }
    if ("class_a_response_time" in payload) {
        encoded = encoded.concat(setClassAResponseTime(payload.class_a_response_time));
    }
    if ("gpio_jitter_time" in payload) {
        encoded = encoded.concat(setGpioJitterTime(payload.gpio_jitter_time));
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
    return [0xff, 0x4a, 0xff];
}

/**
 * set collection interval
 * @param {number} index values: (1: pressure 1, 2: pressure 2)
 * @param {object} collection_interval
 * @param {number} collection_interval.enable values: (0: disable, 1: enable)
 * @param {number} collection_interval.collection_interval unit: second, range: [10, 64800]
 * @example { "pressure_1_collection_interval": { "enable": 1, "collection_interval": 300 } }
 */
function setCollectionInterval(index, collection_interval) {
    var enable = collection_interval.enable;
    var interval = collection_interval.collection_interval;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("pressure_" + index + "_collection_interval.enable must be one of " + enable_values.join(", "));
    }
    var enable_value = getValue(enable_map, enable);
    if (enable_value == 1 && (interval < 10 || interval > 64800)) {
        throw new Error("pressure_" + index + "_collection_interval.collection_interval must be in range [10, 64800]");
    }

    var buffer = new Buffer(6);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x68);
    buffer.writeUInt8(index);
    buffer.writeUInt8(enable_value);
    buffer.writeUInt16LE(interval);
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
 * set valve task
 * @param {number} valve_index values: (1: valve 1, 2: valve 2)
 * @param {object} valve_task
 * @param {number} valve_task.task_id (0: force execute, 1-255: task id)
 * @param {number} valve_task.valve_opening
 * @param {number} valve_task.direction values: (0: left, 1: right), optional
 * @param {number} valve_task.time unit: min, optional
 * @param {number} valve_task.pulse unit: ms, optional
 * @example { "valve_1_task": { "valve_opening": 0 }}
 * @example { "valve_1_task": { "task_id": 1, "valve_opening": 1, "time": 1, "pulse": 1,  } }
 */
function setValveTask(valve_index, valve_task) {
    var task_id = 0;
    var valve_opening = valve_task.valve_opening;
    var time = valve_task.time;
    var pulse = valve_task.pulse;

    if ("task_id" in valve_task) {
        if (typeof valve_task.task_id !== "number") {
            throw new Error("valve_task.task_id must be a number");
        }
        task_id = valve_task.task_id;
    }
    if (typeof valve_opening !== "number") {
        throw new Error("valve_task.valve_opening must be a number");
    }

    var time_control_enable = 0;
    var valve_pulse_control_enable = 0;
    if ("time" in valve_task) {
        time_control_enable = 1;
    }
    if ("pulse" in valve_task) {
        valve_pulse_control_enable = 1;
    }

    var data = 0;
    data |= time_control_enable << 7;
    data |= valve_pulse_control_enable << 6;
    data |= valve_index;

    var data_extend_length = 0;
    if (time_control_enable === 1) {
        data_extend_length += 2;
    }
    if (valve_pulse_control_enable === 1) {
        data_extend_length += 4;
    }
    var buffer = new Buffer(5 + data_extend_length);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x19);
    buffer.writeUInt8(data);
    buffer.writeUInt8(task_id);
    buffer.writeUInt8(valve_opening);
    if (time_control_enable === 1) {
        buffer.writeUInt16LE(time);
    }
    if (valve_pulse_control_enable === 1) {
        buffer.writeUInt32LE(pulse);
    }
    return buffer.toBytes();
}

/**
 * set valve pulse
 * @param {number} valve_index values: (1: valve 1, 2: valve 2)
 * @param {number} valve_pulse unit: ms
 * @example { "valve_1_pulse": 1000 }
 * @example { "valve_2_pulse": 1000 }
 */
function setValvePulse(valve_index, valve_pulse) {
    var buffer = new Buffer(7);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x92);
    buffer.writeUInt8(valve_index);
    buffer.writeUInt32LE(valve_pulse);
    return buffer.toBytes();
}

/**
 * clear valve pulse
 * @param {number} valve_index values: (1: valve 1, 2: valve 2)
 * @param {number} clear_valve_pulse values: (0: no, 1: yes)
 * @example { "clear_valve_1_pulse": 1 }
 * @example { "clear_valve_2_pulse": 1 }
 */
function clearValvePulse(valve_index, clear_valve_pulse) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(clear_valve_pulse) === -1) {
        throw new Error("clear_valve_pulse must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, clear_valve_pulse) === 0) {
        return [];
    }
    return [0xff, 0x4e, valve_index, 0x00];
}

/**
 * set valve config
 * @param {number} valve_index values: (0: valve 1, 1: valve 2)
 * @param {object} valve_config
 * @param {number} valve_config.valve_type values: (0: 2-way ball valve, 1: 3-way ball valve)
 * @param {number} valve_config.auto_calibration_enable values: (0: disable, 1: enable)
 * @param {number} valve_config.report_after_calibration_enable values: (0: disable, 1: enable)
 * @param {number} valve_config.stall_strategy values: (0: close, 1: keep)
 * @param {number} valve_config.open_time_1 unit: second, (type=0, use; type=1, left)
 * @param {number} valve_config.open_time_2 unit: second, (type=0, no use; type=1, right)
 * @param {number} valve_config.stall_current unit: mA
 * @param {number} valve_config.stall_time unit: ms
 * @param {number} valve_config.protect_time unit: second
 * @param {number} valve_config.close_delay_time unit: second
 * @param {number} valve_config.open_delay_time unit: second
 * @example { "valve_1_config": { "valve_type": 0, "auto_calibration_enable": 1, "report_after_calibration_enable": 1, "stall_strategy": 1, "open_time_1": 10, "open_time_2": 10, "stall_current": 100, "stall_time": 10, "protect_time": 10, "delay_time": 10 } }
 */
function setValveConfig(valve_index, valve_config) {
    var type = valve_config.valve_type;
    var auto_calibration_enable = valve_config.auto_calibration_enable;
    var report_after_calibration_enable = valve_config.report_after_calibration_enable;
    var stall_strategy = valve_config.stall_strategy;
    var open_time_1 = valve_config.open_time_1;
    var open_time_2 = valve_config.open_time_2;
    var stall_current = valve_config.stall_current;
    var stall_time = valve_config.stall_time;
    var protect_time = valve_config.protect_time;
    var close_delay_time = valve_config.close_delay_time;
    var open_delay_time = valve_config.open_delay_time;

    var type_map = { 0: "2_way_ball_valve", 1: "3_way_ball_valve" };
    var enable_map = { 0: "disable", 1: "enable" };
    var stall_strategy_map = { 0: "close", 1: "keep" };

    var data = 0;
    data |= (valve_index - 1) << 7;
    data |= getValue(type_map, type) << 6;
    data |= getValue(enable_map, auto_calibration_enable) << 5;
    data |= getValue(enable_map, report_after_calibration_enable) << 4;
    data |= getValue(stall_strategy_map, stall_strategy) << 3;

    var buffer = new Buffer(12);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x1a);
    buffer.writeUInt8(data);
    buffer.writeUInt8(open_time_1);
    buffer.writeUInt8(open_time_2);
    buffer.writeUInt16LE(stall_current);
    buffer.writeUInt16LE(stall_time);
    buffer.writeUInt8(protect_time);
    buffer.writeUInt8(close_delay_time);
    buffer.writeUInt8(open_delay_time);
    return buffer.toBytes();
}

/**
 * set valve filter config
 * @param {object} valve_filter_config
 * @param {number} valve_filter_config.mode values: (1: hardware, 2: software)
 * @param {number} valve_filter_config.time (mode=1, unit: us; mode=2, unit: ms)
 * @example { "valve_filter_config": { "mode": 1, "time": 10 } }
 */
function setValveFilterConfig(valve_filter_config) {
    var mode = valve_filter_config.mode;
    var time = valve_filter_config.time;

    var mode_map = { 1: "hardware", 2: "software" };
    var mode_values = getValues(mode_map);
    if (mode_values.indexOf(mode) === -1) {
        throw new Error("valve_filter_config.mode must be one of " + mode_values.join(", "));
    }

    if (typeof time !== "number") {
        throw new Error("valve_filter_config.time must be a number");
    }

    var buffer = new Buffer(6);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x52);
    buffer.writeUInt8(0x00);
    buffer.writeUInt8(getValue(mode_map, mode));
    buffer.writeUInt16LE(time);
    return buffer.toBytes();
}

/**
 * set pressure calibration
 * @param {number} pressure_index values: (1: pressure 1, 2: pressure 2)
 * @param {object} pressure_calibration_settings
 * @param {number} pressure_calibration_settings.enable values: (0: disable, 1: enable)
 * @param {number} pressure_calibration_settings.calibration_value unit: kPa
 * @example { "pressure_1_calibration_settings": { "enable": 1, "calibration_value": 1 } }
 */
function setPressureCalibration(pressure_index, pressure_calibration_settings) {
    var enable = pressure_calibration_settings.enable;
    var calibration_value = pressure_calibration_settings.calibration_value;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("pressure_" + pressure_index + "_calibration_settings.enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(6);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x5b);
    buffer.writeUInt8(pressure_index);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeInt16LE(calibration_value);
    return buffer.toBytes();
}

/**
 * set wiring switch enable
 * @param {number} wiring_switch_enable values: (0: disable, 1: enable)
 * @example { "wiring_switch_enable": 1 }
 */
function setWiringSwitchEnable(wiring_switch_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(wiring_switch_enable) === -1) {
        throw new Error("wiring_switch_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x6e);
    buffer.writeUInt8(getValue(enable_map, wiring_switch_enable));
    return buffer.toBytes();
}

/**
 * set valve change report enable
 * @param {number} valve_change_report_enable values: (0: disable, 1: enable)
 * @example { "valve_change_report_enable": 1 }
 */
function setValveChangeReportEnable(valve_change_report_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(valve_change_report_enable) === -1) {
        throw new Error("valve_change_report_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x6f);
    buffer.writeUInt8(getValue(enable_map, valve_change_report_enable));
    return buffer.toBytes();
}

/**
 * query valve opening duration
 * @param {object} query_valve_opening_duration
 * @param {number} query_valve_opening_duration.valve_1 values: (0: no, 1:yes)
 * @param {number} query_valve_opening_duration.valve_2 values: (0: no, 1:yes)
 * @example { "query_valve_opening_duration": { "valve_1": 1, "valve_2": 1 } }
 */
function queryValveOpeningDuration(query_valve_opening_duration) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);

    var data = [];
    var valve_index_map = { valve_1: 1, valve_2: 2 };
    for (var key in valve_index_map) {
        if (key in query_valve_opening_duration) {
            if (yes_no_values.indexOf(query_valve_opening_duration[key]) === -1) {
                throw new Error("query_valve_opening_duration." + key + " must be one of " + yes_no_values.join(", "));
            }

            if (getValue(yes_no_map, query_valve_opening_duration[key]) === 0) {
                continue;
            }

            data.push(0xf9, 0x70, valve_index_map[key]);
        }
    }

    return data;
}

/**
 * set gpio type
 * @param {number} index values: (1: gpio_1, 2: gpio_2)
 * @param {number} gpio_type values: (0: counter, 1: feedback)
 * @example { "gpio_1_type": 0, "gpio_2_type": 1 }
 */
function setGPIOType(index, gpio_type) {
    var gpio_type_map = { 0: "counter", 1: "feedback" };
    var gpio_type_values = getValues(gpio_type_map);
    if (gpio_type_values.indexOf(gpio_type) === -1) {
        throw new Error("gpio_" + index + "_type must be one of " + gpio_type_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x71);
    buffer.writeUInt8(index);
    buffer.writeUInt8(getValue(gpio_type_map, gpio_type));
    return buffer.toBytes();
}

/**
 * query device config
 * @param {number} query_device_config values: (0: no, 1: yes)
 * @example { "query_device_config": 1 }
 */
function queryDeviceConfig(query_device_config) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(query_device_config) === -1) {
        throw new Error("query_device_config must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, query_device_config) === 0) {
        return [];
    }
    return [0xf9, 0x72, 0xff];
}

/**
 * query pressure calibration config
 * @param {number} query_pressure_calibration_settings values: (0: no, 1: yes)
 * @example { "query_pressure_calibration_settings": 1 }
 */
function queryPressureCalibrationConfig(query_pressure_calibration_settings) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(query_pressure_calibration_settings) === -1) {
        throw new Error("query_pressure_calibration_settings must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, query_pressure_calibration_settings) === 0) {
        return [];
    }
    return [0xf9, 0x73, 0xff];
}

/**
 * query gpio type
 * @param {number} query_gpio_type values: (0: no, 1: yes)
 * @example { "query_gpio_type": 1 }
 */
function queryGPIOType(query_gpio_type) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(query_gpio_type) === -1) {
        throw new Error("query_gpio_type must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, query_gpio_type) === 0) {
        return [];
    }
    return [0xf9, 0x74, 0xff];
}

/**
 * query valve config
 * @param {number} query_valve_config values: (0: no, 1: yes)
 * @example { "query_valve_config": 1 }
 */
function queryValveConfig(query_valve_config) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(query_valve_config) === -1) {
        throw new Error("query_valve_config must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, query_valve_config) === 0) {
        return [];
    }
    return [0xf9, 0x75, 0xff];
}

/**
 * set pressure config
 * @param {number} index values: (1: pressure 1, 2: pressure 2)
 * @param {object} pressure_config
 * @param {number} pressure_x_config.enable values: (0: disable, 1: enable)
 * @param {number} pressure_x_config.collection_interval unit: ms, range: [10, 64800]
 * @param {number} pressure_x_config.display_unit values: (0: kPa, 1: Bar, 2: MPa)
 * @param {number} pressure_x_config.mode values: (0: standard, 1: custom)
 * @param {number} pressure_x_config.signal_type values: (0: voltage, 1: current)
 * @param {number} pressure_x_config.osl unit: (mV, uA), current_range: [4000, 20000], voltage_range: [0, 10000]
 * @param {number} pressure_x_config.osh unit: (mV, uA), current_range: [4000, 20000], voltage_range: [0, 10000]
 * @param {number} pressure_x_config.power_supply_time unit: ms, range: [0, 65535]
 * @param {number} pressure_x_config.range_min range: [0, 65535]
 * @param {number} pressure_x_config.range_max range: [0, 65535]
 * @example { "pressure_1_config": { "enable": 1, "collection_interval": 1000, "display_unit": 0, "mode": 0, "signal_type": 0, "osl": 0, "osh": 0, "power_supply_time": 0, "range_min": 0, "range_max": 0 } }
 */
function setPressureConfig(index, pressure_config) {
    var enable = pressure_config.enable;
    var collection_interval = pressure_config.collection_interval;
    var display_unit = pressure_config.display_unit;
    var mode = pressure_config.mode;
    var signal_type = pressure_config.signal_type;
    var osl = pressure_config.osl;
    var osh = pressure_config.osh;
    var power_supply_time = pressure_config.power_supply_time;
    var range_min = pressure_config.range_min;
    var range_max = pressure_config.range_max;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("pressure_" + index + "_config.enable must be one of " + enable_values.join(", "));
    }
    if (collection_interval < 10 || collection_interval > 64800) {
        throw new Error("pressure_" + index + "_config.collection_interval must be in range [10, 64800]");
    }
    var unit_map = { 0: "kPa", 1: "Bar", 2: "MPa" };
    var unit_values = getValues(unit_map);
    if (unit_values.indexOf(display_unit) === -1) {
        throw new Error("pressure_" + index + "_config.display_unit must be one of " + unit_values.join(", "));
    }
    var mode_map = { 0: "standard", 1: "custom" };
    var mode_values = getValues(mode_map);
    if (mode_values.indexOf(mode) === -1) {
        throw new Error("pressure_" + index + "_config.mode must be one of " + mode_values.join(", "));
    }
    var signal_type_map = { 0: "voltage", 1: "current" };
    var signal_type_values = getValues(signal_type_map);
    if (signal_type_values.indexOf(signal_type) === -1) {
        throw new Error("pressure_" + index + "_config.signal_type must be one of " + signal_type_values.join(", "));
    }
    if (signal_type === 0 && (osl < 0 || osl > 10000)) {
        throw new Error("pressure_" + index + "_config.osl must be in range [0, 10000]");
    }
    if (signal_type === 1 && (osl < 4000 || osl > 20000)) {
        throw new Error("pressure_" + index + "_config.osl must be in range [4000, 20000]");
    }
    if (range_min < 0 || range_min > 65535) {
        throw new Error("pressure_" + index + "_config.range_min must be in range [0, 65535]");
    }
    if (range_max < 0 || range_max > 65535) {
        throw new Error("pressure_" + index + "_config.range_max must be in range [0, 65535]");
    }

    var buffer = new Buffer(19);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x76);
    buffer.writeUInt8(index);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt16LE(collection_interval);
    buffer.writeUInt8(getValue(unit_map, display_unit));
    buffer.writeUInt8(getValue(mode_map, mode));
    buffer.writeUInt8(getValue(signal_type_map, signal_type));
    buffer.writeUInt16LE(osl);
    buffer.writeUInt16LE(osh);
    buffer.writeUInt16LE(power_supply_time);
    buffer.writeUInt16LE(range_min);
    buffer.writeUInt16LE(range_max);
    return buffer.toBytes();
}

/**
 * query pressure config
 * @param {number} query_pressure_config values: (0: no, 1: yes)
 * @example { "query_pressure_config": 1 }
 */
function queryPressureConfig(query_pressure_config) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(query_pressure_config) === -1) {
        throw new Error("query_pressure_config must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, query_pressure_config) === 0) {
        return [];
    }
    return [0xf9, 0x77, 0xff];
}

/**
 * read rules
 * @param {object} batch_read_rules
 * @param {number} batch_read_rules.rule_1
 * @param {number} batch_read_rules.rule_2
 * @param {number} batch_read_rules.rule_x
 * @param {number} batch_read_rules.rule_16
 * @example { "batch_read_rules": { "rules_id": 1 } }
 */
function batchReadRules(batch_read_rules) {
    var enable_map = { 0: "no", 1: "yes" };
    var enable_values = getValues(enable_map);

    var data = 0;
    var rule_bit_offset = { rule_1: 0, rule_2: 1, rule_3: 2, rule_4: 3, rule_5: 4, rule_6: 5, rule_7: 6, rule_8: 7, rule_9: 8, rule_10: 9, rule_11: 10, rule_12: 11, rule_13: 12, rule_14: 13, rule_15: 14, rule_16: 15 };
    for (var key in rule_bit_offset) {
        if (key in batch_read_rules) {
            if (enable_values.indexOf(batch_read_rules[key]) === -1) {
                throw new Error("batch_read_rules." + key + " must be one of " + enable_values.join(", "));
            }
            data |= getValue(enable_map, batch_read_rules[key]) << rule_bit_offset[key];
        }
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x4b);
    buffer.writeUInt8(0x00); // read rules
    buffer.writeUInt16LE(data);
    return buffer.toBytes();
}

/**
 * batch enable rules
 * @param {object} batch_enable_rules
 * @param {number} batch_enable_rules.rule_1
 * @param {number} batch_enable_rules.rule_2
 * @param {number} batch_enable_rules.rule_x
 * @param {number} batch_enable_rules.rule_16
 * @example { "batch_enable_rules": { "rule_1": 1, "rule_2": 1, "rule_3": 1, "rule_4": 1 } }
 */
function batchEnableRules(batch_enable_rules) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);

    var data = 0;
    var rule_bit_offset = { rule_1: 0, rule_2: 1, rule_3: 2, rule_4: 3, rule_5: 4, rule_6: 5, rule_7: 6, rule_8: 7, rule_9: 8, rule_10: 9, rule_11: 10, rule_12: 11, rule_13: 12, rule_14: 13, rule_15: 14, rule_16: 15 };
    for (var key in rule_bit_offset) {
        if (key in batch_enable_rules) {
            if (enable_values.indexOf(batch_enable_rules[key]) === -1) {
                throw new Error("batch_enable_rules." + key + " must be one of " + enable_values.join(", "));
            }
            data |= getValue(enable_map, batch_enable_rules[key]) << rule_bit_offset[key];
        }
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x4b);
    buffer.writeUInt8(0x01); // enable rules
    buffer.writeUInt16LE(data);
    return buffer.toBytes();
}

/**
 * batch remove rules
 * @param {object} batch_remove_rules
 * @param {number} batch_remove_rules.rule_1
 * @param {number} batch_remove_rules.rule_2
 * @param {number} batch_remove_rules.rule_x
 * @param {number} batch_remove_rules.rule_16
 * @example { "batch_remove_rules": { "rule_1": 1, "rule_2": 1, "rule_3": 1, "rule_4": 1 } }
 */
function batchRemoveRules(batch_remove_rules) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);

    var data = 0;
    var rule_bit_offset = { rule_1: 0, rule_2: 1, rule_3: 2, rule_4: 3, rule_5: 4, rule_6: 5, rule_7: 6, rule_8: 7, rule_9: 8, rule_10: 9, rule_11: 10, rule_12: 11, rule_13: 12, rule_14: 13, rule_15: 14, rule_16: 15 };
    for (var key in rule_bit_offset) {
        if (key in batch_remove_rules) {
            if (yes_no_values.indexOf(batch_remove_rules[key]) === -1) {
                throw new Error("batch_remove_rules." + key + " must be one of " + yes_no_values.join(", "));
            }
            data |= getValue(yes_no_map, batch_remove_rules[key]) << rule_bit_offset[key];
        }
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x4b);
    buffer.writeUInt8(0x02); // remove rules
    buffer.writeUInt16LE(data);
    return buffer.toBytes();
}

/**
 * enable rule
 * @param {number} rule_index range: [1, 16]
 * @param {number} enable values: (0: disable, 1: enable)
 * @example { "rule_1_enable": 1 }
 * @example { "rule_2_enable": 1 }
 */
function enableRule(rule_index, enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);

    if (enable_values.indexOf(enable) === -1) {
        throw new Error("rule_" + rule_index + "_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x4b);
    buffer.writeUInt8(0x03); // enable single rule
    buffer.writeUInt8(rule_index);
    buffer.writeUInt8(getValue(enable_map, enable));
    return buffer.toBytes();
}

/**
 * remove rule
 * @param {number} rule_index range: [1, 16]
 * @example { "remove_rule": 1 }
 */
function removeRule(rule_index) {
    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x4b);
    buffer.writeUInt8(0x04); // remove single rule
    buffer.writeUInt8(rule_index);
    buffer.writeUInt8(0x00);
    return buffer.toBytes();
}

/**
 * query rule config
 * @param {object} query_rule_config
 * @param {number} query_rule_config.index range: [1, 16]
 * @example { "query_rule_config": { "index": 1 } }
 */
function queryRuleConfig(query_rule_config) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);

    var data = [];
    var rule_index_offset = { rule_1: 1, rule_2: 2, rule_3: 3, rule_4: 4, rule_5: 5, rule_6: 6 };
    for (var key in rule_index_offset) {
        if (key in query_rule_config) {
            if (yes_no_values.indexOf(query_rule_config[key]) === -1) {
                throw new Error("query_rule_config." + key + " must be one of " + yes_no_values.join(", "));
            }

            if (getValue(yes_no_map, query_rule_config[key]) === 0) {
                continue;
            }

            data = data.concat([0xff, 0x53, rule_index_offset[key]]);
        }
    }

    return data;
}

/**
 * set rule config
 * @param {object} rule_config
 * @param {number} rule_config.id range: [1, 16]
 * @param {number} rule_config.enable values: (0: disable, 1: enable)
 * @param {object} rule_config.condition
 * @param {object} rule_config.action
 */
function setRuleConfig(rule_config) {
    var id = rule_config.id;
    var enable = rule_config.enable;
    var condition = rule_config.condition;
    var action = rule_config.action;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("rules_config._item.enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(30);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x55);
    buffer.writeUInt8(id); // set rule config
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeBytes(encodedRuleCondition(condition));
    buffer.writeBytes(encodedAction(action));
    return buffer.toBytes();
}

/**
 * rule config condition
 * @param {object} condition
 * @param {number} condition.type values: (0: none, 1: time, 2: d2d, 3: time or pulse threshold, 4: pulse threshold, 5: pressure threshold)
 * @param {number} condition.start_time unit: second
 * @param {number} condition.end_time unit: second
 * @param {number} condition.repeat_enable values: (0: disable, 1: enable)
 * @param {number} condition.repeat_mode values: (0: monthly, 1: daily, 2: weekly)
 * @param {number} condition.repeat_step
 * @param {object} condition.repeat_week
 * @param {number} condition.repeat_week.monday values: (0: disable, 1: enable)
 * @param {number} condition.repeat_week.tuesday values: (0: disable, 1: enable)
 * @param {number} condition.repeat_week.wednesday values: (0: disable, 1: enable)
 * @param {number} condition.repeat_week.thursday values: (0: disable, 1: enable)
 * @param {number} condition.repeat_week.friday values: (0: disable, 1: enable)
 * @param {number} condition.repeat_week.saturday values: (0: disable, 1: enable)
 * @param {number} condition.repeat_week.sunday values: (0: disable, 1: enable)
 * @param {number} condition.d2d_command
 * @param {number} condition.valve_index values: (1: valve 1, 2: valve 2)
 * @param {number} condition.duration unit: min
 * @param {number} condition.pulse_threshold
 * @param {number} condition.valve_strategy values: (0: no strategy, 1: pressure strategy)
 * @param {number} condition.condition_type values: (0: none, 1: below, 2: above, 3: between, 4: outside)
 * @param {number} condition.threshold_min unit: kPa
 * @param {number} condition.threshold_max unit: kPa
 */
function encodedRuleCondition(condition) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    var condition_type_map = { 0: "none", 1: "time", 2: "d2d", 3: "time or pulse threshold", 4: "pulse threshold", 5: "pressure threshold" };
    var condition_type_values = getValues(condition_type_map);
    var repeat_mode_map = { 0: "monthly", 1: "daily", 2: "weekly" };
    var repeat_mode_values = getValues(repeat_mode_map);
    var weekday_bit_offset = { monday: 0, tuesday: 1, wednesday: 2, thursday: 3, friday: 4, saturday: 5, sunday: 6 };
    var valve_strategy_map = { 0: "always", 1: "valve 1 open", 2: "valve 2 open", 3: "valve 1 open or valve 2 open" };
    var valve_strategy_values = getValues(valve_strategy_map);
    var condition_type_map = { 0: "none", 1: "below", 2: "above", 3: "between", 4: "outside" };
    var condition_type_values = getValues(condition_type_map);

    var buffer = new Buffer(13);
    if (condition_type_values.indexOf(condition.type) === -1) {
        throw new Error("condition.type must be one of " + condition_type_values.join(", "));
    }
    var condition_type_value = getValue(condition_type_map, condition.type);
    buffer.writeUInt8(condition_type_value);
    switch (condition_type_value) {
        case 0x00: // none
            break;
        case 0x01: // time condition (start_time, end_time, repeat_enable, repeat_mode, [repeat_step], [repeat_week])
            if (enable_values.indexOf(condition.repeat_enable) === -1) {
                throw new Error("condition.repeat_enable must be one of " + enable_values.join(", "));
            }
            if (repeat_mode_values.indexOf(condition.repeat_mode) === -1) {
                throw new Error("condition.repeat_mode must be one of " + repeat_mode_values.join(", "));
            }
            buffer.writeUInt32LE(condition.start_time);
            buffer.writeUInt32LE(condition.end_time);
            buffer.writeUInt8(getValue(enable_map, condition.repeat_enable));
            var repeat_mode_value = getValue(repeat_mode_map, condition.repeat_mode);
            buffer.writeUInt8(repeat_mode_value);
            // repeat mode: monthly or daily
            if (repeat_mode_value === 0x00 || repeat_mode_value === 0x01) {
                buffer.writeUInt16LE(condition.repeat_step);
            }
            // repeat mode: weekly
            else if (repeat_mode_value === 0x02) {
                var weekday_value = 0;
                for (var key in weekday_bit_offset) {
                    if (key in condition.repeat_week) {
                        if (enable_values.indexOf(condition.repeat_week[key]) === -1) {
                            throw new Error("rules_config._item.repeat_week." + key + " must be one of " + enable_values.join(", "));
                        }
                        weekday_value |= getValue(enable_map, condition.repeat_week[key]) << weekday_bit_offset[key];
                    }
                }
                buffer.writeUInt16LE(weekday_value);
            }
            break;
        case 0x02: // d2d condition (d2d_command)
            buffer.writeD2DCommand(condition.d2d_command, "0000");
            break;
        case 0x03: // time or pulse threshold condition (valve_index, duration, pulse_threshold)
            buffer.writeUInt8(condition.valve_index);
            buffer.writeUInt16LE(condition.duration);
            buffer.writeUInt32LE(condition.pulse_threshold);
            break;
        case 0x04: // pulse threshold condition (valve_index, pulse_threshold)
            buffer.writeUInt8(condition.valve_index);
            buffer.writeUInt32LE(condition.pulse_threshold);
            break;
        case 0x05: // pressure threshold condition
            if (valve_strategy_values.indexOf(condition.valve_strategy) === -1) {
                throw new Error("rules_config._item.condition.valve_strategy must be one of " + valve_strategy_values.join(", "));
            }
            if (condition_type_values.indexOf(condition.condition_type) === -1) {
                throw new Error("rules_config._item.condition.condition_type must be one of " + condition_type_values.join(", "));
            }
            buffer.writeUInt8(condition.valve_index);
            buffer.writeUInt8(getValue(valve_strategy_map, condition.valve_strategy));
            buffer.writeUInt8(getValue(condition_type_map, condition.condition_type));
            buffer.writeUInt16LE(condition.threshold_min);
            buffer.writeUInt16LE(condition.threshold_max);
            break;
    }

    return buffer.toBytes();
}

/**
 * rule config action
 * @param {object} action
 * @param {number} action.type values: (0: none, 1: em valve control, 2: valve control, 3: report)
 * @param {number} action.valve_index values: (1: valve 1, 2: valve 2)
 * @param {number} action.valve_opening
 * @param {number} action.time_enable values: (0: disable, 1: enable)
 * @param {number} action.duration unit: min
 * @param {number} action.pulse_enable values: (0: disable, 1: enable)
 * @param {number} action.pulse_threshold
 * @param {number} action.report_type values: (1: valve 1, 2: valve 2, 3: custom message, 4: pressure threshold alarm)
 * @param {string} action.report_content
 * @param {number} action.report_counts
 * @param {number} action.threshold_release_enable values: (0: disable, 1: enable)
 * @example { "rules_config": [ { "index": 1, "enable": 1, "condition": { "type": 0 }, "action": { "type": 1, "valve_index": 1, "valve_opening": 1, "time_enable": 1, "duration": 1, "pulse_enable": 1, "pulse_threshold": 1 } }]}
 */
function encodedAction(action) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    var action_type_map = { 0: "none", 1: "em valve control", 2: "valve control", 3: "report" };
    var action_type_values = getValues(action_type_map);
    var report_type_map = { 1: "valve 1", 2: "valve 2", 3: "custom message", 4: "pressure threshold alarm" };
    var report_type_values = getValues(report_type_map);

    var buffer = new Buffer(13);
    if (action_type_values.indexOf(action.type) === -1) {
        throw new Error("action.type must be one of " + action_type_values.join(", "));
    }
    var action_type_value = getValue(action_type_map, action.type);
    buffer.writeUInt8(action_type_value);
    switch (action_type_value) {
        case 0x00: // none
            break;
        case 0x01: // em valve control (interrupt current execution task)
            if (enable_values.indexOf(action.time_enable) === -1) {
                throw new Error("action.time_enable must be one of " + enable_values.join(", "));
            }
            if (enable_values.indexOf(action.pulse_enable) === -1) {
                throw new Error("action.pulse_enable must be one of " + enable_values.join(", "));
            }
            buffer.writeUInt8(action.valve_index);
            buffer.writeUInt8(action.valve_opening);
            buffer.writeUInt8(getValue(enable_map, action.time_enable));
            buffer.writeUInt32LE(action.duration);
            buffer.writeUInt8(getValue(enable_map, action.pulse_enable));
            buffer.writeUInt32LE(action.pulse_threshold);
            break;
        case 0x02: // general valve control
            if (enable_values.indexOf(action.time_enable) === -1) {
                throw new Error("action.time_enable must be one of " + enable_values.join(", "));
            }
            if (enable_values.indexOf(action.pulse_enable) === -1) {
                throw new Error("action.pulse_enable must be one of " + enable_values.join(", "));
            }
            buffer.writeUInt8(action.valve_index);
            buffer.writeUInt8(action.valve_opening);
            buffer.writeUInt8(getValue(enable_map, action.time_enable));
            buffer.writeUInt32LE(action.duration);
            buffer.writeUInt8(getValue(enable_map, action.pulse_enable));
            buffer.writeUInt32LE(action.pulse_threshold);
            break;
        case 0x03: // report
            if (report_type_values.indexOf(action.report_type) === -1) {
                throw new Error("action.report_type must be one of " + report_type_values.join(", "));
            }
            if (enable_values.indexOf(action.threshold_release_enable) === -1) {
                throw new Error("action.threshold_release_enable must be one of " + enable_values.join(", "));
            }
            buffer.writeUInt8(getValue(report_type_map, action.report_type));
            buffer.writeAscii(action.report_content, 8);
            buffer.writeUInt8(0x00); // ignore the next byte
            buffer.writeUInt8(action.report_counts);
            buffer.writeUInt8(getValue(enable_map, action.threshold_release_enable));
            break;
    }
    return buffer.toBytes();
}

/**
 * set d2d enable
 * @param {number} d2d_enable values: (0: disable, 1: enable)
 * @example { "d2d_enable": 1 }
 */
function setD2DEnable(d2d_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(d2d_enable) === -1) {
        throw new Error("d2d_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x84);
    buffer.writeUInt8(getValue(enable_map, d2d_enable));
    return buffer.toBytes();
}

/**
 * set d2d key
 * @param {string} d2d_key
 * @example { "d2d_key": "0000000000000000" }
 */
function setD2DKey(d2d_key) {
    if (typeof d2d_key !== "string") {
        throw new Error("d2d_key must be a string");
    }
    if (d2d_key.length !== 16) {
        throw new Error("d2d_key must be 16 characters");
    }
    if (!/^[0-9a-fA-F]+$/.test(d2d_key)) {
        throw new Error("d2d_key must be hex string [0-9a-fA-F]");
    }

    var data = hexStringToBytes(d2d_key);
    var buffer = new Buffer(10);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x35);
    buffer.writeBytes(data);
    return buffer.toBytes();
}

/**
 * set response enable
 * @param {number} response_enable values: (0: disable, 1: enable)
 * @example { "response_enable": 1 }
 */
function setResponseEnable(response_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(response_enable) === -1) {
        throw new Error("response_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xf3);
    buffer.writeUInt8(getValue(enable_map, response_enable));
    return buffer.toBytes();
}

/**
 * set class a response time
 * @param {number} class_a_response_time unit: s, range: [0, 64800]
 * @example { "class_a_response_time": 10 }
 */
function setClassAResponseTime(class_a_response_time) {
    if (class_a_response_time < 0 || class_a_response_time > 64800) {
        throw new Error("class_a_response_time must be in the range of 0 to 64800");
    }

    var buffer = new Buffer(6);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x1e);
    buffer.writeUInt32LE(class_a_response_time);
    return buffer.toBytes();
}

/**
 * set gpio jitter time
 * @param {number} gpio_jitter_time unit: s
 * @example { "gpio_jitter_time": 40 }
 */
function setGpioJitterTime(gpio_jitter_time) {
    if (typeof gpio_jitter_time !== "number") {
        throw new Error("gpio_jitter_time must be a number");
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x46);
    buffer.writeUInt8(gpio_jitter_time);
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

Buffer.prototype.writeAscii = function (value, maxLength) {
    for (let i = 0; i < maxLength; i++) {
        if (i < value.length) {
            this.buffer[this.offset + i] = value.charCodeAt(i);
        } else {
            this.buffer[this.offset + i] = 0;
        }
    }
    this.offset += maxLength;
};

Buffer.prototype.toBytes = function () {
    return this.buffer;
};

function hexStringToBytes(hex) {
    var bytes = [];
    for (var c = 0; c < hex.length; c += 2) {
        bytes.push(parseInt(hex.substr(c, 2), 16));
    }
    return bytes;
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
