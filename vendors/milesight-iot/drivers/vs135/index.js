/**
 * Payload Decoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product VS133 / VS135
 */
var RAW_VALUE = 0x00;

// The Things Network
function Decoder(bytes, port) {
    return milesightDeviceDecode(bytes);
}

var total_in_chns = [0x03, 0x06, 0x09, 0x0c];
var total_out_chns = [0x04, 0x07, 0x0a, 0x0d];
var period_chns = [0x05, 0x08, 0x0b, 0x0e];
var child_total_in_chns = [0x11, 0x14, 0x17, 0x1a];
var child_total_out_chns = [0x12, 0x15, 0x18, 0x1b];
var child_period_chns = [0x13, 0x16, 0x19, 0x1c];

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
        else if (channel_id === 0xff && channel_type === 0x1f) {
            decoded.firmware_version = readFirmwareVersion(bytes.slice(i, i + 4));
            i += 4;
        }
        // SERIAL NUMBER
        else if (channel_id === 0xff && channel_type === 0x16) {
            decoded.sn = readSerialNumber(bytes.slice(i, i + 8));
            i += 8;
        }
        // LINE TOTAL IN
        else if (includes(total_in_chns, channel_id) && channel_type === 0xd2) {
            var channel_in_name = "line_" + ((channel_id - total_in_chns[0]) / 3 + 1);
            decoded[channel_in_name + "_total_in"] = readUInt32LE(bytes.slice(i, i + 4));
            i += 4;
        }
        // LINE TOTAL IN (child)
        else if (includes(child_total_in_chns, channel_id) && channel_type === 0xd2) {
            var channel_in_name = "line_" + ((channel_id - child_total_in_chns[0]) / 3 + 1);
            decoded[channel_in_name + "_child_total_in"] = readUInt32LE(bytes.slice(i, i + 4));
            i += 4;
        }
        // LINE TOTAL OUT
        else if (includes(total_out_chns, channel_id) && channel_type === 0xd2) {
            var channel_out_name = "line_" + ((channel_id - total_out_chns[0]) / 3 + 1);
            decoded[channel_out_name + "_total_out"] = readUInt32LE(bytes.slice(i, i + 4));
            i += 4;
        }
        // LINE TOTAL OUT (child)
        else if (includes(child_total_out_chns, channel_id) && channel_type === 0xd2) {
            var channel_out_name = "line_" + ((channel_id - child_total_out_chns[0]) / 3 + 1);
            decoded[channel_out_name + "_child_total_out"] = readUInt32LE(bytes.slice(i, i + 4));
            i += 4;
        }
        // LINE PERIOD
        else if (includes(period_chns, channel_id) && channel_type === 0xcc) {
            var channel_period_name = "line_" + ((channel_id - period_chns[0]) / 3 + 1);
            decoded[channel_period_name + "_period_in"] = readUInt16LE(bytes.slice(i, i + 2));
            decoded[channel_period_name + "_period_out"] = readUInt16LE(bytes.slice(i + 2, i + 4));
            i += 4;
        }
        // LINE PERIOD (child)
        else if (includes(child_period_chns, channel_id) && channel_type === 0xcc) {
            var channel_period_name = "line_" + ((channel_id - child_period_chns[0]) / 3 + 1);
            decoded[channel_period_name + "_child_period_in"] = readUInt16LE(bytes.slice(i, i + 2));
            decoded[channel_period_name + "_child_period_out"] = readUInt16LE(bytes.slice(i + 2, i + 4));
            i += 4;
        }
        // REGION COUNT
        else if (channel_id === 0x0f && channel_type === 0xe3) {
            decoded.region_1_count = readUInt8(bytes[i]);
            decoded.region_2_count = readUInt8(bytes[i + 1]);
            decoded.region_3_count = readUInt8(bytes[i + 2]);
            decoded.region_4_count = readUInt8(bytes[i + 3]);
            i += 4;
        }
        // REGION COUNT (child)
        else if (channel_id === 0x1d && channel_type === 0xe3) {
            decoded.region_1_child_count = readUInt8(bytes[i]);
            decoded.region_2_child_count = readUInt8(bytes[i + 1]);
            decoded.region_3_child_count = readUInt8(bytes[i + 2]);
            decoded.region_4_child_count = readUInt8(bytes[i + 3]);
            i += 4;
        }
        // REGION DWELL TIME
        else if (channel_id === 0x10 && channel_type === 0xe4) {
            var dwell_channel_name = "region_" + bytes[i];
            decoded[dwell_channel_name + "_avg_dwell"] = readUInt16LE(bytes.slice(i + 1, i + 3));
            decoded[dwell_channel_name + "_max_dwell"] = readUInt16LE(bytes.slice(i + 3, i + 5));
            i += 5;
        }
        // REGION DWELL TIME (child)
        else if (channel_id === 0x1e && channel_type === 0xe4) {
            var dwell_channel_name = "region_" + bytes[i];
            decoded[dwell_channel_name + "_child_avg_dwell"] = readUInt16LE(bytes.slice(i + 1, i + 3));
            decoded[dwell_channel_name + "_child_max_dwell"] = readUInt16LE(bytes.slice(i + 3, i + 5));
            i += 5;
        }
        // ALARM
        else if (channel_id === 0x50 && channel_type === 0xfc) {
            var node_id = bytes[i + 1];
            var node_name = node_id === 0x00 ? "master" : "node_" + node_id;
            decoded[node_name + "_occlusion_alarm"] = readAlarmType(bytes[i + 2]);
            i += 3;
        }
        // DOWNLINK RESPONSE
        else if (channel_id === 0xfe || channel_id === 0xff) {
            var result = handle_downlink_response(channel_type, bytes, i);
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
        case 0x40:
            decoded.adr_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x42:
            decoded.wifi_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x43:
            decoded.periodic_report_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x44:
            decoded.trigger_report_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x51:
            decoded.clear_total_count = readYesNoStatus(1);
            offset += 1;
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
    var major = bytes[0] & 0xff;
    var minor = bytes[1] & 0xff;
    return "v" + major + "." + minor;
}

