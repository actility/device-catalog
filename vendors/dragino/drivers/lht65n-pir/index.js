// Independently implemented from the published LHT65N-PIR payload tables:
// https://wiki.dragino.com/docs/LoRaWAN-End-Node/temperature-humidity-sensors/lht65n-pir/
function uint16(bytes, offset) {
    return bytes[offset] * 256 + bytes[offset + 1];
}

function int16(bytes, offset) {
    var value = uint16(bytes, offset);
    return value & 0x8000 ? value - 0x10000 : value;
}

function uint24(bytes, offset) {
    return bytes[offset] * 65536 + bytes[offset + 1] * 256 + bytes[offset + 2];
}

function isIntegerInRange(value, min, max) {
    return typeof value === "number" && isFinite(value) && Math.floor(value) === value &&
        value >= min && value <= max;
}

function downlinkBytes(input) {
    var bytes = input && input.bytes;
    if (typeof bytes === "string") {
        if (bytes.length % 2 !== 0 || !/^[0-9a-f]*$/i.test(bytes)) {
            return null;
        }
        var parsed = [];
        for (var index = 0; index < bytes.length; index += 2) {
            parsed.push(parseInt(bytes.slice(index, index + 2), 16));
        }
        return parsed;
    }
    if (!Array.isArray(bytes) || bytes.some(function(byte) {
        return !isIntegerInRange(byte, 0, 255);
    })) {
        return null;
    }
    return bytes;
}

function frequencyBand(code) {
    var bands = {
        1: "EU868",
        2: "US915",
        3: "IN865",
        4: "AU915",
        5: "KZ865",
        6: "RU864",
        7: "AS923",
        8: "AS923-1",
        9: "AS923-2",
        10: "AS923-3",
        11: "CN470",
        12: "EU433",
        13: "KR920",
        14: "MA869"
    };
    return bands[code] || "0x" + code.toString(16).toUpperCase();
}

function decodeUplink(input) {
    var bytes = input && input.bytes;
    if (!Array.isArray(bytes) || bytes.some(function(byte) {
        return typeof byte !== "number" || byte % 1 !== 0 || byte < 0 || byte > 255;
    })) {
        return { errors: ["Invalid LHT65N-PIR payload bytes"] };
    }

    if (input.fPort === 2) {
        if (bytes.length !== 11) {
            return { errors: ["Invalid LHT65N-PIR sensor frame length: expected 11 bytes, got " + bytes.length] };
        }
        if (bytes[6] !== 0x0A) {
            return { errors: ["Unsupported LHT65N-PIR extension: 0x" + bytes[6].toString(16).toUpperCase()] };
        }
        var battery = uint16(bytes, 0);
        var batteryStates = ["Ultra Low", "Low", "OK", "Good"];
        return {
            data: {
                Node_type: "LHT65N-PIR",
                BatV: (battery & 0x3FFF) / 1000,
                Bat_status: batteryStates[battery >> 14],
                TempC_SHT: int16(bytes, 2) / 100,
                Hum_SHT: (uint16(bytes, 4) & 0x0FFF) / 10,
                PIR_Activity: (bytes[7] & 0x01) === 1,
                Movement_Count: uint24(bytes, 8)
            }
        };
    }

    if (input.fPort === 5) {
        if (bytes.length !== 7) {
            return { errors: ["Invalid LHT65N-PIR status length: expected 7 bytes, got " + bytes.length] };
        }
        if (bytes[0] !== 0x1A) {
            return { errors: ["Unexpected sensor model in LHT65N-PIR status: 0x" + bytes[0].toString(16).toUpperCase()] };
        }
        return {
            data: {
                SENSOR_MODEL: "LHT65N-PIR",
                FIRMWARE_VERSION: (bytes[1] & 0x0F) + "." + (bytes[2] >> 4 & 0x0F) + "." + (bytes[2] & 0x0F),
                FREQUENCY_BAND: frequencyBand(bytes[3]),
                SUB_BAND: bytes[4],
                BAT: uint16(bytes, 5) / 1000
            }
        };
    }

    return { errors: ["Unsupported LHT65N-PIR fPort: " + input.fPort] };
}

exports.decodeUplink = decodeUplink;

function encodeDownlink(input) {
    var data = input && input.data;
    if (!data || typeof data.command !== "string") {
        return { errors: ["LHT65N-PIR downlink data.command is required"] };
    }

    switch (data.command) {
    case "setUplinkInterval":
        if (!isIntegerInRange(data.seconds, 1, 0xFFFFFF)) {
            return { errors: ["LHT65N-PIR uplink interval must be 1..16777215 seconds"] };
        }
        return { bytes: [0x01, data.seconds >> 16, data.seconds >> 8 & 0xFF, data.seconds & 0xFF], fPort: 2 };
    case "reboot":
        return { bytes: [0x04, 0xFF], fPort: 2 };
    case "factoryReset":
        return { bytes: [0x04, 0xFE], fPort: 2 };
    case "requestStatus":
        return { bytes: [0x26, 0x01], fPort: 2 };
    case "setUplinkOnActivity":
        if (typeof data.enabled !== "boolean") {
            return { errors: ["LHT65N-PIR uplink-on-activity requires enabled: true or false"] };
        }
        if (!data.enabled) {
            return { bytes: [0xA1, 0x00], fPort: 2 };
        }
        if (!isIntegerInRange(data.cooldownMinutes, 1, 0xFFFF)) {
            return { errors: ["LHT65N-PIR activity cooldown must be 1..65535 minutes"] };
        }
        return {
            bytes: [0xA1, 0x01, data.cooldownMinutes >> 8, data.cooldownMinutes & 0xFF],
            fPort: 2
        };
    default:
        return { errors: ["Unsupported LHT65N-PIR downlink command: " + data.command] };
    }
}

function decodeDownlink(input) {
    var bytes = downlinkBytes(input);
    if (!bytes || bytes.length === 0) {
        return { errors: ["Invalid LHT65N-PIR downlink bytes"] };
    }
    if (input.fPort !== undefined && input.fPort !== 2) {
        return { errors: ["Unsupported LHT65N-PIR downlink fPort: " + input.fPort] };
    }

    var data;
    if (bytes.length === 4 && bytes[0] === 0x01) {
        data = {
            command: "setUplinkInterval",
            seconds: bytes[1] * 65536 + bytes[2] * 256 + bytes[3]
        };
    } else if (bytes.length === 2 && bytes[0] === 0x04 && bytes[1] === 0xFF) {
        data = { command: "reboot" };
    } else if (bytes.length === 2 && bytes[0] === 0x04 && bytes[1] === 0xFE) {
        data = { command: "factoryReset" };
    } else if (bytes.length === 2 && bytes[0] === 0x26 && bytes[1] === 0x01) {
        data = { command: "requestStatus" };
    } else if (bytes.length === 2 && bytes[0] === 0xA1 && bytes[1] === 0x00) {
        data = { command: "setUplinkOnActivity", enabled: false };
    } else if (bytes.length === 4 && bytes[0] === 0xA1 && bytes[1] === 0x01 &&
        uint16(bytes, 2) > 0) {
        data = {
            command: "setUplinkOnActivity",
            enabled: true,
            cooldownMinutes: uint16(bytes, 2)
        };
    }

    return data ? { data: data } : { errors: ["Unsupported or malformed LHT65N-PIR downlink command"] };
}

exports.encodeDownlink = encodeDownlink;
exports.decodeDownlink = decodeDownlink;
