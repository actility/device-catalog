// Protocol v2 only

// if (typeof module !== 'undefined') {
//   // Only needed for nodejs
//   module.exports = {
//     Decode: Decode,
//     Decoder: Decoder,
//     decode_float: decode_float,
//     decode_uint32: decode_uint32,
//     decode_int32: decode_int32,
//     decode_uint16: decode_uint16,
//     decode_int16: decode_int16,
//     decode_uint8: decode_uint8,
//     decode_int8: decode_int8,
//   };
// }

// Decode an uplink message from a buffer
// (array) of bytes to an object of fields.
function Decode(fPort, bytes) { // Used for ChirpStack (aka LoRa Network Server)
  var decoded = {};
  decoded.header = {};
  decoded.header.protocol_version = bytes[0] >> 4;
  const message_type = bytes[0] & 0x0F;

  switch (decoded.header.protocol_version) {
    case 2: { // protocol_version = 2
      decoded.header.message_type = message_types_lookup_v2(message_type);

      var cursor = {}; // keeping track of which byte to process.
      cursor.value = 1; // skip header that is already done

      switch (message_type) {
        case 0: { // Boot message
          decoded.boot = {};

          const device_type = decode_uint8(bytes, cursor);
          decoded.boot.device_type = device_types_lookup_v2(device_type);

          var version_hash = decode_uint32(bytes, cursor);
          decoded.boot.version_hash = uint32_to_hex(version_hash);

          var device_config_crc = decode_uint16(bytes, cursor);
          decoded.boot.device_config_crc = uint16_to_hex(device_config_crc);

          var application_config_crc = decode_uint16(bytes, cursor);
          decoded.boot.application_config_crc = uint16_to_hex(application_config_crc);

          var calibration_crc = decode_uint16(bytes, cursor);
          decoded.boot.calibration_crc = uint16_to_hex(calibration_crc);

          decoded.boot.reset_flags = decode_uint8(bytes, cursor);
          decoded.boot.reboot_counter = decode_uint8(bytes, cursor);

          const reboot_type = decode_uint8(bytes, cursor);
          const reboot_payload = [0, 0, 0, 0, 0, 0, 0, 0];
          reboot_payload[0] += decode_uint8(bytes, cursor);
          reboot_payload[1] += decode_uint8(bytes, cursor);
          reboot_payload[2] += decode_uint8(bytes, cursor);
          reboot_payload[3] += decode_uint8(bytes, cursor);
          reboot_payload[4] += decode_uint8(bytes, cursor);
          reboot_payload[5] += decode_uint8(bytes, cursor);
          reboot_payload[6] += decode_uint8(bytes, cursor);
          reboot_payload[7] += decode_uint8(bytes, cursor);

          switch (reboot_type) {
            case 0: // REBOOT_INFO_TYPE_NONE
              decoded.boot.reboot_info = 'none';
              break;

            case 1: // REBOOT_INFO_TYPE_POWER_CYCLE
              decoded.boot.reboot_info = 'power cycle';
              break;

            case 2: // REBOOT_INFO_TYPE_WDOG
              decoded.boot.reboot_info = 'swdog (' + String.fromCharCode(
                  reboot_payload[0],
                  reboot_payload[1],
                  reboot_payload[2],
                  reboot_payload[3]).replace(/[^\x20-\x7E]/g, '') + ')';

              break;

            case 3: // REBOOT_INFO_TYPE_ASSERT
              decoded.boot.reboot_info = 'assert (' +
                  String.fromCharCode(
                      reboot_payload[0], reboot_payload[1],
                      reboot_payload[2], reboot_payload[3],
                      reboot_payload[4], reboot_payload[5]).replace(/[^\x20-\x7E]/g, '') + ':' +
                  Number(reboot_payload[6] + (reboot_payload[7] << 8)) .toString() + ')';
              break;

            case 4: // REBOOT_INFO_TYPE_APPLICATION_REASON
              decoded.boot.reboot_info = 'application (0x' +
                  uint8_to_hex(reboot_payload[3]) +
                  uint8_to_hex(reboot_payload[2]) +
                  uint8_to_hex(reboot_payload[1]) +
                  uint8_to_hex(reboot_payload[0]) + ')';
              break;

              case 5: // REBOOT_INFO_TYPE_SYSTEM_ERROR
              decoded.boot.reboot_info = 'system (0x' +
                  uint8_to_hex(reboot_payload[3]) +
                  uint8_to_hex(reboot_payload[2]) +
                  uint8_to_hex(reboot_payload[1]) +
                  uint8_to_hex(reboot_payload[0]) + ')';
              break;

            default:
              decoded.boot.reboot_info = 'unknown (' +
                  '0x' + uint8_to_hex(reboot_payload[0]) + ', ' +
                  '0x' + uint8_to_hex(reboot_payload[1]) + ', ' +
                  '0x' + uint8_to_hex(reboot_payload[2]) + ', ' +
                  '0x' + uint8_to_hex(reboot_payload[3]) + ', ' +
                  '0x' + uint8_to_hex(reboot_payload[4]) + ', ' +
                  '0x' + uint8_to_hex(reboot_payload[5]) + ', ' +
                  '0x' + uint8_to_hex(reboot_payload[6]) + ', ' +
                  '0x' + uint8_to_hex(reboot_payload[7]) + ')';
              break;
          }

          decoded.boot.last_device_state = decode_uint8(bytes, cursor);
          decoded.boot.bist = decode_uint8(bytes, cursor);
          break;
        }

        case 1: { // Calibrated message
          decoded.calibrated = {};
          decoded.calibrated.calibration_vector = {};
          decoded.calibrated.calibration_vector.x = decode_int16(bytes, cursor);
          decoded.calibrated.calibration_vector.y = decode_int16(bytes, cursor);
          decoded.calibrated.calibration_vector.z = decode_int16(bytes, cursor);

          decoded.calibrated.open_verification_vector = {};
          decoded.calibrated.open_verification_vector.x = decode_int16(bytes, cursor);
          decoded.calibrated.open_verification_vector.y = decode_int16(bytes, cursor);
          decoded.calibrated.open_verification_vector.z = decode_int16(bytes, cursor);

          decoded.calibrated.closed_verification_vector = {};
          decoded.calibrated.closed_verification_vector.x = decode_int16(bytes, cursor);
          decoded.calibrated.closed_verification_vector.y = decode_int16(bytes, cursor);
          decoded.calibrated.closed_verification_vector.z = decode_int16(bytes, cursor);

          decoded.calibrated.temperature = decode_int8(bytes, cursor);

          break;
        }

        case 2: { // Not calibration message
          decoded.not_calibrated = {};

          const reason_id = decode_uint8(bytes, cursor);
          decoded.not_calibrated.reason = not_calibrated_reasons_lookup_v2(reason_id);
          if (reason_id.in(2,3,4,5,6,7)) {
            decoded.not_calibrated.calibration_vector = {};
            decoded.not_calibrated.calibration_vector.x = decode_int16(bytes, cursor);
            decoded.not_calibrated.calibration_vector.y = decode_int16(bytes, cursor);
            decoded.not_calibrated.calibration_vector.z = decode_int16(bytes, cursor);
          } else {
            cursor.value += 6;
          }

          if (reason_id.in(4,5,6,7)) {
            decoded.not_calibrated.open_verification_vector = {};
            decoded.not_calibrated.open_verification_vector.x = decode_int16(bytes, cursor);
            decoded.not_calibrated.open_verification_vector.y = decode_int16(bytes, cursor);
            decoded.not_calibrated.open_verification_vector.z = decode_int16(bytes, cursor);
          } else {
            cursor.value += 6;
          }

          if (reason_id.in(7)) {
            decoded.not_calibrated.closed_verification_vector = {};
            decoded.not_calibrated.closed_verification_vector.x = decode_int16(bytes, cursor);
            decoded.not_calibrated.closed_verification_vector.y = decode_int16(bytes, cursor);
            decoded.not_calibrated.closed_verification_vector.z = decode_int16(bytes, cursor);
          } else {
            cursor.value += 6;
          }

          if (!reason_id.in(0)) {
            decoded.not_calibrated.temperature = decode_int8(bytes, cursor);
          }

          break;
        }

        case 3: { // Application event message
          decoded.application_event = {};

          const state_method_trigger = decode_uint8(bytes, cursor);
          decoded.application_event.state = state_lookup_v2(state_method_trigger & 0x01);
          decoded.application_event.detection_method = detection_method_lookup_v2((state_method_trigger & 0x02) >> 1);
          decoded.application_event.trigger = trigger_lookup_v2(state_method_trigger >> 2);
          decoded.application_event.state_transition_sequence = decode_uint8(bytes, cursor);
          decoded.application_event.angle = decode_int16(bytes, cursor) * 0.1;
          decoded.application_event.magnitude = decode_uint16(bytes, cursor) * 0.1;

          if (bytes.length > cursor.value) { // any debug values provided?
            decoded.application_event.debug = {};
            decoded.application_event.debug.temperature = decode_int8(bytes, cursor);
            decoded.application_event.debug.vector = {};
            decoded.application_event.debug.vector.x = decode_int16(bytes, cursor);
            decoded.application_event.debug.vector.y = decode_int16(bytes, cursor);
            decoded.application_event.debug.vector.z = decode_int16(bytes, cursor);
          }

          break;
        }

        case 4: { // Device status message
          decoded.device_status = {};


          var radio_config_crc = decode_uint16(bytes, cursor);
          decoded.device_status.device_config_crc = uint16_to_hex(radio_config_crc);

          var application_config_crc = decode_uint16(bytes, cursor);
          decoded.device_status.application_config_crc = uint16_to_hex(application_config_crc);

          var calibration_crc = decode_uint16(bytes, cursor);
          decoded.device_status.calibration_crc = uint16_to_hex(calibration_crc);

          decoded.device_status.event_counter = decode_uint8(bytes, cursor);
          decoded.device_status.unstable_counter = decode_uint8(bytes, cursor);

          decoded.device_status.battery_voltage = {}
          decoded.device_status.battery_voltage.low = decode_uint16(bytes, cursor) / 1000.0;
          decoded.device_status.battery_voltage.high = decode_uint16(bytes, cursor) / 1000.0;
          decoded.device_status.battery_voltage.settle = decode_uint16(bytes, cursor) / 1000.0;

          decoded.device_status.temperature = {}
          decoded.device_status.temperature.min = decode_int8(bytes, cursor);
          decoded.device_status.temperature.max = decode_int8(bytes, cursor);
          decoded.device_status.temperature.avg = decode_int8(bytes, cursor);

          decoded.device_status.tx_counter = decode_uint8(bytes, cursor);
          decoded.device_status.avg_rssi = -decode_uint8(bytes, cursor);
          decoded.device_status.avg_snr = decode_uint8(bytes, cursor);
          break;
        }

      }
      break;
    }
  }

  return decoded;
}

