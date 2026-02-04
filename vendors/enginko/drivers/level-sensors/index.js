
/*                         	  _       _         
 *                 	         (_)     | |        
 *            ___ _ __   __ _ _ _ __ | | _____  
 *           / _ \ '_ \ / _` | | '_ \| |/ / _ \ 
 *          |  __/ | | | (_| | | | | |   < (_) |
 *           \___|_| |_|\__, |_|_| |_|_|\_\___/ 
 *                       __/ |                  
 *                      |___/                   
 *
 *
 *          WEB:    https://www.enginko.com
 *          E-MAIL: info@enginko.com
 */

/*
 * VERSION: 2.0.0
 * 
 * 
 * UPLINKID: 01 - timesync request:
 * 
 * * INPUT: object
 * * bytes        -> payload byte array 
 * * fPort        -> uplink message LoRaWAN fPort
 * * recvTime     -> timestamp recorded by the LoRaWAN network server
 * 
 * * OUTPUT:
 * * data     -> object
 * * * * * * * data.syncID           -> id of sync request
 * * * * * * * data.syncVersion      -> major, minor and build version
 * * * * * * * data.applicationType  -> sensor type
 * * * * * * * data.rfu              -> future use bytes
 * 
 * 
 * UPLINKID: 0A - IO data:
 * 
 * * INPUT: object
 * * bytes        -> payload byte array
 * * fPort        -> uplink message LoRaWAN fPort
 * * recvTime     -> timestamp recorded by the LoRaWAN network server
 * 
 * * OUTPUT: object
 * * data     -> object
 * * * * * * * data.date                -> date of measurement
 * * * * * * * data.inputStatus         -> input byte status | 0 off - 1 on
 * * * * * * * data.outputStatus        -> output byte status | 0 off - 1 on
 * * * * * * * data.inputTrigger        -> input byte event | 0 not triggered - 1 triggered
 * 
 * 
 * UPLINKID: 14 - Level data:
 * 
 * * INPUT: object
 * * bytes        -> payload byte array (EGK-LW20Lxx / EGK-LW20Wxx payload)
 * * fPort        -> uplink message LoRaWAN fPort
 * * recvTime     -> timestamp recorded by the LoRaWAN network server
 * 
 * * OUTPUT: object
 * * data     -> object
 * * * * * * * data.date         -> date of measurement
 * * * * * * * data.type         -> sensor type
 * * * * * * * data.ADC          -> (.value and .unit) voltage in mV
 * * * * * * * data.height       -> (.value and .unit) height in mm (calculated as "End-Distance1")
 * * * * * * * data.distance1    -> (.value and .unit) distance to target in mm
 * * * * * * * data.amplitude    -> amplitude (debug)
 * * * * * * * data.gain         -> gain (debug)
 * * * * * * * data.fillLevel    -> (0x01, 0x03 only) (.value and .unit) percentage of container filling
 * * * * * * * data.temperature  -> (0x01, 0x02, 0x03, 0xFE only) (.value and .unit) temperature in �C
 * * * * * * * data.humidity     -> (0x02, 0x03, 0xFE only) (.value and .unit) percentage of humidity
 * * * * * * * data.pressure     -> (0x02, 0x03, 0xFE only) (.value and .unit) pressure in hPa
 * * * * * * * data.battery      -> (.value and .unit) percentage of sensor battery
 * 
 * errors   -> array of errors (null by default)
 */

