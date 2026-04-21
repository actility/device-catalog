var driver;
/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.encodeDownlinkExcept = void 0;
var Serializer_1 = __webpack_require__(2);
var config_header_1 = __webpack_require__(3);
var config_common_payloads_1 = __webpack_require__(4);
var common_1 = __webpack_require__(5);
var ENCODE_CONFIG_LOOKUP = {
    base: config_common_payloads_1.encodeConfigMessagePayloadBase,
    sensor: encodeConfigMessagePayloadSensor,
    sensor_conditions: encodeConfigMessagePayloadSensorConditions,
    user_calibration: encodeConfigMessagePayloadUserCalibration,
};
/**
 * The "main" entry function for the encoder. Based on  the input
 * it's determine which message it is and encodes it into a byte
 * array accordingly.
 *
 * @param input The object representing the message to be encoded
 * @returns the byte array of the encoded message
 * @throws {Error} in case something is wrong with the input data
 */
function encodeDownlinkExcept(input) {
    var PROTOCOL_VERSION_1 = 1;
    var FPORT_CONFIG_UPDATE = 7;
    var CONFIG_UPDATE_STR = 'config_update_req';
    // Prepare output with its default value
    var ser = new Serializer_1.Serializer();
    var fPort = 0;
    // Get request type based on message name
    var req_type = Object.keys(input)[0];
    var protocol_version = 0;
    // Get protocol_version from either "input.header" (old protocol) or "input.message_body" (new protocol, e.g. "config_update_req")
    // If it does not find protocol_version in the input, the value will default to '0' where the switch case below will handle it as a fault.
    for (var name_1 in input) {
        if (typeof input[name_1].protocol_version !== 'undefined') {
            protocol_version = input[name_1].protocol_version;
        }
    }
    switch (protocol_version) {
        case PROTOCOL_VERSION_1: {
            var req = input[req_type];
            switch (req_type) {
                case CONFIG_UPDATE_STR: {
                    fPort = FPORT_CONFIG_UPDATE;
                    var encodeFunction = ENCODE_CONFIG_LOOKUP[req.config_type];
                    if (encodeFunction == undefined) {
                        throw new Error('Invalid config type!');
                    }
                    if (typeof req.payload == 'undefined') {
                        (0, config_header_1.encodeConfigMessageHeader)(ser, protocol_version, req.config_type);
                    }
                    else {
                        (0, config_header_1.encodeConfigMessageHeaderWithTag)(ser, protocol_version, req.config_type, req.tag);
                        encodeFunction(ser, req.payload);
                    }
                    break;
                }
                default:
                    throw new Error('Unknown request type');
            }
            break;
        }
        default:
            throw new Error('Protocol version is not supported!');
    }
    if (fPort == 0 || ser.getLength() == 0) {
        throw new Error('Could not encode');
    }
    return { fPort: fPort, bytes: ser.getBytes() };
}
exports.encodeDownlinkExcept = encodeDownlinkExcept;
/**
 * Converts the sensor config to a byte array
 * @param ser The Serializer
 * @param payload The payload object of the sensor config message
 */
function encodeConfigMessagePayloadSensor(ser, payload) {
    validateDeviceType(payload.device_type);
    ser.pushUint8((0, common_1.lookupDeviceType)(payload.device_type));
    ser.pushUint8((0, config_common_payloads_1.encodeSensorSelection)(payload.switch_mask.selection));
    // Timing configs
    if (payload.measurement_interval_minutes == 0 ||
        payload.measurement_interval_minutes > 240) {
        throw new Error('measurement_interval_minutes outside of specification: ' +
            payload.measurement_interval_minutes);
    }
    else {
        ser.pushUint8(payload.measurement_interval_minutes); // Unit: m
    }
    if (payload.periodic_event_message_interval > 10080 ||
        payload.periodic_event_message_interval < 0) {
        // maximum allowed value
        throw new Error('periodic_event_message_interval outside of specification: ' +
            payload.periodic_event_message_interval);
    }
    else {
        ser.pushUint16(payload.periodic_event_message_interval); // Unit: -
    }
}
function encodeConfigMessagePayloadSensorConditions(ser, payload) {
    validateDeviceType(payload.device_type);
    ser.pushUint8((0, common_1.lookupDeviceType)(payload.device_type));
    if (!Array.isArray(payload.event_conditions) ||
        payload.event_conditions.length != 4) {
        throw new Error('event_conditions must be an array of 4');
    }
    var frequent_event = lookupFrequentEventBit(payload.event_conditions, 0) |
        lookupFrequentEventBit(payload.event_conditions, 1) |
        lookupFrequentEventBit(payload.event_conditions, 2) |
        lookupFrequentEventBit(payload.event_conditions, 3);
    ser.pushUint8(frequent_event);
    encodeEventCondition(ser, payload.event_conditions[0]);
    encodeEventCondition(ser, payload.event_conditions[1]);
    encodeEventCondition(ser, payload.event_conditions[2]);
    encodeEventCondition(ser, payload.event_conditions[3]);
}
/**
 * Converts the user calibration to a byte array
 * @param ser The Serializer
 * @param payload The user calibration config payload
 */
function encodeConfigMessagePayloadUserCalibration(ser, payload) {
    validateDeviceType(payload.device_type);
    ser.pushUint8((0, common_1.lookupDeviceType)(payload.device_type));
    if (typeof payload.coefficients == 'undefined') {
        throw new Error('coefficients not defined');
    }
    ser.pushFloat32(payload.coefficients.a || 0.0);
    ser.pushFloat32(payload.coefficients.b || 0.0);
    ser.pushFloat32(payload.coefficients.c || 0.0);
    ser.pushFloat32(payload.coefficients.d || 0.0);
    ser.pushFloat32(payload.coefficients.e || 0.0);
    ser.pushFloat32(payload.coefficients.f || 0.0);
}
/**
 * Convert a frequent boolean into a bitmask
 * @param conditions The conditions array
 * @param index The index in the condition array
 * @returns The bitmask corresponding frequent value
 */
function lookupFrequentEventBit(conditions, index) {
    var v = conditions[index].frequent_event || false;
    return v ? 1 << index : 0;
}
/**
 * Converts an event condition to a byte array
 * @param ser The Serializer
 * @param eventCondition One event condition object
 */
