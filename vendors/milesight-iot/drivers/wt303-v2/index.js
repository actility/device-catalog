/**
 * Payload Decoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product WT303
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
                decoded.valve_status = readValveStatus(bytes[i]);
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
                    decoded.valve_interface_settings.four_pipe_two_wire = {};
                    decoded.valve_interface_settings.four_pipe_two_wire.cooling_valve = readValve(bytes[i + 1]);
                    decoded.valve_interface_settings.four_pipe_two_wire.heating_valve = readValve(bytes[i + 2]);
                    i += 3;
                }
                // two_pipe_two_wire
                else if (mode_value === 0x01) {
                    decoded.valve_interface_settings.two_pipe_two_wire = {};
                    decoded.valve_interface_settings.two_pipe_two_wire.valve = readValve(bytes[i + 1]);
                    i += 2;
                }
                // two_pipe_three_wire
                else if (mode_value === 0x02) {
                    decoded.valve_interface_settings.two_pipe_three_wire = {};
                    decoded.valve_interface_settings.two_pipe_three_wire.no_valve = readValve(bytes[i + 1]);
                    decoded.valve_interface_settings.two_pipe_three_wire.nc_valve = readValve(bytes[i + 2]);
                    i += 3;
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

function readValveStatus(type) {
    var status_map = { 0: "off", 100: "on" };
    return getValue(status_map, type);
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
    var mode_map = { 0: "four_pipe_two_wire", 1: "two_pipe_two_wire", 2: "two_pipe_three_wire" };
    return getValue(mode_map, type);
}

function readValve(type) {
    var valve_map = { 0: "valve_1", 1: "valve_2" };
    return getValue(valve_map, type);
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
// Downlink encoder taken verbatim from Milesight SensorDecoders (wt-series/wt303/wt303-encoder.js).
// Only this IIFE is Milesight's current encoder; the decoder above is unchanged.
/**
 * Payload Encoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product WT303
 */

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
	processTemperature(payload);
	var encoded = [];
	//0xfe
	if ('request_check_order' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xfe);
		if (payload.request_check_order.order < 0 || payload.request_check_order.order > 255) {
			throw new Error('request_check_order.order must be between 0 and 255');
		}
		buffer.writeUInt8(payload.request_check_order.order);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xf4
	if ('request_full_inspection' in payload) {
		var buffer = new Buffer();
		if (isValid(payload.request_full_inspection.start_inspection)) {
			buffer.writeUInt8(0xf4);
			buffer.writeUInt8(0x00);
		}
		if (isValid(payload.request_full_inspection.control)) {
			buffer.writeUInt8(0xf4);
			buffer.writeUInt8(0x01);
			if (payload.request_full_inspection.control.length < 0 || payload.request_full_inspection.control.length > 65535) {
				throw new Error('request_full_inspection.control.length must be between 0 and 65535');
			}
			buffer.writeUInt16LE(payload.request_full_inspection.control.length);
			buffer.writeBytes(payload.request_full_inspection.control.data, payload.request_full_inspection.control.length, true);
		}
		if (isValid(payload.request_full_inspection.reading)) {
			buffer.writeUInt8(0xf4);
			buffer.writeUInt8(0x02);
			buffer.writeUInt16LE(payload.request_full_inspection.reading.length);
			buffer.writeBytes(payload.request_full_inspection.reading.data, payload.request_full_inspection.reading.length, true);
		}
		if (isValid(payload.request_full_inspection.end_inspection)) {
			buffer.writeUInt8(0xf4);
			buffer.writeUInt8(0x03);
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xef
	if ('req' in payload) {
		var buffer = new Buffer();
		var reqList = payload.req;
		for (var idx = 0; idx < reqList.length; idx++) {
			var req_command = reqList[idx];
			var pureNumber = [];
			var formateStrParts = [];

			req_command.split('.').forEach(function(part) {
				if (/^[0-9]+$/.test(part)) {
					// padStart ES5 兼容
					var hex = Number(part).toString(16);
					while (hex.length < 2) { hex = '0' + hex; }
					pureNumber.push(hex);
					formateStrParts.push('_item');
				} else {
					formateStrParts.push(part);
				}
			});

			var formateStr = formateStrParts.join('.');
			var hexString = cmdMap()[formateStr];

			if (hexString && hexString.indexOf('xx') !== -1) {
				var i = 0;
				hexString = hexString.replace(/xx/g, function() {
					return pureNumber[i++];
				});
			}

			if (hexString) {
				var length = hexString.length / 2;
				buffer.writeUInt8(0xef);
				buffer.writeUInt8(length);
				buffer.writeHexString(hexString, length, true);
			}
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xee
	if ('all_configurations_request_by_device' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xee);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xcf
	if ('lorawan_configuration_settings' in payload) {
		var buffer = new Buffer();
		if (isValid(payload.lorawan_configuration_settings.mode)) {
			buffer.writeUInt8(0xcf);
			// 0:ClassA, 1:ClassB, 2:ClassC, 3:ClassC to B
			buffer.writeUInt8(0x00);
			// 0:ClassA, 1:ClassB, 2:ClassC, 3:ClassC to B
			buffer.writeUInt8(payload.lorawan_configuration_settings.mode);
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xdb
	if ('product_sn' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xdb);
		buffer.writeHexString(payload.product_sn, 8);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xd9
	if ('oem_id' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xd9);
		buffer.writeHexString(payload.oem_id, 2);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x04
	if ('data_source' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x04);
		// 0：Internal, 1：External NTC, 2：LoRaWAN Reception, 3：D2D Reception
		buffer.writeUInt8(payload.data_source);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x01
	if ('temperature' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x01);
		if (payload.temperature < -20 || payload.temperature > 60) {
			throw new Error('temperature must be between -20 and 60');
		}
		buffer.writeInt16LE(payload.temperature * 100);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x02
	if ('humidity' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x02);
		if (payload.humidity < 0 || payload.humidity > 100) {
			throw new Error('humidity must be between 0 and 100');
		}
		buffer.writeUInt16LE(payload.humidity * 10);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x03
	if ('target_temperature' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x03);
		if (payload.target_temperature < 5 || payload.target_temperature > 35) {
			throw new Error('target_temperature must be between 5 and 35');
		}
		buffer.writeInt16LE(payload.target_temperature * 100);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x05
	if ('temperature_control_info' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x05);
		var bitOptions = 0;
		// 0：Ventilation, 1：Heat, 2：Cool
		bitOptions |= payload.temperature_control_info.mode << 4;

		// 0：Standby, 1:Heat, 2:Cool
		bitOptions |= payload.temperature_control_info.status << 0;
		buffer.writeUInt8(bitOptions);

		encoded = encoded.concat(buffer.toBytes());
	}
	//0x06
	if ('temperature_control_valve_status' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x06);
		// 0：Close, 100：Open
		buffer.writeUInt8(payload.temperature_control_valve_status);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x07
	if ('fan_control_info' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x07);
		var bitOptions = 0;
		// 0: Auto, 1: Low, 2: Medium, 3: High
		bitOptions |= payload.fan_control_info.mode << 4;

		// 0：Off, 1: Low, 2: Medium, 3: High
		bitOptions |= payload.fan_control_info.status << 0;
		buffer.writeUInt8(bitOptions);

		encoded = encoded.concat(buffer.toBytes());
	}
	//0x08
	if ('execution_plan_id' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x08);
		// 0：Schedule1, 1：Schedule2, 2：Schedule3, 3：Schedule4, 4：Schedule5, 5：Schedule6, 6：Schedule7, 7：Schedule8, 8：Schedule9, 9：Schedule10, 10：Schedule11, 11：Schedule12, 12：Schedule13, 13：Schedule14, 14：Schedule15, 15：Schedule16, 255：Not executed
		buffer.writeUInt8(payload.execution_plan_id);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x09
	if ('temperature_alarm' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x09);
		buffer.writeUInt8(payload.temperature_alarm.type);
		if (payload.temperature_alarm.type == 0x00) {
		}
		if (payload.temperature_alarm.type == 0x01) {
		}
		if (payload.temperature_alarm.type == 0x02) {
		}
		if (payload.temperature_alarm.type == 0x03) {
		}
		if (payload.temperature_alarm.type == 0x10) {
			if (payload.temperature_alarm.lower_range_alarm_deactivation.temperature < -20 || payload.temperature_alarm.lower_range_alarm_deactivation.temperature > 60) {
				throw new Error('temperature_alarm.lower_range_alarm_deactivation.temperature must be between -20 and 60');
			}
			buffer.writeInt16LE(payload.temperature_alarm.lower_range_alarm_deactivation.temperature * 100);
		}
		if (payload.temperature_alarm.type == 0x11) {
			if (payload.temperature_alarm.lower_range_alarm_trigger.temperature < -20 || payload.temperature_alarm.lower_range_alarm_trigger.temperature > 60) {
				throw new Error('temperature_alarm.lower_range_alarm_trigger.temperature must be between -20 and 60');
			}
			buffer.writeInt16LE(payload.temperature_alarm.lower_range_alarm_trigger.temperature * 100);
		}
		if (payload.temperature_alarm.type == 0x12) {
			if (payload.temperature_alarm.over_range_alarm_deactivation.temperature < -20 || payload.temperature_alarm.over_range_alarm_deactivation.temperature > 60) {
				throw new Error('temperature_alarm.over_range_alarm_deactivation.temperature must be between -20 and 60');
			}
			buffer.writeInt16LE(payload.temperature_alarm.over_range_alarm_deactivation.temperature * 100);
		}
		if (payload.temperature_alarm.type == 0x13) {
			if (payload.temperature_alarm.over_range_alarm_trigger.temperature < -20 || payload.temperature_alarm.over_range_alarm_trigger.temperature > 60) {
				throw new Error('temperature_alarm.over_range_alarm_trigger.temperature must be between -20 and 60');
			}
			buffer.writeInt16LE(payload.temperature_alarm.over_range_alarm_trigger.temperature * 100);
		}
		if (payload.temperature_alarm.type == 0x14) {
			if (payload.temperature_alarm.within_range_alarm_deactivation.temperature < -20 || payload.temperature_alarm.within_range_alarm_deactivation.temperature > 60) {
				throw new Error('temperature_alarm.within_range_alarm_deactivation.temperature must be between -20 and 60');
			}
			buffer.writeInt16LE(payload.temperature_alarm.within_range_alarm_deactivation.temperature * 100);
		}
		if (payload.temperature_alarm.type == 0x15) {
			if (payload.temperature_alarm.within_range_alarm_trigger.temperature < -20 || payload.temperature_alarm.within_range_alarm_trigger.temperature > 60) {
				throw new Error('temperature_alarm.within_range_alarm_trigger.temperature must be between -20 and 60');
			}
			buffer.writeInt16LE(payload.temperature_alarm.within_range_alarm_trigger.temperature * 100);
		}
		if (payload.temperature_alarm.type == 0x16) {
			if (payload.temperature_alarm.exceed_range_alarm_deactivation.temperature < -20 || payload.temperature_alarm.exceed_range_alarm_deactivation.temperature > 60) {
				throw new Error('temperature_alarm.exceed_range_alarm_deactivation.temperature must be between -20 and 60');
			}
			buffer.writeInt16LE(payload.temperature_alarm.exceed_range_alarm_deactivation.temperature * 100);
		}
		if (payload.temperature_alarm.type == 0x17) {
			if (payload.temperature_alarm.exceed_range_alarm_trigger.temperature < -20 || payload.temperature_alarm.exceed_range_alarm_trigger.temperature > 60) {
				throw new Error('temperature_alarm.exceed_range_alarm_trigger.temperature must be between -20 and 60');
			}
			buffer.writeInt16LE(payload.temperature_alarm.exceed_range_alarm_trigger.temperature * 100);
		}
		if (payload.temperature_alarm.type == 0x20) {
			if (payload.temperature_alarm.persistent_low_temperature_alarm_deactivation.temperature < -20 || payload.temperature_alarm.persistent_low_temperature_alarm_deactivation.temperature > 60) {
				throw new Error('temperature_alarm.persistent_low_temperature_alarm_deactivation.temperature must be between -20 and 60');
			}
			buffer.writeInt16LE(payload.temperature_alarm.persistent_low_temperature_alarm_deactivation.temperature * 100);
		}
		if (payload.temperature_alarm.type == 0x21) {
			if (payload.temperature_alarm.persistent_low_temperature_alarm_trigger.temperature < -20 || payload.temperature_alarm.persistent_low_temperature_alarm_trigger.temperature > 60) {
				throw new Error('temperature_alarm.persistent_low_temperature_alarm_trigger.temperature must be between -20 and 60');
			}
			buffer.writeInt16LE(payload.temperature_alarm.persistent_low_temperature_alarm_trigger.temperature * 100);
		}
		if (payload.temperature_alarm.type == 0x22) {
			if (payload.temperature_alarm.persistent_high_alarm_deactivation.temperature < -20 || payload.temperature_alarm.persistent_high_alarm_deactivation.temperature > 60) {
				throw new Error('temperature_alarm.persistent_high_alarm_deactivation.temperature must be between -20 and 60');
			}
			buffer.writeInt16LE(payload.temperature_alarm.persistent_high_alarm_deactivation.temperature * 100);
		}
		if (payload.temperature_alarm.type == 0x23) {
			if (payload.temperature_alarm.persistent_high_alarm_trigger.temperature < -20 || payload.temperature_alarm.persistent_high_alarm_trigger.temperature > 60) {
				throw new Error('temperature_alarm.persistent_high_alarm_trigger.temperature must be between -20 and 60');
			}
			buffer.writeInt16LE(payload.temperature_alarm.persistent_high_alarm_trigger.temperature * 100);
		}
		if (payload.temperature_alarm.type == 0x30) {
			if (payload.temperature_alarm.anti_freeze_protection_deactivation.temperature < -20 || payload.temperature_alarm.anti_freeze_protection_deactivation.temperature > 60) {
				throw new Error('temperature_alarm.anti_freeze_protection_deactivation.temperature must be between -20 and 60');
			}
			buffer.writeInt16LE(payload.temperature_alarm.anti_freeze_protection_deactivation.temperature * 100);
		}
		if (payload.temperature_alarm.type == 0x31) {
			if (payload.temperature_alarm.anti_freeze_protection_trigger.temperature < -20 || payload.temperature_alarm.anti_freeze_protection_trigger.temperature > 60) {
				throw new Error('temperature_alarm.anti_freeze_protection_trigger.temperature must be between -20 and 60');
			}
			buffer.writeInt16LE(payload.temperature_alarm.anti_freeze_protection_trigger.temperature * 100);
		}
		if (payload.temperature_alarm.type == 0x32) {
			if (payload.temperature_alarm.window_status_detection_deactivation.temperature < -20 || payload.temperature_alarm.window_status_detection_deactivation.temperature > 60) {
				throw new Error('temperature_alarm.window_status_detection_deactivation.temperature must be between -20 and 60');
			}
			buffer.writeInt16LE(payload.temperature_alarm.window_status_detection_deactivation.temperature * 100);
		}
		if (payload.temperature_alarm.type == 0x33) {
			if (payload.temperature_alarm.window_status_detection_trigger.temperature < -20 || payload.temperature_alarm.window_status_detection_trigger.temperature > 60) {
				throw new Error('temperature_alarm.window_status_detection_trigger.temperature must be between -20 and 60');
			}
			buffer.writeInt16LE(payload.temperature_alarm.window_status_detection_trigger.temperature * 100);
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x0a
	if ('humidity_alarm' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x0a);
		buffer.writeUInt8(payload.humidity_alarm.type);
		if (payload.humidity_alarm.type == 0x00) {
		}
		if (payload.humidity_alarm.type == 0x01) {
		}
		if (payload.humidity_alarm.type == 0x02) {
		}
		if (payload.humidity_alarm.type == 0x03) {
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x0b
	if ('target_temperature_alarm' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x0b);
		buffer.writeUInt8(payload.target_temperature_alarm.type);
		if (payload.target_temperature_alarm.type == 0x03) {
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x10
	if ('relay_status' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x10);
		var bitOptions = 0;
		bitOptions |= payload.relay_status.low_status << 0;

		bitOptions |= payload.relay_status.mid_status << 1;

		bitOptions |= payload.relay_status.high_status << 2;

		bitOptions |= payload.relay_status.valve_1_status << 3;

		bitOptions |= payload.relay_status.valve_2_status << 4;

		bitOptions |= payload.relay_status.reserved << 5;
		buffer.writeUInt32LE(bitOptions);

		encoded = encoded.concat(buffer.toBytes());
	}
	//0xc8
	if ('device_status' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xc8);
		// 0：Off, 1：On
		buffer.writeUInt8(payload.device_status);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x60
	if ('collection_interval' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x60);
		// 0：second, 1：min
		buffer.writeUInt8(payload.collection_interval.unit);
		if (payload.collection_interval.unit == 0x00) {
			if (payload.collection_interval.seconds_of_time < 10 || payload.collection_interval.seconds_of_time > 64800) {
				throw new Error('collection_interval.seconds_of_time must be between 10 and 64800');
			}
			buffer.writeUInt16LE(payload.collection_interval.seconds_of_time);
		}
		if (payload.collection_interval.unit == 0x01) {
			if (payload.collection_interval.minutes_of_time < 1 || payload.collection_interval.minutes_of_time > 1440) {
				throw new Error('collection_interval.minutes_of_time must be between 1 and 1440');
			}
			buffer.writeUInt16LE(payload.collection_interval.minutes_of_time);
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x62
	if ('reporting_interval' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x62);
		// 0：second, 1：min
		buffer.writeUInt8(payload.reporting_interval.unit);
		if (payload.reporting_interval.unit == 0x00) {
			if (payload.reporting_interval.seconds_of_time < 10 || payload.reporting_interval.seconds_of_time > 64800) {
				throw new Error('reporting_interval.seconds_of_time must be between 10 and 64800');
			}
			buffer.writeUInt16LE(payload.reporting_interval.seconds_of_time);
		}
		if (payload.reporting_interval.unit == 0x01) {
			if (payload.reporting_interval.minutes_of_time < 1 || payload.reporting_interval.minutes_of_time > 1440) {
				throw new Error('reporting_interval.minutes_of_time must be between 1 and 1440');
			}
			buffer.writeUInt16LE(payload.reporting_interval.minutes_of_time);
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xc4
	if ('auto_p_enable' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xc4);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.auto_p_enable);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x90
	if ('relay_changes_report_enable' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x90);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.relay_changes_report_enable);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x63
	if ('temperature_unit' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x63);
		// 0：℃, 1：℉
		buffer.writeUInt8(payload.temperature_unit);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x85
	if ('temperature_source' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x85);
		// 0：Embedded Temperature, 1：External NTC, 2：LoRa Receive, 3：D2D Receive
		buffer.writeUInt8(payload.temperature_source.type);
		if (payload.temperature_source.type == 0x02) {
			if (payload.temperature_source.lorawan_reception.timeout < 1 || payload.temperature_source.lorawan_reception.timeout > 60) {
				throw new Error('temperature_source.lorawan_reception.timeout must be between 1 and 60');
			}
			buffer.writeUInt8(payload.temperature_source.lorawan_reception.timeout);
			// 0: Keep Control, 1: Turn Off The Control, 2: Switch The Embedded Temperature
			buffer.writeUInt8(payload.temperature_source.lorawan_reception.timeout_response);
		}
		if (payload.temperature_source.type == 0x03) {
			if (payload.temperature_source.d2d_reception.timeout < 1 || payload.temperature_source.d2d_reception.timeout > 60) {
				throw new Error('temperature_source.d2d_reception.timeout must be between 1 and 60');
			}
			buffer.writeUInt8(payload.temperature_source.d2d_reception.timeout);
			// 0: Keep Control, 1: Turn Off The Control, 2: Switch The Embedded Temperature
			buffer.writeUInt8(payload.temperature_source.d2d_reception.timeout_response);
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x67
	if ('system_status' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x67);
		// 0：Off, 1：On
		buffer.writeUInt8(payload.system_status);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x64
	if ('mode_enable' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x64);
		// 7：Ventilation、Heat、Cool, 3：Ventilation、Heat, 5：Ventilation、Cool
		buffer.writeUInt8(payload.mode_enable);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x68
	if ('temperature_control_mode' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x68);
		// 0：Ventilation, 1：Heat, 2：Cool
		buffer.writeUInt8(payload.temperature_control_mode);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x69
	if ('target_temperature_resolution' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x69);
		// 0：0.5, 1：1
		buffer.writeUInt8(payload.target_temperature_resolution);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x6b
	if ('heating_target_temperature' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x6b);
		if (payload.heating_target_temperature < 5 || payload.heating_target_temperature > 35) {
			throw new Error('heating_target_temperature must be between 5 and 35');
		}
		buffer.writeInt16LE(payload.heating_target_temperature * 100);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x6c
	if ('cooling_target_temperature' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x6c);
		if (payload.cooling_target_temperature < 5 || payload.cooling_target_temperature > 35) {
			throw new Error('cooling_target_temperature must be between 5 and 35');
		}
		buffer.writeInt16LE(payload.cooling_target_temperature * 100);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x6a
	if ('target_temperature_tolerance' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x6a);
		if (payload.target_temperature_tolerance < 0.1 || payload.target_temperature_tolerance > 5) {
			throw new Error('target_temperature_tolerance must be between 0.1 and 5');
		}
		buffer.writeInt16LE(payload.target_temperature_tolerance * 100);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x6d
	if ('heating_target_temperature_range' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x6d);
		if (payload.heating_target_temperature_range.min < 5 || payload.heating_target_temperature_range.min > 35) {
			throw new Error('heating_target_temperature_range.min must be between 5 and 35');
		}
		buffer.writeInt16LE(payload.heating_target_temperature_range.min * 100);
		if (payload.heating_target_temperature_range.max < 5 || payload.heating_target_temperature_range.max > 35) {
			throw new Error('heating_target_temperature_range.max must be between 5 and 35');
		}
		buffer.writeInt16LE(payload.heating_target_temperature_range.max * 100);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x6e
	if ('cooling_target_temperature_range' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x6e);
		if (payload.cooling_target_temperature_range.min < 5 || payload.cooling_target_temperature_range.min > 35) {
			throw new Error('cooling_target_temperature_range.min must be between 5 and 35');
		}
		buffer.writeInt16LE(payload.cooling_target_temperature_range.min * 100);
		if (payload.cooling_target_temperature_range.max < 5 || payload.cooling_target_temperature_range.max > 35) {
			throw new Error('cooling_target_temperature_range.max must be between 5 and 35');
		}
		buffer.writeInt16LE(payload.cooling_target_temperature_range.max * 100);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x70
	if ('target_humidity_range' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x70);
		if (payload.target_humidity_range.min < 0 || payload.target_humidity_range.min > 100) {
			throw new Error('target_humidity_range.min must be between 0 and 100');
		}
		buffer.writeUInt16LE(payload.target_humidity_range.min * 10);
		if (payload.target_humidity_range.max < 0 || payload.target_humidity_range.max > 100) {
			throw new Error('target_humidity_range.max must be between 0 and 100');
		}
		buffer.writeUInt16LE(payload.target_humidity_range.max * 10);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x6f
	if ('temperature_control_dehumidification' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x6f);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.temperature_control_dehumidification.enable);
		if (payload.temperature_control_dehumidification.temperature_tolerance < 0.1 || payload.temperature_control_dehumidification.temperature_tolerance > 5) {
			throw new Error('temperature_control_dehumidification.temperature_tolerance must be between 0.1 and 5');
		}
		buffer.writeInt16LE(payload.temperature_control_dehumidification.temperature_tolerance * 100);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x72
	if ('fan_control_mode' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x72);
		// 0：Auto, 1：Low, 2:Medium, 3:High
		buffer.writeUInt8(payload.fan_control_mode);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x74
	if ('fan_delay_close' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x74);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.fan_delay_close.enable);
		if (payload.fan_delay_close.time < 30 || payload.fan_delay_close.time > 3600) {
			throw new Error('fan_delay_close.time must be between 30 and 3600');
		}
		buffer.writeUInt16LE(payload.fan_delay_close.time);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x73
	if ('fan_auto_mode_temperature_range' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x73);
		if (payload.fan_auto_mode_temperature_range.speed_range_1 < 1 || payload.fan_auto_mode_temperature_range.speed_range_1 > 15) {
			throw new Error('fan_auto_mode_temperature_range.speed_range_1 must be between 1 and 15');
		}
		buffer.writeInt16LE(payload.fan_auto_mode_temperature_range.speed_range_1 * 100);
		if (payload.fan_auto_mode_temperature_range.speed_range_2 < 1 || payload.fan_auto_mode_temperature_range.speed_range_2 > 15) {
			throw new Error('fan_auto_mode_temperature_range.speed_range_2 must be between 1 and 15');
		}
		buffer.writeInt16LE(payload.fan_auto_mode_temperature_range.speed_range_2 * 100);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x8c
	if ('timed_system_control' in payload) {
		var buffer = new Buffer();
		if (isValid(payload.timed_system_control.enable)) {
			buffer.writeUInt8(0x8c);
			// 0：disable, 1：enable
			buffer.writeUInt8(0x00);
			// 0：disable, 1：enable
			buffer.writeUInt8(payload.timed_system_control.enable);
		}
		for (var start_cycle_settings_id = 0; start_cycle_settings_id < (payload.timed_system_control.start_cycle_settings && payload.timed_system_control.start_cycle_settings.length); start_cycle_settings_id++) {
			var start_cycle_settings_item = payload.timed_system_control.start_cycle_settings[start_cycle_settings_id];
			var start_cycle_settings_item_id = start_cycle_settings_item.id;
			buffer.writeUInt8(0x8c);
			buffer.writeUInt8(0x01);
			// 0：disable, 1：enable
			buffer.writeUInt8(start_cycle_settings_item.enable);
			buffer.writeUInt16LE(start_cycle_settings_item.execution_time_point);
			var bitOptions = 0;
			// 0：disable, 1：enable
			bitOptions |= start_cycle_settings_item.execution_day_sun << 0;

			// 0：disable, 1：enable
			bitOptions |= start_cycle_settings_item.execution_day_mon << 1;

			// 0：disable, 1：enable
			bitOptions |= start_cycle_settings_item.execution_day_tues << 2;

			// 0：disable, 1：enable
			bitOptions |= start_cycle_settings_item.execution_day_wed << 3;

			// 0：disable, 1：enable
			bitOptions |= start_cycle_settings_item.execution_day_thu << 4;

			// 0：disable, 1：enable
			bitOptions |= start_cycle_settings_item.execution_day_fri << 5;

			// 0：disable, 1：enable
			bitOptions |= start_cycle_settings_item.execution_day_sat << 6;

			bitOptions |= start_cycle_settings_item.reserved << 7;
			buffer.writeUInt8(bitOptions);

		}
		for (var end_cycle_settings_id = 0; end_cycle_settings_id < (payload.timed_system_control.end_cycle_settings && payload.timed_system_control.end_cycle_settings.length); end_cycle_settings_id++) {
			var end_cycle_settings_item = payload.timed_system_control.end_cycle_settings[end_cycle_settings_id];
			var end_cycle_settings_item_id = end_cycle_settings_item.id;
			buffer.writeUInt8(0x8c);
			buffer.writeUInt8(0x02);
			// 0：disable, 1：enable
			buffer.writeUInt8(end_cycle_settings_item.enable);
			buffer.writeUInt16LE(end_cycle_settings_item.execution_time_point);
			var bitOptions = 0;
			// 0：disable, 1：enable
			bitOptions |= end_cycle_settings_item.execution_day_sun << 0;

			// 0：disable, 1：enable
			bitOptions |= end_cycle_settings_item.execution_day_mon << 1;

			// 0：disable, 1：enable
			bitOptions |= end_cycle_settings_item.execution_day_tues << 2;

			// 0：disable, 1：enable
			bitOptions |= end_cycle_settings_item.execution_day_wed << 3;

			// 0：disable, 1：enable
			bitOptions |= end_cycle_settings_item.execution_day_thu << 4;

			// 0：disable, 1：enable
			bitOptions |= end_cycle_settings_item.execution_day_fri << 5;

			// 0：disable, 1：enable
			bitOptions |= end_cycle_settings_item.execution_day_sat << 6;

			bitOptions |= end_cycle_settings_item.reserved << 7;
			buffer.writeUInt8(bitOptions);

		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x65
	if ('intelligent_display_enable' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x65);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.intelligent_display_enable);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x66
	if ('screen_object_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x66);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.screen_object_settings.enable);
		var bitOptions = 0;
		// 0：disable, 1：enable
		bitOptions |= payload.screen_object_settings.environmental_temperature << 0;

		// 0：disable, 1：enable
		bitOptions |= payload.screen_object_settings.environmental_humidity << 1;

		// 0：disable, 1：enable
		bitOptions |= payload.screen_object_settings.target_temperature << 2;

		// 0：disable, 1：enable
		bitOptions |= payload.screen_object_settings.schedule_name << 3;

		bitOptions |= payload.screen_object_settings.reserved << 4;
		buffer.writeUInt8(bitOptions);

		encoded = encoded.concat(buffer.toBytes());
	}
	//0x75
	if ('child_lock' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x75);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.child_lock.enable);
		var bitOptions = 0;
		// 0：disable, 1：enable
		bitOptions |= payload.child_lock.system_button << 0;

		// 0：disable, 1：enable
		bitOptions |= payload.child_lock.temperature_button << 1;

		// 0：disable, 1：enable
		bitOptions |= payload.child_lock.fan_button << 2;

		// 0：disable, 1：enable
		bitOptions |= payload.child_lock.temperature_control_button << 3;

		// 0：disable, 1：enable
		bitOptions |= payload.child_lock.reboot_reset_button << 4;

		bitOptions |= payload.child_lock.reserved << 5;
		buffer.writeUInt8(bitOptions);

		encoded = encoded.concat(buffer.toBytes());
	}
	//0x8d
	if ('temporary_unlock_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x8d);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.temporary_unlock_settings.enable);
		var bitOptions = 0;
		// 0：disable, 1：enable
		bitOptions |= payload.temporary_unlock_settings.system << 0;

		// 0：disable, 1：enable
		bitOptions |= payload.temporary_unlock_settings.temperature_up << 1;

		// 0：disable, 1：enable
		bitOptions |= payload.temporary_unlock_settings.temperature_down << 2;

		// 0：disable, 1：enable
		bitOptions |= payload.temporary_unlock_settings.fan << 3;

		// 0：disable, 1：enable
		bitOptions |= payload.temporary_unlock_settings.temperature_control << 4;

		bitOptions |= payload.temporary_unlock_settings.reserved << 5;
		buffer.writeUInt8(bitOptions);

		if (payload.temporary_unlock_settings.unlocking_duration < 1 || payload.temporary_unlock_settings.unlocking_duration > 3600) {
			throw new Error('temporary_unlock_settings.unlocking_duration must be between 1 and 3600');
		}
		buffer.writeUInt16LE(payload.temporary_unlock_settings.unlocking_duration);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xc7
	if ('time_zone' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xc7);
		buffer.writeInt16LE(payload.time_zone);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xc6
	if ('daylight_saving_time' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xc6);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.daylight_saving_time.enable);
		if (payload.daylight_saving_time.daylight_saving_time_offset < 1 || payload.daylight_saving_time.daylight_saving_time_offset > 120) {
			throw new Error('daylight_saving_time.daylight_saving_time_offset must be between 1 and 120');
		}
		buffer.writeUInt8(payload.daylight_saving_time.daylight_saving_time_offset);
		// 1:Jan., 2:Feb., 3:Mar., 4:Apr., 5:May, 6:Jun., 7:Jul., 8:Aug., 9:Sep., 10:Oct., 11:Nov., 12:Dec.
		buffer.writeUInt8(payload.daylight_saving_time.start_month);
		var bitOptions = 0;
		// 1:1st, 2: 2nd, 3: 3rd, 4: 4th, 5: last
		bitOptions |= payload.daylight_saving_time.start_week_num << 4;

		// 1：Mon., 2：Tues., 3：Wed., 4：Thurs., 5：Fri., 6：Sat., 7：Sun.
		bitOptions |= payload.daylight_saving_time.start_week_day << 0;
		buffer.writeUInt8(bitOptions);

		buffer.writeUInt16LE(payload.daylight_saving_time.start_hour_min);
		// 1:Jan., 2:Feb., 3:Mar., 4:Apr., 5:May, 6:Jun., 7:Jul., 8:Aug., 9:Sep., 10:Oct., 11:Nov., 12:Dec.
		buffer.writeUInt8(payload.daylight_saving_time.end_month);
		var bitOptions = 0;
		// 1:1st, 2: 2nd, 3: 3rd, 4: 4th, 5: last
		bitOptions |= payload.daylight_saving_time.end_week_num << 4;

		// 1：Mon., 2：Tues., 3：Wed., 4：Thurs., 5：Fri., 6：Sat., 7：Sun.
		bitOptions |= payload.daylight_saving_time.end_week_day << 0;
		buffer.writeUInt8(bitOptions);

		buffer.writeUInt16LE(payload.daylight_saving_time.end_hour_min);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xc5
	if ('data_storage_settings' in payload) {
		var buffer = new Buffer();
		if (isValid(payload.data_storage_settings.enable)) {
			buffer.writeUInt8(0xc5);
			// 0：disable, 1：enable
			buffer.writeUInt8(0x00);
			// 0：disable, 1：enable
			buffer.writeUInt8(payload.data_storage_settings.enable);
		}
		if (isValid(payload.data_storage_settings.retransmission_enable)) {
			buffer.writeUInt8(0xc5);
			// 0：disable, 1：enable
			buffer.writeUInt8(0x01);
			// 0：disable, 1：enable
			buffer.writeUInt8(payload.data_storage_settings.retransmission_enable);
		}
		if (isValid(payload.data_storage_settings.retransmission_interval)) {
			buffer.writeUInt8(0xc5);
			buffer.writeUInt8(0x02);
			if (payload.data_storage_settings.retransmission_interval < 30 || payload.data_storage_settings.retransmission_interval > 1200) {
				throw new Error('data_storage_settings.retransmission_interval must be between 30 and 1200');
			}
			buffer.writeUInt16LE(payload.data_storage_settings.retransmission_interval);
		}
		if (isValid(payload.data_storage_settings.retrieval_interval)) {
			buffer.writeUInt8(0xc5);
			buffer.writeUInt8(0x03);
			if (payload.data_storage_settings.retrieval_interval < 30 || payload.data_storage_settings.retrieval_interval > 1200) {
				throw new Error('data_storage_settings.retrieval_interval must be between 30 and 1200');
			}
			buffer.writeUInt16LE(payload.data_storage_settings.retrieval_interval);
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x79
	if ('temperature_calibration_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x79);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.temperature_calibration_settings.enable);
		if (payload.temperature_calibration_settings.calibration_value < -80 || payload.temperature_calibration_settings.calibration_value > 80) {
			throw new Error('temperature_calibration_settings.calibration_value must be between -80 and 80');
		}
		buffer.writeInt16LE(payload.temperature_calibration_settings.calibration_value * 100);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x7a
	if ('humidity_calibration_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x7a);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.humidity_calibration_settings.enable);
		if (payload.humidity_calibration_settings.calibration_value < -100 || payload.humidity_calibration_settings.calibration_value > 100) {
			throw new Error('humidity_calibration_settings.calibration_value must be between -100 and 100');
		}
		buffer.writeInt16LE(payload.humidity_calibration_settings.calibration_value * 10);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x76
	if ('temperature_alarm_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x76);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.temperature_alarm_settings.enable);
		// 0:disable, 1:condition: x<A, 2:condition: x>B, 3:condition: A≤x≤B, 4:condition: x<A or x>B
		buffer.writeUInt8(payload.temperature_alarm_settings.threshold_condition);
		if (payload.temperature_alarm_settings.threshold_min < -20 || payload.temperature_alarm_settings.threshold_min > 60) {
			throw new Error('temperature_alarm_settings.threshold_min must be between -20 and 60');
		}
		buffer.writeInt16LE(payload.temperature_alarm_settings.threshold_min * 100);
		if (payload.temperature_alarm_settings.threshold_max < -20 || payload.temperature_alarm_settings.threshold_max > 60) {
			throw new Error('temperature_alarm_settings.threshold_max must be between -20 and 60');
		}
		buffer.writeInt16LE(payload.temperature_alarm_settings.threshold_max * 100);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x77
	if ('high_temperature_alarm_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x77);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.high_temperature_alarm_settings.enable);
		if (payload.high_temperature_alarm_settings.difference_in_temperature < 1 || payload.high_temperature_alarm_settings.difference_in_temperature > 10) {
			throw new Error('high_temperature_alarm_settings.difference_in_temperature must be between 1 and 10');
		}
		buffer.writeInt16LE(payload.high_temperature_alarm_settings.difference_in_temperature * 100);
		if (payload.high_temperature_alarm_settings.duration < 0 || payload.high_temperature_alarm_settings.duration > 60) {
			throw new Error('high_temperature_alarm_settings.duration must be between 0 and 60');
		}
		buffer.writeUInt8(payload.high_temperature_alarm_settings.duration);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x78
	if ('low_temperature_alarm_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x78);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.low_temperature_alarm_settings.enable);
		if (payload.low_temperature_alarm_settings.difference_in_temperature < 1 || payload.low_temperature_alarm_settings.difference_in_temperature > 10) {
			throw new Error('low_temperature_alarm_settings.difference_in_temperature must be between 1 and 10');
		}
		buffer.writeInt16LE(payload.low_temperature_alarm_settings.difference_in_temperature * 100);
		if (payload.low_temperature_alarm_settings.duration < 0 || payload.low_temperature_alarm_settings.duration > 60) {
			throw new Error('low_temperature_alarm_settings.duration must be between 0 and 60');
		}
		buffer.writeUInt8(payload.low_temperature_alarm_settings.duration);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x7b
	if ('schedule_settings' in payload) {
		var buffer = new Buffer();
		for (var schedule_settings_id = 0; schedule_settings_id < (payload.schedule_settings && payload.schedule_settings.length); schedule_settings_id++) {
			var schedule_settings_item = payload.schedule_settings[schedule_settings_id];
			var schedule_settings_item_id = schedule_settings_item.id;
			if (isValid(schedule_settings_item.enable)) {
				buffer.writeUInt8(0x7b);
				buffer.writeUInt8(schedule_settings_item_id);
				// 0：disable, 1：enable
				buffer.writeUInt8(0x00);
				// 0：disable, 1：enable
				buffer.writeUInt8(schedule_settings_item.enable);
			}
			if (isValid(schedule_settings_item.name_first)) {
				buffer.writeUInt8(0x7b);
				buffer.writeUInt8(schedule_settings_item_id);
				buffer.writeUInt8(0x01);
				buffer.writeString(schedule_settings_item.name_first, 6);
			}
			if (isValid(schedule_settings_item.name_last)) {
				buffer.writeUInt8(0x7b);
				buffer.writeUInt8(schedule_settings_item_id);
				buffer.writeUInt8(0x02);
				buffer.writeString(schedule_settings_item.name_last, 4);
			}
			if (isValid(schedule_settings_item.content)) {
				buffer.writeUInt8(0x7b);
				buffer.writeUInt8(schedule_settings_item_id);
				buffer.writeUInt8(0x03);
				// 0：auto, 1：low, 2：medium, 3：high
				buffer.writeUInt8(schedule_settings_item.content.fan_mode);
				var bitOptions = 0;
				bitOptions |= schedule_settings_item.content.heat_target_temperature_enable << 0;

				bitOptions |= schedule_settings_item.content.heat_target_temperature * 100 << 1;
				buffer.writeInt16LE(bitOptions);

				var bitOptions = 0;
				bitOptions |= schedule_settings_item.content.cool_target_temperature_enable << 0;

				bitOptions |= schedule_settings_item.content.cool_target_temperature * 100 << 1;
				buffer.writeInt16LE(bitOptions);

				var bitOptions = 0;
				bitOptions |= schedule_settings_item.content.temperature_tolerance_enable << 0;

				bitOptions |= schedule_settings_item.content.temperature_tolerance * 100 << 1;
				buffer.writeInt16LE(bitOptions);

			}
			for (var cycle_settings_id = 0; cycle_settings_id < (schedule_settings_item.cycle_settings && schedule_settings_item.cycle_settings.length); cycle_settings_id++) {
				var cycle_settings_item = schedule_settings_item.cycle_settings[cycle_settings_id];
				var cycle_settings_item_id = cycle_settings_item.id;
				buffer.writeUInt8(0x7b);
				buffer.writeUInt8(schedule_settings_item_id);
				buffer.writeUInt8(0x04);
				buffer.writeUInt8(cycle_settings_item.id);
				// 0：disable, 1：enable
				buffer.writeUInt8(cycle_settings_item.enable);
				buffer.writeUInt16LE(cycle_settings_item.execution_time_point);
				var bitOptions = 0;
				// 0：disable, 1：enable
				bitOptions |= cycle_settings_item.execution_day_sun << 0;

				// 0：disable, 1：enable
				bitOptions |= cycle_settings_item.execution_day_mon << 1;

				// 0：disable, 1：enable
				bitOptions |= cycle_settings_item.execution_day_tues << 2;

				// 0：disable, 1：enable
				bitOptions |= cycle_settings_item.execution_day_wed << 3;

				// 0：disable, 1：enable
				bitOptions |= cycle_settings_item.execution_day_thu << 4;

				// 0：disable, 1：enable
				bitOptions |= cycle_settings_item.execution_day_fri << 5;

				// 0：disable, 1：enable
				bitOptions |= cycle_settings_item.execution_day_sat << 6;

				bitOptions |= cycle_settings_item.reserved << 7;
				buffer.writeUInt8(bitOptions);

			}
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x7c
	if ('interface_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x7c);
		buffer.writeUInt8(payload.interface_settings.object);
		if (payload.interface_settings.object == 0x00) {
			// 1：V1/ NO, 2：V2/ NC
			buffer.writeUInt8(payload.interface_settings.valve_4_pipe_2_wire.cooling);
			// 1：V1/ NO, 2：V2/ NC
			buffer.writeUInt8(payload.interface_settings.valve_4_pipe_2_wire.heating);
		}
		if (payload.interface_settings.object == 0x01) {
			// 1：V1/ NO, 2：V2/ NC
			buffer.writeUInt8(payload.interface_settings.valve_2_pipe_2_wire.control);
		}
		if (payload.interface_settings.object == 0x02) {
			// 1：V1/ NO, 2：V2/ NC
			buffer.writeUInt8(payload.interface_settings.valve_2_pipe_3_wire.no);
			// 1：V1/ NO, 2：V2/ NC
			buffer.writeUInt8(payload.interface_settings.valve_2_pipe_3_wire.nc);
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x8e
	if ('fan_stop_enable' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x8e);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.fan_stop_enable);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x80
	if ('di_enable' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x80);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.di_enable);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x81
	if ('di_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x81);
		buffer.writeUInt8(payload.di_settings.object);
		if (payload.di_settings.object == 0x00) {
			buffer.writeUInt8(payload.di_settings.card_control.type);
			if (payload.di_settings.card_control.type == 0x00) {
				// 0：system off, 1：system on
				buffer.writeUInt8(payload.di_settings.card_control.system_control.trigger_by_insertion);
			}
			if (payload.di_settings.card_control.type == 0x01) {
				// 0：Schedule1, 1：Schedule2, 2：Schedule3, 3：Schedule4, 4：Schedule5, 5：Schedule6, 6：Schedule7, 7：Schedule8, 255：None
				buffer.writeUInt8(payload.di_settings.card_control.insertion_plan.trigger_by_insertion);
				// 0：Schedule1, 1：Schedule2, 2：Schedule3, 3：Schedule4, 4：Schedule5, 5：Schedule6, 6：Schedule7, 7：Schedule8, 255：None
				buffer.writeUInt8(payload.di_settings.card_control.insertion_plan.trigger_by_extraction);
			}
		}
		if (payload.di_settings.object == 0x01) {
			// 0：NO, 1：NC
			buffer.writeUInt8(payload.di_settings.magnet_detection.magnet_type);
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x82
	if ('window_opening_detection_enable' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x82);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.window_opening_detection_enable);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x83
	if ('window_opening_detection_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x83);
		buffer.writeUInt8(payload.window_opening_detection_settings.type);
		if (payload.window_opening_detection_settings.type == 0x00) {
			if (payload.window_opening_detection_settings.temperature_detection.difference_in_temperature < 1 || payload.window_opening_detection_settings.temperature_detection.difference_in_temperature > 10) {
				throw new Error('window_opening_detection_settings.temperature_detection.difference_in_temperature must be between 1 and 10');
			}
			buffer.writeInt16LE(payload.window_opening_detection_settings.temperature_detection.difference_in_temperature * 100);
			if (payload.window_opening_detection_settings.temperature_detection.stop_time < 1 || payload.window_opening_detection_settings.temperature_detection.stop_time > 60) {
				throw new Error('window_opening_detection_settings.temperature_detection.stop_time must be between 1 and 60');
			}
			buffer.writeUInt8(payload.window_opening_detection_settings.temperature_detection.stop_time);
		}
		if (payload.window_opening_detection_settings.type == 0x01) {
			if (payload.window_opening_detection_settings.magnet_detection.duration < 1 || payload.window_opening_detection_settings.magnet_detection.duration > 60) {
				throw new Error('window_opening_detection_settings.magnet_detection.duration must be between 1 and 60');
			}
			buffer.writeUInt8(payload.window_opening_detection_settings.magnet_detection.duration);
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x84
	if ('freeze_protection_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x84);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.freeze_protection_settings.enable);
		if (payload.freeze_protection_settings.target_temperature < 1 || payload.freeze_protection_settings.target_temperature > 5) {
			throw new Error('freeze_protection_settings.target_temperature must be between 1 and 5');
		}
		buffer.writeInt16LE(payload.freeze_protection_settings.target_temperature * 100);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x86
	if ('d2d_pairing_enable' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x86);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.d2d_pairing_enable);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x87
	if ('d2d_pairing_settings' in payload) {
		var buffer = new Buffer();
		for (var d2d_pairing_settings_id = 0; d2d_pairing_settings_id < (payload.d2d_pairing_settings && payload.d2d_pairing_settings.length); d2d_pairing_settings_id++) {
			var d2d_pairing_settings_item = payload.d2d_pairing_settings[d2d_pairing_settings_id];
			var d2d_pairing_settings_item_id = d2d_pairing_settings_item.index;
			if (isValid(d2d_pairing_settings_item.enable)) {
				buffer.writeUInt8(0x87);
				buffer.writeUInt8(d2d_pairing_settings_item_id);
				// 0：disable, 1：enable
				buffer.writeUInt8(0x00);
				// 0：disable, 1：enable
				buffer.writeUInt8(d2d_pairing_settings_item.enable);
			}
			if (isValid(d2d_pairing_settings_item.deveui)) {
				buffer.writeUInt8(0x87);
				buffer.writeUInt8(d2d_pairing_settings_item_id);
				buffer.writeUInt8(0x01);
				buffer.writeHexString(d2d_pairing_settings_item.deveui, 8);
			}
			if (isValid(d2d_pairing_settings_item.name_first)) {
				buffer.writeUInt8(0x87);
				buffer.writeUInt8(d2d_pairing_settings_item_id);
				buffer.writeUInt8(0x02);
				buffer.writeString(d2d_pairing_settings_item.name_first, 8);
			}
			if (isValid(d2d_pairing_settings_item.name_last)) {
				buffer.writeUInt8(0x87);
				buffer.writeUInt8(d2d_pairing_settings_item_id);
				buffer.writeUInt8(0x03);
				buffer.writeString(d2d_pairing_settings_item.name_last, 8);
			}
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x88
	if ('d2d_master_enable' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x88);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.d2d_master_enable);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x89
	if ('d2d_master_settings' in payload) {
		var buffer = new Buffer();
		for (var d2d_master_settings_id = 0; d2d_master_settings_id < (payload.d2d_master_settings && payload.d2d_master_settings.length); d2d_master_settings_id++) {
			var d2d_master_settings_item = payload.d2d_master_settings[d2d_master_settings_id];
			var d2d_master_settings_item_id = d2d_master_settings_item.trigger_condition;
			buffer.writeUInt8(0x89);
			buffer.writeUInt8(d2d_master_settings_item_id);
			// 0：disable, 1：enable
			buffer.writeUInt8(d2d_master_settings_item.enable);
			buffer.writeHexString(d2d_master_settings_item.command, 2);
			// 0：disable, 1：enable
			buffer.writeUInt8(d2d_master_settings_item.uplink);
			// 0：disable, 1：enable
			buffer.writeUInt8(d2d_master_settings_item.control_time_enable);
			if (d2d_master_settings_item.control_time < 1 || d2d_master_settings_item.control_time > 1440) {
				throw new Error('control_time must be between 1 and 1440');
			}
			buffer.writeUInt16LE(d2d_master_settings_item.control_time);
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x8a
	if ('d2d_slave_enable' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x8a);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.d2d_slave_enable);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x8b
	if ('d2d_slave_settings' in payload) {
		var buffer = new Buffer();
		for (var d2d_slave_settings_id = 0; d2d_slave_settings_id < (payload.d2d_slave_settings && payload.d2d_slave_settings.length); d2d_slave_settings_id++) {
			var d2d_slave_settings_item = payload.d2d_slave_settings[d2d_slave_settings_id];
			var d2d_slave_settings_item_id = d2d_slave_settings_item.index;
			buffer.writeUInt8(0x8b);
			buffer.writeUInt8(d2d_slave_settings_item_id);
			// 0：disable, 1：enable
			buffer.writeUInt8(d2d_slave_settings_item.enable);
			buffer.writeHexString(d2d_slave_settings_item.command, 2);
			// 0：Schedule1, 1：Schedule2, 2：Schedule3, 3：Schedule4, 4：Schedule5, 5：Schedule6, 6：Schedule7, 7：Schedule8, 16：System Off, 17：System On
			buffer.writeUInt8(d2d_slave_settings_item.value);
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xb9
	if ('query_device_status' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xb9);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xb8
	if ('synchronize_time' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xb8);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xbd
	if ('clear_historical_data' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xbd);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xbc
	if ('stop_historical_data_retrieval' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xbc);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xbb
	if ('retrieve_historical_data_by_time_range' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xbb);
		buffer.writeUInt32LE(payload.retrieve_historical_data_by_time_range.start_time);
		buffer.writeUInt32LE(payload.retrieve_historical_data_by_time_range.end_time);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xba
	if ('retrieve_historical_data_by_time' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xba);
		buffer.writeUInt32LE(payload.retrieve_historical_data_by_time.time);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xb6
	if ('reconnect' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xb6);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x5b
	if ('send_temperature' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x5b);
		if (payload.send_temperature.temperature < -20 || payload.send_temperature.temperature > 60) {
			throw new Error('send_temperature.temperature must be between -20 and 60');
		}
		buffer.writeInt16LE(payload.send_temperature.temperature * 100);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x5c
	if ('send_humidity' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x5c);
		if (payload.send_humidity.humidity < 0 || payload.send_humidity.humidity > 100) {
			throw new Error('send_humidity.humidity must be between 0 and 100');
		}
		buffer.writeUInt16LE(payload.send_humidity.humidity * 10);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x5d
	if ('update_open_windows_state' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x5d);
		// 0：Normal, 1：Open
		buffer.writeUInt8(payload.update_open_windows_state.type);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x5e
	if ('insert_schedule' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x5e);
		// 0：Schedule1, 1：Schedule2, 2：Schedule3, 3：Schedule4, 4：Schedule5, 5：Schedule6, 6：Schedule7, 7：Schedule8
		buffer.writeUInt8(payload.insert_schedule.type);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x5f
	if ('delete_schedule' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x5f);
		// 0：Schedule1, 1：Schedule2, 2：Schedule3, 3：Schedule4, 4：Schedule5, 5：Schedule6, 6：Schedule7, 7：Schedule8, 255：Reset All
		buffer.writeUInt8(payload.delete_schedule.type);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xbf
	if ('reset' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xbf);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xbe
	if ('reboot' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xbe);
		encoded = encoded.concat(buffer.toBytes());
	}
	return encoded;
}

function Buffer() {
	this.buffer = new Array();
}

Buffer.prototype._write = function(value, byteLength, isLittleEndian) {
	value = Math.round(value);
	var offset = 0;
	for (var index = 0; index < byteLength; index++) {
		offset = isLittleEndian ? index << 3 : (byteLength - 1 - index) << 3;
		this.buffer.push((value >> offset) & 0xff);
	}
};

Buffer.prototype.writeUInt8 = function(value) {
	this._write(value, 1, true);
};

Buffer.prototype.writeInt8 = function(value) {
	this._write(value < 0 ? value + 0x100 : value, 1, true);
};

Buffer.prototype.writeUInt16LE = function(value) {
	this._write(value, 2, true);
};

Buffer.prototype.writeInt16LE = function(value) {
	this._write(value < 0 ? value + 0x10000 : value, 2, true);
};

Buffer.prototype.writeUInt24LE = function(value) {
	this._write(value, 3, true);
};

Buffer.prototype.writeInt24LE = function(value) {
	this._write(value < 0 ? value + 0x1000000 : value, 3, true);
};

Buffer.prototype.writeUInt32LE = function(value) {
	this._write(value, 4, true);
};

Buffer.prototype.writeInt32LE = function(value) {
	this._write(value < 0 ? value + 0x100000000 : value, 4, true);
};

Buffer.prototype.writeFloatLE = function(value) {
	var sign = (value < 0 || (value === 0 && 1 / value === -Infinity)) ? 1 : 0;
	var absValue = Math.abs(value);

	if (absValue === 0) {
		this._write(sign ? 0x80000000 : 0, 4, true);
		return;
	} else if (value !== value) {
		this._write(0x7fc00000, 4, true);
		return;
	} else if (absValue === Infinity) {
		this._write((((sign << 31) >>> 0) | 0x7f800000) >>> 0, 4, true);
		return;
	}

	var exponent = Math.floor(Math.log(absValue) / Math.LN2);
	var normalized = absValue / Math.pow(2, exponent);
	if (normalized < 1) {
		exponent -= 1;
		normalized *= 2;
	} else if (normalized >= 2) {
		exponent += 1;
		normalized /= 2;
	}

	var biasedExponent = exponent + 127;
	var mantissaBits = 0;
	if (biasedExponent <= 0) {
		biasedExponent = 0;
		mantissaBits = Math.round(absValue / Math.pow(2, -149));
		if (mantissaBits > 0x7fffff) {
			mantissaBits = 0x7fffff;
		}
	} else {
		mantissaBits = Math.round((normalized - 1) * 0x800000);
		if (mantissaBits === 0x800000) {
			biasedExponent += 1;
			mantissaBits = 0;
		}
		if (biasedExponent >= 0xff) {
			this._write((((sign << 31) >>> 0) | 0x7f800000) >>> 0, 4, true);
			return;
		}
	}

	var floatBits = ((((sign << 31) >>> 0) | ((biasedExponent & 0xff) << 23) | (mantissaBits & 0x7fffff)) >>> 0);
	this._write(floatBits, 4, true);
};

Buffer.prototype.writeBytes = function(bytes, length, mustEqual) {
	if (mustEqual === undefined) mustEqual = false;
	if (length < bytes.length) {
		throw new Error('bytes length is greater than length');
	}
	if (mustEqual && bytes.length != length) {
		throw new Error('bytes length is not equal to length');
	}

	for (var i = 0; i < bytes.length; i++) {
		this.buffer.push(bytes[i]);
	}

	if (length > bytes.length) {
		for (var i = bytes.length; i < length; i++) {
			this.buffer.push(0);
		}
	}
};

Buffer.prototype.writeHexString = function(hexString, length, mustEqual) {
	if (mustEqual === undefined) mustEqual = false;
	var bytes = [];
	for (var i = 0; i < hexString.length; i += 2) {
		bytes.push(parseInt(hexString.substr(i, 2), 16));
	}
	if (mustEqual && bytes.length != length) {
		throw new Error('hex string length is not equal to length');
	}
	this.writeBytes(bytes, length);
};

Buffer.prototype.writeString = function(str, length, mustEqual) {
	if (mustEqual === undefined) mustEqual = false;
	var bytes = encodeUtf8(str);
	if (mustEqual && bytes.length != length) {
		throw new Error('string length is not equal to length');
	}
	this.writeBytes(bytes, length);
};

Buffer.prototype.writeUnknownDataType = function(val) {
	throw new Error('Unknown data type encountered. Please Contact Developer.');
};

Buffer.prototype.writeHexStringReverse = function(hexString, length, mustEqual) {
	if (mustEqual === undefined) mustEqual = false;
	var bytes = [];
	for (var i = hexString.length - 2; i >= 0; i -= 2) {
		bytes.push(parseInt(hexString.substr(i, 2), 16));
	}
	if (mustEqual && bytes.length != length) {
		throw new Error('hex string length is not equal to length');
	}
	this.writeBytes(bytes, length);
};

Buffer.prototype.toBytes = function() {
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

function isValid(value) {
	return value !== undefined && value !== null && value !== '';
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

function cmdMap() {
	return {
		  "request_check_order": "fe",
		  "request_full_inspection": "f4",
		  "request_full_inspection.start_inspection": "f400",
		  "request_full_inspection.control": "f401",
		  "request_full_inspection.reading": "f402",
		  "request_full_inspection.end_inspection": "f403",
		  "request_command_queries": "ef",
		  "all_configurations_request_by_device": "ee",
		  "lorawan_configuration_settings": "cf",
		  "lorawan_configuration_settings.mode": "cf00",
		  "tsl_version": "df",
		  "product_sn": "db",
		  "version": "da",
		  "oem_id": "d9",
		  "data_source": "04",
		  "temperature": "01",
		  "humidity": "02",
		  "target_temperature": "03",
		  "temperature_control_info": "05",
		  "temperature_control_valve_status": "06",
		  "fan_control_info": "07",
		  "execution_plan_id": "08",
		  "temperature_alarm": "09",
		  "temperature_alarm.collection_error": "0900",
		  "temperature_alarm.lower_range_error": "0901",
		  "temperature_alarm.over_range_error": "0902",
		  "temperature_alarm.no_data": "0903",
		  "temperature_alarm.lower_range_alarm_deactivation": "0910",
		  "temperature_alarm.lower_range_alarm_trigger": "0911",
		  "temperature_alarm.over_range_alarm_deactivation": "0912",
		  "temperature_alarm.over_range_alarm_trigger": "0913",
		  "temperature_alarm.within_range_alarm_deactivation": "0914",
		  "temperature_alarm.within_range_alarm_trigger": "0915",
		  "temperature_alarm.exceed_range_alarm_deactivation": "0916",
		  "temperature_alarm.exceed_range_alarm_trigger": "0917",
		  "temperature_alarm.persistent_low_temperature_alarm_deactivation": "0920",
		  "temperature_alarm.persistent_low_temperature_alarm_trigger": "0921",
		  "temperature_alarm.persistent_high_alarm_deactivation": "0922",
		  "temperature_alarm.persistent_high_alarm_trigger": "0923",
		  "temperature_alarm.anti_freeze_protection_deactivation": "0930",
		  "temperature_alarm.anti_freeze_protection_trigger": "0931",
		  "temperature_alarm.window_status_detection_deactivation": "0932",
		  "temperature_alarm.window_status_detection_trigger": "0933",
		  "humidity_alarm": "0a",
		  "humidity_alarm.collection_error": "0a00",
		  "humidity_alarm.lower_range_error": "0a01",
		  "humidity_alarm.over_range_error": "0a02",
		  "humidity_alarm.no_data": "0a03",
		  "target_temperature_alarm": "0b",
		  "target_temperature_alarm.no_data": "0b03",
		  "relay_status": "10",
		  "device_status": "c8",
		  "collection_interval": "60",
		  "collection_interval.seconds_of_time": "6000",
		  "collection_interval.minutes_of_time": "6001",
		  "reporting_interval": "62",
		  "reporting_interval.seconds_of_time": "6200",
		  "reporting_interval.minutes_of_time": "6201",
		  "auto_p_enable": "c4",
		  "relay_changes_report_enable": "90",
		  "temperature_unit": "63",
		  "temperature_source": "85",
		  "temperature_source.lorawan_reception": "8502",
		  "temperature_source.d2d_reception": "8503",
		  "system_status": "67",
		  "mode_enable": "64",
		  "temperature_control_mode": "68",
		  "target_temperature_resolution": "69",
		  "heating_target_temperature": "6b",
		  "cooling_target_temperature": "6c",
		  "target_temperature_tolerance": "6a",
		  "heating_target_temperature_range": "6d",
		  "cooling_target_temperature_range": "6e",
		  "target_humidity_range": "70",
		  "temperature_control_dehumidification": "6f",
		  "fan_control_mode": "72",
		  "fan_delay_close": "74",
		  "fan_auto_mode_temperature_range": "73",
		  "timed_system_control": "8c",
		  "timed_system_control.enable": "8c00",
		  "timed_system_control.start_cycle_settings": "8c01",
		  "timed_system_control.start_cycle_settings._item": "8c01xx",
		  "timed_system_control.end_cycle_settings": "8c02",
		  "timed_system_control.end_cycle_settings._item": "8c02xx",
		  "intelligent_display_enable": "65",
		  "screen_object_settings": "66",
		  "child_lock": "75",
		  "temporary_unlock_settings": "8d",
		  "time_zone": "c7",
		  "daylight_saving_time": "c6",
		  "data_storage_settings": "c5",
		  "data_storage_settings.enable": "c500",
		  "data_storage_settings.retransmission_enable": "c501",
		  "data_storage_settings.retransmission_interval": "c502",
		  "data_storage_settings.retrieval_interval": "c503",
		  "temperature_calibration_settings": "79",
		  "humidity_calibration_settings": "7a",
		  "temperature_alarm_settings": "76",
		  "high_temperature_alarm_settings": "77",
		  "low_temperature_alarm_settings": "78",
		  "schedule_settings": "7b",
		  "schedule_settings._item": "7bxx",
		  "schedule_settings._item.enable": "7bxx00",
		  "schedule_settings._item.name_first": "7bxx01",
		  "schedule_settings._item.name_last": "7bxx02",
		  "schedule_settings._item.content": "7bxx03",
		  "schedule_settings._item.cycle_settings": "7bxx04",
		  "schedule_settings._item.cycle_settings._item": "7bxx04xx",
		  "interface_settings": "7c",
		  "interface_settings.valve_4_pipe_2_wire": "7c00",
		  "interface_settings.valve_2_pipe_2_wire": "7c01",
		  "interface_settings.valve_2_pipe_3_wire": "7c02",
		  "fan_stop_enable": "8e",
		  "di_enable": "80",
		  "di_settings": "81",
		  "di_settings.card_control": "8100",
		  "di_settings.card_control.system_control": "810000",
		  "di_settings.card_control.insertion_plan": "810001",
		  "di_settings.magnet_detection": "8101",
		  "window_opening_detection_enable": "82",
		  "window_opening_detection_settings": "83",
		  "window_opening_detection_settings.temperature_detection": "8300",
		  "window_opening_detection_settings.magnet_detection": "8301",
		  "freeze_protection_settings": "84",
		  "d2d_pairing_enable": "86",
		  "d2d_pairing_settings": "87",
		  "d2d_pairing_settings._item": "87xx",
		  "d2d_pairing_settings._item.enable": "87xx00",
		  "d2d_pairing_settings._item.deveui": "87xx01",
		  "d2d_pairing_settings._item.name_first": "87xx02",
		  "d2d_pairing_settings._item.name_last": "87xx03",
		  "d2d_master_enable": "88",
		  "d2d_master_settings": "89",
		  "d2d_master_settings._item": "89xx",
		  "d2d_slave_enable": "8a",
		  "d2d_slave_settings": "8b",
		  "d2d_slave_settings._item": "8bxx",
		  "query_device_status": "b9",
		  "synchronize_time": "b8",
		  "clear_historical_data": "bd",
		  "stop_historical_data_retrieval": "bc",
		  "retrieve_historical_data_by_time_range": "bb",
		  "retrieve_historical_data_by_time": "ba",
		  "reconnect": "b6",
		  "send_temperature": "5b",
		  "send_humidity": "5c",
		  "update_open_windows_state": "5d",
		  "insert_schedule": "5e",
		  "delete_schedule": "5f",
		  "reset": "bf",
		  "reboot": "be"
	};
}
function processTemperature(payload) {
	var allTemperatureProperties = {
    "temperature": {
        "coefficient": 0.01
    },
    "target_temperature": {
        "coefficient": 0.01
    },
    "temperature_alarm.lower_range_alarm_deactivation.temperature": {
        "coefficient": 0.01
    },
    "temperature_alarm.lower_range_alarm_trigger.temperature": {
        "coefficient": 0.01
    },
    "temperature_alarm.over_range_alarm_deactivation.temperature": {
        "coefficient": 0.01
    },
    "temperature_alarm.over_range_alarm_trigger.temperature": {
        "coefficient": 0.01
    },
    "temperature_alarm.within_range_alarm_deactivation.temperature": {
        "coefficient": 0.01
    },
    "temperature_alarm.within_range_alarm_trigger.temperature": {
        "coefficient": 0.01
    },
    "temperature_alarm.exceed_range_alarm_deactivation.temperature": {
        "coefficient": 0.01
    },
    "temperature_alarm.exceed_range_alarm_trigger.temperature": {
        "coefficient": 0.01
    },
    "temperature_alarm.persistent_low_temperature_alarm_deactivation.temperature": {
        "coefficient": 0.01
    },
    "temperature_alarm.persistent_low_temperature_alarm_trigger.temperature": {
        "coefficient": 0.01
    },
    "temperature_alarm.persistent_high_alarm_deactivation.temperature": {
        "coefficient": 0.01
    },
    "temperature_alarm.persistent_high_alarm_trigger.temperature": {
        "coefficient": 0.01
    },
    "temperature_alarm.anti_freeze_protection_deactivation.temperature": {
        "coefficient": 0.01
    },
    "temperature_alarm.anti_freeze_protection_trigger.temperature": {
        "coefficient": 0.01
    },
    "temperature_alarm.window_status_detection_deactivation.temperature": {
        "coefficient": 0.01
    },
    "temperature_alarm.window_status_detection_trigger.temperature": {
        "coefficient": 0.01
    },
    "heating_target_temperature": {
        "coefficient": 0.01
    },
    "cooling_target_temperature": {
        "coefficient": 0.01
    },
    "target_temperature_tolerance": {
        "coefficient": 0.01
    },
    "heating_target_temperature_range.min": {
        "coefficient": 0.01
    },
    "heating_target_temperature_range.max": {
        "coefficient": 0.01
    },
    "cooling_target_temperature_range.min": {
        "coefficient": 0.01
    },
    "cooling_target_temperature_range.max": {
        "coefficient": 0.01
    },
    "temperature_control_dehumidification.temperature_tolerance": {
        "coefficient": 0.01
    },
    "fan_auto_mode_temperature_range.speed_range_1": {
        "coefficient": 0.01
    },
    "fan_auto_mode_temperature_range.speed_range_2": {
        "coefficient": 0.01
    },
    "temperature_calibration_settings.calibration_value": {
        "coefficient": 0.01
    },
    "temperature_alarm_settings.threshold_min": {
        "coefficient": 0.01
    },
    "temperature_alarm_settings.threshold_max": {
        "coefficient": 0.01
    },
    "high_temperature_alarm_settings.difference_in_temperature": {
        "coefficient": 0.01
    },
    "low_temperature_alarm_settings.difference_in_temperature": {
        "coefficient": 0.01
    },
    "schedule_settings._item.content.heat_target_temperature": {
        "coefficient": 0.01
    },
    "schedule_settings._item.content.cool_target_temperature": {
        "coefficient": 0.01
    },
    "schedule_settings._item.content.temperature_tolerance": {
        "coefficient": 0.01
    },
    "window_opening_detection_settings.temperature_detection.difference_in_temperature": {
        "coefficient": 0.01
    },
    "freeze_protection_settings.target_temperature": {
        "coefficient": 0.01
    },
    "send_temperature.temperature": {
        "coefficient": 0.01
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
            var dotIndex = stringCoefficient.indexOf('.');
            var precision = dotIndex != -1 ? stringCoefficient.length - dotIndex - 1 : 0;
            if (!hasPath(payload, propertyId)) {
                if (hasPath(payload, fahrenheitProperty) && hasPath(payload, celsiusProperty)) {
                    throw new Error(fahrenheitProperty + ' and ' + celsiusProperty + ' cannot be in payload at the same time');
                }
                if (hasPath(payload, fahrenheitProperty)) {
                    setPath(payload, propertyId, Number(((getPath(payload, fahrenheitProperty) - 32) / 1.8).toFixed(precision)));
                } else if (hasPath(payload, celsiusProperty)) {
                    setPath(payload, propertyId, Number(getPath(payload, celsiusProperty).toFixed(precision)));
                }
            }
        }
	}
	return payload;
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
    } else if (result && typeof result.fPort === "undefined") {
        result.fPort = 100;
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
