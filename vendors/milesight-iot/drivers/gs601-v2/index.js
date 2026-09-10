/**
 * Payload Decoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product GS601
 */
var RAW_VALUE = 0x00;

/* eslint no-redeclare: "off" */
/* eslint-disable */


// The Things Network
function Decoder(bytes, port) {
    return milesightDeviceDecode(bytes);
}
/* eslint-enable */

function milesightDeviceDecode(bytes) {
    var decoded = {};

    var unknown_command = 0;
    for (var i = 0; i < bytes.length; ) {
        var command_id = bytes[i++];

        switch (command_id) {
            // attribute
            case 0xdf:
                decoded.tsl_version = readProtocolVersion(bytes.slice(i, i + 2));
                i += 2;
                break;
            case 0xde:
                decoded.product_name = readString(bytes.slice(i, i + 32));
                i += 32;
                break;
            case 0xdd:
                decoded.product_pn = readString(bytes.slice(i, i + 32));
                i += 32;
                break;
            case 0xdb:
                decoded.product_sn = readHexString(bytes.slice(i, i + 8));
                i += 8;
                break;
            case 0xda:
                decoded.version = {};
                decoded.version.hardware_version = readHardwareVersion(bytes.slice(i, i + 2));
                decoded.version.firmware_version = readFirmwareVersion(bytes.slice(i + 2, i + 8));
                i += 8;
                break;
            case 0xd9:
                decoded.oem_id = readHexString(bytes.slice(i, i + 2));
                i += 2;
                break;
            case 0xd8:
                decoded.product_frequency_band = readString(bytes.slice(i, i + 16));
                i += 16;
                break;
            case 0xee:
                decoded.device_request = 1;
                i += 0;
                break;
            case 0xc8:
                decoded.device_status = readDeviceStatus(bytes[i]);
                i += 1;
                break;
            case 0xcf:
                // skip 1 byte
                decoded.lorawan_class = readLoRaWANClass(bytes[i + 1]);
                i += 2;
                break;

            // telemetry
            case 0x00:
                decoded.battery = readUInt8(bytes[i]);
                i += 1;
                break;
            case 0x01:
                decoded.vaping_index = readUInt8(bytes[i]);
                i += 1;
                break;
            case 0x02:
                var vaping_index_alarm = {};
                var alarm_type = bytes[i];

                vaping_index_alarm.type = readVapeIndexAlarmType(alarm_type);
                if (alarm_type === 0x10 || alarm_type === 0x11) {
                    vaping_index_alarm.vaping_index = readUInt8(bytes[i + 1]);
                    decoded.vaping_index = readUInt8(bytes[i + 1]);
                    i += 2;
                } else {
                    i += 1;
                }

                decoded.vaping_index_alarm = vaping_index_alarm;
                break;
            case 0x03:
                decoded.pm1_0 = readUInt16LE(bytes.slice(i, i + 2));
                i += 2;
                break;
            case 0x04:
                var pm1_0_alarm = {};
                var alarm_type = bytes[i];

                pm1_0_alarm.type = readPMAlarmType(alarm_type);
                if (alarm_type === 0x10 || alarm_type === 0x11) {
                    pm1_0_alarm.pm1_0 = readUInt16LE(bytes.slice(i + 1, i + 3));
                    decoded.pm1_0 = readUInt16LE(bytes.slice(i + 1, i + 3));
                    i += 3;
                } else {
                    i += 1;
                }

                decoded.pm1_0_alarm = pm1_0_alarm;
                break;
            case 0x05:
                decoded.pm2_5 = readUInt16LE(bytes.slice(i, i + 2));
                i += 2;
                break;
            case 0x06:
                var pm2_5_alarm = {};
                var alarm_type = bytes[i];

                pm2_5_alarm.type = readPMAlarmType(alarm_type);
                if (alarm_type === 0x10 || alarm_type === 0x11) {
                    pm2_5_alarm.pm2_5 = readUInt16LE(bytes.slice(i + 1, i + 3));
                    decoded.pm2_5 = readUInt16LE(bytes.slice(i + 1, i + 3));
                    i += 3;
                } else {
                    i += 1;
                }

                decoded.pm2_5_alarm = pm2_5_alarm;
                break;
            case 0x07:
                decoded.pm10 = readUInt16LE(bytes.slice(i, i + 2));
                i += 2;
                break;
            case 0x08:
                var pm10_alarm = {};
                var alarm_type = bytes[i];

                pm10_alarm.type = readPMAlarmType(alarm_type);
                if (alarm_type === 0x10 || alarm_type === 0x11) {
                    pm10_alarm.pm10 = readUInt16LE(bytes.slice(i + 1, i + 3));
                    decoded.pm10 = readUInt16LE(bytes.slice(i + 1, i + 3));
                    i += 3;
                } else {
                    i += 1;
                }

                decoded.pm10_alarm = pm10_alarm;
                break;
            case 0x09:
                decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
                i += 2;
                break;
            case 0x0a:
                var temperature_alarm = {};
                var alarm_type = bytes[i];

                temperature_alarm.type = readTemperatureAlarmType(alarm_type);
                if (alarm_type === 0x10 || alarm_type === 0x11) {
                    temperature_alarm.temperature = readInt16LE(bytes.slice(i + 1, i + 3)) / 10;
                    decoded.temperature = readInt16LE(bytes.slice(i + 1, i + 3)) / 10;
                    i += 3;
                } else {
                    i += 1;
                }

                decoded.temperature_alarm = temperature_alarm;
                break;
            case 0x0b:
                decoded.humidity = readUInt16LE(bytes.slice(i, i + 2)) / 10;
                i += 2;
                break;
            case 0x0c:
                var humidity_alarm = {};
                var alarm_type = bytes[i];

                humidity_alarm.type = readHumidityAlarmType(alarm_type);
                i += 1;

                decoded.humidity_alarm = humidity_alarm;
                break;
            case 0x0d:
                decoded.tvoc = readUInt16LE(bytes.slice(i, i + 2));
                i += 2;
                break;
            case 0x0e:
                var tvoc_alarm = {};
                var alarm_type = bytes[i];

                tvoc_alarm.type = readTVOCAlarmType(alarm_type);
                if (alarm_type === 0x10 || alarm_type === 0x11) {
                    tvoc_alarm.tvoc = readUInt16LE(bytes.slice(i + 1, i + 3));
                    decoded.tvoc = readUInt16LE(bytes.slice(i + 1, i + 3));
                    i += 3;
                } else {
                    i += 1;
                }

                decoded.tvoc_alarm = tvoc_alarm;
                break;
            case 0x0f:
                decoded.tamper_status = readTamperStatus(bytes[i]);
                i += 1;
                break;
            case 0x10:
                var tamper_status_alarm = {};
                tamper_status_alarm.type = readTamperAlarmType(bytes[i]);
                i += 1;

                decoded.tamper_status_alarm = tamper_status_alarm;
                break;
            case 0x11:
                decoded.buzzer = readBuzzerStatus(bytes[i]);
                i += 1;
                break;
            case 0x12:
                decoded.occupancy_status = readOccupancyStatus(bytes[i]);
                i += 1;
                break;
            case 0x20:
                decoded.tvoc_raw_data_1 = {};
                decoded.tvoc_raw_data_1.rmox_0 = readFloatLE(bytes.slice(i, i + 4));
                decoded.tvoc_raw_data_1.rmox_1 = readFloatLE(bytes.slice(i + 4, i + 8));
                i += 8;
                break;
            case 0x21:
                decoded.tvoc_raw_data_2 = {};
                decoded.tvoc_raw_data_2.rmox_2 = readFloatLE(bytes.slice(i, i + 4));
                decoded.tvoc_raw_data_2.rmox_3 = readFloatLE(bytes.slice(i + 4, i + 8));
                i += 8;
                break;
            case 0x22:
                decoded.tvoc_raw_data_3 = {};
                decoded.tvoc_raw_data_3.rmox_4 = readFloatLE(bytes.slice(i, i + 4));
                decoded.tvoc_raw_data_3.rmox_5 = readFloatLE(bytes.slice(i + 4, i + 8));
                i += 8;
                break;
            case 0x23:
                decoded.tvoc_raw_data_4 = {};
                decoded.tvoc_raw_data_4.rmox_6 = readFloatLE(bytes.slice(i, i + 4));
                decoded.tvoc_raw_data_4.rmox_7 = readFloatLE(bytes.slice(i + 4, i + 8));
                i += 8;
                break;
            case 0x24:
                decoded.tvoc_raw_data_5 = {};
                decoded.tvoc_raw_data_5.rmox_8 = readFloatLE(bytes.slice(i, i + 4));
                decoded.tvoc_raw_data_5.rmox_9 = readFloatLE(bytes.slice(i + 4, i + 8));
                i += 8;
                break;
            case 0x25:
                decoded.tvoc_raw_data_6 = {};
                decoded.tvoc_raw_data_6.rmox_10 = readFloatLE(bytes.slice(i, i + 4));
                decoded.tvoc_raw_data_6.rmox_11 = readFloatLE(bytes.slice(i + 4, i + 8));
                i += 8;
                break;
            case 0x26:
                decoded.tvoc_raw_data_7 = {};
                decoded.tvoc_raw_data_7.rmox_12 = readFloatLE(bytes.slice(i, i + 4));
                decoded.tvoc_raw_data_7.zmod4510_rmox_3 = readFloatLE(bytes.slice(i + 4, i + 8));
                i += 8;
                break;
            case 0x27:
                decoded.tvoc_raw_data_8 = {};
                decoded.tvoc_raw_data_8.log_rcda = readFloatLE(bytes.slice(i, i + 4));
                decoded.tvoc_raw_data_8.rhtr = readFloatLE(bytes.slice(i + 4, i + 8));
                i += 8;
                break;
            case 0x28:
                decoded.tvoc_raw_data_9 = {};
                decoded.tvoc_raw_data_9.temperature = readFloatLE(bytes.slice(i, i + 4));
                decoded.tvoc_raw_data_9.iaq = readFloatLE(bytes.slice(i + 4, i + 8));
                i += 8;
                break;
            case 0x29:
                decoded.tvoc_raw_data_10 = {};
                decoded.tvoc_raw_data_10.tvoc = readFloatLE(bytes.slice(i, i + 4));
                decoded.tvoc_raw_data_10.etoh = readFloatLE(bytes.slice(i + 4, i + 8));
                i += 8;
                break;
            case 0x2a:
                decoded.tvoc_raw_data_11 = {};
                decoded.tvoc_raw_data_11.eco2 = readFloatLE(bytes.slice(i, i + 4));
                decoded.tvoc_raw_data_11.rel_iaq = readFloatLE(bytes.slice(i + 4, i + 8));
                i += 8;
                break;
            case 0x2b:
                decoded.pm_sensor_working_time = readUInt32LE(bytes.slice(i, i + 4));
                i += 4;
                break;

            // config
            case 0x60:
                var time_unit = readUInt8(bytes[i]);
                decoded.reporting_interval = {};
                decoded.reporting_interval.unit = readTimeUnitType(time_unit);
                if (time_unit === 0) {
                    decoded.reporting_interval.seconds_of_time = readUInt16LE(bytes.slice(i + 1, i + 3));
                } else if (time_unit === 1) {
                    decoded.reporting_interval.minutes_of_time = readUInt16LE(bytes.slice(i + 1, i + 3));
                }
                i += 3;
                break;
            case 0x61:
                decoded.temperature_unit = readTemperatureType(bytes[i]);
                i += 1;
                break;
            case 0x62:
                decoded.led_status = readEnableStatus(bytes[i]);
                i += 1;
                break;
            case 0x63:
                decoded.buzzer_enable = readEnableStatus(bytes[i]);
                i += 1;
                break;
            case 0x64:
                var index = readUInt8(bytes[i]);
                var buzzer_sleep = {};
                buzzer_sleep.enable = readEnableStatus(bytes[i + 1]);
                buzzer_sleep.start_time = readUInt16LE(bytes.slice(i + 2, i + 4));
                buzzer_sleep.end_time = readUInt16LE(bytes.slice(i + 4, i + 6));
                i += 6;
                decoded.buzzer_sleep = decoded.buzzer_sleep || {};
                decoded.buzzer_sleep["item_" + index] = buzzer_sleep;
                break;
            case 0x65:
                decoded.buzzer_button_stop_enable = readEnableStatus(bytes[i]);
                i += 1;
                break;
            case 0x66:
                decoded.buzzer_silent_time = readUInt16LE(bytes.slice(i, i + 2));
                i += 2;
                break;
            case 0x67:
                decoded.tamper_alarm_enable = readEnableStatus(bytes[i]);
                i += 1;
                break;
            case 0x68:
                decoded.tvoc_raw_reporting_enable = readEnableStatus(bytes[i]);
                i += 1;
                break;
            case 0x69:
                decoded.temperature_alarm_settings = {};
                decoded.temperature_alarm_settings.enable = readEnableStatus(bytes[i]);
                decoded.temperature_alarm_settings.threshold_condition = readThresholdCondition(bytes[i + 1]);
                decoded.temperature_alarm_settings.threshold_min = readInt16LE(bytes.slice(i + 2, i + 4)) / 10;
                decoded.temperature_alarm_settings.threshold_max = readInt16LE(bytes.slice(i + 4, i + 6)) / 10;
                i += 6;
                break;
            case 0x6a:
                decoded.pm1_0_alarm_settings = {};
                decoded.pm1_0_alarm_settings.enable = readEnableStatus(bytes[i]);
                // decoded.pm1_0_alarm_settings.threshold_condition = readThresholdCondition(bytes[i + 1]);
                // decoded.pm1_0_alarm_settings.threshold_min = readInt16LE(bytes.slice(i + 2, i + 4));
                decoded.pm1_0_alarm_settings.threshold_max = readInt16LE(bytes.slice(i + 4, i + 6));
                i += 6;
                break;
            case 0x6b:
                decoded.pm2_5_alarm_settings = {};
                decoded.pm2_5_alarm_settings.enable = readEnableStatus(bytes[i]);
                // decoded.pm2_5_alarm_settings.threshold_condition = readThresholdCondition(bytes[i + 1]);
                // decoded.pm2_5_alarm_settings.threshold_min = readInt16LE(bytes.slice(i + 2, i + 4));
                decoded.pm2_5_alarm_settings.threshold_max = readInt16LE(bytes.slice(i + 4, i + 6));
                i += 6;
                break;
            case 0x6c:
                decoded.pm10_alarm_settings = {};
                decoded.pm10_alarm_settings.enable = readEnableStatus(bytes[i]);
                // decoded.pm10_alarm_settings.threshold_condition = readThresholdCondition(bytes[i + 1]);
                // decoded.pm10_alarm_settings.threshold_min = readInt16LE(bytes.slice(i + 2, i + 4));
                decoded.pm10_alarm_settings.threshold_max = readInt16LE(bytes.slice(i + 4, i + 6));
                i += 6;
                break;
            case 0x6d:
                decoded.tvoc_alarm_settings = {};
                decoded.tvoc_alarm_settings.enable = readEnableStatus(bytes[i]);
                // decoded.tvoc_alarm_settings.threshold_condition = readThresholdCondition(bytes[i + 1]);
                // decoded.tvoc_alarm_settings.threshold_min = readInt16LE(bytes.slice(i + 2, i + 4));
                decoded.tvoc_alarm_settings.threshold_max = readInt16LE(bytes.slice(i + 4, i + 6));
                i += 6;
                break;
            case 0x6e:
                decoded.vaping_index_alarm_settings = {};
                decoded.vaping_index_alarm_settings.enable = readEnableStatus(bytes[i]);
                // decoded.vaping_index_alarm_settings.threshold_condition = readThresholdCondition(bytes[i + 1]);
                // decoded.vaping_index_alarm_settings.threshold_min = readUInt8(bytes[i + 2]);
                decoded.vaping_index_alarm_settings.threshold_max = readUInt8(bytes[i + 3]);
                i += 4;
                break;
            case 0x6f:
                decoded.alarm_reporting_times = readUInt16LE(bytes.slice(i, i + 2));
                i += 2;
                break;
            case 0x70:
                decoded.alarm_deactivation_enable = readEnableStatus(bytes[i]);
                i += 1;
                break;
            case 0x71:
                decoded.temperature_calibration_settings = {};
                decoded.temperature_calibration_settings.enable = readEnableStatus(bytes[i]);
                decoded.temperature_calibration_settings.calibration_value = readInt16LE(bytes.slice(i + 1, i + 3)) / 10;
                i += 3;
                break;
            case 0x72:
                decoded.humidity_calibration_settings = {};
                decoded.humidity_calibration_settings.enable = readEnableStatus(bytes[i]);
                decoded.humidity_calibration_settings.calibration_value = readInt16LE(bytes.slice(i + 1, i + 3)) / 10;
                i += 3;
                break;
            case 0x73:
                decoded.pm1_0_calibration_settings = {};
                decoded.pm1_0_calibration_settings.enable = readEnableStatus(bytes[i]);
                decoded.pm1_0_calibration_settings.calibration_value = readInt16LE(bytes.slice(i + 1, i + 3));
                i += 3;
                break;
            case 0x74:
                decoded.pm2_5_calibration_settings = {};
                decoded.pm2_5_calibration_settings.enable = readEnableStatus(bytes[i]);
                decoded.pm2_5_calibration_settings.calibration_value = readInt16LE(bytes.slice(i + 1, i + 3));
                i += 3;
                break;
            case 0x75:
                decoded.pm10_calibration_settings = {};
                decoded.pm10_calibration_settings.enable = readEnableStatus(bytes[i]);
                decoded.pm10_calibration_settings.calibration_value = readInt16LE(bytes.slice(i + 1, i + 3));
                i += 3;
                break;
            case 0x76:
                decoded.tvoc_calibration_settings = {};
                decoded.tvoc_calibration_settings.enable = readEnableStatus(bytes[i]);
                decoded.tvoc_calibration_settings.calibration_value = readInt16LE(bytes.slice(i + 1, i + 3));
                i += 3;
                break;
            case 0x77:
                decoded.vaping_index_calibration_settings = {};
                decoded.vaping_index_calibration_settings.enable = readEnableStatus(bytes[i]);
                decoded.vaping_index_calibration_settings.calibration_value = readInt8(bytes[i + 1]);
                i += 2;
                break;
            case 0xc6:
                decoded.daylight_saving_time = {};
                decoded.daylight_saving_time.daylight_saving_time_enable = readEnableStatus(bytes[i]);
                decoded.daylight_saving_time.daylight_saving_time_offset = readUInt8(bytes[i + 1]);
                decoded.daylight_saving_time.start_month = readUInt8(bytes[i + 2]);
                var start_day_value = readUInt8(bytes[i + 3]);
                decoded.daylight_saving_time.start_week_num = (start_day_value >>> 4) & 0x07;
                decoded.daylight_saving_time.start_week_day = start_day_value & 0x0f;
                decoded.daylight_saving_time.start_hour_min = readUInt16LE(bytes.slice(i + 4, i + 6));
                decoded.daylight_saving_time.end_month = readUInt8(bytes[i + 6]);
                var end_day_value = readUInt8(bytes[i + 7]);
                decoded.daylight_saving_time.end_week_num = (end_day_value >>> 4) & 0x0f;
                decoded.daylight_saving_time.end_week_day = end_day_value & 0x0f;
                decoded.daylight_saving_time.end_hour_min = readUInt16LE(bytes.slice(i + 8, i + 10));
                i += 10;
                break;
            case 0xc7:
                decoded.time_zone = readTimeZone(readInt16LE(bytes.slice(i, i + 2)));
                i += 2;
                break;

            // service
            case 0x5f:
                decoded.stop_buzzer_alarm = readYesNoStatus(1);
                break;
            case 0x5e:
                decoded.execute_tvoc_self_clean = readYesNoStatus(1);
                break;
            case 0xb6:
                decoded.reconnect = readYesNoStatus(1);
                break;
            case 0xb8:
                decoded.synchronize_time = readYesNoStatus(1);
                break;
            case 0xb9:
                decoded.query_device_status = readYesNoStatus(1);
                break;
            case 0xbe:
                decoded.reboot = readYesNoStatus(1);
                break;
            // control frame
            case 0xef:
                var cmd_data = readUInt8(bytes[i]);
                var cmd_result = (cmd_data >>> 4) & 0x0f;
                var cmd_length = cmd_data & 0x0f;
                var cmd_id = readHexString(bytes.slice(i + 1, i + 1 + cmd_length));
                var cmd_header = readHexString(bytes.slice(i + 1, i + 2));
                i += 1 + cmd_length;

                var response = {};
                response.result = readCmdResult(cmd_result);
                response.cmd_id = cmd_id;
                response.cmd_name = readCmdName(cmd_header);

                decoded.request_result = decoded.request_result || [];
                decoded.request_result.push(response);
                break;
            case 0xfe:
                decoded.frame = readUInt8(bytes[i]);
                i += 1;
                break;
            default:
                unknown_command = 1;
                break;
        }

        if (unknown_command) {
            throw new Error("unknown command: " + command_id);
        }
    }

    return decoded;
}

