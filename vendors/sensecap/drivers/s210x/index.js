/**
 * SenseCAP new Converter
 *
 * @since 3.0
 * @return Object
 *      @param  Boolean     valid       Indicates whether the payload is a valid payload.
 *      @param  String      err         The reason for the payload to be invalid. 0 means valid, minus means invalid.
 *      @param  String      payload     Hexadecimal string, to show the payload.
 *      @param  Array       messages    One or more messages are parsed according to payload.
 *                              type // Enum:
 *                                   //   - "report_telemetry"
 *                                   //   - "upload_battery"
 *                                   //   - "upload_interval"
 *                                   //   - "upload_version"
 *                                   //   - "upload_sensor_id"
 *                                   //   - "report_remove_sensor"
 *                                   //   - "unknown_message"
 */

function decodeUplink(input) {
  var bytes = input['bytes'];
  // init
  var bytesString = bytes2HexString(bytes).toLocaleUpperCase();
  var decoded = {
    // valid
    valid: true,
    err: 0,
    // bytes
    payload: bytesString,
    // messages array
    messages: [],
  };

  // CRC check
  if (!crc16Check(bytesString)) {
    return {errors: ["crc check fail"]};
  }

  // Length Check
  if ((bytesString.length / 2 - 2) % 7 !== 0) {
    return {errors: ["length check fail"]};
  }

  // Cache sensor id
  var sensorEuiLowBytes;
  var sensorEuiHighBytes;

  // Handle each frame
  var frameArray = divideBy7Bytes(bytesString);
  for (var forFrame = 0; forFrame < frameArray.length; forFrame++) {
    var frame = frameArray[forFrame];
    // Extract key parameters
    var channel = strTo10SysNub(frame.substring(0, 2));
    var dataID = strTo10SysNub(frame.substring(2, 6));
    var dataValue = frame.substring(6, 14);
    var realDataValue = isSpecialDataId(dataID) ? dataSpecialFormat(dataID, dataValue) : dataFormat(dataValue);

    if (checkDataIdIsMeasureUpload(dataID)) {
      // if telemetry.
      decoded.messages.push({
        type: 'report_telemetry',
        measurementId: dataID,
        measurementValue: realDataValue,
      });
    } else if (isSpecialDataId(dataID) || dataID === 5 || dataID === 6) {
      // if special order, except "report_sensor_id".
      switch (dataID) {
        case 0x00:
          // node version
          var versionData = sensorAttrForVersion(realDataValue);
          decoded.messages.push({
            type: 'upload_version',
            hardwareVersion: versionData.ver_hardware,
            softwareVersion: versionData.ver_software,
          });
          break;
        case 1:
          // sensor version
          break;
        case 2:
          // sensor eui, low bytes
          sensorEuiLowBytes = realDataValue;
          break;
        case 3:
          // sensor eui, high bytes
          sensorEuiHighBytes = realDataValue;
          break;
        case 7:
          // battery power && interval
          decoded.messages.push(
              {
                type: 'upload_battery',
                battery: realDataValue.power,
              },
              {
                type: 'upload_interval',
                interval: parseInt(realDataValue.interval) * 60,
              }
          );
          break;
        case 0x120:
          // remove sensor
          decoded.messages.push({
            type: 'report_remove_sensor',
            channel: 1,
          });
          break;
        default:
          break;
      }
    } else {
      decoded.messages.push({
        type: 'unknown_message',
        dataID: dataID,
        dataValue: dataValue,
      });
    }
  }

  // if the complete id received, as "upload_sensor_id"
  if (sensorEuiHighBytes && sensorEuiLowBytes) {
    decoded.messages.unshift({
      type: 'upload_sensor_id',
      channel: 1,
      sensorId: (sensorEuiHighBytes + sensorEuiLowBytes).toUpperCase(),
    });
  }

  enrichMeasurements(decoded.messages);
  return {data: decoded, errors: [], warnings: []};
}

function crc16Check(data) {
  return true;
}

