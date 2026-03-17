/**
 * Payload Decoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product TS201 v2
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
            decoded.sn = readHexString(bytes.slice(i, i + 8));
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
            decoded.device_status = readOnOffStatus(1);
            i += 1;
        }
        // BATTERY
        else if (channel_id === 0x01 && channel_type === 0x75) {
            decoded.battery = readUInt8(bytes[i]);
            i += 1;
        }
        // TEMPERATURE
        else if (channel_id === 0x03 && channel_type === 0x67) {
            decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
            i += 2;
        }
        // HUMIDITY
        else if (channel_id === 0x04 && channel_type === 0x68) {
            decoded.humidity = readUInt8(bytes[i]) / 2;
            i += 1;
        }
        // SENSOR ID
        else if (channel_id === 0xff && channel_type === 0xa0) {
            var data = readUInt8(bytes[i]);
            var channel_idx = (data >>> 4) & 0x0f;
            var sensor_type = (data >>> 0) & 0x0f;
            var sensor_id = readHexString(bytes.slice(i + 1, i + 9));
            var sensor_chn_name = "sensor_" + channel_idx;
            i += 9;
            decoded[sensor_chn_name + "_type"] = readSensorIDType(sensor_type);
            decoded[sensor_chn_name + "_sn"] = sensor_id;
        }
        // TEMPERATURE THRESHOLD ALARM
        else if (channel_id === 0x83 && channel_type === 0x67) {
            var data = {};
            data.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
            data.temperature_alarm = readAlarmType(bytes[i + 2]);
            i += 3;
            decoded.temperature = data.temperature;
            decoded.event = decoded.event || [];
            decoded.event.push(data);
        }
        // HUMIDITY THRESHOLD ALARM
        else if (channel_id === 0x84 && channel_type === 0x68) {
            var data = {};
            data.humidity = readUInt8(bytes[i]) / 2;
            data.humidity_alarm = readAlarmType(bytes[i + 1]);
            i += 2;
            decoded.humidity = data.humidity;
            decoded.event = decoded.event || [];
            decoded.event.push(data);
        }
        // TEMPERATURE MUTATION ALARM
        else if (channel_id === 0x93 && channel_type === 0x67) {
            var data = {};
            data.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
            data.temperature_mutation = readInt16LE(bytes.slice(i + 2, i + 4)) / 10;
            data.temperature_alarm = readAlarmType(bytes[i + 4]);
            i += 5;
            decoded.temperature = data.temperature;
            decoded.event = decoded.event || [];
            decoded.event.push(data);
        }
        // HUMIDITY MUTATION ALARM
        else if (channel_id === 0x94 && channel_type === 0x68) {
            var data = {};
            data.humidity = readUInt8(bytes[i]) / 2;
            data.humidity_mutation = readUInt8(bytes[i + 1]) / 2;
            data.humidity_alarm = readAlarmType(bytes[i + 2]);
            i += 3;
            decoded.humidity = data.humidity;
            decoded.event = decoded.event || [];
            decoded.event.push(data);
        }
        // TEMPERATURE SENSOR STATUS
        else if (channel_id === 0xb3 && channel_type === 0x67) {
            var data = {};
            data.temperature_sensor_status = readSensorStatus(bytes[i]);
            i += 1;
            decoded.event = decoded.event || [];
            decoded.event.push(data);
        }
        // HUMIDITY SENSOR STATUS
        else if (channel_id === 0xb4 && channel_type === 0x68) {
            var data = {};
            data.humidity_sensor_status = readSensorStatus(bytes[i]);
            i += 1;
            decoded.event = decoded.event || [];
            decoded.event.push(data);
        }
        // HISTORY DATA
        else if (channel_id === 0x20 && channel_type === 0xce) {
            var timestamp = readUInt32LE(bytes.slice(i, i + 4));
            var sensor_type = bytes[i + 4];
            var temperature = readInt16LE(bytes.slice(i + 5, i + 7)) / 10;
            var humidity = readUInt8(bytes[i + 7]) / 2;
            var event = bytes[i + 8];
            i += 9;
            var data = {};
            data.timestamp = timestamp;
            data.sensor_type = readSensorIDType(sensor_type);
            data.event = readHistoryEvent(event, sensor_type);
            data.temperature = temperature;
            // SHT4X
            if (sensor_type === 2) {
                data.humidity = humidity;
            }
            decoded.history = decoded.history || [];
            decoded.history.push(data);
        }
        // TEMPERATURE UNIT
        else if (channel_id === 0xff && channel_type === 0xeb) {
            decoded.temperature_unit = readTemperatureUnit(bytes[i]);
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
        case 0x02:
            decoded.collection_interval = readUInt16LE(bytes.slice(offset, offset + 2));
            offset += 2;
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
        case 0x8e:
            // skip first byte
            decoded.report_interval = readUInt16LE(bytes.slice(offset + 1, offset + 3));
            offset += 3;
            break;
        case 0x96:
            var d2d_master_config = {};
            d2d_master_config.mode = readD2DEventType(bytes[offset]);
            d2d_master_config.enable = readEnableStatus(bytes[offset + 1]);
            d2d_master_config.lora_uplink_enable = readEnableStatus(bytes[offset + 2]);
            d2d_master_config.d2d_cmd = readD2DCommand(bytes.slice(offset + 3, offset + 5));
            offset += 8;
            decoded.d2d_master_config = decoded.d2d_master_config || [];
            decoded.d2d_master_config.push(d2d_master_config);
            break;
        case 0xea:
            var data = readUInt8(bytes[offset]);
            var calibration_value = readInt16LE(bytes.slice(offset + 1, offset + 3));
            var type = (data >>> 0) & 0x01;
            var enable_value = (data >>> 7) & 0x01;
            if (type === 0) {
                decoded.temperature_calibration_settings = {};
                decoded.temperature_calibration_settings.enable = readEnableStatus(enable_value);
                decoded.temperature_calibration_settings.calibration_value = calibration_value / 10;
            } else if (type === 1) {
                decoded.humidity_calibration_settings = {};
                decoded.humidity_calibration_settings.enable = readEnableStatus(enable_value);
                decoded.humidity_calibration_settings.calibration_value = calibration_value / 2;
            }
            offset += 3;
            break;
        case 0xf2:
            decoded.alarm_report_counts = readUInt16LE(bytes.slice(offset, offset + 2));
            offset += 2;
            break;
        case 0xf5:
            decoded.alarm_release_enable = readEnableStatus(bytes[offset]);
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
        case 0x0b:
            var data_type = readUInt8(bytes[offset]);
            if (data_type === 0x01) {
                decoded.temperature_alarm_config = {};
                decoded.temperature_alarm_config.condition = readMathConditionType(bytes[offset + 1]);
                decoded.temperature_alarm_config.threshold_max = readInt16LE(bytes.slice(offset + 2, offset + 4)) / 10;
                decoded.temperature_alarm_config.threshold_min = readInt16LE(bytes.slice(offset + 4, offset + 6)) / 10;
                decoded.temperature_alarm_config.enable = readEnableStatus(bytes[offset + 6]);
            } else if (data_type === 0x03) {
                decoded.humidity_alarm_config = {};
                decoded.humidity_alarm_config.condition = readMathConditionType(bytes[offset + 1]);
                decoded.humidity_alarm_config.threshold_max = readUInt16LE(bytes.slice(offset + 2, offset + 4)) / 2;
                decoded.humidity_alarm_config.threshold_min = readUInt16LE(bytes.slice(offset + 4, offset + 6)) / 2;
                decoded.humidity_alarm_config.enable = readEnableStatus(bytes[offset + 6]);
            }
            offset += 7;
            break;
        case 0x0c:
            var data_type = readUInt8(bytes[offset]);
            if (data_type === 0x02) {
                decoded.temperature_mutation_alarm_config = {};
                decoded.temperature_mutation_alarm_config.mutation = readUInt16LE(bytes.slice(offset + 1, offset + 3)) / 10;
                decoded.temperature_mutation_alarm_config.enable = readEnableStatus(bytes[offset + 3]);
            } else if (data_type === 0x04) {
                decoded.humidity_mutation_alarm_config = {};
                decoded.humidity_mutation_alarm_config.mutation = readUInt16LE(bytes.slice(offset + 1, offset + 3)) / 2;
                decoded.humidity_mutation_alarm_config.enable = readEnableStatus(bytes[offset + 3]);
            }
            offset += 4;
            break;
        case 0x0d:
            decoded.retransmit_config = {};
            decoded.retransmit_config.enable = readEnableStatus(bytes[offset]);
            decoded.retransmit_config.interval = readUInt16LE(bytes.slice(offset + 1, offset + 3));
            offset += 3;
            break;
        case 0x0e:
            decoded.resend_interval = readUInt16LE(bytes.slice(offset, offset + 2));
            offset += 2;
            break;
        case 0x31:
            decoded.fetch_sensor_id = readUInt8(bytes[offset]);
            offset += 1;
            break;
        case 0x32:
            decoded.ack_retry_times = readUInt8(bytes[offset + 2]);
            offset += 3;
            break;
        case 0x63:
            decoded.d2d_uplink_config = {};
            decoded.d2d_uplink_config.d2d_uplink_enable = readEnableStatus(bytes[offset]);
            decoded.d2d_uplink_config.lora_uplink_enable = readEnableStatus(bytes[offset + 1]);
            decoded.d2d_uplink_config.sensor_data_config = readSensorDataConfig(readUInt16LE(bytes.slice(offset + 2, offset + 4)));
            offset += 4;
            break;
        case 0x66:
            decoded.d2d_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x69:
            decoded.button_lock_config = readButtonLockConfig(bytes[offset]);
            offset += 1;
            break;
        case 0x6a:
            decoded.led_indicator_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x6f:
            var query_config = readQueryConfig(readUInt8(bytes[offset]));
            decoded.query_config = decoded.query_config || {};
            decoded.query_config = mergeObjects(decoded.query_config, query_config);
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

function readHexString(bytes) {
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

function readOnOffStatus(status) {
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

function readSensorIDType(type) {
    var sensor_id_map = { 1: "DS18B20", 2: "SHT4X" };
    return getValue(sensor_id_map, type);
}

function readD2DCommand(bytes) {
    return ("0" + (bytes[1] & 0xff).toString(16)).slice(-2) + ("0" + (bytes[0] & 0xff).toString(16)).slice(-2);
}

function readAlarmType(type) {
    var alarm_map = {
        0: "threshold alarm release",
        1: "threshold alarm",
        2: "mutation alarm",
    };
    return getValue(alarm_map, type);
}

function readSensorStatus(type) {
    var status_map = { 0: "read error", 1: "out of range" };
    return getValue(status_map, type);
}

function readHistoryEvent(value, sensor_type) {
    var event_map = { 1: "periodic", 2: "temperature alarm (threshold or mutation)", 3: "temperature alarm release", 4: "humidity alarm (threshold or mutation)", 5: "humidity alarm release", 6: "immediate" };
    var sensor_status_map = { 0: "normal", 1: "read error", 2: "out of range" };

    var report_event = getValue(event_map, value & 0x0f);
    var humidity_event = getValue(sensor_status_map, (value >>> 4) & 0x03);
    var temperature_event = getValue(sensor_status_map, (value >>> 6) & 0x03);

    var data = {};
    data.event_type = report_event;
    if (sensor_type === 2) {
        data.humidity_sensor_status = humidity_event;
        data.temperature_sensor_status = temperature_event;
    } else {
        data.temperature_sensor_status = temperature_event;
    }
    return data;
}

function readMathConditionType(type) {
    var condition_map = { 0: "disable", 1: "below", 2: "above", 3: "between", 4: "outside" };
    return getValue(condition_map, type);
}

function readD2DEventType(type) {
    var event_map = { 1: "temperature threshold alarm", 2: "temperature threshold alarm release", 3: "temperature mutation alarm", 4: "humidity threshold alarm", 5: "humidity threshold alarm release", 6: "humidity mutation alarm" };
    return getValue(event_map, type);
}

function readSensorDataConfig(value) {
    var sensor_bit_offset = { temperature: 0, humidity: 1 };
    var status_map = { 0: "disable", 1: "enable" };
    var data = {};
    for (var key in sensor_bit_offset) {
        data[key] = getValue(status_map, (value >>> sensor_bit_offset[key]) & 0x01);
    }
    return data;
}

function readButtonLockConfig(value) {
    var button_bit_offset = { power_button: 0, report_button: 1 };
    var status_map = { 0: "disable", 1: "enable" };
    var data = {};
    for (var key in button_bit_offset) {
        data[key] = getValue(status_map, (value >>> button_bit_offset[key]) & 0x01);
    }
    return data;
}

function readTemperatureUnit(type) {
    var unit_map = { 0: "celsius", 1: "fahrenheit" };
    return getValue(unit_map, type);
}

function readResultStatus(status) {
    var status_map = { 0: "success", 1: "forbidden", 2: "invalid parameter" };
    return getValue(status_map, status);
}

function readQueryConfig(value) {
    var config_map = {
        temperature_unit: 1,
        button_lock_config: 2,
        d2d_uplink_config: 3,
        d2d_enable: 4,
        d2d_master_config_with_temperature_threshold_alarm: 5,
        d2d_master_config_with_temperature_threshold_alarm_release: 6,
        d2d_master_config_with_temperature_mutation_alarm: 7,
        d2d_master_config_with_humidity_threshold_alarm: 8,
        d2d_master_config_with_humidity_threshold_alarm_release: 9,
        d2d_master_config_with_humidity_mutation_alarm: 10,
        temperature_calibration_settings: 11,
        humidity_calibration_settings: 12,
        temperature_alarm_config: 13,
        temperature_mutation_alarm_config: 14,
        humidity_alarm_config: 15,
        humidity_mutation_alarm_config: 16,
        led_indicator_enable: 17,
        collection_interval: 18,
        report_interval: 19,
        alarm_release_enable: 20,
        alarm_report_counts: 21,
        retransmit_config: 22,
        history_enable: 23,
        history_resend_config: 24,
        ack_retry_times: 25,
    };
    var query_config = {};
    for (var key in config_map) {
        if (value === config_map[key]) {
            query_config[key] = readYesNoStatus(1);
        }
    }
    return query_config;
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
 * @product TS201 v2
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
    if ("sync_time" in payload) {
        encoded = encoded.concat(syncTime(payload.sync_time));
    }
    if ("report_interval" in payload) {
        encoded = encoded.concat(setReportInterval(payload.report_interval));
    }
    if ("collection_interval" in payload) {
        encoded = encoded.concat(setCollectionInterval(payload.collection_interval));
    }
    if ("report_status" in payload) {
        encoded = encoded.concat(reportStatus(payload.report_status));
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
    if ("retransmit_config" in payload) {
        encoded = encoded.concat(setRetransmitConfig(payload.retransmit_config));
    }
    if ("resend_interval" in payload) {
        encoded = encoded.concat(setResendInterval(payload.resend_interval));
    }
    if ("alarm_report_counts" in payload) {
        encoded = encoded.concat(setAlarmCount(payload.alarm_report_counts));
    }
    if ("alarm_release_enable" in payload) {
        encoded = encoded.concat(setThresholdAlarmReleaseEnable(payload.alarm_release_enable));
    }
    if ("temperature_alarm_config" in payload) {
        encoded = encoded.concat(setTemperatureThresholdConfig(payload.temperature_alarm_config));
    }
    if ("humidity_alarm_config" in payload) {
        encoded = encoded.concat(setHumidityThresholdConfig(payload.humidity_alarm_config));
    }
    if ("temperature_mutation_alarm_config" in payload) {
        encoded = encoded.concat(setTemperatureMutationConfig(payload.temperature_mutation_alarm_config));
    }
    if ("humidity_mutation_alarm_config" in payload) {
        encoded = encoded.concat(setHumidityMutationConfig(payload.humidity_mutation_alarm_config));
    }
    if ("temperature_calibration_settings" in payload) {
        encoded = encoded.concat(calibrateTemperature(payload.temperature_calibration_settings));
    }
    if ("humidity_calibration_settings" in payload) {
        encoded = encoded.concat(calibrateHumidity(payload.humidity_calibration_settings));
    }
    if ("stop_transmit" in payload) {
        encoded = encoded.concat(stopTransmit(payload.stop_transmit));
    }
    if ("fetch_sensor_id" in payload) {
        encoded = encoded.concat(fetchSensorID(payload.fetch_sensor_id));
    }
    if ("ack_retry_times" in payload) {
        encoded = encoded.concat(setAckRetryTimes(payload.ack_retry_times));
    }
    if ("d2d_master_config" in payload) {
        for (var i = 0; i < payload.d2d_master_config.length; i++) {
            encoded = encoded.concat(setD2DMasterConfig(payload.d2d_master_config[i]));
        }
    }
    if ("d2d_key" in payload) {
        encoded = encoded.concat(setD2DKey(payload.d2d_key));
    }
    if ("d2d_enable" in payload) {
        encoded = encoded.concat(setD2DEnable(payload.d2d_enable));
    }
    if ("d2d_uplink_config" in payload) {
        encoded = encoded.concat(setD2DUplinkConfig(payload.d2d_uplink_config));
    }
    if ("button_lock_config" in payload) {
        encoded = encoded.concat(setButtonLockConfig(payload.button_lock_config));
    }
    if ("led_indicator_enable" in payload) {
        encoded = encoded.concat(setLedIndicatorEnable(payload.led_indicator_enable));
    }
    if ("temperature_unit" in payload) {
        encoded = encoded.concat(setTemperatureUnit(payload.temperature_unit));
    }
    if ("query_config" in payload) {
        encoded = encoded.concat(queryDeviceConfig(payload.query_config));
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
 * report interval configuration
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
 * collection interval
 * @param {number} collection_interval unit: second
 * @example { "collection_interval": 300 }
 */
