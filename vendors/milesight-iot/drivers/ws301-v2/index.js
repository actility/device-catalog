/**
 * Payload Decoder and Encoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product WS301
 */
var RAW_VALUE = 0x00;

function decodeUplink(input) {
    return { data: decode(input.bytes) };
}

function Decode(fPort, bytes) {
    return decode(bytes);
}

function Decoder(bytes, port) {
    return decode(bytes);
}

function decode(bytes) {
    var decoded = {};

    for (var offset = 0; offset < bytes.length;) {
        var channelId = bytes[offset++];
        var channelType = bytes[offset++];

        if (channelId === 0xff && channelType === 0x01) {
            decoded.ipso_version = protocolVersion(bytes[offset++]);
        } else if (channelId === 0xff && channelType === 0x09) {
            decoded.hardware_version = hardwareVersion(bytes.slice(offset, offset + 2));
            offset += 2;
        } else if (channelId === 0xff && channelType === 0x0a) {
            decoded.firmware_version = firmwareVersion(bytes.slice(offset, offset + 2));
            offset += 2;
        } else if (channelId === 0xff && channelType === 0xff) {
            decoded.tsl_version = tslVersion(bytes.slice(offset, offset + 2));
            offset += 2;
        } else if (channelId === 0xff && channelType === 0x08) {
            decoded.sn = serialNumber(bytes.slice(offset, offset + 6));
            offset += 6;
        } else if (channelId === 0xff && channelType === 0x0f) {
            decoded.lorawan_class = valueFor({ 0: "Class A", 1: "Class B", 2: "Class C", 3: "Class CtoB" }, bytes[offset++]);
        } else if (channelId === 0xff && channelType === 0xfe) {
            decoded.reset_event = valueFor({ 0: "normal", 1: "reset" }, 1);
            offset += 1;
        } else if (channelId === 0xff && channelType === 0x0b) {
            decoded.device_status = valueFor({ 0: "off", 1: "on" }, 1);
            offset += 1;
        } else if (channelId === 0x01 && channelType === 0x75) {
            decoded.battery = bytes[offset++] & 0xff;
        } else if (channelId === 0x03 && channelType === 0x00) {
            decoded.magnet_status = valueFor({ 0: "close", 1: "open" }, bytes[offset++]);
        } else if (channelId === 0x04 && channelType === 0x00) {
            decoded.tamper_status = valueFor({ 0: "installed", 1: "uninstalled" }, bytes[offset++]);
        } else if (channelId === 0xfe || channelId === 0xff) {
            var response = downlinkResponse(channelType, bytes, offset);
            Object.assign(decoded, response.data);
            offset = response.offset;
        } else {
            break;
        }
    }

    return decoded;
}

function downlinkResponse(channelType, bytes, offset) {
    var decoded = {};
    if (channelType === 0x03) {
        decoded.report_interval = uint16le(bytes.slice(offset, offset + 2));
        offset += 2;
    } else if (channelType === 0x10) {
        decoded.reboot = valueFor({ 0: "no", 1: "yes" }, 1);
        offset += 1;
    } else if (channelType === 0x28) {
        decoded.query_device_status = valueFor({ 0: "no", 1: "yes" }, 1);
        offset += 1;
    } else {
        throw new Error("unknown downlink response");
    }
    return { data: decoded, offset: offset };
}

function protocolVersion(value) {
    return "v" + ((value & 0xf0) >> 4) + "." + (value & 0x0f);
}

function hardwareVersion(bytes) {
    return "v" + (bytes[0] & 0xff).toString(16) + "." + ((bytes[1] & 0xff) >> 4);
}

function firmwareVersion(bytes) {
    return "v" + (bytes[0] & 0xff).toString(16) + "." + (bytes[1] & 0xff).toString(16);
}

function tslVersion(bytes) {
    return "v" + (bytes[0] & 0xff) + "." + (bytes[1] & 0xff);
}

function serialNumber(bytes) {
    var result = [];
    for (var index = 0; index < bytes.length; index++) {
        result.push(("0" + (bytes[index] & 0xff).toString(16)).slice(-2));
    }
    return result.join("");
}

function valueFor(map, key) {
    if (RAW_VALUE) return key;
    return map[key] || "unknown";
}

function uint16le(bytes) {
    return ((bytes[1] << 8) + bytes[0]) & 0xffff;
}

function encodeDownlink(input) {
    var bytes = [];
    var payload = input.data;
    if (Object.prototype.hasOwnProperty.call(payload, "reboot")) {
        bytes = bytes.concat(yesNoCommand(payload.reboot, 0x10));
    }
    if (Object.prototype.hasOwnProperty.call(payload, "query_device_status")) {
        bytes = bytes.concat(yesNoCommand(payload.query_device_status, 0x28));
    }
    if (Object.prototype.hasOwnProperty.call(payload, "report_interval")) {
        bytes = bytes.concat(reportInterval(payload.report_interval));
    }
    return { bytes: bytes, fPort: typeof input.fPort === "undefined" ? 100 : input.fPort };
}

function yesNoCommand(value, command) {
    if (value !== 0 && value !== 1) {
        throw new Error("value must be 0 or 1");
    }
    return value === 0 ? [] : [0xff, command, 0xff];
}

function reportInterval(value) {
    if (value < 60 || value > 64800) {
        throw new Error("report_interval must be between 60 and 64800");
    }
    return [0xff, 0x03, value & 0xff, (value >> 8) & 0xff];
}

exports.decodeUplink = decodeUplink;
exports.encodeDownlink = encodeDownlink;