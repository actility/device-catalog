/**
 * Filename          : decoder_tt_doc-D_rev-4.js
 * Latest commit     : 57c762f2
 * Protocol document : D
 *
 * Release History
 *
 * 2020-09-23 revision 0
 * - initial version
 *
 * 2020-04-02 revision 1
 * - prefix hex values with 0x
 * - made reset_flags and bist
 * - updated assert payload formatting in reboot info
 * - added DecodeHexString to directly decode from HEX string
 *
 * 2021-07-15 revision 2
 * - Add support for protocol version 3, document D
 * - Add status element to application temperature
 * - Use a function to decode application_temperature
 * - Verify message length before parsing
 * - Fixed hexadecimal message decoding
 *
 * 2022-11-10 revision 3
 * - Align configuration name in NEON product
 *   + device -> base
 *   + application -> sensor
 * - Align uplink name in NEON product
 *   + application_event -> sensor_event
 * - Updated TT similar to the changes from PT
 * -- updated the decoder to support the new error codes for PT
 * -- added the user trigger for event msg
 * -- completed the list of message types
 * -- completed the list of devices
 * -- added user trigger
 * -- added bist to the status msg
 * - Protocol V4
 * -- Updated Boot, Device status, and Sensor event messages to support normal, extended, debug formats.
 * -- Removed message_type from header.
 * -- Added configUpdateAns.
 * -- Separated the sensor configuration into Sensor configuration and sensor conditions configuration
 * -- Separated base configuration into base configuration and Region configuration
 * -- Moved protocol_version into message body
 * -- Ignore null payload OR MAC uplink
 * -- Added entry point for ThingPark
 * - Used throw new Error instead of throw
 *
 * 2022-11-15 revision 4
 * - Fixed: false error on decoding extended event message
 * 
 * YYYY-MM-DD revision X
 */

