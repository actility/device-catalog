function readUInt32LE(bytes, startIndex) {
  return (
    bytes[startIndex] +
    (bytes[startIndex + 1] << 8) +
    (bytes[startIndex + 2] << 16) +
    (bytes[startIndex + 3] * 0x1000000)
  ) >>> 0;
}

function decodeTemperatureSigned16(firstByte, secondByte) {
  var raw = (firstByte << 8) | secondByte;
  if ((raw & 0x8000) !== 0) {
    raw = raw - 0x10000;
  }
  return raw;
}

function decodeUplink(input) {
  if (input.fPort !== 1) {
    return {
      errors: ['unknown FPort'],
    };
  }

  if (!input.bytes || (input.bytes.length !== 13 && input.bytes.length !== 15)) {
    return {
      errors: ['invalid payload length'],
    };
  }

  var bytes = input.bytes;
  var data = {};

  data.application = bytes[0];

  // Payload description from the user manual: two 4-byte counters, little-endian.
  data.valueCounter = readUInt32LE(bytes, 1);
  data.reverseFlowCounter = readUInt32LE(bytes, 5);

  data.indexK = bytes[9];
  if (data.indexK === 0) {
    data.kValue = 1;
  } else if (data.indexK === 1) {
    data.kValue = 10;
  } else if (data.indexK === 2) {
    data.kValue = 100;
  }

  data.medium = bytes[10];

  var vifCode = bytes[11];
  data.vif = vifCode;
  if (vifCode === 0x13) {
    data.counterUnit = 'l';
    data.counterScale = 1;
  } else if (vifCode === 0x14) {
    data.counterUnit = 'dal';
    data.counterScale = 10;
  } else if (vifCode === 0x15) {
    data.counterUnit = 'hl';
    data.counterScale = 100;
  } else if (vifCode === 0x16) {
    data.counterUnit = 'm3';
    data.counterScale = 1000;
  }

  var alarms = bytes[12];
  data.alarmFlags = alarms;
  data.alarms = {
    magnetic: (alarms & 0x01) !== 0,
    removal: (alarms & 0x02) !== 0,
    sensorFraud: (alarms & 0x04) !== 0,
    leakage: (alarms & 0x08) !== 0,
    reverseFlow: (alarms & 0x10) !== 0,
    lowBattery: (alarms & 0x20) !== 0,
  };

  if (bytes.length === 15) {
    data.temperatureRaw = decodeTemperatureSigned16(bytes[13], bytes[14]);
  }

  return {
    data: data,
  };
}

exports.decodeUplink = decodeUplink;
