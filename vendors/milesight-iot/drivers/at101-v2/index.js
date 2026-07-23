/**
 * Payload Decoder
 *
 * Copyright 2024 Milesight IoT
 *
 * @product AT101
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
        // LOCATION
        else if ((channel_id === 0x04 || channel_id == 0x84) && channel_type === 0x88) {
            decoded.latitude = readInt32LE(bytes.slice(i, i + 4)) / 1000000;
            decoded.longitude = readInt32LE(bytes.slice(i + 4, i + 8)) / 1000000;
            var status = bytes[i + 8];
            decoded.motion_status = readMotionStatus(status & 0x0f);
            decoded.geofence_status = readGeofenceStatus(status >> 4);
            i += 9;
        }
        // DEVICE POSITION
        else if (channel_id === 0x05 && channel_type === 0x00) {
            decoded.position = readDevicePosition(bytes[i]);
            i += 1;
        }
        // Wi-Fi SCAN RESULT
        else if (channel_id === 0x06 && channel_type === 0xd9) {
            var wifi = {};
            wifi.group = readUInt8(bytes[i]);
            wifi.mac = readMAC(bytes.slice(i + 1, i + 7));
            wifi.rssi = readInt8(bytes[i + 7]);
            wifi.motion_status = readMotionStatus(bytes[i + 8] & 0x0f);
            i += 9;

            decoded.wifi_scan_result = "finish";
            if (wifi.mac === "ff:ff:ff:ff:ff:ff") {
                decoded.wifi_scan_result = "timeout";
                continue;
            }
            decoded.motion_status = wifi.motion_status;

            decoded.wifi = decoded.wifi || [];
            decoded.wifi.push(wifi);
        }
        // TAMPER STATUS
        else if (channel_id === 0x07 && channel_type === 0x00) {
            decoded.tamper_status = readTamperStatus(bytes[i]);
            i += 1;
        }
        // TEMPERATURE WITH ABNORMAL
        else if (channel_id === 0x83 && channel_type === 0x67) {
            decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
            decoded.temperature_alarm = readTemperatureAlarm(bytes[i + 2]);
            i += 3;
        }
        // HISTORICAL DATA
        else if (channel_id === 0x20 && channel_type === 0xce) {
            var location = {};
            location.timestamp = readUInt32LE(bytes.slice(i, i + 4));
            location.longitude = readInt32LE(bytes.slice(i + 4, i + 8)) / 1000000;
            location.latitude = readInt32LE(bytes.slice(i + 8, i + 12)) / 1000000;
            i += 12;

            decoded.history = decoded.history || [];
            decoded.history.push(location);
        }
        // DOWNLINK RESPONSE
        else if (channel_id === 0xfe || channel_id === 0xff) {
            var result = handle_downlink_response(channel_type, bytes, i);
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
        case 0x13:
            decoded.motion_report_config = {};
            decoded.motion_report_config.enable = readEnableStatus(readUInt8(bytes[offset]));
            decoded.motion_report_config.interval = readUInt16LE(bytes.slice(offset + 1, offset + 3));
            offset += 3;
            break;
        case 0x17:
            decoded.time_zone = readTimeZone(readInt16LE(bytes.slice(offset, offset + 2)));
            offset += 2;
            break;
        case 0x28:
            decoded.report_status = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x2d:
            var wifi_positioning_config = {};
            wifi_positioning_config.mode = readWiFiScanMode(readUInt8(bytes[offset]));
            wifi_positioning_config.num_of_bssid = readUInt8(bytes[offset + 1]);
            wifi_positioning_config.timeout = readUInt8(bytes[offset + 2]);
            offset += 3;
            decoded.wifi_positioning_config = wifi_positioning_config;
            break;
        case 0x3b:
            decoded.time_sync_enable = readEnableStatus(readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0x3c:
            decoded.gnss_positioning_timeout = readUInt8(bytes[offset]);
            offset += 1;
            break;
        case 0x4a:
            decoded.sync_time = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x58:
            var detection_type_value = readUInt8(bytes[offset]);
            if (detection_type_value === 0x00) {
                decoded.motion_detection_config = {};
                decoded.motion_detection_config.delta_g = readUInt8(bytes[offset + 1]);
                decoded.motion_detection_config.duration = readUInt16LE(bytes.slice(offset + 2, offset + 4));
            } else if (detection_type_value === 0x01) {
                decoded.static_detection_config = {};
                decoded.static_detection_config.delta_g = readUInt8(bytes[offset + 1]);
                decoded.static_detection_config.duration = readUInt16LE(bytes.slice(offset + 2, offset + 4));
            }
            offset += 4;
            break;
        case 0x66:
            decoded.report_strategy = readReportStrategy(bytes[offset]);
            offset += 1;
            break;
        case 0x71:
            decoded.positioning_strategy = readPositioningStrategy(bytes[offset]);
            offset += 1;
            break;
        case 0x7e:
            decoded.geofence_alarm_config = {};
            decoded.geofence_alarm_config.enable = readEnableStatus(readUInt8(bytes[offset]));
            decoded.geofence_alarm_config.interval = readUInt16LE(bytes.slice(offset + 1, offset + 3));
            decoded.geofence_alarm_config.counts = readUInt8(bytes[offset + 3]);
            offset += 4;
            break;
        case 0x87:
            decoded.tamper_detection_enable = readEnableStatus(readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0x88:
            decoded.geofence_center_config = decoded.geofence_center_config || {};
            decoded.geofence_center_config.latitude = readInt32LE(bytes.slice(offset, offset + 4)) / 1000000;
            decoded.geofence_center_config.longitude = readInt32LE(bytes.slice(offset + 4, offset + 8)) / 1000000;
            offset += 8;
            break;
        case 0x89:
            decoded.geofence_center_config = decoded.geofence_center_config || {};
            decoded.geofence_center_config.radius = readUInt32LE(bytes.slice(offset, offset + 4));
            offset += 4;
            break;
        case 0x8a:
            var timed_report_config = {};
            timed_report_config.index = readUInt8(bytes[offset]) + 1;
            timed_report_config.time = readUInt16LE(bytes.slice(offset + 1, offset + 3));
            offset += 3;
            decoded.timed_report_config = decoded.timed_report_config || [];
            decoded.timed_report_config.push(timed_report_config);
            break;
        case 0x8f:
            decoded.bluetooth_enable = readEnableStatus(readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0x8e:
            var report_type_value = readUInt8(bytes[offset]);
            if (report_type_value === 0x00) {
                decoded.report_interval = readUInt16LE(bytes.slice(offset + 1, offset + 3));
            } else if (report_type_value === 0x01) {
                decoded.motion_report_interval = readUInt16LE(bytes.slice(offset + 1, offset + 3));
            }
            offset += 3;
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

function readMAC(bytes) {
    var temp = [];
    for (var idx = 0; idx < bytes.length; idx++) {
        temp.push(("0" + (bytes[idx] & 0xff).toString(16)).slice(-2));
    }
    return temp.join(":");
}

function readMotionStatus(type) {
    var motion_status_map = {
        0: "unknown",
        1: "start",
        2: "moving",
        3: "stop",
    };
    return getValue(motion_status_map, type);
}

function readGeofenceStatus(type) {
    var geofence_status_map = {
        0: "inside",
        1: "outside",
        2: "unset",
        3: "unknown",
    };
    return getValue(geofence_status_map, type);
}

function readDevicePosition(type) {
    var device_position_map = { 0: "normal", 1: "tilt" };
    return getValue(device_position_map, type);
}

function readTamperStatus(type) {
    var tamper_status_map = { 0: "install", 1: "uninstall" };
    return getValue(tamper_status_map, type);
}

function readTemperatureAlarm(type) {
    var alarm_map = { 0: "normal", 1: "abnormal" };
    return getValue(alarm_map, type);
}

function readYesNoStatus(status) {
    var yes_no_map = { 0: "no", 1: "yes" };
    return getValue(yes_no_map, status);
}

function readEnableStatus(status) {
    var status_map = { 0: "disable", 1: "enable" };
    return getValue(status_map, status);
}

function readTimeZone(time_zone) {
    var timezone_map = { "-120": "UTC-12", "-110": "UTC-11", "-100": "UTC-10", "-95": "UTC-9:30", "-90": "UTC-9", "-80": "UTC-8", "-70": "UTC-7", "-60": "UTC-6", "-50": "UTC-5", "-40": "UTC-4", "-35": "UTC-3:30", "-30": "UTC-3", "-20": "UTC-2", "-10": "UTC-1", 0: "UTC", 10: "UTC+1", 20: "UTC+2", 30: "UTC+3", 35: "UTC+3:30", 40: "UTC+4", 45: "UTC+4:30", 50: "UTC+5", 55: "UTC+5:30", 57: "UTC+5:45", 60: "UTC+6", 65: "UTC+6:30", 70: "UTC+7", 80: "UTC+8", 90: "UTC+9", 95: "UTC+9:30", 100: "UTC+10", 105: "UTC+10:30", 110: "UTC+11", 120: "UTC+12", 127: "UTC+12:45", 130: "UTC+13", 140: "UTC+14" };
    return getValue(timezone_map, time_zone);
}

function readReportStrategy(type) {
    var report_strategy_map = { 0: "periodic", 1: "motion", 2: "timing" };
    return getValue(report_strategy_map, type);
}

function readPositioningStrategy(type) {
    var positioning_strategy_map = { 0: "gnss", 1: "wifi", 2: "wifi_gnss" };
    return getValue(positioning_strategy_map, type);
}

function readWiFiScanMode(type) {
    var wifi_scan_mode_map = { 0: "low_power", 1: "high_accuracy" };
    return getValue(wifi_scan_mode_map, type);
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

function getValue(map, key) {
    if (RAW_VALUE) return key;
    var value = map[key];
    if (!value) value = "unknown";
    return value;
}


(function (moduleExports) {
/**
 * Payload Encoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product AT101
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
    if ("time_zone" in payload) {
        encoded = encoded.concat(setTimeZone(payload.time_zone));
    }
    if ("sync_time" in payload) {
        encoded = encoded.concat(syncTime(payload.sync_time));
    }
    if ("report_interval" in payload) {
        encoded = encoded.concat(setReportInterval(payload.report_interval));
    }
    if ("motion_report_interval" in payload) {
        encoded = encoded.concat(setMotionReportInterval(payload.motion_report_interval));
    }
    if ("report_strategy" in payload) {
        encoded = encoded.concat(setReportStrategy(payload.report_strategy));
    }
    if ("positioning_strategy" in payload) {
        encoded = encoded.concat(setPositioningStrategy(payload.positioning_strategy));
    }
    if ("gnss_positioning_timeout" in payload) {
        encoded = encoded.concat(setGNSSPositioningTimeout(payload.gnss_positioning_timeout));
    }
    if ("wifi_positioning_config" in payload) {
        encoded = encoded.concat(setWifiPositioningConfig(payload.wifi_positioning_config));
    }
    if ("motion_detection_config" in payload) {
        encoded = encoded.concat(setMotionDetectionConfig(payload.motion_detection_config));
    }
    if ("static_detection_config" in payload) {
        encoded = encoded.concat(setStaticDetectionConfig(payload.static_detection_config));
    }
    if ("motion_report_config" in payload) {
        encoded = encoded.concat(setMotionReportConfig(payload.motion_report_config));
    }
    if ("geofence_center_config" in payload) {
        encoded = encoded.concat(setGeofenceCenterConfig(payload.geofence_center_config));
    }
    if ("tamper_detection_enable" in payload) {
        encoded = encoded.concat(setTamperDetectionEnable(payload.tamper_detection_enable));
    }
    if ("geofence_alarm_config" in payload) {
        encoded = encoded.concat(setGeofenceAlarmConfig(payload.geofence_alarm_config));
    }
    if ("timed_report_config" in payload) {
        for (var i = 0; i < payload.timed_report_config.length; i++) {
            encoded = encoded.concat(setTimedReportConfig(payload.timed_report_config[i]));
        }
    }
    if ("bluetooth_enable" in payload) {
        encoded = encoded.concat(setBlueToothEnable(payload.bluetooth_enable));
    }
    if ("time_sync_enable" in payload) {
        encoded = encoded.concat(setTimeSyncEnable(payload.time_sync_enable));
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
 * set time zone
 * @param {number} time_zone unit: minute, UTC+8 -> 8 * 10 = 80
 * @example { "time_zone": 80 }
 */
