/**
 * Payload Decoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product WT304
 */
var RAW_VALUE = 0x00;

// The Things Network
function Decoder(bytes, port) {
    return milesightDeviceDecode(bytes);
}
/* eslint-enable */

function milesightDeviceDecode(bytes) {
    var decoded = {};

    var unknown_command = 0;
    for (var i = 0; i < bytes.length;) {
        var command_id = bytes[i++];

        switch (command_id) {
            // attribute
            case 0xdf:
                decoded.tsl_version = readProtocolVersion(bytes.slice(i, i + 2));
                i += 2;
                break;
            case 0xde: // ?
                decoded.product_name = readString(bytes.slice(i, i + 32));
                i += 32;
                break;
            case 0xdd: // ?
                decoded.product_pn = readString(bytes.slice(i, i + 32));
                i += 32;
                break;
            case 0xdb:
                decoded.product_sn = readHexString(bytes.slice(i, i + 8));
                i += 8;
                break;
            case 0xda:
                decoded.version = {};
                decoded.version.hardware_version = readHardwareVersion(bytes.slice(i, i + 2));
                decoded.version.firmware_version = readFirmwareVersion(bytes.slice(i + 2, i + 8));
                i += 8;
                break;
            case 0xd9:
                decoded.oem_id = readHexString(bytes.slice(i, i + 2));
                i += 2;
                break;
            case 0xd8:
                decoded.product_frequency_band = readString(bytes.slice(i, i + 16));
                i += 16;
                break;
            case 0xee:
                decoded.device_request = 1;
                i += 0;
                break;
            case 0xc8:
                decoded.device_status = readDeviceStatus(bytes[i]);
                i += 1;
                break;
            case 0xcf:
                // skip 1 byte
                decoded.lorawan_class = readLoRaWANClass(bytes[i + 1]);
                i += 2;
                break;

            // telemetry
            case 0x01:
                decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 100;
                i += 2;
                break;
            case 0x02:
                decoded.humidity = readUInt16LE(bytes.slice(i, i + 2)) / 10;
                i += 2;
                break;
            case 0x03:
                decoded.target_temperature = readInt16LE(bytes.slice(i, i + 2)) / 100;
                i += 2;
                break;
            case 0x04:
                decoded.temperature_data_source = readTemperatureDataSource(bytes[i]);
                i += 1;
                break;
            case 0x05:
                var temperature_control_data = readUInt8(bytes[i]);
                decoded.temperature_control_status = readTemperatureControlStatus((temperature_control_data >>> 0) & 0x0F);
                decoded.temperature_control_mode = readTemperatureControlMode((temperature_control_data >>> 4) & 0x0F);
                i += 1;
                break;
            case 0x06:
                decoded.valve_status = readUInt8(bytes[i]);
                i += 1;
                break;
            case 0x07:
                var fan_data = readUInt8(bytes[i]);
                decoded.fan_status = readFanStatus((fan_data >>> 0) & 0x0F);
                decoded.fan_mode = readFanMode((fan_data >>> 4) & 0x0F);
                i += 1;
                break;
            case 0x08:
                decoded.plan_id = readPlanId(readUInt8(bytes[i]));
                i += 1;
                break;
            case 0x09:
                var alarm_type = readUInt8(bytes[i]);
                decoded.temperature_alarm = {};
                decoded.temperature_alarm.type = readTemperatureAlarmType(alarm_type);
                if (hasTemperature(alarm_type)) {
                    var temperature = readInt16LE(bytes.slice(i + 1, i + 3)) / 100;
                    decoded.temperature = temperature;
                    decoded.temperature_alarm.temperature = temperature;
                    i += 3;
                } else {
                    i += 1;
                }
                break;
            case 0x0a:
                decoded.humidity_alarm = readHumidityAlarm(bytes[i]);
                i += 1;
                break;
            case 0x0b:
                decoded.target_temperature_alarm = readTargetTemperatureAlarm(bytes[i]);
                i += 1;
                break;
            case 0x10:
                var relay_status_offset = { gl_status: 0, gm_status: 1, gh_status: 2, valve_1_status: 3, valve_2_status: 4 };
                var relay_status_data = readUInt32LE(bytes.slice(i, i + 4));
                decoded.relay_status = decoded.relay_status || {};
                for (var key in relay_status_offset) {
                    decoded.relay_status[key] = readEnableStatus((relay_status_data >>> relay_status_offset[key]) & 0x01);
                }
                i += 4;
                break;

            // config
            case 0x60:
                var time_unit = readUInt8(bytes[i]);
                decoded.collection_interval = {};
                decoded.collection_interval.unit = readTimeUnitType(time_unit);
                if (time_unit === 0) {
                    decoded.collection_interval.seconds_of_time = readUInt16LE(bytes.slice(i + 1, i + 3));
                } else if (time_unit === 1) {
                    decoded.collection_interval.minutes_of_time = readUInt16LE(bytes.slice(i + 1, i + 3));
                }
                i += 3;
                break;
            case 0x62:
                var time_unit = readUInt8(bytes[i]);
                decoded.reporting_interval = {};
                decoded.reporting_interval.unit = readTimeUnitType(time_unit);
                if (time_unit === 0) {
                    decoded.reporting_interval.seconds_of_time = readUInt16LE(bytes.slice(i + 1, i + 3));
                } else if (time_unit === 1) {
                    decoded.reporting_interval.minutes_of_time = readUInt16LE(bytes.slice(i + 1, i + 3));
                }
                i += 3;
                break;
            case 0x63:
                decoded.temperature_unit = readTemperatureUnit(bytes[i]);
                i += 1;
                break;
            case 0x64:
                decoded.support_mode = readSupportMode(bytes[i]);
                i += 1;
                break;
            case 0x65:
                decoded.intelligent_display_enable = readEnableStatus(bytes[i]);
                i += 1;
                break;
            case 0x66:
                decoded.screen_object_settings = decoded.screen_object_settings || {};
                decoded.screen_object_settings.enable = readEnableStatus(bytes[i]);
                var screen_object_data = readUInt8(bytes[i + 1]);
                var screen_object_offset = { environment_temperature_enable: 0, environment_humidity_enable: 1, target_temperature_enable: 2, schedule_name_enable: 3 };
                for (var key in screen_object_offset) {
                    decoded.screen_object_settings[key] = readEnableStatus((screen_object_data >>> screen_object_offset[key]) & 0x01);
                }
                i += 2;
                break;
            case 0x67:
                decoded.system_status = readSystemStatus(bytes[i]);
                i += 1;
                break;
            case 0x68:
                decoded.temperature_control_mode = readTemperatureControlMode(bytes[i]);
                i += 1;
                break;
            case 0x69:
                decoded.target_temperature_resolution = readTargetTemperatureResolution(bytes[i]);
                i += 1;
                break;
            case 0x6a:
                decoded.target_temperature_tolerance = readInt16LE(bytes.slice(i, i + 2)) / 100;
                i += 2;
                break;
            case 0x6b:
                decoded.heating_target_temperature = readInt16LE(bytes.slice(i, i + 2)) / 100;
                i += 2;
                break;
            case 0x6c:
                decoded.cooling_target_temperature = readInt16LE(bytes.slice(i, i + 2)) / 100;
                i += 2;
                break;
            case 0x6d:
                decoded.heating_target_temperature_range = {};
                decoded.heating_target_temperature_range.min = readInt16LE(bytes.slice(i, i + 2)) / 100;
                decoded.heating_target_temperature_range.max = readInt16LE(bytes.slice(i + 2, i + 4)) / 100;
                i += 4;
                break;
            case 0x6e:
                decoded.cooling_target_temperature_range = {};
                decoded.cooling_target_temperature_range.min = readInt16LE(bytes.slice(i, i + 2)) / 100;
                decoded.cooling_target_temperature_range.max = readInt16LE(bytes.slice(i + 2, i + 4)) / 100;
                i += 4;
                break;
            case 0x6f:
                decoded.dehumidify_config = {};
                decoded.dehumidify_config.enable = readEnableStatus(bytes[i]);
                decoded.dehumidify_config.temperature_tolerance = readInt16LE(bytes.slice(i + 1, i + 3)) / 100;
                i += 3;
                break;
            case 0x70:
                decoded.target_humidity_range = {};
                decoded.target_humidity_range.min = readUInt16LE(bytes.slice(i, i + 2)) / 10;
                decoded.target_humidity_range.max = readUInt16LE(bytes.slice(i + 2, i + 4)) / 10;
                i += 4;
                break;
            case 0x72:
                decoded.fan_mode = readFanMode(bytes[i]);
                i += 1;
                break;
            case 0x73:
                decoded.fan_speed_config = {};
                decoded.fan_speed_config.delta_1 = readInt16LE(bytes.slice(i, i + 2)) / 100;
                decoded.fan_speed_config.delta_2 = readInt16LE(bytes.slice(i + 2, i + 4)) / 100;
                i += 4;
                break;
            case 0x74:
                decoded.fan_delay_config = {};
                decoded.fan_delay_config.enable = readEnableStatus(bytes[i]);
                decoded.fan_delay_config.delay_time = readUInt16LE(bytes.slice(i + 1, i + 3));
                i += 3;
                break;
            case 0x75:
                var child_lock_offset = { system_button: 0, temperature_button: 1, fan_button: 2, temperature_control_button: 3, reboot_reset_button: 4 };
                decoded.child_lock_settings = {};
                decoded.child_lock_settings.enable = readEnableStatus(bytes[i]);
                var child_lock_data = readUInt8(bytes[i + 1]);
                for (var key in child_lock_offset) {
                    decoded.child_lock_settings[key] = readEnableStatus((child_lock_data >>> child_lock_offset[key]) & 0x01);
                }
                i += 2;
                break;
            case 0x76:
                decoded.temperature_alarm_settings = {};
                decoded.temperature_alarm_settings.enable = readEnableStatus(bytes[i]);
                decoded.temperature_alarm_settings.threshold_condition = readMathConditionType(readUInt8(bytes[i + 1]));
                decoded.temperature_alarm_settings.threshold_min = readInt16LE(bytes.slice(i + 2, i + 4)) / 100;
                decoded.temperature_alarm_settings.threshold_max = readInt16LE(bytes.slice(i + 4, i + 6)) / 100;
                i += 6;
                break;
            case 0x77:
                decoded.high_temperature_alarm_settings = {};
                decoded.high_temperature_alarm_settings.enable = readEnableStatus(bytes[i]);
                decoded.high_temperature_alarm_settings.delta_temperature = readInt16LE(bytes.slice(i + 1, i + 3)) / 100;
                decoded.high_temperature_alarm_settings.duration = readUInt8(bytes[i + 3]);
                i += 4;
                break;
            case 0x78:
                decoded.low_temperature_alarm_settings = {};
                decoded.low_temperature_alarm_settings.enable = readEnableStatus(bytes[i]);
                decoded.low_temperature_alarm_settings.delta_temperature = readInt16LE(bytes.slice(i + 1, i + 3)) / 100;
                decoded.low_temperature_alarm_settings.duration = readUInt8(bytes[i + 3]);
                i += 4;
                break;
            case 0x79:
                decoded.temperature_calibration_config = {};
                decoded.temperature_calibration_config.enable = readEnableStatus(bytes[i]);
                decoded.temperature_calibration_config.calibration_value = readInt16LE(bytes.slice(i + 1, i + 3)) / 100;
                i += 3;
                break;
            case 0x7a:
                decoded.humidity_calibration_config = {};
                decoded.humidity_calibration_config.enable = readEnableStatus(bytes[i]);
                decoded.humidity_calibration_config.calibration_value = readInt16LE(bytes.slice(i + 1, i + 3)) / 10;
                i += 3;
                break;
            case 0x7b:
                var plan_config = {};
                plan_config.plan_id = readUInt8(bytes[i]) + 1;
                var data = readUInt8(bytes[i + 1]);
                if (data === 0x00) {
                    plan_config.enable = readEnableStatus(bytes[i + 2]);
                    i += 3;
                } else if (data === 0x01) {
                    plan_config.name_first = readString(bytes.slice(i + 2, i + 8));
                    i += 8;
                } else if (data === 0x02) {
                    plan_config.name_last = readString(bytes.slice(i + 2, i + 6));
                    i += 6;
                } else if (data === 0x03) {
                    var fan_mode_data = readUInt8(bytes[i + 2]);
                    var heating_temperature_data = readInt16LE(bytes.slice(i + 3, i + 5));
                    var cooling_temperature_data = readInt16LE(bytes.slice(i + 5, i + 7));
                    var temperature_tolerance_data = readInt16LE(bytes.slice(i + 7, i + 9));
                    plan_config.fan_mode = readFanMode(fan_mode_data);
                    plan_config.heating_temperature = (heating_temperature_data >>> 1) / 100;
                    plan_config.cooling_temperature = (cooling_temperature_data >>> 1) / 100;
                    plan_config.temperature_tolerance = (temperature_tolerance_data >>> 1) / 100;
                    plan_config.heating_temperature_enable = readEnableStatus((heating_temperature_data >>> 0) & 0x01);
                    plan_config.cooling_temperature_enable = readEnableStatus((cooling_temperature_data >>> 0) & 0x01);
                    plan_config.temperature_tolerance_enable = readEnableStatus((temperature_tolerance_data >>> 0) & 0x01);
                    i += 9;
                } else if (data === 0x04) {
                    var schedule_config = {};
                    schedule_config.index = readUInt8(bytes[i + 2]) + 1;
                    schedule_config.enable = readEnableStatus(bytes[i + 3]);
                    schedule_config.time = readUInt16LE(bytes.slice(i + 4, i + 6));
                    var data = readUInt8(bytes[i + 6]);
                    var weekday_bits_offset = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
                    schedule_config.weekday = {};
                    for (var key in weekday_bits_offset) {
                        schedule_config.weekday[key] = readEnableStatus((data >>> weekday_bits_offset[key]) & 0x01);
                    }
                    i += 7;
                    plan_config.schedule_config = plan_config.schedule_config || [];
                    plan_config.schedule_config.push(schedule_config);
                }
                decoded.plan_config = decoded.plan_config || [];
                decoded.plan_config.push(plan_config);
                break;
            case 0x7c:
                var mode_value = readUInt8(bytes[i]);
                decoded.valve_interface_settings = {};
                decoded.valve_interface_settings.mode = readValveInterfaceMode(mode_value);
                // four_pipe_two_wire
                if (mode_value === 0x00) {
                    decoded.valve_interface_settings.four_pipe_voltage = {};
                    decoded.valve_interface_settings.four_pipe_voltage.cooling_valve = readValve(bytes[i + 1]);
                    decoded.valve_interface_settings.four_pipe_voltage.heating_valve = readValve(bytes[i + 2]);
                    i += 3;
                }
                // two_pipe_voltage
                else if (mode_value === 0x01) {
                    decoded.valve_interface_settings.two_pipe_voltage = {};
                    decoded.valve_interface_settings.two_pipe_voltage.control_valve = readValve(bytes[i + 1]);
                    i += 2;
                }
                // two_pipe_voltage_ec
                else if (mode_value === 0x02) {
                    decoded.valve_interface_settings.two_pipe_voltage_ec = {};
                    decoded.valve_interface_settings.two_pipe_voltage_ec.control_valve = readValve(bytes[i + 1]);
                    decoded.valve_interface_settings.two_pipe_voltage_ec.ec = readValve(bytes[i + 2]);
                    decoded.valve_interface_settings.two_pipe_voltage_ec.ec_power = readValve2Type(bytes[i + 3]);
                    i += 4;
                }
                // four_pipe_two_wire_ec
                else if (mode_value === 0x03) {
                    decoded.valve_interface_settings.four_pipe_two_wire_ec = {};
                    decoded.valve_interface_settings.four_pipe_two_wire_ec.cooling_valve = readValve2Type(bytes[i + 1]);
                    decoded.valve_interface_settings.four_pipe_two_wire_ec.heating_valve = readValve2Type(bytes[i + 2]);
                    decoded.valve_interface_settings.four_pipe_two_wire_ec.ec = readValve(bytes[i + 3]);
                    decoded.valve_interface_settings.four_pipe_two_wire_ec.ec_power = readValve2Type(bytes[i + 4]);
                    i += 5;
                }
                // two_pipe_two_wire_ec
                else if (mode_value === 0x04) {
                    decoded.valve_interface_settings.two_pipe_two_wire_ec = {};
                    decoded.valve_interface_settings.two_pipe_two_wire_ec.control_valve = readValve2Type(bytes[i + 1]);
                    decoded.valve_interface_settings.two_pipe_two_wire_ec.ec = readValve(bytes[i + 2]);
                    decoded.valve_interface_settings.two_pipe_two_wire_ec.ec_power = readValve2Type(bytes[i + 3]);
                    i += 4;
                }
                else if (mode_value === 0x05) {
                    decoded.valve_interface_settings.two_pipe_three_wire_ec = {};
                    decoded.valve_interface_settings.two_pipe_three_wire_ec.no = readValve2Type(bytes[i + 1]);
                    decoded.valve_interface_settings.two_pipe_three_wire_ec.nc = readValve2Type(bytes[i + 2]);
                    decoded.valve_interface_settings.two_pipe_three_wire_ec.ec = readValve(bytes[i + 3]);
                    decoded.valve_interface_settings.two_pipe_three_wire_ec.ec_power = readValve2Type(bytes[i + 4]);
                    i += 5;
                }
                break;
            case 0x7d:
                var valve_opening_data = readUInt8(bytes[i]);
                decoded.valve_control_settings = decoded.valve_control_settings || {};
                if (valve_opening_data === 0x00) {
                    decoded.valve_control_settings.adjustment_range = readInt16LE(bytes.slice(i + 1, i + 3)) / 100;
                    i += 3;
                }
                else if (valve_opening_data === 0x01) {
                    decoded.valve_control_settings.opening_range = {};
                    decoded.valve_control_settings.opening_range.min = readUInt8(bytes[i + 1]);
                    decoded.valve_control_settings.opening_range.max = readUInt8(bytes[i + 2]);
                    i += 3;
                }
                else if (valve_opening_data === 0x02) {
                    decoded.valve_control_settings.control_time_interval = readUInt8(bytes[i + 1]);
                    i += 2;
                }
                break;
            case 0x7e:
                var fan_control_data = readUInt8(bytes[i]);
                decoded.fan_control_settings = decoded.fan_control_settings || {};
                if (fan_control_data === 0x00) {
                    decoded.fan_control_settings.low_threshold = readUInt8(bytes[i + 1]);
                    i += 2;
                }
                else if (fan_control_data === 0x01) {
                    decoded.fan_control_settings.medium_threshold = readUInt8(bytes[i + 1]);
                    i += 2;
                }
                else if (fan_control_data === 0x02) {
                    decoded.fan_control_settings.high_threshold = readUInt8(bytes[i + 1]);
                    i += 2;
                }
                break;
            case 0x80:
                decoded.di_settings = decoded.di_settings || {};
                decoded.di_settings.enable = readEnableStatus(bytes[i]);
                i += 1;
                break;
            case 0x81:
                decoded.di_settings = decoded.di_settings || {};
                var di_settings_type = readUInt8(bytes[i]);
                decoded.di_settings.type = readDIType(di_settings_type);
                if (di_settings_type === 0) {
                    decoded.di_settings.card_control = {};
                    var card_control_data = readUInt8(bytes[i + 1]);
                    decoded.di_settings.card_control.mode = readCardControlMode(card_control_data);
                    // power mode
                    if (card_control_data === 0x00) {
                        decoded.di_settings.card_control.system_status = readSystemStatus(bytes[i + 2]);
                        i += 3;
                    }
                    // plan mode
                    else if (card_control_data === 0x01) {
                        decoded.di_settings.card_control.in_plan_id = readUInt8(bytes[i + 2]) + 1;
                        decoded.di_settings.card_control.out_plan_id = readUInt8(bytes[i + 3]) + 1;
                        i += 4;
                    }
                } else if (di_settings_type === 1) {
                    decoded.di_settings.magnet_detection = {};
                    var magnet_detection_data = readUInt8(bytes[i + 1]);
                    decoded.di_settings.magnet_detection.mode = readMagnetDetectionMode(magnet_detection_data);
                    i += 2;
                }
                break;
            case 0x82:
                decoded.window_opening_detection_settings = decoded.window_opening_detection_settings || {};
                decoded.window_opening_detection_settings.enable = readEnableStatus(bytes[i]);
                i += 1;
                break;
            case 0x83:
                decoded.window_opening_detection_settings = decoded.window_opening_detection_settings || {};
                var data = readUInt8(bytes[i]);
                decoded.window_opening_detection_settings.type = readWindowOpeningDetectionType(data);
                // temperature detection
                if (data === 0x00) {
                    decoded.window_opening_detection_settings.temperature_detection = {};
                    decoded.window_opening_detection_settings.temperature_detection.delta_temperature = readInt16LE(bytes.slice(i + 1, i + 3)) / 100;
                    decoded.window_opening_detection_settings.temperature_detection.duration = readUInt8(bytes[i + 3]);
                    i += 4;
                }
                // magnet detection
                else if (data === 0x01) {
                    decoded.window_opening_detection_settings.magnet_detection = {};
                    decoded.window_opening_detection_settings.magnet_detection.duration = readUInt8(bytes[i + 1]);
                    i += 2;
                }
                break;
            case 0x84:
                decoded.freeze_protection_settings = decoded.freeze_protection_settings || {};
                decoded.freeze_protection_settings.enable = readEnableStatus(bytes[i]);
                decoded.freeze_protection_settings.target_temperature = readInt16LE(bytes.slice(i + 1, i + 3)) / 100;
                i += 3;
                break;
            case 0x85:
                decoded.temperature_source_settings = decoded.temperature_source_settings || {};
                var data_source = readUInt8(bytes[i]);
                decoded.temperature_source_settings.source = readTemperatureDataSource(data_source);
                if (data_source === 0 || data_source === 1) {
                    i += 1;
                } else if (data_source === 2 || data_source === 3) {
                    decoded.temperature_source_settings.duration = readUInt8(bytes[i + 1]);
                    decoded.temperature_source_settings.missing_data_action = readMissingDataAction(bytes[i + 2]);
                    i += 3;
                }
                break;
            case 0x86:
                decoded.d2d_pairing_enable = readEnableStatus(bytes[i]);
                i += 1;
                break;
            case 0x87:
                var d2d_pairing_settings = {};
                d2d_pairing_settings.index = readUInt8(bytes[i]) + 1;
                var data = readUInt8(bytes[i + 1]);
                if (data === 0x00) {
                    d2d_pairing_settings.enable = readEnableStatus(bytes[i + 2]);
                    i += 3;
                } else if (data === 0x01) {
                    d2d_pairing_settings.eui = readHexString(bytes.slice(i + 2, i + 10));
                    i += 10;
                } else if (data === 0x02) {
                    d2d_pairing_settings.name_first = readString(bytes.slice(i + 2, i + 10));
                    i += 10;
                } else if (data === 0x03) {
                    d2d_pairing_settings.name_last = readString(bytes.slice(i + 2, i + 10));
                    i += 10;
                }
                decoded.d2d_pairing_settings = decoded.d2d_pairing_settings || [];
                decoded.d2d_pairing_settings.push(d2d_pairing_settings);
                break;
            case 0x88:
                decoded.d2d_master_enable = readEnableStatus(bytes[i]);
                i += 1;
                break;
            case 0x89:
                var trigger_source_data = readUInt8(bytes[i]);
                var d2d_master_settings = {};
                d2d_master_settings.trigger_source = readD2DTriggerSource(trigger_source_data);
                d2d_master_settings.enable = readEnableStatus(bytes[i + 1]);
                d2d_master_settings.lora_uplink_enable = readEnableStatus(bytes[i + 2]);
                d2d_master_settings.command = readHexStringLE(bytes.slice(i + 3, i + 5));
                d2d_master_settings.time_enable = readEnableStatus(bytes[i + 5]);
                d2d_master_settings.time = readUInt16LE(bytes.slice(i + 6, i + 8));
                i += 8;
                decoded.d2d_master_settings = decoded.d2d_master_settings || [];
                decoded.d2d_master_settings.push(d2d_master_settings);
                break;
            case 0x8a:
                decoded.d2d_slave_enable = readEnableStatus(bytes[i]);
                i += 1;
                break;
            case 0x8b:
                var d2d_slave_settings = {};
                d2d_slave_settings.index = readUInt8(bytes[i]) + 1;
                d2d_slave_settings.enable = readEnableStatus(bytes[i + 1]);
                d2d_slave_settings.command = readHexStringLE(bytes.slice(i + 2, i + 4));
                d2d_slave_settings.trigger_target = readD2DTriggerTarget(bytes[i + 4]);
                i += 5;
                decoded.d2d_slave_settings = decoded.d2d_slave_settings || [];
                decoded.d2d_slave_settings.push(d2d_slave_settings);
                break;
            case 0x8c:
                var type = readUInt8(bytes[i]);
                decoded.timed_system_control_settings = decoded.timed_system_control_settings || {};
                if (type === 0) {
                    decoded.timed_system_control_settings.enable = readEnableStatus(bytes[i + 1]);
                    i += 2;
                } else if (type === 1) {
                    var start_cycle_settings = {};
                    start_cycle_settings.index = readUInt8(bytes[i + 1]) + 1;
                    start_cycle_settings.enable = readEnableStatus(bytes[i + 2]);
                    start_cycle_settings.time = readUInt16LE(bytes.slice(i + 3, i + 5));
                    var weekday_data = readUInt8(bytes[i + 5]);
                    var weekday_bits_offset = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
                    start_cycle_settings.weekday = {};
                    for (var key in weekday_bits_offset) {
                        start_cycle_settings.weekday[key] = readEnableStatus((weekday_data >>> weekday_bits_offset[key]) & 0x01);
                    }
                    i += 6;
                    decoded.timed_system_control_settings.start_cycle_settings = decoded.timed_system_control_settings.start_cycle_settings || [];
                    decoded.timed_system_control_settings.start_cycle_settings.push(start_cycle_settings);
                } else if (type === 2) {
                    var end_cycle_settings = {};
                    end_cycle_settings.index = readUInt8(bytes[i + 1]) + 1;
                    end_cycle_settings.enable = readEnableStatus(bytes[i + 2]);
                    end_cycle_settings.time = readUInt16LE(bytes.slice(i + 3, i + 5));
                    var weekday_data = readUInt8(bytes[i + 5]);
                    var week_bits_offset = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
                    end_cycle_settings.weekday = {};
                    for (var key in week_bits_offset) {
                        end_cycle_settings.weekday[key] = readEnableStatus((weekday_data >>> week_bits_offset[key]) & 0x01);
                    }
                    i += 6;
                    decoded.timed_system_control_settings.end_cycle_settings = decoded.timed_system_control_settings.end_cycle_settings || [];
                    decoded.timed_system_control_settings.end_cycle_settings.push(end_cycle_settings);
                }
                break;
            case 0x8d:
                var data = readUInt8(bytes[i]);
                var unlock_bits_offset = { system_button: 0, temperature_up_button: 1, temperature_down_button: 2, fan_button: 3, temperature_control_mode_button: 4 };
                decoded.temporary_unlock_settings = decoded.temporary_unlock_settings || {};
                for (var key in unlock_bits_offset) {
                    decoded.temporary_unlock_settings[key] = readEnableStatus((data >>> unlock_bits_offset[key]) & 0x01);
                }
                decoded.temporary_unlock_settings.duration = readUInt16LE(bytes.slice(i + 1, i + 3));
                i += 3;
                break;
            case 0x8e:
                decoded.temperature_control_with_standby_fan_mode = readTemperatureControlWithStandbyFanMode(bytes[i]);
                i += 1;
                break;
            case 0x8f:
                decoded.valve_opening_negative_valve_mode = readValveOpeningNegativeValveMode(bytes[i]);
                i += 1;
                break;
            case 0x90:
                decoded.relay_changes_report_enable = readEnableStatus(bytes[i]);
                i += 1;
                break;

            case 0xc4:
                decoded.auto_provisioning_enable = readEnableStatus(bytes[i]);
                i += 1;
                break;
            case 0xc5:
                decoded.history_transmit_settings = decoded.history_transmit_settings || {};
                var data = readUInt8(bytes[i]);
                if (data === 0x00) {
                    decoded.history_transmit_settings.enable = readEnableStatus(bytes[i + 1]);
                    i += 2;
                }
                else if (data === 0x01) {
                    decoded.history_transmit_settings.retransmission_interval = readUInt16LE(bytes.slice(i + 1, i + 3));
                    i += 3;
                }
                else if (data === 0x02) {
                    decoded.history_transmit_settings.resend_interval = readUInt16LE(bytes.slice(i + 1, i + 3));
                    i += 3;
                }
                break;
            case 0xc6:
                decoded.daylight_saving_time = {};
                decoded.daylight_saving_time.enable = readEnableStatus(bytes[i]);
                decoded.daylight_saving_time.offset = readUInt8(bytes[i + 1]);
                decoded.daylight_saving_time.start_month = readUInt8(bytes[i + 2]);
                var start_day_value = readUInt8(bytes[i + 3]);
                decoded.daylight_saving_time.start_week_num = (start_day_value >>> 4) & 0x07;
                decoded.daylight_saving_time.start_week_day = start_day_value & 0x0f;
                decoded.daylight_saving_time.start_hour_min = readUInt16LE(bytes.slice(i + 4, i + 6));
                decoded.daylight_saving_time.end_month = readUInt8(bytes[i + 6]);
                var end_day_value = readUInt8(bytes[i + 7]);
                decoded.daylight_saving_time.end_week_num = (end_day_value >>> 4) & 0x0f;
                decoded.daylight_saving_time.end_week_day = end_day_value & 0x0f;
                decoded.daylight_saving_time.end_hour_min = readUInt16LE(bytes.slice(i + 8, i + 10));
                i += 10;
                break;
            case 0xc7:
                decoded.time_zone = readTimeZone(readInt16LE(bytes.slice(i, i + 2)));
                i += 2;
                break;

            // services
            case 0xb6:
                decoded.reconnect = readYesNoStatus(1);
                break;
            case 0xb8:
                decoded.synchronize_time = readYesNoStatus(1);
                break;
            case 0xb9:
                decoded.query_device_status = readYesNoStatus(1);
                break;
            case 0xba:
                decoded.fetch_history = decoded.fetch_history || {};
                decoded.fetch_history.start_time = readUInt32LE(bytes.slice(i, i + 4));
                i += 4;
                break;
            case 0xbb:
                decoded.fetch_history = decoded.fetch_history || {};
                decoded.fetch_history.start_time = readUInt32LE(bytes.slice(i, i + 4));
                decoded.fetch_history.end_time = readUInt32LE(bytes.slice(i + 4, i + 8));
                i += 8;
                break;
            case 0xbc:
                decoded.stop_transmit_history = readYesNoStatus(1);
                break;
            case 0xbd:
                decoded.clear_history = readYesNoStatus(1);
                break;
            case 0xbe:
                decoded.reboot = readYesNoStatus(1);
                break;
            case 0x5b:
                decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 100;
                i += 2;
                break;
            case 0x5c:
                decoded.humidity = readInt16LE(bytes.slice(i, i + 2)) / 10;
                i += 2;
                break;
            case 0x5d:
                decoded.opening_window_alarm = readOpenWindowAlarm(bytes[i]);
                i += 1;
                break;
            case 0x5e:
                decoded.insert_plan_id = readUInt8(bytes[i]) + 1;
                i += 1;
                break;
            case 0x5f:
                decoded.clear_plan = decoded.clear_plan || {};
                var plan_data = readUInt8(bytes[i]);
                var plan_offset = { 0: "plan_1", 1: "plan_2", 2: "plan_3", 3: "plan_4", 4: "plan_5", 5: "plan_6", 6: "plan_7", 7: "plan_8", 8: "plan_9", 9: "plan_10", 10: "plan_11", 11: "plan_12", 12: "plan_13", 13: "plan_14", 14: "plan_15", 15: "plan_16", 255: "all" };
                decoded.clear_plan[plan_offset[plan_data]] = readYesNoStatus(1);
                i += 1;
                break;

            // control frame
            case 0xEF:
                var cmd_data = readUInt8(bytes[i]);
                var cmd_result = (cmd_data >>> 4) & 0x0f;
                var cmd_length = cmd_data & 0x0f;
                var cmd_id = readHexString(bytes.slice(i + 1, i + 1 + cmd_length));
                var cmd_header = readHexString(bytes.slice(i + 1, i + 2));
                i += 1 + cmd_length;

                var response = {};
                response.result = readCmdResult(cmd_result);
                response.cmd_id = cmd_id;
                response.cmd_name = readCmdName(cmd_header);

                decoded.request_result = decoded.request_result || [];
                decoded.request_result.push(response);
                break;
            case 0xFE:
                decoded.frame = readUInt8(bytes[i]);
                i += 1;
                break;
            default:
                unknown_command = 1;
                break;
        }

        if (unknown_command) {
            throw new Error("unknown command: " + command_id);
        }
    }

    return decoded;
}

