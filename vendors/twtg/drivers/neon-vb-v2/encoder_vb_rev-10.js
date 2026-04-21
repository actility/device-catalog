/**
 * Filename             : encoder_vb_rev-10.js
 * Latest commit        : 355c36fc5
 * Protocol v2 document : 6013_P20-002_Communication-Protocol-NEON-Vibration-Sensor_E.pdf
 * Protocol v3 document : NEON-Vibration-Sensor_Communication-Protocol-v3_DS-VB-xx-xx_6013_3_A2.pdf
 *
 * Release History
 *
 * 2021-04-14 revision 0
 * - initial version
 *
 * 2021-03-05 revision 1
 * - Uses scientific notation for sensor data scale
 *
 * 2021-05-14 revision 2
 * - Made it compatible with v1 and v2 (merged in protocol v1)
 *
 * 2021-06-28 revision 3
 * - rename unconfirmed_repeat to number_of_unconfirmed_messages
 * - Added limitation to base configuration
 * - Update minimum number of number_of_unconfirmed_messages
 * - Add value range assertion to encode_device_config
 * - Fixed the parsing of unconfirmed_repeat to number_of_unconfirmed_messages
 *
 * 2022-06-23 revision 4
 * - Fixed dependency on Math.log10 which is not supported on ES5
 *
 * 2022-07-12 revision 5
 * - Fixed encode_sci_6 by making sure the scale_power is clipped to the available range
 *
 * 2022-10-19 revision 6
 * - Protocol V3
 * -- Added configUpdateReq.
 * -- Separated the sensor configuration into Sensor configuration and sensor conditions configuration
 * -- Separated base configuration into base configuration and Region configuration
 * -- Moved protocol_version into message body
 * -- Updated lorawan_fsb_mask representation to disable_switch to dedicate 1 bit to every band (8 channels)
 * -- Uses ThingPark as default entry point where fPort is not an input but an output.
 *
 * 2022-11-22 revision 7
 * - Remove velocity and acceleration scale from sensor data config as VB now has auto scaling
 *
 * 2022-12-01 revision 8
 * - Removed scaling from sensor data config, as it is obsolete due to  auto scaling
 * - Changed "frequency_range.peak_acceleration" to "frequency_range.acceleration" in sensor configuration message
 * - Changed "frequency_range.rms_velocity" to "frequency_range.velocity" in sensor configuration message
 *
 * 2023-12-12 revision 9
 * - Added support of LoRaWAN Payload Codec API Specification (TS013-1.0.0)
 *
 * 2024-09-06 revision 10
 * - Added validation of frequency span and resolution in sensor_data_config to avoid invalid configurations.
 *
 * YYYY-MM-DD revision X
 *
 */

if (typeof module !== 'undefined') {
  // Only needed for nodejs
  module.exports = {
    encodeDownlink: encodeDownlink,
    Encode: Encode,
    Encoder: Encoder,
    encode_header: encode_header,
    encode_header_v3: encode_header_v3,
    encode_events_mode: encode_events_mode,
    encode_base_config: encode_base_config,
    encode_vb_sensor_config: encode_vb_sensor_config,
    encode_vb_sensor_data_config_v1: encode_vb_sensor_data_config_v1,
    encode_vb_sensor_data_config_v2: encode_vb_sensor_data_config_v2,
    encode_vb_sensor_data_config_v3: encode_vb_sensor_data_config_v3,
    encode_calculation_trigger: encode_calculation_trigger,
    encode_fft_trigger_threshold: encode_fft_trigger_threshold,
    encode_fft_selection: encode_fft_selection,
    encode_frequency_range: encode_frequency_range,
    encode_base_config_switch: encode_base_config_switch,
    encode_device_type: encode_device_type,
    encode_uint32: encode_uint32,
    encode_int32: encode_int32,
    encode_uint16: encode_uint16,
    encode_int16: encode_int16,
    encode_uint8: encode_uint8,
    encode_int8: encode_int8,
    encode_sci_6: encode_sci_6,
    calc_crc: calc_crc,
    encode_status_msg_delay_interval_v3: encode_status_msg_delay_interval_v3,
    encode_base_config_v3: encode_base_config_v3,
    encode_base_config_switch_v3: encode_base_config_switch_v3,
    encode_region_config_v3: encode_region_config_v3,
    encode_channel_plan_v3: encode_channel_plan_v3,
    encode_vb_sensor_config_v3: encode_vb_sensor_config_v3,
    encode_vb_sensor_conditions_configuration_v3: encode_vb_sensor_conditions_configuration_v3,
    encode_event_condition_v3: encode_event_condition_v3,
    encode_sensor_config_switch_mask_v3: encode_sensor_config_switch_mask_v3,
  };
}

