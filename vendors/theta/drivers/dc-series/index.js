/* ==========================================================================
 * Theta DC series LoRaWAN driver (DC110-L corrosion sensor)
 * --------------------------------------------------------------------------
 * Scope: DC series corrosion sensor.
 *   - data blocks listed in section 3.4.5 of the payload specification
 *   - fragmented data blocks used to carry the corrosion waveform
 *     (sections 3.5 and 5.2)
 *
 * Blocks produced by other device families (vibration, tilt, bolt preload,
 * pressure, audio) are not part of this driver.
 *
 * Codec API: LoRa Alliance payload codec API (TS013-1.0.0).
 *
 * Frame layout: header byte (protocolVersion[7:6] | msgType[5:0]) followed by
 * TLV blocks. The payload length of a block is given by its type range; 0xFF
 * escapes an extended type. All multi-byte values are little endian.
 *
 * Units of the decoded fields:
 *   temperature, auxTemperature, chipTemp: °C
 *   thickness: mm
 *   flightTime: µs
 *   corrosionRateShort, corrosionRateLong: mm/year
 *   batteryVoltageMv: mV
 *   timestamp, buildTime: Unix time in seconds (timestampStr and buildTimeStr
 *   give the same instant as an ISO 8601 UTC string)
 * ========================================================================== */

var SUPPORTED_FPORT = 1;
var SUPPORTED_PROTOCOL_VERSION = 0;

var MESSAGE_TYPE_NAMES = {
    0x01: "systemInfo",
    0x02: "heartbeat",
    0x03: "event",
    0x04: "sensorData",
    0x05: "sensorDataQos",
    0x06: "fragmentedData",
    0x21: "rebootResponse",
    0x22: "testResponse",
    0x23: "syncResponse",
    0x25: "getSettingsResponse",
    0x26: "updateSettingsResponse",
    0x27: "restoreSettingsResponse",
    0x28: "resetSensorDataResponse",
    0x29: "getSensorDataResponse",
    0x2A: "calibrateSensorResponse",
    0x39: "temperatureCompensationResponse"
};

// Event types of the DC series corrosion sensor (spec 3.3.5)
var EVENT_TYPE_NAMES = {
    0x10: "temperatureSensorCommunicationFailed",
    0x11: "temperatureReadFailed",
    0x14: "temperatureOverThreshold",
    0x40: "ultrasonicSensorCommunicationFailed",
    0x41: "ultrasonicTemperatureReadFailed",
    0x42: "temperatureCompensationFailed",
    0x43: "ultrasonicAlgorithmError",
    0x44: "ultrasonicTemperatureChangeLarge",
    0x45: "ultrasonicSignalTooSmall",
    0x46: "ultrasonicTimeOfFlightChangeLarge",
    0x47: "ultrasonicScanUnstable",
    0x4A: "thicknessOverThreshold",
    0x4B: "shortPeriodCorrosionRateOverThreshold",
    0x4C: "longPeriodCorrosionRateOverThreshold",
    0x4F: "temperatureCompensationSuccess"
};

var EVENT_PRIORITY_NAMES = {
    0: "disarmed",
    1: "normal",
    2: "important",
    3: "critical",
    4: "informational"
};

// ---- byte helpers ----------------------------------------------------------

function toHex(bytes) {
    var out = "";
    for (var i = 0; i < bytes.length; i++) {
        out += (bytes[i] < 0x10 ? "0" : "") + bytes[i].toString(16).toUpperCase();
    }
    return out;
}

function typeLabel(type) {
    return "0x" + (type < 0x10 ? "0" : "") + type.toString(16).toUpperCase();
}

function readU16LE(bytes, offset) {
    return bytes[offset] | (bytes[offset + 1] << 8);
}

function readI16LE(bytes, offset) {
    var v = readU16LE(bytes, offset);
    return v > 0x7fff ? v - 0x10000 : v;
}

function readU32LE(bytes, offset) {
    return (bytes[offset] |
        (bytes[offset + 1] << 8) |
        (bytes[offset + 2] << 16) |
        (bytes[offset + 3] << 24)) >>> 0;
}

