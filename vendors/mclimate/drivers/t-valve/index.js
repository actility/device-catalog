var KEEPALIVE_BYTE_LEN = 5;

function decodeUplink(input) {
	var bytes = input.bytes;
	var data = {};

	var messageTypes = ['keepalive', 'testButtonPressed', 'floodDetected', 'controlButtonPressed', 'fraudDetected'];

	function shortPackage(bytes, data) {
		data.reason = 'keepalive';
		data.waterTemp = (bytes[0] & 0xff) / 2;
		data.valveState = !!(bytes[1] & 0x80);
		data.ambientTemp = ((bytes[1] & 0x7f) - 20) / 2;
		return data;
	}

	function longPackage(bytes, data) {
		data.reason = messageTypes[(bytes[0] >> 5) & 0x07];
		data.boxTamper = !!(bytes[0] & (1 << 3));
		data.floodDetectionWireState = !!(bytes[0] & (1 << 2));
		data.flood = !!(bytes[0] & (1 << 1));
		data.magnet = !!(bytes[0] & 1);
		data.alarmValidated = !!(bytes[1] & (1 << 7));
		data.manualOpenIndicator = !!(bytes[1] & (1 << 6));
		data.manualCloseIndicator = !!(bytes[1] & (1 << 5));
		data.manualControl = {
			enableOpen: !!(bytes[1] & (1 << 6)),
			enableClose: !!(bytes[1] & (1 << 5))
		};
		data.deviceVersions = { software: bytes[1] & 0x1f, hardware: 0 };
		data.closeTime = bytes[2];
		data.openTime = bytes[3];
		data.openCloseTime = { openingTime: bytes[3], closingTime: bytes[2] };
		data.battery = (bytes[4] * 8 + 1600) / 1000;
		return data;
	}

	function handleResponse(bytes, data) {
		var commands = bytes.slice(KEEPALIVE_BYTE_LEN).map(function (byte) {
			return ("0" + byte.toString(16)).substr(-2);
		});
		var command_len = 0;

		commands.forEach(function (command, i) {
			switch (command) {
				case '04':
					command_len = 2;
					data.deviceVersions = {
						hardware: Number(commands[i + 1]),
						software: Number(commands[i + 2])
					};
					break;
				case '0e':
					command_len = 4;
					data.openCloseTimeExtended = {
						openingTime: (parseInt(commands[i + 1], 16) << 8) | parseInt(commands[i + 2], 16),
						closingTime: (parseInt(commands[i + 3], 16) << 8) | parseInt(commands[i + 4], 16)
					};
					break;
				case '0f':
					command_len = 1;
					data.emergencyOpenings = parseInt(commands[i + 1], 16);
					break;
				case '10':
					command_len = 1;
					data.floodAlarmTime = parseInt(commands[i + 1], 16);
					break;
				case '11':
					command_len = 1;
					data.workingVoltage = parseInt(commands[i + 1], 16) * 8 + 1600;
					break;
				case '12':
					command_len = 1;
					data.keepAliveTime = parseInt(commands[i + 1], 16);
					break;
				case '13':
					command_len = 1;
					data.deviceFloodSensor = parseInt(commands[i + 1], 16);
					break;
				case '16':
					command_len = 1;
					data.joinRetryPeriod = (parseInt(commands[i + 1], 16) * 5) / 60;
					break;
				case '18':
					command_len = 1;
					data.uplinkType = parseInt(commands[i + 1], 16);
					break;
				case '1a':
					command_len = 2;
					data.watchDogParams = {
						wdpC: commands[i + 1] === '00' ? false : parseInt(commands[i + 1], 16),
						wdpUc: commands[i + 2] === '00' ? false : parseInt(commands[i + 2], 16)
					};
					break;
				case 'a4':
					command_len = 1;
					data.region = parseInt(commands[i + 1], 16);
					break;
				default:
					command_len = 0;
					break;
			}
			commands.splice(i, command_len);
		});

		return data;
	}

	try {
		if (!bytes || bytes.length < 2) {
			throw new Error('payload must be at least 2 bytes long');
		}

		if (bytes.length === 2) {
			data = shortPackage(bytes, data);
		} else if (bytes.length === KEEPALIVE_BYTE_LEN) {
			data = longPackage(bytes, data);
		} else {
			// Long keepalive followed by one or more command answers.
			data = longPackage(bytes.slice(0, KEEPALIVE_BYTE_LEN), data);
			data = handleResponse(bytes, data);
		}
	} catch (error) {
		return {
			errors: ['Invalid uplink payload: ' + error.message],
			warnings: []
		};
	}

	return {
		data: data
	};
}