function readProtocolVersion(bytes) {
    var major = bytes[0] & 0xff;
    var minor = bytes[1] & 0xff;
    return "v" + major + "." + minor;
}

function readHardwareVersion(bytes) {
    var major = bytes[0] & 0xff;
    var minor = bytes[1] & 0xff;
    return "v" + major + "." + minor;
}

function readFirmwareVersion(bytes) {
    var major = bytes[0] & 0xff;
    var minor = bytes[1] & 0xff;
    var release = bytes[2] & 0xff;
    var alpha = bytes[3] & 0xff;
    var unit_test = bytes[4] & 0xff;
    var test = bytes[5] & 0xff;

    var version = "v" + major + "." + minor;
    if (release !== 0) version += "-r" + release;
    if (alpha !== 0) version += "-a" + alpha;
    if (unit_test !== 0) version += "-u" + unit_test;
    if (test !== 0) version += "-t" + test;
    return version;
}

function readDeviceStatus(type) {
    var device_status_map = { 0: "off", 1: "on" };
    return getValue(device_status_map, type);
}

function readLoRaWANClass(type) {
    var lorawan_class_map = {
        0: "Class A",
        1: "Class B",
        2: "Class C",
        3: "Class CtoB",
    };
    return getValue(lorawan_class_map, type);
}

function readYesNoStatus(type) {
    var yes_no_map = { 0: "no", 1: "yes" };
    return getValue(yes_no_map, type);
}

function readEnableStatus(type) {
    var enable_map = { 0: "disable", 1: "enable" };
    return getValue(enable_map, type);
}

function readTemperatureDataSource(type) {
    var source_map = { 0: "internal", 1: "ntc", 2: "lorawan", 3: "d2d" };
    return getValue(source_map, type);
}

function readMissingDataAction(type) {
    var action_map = { 0: "hold", 1: "off_or_fan_control", 2: "switch_to_internal" };
    return getValue(action_map, type);
}

function readTemperatureControlStatus(type) {
    var status_map = { 0: "standby", 1: "heating", 2: "cooling" };
    return getValue(status_map, type);
}

function readTemperatureControlMode(type) {
    var mode_map = { 0: "fan", 1: "heating", 2: "cooling" };
    return getValue(mode_map, type);
}

function readFanMode(type) {
    var mode_map = { 0: "auto", 1: "low", 2: "medium", 3: "high" };
    return getValue(mode_map, type);
}

function readPlanId(type) {
    var plan_id_map = { 0: "plan_1", 1: "plan_2", 2: "plan_3", 3: "plan_4", 4: "plan_5", 5: "plan_6", 6: "plan_7", 7: "plan_8", 8: "plan_9", 9: "plan_10", 10: "plan_11", 11: "plan_12", 12: "plan_13", 13: "plan_14", 14: "plan_15", 15: "plan_16", 255: "no_plan" };
    return getValue(plan_id_map, type);
}

function readFanStatus(type) {
    var status_map = { 0: "off", 1: "low", 2: "medium", 3: "high" };
    return getValue(status_map, type);
}

function readTemperatureAlarmType(type) {
    var type_map = {
        0: "collection error",                              // 0x00
        1: "lower range error",                             // 0x01
        2: "over range error",                              // 0x02
        3: "no data",                                       // 0x03
        16: "below threshold temperature alarm release",    // 0x10
        17: "below threshold temperature alarm",            // 0x11
        18: "above threshold temperature alarm release",    // 0x12
        19: "above threshold temperature alarm",            // 0x13
        20: "between threshold temperature alarm release",  // 0x14
        21: "between threshold temperature alarm",          // 0x15
        22: "outside threshold temperature alarm release",  // 0x16
        23: "outside threshold temperature alarm",          // 0x17
        32: "continuous low temperature alarm release",     // 0x20
        33: "continuous low temperature alarm",             // 0x21
        34: "continuous high temperature alarm release",    // 0x22
        35: "continuous high temperature alarm",            // 0x23
        48: "freeze alarm release",                         // 0x30
        49: "freeze alarm",                                 // 0x31
        50: "window open alarm release",                    // 0x32
        51: "window open alarm",                            // 0x33
    };
    return getValue(type_map, type);
}

function hasTemperature(alarm_type) {
    return alarm_type === 0x10 // (below threshold) temperature alarm release
        || alarm_type === 0x11 // (below threshold) temperature alarm
        || alarm_type === 0x12 // (above threshold) temperature alarm release
        || alarm_type === 0x13 // (above threshold) temperature alarm
        || alarm_type === 0x14 // (between threshold) continuous temperature alarm release
        || alarm_type === 0x15 // (between threshold) continuous temperature alarm
        || alarm_type === 0x16 // (outside threshold) continuous temperature alarm release
        || alarm_type === 0x17 // (outside threshold) continuous temperature alarm
        || alarm_type === 0x20 // continuous low temperature alarm release
        || alarm_type === 0x21 // continuous low temperature alarm
        || alarm_type === 0x22 // continuous high temperature alarm release
        || alarm_type === 0x23 // continuous high temperature alarm
        || alarm_type === 0x30 // freeze alarm release
        || alarm_type === 0x31 // freeze alarm
        || alarm_type === 0x32 // window open alarm release
        || alarm_type === 0x33 // window open alarm
}

function readHumidityAlarm(type) {
    var type_map = {
        0: "collection error",  // 0x00
        1: "lower range error", // 0x01
        2: "over range error",  // 0x02
        3: "no data",           // 0x03
    };
    return getValue(type_map, type);
}

function readTargetTemperatureAlarm(type) {
    var type_map = {
        3: "no data",           // 0x03
    };
    return getValue(type_map, type);
}

function readTimeUnitType(type) {
    var unit_map = { 0: "second", 1: "minute" };
    return getValue(unit_map, type);
}

function readTemperatureUnit(type) {
    var unit_map = { 0: "celsius", 1: "fahrenheit" };
    return getValue(unit_map, type);
}

function readSupportMode(type) {
    var mode_map = { 3: "fan_and_heating", 5: "fan_and_cooling", 7: "fan_and_heating_and_cooling" };
    return getValue(mode_map, type);
}

function readSystemStatus(type) {
    var status_map = { 0: "off", 1: "on" };
    return getValue(status_map, type);
}

function readTargetTemperatureResolution(type) {
    var resolution_map = { 0: 0.5, 1: 1 };
    return getValue(resolution_map, type);
}

function readMathConditionType(type) {
    var condition_map = { 0: "disable", 1: "below", 2: "above", 3: "between", 4: "outside" };
    return getValue(condition_map, type);
}

function readValveInterfaceMode(type) {
    var mode_map = { 0: "four_pipe_voltage", 1: "two_pipe_voltage", 2: "two_pipe_voltage_ec", 3: "four_pipe_two_wire_ec", 4: "two_pipe_two_wire_ec", 5: "two_pipe_three_wire_ec" };
    return getValue(mode_map, type);
}

function readValve(type) {
    var valve_map = { 0: "valve_1", 1: "valve_2" };
    return getValue(valve_map, type);
}