function encodeEventCondition(ser, eventCondition) {
    if (eventCondition.mode == 'off') {
        ser.pushUint8(0); // off is encoded as setting measurement window to zero
        ser.pushFloat32(0);
    }
    else {
        var mode = lookupConditionMode(eventCondition.mode);
        if (eventCondition.measurement_window < 1 ||
            eventCondition.measurement_window > 63) {
            throw new Error('measurement_window is outside of specification: ' +
                eventCondition.measurement_window);
        }
        ser.pushUint8(mode | (eventCondition.measurement_window << 2));
        ser.pushFloat32(eventCondition.measurement_threshold);
    }
}
/**
 * Converts the condition mode string to the corresponding index
 * @param mode the condition mode
 * @returns the corresponding index
 */
function lookupConditionMode(mode) {
    switch (mode) {
        case 'above':
            return 0;
        case 'below':
            return 1;
        case 'increasing':
            return 2;
        case 'decreasing':
            return 3;
        case 'off': // off is determined by setting measurement window to 0
        default:
            throw new Error('mode is outside of specification: ' + mode);
    }
}
/**
 * Throws an error if deviceType is not 'rt'
 * @param deviceType
 */
function validateDeviceType(deviceType) {
    if (deviceType != 'rt') {
        throw new Error('Invalid device type!');
    }
}