var mask_byte = 255;

/**
 * Generic entry point (throws Errors)
 */
function _encode(input) {
  input = input.data;

  // Encode downlink messages sent as
  // object to an array or buffer of bytes.

  var PROTOCOL_VERSION_1 = 1;
  var PROTOCOL_VERSION_2 = 2;
  var PROTOCOL_VERSION_3 = 3;

  // Specific for PROTOCOL_VERSION_1 and PROTOCOL_VERSION_2
  var MSGID_BASE_CONFIG = 5;
  var MSGID_SENSOR_CONFIG = 6;
  var MGSID_SENSOR_DATA_CONFIG = 7;

  // Non default ports are specific for PROTOCOL_VERSION_3
  var FPORT_CONFIG_UPDATE = 7;
  var FPORT_CALIBRATION_UPDATE = 8;
  var FPORT_DEFAULT_APP = 15;

  var CONFIG_UPDATE_STR = "config_update_req"
  var CALIB_UPDATE_STR = "calib_update_req"

  // Base config string
  var STR_BASE_CONFIG = "base";
  var STR_REGION_CONFIG = "region";
  var STR_SENSOR_CONFIG = "sensor";
  var STR_SENSOR_DATA_CONFIG = "sensor_data";
  var STR_SENSOR_CONDITIONS_CONFIG = "sensor_conditions";

  // Prepare output with its default value
  var output = {};
  var bytes = [];
  output.bytes = bytes;
  output.fPort = FPORT_DEFAULT_APP;

  var protocol_version = 0;
  // Get protocol_version from either "input.header" (old protocol) or "input.message_body" (new protocol, e.g. "config_update_req")
  // If it does not find protocol_version in the input, the value will default to '0' where the switch case below will handle it as a fault.
  for (var name in input) {
    if (typeof input[name].protocol_version !== 'undefined') {
      protocol_version = input[name].protocol_version;
    }
  }

  switch (protocol_version) {
    case PROTOCOL_VERSION_1:
    case PROTOCOL_VERSION_2:
      {
        // We always use default FPORT on protocol V1 and V2
        output.fPort = FPORT_DEFAULT_APP;
        switch (input.header.message_type) {
          case "base_configuration": {
            encode_header(bytes, MSGID_BASE_CONFIG, input.header.protocol_version);
            encode_base_config(bytes, input);
            encode_uint16(bytes, calc_crc(bytes.slice(1)));

            break;
          }
          case "sensor_configuration": {
            switch (input.device_type) {
              case "vb":
                encode_header(bytes, MSGID_SENSOR_CONFIG, input.header.protocol_version);
                encode_vb_sensor_config(bytes, input);
                encode_uint16(bytes, calc_crc(bytes.slice(1)));

                break;
              default:
                throw new Error("Invalid device type!");
            }
            break;
          }
          case "sensor_data_configuration": {
            switch (input.device_type) {
              case "vb":
                encode_header(bytes, MGSID_SENSOR_DATA_CONFIG, input.header.protocol_version);
                switch (input.header.protocol_version) {
                  case PROTOCOL_VERSION_1:
                    encode_vb_sensor_data_config_v1(bytes, input);
                    break;
                  case PROTOCOL_VERSION_2:
                    encode_vb_sensor_data_config_v2(bytes, input);
                    break;
                  default:
                    throw new Error("Protocol version is not supported!");
                }
                encode_uint16(bytes, calc_crc(bytes.slice(1)));

                break;
              default:
                throw new Error("Invalid device type!");
            }
            break;
          }
          default:
            throw new Error("Invalid message type!");
        }
        break;
      }
    case PROTOCOL_VERSION_3: {
      // Get request type based on message name
      var req_type = Object.keys(input)[0]
      var req = input[req_type]

      switch (req_type) {
        case CONFIG_UPDATE_STR: {
          output.fPort = FPORT_CONFIG_UPDATE;
          switch (req.config_type) {
            case STR_BASE_CONFIG: {
              encode_header_v3(bytes, req);
              // Ignore tag and payload if there is no payload
              if (typeof req.payload != "undefined") {
                encode_uint32(bytes, req.tag);
                encode_base_config_v3(bytes, req.payload);
              }
              break;
            }
            case STR_REGION_CONFIG: {
              encode_header_v3(bytes, req);
              // Ignore tag and payload if there is no payload
              if (typeof req.payload != "undefined") {
                encode_uint32(bytes, req.tag);
                encode_region_config_v3(bytes, req.payload);
              }
              break;
            }
            case STR_SENSOR_CONFIG: {
              encode_header_v3(bytes, req);
              // Ignore tag and payload if there is no payload
              if (typeof req.payload != "undefined") {
                encode_uint32(bytes, req.tag);
                encode_vb_sensor_config_v3(bytes, req.payload);
              }
              break;
            }
            case STR_SENSOR_DATA_CONFIG: {
              encode_header_v3(bytes, req);
              // Ignore tag if there is no payload
              if (typeof req.payload != "undefined") {
                encode_uint32(bytes, req.tag);
                encode_vb_sensor_data_config_v3(bytes, req.payload);
              }
              break;
            }
            case STR_SENSOR_CONDITIONS_CONFIG: {
              encode_header_v3(bytes, req);
              // Ignore tag if there is no payload
              if (typeof req.payload != "undefined") {
                encode_uint32(bytes, req.tag);
                encode_vb_sensor_conditions_configuration_v3(bytes, req.payload);
              }
              break;
            }
            default:
              output.fPort = 0;
              throw new Error("Invalid config type!");
          }
        }
          break;

        case "calib_update_req": {
          output.fPort = FPORT_CALIBRATION_UPDATE
          // TODO: Implement this!
        }
          break;

        default:
          throw new Error("Unknown request type");
      }
    }
      break;

    default:
      throw new Error("Protocol version is not supported!");
  }

  return output;
}