function setTimeZone(time_zone) {
    var timezone_map = { "-120": "UTC-12", "-110": "UTC-11", "-100": "UTC-10", "-95": "UTC-9:30", "-90": "UTC-9", "-80": "UTC-8", "-70": "UTC-7", "-60": "UTC-6", "-50": "UTC-5", "-40": "UTC-4", "-35": "UTC-3:30", "-30": "UTC-3", "-20": "UTC-2", "-10": "UTC-1", 0: "UTC", 10: "UTC+1", 20: "UTC+2", 30: "UTC+3", 35: "UTC+3:30", 40: "UTC+4", 45: "UTC+4:30", 50: "UTC+5", 55: "UTC+5:30", 57: "UTC+5:45", 60: "UTC+6", 65: "UTC+6:30", 70: "UTC+7", 80: "UTC+8", 90: "UTC+9", 95: "UTC+9:30", 100: "UTC+10", 105: "UTC+10:30", 110: "UTC+11", 120: "UTC+12", 127: "UTC+12:45", 130: "UTC+13", 140: "UTC+14" };
    var timezone_values = getValues(timezone_map);
    if (timezone_values.indexOf(time_zone) === -1) {
        throw new Error("time_zone must be one of " + timezone_values.join(", "));
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x17);
    buffer.writeInt16LE(getValue(timezone_map, time_zone));
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
    return [0xff, 0x4a, 0x00];
}

