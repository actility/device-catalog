/**
 * Payload Decoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product VS373
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
        // DEVICE STATUS
        else if (channel_id === 0xff && channel_type === 0x0b) {
            decoded.device_status = readDeviceStatus(bytes[i]);
            i += 1;
        }
        // LORAWAN CLASS
        else if (channel_id === 0xff && channel_type === 0x0f) {
            decoded.lorawan_class = readLoRaWANClass(bytes[i]);
            i += 1;
        }
        // PRODUCT SERIAL NUMBER
        else if (channel_id === 0xff && channel_type === 0x16) {
            decoded.sn = readSerialNumber(bytes.slice(i, i + 8));
            i += 8;
        }
        // TSL VERSION
        else if (channel_id === 0xff && channel_type === 0xff) {
            decoded.tsl_version = readTslVersion(bytes.slice(i, i + 2));
            i += 2;
        }
        // DETECTION TARGET
        else if (channel_id === 0x03 && channel_type === 0xf8) {
            decoded.detection_status = readDetectionStatus(bytes[i]);
            decoded.target_status = readTargetStatus(bytes[i + 1]);
            decoded.use_time_now = readUInt16LE(bytes.slice(i + 2, i + 4));
            decoded.use_time_today = readUInt16LE(bytes.slice(i + 4, i + 6));
            i += 6;
        }
        // REGION OCCUPANCY
        else if (channel_id === 0x04 && channel_type === 0xf9) {
            decoded.region_1_occupancy = readRegionStatus(bytes[i]);
            decoded.region_2_occupancy = readRegionStatus(bytes[i + 1]);
            decoded.region_3_occupancy = readRegionStatus(bytes[i + 2]);
            decoded.region_4_occupancy = readRegionStatus(bytes[i + 3]);
            i += 4;
        }
        // OUT OF BED
        else if (channel_id === 0x05 && channel_type === 0xfa) {
            decoded.region_1_out_of_bed_time = readUInt16LE(bytes.slice(i, i + 2));
            decoded.region_2_out_of_bed_time = readUInt16LE(bytes.slice(i + 2, i + 4));
            decoded.region_3_out_of_bed_time = readUInt16LE(bytes.slice(i + 4, i + 6));
            decoded.region_4_out_of_bed_time = readUInt16LE(bytes.slice(i + 6, i + 8));
            i += 8;
        }
        // ALARM
        else if (channel_id === 0x06 && channel_type === 0xfb) {
            var event = {};
            event.alarm_id = readUInt16LE(bytes.slice(i, i + 2));
            event.alarm_type = readAlarmType(bytes[i + 2]);
            event.alarm_status = readAlarmStatus(bytes[i + 3]);
            // EVENT TYPE: OUT OF BED
            var event_type = bytes[i + 2];
            if (event_type === 3) {
                event.region_id = readUInt8(bytes[i + 4]);
            }
            i += 5;

            decoded.events = decoded.events || [];
            decoded.events.push(event);
        }
        // HISTORY DATA
        else if (channel_id === 0x20 && channel_type === 0xce) {
            var data = {};
            data.id = readUInt16LE(bytes.slice(i, i + 2));
            data.event_type = readAlarmType(bytes[i + 2]);
            data.event_status = readAlarmStatus(bytes[i + 3]);
            var event_type = bytes[i + 2];
            // EVENT TYPE: OUT OF BED
            if (event_type === 3) {
                data.region_id = readUInt8(bytes[i + 4]);
            }
            i += 5;

            decoded.history = decoded.history || [];
            decoded.history.push(data);
        }
        // DOWNLINK RESPONSE
        else if (channel_id === 0xfe || channel_id === 0xff) {
            var result = handle_downlink_response(channel_type, bytes, i);
            decoded = Object.assign(decoded, result.data);
            i = result.offset;
        } else if (channel_id === 0xf8 || channel_id === 0xf9) {
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
        case 0x04:
            decoded.confirm_mode_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x10:
            decoded.reboot = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x11:
            decoded.timestamp = readUInt32LE(bytes.slice(offset, offset + 4));
            offset += 4;
            break;
        case 0x28:
            decoded.report_status = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x2f:
            decoded.led_indicator_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x35:
            decoded.d2d_key = bytesToHexString(bytes.slice(offset, offset + 8));
            offset += 8;
            break;
        case 0x3e:
            decoded.buzzer_enable = readEnableStatus(bytes[offset]);
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
        case 0x69:
            decoded.retransmit_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x6a:
            var interval_type = readUInt8(bytes[offset]);
            switch (interval_type) {
                case 0:
                    decoded.retransmit_interval = readUInt16LE(bytes.slice(offset + 1, offset + 3));
                    break;
                case 1:
                    decoded.resend_interval = readUInt16LE(bytes.slice(offset + 1, offset + 3));
                    break;
            }
            offset += 3;
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
        case 0x96:
            var config = readD2DMasterConfig(bytes.slice(offset, offset + 8));
            offset += 8;

            decoded.d2d_master_config = decoded.d2d_master_config || [];
            decoded.d2d_master_config.push(config);
            break;
        default:
            throw new Error("unknown downlink response");
    }

    return { data: decoded, offset: offset };
}

function handle_downlink_response_ext(code, channel_type, bytes, offset) {
    var decoded = {};

    switch (channel_type) {
        case 0x48:
            var region_id = readUInt8(bytes[offset]) + 1;
            var region_name = "region_" + region_id;
            decoded.delete_region = {};
            decoded.delete_region[region_name] = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x49:
            var region_settings = readRegionSettings(bytes.slice(offset, offset + 9));
            offset += 9;
            decoded.region_settings = decoded.region_settings || [];
            decoded.region_settings.push(region_settings);
            break;
        case 0x4a:
            var region_detection_settings = readRegionDetectionSettings(bytes.slice(offset, offset + 5));
            offset += 5;
            decoded.region_detection_settings = decoded.region_detection_settings || [];
            decoded.region_detection_settings.push(region_detection_settings);
            break;
        case 0x4b:
            var bed_detection_settings = readBedDetectionSettings(bytes.slice(offset, offset + 9));
            offset += 9;
            decoded.bed_detection_settings = decoded.bed_detection_settings || [];
            decoded.bed_detection_settings.push(bed_detection_settings);
            break;
        case 0x4c:
            var d2d_slave_config = readD2DSlaveConfig(bytes.slice(offset, offset + 5));
            offset += 5;
            decoded.d2d_slave_config = decoded.d2d_slave_config || [];
            decoded.d2d_slave_config.push(d2d_slave_config);
            break;
        case 0x4e:
            decoded.digital_output = readDigitalOutput(bytes[offset]);
            offset += 1;
            break;
        case 0x4d:
            decoded.wifi_ssid_hidden = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x4f:
            decoded.detection_region_settings = readDetectionRegion(bytes.slice(offset, offset + 12));
            offset += 12;
            break;
        case 0x50:
            decoded.detection_settings = readDetectionSettings(bytes.slice(offset, offset + 2));
            offset += 2;
            break;
        case 0x51:
            decoded.fall_detection_settings = readFallDetectionSettings(bytes.slice(offset, offset + 6));
            offset += 6;
            break;
        case 0x52:
            decoded.dwell_detection_settings = readDwellDetectionSettings(bytes.slice(offset, offset + 3));
            offset += 3;
            break;
        case 0x53:
            decoded.motion_detection_settings = readMotionDetectionSettings(bytes.slice(offset, offset + 3));
            offset += 3;
            break;
        case 0x54:
            decoded.radar_settings = readRadarSettings(bytes.slice(offset, offset + 2));
            offset += 2;
            break;
        case 0x56:
            decoded.existence_detection_settings = readExistenceDetectionSettings(bytes.slice(offset, offset + 2));
            offset += 2;
            break;
        case 0x64:
            decoded.release_alarm = readYesNoStatus(bytes[offset]);
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
    var lorawan_class_map = {
        0: "Class A",
        1: "Class B",
        2: "Class C",
        3: "Class CtoB",
    };
    return getValue(lorawan_class_map, type);
}

function readDeviceStatus(status) {
    var device_status_map = { 0: "off", 1: "on" };
    return getValue(device_status_map, status);
}

function readDetectionStatus(status) {
    var detection_status_map = {
        0: "normal",
        1: "vacant",
        2: "in_bed",
        3: "out_of_bed",
        4: "fall",
    };
    return getValue(detection_status_map, status);
}

function readTargetStatus(status) {
    var target_status_map = {
        0: "normal",
        1: "motionless",
        2: "abnormal",
    };
    return getValue(target_status_map, status);
}

function readRegionStatus(status) {
    var region_status_map = {
        0: "occupied",
        1: "vacant",
    };
    return getValue(region_status_map, status);
}

function readAlarmType(type) {
    var alarm_type_map = {
        0: "fall",
        1: "motionless",
        2: "dwell",
        3: "out_of_bed",
        4: "occupied",
        5: "vacant",
    };
    return getValue(alarm_type_map, type);
}

function readAlarmStatus(status) {
    var alarm_status_map = {
        1: "alarm_triggered",
        2: "alarm_deactivated",
        3: "alarm_ignored",
    };
    return getValue(alarm_status_map, status);
}

function readEnableStatus(status) {
    var enable_status_map = { 0: "disable", 1: "enable" };
    return getValue(enable_status_map, status);
}

function readYesNoStatus(status) {
    var yes_no_status_map = { 0: "no", 1: "yes" };
    return getValue(yes_no_status_map, status);
}

function readDigitalOutput(status) {
    var digital_output_map = { 0: "low", 1: "high" };
    return getValue(digital_output_map, status);
}

function readDetectionRegion(bytes) {
    var detection_region = {};
    detection_region.x_min = readUInt16LE(bytes.slice(0, 2));
    detection_region.x_max = readUInt16LE(bytes.slice(2, 4));
    detection_region.y_min = readUInt16LE(bytes.slice(4, 6));
    detection_region.y_max = readUInt16LE(bytes.slice(6, 8));
    detection_region.z_max = readUInt16LE(bytes.slice(8, 10));
    detection_region.install_height = readUInt16LE(bytes.slice(10, 12));
    return detection_region;
}

function readDetectionSettings(bytes) {
    var detection_settings = {};
    detection_settings.mode = readDetectionMode(bytes[0]);
    detection_settings.sensitivity = readDetectionSensitivity(bytes[1]);
    return detection_settings;
}

function readDetectionMode(type) {
    var detection_mode_map = { 0: "default", 1: "bedroom", 2: "bathroom", 3: "public" };
    return getValue(detection_mode_map, type);
}

function readDetectionSensitivity(type) {
    var detection_sensitivity_map = { 0: "low", 1: "high" };
    return getValue(detection_sensitivity_map, type);
}

function readFallDetectionSettings(bytes) {
    var fall_detection_settings = {};
    fall_detection_settings.confirm_time = readUInt16LE(bytes.slice(0, 2));
    fall_detection_settings.delay_report_time = readUInt16LE(bytes.slice(2, 4));
    fall_detection_settings.alarm_duration = readUInt16LE(bytes.slice(4, 6));
    return fall_detection_settings;
}

function readDwellDetectionSettings(bytes) {
    var dwell_detection_settings = {};
    dwell_detection_settings.enable = readEnableStatus(bytes[0]);
    dwell_detection_settings.dwell_time = readUInt16LE(bytes.slice(1, 3));
    return dwell_detection_settings;
}

function readMotionDetectionSettings(bytes) {
    var motion_detection_settings = {};
    motion_detection_settings.enable = readEnableStatus(bytes[0]);
    motion_detection_settings.motionless_time = readUInt16LE(bytes.slice(1, 3));
    return motion_detection_settings;
}

function readRadarSettings(bytes) {
    var radar_settings = {};
    radar_settings.mode = readRadarMode(bytes[0]);
    radar_settings.frame_rate = readUInt8(bytes[1]);
    return radar_settings;
}

function readRadarMode(type) {
    var radar_mode_map = { 0: "const", 1: "free" };
    return getValue(radar_mode_map, type);
}

function readExistenceDetectionSettings(bytes) {
    var existence_detection_settings = {};
    existence_detection_settings.exist_confirm_time = readUInt8(bytes[0]);
    existence_detection_settings.leaved_confirm_time = readUInt8(bytes[1]);
    return existence_detection_settings;
}

function readRegionSettings(bytes) {
    var region_settings = {};
    region_settings.region_id = readUInt8(bytes[0]) + 1;
    region_settings.x_min = readUInt16LE(bytes.slice(1, 3));
    region_settings.x_max = readUInt16LE(bytes.slice(3, 5));
    region_settings.y_min = readUInt16LE(bytes.slice(5, 7));
    region_settings.y_max = readUInt16LE(bytes.slice(7, 9));
    return region_settings;
}

function readRegionDetectionSettings(bytes) {
    var region_detection_settings = {};
    region_detection_settings.region_id = readUInt8(bytes[0]) + 1;
    region_detection_settings.fall_detection_enable = readEnableStatus(bytes[1]);
    region_detection_settings.dwell_detection_enable = readEnableStatus(bytes[2]);
    region_detection_settings.motion_detection_enable = readEnableStatus(bytes[3]);
    region_detection_settings.region_type = readRegionType(bytes[4]);
    return region_detection_settings;
}

function readRegionType(type) {
    var region_type_map = { 0: "default", 1: "bed", 2: "door" };
    return getValue(region_type_map, type);
}

function readBedDetectionSettings(bytes) {
    var bed_detection_settings = {};
    bed_detection_settings.bed_id = readUInt8(bytes[0]) + 1;
    bed_detection_settings.enable = readEnableStatus(bytes[1]);
    bed_detection_settings.start_time = readUInt16LE(bytes.slice(2, 4));
    bed_detection_settings.end_time = readUInt16LE(bytes.slice(4, 6));
    bed_detection_settings.bed_height = readUInt16LE(bytes.slice(6, 8));
    bed_detection_settings.out_of_bed_time = readUInt16LE(bytes.slice(8, 10));
    return bed_detection_settings;
}

function readD2DMasterConfig(bytes) {
    var offset = 0;
    var config = {};
    config.mode = readD2DMode(readUInt8(bytes[offset]));
    config.enable = readEnableStatus(bytes[offset + 1]);
    config.lora_uplink_enable = readEnableStatus(bytes[offset + 2]);
    config.d2d_cmd = readD2DCommand(bytes.slice(offset + 3, offset + 5));
    config.time = readUInt16LE(bytes.slice(offset + 5, offset + 7));
    config.time_enable = readEnableStatus(bytes[offset + 7]);
    return config;
}

function readD2DCommand(bytes) {
    return ("0" + (bytes[1] & 0xff).toString(16)).slice(-2) + ("0" + (bytes[0] & 0xff).toString(16)).slice(-2);
}

function readD2DMode(type) {
    var d2d_mode_map = { 0: "occupied", 1: "vacant", 2: "fall", 3: "out_of_bed", 4: "motionless", 5: "dwell" };
    return getValue(d2d_mode_map, type);
}

function readD2DSlaveConfig(bytes) {
    var d2d_slave_config = {};
    d2d_slave_config.mode = readD2DMode(readUInt8(bytes[0]));
    d2d_slave_config.d2d_cmd = readD2DCommand(bytes.slice(1, 3));
    d2d_slave_config.control_type = readD2DControlType(bytes[3]);
    d2d_slave_config.action_type = readD2DActionType(bytes[4]);
    return d2d_slave_config;
}

function readD2DControlType(type) {
    var d2d_control_type_map = { 1: "button" };
    return getValue(d2d_control_type_map, type);
}

function readD2DActionType(type) {
    var d2d_action_type_map = { 1: "alarm_deactivate", 2: "wifi_on", 3: "wifi_off" };
    return getValue(d2d_action_type_map, type);
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

function readFloatLE(bytes) {
    var bits = (bytes[3] << 24) | (bytes[2] << 16) | (bytes[1] << 8) | bytes[0];
    var sign = bits >>> 31 === 0 ? 1.0 : -1.0;
    var e = (bits >>> 23) & 0xff;
    var m = e === 0 ? (bits & 0x7fffff) << 1 : (bits & 0x7fffff) | 0x800000;
    var f = sign * m * Math.pow(2, e - 150);
    return f;
}

function bytesToHexString(bytes) {
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

if (!Object.assign) {
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
 * @product VS373
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
    if ("digital_output" in payload) {
        encoded = encoded.concat(setDigitalOutput(payload.digital_output));
    }
    if ("detection_region_settings" in payload) {
        encoded = encoded.concat(setDetectionRegion(payload.detection_region_settings));
    }
    if ("detection_settings" in payload) {
        encoded = encoded.concat(setDetectionModeAndSensitivity(payload.detection_settings));
    }
    if ("fall_detection_settings" in payload) {
        encoded = encoded.concat(setFallDetectionSettings(payload.fall_detection_settings));
    }
    if ("dwell_detection_settings" in payload) {
        encoded = encoded.concat(setDwellDetectionSettings(payload.dwell_detection_settings));
    }
    if ("motion_detection_settings" in payload) {
        encoded = encoded.concat(setMotionDetectionSettings(payload.motion_detection_settings));
    }
    if ("sleep_detection_config" in payload) {
        encoded = encoded.concat(setSleepDetectionConfig(payload.sleep_detection_config));
    }
    if ("respiratory_detection_config" in payload) {
        encoded = encoded.concat(setRespiratoryDetectionConfig(payload.respiratory_detection_config));
    }
    if ("ai_fall_detection_enable" in payload) {
        encoded = encoded.concat(setAIFallDetectionEnable(payload.ai_fall_detection_enable));
    }
    if ("led_indicator_enable" in payload) {
        encoded = encoded.concat(setLedIndicatorEnable(payload.led_indicator_enable));
    }
    if ("buzzer_enable" in payload) {
        encoded = encoded.concat(setBuzzerEnable(payload.buzzer_enable));
    }
    if ("release_alarm" in payload) {
        encoded = encoded.concat(releaseAlarm(payload.release_alarm));
    }
    if ("confirm_fall_alarm" in payload) {
        encoded = encoded.concat(confirmFallAlarm(payload.confirm_fall_alarm));
    }
    if ("existence_detection_settings" in payload) {
        encoded = encoded.concat(setExistenceDetectionSettings(payload.existence_detection_settings));
    }
    if ("region_settings" in payload) {
        for (var i = 0; i < payload.region_settings.length; i++) {
            var settings = payload.region_settings[i];
            encoded = encoded.concat(setRegionSettings(settings));
        }
    }
    if ("delete_region" in payload) {
        encoded = encoded.concat(deleteRegion(payload.delete_region));
    }
    if ("region_detection_settings" in payload) {
        for (var i = 0; i < payload.region_detection_settings.length; i++) {
            var settings = payload.region_detection_settings[i];
            encoded = encoded.concat(setRegionDetectionSettings(settings));
        }
    }
    if ("bed_detection_settings" in payload) {
        for (var i = 0; i < payload.bed_detection_settings.length; i++) {
            var settings = payload.bed_detection_settings[i];
            encoded = encoded.concat(setBedDetectionSettings(settings));
        }
    }
    if ("retransmit_enable" in payload) {
        encoded = encoded.concat(setRetransmitEnable(payload.retransmit_enable));
    }
    if ("retransmit_interval" in payload) {
        encoded = encoded.concat(setRetransmitInterval(payload.retransmit_interval));
    }
    if ("confirm_mode_enable" in payload) {
        encoded = encoded.concat(setConfirmMode(payload.confirm_mode_enable));
    }
    if ("adr_enable" in payload) {
        encoded = encoded.concat(setADREnable(payload.adr_enable));
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
    if ("d2d_slave_config" in payload) {
        for (var i = 0; i < payload.d2d_slave_config.length; i++) {
            var config = payload.d2d_slave_config[i];
            encoded = encoded.concat(setD2DSlaveConfig(config));
        }
    }
    if ("timestamp" in payload) {
        encoded = encoded.concat(setTime(payload.timestamp));
    }
    if ("wifi_enable" in payload) {
        encoded = encoded.concat(setWiFiEnable(payload.wifi_enable));
    }
    if ("wifi_ssid_hidden" in payload) {
        encoded = encoded.concat(setWiFiSSIDHidden(payload.wifi_ssid_hidden));
    }
    if ("stop_transmit" in payload) {
        encoded = encoded.concat(stopTransmit(payload.stop_transmit));
    }
    if ("fetch_history" in payload) {
        encoded = encoded.concat(fetchHistory(payload.fetch_history));
    }
    if ("time_sync_config" in payload) {
        encoded = encoded.concat(setTimeSyncConfig(payload.time_sync_config));
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
    if ("trigger_digital_output_config" in payload) {
        encoded = encoded.concat(setTriggerDigitalOutputConfig(payload.trigger_digital_output_config));
    }

    return encoded;
}

/**
 * reboot device
 * @param {number} reboot values: (0: no, 1: yes)
 * @example { "reboot": 1 }
 */
