var KEEPALIVE_BYTE_LEN = 7;

function decodeUplink(input) {
    try {
        var bytes = input.bytes;
        var data = {};

        if (!bytes || bytes.length < KEEPALIVE_BYTE_LEN) {
            throw new Error('payload must be at least ' + KEEPALIVE_BYTE_LEN + ' bytes long');
        }

        function calculateTemperature (rawData) { return (rawData - 400) / 10;}
        function calculateHumidity (rawData) { return (rawData * 100) / 256;}
        function calculateVoltage (rawData) { return ((rawData * 8) + 1600) / 1000;}

        function handleKeepalive(bytes, data) {
            data.CO2 = (bytes[1] << 8) | bytes[2];

            var temperatureRaw = (bytes[3] << 8) | bytes[4];
            data.sensorTemperature = Number(calculateTemperature(temperatureRaw).toFixed(2));

            data.relativeHumidity = Number(calculateHumidity(bytes[5]).toFixed(2));

            data.batteryVoltage = Number(calculateVoltage(bytes[6]).toFixed(2));
            return data;
        }

        function handleResponse(bytes, data) {
            var commands = bytes.map(function (byte) {
                return ("0" + byte.toString(16)).substr(-2);
            });
            commands = commands.slice(0, -KEEPALIVE_BYTE_LEN);
            var command_len = 0;

            commands.forEach(function (command, i) {
                switch (command) {
                    case '04':
                        command_len = 2;
                        data.deviceVersions = {
                            hardware: Number(commands[i + 1]),
                            software: Number(commands[i + 2])
                        };
                        break;
                    case '12':
                        command_len = 1;
                        data.keepAliveTime = parseInt(commands[i + 1], 16);
                        break;
                    case '19':
                        command_len = 1;
                        var commandResponse = parseInt(commands[i + 1], 16);
                        data.joinRetryPeriod = (commandResponse * 5) / 60;
                        break;
                    case '1b':
                        command_len = 1;
                        data.uplinkType = parseInt(commands[i + 1], 16);
                        break;
                    case '1d':
                        command_len = 2;
                        data.watchDogParams = {
                            wdpC: commands[i + 1] === '00' ? false : parseInt(commands[i + 1], 16),
                            wdpUc: commands[i + 2] === '00' ? false : parseInt(commands[i + 2], 16)
                        };
                        break;
                    case '1f':
                        command_len = 4;
                        data.boundaryLevels = {
                            good_medium: parseInt(commands[i + 1] + commands[i + 2], 16),
                            medium_bad: parseInt(commands[i + 3] + commands[i + 4], 16)
                        };
                        break;
                    case '21':
                        command_len = 2;
                        data.autoZeroValue = parseInt(commands[i + 1] + commands[i + 2], 16);
                        break;
                    case '25':
                        command_len = 3;
                        data.measurementPeriod = {
                            good_zone: parseInt(commands[i + 1], 16),
                            medium_zone: parseInt(commands[i + 2], 16),
                            bad_zone: parseInt(commands[i + 3], 16)
                        };
                        break;
                    case '27':
                        command_len = 9;
                        data.buzzerNotification = {
                            duration_good_beeping: parseInt(commands[i + 1], 16),
                            duration_good_loud: parseInt(commands[i + 2], 16) * 10,
                            duration_good_silent: parseInt(commands[i + 3], 16) * 10,
                            duration_medium_beeping: parseInt(commands[i + 4], 16),
                            duration_medium_loud: parseInt(commands[i + 5], 16) * 10,
                            duration_medium_silent: parseInt(commands[i + 6], 16) * 10,
                            duration_bad_beeping: parseInt(commands[i + 7], 16),
                            duration_bad_loud: parseInt(commands[i + 8], 16) * 10,
                            duration_bad_silent: parseInt(commands[i + 9], 16) * 10
                        };
                        break;
                    case '29':
                        command_len = 15;
                        data.ledNotification = {
                            red_good: parseInt(commands[i + 1], 16),
                            green_good: parseInt(commands[i + 2], 16),
                            blue_good: parseInt(commands[i + 3], 16),
                            duration_good: parseInt(commands[i + 4] + commands[i + 5], 16) * 10,
                            red_medium: parseInt(commands[i + 6], 16),
                            green_medium: parseInt(commands[i + 7], 16),
                            blue_medium: parseInt(commands[i + 8], 16),
                            duration_medium: parseInt(commands[i + 9] + commands[i + 10], 16) * 10,
                            red_bad: parseInt(commands[i + 11], 16),
                            green_bad: parseInt(commands[i + 12], 16),
                            blue_bad: parseInt(commands[i + 13], 16),
                            duration_bad: parseInt(commands[i + 14] + commands[i + 15], 16) * 10
                        };
                        break;
                    case '2b':
                        command_len = 1;
                        data.autoZeroPeriod = parseInt(commands[i + 1], 16);
                        break;
                    case '23':
                        command_len = 3;
                        data.notifyPeriod = {
                            good_zone: parseInt(commands[i + 1], 16),
                            medium_zone: parseInt(commands[i + 2], 16),
                            bad_zone: parseInt(commands[i + 3], 16)
                        };
                        break;
                    case 'a0':
                        command_len = 4;
                        data.fuota = {
                            fuota_address: (parseInt(commands[i + 1], 16) << 24) |
                                (parseInt(commands[i + 2], 16) << 16) |
                                (parseInt(commands[i + 3], 16) << 8) |
                                parseInt(commands[i + 4], 16),
                            fuota_address_raw: commands[i + 1] + commands[i + 2] +
                                commands[i + 3] + commands[i + 4]
                        };
                        break;
                    case 'a4':
                        command_len = 1;
                        data.region = parseInt(commands[i + 1], 16);
                        break;
                    case 'a6':
                        command_len = 1;
                        data.crystalOscillatorError = true;
                        break;
                    default:
                        command_len = 0;
                        break;
                }
                commands.splice(i, command_len);
            });
            return data;
        }

        if (bytes[0] === 1) {
            data = handleKeepalive(bytes, data);
        } else {
            data = handleResponse(bytes, data);
            data = handleKeepalive(bytes.slice(-KEEPALIVE_BYTE_LEN), data);
        }

        return { data: data };
    } catch (e) {
        return { errors: ['Invalid uplink payload: ' + e.message], warnings: [] };
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
                // ---- CO2 sensor commands ----
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
                case "setNotifyPeriod":
                    bytes.push(0x22);
                    bytes.push(data.setNotifyPeriod.good_zone);
                    bytes.push(data.setNotifyPeriod.medium_zone);
                    bytes.push(data.setNotifyPeriod.bad_zone);
                    break;
                case "getNotifyPeriod":
                    bytes.push(0x23);
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
                case "setBuzzerNotification":
                    // Loud and silent durations are transmitted in steps of 10.
                    bytes.push(0x26);
                    bytes.push(data.setBuzzerNotification.duration_good_beeping);
                    bytes.push(Math.round(data.setBuzzerNotification.duration_good_loud / 10));
                    bytes.push(Math.round(data.setBuzzerNotification.duration_good_silent / 10));
                    bytes.push(data.setBuzzerNotification.duration_medium_beeping);
                    bytes.push(Math.round(data.setBuzzerNotification.duration_medium_loud / 10));
                    bytes.push(Math.round(data.setBuzzerNotification.duration_medium_silent / 10));
                    bytes.push(data.setBuzzerNotification.duration_bad_beeping);
                    bytes.push(Math.round(data.setBuzzerNotification.duration_bad_loud / 10));
                    bytes.push(Math.round(data.setBuzzerNotification.duration_bad_silent / 10));
                    break;
                case "getBuzzerNotification":
                    bytes.push(0x27);
                    break;
                case "setCo2Led":
                    // Each zone: red, green, blue and a two byte duration in steps of 10.
                    bytes.push(0x28);
                    bytes.push(data.setCo2Led.red_good);
                    bytes.push(data.setCo2Led.green_good);
                    bytes.push(data.setCo2Led.blue_good);
                    pushUInt16(Math.round(data.setCo2Led.duration_good / 10));
                    bytes.push(data.setCo2Led.red_medium);
                    bytes.push(data.setCo2Led.green_medium);
                    bytes.push(data.setCo2Led.blue_medium);
                    pushUInt16(Math.round(data.setCo2Led.duration_medium / 10));
                    bytes.push(data.setCo2Led.red_bad);
                    bytes.push(data.setCo2Led.green_bad);
                    bytes.push(data.setCo2Led.blue_bad);
                    pushUInt16(Math.round(data.setCo2Led.duration_bad / 10));
                    break;
                case "getCo2Led":
                    bytes.push(0x29);
                    break;
                case "setCo2AutoZeroPeriod":
                    bytes.push(0x2a);
                    bytes.push(data.setCo2AutoZeroPeriod);
                    break;
                case "getCo2AutoZeroPeriod":
                    bytes.push(0x2b);
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
        warnings: [],
        errors: []
    };
}

// Example downlink commands
// {"setKeepAlive":10} --> 020A
// {"setCo2BoundaryLevels":{"good_medium":600,"medium_bad":1000}} --> 1E025803E8
// {"setCo2AutoZeroPeriod":24} --> 2A18
// {"getCo2BoundaryLevels":true} --> 1F

exports.decodeUplink = decodeUplink;
exports.encodeDownlink = encodeDownlink;
exports.decodeDownlink = decodeDownlink;
