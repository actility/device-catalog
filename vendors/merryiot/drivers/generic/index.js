function toSigned16(value) {
    return value > 0x7fff ? value - 0x10000 : value;
}

function readTemp(bytes, startIndex, v4Format) {
    if (v4Format) {
        const raw = (bytes[startIndex + 1] << 8) | bytes[startIndex];
        return toSigned16(raw) / 10;
    }

    const temp = bytes[startIndex];
    return temp > 125 ? temp - 256 : temp;
}

function readBatteryVolts(batteryByte) {
    return (21 + batteryByte) / 10;
}

function decodeMs10(bytes, v4Format) {
    const status = bytes[0];
    const timeOffset = v4Format ? 5 : 4;
    const countOffset = v4Format ? 7 : 6;

    return {
        battery_volt: readBatteryVolts(bytes[1]),
        temperature: readTemp(bytes, 2, v4Format),
        humi: bytes[v4Format ? 4 : 3],
        motion: status & 0x01 ? 1 : 0,
        button: status & 0x02 ? 1 : 0,
        tamper: status & 0x04 ? 1 : 0,
        time: (bytes[timeOffset + 1] << 8) | bytes[timeOffset],
        count: (bytes[countOffset + 2] << 16) | (bytes[countOffset + 1] << 8) | bytes[countOffset]
    };
}

function decodeCd10(bytes, v4Format) {
    const status = bytes[0];
    const co2Offset = v4Format ? 5 : 4;

    return {
        battery_volt: readBatteryVolts(bytes[1]),
        temperature: readTemp(bytes, 2, v4Format),
        humi: bytes[v4Format ? 4 : 3],
        trigger: status & 0x01 ? 1 : 0,
        button: status & 0x02 ? 1 : 0,
        co2threshold: status & 0x10 ? 1 : 0,
        co2calibration: status & 0x20 ? 1 : 0,
        co2_ppm: Math.min(40000, (bytes[co2Offset + 1] << 8) | bytes[co2Offset])
    };
}

function decodeDw10(bytes, v4Format) {
    const status = bytes[0];
    const timeOffset = v4Format ? 5 : 4;
    const countOffset = v4Format ? 7 : 6;

    return {
        battery_volt: readBatteryVolts(bytes[1]),
        temperature: readTemp(bytes, 2, v4Format),
        humi: bytes[v4Format ? 4 : 3],
        open: status & 0x01 ? 1 : 0,
        button: status & 0x02 ? 1 : 0,
        tamper: status & 0x04 ? 1 : 0,
        tilt: status & 0x08 ? 1 : 0,
        time: (bytes[timeOffset + 1] << 8) | bytes[timeOffset],
        count: (bytes[countOffset + 2] << 16) | (bytes[countOffset + 1] << 8) | bytes[countOffset]
    };
}

function decodeWl10(bytes, v4Format) {
    const status = bytes[0];

    return {
        battery_volt: readBatteryVolts(bytes[1]),
        temperature: readTemp(bytes, 2, v4Format),
        humi: bytes[v4Format ? 4 : 3],
        water: status & 0x01 ? 1 : 0,
        button: status & 0x02 ? 1 : 0,
        tamper: status & 0x04 ? 1 : 0
    };
}

function decodeDevicePayload(input) {
    const bytes = input.bytes || [];
    const fPort = input.fPort;

    if (fPort === 122 && (bytes.length === 9 || bytes.length === 10)) {
        return decodeMs10(bytes, bytes.length === 10);
    }
    if (fPort === 127 && (bytes.length === 6 || bytes.length === 7)) {
        return decodeCd10(bytes, bytes.length === 7);
    }
    if (fPort === 120 && (bytes.length === 9 || bytes.length === 10)) {
        return decodeDw10(bytes, bytes.length === 10);
    }
    if (fPort === 126 && (bytes.length === 4 || bytes.length === 5)) {
        return decodeWl10(bytes, bytes.length === 5);
    }

    return null;
}

function decodeFport204(bytes) {
    if (bytes.length === 9) {
        return {
            HW_version: bytes.slice(1, 5).reverse().map((b) => b.toString(16).padStart(2, "0")).join(""),
            FW_version: bytes.slice(5, 9).reverse().map((b) => b.toString(16).padStart(2, "0")).join("")
        };
    }

    return null;
}

function decodeUplink(input) {
    const result = { data: {}, errors: [], warnings: [] };
    const bytes = input.bytes || [];

    const dataPayload = decodeDevicePayload(input);
    if (dataPayload) {
        result.data.fPort = input.fPort;
        result.data.byteLength = bytes.length;
        Object.assign(result.data, dataPayload);
        return result;
    }

    if (input.fPort === 204) {
        const info = decodeFport204(bytes);
        if (info) {
            result.data.fPort = input.fPort;
            result.data.byteLength = bytes.length;
            Object.assign(result.data, info);
            return result;
        }
    }

    result.errors.push("Invalid fPort or payload length");
    return result;
}

exports.decodeUplink = decodeUplink;
