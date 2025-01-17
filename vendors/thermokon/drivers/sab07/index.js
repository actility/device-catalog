//steven.jam@thermokon.fr

function Decode(fPort, bytes) {
    var data = {};

    // Helper functions
    function toBool(value) {
        return value === 1;
    }

    function decodeTemperature(value) {
        return (value - 28.33333) / 5.66666;
    }

    function decodeHumidity(value) {
        return (value * 100) / 256;
    }

    function decodeMotorPosition(high, low) {
        return ((high & 0x0F) << 8) | low;
    }

    function decodeMotorRange(high, low) {
        return ((high & 0xF0) << 4) | low;
    }

    function decodeBatteryVoltage(value) {
        return 2 + (value >> 4) * 0.1;
    }

    function decodeStatusFlags(value) {
        return {
            openWindow: toBool(value & 0x08),
            highMotorConsumption: toBool(value & 0x04),
            lowMotorConsumption: toBool(value & 0x02),
            brokenSensor: toBool(value & 0x01),
        };
    }

    function decodeExtraFlags(value) {
        return {
            manualTempDisabled: toBool(value & 0x80),
            motorCalibrationFailed: toBool(value & 0x40),
            deviceAttachedToBackplate: toBool(value & 0x20),
            deviceOnline: toBool(value & 0x10)
        };
    }

    // Decode keep-alive message
    function decodeKeepAlive(bytes) {
        var targetTemperature = bytes[1]; // byte 1 - Target Temperature
        var sensorTemperature = decodeTemperature(bytes[2]);
        var relativeHumidity = decodeHumidity(bytes[3]);
        var motorPosition = decodeMotorPosition(bytes[6], bytes[4]);
        var motorRange = decodeMotorRange(bytes[6], bytes[5]);
        var batteryVoltage = decodeBatteryVoltage(bytes[7]);
        var statusFlags = decodeStatusFlags(bytes[7]);
        var extraFlags = decodeExtraFlags(bytes[8]);

        // Adding decoded data
        data.targetTemperature = targetTemperature;
        data.sensorTemperature = parseFloat(sensorTemperature.toFixed(2));
        data.relativeHumidity = parseFloat(relativeHumidity.toFixed(2));
        data.motorPosition = motorPosition;
        data.motorRange = motorRange;
        data.batteryVoltage = parseFloat(batteryVoltage.toFixed(2));
        data.statusFlags = statusFlags;
        data.extraFlags = extraFlags;

        // Additional data (e.g., keep-alive period)
        if (bytes.length > 9) {
            var keepAlivePeriod = bytes[9]; 
            data.keepAlivePeriod = keepAlivePeriod;
        }
    }

    // Decode GET PROPORTIONAL ALGORITHM PARAMETERS
    function decodeProportionalAlgorithmParameters(bytes) {
        if (bytes.length === 2) {
            data.proportionalAlgorithmParameters = bytes[1];
        }
    }

    // Decode GET INTEGRAL GAIN - KI
    function decodeIntegralGain(bytes) {
        if (bytes.length === 4) {
            var ki = ((bytes[1] << 24) | (bytes[2] << 16) | (bytes[3] << 8)) / 131072;
            data.integralGain = parseFloat(ki.toFixed(2));
        }
    }

    // Decode GET PI's algo integral value
    function decodeIntegralValue(bytes) {
        if (bytes.length === 3) {
            var integralValue = ((bytes[1] << 8) | bytes[2]) / 10;
            data.integralValue = parseFloat(integralValue.toFixed(1));
        }
    }

    // Decode GET PI's algo run period
    function decodePiRunPeriod(bytes) {
        if (bytes.length === 2) {
            data.piRunPeriod = bytes[1];
        }
    }

    // Decode GET PI's algo temperature hysteresis
    function decodeTemperatureHysteresis(bytes) {
        if (bytes.length === 2) {
            var temperatureHysteresis = bytes[1] / 10;
            data.temperatureHysteresis = parseFloat(temperatureHysteresis.toFixed(1));
        }
    }

    // Decode READ DEVICE HARDWARE AND SOFTWARE VERSION
    function decodeDeviceVersion(bytes) {
        if (bytes.length === 3) {
            var hardwareVersion = (bytes[1] >> 4) + '.' + (bytes[1] & 0x0F);
            var softwareVersion = (bytes[2] >> 4) + '.' + (bytes[2] & 0x0F);
            data.hardwareVersion = hardwareVersion;
            data.softwareVersion = softwareVersion;
        }
    }

    // Decode DEVICE RADIO COMMUNICATION WATCHDOG PARAMETERS
    function decodeDeviceRadioCommunicationWatchdogParameters(bytes) {
        if (bytes.length === 3) {
            data.watchdogParameters = {
                confirmedValue: bytes[1],
                unconfirmedValue: bytes[2]
            };
        }
    }

    // Decode received message based on command code
    switch (bytes[0]) {
        case 0x81:
            if (bytes.length >= 9) {
                decodeKeepAlive(bytes);
            }
            break;
        case 0x29:
            decodeProportionalAlgorithmParameters(bytes);
            break;
        case 0x3D:
            decodeIntegralGain(bytes);
            break;
        case 0x3F:
            decodeIntegralValue(bytes);
            break;
        case 0x40:
            decodePiRunPeriod(bytes);
            break;
        case 0x42:
            decodeTemperatureHysteresis(bytes);
            break;
        case 0x04:
            decodeDeviceVersion(bytes);
            break;
        case 0x1D:
            decodeDeviceRadioCommunicationWatchdogParameters(bytes);
            break;
        case 0x12:
            if (bytes.length >= 2) {
                data.keepAlivePeriod = bytes[1];
            }
            // If there's more data after the keep-alive period, decode it as keep-alive
            if (bytes.length >= 11) {
                decodeKeepAlive(bytes.slice(2));
            }
            break;
    }

    return data;
}

function decodeUplink(input) {
	return { data: Decode(input.fPort, input.bytes), errors: [], warnings: [] };
}

exports.decodeUplink = decodeUplink;