/**
 * set report interval
 * @param {number} report_interval unit: minute, range: [1, 1440]
 * @example { "report_interval": 20 }
 */
function setReportInterval(report_interval) {
    if (report_interval < 1 || report_interval > 1440) {
        throw new Error("report_interval must be between 1 and 1440");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x8e);
    buffer.writeUInt8(0x00);
    buffer.writeUInt16LE(report_interval);
    return buffer.toBytes();
}

/**
 * set motion report interval
 * @param {number} motion_report_interval unit: minute, range: [1, 1440]
 * @example { "motion_report_interval": 20 }
 */
function setMotionReportInterval(motion_report_interval) {
    if (motion_report_interval < 1 || motion_report_interval > 1440) {
        throw new Error("motion_report_interval must be between 1 and 1440");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x8e);
    buffer.writeUInt8(0x01);
    buffer.writeUInt16LE(motion_report_interval);
    return buffer.toBytes();
}

/**
 * set report strategy
 * @param {number} report_strategy values: (0: periodic, 1: motion, 2: timing)
 * @example { "report_strategy": 1 }
 */
function setReportStrategy(report_strategy) {
    var report_strategy_map = { 0: "periodic", 1: "motion", 2: "timing" };
    var report_strategy_values = getValues(report_strategy_map);
    if (report_strategy_values.indexOf(report_strategy) === -1) {
        throw new Error("report_strategy must be one of " + report_strategy_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x66);
    buffer.writeUInt8(getValue(report_strategy_map, report_strategy));
    return buffer.toBytes();
}

/**
 * set positioning strategy
 * @param {number} positioning_strategy values: (0: gnss, 1: wifi, 2: wifi_gnss)
 * @example { "positioning_strategy": 1 }
 */
function setPositioningStrategy(positioning_strategy) {
    var mode_map = { 0: "gnss", 1: "wifi", 2: "wifi_gnss" };
    var mode_values = getValues(mode_map);
    if (mode_values.indexOf(positioning_strategy) === -1) {
        throw new Error("positioning_strategy must be one of " + mode_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x71);
    buffer.writeUInt8(getValue(mode_map, positioning_strategy));
    return buffer.toBytes();
}

/**
 * set GNSS positioning timeout
 * @param {number} gnss_positioning_timeout unit: minute, range: [1, 5]
 * @example { "gnss_positioning_timeout": 20 }
 */
function setGNSSPositioningTimeout(gnss_positioning_timeout) {
    if (gnss_positioning_timeout < 1 || gnss_positioning_timeout > 5) {
        throw new Error("gnss_positioning_timeout must be between 1 and 5");
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x3c);
    buffer.writeUInt8(gnss_positioning_timeout);
    return buffer.toBytes();
}

/**
 * set wifi positioning config
 * @param {object} wifi_positioning_config
 * @param {number} wifi_positioning_config.mode values: (0: low_power, 1: high_accuracy)
 * @param {number} wifi_positioning_config.num_of_bssid values: [3, 15]
 * @param {number} wifi_positioning_config.timeout unit: second, range: [1, 255]
 * @example { "wifi_positioning_config": { "mode": 0, "num_of_bssid": 10, "timeout": 2 } }
 */
function setWifiPositioningConfig(wifi_positioning_config) {
    var mode = wifi_positioning_config.mode;
    var num_of_bssid = wifi_positioning_config.num_of_bssid;
    var timeout = wifi_positioning_config.timeout;

    var mode_map = { 0: "low_power", 1: "high_accuracy" };
    var mode_values = getValues(mode_map);
    if (mode_values.indexOf(mode) === -1) {
        throw new Error("mode must be one of " + mode_values.join(", "));
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x2d);
    buffer.writeUInt8(getValue(mode_map, mode));
    buffer.writeUInt8(num_of_bssid);
    buffer.writeUInt8(timeout);
    return buffer.toBytes();
}

/**
 * set motion detection config
 * @param {object} motion_detection_config
 * @param {number} motion_detection_config.delta_g unit: 10mg
 * @param {number} motion_detection_config.duration unit: second, range: [1, 60]
 * @example { "motion_detection_config": { "delta_g": 1, "duration": 60 } }
 */
function setMotionDetectionConfig(motion_detection_config) {
    var delta_g = motion_detection_config.delta_g;
    var duration = motion_detection_config.duration;

    if (duration < 1 || duration > 60) {
        throw new Error("motion_detection_config.duration must be between 1 and 60");
    }

    var buffer = new Buffer(6);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x58);
    buffer.writeUInt8(0x00); // motion
    buffer.writeUInt8(delta_g);
    buffer.writeUInt16LE(duration);
    return buffer.toBytes();
}

/**
 * set static detection config
 * @param {object} static_detection_config
 * @param {number} static_detection_config.delta_g unit: 10mg
 * @param {number} static_detection_config.duration unit: second, range: [1, 1800]
 * @example { "static_detection_config": { "delta_g": 1, "duration": 600 } }
 */
function setStaticDetectionConfig(static_detection_config) {
    var delta_g = static_detection_config.delta_g;
    var duration = static_detection_config.duration;

    if (duration < 1 || duration > 1800) {
        throw new Error("static_detection_config.duration must be between 1 and 1800");
    }

    var buffer = new Buffer(6);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x58);
    buffer.writeUInt8(0x01); // static
    buffer.writeUInt8(delta_g);
    buffer.writeUInt16LE(duration);
    return buffer.toBytes();
}

