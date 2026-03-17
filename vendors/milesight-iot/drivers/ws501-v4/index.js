/**
 * Payload Decoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product WS501
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
        // Voltage
        else if (channel_id === 0x03 && channel_type === 0x74) {
            decoded.voltage = readUInt16LE(bytes.slice(i, i + 2));
            i += 2;
        }
        // Electric Power
        else if (channel_id === 0x04 && channel_type === 0x80) {
            decoded.electric_power = readUInt32LE(bytes.slice(i, i + 4));
            i += 4;
        }
        // Power Factor
        else if (channel_id === 0x05 && channel_type === 0x81) {
            decoded.power_factor = readUInt8(bytes.slice(i, i + 1));
            i += 1;
        }
        // Power Consumption
        else if (channel_id === 0x06 && channel_type === 0x83) {
            decoded.power_consumption = readUInt32LE(bytes.slice(i, i + 4));
            i += 4;
        }
        // Current Rating
        else if (channel_id === 0x07 && channel_type === 0xc9) {
            decoded.current_rating = readUInt16LE(bytes.slice(i, i + 2));
            i += 2;
        }
        // Over Current Alarm
        else if (channel_id === 0x87 && channel_type === 0xc9) {
            decoded.overcurrent_alarm = {};
            decoded.overcurrent_alarm.current = readUInt16LE(bytes.slice(i, i + 2));
            decoded.overcurrent_alarm.status = readOverCurrentStatus(bytes.slice(i + 2, i + 3));
            i += 3;
        }
        // Device Abnormal Alarm
        else if (channel_id === 0x88 && channel_type === 0x29) {
            decoded.device_abnormal_alarm = {};
            decoded.device_abnormal_alarm.status = readAlarmStatus(bytes[i]);
            i += 1;
        }
        // Temperature Alarm
        else if (channel_id === 0x89 && channel_type === 0xdf) {
            decoded.temperature_alarm  = {};
            decoded.temperature_alarm.status = readTemperatureAlarmStatus(bytes[i]);
            i += 1;
        }
        // Voltage Collect Error
        else if (channel_id === 0xb3 && channel_type === 0x74) {
            decoded.voltage_collect_error = {};
            decoded.voltage_collect_error.type = readCollectStatus(bytes[i]);
            i += 1;
        }
        // Electric Power Collect Error
        else if (channel_id === 0xb4 && channel_type === 0x80) {
            decoded.electric_power_collect_error = {};
            decoded.electric_power_collect_error.type = readCollectStatus(bytes[i]);
            i += 1;
        }
        // Power Factor Collect Error
        else if (channel_id === 0xb5 && channel_type === 0x81) {
            decoded.power_factor_collect_error = {};
            decoded.power_factor_collect_error.type = readCollectStatus(bytes[i]);
            i += 1;
        }
        // Power Consumption Collect Error
        else if (channel_id === 0xb6 && channel_type === 0x83) {
            decoded.power_consumption_collect_error = {};
            decoded.power_consumption_collect_error.type = readCollectStatus(bytes[i]);
            i += 1;
        }
        // Current Collect Error
        else if (channel_id === 0xb7 && channel_type === 0xc9) {
            decoded.current_collect_error = {};
            decoded.current_collect_error.type = readCollectStatus(bytes[i]);
            i += 1;
        }
        // DOWNLINK RESPONSE
        else if (channel_id === 0xfe || channel_id === 0xff) {
            var result = handle_downlink_response(channel_type, bytes, i);
            decoded = mergeObjects(decoded, result.data);
            i = result.offset;
        } else if (channel_id === 0xf8 || channel_id === 0xf9) {
            var result = handle_downlink_response_ext(channel_id, channel_type, bytes, i);
            decoded = mergeObjects(decoded, result.data);
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
            decoded.reporting_interval = readUInt16LE(bytes.slice(offset, offset + 2));
            offset += 2;
            break;
        case 0x10:
            decoded.reboot = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x25:
            var data = readUInt16LE(bytes.slice(offset, offset + 2));
            decoded.button_lock_config = {};
            decoded.button_lock_config.enable = readEnableStatus((data >>> 15) & 0x01);
            offset += 2;
            break;
        case 0x28:
            decoded.report_status = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x29:
            var data = readUInt8(bytes[offset]);
            var button_bit_offset = { button1: 0 };
            var switch_bit_offset = { button_status1: 0 };
            var mask = data >> 4 & 0x07;
            var object_name = mask ? "button_status_control" : "button_status";
            var offset_map = mask ? switch_bit_offset : button_bit_offset;
            decoded[object_name] = {};
            for (var key in offset_map) {
                decoded[object_name][key] = readOnOffStatus((data >>> (offset_map[key])) & 0x01);
                if (mask) {
                    decoded[object_name][key + '_change'] = readYesNoStatus((data >>> (offset_map[key] + 4)) & 0x01);
                }
            }
            offset += 1;
            break;
        case 0x2c:
            decoded.report_attribute = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x2f:
            decoded.led_mode = readLedMode(bytes[offset]);
            offset += 1;
            break;
        case 0x5e:
            decoded.button_reset_config = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x26:
            decoded.power_consumption_3w = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x27:
            decoded.power_consumption_clear = readYesNoStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x24: 
            decoded.overcurrent_alarm_config = {};
            decoded.overcurrent_alarm_config.enable = readEnableStatus(bytes[offset]);
            decoded.overcurrent_alarm_config.threshold = readUInt8(bytes.slice(offset + 1, offset + 2));
            offset += 2;
            break;
        case 0x30:
            decoded.overcurrent_protection = {};
            decoded.overcurrent_protection.enable = readEnableStatus(bytes[offset]);
            decoded.overcurrent_protection.threshold = readUInt8(bytes.slice(offset + 1, offset + 2));
            offset += 2;
            break;
        case 0x8d:
            decoded.highcurrent_config = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x67:
            decoded.power_switch_mode = readPowerSwitchMode(bytes[offset]);
            offset += 1;
            break;
        case 0x4a:
            decoded.time_synchronize = readYesNoStatus(1);
            offset += 1;
            break;
        case 0xc7:
            var d2d_enable_data = readUInt8(bytes[offset]);
            offset += 1;

            decoded.d2d_settings = {};
            decoded.d2d_settings.d2d_controller_enable = readEnableStatus((d2d_enable_data >>> 0) & 1);
            decoded.d2d_settings.d2d_controller_enable_change = readYesNoStatus((d2d_enable_data >>> 4) & 1);
            decoded.d2d_settings.d2d_agent_enable = readEnableStatus((d2d_enable_data >>> 1) & 1);
            decoded.d2d_settings.d2d_agent_enable_change = readYesNoStatus((d2d_enable_data >>> 5) & 1);
            break;
        case 0x83: 
            var d2d_agent_settings = readD2DAgentSettings(bytes.slice(offset, offset + 5));
            offset += 5;
            decoded.d2d_agent_settings_array = decoded.d2d_agent_settings_array || [];
            decoded.d2d_agent_settings_array.push(d2d_agent_settings);
            break;
        case 0xbd:
            decoded.time_zone = readTimeZone(readInt16LE(bytes.slice(offset, offset + 2)));
            offset += 2;
            break;
        default:
            throw new Error("unknown downlink response");
    }

    return { data: decoded, offset: offset };
}

function handle_downlink_response_ext(code, channel_type, bytes, offset) {
    var decoded = {};

    switch (channel_type) {
        case 0x64:
            var schedule_settings_result = readUInt8(bytes[offset + 7]);
            if (schedule_settings_result === 0) {
                var schedule_settings = readScheduleSettings(bytes.slice(offset, offset + 7));
                decoded.schedule_settings = decoded.schedule_settings || [];
                decoded.schedule_settings.push(schedule_settings);
            } else {
                decoded.schedule_settings_result = readScheduleSettingsResult(schedule_settings_result);
            }
            offset += 7;
            break;
        case 0x65:
            var data = readUInt8(bytes[offset]);
            decoded.get_schedule = {};
            if (data === 0xff) {
                decoded.get_schedule.schedule_id = 'all schedules';
            } else {
                decoded.get_schedule.schedule_id = data;
            }
            offset += 1;
            break;
        case 0x67:
            var schedule_settings = readScheduleSettings(bytes.slice(offset, offset + 7), true);
            decoded.schedule_report = decoded.schedule_report || [];
            decoded.schedule_report.push(schedule_settings);
            offset += 7;
            break;
        case 0xab:
            decoded.power_consumption_2w = {};
            decoded.power_consumption_2w.enable = readEnableStatus(bytes[offset]);
            offset += 1;
            var power_bit_offset = [ "button_power1" ];
            for(var i= 0; i < power_bit_offset.length; i++) {
                decoded.power_consumption_2w[power_bit_offset[i]] = readUInt16LE(bytes.slice(offset + i * 2, offset + (i + 1) * 2));
            }
            offset += 6;
            break;
        case 0xb8:
            decoded.d2d_controller_settings_array = decoded.d2d_controller_settings_array || [];
            var d2d_controller_settings = readD2DControllerSettings(bytes.slice(offset, offset + 5));
            decoded.d2d_controller_settings_array.push(d2d_controller_settings);
            offset += 5;
            break;
        case 0x72:
            decoded.daylight_saving_time = readDstConfig(bytes.slice(offset, offset + 9));
            offset += 9;
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

function readDstConfig(bytes) {
    var offset = 0;

    var data = bytes[offset];
    var enable_value = (data >> 7) & 0x01;
    var offset_value = data & 0x7f;

    var daylight_saving_time = {};
    daylight_saving_time.enable = readEnableStatus(enable_value);
    daylight_saving_time.dst_bias = offset_value;

    daylight_saving_time.start_month = readMonth(bytes[offset + 1]);
    var start_week_value = readUInt8(bytes[offset + 2]);
    daylight_saving_time.start_week_num = readWeek(start_week_value >> 4);
    daylight_saving_time.start_week_day = readWeekDay(start_week_value & 0x0f);
    daylight_saving_time.start_hour_min = readHourMin(readUInt16LE(bytes.slice(offset + 3, offset + 5)));

    daylight_saving_time.end_month = readMonth(bytes[offset + 5]);
    var end_week_value = readUInt8(bytes[offset + 6]);
    daylight_saving_time.end_week_num = readWeek(end_week_value >> 4);
    daylight_saving_time.end_week_day = readWeekDay(end_week_value & 0x0f);
    daylight_saving_time.end_hour_min = readHourMin(readUInt16LE(bytes.slice(offset + 7, offset + 9)));
    
    offset += 9;

    return daylight_saving_time;
}

function hasResultFlag(code) {
    return code === 0xf8;
}

function readProtocolVersion(bytes) {
    var major = (bytes & 0xf0) >> 4;
    var minor = bytes & 0x0f;
    return "v" + major + "." + minor;
}

function readResultStatus(status) {
    var status_map = { 
        0: "success", 
        1: "forbidden", 
        2: "out of range", 
        16: "continue is 0", 
        17: "The continue is greater than the maximum value allowed by the device",
        18: "Command expires (start time + continue <= current time)"
     };
    return getValue(status_map, status);
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
        2: "Class C",
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

function readOnOffStatus(status) {
    var status_map = { 0: "off", 1: "on" };
    return getValue(status_map, status);
}

function readYesNoStatus(status) {
    var status_map = { 0: "no", 1: "yes" };
    return getValue(status_map, status);
}

function readLedMode(type) {
    var led_mode_map = { 0: "disable", 1: "Enable (relay closed indicator off)" };
    return getValue(led_mode_map, type);
}

function readTemperatureAlarmStatus(status) {
    var status_map = { 1: "overtemperature" };
    return getValue(status_map, status);
}

function readAlarmStatus(status) {
    var status_map = { 1: "abnormal" };
    return getValue(status_map, status);
}

function readOverCurrentStatus(status) {
    var status_map = { 1: "overcurrent" };
    return getValue(status_map, status);
}

function readScheduleSettings(bytes, isReport) {
    var offset = 0;

    var schedule_settings = {};
    schedule_settings.schedule_id = readUInt8(bytes[offset]);
    schedule_settings.enable = readEnableStatus2(bytes[offset + 1] & 0x03);
    schedule_settings.use_config = readYesNoStatus(bytes[offset + 1] >> 4 & 0x01);
    // condition
    var day_bit_offset = { monday: 0, tuesday: 1, wednesday: 2, thursday: 3, friday: 4, saturday: 5, sunday: 6 };
    if(isReport) {
        day_bit_offset = { execution_day_mon: 0, execution_day_tues: 1, execution_day_wed: 2, execution_day_thu: 3, execution_day_fri: 4, execution_day_sat: 5, execution_day_sun: 6 };
    }
    var day = readUInt8(bytes[offset + 2]);
    for (var key in day_bit_offset) {
        schedule_settings[key] = readEnableStatus((day >> day_bit_offset[key]) & 0x01);
    }
    schedule_settings.execut_hour = readUInt8(bytes[offset + 3]);
    schedule_settings.execut_min = readUInt8(bytes[offset + 4]);

    // action
    var switch_bit_offset = { button_status1: 0 };
    var switch_raw_data = readUInt8(bytes[offset + 5]);
    for (var key in switch_bit_offset) {
        schedule_settings[key] = readSwitchStatus((switch_raw_data >> switch_bit_offset[key]) & 0x03);
    }
    schedule_settings.lock_status = readChildLockStatus(bytes[offset + 6]);

    return schedule_settings;
}

function readCollectStatus(status) {
    var status_map = { 1: "collection error" };
    return getValue(status_map, status);
}

function readScheduleSettingsResult(result) {
    var schedule_settings_result_map = {
        0: "success",
        2: "failed, out of range",
        17: "success, conflict with channel=1",
        18: "success, conflict with channel=2",
        19: "success, conflict with channel=3",
        20: "success, conflict with channel=4",
        21: "success, conflict with channel=5",
        22: "success, conflict with channel=6",
        23: "success, conflict with channel=7",
        24: "success, conflict with channel=8",
        25: "success, conflict with channel=9",
        26: "success, conflict with channel=10",
        27: "success, conflict with channel=11",
        28: "success, conflict with channel=12",
        29: "success, conflict with channel=13",
        30: "success, conflict with channel=14",
        31: "success, conflict with channel=15",
        32: "success, conflict with channel=16",
        49: "failed, conflict with channel=1",
        50: "failed, conflict with channel=2",
        51: "failed, conflict with channel=3",
        52: "failed, conflict with channel=4",
        53: "failed, conflict with channel=5",
        54: "failed, conflict with channel=6",
        55: "failed, conflict with channel=7",
        56: "failed, conflict with channel=8",
        57: "failed, conflict with channel=9",
        58: "failed, conflict with channel=10",
        59: "failed, conflict with channel=11",
        60: "failed, conflict with channel=12",
        61: "failed, conflict with channel=13",
        62: "failed, conflict with channel=14",
        63: "failed, conflict with channel=15",
        64: "failed, conflict with channel=16",
        81: "failed,rule config empty",
    };
    return getValue(schedule_settings_result_map, result);
}

function readD2DCommand(bytes) {
    return ("0" + (bytes[1] & 0xff).toString(16)).slice(-2) + ("0" + (bytes[0] & 0xff).toString(16)).slice(-2);
}

function readSwitchObject(switchs) {
    var switch_object_map = {
        1: "button1"
    };
    return getValue(switch_object_map, switchs);
}

function readActionSwitchStatus(status) {
    var switch_status_map = {
        0: "off",
        1: "on",
        2: "reversel"
    };
    return getValue(switch_status_map, status);
}

function readD2DAgentSettings(bytes) {
    var offset = 0;

    var d2d_agent_settings = {};
    d2d_agent_settings.number = readUInt8(bytes[offset]);
    d2d_agent_settings.enable = readEnableStatus(bytes[offset + 1] & 0x01);
    d2d_agent_settings.control_command = readD2DCommand(bytes.slice(offset + 2, offset + 4));

    d2d_agent_settings.action_status = {};
    var switchs = bytes[offset + 4] >> 4;
    var status = bytes[offset + 4] & 0x0f;
    d2d_agent_settings.action_status.button = readSwitchObject(switchs);
    d2d_agent_settings.action_status.button_status = readActionSwitchStatus(status);

    return d2d_agent_settings;
}

function readD2DControllerSettings(bytes) {
    var offset = 0;

    var d2d_controller_settings = {};
    d2d_controller_settings.button_id = readButtonId(bytes[offset]);
    d2d_controller_settings.contrl_enable = readEnableStatus(bytes[offset + 1]);
    d2d_controller_settings.uplink = {};
    d2d_controller_settings.uplink.lora_enable = readEnableStatus(bytes[offset + 2] & 0x01);
    d2d_controller_settings.uplink.button_enable = readEnableStatus(bytes[offset + 2] >> 1 & 0x01);
    d2d_controller_settings.contrl_cmd = readD2DCommand(bytes.slice(offset + 3, offset + 5));

    return d2d_controller_settings;
}

function readSwitchStatus(status) {
    var switch_status_map = { 0: "keep", 1: "on", 2: "off", 3: "reversal" };
    return getValue(switch_status_map, status);
}

function readChildLockStatus(status) {
    var child_lock_status_map = { 0: "keep", 1: "lock", 2: "unlock" };
    return getValue(child_lock_status_map, status);
}

function readTimeZone(time_zone) {
    var timezone_map = { "-720": "UTC-12", "-660": "UTC-11", "-600": "UTC-10", "-570": "UTC-9:30", "-540": "UTC-9", "-480": "UTC-8", "-420": "UTC-7", "-360": "UTC-6", "-300": "UTC-5", "-240": "UTC-4", "-210": "UTC-3:30", "-180": "UTC-3", "-120": "UTC-2", "-60": "UTC-1", 0: "UTC", 60: "UTC+1", 120: "UTC+2", 180: "UTC+3", 210: "UTC+3:30", 240: "UTC+4", 270: "UTC+4:30", 300: "UTC+5", 330: "UTC+5:30", 345: "UTC+5:45", 360: "UTC+6", 390: "UTC+6:30", 420: "UTC+7", 480: "UTC+8", 540: "UTC+9", 570: "UTC+9:30", 600: "UTC+10", 630: "UTC+10:30", 660: "UTC+11", 720: "UTC+12", 765: "UTC+12:45", 780: "UTC+13", 840: "UTC+14" };
    return getValue(timezone_map, time_zone);
}

function readEnableStatus(status) {
    var status_map = { 0: "disable", 1: "enable" };
    return getValue(status_map, status);
}

function readEnableStatus2(status) {
    var status_map = { 0: "not config", 1: "enable", 2: "disable" };
    return getValue(status_map, status);
}

function readPowerSwitchMode(mode) {
    var mode_map = { 0: "off", 1: "on", 2: "keep" };
    return getValue(mode_map, mode);
}

function readEnableMask(mask) {
    var mask_map = { 0: "keep", 1: "set" };
    return getValue(mask_map, mask);
}

function readMonth(month) {
    var month_map = {
        1:"Jan.",
        2:"Feb.",
        3: "Mar.",
        4: "Apr.",
        5: "May.",
        6: "Jun.",
        7: "Jul.",
        8: "Aug.",
        9: "Sep.",
        10: "Oct.",
        11: "Nov.",
        12: "Dec.",
    };
    return getValue(month_map, month);
}

function readWeek(week) {
    var weeks_map = {
        1: "1st",
        2: "2nd",
        3: "3rd",
        4: "4th",
        5: "last"
    };
    return getValue(weeks_map, week);
}

function readWeekDay(day) {
    var week_map = {
        1: "Mon.",
        2: "Tues.",
        3: "Wed.",
        4: "Thurs.",
        5: "Fri.",
        6: "Sat.",
        7: "Sun."
    };
    return getValue(week_map, day);
}

function readHourMin(hour_min) {
    var hour_min_map = {
        0: "00:00",
        60: "01:00",
        120: "02:00",
        180: "03:00",
        240: "04:00",
        300: "05:00",
        360: "06:00",
        420: "07:00",
        480: "08:00",
        540: "09:00",
        600: "10:00",
        660: "11:00",
        720: "12:00",
        780: "13:00",
        840: "14:00",
        900: "15:00",
        960: "16:00",
        1020: "17:00",
        1080: "18:00",
        1140: "19:00",
        1200: "20:00",
        1260: "21:00",
        1320: "22:00",
        1380: "23:00"
    };
    return getValue(hour_min_map, hour_min);
}

function readButtonId(button_id) {
    var button_id_map = { 0: "button1" };
    return getValue(button_id_map, button_id);
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
 * @product WS501
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
    if ("reporting_interval" in payload) {
        encoded = encoded.concat(setReportingInterval(payload.reporting_interval));
    }
    if ("report_status" in payload) {
        encoded = encoded.concat(reportStatus(payload.report_status));
    }
    if ("report_attribute" in payload) {
        encoded = encoded.concat(reportAttribute(payload.report_attribute));
    }
    if ("led_mode" in payload) {
        encoded = encoded.concat(setLedMode(payload.led_mode));
    }
    if ("button_lock_config" in payload) {
        encoded = encoded.concat(setButtonLockConfig(payload.button_lock_config));
    }
    if("button_status_control" in payload) {
        encoded = encoded.concat(setSwitchControl(payload.button_status_control));
    }
    if("button_reset_config" in payload) {
        encoded = encoded.concat(setButtonResetConfig(payload.button_reset_config));
    }
    if("power_consumption_3w" in payload) {
        encoded = encoded.concat(setPowerConsumptionEnable(payload.power_consumption_3w));
    }
    if("power_consumption_2w" in payload) {
        encoded = encoded.concat(setPowerConsumption(payload.power_consumption_2w));
    }
    if("power_consumption_clear" in payload) {
        encoded = encoded.concat(setPowerConsumptionClear(payload.power_consumption_clear));
    }
    if("schedule_settings" in payload) {
        for (var schedule_index = 0; schedule_index < payload.schedule_settings.length; schedule_index++) {
            var schedule = payload.schedule_settings[schedule_index];
            encoded = encoded.concat(setScheduleSettings(schedule));
        }
    }
    if("get_schedule" in payload) {
        encoded = encoded.concat(setGetLocalRule(payload.get_schedule));
    }
    if("overcurrent_alarm_config" in payload) {
        encoded = encoded.concat(setOvercurrentAlarmConfig(payload.overcurrent_alarm_config));
    }
    if("overcurrent_protection" in payload) {
        encoded = encoded.concat(setOvercurrentProtection(payload.overcurrent_protection));
    }
    if("highcurrent_config" in payload) {
        encoded = encoded.concat(setHighcurrentConfig(payload.highcurrent_config));
    }
    if("power_switch_mode" in payload) {
        encoded = encoded.concat(setPowerSwitchMode(payload.power_switch_mode));
    }
    if("time_synchronize" in payload) {
        encoded = encoded.concat(setTimeSynchronize(payload.time_synchronize));
    }
    if("d2d_settings" in payload) {
        encoded = encoded.concat(setD2DGlobalEnable(payload.d2d_settings));
    }
    if("d2d_agent_settings_array" in payload) {
        for (var agent_index = 0; agent_index < payload.d2d_agent_settings_array.length; agent_index++) {
            var agent = payload.d2d_agent_settings_array[agent_index];
            encoded = encoded.concat(setD2DAgentSettings(agent));
        }
    }
    if("d2d_controller_settings_array" in payload) {
        for (var controller_index = 0; controller_index < payload.d2d_controller_settings_array.length; controller_index++) {
            var controller = payload.d2d_controller_settings_array[controller_index];
            encoded = encoded.concat(setD2DControllerSettings(controller));
        }
    }
    if("time_zone" in payload) {
        encoded = encoded.concat(setTimeZone(payload.time_zone));
    }
    if("daylight_saving_time" in payload) {
        encoded = encoded.concat(setDaylightSavingTime(payload.daylight_saving_time));
    }

    return encoded;
}

/**
 * reboot
 * @param {number} reboot values: (0: "no", 1: "yes")
 * @example { "reboot": 1 }
 */