/**
 * LoRaWAN Payload Codec API Specification (TS013-1.0.0)
 */
function encodeDownlink(input) {
  try {
    return _encode(input);
  } catch (error) {
    return { errors: [error.message] };
  }
}

/**
 * Entry point for Chirpstack v3
 */
function Encode(fPort, obj) {
  var input = { data: obj };
  return _encode({data: obj, fPort: fPort}).bytes;
}

/**
 * Entry point for TTN
 */
function Encoder(obj, fPort) {
  return _encode({data: obj, fPort: fPort}).bytes;
}

function encode_base_config(bytes, obj) {
  // The following parameters refers to the same configuration, only different naming on different
  // protocol version.
  // Copy the parameter to a local one
  var number_of_unconfirmed_messages = 0;
  if (typeof obj.number_of_unconfirmed_messages != "undefined") {
    number_of_unconfirmed_messages = obj.number_of_unconfirmed_messages;
  } else if (typeof obj.unconfirmed_repeat != "undefined") {
    number_of_unconfirmed_messages = obj.unconfirmed_repeat;
  } else {
    throw new Error("Missing number_of_unconfirmed_messages OR unconfirmed_repeat parameter");
  }

  if (typeof obj.bypass_sanity_check == "undefined" || obj.bypass_sanity_check == false) {
    if (number_of_unconfirmed_messages < 1 || number_of_unconfirmed_messages > 5) {
      throw new Error("number_of_unconfirmed_messages is outside of specification: " + obj.number_of_unconfirmed_messages);
    }
    if (obj.communication_max_retries < 1) {
      throw new Error("communication_max_retries is outside specification: " + obj.communication_max_retries);
    }
    if (obj.status_message_interval_seconds < 60 || obj.status_message_interval_seconds > 604800) {
      throw new Error("status_message_interval_seconds is outside specification: " + obj.status_message_interval_seconds);
    }
    if (obj.lora_failure_holdoff_count < 0 || obj.lora_failure_holdoff_count > 255) {
      throw new Error("lora_failure_holdoff_count is outside specification: " + obj.lora_failure_holdoff_count);
    }
    if (obj.lora_system_recover_count < 0 || obj.lora_system_recover_count > 255) {
      throw new Error("lora_system_recover_count is outside specification: " + obj.lora_system_recover_count);
    }
  }
  encode_base_config_switch(bytes, obj.switch_mask);
  encode_uint8(bytes, obj.communication_max_retries);             // Unit: -
  encode_uint8(bytes, number_of_unconfirmed_messages);            // Unit: -
  encode_uint8(bytes, obj.periodic_message_random_delay_seconds); // Unit: s
  encode_uint16(bytes, obj.status_message_interval_seconds / 60); // Unit: minutes
  encode_uint8(bytes, obj.status_message_confirmed_interval);     // Unit: -
  encode_uint8(bytes, obj.lora_failure_holdoff_count);            // Unit: -
  encode_uint8(bytes, obj.lora_system_recover_count);             // Unit: -
  encode_uint16(bytes, obj.lorawan_fsb_mask[0]);                  // Unit: -
  encode_uint16(bytes, obj.lorawan_fsb_mask[1]);                  // Unit: -
  encode_uint16(bytes, obj.lorawan_fsb_mask[2]);                  // Unit: -
  encode_uint16(bytes, obj.lorawan_fsb_mask[3]);                  // Unit: -
  encode_uint16(bytes, obj.lorawan_fsb_mask[4]);                  // Unit: -
}

