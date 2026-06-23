function decodeUplink(input) {
    var data = input.bytes;
    var valid = true;

    if (typeof Decoder === "function") {
        data = Decoder(data, input.fPort);
    }

  /*  if (typeof Converter === "function") {
        data = Converter(data, input.fPort);
    }

    if (typeof Validator === "function") {
        valid = Validator(data, input.fPort);
    }*/

    if (valid) {
        return {
            data: data,
            errors: [],
            warnings: []
        };
    } else {
        return {
            data: {},
            errors: ["Invalid data received"],
            warnings: []
        };
    }
}

function Decoder(byte, port)
{
    const EVENT_PROPERTY_NAMES = ["Ambient_Temp","Surface_Temp","Ambient_Pressure","Ambient_Humidity","Battery","Vib_Accel_X_Axis","Vib_Accel_Y_Axis","Vib_Accel_Z_Axis","Vib_Velocity_X_Axis","Vib_Velocity_Y_Axis","Vib_Velocity_Z_Axis","Audio"];

    var pktTime = (byte[3] << 24) | (byte[2] << 16) | (byte[1] << 8) | byte[0];

    if (port == 0x03)
    {
        for (let i = 4; i < 6; i++) {
            if (byte[i] > 127) {
                byte[i] = (256 - byte[i]) * (-1);
            }
        }
        var Ambient_Temp_Avg = (byte[4]);
        var Surface_Temp_Avg = (byte[5]);
        var Ambient_Pressure_Avg = (((byte[6] * 3) + 335));
        var Ambient_Humidity_Avg = (byte[7]);

        var Vib_Accel_X_Axis_RMS = ((byte[9] << 8) | byte[8]) / 100;
        var Vib_Accel_Y_Axis_RMS = ((byte[11] << 8) | byte[10]) / 100;
        var Vib_Accel_Z_Axis_RMS = ((byte[13] << 8) | byte[12]) / 100;

        var Vib_Velocity_X_Axis_RMS = ((byte[15] << 8) | byte[14]) / 100;
        var Vib_Velocity_Y_Axis_RMS = ((byte[17] << 8) | byte[16]) / 100;
        var Vib_Velocity_Z_Axis_RMS = ((byte[19] << 8) | byte[18]) / 100;

        var Audio_dBSPL = (byte[20]);
        var Remaining_battery_perc = byte[21];
        var Measured_RPM = (byte[23] << 8 | byte[22]);

        var Vib_Kurtosis_X_Axis = (byte[24]) / 10;
        var Vib_Crest_X_Axis = (byte[25]) / 10;
        var Vib_Skewness_X_Axis = (byte[26]) / 10;
        var Vib_Kurtosis_Y_Axis = (byte[27]) / 10;
        var Vib_Crest_Y_Axis = (byte[28]) / 10;
        var Vib_Skewness_Y_Axis = (byte[29]) / 10;
        var Vib_Kurtosis_Z_Axis = (byte[30]) / 10;
        var Vib_Crest_Z_Axis = (byte[31]) / 10;
        var Vib_Skewness_Z_Axis = (byte[32]) / 10;
        var crc_alarm_config = (byte[34] << 8) | byte[33];
        var crc_dev_info_config = (byte[36] << 8) | byte[35];

        return {
            timestamp: pktTime,
            var_Ambient_Temp_Avg: Ambient_Temp_Avg,
            var_Surface_Temp_Avg: Surface_Temp_Avg,
            var_Ambient_Pressure_Avg: Ambient_Pressure_Avg,
            var_Ambient_Humidity_Avg: Ambient_Humidity_Avg,
            var_Vib_Accel_X_Axis_RMS: Vib_Accel_X_Axis_RMS,
            var_Vib_Accel_Y_Axis_RMS: Vib_Accel_Y_Axis_RMS,
            var_Vib_Accel_Z_Axis_RMS: Vib_Accel_Z_Axis_RMS,
            var_Vib_Velocity_X_Axis_RMS: Vib_Velocity_X_Axis_RMS,
            var_Vib_Velocity_Y_Axis_RMS: Vib_Velocity_Y_Axis_RMS,
            var_Vib_Velocity_Z_Axis_RMS: Vib_Velocity_Z_Axis_RMS,
            var_Audio_dBSPL: Audio_dBSPL,
            var_Remaining_battery_perc: Remaining_battery_perc,
            var_Measured_RPM: Measured_RPM,
            var_Vib_Kurtosis_X_Axis: Vib_Kurtosis_X_Axis,
            var_Vib_Crest_X_Axis: Vib_Crest_X_Axis,
            var_Vib_Skewness_X_Axis: Vib_Skewness_X_Axis,
            var_Vib_Kurtosis_Y_Axis: Vib_Kurtosis_Y_Axis,
            var_Vib_Crest_Y_Axis: Vib_Crest_Y_Axis,
            var_Vib_Skewness_Y_Axis: Vib_Skewness_Y_Axis,
            var_Vib_Kurtosis_Z_Axis: Vib_Kurtosis_Z_Axis,
            var_Vib_Crest_Z_Axis: Vib_Crest_Z_Axis,
            var_Vib_Skewness_Z_Axis: Vib_Skewness_Z_Axis,
            var_crc_alarm_config: crc_alarm_config,
            var_crc_dev_info_config: crc_dev_info_config
        };
    }

    if (port == 8)
    {
        var decoded_8 = {
            timestamp: pktTime
        };

        var Sensor_Type = byte[4];
        var Event_Type = byte[5];

        if (Sensor_Type < 4)
        {
            var Event_Data = byte[6];
            if (Sensor_Type <= 1)
            {
                if (Event_Data > 127)
                {
                    Event_Data = (256 - byte[6]) * (-1);
                }
            }
            else if (Sensor_Type == 2)
            {
                Event_Data = ((byte[6] * 3) + 335);
            }

            decoded_8["event_" + EVENT_PROPERTY_NAMES[Sensor_Type] + "_Type"] = Event_Type;
            decoded_8["event_" + EVENT_PROPERTY_NAMES[Sensor_Type] + "_Data"] = Event_Data;
            return decoded_8;
        }
        else if ((Sensor_Type > 4) && (Sensor_Type <= 11))
        {
            var Freq_Band = byte[7];
            var Freq_Value = (byte[10] << 16) | (byte[9] << 8) | byte[8];
            var Amplitude = byte[11];

            if (Sensor_Type != 11)
                Amplitude = Amplitude / 10;

            decoded_8["event_" + EVENT_PROPERTY_NAMES[Sensor_Type] + "_Type"] = Event_Type;
            decoded_8["event_" + EVENT_PROPERTY_NAMES[Sensor_Type] + "_Freq" + Freq_Band] = Freq_Value;
            decoded_8["event_" + EVENT_PROPERTY_NAMES[Sensor_Type] + "_Amp" + Freq_Band] = Amplitude;
            return decoded_8;
        }
        else if (Sensor_Type == 4)
        {
            decoded_8["event_" + EVENT_PROPERTY_NAMES[Sensor_Type] + "_Type"] = Event_Type;
            if (Event_Type == 1)
                decoded_8["event_" + EVENT_PROPERTY_NAMES[Sensor_Type] + "_Voltage"] = 3 + (byte[6] * 0.004);
            else if (Event_Type == 2)
                decoded_8["event_" + EVENT_PROPERTY_NAMES[Sensor_Type] + "_Life"] = byte[6];
            return decoded_8;
        }
    }

    if (port == 11)
    {
        var Diag_Status = byte[5] << 8 | byte[4];
        var decoded_11 = {
            timestamp: pktTime,
            Diag_Status: Diag_Status
        };

        for (let Sensor_Type = 0; Sensor_Type < 12; Sensor_Type++) {
            decoded_11["event_" + EVENT_PROPERTY_NAMES[Sensor_Type] + "_Type"] = byte[Sensor_Type + 6];
        }

        return decoded_11;
    }

    return {};
}

exports.decodeUplink = decodeUplink;