function reboot(reboot) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(reboot) === -1) {
        throw new Error("reboot must be one of: " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, reboot) === 0) {
        return [];
    }
    return [0xff, 0x10, 0xff];
}

/**
 * report interval configuration
 * @param {number} reporting_interval uint: second, range: [60, 64800]
 * @example { "reporting_interval": 1200 }
 */
function setReportingInterval(reporting_interval) {
    if (typeof reporting_interval !== "number") {
        throw new Error("reporting_interval must be a number");
    }
    if (reporting_interval < 60 || reporting_interval > 64800) {
        throw new Error("reporting_interval must be in the range of [60, 64800]");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x03);
    buffer.writeUInt16LE(reporting_interval);
    return buffer.toBytes();
}

/**
 * report status
 * @param {number} report_status values: (0: "no", 1: "yes")
 * @example { "report_status": 1 }
 */
function reportStatus(report_status) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(report_status) === -1) {
        throw new Error("report_status must be one of: " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, report_status) === 0) {
        return [];
    }
    return [0xff, 0x28, 0xff];
}

/**
 * report attribute
 * @param {number} report_attribute values: (0: "no", 1: "yes")
 * @example { "report_attribute": 1 }
 */
function reportAttribute(report_attribute) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(report_attribute) === -1) {
        throw new Error("report_attribute must be one of: " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, report_attribute) === 0) {
        return [];
    }
    return [0xff, 0x2c, 0xff];
}

