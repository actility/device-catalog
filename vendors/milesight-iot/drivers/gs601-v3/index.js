/**
 * Payload Decoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product GS601
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
			case 0xfe:
				decoded.check_order_reply = decoded.check_order_reply || {};
				decoded.check_order_reply.order = readUInt8(bytes, counterObj, 1);
				break;
			case 0xf4:
				decoded.full_inspection_reply = decoded.full_inspection_reply || {};
				var full_inspection_reply_command = readUInt8(bytes, counterObj, 1);
				if (full_inspection_reply_command == 0x00) {
					decoded.full_inspection_reply.start_inspection = decoded.full_inspection_reply.start_inspection || {};
					// 0：success, 1：failed
					decoded.full_inspection_reply.start_inspection.result = readUInt8(bytes, counterObj, 1);
				}
				if (full_inspection_reply_command == 0x01) {
					decoded.full_inspection_reply.control = decoded.full_inspection_reply.control || {};
					// 0：success, 1：failed
					decoded.full_inspection_reply.control.result = readUInt8(bytes, counterObj, 1);
				}
				if (full_inspection_reply_command == 0x02) {
					decoded.full_inspection_reply.reading = decoded.full_inspection_reply.reading || {};
					decoded.full_inspection_reply.reading.length = readUInt16LE(bytes, counterObj, 2);
					decoded.full_inspection_reply.reading.data = readBytes(bytes, counterObj, decoded.full_inspection_reply.reading.length);
				}
				if (full_inspection_reply_command == 0x03) {
					decoded.full_inspection_reply.end_inspection = decoded.full_inspection_reply.end_inspection || {};
					// 0：success, 1：failed
					decoded.full_inspection_reply.end_inspection.result = readUInt8(bytes, counterObj, 1);
				}
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
			case 0xcf:
				decoded.lorawan_configuration_settings = decoded.lorawan_configuration_settings || {};
				var lorawan_configuration_settings_command = readUInt8(bytes, counterObj, 1);
				if (lorawan_configuration_settings_command == 0x00) {
					// 0:ClassA, 1:ClassB, 2:ClassC, 3:ClassC to B
					decoded.lorawan_configuration_settings.mode = readUInt8(bytes, counterObj, 1);
				}
				break;
			case 0xdf:
				decoded.tsl_version = readProtocolVersion(readBytes(bytes, counterObj, 2));
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
			case 0x00:
				decoded.battery = readUInt8(bytes, counterObj, 1);
				break;
			case 0x01:
				decoded.vaping_index = readUInt8(bytes, counterObj, 1);
				break;
			case 0x02:
				decoded.vaping_index_alarm = decoded.vaping_index_alarm || {};
				decoded.vaping_index_alarm.type = readUInt8(bytes, counterObj, 1);
				if (decoded.vaping_index_alarm.type == 0x00) {
					decoded.vaping_index_alarm.collection_error = decoded.vaping_index_alarm.collection_error || {};
				}
				if (decoded.vaping_index_alarm.type == 0x01) {
					decoded.vaping_index_alarm.lower_range_error = decoded.vaping_index_alarm.lower_range_error || {};
				}
				if (decoded.vaping_index_alarm.type == 0x02) {
					decoded.vaping_index_alarm.over_range_error = decoded.vaping_index_alarm.over_range_error || {};
				}
				if (decoded.vaping_index_alarm.type == 0x10) {
					decoded.vaping_index_alarm.alarm_deactivation = decoded.vaping_index_alarm.alarm_deactivation || {};
					decoded.vaping_index_alarm.alarm_deactivation.vaping_index = readUInt8(bytes, counterObj, 1);
					decoded.vaping_index = decoded.vaping_index_alarm.alarm_deactivation.vaping_index;
				}
				if (decoded.vaping_index_alarm.type == 0x11) {
					decoded.vaping_index_alarm.alarm_trigger = decoded.vaping_index_alarm.alarm_trigger || {};
					decoded.vaping_index_alarm.alarm_trigger.vaping_index = readUInt8(bytes, counterObj, 1);
					decoded.vaping_index = decoded.vaping_index_alarm.alarm_trigger.vaping_index;
				}
				if (decoded.vaping_index_alarm.type == 0x20) {
					decoded.vaping_index_alarm.interference_alarm_deactivation = decoded.vaping_index_alarm.interference_alarm_deactivation || {};
				}
				if (decoded.vaping_index_alarm.type == 0x21) {
					decoded.vaping_index_alarm.interference_alarm_trigger = decoded.vaping_index_alarm.interference_alarm_trigger || {};
				}
				break;
			case 0x03:
				decoded.pm1_0 = readUInt16LE(bytes, counterObj, 2);
				break;
			case 0x04:
				decoded.pm1_0_alarm = decoded.pm1_0_alarm || {};
				decoded.pm1_0_alarm.type = readUInt8(bytes, counterObj, 1);
				if (decoded.pm1_0_alarm.type == 0x00) {
					decoded.pm1_0_alarm.collection_error = decoded.pm1_0_alarm.collection_error || {};
				}
				if (decoded.pm1_0_alarm.type == 0x01) {
					decoded.pm1_0_alarm.lower_range_error = decoded.pm1_0_alarm.lower_range_error || {};
				}
				if (decoded.pm1_0_alarm.type == 0x02) {
					decoded.pm1_0_alarm.over_range_error = decoded.pm1_0_alarm.over_range_error || {};
				}
				if (decoded.pm1_0_alarm.type == 0x10) {
					decoded.pm1_0_alarm.alarm_deactivation = decoded.pm1_0_alarm.alarm_deactivation || {};
					decoded.pm1_0_alarm.alarm_deactivation.pm1_0 = readUInt16LE(bytes, counterObj, 2);
					decoded.pm1_0 = decoded.pm1_0_alarm.alarm_deactivation.pm1_0;
				}
				if (decoded.pm1_0_alarm.type == 0x11) {
					decoded.pm1_0_alarm.alarm_trigger = decoded.pm1_0_alarm.alarm_trigger || {};
					decoded.pm1_0_alarm.alarm_trigger.pm1_0 = readUInt16LE(bytes, counterObj, 2);
					decoded.pm1_0 = decoded.pm1_0_alarm.alarm_trigger.pm1_0;
				}
				break;
			case 0x05:
				decoded.pm2_5 = readUInt16LE(bytes, counterObj, 2);
				break;
			case 0x06:
				decoded.pm2_5_alarm = decoded.pm2_5_alarm || {};
				decoded.pm2_5_alarm.type = readUInt8(bytes, counterObj, 1);
				if (decoded.pm2_5_alarm.type == 0x00) {
					decoded.pm2_5_alarm.collection_error = decoded.pm2_5_alarm.collection_error || {};
				}
				if (decoded.pm2_5_alarm.type == 0x01) {
					decoded.pm2_5_alarm.lower_range_error = decoded.pm2_5_alarm.lower_range_error || {};
				}
				if (decoded.pm2_5_alarm.type == 0x02) {
					decoded.pm2_5_alarm.over_range_error = decoded.pm2_5_alarm.over_range_error || {};
				}
				if (decoded.pm2_5_alarm.type == 0x10) {
					decoded.pm2_5_alarm.alarm_deactivation = decoded.pm2_5_alarm.alarm_deactivation || {};
					decoded.pm2_5_alarm.alarm_deactivation.pm2_5 = readUInt16LE(bytes, counterObj, 2);
					decoded.pm2_5 = decoded.pm2_5_alarm.alarm_deactivation.pm2_5;
				}
				if (decoded.pm2_5_alarm.type == 0x11) {
					decoded.pm2_5_alarm.alarm_trigger = decoded.pm2_5_alarm.alarm_trigger || {};
					decoded.pm2_5_alarm.alarm_trigger.pm2_5 = readUInt16LE(bytes, counterObj, 2);
					decoded.pm2_5 = decoded.pm2_5_alarm.alarm_trigger.pm2_5;
				}
				break;
			case 0x07:
				decoded.pm10 = readUInt16LE(bytes, counterObj, 2);
				break;
			case 0x08:
				decoded.pm10_alarm = decoded.pm10_alarm || {};
				decoded.pm10_alarm.type = readUInt8(bytes, counterObj, 1);
				if (decoded.pm10_alarm.type == 0x00) {
					decoded.pm10_alarm.collection_error = decoded.pm10_alarm.collection_error || {};
				}
				if (decoded.pm10_alarm.type == 0x01) {
					decoded.pm10_alarm.lower_range_error = decoded.pm10_alarm.lower_range_error || {};
				}
				if (decoded.pm10_alarm.type == 0x02) {
					decoded.pm10_alarm.over_range_error = decoded.pm10_alarm.over_range_error || {};
				}
				if (decoded.pm10_alarm.type == 0x10) {
					decoded.pm10_alarm.alarm_deactivation = decoded.pm10_alarm.alarm_deactivation || {};
					decoded.pm10_alarm.alarm_deactivation.pm10 = readUInt16LE(bytes, counterObj, 2);
					decoded.pm10 = decoded.pm10_alarm.alarm_deactivation.pm10;
				}
				if (decoded.pm10_alarm.type == 0x11) {
					decoded.pm10_alarm.alarm_trigger = decoded.pm10_alarm.alarm_trigger || {};
					decoded.pm10_alarm.alarm_trigger.pm10 = readUInt16LE(bytes, counterObj, 2);
					decoded.pm10 = decoded.pm10_alarm.alarm_trigger.pm10;
				}
				break;
			case 0x09:
				decoded.temperature = readInt16LE(bytes, counterObj, 2) / 10;
				break;
			case 0x0a:
				decoded.temperature_alarm = decoded.temperature_alarm || {};
				decoded.temperature_alarm.type = readUInt8(bytes, counterObj, 1);
				if (decoded.temperature_alarm.type == 0x00) {
					decoded.temperature_alarm.collection_error = decoded.temperature_alarm.collection_error || {};
				}
				if (decoded.temperature_alarm.type == 0x01) {
					decoded.temperature_alarm.lower_range_error = decoded.temperature_alarm.lower_range_error || {};
				}
				if (decoded.temperature_alarm.type == 0x02) {
					decoded.temperature_alarm.over_range_error = decoded.temperature_alarm.over_range_error || {};
				}
				if (decoded.temperature_alarm.type == 0x10) {
					decoded.temperature_alarm.alarm_deactivation = decoded.temperature_alarm.alarm_deactivation || {};
					decoded.temperature_alarm.alarm_deactivation.temperature = readInt16LE(bytes, counterObj, 2) / 10;
					decoded.temperature = decoded.temperature_alarm.alarm_deactivation.temperature;
				}
				if (decoded.temperature_alarm.type == 0x11) {
					decoded.temperature_alarm.alarm_trigger = decoded.temperature_alarm.alarm_trigger || {};
					decoded.temperature_alarm.alarm_trigger.temperature = readInt16LE(bytes, counterObj, 2) / 10;
					decoded.temperature = decoded.temperature_alarm.alarm_trigger.temperature;
				}
				if (decoded.temperature_alarm.type == 0x20) {
					decoded.temperature_alarm.burning_alarm_deactivation = decoded.temperature_alarm.burning_alarm_deactivation || {};
				}
				if (decoded.temperature_alarm.type == 0x21) {
					decoded.temperature_alarm.burning_alarm_trigger = decoded.temperature_alarm.burning_alarm_trigger || {};
				}
				break;
			case 0x0b:
				decoded.humidity = readUInt16LE(bytes, counterObj, 2) / 10;
				break;
			case 0x0c:
				decoded.humidity_alarm = decoded.humidity_alarm || {};
				decoded.humidity_alarm.type = readUInt8(bytes, counterObj, 1);
				if (decoded.humidity_alarm.type == 0x00) {
					decoded.humidity_alarm.collection_error = decoded.humidity_alarm.collection_error || {};
				}
				if (decoded.humidity_alarm.type == 0x01) {
					decoded.humidity_alarm.lower_range_error = decoded.humidity_alarm.lower_range_error || {};
				}
				if (decoded.humidity_alarm.type == 0x02) {
					decoded.humidity_alarm.over_range_error = decoded.humidity_alarm.over_range_error || {};
				}
				break;
			case 0x0d:
				decoded.tvoc = readUInt16LE(bytes, counterObj, 2);
				break;
			case 0x0e:
				decoded.tvoc_alarm = decoded.tvoc_alarm || {};
				decoded.tvoc_alarm.type = readUInt8(bytes, counterObj, 1);
				if (decoded.tvoc_alarm.type == 0x00) {
					decoded.tvoc_alarm.collection_error = decoded.tvoc_alarm.collection_error || {};
				}
				if (decoded.tvoc_alarm.type == 0x01) {
					decoded.tvoc_alarm.lower_range_error = decoded.tvoc_alarm.lower_range_error || {};
				}
				if (decoded.tvoc_alarm.type == 0x02) {
					decoded.tvoc_alarm.over_range_error = decoded.tvoc_alarm.over_range_error || {};
				}
				if (decoded.tvoc_alarm.type == 0x10) {
					decoded.tvoc_alarm.alarm_deactivation = decoded.tvoc_alarm.alarm_deactivation || {};
					decoded.tvoc_alarm.alarm_deactivation.tvoc = readUInt16LE(bytes, counterObj, 2);
					decoded.tvoc = decoded.tvoc_alarm.alarm_deactivation.tvoc;
				}
				if (decoded.tvoc_alarm.type == 0x11) {
					decoded.tvoc_alarm.alarm_trigger = decoded.tvoc_alarm.alarm_trigger || {};
					decoded.tvoc_alarm.alarm_trigger.tvoc = readUInt16LE(bytes, counterObj, 2);
					decoded.tvoc = decoded.tvoc_alarm.alarm_trigger.tvoc;
				}
				break;
			case 0x0f:
				// 0：Normal, 1：Triggered
				decoded.tamper_status = readUInt8(bytes, counterObj, 1);
				break;
			case 0x10:
				decoded.tamper_status_alarm = decoded.tamper_status_alarm || {};
				decoded.tamper_status_alarm.type = readUInt8(bytes, counterObj, 1);
				if (decoded.tamper_status_alarm.type == 0x20) {
					decoded.tamper_status_alarm.normal = decoded.tamper_status_alarm.normal || {};
				}
				if (decoded.tamper_status_alarm.type == 0x21) {
					decoded.tamper_status_alarm.trigger = decoded.tamper_status_alarm.trigger || {};
				}
				break;
			case 0x11:
				// 0：Normal, 1：Triggered
				decoded.buzzer = readUInt8(bytes, counterObj, 1);
				break;
			case 0x12:
				// 0：vacant, 1：occuppied
				decoded.occupancy_status = readUInt8(bytes, counterObj, 1);
				break;
			case 0x20:
				decoded.tvoc_raw_data_1 = decoded.tvoc_raw_data_1 || {};
				decoded.tvoc_raw_data_1.rmox_0 = readFloatLE(bytes, counterObj, 4);
				decoded.tvoc_raw_data_1.rmox_1 = readFloatLE(bytes, counterObj, 4);
				break;
			case 0x21:
				decoded.tvoc_raw_data_2 = decoded.tvoc_raw_data_2 || {};
				decoded.tvoc_raw_data_2.rmox_2 = readFloatLE(bytes, counterObj, 4);
				decoded.tvoc_raw_data_2.rmox_3 = readFloatLE(bytes, counterObj, 4);
				break;
			case 0x22:
				decoded.tvoc_raw_data_3 = decoded.tvoc_raw_data_3 || {};
				decoded.tvoc_raw_data_3.rmox_4 = readFloatLE(bytes, counterObj, 4);
				decoded.tvoc_raw_data_3.rmox_5 = readFloatLE(bytes, counterObj, 4);
				break;
			case 0x23:
				decoded.tvoc_raw_data_4 = decoded.tvoc_raw_data_4 || {};
				decoded.tvoc_raw_data_4.rmox_6 = readFloatLE(bytes, counterObj, 4);
				decoded.tvoc_raw_data_4.rmox_7 = readFloatLE(bytes, counterObj, 4);
				break;
			case 0x24:
				decoded.tvoc_raw_data_5 = decoded.tvoc_raw_data_5 || {};
				decoded.tvoc_raw_data_5.rmox_8 = readFloatLE(bytes, counterObj, 4);
				decoded.tvoc_raw_data_5.rmox_9 = readFloatLE(bytes, counterObj, 4);
				break;
			case 0x25:
				decoded.tvoc_raw_data_6 = decoded.tvoc_raw_data_6 || {};
				decoded.tvoc_raw_data_6.rmox_10 = readFloatLE(bytes, counterObj, 4);
				decoded.tvoc_raw_data_6.rmox_11 = readFloatLE(bytes, counterObj, 4);
				break;
			case 0x26:
				decoded.tvoc_raw_data_7 = decoded.tvoc_raw_data_7 || {};
				decoded.tvoc_raw_data_7.rmox_12 = readFloatLE(bytes, counterObj, 4);
				decoded.tvoc_raw_data_7.zmod4510_rmox_3 = readFloatLE(bytes, counterObj, 4);
				break;
			case 0x27:
				decoded.tvoc_raw_data_8 = decoded.tvoc_raw_data_8 || {};
				decoded.tvoc_raw_data_8.log_rcda = readFloatLE(bytes, counterObj, 4);
				decoded.tvoc_raw_data_8.rhtr = readFloatLE(bytes, counterObj, 4);
				break;
			case 0x28:
				decoded.tvoc_raw_data_9 = decoded.tvoc_raw_data_9 || {};
				decoded.tvoc_raw_data_9.temperature = readFloatLE(bytes, counterObj, 4);
				decoded.tvoc_raw_data_9.iaq = readFloatLE(bytes, counterObj, 4);
				break;
			case 0x29:
				decoded.tvoc_raw_data_10 = decoded.tvoc_raw_data_10 || {};
				decoded.tvoc_raw_data_10.tvoc = readFloatLE(bytes, counterObj, 4);
				decoded.tvoc_raw_data_10.etoh = readFloatLE(bytes, counterObj, 4);
				break;
			case 0x2a:
				decoded.tvoc_raw_data_11 = decoded.tvoc_raw_data_11 || {};
				decoded.tvoc_raw_data_11.eco2 = readFloatLE(bytes, counterObj, 4);
				decoded.tvoc_raw_data_11.rel_iaq = readFloatLE(bytes, counterObj, 4);
				break;
			case 0x2b:
				decoded.pm_sensor_working_time = readUInt32LE(bytes, counterObj, 4);
				break;
			case 0xc9:
				// 0：disable, 1：enable
				decoded.random_key = readUInt8(bytes, counterObj, 1);
				break;
			case 0xc8:
				// 0：Off, 1：On
				decoded.device_status = readUInt8(bytes, counterObj, 1);
				break;
			case 0x60:
				decoded.reporting_interval = decoded.reporting_interval || {};
				// 0：second, 1：min
				decoded.reporting_interval.unit = readUInt8(bytes, counterObj, 1);
				if (decoded.reporting_interval.unit == 0x00) {
					decoded.reporting_interval.seconds_of_time = readUInt16LE(bytes, counterObj, 2);
				}
				if (decoded.reporting_interval.unit == 0x01) {
					decoded.reporting_interval.minutes_of_time = readUInt16LE(bytes, counterObj, 2);
				}
				break;
			case 0x61:
				// 0：℃, 1：℉
				decoded.temperature_unit = readUInt8(bytes, counterObj, 1);
				break;
			case 0x67:
				// 0：disable, 1：enable
				decoded.tamper_alarm_enable = readUInt8(bytes, counterObj, 1);
				break;
			case 0x62:
				// 0：disable, 1：enable
				decoded.led_status = readUInt8(bytes, counterObj, 1);
				break;
			case 0x63:
				// 0：disable, 1：enable
				decoded.buzzer_enable = readUInt8(bytes, counterObj, 1);
				break;
			case 0x64:
				decoded.buzzer_sleep = decoded.buzzer_sleep || {};
				var buzzer_sleep_type = readUInt8(bytes, counterObj, 1);
				if (buzzer_sleep_type == 0x01) {
					decoded.buzzer_sleep.item_1 = decoded.buzzer_sleep.item_1 || {};
					// 0：disable, 1：enable
					decoded.buzzer_sleep.item_1.enable = readUInt8(bytes, counterObj, 1);
					decoded.buzzer_sleep.item_1.start_time = readUInt16LE(bytes, counterObj, 2);
					decoded.buzzer_sleep.item_1.end_time = readUInt16LE(bytes, counterObj, 2);
				}
				if (buzzer_sleep_type == 0x02) {
					decoded.buzzer_sleep.item_2 = decoded.buzzer_sleep.item_2 || {};
					// 0：disable, 1：enable
					decoded.buzzer_sleep.item_2.enable = readUInt8(bytes, counterObj, 1);
					decoded.buzzer_sleep.item_2.start_time = readUInt16LE(bytes, counterObj, 2);
					decoded.buzzer_sleep.item_2.end_time = readUInt16LE(bytes, counterObj, 2);
				}
				break;
			case 0x65:
				// 0：disable, 1：enable
				decoded.buzzer_button_stop_enable = readUInt8(bytes, counterObj, 1);
				break;
			case 0x66:
				decoded.buzzer_silent_time = readUInt16LE(bytes, counterObj, 2);
				break;
			case 0xc7:
				decoded.time_zone = readInt16LE(bytes, counterObj, 2);
				break;
			case 0xc6:
				decoded.daylight_saving_time = decoded.daylight_saving_time || {};
				// 0：disable, 1：enable
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
			case 0x68:
				// 0：disable, 1：enable
				decoded.tvoc_raw_reporting_enable = readUInt8(bytes, counterObj, 1);
				break;
			case 0x69:
				decoded.temperature_alarm_settings = decoded.temperature_alarm_settings || {};
				// 0：disable, 1：enable
				decoded.temperature_alarm_settings.enable = readUInt8(bytes, counterObj, 1);
				// 0:disable, 1:condition: x<A, 2:condition: x>B, 3:condition: A<x<B, 4:condition: x<A or x>B
				decoded.temperature_alarm_settings.threshold_condition = readUInt8(bytes, counterObj, 1);
				decoded.temperature_alarm_settings.threshold_min = readInt16LE(bytes, counterObj, 2) / 10;
				decoded.temperature_alarm_settings.threshold_max = readInt16LE(bytes, counterObj, 2) / 10;
				break;
			case 0x6a:
				decoded.pm1_0_alarm_settings = decoded.pm1_0_alarm_settings || {};
				// 0：disable, 1：enable
				decoded.pm1_0_alarm_settings.enable = readUInt8(bytes, counterObj, 1);
				// 0:disable, 1:condition: x<A, 2:condition: x>B, 3:condition: A<x<B, 4:condition: x<A or x>B
				decoded.pm1_0_alarm_settings.threshold_condition = readUInt8(bytes, counterObj, 1);
				decoded.pm1_0_alarm_settings.threshold_min = readInt16LE(bytes, counterObj, 2);
				decoded.pm1_0_alarm_settings.threshold_max = readInt16LE(bytes, counterObj, 2);
				break;
			case 0x6b:
				decoded.pm2_5_alarm_settings = decoded.pm2_5_alarm_settings || {};
				// 0：disable, 1：enable
				decoded.pm2_5_alarm_settings.enable = readUInt8(bytes, counterObj, 1);
				// 0:disable, 1:condition: x<A, 2:condition: x>B, 3:condition: A<x<B, 4:condition: x<A or x>B
				decoded.pm2_5_alarm_settings.threshold_condition = readUInt8(bytes, counterObj, 1);
				decoded.pm2_5_alarm_settings.threshold_min = readInt16LE(bytes, counterObj, 2);
				decoded.pm2_5_alarm_settings.threshold_max = readInt16LE(bytes, counterObj, 2);
				break;
			case 0x6c:
				decoded.pm10_alarm_settings = decoded.pm10_alarm_settings || {};
				// 0：disable, 1：enable
				decoded.pm10_alarm_settings.enable = readUInt8(bytes, counterObj, 1);
				// 0:disable, 1:condition: x<A, 2:condition: x>B, 3:condition: A<x<B, 4:condition: x<A or x>B
				decoded.pm10_alarm_settings.threshold_condition = readUInt8(bytes, counterObj, 1);
				decoded.pm10_alarm_settings.threshold_min = readInt16LE(bytes, counterObj, 2);
				decoded.pm10_alarm_settings.threshold_max = readInt16LE(bytes, counterObj, 2);
				break;
			case 0x6d:
				decoded.tvoc_alarm_settings = decoded.tvoc_alarm_settings || {};
				// 0：disable, 1：enable
				decoded.tvoc_alarm_settings.enable = readUInt8(bytes, counterObj, 1);
				// 0:disable, 1:condition: x<A, 2:condition: x>B, 3:condition: A<x<B, 4:condition: x<A or x>B
				decoded.tvoc_alarm_settings.threshold_condition = readUInt8(bytes, counterObj, 1);
				decoded.tvoc_alarm_settings.threshold_min = readInt16LE(bytes, counterObj, 2);
				decoded.tvoc_alarm_settings.threshold_max = readInt16LE(bytes, counterObj, 2);
				break;
			case 0x6e:
				decoded.vaping_index_alarm_settings = decoded.vaping_index_alarm_settings || {};
				// 0：disable, 1：enable
				decoded.vaping_index_alarm_settings.enable = readUInt8(bytes, counterObj, 1);
				// 0:disable, 1:condition: x<A, 2:condition: x>B, 3:condition: A<x<B, 4:condition: x<A or x>B
				decoded.vaping_index_alarm_settings.threshold_condition = readUInt8(bytes, counterObj, 1);
				decoded.vaping_index_alarm_settings.threshold_min = readUInt8(bytes, counterObj, 1);
				decoded.vaping_index_alarm_settings.threshold_max = readUInt8(bytes, counterObj, 1);
				break;
			case 0x6f:
				decoded.alarm_reporting_times = readUInt16LE(bytes, counterObj, 2);
				break;
			case 0x70:
				// 0：disable, 1：enable
				decoded.alarm_deactivation_enable = readUInt8(bytes, counterObj, 1);
				break;
			case 0x71:
				decoded.temperature_calibration_settings = decoded.temperature_calibration_settings || {};
				// 0：disable, 1：enable
				decoded.temperature_calibration_settings.enable = readUInt8(bytes, counterObj, 1);
				decoded.temperature_calibration_settings.calibration_value = readInt16LE(bytes, counterObj, 2) / 10;
				break;
			case 0x72:
				decoded.humidity_calibration_settings = decoded.humidity_calibration_settings || {};
				// 0：disable, 1：enable
				decoded.humidity_calibration_settings.enable = readUInt8(bytes, counterObj, 1);
				decoded.humidity_calibration_settings.calibration_value = readInt16LE(bytes, counterObj, 2) / 10;
				break;
			case 0x73:
				decoded.pm1_0_calibration_settings = decoded.pm1_0_calibration_settings || {};
				// 0：disable, 1：enable
				decoded.pm1_0_calibration_settings.enable = readUInt8(bytes, counterObj, 1);
				decoded.pm1_0_calibration_settings.calibration_value = readInt16LE(bytes, counterObj, 2);
				break;
			case 0x74:
				decoded.pm2_5_calibration_settings = decoded.pm2_5_calibration_settings || {};
				// 0：disable, 1：enable
				decoded.pm2_5_calibration_settings.enable = readUInt8(bytes, counterObj, 1);
				decoded.pm2_5_calibration_settings.calibration_value = readInt16LE(bytes, counterObj, 2);
				break;
			case 0x75:
				decoded.pm10_calibration_settings = decoded.pm10_calibration_settings || {};
				// 0：disable, 1：enable
				decoded.pm10_calibration_settings.enable = readUInt8(bytes, counterObj, 1);
				decoded.pm10_calibration_settings.calibration_value = readInt16LE(bytes, counterObj, 2);
				break;
			case 0x76:
				decoded.tvoc_calibration_settings = decoded.tvoc_calibration_settings || {};
				// 0：disable, 1：enable
				decoded.tvoc_calibration_settings.enable = readUInt8(bytes, counterObj, 1);
				decoded.tvoc_calibration_settings.calibration_value = readInt16LE(bytes, counterObj, 2);
				break;
			case 0x77:
				decoded.vaping_index_calibration_settings = decoded.vaping_index_calibration_settings || {};
				// 0：disable, 1：enable
				decoded.vaping_index_calibration_settings.enable = readUInt8(bytes, counterObj, 1);
				decoded.vaping_index_calibration_settings.calibration_value = readInt8(bytes, counterObj, 1);
				break;
			case 0xbf:
				decoded.reset = readOnlyCommand(bytes, counterObj, 0);
				break;
			case 0xbe:
				decoded.reboot = readOnlyCommand(bytes, counterObj, 0);
				break;
			case 0xbd:
				decoded.clear_historical_data = readOnlyCommand(bytes, counterObj, 0);
				break;
			case 0xbc:
				decoded.stop_historical_data_retrieval = readOnlyCommand(bytes, counterObj, 0);
				break;
			case 0xbb:
				decoded.retrieve_historical_data_by_time = decoded.retrieve_historical_data_by_time || {};
				decoded.retrieve_historical_data_by_time.time = readUInt32LE(bytes, counterObj, 4);
				break;
			case 0xba:
				decoded.retrieve_historical_data_by_time_range = decoded.retrieve_historical_data_by_time_range || {};
				decoded.retrieve_historical_data_by_time_range.start_time = readUInt32LE(bytes, counterObj, 4);
				decoded.retrieve_historical_data_by_time_range.end_time = readUInt32LE(bytes, counterObj, 4);
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
			case 0xb6:
				decoded.reconnect = readOnlyCommand(bytes, counterObj, 0);
				break;
			case 0x5f:
				decoded.stop_buzzer_alarm = readOnlyCommand(bytes, counterObj, 0);
				break;
			case 0x5e:
				decoded.execute_tvoc_self_clean = readOnlyCommand(bytes, counterObj, 0);
				break;
			default:
				unknown_command = 1;
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

	processTemperature(result);

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

	var version = 'v' + major + '.' + minor;
	if (release !== '0') version += '-r' + release;
	if (alpha !== '0') version += '-a' + alpha;
	if (unit_test !== '0') version += '-u' + unit_test;
	if (test !== '0') version += '-t' + test;
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
		  "10": "tamper_status_alarm",
		  "11": "buzzer",
		  "12": "occupancy_status",
		  "20": "tvoc_raw_data_1",
		  "21": "tvoc_raw_data_2",
		  "22": "tvoc_raw_data_3",
		  "23": "tvoc_raw_data_4",
		  "24": "tvoc_raw_data_5",
		  "25": "tvoc_raw_data_6",
		  "26": "tvoc_raw_data_7",
		  "27": "tvoc_raw_data_8",
		  "28": "tvoc_raw_data_9",
		  "29": "tvoc_raw_data_10",
		  "60": "reporting_interval",
		  "61": "temperature_unit",
		  "62": "led_status",
		  "63": "buzzer_enable",
		  "64": "buzzer_sleep",
		  "65": "buzzer_button_stop_enable",
		  "66": "buzzer_silent_time",
		  "67": "tamper_alarm_enable",
		  "68": "tvoc_raw_reporting_enable",
		  "69": "temperature_alarm_settings",
		  "70": "alarm_deactivation_enable",
		  "71": "temperature_calibration_settings",
		  "72": "humidity_calibration_settings",
		  "73": "pm1_0_calibration_settings",
		  "74": "pm2_5_calibration_settings",
		  "75": "pm10_calibration_settings",
		  "76": "tvoc_calibration_settings",
		  "77": "vaping_index_calibration_settings",
		  "1020": "tamper_status_alarm.normal",
		  "1021": "tamper_status_alarm.trigger",
		  "6000": "reporting_interval.seconds_of_time",
		  "6001": "reporting_interval.minutes_of_time",
		  "6401": "buzzer_sleep.item_1",
		  "6402": "buzzer_sleep.item_2",
		  "fe": "request_check_order",
		  "f4": "request_full_inspection",
		  "f400": "request_full_inspection.start_inspection",
		  "f401": "request_full_inspection.control",
		  "f402": "request_full_inspection.reading",
		  "f403": "request_full_inspection.end_inspection",
		  "ef": "request_command_queries",
		  "ee": "all_configurations_request_by_device",
		  "cf": "lorawan_configuration_settings",
		  "cf00": "lorawan_configuration_settings.mode",
		  "df": "tsl_version",
		  "db": "product_sn",
		  "da": "version",
		  "d9": "oem_id",
		  "00": "battery",
		  "01": "vaping_index",
		  "02": "vaping_index_alarm",
		  "0200": "vaping_index_alarm.collection_error",
		  "0201": "vaping_index_alarm.lower_range_error",
		  "0202": "vaping_index_alarm.over_range_error",
		  "0210": "vaping_index_alarm.alarm_deactivation",
		  "0211": "vaping_index_alarm.alarm_trigger",
		  "0220": "vaping_index_alarm.interference_alarm_deactivation",
		  "0221": "vaping_index_alarm.interference_alarm_trigger",
		  "03": "pm1_0",
		  "04": "pm1_0_alarm",
		  "0400": "pm1_0_alarm.collection_error",
		  "0401": "pm1_0_alarm.lower_range_error",
		  "0402": "pm1_0_alarm.over_range_error",
		  "0410": "pm1_0_alarm.alarm_deactivation",
		  "0411": "pm1_0_alarm.alarm_trigger",
		  "05": "pm2_5",
		  "06": "pm2_5_alarm",
		  "0600": "pm2_5_alarm.collection_error",
		  "0601": "pm2_5_alarm.lower_range_error",
		  "0602": "pm2_5_alarm.over_range_error",
		  "0610": "pm2_5_alarm.alarm_deactivation",
		  "0611": "pm2_5_alarm.alarm_trigger",
		  "07": "pm10",
		  "08": "pm10_alarm",
		  "0800": "pm10_alarm.collection_error",
		  "0801": "pm10_alarm.lower_range_error",
		  "0802": "pm10_alarm.over_range_error",
		  "0810": "pm10_alarm.alarm_deactivation",
		  "0811": "pm10_alarm.alarm_trigger",
		  "09": "temperature",
		  "0a": "temperature_alarm",
		  "0a00": "temperature_alarm.collection_error",
		  "0a01": "temperature_alarm.lower_range_error",
		  "0a02": "temperature_alarm.over_range_error",
		  "0a10": "temperature_alarm.alarm_deactivation",
		  "0a11": "temperature_alarm.alarm_trigger",
		  "0a20": "temperature_alarm.burning_alarm_deactivation",
		  "0a21": "temperature_alarm.burning_alarm_trigger",
		  "0b": "humidity",
		  "0c": "humidity_alarm",
		  "0c00": "humidity_alarm.collection_error",
		  "0c01": "humidity_alarm.lower_range_error",
		  "0c02": "humidity_alarm.over_range_error",
		  "0d": "tvoc",
		  "0e": "tvoc_alarm",
		  "0e00": "tvoc_alarm.collection_error",
		  "0e01": "tvoc_alarm.lower_range_error",
		  "0e02": "tvoc_alarm.over_range_error",
		  "0e10": "tvoc_alarm.alarm_deactivation",
		  "0e11": "tvoc_alarm.alarm_trigger",
		  "0f": "tamper_status",
		  "2a": "tvoc_raw_data_11",
		  "2b": "pm_sensor_working_time",
		  "c9": "random_key",
		  "c8": "device_status",
		  "c7": "time_zone",
		  "c6": "daylight_saving_time",
		  "6a": "pm1_0_alarm_settings",
		  "6b": "pm2_5_alarm_settings",
		  "6c": "pm10_alarm_settings",
		  "6d": "tvoc_alarm_settings",
		  "6e": "vaping_index_alarm_settings",
		  "6f": "alarm_reporting_times",
		  "bf": "reset",
		  "be": "reboot",
		  "bd": "clear_historical_data",
		  "bc": "stop_historical_data_retrieval",
		  "bb": "retrieve_historical_data_by_time",
		  "ba": "retrieve_historical_data_by_time_range",
		  "b9": "query_device_status",
		  "b8": "synchronize_time",
		  "b7": "set_time",
		  "b6": "reconnect",
		  "5f": "stop_buzzer_alarm",
		  "5e": "execute_tvoc_self_clean"
	};
}
function processTemperature(decoded) {
	var allTemperatureProperties = {
    "temperature": {
        "precision": 1
    },
    "temperature_alarm.alarm_deactivation.temperature": {
        "precision": 1
    },
    "temperature_alarm.alarm_trigger.temperature": {
        "precision": 1
    },
    "temperature_alarm_settings.threshold_min": {
        "precision": 1
    },
    "temperature_alarm_settings.threshold_max": {
        "precision": 1
    },
    "temperature_calibration_settings.calibration_value": {
        "precision": 1
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
			if (hasPath(decoded, propertyId)) {
				setPath(decoded, fahrenheitProperty,  Number((getPath(decoded, propertyId) * 1.8 + 32).toFixed(allTemperatureProperties[newPropertyId].precision)));
				setPath(decoded, celsiusProperty,  Number(getPath(decoded, propertyId).toFixed(allTemperatureProperties[newPropertyId].precision)));
			}
		}	
	}	
	return decoded;
}

var __milesightDownlinkCodec = (function () {
/**
 * Payload Encoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product GS601
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
	if ('vaping_index' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x01);
		if (payload.vaping_index < 0 || payload.vaping_index > 100) {
			throw new Error('vaping_index must be between 0 and 100');
		}
		buffer.writeUInt8(payload.vaping_index);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x02
	if ('vaping_index_alarm' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x02);
		buffer.writeUInt8(payload.vaping_index_alarm.type);
		if (payload.vaping_index_alarm.type == 0x00) {
		}
		if (payload.vaping_index_alarm.type == 0x01) {
		}
		if (payload.vaping_index_alarm.type == 0x02) {
		}
		if (payload.vaping_index_alarm.type == 0x10) {
			if (payload.vaping_index_alarm.alarm_deactivation.vaping_index < 0 || payload.vaping_index_alarm.alarm_deactivation.vaping_index > 100) {
				throw new Error('vaping_index_alarm.alarm_deactivation.vaping_index must be between 0 and 100');
			}
			buffer.writeUInt8(payload.vaping_index_alarm.alarm_deactivation.vaping_index);
		}
		if (payload.vaping_index_alarm.type == 0x11) {
			if (payload.vaping_index_alarm.alarm_trigger.vaping_index < 0 || payload.vaping_index_alarm.alarm_trigger.vaping_index > 100) {
				throw new Error('vaping_index_alarm.alarm_trigger.vaping_index must be between 0 and 100');
			}
			buffer.writeUInt8(payload.vaping_index_alarm.alarm_trigger.vaping_index);
		}
		if (payload.vaping_index_alarm.type == 0x20) {
		}
		if (payload.vaping_index_alarm.type == 0x21) {
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x03
	if ('pm1_0' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x03);
		if (payload.pm1_0 < 0 || payload.pm1_0 > 1000) {
			throw new Error('pm1_0 must be between 0 and 1000');
		}
		buffer.writeUInt16LE(payload.pm1_0);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x04
	if ('pm1_0_alarm' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x04);
		buffer.writeUInt8(payload.pm1_0_alarm.type);
		if (payload.pm1_0_alarm.type == 0x00) {
		}
		if (payload.pm1_0_alarm.type == 0x01) {
		}
		if (payload.pm1_0_alarm.type == 0x02) {
		}
		if (payload.pm1_0_alarm.type == 0x10) {
			if (payload.pm1_0_alarm.alarm_deactivation.pm1_0 < 0 || payload.pm1_0_alarm.alarm_deactivation.pm1_0 > 1000) {
				throw new Error('pm1_0_alarm.alarm_deactivation.pm1_0 must be between 0 and 1000');
			}
			buffer.writeUInt16LE(payload.pm1_0_alarm.alarm_deactivation.pm1_0);
		}
		if (payload.pm1_0_alarm.type == 0x11) {
			if (payload.pm1_0_alarm.alarm_trigger.pm1_0 < 0 || payload.pm1_0_alarm.alarm_trigger.pm1_0 > 1000) {
				throw new Error('pm1_0_alarm.alarm_trigger.pm1_0 must be between 0 and 1000');
			}
			buffer.writeUInt16LE(payload.pm1_0_alarm.alarm_trigger.pm1_0);
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x05
	if ('pm2_5' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x05);
		if (payload.pm2_5 < 0 || payload.pm2_5 > 1000) {
			throw new Error('pm2_5 must be between 0 and 1000');
		}
		buffer.writeUInt16LE(payload.pm2_5);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x06
	if ('pm2_5_alarm' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x06);
		buffer.writeUInt8(payload.pm2_5_alarm.type);
		if (payload.pm2_5_alarm.type == 0x00) {
		}
		if (payload.pm2_5_alarm.type == 0x01) {
		}
		if (payload.pm2_5_alarm.type == 0x02) {
		}
		if (payload.pm2_5_alarm.type == 0x10) {
			if (payload.pm2_5_alarm.alarm_deactivation.pm2_5 < 0 || payload.pm2_5_alarm.alarm_deactivation.pm2_5 > 1000) {
				throw new Error('pm2_5_alarm.alarm_deactivation.pm2_5 must be between 0 and 1000');
			}
			buffer.writeUInt16LE(payload.pm2_5_alarm.alarm_deactivation.pm2_5);
		}
		if (payload.pm2_5_alarm.type == 0x11) {
			if (payload.pm2_5_alarm.alarm_trigger.pm2_5 < 0 || payload.pm2_5_alarm.alarm_trigger.pm2_5 > 1000) {
				throw new Error('pm2_5_alarm.alarm_trigger.pm2_5 must be between 0 and 1000');
			}
			buffer.writeUInt16LE(payload.pm2_5_alarm.alarm_trigger.pm2_5);
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x07
	if ('pm10' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x07);
		if (payload.pm10 < 0 || payload.pm10 > 1000) {
			throw new Error('pm10 must be between 0 and 1000');
		}
		buffer.writeUInt16LE(payload.pm10);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x08
	if ('pm10_alarm' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x08);
		buffer.writeUInt8(payload.pm10_alarm.type);
		if (payload.pm10_alarm.type == 0x00) {
		}
		if (payload.pm10_alarm.type == 0x01) {
		}
		if (payload.pm10_alarm.type == 0x02) {
		}
		if (payload.pm10_alarm.type == 0x10) {
			if (payload.pm10_alarm.alarm_deactivation.pm10 < 0 || payload.pm10_alarm.alarm_deactivation.pm10 > 1000) {
				throw new Error('pm10_alarm.alarm_deactivation.pm10 must be between 0 and 1000');
			}
			buffer.writeUInt16LE(payload.pm10_alarm.alarm_deactivation.pm10);
		}
		if (payload.pm10_alarm.type == 0x11) {
			if (payload.pm10_alarm.alarm_trigger.pm10 < 0 || payload.pm10_alarm.alarm_trigger.pm10 > 1000) {
				throw new Error('pm10_alarm.alarm_trigger.pm10 must be between 0 and 1000');
			}
			buffer.writeUInt16LE(payload.pm10_alarm.alarm_trigger.pm10);
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x09
	if ('temperature' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x09);
		if (payload.temperature < -20 || payload.temperature > 60) {
			throw new Error('temperature must be between -20 and 60');
		}
		buffer.writeInt16LE(payload.temperature * 10);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x0a
	if ('temperature_alarm' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x0a);
		buffer.writeUInt8(payload.temperature_alarm.type);
		if (payload.temperature_alarm.type == 0x00) {
		}
		if (payload.temperature_alarm.type == 0x01) {
		}
		if (payload.temperature_alarm.type == 0x02) {
		}
		if (payload.temperature_alarm.type == 0x10) {
			if (payload.temperature_alarm.alarm_deactivation.temperature < -20 || payload.temperature_alarm.alarm_deactivation.temperature > 60) {
				throw new Error('temperature_alarm.alarm_deactivation.temperature must be between -20 and 60');
			}
			buffer.writeInt16LE(payload.temperature_alarm.alarm_deactivation.temperature * 10);
		}
		if (payload.temperature_alarm.type == 0x11) {
			if (payload.temperature_alarm.alarm_trigger.temperature < -20 || payload.temperature_alarm.alarm_trigger.temperature > 60) {
				throw new Error('temperature_alarm.alarm_trigger.temperature must be between -20 and 60');
			}
			buffer.writeInt16LE(payload.temperature_alarm.alarm_trigger.temperature * 10);
		}
		if (payload.temperature_alarm.type == 0x20) {
		}
		if (payload.temperature_alarm.type == 0x21) {
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x0b
	if ('humidity' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x0b);
		if (payload.humidity < 0 || payload.humidity > 100) {
			throw new Error('humidity must be between 0 and 100');
		}
		buffer.writeUInt16LE(payload.humidity * 10);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x0c
	if ('humidity_alarm' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x0c);
		buffer.writeUInt8(payload.humidity_alarm.type);
		if (payload.humidity_alarm.type == 0x00) {
		}
		if (payload.humidity_alarm.type == 0x01) {
		}
		if (payload.humidity_alarm.type == 0x02) {
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x0d
	if ('tvoc' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x0d);
		if (payload.tvoc < 0 || payload.tvoc > 2000) {
			throw new Error('tvoc must be between 0 and 2000');
		}
		buffer.writeUInt16LE(payload.tvoc);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x0e
	if ('tvoc_alarm' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x0e);
		buffer.writeUInt8(payload.tvoc_alarm.type);
		if (payload.tvoc_alarm.type == 0x00) {
		}
		if (payload.tvoc_alarm.type == 0x01) {
		}
		if (payload.tvoc_alarm.type == 0x02) {
		}
		if (payload.tvoc_alarm.type == 0x10) {
			if (payload.tvoc_alarm.alarm_deactivation.tvoc < 0 || payload.tvoc_alarm.alarm_deactivation.tvoc > 2000) {
				throw new Error('tvoc_alarm.alarm_deactivation.tvoc must be between 0 and 2000');
			}
			buffer.writeUInt16LE(payload.tvoc_alarm.alarm_deactivation.tvoc);
		}
		if (payload.tvoc_alarm.type == 0x11) {
			if (payload.tvoc_alarm.alarm_trigger.tvoc < 0 || payload.tvoc_alarm.alarm_trigger.tvoc > 2000) {
				throw new Error('tvoc_alarm.alarm_trigger.tvoc must be between 0 and 2000');
			}
			buffer.writeUInt16LE(payload.tvoc_alarm.alarm_trigger.tvoc);
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x0f
	if ('tamper_status' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x0f);
		// 0：Normal, 1：Triggered
		buffer.writeUInt8(payload.tamper_status);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x10
	if ('tamper_status_alarm' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x10);
		buffer.writeUInt8(payload.tamper_status_alarm.type);
		if (payload.tamper_status_alarm.type == 0x20) {
		}
		if (payload.tamper_status_alarm.type == 0x21) {
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x11
	if ('buzzer' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x11);
		// 0：Normal, 1：Triggered
		buffer.writeUInt8(payload.buzzer);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x12
	if ('occupancy_status' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x12);
		// 0：vacant, 1：occuppied
		buffer.writeUInt8(payload.occupancy_status);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x20
	if ('tvoc_raw_data_1' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x20);
		buffer.writeFloatLE(payload.tvoc_raw_data_1.rmox_0);
		buffer.writeFloatLE(payload.tvoc_raw_data_1.rmox_1);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x21
	if ('tvoc_raw_data_2' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x21);
		buffer.writeFloatLE(payload.tvoc_raw_data_2.rmox_2);
		buffer.writeFloatLE(payload.tvoc_raw_data_2.rmox_3);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x22
	if ('tvoc_raw_data_3' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x22);
		buffer.writeFloatLE(payload.tvoc_raw_data_3.rmox_4);
		buffer.writeFloatLE(payload.tvoc_raw_data_3.rmox_5);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x23
	if ('tvoc_raw_data_4' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x23);
		buffer.writeFloatLE(payload.tvoc_raw_data_4.rmox_6);
		buffer.writeFloatLE(payload.tvoc_raw_data_4.rmox_7);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x24
	if ('tvoc_raw_data_5' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x24);
		buffer.writeFloatLE(payload.tvoc_raw_data_5.rmox_8);
		buffer.writeFloatLE(payload.tvoc_raw_data_5.rmox_9);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x25
	if ('tvoc_raw_data_6' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x25);
		buffer.writeFloatLE(payload.tvoc_raw_data_6.rmox_10);
		buffer.writeFloatLE(payload.tvoc_raw_data_6.rmox_11);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x26
	if ('tvoc_raw_data_7' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x26);
		buffer.writeFloatLE(payload.tvoc_raw_data_7.rmox_12);
		buffer.writeFloatLE(payload.tvoc_raw_data_7.zmod4510_rmox_3);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x27
	if ('tvoc_raw_data_8' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x27);
		buffer.writeFloatLE(payload.tvoc_raw_data_8.log_rcda);
		buffer.writeFloatLE(payload.tvoc_raw_data_8.rhtr);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x28
	if ('tvoc_raw_data_9' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x28);
		buffer.writeFloatLE(payload.tvoc_raw_data_9.temperature);
		buffer.writeFloatLE(payload.tvoc_raw_data_9.iaq);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x29
	if ('tvoc_raw_data_10' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x29);
		buffer.writeFloatLE(payload.tvoc_raw_data_10.tvoc);
		buffer.writeFloatLE(payload.tvoc_raw_data_10.etoh);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x2a
	if ('tvoc_raw_data_11' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x2a);
		buffer.writeFloatLE(payload.tvoc_raw_data_11.eco2);
		buffer.writeFloatLE(payload.tvoc_raw_data_11.rel_iaq);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x2b
	if ('pm_sensor_working_time' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x2b);
		buffer.writeUInt32LE(payload.pm_sensor_working_time);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xc9
	if ('random_key' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xc9);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.random_key);
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
	if ('reporting_interval' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x60);
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
	//0x61
	if ('temperature_unit' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x61);
		// 0：℃, 1：℉
		buffer.writeUInt8(payload.temperature_unit);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x67
	if ('tamper_alarm_enable' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x67);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.tamper_alarm_enable);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x62
	if ('led_status' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x62);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.led_status);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x63
	if ('buzzer_enable' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x63);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.buzzer_enable);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x64
	if ('buzzer_sleep' in payload) {
		var buffer = new Buffer();
		if (isValid(payload.buzzer_sleep.item_1)) {
			buffer.writeUInt8(0x64);
			buffer.writeUInt8(0x01);
			// 0：disable, 1：enable
			buffer.writeUInt8(payload.buzzer_sleep.item_1.enable);
			if (payload.buzzer_sleep.item_1.start_time < 0 || payload.buzzer_sleep.item_1.start_time > 1439) {
				throw new Error('buzzer_sleep.item_1.start_time must be between 0 and 1439');
			}
			buffer.writeUInt16LE(payload.buzzer_sleep.item_1.start_time);
			if (payload.buzzer_sleep.item_1.end_time < 0 || payload.buzzer_sleep.item_1.end_time > 1439) {
				throw new Error('buzzer_sleep.item_1.end_time must be between 0 and 1439');
			}
			buffer.writeUInt16LE(payload.buzzer_sleep.item_1.end_time);
		}
		if (isValid(payload.buzzer_sleep.item_2)) {
			buffer.writeUInt8(0x64);
			buffer.writeUInt8(0x02);
			// 0：disable, 1：enable
			buffer.writeUInt8(payload.buzzer_sleep.item_2.enable);
			if (payload.buzzer_sleep.item_2.start_time < 0 || payload.buzzer_sleep.item_2.start_time > 1439) {
				throw new Error('buzzer_sleep.item_2.start_time must be between 0 and 1439');
			}
			buffer.writeUInt16LE(payload.buzzer_sleep.item_2.start_time);
			if (payload.buzzer_sleep.item_2.end_time < 0 || payload.buzzer_sleep.item_2.end_time > 1439) {
				throw new Error('buzzer_sleep.item_2.end_time must be between 0 and 1439');
			}
			buffer.writeUInt16LE(payload.buzzer_sleep.item_2.end_time);
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x65
	if ('buzzer_button_stop_enable' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x65);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.buzzer_button_stop_enable);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x66
	if ('buzzer_silent_time' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x66);
		if (payload.buzzer_silent_time < 0 || payload.buzzer_silent_time > 1440) {
			throw new Error('buzzer_silent_time must be between 0 and 1440');
		}
		buffer.writeUInt16LE(payload.buzzer_silent_time);
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
		if (payload.daylight_saving_time.daylight_saving_time_offset < 0 || payload.daylight_saving_time.daylight_saving_time_offset > 120) {
			throw new Error('daylight_saving_time.daylight_saving_time_offset must be between 0 and 120');
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
	//0x68
	if ('tvoc_raw_reporting_enable' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x68);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.tvoc_raw_reporting_enable);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x69
	if ('temperature_alarm_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x69);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.temperature_alarm_settings.enable);
		// 0:disable, 1:condition: x<A, 2:condition: x>B, 3:condition: A<x<B, 4:condition: x<A or x>B
		buffer.writeUInt8(payload.temperature_alarm_settings.threshold_condition);
		if (payload.temperature_alarm_settings.threshold_min < -20 || payload.temperature_alarm_settings.threshold_min > 60) {
			throw new Error('temperature_alarm_settings.threshold_min must be between -20 and 60');
		}
		buffer.writeInt16LE(payload.temperature_alarm_settings.threshold_min * 10);
		if (payload.temperature_alarm_settings.threshold_max < -20 || payload.temperature_alarm_settings.threshold_max > 60) {
			throw new Error('temperature_alarm_settings.threshold_max must be between -20 and 60');
		}
		buffer.writeInt16LE(payload.temperature_alarm_settings.threshold_max * 10);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x6a
	if ('pm1_0_alarm_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x6a);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.pm1_0_alarm_settings.enable);
		// 0:disable, 1:condition: x<A, 2:condition: x>B, 3:condition: A<x<B, 4:condition: x<A or x>B
		buffer.writeUInt8(payload.pm1_0_alarm_settings.threshold_condition);
		if (payload.pm1_0_alarm_settings.threshold_min < 0 || payload.pm1_0_alarm_settings.threshold_min > 1000) {
			throw new Error('pm1_0_alarm_settings.threshold_min must be between 0 and 1000');
		}
		buffer.writeInt16LE(payload.pm1_0_alarm_settings.threshold_min);
		if (payload.pm1_0_alarm_settings.threshold_max < 0 || payload.pm1_0_alarm_settings.threshold_max > 1000) {
			throw new Error('pm1_0_alarm_settings.threshold_max must be between 0 and 1000');
		}
		buffer.writeInt16LE(payload.pm1_0_alarm_settings.threshold_max);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x6b
	if ('pm2_5_alarm_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x6b);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.pm2_5_alarm_settings.enable);
		// 0:disable, 1:condition: x<A, 2:condition: x>B, 3:condition: A<x<B, 4:condition: x<A or x>B
		buffer.writeUInt8(payload.pm2_5_alarm_settings.threshold_condition);
		if (payload.pm2_5_alarm_settings.threshold_min < 0 || payload.pm2_5_alarm_settings.threshold_min > 1000) {
			throw new Error('pm2_5_alarm_settings.threshold_min must be between 0 and 1000');
		}
		buffer.writeInt16LE(payload.pm2_5_alarm_settings.threshold_min);
		if (payload.pm2_5_alarm_settings.threshold_max < 0 || payload.pm2_5_alarm_settings.threshold_max > 1000) {
			throw new Error('pm2_5_alarm_settings.threshold_max must be between 0 and 1000');
		}
		buffer.writeInt16LE(payload.pm2_5_alarm_settings.threshold_max);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x6c
	if ('pm10_alarm_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x6c);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.pm10_alarm_settings.enable);
		// 0:disable, 1:condition: x<A, 2:condition: x>B, 3:condition: A<x<B, 4:condition: x<A or x>B
		buffer.writeUInt8(payload.pm10_alarm_settings.threshold_condition);
		if (payload.pm10_alarm_settings.threshold_min < 0 || payload.pm10_alarm_settings.threshold_min > 1000) {
			throw new Error('pm10_alarm_settings.threshold_min must be between 0 and 1000');
		}
		buffer.writeInt16LE(payload.pm10_alarm_settings.threshold_min);
		if (payload.pm10_alarm_settings.threshold_max < 0 || payload.pm10_alarm_settings.threshold_max > 1000) {
			throw new Error('pm10_alarm_settings.threshold_max must be between 0 and 1000');
		}
		buffer.writeInt16LE(payload.pm10_alarm_settings.threshold_max);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x6d
	if ('tvoc_alarm_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x6d);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.tvoc_alarm_settings.enable);
		// 0:disable, 1:condition: x<A, 2:condition: x>B, 3:condition: A<x<B, 4:condition: x<A or x>B
		buffer.writeUInt8(payload.tvoc_alarm_settings.threshold_condition);
		if (payload.tvoc_alarm_settings.threshold_min < 0 || payload.tvoc_alarm_settings.threshold_min > 2000) {
			throw new Error('tvoc_alarm_settings.threshold_min must be between 0 and 2000');
		}
		buffer.writeInt16LE(payload.tvoc_alarm_settings.threshold_min);
		if (payload.tvoc_alarm_settings.threshold_max < 0 || payload.tvoc_alarm_settings.threshold_max > 2000) {
			throw new Error('tvoc_alarm_settings.threshold_max must be between 0 and 2000');
		}
		buffer.writeInt16LE(payload.tvoc_alarm_settings.threshold_max);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x6e
	if ('vaping_index_alarm_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x6e);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.vaping_index_alarm_settings.enable);
		// 0:disable, 1:condition: x<A, 2:condition: x>B, 3:condition: A<x<B, 4:condition: x<A or x>B
		buffer.writeUInt8(payload.vaping_index_alarm_settings.threshold_condition);
		if (payload.vaping_index_alarm_settings.threshold_min < 0 || payload.vaping_index_alarm_settings.threshold_min > 100) {
			throw new Error('vaping_index_alarm_settings.threshold_min must be between 0 and 100');
		}
		buffer.writeUInt8(payload.vaping_index_alarm_settings.threshold_min);
		if (payload.vaping_index_alarm_settings.threshold_max < 0 || payload.vaping_index_alarm_settings.threshold_max > 100) {
			throw new Error('vaping_index_alarm_settings.threshold_max must be between 0 and 100');
		}
		buffer.writeUInt8(payload.vaping_index_alarm_settings.threshold_max);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x6f
	if ('alarm_reporting_times' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x6f);
		if (payload.alarm_reporting_times < 1 || payload.alarm_reporting_times > 1000) {
			throw new Error('alarm_reporting_times must be between 1 and 1000');
		}
		buffer.writeUInt16LE(payload.alarm_reporting_times);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x70
	if ('alarm_deactivation_enable' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x70);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.alarm_deactivation_enable);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x71
	if ('temperature_calibration_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x71);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.temperature_calibration_settings.enable);
		if (payload.temperature_calibration_settings.calibration_value < -80 || payload.temperature_calibration_settings.calibration_value > 80) {
			throw new Error('temperature_calibration_settings.calibration_value must be between -80 and 80');
		}
		buffer.writeInt16LE(payload.temperature_calibration_settings.calibration_value * 10);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x72
	if ('humidity_calibration_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x72);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.humidity_calibration_settings.enable);
		if (payload.humidity_calibration_settings.calibration_value < -100 || payload.humidity_calibration_settings.calibration_value > 100) {
			throw new Error('humidity_calibration_settings.calibration_value must be between -100 and 100');
		}
		buffer.writeInt16LE(payload.humidity_calibration_settings.calibration_value * 10);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x73
	if ('pm1_0_calibration_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x73);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.pm1_0_calibration_settings.enable);
		if (payload.pm1_0_calibration_settings.calibration_value < -1000 || payload.pm1_0_calibration_settings.calibration_value > 1000) {
			throw new Error('pm1_0_calibration_settings.calibration_value must be between -1000 and 1000');
		}
		buffer.writeInt16LE(payload.pm1_0_calibration_settings.calibration_value);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x74
	if ('pm2_5_calibration_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x74);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.pm2_5_calibration_settings.enable);
		if (payload.pm2_5_calibration_settings.calibration_value < -1000 || payload.pm2_5_calibration_settings.calibration_value > 1000) {
			throw new Error('pm2_5_calibration_settings.calibration_value must be between -1000 and 1000');
		}
		buffer.writeInt16LE(payload.pm2_5_calibration_settings.calibration_value);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x75
	if ('pm10_calibration_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x75);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.pm10_calibration_settings.enable);
		if (payload.pm10_calibration_settings.calibration_value < -1000 || payload.pm10_calibration_settings.calibration_value > 1000) {
			throw new Error('pm10_calibration_settings.calibration_value must be between -1000 and 1000');
		}
		buffer.writeInt16LE(payload.pm10_calibration_settings.calibration_value);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x76
	if ('tvoc_calibration_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x76);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.tvoc_calibration_settings.enable);
		if (payload.tvoc_calibration_settings.calibration_value < -2000 || payload.tvoc_calibration_settings.calibration_value > 2000) {
			throw new Error('tvoc_calibration_settings.calibration_value must be between -2000 and 2000');
		}
		buffer.writeInt16LE(payload.tvoc_calibration_settings.calibration_value);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x77
	if ('vaping_index_calibration_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x77);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.vaping_index_calibration_settings.enable);
		if (payload.vaping_index_calibration_settings.calibration_value < -100 || payload.vaping_index_calibration_settings.calibration_value > 100) {
			throw new Error('vaping_index_calibration_settings.calibration_value must be between -100 and 100');
		}
		buffer.writeInt8(payload.vaping_index_calibration_settings.calibration_value);
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
	if ('retrieve_historical_data_by_time' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xbb);
		buffer.writeUInt32LE(payload.retrieve_historical_data_by_time.time);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xba
	if ('retrieve_historical_data_by_time_range' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xba);
		buffer.writeUInt32LE(payload.retrieve_historical_data_by_time_range.start_time);
		buffer.writeUInt32LE(payload.retrieve_historical_data_by_time_range.end_time);
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
	//0xb6
	if ('reconnect' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xb6);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x5f
	if ('stop_buzzer_alarm' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x5f);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x5e
	if ('execute_tvoc_self_clean' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x5e);
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
		  "battery": "00",
		  "vaping_index": "01",
		  "vaping_index_alarm": "02",
		  "vaping_index_alarm.collection_error": "0200",
		  "vaping_index_alarm.lower_range_error": "0201",
		  "vaping_index_alarm.over_range_error": "0202",
		  "vaping_index_alarm.alarm_deactivation": "0210",
		  "vaping_index_alarm.alarm_trigger": "0211",
		  "vaping_index_alarm.interference_alarm_deactivation": "0220",
		  "vaping_index_alarm.interference_alarm_trigger": "0221",
		  "pm1_0": "03",
		  "pm1_0_alarm": "04",
		  "pm1_0_alarm.collection_error": "0400",
		  "pm1_0_alarm.lower_range_error": "0401",
		  "pm1_0_alarm.over_range_error": "0402",
		  "pm1_0_alarm.alarm_deactivation": "0410",
		  "pm1_0_alarm.alarm_trigger": "0411",
		  "pm2_5": "05",
		  "pm2_5_alarm": "06",
		  "pm2_5_alarm.collection_error": "0600",
		  "pm2_5_alarm.lower_range_error": "0601",
		  "pm2_5_alarm.over_range_error": "0602",
		  "pm2_5_alarm.alarm_deactivation": "0610",
		  "pm2_5_alarm.alarm_trigger": "0611",
		  "pm10": "07",
		  "pm10_alarm": "08",
		  "pm10_alarm.collection_error": "0800",
		  "pm10_alarm.lower_range_error": "0801",
		  "pm10_alarm.over_range_error": "0802",
		  "pm10_alarm.alarm_deactivation": "0810",
		  "pm10_alarm.alarm_trigger": "0811",
		  "temperature": "09",
		  "temperature_alarm": "0a",
		  "temperature_alarm.collection_error": "0a00",
		  "temperature_alarm.lower_range_error": "0a01",
		  "temperature_alarm.over_range_error": "0a02",
		  "temperature_alarm.alarm_deactivation": "0a10",
		  "temperature_alarm.alarm_trigger": "0a11",
		  "temperature_alarm.burning_alarm_deactivation": "0a20",
		  "temperature_alarm.burning_alarm_trigger": "0a21",
		  "humidity": "0b",
		  "humidity_alarm": "0c",
		  "humidity_alarm.collection_error": "0c00",
		  "humidity_alarm.lower_range_error": "0c01",
		  "humidity_alarm.over_range_error": "0c02",
		  "tvoc": "0d",
		  "tvoc_alarm": "0e",
		  "tvoc_alarm.collection_error": "0e00",
		  "tvoc_alarm.lower_range_error": "0e01",
		  "tvoc_alarm.over_range_error": "0e02",
		  "tvoc_alarm.alarm_deactivation": "0e10",
		  "tvoc_alarm.alarm_trigger": "0e11",
		  "tamper_status": "0f",
		  "tamper_status_alarm": "10",
		  "tamper_status_alarm.normal": "1020",
		  "tamper_status_alarm.trigger": "1021",
		  "buzzer": "11",
		  "occupancy_status": "12",
		  "tvoc_raw_data_1": "20",
		  "tvoc_raw_data_2": "21",
		  "tvoc_raw_data_3": "22",
		  "tvoc_raw_data_4": "23",
		  "tvoc_raw_data_5": "24",
		  "tvoc_raw_data_6": "25",
		  "tvoc_raw_data_7": "26",
		  "tvoc_raw_data_8": "27",
		  "tvoc_raw_data_9": "28",
		  "tvoc_raw_data_10": "29",
		  "tvoc_raw_data_11": "2a",
		  "pm_sensor_working_time": "2b",
		  "random_key": "c9",
		  "device_status": "c8",
		  "reporting_interval": "60",
		  "reporting_interval.seconds_of_time": "6000",
		  "reporting_interval.minutes_of_time": "6001",
		  "temperature_unit": "61",
		  "tamper_alarm_enable": "67",
		  "led_status": "62",
		  "buzzer_enable": "63",
		  "buzzer_sleep": "64",
		  "buzzer_sleep.item_1": "6401",
		  "buzzer_sleep.item_2": "6402",
		  "buzzer_button_stop_enable": "65",
		  "buzzer_silent_time": "66",
		  "time_zone": "c7",
		  "daylight_saving_time": "c6",
		  "tvoc_raw_reporting_enable": "68",
		  "temperature_alarm_settings": "69",
		  "pm1_0_alarm_settings": "6a",
		  "pm2_5_alarm_settings": "6b",
		  "pm10_alarm_settings": "6c",
		  "tvoc_alarm_settings": "6d",
		  "vaping_index_alarm_settings": "6e",
		  "alarm_reporting_times": "6f",
		  "alarm_deactivation_enable": "70",
		  "temperature_calibration_settings": "71",
		  "humidity_calibration_settings": "72",
		  "pm1_0_calibration_settings": "73",
		  "pm2_5_calibration_settings": "74",
		  "pm10_calibration_settings": "75",
		  "tvoc_calibration_settings": "76",
		  "vaping_index_calibration_settings": "77",
		  "reset": "bf",
		  "reboot": "be",
		  "clear_historical_data": "bd",
		  "stop_historical_data_retrieval": "bc",
		  "retrieve_historical_data_by_time": "bb",
		  "retrieve_historical_data_by_time_range": "ba",
		  "query_device_status": "b9",
		  "synchronize_time": "b8",
		  "set_time": "b7",
		  "reconnect": "b6",
		  "stop_buzzer_alarm": "5f",
		  "execute_tvoc_self_clean": "5e"
	};
}
function processTemperature(payload) {
	var allTemperatureProperties = {
    "temperature": {
        "coefficient": 0.1
    },
    "temperature_alarm.alarm_deactivation.temperature": {
        "coefficient": 0.1
    },
    "temperature_alarm.alarm_trigger.temperature": {
        "coefficient": 0.1
    },
    "temperature_alarm_settings.threshold_min": {
        "coefficient": 0.1
    },
    "temperature_alarm_settings.threshold_max": {
        "coefficient": 0.1
    },
    "temperature_calibration_settings.calibration_value": {
        "coefficient": 0.1
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
    Encoder: Encoder
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

if (typeof decodeUplink === "function") exports.decodeUplink = decodeUplink;
