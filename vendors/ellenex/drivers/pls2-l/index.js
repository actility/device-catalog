/* Uplink decoder for PLS2-L */
function decodeUplink(input) {
    var result = {};
    if (input.bytes.length != 8) {
        throw new Error("Invalid uplink payload: length is not 8 bytes");
    }
    result.level = readHex2bytes(input.bytes[3], input.bytes[4]);
    result.battery = +(input.bytes[7] * 0.1).toFixed(1);
    return result;
}

/*
 * The readHex2bytes function is to decode a signed 16-bit integer
 * represented by 2 bytes.  
 */
function readHex2bytes(byte1, byte2) {
  var result = (byte1 << 8) | byte2;  // merge the two bytes
  // check whether input is signed as a negative number
  // by checking whether significant bit (leftmost) is 1
  var negative = byte1 & 0x80;
  // process negative value
  if (negative) {
    result = -(0x10000 - result);
  }
  return result;
}

/* Downlink encoder for PLS2-L */
function encodeDownlink(input) {
    var result = {};
    var bytes = [];
    switch (input.command) {
    /* Command 1: Change sampling rate */
    case 1:
      bytes = changeSamplingRate(input);
      break;
    /* Command 2: Enable/Disable confirmation */
    case 2:
      bytes = confirmation(input);
      break;
    /* Command 3: Reset device */
    case 3:
      bytes = resetDevice(input);
      break;
    /* Command 4: Change periodic auto-reset settings */
    case 4:
      bytes = autoResetDevice(input);
      break;
    default:
      throw new Error('Unknown command: please use command 1-4, command ' + input.command + ' was used');        
    }
    result.bytes = bytes;
    result.fPort = 5;
    return result;
}

/*
 * Command 1
 * The changeSamplingRate function encodes the JSON data
 * to a 4 bytes array downlink messsage that changes device
 * sampling rate.
 */
function changeSamplingRate(data) {
  if (typeof data.unit !== 'string') {
    throw new Error("Missing required field or invalid input: unit");
  }
  if (typeof data.time !== 'number') {
    throw new Error("Missing required field or invalid input: time");
  }

  var bytes = [0x10];
  var unit = data.unit;
  var time = data.time;
  // Add time unit
  if (unit == "second") {
    bytes.push(0x00);
  } else if (unit == "minute") {
    bytes.push(0x01);
  } else {
    throw new Error("Invalid time unit: must be either \"minute\" or \"second\"");
  }

  // Add length of time with a minimum sleep period is 60 seconds
  if ((unit == "second" && time < 60) || (unit == "minute" && time < 1)) {
    throw new Error("Invalid sampling interval: minimum is 60 seconds (i.e. 1 minute)");
  } 
  return bytes.concat(decimalToHexBytes(time));
}

/*
 * Command 2
 * The confirmation function encodes the JSON data
 * to a 2 bytes array downlink messsage that enable/disable
 * confirmation.
 */
function confirmation(data) {
  if (typeof data.confirmation !== 'boolean') {
    throw new Error("Missing required field or invalid input: confirmation");
  }

  if (data.confirmation) {
    return [0x07, 0x01];
  } else {
    return [0x07, 0x00];
  }
}

/*
 * Command 3
 * The resetDevice function encodes the JSON data
 * to a 2 bytes array downlink messsage that resets
 * the device.
 */
function resetDevice(data) {
  if (typeof data.reset !== 'boolean' || !data.reset) {
    throw new Error("Missing required field or invalid input: reset");
  }

  if (data.reset) {
    return [0xFF, 0x00];
  }
}

/*
 * Command 4
 * The resetDevice function encodes the JSON data
 * to a 3 bytes array downlink messsage that changes
 * periodic auto-reset settings of device.
 */
function autoResetDevice(data) {
  if (typeof data.count !== 'number') {
    throw new Error("Missing required field or invalid input: count");
  }
  // 
  return [0x16].concat(decimalToHexBytes(data.count));
}

/*
 * The decimalToHexBytes converts a decimal number
 * to 2 bytes hex array
 */
function decimalToHexBytes(n) {
  return [n >> 8, n & 0xFF];
}

function extractPoints(input) {
    var result = {};
    if (typeof input.message.level !== "undefined") {
        result.level = input.message.level;
    }
    if (typeof input.message.battery !== "undefined") {
        result.batteryVoltage = input.message.battery;
    }
    return result;
}

exports.decodeUplink = decodeUplink;
exports.encodeDownlink = encodeDownlink;
exports.extractPoints = extractPoints;