function encode_base_config_v3(bytes, payload) {
  // Check if payload is empty
  if (typeof payload == "undefined") {
    return;
  }

  if (payload.periodic_message_random_delay_seconds < 0 || payload.periodic_message_random_delay_seconds > 31) {
    throw new Error("periodic_message_random_delay_seconds is outside of specification: " + payload.periodic_message_random_delay_seconds);
  }

  encode_base_config_switch_v3(bytes, payload.switch_mask);
  encode_status_msg_delay_interval_v3(bytes, payload.periodic_message_random_delay_seconds, payload.status_message_interval); // bit[5..7]
}

function encode_vb_sensor_config_v3(bytes, payload) {
  if (typeof payload == "undefined") {
    return;
  }

  if (payload.device_type != "vb") {
    throw new Error("Invalid device type!");
  }

  encode_device_type(bytes, payload.device_type);
  encode_sensor_config_switch_mask_v3(bytes, payload.switch_mask);

  // Timing configs
  if (payload.measurement_interval_minutes == 0 || payload.measurement_interval_minutes > 240) {
    throw new Error("measurement_interval_minutes outside of specification: " + payload.measurement_interval_minutes);
  }
  else {
    encode_uint8(bytes, payload.measurement_interval_minutes);     // Unit: m
  }
  if (payload.periodic_event_message_interval > 10080 || payload.periodic_event_message_interval < 0) { // maximum allowed value
    throw new Error("periodic_event_message_interval outside of specification: " + payload.periodic_event_message_interval);
  }
  else {
    encode_uint16(bytes, payload.periodic_event_message_interval);  // Unit: -
  }

  encode_frequency_range(bytes,
    payload.frequency_range.velocity,
    payload.frequency_range.acceleration);
}

function encode_vb_sensor_config(bytes, obj) {
  encode_device_type(bytes, obj.device_type);

  // Timing configs
  encode_uint16(bytes, obj.measurement_interval_seconds);     // Unit: s
  encode_uint16(bytes, obj.periodic_event_message_interval);  // Unit: -
  encode_frequency_range(bytes,
    obj.frequency_range.rms_velocity,
    obj.frequency_range.peak_acceleration);

  // Events configs
  var idx = 0;
  for (idx = 0; idx < 6; idx++) {                             // Unit: -
    encode_events_mode(bytes, obj.events[idx].mode);

    // mode values
    if (obj.events[idx].mode != "off") {
      encode_int16(bytes, obj.events[idx].mode_value / 0.01);
    } else {
      encode_int16(bytes, 0);
    }
  }

}

function encode_vb_sensor_data_config_v1(bytes, obj) {
  encode_device_type(bytes, obj.device_type);

  encode_calculation_trigger(bytes, obj.calculation_trigger);
  encode_uint16(bytes, obj.calculation_interval);

  encode_uint16(bytes, obj.fragment_message_interval);
  if (obj.threshold_window % 2) throw new Error("threshold_window must be multiple of 2")
  encode_uint8(bytes, obj.threshold_window / 2);

  for (idx = 0; idx < 5; idx++) {
    encode_fft_trigger_threshold(
      bytes,
      obj.trigger_thresholds[idx].unit,
      obj.trigger_thresholds[idx].frequency,
      obj.trigger_thresholds[idx].magnitude);
  }

  encode_fft_selection(bytes, obj.selection);

  encode_uint16(bytes, obj.frequency.span.velocity.start);
  encode_uint16(bytes, obj.frequency.span.velocity.stop);

  encode_uint16(bytes, obj.frequency.span.acceleration.start);
  encode_uint16(bytes, obj.frequency.span.acceleration.stop);

  encode_uint8(bytes, obj.frequency.resolution.velocity);
  encode_uint8(bytes, obj.frequency.resolution.acceleration);

  if (obj.scale.velocity % 4) throw new Error("scale.velocity must be multiple of 4")
  encode_uint8(bytes, obj.scale.velocity / 4);
  if (obj.scale.acceleration % 4) throw new Error("scale.acceleration must be multiple of 4")
  encode_uint8(bytes, obj.scale.acceleration / 4);

}