if (typeof module !== 'undefined') {
  // Only needed for nodejs
  module.exports = {
    decodeUplink: decodeUplink,
    Decode: Decode,
    Decoder: Decoder,
    DecodeHexString: DecodeHexString,
    decode_float: decode_float,
    decode_uint32: decode_uint32,
    decode_int32: decode_int32,
    decode_uint16: decode_uint16,
    decode_int16: decode_int16,
    decode_uint8: decode_uint8,
    decode_int8: decode_int8,
    decode_reboot_info: decode_reboot_info,
    decode_sensor_temperature: decode_sensor_temperature,
    from_hex_string: from_hex_string,
    decode_temperature_16bit: decode_temperature_16bit,
    decode_sensor_temperature_v2_v3: decode_sensor_temperature_v2_v3,
    decode_sensor_temperature_v4: decode_sensor_temperature_v4,
    decode_header: decode_header,
    decode_header_v4: decode_header_v4,
    decode_boot_msg_v4: decode_boot_msg_v4,
    reboot_lookup_major: reboot_lookup_major,
    reboot_lookup_minor: reboot_lookup_minor,
    decode_device_status_msg_v4: decode_device_status_msg_v4,
    decode_battery_voltage: decode_battery_voltage,
    rssi_lookup: rssi_lookup,
    decode_config_update_ans_msg: decode_config_update_ans_msg,
    config_type_lookup: config_type_lookup,
    decode_deactivated_msg_v4: decode_deactivated_msg_v4,
    deactivation_reason_lookup: deactivation_reason_lookup,
    decode_activated_msg_v4: decode_activated_msg_v4,
    decode_sensor_event_msg_v4: decode_sensor_event_msg_v4,
    decode_sensor_event_msg_normal: decode_sensor_event_msg_normal,
    decode_sensor_event_msg_extended: decode_sensor_event_msg_extended,
    lookup_selection: lookup_selection,
    decode_sensor_temperature_normal_v4: decode_sensor_temperature_normal_v4,
    encodeDownlink: encodeDownlink,
    Encode: Encode,
    Encoder: Encoder,
    EncodeBaseConfig: EncodeBaseConfig, // used by generate_config_bin.py
    EncodeSensorConfig: EncodeSensorConfig, // used by generate_config_bin.py
    encode_header: encode_header,
    encode_header_v4: encode_header_v4,
    encode_events_mode: encode_events_mode,
    encode_base_config: encode_base_config,
    encode_sensor_config: encode_sensor_config,
    encode_base_config_switch: encode_base_config_switch,
    encode_device_type_v2: encode_device_type_v2,
    encode_device_type_v3: encode_device_type_v3,
    encode_sensor_type: encode_sensor_type,
    encode_uint32: encode_uint32,
    encode_int32: encode_int32,
    encode_uint16: encode_uint16,
    encode_int16: encode_int16,
    encode_uint8: encode_uint8,
    encode_int8: encode_int8,
    calc_crc: calc_crc,
    encode_base_config_v4: encode_base_config_v4,
    encode_base_config_switch_v4: encode_base_config_switch_v4,
    encode_status_msg_delay_interval_v4: encode_status_msg_delay_interval_v4,
    encode_region_config_v4: encode_region_config_v4,
    encode_channel_plan_v4: encode_channel_plan_v4,
    encode_sensor_config_v4: encode_sensor_config_v4,
    encode_sensor_config_switch_mask_v4: encode_sensor_config_switch_mask_v4,
    encode_sensor_conditions_configuration_v4: encode_sensor_conditions_configuration_v4,
    encode_event_condition_v4: encode_event_condition_v4,
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
  var PROTOCOL_VERSION_V2 = 2;
  var PROTOCOL_VERSION_V3 = 3;
  var PROTOCOL_VERSION_V4 = 4;

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

  var decoded = {};
  var cursor = {};   // keeping track of which byte to process.
  cursor.value = 0;  // Start from 0

  if (fPort == 0 || bytes.length == 0) {
    // Ignore null payload OR MAC uplink
    return decoded;
  }

  var protocol_version = get_protocol_version(bytes);

  switch (protocol_version) {
    case PROTOCOL_VERSION_V2:
    case PROTOCOL_VERSION_V3: {
      decoded.header = decode_header(bytes, cursor);
      if (fPort == FPORT_DEFAULT_APP) {
        switch (decoded.header.message_type) {
          case STR_BOOT:
            decoded.boot = decode_boot_msg(bytes, cursor);
            break;

          case STR_ACTIVATED:
            // Only header
            break;

          case STR_DEACTIVATED:
            // only header
            break;

          case STR_SENSOR_EVENT:
            decoded.sensor_event = decode_sensor_event_msg(bytes, cursor, protocol_version);
            break;

          case STR_DEVICE_STATUS:
            decoded.device_status = decode_device_status_msg(bytes, cursor, protocol_version);
            break;

          default:
            throw new Error("Invalid message type!");
        }
      }
      break;
    }

    case PROTOCOL_VERSION_V4: {
      // Protocol V4 reserves each fPort for different purpose
      switch (fPort) {
        case FPORT_BOOT:
          header = decode_header_v4(bytes, cursor);
          decoded.boot = decode_boot_msg_v4(bytes, cursor);
          decoded.boot.protocol_version = header.protocol_version;
          break;

        case FPORT_DEVICE_STATUS:
          header = decode_header_v4(bytes, cursor);
          decoded.device_status = decode_device_status_msg_v4(bytes, cursor);
          decoded.device_status.protocol_version = header.protocol_version;
          break;

        case FPORT_SENSOR_EVENT:
          header = decode_header_v4(bytes, cursor);
          decoded.sensor_event = decode_sensor_event_msg_v4(bytes, cursor);
          decoded.sensor_event.protocol_version = header.protocol_version;
          break;

        case FPORT_ACTIVATION:
          header = decode_header_v4(bytes, cursor);
          decoded.activated = decode_activated_msg_v4(bytes, cursor);
          decoded.activated.protocol_version = header.protocol_version;
          break;

        case FPORT_DEACTIVATION:
          header = decode_header_v4(bytes, cursor);
          decoded.deactivated = decode_deactivated_msg_v4(bytes, cursor);
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
    }

    default:
      throw new Error("Unsupported protocol version!");
  }

  return decoded;
}

/**
 * Decoder for The Things Network network server
 */
function Decoder(obj, fPort) { // for The Things Network server
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
  * Get protocol version without increasing cursor
  */
function get_protocol_version(bytes) {
  var cursor = {};
  cursor.value = 0;

  var data = decode_uint8(bytes, cursor);

  var protocol_version = data >> 4;

  return protocol_version;
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

// helper function to parse a single temperature_16bit value
function decode_temperature_16bit(bytes, cursor) {
  var PT100_LOWER_BOUND_ERROR_CODE = 0x7FFD;
  var PT100_UPPER_BOUND_ERROR_CODE = 0x7FFE;
  var HARDWARE_ERROR_CODE = 0x7FFF;

  // Get raw value which could be an error code
  var temperature = decode_int16(bytes, cursor);

  if (
    temperature == PT100_LOWER_BOUND_ERROR_CODE ||
    temperature == PT100_UPPER_BOUND_ERROR_CODE ||
    temperature == HARDWARE_ERROR_CODE) {
    return temperature;
  } else {
    // Convert value to temperature value
    temperature = temperature / 10;
    return temperature;
  }
}

// helper function to parse tt application temperature for version = 4
function decode_sensor_temperature_v4(bytes, cursor) {
  var temperature = {};

  var PT100_LOWER_BOUND_ERROR_CODE = 0x7FFD;
  var PT100_UPPER_BOUND_ERROR_CODE = 0x7FFE;
  var HARDWARE_ERROR_CODE = 0x7FFF;

  var min = decode_temperature_16bit(bytes, cursor);
  var max = decode_temperature_16bit(bytes, cursor);
  var avg = decode_temperature_16bit(bytes, cursor);

  if (
    min == PT100_LOWER_BOUND_ERROR_CODE ||
    max == PT100_LOWER_BOUND_ERROR_CODE ||
    avg == PT100_LOWER_BOUND_ERROR_CODE
  ) {
    if (max == min && avg == min) { // In case of error min, max, and ave are all the same
      temperature.status = "PT100 Lower Bound Error";
    }
    else {
      throw new Error("Invalid min, max, avg. PT100 lower bound error is included!");
    }
  } else if (
    min == PT100_UPPER_BOUND_ERROR_CODE ||
    max == PT100_UPPER_BOUND_ERROR_CODE ||
    avg == PT100_UPPER_BOUND_ERROR_CODE
  ) {
    if (max == min && avg == min) {
      temperature.status = "PT100 Upper Bound Error";
    }
    else {
      throw new Error("Invalid min, max, avg. PT100 Upper bound error is included!");
    }
  } else if (
    min == HARDWARE_ERROR_CODE ||
    max == HARDWARE_ERROR_CODE ||
    avg == HARDWARE_ERROR_CODE
  ) {
    if (max == min && avg == min) {
      temperature.status = "Hardware Error";
    }
    else {
      console.log(min, max, avg);
      throw new Error("Invalid min, max, avg. Hardware Error is included!");
    }
  } else {
    temperature.min = min;
    temperature.max = max;
    temperature.avg = avg;

    temperature.status = "OK";
  }

  return temperature;
}

// helper function to parse tt application temperature for version = 4
function decode_sensor_temperature_normal_v4(bytes, cursor, selection) {
  var temperature = {};

  var PT100_LOWER_BOUND_ERROR_CODE = 0x7FFD;
  var PT100_UPPER_BOUND_ERROR_CODE = 0x7FFE;
  var HARDWARE_ERROR_CODE = 0x7FFF;

  var value = decode_temperature_16bit(bytes, cursor);

  if (value == PT100_LOWER_BOUND_ERROR_CODE) {
    temperature.status = "PT100 Lower Bound Error";
  } else if (value == PT100_UPPER_BOUND_ERROR_CODE) {
    temperature.status = "PT100 Upper Bound Error";
  } else if (value == HARDWARE_ERROR_CODE) {
    temperature.status = "Hardware Error";
  } else {
    if (selection == "min_only") {
      temperature.min = value;
    } else if (selection == "max_only") {
      temperature.max = value;
    } else if (selection == "avg_only") {
      temperature.avg = value;
    } else {
      throw new Error("Only min, max, or, avg is accepted!");
    }
    temperature.status = "OK";
  }

  return temperature;
}

// helper function to parse tt application temperature
function decode_sensor_temperature_v2_v3(bytes, cursor, version) {
  var temperature = {};
  var PT100LowerErrorCode = -3000;
  var PT100UpperErrorCode = -3001;
  var VboundLowerErrorCode = -3002;
  var VboundUpperErrorCode = -3003;
  var UnknownType = -3004;

  min = decode_int16(bytes, cursor) / 10;
  max = decode_int16(bytes, cursor) / 10;
  avg = decode_int16(bytes, cursor) / 10;

  if (version == 2) {
    temperature.min = min;
    temperature.max = max;
    temperature.avg = avg;
  } else if (version == 3) {
    if (
      min == PT100LowerErrorCode ||
      avg == PT100LowerErrorCode ||
      max == PT100LowerErrorCode
    ) {
      temperature.status = "PT100 bound Lower Error";
    } else if (
      min == PT100UpperErrorCode ||
      avg == PT100UpperErrorCode ||
      max == PT100UpperErrorCode
    ) {
      temperature.status = "PT100 bound Upper Error";
    } else if (
      min == VboundLowerErrorCode ||
      avg == VboundLowerErrorCode ||
      max == VboundLowerErrorCode
    ) {
      temperature.status = "V bound Lower Error";
    } else if (
      min == VboundUpperErrorCode ||
      avg == VboundUpperErrorCode ||
      max == VboundUpperErrorCode
    ) {
      temperature.status = "V bound Upper Error";
    } else if (min == UnknownType || avg == UnknownType || max == UnknownType) {
      temperature.status = "Unrecognized sensor type";
    } else {
      temperature.min = min;
      temperature.max = max;
      temperature.avg = avg;
      temperature.status = "OK";
    }
  } else {
    throw new Error("Invalid protocol version");
  }

  return temperature;
}


// helper function to parse tt application temperature
function decode_sensor_temperature(bytes, cursor, version) {
  var temperature = {};

  switch (version) {
    case 2:
    case 3: {
      temperature = decode_sensor_temperature_v2_v3(bytes, cursor, version);
      break;
    }

    case 4: {
      temperature = decode_sensor_temperature_v4(bytes, cursor);
      break;
    }

    default:
      throw new Error("Unsupported protocol version");
  }

  return temperature;
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

function uint8_to_hex(d) {
  return ('0' + (Number(d).toString(16).toUpperCase())).slice(-2);
}

function uint16_to_hex(d) {
  return ('000' + (Number(d).toString(16).toUpperCase())).slice(-4);
}

function uint32_to_hex(d) {
  return ('0000000' + (Number(d).toString(16).toUpperCase())).slice(-8);
}

function message_types_lookup_v2(type_id) {
  type_names = ["boot",
    "activated",
    "deactivated",
    "sensor_event",
    "device_status",
    "base_configuration",
    "sensor_configuration",
    "sensor_data_configuration",
    "sensor_data",
    "calibration_info",
    "user_calibration",
    "factory_calibration"];
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
    "vb",
    "cs",
    "pt"];
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
      return "condition_0";
    case 2:
      return "condition_1";
    case 3:
      return "condition_2";
    case 4:
      return "condition_3";
    case 5:
      return "user trigger";
    default:
      return "unknown";
  }
}

Object.prototype.in =
  function () {
    for (var i = 0; i < arguments.length; i++)
      if (arguments[i] == this) return true;
    return false;
  }

/***************************
 * Message decoder functions
 */

function decode_boot_msg_v4(bytes, cursor) {
  var expected_length_normal = 2;
  var expected_length_debug = 18;
  if (bytes.length != expected_length_normal && bytes.length != expected_length_debug) {
    throw new Error("Invalid boot message length " + bytes.length + " instead of " + expected_length_normal + " or " + expected_length_debug);
  }

  var boot = {};

  // byte[1]
  reboot_reason = decode_uint8(bytes, cursor);
  boot.reboot_reason = {};
  boot.reboot_reason.major = reboot_lookup_major(reboot_reason);
  boot.reboot_reason.minor = reboot_lookup_minor(reboot_reason);

  // debug data
  if (bytes.length == expected_length_debug) {
    boot.debug = '0x'
    for (var i = cursor.value; i < bytes.length; i++) {
      boot.debug = boot.debug + uint8_to_hex(bytes[i]);
    }
  }

  return boot;
}

function decode_boot_msg(bytes, cursor) {
  var boot = {}

  var expected_length = 23;
  if (bytes.length != expected_length) {
    throw new Error("Invalid boot message length " + bytes.length + " instead of " + expected_length);
  }

  // byte[1]
  device_type = decode_uint8(bytes, cursor);
  boot.device_type = device_types_lookup(device_type);

  // byte[2..5]
  var version_hash = decode_uint32(bytes, cursor);
  boot.version_hash = '0x' + uint32_to_hex(version_hash);

  // byte[6..7]
  var base_config_crc = decode_uint16(bytes, cursor);
  boot.base_config_crc = '0x' + uint16_to_hex(base_config_crc);

  // byte[8..9]
  var sensor_config_crc = decode_uint16(bytes, cursor);
  boot.sensor_config_crc = '0x' + uint16_to_hex(sensor_config_crc);

  // byte[10]
  var reset_flags = decode_uint8(bytes, cursor);
  boot.reset_flags = '0x' + uint8_to_hex(reset_flags);

  // byte[11]
  boot.reboot_counter = decode_uint8(bytes, cursor);

  // byte[12]
  boot_type = decode_uint8(bytes, cursor);

  // byte[13..20]
  boot.reboot_info = decode_reboot_info(boot_type, bytes, cursor);

  // byte[21]
  boot.last_device_state = decode_uint8(bytes, cursor);

  // byte[22]
  var bist = decode_uint8(bytes, cursor);
  boot.bist = '0x' + uint8_to_hex(bist);

  return boot;
}

function decode_sensor_event_msg_normal(bytes, cursor) {
  var sensor_event = {};

  // byte[1]
  selection = decode_uint8(bytes, cursor);

  sensor_event.selection = lookup_selection(selection);
  if (sensor_event.selection == "extended") {
    throw new Error("Mismatch between extended bit flag and message length!");
  }

  // byte[2]
  var conditions = decode_uint8(bytes, cursor);
  sensor_event.condition_0 = (conditions & 1);
  sensor_event.condition_1 = ((conditions >> 1) & 1);
  sensor_event.condition_2 = ((conditions >> 2) & 1);
  sensor_event.condition_3 = ((conditions >> 3) & 1);

  sensor_event.trigger = lookup_trigger((conditions >> 6) & 3);

  sensor_event.temperature = {};
  sensor_event.temperature = decode_sensor_temperature_normal_v4(bytes, cursor, sensor_event.selection);

  return sensor_event;
}

function decode_sensor_event_msg_extended(bytes, cursor) {
  var sensor_event = {};

  // byte[1]
  selection = decode_uint8(bytes, cursor);

  sensor_event.selection = lookup_selection(selection);
  if (sensor_event.selection != "extended") {
    throw new Error("Mismatch between extended bit flag and message length!");
  }

  // byte[2]
  var conditions = decode_uint8(bytes, cursor);
  sensor_event.condition_0 = (conditions & 1);
  sensor_event.condition_1 = ((conditions >> 1) & 1);
  sensor_event.condition_2 = ((conditions >> 2) & 1);
  sensor_event.condition_3 = ((conditions >> 3) & 1);

  sensor_event.trigger = lookup_trigger((conditions >> 6) & 3);

  sensor_event.temperature = {};
  sensor_event.temperature = decode_sensor_temperature_v4(bytes, cursor);

  return sensor_event;
}

function decode_sensor_event_msg(bytes, cursor, version) {
  var sensor_event = {}

  var expected_length = 9;
  if (bytes.length != expected_length) {
    throw new Error("Invalid sensor_event message length " + bytes.length + " instead of " + expected_length);
  }

  // byte[1]
  trigger = decode_uint8(bytes, cursor);
  sensor_event.trigger = trigger_lookup(trigger);

  // byte[2..7]
  sensor_event.temperature = {};

  sensor_event.temperature = decode_sensor_temperature(bytes, cursor, version);

  // byte[8]
  conditions = decode_uint8(bytes, cursor);
  sensor_event.condition_0 = (conditions & 1);
  sensor_event.condition_1 = ((conditions >> 1) & 1);
  sensor_event.condition_2 = ((conditions >> 2) & 1);
  sensor_event.condition_3 = ((conditions >> 3) & 1);

  return sensor_event;
}

function decode_device_status_msg_v4(bytes, cursor) {
  var expected_length = 9;
  if (bytes.length != expected_length) {
    throw new Error("Invalid device status message length " + bytes.length + " instead of " + expected_length);
  }

  var device_status = {};

  // byte[1]
  device_status.battery_voltage = decode_battery_voltage(bytes, cursor);

  // byte[2]
  device_status.temperature = decode_int8(bytes, cursor);

  // byte[3,4]
  device_status.lora_tx_counter = decode_uint16(bytes, cursor);

  // byte[5]
  rssi = decode_uint8(bytes, cursor);
  device_status.avg_rssi = rssi_lookup(rssi);

  // byte[6]
  var bist = decode_uint8(bytes, cursor);
  device_status.bist = '0x' + uint8_to_hex(bist);

  // byte[7]
  device_status.event_counter = decode_uint8(bytes, cursor);

  // byte[8]
  var sensor_type = decode_uint8(bytes, cursor);
  device_status.sensor_type = decode_sensor_type(sensor_type);

  return device_status;
}

function decode_device_status_msg(bytes, cursor, version) {
  var device_status = {};


  var expected_length;
  switch (version) {
    case 2:
    case 3: {
      expected_length = 18;
      break;
    }

    case 4: {
      expected_length = 19;
      break;
    }

    default:
      throw new Error("Invalid protocol version");
  }

  if (bytes.length != expected_length) {
    throw new Error("Invalid device_status message length " + bytes.length + " instead of " + expected_length);
  }

  // byte[1..2]
  var base_config_crc = decode_uint16(bytes, cursor);
  device_status.base_config_crc = '0x' + uint16_to_hex(base_config_crc);

  // byte[3..4]
  var sensor_config_crc = decode_uint16(bytes, cursor);
  device_status.sensor_config_crc = '0x' + uint16_to_hex(sensor_config_crc);

  // byte[5]
  device_status.event_counter = decode_uint8(bytes, cursor);

  // byte[6..11]
  device_status.battery_voltage = {};
  device_status.battery_voltage.low = decode_uint16(bytes, cursor) / 1000.0;
  device_status.battery_voltage.high = decode_uint16(bytes, cursor) / 1000.0;
  device_status.battery_voltage.settle = decode_uint16(bytes, cursor) / 1000.0;

  // byte[12..14]
  device_status.temperature = {};
  device_status.temperature.min = decode_int8(bytes, cursor);
  device_status.temperature.max = decode_int8(bytes, cursor);
  device_status.temperature.avg = decode_int8(bytes, cursor);

  // byte[15]
  device_status.tx_counter = decode_uint8(bytes, cursor);

  // byte[16]
  device_status.avg_rssi = -decode_uint8(bytes, cursor);

  // byte[17]
  device_status.avg_snr = decode_int8(bytes, cursor);

  if (version == 4) {
    // byte[18]
    device_status.bist = decode_uint8(bytes, cursor);
  }


  return device_status;
}

/**
  * Decode header
  */
function decode_header(bytes, cursor) {
  var header = {};
  var data = decode_uint8(bytes, cursor);

  header.protocol_version = data >> 4;
  header.message_type = message_types_lookup_v2(data & 0x0F);

  return header;
}

/**
  * Decode header V4
  */
function decode_header_v4(bytes, cursor) {
  var header = {};
  var data = decode_uint8(bytes, cursor);

  header.protocol_version = data >> 4;

  return header;
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

/**
  * Decode battery voltage based on protocol version 4
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

// helper function to decode sensor type
function decode_sensor_type(type) {
  switch (type) {
    case 0:
      return "PT100";
    case 1:
      return 'J';
    case 2:
      return 'K';
    case 3:
      return 'T';
    case 4:
      return 'N';
    case 5:
      return 'E';
    case 6:
      return 'B';
    case 7:
      return 'R';
    case 8:
      return 'S';
    default:
      throw new Error("Invalid thermocouple type!");
  }
}

function decode_config_update_ans_msg(bytes, cursor) {
  var expected_length = 6;
  if (bytes.length != expected_length) {
    throw new Error("Invalid config update ans message length " + bytes.length + " instead of " + expected_length);
  }

  var ans = {};

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

/**
  * Decode config header
  */
function decode_config_header(bytes, cursor) {
  var PROTOCOL_VERSION_V4 = 4;

  var header = {};
  var data = decode_uint8(bytes, cursor);

  header.protocol_version = data >> 4;
  if (header.protocol_version != PROTOCOL_VERSION_V4) {
    throw new Error("Invalid protocol version: " + header.protocol_version + "instead of" + PROTOCOL_VERSION_V4);
  }
  header.config_type = config_type_lookup(data & 0x0F);

  return header;
}

function config_type_lookup(type_id) {
  type_names = [
    "base",
    "region",
    "reserved",
    "sensor",
    "unknown", // Not applicable to TT
    "sensor_conditions"];
  if (type_id < type_names.length) {
    return type_names[type_id];
  } else {
    return "unknown";
  }
}

function decode_deactivated_msg_v4(bytes, cursor) {
  var deactivated = {};

  var expected_length = 3;
  if (bytes.length != expected_length) {
    throw new Error("Invalid deactivated message length " + bytes.length + " instead of " + expected_length);
  }

  // byte[1]
  var reason = decode_uint8(bytes, cursor);
  deactivated.reason = deactivation_reason_lookup(reason);

  // byte[2]
  var reason_length = decode_uint8(bytes, cursor);

  if (reason_length != 0) {
    throw new Error("Unsupported deactivated reason length");
  }

  return deactivated;
}

function deactivation_reason_lookup(deactivation_id) {
  switch (deactivation_id) {
    case 0:
      return "user_triggered"; // REVIEW: For TT we currently only have this one, right?
    default:
      return "unknown";
  }
}

function decode_activated_msg_v4(bytes, cursor) {
  var activated = {};

  var expected_length = 2;
  if (bytes.length != expected_length) {
    throw new Error("Invalid activated message length " + bytes.length + " instead of " + expected_length);
  }

  // byte[1]
  device_type = decode_uint8(bytes, cursor);
  activated.device_type = device_types_lookup(device_type);

  return activated;
}

function decode_sensor_event_msg_v4(bytes, curser) {
  var expected_length_normal = 5;
  var expected_length_extended = 9;
  if (bytes.length == expected_length_normal) {
    return decode_sensor_event_msg_normal(bytes, curser);
  }
  else if (bytes.length == expected_length_extended) {
    return decode_sensor_event_msg_extended(bytes, curser);
  }
  else {
    throw new Error("Invalid sensor_event message length " + bytes.length + " instead of " + expected_length_normal + " or " + expected_length_extended);
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

/**
 * Filename          : encoder_tt_doc-D_rev-3.js
 * Latest commit     : 910968dc
 * Protocol document : D
 *
 * Release History
 *
 * 2020-09-23 revision 0
 * - initial version
 *
 * 2021-06-28 revision 1
 * - rename unconfirmed_repeat to number_of_unconfirmed_messages
 * - Added limitation to base configuration
 * - Update minimum number of number_of_unconfirmed_messages
 *
 * 2021-07-15 revision 2
 * - Fixed threshold_temperature scale which affect version 2 and 3
 * - Add sensor type to application configuration, according to Protocol D
 * - Add value range assertion to encode_device_config
 * - Fixed the parsing of unconfirmed_repeat to number_of_unconfirmed_messages
 *
 * 2022-11-10 revision 3
 * - Align configuration name in NEON product
 *   + device -> base
 *   + application -> sensor
 * - Updated based on the changes from PT
 *   + added checking the threshold values
 *   + added cs and pt device types 
 * - Protocol V4, Updated based on the changes from LD/VB
 * -- Added configUpdateReq.
 * -- Separated the sensor configuration into Sensor configuration and sensor conditions configuration
 * -- Separated base configuration into base configuration and Region configuration
 * -- Moved protocol_version into message body
 * -- Updated lorawan_fsb_mask representation to disable_switch to dedicate 1 bit to every band (8 channels)
 * -- Uses ThingPark as default entry point where fPort is not an input but an output.
 * - Used throw new Error instead of throw
 *
 * YYYY-MM-DD revision X
 * - 
 */

var mask_byte = 255;

/**
  * Entry point for ThingPark
  */
function encodeDownlink(input) {
  // Encode downlink messages sent as
  // object to an array or buffer of bytes.

  var PROTOCOL_VERSION_2 = 2;
  var PROTOCOL_VERSION_3 = 3;
  var PROTOCOL_VERSION_4 = 4;

  // Specific for PROTOCOL_VERSION_2 and PROTOCOL_VERSION_3
  var MSGID_BASE_CONFIG = 5;
  var MSGID_SENSOR_CONFIG = 6;

  // Non default ports are specific for PROTOCOL_VERSION_4
  var FPORT_CONFIG_UPDATE = 7;
  var FPORT_CALIBRATION_UPDATE = 8;
  var FPORT_DEFAULT_APP = 15;

  var CONFIG_UPDATE_STR = "config_update_req"
  var CALIB_UPDATE_STR = "calib_update_req"

  // Config string
  var STR_BASE_CONFIG = "base";
  var STR_REGION_CONFIG = "region";
  var STR_SENSOR_CONFIG = "sensor";
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
    case PROTOCOL_VERSION_2:
    case PROTOCOL_VERSION_3: {
      // We always use default FPORT on protocol V1, V2 and V3
      output.fPort = FPORT_DEFAULT_APP;
      switch (input.header.message_type) {
        case "base_configuration": { // Base configuration message
          encode_header(bytes, MSGID_BASE_CONFIG, input.header.protocol_version);
          encode_base_config(bytes, input);
          encode_uint16(bytes, calc_crc(bytes.slice(1)));

          break;
        }
        case "sensor_configuration": { // Sensor configuration message
          switch (input.device_type) {
            case "tt":
              encode_header(bytes, MSGID_SENSOR_CONFIG, input.header.protocol_version);
              encode_sensor_config(bytes, input);
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
    case PROTOCOL_VERSION_4: {
      // Get request type based on message name
      var req_type = Object.keys(input)[0]
      var req = input[req_type]

      switch (req_type) {
        case CONFIG_UPDATE_STR: {
          output.fPort = FPORT_CONFIG_UPDATE;
          switch (req.config_type) {
            case STR_BASE_CONFIG: {
              encode_header_v4(bytes, req);
              // Ignore tag and payload if there is no payload
              if (typeof req.payload != "undefined") {
                encode_uint32(bytes, req.tag);
                encode_base_config_v4(bytes, req.payload);
              }
              break;
            }
            case STR_REGION_CONFIG: {
              encode_header_v4(bytes, req);
              // Ignore tag and payload if there is no payload
              if (typeof req.payload != "undefined") {
                encode_uint32(bytes, req.tag);
                encode_region_config_v4(bytes, req.payload);
              }
              break;
            }
            case STR_SENSOR_CONFIG: {
              encode_header_v4(bytes, req);
              // Ignore tag and payload if there is no payload
              if (typeof req.payload != "undefined") {
                encode_uint32(bytes, req.tag);
                encode_sensor_config_v4(bytes, req.payload);
              }
              break;
            }
            case STR_SENSOR_CONDITIONS_CONFIG: {
              encode_header_v4(bytes, req);
              // Ignore tag if there is no payload
              if (typeof req.payload != "undefined") {
                encode_uint32(bytes, req.tag);
                encode_sensor_conditions_configuration_v4(bytes, req.payload);
              }
              break;
            }
            default:
              output.fPort = 0;
              throw new Error("Invalid config type!");
          }
          break;
        }

        case "calib_update_req": {
          output.fPort = FPORT_CALIBRATION_UPDATE
          // TODO: Implement this!
          break;
        }

        default:
          throw new Error("Unknown request type");
      }
      break;
    }
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

/**
 * Base configuration encoder
 */
function EncodeBaseConfig(input) {
  var bytes = [];
  encode_base_config(bytes, input);

  return bytes;
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
      throw new Error("number_of_unconfirmed_messages is outside of specification: " + number_of_unconfirmed_messages);
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

/**
 * TT sensor configuration
 */
function EncodeSensorConfig(obj) {
  var bytes = [];
  encode_sensor_config(bytes, obj);

  return bytes;
}

function encode_sensor_config(bytes, obj) {
  if (obj.header.protocol_version == 2) {
    encode_device_type_v2(bytes, obj.device_type, obj.enable_rtd);
  } else if (obj.header.protocol_version == 3
    || obj.header.protocol_version == 4) {
    encode_device_type_v3(bytes, obj.device_type);
    encode_sensor_type(bytes, obj.sensor_type);
  } else {
    throw new Error("Protocol version is not supported!");
  }

  for (var i = 0; i != 4; ++i) {
    // All mode should not be above 1850 C
    if (obj.events[i].threshold_temperature > 2120) {
      throw new Error("threshold is above supported value");
    }

    if (obj.events[i].mode == "increasing" || obj.events[i].mode == "decreasing") {
      // Mode 3 and 4 (increasing and decreasing) only support positive number, while ...
      if (obj.events[i].threshold_temperature < -2120) {
        console.log("L319");
        throw new Error("threshold is below supported value1");
      }
    } else if (obj.events[i].threshold_temperature < -270) {
      // Mode 0, 1, and 2 (off, above, below) support threshold down to -270
      console.log("L324");
      console.log(obj.events[i].mode);
      throw new Error("threshold is below supported value2");
    }
  }

  encode_uint16(bytes, obj.temperature_measurement_interval_seconds);   // Unit: s
  encode_uint16(bytes, obj.periodic_event_message_interval);            // Unit: -
  encode_events_mode(bytes, obj.events[0].mode);                        // Unit: -
  encode_int16(bytes, obj.events[0].threshold_temperature * 10);        // Unit: 0.1'
  encode_uint8(bytes, obj.events[0].measurement_window);                // Unit: -'
  encode_events_mode(bytes, obj.events[1].mode);                        // Unit: -
  encode_int16(bytes, obj.events[1].threshold_temperature * 10);        // Unit: 0.1'
  encode_uint8(bytes, obj.events[1].measurement_window);                // Unit: -'
  encode_events_mode(bytes, obj.events[2].mode);                        // Unit: -
  encode_int16(bytes, obj.events[2].threshold_temperature * 10);        // Unit: 0.1'
  encode_uint8(bytes, obj.events[2].measurement_window);                // Unit: -'
  encode_events_mode(bytes, obj.events[3].mode);                        // Unit: -
  encode_int16(bytes, obj.events[3].threshold_temperature * 10);        // Unit: 0.1'
  encode_uint8(bytes, obj.events[3].measurement_window);                // Unit: -'
}

function encode_sensor_conditions_configuration_v4(bytes, payload) {
  if (typeof payload == "undefined") {
    return;
  }

  if (payload.device_type != "tt") {
    throw new Error("Invalid device type!");
  }

  encode_device_type_v3(bytes, payload.device_type);
  // Events configs
  var idx = 0;
  for (idx = 0; idx < 4; idx++) {                             // Unit: -
    // threshold_temperature
    if (payload.event_conditions[idx].mode == 'above' ||
      payload.event_conditions[idx].mode == 'below') {
      if (payload.event_conditions[idx].threshold_temperature > 1850 ||
        payload.event_conditions[idx].threshold_temperature < -270) {
        throw new Error("Threshold_temperature is outside of specification: " + payload.event_conditions[idx].threshold_temperature);
      }
    }
    else {
      if (payload.event_conditions[idx].threshold_temperature > 2120 ||
        payload.event_conditions[idx].threshold_temperature < 0) {
        throw new Error("Threshold_temperature is outside of specification: " + payload.event_conditions[idx].threshold_temperature);
      }
    }

    // measurement_window
    if (payload.event_conditions[idx].measurement_window < 0 ||
      payload.event_conditions[idx].measurement_window > 63) {
      throw new Error("Measurement_window is outside of specification: " + payload.event_conditions[idx].measurement_window);
    }

    encode_event_condition_v4(bytes, payload.event_conditions[idx]);
  }
}

function encode_sensor_config_v4(bytes, payload) {
  if (typeof payload == "undefined") {
    return;
  }

  if (payload.device_type != "tt") {
    throw new Error("Invalid device type!");
  }

  encode_device_type_v3(bytes, payload.device_type);
  encode_sensor_type(bytes, payload.sensor_type);

  encode_sensor_config_switch_mask_v4(bytes, payload.switch_mask);

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
}

function encode_base_config_v4(bytes, payload) {
  // Check if payload is empty
  if (typeof payload == "undefined") {
    return;
  }

  if (payload.periodic_message_random_delay_seconds < 0 || payload.periodic_message_random_delay_seconds > 31) {
    throw new Error("periodic_message_random_delay_seconds is outside of specification: " + payload.periodic_message_random_delay_seconds);
  }

  encode_base_config_switch_v4(bytes, payload.switch_mask);
  encode_status_msg_delay_interval_v4(bytes, payload.periodic_message_random_delay_seconds, payload.status_message_interval); // bit[0..4]: delay, bit[5..7]: interval
}

function encode_region_config_v4(bytes, payload) {
  if (typeof payload == "undefined") {
    return;
  }

  encode_channel_plan_v4(bytes, payload.channel_plan);

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

/* Helper Functions *********************************************************/

// helper function to encode the header
function encode_header(bytes, message_type_id, protocol_version) {
  var b = 0;
  b += (message_type_id & 0x0F);
  b += (protocol_version & 0x0F) << 4;

  bytes.push(b);
}

// helper function to encode the header for PROTOCOL_VERSION_4
function encode_header_v4(bytes, header) {
  var b = 0;
  b += (lookup_config_type(header.config_type) & 0x0F);
  b += (header.protocol_version & 0x0F) << 4;

  encode_uint8(bytes, b);
}

// helper function to encode device type V2
function encode_device_type_v2(bytes, type, enable_rtd) {
  var value = 0;

  switch (type) {
    case "ts":
      value = 1;
      break;
    case "vs-qt":
      value = 2;
      break;
    case "vs-mt":
      value = 3;
      break;
    case "tt":
      value = 4;
      break;
    case "cs":
      value = 7;
      break;
    case "pt":
      value = 8;
      break;
    default:
      throw new Error("Invalid device type!");
  }

  if (enable_rtd) {
    value |= 1 << 7;
  }

  encode_uint8(bytes, value);
}

// helper function to encode device type V3
function encode_device_type_v3(bytes, type) {
  var value = 0;

  switch (type) {
    case "ts":
      value = 1;
      break;
    case "vs-qt":
      value = 2;
      break;
    case "vs-mt":
      value = 3;
      break;
    case "tt":
      value = 4;
      break;
    default:
      throw new Error("Invalid device type!");
  }

  encode_uint8(bytes, value);
}

// helper function to encode sensor type
function encode_sensor_type(bytes, type) {
  var value = 0;

  switch (type) {
    case 'PT100':
      value = 0;
      break;
    case 'J':
      value = 1;
      break;
    case 'K':
      value = 2;
      break;
    case 'T':
      value = 3;
      break;
    case 'N':
      value = 4;
      break;
    case 'E':
      value = 5;
      break;
    case 'B':
      value = 6;
      break;
    case 'R':
      value = 7;
      break;
    case 'S':
      value = 8;
      break;
    default:
      throw new Error("Invalid thermocouple type!");
  }

  encode_uint8(bytes, value);
}

// helper function to encode event.mode
function encode_events_mode(bytes, mode) {
  switch (mode) {
    case 'above':
      encode_uint8(bytes, 1);
      break;
    case 'below':
      encode_uint8(bytes, 2);
      break;
    case 'increasing':
      encode_uint8(bytes, 3);
      break;
    case 'decreasing':
      encode_uint8(bytes, 4);
      break;
    case 'off':
    default:
      encode_uint8(bytes, 0);
      break;
  }
}

// helper function to encode the base configuration switch_mask
function encode_base_config_switch(bytes, bitmask) {
  var config_switch_mask = 0;
  if (bitmask.enable_confirmed_event_message) {
    config_switch_mask |= 1 << 0;
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

  var C = -1;
  var i = 0;
  while (i < buf.length) C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xFF];
  return C & 0xFFFF;
}

function encode_base_config_switch_v4(bytes, bitmask) {
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

function encode_status_msg_delay_interval_v4(bytes, periodic_message_random_delay, status_message_interval) {
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
      throw new Error("status_message_interval is outside of specification: " + status_message_interval);
  }
  var byte = periodic_message_random_delay | (interval_val << 5);
  bytes.push(byte);
}

function encode_channel_plan_v4(bytes, channel_plan) {
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

// helper function to encode the sensor configuration switch_mask
function encode_sensor_config_switch_mask_v4(bytes, bitmask) {
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

// helper function to encode the event condition
function encode_event_condition_v4(bytes, event_condition) {
  encodeModeMeasurementWindow(bytes, event_condition.mode, event_condition.measurement_window);
  encode_int16(bytes, event_condition.threshold_temperature * 10);        // Unit: 0.1'
}

// helper function to encode the mode and measurement_window into one byte
function encodeModeMeasurementWindow(bytes, mode, measWindow) {
  var temporary_mode = []; // to store the mode
  var temporary_measurement_window = [];
  var mode_meas_window = 0;
  switch (mode) {
    case 'above':
      encode_uint8(temporary_mode, 0);
      encode_uint8(temporary_measurement_window, measWindow);
      break;
    case 'below':
      encode_uint8(temporary_mode, 1);
      encode_uint8(temporary_measurement_window, measWindow);
      break;
    case 'increasing':
      encode_uint8(temporary_mode, 2);
      encode_uint8(temporary_measurement_window, measWindow);
      break;
    case 'decreasing':
      encode_uint8(temporary_mode, 3);
      encode_uint8(temporary_measurement_window, measWindow);
      break;
    case 'off':
      encode_uint8(temporary_mode, 0); // mode off is translated into measurement_window = 0 and mode = above
      encode_uint8(temporary_measurement_window, 0);
      break;
    default:
      throw new Error("mode is outside of specification: " + mode);
  }

  mode_meas_window = temporary_mode[0] | (temporary_measurement_window[0] << 2); // bits[0,1]: mode, bits[2..7]: measurement_window

  encode_uint8(bytes, mode_meas_window);
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
