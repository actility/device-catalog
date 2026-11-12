// Independently implemented from the published T68DL payload tables:
// https://wiki.dragino.com/docs/LoRaWAN-End-Node/temperature-humidity-sensors/t68dl/
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

function status(bytes) {
    if (bytes.length !== 7) {
        return { errors: ["Invalid T68DL status length: expected 7 bytes, got " + bytes.length] };
    }
    if (bytes[0] !== 0x34) {
        return { errors: ["Unexpected sensor model in T68DL status: 0x" + bytes[0].toString(16).toUpperCase()] };
    }
    return {
        data: {
            SENSOR_MODEL: "T68DL",
            FIRMWARE_VERSION: (bytes[1] & 0x0F) + "." + (bytes[2] >> 4 & 0x0F) + "." + (bytes[2] & 0x0F),
            FREQUENCY_BAND: frequencyBand(bytes[3]),
            SUB_BAND: bytes[4],
            BAT: uint16(bytes, 5) / 1000
        }
    };
}

function decodeRealtime(bytes) {
    if (bytes.length !== 9) {
        return { errors: ["Invalid T68DL real-time frame length: expected 9 bytes, got " + bytes.length] };
    }
    var flags = bytes[4];
    return {
        data: {
            Node_type: "T68DL",
            BatV: uint16(bytes, 0) / 1000,
            TempC_TMP117: int16(bytes, 2) / 100,
            TEMPH_flag: (flags & 0x01) !== 0,
            TEMPL_flag: (flags & 0x02) !== 0,
            Data_time: timestamp(bytes, 5)
        }
    };
}

function isRepeatedByte(bytes, start, count, value) {
    for (var index = start; index < start + count; index++) {
        if (bytes[index] !== value) {
            return false;
        }
    }
    return true;
}

function decodeDatalog(bytes) {
    if (bytes.length === 0) {
        return { errors: ["Invalid T68DL datalog length: expected at least one record"] };
    }
    if (isRepeatedByte(bytes, 0, bytes.length, 0)) {
        return { data: { Node_type: "T68DL", samples: [] } };
    }

    if (bytes.length % 11 === 0 && bytes.length >= 11 && isRepeatedByte(bytes, 0, 4, 0xFF)) {
        var samples = [];
        for (var offset = 0; offset < bytes.length; offset += 11) {
            if (!isRepeatedByte(bytes, offset, 4, 0xFF)) {
                return { errors: ["Invalid T68DL datalog record: reserved bytes must be 0xFF"] };
            }
            var flags = bytes[offset + 6];
            samples.push({
                temperature: int16(bytes, offset + 4) / 100,
                noAckMessage: (flags & 0x80) !== 0,
                pollMessage: (flags & 0x40) !== 0,
                timestamp: timestamp(bytes, offset + 7)
            });
        }
        return { data: { Node_type: "T68DL", samples: samples } };
    }

    if (bytes.length >= 5 && (bytes.length - 3) % 2 === 0) {
        var sensorTypes = {
            1: "DS18B20",
            2: "TMP117",
            3: "GXHT30"
        };
        var sensorType = sensorTypes[bytes[2]];
        if (!sensorType) {
            return { errors: ["Unsupported T68DL multi-sample sensor type: 0x" + bytes[2].toString(16).toUpperCase()] };
        }
        var temperatures = [];
        for (var sampleOffset = 3; sampleOffset < bytes.length; sampleOffset += 2) {
            temperatures.push(int16(bytes, sampleOffset) / 100);
        }
        return {
            data: {
                Node_type: "T68DL",
                BatV: uint16(bytes, 0) / 1000,
                Sensor_Type: sensorType,
                TempC_Samples: temperatures
            }
        };
    }

    return { errors: ["Unsupported T68DL fPort 3 payload layout"] };
}

function decodeUplink(input) {
    var bytes = input && input.bytes;
    if (!Array.isArray(bytes) || bytes.some(function(byte) {
        return typeof byte !== "number" || byte % 1 !== 0 || byte < 0 || byte > 255;
    })) {
        return { errors: ["Invalid T68DL payload bytes"] };
    }
    if (input.fPort === 2) {
        return decodeRealtime(bytes);
    }
    if (input.fPort === 3) {
        return decodeDatalog(bytes);
    }
    if (input.fPort === 5) {
        return status(bytes);
    }
    return { errors: ["Unsupported T68DL fPort: " + input.fPort] };
}