function encode_vb_sensor_data_config_v2(bytes, obj) {
  // byte[1]
  encode_device_type(bytes, obj.device_type);

  // byte[2]
  encode_calculation_trigger(bytes, obj.calculation_trigger);

  // byte[3..4]
  encode_uint16(bytes, obj.calculation_interval);

  // byte[5..6]
  encode_uint16(bytes, obj.fragment_message_interval);
  if (obj.threshold_window % 2) throw new Error("threshold_window must be multiple of 2")

  // byte[7]
  encode_uint8(bytes, obj.threshold_window / 2);

  // byte[8..27]
  for (idx = 0; idx < 5; idx++) {
    encode_fft_trigger_threshold(
      bytes,
      obj.trigger_thresholds[idx].unit,
      obj.trigger_thresholds[idx].frequency,
      obj.trigger_thresholds[idx].magnitude);
  }

  // byte[28]
  encode_fft_selection(bytes, obj.selection);

  // check for valid frequency span config
  validate_frequency_span(obj.frequency.span.velocity, obj.frequency.resolution.velocity, "velocity");
  validate_frequency_span(obj.frequency.span.acceleration, obj.frequency.resolution.acceleration, "acceleration");

  // byte[29..30]
  encode_uint16(bytes, obj.frequency.span.velocity.start);
  // byte[31..32]
  encode_uint16(bytes, obj.frequency.span.velocity.stop);

  // byte[33..34]
  encode_uint16(bytes, obj.frequency.span.acceleration.start);
  // byte[35..36]
  encode_uint16(bytes, obj.frequency.span.acceleration.stop);

  // byte[37]
  encode_uint8(bytes, obj.frequency.resolution.velocity);
  // byte[38]
  encode_uint8(bytes, obj.frequency.resolution.acceleration);

  // byte[39]
  encode_sci_6(bytes, obj.scale.velocity);

  // byte[40]
  encode_sci_6(bytes, obj.scale.acceleration);
}

function encode_vb_sensor_data_config_v3(bytes, payload) {
  if (typeof payload == "undefined") {
    return;
  }

  if (payload.device_type != "vb") {
    throw new Error("Invalid device type!");
  }

  // byte[1]
  encode_device_type(bytes, payload.device_type);

  // byte[2]
  encode_calculation_trigger(bytes, payload.calculation_trigger);

  // byte[3..4]
  encode_uint16(bytes, payload.calculation_interval);

  // byte[5..6]
  encode_uint16(bytes, payload.fragment_message_interval);
  if (payload.threshold_window % 2) throw new Error("threshold_window must be multiple of 2")

  // byte[7]
  encode_uint8(bytes, payload.threshold_window / 2);

  // byte[8..27]
  for (idx = 0; idx < 5; idx++) {
    encode_fft_trigger_threshold(
      bytes,
      payload.trigger_thresholds[idx].unit,
      payload.trigger_thresholds[idx].frequency,
      payload.trigger_thresholds[idx].magnitude);
  }

  // byte[28]
  encode_fft_selection(bytes, payload.selection);

  // check for valid frequency span config
  validate_frequency_span(payload.frequency.span.velocity, payload.frequency.resolution.velocity, "velocity");
  validate_frequency_span(payload.frequency.span.acceleration, payload.frequency.resolution.acceleration, "acceleration");

  // byte[29..30]
  encode_uint16(bytes, payload.frequency.span.velocity.start);
  // byte[31..32]
  encode_uint16(bytes, payload.frequency.span.velocity.stop);

  // byte[33..34]
  encode_uint16(bytes, payload.frequency.span.acceleration.start);
  // byte[35..36]
  encode_uint16(bytes, payload.frequency.span.acceleration.stop);

  // byte[37]
  encode_uint8(bytes, payload.frequency.resolution.velocity);
  // byte[38]
  encode_uint8(bytes, payload.frequency.resolution.acceleration);
}

function encode_region_config_v3(bytes, payload) {
  if (typeof payload == "undefined") {
    return;
  }

  encode_channel_plan_v3(bytes, payload.channel_plan);

  // join_trials
  if (payload.join_trials.holdoff_steps > 7) {
    throw new Error("Hold off steps too large");
  }
  burst_min1 = (payload.join_trials.burst_count - 1) & 0xff;
  if (burst_min1 > 31) {
    throw new Error("Burst range 1..32");
  }
  join_trials = payload.join_trials.holdoff_hours_max & 0xff;
  join_trials |= payload.join_trials.holdoff_steps << 8;
  join_trials |= burst_min1 << 11;
  encode_uint16(bytes, join_trials);

  // disable_switch
  disable_switch = payload.disable_switch.frequency_bands & 0x0FFF;
  if ((disable_switch ^ 0x0FFF) == 0) {
    throw new Error("Not disable all bands");
  }
  disable_switch |= payload.disable_switch.dwell_time ? 0x1000 : 0x0000;
  encode_uint16(bytes, disable_switch);

  encode_uint8(bytes, payload.rx1_delay & 0x0f);

  // ADR
  adr = payload.adr.mode;
  adr |= (payload.adr.ack_limit_exp & 0x07) << 2;
  adr |= (payload.adr.ack_delay_exp & 0x07) << 5;
  encode_uint8(bytes, adr);

  encode_int8(bytes, payload.max_tx_power);
}

