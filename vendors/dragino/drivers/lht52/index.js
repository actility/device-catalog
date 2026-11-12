// Independently implemented from the published LHT52 payload tables:
// https://wiki.dragino.com/docs/LoRaWAN-End-Node/temperature-humidity-sensors/lht52/
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

function uint32(bytes, offset) {
    return bytes[offset] * 16777216 +
        bytes[offset + 1] * 65536 +
        bytes[offset + 2] * 256 +
        bytes[offset + 3];
}

function timestamp(bytes, offset) {
    return new Date(uint32(bytes, offset) * 1000).toISOString();
}

function byteHex(byte) {
    return (byte < 16 ? "0" : "") + byte.toString(16);
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
        10: "AS923-3"
    };
    return bands[code] || "0x" + code.toString(16).toUpperCase();
}

function status(bytes) {
    if (bytes.length !== 7) {
        return { errors: ["Invalid LHT52 status length: expected 7 bytes, got " + bytes.length] };
    }
    if (bytes[0] !== 0x09) {
        return { errors: ["Unexpected sensor model in LHT52 status: 0x" + bytes[0].toString(16).toUpperCase()] };
    }
    return {
        data: {
            SENSOR_MODEL: "LHT52",
            FIRMWARE_VERSION: (bytes[1] & 0x0F) + "." + (bytes[2] >> 4 & 0x0F) + "." + (bytes[2] & 0x0F),
            FREQUENCY_BAND: frequencyBand(bytes[3]),
            SUB_BAND: bytes[4],
            BAT: uint16(bytes, 5) / 1000
        }
    };
}

function decodeRealtime(bytes) {
    if (bytes.length !== 11) {
        return { errors: ["Invalid LHT52 sensor frame length: expected 11 bytes, got " + bytes.length] };
    }
    var ext = bytes[6];
    if (ext !== 0x00 && ext !== 0x01) {
        return { errors: ["Unsupported LHT52 extension: 0x" + ext.toString(16).toUpperCase()] };
    }

    var data = {
        Node_type: "LHT52",
        TempC: int16(bytes, 0) / 100,
        Hum: (uint16(bytes, 2) & 0x0FFF) / 10,
        Ext_sensor: ext === 0x01 ? "Temperature Sensor" : "No external sensor",
        Data_time: timestamp(bytes, 7)
    };
    var externalTemperature = uint16(bytes, 4);
    if (ext === 0x01 && externalTemperature !== 0x7FFF) {
        data.Ext_TempC = int16(bytes, 4) / 100;
    }
    return { data: data };
}

function decodeDatalog(bytes) {
    if (bytes.length === 0 || bytes.length % 11 !== 0) {
        return { errors: ["Invalid LHT52 datalog length: expected a non-empty multiple of 11 bytes, got " + bytes.length] };
    }
    var samples = [];
    for (var offset = 0; offset < bytes.length; offset += 11) {
        var empty = true;
        for (var index = offset; index < offset + 11; index++) {
            if (bytes[index] !== 0) {
                empty = false;
                break;
            }
        }
        if (empty) {
            continue;
        }

        var ext = bytes[offset + 6];
        if (ext !== 0x00 && ext !== 0x01) {
            return { errors: ["Unsupported LHT52 datalog extension: 0x" + ext.toString(16).toUpperCase()] };
        }
        var sample = {
            TempC: int16(bytes, offset + 4) / 100,
            Hum: (uint16(bytes, offset + 2) & 0x0FFF) / 10,
            timestamp: timestamp(bytes, offset + 7)
        };
        var externalTemperature = uint16(bytes, offset);
        if (ext === 0x01 && externalTemperature !== 0x7FFF) {
            sample.Ext_TempC = int16(bytes, offset) / 100;
        }
        samples.push(sample);
    }
    return { data: { Node_type: "LHT52", samples: samples } };
}

