/**
 * Filename          : decoder_vb_doc-F_rev-5.js
 * Latest commit     : b4ca8f1f
 * Protocol document : F
 *
 * Release History
 *
 * 2021-04-14 revision 0
 * - initial version
 *
 * 2021-03-05 revision 1
 * - using scientific notation for sensor data scale
 *
 * 2021-05-14 revision 2
 * - made it compatible with v1 and v2 (merged in protocol v1)
 * - added DecodeHexString to directly decode from HEX string
 *
 * 2021-07-15 revision 3
 * - Verify message length with expected_length before parsing
 *
 * 2021-10-27 revision 4
 * - Fixed range check of start_frequency
 *
 * 2022-10-19 revision 5
 * - Protocol V3
 * -- Updated Boot, Device status, and Sensor event messages to support normal, extended, debug formats.
 * -- Removed message_type from header.
 * -- Added configUpdateAns.
 * -- Separated the sensor configuration into Sensor configuration and sensor conditions configuration
 * -- Separated base configuration into base configuration and Region configuration
 * -- Moved protocol_version into message body
 * -- Ignore null payload OR MAC uplink
 * -- Added entry point for ThingPark
 *
 * YYYY-MM-DD revision X
 * -
 *
 */

 if (typeof module !== 'undefined') {
  // Only needed for nodejs
  module.exports = {
    decodeUplink: decodeUplink,
    Decode: Decode,
    Decoder: Decoder,
    DecodeHexString: DecodeHexString,
    DecodeRebootInfo: DecodeRebootInfo,
    decode_float: decode_float,
    decode_uint32: decode_uint32,
    decode_int32: decode_int32,
    decode_uint16: decode_uint16,
    decode_int16: decode_int16,
    decode_uint8: decode_uint8,
    decode_int8: decode_int8,
    decode_device_id: decode_device_id,
    decode_reboot_info: decode_reboot_info,
    decode_battery_voltage: decode_battery_voltage,
    decode_sensor_data_config: decode_sensor_data_config,
    from_hex_string: from_hex_string,
    decode_velocity_v3: decode_velocity_v3,
    decode_acceleration_v3: decode_acceleration_v3,
    decode_temperature_v3: decode_temperature_v3,
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
    encode_lorawan_fsb_mask_v3: encode_lorawan_fsb_mask_v3,
    encode_vb_sensor_config_v3: encode_vb_sensor_config_v3,
    encode_vb_sensor_conditions_configuration_v3: encode_vb_sensor_conditions_configuration_v3,
    encode_event_condition_v3: encode_event_condition_v3,
    encode_sensor_config_switch_mask_v3: encode_sensor_config_switch_mask_v3,
  };
}

/**
 * Decoder for ThingPark network server
 */
function decodeUplink(input) {
  return Decode(input.fPort, input.bytes)
}

/**
 * Decoder for Chirpstack (loraserver) network server
 *
 * Decode an uplink message from a buffer
 * (array) of bytes to an object of fields.
 */