function readValve2Type(type) {
    var power_map = { 0: "none", 3: "low", 4: "medium", 5: "high" };
    return getValue(power_map, type);
}

function readDIType(type) {
    var type_map = { 0: "card_control", 1: "magnet_detection" };
    return getValue(type_map, type);
}

function readMagnetDetectionMode(type) {
    var mode_map = { 0: "normally_close", 1: "normally_open" };
    return getValue(mode_map, type);
}

function readCardControlMode(type) {
    var mode_map = { 0: "power", 1: "plan" };
    return getValue(mode_map, type);
}

function readWindowOpeningDetectionType(type) {
    var type_map = { 0: "temperature_detection", 1: "magnet_detection" };
    return getValue(type_map, type);
}

function readD2DTriggerSource(type) {
    var source_map = { 0: "plan_1", 1: "plan_2", 2: "plan_3", 3: "plan_4", 4: "plan_5", 5: "plan_6", 6: "plan_7", 7: "plan_8", 8: "plan_9", 9: "plan_10", 10: "plan_11", 11: "plan_12", 12: "plan_13", 14: "plan_15", 15: "plan_16", 16: "system_status_off", 17: "system_status_on" };
    return getValue(source_map, type);
}

function readOpenWindowAlarm(type) {
    var alarm_map = { 0: "release", 1: "trigger" };
    return getValue(alarm_map, type);
}

function readD2DTriggerTarget(type) {
    var trigger_target_map = { 0: "plan_1", 1: "plan_2", 2: "plan_3", 3: "plan_4", 4: "plan_5", 5: "plan_6", 6: "plan_7", 7: "plan_8", 8: "plan_9", 9: "plan_10", 10: "plan_11", 11: "plan_12", 12: "plan_13", 14: "plan_15", 15: "plan_16", 16: "system_status_off", 17: "system_status_on" };
    return getValue(trigger_target_map, type);
}

function readTemperatureControlWithStandbyFanMode(type) {
    var mode_map = { 0: "low", 1: "stop" };
    return getValue(mode_map, type);
}

function readValveOpeningNegativeValveMode(type) {
    var mode_map = { 0: "low", 1: "stop" };
    return getValue(mode_map, type);
}

function readTimeZone(type) {
    var timezone_map = { "-720": "UTC-12:00", "-660": "UTC-11:00", "-600": "UTC-10:00", "-570": "UTC-09:30", "-540": "UTC-09:00", "-480": "UTC-08:00", "-420": "UTC-07:00", "-360": "UTC-06:00", "-300": "UTC-05:00", "-240": "UTC-04:00", "-210": "UTC-03:30", "-180": "UTC-03:00", "-120": "UTC-02:00", "-60": "UTC-01:00", 0: "UTC+00:00", 60: "UTC+01:00", 120: "UTC+02:00", 180: "UTC+03:00", 210: "UTC+03:30", 240: "UTC+04:00", 270: "UTC+04:30", 300: "UTC+05:00", 330: "UTC+05:30", 345: "UTC+05:45", 360: "UTC+06:00", 390: "UTC+06:30", 420: "UTC+07:00", 480: "UTC+08:00", 540: "UTC+09:00", 570: "UTC+09:30", 600: "UTC+10:00", 630: "UTC+10:30", 660: "UTC+11:00", 720: "UTC+12:00", 765: "UTC+12:45", 780: "UTC+13:00", 840: "UTC+14:00" };
    return getValue(timezone_map, type);
}

function readCmdResult(type) {
    var result_map = { 0: "success", 1: "parsing error", 2: "order error", 3: "password error", 4: "read params error", 5: "write params error", 6: "read execution error", 7: "write execution error", 8: "read apply error", 9: "write apply error", 10: "associative error" };
    return getValue(result_map, type);
}