function reboot(reboot) {
    var value_map = { 0: "no", 1: "yes" };
    var value_values = getValues(value_map);
    if (value_values.indexOf(reboot) === -1) {
        throw new Error("reboot must be one of " + value_values.join(", "));
    }

    if (getValue(value_map, reboot) === 0) {
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
 * @param {number} report_interval unit: minute
 * @example { "report_interval": 20 }
 */
function setReportInterval(report_interval) {
    if (typeof report_interval !== "number") {
        throw new Error("report_interval must be a number");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x8e);
    buffer.writeUInt8(0x00);
    buffer.writeUInt16LE(report_interval);
    return buffer.toBytes();
}

/**
 * set digital output
 * @param {number} digital_output values: (0: low, 1: high)
 * @example { "digital_output": 1 }
 */
function setDigitalOutput(digital_output) {
    var value_map = { 0: "low", 1: "high" };
    var value_values = getValues(value_map);
    if (value_values.indexOf(digital_output) === -1) {
        throw new Error("digital_output must be one of " + value_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x4e);
    buffer.writeUInt8(getValue(value_map, digital_output));
    return buffer.toBytes();
}

/**
 * set detection region
 * @param {object} detection_region_settings
 * @param {number} detection_region_settings.x_min
 * @param {number} detection_region_settings.x_max
 * @param {number} detection_region_settings.y_min
 * @param {number} detection_region_settings.y_max
 * @param {number} detection_region_settings.z_max
 * @param {number} detection_region_settings.install_height unit: mm
 * @example { "detection_region_settings": { "x_min": 0, "x_max": 100, "y_min": 0, "y_max": 100, "z_max": 100, "install_height": 100 } }
 */
function setDetectionRegion(detection_region_settings) {
    var x_min = detection_region_settings.x_min;
    var x_max = detection_region_settings.x_max;
    var y_min = detection_region_settings.y_min;
    var y_max = detection_region_settings.y_max;
    var z_max = detection_region_settings.z_max;
    var install_height = detection_region_settings.install_height;

    var buffer = new Buffer(14);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x4f);
    buffer.writeInt16LE(x_min);
    buffer.writeInt16LE(x_max);
    buffer.writeInt16LE(y_min);
    buffer.writeInt16LE(y_max);
    buffer.writeUInt16LE(z_max);
    buffer.writeUInt16LE(install_height);
    return buffer.toBytes();
}

/**
 * set detection mode and sensitivity
 * @param {object} detection_settings
 * @param {number} detection_settings.mode values: (0: default, 1: bedroom, 2: bathroom, 3: public)
 * @param {number} detection_settings.sensitivity values: (0: low, 1: high, 2: medium, 3: custom)
 * @example { "detection_settings": { "mode": 0, "sensitivity": 1 } }
 */
function setDetectionModeAndSensitivity(detection_settings) {
    var mode = detection_settings.mode;
    var sensitivity = detection_settings.sensitivity;

    var mode_map = { 0: "default", 1: "bedroom", 2: "bathroom", 3: "public" };
    var mode_values = getValues(mode_map);
    if (mode_values.indexOf(mode) === -1) {
        throw new Error("detection_settings.mode must be in " + mode_values.join(", "));
    }
    var sensitivity_map = { 0: "low", 1: "high", 2: "medium", 3: "custom" };
    var sensitivity_values = getValues(sensitivity_map);
    if (sensitivity_values.indexOf(sensitivity) === -1) {
        throw new Error("detection_settings.sensitivity must be in " + sensitivity_values.join(", "));
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x50);
    buffer.writeUInt8(getValue(mode_map, mode));
    buffer.writeUInt8(getValue(sensitivity_map, sensitivity));
    return buffer.toBytes();
}

/**
 * set fall detection settings
 * @param {object} fall_detection_settings
 * @param {number} fall_detection_settings.confirm_time unit: s, range: [0, 300]
 * @param {number} fall_detection_settings.delay_report_time unit: s, range: [0, 300]
 * @param {number} fall_detection_settings.alarm_duration unit: s, range: [0, 1800]
 * @example { "fall_detection_settings": { "confirm_time": 10, "delay_report_time": 10, "alarm_duration": 10 } }
 */
function setFallDetectionSettings(fall_detection_settings) {
    var confirm_time = fall_detection_settings.confirm_time;
    var delay_report_time = fall_detection_settings.delay_report_time;
    var alarm_duration = fall_detection_settings.alarm_duration;

    if (confirm_time < 0 || confirm_time > 300) {
        throw new Error("fall_detection_settings.confirm_time must be in [0, 300]");
    }
    if (delay_report_time < 0 || delay_report_time > 300) {
        throw new Error("fall_detection_settings.delay_report_time must be in [0, 300]");
    }
    if (alarm_duration < 0 || alarm_duration > 1800) {
        throw new Error("fall_detection_settings.alarm_duration must be in [0, 1800]");
    }

    var buffer = new Buffer(8);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x51);
    buffer.writeUInt16LE(confirm_time);
    buffer.writeUInt16LE(delay_report_time);
    buffer.writeUInt16LE(alarm_duration);
    return buffer.toBytes();
}

/**
 * set dwell detection settings
 * @param {object} dwell_detection_settings
 * @param {number} dwell_detection_settings.enable values: (0: disable, 1: enable)
 * @param {number} dwell_detection_settings.dwell_time unit: min
 * @example { "dwell_detection_settings": { "enable": 1, "dwell_time": 10 } }
 */
function setDwellDetectionSettings(dwell_detection_settings) {
    var enable = dwell_detection_settings.enable;
    var dwell_time = dwell_detection_settings.dwell_time;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("dwell_detection_settings.enable must be in " + enable_values.join(", "));
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x52);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt16LE(dwell_time);
    return buffer.toBytes();
}

