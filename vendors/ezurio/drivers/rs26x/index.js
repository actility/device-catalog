//*****************************************************************************
// LicenseID: LicenseRef-Ezurio-Clause
// ExtractedText: <text>
// Copyright (c) 2025 Ezurio LLC.
//
// All rights reserved.
//
// Section 1. Definitions
//
// “Authorized Product” means an Ezurio LLC or Laird Connectivity LLC hardware
// or software product.
//
// Section 2. Software License Agreement
//
// Permission to use, copy, modify, and/or distribute the Software in source or
// binary form is granted, provided the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice,
// this permission notice, and the disclaimer below.
//
// 2. Neither the name of Ezurio LLC nor the names of its contributors may be
// used to endorse or promote products derived from this software without
// specific prior written permission.
//
// 3. The Software, with or without modification, may only be used with an
// Authorized Product.
// 
// 4. If and to the extent that the Software is designed to be compliant with
// any published or de facto standard, regulatory standard, or industry
// specification, the Software may not be modified such that the Software or
// Authorized Product would be incompatible with such standard or specification.
// 
// 5. Any Software provided in binary form under this license may not be reverse
// engineered, decompiled, modified or disassembled.
//
// Section 3. Disclaimer
//
// THIS SOFTWARE IS PROVIDED BY EZURIO LLC "AS IS" AND ANY EXPRESS
// OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
// OF MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE
// ARE DISCLAIMED. TO THE MAXIMUM EXTENT ALLOWED BY LAW, IN NO EVENT SHALL
// EZURIO LLC OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
// OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
// WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
// OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
// </text>
//*****************************************************************************

//*****************************************************************************
// Source: Ezurio RS26x Actility codec release v0.2
// https://github.com/Ezurio/rs26x_actility/releases/tag/v0.2 (RS26x_Actility.js)
//
// Changes made for the ThingPark X driver catalog (LoRa Alliance signature):
// - decodeUplink, encodeDownlink and decodeDownlink are exported; the unused
//   ChirpStack v3 wrappers (Decode, Encode) are removed.
// - decodeUplink and decodeDownlink always return errors and warnings arrays,
//   and report an unknown message type or an unknown tag instead of returning
//   an empty or undefined data object (decodeDownlink no longer loops forever
//   on an unknown tag).
// - Sensor Type 8 (External RTD) added, as listed by the RS26x LoRa protocol
//   application note v2.1.
// - "LoRaWAN RSSI" (tag 41, the name decoded in uplinks) accepted by the
//   downlink encoder next to "LoRa RSSI".
//*****************************************************************************

//*****************************************************************************
// Revision Details.
//*****************************************************************************
const UPLINK_API_VERSION_MAJOR = 0;
const UPLINK_API_VERSION_MINOR = 2;

//*****************************************************************************
// Uplink Message Ids.
//*****************************************************************************
const UPLINK_MSG_TYPE_SENSOR_DATA = 0;
const UPLINK_MSG_TYPE_SENSOR_CONFIG = 1;

//@RS26X_DECODE_SIZES_START
//*****************************************************************************
// Message element sizes in bytes.
//*****************************************************************************
//*****************************************************************************
// Basic type sizes in bytes.
//*****************************************************************************
const UPLINK_MSG_TYPE_ELEMENT_SIZE_UINT8 = 1;
const UPLINK_MSG_TYPE_ELEMENT_SIZE_INT8 = 1;
const UPLINK_MSG_TYPE_ELEMENT_SIZE_UINT16 = 2;
const UPLINK_MSG_TYPE_ELEMENT_SIZE_INT16 = 2;
const UPLINK_MSG_TYPE_ELEMENT_SIZE_UINT32 = 4;
const UPLINK_MSG_TYPE_ELEMENT_SIZE_INT32 = 4;
const UPLINK_MSG_TYPE_ELEMENT_SIZE_FLOAT = 4;

//*****************************************************************************
// Derived type sizes in bytes.
//*****************************************************************************
// The first byte of every message consists of the command id and the API
// version.
const UPLINK_MSG_TYPE_ELEMENT_SIZE_COMMAND_API = UPLINK_MSG_TYPE_ELEMENT_SIZE_UINT8;
// The message header consists of two bytes (Command Id/API Version & Device
// Status).
const UPLINK_MSG_TYPE_ELEMENT_SIZE_HEADER = UPLINK_MSG_TYPE_ELEMENT_SIZE_UINT8 * 2;
// Each message element is prefixed with a byte wide tag used to indicate its
// context.
const UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG = UPLINK_MSG_TYPE_ELEMENT_SIZE_UINT8;
// Null characters occupy single bytes.
const UPLINK_MSG_TYPE_ELEMENT_SIZE_NULL = UPLINK_MSG_TYPE_ELEMENT_SIZE_UINT8;
// Enums currently occupy single bytes.
const UPLINK_MSG_TYPE_ELEMENT_SIZE_ENUM = UPLINK_MSG_TYPE_ELEMENT_SIZE_UINT8;
// Standard width temperatures occupy two bytes.
const UPLINK_MSG_TYPE_ELEMENT_SIZE_TEMP_STD = UPLINK_MSG_TYPE_ELEMENT_SIZE_UINT8 * 2;
// Wide temperature values occupy four bytes.
const UPLINK_MSG_TYPE_ELEMENT_SIZE_TEMP_WIDE = UPLINK_MSG_TYPE_ELEMENT_SIZE_UINT8 * 4;
// UTC seconds occupy 4 bytes in uplink messages.
const UPLINK_MSG_TYPE_ELEMENT_SIZE_UTC_SECONDS = UPLINK_MSG_TYPE_ELEMENT_SIZE_UINT32;
// The aggregate count is a single byte that indicates how many readings are
// contained within an aggregate uplink element.
const UPLINK_MSG_TYPE_ELEMENT_SIZE_AGGREGATE_COUNT = UPLINK_MSG_TYPE_ELEMENT_SIZE_UINT8;
// The characters '0x' are prefixed to decoded hex strings but these are not
// included in the count of characters read out from the input byte array.
const UPLINK_MSG_TYPE_ELEMENT_HEX_STRING_PREFIX_SIZE = 2;
//@RS26X_DECODE_SIZES_END

//@RS26X_DECODE_ENUMERATIONS_START
//*****************************************************************************
// Enumerations for decoding.
//*****************************************************************************
var enumDecodeSensorType = {
  0 : "None",
  1 : "Internal Temperature Sensor",
  2 : "External Thermistor",
  3 : "External One-Wire",
  4 : "External Contact Sensor",
  5 : "External Leak Detector",
  6 : "External I2C",
  7 : "External SPI",
  8 : "External RTD"
};

var enumDecodeAuRegion = {
  0 : "AU915",
  1 : "AU923"
};

var enumDecodeDeviceType = {
  0 : "RM1261",
  1 : "RM1262"
};

var enumDecodeNetworkTime = {
  0 : "Automatic",
  1 : "Manual"
};

var enumDecodeAggregationMode = {
  0 : "None",
  1 : "Aggregation",
  2 : "Averaging"
};

var enumDecodeLorawanState = {
  0 : "Idle",
  1 : "Joining",
  2 : "Joined",
  3 : "TX",
  4 : "RX",
  5 : "Disconnected"
};

var enumDecodeChannelMask = {
  1 : "Sub-band 1",
  2 : "Sub-band 2",
  3 : "Sub-band 3",
  4 : "Sub-band 4",
  5 : "Sub-band 5",
  6 : "Sub-band 6",
  7 : "Sub-band 7",
  8 : "Sub-band 8"
};

var enumDecodeRegion = {
  0 : "Unconfigured",
  1 : "EU868",
  3 : "US915",
  4 : "AU915",
  5 : "AU923",
  6 : "NZ923"
};

var enumDecodeOperatingMode = {
  0 : "Ezurio-rs26x"
};

// Bools are treated as enumerations with only two values.
var enumDecodeBool = {
  0 : "False",	
  1 : "True"
};

var enumDecodeLoRaWANDataRate = {
  0 : "DR0",
  1 : "DR1",
  2 : "DR2",
  3 : "DR3",
  4 : "DR4",
  5 : "DR5",
  6 : "DR6",
  7 : "DR7"
};
//@RS26X_DECODE_ENUMERATIONS_END

// The Battery Status is not included in the parameter tables, but is declared
// as an enumeration here to use the enum decoding functionality.
var enumDecodeBatteryStatus = {
  0 : "Critical",
  1 : "Replace",
  2 : "OK",
  3 : "Good"
};

//*****************************************************************************
// Decode parameter table for namespace 0 (sensor reading uplink data).
//*****************************************************************************
var parameterTableDecodeNS0 = {
  0 : {"name" : "Temperature",           "decoder" : decodeTemperature},
  1 : {"name" : "Temperature Backlog",   "decoder" : decodeTemperatureBacklog},
  2 : {"name" : "Temperature Aggregate", "decoder" : decodeTemperatureAggregate},
  3 : {"name" : "Temperature",           "decoder" : decodeWideTemperature},
  4 : {"name" : "Temperature Backlog",   "decoder" : decodeWideTemperatureBacklog},
  5 : {"name" : "Temperature Aggregate", "decoder" : decodeWideTemperatureAggregate}
};