function setCollectionInterval(collection_interval) {
    if (typeof collection_interval !== "number") {
        throw new Error("collection_interval must be a number");
    }
    if (collection_interval <= 0) {
        throw new Error("collection_interval must be greater than 0");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x02);
    buffer.writeUInt16LE(collection_interval);
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
    return [0xff, 0x4a, 0x00];
}

/**
 * calibrate temperature
 * @param {object} temperature_calibration_settings
 * @param {number} temperature_calibration_settings.enable values: (0: disable, 1: enable)
 * @param {number} temperature_calibration_settings.calibration_value range: [-200, 1000]
 * @example { "temperature_calibration_settings": { "enable": 1, "calibration_value": 1 }
 */
function calibrateTemperature(temperature_calibration_settings) {
    var enable = temperature_calibration_settings.enable;
    var calibration_value = temperature_calibration_settings.calibration_value;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("temperature_calibration_settings.enable must be one of " + enable_values.join(", "));
    }
    if (calibration_value < -200 || calibration_value > 1000) {
        throw new Error("temperature_calibration_settings.calibration_value must be in range [-200, 1000]");
    }

    var data = 0 | (getValue(enable_map, enable) << 7);

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xea);
    buffer.writeUInt8(data);
    buffer.writeInt16LE(calibration_value * 10);
    return buffer.toBytes();
}

