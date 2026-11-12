// Independently implemented from the published LHT65N-E5 payload tables:
// https://wiki.dragino.com/docs/LoRaWAN-End-Node/temperature-humidity-sensors/lht65n-e5/
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

function isIntegerInRange(value, min, max) {
    return typeof value === "number" && isFinite(value) && Math.floor(value) === value &&
        value >= min && value <= max;
}

function signed16(value) {
    return value < 0 ? value + 0x10000 : value;
}

function batteryStatus(code) {
    return ["Ultra Low", "Low", "OK", "Good"][code];
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

function decodeStatus(bytes) {
    if (bytes.length !== 7 || bytes[0] !== 0x0B) {
        return { errors: ["Invalid LHT65N-E5 device status payload"] };
    }
    return {
        data: {
            SENSOR_MODEL: "LHT65N-E5",
            FIRMWARE_VERSION: (bytes[1] & 0x0F) + "." + (bytes[2] >> 4 & 0x0F) + "." + (bytes[2] & 0x0F),
            FREQUENCY_BAND: frequencyBand(bytes[3]),
            SUB_BAND: bytes[4],
            BAT: uint16(bytes, 5) / 1000
        }
    };
}

function decodeRealtime(bytes) {
    if (bytes.length !== 11) {
        return { errors: ["Invalid LHT65N-E5 real-time payload length: expected 11 bytes, got " + bytes.length] };
    }
    var extAndFlags = bytes[6];
    var ext = extAndFlags & 0x0F;
    if (ext === 0x09) {
        var batteryAndIlluminance = uint16(bytes, 4);
        var timestampedData = {
            Node_type: "LHT65N-E5",
            Work_mode: "External temperature with Unix timestamp",
            TempC_SHT: int16(bytes, 2) / 100,
            Bat_status: batteryStatus(batteryAndIlluminance >> 14),
            ILL_lx: batteryAndIlluminance & 0x3FFF,
            No_ack: (extAndFlags & 0x80) !== 0,
            Poll_message: (extAndFlags & 0x40) !== 0,
            Time_sync_ok: (extAndFlags & 0x20) !== 0,
            Time_request: (extAndFlags & 0x10) !== 0,
            Systimestamp: uint32(bytes, 7)
        };
        if (uint16(bytes, 0) !== 0x7FFF) {
            timestampedData.TempC_DS = int16(bytes, 0) / 100;
        }
        return { data: timestampedData };
    }
    if (ext !== 0x05) {
        return { errors: ["Unsupported LHT65N-E5 external sensor type: 0x" + bytes[6].toString(16).toUpperCase()] };
    }
    var battery = uint16(bytes, 0);
    return {
        data: {
            Node_type: "LHT65N-E5",
            BatV: (battery & 0x3FFF) / 1000,
            Bat_status: ["Ultra Low", "Low", "OK", "Good"][battery >> 14],
            TempC_SHT: int16(bytes, 2) / 100,
            Hum_SHT: (uint16(bytes, 4) & 0x0FFF) / 10,
            Ext_sensor: "Illuminance Sensor",
            ILL_lx: uint16(bytes, 7)
        }
    };
}

function decodeDatalog(bytes) {
    if (bytes.length === 0 || bytes.length % 11 !== 0) {
        return { errors: ["Invalid LHT65N-E5 datalog payload length"] };
    }
    if (bytes.every(function(byte) { return byte === 0; })) {
        return { data: { Node_type: "LHT65N-E5", samples: [] } };
    }

    var samples = [];
    for (var offset = 0; offset < bytes.length; offset += 11) {
        var extAndFlags = bytes[offset + 6];
        var ext = extAndFlags & 0x0F;
        if (ext !== 0x01 && ext !== 0x05 && ext !== 0x09) {
            return { errors: ["Unsupported LHT65N-E5 datalog sensor type: 0x" + ext.toString(16).toUpperCase()] };
        }
        var sample = {
            temperature: int16(bytes, offset + 2) / 100,
            timestamp: timestamp(bytes, offset + 7),
            pollMessage: (extAndFlags & 0x40) !== 0,
            noAckMessage: (extAndFlags & 0x80) !== 0
        };
        var externalValue = uint16(bytes, offset);
        var humidityOrBattery = uint16(bytes, offset + 4);
        if (ext === 0x01) {
            if (externalValue !== 0x7FFF) {
                sample.externalTemperature = int16(bytes, offset) / 100;
            }
            sample.humidity = (humidityOrBattery & 0x0FFF) / 10;
        } else if (ext === 0x05) {
            sample.humidity = (humidityOrBattery & 0x0FFF) / 10;
            if (externalValue !== 0x7FFF) {
                sample.illuminance = externalValue;
            }
        } else {
            sample.batteryStatus = batteryStatus(humidityOrBattery >> 14);
            sample.illuminance = humidityOrBattery & 0x3FFF;
            if (externalValue !== 0x7FFF) {
                sample.externalTemperature = int16(bytes, offset) / 100;
            }
        }
        samples.push(sample);
    }
    return { data: { Node_type: "LHT65N-E5", samples: samples } };
}

function decodeUplink(input) {
    var bytes = input && input.bytes;
    if (!Array.isArray(bytes) || bytes.some(function(byte) {
        return !isIntegerInRange(byte, 0, 255);
    })) {
        return { errors: ["Invalid LHT65N-E5 payload bytes"] };
    }
    if (input.fPort === 2) {
        return decodeRealtime(bytes);
    }
    if (input.fPort === 3) {
        return decodeDatalog(bytes);
    }
    if (input.fPort === 5) {
        return decodeStatus(bytes);
    }
    return { errors: ["Unsupported LHT65N-E5 fPort: " + input.fPort] };
}

function encodeDownlink(input) {
    var data = input && input.data;
    if (!data || typeof data.command !== "string") {
        return { errors: ["LHT65N-E5 downlink data.command is required"] };
    }

    switch (data.command) {
    case "setUplinkInterval":
        if (!isIntegerInRange(data.seconds, 1, 0xFFFFFF)) {
            return { errors: ["LHT65N-E5 uplink interval must be 1..16777215 seconds"] };
        }
        return { bytes: [0x01, data.seconds >> 16, data.seconds >> 8 & 0xFF, data.seconds & 0xFF], fPort: 2 };
    case "reboot":
        return { bytes: [0x04, 0xFF], fPort: 2 };
    case "factoryReset":
        return { bytes: [0x04, 0xFE], fPort: 2 };
    case "requestStatus":
        return { bytes: [0x26, 0x01], fPort: 2 };
    case "setExternalSensorMode":
        if (data.mode !== 5) {
            return { errors: ["LHT65N-E5 external sensor mode must be 5"] };
        }
        return { bytes: [0xA2, 0x05], fPort: 2 };
    case "setSystemTime":
        if (!isIntegerInRange(data.unixTime, 0, 0xFFFFFFFF)) {
            return { errors: ["LHT65N-E5 system time must be a 32-bit Unix timestamp"] };
        }
        return {
            bytes: [
                0x30, data.unixTime >>> 24, data.unixTime >>> 16 & 0xFF,
                data.unixTime >>> 8 & 0xFF, data.unixTime & 0xFF, 0x00
            ],
            fPort: 2
        };
    case "setTimeSyncMode":
        if (typeof data.enabled !== "boolean") {
            return { errors: ["LHT65N-E5 time sync mode requires enabled: true or false"] };
        }
        return { bytes: [0x28, data.enabled ? 1 : 0], fPort: 2 };
    case "setTimeSyncInterval":
        if (!isIntegerInRange(data.days, 1, 255)) {
            return { errors: ["LHT65N-E5 time sync interval must be 1..255 days"] };
        }
        return { bytes: [0x29, data.days], fPort: 2 };
    case "requestDatalog":
        if (!isIntegerInRange(data.startTime, 0, 0xFFFFFFFF) ||
            !isIntegerInRange(data.endTime, 0, 0xFFFFFFFF) ||
            data.startTime > data.endTime ||
            !isIntegerInRange(data.uplinkInterval, 5, 255)) {
            return { errors: ["LHT65N-E5 datalog query requires ordered Unix timestamps and a 5..255 second uplink interval"] };
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
    case "clearDatalog":
        return { bytes: [0xA3, 0x01], fPort: 2 };
    case "setRetransmission":
        if (typeof data.enabled !== "boolean") {
            return { errors: ["LHT65N-E5 retransmission requires enabled: true or false"] };
        }
        return { bytes: [0x34, data.enabled ? 1 : 0], fPort: 2 };
    case "setAlarmConfiguration":
        if (typeof data.enabled !== "boolean" ||
            !isIntegerInRange(data.interval, 1, 0xFFFF) ||
            !isIntegerInRange(data.minimumTemperature, -32768, 32767) ||
            !isIntegerInRange(data.maximumTemperature, -32768, 32767) ||
            data.minimumTemperature >= data.maximumTemperature) {
            return { errors: ["LHT65N-E5 alarm configuration requires a valid interval and increasing integer temperature limits"] };
        }
        return {
            bytes: [
                0xAA, data.enabled ? 1 : 0,
                data.interval >> 8, data.interval & 0xFF,
                signed16(data.minimumTemperature) >> 8, signed16(data.minimumTemperature) & 0xFF,
                signed16(data.maximumTemperature) >> 8, signed16(data.maximumTemperature) & 0xFF
            ],
            fPort: 2
        };
    default:
        return { errors: ["Unsupported LHT65N-E5 downlink command: " + data.command] };
    }
}

function decodeDownlink(input) {
    var bytes = downlinkBytes(input);
    if (!bytes || bytes.length === 0) {
        return { errors: ["Invalid LHT65N-E5 downlink bytes"] };
    }
    if (input.fPort !== undefined && input.fPort !== 2) {
        return { errors: ["Unsupported LHT65N-E5 downlink fPort: " + input.fPort] };
    }

    var data;
    if (bytes.length === 4 && bytes[0] === 0x01) {
        data = { command: "setUplinkInterval", seconds: uint24(bytes, 1) };
    } else if (bytes.length === 2 && bytes[0] === 0x04 && bytes[1] === 0xFF) {
        data = { command: "reboot" };
    } else if (bytes.length === 2 && bytes[0] === 0x04 && bytes[1] === 0xFE) {
        data = { command: "factoryReset" };
    } else if (bytes.length === 2 && bytes[0] === 0x26 && bytes[1] === 0x01) {
        data = { command: "requestStatus" };
    } else if (bytes.length === 2 && bytes[0] === 0xA2 && bytes[1] === 0x05) {
        data = { command: "setExternalSensorMode", mode: 5 };
    } else if (bytes.length === 6 && bytes[0] === 0x30 && bytes[5] === 0) {
        data = { command: "setSystemTime", unixTime: uint32(bytes, 1) };
    } else if (bytes.length === 2 && bytes[0] === 0x28 && bytes[1] <= 1) {
        data = { command: "setTimeSyncMode", enabled: bytes[1] === 1 };
    } else if (bytes.length === 2 && bytes[0] === 0x29 && bytes[1] > 0) {
        data = { command: "setTimeSyncInterval", days: bytes[1] };
    } else if (bytes.length === 10 && bytes[0] === 0x31 && bytes[9] >= 5 &&
        uint32(bytes, 1) <= uint32(bytes, 5)) {
        data = {
            command: "requestDatalog",
            startTime: uint32(bytes, 1),
            endTime: uint32(bytes, 5),
            uplinkInterval: bytes[9]
        };
    } else if (bytes.length === 2 && bytes[0] === 0xA3 && bytes[1] === 0x01) {
        data = { command: "clearDatalog" };
    } else if (bytes.length === 2 && bytes[0] === 0x34 && bytes[1] <= 1) {
        data = { command: "setRetransmission", enabled: bytes[1] === 1 };
    } else if (bytes.length === 8 && bytes[0] === 0xAA && bytes[1] <= 1 &&
        uint16(bytes, 2) > 0 && int16(bytes, 4) < int16(bytes, 6)) {
        data = {
            command: "setAlarmConfiguration",
            enabled: bytes[1] === 1,
            interval: uint16(bytes, 2),
            minimumTemperature: int16(bytes, 4),
            maximumTemperature: int16(bytes, 6)
        };
    }
    return data ? { data: data } : { errors: ["Unsupported or malformed LHT65N-E5 downlink command"] };
}

exports.decodeUplink = decodeUplink;
exports.encodeDownlink = encodeDownlink;
exports.decodeDownlink = decodeDownlink;