//@RS26X_DECODE_NS1_START
//*****************************************************************************
// Decode parameter table for namespace 1 (sensor parameter uplink data).
//*****************************************************************************
var parameterTableDecodeNS1 = {
  0 :  { "name" : "Friendly Name",                        "decoder" : decodeCharString },
  1 :  { "name" : "Sensor Type",                          "decoder" : decodeEnum,      "enumName" : enumDecodeSensorType },
  2 :  { "name" : "Read Period",                          "decoder" : decodeUInt16 },
  3 :  { "name" : "BLE Address",                          "decoder" : decodeHexString, "length" : 14 },
  5 :  { "name" : "AU Region",                            "decoder" : decodeEnum,      "enumName" : enumDecodeAuRegion },
  6 :  { "name" : "Confirmed Packets",                    "decoder" : decodeEnum,      "enumName" : enumDecodeBool },
  7 :  { "name" : "Confirmed Packets Retries",            "decoder" : decodeUInt8 },
  8 :  { "name" : "LoRa RF Power",                        "decoder" : decodeUInt8 },
  11 : { "name" : "LoRaWAN Connection State",             "decoder" : decodeEnum,      "enumName" : enumDecodeBool },
  12 : { "name" : "Downlink Packet Count",                "decoder" : decodeUInt32 },
  13 : { "name" : "LoRa SNR",                             "decoder" : decodeInt8 },
  14 : { "name" : "LoRaWAN State",                        "decoder" : decodeEnum,      "enumName" : enumDecodeLorawanState },
  15 : { "name" : "Uplink Packet Count",                  "decoder" : decodeUInt32 },
  16 : { "name" : "Max TX Power",                         "decoder" : decodeUInt8 },
  17 : { "name" : "Region",                               "decoder" : decodeEnum,      "enumName" : enumDecodeRegion },
  18 : { "name" : "Channel Mask",                         "decoder" : decodeEnum,      "enumName" : enumDecodeChannelMask },
  19 : { "name" : "Reading Aggregate Count",              "decoder" : decodeUInt8 },
  20 : { "name" : "Aggregation Mode",                     "decoder" : decodeEnum,      "enumName" : enumDecodeAggregationMode },
  22 : { "name" : "Clear Backlog",                        "decoder" : decodeAction },
  23 : { "name" : "Device Type",                          "decoder" : decodeEnum,      "enumName" : enumDecodeDeviceType },
  25 : { "name" : "Factory Reset",                        "decoder" : decodeAction },
  26 : { "name" : "Firmware Version",                     "decoder" : decodeCharString },
  27 : { "name" : "App Version",                          "decoder" : decodeCharString },
  30 : { "name" : "LoRa Module Firmware Version",         "decoder" : decodeCharString },
  31 : { "name" : "RTC Time",                             "decoder" : decodeUTCSeconds },
  32 : { "name" : "Software Device Reset",                "decoder" : decodeAction },
  33 : { "name" : "Thermistor 560 Cal Actual",            "decoder" : decodeDualFloat },
  34 : { "name" : "Thermistor 330k Cal Actual",           "decoder" : decodeDualFloat },
  35 : { "name" : "Heartbeat LED Flash Period",           "decoder" : decodeUInt8 },
  36 : { "name" : "BLE RSSI",                             "decoder" : decodeInt8 },
  37 : { "name" : "BLE TX Power",                         "decoder" : decodeInt8 },
  38 : { "name" : "Device Model",                         "decoder" : decodeCharString },
  39 : { "name" : "Operating Mode",                       "decoder" : decodeEnum,      "enumName" : enumDecodeOperatingMode },
  40 : { "name" : "Network Time",                         "decoder" : decodeEnum,      "enumName" : enumDecodeNetworkTime },
  41 : { "name" : "LoRaWAN RSSI",                         "decoder" : decodeInt8 },
  42 : { "name" : "LoRaWAN Data Rate",                    "decoder" : decodeEnum,      "enumName" : enumDecodeLoRaWANDataRate },
  48 : { "name" : "Thermistor S-H Coefficient A",         "decoder" : decodeFloat },
  49 : { "name" : "Thermistor S-H Coefficient B",         "decoder" : decodeFloat },
  50 : { "name" : "Thermistor S-H Coefficient C",         "decoder" : decodeFloat },
  51 : { "name" : "Battery Voltage Threshold - Good",     "decoder" : decodeUInt16 },
  52 : { "name" : "Battery Voltage Threshold - Bad",      "decoder" : decodeUInt16 },
  53 : { "name" : "Battery Voltage Threshold - Critical", "decoder" : decodeUInt16 },
  54 : { "name" : "Battery Voltage",                      "decoder" : decodeUInt16 }
};
//@RS26X_DECODE_NS1_END

//*****************************************************************************
// Public functions.
//*****************************************************************************

//*****************************************************************************
// LoRa Alliance payload codec entry point.
// @param input [in] JSON object provided by server.
// @output Decoded message data as JSON object.
//*****************************************************************************
function decodeUplink(input) {

  var output = {"data" : {}, "errors" : [], "warnings" : []};

  if (input.fPort === 0){
    return(output);
  }
  if (!input.bytes || input.bytes.length < UPLINK_MSG_TYPE_ELEMENT_SIZE_HEADER) {
    output.errors.push("Payload too short.");
    return(output);
  }
  if (input.bytes[0] == UPLINK_MSG_TYPE_SENSOR_DATA) {
    output = decodeSensorUplink(input.bytes, false);
  }
  else if (input.bytes[0] == UPLINK_MSG_TYPE_SENSOR_CONFIG) {
    output = decodeSensorUplink(input.bytes, true);
  }
  else {
    output.errors.push("Unknown uplink message type " + input.bytes[0] + ".");
  }
  return(output);
}

//@RS26X_DECODE_AWS_START
//@RS26X_DECODE_AWS_END

//*****************************************************************************
// Private functions.
//*****************************************************************************

//*****************************************************************************
// Decodes Sensor uplinks.
// @param input [in] Byte array containing message data.
// @param isConfig [in] Flag that indicates either sensor or config data.
// @output The decoded message JSON object.
//*****************************************************************************
function decodeSensorUplink(input, isConfig) {

  var output = {};
  var finalisedOutput = {};
  var elementOutput = {};
  var index = 0;

  var errors = [];

  // Process each part of the message
  while (index < input.length)
  {
    // Process the next element
    elementOutput = decodeSensorUplinkElement(input,
                                              output,
                                              index,
                                              isConfig);
    // Stop on an unknown tag: the size of what follows cannot be known
    if (elementOutput.updatedInput === undefined) {
      errors.push("Unknown tag " + input[index] + " at byte " + index + ".");
      break;
    }
    // Get updated output
    output = elementOutput.updatedInput;
    // Update payload index position
    index += elementOutput.bytesProcessed;
  }
  // Then finalise
  finalisedOutput = {"data" : output, "errors" : errors, "warnings" : []};
  // And exit with decoded output
  return(finalisedOutput);
}

//*****************************************************************************
// Decodes Sensor uplink elements. Each element is prefixed with a
// Tag that indicates the type of data that follows.
// @param input [in] Byte array containing uplink data.
// @param output [in/out] JSON object to have data appended to it.
// @param index [in] Byte array index where element data starts.
// @param isConfig [in] Flag that indicates if this is sensor or config data.
// @return Updated 'output' JSON object.
//*****************************************************************************
function decodeSensorUplinkElement(input, output, index, isConfig) {

  var updatedInput = {};
  var decodeTable;

  // Message header? If the index is 0, this indicates the start of the message.
  // This is the message header that always consists of two bytes.
  if (index === 0) {
    updatedInput = decodeUplinkMessageHeader(input);
  }
  else {
    // Beyond the message header, elements are added by tag then value
    if (!isConfig) {
      decodeTable = parameterTableDecodeNS0;
    }
    else {
      decodeTable =  parameterTableDecodeNS1;
    }
    // Now look up the element via its tag
    for (var row in decodeTable) {
      if (row == input[index]) {
        updatedInput = decodeTable[row].decoder(input,
                                                output,
                                                index, 
                                                decodeTable[row]
                                               );
        break;
      }
    }
  }
  return(updatedInput);
}

//*****************************************************************************
// Element decoder functions. Convert message elements to discrete JSON
// objects.
//*****************************************************************************

//*****************************************************************************
// Decodes uplink message header data. The message header consists of two bytes.
// The first byte contains the uplink command id and API version supported by
// the device sending the uplink. The second byte consists of the battery
// status and device status.
// @param input [in] Byte holding data to be decoded.
// @output Initial 'output' JSON object.
//*****************************************************************************
function decodeUplinkMessageHeader(input) {

  var batteryStatus;
  var deviceStatus;
  var batteryStatusValue;
  var deviceStatusValue;
  var output = {};
  var status = decodeUInt8Value(input,
                                UPLINK_MSG_TYPE_ELEMENT_SIZE_COMMAND_API);

  // Battery Status is upper two bits
  batteryStatus = status >> 6;
  // Device Status Bits are lower six bits
  deviceStatus = status & 0x3F;

  // Add battery status
  batteryStatusValue = decodeEnumValue(batteryStatus, enumDecodeBatteryStatus);
  output = {"Battery Status" : batteryStatusValue};

  // Add device status
  deviceStatusValue = decodeDeviceStatusValue(deviceStatus);
  output = Object.assign({"Device Status" : deviceStatusValue}, output);

  // And exit with updated output
  return({updatedInput : output,
          bytesProcessed : UPLINK_MSG_TYPE_ELEMENT_SIZE_HEADER});
}