/**
 * set led mode
 * @param {number} led_mode, values: (0: "disable", 1: "Enable (relay closed indicator off)")
 * @example { "led_mode": 1 }
 */
function setLedMode(led_mode) {
    var led_mode_map = { 0: "disable", 1: "Enable (relay closed indicator off)" };
    var led_mode_values = getValues(led_mode_map);
    if (led_mode_values.indexOf(led_mode) === -1) {
        throw new Error("led_mode must be one of: " + led_mode_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x2f);
    buffer.writeUInt8(getValue(led_mode_map, led_mode));
    return buffer.toBytes();
}

/**
 * button lock configuration
 * @param {object} button_lock_config
 * @param {number} button_lock_config.enable values: (0: "disable", 1: "enable")
 * @example { "button_lock_config": { "enable": 1 } }
 */
function setButtonLockConfig(button_lock_config) {
    var enable = button_lock_config.enable;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("button_lock_config.enable must be one of: " + enable_values.join(", "));
    }

    var data = 0x00;
    data |= getValue(enable_map, enable) << 15;
    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x25);
    buffer.writeUInt16LE(data);
    return buffer.toBytes();
}

/**
 * Button Status Control
 * @param {object} button_status_control
 * @param {number} button_status_control.button_status1 values: (0: "off", 1: "on")
 * @param {number} button_status_control.button_status1_change values: (0: "no", 1: "yes")
 * @example { "button_status_control": { "button_status1": 1, "button_status1_change": 1 } }
 */
