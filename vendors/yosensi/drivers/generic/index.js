/**
 * __  __                      _
 * \ \/ /__  ___ ___ ___  ___ (_)
 *  \  / _ \(_-</ -_) _ \(_-</ /
 *  /_/\___/___/\__/_//_/___/_/
 *
 * Yosensi JS payload decoder compatible with TTN v3 payload formatter and ChirpStack payload codec
 * Compatibility with ECMAScript 5 and later versions of the standard
 *
 * @author      Pawel Poplawski <pawel.poplawski@yosensi.io>
 * @version     1.0.3
 * @copyright   YOSENSI SP. Z O.O. | http://yosensi.io
 * @license     Modified-BSD-License, see LICENSE file include in the project
 *
 * @since 1.0.3
 *
 * Version with V1 payload decoding functionality with output compatible with TTN v3 payload formatter and ChirpStack payload codec.
 * In addition, a function for testing V1 payloads.
 * Added new measurement type (49). Update of example payload for new devices.
 * 
 * @since 1.0.2
 * 
 * Added new measurement types (39 to 48). Update of example payloads for new devices.
 * 
 * @since 1.0.1
 * 
 * Added energy consumption measurement type.
 * 
 * @since 1.0.0
 *
 * Version with V2 payload decoding functionality with output compatible with TTN v3 payload formatter and ChirpStact payload codec.
 * In addition, a function for testing V2 payloads.
 *
 * @example of using payload decoder locally
 *
 * // Example payloads for testing the V2 protocol
 * var SAMPLE_V2_PAYLOADS = Object.freeze({
 *    YO_360: "02:00:00:00:08:00:01:0b:62:0d:00:01:00:f6:10:00:00:2f:41:00:15:19:ff:f9:00:1e:00:5b",
 *    YO_AirflowPro: "02:00:00:00:08:00:01:11:ce:0d:00:01:00:f0:10:00:00:42:41:00:05:fe:f5:00:60:00:bd:15:00:01:08:ab:0d:00:11:25:00:f7",
 *    YO_AirflowProDual: "02:00:00:00:08:00:01:12:d0:0d:00:01:00:f8:10:00:00:1c:15:00:01:00:00:0d:00:11:25:00:fa:15:00:11:01:00:00:0d:00:11:26:00:f9",
 *    YO_AgriBox: "02:00:00:00:08:00:01:10:a8:0d:00:01:00:de:10:00:00:40:44:00:07:09:06:04:fd:04:fe:00:00:66:00:11:00:1e:90:66:00:11:01:11:7c:66:00:11:02:12:26",
 *    YO_Distance: "02:00:00:00:08:00:01:12:88:0d:00:01:00:cd:10:00:00:63:28:00:01:01:2e:41:00:05:00:12:ff:e8:05:fc",
 *    YO_H2O: "02:00:00:00:04:00:00:00:41:00:05:ff:fe:00:1e:00:74:08:00:01:0b:b8:0d:00:01:01:0e:10:00:00:21",
 *    YO_MeterPulse: "02:00:00:00:08:00:01:11:a2:0d:00:01:00:f8:10:00:00:37:5c:00:07:00:00:00:00:00:00:f7:a9",
 *    YO_Pulse: "02:01:00:00:04:00:11:01:00:00:04:00:11:12:00:01:04:00:11:13:00:00:60:00:11:04:00:3d:60:00:11:05:00:14:60:00:11:06:00:0b",
 *    YO_PurePro: "02:00:00:00:0d:00:01:00:ea:10:00:00:38:1a:00:01:00:2d:20:00:03:00:00:00:10:69:00:01:00:0b:6c:00:01:01:0c:70:00:01:00:53:25:00:11:02:00:1b",
 *    YO_RefrigerantMonitor: "02:00:00:00:08:00:01:11:a6:0d:00:01:01:07:10:00:00:33:16:00:11:6d:00:13:0d:00:11:6d:01:10",
 *    YO_Temp: "02:00:00:00:08:00:01:11:88:0d:00:01:00:f7:10:00:00:38:41:00:05:ff:ed:ff:e0:00:84:0d:00:11:00:00:ea:0d:00:11:01:00:db:0d:00:11:02:00:d6",
 *    YO_Modbus: "02:19:00:3C:90:01:33:02:c5:58:00:00:5f:f1:90:02:33:02:c5:5e:00:00:13:7e:90:03:33:02:c5:60:00:00:00:4f:90:04:33:02:c5:82:ff:ff:fd:df",
 *    YO_Power: "02:f8:00:75:2e:00:11:01:01:85:2e:00:11:02:00:de:2e:00:11:03:01:0c:2e:00:11:04:01:e9:2e:00:11:05:01:00:2e:00:11:06:01:12",
 *    YO_Power_kwh: "02:c6:04:73:9a:00:13:04:00:00:2e:a6:9a:00:13:05:00:00:34:cf:9a:00:13:06:00:00:1f:49",
 *    YO_Ambience: "02:25:00:00:08:00:01:10:b8:0d:00:01:01:0d:10:00:00:25:6c:00:01:02:79:1a:00:01:00:00:60:00:01:00:00",
 *    YO_Thermostat_1: "02:06:00:1e:08:00:01:14:d0:0d:00:01:01:28:10:00:00:28:1a:00:01:00:02:60:00:01:00:02",
 *    YO_Thermostat_2: "02:05:00:00:fd:00:11:07:00:d2:fd:00:11:08:ff:ec:fd:00:11:09:ff:d8:fd:00:11:0a:00:46:fc:00:10:0b:01:fd:00:11:0c:00:d2:fc:00:10:0d:00",
 *    YO_RelaySwitch: "02:05:00:00:08:00:01:5d:c5:04:00:11:ff:00:00:64:00:11:ff:00:00",
 *    YO_MeterReader_OI: "02:8a:00:3d:9f:00:33:01:08:00:00:b7:22:5a:9f:00:33:01:08:00:00:9d:32:33:9f:00:33:01:08:00:00:83:5f:26:9f:00:33:01:08:00:00:6c:55:2b",
 *    YO_MeterReader_LD: "02:c3:00:00:08:00:01:14:e0:0d:00:01:01:19:10:00:00:2a:5c:00:07:00:00:04:33:00:69:c6:09:99:00:03:00:01:0e:c8",
 *    YO_MeterReader_PI: "02:00:00:00:08:00:01:0f:15:0d:00:01:00:f5:10:00:00:23:58:00:07:00:00:00:97:01:c9:b2:e9:99:00:13:01:00:04:93:b6",
 *    YO_VibrationMonitor_1: "02:9f:00:3d:08:00:01:10:44:0d:00:01:00:bb:10:00:00:3f:0d:00:11:4a:00:bf:43:00:15:00:01:08:01:15:02:16:43:00:15:01:01:74:01:86:02:f0",
 *    YO_VibrationMonitor_2: "02:9d:0e:11:42:00:15:02:01:61:01:0f:01:2e:42:00:15:03:00:1a:00:1e:00:32:42:00:15:04:ff:f9:00:13:00:02:42:00:15:05:00:04:ff:d4:ff:da",
 *    YO_VibrationMonitor_3: "02:9e:0e:2f:42:00:15:06:00:9b:00:b6:00:ee:40:00:15:07:00:0c:00:0e:00:12",
 *    YO_PeopleCounter: "02:7d:00:3c:60:00:11:00:00:00:60:00:11:01:00:00:60:00:13:02:00:00:00:5c:60:00:13:03:00:00:00:52:60:00:13:04:00:00:00:0a",
 *    YO_ParticulateMatter_1: "02:02:00:00:08:00:01:1c:6e:0d:00:01:00:f0:10:00:00:24:41:00:05:ff:f7:00:21:00:00",
 *    YO_ParticulateMatter_2: "02:03:00:79:25:00:11:01:00:68:25:00:11:02:00:6f:25:00:11:03:00:70:25:00:11:04:00:70:24:00:11:11:00:53:24:00:11:12:00:53",
 *    YO_Atmos: "02:92:00:00:08:00:01:2a:eb:0d:00:01:00:ee:10:00:00:24:15:00:01:27:1f",
 *    YO_AgriPro: "02:16:00:00:08:00:01:29:ac:0d:00:01:00:ec:10:00:00:23:66:00:11:00:00:09:66:00:11:01:00:0b:0d:00:11:00:00:eb:0d:00:11:01:00:e8",
 *    YO_AirPressureMonitor: "02:20:00:00:08:00:01:1c:a0:0d:00:01:00:ef:10:00:00:30:15:00:01:00:8e:0d:00:11:28:00:e1:a2:00:01:01:a2"
 * });
 *
 * // Function call for testing V2 payloads for use outside TTN and ChirpStack formatters
 * testPayloadV2Decoder(SAMPLE_V2_PAYLOADS.YO_360);
 * 
 * // Example payloads for testing the V1 protocol
 * var SAMPLE_V1_PAYLOADS = Object.freeze({
 *    RTC_disabled: "01:00:4c:4e:50:43:01:02:01",
 *    RTC_enabled: "01:00:4c:4e:41:54:01:00:01:00:09:55:23"
 *    
 * });
 * // Function call for testing V1 payloads for use outside TTN and ChirpStack formatters
 * testPayloadV1Decoder(SAMPLE_V1_PAYLOADS.RTC_disabled);
 *
 */


