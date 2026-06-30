function decodeUplink(input) {
  var result = {
    data: {},
    errors: [],
    warnings: []
  };
  try {
    result.data = InbiotDeviceDecodeUplink(input.bytes);
  } catch (e) {
    result.errors.push(e.message);
  }
  return result;
}

function encodeDownlink(input) {
  var result = {
    bytes: [],
    fPort: 1,
    errors: [],
    warnings: []
  };
  try {
    result.bytes = InbiotDeviceDecodeDownlink(input);
  } catch (e) {
    result.errors.push(e.message);
  }
  return result;
}

function decodeDownlink(input) {
  var result = {
    data: {},
    errors: [],
    warnings: []
  };
  try {
    result.data.bytes = input.bytes;
  } catch (e) {
    result.errors.push(e.message);
  }
  return result;
}


function InbiotDeviceDecodeUplink(bytes) {
  var decoded = {};
  switch (bytes[0]) {
    case 0:
      // TIME TO SEND
      decoded.timeToSend = bytes[1];
      // VENTILATION TYPE
      decoded.ventilation = bytes[2];
      // LED CONFIGURATION
      decoded.ledStatus = !!bytes[3];
      // USE WIFI INSTEAD
      decoded.useWifi = !!bytes[4];
      // LORAWAN REGION
      decoded.lorawanRegion = getLoRaWANRegion(bytes[5]);
      // LORAWAN CHANNELMASK
      decoded.lorawanChannelMask = bytes[6];
      // LED CONFIGURATION
      decoded.ledConfiguration = bytes[7];
      // TOUCH ENABLE
      decoded.touchEnable = !!bytes[8];
      break;
    case 1:
      // MICA TYPE
      decoded.type = customTextDecoder(bytes, 27, 31);
      if (decoded.type === "\u0000\u0000\u0000\u0000") {
        decoded.type = "NULL";
      }
      var typeProperties = {
        MINI: true,
        MICA: true,
        PLUS: true,
        WELL: true,
        NULL: true,
      };
      if (typeProperties[decoded.type]) {
        // TEMPERATURE
        decoded.temperature = getUint16(bytes, 1, 2) / 10.0;
        // HUMIDITY
        decoded.humidity = getUint16(bytes, 3, 4) / 10.0;
        // CO2
        decoded.co2 = getUint16(bytes, 5, 6);

        if (decoded.type !== "MINI") {
          // TVOC
          decoded.tvoc = getUint16(bytes, 9, 10);
          // PM2.5
          decoded.pm2_5 = getUint16(bytes, 13, 14);
          // PM10
          decoded.pm10 = getUint16(bytes, 17, 18);
        }
        if (["PLUS", "WELL", "NULL"].indexOf(decoded.type) > -1) {
          // CH2O
          decoded.ch2o = getUint16(bytes, 7, 8);
          if (decoded.ch2o === 0xffff) {
            decoded.ch2o = "Preheating";
          }
          // PM1.0
          decoded.pm1_0 = getUint16(bytes, 11, 12);
          // PM4
          decoded.pm4 = getUint16(bytes, 15, 16);
        }
        if (["WELL", "NULL"].indexOf(decoded.type) > -1) {
          // O3
          decoded.o3 = getUint16(bytes, 19, 20);
          if (decoded.o3 === 0xffff) {
            decoded.o3 = "Preheating";
          }
          // NO2
          decoded.no2 = getUint16(bytes, 21, 22);
          if (decoded.no2 === 0xffff) {
            decoded.no2 = "Preheating";
          }
          // CO
          decoded.co = getUint16(bytes, 23, 24);
          if (decoded.co !== 0xffff) {
            decoded.co /= 10.0;
          } else {
            decoded.co = "Preheating";
          }
        }
        // VENTILATION INDEX
        decoded.vIndex = bytes[32];
        // THERMAL INDEX
        decoded.tIndex = bytes[33];
        // VIRUS INDEX
        decoded.virusIndex = bytes[34];
        // IAQ INDEX
        decoded.iaqIndex = bytes[35];
        // MOLD PERSISTENCE INDEX
        decoded.moldIndex = bytes[36];
        if (decoded.moldIndex === 0xff) {
          decoded.moldIndex = "Calculating";
        }
        // NOISE
        if (bytes[37]) {
          decoded.dB = bytes[37] === 0xff ? "Preheating" : bytes[37];
        }
        // MESSAGE COUNTER
        decoded.counter = getUint16(bytes, 25, 26);
      }
      break;
    case 2:
      // FIRMWARE VERSION
      decoded.fwVersion = getVersion(bytes, 1);
      // MODEL
      decoded.model = customTextDecoder(bytes, 4, 21);
      // MICA TYPE
      decoded.micaType = customTextDecoder(bytes, 21, 30);
      // MAC ADDRESS
      decoded.mac = getMac(bytes, 30);
      // RESET REASON
      decoded.resetReason = getResetReason(bytes[42]);

      // ----- ONLY MODBUS CONFIGURATION -----

      // MODBUS ADDRESS
      decoded.modbusAddress = bytes[36];
      // MODBUS PARITY
      decoded.modbusParity = bytes[37];
      // MODBUS BAUD RATE
      decoded.modbusBaudRate = getUint32(bytes, 38);
      break;
    default:
  }
  return decoded;
}

