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
/**
 * Payload Encoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product GS601
 */
var RAW_VALUE = 0x00;
var WITH_QUERY_CMD = 0x00;

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

    if ("frame" in payload) {
        encoded = encoded.concat(setFrame(payload.frame));
    }
    if ("reporting_interval" in payload) {
        var cmd_buffer = setReportingInterval(payload.reporting_interval);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("temperature_unit" in payload) {
        var cmd_buffer = setTemperatureUnit(payload.temperature_unit);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("led_status" in payload) {
        var cmd_buffer = setLedStatus(payload.led_status);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("buzzer_enable" in payload) {
        var cmd_buffer = setBuzzerEnable(payload.buzzer_enable);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("buzzer_sleep" in payload) {
        if ("item_1" in payload.buzzer_sleep) {
            var cmd_buffer = setBuzzerSleepSettings(1, payload.buzzer_sleep.item_1);
            encoded = encoded.concat(cmd_buffer);
            encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
        }
        if ("item_2" in payload.buzzer_sleep) {
            var cmd_buffer = setBuzzerSleepSettings(2, payload.buzzer_sleep.item_2);
            encoded = encoded.concat(cmd_buffer);
            encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
        }
    }
    if ("buzzer_button_stop_enable" in payload) {
        var cmd_buffer = setBuzzerButtonStopEnable(payload.buzzer_button_stop_enable);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("buzzer_silent_time" in payload) {
        var cmd_buffer = setBuzzerSilentTime(payload.buzzer_silent_time);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("tamper_alarm_enable" in payload) {
        var cmd_buffer = setTamperAlarmEnable(payload.tamper_alarm_enable);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("tvoc_raw_reporting_enable" in payload) {
        var cmd_buffer = setTvocRawReportingEnable(payload.tvoc_raw_reporting_enable);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("temperature_alarm_settings" in payload) {
        var cmd_buffer = setTemperatureAlarmSettings(payload.temperature_alarm_settings);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("pm1_0_alarm_settings" in payload) {
        var cmd_buffer = setPM1AlarmSettings(payload.pm1_0_alarm_settings);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("pm2_5_alarm_settings" in payload) {
        var cmd_buffer = setPM25AlarmSettings(payload.pm2_5_alarm_settings);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("pm10_alarm_settings" in payload) {
        var cmd_buffer = setPM10AlarmSettings(payload.pm10_alarm_settings);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("tvoc_alarm_settings" in payload) {
        var cmd_buffer = setTVOCAlarmSettings(payload.tvoc_alarm_settings);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("vaping_index_alarm_settings" in payload) {
        var cmd_buffer = setVapingIndexAlarmSettings(payload.vaping_index_alarm_settings);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("alarm_reporting_times" in payload) {
        var cmd_buffer = setAlarmReportingTimes(payload.alarm_reporting_times);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("alarm_deactivation_enable" in payload) {
        var cmd_buffer = setAlarmDeactivateEnable(payload.alarm_deactivation_enable);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("temperature_calibration_settings" in payload) {
        var cmd_buffer = setTemperatureCalibrationSettings(payload.temperature_calibration_settings);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("humidity_calibration_settings" in payload) {
        var cmd_buffer = setHumidityCalibrationSettings(payload.humidity_calibration_settings);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("pm1_0_calibration_settings" in payload) {
        var cmd_buffer = setPM1CalibrationSettings(payload.pm1_0_calibration_settings);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("pm2_5_calibration_settings" in payload) {
        var cmd_buffer = setPM25CalibrationSettings(payload.pm2_5_calibration_settings);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("pm10_calibration_settings" in payload) {
        var cmd_buffer = setPM10CalibrationSettings(payload.pm10_calibration_settings);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("tvoc_calibration_settings" in payload) {
        var cmd_buffer = setTVOCCalibrationSettings(payload.tvoc_calibration_settings);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("vaping_index_calibration_settings" in payload) {
        var cmd_buffer = setVapingIndexCalibrationSettings(payload.vaping_index_calibration_settings);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("time_zone" in payload) {
        var cmd_buffer = setTimeZone(payload.time_zone);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("daylight_saving_time" in payload) {
        var cmd_buffer = setDaylightSavingTimeSettings(payload.daylight_saving_time);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("reboot" in payload) {
        encoded = encoded.concat(reboot());
    }
    if ("synchronize_time" in payload) {
        encoded = encoded.concat(synchronizeTime());
    }
    if ("query_device_status" in payload) {
        encoded = encoded.concat(queryDeviceStatus());
    }
    if ("reconnect" in payload) {
        encoded = encoded.concat(reconnect());
    }
    if ("stop_buzzer_alarm" in payload) {
        encoded = encoded.concat(stopBuzzerAlarm());
    }
    if ("execute_tvoc_self_clean" in payload) {
        encoded = encoded.concat(executeTVOCSelfClean());
    }

    return encoded;
}

/**
 * frame
 * @param {number} frame values: (0: normal, 1: debug)
 * @example { "frame": 0 }
 */
function setFrame(frame) {
    var buffer = new Buffer(2);
    buffer.writeUInt8(0xfe);
    buffer.writeUInt8(frame);
    return buffer.toBytes();
}

/**
 * report interval
 * @param {object} reporting_interval
 * @param {number} reporting_interval.unit values: (0: second, 1: minute)
 * @param {number} reporting_interval.seconds_of_time unit: second
 * @param {number} reporting_interval.minutes_of_time unit: minute
 * @example { "reporting_interval": { "unit": 0, "seconds_of_time": 300 } }
 */
function setReportingInterval(reporting_interval) {
    var unit = reporting_interval.unit;
    var seconds_of_time = reporting_interval.seconds_of_time;
    var minutes_of_time = reporting_interval.minutes_of_time;

    var unit_map = { 0: "second", 1: "minute" };
    var unit_values = getValues(unit_map);
    if (unit_values.indexOf(unit) === -1) {
        throw new Error("reporting_interval.unit must be one of " + unit_values.join(", "));
    }
    if (getValue(unit_map, unit) === 0 && (seconds_of_time < 10 || seconds_of_time > 64800)) {
        throw new Error("reporting_interval.seconds_of_time must be between 10 and 64800 when reporting_interval.unit is 0");
    }
    if (getValue(unit_map, unit) === 1 && (minutes_of_time < 1 || minutes_of_time > 1440)) {
        throw new Error("reporting_interval.minutes_of_time must be between 1 and 1440 when reporting_interval.unit is 1");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0x60);
    buffer.writeUInt8(getValue(unit_map, unit));
    buffer.writeUInt16LE(getValue(unit_map, unit) === 0 ? seconds_of_time : minutes_of_time);
    return buffer.toBytes();
}

/**
 * temperature unit
 * @param {number} temperature_unit values: (0: celsius, 1: fahrenheit)
 * @example { "temperature_unit": 0 }
 */
function setTemperatureUnit(temperature_unit) {
    var unit_map = { 0: "celsius", 1: "fahrenheit" };
    var unit_values = getValues(unit_map);
    if (unit_values.indexOf(temperature_unit) === -1) {
        throw new Error("temperature_unit must be one of " + unit_values.join(", "));
    }

    var buffer = new Buffer(2);
    buffer.writeUInt8(0x61);
    buffer.writeUInt8(getValue(unit_map, temperature_unit));
    return buffer.toBytes();
}

/**
 * led indicator
 * @param {number} led_status values: (0: disable, 1: enable)
 * @example { "led_status": 1 }
 */
function setLedStatus(led_status) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(led_status) === -1) {
        throw new Error("led_status must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(2);
    buffer.writeUInt8(0x62);
    buffer.writeUInt8(getValue(enable_map, led_status));
    return buffer.toBytes();
}

/**
 * buzzer enable
 * @param {number} buzzer_enable values: (0: disable, 1: enable)
 * @example { "buzzer_enable": 1 }
 */
function setBuzzerEnable(buzzer_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(buzzer_enable) === -1) {
        throw new Error("buzzer_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(2);
    buffer.writeUInt8(0x63);
    buffer.writeUInt8(getValue(enable_map, buzzer_enable));
    return buffer.toBytes();
}

/**
 * buzzer sleep settings
 * @param {number} index
 * @param {object} buzzer_sleep
 * @param {number} buzzer_sleep.enable values: (0: disable, 1: enable)
 * @param {number} buzzer_sleep.start_time unit: minute
 * @param {number} buzzer_sleep.end_time unit: minute
 * @example { "buzzer_sleep": { "item_1": { "enable": 1, "start_time": 0, "end_time": 1440 }, "item_2": { "enable": 1, "start_time": 0, "end_time": 1440 }} }
 */
function setBuzzerSleepSettings(index, buzzer_sleep) {
    var enable = buzzer_sleep.enable;
    var start_time = buzzer_sleep.start_time;
    var end_time = buzzer_sleep.end_time;

    var index_values = [1, 2];
    if (index_values.indexOf(index) === -1) {
        throw new Error("buzzer_sleep.item_1 or buzzer_sleep.item_2");
    }
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("buzzer_sleep.item_" + index + ".enable must be one of " + enable_values.join(", "));
    }
    if (start_time < 0 || start_time > 1440) {
        throw new Error("buzzer_sleep.item_" + index + ".start_time must be between 0 and 1440");
    }
    if (end_time < 0 || end_time > 1440) {
        throw new Error("buzzer_sleep.item_" + index + ".end_time must be between 0 and 1440");
    }

    var buffer = new Buffer(7);
    buffer.writeUInt8(0x64);
    buffer.writeUInt8(index);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt16LE(start_time);
    buffer.writeUInt16LE(end_time);
    return buffer.toBytes();
}

/**
 * buzzer button stop enable
 * @param {number} buzzer_button_stop_enable values: (0: disable, 1: enable)
 * @example { "buzzer_button_stop_enable": 1 }
 */
function setBuzzerButtonStopEnable(buzzer_button_stop_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(buzzer_button_stop_enable) === -1) {
        throw new Error("buzzer_button_stop_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(2);
    buffer.writeUInt8(0x65);
    buffer.writeUInt8(getValue(enable_map, buzzer_button_stop_enable));
    return buffer.toBytes();
}

/**
 * buzzer silent time
 * @param {number} buzzer_silent_time unit: minute, range: [0, 1440]
 * @example { "buzzer_silent_time": 10 }
 */
function setBuzzerSilentTime(buzzer_silent_time) {
    if (buzzer_silent_time < 0 || buzzer_silent_time > 1440) {
        throw new Error("buzzer_silent_time must be between 0 and 1440");
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0x66);
    buffer.writeUInt16LE(buzzer_silent_time);
    return buffer.toBytes();
}

/**
 * tamper alarm enable
 * @param {number} tamper_alarm_enable values: (0: disable, 1: enable)
 * @example { "tamper_alarm_enable": 1 }
 */
function setTamperAlarmEnable(tamper_alarm_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(tamper_alarm_enable) === -1) {
        throw new Error("tamper_alarm_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(2);
    buffer.writeUInt8(0x67);
    buffer.writeUInt8(getValue(enable_map, tamper_alarm_enable));
    return buffer.toBytes();
}

/**
 * tvoc raw data report
 * @param {number} tvoc_raw_reporting_enable values: (0: disable, 1: enable)
 * @example { "tvoc_raw_reporting_enable": 1 }
 */
function setTvocRawReportingEnable(tvoc_raw_reporting_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(tvoc_raw_reporting_enable) === -1) {
        throw new Error("tvoc_raw_reporting_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(2);
    buffer.writeUInt8(0x68);
    buffer.writeUInt8(getValue(enable_map, tvoc_raw_reporting_enable));
    return buffer.toBytes();
}

/**
 * temperature alarm settings
 * @param {object} temperature_alarm_settings
 * @param {number} temperature_alarm_settings.enable values: (0: disable, 1: enable)
 * @param {number} temperature_alarm_settings.condition values: (1: below, 2: above, 3: between, 4: outside)
 * @param {number} temperature_alarm_settings.threshold_min unit: Celsius
 * @param {number} temperature_alarm_settings.threshold_max unit: Celsius
 * @example { "temperature_alarm_settings": { "enable": 1, "condition": 2, "threshold_min": 30, "threshold_max": 40 } }
 */
function setTemperatureAlarmSettings(temperature_alarm_settings) {
    var enable = temperature_alarm_settings.enable;
    var condition = temperature_alarm_settings.condition;
    var threshold_min = temperature_alarm_settings.threshold_min;
    var threshold_max = temperature_alarm_settings.threshold_max;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("temperature_alarm_settings.enable must be one of " + enable_values.join(", "));
    }
    var condition_map = { 0: "disable", 1: "below", 2: "above", 3: "between", 4: "outside" };
    var condition_values = getValues(condition_map);
    if (condition_values.indexOf(condition) === -1) {
        throw new Error("temperature_alarm_settings.condition must be one of " + condition_values.join(", "));
    }

    var buffer = new Buffer(7);
    buffer.writeUInt8(0x69);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt8(getValue(condition_map, condition));
    buffer.writeInt16LE(threshold_min * 10);
    buffer.writeInt16LE(threshold_max * 10);
    return buffer.toBytes();
}

/**
 * pm1.0 alarm settings
 * @param {object} pm1_0_alarm_settings
 * @param {number} pm1_0_alarm_settings.enable values: (0: disable, 1: enable)
 * @param {number} pm1_0_alarm_settings.threshold_max
 * @example { "pm1_0_alarm_settings": { "enable": 1, "threshold_max": 40 } }
 */
function setPM1AlarmSettings(pm1_0_alarm_settings) {
    var enable = pm1_0_alarm_settings.enable;
    var threshold_max = pm1_0_alarm_settings.threshold_max;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("pm1_0_alarm_settings.enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(7);
    buffer.writeUInt8(0x6a);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt8(0x02); // above
    buffer.writeInt16LE(0x00);
    buffer.writeInt16LE(threshold_max);
    return buffer.toBytes();
}

/**
 * pm2.5 threshold config
 * @param {object} pm2_5_alarm_settings
 * @param {number} pm2_5_alarm_settings.enable values: (0: disable, 1: enable)
 * @param {number} pm2_5_alarm_settings.threshold_max
 * @example { "pm2_5_alarm_settings": { "enable": 1, "condition": 2, "threshold_min": 30, "threshold_max": 40 } }
 */
function setPM25AlarmSettings(pm2_5_alarm_settings) {
    var enable = pm2_5_alarm_settings.enable;
    var threshold_max = pm2_5_alarm_settings.threshold_max;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("pm_2_5_alarm_settings.enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(7);
    buffer.writeUInt8(0x6b);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt8(0x02); // above
    buffer.writeInt16LE(0x00);
    buffer.writeInt16LE(threshold_max);
    return buffer.toBytes();
}

/**
 * pm10 threshold config
 * @param {object} pm10_alarm_settings
 * @param {number} pm10_alarm_settings.enable values: (0: disable, 1: enable)
 * @param {number} pm10_alarm_settings.threshold_max
 * @example { "pm10_alarm_settings": { "enable": 1, "threshold_max": 40 } }
 */
function setPM10AlarmSettings(pm10_alarm_settings) {
    var enable = pm10_alarm_settings.enable;
    var threshold_max = pm10_alarm_settings.threshold_max;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("pm_10_alarm_settings.enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(7);
    buffer.writeUInt8(0x6c);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt8(0x02); // above
    buffer.writeInt16LE(0x00);
    buffer.writeInt16LE(threshold_max);
    return buffer.toBytes();
}

/**
 * tvoc alarm settings
 * @param {object} tvoc_alarm_settings
 * @param {number} tvoc_alarm_settings.enable values: (0: disable, 1: enable)
 * @param {number} tvoc_alarm_settings.threshold_max
 * @example { "tvoc_alarm_settings": { "enable": 1, "threshold_max": 40 } }
 */
function setTVOCAlarmSettings(tvoc_alarm_settings) {
    var enable = tvoc_alarm_settings.enable;
    var threshold_max = tvoc_alarm_settings.threshold_max;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("tvoc_alarm_settings.enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(7);
    buffer.writeUInt8(0x6d);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt8(0x02); // above
    buffer.writeInt16LE(0x00);
    buffer.writeInt16LE(threshold_max);
    return buffer.toBytes();
}

/**
 * vaping index alarm settings
 * @param {object} vaping_index_alarm_settings
 * @param {number} vaping_index_alarm_settings.enable values: (0: disable, 1: enable)
 * @param {number} vaping_index_alarm_settings.threshold_max
 * @example { "vaping_index_alarm_settings": { "enable": 1, "threshold_max": 4 } }
 */
function setVapingIndexAlarmSettings(vaping_index_alarm_settings) {
    var enable = vaping_index_alarm_settings.enable;
    var threshold_max = vaping_index_alarm_settings.threshold_max;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("vaping_index_alarm_settings.enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0x6e);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt8(0x02); // above
    buffer.writeUInt8(0x00);
    buffer.writeUInt8(threshold_max);
    return buffer.toBytes();
}

/**
 * alarm reporting times
 * @param {number} alarm_reporting_times range: [1, 1000]
 * @example { "alarm_reporting_times": 10 }
 */
function setAlarmReportingTimes(alarm_reporting_times) {
    if (alarm_reporting_times < 1 || alarm_reporting_times > 1000) {
        throw new Error("alarm_reporting_times must be between 1 and 1000");
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0x6f);
    buffer.writeUInt16LE(alarm_reporting_times);
    return buffer.toBytes();
}

/**
 * alarm deactivate enable
 * @param {object} alarm_deactivation_enable values: (0: disable, 1: enable)
 * @example { "alarm_deactivation_enable": 1 }
 */
function setAlarmDeactivateEnable(alarm_deactivation_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(alarm_deactivation_enable) === -1) {
        throw new Error("alarm_deactivation_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(2);
    buffer.writeUInt8(0x70);
    buffer.writeUInt8(getValue(enable_map, alarm_deactivation_enable));
    return buffer.toBytes();
}

/**
 * temperature calibration config
 * @param {object} temperature_calibration_settings
 * @param {number} temperature_calibration_settings.enable values: (0: disable, 1: enable)
 * @param {number} temperature_calibration_settings.calibration_value unit: Celsius, range: [-80, 80]
 * @example { "temperature_calibration_settings": { "enable": 1, "calibration_value": 20 } }
 */
function setTemperatureCalibrationSettings(temperature_calibration_settings) {
    var enable = temperature_calibration_settings.enable;
    var calibration_value = temperature_calibration_settings.calibration_value;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("temperature_calibration_settings.enable must be one of " + enable_values.join(", "));
    }
    if (calibration_value < -80 || calibration_value > 80) {
        throw new Error("temperature_calibration_settings.calibration_value must be between -80 and 80");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0x71);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeInt16LE(calibration_value * 10);
    return buffer.toBytes();
}

/**
 * humidity calibration config
 * @param {object} humidity_calibration_settings
 * @param {number} humidity_calibration_settings.enable values: (0: disable, 1: enable)
 * @param {number} humidity_calibration_settings.calibration_value unit: %, range: [-100, 100]
 * @example { "humidity_calibration_settings": { "enable": 1, "calibration_value": 50 } }
 */
function setHumidityCalibrationSettings(humidity_calibration_settings) {
    var enable = humidity_calibration_settings.enable;
    var calibration_value = humidity_calibration_settings.calibration_value;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("humidity_calibration_settings.enable must be one of " + enable_values.join(", "));
    }
    if (calibration_value < -100 || calibration_value > 100) {
        throw new Error("humidity_calibration_settings.calibration_value must be between -100 and 100");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0x72);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeInt16LE(calibration_value * 10);
    return buffer.toBytes();
}

/**
 * pm1 calibration config
 * @param {object} pm1_calibration_settings
 * @param {number} pm1_calibration_settings.enable values: (0: disable, 1: enable)
 * @param {number} pm1_calibration_settings.calibration_value, range: [-1000, 1000]
 * @example { "pm1_0_calibration_settings": { "enable": 1, "calibration_value": 10 } }
 */
function setPM1CalibrationSettings(pm1_0_calibration_settings) {
    var enable = pm1_0_calibration_settings.enable;
    var calibration_value = pm1_0_calibration_settings.calibration_value;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("pm1_0_calibration_settings.enable must be one of " + enable_values.join(", "));
    }
    if (calibration_value < -1000 || calibration_value > 1000) {
        throw new Error("pm1_0_calibration_settings.calibration_value must be between -1000 and 1000");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0x73);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeInt16LE(calibration_value);
    return buffer.toBytes();
}

/**
 * pm2.5 calibration config
 * @param {object} pm2_5_calibration_settings
 * @param {number} pm2_5_calibration_settings.enable values: (0: disable, 1: enable)
 * @param {number} pm2_5_calibration_settings.calibration_value, range: [-1000, 1000]
 * @example { "pm2_5_calibration_settings": { "enable": 1, "calibration_value": 10 } }
 */
function setPM25CalibrationSettings(pm2_5_calibration_settings) {
    var enable = pm2_5_calibration_settings.enable;
    var calibration_value = pm2_5_calibration_settings.calibration_value;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("pm2_5_calibration_settings.enable must be one of " + enable_values.join(", "));
    }
    if (calibration_value < -1000 || calibration_value > 1000) {
        throw new Error("pm2_5_calibration_settings.calibration_value must be between -1000 and 1000");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0x74);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeInt16LE(calibration_value);
    return buffer.toBytes();
}

/**
 * pm10 calibration config
 * @param {object} pm10_calibration_settings
 * @param {number} pm10_calibration_settings.enable values: (0: disable, 1: enable)
 * @param {number} pm10_calibration_settings.calibration_value, range: [-1000, 1000]
 * @example { "pm10_calibration_settings": { "enable": 1, "calibration_value": 10 } }
 */
function setPM10CalibrationSettings(pm10_calibration_settings) {
    var enable = pm10_calibration_settings.enable;
    var calibration_value = pm10_calibration_settings.calibration_value;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("pm10_calibration_settings.enable must be one of " + enable_values.join(", "));
    }
    if (calibration_value < -1000 || calibration_value > 1000) {
        throw new Error("pm10_calibration_settings.calibration_value must be between -1000 and 1000");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0x75);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeInt16LE(calibration_value);
    return buffer.toBytes();
}

/**
 * tvoc calibration settings
 * @param {object} tvoc_calibration_settings
 * @param {number} tvoc_calibration_settings.enable values: (0: disable, 1: enable)
 * @param {number} tvoc_calibration_settings.calibration_value unit: ppm, range: [-2000, 2000]
 * @example { "tvoc_calibration_settings": { "enable": 1, "calibration_value": 10 } }
 */
function setTVOCCalibrationSettings(tvoc_calibration_settings) {
    var enable = tvoc_calibration_settings.enable;
    var calibration_value = tvoc_calibration_settings.calibration_value;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("tvoc_calibration_settings.enable must be one of " + enable_values.join(", "));
    }
    if (calibration_value < -2000 || calibration_value > 2000) {
        throw new Error("tvoc_calibration_settings.calibration_value must be between -2000 and 2000");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0x76);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeInt16LE(calibration_value);
    return buffer.toBytes();
}

/**
 * vaping index calibration settings
 * @param {object} vaping_index_calibration_settings
 * @param {number} vaping_index_calibration_settings.enable values: (0: disable, 1: enable)
 * @param {number} vaping_index_calibration_settings.calibration_value range: [-100, 100]
 * @example { "vaping_index_calibration_settings": { "enable": 1, "calibration_value": 10 } }
 */
function setVapingIndexCalibrationSettings(vaping_index_calibration_settings) {
    var enable = vaping_index_calibration_settings.enable;
    var calibration_value = vaping_index_calibration_settings.calibration_value;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("vaping_index_calibration_settings.enable must be one of " + enable_values.join(", "));
    }
    if (calibration_value < -100 || calibration_value > 100) {
        throw new Error("vaping_index_calibration_settings.calibration_value must be between -100 and 100");
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0x77);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeInt8(calibration_value);
    return buffer.toBytes();
}

/**
 * timezone
 * @param {number} time_zone values: (-720: UTC-12, -660: UTC-11, -600: UTC-10, -570: UTC-9:30, -540: UTC-9, -480: UTC-8,
 *                                  -420: UTC-7, -360: UTC-6, -300: UTC-5, -240: UTC-4, -210: UTC-3:30, -180: UTC-3, -120: UTC-2, -60: UTC-1,
 *                                  0: UTC, 60: UTC+1, 120: UTC+2, 180: UTC+3, 210: UTC+3:30, 240: UTC+4, 270: UTC+4:30, 300: UTC+5, 330: UTC+5:30,
 *                                  345: UTC+5:45, 360: UTC+6, 390: UTC+6:30, 420: UTC+7, 480: UTC+8, 540: UTC+9, 570: UTC+9:30, 600: UTC+10, 630: UTC+10:30,
 *                                  660: UTC+11, 720: UTC+12, 765: UTC+12:45, 780: UTC+13, 840: UTC+14)
 * @example { "time_zone": 480 }
 */
function setTimeZone(time_zone) {
    var timezone_map = { "-720": "UTC-12", "-660": "UTC-11", "-600": "UTC-10", "-570": "UTC-9:30", "-540": "UTC-9", "-480": "UTC-8", "-420": "UTC-7", "-360": "UTC-6", "-300": "UTC-5", "-240": "UTC-4", "-210": "UTC-3:30", "-180": "UTC-3", "-120": "UTC-2", "-60": "UTC-1", 0: "UTC", 60: "UTC+1", 120: "UTC+2", 180: "UTC+3", 210: "UTC+3:30", 240: "UTC+4", 270: "UTC+4:30", 300: "UTC+5", 330: "UTC+5:30", 345: "UTC+5:45", 360: "UTC+6", 390: "UTC+6:30", 420: "UTC+7", 480: "UTC+8", 540: "UTC+9", 570: "UTC+9:30", 600: "UTC+10", 630: "UTC+10:30", 660: "UTC+11", 720: "UTC+12", 765: "UTC+12:45", 780: "UTC+13", 840: "UTC+14" };
    var timezone_values = getValues(timezone_map);
    if (timezone_values.indexOf(time_zone) === -1) {
        throw new Error("time_zone must be one of " + timezone_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xc7);
    buffer.writeInt16LE(getValue(timezone_map, time_zone));
    return buffer.toBytes();
}

/**
 * daylight saving time settings
 * @param {object} daylight_saving_time
 * @param {number} daylight_saving_time.daylight_saving_time_enable values: (0: disable, 1: enable)
 * @param {number} daylight_saving_time.daylight_saving_time_offset unit: minutes
 * @param {number} daylight_saving_time.start_month values: (1: January, 2: February, 3: March, 4: April, 5: May, 6: June, 7: July, 8: August, 9: September, 10: October, 11: November, 12: December)
 * @param {number} daylight_saving_time.start_week_num values: (1: First week, 2: Second week, 3: Third week, 4: Fourth week, 5: Last week)
 * @param {number} daylight_saving_time.start_week_day values: (1: Monday, 2: Tuesday, 3: Wednesday, 4: Thursday, 5: Friday, 6: Saturday, 7: Sunday)
 * @param {number} daylight_saving_time.start_hour_min unit: minutes
 * @param {number} daylight_saving_time.end_month values: (1: January, 2: February, 3: March, 4: April, 5: May, 6: June, 7: July, 8: August, 9: September, 10: October, 11: November, 12: December)
 * @param {number} daylight_saving_time.end_week_num values: (1: First week, 2: Second week, 3: Third week, 4: Fourth week, 5: Last week)
 * @param {number} daylight_saving_time.end_week_day values: (1: Monday, 2: Tuesday, 3: Wednesday, 4: Thursday, 5: Friday, 6: Saturday, 7: Sunday)
 * @param {number} daylight_saving_time.end_hour_min unit: minutes
 * @example { "daylight_saving_time": { "enable": 1, "offset": 60, "start_month": 3, "start_week": 1, "start_day": 1, "start_time": 0, "end_month": 11, "end_week": 4, "end_day": 7, "end_time": 120 } }
 */
function setDaylightSavingTimeSettings(daylight_saving_time) {
    var enable = daylight_saving_time.daylight_saving_time_enable;
    var daylight_saving_time_offset = daylight_saving_time.daylight_saving_time_offset;
    var start_month = daylight_saving_time.start_month;
    var start_week_num = daylight_saving_time.start_week_num;
    var start_week_day = daylight_saving_time.start_week_day;
    var start_hour_min = daylight_saving_time.start_hour_min;
    var end_month = daylight_saving_time.end_month;
    var end_week_num = daylight_saving_time.end_week_num;
    var end_week_day = daylight_saving_time.end_week_day;
    var end_hour_min = daylight_saving_time.end_hour_min;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("daylight_saving_time.daylight_saving_time_enable must be one of " + enable_values.join(", "));
    }
    var month_values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    if (month_values.indexOf(start_month) === -1 || month_values.indexOf(end_month) === -1) {
        throw new Error("daylight_saving_time.start_month and end_month must be one of " + month_values.join(", "));
    }
    var week_values = [1, 2, 3, 4, 5];
    if (week_values.indexOf(start_week_num) === -1 || week_values.indexOf(end_week_num) === -1) {
        throw new Error("daylight_saving_time.start_week_num and end_week_num must be one of " + week_values.join(", "));
    }
    var day_values = [1, 2, 3, 4, 5, 6, 7];
    if (day_values.indexOf(start_week_day) === -1 || day_values.indexOf(end_week_day) === -1) {
        throw new Error("daylight_saving_time.start_week_day and end_week_day must be one of " + day_values.join(", "));
    }

    var start_day_value = (start_week_num << 4) | start_week_day;
    var end_day_value = (end_week_num << 4) | end_week_day;

    var buffer = new Buffer(11);
    buffer.writeUInt8(0xc6);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeInt8(daylight_saving_time_offset);
    buffer.writeUInt8(start_month);
    buffer.writeUInt8(start_day_value);
    buffer.writeUInt16LE(start_hour_min);
    buffer.writeUInt8(end_month);
    buffer.writeUInt8(end_day_value);
    buffer.writeUInt16LE(end_hour_min);
    return buffer.toBytes();
}

/**
 * reboot
 */
function reboot() {
    var buffer = new Buffer(1);
    buffer.writeUInt8(0xbe);
    return buffer.toBytes();
}

/**
 * synchronize time
 * @example { "synchronize_time": 1 }
 */
function synchronizeTime() {
    var buffer = new Buffer(1);
    buffer.writeUInt8(0xb8);
    return buffer.toBytes();
}

/**
 * query device status
 * @example { "query_device_status": 1 }
 */
function queryDeviceStatus() {
    var buffer = new Buffer(1);
    buffer.writeUInt8(0xb9);
    return buffer.toBytes();
}

/**
 * reconnect
 * @example { "reconnect": 1 }
 */
function reconnect() {
    var buffer = new Buffer(1);
    buffer.writeUInt8(0xb6);
    return buffer.toBytes();
}

/**
 * stop buzzer alarm
 * @example { "stop_buzzer_alarm": 1 }
 */
function stopBuzzerAlarm() {
    var buffer = new Buffer(1);
    buffer.writeUInt8(0x5f);
    return buffer.toBytes();
}

/**
 * execute TVOC self clean
 * @example { "execute_tvoc_self_clean": 1 }
 */
function executeTVOCSelfClean() {
    var buffer = new Buffer(1);
    buffer.writeUInt8(0x5e);
    return buffer.toBytes();
}

function setQueryCmd(bytes) {
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
        be: { level: 0, name: "reboot" },
        b6: { level: 0, name: "reconnect" },
        b8: { level: 0, name: "synchronize_time" },
        b9: { level: 0, name: "query_device_status" },
        "5f": { level: 0, name: "stop_buzzer_alarm" },
        "5e": { level: 0, name: "execute_tvoc_self_clean" },
    };

    var cmd = readHexString(bytes.slice(0, 1));
    var cmd_level = name_map[cmd].level;

    if (cmd_level != 0) {
        var buffer = new Buffer(2 + cmd_level);
        buffer.writeUInt8(0xef);
        buffer.writeUInt8(cmd_level);
        buffer.writeBytes(bytes.slice(0, cmd_level));
        return buffer.toBytes();
    }
    return [];
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

Buffer.prototype.toBytes = function () {
    return this.buffer;
};

function readHexString(bytes) {
    var temp = [];
    for (var idx = 0; idx < bytes.length; idx++) {
        temp.push(("0" + (bytes[idx] & 0xff).toString(16)).slice(-2));
    }
    return temp.join("");
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

exports.decodeUplink = decodeUplink;
