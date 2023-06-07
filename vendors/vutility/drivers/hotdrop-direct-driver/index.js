/**
 * @typedef {Object} DecodedUplink
 * @property {HotDropDirectData} data - The open JavaScript object representing the decoded uplink payload when no errors occurred
 * @property {string[]} errors - A list of error messages while decoding the uplink payload
 * @property {string[]} warnings - A list of warning messages that do not prevent the driver from decoding the uplink payload
 */

/**
 * Decode uplink
 * @param {Object} input - An object provided by the IoT Flow framework
 * @param {number[]} input.bytes - Array of bytes represented as numbers as it has been sent from the device
 * @param {number} input.fPort - The Port Field on which the uplink has been sent
 * @param {Date} input.recvTime - The uplink message time recorded by the LoRaWAN network server
 * @returns {DecodedUplink} The decoded object
 */
function decodeUplink(input) {
  let result = {
    data: {},
    errors: [],
    warnings: [],
  };
  const raw = Buffer.from(input.bytes);

  // Uplink payload must be 11 bytes long.
  if (raw.byteLength != 11) {
    result.errors.push("Payload length must be 11 bytes");
    delete result.data;
    return result;
  }

  // Packet ID - 1 byte
  const packetId = raw[0];
  if (packetId !== 50) {
    result.errors.push("Payload packet ID is not equal to 50");
    delete result.data;
    return result;
  }

  // Constant factors for formulas
  const capacitorVoltageFactor = 5.0 / 255.0;
  const temperatureCelsiusFactor = 120.0 / 255.0;
  const deciToUnitFactor = 0.1;

  // Amp hour accumulation - 4 bytes
  // 32-bit unsigned integer in network byte order (MSB/BE) reported in deci-ampere-hour (dAh)
  const ampHourAccumulationDeciAmpere = raw.readUInt32BE(1);

  // Average amps - 2 bytes
  // 16-bit unsigned integer in network byte order (MSB/BE) reported in deci-ampere (dA),
  // this average represents the entire time since the last transmit (one entire transmit period)
  const averageAmpsDeciAmpere = raw.readUInt16BE(5);

  // Max Offset - 1 byte
  // 8-bit unsigned integer representing the percent offset above the Average amps value.
  const maxOffset = raw[7];

  // Min Offset - 1 byte
  // 8-bit unsigned integer representing the percent offset below the Average amps value.
  const minOffset = raw[8];

  // Capacitor Voltage Scalar - 1 byte
  // 8-bit unsigned integer representing the capacitor voltage.
  // (as if the integer range from 0-255 is scaled to between 0.0V and 5.0V)
  const capacitorVoltageScalar = raw[9];

  // Temperature Scalar
  // 8-bit unsigned integer representing the temperature.
  // (as if the integer range from 0-255 is scaled to between -40C and 80C)
  const temperatureScalar = raw[10];

  // Calculated fields
  const maximumAmpsDeciAmpere =
    averageAmpsDeciAmpere * ((100 + maxOffset) / 100.0);
  const minimumAmpsDeciAmpere =
    averageAmpsDeciAmpere * ((100 - minOffset) / 100.0);
  const capacitorVoltage = capacitorVoltageFactor * capacitorVoltageScalar;
  const temperatureCelsius = temperatureCelsiusFactor * temperatureScalar - 40;

  if (minimumAmpsDeciAmpere < 0) {
    result.warnings.push("Minimum amps is less than 0.");
  }
  if (capacitorVoltage < 3.4) {
    result.warnings.push("Low capacitor voltage may reduce transmit interval.");
  }

  result.data = {
    ampHourAccumulation: ampHourAccumulationDeciAmpere * deciToUnitFactor,
    averageAmps: averageAmpsDeciAmpere * deciToUnitFactor,
    maximumAmps: maximumAmpsDeciAmpere * deciToUnitFactor,
    minimumAmps: minimumAmpsDeciAmpere * deciToUnitFactor,
    capacitorVoltage: capacitorVoltage,
    temperatureCelsius: temperatureCelsius,
  };

  return result;
}

/**
 * @typedef {Object} EncodedDownlink
 * @property {number[]} bytes - Array of bytes represented as numbers as it will be sent to the device
 * @property {number} fPort - The Port Field on which the downlink must be sent
 * @property {string[]} errors - A list of error messages while encoding the downlink object
 * @property {string[]} warnings - A list of warning messages that do not prevent the driver from encoding the downlink object
 */