function Decode(fPort, bytes) { // Used for ChirpStack (aka LoRa Network Server)

  // Protocol Versions
  var PROTOCOL_VERSION_V1 = 1;
  var PROTOCOL_VERSION_V2 = 2;
  var PROTOCOL_VERSION_V3 = 3;

  // Message Ports
  var FPORT_BOOT = 1;
  var FPORT_DEVICE_STATUS = 2;
  var FPORT_SENSOR_EVENT = 3;
  var FPORT_SENSOR_DATA = 4;
  var FPORT_ACTIVATION = 5;
  var FPORT_DEACTIVATION = 6;
  var FPORT_CONFIG_UPDATE = 7;
  var FPORT_CALIBRATION_UPDATE = 8;
  var FPORT_DEFAULT_APP = 15;

  // Message headers strings
  var STR_BOOT = "boot";
  var STR_ACTIVATED = "activated";
  var STR_DEACTIVATED = "deactivated";
  var STR_SENSOR_EVENT = "sensor_event";
  var STR_DEVICE_STATUS = "device_status";
  var STR_SENSOR_DATA = "sensor_data";

  var decoded = {};
  var cursor = {};   // keeping track of which byte to process.
  cursor.value = 0;  // Start from 0

  if (fPort == 0 || bytes.length == 0) {
    // Ignore null payload OR MAC uplink
    return decoded;
  }

  var protocol_version = get_protocol_version(bytes);

  switch (protocol_version) {
    case PROTOCOL_VERSION_V1:
    case PROTOCOL_VERSION_V2:
      decoded.header = decode_header(bytes, cursor);
      if (fPort == FPORT_DEFAULT_APP) {
        switch (decoded.header.message_type) {
          case STR_BOOT:
            decoded.boot = decode_boot_msg(bytes, cursor);
            break;

          case STR_ACTIVATED:
            decoded.activated = decode_activated_msg(bytes, cursor);
            break;

          case STR_DEACTIVATED:
            decoded.deactivated = decode_deactivated_msg(bytes, cursor);
            break;

          case STR_SENSOR_EVENT:
            decoded.sensor_event = decode_sensor_event_msg(bytes, cursor);
            break;

          case STR_DEVICE_STATUS:
            decoded.device_status = decode_device_status_msg(bytes, cursor);
            break;

          case STR_SENSOR_DATA:
            decoded.sensor_data = decode_sensor_data_msg(bytes, cursor, decoded.header.protocol_version);
            break;

          default:
            throw "Invalid message type!";
        }
      }

    case PROTOCOL_VERSION_V3:
      // Protocol V3 reserves each fPort for different purpose
      switch (fPort) {
        case FPORT_BOOT:
          header = decode_header_v3(bytes, cursor);
          decoded.boot = decode_boot_msg_v3(bytes, cursor);
          decoded.boot.protocol_version = header.protocol_version;
          break;

        case FPORT_DEVICE_STATUS:
          header = decode_header_v3(bytes, cursor);
          decoded.device_status = decode_device_status_msg_v3(bytes, cursor);
          decoded.device_status.protocol_version = header.protocol_version;
          break;

        case FPORT_SENSOR_EVENT:
          header = decode_header_v3(bytes, cursor);
          decoded.sensor_event = decode_sensor_event_msg_v3(bytes, cursor);
          decoded.sensor_event.protocol_version = header.protocol_version;
          break;

        case FPORT_SENSOR_DATA:
          header = decode_header_v3(bytes, cursor);
          decoded.sensor_data = decode_sensor_data_msg(bytes, cursor, header.protocol_version);
          decoded.sensor_data.protocol_version = header.protocol_version;
          break;

        case FPORT_ACTIVATION:
          header = decode_header_v3(bytes, cursor);
          decoded.activated = decode_activated_msg_v3(bytes, cursor);
          decoded.activated.protocol_version = header.protocol_version;
          break;

        case FPORT_DEACTIVATION:
          header = decode_header_v3(bytes, cursor);
          decoded.deactivated = decode_deactivated_msg(bytes, cursor);
          decoded.deactivated.protocol_version = header.protocol_version;
          break;

        case FPORT_CONFIG_UPDATE:
          decoded.config_update_ans = decode_config_update_ans_msg(bytes, cursor);
          break;

        case FPORT_CALIBRATION_UPDATE:
          // TODO: Implement this
          break;

        default:
          // NOTE: It could be unsupported device management message so there should be no assertion!
          break;
      }
      break;

    default:
      throw "Unsupported protocol version!";
  };

  return decoded;
}


/**
 * Decoder for reboot payload
 *
 */
function DecodeRebootInfo(reboot_type, bytes) {
  var cursor = {};   // keeping track of which byte to process.
  cursor.value = 0;  // skip header that has been checked

  return decode_reboot_info(reboot_type, bytes, cursor);
}

/**
 * Decoder for The Things Network network server
 */
function Decoder(obj, fPort) {
  return Decode(fPort, obj);
}

/**
 * Decoder for plain HEX string
 */
function DecodeHexString(fPort, hex_string) {
  return Decode(fPort, from_hex_string(hex_string));
}

/******************
 * Helper functions
 */

/**
  * Decode header
  */
function decode_header(bytes, cursor) {
  var header = {};
  var data = decode_uint8(bytes, cursor);

  header.protocol_version = data >> 4;
  header.message_type = message_type_lookup(data & 0x0F);

  return header;
}

/**
  * Decode header V3
  */
function decode_header_v3(bytes, cursor) {
  var header = {};
  var data = decode_uint8(bytes, cursor);

  header.protocol_version = data >> 4;

  return header;
}

/**
  * Get protocol version without increasing cursor
  */
function get_protocol_version(bytes) {
  var cursor = {};
  cursor.value = 0;

  var data = decode_uint8(bytes, cursor);

  var protocol_version = data >> 4;

  return protocol_version;
}

/**
  * Decode config header
  */
function decode_config_header(bytes, cursor) {
  var header = {};
  var data = decode_uint8(bytes, cursor);

  header.protocol_version = data >> 4;
  header.config_type = config_type_lookup(data & 0x0F);

  return header;
}

// helper function to convert a ASCII HEX string to a byte string
function from_hex_string(hex_string) {
  if (typeof hex_string != "string") throw new Error("hex_string must be a string");
  if (!hex_string.match(/^[0-9A-F]*$/gi)) throw new Error("hex_string contain only 0-9, A-F characters");
  if (hex_string.length & 0x01 > 0) throw new Error("hex_string length must be a multiple of two");

  var byte_string = [];
  for (i = 0; i < hex_string.length; i += 2) {
    var hex = hex_string.slice(i, i + 2);
    byte_string.push(parseInt(hex, 16));
  }
  return byte_string;
}