function decodeUplink(input) {
    var bytes = input && input.bytes;
    if (!Array.isArray(bytes) || bytes.some(function(byte) {
        return typeof byte !== "number" || byte % 1 !== 0 || byte < 0 || byte > 255;
    })) {
        return { errors: ["Invalid LHT52 payload bytes"] };
    }

    if (input.fPort === 2) {
        return decodeRealtime(bytes);
    }
    if (input.fPort === 3) {
        return decodeDatalog(bytes);
    }
    if (input.fPort === 4) {
        if (bytes.length !== 8) {
            return { errors: ["Invalid LHT52 DS18B20 identifier length: expected 8 bytes, got " + bytes.length] };
        }
        return { data: { ExternalSensorId: bytes.map(function(byte) {
            return byteHex(byte);
        }).join("").toUpperCase() } };
    }
    if (input.fPort === 5) {
        return status(bytes);
    }
    return { errors: ["Unsupported LHT52 fPort: " + input.fPort] };
}

exports.decodeUplink = decodeUplink;

function isIntegerInRange(value, min, max) {
    return typeof value === "number" && isFinite(value) && Math.floor(value) === value &&
        value >= min && value <= max;
}

function signed16(value) {
    return value < 0 ? value + 0x10000 : value;
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

function decodeDatalogCommand(bytes) {
    if (bytes.length !== 10 || bytes[0] !== 0x31 || bytes[9] < 5 ||
        uint32(bytes, 1) > uint32(bytes, 5)) {
        return null;
    }
    return {
        command: "requestDatalog",
        startTime: uint32(bytes, 1),
        endTime: uint32(bytes, 5),
        uplinkInterval: bytes[9]
    };
}

function encodeDownlink(input) {
    var data = input && input.data;
    if (!data || typeof data.command !== "string") {
        return { errors: ["LHT52 downlink data.command is required"] };
    }

    switch (data.command) {
    case "setUplinkInterval":
        if (!isIntegerInRange(data.seconds, 1, 0xFFFFFF)) {
            return { errors: ["LHT52 uplink interval must be 1..16777215 seconds"] };
        }
        return { bytes: [0x01, data.seconds >> 16, data.seconds >> 8 & 0xFF, data.seconds & 0xFF], fPort: 2 };
    case "reboot":
        return { bytes: [0x04, 0xFF], fPort: 2 };
    case "factoryReset":
        return { bytes: [0x04, 0xFE], fPort: 2 };
    case "setConfirmationMode":
        if (typeof data.enabled !== "boolean") {
            return { errors: ["LHT52 confirmation mode requires enabled: true or false"] };
        }
        return { bytes: [0x05, data.enabled ? 1 : 0], fPort: 2 };
    case "setSubBand":
        if (!isIntegerInRange(data.subBand, 0, 7)) {
            return { errors: ["LHT52 sub-band must be 0..7"] };
        }
        return { bytes: [0x07, data.subBand], fPort: 2 };
    case "requestStatus":
        return { bytes: [0x23, 0x01], fPort: 2 };
    case "requestExternalProbeId":
        return { bytes: [0x23, 0x02], fPort: 2 };
    case "setAlarmMode":
        if (typeof data.enabled !== "boolean") {
            return { errors: ["LHT52 alarm mode requires enabled: true or false"] };
        }
        return { bytes: [0xA5, data.enabled ? 1 : 0], fPort: 2 };
    case "setAlarmCheckInterval":
        if (!isIntegerInRange(data.minutes, 1, 0xFFFF)) {
            return { errors: ["LHT52 alarm check interval must be 1..65535 minutes"] };
        }
        return { bytes: [0xA7, data.minutes >> 8, data.minutes & 0xFF], fPort: 2 };
    case "setAlarmConfiguration":
        if (typeof data.enabled !== "boolean" ||
            !isIntegerInRange(data.intervalMinutes, 1, 0xFFFF) ||
            !isIntegerInRange(data.minimumTemperature, -32768, 32767) ||
            !isIntegerInRange(data.maximumTemperature, -32768, 32767) ||
            data.minimumTemperature >= data.maximumTemperature) {
            return { errors: ["LHT52 alarm configuration requires a valid interval and increasing integer temperature limits"] };
        }
        return {
            bytes: [
                0xAA, data.enabled ? 1 : 0,
                data.intervalMinutes >> 8, data.intervalMinutes & 0xFF,
                signed16(data.minimumTemperature) >> 8, signed16(data.minimumTemperature) & 0xFF,
                signed16(data.maximumTemperature) >> 8, signed16(data.maximumTemperature) & 0xFF
            ],
            fPort: 2
        };
    case "requestDatalog":
        if (!isIntegerInRange(data.startTime, 0, 0xFFFFFFFF) ||
            !isIntegerInRange(data.endTime, 0, 0xFFFFFFFF) ||
            data.startTime > data.endTime ||
            !isIntegerInRange(data.uplinkInterval, 5, 255)) {
            return { errors: ["LHT52 datalog query requires ordered Unix timestamps and a 5..255 second uplink interval"] };
        }
        return {
            bytes: [
                0x31,
                data.startTime >>> 24, data.startTime >>> 16 & 0xFF, data.startTime >>> 8 & 0xFF, data.startTime & 0xFF,
                data.endTime >>> 24, data.endTime >>> 16 & 0xFF, data.endTime >>> 8 & 0xFF, data.endTime & 0xFF,
                data.uplinkInterval
            ],
            fPort: 2
        };
    default:
        return { errors: ["Unsupported LHT52 downlink command: " + data.command] };
    }
}

function decodeDownlink(input) {
    var bytes = downlinkBytes(input);
    if (!bytes || bytes.length === 0) {
        return { errors: ["Invalid LHT52 downlink bytes"] };
    }
    if (input.fPort !== undefined && input.fPort !== 2) {
        return { errors: ["Unsupported LHT52 downlink fPort: " + input.fPort] };
    }

    var data;
    if (bytes.length === 4 && bytes[0] === 0x01) {
        data = { command: "setUplinkInterval", seconds: uint24(bytes, 1) };
    } else if (bytes.length === 2 && bytes[0] === 0x04 && bytes[1] === 0xFF) {
        data = { command: "reboot" };
    } else if (bytes.length === 2 && bytes[0] === 0x04 && bytes[1] === 0xFE) {
        data = { command: "factoryReset" };
    } else if (bytes.length === 2 && bytes[0] === 0x05 && bytes[1] <= 1) {
        data = { command: "setConfirmationMode", enabled: bytes[1] === 1 };
    } else if (bytes.length === 2 && bytes[0] === 0x07 && bytes[1] <= 7) {
        data = { command: "setSubBand", subBand: bytes[1] };
    } else if (bytes.length === 2 && bytes[0] === 0x23 && bytes[1] === 0x01) {
        data = { command: "requestStatus" };
    } else if (bytes.length === 2 && bytes[0] === 0x23 && bytes[1] === 0x02) {
        data = { command: "requestExternalProbeId" };
    } else if (bytes.length === 2 && bytes[0] === 0xA5 && bytes[1] <= 1) {
        data = { command: "setAlarmMode", enabled: bytes[1] === 1 };
    } else if (bytes.length === 3 && bytes[0] === 0xA7 && uint16(bytes, 1) > 0) {
        data = { command: "setAlarmCheckInterval", minutes: uint16(bytes, 1) };
    } else if (bytes.length === 8 && bytes[0] === 0xAA && bytes[1] <= 1 &&
        uint16(bytes, 2) > 0 && int16(bytes, 4) < int16(bytes, 6)) {
        data = {
            command: "setAlarmConfiguration",
            enabled: bytes[1] === 1,
            intervalMinutes: uint16(bytes, 2),
            minimumTemperature: int16(bytes, 4),
            maximumTemperature: int16(bytes, 6)
        };
    } else if (bytes[0] === 0x31) {
        data = decodeDatalogCommand(bytes);
    }

    return data ? { data: data } : { errors: ["Unsupported or malformed LHT52 downlink command"] };
}

exports.encodeDownlink = encodeDownlink;
exports.decodeDownlink = decodeDownlink;