//@RS26X_DECODE_ELEMENTS_START
//*****************************************************************************
// Decodes an 8Bit type uplink message element.
// @param input [in] Byte array holding data to be decoded.
// @param output [in/out] JSON object to have data appended to it.
// @param index [in] Index in the byte array where data resides.
// @param _elementDetails [in] Element data descriptor.
// @output Updated 'output' JSON object.
//*****************************************************************************
function decodeUInt8(input, output, index, _elementDetails) {

  var decoded;

  decoded = decodeUInt8Value(input, index + UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG);

  // Fold into the upper object
  output = Object.assign({[_elementDetails.name] : decoded}, output);

  // Then exit with the number of bytes read out of the array and the updated
  // output
  return({updatedInput : output, bytesProcessed :
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG +
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_UINT8});
}

//*****************************************************************************
// Decodes a 16Bit type uplink message element from big endian format.
// @param input [in] Byte array holding data to be decoded.
// @param output [in/out] JSON object to have data appended to it.
// @param index [in] Index in the byte array where data resides.
// @param _elementDetails [in] Element data descriptor.
// @output Updated 'output' JSON object.
//*****************************************************************************
function decodeUInt16(input, output, index, _elementDetails) {

  var decoded;

  decoded = decodeUInt16Value(input, index + UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG);

  // Fold into the upper object
  output = Object.assign({[_elementDetails.name] : decoded}, output);

  // Then exit with the number of bytes read out of the array and the updated
  // output
  return({updatedInput : output, bytesProcessed :
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG +
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_UINT16});
}

//*****************************************************************************
// Decodes a character string message element. Character strings must be
// terminated with a NULL character. This results in all character strings
// having a minimum length of 1, where the character string is blank but still
// requires one byte width for the NULL character.
// @param input [in] Byte array where char string element starts.
// @param output [in/out] JSON object to append decoded data to.
// @param index [in] Byte array index where data to be decoded starts.
// @param _elementDetails [in] Char string data descriptor.
// @return Updated 'output' JSON object.
//*****************************************************************************
function decodeCharString(input, output, index, _elementDetails) {

  var decoded;

  // Extract the string data
  decoded = decodeCharStringValue(input, index +
                                         UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG);

  // Add into the upper object
  output = Object.assign({[_elementDetails.name] : decoded}, output);

  // Then exit with the number of bytes read from the array and the updated
  // output.
  return({updatedInput : output, bytesProcessed :
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG +
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_NULL +
                                 decoded.length});
}

//*****************************************************************************
// Decodes an enum type uplink message element.
// @param input [in] Byte array of binary message data.
// @param output [in/out] JSON object to have data appended.
// @param index [in] Byte array index where enumeration element starts.
// @param _elementDetails [in] Enum data descriptor.
// @return Updated 'output' JSON object.
//*****************************************************************************
function decodeEnum(input, output, index, _elementDetails) {

  var decoded;
  
  // Get textual version of enumeration value
  decoded = decodeEnumValue(input[index + UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG],
                            _elementDetails.enumName);

  // Fold into the upper object
  output = Object.assign({[_elementDetails.name] : decoded}, output);

  // Then exit with the number of bytes added and the updated output
  return({updatedInput : output, bytesProcessed :
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG +
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_ENUM});
}

//*****************************************************************************
// Decodes a UTC Seconds type uplink message element.
// @param input [in] Byte array of binary message data.
// @param output [in/out] JSON object to have data appended.
// @param index [in] Index of start of element data in byte array.
// @param _elementDetails [in] UTC parameter data descriptor.
// @return Updated 'output' JSON object.
//*****************************************************************************
function decodeUTCSeconds(input, output, index, _elementDetails) {

  var decoded;

  decoded = decodeUTCSecondsValue(input, index +
                                         UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG);
  // Fold into the upper object
  output = Object.assign({[_elementDetails.name] : decoded}, output);
  // Then exit with the number of bytes processed and the updated output
  return({updatedInput : output, bytesProcessed :
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG +
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_UTC_SECONDS});
}

//*****************************************************************************
// Decodes a float.
// @param input [in] The input byte array to decode data from.
// @param output [in/out] The JSON object that will have decoded data appended
//                        to it.
// @param index [in] Index into the 'input' array where data starts.
// @param _elementDetails [in] Decode table data descriptor.
// @return Updated version of 'output' JSON object.
//*****************************************************************************
function decodeFloat(input, output, index, _elementDetails) {

  var decoded;

  decoded = decodeFloatValue(input, index + UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG);

  // Fold into the upper object
  output = Object.assign({[_elementDetails.name] : decoded}, output);
  // Then exit with the number of bytes read from the message buffer and the
  // updated output
  return({updatedInput : output, bytesProcessed :
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG +
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_FLOAT});
}

//*****************************************************************************
// Decodes an action.
// @param input [in] The input byte array to decode data from.
// @param output [in/out] The JSON object that will have decoded data appended
//                        to it.
// @param index [in] Index into the 'input' array where data starts.
// @param _elementDetails [in] Decode table data descriptor.
// @return Updated version of 'output' JSON object.
//*****************************************************************************
function decodeAction(input, output, index, _elementDetails) {

  // Fold into the upper object - Actions have no value associated with them
  // so a zero is always added as the value
  output = Object.assign({[_elementDetails.name] : 0}, output);
  // Then exit with the number of bytes read from the message buffer and the
  // updated output
  return({updatedInput : output, bytesProcessed :
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG});
}
//@RS26X_DECODE_ELEMENTS_END

//*****************************************************************************
// Decodes a signed 8Bit type uplink message element.
// @param input [in] Byte array holding data to be decoded.
// @param output [in/out] JSON object to have data appended to it.
// @param index [in] Index in the byte array where data resides.
// @param _elementDetails [in] Element data descriptor.
// @output Updated 'output' JSON object.
//*****************************************************************************
function decodeInt8(input, output, index, _elementDetails) {

  var decoded;

  decoded = decodeInt8Value(input, index + UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG);

  // Fold into the upper object
  output = Object.assign({[_elementDetails.name] : decoded}, output);
  // Then exit with the number of bytes read out of the array and the updated
  // output
  return({updatedInput : output, bytesProcessed :
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG +
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_INT8});
}

//*****************************************************************************
// Decodes an unsigned 32-bit type uplink message element.
// @param input [in] Byte array holding data to be decoded.
// @param output [in/out] JSON object to have data appended to it.
// @param index [in] Index in the byte array where data resides.
// @param _elementDetails [in] Element data descriptor.
// @output Updated 'output' JSON object.
//*****************************************************************************
function decodeUInt32(input, output, index, _elementDetails) {

  var decoded;

  // Extract the unisgned 32-bit data
  decoded = decodeUInt32Value(input, index + UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG);

  // Fold into the upper object
  output = Object.assign({[_elementDetails.name] : decoded}, output);

  // Then exit with the number of bytes read out from the array and the updated
  // output
  return({updatedInput : output, bytesProcessed :
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG +
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_UINT32});
}

//*****************************************************************************
// Decodes a hex string message element. Hex strings are not null terminated
// and the full width is always returned by the device. Hex strings are fixed
// width, the number of characters is always the same.
// @param input [in] Byte array where data to be decoded resides.
// @param index [in] Byte array index where data to be decoded starts.
// @param output [in] JSON object to append decoded data to.
// @param _elementDetails [in] Hex string data descriptor.
// @return Updated 'output' JSON object.
//*****************************************************************************
function decodeHexString(input, output, index, _elementDetails) {

  var decoded;

  // Extract the hex string data
  decoded = decodeHexStringValue(input,
                                 index +
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG,
                                 _elementDetails.length);

  // Then fold into the upper object
  output = Object.assign({[_elementDetails.name] : decoded}, output);

  // Then exit with the number of bytes read from the array and the updated
  // output
  return({updatedInput : output, bytesProcessed :
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG +
                                 (decoded.length - UPLINK_MSG_TYPE_ELEMENT_HEX_STRING_PREFIX_SIZE)});
}

//*****************************************************************************
// Decodes standard temperature data. The temperature data consists of two
// bytes in fixed point format.
// @param input [in] Byte array of binary message data.
// @param output [in/out] JSON object to have data appended.
// @param index [in] Byte array index where element data starts.
// @param _elementDetails [in] Unused data descriptor.
// @return Updated 'output' JSON object.
//*****************************************************************************
function decodeTemperature(input, output, index, _elementDetails)
{
  // Skip over the tag here
  var temperature = decodeTemperatureValue(input,
                                           index +
                                           UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG);

  // Add the temperature value
  output = Object.assign({"Temperature" : temperature}, output);

  // And exit with updated output
  return({updatedInput : output,
          bytesProcessed : UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG +
                           UPLINK_MSG_TYPE_ELEMENT_SIZE_TEMP_STD});
}