function encodeDownlink(input) {
	var bytes = [];
	var data = (input && input.data) ? input.data : {};
	var key, i;

	function pushUInt16(value) {
		bytes.push((value >> 8) & 0xff);
		bytes.push(value & 0xff);
	}

	for (key in data) {
		if (data.hasOwnProperty(key)) {
			switch (key) {
				case "setOpenCloseTime":
					bytes.push(0x01);
					bytes.push(data.setOpenCloseTime.openingTime);
					bytes.push(data.setOpenCloseTime.closingTime);
					break;
				case "setOpenCloseTimeExtended":
					bytes.push(0x0d);
					pushUInt16(data.setOpenCloseTimeExtended.openingTime);
					pushUInt16(data.setOpenCloseTimeExtended.closingTime);
					break;
				case "getOpenCloseTimeExtended":
					bytes.push(0x0e);
					break;
				case "setLED":
					bytes.push(0x02);
					bytes.push(data.setLED.ledId);
					bytes.push(data.setLED.behavior);
					bytes.push(data.setLED.seconds);
					break;
				case "setBuzzer":
					// Volume occupies the high nibble, frequency the low nibble.
					bytes.push(0x03);
					bytes.push(((data.setBuzzer.volume & 0x0f) << 4) | (data.setBuzzer.frequency & 0x0f));
					bytes.push(data.setBuzzer.activeTime);
					bytes.push(Math.round(data.setBuzzer.onTime / 10));
					bytes.push(Math.round(data.setBuzzer.offTime / 10));
					break;
				case "setEmergencyOpenings":
					bytes.push(0x04);
					bytes.push(data.setEmergencyOpenings);
					break;
				case "getEmergencyOpenings":
					bytes.push(0x0f);
					break;
				case "setManualControl":
					bytes.push(0x05);
					bytes.push((data.setManualControl.enableClose ? 0x02 : 0x00) |
						(data.setManualControl.enableOpen ? 0x01 : 0x00));
					break;
				case "setFloodAlarmTime":
					bytes.push(0x06);
					bytes.push(data.setFloodAlarmTime);
					break;
				case "getFloodAlarmTime":
					bytes.push(0x10);
					break;
				case "setKeepAlive":
					bytes.push(0x07);
					bytes.push(data.setKeepAlive);
					break;
				case "getKeepAliveTime":
					bytes.push(0x12);
					break;
				case "requestFullData":
					bytes.push(0x08);
					break;
				case "setWorkingVoltage":
					bytes.push(0x09);
					bytes.push(Math.round((data.setWorkingVoltage - 1600) / 8));
					break;
				case "getWorkingVoltage":
					bytes.push(0x11);
					break;
				case "setDeviceFloodSensor":
					bytes.push(0x0a);
					bytes.push(data.setDeviceFloodSensor ? 0x01 : 0x00);
					break;
				case "getDeviceFloodSensor":
					bytes.push(0x13);
					break;
				case "deactivateDevice":
					bytes.push(0x0b);
					break;
				case "setValveState":
					bytes.push(0x0c);
					bytes.push(data.setValveState ? 0x01 : 0x00);
					break;
				case "setSingleTimeValveState":
					bytes.push(0x14);
					bytes.push(data.setSingleTimeValveState.state ? 0x01 : 0x00);
					pushUInt16(data.setSingleTimeValveState.time);
					break;
				case "getDeviceVersions":
					bytes.push(0x04);
					break;
				case "setJoinRetryPeriod":
					bytes.push(0x15);
					bytes.push(Math.floor((data.setJoinRetryPeriod * 60) / 5));
					break;
				case "getJoinRetryPeriod":
					bytes.push(0x16);
					break;
				case "setUplinkType":
					bytes.push(0x17);
					bytes.push(data.setUplinkType);
					break;
				case "getUplinkType":
					bytes.push(0x18);
					break;
				case "setWatchDogParams":
					bytes.push(0x19);
					bytes.push(data.setWatchDogParams.confirmedUplinks);
					bytes.push(data.setWatchDogParams.unconfirmedUplinks);
					break;
				case "getWatchDogParams":
					bytes.push(0x1a);
					break;
				case "getRegion":
					bytes.push(0xa4);
					break;
				case "sendCustomHexCommand":
					for (i = 0; i < data.sendCustomHexCommand.length; i += 2) {
						bytes.push(parseInt(data.sendCustomHexCommand.substr(i, 2), 16));
					}
					break;
				default:
					break;
			}
		}
	}

	return {
		bytes: bytes,
		fPort: 1,
		warnings: [],
		errors: []
	};
}

function decodeDownlink(input) {
	return {
		data: { bytes: input.bytes },
		warnings: [],
		errors: []
	};
}

// Example downlink commands
// {"setValveState":true} --> 0C01
// {"setOpenCloseTime":{"openingTime":10,"closingTime":20}} --> 010A14
// {"setSingleTimeValveState":{"state":true,"time":300}} --> 1401012C
// {"setWorkingVoltage":3600} --> 09FA
// {"getKeepAliveTime":true} --> 12

exports.decodeUplink = decodeUplink;
exports.encodeDownlink = encodeDownlink;
exports.decodeDownlink = decodeDownlink;