/**
 * Decode uplink function compliant with TTN v3 payload formatter
 *
 * @param {object} input Input data object
 * @returns Decoded data with warnings/errors, if any, according to the TTN v3 payload formatter
 *
 */
function decodeUplink(input) {
    /**
     * Bytes of received payload
     */
    var bytes = input.bytes;
    /**
     * Protocol version
     */
    var protocolVersion = bytes[0] & 0xFF;
    /**
     * Object of decoded data
     */
    var decoded = {};
    /**
     * Utility functions
     */
    var utils = utilityFunctions();

    if (protocolVersion == supportedPayloadVersions().V1) {
        decoded = payloadV1Parse(bytes, new Date(), utils);
    }
    else if (protocolVersion == supportedPayloadVersions().V2) {
        decoded = payloadV2Parse(bytes, new Date(), utils);
    }
    else {
        decoded = payload({}, [], ["Unsupported payload. Supported versions: ".concat(utils.getStrFromArrOfObj(supportedPayloadVersions()), " but was: ", protocolVersion)]);
    }

    return {
        data: decoded.data,
        warnings: decoded.warnings,
        errors: decoded.errors
    };
}

/**
 * Decode function compliant with ChirpStack payload formatter
 *
 * @param {number} port Port on which data was received
 * @param {object} bytes Bytes of received payload
 * @returns Decoded data with warnings/errors, if any, according to the TTN v3 payload formatter, accepted by ChirpStack
 */