function InbiotDeviceDecodeDownlink(payload) {
  var encoded = [];

  if ("ledStatus" in payload) {
    encoded = encoded.concat(setLedEnable(payload.ledStatus));
  }
  if ("timeToSend" in payload) {
    encoded = encoded.concat(setSendPeriodicity(payload.timeToSend));
  }
  if ("ventilation" in payload) {
    encoded = encoded.concat(setCo2Calibration(payload.ventilation));
  }
  if ("ledConfiguration" in payload) {
    encoded = encoded.concat(setLedConfiguration(payload.ledConfiguration));
  }
  if ("touchEnable" in payload) {
    encoded = encoded.concat(setTouchEnable(payload.touchEnable));
  }
  if ("ADREnable" in payload) {
    encoded = encoded.concat(setADREnable(payload.ADREnable));
  }
  if ("DR" in payload) {
    encoded = encoded.concat(setDR(payload.DR));
  }
  if ("sendRetransmissions" in payload) {
    encoded = encoded.concat(
      setSendRetransmissions(payload.sendRetransmissions),
    );
  }
  if ("TXPower" in payload) {
    encoded = encoded.concat(setTXPower(payload.TXPower));
  }
  if ("confirmationEnable" in payload) {
    encoded = encoded.concat(setConfirmationEnable(payload.confirmationEnable));
  }
  if ("resetDevice" in payload) {
    encoded = encoded.concat(setResetDevice(payload.resetDevice));
  }
  return encoded;
}

function customTextDecoder(bytes, start, end) {
  var result = "";
  for (var i = start; i < end; i++) {
    if (bytes[i] === 0x00) {
      break;
    }
    result += String.fromCharCode(bytes[i]);
  }
  return result;
}

function getUint16(bytes, first, second) {
  return (bytes[first] << 8) | bytes[second];
}

function getUint32(bytes, start) {
  return (
    (bytes[start] << 24) |
    (bytes[start + 1] << 16) |
    (bytes[start + 2] << 8) |
    bytes[start + 3]
  );
}
function padStartCustom(text, targetLength, padChar) {
  text = String(text);
  while (text.length < targetLength) {
    text = padChar + text;
  }
  return text;
}

function getMac(bytes, start) {
  var macBytes = bytes.slice(start, start + 6);
  var macString = "";
  for (var i = 0; i < macBytes.length; i++) {
    var hex = padStartCustom(macBytes[i].toString(16), 2, "0");
    macString += hex;
    if (i < macBytes.length - 1) {
      macString += ":";
    }
  }
  return macString.toUpperCase();
}

function getVersion(bytes, start) {
  if (bytes[start + 1] !== 0x2e) {
    var minor = bytes[start + 2];
    return bytes[start] + "." + minor;
  } else {
    return customTextDecoder(bytes, start, 4);
  }
}

function getLoRaWANRegion(region) {
  var regions = {
    0: "AS923",
    10: "AS923-JP",
    1: "AU915",
    2: "CN470",
    3: "CN779",
    4: "EU433",
    5: "EU868",
    6: "KR920",
    7: "IN865",
    8: "US915",
    9: "RU864",
  };
  return regions[region] || "UNKNOWN";
}

