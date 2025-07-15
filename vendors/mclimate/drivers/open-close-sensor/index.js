// DataCake
function Decoder(bytes, port){
    var decoded = decodeUplink({ bytes: bytes, fPort: port }).data;
    return decoded;
}

// Milesight
function Decode(port, bytes){
    var decoded = decodeUplink({ bytes: bytes, fPort: port }).data;
    return decoded;
}

// The Things Industries / Main
function decodeUplink(input) {
    var bytes = input.bytes;

    function calculateBatteryVoltage(byte) {
        return byte * 8 + 1600;
    }

    function calculateTemperature(rawData) {
        return rawData / 10.0;
    }

    function handleKeepalive(bytes, data) {
        // Byte 1: Device battery voltage
        var batteryVoltage = calculateBatteryVoltage(bytes[1]) / 1000;
        data.batteryVoltage = Number(batteryVoltage.toFixed(1));

        // Byte 2: Thermistor operational status and temperature data (bits 9:8)
        var thermistorConnected = (bytes[2] & 0x04) === 0; // Bit 2
        var temperatureHighBits = bytes[2] & 0x03; // Bits 1:0

        // Byte 3: Thermistor temperature data (bits 7:0)
        var temperatureLowBits = bytes[3];
        var temperatureRaw = (temperatureHighBits << 8) | temperatureLowBits;
        var temperatureCelsius = calculateTemperature(temperatureRaw);
        data.thermistorProperlyConnected = thermistorConnected;
        data.temperature = Number(temperatureCelsius.toFixed(1));

        // Byte 4-6: Counter data
        var counter = ((bytes[4] << 16) | (bytes[5] << 8) | bytes[6]);
        data.counter = counter;

        // Byte 7: Status and event code
        const status = bytes[7]
        const events = { '01': 'keepalive', '32': 'reed switch', '33': 'push button' }
        const eventKey = bytes[0].toString().padStart(2, '0')
        const event = events[eventKey]

        data.status = status ?? null;
        data.event = event ?? null;

        return data;
    }

    function handleResponse(bytes, data) {
        var commands = bytes.map(function (byte) {
            return ("0" + byte.toString(16)).substr(-2);
        });

        commands = commands.slice(0, -8); 
        var command_len = 0;

        commands.forEach(function (command, i) {
            switch (command) {
                case '04':
                    command_len = 2;
                    var hardwareVersion = commands[i + 1];
                    var softwareVersion = commands[i + 2];
                    data.deviceVersions = { hardware: Number(hardwareVersion), software: Number(softwareVersion) };
                    break;
                case '12':
                    command_len = 1;
                    data.keepAliveTime = parseInt(commands[i + 1], 16);
                    break;
                case '19':
                    command_len = 1;
                    var commandResponse = parseInt(commands[i + 1], 16);
                    var periodInMinutes = commandResponse * 5 / 60;
                    data.joinRetryPeriod = periodInMinutes;
                    break;
                case '1b':
                    command_len = 1;
                    data.uplinkType = parseInt(commands[i + 1], 16);
                    break;
                case '1d':
                    command_len = 2;
                    var wdpC = commands[i + 1] === '00' ? false : parseInt(commands[i + 1], 16);
                    var wdpUc = commands[i + 2] === '00' ? false : parseInt(commands[i + 2], 16);
                    data.watchDogParams = { wdpC: wdpC, wdpUc: wdpUc };
                    break;
                case '1f':
                    command_len = 1;
                    data.sendEventLater = parseInt(commands[i + 1], 16);
                    break;
                default:
                    break;
            }
            commands.splice(i, command_len);
        });
        return data;
    }

    var data = {};

    if (bytes[0] === 1 || bytes[0] === 32 || bytes[0] === 33) {
        data = handleKeepalive(bytes, data);
    } else {
        data = handleResponse(bytes, data);
        // Handle the remaining keepalive data if required after response
        bytes = bytes.slice(-8);
        data = handleKeepalive(bytes, data);
    }

    return { data: data };
}

exports.decodeUplink = decodeUplink;