// pad zeros on decimal number
function pad(num, size) {
  num = num.toString();
  while (num.length < size) num = "0" + num;
  return num;
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

// helper function to parse device_id
function decode_device_id(bytes, cursor) {
  // bytes[0]
  var prefix = decode_uint8(bytes, cursor).toString();

  // bytes[1..5]
  var serial = pad(decode_uint32(bytes, cursor), 10);

  var device_id = prefix + "-" + serial;

  return device_id;
}

// helper function to parse fft config in sensor_data
function decode_sensor_data_config(bytes, cursor, protocol_version) {
  var PROTOCOL_VERSION_V1 = 1;
  var PROTOCOL_VERSION_V2 = 2;
  var PROTOCOL_VERSION_V3 = 3;

  config = decode_uint32(bytes, cursor);
  var result = {};

  // bits[0..7]
  result.frame_number = config & 0xFF;

  // bits[8..9]
  result.sequence_number = (config >> 8) & 0x03;

  // bits[10..11]
  result.axis = "";
  switch ((config >> 10) & 0x3) {
    case 0:
      result.axis = "x";
      break;
    case 1:
      result.axis = "y";
      break;
    case 2:
      result.axis = "z";
      break;
    default:
      throw "Invalid axis value in sensor data config!";
  }

  // bits[12]
  switch ((config >> 12) & 0x1) {
    case 0:
      result.unit = "velocity";
      break;
    case 1:
    default:
      result.unit = "acceleration";
      break;
  }

  switch (protocol_version) {
    case PROTOCOL_VERSION_V1:
      // bits[13..18]
      result.scale = ((config >> 13) & 0x3F) * 4;
      if (result.scale == 0) {
        throw "Invalid config.scale value!"
      }
      break;

    case PROTOCOL_VERSION_V2:  // Fall through case PROTOCOL_VERSION_V3
    case PROTOCOL_VERSION_V3:
      // bits[13..16]
      var scale_coefficient = ((config >> 13) & 0x0F);
      if (scale_coefficient < 1 || scale_coefficient > 15) {
        throw "Invalid config.scale coefficient value!"
      }
      // bits[17..18]
      var scale_power = ((config >> 17) & 0x03) - 2;
      result.scale = scale_coefficient * Math.pow(10, scale_power);
      break;

    default:
      throw "Unsupported protocol version!";
  }

  // bits[19..31]
  result.start_frequency = config >>> 19;
  if (result.start_frequency < 0 || result.start_frequency > 8191) {
    throw "Invalid start_frequency value in sensor data config!";
  }

  // bytes[5]
  result.spectral_line_frequency = decode_uint8(bytes, cursor);
  if (result.spectral_line_frequency == 0) {
    throw "Invalid spectral_line_frequency value in sensor data config!";
  }


  return result;
}

// helper function to parse reboot_info
function decode_reboot_info(reboot_type, bytes, cursor) {
  var result;

  var reboot_payload = [0, 0, 0, 0, 0, 0, 0, 0];
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
      result = 'none';
      break;

    case 1: // REBOOT_INFO_TYPE_POWER_CYCLE
      result = 'power cycle';
      break;

    case 2: // REBOOT_INFO_TYPE_WDOG
      result = 'swdog (' + String.fromCharCode(
        reboot_payload[0],
        reboot_payload[1],
        reboot_payload[2],
        reboot_payload[3]).replace(/[^\x20-\x7E]/g, '') + ')';

      break;

    case 3: // REBOOT_INFO_TYPE_ASSERT
      var payloadCursor = {}; // keeping track of which byte to process.
      payloadCursor.value = 4; // skip caller address
      actualValue = decode_int32(reboot_payload, payloadCursor);
      result = 'assert (' +
        'caller: 0x' +
        uint8_to_hex(reboot_payload[3]) +
        uint8_to_hex(reboot_payload[2]) +
        uint8_to_hex(reboot_payload[1]) +
        uint8_to_hex(reboot_payload[0]) +
        '; value: ' + actualValue.toString() + ')';
      break;

    case 4: // REBOOT_INFO_TYPE_APPLICATION_REASON
      result = 'application (0x' +
        uint8_to_hex(reboot_payload[3]) +
        uint8_to_hex(reboot_payload[2]) +
        uint8_to_hex(reboot_payload[1]) +
        uint8_to_hex(reboot_payload[0]) + ')';
      break;

    case 5: // REBOOT_INFO_TYPE_SYSTEM_ERROR
      result = 'system (error: 0x' +
        uint8_to_hex(reboot_payload[3]) +
        uint8_to_hex(reboot_payload[2]) +
        uint8_to_hex(reboot_payload[1]) +
        uint8_to_hex(reboot_payload[0]) +
        '; caller: 0x' +
        uint8_to_hex(reboot_payload[7]) +
        uint8_to_hex(reboot_payload[6]) +
        uint8_to_hex(reboot_payload[5]) +
        uint8_to_hex(reboot_payload[4]) + ')';
      break;

    default:
      result = 'unknown (' +
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

  return result;
}

/**
  * Decode battery voltage based on protocol version 3
  *
  * Raw value is between 0 - 255
  * 0 represent 2 V, while 255 represent 4 V
  */
function decode_battery_voltage(bytes, cursor) {
  var raw = decode_uint8(bytes, cursor);

  var offset = 2; // Lowest voltage is 2 V
  var scale = 2 / 255;

  var voltage = raw * scale + offset;

  return voltage;
}

function uint8_to_hex(d) {
  return ('0' + (Number(d).toString(16).toUpperCase())).slice(-2);
}

function uint16_to_hex(d) {
  return ('000' + (Number(d).toString(16).toUpperCase())).slice(-4);
}

function uint32_to_hex(d) {
  return ('0000000' + (Number(d).toString(16).toUpperCase())).slice(-8);
}

function message_type_lookup(type_id) {
  type_names = ["boot",
    "activated",
    "deactivated",
    "sensor_event",
    "device_status",
    "base_configuration",
    "sensor_configuration",
    "sensor_data_configuration",
    "sensor_data"];
  if (type_id < type_names.length) {
    return type_names[type_id];
  } else {
    return "unknown";
  }
}

function config_type_lookup(type_id) {
  type_names = [
    "base",
    "region",
    "reserved",
    "sensor",
    "sensor_data",
    "sensor_conditions"];
  if (type_id < type_names.length) {
    return type_names[type_id];
  } else {
    return "unknown";
  }
}

function device_types_lookup(type_id) {
  type_names = ["", // reserved
    "ts",
    "vs-qt",
    "vs-mt",
    "tt",
    "ld",
    "vb"];
  if (type_id < type_names.length) {
    return type_names[type_id];
  } else {
    return "unknown";
  }
}

function trigger_lookup(trigger_id) {
  switch (trigger_id) {
    case 0:
      return "timer";
    case 1:
      return "button";
    case 2:
      return "condition_0";
    case 3:
      return "condition_1";
    case 4:
      return "condition_2";
    case 5:
      return "condition_3";
    case 6:
      return "condition_4";
    case 7:
      return "condition_5";
    default:
      return "unknown";
  }
}

function rssi_lookup(rssi) {
  switch (rssi) {
    case 0:
      return "0..-79";
    case 1:
      return "-80..-99";
    case 2:
      return "-100..-129";
    case 3:
      return "<-129";
    default:
      return "unknown";
  }
}

function reboot_lookup_major(reboot_reason) {
  major_reboot_reason = reboot_reason & 0x0F;
  switch (major_reboot_reason) {
    case 0:
      return "none";
    case 1:
      return "config update";
    case 2:
      return "firmware update";
    case 3:
      return "button reset"
    case 4:
      return "power";
    case 5:
      return "communication failure";
    default:
      return "system failure";
  }
}

function reboot_lookup_minor(reboot_reason) {
  major_reboot_reason = reboot_reason & 0x0F;
  minor_reboot_reason = (reboot_reason >> 4) & 0x0F;

  switch (major_reboot_reason) {
    case 0:
      return ""; // No minor reboot reason
    case 1:
      switch (minor_reboot_reason) {
        case 0:
          return "success";
        case 1:
          return "rejected";
        default:
          return "unknown";
      }
    case 2:
      switch (minor_reboot_reason) {
        case 0:
          return "success";
        case 1:
          return "rejected";
        case 2:
          return "error";
        case 3:
          return "in progress";
        default:
          return "unknown";
      }
    case 3:
      return ""; // No minor reboot reason
    case 4:
      switch (minor_reboot_reason) {
        case 0:
          return "black out";
        case 1:
          return "brown out";
        case 2:
          return "power safe state";
        default:
          return "unknown";
      }
    case 5:
      return ""; // No minor reboot reason
    case 6:
      return ""; // No minor reboot reason
    default:
      return "unknown";
  }
}

function lookup_selection(selection) {
  switch (selection) {
    case 0:
      return "extended";
    case 1:
      return "min_only";
    case 2:
      return "max_only";
    case 3:
      return "avg_only";
    default:
      return "unknown";
  }
}

function deactivation_reason_lookup(deactivation_id) {
  switch (deactivation_id) {
    case 0:
      return "user_triggered";
    case 1:
      return "activation_user_timeout";
    case 2:
      return "activation_sensor_comm_fail";
    case 3:
      return "activation_sensor_meas_fail";  // VB does not have it
    default:
      return "unknown";
  }
}

Object.prototype.in = function() {
  for (var i = 0; i < arguments.length; i++)
    if (arguments[i] == this) return true;
  return false;
}

/***************************
 * Message decoder functions
 */

function decode_boot_msg(bytes, cursor) {
  var boot = {};

  var expected_length = 46;
  if (bytes.length != expected_length) {
    throw "Invalid boot message length " + bytes.length + " instead of " + expected_length
  }

  boot.base = {};
  // byte[1]
  var device_type = decode_uint8(bytes, cursor);
  boot.base.device_type = device_types_lookup(device_type);

  // byte[2..5]
  var version_hash = decode_uint32(bytes, cursor);
  boot.base.version_hash = '0x' + uint32_to_hex(version_hash);

  // byte[6..7]
  var config_crc = decode_uint16(bytes, cursor);
  boot.base.config_crc = '0x' + uint16_to_hex(config_crc);

  // byte[8]
  var reset_flags = decode_uint8(bytes, cursor);
  boot.base.reset_flags = '0x' + uint8_to_hex(reset_flags);

  // byte[9]
  boot.base.reboot_counter = decode_uint8(bytes, cursor);

  // byte[10]
  base_reboot_type = decode_uint8(bytes, cursor);

  // byte[11..18]
  boot.base.reboot_info = decode_reboot_info(base_reboot_type, bytes, cursor);

  // byte[19]
  var bist = decode_uint8(bytes, cursor);
  boot.base.bist = '0x' + uint8_to_hex(bist);

  boot.sensor = {};
  // byte[20]
  var device_type = decode_uint8(bytes, cursor);
  boot.sensor.device_type = device_types_lookup(device_type);

  // byte[21..25]
  boot.sensor.device_id = decode_device_id(bytes, cursor);

  // byte[26..29]
  var version_hash = decode_uint32(bytes, cursor);
  boot.sensor.version_hash = '0x' + uint32_to_hex(version_hash);

  // byte[30..31]
  var config_crc = decode_uint16(bytes, cursor);
  boot.sensor.config_crc = '0x' + uint16_to_hex(config_crc);

  // byte[32..33]
  var data_config_crc = decode_uint16(bytes, cursor);
  boot.sensor.data_config_crc = '0x' + uint16_to_hex(data_config_crc);

  // byte[34]
  var reset_flags = decode_uint8(bytes, cursor);
  boot.sensor.reset_flags = '0x' + uint8_to_hex(reset_flags);

  // byte[35]
  boot.sensor.reboot_counter = decode_uint8(bytes, cursor);

  // byte[36]
  sensor_reboot_type = decode_uint8(bytes, cursor);

  // byte[37..44]
  boot.sensor.reboot_info = decode_reboot_info(sensor_reboot_type, bytes, cursor);

  // byte[45]
  var bist = decode_uint8(bytes, cursor);
  boot.sensor.bist = '0x' + uint8_to_hex(bist);

  return boot;
}

function decode_boot_msg_v3(bytes, cursor) {
  var expected_length_normal = 3;
  var expected_length_debug = 35;
  if (bytes.length != expected_length_normal && bytes.length != expected_length_debug) {
    throw "Invalid boot message length " + bytes.length + " instead of " + expected_length_normal + " or " + expected_length_debug;
  }

  var boot = {};

  boot.base = {};
  boot.sensor = {};
  // byte[1]
  base_reboot_reason = decode_uint8(bytes, cursor);
  boot.base.reboot_reason = {};
  boot.base.reboot_reason.major = reboot_lookup_major(base_reboot_reason);
  boot.base.reboot_reason.minor = reboot_lookup_minor(base_reboot_reason);

  // byte[2]
  sensor_reboot_reason = decode_uint8(bytes, cursor);
  boot.sensor.reboot_reason = {};
  boot.sensor.reboot_reason.major = reboot_lookup_major(sensor_reboot_reason);
  boot.sensor.reboot_reason.minor = reboot_lookup_minor(sensor_reboot_reason);

  // debug data
  if (bytes.length == expected_length_debug) {
    boot.debug = '0x'
    for (var i = cursor.value; i < bytes.length; i++) {
      boot.debug = boot.debug + uint8_to_hex(bytes[i]);
    }
  }

  return boot;
}

function decode_activated_msg(bytes, cursor) {
  var activated = {};

  var expected_length = 7;
  if (bytes.length != expected_length) {
    throw "Invalid activated message length " + bytes.length + " instead of " + expected_length
  }

  activated.sensor = {};

  // byte[1]
  var device_type = decode_uint8(bytes, cursor);
  activated.sensor.device_type = device_types_lookup(device_type);

  // byte[2..6]
  activated.sensor.device_id = decode_device_id(bytes, cursor);

  return activated;
}

function decode_activated_msg_v3(bytes, cursor) {
  var activated = {};

  var expected_length = 8;
  if (bytes.length != expected_length) {
    throw "Invalid activated message length " + bytes.length + " instead of " + expected_length
  }

  activated.sensor = {};

  // byte[1]
  var device_type = decode_uint8(bytes, cursor);
  activated.sensor.device_type = device_types_lookup(device_type);

  // byte[2..6]
  activated.sensor.device_id = decode_device_id(bytes, cursor);

  activated.base = {};

  // byte[7]
  device_type = decode_uint8(bytes, cursor);
  activated.base.device_type = device_types_lookup(device_type);

  return activated;
}

function decode_deactivated_msg(bytes, cursor) {
  var deactivated = {};

  var expected_length = 3;
  if (bytes.length != expected_length) {
    throw "Invalid deactivated message length " + bytes.length + " instead of " + expected_length
  }

  // byte[1]
  var reason = decode_uint8(bytes, cursor);
  deactivated.reason = deactivation_reason_lookup(reason);

  // byte[2]
  var reason_length = decode_uint8(bytes, cursor);

  if (reason_length != 0) {
    throw "Unsupported deactivated reason length"
  }

  return deactivated;
}

function decode_sensor_event_msg(bytes, cursor) {
  var sensor_event = {};

  var expected_length = 45;
  if (bytes.length != expected_length) {
    throw "Invalid sensor_event message length " + bytes.length + " instead of " + expected_length
  }

  // byte[1]
  trigger = decode_uint8(bytes, cursor);
  sensor_event.trigger = trigger_lookup(trigger);

  sensor_event.rms_velocity = {};

  // byte[2..7]
  sensor_event.rms_velocity.x = {};
  sensor_event.rms_velocity.x.min = decode_uint16(bytes, cursor) / 100;
  sensor_event.rms_velocity.x.max = decode_uint16(bytes, cursor) / 100;
  sensor_event.rms_velocity.x.avg = decode_uint16(bytes, cursor) / 100;

  // byte[8..13]
  sensor_event.rms_velocity.y = {};
  sensor_event.rms_velocity.y.min = decode_uint16(bytes, cursor) / 100;
  sensor_event.rms_velocity.y.max = decode_uint16(bytes, cursor) / 100;
  sensor_event.rms_velocity.y.avg = decode_uint16(bytes, cursor) / 100;

  // byte[14..19]
  sensor_event.rms_velocity.z = {};
  sensor_event.rms_velocity.z.min = decode_uint16(bytes, cursor) / 100;
  sensor_event.rms_velocity.z.max = decode_uint16(bytes, cursor) / 100;
  sensor_event.rms_velocity.z.avg = decode_uint16(bytes, cursor) / 100;

  sensor_event.acceleration = {};

  // byte[20..25]
  sensor_event.acceleration.x = {};
  sensor_event.acceleration.x.min = decode_int16(bytes, cursor) / 100;
  sensor_event.acceleration.x.max = decode_int16(bytes, cursor) / 100;
  sensor_event.acceleration.x.avg = decode_int16(bytes, cursor) / 100;

  // byte[26..31]
  sensor_event.acceleration.y = {};
  sensor_event.acceleration.y.min = decode_int16(bytes, cursor) / 100;
  sensor_event.acceleration.y.max = decode_int16(bytes, cursor) / 100;
  sensor_event.acceleration.y.avg = decode_int16(bytes, cursor) / 100;

  // byte[32..37]
  sensor_event.acceleration.z = {};
  sensor_event.acceleration.z.min = decode_int16(bytes, cursor) / 100;
  sensor_event.acceleration.z.max = decode_int16(bytes, cursor) / 100;
  sensor_event.acceleration.z.avg = decode_int16(bytes, cursor) / 100;

  // byte[38..43]
  sensor_event.temperature = {};
  sensor_event.temperature.min = decode_int16(bytes, cursor) / 100;
  sensor_event.temperature.max = decode_int16(bytes, cursor) / 100;
  sensor_event.temperature.avg = decode_int16(bytes, cursor) / 100;

  // byte[44]
  var conditions = decode_uint8(bytes, cursor);
  sensor_event.condition_0 = (conditions & 1);
  sensor_event.condition_1 = ((conditions >> 1) & 1);
  sensor_event.condition_2 = ((conditions >> 2) & 1);
  sensor_event.condition_3 = ((conditions >> 3) & 1);
  sensor_event.condition_4 = ((conditions >> 4) & 1);
  sensor_event.condition_5 = ((conditions >> 5) & 1);

  return sensor_event;
}

function decode_sensor_event_msg_v3(bytes, curser) {
  var expected_length_normal = 11;
  var expected_length_extended = 45;
  if (bytes.length == expected_length_normal) {
    return decode_sensor_event_msg_normal(bytes, curser);
  }
  else if (bytes.length == expected_length_extended) {
    return decode_sensor_event_msg_extended(bytes, curser);
  }
  else {
    throw "Invalid sensor_event message length " + bytes.length + " instead of " + expected_length_normal + " or " + expected_length_extended;
  }
}

function decode_sensor_event_msg_normal(bytes, cursor) {
  var sensor_event = {};

  // byte[1]
  selection = decode_uint8(bytes, cursor);

  sensor_event.selection = lookup_selection(selection);
  if (sensor_event.selection == "extended") {
    throw "Mismatch between extended bit flag and message length!";
  }

  // byte[2]
  var conditions = decode_uint8(bytes, cursor);
  sensor_event.condition_0 = (conditions & 1);
  sensor_event.condition_1 = ((conditions >> 1) & 1);
  sensor_event.condition_2 = ((conditions >> 2) & 1);
  sensor_event.condition_3 = ((conditions >> 3) & 1);
  sensor_event.condition_4 = ((conditions >> 4) & 1);
  sensor_event.condition_5 = ((conditions >> 5) & 1);

  sensor_event.trigger = lookup_trigger((conditions >> 6) & 3);

  sensor_event.rms_velocity = {};

  // byte[3,4]
  sensor_event.rms_velocity.x = decode_uint16(bytes, cursor) / 100;

  // byte[5,6]
  sensor_event.rms_velocity.y = decode_uint16(bytes, cursor) / 100;

  // byte[7,8]
  sensor_event.rms_velocity.z = decode_uint16(bytes, cursor) / 100;

  // byte[9,10]
  sensor_event.temperature = {};
  sensor_event.temperature = decode_int16(bytes, cursor) / 100;

  return sensor_event;
}

function decode_sensor_event_msg_extended(bytes, cursor) {
  var sensor_event = {};

  // byte[1]
  selection = decode_uint8(bytes, cursor);

  sensor_event.selection = lookup_selection(selection);
  if (sensor_event.selection != "extended") {
    throw "Mismatch between extended bit flag and message length!";
  }

  // byte[2]
  var conditions = decode_uint8(bytes, cursor);
  sensor_event.condition_0 = (conditions & 1);
  sensor_event.condition_1 = ((conditions >> 1) & 1);
  sensor_event.condition_2 = ((conditions >> 2) & 1);
  sensor_event.condition_3 = ((conditions >> 3) & 1);
  sensor_event.condition_4 = ((conditions >> 4) & 1);
  sensor_event.condition_5 = ((conditions >> 5) & 1);

  sensor_event.trigger = lookup_trigger((conditions >> 6) & 3);

  sensor_event.rms_velocity = {};

  // byte[2..7]
  sensor_event.rms_velocity.x = {};
  sensor_event.rms_velocity.x.min = decode_velocity_v3(bytes, cursor);
  sensor_event.rms_velocity.x.max = decode_velocity_v3(bytes, cursor);
  sensor_event.rms_velocity.x.avg = decode_velocity_v3(bytes, cursor);

  // byte[8..13]
  sensor_event.rms_velocity.y = {};
  sensor_event.rms_velocity.y.min = decode_velocity_v3(bytes, cursor);
  sensor_event.rms_velocity.y.max = decode_velocity_v3(bytes, cursor);
  sensor_event.rms_velocity.y.avg = decode_velocity_v3(bytes, cursor);

  // byte[14..19]
  sensor_event.rms_velocity.z = {};
  sensor_event.rms_velocity.z.min = decode_velocity_v3(bytes, cursor);
  sensor_event.rms_velocity.z.max = decode_velocity_v3(bytes, cursor);
  sensor_event.rms_velocity.z.avg = decode_velocity_v3(bytes, cursor);

  sensor_event.acceleration = {};

  // byte[20..25]
  sensor_event.acceleration.x = {};
  sensor_event.acceleration.x.min = decode_acceleration_v3(bytes, cursor);
  sensor_event.acceleration.x.max = decode_acceleration_v3(bytes, cursor);
  sensor_event.acceleration.x.avg = decode_acceleration_v3(bytes, cursor);

  // byte[26..31]
  sensor_event.acceleration.y = {};
  sensor_event.acceleration.y.min = decode_acceleration_v3(bytes, cursor);
  sensor_event.acceleration.y.max = decode_acceleration_v3(bytes, cursor);
  sensor_event.acceleration.y.avg = decode_acceleration_v3(bytes, cursor);

  // byte[32..37]
  sensor_event.acceleration.z = {};
  sensor_event.acceleration.z.min = decode_acceleration_v3(bytes, cursor);
  sensor_event.acceleration.z.max = decode_acceleration_v3(bytes, cursor);
  sensor_event.acceleration.z.avg = decode_acceleration_v3(bytes, cursor);

  // byte[38..43]
  sensor_event.temperature = {};
  sensor_event.temperature.min = decode_acceleration_v3(bytes, cursor);
  sensor_event.temperature.max = decode_acceleration_v3(bytes, cursor);
  sensor_event.temperature.avg = decode_acceleration_v3(bytes, cursor);

  return sensor_event;
}

function decode_velocity_v3(bytes, cursor) {
  return decode_uint16(bytes, cursor) / 100;
}

function decode_acceleration_v3(bytes, cursor) {
  return decode_int16(bytes, cursor) / 100;
}

function decode_temperature_v3(bytes, cursor) {
  return decode_int16(bytes, cursor) / 100;
}


function decode_device_status_msg(bytes, cursor) {
  var device_status = {};

  var expected_length = 24;
  if (bytes.length != expected_length) {
    throw "Invalid device_status message length " + bytes.length + " instead of " + expected_length
  }

  device_status.base = {};
  device_status.sensor = {};

  // byte[1..2]
  var config_crc = decode_uint16(bytes, cursor);
  device_status.base.config_crc = '0x' + uint16_to_hex(config_crc);

  // byte[3..8]
  device_status.base.battery_voltage = {}
  device_status.base.battery_voltage.low = decode_uint16(bytes, cursor) / 1000.0;
  device_status.base.battery_voltage.high = decode_uint16(bytes, cursor) / 1000.0;
  device_status.base.battery_voltage.settle = decode_uint16(bytes, cursor) / 1000.0;

  // byte[9..11]
  device_status.base.temperature = {}
  device_status.base.temperature.min = decode_int8(bytes, cursor);
  device_status.base.temperature.max = decode_int8(bytes, cursor);
  device_status.base.temperature.avg = decode_int8(bytes, cursor);

  // byte[12]
  device_status.base.lvds_error_counter = decode_uint8(bytes, cursor);

  // byte[13..15]
  device_status.base.lora_tx_counter = decode_uint8(bytes, cursor);
  device_status.base.avg_rssi = -decode_uint8(bytes, cursor);
  device_status.base.avg_snr = decode_int8(bytes, cursor);

  // byte[16]
  var bist = decode_uint8(bytes, cursor);
  device_status.base.bist = '0x' + uint8_to_hex(bist);

  // byte[17]
  var device_type = decode_uint8(bytes, cursor);
  device_status.sensor.device_type = device_types_lookup(device_type);

  // byte[18..19]
  var config_crc = decode_uint16(bytes, cursor);
  device_status.sensor.config_crc = '0x' + uint16_to_hex(config_crc);

  // byte[20..21]
  var data_config_crc = decode_uint16(bytes, cursor);
  device_status.sensor.data_config_crc = '0x' + uint16_to_hex(data_config_crc);

  // byte[22]
  device_status.sensor.event_counter = decode_uint8(bytes, cursor);

  // byte[23]
  var bist = decode_uint8(bytes, cursor);
  device_status.sensor.bist = '0x' + uint8_to_hex(bist);

  return device_status;
}

function decode_device_status_msg_v3(bytes, cursor) {
  var expected_length_normal = 9;
  var expected_length_debug = 12;
  if (bytes.length != expected_length_normal && bytes.length != expected_length_debug) {
    throw "Invalid device status message length " + bytes.length + " instead of " + expected_length_normal + " or " + expected_length_debug;
  }

  var device_status = {};

  device_status.base = {};
  device_status.sensor = {};

  // byte[1]
  device_status.base.battery_voltage = decode_battery_voltage(bytes, cursor);

  // byte[2]
  device_status.base.temperature = decode_int8(bytes, cursor);

  // byte[3,4]
  device_status.base.lora_tx_counter = decode_uint16(bytes, cursor);

  // byte[5]
  rssi = decode_uint8(bytes, cursor);
  device_status.base.avg_rssi = rssi_lookup(rssi);

  // byte[6]
  var bist = decode_uint8(bytes, cursor);
  device_status.base.bist = '0x' + uint8_to_hex(bist);

  // byte[7]
  device_status.sensor.event_counter = decode_uint8(bytes, cursor);

  // byte[8]
  var bist = decode_uint8(bytes, cursor);
  device_status.sensor.bist = '0x' + uint8_to_hex(bist);

  // debug data
  if (bytes.length == expected_length_debug) {
    device_status.debug = '0x'
    for (var i = cursor.value; i < bytes.length; i++) {
      device_status.debug = device_status.debug + uint8_to_hex(bytes[i]);
    }
  }

  return device_status;
}

function decode_config_update_ans_msg(bytes, cursor) {
  var expected_length = 6;
  if (bytes.length != expected_length) {
    throw "Invalid config update ans message length " + bytes.length + " instead of " + expected_length;
  }

  var ans = {};

  // NOTE: It does not check protocol_version because sensor can have different protocol_version compared to the base device
  // byte[0]
  ans = decode_config_header(bytes, cursor);

  // byte[1..4]
  tag = decode_uint32(bytes, cursor);
  ans.tag = '0x' + uint32_to_hex(tag);

  // byte[5]
  counter = decode_uint8(bytes, cursor);
  ans.counter = counter & 0x0F;

  return ans;
}


function lookup_trigger(trigger) {
  switch (trigger) {
    case (0):
      return "condition change";
    case (1):
      return "periodic";
    case (2):
      return "button press";
    default:
      return "unknown";
  }
}

function decode_sensor_data_msg(bytes, cursor, protocol_version) {
  var sensor_data = {};

  var expected_length = 46;
  if (bytes.length != expected_length) {
    throw "Invalid sensor_data message length " + bytes.length + " instead of " + expected_length
  }

  // byte[1..5]
  sensor_data.config = decode_sensor_data_config(bytes, cursor, protocol_version);

  // byte[6..45]
  sensor_data.raw = [];
  while (cursor.value < bytes.length) {
    sensor_data.raw[cursor.value - 6] = bytes[cursor.value];

    cursor.value += 1;
  }

  // Process raw data
  sensor_data.frequency = [];
  sensor_data.magnitude = [];

  // convert from bin to Hz
  var binToHzFactor = 1.62762;
  for (i = 0; i < 40; i++) {
    sensor_data.frequency[i] = sensor_data.config.start_frequency * binToHzFactor +
      (sensor_data.config.frame_number * 40 * sensor_data.config.spectral_line_frequency * binToHzFactor) +
      (i * sensor_data.config.spectral_line_frequency * binToHzFactor);
    sensor_data.magnitude[i] = sensor_data.raw[i] * sensor_data.config.scale / 255;
    sensor_data.frequency[i] = sensor_data.frequency[i];
  }

  return sensor_data;
}


/**
 * Filename          : encoder_vb_doc-F_rev-6.js
 * Latest commit     : b4ca8f1f
 * Protocol document : F
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
 * -- Updated lorawan_fsb_mask representation to uint8
 * -- Uses ThingPark as default entry point where fPort is not an input but an output.
 *
 * YYYY-MM-DD revision X
 * -
 *
 */

var mask_byte = 255;

/**
  * Entry point for ThingPark
  */
function encodeDownlink(input) {
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
  * Entry point for Chirpstack v3
  */
function Encode(fPort, obj) {
  return encodeDownlink(obj).bytes;
}

/**
  * Entry point for TTN
  */
function Encoder(obj, fPort) { // Used for The Things Network server
  return Encode(fPort, obj);
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
    payload.frequency_range.rms_velocity,
    payload.frequency_range.peak_acceleration);
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

  // byte[39]
  encode_sci_6(bytes, payload.scale.velocity);

  // byte[40]
  encode_sci_6(bytes, payload.scale.acceleration);
}

function encode_region_config_v3(bytes, payload) {
  if (typeof payload == "undefined") {
    return;
  }

  encode_channel_plan_v3(bytes, payload.channel_plan);
  encode_lorawan_fsb_mask_v3(bytes, payload.lorawan_fsb_mask);
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

// helper function to encode 6 bit scientific notation
function encode_sci_6(bytes, scale) {
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

function encode_lorawan_fsb_mask_v3(bytes, obj) {
  for (idx = 0; idx < 12; idx++) {
    encode_uint8(bytes, obj[idx]);
  }
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