function Decoder(obj, fPort) { // for The Things Network server
  return Decode(fPort, obj);
}

// helper function to parse an 32 bit float
function decode_float(bytes, cursor) {
  // JavaScript bitwise operators yield a 32 bits integer, not a float.
  // Assume LSB (least significant byte first).
  var bits = decode_int32(bytes, cursor);
  var sign = (bits >>> 31 === 0) ? 1.0 : -1.0;
  var e = bits >>> 23 & 0xff;
  if (e == 0xFF) {
    if (bits & 0x7fffff) {
      return NaN;
    } else {
      return sign * Infinity;
    }
  }
  var m = (e === 0) ? (bits & 0x7fffff) << 1 : (bits & 0x7fffff) | 0x800000;
  var f = sign * m * Math.pow(2, e - 150);
  return f;
}

// helper function to parse an unsigned uint32
function decode_uint32(bytes, cursor) {
  var result = 0;
  var i = cursor.value + 3;
  result = bytes[i--];
  result = result * 256 + bytes[i--];
  result = result * 256 + bytes[i--];
  result = result * 256 + bytes[i--];
  cursor.value += 4;

  return result;
}

// helper function to parse an unsigned int32
function decode_int32(bytes, cursor) {
  var result = 0;
  var i = cursor.value + 3;
  result = (result << 8) | bytes[i--];
  result = (result << 8) | bytes[i--];
  result = (result << 8) | bytes[i--];
  result = (result << 8) | bytes[i--];
  cursor.value += 4;

  return result;
}

