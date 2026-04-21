function readU16BE(bytes, index) {
    return (bytes[index] << 8) | bytes[index + 1];
}

function readU32BE(bytes, index) {
    return (
        (bytes[index] << 24) |
        (bytes[index + 1] << 16) |
        (bytes[index + 2] << 8) |
        bytes[index + 3]
    ) >>> 0;
}

function readFloatBE(bytes, index) {
    var arr = new Uint8Array(4);
    arr[0] = bytes[index];
    arr[1] = bytes[index + 1];
    arr[2] = bytes[index + 2];
    arr[3] = bytes[index + 3];
    return new DataView(arr.buffer).getFloat32(0, false);
}

function toPercentOfSpan(raw) {
    return Number((((raw - 2500) * 0.01)).toFixed(2));
}

function percentToPhysical(percentOfSpan, min, max) {
    var span = max - min;
    return Number((min + (percentOfSpan / 100) * span).toFixed(2));
}

function parseProcessAlarmType(alarmType) {
    var map = {
        0: "lowThreshold",
        1: "highThreshold",
        2: "fallingSlope",
        3: "risingSlope",
        4: "lowThresholdWithDelay",
        5: "highThresholdWithDelay"
    };
    return map[alarmType] || "reserved";
}

function decodeDataMessage(bytes, data, warnings) {
    var values = [];
    var offset;

    if (bytes.length !== 5 && bytes.length !== 7) {
        warnings.push("Unexpected data message length for type 0x01/0x02");
    }

    for (offset = 3; offset + 1 < bytes.length; offset += 2) {
        var raw = readU16BE(bytes, offset);
        values.push({
            raw: raw,
            percentOfSpan: raw === 0xffff ? null : toPercentOfSpan(raw),
            isValid: raw !== 0xffff
        });
    }

    var measurements = {};

    if (values.length === 2) {
        measurements.channel0 = values[0];
        measurements.channel1 = values[1];

        if (values[1].isValid) {
            measurements.channel1.temperatureC = percentToPhysical(values[1].percentOfSpan, -40, 60);
        }
    } else if (values.length === 1) {
        measurements.single = values[0];
        measurements.channelHint = "unknown";
        warnings.push("Single channel payload cannot identify if value is channel 0 or channel 1 without external config context");
    }

    data.messageType = bytes[0] === 0x01 ? "dataNoAlarm" : "dataWithAlarm";
    data.configId = bytes[1];
    data.reserved = bytes[2];
    data.measurements = measurements;
}

function decodeProcessAlarmMessage(bytes, data, warnings) {
    var alarms = [];
    var offset;

    if ((bytes.length - 3) % 3 !== 0) {
        warnings.push("Unexpected process alarm message length");
    }

    for (offset = 3; offset + 2 < bytes.length; offset += 3) {
        var typeByte = bytes[offset];
        var related = readU16BE(bytes, offset + 1);
        var alarmTypeCode = typeByte & 0x07;
        var isSlope = alarmTypeCode === 2 || alarmTypeCode === 3;

        alarms.push({
            sense: ((typeByte >> 7) & 0x01) === 0 ? "triggered" : "disappeared",
            channelId: (typeByte >> 3) & 0x0f,
            alarmType: parseProcessAlarmType(alarmTypeCode),
            relatedRaw: related,
            relatedValue: isSlope ? Number((related / 100).toFixed(2)) : Number(((related - 2500) / 100).toFixed(2)),
            relatedUnit: isSlope ? "%Span/min" : "%Span"
        });
    }

    data.messageType = "processAlarm";
    data.configId = bytes[1];
    data.reserved = bytes[2];
    data.processAlarms = alarms;
}

