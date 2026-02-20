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
    try {
        var bytes = input.bytes;
        var data = {};

        function handleKeepalive(bytes, data) {
            // Byte 1 bit 2: Occupied flag
            var occupiedValue = (bytes[1] & 0x04) >> 2;
            data.occupied = occupiedValue === 1;
            
            // Byte 1 (bits 1:0) and Byte 2: Internal temperature sensor data
            // Formula: t[°C] = (T[9:0] - 400) / 10
            // Extract bits 1:0 from byte 1 for the higher bits (bits 9:8)
            var tempHighBits = (bytes[1] & 0x03) << 8;
            // Use all bits from byte 2 for the lower bits (bits 7:0)
            var tempLowBits = bytes[2];
            // Combine to get the full 10-bit temperature value
            var tempValue = tempHighBits | tempLowBits;
            data.sensorTemperature = Number(((tempValue - 400) / 10).toFixed(2));
            
            // Byte 3: Relative Humidity data
            // Formula: RH[%] = (XX * 100) / 256
            data.relativeHumidity = Number(((bytes[3] * 100) / 256).toFixed(2));
            
            // Byte 4: Device battery voltage data
            // Battery voltage [mV] = ((XX * 2200) / 255) + 1600
            data.batteryVoltage = Number(((((bytes[4] * 2200) / 255) + 1600) / 1000).toFixed(2));
            
            // Byte 5: PIR trigger count
            data.pirTriggerCount = bytes[5];
            
            // For backward compatibility
            var pirValue = (bytes[1] & 0x04) >> 2;
            data.pirSensorStatus = pirValue === 1 ? "Motion detected" : "No motion detected";
            data.pirSensorValue = pirValue;
            
            return data;
        }

        function handleResponse(bytes, data){
            var commands = bytes.map(function(byte){
                return ("0" + byte.toString(16)).substr(-2); 
            });
            commands = commands.slice(0,-7); 
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
                    case '19':
                        {
                            command_len = 1;
                            var commandResponse = parseInt(commands[i + 1], 16);
                            var periodInMinutes = commandResponse * 5 / 60;
                            data.joinRetryPeriod = periodInMinutes;
                        }
                    break;
                    case '1b':
                        {
                            command_len = 1;
                            data.uplinkType = parseInt(commands[i + 1], 16);
                        }
                    break;
                    case '1d':
                        {
                            command_len = 2;
                            var wdpC = commands[i + 1] == '00' ? false : parseInt(commands[i + 1], 16);
                            var wdpUc = commands[i + 2] == '00' ? false : parseInt(commands[i + 2], 16);
                            data.watchDogParams= { wdpC: wdpC, wdpUc: wdpUc } ;
                        }
                    break;
                    case '2f':
                        {
                            command_len = 1;
                            data.uplinkSendingOnButtonPress = parseInt(commands[i + 1], 16) ;
                        }
                    break;
                    case '3d':
                        {
                            command_len = 1;
                            data.pirSensorStatus = parseInt(commands[i + 1], 16);
                        }
                        break;
                    case '3f':
                        {
                            command_len = 1;
                            data.pirSensorSensitivity = parseInt(commands[i + 1], 16);
                        }
                        break;
                    case '49':
                        {
                            command_len = 1;
                            data.pirMeasurementPeriod = parseInt(commands[i + 1], 16);
                        }
                        break;
                    case '4b':
                        {
                            command_len = 1;
                            data.pirCheckPeriod = parseInt(commands[i + 1], 16);
                        }
                        break;
                    case '37':
                        {
                            command_len = 1;
                            data.pirSensorState = parseInt(commands[i + 1], 16);
                        }
                        break;
                    case '39':
                        {
                            command_len = 2;
                            data.occupancyTimeout = (parseInt(commands[i + 1], 16) << 8) | parseInt(commands[i + 2], 16);
                        }
                        break;
                    case '4d':
                        {
                            command_len = 1;
                            data.pirBlindPeriod = parseInt(commands[i + 1], 16);
                        }
                        break;
                    case 'a4': {
                        command_len = 1;
                        data.region = parseInt(commands[i + 1], 16);
                        break;
                    }
                    case 'a6': {
                        command_len = 1;
                        data.crystalOscillatorError = true;
                        break;
                    }
                    default:
                        break;
                }
                commands.splice(i,command_len);
            });
            return data;
        }

        // Route the message based on the command byte
        if (bytes[0] == 81) {
            // This is a keepalive message
            data = handleKeepalive(bytes, data);
        } else {
            // This is a response message
            data = handleResponse(bytes, data);
            // Handle the remaining keepalive data if present
            if (bytes.length >= 6) { // Check if there's enough bytes for a keepalive message
                bytes = bytes.slice(-6); // Extract the last 6 bytes which contain keepalive data
                data = handleKeepalive(bytes, data);
            }
        }

        return { data: data };
    } catch (e) {
        // console.log(e);
        throw new Error('Unhandled data');
    }
}