/***/ }),
/* 2 */
/***/ (function(__unused_webpack_module, exports) {


/**
 * A class to push elements onto a byte array.
 *
 * The push methods write a number of bytes depending on the type. On each push method the write index is forwarded by the corresponding number of bytes.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Serializer = void 0;
var BYTE_MASK = 0xff;
var Serializer = /** @class */ (function () {
    function Serializer() {
        this._buffer = [];
        this._writeIndex = 0;
    }
    /**
     * Puts a 8 bit number as one byte onto the byte array
     * @param value the 8 bit number
     */
    Serializer.prototype.pushUint8 = function (value) {
        if (value == undefined) {
            throw new Error('Variable undefined');
        }
        this._buffer.push(value & BYTE_MASK);
        this._writeIndex++;
    };
    /**
     * Puts a 16 bit number as two bytes onto the byte array
     * @param value the 16 bit number
     */
    Serializer.prototype.pushUint16 = function (value) {
        if (value == undefined) {
            throw new Error('Variable undefined');
        }
        this._buffer.push(value & BYTE_MASK);
        this._buffer.push((value >> 8) & BYTE_MASK);
        this._writeIndex += 2;
    };
    /**
     * Puts a 32 bit number as four bytes onto the byte array
     * @param value the 32 bit number
     */
    Serializer.prototype.pushUint32 = function (value) {
        if (value == undefined) {
            throw new Error('Variable undefined');
        }
        this._buffer.push(value & BYTE_MASK);
        this._buffer.push((value >> 8) & BYTE_MASK);
        this._buffer.push((value >> 16) & BYTE_MASK);
        this._buffer.push((value >> 24) & BYTE_MASK);
        this._writeIndex += 4;
    };
    /**
     * Puts a 32 float as four bytes onto the byte array
     * @param value the float
     */
    Serializer.prototype.pushFloat32 = function (value) {
        this.pushUint32(this.encodeFloat32(value));
    };
    /**
     * Converts a float value into a IEEE 754 32 bit number
     *
     * @param value the float to encode
     * @returns the 32 bit representing the IEEE 754 float
     */
    Serializer.prototype.encodeFloat32 = function (value) {
        var bytes = 0;
        switch (value) {
            case Number.POSITIVE_INFINITY:
                bytes = 0x7f800000;
                break;
            case Number.NEGATIVE_INFINITY:
                bytes = 0xff800000;
                break;
            case +0.0:
            case -0.0:
                bytes = 0x00000000;
                break;
            default: {
                // Note: don't use `Number.isNaN()` as it is not supported by `js2py`
                if (isNaN(value)) {
                    bytes = 0x7fc00000;
                    break;
                }
                if (value < 0.0) {
                    bytes = 0x80000000;
                    value = -value;
                }
                var exponent = Math.floor(Math.log(value) / Math.log(2));
                var significand = ((value / Math.pow(2, exponent)) * 0x00800000) | 0;
                exponent += 127;
                if (exponent >= 0xff) {
                    exponent = 0xff;
                    significand = 0;
                }
                else if (exponent < 0) {
                    exponent = 0;
                }
                bytes = bytes | (exponent << 23);
                bytes = bytes | (significand & ~(-1 << 23));
                break;
            }
        }
        return bytes;
    };
    /**
     * Puts a 16 float as four bytes onto the byte array
     * @param value the float
     */
    Serializer.prototype.pushFloat16 = function (value) {
        this.pushUint16(this.encodeFloat16(value));
    };
    /**
     * Converts a float value into a IEEE 754 16 bit number
     *
     * @param value the float to encode
     * @returns the 16 bit representing the IEEE 754 float
     */
    Serializer.prototype.encodeFloat16 = function (value) {
        var bytes = 0;
        switch (value) {
            case Number.POSITIVE_INFINITY:
                bytes = 0x7c00;
                break;
            case Number.NEGATIVE_INFINITY:
                bytes = 0xfc00;
                break;
            case +0.0:
            case -0.0:
                bytes = 0x0000;
                break;
            default: {
                // Note: don't use `Number.isNaN()` as it is not supported by `js2py`
                if (isNaN(value)) {
                    bytes = 0x7e00;
                    break;
                }
                if (value < 0.0) {
                    bytes = 0x8000;
                    value = -value;
                }
                var exponent = Math.floor(Math.log(value) / Math.log(2));
                var significand = ((value / Math.pow(2, exponent)) * 0x0400) | 0;
                exponent += 15;
                if (exponent >= 0x1f) {
                    exponent = 0x1f;
                    significand = 0;
                }
                else if (exponent < 0) {
                    exponent = 0;
                }
                bytes = bytes | (exponent << 10);
                bytes = bytes | (significand & ~(-1 << 10));
                break;
            }
        }
        return bytes;
    };
    /**
     * Get the length of the pushed data
     * @returns the number of bytes already pushed
     */
    Serializer.prototype.getLength = function () {
        return this._writeIndex;
    };
    /**
     * Get the byte array
     * @returns the byte array
     */
    Serializer.prototype.getBytes = function () {
        return Array.prototype.slice.call(this._buffer, 0, this._writeIndex);
    };
    return Serializer;
}());
exports.Serializer = Serializer;


/***/ }),
/* 3 */
/***/ (function(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.encodeConfigMessageHeaderWithTag = exports.encodeConfigMessageHeader = void 0;
/**
 * Encodes the config message header into a byte array
 * @param ser The Serializer
 * @param protocolVersion The protocol version of the byte formatting
 * @param configType The config type
 */
function encodeConfigMessageHeader(ser, protocolVersion, configType) {
    var b = 0;
    b += lookupConfigType(configType) & 0x0f;
    b += (protocolVersion & 0x0f) << 4;
    ser.pushUint8(b);
}
exports.encodeConfigMessageHeader = encodeConfigMessageHeader;
/**
 * Encodes the config message header into a byte array
 * @param ser The Serializer
 * @param protocolVersion The protocol version of the byte formatting
 * @param configType The config type
 */
function encodeConfigMessageHeaderWithTag(ser, protocolVersion, configType, tag) {
    encodeConfigMessageHeader(ser, protocolVersion, configType);
    ser.pushUint32(tag);
}
exports.encodeConfigMessageHeaderWithTag = encodeConfigMessageHeaderWithTag;
/**
 * Convert the config type string to the corresponding number
 * @param configType The config type
 * @returns the corresponding number
 */
function lookupConfigType(configType) {
    switch (configType) {
        case 'base':
            return 0;
        case 'sensor':
            return 3;
        case 'sensor_data':
            return 4;
        case 'sensor_conditions':
            return 5;
        case 'user_calibration':
            return 6;
        default:
            throw new Error('Unknown config_type: ' + configType);
    }
}


/***/ }),
/* 4 */
/***/ (function(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.encodeSensorSelection = exports.lookupMessageInterval = exports.encodeConfigMessagePayloadBase = void 0;
/**
 * Converting the payload of the base config message to a byte array
 * @param ser The Serializer
 * @param payload The base payload object of the config message
 */
function encodeConfigMessagePayloadBase(ser, payload) {
    // byte[0]
    ser.pushUint8(encodeBaseSwitchBitmask(payload.switch_mask));
    if (payload.periodic_message_random_delay_seconds < 0 ||
        payload.periodic_message_random_delay_seconds > 31) {
        throw new Error('periodic_message_random_delay_seconds is outside of specification: ' +
            payload.periodic_message_random_delay_seconds);
    }
    // byte[1]
    ser.pushUint8(payload.periodic_message_random_delay_seconds |
        (lookupMessageInterval(payload.status_message_interval) << 5));
}
exports.encodeConfigMessagePayloadBase = encodeConfigMessagePayloadBase;
/**
 * Converts the booleans of base switch to a bitmask
 * @param switchMask The object of booleans of base switch
 * @returns A bitmask
 */
function encodeBaseSwitchBitmask(switchMask) {
    var bitmask = 0;
    if (switchMask.enable_confirmed_event_message) {
        bitmask |= 1 << 0;
    }
    if (switchMask.enable_confirmed_data_message) {
        bitmask |= 1 << 1;
    }
    if (switchMask.allow_deactivation) {
        bitmask |= 1 << 2;
    }
    if (switchMask.enable_debug_info) {
        // Only for internal usage
        bitmask |= 1 << 3;
    }
    return bitmask;
}
/**
 * Convert the message interval string to the corresponding number. This is
 * mainly used for status message.
 * @param messageInterval The interval string
 * @returns the corresponding index
 */
function lookupMessageInterval(messageInterval) {
    switch (messageInterval) {
        case '2 minutes':
            return 0;
        case '15 minutes':
            return 1;
        case '1 hour':
            return 2;
        case '4 hours':
            return 3;
        case '12 hours':
            return 4;
        case '1 day':
            return 5;
        case '2 days':
            return 6;
        case '5 days':
            return 7;
        default:
            throw new Error('message interval is outside of specification: ' + messageInterval);
    }
}
exports.lookupMessageInterval = lookupMessageInterval;
/**
 * Convert the selection of which information the sensor event should send.
 * Either the minimum, maximum, average, or all together. The main reason
 * why this is a option is to reduce communication payload.
 * @param selection the string to select which info to send
 * @returns the index corresponding with the selection
 */
function encodeSensorSelection(selection) {
    var bitmask = 0;
    switch (selection) {
        case 'extended': // zero
            break;
        case 'min_only':
            bitmask |= 1 << 0;
            break;
        case 'max_only':
            bitmask |= 2 << 0;
            break;
        case 'avg_only':
            bitmask |= 3 << 0;
            break;
        default:
            throw new Error('Out of bound, selection: ' + selection);
    }
    return bitmask;
}
exports.encodeSensorSelection = encodeSensorSelection;


/***/ }),
/* 5 */
/***/ (function(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.lookupDeviceType = void 0;
/**
 * Convert a device type string to the corresponding number. This number is unique
 * within the scope of NEON products.
 * @param deviceType The device type
 * @returns The device type ID.
 */
function lookupDeviceType(deviceType) {
    switch (deviceType) {
        case 'ts':
            return 1;
        case 'vs-qt':
            return 2;
        case 'vs-mt':
            return 3;
        case 'tt':
            return 4;
        case 'ld':
            return 5;
        case 'vb':
            return 6;
        case 'cs': // TODO: shouldn't be this 'vs-cs'?
            return 7;
        case 'rt':
            return 8;
        default:
            throw new Error('Invalid device type!');
    }
}
exports.lookupDeviceType = lookupDeviceType;


/***/ }),
/* 6 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Decoder = exports.Decode = void 0;
var Deserializer_1 = __webpack_require__(7);
var common_1 = __webpack_require__(8);
var config_1 = __webpack_require__(9);
var generic_messages_1 = __webpack_require__(10);
/**
 * Decoder for ChirpStack v3 (loraserver) network server
 *
 * Decode an uplink message from a buffer
 * (array) of bytes to an object of fields.
 *
 * @param fPort The port on which the message is received
 * @param bytes The byte array of the received message
 * @returns the decoded object
 */
