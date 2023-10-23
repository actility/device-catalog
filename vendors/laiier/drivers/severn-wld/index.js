"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
/*
Copyright Bare Conductive Ltd. - All Rights Reserved

Unauthorised copying of this file, via any medium is strictly prohibited.
Proprietary and confidential.

Severn implementation of LoRaWAN® Payload Codec API Specification TS013-1.0.0
*/
var VERSION = "v1.8.0";
var MsgPort;
(function (MsgPort) {
    MsgPort[MsgPort["Startup"] = 100] = "Startup";
    // Profile 0
    MsgPort[MsgPort["P0_Regular"] = 1] = "P0_Regular";
    MsgPort[MsgPort["P0_Emergency"] = 99] = "P0_Emergency";
    MsgPort[MsgPort["P0_Self_test"] = 102] = "P0_Self_test";
    MsgPort[MsgPort["P0_Basic_config"] = 103] = "P0_Basic_config";
    // Profile 1
    MsgPort[MsgPort["P1_Regular"] = 2] = "P1_Regular";
    MsgPort[MsgPort["P1_Emergency"] = 98] = "P1_Emergency";
    MsgPort[MsgPort["P1_Self_test"] = 104] = "P1_Self_test";
    MsgPort[MsgPort["P1_Basic_config"] = 105] = "P1_Basic_config";
})(MsgPort || (MsgPort = {}));
var SEVERN_JOIN_FLAG_ERROR_BIT = 4;
var SEVERN_SENSOR_CONNECTED_BIT = 5;
var SEVERN_SELF_TEST_FAILED_BIT = 6;
var SEVERN_EMERGENCY_STATE_BIT = 7;
var LOW_TEMP_WARNING_C = 3;
// Classes for JSON structs
var P0RegularMessage = /** @class */ (function () {
    function P0RegularMessage() {
        this.event_type = "Regular";
        this.electrode_is_wet = [false, false, false,
            false, false, false,
            false, false, false,
            false, false, false];
        this.num_wet_electrodes = 0;
        this.critically_wet = false;
        this.critically_wet_threshold = 0;
        this.regular_message_interval_min = 0;
        this.self_test_failed = false;
        this.temp_c = 0;
        this.acc = {
            x_g: 0,
            y_g: 0,
            z_g: 0
        };
        this.profile = 0;
        this.decoder_version = VERSION;
    }
    return P0RegularMessage;
}());
var P1RegularMessage = /** @class */ (function (_super) {
    __extends(P1RegularMessage, _super);
    function P1RegularMessage() {
        var _this = _super.call(this) || this;
        _this.profile = 1;
        _this.sensor_connected = true;
        _this.join_error = false;
        _this.failed_join_requests = 0;
        _this.batt = 3.6;
        return _this;
    }
    return P1RegularMessage;
}(P0RegularMessage));
var StartupMessage = /** @class */ (function () {
    function StartupMessage() {
        this.event_type = "Startup";
        this.serial_number = "";
        this.firmware_version = {
            major: 0,
            minor: 0,
            patch: 0,
        };
        this.decoder_version = VERSION;
    }
    return StartupMessage;
}());
var ConfigOptions = /** @class */ (function () {
    function ConfigOptions() {
        this.critically_wet_threshold = 4;
        this.regular_message_interval_min = 14400;
        this.profile = 0;
    }
    return ConfigOptions;
}());
function isSuccessfulDecode(obj) {
    return obj !== undefined;
}
function int8(input) {
    // If bit 0x80 set, deduct 0x100, otherwise return input.
    return input & 0x80 ? input - 0x100 : input;
}
function round_dp(number, decimal_places) {
    var factorOfTen = Math.pow(10, decimal_places);
    return Math.round(number * factorOfTen) / factorOfTen;
}
function signed_2_bit(number) {
    switch (number) {
        case 0:
        case 1:
            return number;
        case 2:
            return -1;
        default:
            return 0;
    }
}
function toHexString(byteArray) {
    var num_array = [];
    if (typeof byteArray == "number")
        num_array = byteArray;
    else {
        for (var i = 0; i < byteArray.length; i++) {
            num_array.push(parseInt(byteArray[i], 10));
        }
        ;
    }
    return num_array.map(function (byte) {
        return ('0' + (byte & 0xFF).toString(16).toUpperCase()).slice(-2);
    }).join('');
}
function fromHexString(s) {
    var b = [];
    for (var index = 0; index < s.length; index += 2) {
        var hex_str = s.slice(index, index + 2);
        b.push(parseInt(hex_str, 16));
    }
    return b;
}
function decodeUplink(input) {
    var data = null;
    var warnings = [];
    var errors = [];
    switch (input.fPort) {
        // Profile 0 Decoders
        case MsgPort.P0_Regular:
        case MsgPort.P0_Emergency:
        case MsgPort.P0_Self_test:
            if (input.bytes.length != 9) {
                errors.push("Unexpected payload length: ".concat(input.bytes.length, ", fPort: ").concat(input.fPort));
                break;
            }
            // Decode Uplink
            data = new P0RegularMessage();
            // Set default value for event_type, then set based off another case/switch
            data.event_type = "Regular";
            switch (input.fPort) {
                case MsgPort.P0_Regular:
                    data.event_type = "Regular";
                    break;
                case MsgPort.P0_Emergency:
                    data.event_type = "Emergency";
                    break;
                case MsgPort.P0_Self_test:
                    data.event_type = "Self_test";
                    break;
            }
            ;
            // Check if electrodes are wet:
            // Byte 0 bits 0..3 segments 8..11: 0 = dry, 1 = wet
            // Byte 1 bits 0..7 segments 0..7
            data.electrode_is_wet = [];
            for (var i = 0; i < 12; i++) {
                data.electrode_is_wet.push(i < 8 ?
                    ((input.bytes[1] >> i) & 0x01 ? true : false) :
                    ((input.bytes[0] >> (i - 8)) & 0x01 ? true : false));
            }
            data.num_wet_electrodes = data.electrode_is_wet.filter(Boolean).length;
            // Check Criticality and self-test bits
            data.critically_wet_threshold = input.bytes[6];
            data.critically_wet = (input.bytes[0] >> SEVERN_EMERGENCY_STATE_BIT) & 0x01 ? true : false;
            if (data.critically_wet) {
                warnings.push("Detector is critically wet");
            }
            data.self_test_failed = (input.bytes[0] >> SEVERN_SELF_TEST_FAILED_BIT) & 0x01 ? true : false;
            if (data.self_test_failed) {
                warnings.push("Self-test failed");
            }
            // Accelerometer
            data.acc = {
                // convert acceleration values to g as float, truncate to 2 d.p.
                x_g: round_dp(int8(input.bytes[2]) / 63.0, 2),
                y_g: round_dp(int8(input.bytes[3]) / 63.0, 2),
                z_g: round_dp(int8(input.bytes[4]) / 63.0, 2),
            };
            // Temperature
            data.temp_c = int8(input.bytes[5]);
            if (data.temp_c <= LOW_TEMP_WARNING_C) {
                warnings.push("Ice warning");
            }
            // Message interval in minutes, but Profile 0 reports in seconds -> divide by 60
            data.regular_message_interval_min = ((0xFF00 & (input.bytes[7] << 8)) | input.bytes[8]) / 60;
            break;
        // Profile 1 Decoders
        case MsgPort.P1_Regular:
        case MsgPort.P1_Emergency:
        case MsgPort.P1_Self_test:
            if (input.bytes.length != 11) {
                errors.push("Unexpected payload length: ".concat(input.bytes.length, ", fPort: ").concat(input.fPort));
                break;
            }
            // Decode Uplink
            data = new P1RegularMessage();
            // Set default value for event_type, then set based off another case/switch
            data.event_type = "Regular";
            switch (input.fPort) {
                case MsgPort.P1_Regular:
                    data.event_type = "Regular";
                    break;
                case MsgPort.P1_Emergency:
                    data.event_type = "Emergency";
                    break;
                case MsgPort.P1_Self_test:
                    data.event_type = "Self_test";
                    break;
            }
            ;
            // Profile stored as first byte
            data.profile = input.bytes[0];
            // Check error boolean bits, and push relevant warnings
            data.join_error = (input.bytes[1] >> SEVERN_JOIN_FLAG_ERROR_BIT) & 0x01 ? true : false;
            data.sensor_connected = (input.bytes[1] >> SEVERN_SENSOR_CONNECTED_BIT) & 0x01 ? true : false;
            if (!data.sensor_connected) {
                warnings.push("Sensor disconnected");
            }
            data.self_test_failed = (input.bytes[1] >> SEVERN_SELF_TEST_FAILED_BIT) & 0x01 ? true : false;
            if (data.self_test_failed) {
                warnings.push("Self-test failed");
            }
            data.critically_wet = (input.bytes[1] >> SEVERN_EMERGENCY_STATE_BIT) & 0x01 ? true : false;
            if (data.critically_wet) {
                warnings.push("Detector is critically wet");
            }
            // Check if electrodes are wet:
            // Byte 1 bits 0..3 segments 8..11: 0 = dry, 1 = wet
            // Byte 2 bits 0..7 segments 0..7
            data.electrode_is_wet = [];
            for (var i = 0; i < 12; i++) {
                data.electrode_is_wet.push(i < 8 ?
                    ((input.bytes[2] >> i) & 0x01 ? true : false) :
                    ((input.bytes[1] >> (i - 8)) & 0x01 ? true : false));
            }
            data.num_wet_electrodes = data.electrode_is_wet.filter(Boolean).length;
            // Accelerometer
            data.acc = {
                // convert acceleration values to g as float, truncate to 2 d.p.
                x_g: signed_2_bit((input.bytes[3] & 0x03)),
                y_g: signed_2_bit((input.bytes[3] & 0x0C) >> 2),
                z_g: signed_2_bit((input.bytes[3] & 0x30) >> 4),
            };
            // Battery
            data.batt = 1.25 + round_dp(input.bytes[4] * 0.01, 2);
            // Temperature
            data.temp_c = int8(input.bytes[5]);
            if (data.temp_c <= LOW_TEMP_WARNING_C) {
                warnings.push("Ice warning");
            }
            data.critically_wet_threshold = (input.bytes[6] >> 4) & 0x0F;
            // Profile 1 in minutes, no conversion
            data.regular_message_interval_min = (((input.bytes[6] & 0x0F) << 8) | input.bytes[7]);
            data.failed_join_requests = ((input.bytes[8] & 0x0F) << 8) | input.bytes[9];
            break;
        case MsgPort.Startup:
            if (input.bytes.length != 11) {
                errors.push("Unexpected payload length: ".concat(input.bytes.length, ", fPort: ").concat(input.fPort));
                break;
            }
            // Decode Uplink
            data = new StartupMessage();
            data.event_type = "Startup";
            var serial_number_poss = input.bytes.slice(0, 8);
            if (!serial_number_poss.every(function (byte) { return byte < 154; })) {
                // Serial numbers are decimal, not hex, so each byte
                // should be 0x99 = 153 or less. 
                return { errors: ["Invalid serial number"] };
            }
            data.serial_number = toHexString(input.bytes.slice(0, 8));
            data.firmware_version = {
                major: input.bytes[8],
                minor: input.bytes[9],
                patch: input.bytes[10]
            };
            break;
        case MsgPort.P0_Basic_config:
        case MsgPort.P1_Basic_config:
            // We do not expect a basic config fPort in our uplink decoder.
            errors.push("Unexpected fPort: ".concat(input.fPort, ", use Downlink Decoder."));
            break;
        default:
            errors.push("Unexpected fPort: ".concat(input.fPort));
            break;
    }
    if (errors.length != 0) {
        // Error found in decoding
        return { errors: errors };
    }
    else {
        // To remove type from the data object we deconstruct it
        // into an object literal
        // const {...a} = data;
        // output.data = a;
        if (warnings.length != 0) {
            return { data: __assign({}, data), warnings: warnings };
        }
        else {
            return { data: __assign({}, data) };
        }
    }
}
function encodeDownlink(input) {
    var errors = [];
    var warnings = [];
    var bytes = [];

    let data = input;
    if(data == null){
        return {
            errors: ["No data to encode"]
        }
    }
    if(input.data != null) {
        data = input.data;
    }
    switch (data.profile) {
        case 0:
            // Profile 0 - message interval in seconds, no profile number change
            if (typeof data.critically_wet_threshold != "number") {
                errors.push("Critically wet threshold: ".concat(data.critically_wet_threshold, " is not a number."));
            }
            else {
                if (data.critically_wet_threshold > 255 || data.critically_wet_threshold < 1) {
                    errors.push("Critically wet threshold: ".concat(data.critically_wet_threshold, " is outside valid range (1-255)."));
                }
                else if (data.critically_wet_threshold > 12) {
                    warnings.push("Critically wet threshold > 12, disabling emergency messaging.");
                }
                bytes.push(data.critically_wet_threshold);
            }
            if (typeof data.regular_message_interval_min != "number") {
                errors.push("Regular message interval: ".concat(data.regular_message_interval_min, " is not a number"));
            }
            else {
                var reg_msg_interval_sec = data.regular_message_interval_min * 60;
                if (reg_msg_interval_sec > 65535 || reg_msg_interval_sec < 60) {
                    errors.push("Regular message interval:  ".concat(data.regular_message_interval_min, " is outside valid range (1-1092)."));
                }
                // Big-endian encoding, largest byte in [1]
                bytes.push((reg_msg_interval_sec & 0xFF00) >> 8);
                bytes.push(reg_msg_interval_sec & 0x00FF);
            }
            if (errors.length > 0) {
                // Errors have occurred in encoding, return mandatory fPort and error string array only.
                return { fPort: MsgPort.P0_Basic_config, errors: errors };
            }
            else {
                if (warnings.length > 0) {
                    return { fPort: MsgPort.P0_Basic_config, bytes: bytes, warnings: warnings };
                }
                else {
                    return { fPort: MsgPort.P0_Basic_config, bytes: bytes };
                }
            }
        case 1:
            // Profile 1 - 4-bit wetness threshold, 12-bit regular message interval in minutes
            if (typeof data.regular_message_interval_min != "number") {
                errors.push("Regular message interval: ".concat(data.regular_message_interval_min, " is not a number"));
                // Error - set first two bytes to 0
                bytes.push(0, 0);
            }
            else {
                if (data.regular_message_interval_min > 1440 || data.regular_message_interval_min < 1) {
                    errors.push("Regular message interval:  ".concat(data.critically_wet_threshold, " is outside valid range (1-1440)."));
                    // Error - set first two bytes to 0
                    bytes.push(0, 0);
                }
                else {
                    bytes.push((data.regular_message_interval_min & 0x0F00) >> 8);
                    bytes.push(data.regular_message_interval_min & 0x00FF);
                }
            }
            if (typeof data.critically_wet_threshold != "number") {
                errors.push("Critically wet threshold: ".concat(data.critically_wet_threshold, " is not a number."));
            }
            else {
                if (data.critically_wet_threshold > 15 || data.critically_wet_threshold < 1) {
                    errors.push("Critically wet threshold: ".concat(data.critically_wet_threshold, " is outside valid range (1-15)."));
                }
                else {
                    // Set bits 4..7 of byte 0 to critical wetness threshold as unsigned 4-bit integer
                    bytes[0] = bytes[0] | ((data.critically_wet_threshold & 0xF) << 4);
                }
                if (data.critically_wet_threshold > 12) {
                    warnings.push("Critically wet threshold > 12, disabling emergency messaging.");
                }
            }
            // Set byte 2 to profile as unsigned 8-bit integer
            if (data.new_profile != null) {
                // Use this downlink to set a new profile
                bytes.push(data.new_profile);
                warnings.push("Changing profile to: ".concat(data.new_profile, "."));
            }
            else {
                bytes.push(data.profile);
            }
            if (errors.length > 0) {
                // Errors have occurred in encoding, return mandatory fPort and error string array only.
                return { fPort: MsgPort.P1_Basic_config, errors: errors };
            }
            else {
                if (warnings.length > 0) {
                    return { fPort: MsgPort.P1_Basic_config, bytes: bytes, warnings: warnings };
                }
                else {
                    return { fPort: MsgPort.P1_Basic_config, bytes: bytes };
                }
            }
        default:
            return { fPort: 999, errors: ["Unexpected profile: ".concat(data.profile, ", cannot encode.")] };
    }
}
function decodeDownlink(input) {
    switch (input.fPort) {
        case MsgPort.P0_Basic_config:
            var out_cfg = {
                data: new ConfigOptions(),
                warnings: []
            };
            out_cfg.data.critically_wet_threshold = input.bytes[0];
            if (out_cfg.data.critically_wet_threshold > 12) {
                out_cfg.warnings.push("Critically wet threshold > 12, disabling emergency messaging.");
            }
            out_cfg.data.regular_message_interval_min = 0;
            out_cfg.data.regular_message_interval_min += input.bytes[1] << 8;
            out_cfg.data.regular_message_interval_min += input.bytes[2];
            // Profile 0 in seconds, so convert to minutes here
            out_cfg.data.regular_message_interval_min = Math.round(out_cfg.data.regular_message_interval_min / 60);
            return out_cfg;
        case MsgPort.P1_Basic_config:
            var out_cfg = {
                data: new ConfigOptions(),
                warnings: []
            };
            out_cfg.data.profile = 1;
            out_cfg.data.critically_wet_threshold = (input.bytes[0] & 0xF0) >> 4;
            if (out_cfg.data.critically_wet_threshold > 12) {
                out_cfg.warnings.push("Critically wet threshold > 12, disabling emergency messaging.");
            }
            if (input.bytes[2] != 1) {
                // Changing profile with this message
                out_cfg.data.new_profile = input.bytes[2];
                out_cfg.warnings.push("Changing profile to: ".concat(out_cfg.data.new_profile, "."));
            }
            out_cfg.data.regular_message_interval_min = 0;
            out_cfg.data.regular_message_interval_min += input.bytes[1];
            out_cfg.data.regular_message_interval_min += (input.bytes[0] & 0xF) << 8;
            return out_cfg;
        case MsgPort.P0_Regular:
        case MsgPort.P0_Emergency:
        case MsgPort.P0_Self_test:
        case MsgPort.P1_Regular:
        case MsgPort.P1_Emergency:
        case MsgPort.P1_Self_test:
            return { errors: ["Unexpected fPort: ".concat(input.fPort, ", use Uplink Decoder.")] };
        default:
            return { errors: ["Unexpected fPort: ".concat(input.fPort)] };
    }
}

exports.decodeUplink = decodeUplink;
exports.encodeDownlink = encodeDownlink;
exports.decodeDownlink = decodeDownlink;