function readFloat32LE(bytes, offset) {
    var view = new DataView(new ArrayBuffer(4));
    for (var i = 0; i < 4; i++) {
        view.setUint8(i, bytes[offset + i]);
    }
    return view.getFloat32(0, true);
}

// Float32 values carry more digits than the sensor resolution (thickness is
// ±0.01 mm at best): keep 3 decimals.
function round3(value) {
    return Math.round(value * 1000) / 1000;
}

function toIsoTime(seconds) {
    return new Date(seconds * 1000).toISOString();
}

// ---- TLV blocks ------------------------------------------------------------

// Payload length of a TLV block, given by its type range. Returns -1 when the
// length cannot be read from the frame.
function getTypePayloadLength(type, bytes, offset) {
    if (type <= 0x01) {
        return 0;
    }
    if (type <= 0x1F) {
        return 1;
    }
    if (type <= 0x5F) {
        return 2;
    }
    if (type <= 0x9F) {
        return 4;
    }
    if (type <= 0xBF) {
        return 6;
    }
    if (type <= 0xDF) {
        return 12;
    }
    if (type <= 0xEF) {
        // 1 byte length followed by the value
        return offset + 1 <= bytes.length ? 1 + bytes[offset] : -1;
    }
    if (type <= 0xFE) {
        // 2 byte length (little endian) followed by the value
        return offset + 2 <= bytes.length ? 2 + readU16LE(bytes, offset) : -1;
    }
    return 0;
}

// Decoders of the known blocks: (bytes, offset of the payload, payload length, data)
var TYPE_DECODERS = {
    // ---- command response: signed response code, negative on failure (spec 4.1)
    0x02: function (bytes, offset, length, data) {
        var raw = bytes[offset];
        data.responseCode = raw > 0x7f ? raw - 0x100 : raw;
    },

    // ---- common status
    0x20: function (bytes, offset, length, data) {
        var code = readU16LE(bytes, offset);
        var priority = (code >> 13) & 0x07;
        var eventType = code & 0x1fff;
        data.eventPriority = priority;
        data.eventPriorityName = EVENT_PRIORITY_NAMES[priority] || "";
        data.eventType = eventType;
        data.eventTypeName = EVENT_TYPE_NAMES[eventType] || "";
    },
    0x21: function (bytes, offset, length, data) {
        data.batteryVoltageMv = readU16LE(bytes, offset);
    },
    0x22: function (bytes, offset, length, data) {
        data.signal = readI16LE(bytes, offset);
    },
    0x23: function (bytes, offset, length, data) {
        data.chipTemp = readI16LE(bytes, offset) / 10;
    },

    // ---- corrosion sensor data (spec 3.4.5)
    0x25: function (bytes, offset, length, data) {
        data.ultrasonicSignalStrength = readU16LE(bytes, offset) / 10;
    },
    0x26: function (bytes, offset, length, data) {
        data.ultrasonicSignalQuality = readU16LE(bytes, offset) / 10;
    },
    0x2B: function (bytes, offset, length, data) {
        data.corrosionRateShort = readI16LE(bytes, offset) / 1000;
    },
    0x2C: function (bytes, offset, length, data) {
        data.corrosionRateLong = readI16LE(bytes, offset) / 1000;
    },
    0x68: function (bytes, offset, length, data) {
        data.temperature = round3(readFloat32LE(bytes, offset));
    },
    0x6A: function (bytes, offset, length, data) {
        data.auxTemperature = round3(readFloat32LE(bytes, offset));
    },
    0x6D: function (bytes, offset, length, data) {
        data.flightTime = round3(readFloat32LE(bytes, offset));
    },
    0x6E: function (bytes, offset, length, data) {
        data.thickness = round3(readFloat32LE(bytes, offset));
    },

    // ---- system information
    0x60: function (bytes, offset, length, data) {
        data.timestamp = readU32LE(bytes, offset);
        data.timestampStr = toIsoTime(data.timestamp);
    },
    0x61: function (bytes, offset, length, data) {
        data.hardwareId = readU32LE(bytes, offset);
    },
    0x62: function (bytes, offset, length, data) {
        data.firmwareVersion = bytes[offset] + "." + bytes[offset + 1] + "." +
            bytes[offset + 2] + "." + bytes[offset + 3];
    },
    0x63: function (bytes, offset, length, data) {
        data.buildTime = readU32LE(bytes, offset);
        data.buildTimeStr = toIsoTime(data.buildTime);
    },
    0x64: function (bytes, offset, length, data) {
        data.sessionId = readU32LE(bytes, offset);
    },
    0xA0: function (bytes, offset, length, data) {
        data.macAddress = toHex(bytes.slice(offset, offset + length));
    },
    0xE1: function (bytes, offset, length, data) {
        var name = "";
        for (var i = offset + 1; i < offset + length; i++) {
            name += String.fromCharCode(bytes[i]);
        }
        data.deviceName = name;
    },

    // ---- fragmented data (spec 3.5 and 5.2)
    //
    // A fragmented transfer carries one byte stream (16 byte header followed
    // by the body) spread over several uplinks. The driver only exposes the
    // transfer metadata together with the raw fragment bytes; reassembling the
    // stream and decoding the body is left to the application.
    0x9E: function (bytes, offset, length, data) {
        data.packetTotal = readU32LE(bytes, offset);
    },
    0x9F: function (bytes, offset, length, data) {
        data.packetIndex = readU32LE(bytes, offset);
    },
    0xE2: function (bytes, offset, length, data) {
        var fragment = bytes.slice(offset + 1, offset + length);
        data.fragmentDataHex = toHex(fragment);
        data.fragmentDataLength = fragment.length;
    }
};

