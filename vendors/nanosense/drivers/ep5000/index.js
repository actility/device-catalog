// EP5000 Payload Decoder - LoRa Alliance Standard Codec API

const SENSOR_KEYS = [
    'Lux, T°K light', 'Benzen_Formaldehyde', 'nox_o3', 'voc_sulfuric_odors',
    'co2', 'noise', 'pm', 'temperature_rh'
];

// Defines bit ranges for system metadata
const SYSTEM_KEYS = {
    'firmware_version': [8, 16],
    'lora_module_firmware': [16, 24],
    'autonomy_percent': [40, 48],
    'transmission_rate': [48, 64]
};

// Defines bit ranges and optional scaling factors for various sensor readings
const DECRYPTION_KEYS = {
    'humidity': [64, 72, 0.5],
    'temperature': [72, 81, 0.1],
    'pm10': [81, 90],
    'pm25': [90, 99],
    'pm1': [99, 108],
    'noise_average': [108, 115],
    'noise_peak': [115, 122],
    //'occupancy': [122, 123],
    'co2': [123, 136],
    'cov': [136, 152],
    'formaldehyde': [152, 168, 0.01],
    'benzene': [168, 184, 0.01],
    //'sulfuric_odors': [184, 192],
    'nox': [192, 200, 2],
    'o3': [200, 208, 2],
    'pressure': [208, 222, 0.1],
    'lux': [222, 232, 4],
    'light_temperature': [232, 240, 23],
    'light_flickering': [240, 248, 0.5],
    'health_index': [248, 256],
    'cognitivity_index': [256, 264],
    'sleep_index': [264, 272],
    'respiratory_index': [272, 280],
    'virus_risk_index': [280, 288],
    'building_health_index': [288, 296],
    'ventilation_control': [296, 304],
    'heating_control': [304, 312],
    'cooling_control': [312, 320]
};

// Converts hex string to binary string
function hexToBinary(hex) {
    return hex.split('').map(h => parseInt(h, 16).toString(2).padStart(4, '0')).join('');
}

// Extracts a substring of bits from the binary payload
function extractBits(binaryString, start, end) {
    return binaryString.slice(start, end);
}

// Converts binary string to unsigned integer
function binaryToUint(binaryString) {
    return parseInt(binaryString, 2);
}


/**
 * Decode uplink function - LoRa Alliance standard
 * @param {Object} input - Input object containing bytes, fPort, recvTime, etc.
 * @returns {Object} - Decoded data object
 */
function decodeUplink(input) {
    const warnings = [];
    const errors = [];

    try {
        // Convert input bytes to hex string
        let hexString;
        if (input.bytes instanceof Uint8Array || Array.isArray(input.bytes)) {
            hexString = Array.from(input.bytes).map(b => b.toString(16).padStart(2, '0')).join('');
        } else if (typeof input.bytes === 'string') {
            hexString = input.bytes;
        } else {
            throw new Error('Buffer must be a Uint8Array, Array, or hex string');
        }

        const binaryPayload = hexToBinary(hexString);

        if (binaryPayload.length !== 328) {
            warnings.push(`Expected 328 bits, got ${binaryPayload.length} bits.`);
        }

        // Decode active sensor flags
        const active_sensors = [];
        for (let i = 0; i < SENSOR_KEYS.length; i++) {
            if (parseInt(binaryPayload[i]) === 1) {
                active_sensors.push(SENSOR_KEYS[i]);
            }
        }

        // Decode system metadata
        const system_info = {};
        for (const [key, [start, end]] of Object.entries(SYSTEM_KEYS)) {
            const bits = extractBits(binaryPayload, start, end);
            system_info[key] = binaryToUint(bits);
        }

        // Decode raw measurements and apply multipliers if present
        const measurements_raw = {};
        for (const [key, value] of Object.entries(DECRYPTION_KEYS)) {
            const [start, end, ...multiplier] = value;
            const bits = extractBits(binaryPayload, start, end);
            let val = binaryToUint(bits);

            if (multiplier.length > 0) {
                val = Math.round(val * multiplier[0] * 10) / 10;
            }
            measurements_raw[key] = val;
        }

        // Check if light temperature is in valid range
        if (measurements_raw.light_temperature < 1635 || measurements_raw.light_temperature > 7500) {
            warnings.push(`Light temperature out of valid range: ${measurements_raw.light_temperature} K`);
        }

        // Apply offsets to noise values
        const binary_noise_average = extractBits(binaryPayload, 108, 115);
        measurements_raw.noise_average = binaryToUint(binary_noise_average) + 17;

        const binary_noise_peak = extractBits(binaryPayload, 115, 122);
        measurements_raw.noise_peak = binaryToUint(binary_noise_peak) + 17;

        // Add current timestamp
        const utc_timestamp = Math.floor(Date.now() / 1000);
        measurements_raw.log_timestamp = utc_timestamp;

        // Format device metadata for output
        const device_info = {
            active_sensors: active_sensors,
            firmware_version: system_info.firmware_version / 10,
            frm_lora: system_info.lora_module_firmware / 10,
            transmission_rate: system_info.transmission_rate,
            autonomy_percent: system_info.autonomy_percent
        };

        // Structure decoded sensor readings
        const measurements = [
            {
                log_timestamp: measurements_raw.log_timestamp,
                temperature: measurements_raw.temperature,
                humidity: measurements_raw.humidity,
                pressure: measurements_raw.pressure,
                co2: measurements_raw.co2,
                pm1: measurements_raw.pm1,
                pm25: measurements_raw.pm25,
                pm10: measurements_raw.pm10,
                cov: measurements_raw.cov,
                formaldehyde: measurements_raw.formaldehyde,
                benzene: measurements_raw.benzene,
                //sulfuric_odors: measurements_raw.sulfuric_odors,
                nox: measurements_raw.nox,
                o3: measurements_raw.o3,
                noise_average: measurements_raw.noise_average,
                noise_peak: measurements_raw.noise_peak,
                lux: measurements_raw.lux,
                light_temperature: measurements_raw.light_temperature,
                light_flickering: measurements_raw.light_flickering,
                //occupancy: measurements_raw.occupancy,
                health_index: measurements_raw.health_index,
                cognitivity_index: measurements_raw.cognitivity_index,
                sleep_index: measurements_raw.sleep_index,
                respiratory_index: measurements_raw.respiratory_index,
                virus_risk_index: measurements_raw.virus_risk_index,
                building_health_index: measurements_raw.building_health_index,
                ventilation_control: measurements_raw.ventilation_control,
                heating_control: measurements_raw.heating_control,
                cooling_control: measurements_raw.cooling_control
            }

        ];

        return {
            data: {
                device_info: device_info,
                measurements: measurements
            },
            warnings: warnings,
            errors: errors
        };

    } catch (error) {
        errors.push(error.message);
        return {
            data: {
                device_info: {},
                measurements: []
            },
            warnings: warnings,
            errors: errors
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
