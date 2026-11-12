// Independently implemented from the published T68DL payload tables:
// https://wiki.dragino.com/docs/LoRaWAN-End-Node/temperature-humidity-sensors/t68dl/
function uint16(bytes, offset) {
    return bytes[offset] * 256 + bytes[offset + 1];
}

function int16(bytes, offset) {
    var value = uint16(bytes, offset);
    return value & 0x8000 ? value - 0x10000 : value;
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
