/**
 * QAA Payload Decoder for LoRaWAN Alliance format
 * Converts sensor data from binary payload to readable values
 */

// Sensor presence mapping
const SENSORS_PRESENCE = {
    0: "temperature_rh",
    1: "pm",
    2: "noise",
    3: "GAZ 1",
    4: "GAZ 2",
    5: "GAZ 3",
    6: "Batterie",
    7: "Réservé"
};

// Gas identification mapping
const GAS_IDENTIFICATION = {
    0: "pas_de_capteur",
    1: "nox",
    2: "no2",
    3: "o3",
    4: "h2s",
    5: "so2",
    6: "nh3",
};

// Decryption keys for first series
const DECRYPTION_KEYS = {
    'humidity': [48, 55],
    'temperature': [62, 71],
    'pm10': [72, 80],
    'pm25': [81, 89],
    'pm1': [90, 98],
    'pm10_status': [101, 101],
    'pm25_status': [102, 102],
    'pm1_status': [103, 103],
    'noise_average': [104, 113],
    'noise_peak': [114, 123],
    'gaz_1': [128, 143],
    'gaz_1_id': [144, 151],
    'gaz_2': [152, 167],
    'gaz_2_id': [168, 175],
    'gaz_3': [176, 191],
    'gaz_3_id': [192, 199]
};

// Decryption keys for second series
const DECRYPTION_KEYS_2 = {
    'humidity': [200, 207],
    'temperature': [214, 223],
    'pm10': [224, 232],
    'pm25': [233, 241],
    'pm1': [242, 250],
    'pm10_status': [253, 253],
    'pm25_status': [254, 254],
    'pm1_status': [255, 255],
    'noise_average': [256, 265],
    'noise_peak': [266, 275],
    'gaz_1': [280, 295],
    'gaz_1_id': [296, 303],
    'gaz_2': [304, 319],
    'gaz_2_id': [320, 327],
    'gaz_3': [328, 343],
    'gaz_3_id': [344, 351]
};

/**
 * Convert bytes to bit array string
 * @param {Uint8Array} bytes - Input bytes
 * @returns {string} - Binary string representation
 */
function bytesToBitArray(bytes) {
    return Array.from(bytes)
        .map(byte => byte.toString(2).padStart(8, '0'))
        .join('');
}

/**
 * Extract bits from binary string
 * @param {string} binaryString - Binary string
 * @param {number} start - Start bit position
 * @param {number} end - End bit position (inclusive)
 * @returns {number} - Extracted value as integer
 */
function extractBits(binaryString, start, end) {
    try {
        if (start < 0 || end >= binaryString.length || start > end) {
            throw new Error(`Invalid bit range: ${start}-${end} for string length ${binaryString.length}`);
        }

        const bitSegment = binaryString.slice(start, end + 1);
        return parseInt(bitSegment, 2) || 0;
    } catch (error) {
        // Error extracting bits - return 0 as fallback
        return 0;
    }
}

/**
 * Decode device information from first 6 bytes
 * @param {Uint8Array} data - Device info bytes
 * @returns {Object} - Decoded device information
 */
function decodeDeviceInfos(data) {
    try {
        if (data.length < 6) {
            throw new Error(`Insufficient data for device info: expected 6 bytes, got ${data.length}`);
        }

        const binaryPayload = bytesToBitArray(data);

        // 1. Sensor presence (bits 0-7)
        const presenceBits = binaryPayload.slice(0, 8).split('').reverse();
        const activesSensors = presenceBits
            .map((bit, index) => bit === '1' ? SENSORS_PRESENCE[index] : null)
            .filter(sensor => sensor !== null);

        // 2. Firmware versions (bits 8-23)
        const frmQaaWhole = extractBits(binaryPayload, 8, 11);
        const frmQaaTenth = extractBits(binaryPayload, 12, 15);
        const frmQaa = frmQaaWhole + frmQaaTenth / 10;

        const frmLoraWhole = extractBits(binaryPayload, 16, 19);
        const frmLoraTenth = extractBits(binaryPayload, 20, 23);
        const frmLora = frmLoraWhole + frmLoraTenth / 10;

        // 3. Emission transmissionInterval (bits 24-39)
        let transmissionInterval = extractBits(binaryPayload, 24, 39);
        if (transmissionInterval === 0 || transmissionInterval > 720) {
            transmissionInterval = 10; // Default value
        }

        // 4. Battery state (bits 40-47)
        const batteryState = extractBits(binaryPayload, 40, 47);

        return {
            capteurs_actifs: activesSensors,
            firmware_version: frmQaa,
            frm_lora: frmLora,
            transmission_interval: transmissionInterval,
            autonomy_percent: batteryState
        };
    } catch (error) {
        // Error decoding device info
        return {
            capteurs_actifs: [],
            firmware_version: 0,
            frm_lora: 0,
            transmission_interval: 10,
            autonomy_percent: 0,
            error: error.message
        };
    }
}

/**
 * Decode measurement series using decryption keys
 * @param {Uint8Array} seriesData - Raw series data
 * @param {Object} decryptionKeys - Decryption key mappings
 * @returns {Object} - Decoded measurement values
 */
function decodeMeasureSeries(seriesData, decryptionKeys) {
    try {
        const binaryString = bytesToBitArray(seriesData);
        const decodedValues = {};

        for (const [key, [start, end]] of Object.entries(decryptionKeys)) {
            try {
                const value = extractBits(binaryString, start, end);
                decodedValues[key] = value;
            } catch (error) {
                // Error decoding key
                decodedValues[key] = 0;
            }
        }

        return decodedValues;
    } catch (error) {
        // Error decoding measure series
        return {};
    }
}

