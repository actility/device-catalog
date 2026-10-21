/**
 * Payload Decoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product WT401
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
			case 0xc9:
				// 0：disable, 1：enable
				decoded.random_key = readUInt8(bytes, counterObj, 1);
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
			case 0xb9:
				decoded.device_time = decoded.device_time || {};
				decoded.device_time.current_time = readUInt32LE(bytes, counterObj, 4);
				decoded.device_time.running_time = readUInt32LE(bytes, counterObj, 4);
				decoded.device_time.power_on_time = readUInt32LE(bytes, counterObj, 4);
				break;
			case 0xb8:
				decoded.battery_info = decoded.battery_info || {};
				decoded.battery_info.battery_capacity = readUInt32LE(bytes, counterObj, 4) / 1000;
				decoded.battery_info.battery_consumption = readUInt32LE(bytes, counterObj, 4) / 1000;
				decoded.battery_info.battery_left = readUInt32LE(bytes, counterObj, 4) / 1000;
				decoded.battery_info.battery_voltage = readUInt16LE(bytes, counterObj, 2) / 1000;
				decoded.battery_info.current_battery_status = readHexString(bytes, counterObj, 2);
				break;
			case 0xcd:
				decoded.ble_configuration_settings = decoded.ble_configuration_settings || {};
				var ble_configuration_settings_command = readUInt8(bytes, counterObj, 1);
				if (ble_configuration_settings_command == 0x00) {
					// 0：disable, 1：enable
					decoded.ble_configuration_settings.enable = readUInt8(bytes, counterObj, 1);
				}
				if (ble_configuration_settings_command == 0x01) {
					decoded.ble_configuration_settings.local_id = decoded.ble_configuration_settings.local_id || {};
					// 0：public, 1：private
					decoded.ble_configuration_settings.local_id.type = readUInt8(bytes, counterObj, 1);
					decoded.ble_configuration_settings.local_id.address = readHexString(bytes, counterObj, 6);
				}
				if (ble_configuration_settings_command == 0x05) {
					decoded.ble_configuration_settings.local_name_first = readString(bytes, counterObj, 8);
				}
				if (ble_configuration_settings_command == 0x06) {
					decoded.ble_configuration_settings.local_name_last = readString(bytes, counterObj, 5);
				}
				if (ble_configuration_settings_command == 0x07) {
					decoded.ble_configuration_settings.pair_info = decoded.ble_configuration_settings.pair_info || {};
					// 0：public, 1：private
					decoded.ble_configuration_settings.pair_info.type = readUInt8(bytes, counterObj, 1);
					decoded.ble_configuration_settings.pair_info.addr = readHexString(bytes, counterObj, 6);
					decoded.ble_configuration_settings.pair_info.mac = readHexString(bytes, counterObj, 8);
					decoded.ble_configuration_settings.pair_info.name_length = readUInt8(bytes, counterObj, 1);
					decoded.ble_configuration_settings.pair_info.name = readString(bytes, counterObj, decoded.ble_configuration_settings.pair_info.name_length);
				}
				if (ble_configuration_settings_command == 0x04) {
					decoded.ble_configuration_settings.pair_name = decoded.ble_configuration_settings.pair_name || [];
					var channel = readUInt8(bytes, counterObj, 1);
					var pair_name_item = pickArrayItem(decoded.ble_configuration_settings.pair_name, channel, 'channel');
					pair_name_item.channel = channel;
					insertArrayItem(decoded.ble_configuration_settings.pair_name, pair_name_item, 'channel');
					pair_name_item.length = readUInt8(bytes, counterObj, 1);
					pair_name_item.content = readString(bytes, counterObj, pair_name_item.length);
				}
				if (ble_configuration_settings_command == 0x02) {
					decoded.ble_configuration_settings.pair_mac = decoded.ble_configuration_settings.pair_mac || [];
					var channel = readUInt8(bytes, counterObj, 1);
					var pair_mac_item = pickArrayItem(decoded.ble_configuration_settings.pair_mac, channel, 'channel');
					pair_mac_item.channel = channel;
					insertArrayItem(decoded.ble_configuration_settings.pair_mac, pair_mac_item, 'channel');
					pair_mac_item.mac = readHexString(bytes, counterObj, 8);
				}
				if (ble_configuration_settings_command == 0x03) {
					decoded.ble_configuration_settings.pair_addr = decoded.ble_configuration_settings.pair_addr || [];
					var channel = readUInt8(bytes, counterObj, 1);
					var pair_addr_item = pickArrayItem(decoded.ble_configuration_settings.pair_addr, channel, 'channel');
					pair_addr_item.channel = channel;
					insertArrayItem(decoded.ble_configuration_settings.pair_addr, pair_addr_item, 'channel');
					// 0：public, 1：private
					pair_addr_item.type = readUInt8(bytes, counterObj, 1);
					pair_addr_item.mac = readHexString(bytes, counterObj, 6);
				}
				break;
			case 0xba:
				decoded.ble_new_event = decoded.ble_new_event || [];
				var index = readUInt8(bytes, counterObj, 1);
				var ble_new_event_item = pickArrayItem(decoded.ble_new_event, index, 'index');
				ble_new_event_item.index = index;
				insertArrayItem(decoded.ble_new_event, ble_new_event_item, 'index');
				// 0: Not paired, 1: Paired, 2: Disconnected
				ble_new_event_item.status = readUInt8(bytes, counterObj, 1);
				ble_new_event_item.mac = readHexString(bytes, counterObj, 8);
				break;
			case 0x00:
				decoded.battery = readUInt8(bytes, counterObj, 1);
				break;
			case 0x01:
				decoded.temperature = readInt16LE(bytes, counterObj, 2) / 100;
				break;
			case 0x02:
				decoded.humidity = readUInt16LE(bytes, counterObj, 2) / 10;
				break;
			case 0x08:
				// 0：Vacant, 1：Occupied, 2：Night Occupied
				decoded.pir_status = readUInt8(bytes, counterObj, 1);
				break;
			case 0x03:
				// 0：heat, 1：em heat, 2：cool, 3：auto, 4：dehumidify, 5：ventilation, 10：off, 11：none
				decoded.temperature_mode = readUInt8(bytes, counterObj, 1);
				break;
			case 0x06:
				decoded.target_temperature1 = readInt16LE(bytes, counterObj, 2) / 100;
				break;
			case 0x07:
				decoded.target_temperature2 = readInt16LE(bytes, counterObj, 2) / 100;
				break;
			case 0x04:
				// 0：auto, 1：circulate, 2：on, 3：low, 4：medium, 5：high, 10：off, 11：none/keep
				decoded.fan_mode = readUInt8(bytes, counterObj, 1);
				break;
			case 0x05:
				// 0:plan0, 1:plan1, 2:plan2, 3:plan3, 4:plan4, 5:plan5, 6:plan6, 7:plan7, 8:plan8, 9:plan9, 10:plan10, 11:plan11, 12:plan12, 13:plan13, 14:plan14, 15:plan15, 255:Not executed
				decoded.execution_plan_id = readUInt8(bytes, counterObj, 1);
				break;
			case 0x0b:
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
				if (decoded.temperature_alarm.type == 0x03) {
					decoded.temperature_alarm.no_data = decoded.temperature_alarm.no_data || {};
				}
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
				if (decoded.humidity_alarm.type == 0x03) {
					decoded.humidity_alarm.no_data = decoded.humidity_alarm.no_data || {};
				}
				break;
			case 0x09:
				decoded.ble_event = decoded.ble_event || {};
				decoded.ble_event.type = readUInt8(bytes, counterObj, 1);
				if (decoded.ble_event.type == 0x00) {
					decoded.ble_event.none = decoded.ble_event.none || {};
				}
				if (decoded.ble_event.type == 0x01) {
					decoded.ble_event.pair_cancel = decoded.ble_event.pair_cancel || {};
				}
				if (decoded.ble_event.type == 0x02) {
					decoded.ble_event.disconnect = decoded.ble_event.disconnect || {};
				}
				break;
			case 0x0a:
				decoded.power_bus_event = decoded.power_bus_event || {};
				decoded.power_bus_event.type = readUInt8(bytes, counterObj, 1);
				if (decoded.power_bus_event.type == 0x00) {
					decoded.power_bus_event.none = decoded.power_bus_event.none || {};
				}
				if (decoded.power_bus_event.type == 0x01) {
					decoded.power_bus_event.disconnect = decoded.power_bus_event.disconnect || {};
				}
				break;
			case 0x0d:
				decoded.key_event = decoded.key_event || {};
				decoded.key_event.type = readUInt8(bytes, counterObj, 1);
				if (decoded.key_event.type == 0x00) {
					decoded.key_event.f1 = decoded.key_event.f1 || {};
				}
				if (decoded.key_event.type == 0x01) {
					decoded.key_event.f2 = decoded.key_event.f2 || {};
				}
				if (decoded.key_event.type == 0x02) {
					decoded.key_event.f3 = decoded.key_event.f3 || {};
				}
				break;
			case 0x0f:
				decoded.battery_event = decoded.battery_event || {};
				decoded.battery_event.type = readUInt8(bytes, counterObj, 1);
				if (decoded.battery_event.type == 0x00) {
					decoded.battery_event.recover = decoded.battery_event.recover || {};
				}
				break;
			case 0x8d:
				// 0：BLE, 1：LoRa, 2：BLE+LoRa, 3：PowerBus+LoRa
				decoded.communication_mode = readUInt8(bytes, counterObj, 1);
				break;
			case 0x61:
				decoded.reporting_interval = decoded.reporting_interval || {};
				// 0：BLE, 1：LoRa, 2：BLE+LoRa, 3：PowerBus+LoRa
				var reporting_interval_type = readUInt8(bytes, counterObj, 1);
				if (reporting_interval_type == 0x00) {
					decoded.reporting_interval.ble = decoded.reporting_interval.ble || {};
					// 0：second, 1：min
					decoded.reporting_interval.ble.unit = readUInt8(bytes, counterObj, 1);
					if (decoded.reporting_interval.ble.unit == 0x00) {
						decoded.reporting_interval.ble.seconds_of_time = readUInt16LE(bytes, counterObj, 2);
					}
					if (decoded.reporting_interval.ble.unit == 0x01) {
						decoded.reporting_interval.ble.minutes_of_time = readUInt16LE(bytes, counterObj, 2);
					}
				}
				if (reporting_interval_type == 0x01) {
					decoded.reporting_interval.lora = decoded.reporting_interval.lora || {};
					// 0：second, 1：min
					decoded.reporting_interval.lora.unit = readUInt8(bytes, counterObj, 1);
					if (decoded.reporting_interval.lora.unit == 0x00) {
						decoded.reporting_interval.lora.seconds_of_time = readUInt16LE(bytes, counterObj, 2);
					}
					if (decoded.reporting_interval.lora.unit == 0x01) {
						decoded.reporting_interval.lora.minutes_of_time = readUInt16LE(bytes, counterObj, 2);
					}
				}
				if (reporting_interval_type == 0x02) {
					decoded.reporting_interval.ble_lora = decoded.reporting_interval.ble_lora || {};
					// 0：second, 1：min
					decoded.reporting_interval.ble_lora.unit = readUInt8(bytes, counterObj, 1);
					if (decoded.reporting_interval.ble_lora.unit == 0x00) {
						decoded.reporting_interval.ble_lora.seconds_of_time = readUInt16LE(bytes, counterObj, 2);
					}
					if (decoded.reporting_interval.ble_lora.unit == 0x01) {
						decoded.reporting_interval.ble_lora.minutes_of_time = readUInt16LE(bytes, counterObj, 2);
					}
				}
				if (reporting_interval_type == 0x03) {
					decoded.reporting_interval.power_lora = decoded.reporting_interval.power_lora || {};
					// 0：second, 1：min
					decoded.reporting_interval.power_lora.unit = readUInt8(bytes, counterObj, 1);
					if (decoded.reporting_interval.power_lora.unit == 0x00) {
						decoded.reporting_interval.power_lora.seconds_of_time = readUInt16LE(bytes, counterObj, 2);
					}
					if (decoded.reporting_interval.power_lora.unit == 0x01) {
						decoded.reporting_interval.power_lora.minutes_of_time = readUInt16LE(bytes, counterObj, 2);
					}
				}
				break;
			case 0x6c:
				decoded.communicate_interval = decoded.communicate_interval || {};
				// 0:BLE, 1:LORA, 2:BLE+LORA, 3:POWERBUS+LORA
				var communicate_interval_id = readUInt8(bytes, counterObj, 1);
				if (communicate_interval_id == 0x00) {
					decoded.communicate_interval.ble = decoded.communicate_interval.ble || {};
					// 0：second, 1：min
					decoded.communicate_interval.ble.unit = readUInt8(bytes, counterObj, 1);
					if (decoded.communicate_interval.ble.unit == 0x00) {
						decoded.communicate_interval.ble.seconds_of_time = readUInt16LE(bytes, counterObj, 2);
					}
					if (decoded.communicate_interval.ble.unit == 0x01) {
						decoded.communicate_interval.ble.minutes_of_time = readUInt16LE(bytes, counterObj, 2);
					}
				}
				if (communicate_interval_id == 0x01) {
					decoded.communicate_interval.lora = decoded.communicate_interval.lora || {};
					// 0：second, 1：min
					decoded.communicate_interval.lora.unit = readUInt8(bytes, counterObj, 1);
					if (decoded.communicate_interval.lora.unit == 0x00) {
						decoded.communicate_interval.lora.seconds_of_time = readUInt16LE(bytes, counterObj, 2);
					}
					if (decoded.communicate_interval.lora.unit == 0x01) {
						decoded.communicate_interval.lora.minutes_of_time = readUInt16LE(bytes, counterObj, 2);
					}
				}
				if (communicate_interval_id == 0x02) {
					decoded.communicate_interval.ble_lora = decoded.communicate_interval.ble_lora || {};
					// 0：second, 1：min
					decoded.communicate_interval.ble_lora.unit = readUInt8(bytes, counterObj, 1);
					if (decoded.communicate_interval.ble_lora.unit == 0x00) {
						decoded.communicate_interval.ble_lora.seconds_of_time = readUInt16LE(bytes, counterObj, 2);
					}
					if (decoded.communicate_interval.ble_lora.unit == 0x01) {
						decoded.communicate_interval.ble_lora.minutes_of_time = readUInt16LE(bytes, counterObj, 2);
					}
				}
				if (communicate_interval_id == 0x03) {
					decoded.communicate_interval.power_bus = decoded.communicate_interval.power_bus || {};
					// 0：second, 1：min
					decoded.communicate_interval.power_bus.unit = readUInt8(bytes, counterObj, 1);
					if (decoded.communicate_interval.power_bus.unit == 0x00) {
						decoded.communicate_interval.power_bus.seconds_of_time = readUInt16LE(bytes, counterObj, 2);
					}
					if (decoded.communicate_interval.power_bus.unit == 0x01) {
						decoded.communicate_interval.power_bus.minutes_of_time = readUInt16LE(bytes, counterObj, 2);
					}
				}
				break;
			case 0x60:
				decoded.collection_interval = decoded.collection_interval || {};
				// 0：second, 1：min
				decoded.collection_interval.unit = readUInt8(bytes, counterObj, 1);
				if (decoded.collection_interval.unit == 0x00) {
					decoded.collection_interval.seconds_of_time = readUInt16LE(bytes, counterObj, 2);
				}
				if (decoded.collection_interval.unit == 0x01) {
					decoded.collection_interval.minutes_of_time = readUInt16LE(bytes, counterObj, 2);
				}
				break;
			case 0x63:
				// 0：℃, 1：℉
				decoded.temperature_unit = readUInt8(bytes, counterObj, 1);
				break;
			case 0x7d:
				// 0:Embedded Data, 1:Lora Data, 2: UCController
				decoded.data_sync_to_peer = readUInt8(bytes, counterObj, 1);
				break;
			case 0x7e:
				decoded.data_sync_timeout = readUInt8(bytes, counterObj, 1);
				break;
			case 0x85:
				// 0:disable, 1:enable
				decoded.ble_enable = readUInt8(bytes, counterObj, 1);
				break;
			case 0x8b:
				decoded.ble_name = readString(bytes, counterObj, 32);
				break;
			case 0x67:
				// 0：Off, 1：On
				decoded.system_status = readUInt8(bytes, counterObj, 1);
				break;
			case 0x64:
				decoded.mode_enable = decoded.mode_enable || {};
				var bitOptions = readUInt8(bytes, counterObj, 1);
				// 0：disable, 1：enable
				decoded.mode_enable.heat = extractBits(bitOptions, 0, 1);
				// 0：disable, 1：enable
				decoded.mode_enable.em_heat = extractBits(bitOptions, 1, 2);
				// 0：disable, 1：enable
				decoded.mode_enable.cool = extractBits(bitOptions, 2, 3);
				// 0：disable, 1：enable
				decoded.mode_enable.auto = extractBits(bitOptions, 3, 4);
				// 0：disable, 1：enable
				decoded.mode_enable.dehumidity = extractBits(bitOptions, 4, 5);
				// 0：disable, 1：enable
				decoded.mode_enable.ventilation = extractBits(bitOptions, 5, 6);
				decoded.mode_enable.reserved = extractBits(bitOptions, 6, 8);
				break;
			case 0x88:
				decoded.fan_enable = decoded.fan_enable || {};
				var bitOptions = readUInt8(bytes, counterObj, 1);
				// 0：disable, 1：enable
				decoded.fan_enable.auto = extractBits(bitOptions, 0, 1);
				// 0：disable, 1：enable
				decoded.fan_enable.circul = extractBits(bitOptions, 1, 2);
				// 0：disable, 1：enable
				decoded.fan_enable.on = extractBits(bitOptions, 2, 3);
				// 0：disable, 1：enable
				decoded.fan_enable.low = extractBits(bitOptions, 3, 4);
				// 0：disable, 1：enable
				decoded.fan_enable.medium = extractBits(bitOptions, 4, 5);
				// 0：disable, 1：enable
				decoded.fan_enable.high = extractBits(bitOptions, 5, 6);
				decoded.fan_enable.reserved = extractBits(bitOptions, 6, 8);
				break;
			case 0x68:
				decoded.temperature_control_mode = decoded.temperature_control_mode || {};
				var temperature_control_mode_subcmd = readUInt8(bytes, counterObj, 1);
				if (temperature_control_mode_subcmd == 0x00) {
					// 0：heat, 1：em heat, 2：cool, 3：auto, 4：dehumidify, 5：ventilation
					decoded.temperature_control_mode.mode = readUInt8(bytes, counterObj, 1);
				}
				if (temperature_control_mode_subcmd == 0x01) {
					// 0：disable, 1：enable
					decoded.temperature_control_mode.plan_mode_enable = readUInt8(bytes, counterObj, 1);
				}
				break;
			case 0x65:
				// 0：single, 1：dual
				decoded.target_temperature_mode = readUInt8(bytes, counterObj, 1);
				break;
			case 0x66:
				// 0：0.5, 1：1
				decoded.target_temperature_resolution = readUInt8(bytes, counterObj, 1);
				break;
			case 0x69:
				decoded.target_temperature_settings = decoded.target_temperature_settings || {};
				var target_temperature_settings_temperature_control_mode = readUInt8(bytes, counterObj, 1);
				if (target_temperature_settings_temperature_control_mode == 0x00) {
					decoded.target_temperature_settings.heat = readInt16LE(bytes, counterObj, 2) / 100;
				}
				if (target_temperature_settings_temperature_control_mode == 0x01) {
					decoded.target_temperature_settings.em_heat = readInt16LE(bytes, counterObj, 2) / 100;
				}
				if (target_temperature_settings_temperature_control_mode == 0x02) {
					decoded.target_temperature_settings.cool = readInt16LE(bytes, counterObj, 2) / 100;
				}
				if (target_temperature_settings_temperature_control_mode == 0x03) {
					decoded.target_temperature_settings.auto = readInt16LE(bytes, counterObj, 2) / 100;
				}
				if (target_temperature_settings_temperature_control_mode == 0x04) {
					decoded.target_temperature_settings.auto_heat = readInt16LE(bytes, counterObj, 2) / 100;
				}
				if (target_temperature_settings_temperature_control_mode == 0x05) {
					decoded.target_temperature_settings.auto_cool = readInt16LE(bytes, counterObj, 2) / 100;
				}
				if (target_temperature_settings_temperature_control_mode == 0x06) {
					decoded.target_temperature_settings.dehumidify = readInt16LE(bytes, counterObj, 2) / 100;
				}
				if (target_temperature_settings_temperature_control_mode == 0x07) {
					decoded.target_temperature_settings.ventilation = readInt16LE(bytes, counterObj, 2) / 100;
				}
				break;
			case 0x6a:
				decoded.minimum_dead_zone = readUInt16LE(bytes, counterObj, 2) / 100;
				break;
			case 0x6b:
				decoded.target_temperature_range = decoded.target_temperature_range || {};
				// 0：heat, 1：em heat, 2：cool, 3：auto
				var target_temperature_range_id = readUInt8(bytes, counterObj, 1);
				if (target_temperature_range_id == 0x00) {
					decoded.target_temperature_range.heat = decoded.target_temperature_range.heat || {};
					decoded.target_temperature_range.heat.min = readInt16LE(bytes, counterObj, 2) / 100;
					decoded.target_temperature_range.heat.max = readInt16LE(bytes, counterObj, 2) / 100;
				}
				if (target_temperature_range_id == 0x01) {
					decoded.target_temperature_range.em_heat = decoded.target_temperature_range.em_heat || {};
					decoded.target_temperature_range.em_heat.min = readInt16LE(bytes, counterObj, 2) / 100;
					decoded.target_temperature_range.em_heat.max = readInt16LE(bytes, counterObj, 2) / 100;
				}
				if (target_temperature_range_id == 0x02) {
					decoded.target_temperature_range.cool = decoded.target_temperature_range.cool || {};
					decoded.target_temperature_range.cool.min = readInt16LE(bytes, counterObj, 2) / 100;
					decoded.target_temperature_range.cool.max = readInt16LE(bytes, counterObj, 2) / 100;
				}
				if (target_temperature_range_id == 0x03) {
					decoded.target_temperature_range.auto = decoded.target_temperature_range.auto || {};
					decoded.target_temperature_range.auto.min = readInt16LE(bytes, counterObj, 2) / 100;
					decoded.target_temperature_range.auto.max = readInt16LE(bytes, counterObj, 2) / 100;
				}
				if (target_temperature_range_id == 0x04) {
					decoded.target_temperature_range.dehumidify = decoded.target_temperature_range.dehumidify || {};
					decoded.target_temperature_range.dehumidify.min = readInt16LE(bytes, counterObj, 2) / 100;
					decoded.target_temperature_range.dehumidify.max = readInt16LE(bytes, counterObj, 2) / 100;
				}
				if (target_temperature_range_id == 0x05) {
					decoded.target_temperature_range.ventilation = decoded.target_temperature_range.ventilation || {};
					decoded.target_temperature_range.ventilation.min = readInt16LE(bytes, counterObj, 2) / 100;
					decoded.target_temperature_range.ventilation.max = readInt16LE(bytes, counterObj, 2) / 100;
				}
				break;
			case 0x74:
				// 0：auto, 1：circulate, 2：on, 3：low, 4：medium, 5：high
				decoded.fan_control_mode = readUInt8(bytes, counterObj, 1);
				break;
			case 0x82:
				decoded.pir_common = decoded.pir_common || {};
				var pir_common_cmd = readUInt8(bytes, counterObj, 1);
				if (pir_common_cmd == 0x01) {
					// 0:disable, 1:enable
					decoded.pir_common.enable = readUInt8(bytes, counterObj, 1);
				}
				if (pir_common_cmd == 0x02) {
					decoded.pir_common.release_time = readUInt16LE(bytes, counterObj, 2);
				}
				if (pir_common_cmd == 0x03) {
					// 0:Immediate Trigger, 1:Rule Trigger
					decoded.pir_common.mode = readUInt8(bytes, counterObj, 1);
				}
				if (pir_common_cmd == 0x04) {
					decoded.pir_common.check = decoded.pir_common.check || {};
					decoded.pir_common.check.period = readUInt8(bytes, counterObj, 1);
					decoded.pir_common.check.rate = readUInt8(bytes, counterObj, 1);
				}
				break;
			case 0x84:
				decoded.pir_night = decoded.pir_night || {};
				var pir_night_cmd = readUInt8(bytes, counterObj, 1);
				if (pir_night_cmd == 0x01) {
					// 0:disable, 1:enable
					decoded.pir_night.enable = readUInt8(bytes, counterObj, 1);
				}
				if (pir_night_cmd == 0x02) {
					// 0:Immediate Trigger, 1:Rule Trigger
					decoded.pir_night.mode = readUInt8(bytes, counterObj, 1);
				}
				if (pir_night_cmd == 0x03) {
					decoded.pir_night.check = decoded.pir_night.check || {};
					decoded.pir_night.check.period = readUInt8(bytes, counterObj, 1);
					decoded.pir_night.check.rate = readUInt8(bytes, counterObj, 1);
				}
				if (pir_night_cmd == 0x04) {
					decoded.pir_night.night_time = decoded.pir_night.night_time || {};
					decoded.pir_night.night_time.start = readUInt16LE(bytes, counterObj, 2);
					decoded.pir_night.night_time.stop = readUInt16LE(bytes, counterObj, 2);
				}
				if (pir_night_cmd == 0x05) {
					// 0:plan0, 1:plan1, 2:plan2, 3:plan3, 4:plan4, 5:plan5, 6:plan6, 7:plan7, 8:plan8, 9:plan9, 10:plan10, 11:plan11, 12:plan12, 13:plan13, 14:plan14, 15:plan15, 255:Not executed
					decoded.pir_night.occupied = readUInt8(bytes, counterObj, 1);
				}
				break;
			case 0x83:
				decoded.pir_energy = decoded.pir_energy || {};
				var pir_energy_cmd = readUInt8(bytes, counterObj, 1);
				if (pir_energy_cmd == 0x01) {
					// 0:disable, 1:enable
					decoded.pir_energy.enable = readUInt8(bytes, counterObj, 1);
				}
				if (pir_energy_cmd == 0x02) {
					decoded.pir_energy.plan = decoded.pir_energy.plan || {};
					// 0:plan0, 1:plan1, 2:plan2, 3:plan3, 4:plan4, 5:plan5, 6:plan6, 7:plan7, 8:plan8, 9:plan9, 10:plan10, 11:plan11, 12:plan12, 13:plan13, 14:plan14, 15:plan15, 255:Not executed
					decoded.pir_energy.plan.occupied = readUInt8(bytes, counterObj, 1);
					// 0:plan0, 1:plan1, 2:plan2, 3:plan3, 4:plan4, 5:plan5, 6:plan6, 7:plan7, 8:plan8, 9:plan9, 10:plan10, 11:plan11, 12:plan12, 13:plan13, 14:plan14, 15:plan15, 255:Not executed
					decoded.pir_energy.plan.unoccupied = readUInt8(bytes, counterObj, 1);
				}
				break;
			case 0x62:
				// 0：disable, 1：enable
				decoded.intelligent_display_enable = readUInt8(bytes, counterObj, 1);
				break;
			case 0x89:
				// 0:disable, 1:enable
				decoded.backlight_enable = readUInt8(bytes, counterObj, 1);
				break;
			case 0x75:
				decoded.screen_display_settings = decoded.screen_display_settings || {};
				var bitOptions = readUInt8(bytes, counterObj, 1);
				// 0:disable, 1:enable
				decoded.screen_display_settings.plan_name = extractBits(bitOptions, 0, 1);
				// 0:disable, 1:enable
				decoded.screen_display_settings.ambient_temp = extractBits(bitOptions, 1, 2);
				// 0:disable, 1:enable
				decoded.screen_display_settings.ambient_humi = extractBits(bitOptions, 2, 3);
				// 0:disable, 1:enable
				decoded.screen_display_settings.target_temp = extractBits(bitOptions, 3, 4);
				decoded.screen_display_settings.reserved = extractBits(bitOptions, 4, 8);
				break;
			case 0x8a:
				// 0:disable, 1:enable
				decoded.screen_temp_mode_enable = readUInt8(bytes, counterObj, 1);
				break;
			case 0x8c:
				// 0:disable, 1:enable
				decoded.screen_fan_mode_enable = readUInt8(bytes, counterObj, 1);
				break;
			case 0x71:
				decoded.button_custom_function = decoded.button_custom_function || {};
				var button_custom_function_subcmd = readUInt8(bytes, counterObj, 1);
				if (button_custom_function_subcmd == 0x00) {
					decoded.button_custom_function.enable = readInt8(bytes, counterObj, 1);
				}
				if (button_custom_function_subcmd == 0x01) {
					// 1：Temperature Control Mode, 2：Fan Mode, 3：Schedule Switch, 4：Status Report, 5：Filter Cleaning Reset, 6：Button Event1, 7：Temperature Unit Switch
					decoded.button_custom_function.mode1 = readUInt8(bytes, counterObj, 1);
				}
				if (button_custom_function_subcmd == 0x02) {
					// 1：Temperature Control Mode, 2：Fan Mode, 3：Schedule Switch, 4：Status Report, 5：Filter Cleaning Reset, 6：Button Event2, 7：Temperature Unit Switch
					decoded.button_custom_function.mode2 = readUInt8(bytes, counterObj, 1);
				}
				if (button_custom_function_subcmd == 0x03) {
					// 0：System On/Off, 3：Schedule Switch, 4：Status Report, 5：Filter Cleaning Reset, 6：Button Event3, 7：Temperature Unit Switch
					decoded.button_custom_function.mode3 = readUInt8(bytes, counterObj, 1);
				}
				break;
			case 0x72:
				decoded.children_lock_settings = decoded.children_lock_settings || {};
				// 0:disable, 1:enable
				decoded.children_lock_settings.enable = readUInt8(bytes, counterObj, 1);
				var bitOptions = readUInt16LE(bytes, counterObj, 2);
				decoded.children_lock_settings.temp_up = extractBits(bitOptions, 0, 1);
				decoded.children_lock_settings.temp_down = extractBits(bitOptions, 1, 2);
				decoded.children_lock_settings.system_on_off = extractBits(bitOptions, 2, 3);
				decoded.children_lock_settings.fan_mode = extractBits(bitOptions, 3, 4);
				decoded.children_lock_settings.temperature_control_mode = extractBits(bitOptions, 4, 5);
				decoded.children_lock_settings.reboot_reset = extractBits(bitOptions, 5, 6);
				decoded.children_lock_settings.power_on_off = extractBits(bitOptions, 6, 7);
				decoded.children_lock_settings.cancel_pair = extractBits(bitOptions, 7, 8);
				decoded.children_lock_settings.plan_switch = extractBits(bitOptions, 8, 9);
				decoded.children_lock_settings.status_report = extractBits(bitOptions, 9, 10);
				decoded.children_lock_settings.filter_clean_alarm_release = extractBits(bitOptions, 10, 11);
				decoded.children_lock_settings.button1_event = extractBits(bitOptions, 11, 12);
				decoded.children_lock_settings.button2_event = extractBits(bitOptions, 12, 13);
				decoded.children_lock_settings.button3_event = extractBits(bitOptions, 13, 14);
				decoded.children_lock_settings.temperature_unit_switch = extractBits(bitOptions, 14, 15);
				decoded.children_lock_settings.reserved = extractBits(bitOptions, 15, 16);
				break;
			case 0x81:
				decoded.unlock_button = decoded.unlock_button || {};
				// 0：disable, 1：enable
				decoded.unlock_button.enable = readUInt8(bytes, counterObj, 1);
				decoded.unlock_button.timeout = readUInt16LE(bytes, counterObj, 2);
				break;
			case 0x80:
				decoded.unlock_combination_button_settings = decoded.unlock_combination_button_settings || {};
				var bitOptions = readUInt8(bytes, counterObj, 1);
				// 0：disable, 1：enable
				decoded.unlock_combination_button_settings.button1 = extractBits(bitOptions, 0, 1);
				// 0：disable, 1：enable
				decoded.unlock_combination_button_settings.button2 = extractBits(bitOptions, 1, 2);
				// 0：disable, 1：enable
				decoded.unlock_combination_button_settings.button3 = extractBits(bitOptions, 2, 3);
				// 0：disable, 1：enable
				decoded.unlock_combination_button_settings.button4 = extractBits(bitOptions, 3, 4);
				// 0：disable, 1：enable
				decoded.unlock_combination_button_settings.button5 = extractBits(bitOptions, 4, 5);
				decoded.unlock_combination_button_settings.reserved = extractBits(bitOptions, 5, 8);
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
				// 1：Sun., 2：Mon., 3：Tues., 4：Wed., 5：Thurs., 6：Fri., 7：Sat.,
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
			case 0x76:
				decoded.temperature_calibration_settings = decoded.temperature_calibration_settings || {};
				// 0：disable, 1：enable
				decoded.temperature_calibration_settings.enable = readUInt8(bytes, counterObj, 1);
				decoded.temperature_calibration_settings.calibration_value = readInt16LE(bytes, counterObj, 2) / 100;
				break;
			case 0x77:
				decoded.humidity_calibration_settings = decoded.humidity_calibration_settings || {};
				// 0：disable, 1：enable
				decoded.humidity_calibration_settings.enable = readUInt8(bytes, counterObj, 1);
				decoded.humidity_calibration_settings.calibration_value = readInt16LE(bytes, counterObj, 2) / 10;
				break;
			case 0x7b:
				decoded.schedule_settings = decoded.schedule_settings || [];
				var id = readUInt8(bytes, counterObj, 1);
				var schedule_settings_item = pickArrayItem(decoded.schedule_settings, id, 'id');
				schedule_settings_item.id = id;
				insertArrayItem(decoded.schedule_settings, schedule_settings_item, 'id');
				var schedule_settings_item_command = readUInt8(bytes, counterObj, 1);
				if (schedule_settings_item_command == 0x00) {
					// 0：disable, 1：enable
					schedule_settings_item.enable = readUInt8(bytes, counterObj, 1);
				}
				if (schedule_settings_item_command == 0x01) {
					schedule_settings_item.name_first = readString(bytes, counterObj, 6);
				}
				if (schedule_settings_item_command == 0x02) {
					schedule_settings_item.name_last = readString(bytes, counterObj, 4);
				}
				if (schedule_settings_item_command == 0x03) {
					schedule_settings_item.content1 = schedule_settings_item.content1 || {};
					// 0：heat, 1：em heat, 2：cool, 3：auto
					schedule_settings_item.content1.tstat_mode = readUInt8(bytes, counterObj, 1);
					schedule_settings_item.content1.heat_target_temperature = readInt16LE(bytes, counterObj, 2) / 100;
					schedule_settings_item.content1.em_heat_target_temperature = readInt16LE(bytes, counterObj, 2) / 100;
					schedule_settings_item.content1.cool_target_temperature = readInt16LE(bytes, counterObj, 2) / 100;
				}
				if (schedule_settings_item_command == 0x04) {
					schedule_settings_item.content2 = schedule_settings_item.content2 || {};
					// 0：auto, 1：circulate, 2：on, 3：low, 4：medium, 5：high
					schedule_settings_item.content2.fan_mode = readUInt8(bytes, counterObj, 1);
					schedule_settings_item.content2.auto_target_temperature = readInt16LE(bytes, counterObj, 2) / 100;
					schedule_settings_item.content2.auto_heat_target_temperature = readInt16LE(bytes, counterObj, 2) / 100;
					schedule_settings_item.content2.auto_cool_target_temperature = readInt16LE(bytes, counterObj, 2) / 100;
				}
				if (schedule_settings_item_command == 0x05) {
					// 0：system off, 1：system on
					schedule_settings_item.system_on_off = readUInt8(bytes, counterObj, 1);
				}
				if (schedule_settings_item_command == 0x06) {
					// 0：heat, 1：em heat, 2：cool, 3：auto, 4：dehumidify, 5：ventilation
					schedule_settings_item.tstat_mode = readUInt8(bytes, counterObj, 1);
				}
				if (schedule_settings_item_command == 0x07) {
					// 0：auto, 1：circulate, 2：on, 3：low, 4：medium, 5：high
					schedule_settings_item.fan_mode = readUInt8(bytes, counterObj, 1);
				}
				if (schedule_settings_item_command == 0x08) {
					schedule_settings_item.heat_target_temperature = readInt16LE(bytes, counterObj, 2) / 100;
				}
				if (schedule_settings_item_command == 0x09) {
					schedule_settings_item.cool_target_temperature = readInt16LE(bytes, counterObj, 2) / 100;
				}
				if (schedule_settings_item_command == 0x0a) {
					schedule_settings_item.auto_target_temperature = readInt16LE(bytes, counterObj, 2) / 100;
				}
				break;
			case 0x54:
				decoded.reset_ble_name = readOnlyCommand(bytes, counterObj, 1);
				break;
			case 0x86:
				decoded.origin_temperature = readInt16LE(bytes, counterObj, 2) / 100;
				break;
			case 0x87:
				decoded.origin_humidity = readUInt16LE(bytes, counterObj, 2) / 10;
				break;
			case 0x5c:
				decoded.insert_temporary_plan = decoded.insert_temporary_plan || {};
				decoded.insert_temporary_plan.id = readUInt8(bytes, counterObj, 1);
				break;
			case 0x55:
				decoded.fan_error_alarm = decoded.fan_error_alarm || {};
				// 0：clean alarm, 1：trigger alarm
				decoded.fan_error_alarm.mode = readUInt8(bytes, counterObj, 1);
				break;
			case 0x5b:
				decoded.filter_clean_alarm = decoded.filter_clean_alarm || {};
				// 0：clean alarm
				decoded.filter_clean_alarm.mode = readUInt8(bytes, counterObj, 1);
				break;
			case 0xbe:
				decoded.reboot = readOnlyCommand(bytes, counterObj, 0);
				break;
			case 0xb6:
				decoded.reconnect = readOnlyCommand(bytes, counterObj, 0);
				break;
			case 0x5f:
				decoded.delete_task_plan = decoded.delete_task_plan || {};
				// 0:plan0, 1:plan1, 2:plan2, 3:plan3, 4:plan4, 5:plan5, 6:plan6, 7:plan7, 255：All
				decoded.delete_task_plan.type = readUInt8(bytes, counterObj, 1);
				break;
			default:
				unknown_command = 1;
				break;
		}
		if (unknown_command) {
			throw new Error('unknown command: 0x' + command_id.toString(16));
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
	patchDecode(result);

	return result;
}

function patchDecode(decoded) {}

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

function removePath(obj, path) {
	var parts = path.split('.');
	var chain = [obj];
	var current = obj;

	for (var i = 0; i < parts.length - 1; i++) {
		var key = parts[i];

		if (!current || typeof current[key] !== 'object') {
			return obj;
		}

		current = current[key];
		chain.push(current);
	}

	var leaf = parts[parts.length - 1];

	if (!current || !Object.prototype.hasOwnProperty.call(current, leaf)) {
		return obj;
	}

	delete current[leaf];

	// prune empty intermediate containers left behind on the path
	for (var j = chain.length - 1; j >= 1; j--) {
		if (Object.keys(chain[j]).length === 0) {
			delete chain[j - 1][parts[j - 1]];
		} else {
			break;
		}
	}

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
		  "54": "reset_ble_name",
		  "55": "fan_error_alarm",
		  "59": "system_status_control",
		  "60": "collection_interval",
		  "61": "reporting_interval",
		  "62": "intelligent_display_enable",
		  "63": "temperature_unit",
		  "64": "mode_enable",
		  "65": "target_temperature_mode",
		  "66": "target_temperature_resolution",
		  "67": "system_status",
		  "68": "temperature_control_mode",
		  "69": "target_temperature_settings",
		  "71": "button_custom_function",
		  "72": "children_lock_settings",
		  "74": "fan_control_mode",
		  "75": "screen_display_settings",
		  "76": "temperature_calibration_settings",
		  "77": "humidity_calibration_settings",
		  "80": "unlock_combination_button_settings",
		  "81": "unlock_button",
		  "82": "pir_common",
		  "83": "pir_energy",
		  "84": "pir_night",
		  "85": "ble_enable",
		  "86": "origin_temperature",
		  "87": "origin_humidity",
		  "88": "fan_enable",
		  "89": "backlight_enable",
		  "6000": "collection_interval.seconds_of_time",
		  "6001": "collection_interval.minutes_of_time",
		  "6100": "reporting_interval.ble",
		  "6101": "reporting_interval.lora",
		  "6102": "reporting_interval.ble_lora",
		  "6103": "reporting_interval.power_lora",
		  "6800": "temperature_control_mode.mode",
		  "6801": "temperature_control_mode.plan_mode_enable",
		  "6900": "target_temperature_settings.heat",
		  "6901": "target_temperature_settings.em_heat",
		  "6902": "target_temperature_settings.cool",
		  "6903": "target_temperature_settings.auto",
		  "6904": "target_temperature_settings.auto_heat",
		  "6905": "target_temperature_settings.auto_cool",
		  "6906": "target_temperature_settings.dehumidify",
		  "6907": "target_temperature_settings.ventilation",
		  "7100": "button_custom_function.enable",
		  "7101": "button_custom_function.mode1",
		  "7102": "button_custom_function.mode2",
		  "7103": "button_custom_function.mode3",
		  "8201": "pir_common.enable",
		  "8202": "pir_common.release_time",
		  "8203": "pir_common.mode",
		  "8204": "pir_common.check",
		  "8301": "pir_energy.enable",
		  "8302": "pir_energy.plan",
		  "8401": "pir_night.enable",
		  "8402": "pir_night.mode",
		  "8403": "pir_night.check",
		  "8404": "pir_night.night_time",
		  "8405": "pir_night.occupied",
		  "610000": "reporting_interval.ble.seconds_of_time",
		  "610001": "reporting_interval.ble.minutes_of_time",
		  "610100": "reporting_interval.lora.seconds_of_time",
		  "610101": "reporting_interval.lora.minutes_of_time",
		  "610200": "reporting_interval.ble_lora.seconds_of_time",
		  "610201": "reporting_interval.ble_lora.minutes_of_time",
		  "610300": "reporting_interval.power_lora.seconds_of_time",
		  "610301": "reporting_interval.power_lora.minutes_of_time",
		  "fe": "request_check_order",
		  "ef": "request_command_queries",
		  "ee": "request_query_all_configurations",
		  "cf": "lorawan_configuration_settings",
		  "cf00": "lorawan_configuration_settings.mode",
		  "c9": "random_key",
		  "df": "tsl_version",
		  "de": "product_name",
		  "dd": "product_pn",
		  "db": "product_sn",
		  "da": "version",
		  "d9": "oem_id",
		  "c8": "device_status",
		  "d8": "product_frequency_band",
		  "b9": "device_time",
		  "b8": "battery_info",
		  "cd": "ble_configuration_settings",
		  "cd00": "ble_configuration_settings.enable",
		  "cd01": "ble_configuration_settings.local_id",
		  "cd05": "ble_configuration_settings.local_name_first",
		  "cd06": "ble_configuration_settings.local_name_last",
		  "cd07": "ble_configuration_settings.pair_info",
		  "cd04": "ble_configuration_settings.pair_name",
		  "cd04xx": "ble_configuration_settings.pair_name._item",
		  "cd02": "ble_configuration_settings.pair_mac",
		  "cd02xx": "ble_configuration_settings.pair_mac._item",
		  "cd03": "ble_configuration_settings.pair_addr",
		  "cd03xx": "ble_configuration_settings.pair_addr._item",
		  "ba": "ble_new_event",
		  "baxx": "ble_new_event._item",
		  "00": "battery",
		  "01": "temperature",
		  "02": "humidity",
		  "08": "pir_status",
		  "03": "temperature_mode",
		  "06": "target_temperature1",
		  "07": "target_temperature2",
		  "04": "fan_mode",
		  "05": "execution_plan_id",
		  "0b": "temperature_alarm",
		  "0b00": "temperature_alarm.collection_error",
		  "0b01": "temperature_alarm.lower_range_error",
		  "0b02": "temperature_alarm.over_range_error",
		  "0b03": "temperature_alarm.no_data",
		  "0c": "humidity_alarm",
		  "0c00": "humidity_alarm.collection_error",
		  "0c01": "humidity_alarm.lower_range_error",
		  "0c02": "humidity_alarm.over_range_error",
		  "0c03": "humidity_alarm.no_data",
		  "09": "ble_event",
		  "0900": "ble_event.none",
		  "0901": "ble_event.pair_cancel",
		  "0902": "ble_event.disconnect",
		  "0a": "power_bus_event",
		  "0a00": "power_bus_event.none",
		  "0a01": "power_bus_event.disconnect",
		  "0d": "key_event",
		  "0d00": "key_event.f1",
		  "0d01": "key_event.f2",
		  "0d02": "key_event.f3",
		  "0f": "battery_event",
		  "0f00": "battery_event.recover",
		  "8d": "communication_mode",
		  "6c": "communicate_interval",
		  "6c00": "communicate_interval.ble",
		  "6c0000": "communicate_interval.ble.seconds_of_time",
		  "6c0001": "communicate_interval.ble.minutes_of_time",
		  "6c01": "communicate_interval.lora",
		  "6c0100": "communicate_interval.lora.seconds_of_time",
		  "6c0101": "communicate_interval.lora.minutes_of_time",
		  "6c02": "communicate_interval.ble_lora",
		  "6c0200": "communicate_interval.ble_lora.seconds_of_time",
		  "6c0201": "communicate_interval.ble_lora.minutes_of_time",
		  "6c03": "communicate_interval.power_bus",
		  "6c0300": "communicate_interval.power_bus.seconds_of_time",
		  "6c0301": "communicate_interval.power_bus.minutes_of_time",
		  "7d": "data_sync_to_peer",
		  "7e": "data_sync_timeout",
		  "8b": "ble_name",
		  "6a": "minimum_dead_zone",
		  "6b": "target_temperature_range",
		  "6b00": "target_temperature_range.heat",
		  "6b01": "target_temperature_range.em_heat",
		  "6b02": "target_temperature_range.cool",
		  "6b03": "target_temperature_range.auto",
		  "6b04": "target_temperature_range.dehumidify",
		  "6b05": "target_temperature_range.ventilation",
		  "8a": "screen_temp_mode_enable",
		  "8c": "screen_fan_mode_enable",
		  "c7": "time_zone",
		  "c6": "daylight_saving_time",
		  "7b": "schedule_settings",
		  "7bxx": "schedule_settings._item",
		  "7bxx00": "schedule_settings._item.enable",
		  "7bxx01": "schedule_settings._item.name_first",
		  "7bxx02": "schedule_settings._item.name_last",
		  "7bxx03": "schedule_settings._item.content1",
		  "7bxx04": "schedule_settings._item.content2",
		  "7bxx05": "schedule_settings._item.system_on_off",
		  "7bxx06": "schedule_settings._item.tstat_mode",
		  "7bxx07": "schedule_settings._item.fan_mode",
		  "7bxx08": "schedule_settings._item.heat_target_temperature",
		  "7bxx09": "schedule_settings._item.cool_target_temperature",
		  "7bxx0a": "schedule_settings._item.auto_target_temperature",
		  "5c": "insert_temporary_plan",
		  "5b": "filter_clean_alarm",
		  "be": "reboot",
		  "b6": "reconnect",
		  "5f": "delete_task_plan"
	};
}
function processTemperature(decoded) {
	var allTemperatureProperties = {
    "temperature": {
        "precision": 2,
        "unitName": "℃"
    },
    "target_temperature1": {
        "precision": 2,
        "unitName": "℃"
    },
    "target_temperature2": {
        "precision": 2,
        "unitName": "℃"
    },
    "target_temperature_settings.heat": {
        "precision": 2,
        "unitName": "℃"
    },
    "target_temperature_settings.em_heat": {
        "precision": 2,
        "unitName": "℃"
    },
    "target_temperature_settings.cool": {
        "precision": 2,
        "unitName": "℃"
    },
    "target_temperature_settings.auto": {
        "precision": 2,
        "unitName": "℃"
    },
    "target_temperature_settings.auto_heat": {
        "precision": 2,
        "unitName": "℃"
    },
    "target_temperature_settings.auto_cool": {
        "precision": 2,
        "unitName": "℃"
    },
    "target_temperature_settings.dehumidify": {
        "precision": 2,
        "unitName": "℃"
    },
    "target_temperature_settings.ventilation": {
        "precision": 2,
        "unitName": "℃"
    },
    "minimum_dead_zone": {
        "precision": 2,
        "unitName": "K"
    },
    "target_temperature_range.heat.min": {
        "precision": 2,
        "unitName": "℃"
    },
    "target_temperature_range.heat.max": {
        "precision": 2,
        "unitName": "℃"
    },
    "target_temperature_range.em_heat.min": {
        "precision": 2,
        "unitName": "℃"
    },
    "target_temperature_range.em_heat.max": {
        "precision": 2,
        "unitName": "℃"
    },
    "target_temperature_range.cool.min": {
        "precision": 2,
        "unitName": "℃"
    },
    "target_temperature_range.cool.max": {
        "precision": 2,
        "unitName": "℃"
    },
    "target_temperature_range.auto.min": {
        "precision": 2,
        "unitName": "℃"
    },
    "target_temperature_range.auto.max": {
        "precision": 2,
        "unitName": "℃"
    },
    "target_temperature_range.dehumidify.min": {
        "precision": 2,
        "unitName": "℃"
    },
    "target_temperature_range.dehumidify.max": {
        "precision": 2,
        "unitName": "℃"
    },
    "target_temperature_range.ventilation.min": {
        "precision": 2,
        "unitName": "℃"
    },
    "target_temperature_range.ventilation.max": {
        "precision": 2,
        "unitName": "℃"
    },
    "temperature_calibration_settings.calibration_value": {
        "precision": 2,
        "unitName": "℃"
    },
    "schedule_settings._item.content1.heat_target_temperature": {
        "precision": 2,
        "unitName": "℃"
    },
    "schedule_settings._item.content1.em_heat_target_temperature": {
        "precision": 2,
        "unitName": "℃"
    },
    "schedule_settings._item.content1.cool_target_temperature": {
        "precision": 2,
        "unitName": "℃"
    },
    "schedule_settings._item.content2.auto_target_temperature": {
        "precision": 2,
        "unitName": "℃"
    },
    "schedule_settings._item.content2.auto_heat_target_temperature": {
        "precision": 2,
        "unitName": "℃"
    },
    "schedule_settings._item.content2.auto_cool_target_temperature": {
        "precision": 2,
        "unitName": "℃"
    },
    "schedule_settings._item.heat_target_temperature": {
        "precision": 2,
        "unitName": "℃"
    },
    "schedule_settings._item.cool_target_temperature": {
        "precision": 2,
        "unitName": "℃"
    },
    "schedule_settings._item.auto_target_temperature": {
        "precision": 2,
        "unitName": "℃"
    },
    "origin_temperature": {
        "precision": 2,
        "unitName": "℃"
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
			var unitName = allTemperatureProperties[newPropertyId].unitName;
			var constant = unitName == 'K' ? 0 : 32;
			if (hasPath(decoded, propertyId)) {
				setPath(decoded, fahrenheitProperty,  Number((getPath(decoded, propertyId) * 1.8 + constant).toFixed(allTemperatureProperties[newPropertyId].precision)));
				setPath(decoded, celsiusProperty,  Number(getPath(decoded, propertyId).toFixed(allTemperatureProperties[newPropertyId].precision)));
				removePath(decoded, propertyId);
			}
		}
	}
	return decoded;
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
			if ([0, 1, 2, 3].indexOf(payload.lorawan_configuration_settings.mode) === -1) {
				throw new Error('lorawan_configuration_settings.mode must be one of [0, 1, 2, 3]');
			}
			// 0:ClassA, 1:ClassB, 2:ClassC, 3:ClassC to B
			buffer.writeUInt8(payload.lorawan_configuration_settings.mode);
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xc9
	if ('random_key' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xc9);
		if ([0, 1].indexOf(payload.random_key) === -1) {
			throw new Error('random_key must be one of [0, 1]');
		}
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.random_key);
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
		if ([0, 1].indexOf(payload.device_status) === -1) {
			throw new Error('device_status must be one of [0, 1]');
		}
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
	//0xb9
	if ('device_time' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xb9);
		buffer.writeUInt32LE(payload.device_time.current_time);
		buffer.writeUInt32LE(payload.device_time.running_time);
		buffer.writeUInt32LE(payload.device_time.power_on_time);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xb8
	if ('battery_info' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xb8);
		buffer.writeUInt32LE(payload.battery_info.battery_capacity * 1000);
		buffer.writeUInt32LE(payload.battery_info.battery_consumption * 1000);
		buffer.writeUInt32LE(payload.battery_info.battery_left * 1000);
		buffer.writeUInt16LE(payload.battery_info.battery_voltage * 1000);
		buffer.writeHexString(payload.battery_info.current_battery_status, 2);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xcd
	if ('ble_configuration_settings' in payload) {
		var buffer = new Buffer();
		if (isValid(payload.ble_configuration_settings.enable)) {
			buffer.writeUInt8(0xcd);
			// 0：disable, 1：enable
			buffer.writeUInt8(0x00);
			if ([0, 1].indexOf(payload.ble_configuration_settings.enable) === -1) {
				throw new Error('ble_configuration_settings.enable must be one of [0, 1]');
			}
			// 0：disable, 1：enable
			buffer.writeUInt8(payload.ble_configuration_settings.enable);
		}
		if (isValid(payload.ble_configuration_settings.local_id)) {
			buffer.writeUInt8(0xcd);
			buffer.writeUInt8(0x01);
			if ([0, 1].indexOf(payload.ble_configuration_settings.local_id.type) === -1) {
				throw new Error('ble_configuration_settings.local_id.type must be one of [0, 1]');
			}
			// 0：public, 1：private
			buffer.writeUInt8(payload.ble_configuration_settings.local_id.type);
			buffer.writeHexString(payload.ble_configuration_settings.local_id.address, 6);
		}
		if (isValid(payload.ble_configuration_settings.local_name_first)) {
			buffer.writeUInt8(0xcd);
			buffer.writeUInt8(0x05);
			buffer.writeString(payload.ble_configuration_settings.local_name_first, 8);
		}
		if (isValid(payload.ble_configuration_settings.local_name_last)) {
			buffer.writeUInt8(0xcd);
			buffer.writeUInt8(0x06);
			buffer.writeString(payload.ble_configuration_settings.local_name_last, 5);
		}
		if (isValid(payload.ble_configuration_settings.pair_info)) {
			buffer.writeUInt8(0xcd);
			buffer.writeUInt8(0x07);
			if ([0, 1].indexOf(payload.ble_configuration_settings.pair_info.type) === -1) {
				throw new Error('ble_configuration_settings.pair_info.type must be one of [0, 1]');
			}
			// 0：public, 1：private
			buffer.writeUInt8(payload.ble_configuration_settings.pair_info.type);
			buffer.writeHexString(payload.ble_configuration_settings.pair_info.addr, 6);
			buffer.writeHexString(payload.ble_configuration_settings.pair_info.mac, 8);
			if (payload.ble_configuration_settings.pair_info.name_length < 1 || payload.ble_configuration_settings.pair_info.name_length > 13) {
				throw new Error('ble_configuration_settings.pair_info.name_length must be between 1 and 13');
			}
			buffer.writeUInt8(payload.ble_configuration_settings.pair_info.name_length);
			buffer.writeString(payload.ble_configuration_settings.pair_info.name, payload.ble_configuration_settings.pair_info.name_length, true);
		}
		for (var pair_name_id = 0; pair_name_id < (payload.ble_configuration_settings.pair_name && payload.ble_configuration_settings.pair_name.length); pair_name_id++) {
			var pair_name_item = payload.ble_configuration_settings.pair_name[pair_name_id];
			var pair_name_item_id = pair_name_item.channel;
			if (pair_name_item_id < 0 || pair_name_item_id > 0) {
				throw new Error('pair_name_item_id must be in range [0,0]');
			}

			buffer.writeUInt8(0xcd);
			buffer.writeUInt8(0x04);
			buffer.writeUInt8(pair_name_item_id);
			if (pair_name_item.length < 1 || pair_name_item.length > 13) {
				throw new Error('length must be between 1 and 13');
			}
			buffer.writeUInt8(pair_name_item.length);
			buffer.writeString(pair_name_item.content, pair_name_item.length, true);
		}
		for (var pair_mac_id = 0; pair_mac_id < (payload.ble_configuration_settings.pair_mac && payload.ble_configuration_settings.pair_mac.length); pair_mac_id++) {
			var pair_mac_item = payload.ble_configuration_settings.pair_mac[pair_mac_id];
			var pair_mac_item_id = pair_mac_item.channel;
			if (pair_mac_item_id < 0 || pair_mac_item_id > 0) {
				throw new Error('pair_mac_item_id must be in range [0,0]');
			}

			buffer.writeUInt8(0xcd);
			buffer.writeUInt8(0x02);
			buffer.writeUInt8(pair_mac_item_id);
			buffer.writeHexString(pair_mac_item.mac, 8);
		}
		for (var pair_addr_id = 0; pair_addr_id < (payload.ble_configuration_settings.pair_addr && payload.ble_configuration_settings.pair_addr.length); pair_addr_id++) {
			var pair_addr_item = payload.ble_configuration_settings.pair_addr[pair_addr_id];
			var pair_addr_item_id = pair_addr_item.channel;
			if (pair_addr_item_id < 0 || pair_addr_item_id > 0) {
				throw new Error('pair_addr_item_id must be in range [0,0]');
			}

			buffer.writeUInt8(0xcd);
			buffer.writeUInt8(0x03);
			buffer.writeUInt8(pair_addr_item_id);
			if ([0, 1].indexOf(pair_addr_item.type) === -1) {
				throw new Error('type must be one of [0, 1]');
			}
			// 0：public, 1：private
			buffer.writeUInt8(pair_addr_item.type);
			buffer.writeHexString(pair_addr_item.mac, 6);
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xba
	if ('retrieve_historical_data_by_time_range' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xba);
		if (payload.retrieve_historical_data_by_time_range.start_time < 0 || payload.retrieve_historical_data_by_time_range.start_time > 4294967295) {
			throw new Error('retrieve_historical_data_by_time_range.start_time must be in range [0,4294967295]');
		}
		buffer.writeUInt32LE(payload.retrieve_historical_data_by_time_range.start_time);
		if (payload.retrieve_historical_data_by_time_range.end_time < 0 || payload.retrieve_historical_data_by_time_range.end_time > 4294967295) {
			throw new Error('retrieve_historical_data_by_time_range.end_time must be in range [0,4294967295]');
		}
		buffer.writeUInt32LE(payload.retrieve_historical_data_by_time_range.end_time);
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
		if ([0, 1, 2, 3, 4, 5, 10, 11].indexOf(payload.temperature_mode) === -1) {
			throw new Error('temperature_mode must be one of [0, 1, 2, 3, 4, 5, 10, 11]');
		}
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
		if ([0, 1, 2, 3, 4, 5, 10, 11].indexOf(payload.fan_mode) === -1) {
			throw new Error('fan_mode must be one of [0, 1, 2, 3, 4, 5, 10, 11]');
		}
		// 0：auto, 1：circulate, 2：on, 3：low, 4：medium, 5：high, 10：off, 11：none/keep
		buffer.writeUInt8(payload.fan_mode);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x05
	if ('execution_plan_id' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x05);
		if (payload.execution_plan_id < 0 || payload.execution_plan_id > 255) {
			throw new Error('execution_plan_id must be between 0 and 255');
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
		if (payload.temperature_alarm.type == 0x00) {
		}
		if (payload.temperature_alarm.type == 0x01) {
		}
		if (payload.temperature_alarm.type == 0x02) {
		}
		if (payload.temperature_alarm.type == 0x03) {
		}
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
		if (payload.humidity_alarm.type == 0x03) {
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x09
	if ('ble_event' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x09);
		buffer.writeUInt8(payload.ble_event.type);
		if (payload.ble_event.type == 0x00) {
		}
		if (payload.ble_event.type == 0x01) {
		}
		if (payload.ble_event.type == 0x02) {
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x0a
	if ('power_bus_event' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x0a);
		buffer.writeUInt8(payload.power_bus_event.type);
		if (payload.power_bus_event.type == 0x00) {
		}
		if (payload.power_bus_event.type == 0x01) {
		}
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
		if (payload.battery_event.type == 0x00) {
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
			if ([0, 1].indexOf(payload.reporting_interval.ble.unit) === -1) {
				throw new Error('reporting_interval.ble.unit must be one of [0, 1]');
			}
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
			if ([0, 1].indexOf(payload.reporting_interval.lora.unit) === -1) {
				throw new Error('reporting_interval.lora.unit must be one of [0, 1]');
			}
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
			if ([0, 1].indexOf(payload.reporting_interval.ble_lora.unit) === -1) {
				throw new Error('reporting_interval.ble_lora.unit must be one of [0, 1]');
			}
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
			if ([0, 1].indexOf(payload.reporting_interval.power_lora.unit) === -1) {
				throw new Error('reporting_interval.power_lora.unit must be one of [0, 1]');
			}
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
			if ([0, 1].indexOf(payload.communicate_interval.ble.unit) === -1) {
				throw new Error('communicate_interval.ble.unit must be one of [0, 1]');
			}
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
			if ([0, 1].indexOf(payload.communicate_interval.lora.unit) === -1) {
				throw new Error('communicate_interval.lora.unit must be one of [0, 1]');
			}
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
			if ([0, 1].indexOf(payload.communicate_interval.ble_lora.unit) === -1) {
				throw new Error('communicate_interval.ble_lora.unit must be one of [0, 1]');
			}
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
			if ([0, 1].indexOf(payload.communicate_interval.power_bus.unit) === -1) {
				throw new Error('communicate_interval.power_bus.unit must be one of [0, 1]');
			}
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
	//0x60
	if ('collection_interval' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x60);
		if ([0, 1].indexOf(payload.collection_interval.unit) === -1) {
			throw new Error('collection_interval.unit must be one of [0, 1]');
		}
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
	//0x63
	if ('temperature_unit' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x63);
		if ([0, 1].indexOf(payload.temperature_unit) === -1) {
			throw new Error('temperature_unit must be one of [0, 1]');
		}
		// 0：℃, 1：℉
		buffer.writeUInt8(payload.temperature_unit);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x7d
	if ('data_sync_to_peer' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x7d);
		if ([0, 1, 2].indexOf(payload.data_sync_to_peer) === -1) {
			throw new Error('data_sync_to_peer must be one of [0, 1, 2]');
		}
		// 0:Embedded Data, 1:Lora Data, 2: UCController
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
		if ([0, 1].indexOf(payload.ble_enable) === -1) {
			throw new Error('ble_enable must be one of [0, 1]');
		}
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
		if ([0, 1].indexOf(payload.system_status) === -1) {
			throw new Error('system_status must be one of [0, 1]');
		}
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

		// 0：disable, 1：enable
		bitOptions |= payload.mode_enable.dehumidity << 4;

		// 0：disable, 1：enable
		bitOptions |= payload.mode_enable.ventilation << 5;

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
			if ([0, 1, 2, 3, 4, 5].indexOf(payload.temperature_control_mode.mode) === -1) {
				throw new Error('temperature_control_mode.mode must be one of [0, 1, 2, 3, 4, 5]');
			}
			// 0：heat, 1：em heat, 2：cool, 3：auto, 4：dehumidify, 5：ventilation
			buffer.writeUInt8(payload.temperature_control_mode.mode);
		}
		if (isValid(payload.temperature_control_mode.plan_mode_enable)) {
			buffer.writeUInt8(0x68);
			// 0：disable, 1：enable
			buffer.writeUInt8(0x01);
			if ([0, 1].indexOf(payload.temperature_control_mode.plan_mode_enable) === -1) {
				throw new Error('temperature_control_mode.plan_mode_enable must be one of [0, 1]');
			}
			// 0：disable, 1：enable
			buffer.writeUInt8(payload.temperature_control_mode.plan_mode_enable);
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x65
	if ('target_temperature_mode' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x65);
		if ([0, 1].indexOf(payload.target_temperature_mode) === -1) {
			throw new Error('target_temperature_mode must be one of [0, 1]');
		}
		// 0：single, 1：dual
		buffer.writeUInt8(payload.target_temperature_mode);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x66
	if ('target_temperature_resolution' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x66);
		if ([0, 1].indexOf(payload.target_temperature_resolution) === -1) {
			throw new Error('target_temperature_resolution must be one of [0, 1]');
		}
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
		if (isValid(payload.target_temperature_settings.dehumidify)) {
			buffer.writeUInt8(0x69);
			buffer.writeUInt8(0x06);
			if (payload.target_temperature_settings.dehumidify < 5 || payload.target_temperature_settings.dehumidify > 35) {
				throw new Error('target_temperature_settings.dehumidify must be between 5 and 35');
			}
			buffer.writeInt16LE(payload.target_temperature_settings.dehumidify * 100);
		}
		if (isValid(payload.target_temperature_settings.ventilation)) {
			buffer.writeUInt8(0x69);
			buffer.writeUInt8(0x07);
			if (payload.target_temperature_settings.ventilation < 5 || payload.target_temperature_settings.ventilation > 35) {
				throw new Error('target_temperature_settings.ventilation must be between 5 and 35');
			}
			buffer.writeInt16LE(payload.target_temperature_settings.ventilation * 100);
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x6a
	if ('minimum_dead_zone' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x6a);
		if (payload.minimum_dead_zone < 1 || payload.minimum_dead_zone > 10) {
			throw new Error('minimum_dead_zone must be between 1 and 10');
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
		if (isValid(payload.target_temperature_range.dehumidify)) {
			buffer.writeUInt8(0x6b);
			buffer.writeUInt8(0x04);
			if (payload.target_temperature_range.dehumidify.min < 5 || payload.target_temperature_range.dehumidify.min > 35) {
				throw new Error('target_temperature_range.dehumidify.min must be between 5 and 35');
			}
			buffer.writeInt16LE(payload.target_temperature_range.dehumidify.min * 100);
			if (payload.target_temperature_range.dehumidify.max < 5 || payload.target_temperature_range.dehumidify.max > 35) {
				throw new Error('target_temperature_range.dehumidify.max must be between 5 and 35');
			}
			buffer.writeInt16LE(payload.target_temperature_range.dehumidify.max * 100);
		}
		if (isValid(payload.target_temperature_range.ventilation)) {
			buffer.writeUInt8(0x6b);
			buffer.writeUInt8(0x05);
			if (payload.target_temperature_range.ventilation.min < 5 || payload.target_temperature_range.ventilation.min > 35) {
				throw new Error('target_temperature_range.ventilation.min must be between 5 and 35');
			}
			buffer.writeInt16LE(payload.target_temperature_range.ventilation.min * 100);
			if (payload.target_temperature_range.ventilation.max < 5 || payload.target_temperature_range.ventilation.max > 35) {
				throw new Error('target_temperature_range.ventilation.max must be between 5 and 35');
			}
			buffer.writeInt16LE(payload.target_temperature_range.ventilation.max * 100);
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
			if ([0, 1].indexOf(payload.pir_common.mode) === -1) {
				throw new Error('pir_common.mode must be one of [0, 1]');
			}
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
		if (isValid(payload.pir_night.mode)) {
			buffer.writeUInt8(0x84);
			// 0:Immediate Trigger, 1:Rule Trigger
			buffer.writeUInt8(0x02);
			if ([0, 1].indexOf(payload.pir_night.mode) === -1) {
				throw new Error('pir_night.mode must be one of [0, 1]');
			}
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
			// 0:plan0, 1:plan1, 2:plan2, 3:plan3, 4:plan4, 5:plan5, 6:plan6, 7:plan7, 8:plan8, 9:plan9, 10:plan10, 11:plan11, 12:plan12, 13:plan13, 14:plan14, 15:plan15, 255:Not executed
			buffer.writeUInt8(0x05);
			if ([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 255].indexOf(payload.pir_night.occupied) === -1) {
				throw new Error('pir_night.occupied must be one of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 255]');
			}
			// 0:plan0, 1:plan1, 2:plan2, 3:plan3, 4:plan4, 5:plan5, 6:plan6, 7:plan7, 8:plan8, 9:plan9, 10:plan10, 11:plan11, 12:plan12, 13:plan13, 14:plan14, 15:plan15, 255:Not executed
			buffer.writeUInt8(payload.pir_night.occupied);
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
			if ([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 255].indexOf(payload.pir_energy.plan.occupied) === -1) {
				throw new Error('pir_energy.plan.occupied must be one of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 255]');
			}
			// 0:plan0, 1:plan1, 2:plan2, 3:plan3, 4:plan4, 5:plan5, 6:plan6, 7:plan7, 8:plan8, 9:plan9, 10:plan10, 11:plan11, 12:plan12, 13:plan13, 14:plan14, 15:plan15, 255:Not executed
			buffer.writeUInt8(payload.pir_energy.plan.occupied);
			if ([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 255].indexOf(payload.pir_energy.plan.unoccupied) === -1) {
				throw new Error('pir_energy.plan.unoccupied must be one of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 255]');
			}
			// 0:plan0, 1:plan1, 2:plan2, 3:plan3, 4:plan4, 5:plan5, 6:plan6, 7:plan7, 8:plan8, 9:plan9, 10:plan10, 11:plan11, 12:plan12, 13:plan13, 14:plan14, 15:plan15, 255:Not executed
			buffer.writeUInt8(payload.pir_energy.plan.unoccupied);
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x62
	if ('intelligent_display_enable' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x62);
		if ([0, 1].indexOf(payload.intelligent_display_enable) === -1) {
			throw new Error('intelligent_display_enable must be one of [0, 1]');
		}
		// 0：disable, 1：enable
		buffer.writeUInt8(payload.intelligent_display_enable);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x89
	if ('backlight_enable' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x89);
		if ([0, 1].indexOf(payload.backlight_enable) === -1) {
			throw new Error('backlight_enable must be one of [0, 1]');
		}
		// 0:disable, 1:enable
		buffer.writeUInt8(payload.backlight_enable);
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
	//0x8a
	if ('screen_temp_mode_enable' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x8a);
		if ([0, 1].indexOf(payload.screen_temp_mode_enable) === -1) {
			throw new Error('screen_temp_mode_enable must be one of [0, 1]');
		}
		// 0:disable, 1:enable
		buffer.writeUInt8(payload.screen_temp_mode_enable);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x8c
	if ('screen_fan_mode_enable' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x8c);
		if ([0, 1].indexOf(payload.screen_fan_mode_enable) === -1) {
			throw new Error('screen_fan_mode_enable must be one of [0, 1]');
		}
		// 0:disable, 1:enable
		buffer.writeUInt8(payload.screen_fan_mode_enable);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x71
	if ('button_custom_function' in payload) {
		var buffer = new Buffer();
		if (isValid(payload.button_custom_function.enable)) {
			buffer.writeUInt8(0x71);
			// 0：disable, 1：enable
			buffer.writeUInt8(0x00);
			if ([0, 1].indexOf(payload.button_custom_function.enable) === -1) {
				throw new Error('button_custom_function.enable must be one of [0, 1]');
			}
			buffer.writeInt8(payload.button_custom_function.enable);
		}
		if (isValid(payload.button_custom_function.mode1)) {
			buffer.writeUInt8(0x71);
			// 1：Temperature Control Mode, 2：Fan Mode, 3：Schedule Switch, 4：Status Report, 5：Filter Cleaning Reset, 6：Button Event1, 7：Temperature Unit Switch
			buffer.writeUInt8(0x01);
			if ([1, 2, 3, 4, 5, 6, 7].indexOf(payload.button_custom_function.mode1) === -1) {
				throw new Error('button_custom_function.mode1 must be one of [1, 2, 3, 4, 5, 6, 7]');
			}
			// 1：Temperature Control Mode, 2：Fan Mode, 3：Schedule Switch, 4：Status Report, 5：Filter Cleaning Reset, 6：Button Event1, 7：Temperature Unit Switch
			buffer.writeUInt8(payload.button_custom_function.mode1);
		}
		if (isValid(payload.button_custom_function.mode2)) {
			buffer.writeUInt8(0x71);
			// 1：Temperature Control Mode, 2：Fan Mode, 3：Schedule Switch, 4：Status Report, 5：Filter Cleaning Reset, 6：Button Event2, 7：Temperature Unit Switch
			buffer.writeUInt8(0x02);
			if ([1, 2, 3, 4, 5, 6, 7].indexOf(payload.button_custom_function.mode2) === -1) {
				throw new Error('button_custom_function.mode2 must be one of [1, 2, 3, 4, 5, 6, 7]');
			}
			// 1：Temperature Control Mode, 2：Fan Mode, 3：Schedule Switch, 4：Status Report, 5：Filter Cleaning Reset, 6：Button Event2, 7：Temperature Unit Switch
			buffer.writeUInt8(payload.button_custom_function.mode2);
		}
		if (isValid(payload.button_custom_function.mode3)) {
			buffer.writeUInt8(0x71);
			// 0：System On/Off, 3：Schedule Switch, 4：Status Report, 5：Filter Cleaning Reset, 6：Button Event3, 7：Temperature Unit Switch
			buffer.writeUInt8(0x03);
			if ([0, 3, 4, 5, 6, 7].indexOf(payload.button_custom_function.mode3) === -1) {
				throw new Error('button_custom_function.mode3 must be one of [0, 3, 4, 5, 6, 7]');
			}
			// 0：System On/Off, 3：Schedule Switch, 4：Status Report, 5：Filter Cleaning Reset, 6：Button Event3, 7：Temperature Unit Switch
			buffer.writeUInt8(payload.button_custom_function.mode3);
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x72
	if ('children_lock_settings' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x72);
		if ([0, 1].indexOf(payload.children_lock_settings.enable) === -1) {
			throw new Error('children_lock_settings.enable must be one of [0, 1]');
		}
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
		if ([0, 1].indexOf(payload.unlock_button.enable) === -1) {
			throw new Error('unlock_button.enable must be one of [0, 1]');
		}
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
		if ([0, 1].indexOf(payload.daylight_saving_time.enable) === -1) {
			throw new Error('daylight_saving_time.enable must be one of [0, 1]');
		}
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

		// 1：Sun., 2：Mon., 3：Tues., 4：Wed., 5：Thurs., 6：Fri., 7：Sat.,
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
		if ([0, 1].indexOf(payload.temperature_calibration_settings.enable) === -1) {
			throw new Error('temperature_calibration_settings.enable must be one of [0, 1]');
		}
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
		if ([0, 1].indexOf(payload.humidity_calibration_settings.enable) === -1) {
			throw new Error('humidity_calibration_settings.enable must be one of [0, 1]');
		}
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
			if (schedule_settings_item_id < 0 || schedule_settings_item_id > 15) {
				throw new Error('schedule_settings_item_id must be between 0 and 15');
			}

			if (isValid(schedule_settings_item.enable)) {
				buffer.writeUInt8(0x7b);
				buffer.writeUInt8(schedule_settings_item_id);
				// 0：disable, 1：enable
				buffer.writeUInt8(0x00);
				if ([0, 1].indexOf(schedule_settings_item.enable) === -1) {
					throw new Error('enable must be one of [0, 1]');
				}
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
				if ([0, 1, 2, 3].indexOf(schedule_settings_item.content1.tstat_mode) === -1) {
					throw new Error('content1.tstat_mode must be one of [0, 1, 2, 3]');
				}
				// 0：heat, 1：em heat, 2：cool, 3：auto
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
				if ([0, 1, 2, 3, 4, 5].indexOf(schedule_settings_item.content2.fan_mode) === -1) {
					throw new Error('content2.fan_mode must be one of [0, 1, 2, 3, 4, 5]');
				}
				// 0：auto, 1：circulate, 2：on, 3：low, 4：medium, 5：high
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
			if (isValid(schedule_settings_item.system_on_off)) {
				buffer.writeUInt8(0x7b);
				buffer.writeUInt8(schedule_settings_item_id);
				// 0：system off, 1：system on
				buffer.writeUInt8(0x05);
				if ([0, 1].indexOf(schedule_settings_item.system_on_off) === -1) {
					throw new Error('system_on_off must be one of [0, 1]');
				}
				// 0：system off, 1：system on
				buffer.writeUInt8(schedule_settings_item.system_on_off);
			}
			if (isValid(schedule_settings_item.tstat_mode)) {
				buffer.writeUInt8(0x7b);
				buffer.writeUInt8(schedule_settings_item_id);
				// 0：heat, 1：em heat, 2：cool, 3：auto, 4：dehumidify, 5：ventilation
				buffer.writeUInt8(0x06);
				if ([0, 1, 2, 3, 4, 5].indexOf(schedule_settings_item.tstat_mode) === -1) {
					throw new Error('tstat_mode must be one of [0, 1, 2, 3, 4, 5]');
				}
				// 0：heat, 1：em heat, 2：cool, 3：auto, 4：dehumidify, 5：ventilation
				buffer.writeUInt8(schedule_settings_item.tstat_mode);
			}
			if (isValid(schedule_settings_item.fan_mode)) {
				buffer.writeUInt8(0x7b);
				buffer.writeUInt8(schedule_settings_item_id);
				// 0：auto, 1：circulate, 2：on, 3：low, 4：medium, 5：high
				buffer.writeUInt8(0x07);
				if ([0, 1, 2, 3, 4, 5].indexOf(schedule_settings_item.fan_mode) === -1) {
					throw new Error('fan_mode must be one of [0, 1, 2, 3, 4, 5]');
				}
				// 0：auto, 1：circulate, 2：on, 3：low, 4：medium, 5：high
				buffer.writeUInt8(schedule_settings_item.fan_mode);
			}
			if (isValid(schedule_settings_item.heat_target_temperature)) {
				buffer.writeUInt8(0x7b);
				buffer.writeUInt8(schedule_settings_item_id);
				buffer.writeUInt8(0x08);
				if (schedule_settings_item.heat_target_temperature < 5 || schedule_settings_item.heat_target_temperature > 35) {
					throw new Error('heat_target_temperature must be between 5 and 35');
				}
				buffer.writeInt16LE(schedule_settings_item.heat_target_temperature * 100);
			}
			if (isValid(schedule_settings_item.cool_target_temperature)) {
				buffer.writeUInt8(0x7b);
				buffer.writeUInt8(schedule_settings_item_id);
				buffer.writeUInt8(0x09);
				if (schedule_settings_item.cool_target_temperature < 5 || schedule_settings_item.cool_target_temperature > 35) {
					throw new Error('cool_target_temperature must be between 5 and 35');
				}
				buffer.writeInt16LE(schedule_settings_item.cool_target_temperature * 100);
			}
			if (isValid(schedule_settings_item.auto_target_temperature)) {
				buffer.writeUInt8(0x7b);
				buffer.writeUInt8(schedule_settings_item_id);
				buffer.writeUInt8(0x0a);
				if (schedule_settings_item.auto_target_temperature < 5 || schedule_settings_item.auto_target_temperature > 35) {
					throw new Error('auto_target_temperature must be between 5 and 35');
				}
				buffer.writeInt16LE(schedule_settings_item.auto_target_temperature * 100);
			}
		}
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x54
	if ('reset_ble_name' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x54);
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
		if ([0, 1].indexOf(payload.fan_error_alarm.mode) === -1) {
			throw new Error('fan_error_alarm.mode must be one of [0, 1]');
		}
		// 0：clean alarm, 1：trigger alarm
		buffer.writeUInt8(payload.fan_error_alarm.mode);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0x5b
	if ('filter_clean_alarm' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0x5b);
		if ([0].indexOf(payload.filter_clean_alarm.mode) === -1) {
			throw new Error('filter_clean_alarm.mode must be one of [0]');
		}
		// 0：clean alarm
		buffer.writeUInt8(payload.filter_clean_alarm.mode);
		encoded = encoded.concat(buffer.toBytes());
	}
	//0xbe
	if ('reboot' in payload) {
		var buffer = new Buffer();
		buffer.writeUInt8(0xbe);
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
		if ([0, 1, 2, 3, 4, 5, 6, 7, 255].indexOf(payload.delete_task_plan.type) === -1) {
			throw new Error('delete_task_plan.type must be one of [0, 1, 2, 3, 4, 5, 6, 7, 255]');
		}
		// 0:plan0, 1:plan1, 2:plan2, 3:plan3, 4:plan4, 5:plan5, 6:plan6, 7:plan7, 255：All
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
		  "request_check_order": "fe",
		  "request_command_queries": "ef",
		  "request_query_all_configurations": "ee",
		  "lorawan_configuration_settings": "cf",
		  "lorawan_configuration_settings.mode": "cf00",
		  "random_key": "c9",
		  "tsl_version": "df",
		  "product_name": "de",
		  "product_pn": "dd",
		  "product_sn": "db",
		  "version": "da",
		  "oem_id": "d9",
		  "device_status": "c8",
		  "product_frequency_band": "d8",
		  "device_time": "b9",
		  "battery_info": "b8",
		  "ble_configuration_settings": "cd",
		  "ble_configuration_settings.enable": "cd00",
		  "ble_configuration_settings.local_id": "cd01",
		  "ble_configuration_settings.local_name_first": "cd05",
		  "ble_configuration_settings.local_name_last": "cd06",
		  "ble_configuration_settings.pair_info": "cd07",
		  "ble_configuration_settings.pair_name": "cd04",
		  "ble_configuration_settings.pair_name._item": "cd04xx",
		  "ble_configuration_settings.pair_mac": "cd02",
		  "ble_configuration_settings.pair_mac._item": "cd02xx",
		  "ble_configuration_settings.pair_addr": "cd03",
		  "ble_configuration_settings.pair_addr._item": "cd03xx",
		  "ble_new_event": "ba",
		  "ble_new_event._item": "baxx",
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
		  "temperature_alarm.collection_error": "0b00",
		  "temperature_alarm.lower_range_error": "0b01",
		  "temperature_alarm.over_range_error": "0b02",
		  "temperature_alarm.no_data": "0b03",
		  "humidity_alarm": "0c",
		  "humidity_alarm.collection_error": "0c00",
		  "humidity_alarm.lower_range_error": "0c01",
		  "humidity_alarm.over_range_error": "0c02",
		  "humidity_alarm.no_data": "0c03",
		  "ble_event": "09",
		  "ble_event.none": "0900",
		  "ble_event.pair_cancel": "0901",
		  "ble_event.disconnect": "0902",
		  "power_bus_event": "0a",
		  "power_bus_event.none": "0a00",
		  "power_bus_event.disconnect": "0a01",
		  "key_event": "0d",
		  "key_event.f1": "0d00",
		  "key_event.f2": "0d01",
		  "key_event.f3": "0d02",
		  "battery_event": "0f",
		  "battery_event.recover": "0f00",
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
		  "collection_interval": "60",
		  "collection_interval.seconds_of_time": "6000",
		  "collection_interval.minutes_of_time": "6001",
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
		  "target_temperature_settings.dehumidify": "6906",
		  "target_temperature_settings.ventilation": "6907",
		  "minimum_dead_zone": "6a",
		  "target_temperature_range": "6b",
		  "target_temperature_range.heat": "6b00",
		  "target_temperature_range.em_heat": "6b01",
		  "target_temperature_range.cool": "6b02",
		  "target_temperature_range.auto": "6b03",
		  "target_temperature_range.dehumidify": "6b04",
		  "target_temperature_range.ventilation": "6b05",
		  "fan_control_mode": "74",
		  "pir_common": "82",
		  "pir_common.enable": "8201",
		  "pir_common.release_time": "8202",
		  "pir_common.mode": "8203",
		  "pir_common.check": "8204",
		  "pir_night": "84",
		  "pir_night.enable": "8401",
		  "pir_night.mode": "8402",
		  "pir_night.check": "8403",
		  "pir_night.night_time": "8404",
		  "pir_night.occupied": "8405",
		  "pir_energy": "83",
		  "pir_energy.enable": "8301",
		  "pir_energy.plan": "8302",
		  "intelligent_display_enable": "62",
		  "backlight_enable": "89",
		  "screen_display_settings": "75",
		  "screen_temp_mode_enable": "8a",
		  "screen_fan_mode_enable": "8c",
		  "button_custom_function": "71",
		  "button_custom_function.enable": "7100",
		  "button_custom_function.mode1": "7101",
		  "button_custom_function.mode2": "7102",
		  "button_custom_function.mode3": "7103",
		  "children_lock_settings": "72",
		  "unlock_button": "81",
		  "unlock_combination_button_settings": "80",
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
		  "schedule_settings._item.system_on_off": "7bxx05",
		  "schedule_settings._item.tstat_mode": "7bxx06",
		  "schedule_settings._item.fan_mode": "7bxx07",
		  "schedule_settings._item.heat_target_temperature": "7bxx08",
		  "schedule_settings._item.cool_target_temperature": "7bxx09",
		  "schedule_settings._item.auto_target_temperature": "7bxx0a",
		  "reset_ble_name": "54",
		  "system_status_control": "59",
		  "origin_temperature": "86",
		  "origin_humidity": "87",
		  "insert_temporary_plan": "5c",
		  "fan_error_alarm": "55",
		  "filter_clean_alarm": "5b",
		  "reboot": "be",
		  "reconnect": "b6",
		  "delete_task_plan": "5f"
	};
}
function processTemperature(payload) {
	var allTemperatureProperties = {
    "temperature": {
        "coefficient": 0.01,
        "unitName": "℃"
    },
    "target_temperature1": {
        "coefficient": 0.01,
        "unitName": "℃"
    },
    "target_temperature2": {
        "coefficient": 0.01,
        "unitName": "℃"
    },
    "target_temperature_settings.heat": {
        "coefficient": 0.01,
        "unitName": "℃"
    },
    "target_temperature_settings.em_heat": {
        "coefficient": 0.01,
        "unitName": "℃"
    },
    "target_temperature_settings.cool": {
        "coefficient": 0.01,
        "unitName": "℃"
    },
    "target_temperature_settings.auto": {
        "coefficient": 0.01,
        "unitName": "℃"
    },
    "target_temperature_settings.auto_heat": {
        "coefficient": 0.01,
        "unitName": "℃"
    },
    "target_temperature_settings.auto_cool": {
        "coefficient": 0.01,
        "unitName": "℃"
    },
    "target_temperature_settings.dehumidify": {
        "coefficient": 0.01,
        "unitName": "℃"
    },
    "target_temperature_settings.ventilation": {
        "coefficient": 0.01,
        "unitName": "℃"
    },
    "minimum_dead_zone": {
        "coefficient": 0.01,
        "unitName": "K"
    },
    "target_temperature_range.heat.min": {
        "coefficient": 0.01,
        "unitName": "℃"
    },
    "target_temperature_range.heat.max": {
        "coefficient": 0.01,
        "unitName": "℃"
    },
    "target_temperature_range.em_heat.min": {
        "coefficient": 0.01,
        "unitName": "℃"
    },
    "target_temperature_range.em_heat.max": {
        "coefficient": 0.01,
        "unitName": "℃"
    },
    "target_temperature_range.cool.min": {
        "coefficient": 0.01,
        "unitName": "℃"
    },
    "target_temperature_range.cool.max": {
        "coefficient": 0.01,
        "unitName": "℃"
    },
    "target_temperature_range.auto.min": {
        "coefficient": 0.01,
        "unitName": "℃"
    },
    "target_temperature_range.auto.max": {
        "coefficient": 0.01,
        "unitName": "℃"
    },
    "target_temperature_range.dehumidify.min": {
        "coefficient": 0.01,
        "unitName": "℃"
    },
    "target_temperature_range.dehumidify.max": {
        "coefficient": 0.01,
        "unitName": "℃"
    },
    "target_temperature_range.ventilation.min": {
        "coefficient": 0.01,
        "unitName": "℃"
    },
    "target_temperature_range.ventilation.max": {
        "coefficient": 0.01,
        "unitName": "℃"
    },
    "temperature_calibration_settings.calibration_value": {
        "coefficient": 0.01,
        "unitName": "℃"
    },
    "schedule_settings._item.content1.heat_target_temperature": {
        "coefficient": 0.01,
        "unitName": "℃"
    },
    "schedule_settings._item.content1.em_heat_target_temperature": {
        "coefficient": 0.01,
        "unitName": "℃"
    },
    "schedule_settings._item.content1.cool_target_temperature": {
        "coefficient": 0.01,
        "unitName": "℃"
    },
    "schedule_settings._item.content2.auto_target_temperature": {
        "coefficient": 0.01,
        "unitName": "℃"
    },
    "schedule_settings._item.content2.auto_heat_target_temperature": {
        "coefficient": 0.01,
        "unitName": "℃"
    },
    "schedule_settings._item.content2.auto_cool_target_temperature": {
        "coefficient": 0.01,
        "unitName": "℃"
    },
    "schedule_settings._item.heat_target_temperature": {
        "coefficient": 0.01,
        "unitName": "℃"
    },
    "schedule_settings._item.cool_target_temperature": {
        "coefficient": 0.01,
        "unitName": "℃"
    },
    "schedule_settings._item.auto_target_temperature": {
        "coefficient": 0.01,
        "unitName": "℃"
    },
    "origin_temperature": {
        "coefficient": 0.01,
        "unitName": "℃"
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
			var unitName = allTemperatureProperties[newPropertyId].unitName;
			var constant = unitName == 'K' ? 0 : 32;
			var fahrenheitProperty = convertName(propertyId, 'fahrenheit');
			var celsiusProperty = convertName(propertyId, 'celsius');
			var stringCoefficient = String(allTemperatureProperties[newPropertyId].coefficient);
			var dotIndex = stringCoefficient.indexOf('.');
			var precision = dotIndex != -1 ? stringCoefficient.length - dotIndex - 1 : 0;
			if (!hasPath(payload, propertyId)) {
				// if (hasPath(payload, fahrenheitProperty) && hasPath(payload, celsiusProperty)) {
				//     throw new Error(fahrenheitProperty + ' and ' + celsiusProperty + ' cannot be in payload at the same time');
				// }
				if (hasPath(payload, celsiusProperty)) {
					setPath(payload, propertyId, Number(getPath(payload, celsiusProperty).toFixed(precision)));
				} else if (hasPath(payload, fahrenheitProperty)) {
					setPath(payload, propertyId, Number(((getPath(payload, fahrenheitProperty) - constant) / 1.8).toFixed(precision)));
				}
			}
		}
	}
	return payload;
}    return {
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
