function readUInt16BE(bytes, index) {
    return (bytes[index] << 8) | bytes[index + 1];
}

function readInt16BE(bytes, index) {
    var value = readUInt16BE(bytes, index);
    if (value & 0x8000) {
        return value - 0x10000;
    }
    return value;
}

function readUInt32BE(bytes, index) {
    return (
        ((bytes[index] << 24) >>> 0) |
        (bytes[index + 1] << 16) |
        (bytes[index + 2] << 8) |
        bytes[index + 3]
    ) >>> 0;
}

function readFloat32BE(bytes, index) {
    var arr = new Uint8Array(4);
    arr[0] = bytes[index];
    arr[1] = bytes[index + 1];
    arr[2] = bytes[index + 2];
    arr[3] = bytes[index + 3];
    return new DataView(arr.buffer).getFloat32(0, false);
}

function toHex(bytes) {
    return bytes.map(function (b) {
        return b.toString(16).padStart(2, "0");
    }).join("");
}

function getNamurLabel(code) {
    var map = {
        0: "good",
        1: "functionCheck",
        2: "maintenanceRequired",
        3: "outOfSpecification",
        4: "failure"
    };
    return map[code] || "unknown";
}

function getUnitLabel(code) {
    var map = {
        45: "m"
    };
    return map[code] || "unknown";
}

function decodePacket(bytes) {
    var packetId = bytes[0];
    var data = {
        packetId: packetId,
        rawHex: toHex(bytes)
    };
    var warnings = [];

    if (packetId === 0xfe) {
        data.packetType = "dummy";
        return { data: data, warnings: warnings };
    }

    if (bytes.length < 8) {
        warnings.push("Payload too short for VEGAPULS Air packet");
        return { data: data, warnings: warnings };
    }

    data.namurStatus = {
        code: bytes[1],
        label: getNamurLabel(bytes[1])
    };

    var measurement = readFloat32BE(bytes, 2);
    data.measurement = {
        value: Number.isNaN(measurement) ? null : measurement,
        unitCode: bytes[6],
        unit: getUnitLabel(bytes[6])
    };
    if (Number.isNaN(measurement)) {
        warnings.push("Measurement value is NaN");
    }

    data.batteryLevel = bytes[7];

    var offset = 8;
    var hasTemperature = packetId === 2 || packetId === 3 || packetId === 4 || packetId === 5;
    var hasGps = packetId === 3 || packetId === 5;
    var hasVegaStatus = packetId === 4 || packetId === 5;

    if (hasTemperature) {
        if (bytes.length >= offset + 2) {
            data.temperature = readInt16BE(bytes, offset) / 10;
            offset += 2;
        } else {
            warnings.push("Missing temperature bytes");
        }
    }

    if (hasGps) {
        if (bytes.length >= offset + 8) {
            data.location = {
                latitude: readFloat32BE(bytes, offset),
                longitude: readFloat32BE(bytes, offset + 4)
            };
            offset += 8;
        } else {
            warnings.push("Missing GNSS bytes");
        }
    }

    if (hasVegaStatus) {
        if (bytes.length >= offset + 4) {
            data.vegaDeviceStatus = readUInt32BE(bytes, offset);
            offset += 4;
        } else {
            warnings.push("Missing VEGA status bytes");
        }
    }

    if (bytes.length > offset) {
        data.tiltAngle = bytes[offset];
        offset += 1;
    }

    if (bytes.length > offset) {
        warnings.push("Unexpected trailing bytes");
        data.trailingHex = toHex(bytes.slice(offset));
    }

    return {
        data: data,
        warnings: warnings
    };
}

function decodeUplink(input) {
    var bytes = input && input.bytes;
    if (!Array.isArray(bytes) || bytes.length === 0) {
        return {
            data: {},
            errors: ["Empty payload"],
            warnings: []
        };
    }

    var decoded = decodePacket(bytes);

    return {
        data: decoded.data,
        errors: [],
        warnings: decoded.warnings
    };
}



exports.decodeUplink = decodeUplink;