function Decode(port, bytes) {
    /**
     * Protocol version
     */
    var protocolVersion = bytes[0] & 0xFF;
    /**
     * Object of decoded data
     */
    var decoded = {};
    /**
     * Utility functions
     */
    var utils = utilityFunctions();

    if (protocolVersion == supportedPayloadVersions().V1) {
        decoded = payloadV1Parse(bytes, new Date(), utils);
    }
    else if (protocolVersion == supportedPayloadVersions().V2) {
        decoded = payloadV2Parse(bytes, new Date(), utils);
    }
    else {
        decoded = payload({}, [], ["Unsupported payload. Supported versions: ".concat(utils.getStrFromArrOfObj(supportedPayloadVersions()), " but was: ", protocolVersion)]);
    }

    return {
        data: decoded.data,
        warnings: decoded.warnings,
        errors: decoded.errors
    };
}

/**
 * Supported payload versions
 *
 * @returns Object with supported payload versions
 */
function supportedPayloadVersions() {
    var PAYLOAD_VER = Object.freeze({
        V1: 1,
        V2: 2
    });
    return PAYLOAD_VER;
}

/**
 * Test function for V2 payloads
 *
 * @param {string, object} data Example payload according to V2 protocol
 */
function testPayloadV2Decoder(data) {
    var input = {
        fPort: 0,
        bytes: []
    };
    var decoded;
    if (typeof (data) === "string") {
        var strArr = data.split(/[:;.,|-]+/);
        strArr.forEach(function (item) { input.bytes.push(parseInt(item, 16)) });
        decoded = decodeUplink(input);
        console.log(require('util').inspect(decoded, { showHidden: false, depth: null, colors: false }));
    }
    else if (typeof (data) === "object") {
        if (Array.isArray(data)) {
            input.bytes = data;
            decoded = decodeUplink(input);
            console.log(require('util').inspect(decoded, { showHidden: false, depth: null, colors: false }));
        }
    }
}

