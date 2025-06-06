//
// *****************************************************************************
//  @company        : Edge Technologies
//  @date           : 2022
//  @author         : Pierre Schamberger
// *****************************************************************************
//
// SensaIo LoRaWAN Payload Codec
//
// ****************************************************************************
//
//Copyright (C) 2022 Edge Technologies
//
//Permission to use, copy, modify, and/or distribute this software for any
//purpose with or without fee is hereby granted, provided that the above
//copyright notice and this permission notice appear in all copies.
//
//THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
//WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
//MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
//ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
//WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
//OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
//CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
//
// ****************************************************************************
//

// Internal
function binaryToFloat32(binary) {
    var int = parseInt(binary, 2);
    if (int > 0 || int < 0) {
        var sign = (int >>> 31) ? -1 : 1;
        var exp = (int >>> 23 & 0xff) - 127;
        var mantissa = ((int & 0x7fffff) + 0x800000).toString(2);
        var float32 = 0;
        for (var i = 0; i < mantissa.length; i += 1) {
            float32 += parseInt(mantissa[i], 10) ? Math.pow(2, exp) : 0;
            exp--;
        }
        return float32 * sign;
    }
    else {
        return 0;
    }
}


// Default Standard
function decodeUplink(input) {

    var sensorTypes = [ 'NONE', 'PRESSURE', 'RTD', 'MOTION', 'TCK', 'GAS', 'VIBRATION', 'LOADCELL', 'DIFF_PRES', 'INLINE', 'CLAMP-ON'];

    // Explose input bytes to binary string
    var dataIn = '';
    for(var i = 0; i < input.bytes.length; i++) {
        dataIn = ('00000000' + (input.bytes[i] >>>0).toString(2)).slice(-8) + dataIn;
    }

    // Check Sensor Type
    var sensorType = parseInt(dataIn.slice(-8), 2);
    if(sensorType < sensorTypes.length) {
        return decodeTrameData(dataIn, sensorTypes[sensorType]).data;
    } else if (sensorType == 255) {
        return decodeTrameConfig(dataIn, input.bytes.length).data;
    } else {
        var warnings = ['Unknown sensor type'];
        var dataOut = {};
        dataOut.warnings = warnings;
        return dataOut;
    }
}