function readProtocolVersion(bytes) {
    var major = bytes[0] & 0xff;
    var minor = bytes[1] & 0xff;
    return "v" + major + "." + minor;
}

function readHardwareVersion(bytes) {
    var major = bytes[0] & 0xff;
    var minor = bytes[1] & 0xff;
    return "v" + major + "." + minor;
}

function readFirmwareVersion(bytes) {
    var major = bytes[0] & 0xff;
    var minor = bytes[1] & 0xff;
    var release = bytes[2] & 0xff;
    var alpha = bytes[3] & 0xff;
    var unit_test = bytes[4] & 0xff;
    var test = bytes[5] & 0xff;

    var version = "v" + major + "." + minor;
    if (release !== 0) version += "-r" + release;
    if (alpha !== 0) version += "-a" + alpha;
    if (unit_test !== 0) version += "-u" + unit_test;
    if (test !== 0) version += "-t" + test;
    return version;
}

function readTimeZone(value) {
    var time_zone_map = {
        "-720": "UTC-12",
        "-660": "UTC-11",
        "-600": "UTC-10",
        "-570": "UTC-9:30",
        "-540": "UTC-9",
        "-480": "UTC-8",
        "-420": "UTC-7",
        "-360": "UTC-6",
        "-300": "UTC-5",
        "-240": "UTC-4",
        "-210": "UTC-3:30",
        "-180": "UTC-3",
        "-120": "UTC-2",
        "-60": "UTC-1",
        0: "UTC",
        60: "UTC+1",
        120: "UTC+2",
        180: "UTC+3",
        210: "UTC+3:30",
        240: "UTC+4",
        270: "UTC+4:30",
        300: "UTC+5",
        330: "UTC+5:30",
        345: "UTC+5:45",
        360: "UTC+6",
        390: "UTC+6:30",
        420: "UTC+7",
        480: "UTC+8",
        540: "UTC+9",
        570: "UTC+9:30",
        600: "UTC+10",
        630: "UTC+10:30",
        660: "UTC+11",
        720: "UTC+12",
        765: "UTC+12:45",
        780: "UTC+13",
        840: "UTC+14",
    };
    return getValue(time_zone_map, value);
}