/**
 * Test function for V1 payloads
 *
 * @param {string, object} data Example payload according to V1 protocol
 */
function testPayloadV1Decoder(data) {
    var input = {
        fPort: 0,
        bytes: []
    };
    var decoded;
    if (typeof (data) === "string") {
        var strArr = data.split(/[:;.,|-]+/);
        strArr.forEach(function (item) { input.bytes.push(parseInt(item, 16)) });
        decoded = decodeUplink(input);
        console.log(require('util').inspect(decoded, { showHidden: false, depth: null, colors: false }));
    }
    else if (typeof (data) === "object") {
        if (Array.isArray(data)) {
            input.bytes = data;
            decoded = decodeUplink(input);
            console.log(require('util').inspect(decoded, { showHidden: false, depth: null, colors: false }));
        }
    }
}

/**
 * Payload
 *
 * @param {object} data Decoded data object
 * @param {object} warnings Warnings array, if any
 * @param {object} errors Errors array, if any
 * @returns Decoded data in TTN v3 payload formatter compatible format
 */
function payload(data, warnings, errors) {
    var payload = {
        /**
         * Data decoded from supported protocol
         */
        data: data,
        /**
         * Warnings array, if any
         */
        warnings: warnings,
        /**
         * Errors array, if any
         */
        errors: errors
    };
    return payload;
}

/**
 * Payload V1
 *
 * @param {number} payloadHeader Payload header
 * @param {string} dateTime Time of payload creation
 * @param {string} devName Device name
 * @param {string} fwVersion Firmware version
 * @param {string} timeDateSetting Device date and time setup
 * @returns Object with all payload V1 data
 */
function payloadV1(payloadHeader, dateTime, devName, fwVersion, timeDateSetting) {
    var data = {
        /**
         * Payload version
         */
        payloadVersion: 1,
        /**
         * Payload counter
         */
        payloadType: payloadHeader,
        /**
         * Time of payload creation
         */
        payloadDateTime: dateTime,
        /**
         * Device name
         */
        deviceName: devName,
        /**
         * Device firmware version
         */
        firmwareVersion: fwVersion,
        /**
         * Device Time and Date setting
         */
        devTimeDate: timeDateSetting,

    };
    return data;
}

/**
 * Payload V2
 *
 * @param {number} payloadCounter Payload counter
 * @param {string} dateTime Calculated time of payload creation
 * @param {object} measurements Array of measurements data objects
 * @returns Object with all payload V2 data
 */
function payloadV2(payloadCounter, dateTime, measurements) {
    var data = {
        /**
         * Payload version
         */
        payloadVersion: 2,
        /**
         * Payload counter
         */
        payloadCounter: payloadCounter,
        /**
         * Calculated time of payload creation
         * (payload reception date and time (current date and time by default) - received time difference between sending and creating payload)
         */
        payloadCreationDateTime: dateTime,
        /**
         * Array of measurements data objects
         */
        measurements: measurements,

    };
    return data;
}

/**
 * Payload V2 measurement
 *
 * @param {string} address Address of measurement
 * @param {string} dateTime Calculated time of measurement
 * @param {number} type Type of the measurement
 * @param {string} typeName Type name of the measurement
 * @param {string} typeUnits Type units of the measurement
 * @param {number} value Measurement value
 * @returns Object with payload V2 single measurement data
 */
function payloadV2Measurement(address, dateTime, type, typeName, typeUnits, value) {
    var measurement = {
        /**
         * Address of measurement
         */
        address: address,
        /**
         * Calculated time of measurement
         * (payload creation date and time + received time difference between getting the measurement and creating payload)
         */
        dateTime: dateTime,
        /**
         * Type of the measurement
         */
        type: type,
        /**
         * Type name of the measurement
         */
        typeName: typeName,
        /**
         * Type units of the measurement
         */
        typeUnits: typeUnits,
        /**
         * Measurement value
         */
        value: value
    };
    return measurement;
}

/**
 * Payload V1 parser function
 *
 * @param {object} bytes Bytes of received payload
 * @param {object} date Payload reception date and time (current date and time by default)
 * @param {object} utils Utility functions
 * @returns Decoded payload and/or error array, if any, compatible with TTN v3 payload formatter
 *
 */
