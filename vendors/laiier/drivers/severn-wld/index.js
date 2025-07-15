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
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeDownlink = exports.encodeDownlink = exports.decodeUplink = void 0;
var VERSION = "v1.10.0";
var MsgPort;
(function (MsgPort) {
    MsgPort[MsgPort["Startup"] = 100] = "Startup";
    MsgPort[MsgPort["P0_Regular"] = 1] = "P0_Regular";
    MsgPort[MsgPort["P0_Emergency"] = 99] = "P0_Emergency";
    MsgPort[MsgPort["P0_Self_test"] = 102] = "P0_Self_test";
    MsgPort[MsgPort["P0_Basic_config"] = 103] = "P0_Basic_config";
    MsgPort[MsgPort["P1_Regular"] = 2] = "P1_Regular";
    MsgPort[MsgPort["P1_Emergency"] = 98] = "P1_Emergency";
    MsgPort[MsgPort["P1_Self_test"] = 104] = "P1_Self_test";
    MsgPort[MsgPort["P1_Basic_config"] = 105] = "P1_Basic_config";
})(MsgPort || (MsgPort = {}));
var RstValue;
(function (RstValue) {
    RstValue[RstValue["unknown"] = 0] = "unknown";
    RstValue[RstValue["software"] = 1] = "software";
    RstValue[RstValue["pin"] = 2] = "pin";
    RstValue[RstValue["power"] = 3] = "power";
})(RstValue || (RstValue = {}));
var SEVERN_JOIN_FLAG_ERROR_BIT = 4;
var SEVERN_SENSOR_CONNECTED_BIT = 5;
var SEVERN_SELF_TEST_FAILED_BIT = 6;
var SEVERN_EMERGENCY_STATE_BIT = 7;
var LOW_TEMP_WARNING_C = 3;
var P0RegularMessage = (function () {
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
var P1RegularMessage = (function (_super) {
    __extends(P1RegularMessage, _super);
    function P1RegularMessage() {
        var _this = _super.call(this) || this;
        _this.profile = 1;
        _this.sensor_connected = true;
        _this.join_error = false;
        _this.failed_join_requests = 0;
        _this.batt = 3.6;
        _this.tx_power = 0;
        return _this;
    }
    return P1RegularMessage;
}(P0RegularMessage));
var StartupMessage = (function () {
    function StartupMessage() {
        this.event_type = "Startup";
        this.serial_number = "";
        this.firmware_version = {
            major: 0,
            minor: 0,
            patch: 0,
        };
        this.decoder_version = VERSION;
        this.reset = "Unknown";
    }
    return StartupMessage;
}());
var ConfigOptions = (function () {
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
        case MsgPort.P0_Regular:
        case MsgPort.P0_Emergency:
        case MsgPort.P0_Self_test:
            if (input.bytes.length != 9) {
                errors.push("Unexpected payload length: ".concat(input.bytes.length, ", fPort: ").concat(input.fPort));
                break;
            }
            data = new P0RegularMessage();
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
            data.electrode_is_wet = [];
            for (var i = 0; i < 12; i++) {
                data.electrode_is_wet.push(i < 8 ?
                    ((input.bytes[1] >> i) & 0x01 ? true : false) :
                    ((input.bytes[0] >> (i - 8)) & 0x01 ? true : false));
            }
            data.num_wet_electrodes = data.electrode_is_wet.filter(Boolean).length;
            data.critically_wet_threshold = input.bytes[6];
            data.critically_wet = (input.bytes[0] >> SEVERN_EMERGENCY_STATE_BIT) & 0x01 ? true : false;
            if (data.critically_wet) {
                warnings.push("Detector is critically wet");
            }
            data.self_test_failed = (input.bytes[0] >> SEVERN_SELF_TEST_FAILED_BIT) & 0x01 ? true : false;
            if (data.self_test_failed) {
                warnings.push("Self-test failed");
            }
            data.acc = {
                x_g: round_dp(int8(input.bytes[2]) / 63.0, 2),
                y_g: round_dp(int8(input.bytes[3]) / 63.0, 2),
                z_g: round_dp(int8(input.bytes[4]) / 63.0, 2),
            };
            data.temp_c = int8(input.bytes[5]);
            if (data.temp_c <= LOW_TEMP_WARNING_C) {
                warnings.push("Ice warning");
            }
            data.regular_message_interval_min = ((0xFF00 & (input.bytes[7] << 8)) | input.bytes[8]) / 60;
            break;
        case MsgPort.P1_Regular:
        case MsgPort.P1_Emergency:
        case MsgPort.P1_Self_test:
            if (input.bytes.length != 11) {
                errors.push("Unexpected payload length: ".concat(input.bytes.length, ", fPort: ").concat(input.fPort));
                break;
            }
            data = new P1RegularMessage();
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
            data.profile = input.bytes[0];
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
            data.electrode_is_wet = [];
            for (var i = 0; i < 12; i++) {
                data.electrode_is_wet.push(i < 8 ?
                    ((input.bytes[2] >> i) & 0x01 ? true : false) :
                    ((input.bytes[1] >> (i - 8)) & 0x01 ? true : false));
            }
            data.num_wet_electrodes = data.electrode_is_wet.filter(Boolean).length;
            data.acc = {
                x_g: signed_2_bit((input.bytes[3] & 0x03)),
                y_g: signed_2_bit((input.bytes[3] & 0x0C) >> 2),
                z_g: signed_2_bit((input.bytes[3] & 0x30) >> 4),
            };
            data.batt = 1.25 + round_dp(input.bytes[4] * 0.01, 2);
            data.temp_c = int8(input.bytes[5]);
            if (data.temp_c <= LOW_TEMP_WARNING_C) {
                warnings.push("Ice warning");
            }
            data.critically_wet_threshold = (input.bytes[6] >> 4) & 0x0F;
            data.regular_message_interval_min = (((input.bytes[6] & 0x0F) << 8) | input.bytes[7]);
            data.failed_join_requests = ((input.bytes[8] & 0x0F) << 8) | input.bytes[9];
            data.tx_power = (input.bytes[8] & 0xF0) >> 4;
            break;
        case MsgPort.Startup:
            if (input.bytes.length != 11) {
                errors.push("Unexpected payload length: ".concat(input.bytes.length, ", fPort: ").concat(input.fPort));
                break;
            }
            data = new StartupMessage();
            data.event_type = "Startup";
            var serial_number_poss = input.bytes.slice(0, 8);
            if (!serial_number_poss.every(function (byte) { return byte < 154; })) {
                return { errors: ["Invalid serial number"] };
            }
            data.serial_number = toHexString(input.bytes.slice(0, 8));
            data.firmware_version = {
                major: input.bytes[8],
                minor: input.bytes[9],
                patch: (input.bytes[10] & 0x3F)
            };
            var reset_val = void 0;
            reset_val = (input.bytes[10] & 0xC0) >> 6;
            switch (reset_val) {
                case RstValue.software:
                    data.reset = "Software";
                    break;
                case RstValue.pin:
                    data.reset = "Pin";
                    break;
                case RstValue.power:
                    data.reset = "Power";
                    break;
                default:
                    data.reset = "Unknown";
                    break;
            }
            ;
            break;
        case MsgPort.P0_Basic_config:
        case MsgPort.P1_Basic_config:
            errors.push("Unexpected fPort: ".concat(input.fPort, ", use Downlink Decoder."));
            break;
        default:
            errors.push("Unexpected fPort: ".concat(input.fPort));
            break;
    }
    if (errors.length != 0) {
        return { errors: errors };
    }
    else {
        if (warnings.length != 0) {
            return { data: __assign({}, data), warnings: warnings };
        }
        else {
            return { data: __assign({}, data) };
        }
    }
}
exports.decodeUplink = decodeUplink;
function encodeDownlink(input) {
    var errors = [];
    var warnings = [];
    var bytes = [];
    switch (input.data.profile) {
        case 0:
            if (typeof input.data.critically_wet_threshold != "number") {
                errors.push("Critically wet threshold: ".concat(input.data.critically_wet_threshold, " is not a number."));
            }
            else {
                if (input.data.critically_wet_threshold > 255 || input.data.critically_wet_threshold < 1) {
                    errors.push("Critically wet threshold: ".concat(input.data.critically_wet_threshold, " is outside valid range (1-255)."));
                }
                else if (input.data.critically_wet_threshold > 12) {
                    warnings.push("Critically wet threshold > 12, disabling emergency messaging.");
                }
                bytes.push(input.data.critically_wet_threshold);
            }
            if (typeof input.data.regular_message_interval_min != "number") {
                errors.push("Regular message interval: ".concat(input.data.regular_message_interval_min, " is not a number"));
            }
            else {
                var reg_msg_interval_sec = input.data.regular_message_interval_min * 60;
                if (reg_msg_interval_sec > 65535 || reg_msg_interval_sec < 60) {
                    errors.push("Regular message interval:  ".concat(input.data.regular_message_interval_min, " is outside valid range (1-1092)."));
                }
                bytes.push((reg_msg_interval_sec & 0xFF00) >> 8);
                bytes.push(reg_msg_interval_sec & 0x00FF);
            }
            if (errors.length > 0) {
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
            if (typeof input.data.regular_message_interval_min != "number") {
                errors.push("Regular message interval: ".concat(input.data.regular_message_interval_min, " is not a number"));
                bytes.push(0, 0);
            }
            else {
                if (input.data.regular_message_interval_min > 1440 || input.data.regular_message_interval_min < 1) {
                    errors.push("Regular message interval:  ".concat(input.data.critically_wet_threshold, " is outside valid range (1-1440)."));
                    bytes.push(0, 0);
                }
                else {
                    bytes.push((input.data.regular_message_interval_min & 0x0F00) >> 8);
                    bytes.push(input.data.regular_message_interval_min & 0x00FF);
                }
            }
            if (typeof input.data.critically_wet_threshold != "number") {
                errors.push("Critically wet threshold: ".concat(input.data.critically_wet_threshold, " is not a number."));
            }
            else {
                if (input.data.critically_wet_threshold > 15 || input.data.critically_wet_threshold < 1) {
                    errors.push("Critically wet threshold: ".concat(input.data.critically_wet_threshold, " is outside valid range (1-15)."));
                }
                else {
                    bytes[0] = bytes[0] | ((input.data.critically_wet_threshold & 0xF) << 4);
                }
                if (input.data.critically_wet_threshold > 12) {
                    warnings.push("Critically wet threshold > 12, disabling emergency messaging.");
                }
            }
            if (input.data.new_profile != null) {
                bytes.push(input.data.new_profile);
                warnings.push("Changing profile to: ".concat(input.data.new_profile, "."));
            }
            else {
                bytes.push(input.data.profile);
            }
            if (errors.length > 0) {
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
            return { fPort: 999, errors: ["Unexpected profile: ".concat(input.data.profile, ", cannot encode.")] };
    }
}
exports.encodeDownlink = encodeDownlink;
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
exports.decodeDownlink = decodeDownlink;
