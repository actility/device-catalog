/**
 * Payload Decoder
 *
 * Copyright 2024 Milesight IoT
 *
 * @product VS360
 */
var RAW_VALUE = 0x00;

// The Things Network
function Decoder(bytes, port) {
    return milesightDeviceDecode(bytes);
}

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
        // BATTERY(MAIN)
        else if (channel_id === 0x01 && channel_type === 0x75) {
            decoded.battery_main = bytes[i];
            i += 1;
        }
        // BATTERY(NODE)
        else if (channel_id === 0x02 && channel_type === 0x75) {
            decoded.battery_node = bytes[i];
            i += 1;
        }
        // EVENT
        else if (channel_id === 0x03 && channel_type === 0xf4) {
            var data = {};
            data.type = readEventType(bytes[i]);
            data.status = readEventStatus(bytes[i + 1]);

            decoded.event = decoded.event || [];
            decoded.event.push(data);
            i += 2;
        }
        // TOTAL IN / OUT
        else if (channel_id === 0x04 && channel_type === 0xcc) {
            decoded.total_in = readUInt16LE(bytes.slice(i, i + 2));
            decoded.total_out = readUInt16LE(bytes.slice(i + 2, i + 4));
            i += 4;
        }
        // PERIOD IN / OUT
        else if (channel_id === 0x05 && channel_type === 0xcc) {
            decoded.period_in = readUInt16LE(bytes.slice(i, i + 2));
            decoded.period_out = readUInt16LE(bytes.slice(i + 2, i + 4));
            i += 4;
        }
        // TOTAL IN / OUT ALARM
        else if (channel_id === 0x84 && channel_type === 0xcc) {
            decoded.total_in = readUInt16LE(bytes.slice(i, i + 2));
            decoded.total_out = readUInt16LE(bytes.slice(i + 2, i + 4));
            decoded.total_count_alarm = readAlarmType(bytes[i + 4]);
            i += 5;
        }
        // PERIOD IN / OUT ALARM
        else if (channel_id === 0x85 && channel_type === 0xcc) {
            decoded.period_in = readUInt16LE(bytes.slice(i, i + 2));
            decoded.period_out = readUInt16LE(bytes.slice(i + 2, i + 4));
            decoded.period_count_alarm = readAlarmType(bytes[i + 4]);
            i += 5;
        }
        // HISTORICAL DATA
        else if (channel_id === 0x20 && channel_type === 0xce) {
            var data = {};
            var timestamp = readUInt32LE(bytes.slice(i, i + 4));
            var type = bytes[i + 4];
            // historical data without total in/out
            if (type === 0) {
                data.timestamp = timestamp;
                data.period_in = readUInt16LE(bytes.slice(i + 5, i + 7));
                data.period_out = readUInt16LE(bytes.slice(i + 7, i + 9));
                i += 9;
            }
            // historical data with total in/out
            else if (type === 1) {
                data.timestamp = timestamp;
                data.period_in = readUInt16LE(bytes.slice(i + 5, i + 7));
                data.period_out = readUInt16LE(bytes.slice(i + 7, i + 9));
                data.total_in = readUInt16LE(bytes.slice(i + 9, i + 11));
                data.total_out = readUInt16LE(bytes.slice(i + 11, i + 13));
                i += 13;
            }

            decoded.history = decoded.history || [];
            decoded.history.push(data);
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
        }
        else {
            break;
        }
    }

    return decoded;
}