function Decode(fPort, bytes) {
    // Used for ChirpStack (aka LoRa Network Server)
    var PROTOCOL_VERSION_V1 = 1;
    // Message Ports // TODO: move this list outside, could it be an enum?
    var FPORT_BOOT = 1;
    var FPORT_DEVICE_STATUS = 2;
    var FPORT_SENSOR_EVENT = 3;
    var FPORT_ACTIVATION = 5;
    var FPORT_DEACTIVATION = 6;
    var FPORT_CONFIG_UPDATE = 7;
    var FPORT_UNCALIBRATED_MEASUREMENT = 8;
    if (fPort == 0 || bytes.length == 0) {
        // Ignore null payload OR MAC uplink
        return {};
    }
    var des = new Deserializer_1.Deserializer(bytes);
    // Handle generic LoRaWAN specified messages
    var genericResult = (0, generic_messages_1.handleGenericMessages)(fPort, des);
    if (genericResult) {
        return genericResult;
    }
    var protocol_version = (0, common_1.peekVersion)(des);
    switch (protocol_version) {
        case PROTOCOL_VERSION_V1: {
            switch (fPort) {
                case FPORT_BOOT: {
                    return decodeBootMessage(des);
                }
                case FPORT_DEVICE_STATUS: {
                    return decodeStatusMessage(des);
                }
                case FPORT_SENSOR_EVENT: {
                    return decodeEventMessage(des);
                }
                case FPORT_ACTIVATION: {
                    return decodeActivationMessage(des);
                }
                case FPORT_DEACTIVATION: {
                    return decodeDeactivatedMessage(des);
                }
                case FPORT_CONFIG_UPDATE:
                    return (0, config_1.decodeConfigUpdateAnswerMessage)(des);
                case FPORT_UNCALIBRATED_MEASUREMENT:
                    return decodeUncalibratedMeasurementMessage(des);
                default:
                    // NOTE: It could be unsupported device management message so there should be no assertion!
                    break;
            }
            break;
        }
        default:
            throw new Error('Unsupported protocol version!');
    }
    throw new Error('Not a known message');
}
exports.Decode = Decode;
/**
 * Decoder for The Things Network v2 network server
 *
 * @param bytes The byte array of the received message
 * @param fPort The port on which the message is received
 * @returns the decoded object
 */
function Decoder(bytes, fPort) {
    // for The Things Network server
    return Decode(fPort, bytes);
}
exports.Decoder = Decoder;
/**
 * Converts the byte array to an object representing the boot message
 * @param des The Deserializer
 * @returns the interpreted structure
 */
function decodeBootMessage(des) {
    var EXPECTED_LENGTH_NORMAL = 2;
    var EXPECTED_LENGTH_DEBUG = 18;
    if (des.getLength() != EXPECTED_LENGTH_NORMAL &&
        des.getLength() != EXPECTED_LENGTH_DEBUG) {
        throw new Error('Invalid boot message length ' +
            des.getLength() +
            ' instead of ' +
            EXPECTED_LENGTH_NORMAL +
            ' or ' +
            EXPECTED_LENGTH_DEBUG);
    }
    // byte[0]
    var protocol_version = des.pullUint8() >> 4;
    // byte[1]
    var reboot_reason = des.pullUint8();
    // optional debug data, byte[2..17]
    if (des.getLength() == EXPECTED_LENGTH_DEBUG) {
        var debug = '0x';
        for (var i = 0; i < EXPECTED_LENGTH_DEBUG - EXPECTED_LENGTH_NORMAL; i++) {
            debug += (0, common_1.hexFromUint8)(des.pullUint8());
        }
        return {
            boot: {
                protocol_version: protocol_version,
                reboot_reason: {
                    major: (0, common_1.lookupRebootReasonMajor)(reboot_reason),
                    minor: (0, common_1.lookupRebootReasonMinor)(reboot_reason)
                },
                debug: debug
            }
        };
    }
    else {
        return {
            boot: {
                protocol_version: protocol_version,
                reboot_reason: {
                    major: (0, common_1.lookupRebootReasonMajor)(reboot_reason),
                    minor: (0, common_1.lookupRebootReasonMinor)(reboot_reason)
                }
            }
        };
    }
}
/**
 * Converts the byte array to an object representing the normal sensor event message
 * @param des The Deserializer
 * @returns the interpreted structure
 */
function decodeSensorEventMessageNormal(des) {
    // byte[0]
    var protocol_version = des.pullUint8() >> 4;
    // byte[1]
    var selection = (0, common_1.lookupSensorEventSelection)(des.pullUint8());
    if (selection == 'extended') {
        throw new Error('Mismatch between extended bit flag and message length!');
    }
    // byte[2]
    var conditions = des.pullUint8();
    // byte[3..6]
    var measurement = (0, common_1.decodeSensorSingleValue)(des, selection);
    return {
        sensor_event: {
            protocol_version: protocol_version,
            selection: selection,
            condition_0: conditions & 1,
            condition_1: (conditions >> 1) & 1,
            condition_2: (conditions >> 2) & 1,
            condition_3: (conditions >> 3) & 1,
            trigger: (0, common_1.lookupSensorEventTrigger)((conditions >> 6) & 3),
            measurement: measurement
        }
    };
}
/**
 * Converts the byte array to an object representing the extended sensor event message
 * @param des The Deserializer
 * @returns the interpreted structure
 */
function decodeSensorEventMessageExtended(des) {
    var sensor_event = {};
    // byte[0]
    var protocol_version = des.pullUint8() >> 4;
    // byte[1]
    var selection = (0, common_1.lookupSensorEventSelection)(des.pullUint8());
    if (selection != 'extended') {
        throw new Error('Mismatch between extended bit flag and message length!');
    }
    // byte[2]
    var conditions = des.pullUint8();
    // byte[3..14]
    var measurement = (0, common_1.decodeSensorValue)(des);
    return {
        sensor_event: {
            protocol_version: protocol_version,
            selection: selection,
            condition_0: conditions & 1,
            condition_1: (conditions >> 1) & 1,
            condition_2: (conditions >> 2) & 1,
            condition_3: (conditions >> 3) & 1,
            trigger: (0, common_1.lookupSensorEventTrigger)((conditions >> 6) & 3),
            measurement: measurement
        }
    };
}
/**
 * Converts the byte array to an object representing the status message
 * @param des The Deserializer
 * @returns the interpreted structure
 */
