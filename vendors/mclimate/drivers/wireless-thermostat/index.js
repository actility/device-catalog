// DataCake
function Decoder(bytes, port){
    var decoded = decodeUplink({ bytes: bytes, fPort: port }).data;
    return decoded;
}

// Milesight
function Decode(port, bytes){
    var decoded = decodeUplink({ bytes: bytes, fPort: port }).data;
    return decoded;
}

// The Things Industries / Main
function decodeUplink(input) {
    try{
        var bytes = input.bytes;
        var data = {};
        function toBool(value){
            return value == '1';
        }
        function calculateTemperature(rawData){return (rawData - 400) / 10};
        function calculateHumidity(rawData){return (rawData * 100) / 256};
        function decbin(number) {
            if (number < 0) {
                number = 0xFFFFFFFF + number + 1
            }
            number = number.toString(2);
            return "00000000".substr(number.length) + number;
        }
        function handleKeepalive(bytes, data){
            var tempRaw = (bytes[1] << 8) | bytes[2];
            var temperature = calculateTemperature(tempRaw);
            var humidity = calculateHumidity(bytes[3]);
            var batteryVoltage = ((bytes[4] << 8) | bytes[5])/1000;

            var targetTemperature, powerSourceStatus, lux, pir;
        if(bytes[0] == 1){
            targetTemperature = bytes[6];
            powerSourceStatus = bytes[7];
            lux = (bytes[8] << 8) | bytes[9];
            pir = toBool(bytes[10]);
        }else{
            targetTemperature = ((bytes[6] << 8) | bytes[7])/10;
            powerSourceStatus = bytes[8];
            lux = (bytes[9] << 8) | bytes[10];
            pir = toBool(bytes[11]);
        }

            data.sensorTemperature = Number(temperature.toFixed(2));
            data.relativeHumidity = Number(humidity.toFixed(2));
            data.batteryVoltage = Number(batteryVoltage.toFixed(2));
            data.targetTemperature = targetTemperature;
            data.powerSourceStatus = powerSourceStatus;
            data.lux = lux;
            data.pir = pir;
            return data;
        }
    
        function handleResponse(bytes, data, keepaliveLength){
        var commands = bytes.map(function(byte){
            return ("0" + byte.toString(16)).substr(-2); 
        });
        commands = commands.slice(0,-keepaliveLength);
        var command_len = 0;
    
        commands.map(function (command, i) {
            switch (command) {
                case '04':
                    {
                        command_len = 2;
                        var hardwareVersion = commands[i + 1];
                        var softwareVersion = commands[i + 2];
                        data.deviceVersions = { hardware: Number(hardwareVersion), software: Number(softwareVersion) };
                    }
                break;
                case '12':
                    {
                        command_len = 1;
                        data.keepAliveTime = parseInt(commands[i + 1], 16);
                    }
                break;
                case '14':
                    {
                        command_len = 1;
                        data.childLock = toBool(parseInt(commands[i + 1], 16)) ;
                    }
                break;
                case '15':
                    {
                        command_len = 2;
                        data.temperatureRangeSettings = { min: parseInt(commands[i + 1], 16), max: parseInt(commands[i + 2], 16) };
                    }
                    break;
                case '19':
                    {
                        command_len = 1;
                        var commandResponse = parseInt(commands[i + 1], 16);
                        var periodInMinutes = commandResponse * 5 / 60;
                        data.joinRetryPeriod =  periodInMinutes;
                    }
                break;
                case '1b':
                    {
                        command_len = 1;
                        data.uplinkType = parseInt(commands[i + 1], 16) ;
                    }
                break;
                case '1d':
                    {
                        command_len = 2;
                        var wdpC = commands[i + 1] == '00' ? false : (parseInt(commands[i + 1], 16))
                        var wdpUc = commands[i + 2] == '00' ? false : parseInt(commands[i + 2], 16);
                        data.watchDogParams= { wdpC: wdpC, wdpUc: wdpUc } ;
                    }
                break;
                case '2f':
                    {
                        command_len = 1;
                        data.targetTemperature = parseInt(commands[i + 1], 16) ;
                    }
                break;
                case '30':
                    {
                        command_len = 1;
                        data.manualTargetTemperatureUpdate = parseInt(commands[i + 1], 16) ;
                    }
                break;
                case '32':
                    {
                        command_len = 1;
                        data.heatingStatus = parseInt(commands[i + 1], 16) ;
                    }
                break;
                case '34':
                    {
                        command_len = 1;
                        data.displayRefreshPeriod = parseInt(commands[i + 1], 16) ;
                    }
                break;
                case '36':
                    {
                        command_len = 1;
                        data.sendTargetTempDelay = parseInt(commands[i + 1], 16) ;
                    }
                break;
                case '38':
                    {
                        command_len = 1;
                        data.automaticHeatingStatus = parseInt(commands[i + 1], 16) ;
                    }
                break;
                case '3a':
                    {
                        command_len = 1;
                        data.sensorMode = parseInt(commands[i + 1], 16) ;
                    }
                break;
                case '3d':
                    {
                        command_len = 1;
                        data.pirSensorStatus = parseInt(commands[i + 1], 16) ;
                    }
                break;
                case '3f':
                    {
                        command_len = 1;
                        data.pirSensorSensitivity = parseInt(commands[i + 1], 16) ;
                    }
                break;
                case '41':
                    {
                        command_len = 1;
                        data.currentTemperatureVisibility = parseInt(commands[i + 1], 16) ;
                    }
                break;
                case '43':
                    {
                        command_len = 1;
                        data.humidityVisibility = parseInt(commands[i + 1], 16) ;
                    }
                break;
                case '45':
                    {
                        command_len = 1;
                        data.lightIntensityVisibility = parseInt(commands[i + 1], 16) ;
                    }
                break;
                case '47':
                    {
                        command_len = 1;
                        data.pirInitPeriod = parseInt(commands[i + 1], 16) ;
                    }
                break;
                case '49':
                    {
                        command_len = 1;
                        data.pirMeasurementPeriod = parseInt(commands[i + 1], 16) ;
                    }
                break;
                case '4b':
                    {
                        command_len = 1;
                        data.pirCheckPeriod = parseInt(commands[i + 1], 16) ;
                    }
                break;
                case '4d':
                    {
                        command_len = 1;
                        data.pirBlindPeriod = parseInt(commands[i + 1], 16) ;
                    }
                break;
                case '4f':
                    {
                        command_len = 1;
                        data.temperatureHysteresis = parseInt(commands[i + 1], 16)/10 ;
                    }
                break;
                case '51':
                    {
                        command_len = 2;
                        data.targetTemperature = ((parseInt(commands[i + 1], 16) << 8) | parseInt(commands[i + 2], 16))/10  ;
                    }
                break;
                case '53':
                    {
                        command_len = 1;
                        data.targetTemperatureStep = parseInt(commands[i + 1], 16) / 10;
                    }
                break;
                case '54':
                    {
                        command_len = 2;
                        data.manualTargetTemperatureUpdate = ((parseInt(commands[i + 1], 16) << 8) | parseInt(commands[i + 2], 16))/10;
                    }
                break;
                case 'a0': {
                    command_len = 4;
                    var fuota_address = (parseInt(commands[i + 1], 16) << 24) | 
                                        (parseInt(commands[i + 2], 16) << 16) | 
                                        (parseInt(commands[i + 3], 16) << 8) | 
                                        parseInt(commands[i + 4], 16);
                    var fuota_address_raw = commands[i + 1] + commands[i + 2] + 
                                            commands[i + 3] + commands[i + 4];
                    
                    data.fuota = { fuota_address: fuota_address, fuota_address_raw: fuota_address_raw };
                    break;
                }
                default:
                    break;
            }
            commands.splice(i,command_len);
        });
        return data;
        }
        if (bytes[0] == 1|| bytes[0] == 129) {
            data = handleKeepalive(bytes, data);
        }else{
            var keepaliveLength = 11;
            var potentialKeepAlive = bytes.slice(-12);
            if(potentialKeepAlive[0] == 129) keepaliveLength = 12;
            data = handleResponse(bytes,data, keepaliveLength);
            bytes = bytes.slice(-keepaliveLength);
            data = handleKeepalive(bytes, data);
        }
        return {data: data};
    } catch (e) {
        console.log(e)
        throw new Error('Unhandled data');
    }
}