function payloadV1Parse(bytes, date, utils) {
    var DOWNLINK_V1_HDR_LEN = 2;
    var V1_PAYLOAD_ID00_INFO_TIME_LEN = 13;

    var PAYLOAD_V1_PROTOCOL_ID = Object.freeze({
        0: ["Device time, date and general information"]
    });

    /**
     * Payload V1 measurement types and units
     */
    var PAYLOAD_V1_DEV_SHORT_NAME = Object.freeze({
        LNPC: ["YO 360"],
        LNPT: ["YO Pressure Transuder"],
        LNDI: ["YO Pulse"],
        LNFD: ["YO H2O"],
        LNPP: ["YO Pure Pro"],
        LNTP: ["YO Temp"],
        LNPW: ["YO Power"],
        LNAA: ["YO Animal Tracker"],
        LNAP: ["YO Airflow Pro"],
        LNDN: ["YO Distance"],
        LNAN: ["YO Analog"],
        LNAG: ["YO AgriBox"],
        LNMP: ["YO Meter Pulse"],
        LNRS: ["YO Modbus"],
        LNFM: ["YO Refrigerant Monitor"],
        LNRP: ["YO People Counter"],
        LNDA: ["YO Airflow Pro Dual"],
        LNRS: ["YO Relay Switch"],
        LNAB: ["YO Ambience"],
        LNMR: ["YO Meter Reader 2.0"],
        LNVM: ["YO Vibration Monitor"],
        LNTS: ["YO Thermostat"],
        LNPM: ["YO Particulate Matter Sensor"],
        LNAT: ["YO Atmos"],
        LNAO: ["YO Agri Pro"]
    });


    if (!checkInputDataType(bytes)) return raiseError("Incorrect input data type. Payload should only consist of numeric values");

    try {
        return parse(bytes, date);
    }
    catch (err) {
        return raiseError("Input data parse failed. ".concat(err));
    }

    function parse(bytes, date) {
        var devName;
        var fwVer;
        var infoTime;
        if (bytes.length < DOWNLINK_V1_HDR_LEN) return raiseError("Payload length must be at least 2 but was: ".concat(bytes.length));
        if (bytes.length > 49) return raiseError("Payload length too long: ".concat(bytes.length));

        var dateTime = new Date(Number(date));

        devName = getDeviceNameFromBytes(bytes);
        fwVer = getDeviceFwVerFromBytes(bytes);

        if (bytes.length == V1_PAYLOAD_ID00_INFO_TIME_LEN){
            infoTime = extractDeviceTime(bytes);
            return payload(payloadV1(extractPayloadHeader(bytes), dateTime.toISOString(), devName, fwVer, infoTime.toISOString()), [], []);
        } else {
            return payload(payloadV1(extractPayloadHeader(bytes), dateTime.toISOString(), devName, fwVer), [], []);
        }
    }

    function getDeviceNameFromBytes(bytes) {
        if (bytes.length < 5) return null;

        var shortName = "";
        for (var i = 2; i <= 5; i++) {
            shortName += String.fromCharCode(bytes[i]);
        }

        if (PAYLOAD_V1_DEV_SHORT_NAME.hasOwnProperty(shortName)) {
            return PAYLOAD_V1_DEV_SHORT_NAME[shortName][0];
        }

        return null;
    }

    function getDeviceFwVerFromBytes(bytes) {
        if (bytes.length < 9) return null;
        var fwVer = "";
        fwVer = bytes[6] + "." + bytes[7] + "." + bytes[8];
        return fwVer;
    }

    function checkInputDataType(bytes) {
        if (typeof (bytes) === "object") {
            for (var i = 0; i < bytes.length; i++) {
                if (typeof (bytes[i]) !== "number") {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    function extractPayloadHeader(bytes) {
        if (PAYLOAD_V1_PROTOCOL_ID.hasOwnProperty(utils.unsignedNbrFromByte(bytes[1]))) {
            return PAYLOAD_V1_PROTOCOL_ID[utils.unsignedNbrFromByte(bytes[1])][0];
        }
        return null;
    }

    function extractDeviceTime(bytes) {
        var value = 0;
        var count = 4;
        for (var i = 9; i < 13; i++) {
            value |= (bytes[i] & 0xFF) << (8 * --count);
        }
        var date = new Date(value * 1000);
        return date;
    }

    function raiseError(message) {
        return payload({}, [], [message]);
    }
}

/**
 * Payload V2 parser function
 *
 * @param {object} bytes Bytes of received payload
 * @param {object} date Payload reception date and time (current date and time by default)
 * @returns Decoded payload and/or error array, if any, compatible with TTN v3 payload formatter
 *
 */
function payloadV2Parse(bytes, date, utils) {
    /**
     * Payload V2 measurement types and units
     */
    var PAYLOAD_V2_MEAS_TYPES = Object.freeze({
        1: ["state", ""],
        2: ["battery voltage", "[mV]"],
        3: ["temperature", "[°C]"],
        4: ["relative humidity", "[%]"],
        5: ["pressure", "[hPa]"],
        6: ["illuminance", "[lux]"],
        7: ["CO2 equivalent", "[ppm]"],
        8: ["TVOC concentration", "[ppb]"],
        9: ["dust concentration", "[ug/m3]"],
        10: ["distance", "[mm]"],
        11: ["current", "[mA or A]"],
        12: ["voltage", "[mV] or [V]"],
        13: ["power", "[W]"],
        14: ["acceleration - x, y, z", "[g]"],
        15: ["three-value custom", ""],
        16: ["three-value custom", ""],
        17: ["four-value custom", ""],
        18: ["four-value custom", ""],
        19: ["vibration intensity", ""],
        20: ["vibration acceleration", ""],
        21: ["0-10V external analog - ?", "mV"],
        22: ["two-value custom", ""],
        23: ["two-value custom", ""],
        24: ["counter", ""],
        25: ["custom", ""],
        26: ["CO", "[ppm]"],
        27: ["CO2", "[ppm]"],
        28: ["sound pressure level", "[dB]"],
        29: ["custom", ""],
        30: ["custom", ""],
        31: ["custom", ""],
        32: ["PM1", "[ug/m3]"],
        33: ["PM2.5", "[ug/m3]"],
        34: ["PM4", "pug/m3]"],
        35: ["PM10", "pug/m3]"],
        36: ["generic modbus", ""],
        37: ["O2", "[%]"],
        38: ["Energy consumption", "[kWh]"],
        39: ["OBIS", ""],
        40: ["Velocity", "m/s"],
        41: ["Modbus read coils", ""],
        42: ["Modbus read discrete inputs", ""],
        44: ["Modbus read input registers", ""],
        45: ["Modbus write single coil", ""],
        46: ["Modbus write single holding register", ""],
        47: ["Modbus write multiple coils", ""],
        48: ["Modbus write multiple holding registers", ""],
        49: ["Irradiance", "W/m2"],
        62: ["RSSI", "dBm"],
        63: ["Command", ""]
    });
    /**
     * Two-value custom types
     */
    var values2Types = Object.freeze([22, 23]);
    /**
     * Three-value custom types
     */
    var values3Types = Object.freeze([15, 16]);
    /**
     * Four-value custom types
     */
    var values4Types = Object.freeze([17, 18]);

    if (!checkInputDataType(bytes)) return raiseError("Incorrect input data type. Payload should only consist of numeric values");

    try {
        return parse(bytes, date);
    }
    catch (err) {
        return raiseError("Input data parse failed. ".concat(err));
    }

    function parse(bytes, date) {
        var measurements = [];
        if (bytes.length < 7) return raiseError("Payload length must be at least 7 but was: ".concat(bytes.length));
        var currPos = 4;
        var dateTime = extractPayloadDateTime(bytes, date);
        var measLen;
        while (currPos < bytes.length) {
            if (bytes.length - currPos < 4) {
                return raiseError("Payload measurement (started at ".concat(currPos, " byte) length must be at least 4 but was: ", bytes.length - currPos));
            }
            measLen = 3 + extractAddressLength(bytes[currPos + 2]) + extractValueLength(bytes[currPos + 2]);
            if (bytes.length < currPos + measLen) {
                return raiseError("Package measurement (started at ".concat(currPos, " byte) corrupted. Expected length: ", measLen, " but was: ", bytes.length - currPos));
            }
            var currentMeas = parseMeasurement(bytes.slice(currPos, currPos + measLen), dateTime);
            if (Array.isArray(currentMeas)) {
                for (var i = 0; i < currentMeas.length; i++) {
                    measurements.push(currentMeas[i]);
                }
            }
            else {
                measurements.push(currentMeas);
            }
            currPos += measLen;
        }
        return payload(payloadV2(extractPayloadCnt(bytes), dateTime.toISOString(), measurements), [], []);
    }

    function parseMeasurement(bytes, date) {
        if (bytes.length < 4) return raiseError("Measurement length must be at least 4 but was: ".concat(bytes.length));
        var dateTime = extractMeasurementDateTime(bytes[1], date);
        var valueLen = extractValueLength(bytes[2]);
        var addrLen = extractAddressLength(bytes[2]);
        var expectedLen = 3 + valueLen + addrLen;
        if (bytes.length != expectedLen) return raiseError("Measurement bytes corrupted. Expected length: ".concat(expectedLen, " but was: ", bytes.length));
        var type = extractMeasurementType(bytes[0]);
        var address = extractAddress(bytes);
        var value = extractValue(bytes);
        var typeName = "undefined";
        var typeUnits = "undefined";
        if (PAYLOAD_V2_MEAS_TYPES.hasOwnProperty(type)) {
            typeName = PAYLOAD_V2_MEAS_TYPES[type][0];
            typeUnits = PAYLOAD_V2_MEAS_TYPES[type][1];
        }
        if (utils.checkIfArrInclude(values4Types, type)) {
            if (valueLen != 8) return raiseError("Extender measurement bytes corrupted. Expected value length: 8 but was: ".concat(bytes.length));
            return [
                payloadV2Measurement(address + "00", dateTime.toISOString(), type, typeName, typeUnits, extractValueFromRange(bytes, 0, 2)),
                payloadV2Measurement(address + "01", dateTime.toISOString(), type, typeName, typeUnits, extractValueFromRange(bytes, 2, 4)),
                payloadV2Measurement(address + "02", dateTime.toISOString(), type, typeName, typeUnits, extractValueFromRange(bytes, 4, 6)),
                payloadV2Measurement(address + "03", dateTime.toISOString(), type, typeName, typeUnits, extractValueFromRange(bytes, 6, 8))
            ];
        }
        else if (utils.checkIfArrInclude(values3Types, type)) {
            if (valueLen != 6) return raiseError("Values 3 measurement bytes corrupted. Expected value length: 6 but was: ".concat(bytes.length));
            return [
                payloadV2Measurement(address + "00", dateTime.toISOString(), type, typeName, typeUnits, extractValueFromRange(bytes, 0, 2)),
                payloadV2Measurement(address + "01", dateTime.toISOString(), type, typeName, typeUnits, extractValueFromRange(bytes, 2, 4)),
                payloadV2Measurement(address + "02", dateTime.toISOString(), type, typeName, typeUnits, extractValueFromRange(bytes, 4, 6))
            ];
        }
        else if (utils.checkIfArrInclude(values2Types, type)) {
            if (valueLen < 2 || valueLen % 2 !== 0) return raiseError("Values 2 measurement bytes corrupted. Expected value length: \'2 * n\' but was: ".concat(bytes.length));
            return [
                payloadV2Measurement(address + "00", dateTime.toISOString(), type, typeName, typeUnits, extractValueFromRange(bytes, 0, valueLen / 2)),
                payloadV2Measurement(address + "01", dateTime.toISOString(), type, typeName, typeUnits, extractValueFromRange(bytes, valueLen / 2, valueLen))
            ];
        }
        return payloadV2Measurement(address, dateTime.toISOString(), type, typeName, typeUnits, value);
    }

    function checkInputDataType(bytes) {
        if (typeof (bytes) === "object") {
            for (var i = 0; i < bytes.length; i++) {
                if (typeof (bytes[i]) !== "number") {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    function extractPayloadCnt(bytes) {
        return utils.unsignedNbrFromByte(bytes[1]);
    }

    function extractPayloadDateTime(bytes, date) {
        return new Date(Number(date) - (utils.unsignedNbrFromBytes(bytes.slice(2, 4)) * 1000));
    }

    function extractAddressLength(byte) {
        return (byte >> 4) & 0x0F;
    }

    function extractValueLength(byte) {
        return (byte & 0x0F) + 1;
    }

    function extractMeasurementType(byte) {
        return (byte >> 2) & 0x3F;
    }

    function extractValuePrecision(byte) {
        return byte & 0x03;
    }

    function extractMeasurementDateTime(byte, date) {
        return new Date(Number(date) + (utils.unsignedNbrFromByte(byte) * 1000));
    }

    function extractAddress(bytes) {
        var addressLen = extractAddressLength(bytes[2]);
        if (addressLen === 0) return "";
        return utils.encodeHexString(bytes.slice(3, 3 + addressLen));
    }

    function extractValue(bytes) {
        var precision = extractValuePrecision(bytes[0]);
        var valueLen = extractValueLength(bytes[2]);
        var addressLen = extractAddressLength(bytes[2]);
        var value = utils.signedNbrFromBytes(bytes.slice((3 + addressLen), (3 + addressLen + valueLen)));
        value = (value / Math.pow(10, precision));
        return utils.toFixedNumber(value, precision, 10);
    }

    function extractValueFromRange(bytes, valueFrom, valueTo) {
        var precision = extractValuePrecision(bytes[0]);
        var valueLen = extractValueLength(bytes[2]);
        var addressLen = extractAddressLength(bytes[2]);
        if (valueTo > valueLen) return raiseError("Extract value size out of index for value from: ".concat(valueFrom, " to: ", valueTo));
        var value = utils.signedNbrFromBytes(bytes.slice((3 + addressLen + valueFrom), (3 + addressLen + valueTo)));
        value = (value / Math.pow(10, precision));
        return utils.toFixedNumber(value, precision, 10);
    }

    function raiseError(message) {
        return payload({}, [], [message]);
    }
}

/**
 * Set of utility functions
 *
 * @returns Utility functions
 */
function utilityFunctions() {

    function unsignedNbrFromByte(byte) {
        return (byte & 0xFF);
    }

    function signedNbrFromByte(byte) {
        if (byte & 0x80) {
            return (byte - 0x100);
        }
        return (byte & 0xFF);
    }

    function unsignedNbrFromBytes(bytes) {
        var value = 0;
        var count = bytes.length;
        for (var i = 0; i < bytes.length; i++) {
            value |= (bytes[i] & 0xFF) << (8 * --count);
        }
        return value;
    }

    function signedNbrFromBytes(bytes) {
        var value = 0;
        var count = bytes.length;
        var firstByteValue;
        var bytesWithoutFirst;
        if (bytes[0] & 0x80) {
            firstByteValue = bytes[0] - 0x100;
        }
        else {
            firstByteValue = bytes[0] & 0xFF;
        }
        value |= firstByteValue << (8 * --count);
        bytesWithoutFirst = bytes.slice(1, bytes.length);
        for (var i = 0; i < bytesWithoutFirst.length; i++) {
            value |= (bytesWithoutFirst[i] & 0xFF) << (8 * --count);
        }
        return value;
    }

    function encodeHexString(bytes) {
        var hexStr = "";
        for (var i = 0; i < bytes.length; i++) {
            if (bytes[i] < 16) {
                hexStr = hexStr + '0';
            }
            hexStr = hexStr + bytes[i].toString(16);
        }
        return hexStr;
    }

    function getStrFromArrOfObj(bytes) {
        var str = "";
        Object.keys(bytes).forEach(function (key) {
            str += bytes[key] + ", "
        });
        return str.slice(0, -2);
    }

    function toFixedNumber(value, precision, base) {
        var pow = Math.pow(base || 10, precision);
        return Math.round(value * pow) / pow;
    }

    function checkIfArrInclude(bytes, byte) {
        for (var i = 0; i < bytes.length; i++) {
            if (bytes[i] == byte) {
                return true;
            }
        }
        return false;
    }

    return {
        unsignedNbrFromByte: unsignedNbrFromByte,
        signedNbrFromByte: signedNbrFromByte,
        unsignedNbrFromBytes: unsignedNbrFromBytes,
        signedNbrFromBytes: signedNbrFromBytes,
        encodeHexString: encodeHexString,
        getStrFromArrOfObj: getStrFromArrOfObj,
        toFixedNumber: toFixedNumber,
        checkIfArrInclude: checkIfArrInclude
    };
}

exports.decodeUplink = decodeUplink;