// ---- LoRa Alliance codec API -----------------------------------------------

/**
 * @param {{bytes: number[], fPort: number, recvTime: string}} input
 * @returns {{data?: Object, errors: string[], warnings: string[]}}
 */
function decodeUplink(input) {
    var errors = [];
    var warnings = [];
    var bytes = input && input.bytes;

    if (!Array.isArray(bytes) || bytes.length === 0) {
        return { errors: ["Invalid uplink payload: empty payload"], warnings: warnings };
    }
    if (input.fPort !== SUPPORTED_FPORT) {
        return { errors: ["Unsupported fPort: " + input.fPort + " (expected " + SUPPORTED_FPORT + ")"], warnings: warnings };
    }

    var protocolVersion = (bytes[0] >> 6) & 0x03;
    var msgType = bytes[0] & 0x3f;

    // Another protocol version may lay out the frame differently: nothing can
    // be trusted.
    if (protocolVersion !== SUPPORTED_PROTOCOL_VERSION) {
        return { errors: ["Unsupported protocol version: " + protocolVersion + " (expected " + SUPPORTED_PROTOCOL_VERSION + ")"], warnings: warnings };
    }

    var data = {
        protocolVersion: protocolVersion,
        msgType: msgType,
        msgTypeName: MESSAGE_TYPE_NAMES[msgType] || "unknown"
    };

    // The TLV blocks are self-describing: the known ones still decode.
    if (!MESSAGE_TYPE_NAMES[msgType]) {
        warnings.push("Unknown message type: " + typeLabel(msgType));
    }

    var offset = 1;
    while (offset < bytes.length) {
        var typeOffset = offset;
        var type = bytes[offset++];

        if (type === 0xFF) {
            if (offset >= bytes.length) {
                errors.push("Truncated payload: incomplete TLV at offset " + typeOffset);
                break;
            }
            type = bytes[offset++];
        }

        var length = getTypePayloadLength(type, bytes, offset);
        if (length < 0 || offset + length > bytes.length) {
            errors.push("Truncated payload: incomplete TLV at offset " + typeOffset);
            break;
        }

        var decoder = TYPE_DECODERS[type];
        if (decoder) {
            decoder(bytes, offset, length, data);
        } else {
            warnings.push("Unknown TLV type " + typeLabel(type) + " at offset " + typeOffset + " ignored" +
                (length > 0 ? ": " + toHex(bytes.slice(offset, offset + length)) : ""));
        }
        offset += length;
    }

    if (errors.length > 0) {
        return { errors: errors, warnings: warnings };
    }
    return { data: data, errors: errors, warnings: warnings };
}

exports.decodeUplink = decodeUplink;
