function decodeUplink(input) {
    const bytes = input.bytes || [];

    if (!bytes.length) {
        return { data: {}, errors: [], warnings: [] };
    }

    const productType = (bytes[0] >> 4) & 0x0f;
    const messageType = bytes[0] & 0x0f;

    if (productType !== 0x06) {
        return { data: {}, errors: ["Unsupported product type"], warnings: [] };
    }

    const data = {
        typeOfProduct: "Insafe+ Pilot LoRa",
        typeOfMessage: messageLabel(messageType)
    };

    switch (messageType) {
        case 0x00:
            decodeProductStatus(bytes, data);
            break;
        case 0x01:
            decodeRealTime(bytes, data);
            break;
        case 0x02:
            decodeDatalog(bytes, data);
            break;
        case 0x03:
            decodeConfiguration(bytes, data);
            break;
        case 0x04:
            decodeButton(bytes, data);
            break;
        case 0x05:
            decodeTemperatureAlert(bytes, data);
            break;
        case 0x06:
            break;
        default:
                return { data: {}, errors: ["Unsupported message type"], warnings: [] };
    }

            return { data, errors: [], warnings: [] };
}

function messageLabel(type) {
    const labels = {
        0x00: "Product Status",
        0x01: "Real Time Data",
        0x02: "Datalog Data",
        0x03: "Product General Configuration",
        0x04: "Button Press",
        0x05: "Temperature Alert",
        0x06: "Keepalive"
    };

    return labels[type] || "Unknown";
}

function decodeProductStatus(bytes, data) {
    if (bytes.length < 2) {
        return;
    }

    const b1 = bytes[1];

    data.energyStatus = ["High", "Medium", "Low", "Critical"][(b1 >> 6) & 0x03];
    data.productHwStatus = ((b1 >> 5) & 0x01) ? "HW fault detected" : "HW working correctly";
    data.frameIndex = (b1 >> 2) & 0x07;
    data.pendingJoin = ((b1 >> 1) & 0x01) ? "Join request scheduled" : "No join request scheduled";
}

function decodeRealTime(bytes, data) {
    if (bytes.length < 6) {
        return;
    }

    const b3 = bytes[3];
    const b4 = bytes[4];
    const b5 = bytes[5];

    data.temperature = decodeLinearTemperature(bytes[1]);
    data.humidity = decodeLinearHumidity(bytes[2]);

    data.iaqGlobal = iaqLabel((b3 >> 5) & 0x07);
    data.iaqSource = iaqSourceLabel((b3 >> 1) & 0x0f);
    data.iaqDry = iaqLabel(((b3 & 0x01) << 2) | ((b4 >> 6) & 0x03));
    data.iaqMould = iaqLabel((b4 >> 3) & 0x07);
    data.iaqDustMite = iaqLabel(b4 & 0x07);
    data.hygrothermalComfortIndex = hciLabel((b5 >> 6) & 0x03);
    data.frameIndex = (b5 >> 3) & 0x07;
}

function decodeDatalog(bytes, data) {
    if (bytes.length < 12) {
        return;
    }

    data.temperature = {
        unit: "Cel",
        value: [
            decodeLinearTemperature(bytes[1]).value,
            decodeLinearTemperature(bytes[3]).value,
            decodeLinearTemperature(bytes[5]).value,
            decodeLinearTemperature(bytes[7]).value,
            decodeLinearTemperature(bytes[9]).value
        ]
    };

    data.humidity = {
        unit: "%RH",
        value: [
            decodeLinearHumidity(bytes[2]).value,
            decodeLinearHumidity(bytes[4]).value,
            decodeLinearHumidity(bytes[6]).value,
            decodeLinearHumidity(bytes[8]).value,
            decodeLinearHumidity(bytes[10]).value
        ]
    };

    data.timeBetweenMeasurements = {
        unit: "minute",
        value: ((bytes[11] >> 4) & 0x0f) * 10
    };
    data.frameIndex = (bytes[11] >> 1) & 0x07;
}

