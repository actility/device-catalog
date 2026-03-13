// The Things Industries / Main
function decodeUplink(input) {
    try {
        var bytes = input.bytes;
        var data = {};

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
            commands = commands.slice(0, -7);
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
                    default:
                        throw new Error('Unhandled data');
                }
                commands.splice(i, command_len);
            });
            return data;
        }

        if (bytes[0] === 1) {
            data = handleKeepalive(bytes, data);
        } else {
            data = handleResponse(bytes, data);
            bytes = bytes.slice(-7);
            data = handleKeepalive(bytes, data);
        }

        return { data: data };
    } catch (e) {
        throw new Error(e);
    }
}

exports.decodeUplink = decodeUplink;
