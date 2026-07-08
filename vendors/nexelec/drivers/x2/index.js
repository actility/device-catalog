/* 
* Payload Decoder LoRa Alliance for FEEL+ (X280), RISE+ (X220), WAVE+ (X230), MOVE+ (X290), SIGN+ (X265), SENSE+ (X255), ATMO+ (X260)
* Copyright 2025 Nexelec
* Version : 1.0.0
*/

function decodeUplink(input) {

    var stringHex = bytesString(input.bytes);

    var octetTypeProduit = parseInt(stringHex.substring(0, 2), 16);
    var octetTypeMessage = parseInt(stringHex.substring(2, 4), 16);

    var data = dataOutput(octetTypeMessage);

    return { data };

    function bytesString(input) {
        var bufferString = '';
        var decToString = '';

        for (var i = 0; i < input.length; i++) {
            decToString = input[i].toString(16).padStart(2, '0')
            bufferString = bufferString.concat(decToString)
        }
        return bufferString;
    }

    function dataOutput(octetTypeMessage) {
        if (octetTypeMessage == 0x01) { return periodicDataOutput(stringHex) }
        if (octetTypeMessage == 0x02) { return historicalCO2DataOutput(stringHex) }
        if (octetTypeMessage == 0x03) { return historicalTemperatureDataOutput(stringHex) }
        if (octetTypeMessage == 0x04) { return historicalHumidityDataOutput(stringHex) }
        if (octetTypeMessage == 0x05) { return productStatusDataOutput(stringHex) }
        if (octetTypeMessage == 0x06) { return productConfigurationDataOutput(stringHex) }
        if (octetTypeMessage == 0x07) { return productScreenConfigurationDataOutput(stringHex) }
        if (octetTypeMessage == 0x08) { return presenceAlertDataOutput(stringHex) }
    }

    function typeOfProduct(octetTypeProduit) {
        if (octetTypeProduit == 0xB9) { return "FEEL+ LoRa" }
        if (octetTypeProduit == 0xBA) { return "RISE+ LoRa" }
        if (octetTypeProduit == 0xBB) { return "WAVE+ LoRa" }
        if (octetTypeProduit == 0xC6) { return "MOVE+ LoRa" }
        if (octetTypeProduit == 0xC7) { return "SIGN+ LoRa" }
        if (octetTypeProduit == 0xC8) { return "SENSE+ LoRa" }
        if (octetTypeProduit == 0xCD) { return "ATMO+ LoRa" }
    }

    function typeOfMessage(octetTypeMessage) {
        if (octetTypeMessage == 0x01) { return "Periodic Data" }
        if (octetTypeMessage == 0x02) { return "CO2 Historical Data" }
        if (octetTypeMessage == 0x03) { return "Temperature Historical Data" }
        if (octetTypeMessage == 0x04) { return "Humidity Historical Data" }
        if (octetTypeMessage == 0x05) { return "Product Status" }
        if (octetTypeMessage == 0x06) { return "Product Configuration" }
        if (octetTypeMessage == 0x07) { return "Product Screen Configuration" }
        if (octetTypeMessage == 0x08) { return "Presence Alert" }
    }

    function temperature(octetTemperatureValue) {
        if (octetTemperatureValue >= 1023) { return "error" }
        if (octetTemperatureValue >= 1022) { return "deconnected sensor" }
        if (octetTemperatureValue >= 1021) { return "desactivated sensor" }
        else { return { "value": ((octetTemperatureValue / 10) - 30), "unit": "°C" } }

    }

    function humidity(octetHumidityValue) {
        if (octetHumidityValue >= 1023) { return "error" }
        if (octetHumidityValue >= 1022) { return "deconnected sensor" }
        if (octetHumidityValue >= 1021) { return "desactivated sensor" }
        else { return { "value": (octetHumidityValue / 10), "unit": "%RH" } }
    }


    function co2(octetCO2Value) {
        if (octetCO2Value >= 16383) { return "error" }
        if (octetCO2Value >= 16382) { return "deconnected sensor" }
        if (octetCO2Value >= 16381) { return "desactivated sensor" }
        else { return { "value": octetCO2Value, "unit": "ppm" } };
    }

    function absoluteVOC(octetabsoluteVOCValue) {
        if (octetabsoluteVOCValue >= 16383) { return "error" }
        if (octetabsoluteVOCValue >= 16382) { return "deconnected sensor" }
        if (octetabsoluteVOCValue >= 16381) { return "desactivated sensor" }
        else { return { "value": octetabsoluteVOCValue, "unit": "ug/m3" } };
    }

    function airDriveIndex(octetAirDriveIndex) {
        if (octetAirDriveIndex >= 16383) { return "error" }
        if (octetAirDriveIndex >= 16382) { return "Function not available" }
        if (octetAirDriveIndex >= 16381) { return "Function desactivated" }
        else { return { "value": octetAirDriveIndex, } };
    }

    function luminosity(octetLuminosityValue) {
        if (octetLuminosityValue >= 1023) { return "error" }
        if (octetLuminosityValue >= 1022) { return "deconnected sensor" }
        if (octetLuminosityValue >= 1021) { return "desactivated sensor" }
        else { return { "value": (octetLuminosityValue * 5), "unit": "lux" } };
    }

    function buttonPress(octetButtonValue) {
        if (octetButtonValue === 0) { return "none" }
        else if (octetButtonValue === 1) { return "short" };
    }

    function averageNoise(octetAverageNoise) {
        if (octetAverageNoise === 127) { return "error" }
        if (octetAverageNoise >= 126) { return "deconnected sensor" }
        if (octetAverageNoise >= 125) { return "desactivated sensor" }
        else { return { "value": octetAverageNoise, "unit": "dB" } };
    }

    function peakNoise(octetPeakNoise) {
        if (octetPeakNoise === 127) { return "error" }
        if (octetPeakNoise >= 126) { return "deconnected sensor" }
        if (octetPeakNoise >= 125) { return "desactivated sensor" }
        else { return { "value": octetPeakNoise, "unit": "dB" } };
    }

    function occupancyRate(octetOccupancyRate) {
        if (octetOccupancyRate === 127) { return "error" }
        if (octetOccupancyRate >= 126) { return "deconnected sensor" }
        if (octetOccupancyRate >= 125) { return "desactivated sensor" }
        else { return { "value": octetOccupancyRate, "unit": "%" } };
    }

    function iaqGlobalArgument(octetiaqGlobal) {
        var message_name = ["excellent", "Reserved", "fair", "Reserved", "bad", "Reserved", "Reserved", "error"]
        return message_name[octetiaqGlobal]
    }

    function iaqSourceArgument(octetiaqSource) {
        var message_name = ["none", "Reserved", "Reserved", "Reserved", "Reserved", "co2", "voc", "formaldehyde", "pm1", "pm2.5", "pm10", "Reserved", "Reserved", "Reserved", "Reserved", "error"]
        return message_name[octetiaqSource]
    }

    function pm_ug(octetpm) {
        if (octetpm >= 65535) { return "error" }
        if (octetpm >= 65534) { return "deconnected sensor" }
        if (octetpm >= 65533) { return "desactivated sensor" }
        if (octetpm >= 65532) { return "end of life sensor" }
        else { return { "value": octetpm, "unit": "µg/m3" } };
    }

    function pm_pcs(octetpm) {
        if (octetpm >= 65535) { return "error" }
        if (octetpm >= 65534) { return "deconnected sensor" }
        if (octetpm >= 65533) { return "desactivated sensor" }
        if (octetpm >= 65532) { return "end of life sensor" }
        else { return { "value": octetpm, "unit": "pcs/cm3" } };
    }

    function pm_001pcs(octetpm) {
        if (octetpm >= 65535) { return "error" }
        if (octetpm >= 65534) { return "deconnected sensor" }
        if (octetpm >= 65533) { return "desactivated sensor" }
        if (octetpm >= 65532) { return "end of life sensor" }
        else { return { "value": octetpm * 0.01, "unit": "pcs/cm3" } };
    }

    function pressure(octetpressure) {
        if (octetpressure >= 1023) { return "error" }
        if (octetpressure >= 1022) { return "deconnected sensor" }
        if (octetpressure >= 1021) { return "desactivated sensor" }
        else { return { "value": octetpressure + 300, "unit": "hPa" } };
    }

    function formaldehyde(octetformaldehyde) {
        if (octetformaldehyde >= 1023) { return "error" }
        if (octetformaldehyde >= 1022) { return "deconnected sensor" }
        if (octetformaldehyde >= 1021) { return "desactivated sensor" }
        if (octetformaldehyde >= 1020) { return "end of life sensor" }
        else { return { "value": octetformaldehyde, "unit": "ppb" } };
    }

    function powerSource(octetPowerSource) {
        var message_name = ["battery", "external 5V", "Reserved", "Reserved"]
        return message_name[octetPowerSource]
    }

    function batteryVoltage(octetbatteryVoltage) {
        if (octetbatteryVoltage === 1023) { return "error" }
        else if (octetbatteryVoltage === 1022) { return "external power supply" }
        else { return { "value": (octetbatteryVoltage * 5), "unit": "mV" } }
    }

    function batterieLevelArgument(octetBatteryLevel) {
        var message_name = ["high", "medium", "low", "critical", "external power supply"]
        return message_name[octetBatteryLevel]
    }

    function productHwStatusArgument(octetProductHwStatus) {
        var message_name = ["ok", "error"]
        return message_name[octetProductHwStatus]
    }

    function screenStatusArgument(octetScreenSensorStatus) {
        var message_name = ["ok", "error", "absent", "desactivated", "end of life"]
        return message_name[octetScreenSensorStatus]
    }

    function sdStatusArgument(octetSDStatus) {
        var message_name = ["ok", "error", "absent", "desactivated", "end of life"]
        return message_name[octetSDStatus]
    }

    function productActivationTimeCounter(octetTimeCounter) {
        if (octetTimeCounter === 1023) { return "error" }
        else { return { "value": octetTimeCounter, "unit": "month" } };
    }

    function lowBatterieThreshold(octetLowBatterie) {
        { return { "value": (octetLowBatterie * 5) + 2000, "unit": "mV" } };
    }

    function antiTearArgument(octetSDStatus) {
        var message_name = ["not detected", "detected", "just removed from the base", "just installed from the base"]
        return message_name[octetSDStatus]
    }

    function reconfigurationSource(octetReconfigurationSource) {
        var message_name = ["nfc", "downlink", "start up", "network", "gps", "local"]
        return message_name[octetReconfigurationSource]
    }

    function reconfigurationState(octetReconfigurationState) {
        var message_name = ["total success", "partial Success", "total failure", "Reserved"]
        return message_name[octetReconfigurationState]
    }

    function period(octetPeriod) {
        return { "value": octetPeriod, "unit": "minutes" };
    }

    function sensorActivation(octetSensorActivate) {
        if (octetSensorActivate === 0) { return "off" }
        else if (octetSensorActivate === 1) { return "on" };
    }

    function sdActivation(octetSDActivate) {
        if (octetSDActivate === 0) { return "off" }
        else if (octetSDActivate === 1) { return "on" };
    }

    function calibrationActivation(octetCalibrationActivate) {
        if (octetCalibrationActivate === 0) { return "off" }
        else if (octetCalibrationActivate === 1) { return "on" };
    }

    function active(octetActive) {
        if (octetActive === 0) { return "off" }
        else if (octetActive === 1) { return "on " };
    }

    function notificationByLEDandBuzzer(octetNotification) {
        if (octetNotification === 0) { return "co2" }
        else if (octetNotification === 1) { return "iziair" };
    }

    function loraRegion(octetLoRaRegion) {
        var message_name = ["XXX", "lorawan-eu868", "lorawan-us915", "lorawan-as923", "lorawan-au915", "lorawan-kr920", "lorawan-in865", "lorawan-ru864"]
        return message_name[octetLoRaRegion]
    }

    function deltaCO2(octetDeltaCO2) {
        if (octetDeltaCO2 === 255) { return "desactivated" }
        else { return { "value": (octetDeltaCO2 * 4), "unit": "ppm" } }
    }

    function deltaTemp(octetDeltaTemp) {
        if (octetDeltaTemp === 127) { return "desactivated" }
        else { return { "value": (octetDeltaTemp * 0.1), "unit": "°C" } }
    }

    function co2Threshold(octetCO2Threshold) {
        return { "value": octetCO2Threshold * 5, "unit": "ppm" };
    }

    function transmissionPeriodHistorical(octetPeriodHistorical) {
        if (octetPeriodHistorical === 255) { return "error" }
        else { return { "value": (octetPeriodHistorical * 10), "unit": "minutes" } }
    }

    function pendingJoin(octetPending) {
        if (octetPending === 0) { return "no join programmed" }
        else if (octetPending === 1) { return "join programmed" };
    }

    function nfcStatus(octetNfcStatus) {
        if (octetNfcStatus === 0) { return "discoverable" }
        else if (octetNfcStatus === 1) { return " no discoverable" };
    }

    function temperatureUnit(octetUnit) {
        var message_name = ["Reserved", "°C", "°F", "°K"]
        return message_name[octetUnit]
    }

    function screenLanguage(octetLanguage) {
        var message_name = ["Reserved", "fr", "en", "es", "de", "it"]
        return message_name[octetLanguage]
    }

    function activatedScreen(octetScreen) {
        var message_name = ["desactivated", "measure_1", "measure_2", "measure_3", "measure_4", "measure_5",
            "measure_6", "measure_7", "air_quality1", "diagnostic"]
        return message_name[octetScreen]
    }

    function priorityPolluant(octetPriority) {
        var message_name = ["none", "temperature", "humidity", "co2", "voc", "pm1",
            "pm2.5", "pm10", "formaldehyde"]
        return message_name[octetPriority]
    }

    function presence(octetPresence) {
        var message_name = ["absent", "presence"]
        return message_name[octetPresence]
    }

    function hexToBinary(encoded) {
        var string_bin = "";
        var string_bin_elements = "";
        var i;
        var j;

        for (i = 0; i < encoded.length; i++) {
            string_bin_elements = encoded.charAt(i);
            string_bin_elements = parseInt(string_bin_elements, 16).toString(2);
            if (string_bin_elements.length < 4) {
                var nb_zeros = 4 - string_bin_elements.length;
                for (j = 0; j < nb_zeros; j++) {
                    string_bin_elements = "0" + string_bin_elements;
                }
            }
            string_bin = string_bin + string_bin_elements;
        }
        return string_bin;
    }

    function periodicDataOutput(stringHex) {
        if (stringHex.length <= 29) // for FEEL+,RISE+,WAVE+,MOVE+,SIGN+ products
        {
            var data_temperature = (parseInt(stringHex.substring(4, 8), 16) >> 6) & 0x3FF;
            var data_humidity = (parseInt(stringHex.substring(6, 9), 16)) & 0x3FF;
            var data_co2 = (parseInt(stringHex.substring(9, 13), 16) >> 2) & 0x3FFF;
            var data_luminosity = (parseInt(stringHex.substring(16, 19), 16) >> 2) & 0x3FF;
            var data_button_press = (parseInt(stringHex.substring(18, 19), 16) >> 1) & 0x01;
            var data_avg_noise = (parseInt(stringHex.substring(18, 21), 16) >> 2) & 0x7F;
            var data_peak_noise = (parseInt(stringHex.substring(20, 23), 16) >> 3) & 0x7F;
            var data_occupancy_rate = (parseInt(stringHex.substring(22, 24), 16)) & 0x7F;
            var data_izi_air_global = (parseInt(stringHex.substring(24, 26), 16) >> 5) & 0x07;
            var data_izi_air_src = (parseInt(stringHex.substring(24, 26), 16) >> 1) & 0x0F;
            var data_izi_air_co2 = (parseInt(stringHex.substring(25, 27), 16) >> 2) & 0x07;
            var data_izi_air_cov = (parseInt(stringHex.substring(26, 28), 16) >> 3) & 0x07;
            var data_AirDriveIndex = (parseInt(stringHex.substring(27, 30), 16) >> 2) & 0x1FF;
            var data_presence = (parseInt(stringHex.substring(29, 30), 16) >> 1) & 0x01;

            data = {
                "typeOfProduct": typeOfProduct(octetTypeProduit),
                "typeOfMessage": typeOfMessage(octetTypeMessage),
                "temperature": temperature(data_temperature),
                "humidity": humidity(data_humidity),
                "co2": co2(data_co2),
                "luminosity": luminosity(data_luminosity),
                "buttonPress": buttonPress(data_button_press),
                "averageNoise": averageNoise(data_avg_noise),
                "peakNoise": peakNoise(data_peak_noise),
                "occupancyRate": occupancyRate(data_occupancy_rate),
                "iziairGlobal": iaqGlobalArgument(data_izi_air_global),
                "iziairSrc": iaqSourceArgument(data_izi_air_src),
                "iziairCo2": iaqGlobalArgument(data_izi_air_co2),
                "iziairCov": iaqGlobalArgument(data_izi_air_cov),
                "airDriveIndex": airDriveIndex(data_AirDriveIndex),
                "presence": presence(data_presence),
            };
        } else { // for SENSE+ and ATMO+ products

            var data_temperature = (parseInt(stringHex.substring(4, 8), 16) >> 6) & 0x3FF;
            var data_humidity = (parseInt(stringHex.substring(6, 9), 16)) & 0x3FF;
            var data_co2 = (parseInt(stringHex.substring(9, 13), 16) >> 2) & 0x3FFF;
            var data_luminosity = (parseInt(stringHex.substring(16, 19), 16) >> 2) & 0x3FF;
            var data_button_press = (parseInt(stringHex.substring(18, 19), 16) >> 1) & 0x01;
            var data_avg_noise = (parseInt(stringHex.substring(18, 21), 16) >> 2) & 0x7F;
            var data_peak_noise = (parseInt(stringHex.substring(20, 23), 16) >> 3) & 0x7F;
            var data_occupancy_rate = (parseInt(stringHex.substring(22, 24), 16)) & 0x7F;
            var data_izi_air_global = (parseInt(stringHex.substring(24, 26), 16) >> 5) & 0x07;
            var data_izi_air_src = (parseInt(stringHex.substring(24, 26), 16) >> 1) & 0x0F;
            var data_izi_air_co2 = (parseInt(stringHex.substring(25, 27), 16) >> 2) & 0x07;
            var data_izi_air_cov = (parseInt(stringHex.substring(26, 28), 16) >> 3) & 0x07;
            var data_AirDriveIndex = (parseInt(stringHex.substring(27, 30), 16) >> 2) & 0x1FF;
            var data_presence = (parseInt(stringHex.substring(29, 30), 16) >> 1) & 0x01;
            var data_pm1 = (parseInt(stringHex.substring(29, 34), 16) >> 1) & 0xFFFF;
            var data_pm2_5 = (parseInt(stringHex.substring(33, 38), 16) >> 1) & 0xFFFF;
            var data_pm10 = (parseInt(stringHex.substring(37, 42), 16) >> 1) & 0xFFFF;
            var data_pm_channel_1 = (parseInt(stringHex.substring(41, 46), 16) >> 1) & 0xFFFF;
            var data_pm_channel_2 = (parseInt(stringHex.substring(45, 50), 16) >> 1) & 0xFFFF;
            var data_pm_channel_3 = (parseInt(stringHex.substring(49, 54), 16) >> 1) & 0xFFFF;
            var data_pm_channel_4 = (parseInt(stringHex.substring(53, 58), 16) >> 1) & 0xFFFF;
            var data_pm_channel_5 = (parseInt(stringHex.substring(57, 62), 16) >> 1) & 0xFFFF;
            var data_pressure = (parseInt(stringHex.substring(61, 65), 16) >> 3) & 0x3FF;
            var data_formaldehyde = (parseInt(stringHex.substring(64, 67), 16) >> 1) & 0x3FF;
            var data_izi_air_pm1 = (parseInt(stringHex.substring(66, 68), 16) >> 2) & 0x07;
            var data_izi_air_pm2_5 = (parseInt(stringHex.substring(67, 69), 16) >> 3) & 0x07;
            var data_izi_air_pm10 = (parseInt(stringHex.substring(68, 69), 16)) & 0x07;
            var data_izi_air_formaldehyde = (parseInt(stringHex.substring(69, 70), 16) >> 1) & 0x07;


            data = {
                "typeOfProduct": typeOfProduct(octetTypeProduit),
                "typeOfMessage": typeOfMessage(octetTypeMessage),
                "temperature": temperature(data_temperature),
                "humidity": humidity(data_humidity),
                "co2": co2(data_co2),
                "luminosity": luminosity(data_luminosity),
                "buttonPress": buttonPress(data_button_press),
                "averageNoise": averageNoise(data_avg_noise),
                "peakNoise": peakNoise(data_peak_noise),
                "occupancyRate": occupancyRate(data_occupancy_rate),
                "iziairGlobal": iaqGlobalArgument(data_izi_air_global),
                "iziairSrc": iaqSourceArgument(data_izi_air_src),
                "iziairCo2": iaqGlobalArgument(data_izi_air_co2),
                "iziairCov": iaqGlobalArgument(data_izi_air_cov),
                "airDriveIndex": airDriveIndex(data_AirDriveIndex),
                "roomPresence": presence(data_presence),
                "pm1": pm_ug(data_pm1),
                "pm2_5": pm_ug(data_pm2_5),
                "pm10": pm_ug(data_pm10),
                "pmChannel1": pm_pcs(data_pm_channel_1),
                "pmChannel2": pm_pcs(data_pm_channel_2),
                "pmChannel3": pm_pcs(data_pm_channel_3),
                "pmChannel4": pm_001pcs(data_pm_channel_4),
                "pmChannel5": pm_001pcs(data_pm_channel_5),
                "pressure": pressure(data_pressure),
                "formaldehyde": formaldehyde(data_formaldehyde),
                "iziairPM1": iaqGlobalArgument(data_izi_air_pm1),
                "iziairPM2_5": iaqGlobalArgument(data_izi_air_pm2_5),
                "iziairPM10": iaqGlobalArgument(data_izi_air_pm10),
                "iziairFormaldehyde": iaqGlobalArgument(data_izi_air_formaldehyde),
            };

            return data;
        }

    }

    function historicalCO2DataOutput(stringHex) {
        var mesure = [];
        var i = 0;

        var data_nombre_mesures = (parseInt(stringHex.substring(4, 6), 16) >> 2) & 0x3F;
        var data_time_between_measurement_sec = ((parseInt(stringHex.substring(4, 8), 16) >> 2) & 0xFF);
        var data_repetition = (parseInt(stringHex.substring(7, 9), 16)) & 0x3F;
        var binary = hexToBinary(stringHex)

        for (i = 0; i < data_nombre_mesures; i++) {

            var offset_binaire = 36 + (10 * i);
            mesure[i] = parseInt(binary.substring(offset_binaire, offset_binaire + 10), 2);

            if (mesure[i] === 0x3FF) { mesure[i] = 0; }
            else { mesure[i] = parseFloat((mesure[i] * 5).toFixed(2)) }
        }

        data = {
            "typeOfProduct": typeOfProduct(octetTypeProduit),
            "typeOfMessage": typeOfMessage(octetTypeMessage),
            "newMeasure": data_nombre_mesures,
            "periodBetweenMeasure": { "value": data_time_between_measurement_sec * 10, "unit": "minutes" },
            "redundancy": data_repetition,
            "co2": { "value": mesure, "unit": "ppm" },
        }
        return data
    }

    function historicalTemperatureDataOutput(stringHex) {
        var mesure = [];
        var i = 0;

        var data_nombre_mesures = (parseInt(stringHex.substring(4, 6), 16) >> 2) & 0x3F;
        var data_time_between_measurement_sec = ((parseInt(stringHex.substring(4, 8), 16) >> 2) & 0xFF);
        var data_repetition = (parseInt(stringHex.substring(7, 9), 16)) & 0x3F;
        var binary = hexToBinary(stringHex)

        for (i = 0; i < data_nombre_mesures; i++) {

            var offset_binaire = 36 + (10 * i);

            mesure[i] = parseInt(binary.substring(offset_binaire, offset_binaire + 10), 2);

            if (mesure[i] === 0x3FF) { mesure[i] = 0; }
            else { mesure[i] = parseFloat(((mesure[i] / 10) - 30).toFixed(2)) }

        }

        data = {
            "typeOfProduct": typeOfProduct(octetTypeProduit),
            "typeOfMessage": typeOfMessage(octetTypeMessage),
            "newMeasure": data_nombre_mesures,
            "periodBetweenMeasure": { "value": data_time_between_measurement_sec * 10, "unit": "minutes" },
            "redundancy": data_repetition,
            "temperature": { "value": mesure, "unit": "°C" },
        }
        return data;
    }

    function historicalHumidityDataOutput(stringHex) {
        var mesure = [];
        var i = 0;

        var data_nombre_mesures = (parseInt(stringHex.substring(4, 6), 16) >> 2) & 0x3F;
        var data_time_between_measurement_sec = ((parseInt(stringHex.substring(4, 8), 16) >> 2) & 0xFF);
        var data_repetition = (parseInt(stringHex.substring(7, 9), 16)) & 0x3F;
        var binary = hexToBinary(stringHex)

        for (i = 0; i < data_nombre_mesures; i++) {

            var offset_binaire = 36 + (10 * i);

            mesure[i] = parseInt(binary.substring(offset_binaire, offset_binaire + 10), 2);

            if (mesure[i] === 0x3FF) { mesure[i] = 0; }
            else { mesure[i] = parseFloat((mesure[i] * 0.1).toFixed(2)) }

        }

        data = {
            "typeOfProduct": typeOfProduct(octetTypeProduit),
            "typeOfMessage": typeOfMessage(octetTypeMessage),
            "newMeasure": data_nombre_mesures,
            "periodBetweenMeasure": { "value": data_time_between_measurement_sec * 10, "unit": "minutes" },
            "redundancy": data_repetition,
            "humidity": { "value": mesure, "unit": "%RH" },

        }
        return data;
    }

    function productStatusDataOutput(stringHex) {
        var data_hw_version = (parseInt(stringHex.substring(4, 6), 16)) & 0xFF;
        var data_sw_version = (parseInt(stringHex.substring(6, 8), 16)) & 0xFF;
        var data_power_source = (parseInt(stringHex.substring(8, 10), 16) >> 6) & 0x07;
        var data_battery_voltage = (parseInt(stringHex.substring(8, 11), 16)) & 0x3FF;
        var data_battery_level = (parseInt(stringHex.substring(10, 12), 16) >> 1) & 0x07;
        var data_hw_status = (parseInt(stringHex.substring(10, 12), 16)) & 0x01;
        var data_hw_status_SD = (parseInt(stringHex.substring(12, 13), 16) >> 1) & 0x07;
        var data_hw_status_screen = (parseInt(stringHex.substring(12, 14), 16) >> 2) & 0x07;
        var data_activation_time = (parseInt(stringHex.substring(13, 16), 16)) & 0x3FF;
        var data_co2_last_manual_calibration_time = (parseInt(stringHex.substring(16, 18), 16));
        var data_hw_status_anti_tear = (parseInt(stringHex.substring(18, 19), 16) >> 2) & 0x3;
        var data_low_threshold_batterie = (parseInt(stringHex.substring(18, 21), 16) >> 2) & 0xFF;


        data = {
            "typeOfProduct": typeOfProduct(octetTypeProduit),
            "typeOfMessage": typeOfMessage(octetTypeMessage),
            "hardwareVersion": data_hw_version,
            "softwareVersion": data_sw_version,
            "powerSource": powerSource(data_power_source),
            "batteryVoltage": batteryVoltage(data_battery_voltage),
            "batteryLevel": batterieLevelArgument(data_battery_level),
            "statusProduct": productHwStatusArgument(data_hw_status),
            "statusSdCard": sdStatusArgument(data_hw_status_SD),
            "statusScreen": screenStatusArgument(data_hw_status_screen),
            "timeActivation": productActivationTimeCounter(data_activation_time),
            "timeCo2LastCalibration": { "value": data_co2_last_manual_calibration_time, "unit": "days" },
            "lowBatterieThreshold": lowBatterieThreshold(data_low_threshold_batterie),
            "statusAntiTear": antiTearArgument(data_hw_status_anti_tear)
        };
        return data;
    }

    function productConfigurationDataOutput(stringHex) {
        var data_config_source = (parseInt(stringHex.substring(4, 5), 16) >> 1) & 0x07;
        var data_config_status = (parseInt(stringHex.substring(4, 6), 16) >> 3) & 0x03;
        var data_periode_mesure = (parseInt(stringHex.substring(5, 7), 16) >> 2) & 0x1F;
        var data_sensor_on_off_co2 = (parseInt(stringHex.substring(6, 7), 16) >> 1) & 0x01;
        var data_sensor_on_off_cov = (parseInt(stringHex.substring(6, 7), 16)) & 0x01;
        var data_sensor_on_off_pir = (parseInt(stringHex.substring(7, 8), 16) >> 3) & 0x01;
        var data_sensor_on_off_microphone = (parseInt(stringHex.substring(7, 8), 16) >> 2) & 0x01;
        var data_sd_storage_on_off = (parseInt(stringHex.substring(7, 8), 16) >> 1) & 0x01;
        var data_co2_auto_calibration = (parseInt(stringHex.substring(7, 8), 16)) & 0x01;
        var data_co2_medium_level = (parseInt(stringHex.substring(8, 11), 16) >> 2) & 0x3FF;
        var data_co2_high_level = (parseInt(stringHex.substring(10, 13), 16)) & 0x3FF;
        var data_led_on_off = (parseInt(stringHex.substring(13, 14), 16) >> 3) & 0x01;
        var data_led_orange_on_off = (parseInt(stringHex.substring(13, 14), 16) >> 2) & 0x01;
        var data_buzzer_on_off = (parseInt(stringHex.substring(13, 14), 16) >> 1) & 0x01;
        var data_buzzer_confirm_on_off = (parseInt(stringHex.substring(13, 14), 16)) & 0x01;
        var data_led_source = (parseInt(stringHex.substring(14, 15), 16) >> 2) & 0x03;
        var data_button_on_off = (parseInt(stringHex.substring(14, 15), 16) >> 1) & 0x01;
        var data_lora_region = (parseInt(stringHex.substring(14, 16), 16) >> 1) & 0x0F;
        var data_periodic_tx_on_off = (parseInt(stringHex.substring(15, 16), 16)) & 0x01;
        var data_periodic_tx_period = (parseInt(stringHex.substring(16, 18), 16) >> 2) & 0x3F;
        var data_periodic_delta_co2 = (parseInt(stringHex.substring(17, 20), 16) >> 2) & 0xFF;
        var data_periodic_delta_temp = (parseInt(stringHex.substring(19, 22), 16) >> 3) & 0x7F;
        var data_datalog_co2_on_off = (parseInt(stringHex.substring(21, 22), 16) >> 2) & 0x01;
        var data_datalog_temperature_on_off = (parseInt(stringHex.substring(21, 22), 16) >> 1) & 0x01;
        var data_datalog_new_measure = (parseInt(stringHex.substring(21, 24), 16) >> 3) & 0x3F;
        var data_datalog_repetition = (parseInt(stringHex.substring(23, 25), 16) >> 2) & 0x1F;
        var data_datalog_tx_period = (parseInt(stringHex.substring(24, 27), 16) >> 2) & 0xFF;
        var data_pending_join = (parseInt(stringHex.substring(26, 27), 16) >> 1) & 0x01;
        var data_nfc_status = (parseInt(stringHex.substring(26, 28), 16) >> 3) & 0x03;
        var data_date_produit_annee = (parseInt(stringHex.substring(27, 29), 16) >> 1) & 0x3F;
        var data_date_produit_mois = (parseInt(stringHex.substring(28, 30), 16) >> 1) & 0x0F;
        var data_date_produit_jour = (parseInt(stringHex.substring(29, 31), 16)) & 0x1F;
        var data_date_produit_heure = (parseInt(stringHex.substring(31, 33), 16) >> 3) & 0x1F;
        var data_date_produit_minute = (parseInt(stringHex.substring(32, 34), 16) >> 1) & 0x3F;
        var data_datalog_humidity_on_off = (parseInt(stringHex.substring(33, 34), 16)) & 0x01;

        var data_downlink_fnct = (parseInt(stringHex.substring(34, 38), 16)) & 0xFFFF;
        var data_sensor_on_off_pm = (parseInt(stringHex.substring(38, 39), 16) >> 3) & 0x01;
        var data_sensor_on_off_formaldehyde = (parseInt(stringHex.substring(38, 39), 16) >> 2) & 0x01;
        var data_presence_alerte_on_off = (parseInt(stringHex.substring(38, 39), 16) >> 1) & 0x01;
        var data_period_without_presence_alerte = (parseInt(stringHex.substring(38, 40), 16)) & 0x3F;


        data = {
            "typeOfProduct": typeOfProduct(octetTypeProduit),
            "typeOfMessage": typeOfMessage(octetTypeMessage),
            "reconfigurationSource": reconfigurationSource(data_config_source),
            "reconfigurationStatus": reconfigurationState(data_config_status),
            "periodMeasure": period(data_periode_mesure),
            "enableCo2": sensorActivation(data_sensor_on_off_co2),
            "enableVoc": sensorActivation(data_sensor_on_off_cov),
            "enablePm": sensorActivation(data_sensor_on_off_pm),
            "enableFormaldehyde": sensorActivation(data_sensor_on_off_formaldehyde),
            "enableMotion": sensorActivation(data_sensor_on_off_pir),
            "enableMicrophone": sensorActivation(data_sensor_on_off_microphone),
            "enableSd": sdActivation(data_sd_storage_on_off),
            "enableAutomaticCo2Calibration": calibrationActivation(data_co2_auto_calibration),
            "thresholdCo2Medium": co2Threshold(data_co2_medium_level),
            "thresholdCo2High": co2Threshold(data_co2_high_level),
            "enableLedCo2": active(data_led_on_off),
            "enableLedMediumLevel": active(data_led_orange_on_off),
            "enableBuzzer": active(data_buzzer_on_off),
            "enableBuzzerConfirmation": active(data_buzzer_confirm_on_off),
            "sourceLedNotification": notificationByLEDandBuzzer(data_led_source),
            "enableButtonPressNotification": active(data_button_on_off),
            "protocalAndRegion": loraRegion(data_lora_region),
            "enablePeriodicData": active(data_periodic_tx_on_off),
            "periodPeriodicTransmission": period(data_periodic_tx_period),
            "deltaCo2": deltaCO2(data_periodic_delta_co2),
            "deltaTemperature": deltaTemp(data_periodic_delta_temp),
            "enableDatalogCo2": active(data_datalog_co2_on_off),
            "enableDatalogTemperature": active(data_datalog_temperature_on_off),
            "enableDatalogHumidity": active(data_datalog_humidity_on_off),
            "datalogNewValues": data_datalog_new_measure,
            "datalogRepeatValues": data_datalog_repetition,
            "periodDatalogTransmission": transmissionPeriodHistorical(data_datalog_tx_period),
            "enableRoomPresence": active(data_presence_alerte_on_off),
            "periodWithoutMotion": period(data_period_without_presence_alerte),
            "pendingJoin": pendingJoin(data_pending_join),
            "enableNfcDiscover": nfcStatus(data_nfc_status),
            "dateYear": { "value": data_date_produit_annee, "unit": "year" },
            "dateMonth": { "value": data_date_produit_mois, "unit": "month" },
            "dateDay": { "value": data_date_produit_jour, "unit": "day" },
            "dateHour": { "value": data_date_produit_heure, "unit": "hours" },
            "dateMinute": { "value": data_date_produit_minute, "unit": "minutes" },
            "downlinkFunction": data_downlink_fnct
        };
        return data;
    }

    function productScreenConfigurationDataOutput(stringHex) {
        var data_config_source = (parseInt(stringHex.substring(4, 5), 16) >> 1) & 0x07;
        var data_config_status = (parseInt(stringHex.substring(4, 6), 16) >> 3) & 0x03;
        var data_screen_on_off = (parseInt(stringHex.substring(5, 6), 16) >> 2) & 0x01;
        var data_screen_language = (parseInt(stringHex.substring(5, 7), 16) >> 2) & 0x0F;
        var data_temperature_unit = (parseInt(stringHex.substring(6, 7), 16)) & 0x03;
        var data_main_screen = (parseInt(stringHex.substring(8, 10), 16)) & 0xFF;
        var data_screen_after_one_push = (parseInt(stringHex.substring(10, 12), 16)) & 0xFF;
        var data_screen_after_two_push = (parseInt(stringHex.substring(12, 14), 16)) & 0xFF;
        var data_screen_after_three_push = (parseInt(stringHex.substring(14, 16), 16)) & 0xFF;
        var data_screen_after_four_push = (parseInt(stringHex.substring(16, 18), 16)) & 0xFF;
        var data_screen_after_five_push = (parseInt(stringHex.substring(18, 20), 16)) & 0xFF;
        var data_first_polluant = (parseInt(stringHex.substring(20, 21), 16)) & 0x0F;
        var data_second_polluant = (parseInt(stringHex.substring(21, 22), 16)) & 0x0F;
        var data_third_polluant = (parseInt(stringHex.substring(22, 23), 16)) & 0x0F;
        var data_fourth_polluant = (parseInt(stringHex.substring(23, 24), 16)) & 0x0F;
        var data_fifth_polluant = (parseInt(stringHex.substring(24, 25), 16)) & 0x0F;
        var data_sixth_polluant = (parseInt(stringHex.substring(25, 26), 16)) & 0x0F;
        var data_seventh_polluant = (parseInt(stringHex.substring(26, 27), 16)) & 0x0F;
        var data_refreshing_period = (parseInt(stringHex.substring(27, 29), 16) >> 3) & 0x0F;
        var data_downlink_fnct = (parseInt(stringHex.substring(28, 32), 16) >> 3) & 0xFFFF;

        data = {
            "typeOfProduct": typeOfProduct(octetTypeProduit),
            "typeOfMessage": typeOfMessage(octetTypeMessage),
            "reconfigurationSource": reconfigurationSource(data_config_source),
            "reconfigurationStatus": reconfigurationState(data_config_status),
            "enableDisplay": active(data_screen_on_off),
            "displayLanguage": screenLanguage(data_screen_language),
            "unitTemperature": temperatureUnit(data_temperature_unit),
            "screenIndex1": activatedScreen(data_main_screen),
            "screenIndex2": activatedScreen(data_screen_after_one_push),
            "screenIndex3": activatedScreen(data_screen_after_two_push),
            "screenIndex4": activatedScreen(data_screen_after_three_push),
            "screenIndex5": activatedScreen(data_screen_after_four_push),
            "screenIndex6": activatedScreen(data_screen_after_five_push),
            "priorityMeasure1": priorityPolluant(data_first_polluant),
            "priorityMeasure2": priorityPolluant(data_second_polluant),
            "priorityMeasure3": priorityPolluant(data_third_polluant),
            "priorityMeasure4": priorityPolluant(data_fourth_polluant),
            "priorityMeasure5": priorityPolluant(data_fifth_polluant),
            "priorityMeasure6": priorityPolluant(data_sixth_polluant),
            "priorityMeasure7": priorityPolluant(data_seventh_polluant),
            "periodDisplayRefresh": period(data_refreshing_period),
            "downlinkFunction": data_downlink_fnct
        }
        return data;
    }

    function presenceAlertDataOutput(stringHex) {
        var data_presence = (parseInt(stringHex.substring(4, 5), 16) >> 3) & 0x01;

        data = {
            "typeOfProduct": typeOfProduct(octetTypeProduit),
            "typeOfMessage": typeOfMessage(octetTypeMessage),
            "presence": presence(data_presence)
        }
        return data;
    }
} // end of decoder

