function decodeUplink(input) {
  var bytes = input.bytes;
  var payload = bytes2HexString(bytes).toUpperCase();

  return {
    data: {
      err: 0,
      payload: payload,
      valid: true,
      messages: dataSplit(payload).map(function (item) {
        return dataIdAndDataValueJudge(item.dataId, item.dataValue);
      }),
    },
  };
}

function dataSplit(bytes) {
  var frameArray = [];
  var remaining = bytes.toLowerCase();

  while (remaining.length > 0) {
    var dataId = remaining.substring(0, 2);
    var dataValue = '';
    var consumedLength = 0;

    switch (dataId) {
      case '01':
      case '20':
      case '21':
      case '30':
      case '31':
      case '33':
      case '40':
      case '41':
      case '42':
      case '43':
      case '44':
      case '45':
      case '46':
      case '48':
        dataValue = remaining.substring(2, 22);
        consumedLength = 22;
        break;
      case '02':
        dataValue = remaining.substring(2, 18);
        consumedLength = 18;
        break;
      case '03':
      case '06':
        dataValue = remaining.substring(2, 4);
        consumedLength = 4;
        break;
      case '05':
      case '34':
        dataValue = remaining.substring(2, 10);
        consumedLength = 10;
        break;
      case '04':
      case '10':
      case '32':
      case '35':
      case '36':
      case '37':
      case '38':
      case '39':
        dataValue = remaining.substring(2, 20);
        consumedLength = 20;
        break;
      case '47':
        dataValue = remaining.substring(2, 14);
        consumedLength = 14;
        break;
      case '49':
        dataValue = remaining.substring(2, 16);
        consumedLength = 16;
        break;
      case '7f':
        remaining = remaining.substring(4);
        continue;
      default:
        remaining = '';
        continue;
    }

    if (dataValue.length < 2) {
      break;
    }

    frameArray.push({ dataId: dataId, dataValue: dataValue });
    remaining = remaining.substring(consumedLength);
  }

  return frameArray;
}