/**
 * set motion detection settings
 * @param {object} motion_detection_settings
 * @param {number} motion_detection_settings.enable values: (0: disable, 1: enable)
 * @param {number} motion_detection_settings.motionless_time unit: min
 * @example { "motion_detection": { "enable": 1, "position_filter_enable": 1, "motionless_time": 10 } }
 */
function setMotionDetectionSettings(motion_detection_settings) {
    var enable = motion_detection_settings.enable;
    var motionless_time = motion_detection_settings.motionless_time;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("motionless_detection_settings.enable must be in " + enable_values.join(", "));
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x53);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt8(0x00);
    buffer.writeUInt8(motionless_time);
    return buffer.toBytes();
}

/**
 * set sleep detection config
 * @since v1.0.2
 * @param {object} sleep_detection_config
 * @param {number} sleep_detection_config.enable values: (0: disable, 1: enable)
 * @param {number} sleep_detection_config.start_time unit: min
 * @param {number} sleep_detection_config.end_time unit: min
 * @param {number} sleep_detection_config.out_of_bed_enable values: (0: disable, 1: enable)
 * @param {number} sleep_detection_config.out_of_bed_time unit: min
 * @example { "sleep_detection_config": { "enable": 1, "start_time": 10, "end_time": 10, "out_of_bed_enable": 1, "out_of_bed_time": 10 } }
 */