// helper function to parse an unsigned uint16
function decode_uint16(bytes, cursor) {
  var result = 0;
  var i = cursor.value + 1;
  result = bytes[i--];
  result = result * 256 + bytes[i--];
  cursor.value += 2;

  return result;
}

// helper function to parse a signed int16
function decode_int16(bytes, cursor) {
  var result = 0;
  var i = cursor.value + 1;
  if (bytes[i] & 0x80) {
    result = 0xFFFF;
  }
  result = (result << 8) | bytes[i--];
  result = (result << 8) | bytes[i--];
  cursor.value += 2;

  return result;
}

// helper function to parse an unsigned int8
function decode_uint8(bytes, cursor) {
  var result = bytes[cursor.value];
  cursor.value += 1;

  return result;
}

// helper function to parse an unsigned int8
function decode_int8(bytes, cursor) {
  var result = 0;
  var i = cursor.value;
  if (bytes[i] & 0x80) {
    result = 0xFFFFFF;
  }
  result = (result << 8) | bytes[i--];
  cursor.value += 1;

  return result;
}

function uint8_to_hex(d) {
  return ('0' + (Number(d).toString(16))).slice(-2);
}

function uint16_to_hex(d) {
  return ('000' + (Number(d).toString(16))).slice(-4);
}

function uint32_to_hex(d) {
  return ('0000000' + (Number(d).toString(16))).slice(-8);
}

