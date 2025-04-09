let telemetryMetadataStore = {};

const CodingPolicy = Object.freeze({
    NO_COMPRESSION: "NO_COMPRESSION",
    DELTA_COMPRESSION: "DELTA_COMPRESSION",
    HUFFMAN_COMPRESSION: "HUFFMAN_COMPRESSION",
})

const DataTypes = Object.freeze({
    _8_BIT_UNSIGNED: "8_BIT_UNSIGNED",
    _16_BIT_SIGNED: "16_BIT_SIGNED"
})

const RecordingPolicy = Object.freeze({
    INSTANT: "INSTANT",
    MIN: "MIN",
    MAX: "MAX",
    CHANGE_OF_VALUE: "CHANGE_OF_VALUE"
});

function convert3BitToSigned(val) {
    return (val & 0x04) ? val - 8 : val;
}

function decodeMetadataPayload(telemetryPayload, context) {
    const errors = [];
    let offset = 0;
    while (offset + 8 <= telemetryPayload.length) {
        const block = telemetryPayload.slice(offset, offset + 8);
        const payloadType = (block[0] & 0x80) >> 7;
        if (payloadType !== 1) break;
        const telemetryId = (block[0] >> 4) & 0x07;
        const cyclicVersion = block[0] & 0x07;

        const fixedTimeInterval = (block[1] >> 3) & 0x03;
        const numMeasurements = block[1] & 0x07;

        const telemetryIDMaxInterval = telemetryPayload.readUInt16BE(offset + 2);
        const measurementNMaxInterval = telemetryPayload.readUInt16BE(offset + 4);

        const measurementConfigByte1 = block[6];
        const measurementConfigByte2 = block[7];

        const measurementConfig = decodeMeasurementConfigBytes(measurementConfigByte1, measurementConfigByte2);
        telemetryMetadataStore[telemetryId] = {
            telemetryId,
            cyclicVersion,
            fixedTimeInterval,
            numMeasurements,
            telemetryIDMaxInterval,
            measurementNMaxInterval,
            measurementConfig: measurementConfig,
        };
        offset += 8;
    }

    if(errors.length > 0) return { errors: errors, warnings: [] };
    context.push(telemetryMetadataStore);
    return { context: context, data: telemetryMetadataStore, errors: errors, warnings: [] };
}

function decodeMeasurementConfigBytes(byte1, byte2) {
    const measurementId = (byte1 >> 6) & 0x03;
    let codingPolicy = (byte1 >> 2) & 0x03;
    let dataType = byte1 & 0x03;
    let recordingPolicy = (byte2 >> 5) & 0x07;
    let scalingFactor = (byte2 >> 1) & 0x07;
    scalingFactor =  Math.pow(10, convert3BitToSigned(scalingFactor));
    let sampleCompression = byte2 & 0x01;

    switch (dataType) {
        case 0:
            dataType = DataTypes._8_BIT_UNSIGNED;
            break;
        case 1:
            dataType = DataTypes._16_BIT_SIGNED;
            break;
        default:
            throw new Error(`Unsupported data type "${dataType}"`);
    }

    switch (codingPolicy) {
        case 0:
            codingPolicy = CodingPolicy.NO_COMPRESSION;
            break;
        case 1:
            codingPolicy = CodingPolicy.DELTA_COMPRESSION;
            break;
        case 2:
            codingPolicy = CodingPolicy.HUFFMAN_COMPRESSION;
            break;
        default:
            throw new Error(`Unsupported coding policy "${codingPolicy}"`);
    }

    switch (recordingPolicy) {
        case 0:
            recordingPolicy = RecordingPolicy.INSTANT;
            break;
        case 1:
            recordingPolicy = RecordingPolicy.MIN;
            break;
        case 2:
            recordingPolicy = RecordingPolicy.MAX;
            break;
        default:
            recordingPolicy = RecordingPolicy.CHANGE_OF_VALUE;
    }

    sampleCompression = sampleCompression === 0 ? "LINEAR" : "LOGARITHMIC";

    return {
        measurementId,
        codingPolicy,
        dataType,
        recordingPolicy,
        scalingFactor,
        sampleCompression
    };
}