// util
function bytes2HexString(arrBytes) {
  var str = '';
  for (var i = 0; i < arrBytes.length; i++) {
    var tmp;
    var num = arrBytes[i];
    if (num < 0) {
      tmp = (255 + num + 1).toString(16);
    } else {
      tmp = num.toString(16);
    }
    if (tmp.length === 1) {
      tmp = '0' + tmp;
    }
    str += tmp;
  }
  return str;
}

// util
function divideBy7Bytes(str) {
  var frameArray = [];
  for (var i = 0; i < str.length - 4; i += 14) {
    var data = str.substring(i, i + 14);
    frameArray.push(data);
  }
  return frameArray;
}

// util
function littleEndianTransform(data) {
  var dataArray = [];
  for (var i = 0; i < data.length; i += 2) {
    dataArray.push(data.substring(i, i + 2));
  }
  dataArray.reverse();
  return dataArray;
}

// util
function strTo10SysNub(str) {
  var arr = littleEndianTransform(str);
  return parseInt(arr.toString().replace(/,/g, ''), 16);
}

// util
function checkDataIdIsMeasureUpload(dataId) {
  return parseInt(dataId) > 4096;
}

// configurable.
function isSpecialDataId(dataID) {
  switch (dataID) {
    case 0:
    case 1:
    case 2:
    case 3:
    case 4:
    case 7:
    case 0x120:
      return true;
    default:
      return false;
  }
}

// configurable
function dataSpecialFormat(dataId, str) {
  var strReverse = littleEndianTransform(str);
  if (dataId === 2 || dataId === 3) {
    return strReverse.join('');
  }

  // handle unsigned number
  var str2 = toBinary(strReverse);

  var dataArray = [];
  switch (dataId) {
    case 0: // DATA_BOARD_VERSION
    case 1: // DATA_SENSOR_VERSION
      // Using point segmentation
      for (var k = 0; k < str2.length; k += 16) {
        var tmp146 = str2.substring(k, k + 16);
        tmp146 = (parseInt(tmp146.substring(0, 8), 2) || 0) + '.' + (parseInt(tmp146.substring(8, 16), 2) || 0);
        dataArray.push(tmp146);
      }
      return dataArray.join(',');
    case 4:
      for (var i = 0; i < str2.length; i += 8) {
        var item = parseInt(str2.substring(i, i + 8), 2);
        if (item < 10) {
          item = '0' + item.toString();
        } else {
          item = item.toString();
        }
        dataArray.push(item);
      }
      return dataArray.join('');
    case 7:
      // battery && interval
      return {
        interval: parseInt(str2.substr(0, 16), 2),
        power: parseInt(str2.substr(-16, 16), 2),
      };
  }
}

// util
function dataFormat(str) {
  var strReverse = littleEndianTransform(str);
  var str2 = toBinary(strReverse);
  if (str2.substring(0, 1) === '1') {
    var arr = str2.split('');
    var reverseArr = [];
    for (var forArr = 0; forArr < arr.length; forArr++) {
      var item = arr[forArr];
      if (parseInt(item) === 1) {
        reverseArr.push(0);
      } else {
        reverseArr.push(1);
      }
    }
    str2 = parseInt(reverseArr.join(''), 2) + 1;
    return parseFloat('-' + str2 / 1000);
  }
  return parseInt(str2, 2) / 1000;
}

// util
function sensorAttrForVersion(dataValue) {
  var dataValueSplitArray = dataValue.split(',');
  return {
    ver_hardware: dataValueSplitArray[0],
    ver_software: dataValueSplitArray[1],
  };
}

// util
function toBinary(arr) {
  var binaryData = [];
  for (var forArr = 0; forArr < arr.length; forArr++) {
    var item = arr[forArr];
    var data = parseInt(item, 16).toString(2);
    var dataLength = data.length;
    if (data.length !== 8) {
      for (var i = 0; i < 8 - dataLength; i++) {
        data = '0' + data;
      }
    }
    binaryData.push(data);
  }
  return binaryData.toString().replace(/,/g, '');
}

