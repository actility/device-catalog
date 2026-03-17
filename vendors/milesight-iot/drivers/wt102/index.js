/**
 * Payload Decoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product WT102
 */

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
    var result = {};
	var history = [];

	var unknown_command = 0;
	var counterObj = {};
	for (counterObj.i = 0; counterObj.i < bytes.length; ) {
		var command_id = bytes[counterObj.i++];
		switch (command_id) {
			case 0xff:
				decoded.check_sequence_number_reply = decoded.check_sequence_number_reply || {};
				decoded.check_sequence_number_reply.sequence_number = readUInt8(bytes, counterObj, 1);
				break;
			case 0xfe:
				decoded.check_order_reply = readOnlyCommand(bytes, counterObj, 1);
				break;
			case 0xef:
				decoded.ans = decoded.ans || [];
				var ans_item = {};
				var bitOptions = readUInt8(bytes, counterObj, 1);
				// 0：success, 1：unknow, 2：error order, 3：error passwd, 4：error read params, 5：error write params, 6：error read, 7：error write, 8：error read apply, 9：error write apply
				ans_item.result = extractBits(bitOptions, 4, 8);
				ans_item.length = extractBits(bitOptions, 0, 4);
				ans_item.id = readCommand(bytes, counterObj, ans_item.length);
				decoded.ans.push(ans_item);
				break;
			case 0xee:
				decoded.all_configurations_request_by_device = readOnlyCommand(bytes, counterObj, 0);
				break;
			case 0xed:
				if (history.length === 0) {
					for (var k in decoded) {
						if (decoded.hasOwnProperty(k)) {
							result[k] = decoded[k];
						}
					}
				}
				decoded = {};
				// skip type
				readUInt8(bytes, counterObj, 1);
				decoded.timestamp = readUInt32LE(bytes, counterObj, 4);
				history.push(decoded);
				break;
				break;
			case 0xcf:
				// skip 1 byte
				counterObj.i++;
				decoded.lorawan_class = readLoRaWANClass(readUInt8(bytes, counterObj, 1));
				break;
			case 0xdf:
				decoded.tsl_version = readProtocolVersion(readBytes(bytes, counterObj, 2));
				break;
			case 0xde:
				decoded.product_name = readString(bytes, counterObj, 32);
				break;
			case 0xdd:
				decoded.product_pn = readString(bytes, counterObj, 32);
				break;
			case 0xdb:
				decoded.product_sn = readHexString(bytes, counterObj, 8);
				break;
			case 0xda:
				decoded.version = decoded.version || {};
				decoded.version.hardware_version = readHardwareVersion(readBytes(bytes, counterObj, 2));
				decoded.version.firmware_version = readFirmwareVersion(readBytes(bytes, counterObj, 6));
				break;
			case 0xd9:
				decoded.oem_id = readHexString(bytes, counterObj, 2);
				break;
			case 0xc8:
				// 0：Off, 1：On
				decoded.device_status = readUInt8(bytes, counterObj, 1);
				break;
			case 0xd8:
				decoded.product_frequency_band = readString(bytes, counterObj, 16);
				break;
			case 0x00:
				decoded.battery = readUInt8(bytes, counterObj, 1);
				break;
			case 0x01:
				// decoded.temperature = readInt16LE(bytes, counterObj, 2) / 100;
				decoded.temperature = Math.round(readInt16LE(bytes, counterObj, 2) / 100 * 10) / 10;
				break;
			case 0x02:
				decoded.motor_total_stroke = readUInt16LE(bytes, counterObj, 2);
				break;
			case 0x03:
				decoded.motor_position = readUInt16LE(bytes, counterObj, 2);
				break;
			case 0x04:
				decoded.valve_opening_degree = readUInt8(bytes, counterObj, 1);
				break;
			case 0x05:
				decoded.motor_calibration_result_report = decoded.motor_calibration_result_report || {};
				// 0：Uncalibrated, 1：Calibration success, 2：Calibration failed,out of range , 3：Calibration failed,temperature control disabled, 4：Calibration failed,uninstalled
				decoded.motor_calibration_result_report.status = readUInt8(bytes, counterObj, 1);
				break;
			case 0x06:
				decoded.target_temperature = readInt16LE(bytes, counterObj, 2) / 100;
				break;
			case 0x07:
				decoded.target_valve_opening_degree = readUInt8(bytes, counterObj, 1);
				break;
			case 0x08:
				decoded.low_battery_alarm = decoded.low_battery_alarm || {};
				decoded.low_battery_alarm.value = readUInt8(bytes, counterObj, 1);
				// decoded.battery = decoded.low_battery_alarm.value;
				break;
			case 0x09:
				decoded.temperature_alarm = decoded.temperature_alarm || {};
				decoded.temperature_alarm.type = readUInt8(bytes, counterObj, 1);
				if (decoded.temperature_alarm.type == 0x10) {
					decoded.temperature_alarm.lower_range_alarm_deactivation = decoded.temperature_alarm.lower_range_alarm_deactivation || {};
					decoded.temperature_alarm.lower_range_alarm_deactivation.temperature = readInt16LE(bytes, counterObj, 2) / 100;
					// decoded.temperature = decoded.temperature_alarm.lower_range_alarm_deactivation.temperature;
				}
				if (decoded.temperature_alarm.type == 0x11) {
					decoded.temperature_alarm.lower_range_alarm_trigger = decoded.temperature_alarm.lower_range_alarm_trigger || {};
					decoded.temperature_alarm.lower_range_alarm_trigger.temperature = readInt16LE(bytes, counterObj, 2) / 100;
					// decoded.temperature = decoded.temperature_alarm.lower_range_alarm_trigger.temperature;
				}
				if (decoded.temperature_alarm.type == 0x12) {
					decoded.temperature_alarm.over_range_alarm_deactivation = decoded.temperature_alarm.over_range_alarm_deactivation || {};
					decoded.temperature_alarm.over_range_alarm_deactivation.temperature = readInt16LE(bytes, counterObj, 2) / 100;
					// decoded.temperature = decoded.temperature_alarm.over_range_alarm_deactivation.temperature;
				}
				if (decoded.temperature_alarm.type == 0x13) {
					decoded.temperature_alarm.over_range_alarm_trigger = decoded.temperature_alarm.over_range_alarm_trigger || {};
					decoded.temperature_alarm.over_range_alarm_trigger.temperature = readInt16LE(bytes, counterObj, 2) / 100;
					// decoded.temperature = decoded.temperature_alarm.over_range_alarm_trigger.temperature;
				}
				break;
			case 0x0a:
				decoded.anti_freeze_protection_alarm = decoded.anti_freeze_protection_alarm || {};
				decoded.anti_freeze_protection_alarm.type = readUInt8(bytes, counterObj, 1);
				if (decoded.anti_freeze_protection_alarm.type == 0x20) {
					decoded.anti_freeze_protection_alarm.lifted = decoded.anti_freeze_protection_alarm.lifted || {};
					decoded.anti_freeze_protection_alarm.lifted.environment_temperature = readInt16LE(bytes, counterObj, 2) / 100;
					// decoded.temperature = decoded.anti_freeze_protection_alarm.lifted.environment_temperature;
					decoded.anti_freeze_protection_alarm.lifted.current_valve_status = readUInt8(bytes, counterObj, 1);
					// decoded.valve_opening_degree = decoded.anti_freeze_protection_alarm.lifted.current_valve_status;
				}
				if (decoded.anti_freeze_protection_alarm.type == 0x21) {
					decoded.anti_freeze_protection_alarm.trigger = decoded.anti_freeze_protection_alarm.trigger || {};
					decoded.anti_freeze_protection_alarm.trigger.environment_temperature = readInt16LE(bytes, counterObj, 2) / 100;
					// decoded.temperature = decoded.anti_freeze_protection_alarm.trigger.environment_temperature;
					decoded.anti_freeze_protection_alarm.trigger.current_valve_status = readUInt8(bytes, counterObj, 1);
					// decoded.valve_opening_degree = decoded.anti_freeze_protection_alarm.trigger.current_valve_status;
				}
				break;
			case 0x0b:
				decoded.mandatory_heating_alarm = decoded.mandatory_heating_alarm || {};
				decoded.mandatory_heating_alarm.type = readUInt8(bytes, counterObj, 1);
				if (decoded.mandatory_heating_alarm.type == 0x20) {
					decoded.mandatory_heating_alarm.exit = decoded.mandatory_heating_alarm.exit || {};
					decoded.mandatory_heating_alarm.exit.environment_temperature = readInt16LE(bytes, counterObj, 2) / 100;
					// decoded.temperature = decoded.mandatory_heating_alarm.exit.environment_temperature;
					decoded.mandatory_heating_alarm.exit.current_valve_status = readUInt8(bytes, counterObj, 1);
					// decoded.valve_opening_degree = decoded.mandatory_heating_alarm.exit.current_valve_status;
					decoded.mandatory_heating_alarm.exit.battery_level = readUInt8(bytes, counterObj, 1);
					// decoded.battery = decoded.mandatory_heating_alarm.exit.battery_level;
				}
				if (decoded.mandatory_heating_alarm.type == 0x21) {
					decoded.mandatory_heating_alarm.enter = decoded.mandatory_heating_alarm.enter || {};
					decoded.mandatory_heating_alarm.enter.environment_temperature = readInt16LE(bytes, counterObj, 2) / 100;
					// decoded.temperature = decoded.mandatory_heating_alarm.enter.environment_temperature;
					decoded.mandatory_heating_alarm.enter.current_valve_status = readUInt8(bytes, counterObj, 1);
					// decoded.valve_opening_degree = decoded.mandatory_heating_alarm.enter.current_valve_status;
					decoded.mandatory_heating_alarm.enter.battery_level = readUInt8(bytes, counterObj, 1);
					// decoded.battery = decoded.mandatory_heating_alarm.enter.battery_level;
				}
				break;
			case 0x0c:
				decoded.auto_away_report = decoded.auto_away_report || {};
				decoded.auto_away_report.event_type = readUInt8(bytes, counterObj, 1);
				if (decoded.auto_away_report.event_type == 0x20) {
					decoded.auto_away_report.inactive_by_target_temperature = decoded.auto_away_report.inactive_by_target_temperature || {};
					// 0：Unoccupied, 1：Occupied
					decoded.auto_away_report.inactive_by_target_temperature.state = readUInt8(bytes, counterObj, 1);
					decoded.auto_away_report.inactive_by_target_temperature.environment_temperature = readInt16LE(bytes, counterObj, 2) / 100;
					decoded.temperature = decoded.auto_away_report.inactive_by_target_temperature.environment_temperature;
					decoded.auto_away_report.inactive_by_target_temperature.target_temperature = readInt16LE(bytes, counterObj, 2) / 100;
					decoded.target_temperature = decoded.auto_away_report.inactive_by_target_temperature.target_temperature;
				}
				if (decoded.auto_away_report.event_type == 0x21) {
					decoded.auto_away_report.active_by_target_temperature = decoded.auto_away_report.active_by_target_temperature || {};
					// 0：Unoccupied, 1：Occupied
					decoded.auto_away_report.active_by_target_temperature.state = readUInt8(bytes, counterObj, 1);
					decoded.auto_away_report.active_by_target_temperature.environment_temperature = readInt16LE(bytes, counterObj, 2) / 100;
					decoded.temperature = decoded.auto_away_report.active_by_target_temperature.environment_temperature;
					decoded.auto_away_report.active_by_target_temperature.target_temperature = readInt16LE(bytes, counterObj, 2) / 100;
				}
				if (decoded.auto_away_report.event_type == 0x22) {
					decoded.auto_away_report.inactive_by_target_valve_opening = decoded.auto_away_report.inactive_by_target_valve_opening || {};
					// 0：Unoccupied, 1：Occupied
					decoded.auto_away_report.inactive_by_target_valve_opening.state = readUInt8(bytes, counterObj, 1);
					decoded.auto_away_report.inactive_by_target_valve_opening.environment_temperature = readInt16LE(bytes, counterObj, 2) / 100;
					decoded.temperature = decoded.auto_away_report.inactive_by_target_valve_opening.environment_temperature;
					decoded.auto_away_report.inactive_by_target_valve_opening.target_valve_opening = readUInt8(bytes, counterObj, 1);
					decoded.target_valve_opening_degree = decoded.auto_away_report.inactive_by_target_valve_opening.target_valve_opening;
				}
				if (decoded.auto_away_report.event_type == 0x23) {
					decoded.auto_away_report.active_by_target_valve_opening = decoded.auto_away_report.active_by_target_valve_opening || {};
					// 0：Unoccupied, 1：Occupied
					decoded.auto_away_report.active_by_target_valve_opening.state = readUInt8(bytes, counterObj, 1);
					decoded.auto_away_report.active_by_target_valve_opening.environment_temperature = readInt16LE(bytes, counterObj, 2) / 100;
					decoded.temperature = decoded.auto_away_report.active_by_target_valve_opening.environment_temperature;
					decoded.auto_away_report.active_by_target_valve_opening.target_valve_opening = readUInt8(bytes, counterObj, 1);
				}
				break;
			case 0x0d:
				decoded.window_opening_alarm = decoded.window_opening_alarm || {};
				decoded.window_opening_alarm.type = readUInt8(bytes, counterObj, 1);
				if (decoded.window_opening_alarm.type == 0x20) {
					decoded.window_opening_alarm.release = decoded.window_opening_alarm.release || {};
					// 0：Normal, 1：Open
					decoded.window_opening_alarm.release.state = readUInt8(bytes, counterObj, 1);
					decoded.window_opening_alarm.release.environment_temperature = readInt16LE(bytes, counterObj, 2) / 100;
					// decoded.temperature = decoded.window_opening_alarm.release.environment_temperature;
				}
				if (decoded.window_opening_alarm.type == 0x21) {
					decoded.window_opening_alarm.trigger = decoded.window_opening_alarm.trigger || {};
					// 0：Normal, 1：Open
					decoded.window_opening_alarm.trigger.state = readUInt8(bytes, counterObj, 1);
					decoded.window_opening_alarm.trigger.environment_temperature = readInt16LE(bytes, counterObj, 2) / 100;
					// decoded.temperature = decoded.window_opening_alarm.trigger.environment_temperature;
				}
				break;
			case 0x0e:
				decoded.periodic_reporting = decoded.periodic_reporting || {};
				decoded.periodic_reporting.report_type = readUInt8(bytes, counterObj, 1);
				if (decoded.periodic_reporting.report_type == 0x00) {
					decoded.periodic_reporting.non_heating_season = decoded.periodic_reporting.non_heating_season || {};
					decoded.periodic_reporting.non_heating_season.target_valve_opening = readUInt8(bytes, counterObj, 1);
					// decoded.target_valve_opening_degree = decoded.periodic_reporting.non_heating_season.target_valve_opening;
					decoded.periodic_reporting.non_heating_season.battery_level = readUInt8(bytes, counterObj, 1);
					// decoded.battery = decoded.periodic_reporting.non_heating_season.battery_level;
				}
				if (decoded.periodic_reporting.report_type == 0x01) {
					decoded.periodic_reporting.target_temperature_for_heating = decoded.periodic_reporting.target_temperature_for_heating || {};
					decoded.periodic_reporting.target_temperature_for_heating.environment_temperature = readInt16LE(bytes, counterObj, 2) / 100;
					// decoded.temperature = decoded.periodic_reporting.target_temperature_for_heating.environment_temperature;
					decoded.periodic_reporting.target_temperature_for_heating.current_valve_opening = readUInt8(bytes, counterObj, 1);
					// decoded.valve_opening_degree = decoded.periodic_reporting.target_temperature_for_heating.current_valve_opening;
					decoded.periodic_reporting.target_temperature_for_heating.target_temperature = readInt16LE(bytes, counterObj, 2) / 100;
					// decoded.target_temperature = decoded.periodic_reporting.target_temperature_for_heating.target_temperature;
					decoded.periodic_reporting.target_temperature_for_heating.battery_level = readUInt8(bytes, counterObj, 1);
					// decoded.battery = decoded.periodic_reporting.target_temperature_for_heating.battery_level;
				}
				if (decoded.periodic_reporting.report_type == 0x02) {
					decoded.periodic_reporting.target_valve_opening_for_heating = decoded.periodic_reporting.target_valve_opening_for_heating || {};
					decoded.periodic_reporting.target_valve_opening_for_heating.environment_temperature = readInt16LE(bytes, counterObj, 2) / 100;
					// decoded.temperature = decoded.periodic_reporting.target_valve_opening_for_heating.environment_temperature;
					decoded.periodic_reporting.target_valve_opening_for_heating.current_valve_opening = readUInt8(bytes, counterObj, 1);
					// decoded.valve_opening_degree = decoded.periodic_reporting.target_valve_opening_for_heating.current_valve_opening;
					decoded.periodic_reporting.target_valve_opening_for_heating.target_valve_opening = readUInt8(bytes, counterObj, 1);
					// decoded.target_valve_opening_degree = decoded.periodic_reporting.target_valve_opening_for_heating.target_valve_opening;
					decoded.periodic_reporting.target_valve_opening_for_heating.battery_level = readUInt8(bytes, counterObj, 1);
					// decoded.battery = decoded.periodic_reporting.target_valve_opening_for_heating.battery_level;
				}
				if (decoded.periodic_reporting.report_type == 0x03) {
					decoded.periodic_reporting.integrated_control_for_heating = decoded.periodic_reporting.integrated_control_for_heating || {};
					decoded.periodic_reporting.integrated_control_for_heating.environment_temperature = readInt16LE(bytes, counterObj, 2) / 100;
					// decoded.temperature = decoded.periodic_reporting.integrated_control_for_heating.environment_temperature;
					decoded.periodic_reporting.integrated_control_for_heating.current_valve_opening = readUInt8(bytes, counterObj, 1);
					// decoded.valve_opening_degree = decoded.periodic_reporting.integrated_control_for_heating.current_valve_opening;
					decoded.periodic_reporting.integrated_control_for_heating.target_temperature = readInt16LE(bytes, counterObj, 2) / 100;
					// decoded.target_temperature = decoded.periodic_reporting.integrated_control_for_heating.target_temperature;
					decoded.periodic_reporting.integrated_control_for_heating.target_valve_opening = readUInt8(bytes, counterObj, 1);
					// decoded.target_valve_opening_degree = decoded.periodic_reporting.integrated_control_for_heating.target_valve_opening;
					decoded.periodic_reporting.integrated_control_for_heating.battery_level = readUInt8(bytes, counterObj, 1);
					// decoded.battery = decoded.periodic_reporting.integrated_control_for_heating.battery_level;
				}
				break;
			case 0xc9:
				// 0：Disable, 1：Enable
				decoded.random_key = readUInt8(bytes, counterObj, 1);
				break;
			case 0xc4:
				// 0：Disable, 1：Enable
				decoded.auto_p_enable = readUInt8(bytes, counterObj, 1);
				break;
			case 0x60:
				// 0：℃, 1：℉
				decoded.temperature_unit = readUInt8(bytes, counterObj, 1);
				break;
			case 0x61:
				decoded.temperature_source_settings = decoded.temperature_source_settings || {};
				// 0：Internal NTC, 1：External NTC, 2：LoRa Receive
				decoded.temperature_source_settings.type = readUInt8(bytes, counterObj, 1);
				if (decoded.temperature_source_settings.type == 0x01) {
					decoded.temperature_source_settings.external_ntc_reception = decoded.temperature_source_settings.external_ntc_reception || {};
					decoded.temperature_source_settings.external_ntc_reception.timeout = readUInt16LE(bytes, counterObj, 2);
					// 0: Maintaining State Control, 1: Close the Valve, 2: Switch to Internal NTC Control
					decoded.temperature_source_settings.external_ntc_reception.timeout_response = readUInt8(bytes, counterObj, 1);
				}
				if (decoded.temperature_source_settings.type == 0x02) {
					decoded.temperature_source_settings.lorawan_reception = decoded.temperature_source_settings.lorawan_reception || {};
					decoded.temperature_source_settings.lorawan_reception.timeout = readUInt16LE(bytes, counterObj, 2);
					// 0: Maintaining State Control, 1: Close the Valve, 2: Switch to Internal NTC Control
					decoded.temperature_source_settings.lorawan_reception.timeout_response = readUInt8(bytes, counterObj, 1);
				}
				break;
			case 0x62:
				// 0：Disable, 1：Enable
				decoded.environment_temperature_display_enable = readUInt8(bytes, counterObj, 1);
				break;
			case 0x63:
				decoded.heating_period_settings = decoded.heating_period_settings || {};
				var heating_period_settings_command = readUInt8(bytes, counterObj, 1);
				if (heating_period_settings_command == 0x00) {
					decoded.heating_period_settings.heating_date_settings = decoded.heating_period_settings.heating_date_settings || {};
					decoded.heating_period_settings.heating_date_settings.start_mon = readUInt8(bytes, counterObj, 1);
					decoded.heating_period_settings.heating_date_settings.start_day = readUInt8(bytes, counterObj, 1);
					decoded.heating_period_settings.heating_date_settings.end_mon = readUInt8(bytes, counterObj, 1);
					decoded.heating_period_settings.heating_date_settings.end_day = readUInt8(bytes, counterObj, 1);
				}
				if (heating_period_settings_command == 0x01) {
					decoded.heating_period_settings.heating_period_reporting_interval = decoded.heating_period_settings.heating_period_reporting_interval || {};
					// 0：second, 1：min
					decoded.heating_period_settings.heating_period_reporting_interval.unit = readUInt8(bytes, counterObj, 1);
					if (decoded.heating_period_settings.heating_period_reporting_interval.unit == 0x00) {
						decoded.heating_period_settings.heating_period_reporting_interval.seconds_of_time = readUInt16LE(bytes, counterObj, 2);
					}
					if (decoded.heating_period_settings.heating_period_reporting_interval.unit == 0x01) {
						decoded.heating_period_settings.heating_period_reporting_interval.minutes_of_time = readUInt16LE(bytes, counterObj, 2);
					}
				}
				if (heating_period_settings_command == 0x02) {
					decoded.heating_period_settings.non_heating_period_reporting_interval = decoded.heating_period_settings.non_heating_period_reporting_interval || {};
					// 0：second, 1：min
					decoded.heating_period_settings.non_heating_period_reporting_interval.unit = readUInt8(bytes, counterObj, 1);
					if (decoded.heating_period_settings.non_heating_period_reporting_interval.unit == 0x00) {
						decoded.heating_period_settings.non_heating_period_reporting_interval.seconds_of_time = readUInt16LE(bytes, counterObj, 2);
					}
					if (decoded.heating_period_settings.non_heating_period_reporting_interval.unit == 0x01) {
						decoded.heating_period_settings.non_heating_period_reporting_interval.minutes_of_time = readUInt16LE(bytes, counterObj, 2);
					}
				}
				if (heating_period_settings_command == 0x03) {
					// 0：Fully Close, 1：Fully Open
					decoded.heating_period_settings.valve_status_control = readUInt8(bytes, counterObj, 1);
				}
				break;
			case 0x65:
				decoded.temp_control = decoded.temp_control || {};
				var target_temperature_control_settings_command = readUInt8(bytes, counterObj, 1);
				if (target_temperature_control_settings_command == 0x00) {
					// 0：Disable, 1：Enable
					decoded.temp_control.enable = readUInt8(bytes, counterObj, 1);
				}
				if (target_temperature_control_settings_command == 0x01) {
					// 0：0.5, 1：1
					decoded.temp_control.target_temperature_resolution = readUInt8(bytes, counterObj, 1);
				}
				if (target_temperature_control_settings_command == 0x02) {
					decoded.temp_control.under_temperature_side_deadband = readInt16LE(bytes, counterObj, 2) / 100;
				}
				if (target_temperature_control_settings_command == 0x03) {
					decoded.temp_control.over_temperature_side_deadband = readInt16LE(bytes, counterObj, 2) / 100;
				}
				if (target_temperature_control_settings_command == 0x04) {
					decoded.temp_control.target_temperature_adjustment_range_min = readInt16LE(bytes, counterObj, 2) / 100;
				}
				if (target_temperature_control_settings_command == 0x05) {
					decoded.temp_control.target_temperature_adjustment_range_max = readInt16LE(bytes, counterObj, 2) / 100;
				}
				if (target_temperature_control_settings_command == 0x06) {
					decoded.temp_control.mode_settings = decoded.temp_control.mode_settings || {};
					// 0：Automatic Temperature Control, 1：Valve Opening Control, 2：Integrated Control
					decoded.temp_control.mode_settings.mode = readUInt8(bytes, counterObj, 1);
					if (decoded.temp_control.mode_settings.mode == 0x00) {
						decoded.temp_control.mode_settings.auto_control = decoded.temp_control.mode_settings.auto_control || {};
						decoded.temp_control.mode_settings.auto_control.target_temperature = readInt16LE(bytes, counterObj, 2) / 100;
					}
					if (decoded.temp_control.mode_settings.mode == 0x01) {
						decoded.temp_control.mode_settings.valve_control = decoded.temp_control.mode_settings.valve_control || {};
						decoded.temp_control.mode_settings.valve_control.target_valve_status = readUInt8(bytes, counterObj, 1);
					}
					if (decoded.temp_control.mode_settings.mode == 0x02) {
						decoded.temp_control.mode_settings.intergrated_control = decoded.temp_control.mode_settings.intergrated_control || {};
						decoded.temp_control.mode_settings.intergrated_control.target_temp = readInt16LE(bytes, counterObj, 2) / 100;
					}
				}
				break;
			case 0x66:
				decoded.window_opening_detection_settings = decoded.window_opening_detection_settings || {};
				// 0：Disable, 1：Enable
				decoded.window_opening_detection_settings.enable = readUInt8(bytes, counterObj, 1);
				decoded.window_opening_detection_settings.cooling_rate = readInt16LE(bytes, counterObj, 2) / 100;
				// 0：Remains Unchanged, 1：Close the Valve
				decoded.window_opening_detection_settings.valve_status = readUInt8(bytes, counterObj, 1);
				decoded.window_opening_detection_settings.stop_temperature_control_time = readUInt16LE(bytes, counterObj, 2);
				break;
			case 0x67:
				decoded.auto_away_settings = decoded.auto_away_settings || {};
				// 0：Disable, 1：Enable
				decoded.auto_away_settings.enable = readUInt8(bytes, counterObj, 1);
				decoded.auto_away_settings.start_time = readUInt16LE(bytes, counterObj, 2);
				decoded.auto_away_settings.end_time = readUInt16LE(bytes, counterObj, 2);
				var bitOptions = readUInt8(bytes, counterObj, 1);
				// 0：Disable, 1：Enable
				decoded.auto_away_settings.cycle_time_sun = extractBits(bitOptions, 0, 1);
				// 0：Disable, 1：Enable
				decoded.auto_away_settings.cycle_time_mon = extractBits(bitOptions, 1, 2);
				// 0：Disable, 1：Enable
				decoded.auto_away_settings.cycle_time_tues = extractBits(bitOptions, 2, 3);
				// 0：Disable, 1：Enable
				decoded.auto_away_settings.cycle_time_wed = extractBits(bitOptions, 3, 4);
				// 0：Disable, 1：Enable
				decoded.auto_away_settings.cycle_time_thur = extractBits(bitOptions, 4, 5);
				// 0：Disable, 1：Enable
				decoded.auto_away_settings.cycle_time_fri = extractBits(bitOptions, 5, 6);
				// 0：Disable, 1：Enable
				decoded.auto_away_settings.cycle_time_sat = extractBits(bitOptions, 6, 7);
				decoded.auto_away_settings.reserved = extractBits(bitOptions, 7, 8);
				decoded.auto_away_settings.energy_saving_settings = decoded.auto_away_settings.energy_saving_settings || {};
				// 0：Energy Saving Temperature, 1：Energy Saving Valve Opening
				decoded.auto_away_settings.energy_saving_settings.mode = readUInt8(bytes, counterObj, 1);
				if (decoded.auto_away_settings.energy_saving_settings.mode == 0x00) {
					decoded.auto_away_settings.energy_saving_settings.energy_saving_temperature = readInt16LE(bytes, counterObj, 2) / 100;
				}
				if (decoded.auto_away_settings.energy_saving_settings.mode == 0x01) {
					decoded.auto_away_settings.energy_saving_settings.energy_saving_valve_opening_degree = readUInt8(bytes, counterObj, 1);
				}
				break;
			case 0x68:
				decoded.anti_freeze_protection_setting = decoded.anti_freeze_protection_setting || {};
				// 0：Disable, 1：Enable
				decoded.anti_freeze_protection_setting.enable = readUInt8(bytes, counterObj, 1);
				decoded.anti_freeze_protection_setting.temperature_value = readInt16LE(bytes, counterObj, 2) / 100;
				break;
			case 0x69:
				// 0：Disable, 1：Enable
				decoded.mandatory_heating_enable = readUInt8(bytes, counterObj, 1);
				break;
			case 0x6a:
				decoded.child_lock = decoded.child_lock || {};
				// 0：Disable, 1：Enable
				decoded.child_lock.enable = readUInt8(bytes, counterObj, 1);
				var bitOptions = readUInt8(bytes, counterObj, 1);
				// 0：Disable, 1：Enable
				decoded.child_lock.system_button = extractBits(bitOptions, 0, 1);
				// 0：Disable, 1：Enable
				decoded.child_lock.func_button = extractBits(bitOptions, 1, 2);
				decoded.child_lock.reserved = extractBits(bitOptions, 2, 8);
				break;
			case 0x6b:
				decoded.motor_stroke_limit = readUInt8(bytes, counterObj, 1);
				break;
			case 0x6c:
				decoded.temperature_calibration_settings = decoded.temperature_calibration_settings || {};
				// 0：Disable, 1：Enable
				decoded.temperature_calibration_settings.enable = readUInt8(bytes, counterObj, 1);
				decoded.temperature_calibration_settings.calibration_value = readInt16LE(bytes, counterObj, 2) / 100;
				break;
			case 0x6d:
				decoded.temperature_alarm_settings = decoded.temperature_alarm_settings || {};
				// 0：Disable, 1：Enable
				decoded.temperature_alarm_settings.enable = readUInt8(bytes, counterObj, 1);
				// 0:Disable, 1:Condition: x<A, 2:Condition: x>B, 4:Condition: x<A or x>B
				decoded.temperature_alarm_settings.threshold_condition = readUInt8(bytes, counterObj, 1);
				decoded.temperature_alarm_settings.threshold_min = readInt16LE(bytes, counterObj, 2) / 100;
				decoded.temperature_alarm_settings.threshold_max = readInt16LE(bytes, counterObj, 2) / 100;
				break;
			case 0x6e:
				decoded.schedule_settings = decoded.schedule_settings || [];
				var id = readUInt8(bytes, counterObj, 1);
				var schedule_settings_item = pickArrayItem(decoded.schedule_settings, id, 'id');
				schedule_settings_item.id = id;
				insertArrayItem(decoded.schedule_settings, schedule_settings_item, 'id');
				var schedule_settings_item_command = readUInt8(bytes, counterObj, 1);
				if (schedule_settings_item_command == 0x00) {
					// 0：Disable, 1：Enable
					schedule_settings_item.enable = readUInt8(bytes, counterObj, 1);
				}
				if (schedule_settings_item_command == 0x01) {
					schedule_settings_item.start_time = readUInt16LE(bytes, counterObj, 2);
				}
				if (schedule_settings_item_command == 0x02) {
					schedule_settings_item.cycle_settings = schedule_settings_item.cycle_settings || {};
					var bitOptions = readUInt8(bytes, counterObj, 1);
					// 0：Disable, 1：Enable
					schedule_settings_item.cycle_settings.execution_day_sun = extractBits(bitOptions, 0, 1);
					// 0：Disable, 1：Enable
					schedule_settings_item.cycle_settings.execution_day_mon = extractBits(bitOptions, 1, 2);
					// 0：Disable, 1：Enable
					schedule_settings_item.cycle_settings.execution_day_tues = extractBits(bitOptions, 2, 3);
					// 0：Disable, 1：Enable
					schedule_settings_item.cycle_settings.execution_day_wed = extractBits(bitOptions, 3, 4);
					// 0：Disable, 1：Enable
					schedule_settings_item.cycle_settings.execution_day_thur = extractBits(bitOptions, 4, 5);
					// 0：Disable, 1：Enable
					schedule_settings_item.cycle_settings.execution_day_fri = extractBits(bitOptions, 5, 6);
					// 0：Disable, 1：Enable
					schedule_settings_item.cycle_settings.execution_day_sat = extractBits(bitOptions, 6, 7);
					schedule_settings_item.cycle_settings.reserved = extractBits(bitOptions, 7, 8);
				}
				if (schedule_settings_item_command == 0x03) {
					// 0：Automatic Temperature Control, 1：Valve Opening Control, 2：Integrated Control
					schedule_settings_item.temperature_control_mode = readUInt8(bytes, counterObj, 1);
				}
				if (schedule_settings_item_command == 0x04) {
					schedule_settings_item.target_temperature = readInt16LE(bytes, counterObj, 2) / 100;
				}
				if (schedule_settings_item_command == 0x05) {
					schedule_settings_item.target_valve_status = readUInt8(bytes, counterObj, 1);
				}
				if (schedule_settings_item_command == 0x06) {
					// 0：Disable, 1：Enable
					schedule_settings_item.pre_heating_enable = readUInt8(bytes, counterObj, 1);
				}
				if (schedule_settings_item_command == 0x07) {
					// 0：Auto, 1：Manual
					schedule_settings_item.pre_heating_mode = readUInt8(bytes, counterObj, 1);
				}
				if (schedule_settings_item_command == 0x08) {
					schedule_settings_item.pre_heating_manual_time = readUInt16LE(bytes, counterObj, 2);
				}
				if (schedule_settings_item_command == 0x09) {
					schedule_settings_item.report_cycle = readUInt16LE(bytes, counterObj, 2);
				}
				break;
			case 0x6f:
				// 0：Disable, 1：Enable
				decoded.change_report_enable = readUInt8(bytes, counterObj, 1);
				break;
			case 0x70:
				decoded.motor_controllable_range = decoded.motor_controllable_range || {};
				// 0：Disable, 1：Enable
				decoded.motor_controllable_range.enable = readUInt8(bytes, counterObj, 1);
				decoded.motor_controllable_range.distance = readUInt16LE(bytes, counterObj, 2) / 100;
				break;
			case 0xc7:
				decoded.time_zone = readInt16LE(bytes, counterObj, 2);
				break;
			case 0xc6:
				decoded.daylight_saving_time = decoded.daylight_saving_time || {};
				// 0：Disable, 1：Enable
				decoded.daylight_saving_time.enable = readUInt8(bytes, counterObj, 1);
				decoded.daylight_saving_time.daylight_saving_time_offset = readUInt8(bytes, counterObj, 1);
				// 1:Jan., 2:Feb., 3:Mar., 4:Apr., 5:May, 6:Jun., 7:Jul., 8:Aug., 9:Sep., 10:Oct., 11:Nov., 12:Dec.
				decoded.daylight_saving_time.start_month = readUInt8(bytes, counterObj, 1);
				var bitOptions = readUInt8(bytes, counterObj, 1);
				// 1:1st, 2: 2nd, 3: 3rd, 4: 4th, 5: last
				decoded.daylight_saving_time.start_week_num = extractBits(bitOptions, 4, 8);
				// 1：Mon., 2：Tues., 3：Wed., 4：Thurs., 5：Fri., 6：Sat., 7：Sun.
				decoded.daylight_saving_time.start_week_day = extractBits(bitOptions, 0, 4);
				decoded.daylight_saving_time.start_hour_min = readUInt16LE(bytes, counterObj, 2);
				// 1:Jan., 2:Feb., 3:Mar., 4:Apr., 5:May, 6:Jun., 7:Jul., 8:Aug., 9:Sep., 10:Oct., 11:Nov., 12:Dec.
				decoded.daylight_saving_time.end_month = readUInt8(bytes, counterObj, 1);
				var bitOptions = readUInt8(bytes, counterObj, 1);
				// 1:1st, 2: 2nd, 3: 3rd, 4: 4th, 5: last
				decoded.daylight_saving_time.end_week_num = extractBits(bitOptions, 4, 8);
				// 1：Mon., 2：Tues., 3：Wed., 4：Thurs., 5：Fri., 6：Sat., 7：Sun.
				decoded.daylight_saving_time.end_week_day = extractBits(bitOptions, 0, 4);
				decoded.daylight_saving_time.end_hour_min = readUInt16LE(bytes, counterObj, 2);
				break;
			case 0xc5:
				decoded.data_storage_settings = decoded.data_storage_settings || {};
				var data_storage_settings_command = readUInt8(bytes, counterObj, 1);
				if (data_storage_settings_command == 0x00) {
					// 0：Disable, 1：Enable
					decoded.data_storage_settings.enable = readUInt8(bytes, counterObj, 1);
				}
				if (data_storage_settings_command == 0x01) {
					// 0：Disable, 1：Enable
					decoded.data_storage_settings.retransmission_enable = readUInt8(bytes, counterObj, 1);
				}
				if (data_storage_settings_command == 0x02) {
					decoded.data_storage_settings.retransmission_interval = readUInt16LE(bytes, counterObj, 2);
				}
				if (data_storage_settings_command == 0x03) {
					decoded.data_storage_settings.retrieval_interval = readUInt16LE(bytes, counterObj, 2);
				}
				break;
			case 0xb6:
				decoded.reconnect = readOnlyCommand(bytes, counterObj, 0);
				break;
			case 0xb9:
				decoded.query_device_status = readOnlyCommand(bytes, counterObj, 0);
				break;
			case 0xb8:
				decoded.synchronize_time = readOnlyCommand(bytes, counterObj, 0);
				break;
			case 0xb7:
				decoded.set_time = decoded.set_time || {};
				decoded.set_time.timestamp = readUInt32LE(bytes, counterObj, 4);
				break;
			case 0xb5:
				decoded.collect_data = readOnlyCommand(bytes, counterObj, 0);
				break;
			case 0xbd:
				decoded.clear_historical_data = readOnlyCommand(bytes, counterObj, 0);
				break;
			case 0xbc:
				decoded.stop_historical_data_retrieval = readOnlyCommand(bytes, counterObj, 0);
				break;
			case 0xbb:
				decoded.retrieve_historical_data_by_time_range = decoded.retrieve_historical_data_by_time_range || {};
				decoded.retrieve_historical_data_by_time_range.start_time = readUInt32LE(bytes, counterObj, 4);
				decoded.retrieve_historical_data_by_time_range.end_time = readUInt32LE(bytes, counterObj, 4);
				break;
			case 0xba:
				decoded.retrieve_historical_data_by_time = decoded.retrieve_historical_data_by_time || {};
				decoded.retrieve_historical_data_by_time.time = readUInt32LE(bytes, counterObj, 4);
				break;
			case 0x57:
				decoded.query_motor_stroke_position = readOnlyCommand(bytes, counterObj, 0);
				break;
			case 0x58:
				decoded.calibrate_motor = readOnlyCommand(bytes, counterObj, 0);
				break;
			case 0x59:
				decoded.set_target_valve_opening_degree = decoded.set_target_valve_opening_degree || {};
				decoded.set_target_valve_opening_degree.value = readUInt8(bytes, counterObj, 1);
				break;
			case 0x5a:
				decoded.set_target_temperature = decoded.set_target_temperature || {};
				decoded.set_target_temperature.value = readInt16LE(bytes, counterObj, 2) / 100;
				break;
			case 0x5b:
				decoded.set_temperature = decoded.set_temperature || {};
				decoded.set_temperature.value = readInt16LE(bytes, counterObj, 2) / 100;
				break;
			case 0x5c:
				decoded.set_occupancy_state = decoded.set_occupancy_state || {};
				// 0：Unoccupied, 1：Occupied
				decoded.set_occupancy_state.state = readUInt8(bytes, counterObj, 1);
				break;
			case 0x5d:
				decoded.set_opening_window = decoded.set_opening_window || {};
				// 0：Normal, 1：Open
				decoded.set_opening_window.state = readUInt8(bytes, counterObj, 1);
				break;
			case 0x5e:
				decoded.delete_schedule = decoded.delete_schedule || {};
				// 0：Schedule1, 1：Schedule2, 2：Schedule3, 3：Schedule4, 4：Schedule5, 5：Schedule6, 6：Schedule7, 7：Schedule8, 8：Schedule9, 9：Schedule10, 10：Schedule11, 11：Schedule12, 12：Schedule13, 13：Schedule14, 14：Schedule15, 15：Schedule16, 255：Reset All 
				decoded.delete_schedule.type = readUInt8(bytes, counterObj, 1);
				break;
			case 0xbf:
				decoded.reset = readOnlyCommand(bytes, counterObj, 0);
				break;
			case 0xbe:
				decoded.reboot = readOnlyCommand(bytes, counterObj, 0);
				break;
		}
		if (unknown_command) {
			throw new Error('unknown command: ' + command_id);
		}
	}

	if (Object.keys(history).length > 0) {
		result.history = history;
	} else {        
		for (var k2 in decoded) {
			if (decoded.hasOwnProperty(k2)) {
				result[k2] = decoded[k2];
			}
		}
	}

	return result;
}