function setSwitchControl(button_status_control) {
    var status_map = {0: "off", 1: "on"};
    var status_values = getValues(status_map);
    var status_change_map = {0: "no", 1: "yes"};
    var status_change_values = getValues(status_change_map);

    var data = 0x00;
    var switch_bit_offset = { button_status1: 0 };
    for (var key in switch_bit_offset) {
        if (key in button_status_control) {
            if (status_values.indexOf(button_status_control[key]) === -1) {
                throw new Error("button_status_control." + key + " must be one of: " + status_values.join(", "));
            }

            if (status_change_values.indexOf(button_status_control[key + '_change']) === -1) {
                throw new Error("button_status_control." + key + "_change must be one of: " + status_change_values.join(", "));
            }

            data |= getValue(status_change_map, button_status_control[key + '_change']) << (switch_bit_offset[key] + 4);
            data |= getValue(status_map, button_status_control[key]) << switch_bit_offset[key];
        }
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x29);
    buffer.writeUInt8(data);
    return buffer.toBytes();
}

/**
 * button reset configuration
 * @param {number} button_reset_config values: (0: "disable", 1: "enable")
 * @example { "button_reset_config": 1 }
 */
function setButtonResetConfig(button_reset_config) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(button_reset_config) === -1) {
        throw new Error("button_reset_config must be one of: " + enable_values.join(", "));
    }

    return [0xff, 0x5e, getValue(enable_map, button_reset_config)];
}

