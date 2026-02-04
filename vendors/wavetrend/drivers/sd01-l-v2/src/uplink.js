/**
 @file SD01-L Water Temperature Monitor Downlink Payload Formatter for TTN
 @module src/uplink.js
 @author Dave Meehan
 @copyright Wavetrend Europe Ltd
 @see {@link https://www.thethingsindustries.com/docs/integrations/payload-formatters/javascript/}
 @see {@link https://www.youtube.com/watch?v=nT2FnwCoP7w}
 */

/**
 * @typedef {Object} Wavetrend.SD01L.Version
 * @property {number} major
 * @property {number} minor
 */
/**
 * Issued by device when installed to acquire operating configuration
 * @typedef  Wavetrend.SD01L.InstallRequest
 * @property {number} pvd_level - current power voltage detector level (0-7)
 * @property {boolean[]} sensor - sensor detected
 * @property {Wavetrend.SD01L.Version} firmware_version - current firmware version
 * @property {number} reset_reason - Reason for last device reset (manufacturer internal)
 */

/**
 * @typedef {number} Wavetrend.SD01L.InstallationErrorCode
 * @readonly
 * @enum {number}
 * @property {Wavetrend.SD01L.InstallationErrorCode} NONE - 0
 * @property {Wavetrend.SD01L.InstallationErrorCode} SENSOR_DISABLED - 1 - Installed sensor cannot be disabled
 * @property {Wavetrend.SD01L.InstallationErrorCode} SENSOR_MISSING - 2 - Non-installed sensor cannot be configured
 * @property {Wavetrend.SD01L.InstallationErrorCode} DOWNLINK - 3 - Downlink interval out of range
 * @property {Wavetrend.SD01L.InstallationErrorCode} MESSAGE_FLAGS - 4 - Illegal message flags specified
 * @property {Wavetrend.SD01L.InstallationErrorCode} SCALD_THRESHOLD - 5 - Scald threshold out of range
 * @property {Wavetrend.SD01L.InstallationErrorCode} FREEZE_THRESHOLD - 6 - Freeze threshold out of range
 * @property {Wavetrend.SD01L.InstallationErrorCode} REPORT_PERIOD - 7 - Report period out of range
 * @property {Wavetrend.SD01L.InstallationErrorCode} CONFIG_TYPE - 8 - Sensor configuration type invalid
 * @property {Wavetrend.SD01L.InstallationErrorCode} MISC - 9 - Miscellaneous error
 * @property {Wavetrend.SD01L.InstallationErrorCode} DOWNLINK_LATE - 10 - Downlink arrived too late
 * @property {Wavetrend.SD01L.InstallationErrorCode} DOWNLINK_NONCE - 11 - Downlink nonce mismatch
 * @property {Wavetrend.SD01L.InstallationErrorCode} DOWNLINK_DUPLICATE - 12 - Downlink duplicate received
 * @property {Wavetrend.SD01L.InstallationErrorCode} HISTORY_COUNT - 13 - History Count out of range
 *
 */
const SD01L_INSTALLATION_ERROR_CODE = {
  NONE: 0,
  SENSOR_DISABLED: 1,
  SENSOR_MISSING: 2,
  DOWNLINK: 3,
  MESSAGE_FLAGS: 4,
  SCALD_THRESHOLD: 5,
  FREEZE_THRESHOLD: 6,
  REPORT_PERIOD: 7,
  CONFIG_TYPE: 8,
  MISC: 9,
  DOWNLINK_LATE: 10,
  DOWNLINK_NONCE: 11,
  DOWNLINK_DUPLICATE: 12,
  HISTORY_COUNT: 13,
};

/**
 * Issued by device after successfully receiving operating configuration
 * @typedef Wavetrend.SD01L.InstallResponse
 * @property {Wavetrend.SD01L.InstallationErrorCode} error
 */

/**
 * Issued by the device at the standard report interval
 * @typedef Wavetrend.SD01L.StandardReport
 * @property {number} timestamp - seconds since Unix epoch
 * @property {number} sensor_id - which sensor readings are for (0-2)
 * @property {number} minC - degrees C
 * @property {number} maxC - degrees C
 * @property {number} events - count of total events
 * @property {number} reports - count of compliant events * @property {{ sensor: Wavetrend.SD01L.SensorReadings[] }} current
 */

