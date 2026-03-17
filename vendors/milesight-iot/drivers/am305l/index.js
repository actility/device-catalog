/**
 * Payload Decoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product AM305L
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

	var unknown_command = 0;
	var counterObj = {};
	for (counterObj.i = 0; counterObj.i < bytes.length; ) {
		var command_id = bytes[counterObj.i++];
		switch (command_id) {
			case 0xff:
				var ipso_type_v1 = bytes[counterObj.i++];
				switch (ipso_type_v1) {
					case 0x0b:
						decoded.device_status = readUInt8(bytes, counterObj, 1);
						break;
					case 0x01:
						decoded.ipso_version = readUInt8(bytes, counterObj, 1);
						break;
					case 0x16:
						decoded.sn = readHexString(bytes, counterObj, 8);
						break;
					case 0xff:
						decoded.tsl_version = readProtocolVersion(readBytes(bytes, counterObj, 2));
						break;
					case 0xfe:
						decoded.request_tsl_config = readUInt8(bytes, counterObj, 1);
						break;
					case 0x09:
						decoded.hardware_version = readHardwareVersion(readBytes(bytes, counterObj, 2));
						break;
					case 0x0a:
						decoded.firmware_version = readFirmwareVersion(readBytes(bytes, counterObj, 2));
						break;
					case 0x0f:
						// 0:class_a
						decoded.lorawan_class = readUInt8(bytes, counterObj, 1);
						break;
					case 0xf2:
						decoded.alarm_reporting_times = readUInt16LE(bytes, counterObj, 2);
						break;
					case 0xf5:
						// 0: disable, 1: enable
						decoded.alarm_deactivation_enable = readUInt8(bytes, counterObj, 1);
						break;
					case 0x2e:
						// 0：disable, 2：enable
						decoded.led_mode = readUInt8(bytes, counterObj, 1);
						break;
					case 0x25:
						decoded.button_lock = decoded.button_lock || {};
						var bitOptions = readUInt8(bytes, counterObj, 1);
						// 0：disable, 1：enable
						decoded.button_lock.power_off = extractBits(bitOptions, 0, 1);
						// 0：disable, 1：enable
						decoded.button_lock.power_on = extractBits(bitOptions, 1, 2);
						break;
					case 0x06:
						decoded.temperature_alarm_rule = decoded.temperature_alarm_rule || {};
						var bitOptions = readUInt8(bytes, counterObj, 1);
						// 0：disable, 1：enable
						decoded.temperature_alarm_rule.enable = extractBits(bitOptions, 6, 7);
						// 1:condition: x<A, 2:condition: x>B, 3:condition: A<x<B, 4:condition: x<A or x>B
						decoded.temperature_alarm_rule.condition = extractBits(bitOptions, 0, 3);
						decoded.temperature_alarm_rule.id = extractBits(bitOptions, 3, 6);
						decoded.temperature_alarm_rule.threshold_max = readInt16LE(bytes, counterObj, 2) / 10;
						decoded.temperature_alarm_rule.threshold_min = readInt16LE(bytes, counterObj, 2) / 10;
						decoded.temperature_alarm_rule.threshold_lock_time = readUInt16LE(bytes, counterObj, 2);
						decoded.temperature_alarm_rule.threshold_continue_time = readUInt16LE(bytes, counterObj, 2);
						break;
					case 0x18:
						var fixed_value = bytes[counterObj.i + 0];
						switch (fixed_value) {
							case 3: // pir_enable.sensor_id
								decoded.pir_enable = decoded.pir_enable || {};
								// 1:temperature, 2:humidity, 3:PIR, 4:Illuminance, 5:CO₂
								decoded.pir_enable.sensor_id = readUInt8(bytes, counterObj, 1);
								var bitOptions = readUInt8(bytes, counterObj, 1);
								// 0：disable, 1：enable
								decoded.pir_enable.enable = extractBits(bitOptions, 2, 3);
								decoded.pir_enable.sensor_id = undefined;
								break;
							case 4: // illuminance_collecting_enable.sensor_id
								decoded.illuminance_collecting_enable = decoded.illuminance_collecting_enable || {};
								// 1:temperature, 2:humidity, 3:PIR, 4:Illuminance, 5:CO₂
								decoded.illuminance_collecting_enable.sensor_id = readUInt8(bytes, counterObj, 1);
								var bitOptions = readUInt8(bytes, counterObj, 1);
								// 0：disable, 1：enable
								decoded.illuminance_collecting_enable.enable = extractBits(bitOptions, 3, 4);
								decoded.illuminance_collecting_enable.sensor_id = undefined;
								break;
							case 5: // co2_collecting_enable.sensor_id
								decoded.co2_collecting_enable = decoded.co2_collecting_enable || {};
								// 1:temperature, 2:humidity, 3:PIR, 4:Illuminance, 5:CO₂
								decoded.co2_collecting_enable.sensor_id = readUInt8(bytes, counterObj, 1);
								var bitOptions = readUInt8(bytes, counterObj, 1);
								// 0：disable, 1：enable
								decoded.co2_collecting_enable.enable = extractBits(bitOptions, 4, 5);
								decoded.co2_collecting_enable.sensor_id = undefined;
								break;
						}
						break;
					case 0x95:
						decoded.pir_idle_interval = readUInt16LE(bytes, counterObj, 2);
						break;
					case 0xea:
						var fixed_value = (bytes[counterObj.i + 0] >> 0) & 0x7f;
						switch (fixed_value) {
							case 0: // temperature_calibration_settings.id
								decoded.temperature_calibration_settings = decoded.temperature_calibration_settings || {};
								var bitOptions = readUInt8(bytes, counterObj, 1);
								// 0:temperature, 1:humidity, 2:CO₂
								decoded.temperature_calibration_settings.id = extractBits(bitOptions, 0, 7);
								// 0: disable, 1: enable
								decoded.temperature_calibration_settings.enable = extractBits(bitOptions, 7, 8);
								decoded.temperature_calibration_settings.value = readInt16LE(bytes, counterObj, 2) / 10;
								decoded.temperature_calibration_settings.id = undefined;
								break;
							case 1: // humidity_calibration_settings.id
								decoded.humidity_calibration_settings = decoded.humidity_calibration_settings || {};
								var bitOptions = readUInt8(bytes, counterObj, 1);
								// 0:temperature, 1:humidity, 2:CO₂
								decoded.humidity_calibration_settings.id = extractBits(bitOptions, 0, 7);
								// 0: disable, 1: enable
								decoded.humidity_calibration_settings.enable = extractBits(bitOptions, 7, 8);
								decoded.humidity_calibration_settings.value = readInt16LE(bytes, counterObj, 2) / 2;
								decoded.humidity_calibration_settings.id = undefined;
								break;
							case 2: // co2_calibration_settings.id
								decoded.co2_calibration_settings = decoded.co2_calibration_settings || {};
								var bitOptions = readUInt8(bytes, counterObj, 1);
								// 0:temperature, 1:humidity, 2:CO₂
								decoded.co2_calibration_settings.id = extractBits(bitOptions, 0, 7);
								// 0: disable, 1: enable
								decoded.co2_calibration_settings.enable = extractBits(bitOptions, 7, 8);
								decoded.co2_calibration_settings.value = readUInt16LE(bytes, counterObj, 2);
								decoded.co2_calibration_settings.id = undefined;
								break;
						}
						break;
					case 0x39:
						decoded.co2_auto_background_calibration_settings = decoded.co2_auto_background_calibration_settings || {};
						// 0: disable, 1: enable
						decoded.co2_auto_background_calibration_settings.enable = readUInt8(bytes, counterObj, 1);
						decoded.co2_auto_background_calibration_settings.target_value = readUInt16LE(bytes, counterObj, 2);
						decoded.co2_auto_background_calibration_settings.period = readUInt16LE(bytes, counterObj, 2);
						break;
					case 0x87:
						decoded.co2_altitude_calibration = decoded.co2_altitude_calibration || {};
						// 0: disable, 1: enable
						decoded.co2_altitude_calibration.enable = readUInt8(bytes, counterObj, 1);
						decoded.co2_altitude_calibration.value = readUInt16LE(bytes, counterObj, 2);
						break;
					case 0x96:
						decoded.d2d_master_settings = decoded.d2d_master_settings || [];
						// 0:PIR Trigger, 1:PIR Vacant, 2:Illuminance Bright, 3:Illuminance Dim, 4:Trigger/Bright, 5:Trigger/Dim
						var trigger_condition = readUInt8(bytes, counterObj, 1);
						var d2d_master_settings_item = pickArrayItem(decoded.d2d_master_settings, trigger_condition, 'trigger_condition');
						d2d_master_settings_item.trigger_condition = trigger_condition;
						insertArrayItem(decoded.d2d_master_settings, d2d_master_settings_item, 'trigger_condition');
						// 0：disable, 1：enable
						d2d_master_settings_item.enable = readUInt8(bytes, counterObj, 1);
						// 0：disable, 1：enable
						d2d_master_settings_item.lora_uplink_enable = readUInt8(bytes, counterObj, 1);
						d2d_master_settings_item.control_command = readHexString(bytes, counterObj, 2);
						// 0：disable, 1：enable
						d2d_master_settings_item.control_time_enable = readUInt8(bytes, counterObj, 1);
						d2d_master_settings_item.control_time = readUInt16LE(bytes, counterObj, 2);
						break;
					case 0x68:
						decoded.data_storage_enable = decoded.data_storage_enable || {};
						// 0：disable, 1：enable
						decoded.data_storage_enable.enable = readUInt8(bytes, counterObj, 1);
						break;
					case 0x69:
						decoded.retransmission_enable = decoded.retransmission_enable || {};
						// 0：disable, 1：enable
						decoded.retransmission_enable.enable = readUInt8(bytes, counterObj, 1);
						break;
					case 0x6a:
						var fixed_value = bytes[counterObj.i + 0];
						switch (fixed_value) {
							case 0: // retransmission_interval.type
								decoded.retransmission_interval = decoded.retransmission_interval || {};
								// 0: retransmission interval, 1: retrival interval
								decoded.retransmission_interval.type = readUInt8(bytes, counterObj, 1);
								decoded.retransmission_interval.interval = readUInt16LE(bytes, counterObj, 2);
								decoded.retransmission_interval.type = undefined;
								break;
							case 1: // retrival_interval.type
								decoded.retrival_interval = decoded.retrival_interval || {};
								// 0: retransmission interval, 1: retrival interval
								decoded.retrival_interval.type = readUInt8(bytes, counterObj, 1);
								decoded.retrival_interval.interval = readUInt16LE(bytes, counterObj, 2);
								decoded.retrival_interval.type = undefined;
								break;
						}
						break;
					case 0x1a:
						var fixed_value = bytes[counterObj.i + 0];
						switch (fixed_value) {
							case 0: // co2_reset_calibration
								decoded.co2_reset_calibration = readUInt8(bytes, counterObj, 1);
								break;
							case 3: // co2_background_calibration
								decoded.co2_background_calibration = readUInt8(bytes, counterObj, 1);
								break;
						}
						break;
					case 0x27:
						decoded.clear_historical_data = readUInt8(bytes, counterObj, 1);
						break;
					case 0x10:
						decoded.reboot = readUInt8(bytes, counterObj, 1);
						break;
					case 0x4a:
						decoded.synchronize_time = readUInt8(bytes, counterObj, 1);
						break;
				}
				break;
			case 0x01:
				var ipso_type_v1 = bytes[counterObj.i++];
				switch (ipso_type_v1) {
					case 0x75:
						decoded.battery = readUInt8(bytes, counterObj, 1);
						break;
				}
				break;
			case 0x03:
				var ipso_type_v1 = bytes[counterObj.i++];
				switch (ipso_type_v1) {
					case 0x67:
						decoded.temperature = readInt16LE(bytes, counterObj, 2) / 10;
						break;
				}
				break;
			case 0x04:
				var ipso_type_v1 = bytes[counterObj.i++];
				switch (ipso_type_v1) {
					case 0x68:
						decoded.humidity = readUInt8(bytes, counterObj, 1) / 2;
						break;
				}
				break;
			case 0x05:
				var ipso_type_v1 = bytes[counterObj.i++];
				switch (ipso_type_v1) {
					case 0x9f:
						decoded.pir = decoded.pir || {};
						var bitOptions = readUInt16LE(bytes, counterObj, 2);
						decoded.pir.pir_status = extractBits(bitOptions, 15, 16);
						decoded.pir.pir_count = extractBits(bitOptions, 0, 15);
						break;
					case 0x00:
						decoded.pir_status_change = decoded.pir_status_change || {};
						// 0:vacant, 1:trigger
						decoded.pir_status_change.status = readUInt8(bytes, counterObj, 1);
						decoded.pir = decoded.pir || {};
						decoded.pir.pir_status = decoded.pir_status_change.status;
						break;
				}
				break;
			case 0x06:
				var ipso_type_v1 = bytes[counterObj.i++];
				switch (ipso_type_v1) {
					case 0xcb:
						decoded.als_level = readUInt8(bytes, counterObj, 1);
						break;
					case 0x9d:
						decoded.Lux = readUInt16LE(bytes, counterObj, 2);
						break;
				}
				break;
			case 0x07:
				var ipso_type_v1 = bytes[counterObj.i++];
				switch (ipso_type_v1) {
					case 0x7d:
						decoded.co2 = readUInt16LE(bytes, counterObj, 2);
						break;
				}
				break;
			case 0xb3:
				var ipso_type_v1 = bytes[counterObj.i++];
				switch (ipso_type_v1) {
					case 0x67:
						decoded.temperature_collection_anomaly = decoded.temperature_collection_anomaly || {};
						// 0:collect abnormal, 1:collect out of range
						decoded.temperature_collection_anomaly.type = readUInt8(bytes, counterObj, 1);
						break;
				}
				break;
			case 0xb4:
				var ipso_type_v1 = bytes[counterObj.i++];
				switch (ipso_type_v1) {
					case 0x68:
						decoded.humidity_collection_anomaly = decoded.humidity_collection_anomaly || {};
						// 0:collect abnormal
						decoded.humidity_collection_anomaly.type = readUInt8(bytes, counterObj, 1);
						break;
				}
				break;
			case 0xb6:
				var ipso_type_v1 = bytes[counterObj.i++];
				switch (ipso_type_v1) {
					case 0xcb:
						decoded.illuminace_collection_anomaly = decoded.illuminace_collection_anomaly || {};
						// 0:collect abnormal
						decoded.illuminace_collection_anomaly.type = readUInt8(bytes, counterObj, 1);
						break;
					case 0x9d:
						decoded.Lux_collection_anomaly = decoded.Lux_collection_anomaly || {};
						// 0:collect abnormal, 1:collect out of range
						decoded.Lux_collection_anomaly.type = readUInt8(bytes, counterObj, 1);
						break;
				}
				break;
			case 0xb7:
				var ipso_type_v1 = bytes[counterObj.i++];
				switch (ipso_type_v1) {
					case 0x7d:
						decoded.co2_collection_anomaly = decoded.co2_collection_anomaly || {};
						// 0:collect abnormal, 1:collect out of range
						decoded.co2_collection_anomaly.type = readUInt8(bytes, counterObj, 1);
						break;
				}
				break;
			case 0x83:
				var ipso_type_v1 = bytes[counterObj.i++];
				switch (ipso_type_v1) {
					case 0x67:
						decoded.temperature_alarm = decoded.temperature_alarm || {};
						decoded.temperature_alarm.temperature = readInt16LE(bytes, counterObj, 2) / 10;
						decoded.temperature = decoded.temperature_alarm.temperature;
						// 16:below alarm released, 17:below alarm, 18:above alarm released, 19:above alarm, 20:within alarm released, 21:within alarm, 22:exceed tolerance alarm released, 23:exceed tolerance alarm
						decoded.temperature_alarm.alarm_type = readUInt8(bytes, counterObj, 1);
						break;
				}
				break;
			case 0x86:
				var ipso_type_v1 = bytes[counterObj.i++];
				switch (ipso_type_v1) {
					case 0x9d:
						decoded.Lux_alarm = decoded.Lux_alarm || {};
						decoded.Lux_alarm.Lux = readUInt16LE(bytes, counterObj, 2);
						decoded.Lux = decoded.Lux_alarm.Lux;
						// 16:dim, 17:bright
						decoded.Lux_alarm.alarm_type = readUInt8(bytes, counterObj, 1);
						break;
				}
				break;
			case 0x87:
				var ipso_type_v1 = bytes[counterObj.i++];
				switch (ipso_type_v1) {
					case 0x7d:
						decoded.co2_alarm = decoded.co2_alarm || {};
						decoded.co2_alarm.co2 = readUInt16LE(bytes, counterObj, 2);
						decoded.co2 = decoded.co2_alarm.co2;
						// 16:Polluted,2-level alarm released, 17:Polluted,2-level alarm, 18:Bad,1-level alarm released, 19:Bad,1-level alarm
						decoded.co2_alarm.alarm_type = readUInt8(bytes, counterObj, 1);
						break;
				}
				break;
			case 0x20:
				var ipso_type_v1 = bytes[counterObj.i++];
				switch (ipso_type_v1) {
					case 0xce:
						decoded.historical_data_retrieval = decoded.historical_data_retrieval || {};
						decoded.historical_data_retrieval.timestamp = readUInt32LE(bytes, counterObj, 4);
						// 0:data invalid, 1:data valid, 2:data out of range, 3:data collect abnormal
						decoded.historical_data_retrieval.temperature_type = readUInt8(bytes, counterObj, 1);
						decoded.historical_data_retrieval.temperature = readInt16LE(bytes, counterObj, 2) / 10;
						// 0:data invalid, 1:data valid, 2:data out of range, 3:data collect abnormal
						decoded.historical_data_retrieval.humidity_type = readUInt8(bytes, counterObj, 1);
						decoded.historical_data_retrieval.humidity = readUInt8(bytes, counterObj, 1) / 2;
						var bitOptions = readUInt8(bytes, counterObj, 1);
						// 0:data invalid, 1:data valid
						decoded.historical_data_retrieval.pir_type = extractBits(bitOptions, 6, 7);
						// 0:vacant, 1:trigger
						decoded.historical_data_retrieval.pir_status = extractBits(bitOptions, 0, 6);
						decoded.historical_data_retrieval.pir_count = readUInt16LE(bytes, counterObj, 2);
						// 0:data invalid, 1:data valid, 2:data out of range, 3:data collect abnormal
						decoded.historical_data_retrieval.als_level_type = readUInt8(bytes, counterObj, 1);
						decoded.historical_data_retrieval.als_level = readUInt16LE(bytes, counterObj, 2);
						// 0:data invalid, 1:data valid, 2:data out of range, 3:data collect abnormal
						decoded.historical_data_retrieval.co2_type = readUInt8(bytes, counterObj, 1);
						decoded.historical_data_retrieval.co2 = readUInt16LE(bytes, counterObj, 2);
						break;
				}
				break;
			case 0x21:
				var ipso_type_v1 = bytes[counterObj.i++];
				switch (ipso_type_v1) {
					case 0xce:
						decoded.historical_data_retrieval_Lux = decoded.historical_data_retrieval_Lux || {};
						decoded.historical_data_retrieval_Lux.timestamp = readUInt32LE(bytes, counterObj, 4);
						// 0:data invalid, 1:data valid, 2:data out of range, 3:data collect abnormal
						decoded.historical_data_retrieval_Lux.temperature_type = readUInt8(bytes, counterObj, 1);
						decoded.historical_data_retrieval_Lux.temperature = readInt16LE(bytes, counterObj, 2) / 10;
						// 0:data invalid, 1:data valid, 2:data out of range, 3:data collect abnormal
						decoded.historical_data_retrieval_Lux.humidity_type = readUInt8(bytes, counterObj, 1);
						decoded.historical_data_retrieval_Lux.humidity = readUInt8(bytes, counterObj, 1) / 2;
						var bitOptions = readUInt8(bytes, counterObj, 1);
						// 0:data invalid, 1:data valid
						decoded.historical_data_retrieval_Lux.pir_type = extractBits(bitOptions, 6, 7);
						// 0:vacant, 1:trigger
						decoded.historical_data_retrieval_Lux.pir_status = extractBits(bitOptions, 0, 6);
						decoded.historical_data_retrieval_Lux.pir_count = readUInt16LE(bytes, counterObj, 2);
						// 0:data invalid, 1:data valid, 2:data out of range, 3:data collect abnormal
						decoded.historical_data_retrieval_Lux.Lux_type = readUInt8(bytes, counterObj, 1);
						decoded.historical_data_retrieval_Lux.Lux = readUInt16LE(bytes, counterObj, 2);
						// 0:data invalid, 1:data valid, 2:data out of range, 3:data collect abnormal
						decoded.historical_data_retrieval_Lux.co2_type = readUInt8(bytes, counterObj, 1);
						decoded.historical_data_retrieval_Lux.co2 = readUInt16LE(bytes, counterObj, 2);
						break;
				}
				break;
			case 0xf9:
				var ipso_type_v1 = bytes[counterObj.i++];
				switch (ipso_type_v1) {
					case 0xbd:
						decoded.reporting_interval = decoded.reporting_interval || {};
						// 0:second, 1:minute
						decoded.reporting_interval.unit = readUInt8(bytes, counterObj, 1);
						decoded.reporting_interval.interval = readUInt16LE(bytes, counterObj, 2);
						break;
					case 0xbe:
						decoded.collecting_interval = decoded.collecting_interval || {};
						// 0:temperature,humidity,CO₂ collect interval, 1:illuminace collect interval
						decoded.collecting_interval.id = readUInt8(bytes, counterObj, 1);
						// 0:second, 1:minute
						decoded.collecting_interval.unit = readUInt8(bytes, counterObj, 1);
						decoded.collecting_interval.interval = readUInt16LE(bytes, counterObj, 2);
						break;
					case 0xc0:
						var fixed_value = bytes[counterObj.i + 0];
						switch (fixed_value) {
							case 0: // temperature_unit.sensor_id
								decoded.temperature_unit = decoded.temperature_unit || {};
								// 0:temperature, 1:Illuminance
								decoded.temperature_unit.sensor_id = readUInt8(bytes, counterObj, 1);
								// 0:celsius, 1:fahrenheit
								decoded.temperature_unit.unit = readUInt8(bytes, counterObj, 1);
								decoded.temperature_unit.sensor_id = undefined;
								break;
							case 1: // illuminance_mode.sensor_id
								decoded.illuminance_mode = decoded.illuminance_mode || {};
								// 0:temperature, 1:Illuminance
								decoded.illuminance_mode.sensor_id = readUInt8(bytes, counterObj, 1);
								// 0:illuminance level, 1:illuminance value
								decoded.illuminance_mode.mode = readUInt8(bytes, counterObj, 1);
								decoded.illuminance_mode.sensor_id = undefined;
								break;
						}
						break;
					case 0xc4:
						decoded.co2_alarm_rule = decoded.co2_alarm_rule || {};
						// 0：disable, 1：enable
						decoded.co2_alarm_rule.enable = readUInt8(bytes, counterObj, 1);
						// 0:enable 1-level only, 1:enable 2-levle only, 2:enable 1-level&2-levle
						decoded.co2_alarm_rule.mode = readUInt8(bytes, counterObj, 1);
						decoded.co2_alarm_rule.level1_value = readUInt16LE(bytes, counterObj, 2);
						decoded.co2_alarm_rule.level2_value = readUInt16LE(bytes, counterObj, 2);
						break;
					case 0xbc:
						var fixed_value = bytes[counterObj.i + 0];
						switch (fixed_value) {
							case 0: // pir_trigger_report.type
								decoded.pir_trigger_report = decoded.pir_trigger_report || {};
								// 0:trigger report, 1:vacant report
								decoded.pir_trigger_report.type = readUInt8(bytes, counterObj, 1);
								// 0：disable, 1：enable
								decoded.pir_trigger_report.enable = readUInt8(bytes, counterObj, 1);
								decoded.pir_trigger_report.type = undefined;
								break;
							case 1: // pir_idle_report.type
								decoded.pir_idle_report = decoded.pir_idle_report || {};
								// 0:trigger report, 1:vacant report
								decoded.pir_idle_report.type = readUInt8(bytes, counterObj, 1);
								// 0：disable, 1：enable
								decoded.pir_idle_report.enable = readUInt8(bytes, counterObj, 1);
								decoded.pir_idle_report.type = undefined;
								break;
						}
						break;
					case 0xbf:
						decoded.illuminance_alarm_rule = decoded.illuminance_alarm_rule || {};
						// 0：disable, 1：enable
						decoded.illuminance_alarm_rule.enable = readUInt8(bytes, counterObj, 1);
						decoded.illuminance_alarm_rule.dim_value = readUInt16LE(bytes, counterObj, 2);
						decoded.illuminance_alarm_rule.bright_value = readUInt16LE(bytes, counterObj, 2);
						break;
					case 0x63:
						decoded.d2d_sending = decoded.d2d_sending || {};
						// 0：disable, 1：enable
						decoded.d2d_sending.enable = readUInt8(bytes, counterObj, 1);
						// 0：disable, 1：enable
						decoded.d2d_sending.lora_uplink_enable = readUInt8(bytes, counterObj, 1);
						var bitOptions = readUInt16LE(bytes, counterObj, 2);
						decoded.d2d_sending.temperature_enable = extractBits(bitOptions, 0, 1);
						decoded.d2d_sending.humidity_enable = extractBits(bitOptions, 1, 2);
						break;
					case 0x66:
						// 0：disable, 1：enable
						decoded.d2d_master_enable = readUInt8(bytes, counterObj, 1);
						break;
				}
				break;
			case 0xfd:
				var ipso_type_v1 = bytes[counterObj.i++];
				switch (ipso_type_v1) {
					case 0x6b:
						decoded.retrival_historical_data_by_time = decoded.retrival_historical_data_by_time || {};
						decoded.retrival_historical_data_by_time.time = readUInt32LE(bytes, counterObj, 4);
						break;
					case 0x6c:
						decoded.retrival_historical_data_by_time_range = decoded.retrival_historical_data_by_time_range || {};
						decoded.retrival_historical_data_by_time_range.start_time = readUInt32LE(bytes, counterObj, 4);
						decoded.retrival_historical_data_by_time_range.end_time = readUInt32LE(bytes, counterObj, 4);
						break;
					case 0x6d:
						decoded.stop_historical_data_retrival = readUInt8(bytes, counterObj, 1);
						break;
				}
				break;
		}
		if (unknown_command) {
			throw new Error('unknown command: ' + command_id);
		}
	}

	return decoded;
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
	var major = bytes[0] & 0xff;
	var minor = bytes[1] & 0xff;
	var release = bytes[2] & 0xff;
	var alpha = bytes[3] & 0xff;
	var unit_test = bytes[4] & 0xff;
	var test = bytes[5] & 0xff;

	var version = 'v' + major + '.' + minor;
	if (release !== 0) version += '-r' + release;
	if (alpha !== 0) version += '-a' + alpha;
	if (unit_test !== 0) version += '-u' + unit_test;
	if (test !== 0) version += '-t' + test;
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
	if (startBit < 0 || endBit > 16 || startBit >= endBit) {
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
		"ff_0x0b": "device_status",
		"ff_0x01": "ipso_version",
		"ff_0x16": "sn",
		"ff_0xff": "tsl_version",
		"ff_0xfe": "request_tsl_config",
		"ff_0x09": "hardware_version",
		"ff_0x0a": "firmware_version",
		"ff_0x0f": "lorawan_class",
		"01_0x75": "battery",
		"03_0x67": "temperature",
		"04_0x68": "humidity",
		"05_0x9f": "pir",
		"06_0xcb": "als_level",
		"06_0x9d": "Lux",
		"07_0x7d": "co2",
		"05_0x00": "pir_status_change",
		"b3_0x67": "temperature_collection_anomaly",
		"b4_0x68": "humidity_collection_anomaly",
		"b6_0xcb": "illuminace_collection_anomaly",
		"b6_0x9d": "Lux_collection_anomaly",
		"b7_0x7d": "co2_collection_anomaly",
		"83_0x67": "temperature_alarm",
		"86_0x9d": "Lux_alarm",
		"87_0x7d": "co2_alarm",
		"20_0xce": "historical_data_retrieval",
		"21_0xce": "historical_data_retrieval_Lux",
		"f9_0xbd": "reporting_interval",
		"f9_0xbe": "collecting_interval",
		"ff_0xf2": "alarm_reporting_times",
		"ff_0xf5": "alarm_deactivation_enable",
		"f9_0xc0": "temperature_unit",
		"ff_0x2e": "led_mode",
		"ff_0x25": "button_lock",
		"ff_0x06": "temperature_alarm_rule",
		"f9_0xc4": "co2_alarm_rule",
		"ff_0x18": "pir_enable",
		"f9_0xbc": "pir_trigger_report",
		"ff_0x95": "pir_idle_interval",
		"f9_0xbf": "illuminance_alarm_rule",
		"ff_0xea": "temperature_calibration_settings",
		"ff_0x39": "co2_auto_background_calibration_settings",
		"ff_0x87": "co2_altitude_calibration",
		"f9_0x63": "d2d_sending",
		"f9_0x66": "d2d_master_enable",
		"ff_0x96": "d2d_master_settings",
		"ff_0x96xx": "d2d_master_settings._item",
		"ff_0x68": "data_storage_enable",
		"ff_0x69": "retransmission_enable",
		"ff_0x6a": "retransmission_interval",
		"ff_0x1a": "co2_reset_calibration",
		"ff_0x27": "clear_historical_data",
		"fd_0x6b": "retrival_historical_data_by_time",
		"fd_0x6c": "retrival_historical_data_by_time_range",
		"fd_0x6d": "stop_historical_data_retrival",
		"ff_0x10": "reboot",
		"ff_0x4a": "synchronize_time"
	};
}

exports.decodeUplink = decodeUplink;

var __milesightDownlinkCodec = (function () {
/**
 * Payload Encoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product AM305L
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
	//0xff_0x0b
	if ('device_status' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xff);
		buffer.writeUInt8(0x0b);
		buffer.writeUInt8(0xff);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xff_0x01
	if ('ipso_version' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xff);
		buffer.writeUInt8(0x01);
		buffer.writeUInt8(payload.ipso_version);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xff_0x16
	if ('sn' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xff);
		buffer.writeUInt8(0x16);
		buffer.writeHexString(payload.sn, 8);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xff_0xff
	if ('tsl_version' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xff);
		buffer.writeUInt8(0xff);
		buffer.writeHexString(payload.tsl_version, 2);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xff_0xfe
	if ('request_tsl_config' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xff);
		buffer.writeUInt8(0xfe);
		buffer.writeUInt8(0xff);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xff_0x09
	if ('hardware_version' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xff);
		buffer.writeUInt8(0x09);
		buffer.writeHexString(payload.hardware_version, 2);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xff_0x0a
	if ('firmware_version' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xff);
		buffer.writeUInt8(0x0a);
		buffer.writeHexString(payload.firmware_version, 2);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xff_0x0f
	if ('lorawan_class' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xff);
		buffer.writeUInt8(0x0f);
		// 0:class_a
		buffer.writeUInt8(payload.lorawan_class);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xff_0xf2
	if ('alarm_reporting_times' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xff);
		buffer.writeUInt8(0xf2);
		if (payload.alarm_reporting_times < 1 || payload.alarm_reporting_times > 1000) {
			throw new Error('alarm_reporting_times must be between 1 and 1000');
		}
		buffer.writeUInt16LE(payload.alarm_reporting_times);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xff_0xf5
	if ('alarm_deactivation_enable' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xff);
		buffer.writeUInt8(0xf5);
		// 0: disable, 1: enable
		buffer.writeUInt8(payload.alarm_deactivation_enable);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xff_0x2e
	if ('led_mode' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xff);
		buffer.writeUInt8(0x2e);
		// 0：disable, 2：enable
		buffer.writeUInt8(payload.led_mode);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xff_0x25
	if ('button_lock' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xff);
		buffer.writeUInt8(0x25);
		var bitOptions = 0;
		// 0：disable, 1：enable
		bitOptions |= payload.button_lock.power_off << 0;

		// 0：disable, 1：enable
		bitOptions |= payload.button_lock.power_on << 1;
		buffer.writeUInt8(bitOptions);

		encoded = encoded.concat(buffer.toBytes());
	}
	//0xff_0x06
	if ('temperature_alarm_rule' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xff);
		buffer.writeUInt8(0x06);
		var bitOptions = 0;
		// 0：disable, 1：enable
		bitOptions |= payload.temperature_alarm_rule.enable << 6;

		// 1:condition: x<A, 2:condition: x>B, 3:condition: A<x<B, 4:condition: x<A or x>B
		bitOptions |= payload.temperature_alarm_rule.condition << 0;

		bitOptions |= 1 << 3;

		buffer.writeUInt8(bitOptions);
		if (payload.temperature_alarm_rule.threshold_max < -20 || payload.temperature_alarm_rule.threshold_max > 60) {
			throw new Error('temperature_alarm_rule.threshold_max must be between -20 and 60');
		}
		buffer.writeInt16LE(payload.temperature_alarm_rule.threshold_max * 10);
		if (payload.temperature_alarm_rule.threshold_min < -20 || payload.temperature_alarm_rule.threshold_min > 60) {
			throw new Error('temperature_alarm_rule.threshold_min must be between -20 and 60');
		}
		buffer.writeInt16LE(payload.temperature_alarm_rule.threshold_min * 10);
		buffer.writeUInt16LE(0);
		buffer.writeUInt16LE(0);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xff_0x18 // pir_enable.sensor_id
	if ('pir_enable' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xff);
		buffer.writeUInt8(0x18);
		// 1:temperature, 2:humidity, 3:PIR, 4:Illuminance, 5:CO₂
		buffer.writeUInt8(3);
		var bitOptions = 0;
		// 0：disable, 1：enable
		bitOptions |= payload.pir_enable.enable << 2;
		buffer.writeUInt8(bitOptions);

		encoded = encoded.concat(buffer.toBytes());
	}
	//0xff_0x18 // illuminance_collecting_enable.sensor_id
	if ('illuminance_collecting_enable' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xff);
		buffer.writeUInt8(0x18);
		// 1:temperature, 2:humidity, 3:PIR, 4:Illuminance, 5:CO₂
		buffer.writeUInt8(4);
		var bitOptions = 0;
		// 0：disable, 1：enable
		bitOptions |= payload.illuminance_collecting_enable.enable << 3;
		buffer.writeUInt8(bitOptions);

		encoded = encoded.concat(buffer.toBytes());
	}
	//0xff_0x18 // co2_collecting_enable.sensor_id
	if ('co2_collecting_enable' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xff);
		buffer.writeUInt8(0x18);
		// 1:temperature, 2:humidity, 3:PIR, 4:Illuminance, 5:CO₂
		buffer.writeUInt8(5);
		var bitOptions = 0;
		// 0：disable, 1：enable
		bitOptions |= payload.co2_collecting_enable.enable << 4;
		buffer.writeUInt8(bitOptions);

		encoded = encoded.concat(buffer.toBytes());
	}
	//0xff_0x95
	if ('pir_idle_interval' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xff);
		buffer.writeUInt8(0x95);
		if (payload.pir_idle_interval < 60 || payload.pir_idle_interval > 3600) {
			throw new Error('pir_idle_interval must be between 60 and 3600');
		}
		buffer.writeUInt16LE(payload.pir_idle_interval);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xff_0xea // temperature_calibration_settings.id
	if ('temperature_calibration_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xff);
		buffer.writeUInt8(0xea);
		var bitOptions = 0;
		// 0:temperature, 1:humidity, 2:CO₂
		bitOptions |= 0 << 0;

		// 0: disable, 1: enable
		bitOptions |= payload.temperature_calibration_settings.enable << 7;
		buffer.writeUInt8(bitOptions);

		if (payload.temperature_calibration_settings.value < -80 || payload.temperature_calibration_settings.value > 80) {
			throw new Error('temperature_calibration_settings.value must be between -80 and 80');
		}
		buffer.writeInt16LE(payload.temperature_calibration_settings.value * 10);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xff_0xea // humidity_calibration_settings.id
	if ('humidity_calibration_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xff);
		buffer.writeUInt8(0xea);
		var bitOptions = 0;
		// 0:temperature, 1:humidity, 2:CO₂
		bitOptions |= 1 << 0;

		// 0: disable, 1: enable
		bitOptions |= payload.humidity_calibration_settings.enable << 7;
		buffer.writeUInt8(bitOptions);

		if (payload.humidity_calibration_settings.value < -100 || payload.humidity_calibration_settings.value > 100) {
			throw new Error('humidity_calibration_settings.value must be between -100 and 100');
		}
		buffer.writeInt16LE(payload.humidity_calibration_settings.value * 2);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xff_0xea // co2_calibration_settings.id
	if ('co2_calibration_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xff);
		buffer.writeUInt8(0xea);
		var bitOptions = 0;
		// 0:temperature, 1:humidity, 2:CO₂
		bitOptions |= 2 << 0;

		// 0: disable, 1: enable
		bitOptions |= payload.co2_calibration_settings.enable << 7;
		buffer.writeUInt8(bitOptions);

		if (payload.co2_calibration_settings.value < -4600 || payload.co2_calibration_settings.value > 4600) {
			throw new Error('co2_calibration_settings.value must be between -4600 and 4600');
		}
		buffer.writeUInt16LE(payload.co2_calibration_settings.value);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xff_0x39
	if ('co2_auto_background_calibration_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xff);
		buffer.writeUInt8(0x39);
		// 0: disable, 1: enable
		buffer.writeUInt8(payload.co2_auto_background_calibration_settings.enable);
		buffer.writeUInt16LE(payload.co2_auto_background_calibration_settings.target_value);
		buffer.writeUInt16LE(payload.co2_auto_background_calibration_settings.period);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xff_0x87
	if ('co2_altitude_calibration' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xff);
		buffer.writeUInt8(0x87);
		// 0: disable, 1: enable
		buffer.writeUInt8(payload.co2_altitude_calibration.enable);
		if (payload.co2_altitude_calibration.value < 0 || payload.co2_altitude_calibration.value > 5000) {
			throw new Error('co2_altitude_calibration.value must be between 0 and 5000');
		}
		buffer.writeUInt16LE(payload.co2_altitude_calibration.value);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xff_0x96
	if ('d2d_master_settings' in payload) {
		var buffer = new Buffer();
		for (var d2d_master_settings_id = 0; d2d_master_settings_id < (payload.d2d_master_settings && payload.d2d_master_settings.length); d2d_master_settings_id++) {
			var d2d_master_settings_item = payload.d2d_master_settings[d2d_master_settings_id];
			var d2d_master_settings_item_id = d2d_master_settings_item.trigger_condition;
			buffer.writeUInt8(0xff);
			buffer.writeUInt8(0x96);
			buffer.writeUInt8(d2d_master_settings_item_id);
			// 0：disable, 1：enable
			buffer.writeUInt8(d2d_master_settings_item.enable);
			// 0：disable, 1：enable
			buffer.writeUInt8(d2d_master_settings_item.lora_uplink_enable);
			buffer.writeHexString(d2d_master_settings_item.control_command, 2);
			// 0：disable, 1：enable
			buffer.writeUInt8(d2d_master_settings_item.control_time_enable);
			if (d2d_master_settings_item.control_time < 1 || d2d_master_settings_item.control_time > 1440) {
				throw new Error('control_time must be between 1 and 1440');
			}
			buffer.writeUInt16LE(d2d_master_settings_item.control_time);
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xff_0x68
	if ('data_storage_enable' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xff);
		buffer.writeUInt8(0x68);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.data_storage_enable.enable);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xff_0x69
	if ('retransmission_enable' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xff);
		buffer.writeUInt8(0x69);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.retransmission_enable.enable);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xff_0x6a // retransmission_interval.type
	if ('retransmission_interval' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xff);
		buffer.writeUInt8(0x6a);
		// 0: retransmission interval, 1: retrival interval
		buffer.writeUInt8(0);
		if (payload.retransmission_interval.interval < 30 || payload.retransmission_interval.interval > 1200) {
			throw new Error('retransmission_interval.interval must be between 30 and 1200');
		}
		buffer.writeUInt16LE(payload.retransmission_interval.interval);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xff_0x6a // retrival_interval.type
	if ('retrival_interval' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xff);
		buffer.writeUInt8(0x6a);
		// 0: retransmission interval, 1: retrival interval
		buffer.writeUInt8(1);
		if (payload.retrival_interval.interval < 30 || payload.retrival_interval.interval > 1200) {
			throw new Error('retrival_interval.interval must be between 30 and 1200');
		}
		buffer.writeUInt16LE(payload.retrival_interval.interval);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xff_0x1a // co2_reset_calibration
	if ('co2_reset_calibration' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xff);
		buffer.writeUInt8(0x1a);
		buffer.writeUInt8(0);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xff_0x1a // co2_background_calibration
	if ('co2_background_calibration' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xff);
		buffer.writeUInt8(0x1a);
		buffer.writeUInt8(3);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xff_0x27
	if ('clear_historical_data' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xff);
		buffer.writeUInt8(0x27);
		buffer.writeUInt8(1);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xff_0x10
	if ('reboot' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xff);
		buffer.writeUInt8(0x10);
		buffer.writeUInt8(0xff);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xff_0x4a
	if ('synchronize_time' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xff);
		buffer.writeUInt8(0x4a);
		buffer.writeUInt8(0);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x01_0x75
	if ('battery' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x01);
		buffer.writeUInt8(0x75);
		if (payload.battery < 1 || payload.battery > 100) {
			throw new Error('battery must be between 1 and 100');
		}
		buffer.writeUInt8(payload.battery);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x03_0x67
	if ('temperature' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x03);
		buffer.writeUInt8(0x67);
		if (payload.temperature < -20 || payload.temperature > 60) {
			throw new Error('temperature must be between -20 and 60');
		}
		buffer.writeInt16LE(payload.temperature * 10);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x04_0x68
	if ('humidity' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x04);
		buffer.writeUInt8(0x68);
		if (payload.humidity < 0 || payload.humidity > 100) {
			throw new Error('humidity must be between 0 and 100');
		}
		buffer.writeUInt8(payload.humidity * 2);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x05_0x9f
	if ('pir' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x05);
		buffer.writeUInt8(0x9f);
		var bitOptions = 0;
		bitOptions |= payload.pir.pir_status << 15;

		bitOptions |= payload.pir.pir_count << 0;
		buffer.writeUInt16LE(bitOptions);

		encoded = encoded.concat(buffer.toBytes());
	}
	//0x05_0x00
	if ('pir_status_change' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x05);
		buffer.writeUInt8(0x00);
		// 0:vacant, 1:trigger
		buffer.writeUInt8(payload.pir_status_change.status);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x06_0xcb
	if ('als_level' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x06);
		buffer.writeUInt8(0xcb);
		if (payload.als_level < 0 || payload.als_level > 5) {
			throw new Error('als_level must be between 0 and 5');
		}
		buffer.writeUInt8(payload.als_level);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x06_0x9d
	if ('Lux' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x06);
		buffer.writeUInt8(0x9d);
		if (payload.Lux < 0 || payload.Lux > 60000) {
			throw new Error('Lux must be between 0 and 60000');
		}
		buffer.writeUInt16LE(payload.Lux);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x07_0x7d
	if ('co2' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x07);
		buffer.writeUInt8(0x7d);
		if (payload.co2 < 400 || payload.co2 > 5000) {
			throw new Error('co2 must be between 400 and 5000');
		}
		buffer.writeUInt16LE(payload.co2);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xb3_0x67
	if ('temperature_collection_anomaly' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xb3);
		buffer.writeUInt8(0x67);
		// 0:collect abnormal, 1:collect out of range
		buffer.writeUInt8(payload.temperature_collection_anomaly.type);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xb4_0x68
	if ('humidity_collection_anomaly' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xb4);
		buffer.writeUInt8(0x68);
		// 0:collect abnormal
		buffer.writeUInt8(payload.humidity_collection_anomaly.type);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xb6_0xcb
	if ('illuminace_collection_anomaly' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xb6);
		buffer.writeUInt8(0xcb);
		// 0:collect abnormal
		buffer.writeUInt8(payload.illuminace_collection_anomaly.type);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xb6_0x9d
	if ('Lux_collection_anomaly' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xb6);
		buffer.writeUInt8(0x9d);
		// 0:collect abnormal, 1:collect out of range
		buffer.writeUInt8(payload.Lux_collection_anomaly.type);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xb7_0x7d
	if ('co2_collection_anomaly' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xb7);
		buffer.writeUInt8(0x7d);
		// 0:collect abnormal, 1:collect out of range
		buffer.writeUInt8(payload.co2_collection_anomaly.type);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x83_0x67
	if ('temperature_alarm' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x83);
		buffer.writeUInt8(0x67);
		buffer.writeInt16LE(payload.temperature_alarm.temperature * 10);
		// 16:below alarm released, 17:below alarm, 18:above alarm released, 19:above alarm, 20:within alarm released, 21:within alarm, 22:exceed tolerance alarm released, 23:exceed tolerance alarm
		buffer.writeUInt8(payload.temperature_alarm.alarm_type);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x86_0x9d
	if ('Lux_alarm' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x86);
		buffer.writeUInt8(0x9d);
		buffer.writeUInt16LE(payload.Lux_alarm.Lux);
		// 16:dim, 17:bright
		buffer.writeUInt8(payload.Lux_alarm.alarm_type);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x87_0x7d
	if ('co2_alarm' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x87);
		buffer.writeUInt8(0x7d);
		buffer.writeUInt16LE(payload.co2_alarm.co2);
		// 16:Polluted,2-level alarm released, 17:Polluted,2-level alarm, 18:Bad,1-level alarm released, 19:Bad,1-level alarm
		buffer.writeUInt8(payload.co2_alarm.alarm_type);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x20_0xce
	if ('historical_data_retrieval' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x20);
		buffer.writeUInt8(0xce);
		buffer.writeUInt32LE(payload.historical_data_retrieval.timestamp);
		// 0:data invalid, 1:data valid, 2:data out of range, 3:data collect abnormal
		buffer.writeUInt8(payload.historical_data_retrieval.temperature_type);
		buffer.writeInt16LE(payload.historical_data_retrieval.temperature * 10);
		// 0:data invalid, 1:data valid, 2:data out of range, 3:data collect abnormal
		buffer.writeUInt8(payload.historical_data_retrieval.humidity_type);
		buffer.writeUInt8(payload.historical_data_retrieval.humidity * 2);
		var bitOptions = 0;
		// 0:data invalid, 1:data valid
		bitOptions |= payload.historical_data_retrieval.pir_type << 6;

		// 0:vacant, 1:trigger
		bitOptions |= payload.historical_data_retrieval.pir_status << 0;

		buffer.writeUInt8(bitOptions);
		buffer.writeUInt16LE(payload.historical_data_retrieval.pir_count);
		// 0:data invalid, 1:data valid, 2:data out of range, 3:data collect abnormal
		buffer.writeUInt8(payload.historical_data_retrieval.als_level_type);
		buffer.writeUInt16LE(payload.historical_data_retrieval.als_level);
		// 0:data invalid, 1:data valid, 2:data out of range, 3:data collect abnormal
		buffer.writeUInt8(payload.historical_data_retrieval.co2_type);
		buffer.writeUInt16LE(payload.historical_data_retrieval.co2);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x21_0xce
	if ('historical_data_retrieval_Lux' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x21);
		buffer.writeUInt8(0xce);
		buffer.writeUInt32LE(payload.historical_data_retrieval_Lux.timestamp);
		// 0:data invalid, 1:data valid, 2:data out of range, 3:data collect abnormal
		buffer.writeUInt8(payload.historical_data_retrieval_Lux.temperature_type);
		buffer.writeInt16LE(payload.historical_data_retrieval_Lux.temperature * 10);
		// 0:data invalid, 1:data valid, 2:data out of range, 3:data collect abnormal
		buffer.writeUInt8(payload.historical_data_retrieval_Lux.humidity_type);
		buffer.writeUInt8(payload.historical_data_retrieval_Lux.humidity * 2);
		var bitOptions = 0;
		// 0:data invalid, 1:data valid
		bitOptions |= payload.historical_data_retrieval_Lux.pir_type << 6;

		// 0:vacant, 1:trigger
		bitOptions |= payload.historical_data_retrieval_Lux.pir_status << 0;

		buffer.writeUInt8(bitOptions);
		buffer.writeUInt16LE(payload.historical_data_retrieval_Lux.pir_count);
		// 0:data invalid, 1:data valid, 2:data out of range, 3:data collect abnormal
		buffer.writeUInt8(payload.historical_data_retrieval_Lux.Lux_type);
		buffer.writeUInt16LE(payload.historical_data_retrieval_Lux.Lux);
		// 0:data invalid, 1:data valid, 2:data out of range, 3:data collect abnormal
		buffer.writeUInt8(payload.historical_data_retrieval_Lux.co2_type);
		buffer.writeUInt16LE(payload.historical_data_retrieval_Lux.co2);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xf9_0xbd
	if ('reporting_interval' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xf9);
		buffer.writeUInt8(0xbd);
		// 0:second, 1:minute
		buffer.writeUInt8(1);
		if (payload.reporting_interval.interval < 1 || payload.reporting_interval.interval > 1440) {
			throw new Error('reporting_interval.interval must be between 1 and 1440');
		}
		buffer.writeUInt16LE(payload.reporting_interval.interval);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xf9_0xbe
	if ('collecting_interval' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xf9);
		buffer.writeUInt8(0xbe);
		// 0:temperature,humidity,CO₂ collect interval, 1:illuminace collect interval
		buffer.writeUInt8(0);
		// 0:second, 1:minute
		buffer.writeUInt8(1);
		if (payload.collecting_interval.interval < 1 || payload.collecting_interval.interval > 1440) {
			throw new Error('collecting_interval.interval must be between 1 and 1440');
		}
		buffer.writeUInt16LE(payload.collecting_interval.interval);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xf9_0xc0 // temperature_unit.sensor_id
	if ('temperature_unit' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xf9);
		buffer.writeUInt8(0xc0);
		// 0:temperature, 1:Illuminance
		buffer.writeUInt8(0);
		// 0:celsius, 1:fahrenheit
		buffer.writeUInt8(payload.temperature_unit.unit);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xf9_0xc0 // illuminance_mode.sensor_id
	if ('illuminance_mode' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xf9);
		buffer.writeUInt8(0xc0);
		// 0:temperature, 1:Illuminance
		buffer.writeUInt8(1);
		// 0:illuminance level, 1:illuminance value
		buffer.writeUInt8(payload.illuminance_mode.mode);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xf9_0xc4
	if ('co2_alarm_rule' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xf9);
		buffer.writeUInt8(0xc4);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.co2_alarm_rule.enable);
		// 0:enable 1-level only, 1:enable 2-levle only, 2:enable 1-level&2-levle
		buffer.writeUInt8(payload.co2_alarm_rule.mode);
		if (payload.co2_alarm_rule.level1_value < 400 || payload.co2_alarm_rule.level1_value > 5000) {
			throw new Error('co2_alarm_rule.level1_value must be between 400 and 5000');
		}
		buffer.writeUInt16LE(payload.co2_alarm_rule.level1_value);
		if (payload.co2_alarm_rule.level2_value < 400 || payload.co2_alarm_rule.level2_value > 5000) {
			throw new Error('co2_alarm_rule.level2_value must be between 400 and 5000');
		}
		buffer.writeUInt16LE(payload.co2_alarm_rule.level2_value);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xf9_0xbc // pir_trigger_report.type
	if ('pir_trigger_report' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xf9);
		buffer.writeUInt8(0xbc);
		// 0:trigger report, 1:vacant report
		buffer.writeUInt8(0);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.pir_trigger_report.enable);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xf9_0xbc // pir_idle_report.type
	if ('pir_idle_report' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xf9);
		buffer.writeUInt8(0xbc);
		// 0:trigger report, 1:vacant report
		buffer.writeUInt8(1);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.pir_idle_report.enable);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xf9_0xbf
	if ('illuminance_alarm_rule' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xf9);
		buffer.writeUInt8(0xbf);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.illuminance_alarm_rule.enable);
		if (payload.illuminance_alarm_rule.dim_value < 0 || payload.illuminance_alarm_rule.dim_value > 60000) {
			throw new Error('illuminance_alarm_rule.dim_value must be between 0 and 60000');
		}
		buffer.writeUInt16LE(payload.illuminance_alarm_rule.dim_value);
		if (payload.illuminance_alarm_rule.bright_value < 0 || payload.illuminance_alarm_rule.bright_value > 60000) {
			throw new Error('illuminance_alarm_rule.bright_value must be between 0 and 60000');
		}
		buffer.writeUInt16LE(payload.illuminance_alarm_rule.bright_value);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xf9_0x63
	if ('d2d_sending' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xf9);
		buffer.writeUInt8(0x63);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.d2d_sending.enable);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.d2d_sending.lora_uplink_enable);
		var bitOptions = 0;
		bitOptions |= payload.d2d_sending.temperature_enable << 0;

		bitOptions |= payload.d2d_sending.humidity_enable << 1;
		buffer.writeUInt16LE(bitOptions);

		encoded = encoded.concat(buffer.toBytes());
	}
	//0xf9_0x66
	if ('d2d_master_enable' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xf9);
		buffer.writeUInt8(0x66);
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.d2d_master_enable);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xfd_0x6b
	if ('retrival_historical_data_by_time' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xfd);
		buffer.writeUInt8(0x6b);
		buffer.writeUInt32LE(payload.retrival_historical_data_by_time.time);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xfd_0x6c
	if ('retrival_historical_data_by_time_range' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xfd);
		buffer.writeUInt8(0x6c);
		buffer.writeUInt32LE(payload.retrival_historical_data_by_time_range.start_time);
		buffer.writeUInt32LE(payload.retrival_historical_data_by_time_range.end_time);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xfd_0x6d
	if ('stop_historical_data_retrival' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xfd);
		buffer.writeUInt8(0x6d);
		buffer.writeUInt8(0xff);
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
		"device_status": "ff_0x0b",
		"ipso_version": "ff_0x01",
		"sn": "ff_0x16",
		"tsl_version": "ff_0xff",
		"request_tsl_config": "ff_0xfe",
		"hardware_version": "ff_0x09",
		"firmware_version": "ff_0x0a",
		"lorawan_class": "ff_0x0f",
		"battery": "01_0x75",
		"temperature": "03_0x67",
		"humidity": "04_0x68",
		"pir": "05_0x9f",
		"als_level": "06_0xcb",
		"Lux": "06_0x9d",
		"co2": "07_0x7d",
		"pir_status_change": "05_0x00",
		"temperature_collection_anomaly": "b3_0x67",
		"humidity_collection_anomaly": "b4_0x68",
		"illuminace_collection_anomaly": "b6_0xcb",
		"Lux_collection_anomaly": "b6_0x9d",
		"co2_collection_anomaly": "b7_0x7d",
		"temperature_alarm": "83_0x67",
		"Lux_alarm": "86_0x9d",
		"co2_alarm": "87_0x7d",
		"historical_data_retrieval": "20_0xce",
		"historical_data_retrieval_Lux": "21_0xce",
		"reporting_interval": "f9_0xbd",
		"collecting_interval": "f9_0xbe",
		"alarm_reporting_times": "ff_0xf2",
		"alarm_deactivation_enable": "ff_0xf5",
		"temperature_unit": "f9_0xc0",
		"led_mode": "ff_0x2e",
		"button_lock": "ff_0x25",
		"temperature_alarm_rule": "ff_0x06",
		"co2_alarm_rule": "f9_0xc4",
		"pir_enable": "ff_0x18",
		"pir_trigger_report": "f9_0xbc",
		"pir_idle_interval": "ff_0x95",
		"illuminance_alarm_rule": "f9_0xbf",
		"temperature_calibration_settings": "ff_0xea",
		"co2_auto_background_calibration_settings": "ff_0x39",
		"co2_altitude_calibration": "ff_0x87",
		"d2d_sending": "f9_0x63",
		"d2d_master_enable": "f9_0x66",
		"d2d_master_settings": "ff_0x96",
		"d2d_master_settings._item": "ff_0x96xx",
		"data_storage_enable": "ff_0x68",
		"retransmission_enable": "ff_0x69",
		"retransmission_interval": "ff_0x6a",
		"co2_reset_calibration": "ff_0x1a",
		"clear_historical_data": "ff_0x27",
		"retrival_historical_data_by_time": "fd_0x6b",
		"retrival_historical_data_by_time_range": "fd_0x6c",
		"stop_historical_data_retrival": "fd_0x6d",
		"reboot": "ff_0x10",
		"synchronize_time": "ff_0x4a"
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