function decodeConfiguration(bytes, data) {
    if (bytes.length < 11) {
        return;
    }

    const b1 = bytes[1];
    const b10 = bytes[10];

    data.ledBlinkEnable = bitStatus((b1 >> 7) & 0x01);
    data.buttonNotificationEnable = bitStatus((b1 >> 6) & 0x01);
    data.realTimeDataEnable = bitStatus((b1 >> 5) & 0x01);
    data.datalogEnable = bitStatus((b1 >> 4) & 0x01);
    data.temperatureAlertEnable = bitStatus((b1 >> 3) & 0x01);
    data.keepaliveEnable = bitStatus((b1 >> 2) & 0x01);

    data.measurementPeriod = { unit: "minute", value: bytes[2] };
    data.datalogDecimation = bytes[3];
    data.temperatureAlertThreshold1 = decodeLinearTemperature(bytes[4]);
    data.temperatureAlertThreshold2 = decodeLinearTemperature(bytes[5]);
    data.deltaTemperature = decodeDeltaTemperature(bytes[6]);
    data.deltaHumidity = decodeDeltaHumidity(bytes[7]);
    data.keepalivePeriod = { unit: "hour", value: bytes[8] };
    data.softwareVersion = toVersion(bytes[9]);
    data.nfcStatus = ["Discoverable", "Not discoverable", "Reserved", "Reserved"][(b10 >> 6) & 0x03];
    data.realTimeSendingPeriod = { unit: "minute", value: (b10 & 0x3f) * 10 };
}

function decodeButton(bytes, data) {
    if (bytes.length < 2) {
        return;
    }

    const b1 = bytes[1];
    data.buttonPress = ((b1 >> 5) & 0x07) === 0 ? "Short press" : "Reserved";
    data.frameIndex = (b1 >> 2) & 0x07;
}

function decodeTemperatureAlert(bytes, data) {
    if (bytes.length < 3) {
        return;
    }

    const b2 = bytes[2];
    data.temperature = decodeLinearTemperature(bytes[1]);
    data.threshold1Reached = ((b2 >> 7) & 0x01) === 1;
    data.threshold2Reached = ((b2 >> 6) & 0x01) === 1;
    data.frameIndex = (b2 >> 3) & 0x07;
}

function decodeLinearTemperature(raw) {
    if (raw === 0xff) {
        return "Error";
    }

    return { unit: "Cel", value: Number((raw * 0.2).toFixed(1)) };
}

function decodeLinearHumidity(raw) {
    if (raw === 0xff) {
        return "Error";
    }

    return { unit: "%RH", value: Number((raw * 0.5).toFixed(1)) };
}

function decodeDeltaTemperature(raw) {
    if (raw === 0xff) {
        return "Error";
    }

    return { unit: "Cel", value: Number((raw * 0.1).toFixed(1)) };
}

function decodeDeltaHumidity(raw) {
    if (raw === 0xff) {
        return "Error";
    }

    return { unit: "%RH", value: Number((raw * 0.5).toFixed(1)) };
}

function bitStatus(bit) {
    return bit === 1 ? "Active" : "Non-Active";
}

function toVersion(raw) {
    return `${Math.floor(raw / 10)}.${raw % 10}`;
}

function iaqLabel(index) {
    const labels = ["Excellent", "Good", "Fair", "Poor", "Bad", "Reserved", "Reserved", "Error"];
    return labels[index] || "Error";
}

function iaqSourceLabel(index) {
    const labels = [
        "All",
        "Drought Index",
        "Mold Index",
        "Mite Index",
        "CO",
        "CO2",
        "VOC",
        "Formaldehyde",
        "PM1.0",
        "PM2.5",
        "PM10",
        "Reserved",
        "Reserved",
        "Reserved",
        "Reserved",
        "Error"
    ];

    return labels[index] || "Error";
}

function hciLabel(index) {
    const labels = ["Good", "Fair", "Poor", "Error"];
    return labels[index] || "Error";
}

exports.decodeUplink = decodeUplink;