/**
 * Downlink encode
 * @param {Object} input - An object provided by the IoT Flow framework
 * @param {Object} input.data - The higher-level object representing your downlink
 * @returns {EncodedDownlink} The encoded object
 */
function encodeDownlink(input) {
  let result = {
    bytes: [],
    errors: [],
    warnings: [],
  };

  let definedDownlinkVars = 0;
  if (typeof input.data.transmitIntervalSeconds !== "undefined") {
    definedDownlinkVars += 1;
  }
  if (typeof input.data.measurementIntervalMs !== "undefined") {
    definedDownlinkVars += 1;
  }
  if (typeof input.data.lowPowerThreshold !== "undefined") {
    definedDownlinkVars += 1;
  }
  if (typeof input.data.factoryReset !== "undefined") {
    definedDownlinkVars += 1;
  }

  if (definedDownlinkVars > 1) {
    result.errors.push("Invalid downlink: More than one downlink type defined");
    delete result.bytes;
    return result;
  }

  if (typeof input.data.transmitIntervalSeconds !== "undefined") {
    if (input.data.transmitIntervalSeconds < 60) {
      result.errors.push(
        "Invalid downlink: transmit interval cannot be less than 1 min"
      );
      delete result.bytes;
      return result;
    }
    if (input.data.transmitIntervalSeconds > 1800) {
      result.errors.push(
        "Invalid downlink: transmit interval cannot be greater than 30 min"
      );
      delete result.bytes;
      return result;
    }
    var downlink = Buffer.alloc(10);
    downlink.writeUInt16LE(0x0054, 0);
    downlink.writeFloatLE(input.data.transmitIntervalSeconds, 2);
    downlink.writeFloatLE(0, 6);
    result.bytes = Array.from(new Uint8Array(downlink.buffer));
    result.fPort = 3;
    return result;
  }

  if (typeof input.data.measurementIntervalMs !== "undefined") {
    if (input.data.measurementIntervalMs < 200) {
      result.errors.push(
        "Invalid downlink: measurement interval cannot be less than 200 ms"
      );
      delete result.bytes;
      return result;
    }
    if (input.data.measurementIntervalMs > 10000) {
      result.errors.push(
        "Invalid downlink: measurement interval cannot be greater than 10000 ms"
      );
      delete result.bytes;
      return result;
    }

    var downlink = Buffer.alloc(10);
    downlink.writeUInt16LE(0x004d, 0);
    downlink.writeFloatLE(input.data.measurementIntervalMs, 2);
    downlink.writeFloatLE(0, 6);
    result.bytes = Array.from(new Uint8Array(downlink.buffer));
    result.fPort = 3;
    return result;
  }

  if (typeof input.data.lowPowerThreshold !== "undefined") {
    var lowPowerTolerance = 0.000001;
    // Have leniant lower tolerance due to floating point
    if (input.data.lowPowerThreshold + lowPowerTolerance < 1.8) {
      result.errors.push(
        "Invalid downlink: low power threshold cannot be less than 1.8 v"
      );
      delete result.bytes;
      return result;
    }
    // Have leniant upper tolerance due to floating point
    if (input.data.lowPowerThreshold - lowPowerTolerance > 3.9) {
      result.errors.push(
        "Invalid downlink: low power threshold cannot be greater than 3.9 v"
      );
      delete result.bytes;
      return result;
    }

    var downlink = Buffer.alloc(10);
    downlink.writeUInt16LE(0x0050, 0);
    downlink.writeFloatLE(input.data.lowPowerThreshold, 2);
    downlink.writeFloatLE(0, 6);
    result.bytes = Array.from(new Uint8Array(downlink.buffer));
    result.fPort = 3;
    return result;
  }

  if (typeof input.data.factoryReset !== "undefined") {
    if (input.data.factoryReset === true) {
      result.bytes = [
        0x5a, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      ];
      result.fPort = 3;
      return result;
    } else {
      result.errors.push("Invalid downlink: valid factoryReset value is true");
      delete result.bytes;
      return result;
    }
  }

  result.errors.push("Invalid downlink: invalid downlink parameter name");
  delete result.bytes;
  return result;
}