function readDeviceStatus(type) {
    var device_status_map = { 0: "off", 1: "on" };
    return getValue(device_status_map, type);
}

function readLoRaWANClass(type) {
    var lorawan_class_map = {
        0: "Class A",
        1: "Class B",
        2: "Class C",
        3: "Class CtoB",
    };
    return getValue(lorawan_class_map, type);
}

function readVapeIndexAlarmType(type) {
    var vape_index_alarm_map = {
        0: "collection error", // 0x00
        1: "lower range error", // 0x01
        2: "over range error", // 0x02
        16: "alarm deactivation", // 0x10
        17: "alarm trigger", // 0x11
        32: "interference alarm deactivation", // 0x20
        33: "interference alarm trigger", // 0x21
    };
    return getValue(vape_index_alarm_map, type);
}

function readPMAlarmType(type) {
    var pm_alarm_map = {
        0: "collection error", // 0x00
        1: "lower range error", // 0x01
        2: "over range error", // 0x02
        16: "alarm deactivation", // 0x10
        17: "alarm trigger", // 0x11
    };
    return getValue(pm_alarm_map, type);
}

function readTemperatureAlarmType(type) {
    var temperature_alarm_map = {
        0: "collection error", // 0x00
        1: "lower range error", // 0x01
        2: "over range error", // 0x02
        16: "alarm deactivation", // 0x10
        17: "alarm trigger", // 0x11
        32: "burning alarm deactivation", // 0x20
        33: "burning alarm trigger", // 0x21
    };
    return getValue(temperature_alarm_map, type);
}

function readHumidityAlarmType(type) {
    var humidity_alarm_map = {
        0: "collection error", // 0x00
        1: "lower range error", // 0x01
        2: "over range error", // 0x02
    };
    return getValue(humidity_alarm_map, type);
}

function readTVOCAlarmType(type) {
    var tvoc_alarm_map = {
        0: "collection error", // 0x00
        1: "lower range error", // 0x01
        2: "over range error", // 0x02
        16: "alarm deactivation", // 0x10
        17: "alarm trigger", // 0x11
    };
    return getValue(tvoc_alarm_map, type);
}

function readTamperStatus(type) {
    var tamper_status_map = { 0: "normal", 1: "triggered" };
    return getValue(tamper_status_map, type);
}

function readTamperAlarmType(type) {
    var tamper_alarm_map = {
        32: "alarm deactivation", // 0x20
        33: "alarm trigger", // 0x21
    };
    return getValue(tamper_alarm_map, type);
}

function readBuzzerStatus(type) {
    var buzzer_status_map = { 0: "normal", 1: "triggered" };
    return getValue(buzzer_status_map, type);
}

function readOccupancyStatus(type) {
    var occupancy_status_map = { 0: "vacant", 1: "occupied" };
    return getValue(occupancy_status_map, type);
}

function readTimeUnitType(type) {
    var unit_map = { 0: "second", 1: "minute" };
    return getValue(unit_map, type);
}

function readTemperatureType(type) {
    var unit_map = { 0: "celsius", 1: "fahrenheit" };
    return getValue(unit_map, type);
}

function readEnableStatus(type) {
    var enable_map = { 0: "disable", 1: "enable" };
    return getValue(enable_map, type);
}

function readYesNoStatus(type) {
    var yes_no_map = { 0: "no", 1: "yes" };
    return getValue(yes_no_map, type);
}

function readThresholdCondition(type) {
    var threshold_condition_map = { 0: "disable", 1: "below", 2: "above", 3: "between", 4: "outside" };
    return getValue(threshold_condition_map, type);
}

// function readTimeZone(time_zone) {
//     var timezone_map = { "-720": "UTC-12", "-660": "UTC-11", "-600": "UTC-10", "-570": "UTC-9:30", "-540": "UTC-9", "-480": "UTC-8", "-420": "UTC-7", "-360": "UTC-6", "-300": "UTC-5", "-240": "UTC-4", "-210": "UTC-3:30", "-180": "UTC-3", "-120": "UTC-2", "-60": "UTC-1", 0: "UTC", 60: "UTC+1", 120: "UTC+2", 180: "UTC+3", 210: "UTC+3:30", 240: "UTC+4", 270: "UTC+4:30", 300: "UTC+5", 330: "UTC+5:30", 345: "UTC+5:45", 360: "UTC+6", 390: "UTC+6:30", 420: "UTC+7", 480: "UTC+8", 540: "UTC+9", 570: "UTC+9:30", 600: "UTC+10", 630: "UTC+10:30", 660: "UTC+11", 720: "UTC+12", 765: "UTC+12:45", 780: "UTC+13", 840: "UTC+14" };
//     return getValue(timezone_map, time_zone);
// }

function readCmdResult(type) {
    var result_map = { 0: "success", 1: "parsing error", 2: "order error", 3: "password error", 4: "read params error", 5: "write params error", 6: "read execution error", 7: "write execution error", 8: "read apply error", 9: "write apply error", 10: "associative error" };
    return getValue(result_map, type);
}

