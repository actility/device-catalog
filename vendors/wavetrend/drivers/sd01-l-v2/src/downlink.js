/**
 @file SD01-L Water Temperature Monitor Downlink Payload Formatter for TTN
 @module src/downlink.js
 @author Dave Meehan
 @copyright Wavetrend Europe Ltd
 @see {@link https://www.thethingsindustries.com/docs/integrations/payload-formatters/javascript/}
 @see {@link https://www.youtube.com/watch?v=nT2FnwCoP7w}
 */

/**
 * @namespace Wavetrend.SD01L
 */

/**
 * Wavetrend SD01L Payload Type
 * @typedef {number} Wavetrend.SD01L.PayloadType
 * @readonly
 * @memberOf Wavetrend.SD01L
 * @enum {Wavetrend.SD01L.PayloadType}
 * @property {Wavetrend.SD01L.PayloadType} CONFIGURATION - 1
 */
const SD01L_DOWNLINK_PAYLOAD_TYPE = {
  CONFIGURATION: 2
};

/**
 * @typedef {Object} Wavetrend.SD01L.MessageFlags
 * @property {boolean} scald - scald reporting enabled (default disabled)
 * @property {boolean} freeze - freeze reporting enabled (default disabled)
 * @property {boolean} debug - debug reporting enabled (default disabled)
 * @property {number} history_count - number of history messages in standard report (default = 0, otherwise 1 or 2)
 * @property {boolean} simple - simple report mode (default disabled)
 * @property {boolean} act_poll - active polling enabled (default enabled)
 * @property {boolean} stat_poll - status polling enabled (default enabled)
 */

/**
 * SD01L Sensor Configuration Type
 * @typedef {number} Wavetrend.SD01L.SensorType
 * @readonly
 * @enum {number}
 * @memberOf Wavetrend.SD01L
 * @property {Wavetrend.SD01L.SensorType} Disabled - 0
 * @property {Wavetrend.SD01L.SensorType} HotOutletStandard - 1
 * @property {Wavetrend.SD01L.SensorType} HotOutletHealthcare - 2
 * @property {Wavetrend.SD01L.SensorType} ColdOutlet - 3
 * @property {Wavetrend.SD01L.SensorType} ColdUnitRising - 4
 * @property {Wavetrend.SD01L.SensorType} BlendedRisingScaldCheck - 5
 * @property {Wavetrend.SD01L.SensorType} HotUnitOutletFalling - 6
 * @property {Wavetrend.SD01L.SensorType} HotUnitReturnFalling - 7
 * @property {Wavetrend.SD01L.SensorType} HotUnitReturnHealthcareFalling - 8
 */
const SD01L_SENSOR_TYPE = {
  Disabled: 0,
  HotOutletStandard: 1,
  HotOutletHealthcare: 2,
  ColdOutlet: 3,
  ColdUnitRising: 4,
  BlendedRisingScaldCheck: 5,
  HotUnitOutletFalling: 6,
  HotUnitReturnFalling: 7,
  HotUnitReturnHealthcareFalling: 8,
};

/**
 * @typedef {Object} Wavetrend.SD01L.SensorConfig
 * @property {number} flow_settling_count - number of readings to allow flow to settle (default 0)
 * @property {SD01L_SENSOR_TYPE} config - identity of the sensor configuration (default disabled)
 */

/**
 * @typedef {Object} Wavetrend.SD01L.FlowDelta
 * @property {number} cold - cold outlet flow delta in range 2-15
 * @property {number} hot - hot outlet flow delta in range 2-15
 */

/**
 * @typedef Wavetrend.SD01L.Configuration
 * @property {number} downlink_hours - number of hours between configuration requests (default 24)
 * @property {number} reporting_period - number of minutes between reports (default 60)
 * @property {Wavetrend.SD01L.MessageFlags} message_flags - option flags
 * @property {number} scald_threshold - temperature above which scald reports will be sent (if enabled, default 60)
 * @property {number} freeze_threshold - temperature below which freeze reports will be sent (if enabled, default 4)
 * @property {Wavetrend.SD01L.SensorConfig[]} config_type - configuration for each sensor
 * @property {Wavetrend.SD01L.FlowDelta} flow_delta - flow delta configuration
 */

