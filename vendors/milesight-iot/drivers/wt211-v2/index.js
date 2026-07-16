/**
 * Payload Decoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product WT211
 */
var RAW_VALUE = 0x00;

/* eslint no-redeclare: "off" */
/* eslint-disable */
// Chirpstack v4
function decodeUplink(input) {
    var decoded = milesightDeviceDecode(input.bytes);
    return { data: decoded };
}

// Chirpstack v3
function Decode(fPort, bytes) {
    return milesightDeviceDecode(bytes);
}

// The Things Network
function Decoder(bytes, port) {
    return milesightDeviceDecode(bytes);
}
/* eslint-enable */

function milesightDeviceDecode(bytes) {
    var decoded = {};

    for (var i = 0; i < bytes.length; ) {
        var channel_id = bytes[i++];
        var channel_type = bytes[i++];

        // IPSO VERSION
        if (channel_id === 0xff && channel_type === 0x01) {
            decoded.ipso_version = readProtocolVersion(bytes[i]);
            i += 1;
        }
        // HARDWARE VERSION
        else if (channel_id === 0xff && channel_type === 0x09) {
            decoded.hardware_version = readHardwareVersion(bytes.slice(i, i + 2));
            i += 2;
        }
        // FIRMWARE VERSION
        else if (channel_id === 0xff && channel_type === 0x0a) {
            decoded.firmware_version = readFirmwareVersion(bytes.slice(i, i + 2));
            i += 2;
        }
        // TSL VERSION
        else if (channel_id === 0xff && channel_type === 0xff) {
            decoded.tsl_version = readTslVersion(bytes.slice(i, i + 2));
            i += 2;
        }
        // SERIAL NUMBER
        else if (channel_id === 0xff && channel_type === 0x16) {
            decoded.sn = readSerialNumber(bytes.slice(i, i + 8));
            i += 8;
        }
        // LORAWAN CLASS TYPE
        else if (channel_id === 0xff && channel_type === 0x0f) {
            var type = bytes[i];
            var lorawan_class_map = {
                0: "Class A",
                1: "Class B",
                2: "Class C",
                3: "Class CtoB"
            }
            decoded.lorawan_class = {};
            decoded.lorawan_class.type = getMapValue(lorawan_class_map, type, type + 1);
            if (RAW_VALUE) {
                decoded.lorawan_class.value = getMapKey(lorawan_class_map, type, type + 1);
            } 
            i += 1;
        }
        // RESET EVENT
        else if (channel_id === 0xff && channel_type === 0xfe) {
            decoded.reset_event = readResetEvent(1);
            i += 1;
        }
        // DEVICE STATUS
        else if (channel_id === 0xff && channel_type === 0x0b) {
            decoded.device_status = readDeviceStatus(1);
            i += 1;
        }
        // TEMPERATURE
        else if (channel_id === 0x03 && channel_type === 0x67) {
            decoded.ambient_temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
            i += 2;
        }
        // TARGET TEMPERATURE
        else if (channel_id === 0x04 && channel_type === 0x67) {
            decoded.target_temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
            i += 2;
        }
        // TARGET TEMPERATURE 2
        else if (channel_id === 0x0b && channel_type === 0x67) {
            decoded.target_temperature_2 = readInt16LE(bytes.slice(i, i + 2)) / 10;
            i += 2;
        }
        // TEMPERATURE CONTROL
        else if (channel_id === 0x05 && channel_type === 0xe7) {
            var value = bytes[i];
            var temperature_control_mode_map = {
                0: "heat",
                1: "em heat",
                2: "cool",
                3: "auto"
            };
            decoded.current_temperature_control_mode = {};
            // value = temperature_control_mode(0..1) + temperature_control_status(4..7)
            decoded.current_temperature_control_mode.mode = temperature_control_mode_map[(value >>> 0) & 0x03];
            decoded.current_temperature_control_mode.status = readTemperatureControlStatus((value >>> 4) & 0x0f);
            if (RAW_VALUE) {
                decoded.current_temperature_control_mode.mode_value = ((value >>> 0) & 0x03) + 1;
                decoded.current_temperature_control_mode.status_value = ((value >>> 4) & 0x0f) + 1;
            }

            i += 1;
        }
        // FAN CONTROL
        else if (channel_id === 0x06 && channel_type === 0xe8) {
            var fan_data = bytes[i];
            var fan_mode_map = [ 
                { value: 2, name: "auto" },
                { value: 3, name: "always on" },
                { value: 4, name: "circulate" },
                { value: 1, name: "disable" }
            ]; 
            var fan_status_map = [
                { value: 1, name: "standby" },
                { value: 5, name: "high speed" },
                { value: 3, name: "low speed" },
                { value: 2, name: "on" }
            ];
            decoded.fan_mode_setting = {};
            // value = fan_mode(0..1) + fan_status(2..3)
            decoded.fan_mode_setting.mode = fan_mode_map[(fan_data >>> 0) & 0x03]['name'];
            decoded.fan_mode_setting.status = fan_status_map[(fan_data >>> 2) & 0x07]['name'];
            if (RAW_VALUE) {
                decoded.fan_mode_setting.mode_value = fan_mode_map[(fan_data >>> 0) & 0x03]['value'];
                decoded.fan_mode_setting.status_value = fan_status_map[(fan_data >>> 2) & 0x07]['value'];
            }
            i += 1;
        }

        // fireware version 1.5
        // CURRENT TEMPERATURE HUMIDITY SOURCE
        else if (channel_id === 0x07 && channel_type === 0xe9) {
            var sourceResult = readTemperatureHumiditySource(bytes[i]);
            decoded.curr_temperature_humidity_source = sourceResult.source;
            if (RAW_VALUE) {
                decoded.curr_temperature_humidity_source_value = sourceResult.value;
            }
            i += 1;
        }
        else if (channel_id === 0x87 && channel_type === 0xe9) {
            var sourceResult = readTemperatureHumiditySource(bytes[i]);
            var alarm_map = {
                1: "source switch alarm"
            }
            decoded.source_alarm = {};
            decoded.source_alarm.source = sourceResult.source;
            decoded.source_alarm.alarm = alarm_map[bytes[i + 1]];
            if (RAW_VALUE) {
                decoded.source_alarm.source_value = sourceResult.value;
                decoded.source_alarm.alarm_value = bytes[i + 1];
            }
            i += 2;
        }

        // PLAN EVENT
        else if (channel_id === 0x07 && channel_type === 0xbc) {
            var plan_type_data = bytes[i];
            // value = plan_type(0..3)
            decoded.plan_type = readExecutePlanType((plan_type_data >>> 0) & 0x0f);
            i += 1;
        }
        // SYSTEM STATUS
        else if (channel_id === 0x08 && channel_type === 0x8e) {
            decoded.system_status = readOnOffStatus(bytes[i]);
            i += 1;
        }
        // HUMIDITY
        else if (channel_id === 0x09 && channel_type === 0x68) {
            decoded.humidity = readUInt8(bytes[i]) / 2;
            i += 1;
        }
        // RELAY STATUS
        else if (channel_id === 0x0a && channel_type === 0x6e) {
            decoded.enabled_relay = readWiresRelay(bytes[i]);
            i += 1;
        }
        // TEMPERATURE MODE SUPPORT
        else if (channel_id === 0xff && channel_type === 0xcb) {
            decoded.temperature_control_support_mode = readTemperatureControlSupportMode(bytes[i]);
            decoded.temperature_control_support_status = readTemperatureControlSupportStatus(bytes[i + 1], bytes[i + 2]);
            i += 3;
        }
        // TEMPERATURE ALARM
        else if (channel_id === 0x83 && channel_type === 0x67) {
            decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
            decoded.temperature_alarm = readTemperatureAlarm(bytes[i + 2]);
            i += 3;
        }
        // TEMPERATURE EXCEPTION
        else if (channel_id === 0xb3 && channel_type === 0x67) {
            decoded.temperature_sensor_status = readSensorStatus(bytes[i]);
            i += 1;
        }
        // HUMIDITY EXCEPTION
        else if (channel_id === 0xb9 && channel_type === 0x68) {
            decoded.humidity_sensor_status = readSensorStatus(bytes[i]);
            i += 1;
        }
        // TEMPERATURE OUT OF RANGE ALARM
        else if (channel_id === 0xf9 && channel_type === 0x40) {
            var target_temperature_range_alarm = {};
            target_temperature_range_alarm.temperature_control_mode = readTemperatureControlMode(bytes[i]);
            target_temperature_range_alarm.target_temperature = readInt16LE(bytes.slice(i + 1, i + 3)) / 10;
            target_temperature_range_alarm.min = readInt16LE(bytes.slice(i + 3, i + 5)) / 10;
            target_temperature_range_alarm.max = readInt16LE(bytes.slice(i + 5, i + 7)) / 10;
            i += 7;

            decoded.target_temperature_range_alarm = decoded.target_temperature_range_alarm || [];
            decoded.target_temperature_range_alarm.push(target_temperature_range_alarm);
        }
        // HISTORICAL DATA
        else if (channel_id === 0x20 && channel_type === 0xce) {
            var timestamp = readUInt32LE(bytes.slice(i, i + 4));
            var value1 = readUInt16LE(bytes.slice(i + 4, i + 6));

            var data = {};
            data.timestamp = timestamp;
            // value1 = system_status(0) + fan_mode(1..2) + fan_status(3..4) + temperature_control_mode(5..6) + temperature_control_status(7..10)
            data.system_status = readOnOffStatus(value1 & 0x01);
            data.fan_mode = readFanMode((value1 >>> 1) & 0x03);
            data.fan_status = readFanStatus((value1 >>> 3) & 0x03);
            data.temperature_control_mode = readTemperatureControlMode((value1 >>> 5) & 0x03);
            data.temperature_control_status = readTemperatureControlStatus((value1 >>> 7) & 0x0f);

            data.target_temperature = readInt16LE(bytes.slice(i + 6, i + 8)) / 10;
            var temperature_target_value = readUInt16LE(bytes.slice(i + 8, i + 10));
            if (temperature_target_value !== 0xffff) {
                data.target_temperature_2 = readInt16LE(bytes.slice(i + 8, i + 10)) / 10;
            }
            data.temperature = readInt16LE(bytes.slice(i + 10, i + 12)) / 10;
            data.humidity = readUInt8(bytes[i + 12]) / 2;
            i += 13;

            decoded.history = decoded.history || [];
            decoded.history.push(data);
        }
        // DOWNLINK RESPONSE
        else if (channel_id === 0xfe || channel_id === 0xff) {
            var result = handle_downlink_response(channel_type, bytes, i);
            decoded = Object.assign(decoded, result.data);
            i = result.offset;
        } else if (channel_id === 0xf8 || channel_id === 0xf9) {
            var resultExt = handle_downlink_response_ext(channel_id, channel_type, bytes, i);
            decoded = Object.assign(decoded, resultExt.data);
            i = resultExt.offset;
        } else {
            break;
        }
    }
    processTemperature(decoded);
    return decoded;
}