function get_valve_state(bytes, cursor) {
  var valve = {};

  const d = decode_uint8(bytes, cursor);
  valve.state = d & 0x03;
  valve.reason_id = (d >> 2) & 0x03;

  return valve;
}

function message_types_lookup_v2(type_id) {
  const type_names = ["boot",
                "calibrated",
                "not_calibrated",
                "application_event",
                "device_status",
                "device_configuration",
                "application_configuration"];
  if (type_id < type_names.length) {
    return type_names[type_id];
  } else {
    return "unknown";
  }
}

function device_types_lookup_v2(type_id) {
  const type_names = ["", // reserved
                "ts",
                "vs-qt",
                "vs-mt"];
  if (type_id < type_names.length) {
    return type_names[type_id];
  } else {
    return "unknown";
  }
}

function not_calibrated_reasons_lookup_v2(reason_id) {
  switch (reason_id) {
    case 0:
      return "Removed calibration";
    case 1:
      return "Timeout; measure calibration";
    case 2:
      return "Timeout; wait for open";
    case 3:
      return "Timeout; verify open";
    case 4:
      return "Expected open, measured closed";
    case 5:
      return "Timeout; wait for closed";
    case 6:
      return "Timeout; verify closed";
    case 7:
      return "Expected closed, measured open";

    default:
      return "unknown"
  }
}

function state_lookup_v2(state_id) {
  switch (state_id)
  {
    case 0:
      return "open";
    case 1:
      return "closed";
    default:
      return "error";
    }
}

function detection_method_lookup_v2(method_id) {
  switch (method_id)
  {
    case 0:
      return "angle";
    case 1:
      return "magnitude";
    default:
      return "unknown";
    }
}

function trigger_lookup_v2(trigger_id) {
  switch (trigger_id)
  {
    case 0:
      return "state_transition";
    case 1:
      return "value_change";
    case 2:
      return "timer";
    default:
      return "unknown";
    }
}

Object.prototype.in = function() {
    for(var i=0; i<arguments.length; i++)
       if(arguments[i] == this) return true;
    return false;
}

// Protocol v2 only

// if (typeof module !== 'undefined') {
//   // Only needed for nodejs
//   module.exports = {
//     Encode: Encode,
//     Encoder: Encoder,
//     EncodeDeviceConfig: EncodeDeviceConfig, // used by generate_config_bin.py
//     EncodeVsMtAppConfig: EncodeVsMtAppConfig, // used by generate_config_bin.py
//     encode_header: encode_header,
//     encode_device_config: encode_device_config,
//     encode_vsmt_app_config: encode_vsmt_app_config,
//     encode_config_switch_bitmask: encode_config_switch_bitmask,
//     encode_device_config_switch: encode_device_config_switch,
//     encode_device_type: encode_device_type,
//     encode_uint32: encode_uint32,
//     encode_int32: encode_int32,
//     encode_uint16: encode_uint16,
//     encode_int16: encode_int16,
//     encode_uint8: encode_uint8,
//     encode_int8: encode_int8,
//     calc_crc: calc_crc,
//   };
// }

var mask_byte = 255;

function Encode(fPort, obj) { // Used for ChirpStack (aka LoRa Network Server)
  // Encode downlink messages sent as
  // object to an array or buffer of bytes.
  var bytes = [];

  switch (obj.header.protocol_version) {
    case 2: {
      switch (obj.header.message_type) {
        case "device_configuration": { // Device message
          encode_header(bytes, 5, obj.header.protocol_version);
          encode_device_config(bytes, obj);
          encode_uint16(bytes, calc_crc(bytes.slice(1)));

          break;
        }
        case "application_configuration": { // Application message
          switch (obj.device_type) {
            case "vs-mt":
              encode_header(bytes, 6, obj.header.protocol_version);
              encode_vsmt_app_config(bytes, obj);
              encode_uint16(bytes, calc_crc(bytes.slice(1)));

              break;
            default:
              throw "Invalid device type!";
              break;
          }
          break;
        }
        break;
        default:
          throw "Invalid message type!"
          break;
      }
      break;
    }
    default:
      throw "Protocol version is not suppported!"
      break;
  }

  return bytes;
}