function getResetReason(reason) {
  var reasons = {
    0: "0 Reset reason cannot be determined",
    1: "1 Reset due to power-on event",
    2: "2 Reset by external pin",
    3: "3 Software reset via esp_restart",
    4: "4 Software reset due to exception/panic",
    5: "5 Reset due to interrupt watchdog",
    6: "6 Reset due to task watchdog",
    7: "7 Reset due to other watchdogs",
    8: "8 Reset after exiting deep sleep mode",
    9: "9 Brownout reset",
    10: "10 Reset over SDIO",
  };
  return reasons[reason] || "UNKNOWN (" + reason + ")";
}

/**
 *
 * @param {number} ledStatus value: (true/false)
 * @description This function encodes the ledStatus value into a byte array.
 * * Possible values:
 * * * true: LED enabled
 * * * false: LED disabled
 * @example { "ledStatus": true }
 */
function setLedEnable(ledStatus) {
  if (typeof ledStatus !== "boolean") {
    throw new Error("ledStatus must be a boolean value.");
  }
  return [0x01, 0x01, ledStatus ? 0x01 : 0x00];
}

/**
 *
 * @param {number} timeToSend value: (5-60)
 * @description This function encodes the timeToSend value into a byte array.
 * * Possible values:
 * * * 0: Default periodicity (every 15 minutes)
 * * * 5 - 60: Custom periodicity in minutes
 * @example { "timeToSend": 0 }
 */
function setSendPeriodicity(timeToSend) {
  if (typeof timeToSend !== "number" || timeToSend < 0 || timeToSend > 60) {
    throw new Error("timeToSend must be a number between 5 and 60.");
  }
  if (timeToSend === 0) {
    return [0x02, 0x01, 0xf];
  } else if (timeToSend < 5) {
    return [0x02, 0x01, 0x05];
  } else {
    return [0x02, 0x01, timeToSend];
  }
}

/**
 * Function to encode co2Calibration
 * @param {number} ventilation value: (1-5)
 * @description This function encodes the co2Calibration value into a byte array.
 * * Possible values:
 * * 1: Calibration every 48 hours
 * * 2: Calibration every 24 hours
 * * 3: Calibration every 7 days
 * * 4: Calibration every 15 days
 * * 5: No calibration
 * @example { "ventilation": 1 }
 */
function setCo2Calibration(ventilation) {
  if (typeof ventilation !== "number" || ventilation < 1 || ventilation > 5) {
    throw new Error("ventilation must be a number between 1 and 5.");
  }
  return [0x03, 0x01, ventilation];
}

/**
 *
 * @param {number} ledConfiguration value: (0-15)
 * @description This function encodes the ledConfiguration value into a byte array.
 * * Possible values:
 * * * 0: Ventilation indicator (default configuration)
 * * * 1: Confort indicator
 * * * 2: Temperature indicator
 * * * 3: Humidity indicator
 * * * 4: CO2 indicator
 * * * 5: VOCS indicator
 * * * 6: PM2.5 indicator
 * * * 7: PM10 indicator
 * * * 8: Virus indicator
 * * * 9: IAQ indicator
 * * * 10: PM1.0 indicator
 * * * 11: PM4 indicator
 * * * 12: CH2O indicator
 * * * 13: O3 indicator
 * * * 14: NO2 indicator
 * * * 15: CO indicator
 * * * 16: Mold Persistence Indicator
 * @example { "ledConfiguration": 0 }
 */
function setLedConfiguration(ledConfiguration) {
  if (
    typeof ledConfiguration !== "number" ||
    ledConfiguration < 0 ||
    ledConfiguration > 16
  ) {
    throw new Error("ledConfiguration must be a number between 0 and 16.");
  }
  return [0x04, 0x01, ledConfiguration];
}

/**
 *
 * @param {number} touchEnable value: (true/false)
 * @description This function encodes the touchEnable value into a byte array.
 * * * Possible values:
 * * * true: Touch enabled
 * * * false: Touch disabled
 * @example { "touchEnable": true }
 */