function encode_vb_sensor_conditions_configuration_v3(bytes, payload) {
  if (typeof payload == "undefined") {
    return;
  }

  if (payload.device_type != "vb") {
    throw new Error("Invalid device type!");
  }

  encode_device_type(bytes, payload.device_type);
  // Events configs
  var idx = 0;
  for (idx = 0; idx < 5; idx++) {                             // Unit: -
    // mode values
    if (payload.event_conditions[idx].mode == 'rms_velocity_x' ||
      payload.event_conditions[idx].mode == 'rms_velocity_y' ||
      payload.event_conditions[idx].mode == 'rms_velocity_z') {
      if (payload.event_conditions[idx].mode_value >= 200) {
        throw new Error("mode_value is outside of specification: " + payload.event_conditions[idx].mode_value);
      }
    }
    else if (payload.event_conditions[idx].mode == 'peak_acceleration_x' ||
      payload.event_conditions[idx].mode == 'peak_acceleration_y' ||
      payload.event_conditions[idx].mode == 'peak_acceleration_z') {
      if (payload.event_conditions[idx].mode_value >= 150) {
        throw new Error("mode_value is outside of specification: " + payload.event_conditions[idx].mode_value);
      }
    }
    encode_event_condition_v3(bytes, payload.event_conditions[idx]);
  }
}

/* Helper Functions *********************************************************/

// helper function to encode the header
function encode_header(bytes, message_type_id, protocol_version) {
  var b = 0;
  b += (message_type_id & 0x0F);
  b += (protocol_version & 0x0F) << 4;

  bytes.push(b);
}

// helper function to encode the header for PROTOCOL_VERSION_3
function encode_header_v3(bytes, header) {
  var b = 0;
  b += (lookup_config_type(header.config_type) & 0x0F);
  b += (header.protocol_version & 0x0F) << 4;

  encode_uint8(bytes, b);
}

// helper function to encode device type
function encode_device_type(bytes, type) {
  switch (type) {
    case 'ts':
      encode_uint8(bytes, 1);
      break;
    case 'vs-qt':
      encode_uint8(bytes, 2);
      break;
    case 'vs-mt':
      encode_uint8(bytes, 3);
      break;
    case 'tt':
      encode_uint8(bytes, 4);
      break;
    case 'ld':
      encode_uint8(bytes, 5);
      break;
    case 'vb':
      encode_uint8(bytes, 6);
      break;
    default:
      encode_uint8(bytes, 0);
      break;
  }
}

// helper function to encode the event condition
function encode_event_condition_v3(bytes, event_condition) {
  var event_condition_most_significant = 0;
  var temporary_mode = []; // to store the mode

  encode_events_mode(temporary_mode, event_condition.mode);
  event_condition_most_significant |= (temporary_mode[0] << 12);

  encode_uint16(bytes, (event_condition.mode_value * 10) | event_condition_most_significant);
}

// helper function to encode event.mode
function encode_events_mode(bytes, mode) {
  // Check mode
  switch (mode) {
    case 'rms_velocity_x':
      encode_uint8(bytes, 1);
      break;
    case 'peak_acceleration_x':
      encode_uint8(bytes, 2);
      break;
    case 'rms_velocity_y':
      encode_uint8(bytes, 3);
      break;
    case 'peak_acceleration_y':
      encode_uint8(bytes, 4);
      break;
    case 'rms_velocity_z':
      encode_uint8(bytes, 5);
      break;
    case 'peak_acceleration_z':
      encode_uint8(bytes, 6);
      break;
    case 'off':
      encode_uint8(bytes, 0);
      break;
    default:
      throw new Error("mode is outside of specification: " + mode);
  }
}

// helper function to encode fft measurement mode
function encode_calculation_trigger(bytes, calculation_trigger) {
  var calculation_trigger_bitmask = 0;

  if (!(
    typeof calculation_trigger.on_event == "boolean"
    && typeof calculation_trigger.on_threshold == "boolean"
    && typeof calculation_trigger.on_button_press == "boolean"
  )) {
    throw new Error('calculation_trigger must contain: on_event, on_threshold and on_button_press boolean fields');
  }

  calculation_trigger_bitmask |= calculation_trigger.on_event ? 0x01 : 0x00;
  calculation_trigger_bitmask |= calculation_trigger.on_threshold ? 0x02 : 0x00;
  calculation_trigger_bitmask |= calculation_trigger.on_button_press ? 0x04 : 0x00;

  encode_uint8(bytes, calculation_trigger_bitmask);
}