function readOnlyCommand(bytes) {
	return 1;
}

function readUnknownDataType(allBytes, counterObj, end) {
	throw new Error('Unknown data type encountered. Please Contact Developer.');
}

function readBytes(allBytes, counterObj, end) {
	var bytes = allBytes.slice(counterObj.i, counterObj.i + end);
	counterObj.i += end;
	return bytes;
}

function readProtocolVersion(bytes) {
	var major = bytes[0] & 0xff;
	var minor = bytes[1] & 0xff;
	return 'v' + major + '.' + minor;
}

function readLoRaWANClass(type) {
	var lorawan_class_map = {
		0: "Class A",
		1: "Class B",
		2: "Class C",
		3: "Class CtoB",
	};
	return lorawan_class_map[type] || "Unknown";
}

function readHardwareVersion(bytes) {
	var major = bytes[0] & 0xff;
	var minor = bytes[1] & 0xff;
	return 'v' + major + '.' + minor;
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

/* eslint-disable */
function readUInt8(allBytes, counterObj, end) {
	var bytes = readBytes(allBytes, counterObj, end);
	return bytes[0] & 0xff;
}

function readInt8(allBytes, counterObj, end) {
	var ref = readUInt8(allBytes, counterObj, end);
	return ref > 0x7f ? ref - 0x100 : ref;
}

function readUInt16LE(allBytes, counterObj, end) {
	var bytes = readBytes(allBytes, counterObj, end);
	var value = (bytes[1] << 8) + bytes[0];
	return value & 0xffff;
}

function readInt16LE(allBytes, counterObj, end) {
	var ref = readUInt16LE(allBytes, counterObj, end);
	return ref > 0x7fff ? ref - 0x10000 : ref;
}

function readUInt24LE(allBytes, counterObj, end) {
    var bytes = readBytes(allBytes, counterObj, end); // 3 bytes expected
    var value = (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
    return value & 0xffffff;
}

function readInt24LE(allBytes, counterObj, end) {
    var ref = readUInt24LE(allBytes, counterObj, end);
    return ref > 0x7fffff ? ref - 0x1000000 : ref;
}

function readUInt32LE(allBytes, counterObj, end) {
	var bytes = readBytes(allBytes, counterObj, end);
	var value = (bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
	return (value & 0xffffffff) >>> 0;
}

function readInt32LE(allBytes, counterObj, end) {
	var ref = readUInt32LE(allBytes, counterObj, end);
	return ref > 0x7fffffff ? ref - 0x100000000 : ref;
}

function readFloat16LE(allBytes, counterObj, end) {
	var bytes = readBytes(allBytes, counterObj, end);
	var bits = (bytes[1] << 8) | bytes[0];
	var sign = bits >>> 15 === 0 ? 1.0 : -1.0;
	var e = (bits >>> 10) & 0x1f;
	var m = e === 0 ? (bits & 0x3ff) << 1 : (bits & 0x3ff) | 0x400;
	var f = sign * m * Math.pow(2, e - 25);

	var n = Number(f.toFixed(2));
	return n;
}

function readFloatLE(allBytes, counterObj, end) {
	var bytes = readBytes(allBytes, counterObj, end);
	var bits = (bytes[3] << 24) | (bytes[2] << 16) | (bytes[1] << 8) | bytes[0];
	var sign = bits >>> 31 === 0 ? 1.0 : -1.0;
	var e = (bits >>> 23) & 0xff;
	var m = e === 0 ? (bits & 0x7fffff) << 1 : (bits & 0x7fffff) | 0x800000;
	var f = sign * m * Math.pow(2, e - 150);
	return f;
}

function readString(allBytes, counterObj, end) {
	var str = "";
	var bytes = readBytes(allBytes, counterObj, end);
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
	return str.replace(/\u0000+$/g, '');
}

function readHexString(allBytes, counterObj, end) {
	var temp = [];
	var bytes = readBytes(allBytes, counterObj, end);
	for (var idx = 0; idx < bytes.length; idx++) {
		temp.push(("0" + (bytes[idx] & 0xff).toString(16)).slice(-2));
	}
	return temp.join("").replace(/\u0000+$/g, '');
}

function readHexStringLE(allBytes, counterObj, end) {
	var temp = [];
	var bytes = readBytes(allBytes, counterObj, end);
	for (var idx = bytes.length - 1; idx >= 0; idx--) {
		temp.push(("0" + (bytes[idx] & 0xff).toString(16)).slice(-2));
	}
	return temp.join("").replace(/\u0000+$/g, '');
}

function extractBits(byte, startBit, endBit) {
	if (byte < 0 || byte > 0xffff) {
	  throw new Error("byte must be in range 0..65535");
	}
	if (startBit >= endBit) {
	  throw new Error("invalid bit range");
	}
  
	var width = endBit - startBit;
	var mask = (1 << width) - 1;
	return (byte >>> startBit) & mask;
}

function pickArrayItem(array, index, idName) {
	for (var i = 0; i < array.length; i++) { 
		if (array[i][idName] === index) {
			return array[i];
		}
	}

	return {};
}

function insertArrayItem(array, item, idName) {
	for (var i = 0; i < array.length; i++) { 
		if (array[i][idName] === item[idName]) {
			array[i] = item;
			return;
		}
	}
	array.push(item);
}

function readCommand(allBytes, counterObj, end) {
    var bytes = readBytes(allBytes, counterObj, end);
    var cmd = bytes
        .map(function(b) {
            var hex = b.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        })
        .join('')
        .toLowerCase();

    var map = cmdMap();
    for (var key in map) {
        var xxs = [];
        var isMatch = false;
        if (key.length !== cmd.length) {
            continue;
        }
        for (var i = 0; i < key.length; i += 2) {
            var hexString = key.slice(i, i + 2);
            var cmdString = cmd.slice(i, i + 2);
            if (hexString === cmdString || hexString === 'xx') {
                if (hexString === 'xx') {
                    xxs.push('.' + parseInt(cmdString, 16));
                }
                isMatch = true;
                continue;
            } else {
                isMatch = false;
                break;
            }
        }
        if (isMatch) {
            var propertyId = map[key];
            if (propertyId.indexOf('._item') === -1) {
                return propertyId;
            }
            var j = 0;
            var result = propertyId.replace(/\._item/g, function() {
                return xxs[j++];
            });
            return result;
        }
    }
    return null;
}

function cmdMap() {
	return {
		  "57": "query_motor_stroke_position",
		  "58": "calibrate_motor",
		  "59": "set_target_valve_opening_degree",
		  "60": "temperature_unit",
		  "61": "temperature_source_settings",
		  "62": "environment_temperature_display_enable",
		  "63": "heating_period_settings",
		  "65": "temp_control",
		  "66": "window_opening_detection_settings",
		  "67": "auto_away_settings",
		  "68": "anti_freeze_protection_setting",
		  "69": "mandatory_heating_enable",
		  "70": "motor_controllable_range",
		  "6300": "heating_period_settings.heating_date_settings",
		  "6301": "heating_period_settings.heating_period_reporting_interval",
		  "6302": "heating_period_settings.non_heating_period_reporting_interval",
		  "6303": "heating_period_settings.valve_status_control",
		  "6500": "temp_control.enable",
		  "6501": "temp_control.target_temperature_resolution",
		  "6502": "temp_control.under_temperature_side_deadband",
		  "6503": "temp_control.over_temperature_side_deadband",
		  "6504": "temp_control.target_temperature_adjustment_range_min",
		  "6505": "temp_control.target_temperature_adjustment_range_max",
		  "6506": "temp_control.mode_settings",
		  "ff": "request_check_sequence_number",
		  "fe": "request_check_order",
		  "ef": "request_command_queries",
		  "ee": "request_query_all_configurations",
		  "ed": "historical_data_report",
		  "cf": "lorawan_configuration_settings",
		  "cfd8": "lorawan_configuration_settings.version",
		  "df": "tsl_version",
		  "de": "product_name",
		  "dd": "product_pn",
		  "db": "product_sn",
		  "da": "version",
		  "d9": "oem_id",
		  "c8": "device_status",
		  "d8": "product_frequency_band",
		  "00": "battery",
		  "01": "temperature",
		  "02": "motor_total_stroke",
		  "03": "motor_position",
		  "04": "valve_opening_degree",
		  "05": "motor_calibration_result_report",
		  "06": "target_temperature",
		  "07": "target_valve_opening_degree",
		  "08": "low_battery_alarm",
		  "09": "temperature_alarm",
		  "0a": "anti_freeze_protection_alarm",
		  "0b": "mandatory_heating_alarm",
		  "0c": "auto_away_report",
		  "0d": "window_opening_alarm",
		  "0e": "periodic_reporting",
		  "c9": "random_key",
		  "c4": "auto_p_enable",
		  "6a": "child_lock",
		  "6b": "motor_stroke_limit",
		  "6c": "temperature_calibration_settings",
		  "6d": "temperature_alarm_settings",
		  "6e": "schedule_settings",
		  "6exx": "schedule_settings._item",
		  "6exx00": "schedule_settings._item.enable",
		  "6exx01": "schedule_settings._item.start_time",
		  "6exx02": "schedule_settings._item.cycle_settings",
		  "6exx03": "schedule_settings._item.temperature_control_mode",
		  "6exx04": "schedule_settings._item.target_temperature",
		  "6exx05": "schedule_settings._item.target_valve_status",
		  "6exx06": "schedule_settings._item.pre_heating_enable",
		  "6exx07": "schedule_settings._item.pre_heating_mode",
		  "6exx08": "schedule_settings._item.pre_heating_manual_time",
		  "6exx09": "schedule_settings._item.report_cycle",
		  "6f": "change_report_enable",
		  "c7": "time_zone",
		  "c6": "daylight_saving_time",
		  "c5": "data_storage_settings",
		  "c500": "data_storage_settings.enable",
		  "c501": "data_storage_settings.retransmission_enable",
		  "c502": "data_storage_settings.retransmission_interval",
		  "c503": "data_storage_settings.retrieval_interval",
		  "b6": "reconnect",
		  "b9": "query_device_status",
		  "b8": "synchronize_time",
		  "b7": "set_time",
		  "b5": "collect_data",
		  "bd": "clear_historical_data",
		  "bc": "stop_historical_data_retrieval",
		  "bb": "retrieve_historical_data_by_time_range",
		  "ba": "retrieve_historical_data_by_time",
		  "5a": "set_target_temperature",
		  "5b": "set_temperature",
		  "5c": "set_occupancy_state",
		  "5d": "set_opening_window",
		  "5e": "delete_schedule",
		  "bf": "reset",
		  "be": "reboot"
	};
}

exports.decodeUplink = decodeUplink;

var __milesightDownlinkCodec = (function () {
/**
 * Payload Encoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product WT102
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
					console.log(pureNumber);
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
	//0xed
	if ('history' in payload) {
		for (var i = 0; i < payload.history.length; i++) {
			var buffer = new Buffer();
			var history = payload.history[i];
			buffer.writeUInt8(0xed);
			// 0：target time, 1：historical time
			buffer.writeUInt8(1);
			buffer.writeUInt32LE(history.timestamp);
			var reset = {};
			for (var k in history) {
				if (history.hasOwnProperty(k) && k !== "timestamp") {
					reset[k] = history[k];
				}
			}
		
			encoded = encoded.concat(buffer.toBytes());
			encoded = encoded.concat(milesightDeviceEncode(reset));
		}
	}
	//0xcf
	if ('lorawan_class' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xcf);
		buffer.writeUInt8(0x00);
		// 0：Class A, 1：Class B, 2：Class C, 3：Class CtoB
		var lorawan_class_map = {
			"Class A": 0,
			"Class B": 1,
			"Class C": 2,
			"Class CtoB": 3,
		};
		buffer.writeUInt8(lorawan_class_map[payload.lorawan_class]);
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
	//0xc8
	if ('device_status' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xc8);
		// 0：Off, 1：On
		buffer.writeUInt8(payload.device_status);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xd8
	if ('product_frequency_band' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xd8);
		buffer.writeString(payload.product_frequency_band, 16);
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
	if ('motor_total_stroke' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x02);
		if (payload.motor_total_stroke < 0 || payload.motor_total_stroke > 3028) {
			throw new Error('motor_total_stroke must be between 0 and 3028');
		}
		buffer.writeUInt16LE(payload.motor_total_stroke);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x03
	if ('motor_position' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x03);
		if (payload.motor_position < 0 || payload.motor_position > 3028) {
			throw new Error('motor_position must be between 0 and 3028');
		}
		buffer.writeUInt16LE(payload.motor_position);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x04
	if ('valve_opening_degree' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x04);
		if (payload.valve_opening_degree < 0 || payload.valve_opening_degree > 100) {
			throw new Error('valve_opening_degree must be between 0 and 100');
		}
		buffer.writeUInt8(payload.valve_opening_degree);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x05
	if ('motor_calibration_result_report' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x05);
		// 0：Uncalibrated, 1：Calibration success, 2：Calibration failed,out of range , 3：Calibration failed,temperature control disabled, 4：Calibration failed,uninstalled
		buffer.writeUInt8(payload.motor_calibration_result_report.status);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x06
	if ('target_temperature' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x06);
		if (payload.target_temperature < 5 || payload.target_temperature > 35) {
			throw new Error('target_temperature must be between 5 and 35');
		}
		buffer.writeInt16LE(payload.target_temperature * 100);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x07
	if ('target_valve_opening_degree' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x07);
		if (payload.target_valve_opening_degree < 0 || payload.target_valve_opening_degree > 100) {
			throw new Error('target_valve_opening_degree must be between 0 and 100');
		}
		buffer.writeUInt8(payload.target_valve_opening_degree);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x08
	if ('low_battery_alarm' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x08);
		if (payload.low_battery_alarm.value < 0 || payload.low_battery_alarm.value > 100) {
			throw new Error('low_battery_alarm.value must be between 0 and 100');
		}
		buffer.writeUInt8(payload.low_battery_alarm.value);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x09
	if ('temperature_alarm' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x09);
		buffer.writeUInt8(payload.temperature_alarm.type);
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
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x0a
	if ('anti_freeze_protection_alarm' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x0a);
		buffer.writeUInt8(payload.anti_freeze_protection_alarm.type);
		if (payload.anti_freeze_protection_alarm.type == 0x20) {
			if (payload.anti_freeze_protection_alarm.lifted.environment_temperature < -20 || payload.anti_freeze_protection_alarm.lifted.environment_temperature > 60) {
				throw new Error('anti_freeze_protection_alarm.lifted.environment_temperature must be between -20 and 60');
			}
			buffer.writeInt16LE(payload.anti_freeze_protection_alarm.lifted.environment_temperature * 100);
			if (payload.anti_freeze_protection_alarm.lifted.current_valve_status < 0 || payload.anti_freeze_protection_alarm.lifted.current_valve_status > 100) {
				throw new Error('anti_freeze_protection_alarm.lifted.current_valve_status must be between 0 and 100');
			}
			buffer.writeUInt8(payload.anti_freeze_protection_alarm.lifted.current_valve_status);
		}
		if (payload.anti_freeze_protection_alarm.type == 0x21) {
			if (payload.anti_freeze_protection_alarm.trigger.environment_temperature < -20 || payload.anti_freeze_protection_alarm.trigger.environment_temperature > 60) {
				throw new Error('anti_freeze_protection_alarm.trigger.environment_temperature must be between -20 and 60');
			}
			buffer.writeInt16LE(payload.anti_freeze_protection_alarm.trigger.environment_temperature * 100);
			if (payload.anti_freeze_protection_alarm.trigger.current_valve_status < 0 || payload.anti_freeze_protection_alarm.trigger.current_valve_status > 100) {
				throw new Error('anti_freeze_protection_alarm.trigger.current_valve_status must be between 0 and 100');
			}
			buffer.writeUInt8(payload.anti_freeze_protection_alarm.trigger.current_valve_status);
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x0b
	if ('mandatory_heating_alarm' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x0b);
		buffer.writeUInt8(payload.mandatory_heating_alarm.type);
		if (payload.mandatory_heating_alarm.type == 0x20) {
			if (payload.mandatory_heating_alarm.exit.environment_temperature < -20 || payload.mandatory_heating_alarm.exit.environment_temperature > 60) {
				throw new Error('mandatory_heating_alarm.exit.environment_temperature must be between -20 and 60');
			}
			buffer.writeInt16LE(payload.mandatory_heating_alarm.exit.environment_temperature * 100);
			if (payload.mandatory_heating_alarm.exit.current_valve_status < 0 || payload.mandatory_heating_alarm.exit.current_valve_status > 100) {
				throw new Error('mandatory_heating_alarm.exit.current_valve_status must be between 0 and 100');
			}
			buffer.writeUInt8(payload.mandatory_heating_alarm.exit.current_valve_status);
			if (payload.mandatory_heating_alarm.exit.battery_level < 0 || payload.mandatory_heating_alarm.exit.battery_level > 100) {
				throw new Error('mandatory_heating_alarm.exit.battery_level must be between 0 and 100');
			}
			buffer.writeUInt8(payload.mandatory_heating_alarm.exit.battery_level);
		}
		if (payload.mandatory_heating_alarm.type == 0x21) {
			if (payload.mandatory_heating_alarm.enter.environment_temperature < -20 || payload.mandatory_heating_alarm.enter.environment_temperature > 60) {
				throw new Error('mandatory_heating_alarm.enter.environment_temperature must be between -20 and 60');
			}
			buffer.writeInt16LE(payload.mandatory_heating_alarm.enter.environment_temperature * 100);
			if (payload.mandatory_heating_alarm.enter.current_valve_status < 0 || payload.mandatory_heating_alarm.enter.current_valve_status > 100) {
				throw new Error('mandatory_heating_alarm.enter.current_valve_status must be between 0 and 100');
			}
			buffer.writeUInt8(payload.mandatory_heating_alarm.enter.current_valve_status);
			if (payload.mandatory_heating_alarm.enter.battery_level < 0 || payload.mandatory_heating_alarm.enter.battery_level > 100) {
				throw new Error('mandatory_heating_alarm.enter.battery_level must be between 0 and 100');
			}
			buffer.writeUInt8(payload.mandatory_heating_alarm.enter.battery_level);
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x0c
	if ('auto_away_report' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x0c);
		buffer.writeUInt8(payload.auto_away_report.event_type);
		if (payload.auto_away_report.event_type == 0x20) {
			// 0：Unoccupied, 1：Occupied
			buffer.writeUInt8(payload.auto_away_report.inactive_by_target_temperature.state);
			if (payload.auto_away_report.inactive_by_target_temperature.environment_temperature < -20 || payload.auto_away_report.inactive_by_target_temperature.environment_temperature > 60) {
				throw new Error('auto_away_report.inactive_by_target_temperature.environment_temperature must be between -20 and 60');
			}
			buffer.writeInt16LE(payload.auto_away_report.inactive_by_target_temperature.environment_temperature * 100);
			if (payload.auto_away_report.inactive_by_target_temperature.target_temperature < 5 || payload.auto_away_report.inactive_by_target_temperature.target_temperature > 35) {
				throw new Error('auto_away_report.inactive_by_target_temperature.target_temperature must be between 5 and 35');
			}
			buffer.writeInt16LE(payload.auto_away_report.inactive_by_target_temperature.target_temperature * 100);
		}
		if (payload.auto_away_report.event_type == 0x21) {
			// 0：Unoccupied, 1：Occupied
			buffer.writeUInt8(payload.auto_away_report.active_by_target_temperature.state);
			if (payload.auto_away_report.active_by_target_temperature.environment_temperature < -20 || payload.auto_away_report.active_by_target_temperature.environment_temperature > 60) {
				throw new Error('auto_away_report.active_by_target_temperature.environment_temperature must be between -20 and 60');
			}
			buffer.writeInt16LE(payload.auto_away_report.active_by_target_temperature.environment_temperature * 100);
			if (payload.auto_away_report.active_by_target_temperature.target_temperature < 5 || payload.auto_away_report.active_by_target_temperature.target_temperature > 35) {
				throw new Error('auto_away_report.active_by_target_temperature.target_temperature must be between 5 and 35');
			}
			buffer.writeInt16LE(payload.auto_away_report.active_by_target_temperature.target_temperature * 100);
		}
		if (payload.auto_away_report.event_type == 0x22) {
			// 0：Unoccupied, 1：Occupied
			buffer.writeUInt8(payload.auto_away_report.inactive_by_target_valve_opening.state);
			if (payload.auto_away_report.inactive_by_target_valve_opening.environment_temperature < -20 || payload.auto_away_report.inactive_by_target_valve_opening.environment_temperature > 60) {
				throw new Error('auto_away_report.inactive_by_target_valve_opening.environment_temperature must be between -20 and 60');
			}
			buffer.writeInt16LE(payload.auto_away_report.inactive_by_target_valve_opening.environment_temperature * 100);
			if (payload.auto_away_report.inactive_by_target_valve_opening.target_valve_opening < 0 || payload.auto_away_report.inactive_by_target_valve_opening.target_valve_opening > 100) {
				throw new Error('auto_away_report.inactive_by_target_valve_opening.target_valve_opening must be between 0 and 100');
			}
			buffer.writeUInt8(payload.auto_away_report.inactive_by_target_valve_opening.target_valve_opening);
		}
		if (payload.auto_away_report.event_type == 0x23) {
			// 0：Unoccupied, 1：Occupied
			buffer.writeUInt8(payload.auto_away_report.active_by_target_valve_opening.state);
			if (payload.auto_away_report.active_by_target_valve_opening.environment_temperature < -20 || payload.auto_away_report.active_by_target_valve_opening.environment_temperature > 60) {
				throw new Error('auto_away_report.active_by_target_valve_opening.environment_temperature must be between -20 and 60');
			}
			buffer.writeInt16LE(payload.auto_away_report.active_by_target_valve_opening.environment_temperature * 100);
			if (payload.auto_away_report.active_by_target_valve_opening.target_valve_opening < 0 || payload.auto_away_report.active_by_target_valve_opening.target_valve_opening > 100) {
				throw new Error('auto_away_report.active_by_target_valve_opening.target_valve_opening must be between 0 and 100');
			}
			buffer.writeUInt8(payload.auto_away_report.active_by_target_valve_opening.target_valve_opening);
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x0d
	if ('window_opening_alarm' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x0d);
		buffer.writeUInt8(payload.window_opening_alarm.type);
		if (payload.window_opening_alarm.type == 0x20) {
			// 0：Normal, 1：Open
			buffer.writeUInt8(payload.window_opening_alarm.release.state);
			if (payload.window_opening_alarm.release.environment_temperature < -20 || payload.window_opening_alarm.release.environment_temperature > 60) {
				throw new Error('window_opening_alarm.release.environment_temperature must be between -20 and 60');
			}
			buffer.writeInt16LE(payload.window_opening_alarm.release.environment_temperature * 100);
		}
		if (payload.window_opening_alarm.type == 0x21) {
			// 0：Normal, 1：Open
			buffer.writeUInt8(payload.window_opening_alarm.trigger.state);
			if (payload.window_opening_alarm.trigger.environment_temperature < -20 || payload.window_opening_alarm.trigger.environment_temperature > 60) {
				throw new Error('window_opening_alarm.trigger.environment_temperature must be between -20 and 60');
			}
			buffer.writeInt16LE(payload.window_opening_alarm.trigger.environment_temperature * 100);
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x0e
	if ('periodic_reporting' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x0e);
		buffer.writeUInt8(payload.periodic_reporting.report_type);
		if (payload.periodic_reporting.report_type == 0x00) {
			if (payload.periodic_reporting.non_heating_season.target_valve_opening < 0 || payload.periodic_reporting.non_heating_season.target_valve_opening > 100) {
				throw new Error('periodic_reporting.non_heating_season.target_valve_opening must be between 0 and 100');
			}
			buffer.writeUInt8(payload.periodic_reporting.non_heating_season.target_valve_opening);
			if (payload.periodic_reporting.non_heating_season.battery_level < 0 || payload.periodic_reporting.non_heating_season.battery_level > 100) {
				throw new Error('periodic_reporting.non_heating_season.battery_level must be between 0 and 100');
			}
			buffer.writeUInt8(payload.periodic_reporting.non_heating_season.battery_level);
		}
		if (payload.periodic_reporting.report_type == 0x01) {
			if (payload.periodic_reporting.target_temperature_for_heating.environment_temperature < -20 || payload.periodic_reporting.target_temperature_for_heating.environment_temperature > 60) {
				throw new Error('periodic_reporting.target_temperature_for_heating.environment_temperature must be between -20 and 60');
			}
			buffer.writeInt16LE(payload.periodic_reporting.target_temperature_for_heating.environment_temperature * 100);
			if (payload.periodic_reporting.target_temperature_for_heating.current_valve_opening < 0 || payload.periodic_reporting.target_temperature_for_heating.current_valve_opening > 100) {
				throw new Error('periodic_reporting.target_temperature_for_heating.current_valve_opening must be between 0 and 100');
			}
			buffer.writeUInt8(payload.periodic_reporting.target_temperature_for_heating.current_valve_opening);
			if (payload.periodic_reporting.target_temperature_for_heating.target_temperature < 5 || payload.periodic_reporting.target_temperature_for_heating.target_temperature > 35) {
				throw new Error('periodic_reporting.target_temperature_for_heating.target_temperature must be between 5 and 35');
			}
			buffer.writeInt16LE(payload.periodic_reporting.target_temperature_for_heating.target_temperature * 100);
			if (payload.periodic_reporting.target_temperature_for_heating.battery_level < 0 || payload.periodic_reporting.target_temperature_for_heating.battery_level > 100) {
				throw new Error('periodic_reporting.target_temperature_for_heating.battery_level must be between 0 and 100');
			}
			buffer.writeUInt8(payload.periodic_reporting.target_temperature_for_heating.battery_level);
		}
		if (payload.periodic_reporting.report_type == 0x02) {
			if (payload.periodic_reporting.target_valve_opening_for_heating.environment_temperature < -20 || payload.periodic_reporting.target_valve_opening_for_heating.environment_temperature > 60) {
				throw new Error('periodic_reporting.target_valve_opening_for_heating.environment_temperature must be between -20 and 60');
			}
			buffer.writeInt16LE(payload.periodic_reporting.target_valve_opening_for_heating.environment_temperature * 100);
			if (payload.periodic_reporting.target_valve_opening_for_heating.current_valve_opening < 0 || payload.periodic_reporting.target_valve_opening_for_heating.current_valve_opening > 100) {
				throw new Error('periodic_reporting.target_valve_opening_for_heating.current_valve_opening must be between 0 and 100');
			}
			buffer.writeUInt8(payload.periodic_reporting.target_valve_opening_for_heating.current_valve_opening);
			if (payload.periodic_reporting.target_valve_opening_for_heating.target_valve_opening < 0 || payload.periodic_reporting.target_valve_opening_for_heating.target_valve_opening > 100) {
				throw new Error('periodic_reporting.target_valve_opening_for_heating.target_valve_opening must be between 0 and 100');
			}
			buffer.writeUInt8(payload.periodic_reporting.target_valve_opening_for_heating.target_valve_opening);
			if (payload.periodic_reporting.target_valve_opening_for_heating.battery_level < 0 || payload.periodic_reporting.target_valve_opening_for_heating.battery_level > 100) {
				throw new Error('periodic_reporting.target_valve_opening_for_heating.battery_level must be between 0 and 100');
			}
			buffer.writeUInt8(payload.periodic_reporting.target_valve_opening_for_heating.battery_level);
		}
		if (payload.periodic_reporting.report_type == 0x03) {
			if (payload.periodic_reporting.integrated_control_for_heating.environment_temperature < -20 || payload.periodic_reporting.integrated_control_for_heating.environment_temperature > 60) {
				throw new Error('periodic_reporting.integrated_control_for_heating.environment_temperature must be between -20 and 60');
			}
			buffer.writeInt16LE(payload.periodic_reporting.integrated_control_for_heating.environment_temperature * 100);
			if (payload.periodic_reporting.integrated_control_for_heating.current_valve_opening < 0 || payload.periodic_reporting.integrated_control_for_heating.current_valve_opening > 100) {
				throw new Error('periodic_reporting.integrated_control_for_heating.current_valve_opening must be between 0 and 100');
			}
			buffer.writeUInt8(payload.periodic_reporting.integrated_control_for_heating.current_valve_opening);
			if (payload.periodic_reporting.integrated_control_for_heating.target_temperature < 5 || payload.periodic_reporting.integrated_control_for_heating.target_temperature > 35) {
				throw new Error('periodic_reporting.integrated_control_for_heating.target_temperature must be between 5 and 35');
			}
			buffer.writeInt16LE(payload.periodic_reporting.integrated_control_for_heating.target_temperature * 100);
			if (payload.periodic_reporting.integrated_control_for_heating.target_valve_opening < 0 || payload.periodic_reporting.integrated_control_for_heating.target_valve_opening > 100) {
				throw new Error('periodic_reporting.integrated_control_for_heating.target_valve_opening must be between 0 and 100');
			}
			buffer.writeUInt8(payload.periodic_reporting.integrated_control_for_heating.target_valve_opening);
			if (payload.periodic_reporting.integrated_control_for_heating.battery_level < 0 || payload.periodic_reporting.integrated_control_for_heating.battery_level > 100) {
				throw new Error('periodic_reporting.integrated_control_for_heating.battery_level must be between 0 and 100');
			}
			buffer.writeUInt8(payload.periodic_reporting.integrated_control_for_heating.battery_level);
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xc9
	if ('random_key' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xc9);
		// 0：Disable, 1：Enable
		buffer.writeUInt8(payload.random_key);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xc4
	if ('auto_p_enable' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xc4);
		// 0：Disable, 1：Enable
		buffer.writeUInt8(payload.auto_p_enable);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x60
	if ('temperature_unit' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x60);
		// 0：℃, 1：℉
		buffer.writeUInt8(payload.temperature_unit);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x61
	if ('temperature_source_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x61);
		// 0：Internal NTC, 1：External NTC, 2：LoRa Receive
		buffer.writeUInt8(payload.temperature_source_settings.type);
		if (payload.temperature_source_settings.type == 0x01) {
			if (payload.temperature_source_settings.external_ntc_reception.timeout < 1 || payload.temperature_source_settings.external_ntc_reception.timeout > 1440) {
				throw new Error('temperature_source_settings.external_ntc_reception.timeout must be between 1 and 1440');
			}
			buffer.writeUInt16LE(payload.temperature_source_settings.external_ntc_reception.timeout);
			// 0: Maintaining State Control, 1: Close the Valve, 2: Switch to Internal NTC Control
			buffer.writeUInt8(payload.temperature_source_settings.external_ntc_reception.timeout_response);
		}
		if (payload.temperature_source_settings.type == 0x02) {
			if (payload.temperature_source_settings.lorawan_reception.timeout < 1 || payload.temperature_source_settings.lorawan_reception.timeout > 1440) {
				throw new Error('temperature_source_settings.lorawan_reception.timeout must be between 1 and 1440');
			}
			buffer.writeUInt16LE(payload.temperature_source_settings.lorawan_reception.timeout);
			// 0: Maintaining State Control, 1: Close the Valve, 2: Switch to Internal NTC Control
			buffer.writeUInt8(payload.temperature_source_settings.lorawan_reception.timeout_response);
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x62
	if ('environment_temperature_display_enable' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x62);
		// 0：Disable, 1：Enable
		buffer.writeUInt8(payload.environment_temperature_display_enable);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x63
	if ('heating_period_settings' in payload) {
		var buffer = new Buffer();
		if (isValid(payload.heating_period_settings.heating_date_settings)) {
			buffer.writeUInt8(0x63);
			buffer.writeUInt8(0x00);
			if (payload.heating_period_settings.heating_date_settings.start_mon < 1 || payload.heating_period_settings.heating_date_settings.start_mon > 12) {
				throw new Error('heating_period_settings.heating_date_settings.start_mon must be between 1 and 12');
			}
			buffer.writeUInt8(payload.heating_period_settings.heating_date_settings.start_mon);
			if (payload.heating_period_settings.heating_date_settings.start_day < 1 || payload.heating_period_settings.heating_date_settings.start_day > 31) {
				throw new Error('heating_period_settings.heating_date_settings.start_day must be between 1 and 31');
			}
			buffer.writeUInt8(payload.heating_period_settings.heating_date_settings.start_day);
			if (payload.heating_period_settings.heating_date_settings.end_mon < 1 || payload.heating_period_settings.heating_date_settings.end_mon > 12) {
				throw new Error('heating_period_settings.heating_date_settings.end_mon must be between 1 and 12');
			}
			buffer.writeUInt8(payload.heating_period_settings.heating_date_settings.end_mon);
			if (payload.heating_period_settings.heating_date_settings.end_day < 1 || payload.heating_period_settings.heating_date_settings.end_day > 31) {
				throw new Error('heating_period_settings.heating_date_settings.end_day must be between 1 and 31');
			}
			buffer.writeUInt8(payload.heating_period_settings.heating_date_settings.end_day);
		}
		if (isValid(payload.heating_period_settings.heating_period_reporting_interval)) {
			buffer.writeUInt8(0x63);
			buffer.writeUInt8(0x01);
			// 0：second, 1：min
			buffer.writeUInt8(payload.heating_period_settings.heating_period_reporting_interval.unit);
			if (payload.heating_period_settings.heating_period_reporting_interval.unit == 0x00) {
				if (payload.heating_period_settings.heating_period_reporting_interval.seconds_of_time < 10 || payload.heating_period_settings.heating_period_reporting_interval.seconds_of_time > 64800) {
					throw new Error('heating_period_settings.heating_period_reporting_interval.seconds_of_time must be between 10 and 64800');
				}
				buffer.writeUInt16LE(payload.heating_period_settings.heating_period_reporting_interval.seconds_of_time);
			}
			if (payload.heating_period_settings.heating_period_reporting_interval.unit == 0x01) {
				if (payload.heating_period_settings.heating_period_reporting_interval.minutes_of_time < 1 || payload.heating_period_settings.heating_period_reporting_interval.minutes_of_time > 1440) {
					throw new Error('heating_period_settings.heating_period_reporting_interval.minutes_of_time must be between 1 and 1440');
				}
				buffer.writeUInt16LE(payload.heating_period_settings.heating_period_reporting_interval.minutes_of_time);
			}
		}
		if (isValid(payload.heating_period_settings.non_heating_period_reporting_interval)) {
			buffer.writeUInt8(0x63);
			buffer.writeUInt8(0x02);
			// 0：second, 1：min
			buffer.writeUInt8(payload.heating_period_settings.non_heating_period_reporting_interval.unit);
			if (payload.heating_period_settings.non_heating_period_reporting_interval.unit == 0x00) {
				if (payload.heating_period_settings.non_heating_period_reporting_interval.seconds_of_time < 10 || payload.heating_period_settings.non_heating_period_reporting_interval.seconds_of_time > 64800) {
					throw new Error('heating_period_settings.non_heating_period_reporting_interval.seconds_of_time must be between 10 and 64800');
				}
				buffer.writeUInt16LE(payload.heating_period_settings.non_heating_period_reporting_interval.seconds_of_time);
			}
			if (payload.heating_period_settings.non_heating_period_reporting_interval.unit == 0x01) {
				if (payload.heating_period_settings.non_heating_period_reporting_interval.minutes_of_time < 1 || payload.heating_period_settings.non_heating_period_reporting_interval.minutes_of_time > 1440) {
					throw new Error('heating_period_settings.non_heating_period_reporting_interval.minutes_of_time must be between 1 and 1440');
				}
				buffer.writeUInt16LE(payload.heating_period_settings.non_heating_period_reporting_interval.minutes_of_time);
			}
		}
		if (isValid(payload.heating_period_settings.valve_status_control)) {
			buffer.writeUInt8(0x63);
			// 0：Fully Close, 1：Fully Open
			buffer.writeUInt8(0x03);
			// 0：Fully Close, 1：Fully Open
			buffer.writeUInt8(payload.heating_period_settings.valve_status_control);
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x65
	if ('temp_control' in payload) {
		var buffer = new Buffer();
		if (isValid(payload.temp_control.enable)) {
			buffer.writeUInt8(0x65);
			// 0：Disable, 1：Enable
			buffer.writeUInt8(0x00);
			// 0：Disable, 1：Enable
			buffer.writeUInt8(payload.temp_control.enable);
		}
		if (isValid(payload.temp_control.target_temperature_resolution)) {
			buffer.writeUInt8(0x65);
			// 0：0.5, 1：1
			buffer.writeUInt8(0x01);
			// 0：0.5, 1：1
			buffer.writeUInt8(payload.temp_control.target_temperature_resolution);
		}
		if (isValid(payload.temp_control.under_temperature_side_deadband)) {
			buffer.writeUInt8(0x65);
			buffer.writeUInt8(0x02);
			if (payload.temp_control.under_temperature_side_deadband < 0.1 || payload.temp_control.under_temperature_side_deadband > 5) {
				throw new Error('temp_control.under_temperature_side_deadband must be between 0.1 and 5');
			}
			buffer.writeInt16LE(payload.temp_control.under_temperature_side_deadband * 100);
		}
		if (isValid(payload.temp_control.over_temperature_side_deadband)) {
			buffer.writeUInt8(0x65);
			buffer.writeUInt8(0x03);
			if (payload.temp_control.over_temperature_side_deadband < 0.1 || payload.temp_control.over_temperature_side_deadband > 5) {
				throw new Error('temp_control.over_temperature_side_deadband must be between 0.1 and 5');
			}
			buffer.writeInt16LE(payload.temp_control.over_temperature_side_deadband * 100);
		}
		if (isValid(payload.temp_control.target_temperature_adjustment_range_min)) {
			buffer.writeUInt8(0x65);
			buffer.writeUInt8(0x04);
			if (payload.temp_control.target_temperature_adjustment_range_min < 5 || payload.temp_control.target_temperature_adjustment_range_min > 35) {
				throw new Error('temp_control.target_temperature_adjustment_range_min must be between 5 and 35');
			}
			buffer.writeInt16LE(payload.temp_control.target_temperature_adjustment_range_min * 100);
		}
		if (isValid(payload.temp_control.target_temperature_adjustment_range_max)) {
			buffer.writeUInt8(0x65);
			buffer.writeUInt8(0x05);
			if (payload.temp_control.target_temperature_adjustment_range_max < 5 || payload.temp_control.target_temperature_adjustment_range_max > 35) {
				throw new Error('temp_control.target_temperature_adjustment_range_max must be between 5 and 35');
			}
			buffer.writeInt16LE(payload.temp_control.target_temperature_adjustment_range_max * 100);
		}
		if (isValid(payload.temp_control.mode_settings)) {
			buffer.writeUInt8(0x65);
			buffer.writeUInt8(0x06);
			// 0：Automatic Temperature Control, 1：Valve Opening Control, 2：Integrated Control
			buffer.writeUInt8(payload.temp_control.mode_settings.mode);
			if (payload.temp_control.mode_settings.mode == 0x00) {
				if (payload.temp_control.mode_settings.auto_control !== undefined && payload.temp_control.mode_settings.auto_control.target_temperature !== undefined) {
					if (payload.temp_control.mode_settings.auto_control.target_temperature < 5 || payload.temp_control.mode_settings.auto_control.target_temperature > 35) {
						throw new Error('temp_control.mode_settings.auto_control.target_temperature must be between 5 and 35');
					}
					buffer.writeInt16LE(payload.temp_control.mode_settings.auto_control.target_temperature * 100);
				}
			}
			if (payload.temp_control.mode_settings.mode == 0x01) {
				if (payload.temp_control.mode_settings.valve_control.target_valve_status < 0 || payload.temp_control.mode_settings.valve_control.target_valve_status > 100) {
					throw new Error('temp_control.mode_settings.valve_control.target_valve_status must be between 0 and 100');
				}
				buffer.writeUInt8(payload.temp_control.mode_settings.valve_control.target_valve_status);
			}
			if (payload.temp_control.mode_settings.mode == 0x02) {
				if (payload.temp_control.mode_settings.intergrated_control.target_temp < 5 || payload.temp_control.mode_settings.intergrated_control.target_temp > 35) {
					throw new Error('temp_control.mode_settings.intergrated_control.target_temp must be between 5 and 35');
				}
				buffer.writeInt16LE(payload.temp_control.mode_settings.intergrated_control.target_temp * 100);
			}
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x66
	if ('window_opening_detection_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x66);
		// 0：Disable, 1：Enable
		buffer.writeUInt8(payload.window_opening_detection_settings.enable);
		if (payload.window_opening_detection_settings.cooling_rate < 2 || payload.window_opening_detection_settings.cooling_rate > 10) {
			throw new Error('window_opening_detection_settings.cooling_rate must be between 2 and 10');
		}
		buffer.writeInt16LE(payload.window_opening_detection_settings.cooling_rate * 100);
		// 0：Remains Unchanged, 1：Close the Valve
		buffer.writeUInt8(payload.window_opening_detection_settings.valve_status);
		if (payload.window_opening_detection_settings.stop_temperature_control_time < 1 || payload.window_opening_detection_settings.stop_temperature_control_time > 1440) {
			throw new Error('window_opening_detection_settings.stop_temperature_control_time must be between 1 and 1440');
		}
		buffer.writeUInt16LE(payload.window_opening_detection_settings.stop_temperature_control_time);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x67
	if ('auto_away_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x67);
		// 0：Disable, 1：Enable
		buffer.writeUInt8(payload.auto_away_settings.enable);
		if (payload.auto_away_settings.start_time < 0 || payload.auto_away_settings.start_time > 1439) {
			throw new Error('auto_away_settings.start_time must be between 0 and 1439');
		}
		buffer.writeUInt16LE(payload.auto_away_settings.start_time);
		if (payload.auto_away_settings.end_time < 0 || payload.auto_away_settings.end_time > 1439) {
			throw new Error('auto_away_settings.end_time must be between 0 and 1439');
		}
		buffer.writeUInt16LE(payload.auto_away_settings.end_time);
		var bitOptions = 0;
		// 0：Disable, 1：Enable
		bitOptions |= payload.auto_away_settings.cycle_time_sun << 0;

		// 0：Disable, 1：Enable
		bitOptions |= payload.auto_away_settings.cycle_time_mon << 1;

		// 0：Disable, 1：Enable
		bitOptions |= payload.auto_away_settings.cycle_time_tues << 2;

		// 0：Disable, 1：Enable
		bitOptions |= payload.auto_away_settings.cycle_time_wed << 3;

		// 0：Disable, 1：Enable
		bitOptions |= payload.auto_away_settings.cycle_time_thur << 4;

		// 0：Disable, 1：Enable
		bitOptions |= payload.auto_away_settings.cycle_time_fri << 5;

		// 0：Disable, 1：Enable
		bitOptions |= payload.auto_away_settings.cycle_time_sat << 6;

		bitOptions |= payload.auto_away_settings.reserved << 7;
		buffer.writeUInt8(bitOptions);

		// 0：Energy Saving Temperature, 1：Energy Saving Valve Opening
		buffer.writeUInt8(payload.auto_away_settings.energy_saving_settings.mode);
		if (payload.auto_away_settings.energy_saving_settings.mode == 0x00) {
			if (payload.auto_away_settings.energy_saving_settings.energy_saving_temperature < 5 || payload.auto_away_settings.energy_saving_settings.energy_saving_temperature > 35) {
				throw new Error('auto_away_settings.energy_saving_settings.energy_saving_temperature must be between 5 and 35');
			}
			buffer.writeInt16LE(payload.auto_away_settings.energy_saving_settings.energy_saving_temperature * 100);
		}
		if (payload.auto_away_settings.energy_saving_settings.mode == 0x01) {
			if (payload.auto_away_settings.energy_saving_settings.energy_saving_valve_opening_degree < 0 || payload.auto_away_settings.energy_saving_settings.energy_saving_valve_opening_degree > 100) {
				throw new Error('auto_away_settings.energy_saving_settings.energy_saving_valve_opening_degree must be between 0 and 100');
			}
			buffer.writeUInt8(payload.auto_away_settings.energy_saving_settings.energy_saving_valve_opening_degree);
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x68
	if ('anti_freeze_protection_setting' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x68);
		// 0：Disable, 1：Enable
		buffer.writeUInt8(payload.anti_freeze_protection_setting.enable);
		if (payload.anti_freeze_protection_setting.temperature_value < 1 || payload.anti_freeze_protection_setting.temperature_value > 5) {
			throw new Error('anti_freeze_protection_setting.temperature_value must be between 1 and 5');
		}
		buffer.writeInt16LE(payload.anti_freeze_protection_setting.temperature_value * 100);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x69
	if ('mandatory_heating_enable' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x69);
		// 0：Disable, 1：Enable
		buffer.writeUInt8(payload.mandatory_heating_enable);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x6a
	if ('child_lock' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x6a);
		// 0：Disable, 1：Enable
		buffer.writeUInt8(payload.child_lock.enable);
		var bitOptions = 0;
		// 0：Disable, 1：Enable
		bitOptions |= payload.child_lock.system_button << 0;

		// 0：Disable, 1：Enable
		bitOptions |= payload.child_lock.func_button << 1;

		bitOptions |= payload.child_lock.reserved << 2;
		buffer.writeUInt8(bitOptions);

		encoded = encoded.concat(buffer.toBytes());
	}
	//0x6b
	if ('motor_stroke_limit' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x6b);
		if (payload.motor_stroke_limit < 0 || payload.motor_stroke_limit > 100) {
			throw new Error('motor_stroke_limit must be between 0 and 100');
		}
		buffer.writeUInt8(payload.motor_stroke_limit);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x6c
	if ('temperature_calibration_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x6c);
		// 0：Disable, 1：Enable
		buffer.writeUInt8(payload.temperature_calibration_settings.enable);
		if (payload.temperature_calibration_settings.calibration_value < -60 || payload.temperature_calibration_settings.calibration_value > 60) {
			throw new Error('temperature_calibration_settings.calibration_value must be between -60 and 60');
		}
		buffer.writeInt16LE(payload.temperature_calibration_settings.calibration_value * 100);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x6d
	if ('temperature_alarm_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x6d);
		// 0：Disable, 1：Enable
		buffer.writeUInt8(payload.temperature_alarm_settings.enable);
		// 0:Disable, 1:Condition: x<A, 2:Condition: x>B, 4:Condition: x<A or x>B
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
	//0x6e
	if ('schedule_settings' in payload) {
		var buffer = new Buffer();
		for (var schedule_settings_id = 0; schedule_settings_id < (payload.schedule_settings && payload.schedule_settings.length); schedule_settings_id++) {
			var schedule_settings_item = payload.schedule_settings[schedule_settings_id];
			var schedule_settings_item_id = schedule_settings_item.id;
			if (isValid(schedule_settings_item.enable)) {
				buffer.writeUInt8(0x6e);
				buffer.writeUInt8(schedule_settings_item_id);
				// 0：Disable, 1：Enable
				buffer.writeUInt8(0x00);
				// 0：Disable, 1：Enable
				buffer.writeUInt8(schedule_settings_item.enable);
			}
			if (isValid(schedule_settings_item.start_time)) {
				buffer.writeUInt8(0x6e);
				buffer.writeUInt8(schedule_settings_item_id);
				buffer.writeUInt8(0x01);
				buffer.writeUInt16LE(schedule_settings_item.start_time);
			}
			if (isValid(schedule_settings_item.cycle_settings)) {
				buffer.writeUInt8(0x6e);
				buffer.writeUInt8(schedule_settings_item_id);
				buffer.writeUInt8(0x02);
				var bitOptions = 0;
				// 0：Disable, 1：Enable
				bitOptions |= schedule_settings_item.cycle_settings.execution_day_sun << 0;

				// 0：Disable, 1：Enable
				bitOptions |= schedule_settings_item.cycle_settings.execution_day_mon << 1;

				// 0：Disable, 1：Enable
				bitOptions |= schedule_settings_item.cycle_settings.execution_day_tues << 2;

				// 0：Disable, 1：Enable
				bitOptions |= schedule_settings_item.cycle_settings.execution_day_wed << 3;

				// 0：Disable, 1：Enable
				bitOptions |= schedule_settings_item.cycle_settings.execution_day_thur << 4;

				// 0：Disable, 1：Enable
				bitOptions |= schedule_settings_item.cycle_settings.execution_day_fri << 5;

				// 0：Disable, 1：Enable
				bitOptions |= schedule_settings_item.cycle_settings.execution_day_sat << 6;

				bitOptions |= schedule_settings_item.cycle_settings.reserved << 7;
				buffer.writeUInt8(bitOptions);

			}
			if (isValid(schedule_settings_item.temperature_control_mode)) {
				buffer.writeUInt8(0x6e);
				buffer.writeUInt8(schedule_settings_item_id);
				// 0：Automatic Temperature Control, 1：Valve Opening Control, 2：Integrated Control
				buffer.writeUInt8(0x03);
				// 0：Automatic Temperature Control, 1：Valve Opening Control, 2：Integrated Control
				buffer.writeUInt8(schedule_settings_item.temperature_control_mode);
			}
			if (isValid(schedule_settings_item.target_temperature)) {
				buffer.writeUInt8(0x6e);
				buffer.writeUInt8(schedule_settings_item_id);
				buffer.writeUInt8(0x04);
				if (schedule_settings_item.target_temperature < 5 || schedule_settings_item.target_temperature > 35) {
					throw new Error('target_temperature must be between 5 and 35');
				}
				buffer.writeInt16LE(schedule_settings_item.target_temperature * 100);
			}
			if (isValid(schedule_settings_item.target_valve_status)) {
				buffer.writeUInt8(0x6e);
				buffer.writeUInt8(schedule_settings_item_id);
				buffer.writeUInt8(0x05);
				if (schedule_settings_item.target_valve_status < 0 || schedule_settings_item.target_valve_status > 100) {
					throw new Error('target_valve_status must be between 0 and 100');
				}
				buffer.writeUInt8(schedule_settings_item.target_valve_status);
			}
			if (isValid(schedule_settings_item.pre_heating_enable)) {
				buffer.writeUInt8(0x6e);
				buffer.writeUInt8(schedule_settings_item_id);
				// 0：Disable, 1：Enable
				buffer.writeUInt8(0x06);
				// 0：Disable, 1：Enable
				buffer.writeUInt8(schedule_settings_item.pre_heating_enable);
			}
			if (isValid(schedule_settings_item.pre_heating_mode)) {
				buffer.writeUInt8(0x6e);
				buffer.writeUInt8(schedule_settings_item_id);
				// 0：Auto, 1：Manual
				buffer.writeUInt8(0x07);
				// 0：Auto, 1：Manual
				buffer.writeUInt8(schedule_settings_item.pre_heating_mode);
			}
			if (isValid(schedule_settings_item.pre_heating_manual_time)) {
				buffer.writeUInt8(0x6e);
				buffer.writeUInt8(schedule_settings_item_id);
				buffer.writeUInt8(0x08);
				if (schedule_settings_item.pre_heating_manual_time < 1 || schedule_settings_item.pre_heating_manual_time > 1440) {
					throw new Error('pre_heating_manual_time must be between 1 and 1440');
				}
				buffer.writeUInt16LE(schedule_settings_item.pre_heating_manual_time);
			}
			if (isValid(schedule_settings_item.report_cycle)) {
				buffer.writeUInt8(0x6e);
				buffer.writeUInt8(schedule_settings_item_id);
				buffer.writeUInt8(0x09);
				if (schedule_settings_item.report_cycle < 1 || schedule_settings_item.report_cycle > 1440) {
					throw new Error('report_cycle must be between 1 and 1440');
				}
				buffer.writeUInt16LE(schedule_settings_item.report_cycle);
			}
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x6f
	if ('change_report_enable' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x6f);
		// 0：Disable, 1：Enable
		buffer.writeUInt8(payload.change_report_enable);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x70
	if ('motor_controllable_range' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x70);
		// 0：Disable, 1：Enable
		buffer.writeUInt8(payload.motor_controllable_range.enable);
		if (payload.motor_controllable_range.distance < 0 || payload.motor_controllable_range.distance > 666) {
			throw new Error('motor_controllable_range.distance must be between 0 and 666');
		}
		buffer.writeUInt16LE(payload.motor_controllable_range.distance * 100);
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
		// 0：Disable, 1：Enable
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
			// 0：Disable, 1：Enable
			buffer.writeUInt8(0x00);
			// 0：Disable, 1：Enable
			buffer.writeUInt8(payload.data_storage_settings.enable);
		}
		if (isValid(payload.data_storage_settings.retransmission_enable)) {
			buffer.writeUInt8(0xc5);
			// 0：Disable, 1：Enable
			buffer.writeUInt8(0x01);
			// 0：Disable, 1：Enable
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
	//0xb6
	if ('reconnect' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xb6);
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
	//0xb7
	if ('set_time' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xb7);
		buffer.writeUInt32LE(payload.set_time.timestamp);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xb5
	if ('collect_data' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xb5);
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
	//0x57
	if ('query_motor_stroke_position' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x57);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x58
	if ('calibrate_motor' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x58);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x59
	if ('set_target_valve_opening_degree' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x59);
		if (payload.set_target_valve_opening_degree.value < 0 || payload.set_target_valve_opening_degree.value > 100) {
			throw new Error('set_target_valve_opening_degree.value must be between 0 and 100');
		}
		buffer.writeUInt8(payload.set_target_valve_opening_degree.value);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x5a
	if ('set_target_temperature' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x5a);
		if (payload.set_target_temperature.value < 5 || payload.set_target_temperature.value > 35) {
			throw new Error('set_target_temperature.value must be between 5 and 35');
		}
		buffer.writeInt16LE(payload.set_target_temperature.value * 100);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x5b
	if ('set_temperature' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x5b);
		if (payload.set_temperature.value < -20 || payload.set_temperature.value > 60) {
			throw new Error('set_temperature.value must be between -20 and 60');
		}
		buffer.writeInt16LE(payload.set_temperature.value * 100);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x5c
	if ('set_occupancy_state' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x5c);
		// 0：Unoccupied, 1：Occupied
		buffer.writeUInt8(payload.set_occupancy_state.state);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x5d
	if ('set_opening_window' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x5d);
		// 0：Normal, 1：Open
		buffer.writeUInt8(payload.set_opening_window.state);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x5e
	if ('delete_schedule' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x5e);
		// 0：Schedule1, 1：Schedule2, 2：Schedule3, 3：Schedule4, 4：Schedule5, 5：Schedule6, 6：Schedule7, 7：Schedule8, 8：Schedule9, 9：Schedule10, 10：Schedule11, 11：Schedule12, 12：Schedule13, 13：Schedule14, 14：Schedule15, 15：Schedule16, 255：Reset All 
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


function cmdMap() {
	return {
		  "request_check_sequence_number": "ff",
		  "request_check_order": "fe",
		  "request_command_queries": "ef",
		  "request_query_all_configurations": "ee",
		  "historical_data_report": "ed",
		  "lorawan_configuration_settings": "cf",
		  "lorawan_configuration_settings.version": "cfd8",
		  "tsl_version": "df",
		  "product_name": "de",
		  "product_pn": "dd",
		  "product_sn": "db",
		  "version": "da",
		  "oem_id": "d9",
		  "device_status": "c8",
		  "product_frequency_band": "d8",
		  "battery": "00",
		  "temperature": "01",
		  "motor_total_stroke": "02",
		  "motor_position": "03",
		  "valve_opening_degree": "04",
		  "motor_calibration_result_report": "05",
		  "target_temperature": "06",
		  "target_valve_opening_degree": "07",
		  "low_battery_alarm": "08",
		  "temperature_alarm": "09",
		  "anti_freeze_protection_alarm": "0a",
		  "mandatory_heating_alarm": "0b",
		  "auto_away_report": "0c",
		  "window_opening_alarm": "0d",
		  "periodic_reporting": "0e",
		  "random_key": "c9",
		  "auto_p_enable": "c4",
		  "temperature_unit": "60",
		  "temperature_source_settings": "61",
		  "environment_temperature_display_enable": "62",
		  "heating_period_settings": "63",
		  "heating_period_settings.heating_date_settings": "6300",
		  "heating_period_settings.heating_period_reporting_interval": "6301",
		  "heating_period_settings.non_heating_period_reporting_interval": "6302",
		  "heating_period_settings.valve_status_control": "6303",
		  "target_temperature_control_settings": "65",
		  "target_temperature_control_settings.enable": "6500",
		  "target_temperature_control_settings.target_temperature_resolution": "6501",
		  "target_temperature_control_settings.under_temperature_side_deadband": "6502",
		  "target_temperature_control_settings.over_temperature_side_deadband": "6503",
		  "target_temperature_control_settings.target_temperature_adjustment_range_min": "6504",
		  "target_temperature_control_settings.target_temperature_adjustment_range_max": "6505",
		  "target_temperature_control_settings.mode_settings": "6506",
		  "window_opening_detection_settings": "66",
		  "auto_away_settings": "67",
		  "anti_freeze_protection_setting": "68",
		  "mandatory_heating_enable": "69",
		  "child_lock": "6a",
		  "motor_stroke_limit": "6b",
		  "temperature_calibration_settings": "6c",
		  "temperature_alarm_settings": "6d",
		  "schedule_settings": "6e",
		  "schedule_settings._item": "6exx",
		  "schedule_settings._item.enable": "6exx00",
		  "schedule_settings._item.start_time": "6exx01",
		  "schedule_settings._item.cycle_settings": "6exx02",
		  "schedule_settings._item.temperature_control_mode": "6exx03",
		  "schedule_settings._item.target_temperature": "6exx04",
		  "schedule_settings._item.target_valve_status": "6exx05",
		  "schedule_settings._item.pre_heating_enable": "6exx06",
		  "schedule_settings._item.pre_heating_mode": "6exx07",
		  "schedule_settings._item.pre_heating_manual_time": "6exx08",
		  "schedule_settings._item.report_cycle": "6exx09",
		  "change_report_enable": "6f",
		  "motor_controllable_range": "70",
		  "time_zone": "c7",
		  "daylight_saving_time": "c6",
		  "data_storage_settings": "c5",
		  "data_storage_settings.enable": "c500",
		  "data_storage_settings.retransmission_enable": "c501",
		  "data_storage_settings.retransmission_interval": "c502",
		  "data_storage_settings.retrieval_interval": "c503",
		  "reconnect": "b6",
		  "query_device_status": "b9",
		  "synchronize_time": "b8",
		  "set_time": "b7",
		  "collect_data": "b5",
		  "clear_historical_data": "bd",
		  "stop_historical_data_retrieval": "bc",
		  "retrieve_historical_data_by_time_range": "bb",
		  "retrieve_historical_data_by_time": "ba",
		  "query_motor_stroke_position": "57",
		  "calibrate_motor": "58",
		  "set_target_valve_opening_degree": "59",
		  "set_target_temperature": "5a",
		  "set_temperature": "5b",
		  "set_occupancy_state": "5c",
		  "set_opening_window": "5d",
		  "delete_schedule": "5e",
		  "reset": "bf",
		  "reboot": "be"
	};
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
