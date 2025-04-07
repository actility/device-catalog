
// -----------------------------------------------------------------------------
// Internal store for telemetry metadata (keyed by telemetryId).
// -----------------------------------------------------------------------------
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

function decodeMetadataPayload(telemetryPayload) {
    const errors = [];
    let offset = 0;
    while (offset + 8 <= telemetryPayload.length) {
        const block = telemetryPayload.slice(offset, offset + 8);
        // Byte 0: bit 7 must be 1 (metadata indicator).
        const payloadType = (block[0] & 0x80) >> 7;
        if (payloadType !== 1) break;
        // Bits 6-4: Telemetry ID; Bits 2-0: cyclic version.
        const telemetryId = (block[0] >> 4) & 0x07;
        const cyclicVersion = block[0] & 0x07;

        // Byte 1: Bits 4-3: fixed time interval; Bits 2-0: number of measurements.
        const fixedTimeInterval = (block[1] >> 3) & 0x03;
        const numMeasurements = block[1] & 0x07;

        // Bytes 2-3: TelemetryIDMaxInterval (units in 10-second increments).
        const telemetryIDMaxInterval = telemetryPayload.readUInt16BE(offset + 2);
        // Bytes 4-5: MeasurementNMaxInterval (seconds between recordings).
        const measurementNMaxInterval = telemetryPayload.readUInt16BE(offset + 4);

        const measurementConfigByte1 = block[6];
        const measurementConfigByte2 = block[7];
        const measurementId = (measurementConfigByte1 >> 6) & 0x03;
        let codingPolicy = (measurementConfigByte1 >> 2) & 0x03;
        let dataType = measurementConfigByte1 & 0x03;
        let recordingPolicy = (measurementConfigByte2 >> 5) & 0x07;
        let scalingFactor = (measurementConfigByte2 >> 1) & 0x07;
        scalingFactor = convert3BitToSigned(scalingFactor);
        let sampleCompression = measurementConfigByte2 & 0x01;      // 0: linear, 1: logarithmic.

        switch (dataType) {
            case 0:
                dataType = DataTypes._8_BIT_UNSIGNED
                break
            case 1:
                dataType = DataTypes._16_BIT_SIGNED
                break
            default:
                throw new Error(`Unsupported data type "${dataType}"`);
        }

        switch(codingPolicy){
            case 0:
                codingPolicy = CodingPolicy.NO_COMPRESSION
                break;
            case 1:
                codingPolicy = CodingPolicy.DELTA_COMPRESSION
                break;
            case 2:
                codingPolicy = CodingPolicy.HUFFMAN_COMPRESSION
                break;
            default:
                throw new Error(`Unsupported data codingPolicy "${codingPolicy}"`);
        }

        switch (recordingPolicy) {
            case 0:
                recordingPolicy = RecordingPolicy.INSTANT
                break;
            case 1:
                recordingPolicy = RecordingPolicy.MIN
                break;
            case 2:
                recordingPolicy = RecordingPolicy.MAX
                break;
            default:
                recordingPolicy = RecordingPolicy.CHANGE_OF_VALUE
        }
        if(sampleCompression === 0)
            sampleCompression = "LINEAR"
        else
            sampleCompression = "LOGARITHMIC"
        // Record the metadata for later timeseries decoding.
        telemetryMetadataStore[telemetryId] = {
            telemetryId,
            cyclicVersion,
            fixedTimeInterval,
            numMeasurements,
            telemetryIDMaxInterval,
            measurementNMaxInterval,
            measurementConfig: {
                measurementId,
                codingPolicy,
                dataType,
                recordingPolicy,
                scalingFactor,
                sampleCompression,
            },
        };
        offset += 8;
    }
    return { data: telemetryMetadataStore, errors: errors, warnings: [] };
}

/**
 * Decodes a timeseries payload.
 * Expects a telemetry payload (uplink header already removed) where:
 *   - Byte 0: Bits 7: payload type (should be 0), Bits 6-4: telemetry ID, Bit 0: alarm trigger.
 *   - Byte 1: Bits 7-5: cyclic version, Bits 4-0: cyclic counter.
 *   - Bytes 2+: Measurement data.
 */
function decodeTimeseriesPayload(telemetryPayload) {
    const errors = [];
    if (telemetryPayload.length < 2) {
        errors.push("Telemetry payload too short for timeseries decoding");
        return { errors };
    }
    // Byte 0.
    const byte0 = telemetryPayload[0];
    const telemetryId = (byte0 >> 4) & 0x07;
    const alarmTrigger = (byte0 & 0x01) === 1;
    // Byte 1.
    const byte1 = telemetryPayload[1];
    const cyclicVersion = (byte1 >> 5) & 0x07;
    const cyclicCounter = byte1 & 0x1F;
    const measurementData = telemetryPayload.slice(2);

    // Retrieve metadata for this telemetry ID.
    const metadata = telemetryMetadataStore[telemetryId];
    if (!metadata) {
        errors.push(`Missing metadata for telemetry ID ${telemetryId}`);
        return {
            telemetryId,
            alarmTrigger,
            cyclicVersion,
            cyclicCounter,
            rawMeasurements: Array.from(measurementData).toString(),
            measurements: [],
            errors
        };
    }
    if (cyclicVersion !== metadata.cyclicVersion) {
        errors.push(`Cyclic version mismatch for telemetry ID ${telemetryId}: payload version ${cyclicVersion} vs metadata version ${metadata.cyclicVersion}`);
    }

    let measurements = [];
    const { codingPolicy, dataType, scalingFactor } = metadata.measurementConfig;
    if (codingPolicy === 0) {
        // NO_COMPRESSION.
        if (dataType === 0) {
            // 8_BIT_UNSIGNED.
            for (let i = 0; i < measurementData.length; i++) {
                measurements.push(measurementData[i]);
            }
        } else if (dataType === 1) {
            // 16_BIT_SIGNED.
            for (let i = 0; i < measurementData.length; i += 2) {
                if (i + 1 < measurementData.length) {
                    measurements.push(measurementData.readInt16BE(i));
                }
            }
        }
    } else if (codingPolicy === 1) {
        // DELTA_COMPRESSION.
        if (dataType === 1) {
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
            for (let i = 0; i < measurementData.length; i++) {
                measurements.push(measurementData[i]);
            }
        }
    } else {
        measurements = Array.from(measurementData);
    }

    // Apply scaling: measurement = raw_value * 10^(scalingFactor)
    const factor = Math.pow(10, scalingFactor);
    const scaledMeasurements = measurements.map(m => m * factor);

    return {
        telemetryId,
        alarmTrigger,
        cyclicVersion,
        cyclicCounter,
        rawMeasurements: Array.from(measurementData).toString(),
        measurements: scaledMeasurements,
        errors
    };
}
// -----------------------------------------------------------------------------
// Main exported function
// -----------------------------------------------------------------------------

function decodeTelemetry(payload) {
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
        return { TelemetryIDs: [result.data], errors: result.errors, warnings: [] };
    } else {
        const telemetryResult = decodeTimeseriesPayload(telemetryPayload);
        return {
            payload: payload.toString("hex"),
            telemetry: telemetryResult,
            errors: [],
            warnings: []
        };
    }
}

module.exports = {
    decodeTelemetry,
};