function enrichMeasurements(messages){
  for(let message of messages){
    switch(message.measurementId){
      case 4097:
        message.measurement = "Air Temperature";
        message.unit = "Cel";
        break;
      case 4098:
        message.measurement = "Air Humidity";
        message.unit = "%RH";
        break;
      case 4099:
        message.measurement = "Light Intensity";
        message.unit = "lx";
        break;
      case 4100:
        message.measurement = "CO2";
        message.unit = "ppm";
        break;
      case 4101:
        message.measurement = "Barometric Pressure";
        message.unit = "Pa";
        break;
      case 4102:
        message.measurement = "Soil Temperature";
        message.unit = "Cel";
        break;
      case 4103:
        message.measurement = "Soil Moisture";
        message.unit = "%";
        break;
      case 4104:
        message.measurement = "Wind direction";
        message.unit = "deg";
        break;
      case 4105:
        message.measurement = "Wind speed";
        message.unit = "m/s";
        break;
      case 4106:
        message.measurement = "pH";
        message.unit = "pH";
        break;
      case 4107:
        message.measurement = "Light Quantum";
        message.unit = "umol/m2.s";
        break;
      case 4108:
        message.measurement = "Electrical Conductivity";
        message.unit = "dS/m";
        break;
      case 4109:
        message.measurement = "Dissolved Oxygen";
        message.unit = "mg/L";
        break;
      case 4110:
        message.measurement = "Soil Volumetric Water Content";
        message.unit = "%";
        break;
      case 4113:
        message.measurement = "Rainfall Hourly";
        message.unit = "mm/h";
        break;
      case 4115:
        message.measurement = "Distance";
        message.unit = "cm";
        break;
      case 4116:
        message.measurement = "Water Leak";
        break;
      case 4117:
        message.measurement = "Liquid Level";
        message.unit = "cm";
        break;
      case 4118:
        message.measurement = "NH3";
        message.unit = "ppm";
        break;
      case 4119:
        message.measurement = "H2S";
        message.unit = "ppm";
        break;
      case 4120:
        message.measurement = "Flow Rate";
        message.unit = "m3/h";
        break;
      case 4121:
        message.measurement = "Total Flow";
        message.unit = "m3";
        break;
      case 4122:
        message.measurement = "Oxygen Concentration";
        message.unit = "%vol";
        break;
      case 4123:
        message.measurement = "Water Electrical Conductivity";
        message.unit = "uS/cm";
        break;
      case 4124:
        message.measurement = "Water Temperature";
        message.unit = "Cel";
        break;
      case 4125:
        message.measurement = "Soil Heat Flux";
        message.unit = "W/m2";
        break;
      case 4126:
        message.measurement = "Sunshine Duration";
        message.unit = "h";
        break;
      case 4127:
        message.measurement = "Total Solar Radiation";
        message.unit = "W/m2";
        break;
      case 4128:
        message.measurement = "Water Surface Evaporation";
        message.unit = "mm";
        break;
      case 4129:
        message.measurement = "Photosynthetically Active Radiation";
        message.unit = "umol/m2s";
        break;
      case 4130:
        message.measurement = "Accelerometer";
        message.unit = "m/s";
        break;
      case 4131:
        message.measurement = "Sound Intensity";
        break;
      case 4133:
        message.measurement = "Soil Tension";
        message.unit = "kPa";
        break;
      case 4134:
        message.measurement = "Salinity";
        message.unit = "mg/L";
        break;
      case 4135:
        message.measurement = "TDS";
        message.unit = "mg/L";
        break;
      case 4136:
        message.measurement = "Leaf Temperature";
        message.unit = "Cel";
        break;
      case 4137:
        message.measurement = "Leaf Wetness";
        message.unit = "%";
        break;
      case 4138:
        message.measurement = "Soil Moisture-10cm";
        message.unit = "%";
        break;
      case 4139:
        message.measurement = "Soil Moisture-20cm";
        message.unit = "%";
        break;
      case 4140:
        message.measurement = "Soil Moisture-30cm";
        message.unit = "%";
        break;
      case 4141:
        message.measurement = "Soil Moisture-40cm";
        message.unit = "%";
        break;
      case 4142:
        message.measurement = "Soil Temperature-10cm";
        message.unit = "Cel";
        break;
      case 4143:
        message.measurement = "Soil Temperature-20cm";
        message.unit = "Cel";
        break;
      case 4144:
        message.measurement = "Soil Temperature-30cm";
        message.unit = "Cel";
        break;
      case 4145:
        message.measurement = "Soil Temperature-40cm";
        message.unit = "Cel";
        break;
      case 4146:
        message.measurement = "PM2.5";
        message.unit = "ug/m3";
        break;
      case 4147:
        message.measurement = "PM10";
        message.unit = "ug/m3";
        break;
      case 4148:
        message.measurement = "Noise";
        message.unit = "dB";
        break;
      case 4150:
        message.measurement = "AccelerometerX";
        message.unit = "m/s2";
        break;
      case 4151:
        message.measurement = "AccelerometerY";
        message.unit = "m/s2";
        break;
      case 4152:
        message.measurement = "AccelerometerZ";
        message.unit = "m/s2";
        break;
      case 4154:
        message.measurement = "Salinity";
        message.unit = "PSU";
        break;
      case 4155:
        message.measurement = "ORP";
        message.unit = "mV";
        break;
      case 4156:
        message.measurement = "Turbidity";
        message.unit = "NTU";
        break;
      case 4157:
        message.measurement = "Ammonia ion";
        message.unit = "mg/L";
        break;
      case 4162:
        message.measurement = "N Content";
        message.unit = "mg/kg";
        break;
      case 4163:
        message.measurement = "P Content";
        message.unit = "mg/kg";
        break;
      case 4164:
        message.measurement = "K Content";
        message.unit = "mg/kg";
        break;
      case 4175:
        message.measurement = "AI Detection No.01";
        break;
      case 4176:
        message.measurement = "AI Detection No.02";
        break;
      case 4177:
        message.measurement = "AI Detection No.03";
        break;
      case 4178:
        message.measurement = "AI Detection No.04";
        break;
      case 4179:
        message.measurement = "AI Detection No.05";
        break;
      case 4180:
        message.measurement = "AI Detection No.06";
        break;
      case 41781:
        message.measurement = "AI Detection No.07";
        break;
      case 4182:
        message.measurement = "AI Detection No.08";
        break;
      case 4183:
        message.measurement = "AI Detection No.09";
        break;
      case 4184:
        message.measurement = "AI Detection No.10";
        break;
      case 4190:
        message.measurement = "UV Index";
        break;
      case 4191:
        message.measurement = "Peak Wind Gust";
        message.unit = "m/s";
        break;
      case 4192:
        message.measurement = "Sound Intensity";
        message.unit = "dB";
        break;
      case 4193:
        message.measurement = "Light Intensity";
        break;
      case 4195:
        message.measurement = "TVOC";
        message.unit = "ppb";
        break;
      case 4196:
        message.measurement = "Soil moisture intensity";
        break;
      case 4197:
        message.measurement = "longitude";
        message.unit = "deg";
        break;
      case 4198:
        message.measurement = "latitude";
        message.unit = "deg";
        break;
      case 4199:
        message.measurement = "Light";
        message.unit = "%";
        break;
      case 4200:
        message.measurement = "SOS Event";
        break;
      case 4201:
        message.measurement = "Ultraviolet Radiation";
        message.unit = "W/m2";
        break;
      case 4202:
        message.measurement = "Dew point temperature";
        message.unit = "Cel";
        break;
      case 5001:
        message.measurement = "Wi-Fi MAC Address";
        break;
      case 5002:
        message.measurement = "Bluetooth Beacon MAC Address";
        break;
      case 5100:
        message.measurement = "Switch";
        break;
    }
  }
}

exports.decodeUplink = decodeUplink;