/**
 * power consumption enable
 * @param {number} power_consumption_3w values: (0: "disable", 1: "enable")
 * @example { "power_consumption_3w": 1 }
 */
function setPowerConsumptionEnable(power_consumption_3w) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(power_consumption_3w) === -1) {
        throw new Error("power_consumption_3w must be one of: " + enable_values.join(", "));
    }

    return [0xff, 0x26, getValue(enable_map, power_consumption_3w)];
}

/**
 * Power Consumption
 * @param {object} power_consumption_2w
 * @param {number} power_consumption_2w.enable values: (0: "disable", 1: "enable")
 * @param {number} power_consumption_2w.button_power1
 * @example { "power_consumption_2w": {"button_power1": 0 } }
 */
function setPowerConsumption(power_consumption_2w) {
    var enable = power_consumption_2w.enable;
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("power_consumption_2w.enable must be one of: " + enable_values.join(", "));
    }
    var powers = [ "button_power1" ];
    var buffer = new Buffer(9);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0xab);
    buffer.writeUInt8(getValue(enable_map, enable));
    for(var i = 0; i < powers.length; i++) {
        if (typeof power_consumption_2w[powers[i]] !== "number") {
            throw new Error("power_consumption_2w." + powers[i] + " must be a number");
        }
        if (power_consumption_2w[powers[i]] < 0 || power_consumption_2w[powers[i]] > 1100) {
            throw new Error("power_consumption_2w." + powers[i] + " must be in the range of [0, 1100]");
        }
        buffer.writeUInt16LE(power_consumption_2w[powers[i]]);
    }
    
    return buffer.toBytes();
}

/**
 * power consumption clear
 * @param {number} power_consumption_clear values: (0: "no", 1: "yes")
 * @example { "power_consumption_clear": 1 }
 */
function setPowerConsumptionClear(power_consumption_clear) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(power_consumption_clear) === -1) {
        throw new Error("power_consumption_clear must be one of: " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, power_consumption_clear) === 0) {
        return [];
    }

    return [0xff, 0x27, 0x01];
}

/**
 * set schedule settings
 * @param {object} schedule_settings
 * @param {number} schedule_settings.schedule_id range: [1, 16]
 * @param {number} schedule_settings.enable values: (0: "not config", 1: "enable", 2: "disable")
 * @param {number} schedule_settings.use_config values: (0: "no", 1: "yes")
 * @param {number} schedule_settings.monday values: (0: "disable", 1: "enable")
 * @param {number} schedule_settings.tuesday values: (0: "disable", 1: "enable")
 * @param {number} schedule_settings.wednesday values: (0: "disable", 1: "enable")
 * @param {number} schedule_settings.thursday values: (0: "disable", 1: "enable")
 * @param {number} schedule_settings.friday values: (0: "disable", 1: "enable")
 * @param {number} schedule_settings.saturday values: (0: "disable", 1: "enable")
 * @param {number} schedule_settings.sunday values: (0: "disable", 1: "enable")
 * @param {number} schedule_settings.execut_hour range: [0, 23]
 * @param {number} schedule_settings.execut_min range: [0, 59]
 * @param {number} schedule_settings.button_status1 values: (0: "keep", 1: "on", 2: "off", 3: "reversal")
 * @param {number} schedule_settings.lock_status values: (0: "keep", 1: "lock", 2: "unlock")
 * @example { "schedule_settings": [{ "schedule_id": 1, "enable": 1, "use_config": 1, "monday": 1, "tuesday": 0, "wednesday": 1, "thursday": 0, "friday": 1, "saturday": 0, "sunday": 1, "execut_hour": 10, "execut_min": 5, "button_status1": 1, "lock_status": 1 }] }
 */
