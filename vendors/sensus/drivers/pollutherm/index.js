function readUInt16LE(bytes, offset) {
    return bytes[offset] | (bytes[offset + 1] << 8);
}

function readUInt32LE(bytes, offset) {
    return (
        bytes[offset] |
        (bytes[offset + 1] << 8) |
        (bytes[offset + 2] << 16) |
        (bytes[offset + 3] << 24)
    ) >>> 0;
}

function readFloatLE(bytes, offset) {
    const buffer = Buffer.from(bytes.slice(offset, offset + 4));
    return buffer.readFloatLE(0);
}

function decodeDataFrame(bytes) {
    return {
        type: readUInt16LE(bytes, 0),
        energy: readUInt32LE(bytes, 2),
        volume: readUInt32LE(bytes, 6),
        power: readFloatLE(bytes, 10),
        flowRate: readFloatLE(bytes, 14),
        temperature: {
            supply: readUInt16LE(bytes, 18),
            return: readUInt16LE(bytes, 20),
            delta: readUInt32LE(bytes, 22)
        },
        serialNumber: readUInt32LE(bytes, 26),
        errorCode: bytes[30] >> 4,
        coolingEnergy: readUInt32LE(bytes, 32)
    };
}

function decodeKeepAliveFrame(bytes) {
    return {
        type: readUInt16LE(bytes, 0),
        frame: "keepalive",
        modelSerialNumber: readUInt32LE(bytes, 0),
        deviceModelNumber: readUInt32LE(bytes, 2),
        firmwareVersion: readUInt16LE(bytes, 4),
        firmwareRevision1: readUInt32LE(bytes, 5),
        firmwareRevision2: readUInt32LE(bytes, 6),
        resetCause: bytes[14]
    };
}

function decodeUplink(input) {
    const result = {
        data: {},
        errors: [],
        warnings: []
    };

    if (!input || !Array.isArray(input.bytes) || input.bytes.length < 2) {
        return {
            errors: ["Invalid uplink payload: missing bytes"],
            warnings: []
        };
    }

    const bytes = input.bytes;
    const frameType = readUInt16LE(bytes, 0);

    if (input.fPort === 10) {
        result.data = decodeKeepAliveFrame(bytes);
        return result;
    }

    if (frameType === 0x01ff || frameType === 0x03ff) {
        result.data = decodeDataFrame(bytes);
        return result;
    }

    if (frameType === 0x0100) {
        result.data = {
            type: frameType,
            errorCode: 1,
            errorDescription: "PolluTherm power supply or M-Bus credit issue"
        };
        return result;
    }

    return {
        errors: ["Invalid uplink payload: unsupported frame type"],
        warnings: []
    };
}

exports.decodeUplink = decodeUplink;