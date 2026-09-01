var KEEPALIVE_BYTE_LEN = 3;

function decodeUplink(input) {
	var bytes = input.bytes;
	var data = {};

	var toBool = function (value) {
		return value == '1';
	};

	var toBinary = function (byteValues) {
		return byteValues.map(function (byte) {
			var number = byte.toString(2);
			return "00000000".substr(number.length) + number;
		});
	};

	var messageTypes = ['keepalive', 'testButtonPressed', 'floodDetected', 'fraudDetected', 'fraudDetected'];

	function handleKeepalive(byteValues, data) {
		var byteArray = toBinary(byteValues);

		data.reason = messageTypes[parseInt(byteArray[0].slice(0, 3), 2)];
		data.boxTamper = toBool(byteArray[0][4]);
		data.flood = toBool(byteArray[0][6]);
		data.battery = (parseInt(byteArray[1], 2) * 16) / 1000;
		// The 2 byte keepalive carries no temperature reading.
		if (byteArray.length > 2) {
			data.temperature = parseInt(byteArray[2], 2);
		}

		return data;
	}

	function handleResponse(byteValues, data) {
		var commands = byteValues.map(function (byte) {
			return ("0" + byte.toString(16)).substr(-2);
		});
		commands = commands.slice(0, -KEEPALIVE_BYTE_LEN);
		var command_len = 0;

		commands.forEach(function (command, i) {
			switch (command) {
				case '06':
					command_len = 1;
					data.alarmDuration = parseInt(commands[i + 1], 16);
					break;
				case '07':
					command_len = 2;
					data.deviceVersions = {
						hardware: Number(commands[i + 1]),
						software: Number(commands[i + 2])
					};
					break;
				case '09':
					command_len = 1;
					data.floodEventSendTime = parseInt(commands[i + 1], 16);
					break;
				case '12':
					// The flood sensor reports its keepalive time as 2 bytes.
					command_len = 2;
					data.keepAliveTime = parseInt(commands[i + 1] + commands[i + 2], 16);
					break;
				case '14':
					command_len = 1;
					data.floodEventUplinkType = parseInt(commands[i + 1], 16);
					break;
				case '19':
					command_len = 1;
					data.joinRetryPeriod = (parseInt(commands[i + 1], 16) * 5) / 60;
					break;
				case '1b':
					command_len = 1;
					data.uplinkType = parseInt(commands[i + 1], 16);
					break;
				case '1d':
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

		if (bytes.length > KEEPALIVE_BYTE_LEN) {
			data = handleResponse(bytes, data);
			data = handleKeepalive(bytes.slice(-KEEPALIVE_BYTE_LEN), data);
		} else {
			data = handleKeepalive(bytes, data);
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

	for (key in data) {
		if (data.hasOwnProperty(key)) {
			switch (key) {
				// ---- flood sensor commands ----
				case "getTemperature":
					bytes.push(0x01);
					break;
				case "setFloodAlarmTime":
					bytes.push(0x04);
					bytes.push(data.setFloodAlarmTime);
					break;
				case "getFloodAlarmTime":
					bytes.push(0x06);
					break;
				case "setKeepAlive":
					// The flood sensor takes a two byte keepalive interval.
					bytes.push(0x05);
					bytes.push((data.setKeepAlive >> 8) & 0xff);
					bytes.push(data.setKeepAlive & 0xff);
					break;
				case "getKeepAliveTime":
					bytes.push(0x12);
					break;
				case "getDeviceVersions":
					bytes.push(0x07);
					break;
				case "setFloodEventSendTime":
					bytes.push(0x08);
					bytes.push(data.setFloodEventSendTime);
					break;
				case "getFloodEventSendTime":
					bytes.push(0x09);
					break;
				case "setFloodEventUplinkType":
					bytes.push(0x13);
					bytes.push(data.setFloodEventUplinkType);
					break;
				case "getFloodEventUplinkType":
					bytes.push(0x14);
					break;
				// ---- general commands ----
				case "setJoinRetryPeriod":
					bytes.push(0x10);
					bytes.push(Math.floor((data.setJoinRetryPeriod * 60) / 5));
					break;
				case "getJoinRetryPeriod":
					bytes.push(0x19);
					break;
				case "setUplinkType":
					bytes.push(0x11);
					bytes.push(data.setUplinkType);
					break;
				case "getUplinkType":
					bytes.push(0x1b);
					break;
				case "setWatchDogParams":
					bytes.push(0x1c);
					bytes.push(data.setWatchDogParams.confirmedUplinks);
					bytes.push(data.setWatchDogParams.unconfirmedUplinks);
					break;
				case "getWatchDogParams":
					bytes.push(0x1d);
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
// {"setKeepAlive":60} --> 05003C
// {"setFloodAlarmTime":30} --> 041E
// {"setFloodEventSendTime":10} --> 080A
// {"getFloodAlarmTime":true} --> 06

exports.decodeUplink = decodeUplink;
exports.encodeDownlink = encodeDownlink;
exports.decodeDownlink = decodeDownlink;