/**
 * @typedef {Object} DecodedDownlink
 * @property {Object} data - The open JavaScript object representing the decoded downlink payload when no errors occurred
 * @property {string[]} errors - A list of error messages while decoding the downlink payload
 * @property {string[]} warnings - A list of warning messages that do not prevent the driver from decoding the downlink payload
 */

/**
 * Downlink decode
 * @param {Object} input - An object provided by the IoT Flow framework
 * @param {number[]} input.bytes - Array of bytes represented as numbers as it will be sent to the device
 * @param {number} input.fPort - The Port Field on which the downlink must be sent
 * @param {Date} input.recvTime - The uplink message time computed by the IoT Flow framework
 * @returns {DecodedDownlink} The decoded object
 */
function decodeDownlink(input) {
  let result = {
    data: {},
    errors: [],
    warnings: [],
  };

  var raw = Buffer.from(input.bytes);

  if (raw.length !== 10) {
    result.errors.push("Invalid downlink: downlink must be 10 bytes");
    delete result.data;
    return result;
  }

  var type = raw.readUInt16LE(0);
  switch (type) {
    case 0x54: // transmit interval
      var transmitIntervalSeconds = raw.readFloatLE(2);
      // Not currently in use for this decoder
      var transmitIntervalVarianceSeconds = raw.readFloatLE(6);
      if (transmitIntervalVarianceSeconds !== 0) {
        result.warnings.push("Warning: Byte index 6-9 are not 0");
      }
      if (transmitIntervalSeconds < 60) {
        result.errors.push(
          "Invalid downlink: transmit interval cannot be less than 1 min"
        );
        delete result.data;
        return result;
      }
      if (transmitIntervalSeconds > 1800) {
        result.errors.push(
          "Invalid downlink: transmit interval cannot be greater than 30 min"
        );
        delete result.bytes;
        return result;
      }
      result.data.transmitIntervalSeconds = transmitIntervalSeconds;
      break;
    case 0x4d: // measurement interval
      var measurementIntervalMs = raw.readFloatLE(2);
      var reserved = raw.readFloatLE(6);
      if (reserved !== 0) {
        result.warnings.push(
          "Warning: Measurement interval reserved bytes are not equal to 0"
        );
      }
      if (measurementIntervalMs < 200) {
        result.errors.push(
          "Invalid downlink: measurement interval cannot be less than 200 ms"
        );
        delete result.bytes;
        return result;
      }
      if (measurementIntervalMs > 10000) {
        result.errors.push(
          "Invalid downlink: measurement interval cannot be greater than 10000 ms"
        );
        delete result.bytes;
        return result;
      }
      result.data.measurementIntervalMs = measurementIntervalMs;
      break;
    case 0x50: // low power threshold
      var lowPowerTolerance = 0.000001;
      var lowPowerThreshold = raw.readFloatLE(2);
      var reserved = raw.readFloatLE(6);
      if (reserved !== 0) {
        result.warnings.push(
          "Warning: Low power threshold reserved bytes are not equal to 0"
        );
      }
      // Have leniant lower tolerance due to floating point
      if (lowPowerThreshold + lowPowerTolerance < 1.8) {
        result.errors.push(
          "Invalid downlink: low power threshold cannot be less than 1.8 v"
        );
        delete result.bytes;
        return result;
      }
      // Have leniant upper tolerance due to floating point
      if (lowPowerThreshold - lowPowerTolerance > 3.9) {
        result.errors.push(
          "Invalid downlink: low power threshold cannot be greater than 3.9 v"
        );
        delete result.bytes;
        return result;
      }
      result.data.lowPowerThreshold = lowPowerThreshold;
      break;
    case 0x5a: // factory reset
      if (
        raw[2] !== 0 ||
        raw[3] !== 0 ||
        raw[4] !== 0 ||
        raw[5] !== 0 ||
        raw[6] !== 0 ||
        raw[7] !== 0 ||
        raw[8] !== 0 ||
        raw[9] !== 0
      ) {
        result.errors.push(
          "Invalid downlink: Factory reset reserved bytes are not equal to 0"
        );
        delete result.data;
        return result;
      }
      result.data.factoryReset = true;
      break;
    default:
      result.errors.push("Invalid downlink: unknown downlink type");
      delete result.data;
      return result;
  }
  return result;
}

exports.decodeUplink = decodeUplink;
exports.encodeDownlink = encodeDownlink;
exports.decodeDownlink = decodeDownlink;