/**
 * calibrate humidity
 * @param {object} humidity_calibration_settings
 * @param {number} humidity_calibration_settings.enable values: (0: disable, 1: enable)
 * @param {number} humidity_calibration_settings.calibration_value range: [-100, 100]
 * @example { "humidity_calibration_settings": { "enable": 1, "calibration_value": 1 }
 */
function calibrateHumidity(humidity_calibration_settings) {
    var enable = humidity_calibration_settings.enable;
    var calibration_value = humidity_calibration_settings.calibration_value;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("humidity_calibration_settings.enable must be one of " + enable_values.join(", "));
    }
    if (calibration_value < -100 || calibration_value > 100) {
        throw new Error("humidity_calibration_settings.calibration_value must be in range [-100, 100]");
    }

    var data = 1 | (getValue(enable_map, enable) << 7);

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xea);
    buffer.writeUInt8(data);
    buffer.writeInt16LE(calibration_value * 2);
    return buffer.toBytes();
}

/**
 * set alarm count
 * @param {number} alarm_report_counts range: [1, 1000]
 * @example { "alarm_report_counts": 10 }
 */
function setAlarmCount(alarm_report_counts) {
    if (typeof alarm_report_counts !== "number") {
        throw new Error("alarm_report_counts must be a number");
    }
    if (alarm_report_counts < 1 || alarm_report_counts > 1000) {
        throw new Error("alarm_report_counts must be in range [1, 1000]");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xf2);
    buffer.writeUInt16LE(alarm_report_counts);
    return buffer.toBytes();
}

