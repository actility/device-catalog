var KEEPALIVE_BYTE_LEN = 10;

function decodeUplink(input) {
    var bytes = input.bytes;
    var data = {};

    var toBinary = function (byteValues) {
        return byteValues.map(function (byte) {
            var number = byte.toString(2);
            return "00000000".substr(number.length) + number;
        });
    };

    function handleKeepalive(byteValues, data) {
        var byteArray = toBinary(byteValues);
        var sAQI1 = byteArray[1].substr(0);
        var sAQI2 = byteArray[2].slice(0, 1);
        var p1 = byteArray[6];
        var p2 = byteArray[7].slice(0, 3);
        var t1 = byteArray[7].substr(4);
        var t2 = byteArray[8].slice(0, 6);

        data.sAQI = parseInt('' + sAQI1 + sAQI2, 2) * 16;
        data.AQI = parseInt(byteArray[2].substring(1, 6), 2) * 16;
        data.CO2eq = parseInt('' + byteArray[2].slice(6, 8) + byteArray[3], 2) * 32;
        data.VOC = parseInt(byteArray[4], 2) * 4;
        data.relative_humidity = (parseInt(byteArray[5], 2) * 4) / 10;
        data.pressure = (parseInt('' + p1 + p2, 2) * 40 + 30000) / 100;
        data.temperature = (parseInt('' + t1 + t2, 2) - 400) / 10;
        data.accuracy_aqi = parseInt(byteArray[8].substr(-2), 2);
        data.voltage = (parseInt(byteArray[9], 2) * 8 + 1600) / 1000;

        return data;
    }

    function handleResponse(byteValues, data) {
        var commands = byteValues.map(function (byte) {
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
                    data.joinRetryPeriod = (parseInt(commands[i + 1], 16) * 5) / 60;
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
                case 'a4':
                    command_len = 1;
                    data.region = parseInt(commands[i + 1], 16);
                    break;
                default:
                    command_len = 0;
                    break;
            }
            commands.splice(i, command_len);
        });

        return data;
    }

    try {
        if (!bytes || bytes.length < KEEPALIVE_BYTE_LEN) {
            throw new Error('payload must be at least ' + KEEPALIVE_BYTE_LEN + ' bytes long');
        }

        if (bytes[0] === 1) {
            data = handleKeepalive(bytes, data);
        } else {
            data = handleResponse(bytes, data);
            data = handleKeepalive(bytes.slice(-KEEPALIVE_BYTE_LEN), data);
        }
    } catch (error) {
        return {
            errors: ['Invalid uplink payload: ' + error.message],
            warnings: []
        };
    }

    return {
        data: data
    };
}

function encodeDownlink(input) {
    var bytes = [];
    var data = (input && input.data) ? input.data : {};
    var key, i;

    // Each colour is packed as 3 bits of behaviour and 5 bits of duration
    // expressed in steps of 10.
    function ledByte(behavior, duration) {
        return ((behavior & 0x07) << 5) | (Math.floor(duration / 10) & 0x1f);
    }

    for (key in data) {
        if (data.hasOwnProperty(key)) {
            switch (key) {
                case "setAqiLed":
                    bytes.push(0x05);
                    bytes.push(ledByte(data.setAqiLed.redBehavior, data.setAqiLed.redDuration));
                    bytes.push(ledByte(data.setAqiLed.greenBehavior, data.setAqiLed.greenDuration));
                    bytes.push(ledByte(data.setAqiLed.blueBehavior, data.setAqiLed.blueDuration));
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
// {"setAqiLed":{"redBehavior":1,"redDuration":10,"greenBehavior":2,"greenDuration":20,"blueBehavior":3,"blueDuration":30}} --> 05214263
// {"sendCustomHexCommand":"12"} --> 12

exports.decodeUplink = decodeUplink;
exports.encodeDownlink = encodeDownlink;
exports.decodeDownlink = decodeDownlink;
