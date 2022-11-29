function decodeUplink(input) {
    let result = {
      data: {},
      errors: [],
      warnings: []
    };
    // return error if length of Bytes is not 8
    if (input.bytes.length != 8) {
        result.errors.push('Invalid uplink payload: length is not 8 byte');
        return result;
    }
    let pressure = readHex2bytes(input.bytes[3], input.bytes[4]);
    let batteryVoltage = input.bytes[7] * 0.1;
      // Decoded data
    result.data = {
      pressure: pressure,
      batteryVoltage: +batteryVoltage.toFixed(1),
    }
    return result;
}
/*
 * The readHex2bytes function is to decode a signed 16-bit integer
 * represented by 2 bytes.  
 */
function readHex2bytes(byte1, byte2) {
  let result = (byte1 << 8) | byte2;  // merge the two bytes
  // check whether input is signed as a negative number
  // by checking whether significant bit (leftmost) is 1
  let negative = byte1 & 0x80;
  // process negative value
  if (negative) {
    //result = ~(0xFFFF0000 | (result - 1)) * (-1);  // minus 1 and flip all bits
    result = result - 0x10000;
  }
  return result;
}
exports.decodeUplink = decodeUplink;