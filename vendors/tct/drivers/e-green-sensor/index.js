// TCT e-green sensor (also sold by ATIM as ACW/LW8-CTS and ACW/LW8-CS).
//
// Based on TCT's own decoder (https://github.com/TCT-IoT/E-green-decoders) and
// completed from the TCT user guide V1.2, chapter VIII "Lora frames":
// - history depth (header bits 4-3) on top of the number of samples (bits 2-0),
// - measurement alert frames (0x0D),
// - error frames (0x0E), configuration acknowledgments (0x06) and the other
//   classic frame types.
// All multi-byte values are big endian.

var MEASUREMENTS = {
    0x08: { name: "temperature", size: 2, signed: true, divider: 100 }, // °C
    0x0a: { name: "voltage", size: 2, signed: false, divider: 1000 }, // V, supercapacitor
    0x0b: { name: "current", size: 2, signed: false, divider: 100 } // A
};

var CLASSIC_FRAMES = {
    0x01: "lifeFrame",
    0x02: "networkTestDownlinkRequest",
    0x05: "testFrame",
    0x06: "configurationAck",
    0x07: "commandAck",
    0x08: "errorAck",
    0x0d: "alert",
    0x0e: "error",
    0x0f: "subFrame"
};

var ALERT_TYPES = {
    0: "returnBetweenThresholds",
    1: "highThresholdExceeded",
    2: "lowThresholdExceeded",
    3: "reserved"
};

var ERROR_CODES = {
    0x81: { code: "ERR_UNKNOWN", description: "Unknown error." },
    0x82: { code: "ERR_BUF_SMALLER", description: "The data table is full, impossible to add further data." },
    0x83: { code: "ERR_DEPTH_HISTORIC_OUT_OF_RANGE", description: "The history depth is too large or too small for the frame." },
    0x84: { code: "ERR_NB_SAMPLE_OUT_OF_RANGE", description: "The number of samples is too large or too small for the frame." },
    0x85: { code: "ERR_NWAY_OUT_OF_RANGE", description: "The number of channels in the frame header is too large or too small." },
    0x86: { code: "ERR_TYPEWAY_OUT_OF_RANGE", description: "The measurement type in the frame header is too large or too small." },
    0x87: { code: "ERR_SAMPLING_PERIOD", description: "Wrong structure of sampling time." },
    0x88: { code: "ERR_SUBTASK_END", description: "End of a subtask after exiting an infinite loop." },
    0x89: { code: "ERR_NULL_POINTER", description: "Pointer with value NULL." },
    0x8b: { code: "ERR_EEPROM", description: "EEPROM is corrupted." },
    0x8c: { code: "ERR_ROM", description: "ROM is corrupted." },
    0x8d: { code: "ERR_RAM", description: "RAM is corrupted." },
    0x8e: { code: "ERR_ARM_INIT_FAIL", description: "The radio module startup failed." },
    0x8f: { code: "ERR_ARM_BUSY", description: "The module is already busy (possibly not initialized)." },
    0x90: { code: "ERR_ARM_BRIDGE_ENABLE", description: "The module is in bridge mode, impossible to send the data through radio." },
    0x91: { code: "ERR_RADIO_QUEUE_FULL", description: "The radio buffer is full." },
    0x92: { code: "ERR_CFG_BOX_INIT_FAIL", description: "Error during the black box initialization." },
    0x96: { code: "ERR_ARM_TRANSMISSION", description: "A transmission has been initialized but an error occurred." },
    0x97: { code: "ERR_ARM_PAYLOAD_BIGGER", description: "The message size is too big for the network capacity." },
    0x98: { code: "ERR_RADIO_PAIRING_TIMEOUT", description: "Impossible to connect to a network before the given time." }
};

function toHex(bytes) {
    var hex = "";
    for (var i = 0; i < bytes.length; i++) {
        hex += (bytes[i] < 16 ? "0" : "") + bytes[i].toString(16);
    }
    return hex;
}

function readValue(bytes, index, measurement) {
    var raw = (bytes[index] << 8) | bytes[index + 1];
    if (measurement.signed && (raw & 0x8000)) {
        raw -= 0x10000;
    }
    return Math.round(raw * 1000 / measurement.divider) / 1000;
}

function channelKey(name, channel) {
    return channel === 0 ? name : name + "Channel" + channel;
}

function decodeMeasurementFrame(header, bytes, index, data, referenceTime) {
    var historyDepth = ((header >> 3) & 0x03) + 1;
    var numberOfSamples = (header & 0x07) + 1;
    var valuesPerChannel = historyDepth * numberOfSamples;

    data.frameType = "measurement";
    data.historyDepth = historyDepth;
    data.numberOfSamples = numberOfSamples;

    if (valuesPerChannel > 1) {
        if (index + 2 > bytes.length) {
            throw new Error("Payload too short to read the transmission period");
        }
        // Transmission period of a frame, in minutes
        data.transmissionPeriod = (bytes[index] << 8) | bytes[index + 1];
        index += 2;
    }

    if (index >= bytes.length) {
        throw new Error("Measurement frame without any channel");
    }

    while (index < bytes.length) {
        var channelHeader = bytes[index++];
        var channel = (channelHeader >> 4) & 0x03;
        var measurement = MEASUREMENTS[channelHeader & 0x0f];
        if (!measurement) {
            throw new Error("Unknown measurement type: 0x" + (channelHeader & 0x0f).toString(16));
        }
        if (index + measurement.size * valuesPerChannel > bytes.length) {
            throw new Error("Payload truncated: not enough data for " + measurement.name);
        }
        var values = [];
        for (var i = 0; i < valuesPerChannel; i++) {
            values.push(readValue(bytes, index, measurement));
            index += measurement.size;
        }
        data[channelKey(measurement.name, channel)] = valuesPerChannel === 1 ? values[0] : values;
    }

    // Samples are ordered from newest to oldest, one every
    // transmissionPeriod / numberOfSamples minutes.
    if (valuesPerChannel > 1 && referenceTime !== null) {
        var stepMs = data.transmissionPeriod * 60000 / numberOfSamples;
        data.sampleTimes = [];
        for (var s = 0; s < valuesPerChannel; s++) {
            data.sampleTimes.push(new Date(referenceTime - s * stepMs).toISOString());
        }
    }
}

