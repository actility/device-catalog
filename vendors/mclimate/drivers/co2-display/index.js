function decodeUplink(input) {
    try {
        var bytes = input.bytes;
        var data = {};
        function toBool(value){
            return value == '1';
        }
        function calculateTemperature(rawData){
            return (rawData - 400) / 10;
        }
        function calculateHumidity(rawData){
            return (rawData * 100) / 256;
        }
        function decbin(number) {
            if (number < 0) {
                number = 0xFFFFFFFF + number + 1
            }
            number = number.toString(2);
            return "00000000".substr(number.length) + number;
        }
        function handleKeepalive(bytes, data) {
            var tempDec = (bytes[1] << 8) | bytes[2];
            var temperatureValue = calculateTemperature(tempDec);
            var humidityValue = calculateHumidity(bytes[3]);
            var batteryVoltageCalculated = ((bytes[4] << 8) | bytes[5]) / 1000;
            var temperature = temperatureValue;
            var humidity = humidityValue;
            var batteryVoltage = batteryVoltageCalculated;
            var co2Low = bytes[6]; // CO2 value in ppm, bits 7:0
            var co2High = (bytes[7] & 0xF8) >> 3; // CO2 value in ppm, bits 12:8 (bits 7:3 of byte 7)
            var ppm = (co2High << 8) | co2Low;
            var powerSourceStatus = bytes[7] & 0x07; // Last 3 bits of byte 7
            var lux = (bytes[8] << 8) | bytes[9];
            var pir = toBool(bytes[10]);
            data.sensorTemperature = Number(temperature.toFixed(2));
            data.relativeHumidity = Number(humidity.toFixed(2));
            data.batteryVoltage = Number(batteryVoltage.toFixed(2));
            data.CO2 = ppm;
            data.powerSourceStatus = powerSourceStatus;
            data.lux = lux;
            data.pir = pir;
            return data;
        }

        function handleResponse(bytes, data) {
            var commands = bytes.map(function (byte) {
                return ("0" + byte.toString(16)).substr(-2);
            });
            // The CO2 Display keepalive is 11 bytes long.
            commands = commands.slice(0, -11);
            var command_len = 0;

            commands.map(function (command, i) {
                switch (command) {
                    case '04':
                        {
                            command_len = 2;
                            var hardwareVersion = commands[i + 1];
                            var softwareVersion = commands[i + 2];
                            data.deviceVersions = { hardware: Number(hardwareVersion), software: Number(softwareVersion) };
                        }
                        break;
                    case '12':
                        {
                            command_len = 1;
                            data.keepAliveTime = parseInt(commands[i + 1], 16);
                        }
                        break;
                    case '14':
                        {
                            command_len = 1;
                            data.childLock = toBool(parseInt(commands[i + 1], 16));
                        }
                        break;
                    case '19':
                        {
                            command_len = 1;
                            var commandResponse = parseInt(commands[i + 1], 16);
                            var periodInMinutes = commandResponse * 5 / 60;
                            data.joinRetryPeriod = periodInMinutes;
                        }
                        break;
                    case '1b':
                        {
                            command_len = 1;
                            data.uplinkType = parseInt(commands[i + 1], 16);
                        }
                        break;
                    case '1d':
                        {
                            command_len = 2;
                            var wdpC = commands[i + 1] == '00' ? false : parseInt(commands[i + 1], 16);
                            var wdpUc = commands[i + 2] == '00' ? false : parseInt(commands[i + 2], 16);
                            data.watchDogParams = { wdpC: wdpC, wdpUc: wdpUc };
                        }
                        break;
                    case '1f':
                        {
                            command_len = 4;
                            var good_medium =  (parseInt(commands[i + 1], 16) << 8) | 
                            parseInt(commands[i + 2], 16);
                            var medium_bad =  (parseInt(commands[i + 3], 16) << 8) | 
                            parseInt(commands[i + 4], 16);
                            
                            data.boundaryLevels = { good_medium: Number(good_medium), medium_bad: Number(medium_bad) } ;
                        }
                        break;
                    case '21':
                        {
                            command_len = 2;
                            data.autoZeroValue = (parseInt(commands[i + 1], 16) << 8) | 
                            parseInt(commands[i + 2], 16);
                        }
                        break;
                    case '25':
                        {

                            command_len = 3;
                            var good_zone = parseInt(commands[i + 1], 16);
                            var medium_zone = parseInt(commands[i + 2], 16);
                            var bad_zone = parseInt(commands[i + 3], 16);

                            data.measurementPeriod = { good_zone: Number(good_zone), medium_zone: Number(medium_zone), bad_zone: Number(bad_zone) };
                        }
                        break;
                    case '2b':
                        {
                            command_len = 1;
                            data.autoZeroPeriod = parseInt(commands[i + 1], 16);
                        }
                        break;
                    case '34':
                        {
                            command_len = 1;
                            data.displayRefreshPeriod = parseInt(commands[i + 1], 16);
                        }
                        break;
                    case '3d':
                        {
                            command_len = 1;
                            data.pirSensorStatus = parseInt(commands[i + 1], 16);
                        }
                        break;
                    case '3f':
                        {
                            command_len = 1;
                            data.pirSensorSensitivity = parseInt(commands[i + 1], 16);
                        }
                        break;
                    case '41':
                        {
                            command_len = 1;
                            data.currentTemperatureVisibility = parseInt(commands[i + 1], 16);
                        }
                        break;
                    case '43':
                        {
                            command_len = 1;
                            data.humidityVisibility = parseInt(commands[i + 1], 16);
                        }
                        break;
                    case '45':
                        {
                            command_len = 1;
                            data.lightIntensityVisibility = parseInt(commands[i + 1], 16);
                        }
                        break;
                    case '47':
                        {
                            command_len = 1;
                            data.pirInitPeriod = parseInt(commands[i + 1], 16);
                        }
                        break;
                    case '49':
                        {
                            command_len = 1;
                            data.pirMeasurementPeriod = parseInt(commands[i + 1], 16);
                        }
                        break;
                    case '4b':
                        {
                            command_len = 2;
                            data.pirCheckPeriod = (parseInt(commands[i + 1], 16) << 8) | parseInt(commands[i + 2], 16);
                        }
                        break;
                    case '4d':
                        {
                            command_len = 2;
                            data.pirBlindPeriod = (parseInt(commands[i + 1], 16) << 8) | parseInt(commands[i + 2], 16);
                        }
                        break;
                    case 'a4':
                        {
                            command_len = 1;
                            data.region = parseInt(commands[i + 1], 16);
                        }
                        break;
                    case '80':
                        {
                            command_len = 1;
                            data.measurementBlindTime = parseInt(commands[i + 1], 16);
                        }
                        break;
                    case '83':
                        {
                            command_len = 1;
                            var bin = decbin(parseInt(commands[i + 1], 16));
                            var chart = Number(bin[5]);
                            var digital_value = Number(bin[6]);
                            var emoji = Number(bin[7]);
                            data.imagesVisibility ={ chart: chart, digital_value: digital_value, emoji: emoji };
                        }
                        break;
                    case 'a0': {
                        command_len = 4;
                        var fuota_address = (parseInt(commands[i + 1], 16) << 24) | 
                                            (parseInt(commands[i + 2], 16) << 16) | 
                                            (parseInt(commands[i + 3], 16) << 8) | 
                                            parseInt(commands[i + 4], 16);
                        var fuota_address_raw = commands[i + 1] + commands[i + 2] + 
                                                commands[i + 3] + commands[i + 4];
                        
                        data.fuota = { fuota_address: fuota_address, fuota_address_raw: fuota_address_raw };
                        break;
                    }
                    default:
                        break;
                }
                commands.splice(i, command_len);
            });
            return data;
        }
        if (bytes[0] == 1) {
            data = handleKeepalive(bytes, data);
        } else {
            data = handleResponse(bytes, data);
            bytes = bytes.slice(-11);
            data = handleKeepalive(bytes, data);
        }
        return { data: data, errors: [], warnings: [] };
    } catch (e) {
        return { data: {}, errors: ['Unhandled data'], warnings: [] };
    }
}