// Milesight
function Encode(port, obj) {
  return encodeDownlink({ fPort: port, data: obj }).bytes;
}

function Encoder(port, obj) {
  return Encode(port, obj);
}

// The Things Industries / Main
function encodeDownlink(input) {
  var bytes = [];
  var data = (input && input.data) ? input.data : {};

  for (var key in data) {
    if (!data.hasOwnProperty(key)) continue;

    switch (key) {
      case "setKeepAlive": {
        bytes.push(0x02);
        bytes.push(data.setKeepAlive & 0xFF);
        break;
      }
      case "getKeepAliveTime": {
        bytes.push(0x12);
        break;
      }
      case "getDeviceVersions": {
        bytes.push(0x04);
        break;
      }

      case "setTargetTemperature": {
        var t = data.setTargetTemperature;     // e.g. 20
        var v = Math.round(t * 10) & 0xFFFF;   // 20.0 -> 200 (0x00C8)

        bytes.push(0x2E);
        bytes.push((v >> 8) & 0xFF);           // high byte
        bytes.push(v & 0xFF);                  // low byte
        break;
      }

      case "getTargetTemperature": {
        bytes.push(0x2F);
        break;
      }

      case "setKeysLock": {
        bytes.push(0x07);
        bytes.push(data.setKeysLock & 0xFF);
        break;
      }
      case "getKeysLock": {
        bytes.push(0x14);
        break;
      }

      case "setTemperatureRange": {
        bytes.push(0x08);
        bytes.push(data.setTemperatureRange.min & 0xFF);
        bytes.push(data.setTemperatureRange.max & 0xFF);
        break;
      }
      case "getTemperatureRange": {
        bytes.push(0x15);
        break;
      }

      case "setJoinRetryPeriod": {
        var periodToPass = (data.setJoinRetryPeriod * 60) / 5;
        periodToPass = Math.floor(periodToPass);
        if (periodToPass < 0) periodToPass = 0;
        if (periodToPass > 255) periodToPass = 255;

        bytes.push(0x10);
        bytes.push(periodToPass & 0xFF);
        break;
      }
      case "getJoinRetryPeriod": {
        bytes.push(0x19);
        break;
      }

      case "setUplinkType": {
        bytes.push(0x11);
        bytes.push(data.setUplinkType & 0xFF);
        break;
      }
      case "getUplinkType": {
        bytes.push(0x1B);
        break;
      }

      case "setWatchDogParams": {
        bytes.push(0x1C);
      }
      case "getWatchDogParams": {
        bytes.push(0x1D);
        break;
      }

      case "restartDevice": {
        bytes.push(0xA5);
        break;
      }

      case "sendCustomHexCommand": {
        var hex = data.sendCustomHexCommand;
        for (var i = 0; i < hex.length; i += 2) {
          var b = parseInt(hex.substr(i, 2), 16);
          bytes.push(b & 0xFF);
        }
        break;
      }

      default: {
        break;
      }
    }
  }

  return {
    bytes: bytes,
    fPort: 1,
    warnings: [],
    errors: [],
  };
}

function decodeDownlink(input) {
  return {
    data: { bytes: input.bytes },
    warnings: [],
    errors: [],
  };
}

// Example downlink commands
// {"setTargetTemperature":20} --> 2E00C8
// {"setTemperatureRange":{"min":15,"max":21}} --> 080F15
// {"sendCustomHexCommand":"080F15"} --> 080F15

exports.decodeUplink = decodeUplink;
exports.encodeDownlink = encodeDownlink;
exports.decodeDownlink = decodeDownlink;