/**
 * @typedef {Wavetrend.SD01L.Configuration} Wavetrend.SD01L.DownlinkPayloads
 */

/**
 * Deep merge of config objects to allow defaults to be supplied for anything missing
 * @param {*} arg1
 * @param {*} arg2
 * @returns {*}
 * @memberOf Wavetrend.SD01L
 */
function mergeConfigs(arg1, arg2) {

  if ((Array.isArray(arg1) && Array.isArray(arg2))
    || (typeof arg1 === 'object' && typeof arg2 === 'object')) {
    for (let key in arg2) {
      arg1[key] = mergeConfigs(arg1[key], arg2[key]);
    }
    return arg1;
  }
  return arg2;
}

/**
 * Encode SD01L specific message payloads
 * @param {Wavetrend.SD01L.DownlinkPayloads} object
 * @returns { { bytes: number[], fPort: number } } - array of encoded bytes
 * @memberOf Wavetrend.SD01L
 */
function Encode_SD01L_Payload(object) {
  let bytes = [];
  let fPort = 1;

  switch (object.type) {
    case SD01L_DOWNLINK_PAYLOAD_TYPE.CONFIGURATION:
      fPort = 2;
      const defaults = {
        downlink_hours: 24,
        reporting_period: 60,
        message_flags: {
          scald: false,
          freeze: false,
          debug: false,
          history_count: 0,
          simple: false,
          act_poll: true,
          stat_poll: true,
        },
        scald_threshold: 60,
        freeze_threshold: 4,
        config_type: [
          {flow_settling_count: 0, config: 0,},
          {flow_settling_count: 0, config: 0,},
          {flow_settling_count: 0, config: 0,},
        ],
        flow_delta: {
          cold: 4,
          hot: 10,
        },
      };
      object = mergeConfigs(defaults, object);

      bytes.push(object.downlink_hours & 0xFF);
      bytes.push((object.reporting_period & 0xFF00) >>> 8);
      bytes.push(object.reporting_period & 0x00FF);
      bytes.push(
        object.message_flags.scald << 0 >>> 0
        | object.message_flags.freeze << 1 >>> 0
        | object.message_flags.debug << 2 >>> 0
        | (object.message_flags.history_count & 0x03) << 3 >>> 0
        | object.message_flags.simple << 5 >>> 0
        | object.message_flags.act_poll << 6 >>> 0
        | object.message_flags.stat_poll << 7 >>> 0
      );
      bytes.push((object.scald_threshold & 0xFF) >>> 0);
      bytes.push((object.freeze_threshold & 0xFF) >>> 0);
      for (let sensor = 0; sensor < 3; sensor++) {
        bytes.push(
          (object.config_type[sensor].flow_settling_count & 0x0F) << 4 >>> 0
          | object.config_type[sensor].config & 0x0F
        );
      }
      bytes.push(
        ((object.flow_delta.cold & 0xF) << 4 >>> 0)
        | ((object.flow_delta.hot & 0xF) >>> 0)
      )
      break;

    default:
      throw "Unrecognised type for downlink decoding";
  }

  return { bytes, fPort };
}

/**
 * @namespace TTN.Downlink
 */

/**
 * @typedef {Object} TTN.Downlink.EncoderInput
 * @property {Wavetrend.SD01L.DownlinkPayloads} data
 */

/**
 * @typedef {Object} TTN.Downlink.EncoderSuccess
 * @property {number[]} bytes - byte array of encoded data
 * @property {number} fPort - LoRaWAN port number
 * @property {string[]} [warnings] - any warnings encountered during encoding
 */

/**
 * @typedef {Object} TTN.Downlink.EncoderError
 * @property {string[]} errors - any errors encountered during encoding
 */

/**
 * @typedef {TTN.Downlink.EncoderSuccess|TTN.Downlink.EncoderError} TTN.Downlink.EncoderOutput
 */

/**
 * Entry point for TTN V3 downlink encoder
 * @param {TTN.Downlink.EncoderInput} input
 * @returns {TTN.Downlink.EncoderOutput}
 */