//*****************************************************************************
// Decodes wide temperature data. The temperature data consists of four bytes
// in fixed point format.
// @param input [in] Byte array of binary message data.
// @param output [in/out] JSON object to have data appended.
// @param index [in] Byte array index where data starts.
// @param _elementDetails [in] Unused data descriptor.
// @return Updated 'output' JSON object.
//*****************************************************************************
function decodeWideTemperature(input, output, index, _elementDetails)
{
  // Skip over the tag here
  var temperature = decodeWideTemperatureValue(input,
                                               index +
                                               UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG);

  // Add the temperature value
  output = Object.assign({"Temperature" : temperature}, output);

  // And exit with updated output
  return({updatedInput : output,
          bytesProcessed : UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG +
                           UPLINK_MSG_TYPE_ELEMENT_SIZE_TEMP_WIDE});
}

//*****************************************************************************
// Decodes uplink temperature backlog data. Each backlog consists of a 4 byte
// UTC timestamp and two byte temperature value.
// @param input [in] Byte array of binary message data.
// @param output [in/out] JSON object to have data appended.
// @param index [in] Index of start of element data in byte array.
// @param _elementDetails [in] Unused data descriptor.
// @return Updated 'output' JSON object.
//*****************************************************************************
function decodeTemperatureBacklog(input, output, index, _elementDetails)
{
  // Inner object for packaging the backlog data
  var innerObject = {};
  // Converted temperature value  
  var temperature;
  // Unique key associated with the backlog
  var backlogKey;

  // Each backlog temperature consists of a timestamp and the value
  // First format the timestamp. Offset of one here to skip over the tag
  innerObject = Object.assign({"Timestamp" :
                               decodeUTCSecondsValue(input,
                                                     index +
                                                     UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG)},
                              innerObject);

  // Then get the temperature value. Offset to account for timestamp and tag
  temperature = decodeTemperatureValue(input, index +
                                              UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG +
                                              UPLINK_MSG_TYPE_ELEMENT_SIZE_UTC_SECONDS);
  innerObject = Object.assign({"Temperature" : temperature}, innerObject);

  // Package up into the output object
  backlogKey = GetAscendingKey(output, "Temperature Backlog");
  output = Object.assign({[backlogKey]: innerObject}, output);

  // Then exit with the updated output and count of processed bytes
  return({updatedInput : output,
          bytesProcessed :
          UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG +
          UPLINK_MSG_TYPE_ELEMENT_SIZE_UTC_SECONDS +
          UPLINK_MSG_TYPE_ELEMENT_SIZE_TEMP_STD});
}

//*****************************************************************************
// Decodes uplink wide temperature backlog data. Each backlog consists of a
// 4-byte UTC timestamp and four-byte temperature value.
// @param input [in] Byte array of binary message data.
// @param output [in/out] JSON object to have data appended.
// @param index [in] Index of start of element data in byte array.
// @param _elementDetails [in] Unused data descriptor.
// @return Updated 'output' JSON object.
//*****************************************************************************
function decodeWideTemperatureBacklog(input, output, index, _elementDetails)
{
  // Inner object for packaging the backlog data
  var innerObject = {};
  // Converted temperature value  
  var temperature;
  // Unique key associated with the backlog
  var backlogKey;

  // Each backlog temperature consists of a timestamp and the value
  // First format the timestamp. Offset of one here to skip over the tag
  innerObject = Object.assign({"Timestamp" :
                               decodeUTCSecondsValue(input,
                                                     index +
                                                     UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG)},
                              innerObject);

  // Then get the temperature value. Offset to account for timestamp and tag
  temperature = decodeWideTemperatureValue(input,
                                           index +
                                           UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG +
                                           UPLINK_MSG_TYPE_ELEMENT_SIZE_UTC_SECONDS);
  innerObject = Object.assign({"Temperature" : temperature}, innerObject);

  // Package up into the output object
  backlogKey = GetAscendingKey(output, "Temperature Backlog");
  output = Object.assign({[backlogKey] : innerObject}, output);

  // Then exit with the updated output and count of processed bytes
  return({updatedInput : output,
          bytesProcessed :
          UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG +
          UPLINK_MSG_TYPE_ELEMENT_SIZE_UTC_SECONDS +
          UPLINK_MSG_TYPE_ELEMENT_SIZE_TEMP_WIDE});
}

//*****************************************************************************
// Decodes uplink temperature aggregate data. This consists of a count of
// included temperature aggregates, the timestamp associated with the first
// aggregate value and a list of aggregate temperatures.
// @param input [in] Byte array of binary message data.
// @param output [in/out] JSON object to have data appended.
// @param index [in] Index of start of element data in byte array.
// @param _elementDetails [in] Unused data descriptor.
// @return Updated 'output' JSON object.
//*****************************************************************************
function decodeTemperatureAggregate(input, output, index, _elementDetails)
{
  // Aggregate temperatures consist of the number of readings,
  // the timestamp of the first reading, and at least one reading
  var aggregateCount = decodeUInt8Value(input,
                                        index +
                                        UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG);

  // Get the total number of bytes that will be processed
  var bytesProcessed = UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG +
                       UPLINK_MSG_TYPE_ELEMENT_SIZE_AGGREGATE_COUNT +
                       UPLINK_MSG_TYPE_ELEMENT_SIZE_UTC_SECONDS +
                       (UPLINK_MSG_TYPE_ELEMENT_SIZE_TEMP_STD * aggregateCount);

  // Inner object to hold aggregate data
  var innerObject = {};
  // Object to hold aggregate results
  var aggregateObject = {};
  // Index into the payload for aggregate results
  var aggregateIndex;
  // Next converted temperature value  
  var temperature;

  // First add the aggregate count
  innerObject = Object.assign({"Aggregate Count" : aggregateCount},
                              innerObject);

  // Add the timestamp of the first aggregate reading
  innerObject = Object.assign({"Timestamp" :
                               decodeUTCSecondsValue(
                                 input,
                                 index +
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG +
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_AGGREGATE_COUNT)},
                              innerObject);

  // Now format in the individual temperatures
  aggregateIndex = UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG +
                   UPLINK_MSG_TYPE_ELEMENT_SIZE_AGGREGATE_COUNT +
                   UPLINK_MSG_TYPE_ELEMENT_SIZE_UTC_SECONDS;
  
  // 'aggregateCount' is used to label each aggregate value
  aggregateCount = 1;
  while (aggregateIndex < bytesProcessed) {
    // Get the next temperature value
    temperature = decodeTemperatureValue(input, index + aggregateIndex);
    aggregateObject = Object.assign({["Temperature " + aggregateCount] :
                                      temperature}, aggregateObject);
    // Move on to the next aggregate
    aggregateIndex += UPLINK_MSG_TYPE_ELEMENT_SIZE_TEMP_STD;
    aggregateCount++;
  }
  // Package up aggregate data
  innerObject = Object.assign({"Aggregate Temperatures" :
                               aggregateObject}, innerObject);

  // And finally fold into the upper object
  output = Object.assign({"Aggregate Temperature" : innerObject}, output);

  // Then exit with the number of bytes added and the updated output
  return({updatedInput : output, bytesProcessed : bytesProcessed});
}

//*****************************************************************************
// Decodes uplink wide temperature aggregate data. This consists of a count of
// included temperature aggregates, the timestamp associated with the first
// aggregate value and a list of aggregate temperatures.
// @param input [in] Byte array of binary message data.
// @param output [in/out] JSON object to have data appended.
// @param index [in] Index of start of element data in byte array.
// @param _elementDetails [in] Unused data descriptor.
// @return Updated 'output' JSON object.
//*****************************************************************************
function decodeWideTemperatureAggregate(input, output, index, _elementDetails)
{
  // Aggregate temperatures consist of the number of readings,
  // the timestamp of the first reading, and at least one reading
  var aggregateCount = decodeUInt8Value(input,
                                        index +
                                        UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG);

  // Get the total number of bytes that will be processed
  var bytesProcessed = UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG +
                       UPLINK_MSG_TYPE_ELEMENT_SIZE_AGGREGATE_COUNT +
                       UPLINK_MSG_TYPE_ELEMENT_SIZE_UTC_SECONDS +
                       (UPLINK_MSG_TYPE_ELEMENT_SIZE_TEMP_WIDE * aggregateCount);

  // Inner object to hold aggregate data
  var innerObject = {};
  // Object to hold aggregate results
  var aggregateObject = {};
  // Index into the payload for aggregate results
  var aggregateIndex;
  // Next converted temperature value  
  var temperature;

  // First add the aggregate count
  innerObject = Object.assign({"Aggregate Count" : aggregateCount},
                              innerObject);

  // Add the timestamp of the first aggregate reading
  innerObject = Object.assign({"Timestamp" :
                               decodeUTCSecondsValue(
                                 input,
                                 index +
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG +
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_AGGREGATE_COUNT)},
                              innerObject);

  // Now format in the individual temperatures
  aggregateIndex = UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG +
                   UPLINK_MSG_TYPE_ELEMENT_SIZE_AGGREGATE_COUNT +
                   UPLINK_MSG_TYPE_ELEMENT_SIZE_UTC_SECONDS;
  
  // 'aggregateCount' is used to label each aggregate value
  aggregateCount = 1;
  while (aggregateIndex < bytesProcessed) {
    // Get the next temperature value
    temperature = decodeWideTemperatureValue(input, index + aggregateIndex);
    aggregateObject = Object.assign({["Temperature " + aggregateCount] :
                                      temperature}, aggregateObject);
    // Move on to the next aggregate
    aggregateIndex += UPLINK_MSG_TYPE_ELEMENT_SIZE_TEMP_WIDE;
    aggregateCount++;
  }
  // Package up aggregate data
  innerObject = Object.assign({"Aggregate Temperatures" :
                               aggregateObject}, innerObject);

  // And finally fold into the upper object
  output = Object.assign({"Aggregate Temperature" : innerObject}, output);

  // Then exit with the number of bytes added and the updated output
  return({updatedInput : output, bytesProcessed : bytesProcessed});
}