function readCmdName(type) {
    var name_map = {
        "60": { "level": 1, "name": "collection_interval" },
        "62": { "level": 1, "name": "reporting_interval" },
        "63": { "level": 1, "name": "temperature_unit" },
        "64": { "level": 1, "name": "support_mode" },
        "65": { "level": 1, "name": "intelligent_display_enable" },
        "66": { "level": 1, "name": "screen_object_settings" },
        "67": { "level": 1, "name": "system_status" },
        "68": { "level": 1, "name": "temperature_control_mode" },
        "69": { "level": 1, "name": "target_temperature_resolution" },
        "6a": { "level": 1, "name": "target_temperature_tolerance" },
        "6b": { "level": 1, "name": "heating_target_temperature" },
        "6c": { "level": 1, "name": "cooling_target_temperature" },
        "6d": { "level": 1, "name": "heating_target_temperature_range" },
        "6e": { "level": 1, "name": "cooling_target_temperature_range" },
        "6f": { "level": 1, "name": "dehumidify_config" },
        "70": { "level": 1, "name": "target_humidity_range" },
        "72": { "level": 1, "name": "fan_mode" },
        "73": { "level": 1, "name": "fan_speed_config" },
        "74": { "level": 1, "name": "fan_delay_config" },
        "75": { "level": 1, "name": "child_lock_settings" },
        "76": { "level": 1, "name": "temperature_alarm_settings" },
        "77": { "level": 1, "name": "high_temperature_alarm_settings" },
        "78": { "level": 1, "name": "low_temperature_alarm_settings" },
        "79": { "level": 1, "name": "temperature_calibration_config" },
        "7a": { "level": 1, "name": "humidity_calibration_config" },
        "7b": { "level": 3, "name": "plan_config" },
        "7c": { "level": 1, "name": "valve_interface_settings" },
        "7d": { "level": 1, "name": "valve_control_settings" },
        "7e": { "level": 1, "name": "fan_control_settings" },
        "80": { "level": 1, "name": "di_setting_enable" },
        "81": { "level": 1, "name": "di_settings" },
        "82": { "level": 1, "name": "window_opening_detection_enable" },
        "83": { "level": 1, "name": "window_opening_detection_settings" },
        "84": { "level": 1, "name": "freeze_protection_settings" },
        "85": { "level": 1, "name": "temperature_source_settings" },
        "86": { "level": 1, "name": "d2d_pairing_enable" },
        "87": { "level": 3, "name": "d2d_pairing_settings" },
        "88": { "level": 1, "name": "d2d_master_enable" },
        "89": { "level": 2, "name": "d2d_master_settings" },
        "8a": { "level": 1, "name": "d2d_slave_enable" },
        "8b": { "level": 2, "name": "d2d_slave_settings" },
        "8c": { "level": 3, "name": "timed_system_control_settings" },
        "8d": { "level": 1, "name": "temporary_unlock_settings" },
        "8e": { "level": 1, "name": "temperature_control_with_standby_fan_mode" },
        "8f": { "level": 1, "name": "valve_opening_negative_valve_mode" },
        "90": { "level": 1, "name": "relay_changes_report_enable" },
        "c4": { "level": 1, "name": "auto_provisioning_enable" },
        "c5": { "level": 1, "name": "history_transmit_settings" },
        "c6": { "level": 1, "name": "daylight_saving_time" },
        "c7": { "level": 1, "name": "time_zone" },
        "b6": { "level": 0, "name": "reconnect" },
        "b8": { "level": 0, "name": "synchronize_time" },
        "b9": { "level": 0, "name": "query_device_status" },
        "ba": { "level": 0, "name": "fetch_history" },
        "bb": { "level": 0, "name": "fetch_history" },
        "bc": { "level": 0, "name": "stop_transmit_history" },
        "bd": { "level": 0, "name": "clear_history" },
        "be": { "level": 0, "name": "reboot" },
        "5b": { "level": 0, "name": "temperature" },
        "5c": { "level": 0, "name": "humidity" },
        "5d": { "level": 0, "name": "opening_window_alarm" },
        "5e": { "level": 0, "name": "insert_plan_id" },
        "5f": { "level": 0, "name": "clear_plan" },
    }

    var data = name_map[type];
    if (data === undefined) return "unknown";
    return data.name;
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

function readFloat16LE(bytes) {
    var bits = (bytes[1] << 8) | bytes[0];
    var sign = bits >>> 15 === 0 ? 1.0 : -1.0;
    var e = (bits >>> 10) & 0x1f;
    var m = e === 0 ? (bits & 0x3ff) << 1 : (bits & 0x3ff) | 0x400;
    var f = sign * m * Math.pow(2, e - 25);

    var n = Number(f.toFixed(2));
    return n;
}

function readFloatLE(bytes) {
    var bits = (bytes[3] << 24) | (bytes[2] << 16) | (bytes[1] << 8) | bytes[0];
    var sign = bits >>> 31 === 0 ? 1.0 : -1.0;
    var e = (bits >>> 23) & 0xff;
    var m = e === 0 ? (bits & 0x7fffff) << 1 : (bits & 0x7fffff) | 0x800000;
    var f = sign * m * Math.pow(2, e - 150);
    return f;
}

function readString(bytes) {
    var str = "";
    var i = 0;
    var byte1, byte2, byte3, byte4;
    while (i < bytes.length) {
        byte1 = bytes[i++];
        if (byte1 <= 0x7f) {
            str += String.fromCharCode(byte1);
        } else if (byte1 <= 0xdf) {
            byte2 = bytes[i++];
            str += String.fromCharCode(((byte1 & 0x1f) << 6) | (byte2 & 0x3f));
        } else if (byte1 <= 0xef) {
            byte2 = bytes[i++];
            byte3 = bytes[i++];
            str += String.fromCharCode(((byte1 & 0x0f) << 12) | ((byte2 & 0x3f) << 6) | (byte3 & 0x3f));
        } else if (byte1 <= 0xf7) {
            byte2 = bytes[i++];
            byte3 = bytes[i++];
            byte4 = bytes[i++];
            var codepoint = ((byte1 & 0x07) << 18) | ((byte2 & 0x3f) << 12) | ((byte3 & 0x3f) << 6) | (byte4 & 0x3f);
            codepoint -= 0x10000;
            str += String.fromCharCode((codepoint >> 10) + 0xd800);
            str += String.fromCharCode((codepoint & 0x3ff) + 0xdc00);
        }
    }
    return str;
}

function readHexString(bytes) {
    var temp = [];
    for (var idx = 0; idx < bytes.length; idx++) {
        temp.push(("0" + (bytes[idx] & 0xff).toString(16)).slice(-2));
    }
    return temp.join("");
}

function readHexStringLE(bytes) {
    var temp = [];
    for (var idx = bytes.length - 1; idx >= 0; idx--) {
        temp.push(("0" + (bytes[idx] & 0xff).toString(16)).slice(-2));
    }
    return temp.join("");
}

function getValue(map, key) {
    if (RAW_VALUE) return key;
    var value = map[key];
    if (!value) value = "unknown";
    return value;
}

function decodeUplink(input) {
    var decoded = milesightDeviceDecode(input.bytes);
    return { data: decoded };
}

var __milesightDownlinkCodec = (function () {
/**
 * Payload Encoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product WT304
 */
var RAW_VALUE = 0x00;
var WITH_QUERY_CMD = 0x00;

/* eslint no-redeclare: "off" */
/* eslint-disable */
// Chirpstack v4
function encodeDownlink(input) {
    var encoded = milesightDeviceEncode(input.data);
    return { bytes: encoded };
}

// Chirpstack v3
function Encode(fPort, obj) {
    return milesightDeviceEncode(obj);
}

// The Things Network
function Encoder(obj, port) {
    return milesightDeviceEncode(obj);
}
/* eslint-enable */

function milesightDeviceEncode(payload) {
    var encoded = [];

    if ("frame" in payload) {
        encoded = encoded.concat(setFrame(payload.frame));
    }
    if ("collection_interval" in payload) {
        var cmd_buffer = setCollectionInterval(payload.collection_interval);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("reporting_interval" in payload) {
        var cmd_buffer = setReportingInterval(payload.reporting_interval);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("temperature_unit" in payload) {
        var cmd_buffer = setTemperatureUnit(payload.temperature_unit);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("support_mode" in payload) {
        var cmd_buffer = setSupportMode(payload.support_mode);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("intelligent_display_enable" in payload) {
        var cmd_buffer = setSmartDisplayConfig(payload.intelligent_display_enable);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("screen_object_settings" in payload) {
        var cmd_buffer = setScreenObjectSettings(payload.screen_object_settings);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("system_status" in payload) {
        var cmd_buffer = controlSystemStatus(payload.system_status);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("temperature_control_mode" in payload) {
        var cmd_buffer = setTemperatureControlMode(payload.temperature_control_mode);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("target_temperature_resolution" in payload) {
        var cmd_buffer = setTargetTemperatureResolution(payload.target_temperature_resolution);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("target_temperature_tolerance" in payload) {
        var cmd_buffer = setTargetTemperatureTolerance(payload.target_temperature_tolerance);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("heating_target_temperature" in payload) {
        var cmd_buffer = setHeatingTargetTemperature(payload.heating_target_temperature);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("cooling_target_temperature" in payload) {
        var cmd_buffer = setCoolingTargetTemperature(payload.cooling_target_temperature);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("heating_target_temperature_range" in payload) {
        var cmd_buffer = setHeatingTargetTemperatureRange(payload.heating_target_temperature_range);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("cooling_target_temperature_range" in payload) {
        var cmd_buffer = setCoolingTargetTemperatureRange(payload.cooling_target_temperature_range);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("dehumidify_config" in payload) {
        var cmd_buffer = setDehumidifyConfig(payload.dehumidify_config);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("target_humidity_range" in payload) {
        var cmd_buffer = setTargetHumidityRange(payload.target_humidity_range);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("fan_mode" in payload) {
        var cmd_buffer = setFanMode(payload.fan_mode);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("fan_speed_config" in payload) {
        var cmd_buffer = setFanSpeedConfig(payload.fan_speed_config);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("fan_delay_config" in payload) {
        var cmd_buffer = setFanDelayConfig(payload.fan_delay_config);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("child_lock_settings" in payload) {
        var cmd_buffer = setChildLockSettings(payload.child_lock_settings);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("temperature_alarm_settings" in payload) {
        var cmd_buffer = setTemperatureAlarmSettings(payload.temperature_alarm_settings);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("high_temperature_alarm_settings" in payload) {
        var cmd_buffer = setContinuousHighTemperatureAlarmSettings(payload.high_temperature_alarm_settings);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("low_temperature_alarm_settings" in payload) {
        var cmd_buffer = setContinuousLowTemperatureAlarmSettings(payload.low_temperature_alarm_settings);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("temperature_calibration_settings" in payload) {
        var cmd_buffer = setTemperatureCalibrationConfig(payload.temperature_calibration_settings);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("humidity_calibration_settings" in payload) {
        var cmd_buffer = setHumidityCalibrationConfig(payload.humidity_calibration_settings);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("plan_config" in payload) {
        for (var i = 0; i < payload.plan_config.length; i++) {
            var cmd_buffer = setPlanConfig(payload.plan_config[i]);
            encoded = encoded.concat(cmd_buffer);
            encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
        }
    }
    if ("valve_interface_settings" in payload) {
        var cmd_buffer = setValveInterfaceSettings(payload.valve_interface_settings);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("valve_control_settings" in payload) {
        var cmd_buffer = setValveControlSettings(payload.valve_control_settings);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("fan_control_settings" in payload) {
        var cmd_buffer = setFanControlSettings(payload.fan_control_settings);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("di_settings" in payload) {
        var cmd_buffer = setDISettings(payload.di_settings);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("di_enable" in payload) {
        var cmd_buffer = setDIEnable(payload.di_enable);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("window_opening_detection_settings" in payload) {
        var cmd_buffer = setWindowOpeningDetectionSettings(payload.window_opening_detection_settings);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("freeze_protection_settings" in payload) {
        var cmd_buffer = setFreezeProtectionConfig(payload.freeze_protection_settings);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("temperature_source_settings" in payload) {
        var cmd_buffer = setTemperatureSourceConfig(payload.temperature_source_settings);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("d2d_pairing_enable" in payload) {
        var cmd_buffer = setD2DEnable(payload.d2d_pairing_enable);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("d2d_pairing_settings" in payload) {
        for (var i = 0; i < payload.d2d_pairing_settings.length; i++) {
            var cmd_buffer = setD2DPairingSettings(payload.d2d_pairing_settings[i]);
            encoded = encoded.concat(cmd_buffer);
            encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
        }
    }
    if ("d2d_master_enable" in payload) {
        var cmd_buffer = setD2DMasterEnable(payload.d2d_master_enable);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("d2d_master_settings" in payload) {
        for (var i = 0; i < payload.d2d_master_settings.length; i++) {
            var cmd_buffer = setD2DMasterSettings(payload.d2d_master_settings[i]);
            encoded = encoded.concat(cmd_buffer);
            encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
        }
    }
    if ("d2d_slave_enable" in payload) {
        var cmd_buffer = setD2DSlaveEnable(payload.d2d_slave_enable);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("d2d_slave_settings" in payload) {
        for (var i = 0; i < payload.d2d_slave_settings.length; i++) {
            var cmd_buffer = setD2DSlaveSettings(payload.d2d_slave_settings[i]);
            encoded = encoded.concat(cmd_buffer);
            encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
        }
    }
    if ("timed_system_control_settings" in payload) {
        var cmd_buffer = setTimedSystemControlSettings(payload.timed_system_control_settings);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("temporary_unlock_settings" in payload) {
        var cmd_buffer = setButtonTemporaryUnlockedConfig(payload.temporary_unlock_settings);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("temperature_control_with_standby_fan_mode" in payload) {
        var cmd_buffer = setTemperatureControlWithStandbyFanMode(payload.temperature_control_with_standby_fan_mode);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("valve_opening_negative_valve_mode" in payload) {
        var cmd_buffer = setValveOpeningNegativeValveMode(payload.valve_opening_negative_valve_mode);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("relay_changes_report_enable" in payload) {
        var cmd_buffer = setRelayChangeReportEnable(payload.relay_changes_report_enable);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("time_zone" in payload) {
        var cmd_buffer = setTimeZone(payload.time_zone);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("daylight_saving_time" in payload) {
        var cmd_buffer = setDaylightSavingTimeSettings(payload.daylight_saving_time);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("auto_provisioning_enable" in payload) {
        var cmd_buffer = setAutoProvisioningEnable(payload.auto_provisioning_enable);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("history_transmit_settings" in payload) {
        var cmd_buffer = setHistoryConfig(payload.history_transmit_settings);
        encoded = encoded.concat(cmd_buffer);
        encoded = WITH_QUERY_CMD ? encoded.concat(setQueryCmd(cmd_buffer)) : encoded;
    }
    if ("reboot" in payload) {
        encoded = encoded.concat(reboot());
    }
    if ("synchronize_time" in payload) {
        encoded = encoded.concat(synchronizeTime());
    }
    if ("query_device_status" in payload) {
        encoded = encoded.concat(queryDeviceStatus());
    }
    if ("reconnect" in payload) {
        encoded = encoded.concat(reconnect());
    }
    if ("clear_history" in payload) {
        encoded = encoded.concat(clearHistory());
    }
    if ("fetch_history" in payload) {
        encoded = encoded.concat(fetchHistory(payload.fetch_history));
    }
    if ("stop_transmit_history" in payload) {
        encoded = encoded.concat(stopTransmitHistory());
    }
    if ("temperature" in payload) {
        encoded = encoded.concat(setTemperature(payload.temperature));
    }
    if ("humidity" in payload) {
        encoded = encoded.concat(setHumidity(payload.humidity));
    }
    if ("opening_window_alarm" in payload) {
        encoded = encoded.concat(setOpeningWindowStatus(payload.opening_window_alarm));
    }
    if ("insert_plan_id" in payload) {
        encoded = encoded.concat(setPlan(payload.insert_plan_id));
    }
    if ("clear_plan" in payload) {
        encoded = encoded.concat(clearPlan(payload.clear_plan));
    }
    return encoded;
}

/**
 * Set frame
 * @param {number} frame values: (0: normal, 1: debug)
 * @example { "frame": 0 }
 */
function setFrame(frame) {
    var buffer = new Buffer(2);
    buffer.writeUInt8(0xfe);
    buffer.writeUInt8(frame);
    return buffer.toBytes();
}

/**
 * Set collection interval
 * @param {object} collection_interval
 * @param {number} collection_interval.unit values: (0: second, 1: minute)
 * @param {number} collection_interval.seconds_of_time unit: second, range: [10, 64800], default: 30s
 * @param {number} collection_interval.minutes_of_time unit: minute, range: [1, 1440], default: 1min
 * @example { "collection_interval": { "unit": 0, "seconds_of_time": 300 } }
 */
function setCollectionInterval(collection_interval) {
    var unit = collection_interval.unit;
    var seconds_of_time = collection_interval.seconds_of_time || 30;
    var minutes_of_time = collection_interval.minutes_of_time || 1;

    var unit_map = { 0: "second", 1: "minute" };
    var unit_values = getValues(unit_map);
    if (unit_values.indexOf(unit) === -1) {
        throw new Error("collection_interval.unit must be one of " + unit_values.join(", "));
    }
    if (getValue(unit_map, unit) === 0 && (seconds_of_time < 10 || seconds_of_time > 64800)) {
        throw new Error("collection_interval.seconds_of_time must be between 10 and 64800 when collection_interval.unit is 0");
    }
    if (getValue(unit_map, unit) === 1 && (minutes_of_time < 1 || minutes_of_time > 1440)) {
        throw new Error("collection_interval.minutes_of_time must be between 1 and 1440 when collection_interval.unit is 1");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0x60);
    buffer.writeUInt8(getValue(unit_map, unit));
    buffer.writeUInt16LE(getValue(unit_map, unit) === 0 ? seconds_of_time : minutes_of_time);
    return buffer.toBytes();
}

/**
 * Set report interval
 * @param {object} reporting_interval
 * @param {number} reporting_interval.unit values: (0: second, 1: minute)
 * @param {number} reporting_interval.seconds_of_time unit: second, range: [10, 64800], default: 600s
 * @param {number} reporting_interval.minutes_of_time unit: minute, range: [1, 1440], default: 10min
 * @example { "reporting_interval": { "unit": 0, "seconds_of_time": 300 } }
 */
function setReportingInterval(reporting_interval) {
    var unit = reporting_interval.unit;
    var seconds_of_time = reporting_interval.seconds_of_time || 600;
    var minutes_of_time = reporting_interval.minutes_of_time || 10;

    var unit_map = { 0: "second", 1: "minute" };
    var unit_values = getValues(unit_map);
    if (unit_values.indexOf(unit) === -1) {
        throw new Error("reporting_interval.unit must be one of " + unit_values.join(", "));
    }
    if (getValue(unit_map, unit) === 0 && (seconds_of_time < 10 || seconds_of_time > 64800)) {
        throw new Error("reporting_interval.seconds_of_time must be between 10 and 64800 when reporting_interval.unit is 0");
    }
    if (getValue(unit_map, unit) === 1 && (minutes_of_time < 1 || minutes_of_time > 1440)) {
        throw new Error("reporting_interval.minutes_of_time must be between 1 and 1440 when reporting_interval.unit is 1");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0x62);
    buffer.writeUInt8(getValue(unit_map, unit));
    buffer.writeUInt16LE(getValue(unit_map, unit) === 0 ? seconds_of_time : minutes_of_time);
    return buffer.toBytes();
}

/**
 * Set temperature unit
 * @param {number} temperature_unit values: (0: celsius, 1: fahrenheit)
 * @example { "temperature_unit": 0 }
 */
function setTemperatureUnit(temperature_unit) {
    var unit_map = { 0: "celsius", 1: "fahrenheit" };
    var unit_values = getValues(unit_map);
    if (unit_values.indexOf(temperature_unit) === -1) {
        throw new Error("temperature_unit must be one of " + unit_values.join(", "));
    }

    var buffer = new Buffer(2);
    buffer.writeUInt8(0x63);
    buffer.writeUInt8(getValue(unit_map, temperature_unit));
    return buffer.toBytes();
}

/**
 * Set support mode
 * @param {number} support_mode values: (3: fan_and_heating, 5: fan_and_cooling, 7: fan_and_heating_and_cooling)
 * @example { "support_mode": 3 }
 */
function setSupportMode(support_mode) {
    var mode_map = { 3: "fan_and_heating", 5: "fan_and_cooling", 7: "fan_and_heating_and_cooling" };
    var mode_values = getValues(mode_map);
    if (mode_values.indexOf(support_mode) === -1) {
        throw new Error("support_mode must be one of " + mode_values.join(", "));
    }

    var buffer = new Buffer(2);
    buffer.writeUInt8(0x64);
    buffer.writeUInt8(support_mode);
    return buffer.toBytes();
}

/**
 * Set smart display config
 * @param {number} intelligent_display_enable values: (0: disable, 1: enable)
 * @example { "intelligent_display_enable": 1 }
 */
function setSmartDisplayConfig(intelligent_display_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(intelligent_display_enable) === -1) {
        throw new Error("intelligent_display_enable.enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(2);
    buffer.writeUInt8(0x65);
    buffer.writeUInt8(getValue(enable_map, intelligent_display_enable));
    return buffer.toBytes();
}

/**
 * Set display config
 * @param {object} screen_object_settings
 * @param {number} screen_object_settings.enable values: (0: disable, 1: enable)
 * @param {number} screen_object_settings.environment_temperature_enable values: (0: disable, 1: enable)
 * @param {number} screen_object_settings.environment_humidity_enable values: (0: disable, 1: enable)
 * @param {number} screen_object_settings.target_temperature_enable values: (0: disable, 1: enable)
 * @param {number} screen_object_settings.schedule_name_enable values: (0: disable, 1: enable)
 * @example { "screen_object_settings": { "enable": 1, "environment_temperature_enable": 1, "environment_humidity_enable": 1, "target_temperature_enable": 1, "schedule_name_enable": 1 } }
 */
function setScreenObjectSettings(screen_object_settings) {
    var enable = screen_object_settings.enable;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);

    var screen_object_offset = { environment_temperature_enable: 0, environment_humidity_enable: 1, target_temperature_enable: 2, schedule_name_enable: 3 };
    var data = 0x00;
    for (var key in screen_object_offset) {
        if (key in screen_object_settings) {
            if (enable_values.indexOf(screen_object_settings[key]) === -1) {
                throw new Error("screen_object_settings." + key + " must be one of " + enable_values.join(", "));
            }
            data |= getValue(enable_map, screen_object_settings[key]) << screen_object_offset[key];
        }
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0x66);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt8(data);
    return buffer.toBytes();
}

/**
 * Control system status
 * @param {number} system_status values: (0: off, 1: on)
 * @example { "system_status": 1 }
 */
function controlSystemStatus(system_status) {
    var on_off_map = { 0: "off", 1: "on" };
    var on_off_values = getValues(on_off_map);
    if (on_off_values.indexOf(system_status) === -1) {
        throw new Error("system_status must be one of " + on_off_values.join(", "));
    }

    var buffer = new Buffer(2);
    buffer.writeUInt8(0x67);
    buffer.writeUInt8(getValue(on_off_map, system_status));
    return buffer.toBytes();
}

/**
 * Set temperature control mode
 * @param {number} temperature_control_mode values: (0: fan, 1: heating, 2: cooling)
 * @example { "temperature_control_mode": 1 }
 */
function setTemperatureControlMode(temperature_control_mode) {
    var mode_map = { 0: "fan", 1: "heating", 2: "cooling" };
    var mode_values = getValues(mode_map);
    if (mode_values.indexOf(temperature_control_mode) === -1) {
        throw new Error("temperature_control_mode must be one of " + mode_values.join(", "));
    }

    var buffer = new Buffer(2);
    buffer.writeUInt8(0x68);
    buffer.writeUInt8(getValue(mode_map, temperature_control_mode));
    return buffer.toBytes();
}

/**
 * Set target temperature resolution
 * @param {number} target_temperature_resolution values: (0.5, 1)
 * @example { "target_temperature_resolution": 0.5 }
 */
function setTargetTemperatureResolution(target_temperature_resolution) {
    var resolution_values = [0.5, 1];
    if (resolution_values.indexOf(target_temperature_resolution) === -1) {
        throw new Error("target_temperature_resolution must be one of " + resolution_values.join(", "));
    }

    var buffer = new Buffer(2);
    buffer.writeUInt8(0x69);
    buffer.writeUInt8(resolution_values.indexOf(target_temperature_resolution));
    return buffer.toBytes();
}

/**
 * Set target temperature tolerance
 * @param {number} target_temperature_tolerance unit: celsius, range: [0.1, 5]
 * @example { "target_temperature_tolerance": 0.5 }
 */
function setTargetTemperatureTolerance(target_temperature_tolerance) {
    if (target_temperature_tolerance < 0.1 || target_temperature_tolerance > 5) {
        throw new Error("target_temperature_tolerance must be between 0.1 and 5");
    }

    var buffer = new Buffer(2);
    buffer.writeUInt8(0x6a);
    buffer.writeInt16LE(target_temperature_tolerance * 100);
    return buffer.toBytes();
}

/**
 * Set heating target temperature
 * @param {number} heating_target_temperature unit: celsius, range: [5, 35]
 * @example { "heating_target_temperature": 20 }
 */
function setHeatingTargetTemperature(heating_target_temperature) {
    if (heating_target_temperature < 5 || heating_target_temperature > 35) {
        throw new Error("heating_target_temperature must be between 5 and 35");
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0x6b);
    buffer.writeInt16LE(heating_target_temperature * 100);
    return buffer.toBytes();
}

/**
 * Set cooling target temperature
 * @param {number} cooling_target_temperature unit: celsius, range: [5, 35]
 * @example { "cooling_target_temperature": 20 }
 */
function setCoolingTargetTemperature(cooling_target_temperature) {
    if (cooling_target_temperature < 5 || cooling_target_temperature > 35) {
        throw new Error("cooling_target_temperature must be between 5 and 35");
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0x6c);
    buffer.writeInt16LE(cooling_target_temperature * 100);
    return buffer.toBytes();
}

/**
 * Set heating target temperature range
 * @param {object} heating_target_temperature_range
 * @param {number} heating_target_temperature_range.min unit: celsius, range: [5, 35]
 * @param {number} heating_target_temperature_range.max unit: celsius, range: [5, 35]
 * @example { "heating_target_temperature_range": { "min": 5, "max": 35 } }
 */
function setHeatingTargetTemperatureRange(heating_target_temperature_range) {
    var min = heating_target_temperature_range.min;
    var max = heating_target_temperature_range.max;

    if (min < 5 || min > 35) {
        throw new Error("heating_target_temperature_range.min must be between 5 and 35");
    }
    if (max < 5 || max > 35) {
        throw new Error("heating_target_temperature_range.max must be between 5 and 35");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0x6d);
    buffer.writeInt16LE(min * 100);
    buffer.writeInt16LE(max * 100);
    return buffer.toBytes();
}

/**
 * Set cooling target temperature range
 * @param {object} cooling_target_temperature_range
 * @param {number} cooling_target_temperature_range.min unit: celsius, range: [5, 35]
 * @param {number} cooling_target_temperature_range.max unit: celsius, range: [5, 35]
 * @example { "cooling_target_temperature_range": { "min": 5, "max": 35 } }
 */
function setCoolingTargetTemperatureRange(cooling_target_temperature_range) {
    var min = cooling_target_temperature_range.min;
    var max = cooling_target_temperature_range.max;

    if (min < 5 || min > 35) {
        throw new Error("cooling_target_temperature_range.min must be between 5 and 35");
    }
    if (max < 5 || max > 35) {
        throw new Error("cooling_target_temperature_range.max must be between 5 and 35");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0x6e);
    buffer.writeInt16LE(min * 100);
    buffer.writeInt16LE(max * 100);
    return buffer.toBytes();
}

/**
 * Set dehumidify config
 * @param {object} dehumidify_config
 * @param {number} dehumidify_config.enable values: (0: disable, 1: enable)
 * @param {number} dehumidify_config.temperature_tolerance unit: celsius, range: [0.1, 5]
 * @example { "dehumidify_config": { "enable": 1, "temperature_tolerance": 0.5 } }
 */
function setDehumidifyConfig(dehumidify_config) {
    var enable = dehumidify_config.enable;
    var temperature_tolerance = dehumidify_config.temperature_tolerance;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("dehumidify_config.enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0x6f);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeInt16LE(temperature_tolerance * 100);
    return buffer.toBytes();
}

/**
 * Set target humidity range
 * @param {object} target_humidity_range
 * @param {number} target_humidity_range.min unit: percentage, range: [0, 100]
 * @param {number} target_humidity_range.max unit: percentage, range: [0, 100]
 * @example { "target_humidity_range": { "min": 0, "max": 100 } }
 */
function setTargetHumidityRange(target_humidity_range) {
    var min = target_humidity_range.min;
    var max = target_humidity_range.max;

    if (min < 0 || min > 100) {
        throw new Error("target_humidity_range.min must be between 0 and 100");
    }
    if (max < 0 || max > 100) {
        throw new Error("target_humidity_range.max must be between 0 and 100");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0x70);
    buffer.writeUInt16LE(min * 10);
    buffer.writeUInt16LE(max * 10);
    return buffer.toBytes();
}

/**
 * Set fan mode
 * @param {number} fan_mode values: (0: auto, 1: low, 2: medium, 3: high)
 * @example { "fan_mode": 1 }
 */
function setFanMode(fan_mode) {
    var mode_map = { 0: "auto", 1: "low", 2: "medium", 3: "high" };
    var mode_values = getValues(mode_map);
    if (mode_values.indexOf(fan_mode) === -1) {
        throw new Error("fan_mode must be one of " + mode_values.join(", "));
    }

    var buffer = new Buffer(2);
    buffer.writeUInt8(0x72);
    buffer.writeUInt8(getValue(mode_map, fan_mode));
    return buffer.toBytes();
}

/**
 * Set fan speed config
 * @param {object} fan_speed_config
 * @param {number} fan_speed_config.delta_1 unit: percentage, range: [1.0, 15.0]
 * @param {number} fan_speed_config.delta_2 unit: percentage, range: [1.0, 15.0]
 * @example { "fan_speed_config": { "delta_1": 1.0, "delta_2": 1.0 } }
 */
function setFanSpeedConfig(fan_speed_config) {
    var delta_1 = fan_speed_config.delta_1;
    var delta_2 = fan_speed_config.delta_2;

    if (delta_1 < 1.0 || delta_1 > 15.0) {
        throw new Error("fan_speed_config.delta_1 must be between 1.0 and 15.0");
    }
    if (delta_2 < 1.0 || delta_2 > 15.0) {
        throw new Error("fan_speed_config.delta_2 must be between 1.0 and 15.0");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0x73);
    buffer.writeInt16LE(delta_1 * 100);
    buffer.writeInt16LE(delta_2 * 100);
    return buffer.toBytes();
}

/**
 * Set fan delay config
 * @param {object} fan_delay_config
 * @param {number} fan_delay_config.enable values: (0: disable, 1: enable)
 * @param {number} fan_delay_config.delay unit: second, range: [1, 3600]
 * @example { "fan_delay_config": { "enable": 1, "delay": 10 } }
 */
function setFanDelayConfig(fan_delay_config) {
    var enable = fan_delay_config.enable;
    var delay_time = fan_delay_config.delay_time;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("fan_delay_config.enable must be one of " + enable_values.join(", "));
    }
    if (delay_time < 1 || delay_time > 3600) {
        throw new Error("fan_delay_config.delay_time must be in the range of 1 to 3600 seconds");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0x74);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt16LE(delay_time);
    return buffer.toBytes();
}

/**
 * Set child lock config
 * @param {object} child_lock_settings
 * @param {number} child_lock_settings.enable values: (0: disable, 1: enable)
 * @param {number} child_lock_settings.system_button values: (0: disable, 1: enable)
 * @param {number} child_lock_settings.temperature_button values: (0: disable, 1: enable)
 * @param {number} child_lock_settings.fan_button values: (0: disable, 1: enable)
 * @param {number} child_lock_settings.temperature_control_button values: (0: disable, 1: enable)
 * @param {number} child_lock_settings.reboot_reset_button values: (0: disable, 1: enable)
 * @example { "child_lock_settings": { "system_button": 1, "temperature_button": 1, "fan_button": 1, "temperature_control_button": 1, "reboot_reset_button": 1 } }
 */
function setChildLockSettings(child_lock_settings) {
    var enable = child_lock_settings.enable;
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);

    var data = 0x00;
    var button_offset = { system_button: 0, temperature_button: 1, fan_button: 2, temperature_control_button: 3, reboot_reset_button: 4 };
    for (var key in button_offset) {
        if (key in child_lock_settings) {
            if (enable_values.indexOf(child_lock_settings[key]) === -1) {
                throw new Error("child_lock_settings." + key + " must be one of " + enable_values.join(", "));
            }
            data |= getValue(enable_map, child_lock_settings[key]) << button_offset[key];
        }
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0x75);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt8(data);
    return buffer.toBytes();
}

/**
 * Set temperature alarm settings
 * @param {object} temperature_alarm_settings
 * @param {number} temperature_alarm_settings.enable values: (0: disable, 1: enable)
 * @param {number} temperature_alarm_settings.condition values: (1: below, 2: above, 3: between, 4: outside)
 * @param {number} temperature_alarm_settings.threshold_min unit: celsius, range: [-20, 60]
 * @param {number} temperature_alarm_settings.threshold_max unit: celsius, range: [-20, 60]
 * @example { "temperature_alarm_settings": { "enable": 1, "condition": 1, "threshold_min": 20, "threshold_max": 25 } }
 */
function setTemperatureAlarmSettings(temperature_alarm_settings) {
    var enable = temperature_alarm_settings.enable;
    var condition = temperature_alarm_settings.condition;
    var threshold_min = temperature_alarm_settings.threshold_min;
    var threshold_max = temperature_alarm_settings.threshold_max;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("temperature_alarm_settings.enable must be one of " + enable_values.join(", "));
    }
    var condition_map = { 0: "disable", 1: "below", 2: "above", 3: "between", 4: "outside" };
    var condition_values = getValues(condition_map);
    if (condition_values.indexOf(condition) === -1) {
        throw new Error("temperature_alarm_settings.condition must be one of " + condition_values.join(", "));
    }

    var buffer = new Buffer(7);
    buffer.writeUInt8(0x76);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt8(getValue(condition_map, condition));
    buffer.writeInt16LE(threshold_min * 100);
    buffer.writeInt16LE(threshold_max * 100);
    return buffer.toBytes();
}

/**
 * Set continuous high temperature alarm settings
 * @param {object} high_temperature_alarm_settings
 * @param {number} high_temperature_alarm_settings.enable values: (0: disable, 1: enable)
 * @param {number} high_temperature_alarm_settings.delta_temperature unit: celsius, range: [1, 10]
 * @param {number} high_temperature_alarm_settings.duration unit: minute, range: [0, 60]
 * @example { "high_temperature_alarm_settings": { "enable": 1, "delta_temperature": 3, "duration": 10 } }
 */
function setContinuousHighTemperatureAlarmSettings(high_temperature_alarm_settings) {
    var enable = high_temperature_alarm_settings.enable;
    var delta_temperature = high_temperature_alarm_settings.delta_temperature;
    var duration = high_temperature_alarm_settings.duration;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("continuous_temperature_alarm_settings.enable must be one of " + enable_values.join(", "));
    }
    if (delta_temperature < 1 || delta_temperature > 10) {
        throw new Error("continuous_temperature_alarm_settings.delta_temperature must be between 1 and 10");
    }
    if (duration < 0 || duration > 60) {
        throw new Error("continuous_temperature_alarm_settings.duration must be between 0 and 60");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0x77);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeInt16LE(delta_temperature * 100);
    buffer.writeUInt8(duration);
    return buffer.toBytes();
}

/**
 * Set continuous low temperature alarm settings
 * @param {object} low_temperature_alarm_settings
 * @param {number} low_temperature_alarm_settings.enable values: (0: disable, 1: enable)
 * @param {number} low_temperature_alarm_settings.delta_temperature unit: celsius, range: [1, 10]
 * @param {number} low_temperature_alarm_settings.duration unit: minute, range: [0, 60]
 * @example { "low_temperature_alarm_settings": { "enable": 1, "delta_min": 1, "duration": 10 } }
 */
function setContinuousLowTemperatureAlarmSettings(low_temperature_alarm_settings) {
    var enable = low_temperature_alarm_settings.enable;
    var delta_temperature = low_temperature_alarm_settings.delta_temperature;
    var duration = low_temperature_alarm_settings.duration;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("low_temperature_alarm_settings.enable must be one of " + enable_values.join(", "));
    }
    if (delta_temperature < 1 || delta_temperature > 10) {
        throw new Error("low_temperature_alarm_settings.delta_temperature must be between 1 and 10");
    }
    if (duration < 0 || duration > 60) {
        throw new Error("low_temperature_alarm_settings.duration must be between 0 and 60");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0x78);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeInt16LE(delta_temperature * 100);
    buffer.writeUInt8(duration);
    return buffer.toBytes();
}

/**
 * Set temperature calibration config
 * @param {object} temperature_calibration_settings
 * @param {number} temperature_calibration_settings.enable values: (0: disable, 1: enable)
 * @param {number} temperature_calibration_settings.calibration_value unit: celsius, range: [-80, 80]
 * @example { "temperature_calibration_settings": { "enable": 1, "calibration_value": 0.5 } }
 */
function setTemperatureCalibrationConfig(temperature_calibration_settings) {
    var enable = temperature_calibration_settings.enable;
    var calibration_value = temperature_calibration_settings.calibration_value;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("temperature_calibration_settings.enable must be one of " + enable_values.join(", "));
    }
    if (calibration_value < -80 || calibration_value > 80) {
        throw new Error("temperature_calibration_settings.calibration_value must be between -80 and 80");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0x79);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeInt16LE(calibration_value * 100);
    return buffer.toBytes();
}

/**
 * Set humidity calibration config
 * @param {object} humidity_calibration_settings
 * @param {number} humidity_calibration_settings.enable values: (0: disable, 1: enable)
 * @param {number} humidity_calibration_settings.calibration_value unit: %, range: [-100, 100]
 * @example { "humidity_calibration_settings": { "enable": 1, "calibration_value": 0.5 } }
 */
function setHumidityCalibrationConfig(humidity_calibration_settings) {
    var enable = humidity_calibration_settings.enable;
    var calibration_value = humidity_calibration_settings.calibration_value;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("humidity_calibration_settings.enable must be one of " + enable_values.join(", "));
    }
    if (calibration_value < -100 || calibration_value > 100) {
        throw new Error("humidity_calibration_settings.calibration_value must be between -100 and 100");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0x7a);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeInt16LE(calibration_value * 10);
    return buffer.toBytes();
}

/**
 * Set plan config
 * @param {object} plan_config
 * @param {number} plan_config._item.plan_id range: [1, 16]
 * @param {number} plan_config._item.enable values: (0: disable, 1: enable)
 * @param {string} plan_config._item.name
 * @param {number} plan_config._item.fan_mode values: (0: auto, 1: low, 2: medium, 3: high)
 * @param {number} plan_config._item.heating_temperature unit: celsius, range: [0, 60]
 * @param {number} plan_config._item.cooling_temperature unit: celsius, range: [0, 60]
 * @param {number} plan_config._item.temperature_tolerance unit: celsius, range: [0, 60]
 * @param {object} plan_config._item.schedule_config
 * @example
 * { "plan_config": [
 *     { "plan_id": 1, "enable": 1, "name": "task 1", "fan_mode": 1, "heating_temperature": 20, "cooling_temperature": 25, "temperature_tolerance": 1,
 *       "schedule_config": { "enable": 1, "start_time": 0, "end_time": 1440,
 *         "weekday": { "monday": 1, "tuesday": 1, "wednesday": 1, "thursday": 1, "friday": 1, "saturday": 1, "sunday": 1 }
 *       }
 *     }]
 * }
 */
function setPlanConfig(plan_config) {
    var plan_id = plan_config.plan_id;
    if (plan_id < 1 || plan_id > 16) {
        throw new Error("plan_config._item.plan_id must be between 1 and 16");
    }

    var data = [];
    if ("enable" in plan_config) {
        data = data.concat(setPlanEnable(plan_id - 1, plan_config.enable));
    }
    if ("name_first" in plan_config) {
        data = data.concat(setPlanNameFirst(plan_id - 1, plan_config.name_first));
    }
    if ("name_last" in plan_config) {
        data = data.concat(setPlanNameLast(plan_id - 1, plan_config.name_last));
    }
    if ("fan_mode" in plan_config && "heating_temperature" in plan_config && "cooling_temperature" in plan_config && "temperature_tolerance" in plan_config) {
        data = data.concat(setPlanTemperatureControlConfig(plan_id - 1, plan_config));
    }
    if ("schedule_config" in plan_config) {
        for (var i = 0; i < plan_config.schedule_config.length; i++) {
            data = data.concat(setPlanScheduleConfig(plan_id - 1, plan_config.schedule_config[i]));
        }
    }
    return data;
}

function setPlanEnable(plan_id, enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("plan_config._item.enable must be one of " + enable_values.join(", "));
    }
    var buffer = new Buffer(4);
    buffer.writeUInt8(0x7b);
    buffer.writeUInt8(plan_id);
    buffer.writeUInt8(0x00); // enable sub-command
    buffer.writeUInt8(getValue(enable_map, enable));
    return buffer.toBytes();
}

function setPlanNameFirst(plan_id, name_first) {
    if (name_first.length > 10) {
        throw new Error("plan_config._item.name_first must be less than 10 characters");
    }

    var buffer = new Buffer(9);
    buffer.writeUInt8(0x7b);
    buffer.writeUInt8(plan_id);
    buffer.writeUInt8(0x01); // name1 sub-command
    buffer.writeBytes(encodeUtf8(name_first));
    return buffer.toBytes();
}

function setPlanNameLast(plan_id, name_last) {
    if (name_last.length > 10) {
        throw new Error("plan_config._item.name_last must be less than 10 characters");
    }

    var buffer = new Buffer(7);
    buffer.writeUInt8(0x7b);
    buffer.writeUInt8(plan_id);
    buffer.writeUInt8(0x02); // name2 sub-command
    buffer.writeBytes(encodeUtf8(name_last));
    return buffer.toBytes();
}

/**
 * @param {number} plan_id
 * @param {object} plan_config
 * @param {number} plan_config.fan_mode values: (0: auto, 1: low, 2: medium, 3: high)
 * @param {number} plan_config.heating_temperature_enable values: (0: disable, 1: enable)
 * @param {number} plan_config.heating_temperature unit: celsius, range: [5, 35]
 * @param {number} plan_config.cooling_temperature_enable values: (0: disable, 1: enable)
 * @param {number} plan_config.cooling_temperature unit: celsius, range: [5, 35]
 * @param {number} plan_config.temperature_tolerance_enable values: (0: disable, 1: enable)
 * @param {number} plan_config.temperature_tolerance unit: celsius, range: [0.1, 5]
 */
function setPlanTemperatureControlConfig(plan_id, plan_config) {
    var fan_mode = plan_config.fan_mode;
    var heating_temperature_enable = plan_config.heating_temperature_enable;
    var heating_temperature = plan_config.heating_temperature;
    var cooling_temperature_enable = plan_config.cooling_temperature_enable;
    var cooling_temperature = plan_config.cooling_temperature;
    var temperature_tolerance_enable = plan_config.temperature_tolerance_enable;
    var temperature_tolerance = plan_config.temperature_tolerance;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    var fan_mode_map = { 0: "auto", 1: "low", 2: "medium", 3: "high" };
    var fan_mode_values = getValues(fan_mode_map);
    if (fan_mode_values.indexOf(fan_mode) === -1) {
        throw new Error("plan_config._item.fan_mode must be one of " + fan_mode_values.join(", "));
    }
    if (getValue(enable_values, heating_temperature_enable) === 1 && (heating_temperature < 5 || heating_temperature > 35)) {
        throw new Error("plan_config._item.heating_temperature must be between 5 and 35");
    }
    if (getValue(enable_values, cooling_temperature_enable) === 1 && (cooling_temperature < 5 || cooling_temperature > 35)) {
        throw new Error("plan_config._item.cooling_temperature must be between 5 and 35");
    }
    if (getValue(enable_values, temperature_tolerance_enable) === 1 && (temperature_tolerance < 0.1 || temperature_tolerance > 5)) {
        throw new Error("plan_config._item.temperature_tolerance must be between 0.1 and 5");
    }

    var heating_temperature_data = 0x00;
    var cooling_temperature_data = 0x00;
    var temperature_tolerance_data = 0x00;
    heating_temperature_data |= (heating_temperature * 100) << 1;
    cooling_temperature_data |= (cooling_temperature * 100) << 1;
    temperature_tolerance_data |= (temperature_tolerance * 100) << 1;
    heating_temperature_data |= getValue(enable_map, heating_temperature_enable);
    cooling_temperature_data |= getValue(enable_map, cooling_temperature_enable);
    temperature_tolerance_data |= getValue(enable_map, temperature_tolerance_enable);

    var buffer = new Buffer(10);
    buffer.writeUInt8(0x7b);
    buffer.writeUInt8(plan_id);
    buffer.writeUInt8(0x03); // plan config sub-command
    buffer.writeUInt8(getValue(fan_mode_map, fan_mode));
    buffer.writeInt16LE(heating_temperature_data);
    buffer.writeInt16LE(cooling_temperature_data);
    buffer.writeInt16LE(temperature_tolerance_data);
    return buffer.toBytes();
}

/**
 * @param {number} plan_id
 * @param {object} schedule_config
 * @param {number} schedule_config.index range: [1, 16]
 * @param {number} schedule_config.enable values: (0: disable, 1: enable)
 * @param {number} schedule_config.time unit: minute, range: [0, 1439]
 * @param {object} schedule_config.weekday
 * @param {number} schedule_config.weekday.monday values: (0: disable, 1: enable)
 * @param {number} schedule_config.weekday.tuesday values: (0: disable, 1: enable)
 * @param {number} schedule_config.weekday.wednesday values: (0: disable, 1: enable)
 * @param {number} schedule_config.weekday.thursday values: (0: disable, 1: enable)
 * @param {number} schedule_config.weekday.friday values: (0: disable, 1: enable)
 * @param {number} schedule_config.weekday.saturday values: (0: disable, 1: enable)
 * @param {number} schedule_config.weekday.sunday values: (0: disable, 1: enable)
 */
function setPlanScheduleConfig(plan_id, schedule_config) {
    var index = schedule_config.index;
    var enable = schedule_config.enable;
    var time = schedule_config.time;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("plan_config._item.schedule_config.enable must be one of " + enable_values.join(", "));
    }
    if (time < 0 || time > 1439) {
        throw new Error("plan_config._item.schedule_config.time must be between 0 and 1439");
    }
    if (index < 1 || index > 16) {
        throw new Error("plan_config._item.schedule_config.index must be between 1 and 16");
    }

    var data = 0x00;
    var weekday_bits_offset = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
    for (var key in weekday_bits_offset) {
        if (key in schedule_config.weekday) {
            if (enable_values.indexOf(schedule_config.weekday[key]) === -1) {
                throw new Error("plan_config._item.schedule_config.weekday." + key + " must be one of " + enable_values.join(", "));
            }
            data |= getValue(enable_map, schedule_config.weekday[key]) << weekday_bits_offset[key];
        }
    }

    var buffer = new Buffer(8);
    buffer.writeUInt8(0x7b);
    buffer.writeUInt8(plan_id);
    buffer.writeUInt8(0x04);
    buffer.writeUInt8(index - 1);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt16LE(time);
    buffer.writeUInt8(data);
    return buffer.toBytes();
}

/**
 * Valve interface config
 * @param {object} valve_interface_settings
 * @param {number} valve_interface_settings.mode values: (0: four_pipe_voltage, 1: two_pipe_voltage, 2: two_pipe_voltage_ec, 3: four_pipe_two_wire_ec, 4: two_pipe_two_wire_ec, 5: two_pipe_three_wire_ec)
 * @param {object} valve_interface_settings.four_pipe_voltage
 * @param {object} valve_interface_settings.two_pipe_voltage
 * @param {object} valve_interface_settings.two_pipe_voltage_ec
 * @param {object} valve_interface_settings.four_pipe_two_wire_ec
 * @param {object} valve_interface_settings.two_pipe_two_wire_ec
 * @param {object} valve_interface_settings.two_pipe_three_wire_ec
 */
function setValveInterfaceSettings(valve_interface_settings) {
    var mode = valve_interface_settings.mode;
    var mode_map = { 0: "four_pipe_voltage", 1: "two_pipe_voltage", 2: "two_pipe_voltage_ec", 3: "four_pipe_two_wire_ec", 4: "two_pipe_two_wire_ec", 5: "two_pipe_three_wire_ec" };
    var mode_values = getValues(mode_map);
    if (mode_values.indexOf(mode) === -1) {
        throw new Error("valve_interface_settings.mode must be one of " + mode_values.join(", "));
    }

    var data = [];
    var mode_value = getValue(mode_map, mode);
    switch (mode_value) {
        case 0x00: // four_pipe_voltage
            data = data.concat(setFourPipeVoltageConfig(valve_interface_settings.four_pipe_voltage));
            break;
        case 0x01: // two_pipe_voltage
            data = data.concat(setTwoPipeVoltageConfig(valve_interface_settings.two_pipe_voltage));
            break;
        case 0x02: // two_pipe_voltage_ec
            data = data.concat(setTwoPipeVoltageEcConfig(valve_interface_settings.two_pipe_voltage_ec));
            break;
        case 0x03: // four_pipe_two_wire_ec
            data = data.concat(setFourPipeTwoWireEcConfig(valve_interface_settings.four_pipe_two_wire_ec));
            break;
        case 0x04: // two_pipe_two_wire_ec
            data = data.concat(setTwoPipeTwoWireEcConfig(valve_interface_settings.two_pipe_two_wire_ec));
            break;
        case 0x05: // two_pipe_three_wire_ec
            data = data.concat(setTwoPipeThreeWireECConfig(valve_interface_settings.two_pipe_three_wire_ec));
            break;
    }
    return data;
}

/**
 * @param {object} four_pipe_voltage
 * @param {number} four_pipe_voltage.cooling_valve values: (1: valve_1, 2: valve_2)
 * @param {number} four_pipe_voltage.heating_valve values: (1: valve_1, 2: valve_2)
 */
function setFourPipeVoltageConfig(four_pipe_voltage) {
    var cooling_valve = four_pipe_voltage.cooling_valve;
    var heating_valve = four_pipe_voltage.heating_valve;

    var valve_map = { 1: "valve_1", 2: "valve_2" };
    var valve_values = getValues(valve_map);
    if (valve_values.indexOf(cooling_valve) === -1) {
        throw new Error("four_pipe_voltage.cooling_valve must be one of " + valve_values.join(", "));
    }
    if (valve_values.indexOf(heating_valve) === -1) {
        throw new Error("four_pipe_voltage.heating_valve must be one of " + valve_values.join(", "));
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0x7c);
    buffer.writeUInt8(0x00); // four_pipe_voltage sub-command
    buffer.writeUInt8(getValue(valve_map, cooling_valve));
    buffer.writeUInt8(getValue(valve_map, heating_valve));
    return buffer.toBytes();
}

/**
 * @param {object} two_pipe_voltage
 * @param {number} two_pipe_voltage.control_valve values: (1: valve_1, 2: valve_2)
 */
function setTwoPipeVoltageConfig(two_pipe_voltage) {
    var control_valve = two_pipe_voltage.control_valve;

    var valve_map = { 1: "valve_1", 2: "valve_2" };
    var valve_values = getValues(valve_map);
    if (valve_values.indexOf(control_valve) === -1) {
        throw new Error("two_pipe_voltage.control_valve must be one of " + valve_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0x7c);
    buffer.writeUInt8(0x01); // two_pipe_voltage sub-command
    buffer.writeUInt8(getValue(valve_map, control_valve));
    return buffer.toBytes();
}

/**
 * @param {object} two_pipe_voltage_ec
 * @param {number} two_pipe_voltage_ec.valve values: (1: valve_1, 2: valve_2)
 * @param {number} two_pipe_voltage_ec.ec values: (1: valve_1, 2: valve_2)
 * @param {number} two_pipe_voltage_ec.ec_power values: (0: none, 3: low, 4: medium, 5: high)
 */
function setTwoPipeVoltageEcConfig(two_pipe_voltage_ec) {
    var control_valve = two_pipe_voltage_ec.control_valve;
    var ec = two_pipe_voltage_ec.ec;
    var ec_power = two_pipe_voltage_ec.ec_power;

    var valve_map = { 1: "valve_1", 2: "valve_2" };
    var ec_map = { 1: "valve_1", 2: "valve_2" };
    var ec_power_map = { 0: "none", 3: "low", 4: "medium", 5: "high" };
    var valve_values = getValues(valve_map);
    var ec_values = getValues(ec_map);
    var ec_power_values = getValues(ec_power_map);
    if (valve_values.indexOf(control_valve) === -1) {
        throw new Error("two_pipe_voltage_ec.control_valve must be one of " + valve_values.join(", "));
    }
    if (ec_values.indexOf(ec) === -1) {
        throw new Error("two_pipe_voltage_ec.ec must be one of " + ec_values.join(", "));
    }
    if (ec_power_values.indexOf(ec_power) === -1) {
        throw new Error("two_pipe_voltage_ec.ec_power must be one of " + ec_power_values.join(", "));
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0x7c);
    buffer.writeUInt8(0x02); // two_pipe_voltage_ec sub-command
    buffer.writeUInt8(getValue(valve_map, control_valve));
    buffer.writeUInt8(getValue(ec_map, ec));
    buffer.writeUInt8(getValue(ec_power_map, ec_power));
    return buffer.toBytes();
}

/**
 * @param {object} four_pipe_two_wire_ec
 * @param {number} four_pipe_two_wire_ec.cooling_valve values: (3: low, 4: medium, 5: high)
 * @param {number} four_pipe_two_wire_ec.heating_valve values: (3: low, 4: medium, 5: high)
 * @param {number} four_pipe_two_wire_ec.ec values: (1: valve_1, 2: valve_2)
 * @param {number} four_pipe_two_wire_ec.ec_power values: (0: none, 3: low, 4: medium, 5: high)
 */
function setFourPipeTwoWireEcConfig(four_pipe_two_wire_ec) {
    var cooling_valve = four_pipe_two_wire_ec.cooling_valve;
    var heating_valve = four_pipe_two_wire_ec.heating_valve;
    var ec = four_pipe_two_wire_ec.ec;
    var ec_power = four_pipe_two_wire_ec.ec_power;

    var mode_map = { 3: "low", 4: "medium", 5: "high" };
    var mode_values = getValues(mode_map);
    var valve_map = { 1: "valve_1", 2: "valve_2" };
    var valve_values = getValues(valve_map);
    var ec_power_type_map = { 0: "none", 3: "low", 4: "medium", 5: "high" };
    var ec_power_type_values = getValues(ec_power_type_map);

    if (mode_values.indexOf(cooling_valve) === -1) {
        throw new Error("four_pipe_two_wire_ec.cooling_valve must be one of " + mode_values.join(", "));
    }
    if (mode_values.indexOf(heating_valve) === -1) {
        throw new Error("four_pipe_two_wire_ec.heating_valve must be one of " + mode_values.join(", "));
    }
    if (valve_values.indexOf(ec) === -1) {
        throw new Error("four_pipe_two_wire_ec.ec must be one of " + valve_values.join(", "));
    }
    if (ec_power_type_values.indexOf(ec_power) === -1) {
        throw new Error("four_pipe_two_wire_ec.ec_power must be one of " + ec_power_type_values.join(", "));
    }

    var buffer = new Buffer(6);
    buffer.writeUInt8(0x7c);
    buffer.writeUInt8(0x03); // four_pipe_two_wire_ec sub-command
    buffer.writeUInt8(getValue(mode_map, cooling_valve));
    buffer.writeUInt8(getValue(mode_map, heating_valve));
    buffer.writeUInt8(getValue(valve_map, ec));
    buffer.writeUInt8(getValue(ec_power_type_map, ec_power));
    return buffer.toBytes();
}

/**
 * @param {object} two_pipe_two_wire_ec
 * @param {number} two_pipe_two_wire_ec.control_valve values: (3: low, 4: medium, 5: high)
 * @param {number} two_pipe_two_wire_ec.ec values: (1: valve_1, 2: valve_2)
 * @param {number} two_pipe_two_wire_ec.ec_power values: (0: none, 3: low, 4: medium, 5: high)
 */
function setTwoPipeTwoWireEcConfig(two_pipe_two_wire_ec) {
    var control_valve = two_pipe_two_wire_ec.control_valve;
    var ec = two_pipe_two_wire_ec.ec;
    var ec_power = two_pipe_two_wire_ec.ec_power;

    var control_valve_map = { 3: "low", 4: "medium", 5: "high" };
    var ec_map = { 1: "valve_1", 2: "valve_2" };
    var ec_power_map = { 0: "none", 3: "low", 4: "medium", 5: "high" };
    var control_valve_values = getValues(control_valve_map);
    var ec_values = getValues(ec_map);
    var ec_power_values = getValues(ec_power_map);

    if (control_valve_values.indexOf(control_valve) === -1) {
        throw new Error("two_pipe_two_wire_ec.control_valve must be one of " + control_valve_values.join(", "));
    }
    if (ec_values.indexOf(ec) === -1) {
        throw new Error("two_pipe_two_wire_ec.ec must be one of " + ec_values.join(", "));
    }
    if (ec_power_values.indexOf(ec_power) === -1) {
        throw new Error("two_pipe_two_wire_ec.ec_power must be one of " + ec_power_values.join(", "));
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0x7c);
    buffer.writeUInt8(0x04); // two_pipe_two_wire_ec sub-command
    buffer.writeUInt8(getValue(control_valve_map, control_valve));
    buffer.writeUInt8(getValue(ec_map, ec));
    buffer.writeUInt8(getValue(ec_power_map, ec_power));
    return buffer.toBytes();
}

/**
 * @param {object} two_pipe_three_wire_ec
 * @param {number} two_pipe_three_wire_ec.no values: (3: low, 4: medium, 5: high)
 * @param {number} two_pipe_three_wire_ec.nc values: (3: low, 4: medium, 5: high)
 * @param {number} two_pipe_three_wire_ec.ec values: (1: valve_1, 2: valve_2)
 * @param {number} two_pipe_three_wire_ec.ec_power values: (0: none, 3: low, 4: medium, 5: high)
 */
function setTwoPipeThreeWireECConfig(two_pipe_three_wire_ec) {
    var no = two_pipe_three_wire_ec.no;
    var nc = two_pipe_three_wire_ec.nc;
    var ec = two_pipe_three_wire_ec.ec;
    var ec_power = two_pipe_three_wire_ec.ec_power;

    var n_map = { 3: "low", 4: "medium", 5: "high" };
    var ec_map = { 1: "valve_1", 2: "valve_2" };
    var ec_power_map = { 0: "none", 3: "low", 4: "medium", 5: "high" };
    var n_values = getValues(n_map);
    var ec_values = getValues(ec_map);
    var ec_power_values = getValues(ec_power_map);

    if (n_values.indexOf(no) === -1) {
        throw new Error("two_pipe_three_wire_ec.no must be one of " + n_values.join(", "));
    }
    if (n_values.indexOf(nc) === -1) {
        throw new Error("two_pipe_three_wire_ec.nc must be one of " + n_values.join(", "));
    }
    if (ec_values.indexOf(ec) === -1) {
        throw new Error("two_pipe_three_wire_ec.ec must be one of " + ec_values.join(", "));
    }
    if (ec_power_values.indexOf(ec_power) === -1) {
        throw new Error("two_pipe_three_wire_ec.ec_power must be one of " + ec_power_values.join(", "));
    }

    var buffer = new Buffer(6);
    buffer.writeUInt8(0x7c);
    buffer.writeUInt8(0x05); // two_pipe_three_wire_ec sub-command
    buffer.writeUInt8(getValue(n_map, no));
    buffer.writeUInt8(getValue(n_map, nc));
    buffer.writeUInt8(getValue(ec_map, ec));
    buffer.writeUInt8(getValue(ec_power_map, ec_power));
    return buffer.toBytes();
}

/**
 * Set valve control settings
 * @param {object} valve_control_settings
 * @param {object} valve_control_settings.temperature_control_range unit: °C, range: [1, 15]
 * @param {object} valve_control_settings.opening_range.min unit: %, range: [0, 100]
 * @param {object} valve_control_settings.opening_range.max unit: %, range: [0, 100]
 * @param {object} valve_control_settings.control_time_interval unit: s, range: [1, 60]
 * @example { "valve_control_settings": { "type": 0 } }
 */
function setValveControlSettings(valve_control_settings) {
    var data = [];

    // temperature_control_range
    if ("temperature_control_range" in valve_control_settings) {
        var buffer = new Buffer(4);
        buffer.writeUInt8(0x7d);
        buffer.writeUInt8(0x00); // temperature_control_range sub-command
        buffer.writeInt16LE(valve_control_settings.temperature_control_range * 100);
        data = data.concat(buffer.toBytes());
    }
    // opening_range
    else if ("opening_range" in valve_control_settings) {
        var buffer = new Buffer(4);
        buffer.writeUInt8(0x7d);
        buffer.writeUInt8(0x01); // opening_range sub-command
        buffer.writeUInt8(valve_control_settings.opening_range.min);
        buffer.writeUInt8(valve_control_settings.opening_range.max);
        data = data.concat(buffer.toBytes());
    }
    // control_time_interval
    else if ("control_time_interval" in valve_control_settings) {
        var buffer = new Buffer(3);
        buffer.writeUInt8(0x7d);
        buffer.writeUInt8(0x02); // control_time_interval sub-command
        buffer.writeUInt8(valve_control_settings.control_time_interval);
        data = data.concat(buffer.toBytes());
    }
    return data;
}

/**
 * Set fan control settings
 * @param {object} fan_control_settings
 * @param {number} fan_control_settings.low_threshold unit: celsius, range: [1, 100]
 * @param {number} fan_control_settings.medium_threshold unit: celsius, range: [1, 100]
 * @param {number} fan_control_settings.high_threshold unit: celsius, range: [1, 100]
 * @example { "fan_control_settings": { "low_threshold": 1, "medium_threshold": 2, "high_threshold": 3 } }
 */
function setFanControlSettings(fan_control_settings) {
    var data = [];
    if ("low_threshold" in fan_control_settings) {
        var buffer = new Buffer(3);
        buffer.writeUInt8(0x7e);
        buffer.writeUInt8(0x00); // low_threshold sub-command
        buffer.writeUInt8(fan_control_settings.low_threshold);
        data = data.concat(buffer.toBytes());
    }
    if ("medium_threshold" in fan_control_settings) {
        var buffer = new Buffer(3);
        buffer.writeUInt8(0x7e);
        buffer.writeUInt8(0x01); // medium_threshold sub-command
        buffer.writeUInt8(fan_control_settings.medium_threshold);
        data = data.concat(buffer.toBytes());
    }
    if ("high_threshold" in fan_control_settings) {
        var buffer = new Buffer(3);
        buffer.writeUInt8(0x7e);
        buffer.writeUInt8(0x02); // high_threshold sub-command
        buffer.writeUInt8(fan_control_settings.high_threshold);
        data = data.concat(buffer.toBytes());
    }
    return data;
}

/**
 * Set DI settings
 * @param {object} di_settings
 * @param {number} di_settings.enable values: (0: disable, 1: enable)
 * @param {number} di_settings.type values: (0: card_control, 1: magnet_detection)
 * @param {object} di_settings.card_control
 * @param {object} di_settings.magnet_detection
 */
function setDISettings(di_settings) {
    var data = [];
    if ("enable" in di_settings) {
        data = data.concat(setDIEnable(di_settings.enable));
    }
    if ("type" in di_settings) {
        var type = di_settings.type;
        var type_map = { 0: "card_control", 1: "magnet_detection" };
        var type_values = getValues(type_map);
        if (type_values.indexOf(type) === -1) {
            throw new Error("di_settings.type must be one of " + type_values.join(", "));
        }
        if ("card_control" in di_settings) {
            data = data.concat(setCardConfig(di_settings.card_control));
        }
        if ("magnet_detection" in di_settings) {
            data = data.concat(setOpenWindowConfig(di_settings.magnet_detection));
        }
    }
    return data;
}

/**
 * Set DI enable
 * @param {number} di_enable values: (0: disable, 1: enable)
 * @example { "di_enable": 0 }
 */
function setDIEnable(di_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(di_enable) === -1) {
        throw new Error("di_settings.enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(2);
    buffer.writeUInt8(0x80);
    buffer.writeUInt8(getValue(enable_map, di_enable));
    return buffer.toBytes();
}

/**
 * Set card config
 * @param {objectF} card_control
 * @param {number} card_control.mode values: (0: power, 1: plan)
 * @param {number} card_control.system_status values: (0: on, 1: off)
 * @param {number} card_control.in_plan_id range: [1, 16]
 * @param {number} card_control.out_plan_id range: [1, 16]
 * @example { "card_control": { "mode": 0, "system_status": 0 } }
 */
function setCardConfig(card_control) {
    var mode = card_control.mode;

    var mode_map = { 0: "power", 1: "plan" };
    var mode_values = getValues(mode_map);
    if (mode_values.indexOf(mode) === -1) {
        throw new Error("di_settings.card_control.mode must be one of " + mode_values.join(", "));
    }

    var mode_value = getValue(mode_map, mode);
    if (mode_value === 0) {
        var on_off_map = { 0: "off", 1: "on" };
        var on_off_values = getValues(on_off_map);
        var system_status = card_control.system_status;
        if (on_off_values.indexOf(system_status) === -1) {
            throw new Error("di_settings.card_control.system_status must be one of " + on_off_values.join(", "));
        }
        var buffer = new Buffer(4);
        buffer.writeUInt8(0x81);
        buffer.writeUInt8(0x00);
        buffer.writeUInt8(0x00);
        buffer.writeUInt8(getValue(on_off_map, system_status));
        return buffer.toBytes();
    } else if (mode_value === 1) {
        var in_plan_id = card_control.in_plan_id;
        var out_plan_id = card_control.out_plan_id;
        if (in_plan_id < 1 || in_plan_id > 16) {
            throw new Error("di_settings.card_control.in_plan_id must be between 1 and 16");
        }
        if (out_plan_id < 1 || out_plan_id > 16) {
            throw new Error("di_settings.card_control.out_plan_id must be between 1 and 16");
        }

        var buffer = new Buffer(5);
        buffer.writeUInt8(0x81);
        buffer.writeUInt8(0x00);
        buffer.writeUInt8(0x01);
        buffer.writeUInt8(in_plan_id - 1);
        buffer.writeUInt8(out_plan_id - 1);
        return buffer.toBytes();
    }
}

/**
 * Set open window config
 * @param {object} magnet_detection
 * @param {number} magnet_detection.mode values: (0: normally_close, 1: normally_open)
 * @example { "magnet_detection": { "mode": 0 } }
 */
function setOpenWindowConfig(magnet_detection) {
    var mode = magnet_detection.mode;
    var mode_map = { 0: "normally_close", 1: "normally_open" };
    var mode_values = getValues(mode_map);
    if (mode_values.indexOf(mode) === -1) {
        throw new Error("di_settings.magnet_detection.mode must be one of " + mode_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0x81);
    buffer.writeUInt8(0x01);
    buffer.writeUInt8(getValue(mode_map, mode));
    return buffer.toBytes();
}

/**
 * Set window opening detection settings
 * @param {object} window_opening_detection_settings
 * @param {number} window_opening_detection_settings.enable values: (0: disable, 1: enable)
 * @param {number} window_opening_detection_settings.type values: (0: temperature_detection, 1: magnet_detection)
 * @param {object} window_opening_detection_settings.temperature_detection
 * @param {object} window_opening_detection_settings.magnet_detection
 * @example { "window_opening_detection_settings": { "type": 0 } }
 */
function setWindowOpeningDetectionSettings(window_opening_detection_settings) {
    var data = [];
    if ("enable" in window_opening_detection_settings) {
        data = data.concat(setWindowOpeningDetectionEnable(window_opening_detection_settings.enable));
    }
    if ("type" in window_opening_detection_settings) {
        var type = window_opening_detection_settings.type;
        var type_map = { 0: "temperature_detection", 1: "magnet_detection" };
        var type_values = getValues(type_map);
        if (type_values.indexOf(type) === -1) {
            throw new Error("window_opening_detection_settings.type must be one of " + type_values.join(", "));
        }
        if ("temperature_detection" in window_opening_detection_settings) {
            data = data.concat(setWindowOpeningDetectionTemperatureDetection(window_opening_detection_settings.temperature_detection));
        }
        if ("magnet_detection" in window_opening_detection_settings) {
            data = data.concat(setWindowOpeningDetectionMagnetDetection(window_opening_detection_settings.magnet_detection));
        }
    }
    return data;
}

/**
 * Set window opening detection enable
 * @param {number} enable values: (0: disable, 1: enable)
 * @example { "enable": 0 }
 */
function setWindowOpeningDetectionEnable(enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("window_opening_detection_settings.enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(2);
    buffer.writeUInt8(0x82);
    buffer.writeUInt8(getValue(enable_map, enable));
    return buffer.toBytes();
}

/**
 * Set window opening detection temperature detection
 * @param {object} temperature_detection
 * @param {number} temperature_detection.delta_temperature, unit: celsius, range: [1, 10]
 * @param {number} temperature_detection.duration, unit: minute, range: [1, 60]
 * @example { "temperature_detection": { "delta_temperature": 1, "duration": 1 } }
 */
function setWindowOpeningDetectionTemperatureDetection(temperature_detection) {
    var delta_temperature = temperature_detection.delta_temperature;
    var duration = temperature_detection.duration;
    if (delta_temperature < 1 || delta_temperature > 10) {
        throw new Error("window_opening_detection_settings.temperature_detection.delta_temperature must be between 1 and 10");
    }
    if (duration < 1 || duration > 60) {
        throw new Error("window_opening_detection_settings.temperature_detection.duration must be between 1 and 60");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0x83);
    buffer.writeUInt8(0x00); // temperature detection sub-command
    buffer.writeInt16LE(delta_temperature * 100);
    buffer.writeUInt8(duration);
    return buffer.toBytes();
}

/**
 * Set window opening detection magnet detection
 * @param {object} magnet_detection
 * @param {number} magnet_detection.duration, unit: minute, range: [1, 60]
 * @example { "magnet_detection": { "duration": 1 } }
 */
function setWindowOpeningDetectionMagnetDetection(magnet_detection) {
    var duration = magnet_detection.duration;
    if (duration < 1 || duration > 60) {
        throw new Error("window_opening_detection_settings.magnet_detection.duration must be between 1 and 60");
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0x83);
    buffer.writeUInt8(0x01); // magnet detection sub-command
    buffer.writeUInt8(duration);
    return buffer.toBytes();
}

/**
 * Set freeze protection config
 * @param {object} freeze_protection_settings
 * @param {number} freeze_protection_settings.enable values: (0: disable, 1: enable)
 * @param {number} freeze_protection_settings.target_temperature unit: celsius, range: [1, 5]
 * @example { "freeze_protection_settings": { "enable": 0, "target_temperature": 0 } }
 */
function setFreezeProtectionConfig(freeze_protection_settings) {
    var enable = freeze_protection_settings.enable;
    var target_temperature = freeze_protection_settings.target_temperature;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("freeze_protection_settings.enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0x84);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeInt16LE(target_temperature * 100);
    return buffer.toBytes();
}

/**
 * Set temperature source config
 * @param {object} temperature_source_settings
 * @param {number} temperature_source_settings.source values: (0: internal, 1: ntc, 2: lorawan, 3: d2d)
 * @param {number} temperature_source_settings.duration, unit: minute, range: [1, 60]
 * @param {number} temperature_source_settings.missing_data_action values: (0: hold, 1: off_or_fan_control, 2: switch_to_internal)
 * @example { "temperature_source_settings": { "source": 0 } }
 */
function setTemperatureSourceConfig(temperature_source_settings) {
    var source = temperature_source_settings.source;

    var source_map = { 0: "internal", 1: "ntc", 2: "lorawan", 3: "d2d" };
    var source_values = getValues(source_map);
    if (source_values.indexOf(source) === -1) {
        throw new Error("temperature_source_settings.source must be one of " + source_values.join(", "));
    }

    var source_value = getValue(source_map, source);
    if (source_value === 0 || source_value === 1) {
        var buffer = new Buffer(2);
        buffer.writeUInt8(0x85);
        buffer.writeUInt8(source_value);
        return buffer.toBytes();
    } else if (source_value === 2 || source_value === 3) {
        var duration = temperature_source_settings.duration;
        var missing_data_action = temperature_source_settings.missing_data_action;
        var action_map = { 0: "hold", 1: "off_or_fan_control", 2: "switch_to_internal" };
        var action_values = getValues(action_map);
        if (action_values.indexOf(missing_data_action) === -1) {
            throw new Error("temperature_source_settings.missing_value_action must be one of " + action_values.join(", "));
        }

        var buffer = new Buffer(4);
        buffer.writeUInt8(0x85);
        buffer.writeUInt8(source_value);
        buffer.writeUInt8(duration);
        buffer.writeUInt8(getValue(action_map, missing_data_action));
        return buffer.toBytes();
    }
}

/**
 * Set D2D enable
 * @param {number} d2d_pairing_enable values: (0: disable, 1: enable)
 * @example { "d2d_pairing_enable": 0 }
 */
function setD2DEnable(d2d_pairing_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(d2d_pairing_enable) === -1) {
        throw new Error("d2d_pairing_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(2);
    buffer.writeUInt8(0x86);
    buffer.writeUInt8(getValue(enable_map, d2d_pairing_enable));
    return buffer.toBytes();
}

/**
 * Set D2D config
 * @param {object} d2d_pairing_settings
 * @param {number} d2d_pairing_settings.index range: [1, 16]
 * @param {number} d2d_pairing_settings.enable values: (0: disable, 1: enable)
 * @param {string} d2d_pairing_settings.eui
 * @param {string} d2d_pairing_settings.name_first
 * @param {string} d2d_pairing_settings.name_last
 * @example { "d2d_pairing_settings": [{ "index": 1, "enable": 0, "eui": "0000000000000000", "name_first": "test", "name_last": "test" }] }
 */
function setD2DPairingSettings(d2d_pairing_settings) {
    var index = d2d_pairing_settings.index;
    if (index < 1 || index > 16) {
        throw new Error("d2d_pairing_settings._item.index must be between 1 and 16");
    }

    var data = [];
    if ("enable" in d2d_pairing_settings) {
        data = data.concat(setD2DPairingEnable(index - 1, d2d_pairing_settings.enable));
    }
    if ("eui" in d2d_pairing_settings) {
        data = data.concat(setD2DPairingDeviceEui(index - 1, d2d_pairing_settings.eui));
    }
    if ("name_first" in d2d_pairing_settings) {
        data = data.concat(setD2DPairingNameFirst(index - 1, d2d_pairing_settings.name_first));
    }
    if ("name_last" in d2d_pairing_settings) {
        data = data.concat(setD2DPairingNameLast(index - 1, d2d_pairing_settings.name_last));
    }
    return data;
}

/**
 * Set D2D pairing enable
 * @param {number} index range: [1, 5]
 * @param {number} enable values: (0: disable, 1: enable)
 * @example { "d2d_pairing_settings": [{ "index": 1, "enable": 0 }] }
 */
function setD2DPairingEnable(index, enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("d2d_pairing_settings._item.enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0x87);
    buffer.writeUInt8(index);
    buffer.writeUInt8(0x00); // pairing enable sub-command
    buffer.writeUInt8(getValue(enable_map, enable));
    return buffer.toBytes();
}

/**
 * Set D2D pairing device EUI
 * @param {number} index range: [1, 5]
 * @param {string} eui
 * @example { "d2d_pairing_settings": [{ "index": 1, "eui": "0000000000000000" }] }
 */
function setD2DPairingDeviceEui(index, eui) {
    if (eui.length !== 16) {
        throw new Error("d2d_pairing_settings._item.eui length must be 16");
    }
    var buffer = new Buffer(11);
    buffer.writeUInt8(0x87);
    buffer.writeUInt8(index);
    buffer.writeUInt8(0x01); // pairing device EUI sub-command
    buffer.writeHexString(eui);
    return buffer.toBytes();
}

/**
 * Set D2D pairing name
 * @param {number} index range: [1, 5]
 * @param {string} name
 * @example { "d2d_pairing_settings": [{ "index": 1, "name": "test" }] }
 */
function setD2DPairingNameFirst(index, name_first) {
    if (name_first.length > 16) {
        throw new Error("d2d_pairing_settings._item.name_first length must be less than 16");
    }

    var firstBuffer = new Buffer(11);
    firstBuffer.writeUInt8(0x87);
    firstBuffer.writeUInt8(index);
    firstBuffer.writeUInt8(0x02); // First part command
    firstBuffer.writeBytes(encodeUtf8(name_first));
    return firstBuffer.toBytes();
}

/**
 * Set D2D pairing name last
 * @param {number} index range: [1, 5]
 * @param {string} name_last
 * @example { "d2d_pairing_settings": [{ "index": 1, "name_last": "test" }] }
 */
function setD2DPairingNameLast(index, name_last) {
    if (name_last.length > 16) {
        throw new Error("d2d_pairing_settings._item.name_last length must be less than 16");
    }

    var lastBuffer = new Buffer(11);
    lastBuffer.writeUInt8(0x87);
    lastBuffer.writeUInt8(index);
    lastBuffer.writeUInt8(0x03); // Last part command
    lastBuffer.writeBytes(encodeUtf8(name_last));
    return lastBuffer.toBytes();
}

/**
 * Set D2D master enable
 * @param {number} d2d_master_enable values: (0: disable, 1: enable)
 * @example { "d2d_master_enable": 0 }
 */
function setD2DMasterEnable(d2d_master_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(d2d_master_enable) === -1) {
        throw new Error("d2d_master_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(2);
    buffer.writeUInt8(0x88);
    buffer.writeUInt8(getValue(enable_map, d2d_master_enable));
    return buffer.toBytes();
}

/**
 * Set D2D master settings
 * @param {object} d2d_master_settings
 * @param {number} d2d_master_settings._item.trigger_source values: (0: plan_1, 1: plan_2, 2: plan_3, 3: plan_4, 4: plan_5, 5: plan_6, 6: plan_7, 7: plan_8, 8: plan_9, 9: plan_10, 10: plan_11, 11: plan_12, 12: plan_13, 14: plan_15, 15: plan_16, 16: system_status_off, 17: system_status_on)
 * @param {number} d2d_master_settings._item.enable values: (0: disable, 1: enable)
 * @param {number} d2d_master_settings._item.lora_uplink_enable values: (0: disable, 1: enable)
 * @param {string} d2d_master_settings._item.command
 * @param {number} d2d_master_settings._item.time_enable values: (0: disable, 1: enable)
 * @param {number} d2d_master_settings._item.time
 * @example { "d2d_master_settings": [{ "index": 1, "trigger_source": 0, "enable": 0, "lora_uplink_enable": 0, "command": "0000000000000000", "time_enable": 0, "time": 0 }] }
 */
function setD2DMasterSettings(d2d_master_settings) {
    var trigger_source = d2d_master_settings.trigger_source;
    var enable = d2d_master_settings.enable;
    var lora_uplink_enable = d2d_master_settings.lora_uplink_enable;
    var command = d2d_master_settings.command;
    var time_enable = d2d_master_settings.time_enable;
    var time = d2d_master_settings.time;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("d2d_master_settings._item.enable must be one of " + enable_values.join(", "));
    }
    if (enable_values.indexOf(lora_uplink_enable) === -1) {
        throw new Error("d2d_master_settings._item.lora_uplink_enable must be one of " + enable_values.join(", "));
    }
    var trigger_source_map = { 0: "plan_1", 1: "plan_2", 2: "plan_3", 3: "plan_4", 4: "plan_5", 5: "plan_6", 6: "plan_7", 7: "plan_8", 8: "plan_9", 9: "plan_10", 10: "plan_11", 11: "plan_12", 12: "plan_13", 14: "plan_15", 15: "plan_16", 16: "system_status_off", 17: "system_status_on" };
    var trigger_source_values = getValues(trigger_source_map);
    if (trigger_source_values.indexOf(trigger_source) === -1) {
        throw new Error("d2d_master_settings._item.trigger_source must be one of " + trigger_source_values.join(", "));
    }
    if (command.length !== 4) {
        throw new Error("d2d_master_settings._item.command length must be 4");
    }

    var buffer = new Buffer(9);
    buffer.writeUInt8(0x89);
    buffer.writeUInt8(getValue(trigger_source_map, trigger_source));
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt8(getValue(enable_map, lora_uplink_enable));
    buffer.writeHexStringReverse(command);
    buffer.writeUInt8(getValue(enable_map, time_enable));
    buffer.writeUInt16LE(time);
    return buffer.toBytes();
}

/**
 * Set D2D slave enable
 * @param {number} d2d_slave_enable values: (0: disable, 1: enable)
 * @example { "d2d_slave_enable": 0 }
 */
function setD2DSlaveEnable(d2d_slave_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(d2d_slave_enable) === -1) {
        throw new Error("d2d_slave_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(2);
    buffer.writeUInt8(0x8a);
    buffer.writeUInt8(getValue(enable_map, d2d_slave_enable));
    return buffer.toBytes();
}

/**
 * Set D2D slave settings
 * @param {object} d2d_slave_settings
 * @param {number} d2d_slave_settings._item.index range: [1, 16]
 * @param {number} d2d_slave_settings._item.enable values: (0: disable, 1: enable)
 * @param {string} d2d_slave_settings._item.command
 * @param {string} d2d_slave_settings._item.trigger_target values: (0: plan_1, 1: plan_2, 2: plan_3, 3: plan_4, 4: plan_5, 5: plan_6, 6: plan_7, 7: plan_8, 8: plan_9, 9: plan_10, 10: plan_11, 11: plan_12, 12: plan_13, 14: plan_15, 15: plan_16, 16: system_status_on, 17: system_status_off, 18: system_status_toggle, 19: window_open, 20: window_close)
 * @example { "d2d_slave_settings": [{ "index": 1, "enable": 0, "command": "0000", "trigger_target": 0 }] }
 */
function setD2DSlaveSettings(d2d_slave_settings) {
    var index = d2d_slave_settings.index;
    var enable = d2d_slave_settings.enable;
    var command = d2d_slave_settings.command;
    var trigger_target = d2d_slave_settings.trigger_target;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("d2d_slave_settings._item.enable must be one of " + enable_values.join(", "));
    }
    var index_values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
    if (index_values.indexOf(index) === -1) {
        throw new Error("d2d_slave_settings._item.index must be one of " + index_values.join(", "));
    }
    var trigger_target_map = { 0: "plan_1", 1: "plan_2", 2: "plan_3", 3: "plan_4", 4: "plan_5", 5: "plan_6", 6: "plan_7", 7: "plan_8", 8: "plan_9", 9: "plan_10", 10: "plan_11", 11: "plan_12", 12: "plan_13", 14: "plan_15", 15: "plan_16", 16: "system_status_off", 17: "system_status_on" };
    var trigger_target_values = getValues(trigger_target_map);
    if (trigger_target_values.indexOf(trigger_target) === -1) {
        throw new Error("d2d_slave_settings._item.trigger_target must be one of " + trigger_target_values.join(", "));
    }

    var buffer = new Buffer(6);
    buffer.writeUInt8(0x8b);
    buffer.writeUInt8(index - 1);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeHexStringReverse(command);
    buffer.writeUInt8(getValue(trigger_target_map, trigger_target));
    return buffer.toBytes();
}

/**
 * Set timed system control settings
 * @param {object} timed_system_control_settings
 * @param {number} timed_system_control_settings.enable values: (0: disable, 1: enable)
 * @param {Array} timed_system_control_settings.start_cycle_settings
 * @param {Array} timed_system_control_settings.end_cycle_settings
 */
function setTimedSystemControlSettings(timed_system_control_settings) {
    var data = [];
    if ("enable" in timed_system_control_settings) {
        data = data.concat(setTimedSystemControlEnable(timed_system_control_settings.enable));
    }
    if ("start_cycle_settings" in timed_system_control_settings) {
        for (var i = 0; i < timed_system_control_settings.start_cycle_settings.length; i++) {
            data = data.concat(setTimedSystemControlStartTimeCycle(timed_system_control_settings.start_cycle_settings[i]));
        }
    }
    if ("end_cycle_settings" in timed_system_control_settings) {
        for (var i = 0; i < timed_system_control_settings.end_cycle_settings.length; i++) {
            data = data.concat(setTimedSystemControlEndTimeCycle(timed_system_control_settings.end_cycle_settings[i]));
        }
    }
    return data;
}

/**
 * Set timed system control enable
 * @param {number} enable values: (0: disable, 1: enable)
 * @example { "enable": 0 }
 */
function setTimedSystemControlEnable(enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("timed_system_control_settings.enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0x8c);
    buffer.writeUInt8(0x00);
    buffer.writeUInt8(getValue(enable_map, enable));
    return buffer.toBytes();
}

/**
 * Set system auto work config
 * @param {object} start_cycle_settings
 * @param {number} start_cycle_settings._item.index range: [1, 2]
 * @param {number} start_cycle_settings._item.enable values: (0: disable, 1: enable)
 * @param {number} start_cycle_settings._item.time converter: 08:30 -> 08 * 60 + 30 = 510
 * @param {object} start_cycle_settings._item.weekday
 * @param {number} start_cycle_settings._item.weekday.sunday values: (0: disable, 1: enable)
 * @param {number} start_cycle_settings._item.weekday.monday values: (0: disable, 1: enable)
 * @param {number} start_cycle_settings._item.weekday.tuesday values: (0: disable, 1: enable)
 * @param {number} start_cycle_settings._item.weekday.wednesday values: (0: disable, 1: enable)
 * @param {number} start_cycle_settings._item.weekday.thursday values: (0: disable, 1: enable)
 * @param {number} start_cycle_settings._item.weekday.friday values: (0: disable, 1: enable)
 * @param {number} start_cycle_settings._item.weekday.saturday values: (0: disable, 1: enable)
 */
function setTimedSystemControlStartTimeCycle(start_cycle_settings) {
    var index = start_cycle_settings.index;
    var enable = start_cycle_settings.enable;
    var time = start_cycle_settings.time;
    var weekday = start_cycle_settings.weekday;

    var index_values = [1, 2, 3, 4];
    if (index_values.indexOf(index) === -1) {
        throw new Error("start_cycle_settings._item.index must be one of " + index_values.join(", "));
    }
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("start_cycle_settings._item.enable must be one of " + enable_values.join(", "));
    }

    var weekday_data = 0x00;
    var week_bits_offset = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
    for (var key in week_bits_offset) {
        if (key in weekday) {
            if (enable_values.indexOf(weekday[key]) === -1) {
                throw new Error("start_cycle_settings._item.weekday." + key + " must be one of " + enable_values.join(", "));
            }
            weekday_data |= getValue(enable_map, weekday[key]) << week_bits_offset[key];
        }
    }
    var buffer = new Buffer(7);
    buffer.writeUInt8(0x8c);
    buffer.writeUInt8(0x01); // sub-command (start time)
    buffer.writeUInt8(index - 1);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt16LE(time);
    buffer.writeUInt8(weekday_data);
    return buffer.toBytes();
}

/**
 * Set system auto work config
 * @param {object} end_cycle_settings
 * @param {number} end_cycle_settings._item.index range: [1, 2]
 * @param {number} end_cycle_settings._item.enable values: (0: disable, 1: enable)
 * @param {number} end_cycle_settings._item.time converter: 08:30 -> 08 * 60 + 30 = 510
 * @param {object} end_cycle_settings._item.weekday
 * @param {number} end_cycle_settings._item.weekday.sunday values: (0: disable, 1: enable)
 * @param {number} end_cycle_settings._item.weekday.monday values: (0: disable, 1: enable)
 * @param {number} end_cycle_settings._item.weekday.tuesday values: (0: disable, 1: enable)
 * @param {number} end_cycle_settings._item.weekday.wednesday values: (0: disable, 1: enable)
 * @param {number} end_cycle_settings._item.weekday.thursday values: (0: disable, 1: enable)
 * @param {number} end_cycle_settings._item.weekday.friday values: (0: disable, 1: enable)
 * @param {number} end_cycle_settings._item.weekday.saturday values: (0: disable, 1: enable)
 */
function setTimedSystemControlEndTimeCycle(end_cycle_settings) {
    var index = end_cycle_settings.index;
    var enable = end_cycle_settings.enable;
    var time = end_cycle_settings.time;
    var weekday = end_cycle_settings.weekday;

    var index_values = [1, 2, 3, 4];
    if (index_values.indexOf(index) === -1) {
        throw new Error("end_cycle_settings._item.index must be one of " + index_values.join(", "));
    }
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("end_cycle_settings._item.enable must be one of " + enable_values.join(", "));
    }

    var weekday_data = 0x00;
    var week_bits_offset = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
    for (var key in week_bits_offset) {
        if (key in weekday) {
            if (enable_values.indexOf(weekday[key]) === -1) {
                throw new Error("end_cycle_settings._item.weekday." + key + " must be one of " + enable_values.join(", "));
            }
            weekday_data |= getValue(enable_map, weekday[key]) << week_bits_offset[key];
        }
    }
    var buffer = new Buffer(7);
    buffer.writeUInt8(0x8c);
    buffer.writeUInt8(0x02); // sub-command (end time)
    buffer.writeUInt8(index - 1);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt16LE(time);
    buffer.writeUInt8(weekday_data);
    return buffer.toBytes();
}

/**
 * Set button temporary unlocked config
 * @param {object} temporary_unlock_settings
 * @param {number} temporary_unlock_settings.system_button values: (0: disable, 1: enable)
 * @param {number} temporary_unlock_settings.temperature_up_button values: (0: disable, 1: enable)
 * @param {number} temporary_unlock_settings.temperature_down_button values: (0: disable, 1: enable)
 * @param {number} temporary_unlock_settings.fan_button values: (0: disable, 1: enable)
 * @param {number} temporary_unlock_settings.temperature_control_mode_button values: (0: disable, 1: enable)
 * @param {number} temporary_unlock_settings.duration unit: seconds, range: [1, 3600]
 * @example { "temporary_unlock_settings": { "system_button": 0, "temperature_up_button": 0, "temperature_down_button": 0, "fan_button": 0, "temperature_control_mode_button": 0, "duration": 10 } }
 */
function setButtonTemporaryUnlockedConfig(temporary_unlock_settings) {
    var duration = temporary_unlock_settings.duration;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (duration < 1 || duration > 3600) {
        throw new Error("temporary_unlock_settings.duration must be between 1 and 3600");
    }

    var data = 0x00;
    var unlock_bits_offset = { system_button: 0, temperature_up_button: 1, temperature_down_button: 2, fan_button: 3, temperature_control_mode_button: 4 };
    for (var key in unlock_bits_offset) {
        if (key in temporary_unlock_settings) {
            if (enable_values.indexOf(temporary_unlock_settings[key]) === -1) {
                throw new Error("temporary_unlock_settings." + key + " must be one of " + enable_values.join(", "));
            }
            data |= getValue(enable_map, temporary_unlock_settings[key]) << unlock_bits_offset[key];
        }
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0x8d);
    buffer.writeUInt8(data);
    buffer.writeUInt16LE(duration);
    return buffer.toBytes();
}

/**
 * Set temperature control with standby fan mode
 * @param {number} temperature_control_with_standby_fan_mode values: (0: low, 1: stop)
 * @example { "temperature_control_with_standby_fan_mode": 0 }
 */
function setTemperatureControlWithStandbyFanMode(temperature_control_with_standby_fan_mode) {
    var mode = { 0: "low", 1: "stop" };
    var mode_values = getValues(mode);
    if (mode_values.indexOf(temperature_control_with_standby_fan_mode) === -1) {
        throw new Error("temperature_control_with_standby_fan_mode must be one of " + mode_values.join(", "));
    }

    var buffer = new Buffer(2);
    buffer.writeUInt8(0x8e);
    buffer.writeUInt8(getValue(mode, temperature_control_with_standby_fan_mode));
    return buffer.toBytes();
}

/**
 * Set valve opening negative valve mode
 * @param {number} valve_opening_negative_valve_mode values: (0: low, 1: stop)
 * @example { "valve_opening_negative_valve_mode": 0 }
 */
function setValveOpeningNegativeValveMode(valve_opening_negative_valve_mode) {
    var mode = { 0: "low", 1: "stop" };
    var mode_values = getValues(mode);
    if (mode_values.indexOf(valve_opening_negative_valve_mode) === -1) {
        throw new Error("valve_opening_negative_valve_mode must be one of " + mode_values.join(", "));
    }

    var buffer = new Buffer(2);
    buffer.writeUInt8(0x8f);
    buffer.writeUInt8(getValue(mode, valve_opening_negative_valve_mode));
    return buffer.toBytes();
}

/**
 * Set relay change report enable
 * @param {number} relay_changes_report_enable values: (0: disable, 1: enable)
 * @example { "relay_changes_report_enable": 1 }
 */
function setRelayChangeReportEnable(relay_changes_report_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(relay_changes_report_enable) === -1) {
        throw new Error("relay_changes_report_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(2);
    buffer.writeUInt8(0x90);
    buffer.writeUInt8(getValue(enable_map, relay_changes_report_enable));
    return buffer.toBytes();
}

/**
 * Set time zone
 * @param {number} time_zone unit: minute, convert: "hh:mm" -> "hh * 60 + mm", values: ( -720: UTC-12, -660: UTC-11, -600: UTC-10, -570: UTC-9:30, -540: UTC-9, -480: UTC-8, -420: UTC-7, -360: UTC-6, -300: UTC-5, -240: UTC-4, -210: UTC-3:30, -180: UTC-3, -120: UTC-2, -60: UTC-1, 0: UTC, 60: UTC+1, 120: UTC+2, 180: UTC+3, 240: UTC+4, 300: UTC+5, 360: UTC+6, 420: UTC+7, 480: UTC+8, 540: UTC+9, 570: UTC+9:30, 600: UTC+10, 660: UTC+11, 720: UTC+12, 765: UTC+12:45, 780: UTC+13, 840: UTC+14 )
 * @example { "time_zone": 480 }
 */
function setTimeZone(time_zone) {
    var timezone_map = { "-720": "UTC-12", "-660": "UTC-11", "-600": "UTC-10", "-570": "UTC-9:30", "-540": "UTC-9", "-480": "UTC-8", "-420": "UTC-7", "-360": "UTC-6", "-300": "UTC-5", "-240": "UTC-4", "-210": "UTC-3:30", "-180": "UTC-3", "-120": "UTC-2", "-60": "UTC-1", 0: "UTC", 60: "UTC+1", 120: "UTC+2", 180: "UTC+3", 210: "UTC+3:30", 240: "UTC+4", 270: "UTC+4:30", 300: "UTC+5", 330: "UTC+5:30", 345: "UTC+5:45", 360: "UTC+6", 390: "UTC+6:30", 420: "UTC+7", 480: "UTC+8", 540: "UTC+9", 570: "UTC+9:30", 600: "UTC+10", 630: "UTC+10:30", 660: "UTC+11", 720: "UTC+12", 765: "UTC+12:45", 780: "UTC+13", 840: "UTC+14" };
    var timezone_values = getValues(timezone_map);
    if (timezone_values.indexOf(time_zone) === -1) {
        throw new Error("time_zone must be one of " + timezone_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xc7);
    buffer.writeInt16LE(getValue(timezone_map, time_zone));
    return buffer.toBytes();
}

/**
 * Set daylight saving time settings
 * @param {object} daylight_saving_time
 * @param {number} daylight_saving_time.enable values: (0: disable, 1: enable)
 * @param {number} daylight_saving_time.offset unit: minute
 * @param {number} daylight_saving_time.start_month values: (1: January, 2: February, 3: March, 4: April, 5: May, 6: June, 7: July, 8: August, 9: September, 10: October, 11: November, 12: December)
 * @param {number} daylight_saving_time.start_week_num values: (1: First week, 2: Second week, 3: Third week, 4: Fourth week, 5: Last week)
 * @param {number} daylight_saving_time.start_week_day values: (1: Monday, 2: Tuesday, 3: Wednesday, 4: Thursday, 5: Friday, 6: Saturday, 7: Sunday)
 * @param {number} daylight_saving_time.start_hour_min unit: minutes
 * @param {number} daylight_saving_time.end_month values: (1: January, 2: February, 3: March, 4: April, 5: May, 6: June, 7: July, 8: August, 9: September, 10: October, 11: November, 12: December)
 * @param {number} daylight_saving_time.end_week_num values: (1: First week, 2: Second week, 3: Third week, 4: Fourth week, 5: Last week)
 * @param {number} daylight_saving_time.end_week_day values: (1: Monday, 2: Tuesday, 3: Wednesday, 4: Thursday, 5: Friday, 6: Saturday, 7: Sunday)
 * @param {number} daylight_saving_time.end_hour_min unit: minute
 * @example { "daylight_saving_time": { "enable": 1, "offset": 60, "start_month": 3, "start_week": 1, "start_day": 1, "start_time": 0, "end_month": 11, "end_week": 4, "end_day": 7, "end_time": 120 } }
 */
function setDaylightSavingTimeSettings(daylight_saving_time) {
    var enable = daylight_saving_time.enable;
    var offset = daylight_saving_time.offset;
    var start_month = daylight_saving_time.start_month;
    var start_week_num = daylight_saving_time.start_week_num;
    var start_week_day = daylight_saving_time.start_week_day;
    var start_hour_min = daylight_saving_time.start_hour_min;
    var end_month = daylight_saving_time.end_month;
    var end_week_num = daylight_saving_time.end_week_num;
    var end_week_day = daylight_saving_time.end_week_day;
    var end_hour_min = daylight_saving_time.end_hour_min;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("daylight_saving_time.enable must be one of " + enable_values.join(", "));
    }
    var month_values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    if (month_values.indexOf(start_month) === -1 || month_values.indexOf(end_month) === -1) {
        throw new Error("daylight_saving_time.start_month and end_month must be one of " + month_values.join(", "));
    }
    var week_values = [1, 2, 3, 4, 5];
    if (week_values.indexOf(start_week_num) === -1 || week_values.indexOf(end_week_num) === -1) {
        throw new Error("daylight_saving_time.start_week_num and end_week_num must be one of " + week_values.join(", "));
    }
    var day_values = [1, 2, 3, 4, 5, 6, 7];
    if (day_values.indexOf(start_week_day) === -1 || day_values.indexOf(end_week_day) === -1) {
        throw new Error("daylight_saving_time.start_week_day and end_week_day must be one of " + day_values.join(", "));
    }

    var start_day_value = (start_week_num << 4) | start_week_day;
    var end_day_value = (end_week_num << 4) | end_week_day;

    var buffer = new Buffer(11);
    buffer.writeUInt8(0xc6);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeUInt8(offset);
    buffer.writeUInt8(start_month);
    buffer.writeUInt8(start_day_value);
    buffer.writeUInt16LE(start_hour_min);
    buffer.writeUInt8(end_month);
    buffer.writeUInt8(end_day_value);
    buffer.writeUInt16LE(end_hour_min);
    return buffer.toBytes();
}

/**
 * Set auto provisioning enable
 * @param {number} auto_provisioning_enable values: (0: disable, 1: enable)
 * @example { "auto_provisioning_enable": { "enable": 1 } }
 */
function setAutoProvisioningEnable(auto_provisioning_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(auto_provisioning_enable) === -1) {
        throw new Error("auto_provisioning_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(2);
    buffer.writeUInt8(0xc4);
    buffer.writeUInt8(getValue(enable_map, auto_provisioning_enable));
    return buffer.toBytes();
}

/**
 * Set history transmit config
 * @param {object} history_transmit_settings
 * @param {number} history_transmit_settings.enable values: (0: disable, 1: enable)
 * @param {number} history_transmit_settings.retransmission_interval unit: seconds, range: [30, 1200]
 * @param {number} history_transmit_settings.resend_interval unit: seconds, range: [30, 1200]
 * @example { "history_transmit_settings": { "enable": 1, "retransmission_interval": 60, "resend_interval": 60 } }
 */
function setHistoryConfig(history_transmit_settings) {
    var data = [];
    if ("enable" in history_transmit_settings) {
        var enable = history_transmit_settings.enable;
        var enable_map = { 0: "disable", 1: "enable" };
        var enable_values = getValues(enable_map);
        if (enable_values.indexOf(enable) === -1) {
            throw new Error("history_transmit_settings.enable must be one of " + enable_values.join(", "));
        }
        var buffer = new Buffer(3);
        buffer.writeUInt8(0xc5);
        buffer.writeUInt8(0x00);
        buffer.writeUInt8(getValue(enable_map, enable));
        data = data.concat(buffer.toBytes());
    }
    if ("retransmission_interval" in history_transmit_settings) {
        var retransmission_interval = history_transmit_settings.retransmission_interval;
        if (retransmission_interval < 30 || retransmission_interval > 1200) {
            throw new Error("history_transmit_settings.retransmission_interval must be between 30 and 1200");
        }
        var buffer = new Buffer(4);
        buffer.writeUInt8(0xc5);
        buffer.writeUInt8(0x01);
        buffer.writeUInt16LE(retransmission_interval);
        data = data.concat(buffer.toBytes());
    }
    if ("resend_interval" in history_transmit_settings) {
        var resend_interval = history_transmit_settings.resend_interval;
        if (resend_interval < 30 || resend_interval > 1200) {
            throw new Error("history_transmit_settings.resend_interval must be between 30 and 1200");
        }
        var buffer = new Buffer(4);
        buffer.writeUInt8(0xc5);
        buffer.writeUInt8(0x02);
        buffer.writeUInt16LE(resend_interval);
        data = data.concat(buffer.toBytes());
    }
    return data;
}

/**
 * Reboot
 * @example { "reboot": 1 }
 */
function reboot() {
    var buffer = new Buffer(1);
    buffer.writeUInt8(0xbe);
    return buffer.toBytes();
}

/**
 * Synchronize time
 * @example { "synchronize_time": 1 }
 */
function synchronizeTime() {
    var buffer = new Buffer(1);
    buffer.writeUInt8(0xb8);
    return buffer.toBytes();
}

/**
 * Query device status
 * @example { "query_device_status": 1 }
 */
function queryDeviceStatus() {
    var buffer = new Buffer(1);
    buffer.writeUInt8(0xb9);
    return buffer.toBytes();
}

/**
 * Reconnect
 * @example { "reconnect": 1 }
 */
function reconnect() {
    var buffer = new Buffer(1);
    buffer.writeUInt8(0xb6);
    return buffer.toBytes();
}

/**
 * Clear history
 * @example { "clear_history": 1 }
 */
function clearHistory() {
    var buffer = new Buffer(1);
    buffer.writeUInt8(0xbd);
    return buffer.toBytes();
}

/**
 * Fetch history
 * @example { "fetch_history": 1 }
 */
function fetchHistory(fetch_history) {
    var start_time = fetch_history.start_time;
    var end_time = fetch_history.end_time;

    var start_time = fetch_history.start_time;
    if ("end_time" in fetch_history) {
        var end_time = fetch_history.end_time;
        var buffer = new Buffer(9);
        buffer.writeUInt8(0xbb);
        buffer.writeUInt32LE(start_time);
        buffer.writeUInt32LE(end_time);
        return buffer.toBytes();
    } else {
        var buffer = new Buffer(5);
        buffer.writeUInt8(0xba);
        buffer.writeUInt32LE(start_time);
        return buffer.toBytes();
    }
}

/**
 * Stop transmit history
 * @example { "stop_transmit_history": 1 }
 */
function stopTransmitHistory() {
    var buffer = new Buffer(1);
    buffer.writeUInt8(0xbc);
    return buffer.toBytes();
}

/**
 * Set temperature
 * @param {number} temperature unit: °C, range: [-20, 60]
 * @example { "temperature": 25 }
 */
function setTemperature(temperature) {
    var buffer = new Buffer(3);
    buffer.writeUInt8(0x5b);
    buffer.writeInt16LE(temperature * 100);
    return buffer.toBytes();
}

/**
 * Set humidity
 * @param {number} humidity unit: %, range: [0, 100]
 * @example { "humidity": 50 }
 */
function setHumidity(humidity) {
    var buffer = new Buffer(3);
    buffer.writeUInt8(0x5c);
    buffer.writeInt16LE(humidity * 10);
    return buffer.toBytes();
}

/**
 * Set opening window status
 * @param {number} opening_window_alarm values: (0: release, 1: trigger)
 * @example { "opening_window_alarm": 1 }
 */
function setOpeningWindowStatus(opening_window_alarm) {
    var alarm_map = { 0: "release", 1: "trigger" };
    var alarm_values = getValues(alarm_map);
    if (alarm_values.indexOf(opening_window_alarm) === -1) {
        throw new Error("opening_window_alarm must be one of " + alarm_values.join(", "));
    }
    var buffer = new Buffer(2);
    buffer.writeUInt8(0x5d);
    buffer.writeUInt8(getValue(alarm_map, opening_window_alarm));
    return buffer.toBytes();
}

/**
 * Set plan
 * @param {number} insert_plan_id, range: [1, 16]
 * @example { "plan": 1 }
 */
function setPlan(insert_plan_id) {
    if (insert_plan_id < 1 || insert_plan_id > 16) {
        throw new Error("insert_plan_id must be between 1 and 16");
    }
    var buffer = new Buffer(2);
    buffer.writeUInt8(0x5e);
    buffer.writeUInt8(insert_plan_id - 1);
    return buffer.toBytes();
}

/**
 * Clear plan
 * @param {object} clear_plan
 * @param {number} clear_plan.plan_1 values: (0: no, 1: yes)
 * @param {number} clear_plan.plan_2 values: (0: no, 1: yes)
 * @param {number} clear_plan.plan_3 values: (0: no, 1: yes)
 * @param {number} clear_plan.plan_4 values: (0: no, 1: yes)
 * @param {number} clear_plan.plan_5 values: (0: no, 1: yes)
 * @param {number} clear_plan.plan_6 values: (0: no, 1: yes)
 * @param {number} clear_plan.plan_7 values: (0: no, 1: yes)
 * @param {number} clear_plan.plan_8 values: (0: no, 1: yes)
 * @param {number} clear_plan.plan_9 values: (0: no, 1: yes)
 * @param {number} clear_plan.plan_10 values: (0: no, 1: yes)
 * @param {number} clear_plan.plan_11 values: (0: no, 1: yes)
 * @param {number} clear_plan.plan_12 values: (0: no, 1: yes)
 * @param {number} clear_plan.plan_13 values: (0: no, 1: yes)
 * @param {number} clear_plan.plan_14 values: (0: no, 1: yes)
 * @param {number} clear_plan.plan_15 values: (0: no, 1: yes)
 * @param {number} clear_plan.plan_16 values: (0: no, 1: yes)
 * @param {number} clear_plan.reset values: (0: no, 1: yes)
 * @example { "clear_plan": { "plan_1": 1, "plan_2": 1, "plan_3": 1, "plan_4": 1, "plan_5": 1, "plan_6": 1, "plan_7": 1, "plan_8": 1, "plan_9": 1, "plan_10": 1 } }
 */
function clearPlan(clear_plan) {
    var plan_index_map = { plan_1: 0, plan_2: 1, plan_3: 2, plan_4: 3, plan_5: 4, plan_6: 5, plan_7: 6, plan_8: 7, plan_9: 8, plan_10: 9, plan_11: 10, plan_12: 11, plan_13: 12, plan_14: 13, plan_15: 14, plan_16: 15, reset: 255 };
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);

    var data = [];
    for (var key in plan_index_map) {
        if (key in clear_plan) {
            if (yes_no_values.indexOf(clear_plan[key]) === -1) {
                throw new Error("clear_plan." + key + " must be one of " + yes_no_values.join(", "));
            }
            var buffer = new Buffer(2);
            buffer.writeUInt8(0x5f);
            buffer.writeUInt8(plan_index_map[key]);
            data = data.concat(buffer.toBytes());
        }
    }
    return data;
}

function setQueryCmd(bytes) {
    var name_map = {
        "60": { level: 1, name: "collection_interval" },
        "62": { level: 1, name: "reporting_interval" },
        "63": { level: 1, name: "temperature_unit" },
        "64": { level: 1, name: "support_mode" },
        "65": { level: 1, name: "intelligent_display_enable" },
        "66": { level: 1, name: "screen_object_settings" },
        "67": { level: 1, name: "system_status" },
        "68": { level: 1, name: "temperature_control_mode" },
        "69": { level: 1, name: "target_temperature_resolution" },
        "6a": { level: 1, name: "target_temperature_tolerance" },
        "6b": { level: 1, name: "heating_target_temperature" },
        "6c": { level: 1, name: "cooling_target_temperature" },
        "6d": { level: 1, name: "heating_target_temperature_range" },
        "6e": { level: 1, name: "cooling_target_temperature_range" },
        "6f": { level: 1, name: "dehumidify_config" },
        "70": { level: 1, name: "target_humidity_range" },
        "72": { level: 1, name: "fan_mode" },
        "73": { level: 1, name: "fan_speed_config" },
        "74": { level: 1, name: "fan_delay_config" },
        "75": { level: 1, name: "child_lock_settings" },
        "76": { level: 1, name: "temperature_alarm_settings" },
        "77": { level: 1, name: "high_temperature_alarm_settings" },
        "78": { level: 1, name: "low_temperature_alarm_settings" },
        "79": { level: 1, name: "temperature_calibration_settings" },
        "7a": { level: 1, name: "humidity_calibration_settings" },
        "7b": { level: 3, name: "plan_config" },
        "7c": { level: 1, name: "valve_interface_settings" },
        "7d": { level: 1, name: "valve_control_settings" },
        "7e": { level: 1, name: "fan_control_settings" },
        "80": { level: 1, name: "di_setting_enable" },
        "81": { level: 1, name: "di_settings" },
        "82": { level: 1, name: "window_opening_detection_enable" },
        "83": { level: 1, name: "window_opening_detection_settings" },
        "84": { level: 1, name: "freeze_protection_settings" },
        "85": { level: 1, name: "temperature_source_settings" },
        "86": { level: 1, name: "d2d_pairing_enable" },
        "87": { level: 3, name: "d2d_pairing_settings" },
        "88": { level: 1, name: "d2d_master_enable" },
        "89": { level: 2, name: "d2d_master_settings" },
        "8a": { level: 1, name: "d2d_slave_enable" },
        "8b": { level: 2, name: "d2d_slave_settings" },
        "8c": { level: 3, name: "timed_system_control_settings" },
        "8d": { level: 1, name: "temporary_unlock_settings" },
        "8e": { level: 1, name: "temperature_control_with_standby_fan_mode" },
        "8f": { level: 1, name: "valve_opening_negative_valve_mode" },
        "90": { level: 1, name: "relay_changes_report_enable" },
        "c4": { level: 1, name: "auto_provisioning_enable" },
        "c5": { level: 1, name: "history_transmit_settings" },
        "c6": { level: 1, name: "daylight_saving_time" },
        "c7": { level: 1, name: "time_zone" },
        "b6": { level: 0, name: "reconnect" },
        "b8": { level: 0, name: "synchronize_time" },
        "b9": { level: 0, name: "query_device_status" },
        "ba": { level: 0, name: "fetch_history" },
        "bb": { level: 0, name: "fetch_history" },
        "bc": { level: 0, name: "stop_transmit_history" },
        "bd": { level: 0, name: "clear_history" },
        "be": { level: 0, name: "reboot" },
        "5b": { level: 0, name: "temperature" },
        "5c": { level: 0, name: "humidity" },
        "5d": { level: 0, name: "opening_window_alarm" },
        "5e": { level: 0, name: "insert_plan_id" },
        "5f": { level: 0, name: "clear_plan" },
    };

    var cmd = readHexString(bytes.slice(0, 1));
    var cmd_level = name_map[cmd].level;

    if (cmd_level != 0) {
        var buffer = new Buffer(2 + cmd_level);
        buffer.writeUInt8(0xef);
        buffer.writeUInt8(cmd_level);
        buffer.writeBytes(bytes.slice(0, cmd_level));
        return buffer.toBytes();
    }
    return [];
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

Buffer.prototype.writeBytes = function (bytes) {
    for (var i = 0; i < bytes.length; i++) {
        this.buffer[this.offset + i] = bytes[i];
    }
    this.offset += bytes.length;
};

Buffer.prototype.writeHexString = function (hexString) {
    var bytes = [];
    for (var i = 0; i < hexString.length; i += 2) {
        bytes.push(parseInt(hexString.substr(i, 2), 16));
    }
    this.writeBytes(bytes);
};

Buffer.prototype.writeHexStringReverse = function (hexString) {
    var bytes = [];
    for (var i = hexString.length - 2; i >= 0; i -= 2) {
        bytes.push(parseInt(hexString.substr(i, 2), 16));
    }
    this.writeBytes(bytes);
};

Buffer.prototype.toBytes = function () {
    return this.buffer;
};

function encodeUtf8(str) {
    var byteArray = [];
    for (var i = 0; i < str.length; i++) {
        var charCode = str.charCodeAt(i);
        if (charCode < 0x80) {
            byteArray.push(charCode);
        } else if (charCode < 0x800) {
            byteArray.push(0xc0 | (charCode >> 6));
            byteArray.push(0x80 | (charCode & 0x3f));
        } else if (charCode < 0x10000) {
            byteArray.push(0xe0 | (charCode >> 12));
            byteArray.push(0x80 | ((charCode >> 6) & 0x3f));
            byteArray.push(0x80 | (charCode & 0x3f));
        } else if (charCode < 0x200000) {
            byteArray.push(0xf0 | (charCode >> 18));
            byteArray.push(0x80 | ((charCode >> 12) & 0x3f));
            byteArray.push(0x80 | ((charCode >> 6) & 0x3f));
            byteArray.push(0x80 | (charCode & 0x3f));
        }
    }
    return byteArray;
}

function readHexString(bytes) {
    var temp = [];
    for (var idx = 0; idx < bytes.length; idx++) {
        temp.push(("0" + (bytes[idx] & 0xff).toString(16)).slice(-2));
    }
    return temp.join("");
}
    return {
        encodeDownlink: encodeDownlink,
        Encode: Encode,
        Encoder: Encoder,
    };
})();

function encodeDownlink(input) {
    var result = __milesightDownlinkCodec.encodeDownlink(input);
    if (result && typeof input.fPort !== "undefined" && typeof result.fPort === "undefined") {
        result.fPort = input.fPort;
    }
    return result;
}

function Encode(fPort, obj) {
    return __milesightDownlinkCodec.Encode(fPort, obj);
}

function Encoder(obj, port) {
    return __milesightDownlinkCodec.Encoder(obj, port);
}

exports.encodeDownlink = encodeDownlink;

exports.decodeUplink = decodeUplink;
