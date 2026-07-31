var KEEPALIVE_BYTE_LEN = 10;

function decodeUplink(input) {
    var bytes = input.bytes;
    var data = {};

    function handleKeepalive(bytes, data) {
        // Byte 1 (bits 1:0) and byte 2: internal temperature sensor data
        // Formula: t[C] = (T[9:0] - 400) / 10
        var tempValue = ((bytes[1] & 0x03) << 8) | bytes[2];
        data.sensorTemperature = Number(((tempValue - 400) / 10).toFixed(2));

        // Byte 3: relative humidity, RH[%] = (XX * 100) / 256
        data.relativeHumidity = Number(((bytes[3] * 100) / 256).toFixed(2));

        // Bytes 4-5: light sensor data. 0x0000-0xFFFA is a valid reading,
        // 0xFFFF means the sensor is disabled and 0xFFFB-0xFFFE a sensor error.
        var rawLux = (bytes[4] << 8) | bytes[5];
        if (rawLux <= 0xfffa) {
            data.lux = rawLux;
            data.luxStatus = 'ok';
        } else if (rawLux === 0xffff) {
            data.lux = 0;
            data.luxStatus = 'disabled';
        } else {
            data.lux = 0;
            data.luxStatus = 'sensor_error';
        }

        // Byte 6: battery voltage [mV] = ((XX * 2200) / 255) + 1600
        data.batteryVoltage = Number(((((bytes[6] * 2200) / 255) + 1600) / 1000).toFixed(2));

        // Byte 7 bit 0: occupancy flag
        data.occupied = (bytes[7] & 0x01) === 1;

        // Bytes 8-9: PIR trigger count
        data.pirTriggerCount = (bytes[8] << 8) | bytes[9];

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
                case '1f':
                    command_len = 1;
                    data.lightSensorState = parseInt(commands[i + 1], 16);
                    break;
                case '22':
                    command_len = 1;
                    data.ledBrightness = parseInt(commands[i + 1], 16);
                    break;
                case '37':
                    command_len = 1;
                    data.pirSensorState = parseInt(commands[i + 1], 16);
                    break;
                case '39':
                    command_len = 2;
                    data.occupancyTimeout = (parseInt(commands[i + 1], 16) << 8) | parseInt(commands[i + 2], 16);
                    break;
                case '3a':
                    // Occupancy event, no parameters.
                    command_len = 0;
                    data.event = 'occupied';
                    break;
                case '3b':
                    // Unoccupied event, no parameters.
                    command_len = 0;
                    data.event = 'unoccupied';
                    break;
                case '3d':
                    command_len = 1;
                    data.pirDemoMode = parseInt(commands[i + 1], 16);
                    break;
                case '3f':
                    command_len = 1;
                    data.pirOperationMode = parseInt(commands[i + 1], 16);
                    break;
                case '40':
                    // PIR trigger event, no parameters.
                    command_len = 0;
                    data.event = 'pirTrigger';
                    break;
                case '42':
                    command_len = 2;
                    data.pirBlindTime = (parseInt(commands[i + 1], 16) << 8) | parseInt(commands[i + 2], 16);
                    break;
                case '44':
                    command_len = 1;
                    data.pirCounterResetFlag = parseInt(commands[i + 1], 16);
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
                // ---- PIR Mini commands ----
                case "setLightSensorState":
                    bytes.push(0x1e);
                    bytes.push(data.setLightSensorState);
                    break;
                case "getLightSensorState":
                    bytes.push(0x1f);
                    break;
                case "setLedBrightness":
                    bytes.push(0x21);
                    bytes.push(data.setLedBrightness);
                    break;
                case "getLedBrightness":
                    bytes.push(0x22);
                    break;
                case "setPIRSensorState":
                    bytes.push(0x36);
                    bytes.push(data.setPIRSensorState);
                    break;
                case "getPIRSensorState":
                    bytes.push(0x37);
                    break;
                case "setOccupancyTimeout":
                    // Transmitted as two bytes.
                    bytes.push(0x38);
                    pushUInt16(data.setOccupancyTimeout);
                    break;
                case "getOccupancyTimeout":
                    bytes.push(0x39);
                    break;
                case "setPIRDemoMode":
                    bytes.push(0x3c);
                    bytes.push(data.setPIRDemoMode);
                    break;
                case "getPIRDemoMode":
                    bytes.push(0x3d);
                    break;
                case "setPIROperationMode":
                    bytes.push(0x3e);
                    bytes.push(data.setPIROperationMode);
                    break;
                case "getPIROperationMode":
                    bytes.push(0x3f);
                    break;
                case "setPIRBlindTime":
                    // Transmitted as two bytes.
                    bytes.push(0x41);
                    pushUInt16(data.setPIRBlindTime);
                    break;
                case "getPIRBlindTime":
                    bytes.push(0x42);
                    break;
                case "setPIRCounterResetFlag":
                    bytes.push(0x43);
                    bytes.push(data.setPIRCounterResetFlag);
                    break;
                case "getPIRCounterResetFlag":
                    bytes.push(0x44);
                    break;
                case "restartDevice":
                    bytes.push(0xa5);
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
// {"setPIRSensorState":1} --> 3601
// {"setOccupancyTimeout":300} --> 38012C
// {"setPIRBlindTime":60} --> 41003C
// {"setLedBrightness":41} --> 2129

exports.decodeUplink = decodeUplink;
exports.encodeDownlink = encodeDownlink;
exports.decodeDownlink = decodeDownlink;