function encodeDownlink(input) {
  let obj = {
    warnings: [],
    errors: [],
  };

  try {
    output = Encode_SD01L_Payload(input.data);
    obj.bytes = output.bytes;
    obj.fPort = output.fPort;
  } catch (error) {
    obj.errors.push(error);
  }

  return obj;
}

/**
 * Entry point for TTN V2 downlink encoder
 * @param {Wavetrend.SD01L.DownlinkPayloads} object
 * @returns {number[]} - byte array of encoded payload or empty array
 */
function Encoder(object/*, port */) {
  try {
    return Encode_SD01L_Payload(object).bytes;
  } catch (e) {
    return [];
  }
}

/**
 * Decode SD01L specific payloads
 * @param {number[]} bytes
 * @param {number} port
 * @return {Wavetrend.SD01L.DownlinkPayloads}
 * @memberOf Wavetrend.SD01L
 */
function Decode_SD01L_Payload(bytes, port) {

  let i = 0;
  let object = {
    type: port,
  };

  switch (object.type) {
    case SD01L_DOWNLINK_PAYLOAD_TYPE.CONFIGURATION:

      object.downlink_hours = (bytes[i++] & 0xFF) >>> 0;
      object.reporting_period =
        ((bytes[i++] & 0xFF) << 8 >>> 0)
        + ((bytes[i++] & 0xFF) >>> 0);

      let flags = (bytes[i++] & 0xFF) >>> 0;
      object.message_flags = {
        scald: !!(flags & 0x01),
        freeze: !!(flags & 0x02),
        debug: !!(flags & 0x04),
        history_count: (flags >>> 3) & 0x03,
        simple: !!(flags & 0x20),
        act_poll: !!(flags & 0x40),
        stat_poll: !!(flags & 0x80),
      };

      object.scald_threshold = (bytes[i++] & 0xFF) << 24 >> 24;
      object.freeze_threshold = (bytes[i++] & 0xFF) << 24 >> 24;

      object.config_type = [];
      for (let sensor = 0; sensor < 3; sensor++) {
        let config = (bytes[i++] & 0xFF) >>> 0;
        object.config_type[sensor] = {
          flow_settling_count: (config >>> 4) & 0x0F >>> 0,
          config: (config & 0x0F) >>> 0,
        };
      }
      const flow_delta = (bytes[i++] & 0xFF) >>> 0;
      object.flow_delta = {
        cold: (flow_delta & 0xF0) >>> 4,
        hot: (flow_delta & 0x0F) >>> 0,
      }
      break;

    case 0:
      throw "LoRaWAN reserved payload type";

    case 1:
      throw "V1 Deprecated Payload, unsupported";

    default:
      throw "Unrecognised type for downlink decoding";
  }

  return object;
}

/**
 * @typedef {Object} TTN.Downlink.DecoderInput
 * @property {number[]} bytes - byte array of encoded data
 * @property {number} fPort - LoRaWAN port number
 */

/**
 * @typedef {Object} TTN.Downlink.DecoderSuccess
 * @property {Wavetrend.SD01L.DownlinkPayloads} data
 * @property {string[]} [warnings]
 */

/**
 * @typedef {Object} TTN.Downlink.DecoderError
 * @property {string[]} errors
 */

/**
 * @typedef {TTN.Downlink.DecoderSuccess|TTN.Downlink.DecoderError} TTN.Downlink.DecoderOutput
 */

/**
 * Entry point for TTN V3 downlink decoder (inverse of encodeDownlink)
 * @param {TTN.Downlink.DecoderInput} input
 * @returns {TTN.Downlink.DecoderOutput}
 */
function decodeDownlink(input) {
  let payload = {
    warnings: [],
    errors: [],
  };

  try {
    payload.data = Decode_SD01L_Payload(input.bytes, input.fPort);
  } catch (e) {
    delete payload.data;
    payload.errors.push(e);
  }

  return payload;
}

// NB: Not used for TTN production, required for Unit Testing

/* istanbul ignore else */
if (typeof module !== 'undefined') {
  module.exports = {
    Encoder,
    encodeDownlink,
    decodeDownlink,
  };
}