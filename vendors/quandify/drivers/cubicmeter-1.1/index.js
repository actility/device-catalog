// Cubicmeter 1.1 uplink decoder

var appStates = {
  3: "ready",
  4: "pipeSelection",
  5: "metering",
};

var uplinkTypes = {
  0: "ping",
  1: "statusReport",
  6: "response",
};

var responseStatuses = {
  0: "ok",
  1: "commandError",
  2: "payloadError",
  3: "valueError",
};

// More uplink types only available when using Quandify platform API
var responseTypes = {
  0: "none",
  1: "statusReport",
  2: "hardwareReport",
  4: "settingsReport",
};

/* Smaller water leakages only availble when using Quandify platform API
as it requires cloud analytics */
var leakStates = {
  3: "medium",
  4: "large",
};

var pipeTypes = {
  0: "Custom",
  1: "Copper 15 mm",
  2: "Copper 18 mm",
  3: "Copper 22 mm",
  4: "Chrome 15 mm",
  5: "Chrome 18 mm",
  6: "Chrome 22 mm",
  7: "Pal 16 mm",
  8: "Pal 20 mm",
  9: "Pal 25 mm",
  14: "Pex 16 mm",
  15: "Pex 20 mm",
  16: "Pex 25 mm",
  17: "Distpipe",
};

/**
 * @typedef {Object} InputType
 * @property {number} fPort - The port number.
 * @property {number[]} bytes - An array of byte values.
 */

/**
 * 4.1 Uplink Decode
 * The 'decodeUplink' function takes a message object and returns a parsed data object.
 * @param {InputType} input - The input object containing fPort and bytes.
 */
function decodeUplink(input) {
  var decoded = {};
  var errors = [];
  var warnings = [];

  try {
    switch (input.fPort) {
      case 1: // Status report
        var statusReport = statusReportDecoder(input.bytes);
        decoded = statusReport.decoded;
        warnings = statusReport.warnings;
        break;
      case 6: // Response
        var responseReport = responseDecoder(input.bytes);
        decoded = responseReport.decoded;
        warnings = responseReport.warnings;
        break;
    }
  } catch (err) {
    // Something went terribly wrong
    errors.push(err.message);
  }

  return {
    data: {
      fPort: input.fPort,
      length: input.bytes.length,
      hexBytes: decArrayToStr(input.bytes),
      type: uplinkTypes[input.fPort],
      decoded: decoded,
    },
    errors: errors,
    warnings: warnings,
  };
}

var statusReportDecoder = function (data) {
  if (data.length != 28) {
    throw new Error(
      "Wrong payload length (" + data.length + "), should be 28 bytes"
    );
  }

  var warnings = [];
  var error = readUInt16LE(data, 4);

  // The is sensing value is a bit flag of the error field
  var isSensing = !(error & 0x8000);
  var errorCode = error & 0x7fff;

  var decoded = {
    errorCode: errorCode, // current error code
    isSensing: isSensing, // is the ultrasonic sensor sensing water
    totalVolume: readUInt32LE(data, 6), // All-time aggregated water usage in litres
    leakState: data[22], // current water leakage state
    batteryActive: decodeBatteryLevel(data[23]), // battery mV active
    batteryRecovered: decodeBatteryLevel(data[24]), // battery mV recovered
    waterTemperatureMin: decodeTemperature(data[25]), // min water temperature since last statusReport
    waterTemperatureMax: decodeTemperature(data[26]), // max water temperature since last statusReport
    ambientTemperature: decodeTemperature(data[27]), // current ambient temperature
  };

  // Warnings
  if (decoded.isSensing === false) {
    warnings.push("Not sensing water");
  }

  if (decoded.errorCode) {
    warnings.push(parseErrorCode(decoded.errorCode));
  }

  if (isLowBattery(decoded.batteryRecovered)) {
    warnings.push("Low battery");
  }

  return {
    decoded: decoded,
    warnings: warnings,
  };
};

var responseDecoder = function (data) {
  var status = responseStatuses[data[1]];
  if (status === undefined) {
    throw new Error("Invalid response status: " + data[1]);
  }

  var type = responseTypes[data[2]];
  if (type === undefined) {
    throw new Error("Invalid response type: " + data[2]);
  }

  var payload = data.slice(3);

  var response = {
    decoded: {},
    warnings: [],
  };

  switch (type) {
    case "statusReport":
      response = statusReportDecoder(payload);
      break;
    case "hardwareReport":
      response = hardwareReportDecoder(payload);
      break;
    case "settingsReport":
      response = settingsReportDecoder(payload);
      break;
  }

  return {
    decoded: {
      fPort: data[0],
      status: status,
      type: type,
      data: response.decoded,
    },
    warnings: response.warnings,
  };
};

var hardwareReportDecoder = function (data) {
  if (data.length != 35) {
    throw new Error(
      "Wrong payload length (" + data.length + "), should be 35 bytes"
    );
  }

  var appState = appStates[data[5]];
  if (appState === undefined) {
    throw new Error("Invalid app state (" + data[5] + ")");
  }

  var pipeType = pipeTypes[data[28]];
  if (pipeType === undefined) {
    throw new Error("Invalid pipe index (" + data[28] + ")");
  }

  var firmwareVersion = intToSemver(readUInt32LE(data, 0));

  return {
    decoded: {
      firmwareVersion: firmwareVersion,
      hardwareVersion: data[4],
      appState: appState,
      pipe: {
        id: data[28],
        type: pipeType,
      },
    },
    warnings: [],
  };
};

var settingsReportDecoder = function (data) {
  if (data.length != 38) {
    throw new Error(
      "Wrong payload length (" + data.length + "), should be 38 bytes"
    );
  }

  return {
    decoded: {
      lorawanReportInterval: readUInt32LE(data, 5),
    },
    warnings: [],
  };
};

var decodeBatteryLevel = function (input) {
  return 1800 + (input << 3); // convert to milliVolt
};

var decodeTemperature = function (input) {
  return parseFloat(input) * 0.5 - 20.0; // to °C
};

var isLowBattery = function (batteryRecovered) {
  return batteryRecovered <= 3100;
};

var parseErrorCode = function (errorCode) {
  switch (errorCode) {
    case 384:
      return "Reverse flow";
    default:
      return "Contact support, error " + errorCode;
  }
};

var decArrayToStr = function (byteArray) {
  var hexStr = "";
  for (var i = 0; i < byteArray.length; i++) {
    var hex = ("0" + (byteArray[i] & 0xff).toString(16))
      .slice(-2)
      .toUpperCase();
    hexStr += hex;
  }
  return hexStr;
};

var intToSemver = function (version) {
  var major = (version >> 24) & 0xff;
  var minor = (version >> 16) & 0xff;
  var patch = version & 0xffff;
  return major + "." + minor + "." + patch;
};

function readUInt16LE(bytes, pos) {
  var value = bytes[pos] + (bytes[pos + 1] << 8);
  return value & 0xffff;
}

function readUInt32LE(bytes, pos) {
  var value =
    bytes[pos] +
    (bytes[pos + 1] << 8) +
    (bytes[pos + 2] << 16) +
    (bytes[pos + 3] << 24);
  return value & 0xffffffff;
}

exports.decodeUplink = decodeUplink;
