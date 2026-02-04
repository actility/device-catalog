////////////////////////////////////////////////////////////////////////////////
// Advantech
//
// Frame Data Parser for EVA Lora modules (execute in Actility ThingPark Platform)
//
// version: 1.0.1 <2024/03/05>
//
////////////////////////////////////////////////////////////////////////////////

function adventechCode(receivedData) {
    ////////////////////////////////////////////
    // User defined variables
    ////////////////////////////////////////////

    // Min Frame length
    const MIN_FRAME_LENGTH = 2;
    const MAX_FRAME_LENGTH = 11;

    // fPort
    const  DATA_REPORT_REPORT_DATA_CMD = 0x06;
    const  DATA_REPORT_REPORT_CONFIGURATION = 0x07;
    const  DATA_REPORT_GLOBAL_CALIBRATE_CMD = 0x0E;

    // Cmd Id
    const CMD_ID_CONFIG_REPORT_RSP = {
        name: "ConfigReportRsp",
        value: 0x81
    };
    const CMD_ID_READ_CONFIG_REPORT_RSP = {
        name: "ReadConfigReportRsp",
        value: 0x82
    };
    const CMD_ID_SET_GLOBAL_CALIBRATE_RSP = {
        name: "SetGlobalCalibrateRsp",
        value: 0x81
    };
    const CMD_ID_GET_GLOBAL_CALIBRATE_RSP = {
        name: "GetGlobalCalibrateRsp",
        value: 0x82
    };
    const CMD_ID_CLEAR_GLOBAL_CALIBRATE_RSP = {
        name: "ClearGlobalCalibrateRsp",
        value: 0x83
    };

    // Device Type
    const DEVICE_TYPE_EVA221X = {
        name: "EVA-2210|EVA-2213",
        value: 0x4A
    };
    const DEVICE_TYPE_EVA2310 = {
        name: "EVA-2310",
        value: 0x0B
    };
    const DEVICE_TYPE_EVA2311 = {
        name: "EVA-2311",
        value: 0x95
    };
    const DEVICE_TYPE_EVA2510 = {
        name: "EVA-2510",
        value: 0x32
    };
    const DEVICE_TYPE_EVA2511 = {
        name: "EVA-2511",
        value: 0x9F
    };

    // EVA221X Report Type
    const EVA221X_Report_Type_0 = 0x00;
    const EVA221X_Report_Type_1 = 0x01;
    const EVA221X_Report_Type_2 = 0x02;
    const EVA221X_Report_Type_3 = 0x03;
    const EVA221X_Multiplier_List = {
        0: 1,
        1: 5,
        2: 10,
        3: 100
    };
    const BATTERY_LOW_VOLTAGE = 128;
    const BATTERY_VALUE = 127;

    // EVA2310
    const EVA2310_Report_Type_0 = 0x00;
    const EVA2310_Report_Type_1 = 0x01;

    // EVA2311
    const EVA2311_Report_Type_0 = 0x00;
    const EVA2311_Report_Type_1 = 0x01;

    // EVA2510
    const EVA2510_Report_Type_0 = 0x00;
    const EVA2510_Report_Type_1 = 0x01;

    // EVA2511
    const EVA2511_Report_Type_0 = 0x00;
    const EVA2511_Report_Type_1 = 0x01;

    var SensorTypeList = {
        "1": "Temperature Sensor",
        "2": "Humidity Sensor"
    }

    var ThresholdAlarm = [
        "No Alarm",
        "LowTemperatureAlarm",
        "HighTemperatureAlarm"
    ];

    ////////////////////////////////////////////
    // Variables
    ////////////////////////////////////////////

    //input data is hex string
    var version, deviceType, reportType, cmdId, sensorType;
    var result = {
        data: {},
        errors: [],
        warnings: []
    };
    var message = result.data; //output of this program

    var i, arrLength;
    var fport = receivedData.fPort;
    var hexArr = receivedData.bytes;
    var arrayIndex = 0; //index of current processing position in hexArr

    arrLength = hexArr.length;

    ////////////////////////////////////////////
    // Functions
    ////////////////////////////////////////////

    function convertDecToHex(number) {
        return addZero(number.toString(16).toUpperCase());
    }

    function addZero(i) {
        i = i + "";
        if (i.length < 2) {
            i = "0" + i;
        }
        return i;
    }

    function translateInt16(a, b) {
        return (a << 8) + b;
    }

    function convertToSignedInt16(number) {
        if ((number & 0x8000) > 0) {
            number = number - 0x10000;
        }
        return number;
    }

    function parseVersionPacket(sw, hw, fw1, fw2, fw3, fw4) {
        var data = {}
        message.SoftwareVersion = sw / 10;
        message.HardwareVersion = hw;
        message.FirmwareVersion = convertDecToHex(fw1) + convertDecToHex(fw2) + convertDecToHex(fw3) + convertDecToHex(fw4);
    }

    function parseBattery(value) {
        var low_battery = "";
        if (value & BATTERY_LOW_VOLTAGE) {
            low_battery = "(low battery)";
        }
        return ((value & BATTERY_VALUE) / 10) + "V" + low_battery;
    }

    function parseReportDataCmd(index) {
        switch(deviceType) {
            case DEVICE_TYPE_EVA221X.value:
                message.DeviceType = DEVICE_TYPE_EVA221X.name;
                switch(reportType) {
                    case EVA221X_Report_Type_0:
                        parseVersionPacket(hexArr[index++], hexArr[index++], hexArr[index++], hexArr[index++], hexArr[index++], hexArr[index++]);
                        break;
                    case EVA221X_Report_Type_1:
                        message.Battery = parseBattery(hexArr[index++]);
                        message.Current1 = translateInt16(hexArr[index++], hexArr[index++]) + "mA";
                        message.Current2 = translateInt16(hexArr[index++], hexArr[index++]) + "mA";
                        message.Current3 = translateInt16(hexArr[index++], hexArr[index++]) + "mA";
                        message.Mulitplier1 = hexArr[index++];
                        break;
                    case EVA221X_Report_Type_2:
                        message.Battery = parseBattery(hexArr[index++]);
                        message.Mulitplier2 = hexArr[index++];
                        message.Mulitplier3 = hexArr[index++];
                        break;
                    case EVA221X_Report_Type_3:
                        message.Battery = parseBattery(hexArr[index++]);
                        message.Current1 = translateInt16(hexArr[index++], hexArr[index++]) + "mA";
                        message.Current2 = translateInt16(hexArr[index++], hexArr[index++]) + "mA";
                        message.Current3 = translateInt16(hexArr[index++], hexArr[index++]) + "mA";
                        var mulitplier = hexArr[index++];
                        message.Mulitplier1 = EVA221X_Multiplier_List[mulitplier & 3];
                        message.Mulitplier2 = EVA221X_Multiplier_List[(mulitplier & 12) >> 2];
                        message.Mulitplier3 = EVA221X_Multiplier_List[(mulitplier & 48) >> 4];
                        break;
                    default:
                        result.errors.push("Invalid uplink payload: Unknow ReportType");
                        delete result.data;
                        return result;
                }
                break;
            case DEVICE_TYPE_EVA2310.value:
                message.DeviceType = DEVICE_TYPE_EVA2310.name;
                switch(reportType) {
                    case EVA2310_Report_Type_0:
                        parseVersionPacket(hexArr[index++], hexArr[index++], hexArr[index++], hexArr[index++], hexArr[index++], hexArr[index++]);
                        break;
                    case EVA2310_Report_Type_1:
                        message.Battery = parseBattery(hexArr[index++]);
                        message.Temperature = (convertToSignedInt16(translateInt16(hexArr[index++], hexArr[index++])) / 100) + "°C";
                        message.Humidity = (translateInt16(hexArr[index++], hexArr[index++]) / 100) + "%";
                        break;
                    default:
                        result.errors.push("Invalid uplink payload: Unknow ReportType");
                        delete result.data;
                        return result;
                }
                break;
            case DEVICE_TYPE_EVA2311.value:
                message.DeviceType = DEVICE_TYPE_EVA2311.name;
                switch(reportType) {
                    case EVA2311_Report_Type_0:
                        parseVersionPacket(hexArr[index++], hexArr[index++], hexArr[index++], hexArr[index++], hexArr[index++], hexArr[index++]);
                        break;
                    case EVA2311_Report_Type_1:
                        message.Battery = parseBattery(hexArr[index++]);
                        message.Temperature = (convertToSignedInt16(translateInt16(hexArr[index++], hexArr[index++])) / 10) + "°C";
                        message.ThresholdAlarm = ThresholdAlarm[hexArr[index++]];
                        break;
                    default:
                        result.errors.push("Invalid uplink payload: Unknow ReportType");
                        delete result.data;
                        return result;
                }
                break;
            case DEVICE_TYPE_EVA2510.value:
                message.DeviceType = DEVICE_TYPE_EVA2510.name;
                switch(reportType) {
                    case EVA2510_Report_Type_0:
                        parseVersionPacket(hexArr[index++], hexArr[index++], hexArr[index++], hexArr[index++], hexArr[index++], hexArr[index++]);
                        break;
                    case EVA2510_Report_Type_1:
                        message.Battery = parseBattery(hexArr[index++]);
                        message.WaterLeak = (hexArr[index++] == 1) ? "Leak" : "NoLeak";
                        break;
                    default:
                        result.errors.push("Invalid uplink payload: Unknow ReportType");
                        delete result.data;
                        return result;
                }
                break;
            case DEVICE_TYPE_EVA2511.value:
                message.DeviceType = DEVICE_TYPE_EVA2511.name;
                switch(reportType) {
                    case EVA2511_Report_Type_0:
                        parseVersionPacket(hexArr[index++], hexArr[index++], hexArr[index++], hexArr[index++], hexArr[index++], hexArr[index++]);
                        break;
                    case EVA2511_Report_Type_1:
                        message.Battery = parseBattery(hexArr[index++]);
                        message.Status = (hexArr[index++] == 1) ? "On" : "Off";
                        break;
                    default:
                        result.errors.push("Invalid uplink payload: Unknow ReportType");
                        delete result.data;
                        return result;
                }
                break;
            default:
                result.errors.push("Invalid uplink payload: Unknow DeviceType");
                delete result.data;
                return result;
        }
    }

    function parseReportConfiguration(index) {
        switch(deviceType) {
            case DEVICE_TYPE_EVA221X.value:
                message.DeviceType = DEVICE_TYPE_EVA221X.name;
                switch(cmdId) {
                    case CMD_ID_CONFIG_REPORT_RSP.value:
                        message.Cmd = CMD_ID_CONFIG_REPORT_RSP.name;
                        message.Status = (hexArr[index++] == 0) ? "Success" : "Fail";
                        break;
                    case CMD_ID_READ_CONFIG_REPORT_RSP.value:
                        message.Cmd = CMD_ID_READ_CONFIG_REPORT_RSP.name;
                        message.MinTime = translateInt16(hexArr[index++], hexArr[index++]) + "s";
                        message.MaxTime = translateInt16(hexArr[index++], hexArr[index++]) + "s";
                        message.CurrentChange = translateInt16(hexArr[index++], hexArr[index++]) + "mA";
                        break;
                    default:
                        result.errors.push("Invalid uplink payload: Unknow Cmd");
                        delete result.data;
                        return result;
                }
                break;
            case DEVICE_TYPE_EVA2310.value:
                message.DeviceType = DEVICE_TYPE_EVA2310.name;
                switch(cmdId) {
                    case CMD_ID_CONFIG_REPORT_RSP.value:
                        message.Cmd = CMD_ID_CONFIG_REPORT_RSP.name;
                        message.Status = (hexArr[index++] == 0) ? "Success" : "Fail";
                        break;
                    case CMD_ID_READ_CONFIG_REPORT_RSP.value:
                        message.Cmd = CMD_ID_READ_CONFIG_REPORT_RSP.name;
                        message.MinTime = translateInt16(hexArr[index++], hexArr[index++]) + "s";
                        message.MaxTime = translateInt16(hexArr[index++], hexArr[index++]) + "s";
                        message.BatteryChange = (hexArr[index++] / 10) + "V";
                        message.TemperatureChange = (translateInt16(hexArr[index++], hexArr[index++]) / 100) + "°C";
                        message.HumidityChange = (translateInt16(hexArr[index++], hexArr[index++]) / 100) + "%";
                        break;
                    default:
                        result.errors.push("Invalid uplink payload: Unknow Cmd");
                        delete result.data;
                        return result;
                }
                break;
            case DEVICE_TYPE_EVA2311.value:
                message.DeviceType = DEVICE_TYPE_EVA2311.name;
                switch(cmdId) {
                    case CMD_ID_CONFIG_REPORT_RSP.value:
                        message.Cmd = CMD_ID_CONFIG_REPORT_RSP.name;
                        message.Status = (hexArr[index++] == 0) ? "Success" : "Fail";
                        break;
                    case CMD_ID_READ_CONFIG_REPORT_RSP.value:
                        message.Cmd = CMD_ID_READ_CONFIG_REPORT_RSP.name;
                        message.MinTime = translateInt16(hexArr[index++], hexArr[index++]) + "s";
                        message.MaxTime = translateInt16(hexArr[index++], hexArr[index++]) + "s";
                        message.BatteryChange = (hexArr[index++] / 10) + "V";
                        message.TemperatureChange = (translateInt16(hexArr[index++], hexArr[index++]) / 10) + "°C";
                        break;
                    default:
                        result.errors.push("Invalid uplink payload: Unknow Cmd");
                        delete result.data;
                        return result;
                }
                break;
            case DEVICE_TYPE_EVA2510.value:
                message.DeviceType = DEVICE_TYPE_EVA2510.name;
                switch(cmdId) {
                    case CMD_ID_CONFIG_REPORT_RSP.value:
                        message.Cmd = CMD_ID_CONFIG_REPORT_RSP.name;
                        message.Status = (hexArr[index++] == 0) ? "Success" : "Fail";
                        break;
                    case CMD_ID_READ_CONFIG_REPORT_RSP.value:
                        message.Cmd = CMD_ID_READ_CONFIG_REPORT_RSP.name;
                        message.MinTime = translateInt16(hexArr[index++], hexArr[index++]) + "s";
                        message.MaxTime = translateInt16(hexArr[index++], hexArr[index++]) + "s";
                        message.BatteryChange = (hexArr[index++] / 10) + "V";
                        break;
                    default:
                        result.errors.push("Invalid uplink payload: Unknow Cmd");
                        delete result.data;
                        return result;
                }
                break;
            case DEVICE_TYPE_EVA2511.value:
                message.DeviceType = DEVICE_TYPE_EVA2511.name;
                switch(cmdId) {
                    case CMD_ID_CONFIG_REPORT_RSP.value:
                        message.Cmd = CMD_ID_CONFIG_REPORT_RSP.name;
                        message.Status = (hexArr[index++] == 0) ? "Success" : "Fail";
                        break;
                    case CMD_ID_READ_CONFIG_REPORT_RSP.value:
                        message.Cmd = CMD_ID_READ_CONFIG_REPORT_RSP.name;
                        message.MinTime = translateInt16(hexArr[index++], hexArr[index++]) + "s";
                        message.MaxTime = translateInt16(hexArr[index++], hexArr[index++]) + "s";
                        message.BatteryChange = (hexArr[index++] / 10) + "V";
                        break;
                    default:
                        result.errors.push("Invalid uplink payload: Unknow Cmd");
                        delete result.data;
                        return result;
                }
                break;
            default:
                result.errors.push("Invalid uplink payload: Unknow DeviceType");
                delete result.data;
                return result;
        }
    }

    function parseGlobalCalibrateCmd(index) {
        switch(cmdId) {
            case CMD_ID_SET_GLOBAL_CALIBRATE_RSP.value:
                message.Cmd = CMD_ID_SET_GLOBAL_CALIBRATE_RSP.name;
                message.SensorType = SensorTypeList[hexArr[index++]];
                message.Channel = hexArr[index++] + 1;
                message.Status = (hexArr[index++] == 0) ? "Success" : "Fail";
                break;
            case CMD_ID_GET_GLOBAL_CALIBRATE_RSP.value:
                message.Cmd = CMD_ID_GET_GLOBAL_CALIBRATE_RSP.name;
                message.SensorType = SensorTypeList[hexArr[index++]];
                message.Channel = hexArr[index++] + 1;
                message.Multiplier = translateInt16(hexArr[index++], hexArr[index++]);
                message.Divisor = translateInt16(hexArr[index++], hexArr[index++]);
                message.DeltValue = convertToSignedInt16(translateInt16(hexArr[index++], hexArr[index++]));
                break;
            case CMD_ID_CLEAR_GLOBAL_CALIBRATE_RSP.value:
                message.Cmd = CMD_ID_CLEAR_GLOBAL_CALIBRATE_RSP.name;
                message.Status = (hexArr[index++] == 0) ? "Success" : "Fail";
                break;
            default:
                result.errors.push("Invalid uplink payload: Unknow Cmd");
                delete result.data;
                return result;
        }
    }

    ////////////////////////////////////////////
    // Main
    ////////////////////////////////////////////

    if(arrLength < MIN_FRAME_LENGTH || arrLength > MAX_FRAME_LENGTH){
        result.errors.push("Invalid uplink payload: Received frame length error");
        delete result.data;
        return result;
    }

    switch(fport) {
        case DATA_REPORT_REPORT_DATA_CMD:
            version = hexArr[0];
            deviceType = hexArr[1];
            reportType = hexArr[2];

            arrayIndex = 3;

            parseReportDataCmd(arrayIndex);
            break;
        case DATA_REPORT_REPORT_CONFIGURATION:
            cmdId = hexArr[0];
            deviceType = hexArr[1];

            arrayIndex = 2;

            parseReportConfiguration(arrayIndex);
            break;
        case DATA_REPORT_GLOBAL_CALIBRATE_CMD:
            cmdId = hexArr[0];

            arrayIndex = 1;

            parseGlobalCalibrateCmd(arrayIndex);
            break;
        default:
            result.errors.push("Invalid uplink payload: Unknow fPort");
            delete result.data;
            return result;
    }
    return result;
}

function decodeUplink(input) {
    var result = {
        data: {},
        errors: [],
        warnings: []
    };
    if (input.fPort) {
        if (input.bytes) {
            return adventechCode(input);
        } else {
            result.errors.push("Invalid uplink payload: no data received");
            delete result.data;
            return result;
        }
    } else {
        result.errors.push("Invalid uplink payload: no fPort received");
        delete result.data;
        return result;
    }
}

exports.decodeUplink = decodeUplink;