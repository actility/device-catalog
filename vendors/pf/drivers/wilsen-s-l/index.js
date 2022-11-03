function bytesToHex(bytes) {
    return Array.from(bytes, (byte) => {
        return ("0" + (byte & 0xff).toString(16)).slice(-2).toUpperCase();
    }).join("");
}

function numberToInt32(value) {
    if (value > 0x7FFFFFFF) {
        return (value - 0x100000000);
    }
    return value;
}

function hexToString(hexx) {
    var hex = hexx.toString();
    var str = '';
    for (var j = 0;
        (j < hex.length && hex.substr(j, 2) !== '00'); j += 2)
        str += String.fromCharCode(parseInt(hex.substr(j, 2), 16));
    return str;
}

function decodeFloat(bytes, signBits, exponentBits, fractionBits, eMin, eMax, littleEndian) {
    var binary = '';
    for (var z = 0, l = bytes.length; z < l; z += 1) {
        var bits = bytes[z].toString(2);
        while (bits.length < 8) {
            bits = '0' + bits;
        }
        if (littleEndian) {
            binary = bits + binary;
        } else {
            binary += bits;
        }
    }
    var sign = (binary.charAt(0) === '1') ? -1 : 1;
    var exponent = parseInt(binary.substr(signBits, exponentBits), 2) - eMax;
    var significandBase = binary.substr(signBits + exponentBits, fractionBits);
    var significandBin = '1' + significandBase;
    var cnt = 0;
    var val = 1;
    var significand = 0;
    if (exponent == -eMax) {
        if (significandBase.indexOf('1') === -1)
            return 0;
        else {
            exponent = eMin;
            significandBin = '0' + significandBase;
        }
    }
    while (cnt < significandBin.length) {
        significand += val * parseInt(significandBin.charAt(cnt));
        val = val / 2;
        cnt += 1;
    }
    return sign * significand * Math.pow(2, exponent);
}

function hexToFloat(hexstring) {
    var bytes = [];
    bytes[0] = parseInt(hexstring.substr(0, 2), 16);
    bytes[1] = parseInt(hexstring.substr(2, 2), 16);
    bytes[2] = parseInt(hexstring.substr(4, 2), 16);
    bytes[3] = parseInt(hexstring.substr(6, 2), 16);
    return decodeFloat(bytes, 1, 8, 23, -126, 127, false);
}

function decodeUplink(input) {
    var obj = {};
    if (input.bytes.length < 4) {
        throw new Error("Invalid Payload: Length is shorter than 4");
    }
    const hexStr = bytesToHex(input.bytes);
    
    obj.payload = hexStr;
    for (var i = 0; i < hexStr.length; i = i + 2) {
        len = parseInt(hexStr.substr(i, 2), 16);
        sID = hexStr.substr(i + 2, 4);

        if (sID == '0201') { // 'Temperature'
            obj.temp = parseFloat(hexToFloat(hexStr.substr(i + 6, 8)).toFixed(1)); // float
        }
        else if (sID == '0B01') { // 'Proximity'
            obj.proxx = parseInt(hexStr.substr(i + 6, 4), 16); // uint16
        }
        else if (sID == '0B06') { // 'Fillinglevel'
            obj.fillinglvl = parseInt(hexStr.substr(i + 6, 2), 16); // uint8
        }
        else if (sID == '2A25') { // 'Serial Number'
            obj.serial_nr = hexToString(hexStr.substr(i + 6, 28));
        }
        else if (sID == '3101') { // 'LoRa Transmission Counter'
            obj.lora_count = parseInt(hexStr.substr(i + 6, 4), 16); // uint16
        }
        else if (sID == '3102') { // 'GPS Acquisition Counter'
            obj.gps_count = parseInt(hexStr.substr(i + 6, 4), 16); // uint16
        }
        else if (sID == '3103') { // 'US Measurement Counter'
            obj.us_sensor_count = parseInt(hexStr.substr(i + 6, 8), 16); // uint32
        }
        else if (sID == '5001') { // 'GPS Latitude'
            obj.latitude = parseFloat((numberToInt32(parseInt(hexStr.substr(i + 6, 8), 16)) / 1000000).toFixed(6));
        }
        else if (sID == '5002') { // 'GPS Longitude'
            obj.longitude = parseFloat((numberToInt32(parseInt(hexStr.substr(i + 6, 8), 16)) / 1000000).toFixed(6));
        }
        else if (sID == '5101') { // 'Battery'
            if (parseInt(hexStr.substr(i + 4, 2), 16) == 1) {
                obj.battery_vol = parseInt(hexStr.substr(i + 6, 2), 16) / 10; // uint8
            }
        }
        else {
            throw new Error("Invalid Payload: Wrong ID");  
        }

        i = i + (len * 2);
    }
    return obj;
}

function extractPoints(input) {
    var result = {};

    if (typeof input.message.temp !== "undefined") {
        result.temperature = input.message.temp;
    }
    if (typeof input.message.proxx !== "undefined") {
        result.distance = input.message.proxx;
    }
    if (typeof input.message.fillinglvl !== "undefined") {
        result.fillingLevel = input.message.fillinglvl;
    }
    if (typeof input.message.battery_vol !== "undefined") {
        result.batteryVoltage = input.message.battery_vol;
    }
    if (typeof input.message.longitude !== "undefined" && typeof input.message.latitude !== "undefined") {
        result.location = [input.message.longitude, input.message.latitude];
    }
    if (typeof input.message.gps_count !== "undefined") {
        result.gpsCount = input.message.gps_count;
    }
    if (typeof input.message.lora_count !== "undefined") {
        result.loraCount = input.message.lora_count;
    }
    if (typeof input.message.us_sensor_count !== "undefined") {
        result.UsSensorCount = input.message.us_sensor_count;
    }
    if (typeof input.message.serial_nr !== "undefined") {
        result.serialNumber = input.message.serial_nr;
    }
    return result;
}

exports.decodeUplink = decodeUplink;
exports.extractPoints = extractPoints;