function readFirmwareVersion(bytes) {
    var serial = bytes[0] & 0xff;
    var major = bytes[1] & 0xff;
    var odm = bytes[2] & 0xff;
    var minor = bytes[3] & 0xff;
    return "v" + serial + "." + major + "." + odm + "." + minor;
}

function readSerialNumber(bytes) {
    var temp = [];
    for (var idx = 0; idx < bytes.length; idx++) {
        temp.push(("0" + (bytes[idx] & 0xff).toString(16)).slice(-2));
    }
    return temp.join("");
}

function readAlarmType(type) {
    var alarm_map = { 0: "alarm_released", 1: "alarm_triggered" };
    return getValue(alarm_map, type);
}

function readEnableStatus(status) {
    var enable_map = { 0: "disable", 1: "enable" };
    return getValue(enable_map, status);
}

function readYesNoStatus(status) {
    var yes_no_map = { 0: "no", 1: "yes" };
    return getValue(yes_no_map, status);
}

function readUInt8(bytes) {
    return bytes & 0xff;
}

function readUInt16LE(bytes) {
    var value = (bytes[1] << 8) + bytes[0];
    return value & 0xffff;
}

function readUInt32LE(bytes) {
    var value = (bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
    return (value & 0xffffffff) >>> 0;
}

function includes(data, value) {
    var size = data.length;
    for (var i = 0; i < size; i++) {
        if (data[i] == value) {
            return true;
        }
    }
    return false;
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
 * @product VS133 / VS135
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
    if ("report_interval" in payload) {
        encoded = encoded.concat(setReportInterval(payload.report_interval));
    }
    if ("confirm_mode_enable" in payload) {
        encoded = encoded.concat(setConfirmModeEnable(payload.confirm_mode_enable));
    }
    if ("adr_enable" in payload) {
        encoded = encoded.concat(setAdrEnable(payload.adr_enable));
    }
    if ("wifi_enable" in payload) {
        encoded = encoded.concat(setWifiEnable(payload.wifi_enable));
    }
    if ("periodic_report_enable" in payload) {
        encoded = encoded.concat(setPeriodicReportEnable(payload.periodic_report_enable));
    }
    if ("trigger_report_enable" in payload) {
        encoded = encoded.concat(setTriggerReportEnable(payload.trigger_report_enable));
    }
    if ("clear_total_count" in payload) {
        encoded = encoded.concat(setClearTotalCount(payload.clear_total_count));
    }
    if ("timestamp" in payload) {
        encoded = encoded.concat(setTimestamp(payload.timestamp));
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
    if ("history_enable" in payload) {
        encoded = encoded.concat(setHistoryEnable(payload.history_enable));
    }
    if ("fetch_history" in payload) {
        encoded = encoded.concat(fetchHistory(payload.fetch_history));
    }
    if ("stop_transmit" in payload) {
        encoded = encoded.concat(stopTransmit(payload.stop_transmit));
    }
    if ("clear_history" in payload) {
        encoded = encoded.concat(clearHistory(payload.clear_history));
    }
    if ("sync_time_from_gateway_config" in payload) {
        encoded = encoded.concat(gatewayTimeSyncConfig(payload.sync_time_from_gateway_config));
    }
    if ("rejoin_config" in payload) {
        encoded = encoded.concat(setRejoinConfig(payload.rejoin_config));
    }
    if ("data_rate" in payload) {
        encoded = encoded.concat(setDataRate(payload.data_rate));
    }
    if ("tx_power_level" in payload) {
        encoded = encoded.concat(setTxPowerLevel(payload.tx_power_level));
    }
    if ("log_config" in payload) {
        encoded = encoded.concat(setLogConfig(payload.log_config));
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
 * report_interval
 * @param {number} report_interval unit: second, range: [1, 64800]
 * @example { "report_interval": 10 }
 */
function setReportInterval(report_interval) {
    if (report_interval < 1 || report_interval > 64800) {
        throw new Error("report_interval must be between 1 and 64800");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x03);
    buffer.writeUInt16LE(report_interval);
    return buffer.toBytes();
}

/**
 * confirm_mode_enable
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
 * adr_enable
 * @param {number} adr_enable values: (0: disable, 1: enable)
 * @example { "adr_enable": 1 }
 */
function setAdrEnable(adr_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(adr_enable) === -1) {
        throw new Error("adr_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x40);
    buffer.writeUInt8(getValue(enable_map, adr_enable));
    return buffer.toBytes();
}

/**
 * wifi_enable
 * @param {number} wifi_enable values: (0: disable, 1: enable)
 * @example { "wifi_enable": 1 }
 */
function setWifiEnable(wifi_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(wifi_enable) === -1) {
        throw new Error("wifi_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x42);
    buffer.writeUInt8(getValue(enable_map, wifi_enable));
    return buffer.toBytes();
}

/**
 * periodic_report_enable
 * @param {number} periodic_report_enable values: (0: disable, 1: enable)
 * @example { "periodic_report_enable": 1 }
 */
function setPeriodicReportEnable(periodic_report_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(periodic_report_enable) === -1) {
        throw new Error("periodic_report_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x43);
    buffer.writeUInt8(getValue(enable_map, periodic_report_enable));
    return buffer.toBytes();
}

/**
 * trigger_report_enable
 * @param {number} trigger_report_enable values: (0: disable, 1: enable)
 * @example { "trigger_report_enable": 1 }
 */
function setTriggerReportEnable(trigger_report_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(trigger_report_enable) === -1) {
        throw new Error("trigger_report_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x44);
    buffer.writeUInt8(getValue(enable_map, trigger_report_enable));
    return buffer.toBytes();
}

/**
 * clear_total_count
 * @param {number} clear_total_count values: (0: no, 1: yes)
 * @example { "clear_total_count": 1 }
 */
function setClearTotalCount(clear_total_count) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(clear_total_count) === -1) {
        throw new Error("clear_total_count must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, clear_total_count) === 0) {
        return [];
    }
    return [0xff, 0x51, 0xff];
}

/**
 * set timestamp
 * @since firmware_version>=v1.0.9
 * @param {number} timestamp unit: second
 * @example { "timestamp": 1717756800 }
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
 * set retransmit enable
 * @since firmware_version>=v1.0.9
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
 * @since firmware_version>=v1.0.9
 * @param {number} retransmit_interval unit: second, range: [1, 64800]
 * @example { "retransmit_interval": 600 }
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
 * set resend interval
 * @since firmware_version>=v1.0.9
 * @param {number} resend_interval unit: second, range: [1, 64800]
 * @example { "resend_interval": 600 }
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
 * history enable
 * @since firmware_version>=v1.0.9
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
 * @since firmware_version>=v1.0.9
 * @param {object} fetch_history
 * @param {number} fetch_history.start_time unit: second
 * @param {number} fetch_history.end_time unit: second
 * @example { "fetch_history": { "start_time": 1609459200, "end_time": 1609545600 } }
 */
function fetchHistory(fetch_history) {
    var start_time = fetch_history.start_time;
    var end_time = fetch_history.end_time;

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
    if ("end_time" in fetch_history || end_time === 0) {
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
 * history stop transmit
 * @since firmware_version>=v1.0.9
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

/**
 * clear history
 * @since firmware_version>=v1.0.9
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
 * gateway time sync
 * @since firmware_version>=v1.0.9
 * @param {object} sync_time_from_gateway_config
 * @param {number} sync_time_from_gateway_config.enable values: (0: disable, 1: enable)
 * @param {number} sync_time_from_gateway_config.period unit: minute
 * @example { "sync_time_from_gateway_config": { "enable": 1, "period": 10 } }
 */
function gatewayTimeSyncConfig(sync_time_from_gateway_config) {
    var enable = sync_time_from_gateway_config.enable;
    var period = sync_time_from_gateway_config.period;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x84);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt16LE(period);
    return buffer.toBytes();
}

/**
 * set rejoin config
 * @since firmware_version>=v1.0.9
 * @param {object} rejoin_config
 * @param {number} rejoin_config.enable values: (0: disable, 1: enable)
 * @param {number} rejoin_config.max_count
 * @example { "rejoin_config": { "enable": 1, "max_count": 10 } }
 */
function setRejoinConfig(rejoin_config) {
    var enable = rejoin_config.enable;
    var max_count = rejoin_config.max_count;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x85);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt8(max_count);
    return buffer.toBytes();
}

/**
 * set data rate
 * @since firmware_version>=v1.0.9
 * @param {number} data_rate
 * @example { "data_rate": 0 }
 */
function setDataRate(data_rate) {
    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x86);
    buffer.writeUInt8(data_rate);
    return buffer.toBytes();
}

/**
 * set tx power
 * @since firmware_version>=v1.0.9
 * @param {number} tx_power_level
 *  EU868, values: (0:-16dBm, 1:-14dBm, 2:-12dBm, 3:-10dBm, 4:-8dBm, 5:-6dBm, 6:-4dBm, 7:-2dBm)
 *  IN865, values: (0:-22dBm, 1:-22dBm, 2:-22dBm, 3:-22dBm, 4:-22dBm, 5:-20dBm, 6:-18dBm, 7:-16dBm, 8:-14dBm, 9:-12dBm, 10:-10dBm)
 *  RU864, values: (0:-16dBm, 1:-14dBm, 2:-12dBm, 3:-10dBm, 4:-8dBm, 5:-6dBm, 6:-4dBm, 7:-2dBm)
 *  AU915, values: (0:-22dBm, 1:-22dBm, 2:-22dBm, 3:-22dBm, 4:-22dBm, 5:-20dBm, 6:-18dBm, 7:-16dBm, 8:-14dBm, 9:-12dBm, 10:-10dBm, 11:-8dBm, 12:-6dBm, 13:-4dBm, 14:-2dBm)
 *  KR920, values: (0:-14dBm, 1:-12dBm, 2:-10dBm, 3:-8dBm, 4:-6dBm, 5:-4dBm, 6:-2dBm, 7:0dBm)
 *  AS923, values: (0:-16dBm, 1:-14dBm, 2:-12dBm, 3:-10dBm, 4:-8dBm, 5:-6dBm, 6:-4dBm, 7:-2dBm)
 *  US915, values: (0:-22dBm, 1:-22dBm, 2:-22dBm, 3:-22dBm, 4:-22dBm, 5:-20dBm, 6:-18dBm, 7:-16dBm, 8:-14dBm, 9:-12dBm, 10:-10dBm, 11:-8dBm, 12:-6dBm, 13:-4dBm, 14:-2dBm)
 *  CN470, values: (0:-19.15dBm, 1:-17.15dBm, 2:-15.15dBm, 3:-13.15dBm, 4:-11.15dBm, 5:-9.15dBm, 6:-7.15dBm, 7:-5.15dBm)
 * @example { "tx_power_level": 0 }
 */
function setTxPowerLevel(tx_power_level) {
    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x87);
    buffer.writeUInt8(tx_power_level);
    return buffer.toBytes();
}

/**
 * set log level
 * @since firmware_version>=v1.0.9
 * @param {object} log_config
 * @param {number} log_config.console_log_level values: (1: fatal, 2: error, 3: warning, 4: debug, 5: trace)
 * @param {number} log_config.file_log_level values: (1: fatal, 2: error, 3: warning, 4: debug, 5: trace)
 * @example { "log_config": { "console_log_level": 1, "file_log_level": 1 } }
 */
function setLogConfig(log_config) {
    var console_log_level = log_config.console_log_level;
    var file_log_level = log_config.file_log_level;

    var log_level_map = { 1: "fatal", 2: "error", 3: "warning", 4: "debug", 5: "trace" };
    var log_level_values = getValues(log_level_map);
    if (log_level_values.indexOf(console_log_level) === -1) {
        throw new Error("console_log_level must be one of " + log_level_values.join(", "));
    }
    if (log_level_values.indexOf(file_log_level) === -1) {
        throw new Error("file_log_level must be one of " + log_level_values.join(", "));
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x88);
    buffer.writeUInt8(console_log_level);
    buffer.writeUInt8(file_log_level);
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

Buffer.prototype.writeUInt24LE = function (value) {
    this._write(value, 3, true);
    this.offset += 3;
};

Buffer.prototype.writeInt24LE = function (value) {
    this._write(value < 0 ? value + 0x1000000 : value, 3, true);
    this.offset += 3;
};

Buffer.prototype.writeUInt32LE = function (value) {
    this._write(value, 4, true);
    this.offset += 4;
};

Buffer.prototype.writeInt32LE = function (value) {
    this._write(value < 0 ? value + 0x100000000 : value, 4, true);
    this.offset += 4;
};

Buffer.prototype.writeHex = function (hexString) {
    var bytes = [];
    for (var i = 0; i < hexString.length; i += 2) {
        bytes.push(parseInt(hexString.substr(i, 2), 16));
    }
    this.writeBytes(bytes);
};

Buffer.prototype.writeUtf8 = function (str) {
    var bytes = [];
    for (var i = 0; i < str.length; i++) {
        var charCode = str.charCodeAt(i);
        if (charCode < 0x80) {
            bytes.push(charCode);
        } else if (charCode < 0x800) {
            bytes.push(0xc0 | (charCode >> 6));
            bytes.push(0x80 | (charCode & 0x3f));
        } else if (charCode < 0x10000) {
            bytes.push(0xe0 | (charCode >> 12));
            bytes.push(0x80 | ((charCode >> 6) & 0x3f));
            bytes.push(0x80 | (charCode & 0x3f));
        } else if (charCode < 0x200000) {
            bytes.push(0xf0 | (charCode >> 18));
            bytes.push(0x80 | ((charCode >> 12) & 0x3f));
            bytes.push(0x80 | ((charCode >> 6) & 0x3f));
            bytes.push(0x80 | (charCode & 0x3f));
        }
    }
    this.writeBytes(bytes);
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
