function decodeUplink(input) {
    return {
        data: Decode(input.fPort, input.bytes, input.variables),
        errors: [],
        warnings : []
    };
}


function get_spt_value(input) {
  var spt_value = input[3];
  switch (spt_value) {
    case 0:
      return "0";
    case 1:
      return "+1";
    case 2:
      return "+2";
    case 3:
      return "+3";
    case 4:
      return "+4";
    case 5:
      return "+5";
    case 12:
      return "-4";
    case 13:
      return "-3";
    case 14:
      return "-2";
    case 15:
      return "-1";
    case 255:
      return "Freeze Protect";
    default:
      return "Invalid SPT value";      
  }
}

function Decode(fPort, bytes) {
    switch (fPort) {
        case 1:
            {
                var output = {};

                output.Ambient_Temperature = bytes[0] * 0.25;
                output.PIR_Status = bytes[1] >> 5 & 0x01;
                output.Energy_Storage_Low = bytes[1] >> 4 & 0x01;
                output.Radio_Comm_Error = bytes[1] >> 3 & 0x01;
                output.Radio_Signal_Strength = bytes[1] >> 2 & 0x01;
                output.PIR_Sensor_Failure = bytes[1] >> 1 & 0x01;
                output.Ambient_Sensor_Failure = bytes[1] & 0x01;
                output.Storage_Voltage = Number((bytes[2] * 0.02).toFixed(2));
                output.Relative_SPT_Value = get_spt_value(bytes);
                break;
            }
        default:
            return {
                errors: ['unknown FPort'],
            };
    }
    return output;
}

exports.decodeUplink = decodeUplink;