function setSleepDetectionConfig(sleep_detection_config) {
    var enable = sleep_detection_config.enable;
    var start_time = sleep_detection_config.start_time;
    var end_time = sleep_detection_config.end_time;
    var out_of_bed_enable = sleep_detection_config.out_of_bed_enable;
    var out_of_bed_time = sleep_detection_config.out_of_bed_time;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("sleep_detection_config.enable must be in " + enable_values.join(", "));
    }

    var buffer = new Buffer(9);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0xb1);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt16LE(start_time);
    buffer.writeUInt16LE(end_time);
    buffer.writeUInt8(getValue(enable_map, out_of_bed_enable));
    buffer.writeUInt8(out_of_bed_time);
    return buffer.toBytes();
}

/**
 * set respiratory detection config
 * @since v1.0.2
 * @param {object} respiratory_detection_config
 * @param {number} respiratory_detection_config.enable values: (0: disable, 1: enable)
 * @param {number} respiratory_detection_config.min
 * @param {number} respiratory_detection_config.max
 * @example { "respiratory_detection_config": { "enable": 1, "min": 10, "max": 20 } }
 */
function setRespiratoryDetectionConfig(respiratory_detection_config) {
    var enable = respiratory_detection_config.enable;
    var min = respiratory_detection_config.min;
    var max = respiratory_detection_config.max;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("respiratory_detection_config.enable must be in " + enable_values.join(", "));
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0xb2);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt8(min);
    buffer.writeUInt8(max);
    return buffer.toBytes();
}