function Encoder(obj, fPort) { // Used for The Things Network server
  return Encode(fPort, obj);
}

/**
 * Device configuration encoder
 */
function EncodeDeviceConfig(obj) {
  var bytes = [];
  encode_device_config(bytes, obj);

  return bytes;
}

function encode_device_config(bytes, obj) {
  encode_device_config_switch(bytes, obj.switch_mask);
  encode_uint8(bytes, obj.communication_max_retries);             // Unit: -
  encode_uint8(bytes, obj.unconfirmed_repeat);                    // Unit: -
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

/**
 * VSMT application encoder
 */
function EncodeVsMtAppConfig(obj) {
  var bytes = [];
  encode_vsmt_app_config(bytes, obj);

  return bytes;
}

function encode_vsmt_app_config(bytes, obj) {
  encode_device_type(bytes, obj.device_type);
  encode_uint8(bytes, obj.magnet_measurement_interval_seconds); // Unit: s
  encode_int8(bytes, obj.calibration_offset * 10.0);            // Unit: 0.1'
  encode_uint8(bytes, obj.angle_threshold * 10.0);              // Unit: 0.1'
  encode_uint8(bytes, obj.angle_hysteresis * 10.0);             // Unit: 0.1'
  encode_uint8(bytes, obj.angle_stability_threshold * 10.0);    // Unit: 0.1'
  encode_uint8(bytes, obj.angle_stability_window);              // Unit: samples
  encode_uint8(bytes, obj.angle_change_trigger * 10.0);         // Unit: 0.1'
  encode_uint8(bytes, obj.magnitude_threshold);                 // Unit: 1%
  encode_uint16(bytes, obj.periodic_event_message_interval_seconds / 60.0);  // Unit: minutes
}

/* Helper Functions *********************************************************/

// helper function to encode the header
function encode_header(bytes, message_type_id, protocol_version) {
  var b = 0;
  b += (message_type_id & 0x0F);
  b += (protocol_version & 0x0F) << 4;

  bytes.push(b);
}

// helper function to encode device type
function encode_device_type(bytes, type) {
  switch (type){
    case 'ts':
      encode_uint8(bytes, 1);
      break;
    case 'vs-qt':
      encode_uint8(bytes, 2);
      break;
    case 'vs-mt':
      encode_uint8(bytes, 3);
      break;
    default:
      encode_uint8(bytes, 0);
      break;
  }
}

// helper function to encode the config_switch_bitmask
function encode_config_switch_bitmask(bytes, bitmask) {
  var config_switch_bitmask = 0;
  if (bitmask.use_confirmed_changed_message) {
    config_switch_bitmask |= 1 << 0;
  }
  if (bitmask.turn_on_debug_data) {
    config_switch_bitmask |= 1 << 1;
  }
  if (bitmask.activate_magnetometer_stability_test_on_X_axis) {
    config_switch_bitmask |= 1 << 2;
  }
  if (bitmask.activate_magnetometer_stability_test_on_Y_axis) {
    config_switch_bitmask |= 1 << 3;
  }
  if (bitmask.activate_magnetometer_stability_test_on_Z_axis) {
    config_switch_bitmask |= 1 << 4;
  }
  bytes.push(config_switch_bitmask & mask_byte);
}

// helper function to encode the device switch_mask
function encode_device_config_switch(bytes, bitmask) {
  var config_switch_mask = 0;
  if (bitmask.enable_confirmed_event_message) {
    config_switch_mask |= 1 << 0;
  }
  if (bitmask.enable_debug_data) {
    config_switch_mask |= 1 << 1;
  }
  bytes.push(config_switch_mask & mask_byte);
}

// helper function to encode an uint32
function encode_uint32(bytes, value) {
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
  bytes.push(value & mask_byte);
  bytes.push((value >> 8) & mask_byte);
}

// helper function to encode an int16
function encode_int16(bytes, value) {
  encode_uint16(bytes, value);
}

// helper function to encode an uint8
function encode_uint8(bytes, value) {
  bytes.push(value & mask_byte);
}

// helper function to encode an int8
function encode_int8(bytes, value) {
  encode_uint8(bytes, value);
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

exports.Decode = Decode;