function handle_downlink_response(channel_type, bytes, offset) {
    var decoded = {};

    switch (channel_type) {
        case 0x02:
            decoded.collection_interval = readUInt16LE(bytes.slice(offset, offset + 2));
            offset += 2;
            break;
        case 0x03:
            decoded.outside_temperature = readInt16LE(bytes.slice(offset, offset + 2)) / 10;
            offset += 2;
            break;
        case 0x06: // temperature_alarm_config
            var ctl = readUInt8(bytes[offset]);
            var condition = ctl & 0x07;
            var alarm_type = (ctl >>> 3) & 0x07;

            var condition_map = { 0: "disable", 1: "below", 2: "above", 3: "between", 4: "outside" };
            var alarm_type_map = { 0: "temperature threshold", 1: "continuous low temperature", 2: "continuous high temperature" };
            var data = { condition: getValue(condition_map, condition), alarm_type: getValue(alarm_type_map, alarm_type) };

            if (condition === 1 || condition === 3 || condition === 4) {
                data.threshold_min = readInt16LE(bytes.slice(offset + 1, offset + 3)) / 10;
            }
            if (condition === 2 || condition === 3 || condition === 4) {
                data.threshold_max = readInt16LE(bytes.slice(offset + 3, offset + 5)) / 10;
            }
            data.lock_time = readInt16LE(bytes.slice(offset + 5, offset + 7));
            data.continue_time = readInt16LE(bytes.slice(offset + 7, offset + 9));
            offset += 9;

            decoded.temperature_alarm_config = data;
            break;
        case 0x10:
            decoded.reboot = readYesNoStatus(1);
            offset += 1;
            break;
        case 0x25:
            var masked = readUInt8(bytes[offset]);
            var status = readUInt8(bytes[offset + 1]);
            var button_mask_bit_offset = { power_button: 0, up_button: 1, down_button: 2, fan_button: 3, mode_button: 4, reset_button: 5 };

            decoded.child_lock_config = decoded.child_lock_config || {};
            for (var button in button_mask_bit_offset) {
                if ((masked >> button_mask_bit_offset[button]) & 0x01) {
                    decoded.child_lock_config[button] = readEnableStatus((status >> button_mask_bit_offset[button]) & 0x01);
                }
            }
            offset += 2;
            break;
        case 0x28:
            var report_status_map = { 0: "plan", 1: "periodic", 2: "target_temperature_range" };
            decoded.report_status = getValue(report_status_map, readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0x68:
            decoded.history_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x69:
            decoded.retransmit_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x6a:
            var interval_type = readUInt8(bytes[offset]);
            switch (interval_type) {
                case 0:
                    decoded.retransmit_interval = readUInt16LE(bytes.slice(offset + 1, offset + 3));
                    break;
                case 1:
                    decoded.resend_interval = readUInt16LE(bytes.slice(offset + 1, offset + 3));
                    break;
            }
            offset += 3;
            break;
        case 0x82:
            var value = readUInt8(bytes[offset]);
            var mask = value >>> 4;
            var enabled = value & 0x0f;

            var group_mask_bit_offset = { group1_enable: 0, group2_enable: 1, group3_enable: 2, group4_enable: 3 };
            decoded.multicast_group_config = {};
            for (var group in group_mask_bit_offset) {
                if ((mask >> group_mask_bit_offset[group]) & 0x01) {
                    decoded.multicast_group_config[group] = readEnableStatus((enabled >> group_mask_bit_offset[group]) & 0x01);
                }
            }
            offset += 1;
            break;
        case 0x83:
            var d2d_slave_config = readD2DSlaveConfig(bytes.slice(offset, offset + 5));
            offset += 5;
            decoded.d2d_slave_config = decoded.d2d_slave_config || [];
            decoded.d2d_slave_config.push(d2d_slave_config);
            break;
        case 0x96:
            var d2d_master_config = readD2DMasterConfig(bytes.slice(offset, offset + 8));
            offset += 8;
            decoded.d2d_master_config = decoded.d2d_master_config || [];
            decoded.d2d_master_config.push(d2d_master_config);
            break;
        case 0x4a:
            decoded.synchronize_time = readUInt8(bytes[offset]);
            offset += 1;
            break;
        case 0x8e:
            // ignore the first byte
            decoded.reporting_interval_settings = {};
            decoded.reporting_interval_settings.time = readUInt16LE(bytes.slice(offset + 1, offset + 3));
            offset += 3;
            break;
        case 0xab:
            decoded.temperature_calibration_settings = {};
            decoded.temperature_calibration_settings.enable = readEnableStatus(readUInt8(bytes[offset]));
            decoded.temperature_calibration_settings.calibration_value = readInt16LE(bytes.slice(offset + 1, offset + 3)) / 10;
            offset += 3;
            break;
        case 0xb0:
            decoded.freeze_protection_config = decoded.freeze_protection_config || {};
            decoded.freeze_protection_config.enable = readEnableStatus(readUInt8(bytes[offset]));
            decoded.freeze_protection_config.temperature = readInt16LE(bytes.slice(offset + 1, offset + 3)) / 10;
            offset += 3;
            break;
        case 0xb5:
            var reversing_valve = readUInt8(bytes[offset]);
            var rawValue_reversing_valve_map = { 0: "energize on heat", 1: "energize on cool" };
            decoded.reversing_valve = {};
            if(RAW_VALUE) {
                decoded.reversing_valve.value = getMapKey(rawValue_reversing_valve_map, reversing_valve, reversing_valve + 1);
                decoded.reversing_valve.mode = getMapValue(rawValue_reversing_valve_map, reversing_valve);
            } else {
                decoded.reversing_valve.mode = getMapValue(rawValue_reversing_valve_map, reversing_valve);
            }
            offset += 1;
            break;
        case 0xb6:
            var mode = readUInt8(bytes[offset]);
            var fan_mode_map = [ 
                { value: 2, name: "auto" },
                { value: 3, name: "always on" },
                { value: 4, name: "circulate" },
            ];
            decoded.fan_mode_setting = {};
            decoded.fan_mode_setting.mode = fan_mode_map[mode]['name'];
            if(RAW_VALUE) {
                decoded.fan_mode_setting.mode_value = fan_mode_map[mode]['value'];
            }
            offset += 1;
            break;
        case 0xb7:
            decoded.temperature_control = {};
            decoded.temperature_control.mode = readTemperatureControlMode(readUInt8(bytes[offset]));
            var t = readUInt8(bytes[offset + 1]);
            decoded.temperature_control.target = t & 0x7f;
            decoded.temperature_control.unit = readTemperatureUnit((t >>> 7) & 0x01);
            offset += 2;
            break;
        case 0xb8:
            decoded.temperature_tolerance = {};
            decoded.temperature_tolerance.target_temperature_tolerance = readUInt8(bytes[offset]) / 10;
            decoded.temperature_tolerance.auto_temperature_tolerance = readUInt8(bytes[offset + 1]) / 10;
            offset += 2;
            break;
        case 0xb9:
            var level_switch_settings = readLevelSwitchSettings(bytes.slice(offset, offset + 3));

            decoded.level_switch_settings = decoded.level_switch_settings || [];
            decoded.level_switch_settings.push(level_switch_settings);
            offset += 3;
            break;
        case 0xba:
            var enable_value = bytes[offset];
            decoded.dst_config = {};
            decoded.dst_config.enable = readEnableStatus(enable_value);
            if (enable_value) {
                decoded.dst_config.offset = readUInt8(bytes[offset + 1]);
                decoded.dst_config.start_month = readUInt8(bytes[offset + 2]);
                var start_day = readUInt8(bytes[offset + 3]);
                decoded.dst_config.start_week_num = (start_day >>> 4) & 0x0f;
                decoded.dst_config.start_week_day = start_day & 0x0f;
                decoded.dst_config.start_time = readUInt16LE(bytes.slice(offset + 4, offset + 6));
                decoded.dst_config.end_month = readUInt8(bytes[offset + 6]);
                var end_day = readUInt8(bytes[offset + 7]);
                decoded.dst_config.end_week_num = (end_day >>> 4) & 0x0f;
                decoded.dst_config.end_week_day = end_day & 0x0f;
                decoded.dst_config.end_time = readUInt16LE(bytes.slice(offset + 8, offset + 10));
            }
            offset += 10;
            break;
        case 0xbd:
            decoded.time_zone = readTimeZone(readInt16LE(bytes.slice(offset, offset + 2)));
            offset += 2;
            break;
        case 0xc1:
            var action_type_map = { 0: "power", 1: "plan" };
            decoded.card_config = {};
            decoded.card_config.enable = readEnableStatus(bytes[offset]);
            var action_type_value = readUInt8(bytes[offset + 1]);
            decoded.card_config.action_type = getValue(action_type_map, action_type_value);
            if (action_type_value === 1) {
                var action = readUInt8(bytes[offset + 2]);
                decoded.card_config.in_plan_type = readPlanType((action >>> 4) & 0x0f);
                decoded.card_config.out_plan_type = readPlanType(action & 0x0f);
            }
            decoded.card_config.invert = readYesNoStatus(bytes[offset + 3]);
            offset += 4;
            break;
        case 0xc2:
            decoded.plan_type = readPlanType(readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0xc4:
            decoded.temperature_source_config = {};
            decoded.temperature_source_config.source = readTemperatureSource(readUInt8(bytes[offset]));
            decoded.temperature_source_config.timeout = readUInt8(bytes[offset + 1]);
            offset += 2;
            break;
        case 0xc5:
            decoded.temperature_control_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0xc7:
            var d2d_enable_data = readUInt8(bytes[offset]);
            offset += 1;
            var d2d_enable_mask = d2d_enable_data >>> 4;
            var d2d_enable_status = d2d_enable_data & 0x0f;
            if ((d2d_enable_mask >> 0) & 0x01) {
                decoded.d2d_master_enable = readEnableStatus(d2d_enable_status & 0x01);
            }
            if ((d2d_enable_mask >> 1) & 0x01) {
                decoded.d2d_slave_enable = readEnableStatus((d2d_enable_status >> 1) & 0x01);
            }
            break;
        case 0xc8:
            var plan = readPlan(bytes.slice(offset, offset + 5));
            offset += 5;

            decoded.plan_cfg = decoded.plan_cfg || [];
            decoded.plan_cfg.push(plan);
            break;
        case 0xc9:
            var schedule = readPlanSchedule(bytes.slice(offset, offset + 6));
            offset += 6;

            decoded.plan_schedule = decoded.plan_schedule || [];
            decoded.plan_schedule.push(schedule);
            break;
        case 0xca:
            decoded.wires = readWires(bytes[offset], bytes[offset + 1], bytes[offset + 2]);
            offset += 3;
            break;
        case 0xeb:
            var temperature_unit_map = { 0: "celsius", 1: "fahrenheit" };
            decoded.temperature_unit = {};
            decoded.temperature_unit.unit = temperature_unit_map[bytes[offset]];
            if(RAW_VALUE) {
                decoded.temperature_unit.value = bytes[offset] + 1;
            }
            offset += 1;
            break;
        case 0xf6:
            decoded.control_permission = readControlPermission(readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0xf7:
            var wire_relay_bit_offset = { y1: 0, y2_gl: 1, w1: 2, w2_aux: 3, e: 4, g: 5, ob: 6 };
            var wire_relay_mask = readUInt16LE(bytes.slice(offset, offset + 2));
            var wire_relay_status = readUInt16LE(bytes.slice(offset + 2, offset + 4));
            offset += 4;

            decoded.wires_relay_config = {};
            for (var key in wire_relay_bit_offset) {
                if ((wire_relay_mask >>> wire_relay_bit_offset[key]) & 0x01) {
                    decoded.wires_relay_config[key] = readOnOffStatus((wire_relay_status >>> wire_relay_bit_offset[key]) & 0x01);
                }
            }
            break;
        case 0xf8:
            decoded.offline_control_mode = readOfflineControlMode(readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0xf9:
            decoded.humidity_calibration_settings = {};
            decoded.humidity_calibration_settings.enable = readEnableStatus(readUInt8(bytes[offset]));
            decoded.humidity_calibration_settings.calibration_value = readInt16LE(bytes.slice(offset + 1, offset + 3)) / 10;
            offset += 3;
            break;
        case 0xfa:
            decoded.temperature_control_mode = readTemperatureControlMode(readUInt8(bytes[offset]));
            decoded.target_temperature = readInt16LE(bytes.slice(offset + 1, offset + 3)) / 10;
            offset += 3;
            break;
        case 0xfb:
            var mode = readUInt8(bytes[offset]);
            var mode_map = { 1: "heat", 2: "em heat", 3: "cool", 4: "auto" };
            decoded.current_temperature_control_mode = {};

            if (RAW_VALUE) {
                decoded.current_temperature_control_mode.mode_value = mode + 1;
                decoded.current_temperature_control_mode.mode = mode_map[mode + 1];
            } else {
                decoded.current_temperature_control_mode.mode = mode_map[mode + 1];
            }
            offset += 1;
            break;
        default:
            throw new Error("unknown downlink response");
    }

    return { data: decoded, offset: offset };
}

function handle_downlink_response_ext(code, channel_type, bytes, offset) {
    var decoded = {};

    switch (channel_type) {
        case 0x05:
            decoded.fan_delay = {};
            decoded.fan_delay.enable = readEnableStatus(readUInt8(bytes[offset]));
            decoded.fan_delay.time = readUInt8(bytes[offset + 1]);
            offset += 2;
            break;
        case 0x06:
            decoded.fan_execute_time = readUInt8(bytes[offset]);
            offset += 1;
            break;
        case 0x07:
            decoded.fan_dehumidify = {};
            var enable_value = readUInt8(bytes[offset]);
            decoded.fan_dehumidify.enable = readEnableStatus(enable_value);
            if (enable_value) {
                decoded.fan_dehumidify.execute_time = readUInt8(bytes[offset + 1]);
            }
            offset += 2;
            break;
        case 0x08:
            var screen_display_mode_map = { 0: "on", 1: "without plan show", 2: "disable all" };
            decoded.screen_display_mode = getValue(screen_display_mode_map, readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0x09:
            decoded.humidity_range = {};
            decoded.humidity_range.min = readUInt8(bytes[offset]);
            decoded.humidity_range.max = readUInt8(bytes[offset + 1]);
            offset += 2;
            break;
        case 0x0a:
            decoded.temperature_dehumidify = {};
            decoded.temperature_dehumidify.enable = readEnableStatus(readUInt8(bytes[offset]));
            var temperature_tolerance_value = readUInt8(bytes[offset + 1]);
            if (temperature_tolerance_value !== 0xff) {
                decoded.temperature_dehumidify.temperature_tolerance = temperature_tolerance_value / 10;
            }
            offset += 2;
            break;
        case 0x1b:
            var masked = readUInt8(bytes[offset]);
            var enabled = readUInt8(bytes[offset + 1]);
            decoded.temperature_up_down_enable = {};
            var bit_offset = { forward_enable: 0, backward_enable: 1 };
            for (var key in bit_offset) {
                if ((masked >>> bit_offset[key]) & 0x01) {
                    decoded.temperature_up_down_enable[key] = readEnableStatus((enabled >>> bit_offset[key]) & 0x01);
                }
            }
            offset += 2;
            break;

        // fireware version 1.4
        case 0x29:
            var offline_timeout = readUInt8(bytes[offset]);
            decoded.offline_timeout = {};
            if(RAW_VALUE) {
                var rawValue_offline_timeout_map = { 255: 1, 5: 2, 10: 3, 20: 4, 30: 5, 40: 6, 50: 7, 60: 8 };
                decoded.offline_timeout.value = rawValue_offline_timeout_map[offline_timeout];
                decoded.offline_timeout.time = offline_timeout === 255 ? "disable" : offline_timeout;
            } else {
                decoded.offline_timeout.time = offline_timeout === 255 ? "disable" : offline_timeout;
            }
            offset += 1;
            break;
        case 0x2a:
            decoded.heartbeat = readUInt8(bytes[offset]);
            offset += 1;
            break;
        
        case 0x3a:
            decoded.wires_relay_change_report_enable = readEnableStatus(readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0x3b:
            var value = readUInt8(bytes[offset]);
            decoded.aux_control_config = {};
            var aux_control_bit_offset = { y2_enable: 0, w2_enable: 1 };
            for (var aux_wire_key in aux_control_bit_offset) {
                if ((value >>> (aux_control_bit_offset[aux_wire_key] + 4)) & 0x01) {
                    decoded.aux_control_config[aux_wire_key] = readEnableStatus((value >>> aux_control_bit_offset[aux_wire_key]) & 0x01);
                }
            }
            offset += 1;
            break;
        case 0x3e:
            var d2d_master_id = {};
            d2d_master_id.id = readUInt8(bytes[offset]) + 1;
            d2d_master_id.dev_eui = toHexString(bytes.slice(offset + 1, offset + 9));
            offset += 9;
            decoded.d2d_master_ids = decoded.d2d_master_ids || [];
            decoded.d2d_master_ids.push(d2d_master_id);
            break;
        case 0x41:
            decoded.target_temperature_resolution = readTemperatureResolution(readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0x42:
            decoded.target_temperature_range_config = {};
            decoded.target_temperature_range_config.temperature_control_mode = readTemperatureControlMode(readUInt8(bytes[offset]));
            decoded.target_temperature_range_config.min = readInt16LE(bytes.slice(offset + 1, offset + 3)) / 10;
            decoded.target_temperature_range_config.max = readInt16LE(bytes.slice(offset + 3, offset + 5)) / 10;
            offset += 5;
            break;
        case 0x43:
            decoded.temperature_level_up_down_delta = {};
            // skip the first byte
            decoded.temperature_level_up_down_delta.delta_1 = readUInt8(bytes[offset + 1]) / 10;
            decoded.temperature_level_up_down_delta.delta_2 = readUInt8(bytes[offset + 2]) / 10;
            offset += 3;
            break;
        case 0x44:
            decoded.fan_delay_config = {};
            decoded.fan_delay_config.enable = readEnableStatus(readUInt8(bytes[offset]));
            decoded.fan_delay_config.delay_time = readUInt16LE(bytes.slice(offset + 1, offset + 3));
            offset += 3;
            break;
        case 0x45:
            decoded.system_status = readOnOffStatus(readUInt8(bytes[offset]));
            decoded.temperature_control_mode = readTemperatureControlMode(readUInt8(bytes[offset + 1]));
            decoded.target_temperature = readInt16LE(bytes.slice(offset + 2, offset + 4)) / 10;
            offset += 4;
            break;
        case 0x46:
            decoded.compressor_aux_combine_enable = readEnableStatus(readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0x47:
            decoded.system_protect_config = {};
            decoded.system_protect_config.enable = readEnableStatus(readUInt8(bytes[offset]));
            decoded.system_protect_config.duration = readUInt8(bytes[offset + 1]);
            offset += 2;
            break;
        case 0x58:
            decoded.target_temperature_dual = readEnableStatus(readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0x59:
            var dual_temperature_plan_config = readDualTemperaturePlanConfig(bytes.slice(offset, offset + 9));
            decoded.dual_temperature_plan_config = decoded.dual_temperature_plan_config || [];
            decoded.dual_temperature_plan_config.push(dual_temperature_plan_config);
            offset += 9;
            break;
        case 0x5a:
            var double_point_target_tolerance = readDoublePointTargetTolerance(bytes.slice(offset, offset + 2));

            decoded.double_point_target_tolerance = decoded.double_point_target_tolerance || [];
            decoded.double_point_target_tolerance.push(double_point_target_tolerance);
            offset += 2;
            break;
        case 0x5c:
            var unlock_button_bit_offset = { power_button: 0, temperature_up_button: 1, temperature_down_button: 2, fan_mode_button: 3, temperature_control_mode_button: 4 };
            var unlock_button_data = readUInt8(bytes[offset]);
            decoded.unlock_config = {};
            for (var btn in unlock_button_bit_offset) {
                decoded.unlock_config[btn] = readEnableStatus((unlock_button_data >>> unlock_button_bit_offset[btn]) & 0x01);
            }
            decoded.unlock_config.time = readUInt16LE(bytes.slice(offset + 1, offset + 3));
            offset += 3;
            break;
        case 0x5e:
            var single_temperature_plan_config = readSingleTemperaturePlanConfig(bytes.slice(offset, offset + 7));
            decoded.single_temperature_plan_config = decoded.single_temperature_plan_config || [];
            decoded.single_temperature_plan_config.push(single_temperature_plan_config);
            offset += 7;
            break;
        case 0x5d:
            var mode = readUInt8(bytes[offset]);
            var buttons = [];
            var buttons_array = [ "heat", "em heat", "cool", "auto" ];
            for (var i = 0; i < buttons_array.length; i++) {
                if ((mode >>> i) & 0x01) {
                    buttons.push(buttons_array[i]);
                }
            }
            var modes = buttons.join("/");
            decoded.temperature_control_enable_setting = {};
            if(RAW_VALUE) {
                var temperature_control_enable_setting_map = { 
                    1: "heat/em heat/cool/auto", 
                    2: "heat/cool/auto", 
                    3: "heat", 
                    4: "cool", 
                    5: "heat/cool" 
                };
                var values = getValues(temperature_control_enable_setting_map, modes);
                decoded.temperature_control_enable_setting.value = values;
                decoded.temperature_control_enable_setting.mode = getMapValue(temperature_control_enable_setting_map, values);
            } else {
                decoded.temperature_control_enable_setting.mode = modes ? modes : "disable";
            }
            offset += 1;
            break;
        case 0x62:
            decoded.fan_control_during_heating = readFanControlDuringHeating(readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0x8b:
            decoded.plan_schedule_enable_config = readPlanScheduleEnableConfig(bytes.slice(offset, offset + 2));
            offset += 2;
            break;

        // fireware version 1.5
        case 0x20: 
            decoded.fan_delay_config_enable = readEnableStatus(readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0x21: 
            decoded.fan_delay_config_delay_time = readUInt16LE(bytes.slice(offset, offset + 2));
            offset += 2;
            break;
        case 0x22: 
            var temporary_unlock_settings = readUInt8(bytes[offset]);
            var buttons = [];
            var buttons_array = [ "System On/Off", "Temperature +", "Temperature -", "Fan Mode", "Temperature Control Mode" ];
            for (var i = 0; i < buttons_array.length; i++) {
                if ((temporary_unlock_settings >>> i) & 0x01) {
                    buttons.push(buttons_array[i]);
                }
            }
            var settings = buttons.join("&");
            decoded.temporary_unlock_settings = {};
            if(RAW_VALUE) {
                var rawValue_temporary_unlock_settings_map = { 
                    1: "disable",
                    2: "System On/Off&Temperature +",
                    3: "System On/Off&Temperature -",
                    4: "System On/Off&Fan Mode",
                    5: "System On/Off&Temperature Control Mode",
                    6: "Temperature +&Temperature -",
                    7: "Temperature +&Fan Mode",
                    8: "Temperature +&Temperature Control Mode",
                    9: "Temperature -&Fan Mode",
                    10: "Temperature -&Temperature Control Mode",
                    11: "Fan Mode&Temperature Control Mode",
                    12: "System On/Off&Temperature +&Temperature -",
                    13: "System On/Off&Temperature +&Fan Mode",
                    14: "System On/Off&Temperature +&Temperature Control Mode",
                    15: "System On/Off&Temperature -&Fan Mode",
                    16: "System On/Off&Temperature -&Temperature Control Mode",
                    17: "System On/Off&Fan Mode&Temperature Control Mode",
                    18: "Temperature +&Temperature -&Fan Mode",
                    19: "Temperature +&Temperature -&Temperature Control Mode",
                    20: "Temperature +&Fan Mode&Temperature Control Mode",
                    21: "Temperature -&Fan Mode&Temperature Control Mode",
                    22: "System On/Off&Temperature +&Temperature -&Fan Mode",
                    23: "System On/Off&Temperature +&Temperature -&Temperature Control Mode",
                    24: "System On/Off&Temperature +&Fan Mode&Temperature Control Mode",
                    25: "System On/Off&Temperature -&Fan Mode&Temperature Control Mode",
                    26: "Temperature +&Temperature -&Fan Mode&Temperature Control Mode",
                    27: "System On/Off&Temperature +&Temperature -&Fan Mode&Temperature Control Mode"
                };
                decoded.temporary_unlock_settings.value = settings ? getValues(rawValue_temporary_unlock_settings_map, settings) : 1;
                decoded.temporary_unlock_settings.settings = settings ? settings : "disable";
            } else {
                decoded.temporary_unlock_settings.settings = settings ? settings : "disable";
            }
            offset += 1;
            break;
        case 0x23:
            decoded.temperature_control_delta1 = readUInt8(bytes[offset]) / 10;
            offset += 1;
            break;
        case 0x24:
            decoded.temperature_control_delta2 = readUInt8(bytes[offset]) / 10;
            offset += 1;
            break;
        case 0x27:
            var occupancy_mode = readUInt8(bytes[offset]);
            var rawValue_occupancy_mode_map = { 1: "off", 2: "occupied", 3: "unoccupied" };
            decoded.occupancy_mode = {};
            if(RAW_VALUE) {
                decoded.occupancy_mode.value = occupancy_mode;
                decoded.occupancy_mode.mode = rawValue_occupancy_mode_map[occupancy_mode];
            } else {
                decoded.occupancy_mode.mode = rawValue_occupancy_mode_map[occupancy_mode];
            }
            offset += 1;
            break;
        case 0x28:
            var occupied_delay = readUInt8(bytes[offset]);
            decoded.occupied_delay = {};
            if(RAW_VALUE) {
                var rawValue_occupied_delay_map = { 255: 1, 5: 2, 10: 3, 20: 4, 30: 5, 40: 6, 50: 7, 60: 8 };
                decoded.occupied_delay.value = rawValue_occupied_delay_map[occupied_delay];
                decoded.occupied_delay.time = occupied_delay === 255 ? "disable" : occupied_delay;
            } else {
                decoded.occupied_delay.time = occupied_delay === 255 ? "disable" : occupied_delay;
            }
            offset += 1;
            break;
        case 0x2b:
            decoded.unilateral_tolerance = readEnableStatus(readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0x2c:
            var time_format = readUInt8(bytes[offset]);
            var time_format_map = { 1: "12 Hour (AM-PM)", 2: "24 Hour" };
            decoded.time_format = {};
            if (RAW_VALUE) {
                decoded.time_format.value = time_format;
                decoded.time_format.mode = time_format_map[time_format];
            } else {
                decoded.time_format.mode = time_format_map[time_format];
            }
            offset += 1;
            break;
        case 0x2d:
            var wire_mode = readUInt8(bytes[offset]);
            var wire_mode_map = { 1: "standard", 2: "custom" };
            decoded.wire_mode = {};
            if(RAW_VALUE) {
                decoded.wire_mode.value = wire_mode;
                decoded.wire_mode.mode = wire_mode_map[wire_mode];
            } else {
                decoded.wire_mode.mode = wire_mode_map[wire_mode];
            }
            offset += 1;
            break;
        case 0x2e:
            var temperature_humidity_source = readUInt8(bytes[offset]);
            var temperature_humidity_source_map = [
                { value: 1, name: "embedded" },
                { value: 3, name: "lora" },
                { value: 4, name: "d2d" },
            ];
            decoded.temperature_humidity_source = {};
            if(RAW_VALUE) {
                decoded.temperature_humidity_source.value = temperature_humidity_source_map[temperature_humidity_source - 1]['value'];
                decoded.temperature_humidity_source.mode = temperature_humidity_source_map[temperature_humidity_source - 1]['name'];
            } else {
                decoded.temperature_humidity_source.mode = temperature_humidity_source_map[temperature_humidity_source - 1]['name'];
            }
            offset += 1;
            break;
        case 0x2f:
            var timezone = readUInt8(bytes[offset]);
            var timezone_map = { 1: "UTC-12", 2: "UTC-11", 3: "UTC-10", 4: "UTC-9:30", 5: "UTC-9", 6: "UTC-8", 7: "UTC-7", 8: "UTC-6", 9: "UTC-5", 10: "UTC-4", 11: "UTC-3:30", 12: "UTC-3", 13: "UTC-2", 14: "UTC-1", 15: "UTC", 16: "UTC+1", 17: "UTC+2", 18: "UTC+3", 19: "UTC+3:30", 20: "UTC+4", 21: "UTC+4:30", 22: "UTC+5", 23: "UTC+5:30", 24: "UTC+5:45", 25: "UTC+6", 26: "UTC+6:30", 27: "UTC+7", 28: "UTC+8", 29: "UTC+9", 30: "UTC+9:30", 31: "UTC+10", 32: "UTC+10:30", 33: "UTC+11", 34: "UTC+12", 35: "UTC+12:45", 36: "UTC+13", 37: "UTC+14" };
            decoded.timezone_index = {};
            if(RAW_VALUE) {
                decoded.timezone_index.value = timezone;
                decoded.timezone_index.timezone = timezone_map[timezone];
            } else {
                decoded.timezone_index.timezone = timezone_map[timezone];
            }
            offset += 1;
            break;
        case 0x30: 
            decoded.timezone_offset = readInt16LE(bytes.slice(offset, offset + 2));
            offset += 2;
            break;
        case 0x31:
            decoded.children_locks_enable = readEnableStatus(readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0x32:
            decoded.target_deadband = readUInt8(bytes[offset]) / 10;
            offset += 1;
            break;
        case 0x33:
            decoded.sharing_mode_enable = readEnableStatus(readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0x64:
            decoded.occupied_cooling_setpoint = readUInt16LE(bytes.slice(offset, offset + 2)) / 10;
            offset += 2;
            break;
        case 0x65:
            decoded.occupied_heating_setpoint = readUInt16LE(bytes.slice(offset, offset + 2)) / 10;
            offset += 2;
            break;
        case 0x66:
            decoded.unoccupied_cooling_setpoint = readUInt16LE(bytes.slice(offset, offset + 2)) / 10;
            offset += 2;
            break;
        case 0x67:
            decoded.unoccupied_heating_setpoint = readUInt16LE(bytes.slice(offset, offset + 2)) / 10;
            offset += 2;
            break;
        case 0x68:
            decoded.cooling_setpoint = readUInt16LE(bytes.slice(offset, offset + 2)) / 10;
            offset += 2;
            break;
        case 0x69:
            decoded.heating_setpoint = readUInt16LE(bytes.slice(offset, offset + 2)) / 10;
            offset += 2;
            break;
        case 0x6a:
            decoded.occupied_cooling_setpoint_tolerance = readUInt8(bytes[offset]) / 10;
            offset += 1;
            break;
        case 0x6b:
            decoded.occupied_heating_setpoint_tolerance = readUInt8(bytes[offset]) / 10;
            offset += 1;
            break;
        case 0x6c:
            decoded.unoccupied_cooling_setpoint_tolerance = readUInt8(bytes[offset]) / 10;
            offset += 1;
            break;
        case 0x6d:
            decoded.unoccupied_heating_setpoint_tolerance = readUInt8(bytes[offset]) / 10;
            offset += 1;
            break;
        case 0x6e:
            decoded.cooling_setpoint_tolerance = readUInt8(bytes[offset]) / 10;
            offset += 1;
            break;
        case 0x6f:
            decoded.heating_setpoint_tolerance = readUInt8(bytes[offset]) / 10;
            offset += 1;
            break;
        case 0x72:
            decoded.center_cool_temp = readUInt16LE(bytes.slice(offset, offset + 2)) / 10;
            offset += 2;
            break;
        case 0x73:
            decoded.center_heat_temp = readUInt16LE(bytes.slice(offset, offset + 2)) / 10;
            offset += 2;
            break;
        case 0x74:
            decoded.cooling_adjust_tolerance = readInt16LE(bytes.slice(offset, offset + 2)) / 10;
            offset += 2;
            break;
        case 0x75:
            decoded.heating_adjust_tolerance = readInt16LE(bytes.slice(offset, offset + 2)) / 10;
            offset += 2;
            break;
        case 0x80:
            decoded.custom_wiring_mode = readEnableStatus(readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0x81:
            decoded.heating_stage1 = readTemperatureControlStage(readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0x82:
            decoded.heating_stage2 = readTemperatureControlStage(readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0x83:
            decoded.heating_stage3 = readTemperatureControlStage(readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0x84:
            decoded.heating_stage4 = readTemperatureControlStage(readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0x85:
            decoded.heating_stage5 = readTemperatureControlStage(readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0x86:
            decoded.emergency_heating = readTemperatureControlStage(readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0x87:
            decoded.cooling_stage1 = readTemperatureControlStage(readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0x88:
            decoded.cooling_stage2 = readTemperatureControlStage(readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0x89:
            decoded.cooling_stage3 = readTemperatureControlStage(readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0x90:
            decoded.screen_display_enable = readEnableStatus(readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0x91:
            decoded.screen_time_enable = readEnableStatus(readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0x92:
            decoded.screen_target_enable = readEnableStatus(readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0x93:
            decoded.screen_temp_enable = readEnableStatus(readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0x94:
            decoded.screen_humi_enable = readEnableStatus(readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0x95:
            decoded.screen_plan_enable = readEnableStatus(readUInt8(bytes[offset]));
            offset += 1;
            break;
        case 0x96:
            decoded.screen_target_others_enable = readEnableStatus(readUInt8(bytes[offset]));
            offset += 1;
            break;
        default:
            throw new Error("unknown downlink response");
    }

    if (hasResultFlag(code)) {
        var result_value = readUInt8(bytes[offset]);
        offset += 1;

        if (result_value !== 0) {
            var request = decoded;
            decoded = {};
            decoded.device_response_result = {};
            decoded.device_response_result.channel_type = channel_type;
            decoded.device_response_result.result = readResultStatus(result_value);
            decoded.device_response_result.request = request;
        }
    }

    return { data: decoded, offset: offset };
}

function hasResultFlag(code) {
    return code === 0xf8;
}

function readResultStatus(status) {
    var status_map = { 0: "success", 1: "forbidden", 2: "invalid parameter" };
    return getValue(status_map, status);
}

function readProtocolVersion(bytes) {
    var major = (bytes & 0xf0) >> 4;
    var minor = bytes & 0x0f;
    return "v" + major + "." + minor;
}

function readHardwareVersion(bytes) {
    var major = (bytes[0] & 0xff).toString(16);
    var minor = (bytes[1] & 0xff) >> 4;
    return "v" + major + "." + minor;
}

function readFirmwareVersion(bytes) {
    var major = (bytes[0] & 0xff).toString(16);
    var minor = (bytes[1] & 0xff).toString(16);
    return "v" + major + "." + minor;
}

function readTslVersion(bytes) {
    var major = bytes[0] & 0xff;
    var minor = bytes[1] & 0xff;
    return "v" + major + "." + minor;
}

function readSerialNumber(bytes) {
    var temp = [];
    for (var idx = 0; idx < bytes.length; idx++) {
        temp.push(("0" + (bytes[idx] & 0xff).toString(16)).slice(-2));
    }
    return temp.join("");
}

function readLoRaWANClass(type) {
    var class_map = {
        0: "Class A",
        1: "Class B",
        2: "Class C",
        3: "Class CtoB",
    };
    return getValue(class_map, type);
}

function readResetEvent(status) {
    var status_map = { 0: "normal", 1: "reset" };
    return getValue(status_map, status);
}

function readDeviceStatus(status) {
    var status_map = { 0: "off", 1: "on" };
    return getValue(status_map, status);
}

function readEnableStatus(status) {
    var status_map = { 0: "disable", 1: "enable" };
    return getValue(status_map, status);
}

function readYesNoStatus(type) {
    var yes_no_status_map = { 0: "no", 1: "yes" };
    return getValue(yes_no_status_map, type);
}

function readOnOffStatus(type) {
    var on_off_status_map = { 0: "off", 1: "on" };
    return getValue(on_off_status_map, type);
}

function readTemperatureUnit(type) {
    var temperature_unit_map = { 0: "celsius", 1: "fahrenheit" };
    return getValue(temperature_unit_map, type);
}

function readTemperatureResolution(type) {
    var temperature_resolution_map = { 0: 0.5, 1: 1 };
    return getValue(temperature_resolution_map, type);
}

function readTemperatureAlarm(type) {
    var temperature_alarm_map = {
        1: "emergency heating timeout alarm",
        2: "auxiliary heating timeout alarm",
        3: "persistent low temperature alarm",
        4: "persistent low temperature alarm release",
        5: "persistent high temperature alarm",
        6: "persistent high temperature alarm release",
        7: "freeze protection alarm",
        8: "freeze protection alarm release",
        9: "threshold alarm",
        10: "threshold alarm release",
    };
    return getValue(temperature_alarm_map, type);
}

function readSensorStatus(type) {
    var sensor_status_map = {
        1: "read failed",
        2: "out of range",
    };
    return getValue(sensor_status_map, type);
}

function readTemperatureHumiditySource(type) {
    var value_map = {
        1: "embedded",
        2: "loRa",
        3: "d2d",
    };
    var source_map = {
        "embedded": 1,
        "loRa": 3,
        "d2d": 4,
    };
    var source = getMapValue(value_map, type);
    var value = getMapKey(value_map, type, source_map[value_map[type]]);
    if (RAW_VALUE) {
        return {
            source: source,
            value: value
        };
    } else {
        return {
            source: source
        };
    }
}

function readTemperatureControlStage(value) {
    var stage = {};
    var wire_map = {
        1: "disable",
        2: "Y1",
        3: "Y2",
        4: "W1",
        5: "W2(AUX)",
        6: "Y1+Y2",
        7: "Y1+Y2+W1",
        8: "Y1+Y2+W1+W2(AUX)",
        9: "Y1+W1",
        10: "Y1+W1+W2(AUX)",
        11: "W1+W2(AUX)",
        12: "E"
    };

    var wires = [];
    var wires_array = [ "Y1", "Y2", "W1", "W2(AUX)", "E" ];
    for (var i = 0; i < wires_array.length; i++) {
        if ((value >>> i) & 0x01) {
            wires.push(wires_array[i]);
        }
    }
    var settings = wires.length > 0 ? wires.join("+") : "disable";
    var values = getValues(wire_map, settings);
    if(RAW_VALUE) {
        stage.value = values;
        stage.wire = values ? values : "unknown";
    } else {
        stage.wire = settings;
    }

    return stage;
}

function readExecutePlanType(type) {
    var fix_type = type - 1;
    if (fix_type === -1) {
        fix_type = 255;
    }
    var plan_event_map = {
        0: "wake",
        1: "away",
        2: "home",
        3: "sleep",
        4: "occupied",
        5: "vacant",
        6: "eco",
        255: "not executed",
    };
    return getValue(plan_event_map, fix_type);
}

function readPlanType(type) {
    var plan_event_type_map = {
        0: "wake",
        1: "away",
        2: "home",
        3: "sleep",
        4: "occupied",
        5: "vacant",
        6: "eco",
    };
    return getValue(plan_event_type_map, type);
}

function readFanMode(type) {
    var fan_mode_map = {
        0: "auto",
        1: "on",
        2: "circulate",
        3: "disable",
    };
    return getValue(fan_mode_map, type);
}

function readFanStatus(type) {
    var fan_status_map = {
        0: "standby",
        1: "high speed",
        2: "low speed",
        3: "on"
    };
    return getValue(fan_status_map, type);
}

function readControlPermission(type) {
    var control_permission_map = { 0: "thermostat", 1: "remote control" };
    return getValue(control_permission_map, type);
}

function readOfflineControlMode(type) {
    var offline_control_mode_map = { 0: "keep", 1: "thermostat", 2: "off" };
    return getValue(offline_control_mode_map, type);
}

function readPlanId(type) {
    var plan_id_map = {
        0: "wake",
        1: "away",
        2: "home",
        3: "sleep"
    };
    return getValue(plan_id_map, type);
}

function readTempMode(type) {
    var temperature_mode_map = {
        0: "heat",
        1: "em heat",
        2: "cool",
        3: "auto"
    };
    return getValue(temperature_mode_map, type);
}

function readOldFanMode(type) {
    var fan_mode_map = {
        0: "auto",
        1: "on",
        2: "circulate"
    };
    return getValue(fan_mode_map, type);
}

function readTemperatureControlMode(type) {
    var temperature_control_mode_map = {
        0: "heat",
        1: "em heat",
        2: "cool",
        3: "auto",
        4: "auto heat",
        5: "auto cool",
    };
    return getValue(temperature_control_mode_map, type);
}

function readTemperatureControlStatus(type) {
    var temperature_control_status_map = {
        0: "standby",
        1: "stage-1 heat",
        2: "stage-2 heat",
        3: "stage-3 heat",
        4: "stage-4 heat",
        5: "em heat",
        6: "stage-1 cool",
        7: "stage-2 cool",
        8: "stage-5 heat", //hardware version v2.0
        9: "stage-3 cool", //firmware version v1.5
    };
    return getMapValue(temperature_control_status_map, type);
}

function readWires(wire1, wire2, wire3) {
    var wire = {};
    wire.y1 = readOnOffStatus((wire1 >>> 0) & 0x03);
    wire.gh = readOnOffStatus((wire1 >>> 2) & 0x03);
    wire.ob = readOnOffStatus((wire1 >>> 4) & 0x03);
    wire.w1 = readOnOffStatus((wire1 >>> 6) & 0x03);

    wire.e = readOnOffStatus((wire2 >>> 0) & 0x03);
    wire.di = readOnOffStatus((wire2 >>> 2) & 0x03);
    wire.pek = readOnOffStatus((wire2 >>> 4) & 0x03);
    wire.w2 = readOnOffStatus((wire2 >>> 6) & 0x01);
    wire.aux = readOnOffStatus(((wire2 >>> 6) & 0x03) === 2 ? 1 : 0);

    wire.y2 = readOnOffStatus((wire3 >>> 0) & 0x01);
    wire.gl = readOnOffStatus(((wire3 >>> 0) & 0x03) === 2 ? 1 : 0);
    return wire;
}

function readWiresRelay(status) {
    var relay = [];
    var relay_array = [ 'Y1', 'Y2', 'W1', 'W2', 'EH', 'G', 'OB' ];
    for (var i = 0; i < relay_array.length; i++) {
        if ((status >>> i) & 0x01) {
            relay.push(relay_array[i]);
        }
    }
    return relay.length > 0 ? relay.join("&") : "off";
}

function readReversingValve(type) {
    var reversing_valve_map = {
        1: "on cool",
        2: "on heat"
    };
    return getValue(reversing_valve_map, type);
}

function readActionType(type) {
    var action_type_map = {
        0: "power",
        1: "plan",
    };
    return getValue(action_type_map, type);
}

function readTemperatureControlType(type) {
    var temperature_control_type_map = { 0: "heat", 1: "cool" };
    return getValue(temperature_control_type_map, type);
}

function readLevelSwitchSettings(bytes) {
    var level_switch_settings = {};
    level_switch_settings.type = readTemperatureControlType(readUInt8(bytes[0]));
    level_switch_settings.time = readUInt8(bytes[1]);
    level_switch_settings.change_value = readUInt8(bytes[2]) / 10;
    return level_switch_settings;
}

function readTemperatureControlSupportMode(value) {
    var enable = {};
    enable.heat = readEnableStatus((value >>> 0) & 0x01);
    enable.em_heat = readEnableStatus((value >>> 1) & 0x01);
    enable.cool = readEnableStatus((value >>> 2) & 0x01);
    enable.auto = readEnableStatus((value >>> 3) & 0x01);
    return enable;
}

function readTemperatureControlSupportStatus(heat_mode_value, cool_mode_value) {
    var enable = {};
    enable.stage_1_heat = readEnableStatus((heat_mode_value >>> 0) & 0x01);
    enable.stage_2_heat = readEnableStatus((heat_mode_value >>> 1) & 0x01);
    enable.stage_3_heat = readEnableStatus((heat_mode_value >>> 2) & 0x01);
    enable.stage_4_heat = readEnableStatus((heat_mode_value >>> 3) & 0x01);
    enable.stage_5_heat = readEnableStatus((heat_mode_value >>> 4) & 0x01);
    enable.stage_1_cool = readEnableStatus((cool_mode_value >>> 0) & 0x01);
    enable.stage_2_cool = readEnableStatus((cool_mode_value >>> 1) & 0x01);
    enable.stage_3_cool = readEnableStatus((cool_mode_value >>> 2) & 0x01);
    return enable;
}

function readWeekRecycleSettings(value) {
    var week_day_bits_offset = { monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 7 };
    var week_enable = {};
    for (var day in week_day_bits_offset) {
        week_enable[day] = readEnableStatus((value >>> week_day_bits_offset[day]) & 0x01);
    }
    return week_enable;
}

function readTimeZone(time_zone) {
    var timezone_map = { "-720": "UTC-12", "-660": "UTC-11", "-600": "UTC-10", "-570": "UTC-9:30", "-540": "UTC-9", "-480": "UTC-8", "-420": "UTC-7", "-360": "UTC-6", "-300": "UTC-5", "-240": "UTC-4", "-210": "UTC-3:30", "-180": "UTC-3", "-120": "UTC-2", "-60": "UTC-1", 0: "UTC", 60: "UTC+1", 120: "UTC+2", 180: "UTC+3", 210: "UTC+3:30", 240: "UTC+4", 270: "UTC+4:30", 300: "UTC+5", 330: "UTC+5:30", 345: "UTC+5:45", 360: "UTC+6", 390: "UTC+6:30", 420: "UTC+7", 480: "UTC+8", 540: "UTC+9", 570: "UTC+9:30", 600: "UTC+10", 630: "UTC+10:30", 660: "UTC+11", 720: "UTC+12", 765: "UTC+12:45", 780: "UTC+13", 840: "UTC+14" };
    return getValue(timezone_map, time_zone);
}

function readSingleTemperaturePlanConfig(bytes) {
    var offset = 0;

    var config = {};
    config.plan_type = readPlanType(readUInt8(bytes[offset]));
    config.temperature_control_mode = readTemperatureControlMode(readUInt8(bytes[offset + 1]));
    config.fan_mode = readFanMode(readUInt8(bytes[offset + 2]));
    config.target_temperature = readInt16LE(bytes.slice(offset + 3, offset + 5)) / 10;
    config.target_temperature_tolerance = readUInt8(bytes[offset + 5]) / 10;
    config.temperature_control_tolerance = readUInt8(bytes[offset + 6]) / 10;
    return config;
}

function readDoublePointTargetTolerance(bytes) {
    var double_point_target_tolerance = {};
    var mode_map = { 0: "heat", 1: "cool" };
    double_point_target_tolerance.mode = getValue(mode_map, readUInt8(bytes[0]));
    double_point_target_tolerance.tolerance = readUInt8(bytes[1]) / 10;
    return double_point_target_tolerance;
}

function readDualTemperaturePlanConfig(bytes) {
    var offset = 0;

    var config = {};
    config.type = readPlanType(readUInt8(bytes[offset]));
    config.temperature_control_mode = readTemperatureControlMode(readUInt8(bytes[offset + 1]));
    config.fan_mode = readFanMode(readUInt8(bytes[offset + 2]));
    var heat_target_temperature_value = readUInt16LE(bytes.slice(offset + 3, offset + 5));
    if (heat_target_temperature_value !== 0xffff) {
        config.heat_target_temperature = readUInt16LE(bytes.slice(offset + 3, offset + 5)) / 10;
    }
    var heat_temperature_tolerance_value = readUInt8(bytes[offset + 5]);
    if (heat_temperature_tolerance_value !== 0xff) {
        config.heat_temperature_tolerance = heat_temperature_tolerance_value / 10;
    }
    var cool_target_temperature_value = readUInt16LE(bytes.slice(offset + 6, offset + 8));
    if (cool_target_temperature_value !== 0xffff) {
        config.cool_target_temperature = readUInt16LE(bytes.slice(offset + 6, offset + 8)) / 10;
    }
    var cool_temperature_tolerance_value = readUInt8(bytes[offset + 8]);
    if (cool_temperature_tolerance_value !== 0xff) {
        config.cool_temperature_tolerance = cool_temperature_tolerance_value / 10;
    }
    return config;
}

function readPlan(bytes) {
    var offset = 0;
    var plan = {};
    plan.plan_id = readPlanId(bytes[offset]);
    plan.temp_mode = readTempMode(bytes[offset + 1]);
    plan.fan_mode = readOldFanMode(bytes[offset + 2]);
    plan.target = readUInt8(bytes[offset + 3]);
    plan.error = readUInt8(bytes[offset + 4]) / 10;
    return plan;
}

function readPlanSchedule(bytes) {
    var offset = 0;
    var schedule = {};
    schedule.plan_type = readPlanType(bytes[offset]);
    schedule.id = bytes[offset + 1] + 1;
    schedule.enable = readEnableStatus(bytes[offset + 2]);
    schedule.week_recycle = readWeekRecycleSettings(bytes[offset + 3]);
    schedule.time = readUInt16LE(bytes.slice(offset + 4, offset + 6));
    return schedule;
}

function readPlanScheduleEnableConfig(bytes) {
    var offset = 0;
    var mask = readUInt8(bytes[offset]);
    var value = readUInt8(bytes[offset + 1]);

    var plan_schedule_enable_config = {};
    var plan_bit_offset = { wake: 0, away: 1, home: 2, sleep: 3, occupied: 4, vacant: 5, eco: 6 };
    for (var key in plan_bit_offset) {
        if ((mask >>> plan_bit_offset[key]) & 0x01) {
            plan_schedule_enable_config[key] = readEnableStatus((value >>> plan_bit_offset[key]) & 0x01);
        }
    }
    return plan_schedule_enable_config;
}
function readD2DCommand(bytes) {
    return ("0" + (bytes[1] & 0xff).toString(16)).slice(-2) + ("0" + (bytes[0] & 0xff).toString(16)).slice(-2);
}

function readD2DMasterConfig(bytes) {
    var offset = 0;
    var config = {};
    config.plan_type = readPlanType(readUInt8(bytes[offset]));
    config.enable = readEnableStatus(bytes[offset + 1]);
    config.lora_uplink_enable = readEnableStatus(bytes[offset + 2]);
    config.d2d_cmd = readD2DCommand(bytes.slice(offset + 3, offset + 5));
    config.time = readUInt16LE(bytes.slice(offset + 5, offset + 7));
    config.time_enable = readEnableStatus(bytes[offset + 7]);
    return config;
}

function readD2DSlaveConfig(bytes) {
    var offset = 0;
    var config = {};
    config.id = readUInt8(bytes[offset]) + 1;
    config.enable = readEnableStatus(bytes[offset + 1]);
    config.d2d_cmd = readD2DCommand(bytes.slice(offset + 2, offset + 4));

    var value = readUInt8(bytes[offset + 4]);
    // value = action(0..3) + action_type(4..7)
    var action_value = value & 0x0f;
    var action_type_value = (value >>> 4) & 0x0f;
    config.action = {};
    if (action_type_value === 0) {
        config.action.action_type = readActionType(action_type_value);
        config.action.system_status = readOnOffStatus(action_value);
    } else {
        config.action.action_type = readActionType(action_type_value);
        config.action.plan_type = readPlanType(action_value);
    }
    return config;
}

function readTemporaryUnlockSettings(type) {
    var temporary_unlock_settings_map = { 
        1: "disable",
        2: "Button1&Button2",
        3: "Button1&Button3",
        4: "Button1&Button4",
        5: "Button1&Button5",
        6: "Button2&Button3",
        7: "Button2&Button4",
        8: "Button2&Button5",
        9: "Button3&Button4",
        10: "Button3&Button5",
        11: "Button4&Button5",
        12: "Button1&Button2&Button3",
        13: "Button1&Button2&Button4",
        14: "Button1&Button2&Button5",
        15: "Button1&Button3&Button4",
        16: "Button1&Button3&Button5",
        17: "Button1&Button4&Button5",
        18: "Button2&Button3&Button4",
        19: "Button2&Button3&Button5",
        20: "Button2&Button4&Button5",
        21: "Button3&Button4&Button5",
        22: "Button1&Button2&Button3&Button4",
        23: "Button1&Button2&Button3&Button5",
        24: "Button1&Button2&Button4&Button5",
        25: "Button1&Button3&Button4&Button5",
        26: "Button2&Button3&Button4&Button5",
        27: "Button1&Button2&Button3&Button4&Button5"
     };
    return getValue(temporary_unlock_settings_map, type);
}

function readTemperatureSource(value) {
    var source_map = { 0: "disable", 1: "lora", 2: "d2d" };
    return getValue(source_map, value);
}

function readFanControlDuringHeating(value) {
    var mode_map = { 0: "furnace/boiler", 1: "thermostat" };
    return getValue(mode_map, value);
}

/* eslint-disable */
function readUInt8(bytes) {
    return bytes & 0xff;
}

function readInt8(bytes) {
    var ref = readUInt8(bytes);
    return ref > 0x7f ? ref - 0x100 : ref;
}

function readUInt16LE(bytes) {
    var value = (bytes[1] << 8) + bytes[0];
    return value & 0xffff;
}

function readInt16LE(bytes) {
    var ref = readUInt16LE(bytes);
    return ref > 0x7fff ? ref - 0x10000 : ref;
}

function readUInt32LE(bytes) {
    var value = (bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
    return (value & 0xffffffff) >>> 0;
}

function readInt32LE(bytes) {
    var ref = readUInt32LE(bytes);
    return ref > 0x7fffffff ? ref - 0x100000000 : ref;
}

// hex bytes to hex string
function toHexString(bytes) {
    for (var i = 0; i < bytes.length; i++) {
        bytes[i] = ("0" + bytes[i].toString(16)).slice(-2);
    }
    return bytes.join("");
}

function getValue(map, key) {
    if (RAW_VALUE) return key;

    var value = map[key];
    if (!value) value = "unknown";
    return value;
}

function getValues(map, value) {
    for (var key in map) {
        if (map[key] === value) {
            return parseInt(key);
        }
    }

    return null;
}

function getMapValue(map, key) {
    var value = map[key];
    if (!value) value = "unknown";
    return value;
}

function getMapKey(map, key, value) {
    if(getMapValue(map, key) !== "unknown") return value;

    return null;
}

function hasPath(obj, path) {
	var parts = path.split('.');
	var current = obj;
  
	for (var i = 0; i < parts.length; i++) {
	  	if (!current || !(parts[i] in current)) {
			return false;
	  	}
	  	current = current[parts[i]];
	}
  
	return true;
}

function getPath(obj, path) {
	var parts = path.split('.');
	var current = obj;
  
	for (var i = 0; i < parts.length; i++) {
	  	var key = parts[i];
  
	  	if (!current || !(key in current)) {
			return null;
	  	}
  
	  	current = current[key];
	}
  
	return current;
}
  

function setPath(obj, path, value) {
	var parts = path.split('.');
	var current = obj;
  
	for (var i = 0; i < parts.length - 1; i++) {
	  	var key = parts[i];
  
	  	if (!(key in current) || typeof current[key] !== 'object') {
			current[key] = {};
	  	}
  
	  	current = current[key];
	}

	current[parts[parts.length - 1]] = value;
	return obj;
}

function convertName(propertyId, prefix) {
	var parts = propertyId.split('.');
	var lastPart = parts[parts.length - 1];
	parts[parts.length - 1] = prefix + '_' + lastPart;
	return parts.join('.');
}

function recoverName(propertyId, prefix) {
	var parts = propertyId.split('.');
	var lastPart = parts[parts.length - 1];
	parts[parts.length - 1] = lastPart.replace(prefix + '_', '');
	return parts.join('.');
}

function getAllLeafPaths(obj, prefix) {
	var paths = [];

	function recurse(current, path) {
	  if (Array.isArray(current)) {
		current.forEach(function (item, index) {
		  var newPath = path ? (path + "." + index) : String(index);
		  recurse(item, newPath);
		});
  
	  } else if (typeof current === 'object' && current !== null) {
		for (var key in current) {
		  if (Object.prototype.hasOwnProperty.call(current, key)) {
			var newPath = path ? (path + "." + key) : key;
			recurse(current[key], newPath);
		  }
		}
  
	  } else {
		paths.push(path);
	  }
	}
  
	recurse(obj, "");
	return paths;
  
}

function isInteger(str) {
	return typeof str === 'string' && /^[0-9]+$/.test(str);
}

function processTemperature(decoded) {
	var allTemperatureProperties = {
        "ambient_temperature": {
            "precision": 1,
            "constant": 32
        },
        "temperature_control_delta1": {
            "precision": 1,
            "constant": 0
        },
        "temperature_control_delta2": {
            "precision": 1,
            "constant": 0
        },
        "target_deadband": {
            "precision": 1,
            "constant": 0
        },
        "occupied_cooling_setpoint": {
            "precision": 1,
            "constant": 32
        },
        "occupied_heating_setpoint": {
            "precision": 1,
            "constant": 32
        },
        "unoccupied_cooling_setpoint": {
            "precision": 1,
            "constant": 32
        },
        "unoccupied_heating_setpoint": {
            "precision": 1,
            "constant": 32
        },
        "cooling_setpoint": {
            "precision": 1,
            "constant": 32
        },
        "heating_setpoint": {
            "precision": 1,
            "constant": 32
        },
        "occupied_cooling_setpoint_tolerance": {
            "precision": 1,
            "constant": 0
        },
        "occupied_heating_setpoint_tolerance": {
            "precision": 1,
            "constant": 0
        },
        "unoccupied_cooling_setpoint_tolerance": {
            "precision": 1,
            "constant": 0
        },
        "unoccupied_heating_setpoint_tolerance": {
            "precision": 1,
            "constant": 0
        },
        "cooling_setpoint_tolerance": {
            "precision": 1,
            "constant": 0
        },
        "heating_setpoint_tolerance": {
            "precision": 1,
            "constant": 0
        },
        "center_cool_temp": {
            "precision": 1,
            "constant": 32
        },
        "center_heat_temp": {
            "precision": 1,
            "constant": 32
        },
        "cooling_adjust_tolerance": {
            "precision": 1,
            "constant": 0
        },
        "heating_adjust_tolerance": {
            "precision": 1,
            "constant": 0
        }
    };
	var leafPaths = getAllLeafPaths(decoded);
	for (var i = 0; i < leafPaths.length; i++) {
		var propertyId = leafPaths[i];
		var propertyParts = propertyId.split('.');
		var newPropertyParts = []
		for (var j = 0; j < propertyParts.length; j++) {
			var part = propertyParts[j];
			if (isInteger(part)) {
				newPropertyParts.push('_item');
			} else {
				newPropertyParts.push(part);
			}
		}
		var newPropertyId = newPropertyParts.join('.');
		newPropertyId = recoverName(newPropertyId, 'fahrenheit');
		newPropertyId = recoverName(newPropertyId, 'celsius');
		propertyId = recoverName(propertyId, 'fahrenheit');
		propertyId = recoverName(propertyId, 'celsius');
		if (allTemperatureProperties[newPropertyId]) {
			var fahrenheitProperty = convertName(propertyId, 'fahrenheit');
			var celsiusProperty = convertName(propertyId, 'celsius');
            var precision = allTemperatureProperties[newPropertyId].precision;
            var constant = allTemperatureProperties[newPropertyId].constant;
			if (hasPath(decoded, propertyId)) {
				setPath(decoded, fahrenheitProperty,  Number((getPath(decoded, propertyId) * 1.8 + constant).toFixed(precision)));
				setPath(decoded, celsiusProperty,  Number(getPath(decoded, propertyId).toFixed(precision)));
			}
		}	
	}	
	return decoded;
}

//if (!Object.assign) {
    Object.defineProperty(Object, "assign", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (target) {
            "use strict";
            if (target == null) {
                throw new TypeError("Cannot convert first argument to object");
            }

            var to = Object(target);
            for (var i = 1; i < arguments.length; i++) {
                var nextSource = arguments[i];
                if (nextSource == null) {
                    continue;
                }
                nextSource = Object(nextSource);

                var keysArray = Object.keys(Object(nextSource));
                for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                    var nextKey = keysArray[nextIndex];
                    var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                    if (desc !== undefined && desc.enumerable) {
                        // concat array
                        if (Array.isArray(to[nextKey]) && Array.isArray(nextSource[nextKey])) {
                            to[nextKey] = to[nextKey].concat(nextSource[nextKey]);
                        } else {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            return to;
        },
    });
//}


(function (moduleExports) {
/**
 * Payload Encoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product WT211
 */
var RAW_VALUE = 0x00;

/* eslint no-redeclare: "off" */
/* eslint-disable */
// Chirpstack v4
function encodeDownlink(input) {
    var encoded = milesightDeviceEncode(input.data);
    return { bytes: encoded };
}

// Chirpstack v3
function Encode(fPort, obj) {
    var encoded = milesightDeviceEncode(obj);
    return encoded;
}

// The Things Network
function Encoder(obj, port) {
    return milesightDeviceEncode(obj);
}
/* eslint-enable */

function milesightDeviceEncode(payload) {
    processTemperature(payload);
    var encoded = [];

    if ("reboot" in payload) {
        encoded = encoded.concat(reboot(payload.reboot));
    }
    if ("report_status" in payload) {
        encoded = encoded.concat(reportStatus(payload.report_status));
    }
    if ("history_enable" in payload) {
        encoded = encoded.concat(setHistoryEnable(payload.history_enable));
    }
    if ("retransmit_enable" in payload) {
        encoded = encoded.concat(setRetransmitEnable(payload.retransmit_enable));
    }
    if ("retransmit_interval" in payload) {
        encoded = encoded.concat(setRetransmitInterval(payload.retransmit_interval));
    }
    if ("resend_interval" in payload) {
        encoded = encoded.concat(setResendInterval(payload.resend_interval));
    }
    if ("reporting_interval_settings" in payload) {
        encoded = encoded.concat(setReportInterval(payload.reporting_interval_settings.time));
    }
    if ("collection_interval" in payload) {
        encoded = encoded.concat(setCollectionInterval(payload.collection_interval));
    }
    if ("synchronize_time" in payload) {
        encoded = encoded.concat(synchronizeTime(payload.synchronize_time));
    }
    if ("time_zone" in payload) {
        encoded = encoded.concat(setTimeZone(payload.time_zone));
    }
    if ("dst_config" in payload) {
        encoded = encoded.concat(setDaylightSavingTime(payload.dst_config));
    }
    if ("temperature_unit" in payload) {
        encoded = encoded.concat(setTemperatureUnitDisplay(payload.temperature_unit));
    }
    if ("temperature_control" in payload) {
        encoded = encoded.concat(setTemperatureControl(payload.temperature_control.mode, payload.temperature_control.target, payload.temperature_control.unit));
    }
    if ("temperature_control_mode" in payload) {
        if ("system_status" in payload) {
            encoded = encoded.concat(setSystemStatusAndTemperatureControl(payload.system_status, payload.temperature_control_mode, payload.target_temperature));
        } else {
            encoded = encoded.concat(setTemperatureTarget(payload.temperature_control_mode, payload.target_temperature));
        }
    }
    if ("device_status" in payload) {
        encoded = encoded.concat(setDeviceStatus(payload.device_status));
    }
    if ("temperature_calibration_settings" in payload) {
        encoded = encoded.concat(setTemperatureCalibration(payload.temperature_calibration_settings));
    }
    if ("humidity_calibration_settings" in payload) {
        encoded = encoded.concat(setHumidityCalibration(payload.humidity_calibration_settings));
    }
    if ("level_switch_settings" in payload) {
        for (var index = 0; index < payload.level_switch_settings.length; index++) {
            var level_switch_settings = payload.level_switch_settings[index];
            encoded = encoded.concat(setLevelSwitchSettings(level_switch_settings));
        }
    }
    if ("temperature_source_config" in payload) {
        encoded = encoded.concat(setTemperatureSourceConfig(payload.temperature_source_config));
    }
    if ("temperature_control_enable" in payload) {
        encoded = encoded.concat(setTemperatureControlEnableStatus(payload.temperature_control_enable));
    }
    if ("temperature" in payload) {
        encoded = encoded.concat(setOutsideTemperature(payload.temperature));
    }
    if ("humidity" in payload) {
        encoded = encoded.concat(setHumidity(payload.humidity));
    }
    if ("temperature_tolerance" in payload) {
        encoded = encoded.concat(setTemperatureTolerance(payload.temperature_tolerance));
    }
    if ("freeze_protection_config" in payload) {
        encoded = encoded.concat(setFreezeProtection(payload.freeze_protection_config));
    }
    if ("fan_mode_setting" in payload) {
        encoded = encoded.concat(setFanMode(payload.fan_mode_setting));
    }
    if ("fan_delay" in payload) {
        encoded = encoded.concat(setFanDelay(payload.fan_delay));
    }
    if ("fan_execute_time" in payload) {
        encoded = encoded.concat(setFanExecuteTime(payload.fan_execute_time));
    }
    if ("humidity_range" in payload) {
        encoded = encoded.concat(setHumidityRange(payload.humidity_range));
    }
    if ("temperature_dehumidify" in payload) {
        encoded = encoded.concat(setTemperatureDehumidify(payload.temperature_dehumidify));
    }
    if ("fan_dehumidify" in payload) {
        encoded = encoded.concat(setFanDehumidify(payload.fan_dehumidify));
    }
    if ("plan_type" in payload) {
        encoded = encoded.concat(setPlanType(payload.plan_type));
    }
    if ("plan_cfg" in payload) {
        for (var index = 0; index < payload.plan_cfg.length; index++) {
            var plan = payload.plan_cfg[index];
            encoded = encoded.concat(setPlan(plan));
        }
    }
    if ("plan_schedule" in payload) {
        for (var schedule_index = 0; schedule_index < payload.plan_schedule.length; schedule_index++) {
            var schedule = payload.plan_schedule[schedule_index];
            encoded = encoded.concat(setPlanSchedule(schedule));
        }
    }
    if ("plan_schedule_enable_config" in payload) {
        encoded = encoded.concat(setPlanScheduleEnableConfig(payload.plan_schedule_enable_config));
    }
    if ("single_temperature_plan_config" in payload) {
        for (var single_plan_index = 0; single_plan_index < payload.single_temperature_plan_config.length; single_plan_index++) {
            var single_temperature_plan_config = payload.single_temperature_plan_config[single_plan_index];
            encoded = encoded.concat(setPlanConfigWithSingleTemperature(single_temperature_plan_config));
        }
    }
    if ("dual_temperature_plan_config" in payload) {
        for (var dual_plan_index = 0; dual_plan_index < payload.dual_temperature_plan_config.length; dual_plan_index++) {
            var dual_temperature_plan_config = payload.dual_temperature_plan_config[dual_plan_index];
            encoded = encoded.concat(setPlanConfigWithDualTemperature(dual_temperature_plan_config));
        }
    }
    if ("card_config" in payload) {
        encoded = encoded.concat(setCardConfig(payload.card_config));
    }
    if ("child_lock_config" in payload) {
        encoded = encoded.concat(setChildLock(payload.child_lock_config));
    }
    if ("wires" in payload) {
        encoded = encoded.concat(setWires(payload.wires));
    }
    if("reversing_valve" in payload) {
        encoded = encoded.concat(setReversingValve(payload.reversing_valve));
    }
    if ("multicast_group_config" in payload) {
        encoded = encoded.concat(setMulticastGroupConfig(payload.multicast_group_config));
    }
    if ("d2d_master_enable" in payload || "d2d_slave_enable" in payload) {
        encoded = encoded.concat(setD2DEnable(payload.d2d_master_enable, payload.d2d_slave_enable));
    }
    if ("d2d_master_ids" in payload) {
        for (var d2d_master_id_index = 0; d2d_master_id_index < payload.d2d_master_ids.length; d2d_master_id_index++) {
            var d2d_master_id = payload.d2d_master_ids[d2d_master_id_index];
            encoded = encoded.concat(setD2DMasterId(d2d_master_id));
        }
    }
    if ("d2d_master_config" in payload) {
        for (var d2d_master_index = 0; d2d_master_index < payload.d2d_master_config.length; d2d_master_index++) {
            var d2d_master_config = payload.d2d_master_config[d2d_master_index];
            encoded = encoded.concat(setD2DMasterConfig(d2d_master_config));
        }
    }
    if ("d2d_slave_config" in payload) {
        for (var d2d_slave_index = 0; d2d_slave_index < payload.d2d_slave_config.length; d2d_slave_index++) {
            var d2d_slave_config = payload.d2d_slave_config[d2d_slave_index];
            encoded = encoded.concat(setD2DSlaveConfig(d2d_slave_config));
        }
    }
    if ("temperature_alarm_config" in payload) {
        encoded = encoded.concat(setTemperatureAlarmConfig(payload.temperature_alarm_config));
    }
    if ("control_permission" in payload) {
        encoded = encoded.concat(setControlPermission(payload.control_permission));
    }
    if ("offline_control_mode" in payload) {
        encoded = encoded.concat(setOfflineControlMode(payload.offline_control_mode));
    }

    // fireware version 1.4
    if ("offline_timeout" in payload) {
        encoded = encoded.concat(setConfigValueTime(payload.offline_timeout, "offline_timeout", 0x29));
    }
    if ("heartbeat" in payload) {
        encoded = encoded.concat(setDownHeart(payload.heartbeat));
    }
    
    if ("wires_relay_config" in payload) {
        encoded = encoded.concat(setWiresRelayConfig(payload.wires_relay_config));
    }
    if ("wires_relay_change_report_enable" in payload) {
        encoded = encoded.concat(setEnableStatus(payload.wires_relay_change_report_enable, "wires_relay_change_report_enable", 0x3a));
    }
    if ("aux_control_config" in payload) {
        encoded = encoded.concat(setAuxControlConfig(payload.aux_control_config));
    }
    if ("screen_display_mode" in payload) {
        encoded = encoded.concat(setScreenDisplayMode(payload.screen_display_mode));
    }
    if ("system_protect_config" in payload) {
        encoded = encoded.concat(setSystemProtectConfig(payload.system_protect_config));
    }
    if ("target_temperature_range_config" in payload) {
        encoded = encoded.concat(setTargetTemperatureRangeConfig(payload.target_temperature_range_config));
    }
    if ("fan_control_during_heating" in payload) {
        encoded = encoded.concat(setFanControlDuringHeating(payload.fan_control_during_heating));
    }
    if ("double_point_target_tolerance" in payload) {
        for (var index = 0; index < payload.double_point_target_tolerance.length; index++) {
            var double_point_target_tolerance = payload.double_point_target_tolerance[index];
            encoded = encoded.concat(setDoublePointTargetTolerance(double_point_target_tolerance));
        }
    }
    if ("target_temperature_dual_enable" in payload) {
        encoded = encoded.concat(setEnableStatus(payload.target_temperature_dual_enable, "target_temperature_dual_enable", 0x58));
    }
    if ("compressor_aux_combine_enable" in payload) {
        encoded = encoded.concat(setEnableStatus(payload.compressor_aux_combine_enable, "compressor_aux_combine_enable", 0x46));
    }
    if ("unlock_config" in payload) {
        encoded = encoded.concat(setUnlockConfig(payload.unlock_config));
    }
    if ("fan_delay_config" in payload) {
        encoded = encoded.concat(setFanDelayConfig(payload.fan_delay_config));
    }
    if ("temperature_level_up_down_delta" in payload) {
        encoded = encoded.concat(setTemperatureLevelUpDownDelta(payload.temperature_level_up_down_delta));
    }
    if ("target_temperature_resolution" in payload) {
        encoded = encoded.concat(setTargetTemperatureResolution(payload.target_temperature_resolution));
    }
    if ("temperature_up_down_enable" in payload) {
        encoded = encoded.concat(setTemperatureUpDownEnable(payload.temperature_up_down_enable));
    }

    // fireware version 1.5
    if ("temperature_control_enable_setting" in payload) {
        encoded = encoded.concat(setTemperatureControlEnableSetting(payload.temperature_control_enable_setting));
    }
    if ("current_temperature_control_mode" in payload) {
        encoded = encoded.concat(setCurrentTemperatureControlMode(payload.current_temperature_control_mode));
    }
    if ("fan_delay_config_enable" in payload) {
        encoded = encoded.concat(setEnableStatus(payload.fan_delay_config_enable, "fan_delay_config_enable", 0x20));
    }
    if ("fan_delay_config_delay_time" in payload) {
        encoded = encoded.concat(setFanDelayConfigDelayTime(payload.fan_delay_config_delay_time));
    }
    if ("temporary_unlock_settings" in payload) {
        encoded = encoded.concat(setTemporaryUnlockSettings(payload.temporary_unlock_settings));
    }
    if ("temperature_control_delta1" in payload) {
        encoded = encoded.concat(setTemperatureSettingUInt8Value(payload.temperature_control_delta1, [1, 10], "temperature_control_delta1", 0x23));
    }
    if ("temperature_control_delta2" in payload) {
        encoded = encoded.concat(setTemperatureSettingUInt8Value(payload.temperature_control_delta2, [1, 10], "temperature_control_delta2", 0x24));
    }
    if ("occupancy_mode" in payload) {
        encoded = encoded.concat(setOccupancyMode(payload.occupancy_mode));
    }
    if ("occupied_delay" in payload) {
        encoded = encoded.concat(setConfigValueTime(payload.occupied_delay, "occupied_delay", 0x28));
    }
    if ("unilateral_tolerance" in payload) {
        encoded = encoded.concat(setEnableStatus(payload.unilateral_tolerance, "unilateral_tolerance", 0x2b));
    }
    if ("time_format" in payload) {
        encoded = encoded.concat(setTimeFormat(payload.time_format));
    }
    if ("wire_mode" in payload) {
        encoded = encoded.concat(setWireMode(payload.wire_mode));
    }
    if ("temperature_humidity_source" in payload) {
        encoded = encoded.concat(setTemperatureHumiditySource(payload.temperature_humidity_source));
    }
    if ("timezone_index" in payload) {
        encoded = encoded.concat(setTimeZoneIndex(payload.timezone_index));
    }
    if ("timezone_offset" in payload) {
        encoded = encoded.concat(setTimeZoneOffset(payload.timezone_offset));
    }
    if ("children_locks_enable" in payload) {
        encoded = encoded.concat(setEnableStatus(payload.children_locks_enable, "children_locks_enable", 0x31));
    }
    if ("target_deadband" in payload) {
        encoded = encoded.concat(setTemperatureSettingUInt8Value(payload.target_deadband, [1, 10], "target_deadband", 0x32));
    }
    if ("sharing_mode_enable" in payload) {
        encoded = encoded.concat(setEnableStatus(payload.sharing_mode_enable, "sharing_mode_enable", 0x33));
    }
    if ("occupied_cooling_setpoint" in payload) {
        encoded = encoded.concat(setTemperatureSettingUInt16LEValue(payload.occupied_cooling_setpoint, [5, 35], "occupied_cooling_setpoint", 0x64));
    }
    if ("occupied_heating_setpoint" in payload) {
        encoded = encoded.concat(setTemperatureSettingUInt16LEValue(payload.occupied_heating_setpoint, [5, 35], "occupied_heating_setpoint", 0x65));
    }
    if ("unoccupied_cooling_setpoint" in payload) {
        encoded = encoded.concat(setTemperatureSettingUInt16LEValue(payload.unoccupied_cooling_setpoint, [5, 35], "unoccupied_cooling_setpoint", 0x66));
    }
    if ("unoccupied_heating_setpoint" in payload) {
        encoded = encoded.concat(setTemperatureSettingUInt16LEValue(payload.unoccupied_heating_setpoint, [5, 35], "unoccupied_heating_setpoint", 0x67));
    }
    if ("cooling_setpoint" in payload) {
        encoded = encoded.concat(setTemperatureSettingUInt16LEValue(payload.cooling_setpoint, [5, 35], "cooling_setpoint", 0x68));
    }
    if ("heating_setpoint" in payload) {
        encoded = encoded.concat(setTemperatureSettingUInt16LEValue(payload.heating_setpoint, [5, 35], "heating_setpoint", 0x69));
    }
    if ("occupied_cooling_setpoint_tolerance" in payload) {
        encoded = encoded.concat(setTemperatureSettingUInt8Value(payload.occupied_cooling_setpoint_tolerance, [0.1, 5], "occupied_cooling_setpoint_tolerance", 0x6a));
    }
    if ("occupied_heating_setpoint_tolerance" in payload) {
        encoded = encoded.concat(setTemperatureSettingUInt8Value(payload.occupied_heating_setpoint_tolerance, [0.1, 5], "occupied_heating_setpoint_tolerance", 0x6b));
    }
    if ("unoccupied_cooling_setpoint_tolerance" in payload) {
        encoded = encoded.concat(setTemperatureSettingUInt8Value(payload.unoccupied_cooling_setpoint_tolerance, [0.1, 5], "unoccupied_cooling_setpoint_tolerance", 0x6c));
    }
    if ("unoccupied_heating_setpoint_tolerance" in payload) {
        encoded = encoded.concat(setTemperatureSettingUInt8Value(payload.unoccupied_heating_setpoint_tolerance, [0.1, 5], "unoccupied_heating_setpoint_tolerance", 0x6d));
    }
    if ("cooling_setpoint_tolerance" in payload) {
        encoded = encoded.concat(setTemperatureSettingUInt8Value(payload.cooling_setpoint_tolerance, [0.1, 5], "cooling_setpoint_tolerance", 0x6e));
    }
    if ("heating_setpoint_tolerance" in payload) {
        encoded = encoded.concat(setTemperatureSettingUInt8Value(payload.heating_setpoint_tolerance, [0.1, 5], "heating_setpoint_tolerance", 0x6f));
    }
    if ("center_cool_temp" in payload) {
        encoded = encoded.concat(setTemperatureSettingUInt16LEValue(payload.center_cool_temp, [5, 35], "center_cool_temp", 0x72));
    }
    if ("center_heat_temp" in payload) {
        encoded = encoded.concat(setTemperatureSettingUInt16LEValue(payload.center_heat_temp, [5, 35], "center_heat_temp", 0x73));
    }
    if ("cooling_adjust_tolerance" in payload) {
        encoded = encoded.concat(setTemperatureSettingUInt16LEValue(payload.cooling_adjust_tolerance, [0.5, 16], "cooling_adjust_tolerance", 0x74));
    }
    if ("heating_adjust_tolerance" in payload) {
        encoded = encoded.concat(setTemperatureSettingUInt16LEValue(payload.heating_adjust_tolerance, [0.5, 16], "heating_adjust_tolerance", 0x75));
    }
    if ("custom_wiring_mode" in payload) {
        encoded = encoded.concat(setEnableStatus(payload.custom_wiring_mode, "custom_wiring_mode", 0x80));
    }
    if ("heating_stage1" in payload) {
        encoded = encoded.concat(setTemperatureControlStage(payload.heating_stage1, "heating_stage1", 0x81));
    }
    if ("heating_stage2" in payload) {
        encoded = encoded.concat(setTemperatureControlStage(payload.heating_stage2, "heating_stage2", 0x82));
    }
    if ("heating_stage3" in payload) {
        encoded = encoded.concat(setTemperatureControlStage(payload.heating_stage3, "heating_stage3", 0x83));
    }
    if ("heating_stage4" in payload) {
        encoded = encoded.concat(setTemperatureControlStage(payload.heating_stage4, "heating_stage4", 0x84));
    }
    if ("heating_stage5" in payload) {
        encoded = encoded.concat(setTemperatureControlStage(payload.heating_stage5, "heating_stage5", 0x85));
    }
    if ("emergency_heating" in payload) {
        encoded = encoded.concat(setTemperatureControlStage(payload.emergency_heating, "emergency_heating", 0x86));
    }
    if ("cooling_stage1" in payload) {
        encoded = encoded.concat(setTemperatureControlStage(payload.cooling_stage1, "cooling_stage1", 0x87));
    }
    if ("cooling_stage2" in payload) {
        encoded = encoded.concat(setTemperatureControlStage(payload.cooling_stage2, "cooling_stage2", 0x88));
    }
    if ("cooling_stage3" in payload) {
        encoded = encoded.concat(setTemperatureControlStage(payload.cooling_stage3, "cooling_stage3", 0x89));
    }
    if ("screen_display_enable" in payload) {
        encoded = encoded.concat(setEnableStatus(payload.screen_display_enable, "screen_display_enable", 0x90));
    }
    if ("screen_time_enable" in payload) {
        encoded = encoded.concat(setEnableStatus(payload.screen_time_enable, "screen_time_enable", 0x91));
    }
    if ("screen_target_enable" in payload) {
        encoded = encoded.concat(setEnableStatus(payload.screen_target_enable, "screen_target_enable", 0x92));
    }
    if ("screen_temp_enable" in payload) {
        encoded = encoded.concat(setEnableStatus(payload.screen_temp_enable, "screen_temp_enable", 0x93));
    }
    if ("screen_humi_enable" in payload) {
        encoded = encoded.concat(setEnableStatus(payload.screen_humi_enable, "screen_humi_enable", 0x94));
    }
    if ("screen_plan_enable" in payload) {
        encoded = encoded.concat(setEnableStatus(payload.screen_plan_enable, "screen_plan_enable", 0x95));
    }
    if ("screen_target_others_enable" in payload) {
        encoded = encoded.concat(setEnableStatus(payload.screen_target_others_enable, "screen_target_others_enable", 0x96));
    }

    return encoded;
}

/**
 * reboot device
 * @param {number} reboot values: (0: no, 1: yes)
 * @example { "reboot": 1 }
 */
function reboot(reboot) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var reboot_values = getValues(yes_no_map);
    if (reboot_values.indexOf(reboot) === -1) {
        throw new Error("reboot must be one of " + reboot_values.join(", "));
    }

    if (getValue(yes_no_map, reboot) === 0) {
        return [];
    }
    return [0xff, 0x10, 0xff];
}

/**
 * report device status
 * @param {number} report_status values: (0: plan, 1: periodic, 2: target_temperature_range)
 * @example { "report_status": 1 }
 */
function reportStatus(report_status) {
    var report_status_map = { 0: "plan", 1: "periodic", 2: "target_temperature_range" };
    var report_status_values = getValues(report_status_map);
    if (report_status_values.indexOf(report_status) === -1) {
        throw new Error("report_status must be one of " + report_status_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x28);
    buffer.writeUInt8(getValue(report_status_map, report_status));
    return buffer.toBytes();
}

/**
 * history enable
 * @param {number} history_enable values: (0: disable, 1: enable)
 * @example { "history_enable": 1 }
 */
function setHistoryEnable(history_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(history_enable) === -1) {
        throw new Error("history_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x68);
    buffer.writeUInt8(getValue(enable_map, history_enable));
    return buffer.toBytes();
}

/**
 * set retransmit enable
 * @param {number} retransmit_enable values: (0: disable, 1: enable)
 * @example { "retransmit_enable": 1 }
 */
function setRetransmitEnable(retransmit_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(retransmit_enable) === -1) {
        throw new Error("retransmit_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x69);
    buffer.writeUInt8(getValue(enable_map, retransmit_enable));
    return buffer.toBytes();
}

/**
 * set retransmit interval
 * @param {number} retransmit_interval unit: second, range: [1, 64800]
 * @example { "retransmit_interval": 600 }
 */
function setRetransmitInterval(retransmit_interval) {
    if (typeof retransmit_interval !== "number") {
        throw new Error("retransmit_interval must be a number");
    }
    if (retransmit_interval < 1 || retransmit_interval > 64800) {
        throw new Error("retransmit_interval must be between 1 and 64800");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x6a);
    buffer.writeUInt8(0x00);
    buffer.writeUInt16LE(retransmit_interval);
    return buffer.toBytes();
}

/**
 * set resend interval
 * @param {number} resend_interval unit: second, range: [1, 64800]
 * @example { "resend_interval": 600 }
 */
function setResendInterval(resend_interval) {
    if (typeof resend_interval !== "number") {
        throw new Error("resend_interval must be a number");
    }
    if (resend_interval < 1 || resend_interval > 64800) {
        throw new Error("resend_interval must be between 1 and 64800");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x6a);
    buffer.writeUInt8(0x01);
    buffer.writeUInt16LE(resend_interval);
    return buffer.toBytes();
}

/**
 * set report interval
 * @param {number} report_interval unit: minute, range: [1, 1440]
 * @example { "report_interval": 20 }
 */
function setReportInterval(report_interval) {
    if (typeof report_interval !== "number") {
        throw new Error("report_interval must be a number");
    }
    if (report_interval < 1 || report_interval > 1440) {
        throw new Error("report_interval must be in range [1, 1440]");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x8e);
    buffer.writeUInt8(0x00);
    buffer.writeUInt16LE(report_interval);
    return buffer.toBytes();
}

/**
 * set collection interval
 * @param {number} collection_interval unit: second, range: [10, 60]
 * @example { "collection_interval": 300 }
 */
function setCollectionInterval(collection_interval) {
    if (typeof collection_interval !== "number") {
        throw new Error("collection_interval must be a number");
    }
    if (collection_interval < 10 || collection_interval > 60) {
        throw new Error("collection_interval must be in range [10, 60]");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x02);
    buffer.writeUInt16LE(collection_interval);
    return buffer.toBytes();
}

/**
 * sync time
 * @param {number} synchronize_time range: [0, 255]
 * @example { "synchronize_time": 1 }
 */
function synchronizeTime(synchronize_time) {
    if (typeof synchronize_time !== "number") {
        throw new Error("synchronize_time must be a number");
    }
    if (synchronize_time < 0 || synchronize_time > 255) {
        throw new Error("synchronize_time must be in range [0, 255]");
    }
    return [0xff, 0x4a, synchronize_time];
}

/**
 * set time zone
 * @param {number} time_zone unit: minute, convert: "hh:mm" -> "hh * 60 + mm", values: ( -720: UTC-12, -660: UTC-11, -600: UTC-10, -570: UTC-9:30, -540: UTC-9, -480: UTC-8, -420: UTC-7, -360: UTC-6, -300: UTC-5, -240: UTC-4, -210: UTC-3:30, -180: UTC-3, -120: UTC-2, -60: UTC-1, 0: UTC, 60: UTC+1, 120: UTC+2, 180: UTC+3, 240: UTC+4, 300: UTC+5, 360: UTC+6, 420: UTC+7, 480: UTC+8, 540: UTC+9, 570: UTC+9:30, 600: UTC+10, 660: UTC+11, 720: UTC+12, 765: UTC+12:45, 780: UTC+13, 840: UTC+14 )
 * @example { "time_zone": 480 }
 * @example { "time_zone": -240 }
 */
function setTimeZone(time_zone) {
    var timezone_map = { "-720": "UTC-12", "-660": "UTC-11", "-600": "UTC-10", "-570": "UTC-9:30", "-540": "UTC-9", "-480": "UTC-8", "-420": "UTC-7", "-360": "UTC-6", "-300": "UTC-5", "-240": "UTC-4", "-210": "UTC-3:30", "-180": "UTC-3", "-120": "UTC-2", "-60": "UTC-1", 0: "UTC", 60: "UTC+1", 120: "UTC+2", 180: "UTC+3", 210: "UTC+3:30", 240: "UTC+4", 270: "UTC+4:30", 300: "UTC+5", 330: "UTC+5:30", 345: "UTC+5:45", 360: "UTC+6", 390: "UTC+6:30", 420: "UTC+7", 480: "UTC+8", 540: "UTC+9", 570: "UTC+9:30", 600: "UTC+10", 630: "UTC+10:30", 660: "UTC+11", 720: "UTC+12", 765: "UTC+12:45", 780: "UTC+13", 840: "UTC+14" };
    var timezone_values = getValues(timezone_map);
    if (timezone_values.indexOf(time_zone) === -1) {
        throw new Error("time_zone must be one of " + timezone_values.join(", "));
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xbd);
    buffer.writeInt16LE(getValue(timezone_map, time_zone));
    return buffer.toBytes();
}

/**
 * set daylight saving time
 * @param {object} dst_config
 * @param {number} dst_config.enable values: (0: disable, 1: enable)
 * @param {number} dst_config.offset, unit: minute
 * @param {number} dst_config.start_month, values: (1: January, 2: February, 3: March, 4: April, 5: May, 6: June, 7: July, 8: August, 9: September, 10: October, 11: November, 12: December)
 * @param {number} dst_config.start_week_num, range: [1, 5]
 * @param {number} dst_config.start_week_day, range: [1, 7]
 * @param {number} dst_config.start_time, unit: minute, convert: "hh:mm" -> "hh * 60 + mm"
 * @param {number} dst_config.end_month, values: (1: January, 2: February, 3: March, 4: April, 5: May, 6: June, 7: July, 8: August, 9: September, 10: October, 11: November, 12: December)
 * @param {number} dst_config.end_week_num, range: [1, 5]
 * @param {number} dst_config.end_week_day, range: [1, 7]
 * @param {number} dst_config.end_time, unit: minute, convert: "hh:mm" -> "hh * 60 + mm"
 * @example { "dst_config": { "enable": 1, "offset": 60, "start_month": 3, "start_week_num": 2, "start_week_day": 7, "start_time": 120, "end_month": 1, "end_week_num": 4, "end_week_day": 1, "end_time": 180 } } output: FFBA013C032778000141B400
 */
function setDaylightSavingTime(dst_config) {
    var enable = dst_config.enable;
    var offset = dst_config.offset;
    var start_month = dst_config.start_month;
    var start_week_num = dst_config.start_week_num;
    var start_week_day = dst_config.start_week_day;
    var start_time = dst_config.start_time;
    var end_month = dst_config.end_month;
    var end_week_num = dst_config.end_week_num;
    var end_week_day = dst_config.end_week_day;
    var end_time = dst_config.end_time;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("dst_config.enable must be one of " + enable_values.join(", "));
    }

    var month_values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    var enable_value = getValue(enable_map, enable);
    if (enable_value && month_values.indexOf(start_month) === -1) {
        throw new Error("dst_config.start_month must be one of " + month_values.join(", "));
    }
    if (enable_value && month_values.indexOf(end_month) === -1) {
        throw new Error("dst_config.end_month must be one of " + month_values.join(", "));
    }
    var week_values = [1, 2, 3, 4, 5, 6, 7];
    if (enable_value && week_values.indexOf(start_week_day) === -1) {
        throw new Error("dst_config.start_week_day must be one of " + week_values.join(", "));
    }

    var buffer = new Buffer(12);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xba);
    buffer.writeUInt8(enable_value);
    buffer.writeInt8(offset);
    buffer.writeUInt8(enable_value && start_month);
    buffer.writeUInt8(enable_value && (start_week_num << 4) | start_week_day);
    buffer.writeUInt16LE(enable_value && start_time);
    buffer.writeUInt8(enable_value && end_month);
    buffer.writeUInt8(enable_value && (end_week_num << 4) | end_week_day);
    buffer.writeUInt16LE(enable_value && end_time);
    return buffer.toBytes();
}

/**
 * set temperature unit display
 * @param {object} temperature_unit
 * @param {number} temperature_unit.value values: [0, 1]
 * @param {string} temperature_unit.unit values: (celsius, fahrenheit)
 * @example { "temperature_unit": { "value": 0, "unit": "celsius" } }
 */
function setTemperatureUnitDisplay(temperature_unit) {
    var value = temperature_unit.value;

    var temperature_unit_map = { 1: "celsius", 2: "fahrenheit" };
    var temperature_unit_values = getValues(temperature_unit_map);

    if (RAW_VALUE) {
        if (temperature_unit_values.indexOf(value) === -1) {
            throw new Error("temperature_unit.value must be one of " + temperature_unit_values.join(", "));
        }

        return [0xff, 0xeb, value - 1];
    } else {
        var unit = temperature_unit.unit;
        if (temperature_unit_values.indexOf(unit) === -1) {
            throw new Error("temperature_unit.unit must be one of " + temperature_unit_values.join(", "));
        }

        return [0xff, 0xeb, getValue(temperature_unit_map, unit) - 1];
    }
}

/**
 * set device status
 * @param {number} device_status values: (0: on, 1: off)
 * @example { "device_status": 1 }
 */
function setDeviceStatus(device_status) {
    var on_off_map = { 0: "off", 1: "on" };
    var on_off_values = getValues(on_off_map);
    if (on_off_values.indexOf(device_status) === -1) {
        throw new Error("device_status must be one of " + on_off_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x0b);
    buffer.writeUInt8(getValue(on_off_map, device_status));
    return buffer.toBytes();
}

/**
 * set system status and temperature control
 * @since v2.0
 * @param {number} system_status values: (0: off, 1: on)
 * @param {number} temperature_control_mode values: (0: heat, 1: em heat, 2: cool, 3: auto)
 * @param {number} target_temperature range: [5, 35]
 * @example { "system_status": 1, "temperature_control_mode": 2, "target_temperature": 25 }
 */
function setSystemStatusAndTemperatureControl(system_status, temperature_control_mode, target_temperature) {
    var on_off_map = { 0: "off", 1: "on" };
    var on_off_values = getValues(on_off_map);
    if (on_off_values.indexOf(system_status) === -1) {
        throw new Error("system_status must be one of " + on_off_values.join(", "));
    }
    var temperature_control_mode_map = { 0: "heat", 1: "em heat", 2: "cool", 3: "auto" };
    var temperature_control_mode_values = getValues(temperature_control_mode_map);
    if (temperature_control_mode_values.indexOf(temperature_control_mode) === -1) {
        throw new Error("temperature_control_mode must be one of " + temperature_control_mode_values.join(", "));
    }
    if (typeof target_temperature !== "number") {
        throw new Error("target_temperature must be a number");
    }
    if (target_temperature < 5 || target_temperature > 35) {
        throw new Error("target_temperature must be in range [5, 35]");
    }

    var buffer = new Buffer(6);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x45);
    buffer.writeUInt8(getValue(on_off_map, system_status));
    buffer.writeUInt8(getValue(temperature_control_mode_map, temperature_control_mode));
    buffer.writeInt16LE(target_temperature * 10);
    return buffer.toBytes();
}

/**
 * set temperature control
 * @since v2.0
 * @param {number} mode values: (0: heat, 1: em heat, 2: cool, 3: auto)
 * @param {number} target range: [5, 95]
 * @param {number} unit values: (0: celsius, 1: fahrenheit)
 * @example { "temperature_control": { "mode": 2, "target": 25, "unit": 0 } }
 */
function setTemperatureControl(mode, target, unit) {
    var mode_map = { 0: "heat", 1: "em heat", 2: "cool", 3: "auto" };
    var unit_map = { 0: "celsius", 1: "fahrenheit" };
    var mode_values = getValues(mode_map);
    var unit_values = getValues(unit_map);
    if (mode_values.indexOf(mode) === -1) {
        throw new Error("temperature_control_mode must be one of " + mode_values.join(", "));
    }
    if (unit_values.indexOf(unit) === -1) {
        throw new Error("temperature_unit must be one of " + unit_values.join(", "));
    }
    if (target < 5 || target > 95) {
        throw new Error("target_temperature must be in range [5, 95]");
    }

    var data = 0x00;
    data |= getValue(unit_map, unit) << 7;
    data |= target;

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xb7);
    buffer.writeUInt8(getValue(mode_map, mode));
    buffer.writeUInt8(data);
    return buffer.toBytes();
}

/**
 * set temperature calibration
 * @param {object} temperature_calibration_settings
 * @param {number} temperature_calibration_settings.enable values: (0: disable, 1: enable)
 * @param {number} temperature_calibration_settings.calibration_value, unit: celsius
 * @example { "temperature_calibration_settings": { "enable": 1, "calibration_value": 25 } }
 */
function setTemperatureCalibration(temperature_calibration_settings) {
    var enable = temperature_calibration_settings.enable;
    var calibration_value = temperature_calibration_settings.calibration_value;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("temperature_calibration_settings.enable must be one of " + enable_values.join(", "));
    }
    if (enable && typeof calibration_value !== "number") {
        throw new Error("temperature_calibration_settings.calibration_value must be a number");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xab);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeInt16LE(calibration_value * 10);
    return buffer.toBytes();
}

/**
 * set humidity calibration
 * @since v1.3
 * @param {object} humidity_calibration_settings
 * @param {number} humidity_calibration_settings.enable values: (0: disable, 1: enable)
 * @param {number} humidity_calibration_settings.calibration_value, unit: %
 * @example { "humidity_calibration_settings": { "enable": 1, "calibration_value": 50 } }
 */
function setHumidityCalibration(humidity_calibration_settings) {
    var enable = humidity_calibration_settings.enable;
    var calibration_value = humidity_calibration_settings.calibration_value;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("humidity_calibration_settings.enable must be one of " + enable_values.join(", "));
    }
    if (enable && typeof calibration_value !== "number") {
        throw new Error("humidity_calibration_settings.calibration_value must be a number");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeInt16LE(calibration_value * 10);
    return buffer.toBytes();
}

/**
 * set temperature tolerance
 * @param {object} temperature_tolerance
 * @param {number} temperature_tolerance.target_temperature_tolerance unit: celsius
 * @param {number} temperature_tolerance.auto_temperature_tolerance unit: celsius
 * @example { "temperature_tolerance": {"target_temperature_tolerance": 1, "auto_temperature_tolerance": 1 }}
 */
function setTemperatureTolerance(temperature_tolerance) {
    var target_temperature_tolerance = temperature_tolerance.target_temperature_tolerance;
    var auto_temperature_tolerance = temperature_tolerance.auto_temperature_tolerance;

    if (typeof target_temperature_tolerance !== "number") {
        throw new Error("temperature_tolerance.target_temperature_tolerance must be a number");
    }
    if (typeof auto_temperature_tolerance !== "number") {
        throw new Error("temperature_tolerance.auto_temperature_tolerance must be a number");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xb8);
    buffer.writeUInt8(target_temperature_tolerance * 10);
    buffer.writeUInt8(auto_temperature_tolerance * 10);
    return buffer.toBytes();
}

/**
 * set target temperature resolution
 * @since v2.0
 * @param {number} target_temperature_resolution values: (0: 0.5, 1: 1)
 * @example { "target_temperature_resolution": 0.5 }
 */
function setTargetTemperatureResolution(target_temperature_resolution) {
    var resolution_map = { 0: 0.5, 1: 1 };
    var resolution_values = getValues(resolution_map);
    if (resolution_values.indexOf(target_temperature_resolution) === -1) {
        throw new Error("target_temperature_resolution must be one of " + resolution_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x41);
    buffer.writeUInt8(getValue(resolution_map, target_temperature_resolution));
    return buffer.toBytes();
}

/**
 * set temperature target range
 * @since v2.0
 * @param {object} target_temperature_range_config
 * @param {number} target_temperature_range_config.temperature_control_mode values: (0: heat, 1: em heat, 2: cool, 3: auto)
 * @param {number} target_temperature_range_config.min unit: celsius
 * @param {number} target_temperature_range_config.max unit: celsius
 * @example { "target_temperature_range_config": { "temperature_control_mode": 2, "min": 15, "max": 30 } }
 */
function setTargetTemperatureRangeConfig(target_temperature_range_config) {
    var temperature_control_mode = target_temperature_range_config.temperature_control_mode;
    var min = target_temperature_range_config.min;
    var max = target_temperature_range_config.max;

    var temperature_mode_map = { 0: "heat", 1: "em heat", 2: "cool", 3: "auto" };
    var temperature_mode_values = getValues(temperature_mode_map);
    if (temperature_mode_values.indexOf(temperature_control_mode) === -1) {
        throw new Error("temperature_control_mode must be one of " + temperature_mode_values.join(", "));
    }

    var buffer = new Buffer(7);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x42);
    buffer.writeUInt8(getValue(temperature_mode_map, temperature_control_mode));
    buffer.writeInt16LE(min * 10);
    buffer.writeInt16LE(max * 10);
    return buffer.toBytes();
}
/**
 * set level switch settings
 * @param {object} level_switch_settings
 * @param {number} level_switch_settings.type values: (0: heat, 1: cool)
 * @param {number} level_switch_settings.time unit: minute range: [1, 30]
 * @param {number} level_switch_settings.change_value unit: celsius range: [0.5, 5]
 * @example { "level_switch_settings": { "type": 0, "time": 10, "change_value": 1 } }
 */
function setLevelSwitchSettings(level_switch_settings) {
    var type = level_switch_settings.type;
    var time = level_switch_settings.time;
    var change_value = level_switch_settings.change_value;

    var temperature_control_type_map = { 0: "heat", 1: "cool" };
    var temperature_control_type_values = getValues(temperature_control_type_map);
    if (temperature_control_type_values.indexOf(type) === -1) {
        throw new Error("level_switch_settings._item.type must be one of " + temperature_control_type_values.join(", "));
    }
    if (typeof time !== "number") {
        throw new Error("level_switch_settings._item.time must be a number");
    }
    if (time < 1 || time > 30) {
        throw new Error("level_switch_settings._item.time must be a number, range: [1, 30]");
    }
    if (typeof change_value !== "number") {
        throw new Error("level_switch_settings._item.change_value must be a number");
    }
    if (change_value < 0.5 || change_value > 5) {
        throw new Error("level_switch_settings._item.change_value must be a number, range: [0.5, 5]");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xb9);
    buffer.writeUInt8(getValue(temperature_control_type_map, type));
    buffer.writeUInt8(time);
    buffer.writeUInt8(change_value * 10);
    return buffer.toBytes();
}

/**
 * set temperature level up delta
 * @since v2.0
 * @param {object} temperature_level_up_down_delta
 * @param {number} temperature_level_up_down_delta.delta_1 unit: celsius
 * @param {number} temperature_level_up_down_delta.delta_2 unit: celsius
 * @example { "temperature_level_up_down_delta": { "delta_1": 1, "delta_2": 2 } }
 */
function setTemperatureLevelUpDownDelta(temperature_level_up_down_delta) {
    var delta_1 = temperature_level_up_down_delta.delta_1;
    var delta_2 = temperature_level_up_down_delta.delta_2;

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x43);
    buffer.writeUInt8(0x00);
    buffer.writeUInt8(delta_1 * 10);
    buffer.writeUInt8(delta_2 * 10);
    return buffer.toBytes();
}

/**
 * set temperature up down enable
 * @since v2.0
 * @param {object} temperature_up_down_enable
 * @param {number} temperature_up_down_enable.forward_enable values: (0: disable, 1: enable)
 * @param {number} temperature_up_down_enable.backward_enable values: (0: disable, 1: enable)
 * @example { "temperature_up_down_enable": { "forward_enable": 1, "backward_enable": 1 } }
 */
function setTemperatureUpDownEnable(temperature_up_down_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);

    var masked = 0x00;
    var enabled = 0x00;
    var bit_offset = { forward_enable: 0, backward_enable: 1 };
    for (var key in bit_offset) {
        if (key in temperature_up_down_enable) {
            if (enable_values.indexOf(temperature_up_down_enable[key]) === -1) {
                throw new Error("temperature_up_down_enable." + key + " must be one of " + enable_values.join(", "));
            }
            masked |= 1 << bit_offset[key];
            enabled |= getValue(enable_map, temperature_up_down_enable[key]) << bit_offset[key];
        }
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x1b);
    buffer.writeUInt8(masked);
    buffer.writeUInt8(enabled);
    return buffer.toBytes();
}

/**
 * set temperature control enable
 * @since v1.3
 * @param {number} temperature_control_mode values: (0: heat, 1: em heat, 2: cool, 3: auto, 4: auto heat, 5: auto cool)
 * @param {number} target_temperature unit: celsius
 * @example { "temperature_control_mode": 2, "target_temperature": 25 }
 */
function setTemperatureTarget(temperature_control_mode, target_temperature) {
    var temperature_mode_map = { 0: "heat", 1: "em heat", 2: "cool", 3: "auto", 4: "auto heat", 5: "auto cool" };
    var temperature_mode_values = getValues(temperature_mode_map);
    if (temperature_mode_values.indexOf(temperature_control_mode) === -1) {
        throw new Error("temperature_control_mode must be one of " + temperature_mode_values.join(", "));
    }
    if (typeof target_temperature !== "number") {
        throw new Error("target_temperature must be a number");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xfa);
    buffer.writeUInt8(getValue(temperature_mode_map, temperature_control_mode));
    buffer.writeInt16LE(target_temperature * 10);
    return buffer.toBytes();
}

/**
 * set current temperature control mode
 * @since v2.0
 * @param {object} current_temperature_control_mode
 * @param {number} current_temperature_control_mode.mode_value values: (1: heat, 2: em heat, 3: cool, 4: auto)
 * @param {string} current_temperature_control_mode.mode values: (heat, em heat, cool, auto)
 * @example { "current_temperature_control_mode": { "mode_value": 1, "mode": "heat" } }
 */
function setCurrentTemperatureControlMode(current_temperature_control_mode) {
    var value = current_temperature_control_mode.mode_value;

    var temperature_mode_map = { 1: "heat", 2: "em heat", 3: "cool", 4: "auto" };
    var temperature_mode_values = getValues(temperature_mode_map);

    if (RAW_VALUE) {
        if (temperature_mode_values.indexOf(value) === -1) {
            throw new Error("current_temperature_control_mode.mode_value must be one of " + temperature_mode_values.join(", "));
        }

        return [0xff, 0xfb, value - 1];
    } else {
        var mode = current_temperature_control_mode.mode;
        if (temperature_mode_values.indexOf(mode) === -1) {
            throw new Error("current_temperature_control_mode.mode must be one of " + temperature_mode_values.join(", "));
        }

        return [0xff, 0xfb, getValue(temperature_mode_map, mode) - 1];
    }
}

/**
 * set enable status
 * @since v1.5
 * @param {number} enable_status values: (0: disable, 1: enable)
 * @example { "enable_status": 1 }
 */
function setEnableStatus(enable_status, key, channel_type) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable_status) === -1) {
        throw new Error(key + " must be one of " + enable_values.join(", "));
    }

    return [0xf9, channel_type, getValue(enable_map, enable_status)];
}

/**
 * set fan delay config delay time
 * @since v1.5
 * @param {number} fan_delay_config_delay_time range: [1, 3600]
 * @example { "fan_delay_config_delay_time": 10 }
 */
function setFanDelayConfigDelayTime(fan_delay_config_delay_time) {
    if (typeof fan_delay_config_delay_time !== "number") {
        throw new Error("fan_delay_config_delay_time must be a number");
    }
    if (fan_delay_config_delay_time < 1 || fan_delay_config_delay_time > 3600) {
        throw new Error("fan_delay_config_delay_time must be in range [1, 3600]");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x21);
    buffer.writeUInt16LE(fan_delay_config_delay_time);
    return buffer.toBytes();
}

/**
 * set temporary unlock settings
 * @since v2.0
 * @param {object} temporary_unlock_settings
 * @param {number} temporary_unlock_settings.value
 * @param {string} temporary_unlock_settings.settings
 * @example { "temporary_unlock_settings": { "value": 3, "settings": "System On/Off&Temperature +" } }
 */
function setTemporaryUnlockSettings(temporary_unlock_settings) {
    var value = temporary_unlock_settings.value;

    var temporary_unlock_settings_map = { 
        1: "disable",
        2: "System On/Off&Temperature +",
        3: "System On/Off&Temperature -",
        4: "System On/Off&Fan Mode",
        5: "System On/Off&Temperature Control Mode",
        6: "Temperature +&Temperature -",
        7: "Temperature +&Fan Mode",
        8: "Temperature +&Temperature Control Mode",
        9: "Temperature -&Fan Mode",
        10: "Temperature -&Temperature Control Mode",
        11: "Fan Mode&Temperature Control Mode",
        12: "System On/Off&Temperature +&Temperature -",
        13: "System On/Off&Temperature +&Fan Mode",
        14: "System On/Off&Temperature +&Temperature Control Mode",
        15: "System On/Off&Temperature -&Fan Mode",
        16: "System On/Off&Temperature -&Temperature Control Mode",
        17: "System On/Off&Fan Mode&Temperature Control Mode",
        18: "Temperature +&Temperature -&Fan Mode",
        19: "Temperature +&Temperature -&Temperature Control Mode",
        20: "Temperature +&Fan Mode&Temperature Control Mode",
        21: "Temperature -&Fan Mode&Temperature Control Mode",
        22: "System On/Off&Temperature +&Temperature -&Fan Mode",
        23: "System On/Off&Temperature +&Temperature -&Temperature Control Mode",
        24: "System On/Off&Temperature +&Fan Mode&Temperature Control Mode",
        25: "System On/Off&Temperature -&Fan Mode&Temperature Control Mode",
        26: "Temperature +&Temperature -&Fan Mode&Temperature Control Mode",
        27: "System On/Off&Temperature +&Temperature -&Fan Mode&Temperature Control Mode"
    };

    function getDataValue(setting) {
        var buttons_array = [ "System On/Off", "Temperature +", "Temperature -", "Fan Mode", "Temperature Control Mode" ];
        var buttons = setting.split("&");
        var values = 0x00;
        for (var i = 0; i < buttons.length; i++) {
            if (buttons_array.indexOf(buttons[i]) === -1) {
                throw new Error("temporary_unlock_settings.settings must be one of " + buttons_array.join(", "));
            }
            values |= 1 << buttons_array.indexOf(buttons[i]);
        }

        return values;
    }
    
    if(RAW_VALUE) {
        var rawValue_temporary_unlock_settings_values = getValues(temporary_unlock_settings_map);
        if (rawValue_temporary_unlock_settings_values.indexOf(value) === -1) {
            throw new Error("temporary_unlock_settings.value must be one of " + rawValue_temporary_unlock_settings_values.join(", "));
        }

        if(temporary_unlock_settings_map[value] === 'disable') {
            return [0xf9, 0x22, 0x00];
        }

        return [0xf9, 0x22, getDataValue(temporary_unlock_settings_map[value])];
    }

    var settings = temporary_unlock_settings.settings;
    if (settings === 'disable') {
        return [0xf9, 0x22, 0x00];
    }

    return [0xf9, 0x22, getDataValue(settings)];
}

/**
 * set occupancy mode
 * @since v2.0
 * @param {number} occupancy_mode values: (1: off, 2: occupied, 3: unoccupied)
 * @example { "occupancy_mode": 1 }
 */
function setOccupancyMode(occupancy_mode) {
    var value = occupancy_mode.value;
    var mode = occupancy_mode.mode;
    var occupancy_mode_map = { 1: "off", 2: "occupied", 3: "unoccupied" };
    var occupancy_mode_values = getValues(occupancy_mode_map);

    if (RAW_VALUE) {
        if (occupancy_mode_values.indexOf(value) === -1) {
            throw new Error("occupancy_mode.value must be one of " + occupancy_mode_values.join(", "));
        }

        return [0xf9, 0x27, value];
    } else {
        if (occupancy_mode_values.indexOf(mode) === -1) {
            throw new Error("occupancy_mode.mode must be one of " + occupancy_mode_values.join(", "));
        }

        return [0xf9, 0x27, getValue(occupancy_mode_map, mode)];
    }
}

/**
 * set occupied delay
 * @since v1.5
 * @param {number} occupied_delay range: [1, 60]
 * @example { "occupied_delay": 10 }
 */
function setOccupiedDelay(occupied_delay) {
    if (typeof occupied_delay !== "number") {
        throw new Error("occupied_delay must be a number");
    }
    if (occupied_delay < 1 || occupied_delay > 60) {
        throw new Error("occupied_delay must be in range [1, 60]");
    }
    return [0xf9, 0x28, occupied_delay];
}

/**
 * set time format
 * @since v1.5
 * @param {number} time_format values: (1: 12-hour, 2: 24-hour)
 * @example { "time_format": 1 }
 */
function setTimeFormat(time_format) {
    var value = time_format.value;
    var mode = time_format.mode;
    var time_format_map = { 1: "12 Hour (AM-PM)", 2: "24 Hour" };
    var time_format_values = getValues(time_format_map);

    if (RAW_VALUE) {
        if (time_format_values.indexOf(value) === -1) {
            throw new Error("time_format.value must be one of " + time_format_values.join(", "));
        }

        return [0xf9, 0x2c, value];
    } else {
        if (time_format_values.indexOf(mode) === -1) {
            throw new Error("time_format.mode must be one of " + time_format_values.join(", "));
        }

        return [0xf9, 0x2c, getValue(time_format_map, mode)];
    }
}

/**
 * set wire mode
 * @since firmware v1.5
 * @param {number} wire_mode values: (1: standard, 2: custom)
 * @example { "wire_mode": 1 }
 */
function setWireMode(wire_mode) {
    var value = wire_mode.value;
    var mode = wire_mode.mode;
    var wire_mode_map = { 1: "standard", 2: "custom" };
    var wire_mode_values = getValues(wire_mode_map);

    if (RAW_VALUE) {
        if (wire_mode_values.indexOf(value) === -1) {
            throw new Error("wire_mode.value must be one of " + wire_mode_values.join(", "));
        }

        return [0xf9, 0x2d, value];
    } else {
        if (wire_mode_values.indexOf(mode) === -1) {
            throw new Error("wire_mode.mode must be one of " + wire_mode_values.join(", "));
        }

        return [0xf9, 0x2d, getValue(wire_mode_map, mode)];
    }
}

/**
 * set temperature humidity source
 * @since firmware v1.5
 * @param {number} temperature_humidity_source values: (1: embedded, 3: lora, 4: d2d)
 * @example { "temperature_humidity_source": 1 }
 */
function setTemperatureHumiditySource(temperature_humidity_source) {
    var value = temperature_humidity_source.value;
    var mode = temperature_humidity_source.mode;
    var temperature_humidity_source_map = [
        { value: 1, name: "embedded" },
        { value: 3, name: "lora" },
        { value: 4, name: "d2d" },
    ];

    if (RAW_VALUE) {
        var values = temperature_humidity_source_map.map(function(item) { return item.value; });
        if (values.indexOf(value) === -1) {
            throw new Error("temperature_humidity_source.value must be one of " + values.join(", "));
        }

        return [0xf9, 0x2e, arrayFindIndex(temperature_humidity_source_map, function(item) { return item.value === value; }) + 1];
    } else {
        var modes = temperature_humidity_source_map.map(function(item) { return item.name; });
        if (modes.indexOf(mode) === -1) {
            throw new Error("temperature_humidity_source.mode must be one of " + modes.join(", "));
        }

        return [0xf9, 0x2e, arrayFindIndex(temperature_humidity_source_map, function(item) { return item.name === mode; }) + 1];
    }
}

/**
 * set time zone index
 * @since firmware v1.5
 * @param {number} timezone_index values: (1: UTC-12, 2: UTC-11, 3: UTC-10, 4: UTC-9:30, 5: UTC-9, 6: UTC-8, 7: UTC-7, 8: UTC-6, 9: UTC-5, 10: UTC-4, 11: UTC-3:30, 12: UTC-3, 13: UTC-2, 14: UTC-1, 15: UTC, 16: UTC+1, 17: UTC+2, 18: UTC+3, 19: UTC+3:30, 20: UTC+4, 21: UTC+4:30, 22: UTC+5, 23: UTC+5:30, 24: UTC+5:45, 25: UTC+6, 26: UTC+6:30, 27: UTC+7, 28: UTC+8, 29: UTC+9, 30: UTC+9:30, 31: UTC+10, 32: UTC+10:30, 33: UTC+11, 34: UTC+12, 35: UTC+12:45, 36: UTC+13, 37: UTC+14)
 * @example { "timezone_index": { "value": 1, "timezone": "UTC-12" } }
 */
function setTimeZoneIndex(timezone_index) {
    var value = timezone_index.value;
    var timezone = timezone_index.timezone;
    var timezone_index_map = { 1: "UTC-12", 2: "UTC-11", 3: "UTC-10", 4: "UTC-9:30", 5: "UTC-9", 6: "UTC-8", 7: "UTC-7", 8: "UTC-6", 9: "UTC-5", 10: "UTC-4", 11: "UTC-3:30", 12: "UTC-3", 13: "UTC-2", 14: "UTC-1", 15: "UTC", 16: "UTC+1", 17: "UTC+2", 18: "UTC+3", 19: "UTC+3:30", 20: "UTC+4", 21: "UTC+4:30", 22: "UTC+5", 23: "UTC+5:30", 24: "UTC+5:45", 25: "UTC+6", 26: "UTC+6:30", 27: "UTC+7", 28: "UTC+8", 29: "UTC+9", 30: "UTC+9:30", 31: "UTC+10", 32: "UTC+10:30", 33: "UTC+11", 34: "UTC+12", 35: "UTC+12:45", 36: "UTC+13", 37: "UTC+14" };
    var timezone_index_values = getValues(timezone_index_map);

    if (RAW_VALUE) {
        if (timezone_index_values.indexOf(value) === -1) {
            throw new Error("timezone_index.value must be one of " + timezone_index_values.join(", "));
        }

        return [0xf9, 0x2f, value];
    } else {
        if (timezone_index_values.indexOf(timezone) === -1) {
            throw new Error("timezone_index.timezone must be one of " + timezone_index_values.join(", "));
        }

        return [0xf9, 0x2f, getValue(timezone_index_map, timezone)];
    }
}

/**
 * set time zone offset
 * @since firmware v1.5
 * @param {number} timezone_offset unit: minute, range: [-1440, 1440]
 * @example { "timezone_offset": 480 }
 */
function setTimeZoneOffset(timezone_offset) {
    if (typeof timezone_offset !== "number") {
        throw new Error("timezone_offset must be a number");
    }
    if (timezone_offset < -1440 || timezone_offset > 1440) {
        throw new Error("timezone_offset must be in range [-1440, 1440]");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x30);
    buffer.writeInt16LE(timezone_offset);
    return buffer.toBytes();
}

function setTemperatureSettingUInt16LEValue(value, range, key, channel_type) {
    if (typeof value !== "number") {
        throw new Error(key + " must be a number");
    }
    if (value < range[0] || value > range[1]) {
        throw new Error(key + " must be in range " + range.join(", "));
    }
    var buffer = new Buffer(4);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(channel_type);
    buffer.writeUInt16LE(value * 10);
    return buffer.toBytes();
}

function setTemperatureSettingUInt8Value(value, range, key, channel_type) {
    if (typeof value !== "number") {
        throw new Error(key + " must be a number");
    }
    if (value < range[0] || value > range[1]) {
        throw new Error(key + " must be in range " + range.join(", "));
    }
    return [0xf9, channel_type, value * 10];
}

function setTemperatureControlStage(stage, key, channel_type) {
    var value = stage.value;
    var wire = stage.wire;
    var wires_map = { 
        1: "disable",
        2: "Y1",
        3: "Y2",
        4: "W1",
        5: "W2(AUX)",
        6: "Y1+Y2",
        7: "Y1+Y2+W1",
        8: "Y1+Y2+W1+W2(AUX)",
        9: "Y1+W1",
        10: "Y1+W1+W2(AUX)",
        11: "W1+W2(AUX)",
        12: "E"
     };
    var wires_values = getValues(wires_map);

    function getDataValue(wire_setting) {
        var values = 0x00;
        if (wire_setting === "disable") return values;
        var wires = [ "Y1", "Y2", "W1", "W2(AUX)", "E" ];
        var wires_array = wire_setting.split("+");
        for (var i = 0; i < wires_array.length; i++) {
            if (wires.indexOf(wires_array[i]) === -1) {
                throw new Error(key + ".wire must be one of " + wires.join(", "));
            }
            values |= 1 << wires.indexOf(wires_array[i]);
        }

        return values;
    }

    if (RAW_VALUE) {
        if (wires_values.indexOf(value) === -1) {
            throw new Error(key + ".value must be one of " + wires_values.join(", "));
        }

        return [0xf9, channel_type, getDataValue(wires_map[value])];
    } else {

        return [0xf9, channel_type, getDataValue(wire)];
    }
}

/**
 * set temperature control enable status
 * @since v2.0
 * @param {number} temperature_control_enable values: (0: disable, 1: enable)
 * @example { "temperature_control_enable": 1 }
 */
function setTemperatureControlEnableStatus(temperature_control_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(temperature_control_enable) === -1) {
        throw new Error("temperature_control_enable must be one of " + enable_values.join(", "));
    }
    return [0xff, 0xc5, getValue(enable_map, temperature_control_enable)];
}

/**
 * set temperature source config
 * @param {object} temperature_source_config
 * @param {number} temperature_source_config.source values: (0: disable, 1: lora, 2: d2d)
 * @param {number} temperature_source_config.timeout, unit: minute, range: [5, 60]
 * @example { "temperature_source_config": { "source": 1, "timeout": 10 } }
 */
function setTemperatureSourceConfig(temperature_source_config) {
    var source = temperature_source_config.source;
    var timeout = temperature_source_config.timeout;

    var source_map = { 0: "disable", 1: "lora", 2: "d2d" };
    var source_values = getValues(source_map);
    if (source_values.indexOf(source) === -1) {
        throw new Error("temperature_source_config.source must be one of " + source_values.join(", "));
    }
    if (getValue(source_map, source) != 0) {
        if (typeof timeout !== "number") {
            throw new Error("temperature_source_config.timeout must be a number");
        }
        if (timeout < 3 || timeout > 60) {
            throw new Error("temperature_source_config.timeout must be in range [5, 60]");
        }
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xc4);
    buffer.writeUInt8(getValue(source_map, source));
    buffer.writeUInt8(timeout);
    return buffer.toBytes();
}

/**
 * set temperature (source: outside)
 * @param {number} temperature, unit: celsius
 * @example { "temperature": 25 }
 */
function setOutsideTemperature(temperature) {
    if (typeof temperature !== "number") {
        throw new Error("temperature must be a number");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0x03);
    buffer.writeInt16LE(temperature * 10);
    buffer.writeUInt8(0xff);
    return buffer.toBytes();
}

/**
 * set humidity
 * @param {number} humidity, unit: %, range: [0, 100]
 * @example { "humidity": 50 }
 */
function setHumidity(humidity) {
    if (typeof humidity !== "number") {
        throw new Error("humidity must be a number");
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0x09);
    buffer.writeUInt8(humidity * 2);
    buffer.writeUInt8(0xff);
    return buffer.toBytes();
}

/**
 * set humidity range
 * @since v1.3
 * @param {object} humidity_range
 * @param {number} humidity_range.min range: [0, 100]
 * @param {number} humidity_range.max range: [0, 100]
 * @example { "humidity_range": { "min": 20, "max": 80 } }
 */
function setHumidityRange(humidity_range) {
    var min = humidity_range.min;
    var max = humidity_range.max;

    if (typeof min !== "number") {
        throw new Error("humidity_range.min must be a number");
    }
    if (typeof max !== "number") {
        throw new Error("humidity_range.max must be a number");
    }
    if (min < 0 || min > 100) {
        throw new Error("humidity_range.min must be in range [0, 100]");
    }
    if (max < 0 || max > 100) {
        throw new Error("humidity_range.max must be in range [0, 100]");
    }
    if (min > max) {
        throw new Error("humidity_range.min must be less than humidity_range.max");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x09);
    buffer.writeUInt8(min);
    buffer.writeUInt8(max);
    return buffer.toBytes();
}

/**
 * set temperature dehumidify
 * @since v1.3
 * @param {object} temperature_dehumidify
 * @param {number} temperature_dehumidify.enable values: (0: disable, 1: enable)
 * @param {number} temperature_dehumidify.temperature_tolerance unit: celsius, range: [0.1, 5]
 * @example { "temperature_dehumidify": { "enable": 1, "temperature_tolerance": 1 } }
 */
function setTemperatureDehumidify(temperature_dehumidify) {
    var enable = temperature_dehumidify.enable;
    var temperature_control_tolerance = temperature_dehumidify.temperature_tolerance;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("temperature_dehumidify.enable must be one of " + enable_values.join(", "));
    }
    if (enable) {
        // default value
        if (temperature_control_tolerance === undefined) {
            temperature_control_tolerance = 0xff;
        }
        if (typeof temperature_control_tolerance !== "number") {
            throw new Error("temperature_dehumidify.temperature_control_tolerance must be a number");
        }
        if (temperature_control_tolerance !== 0xff && (temperature_control_tolerance < 0.1 || temperature_control_tolerance > 5)) {
            throw new Error("temperature_dehumidify.temperature_tolerance must be in range [0.1, 5]");
        }
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x0a);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt8(getValue(enable_map, enable) && (temperature_control_tolerance === 0xff ? temperature_control_tolerance : temperature_control_tolerance * 10));
    return buffer.toBytes();
}

/**
 * set fan dehumidify
 * @since v1.3
 * @param {object} fan_dehumidify
 * @param {number} fan_dehumidify.enable values: (0: disable, 1: enable)
 * @param {number} fan_dehumidify.execute_time range: [5, 55], unit: minute
 * @example { "fan_dehumidify": { "enable": 1, "execute_time": 10 } }
 */
function setFanDehumidify(fan_dehumidify) {
    var enable = fan_dehumidify.enable;
    var execute_time = fan_dehumidify.execute_time;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("fan_dehumidify.enable must be one of " + enable_values.join(", "));
    }
    if (getValue(enable_map, enable) && typeof execute_time !== "number") {
        throw new Error("fan_dehumidify.execute_time must be a number");
    }
    if (getValue(enable_map, enable) && (execute_time < 5 || execute_time > 55)) {
        throw new Error("fan_dehumidify.execute_time must be in range [5, 55]");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x07);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt8(getValue(enable_map, enable) && execute_time);
    return buffer.toBytes();
}

/**
 * freeze protection configuration
 * @param {object} freeze_protection_config
 * @param {number} freeze_protection_config.enable values: (0: disable, 1: enable)
 * @param {number} freeze_protection_config.temperature, unit: celsius
 * @example { "freeze_protection_config": { "enable": 1, "temperature": 10 } }
 */
function setFreezeProtection(freeze_protection_config) {
    var enable = freeze_protection_config.enable;
    var temperature = freeze_protection_config.temperature;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("freeze_protection_config.enable must be one of " + enable_values.join(", "));
    }
    if (enable && typeof temperature !== "number") {
        throw new Error("freeze_protection_config.temperature must be a number");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xb0);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeInt16LE(temperature * 10);
    return buffer.toBytes();
}

/**
 * @param {string} fan_mode_setting 
 * @param {number} fan_mode_setting.mode_value values: (2: "auto", 3: "always on", 4: "circulate")
 * @param {string} fan_mode_setting.mode values: (auto, always on, circulate)
 * @example { "fan_mode_setting": { "mode_value": 2, "mode": "auto" } }
 */
function setFanMode(fan_mode_setting) {
    var value = fan_mode_setting.mode_value;
    
    var fan_mode_map = [
        { value: 2, name: "auto" },
        { value: 3, name: "always on" },
        { value: 4, name: "circulate" },
    ];

    if(RAW_VALUE) {
        var fan_mode_value_values = fan_mode_map.map(function(item) { return item.value; });
        if (fan_mode_value_values.indexOf(value) === -1) {
            throw new Error("fan_mode_setting.mode_value must be one of " + fan_mode_value_values.join(", "));
        }

        return [0xff, 0xb6, arrayFindIndex(fan_mode_map, function(item) { return item.value === value; })];
    } else {
        var mode = fan_mode_setting.mode;
        var fan_mode_values = fan_mode_map.map(function(item) { return item.name; });
        if (fan_mode_values.indexOf(mode) === -1) {
            throw new Error("fan_mode_setting.mode must be one of " + fan_mode_values.join(", "));
        }

        return [0xff, 0xb6, arrayFindIndex(fan_mode_map, function(item) { return item.name === mode; })];
    }
}

function setFanDelay(fan_delay) {
    var enable = fan_delay.enable;
    var time = fan_delay.time;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("fan_delay.enable must be one of " + enable_values.join(", "));
    }
    if (enable && typeof time !== "number") {
        throw new Error("fan_delay.time must be a number");
    }
    if (enable && (time < 5 || time > 55)) {
        throw new Error("fan_delay.time must be in range [5, 55]");
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x05);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt8(time);
    return buffer.toBytes();
}

/**
 * set fan execute time
 * @since v1.3
 * @param {number} fan_execute_time range: [5,55], unit: minute
 * @example { "fan_execute_time": 10 }
 */
function setFanExecuteTime(fan_execute_time) {
    if (typeof fan_execute_time !== "number") {
        throw new Error("fan_execute_time must be a number");
    }
    if (fan_execute_time < 5 || fan_execute_time > 55) {
        throw new Error("fan_execute_time must be in range [5, 55]");
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x06);
    buffer.writeUInt8(fan_execute_time);
    return buffer.toBytes();
}

/**
 * set plan type
 * @param {string} plan_type values: (0: wake, 1: away, 2: home, 3: sleep, 4: occupied, 5: vacant, 6: eco)
 * @example { "plan_type": 0 }
 */
function setPlanType(plan_type) {
    var plan_type_map = { 0: "wake", 1: "away", 2: "home", 3: "sleep", 4: "occupied", 5: "vacant", 6: "eco" };
    var plan_type_values = getValues(plan_type_map);
    if (plan_type_values.indexOf(plan_type) === -1) {
        throw new Error("plan_type must be one of " + plan_type_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xc2);
    buffer.writeUInt8(getValue(plan_type_map, plan_type));
    return buffer.toBytes();
}

/**
 * set plan
 * @param {object} plan
 * @param {number} plan.plan_id values: (0: wake, 1: away, 2: home, 3: sleep)
 * @param {number} plan.temp_mode values: (0: heat, 1: em heat, 2: cool, 3: auto)
 * @param {number} plan.fan_mode values: (0: auto, 1: on, 2: circulate)
 * @param {number} plan.target
 * @param {number} plan.error
 * @example { "plan": { "plan_id": 1, "temp_mode": 0, "fan_mode": 0, "target": 20, "error": 1 } }
 */
function setPlan(plan) {
    var plan_id = plan.plan_id;
    var temp_mode = plan.temp_mode;
    var fan_mode = plan.fan_mode;
    var target = plan.target;
    var error = plan.error;

    var plan_id_map = { 0: "wake", 1: "away", 2: "home", 3: "sleep" };
    var temp_mode_map = { 0: "heat", 1: "em heat", 2: "cool", 3: "auto" };
    var fan_mode_map = { 0: "auto", 1: "on", 2: "circulate" };

    var temp_mode_values = getValues(temp_mode_map);
    var fan_mode_values = getValues(fan_mode_map);
    var plan_id_values = getValues(plan_id_map);
    if (plan_id_values.indexOf(plan_id) === -1) {
        throw new Error("plan.plan_id must be one of " + plan_id_values.join(", "));
    }
    if (temp_mode_values.indexOf(temp_mode) === -1) {
        throw new Error("plan.temp_mode must be one of " + temp_mode_values.join(", "));
    }
    if (fan_mode_values.indexOf(fan_mode) === -1) {
        throw new Error("plan.fan_mode must be one of " + fan_mode_values.join(", "));
    }
    if (typeof target !== "number") {
        throw new Error("plan.target must be a number");
    }
    if (typeof error !== "number") {
        throw new Error("plan.error must be a number");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xc8);
    buffer.writeUInt8(getValue(plan_id_map, plan_id));
    buffer.writeUInt8(getValue(temp_mode_map, temp_mode));
    buffer.writeUInt8(getValue(fan_mode_map, fan_mode));
    buffer.writeUInt8(target);
    buffer.writeUInt8(error * 10);
    return buffer.toBytes();
}

/**
 * set plan schedule
 * @param {object} plan_schedule
 * @param {string} plan_schedule.plan_type values: (0: wake, 1: away, 2: home, 3: sleep, 4: occupied, 5: vacant, 6: eco)
 * @param {number} plan_schedule.id range: [1, 16]
 * @param {number} plan_schedule.enable values: (0: disable, 1: enable)
 * @param {object} plan_schedule.week_recycle
 * @param {number} plan_schedule.week_recycle.monday values: (0: disable, 1: enable)
 * @param {number} plan_schedule.week_recycle.tuesday values: (0: disable, 1: enable)
 * @param {number} plan_schedule.week_recycle.wednesday values: (0: disable, 1: enable)
 * @param {number} plan_schedule.week_recycle.thursday values: (0: disable, 1: enable)
 * @param {number} plan_schedule.week_recycle.friday values: (0: disable, 1: enable)
 * @param {number} plan_schedule.week_recycle.saturday values: (0: disable, 1: enable)
 * @param {number} plan_schedule.week_recycle.sunday values: (0: disable, 1: enable)
 * @param {number} plan_schedule.time unit: minute, convert: "hh:mm" -> "hh * 60 + mm"
 * @example { "plan_schedule": [{ "plan_type": 0, "id": 0, "enable": 1, "week_recycle": { "monday": 1, "tuesday": 0, "wednesday": 1, "thursday": 0, "friday": 1, "saturday": 0, "sunday": 1 }, "time": 240 }] }
 */
function setPlanSchedule(plan_schedule) {
    var plan_type = plan_schedule.plan_type;
    var id = plan_schedule.id;
    var enable = plan_schedule.enable;
    var week_recycle = plan_schedule.week_recycle;
    var time = plan_schedule.time;

    var plan_schedule_type_map = { 0: "wake", 1: "away", 2: "home", 3: "sleep", 4: "occupied", 5: "vacant", 6: "eco" };
    var plan_schedule_type_values = getValues(plan_schedule_type_map);
    if (plan_schedule_type_values.indexOf(plan_type) === -1) {
        throw new Error("plan_schedule._item.plan_type must be one of " + plan_schedule_type_values.join(", "));
    }
    if (typeof id !== "number") {
        throw new Error("plan_schedule._item.id must be a number");
    }
    if (id < 1 || id > 16) {
        throw new Error("plan_schedule._item.id must be in range [1, 16]");
    }
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("plan_schedule._item.enable must be one of " + enable_values.join(", "));
    }
    var week_day_bits_offset = { monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 7 };
    var days = 0x00;
    for (var day in week_recycle) {
        if (enable_values.indexOf(week_recycle[day]) === -1) {
            throw new Error("plan_schedule._item.week_recycle." + day + " must be one of " + enable_values.join(", "));
        }
        days |= getValue(enable_map, week_recycle[day]) << week_day_bits_offset[day];
    }

    var buffer = new Buffer(8);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xc9);
    buffer.writeUInt8(getValue(plan_schedule_type_map, plan_type));
    buffer.writeUInt8(id - 1);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt8(days);
    buffer.writeUInt16LE(time);
    return buffer.toBytes();
}

/**
 * set plan schedule enable config
 * @since v1.2
 * @param {object} plan_schedule_enable_config
 * @param {number} plan_schedule_enable_config.wake values: (0: disable, 1: enable)
 * @param {number} plan_schedule_enable_config.away values: (0: disable, 1: enable)
 * @param {number} plan_schedule_enable_config.home values: (0: disable, 1: enable)
 * @param {number} plan_schedule_enable_config.sleep values: (0: disable, 1: enable)
 * @param {number} plan_schedule_enable_config.occupied values: (0: disable, 1: enable)
 * @param {number} plan_schedule_enable_config.vacant values: (0: disable, 1: enable)
 * @param {number} plan_schedule_enable_config.eco values: (0: disable, 1: enable)
 */
function setPlanScheduleEnableConfig(plan_schedule_enable_config) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);

    var mask = 0x00;
    var value = 0x00;
    var plan_bit_offset = { wake: 0, away: 1, home: 2, sleep: 3, occupied: 4, vacant: 5, eco: 6 };
    for (var key in plan_bit_offset) {
        if (key in plan_schedule_enable_config) {
            if (enable_values.indexOf(plan_schedule_enable_config[key]) === -1) {
                throw new Error("plan_schedule_enable_config." + key + " must be one of " + enable_values.join(", "));
            }
            mask |= 1 << plan_bit_offset[key];
            value |= getValue(enable_map, plan_schedule_enable_config[key]) << plan_bit_offset[key];
        }
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x8b);
    buffer.writeUInt8(mask);
    buffer.writeUInt8(value);
    return buffer.toBytes();
}

/**
 * set card config
 * @param {object} card_config
 * @param {number} card_config.enable values: (0: disable, 1: enable)
 * @param {number} card_config.action_type values: (0: power, 1: plan)
 * @param {number} card_config.in_plan_type values: (0: wake, 1: away, 2: home, 3: sleep, 4: occupied, 5: vacant, 6: eco)
 * @param {number} card_config.out_plan_type values: (0: wake, 1: away, 2: home, 3: sleep, 4: occupied, 5: vacant, 6: eco)
 * @param {number} card_config.invert values: (0: no, 1: yes)
 * @example { "card_config": { "enable": 0 } }
 * @example { "card_config": { "enable": 1, "action_type": 0, "invert": 1 } }
 * @example { "card_config": { "enable": 1, "action_type": 1, "in_plan_type": 0, "out_plan_type": 1, "invert": 0 } }
 */
function setCardConfig(card_config) {
    var enable = card_config.enable;
    var action_type = card_config.action_type;
    var in_plan_type = card_config.in_plan_type;
    var out_plan_type = card_config.out_plan_type;
    var invert = card_config.invert;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("card_config.enable must be one of " + enable_values.join(", "));
    }
    var card_config_action_type_map = { 0: "power", 1: "plan" };
    var card_config_action_type_values = getValues(card_config_action_type_map);
    if (getValue(enable_map, enable) && card_config_action_type_values.indexOf(action_type) === -1) {
        throw new Error("card_config.action_type must be one of " + card_config_action_type_values.join(", "));
    }

    var action = 0x00;
    if (getValue(card_config_action_type_map, action_type) === 1) {
        var card_config_plan_type_map = { 0: "wake", 1: "away", 2: "home", 3: "sleep", 4: "occupied", 5: "vacant", 6: "eco" };
        var card_config_plan_type_values = getValues(card_config_plan_type_map);
        if (card_config_plan_type_values.indexOf(in_plan_type) === -1) {
            throw new Error("card_config.in_plan_type must be one of " + card_config_plan_type_values.join(", "));
        } else {
            action |= card_config_plan_type_values.indexOf(in_plan_type) << 4;
        }
        if (card_config_plan_type_values.indexOf(out_plan_type) === -1) {
            throw new Error("card_config.out_plan_type must be one of " + card_config_plan_type_values.join(", "));
        } else {
            action |= card_config_plan_type_values.indexOf(out_plan_type);
        }
    }

    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (enable && yes_no_values.indexOf(invert) === -1) {
        throw new Error("card_config.invert must be one of " + yes_no_values.join(", "));
    }

    var buffer = new Buffer(6);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xc1);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt8(getValue(enable_map, enable) ? getValue(card_config_action_type_map, action_type) : 0);
    buffer.writeUInt8(action);
    buffer.writeUInt8(getValue(enable_map, enable) ? getValue(yes_no_map, invert) : 0);
    return buffer.toBytes();
}

/**
 * set wires relay config
 * @since v1.3
 * @param {number} y1: values: (0: off, 1: on)
 * @param {number} y2_gl: values: (0: off, 1: on)
 * @param {number} w1: values: (0: off, 1: on)
 * @param {number} w2_aux: values: (0: off, 1: on)
 * @param {number} e: values: (0: off, 1: on)
 * @param {number} g: values: (0: off, 1: on)
 * @param {number} ob: values: (0: off, 1: on)
 * @example { "wires_relay_config": { "y1": 1, "y2_gl": 0, "w1": 1, "w2_aux": 0, "e": 1, "g": 0, "ob": 1 } }
 */
function setWiresRelayConfig(wires_relay_config) {
    var on_off_map = { 0: "off", 1: "on" };
    var on_off_values = getValues(on_off_map);
    var wire_relay_bit_offset = { y1: 0, y2_gl: 1, w1: 2, w2_aux: 3, e: 4, g: 5, ob: 6 };

    var masked = 0x00;
    var status = 0x00;
    for (var wire in wires_relay_config) {
        if (on_off_values.indexOf(wires_relay_config[wire]) === -1) {
            throw new Error("wires_relay_config." + wire + " must be one of " + on_off_values.join(", "));
        }

        masked |= 1 << wire_relay_bit_offset[wire];
        status |= getValue(on_off_map, wires_relay_config[wire]) << wire_relay_bit_offset[wire];
    }

    var buffer = new Buffer(6);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xf7);
    buffer.writeUInt16LE(masked);
    buffer.writeUInt16LE(status);
    return buffer.toBytes();
}

/**
 * set aux config
 * @param {object} aux_control_config
 * @param {number} aux_control_config.y2_enable values: (0: disable, 1: enable)
 * @param {number} aux_control_config.w2_enable values: (0: disable, 1: enable)
 * @example { "aux_control_config": { "y2_enable": 1, "w2_enable": 1 } }
 */
function setAuxControlConfig(aux_control_config) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);

    var data = 0;
    var aux_control_bit_offset = { y2_enable: 0, w2_enable: 1 };
    for (var key in aux_control_bit_offset) {
        if (key in aux_control_config) {
            if (enable_values.indexOf(aux_control_config[key]) === -1) {
                throw new Error("aux_control_config." + key + " must be one of " + enable_values.join(", "));
            }
            // mask
            data |= 1 << (aux_control_bit_offset[key] + 4);
            // status
            data |= getValue(enable_map, aux_control_config[key]) << aux_control_bit_offset[key];
        }
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x3b);
    buffer.writeUInt8(data);
    return buffer.toBytes();
}

/**
 * set fan delay config
 * @param {object} fan_delay_config
 * @param {number} fan_delay_config.enable values: (0: disable, 1: enable)
 * @param {number} fan_delay_config.delay_time unit: second, range: [1, 3600]
 * @example { "fan_delay_config": { "enable": 1, "delay_time": 10 } }
 */
function setFanDelayConfig(fan_delay_config) {
    var enable = fan_delay_config.enable;
    var delay_time = fan_delay_config.delay_time;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("fan_delay_config.enable must be one of " + enable_values.join(", "));
    }
    if (getValue(enable_map, enable) && (delay_time < 1 || delay_time > 3600)) {
        throw new Error("fan_delay_config.delay_time must be a number, range: [1, 3600]");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x44);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt16LE(delay_time);
    return buffer.toBytes();
}

/**
 * set system protect config
 * @since v2.0
 * @param {object} system_protect_config
 * @param {number} system_protect_config.enable values: (0: disable, 1: enable)
 * @param {number} system_protect_config.duration unit: minute, range: [1, 60]
 * @example { "system_protect_config": { "enable": 1, "duration": 10 } }
 */
function setSystemProtectConfig(system_protect_config) {
    var enable = system_protect_config.enable;
    var duration = system_protect_config.duration;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("system_protect_config.enable must be one of " + enable_values.join(", "));
    }
    if (typeof duration !== "number" || duration < 1 || duration > 60) {
        throw new Error("system_protect_config.duration must be a number, range: [1, 60]");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x47);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt8(duration);
    return buffer.toBytes();
}

/**
 * set d2d enable
 * @param {number} d2d_master_enable values: (0: disable, 1: enable)
 * @param {number} d2d_slave_enable values: (0: disable, 1: enable)
 * @example { "d2d_master_enable": 1, "d2d_slave_enable": 0 }
 */
function setD2DEnable(d2d_master_enable, d2d_slave_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);

    var mask = 0x00;
    var status = 0x00;
    if (d2d_master_enable !== undefined) {
        if (enable_values.indexOf(d2d_master_enable) === -1) {
            throw new Error("d2d_master_enable must be one of " + enable_values.join(", "));
        }
        mask |= 1 << 0;
        status |= getValue(enable_map, d2d_master_enable) << 0;
    }
    if (d2d_slave_enable !== undefined) {
        if (enable_values.indexOf(d2d_slave_enable) === -1) {
            throw new Error("d2d_slave_enable must be one of " + enable_values.join(", "));
        }
        mask |= 1 << 1;
        status |= getValue(enable_map, d2d_slave_enable) << 1;
    }
    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xc7);
    buffer.writeUInt8((mask << 4) | status);
    return buffer.toBytes();
}

/**
 * set d2d master id
 * @since v2.0
 * @param {object} d2d_master_ids
 * @param {number} d2d_master_ids.id values: (1, 2, 3, 4, 5)
 * @param {string} d2d_master_ids.dev_eui
 * @example { "d2d_master_ids": [{ "id": 1, "dev_eui": "0000000000000000" }] }
 */
function setD2DMasterId(d2d_master_id) {
    var id = d2d_master_id.id;
    var dev_eui = d2d_master_id.dev_eui;

    var id_values = [1, 2, 3, 4, 5];
    if (id_values.indexOf(id) === -1) {
        throw new Error("d2d_master_ids._item.id must be one of " + id_values.join(", "));
    }

    var buffer = new Buffer(11);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x3e);
    buffer.writeUInt8(id - 1);
    buffer.writeHexString(dev_eui, "0000000000000000");
    return buffer.toBytes();
}

/**
 * set child lock
 * @param {object} child_lock_config
 * @param {number} child_lock_config.power_button values: (0: disable, 1: enable)
 * @param {number} child_lock_config.up_button values: (0: disable, 1: enable)
 * @param {number} child_lock_config.down_button values: (0: disable, 1: enable)
 * @param {number} child_lock_config.fan_button values: (0: disable, 1: enable)
 * @param {number} child_lock_config.mode_button values: (0: disable, 1: enable)
 * @param {number} child_lock_config.reset_button values: (0: disable, 1: enable)
 * @example { "child_lock_config": { "power_button": 1, "up_button": 0, "down_button": 1, "fan_button": 0, "mode_button": 0 , "reset_button": 1 } }
 */
function setChildLock(child_lock_config) {
    var button_mask_bit_offset = { power_button: 0, up_button: 1, down_button: 2, fan_button: 3, mode_button: 4, reset_button: 5 };
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);

    var masked = 0x00;
    var status = 0x00;
    for (var button in child_lock_config) {
        if (enable_values.indexOf(child_lock_config[button]) === -1) {
            throw new Error("child_lock_config." + button + " must be one of " + enable_values.join(", "));
        }

        masked |= 1 << button_mask_bit_offset[button];
        status |= getValue(enable_map, child_lock_config[button]) << button_mask_bit_offset[button];
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x25);
    buffer.writeUInt8(masked);
    buffer.writeUInt8(status);
    return buffer.toBytes();
}

/**
 * set wires
 * @param {object} wires
 * @param {number} wires.y1 values: (0: on, 1: off)
 * @param {number} wires.gh values: (0: on, 1: off)
 * @param {number} wires.ob values: (0: on, 1: off)
 * @param {number} wires.w1 values: (0: on, 1: off)
 * @param {number} wires.e values: (0: on, 1: off)
 * @param {number} wires.di values: (0: on, 1: off)
 * @param {number} wires.pek values: (0: on, 1: off)
 * @param {number} wires.w2 values: (0: on, 1: off)
 * @param {number} wires.aux values: (0: on, 1: off)
 * @param {number} wires.y2 values: (0: on, 1: off)
 * @param {number} wires.gl values: (0: on, 1: off)
 * @example { "wires": { "y1": 1, "gh": 0, "ob": 1, "w1": 1, "e": 1, "di": 0, "pek": 1, "w2": 0, "aux": 0, "y2": 1, "gl": 0 } }
 */
function setWires(wires) {
    var on_off_map = { 0: "off", 1: "on" };

    var b1 = 0x00;
    if ("y1" in wires) {
        b1 |= getValue(on_off_map, wires.y1) << 0;
    }
    if ("gh" in wires) {
        b1 |= getValue(on_off_map, wires.gh) << 2;
    }
    if ("ob" in wires) {
        b1 |= getValue(on_off_map, wires.ob) << 4;
    }
    if ("w1" in wires) {
        b1 |= getValue(on_off_map, wires.w1) << 6;
    }

    var b2 = 0x00;
    if ("e" in wires) {
        b2 |= getValue(on_off_map, wires.e) << 0;
    }
    if ("di" in wires) {
        b2 |= getValue(on_off_map, wires.di) << 2;
    }
    if ("pek" in wires) {
        b2 |= getValue(on_off_map, wires.pek) << 4;
    }
    if ("w2" in wires) {
        b2 |= getValue(on_off_map, wires.w2) << 6;
    }
    if ("aux" in wires) {
        b2 |= getValue(on_off_map, wires.aux) ? 2 << 6 : 0;
    }

    var b3 = 0x00;
    if ("y2" in wires) {
        b3 |= getValue(on_off_map, wires.y2) << 0;
    }
    if ("gl" in wires) {
        b3 |= getValue(on_off_map, wires.gl) ? 2 << 0 : 0;
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xca);
    buffer.writeUInt8(b1);
    buffer.writeUInt8(b2);
    buffer.writeUInt8(b3);
    return buffer.toBytes();
}

/**
 * set reversing valve
 * @param {number} reversing_valve values: (1: energize on heat, 2: energize on cool)
 * @example { "reversing_valve": 1 }
 */
function setReversingValve(reversing_valve) {
    var value = reversing_valve.value;
    var mode = reversing_valve.mode;
    var reversing_valve_map = { 1: "energize on heat", 2: "energize on cool" };
    var reversing_valve_values = getValues(reversing_valve_map);

    if (RAW_VALUE) {
        if (reversing_valve_values.indexOf(value) === -1) {
            throw new Error("reversing_valve.value must be one of " + reversing_valve_values.join(", "));
        }

        return [0xff, 0xb5, value - 1];
    } else {
        if (reversing_valve_values.indexOf(mode) === -1) {
            throw new Error("reversing_valve.mode must be one of " + reversing_valve_values.join(", "));
        }

        return [0xff, 0xb5, getValue(reversing_valve_map, mode) - 1];
    }
}

/**
 * multicast group configuration
 * @param {object} multicast_group_config
 * @param {number} multicast_group_config.group1_enable values: (0: disable, 1: enable)
 * @param {number} multicast_group_config.group2_enable values: (0: disable, 1: enable)
 * @param {number} multicast_group_config.group3_enable values: (0: disable, 1: enable)
 * @param {number} multicast_group_config.group4_enable values: (0: disable, 1: enable)
 * @example { "multicast_group_config": { "group1_enable": 1, "group2_enable": 0, "group3_enable": 1, "group4_enable": 0 } }
 */
function setMulticastGroupConfig(multicast_group_config) {
    var mask_id = 0;
    var mask_enable = 0;
    var group_mask_bit_offset = { group1_enable: 0, group2_enable: 1, group3_enable: 2, group4_enable: 3 };

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    for (var group in group_mask_bit_offset) {
        if (group in multicast_group_config) {
            if (enable_values.indexOf(multicast_group_config[group]) === -1) {
                throw new Error("multicast_group_config." + group + " must be one of " + enable_values.join(", "));
            }

            mask_id |= 1 << group_mask_bit_offset[group];
            mask_enable |= getValue(enable_map, multicast_group_config[group]) << group_mask_bit_offset[group];
        }
    }

    var data = (mask_id << 4) | mask_enable;
    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x82);
    buffer.writeUInt8(data);
    return buffer.toBytes();
}

/**
 * d2d master configuration
 * @param {object} d2d_master_config
 * @param {number} d2d_master_config.plan_type values: (0: wake, 1: away, 2: home, 3: sleep, 4: occupied, 5: vacant, 6: eco)
 * @param {number} d2d_master_config.enable values: (0: disable, 1: enable)
 * @param {number} d2d_master_config.d2d_cmd
 * @param {number} d2d_master_config.lora_uplink_enable values: (0: disable, 1: enable)
 * @param {number} d2d_master_config.time_enable values: (0: disable, 1: enable)
 * @param {number} d2d_master_config.time unit: minute
 * @example { "d2d_master_config": [{ "plan_type": 0, "enable": 1, "d2d_cmd": "0000", "uplink_enable": 1, "time_enable": 1, "time": 10 }] }
 */
function setD2DMasterConfig(d2d_master_config) {
    var plan_type = d2d_master_config.plan_type;
    var enable = d2d_master_config.enable;
    var d2d_cmd = d2d_master_config.d2d_cmd;
    var lora_uplink_enable = d2d_master_config.lora_uplink_enable;
    var time_enable = d2d_master_config.time_enable;
    var time = d2d_master_config.time;

    var plan_type_map = { 0: "wake", 1: "away", 2: "home", 3: "sleep", 4: "occupied", 5: "vacant", 6: "eco" };
    var plan_type_values = getValues(plan_type_map);
    if (plan_type_values.indexOf(plan_type) === -1) {
        throw new Error("d2d_master_config._item.plan_type must be one of " + plan_type_values.join(", "));
    }
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("d2d_master_config._item.enable must be one of " + enable_values.join(", "));
    }
    if (enable && enable_values.indexOf(lora_uplink_enable) === -1) {
        throw new Error("d2d_master_config._item.lora_uplink_enable must be one of " + enable_values.join(", "));
    }
    if (enable && enable_values.indexOf(time_enable) === -1) {
        throw new Error("d2d_master_config._item.time_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(10);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x96);
    buffer.writeUInt8(getValue(plan_type_map, plan_type));
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt8(getValue(enable_map, lora_uplink_enable));
    buffer.writeD2DCommand(d2d_cmd, "0000");
    buffer.writeUInt16LE(time);
    buffer.writeUInt8(getValue(enable_map, time_enable));
    return buffer.toBytes();
}

/**
 * d2d slave configuration
 * @param {object} d2d_slave_config
 * @param {number} d2d_slave_config.id
 * @param {number} d2d_slave_config.enable values: (0: disable, 1: enable)
 * @param {string} d2d_slave_config.d2d_cmd
 * @param {object} d2d_slave_config.action
 * @param {number} d2d_slave_config.action.action_type values: (0: power, 1: plan)
 * @param {number} d2d_slave_config.action.system_status values: action_type=0 (0: off, 1: on)
 * @param {number} d2d_slave_config.action.plan_type values: action_type=1 (0: wake, 1: away, 2: home, 3: sleep, 4: occupied, 5: vacant, 6: eco)
 * @example { "d2d_slave_config": [{ "id": 1, "enable": 1, "d2d_cmd": "0000", "action": { "action_type": 0, "system_status": 1 } }] }
 * @example { "d2d_slave_config": [{ "id": 1, "enable": 1, "d2d_cmd": "0000", "action": { "action_type": 1, "plan_type": 1 } }] }
 */
function setD2DSlaveConfig(d2d_slave_config) {
    var id = d2d_slave_config.id;
    var enable = d2d_slave_config.enable;
    var d2d_cmd = d2d_slave_config.d2d_cmd;
    var action = d2d_slave_config.action;

    if (typeof id !== "number") {
        throw new Error("d2d_slave_config.id must be a number");
    }
    if (id < 1 || id > 16) {
        throw new Error("d2d_slave_config.id must be in range [1, 16]");
    }
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("d2d_slave_config.enable must be one of " + enable_values.join(", "));
    }
    var action_type_map = { 0: "power", 1: "plan" };
    var action_type_values = getValues(action_type_map);
    if (action_type_values.indexOf(action.action_type) === -1) {
        throw new Error("d2d_slave_config.action.action_type must be one of " + action_type_values.join(", "));
    }

    var data = 0x00;
    // system status mode
    if (getValue(action_type_map, action.action_type) === 0) {
        var on_off_map = { 0: "off", 1: "on" };
        var on_off_values = getValues(on_off_map);
        if (on_off_values.indexOf(action.system_status) === -1) {
            throw new Error("d2d_slave_config.action.system_status must be one of " + on_off_values.join(", "));
        }
        data = (getValue(action_type_map, action.action_type) << 4) | getValue(on_off_map, action.system_status);
    }
    if (getValue(action_type_map, action.action_type) === 1) {
        var plan_action_map = { 0: "wake", 1: "away", 2: "home", 3: "sleep", 4: "occupied", 5: "vacant", 6: "eco" };
        var plan_action_values = getValues(plan_action_map);
        if (plan_action_values.indexOf(action.plan_type) === -1) {
            throw new Error("d2d_slave_config.action.plan_type must be one of " + plan_action_values.join(", "));
        }
        data = (getValue(action_type_map, action.action_type) << 4) | getValue(plan_action_map, action.plan_type);
    }

    var buffer = new Buffer(7);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x83);
    buffer.writeUInt8(id - 1);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeD2DCommand(d2d_cmd, "0000");
    buffer.writeUInt8(data);
    return buffer.toBytes();
}

/**
 * set control permissions
 * @since v1.3
 * @param {number} control_permission values: (0: thermostat, 1: remote control)
 * @example { "control_permission": 0 }
 */
function setControlPermission(control_permission) {
    var control_permission_map = { 0: "thermostat", 1: "remote control" };
    var control_permission_values = getValues(control_permission_map);
    if (control_permission_values.indexOf(control_permission) === -1) {
        throw new Error("control_permission must be one of " + control_permission_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xf6);
    buffer.writeUInt8(getValue(control_permission_map, control_permission));
    return buffer.toBytes();
}

/**
 * set offline control mode
 * @since v1.3
 * @param {number} offline_control_mode values: (0: keep, 1: thermostat, 2: off)
 * @example { "offline_control_mode": 0 }
 */
function setOfflineControlMode(offline_control_mode) {
    var offline_control_mode_map = { 0: "keep", 1: "thermostat", 2: "off" };
    var offline_control_mode_values = getValues(offline_control_mode_map);
    if (offline_control_mode_values.indexOf(offline_control_mode) === -1) {
        throw new Error("offline_control_mode must be one of " + offline_control_mode_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xf8);
    buffer.writeUInt8(getValue(offline_control_mode_map, offline_control_mode));
    return buffer.toBytes();
}

/**
 * set config value and time
 * @since firmware version 1.4
 * @param {object} offline_timeout/occupied_delay
 * @param {number} [offline_timeout/occupied_delay].value values: [ 1, 2, 3, 4, 5, 6, 7, 8 ]
 * @param {string} [offline_timeout/occupied_delay].time values: [ 'disable', 5, 10, 20, 30, 40, 50, 60 ]
 * @example { "offline_timeout/occupied_delay": { "value": 2, "time": 5 } }
 */
function setConfigValueTime(config, key, channel_type) { 
    var value = config.value;
    var config_value_map = { 1: "disable", 2: 5, 3: 10, 4: 20, 5: 30, 6: 40, 7: 50, 8: 60 };
    var config_value_values = getValues(config_value_map);

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(channel_type);

    if(RAW_VALUE) {
        if (config_value_values.indexOf(value) === -1) {
            throw new Error(key + ".value must be one of " + config_value_map.join(", "));
        }

        buffer.writeUInt8(config_value_map[value] === 'disable' ? 255 : config_value_map[value]);
    } else {
        var time = config.time === 'disable' ? 255 : config.time;
    
        if (typeof time !== "number") {
            throw new Error(key + ".time must be a number");
        }
        if ((time < 1 || time > 60) && time !== 255) {
            throw new Error(key + ".time must be in range [1, 60] or 255");
        }

        buffer.writeUInt8(time);
    }

    return buffer.toBytes();
}

/**
 * set down heart
 * @since firmware version 1.4
 * @param {number} heartbeat range: [0, 255]
 * @example { "heartbeat": 0 }
 */
function setDownHeart(heartbeat) {
    if (typeof heartbeat !== "number") {
        throw new Error("heartbeat must be a number");
    }
    if (heartbeat < 0 || heartbeat > 255) {
        throw new Error("heartbeat must be in range [0, 255]");
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x2a);
    buffer.writeUInt8(heartbeat);
    return buffer.toBytes();
}

/**
 * set fan control during heating
 * @since v2.0
 * @param {number} fan_control_during_heating values: (0: furnace, 1: thermostat)
 * @example { "fan_control_during_heating": 0 }
 */
function setFanControlDuringHeating(fan_control_during_heating) {
    var mode_map = { 0: "furnace/boiler", 1: "thermostat" };
    var mode_values = getValues(mode_map);
    if (mode_values.indexOf(fan_control_during_heating) === -1) {
        throw new Error("fan_control_during_heating must be one of " + mode_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x62);
    buffer.writeUInt8(getValue(mode_map, fan_control_during_heating));
    return buffer.toBytes();
}

/**
 * set temperature threshold alarm configuration
 * @param {object} temperature_alarm_config
 * @param {number} temperature_alarm_config.alarm_type values: (0: temperature threshold, 1: continuous low temperature, 2: continuous high temperature)
 * @param {number} temperature_alarm_config.condition values: (0: disable, 1: below, 2: above, 3: between, 4: outside)
 * @param {number} temperature_alarm_config.threshold_min condition=(below, within, outside)
 * @param {number} temperature_alarm_config.threshold_max condition=(above, within, outside)
 * @param {number} temperature_alarm_config.lock_time unit: minute
 * @param {number} temperature_alarm_config.continue_time unit: minute
 * @example { "temperature_alarm_config": { "alarm_type": 0, "condition": 1, "threshold_min": 10, "threshold_max": 20, "continue_time": 10 } }
 */
function setTemperatureAlarmConfig(temperature_alarm_config) {
    var condition = temperature_alarm_config.condition;
    var alarm_type = temperature_alarm_config.alarm_type;
    var threshold_min = temperature_alarm_config.threshold_min;
    var threshold_max = temperature_alarm_config.threshold_max;
    var lock_time = temperature_alarm_config.lock_time;
    var continue_time = temperature_alarm_config.continue_time;

    var condition_map = { 0: "disable", 1: "below", 2: "above", 3: "between", 4: "outside" };
    var condition_values = getValues(condition_map);
    if (condition_values.indexOf(condition) === -1) {
        throw new Error("temperature_alarm_config.condition must be one of " + condition_values.join(", "));
    }
    var alarm_type_map = { 0: "temperature threshold", 1: "continuous low temperature", 2: "continuous high temperature" };
    var alarm_type_values = getValues(alarm_type_map);
    if (alarm_type_values.indexOf(alarm_type) === -1) {
        throw new Error("temperature_alarm_config.alarm_type must be one of " + alarm_type_values.join(", "));
    }

    var data = getValue(condition_map, condition) | (getValue(alarm_type_map, alarm_type) << 3);

    var buffer = new Buffer(11);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x06);
    buffer.writeUInt8(data);
    buffer.writeInt16LE(threshold_min * 10);
    buffer.writeInt16LE(threshold_max * 10);
    buffer.writeUInt16LE(lock_time);
    buffer.writeUInt16LE(continue_time);
    return buffer.toBytes();
}

/**
 * set screen display mode
 * @since v1.3
 * @param {number} screen_display_mode, values: (0: on, 1: without plan show, 2: disable all)
 * @example { "screen_display_mode": 0 }
 */
function setScreenDisplayMode(screen_display_mode) {
    var screen_display_mode_map = { 0: "on", 1: "without plan show", 2: "disable all" };
    var screen_display_mode_values = getValues(screen_display_mode_map);
    if (screen_display_mode_values.indexOf(screen_display_mode) === -1) {
        throw new Error("screen_display_mode must be one of " + screen_display_mode_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x08);
    buffer.writeUInt8(getValue(screen_display_mode_map, screen_display_mode));
    return buffer.toBytes();
}

/**
 * set unlock config
 * @since v2.0
 * @param {object} unlock_config
 * @param {number} unlock_config.time unit: second
 * @param {number} unlock_config.power_button values: (0: disable, 1: enable)
 * @param {number} unlock_config.temperature_up_button values: (0: disable, 1: enable)
 * @param {number} unlock_config.temperature_down_button values: (0: disable, 1: enable)
 * @param {number} unlock_config.fan_mode_button values: (0: disable, 1: enable)
 * @param {number} unlock_config.temperature_control_mode_button values: (0: disable, 1: enable)
 * @example { "unlock_config": { "time": 10, "power_button": 1, "temperature_up_button": 1, "temperature_down_button": 1, "fan_mode_button": 1, "temperature_control_mode_button": 1 } }
 */
function setUnlockConfig(unlock_config) {
    var time = unlock_config.time;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);

    var data = 0x00;
    var bit_offset = { power_button: 0, temperature_up_button: 1, temperature_down_button: 2, fan_mode_button: 3, temperature_control_mode_button: 4 };
    for (var key in bit_offset) {
        if (key in unlock_config) {
            if (enable_values.indexOf(unlock_config[key]) === -1) {
                throw new Error("unlock_config." + key + " must be one of " + enable_values.join(", "));
            }
            data |= getValue(enable_map, unlock_config[key]) << bit_offset[key];
        }
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x5c);
    buffer.writeUInt8(data);
    buffer.writeUInt16LE(time);
    return buffer.toBytes();
}

/**
 * set temperature control enable setting
 * @since v2.0
 * @param {object} temperature_control_enable_setting
 * @param {number} temperature_control_enable_setting.value
 * @param {string} temperature_control_enable_setting.mode values: (heat/em heat/cool/auto, heat/cool/auto, heat, cool, heat/cool)
 * @example { "temperature_control_enable_setting": { "value": 1, "mode": "auto/cool/em heat/heat" } }
 */
function setTemperatureControlEnableSetting(temperature_control_enable_setting) {
    var value = temperature_control_enable_setting.value;

    var value_map = { 1: "heat/em heat/cool/auto", 2: "heat/cool/auto", 3: "heat", 4: "cool", 5: "heat/cool" };
    var value_values = getValues(value_map);

    function getDataValue(setting) {
        var values = 0x00;
        var buttons = [ "heat", "em heat", "cool", "auto" ];
        var buttons_array = setting.split("/");
        for (var i = 0; i < buttons_array.length; i++) {
            if (buttons.indexOf(buttons_array[i]) === -1) {
                throw new Error("temperature_control_enable_setting.mode must be one of " + buttons.join(", "));
            }
            values |= 1 << buttons.indexOf(buttons_array[i]);
        }

        return values;
    }

    if(RAW_VALUE) { 
        if (value_values.indexOf(value) === -1) {
            throw new Error("temperature_control_enable_setting.value must be one of " + value_values.join(", "));
        }

        return [0xf9, 0x5d, getDataValue(value_map[value])];
    }

    var mode = temperature_control_enable_setting.mode;
    if(mode === 'disable') {
        return [0xf9, 0x5d, 0x00];
    }

    return [0xf9, 0x5d, getDataValue(mode)];
}

/**
 * set plan config (target temperature dual)
 * @param {object} dual_plan_config
 * @param {number} dual_plan_config.type values: (0: wake, 1: away, 2: home, 3: sleep, 4: occupied, 5: vacant, 6: eco)
 * @param {number} dual_plan_config.temperature_control_mode values: (0: heat, 1: em heat, 2: cool, 3: auto)
 * @param {number} dual_plan_config.fan_mode values: (0: auto, 1: on, 2: circulate)
 * @param {number} dual_plan_config.heat_target_temperature
 * @param {number} dual_plan_config.heat_temperature_tolerance
 * @param {number} dual_plan_config.cool_target_temperature
 * @param {number} dual_plan_config.cool_temperature_tolerance
 * @example { "dual_temperature_plan_config": [{ "type": 0, "temperature_control_mode": 2, "fan_mode": 0, "heat_target_temperature": 20, "heat_temperature_tolerance": 1, "cool_target_temperature": 20, "cool_temperature_tolerance": 1 }]}
 */
function setPlanConfigWithDualTemperature(dual_temperature_plan_config) {
    var type = dual_temperature_plan_config.type;
    var temperature_control_mode = dual_temperature_plan_config.temperature_control_mode;
    var fan_mode = dual_temperature_plan_config.fan_mode;
    var heat_target_temperature = dual_temperature_plan_config.heat_target_temperature;
    var heat_temperature_tolerance = dual_temperature_plan_config.heat_temperature_tolerance;
    var cool_target_temperature = dual_temperature_plan_config.cool_target_temperature;
    var cool_temperature_tolerance = dual_temperature_plan_config.cool_temperature_tolerance;

    var plan_config_type_map = { 0: "wake", 1: "away", 2: "home", 3: "sleep", 4: "occupied", 5: "vacant", 6: "eco" };
    var plan_config_type_values = getValues(plan_config_type_map);
    if (plan_config_type_values.indexOf(type) === -1) {
        throw new Error("dual_temperature_plan_config._item.type must be one of " + plan_config_type_values.join(", "));
    }
    var plan_config_temperature_control_mode_map = { 0: "heat", 1: "em heat", 2: "cool", 3: "auto" };
    var plan_config_temperature_control_mode_values = getValues(plan_config_temperature_control_mode_map);
    if (plan_config_temperature_control_mode_values.indexOf(temperature_control_mode) === -1) {
        throw new Error("dual_temperature_plan_config._item.temperature_control_mode must be one of " + plan_config_temperature_control_mode_values.join(", "));
    }
    var plan_config_fan_mode_map = { 0: "auto", 1: "on", 2: "circulate" };
    var plan_config_fan_mode_values = getValues(plan_config_fan_mode_map);
    if (plan_config_fan_mode_values.indexOf(fan_mode) === -1) {
        throw new Error("dual_temperature_plan_config._item.fan_mode must be one of " + plan_config_fan_mode_values.join(", "));
    }

    var heat_target_temperature_value = 0xffff;
    if ("heat_target_temperature" in dual_temperature_plan_config) {
        if (typeof heat_target_temperature !== "number") {
            throw new Error("dual_temperature_plan_config._item.heat_target_temperature must be a number");
        }
        heat_target_temperature_value = heat_target_temperature * 10;
    }

    var heat_temperature_tolerance_value = 0xff;
    if ("heat_temperature_tolerance" in dual_temperature_plan_config) {
        if (typeof heat_temperature_tolerance !== "number") {
            throw new Error("dual_temperature_plan_config._item.heat_temperature_tolerance must be a number");
        }
        heat_temperature_tolerance_value = heat_temperature_tolerance * 10;
    }

    var cool_target_temperature_value = 0xffff;
    if ("cool_target_temperature" in dual_temperature_plan_config) {
        if (typeof cool_target_temperature !== "number") {
            throw new Error("dual_temperature_plan_config._item.cool_target_temperature must be a number");
        }
        cool_target_temperature_value = cool_target_temperature * 10;
    }

    var cool_temperature_tolerance_value = 0xff;
    if ("cool_temperature_tolerance" in dual_temperature_plan_config) {
        if (typeof cool_temperature_tolerance !== "number") {
            throw new Error("dual_temperature_plan_config._item.cool_temperature_tolerance must be a number");
        }
        cool_temperature_tolerance_value = cool_temperature_tolerance * 10;
    }

    var buffer = new Buffer(11);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x59);
    buffer.writeUInt8(getValue(plan_config_type_map, type));
    buffer.writeUInt8(getValue(plan_config_temperature_control_mode_map, temperature_control_mode));
    buffer.writeUInt8(getValue(plan_config_fan_mode_map, fan_mode));
    buffer.writeInt16LE(heat_target_temperature_value);
    buffer.writeUInt8(heat_temperature_tolerance_value);
    buffer.writeInt16LE(cool_target_temperature_value);
    buffer.writeUInt8(cool_temperature_tolerance_value);
    return buffer.toBytes();
}

/**
 * set temperature control config
 * @param {object} single_temperature_plan_config
 * @param {number} single_temperature_plan_config.plan_type values: (0: wake, 1: away, 2: home, 3: sleep, 4: occupied, 5: vacant, 6: eco)
 * @param {number} single_temperature_plan_config.temperature_control_mode values: (0: heat, 1: em heat, 2: cool, 3: auto)
 * @param {number} single_temperature_plan_config.fan_mode values: (0: auto, 1: on, 2: circulate)
 * @param {number} single_temperature_plan_config.target_temperature
 * @param {number} single_temperature_plan_config.target_temperature_tolerance
 * @param {number} single_temperature_plan_config.temperature_control_tolerance
 * @example { "single_temperature_plan_config": [{ "type": 0, "temperature_control_mode": 2, "fan_mode": 0, "target_temperature": 20, "target_temperature_tolerance": 1, "temperature_control_tolerance": 1 }] }
 */
function setPlanConfigWithSingleTemperature(single_temperature_plan_config) {
    var plan_type = single_temperature_plan_config.plan_type;
    var temperature_control_mode = single_temperature_plan_config.temperature_control_mode;
    var fan_mode = single_temperature_plan_config.fan_mode;
    var target_temperature = single_temperature_plan_config.target_temperature;
    var target_temperature_tolerance = single_temperature_plan_config.target_temperature_tolerance;
    var temperature_control_tolerance = single_temperature_plan_config.temperature_control_tolerance;

    var plan_type_map = { 0: "wake", 1: "away", 2: "home", 3: "sleep", 4: "occupied", 5: "vacant", 6: "eco" };
    var plan_type_values = getValues(plan_type_map);
    if (plan_type_values.indexOf(plan_type) === -1) {
        throw new Error("single_temperature_plan_config._item.plan_type must be one of " + plan_type_values.join(", "));
    }
    var temperature_control_mode_map = { 0: "heat", 1: "em heat", 2: "cool", 3: "auto" };
    var temperature_control_mode_values = getValues(temperature_control_mode_map);
    if (temperature_control_mode_values.indexOf(temperature_control_mode) === -1) {
        throw new Error("single_temperature_plan_config._item.temperature_control_mode must be one of " + temperature_control_mode_values.join(", "));
    }
    var fan_mode_map = { 0: "auto", 1: "on", 2: "circulate" };
    var fan_mode_values = getValues(fan_mode_map);
    if (fan_mode_values.indexOf(fan_mode) === -1) {
        throw new Error("single_temperature_plan_config._item.fan_mode must be one of " + fan_mode_values.join(", "));
    }

    var buffer = new Buffer(9);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x5e);
    buffer.writeUInt8(getValue(plan_type_map, plan_type));
    buffer.writeUInt8(getValue(temperature_control_mode_map, temperature_control_mode));
    buffer.writeUInt8(getValue(fan_mode_map, fan_mode));
    buffer.writeInt16LE(target_temperature * 10);
    buffer.writeUInt8(target_temperature_tolerance * 10);
    buffer.writeUInt8(temperature_control_tolerance * 10);
    return buffer.toBytes();
}

/**
 * set double point target tolerance
 * @param {object} double_point_target_tolerance
 * @param {number} double_point_target_tolerance.mode values: (0: heat, 1: cool)
 * @param {number} double_point_target_tolerance.tolerance unit: celsius range: [0.1, 5]
 * @example { "double_point_target_tolerance": { "mode": 0, "tolerance": 1 } }
 */
function setDoublePointTargetTolerance(double_point_target_tolerance) {
    var mode = double_point_target_tolerance.mode;
    var tolerance = double_point_target_tolerance.tolerance;

    var mode_map = { 0: "heat", 1: "cool" };
    var mode_values = getValues(mode_map);
    if (mode_values.indexOf(mode) === -1) {
        throw new Error("double_point_target_tolerance._item.mode must be one of " + mode_values.join(", "));
    }
    if (typeof tolerance !== "number") {
        throw new Error("double_point_target_tolerance._item.tolerance must be a number");
    }
    if (tolerance < 0.1 || tolerance > 5) {
        throw new Error("double_point_target_tolerance._item.tolerance must be a number, range: [0.1, 5]");
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x5a);
    buffer.writeUInt8(getValue(mode_map, mode));
    buffer.writeUInt8(tolerance * 10);
    return buffer.toBytes();
}

function getValues(map) {
    var values = [];
    for (var key in map) {
        values.push(RAW_VALUE ? parseInt(key) : map[key]);
    }
    return values;
}

function getValue(map, value) {
    if (RAW_VALUE) return value;

    for (var key in map) {
        if (map[key] === value) {
            return parseInt(key);
        }
    }

    throw new Error("not match in " + JSON.stringify(map));
}

function getObjValue(map, value) {
    for (var key in map) {
        if (map[key] === value) {
            return parseInt(key);
        }
    }
    throw new Error("not match in " + JSON.stringify(map));
}

function arrayFindIndex(array, callback) {
    for (var i = 0; i < array.length; i++) {
        if (callback(array[i], i, array)) {
            return i;
        }
    }
    return -1;
}

function Buffer(size) {
    this.buffer = new Array(size);
    this.offset = 0;

    for (var i = 0; i < size; i++) {
        this.buffer[i] = 0;
    }
}

Buffer.prototype._write = function (value, byteLength, isLittleEndian) {
    var offset = 0;
    for (var index = 0; index < byteLength; index++) {
        offset = isLittleEndian ? index << 3 : (byteLength - 1 - index) << 3;
        this.buffer[this.offset + index] = (value >> offset) & 0xff;
    }
};

Buffer.prototype.writeUInt8 = function (value) {
    this._write(value, 1, true);
    this.offset += 1;
};

Buffer.prototype.writeInt8 = function (value) {
    this._write(value < 0 ? value + 0x100 : value, 1, true);
    this.offset += 1;
};

Buffer.prototype.writeUInt16LE = function (value) {
    this._write(value, 2, true);
    this.offset += 2;
};

Buffer.prototype.writeInt16LE = function (value) {
    this._write(value < 0 ? value + 0x10000 : value, 2, true);
    this.offset += 2;
};

Buffer.prototype.writeUInt32LE = function (value) {
    this._write(value, 4, true);
    this.offset += 4;
};

Buffer.prototype.writeInt32LE = function (value) {
    this._write(value < 0 ? value + 0x100000000 : value, 4, true);
    this.offset += 4;
};

Buffer.prototype.writeD2DCommand = function (value, defaultValue) {
    if (typeof value !== "string") {
        value = defaultValue;
    }
    if (value.length !== defaultValue.length) {
        throw new Error("d2d_cmd length must be " + defaultValue.length);
    }
    this.buffer[this.offset] = parseInt(value.substr(2, 2), 16);
    this.buffer[this.offset + 1] = parseInt(value.substr(0, 2), 16);
    this.offset += 2;
};

Buffer.prototype.writeHexString = function (hex, defaultValue) {
    if (typeof hex !== "string") {
        hex = defaultValue;
    }
    if (hex.length !== defaultValue.length) {
        throw new Error("string length must be " + defaultValue.length);
    }
    this.writeBytes(hexStringToBytes(hex));
};

Buffer.prototype.writeBytes = function (bytes) {
    for (var i = 0; i < bytes.length; i++) {
        this.buffer[this.offset + i] = bytes[i];
    }
    this.offset += bytes.length;
};

Buffer.prototype.toBytes = function () {
    return this.buffer;
};

function hexStringToBytes(hex) {
    var bytes = [];
    for (var c = 0; c < hex.length; c += 2) {
        bytes.push(parseInt(hex.substr(c, 2), 16));
    }
    return bytes;
}

function hasPath(obj, path) {
	var parts = path.split('.');
	var current = obj;
  
	for (var i = 0; i < parts.length; i++) {
	  	if (!current || !(parts[i] in current)) {
			return false;
	  	}
	  	current = current[parts[i]];
	}
  
	return true;
}

function getPath(obj, path) {
	var parts = path.split('.');
	var current = obj;
  
	for (var i = 0; i < parts.length; i++) {
	  	var key = parts[i];
  
	  	if (!current || !(key in current)) {
			return null;
	  	}
  
	  	current = current[key];
	}
  
	return current;
}
  

function setPath(obj, path, value) {
	var parts = path.split('.');
	var current = obj;
  
	for (var i = 0; i < parts.length - 1; i++) {
	  	var key = parts[i];
  
	  	if (!(key in current) || typeof current[key] !== 'object') {
			current[key] = {};
	  	}
  
	  	current = current[key];
	}

	current[parts[parts.length - 1]] = value;
	return obj;
}

function convertName(propertyId, prefix) {
	var parts = propertyId.split('.');
	var lastPart = parts[parts.length - 1];
	parts[parts.length - 1] = prefix + '_' + lastPart;
	return parts.join('.');
}

function recoverName(propertyId, prefix) {
	var parts = propertyId.split('.');
	var lastPart = parts[parts.length - 1];
	parts[parts.length - 1] = lastPart.replace(prefix + '_', '');
	return parts.join('.');
}

function getAllLeafPaths(obj, prefix) {
    var paths = [];

    function recurse(current, path) {
      if (Array.isArray(current)) {
        current.forEach(function (item, index) {
          var newPath = path ? (path + "." + index) : String(index);
          recurse(item, newPath);
        });
  
      } else if (typeof current === 'object' && current !== null) {
        for (var key in current) {
          if (Object.prototype.hasOwnProperty.call(current, key)) {
            var newPath = path ? (path + "." + key) : key;
            recurse(current[key], newPath);
          }
        }
  
      } else {
        paths.push(path);
      }
    }
  
    recurse(obj, "");
    return paths;  
}

function isInteger(str) {
    return typeof str === 'string' && /^[0-9]+$/.test(str);
}

function processTemperature(payload) {
	var allTemperatureProperties = {
        "temperature_control_delta1": {
            "coefficient": 0.1,
            "constant": 0
        },
        "temperature_control_delta2": {
            "coefficient": 0.1,
            "constant": 0
        },
        "target_deadband": {
            "coefficient": 0.1,
            "constant": 0
        },
        "occupied_cooling_setpoint": {
            "coefficient": 0.1,
            "constant": 32
        },
        "occupied_heating_setpoint": {
            "coefficient": 0.1,
            "constant": 32
        },
        "unoccupied_cooling_setpoint": {
            "coefficient": 0.1,
            "constant": 32
        },
        "unoccupied_heating_setpoint": {
            "coefficient": 0.1,
            "constant": 32
        },
        "cooling_setpoint": {
            "coefficient": 0.1,
            "constant": 32
        },
        "heating_setpoint": {
            "coefficient": 0.1,
            "constant": 32
        },
        "occupied_cooling_setpoint_tolerance": {
            "coefficient": 0.1,
            "constant": 0
        },
        "occupied_heating_setpoint_tolerance": {
            "coefficient": 0.1,
            "constant": 0
        },
        "unoccupied_cooling_setpoint_tolerance": {
            "coefficient": 0.1,
            "constant": 0
        },
        "unoccupied_heating_setpoint_tolerance": {
            "coefficient": 0.1,
            "constant": 0
        },
        "cooling_setpoint_tolerance": {
            "coefficient": 0.1,
            "constant": 0
        },
        "heating_setpoint_tolerance": {
            "coefficient": 0.1,
            "constant": 0
        },
        "center_cool_temp": {
            "coefficient": 0.1,
            "constant": 32
        },
        "center_heat_temp": {
            "coefficient": 0.1,
            "constant": 32
        },
        "cooling_adjust_tolerance": {
            "coefficient": 0.1,
            "constant": 0
        },
        "heating_adjust_tolerance": {
            "coefficient": 0.1,
            "constant": 0
        }
    };
    var leafPaths = getAllLeafPaths(payload);    
	for (var i = 0; i < leafPaths.length; i++) {
        var propertyId = leafPaths[i];
        var propertyParts = propertyId.split('.');        
        var newPropertyParts = []
        for (var j = 0; j < propertyParts.length; j++) {
            var part = propertyParts[j];
            if (isInteger(part)) {
                newPropertyParts.push('_item');
            } else {
                newPropertyParts.push(part);
            }
        }
        var newPropertyId = newPropertyParts.join('.');
        newPropertyId = recoverName(newPropertyId, 'fahrenheit');
        newPropertyId = recoverName(newPropertyId, 'celsius');
        propertyId = recoverName(propertyId, 'fahrenheit');
        propertyId = recoverName(propertyId, 'celsius');
        if (allTemperatureProperties[newPropertyId]) {            
            var fahrenheitProperty = convertName(propertyId, 'fahrenheit');
            var celsiusProperty = convertName(propertyId, 'celsius');
            var stringCoefficient = String(allTemperatureProperties[newPropertyId].coefficient);
            var constant = allTemperatureProperties[newPropertyId].constant;
            var dotIndex = stringCoefficient.indexOf('.');
            var precision = dotIndex != -1 ? stringCoefficient.length - dotIndex - 1 : 0;
            if (!hasPath(payload, propertyId)) {
                if (hasPath(payload, fahrenheitProperty) && hasPath(payload, celsiusProperty)) { 
                    throw new Error(fahrenheitProperty + ' and ' + celsiusProperty + ' cannot be in payload at the same time');
                }
                if (hasPath(payload, fahrenheitProperty)) {
                    setPath(payload, propertyId, Number(((getPath(payload, fahrenheitProperty) - constant) / 1.8).toFixed(precision)));
                } else if (hasPath(payload, celsiusProperty)) {
                    setPath(payload, propertyId, Number(getPath(payload, celsiusProperty).toFixed(precision)));
                }
            }
        }
	}	
	return payload;
}
if (typeof encodeDownlink === "function") moduleExports.encodeDownlink = encodeDownlink;
})(exports);

if (typeof decodeUplink === "function") exports.decodeUplink = decodeUplink;
