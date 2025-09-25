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

function DecodeAll(fPort, bytes) {
    let allDecoded = {};
    let offset = 0;

    while (offset < bytes.length) {
        if (offset >= bytes.length) break;
        const b = bytes.slice(offset);
        const cmd = b[0];
        let msgLen = 0;

        switch(cmd) {
            case 0x81:
                msgLen = (b.length >= 9) ? Math.min(b.length, 10) : 0; // KeepAlive, usually 9 or 10(if period)
                break;
            case 0x29:
                msgLen = 2; break;
            case 0x3D:
                msgLen = 4; break;
            case 0x3F:
                msgLen = 3; break;
            case 0x40:
                msgLen = 2; break;
            case 0x42:
                msgLen = 2; break;
            case 0x04:
                msgLen = 3; break;
            case 0x1D:
                msgLen = 3; break;
            case 0x12:
                msgLen = (b.length >= 11) ? 11 : 2; // keep-alive period + optional keepalive block
                break;
            default:
                // Unknown or incomplete message, skip 1 byte
                msgLen = 1;
        }

        if ((b.length) < msgLen || msgLen === 0) break; // Not enough bytes to decode

        const msgBytes = b.slice(0, msgLen);

        let decoded = Decode(fPort, msgBytes);
        allDecoded = { ...allDecoded, ...decoded }

        offset += msgLen;
    }
    return allDecoded;
}

function decodeUplink(input) {
    return { data: DecodeAll(input.fPort, input.bytes) };
}

function encodeDownlink(input) {
    let result = {
        errors: [],
        warnings: []
    };
    let encoded = [];

    try {
        if (input == null) {
            result.errors.push("No data to encode");
            return result;
        }

        let data = input
        if (input.data != null) {
            data = input.data;
        }

        // 1. Consigne + plage ±2°C (ex : { targetWithRange: 21 })
        if ("targetWithRange" in data) {
            var t = Math.round(data.targetWithRange);
            if (t < 7 || t > 28)
                throw new Error("Consigne hors plage avec ±2°C");

            // 0x0E = consigne de température (°C entier)
            encoded.push(0x0E, t);

            // 0x08 = plage autorisée autour de la consigne (ex : 21 ? 19 à 23)
            encoded.push(0x08, t - 2, t + 2);

            // On envoie uniquement cette commande si elle est définie
            return encoded;
        }



        // 2. Température externe (°C * 10)
        if ("externalTemperature" in data) {
            var extTemp = Math.round(data.externalTemperature * 10);
            if (extTemp < 0 || extTemp > 65535)
                throw new Error("Température externe hors plage");

            // 0x3C = température externe, encodée sur 2 octets (UINT16)
            encoded.push(0x3C, (extTemp >> 8) & 0xFF, extTemp & 0xFF);
        }

        // 3. Mode de fonctionnement (manuel, auto, forcé)
        if ("operationalMode" in data) {
            var mode = data.operationalMode;
            if (![0x00, 0x01, 0x02].includes(mode))
                throw new Error("Mode opérationnel invalide");

            // 0x0D = mode opérationnel
            encoded.push(0x0D, mode);
        }

        // 4. Recalibrage du moteur (pas de valeur, juste une commande)
        if (data.recalibrateMotor === true) {
            encoded.push(0x03); // 0x03 = recalibrage moteur
        }

        // 5. Forcer position moteur uniquement (0–65535)
        if ("motorPositionOnly" in data) {
            var pos = Math.round(data.motorPositionOnly);
            if (pos < 0 || pos > 65535)
                throw new Error("Position moteur invalide");

            // 0x2D = position moteur seule, sur 2 octets
            encoded.push(0x2D, (pos >> 8) & 0xFF, pos & 0xFF);
        }

        // 6. Forcer position moteur + température cible
        if ("motorPosition" in data && "targetTemperature" in data) {
            var pos = Math.round(data.motorPosition);
            var temp = Math.round(data.targetTemperature);
            if (pos < 0 || pos > 65535 || temp < 5 || temp > 30)
                throw new Error("Données moteur/température invalides");

            // 0x31 = position moteur + température, 2 octets + 1
            encoded.push(0x31, (pos >> 8) & 0xFF, pos & 0xFF, temp);
        }

        // 7. Détection de fenêtre ouverte (activer/désactiver, durée, seuil)
        if ("openWindowDetection" in data) {
            var e = data.openWindowDetection;
            var enable = e.enable ? 0x01 : 0x00;
            var duration = Math.round(e.duration); // en minutes
            var delta = Math.round(e.tempDelta * 10); // en dixièmes de °C
            if (duration < 0 || duration > 255 || delta < 0 || delta > 255)
                throw new Error("Paramètres fenêtre invalide");

            // 0x45 = détection fenêtre, 3 octets
            encoded.push(0x45, enable, duration, delta);
        }

        // 8. Période de keep-alive (0x02, en minutes, max 255)
        if ("keepAlivePeriod" in data) {
            var period = Math.round(data.keepAlivePeriod);
            if (period < 0 || period > 255)
                throw new Error("Période keep-alive invalide");

            encoded.push(0x02, period);
        }

        // 9. Verrouillage enfants (activé/désactivé)
        if ("childLock" in data) {
            encoded.push(0x07, data.childLock ? 0x01 : 0x00);
        }

        // 10. Reset de l’appareil (pas de paramètre)
        if (data.resetDevice === true) {
            encoded.push(0x30); // 0x30 = commande reset
        }

        // 11. Algorithme PI (Kp + Ki, codés en 3 octets chacun)
        if ("piAlgorithm" in data) {
            if ("proportionalGain" in data.piAlgorithm) {
                var Kp = Math.round(data.piAlgorithm.proportionalGain * 131072);
                encoded.push(0x37, (Kp >> 16) & 0xFF, (Kp >> 8) & 0xFF, Kp & 0xFF);
            }
            if ("integralGain" in data.piAlgorithm) {
                var Ki = Math.round(data.piAlgorithm.integralGain * 131072);
                encoded.push(0x3E, (Ki >> 16) & 0xFF, (Ki >> 8) & 0xFF, Ki & 0xFF);
            }
        }

        result.bytes = Array.from(Buffer.from(encoded));
        result.fPort = 2;
        return result;
    } catch (e){
        result.errors.push(e.message);
        delete result.bytes;
        delete result.fPort;
        return result;
    }
}

exports.decodeUplink = decodeUplink;
exports.encodeDownlink = encodeDownlink;