function decodeStatusMessage(des) {
    var EXPECTED_LENGTH = 9;
    if (des.getLength() != EXPECTED_LENGTH) {
        throw new Error('Invalid device status message length ' +
            des.getLength() +
            ' instead of ' +
            EXPECTED_LENGTH);
    }
    var decoded = {
        device_status: {
            // byte[0]
            protocol_version: des.pullUint8() >> 4,
            // byte[1]
            battery_voltage: (0, common_1.convertBatteryVoltage)(des.pullUint8()),
            // byte[2]
            temperature: des.pullInt8(),
            // byte[3,4]
            lora_tx_counter: des.pullUint16(),
            // byte[5]
            avg_rssi: (0, common_1.lookupRssi)(des.pullUint8()),
            // byte[6,7]
            bist: '0x' + (0, common_1.hexFromUint16)(des.pullUint16()),
            // byte[8]
            event_counter: des.pullUint8()
        }
    };
    return decoded;
}
/**
 * Converts the byte array to an object representing the deactivated message
 * @param des The Deserializer
 * @returns the interpreted structure
 */
function decodeDeactivatedMessage(des) {
    var expected_length = 3;
    if (des.getLength() != expected_length) {
        throw new Error('Invalid deactivated message length ' +
            des.getLength() +
            ' instead of ' +
            expected_length);
    }
    // byte[0]
    var protocol_version = des.pullUint8() >> 4;
    // byte[1]
    var reason = des.pullUint8();
    // byte[2]
    var reason_length = des.pullUint8();
    if (reason_length != 0) {
        throw new Error('Unsupported reserved byte');
    }
    return {
        deactivated: {
            protocol_version: protocol_version,
            reason: lookupDeactivationReason(reason)
        }
    };
}
function lookupDeactivationReason(deactivation_id) {
    switch (deactivation_id) {
        case 0:
            return 'user_triggered';
        default:
            return 'unknown';
    }
}
/**
 * Converts the byte array to an object representing the activation message
 * @param des The Deserializer
 * @returns the interpreted structure
 */
function decodeActivationMessage(des) {
    var expected_length = 2;
    if (des.getLength() != expected_length) {
        throw new Error('Invalid activated message length ' +
            des.getLength() +
            ' instead of ' +
            expected_length);
    }
    var decoded = {
        activated: {
            // byte[0]
            protocol_version: des.pullUint8() >> 4,
            // byte[1]
            device_type: (0, common_1.lookupDeviceType)(des.pullUint8())
        }
    };
    return decoded;
}
/**
 * Converts the byte array to an object representing the sensor event message
 * @param des The Deserializer
 * @returns the interpreted structure
 */
function decodeEventMessage(des) {
    var EXPECTED_LENGTH_NORMAL = 7;
    var EXPECTED_LENGTH_EXTENDED = 15;
    if (des.getLength() == EXPECTED_LENGTH_NORMAL) {
        return decodeSensorEventMessageNormal(des);
    }
    else if (des.getLength() == EXPECTED_LENGTH_EXTENDED) {
        return decodeSensorEventMessageExtended(des);
    }
    else {
        throw new Error('Invalid sensor_event message length ' +
            des.getLength() +
            ' instead of ' +
            EXPECTED_LENGTH_NORMAL +
            ' or ' +
            EXPECTED_LENGTH_EXTENDED);
    }
}
/**
 * Converts the byte array to an object representing the uncalibrated measurement message
 * @param des The Deserializer
 * @returns the interpreted structure
 */
function decodeUncalibratedMeasurementMessage(des) {
    var EXPECTED_LENGTH = 5;
    if (des.getLength() != EXPECTED_LENGTH) {
        throw new Error('Invalid uncalibrated measurement message length ' +
            des.getLength() +
            ' instead of ' +
            EXPECTED_LENGTH);
    }
    // byte[0]
    var protocol_version = des.pullUint8() >> 4;
    // byte[1..4]
    var _a = des.pullFloat32(), value = _a[0], error = _a[1];
    var status = 'OK';
    if (typeof error == 'number') {
        status = (0, common_1.lookupMeasurementValueError)(error);
    }
    return {
        uncalibrated_measurement: {
            protocol_version: protocol_version,
            measurement: {
                uncalibrated_measurement: value,
                status: status
            }
        }
    };
}


