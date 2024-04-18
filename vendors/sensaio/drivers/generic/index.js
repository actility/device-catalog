function binaryToFloat32(binary) {
    const int = parseInt(binary, 2);
    if (int > 0 || int < 0) {
        // tslint:disable-next-line:no-bitwise
        const sign = (int >>> 31) ? -1 : 1;
        // tslint:disable-next-line:no-bitwise
        let exp = (int >>> 23 & 0xff) - 127;
        // tslint:disable-next-line:no-bitwise
        const mantissa = ((int & 0x7fffff) + 0x800000).toString(2);
        let float32 = 0;
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < mantissa.length; i += 1) {
            float32 += parseInt(mantissa[i], 10) ? Math.pow(2, exp) : 0;
            exp--;
        }
        return float32 * sign;
    }
    else {
        return 0;
    }
}

function decodeUplink(input) {

    var result = {};
    var bytes = input.bytes;
    var binary = '';
    for(let i=0; i<bytes.length; i++) {
        binary = ("00000000" + (parseInt(bytes[i], 10)).toString(2)).substr(-8) + binary;
    }

    var type = parseInt(binary.slice(-8),2);
    if ( (type < 0 || type >4) && type !== 255){
        throw new Error("Invalid sensorType payload");
    }

    if (type < 5) {
        result = decodeTrameDate(binary, type, bytes);
    } else if (type === 255) {
        result = decodeTrameConfig(binary, bytes);
    }

    return result;
}

function decodeTrameConfig(binary, bytes) {
    let result = {}
    var messageTypes = [ 'TEST', 'PERIODIC', 'ALERT', 'LOG', 'LORAWAN', 'ALARM'];
    result.messageType = "CONFIG";
    binary = binary.slice(0, -8);
    result.configType =  messageTypes[parseInt(binary.slice(-8),2)];
    binary = binary.slice(0, -8);
    result.status = '0x' + parseInt(binary.slice(-8),2).toString(16);
    binary = binary.slice(0, -8);
    if (result.configType === 'LORAWAN') {
        if (bytes.length !== 14) {
            throw new Error("Invalid uplink payload: config lorawan need 14 bytes");
        }
        result.txDataRate = parseInt(binary.slice(-8),2);
        binary = binary.slice(0, -8);
        result.txPower = parseInt(binary.slice(-8),2);
        binary = binary.slice(0, -8);
        result.txRetries = parseInt(binary.slice(-8),2);
        binary = binary.slice(0, -8);
        result.appPort = parseInt(binary.slice(-8),2);
        binary = binary.slice(0, -8);
        result.txPeriodicity = parseInt(binary.slice(-32),2);
        binary = binary.slice(0, -32);
        result.isTxConfirmed = parseInt(binary.slice(-8),2) === 0 ? false: true;
        binary = binary.slice(0, -8);
        result.adrEnable = parseInt(binary.slice(-8),2) === 0 ? false: true;
        binary = binary.slice(0, -8);
        result.publicNetworkEnable = parseInt(binary.slice(-8),2) === 0 ? false: true;
    } else if (result.configType === 'ALARM') {
        if (bytes.length < (17+3) || ((bytes.length-3) % 17 !== 0)) {
            throw new Error("Invalid uplink payload: config alarm");
        }
        result.alarms = []
        while (binary.length>16) {
            let alarm = {};
            let highThreshold = binaryToFloat32(binary.slice(-32));
            binary = binary.slice(0, -32);
            let highHysteresis = binaryToFloat32(binary.slice(-32));
            binary = binary.slice(0, -32);
            let lowHysteresis = binaryToFloat32(binary.slice(-32));
            binary = binary.slice(0, -32);
            let lowThreshold = binaryToFloat32(binary.slice(-32));
            binary = binary.slice(0, -32);
            let isActive = parseInt(binary.slice(-8),2);
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
            result.alarms.push(alarm);
        }
    }
    return result;
}

function decodeTrameDate(binary, type, bytes) {
    if (bytes.length > 15) {
        throw new Error("Invalid uplink payload: length exceeds 15 bytes");
    }
    var sensorType = ['NONE', 'PRESSURE', 'TEMPERATURE RTD', 'MOTION', 'TEMPERATURE TCK'];
    var messageTypes = [ 'TEST', 'PERIODIC', 'ALERT', 'LOG', 'LORAWAN', 'ALARM'];
    let result = {}
    result.sensorType = sensorType[type];
    binary = binary.slice(0, -8);
    result.messageType = messageTypes[parseInt(binary.slice(-2),2)];
    binary = binary.slice(0, -2);
    result.batteryLevel = parseInt(binary.slice(-7),2);
    binary = binary.slice(0, -7);
    result.version = parseInt(binary.slice(-3),2);
    binary = binary.slice(0, -3);
    result.version = parseInt(binary.slice(-3),2) + '.' +result.version;
    binary = binary.slice(0, -3);
    result.version = parseInt(binary.slice(-3),2) + '.' +result.version;
    binary = binary.slice(0, -3);
    result.deviceTemperature = parseInt(binary.slice(-9),2);
    binary = binary.slice(0, -9);
    result.deviceShock = parseInt(binary.slice(-13),2);
    binary = binary.slice(0, -13);
    result.flags = binary.slice(-8);
    binary = binary.slice(0, -8);
    result.sensorData = {};

    if (result.messageType === 'PERIODIC') {
        if (result.sensorType === 'PRESSURE') {
            result.sensorData.pressure = binaryToFloat32(binary.slice(-32));
            binary = binary.slice(0, -32);
            result.sensorData.temperature = binaryToFloat32(binary.slice(-32));
        } else if (result.sensorType === 'TEMPERATURE RTD' || result.sensorType === 'TEMPERATURE TCK') {
            result.sensorData.temperature = binaryToFloat32(binary.slice(-32));
        } else if (result.sensorType === 'MOTION') {
            result.sensorData.motion = parseInt(binary.slice(-8),2);
        }
    }

    return result;
}

exports.decodeUplink = decodeUplink;