function setTouchEnable(touchEnable) {
  if (typeof touchEnable !== "boolean") {
    throw new Error("touchEnable must be a boolean value.");
  }
  return [0x05, 0x01, touchEnable ? 0x01 : 0x00];
}

/**
 *
 * @param {number} ADREnable value: (true/false)
 * @description This function encodes the ADREnable value into a byte array.
 * * Possible values:
 * * true: ADR enabled
 * * false: ADR disabled
 * @example { "ADREnable": true }
 */
function setADREnable(ADREnable) {
  if (typeof ADREnable !== "boolean") {
    throw new Error("ADREnable must be a boolean value.");
  }
  return [0x09, 0x01, ADREnable ? 0x01 : 0x00];
}

/**
 *
 * @param {number} DR value: (0-7)
 * @description This function encodes the DR value into a byte array.
 * * Possible values:
 * * 0: DR0 = SF12
 * * 1: DR1 = SF11
 * * 2: DR2 = SF10
 * * 3: DR3 = SF9
 * * 4: DR4 = SF8
 * * 5: DR5 = SF7 (default)
 * * 6: DR6 = SF7 (250 kHz)
 * * 7: DR7 = FSK
 * @example { "DR": 0 }
 */
function setDR(DR) {
  if (typeof DR !== "number" || DR < 0 || DR > 5) {
    throw new Error("DR must be a number between 0 and 5.");
  }
  return [0x0a, 0x01, DR];
}

/**
 *
 * @param {number} sendRetransmissions value: (0-15)
 * @description This function encodes the sendRetransmissions value into a byte array.
 * * Possible values:
 * * 0 - 15: Number of retransmissions (0 = no retransmissions, 1-15 = number of retransmissions)
 * * 5: Default value
 * @example { "sendRetransmissions": 5 }
 */
function setSendRetransmissions(sendRetransmissions) {
  if (
    typeof sendRetransmissions !== "number" ||
    sendRetransmissions < 0 ||
    sendRetransmissions > 15
  ) {
    throw new Error("sendRetransmissions must be a number between 0 and 15.");
  }
  return [0x0b, 0x01, sendRetransmissions];
}

/**
 *
 * @param {number} TXPower value: (0-15)
 * @description This function encodes the TXPower value into a byte array.
 * * Possible values:
 * * 0: Max EIRP (default)
 * * 1: Max EIRP - 2 dB
 * * 2: Max EIRP - 4 dB
 * * 3: Max EIRP - 6 dB
 * * 4: Max EIRP - 8 dB
 * * 5: Max EIRP - 10 dB
 * * 6: Max EIRP - 12 dB
 * * 7: Max EIRP - 14 dB
 * * 8 - 14 : Reserved for future use
 * * 15 : Defined in [TS001] Error! Invalid value.
 * @example { "TXPower": 5 }
 */
function setTXPower(TXPower) {
  if (typeof TXPower !== "number" || TXPower < 0 || TXPower > 15) {
    throw new Error("TXPower must be a number between 0 and 15.");
  }
  return [0x0c, 0x01, TXPower];
}

/**
 *
 * @param {number} confirmationEnable value: (true/false)
 * @description This function encodes the confirmationEnable value into a byte array.
 * * Possible values:
 * * true: Confirmation enabled
 * * false: Confirmation disabled
 * @example { "confirmationEnable": true }
 */
function setConfirmationEnable(confirmationEnable) {
  if (typeof confirmationEnable !== "boolean") {
    throw new Error("confirmationEnable must be a boolean value.");
  }
  return [0x0d, 0x01, confirmationEnable ? 0x01 : 0x00];
}

/**
 *
 * @param {number} resetDevice value: (true/false)
 * @description This function encodes the resetDevice value into a byte array.
 * * Possible values:
 * * true: Reset device
 * * false: Do not reset device
 * @example { "resetDevice": true }
 */
function setResetDevice(resetDevice) {
  if (typeof resetDevice !== "boolean") {
    throw new Error("resetDevice must be a boolean value.");
  }
  return [0x0f, 0x01, resetDevice ? 0x01 : 0x00];
}


if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    decodeUplink: decodeUplink,
    encodeDownlink: encodeDownlink,
    decodeDownlink: decodeDownlink
  };
}