function decodeUplink(input) {
    var errorsList = [];
    var output = {
        data: {},
        errors: null
    };

    var payload = byteArraytoHexString(input.bytes);
    console.log(payload);
    switch (input.bytes[0]) {
        case 0x01:
            output.data.syncID = payload.substring(2, 10).toLocaleUpperCase();
            output.data.syncVersion = payload.substring(10, 12).toLocaleUpperCase() + "." + payload.substring(12, 14).toLocaleUpperCase() + "." + payload.substring(14, 16).toLocaleUpperCase();
            output.data.applicationType = payload.substring(16, 20).toLocaleUpperCase();
            output.data.rfu = payload.substring(20).toLocaleUpperCase();

            return output;
        case 0x0a:
        case 0x0A:
            output.data.date = parseDate(payload.substring(2, 10));

            var firstByte = [];

            var k = 0;
            for (var i = 0; i < 3; i++) {
                firstByte[i] = parseInt(payload.substring(k + 10, k + 10 + 2), 16);

                k = k + 8;
            }

            output.data.inputStatus = firstByte[0];

            output.data.outputStatus = firstByte[1];

            output.data.inputTrigger = firstByte[2];

            return output;
        case 0x14:
            var typeNumber = parseInt(payload.substring(2, 4));
            output.data.type = typeNumber;

            switch (typeNumber) {
                case 0:
                    output.data.date = parseDate(payload.substring(4, 12));

                    output.data.ADC = {
                        value: parseBuffer(payload.substring(12, 16)),
                        unit: 'mV'
                    };

                    var tmpHeight = {
                        value: parseBuffer(payload.substring(16, 20)),
                        unit: 'mm'
                    };
                    var distanceNumber = parseBuffer(payload.substring(20, 24));
                    if (distanceNumber <= 60000) {
                        output.data.height = tmpHeight;

                        output.data.distance1 = {
                            value: distanceNumber,
                            unit: 'mm'
                        };
                    }
                    else {
                        errorsList.push("Distance error! distanceNumber = " + distanceNumber);
                        output.errors = errorsList;
                    }

                    output.data.battery = {
                        value: parseBuffer(payload.substring(24, 26)),
                        unit: '%'
                    };

                    break;
                case 1:
                    output.data.date = parseDate(payload.substring(4, 12));

                    output.data.ADC = {
                        value: parseBuffer(payload.substring(12, 16)),
                        unit: 'mV'
                    };

                    var tmpHeight = {
                        value: parseBuffer(payload.substring(16, 20)),
                        unit: 'mm'
                    };
                    var distanceNumber = parseBuffer(payload.substring(20, 24));
                    if (distanceNumber <= 60000) {
                        output.data.height = tmpHeight;

                        output.data.distance1 = {
                            value: distanceNumber,
                            unit: 'mm'
                        };
                    }
                    else {
                        errorsList.push("Distance error! distanceNumber = " + distanceNumber);
                        output.errors = errorsList;
                    }

                    var fillLevelNumber = parseBuffer(payload.substring(24, 26));
                    if (fillLevelNumber <= 100) {
                        output.data.fillLevel = {
                            value: fillLevelNumber,
                            unit: '%'
                        };
                    }
                    else {
                        errorsList.push("Fill level error! fillLevel = " + fillLevelNumber);
                        output.errors = errorsList;
                    }

                    output.data.temperature = {
                        value: getTemperature(payload.substring(26, 30)),
                        unit: '°C'
                    };
                    output.data.battery = {
                        value: parseBuffer(payload.substring(30, 32)),
                        unit: '%'
                    };

                    break;
                case 2:
                    output.data.date = parseDate(payload.substring(4, 12));

                    output.data.ADC = {
                        value: parseBuffer(payload.substring(12, 16)),
                        unit: 'mV'
                    };

                    var tmpHeight = {
                        value: parseBuffer(payload.substring(16, 20)),
                        unit: 'mm'
                    };
                    var distanceNumber = parseBuffer(payload.substring(20, 24));
                    if (distanceNumber <= 60000) {
                        output.data.height = tmpHeight;

                        output.data.distance1 = {
                            value: distanceNumber,
                            unit: 'mm'
                        };
                    }
                    else {
                        errorsList.push("Distance error! distanceNumber = " + distanceNumber);
                        output.errors = errorsList;
                    }

                    output.data.temperature = {
                        value: getTemperature(payload.substring(24, 28)),
                        unit: '°C'
                    };
                    output.data.humidity = {
                        value: getHumidity(payload.substring(28, 30)),
                        unit: '%'
                    };
                    output.data.pressure = {
                        value: getPressure(payload.substring(30, 36)),
                        unit: 'hPa'
                    };
                    output.data.battery = {
                        value: parseBuffer(payload.substring(36, 38)),
                        unit: '%'
                    };

                    break;
                case 3:
                    output.data.date = parseDate(payload.substring(4, 12));

                    output.data.ADC = {
                        value: parseBuffer(payload.substring(12, 16)),
                        unit: 'mV'
                    };

                    var tmpHeight = {
                        value: parseBuffer(payload.substring(16, 20)),
                        unit: 'mm'
                    };
                    var distanceNumber = parseBuffer(payload.substring(20, 24));
                    if (distanceNumber <= 60000) {
                        output.data.height = tmpHeight;

                        output.data.distance1 = {
                            value: distanceNumber,
                            unit: 'mm'
                        };
                    }
                    else {
                        errorsList.push("Distance error! distanceNumber = " + distanceNumber);
                        output.errors = errorsList;
                    }

                    var fillLevelNumber = parseBuffer(payload.substring(24, 26));
                    if (fillLevelNumber <= 100) {
                        output.data.fillLevel = {
                            value: fillLevelNumber,
                            unit: '%'
                        };
                    }
                    else {
                        errorsList.push("Fill level error! fillLevel = " + fillLevelNumber);
                        output.errors = errorsList;
                    }

                    output.data.temperature = {
                        value: getTemperature(payload.substring(26, 30)),
                        unit: '°C'
                    };
                    output.data.humidity = {
                        value: getHumidity(payload.substring(30, 32)),
                        unit: '%'
                    };
                    output.data.pressure = {
                        value: getPressure(payload.substring(32, 38)),
                        unit: 'hPa'
                    };
                    output.data.battery = {
                        value: parseBuffer(payload.substring(38, 40)),
                        unit: '%'
                    };

                    break;
                case 254:
                    output.data.date = parseDate(payload.substring(4, 12));

                    output.data.ADC = {
                        value: parseBuffer(payload.substring(12, 16)),
                        unit: 'mV'
                    };

                    var tmpHeight = {
                        value: parseBuffer(payload.substring(16, 20)),
                        unit: 'mm'
                    };
                    var distanceNumber = parseBuffer(payload.substring(20, 24));
                    if (distanceNumber <= 60000) {
                        output.data.height = tmpHeight;

                        output.data.distance1 = {
                            value: distanceNumber,
                            unit: 'mm'
                        };
                    }
                    else {
                        errorsList.push("Distance error! distanceNumber = " + distanceNumber);
                        output.errors = errorsList;
                    }

                    var fillLevelNumber = parseBuffer(payload.substring(24, 26));
                    if (fillLevelNumber <= 100) {
                        output.data.fillLevel = {
                            value: fillLevelNumber,
                            unit: '%'
                        };
                    }
                    else {
                        errorsList.push("Fill level error! fillLevel = " + fillLevelNumber);
                        output.errors = errorsList;
                    }

                    output.data.amplitude = parseBuffer(payload.substring(26, 30));
                    output.data.gain = parseBuffer(payload.substring(30, 34));
                    output.data.temperature = {
                        value: getTemperature(payload.substring(34, 38)),
                        unit: '°C'
                    };
                    output.data.humidity = {
                        value: getHumidity(payload.substring(38, 40)),
                        unit: '%'
                    };
                    output.data.pressure = {
                        value: getPressure(payload.substring(40, 46)),
                        unit: 'hPa'
                    };
                    output.data.battery = {
                        value: parseBuffer(payload.substring(46, 48)),
                        unit: '%'
                    };

                    break;
                case 255:
                    output.data.date = parseDate(payload.substring(4, 12));

                    output.data.ADC = {
                        value: parseBuffer(payload.substring(12, 16)),
                        unit: 'mV'
                    };

                    var tmpHeight = {
                        value: parseBuffer(payload.substring(16, 20)),
                        unit: 'mm'
                    };
                    var distanceNumber = parseBuffer(payload.substring(20, 24));
                    if (distanceNumber <= 60000) {
                        output.data.height = tmpHeight;

                        output.data.distance1 = {
                            value: distanceNumber,
                            unit: 'mm'
                        };
                    }
                    else {
                        errorsList.push("Distance error! distanceNumber = " + distanceNumber);
                        output.errors = errorsList;
                    }

                    var fillLevelNumber = parseBuffer(payload.substring(24, 26));
                    if (fillLevelNumber <= 100) {
                        output.data.fillLevel = {
                            value: fillLevelNumber,
                            unit: '%'
                        };
                    }
                    else {
                        errorsList.push("Fill level error! fillLevel = " + fillLevelNumber);
                        output.errors = errorsList;
                    }

                    output.data.amplitude = parseBuffer(payload.substring(26, 30));
                    output.data.gain = parseBuffer(payload.substring(30, 34));
                    output.data.battery = {
                        value: parseBuffer(payload.substring(34, 36)),
                        unit: '%'
                    };

                    break;
            }

            return output;
        default:
            errorsList.push("Invalid payload");
            output.errors = errorsList;
            return output;
    }
}