function decodeAlertFrame(bytes, index, data) {
    data.alerts = [];
    if (index >= bytes.length) {
        throw new Error("Alert frame without any channel");
    }
    while (index < bytes.length) {
        var channelHeader = bytes[index++];
        var channel = (channelHeader >> 4) & 0x03;
        var measurement = MEASUREMENTS[channelHeader & 0x0f];
        if (!measurement) {
            throw new Error("Unknown measurement type: 0x" + (channelHeader & 0x0f).toString(16));
        }
        if (index + measurement.size > bytes.length) {
            throw new Error("Payload truncated: not enough data for " + measurement.name);
        }
        var value = readValue(bytes, index, measurement);
        index += measurement.size;
        data.alerts.push({
            channel: channel,
            measurement: measurement.name,
            alertType: ALERT_TYPES[(channelHeader >> 6) & 0x03],
            value: value
        });
        data[channelKey(measurement.name, channel)] = value;
    }
}

function decodeErrorFrame(bytes, index, data) {
    data.deviceErrors = [];
    if (index >= bytes.length) {
        throw new Error("Error frame without any error message");
    }
    while (index < bytes.length) {
        var messageHeader = bytes[index++];
        // The length is the size of the error message, error code included.
        var length = messageHeader & 0x1f;
        if (length < 1) {
            length = 1;
        }
        if (index + length > bytes.length) {
            throw new Error("Payload truncated: not enough data for the error message");
        }
        var errorCode = bytes[index];
        var known = ERROR_CODES[errorCode];
        var deviceError = {
            index: (messageHeader >> 5) & 0x07,
            errorCode: known ? known.code : "UNKNOWN_ERROR_0x" + errorCode.toString(16),
            description: known ? known.description : "Unrecognized error code."
        };
        if (length > 1) {
            deviceError.data = toHex(bytes.slice(index + 1, index + length));
        }
        data.deviceErrors.push(deviceError);
        index += length;
    }
}

function decodeConfigurationAck(bytes, index, data) {
    if (index + 1 > bytes.length) {
        throw new Error("Payload too short to read the configuration acknowledgment");
    }
    var ack = bytes[index];
    // Bit n is the acknowledgment of parameter n: 0 when applied, 1 when rejected.
    data.failedParameters = [];
    for (var bit = 0; bit < 8; bit++) {
        if (ack & (1 << bit)) {
            data.failedParameters.push(bit);
        }
    }
    data.configurationSuccess = data.failedParameters.length === 0;
}

function decodeUplink(input) {
    var result = { data: {}, errors: [], warnings: [] };
    var bytes = input.bytes;
    try {
        if (!bytes || bytes.length < 1) {
            throw new Error("Empty payload");
        }
        var data = result.data;
        var header = bytes[0];
        var index = 1;
        var referenceTime = null;
        if (input.recvTime) {
            var parsed = new Date(input.recvTime).getTime();
            if (!isNaN(parsed)) {
                referenceTime = parsed;
            }
        }

        if (header & 0x40) {
            if (bytes.length < 5) {
                throw new Error("Payload too short to read the timestamp");
            }
            var seconds = ((bytes[1] << 24) >>> 0) + (bytes[2] << 16) + (bytes[3] << 8) + bytes[4];
            data.timestamp = new Date(seconds * 1000).toISOString();
            referenceTime = seconds * 1000;
            index = 5;
        }

        if (header & 0x20) {
            decodeMeasurementFrame(header, bytes, index, data, referenceTime);
            return result;
        }

        var type = header & 0x0f;
        var frameType = CLASSIC_FRAMES[type];
        if (!frameType) {
            throw new Error("Reserved frame type: 0x" + type.toString(16));
        }
        data.frameType = frameType;
        switch (type) {
            case 0x06:
                decodeConfigurationAck(bytes, index, data);
                break;
            case 0x0d:
                decodeAlertFrame(bytes, index, data);
                break;
            case 0x0e:
                decodeErrorFrame(bytes, index, data);
                break;
            case 0x05:
                if (index + 1 > bytes.length) {
                    throw new Error("Payload too short to read the test frame counter");
                }
                data.counter = bytes[index];
                break;
            case 0x02:
                break;
            default:
                // Content not documented for the e-green sensor
                data.raw = toHex(bytes.slice(index));
        }
    } catch (e) {
        result.data = {};
        result.errors.push(e.message);
    }
    return result;
}

exports.decodeUplink = decodeUplink;