/**
 * Update gas and PM information with proper naming
 * @param {Object} decodedMeasurements - Raw decoded measurements
 * @returns {Object} - Updated measurements with gas names
 */
function updateGasAndPmInfo(decodedMeasurements) {
    try {
        const result = { ...decodedMeasurements };

        // Handle gas sensors
        const gases = [
            { idKey: 'gaz_1_id', valueKey: 'gaz_1' },
            { idKey: 'gaz_2_id', valueKey: 'gaz_2' },
            { idKey: 'gaz_3_id', valueKey: 'gaz_3' }
        ];

        gases.forEach(({ idKey, valueKey }) => {
            const gasId = result[idKey];
            const gasValue = result[valueKey];

            if (gasId !== undefined && gasId !== 0) {
                const gasName = GAS_IDENTIFICATION[gasId] || "Inconnu";
                result[gasName] = gasValue;
            }

            delete result[idKey];
            delete result[valueKey];
        });

        // Handle PM sensors (keep values regardless of status for now)
        const pmSensors = ['pm10', 'pm25', 'pm1'];
        pmSensors.forEach(pmKey => {
            const statusKey = `${pmKey}_status`;
            // Remove status key but keep PM value
            delete result[statusKey];
        });

        return result;
    } catch (error) {
        // Error updating gas and PM info
        return decodedMeasurements;
    }
}



/**
 * Convert raw sensor values to physical units
 * @param {Object} serie - Raw measurement series
 * @returns {Object} - Converted series
 */
function convertValues(serie) {
    try {
        const result = { ...serie };

        // Convert noise values
        if (result.noise_average !== undefined) {
            result.noise_average = Math.round(((result.noise_average * 0.1) + 17.7) * 10) / 10;
        }
        if (result.noise_peak !== undefined) {
            result.noise_peak = Math.round(((result.noise_peak * 0.1) + 17.7) * 10) / 10;
        }

        // Convert humidity (0-255 to 0-100%)
        if (result.humidity !== undefined) {
            result.humidity = Math.round((result.humidity * 100 / 255) * 100) / 100;
        }

        // Convert temperature (-20°C to +60°C range)
        if (result.temperature !== undefined) {
            result.temperature = Math.round(((result.temperature * 80 / 1023) - 20) * 100) / 100;
        }

        return result;
    } catch (error) {
        // Error converting values
        return serie;
    }
}

/**
 * Main decode function - LoRaWAN Alliance format
 * @param {Object} input - Input object with bytes array
 * @returns {Object} - Decoded uplink result
 */
function decodeUplink(input) {
    try {
        // QAA Payload Decoder starts

        // Validate input
        if (!input || !input.bytes || !Array.isArray(input.bytes)) {
            throw new Error("Invalid input: expected object with bytes array");
        }

        const bytes = new Uint8Array(input.bytes);

        // Validate payload length
        if (bytes.length !== 44) {
            // Expected 44 bytes, got different length
        }

        // Decode device information from first 6 bytes
        const deviceInfo = decodeDeviceInfos(bytes.slice(0, 6));

        // Decode measurement series
        let series1 = decodeMeasureSeries(bytes, DECRYPTION_KEYS);
        let series2 = decodeMeasureSeries(bytes, DECRYPTION_KEYS_2);

        // Convert raw values to physical units
        series1 = convertValues(series1);
        series2 = convertValues(series2);

        // Update gas and PM information
        series1 = updateGasAndPmInfo(series1);
        series2 = updateGasAndPmInfo(series2);

        // Add timestamps
        const utcTimestamp = Math.floor(Date.now() / 1000);
        const transmissionInterval = deviceInfo.transmission_interval;

        let logTimestampSeries1 = utcTimestamp;
        if (transmissionInterval > 0) {
            const minutesToSubtract = Math.floor(transmissionInterval / 2);
            logTimestampSeries1 = utcTimestamp - (minutesToSubtract * 60);
        }

        series1.log_timestamp = logTimestampSeries1;
        series2.log_timestamp = utcTimestamp;

        // Return LoRaWAN Alliance format
        return {
            data: {
                device_info: deviceInfo,
                measurements: [series1, series2]
            },
            warnings: [],
            errors: []
        };

    } catch (error) {
        // Decode error occurred
        return {
            data: {},
            warnings: [],
            errors: [error.message || "Unknown decode error"]
        };
    }
}

/**
 * @typedef {Object} EncodedDownlink
 * @property {number[]} bytes - Array of bytes represented as numbers as it will be sent to the device
 * @property {number} fPort - The Port Field on which the downlink must be sent
 * @property {string[]} [errors] - A list of error messages while encoding the downlink object
 * @property {string[]} [warnings] - A list of warning messages that do not prevent the driver from encoding the downlink object
 */

/**
 * Downlink encode
 * @param {Object} input - An object provided by the IoT Flow framework
 * @param {Object} input.data - The higher-level object representing your downlink
 * @returns {EncodedDownlink} The encoded object
 */

function encodeDownlink(input) {
    const transmissionInterval = input?.data?.transmissionInterval;

    if (
        typeof transmissionInterval !== "number" ||
        transmissionInterval < 1 ||
        transmissionInterval > 720
    ) {
        throw new Error("Transmission interval must be a number between 1 and 720 (minutes)");
    }

    const highByte = (transmissionInterval >> 8) & 0xff;
    const lowByte = transmissionInterval & 0xff;

    return {
        fPort: 2,
        bytes: [0x01, highByte, lowByte], // 0x01 = commande de transmissionInterval
    };
}

