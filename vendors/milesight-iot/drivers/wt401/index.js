/**
 * Payload Decoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product WT401
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

    var unknown_command = 0;
    for (var i = 0; i < bytes.length; ) {
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
            case 0x00:
                decoded.battery = readUInt8(bytes[i]);
                i += 1;
                break;
            case 0x01:
                decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 100;
                i += 2;
                break;
            case 0x02:
                decoded.humidity = readUInt16LE(bytes.slice(i, i + 2)) / 10;
                i += 2;
                break;
            case 0x03:
                decoded.temperature_control_mode = readTemperatureControlMode(bytes[i]);
                i += 1;
                break;
            case 0x04:
                decoded.fan_mode = readFanMode(bytes[i]);
                i += 1;
                break;
            case 0x05:
                decoded.execution_plan = readPlan(readUInt8(bytes[i]));
                i += 1;
                break;
            case 0x06:
                decoded.target_temperature_1 = readInt16LE(bytes.slice(i, i + 2)) / 100;
                i += 2;
                break;
            case 0x07:
                decoded.target_temperature_2 = readInt16LE(bytes.slice(i, i + 2)) / 100;
                i += 2;
                break;
            case 0x08:
                decoded.pir_status = readPIRStatus(bytes[i]);
                i += 1;
                break;
            case 0x09:
                decoded.ble_event = readBleEvent(bytes[i]);
                i += 1;
                break;
            case 0x0a:
                decoded.power_bus_event = readPowerBusEvent(bytes[i]);
                i += 1;
                break;
            case 0x0b:
                decoded.temperature_alarm = readTemperatureAlarm(bytes[i]);
                i += 1;
                break;
            case 0x0c:
                decoded.humidity_alarm = readHumidityAlarm(bytes[i]);
                i += 1;
                break;
            case 0x0d:
                decoded.button_event = readButtonEvent(bytes[i]);
                i += 1;
                break;
            case 0x0f:
                decoded.battery_event = readBatteryEvent(bytes[i]);
                i += 1;
                break;

            // config
            case 0x56:
                decoded.peer_ble_pair_info = {};
                decoded.peer_ble_pair_info.address_type = readAddressType(bytes[i]);
                decoded.peer_ble_pair_info.address = readHexString(bytes.slice(i + 1, i + 1 + 6));
                decoded.peer_ble_pair_info.name = readString(bytes.slice(i + 7, i + 7 + 32));
                i += 40;
                break;
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
            case 0x61:
                decoded.reporting_interval = {};
                decoded.reporting_interval.mode = readReportingMode(bytes[i]);
                decoded.reporting_interval.unit = readTimeUnitType(bytes[i + 1]);
                var time_unit = readUInt8(bytes[i + 1]);
                if (time_unit === 0) {
                    decoded.reporting_interval.seconds_of_time = readUInt16LE(bytes.slice(i + 2, i + 4));
                } else if (time_unit === 1) {
                    decoded.reporting_interval.minutes_of_time = readUInt16LE(bytes.slice(i + 2, i + 4));
                }
                i += 4;
                break;
            case 0x62:
                decoded.intelligent_display_enable = readEnableStatus(bytes[i]);
                i += 1;
                break;
            case 0x63:
                decoded.temperature_unit = readTemperatureUnit(bytes[i]);
                i += 1;
                break;
            case 0x64:
                var data = readUInt8(bytes[i]);
                decoded.temperature_control_mode_support = {};
                var mode_bit_offset = { heat: 0, em_heat: 1, cool: 2, auto: 3 };
                for (var mode in mode_bit_offset) {
                    decoded.temperature_control_mode_support[mode] = readEnableStatus((data >> mode_bit_offset[mode]) & 0x01);
                }
                i += 1;
                break;
            case 0x65:
                decoded.target_temperature_mode = readTargetTemperatureMode(bytes[i]);
                i += 1;
                break;
            case 0x66:
                decoded.target_temperature_resolution = readTargetTemperatureResolution(bytes[i]);
                i += 1;
                break;
            case 0x67:
                decoded.system_status = readSystemStatus(bytes[i]);
                i += 1;
                break;
            case 0x68:
                var data = readUInt8(bytes[i]);
                if (data === 0x00) {
                    decoded.temperature_control_mode = readTemperatureControlMode(bytes[i + 1]);
                } else if (data === 0x01) {
                    decoded.temperature_control_mode_in_plan_enable = readEnableStatus(bytes[i + 1]);
                }
                i += 2;
                break;
            case 0x69:
                var data = readUInt8(bytes[i]);
                var temperature = readInt16LE(bytes.slice(i + 1, i + 3)) / 100;
                // heat
                if (data === 0x00) {
                    decoded.target_temperature_settings = decoded.target_temperature_settings || {};
                    decoded.target_temperature_settings.heat = temperature;
                }
                // em heat
                else if (data === 0x01) {
                    decoded.target_temperature_settings = decoded.target_temperature_settings || {};
                    decoded.target_temperature_settings.em_heat = temperature;
                }
                // cool
                else if (data === 0x02) {
                    decoded.target_temperature_settings = decoded.target_temperature_settings || {};
                    decoded.target_temperature_settings.cool = temperature;
                }
                // auto
                else if (data === 0x03) {
                    decoded.target_temperature_settings = decoded.target_temperature_settings || {};
                    decoded.target_temperature_settings.auto = temperature;
                }
                // dual (auto heat)
                else if (data === 0x04) {
                    decoded.target_temperature_settings = decoded.target_temperature_settings || {};
                    decoded.target_temperature_settings.auto_heat = temperature;
                }
                // dual (auto cool)
                else if (data === 0x05) {
                    decoded.target_temperature_settings = decoded.target_temperature_settings || {};
                    decoded.target_temperature_settings.auto_cool = temperature;
                }
                i += 3;
                break;
            case 0x6a:
                decoded.dead_band = readInt16LE(bytes.slice(i, i + 2)) / 100;
                i += 2;
                break;
            case 0x6b:
                var data = readUInt8(bytes[i]);
                var range = {};
                range.min = readInt16LE(bytes.slice(i + 1, i + 3)) / 100;
                range.max = readInt16LE(bytes.slice(i + 3, i + 5)) / 100;
                i += 5;
                if (data === 0x00) {
                    decoded.target_temperature_range = decoded.target_temperature_range || {};
                    decoded.target_temperature_range.heat = range;
                } else if (data === 0x01) {
                    decoded.target_temperature_range = decoded.target_temperature_range || {};
                    decoded.target_temperature_range.em_heat = range;
                } else if (data === 0x02) {
                    decoded.target_temperature_range = decoded.target_temperature_range || {};
                    decoded.target_temperature_range.cool = range;
                } else if (data === 0x03) {
                    decoded.target_temperature_range = decoded.target_temperature_range || {};
                    decoded.target_temperature_range.auto = range;
                }
                break;
            case 0x6c:
                decoded.communicate_interval = {};
                decoded.communicate_interval.mode = readReportingMode(bytes[i]);
                decoded.communicate_interval.unit = readTimeUnitType(bytes[i + 1]);
                var time_unit = readUInt8(bytes[i + 1]);
                if (time_unit === 0) {
                    decoded.communicate_interval.seconds_of_time = readUInt16LE(bytes.slice(i + 2, i + 4));
                } else if (time_unit === 1) {
                    decoded.communicate_interval.minutes_of_time = readUInt16LE(bytes.slice(i + 2, i + 4));
                }
                i += 4;
                break;
            case 0x71:
                var data = readUInt8(bytes[i]);
                decoded.button_custom_function = decoded.button_custom_function || {};
                if (data === 0x00) {
                    decoded.button_custom_function.enable = readEnableStatus(bytes[i + 1]);
                }
                // button 1
                else if (data === 0x01 || data === 0x02 || data === 0x03) {
                    var button_name = "button_" + data;
                    decoded.button_custom_function[button_name] = readButtonFunction(bytes[i + 1]);
                }
                i += 2;
                break;
            case 0x72:
                var enable = readEnableStatus(bytes[i]);
                var data = readUInt16LE(bytes.slice(i + 1, i + 3));
                decoded.child_lock_settings = {};
                decoded.child_lock_settings.enable = enable;
                var button_bit_offset = { temperature_up: 0, temperature_down: 1, system_on_off: 2, fan_mode: 3, temperature_control_mode: 4, reboot_reset: 5, power_on_off: 6, cancel_pair: 7, plan_switch: 8, status_report: 9, release_filter_alarm: 10, button_report_1: 11, button_report_2: 12, button_report_3: 13, temperature_unit_switch: 14 };
                for (var button in button_bit_offset) {
                    decoded.child_lock_settings[button] = readEnableStatus((data >> button_bit_offset[button]) & 0x01);
                }
                i += 3;
                break;
            case 0x74:
                decoded.fan_mode = readFanMode(bytes[i]);
                i += 1;
                break;
            case 0x75:
                decoded.screen_display_settings = decoded.screen_display_settings || {};
                var screen_object_data = readUInt8(bytes[i]);
                var screen_object_bit_offset = { plan_name: 0, ambient_temperature: 1, ambient_humidity: 2, target_temperature: 3 };
                for (var key in screen_object_bit_offset) {
                    decoded.screen_display_settings[key] = readEnableStatus((screen_object_data >>> screen_object_bit_offset[key]) & 0x01);
                }
                i += 1;
                break;
            case 0x76:
                decoded.temperature_calibration_settings = {};
                decoded.temperature_calibration_settings.enable = readEnableStatus(bytes[i]);
                decoded.temperature_calibration_settings.calibration_value = readInt16LE(bytes.slice(i + 1, i + 3)) / 100;
                i += 3;
                break;
            case 0x77:
                decoded.humidity_calibration_settings = {};
                decoded.humidity_calibration_settings.enable = readEnableStatus(bytes[i]);
                decoded.humidity_calibration_settings.calibration_value = readInt16LE(bytes.slice(i + 1, i + 3)) / 10;
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
                    plan_config.temperature_control_mode = readTemperatureControlMode(bytes[i + 2]);
                    plan_config.heat_target_temperature = readInt16LE(bytes.slice(i + 3, i + 5)) / 100;
                    plan_config.em_heat_target_temperature = readInt16LE(bytes.slice(i + 5, i + 7)) / 100;
                    plan_config.cool_target_temperature = readInt16LE(bytes.slice(i + 7, i + 9)) / 100;
                    i += 9;
                } else if (data === 0x04) {
                    plan_config.fan_mode = readFanMode(bytes[i + 2]);
                    plan_config.auto_target_temperature = readInt16LE(bytes.slice(i + 3, i + 5)) / 100;
                    plan_config.auto_heat_target_temperature = readInt16LE(bytes.slice(i + 5, i + 7)) / 100;
                    plan_config.auto_cool_target_temperature = readInt16LE(bytes.slice(i + 7, i + 9)) / 100;
                    i += 9;
                }
                decoded.plan_config = decoded.plan_config || [];
                decoded.plan_config.push(plan_config);
                break;
            case 0x7d:
                decoded.data_sync_to_peer = readDataSource(bytes[i]);
                i += 1;
                break;
            case 0x7e:
                decoded.data_sync_timeout = readUInt8(bytes[i]);
                i += 1;
                break;
            case 0x80:
                var data = readUInt8(bytes[i]);
                decoded.unlock_combination_button_settings = {};
                var button_bit_offset = { button_1: 0, button_2: 1, button_3: 2, button_4: 3, button_5: 4 };
                for (var button in button_bit_offset) {
                    decoded.unlock_combination_button_settings[button] = readEnableStatus((data >> button_bit_offset[button]) & 0x01);
                }
                i += 1;
                break;
            case 0x81:
                decoded.temporary_unlock_settings = decoded.temporary_unlock_settings || {};
                decoded.temporary_unlock_settings.enable = readEnableStatus(bytes[i]);
                decoded.temporary_unlock_settings.timeout = readUInt16LE(bytes.slice(i + 1, i + 3));
                i += 3;
                break;
            case 0x82:
                var data = readUInt8(bytes[i]);
                decoded.pir_config = decoded.pir_config || {};
                if (data === 0x01) {
                    decoded.pir_config.enable = readEnableStatus(bytes[i + 1]);
                    i += 2;
                } else if (data === 0x02) {
                    decoded.pir_config.release_time = readUInt16LE(bytes.slice(i + 1, i + 3));
                    i += 3;
                } else if (data === 0x03) {
                    decoded.pir_config.general_mode = decoded.pir_config.general_mode || {};
                    decoded.pir_config.general_mode.detection_mode = readPIRDetectionMode(bytes[i + 1]);
                    i += 2;
                } else if (data === 0x04) {
                    decoded.pir_config.general_mode = decoded.pir_config.general_mode || {};
                    decoded.pir_config.general_mode.period = readUInt8(bytes[i + 1]);
                    decoded.pir_config.general_mode.rate = readUInt8(bytes[i + 2]);
                    i += 3;
                }
                break;
            case 0x83:
                var data = readUInt8(bytes[i]);
                decoded.pir_config = decoded.pir_config || {};
                if (data === 0x01) {
                    decoded.pir_config.eco_mode = decoded.pir_config.eco_mode || {};
                    decoded.pir_config.eco_mode.enable = readEnableStatus(bytes[i + 1]);
                    i += 2;
                } else if (data === 0x02) {
                    decoded.pir_config.eco_mode = decoded.pir_config.eco_mode || {};
                    decoded.pir_config.eco_mode.occupied_plan = readPlan(readUInt8(bytes[i + 1]));
                    decoded.pir_config.eco_mode.vacant_plan = readPlan(readUInt8(bytes[i + 2]));
                    i += 3;
                }
                break;
            case 0x84:
                var data = readUInt8(bytes[i]);
                decoded.pir_config = decoded.pir_config || {};
                if (data === 0x01) {
                    decoded.pir_config.night_mode = decoded.pir_config.night_mode || {};
                    decoded.pir_config.night_mode.enable = readEnableStatus(bytes[i + 1]);
                    i += 2;
                } else if (data === 0x02) {
                    decoded.pir_config.night_mode = decoded.pir_config.night_mode || {};
                    decoded.pir_config.night_mode.detection_mode = readPIRDetectionMode(bytes[i + 1]);
                    i += 2;
                } else if (data === 0x03) {
                    decoded.pir_config.night_mode = decoded.pir_config.night_mode || {};
                    decoded.pir_config.night_mode.period = readUInt8(bytes[i + 1]);
                    decoded.pir_config.night_mode.rate = readUInt8(bytes[i + 2]);
                    i += 3;
                } else if (data === 0x04) {
                    decoded.pir_config.night_mode = decoded.pir_config.night_mode || {};
                    decoded.pir_config.night_mode.start_time = readUInt16LE(bytes.slice(i + 1, i + 3));
                    decoded.pir_config.night_mode.end_time = readUInt16LE(bytes.slice(i + 3, i + 5));
                    i += 5;
                } else if (data === 0x05) {
                    decoded.pir_config.night_mode = decoded.pir_config.night_mode || {};
                    decoded.pir_config.night_mode.occupied_plan = readPlan(readUInt8(bytes[i + 1]));
                    i += 2;
                }
                break;
            case 0x85:
                decoded.ble_enable = readEnableStatus(bytes[i]);
                i += 1;
                break;
            case 0x86:
                decoded.external_temperature = readInt16LE(bytes.slice(i, i + 2)) / 100;
                i += 2;
                break;
            case 0x87:
                decoded.external_humidity = readInt16LE(bytes.slice(i, i + 2)) / 10;
                i += 2;
                break;
            case 0x88:
                var data = readUInt8(bytes[i]);
                decoded.fan_support_mode = {};
                var mode_bit_offset = { auto: 0, circulate: 1, on: 2, low: 3, medium: 4, high: 5 };
                for (var mode in mode_bit_offset) {
                    decoded.fan_support_mode[mode] = readEnableStatus((data >> mode_bit_offset[mode]) & 0x01);
                }
                i += 1;
                break;
            case 0x8b:
                decoded.ble_name = readString(bytes.slice(i, i + 32));
                i += 32;
                break;
            case 0x8c:
                decoded.ble_pair_info = {};
                decoded.ble_pair_info.address_type = readAddressType(bytes[i]);
                decoded.ble_pair_info.address = readHexString(bytes.slice(i + 1, i + 1 + 6));
                decoded.ble_pair_info.name = readString(bytes.slice(i + 7, i + 7 + 32));
                i += 40;
                break;
            case 0x8d:
                decoded.communication_mode = readCommunicationMode(bytes[i]);
                i += 1;
                break;
            case 0xc6:
                decoded.daylight_saving_time = {};
                decoded.daylight_saving_time.enable = readEnableStatus(bytes[i]);
                decoded.daylight_saving_time.offset = readUInt8(bytes[i + 1]);
                decoded.daylight_saving_time.start_month = readUInt8(bytes[i + 2]);
                var start_day_value = readUInt8(bytes[i + 3]);
                decoded.daylight_saving_time.start_week_num = (start_day_value >>> 4) & 0x0f;
                decoded.daylight_saving_time.start_week_day = (start_day_value >>> 0) & 0x0f;
                decoded.daylight_saving_time.start_hour_min = readUInt16LE(bytes.slice(i + 4, i + 6));
                decoded.daylight_saving_time.end_month = readUInt8(bytes[i + 6]);
                var end_day_value = readUInt8(bytes[i + 7]);
                decoded.daylight_saving_time.end_week_num = (end_day_value >>> 4) & 0x0f;
                decoded.daylight_saving_time.end_week_day = (end_day_value >>> 0) & 0x0f;
                decoded.daylight_saving_time.end_hour_min = readUInt16LE(bytes.slice(i + 8, i + 10));
                i += 10;
                break;
            case 0xc7:
                decoded.time_zone = readTimeZone(readInt16LE(bytes.slice(i, i + 2)));
                i += 2;
                break;

            // service
            case 0x54:
                decoded.reset_ble_name = readYesNoStatus(1);
                break;
            case 0x55:
                var data = readUInt8(bytes[i]);
                if (data === 0x00) {
                    decoded.release_fan_alarm = readYesNoStatus(1);
                } else if (data === 0x01) {
                    decoded.trigger_fan_alarm = readYesNoStatus(1);
                }
                i += 1;
                break;
            case 0x57:
                var data = readUInt8(bytes[i]);
                if (data === 0x00) {
                    decoded.release_freeze_alarm = readYesNoStatus(1);
                } else if (data === 0x01) {
                    decoded.trigger_freeze_alarm = readYesNoStatus(1);
                }
                i += 1;
                break;
            case 0x58:
                var data = readUInt8(bytes[i]);
                if (data === 0x00) {
                    decoded.release_no_wire_alarm = readYesNoStatus(1);
                } else if (data === 0x01) {
                    decoded.trigger_no_wire_alarm = readYesNoStatus(1);
                }
                i += 1;
                break;
            case 0x5a:
                var data = readUInt8(bytes[i]);
                if (data === 0x00) {
                    decoded.release_window_open_alarm = readYesNoStatus(1);
                } else if (data === 0x01) {
                    decoded.trigger_window_open_alarm = readYesNoStatus(1);
                }
                i += 1;
                break;
            case 0x5b:
                var data = readUInt8(bytes[i]);
                if (data === 0x00) {
                    decoded.release_filter_alarm = readYesNoStatus(1);
                } else if (data === 0x01) {
                    decoded.trigger_filter_alarm = readYesNoStatus(1);
                }
                i += 1;
                break;
            case 0x5c:
                decoded.insert_plan = readPlan(readUInt8(bytes[i]));
                i += 1;
                break;
            case 0x5e:
                var data = readUInt8(bytes[i]);
                if (data === 0x00) {
                    decoded.cancel_ble_pair = readYesNoStatus(1);
                } else if (data === 0x01) {
                    decoded.trigger_ble_pair = readYesNoStatus(1);
                }
                i += 1;
                break;
            case 0x5f:
                decoded.remove_plan = decoded.remove_plan || {};
                var plan_data = readUInt8(bytes[i]);
                var plan_offset = { 0: "plan_1", 1: "plan_2", 2: "plan_3", 3: "plan_4", 4: "plan_5", 5: "plan_6", 6: "plan_7", 7: "plan_8", 8: "plan_9", 9: "plan_10", 10: "plan_11", 11: "plan_12", 12: "plan_13", 13: "plan_14", 14: "plan_15", 15: "plan_16", 255: "reset" };
                decoded.remove_plan[plan_offset[plan_data]] = readYesNoStatus(1);
                i += 1;
                break;
            case 0xb6:
                decoded.reconnect = readYesNoStatus(1);
                break;
            case 0xb8:
                decoded.synchronize_time = readYesNoStatus(1);
                break;
            case 0xb9:
                decoded.query_device_status = readYesNoStatus(1);
                break;
            case 0xbe:
                decoded.reboot = readYesNoStatus(1);
                break;
            case 0x59:
                decoded.system_status_control = decoded.system_status_control || {};
                // 0：system close, 1：system open
                decoded.system_status_control.on_off = readUInt8(bytes[i]);
                // 0：heat, 1：em heat, 2：cool, 3：auto
                decoded.system_status_control.mode = readUInt8(bytes.slice(i + 1, i + 2));
                decoded.system_status_control.temperature1 = readInt16LE(bytes.slice(i + 2, i + 4)) / 100;
                decoded.system_status_control.temperature2 = readInt16LE(bytes.slice(i + 4, i + 6)) / 100;
                i += 6;
                break;

            // control frame
            case 0xef:
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
            case 0xfe:
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
    var major = (bytes[0] & 0xff).toString(16);
    var minor = (bytes[1] & 0xff).toString(16);
    return "v" + major + "." + minor;
}

function readHardwareVersion(bytes) {
    var major = (bytes[0] & 0xff).toString(16);
    var minor = (bytes[1] & 0xff).toString(16);
    return "v" + major + "." + minor;
}

function readFirmwareVersion(bytes) {
    var major = (bytes[0] & 0xff).toString(16);
    var minor = (bytes[1] & 0xff).toString(16);
    var release = (bytes[2] & 0xff).toString(16);
    var alpha = (bytes[3] & 0xff).toString(16);
    var unit_test = (bytes[4] & 0xff).toString(16);
    var test = (bytes[5] & 0xff).toString(16);

    var version = "v" + major + "." + minor;
    if (release !== "0") version += "-r" + release;
    if (alpha !== "0") version += "-a" + alpha;
    if (unit_test !== "0") version += "-u" + unit_test;
    if (test !== "0") version += "-t" + test;
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

function readEnableStatus(status) {
    var status_map = { 0: "disable", 1: "enable" };
    return getValue(status_map, status);
}

function readSystemStatus(status) {
    var status_map = { 0: "off", 1: "on" };
    return getValue(status_map, status);
}

function readTemperatureControlMode(mode) {
    var mode_map = { 0: "heat", 1: "em_heat", 2: "cool", 3: "auto", 10: "off", 11: "NA" };
    return getValue(mode_map, mode);
}

function readFanMode(mode) {
    var mode_map = { 0: "auto", 1: "circulate", 2: "on", 3: "low", 4: "medium", 5: "high", 10: "off", 11: "NA" };
    return getValue(mode_map, mode);
}

function readPIRStatus(status) {
    var status_map = { 0: "vacant", 1: "occupied", 2: "night_occupied" };
    return getValue(status_map, status);
}

function readBleEvent(event) {
    var event_map = { 0: "none", 1: "peer_cancel", 2: "disconnect" };
    return getValue(event_map, event);
}

function readPowerBusEvent(event) {
    var event_map = { 0: "none", 1: "communication_error" };
    return getValue(event_map, event);
}

function readTemperatureAlarm(type) {
    var type_map = { 0: "collection_error", 1: "lower_range_error", 2: "over_range_error", 3: "no_data" };
    return getValue(type_map, type);
}

function readHumidityAlarm(type) {
    var type_map = { 0: "collection_error", 1: "lower_range_error", 2: "over_range_error", 3: "no_data" };
    return getValue(type_map, type);
}

function readButtonEvent(event) {
    var event_map = { 0: "F1", 1: "F2", 2: "F3" };
    return getValue(event_map, event);
}

function readBatteryEvent(event) {
    var event_map = { 0: "recover", 1: "low_voltage" };
    return getValue(event_map, event);
}

function readTimeUnitType(type) {
    var unit_map = { 0: "second", 1: "minute" };
    return getValue(unit_map, type);
}

function readReportingMode(mode) {
    var mode_map = { 0: "ble", 1: "lora", 2: "ble_and_lora", 3: "power_bus_and_lora" };
    return getValue(mode_map, mode);
}

function readTemperatureUnit(type) {
    var unit_map = { 0: "celsius", 1: "fahrenheit" };
    return getValue(unit_map, type);
}

function readTargetTemperatureMode(type) {
    var mode_map = { 0: "single_point", 1: "dual_point" };
    return getValue(mode_map, type);
}

function readTargetTemperatureResolution(type) {
    var resolution_map = { 0: "0.5", 1: "1" };
    return getValue(resolution_map, type);
}

function readButtonFunction(type) {
    var function_map = { 0: "system_status", 1: "temperature_control_mode", 2: "fan_mode", 3: "plan_switch", 4: "status_report", 5: "release_filter_alarm", 6: "button_value", 7: "temperature_unit_switch" };
    return getValue(function_map, type);
}

function readDataSource(type) {
    var data_source_map = { 0: "embedded_data", 1: "external_receive" };
    return getValue(data_source_map, type);
}

function readTimeZone(time_zone) {
    var timezone_map = { "-720": "UTC-12", "-660": "UTC-11", "-600": "UTC-10", "-570": "UTC-9:30", "-540": "UTC-9", "-480": "UTC-8", "-420": "UTC-7", "-360": "UTC-6", "-300": "UTC-5", "-240": "UTC-4", "-210": "UTC-3:30", "-180": "UTC-3", "-120": "UTC-2", "-60": "UTC-1", 0: "UTC", 60: "UTC+1", 120: "UTC+2", 180: "UTC+3", 210: "UTC+3:30", 240: "UTC+4", 270: "UTC+4:30", 300: "UTC+5", 330: "UTC+5:30", 345: "UTC+5:45", 360: "UTC+6", 390: "UTC+6:30", 420: "UTC+7", 480: "UTC+8", 540: "UTC+9", 570: "UTC+9:30", 600: "UTC+10", 630: "UTC+10:30", 660: "UTC+11", 720: "UTC+12", 765: "UTC+12:45", 780: "UTC+13", 840: "UTC+14" };
    return getValue(timezone_map, time_zone);
}

function readAddressType(type) {
    var address_type_map = { 0: "public", 1: "random" };
    return getValue(address_type_map, type);
}

function readCommunicationMode(mode) {
    var mode_map = { 0: "ble", 1: "lora", 2: "ble_and_lora", 3: "power_bus_and_lora" };
    return getValue(mode_map, mode);
}

function readPIRDetectionMode(mode) {
    var mode_map = { 0: "single", 1: "multiple" };
    return getValue(mode_map, mode);
}

function readPlan(id) {
    var id_map = { 0: "plan_1", 1: "plan_2", 2: "plan_3", 3: "plan_4", 4: "plan_5", 5: "plan_6", 6: "plan_7", 7: "plan_8", 8: "plan_9", 9: "plan_10", 10: "plan_11", 11: "plan_12", 12: "plan_13", 13: "plan_14", 14: "plan_15", 15: "plan_16", 255: "none" };
    return getValue(id_map, id);
}

//
//
//
//
//
function readCmdResult(type) {
    var result_map = { 0: "success", 1: "parsing error", 2: "order error", 3: "password error", 4: "read params error", 5: "write params error", 6: "read execution error", 7: "write execution error", 8: "read apply error", 9: "write apply error", 10: "associative error" };
    return getValue(result_map, type);
}

function readCmdName(type) {
    var name_map = {
        56: { level: 1, name: "combine_command" },
        60: { level: 1, name: "collection_interval" },
        61: { level: 1, name: "reporting_interval" },
        62: { level: 1, name: "intelligent_display_enable" },
        63: { level: 1, name: "temperature_unit" },
        64: { level: 1, name: "temperature_control_mode_support" },
        65: { level: 1, name: "target_temperature_mode" },
        66: { level: 1, name: "target_temperature_resolution" },
        67: { level: 1, name: "system_status" },
        68: { level: 2, name: "temperature_control_mode" },
        69: { level: 2, name: "target_temperature_settings" },
        "6a": { level: 1, name: "dead_band" },
        "6b": { level: 2, name: "target_temperature_range" },
        71: { level: 2, name: "button_custom_function" },
        72: { level: 1, name: "child_lock_settings" },
        74: { level: 1, name: "fan_mode" },
        75: { level: 1, name: "screen_display_settings" },
        76: { level: 1, name: "temperature_calibration_settings" },
        77: { level: 1, name: "humidity_calibration_settings" },
        "7d": { level: 1, name: "data_sync_to_peer" },
        "7e": { level: 1, name: "data_sync_timeout" },
        80: { level: 1, name: "unlock_combination_button_settings" },
        81: { level: 1, name: "temporary_unlock_settings" },
        82: { level: 2, name: "pir_config" },
        85: { level: 1, name: "ble_enable" },
        86: { level: 1, name: "external_temperature" },
        87: { level: 1, name: "external_humidity" },
        88: { level: 1, name: "fan_support_mode" },
        "8b": { level: 1, name: "ble_name" },
        "8c": { level: 1, name: "ble_pair_info" },
        "8d": { level: 1, name: "communication_mode" },
        c6: { level: 1, name: "daylight_saving_time" },
        c7: { level: 1, name: "time_zone" },
    };

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

exports.decodeUplink = decodeUplink;

var __milesightDownlinkCodec = (function () {
// Downlink encoder taken verbatim from Milesight SensorDecoders (wt-series/wt401/wt401-encoder.js).
// Only this IIFE is Milesight's current encoder; the decoder above is unchanged.
/**
 * Payload Encoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product WT401
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
	//0xff
	if ('request_check_sequence_number' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xff);
		if (payload.request_check_sequence_number.sequence_number < 0 || payload.request_check_sequence_number.sequence_number > 255) {
			throw new Error('request_check_sequence_number.sequence_number must be between 0 and 255');
		}
		buffer.writeUInt8(payload.request_check_sequence_number.sequence_number);
		encoded = encoded.concat(buffer.toBytes());
	}
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
	if ('request_query_all_configurations' in payload) {
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
	//0xde
	if ('product_name' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xde);
		buffer.writeString(payload.product_name, 32);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xdd
	if ('product_pn' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xdd);
		buffer.writeString(payload.product_pn, 32);
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
	//0xd8
	if ('product_frequency_band' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xd8);
		buffer.writeString(payload.product_frequency_band, 16);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xd5
	if ('ble_phone_name' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xd5);
		if (payload.ble_phone_name.length < 1 || payload.ble_phone_name.length > 64) {
			throw new Error('ble_phone_name.length must be between 1 and 64');
		}
		buffer.writeUInt8(payload.ble_phone_name.length);
		buffer.writeString(payload.ble_phone_name.value, payload.ble_phone_name.length, true);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x00
	if ('battery' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x00);
		if (payload.battery < 0 || payload.battery > 100) {
			throw new Error('battery must be between 0 and 100');
		}
		buffer.writeUInt8(payload.battery);
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
	//0x08
	if ('pir_status' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x08);
		if (payload.pir_status < 0 || payload.pir_status > 2) {
			throw new Error('pir_status must be between 0 and 2');
		}
		// 0：Vacant, 1：Occupied, 2：Night Occupied
		buffer.writeUInt8(payload.pir_status);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x03
	if ('temperature_mode' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x03);
		// 0：heat, 1：em heat, 2：cool, 3：auto, 4：dehumidify, 5：ventilation, 10：off, 11：none
		buffer.writeUInt8(payload.temperature_mode);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x06
	if ('target_temperature1' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x06);
		if (payload.target_temperature1 < 5 || payload.target_temperature1 > 35) {
			throw new Error('target_temperature1 must be between 5 and 35');
		}
		buffer.writeInt16LE(payload.target_temperature1 * 100);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x07
	if ('target_temperature2' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x07);
		if (payload.target_temperature2 < 5 || payload.target_temperature2 > 35) {
			throw new Error('target_temperature2 must be between 5 and 35');
		}
		buffer.writeInt16LE(payload.target_temperature2 * 100);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x04
	if ('fan_mode' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x04);
		// 0：auto, 1：circulate, 2：on, 3：low, 4：medium, 5：high, 10：off, 11：none/keep
		buffer.writeUInt8(payload.fan_mode);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x05
	if ('execution_plan_id' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x05);
		if (payload.execution_plan_id < 0 || payload.execution_plan_id > 16) {
			throw new Error('execution_plan_id must be between 0 and 16');
		}
		// 0:plan0, 1:plan1, 2:plan2, 3:plan3, 4:plan4, 5:plan5, 6:plan6, 7:plan7, 8:plan8, 9:plan9, 10:plan10, 11:plan11, 12:plan12, 13:plan13, 14:plan14, 15:plan15, 255:Not executed
		buffer.writeUInt8(payload.execution_plan_id);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x0b
	if ('temperature_alarm' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x0b);
		buffer.writeUInt8(payload.temperature_alarm.type);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x0c
	if ('humidity_alarm' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x0c);
		buffer.writeUInt8(payload.humidity_alarm.type);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x09
	if ('ble_event' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x09);
		buffer.writeUInt8(payload.ble_event.type);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x0a
	if ('power_bus_event' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x0a);
		buffer.writeUInt8(payload.power_bus_event.type);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x0d
	if ('key_event' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x0d);
		buffer.writeUInt8(payload.key_event.type);
		if (payload.key_event.type == 0x00) {
		}
		if (payload.key_event.type == 0x01) {
		}
		if (payload.key_event.type == 0x02) {
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x0f
	if ('battery_event' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x0f);
		buffer.writeUInt8(payload.battery_event.type);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x60
	if ('collection_interval' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x60);
		// 0：second, 1：min
		buffer.writeUInt8(payload.collection_interval.unit);
		if (payload.collection_interval.unit == 0x00) {
			if (payload.collection_interval.seconds_of_time < 1 || payload.collection_interval.seconds_of_time > 3600) {
				throw new Error('collection_interval.seconds_of_time must be between 1 and 3600');
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
	//0x8d
	if ('communication_mode' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x8d);
		if (payload.communication_mode < 0 || payload.communication_mode > 3) {
			throw new Error('communication_mode must be between 0 and 3');
		}
		// 0：BLE, 1：LoRa, 2：BLE+LoRa, 3：PowerBus+LoRa
		buffer.writeUInt8(payload.communication_mode);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x61
	if ('reporting_interval' in payload) {
		var buffer = new Buffer();
		if (isValid(payload.reporting_interval.ble)) {
			buffer.writeUInt8(0x61);
			buffer.writeUInt8(0x00);
			// 0：second, 1：min
			buffer.writeUInt8(payload.reporting_interval.ble.unit);
			if (payload.reporting_interval.ble.unit == 0x00) {
				if (payload.reporting_interval.ble.seconds_of_time < 10 || payload.reporting_interval.ble.seconds_of_time > 64800) {
					throw new Error('reporting_interval.ble.seconds_of_time must be between 10 and 64800');
				}
				buffer.writeUInt16LE(payload.reporting_interval.ble.seconds_of_time);
			}
			if (payload.reporting_interval.ble.unit == 0x01) {
				if (payload.reporting_interval.ble.minutes_of_time < 1 || payload.reporting_interval.ble.minutes_of_time > 1440) {
					throw new Error('reporting_interval.ble.minutes_of_time must be between 1 and 1440');
				}
				buffer.writeUInt16LE(payload.reporting_interval.ble.minutes_of_time);
			}
		}
		if (isValid(payload.reporting_interval.lora)) {
			buffer.writeUInt8(0x61);
			buffer.writeUInt8(0x01);
			// 0：second, 1：min
			buffer.writeUInt8(payload.reporting_interval.lora.unit);
			if (payload.reporting_interval.lora.unit == 0x00) {
				if (payload.reporting_interval.lora.seconds_of_time < 10 || payload.reporting_interval.lora.seconds_of_time > 64800) {
					throw new Error('reporting_interval.lora.seconds_of_time must be between 10 and 64800');
				}
				buffer.writeUInt16LE(payload.reporting_interval.lora.seconds_of_time);
			}
			if (payload.reporting_interval.lora.unit == 0x01) {
				if (payload.reporting_interval.lora.minutes_of_time < 1 || payload.reporting_interval.lora.minutes_of_time > 1440) {
					throw new Error('reporting_interval.lora.minutes_of_time must be between 1 and 1440');
				}
				buffer.writeUInt16LE(payload.reporting_interval.lora.minutes_of_time);
			}
		}
		if (isValid(payload.reporting_interval.ble_lora)) {
			buffer.writeUInt8(0x61);
			buffer.writeUInt8(0x02);
			// 0：second, 1：min
			buffer.writeUInt8(payload.reporting_interval.ble_lora.unit);
			if (payload.reporting_interval.ble_lora.unit == 0x00) {
				if (payload.reporting_interval.ble_lora.seconds_of_time < 10 || payload.reporting_interval.ble_lora.seconds_of_time > 64800) {
					throw new Error('reporting_interval.ble_lora.seconds_of_time must be between 10 and 64800');
				}
				buffer.writeUInt16LE(payload.reporting_interval.ble_lora.seconds_of_time);
			}
			if (payload.reporting_interval.ble_lora.unit == 0x01) {
				if (payload.reporting_interval.ble_lora.minutes_of_time < 1 || payload.reporting_interval.ble_lora.minutes_of_time > 1440) {
					throw new Error('reporting_interval.ble_lora.minutes_of_time must be between 1 and 1440');
				}
				buffer.writeUInt16LE(payload.reporting_interval.ble_lora.minutes_of_time);
			}
		}
		if (isValid(payload.reporting_interval.power_lora)) {
			buffer.writeUInt8(0x61);
			buffer.writeUInt8(0x03);
			// 0：second, 1：min
			buffer.writeUInt8(payload.reporting_interval.power_lora.unit);
			if (payload.reporting_interval.power_lora.unit == 0x00) {
				if (payload.reporting_interval.power_lora.seconds_of_time < 10 || payload.reporting_interval.power_lora.seconds_of_time > 64800) {
					throw new Error('reporting_interval.power_lora.seconds_of_time must be between 10 and 64800');
				}
				buffer.writeUInt16LE(payload.reporting_interval.power_lora.seconds_of_time);
			}
			if (payload.reporting_interval.power_lora.unit == 0x01) {
				if (payload.reporting_interval.power_lora.minutes_of_time < 1 || payload.reporting_interval.power_lora.minutes_of_time > 1440) {
					throw new Error('reporting_interval.power_lora.minutes_of_time must be between 1 and 1440');
				}
				buffer.writeUInt16LE(payload.reporting_interval.power_lora.minutes_of_time);
			}
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x6c
	if ('communicate_interval' in payload) {
		var buffer = new Buffer();
		if (isValid(payload.communicate_interval.ble)) {
			buffer.writeUInt8(0x6c);
			buffer.writeUInt8(0x00);
			// 0：second, 1：min
			buffer.writeUInt8(payload.communicate_interval.ble.unit);
			if (payload.communicate_interval.ble.unit == 0x00) {
				if (payload.communicate_interval.ble.seconds_of_time < 10 || payload.communicate_interval.ble.seconds_of_time > 1800) {
					throw new Error('communicate_interval.ble.seconds_of_time must be between 10 and 1800');
				}
				buffer.writeUInt16LE(payload.communicate_interval.ble.seconds_of_time);
			}
			if (payload.communicate_interval.ble.unit == 0x01) {
				if (payload.communicate_interval.ble.minutes_of_time < 1 || payload.communicate_interval.ble.minutes_of_time > 30) {
					throw new Error('communicate_interval.ble.minutes_of_time must be between 1 and 30');
				}
				buffer.writeUInt16LE(payload.communicate_interval.ble.minutes_of_time);
			}
		}
		if (isValid(payload.communicate_interval.lora)) {
			buffer.writeUInt8(0x6c);
			buffer.writeUInt8(0x01);
			// 0：second, 1：min
			buffer.writeUInt8(payload.communicate_interval.lora.unit);
			if (payload.communicate_interval.lora.unit == 0x00) {
				if (payload.communicate_interval.lora.seconds_of_time < 10 || payload.communicate_interval.lora.seconds_of_time > 1800) {
					throw new Error('communicate_interval.lora.seconds_of_time must be between 10 and 1800');
				}
				buffer.writeUInt16LE(payload.communicate_interval.lora.seconds_of_time);
			}
			if (payload.communicate_interval.lora.unit == 0x01) {
				if (payload.communicate_interval.lora.minutes_of_time < 1 || payload.communicate_interval.lora.minutes_of_time > 30) {
					throw new Error('communicate_interval.lora.minutes_of_time must be between 1 and 30');
				}
				buffer.writeUInt16LE(payload.communicate_interval.lora.minutes_of_time);
			}
		}
		if (isValid(payload.communicate_interval.ble_lora)) {
			buffer.writeUInt8(0x6c);
			buffer.writeUInt8(0x02);
			// 0：second, 1：min
			buffer.writeUInt8(payload.communicate_interval.ble_lora.unit);
			if (payload.communicate_interval.ble_lora.unit == 0x00) {
				if (payload.communicate_interval.ble_lora.seconds_of_time < 10 || payload.communicate_interval.ble_lora.seconds_of_time > 1800) {
					throw new Error('communicate_interval.ble_lora.seconds_of_time must be between 10 and 1800');
				}
				buffer.writeUInt16LE(payload.communicate_interval.ble_lora.seconds_of_time);
			}
			if (payload.communicate_interval.ble_lora.unit == 0x01) {
				if (payload.communicate_interval.ble_lora.minutes_of_time < 1 || payload.communicate_interval.ble_lora.minutes_of_time > 30) {
					throw new Error('communicate_interval.ble_lora.minutes_of_time must be between 1 and 30');
				}
				buffer.writeUInt16LE(payload.communicate_interval.ble_lora.minutes_of_time);
			}
		}
		if (isValid(payload.communicate_interval.power_bus)) {
			buffer.writeUInt8(0x6c);
			buffer.writeUInt8(0x03);
			// 0：second, 1：min
			buffer.writeUInt8(payload.communicate_interval.power_bus.unit);
			if (payload.communicate_interval.power_bus.unit == 0x00) {
				if (payload.communicate_interval.power_bus.seconds_of_time < 10 || payload.communicate_interval.power_bus.seconds_of_time > 1800) {
					throw new Error('communicate_interval.power_bus.seconds_of_time must be between 10 and 1800');
				}
				buffer.writeUInt16LE(payload.communicate_interval.power_bus.seconds_of_time);
			}
			if (payload.communicate_interval.power_bus.unit == 0x01) {
				if (payload.communicate_interval.power_bus.minutes_of_time < 1 || payload.communicate_interval.power_bus.minutes_of_time > 30) {
					throw new Error('communicate_interval.power_bus.minutes_of_time must be between 1 and 30');
				}
				buffer.writeUInt16LE(payload.communicate_interval.power_bus.minutes_of_time);
			}
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xc8
	if ('device_status' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xc8);
		// 0：Power Off, 1：Power On
		buffer.writeUInt8(payload.device_status);
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
	//0x7d
	if ('data_sync_to_peer' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x7d);
		// 0:Embedded Data, 1:External Receive
		buffer.writeUInt8(payload.data_sync_to_peer);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x7e
	if ('data_sync_timeout' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x7e);
		if (payload.data_sync_timeout < 1 || payload.data_sync_timeout > 60) {
			throw new Error('data_sync_timeout must be between 1 and 60');
		}
		buffer.writeUInt8(payload.data_sync_timeout);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x85
	if ('ble_enable' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x85);
		// 0:disable, 1:enable
		buffer.writeUInt8(payload.ble_enable);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x8b
	if ('ble_name' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x8b);
		buffer.writeString(payload.ble_name, 32);
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
		var bitOptions = 0;
		// 0：disable, 1：enable
		bitOptions |= payload.mode_enable.heat << 0;

		// 0：disable, 1：enable
		bitOptions |= payload.mode_enable.em_heat << 1;

		// 0：disable, 1：enable
		bitOptions |= payload.mode_enable.cool << 2;

		// 0：disable, 1：enable
		bitOptions |= payload.mode_enable.auto << 3;

		bitOptions |= payload.mode_enable.reserved << 6;
		buffer.writeUInt8(bitOptions);

		encoded = encoded.concat(buffer.toBytes());
	}
	//0x88
	if ('fan_enable' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x88);
		var bitOptions = 0;
		// 0：disable, 1：enable
		bitOptions |= payload.fan_enable.auto << 0;

		// 0：disable, 1：enable
		bitOptions |= payload.fan_enable.circul << 1;

		// 0：disable, 1：enable
		bitOptions |= payload.fan_enable.on << 2;

		// 0：disable, 1：enable
		bitOptions |= payload.fan_enable.low << 3;

		// 0：disable, 1：enable
		bitOptions |= payload.fan_enable.medium << 4;

		// 0：disable, 1：enable
		bitOptions |= payload.fan_enable.high << 5;

		bitOptions |= payload.fan_enable.reserved << 6;
		buffer.writeUInt8(bitOptions);

		encoded = encoded.concat(buffer.toBytes());
	}
	//0x68
	if ('temperature_control_mode' in payload) {
		var buffer = new Buffer();
		if (isValid(payload.temperature_control_mode.mode)) {
			buffer.writeUInt8(0x68);
			// 0：heat, 1：em heat, 2：cool, 3：auto, 4：dehumidify, 5：ventilation
			buffer.writeUInt8(0x00);
			if (payload.temperature_control_mode.mode < 0 || payload.temperature_control_mode.mode > 5) {
				throw new Error('temperature_control_mode.mode must be between 0 and 5');
			}
			// 0：heat, 1：em heat, 2：cool, 3：auto, 4：dehumidify, 5：ventilation
			buffer.writeUInt8(payload.temperature_control_mode.mode);
		}
		if (isValid(payload.temperature_control_mode.plan_mode_enable)) {
			buffer.writeUInt8(0x68);
			// 0：disable, 1：enable
			buffer.writeUInt8(0x01);
			// 0：disable, 1：enable
			buffer.writeUInt8(payload.temperature_control_mode.plan_mode_enable);
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x65
	if ('target_temperature_mode' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x65);
		// 0：single, 1：dual
		buffer.writeUInt8(payload.target_temperature_mode);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x66
	if ('target_temperature_resolution' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x66);
		// 0：0.5, 1：1
		buffer.writeUInt8(payload.target_temperature_resolution);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x69
	if ('target_temperature_settings' in payload) {
		var buffer = new Buffer();
		if (isValid(payload.target_temperature_settings.heat)) {
			buffer.writeUInt8(0x69);
			buffer.writeUInt8(0x00);
			if (payload.target_temperature_settings.heat < 5 || payload.target_temperature_settings.heat > 35) {
				throw new Error('target_temperature_settings.heat must be between 5 and 35');
			}
			buffer.writeInt16LE(payload.target_temperature_settings.heat * 100);
		}
		if (isValid(payload.target_temperature_settings.em_heat)) {
			buffer.writeUInt8(0x69);
			buffer.writeUInt8(0x01);
			if (payload.target_temperature_settings.em_heat < 5 || payload.target_temperature_settings.em_heat > 35) {
				throw new Error('target_temperature_settings.em_heat must be between 5 and 35');
			}
			buffer.writeInt16LE(payload.target_temperature_settings.em_heat * 100);
		}
		if (isValid(payload.target_temperature_settings.cool)) {
			buffer.writeUInt8(0x69);
			buffer.writeUInt8(0x02);
			if (payload.target_temperature_settings.cool < 5 || payload.target_temperature_settings.cool > 35) {
				throw new Error('target_temperature_settings.cool must be between 5 and 35');
			}
			buffer.writeInt16LE(payload.target_temperature_settings.cool * 100);
		}
		if (isValid(payload.target_temperature_settings.auto)) {
			buffer.writeUInt8(0x69);
			buffer.writeUInt8(0x03);
			if (payload.target_temperature_settings.auto < 5 || payload.target_temperature_settings.auto > 35) {
				throw new Error('target_temperature_settings.auto must be between 5 and 35');
			}
			buffer.writeInt16LE(payload.target_temperature_settings.auto * 100);
		}
		if (isValid(payload.target_temperature_settings.auto_heat)) {
			buffer.writeUInt8(0x69);
			buffer.writeUInt8(0x04);
			if (payload.target_temperature_settings.auto_heat < 5 || payload.target_temperature_settings.auto_heat > 35) {
				throw new Error('target_temperature_settings.auto_heat must be between 5 and 35');
			}
			buffer.writeInt16LE(payload.target_temperature_settings.auto_heat * 100);
		}
		if (isValid(payload.target_temperature_settings.auto_cool)) {
			buffer.writeUInt8(0x69);
			buffer.writeUInt8(0x05);
			if (payload.target_temperature_settings.auto_cool < 5 || payload.target_temperature_settings.auto_cool > 35) {
				throw new Error('target_temperature_settings.auto_cool must be between 5 and 35');
			}
			buffer.writeInt16LE(payload.target_temperature_settings.auto_cool * 100);
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x6a
	if ('minimum_dead_zone' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x6a);
		if (payload.minimum_dead_zone < 1 || payload.minimum_dead_zone > 30) {
			throw new Error('minimum_dead_zone must be between 1 and 30');
		}
		buffer.writeUInt16LE(payload.minimum_dead_zone * 100);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x6b
	if ('target_temperature_range' in payload) {
		var buffer = new Buffer();
		if (isValid(payload.target_temperature_range.heat)) {
			buffer.writeUInt8(0x6b);
			buffer.writeUInt8(0x00);
			if (payload.target_temperature_range.heat.min < 5 || payload.target_temperature_range.heat.min > 35) {
				throw new Error('target_temperature_range.heat.min must be between 5 and 35');
			}
			buffer.writeInt16LE(payload.target_temperature_range.heat.min * 100);
			if (payload.target_temperature_range.heat.max < 5 || payload.target_temperature_range.heat.max > 35) {
				throw new Error('target_temperature_range.heat.max must be between 5 and 35');
			}
			buffer.writeInt16LE(payload.target_temperature_range.heat.max * 100);
		}
		if (isValid(payload.target_temperature_range.em_heat)) {
			buffer.writeUInt8(0x6b);
			buffer.writeUInt8(0x01);
			if (payload.target_temperature_range.em_heat.min < 5 || payload.target_temperature_range.em_heat.min > 35) {
				throw new Error('target_temperature_range.em_heat.min must be between 5 and 35');
			}
			buffer.writeInt16LE(payload.target_temperature_range.em_heat.min * 100);
			if (payload.target_temperature_range.em_heat.max < 5 || payload.target_temperature_range.em_heat.max > 35) {
				throw new Error('target_temperature_range.em_heat.max must be between 5 and 35');
			}
			buffer.writeInt16LE(payload.target_temperature_range.em_heat.max * 100);
		}
		if (isValid(payload.target_temperature_range.cool)) {
			buffer.writeUInt8(0x6b);
			buffer.writeUInt8(0x02);
			if (payload.target_temperature_range.cool.min < 5 || payload.target_temperature_range.cool.min > 35) {
				throw new Error('target_temperature_range.cool.min must be between 5 and 35');
			}
			buffer.writeInt16LE(payload.target_temperature_range.cool.min * 100);
			if (payload.target_temperature_range.cool.max < 5 || payload.target_temperature_range.cool.max > 35) {
				throw new Error('target_temperature_range.cool.max must be between 5 and 35');
			}
			buffer.writeInt16LE(payload.target_temperature_range.cool.max * 100);
		}
		if (isValid(payload.target_temperature_range.auto)) {
			buffer.writeUInt8(0x6b);
			buffer.writeUInt8(0x03);
			if (payload.target_temperature_range.auto.min < 5 || payload.target_temperature_range.auto.min > 35) {
				throw new Error('target_temperature_range.auto.min must be between 5 and 35');
			}
			buffer.writeInt16LE(payload.target_temperature_range.auto.min * 100);
			if (payload.target_temperature_range.auto.max < 5 || payload.target_temperature_range.auto.max > 35) {
				throw new Error('target_temperature_range.auto.max must be between 5 and 35');
			}
			buffer.writeInt16LE(payload.target_temperature_range.auto.max * 100);
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x74
	if ('fan_control_mode' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x74);
		if (payload.fan_control_mode < 0 || payload.fan_control_mode > 5) {
			throw new Error('fan_control_mode must be between 0 and 5');
		}
		// 0：auto, 1：circulate, 2：on, 3：low, 4：medium, 5：high
		buffer.writeUInt8(payload.fan_control_mode);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x82
	if ('pir_common' in payload) {
		var buffer = new Buffer();
		if (isValid(payload.pir_common.enable)) {
			buffer.writeUInt8(0x82);
			// 0:disable, 1:enable
			buffer.writeUInt8(0x01);
			if (payload.pir_common.enable < 0 || payload.pir_common.enable > 1) {
				throw new Error('pir_common.enable must be between 0 and 1');
			}
			// 0:disable, 1:enable
			buffer.writeUInt8(payload.pir_common.enable);
		}
		if (isValid(payload.pir_common.release_time)) {
			buffer.writeUInt8(0x82);
			buffer.writeUInt8(0x02);
			if (payload.pir_common.release_time < 1 || payload.pir_common.release_time > 360) {
				throw new Error('pir_common.release_time must be between 1 and 360');
			}
			buffer.writeUInt16LE(payload.pir_common.release_time);
		}
		if (isValid(payload.pir_common.mode)) {
			buffer.writeUInt8(0x82);
			// 0:Immediate Trigger, 1:Rule Trigger
			buffer.writeUInt8(0x03);
			// 0:Immediate Trigger, 1:Rule Trigger
			buffer.writeUInt8(payload.pir_common.mode);
		}
		if (isValid(payload.pir_common.check)) {
			buffer.writeUInt8(0x82);
			buffer.writeUInt8(0x04);
			if (payload.pir_common.check.period < 1 || payload.pir_common.check.period > 60) {
				throw new Error('pir_common.check.period must be between 1 and 60');
			}
			buffer.writeUInt8(payload.pir_common.check.period);
			if (payload.pir_common.check.rate < 1 || payload.pir_common.check.rate > 100) {
				throw new Error('pir_common.check.rate must be between 1 and 100');
			}
			buffer.writeUInt8(payload.pir_common.check.rate);
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x83
	if ('pir_energy' in payload) {
		var buffer = new Buffer();
		if (isValid(payload.pir_energy.enable)) {
			buffer.writeUInt8(0x83);
			// 0:disable, 1:enable
			buffer.writeUInt8(0x01);
			if (payload.pir_energy.enable < 0 || payload.pir_energy.enable > 1) {
				throw new Error('pir_energy.enable must be between 0 and 1');
			}
			// 0:disable, 1:enable
			buffer.writeUInt8(payload.pir_energy.enable);
		}
		if (isValid(payload.pir_energy.plan)) {
			buffer.writeUInt8(0x83);
			buffer.writeUInt8(0x02);
			if (payload.pir_energy.plan.occupied < 0 || payload.pir_energy.plan.occupied > 255) {
				throw new Error('pir_energy.plan.occupied must be between 0 and 255');
			}
			// 0:plan0, 1:plan1, 2:plan2, 3:plan3, 4:plan4, 5:plan5, 6:plan6, 7:plan7, 255:Not executed
			buffer.writeUInt8(payload.pir_energy.plan.occupied);
			if (payload.pir_energy.plan.unoccupied < 0 || payload.pir_energy.plan.unoccupied > 255) {
				throw new Error('pir_energy.plan.unoccupied must be between 0 and 255');
			}
			// 0:plan0, 1:plan1, 2:plan2, 3:plan3, 4:plan4, 5:plan5, 6:plan6, 7:plan7, 255:Not executed
			buffer.writeUInt8(payload.pir_energy.plan.unoccupied);
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x84
	if ('pir_night' in payload) {
		var buffer = new Buffer();
		if (isValid(payload.pir_night.enable)) {
			buffer.writeUInt8(0x84);
			// 0:disable, 1:enable
			buffer.writeUInt8(0x01);
			if (payload.pir_night.enable < 0 || payload.pir_night.enable > 1) {
				throw new Error('pir_night.enable must be between 0 and 1');
			}
			// 0:disable, 1:enable
			buffer.writeUInt8(payload.pir_night.enable);
		}
		if (isValid(payload.pir_night.night_time)) {
			buffer.writeUInt8(0x84);
			buffer.writeUInt8(0x04);
			if (payload.pir_night.night_time.start < 0 || payload.pir_night.night_time.start > 1439) {
				throw new Error('pir_night.night_time.start must be between 0 and 1439');
			}
			buffer.writeUInt16LE(payload.pir_night.night_time.start);
			if (payload.pir_night.night_time.stop < 0 || payload.pir_night.night_time.stop > 1439) {
				throw new Error('pir_night.night_time.stop must be between 0 and 1439');
			}
			buffer.writeUInt16LE(payload.pir_night.night_time.stop);
		}
		if (isValid(payload.pir_night.occupied)) {
			buffer.writeUInt8(0x84);
			// 0:plan0, 1:plan1, 2:plan2, 3:plan3, 4:plan4, 5:plan5, 6:plan6, 7:plan7, 255:Not executed
			buffer.writeUInt8(0x05);
			if (payload.pir_night.occupied < 0 || payload.pir_night.occupied > 255) {
				throw new Error('pir_night.occupied must be between 0 and 255');
			}
			// 0:plan0, 1:plan1, 2:plan2, 3:plan3, 4:plan4, 5:plan5, 6:plan6, 7:plan7, 255:Not executed
			buffer.writeUInt8(payload.pir_night.occupied);
		}
		if (isValid(payload.pir_night.mode)) {
			buffer.writeUInt8(0x84);
			// 0:Immediate Trigger, 1:Rule Trigger
			buffer.writeUInt8(0x02);
			// 0:Immediate Trigger, 1:Rule Trigger
			buffer.writeUInt8(payload.pir_night.mode);
		}
		if (isValid(payload.pir_night.check)) {
			buffer.writeUInt8(0x84);
			buffer.writeUInt8(0x03);
			if (payload.pir_night.check.period < 1 || payload.pir_night.check.period > 60) {
				throw new Error('pir_night.check.period must be between 1 and 60');
			}
			buffer.writeUInt8(payload.pir_night.check.period);
			if (payload.pir_night.check.rate < 1 || payload.pir_night.check.rate > 100) {
				throw new Error('pir_night.check.rate must be between 1 and 100');
			}
			buffer.writeUInt8(payload.pir_night.check.rate);
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x75
	if ('screen_display_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x75);
		var bitOptions = 0;
		// 0:disable, 1:enable
		bitOptions |= payload.screen_display_settings.plan_name << 0;

		// 0:disable, 1:enable
		bitOptions |= payload.screen_display_settings.ambient_temp << 1;

		// 0:disable, 1:enable
		bitOptions |= payload.screen_display_settings.ambient_humi << 2;

		// 0:disable, 1:enable
		bitOptions |= payload.screen_display_settings.target_temp << 3;

		bitOptions |= payload.screen_display_settings.reserved << 4;
		buffer.writeUInt8(bitOptions);

		encoded = encoded.concat(buffer.toBytes());
	}
	//0x71
	if ('button_custom_function' in payload) {
		var buffer = new Buffer();
		if (isValid(payload.button_custom_function.enable)) {
			buffer.writeUInt8(0x71);
			// 0：disable, 1：enable
			buffer.writeUInt8(0x00);
			buffer.writeInt8(payload.button_custom_function.enable);
		}
		if (isValid(payload.button_custom_function.mode1)) {
			buffer.writeUInt8(0x71);
			// 1：Temperature Control Mode, 2：Fan Mode, 3：Schedule Switch, 4：Status Report, 5：Filter Cleaning Reset, 6：Button Event1, 7：Temperature Unit Switch
			buffer.writeUInt8(0x01);
			// 1：Temperature Control Mode, 2：Fan Mode, 3：Schedule Switch, 4：Status Report, 5：Filter Cleaning Reset, 6：Button Event1, 7：Temperature Unit Switch
			buffer.writeUInt8(payload.button_custom_function.mode1);
		}
		if (isValid(payload.button_custom_function.mode2)) {
			buffer.writeUInt8(0x71);
			// 1：Temperature Control Mode, 2：Fan Mode, 3：Schedule Switch, 4：Status Report, 5：Filter Cleaning Reset, 6：Button Event2, 7：Temperature Unit Switch
			buffer.writeUInt8(0x02);
			// 1：Temperature Control Mode, 2：Fan Mode, 3：Schedule Switch, 4：Status Report, 5：Filter Cleaning Reset, 6：Button Event2, 7：Temperature Unit Switch
			buffer.writeUInt8(payload.button_custom_function.mode2);
		}
		if (isValid(payload.button_custom_function.mode3)) {
			buffer.writeUInt8(0x71);
			// 0：System On/Off, 3：Schedule Switch, 4：Status Report, 5：Filter Cleaning Reset, 6：Button Event3, 7：Temperature Unit Switch
			buffer.writeUInt8(0x03);
			// 0：System On/Off, 3：Schedule Switch, 4：Status Report, 5：Filter Cleaning Reset, 6：Button Event3, 7：Temperature Unit Switch
			buffer.writeUInt8(payload.button_custom_function.mode3);
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x72
	if ('children_lock_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x72);
		// 0:disable, 1:enable
		buffer.writeUInt8(payload.children_lock_settings.enable);
		var bitOptions = 0;
		bitOptions |= payload.children_lock_settings.temp_up << 0;

		bitOptions |= payload.children_lock_settings.temp_down << 1;

		bitOptions |= payload.children_lock_settings.system_on_off << 2;

		bitOptions |= payload.children_lock_settings.fan_mode << 3;

		bitOptions |= payload.children_lock_settings.temperature_control_mode << 4;

		bitOptions |= payload.children_lock_settings.reboot_reset << 5;

		bitOptions |= payload.children_lock_settings.power_on_off << 6;

		bitOptions |= payload.children_lock_settings.cancel_pair << 7;

		bitOptions |= payload.children_lock_settings.plan_switch << 8;

		bitOptions |= payload.children_lock_settings.status_report << 9;

		bitOptions |= payload.children_lock_settings.filter_clean_alarm_release << 10;

		bitOptions |= payload.children_lock_settings.button1_event << 11;

		bitOptions |= payload.children_lock_settings.button2_event << 12;

		bitOptions |= payload.children_lock_settings.button3_event << 13;

		bitOptions |= payload.children_lock_settings.temperature_unit_switch << 14;

		bitOptions |= payload.children_lock_settings.reserved << 15;
		buffer.writeUInt16LE(bitOptions);

		encoded = encoded.concat(buffer.toBytes());
	}
	//0x81
	if ('unlock_button' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x81);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.unlock_button.enable);
		if (payload.unlock_button.timeout < 1 || payload.unlock_button.timeout > 3600) {
			throw new Error('unlock_button.timeout must be between 1 and 3600');
		}
		buffer.writeUInt16LE(payload.unlock_button.timeout);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x80
	if ('unlock_combination_button_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x80);
		var bitOptions = 0;
		// 0：disable, 1：enable
		bitOptions |= payload.unlock_combination_button_settings.button1 << 0;

		// 0：disable, 1：enable
		bitOptions |= payload.unlock_combination_button_settings.button2 << 1;

		// 0：disable, 1：enable
		bitOptions |= payload.unlock_combination_button_settings.button3 << 2;

		// 0：disable, 1：enable
		bitOptions |= payload.unlock_combination_button_settings.button4 << 3;

		// 0：disable, 1：enable
		bitOptions |= payload.unlock_combination_button_settings.button5 << 4;

		bitOptions |= payload.unlock_combination_button_settings.reserved << 5;
		buffer.writeUInt8(bitOptions);

		encoded = encoded.concat(buffer.toBytes());
	}
	//0x62
	if ('intelligent_display_enable' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x62);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.intelligent_display_enable);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xc7
	if ('time_zone' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xc7);
		if (payload.time_zone < -720 || payload.time_zone > 840) {
			throw new Error('time_zone must be between -720 and 840');
		}
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
		if (payload.daylight_saving_time.start_month < 1 || payload.daylight_saving_time.start_month > 12) {
			throw new Error('daylight_saving_time.start_month must be between 1 and 12');
		}
		// 1:Jan., 2:Feb., 3:Mar., 4:Apr., 5:May, 6:Jun., 7:Jul., 8:Aug., 9:Sep., 10:Oct., 11:Nov., 12:Dec.
		buffer.writeUInt8(payload.daylight_saving_time.start_month);
		var bitOptions = 0;
		// 1:1st, 2: 2nd, 3: 3rd, 4: 4th, 5: last
		bitOptions |= payload.daylight_saving_time.start_week_num << 4;

		// 1：Mon., 2：Tues., 3：Wed., 4：Thurs., 5：Fri., 6：Sat., 7：Sun.
		bitOptions |= payload.daylight_saving_time.start_week_day << 0;
		buffer.writeUInt8(bitOptions);

		if (payload.daylight_saving_time.start_hour_min < 0 || payload.daylight_saving_time.start_hour_min > 1380) {
			throw new Error('daylight_saving_time.start_hour_min must be between 0 and 1380');
		}
		buffer.writeUInt16LE(payload.daylight_saving_time.start_hour_min);
		if (payload.daylight_saving_time.end_month < 1 || payload.daylight_saving_time.end_month > 12) {
			throw new Error('daylight_saving_time.end_month must be between 1 and 12');
		}
		// 1:Jan., 2:Feb., 3:Mar., 4:Apr., 5:May, 6:Jun., 7:Jul., 8:Aug., 9:Sep., 10:Oct., 11:Nov., 12:Dec.
		buffer.writeUInt8(payload.daylight_saving_time.end_month);
		var bitOptions = 0;
		// 1:1st, 2: 2nd, 3: 3rd, 4: 4th, 5: last
		bitOptions |= payload.daylight_saving_time.end_week_num << 4;

		// 1：Mon., 2：Tues., 3：Wed., 4：Thurs., 5：Fri., 6：Sat., 7：Sun.
		bitOptions |= payload.daylight_saving_time.end_week_day << 0;
		buffer.writeUInt8(bitOptions);

		if (payload.daylight_saving_time.end_hour_min < 0 || payload.daylight_saving_time.end_hour_min > 1380) {
			throw new Error('daylight_saving_time.end_hour_min must be between 0 and 1380');
		}
		buffer.writeUInt16LE(payload.daylight_saving_time.end_hour_min);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x76
	if ('temperature_calibration_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x76);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.temperature_calibration_settings.enable);
		if (payload.temperature_calibration_settings.calibration_value < -80 || payload.temperature_calibration_settings.calibration_value > 80) {
			throw new Error('temperature_calibration_settings.calibration_value must be between -80 and 80');
		}
		buffer.writeInt16LE(payload.temperature_calibration_settings.calibration_value * 100);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x77
	if ('humidity_calibration_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x77);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.humidity_calibration_settings.enable);
		if (payload.humidity_calibration_settings.calibration_value < -100 || payload.humidity_calibration_settings.calibration_value > 100) {
			throw new Error('humidity_calibration_settings.calibration_value must be between -100 and 100');
		}
		buffer.writeInt16LE(payload.humidity_calibration_settings.calibration_value * 10);
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
			if (isValid(schedule_settings_item.content1)) {
				buffer.writeUInt8(0x7b);
				buffer.writeUInt8(schedule_settings_item_id);
				buffer.writeUInt8(0x03);
				if (schedule_settings_item.content1.tstat_mode < 0 || schedule_settings_item.content1.tstat_mode > 255) {
					throw new Error('content1.tstat_mode must be between 0 and 255');
				}
				// 0：heat, 1：em heat, 2：cool, 3：auto, 10：off
				buffer.writeUInt8(schedule_settings_item.content1.tstat_mode);
				if (schedule_settings_item.content1.heat_target_temperature < 5 || schedule_settings_item.content1.heat_target_temperature > 35) {
					throw new Error('content1.heat_target_temperature must be between 5 and 35');
				}
				buffer.writeInt16LE(schedule_settings_item.content1.heat_target_temperature * 100);
				if (schedule_settings_item.content1.em_heat_target_temperature < 5 || schedule_settings_item.content1.em_heat_target_temperature > 35) {
					throw new Error('content1.em_heat_target_temperature must be between 5 and 35');
				}
				buffer.writeInt16LE(schedule_settings_item.content1.em_heat_target_temperature * 100);
				if (schedule_settings_item.content1.cool_target_temperature < 5 || schedule_settings_item.content1.cool_target_temperature > 35) {
					throw new Error('content1.cool_target_temperature must be between 5 and 35');
				}
				buffer.writeInt16LE(schedule_settings_item.content1.cool_target_temperature * 100);
			}
			if (isValid(schedule_settings_item.content2)) {
				buffer.writeUInt8(0x7b);
				buffer.writeUInt8(schedule_settings_item_id);
				buffer.writeUInt8(0x04);
				if (schedule_settings_item.content2.fan_mode < 0 || schedule_settings_item.content2.fan_mode > 255) {
					throw new Error('content2.fan_mode must be between 0 and 255');
				}
				// 0：auto, 1：circulate, 2：on, 3：low, 4：medium, 5：high, 10：off
				buffer.writeUInt8(schedule_settings_item.content2.fan_mode);
				if (schedule_settings_item.content2.auto_target_temperature < 5 || schedule_settings_item.content2.auto_target_temperature > 35) {
					throw new Error('content2.auto_target_temperature must be between 5 and 35');
				}
				buffer.writeInt16LE(schedule_settings_item.content2.auto_target_temperature * 100);
				if (schedule_settings_item.content2.auto_heat_target_temperature < 5 || schedule_settings_item.content2.auto_heat_target_temperature > 35) {
					throw new Error('content2.auto_heat_target_temperature must be between 5 and 35');
				}
				buffer.writeInt16LE(schedule_settings_item.content2.auto_heat_target_temperature * 100);
				if (schedule_settings_item.content2.auto_cool_target_temperature < 5 || schedule_settings_item.content2.auto_cool_target_temperature > 35) {
					throw new Error('content2.auto_cool_target_temperature must be between 5 and 35');
				}
				buffer.writeInt16LE(schedule_settings_item.content2.auto_cool_target_temperature * 100);
			}
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x59
	if ('system_status_control' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x59);
		// 0：system close, 1：system open
		buffer.writeUInt8(payload.system_status_control.on_off);
		if (payload.system_status_control.mode < 0 || payload.system_status_control.mode > 5) {
			throw new Error('system_status_control.mode must be between 0 and 5');
		}
		// 0：heat, 1：em heat, 2：cool, 3：auto, 4：dehumidify, 5：ventilation
		buffer.writeUInt8(payload.system_status_control.mode);
		if (payload.system_status_control.temperature1 < 5 || payload.system_status_control.temperature1 > 35) {
			throw new Error('system_status_control.temperature1 must be between 5 and 35');
		}
		buffer.writeInt16LE(payload.system_status_control.temperature1 * 100);
		buffer.writeInt16LE(payload.system_status_control.temperature2 * 100);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x86
	if ('origin_temperature' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x86);
		if (payload.origin_temperature < -20 || payload.origin_temperature > 60) {
			throw new Error('origin_temperature must be between -20 and 60');
		}
		buffer.writeInt16LE(payload.origin_temperature * 100);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x87
	if ('origin_humidity' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x87);
		if (payload.origin_humidity < 0 || payload.origin_humidity > 100) {
			throw new Error('origin_humidity must be between 0 and 100');
		}
		buffer.writeUInt16LE(payload.origin_humidity * 10);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x5c
	if ('insert_temporary_plan' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x5c);
		if (payload.insert_temporary_plan.id < 0 || payload.insert_temporary_plan.id > 15) {
			throw new Error('insert_temporary_plan.id must be between 0 and 15');
		}
		buffer.writeUInt8(payload.insert_temporary_plan.id);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x55
	if ('fan_error_alarm' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x55);
		// 0：clean alarm, 1：trigger alarm
		buffer.writeUInt8(payload.fan_error_alarm.mode);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x5b
	if ('filter_clean_alarm' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x5b);
		// 0：clean alarm, 1：report alarm
		buffer.writeUInt8(payload.filter_clean_alarm.mode);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x57
	if ('frost_protection_alarm' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x57);
		// 0：clean alarm, 1：trigger alarm
		buffer.writeUInt8(payload.frost_protection_alarm.mode);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x5a
	if ('open_window_alarm' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x5a);
		// 0：clean alarm, 1：report alarm
		buffer.writeUInt8(payload.open_window_alarm.mode);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x58
	if ('not_wired_alarm' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x58);
		// 0：clean alarm, 1：trigger alarm
		buffer.writeUInt8(payload.not_wired_alarm.mode);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xbe
	if ('reboot' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xbe);
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
	//0xb6
	if ('reconnect' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xb6);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x5f
	if ('delete_task_plan' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x5f);
		if (payload.delete_task_plan.type < 0 || payload.delete_task_plan.type > 255) {
			throw new Error('delete_task_plan.type must be between 0 and 255');
		}
		// 0：Schedule1, 1：Schedule2, 2：Schedule3, 3：Schedule4, 4：Schedule5, 5：Schedule6, 6：Schedule7, 7：Schedule8, 255：Reset All
		buffer.writeUInt8(payload.delete_task_plan.type);
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
		  "request_check_sequence_number": "ff",
		  "request_check_order": "fe",
		  "request_command_queries": "ef",
		  "request_query_all_configurations": "ee",
		  "lorawan_configuration_settings": "cf",
		  "lorawan_configuration_settings.mode": "cf00",
		  "tsl_version": "df",
		  "product_name": "de",
		  "product_pn": "dd",
		  "product_sn": "db",
		  "version": "da",
		  "oem_id": "d9",
		  "product_frequency_band": "d8",
		  "ble_phone_name": "d5",
		  "battery": "00",
		  "temperature": "01",
		  "humidity": "02",
		  "pir_status": "08",
		  "temperature_mode": "03",
		  "target_temperature1": "06",
		  "target_temperature2": "07",
		  "fan_mode": "04",
		  "execution_plan_id": "05",
		  "temperature_alarm": "0b",
		  "humidity_alarm": "0c",
		  "ble_event": "09",
		  "power_bus_event": "0a",
		  "key_event": "0d",
		  "key_event.f1": "0d00",
		  "key_event.f2": "0d01",
		  "key_event.f3": "0d02",
		  "battery_event": "0f",
		  "collection_interval": "60",
		  "collection_interval.seconds_of_time": "6000",
		  "collection_interval.minutes_of_time": "6001",
		  "communication_mode": "8d",
		  "reporting_interval": "61",
		  "reporting_interval.ble": "6100",
		  "reporting_interval.ble.seconds_of_time": "610000",
		  "reporting_interval.ble.minutes_of_time": "610001",
		  "reporting_interval.lora": "6101",
		  "reporting_interval.lora.seconds_of_time": "610100",
		  "reporting_interval.lora.minutes_of_time": "610101",
		  "reporting_interval.ble_lora": "6102",
		  "reporting_interval.ble_lora.seconds_of_time": "610200",
		  "reporting_interval.ble_lora.minutes_of_time": "610201",
		  "reporting_interval.power_lora": "6103",
		  "reporting_interval.power_lora.seconds_of_time": "610300",
		  "reporting_interval.power_lora.minutes_of_time": "610301",
		  "communicate_interval": "6c",
		  "communicate_interval.ble": "6c00",
		  "communicate_interval.ble.seconds_of_time": "6c0000",
		  "communicate_interval.ble.minutes_of_time": "6c0001",
		  "communicate_interval.lora": "6c01",
		  "communicate_interval.lora.seconds_of_time": "6c0100",
		  "communicate_interval.lora.minutes_of_time": "6c0101",
		  "communicate_interval.ble_lora": "6c02",
		  "communicate_interval.ble_lora.seconds_of_time": "6c0200",
		  "communicate_interval.ble_lora.minutes_of_time": "6c0201",
		  "communicate_interval.power_bus": "6c03",
		  "communicate_interval.power_bus.seconds_of_time": "6c0300",
		  "communicate_interval.power_bus.minutes_of_time": "6c0301",
		  "device_status": "c8",
		  "temperature_unit": "63",
		  "data_sync_to_peer": "7d",
		  "data_sync_timeout": "7e",
		  "ble_enable": "85",
		  "ble_name": "8b",
		  "system_status": "67",
		  "mode_enable": "64",
		  "fan_enable": "88",
		  "temperature_control_mode": "68",
		  "temperature_control_mode.mode": "6800",
		  "temperature_control_mode.plan_mode_enable": "6801",
		  "target_temperature_mode": "65",
		  "target_temperature_resolution": "66",
		  "target_temperature_settings": "69",
		  "target_temperature_settings.heat": "6900",
		  "target_temperature_settings.em_heat": "6901",
		  "target_temperature_settings.cool": "6902",
		  "target_temperature_settings.auto": "6903",
		  "target_temperature_settings.auto_heat": "6904",
		  "target_temperature_settings.auto_cool": "6905",
		  "minimum_dead_zone": "6a",
		  "target_temperature_range": "6b",
		  "target_temperature_range.heat": "6b00",
		  "target_temperature_range.em_heat": "6b01",
		  "target_temperature_range.cool": "6b02",
		  "target_temperature_range.auto": "6b03",
		  "fan_control_mode": "74",
		  "pir_common": "82",
		  "pir_common.enable": "8201",
		  "pir_common.release_time": "8202",
		  "pir_common.mode": "8203",
		  "pir_common.check": "8204",
		  "pir_energy": "83",
		  "pir_energy.enable": "8301",
		  "pir_energy.plan": "8302",
		  "pir_night": "84",
		  "pir_night.enable": "8401",
		  "pir_night.night_time": "8404",
		  "pir_night.occupied": "8405",
		  "pir_night.mode": "8402",
		  "pir_night.check": "8403",
		  "screen_display_settings": "75",
		  "button_custom_function": "71",
		  "button_custom_function.enable": "7100",
		  "button_custom_function.mode1": "7101",
		  "button_custom_function.mode2": "7102",
		  "button_custom_function.mode3": "7103",
		  "children_lock_settings": "72",
		  "unlock_button": "81",
		  "unlock_combination_button_settings": "80",
		  "intelligent_display_enable": "62",
		  "time_zone": "c7",
		  "daylight_saving_time": "c6",
		  "temperature_calibration_settings": "76",
		  "humidity_calibration_settings": "77",
		  "schedule_settings": "7b",
		  "schedule_settings._item": "7bxx",
		  "schedule_settings._item.enable": "7bxx00",
		  "schedule_settings._item.name_first": "7bxx01",
		  "schedule_settings._item.name_last": "7bxx02",
		  "schedule_settings._item.content1": "7bxx03",
		  "schedule_settings._item.content2": "7bxx04",
		  "system_status_control": "59",
		  "origin_temperature": "86",
		  "origin_humidity": "87",
		  "insert_temporary_plan": "5c",
		  "fan_error_alarm": "55",
		  "filter_clean_alarm": "5b",
		  "frost_protection_alarm": "57",
		  "open_window_alarm": "5a",
		  "not_wired_alarm": "58",
		  "reboot": "be",
		  "query_device_status": "b9",
		  "synchronize_time": "b8",
		  "reconnect": "b6",
		  "delete_task_plan": "5f"
	};
}
function processTemperature(payload) {
	var allTemperatureProperties = {
    "temperature": {
        "coefficient": 0.01
    },
    "target_temperature1": {
        "coefficient": 0.01
    },
    "target_temperature2": {
        "coefficient": 0.01
    },
    "target_temperature_settings.heat": {
        "coefficient": 0.01
    },
    "target_temperature_settings.em_heat": {
        "coefficient": 0.01
    },
    "target_temperature_settings.cool": {
        "coefficient": 0.01
    },
    "target_temperature_settings.auto": {
        "coefficient": 0.01
    },
    "target_temperature_settings.auto_heat": {
        "coefficient": 0.01
    },
    "target_temperature_settings.auto_cool": {
        "coefficient": 0.01
    },
    "minimum_dead_zone": {
        "coefficient": 0.01
    },
    "target_temperature_range.heat.min": {
        "coefficient": 0.01
    },
    "target_temperature_range.heat.max": {
        "coefficient": 0.01
    },
    "target_temperature_range.em_heat.min": {
        "coefficient": 0.01
    },
    "target_temperature_range.em_heat.max": {
        "coefficient": 0.01
    },
    "target_temperature_range.cool.min": {
        "coefficient": 0.01
    },
    "target_temperature_range.cool.max": {
        "coefficient": 0.01
    },
    "target_temperature_range.auto.min": {
        "coefficient": 0.01
    },
    "target_temperature_range.auto.max": {
        "coefficient": 0.01
    },
    "temperature_calibration_settings.calibration_value": {
        "coefficient": 0.01
    },
    "schedule_settings._item.content1.heat_target_temperature": {
        "coefficient": 0.01
    },
    "schedule_settings._item.content1.em_heat_target_temperature": {
        "coefficient": 0.01
    },
    "schedule_settings._item.content1.cool_target_temperature": {
        "coefficient": 0.01
    },
    "schedule_settings._item.content2.auto_target_temperature": {
        "coefficient": 0.01
    },
    "schedule_settings._item.content2.auto_heat_target_temperature": {
        "coefficient": 0.01
    },
    "schedule_settings._item.content2.auto_cool_target_temperature": {
        "coefficient": 0.01
    },
    "origin_temperature": {
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