// helper function to encode fft trigger threshold
function encode_fft_trigger_threshold(bytes, unit, frequency, magnitude) {
  var trigger;
  switch (unit) {
    case "velocity":
      trigger = 0;
      break;

    case "acceleration":
      trigger = 1;
      break;

    default:
      throw new Error("Invalid unit");
  }
  trigger |= ((frequency & 0x7FFF) << 1);
  trigger |= (((magnitude * 100) & 0xFFFF) << 16);

  encode_uint32(bytes, trigger);
}


// helper function to encode fft trigger threshold
function encode_fft_selection(bytes, obj) {
  var selection = 0;
  var axis;
  switch (obj.axis) {
    case "x":
      axis = 0;
      break;
    case "y":
      axis = 1;
      break;
    case "z":
      axis = 2;
      break;
    default:
      throw new Error("selection.axis must one of 'x', 'y' or 'z'")
  }

  var resolution;
  switch (obj.resolution) {
    case "low_res":
      resolution = 0;
      break;
    case "high_res":
      resolution = 1;
      break;
    default:
      throw new Error("selection.resolution must one of 'low_res' or 'high_res'")
  }

  if (typeof obj.enable_hanning_window != "boolean") {
    throw new Error('selection.enable_hanning_window must be a boolean');
  }
  var enable_hanning_window = obj.enable_hanning_window ? 1 : 0;

  var selection = axis;
  selection |= (resolution << 2);
  selection |= (enable_hanning_window << 3);
  encode_uint8(bytes, selection);
}

// helper function to encode frequency range
function encode_frequency_range(bytes, velocity, acceleration) {
  var range = 0;

  switch (velocity) {
    case "range_1":
      range += 0;
      break;
    case "range_2":
      range += 1;
      break;
    default:
      throw new Error("Invalid velocity range!" + velocity)
  }

  switch (acceleration) {
    case "range_1":
      range += 0;
      break;
    case "range_2":
      range += 2;
      break;
    default:
      throw new Error("Invalid acceleration range!" + acceleration)
  }

  encode_uint8(bytes, range);
}

// helper function to encode the base configuration switch_mask
function encode_base_config_switch(bytes, bitmask) {
  var config_switch_mask = 0;
  if (bitmask.enable_confirmed_event_message) {
    config_switch_mask |= 1 << 0;
  }
  if (bitmask.enable_confirmed_data_message) {
    config_switch_mask |= 1 << 2;
  }
  if (bitmask.allow_deactivation) {
    config_switch_mask |= 1 << 3;
  }
  bytes.push(config_switch_mask & mask_byte);
}
function encode_base_config_switch_v3(bytes, bitmask) {
  var config_switch_mask = 0;
  if (bitmask.enable_confirmed_event_message) {
    config_switch_mask |= 1 << 0;
  }
  if (bitmask.enable_confirmed_data_message) {
    config_switch_mask |= 1 << 1;
  }
  if (bitmask.allow_deactivation) {
    config_switch_mask |= 1 << 2;
  }
  if (bitmask.enable_debug_info) {  // Only for internal usage
    config_switch_mask |= 1 << 3;
  }
  bytes.push(config_switch_mask & mask_byte);
}

// helper function to encode the sensor configuration switch_mask
function encode_sensor_config_switch_mask_v3(bytes, bitmask) {
  var config_switch_mask = 0;
  switch (bitmask.selection) {
    case "extended": // zero
      break;
    case "min_only":
      config_switch_mask |= 1 << 0;
      break;
    case "max_only":
      config_switch_mask |= 2 << 0;
      break;
    case "avg_only":
      config_switch_mask |= 3 << 0;
      break;
    default:
      throw new Error("Out of bound, selection: " + bitmask.selection);
  }
  bytes.push(config_switch_mask);
}

// helper function to encode an uint32
function encode_uint32(bytes, value) {
  if (value == undefined) {
    throw new Error("Variable undefined");
  }
  bytes.push(value & mask_byte);
  bytes.push((value >> 8) & mask_byte);
  bytes.push((value >> 16) & mask_byte);
  bytes.push((value >> 24) & mask_byte);
}

// helper function to encode an int32
function encode_int32(bytes, value) {
  encode_uint32(bytes, value);
}

// helper function to encode an uint16
function encode_uint16(bytes, value) {
  if (value == undefined) {
    throw new Error("Variable undefined");
  }
  bytes.push(value & mask_byte);
  bytes.push((value >> 8) & mask_byte);
}

// helper function to encode an int16
function encode_int16(bytes, value) {
  if (value == undefined) {
    throw new Error("Variable undefined");
  }
  encode_uint16(bytes, value);
}

// helper function to encode an uint8
function encode_uint8(bytes, value) {
  if (value == undefined) {
    throw new Error("Variable undefined");
  }
  bytes.push(value & mask_byte);
}

