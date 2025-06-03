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

function decodeMetadataPayload(telemetryPayload) {
    let telemetryMetadataStore = [{}];
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
        telemetryMetadataStore[0][telemetryId] = {
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

    if (!context) {
        throw new Error("Context doesn't exist");
    }

    context.push(telemetryMetadataStore);

    return { data: telemetryMetadataStore, errors: [], warnings: [] };
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

function decodeTimeseriesPayload(telemetryPayload, timestamp) {
    if (telemetryPayload.length < 4) {
        throw new Error("Telemetry payload too short for timeseries decoding");
    }

    const byte0 = telemetryPayload[0];
    const telemetryId = (byte0 >> 4) & 0x07;
    const alarmTrigger = (byte0 & 0x01) === 1;

    const byte1 = telemetryPayload[1];
    const cyclicVersion = (byte1 >> 5) & 0x07;
    const cyclicCounter = byte1 & 0x1F;

    if (!context || context.length === 0) {
        throw new Error("Context is empty, cannot retrieve metadata history");
    }

    const metadataHistory = context[context.length - 1];

    if (!metadataHistory || Object.keys(metadataHistory).length === 0) {
        throw new Error("Metadata history is empty, cannot retrieve telemetry metadata");
    }

    let metadata = Object.values(metadataHistory).find(t => t.telemetryId === telemetryId);

    if (!metadata || metadata.cyclicVersion !== cyclicVersion) {
        throw new Error(`Missing or mismatched metadata for TelemetryID=${telemetryId}, CyclicVersion=${cyclicVersion}̀̀`);
    }


    const measurementNMaxInterval = metadata.measurementNMaxInterval;
    const { codingPolicy, dataType, scalingFactor } = metadata.measurementConfig;
    const measurementData = telemetryPayload.slice(2);
    let measurements = [];

    if (codingPolicy === CodingPolicy.DELTA_COMPRESSION && dataType === DataTypes._16_BIT_SIGNED) {
        const buffer = Buffer.from(measurementData);
        let i = buffer.length - 1;
        let result = [];
        let currentValue = 0;

        while (i >= 0) {
            const byte = buffer[i];
            const isDelta = ((byte >> 7) & 0x01) !== 0;

            if (!isDelta) {
                // Read a raw 16-bit signed value from two bytes (little endian)
                if (i < 1) {
                    throw new Error("Invalid buffer: not enough bytes for 16-bit value");
                    break;
                }
                const lsb = buffer[i - 1]; // least significant byte
                const msb = buffer[i]; /// most significant byte
                const raw = (msb << 8) | lsb;

                // Convert raw 16-bit to signed integer
                currentValue = raw >= 0x8000 ? raw - 0x10000 : raw;
                result.push(currentValue);

                i -= 2;  // consumed 2 bytes for the raw value
            } else {
                // Decode a compressed delta value in a single byte
                const signBit = (byte >> 6) & 0x01;
                const num = byte & 0x3F;

                // Compute signed delta: negative if signBit=1
                const delta = signBit ? (num - 64) : num;

                currentValue += delta;
                result.push(currentValue);

                i -= 1; // On a consommé 1 octet delta
            }
        }

        // Le résultat est construit à l’envers, on inverse pour ordre chronologique
        measurements = result.reverse();
    } else {
        throw new Error("Unsupported coding policy or data type for delta decoding");
    }

    const baseTime = new Date(timestamp);
    const scaledMeasurements = measurements.map((m, index) => {
        const secondsAgo = index * measurementNMaxInterval;
        return {
            timestamp: new Date(baseTime.getTime() - secondsAgo * 1000).toISOString(),
            value: parseFloat((m * scalingFactor).toFixed(2))
        };
    });

    return {
        type: "timeseries",
        telemetryId,
        alarmTrigger,
        cyclicVersion,
        cyclicCounter,
        measurements: scaledMeasurements,
        measurementConfig: metadata.measurementConfig,
    };


}


function decodeTelemetry(payload, timestamp) {
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
        const result = decodeMetadataPayload(telemetryPayload);
        if (result.data === undefined) {
            return {
                errors: result.errors,
                warnings: result.warnings || []
            };
        }
        return {
            type: "metadata",
            TelemetryIDs: result.data
        };
    } else {
        const telemetryResult = decodeTimeseriesPayload(telemetryPayload, timestamp);
        if (telemetryResult.measurementConfig === undefined) {
            return {
                errors: telemetryResult.errors,
                warnings: telemetryResult.warnings || []
            };
        }
        return telemetryResult
    }
}

module.exports = {
    decodeTelemetry,
};