function decodeTrameConfig(binary, byteLength) {
    var output = {};
    var warnings = [];
    var errors = [];
    output.data = {};

    var configTypeLoRaWAN = 4;
    var configTypeAlarm = 5;
    var configTypeAlarmExtended = 7;
    output.data.messageType = "CONFIG";
    binary = binary.slice(0, -8);
    output.data.configType = parseInt(binary.slice(-8),2);
    binary = binary.slice(0, -8);
    output.data.status = '0x' + parseInt(binary.slice(-8),2).toString(16);
    binary = binary.slice(0, -8);
    if(output.data.configType === configTypeLoRaWAN) {
        if (byteLength !== 14) {
            warnings.push("LoRaWAN: Incomplete payload");
        }
        output.data.configType = "LoRaWAN";
        output.data.txDataRate = parseInt(binary.slice(-8),2);
        binary = binary.slice(0, -8);
        output.data.txPower = parseInt(binary.slice(-8),2);
        binary = binary.slice(0, -8);
        output.data.txRetries = parseInt(binary.slice(-8),2);
        binary = binary.slice(0, -8);
        output.data.appPort = parseInt(binary.slice(-8),2);
        binary = binary.slice(0, -8);
        output.data.txPeriodicity = parseInt(binary.slice(-32),2);
        binary = binary.slice(0, -32);
        output.data.isTxConfirmed = parseInt(binary.slice(-8),2) === 0 ? false: true;
        binary = binary.slice(0, -8);
        output.data.adrEnable = parseInt(binary.slice(-8),2) === 0 ? false: true;
        binary = binary.slice(0, -8);
        output.data.publicNetworkEnable = parseInt(binary.slice(-8),2) === 0 ? false: true;
    } else if(output.data.configType === configTypeAlarm) {
        output.data.configType = "Alarm";
        if (byteLength < (17+3) || ((byteLength-3) % 17 !== 0)) {
            warnings.push("Alarm: Incomplete payload");
        }
        output.data.alarms = [];
        while (byteLength>=17) {
            byteLength = byteLength - 17;
            var alarm = {};
            var highThreshold = binaryToFloat32(binary.slice(-32));
            binary = binary.slice(0, -32);
            var highHysteresis = binaryToFloat32(binary.slice(-32));
            binary = binary.slice(0, -32);
            var lowHysteresis = binaryToFloat32(binary.slice(-32));
            binary = binary.slice(0, -32);
            var lowThreshold = binaryToFloat32(binary.slice(-32));
            binary = binary.slice(0, -32);
            var isActive = parseInt(binary.slice(-8),2);
            binary = binary.slice(0, -8);
            if (isActive === 1) {
                alarm.highIsActive = true;
                alarm.lowIsActive = false;
                alarm.highThreshold = highThreshold;
                alarm.highHysteresis = highHysteresis;
            } else if (isActive === 2) {
                alarm.highIsActive = false;
                alarm.lowIsActive = true;
                alarm.lowHysteresis = lowHysteresis;
                alarm.lowThreshold = lowThreshold;
            } else if (isActive === 3) {
                alarm.highIsActive = true;
                alarm.highThreshold = highThreshold;
                alarm.highHysteresis = highHysteresis;
                alarm.lowIsActive = true;
                alarm.lowHysteresis = lowHysteresis;
                alarm.lowThreshold = lowThreshold;
            }
            output.data.alarms.push(alarm);
        }
    } else if(output.data.configType === configTypeAlarmExtended) {
        output.data.configType = "AlarmExtended";
        if (byteLength < (20+3) || ((byteLength-3) % 20 !== 0)) {
            warnings.push("AlarmExtended: Incomplete payload");
        }
        output.data.alarms = [];
        while (byteLength>=20) {
            byteLength = byteLength - 20;
            var alarm = {};
            var highThreshold = binaryToFloat32(binary.slice(-32));
            binary = binary.slice(0, -32);
            var highHysteresis = binaryToFloat32(binary.slice(-32));
            binary = binary.slice(0, -32);
            var lowHysteresis = binaryToFloat32(binary.slice(-32));
            binary = binary.slice(0, -32);
            var lowThreshold = binaryToFloat32(binary.slice(-32));
            binary = binary.slice(0, -32);

            var isActive = parseInt(binary.slice(-1),2);
            binary = binary.slice(0, -1);
            if (isActive === 1) {
                alarm.highIsActive = true;
                alarm.highThreshold = highThreshold;
                alarm.highHysteresis = highHysteresis;
            }
            isActive = parseInt(binary.slice(-1),2);
            binary = binary.slice(0, -1);
            if (isActive === 1) {
                alarm.lowIsActive = true;
                alarm.lowThreshold = lowThreshold;
                alarm.lowHysteresis = lowHysteresis;
            }
            var isActiveVariation = parseInt(binary.slice(-1),2);
            binary = binary.slice(0, -1);

            binary = binary.slice(0, -1); // Padding bit

            var wakeupPeriodList = ['15s', '30s', '1m', '2m', '5m', '15m', '30m', '1h', '3h', '6h', '12h'];
            var wakeupPeriod = parseInt(binary.slice(-4),2);
            binary = binary.slice(0, -4);
            alarm.wakeup_period = wakeupPeriodList[wakeupPeriod];

            var variation = parseInt(binary.slice(-8),2);
            binary = binary.slice(0, -8);
            if (isActiveVariation === 1) {
                alarm.variationIsActive = true;
                alarm.variation = variation;
            }
            output.data.alarms.push(alarm);

            // Padding bytes
            binary = binary.slice(0, -8);
            binary = binary.slice(0, -8);
        }
    } else {
        errors.push("Unknown config type");
    }

    if(warnings.length) {
        output.warnings = warnings;
    }

    if(errors.length) {
        output.errors = errors;
    }

    return output;
}

function decodeSensorPayload(sensorType, binary) {
    var output = {};
    output.errors = ""; // default
    output.data = {};
    output.bitLength = 0;
    if (sensorType === 'PRESSURE') {
        output.data.pressure = binaryToFloat32(binary.slice(-32));
        binary = binary.slice(0, -32);
        output.data.temperature = binaryToFloat32(binary.slice(-32));
        binary = binary.slice(0, -32);
        output.bitLength = 2*32;
    } else if (sensorType === 'RTD' || sensorType === 'TCK') {
        output.data.temperature = binaryToFloat32(binary.slice(-32));
        binary = binary.slice(0, -32);
        output.bitLength = 32;
    } else if (sensorType === 'MOTION') {
        output.data.motion_position = parseInt(binary.slice(-8),2);
        binary = binary.slice(0, -8);
        output.data.motion_time = parseInt(binary.slice(-8),2);
        binary = binary.slice(0, -8);
        output.bitLength = 16;
    } else if (sensorType === 'DIFF_PRES') {
        output.data.subType = parseInt(binary.slice(-4),2);
        binary = binary.slice(0, -4);
        hasStatic = parseInt(binary.slice(-4),2);
        binary = binary.slice(0, -4);
        output.data.diffPressure = binaryToFloat32(binary.slice(-32));
        binary = binary.slice(0, -32);
        output.bitLength = 32+8;
        if(hasStatic !== 0) {  // Static pressure expected
            output.data.staticPressure = binaryToFloat32(binary.slice(-32));
            binary = binary.slice(0, -32);
            output.bitLength = output.bitLength + 32
        }
        if(output.data.subType === 0) {
            output.data.subType = "Delta Pressure";
        } else if(output.data.subType === 1) {
            output.data.subType = "Liquid Level";
            output.data.level = binaryToFloat32(binary.slice(-32));
            binary = binary.slice(0, -32);
            output.bitLength = output.bitLength + 32
        } else if(output.data.subType === 2) {
            output.data.subType = "Mass Flow Rate";
            output.data.massFlowRate = binaryToFloat32(binary.slice(-32));
            binary = binary.slice(0, -32);
            output.bitLength = output.bitLength + 32
        } else {
            output.errors = "Unknown diff pressure subtype";
        }
    } else if ((sensorType === 'VIBRATION') ||  (sensorType === 'CLAMP-ON')) {
        var nbBytes = parseInt(binary.slice(-8),2);
        binary = binary.slice(0, -8);
        output.bitLength = 8*(nbBytes+1);
        output.data.ai_output = [];
        for (var i = 0; i < nbBytes; i++) {
            output.data.ai_output.push(parseInt(binary.slice(-8),2));
            binary = binary.slice(0, -8);
        }
        if(binary != '') {  // Advanced mode is enabled
            output.data.totalEnergy = parseInt(binary.slice(-16), 2) / 1000.0;
            binary = binary.slice(0, -16);
            output.bitLength = output.bitLength + 16;
            output.data.peaks = [];
            for (var i = 0; i < 8; i++) {
                var p = {};
                p.freq = parseInt(binary.slice(-16), 2);
                binary = binary.slice(0, -16);
                p.magnitude = parseInt(binary.slice(-16), 2) / 1000.0;
                binary = binary.slice(0, -16);
                p.energy_ratio = parseInt(binary.slice(-8), 2);
                binary = binary.slice(0, -8);
                output.data.peaks.push(p);
                output.bitLength = output.bitLength + 16 + 16 + 8;
            }
            output.data.freqWidth = parseInt(binary.slice(-16), 2);
            binary = binary.slice(0, -16);
            output.bitLength = output.bitLength + 16;
            if (sensorType === 'VIBRATION') {
                // Temperature is only on the Vibration sensor
                output.data.temperature = parseInt(binary.slice(-16), 2) * 7.8125 * 0.001 + 273.15;
                binary = binary.slice(0, -16);
                output.bitLength = output.bitLength + 16
            }
        }
    } else {
        output.errors ="Unknown sensor type";
    }

    return output;
}