/***/ }),
/* 7 */
/***/ (function(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Deserializer = void 0;
/**
 * A class to pull elements from a byte array.
 *
 * The pull methods read a number of bytes and interprets them. On each pull method the read index is forwarded by the corresponding number of bytes.
 */
var Deserializer = /** @class */ (function () {
    /**
     * Creates the Deserializer object from an number array
     * @param bytes The number array to be deserialized, its values are assume to be in the range of 0..255
     */
    function Deserializer(bytes) {
        this._index = 0;
        this._buffer = bytes;
    }
    /**
     * Reads the next 8 bit as uint8.
     *
     * @returns the value read
     */
    Deserializer.prototype.pullUint8 = function () {
        var v = this._buffer[this._index];
        this._index++;
        return v;
    };
    /**
    * Reads the next 8 bit as int8.
    *
    * @returns the value read
    */
    Deserializer.prototype.pullInt8 = function () {
        var uint8Value = this.pullUint8();
        // Convert the unsigned value to a signed value by checking the sign bit
        return (uint8Value & 0x80) ? -((~uint8Value + 1) & 0xFF) : uint8Value;
    };
    /**
     * Reads the next 16 bit as uint16.
     *
     * @returns the value read
     */
    Deserializer.prototype.pullUint16 = function () {
        var result = 0;
        var i = this._index + 1;
        result = this._buffer[i--];
        result = result * 256 + this._buffer[i--];
        this._index += 2;
        return result;
    };
    /**
     * Reads the next 32 bit as uint32.
     *
     * @returns the value read
     */
    Deserializer.prototype.pullUint32 = function () {
        var result = 0;
        var i = this._index + 3;
        result = this._buffer[i--];
        result = result * 256 + this._buffer[i--];
        result = result * 256 + this._buffer[i--];
        result = result * 256 + this._buffer[i--];
        this._index += 4;
        return result;
    };
    /**
     * Reads the next 32 bit as a 32 bit float.
     *
     * In case it is a NaN, the mantissa is interpreted as error code.
     *
     * @returns The first element is the float if it was not NaN, or undefined otherwise. In case of NaN the second element contains the error code from the mantissa.
     */
    Deserializer.prototype.pullFloat32 = function () {
        var bits = this.pullUint32();
        var v = this._decodeFloat(bits);
        // Note: don't use `Number.isNaN()` as it is not supported by `js2py`
        if (!isNaN(v)) {
            return [v, undefined];
        }
        else {
            // in case it is a NaN the error code is encoded in the mantissa
            var e = bits & 0x007fffff;
            return [null, e];
        }
    };
    /**
     * Converts IEEE 754 32 bit value into float
     * @param bits the 32 bit
     * @returns the float in Javascript number
     */
    Deserializer.prototype._decodeFloat = function (bits) {
        var sign = bits >>> 31 === 0 ? 1.0 : -1.0;
        var e = (bits >>> 23) & 0xff;
        if (e == 0xff) {
            if (bits & 0x7fffff) {
                return NaN;
            }
            else {
                return sign * Infinity;
            }
        }
        var m = e === 0 ? (bits & 0x7fffff) << 1 : (bits & 0x7fffff) | 0x800000;
        var f = sign * m * Math.pow(2, e - 150);
        return f;
    };
    /**
     * Get the number of the full byte array
     * @returns the length of the byte array
     */
    Deserializer.prototype.getLength = function () {
        return this._buffer.length;
    };
    /**
     * Resets the read index
     */
    Deserializer.prototype.reset = function () {
        this._index = 0;
    };
    return Deserializer;
}());
exports.Deserializer = Deserializer;


/***/ }),
/* 8 */
/***/ (function(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.lookupMessageInterval = exports.byteArrayFromHexString = exports.hexFromUint32 = exports.hexFromUint16 = exports.hexFromUint8 = exports.decodeSensorValue = exports.decodeSensorSingleValue = exports.convertBatteryVoltage = exports.lookupSensorEventTrigger = exports.lookupSensorEventSelection = exports.lookupMeasurementValueError = exports.lookupRebootReasonMinor = exports.lookupRebootReasonMajor = exports.lookupDeviceType = exports.lookupRssi = exports.peekVersion = void 0;
/**
 * The device types. Note the index corresponds with their numerical counterpart -1
 */
var DEVICE_TYPE_NAMES = [
    'ts',
    'vs-qt',
    'vs-mt',
    'tt',
    'ld',
    'vb',
    'cs',
    'rt'
];
/**
 * The possible error codes for measurements. Note that the index corresponds with their numerical counterpart - 1
 */
var MEASUREMENT_VALUE_ERROR_STRINGS = [
    'Hardware Error',
    'Upper Bound Error',
    'Lower Bound Error',
    'Factory Calibration Error',
    'Conversion Factor Error'
];
var MESSAGE_INTERVAL_LOOKUP = [
    '2 minutes',
    '15 minutes',
    '1 hour',
    '4 hours',
    '12 hours',
    '1 day',
    '2 days',
    '5 days'
];
/**
 * Get protocol version from the first byte
 *
 * Note that Deserializer will be reset afterwards (as the first byte might contain more data)
 *
 * @param des The Deserializer
 * @returns the protocol version
 */
function peekVersion(des) {
    des.reset();
    var data = des.pullUint8();
    des.reset();
    var protocol_version = data >> 4;
    return protocol_version;
}
exports.peekVersion = peekVersion;
/**
 * Converts an RSSI index to the corresponding string
 *
 * TODO: Could this be replace by an enum with lookup?
 *
 * @param rssiEnumID index of the RSSI
 * @returns the string representing the RSSI value range, or 'unknown' if not found
 */
function lookupRssi(rssiEnumID) {
    switch (rssiEnumID) {
        case 0:
            return '0..-79';
        case 1:
            return '-80..-99';
        case 2:
            return '-100..-129';
        case 3:
            return '<-129';
        default:
            return 'unknown';
    }
}
exports.lookupRssi = lookupRssi;
/**
 * Converts a numerical device type to the corresponding string
 *
 * TODO: Could this be replace by an enum with lookup?
 *
 * @param deviceTypeID index of the device type
 * @returns the corresponding string, or 'unknown' if not found
 */
function lookupDeviceType(deviceTypeID) {
    if (deviceTypeID >= 0 && deviceTypeID <= DEVICE_TYPE_NAMES.length) {
        return DEVICE_TYPE_NAMES[deviceTypeID - 1];
    }
    else {
        return 'unknown';
    }
}
exports.lookupDeviceType = lookupDeviceType;
/**
 * Converts a numerical major reboot reason ID to the corresponding string
 *
 * TODO: Could it be replace by an enum with lookup?
 *
 * @param rebootReasonID the numeric value of the reboot reason
 * @returns the corresponding string, or 'unknown' if not found
 */
function lookupRebootReasonMajor(rebootReasonID) {
    var majorRebootReason = rebootReasonID & 0x0f;
    switch (majorRebootReason) {
        case 0:
            return 'none';
        case 1:
            return 'config update';
        case 2:
            return 'firmware update';
        case 3:
            return 'button reset';
        case 4:
            return 'power';
        case 5:
            return 'communication failure';
        case 6:
            return 'system failure';
        default:
            return 'unknown';
    }
}
exports.lookupRebootReasonMajor = lookupRebootReasonMajor;
/**
 * Converts a numerical minor reboot reason ID to the corresponding string
 *
 * TODO: Combine it with {@link lookupRebootReasonMajor}
 * TODO: Could it be replace by an enum with lookup?
 *
 * @param rebootReasonID the numeric value of the reboot reason
 * @returns the corresponding string, or '' if not found
 */
function lookupRebootReasonMinor(rebootReason) {
    var majorRebootReason = rebootReason & 0x0f;
    var minorRebootReason = (rebootReason >> 4) & 0x0f;
    switch (majorRebootReason) {
        case 0:
            return ''; // No minor reboot reason
        case 1:
            return ''; // No minor reboot reason
        case 2:
            switch (minorRebootReason) {
                case 0:
                    return 'success';
                case 1:
                    return 'rejected';
                case 2:
                    return 'error';
                case 3:
                    return 'in progress';
                default:
                    return 'unknown';
            }
        case 3:
            return ''; // No minor reboot reason
        case 4:
            switch (minorRebootReason) {
                case 0:
                    return 'black out';
                case 1:
                    return 'brown out';
                case 2:
                    return 'power safe state';
                default:
                    return 'unknown';
            }
        case 5:
            return ''; // No minor reboot reason
        case 6:
            return ''; // No minor reboot reason
        default:
            return 'unknown';
    }
}
exports.lookupRebootReasonMinor = lookupRebootReasonMinor;
/**
 * Converts the error index to the corresponding string
 * @param errorIndex the binary error
 * @returns the corresponding string
 */
function lookupMeasurementValueError(errorIndex) {
    if (errorIndex > 0 && errorIndex <= MEASUREMENT_VALUE_ERROR_STRINGS.length) {
        return MEASUREMENT_VALUE_ERROR_STRINGS[errorIndex - 1];
    }
    else {
        return 'Unknown';
    }
}
exports.lookupMeasurementValueError = lookupMeasurementValueError;
/**
 * Converts the selection index to the corresponding string
 * @param selection the binary selection
 * @returns the corresponding string
 */
function lookupSensorEventSelection(selection) {
    switch (selection) {
        case 0:
            return 'extended';
        case 1:
            return 'min_only';
        case 2:
            return 'max_only';
        case 3:
            return 'avg_only';
        default:
            return 'unknown';
    }
}
exports.lookupSensorEventSelection = lookupSensorEventSelection;
/**
 * Converts the event trigger index to the corresponding string
 * @param trigger The binary event trigger
 * @returns the corresponding string
 */
function lookupSensorEventTrigger(trigger) {
    switch (trigger) {
        case 0:
            return 'condition change';
        case 1:
            return 'periodic';
        case 2:
            return 'button press';
        case 3:
            return 'frequent';
        default:
            return 'unknown';
    }
}
exports.lookupSensorEventTrigger = lookupSensorEventTrigger;
/**
 * Convert raw voltage level to Volts
 *
 * @param raw Raw value is between 0 - 255. 0 represent 2 V, while 255 represent 4 V
 * @returns The represented voltage level in Volts
 */
function convertBatteryVoltage(raw) {
    var OFFSET = 2; // Lowest voltage is 2 V
    var SCALE = 2 / 255;
    var voltage = raw * SCALE + OFFSET;
    return voltage;
}
exports.convertBatteryVoltage = convertBatteryVoltage;
/**
 * Reads the single measurement value and interprets depending on the selection
 * @param des The Deserializer
 * @param selection The selection, which is one of {@link lookupSensorEventSelection}
 * @returns An object with 'status' and if it is 'ok', one of the 'min', 'max' or 'avg' fields.
 */
function decodeSensorSingleValue(des, selection) {
    // TODO: use an interface for the return
    var status = 'OK';
    var _a = des.pullFloat32(), value = _a[0], error = _a[1];
    if (typeof error == 'number') {
        status = lookupMeasurementValueError(error);
    }
    // For reference this code does not work for `js2py`: TypeError: 'undefined' is not a function (tried calling property 'assign' of 'Function')
    // `Object.assign(measurementValue, { min: value });`
    // It is not clear what is the cause of it, but the workaround is not to use `Object.assign` in this function.
    if (selection == 'min_only') {
        return { status: status, min: value };
    }
    else if (selection == 'max_only') {
        return { status: status, max: value };
    }
    else if (selection == 'avg_only') {
        return { status: status, avg: value };
    }
    else {
        throw new Error('Only min_only, max_only, or, avg_only is accepted!');
    }
}
exports.decodeSensorSingleValue = decodeSensorSingleValue;
/**
 * Reads the triple measurement value (min/max/avg), this is only valid when {@link lookupSensorSelection} is 'extended'
 * @param des The Deserializer
 * @returns An object with 'status' and if it is 'ok', the 'min', 'max' and 'avg' fields.
 */
function decodeSensorValue(des) {
    var _a = des.pullFloat32(), value0 = _a[0], error0 = _a[1];
    var _b = des.pullFloat32(), value1 = _b[0], error1 = _b[1];
    var _c = des.pullFloat32(), value2 = _c[0], error2 = _c[1];
    var status = 'OK';
    if (typeof error0 === 'number') {
        if (error0 != error1 || error0 != error2) {
            throw new Error('Inconsistent error code!');
        }
        status = lookupMeasurementValueError(error0);
    }
    return { status: status, min: value0, max: value1, avg: value2 };
}
exports.decodeSensorValue = decodeSensorValue;
/**
 * Convert number to 2 digit HEX string, prefixed with zeros if needed
 * @param d The 8 bit number to be converted to HEX
 * @returns HEX string (without 0x prefix)
 */
function hexFromUint8(d) {
    return ('0' + Number(d).toString(16).toUpperCase()).slice(-2);
}
exports.hexFromUint8 = hexFromUint8;
/**
 * Convert number to 4 digit HEX string, prefixed with zeros if needed
 * @param d The 16 bit number to be converted to HEX
 * @returns HEX string (without 0x prefix)
 */
function hexFromUint16(d) {
    return ('000' + Number(d).toString(16).toUpperCase()).slice(-4);
}
exports.hexFromUint16 = hexFromUint16;
/**
 * Convert number to 8 digit HEX string, prefixed with zeros if needed
 * @param d The 32 bit number to be converted to HEX
 * @returns HEX string (without 0x prefix)
 */
function hexFromUint32(d) {
    return ('0000000' + Number(d).toString(16).toUpperCase()).slice(-8);
}
exports.hexFromUint32 = hexFromUint32;
/**
 * Decode a hex string into a byte array
 *
 * This is a copy from old code as is. TODO: Use typescript to do the conversion
 * @param hexString The hex string to decode
 * @returns byte array
 */
function byteArrayFromHexString(hexString) {
    if (typeof hexString != 'string')
        throw new Error('hex_string must be a string');
    if (!hexString.match(/^[0-9A-F]*$/gi))
        throw new Error('hex_string contain only 0-9, A-F characters');
    if ((hexString.length & 0x01) > 0)
        throw new Error('hex_string length must be a multiple of two');
    var byteString = [];
    for (var i = 0; i < hexString.length; i += 2) {
        var hex = hexString.slice(i, i + 2);
        byteString.push(parseInt(hex, 16));
    }
    return byteString;
}
exports.byteArrayFromHexString = byteArrayFromHexString;
/**
 * Converts a message interval index to the corresponding string
 * @param intervalIdx message interval index
 * @returns the corresponding string
 */
function lookupMessageInterval(intervalIdx) {
    if (intervalIdx >= 0 && intervalIdx < MESSAGE_INTERVAL_LOOKUP.length) {
        return MESSAGE_INTERVAL_LOOKUP[intervalIdx];
    }
    else {
        return 'Unknown';
    }
}
exports.lookupMessageInterval = lookupMessageInterval;


/***/ }),
/* 9 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.decodeConfigUpdateAnswerMessage = void 0;
var common_1 = __webpack_require__(8);
/**
 * The configuration type string. Note that the index corresponds with the numeric representation.
 */
