// Independently implemented from the published LHT52 payload tables:
// https://wiki.dragino.com/docs/LoRaWAN-End-Node/temperature-humidity-sensors/lht52/
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