function getTemperature(str) {
    var n = parseBuffer(str);

    if ((n & 0x8000) > 0) {
        n = n - 0x10000;
    }

    return n / 100;
}

function getPressure(str) {
    var n = parseBuffer(str);
    return n / 100;
}

function getHumidity(str) {
    var n = parseBuffer(str);
    return n / 2;
}

function parseDate(payload) {
    var binary = Number(parseInt(reverseBytes(payload), 16)).toString(2).padStart(32, '0');
    var year = parseInt(binary.substring(0, 7), 2) + 2000;
    var month = parseInt(binary.substring(7, 11), 2);
    var day = parseInt(binary.substring(11, 16), 2);
    var hour = parseInt(binary.substring(16, 21), 2);
    var minute = parseInt(binary.substring(21, 27), 2);
    var second = parseInt(binary.substring(27, 32), 2) * 2;

    return new Date(year, month - 1, day, hour, minute, second, 0).toLocaleString();
}

function reverseBytes(bytes) {
    var reversed = bytes;
    if (bytes.length % 2 === 0) {
        reversed = "";
        for (var starting = 0; starting + 2 <= bytes.length; starting += 2) {
            reversed = bytes.substring(starting, starting + 2) + reversed;
        }
    }
    return reversed;
}

function parseBuffer(buffer) {
    var n = parseInt(reverseBytes(buffer), 16);
    return n;
}

function byteArraytoHexString(bytes) {
    var res = "";
    for (var i = 0; i < bytes.length; i++) {
        res += ('0' + (bytes[i] & 0xFF).toString(16)).slice(-2);
    }
    return res;
}

exports.decodeUplink = decodeUplink;