function handle_downlink_response(channel_type, bytes, offset) {
    var decoded = {};

    switch (channel_type) {
        case 0x06:
            decoded.alarm_config = readAlarmConfig(bytes.slice(offset, offset + 9));
            offset += 9;
            break;
        case 0x10:
            decoded.reboot = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x28:
            decoded.report_status = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x35:
            decoded.d2d_key = readHexString(bytes.slice(offset, offset + 8));
            offset += 8;
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
        case 0x6a:
            var data = readUInt8(bytes[offset]);
            if (data === 0x00) {
                decoded.retransmit_interval = readUInt16LE(bytes.slice(offset + 1, offset + 3));
            } else if (data === 0x01) {
                decoded.resend_interval = readUInt16LE(bytes.slice(offset + 1, offset + 3));
            }
            offset += 3;
            break;
        case 0x6d:
            decoded.stop_transmit = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x75:
            decoded.hibernate_config = {};
            decoded.hibernate_config.enable = readEnableStatus(bytes[offset]);
            decoded.hibernate_config.start_time = readUInt16LE(bytes.slice(offset + 1, offset + 3));
            decoded.hibernate_config.end_time = readUInt16LE(bytes.slice(offset + 3, offset + 5));
            decoded.hibernate_config.weekdays = readWeekdays(readUInt8(bytes[offset + 5]));
            offset += 6;
            break;
        case 0x84:
            decoded.d2d_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x8e:
            // skip the first byte
            decoded.report_interval = readUInt16LE(bytes.slice(offset + 1, offset + 3));
            offset += 3;
            break;
        case 0x96:
            var d2d_master_config = {};
            d2d_master_config.mode = readD2DMode(readUInt8(bytes[offset]));
            d2d_master_config.enable = readEnableStatus(bytes[offset + 1]);
            d2d_master_config.lora_uplink_enable = readEnableStatus(bytes[offset + 2]);
            d2d_master_config.d2d_cmd = readD2DCommand(bytes.slice(offset + 3, offset + 5));
            d2d_master_config.time = readUInt16LE(bytes.slice(offset + 5, offset + 7));
            d2d_master_config.time_enable = readEnableStatus(bytes[offset + 7]);
            offset += 8;
            decoded.d2d_master_config = decoded.d2d_master_config || [];
            decoded.d2d_master_config.push(d2d_master_config);
            break;
        case 0xa6:
            decoded.clear_cumulative_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0xa9:
            decoded.cumulative_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0xbd:
            decoded.timezone = readTimeZone(readInt16LE(bytes.slice(offset, offset + 2)));
            offset += 2;
            break;
        case 0xa6:
            decoded.cumulative_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0xa8:
            var data = readUInt8(bytes[offset]);
            if (data === 0x01) {
                decoded.clear_cumulative_in = readYesNoStatus(1);
            } else if (data === 0x02) {
                decoded.clear_cumulative_out = readYesNoStatus(1);
            }
            offset += 1;
            break;
        case 0xed:
            decoded.cumulative_reset_config = {};
            decoded.cumulative_reset_config.weekday = readWeekday(readUInt8(bytes.slice(offset, offset + 1)));
            decoded.cumulative_reset_config.hour = readUInt8(bytes.slice(offset + 1, offset + 2));
            decoded.cumulative_reset_config.minute = readUInt8(bytes.slice(offset + 2, offset + 3));
            offset += 3;
            break;
        case 0xfc:
            decoded.counting_mode = readCountingMode(bytes[offset]);
            offset += 1;
            break;
        case 0xfd:
            decoded.led_enable = readEnableStatus(bytes[offset]);
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
        case 0x00:
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
    var major = bytes[0] & 0xff;
    var minor = (bytes[1] & 0xff) >> 4;
    return "v" + major + "." + minor;
}

function readFirmwareVersion(bytes) {
    var major = bytes[0] & 0xff;
    var minor = bytes[1] & 0xff;
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

function readEnableStatus(status) {
    var status_map = { 0: "disable", 1: "enable" };
    return getValue(status_map, status);
}

function readYesNoStatus(status) {
    var status_map = { 0: "no", 1: "yes" };
    return getValue(status_map, status);
}

function readAlarmType(type) {
    var alarm_map = { 1: "threshold_alarm" }
    return getValue(alarm_map, type);
}

function readEventType(type) {
    var event_type = { 0: "counting_anomaly", 1: "node_device_without_response", 2: "devices_misaligned" }
    return getValue(event_type, type);
}

function readEventStatus(status) {
    var event_status = { 0: "alarm_release", 1: "alarm" }
    return getValue(event_status, status);
}

function readTimeZone(timezone) {
    var timezone_map = {
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
    return getValue(timezone_map, timezone);
}

function readWeekday(weekday) {
    var weekday_map = { 0: "everyday", 1: "sunday", 2: "monday", 3: "tuesday", 4: "wednesday", 5: "thursday", 6: "friday", 7: "saturday" }
    return getValue(weekday_map, weekday);
}

function readCountingMode(mode) {
    var mode_map = { 2: "high_mode", 3: "low_mode" }
    return getValue(mode_map, mode);
}

function readWeekdays(weekdays) {
    var weekdays_list = [];
    for (var i = 0; i < 7; i++) {
        if ((weekdays >> i) & 0x01) {
            weekdays_list.push(i + 1);
        }
    }
    return weekdays_list;
}

function readD2DMode(mode) {
    var mode_map = { 1: "someone_enter", 2: "someone_leave", 3: "counting_threshold_alarm" }
    return getValue(mode_map, mode);
}


function readAlarmConfig(bytes) {
    var offset = 0;

    var alarm_config = {};
    var data = readUInt8(bytes[offset]);
    alarm_config.enable = readEnableStatus((data >> 6) & 0x03);
    alarm_config.condition = readConditionType(data & 0x07);
    alarm_config.trigger_source = readTriggerSourceType((data >> 3) & 0x07);
    alarm_config.min_threshold = readUInt16LE(bytes.slice(offset + 1, offset + 3));
    alarm_config.max_threshold = readUInt16LE(bytes.slice(offset + 3, offset + 5));
    alarm_config.lock_time = readUInt16LE(bytes.slice(offset + 5, offset + 7));
    alarm_config.continue_time = readUInt16LE(bytes.slice(offset + 7, offset + 9));
    offset += 9;

    return alarm_config;
}

function readConditionType(type) {
    var condition_map = { 0: "disable", 1: "below", 2: "above", 3: "between", 4: "outside" };
    return getValue(condition_map, type);
}

function readTriggerSourceType(type) {
    var trigger_source_map = { 1: "period_count", 2: "total_count" };
    return getValue(trigger_source_map, type);
}

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

function readHexString(bytes) {
    var temp = [];
    for (var i = 0; i < bytes.length; i++) {
        temp.push(("0" + (bytes[i] & 0xff).toString(16)).slice(-2));
    }
    return temp.join("");
}

function readD2DCommand(bytes) {
    return ("0" + (bytes[1] & 0xff).toString(16)).slice(-2) + ("0" + (bytes[0] & 0xff).toString(16)).slice(-2);
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

function decodeUplink(input) {
    var decoded = milesightDeviceDecode(input.bytes);
    return { data: decoded };
}

function decodeDownlink(input) {
    var decoded = milesightDeviceDecode(input.bytes);
    return { data: decoded };
}

var __milesightDownlinkCodec = (function () {
/**
 * Payload Encoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product VS360
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
    if ("report_type" in payload) {
        encoded = encoded.concat(setReportType(payload.report_type));
    }
    if ("sync_time" in payload) {
        encoded = encoded.concat(syncTime(payload.sync_time));
    }
    if ("time_zone" in payload) {
        encoded = encoded.concat(setTimeZone(payload.time_zone));
    }
    if ("report_cumulative_enable" in payload) {
        encoded = encoded.concat(setCumulativeEnable(payload.report_cumulative_enable));
    }
    if ("reset_cumulative_enable" in payload) {
        encoded = encoded.concat(setClearCumulativeEnable(payload.reset_cumulative_enable));
    }
    if ("reset_cumulative_schedule_config" in payload) {
        encoded = encoded.concat(setCumulativeResetConfig(payload.reset_cumulative_schedule_config));
    }
    if ("reset_cumulative_in" in payload) {
        encoded = encoded.concat(clearCumulativeIn(payload.reset_cumulative_in));
    }
    if ("reset_cumulative_out" in payload) {
        encoded = encoded.concat(clearCumulativeOut(payload.reset_cumulative_out));
    }
    if ("counting_mode" in payload) {
        encoded = encoded.concat(setCountingMode(payload.counting_mode));
    }
    if ("led_indicator_enable" in payload) {
        encoded = encoded.concat(setLedEnable(payload.led_indicator_enable));
    }
    if ("hibernate_config" in payload) {
        encoded = encoded.concat(setHibernateConfig(payload.hibernate_config));
    }
    if ("d2d_key" in payload) {
        encoded = encoded.concat(setD2DKey(payload.d2d_key));
    }
    if ("d2d_enable" in payload) {
        encoded = encoded.concat(setD2DEnable(payload.d2d_enable));
    }
    if ("d2d_master_config" in payload) {
        for (var i = 0; i < payload.d2d_master_config.length; i++) {
            var config = payload.d2d_master_config[i];
            encoded = encoded.concat(setD2DMasterConfig(config));
        }
    }
    if ("people_period_alarm_config" in payload) {
        encoded = encoded.concat(setPeoplePeriodAlarmSettings(payload.people_period_alarm_config));
    }
    if ("people_cumulative_alarm_config" in payload) {
        encoded = encoded.concat(setPeopleCumulativeAlarmSettings(payload.people_cumulative_alarm_config));
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
    if ("fetch_history" in payload) {
        encoded = encoded.concat(fetchHistory(payload.fetch_history));
    }
    if ("stop_transmit" in payload) {
        encoded = encoded.concat(stopTransmit(payload.stop_transmit));
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
 * set report type
 * @param {number} report_type values: (0: period, 1: immediately)
 * @example { "report_type": 0 }
 */
function setReportType(report_type) {
    var report_type_map = { 0: "period", 1: "immediately" };
    var report_type_values = getValues(report_type_map);
    if (report_type_values.indexOf(report_type) === -1) {
        throw new Error("report_type must be one of " + report_type_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x10);
    buffer.writeUInt8(getValue(report_type_map, report_type));
    return buffer.toBytes();
}

/**
 * sync time
 * @param {number} sync_time values：(0: no, 1: yes)
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
 * set cumulative enable
 * @param {number} report_cumulative_enable values: (0: no, 1: yes)
 * @example { "report_cumulative_enable": 1 }
 */
function setCumulativeEnable(report_cumulative_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(report_cumulative_enable) === -1) {
        throw new Error("report_cumulative_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xa9);
    buffer.writeUInt8(getValue(enable_map, report_cumulative_enable));
    return buffer.toBytes();
}

/**
 * set clear cumulative enable
 * @param {number} reset_cumulative_enable values: (0: disable, 1: enable)
 * @example { "reset_cumulative_enable": 1 }
 */
function setClearCumulativeEnable(reset_cumulative_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(reset_cumulative_enable) === -1) {
        throw new Error("reset_cumulative_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xa6);
    buffer.writeUInt8(getValue(enable_map, reset_cumulative_enable));
    return buffer.toBytes();
}

/**
 * set cumulative reset config
 * @param {object} reset_cumulative_schedule_config
 * @param {number} reset_cumulative_schedule_config.weekday values: (0: everyday, 1: sunday, 2: monday, 3: tuesday, 4: wednesday, 5: thursday, 6: friday, 7: saturday)
 * @param {number} reset_cumulative_schedule_config.hour values: (0-23)
 * @param {number} reset_cumulative_schedule_config.minute values: (0-59)
 * @example { "reset_cumulative_schedule_config": { "weekday": 0, "hour": 0, "minute": 0 } }
 */
function setCumulativeResetConfig(reset_cumulative_schedule_config) {
    var weekday = reset_cumulative_schedule_config.weekday;
    var hour = reset_cumulative_schedule_config.hour;
    var minute = reset_cumulative_schedule_config.minute;

    var weekday_map = { 0: "everyday", 1: "sunday", 2: "monday", 3: "tuesday", 4: "wednesday", 5: "thursday", 6: "friday", 7: "saturday" };
    var weekday_values = getValues(weekday_map);
    if (weekday_values.indexOf(weekday) === -1) {
        throw new Error("reset_cumulative_schedule_config.weekday must be one of " + weekday_values.join(", "));
    }
    if (typeof hour !== "number" || hour < 0 || hour > 23) {
        throw new Error("reset_cumulative_schedule_config.hour must be a number in range [0, 23]");
    }
    if (typeof minute !== "number" || minute < 0 || minute > 59) {
        throw new Error("reset_cumulative_schedule_config.minute must be a number in range [0, 59]");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xed);
    buffer.writeUInt8(getValue(weekday_map, weekday));
    buffer.writeUInt8(hour);
    buffer.writeUInt8(minute);
    return buffer.toBytes();
}

/**
 * clear cumulative
 * @param {number} reset_cumulative_in values: (0: no, 1: yes)
 * @example { "reset_cumulative_in": 1 }
 */
function clearCumulativeIn(reset_cumulative_in) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(reset_cumulative_in) === -1) {
        throw new Error("reset_cumulative_in must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, reset_cumulative_in) === 0) {
        return [];
    }
    return [0xff, 0xa8, 0x01];
}

/**
 * clear cumulative
 * @param {number} reset_cumulative_out values: (0: no, 1: yes)
 * @example { "reset_cumulative_out": 1 }
 */
function clearCumulativeOut(reset_cumulative_out) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(reset_cumulative_out) === -1) {
        throw new Error("reset_cumulative_out must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, reset_cumulative_out) === 0) {
        return [];
    }
    return [0xff, 0xa8, 0x02];
}

/**
 * set counting mode
 * @param {number} counting_mode values: (2: high_mode, 3: low_mode)
 * @example { "counting_mode": 2 }
 */
function setCountingMode(counting_mode) {
    var counting_mode_map = { 2: "high_mode", 3: "low_mode" };
    var counting_mode_values = getValues(counting_mode_map);
    if (counting_mode_values.indexOf(counting_mode) === -1) {
        throw new Error("counting_mode must be one of " + counting_mode_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xfc);
    buffer.writeUInt8(getValue(counting_mode_map, counting_mode));
    return buffer.toBytes();
}

/**
 * set led enable
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
    buffer.writeUInt8(0xfd);
    buffer.writeUInt8(getValue(enable_map, led_indicator_enable));
    return buffer.toBytes();
}

/**
 * set hibernate config
 * @param {object} hibernate_config
 * @param {number} hibernate_config.enable values: (0: "enable", 1: "disable")
 * @param {number} hibernate_config.start_time unit: minute. (4:00 -> 240, 4:30 -> 270)
 * @param {number} hibernate_config.end_time unit: minute. (start_time < end_time: one day, start_time > end_time: across the day, start_time == end_time: whole day)
 * @param {number} hibernate_config.weekdays.monday values: (0: disable, 1: enable)
 * @param {number} hibernate_config.weekdays.tuesday values: (0: disable, 1: enable)
 * @param {number} hibernate_config.weekdays.wednesday values: (0: disable, 1: enable)
 * @param {number} hibernate_config.weekdays.thursday values: (0: disable, 1: enable)
 * @param {number} hibernate_config.weekdays.friday values: (0: disable, 1: enable)
 * @param {number} hibernate_config.weekdays.saturday values: (0: disable, 1: enable)
 * @param {number} hibernate_config.weekdays.sunday values: (0: disable, 1: enable)
 * @example { "hibernate_config": { "enable": 1, "start_time": 240, "end_time": 270, "weekdays": [1, 2, 3, 4, 5] } }
 */
function setHibernateConfig(hibernate_config) {
    var enable = hibernate_config.enable;
    var start_time = hibernate_config.start_time;
    var end_time = hibernate_config.end_time;
    var weekdays = hibernate_config.weekdays;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("hibernate_config.enable must be one of " + enable_values.join(", "));
    }

    var day = 0x00;
    var weekdays_bit_offset = { monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 7 };
    for (var key in weekdays) {
        if (key in weekdays_bit_offset) {
            if (enable_values.indexOf(weekdays[key]) === -1) {
                throw new Error("hibernate_config.weekdays." + key + " must be one of " + enable_values.join(", "));
            }
            day |= getValue(enable_map, weekdays[key]) << weekdays_bit_offset[key];
        }
    }

    var buffer = new Buffer(8);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x75);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt16LE(start_time);
    buffer.writeUInt16LE(end_time);
    buffer.writeUInt8(day);
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
 * d2d master configuration
 * @param {object} d2d_master_config
 * @param {number} d2d_master_config.mode values: (1: someone_enter, 2: someone_leave, 3: counting_threshold_alarm)
 * @param {number} d2d_master_config.enable values: (0: disable, 1: enable)
 * @param {string} d2d_master_config.d2d_cmd
 * @param {number} d2d_master_config.lora_uplink_enable values: (0: disable, 1: enable)
 * @param {number} d2d_master_config.time_enable values: (0: disable, 1: enable)
 * @param {number} d2d_master_config.time unit: minute
 * @example { "d2d_master_config": [{ "mode": 0, "enable": 1, "d2d_cmd": "0000", "lora_uplink_enable": 1, "time_enable": 1, "time": 10 }] }
 */
function setD2DMasterConfig(d2d_master_config) {
    var mode = d2d_master_config.mode;
    var enable = d2d_master_config.enable;
    var d2d_cmd = d2d_master_config.d2d_cmd;
    var lora_uplink_enable = d2d_master_config.lora_uplink_enable;
    var time_enable = d2d_master_config.time_enable;
    var time = d2d_master_config.time;

    var mode_map = { 1: "someone_enter", 2: "someone_leave", 3: "counting_threshold_alarm" };
    var mode_values = getValues(mode_map);
    if (mode_values.indexOf(mode) === -1) {
        throw new Error("d2d_master_config._item.mode must be one of " + mode_values.join(", "));
    }
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("d2d_master_config._item.enable must be one of " + enable_values.join(", "));
    }
    if ("enable" in d2d_master_config && enable_values.indexOf(lora_uplink_enable) === -1) {
        throw new Error("d2d_master_config._item.lora_uplink_enable must be one of " + enable_values.join(", "));
    }
    if ("enable" in d2d_master_config && enable_values.indexOf(time_enable) === -1) {
        throw new Error("d2d_master_config._item.time_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(10);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x96);
    buffer.writeUInt8(getValue(mode_map, mode));
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt8(getValue(enable_map, lora_uplink_enable));
    buffer.writeD2DCommand(d2d_cmd, "0000");
    buffer.writeUInt16LE(time);
    buffer.writeUInt8(getValue(enable_map, time_enable));
    return buffer.toBytes();
}

/**
 * set people period alarm settings
 * @param {object} people_period_alarm_config
 * @param {number} people_period_alarm_config.condition values: (0: disable, 1: below, 2: above, 3: between, 4: outside)
 * @param {number} people_period_alarm_config.threshold_out range: [1, 65535]
 * @param {number} people_period_alarm_config.threshold_in range: [1, 65535]
 * @example { "people_period_alarm_config": { "condition": 3, "threshold_out": 20, "threshold_in": 25 } }
 */
function setPeoplePeriodAlarmSettings(people_period_alarm_config) {
    var condition = people_period_alarm_config.condition;
    var threshold_out = people_period_alarm_config.threshold_out;
    var threshold_in = people_period_alarm_config.threshold_in;

    var condition_map = { 0: "disable", 1: "below", 2: "above", 3: "between", 4: "outside" };
    var condition_values = getValues(condition_map);
    if (condition_values.indexOf(condition) === -1) {
        throw new Error("people_period_alarm_config.condition must be one of " + condition_values.join(", "));
    }

    var data = 0x00;
    data |= getValue(condition_map, condition) << 0;
    data |= 1 << 3; // 1: period
    data |= 1 << 6; // enable

    var buffer = new Buffer(11);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x06);
    buffer.writeUInt8(data);
    buffer.writeUInt16LE(threshold_out);
    buffer.writeUInt16LE(threshold_in);
    buffer.writeUInt16LE(0x00);
    buffer.writeUInt16LE(0x00);
    return buffer.toBytes();
}

/**
 * set people cumulative alarm settings
 * @param {object} people_cumulative_alarm_config
 * @param {number} people_cumulative_alarm_config.condition values: (0: disable, 1: below, 2: above, 3: between, 4: outside)
 * @param {number} people_cumulative_alarm_config.threshold_out range: [1, 65535]
 * @param {number} people_cumulative_alarm_config.threshold_in range: [1, 65535]
 * @example { "people_cumulative_alarm_config": { "condition": 3, "threshold_out": 20, "threshold_in": 25 } }
 */
function setPeopleCumulativeAlarmSettings(people_cumulative_alarm_config) {
    var condition = people_cumulative_alarm_config.condition;
    var threshold_out = people_cumulative_alarm_config.threshold_out;
    var threshold_in = people_cumulative_alarm_config.threshold_in;

    var condition_map = { 0: "disable", 1: "below", 2: "above", 3: "between", 4: "outside" };
    var condition_values = getValues(condition_map);
    if (condition_values.indexOf(condition) === -1) {
        throw new Error("people_cumulative_alarm_config.condition must be one of " + condition_values.join(", "));
    }

    var data = 0x00;
    data |= getValue(condition_map, condition) << 0;
    data |= 2 << 3; // 2: cumulative
    data |= 1 << 6; // enable

    var buffer = new Buffer(11);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x06);
    buffer.writeUInt8(data);
    buffer.writeUInt16LE(threshold_out);
    buffer.writeUInt16LE(threshold_in);
    buffer.writeUInt16LE(0x00);
    buffer.writeUInt16LE(0x00);
    return buffer.toBytes();
}

/**
 * set history enable
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
 * set retransmit interval
 * @param {number} retransmit_interval unit: second range: [30, 1200]
 * @example { "retransmit_interval": 600 }
 */
function setRetransmitInterval(retransmit_interval) {
    if (typeof retransmit_interval !== "number") {
        throw new Error("retransmit_interval must be a number");
    }
    if (retransmit_interval < 30 || retransmit_interval > 1200) {
        throw new Error("retransmit_interval must be between 30 and 1200");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x6a);
    buffer.writeUInt8(0x00);
    buffer.writeUInt16LE(retransmit_interval);
    return buffer.toBytes();
}

/**
 * set resend interval
 * @param {number} resend_interval unit: second range: [30, 1200]
 * @example { "resend_interval": 600 }
 */
function setResendInterval(resend_interval) {
    if (typeof resend_interval !== "number") {
        throw new Error("resend_interval must be a number");
    }
    if (resend_interval < 30 || resend_interval > 1200) {
        throw new Error("resend_interval must be between 30 and 1200");
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

    if (end_time === 0) {
        var buffer = new Buffer(6);
        buffer.writeUInt8(0xfd);
        buffer.writeUInt8(0x6b);
        buffer.writeUInt32LE(start_time);
    } else {
        var buffer = new Buffer(10);
        buffer.writeUInt8(0xfd);
        buffer.writeUInt8(0x6c);
        buffer.writeUInt32LE(start_time);
        buffer.writeUInt32LE(end_time);
    }

    return buffer.toBytes();
}

/**
 * stop transmit
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

Buffer.prototype.writeBytes = function (bytes) {
    for (var i = 0; i < bytes.length; i++) {
        this.buffer[this.offset + i] = bytes[i];
    }
    this.offset += bytes.length;
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
exports.decodeDownlink = decodeDownlink;

exports.decodeUplink = decodeUplink;