/**
 * set motion report config
 * @param {object} motion_report_config
 * @param {number} motion_report_config.enable values: (0: disable, 1: enable)
 * @param {number} motion_report_config.interval unit: minute, range: [1, 1440]
 * @example { "motion_report_config": { "enable": 1, "interval": 20 } }
 */
function setMotionReportConfig(motion_report_config) {
    var enable = motion_report_config.enable;
    var interval = motion_report_config.interval;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("motion_report_config.enable must be one of " + enable_values.join(", "));
    }
    if (interval < 1 || interval > 1440) {
        throw new Error("motion_report_config.interval must be between 1 and 1440");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x13);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt16LE(interval);
    return buffer.toBytes();
}

/**
 * set geofence center config
 * @param {object} geofence_center_config
 * @param {number} geofence_center_config.latitude
 * @param {number} geofence_center_config.longitude
 * @param {number} geofence_center_config.radius unit: m
 * @example { "geofence_center_config": { "latitude": 39.9087, "longitude": 116.3975, "radius": 10 } }
 */
function setGeofenceCenterConfig(geofence_center_config) {
    var data = [];
    if ("latitude" in geofence_center_config && "longitude" in geofence_center_config) {
        var latitude = geofence_center_config.latitude;
        var longitude = geofence_center_config.longitude;
        var buffer = new Buffer(10);
        buffer.writeUInt8(0xff);
        buffer.writeUInt8(0x88);
        buffer.writeInt32LE(latitude * 1000000);
        buffer.writeInt32LE(longitude * 1000000);
        data = data.concat(buffer.toBytes());
    }
    if ("radius" in geofence_center_config) {
        var radius = geofence_center_config.radius;
        var buffer = new Buffer(6);
        buffer.writeUInt8(0xff);
        buffer.writeUInt8(0x89);
        buffer.writeUInt32LE(radius);
        data = data.concat(buffer.toBytes());
    }
    return data;
}