exports.decodeUplink = decodeUplink;

function isIntegerInRange(value, min, max) {
    return typeof value === "number" && isFinite(value) && Math.floor(value) === value &&
        value >= min && value <= max;
}

function signed16(value) {
    return value < 0 ? value + 0x10000 : value;
}

function celsiusToSigned16(value) {
    if (typeof value !== "number" || !isFinite(value) ||
        Math.round(value * 100) / 100 !== value ||
        value < -327.68 || value > 327.67) {
        return null;
    }
    return signed16(Math.round(value * 100));
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

function encodeDownlink(input) {
    var data = input && input.data;
    if (!data || typeof data.command !== "string") {
        return { errors: ["T68DL downlink data.command is required"] };
    }

    switch (data.command) {
    case "setUplinkInterval":
        if (!isIntegerInRange(data.seconds, 1, 0xFFFFFF)) {
            return { errors: ["T68DL uplink interval must be 1..16777215 seconds"] };
        }
        return { bytes: [0x01, data.seconds >> 16, data.seconds >> 8 & 0xFF, data.seconds & 0xFF], fPort: 2 };
    case "reboot":
        return { bytes: [0x04, 0xFF], fPort: 2 };
    case "factoryReset":
        return { bytes: [0x04, 0xFE], fPort: 2 };
    case "requestStatus":
        return { bytes: [0x26, 0x01], fPort: 2 };
    case "setSystemTime":
        if (!isIntegerInRange(data.unixTime, 0, 0xFFFFFFFF)) {
            return { errors: ["T68DL system time must be a 32-bit Unix timestamp"] };
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
            return { errors: ["T68DL time sync mode requires enabled: true or false"] };
        }
        return { bytes: [0x28, data.enabled ? 1 : 0], fPort: 2 };
    case "setTimeSyncInterval":
        if (!isIntegerInRange(data.days, 1, 255)) {
            return { errors: ["T68DL time sync interval must be 1..255 days"] };
        }
        return { bytes: [0x29, data.days], fPort: 2 };
    case "requestDatalog":
        if (!isIntegerInRange(data.startTime, 0, 0xFFFFFFFF) ||
            !isIntegerInRange(data.endTime, 0, 0xFFFFFFFF) ||
            data.startTime > data.endTime ||
            !isIntegerInRange(data.uplinkInterval, 5, 255)) {
            return { errors: ["T68DL datalog query requires ordered Unix timestamps and a 5..255 second uplink interval"] };
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
            return { errors: ["T68DL retransmission requires enabled: true or false"] };
        }
        return { bytes: [0x34, data.enabled ? 1 : 0], fPort: 2 };
    case "setHighDataRate":
        if (typeof data.enabled !== "boolean") {
            return { errors: ["T68DL high data rate requires enabled: true or false"] };
        }
        return { bytes: [0xA1, data.enabled ? 1 : 0], fPort: 2 };
    case "requestAlarmConfiguration":
        return { bytes: [0xA5, 0xFF], fPort: 2 };
    case "setAlarmConfiguration":
        if (!isIntegerInRange(data.mode, 0, 3)) {
            return { errors: ["T68DL alarm mode must be 0..3"] };
        }
        if (data.mode === 0) {
            return { bytes: [0xA5, 0x00], fPort: 2 };
        }
        if (!isIntegerInRange(data.samplingSeconds, 1, 255)) {
            return { errors: ["T68DL alarm sampling interval must be 1..255 seconds"] };
        }
        if (data.mode === 1) {
            var minimumThreshold = celsiusToSigned16(data.minimumTemperature);
            var maximumThreshold = celsiusToSigned16(data.maximumTemperature);
            if (minimumThreshold === null || maximumThreshold === null ||
                data.minimumTemperature >= data.maximumTemperature) {
                return { errors: ["T68DL threshold alarm requires increasing Celsius limits with at most two decimal places"] };
            }
            return {
                bytes: [
                    0xA5, 0x01, data.samplingSeconds,
                    minimumThreshold >> 8, minimumThreshold & 0xFF,
                    maximumThreshold >> 8, maximumThreshold & 0xFF
                ],
                fPort: 2
            };
        }
        if (data.mode === 2) {
            if (!isIntegerInRange(data.fluctuationDegrees, 0, 255)) {
                return { errors: ["T68DL fluctuation alarm must be 0..255 degrees"] };
            }
            return { bytes: [0xA5, 0x02, data.samplingSeconds, data.fluctuationDegrees], fPort: 2 };
        }
        if (!isIntegerInRange(data.sampleCount, 1, 60) ||
            celsiusToSigned16(data.minimumTemperature) === null ||
            celsiusToSigned16(data.maximumTemperature) === null ||
            data.minimumTemperature >= data.maximumTemperature ||
            typeof data.alarmEnabled !== "boolean") {
            return { errors: ["T68DL batch alarm requires 1..60 samples, increasing Celsius limits with at most two decimals, and alarmEnabled"] };
        }
        var batchMinimum = celsiusToSigned16(data.minimumTemperature);
        var batchMaximum = celsiusToSigned16(data.maximumTemperature);
        return {
            bytes: [
                0xA5, 0x03, 0x00, data.samplingSeconds, data.sampleCount,
                batchMinimum >> 8, batchMinimum & 0xFF,
                batchMaximum >> 8, batchMaximum & 0xFF,
                data.alarmEnabled ? 1 : 0
            ],
            fPort: 2
        };
    default:
        return { errors: ["Unsupported T68DL downlink command: " + data.command] };
    }
}

function decodeDownlink(input) {
    var bytes = downlinkBytes(input);
    if (!bytes || bytes.length === 0) {
        return { errors: ["Invalid T68DL downlink bytes"] };
    }
    if (input.fPort !== undefined && input.fPort !== 2) {
        return { errors: ["Unsupported T68DL downlink fPort: " + input.fPort] };
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
    } else if (bytes.length === 2 && bytes[0] === 0xA1 && bytes[1] <= 1) {
        data = { command: "setHighDataRate", enabled: bytes[1] === 1 };
    } else if (bytes.length === 2 && bytes[0] === 0xA5 && bytes[1] === 0xFF) {
        data = { command: "requestAlarmConfiguration" };
    } else if (bytes.length === 2 && bytes[0] === 0xA5 && bytes[1] === 0) {
        data = { command: "setAlarmConfiguration", mode: 0 };
    } else if (bytes.length === 7 && bytes[0] === 0xA5 && bytes[1] === 1 &&
        bytes[2] > 0 && int16(bytes, 3) < int16(bytes, 5)) {
        data = {
            command: "setAlarmConfiguration",
            mode: 1,
            samplingSeconds: bytes[2],
            minimumTemperature: int16(bytes, 3) / 100,
            maximumTemperature: int16(bytes, 5) / 100
        };
    } else if (bytes.length === 4 && bytes[0] === 0xA5 && bytes[1] === 2 &&
        bytes[2] > 0) {
        data = {
            command: "setAlarmConfiguration",
            mode: 2,
            samplingSeconds: bytes[2],
            fluctuationDegrees: bytes[3]
        };
    } else if (bytes.length === 10 && bytes[0] === 0xA5 && bytes[1] === 3 &&
        bytes[2] === 0 && bytes[3] > 0 && bytes[4] > 0 && bytes[4] <= 60 &&
        int16(bytes, 5) < int16(bytes, 7) && bytes[9] <= 1) {
        data = {
            command: "setAlarmConfiguration",
            mode: 3,
            samplingSeconds: bytes[3],
            sampleCount: bytes[4],
            minimumTemperature: int16(bytes, 5) / 100,
            maximumTemperature: int16(bytes, 7) / 100,
            alarmEnabled: bytes[9] === 1
        };
    }

    return data ? { data: data } : { errors: ["Unsupported or malformed T68DL downlink command"] };
}

exports.encodeDownlink = encodeDownlink;
exports.decodeDownlink = decodeDownlink;