/**
 * Issued by the device if freeze reporting is enabled
 * @typedef Wavetrend.SD01L.FreezeReport
 * @property {number} sensor_id - sensor number (0-2)
 */

/**
 * Issued by the device if freeze reporting is enabled
 * @typedef Wavetrend.SD01L.ScaldReport
 * @property {number} sensor_id - sensor number (0-2)
 */

/**
 * Issued by the device if a sensor error is detected
 * @typedef Wavetrend.SD01L.SensorErrorReport
 * @property {number} sensor_id - sensor number (0-2)
 */

/**
 * Issued by the device if a general device error is detected
 * @typedef  Wavetrend.SD01L.GeneralErrorReport
 * @property {number} error_code - Error code (manufacturer internal)
 * @property {number} file_hash - file identity (manufacturer internal)
 * @property {number} line - source line (manufacturer internal)
 */

/**
 * Each sensors debug data
 * @typedef  Wavetrend.SD01L.SensorDebug
 * @property {number} direction - N/A
 * @property {number} state - detection state
 * @property {number} report - report flag
 * @property {number} tempC - temperature
 */

/**
 * Each sensors debug data
 * @typedef  Wavetrend.SD01L.Debug
 * @property {number} timestamp - seconds since Unix epoch
 * @property {Wavetrend.SD01L.SensorDebug[]} sensors
 */

/**
 * Issued by the device if debug reporting is enabled
 * @typedef  Wavetrend.SD01L.DebugReport
 * @property {number} timestamp - seconds since Unix epoch
 * @property {number} pvd_level - PVD level
 * @property {Wavetrend.SD01L.Debug[]} readings - Sensor Debug Readings
 */

/**
 * @namespace TTN.Uplink
 */

/**
 * Format of data provided to the V3 decoder by TTN
 * @typedef {Object} TTN.Uplink.DecoderInput
 * @property {number[]} bytes - array of received bytes
 * @property {number} fPort - LoRaWAN port number
 */

/**
 * Composite of all SD01L uplink messages
 * @typedef {Wavetrend.SD01L.InstallRequest|Wavetrend.SD01L.InstallResponse|Wavetrend.SD01L.StandardReport|Wavetrend.SD01L.FreezeReport|Wavetrend.SD01L.ScaldReport|Wavetrend.SD01L.SensorErrorReport|Wavetrend.SD01L.GeneralErrorReport|Wavetrend.SD01L.DebugReport} Wavetrend.SD01L.UplinkPayloads
 */

/**
 * Format of the result data expected by the V3 TTN decoder
 * @typedef {Object} TTN.Uplink.DecoderSuccess
 * @property {Wavetrend.SD01L.UplinkPayloads} data - Decoded payload
 * @property {string[]} [warnings] - any warnings generated by the decoding
 */

/**
 * Format of the result data expected by the V3 TTN decoder
 * @typedef {Object} TTN.Uplink.DecoderError
 * @property {string[]} errors - any errors generated by the decoding
 */

/**
 * Format of the result data expected by the V3 TTN decoder
 * @typedef {TTN.Uplink.DecoderSuccess|TTN.Uplink.DecoderError} TTN.Uplink.DecoderOutput
 */

/**
 * Wavetrend SD01L Uplink Payload Type (documented in encoder.js)
 * @ignore
 */
const SD01L_UPLINK_PAYLOAD_TYPE = {
  INSTALL_REQUEST: 2,
  INSTALL_RESPONSE: 4,
  STANDARD_REPORT: 3,
  FREEZE_REPORT: 7,
  SCALD_REPORT: 8,
  SENSOR_ERROR_REPORT: 5,
  GENERAL_ERROR_REPORT: 6,
  SENSOR_DATA_DEBUG: 9,
  SIMPLE_REPORT: 10,
};

const OFFSET_TYPE = 0;
const OFFSET_VERSION = 1;
const OFFSET_SEQUENCE = 2;
const OFFSET_TIMESTAMP = 3;

/**
 * @typedef Wavetrend.SD01L.PartialPayloadDecode
 * @property {number[]} bytes
 */