/**
 * set AI fall detection enable
 * @since v1.0.2
 * @param {number} ai_fall_detection_enable values: (0: disable, 1: enable)
 * @example { "ai_fall_detection_enable": 1 } }
 */
function setAIFallDetectionEnable(ai_fall_detection_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(ai_fall_detection_enable) === -1) {
        throw new Error("ai_fall_detection_enable must be in " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0xb3);
    buffer.writeUInt8(getValue(enable_map, ai_fall_detection_enable));
    return buffer.toBytes();
}

/**
 * set led indicator enable
 * @param {number} led_indicator_enable values: (0: disable, 1: enable)
 * @example { "led_indicator_enable": 1 } }
 */
function setLedIndicatorEnable(led_indicator_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(led_indicator_enable) === -1) {
        throw new Error("led_indicator_enable must be in " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x2f);
    buffer.writeUInt8(getValue(enable_map, led_indicator_enable));
    return buffer.toBytes();
}

/**
 * set buzzer enable
 * @param {number} buzzer_enable values: (0: disable, 1: enable)
 * @example { "buzzer_enable": 1 } }
 */
function setBuzzerEnable(buzzer_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(buzzer_enable) === -1) {
        throw new Error("buzzer_enable must be in " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x3e);
    buffer.writeUInt8(getValue(enable_map, buzzer_enable));
    return buffer.toBytes();
}

/**
 * release alarm
 * @param {number} release_alarm values: (0: no, 1: yes)
 * @example { "release_alarm": 1 } }
 */
function releaseAlarm(release_alarm) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(release_alarm) === -1) {
        throw new Error("release_alarm must be in " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, release_alarm) === 0) {
        return [];
    }
    return [0xff, 0x64, 0xff];
}

/**
 * confirm fall alarm
 * @since v1.0.2
 * @param {object} confirm_fall_alarm
 * @param {number} confirm_fall_alarm.alarm_id
 * @param {number} confirm_fall_alarm.action values: (2: dismiss, 3: ignore)
 * @example { "confirm_fall_alarm": { "alarm_id": 1, "action": 2 } }
 */
function confirmFallAlarm(confirm_fall_alarm) {
    var alarm_id = confirm_fall_alarm.alarm_id;
    var action = confirm_fall_alarm.action;

    var action_mode = { 2: "dismiss", 3: "ignore" };
    var action_values = getValues(action_mode);
    if (action_values.indexOf(action) === -1) {
        throw new Error("confirm_fall_alarm.action must be in " + action_values.join(", "));
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0xb4);
    buffer.writeUInt16LE(alarm_id);
    buffer.writeUInt8(getValue(action_mode, action));
    return buffer.toBytes();
}

