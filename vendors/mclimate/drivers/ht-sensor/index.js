var KEEPALIVE_BYTE_LEN = 7;

var calculateTemperature = function (rawData) {
	return (rawData - 400) / 10;
};

var calculateHumidity = function (rawData) {
	return (rawData * 100) / 256;
};

function handleKeepalive(bytes, data) {
	var temperatureRaw = (bytes[1] << 8) | bytes[2];
	data.sensorTemperature = Number(calculateTemperature(temperatureRaw).toFixed(2));
	data.relativeHumidity = Number(calculateHumidity(bytes[3]).toFixed(2));
	data.batteryVoltage = Number(((bytes[4] * 8 + 1600) / 1000).toFixed(2));

	// Devices running older firmware send a 5 byte keepalive without the
	// external thermistor readings, so only report them when present.
	if (bytes.length >= KEEPALIVE_BYTE_LEN) {
		data.thermistorProperlyConnected = (bytes[5] & 0x04) === 0;
		var extThermHigh = bytes[5] & 0x03; // mask out bits 1:0
		var extThermLow = bytes[6];
		var extThermRaw = (extThermHigh << 8) | extThermLow;
		data.extThermistorTemperature = data.thermistorProperlyConnected
			? Number((extThermRaw * 0.1).toFixed(2))
			: 0;
	}

	return data;
}

function handleResponse(bytes, data) {
	var commands = bytes.map(function (byte) {
		return ("0" + byte.toString(16)).substr(-2);
	});
	commands = commands.slice(0, -KEEPALIVE_BYTE_LEN);
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
			case '12':
				command_len = 1;
				data.keepAliveTime = parseInt(commands[i + 1], 16);
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
			case '32':
				command_len = 2;
				data.temperatureCompensation = {
					negativeCompensation: !!parseInt(commands[i + 1], 16),
					compensation: parseInt(commands[i + 2], 16) / 10
				};
				break;
			case '34':
				command_len = 2;
				data.humidityCompensation = {
					negativeCompensation: !!parseInt(commands[i + 1], 16),
					compensation: parseInt(commands[i + 2], 16)
				};
				break;
			case 'a4':
				command_len = 1;
				data.region = parseInt(commands[i + 1], 16);
				break;
			case 'aa':
				command_len = 1;
				data.d2dCommunicationState = parseInt(commands[i + 1], 16) === 1;
				break;
			case 'ac':
				command_len = 1;
				data.d2dCommunicationPeriod = parseInt(commands[i + 1], 16);
				break;
			default:
				command_len = 0;
				break;
		}
		commands.splice(i, command_len);
	});

	return data;
}

function decodeUplink(input) {
	var bytes = input.bytes;
	var data = {};

	try {
		if (!bytes || bytes.length < 5) {
			throw new Error('payload must be at least 5 bytes long');
		}

		if (bytes[0] === 1) {
			data = handleKeepalive(bytes, data);
		} else {
			data = handleResponse(bytes, data);
			data = handleKeepalive(bytes.slice(-KEEPALIVE_BYTE_LEN), data);
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
				// ---- general commands ----
				case "setKeepAlive":
					bytes.push(0x02);
					bytes.push(data.setKeepAlive);
					break;
				case "getKeepAliveTime":
					bytes.push(0x12);
					break;
				case "getDeviceVersions":
					bytes.push(0x04);
					break;
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
				// ---- HT sensor commands ----
				case "setTemperatureCompensation":
					// The compensation value is transmitted in tenths of a degree.
					bytes.push(0x31);
					bytes.push(data.setTemperatureCompensation.negativeCompensation ? 0x01 : 0x00);
					bytes.push(Math.round(data.setTemperatureCompensation.compensation * 10));
					break;
				case "getTemperatureCompensation":
					bytes.push(0x32);
					break;
				case "setHumidityCompensation":
					bytes.push(0x33);
					bytes.push(data.setHumidityCompensation.negativeCompensation ? 0x01 : 0x00);
					bytes.push(data.setHumidityCompensation.compensation);
					break;
				case "getHumidityCompensation":
					bytes.push(0x34);
					break;
				case "setD2dCommunicationState":
					bytes.push(0xa9);
					bytes.push(data.setD2dCommunicationState ? 0x01 : 0x00);
					break;
				case "getD2dCommunicationState":
					bytes.push(0xaa);
					break;
				case "setD2dCommunicationPeriod":
					bytes.push(0xab);
					bytes.push(data.setD2dCommunicationPeriod);
					break;
				case "getD2dCommunicationPeriod":
					bytes.push(0xac);
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
// {"setKeepAlive":10} --> 020A
// {"setTemperatureCompensation":{"negativeCompensation":true,"compensation":1.5}} --> 31010F
// {"setD2dCommunicationPeriod":30} --> AB1E
// {"getTemperatureCompensation":true} --> 32

exports.decodeUplink = decodeUplink;
exports.encodeDownlink = encodeDownlink;
exports.decodeDownlink = decodeDownlink;