/**
 * set temperature threshold config
 * @param {object} temperature_alarm_config
 * @param {number} temperature_alarm_config.condition values: (0: disable, 1: below, 2: above, 3: between, 4: outside)
 * @param {number} temperature_alarm_config.max
 * @param {number} temperature_alarm_config.min
 * @param {number} temperature_alarm_config.enable values: (0: disable, 1: enable)
 * @example { "temperature_alarm_config": { "condition": 1, "max": 25, "min": 20, "enable": 1 } }
 */
function setTemperatureThresholdConfig(temperature_alarm_config) {
    var condition = temperature_alarm_config.condition;
    var max = temperature_alarm_config.max;
    var min = temperature_alarm_config.min;
    var enable = temperature_alarm_config.enable;

    var condition_map = { 0: "disable", 1: "below", 2: "above", 3: "between", 4: "outside" };
    var condition_values = getValues(condition_map);
    if (condition_values.indexOf(condition) === -1) {
        throw new Error("temperature_alarm_config.condition must be one of " + condition_values.join(", "));
    }
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("temperature_alarm_config.enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(9);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x0b);
    buffer.writeUInt8(0x01);
    buffer.writeUInt8(getValue(condition_map, condition));
    buffer.writeUInt16LE(max * 10);
    buffer.writeUInt16LE(min * 10);
    buffer.writeUInt8(getValue(enable_map, enable));
    return buffer.toBytes();
}

/**
 * set humidity threshold config
 * @param {object} humidity_alarm_config
 * @param {number} humidity_alarm_config.condition values: (0: disable, 1: below, 2: above, 3: between, 4: outside)
 * @param {number} humidity_alarm_config.max
 * @param {number} humidity_alarm_config.min
 * @param {number} humidity_alarm_config.enable values: (0: disable, 1: enable)
 * @example { "humidity_alarm_config": { "condition": 1, "max": 25, "min": 20, "enable": 1 } }
 */
function setHumidityThresholdConfig(humidity_alarm_config) {
    var condition = humidity_alarm_config.condition;
    var max = humidity_alarm_config.max;
    var min = humidity_alarm_config.min;
    var enable = humidity_alarm_config.enable;

    var condition_map = { 0: "disable", 1: "below", 2: "above", 3: "between", 4: "outside" };
    var condition_values = getValues(condition_map);
    if (condition_values.indexOf(condition) === -1) {
        throw new Error("humidity_alarm_config.condition must be one of " + condition_values.join(", "));
    }
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("humidity_alarm_config.enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(9);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x0b);
    buffer.writeUInt8(0x03);
    buffer.writeUInt8(getValue(condition_map, condition));
    buffer.writeUInt16LE(max * 2);
    buffer.writeUInt16LE(min * 2);
    buffer.writeUInt8(getValue(enable_map, enable));
    return buffer.toBytes();
}

/**
 * set temperature mutation config
 * @param {object} temperature_mutation_alarm_config
 * @param {number} temperature_mutation_alarm_config.threshold range: [0.1, 100]
 * @param {number} temperature_mutation_alarm_config.enable values: (0: disable, 1: enable)
 * @example { "temperature_mutation_alarm_config": { "threshold": 1, "enable": 1 } }
 */
function setTemperatureMutationConfig(temperature_mutation_alarm_config) {
    var threshold = temperature_mutation_alarm_config.threshold;
    var enable = temperature_mutation_alarm_config.enable;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("temperature_mutation_alarm_config.enable must be one of " + enable_values.join(", "));
    }
    if (threshold < 0.1 || threshold > 100) {
        throw new Error("temperature_mutation_alarm_config.threshold must be in range [0.1, 100]");
    }

    var buffer = new Buffer(6);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x0c);
    buffer.writeUInt8(0x02);
    buffer.writeUInt16LE(threshold * 10);
    buffer.writeUInt8(getValue(enable_map, enable));
    return buffer.toBytes();
}