function decodeTimeseriesPayload(telemetryPayload, context) {
    const errors = [];

    if (telemetryPayload.length < 4) {
        errors.push("Telemetry payload too short for timeseries decoding");
        return { errors };
    }

    const byte0 = telemetryPayload[0];
    const telemetryId = (byte0 >> 4) & 0x07;
    const alarmTrigger = (byte0 & 0x01) === 1;

    const byte1 = telemetryPayload[1];
    const cyclicVersion = (byte1 >> 4) & 0x0F;
    const cyclicCounter = byte1 & 0x0F;

    const metadataHistory = context.shift();
    let metadata = Object.values(metadataHistory).find(t => t.telemetryId === telemetryId);

    if (!metadata || metadata.cyclicVersion !== cyclicVersion) {
        errors.push(`Missing or mismatched metadata for TelemetryID=${telemetryId}, CyclicVersion=${cyclicVersion}`);
        return { errors };
    }

    const { codingPolicy, dataType, scalingFactor } = metadata.measurementConfig;
    const measurementData = telemetryPayload.slice(2);
    let measurements = [];

    try {
        if (codingPolicy === CodingPolicy.NO_COMPRESSION) {
            if (dataType === DataTypes._8_BIT_UNSIGNED) {
                measurements = Array.from(measurementData);
            } else if (dataType === DataTypes._16_BIT_SIGNED) {
                for (let i = 0; i + 1 < measurementData.length; i += 2) {
                    measurements.push(measurementData.readInt16BE(i));
                }
            }
        } else if (codingPolicy === CodingPolicy.DELTA_COMPRESSION) {
            if (dataType === DataTypes._16_BIT_SIGNED) {
                if (measurementData.length < 2) {
                    errors.push("Insufficient data for delta compression absolute value");
                } else {
                    let absolute = measurementData.readInt16BE(0);
                    measurements.push(absolute);
                    for (let i = 2; i < measurementData.length; i++) {
                        const delta = measurementData.readInt8(i);
                        absolute += delta;
                        measurements.push(absolute);
                    }
                }
            } else {
                measurements = Array.from(measurementData);
            }
        } else {
            measurements = Array.from(measurementData);
        }
    } catch (e) {
        errors.push(`Failed decoding measurements: ${e.message}`);
    }

    const scaledMeasurements = measurements.map(m => parseFloat((m * scalingFactor).toFixed(2)));

    if (errors.length > 0) {
        return { errors: errors, warnings: [] };
    }
    return {
        telemetryId,
        alarmTrigger,
        cyclicVersion,
        cyclicCounter,
        measurements: scaledMeasurements,
        measurementConfig: metadata.measurementConfig,
    };
}

function decodeTelemetry(payload, context) {
    if (!(payload instanceof Buffer)) {
        try {
            payload = Buffer.from(payload, typeof payload === "string" ? "hex" : undefined);
        } catch (e) {
            return { errors: ["Invalid payload format"], warnings: [] };
        }
    }

    if (payload.length < 5) {
        return { errors: ["Payload too short"], warnings: [] };
    }

    const headerLength = 4;
    const telemetryPayload = payload.slice(headerLength);
    if (telemetryPayload.length < 1) {
        return { errors: ["No telemetry payload"], warnings: [] };
    }

    const payloadTypeByte = telemetryPayload[0];
    const isMetadata = (payloadTypeByte & 0x80) !== 0;
    if (isMetadata) {
        const result = decodeMetadataPayload(telemetryPayload, context);
        if (result.data === undefined) {
            return {
                errors: result.errors,
                warnings: result.warnings || []
            };
        }
        return {
            type: "metadata",
            TelemetryIDs: [result.data],
            context: result.context
        };
    } else {
        const telemetryResult = decodeTimeseriesPayload(telemetryPayload, context);
        if (telemetryResult.measurementConfig === undefined) {
            return {
                errors: telemetryResult.errors,
                warnings: telemetryResult.warnings || []
            };
        }

        return {
            type: "timeseries",
            timeseries: telemetryResult
        };
    }
}

module.exports = {
    decodeTelemetry,
};