//*****************************************************************************
// Decodes a dual float structure.
// @param input [in] The input byte array to decode data from.
// @param output [in/out] The JSON object that will have decoded data appended
//                        to it.
// @param index [in] Index into the 'input' array where data starts.
// @param _elementDetails [in] Decode table data descriptor.
// @return Updated version of 'output' JSON object.
//*****************************************************************************
function decodeDualFloat(input, output, index, _elementDetails) {

  var decodedFloat1;
  var decodedFloat2;
  var innerObject;

  // Decode both float values
  decodedFloat1 = decodeFloatValue(input,
                                   index + UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG);
  decodedFloat2 = decodeFloatValue(input,
                                   index + UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG +
                                   UPLINK_MSG_TYPE_ELEMENT_SIZE_FLOAT);
  // Build the inner object
  innerObject = {"Value 1" : decodedFloat1, "Value 2" : decodedFloat2};
  // Then fold into the outer object
  output = Object.assign({[_elementDetails.name] : innerObject}, output);
  // Then exit with the number of bytes added and the updated output
  return({updatedInput : output, bytesProcessed :
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_TAG +
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_FLOAT +
                                 UPLINK_MSG_TYPE_ELEMENT_SIZE_FLOAT});
}

//@RS26X_DECODE_VALUES_START
//*****************************************************************************
// Value decoder functions. Convert bytes to discrete decoded values.
//*****************************************************************************

//*****************************************************************************
// Helper function for decoding a uint8.
// @param input [in] The byte array to decode the uint8 from.
// @param index [in] Index in the byte array where to decode data.
// @return The decoded uint8.
//*****************************************************************************
function decodeUInt8Value(input, index) {

  var decoded;

  decoded = input[index] & 0xFF;
  return(decoded);
}

//*****************************************************************************
// Helper function for decoding unsigned 16-bit values from big endian byte
// array data.
// @param input [in] Byte array being decoded.
// @param index [in] Index in the byte array where the unsigned 16-bit data
//                   resides.
// @return The decoded unsigned 16-bit data.
//*****************************************************************************
function decodeUInt16Value(input, index) {

  var arrayBuffer = new ArrayBuffer(UPLINK_MSG_TYPE_ELEMENT_SIZE_INT16);
  var uInt8Array = new Uint8Array(arrayBuffer);
  var decoded;

  for (var i = 0; i < UPLINK_MSG_TYPE_ELEMENT_SIZE_UINT16; i++) {
    uInt8Array[i] = input[index + i] & 0xFF;
  }

  var dataView = new DataView(arrayBuffer);
  decoded = dataView.getUint16(0, false);
  return(decoded);
}

//*****************************************************************************
// Helper function for decoding unsigned 32-bit values from big endian byte
// array data.
// @param input [in] Byte array being decoded.
// @param index [in] Index in the byte array where the unsigned 32-bit data
//                   resides.
// @return The decoded unsigned 32-bit data.
//*****************************************************************************
function decodeUInt32Value(input, index) {

  var arrayBuffer = new ArrayBuffer(UPLINK_MSG_TYPE_ELEMENT_SIZE_UINT32);
  var uInt8Array = new Uint8Array(arrayBuffer);
  var decoded;

  for (var i = 0; i < UPLINK_MSG_TYPE_ELEMENT_SIZE_UINT32; i++) {
    uInt8Array[i] = input[index + i] & 0xFF;
  }

  var dataView = new DataView(arrayBuffer);
  decoded = dataView.getUint32(0, false);
  return(decoded);
}

//*****************************************************************************
// Helper function for decoding a character string. These must be terminated
// with a null character.
// @param input [in] The byte array where the character string data resides.
// @param index [in] Index in the byte array where the string data starts.
// @return The decoded character string.
//*****************************************************************************
function decodeCharStringValue(input, index) {

  var decoded;
  var bytes;
  var stringFromBytes;
  var nullPosition;

  // Get a sub-array from the message starting at the index
  bytes = input.slice(index);
  // Get the ASCII content
  stringFromBytes = String.fromCharCode.apply(null, bytes);
  // Then determine where we need to slice depending on the NULL position
  nullPosition = stringFromBytes.indexOf('\0');
  decoded = stringFromBytes.slice(0, nullPosition);
  return(decoded);
}

//*****************************************************************************
// Helper function for returning a string associated with an enumeration value.
// @param input [in] The byte to decode the enum textual data from.
// @param decodeEnum [in] The enum table to extract textual data from. 
// @return The decoded enum value.
//*****************************************************************************
function decodeEnumValue(input, decodeEnum) {

  var decoded = "Unknown";

  for (var elementEnumMember in decodeEnum) {
    if (elementEnumMember == input) {
      var elementEnumValue = decodeEnum[elementEnumMember];
      decoded = elementEnumValue;
      break;
    }
  }
  return(decoded);
}

//*****************************************************************************
// Helper function for returning a string containing a human readable date
// from a passed 32-bit timestamp in seconds since the UNIX epoch (January 1st,
// 1970, UTC).
// @param input [in] Byte array where data to be decoded resides.
// @param index [in] Index in the byte array where data starts.
// @return The human readable date information.
//*****************************************************************************
function decodeUTCSecondsValue(input, index) {

  // First decode from UInt32 format to get the total number of seconds.
  var utcSeconds = decodeUInt32Value(input, index);
  // Then convert to a date instance.
  // Convert to milliseconds prior to calling constructor.
  var date = new Date(utcSeconds * 1000);
  // And return in UTC format.
  return(date.toUTCString());
}

//*****************************************************************************
// Helper function for decoding single-precision float values.
// @param input [in] Byte array being decoded.
// @param index [in] Index in the byte array where the float data resides.
// @return The decoded float data.
//*****************************************************************************
function decodeFloatValue(input, index) {

  var arrayBuffer = new ArrayBuffer(UPLINK_MSG_TYPE_ELEMENT_SIZE_FLOAT);
  var uint8Array = new Uint8Array(arrayBuffer);
  var decoded;

  for (var i = 0 ; i < UPLINK_MSG_TYPE_ELEMENT_SIZE_FLOAT ; i++) {
    uint8Array[i] = input[index + i] & 0xFF;
  }

  var dataView = new DataView(arrayBuffer);
  decoded = dataView.getFloat32(0, false);
  return(decoded);
}
//@RS26X_DECODE_VALUES_END

//*****************************************************************************
// Helper function for decoding a int8. Using ArrayBuffer here for consistency
// with later value decoders.
// @param input [in] The byte array to decode the int8 from.
// @param index [in] Index in the byte array where to decode data.
// @return The decoded int8.
//*****************************************************************************
function decodeInt8Value(input, index) {

  var arrayBuffer = new ArrayBuffer(UPLINK_MSG_TYPE_ELEMENT_SIZE_INT8);
  var dataView = new DataView(arrayBuffer);
  var decoded;

  dataView.setInt8(0, input[index] & 0xFF);
  decoded = dataView.getInt8(0, false);
  return(decoded);
}

//*****************************************************************************
// Helper function for decoding signed 16-bit values from big endian byte
// array data.
// @param input [in] Byte array being decoded.
// @param index [in] Index in the byte array where the signed 16-bit data
//                   resides.
// @return The decoded signed 16-bit data.
//*****************************************************************************
function decodeInt16Value(input, index) {

  var arrayBuffer = new ArrayBuffer(UPLINK_MSG_TYPE_ELEMENT_SIZE_INT16);
  var int8Array = new Int8Array(arrayBuffer);
  var decoded;

  for (var i = 0; i < UPLINK_MSG_TYPE_ELEMENT_SIZE_INT16; i++) {
    int8Array[i] = input[index + i] & 0xFF;
  }

  var dataView = new DataView(arrayBuffer);
  decoded = dataView.getInt16(0, false);
  return(decoded);
}

//*****************************************************************************
// Helper function for decoding signed 32-bit values from big endian byte
// array data.
// @param input [in] Byte array being decoded.
// @param index [in] Index in the byte array where the signed 32-bit data
//                   resides.
// @return The decoded signed 32-bit data.
//*****************************************************************************
function decodeInt32Value(input, index) {

  var arrayBuffer = new ArrayBuffer(UPLINK_MSG_TYPE_ELEMENT_SIZE_INT32);
  var int8Array = new Int8Array(arrayBuffer);
  var decoded;

  for (var i = 0; i < UPLINK_MSG_TYPE_ELEMENT_SIZE_INT32; i++) {
    int8Array[i] = input[index + i] & 0xFF;
  }

  var dataView = new DataView(arrayBuffer);
  decoded = dataView.getInt32(0, false);
  return(decoded);
}

//*****************************************************************************
// Helper function for decoding a hexstring.
// @param input [in] The byte array to decode the hexstring from.
// @param index [in] The index where the hexstring data starts.
// @param length [in] The number of bytes to decode.
// @return The decoded hexstring.
//*****************************************************************************
function decodeHexStringValue(input, index, length) {

  var decoded = "0x0";

  // We first get a sub-array from the message bytes starting at the index
  // and convert to ASCII
  decoded = String.fromCharCode.apply(null, input.slice(index));
  // Then slice off unused characters at the end
  decoded = decoded.slice(0, length);
  decoded = '0x' + decoded;
  return(decoded);
}