function decodeTechnicalAlarmMessage(bytes, data, warnings) {
    var alarms = [];
    var offset;

    if ((bytes.length - 3) % 3 !== 0) {
        warnings.push("Unexpected technical alarm message length");
    }

    for (offset = 3; offset + 2 < bytes.length; offset += 3) {
        var alarmCode = bytes[offset];
        var related = readU16BE(bytes, offset + 1);
        var alarm = {
            alarmCode: alarmCode,
            relatedRaw: related
        };

        if (alarmCode === 0 || alarmCode === 1) {
            var mvStat = related & 0xff;
            alarm.channelId = alarmCode;
            alarm.alarmType = "mvStat";
            alarm.mvStat = {
                warning: ((mvStat >> 1) & 0x01) === 1,
                error: (mvStat & 0x01) === 1
            };
        } else if (alarmCode === 4) {
            var statDev = related & 0xff;
            alarm.alarmType = "statDev";
            alarm.statDev = {
                restarted: ((statDev >> 2) & 0x01) === 1,
                warning: ((statDev >> 1) & 0x01) === 1,
                error: (statDev & 0x01) === 1
            };
        } else {
            alarm.alarmType = "unknown";
        }

        alarms.push(alarm);
    }

    data.messageType = "technicalAlarm";
    data.configId = bytes[1];
    data.reserved = bytes[2];
    data.technicalAlarms = alarms;
}

function decodeRadioUnitAlarmMessage(bytes, data) {
    var status = readU16BE(bytes, 2);

    data.messageType = "radioUnitAlarm";
    data.configId = bytes[1];
    data.radioAlarms = {
        uartCommunicationError: ((status >> 8) & 0x01) === 1,
        dutyCycleExceeded: ((status >> 2) & 0x01) === 1,
        temperatureOutOfRange: ((status >> 1) & 0x01) === 1,
        lowBattery: (status & 0x01) === 1
    };
}

function decodeIdentificationMessage(bytes, data, warnings) {
    if (bytes.length < 26) {
        warnings.push("Identification message is shorter than expected");
    }

    data.messageType = "identification";
    data.configId = bytes[1];
    data.wirelessProductId = bytes[2];
    data.wirelessProductSubId = bytes[3];
    data.instrumentTypeId = readU16BE(bytes, 4);

    data.channel0 = {
        measurandId: bytes[6],
        minRange: readFloatBE(bytes, 7),
        maxRange: readFloatBE(bytes, 11),
        unitId: bytes[15]
    };

    data.channel1 = {
        measurandId: bytes[16],
        minRange: readFloatBE(bytes, 17),
        maxRange: readFloatBE(bytes, 21),
        unitId: bytes[25]
    };
}

function decodeKeepAliveMessage(bytes, data) {
    data.messageType = "keepAlive";
    data.configId = bytes[1];
    data.numberOfMeasurements = readU32BE(bytes, 2);
    data.numberOfTransmissions = readU32BE(bytes, 6);
}

function decodeUplink(input) {
    var bytes = input.bytes;
    var fPort = input.fPort;
    var data = {};
    var errors = [];
    var warnings = [];

    if (!Array.isArray(bytes) || bytes.length === 0) {
        return {
            data: {},
            errors: ["Empty payload"],
            warnings: []
        };
    }

    if (fPort !== 10) {
        warnings.push("Expected LoRaWAN fPort 10 for PGU2x.100 uplinks");
    }

    switch (bytes[0]) {
        case 0x01:
        case 0x02:
            decodeDataMessage(bytes, data, warnings);
            break;
        case 0x03:
            decodeProcessAlarmMessage(bytes, data, warnings);
            break;
        case 0x04:
            decodeTechnicalAlarmMessage(bytes, data, warnings);
            break;
        case 0x05:
            decodeRadioUnitAlarmMessage(bytes, data);
            break;
        case 0x07:
            decodeIdentificationMessage(bytes, data, warnings);
            break;
        case 0x08:
            decodeKeepAliveMessage(bytes, data);
            break;
        default:
            data.messageType = "unknown";
            data.rawHex = bytes.map(function (b) {
                return b.toString(16).padStart(2, "0");
            }).join("");
            warnings.push("Unsupported upstream message type");
    }

    return {
        data: data,
        errors: errors,
        warnings: warnings
    };
}

function encodeDownlink(input) {
    if (!input || !input.data) {
        return {
            errors: ["Missing input.data"],
            warnings: []
        };
    }

    if (Array.isArray(input.data.bytes)) {
        return {
            fPort: input.fPort || 10,
            bytes: input.data.bytes,
            warnings: [],
            errors: []
        };
    }

    return {
        errors: ["Provide downlink payload as input.data.bytes"],
        warnings: ["No command builder implemented for this driver"]
    };
}

exports.decodeUplink = decodeUplink;
exports.encodeDownlink = encodeDownlink;