var CONFIGURATION_TYPE_NAMES = [
    'base',
    'reserved',
    'reserved',
    'sensor',
    'data',
    'sensor_conditions',
    'user_calibration',
];
/**
 * Decodes the config answer message
 * @param des The Deserializer
 * @returns the `config_update_ans` object interpreted from the byte array
 */
function decodeConfigUpdateAnswerMessage(des) {
    var EXPECTED_LENGTH = 6;
    if (des.getLength() != EXPECTED_LENGTH) {
        throw new Error('Invalid config update ans message length ' +
            des.getLength() +
            ' instead of ' +
            EXPECTED_LENGTH);
    }
    // byte[0]
    var _a = decodeConfigHeader(des), protocolVersion = _a.protocolVersion, configType = _a.configType;
    // byte[1..4]
    var tag = des.pullUint32();
    // byte[5]
    var counter = des.pullUint8();
    return {
        config_update_ans: {
            protocol_version: protocolVersion,
            config_type: configType,
            tag: '0x' + (0, common_1.hexFromUint32)(tag),
            counter: counter & 0x0f
        }
    };
}
exports.decodeConfigUpdateAnswerMessage = decodeConfigUpdateAnswerMessage;
/**
 * Decodes the configuration header from the byte array
 * @param des Deserializer
 * @returns the protocol version and config type
 */