// Milesight
function Encode(port, obj) {
    var encoded = encodeDownlink({ fPort: port, data: obj }).bytes;
    return encoded;
  }
  
  function Encoder(port, obj) {
    var encoded = encodeDownlink({ fPort: port, data: obj }).bytes;
    return encoded;
  }
  // The Things Industries / Main
  function encodeDownlink(input) {
    var bytes = [];
    for (var key in input.data) {
      switch (key) {
        case "setKeepAlive": {
          bytes.push(0x02);
          bytes.push(input.data.setKeepAlive);
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
        case "setJoinRetryPeriod": {
          var periodToPass = (input.data.setJoinRetryPeriod * 60) / 5;
          periodToPass = Math.floor(periodToPass);
          bytes.push(0x10);
          bytes.push(periodToPass);
          break;
        }
        case "getJoinRetryPeriod": {
          bytes.push(0x19);
          break;
        }
  
        case "setUplinkType": {
          bytes.push(0x11);
          bytes.push(input.data.setUplinkType);
          break;
        }
        case "getUplinkType": {
          bytes.push(0x1B);
          break;
        }
        case "setWatchDogParams": {
          bytes.push(0x1C);
          bytes.push(input.data.SetWatchDogParams.confirmedUplinks);
          bytes.push(input.data.SetWatchDogParams.unconfirmedUplinks);
          break;
        }
        case "getWatchDogParams": {
          bytes.push(0x1D);
          break;
        }
        case "setUplinkSendingOnButtonPress": {
            bytes.push(0x2E);
            bytes.push(input.data.setUplinkSendingOnButtonPress);
            break;
        }
        case "getUplinkSendingOnButtonPress": {
            bytes.push(0x2F);
            break;
        }
        case "setPIRSensorStatus": {
            bytes.push(0x3C);
            bytes.push(input.data.setPIRSensorStatus);
            break;
        }
        case "getPIRSensorStatus": {
            bytes.push(0x3D);
            break;
        }
        case "setPIRSensorSensitivity": {
            bytes.push(0x3E);
            bytes.push(input.data.setPIRSensorSensitivity);
            break;
        }
        case "getPIRSensorSensitivity": {
            bytes.push(0x3F);
            break;
        }
        case "setPIRMeasurementPeriod": {
            bytes.push(0x48);
            bytes.push(input.data.setPIRMeasurementPeriod);
            break;
        }
        case "getPIRMeasurementPeriod": {
            bytes.push(0x49);
            break;
        }

        case "setPIRCheckPeriod": {
            var time = input.data.setPIRCheckPeriod;
            var timeFirstPart = time & 0xff;
            var timeSecondPart = (time >> 8) & 0xff;
            bytes.push(0x4A);
            bytes.push(timeSecondPart);
            bytes.push(timeFirstPart);
            break;
        }
        case "getPIRCheckPeriod": {
            bytes.push(0x4B);
            break;
        }

        case "setPIRBlindPeriod": {
            var time = input.data.setPIRBlindPeriod;
            var timeFirstPart = time & 0xff;
            var timeSecondPart = (time >> 8) & 0xff;
            bytes.push(0x4C);
            bytes.push(timeSecondPart);
            bytes.push(timeFirstPart);
            break;
        }
        case "getPIRBlindPeriod": {
            bytes.push(0x4D);
            break;
        }
        case "sendCustomHexCommand": {
          var sendCustomHexCommand = input.data.sendCustomHexCommand;
          for (var i = 0; i < sendCustomHexCommand.length; i += 2) {
            var byte = parseInt(sendCustomHexCommand.substr(i, 2), 16);
            bytes.push(byte);
          }
          break;
        }
        default:
          break;
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
      data: {
        bytes: input.bytes,
      },
      warnings: [],
      errors: [],
    };
  }
  
  
// example downlink commands
//  {"setPIRBlindPeriod":20} --> 0x4C0014
//  {"sendCustomHexCommand":"080F15"} --> 0x080F15

exports.decodeUplink = decodeUplink;
exports.encodeDownlink = encodeDownlink;
exports.decodeDownlink = decodeDownlink;