function setScheduleSettings(schedule) {
    var schedule_id = schedule.schedule_id;
    var enable = schedule.enable;
    var use_config = schedule.use_config;
    var lock_status = schedule.lock_status;
    var execut_hour = schedule.execut_hour;
    var execut_min = schedule.execut_min;

    if (typeof schedule_id !== "number") {
        throw new Error("schedule_settings._item.schedule_id must be a number");
    }
    if (schedule_id < 1 || schedule_id > 16) {
        throw new Error("schedule_settings._item.schedule_id must be in range [1, 16]");
    }
    var enable_map = { 0: "not config", 1: "enable", 2: "disable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("schedule_settings._item.enable must be one of " + enable_values.join(", "));
    }
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(use_config) === -1) {
        throw new Error("schedule_settings._item.use_config must be one of " + yes_no_values.join(", "));
    }
    var week_day_bits_offset = { monday: 0, tuesday: 1, wednesday: 2, thursday: 3, friday: 4, saturday: 5, sunday: 6 };
    var days = 0x00;
    var enable_map_2 = { 0: "disable", 1: "enable" };
    var enable_values_2 = getValues(enable_map_2);
    for (var day in week_day_bits_offset) {
        if (enable_values_2.indexOf(schedule[day]) === -1) {
            throw new Error("schedule_settings._item." + day + " must be one of " + enable_values_2.join(", "));
        }
        days |= getValue(enable_map_2, schedule[day]) << week_day_bits_offset[day];
    }
    var switch_bit_offset = { button_status1: 0 };
    var switch_state_map = {0: "keep", 1: "on", 2: "off", 3: "reversal"};
    var switch_state_values = getValues(switch_state_map);
    var switchs = 0x00;
    for (var switch_state in switch_bit_offset) {
        if (switch_state_values.indexOf(schedule[switch_state]) === -1) {
            throw new Error("schedule_settings._item." + switch_state + " must be one of " + switch_state_values.join(", "));
        }
        switchs |= getValue(switch_state_map, schedule[switch_state]) << switch_bit_offset[switch_state];
    }
    var lock_status_map = {0: "keep", 1: "lock", 2: "unlock"};
    var lock_status_values = getValues(lock_status_map);
    if (lock_status_values.indexOf(lock_status) === -1) {
        throw new Error("schedule_settings._item.lock_status must be one of: " + lock_status_values.join(", "));
    }
    if(typeof execut_hour !== "number") {
        throw new Error("schedule_settings._item.execut_hour must be a number");
    }
    if(execut_hour < 0 || execut_hour > 23) {
        throw new Error("schedule_settings._item.execut_hour must be in range [0, 23]");
    }
    if(typeof execut_min !== "number") {
        throw new Error("schedule_settings._item.execut_min must be a number");
    }
    if(execut_min < 0 || execut_min > 59) {
        throw new Error("schedule_settings._item.execut_min must be in range [0, 59]");
    }

    var buffer = new Buffer(7);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x64);
    buffer.writeUInt8(schedule_id);
    var schedule_option = 0x00;
    schedule_option |= getValue(enable_map, enable);
    schedule_option |= getValue(yes_no_map, use_config) << 4;
    buffer.writeUInt8(schedule_option);
    buffer.writeUInt8(days);
    buffer.writeUInt8(execut_hour);
    buffer.writeUInt8(execut_min);
    buffer.writeUInt8(switchs);
    buffer.writeUInt8(getValue(lock_status_map, lock_status));
    return buffer.toBytes();
}

/**
 * get local rule
 * @param {object} get_schedule
 * @param {number | string} get_schedule.schedule_id range: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,"all schedules"]
 * @example { "get_schedule": {"schedule_id": 1} }
 */
function setGetLocalRule(get_schedule) {
    var schedule_id = get_schedule.schedule_id;
    var task_id_values = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,"all schedules"];

    if(task_id_values.indexOf(schedule_id) === -1) {
        throw new Error("get_schedule.schedule_id must be one of: " + task_id_values.join(", "));
    }

    var data = (schedule_id === "all schedules") ? 0xff : (schedule_id & 0xff);
    return [0xf9, 0x65, data];
}

/**
 * overcurrent alarm configuration
 * @param {object} overcurrent_alarm_config
 * @param {number} overcurrent_alarm_config.enable values: (0: "disable", 1: "enable")
 * @param {number} overcurrent_alarm_config.threshold range: [1, 10]
 * @example { "overcurrent_alarm_config": {"enable": 1, "threshold": 10} }
 */
function setOvercurrentAlarmConfig(overcurrent_alarm_config) {
    var enable = overcurrent_alarm_config.enable;
    var threshold = overcurrent_alarm_config.threshold;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("anti_flash_mode.enable must be one of " + enable_values.join(", "));
    }
    if(typeof threshold !== "number") {
        throw new Error("overcurrent_alarm_config.threshold must be a number");
    }
    if(threshold < 1 || threshold > 10) {
        throw new Error("overcurrent_alarm_config.threshold must be in range [1, 10]");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x24);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt8(threshold);
    return buffer.toBytes();
}

/**
 * overcurrent protection
 * @param {object} overcurrent_protection
 * @param {number} overcurrent_protection.enable values: (0: "disable", 1: "enable")
 * @param {number} overcurrent_protection.threshold range: [1, 10]
 * @example { "overcurrent_protection": {"enable": 1, "threshold": 10} }
 */
function setOvercurrentProtection(overcurrent_protection) {
    var enable = overcurrent_protection.enable;
    var threshold = overcurrent_protection.threshold;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("overcurrent_protection.enable must be one of " + enable_values.join(", "));
    }
    if(typeof threshold !== "number") {
        throw new Error("overcurrent_protection.threshold must be a number");
    }
    if(threshold < 1 || threshold > 10) {
        throw new Error("overcurrent_protection.threshold must be in range [1, 10]");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x30);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt8(threshold);
    return buffer.toBytes();
}

/**
 * highcurrent configuration
 * @param {number} highcurrent_config values: (0: "disable", 1: "enable")
 * @example { "highcurrent_config": 1 }
 */
function setHighcurrentConfig(highcurrent_config) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(highcurrent_config) === -1) {
        throw new Error("highcurrent_config must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x8d);
    buffer.writeUInt8(getValue(enable_map, highcurrent_config));
    return buffer.toBytes();
}

/**
 * power switch mode
 * @param {number} power_switch_mode values: (0: "off", 1: "on", 2: "keep")
 * @example { "power_switch_mode": 1 }
 */
function setPowerSwitchMode(power_switch_mode) {
    var mode_map = {0: "off", 1: "on", 2: "keep"};
    var mode_values = getValues(mode_map);
    if (mode_values.indexOf(power_switch_mode) === -1) {
        throw new Error("power_switch_mode must be one of " + mode_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x67);
    buffer.writeUInt8(getValue(mode_map, power_switch_mode));
    return buffer.toBytes();
}

/**
 * Time Synchronize
 * @param {number} time_synchronize values: (0: "no", 1: "yes")
 * @example { "time_synchronize": 0 }
 */
function setTimeSynchronize(time_synchronize) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(time_synchronize) === -1) {
        throw new Error("time_synchronize must be one of: " + yes_no_values.join(", "));
    }
    if (getValue(yes_no_map, time_synchronize) === 0) {
        return [];
    }

    return [0xff, 0x4a, 0x00];
}

/**
 * D2D Settings
 * @param {object, object} d2d_settings
 * @param {number} d2d_settings.d2d_controller_enable values: (0: "disable", 1: "enable")
 * @param {number} d2d_settings.d2d_controller_enable_change values: (0: "no", 1: "yes")
 * @param {number} d2d_settings.d2d_agent_enable values: (0: "disable", 1: "enable")
 * @param {number} d2d_settings.d2d_agent_enable_change values: (0: "no", 1: "yes")
 * @example { "d2d_settings": {"d2d_controller_enable": 0, "d2d_controller_enable_change": 0, "d2d_agent_enable": 0, "d2d_agent_enable_change": 0} }
 */