function decodeTrameData(binary, type) {

    var output = {};
    var warnings = [];
    var errors = [];
    output.data = {};

    var messageTypes = [ 'FIRST', 'PERIODIC', 'ALERT', 'LOG'];
    output.data.sensorType = type;
    binary = binary.slice(0, -8);
    output.data.messageType = messageTypes[parseInt(binary.slice(-2),2)];
    binary = binary.slice(0, -2);
    output.data.batteryLevel = parseInt(binary.slice(-7),2);
    binary = binary.slice(0, -7);
    output.data.version = parseInt(binary.slice(-3),2);
    binary = binary.slice(0, -3);
    output.data.version = parseInt(binary.slice(-3),2) + '.' +output.data.version;
    binary = binary.slice(0, -3);
    output.data.version = parseInt(binary.slice(-3),2) + '.' +output.data.version;
    binary = binary.slice(0, -3);
    output.data.deviceTemperature = parseInt(binary.slice(-9),2);
    binary = binary.slice(0, -9);
    output.data.deviceShock = parseInt(binary.slice(-13),2);
    binary = binary.slice(0, -13);
    var flags = binary.slice(-8);
    if (flags == "00000000") {
        output.data.flags = "OK";
    } else {
        output.data.flags = "KO";
        var flag_text = [
            "FLAG_TO136_FAILURE",
            "FLAG_LORA_FAILURE",
            "FLAG_SENSOR_I2C_FAILURE",
            "FLAG_EEPROM_FAILURE",
            "FLAG_ACCEL_FAILURE",
            "FLAG_SENSOR_WARNING",
            "FLAG_SWAP_FAILURE",
            "FLAG_UNKNOWN"
        ];

        for (var i = 0; i < flags.length; i++) {
            if(flags.charAt(i) == "1") {
                warnings.push(flag_text[7-i]);
            }
        }
    }
    binary = binary.slice(0, -8);

    if (output.data.messageType === 'PERIODIC' || output.data.messageType === 'ALERT' || output.data.messageType === 'FIRST') {
        var sensorData = decodeSensorPayload(output.data.sensorType, binary);
        output.data.sensorData = sensorData.data;
        binary = binary.slice(0, (-1)*sensorData.bitLength);
        if (sensorData.errors != "") {
            errors.push(sensorData.errors)
        }
    } else if (output.data.messageType === 'LOG') {
        output.data.sensorData = [];
        while (binary != '') {
            var d = {};
            var t = parseInt(binary.slice(-32),2);
            binary = binary.slice(0, -32);
            var date = new Date(t * 1000);
            d.UTCTime = date.toUTCString();
            var sensorData = decodeSensorPayload(output.data.sensorType, binary);
            d.data = sensorData.data;
            binary = binary.slice(0, (-1)*sensorData.bitLength);
            if (sensorData.errors != "") {
                errors.push(sensorData.errors)
            }
            output.data.sensorData.push(d)
        }
    } else {
        errors.push("Unknown messageType");
    }

    if(warnings.length) {
        output.warnings = warnings;
    }

    if(errors.length) {
        output.errors = errors;
    }

    return output;
}

exports.decodeUplink = decodeUplink;