function encodeDownlink(input) {
    var bytes = [];
    var data = (input && input.data) ? input.data : {};
    var key, i;

    function pushUInt16(value) {
        bytes.push((value >> 8) & 0xff);
        bytes.push(value & 0xff);
    }

    for (key in data) {
        if (data.hasOwnProperty(key)) {
            switch (key) {
                // ---- general commands ----
                case "setKeepAlive":
                    bytes.push(0x02);
                    bytes.push(data.setKeepAlive);
                    break;
                case "getKeepAliveTime":
                    bytes.push(0x12);
                    break;
                case "getDeviceVersions":
                    bytes.push(0x04);
                    break;
                case "setJoinRetryPeriod":
                    bytes.push(0x10);
                    bytes.push(Math.floor((data.setJoinRetryPeriod * 60) / 5));
                    break;
                case "getJoinRetryPeriod":
                    bytes.push(0x19);
                    break;
                case "setUplinkType":
                    bytes.push(0x11);
                    bytes.push(data.setUplinkType);
                    break;
                case "getUplinkType":
                    bytes.push(0x1b);
                    break;
                case "setWatchDogParams":
                    bytes.push(0x1c);
                    bytes.push(data.setWatchDogParams.confirmedUplinks);
                    bytes.push(data.setWatchDogParams.unconfirmedUplinks);
                    break;
                case "getWatchDogParams":
                    bytes.push(0x1d);
                    break;
                case "getRegion":
                    bytes.push(0xa4);
                    break;
                // ---- child lock ----
                case "setChildLock":
                    bytes.push(0x07);
                    bytes.push(data.setChildLock ? 0x01 : 0x00);
                    break;
                case "getChildLock":
                    bytes.push(0x14);
                    break;
                // ---- CO2 sensor commands (notify period, buzzer and LED are not
                // available on the display variants) ----
                case "setCo2BoundaryLevels":
                    bytes.push(0x1e);
                    pushUInt16(data.setCo2BoundaryLevels.good_medium);
                    pushUInt16(data.setCo2BoundaryLevels.medium_bad);
                    break;
                case "getCo2BoundaryLevels":
                    bytes.push(0x1f);
                    break;
                case "setCo2AutoZeroValue":
                    bytes.push(0x20);
                    pushUInt16(data.setCo2AutoZeroValue);
                    break;
                case "getCo2AutoZeroValue":
                    bytes.push(0x21);
                    break;
                case "setCo2MeasurementPeriod":
                    bytes.push(0x24);
                    bytes.push(data.setCo2MeasurementPeriod.good_zone);
                    bytes.push(data.setCo2MeasurementPeriod.medium_zone);
                    bytes.push(data.setCo2MeasurementPeriod.bad_zone);
                    break;
                case "getCo2MeasurementPeriod":
                    bytes.push(0x25);
                    break;
                case "setCo2AutoZeroPeriod":
                    bytes.push(0x2a);
                    bytes.push(data.setCo2AutoZeroPeriod);
                    break;
                case "getCo2AutoZeroPeriod":
                    bytes.push(0x2b);
                    break;
                // ---- display commands ----
                case "setDisplayRefreshPeriod":
                    bytes.push(0x33);
                    bytes.push(data.setDisplayRefreshPeriod);
                    break;
                case "getDisplayRefreshPeriod":
                    bytes.push(0x34);
                    break;
                case "setDeepSleepMode":
                    bytes.push(0x3b);
                    bytes.push(data.setDeepSleepMode);
                    break;
                case "setCurrentTemperatureVisibility":
                    bytes.push(0x40);
                    bytes.push(data.setCurrentTemperatureVisibility);
                    break;
                case "getCurrentTemperatureVisibility":
                    bytes.push(0x41);
                    break;
                case "setHumidityVisibility":
                    bytes.push(0x42);
                    bytes.push(data.setHumidityVisibility);
                    break;
                case "getHumidityVisibility":
                    bytes.push(0x43);
                    break;
                case "setLightIntensityVisibility":
                    bytes.push(0x44);
                    bytes.push(data.setLightIntensityVisibility);
                    break;
                case "getLightIntensityVisibility":
                    bytes.push(0x45);
                    break;
                case "getCo2ImagesVisibility":
                    bytes.push(0x83);
                    break;
                case "setCo2ImagesVisibility":
                    // bit 2 chart, bit 1 digital value, bit 0 emoji
                    bytes.push(0x82);
                    bytes.push((data.setCo2ImagesVisibility.chart ? 0x04 : 0x00) |
                        (data.setCo2ImagesVisibility.digital_value ? 0x02 : 0x00) |
                        (data.setCo2ImagesVisibility.emoji ? 0x01 : 0x00));
                    break;
                case "setCo2MeasurementBlindTime":
                    bytes.push(0x81);
                    bytes.push(data.setCo2MeasurementBlindTime);
                    break;
                case "getCo2MeasurementBlindTime":
                    bytes.push(0x80);
                    break;
                // ---- PIR commands ----
                case "setPIRSensorStatus":
                    bytes.push(0x3c);
                    bytes.push(data.setPIRSensorStatus);
                    break;
                case "getPIRSensorStatus":
                    bytes.push(0x3d);
                    break;
                case "setPIRSensorSensitivity":
                    bytes.push(0x3e);
                    bytes.push(data.setPIRSensorSensitivity);
                    break;
                case "getPIRSensorSensitivity":
                    bytes.push(0x3f);
                    break;
                case "setPIRInitPeriod":
                    bytes.push(0x46);
                    bytes.push(data.setPIRInitPeriod);
                    break;
                case "getPIRInitPeriod":
                    bytes.push(0x47);
                    break;
                case "setPIRMeasurementPeriod":
                    bytes.push(0x48);
                    bytes.push(data.setPIRMeasurementPeriod);
                    break;
                case "getPIRMeasurementPeriod":
                    bytes.push(0x49);
                    break;
                case "setPIRCheckPeriod":
                    // Transmitted as two bytes.
                    bytes.push(0x4a);
                    pushUInt16(data.setPIRCheckPeriod);
                    break;
                case "getPIRCheckPeriod":
                    bytes.push(0x4b);
                    break;
                case "setPIRBlindPeriod":
                    // Transmitted as two bytes.
                    bytes.push(0x4c);
                    pushUInt16(data.setPIRBlindPeriod);
                    break;
                case "getPIRBlindPeriod":
                    bytes.push(0x4d);
                    break;
                case "sendCustomHexCommand":
                    for (i = 0; i < data.sendCustomHexCommand.length; i += 2) {
                        bytes.push(parseInt(data.sendCustomHexCommand.substr(i, 2), 16));
                    }
                    break;
                default:
                    break;
            }
        }
    }

    return {
        bytes: bytes,
        fPort: 1,
        warnings: [],
        errors: []
    };
}

function decodeDownlink(input) {
    return {
        data: { bytes: input.bytes },
        errors: [],
        warnings: []
    };
}

// Example downlink commands
// {"setKeepAlive":10} --> 020A
// {"setCo2BoundaryLevels":{"good_medium":600,"medium_bad":1000}} --> 1E025803E8
// {"setPIRCheckPeriod":60} --> 4A003C
// {"setCo2ImagesVisibility":{"chart":true,"digital_value":true,"emoji":false}} --> 8206
// {"getChildLock":true} --> 14

exports.decodeUplink = decodeUplink;
exports.encodeDownlink = encodeDownlink;
exports.decodeDownlink = decodeDownlink;