/**
 * set existence detection settings
 * @param {object} existence_detection_settings
 * @param {number} existence_detection_settings.exist_confirm_time unit: s, range: [0, 60]
 * @param {number} existence_detection_settings.leaved_confirm_time unit: s, range: [0, 60]
 * @example { "existence_detection_settings": { "exist_confirm_time": 10, "leaved_confirm_time": 10 } }
 */
function setExistenceDetectionSettings(existence_detection_settings) {
    var exist_confirm_time = existence_detection_settings.exist_confirm_time;
    var leaved_confirm_time = existence_detection_settings.leaved_confirm_time;

    if (exist_confirm_time < 0 || exist_confirm_time > 60) {
        throw new Error("existence_detection_settings.exist_confirm_time must be in [0, 60]");
    }
    if (leaved_confirm_time < 0 || leaved_confirm_time > 60) {
        throw new Error("existence_detection_settings.leaved_confirm_time must be in [0, 60]");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x56);
    buffer.writeUInt8(exist_confirm_time);
    buffer.writeUInt8(leaved_confirm_time);
    return buffer.toBytes();
}

/**
 * set region settings
 * @param {object} region_settings
 * @param {number} region_settings._item.region_id range: [1, 4]
 * @param {number} region_settings._item.x_min
 * @param {number} region_settings._item.x_max
 * @param {number} region_settings._item.y_min
 * @param {number} region_settings._item.y_max
 * @example { "region_settings": [{ "region_id": 1, "x_min": 0, "x_max": 100, "y_min": 0, "y_max": 100 }] }
 */
function setRegionSettings(region_settings) {
    var region_id = region_settings.region_id;
    var x_min = region_settings.x_min;
    var x_max = region_settings.x_max;
    var y_min = region_settings.y_min;
    var y_max = region_settings.y_max;

    if (region_id < 1 || region_id > 4) {
        throw new Error("region_settings._item.region_id must be in [1, 4]");
    }

    var buffer = new Buffer(11);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x49);
    buffer.writeUInt8(region_id - 1);
    buffer.writeInt16LE(x_min);
    buffer.writeInt16LE(x_max);
    buffer.writeInt16LE(y_min);
    buffer.writeInt16LE(y_max);
    return buffer.toBytes();
}

/**
 * delete region
 * @param {object} delete_region
 * @param {number} delete_region.region_1 values: (0: no, 1: yes)
 * @param {number} delete_region.region_2 values: (0: no, 1: yes)
 * @param {number} delete_region.region_3 values: (0: no, 1: yes)
 * @param {number} delete_region.region_4 values: (0: no, 1: yes)
 * @example { "delete_region": { "region_1": 1 } }
 */
function deleteRegion(delete_region) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);

    var data = [];
    var region_offset = { region_1: 0, region_2: 1, region_3: 2, region_4: 3 };
    for (var key in region_offset) {
        if (key in delete_region) {
            if (yes_no_values.indexOf(delete_region[key]) === -1) {
                throw new Error("delete_region." + key + " must be in " + yes_no_values.join(", "));
            }
            if (getValue(yes_no_map, delete_region[key]) === 0) {
                continue;
            }

            var buffer = new Buffer(3);
            buffer.writeUInt8(0xf9);
            buffer.writeUInt8(0x48);
            buffer.writeUInt8(region_offset[key]);
            data = data.concat(buffer.toBytes());
        }
    }

    return data;
}

/**
 * set region detection settings
 * @param {object} region_detection_settings
 * @param {number} region_detection_settings._item.region_id range: [1, 4]
 * @param {number} region_detection_settings._item.fall_detection_enable values: (0: disable, 1: enable)
 * @param {number} region_detection_settings._item.dwell_detection_enable values: (0: disable, 1: enable)
 * @param {number} region_detection_settings._item.motion_detection_enable values: (0: disable, 1: enable)
 * @param {number} region_detection_settings._item.region_type values: (0: custom, 1: bed, 2: door, 3: ignore)
 * @example { "region_detection_settings": [{ "region_id": 1, "fall_detection_enable": 1, "dwell_detection_enable": 1, "motion_detection_enable": 1, "region_type": 0 }] }
 */
function setRegionDetectionSettings(region_detection_settings) {
    var region_id = region_detection_settings.region_id;
    var fall_detection_enable = region_detection_settings.fall_detection_enable;
    var dwell_detection_enable = region_detection_settings.dwell_detection_enable;
    var motion_detection_enable = region_detection_settings.motion_detection_enable;
    var region_type = region_detection_settings.region_type;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(fall_detection_enable) === -1) {
        throw new Error("region_detection_settings._item.fall_detection_enable must be in " + enable_values.join(", "));
    }
    if (enable_values.indexOf(dwell_detection_enable) === -1) {
        throw new Error("region_detection_settings._item.dwell_detection_enable must be in " + enable_values.join(", "));
    }
    if (enable_values.indexOf(motion_detection_enable) === -1) {
        throw new Error("region_detection_settings._item.motion_detection_enable must be in " + enable_values.join(", "));
    }
    var region_type_map = { 0: "custom", 1: "bed", 2: "door", 3: "ignore" };
    var region_type_values = getValues(region_type_map);
    if (region_type_values.indexOf(region_type) === -1) {
        throw new Error("region_detection_settings._item.region_type must be in " + region_type_values.join(", "));
    }

    var buffer = new Buffer(7);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x4a);
    buffer.writeUInt8(region_id - 1);
    buffer.writeUInt8(getValue(enable_map, fall_detection_enable));
    buffer.writeUInt8(getValue(enable_map, dwell_detection_enable));
    buffer.writeUInt8(getValue(enable_map, motion_detection_enable));
    buffer.writeUInt8(getValue(region_type_map, region_type));
    return buffer.toBytes();
}

/**
 * set bed detection settings
 * @deprecated
 * @since v1.0.1
 * @param {object} bed_detection_settings
 * @param {number} bed_detection_settings._item.bed_id range: [1, 4]
 * @param {number} bed_detection_settings._item.enable values: (0: disable, 1: enable)
 * @param {number} bed_detection_settings._item.start_time unit: min
 * @param {number} bed_detection_settings._item.end_time unit: min
 * @param {number} bed_detection_settings._item.bed_height unit: mm
 * @param {number} bed_detection_settings._item.out_of_bed_time unit: min
 * @example { "bed_detection_settings": [{ "bed_id": 1, "enable": 1, "start_time": 10, "end_time": 10, "bed_height": 10, "out_of_bed_time": 10 }] }
 */