function readCmdName(type) {
    var name_map = {
        60: { level: 1, name: "reporting_interval" },
        61: { level: 1, name: "temperature_unit" },
        62: { level: 1, name: "led_status" },
        63: { level: 1, name: "buzzer_enable" },
        64: { level: 1, name: "buzzer_sleep" },
        65: { level: 1, name: "buzzer_button_stop_enable" },
        66: { level: 1, name: "buzzer_silent_time" },
        67: { level: 1, name: "tamper_alarm_enable" },
        68: { level: 1, name: "tvoc_raw_reporting_enable" },
        69: { level: 1, name: "temperature_alarm_settings" },
        "6a": { level: 1, name: "pm1_0_alarm_settings" },
        "6b": { level: 1, name: "pm2_5_alarm_settings" },
        "6c": { level: 1, name: "pm10_alarm_settings" },
        "6d": { level: 1, name: "tvoc_alarm_settings" },
        "6e": { level: 1, name: "vaping_index_alarm_settings" },
        "6f": { level: 1, name: "alarm_reporting_times" },
        70: { level: 1, name: "alarm_deactivation_enable" },
        71: { level: 1, name: "temperature_calibration_settings" },
        72: { level: 1, name: "humidity_calibration_settings" },
        73: { level: 1, name: "pm1_0_calibration_settings" },
        74: { level: 1, name: "pm2_5_calibration_settings" },
        75: { level: 1, name: "pm10_calibration_settings" },
        76: { level: 1, name: "tvoc_calibration_settings" },
        77: { level: 1, name: "vaping_index_calibration_settings" },
        c6: { level: 1, name: "daylight_saving_time" },
        c7: { level: 1, name: "time_zone" },
        be: { level: 1, name: "reboot" },
        b6: { level: 0, name: "reconnect" },
        b8: { level: 0, name: "synchronize_time" },
        b9: { level: 0, name: "query_device_status" },
        "5f": { level: 0, name: "stop_buzzer_alarm" },
        "5e": { level: 0, name: "execute_tvoc_self_clean" },
    };

    var data = name_map[type];
    if (data === undefined) return "unknown";
    return data.name;
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

function readFloat16LE(bytes) {
    var bits = (bytes[1] << 8) | bytes[0];
    var sign = bits >>> 15 === 0 ? 1.0 : -1.0;
    var e = (bits >>> 10) & 0x1f;
    var m = e === 0 ? (bits & 0x3ff) << 1 : (bits & 0x3ff) | 0x400;
    var f = sign * m * Math.pow(2, e - 25);

    var n = Number(f.toFixed(2));
    return n;
}

function readFloatLE(bytes) {
    var bits = (bytes[3] << 24) | (bytes[2] << 16) | (bytes[1] << 8) | bytes[0];
    var sign = bits >>> 31 === 0 ? 1.0 : -1.0;
    var e = (bits >>> 23) & 0xff;
    var m = e === 0 ? (bits & 0x7fffff) << 1 : (bits & 0x7fffff) | 0x800000;
    var f = sign * m * Math.pow(2, e - 150);
    return Number(f.toFixed(3));
}

function readString(bytes) {
    var str = "";
    var i = 0;
    var byte1, byte2, byte3, byte4;
    while (i < bytes.length) {
        byte1 = bytes[i++];
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

function readHexString(bytes) {
    var temp = [];
    for (var idx = 0; idx < bytes.length; idx++) {
        temp.push(("0" + (bytes[idx] & 0xff).toString(16)).slice(-2));
    }
    return temp.join("");
}

function getValue(map, key) {
    if (RAW_VALUE) return key;
    var value = map[key];
    if (!value) value = "unknown";
    return value;
}

function decodeUplink(input) {
    var decoded = milesightDeviceDecode(input.bytes);
    return { data: decoded };
}

var __milesightDownlinkCodec = (function () {
// Downlink encoder taken verbatim from Milesight SensorDecoders (gs-series/gs601/gs601-encoder.js).
// Only this IIFE is Milesight's current encoder; the decoder above is unchanged.
/**
 * Payload Encoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product GS601
 */

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
	processTemperature(payload);
	var encoded = [];
	//0xfe
	if ('request_check_order' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xfe);
		if (payload.request_check_order.order < 0 || payload.request_check_order.order > 255) {
			throw new Error('request_check_order.order must be between 0 and 255');
		}
		buffer.writeUInt8(payload.request_check_order.order);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xf4
	if ('request_full_inspection' in payload) {
		var buffer = new Buffer();
		if (isValid(payload.request_full_inspection.start_inspection)) {
			buffer.writeUInt8(0xf4);
			buffer.writeUInt8(0x00);
		}
		if (isValid(payload.request_full_inspection.control)) {
			buffer.writeUInt8(0xf4);
			buffer.writeUInt8(0x01);
			if (payload.request_full_inspection.control.length < 0 || payload.request_full_inspection.control.length > 65535) {
				throw new Error('request_full_inspection.control.length must be between 0 and 65535');
			}
			buffer.writeUInt16LE(payload.request_full_inspection.control.length);
			buffer.writeBytes(payload.request_full_inspection.control.data, payload.request_full_inspection.control.length, true);
		}
		if (isValid(payload.request_full_inspection.reading)) {
			buffer.writeUInt8(0xf4);
			buffer.writeUInt8(0x02);
			buffer.writeUInt16LE(payload.request_full_inspection.reading.length);
			buffer.writeBytes(payload.request_full_inspection.reading.data, payload.request_full_inspection.reading.length, true);
		}
		if (isValid(payload.request_full_inspection.end_inspection)) {
			buffer.writeUInt8(0xf4);
			buffer.writeUInt8(0x03);
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xef
	if ('req' in payload) {
		var buffer = new Buffer();
		var reqList = payload.req;
		for (var idx = 0; idx < reqList.length; idx++) {
			var req_command = reqList[idx];
			var pureNumber = [];
			var formateStrParts = [];

			req_command.split('.').forEach(function(part) {
				if (/^[0-9]+$/.test(part)) {
					// padStart ES5 兼容
					var hex = Number(part).toString(16);
					while (hex.length < 2) { hex = '0' + hex; }
					pureNumber.push(hex);
					formateStrParts.push('_item');
				} else {
					formateStrParts.push(part);
				}
			});

			var formateStr = formateStrParts.join('.');
			var hexString = cmdMap()[formateStr];

			if (hexString && hexString.indexOf('xx') !== -1) {
				var i = 0;
				hexString = hexString.replace(/xx/g, function() {
					return pureNumber[i++];
				});
			}

			if (hexString) {
				var length = hexString.length / 2;
				buffer.writeUInt8(0xef);
				buffer.writeUInt8(length);
				buffer.writeHexString(hexString, length, true);
			}
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xee
	if ('all_configurations_request_by_device' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xee);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xcf
	if ('lorawan_configuration_settings' in payload) {
		var buffer = new Buffer();
		if (isValid(payload.lorawan_configuration_settings.mode)) {
			buffer.writeUInt8(0xcf);
			// 0:ClassA, 1:ClassB, 2:ClassC, 3:ClassC to B
			buffer.writeUInt8(0x00);
			// 0:ClassA, 1:ClassB, 2:ClassC, 3:ClassC to B
			buffer.writeUInt8(payload.lorawan_configuration_settings.mode);
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xdb
	if ('product_sn' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xdb);
		buffer.writeHexString(payload.product_sn, 8);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xd9
	if ('oem_id' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xd9);
		buffer.writeHexString(payload.oem_id, 2);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x00
	if ('battery' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x00);
		if (payload.battery < 0 || payload.battery > 100) {
			throw new Error('battery must be between 0 and 100');
		}
		buffer.writeUInt8(payload.battery);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x01
	if ('vaping_index' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x01);
		if (payload.vaping_index < 0 || payload.vaping_index > 100) {
			throw new Error('vaping_index must be between 0 and 100');
		}
		buffer.writeUInt8(payload.vaping_index);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x02
	if ('vaping_index_alarm' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x02);
		buffer.writeUInt8(payload.vaping_index_alarm.type);
		if (payload.vaping_index_alarm.type == 0x00) {
		}
		if (payload.vaping_index_alarm.type == 0x01) {
		}
		if (payload.vaping_index_alarm.type == 0x02) {
		}
		if (payload.vaping_index_alarm.type == 0x10) {
			if (payload.vaping_index_alarm.alarm_deactivation.vaping_index < 0 || payload.vaping_index_alarm.alarm_deactivation.vaping_index > 100) {
				throw new Error('vaping_index_alarm.alarm_deactivation.vaping_index must be between 0 and 100');
			}
			buffer.writeUInt8(payload.vaping_index_alarm.alarm_deactivation.vaping_index);
		}
		if (payload.vaping_index_alarm.type == 0x11) {
			if (payload.vaping_index_alarm.alarm_trigger.vaping_index < 0 || payload.vaping_index_alarm.alarm_trigger.vaping_index > 100) {
				throw new Error('vaping_index_alarm.alarm_trigger.vaping_index must be between 0 and 100');
			}
			buffer.writeUInt8(payload.vaping_index_alarm.alarm_trigger.vaping_index);
		}
		if (payload.vaping_index_alarm.type == 0x20) {
		}
		if (payload.vaping_index_alarm.type == 0x21) {
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x03
	if ('pm1_0' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x03);
		if (payload.pm1_0 < 0 || payload.pm1_0 > 1000) {
			throw new Error('pm1_0 must be between 0 and 1000');
		}
		buffer.writeUInt16LE(payload.pm1_0);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x04
	if ('pm1_0_alarm' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x04);
		buffer.writeUInt8(payload.pm1_0_alarm.type);
		if (payload.pm1_0_alarm.type == 0x00) {
		}
		if (payload.pm1_0_alarm.type == 0x01) {
		}
		if (payload.pm1_0_alarm.type == 0x02) {
		}
		if (payload.pm1_0_alarm.type == 0x10) {
			if (payload.pm1_0_alarm.alarm_deactivation.pm1_0 < 0 || payload.pm1_0_alarm.alarm_deactivation.pm1_0 > 1000) {
				throw new Error('pm1_0_alarm.alarm_deactivation.pm1_0 must be between 0 and 1000');
			}
			buffer.writeUInt16LE(payload.pm1_0_alarm.alarm_deactivation.pm1_0);
		}
		if (payload.pm1_0_alarm.type == 0x11) {
			if (payload.pm1_0_alarm.alarm_trigger.pm1_0 < 0 || payload.pm1_0_alarm.alarm_trigger.pm1_0 > 1000) {
				throw new Error('pm1_0_alarm.alarm_trigger.pm1_0 must be between 0 and 1000');
			}
			buffer.writeUInt16LE(payload.pm1_0_alarm.alarm_trigger.pm1_0);
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x05
	if ('pm2_5' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x05);
		if (payload.pm2_5 < 0 || payload.pm2_5 > 1000) {
			throw new Error('pm2_5 must be between 0 and 1000');
		}
		buffer.writeUInt16LE(payload.pm2_5);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x06
	if ('pm2_5_alarm' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x06);
		buffer.writeUInt8(payload.pm2_5_alarm.type);
		if (payload.pm2_5_alarm.type == 0x00) {
		}
		if (payload.pm2_5_alarm.type == 0x01) {
		}
		if (payload.pm2_5_alarm.type == 0x02) {
		}
		if (payload.pm2_5_alarm.type == 0x10) {
			if (payload.pm2_5_alarm.alarm_deactivation.pm2_5 < 0 || payload.pm2_5_alarm.alarm_deactivation.pm2_5 > 1000) {
				throw new Error('pm2_5_alarm.alarm_deactivation.pm2_5 must be between 0 and 1000');
			}
			buffer.writeUInt16LE(payload.pm2_5_alarm.alarm_deactivation.pm2_5);
		}
		if (payload.pm2_5_alarm.type == 0x11) {
			if (payload.pm2_5_alarm.alarm_trigger.pm2_5 < 0 || payload.pm2_5_alarm.alarm_trigger.pm2_5 > 1000) {
				throw new Error('pm2_5_alarm.alarm_trigger.pm2_5 must be between 0 and 1000');
			}
			buffer.writeUInt16LE(payload.pm2_5_alarm.alarm_trigger.pm2_5);
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x07
	if ('pm10' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x07);
		if (payload.pm10 < 0 || payload.pm10 > 1000) {
			throw new Error('pm10 must be between 0 and 1000');
		}
		buffer.writeUInt16LE(payload.pm10);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x08
	if ('pm10_alarm' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x08);
		buffer.writeUInt8(payload.pm10_alarm.type);
		if (payload.pm10_alarm.type == 0x00) {
		}
		if (payload.pm10_alarm.type == 0x01) {
		}
		if (payload.pm10_alarm.type == 0x02) {
		}
		if (payload.pm10_alarm.type == 0x10) {
			if (payload.pm10_alarm.alarm_deactivation.pm10 < 0 || payload.pm10_alarm.alarm_deactivation.pm10 > 1000) {
				throw new Error('pm10_alarm.alarm_deactivation.pm10 must be between 0 and 1000');
			}
			buffer.writeUInt16LE(payload.pm10_alarm.alarm_deactivation.pm10);
		}
		if (payload.pm10_alarm.type == 0x11) {
			if (payload.pm10_alarm.alarm_trigger.pm10 < 0 || payload.pm10_alarm.alarm_trigger.pm10 > 1000) {
				throw new Error('pm10_alarm.alarm_trigger.pm10 must be between 0 and 1000');
			}
			buffer.writeUInt16LE(payload.pm10_alarm.alarm_trigger.pm10);
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x09
	if ('temperature' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x09);
		if (payload.temperature < -20 || payload.temperature > 60) {
			throw new Error('temperature must be between -20 and 60');
		}
		buffer.writeInt16LE(payload.temperature * 10);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x0a
	if ('temperature_alarm' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x0a);
		buffer.writeUInt8(payload.temperature_alarm.type);
		if (payload.temperature_alarm.type == 0x00) {
		}
		if (payload.temperature_alarm.type == 0x01) {
		}
		if (payload.temperature_alarm.type == 0x02) {
		}
		if (payload.temperature_alarm.type == 0x10) {
			if (payload.temperature_alarm.alarm_deactivation.temperature < -20 || payload.temperature_alarm.alarm_deactivation.temperature > 60) {
				throw new Error('temperature_alarm.alarm_deactivation.temperature must be between -20 and 60');
			}
			buffer.writeInt16LE(payload.temperature_alarm.alarm_deactivation.temperature * 10);
		}
		if (payload.temperature_alarm.type == 0x11) {
			if (payload.temperature_alarm.alarm_trigger.temperature < -20 || payload.temperature_alarm.alarm_trigger.temperature > 60) {
				throw new Error('temperature_alarm.alarm_trigger.temperature must be between -20 and 60');
			}
			buffer.writeInt16LE(payload.temperature_alarm.alarm_trigger.temperature * 10);
		}
		if (payload.temperature_alarm.type == 0x20) {
		}
		if (payload.temperature_alarm.type == 0x21) {
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x0b
	if ('humidity' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x0b);
		if (payload.humidity < 0 || payload.humidity > 100) {
			throw new Error('humidity must be between 0 and 100');
		}
		buffer.writeUInt16LE(payload.humidity * 10);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x0c
	if ('humidity_alarm' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x0c);
		buffer.writeUInt8(payload.humidity_alarm.type);
		if (payload.humidity_alarm.type == 0x00) {
		}
		if (payload.humidity_alarm.type == 0x01) {
		}
		if (payload.humidity_alarm.type == 0x02) {
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x0d
	if ('tvoc' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x0d);
		if (payload.tvoc < 0 || payload.tvoc > 2000) {
			throw new Error('tvoc must be between 0 and 2000');
		}
		buffer.writeUInt16LE(payload.tvoc);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x0e
	if ('tvoc_alarm' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x0e);
		buffer.writeUInt8(payload.tvoc_alarm.type);
		if (payload.tvoc_alarm.type == 0x00) {
		}
		if (payload.tvoc_alarm.type == 0x01) {
		}
		if (payload.tvoc_alarm.type == 0x02) {
		}
		if (payload.tvoc_alarm.type == 0x10) {
			if (payload.tvoc_alarm.alarm_deactivation.tvoc < 0 || payload.tvoc_alarm.alarm_deactivation.tvoc > 2000) {
				throw new Error('tvoc_alarm.alarm_deactivation.tvoc must be between 0 and 2000');
			}
			buffer.writeUInt16LE(payload.tvoc_alarm.alarm_deactivation.tvoc);
		}
		if (payload.tvoc_alarm.type == 0x11) {
			if (payload.tvoc_alarm.alarm_trigger.tvoc < 0 || payload.tvoc_alarm.alarm_trigger.tvoc > 2000) {
				throw new Error('tvoc_alarm.alarm_trigger.tvoc must be between 0 and 2000');
			}
			buffer.writeUInt16LE(payload.tvoc_alarm.alarm_trigger.tvoc);
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x0f
	if ('tamper_status' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x0f);
		// 0：Normal, 1：Triggered
		buffer.writeUInt8(payload.tamper_status);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x10
	if ('tamper_status_alarm' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x10);
		buffer.writeUInt8(payload.tamper_status_alarm.type);
		if (payload.tamper_status_alarm.type == 0x20) {
		}
		if (payload.tamper_status_alarm.type == 0x21) {
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x11
	if ('buzzer' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x11);
		// 0：Normal, 1：Triggered
		buffer.writeUInt8(payload.buzzer);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x12
	if ('occupancy_status' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x12);
		// 0：vacant, 1：occuppied
		buffer.writeUInt8(payload.occupancy_status);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x20
	if ('tvoc_raw_data_1' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x20);
		buffer.writeFloatLE(payload.tvoc_raw_data_1.rmox_0);
		buffer.writeFloatLE(payload.tvoc_raw_data_1.rmox_1);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x21
	if ('tvoc_raw_data_2' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x21);
		buffer.writeFloatLE(payload.tvoc_raw_data_2.rmox_2);
		buffer.writeFloatLE(payload.tvoc_raw_data_2.rmox_3);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x22
	if ('tvoc_raw_data_3' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x22);
		buffer.writeFloatLE(payload.tvoc_raw_data_3.rmox_4);
		buffer.writeFloatLE(payload.tvoc_raw_data_3.rmox_5);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x23
	if ('tvoc_raw_data_4' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x23);
		buffer.writeFloatLE(payload.tvoc_raw_data_4.rmox_6);
		buffer.writeFloatLE(payload.tvoc_raw_data_4.rmox_7);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x24
	if ('tvoc_raw_data_5' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x24);
		buffer.writeFloatLE(payload.tvoc_raw_data_5.rmox_8);
		buffer.writeFloatLE(payload.tvoc_raw_data_5.rmox_9);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x25
	if ('tvoc_raw_data_6' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x25);
		buffer.writeFloatLE(payload.tvoc_raw_data_6.rmox_10);
		buffer.writeFloatLE(payload.tvoc_raw_data_6.rmox_11);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x26
	if ('tvoc_raw_data_7' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x26);
		buffer.writeFloatLE(payload.tvoc_raw_data_7.rmox_12);
		buffer.writeFloatLE(payload.tvoc_raw_data_7.zmod4510_rmox_3);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x27
	if ('tvoc_raw_data_8' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x27);
		buffer.writeFloatLE(payload.tvoc_raw_data_8.log_rcda);
		buffer.writeFloatLE(payload.tvoc_raw_data_8.rhtr);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x28
	if ('tvoc_raw_data_9' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x28);
		buffer.writeFloatLE(payload.tvoc_raw_data_9.temperature);
		buffer.writeFloatLE(payload.tvoc_raw_data_9.iaq);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x29
	if ('tvoc_raw_data_10' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x29);
		buffer.writeFloatLE(payload.tvoc_raw_data_10.tvoc);
		buffer.writeFloatLE(payload.tvoc_raw_data_10.etoh);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x2a
	if ('tvoc_raw_data_11' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x2a);
		buffer.writeFloatLE(payload.tvoc_raw_data_11.eco2);
		buffer.writeFloatLE(payload.tvoc_raw_data_11.rel_iaq);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x2b
	if ('pm_sensor_working_time' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x2b);
		buffer.writeUInt32LE(payload.pm_sensor_working_time);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xc9
	if ('random_key' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xc9);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.random_key);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xc8
	if ('device_status' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xc8);
		// 0：Off, 1：On
		buffer.writeUInt8(payload.device_status);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x60
	if ('reporting_interval' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x60);
		// 0：second, 1：min
		buffer.writeUInt8(payload.reporting_interval.unit);
		if (payload.reporting_interval.unit == 0x00) {
			if (payload.reporting_interval.seconds_of_time < 10 || payload.reporting_interval.seconds_of_time > 64800) {
				throw new Error('reporting_interval.seconds_of_time must be between 10 and 64800');
			}
			buffer.writeUInt16LE(payload.reporting_interval.seconds_of_time);
		}
		if (payload.reporting_interval.unit == 0x01) {
			if (payload.reporting_interval.minutes_of_time < 1 || payload.reporting_interval.minutes_of_time > 1440) {
				throw new Error('reporting_interval.minutes_of_time must be between 1 and 1440');
			}
			buffer.writeUInt16LE(payload.reporting_interval.minutes_of_time);
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x61
	if ('temperature_unit' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x61);
		// 0：℃, 1：℉
		buffer.writeUInt8(payload.temperature_unit);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x67
	if ('tamper_alarm_enable' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x67);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.tamper_alarm_enable);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x62
	if ('led_status' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x62);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.led_status);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x63
	if ('buzzer_enable' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x63);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.buzzer_enable);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x64
	if ('buzzer_sleep' in payload) {
		var buffer = new Buffer();
		if (isValid(payload.buzzer_sleep.item_1)) {
			buffer.writeUInt8(0x64);
			buffer.writeUInt8(0x01);
			// 0：disable, 1：enable
			buffer.writeUInt8(payload.buzzer_sleep.item_1.enable);
			if (payload.buzzer_sleep.item_1.start_time < 0 || payload.buzzer_sleep.item_1.start_time > 1439) {
				throw new Error('buzzer_sleep.item_1.start_time must be between 0 and 1439');
			}
			buffer.writeUInt16LE(payload.buzzer_sleep.item_1.start_time);
			if (payload.buzzer_sleep.item_1.end_time < 0 || payload.buzzer_sleep.item_1.end_time > 1439) {
				throw new Error('buzzer_sleep.item_1.end_time must be between 0 and 1439');
			}
			buffer.writeUInt16LE(payload.buzzer_sleep.item_1.end_time);
		}
		if (isValid(payload.buzzer_sleep.item_2)) {
			buffer.writeUInt8(0x64);
			buffer.writeUInt8(0x02);
			// 0：disable, 1：enable
			buffer.writeUInt8(payload.buzzer_sleep.item_2.enable);
			if (payload.buzzer_sleep.item_2.start_time < 0 || payload.buzzer_sleep.item_2.start_time > 1439) {
				throw new Error('buzzer_sleep.item_2.start_time must be between 0 and 1439');
			}
			buffer.writeUInt16LE(payload.buzzer_sleep.item_2.start_time);
			if (payload.buzzer_sleep.item_2.end_time < 0 || payload.buzzer_sleep.item_2.end_time > 1439) {
				throw new Error('buzzer_sleep.item_2.end_time must be between 0 and 1439');
			}
			buffer.writeUInt16LE(payload.buzzer_sleep.item_2.end_time);
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x65
	if ('buzzer_button_stop_enable' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x65);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.buzzer_button_stop_enable);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x66
	if ('buzzer_silent_time' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x66);
		if (payload.buzzer_silent_time < 0 || payload.buzzer_silent_time > 1440) {
			throw new Error('buzzer_silent_time must be between 0 and 1440');
		}
		buffer.writeUInt16LE(payload.buzzer_silent_time);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xc7
	if ('time_zone' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xc7);
		buffer.writeInt16LE(payload.time_zone);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xc6
	if ('daylight_saving_time' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xc6);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.daylight_saving_time.enable);
		if (payload.daylight_saving_time.daylight_saving_time_offset < 0 || payload.daylight_saving_time.daylight_saving_time_offset > 120) {
			throw new Error('daylight_saving_time.daylight_saving_time_offset must be between 0 and 120');
		}
		buffer.writeUInt8(payload.daylight_saving_time.daylight_saving_time_offset);
		// 1:Jan., 2:Feb., 3:Mar., 4:Apr., 5:May, 6:Jun., 7:Jul., 8:Aug., 9:Sep., 10:Oct., 11:Nov., 12:Dec.
		buffer.writeUInt8(payload.daylight_saving_time.start_month);
		var bitOptions = 0;
		// 1:1st, 2: 2nd, 3: 3rd, 4: 4th, 5: last
		bitOptions |= payload.daylight_saving_time.start_week_num << 4;

		// 1：Mon., 2：Tues., 3：Wed., 4：Thurs., 5：Fri., 6：Sat., 7：Sun.
		bitOptions |= payload.daylight_saving_time.start_week_day << 0;
		buffer.writeUInt8(bitOptions);

		buffer.writeUInt16LE(payload.daylight_saving_time.start_hour_min);
		// 1:Jan., 2:Feb., 3:Mar., 4:Apr., 5:May, 6:Jun., 7:Jul., 8:Aug., 9:Sep., 10:Oct., 11:Nov., 12:Dec.
		buffer.writeUInt8(payload.daylight_saving_time.end_month);
		var bitOptions = 0;
		// 1:1st, 2: 2nd, 3: 3rd, 4: 4th, 5: last
		bitOptions |= payload.daylight_saving_time.end_week_num << 4;

		// 1：Mon., 2：Tues., 3：Wed., 4：Thurs., 5：Fri., 6：Sat., 7：Sun.
		bitOptions |= payload.daylight_saving_time.end_week_day << 0;
		buffer.writeUInt8(bitOptions);

		buffer.writeUInt16LE(payload.daylight_saving_time.end_hour_min);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x68
	if ('tvoc_raw_reporting_enable' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x68);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.tvoc_raw_reporting_enable);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x69
	if ('temperature_alarm_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x69);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.temperature_alarm_settings.enable);
		// 0:disable, 1:condition: x<A, 2:condition: x>B, 3:condition: A<x<B, 4:condition: x<A or x>B
		buffer.writeUInt8(payload.temperature_alarm_settings.threshold_condition);
		if (payload.temperature_alarm_settings.threshold_min < -20 || payload.temperature_alarm_settings.threshold_min > 60) {
			throw new Error('temperature_alarm_settings.threshold_min must be between -20 and 60');
		}
		buffer.writeInt16LE(payload.temperature_alarm_settings.threshold_min * 10);
		if (payload.temperature_alarm_settings.threshold_max < -20 || payload.temperature_alarm_settings.threshold_max > 60) {
			throw new Error('temperature_alarm_settings.threshold_max must be between -20 and 60');
		}
		buffer.writeInt16LE(payload.temperature_alarm_settings.threshold_max * 10);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x6a
	if ('pm1_0_alarm_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x6a);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.pm1_0_alarm_settings.enable);
		// 0:disable, 1:condition: x<A, 2:condition: x>B, 3:condition: A<x<B, 4:condition: x<A or x>B
		buffer.writeUInt8(payload.pm1_0_alarm_settings.threshold_condition);
		if (payload.pm1_0_alarm_settings.threshold_min < 0 || payload.pm1_0_alarm_settings.threshold_min > 1000) {
			throw new Error('pm1_0_alarm_settings.threshold_min must be between 0 and 1000');
		}
		buffer.writeInt16LE(payload.pm1_0_alarm_settings.threshold_min);
		if (payload.pm1_0_alarm_settings.threshold_max < 0 || payload.pm1_0_alarm_settings.threshold_max > 1000) {
			throw new Error('pm1_0_alarm_settings.threshold_max must be between 0 and 1000');
		}
		buffer.writeInt16LE(payload.pm1_0_alarm_settings.threshold_max);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x6b
	if ('pm2_5_alarm_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x6b);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.pm2_5_alarm_settings.enable);
		// 0:disable, 1:condition: x<A, 2:condition: x>B, 3:condition: A<x<B, 4:condition: x<A or x>B
		buffer.writeUInt8(payload.pm2_5_alarm_settings.threshold_condition);
		if (payload.pm2_5_alarm_settings.threshold_min < 0 || payload.pm2_5_alarm_settings.threshold_min > 1000) {
			throw new Error('pm2_5_alarm_settings.threshold_min must be between 0 and 1000');
		}
		buffer.writeInt16LE(payload.pm2_5_alarm_settings.threshold_min);
		if (payload.pm2_5_alarm_settings.threshold_max < 0 || payload.pm2_5_alarm_settings.threshold_max > 1000) {
			throw new Error('pm2_5_alarm_settings.threshold_max must be between 0 and 1000');
		}
		buffer.writeInt16LE(payload.pm2_5_alarm_settings.threshold_max);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x6c
	if ('pm10_alarm_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x6c);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.pm10_alarm_settings.enable);
		// 0:disable, 1:condition: x<A, 2:condition: x>B, 3:condition: A<x<B, 4:condition: x<A or x>B
		buffer.writeUInt8(payload.pm10_alarm_settings.threshold_condition);
		if (payload.pm10_alarm_settings.threshold_min < 0 || payload.pm10_alarm_settings.threshold_min > 1000) {
			throw new Error('pm10_alarm_settings.threshold_min must be between 0 and 1000');
		}
		buffer.writeInt16LE(payload.pm10_alarm_settings.threshold_min);
		if (payload.pm10_alarm_settings.threshold_max < 0 || payload.pm10_alarm_settings.threshold_max > 1000) {
			throw new Error('pm10_alarm_settings.threshold_max must be between 0 and 1000');
		}
		buffer.writeInt16LE(payload.pm10_alarm_settings.threshold_max);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x6d
	if ('tvoc_alarm_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x6d);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.tvoc_alarm_settings.enable);
		// 0:disable, 1:condition: x<A, 2:condition: x>B, 3:condition: A<x<B, 4:condition: x<A or x>B
		buffer.writeUInt8(payload.tvoc_alarm_settings.threshold_condition);
		if (payload.tvoc_alarm_settings.threshold_min < 0 || payload.tvoc_alarm_settings.threshold_min > 2000) {
			throw new Error('tvoc_alarm_settings.threshold_min must be between 0 and 2000');
		}
		buffer.writeInt16LE(payload.tvoc_alarm_settings.threshold_min);
		if (payload.tvoc_alarm_settings.threshold_max < 0 || payload.tvoc_alarm_settings.threshold_max > 2000) {
			throw new Error('tvoc_alarm_settings.threshold_max must be between 0 and 2000');
		}
		buffer.writeInt16LE(payload.tvoc_alarm_settings.threshold_max);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x6e
	if ('vaping_index_alarm_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x6e);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.vaping_index_alarm_settings.enable);
		// 0:disable, 1:condition: x<A, 2:condition: x>B, 3:condition: A<x<B, 4:condition: x<A or x>B
		buffer.writeUInt8(payload.vaping_index_alarm_settings.threshold_condition);
		if (payload.vaping_index_alarm_settings.threshold_min < 0 || payload.vaping_index_alarm_settings.threshold_min > 100) {
			throw new Error('vaping_index_alarm_settings.threshold_min must be between 0 and 100');
		}
		buffer.writeUInt8(payload.vaping_index_alarm_settings.threshold_min);
		if (payload.vaping_index_alarm_settings.threshold_max < 0 || payload.vaping_index_alarm_settings.threshold_max > 100) {
			throw new Error('vaping_index_alarm_settings.threshold_max must be between 0 and 100');
		}
		buffer.writeUInt8(payload.vaping_index_alarm_settings.threshold_max);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x6f
	if ('alarm_reporting_times' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x6f);
		if (payload.alarm_reporting_times < 1 || payload.alarm_reporting_times > 1000) {
			throw new Error('alarm_reporting_times must be between 1 and 1000');
		}
		buffer.writeUInt16LE(payload.alarm_reporting_times);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x70
	if ('alarm_deactivation_enable' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x70);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.alarm_deactivation_enable);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x71
	if ('temperature_calibration_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x71);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.temperature_calibration_settings.enable);
		if (payload.temperature_calibration_settings.calibration_value < -80 || payload.temperature_calibration_settings.calibration_value > 80) {
			throw new Error('temperature_calibration_settings.calibration_value must be between -80 and 80');
		}
		buffer.writeInt16LE(payload.temperature_calibration_settings.calibration_value * 10);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x72
	if ('humidity_calibration_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x72);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.humidity_calibration_settings.enable);
		if (payload.humidity_calibration_settings.calibration_value < -100 || payload.humidity_calibration_settings.calibration_value > 100) {
			throw new Error('humidity_calibration_settings.calibration_value must be between -100 and 100');
		}
		buffer.writeInt16LE(payload.humidity_calibration_settings.calibration_value * 10);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x73
	if ('pm1_0_calibration_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x73);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.pm1_0_calibration_settings.enable);
		if (payload.pm1_0_calibration_settings.calibration_value < -1000 || payload.pm1_0_calibration_settings.calibration_value > 1000) {
			throw new Error('pm1_0_calibration_settings.calibration_value must be between -1000 and 1000');
		}
		buffer.writeInt16LE(payload.pm1_0_calibration_settings.calibration_value);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x74
	if ('pm2_5_calibration_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x74);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.pm2_5_calibration_settings.enable);
		if (payload.pm2_5_calibration_settings.calibration_value < -1000 || payload.pm2_5_calibration_settings.calibration_value > 1000) {
			throw new Error('pm2_5_calibration_settings.calibration_value must be between -1000 and 1000');
		}
		buffer.writeInt16LE(payload.pm2_5_calibration_settings.calibration_value);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x75
	if ('pm10_calibration_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x75);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.pm10_calibration_settings.enable);
		if (payload.pm10_calibration_settings.calibration_value < -1000 || payload.pm10_calibration_settings.calibration_value > 1000) {
			throw new Error('pm10_calibration_settings.calibration_value must be between -1000 and 1000');
		}
		buffer.writeInt16LE(payload.pm10_calibration_settings.calibration_value);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x76
	if ('tvoc_calibration_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x76);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.tvoc_calibration_settings.enable);
		if (payload.tvoc_calibration_settings.calibration_value < -2000 || payload.tvoc_calibration_settings.calibration_value > 2000) {
			throw new Error('tvoc_calibration_settings.calibration_value must be between -2000 and 2000');
		}
		buffer.writeInt16LE(payload.tvoc_calibration_settings.calibration_value);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x77
	if ('vaping_index_calibration_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x77);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.vaping_index_calibration_settings.enable);
		if (payload.vaping_index_calibration_settings.calibration_value < -100 || payload.vaping_index_calibration_settings.calibration_value > 100) {
			throw new Error('vaping_index_calibration_settings.calibration_value must be between -100 and 100');
		}
		buffer.writeInt8(payload.vaping_index_calibration_settings.calibration_value);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xbf
	if ('reset' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xbf);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xbe
	if ('reboot' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xbe);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xbd
	if ('clear_historical_data' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xbd);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xbc
	if ('stop_historical_data_retrieval' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xbc);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xbb
	if ('retrieve_historical_data_by_time' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xbb);
		buffer.writeUInt32LE(payload.retrieve_historical_data_by_time.time);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xba
	if ('retrieve_historical_data_by_time_range' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xba);
		buffer.writeUInt32LE(payload.retrieve_historical_data_by_time_range.start_time);
		buffer.writeUInt32LE(payload.retrieve_historical_data_by_time_range.end_time);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xb9
	if ('query_device_status' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xb9);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xb8
	if ('synchronize_time' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xb8);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xb7
	if ('set_time' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xb7);
		buffer.writeUInt32LE(payload.set_time.timestamp);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xb6
	if ('reconnect' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xb6);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x5f
	if ('stop_buzzer_alarm' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x5f);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x5e
	if ('execute_tvoc_self_clean' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x5e);
		encoded = encoded.concat(buffer.toBytes());
	}
	return encoded;
}

function Buffer() {
	this.buffer = new Array();
}

Buffer.prototype._write = function(value, byteLength, isLittleEndian) {
	value = Math.round(value);
	var offset = 0;
	for (var index = 0; index < byteLength; index++) {
		offset = isLittleEndian ? index << 3 : (byteLength - 1 - index) << 3;
		this.buffer.push((value >> offset) & 0xff);
	}
};

Buffer.prototype.writeUInt8 = function(value) {
	this._write(value, 1, true);
};

Buffer.prototype.writeInt8 = function(value) {
	this._write(value < 0 ? value + 0x100 : value, 1, true);
};

Buffer.prototype.writeUInt16LE = function(value) {
	this._write(value, 2, true);
};

Buffer.prototype.writeInt16LE = function(value) {
	this._write(value < 0 ? value + 0x10000 : value, 2, true);
};

Buffer.prototype.writeUInt24LE = function(value) {
	this._write(value, 3, true);
};

Buffer.prototype.writeInt24LE = function(value) {
	this._write(value < 0 ? value + 0x1000000 : value, 3, true);
};

Buffer.prototype.writeUInt32LE = function(value) {
	this._write(value, 4, true);
};

Buffer.prototype.writeInt32LE = function(value) {
	this._write(value < 0 ? value + 0x100000000 : value, 4, true);
};

Buffer.prototype.writeFloatLE = function(value) {
	var sign = (value < 0 || (value === 0 && 1 / value === -Infinity)) ? 1 : 0;
	var absValue = Math.abs(value);

	if (absValue === 0) {
		this._write(sign ? 0x80000000 : 0, 4, true);
		return;
	} else if (value !== value) {
		this._write(0x7fc00000, 4, true);
		return;
	} else if (absValue === Infinity) {
		this._write((((sign << 31) >>> 0) | 0x7f800000) >>> 0, 4, true);
		return;
	}

	var exponent = Math.floor(Math.log(absValue) / Math.LN2);
	var normalized = absValue / Math.pow(2, exponent);
	if (normalized < 1) {
		exponent -= 1;
		normalized *= 2;
	} else if (normalized >= 2) {
		exponent += 1;
		normalized /= 2;
	}

	var biasedExponent = exponent + 127;
	var mantissaBits = 0;
	if (biasedExponent <= 0) {
		biasedExponent = 0;
		mantissaBits = Math.round(absValue / Math.pow(2, -149));
		if (mantissaBits > 0x7fffff) {
			mantissaBits = 0x7fffff;
		}
	} else {
		mantissaBits = Math.round((normalized - 1) * 0x800000);
		if (mantissaBits === 0x800000) {
			biasedExponent += 1;
			mantissaBits = 0;
		}
		if (biasedExponent >= 0xff) {
			this._write((((sign << 31) >>> 0) | 0x7f800000) >>> 0, 4, true);
			return;
		}
	}

	var floatBits = ((((sign << 31) >>> 0) | ((biasedExponent & 0xff) << 23) | (mantissaBits & 0x7fffff)) >>> 0);
	this._write(floatBits, 4, true);
};

Buffer.prototype.writeBytes = function(bytes, length, mustEqual) {
	if (mustEqual === undefined) mustEqual = false;
	if (length < bytes.length) {
		throw new Error('bytes length is greater than length');
	}
	if (mustEqual && bytes.length != length) {
		throw new Error('bytes length is not equal to length');
	}

	for (var i = 0; i < bytes.length; i++) {
		this.buffer.push(bytes[i]);
	}

	if (length > bytes.length) {
		for (var i = bytes.length; i < length; i++) {
			this.buffer.push(0);
		}
	}
};

Buffer.prototype.writeHexString = function(hexString, length, mustEqual) {
	if (mustEqual === undefined) mustEqual = false;
	var bytes = [];
	for (var i = 0; i < hexString.length; i += 2) {
		bytes.push(parseInt(hexString.substr(i, 2), 16));
	}
	if (mustEqual && bytes.length != length) {
		throw new Error('hex string length is not equal to length');
	}
	this.writeBytes(bytes, length);
};

Buffer.prototype.writeString = function(str, length, mustEqual) {
	if (mustEqual === undefined) mustEqual = false;
	var bytes = encodeUtf8(str);
	if (mustEqual && bytes.length != length) {
		throw new Error('string length is not equal to length');
	}
	this.writeBytes(bytes, length);
};

Buffer.prototype.writeUnknownDataType = function(val) {
	throw new Error('Unknown data type encountered. Please Contact Developer.');
};

Buffer.prototype.writeHexStringReverse = function(hexString, length, mustEqual) {
	if (mustEqual === undefined) mustEqual = false;
	var bytes = [];
	for (var i = hexString.length - 2; i >= 0; i -= 2) {
		bytes.push(parseInt(hexString.substr(i, 2), 16));
	}
	if (mustEqual && bytes.length != length) {
		throw new Error('hex string length is not equal to length');
	}
	this.writeBytes(bytes, length);
};

Buffer.prototype.toBytes = function() {
	return this.buffer;
};

function encodeUtf8(str) {
	var byteArray = [];
	for (var i = 0; i < str.length; i++) {
		var charCode = str.charCodeAt(i);
		if (charCode < 0x80) {
			byteArray.push(charCode);
		} else if (charCode < 0x800) {
			byteArray.push(0xc0 | (charCode >> 6));
			byteArray.push(0x80 | (charCode & 0x3f));
		} else if (charCode < 0x10000) {
			byteArray.push(0xe0 | (charCode >> 12));
			byteArray.push(0x80 | ((charCode >> 6) & 0x3f));
			byteArray.push(0x80 | (charCode & 0x3f));
		} else if (charCode < 0x200000) {
			byteArray.push(0xf0 | (charCode >> 18));
			byteArray.push(0x80 | ((charCode >> 12) & 0x3f));
			byteArray.push(0x80 | ((charCode >> 6) & 0x3f));
			byteArray.push(0x80 | (charCode & 0x3f));
		}
	}
	return byteArray;
}

function isValid(value) {
	return value !== undefined && value !== null && value !== '';
}

function hasPath(obj, path) {
	var parts = path.split('.');
	var current = obj;

	for (var i = 0; i < parts.length; i++) {
		if (!current || !(parts[i] in current)) {
			return false;
		}
		current = current[parts[i]];
	}

	return true;
}

function getPath(obj, path) {
	var parts = path.split('.');
	var current = obj;

	for (var i = 0; i < parts.length; i++) {
		var key = parts[i];

		if (!current || !(key in current)) {
			return null;
		}

		current = current[key];
	}

	return current;
}


function setPath(obj, path, value) {
	var parts = path.split('.');
	var current = obj;

	for (var i = 0; i < parts.length - 1; i++) {
		var key = parts[i];

		if (!(key in current) || typeof current[key] !== 'object') {
			current[key] = {};
		}

		current = current[key];
	}

	current[parts[parts.length - 1]] = value;
	return obj;
}

function convertName(propertyId, prefix) {
	var parts = propertyId.split('.');
	var lastPart = parts[parts.length - 1];
	parts[parts.length - 1] = prefix + '_' + lastPart;
	return parts.join('.');
}

function recoverName(propertyId, prefix) {
	var parts = propertyId.split('.');
	var lastPart = parts[parts.length - 1];
	parts[parts.length - 1] = lastPart.replace(prefix + '_', '');
	return parts.join('.');
}

function getAllLeafPaths(obj, prefix) {
    var paths = [];

    function recurse(current, path) {
      if (Array.isArray(current)) {
        current.forEach(function (item, index) {
          var newPath = path ? (path + "." + index) : String(index);
          recurse(item, newPath);
        });

      } else if (typeof current === 'object' && current !== null) {
        for (var key in current) {
          if (Object.prototype.hasOwnProperty.call(current, key)) {
            var newPath = path ? (path + "." + key) : key;
            recurse(current[key], newPath);
          }
        }

      } else {
        paths.push(path);
      }
    }

    recurse(obj, "");
    return paths;
}

function isInteger(str) {
    return typeof str === 'string' && /^[0-9]+$/.test(str);
}

function cmdMap() {
	return {
		  "request_check_order": "fe",
		  "request_full_inspection": "f4",
		  "request_full_inspection.start_inspection": "f400",
		  "request_full_inspection.control": "f401",
		  "request_full_inspection.reading": "f402",
		  "request_full_inspection.end_inspection": "f403",
		  "request_command_queries": "ef",
		  "all_configurations_request_by_device": "ee",
		  "lorawan_configuration_settings": "cf",
		  "lorawan_configuration_settings.mode": "cf00",
		  "tsl_version": "df",
		  "product_sn": "db",
		  "version": "da",
		  "oem_id": "d9",
		  "battery": "00",
		  "vaping_index": "01",
		  "vaping_index_alarm": "02",
		  "vaping_index_alarm.collection_error": "0200",
		  "vaping_index_alarm.lower_range_error": "0201",
		  "vaping_index_alarm.over_range_error": "0202",
		  "vaping_index_alarm.alarm_deactivation": "0210",
		  "vaping_index_alarm.alarm_trigger": "0211",
		  "vaping_index_alarm.interference_alarm_deactivation": "0220",
		  "vaping_index_alarm.interference_alarm_trigger": "0221",
		  "pm1_0": "03",
		  "pm1_0_alarm": "04",
		  "pm1_0_alarm.collection_error": "0400",
		  "pm1_0_alarm.lower_range_error": "0401",
		  "pm1_0_alarm.over_range_error": "0402",
		  "pm1_0_alarm.alarm_deactivation": "0410",
		  "pm1_0_alarm.alarm_trigger": "0411",
		  "pm2_5": "05",
		  "pm2_5_alarm": "06",
		  "pm2_5_alarm.collection_error": "0600",
		  "pm2_5_alarm.lower_range_error": "0601",
		  "pm2_5_alarm.over_range_error": "0602",
		  "pm2_5_alarm.alarm_deactivation": "0610",
		  "pm2_5_alarm.alarm_trigger": "0611",
		  "pm10": "07",
		  "pm10_alarm": "08",
		  "pm10_alarm.collection_error": "0800",
		  "pm10_alarm.lower_range_error": "0801",
		  "pm10_alarm.over_range_error": "0802",
		  "pm10_alarm.alarm_deactivation": "0810",
		  "pm10_alarm.alarm_trigger": "0811",
		  "temperature": "09",
		  "temperature_alarm": "0a",
		  "temperature_alarm.collection_error": "0a00",
		  "temperature_alarm.lower_range_error": "0a01",
		  "temperature_alarm.over_range_error": "0a02",
		  "temperature_alarm.alarm_deactivation": "0a10",
		  "temperature_alarm.alarm_trigger": "0a11",
		  "temperature_alarm.burning_alarm_deactivation": "0a20",
		  "temperature_alarm.burning_alarm_trigger": "0a21",
		  "humidity": "0b",
		  "humidity_alarm": "0c",
		  "humidity_alarm.collection_error": "0c00",
		  "humidity_alarm.lower_range_error": "0c01",
		  "humidity_alarm.over_range_error": "0c02",
		  "tvoc": "0d",
		  "tvoc_alarm": "0e",
		  "tvoc_alarm.collection_error": "0e00",
		  "tvoc_alarm.lower_range_error": "0e01",
		  "tvoc_alarm.over_range_error": "0e02",
		  "tvoc_alarm.alarm_deactivation": "0e10",
		  "tvoc_alarm.alarm_trigger": "0e11",
		  "tamper_status": "0f",
		  "tamper_status_alarm": "10",
		  "tamper_status_alarm.normal": "1020",
		  "tamper_status_alarm.trigger": "1021",
		  "buzzer": "11",
		  "occupancy_status": "12",
		  "tvoc_raw_data_1": "20",
		  "tvoc_raw_data_2": "21",
		  "tvoc_raw_data_3": "22",
		  "tvoc_raw_data_4": "23",
		  "tvoc_raw_data_5": "24",
		  "tvoc_raw_data_6": "25",
		  "tvoc_raw_data_7": "26",
		  "tvoc_raw_data_8": "27",
		  "tvoc_raw_data_9": "28",
		  "tvoc_raw_data_10": "29",
		  "tvoc_raw_data_11": "2a",
		  "pm_sensor_working_time": "2b",
		  "random_key": "c9",
		  "device_status": "c8",
		  "reporting_interval": "60",
		  "reporting_interval.seconds_of_time": "6000",
		  "reporting_interval.minutes_of_time": "6001",
		  "temperature_unit": "61",
		  "tamper_alarm_enable": "67",
		  "led_status": "62",
		  "buzzer_enable": "63",
		  "buzzer_sleep": "64",
		  "buzzer_sleep.item_1": "6401",
		  "buzzer_sleep.item_2": "6402",
		  "buzzer_button_stop_enable": "65",
		  "buzzer_silent_time": "66",
		  "time_zone": "c7",
		  "daylight_saving_time": "c6",
		  "tvoc_raw_reporting_enable": "68",
		  "temperature_alarm_settings": "69",
		  "pm1_0_alarm_settings": "6a",
		  "pm2_5_alarm_settings": "6b",
		  "pm10_alarm_settings": "6c",
		  "tvoc_alarm_settings": "6d",
		  "vaping_index_alarm_settings": "6e",
		  "alarm_reporting_times": "6f",
		  "alarm_deactivation_enable": "70",
		  "temperature_calibration_settings": "71",
		  "humidity_calibration_settings": "72",
		  "pm1_0_calibration_settings": "73",
		  "pm2_5_calibration_settings": "74",
		  "pm10_calibration_settings": "75",
		  "tvoc_calibration_settings": "76",
		  "vaping_index_calibration_settings": "77",
		  "reset": "bf",
		  "reboot": "be",
		  "clear_historical_data": "bd",
		  "stop_historical_data_retrieval": "bc",
		  "retrieve_historical_data_by_time": "bb",
		  "retrieve_historical_data_by_time_range": "ba",
		  "query_device_status": "b9",
		  "synchronize_time": "b8",
		  "set_time": "b7",
		  "reconnect": "b6",
		  "stop_buzzer_alarm": "5f",
		  "execute_tvoc_self_clean": "5e"
	};
}
function processTemperature(payload) {
	var allTemperatureProperties = {
    "temperature": {
        "coefficient": 0.1
    },
    "temperature_alarm.alarm_deactivation.temperature": {
        "coefficient": 0.1
    },
    "temperature_alarm.alarm_trigger.temperature": {
        "coefficient": 0.1
    },
    "temperature_alarm_settings.threshold_min": {
        "coefficient": 0.1
    },
    "temperature_alarm_settings.threshold_max": {
        "coefficient": 0.1
    },
    "temperature_calibration_settings.calibration_value": {
        "coefficient": 0.1
    }
};
    var leafPaths = getAllLeafPaths(payload);
	for (var i = 0; i < leafPaths.length; i++) {
        var propertyId = leafPaths[i];
        var propertyParts = propertyId.split('.');
        var newPropertyParts = []
        for (var j = 0; j < propertyParts.length; j++) {
            var part = propertyParts[j];
            if (isInteger(part)) {
                newPropertyParts.push('_item');
            } else {
                newPropertyParts.push(part);
            }
        }
        var newPropertyId = newPropertyParts.join('.');
        newPropertyId = recoverName(newPropertyId, 'fahrenheit');
        newPropertyId = recoverName(newPropertyId, 'celsius');
        propertyId = recoverName(propertyId, 'fahrenheit');
        propertyId = recoverName(propertyId, 'celsius');
        if (allTemperatureProperties[newPropertyId]) {
            var fahrenheitProperty = convertName(propertyId, 'fahrenheit');
            var celsiusProperty = convertName(propertyId, 'celsius');
            var stringCoefficient = String(allTemperatureProperties[newPropertyId].coefficient);
            var dotIndex = stringCoefficient.indexOf('.');
            var precision = dotIndex != -1 ? stringCoefficient.length - dotIndex - 1 : 0;
            if (!hasPath(payload, propertyId)) {
                if (hasPath(payload, fahrenheitProperty) && hasPath(payload, celsiusProperty)) {
                    throw new Error(fahrenheitProperty + ' and ' + celsiusProperty + ' cannot be in payload at the same time');
                }
                if (hasPath(payload, fahrenheitProperty)) {
                    setPath(payload, propertyId, Number(((getPath(payload, fahrenheitProperty) - 32) / 1.8).toFixed(precision)));
                } else if (hasPath(payload, celsiusProperty)) {
                    setPath(payload, propertyId, Number(getPath(payload, celsiusProperty).toFixed(precision)));
                }
            }
        }
	}
	return payload;
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
    } else if (result && typeof result.fPort === "undefined") {
        result.fPort = 100;
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

exports.decodeUplink = decodeUplink;