/**
 * @memberOf Wavetrend.SD01L
 * @param {number} input - unsigned value
 * @returns {number} - signed representation of LSB of input
 */
function signedByte(input) {
  return (input & 0xFF) << 24 >> 24;
}

/**
 * @memberOf Wavetrend.SD01L
 * @param {number} input - unsigned value
 * @returns {number} - unsigned representation of LSB of input
 */
function unsignedByte(input) {
  return (input & 0xFF) >>> 0;
}

/**
 * Decode SD01L specific message payloads
 * @param {number[]} bytes
 * @param {number} port
 * @returns {Wavetrend.SD01L.UplinkPayloads}
 * @memberOf Wavetrend.SD01L
 */
function Decode_SD01L_Payload(bytes, port) {
  let payload = { };
  let i = 0;

  switch (port) {
    case SD01L_UPLINK_PAYLOAD_TYPE.INSTALL_REQUEST:
      const flags = unsignedByte(bytes[i++]);
      payload.pvd_level = flags >>> 3 & 0x07;
      payload.sensor = [
        !!(flags & 0x01),
        !!(flags & 0x02),
        !!(flags & 0x04),
      ];
      payload.firmware_version = {
        major: unsignedByte(bytes[i++]),
        minor: unsignedByte(bytes[i++])
      };
      payload.reset_reason = (bytes[i++] << 8 >>> 0) + unsignedByte(bytes[i++]);
      break;

    case SD01L_UPLINK_PAYLOAD_TYPE.STANDARD_REPORT:

      payload.timestamp =
        (unsignedByte(bytes[i++]) << 24 >>> 0)
        + (unsignedByte(bytes[i++]) << 16 >>> 0)
        + (unsignedByte(bytes[i++]) << 8 >>> 0)
        + unsignedByte(bytes[i++]);

      payload.sensor_id = bytes[i++] & 0x03;
      payload.minC = signedByte(bytes[i++]);
      payload.maxC = signedByte(bytes[i++]);
      payload.events = bytes[i++];
      payload.reports = bytes[i++];
      break;

    case SD01L_UPLINK_PAYLOAD_TYPE.INSTALL_RESPONSE: {

      payload.error_code = bytes[i++];
      payload.downlink_hours = bytes[i++];
      payload.reporting_period =
        ((bytes[i++] & 0xFF) << 8 >>> 0)
        + ((bytes[i++] & 0xFF) >>> 0);

      let flags = (bytes[i++] & 0xFF) >>> 0;
      payload.message_flags = {
        scald: !!(flags & 0x01),
        freeze: !!(flags & 0x02),
        debug: !!(flags & 0x04),
        history_count: (flags >>> 3) & 0x03,
        simple: !!(flags & 0x20),
        act_poll: !!(flags & 0x40),
        stat_poll: !!(flags & 0x80),
      };

      payload.scald_threshold = (bytes[i++] & 0xFF) << 24 >> 24;
      payload.freeze_threshold = (bytes[i++] & 0xFF) << 24 >> 24;

      payload.config_type = [];
      for (let sensor = 0; sensor < 3; sensor++) {
        let config = (bytes[i++] & 0xFF) >>> 0;
        payload.config_type[sensor] = {
          flow_settling_count: (config >>> 4) & 0x0F >>> 0,
          config: (config & 0x0F) >>> 0,
        };
      }

      const flow_delta = (bytes[i++] & 0xFF) >>> 0;
      payload.flow_delta = {
        cold: (flow_delta & 0xF0) >>> 4,
        hot: flow_delta & 0x0F,
      }

      break;
    }

    case SD01L_UPLINK_PAYLOAD_TYPE.SENSOR_ERROR_REPORT:

      payload.sensor_id = bytes[i++] & 0x03;
      break;

    case SD01L_UPLINK_PAYLOAD_TYPE.GENERAL_ERROR_REPORT:

      payload.error_code = (unsignedByte(bytes[i++]) << 8 >>> 0) + unsignedByte(bytes[i++]);
      payload.file_hash = (unsignedByte(bytes[i++]) << 8 >>> 0) + unsignedByte(bytes[i++]);
      payload.line = (unsignedByte(bytes[i++]) << 8 >>> 0) + unsignedByte(bytes[i++]);
      break;

    case SD01L_UPLINK_PAYLOAD_TYPE.FREEZE_REPORT:
    case SD01L_UPLINK_PAYLOAD_TYPE.SCALD_REPORT:

      payload.sensor_id = bytes[i++] & 0x03;
      payload.temperature = signedByte(bytes[i++]);
      break;

    case SD01L_UPLINK_PAYLOAD_TYPE.SENSOR_DATA_DEBUG: {
      let readings = [];

      const timestamp =
        (unsignedByte(bytes[i++]) << 24 >>> 0)
        + (unsignedByte(bytes[i++]) << 16 >>> 0)
        + (unsignedByte(bytes[i++]) << 8 >>> 0)
        + unsignedByte(bytes[i++]);

      const flags = unsignedByte(bytes[i++]);
      const interval_divide = !!(flags & 0b00000001);
      let interval = ((flags & 0b00011110) >> 1);
      interval = interval_divide ? interval / 10 : interval * 10;
      const pvdLevel = (flags & 0b11100000) >> 5;

      while (i < bytes.length) {

        const reading = {
          timestamp,
          sensors: [
            { direction: 0, state: 0, report: false, tempC: NaN },
            { direction: 0, state: 0, report: false, tempC: NaN },
            { direction: 0, state: 0, report: false, tempC: NaN },
          ]
        }

        for (let sensor = 0 ; sensor < 3 ; sensor++) {

          const data = (unsignedByte(bytes[i++]) << 8 >>> 0) + unsignedByte(bytes[i++]);

          reading.sensors[sensor].direction = (data & 0b1100000000000000) >> 14;
          reading.sensors[sensor].state = (data & 0b0011000000000000) >> 12;
          reading.sensors[sensor].report = (data & 0b0000100000000000) >> 11 === 1;
          const temp_index = (data & 0b0000011111111111);
          reading.sensors[sensor].tempC = (temp_index === 2047) ? null : (temp_index - 270) / 10;
        }
        readings.push(reading);
      }

      // Now we know how many readings there are, we can adjust the timestamps

      readings.forEach((reading, index) => {
        reading.timestamp -= (readings.length - 1 - index) * interval;
      })

      payload.timestamp = timestamp;
      payload.pvd_level = pvdLevel;
      payload.readings = readings;

      break;
    }

    case SD01L_UPLINK_PAYLOAD_TYPE.SIMPLE_REPORT:

      payload.timestamp =
        (unsignedByte(bytes[i++]) << 24 >>> 0)
        + (unsignedByte(bytes[i++]) << 16 >>> 0)
        + (unsignedByte(bytes[i++]) << 8 >>> 0)
        + unsignedByte(bytes[i++]);

      payload.s1MinC = signedByte(bytes[i++]);
      payload.s1MaxC = signedByte(bytes[i++]);

      payload.s2MinC = signedByte(bytes[i++]);
      payload.s2MaxC = signedByte(bytes[i++]);

      payload.s3MinC = signedByte(bytes[i++]);
      payload.s3MaxC = signedByte(bytes[i++]);
      break;

    default:

      throw "Unrecognised type for uplink decoding";

  }
  return payload;
}

/**
 * Entry point for TTN V3 uplink decoder
 * @param {TTN.Uplink.DecoderInput} input
 * @returns {TTN.Uplink.DecoderOutput} - object containing the result of the decode, which might include warnings or errors
 */
function decodeUplink(input) {
  let payload = {
    warnings: [],
    errors: [],
  };

  try {
    payload.data = Decode_SD01L_Payload(input.bytes, input.fPort);
  } catch (error) {
    payload.errors.push(error);
  }

  return payload;
}

/**
 * Entry point for TTN V2 uplink decoder
 * @param {number[]} bytes - array of received bytes
 * @param {number} port - LoRaWAN fPort number
 * @returns {Wavetrend.SD01L.UplinkPayloads|null} - object containing decoded payload, or null if an error is encountered
 */
function Decoder(bytes, port) {
  try {
    return Decode_SD01L_Payload(bytes, port);
  } catch (e) {
    return null;
  }
}

// NB: Not used for TTN production, required for Unit Testing
/* istanbul ignore else */
if (typeof module !== 'undefined') {
  module.exports = {
    Decoder,
    decodeUplink,
  };
}