//*****************************************************************************
// Helper function for returning a decoded standard width temperature value.
// Standard width temperature values indicate between -128 and 127C.
// Temperature data is encoded in fixed point format using a scale factor of
// 256. This results in standard width temperature values occupying two bytes
// in encoded payloads.
// @param input [in] Byte array containing temperature data.
// @param index [in] Byte array index where temperature data starts.
// @return The temperature in single precision floating point format.
//*****************************************************************************
function decodeTemperatureValue(input, index) {

  var signedValue = 0;
  var signedValueFloat;

  // First decode the signed 16-bit data
  signedValue = decodeInt16Value(input, index);
  // Then convert from fixed to floating point
  signedValueFloat = parseInt(signedValue);
  signedValueFloat /= 256.0;
  // And truncate to 2 decimal places. The result of toFixed
  // here is parsed back again to prevent returning a string
  signedValueFloat = parseFloat(signedValueFloat.toFixed(2));
  return(signedValueFloat);
}

//*****************************************************************************
// Helper function for returning a decoded wide temperature value. 
// Wide temperature values indicate between -32768 to 32767C.
// Temperature data is encoded in fixed point format using a scale factor of
// 65536. This results in wide temperature values occupying four bytes in
// encoded payloads.
// @param input [in] Byte array containing temperature data.
// @param index [in] Byte array index where temperature data starts.
// @return The temperature in single precision floating point format.
//*****************************************************************************
function decodeWideTemperatureValue(input, index) {

  var signedValue = 0;
  var signedValueFloat;

  // First decode the signed 32-bit data
  signedValue = decodeInt32Value(input, index);
  // Then convert from fixed to floating point
  signedValueFloat = parseInt(signedValue)
  signedValueFloat /= 65536.0;
  // And truncate to 2 decimal places. The result of toFixed
  // here is parsed back again to prevent returning a string
  signedValueFloat = parseFloat(signedValueFloat.toFixed(2));
  return(signedValueFloat);
}

//*****************************************************************************
// Helper function for returning a JS object indicating the device status bit
// conditions.
// @param input [in] The byte to decode the device status from.
// @return The decoded device status.
//*****************************************************************************
function decodeDeviceStatusValue(input) {

  var deviceStatus = {};
  var bitIndex = 0;
  var statusLabels = ["Sensor Fault",
                      "Bandwidth Limitation",
                      "Backlogs Available",
                      "Backlog Wraparound",
                      "Unsupported API Version"];
  var bitStatus;

  while (bitIndex < statusLabels.length) {
    bitStatus = "No";
    if (input & (1 << bitIndex)) {
      bitStatus = "Yes";
    }
    deviceStatus = Object.assign({[statusLabels[bitIndex]] :
                                   bitStatus}, deviceStatus);
    bitIndex++;
  }
  return(deviceStatus);
}

//*****************************************************************************
// Helper function to count the number of occurrences of a key within a JSON.
// object. Returns the passed key updated with the next available index.
// @param input [in] The JSON object to parse.
// @param keyName [in] The key to search for.
// @return The key with associated index.
//*****************************************************************************
function GetAscendingKey(input, keyName) {

  var ascendingKey;
  var keyCount = Object.keys(input).filter(key => key.startsWith(keyName)).length;
  keyCount = keyCount + 1;
  ascendingKey = keyName + " " + keyCount;
  return(ascendingKey);
}


//*****************************************************************************
// Revision Details.
//*****************************************************************************
const DOWNLINK_API_VERSION_MAJOR = 0;
const DOWNLINK_API_VERSION_MINOR = 2;

//@RS26X_ENCODE_COMMANDS_START
//*****************************************************************************
// Downlink Message Ids.
//*****************************************************************************
const DOWNLINK_MSG_TYPE_GET_SENSOR_CONFIG = 0;
const DOWNLINK_MSG_TYPE_SET_SENSOR_CONFIG = 1;
//@RS26X_ENCODE_COMMANDS_END

//*****************************************************************************
// Message element sizes in bytes.
//*****************************************************************************
//*****************************************************************************
// Basic type sizes in bytes.
//*****************************************************************************
const DOWNLINK_MSG_TYPE_ELEMENT_SIZE_UINT8 = 1;
const DOWNLINK_MSG_TYPE_ELEMENT_SIZE_UINT16 = 2;
const DOWNLINK_MSG_TYPE_ELEMENT_SIZE_UINT32 = 4;
const DOWNLINK_MSG_TYPE_ELEMENT_SIZE_FLOAT = 4;

//*****************************************************************************
// Derived type sizes in bytes.
//*****************************************************************************
// Enums currently occupy single bytes.
const DOWNLINK_MSG_TYPE_ELEMENT_SIZE_ENUM = DOWNLINK_MSG_TYPE_ELEMENT_SIZE_UINT8;
// UTC seconds occupy 4 bytes in downlink messages.
const DOWNLINK_MSG_TYPE_ELEMENT_SIZE_UTC_SECONDS = DOWNLINK_MSG_TYPE_ELEMENT_SIZE_UINT32;

//*****************************************************************************
// Enumerations for encoding.
//*****************************************************************************
var enumEncodeAuRegion = {
  "AU915" : 0,
  "AU923" : 1
};

var enumEncodeNetworkTime = {
  "Automatic" : 0,
  "Manual" : 1
};

var enumEncodeChannelMask = {
  "Sub-band 1" : 1,
  "Sub-band 2" : 2,
  "Sub-band 3" : 3,
  "Sub-band 4" : 4,
  "Sub-band 5" : 5,
  "Sub-band 6" : 6,
  "Sub-band 7" : 7,
  "Sub-band 8" : 8
};

var enumEncodeAggregationMode = {
  "None" : 0,
  "Aggregation" : 1,
  "Averaging" : 2
};

var enumEncodeOperatingMode = {
  "Ezurio-rs26x" : 0
};

var enumEncodeBool = {
  "False" : 0,
  "True" : 1
};

//*****************************************************************************
// Encode parameter table.
// Access rights take priority - if a value is read only, only the tag can
// be encoded in a downlink so no encoder or parameter properties are needed.
//*****************************************************************************
var parameterTableEncodeNS1 = {
  "Friendly Name" :                        { "tag" : 0,  "access" : "rw", "encoder" : encodeCharString, "min" : 0, "max" : 20 },
  "Sensor Type" :                          { "tag" : 1,  "access" : "r" },
  "Read Period" :                          { "tag" : 2,  "access" : "rw", "encoder" : encodeUInt16, "min" : 5, "max" : 3600 },
  "BLE Address" :                          { "tag" : 3,  "access" : "r" },
  "AU Region" :                            { "tag" : 5,  "access" : "rw", "encoder" : encodeEnum, "enumName" : enumEncodeAuRegion },
  "Confirmed Packets" :                    { "tag" : 6,  "access" : "rw", "encoder" : encodeEnum, "enumName" : enumEncodeBool },
  "Confirmed Packets Retries" :            { "tag" : 7,  "access" : "rw", "encoder" : encodeUInt8, "min" : 0, "max" : 10 },
  "LoRa RF Power" :                        { "tag" : 8,  "access" : "r" },
  "LoRaWAN Connection State" :             { "tag" : 11, "access" : "r" },
  "Downlink Packet Count" :                { "tag" : 12, "access" : "r" },
  "LoRa SNR" :                             { "tag" : 13, "access" : "r" },
  "LoRaWAN State" :                        { "tag" : 14, "access" : "r" },
  "Uplink Packet Count" :                  { "tag" : 15, "access" : "r" },
  "Max TX Power" :                         { "tag" : 16, "access" : "rw", "encoder" : encodeUInt8, "min" : 0, "max" : 22 },
  "Region" :                               { "tag" : 17, "access" : "r" },
  "Channel Mask" :                         { "tag" : 18, "access" : "rw", "encoder" : encodeEnum, "enumName" : enumEncodeChannelMask },
  "Reading Aggregate Count" :              { "tag" : 19, "access" : "rw", "encoder" : encodeUInt8, "min" : 2, "max" : 10 },
  "Aggregation Mode" :                     { "tag" : 20, "access" : "rw", "encoder" : encodeEnum, "enumName" : enumEncodeAggregationMode },
  "Clear Backlog" :                        { "tag" : 22, "access" : "w",  "encoder" : encodeAction },
  "Device Type" :                          { "tag" : 23, "access" : "r" },
  "Factory Reset" :                        { "tag" : 25, "access" : "w",  "encoder" : encodeAction },
  "Firmware Version" :                     { "tag" : 26, "access" : "r" },
  "App Version" :                          { "tag" : 27, "access" : "r" },
  "LoRa Module Firmware Version" :         { "tag" : 30, "access" : "r" },
  "RTC Time" :                             { "tag" : 31, "access" : "rw", "encoder" : encodeUTCSeconds, "min" : 0, "max" : 0xFFFFFFFF },
  "Software Device Reset" :                { "tag" : 32, "access" : "w",  "encoder" : encodeAction },
  "Thermistor 560 Cal Actual" :            { "tag" : 33, "access" : "r" },
  "Thermistor 330k Cal Actual" :           { "tag" : 34, "access" : "r" },
  "Heartbeat LED Flash Period" :           { "tag" : 35, "access" : "rw", "encoder" : encodeUInt8, "min" : 0, "max" : 60 },
  "BLE RSSI" :                             { "tag" : 36, "access" : "r" },
  "BLE TX Power" :                         { "tag" : 37, "access" : "r" },
  "Device Model" :                         { "tag" : 38, "access" : "r" },
  "Operating Mode" :                       { "tag" : 39, "access" : "rw", "encoder" : encodeEnum, "enumName" : enumEncodeOperatingMode },
  "Network Time" :                         { "tag" : 40, "access" : "rw", "encoder" : encodeEnum, "enumName" : enumEncodeNetworkTime },
  "LoRa RSSI" :                            { "tag" : 41, "access" : "r" },
  "LoRaWAN RSSI" :                         { "tag" : 41, "access" : "r" },
  "LoRaWAN Data Rate" :                    { "tag" : 42, "access" : "r" },
  "Thermistor S-H Coefficient A" :         { "tag" : 48, "access" : "rw", "encoder" : encodeFloat },
  "Thermistor S-H Coefficient B" :         { "tag" : 49, "access" : "rw", "encoder" : encodeFloat },
  "Thermistor S-H Coefficient C" :         { "tag" : 50, "access" : "rw", "encoder" : encodeFloat },
  "Battery Voltage Threshold - Good"     : { "tag" : 51, "access" : "rw", "encoder" : encodeUInt16, "min" : 0x0, "max" : 0xFFFF },
  "Battery Voltage Threshold - Bad"      : { "tag" : 52, "access" : "rw", "encoder" : encodeUInt16, "min" : 0x0, "max" : 0xFFFF },
  "Battery Voltage Threshold - Critical" : { "tag" : 53, "access" : "rw", "encoder" : encodeUInt16, "min" : 0x0, "max" : 0xFFFF },
  "Battery Voltage" :                      { "tag" : 54, "access" : "r" }
};