/**
 * set humidity mutation config
 * @param {object} humidity_mutation_alarm_config
 * @param {number} humidity_mutation_alarm_config.threshold range: [0.5, 100]
 * @param {number} humidity_mutation_alarm_config.enable values: (0: disable, 1: enable)
 * @example { "humidity_mutation_alarm_config": { "threshold": 1, "enable": 1 } }
 */
function setHumidityMutationConfig(humidity_mutation_alarm_config) {
    var threshold = humidity_mutation_alarm_config.threshold;
    var enable = humidity_mutation_alarm_config.enable;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("humidity_mutation_alarm_config.enable must be one of " + enable_values.join(", "));
    }
    if (threshold < 0.5 || threshold > 100) {
        throw new Error("humidity_mutation_alarm_config.threshold must be in range [0.5, 100]");
    }

    var buffer = new Buffer(6);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x0c);
    buffer.writeUInt8(0x04);
    buffer.writeUInt16LE(threshold * 2);
    buffer.writeUInt8(getValue(enable_map, enable));
    return buffer.toBytes();
}

/**
 * threshold alarm enable
 * @param {number} alarm_release_enable values: (0: disable, 1: enable)
 * @example { "alarm_release_enable": 1 }
 */
function setThresholdAlarmReleaseEnable(alarm_release_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(alarm_release_enable) === -1) {
        throw new Error("alarm_release_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xf5);
    buffer.writeUInt8(getValue(enable_map, alarm_release_enable));
    return buffer.toBytes();
}

/**
 * history function configuration
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
 * @param {object} fetch_history
 * @param {number} fetch_history.start_time
 * @param {number} fetch_history.end_time
 * @example { "fetch_history": { "start_time": 1609459200, "end_time": 1609545600 } }
 */
function fetchHistory(fetch_history) {
    var start_time = fetch_history.start_time;
    var end_time = fetch_history.end_time;

    if (typeof start_time !== "number") {
        throw new Error("start_time must be a number");
    }
    if (end_time && typeof end_time !== "number") {
        throw new Error("end_time must be a number");
    }
    if (end_time && start_time > end_time) {
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
 * set retransmit config
 * @param {number} enable values: (0: disable, 1: enable)
 * @param {number} interval range: [30, 1200], unit: seconds
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
 * data resend interval
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

/**
 * fetch sensor id
 * @param {number} fetch_sensor_id values: (0: all, 1: sensor_1)
 * @example { "fetch_sensor_id": 0 }
 */
function fetchSensorID(fetch_sensor_id) {
    var fetch_sensor_id_values = [0, 1];
    if (fetch_sensor_id_values.indexOf(fetch_sensor_id) === -1) {
        throw new Error("fetch_sensor_id must be one of " + fetch_sensor_id_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x31);
    buffer.writeUInt8(fetch_sensor_id);
    return buffer.toBytes();
}

/**
 * LoRa confirm ack retry times
 * @param {number} ack_retry_times range: [0, 10]
 * @example { "ack_retry_times": 3 }
 */
function setAckRetryTimes(ack_retry_times) {
    if (typeof ack_retry_times !== "number") {
        throw new Error("ack_retry_times must be a number");
    }
    if (ack_retry_times < 0 || ack_retry_times > 10) {
        throw new Error("ack_retry_times must be in range [0, 10]");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x32);
    buffer.writeUInt8(0x00);
    buffer.writeUInt8(0x00);
    buffer.writeUInt8(ack_retry_times);
    return buffer.toBytes();
}

/**
 * set d2d master config
 * @param {object} d2d_master_config
 * @param {number} d2d_master_config._item.mode values: (1: temperature threshold alarm, 2: temperature threshold alarm release, 3: temperature mutation alarm, 4: humidity threshold alarm, 5: humidity threshold alarm release, 6: humidity mutation alarm)
 * @param {number} d2d_master_config._item.enable values: (0: disable, 1: enable)
 * @param {number} d2d_master_config._item.lora_uplink_enable values: (0: disable, 1: enable)
 * @param {string} d2d_master_config._item.d2d_cmd
 * @example { "d2d_master_config": [{ "mode": 1, "enable": 1 }] }
 */
function setD2DMasterConfig(d2d_master_config) {
    var mode = d2d_master_config.mode;
    var enable = d2d_master_config.enable;
    var lora_uplink_enable = d2d_master_config.lora_uplink_enable;
    var d2d_cmd = d2d_master_config.d2d_cmd;

    var mode_map = { 1: "temperature threshold alarm", 2: "temperature threshold alarm release", 3: "temperature mutation alarm", 4: "humidity threshold alarm", 5: "humidity threshold alarm release", 6: "humidity mutation alarm" };
    var mode_values = getValues(mode_map);
    if (mode_values.indexOf(mode) === -1) {
        throw new Error("d2d_master_config._item.mode must be one of " + mode_values.join(", "));
    }

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("d2d_master_config._item.enable must be one of " + enable_values.join(", "));
    }
    if (lora_uplink_enable !== undefined && enable_values.indexOf(lora_uplink_enable) === -1) {
        throw new Error("d2d_master_config._item.lora_uplink_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(10);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x96);
    buffer.writeUInt8(getValue(mode_map, mode));
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt8(getValue(enable_map, lora_uplink_enable));
    buffer.writeD2DCommand(d2d_cmd, "0000");
    buffer.writeUInt16LE(0x00);
    buffer.writeUInt8(0x00);
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
        throw new Error("d2d_key must be hex string [0-9A-F]");
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
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x66);
    buffer.writeUInt8(getValue(enable_map, d2d_enable));
    return buffer.toBytes();
}

/**
 * set uplink config
 * @param {object} d2d_uplink_config
 * @param {number} d2d_uplink_config.d2d_uplink_enable values: (0: disable, 1: enable)
 * @param {number} d2d_uplink_config.lora_uplink_enable values: (0: disable, 1: enable)
 * @param {object} d2d_uplink_config.sensor_data_config
 * @param {number} d2d_uplink_config.sensor_data_config.temperature values: (0: disable, 1: enable)
 * @param {number} d2d_uplink_config.sensor_data_config.humidity values: (0: disable, 1: enable)
 * @example { "d2d_uplink_config": { "d2d_uplink_enable": 1, "lora_uplink_enable": 1, "sensor_data_config": { "temperature": 1, "humidity": 1 } } }
 */
function setD2DUplinkConfig(d2d_uplink_config) {
    var d2d_uplink_enable = d2d_uplink_config.d2d_uplink_enable;
    var lora_uplink_enable = d2d_uplink_config.lora_uplink_enable;
    var sensor_data_config = d2d_uplink_config.sensor_data_config;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(d2d_uplink_enable) === -1) {
        throw new Error("d2d_uplink_config.d2d_uplink_enable must be one of " + enable_values.join(", "));
    }
    if (enable_values.indexOf(lora_uplink_enable) === -1) {
        throw new Error("d2d_uplink_config.lora_uplink_enable must be one of " + enable_values.join(", "));
    }

    var sensor_bit_offset = { temperature: 0, humidity: 1 };
    var data = 0x00;
    for (var key in sensor_data_config) {
        if (key in sensor_bit_offset) {
            if (enable_values.indexOf(sensor_data_config[key]) === -1) {
                throw new Error("d2d_uplink_config.sensor_data_config." + key + " must be one of " + enable_values.join(", "));
            }
            data |= getValue(enable_map, sensor_data_config[key]) << sensor_bit_offset[key];
        }
    }

    var buffer = new Buffer(6);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x63);
    buffer.writeUInt8(getValue(enable_map, d2d_uplink_enable));
    buffer.writeUInt8(getValue(enable_map, lora_uplink_enable));
    buffer.writeUInt16LE(data);
    return buffer.toBytes();
}

/**
 * set button lock config
 * @param {object} button_lock_config
 * @param {number} button_lock_config.power_button values: (0: disable, 1: enable)
 * @param {number} button_lock_config.report_button values: (0: disable, 1: enable)
 * @example { "button_lock_config": { "power_button": 1, "report_button": 1 } }
 */
function setButtonLockConfig(button_lock_config) {
    var button_bit_offset = { power_button: 0, report_button: 1 };

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);

    var data = 0x00;
    for (var key in button_lock_config) {
        if (key in button_bit_offset) {
            if (enable_values.indexOf(button_lock_config[key]) === -1) {
                throw new Error("button_lock_config." + key + " must be one of " + enable_values.join(", "));
            }
            data |= getValue(enable_map, button_lock_config[key]) << button_bit_offset[key];
        }
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x69);
    buffer.writeUInt8(data);
    return buffer.toBytes();
}

/**
 * set led indicator enable
 * @param {number} led_indicator_enable values: (0: disable, 1: enable)
 * @example { "led_indicator_enable": 1 }
 */
function setLedIndicatorEnable(led_indicator_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(led_indicator_enable) === -1) {
        throw new Error("led_indicator_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x6a);
    buffer.writeUInt8(getValue(enable_map, led_indicator_enable));
    return buffer.toBytes();
}

/**
 * set temperature unit
 * @param {number} temperature_unit values: (0: celsius, 1: fahrenheit)
 * @example { "temperature_unit": 0 }
 */
function setTemperatureUnit(temperature_unit) {
    var unit_map = { 0: "celsius", 1: "fahrenheit" };
    var unit_values = getValues(unit_map);
    if (unit_values.indexOf(temperature_unit) === -1) {
        throw new Error("temperature_unit must be one of " + unit_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xeb);
    buffer.writeUInt8(getValue(unit_map, temperature_unit));
    return buffer.toBytes();
}

/**
 * query device config
 * @param {object} query_config
 * @param {number} query_config.temperature_unit values: (0: no, 1: yes)
 * @param {number} query_config.button_lock_config values: (0: no, 1: yes)
 * @param {number} query_config.d2d_config values: (0: no, 1: yes)
 * @param {number} query_config.d2d_enable values: (0: no, 1: yes)
 * @param {number} query_config.d2d_master_config_with_temperature_threshold_alarm values: (0: no, 1: yes)
 * @param {number} query_config.d2d_master_config_with_temperature_threshold_alarm_release values: (0: no, 1: yes)
 * @param {number} query_config.d2d_master_config_with_temperature_mutation_alarm values: (0: no, 1: yes)
 * @param {number} query_config.d2d_master_config_with_humidity_threshold_alarm values: (0: no, 1: yes)
 * @param {number} query_config.d2d_master_config_with_humidity_threshold_alarm_release values: (0: no, 1: yes)
 * @param {number} query_config.d2d_master_config_with_humidity_mutation_alarm values: (0: no, 1: yes)
 * @param {number} query_config.temperature_calibration_settings values: (0: no, 1: yes)
 * @param {number} query_config.humidity_calibration_settings values: (0: no, 1: yes)
 * @param {number} query_config.temperature_alarm_config values: (0: no, 1: yes)
 * @param {number} query_config.humidity_alarm_config values: (0: no, 1: yes)
 * @param {number} query_config.temperature_mutation_alarm_config values: (0: no, 1: yes)
 * @param {number} query_config.humidity_mutation_alarm_config values: (0: no, 1: yes)
 * @param {number} query_config.led_indicator_config values: (0: no, 1: yes)
 * @param {number} query_config.collection_interval values: (0: no, 1: yes)
 * @param {number} query_config.report_interval values: (0: no, 1: yes)
 * @param {number} query_config.alarm_report_counts values: (0: no, 1: yes)
 * @param {number} query_config.history_retransmit_config values: (0: no, 1: yes)
 * @param {number} query_config.history_enable values: (0: no, 1: yes)
 * @param {number} query_config.history_resend_config values: (0: no, 1: yes)
 * @param {number} query_config.lora_ack_config values: (0: no, 1: yes)
 * @example { "query_config": { "temperature_unit": 1, "button_lock_config": 2, "d2d_config": 3, "d2d_enable": 4, "d2d_master_config_with_temperature_threshold_alarm": 5, "d2d_master_config_with_temperature_threshold_alarm_release": 6, "d2d_master_config_with_temperature_mutation_alarm": 7, "d2d_master_config_with_humidity_threshold_alarm": 8, "d2d_master_config_with_humidity_threshold_alarm_release": 9, "d2d_master_config_with_humidity_mutation_alarm": 10, "temperature_calibration_settings": 11, "humidity_calibration_settings": 12, "temperature_alarm_config": 13, "humidity_alarm_config": 14, "temperature_mutation_alarm_config": 15, "humidity_mutation_alarm_config": 16, "led_indicator_config": 17, "collection_interval": 18, "report_interval": 19, "alarm_report_counts": 20, "history_retransmit_config": 21, "history_enable": 22, "history_resend_config": 23, "lora_ack_config": 24 } }
 */
function queryDeviceConfig(query_config) {
    var config_map = {
        temperature_unit: 1,
        button_lock_config: 2,
        d2d_uplink_config: 3,
        d2d_enable: 4,
        d2d_master_config_with_temperature_threshold_alarm: 5,
        d2d_master_config_with_temperature_threshold_alarm_release: 6,
        d2d_master_config_with_temperature_mutation_alarm: 7,
        d2d_master_config_with_humidity_threshold_alarm: 8,
        d2d_master_config_with_humidity_threshold_alarm_release: 9,
        d2d_master_config_with_humidity_mutation_alarm: 10,
        temperature_calibration_settings: 11,
        humidity_calibration_settings: 12,
        temperature_alarm_config: 13,
        temperature_mutation_alarm_config: 14,
        humidity_alarm_config: 15,
        humidity_mutation_alarm_config: 16,
        led_indicator_enable: 17,
        collection_interval: 18,
        report_interval: 19,
        alarm_release_enable: 20,
        alarm_report_counts: 21,
        retransmit_config: 22,
        history_enable: 23,
        history_resend_config: 24,
        ack_retry_times: 25,
    };

    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);

    var data = [];
    for (var key in config_map) {
        if (key in query_config) {
            if (yes_no_values.indexOf(query_config[key]) === -1) {
                throw new Error("query_config." + key + " must be one of " + yes_no_values.join(", "));
            }

            if (getValue(yes_no_map, query_config[key]) === 0) {
                continue;
            }
            var buffer = new Buffer(3);
            buffer.writeUInt8(0xf9);
            buffer.writeUInt8(0x6f);
            buffer.writeUInt8(config_map[key]);
            data = data.concat(buffer.toBytes());
        }
    }
    return data;
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