function dataIdAndDataValueJudge(dataId, dataValue) {
  var messages = [];

  switch (dataId) {
    case '01':
      messages = [
        {
          measurementValue: loraWanV2DataFormat(dataValue.substring(0, 4), 10),
          measurementId: '4097',
          type: 'Air Temperature',
        },
        {
          measurementValue: loraWanV2DataFormat(dataValue.substring(4, 6)),
          measurementId: '4098',
          type: 'Air Humidity',
        },
        {
          measurementValue: loraWanV2DataFormat(dataValue.substring(6, 14)),
          measurementId: '4099',
          type: 'Light Intensity',
        },
        {
          measurementValue: loraWanV2DataFormat(dataValue.substring(14, 16), 10),
          measurementId: '4190',
          type: 'UV Index',
        },
        {
          measurementValue: loraWanV2DataFormat(dataValue.substring(16, 20), 10),
          measurementId: '4105',
          type: 'Wind Speed',
        },
      ];
      break;
    case '02':
      messages = [
        {
          measurementValue: loraWanV2DataFormat(dataValue.substring(0, 4)),
          measurementId: '4104',
          type: 'Wind Direction Sensor',
        },
        {
          measurementValue: loraWanV2DataFormat(dataValue.substring(4, 12), 1000),
          measurementId: '4113',
          type: 'Rain Gauge',
        },
        {
          measurementValue: loraWanV2DataFormat(dataValue.substring(12, 16), 0.1),
          measurementId: '4101',
          type: 'Barometric Pressure',
        },
      ];
      break;
    case '03':
      messages = [{ 'Battery(%)': loraWanV2DataFormat(dataValue) }];
      break;
    case '04':
      messages = [
        {
          'Battery(%)': loraWanV2DataFormat(dataValue.substring(0, 2)),
          'Hardware Version': loraWanV2DataFormat(dataValue.substring(2, 4)) + '.' + loraWanV2DataFormat(dataValue.substring(4, 6)),
          'Firmware Version': loraWanV2DataFormat(dataValue.substring(6, 8)) + '.' + loraWanV2DataFormat(dataValue.substring(8, 10)),
          measureInterval: parseInt(loraWanV2DataFormat(dataValue.substring(10, 14)), 10) * 60,
          gpsInterval: parseInt(loraWanV2DataFormat(dataValue.substring(14, 18)), 10) * 60,
        },
      ];
      break;
    case '05':
      messages = [
        {
          measureInterval: parseInt(loraWanV2DataFormat(dataValue.substring(0, 4)), 10) * 60,
          gpsInterval: parseInt(loraWanV2DataFormat(dataValue.substring(4, 8)), 10) * 60,
        },
      ];
      break;
    case '06':
      messages = [
        {
          measurementId: '4101',
          type: 'sensor_error_event',
          errCode: dataValue,
          descZh: sensorErrorDescription(dataValue),
        },
      ];
      break;
    case '10': {
      var statusBits = loraWanV2BitDataFormat(dataValue.substring(0, 2));
      messages = [
        {
          status: statusBits.status,
          channelType: statusBits.type,
          sensorEui: dataValue.substring(2),
        },
      ];
      break;
    }
    case '46': {
      var measurementTime = loraWanV2PositiveDataFormat(dataValue.substring(0, 8)) * 1000;
      var offlineValues = [
        loraWanSensorFormat(dataValue.substring(8, 12), 100),
        loraWanSensorFormat(dataValue.substring(12, 16), 100),
        loraWanSensorFormat(dataValue.substring(16, 20), 100),
      ];

      offlineValues.forEach(function (value, index) {
        if (value !== null) {
          messages.push({
            measurementValue: value,
            measurementId: '4203',
            type: 'Temperature',
            measurementChannel: String(index + 1),
            measureTime: measurementTime,
          });
        }
      });
      break;
    }
    case '47': {
      var liveValues = [
        loraWanSensorFormat(dataValue.substring(0, 4), 100),
        loraWanSensorFormat(dataValue.substring(4, 8), 100),
        loraWanSensorFormat(dataValue.substring(8, 12), 100),
      ];

      liveValues.forEach(function (value, index) {
        if (value !== null) {
          messages.push({
            measurementValue: value,
            measurementId: '4203',
            type: 'Temperature',
            measurementChannel: String(index + 1),
          });
        }
      });
      break;
    }
    case '48':
      for (var channelIndex = 0; channelIndex < dataValue.length; channelIndex += 2) {
        var channelStatusHex = dataValue.substring(channelIndex, channelIndex + 2);

        if (channelStatusHex.toLowerCase() === 'ff') {
          continue;
        }

        var channelStatus = loraWanV2DataFormat(channelStatusHex);
        var statusString = 'normal';
        if (parseInt(channelStatus, 10) === 0) {
          statusString = 'idle';
        } else if (parseInt(channelStatus, 10) === 2) {
          statusString = 'abnormal';
        }

        messages.push({
          channel_index: String(1 + channelIndex / 2),
          status: statusString,
          channelType: '1',
        });
      }
      break;
    case '49':
      messages = [
        {
          'Battery(%)': loraWanV2DataFormat(dataValue.substring(0, 2)),
          'Hardware Version': loraWanV2DataFormat(dataValue.substring(2, 4)) + '.' + loraWanV2DataFormat(dataValue.substring(4, 6)),
          'Firmware Version': loraWanV2DataFormat(dataValue.substring(6, 8)) + '.' + loraWanV2DataFormat(dataValue.substring(8, 10)),
          measureInterval: parseInt(loraWanV2DataFormat(dataValue.substring(10, 14)), 10) * 60,
        },
      ];
      break;
    default:
      break;
  }

  return messages;
}