//*****************************************************************************
// Public functions.
//*****************************************************************************

//*****************************************************************************
// LoRa Alliance payload codec entry point.
// @param input [in] JSON object containing the message to encode.
// @return JSON object containing the encoded message.
//*****************************************************************************
function encodeDownlink(input) {

  var finalOutput = {"bytes" : [],
//@RS26X_CHIRPSTACK_ONLY_START
//@RS26X_CHIRPSTACK_ONLY_END
                     "fPort" : 1,
                     "warnings" : [],
                     "errors" : []};
  var element = {};
  var index = 0;
  var updatedOutput = {};
  var sorted_input = {};

  // Actility does not provide an fPort, assume 1 if not provided
  if ("fPort" in input) {
    finalOutput.fPort = input.fPort;
  }

  // Find the tag value indicating the downlink message type
  for (var row in input.data) {

    if (row == "Message Type") {
      // Only two types of messages - Configuration Get and Set
      if (input.data[row] == "Configuration Get") {
        finalOutput.bytes.push(DOWNLINK_MSG_TYPE_GET_SENSOR_CONFIG);
        index++;
        // Now work through each tag value pair
        for (row in input.data) {
          // If getting the configuration, parameters for
          // getting are listed in an array called Parameters 
          if (row == "Parameters") {
            // Loop through the list of parameters for encode
            for (var parameter in input.data[row]) {
              finalOutput = encodeGetDownlinkElement(finalOutput,
                                                     input.data[row][parameter]);
              index++;
            }
            break;
          }
        }
      }
      else if (input.data[row] == "Configuration Set") {
        finalOutput.bytes.push(DOWNLINK_MSG_TYPE_SET_SENSOR_CONFIG);
        index++;
        sorted_input = sortAscending(input);
        // Now work through each tag value pair
        for (row in sorted_input.data) {
          // Skip over the message type
          if (row != "Message Type") {
            element = {name: row, value : sorted_input.data[row]};
            updatedOutput = encodeSetDownlinkElement(finalOutput,
                                                     index,
                                                     element);
            index = updatedOutput.updatedIndex;
            finalOutput = updatedOutput.updatedInput;
          }
        }
        break;
      }
      else
      {
        // If an unknown command is being encoded, add an error
        finalOutput.errors.push(
          "Unknown command type requested for encoding.");
        // If any errors occur, stop encoding and exit out
        break;
      }
    }
  }
  if (!input.data || !("Message Type" in input.data)) {
    finalOutput.errors.push("Missing Message Type.");
  }
  if (finalOutput.errors.length) {
    // Make encoding atomic - all parameters encoded or none
    finalOutput.bytes = []
  }
//@RS26X_CHIRPSTACK_ONLY_START
//@RS26X_CHIRPSTACK_ONLY_END
  return(finalOutput);
}

//@RS26X_ENCODE_AWS_START
//@RS26X_ENCODE_AWS_END

//*****************************************************************************
// Private functions.
//*****************************************************************************

//*****************************************************************************
// Encodes the next config set downlink element in the passed JSON message.
// Set downlink elements consist of the parameter tag and the associated
// value.
// @param input [in/out] JSON object containing encoded message details.
// @param index [in/out] The index of the next free byte in the input byte
//                       array.
// @param element [in] The row from the JSON message to encode.
// @return Updated 'input' and 'index' values.
//*****************************************************************************
function encodeSetDownlinkElement(input, index, element) {

  var output = {updatedIndex : index, updatedOutput : {}};
  var elementFound = false;

  // Iterate through the parameter table to find a match
  for (var row in parameterTableEncodeNS1) {

    if (element.name === row) {
      // Found requested parameter
      elementFound = true;
      // Do not allow read-only parameters to be written
      if (parameterTableEncodeNS1[row].access.indexOf("w") !== -1) {
      
        // First we add the tag of the item
        input.bytes.push(parameterTableEncodeNS1[row].tag & (0xFF));
        index++;
        // Then encode the value
        output = parameterTableEncodeNS1[row].encoder(element,
                                                      parameterTableEncodeNS1[row],
                                                      index);
        // Check if the encoder emitted an error
        if (output.errors !== "") {
          // If so push it to the output and stop encoding
          input.errors.push(output.errors);
        }
        else {
          // OK to append output to the encoded array
          input.bytes = input.bytes.concat(output.encodedValue);
        }
        break;
      }
      else {
        // Add an error if trying to write a read-only parameter
        input.errors.push("Can't write read-only parameter " +
                           element.name + ".");
        break;
      }
    }
  }
  // Was the parameter found?
  if (elementFound === false) {
    // Add an error if trying to access an unknown parameter
    input.errors.push("Parameter " + element.name + " cannot be found.");
  }
  // Set updated input before exiting
  output.updatedInput = input;
  return(output);
}

//*****************************************************************************
// Encodes the next config get downlink element in the passed JSON message.
// Get downlink elements consist of the parameter tag only and have no
// associated parameter properties.
// @param input [in/out] JSON object containing encoded message details.
// @param elementName [in] Name of the element to encode.
// @return Updated 'input' JSON object.
//*****************************************************************************
function encodeGetDownlinkElement(input, elementName) {

  var elementFound = false;

  // Iterate through the parameter table to find a match
  for (var row in parameterTableEncodeNS1) {

    if (elementName === row) {
      // Do not allow write-only parameters to be read
      if (parameterTableEncodeNS1[row].access.indexOf("r") !== -1) {
        // Add the tag of the item
        input.bytes.push(parameterTableEncodeNS1[row].tag & (0xFF));
      }
      else
      {
        // Add an error if trying to read a write-only parameter
        input.errors.push("Can't read write-only parameter " +
                          elementName + ".");
      }
      // Found our item
      elementFound = true;
      break;
    }
  }
  // If the element was not found, add an error here
  if (elementFound === false) {
    input.errors.push("Unknown parameter " + elementName + ".");
  }
  return(input);
}

//*****************************************************************************
// Element encoders.
//*****************************************************************************

//*****************************************************************************
// Encodes a UInt8 type downlink message element.
// @param element [in] The row read from the JSON object to encode.
// @param _elementDetails [in] The element data descriptor.
// @param index [in/out] The current index to the encoded message byte array.
// @return Bytes to add to the encoded message byte array, the updated 'index
//         value and any errors that occurred during encoding.
//*****************************************************************************
function encodeUInt8(element, _elementDetails, index) {

  var output = {"encodedValue" : [], "updatedIndex" : index, "errors" : ""};

  if ((element.value >= _elementDetails.min) &&
      (element.value <= _elementDetails.max)) {
    output.encodedValue.push(element.value & 0xFF);
    output.updatedIndex = index + DOWNLINK_MSG_TYPE_ELEMENT_SIZE_UINT8;
  }
  else {
    // Add an error if out of range
    output.errors = ("Value out of range for " + element.name + ".");
  }
  return(output);
}