function setBedDetectionSettings(bed_detection_settings) {
    var bed_id = bed_detection_settings.bed_id;
    var enable = bed_detection_settings.enable;
    var start_time = bed_detection_settings.start_time;
    var end_time = bed_detection_settings.end_time;
    var bed_height = bed_detection_settings.bed_height;
    var out_of_bed_time = bed_detection_settings.out_of_bed_time;

    if (bed_id < 1 || bed_id > 4) {
        throw new Error("bed_detection_settings._item.bed_id must be in [1, 4]");
    }
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("bed_detection_settings._item.enable must be in " + enable_values.join(", "));
    }

    var buffer = new Buffer(11);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x4b);
    buffer.writeUInt8(bed_id - 1);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt16LE(start_time);
    buffer.writeUInt16LE(end_time);
    buffer.writeUInt16LE(bed_height);
    buffer.writeUInt8(out_of_bed_time);
    return buffer.toBytes();
}

/**
 * retransmit enable
 * @param {number} retransmit_enable values: (0: disable, 1: enable)
 */
function setRetransmitEnable(retransmit_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(retransmit_enable) === -1) {
        throw new Error("retransmit_enable must be in " + enable_values.join(", "));
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
 * fetch history
 * @param {object} fetch_history
 * @param {number} fetch_history.start_time
 * @param {number} fetch_history.end_time
 * @example { "fetch_history": { "start_time": 1609459200, "end_time": 1609545600 } }
 */
function fetchHistory(fetch_history) {
    var start_time = fetch_history.start_time;
    var end_time = fetch_history.end_time;

    if (start_time > end_time) {
        throw new Error("fetch_history.start_time must be less than fetch_history.end_time");
    }
    var buffer = new Buffer(10);
    buffer.writeUInt8(0xfd);
    buffer.writeUInt8(0x6c);
    buffer.writeUInt32LE(start_time);
    buffer.writeUInt32LE(end_time);

    return buffer.toBytes();
}

/**
 * history stop transmit
 * @param {number} stop_transmit values: (0: no, 1: yes)
 * @example { "stop_transmit": 1 }
 */
function stopTransmit(stop_transmit) {
    var value_map = { 0: "no", 1: "yes" };
    var value_values = getValues(value_map);
    if (value_values.indexOf(stop_transmit) === -1) {
        throw new Error("stop_transmit must be one of " + value_values.join(", "));
    }

    if (getValue(value_map, stop_transmit) === 0) {
        return [];
    }
    return [0xfd, 0x6d, 0xff];
}

/**
 * set confirm mode
 * @param {number} confirm_mode_enable values: (0: disable, 1: enable)
 * @example { "confirm_mode_enable": 1 }
 */
function setConfirmMode(confirm_mode_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(confirm_mode_enable) === -1) {
        throw new Error("confirm_mode must be in " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x04);
    buffer.writeUInt8(getValue(enable_map, confirm_mode_enable));
    return buffer.toBytes();
}

/**
 * set ADR
 * @param {number} adr_enable values: (0: disable, 1: enable)
 * @example { "adr_enable": 1 }
 */
function setADREnable(adr_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(adr_enable) === -1) {
        throw new Error("adr_enable must be in " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x40);
    buffer.writeUInt8(getValue(enable_map, adr_enable));
    return buffer.toBytes();
}

/**
 * set d2d key
 * @param {string} d2d_key hex string
 * @example { "d2d_key": "0000000000000000" }
 */
function setD2DKey(d2d_key) {
    if (typeof d2d_key !== "string") {
        throw new Error("d2d_key must be a string");
    }
    if (d2d_key.length !== 16) {
        throw new Error("d2d_key must be 16 characters");
    }
    if (!/^[0-9A-F]+$/.test(d2d_key)) {
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
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x84);
    buffer.writeUInt8(getValue(enable_map, d2d_enable));
    return buffer.toBytes();
}

/**
 * d2d master configuration
 * @param {object} d2d_master_config
 * @param {number} d2d_master_config.mode values: (0: occupied, 1: vacant, 2: fall, 3: out_of_bed, 4: motionless, 5: dwell)
 * @param {number} d2d_master_config.enable values: (0: disable, 1: enable)
 * @param {number} d2d_master_config.lora_uplink_enable values: (0: disable, 1: enable)
 * @param {string} d2d_master_config.d2d_cmd
 * @param {number} d2d_master_config.time_enable values: (0: disable, 1: enable)
 * @param {number} d2d_master_config.time unit: minute
 * @example { "d2d_master_config": [{ "mode": 0, "enable": 1, "d2d_cmd": "0000", "uplink_enable": 1, "time_enable": 1, "time": 10 }] }
 */
function setD2DMasterConfig(d2d_master_config) {
    var mode = d2d_master_config.mode;
    var enable = d2d_master_config.enable;
    var lora_uplink_enable = d2d_master_config.lora_uplink_enable;
    var d2d_cmd = d2d_master_config.d2d_cmd;
    var time_enable = d2d_master_config.time_enable;
    var time = d2d_master_config.time;

    var mode_map = { 0: "occupied", 1: "vacant", 2: "fall", 3: "out_of_bed", 4: "motionless", 5: "dwell" };
    var mode_values = getValues(mode_map);
    if (mode_values.indexOf(mode) === -1) {
        throw new Error("d2d_master_config._item.mode must be one of " + mode_values.join(", "));
    }
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("d2d_master_config._item.enable must be one of " + enable_values.join(", "));
    }
    if (enable && enable_values.indexOf(lora_uplink_enable) === -1) {
        throw new Error("d2d_master_config._item.lora_uplink_enable must be one of " + enable_values.join(", "));
    }
    if (enable && enable_values.indexOf(time_enable) === -1) {
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
 * d2d slave configuration
 * @param {object} d2d_slave_config
 * @param {number} d2d_slave_config._item.mode values: (0: occupied, 1: vacant, 2: fall, 3: out_of_bed, 4: motionless, 5: dwell)
 * @param {string} d2d_slave_config._item.d2d_cmd
 * @param {number} d2d_slave_config._item.control_type values: (1: button)
 * @param {number} d2d_slave_config._item.action_type values: (1: alarm_deactivate, 2: wifi_on, 3: wifi_off)
 * @example { "d2d_slave_config": [{ "mode": 0, "d2d_cmd": "0000", "control_type": 1, "action_type": 1 }] }
 */
function setD2DSlaveConfig(d2d_slave_config) {
    var mode = d2d_slave_config.mode;
    var d2d_cmd = d2d_slave_config.d2d_cmd;
    var control_type = d2d_slave_config.control_type;
    var action_type = d2d_slave_config.action_type;

    var mode_map = { 0: "occupied", 1: "vacant", 2: "fall", 3: "out_of_bed", 4: "motionless", 5: "dwell" };
    var mode_values = getValues(mode_map);
    if (mode_values.indexOf(mode) === -1) {
        throw new Error("d2d_slave_config._item.mode must be one of " + mode_values.join(", "));
    }
    var control_type_map = { 1: "button" };
    var control_type_values = getValues(control_type_map);
    if (control_type_values.indexOf(control_type) === -1) {
        throw new Error("d2d_slave_config._item.control_type must be one of " + control_type_values.join(", "));
    }
    var action_type_map = { 1: "alarm_deactivate", 2: "wifi_on", 3: "wifi_off" };
    var action_type_values = getValues(action_type_map);
    if (action_type_values.indexOf(action_type) === -1) {
        throw new Error("d2d_slave_config._item.action_type must be one of " + action_type_values.join(", "));
    }

    var buffer = new Buffer(7);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x4c);
    buffer.writeUInt8(getValue(mode_map, mode));
    buffer.writeD2DCommand(d2d_cmd, "0000");
    buffer.writeUInt8(getValue(control_type_map, control_type));
    buffer.writeUInt8(getValue(action_type_map, action_type));
    return buffer.toBytes();
}

/**
 * set WiFi enable
 * @param {number} wifi_enable values: (0: disable, 1: enable)
 * @example { "wifi_enable": 1 }
 */
function setWiFiEnable(wifi_enable) {
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
 * set WiFi SSID hidden
 * @param {number} wifi_ssid_hidden values: (0: disable, 1: enable)
 * @example { "wifi_ssid_hidden": 0 }
 */
function setWiFiSSIDHidden(wifi_ssid_hidden) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(wifi_ssid_hidden) === -1) {
        throw new Error("wifi_ssid_hidden must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x4d);
    buffer.writeUInt8(getValue(enable_map, wifi_ssid_hidden));
    return buffer.toBytes();
}

/**
 * set device time
 * @since v1.0.2
 * @param {number} timestamp unit: second, UTC time
 * @example payload: { "timestamp": 1628832309 }, output: FF1135021661
 */
function setTime(timestamp) {
    if (typeof timestamp !== "number") {
        throw new Error("timestamp must be a number");
    }
    var buffer = new Buffer(6);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x11);
    buffer.writeUInt32LE(timestamp);
    return buffer.toBytes();
}

/**
 * set time sync config
 * @since v1.0.2
 * @param {object} time_sync_config
 * @param {number} time_sync_config.mode values: (0: sync_from_gateway, 1: manual_sync)
 * @param {number} time_sync_config.timestamp unit: second, UTC time
 * @example { "time_sync_config": { "mode": 0, "timestamp": 1628832309 } }
 */
function setTimeSyncConfig(time_sync_config) {
    var mode = time_sync_config.mode;
    var timestamp = time_sync_config.timestamp || 0;

    var mode_map = { 0: "sync_from_gateway", 1: "manual_sync" };
    var mode_values = getValues(mode_map);
    if (mode_values.indexOf(mode) === -1) {
        throw new Error("time_sync_config.mode must be in " + mode_values.join(", "));
    }

    var buffer = new Buffer(7);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x91);
    buffer.writeUInt8(getValue(mode_map, mode));
    buffer.writeUInt32LE(timestamp);
    return buffer.toBytes();
}