function setD2DGlobalEnable(d2d_settings) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    var d2d_controller_enable = d2d_settings.d2d_controller_enable;
    var d2d_agent_enable = d2d_settings.d2d_agent_enable;
    var d2d_controller_enable_change = d2d_settings.d2d_controller_enable_change;
    var d2d_agent_enable_change = d2d_settings.d2d_agent_enable_change;

    if (enable_values.indexOf(d2d_controller_enable) === -1) {
        throw new Error("d2d_settings.d2d_controller_enable must be one of " + enable_values.join(", "));
    }
    if (enable_values.indexOf(d2d_agent_enable) === -1) {
        throw new Error("d2d_settings.d2d_agent_enable must be one of " + enable_values.join(", "));
    }
    if (yes_no_values.indexOf(d2d_controller_enable_change) === -1) {
        throw new Error("d2d_settings.d2d_controller_enable_change must be one of " + yes_no_values.join(", "));
    }
    if (yes_no_values.indexOf(d2d_agent_enable_change) === -1) {
        throw new Error("d2d_settings.d2d_agent_enable_change must be one of " + yes_no_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xc7);
    var data = 0x00;
    data |= getValue(enable_map, d2d_controller_enable);
    data |= getValue(yes_no_map, d2d_controller_enable_change) << 4;
    data |= getValue(enable_map, d2d_agent_enable) << 1;
    data |= getValue(yes_no_map, d2d_agent_enable_change) << 5;
    
    buffer.writeUInt8(data);
    return buffer.toBytes(); 
}

/**
 * D2D Agent Settings
 * @param {object} d2d_agent_settings_array
 * @param {number} d2d_agent_settings_array.number range: [0, 15]
 * @param {number} d2d_agent_settings_array.enable values: (0: "disable", 1: "enable")
 * @param {string} d2d_agent_settings_array.control_command
 * @param {number} d2d_agent_settings_array.action_status.button values: (1: "button1")
 * @param {number} d2d_agent_settings_array.action_status.button_status values: (0: "off", 1: "on", 2: "reversel")
 * @example { "d2d_agent_settings_array": [{"number": 0, "enable": 1, "control_command": "0000", "action_status": {"button": 1, "button_status": 1}}] }
 */
function setD2DAgentSettings(d2d_agent_settings) {
    var number = d2d_agent_settings.number;
    var enable = d2d_agent_settings.enable;
    var control_command = d2d_agent_settings.control_command;
    var buttons = d2d_agent_settings.action_status.button;
    var button_status = d2d_agent_settings.action_status.button_status;

    if (typeof number !== "number") {
        throw new Error("d2d_agent_settings_array._item.number must be a number");
    }
    if (number < 0 || number > 15) {
        throw new Error("d2d_agent_settings_array._item.number must be in range [0, 15]");
    }
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("d2d_agent_settings_array._item.enable must be one of " + enable_values.join(", "));
    }
    var button_map = {1: "button1"};
    var button_values = getValues(button_map);
    if (button_values.indexOf(buttons) === -1) {
        throw new Error("d2d_agent_settings_array._item.action_status.button must be one of " + button_values.join(", "));
    }
    var button_status_map = {0: "off", 1: "on", 2: "reversel"};
    var button_status_values = getValues(button_status_map);
    if (button_status_values.indexOf(button_status) === -1) {
        throw new Error("d2d_agent_settings_array._item.action_status.button_status must be one of " + button_status_values.join(", "));
    }

    var buffer = new Buffer(7);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x83);
    buffer.writeUInt8(number);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeD2DCommand(control_command, "0000");
    var data = 0x00;
    data |= getValue(button_status_map, button_status);
    data |= getValue(button_map, buttons) << 4;
    buffer.writeUInt8(data);
    return buffer.toBytes();
}

/**
 *  D2D Controller Settings
 * @param {object} d2d_controller_settings_array
 * @param {number} d2d_controller_settings_array.button_id values: (0: "button1")
 * @param {number} d2d_controller_settings_array.contrl_enable values: (0: "disable", 1: "enable")
 * @param {number} d2d_controller_settings_array.uplink.lora_enable values: (0: "disable", 1: "enable")
 * @param {number} d2d_controller_settings_array.uplink.button_enable values: (0: "disable", 1: "enable")
 * @param {string} d2d_controller_settings_array.contrl_cmd
 * @example { "d2d_controller_settings_array": [{"button_id": 0, "contrl_enable": 1, "uplink": { "lora_enable": 1, "button_enable": 1 }, "contrl_cmd": "0000"}] }
 */