//*****************************************************************************
// Encodes a UInt16 type downlink message element.
// @param element [in] The row read from the JSON object to encode.
// @param _elementDetails [in] The element data descriptor.
// @param index [in/out] The current index to the encoded message byte array.
// @return Bytes to add to the encoded message byte array, the updated 'index
//         value and any errors that occurred during encoding.
//*****************************************************************************
function encodeUInt16(element, _elementDetails, index) {

  var output = {"encodedValue" : [], "updatedIndex" : index, "errors" : ""};

  if ((element.value >= _elementDetails.min) &&
      (element.value <= _elementDetails.max)) {
    output.encodedValue.push((element.value >> 8) & 0xFF);
    output.encodedValue.push(element.value & 0xFF);
    output.updatedIndex = index + DOWNLINK_MSG_TYPE_ELEMENT_SIZE_UINT16 ;
  }
  else {
    // Add an error if out of range
    output.errors = ("Value out of range for " + element.name + ".");
  }
  return(output);
}

//*****************************************************************************
// Encodes an enumeration type downlink message element.
// @param element [in] The row read from the JSON object to encode.
// @param _elementDetails [in] The element data descriptor.
// @param index [in/out] The current index to the encoded message byte array.
// @return Bytes to add to the encoded message byte array, the updated 'index'
//         value and any errors that occurred during encoding.
//*****************************************************************************
function encodeEnum(element, _elementDetails, index) {

  var output = {"encodedValue" : [], "updatedIndex" : index, "errors" : ""};
  var enumEncoded = false;

  for (var elementEnumMember in _elementDetails.enumName) {
    if (element.value == elementEnumMember) {
      output.encodedValue.push(_elementDetails.
        enumName[elementEnumMember] & 0xFF);
      output.updatedIndex = index + DOWNLINK_MSG_TYPE_ELEMENT_SIZE_ENUM;
      enumEncoded = true;
      break;
    }
  }
  if (enumEncoded === false) {
    // Add an error if trying to encode an unknown enum value
    output.errors = ("Can't encode enum value " + element.value + ".");
  }
  return(output);
}

//*****************************************************************************
// Encodes an utc seconds type downlink message element.
// @param element [in] The row read from the JSON object to encode.
// @param _elementDetails [in] Unused element data descriptor.
// @param index [in/out] The current index to the encoded message byte array.
// @return Bytes to add to the encoded message byte array, the updated 'index'
//         value and any errors that occurred during encoding.
//*****************************************************************************
function encodeUTCSeconds(element, _elementDetails, index) {

  var output = {"encodedValue" : [], "updatedIndex" : index, "errors" : ""};
  var date = new Date(element.value);
  var utcSeconds = Math.floor(date.getTime() / 1000);

  output.encodedValue.push((utcSeconds >> 24) & 0xFF);
  output.encodedValue.push((utcSeconds >> 16) & 0xFF);
  output.encodedValue.push((utcSeconds >> 8) & 0xFF);
  output.encodedValue.push(utcSeconds & 0xFF);
  output.updatedIndex = index + DOWNLINK_MSG_TYPE_ELEMENT_SIZE_UTC_SECONDS;
  return(output);
}

//*****************************************************************************
// Encodes a character string type downlink message element.
// @param element [in] The row read from the JSON object to encode.
// @param _elementDetails [in] The element data descriptor.
// @param index [in/out] The current index to the encoded message byte array.
// @return Bytes to add to the encoded message byte array, the updated 'index'
//         value and any errors that occurred during encoding.
//*****************************************************************************
function encodeCharString(element, _elementDetails, index) {

  var output = {"encodedValue" : [], "updatedIndex" : index, "errors" : ""};

  if ((element.value.length >= _elementDetails.min) &&
      (element.value.length <= _elementDetails.max)) {

    for (var i = 0; i < element.value.length; i++) {
      output.encodedValue.push(element.value.charCodeAt(i));
    }
    // Char strings are null teminated
    output.encodedValue.push(0x0);
    output.updatedIndex = index + output.encodedValue.length;
  }
  else {
    // Add an error if trying to encode too many or too few characters
    output.errors = ("Too many or too few characters for " + element.name + ".");
  }
  return(output);
}

//*****************************************************************************
// Encodes an action type downlink message element.
// @param element [in] The row read from the JSON object to encode.
// @param _elementDetails [in] The element data descriptor.
// @param index [in/out] The current index to the encoded message byte array.
// @return Bytes to add to the encoded message byte array, the updated 'index'
//         value and any errors that occurred during encoding.
//*****************************************************************************
function encodeAction(element, _elementDetails, index) {

  var output = {"encodedValue" : [], "updatedIndex" : index, "errors" : ""};
  return(output);
}

//*****************************************************************************
// Encodes a float type downlink message element.
// @param element [in] The row read from the JSON object to encode.
// @param _elementDetails [in] The element data descriptor.
// @param index [in/out] The current index to the encoded message byte array.
// @return Bytes to add to the encoded message byte array, the updated 'index'
//         value and any errors that occurred during encoding.
//*****************************************************************************
function encodeFloat(element, _elementDetails, index) {

  var output = {"encodedValue" : [], "updatedIndex" : index, "errors" : ""};
  var floatBuffer = new ArrayBuffer(DOWNLINK_MSG_TYPE_ELEMENT_SIZE_FLOAT);
  var floatView = new DataView(floatBuffer);
  var floatIndex;

  floatView.setFloat32(0, element.value, false);
  for (floatIndex = 0;
       floatIndex < DOWNLINK_MSG_TYPE_ELEMENT_SIZE_FLOAT; floatIndex++) {
    output.encodedValue.push(floatView.getUint8(floatIndex));
  }
  output.updatedIndex = index + DOWNLINK_MSG_TYPE_ELEMENT_SIZE_FLOAT;
  return(output);
}

//*****************************************************************************
// Sorts the keys in the input JSON object data element in alphabetical
// ascending order. This makes the output predicatable.
// @param input [in] The input JSON object.
// @return The JSON object with its data element in ascending alphabetical
//         order.
//*****************************************************************************
function sortAscending(input) {

  var output = {};

  const sortedEntries = Object.entries(input.data).sort(([a], [b]) =>
    a.toLowerCase().localeCompare(b.toLowerCase()));
  const sortedData = {};
  for (const [key, value] of sortedEntries) {
    sortedData[key] = value;
  }
  output.data = sortedData;

  return(output);
}

//*****************************************************************************
// Revision Details.
//*****************************************************************************
const DOWNLINK_DECODE_API_VERSION_MAJOR = 0;
const DOWNLINK_DECODE_API_VERSION_MINOR = 1;

//@RS26X_DECODE_SIZES_START
//@RS26X_DECODE_SIZES_END

//@RS26X_DECODE_ENUMERATIONS_START
//@RS26X_DECODE_ENUMERATIONS_END

//@RS26X_DECODE_NS1_START
//@RS26X_DECODE_NS1_END

//*****************************************************************************
// Public functions.
//*****************************************************************************
function decodeDownlink(input) {

  var output = {};
  var errors = [];

  if (!input.bytes || input.bytes.length === 0) {
    errors.push("Empty payload.");
  }
  else if (input.bytes[0] == DOWNLINK_MSG_TYPE_GET_SENSOR_CONFIG) {
    output = decodeGetSensorDownlink(input.bytes, errors);
  }
  else if (input.bytes[0] == DOWNLINK_MSG_TYPE_SET_SENSOR_CONFIG) {
    output = decodeSetSensorDownlink(input.bytes, errors);
  }
  else {
    errors.push("Unknown downlink message type " + input.bytes[0] + ".");
  }
  return({"data" : output, "errors" : errors, "warnings" : []});
}

//*****************************************************************************
// Private functions.
//*****************************************************************************
function decodeGetSensorDownlink(input, errors) {

  var output = { "Message Type" : "Configuration Get", "Parameters" : [] };
  var index = 1;
  var found;

  // Get Downlink messages consist of tags only. Just need to add the parameter
  // name associated with the tag.
  while (index < input.length) {
    found = false;
    // Find the tag associated with the next item in list
    for (var row in parameterTableDecodeNS1) {
      if (row == input[index]) {
        output.Parameters.push(parameterTableDecodeNS1[row].name);
        found = true;
        break;
      }
    }
    if (!found) {
      errors.push("Unknown tag " + input[index] + " at byte " + index + ".");
    }
    index++;
  }
  return(output);
}

function decodeSetSensorDownlink(input, errors) {

  var output = { "Message Type" : "Configuration Set" };
  var index = 1;
  var elementOutput;

  // Process each part of the message
  while (index < input.length)
  {
    elementOutput = undefined;
    // Process the next element
    for (var row in parameterTableDecodeNS1) {
      if (row == input[index]) {
        elementOutput = parameterTableDecodeNS1[row].decoder(
                                                input,
                                                output,
                                                index,
                                                parameterTableDecodeNS1[row]
                                               );
        break;
      }
    }
    // Stop on an unknown tag: the size of what follows cannot be known
    if (elementOutput === undefined) {
      errors.push("Unknown tag " + input[index] + " at byte " + index + ".");
      break;
    }
    // Get updated output
    output = elementOutput.updatedInput;
    // Update payload index position
    index += elementOutput.bytesProcessed;
  }
  return(output);
}

//@RS26X_DECODE_STUBS_START
//@RS26X_DECODE_STUBS_END

//@RS26X_DECODE_ELEMENTS_START
//@RS26X_DECODE_ELEMENTS_END

//@RS26X_DECODE_VALUES_START
//@RS26X_DECODE_VALUES_END

exports.decodeUplink = decodeUplink;
exports.encodeDownlink = encodeDownlink;
exports.decodeDownlink = decodeDownlink;
