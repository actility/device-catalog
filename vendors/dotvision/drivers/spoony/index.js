function readFloat32LE(bytes, offset) {
    var sign = bytes[offset + 3] & 128 ? -1 : 1;
    var exponent = ((bytes[offset + 3] & 127) << 1) | (bytes[offset + 2] >> 7);
    var fraction = ((bytes[offset + 2] & 127) << 16) | (bytes[offset + 1] << 8) | bytes[offset];
    if (exponent === 255) {
        return null;
    }
    if (exponent === 0) {
        return sign * fraction * Math.pow(2, -149);
    }
    return sign * (1 + fraction / 8388608) * Math.pow(2, exponent - 127);
}

function decodeUplink(input) {
    var measurements = [];
    var bytes = input && input.bytes;
    var offset = 0;
    if (!Array.isArray(bytes) || bytes.length === 0) {
        return { errors: ["Expected a non-empty payload byte array."] };
    }
    for (var byteIndex = 0; byteIndex < bytes.length; byteIndex++) {
        if (typeof bytes[byteIndex] !== "number" || bytes[byteIndex] % 1 !== 0 ||
            bytes[byteIndex] < 0 || bytes[byteIndex] > 255) {
            return { errors: ["Invalid payload byte at offset " + byteIndex + "."] };
        }
    }
    while (offset < bytes.length) {
        var length = bytes[offset++];
        if (offset + length + 4 > bytes.length) {
            return { errors: ["Truncated sample at offset " + (offset - 1) + "."] };
        }
        var tag = "";
        for (var tagIndex = 0; tagIndex < length; tagIndex++) {
            var character = bytes[offset++];
            if (character > 127) {
                return { errors: ["Non-ASCII tag at offset " + (offset - 1) + "."] };
            }
            tag += String.fromCharCode(character);
        }
        var value = readFloat32LE(bytes, offset);
        if (value === null) {
            return { errors: ["Non-finite measurement for tag " + tag + "."] };
        }
        offset += 4;
        measurements.push({ tag: tag, value: value });
    }
    return { data: { measurements: measurements }, errors: [], warnings: [] };
}

exports.decodeUplink = decodeUplink;