function setD2DControllerSettings(d2d_controller_settings) {
    var button_id = d2d_controller_settings.button_id;
    var enable = d2d_controller_settings.contrl_enable;
    var lora_enable = d2d_controller_settings.uplink.lora_enable;
    var button_enable = d2d_controller_settings.uplink.button_enable;
    var contrl_cmd = d2d_controller_settings.contrl_cmd;

    var button_id_map = { 0: "button1" };
    var button_id_values = getValues(button_id_map);
    if (button_id_values.indexOf(button_id) === -1) {
        throw new Error("d2d_controller_settings_array._item.button_id must be one of " + button_id_values.join(", "));
    }
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("d2d_controller_settings_array._item.contrl_enable must be one of " + enable_values.join(", "));
    }
    if (enable_values.indexOf(lora_enable) === -1) {
        throw new Error("d2d_controller_settings_array._item.uplink.lora_enable must be one of " + enable_values.join(", "));
    }
    if (enable_values.indexOf(button_enable) === -1) {
        throw new Error("d2d_controller_settings_array._item.uplink.button_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(7);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0xb8);
    buffer.writeUInt8(getValue(button_id_map, button_id));
    buffer.writeUInt8(getValue(enable_map, enable));
    var data = 0x00;
    data |= getValue(enable_map, lora_enable);
    data |= getValue(enable_map, button_enable) << 1;
    buffer.writeUInt8(data);
    buffer.writeD2DCommand(contrl_cmd);
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
 * @param {object} daylight_saving_time
 * @param {number} daylight_saving_time.enable values: (0: disable, 1: enable)
 * @param {number} daylight_saving_time.dst_bias, unit: minute range: [1, 120]
 * @param {number} daylight_saving_time.start_month, values: (1: Jan., 2: Feb., 3: Mar., 4: Apr., 5: May, 6: Jun., 7: Jul., 8: Aug., 9: Sep., 10: Oct., 11: Nov., 12: Dec.)
 * @param {number} daylight_saving_time.start_week_num, values: (1: "1st", 2: "2nd", 3: "3rd", 4: "4th", 5: "last")
 * @param {number} daylight_saving_time.start_week_day, values: (1: "Mon.", 2: "Tues.", 3: "Wed.", 4: "Thurs.", 5: "Fri.", 6: "Sat.", 7: "Sun.")
 * @param {number} daylight_saving_time.start_hour_min, unit: minute, convert: "hh:mm" -> "hh * 60 + mm" values: (0: "00:00", 60: "01:00", 120: "02:00", 180: "03:00", 240: "04:00", 300: "05:00", 360: "06:00", 420: "07:00", 480: "08:00", 540: "09:00", 600: "10:00", 660: "11:00", 720: "12:00", 780: "13:00", 840: "14:00", 900: "15:00", 960: "16:00", 1020: "17:00", 1080: "18:00", 1140: "19:00", 1200: "20:00", 1260: "21:00", 1320: "22:00", 1380: "23:00")
 * @param {number} daylight_saving_time.end_month, values: (1: Jan., 2: Feb., 3: Mar., 4: Apr., 5: May, 6: Jun., 7: Jul., 8: Aug., 9: Sep., 10: Oct., 11: Nov., 12: Dec.)
 * @param {number} daylight_saving_time.end_week_num, values: (1: "1st", 2: "2nd", 3: "3rd", 4: "4th", 5: "last")
 * @param {number} daylight_saving_time.end_week_day, values: (1: "Mon.", 2: "Tues.", 3: "Wed.", 4: "Thurs.", 5: "Fri.", 6: "Sat.", 7: "Sun.")
 * @param {number} daylight_saving_time.end_hour_min, unit: minute, convert: "hh:mm" -> "hh * 60 + mm" values: (0: "00:00", 60: "01:00", 120: "02:00", 180: "03:00", 240: "04:00", 300: "05:00", 360: "06:00", 420: "07:00", 480: "08:00", 540: "09:00", 600: "10:00", 660: "11:00", 720: "12:00", 780: "13:00", 840: "14:00", 900: "15:00", 960: "16:00", 1020: "17:00", 1080: "18:00", 1140: "19:00", 1200: "20:00", 1260: "21:00", 1320: "22:00", 1380: "23:00")
 * @example { "daylight_saving_time": { "enable": 1, "dst_bias": 60, "start_month": 3, "start_week_num": 2, "start_week_day": 7, "start_hour_min": 120, "end_month": 1, "end_week_num": 4, "end_week_day": 1, "end_hour_min": 180 } } output: F972BC032778000141B400
 */
function setDaylightSavingTime(daylight_saving_time) {
    var enable = daylight_saving_time.enable;
    var offset = daylight_saving_time.dst_bias;
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
        throw new Error("daylight_saving_time.enable must be one of " + enable_values.join(", "));
    }
    if (typeof offset !== "number") {
        throw new Error("daylight_saving_time.dst_bias must be a number");
    }
    if (offset < 1 || offset > 120) {
        throw new Error("daylight_saving_time.dst_bias must be in range [1, 120]");
    }

    var week_num_map = { 1: "1st", 2: "2nd", 3: "3rd", 4: "4th", 5: "last" };
    var week_day_map = { 1: "Mon.", 2: "Tues.", 3: "Wed.", 4: "Thurs.", 5: "Fri.", 6: "Sat.", 7: "Sun." };
    var month_map = { 1: "Jan.", 2: "Feb.", 3: "Mar.", 4: "Apr.", 5: "May.", 6: "Jun.", 7: "Jul.", 8: "Aug.", 9: "Sep.", 10: "Oct.", 11: "Nov.", 12: "Dec." };
    var hour_min_map = { 0: "00:00", 60: "01:00", 120: "02:00", 180: "03:00", 240: "04:00", 300: "05:00", 360: "06:00", 420: "07:00", 480: "08:00", 540: "09:00", 600: "10:00", 660: "11:00", 720: "12:00", 780: "13:00", 840: "14:00", 900: "15:00", 960: "16:00", 1020: "17:00", 1080: "18:00", 1140: "19:00", 1200: "20:00", 1260: "21:00", 1320: "22:00", 1380: "23:00" };
    var week_num_values = getValues(week_num_map);
    var week_day_values = getValues(week_day_map);
    var month_values = getValues(month_map);
    var hour_min_values = getValues(hour_min_map);
    var enable_value = getValue(enable_map, enable);

    if (enable_value && week_num_values.indexOf(start_week_num) === -1) {
        throw new Error("daylight_saving_time.start_week_num must be one of " + week_num_values.join(", "));
    }
    if (enable_value && week_day_values.indexOf(start_week_day) === -1) {
        throw new Error("daylight_saving_time.start_week_day must be one of " + week_day_values.join(", "));
    }
    if (enable_value && week_num_values.indexOf(end_week_num) === -1) {
        throw new Error("daylight_saving_time.end_week_num must be one of " + week_num_values.join(", "));
    }
    if (enable_value && week_day_values.indexOf(end_week_day) === -1) {
        throw new Error("daylight_saving_time.end_week_day must be one of " + week_day_values.join(", "));
    }
    if (enable_value && month_values.indexOf(start_month) === -1) {
        throw new Error("daylight_saving_time.start_month must be one of " + month_values.join(", "));
    }
    if (enable_value && month_values.indexOf(end_month) === -1) {
        throw new Error("daylight_saving_time.end_month must be one of " + month_values.join(", "));
    }
    if (enable_value && hour_min_values.indexOf(start_hour_min) === -1) {
        throw new Error("daylight_saving_time.start_hour_min must be one of " + hour_min_values.join(", "));
    }
    if (enable_value && hour_min_values.indexOf(end_hour_min) === -1) {
        throw new Error("daylight_saving_time.end_hour_min must be one of " + hour_min_values.join(", "));
    }

    var data = 0x00;
    data |= enable_value << 7;
    data |= offset;

    var buffer = new Buffer(11);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x72);
    buffer.writeUInt8(data);
    buffer.writeUInt8(getValue(month_map, start_month));
    buffer.writeUInt8((getValue(week_num_map, start_week_num) << 4) | getValue(week_day_map, start_week_day));
    buffer.writeUInt16LE(getValue(hour_min_map, start_hour_min));
    buffer.writeUInt8(getValue(month_map, end_month));
    buffer.writeUInt8((getValue(week_num_map, end_week_num) << 4) | getValue(week_day_map, end_week_day));
    buffer.writeUInt16LE(getValue(hour_min_map, end_hour_min));
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
        throw new Error("d2d_agent_command length must be 4");
    }
    this.buffer[this.offset] = parseInt(value.substr(2, 2), 16);
    this.buffer[this.offset + 1] = parseInt(value.substr(0, 2), 16);
    this.offset += 2;
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