/**
 * set tamper detection enable
 * @param {number} tamper_detection_enable values: (0: disable, 1: enable)
 * @example { "tamper_detection_enable": 1 }
 */
function setTamperDetectionEnable(tamper_detection_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(tamper_detection_enable) === -1) {
        throw new Error("tamper_detection_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x87);
    buffer.writeUInt8(getValue(enable_map, tamper_detection_enable));
    return buffer.toBytes();
}

/**
 * set geofence alarm config
 * @param {object} geofence_alarm_config
 * @param {number} geofence_alarm_config.enable values: (0: disable, 1: enable)
 * @param {number} geofence_alarm_config.interval unit: minute, range: [1, 1440]
 * @param {number} geofence_alarm_config.counts , range: [1, 3]
 * @example { "geofence_alarm_config": { "enable": 1, "interval": 20, "counts": 1 } }
 */
function setGeofenceAlarmConfig(geofence_alarm_config) {
    var enable = geofence_alarm_config.enable;
    var interval = geofence_alarm_config.interval;
    var counts = geofence_alarm_config.counts;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("geofence_alarm_config.enable must be one of " + enable_values.join(", "));
    }
    if (interval < 1 || interval > 1440) {
        throw new Error("geofence_alarm_config.interval must be between 1 and 1440");
    }
    if (counts < 1 || counts > 3) {
        throw new Error("geofence_alarm_config.counts must be between 1 and 3");
    }

    var buffer = new Buffer(6);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x7e);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt16LE(interval);
    buffer.writeUInt8(counts);
    return buffer.toBytes();
}