/**
 * set rejoin config
 * @since v1.0.2
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
 * @since v1.0.2
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
 * @since v1.0.2
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
 * set trigger digital output config
 * @since v1.0.2
 * @param {object} trigger_digital_output_config
 * @param {number} trigger_digital_output_config.enable values: (0: disable, 1: enable)
 * @param {number} trigger_digital_output_config.fall values: (0: disable, 1: enable)
 * @param {number} trigger_digital_output_config.lying values: (0: disable, 1: enable)
 * @param {number} trigger_digital_output_config.out_of_bed values: (0: disable, 1: enable)
 * @param {number} trigger_digital_output_config.dwell values: (0: disable, 1: enable)
 * @param {number} trigger_digital_output_config.motionless values: (0: disable, 1: enable)
 * @example { "trigger_digital_output_config": { "enable": 1, "fall": 1, "lying": 1, "out_of_bed": 1, "dwell": 1, "motionless": 1 } }
 */
function setTriggerDigitalOutputConfig(trigger_digital_output_config) {
    var enable = trigger_digital_output_config.enable;
    var fall = trigger_digital_output_config.fall;
    var lying = trigger_digital_output_config.lying;
    var out_of_bed = trigger_digital_output_config.out_of_bed;
    var dwell = trigger_digital_output_config.dwell;
    var motionless = trigger_digital_output_config.motionless;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("enable must be one of " + enable_values.join(", "));
    }
    if (enable_values.indexOf(fall) === -1) {
        throw new Error("fall must be one of " + enable_values.join(", "));
    }
    if (enable_values.indexOf(lying) === -1) {
        throw new Error("lying must be one of " + enable_values.join(", "));
    }
    if (enable_values.indexOf(out_of_bed) === -1) {
        throw new Error("out_of_bed must be one of " + enable_values.join(", "));
    }
    if (enable_values.indexOf(dwell) === -1) {
        throw new Error("dwell must be one of " + enable_values.join(", "));
    }
    if (enable_values.indexOf(motionless) === -1) {
        throw new Error("motionless must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(8);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0xb5);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt8(getValue(enable_map, fall));
    buffer.writeUInt8(getValue(enable_map, lying));
    buffer.writeUInt8(getValue(enable_map, out_of_bed));
    buffer.writeUInt8(getValue(enable_map, dwell));
    buffer.writeUInt8(getValue(enable_map, motionless));
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

function hexStringToBytes(hex) {
    var bytes = [];
    for (var c = 0; c < hex.length; c += 2) {
        bytes.push(parseInt(hex.substr(c, 2), 16));
    }
    return bytes;
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
