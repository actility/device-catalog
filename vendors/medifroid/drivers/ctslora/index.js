/*
 * Medifroid CTS LORA decoder
 * Supports CTSLORA200, CTSLORA300, CTSLORA600 cold chain temperature loggers.
 *
 * LoRa Alliance Payload Codec API compliant.
 * https://resources.lora-alliance.org/document/ts013-1-0-0-payload-codec-api
 */

/**
 * @typedef {Object} DecodedUplink
 * @property {Object} data - The open JavaScript object representing the decoded uplink payload when no errors occurred
 * @property {string[]} errors - A list of error messages while decoding the uplink payload
 * @property {string[]} warnings - A list of warning messages that do not prevent the driver from decoding the uplink payload
 */

/**
 * Decode uplink
 * @param {Object} input - An object provided by the IoT Flow framework
 * @param {number[]} input.bytes - Array of bytes represented as numbers as it has been sent from the device
 * @param {number} input.fPort - The Port Field on which the uplink has been sent
 * @param {Date} input.recvTime - The uplink message time recorded by the LoRaWAN network server
 * @returns {DecodedUplink} The decoded object
 */
function decodeUplink(input) {
    const errors = [];
    const warnings = [];

    try {
        const payload = normalizePayload(input.bytes);

        // SYNC_ASKED (frameType 0x02): single byte, special early exit
        if (payload[0] === 0x02) {
            return { data: { header: { frameType: 2, message: "syncronisation asked" } }, errors, warnings };
        }

        const header = decodeHeader(payload);

        // Ensure valid payload length
        if (payload.length < 7) {
            errors.push("Payload is too short to decode.");
            return { data: {}, errors, warnings };
        }

        // Check protocol version
        if (header.protocolVersion !== 1 && !(header.protocolVersion === 15 && header.settingVersion === 15)) {
            errors.push("Unsupported protocol version: " + header.protocolVersion);
            return { data: {}, errors, warnings };
        }

        switch (header.frameType) {
            case LoraFrameType.TYPE_SYNCHRONISATION: {
                const deviceInfo = decodeSyncFrame(payload, header);
                return { data: { header, deviceInfo }, errors, warnings };
            }
            case LoraFrameType.TYPE_NEW_DATAS:
            case LoraFrameType.TYPE_ECHEC_DATAS: {
                const frame = decodeData(payload, header);
                return { data: frame, errors, warnings };
            }
            case LoraFrameType.TYPE_INFOS_CAMPAGNE: {
                const campaignState = decodeCampaignInfo(payload, header);
                return { data: { header, campaignState }, errors, warnings };
            }
            default:
                warnings.push("Unknown frame type: " + header.frameType);
                return { data: { header }, errors, warnings };
        }
    } catch (err) {
        errors.push(err.message);
        return { data: {}, errors, warnings };
    }
}

function normalizePayload(bytes) {
    if (Array.isArray(bytes)) {
        return Buffer.from(bytes);
    }
    if (typeof bytes === "string") {
        return Buffer.from(bytes, "hex");
    }
    throw new Error("Unsupported bytes format. Expected byte array or hex string.");
}

function decodeHeader(payload) {
    let offset = 0;
    const frameType = payload.readUInt8(offset++);
    const batteryChannel = payload.readUInt8(offset++);
    const battery = batteryChannel & 0x0F;
    const channelCount = (batteryChannel >> 4);
    const versions = payload.readUInt8(offset++);
    const settingVersion = versions & 0x0F;
    const protocolVersion = (versions >> 4);
    const date = payload.readUInt32BE(offset);
    return { frameType, battery, channelCount, protocolVersion, settingVersion, date };
}

function decodeSyncFrame(payload, header) {
    let offset = 7; // HEADER_SIZE
    let version = "0.0";
    let build = 0;
    if (payload.length >= offset + 6) {
        version = payload.readFloatBE(offset).toFixed(2);
        build = payload.readInt16BE(offset + 4);
    }
    return { date: header.date, version: version + " B" + build };
}

function decodeData(payload, header) {
    let offset = 7; // HEADER_SIZE
    const alarms = Array.from(payload.slice(offset, offset + 5));
    offset += 5;

    const channels = Array(header.channelCount).fill(null).map(function() { return { measures: [] }; });
    let completeData = true;
    let measureCount = 0;

    while (offset < payload.length) {
        if (offset + header.channelCount * 2 > payload.length) {
            completeData = false;
            break;
        }
        for (let i = 0; i < header.channelCount; i++) {
            const value = decodeFloat16(payload.readUInt16BE(offset));
            channels[i].measures.push({ value: value });
            offset += 2;
        }
        measureCount++;
    }

    return { header, channels, alarms, completeData, measureCount };
}

function decodeCampaignInfo(payload, header) {
    const offset = 7; // HEADER_SIZE
    return payload.readInt8(offset);
}

function decodeFloat16(binary) {
    const exponent = (binary & 0x7C00) >> 10;
    const fraction = binary & 0x03FF;
    const sign = (binary & 0x8000) ? -1 : 1;
    if (exponent === 0) {
        return sign * 6.103515625e-5 * (fraction / 0x400);
    } else if (exponent === 0x1F) {
        return fraction ? NaN : sign * Infinity;
    }
    return sign * (Math.pow(2, exponent - 15)) * (1 + fraction / 0x400);
}

const LoraFrameType = {
    TYPE_SYNCHRONISATION: 0x01,
    TYPE_SYNC_ASKED: 0x02,
    TYPE_NEW_DATAS: 0x03,
    TYPE_ECHEC_DATAS: 0x04,
    TYPE_INFOS_CAMPAGNE: 0x05,
};

/**
 * @typedef {Object} EncodedDownlink
 * @property {number[]} bytes - Array of bytes represented as numbers as it will be sent to the device
 * @property {number} fPort - The Port Field on which the downlink must be sent
 * @property {string[]} errors - A list of error messages while encoding the downlink object
 * @property {string[]} warnings - A list of warning messages that do not prevent the driver from encoding the downlink object
 */

/**
 * Downlink encode
 * @param {Object} input - An object provided by the IoT Flow framework
 * @param {Object} input.data - The higher-level object representing your downlink
 * @returns {EncodedDownlink} The encoded object
 */
function encodeDownlink(input) {
    return { bytes: [], fPort: 1, errors: [], warnings: [] };
}

/**
 * @typedef {Object} DecodedDownlink
 * @property {Object} data - The open JavaScript object representing the decoded downlink payload when no errors occurred
 * @property {string[]} errors - A list of error messages while decoding the downlink payload
 * @property {string[]} warnings - A list of warning messages that do not prevent the driver from decoding the downlink payload
 */

/**
 * Downlink decode
 * @param {Object} input - An object provided by the IoT Flow framework
 * @param {number[]} input.bytes - Array of bytes represented as numbers as it will be sent to the device
 * @param {number} input.fPort - The Port Field on which the downlink must be sent
 * @param {Date} input.recvTime - The uplink message time computed by the IoT Flow framework
 * @returns {DecodedDownlink} The decoded object
 */
function decodeDownlink(input) {
    return { data: {}, errors: [], warnings: [] };
}

exports.decodeUplink = decodeUplink;
exports.encodeDownlink = encodeDownlink;
exports.decodeDownlink = decodeDownlink;