/**
 * set timed report config
 * @param {object} timed_report_config
 * @param {number} timed_report_config.index range: [1, 5]
 * @param {number} timed_report_config.time unit: minute, convert: hh:mm -> hh * 60 + mm
 * @example { "timed_report_config": [{ "index": 1, "time": 60 }] }
 */
function setTimedReportConfig(timed_report_config) {
    var index = timed_report_config.index;
    var time = timed_report_config.time;
    if (index < 1 || index > 5) {
        throw new Error("timed_report_config._item.index must be between 1 and 5");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x8a);
    buffer.writeUInt8(index - 1);
    buffer.writeUInt16LE(time);
    return buffer.toBytes();
}

/**
 * set bluetooth enable
 * @param {number} bluetooth_enable values: (0: disable, 1: enable)
 * @example { "bluetooth_enable": 1 }
 */
function setBlueToothEnable(bluetooth_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(bluetooth_enable) === -1) {
        throw new Error("bluetooth_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x8f);
    buffer.writeUInt8(getValue(enable_map, bluetooth_enable));
    return buffer.toBytes();
}

/**
 * time sync configuration
 * @param {number} time_sync_enable values: (0: disable, 2: enable)
 * @example { "time_sync_enable": 2 } output: FF3B02
 */
function setTimeSyncEnable(time_sync_enable) {
    var enable_map = { 0: "disable", 2: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(time_sync_enable) == -1) {
        throw new Error("time_sync_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x3b);
    buffer.writeUInt8(getValue(enable_map, time_sync_enable));
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

Buffer.prototype.toBytes = function () {
    return this.buffer;
};

if (typeof encodeDownlink === "function") moduleExports.encodeDownlink = encodeDownlink;
})(exports);

if (typeof decodeUplink === "function") exports.decodeUplink = decodeUplink;


exports.encodeDownlink = encodeDownlink;