// helper function to encode an int8
function encode_int8(bytes, value) {
  encode_uint8(bytes, value);
}

// helper function to encode 6 bit scientific notation
function encode_sci_6(bytes, scale) {
  if (scale == undefined) {
    throw new Error("Variable undefined");
  }
  // Get power component of scientific notation
  scale_power = Number(scale.toExponential().split('e')[1]);

  // Clip power value based on range
  if (scale_power < -2)
    scale_power = -2;
  if (scale_power > 1)
    scale_power = 1;

  // Calculate coefficient
  scale_coefficient = scale / Math.pow(10, scale_power);

  // Check for rounding and coefficient range
  if (scale_coefficient != Math.floor(scale_coefficient) || scale_coefficient < 1 || scale_coefficient > 15) {
    // Decrease power to avoid coefficient rounding
    scale_power = scale_power - 1
    scale_coefficient = scale / Math.pow(10, scale_power);

    // Final check
    if (scale_coefficient < 1 || scale_coefficient > 15 || scale_power < -2 || scale_power > 1) {
      throw new Error("Out of bound, scale: " + scale_power + ", coefficient: " + scale_coefficient);
    }
  }

  power = ((scale_power + 2) & 0x03) << 4;
  coefficient = scale_coefficient & 0x0F;
  bytes.push(coefficient | power);
}

// calc_crc inspired by https://github.com/SheetJS/js-crc32
function calc_crc(buf) {
  function signed_crc_table() {
    var c = 0, table = new Array(256);

    for (var n = 0; n != 256; ++n) {
      c = n;
      c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
      c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
      c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
      c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
      c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
      c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
      c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
      c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
      table[n] = c;
    }

    return typeof Int32Array !== 'undefined' ? new Int32Array(table) :
      table;
  }
  var T = signed_crc_table();

  var C = -1, L = buf.length - 3;
  var i = 0;
  while (i < buf.length) C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xFF];
  return C & 0xFFFF;
}

function encode_status_msg_delay_interval_v3(bytes, periodic_message_random_delay, status_message_interval) {
  var interval_val = 0;
  switch (status_message_interval) {
    case ("2 minutes"):
      interval_val = 0;
      break;
    case ("15 minutes"):
      interval_val = 1;
      break;
    case ("1 hour"):
      interval_val = 2;
      break;
    case ("4 hours"):
      interval_val = 3;
      break;
    case ("12 hours"):
      interval_val = 4;
      break;
    case ("1 day"):
      interval_val = 5;
      break;
    case ("2 days"):
      interval_val = 6;
      break;
    case ("5 days"):
      interval_val = 7;
      break;
    default:
      throw new Error("status_message_interval is outside of specification: " + obj.status_message_interval);
  }
  var byte = periodic_message_random_delay | (interval_val << 5);
  bytes.push(byte);
}

function encode_channel_plan_v3(bytes, channel_plan) {
  switch (channel_plan) {
    case "EU868": {
      bytes.push(1);
      break;
    }
    case "US915": {
      bytes.push(2);
      break;
    }
    case "CN779": {
      bytes.push(3);
      break;
    }
    case "EU433": {
      bytes.push(4);
      break;
    }
    case "AU915": {
      bytes.push(5);
      break;
    }
    case "CN470": {
      bytes.push(6);
      break;
    }
    case "AS923": {
      bytes.push(7);
      break;
    }
    case "AS923-2": {
      bytes.push(8);
      break;
    }
    case "AS923-3": {
      bytes.push(9);
      break;
    }
    case "KR920": {
      bytes.push(10);
      break;
    }
    case "IN865": {
      bytes.push(11);
      break;
    }
    case "RU864": {
      bytes.push(12);
      break;
    }
    case "AS923-4": {
      bytes.push(13);
      break;
    }
    default:
      throw new Error("channel_plan outside of specification: " + obj.channel_plan);
  }
}

// Helper function for validating frequency span
function validate_frequency_span(span, resolution, label) {
  var error = "";
  if (span.start > 0 && span.start >= span.stop) error = ".start can not be equal to or higher than stop"
  if (span.stop * resolution > 8192) error = ".stop * resolution.velocity cannot be higher than 8192";
  if (error != "") throw new Error("frequency.span." + label + error)
}

// Helper function to encode config_type for PROTOCOL_VERSION_3
function lookup_config_type(config_type) {
  switch (config_type) {
    case "base":
      return 0;
    case "region":
      return 1;
    case "reserved":
      return 2;
    case "sensor":
      return 3;
    case "sensor_data":
      return 4;
    case "sensor_conditions":
      return 5;
    default:
      throw new Error("Unknown config_type: " + config_type);
  }
}