function sensorErrorDescription(errorCode) {
  switch (errorCode) {
    case '00':
      return 'CCL_SENSOR_ERROR_NONE';
    case '01':
      return 'CCL_SENSOR_NOT_FOUND';
    case '02':
      return 'CCL_SENSOR_WAKEUP_ERROR';
    case '03':
      return 'CCL_SENSOR_NOT_RESPONSE';
    case '04':
      return 'CCL_SENSOR_DATA_EMPTY';
    case '05':
      return 'CCL_SENSOR_DATA_HEAD_ERROR';
    case '06':
      return 'CCL_SENSOR_DATA_CRC_ERROR';
    case '07':
      return 'CCL_SENSOR_DATA_B1_NO_VALID';
    case '08':
      return 'CCL_SENSOR_DATA_B2_NO_VALID';
    case '09':
      return 'CCL_SENSOR_RANDOM_NOT_MATCH';
    case '0A':
      return 'CCL_SENSOR_PUBKEY_SIGN_VERIFY_FAILED';
    case '0B':
      return 'CCL_SENSOR_DATA_SIGN_VERIFY_FAILED';
    case '0C':
      return 'CCL_SENSOR_DATA_VALUE_HI';
    case '0D':
      return 'CCL_SENSOR_DATA_VALUE_LOW';
    case '0E':
      return 'CCL_SENSOR_DATA_VALUE_MISSED';
    case '0F':
      return 'CCL_SENSOR_ARG_INVAILD';
    case '10':
      return 'CCL_SENSOR_RS485_MASTER_BUSY';
    case '11':
      return 'CCL_SENSOR_RS485_REV_DATA_ERROR';
    case '12':
      return 'CCL_SENSOR_RS485_REG_MISSED';
    case '13':
      return 'CCL_SENSOR_RS485_FUN_EXE_ERROR';
    case '14':
      return 'CCL_SENSOR_RS485_WRITE_STRATEGY_ERROR';
    case '15':
      return 'CCL_SENSOR_CONFIG_ERROR';
    case 'FF':
      return 'CCL_SENSOR_DATA_ERROR_UNKONW';
    default:
      return 'CC_OTHER_FAILED';
  }
}

function loraWanV2DataFormat(str, divisor) {
  var actualDivisor = divisor === undefined ? 1 : divisor;
  var binary = toBinary(bigEndianTransform(str));

  if (binary.substring(0, 1) === '1') {
    var reverse = binary.split('').map(function (item) {
      return parseInt(item, 10) === 1 ? 0 : 1;
    }).join('');
    return parseFloat('-' + (parseInt(reverse, 2) + 1) / actualDivisor);
  }

  return parseInt(binary, 2) / actualDivisor;
}

function loraWanSensorFormat(str, divisor) {
  if (str === '8000') {
    return null;
  }
  return loraWanV2DataFormat(str, divisor);
}

function bigEndianTransform(data) {
  var dataArray = [];
  for (var index = 0; index < data.length; index += 2) {
    dataArray.push(data.substring(index, index + 2));
  }
  return dataArray;
}

function loraWanV2PositiveDataFormat(str, divisor) {
  var actualDivisor = divisor === undefined ? 1 : divisor;
  return parseInt(toBinary(bigEndianTransform(str)), 2) / actualDivisor;
}

function toBinary(arr) {
  return arr.map(function (item) {
    var data = parseInt(item, 16).toString(2);
    while (data.length < 8) {
      data = '0' + data;
    }
    return data;
  }).join('');
}

function loraWanV2BitDataFormat(str) {
  var binary = toBinary(bigEndianTransform(str));
  return {
    channel: parseInt(binary.substring(0, 4), 2),
    status: parseInt(binary.substring(4, 5), 2),
    type: parseInt(binary.substring(5), 2),
  };
}

function bytes2HexString(arrBytes) {
  var str = '';
  for (var index = 0; index < arrBytes.length; index++) {
    var num = arrBytes[index];
    var tmp = num < 0 ? (255 + num + 1).toString(16) : num.toString(16);
    if (tmp.length === 1) {
      tmp = '0' + tmp;
    }
    str += tmp;
  }
  return str;
}