function decodeConfigHeader(des) {
    var data = des.pullUint8();
    var protocolVersion = data >> 4;
    var configType = lookupConfigType(data & 0x0f);
    return { protocolVersion: protocolVersion, configType: configType };
}
/**
 * Converts the numerical config type to the corresponding string
 *
 * TODO: Could this be replaced by an enum with lookup?
 *
 * @param typeId the config type id
 * @returns The corresponding string, or 'unknown' if not found
 */
function lookupConfigType(typeId) {
    if (typeId >= 0 && typeId < CONFIGURATION_TYPE_NAMES.length) {
        return CONFIGURATION_TYPE_NAMES[typeId];
    }
    else {
        return 'unknown';
    }
}


/***/ }),
/* 10 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.handleGenericMessages = void 0;
var common_1 = __webpack_require__(8);
/**
 * Entry point for generic messages
 *
 * Note currently only implemented Device Version Answer from Firmware Management Protocol
 *
 * @param fPort The port the message was received on, to determine the protocol
 * @param des The Deserializer containing the byte array
 * @returns An object containing the interpreted info, or undefined if not parsed
 */
function handleGenericMessages(fPort, des) {
    var FPORT_FIRMWARE_MANAGEMENT_PROTOCOL_SPECIFICATION = 203; // Firmware Management Protocol Specification TS006-1.0.0
    switch (fPort) {
        case FPORT_FIRMWARE_MANAGEMENT_PROTOCOL_SPECIFICATION: {
            var CID_DEV_VERSION = 0x01;
            var cid = des.pullUint8();
            switch (cid) {
                case CID_DEV_VERSION:
                    return {
                        DevVersion: {
                            FW_version: '0x' + (0, common_1.hexFromUint32)(des.pullUint32()),
                            HW_version: '0x' + (0, common_1.hexFromUint32)(des.pullUint32())
                        }
                    };
            }
        }
    }
}
exports.handleGenericMessages = handleGenericMessages;


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
!function() {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
var enc = __webpack_require__(1);
var dec = __webpack_require__(6);
var common_1 = __webpack_require__(8);
var decodeUplink = function (input) {
    var result = {};
    try {
        result.data = dec.Decode(input.fPort, input.bytes);
    }
    catch (e) {
        result.errors = [e.message];
    }
    return result;
};
var encodeDownlink = function (input) {
    var result = {};
    try {
        var obj = enc.encodeDownlinkExcept(input.data);
        result.fPort = obj.fPort;
        result.bytes = obj.bytes;
    }
    catch (e) {
        result.errors = [e.message];
    }
    return result;
};
var decodeDownlink = function (input) {
    var result = {};
    return result;
};
/**
 * Decoder for plain HEX string
 */
function DecodeHexString(fPort, hex_string) {
    return dec.Decode(fPort, (0, common_1.byteArrayFromHexString)(hex_string));
}
var Decode = dec.Decode; // ChirpStack v3 interface
var Decoder = dec.Decoder; // ThingsNetwork v2 interface
/**
 * Entry point for ChirpStack v3 interface
 */
function Encode(fPort, obj) {
    return enc.encodeDownlinkExcept(obj).bytes;
}
exports["default"] = {
    decodeUplink: decodeUplink,
    encodeDownlink: encodeDownlink,
    decodeDownlink: decodeDownlink,
    Decode: Decode,
    Decoder: Decoder,
    DecodeHexString: DecodeHexString,
    Encode: Encode
};

}();
driver = __webpack_exports__;
/******/ })()
;// Export it for NodeJS if available
if (typeof exports != 'undefined') {
  for (var name in driver.default) {
    exports[name] = driver.default[name];
  }
}

/*
 * LoRaWan Payload Codec interface
 *
 * @reference ts013-1-0-0-payload-codec-api.pdf
 */
function decodeUplink(input) {
  return driver.default.decodeUplink(input);
}

function encodeDownlink(input) {
  return driver.default.encodeDownlink(input);
}

function decodeDownlink(input) {
  throw new Error('Not implemented');
}

/**
 * Entry point for ChirpStack v3 interface
 */
function Encode(fPort, obj) {
  return driver.default.Encode(fPort, obj);
}
function Decode(fPort, bytes) {
  return driver.default.Decode(fPort, bytes);
}


/**
 * Entry point for ThingsNetwork v2 interface
 */
function Encoder(obj, fPort) {
  return Encode(fPort, obj);
}
function Decoder(bytes, fPort) {
  return Decode(fPort, bytes);
}


/**
 * Decoder for plain HEX string
 */
function DecodeHexString(fPort, hex_string) {
  return driver.default.DecodeHexString(fPort, hex_string);
}

//# sourceMappingURL=main.js.map