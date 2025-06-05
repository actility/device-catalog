/** Function reserved for TTN use ONLY
 * 
 * @param {*} input 
 * @returns 
 */


// eslint-disable-next-line
function decodeUplink(input) {
    // input has the following structure:
    // {
    //   "bytes": [1, 2, 3], // FRMPayload (byte array)
    //   "fPort": 1
    // }


    // Should RETURN :
    //
    // data: { bytes: input.bytes , },
    // warnings: ["warning 1", "warning 2"], // optional
    // errors: ["error 1", "error 2"], // optional (if set, the decoding failed)
    // };

    return te_decoder(input.bytes, input.fPort)
}


/**
 * 
 * @param {Uint8Array} bytes 
 * @param {number} port 
 * @returns Decoded object
 */
function te_decoder(bytes, port) {
    var ttn_output = { data: {}, errors: [] }
    var decode = ttn_output.data
    var error_dict = ttn_output.errors
    decode.size = bytes.length


    port = parseInt(port)



    if (DecodeFwRevision(decode, port, bytes) === false)
        if (Decode8911EX(decode, port, bytes) === false)
            if (Decode8931EX(decode, port, bytes) === false)
                if (DecodeU8900(decode, port, bytes) === false)
                    if (DecodeU8900Pof(decode, port, bytes) === false)
                        if (DecodeSinglePointOrMultiPoint(decode, port, bytes, error_dict) === false)
                            if (DecodeTiltSensor(decode, port, bytes) === false)
                                if (DecodeOperationResponses(decode, port, bytes) === false)
                                    if (DecodeKeepAlive(decode, port, bytes) === false) {
                                        decode.val = 'Unknown frame';
                                        decode.port = port;
                                        decode.bytes = arrayToString(bytes);
                                    }

    return ttn_output;

}



function Decode8931EX(decode, port, bytes) {
    if (port === 5) {

        var BW_MODE_RESOLUTION = {
            0x00: 0.125,
            0x01: 0.25,
            0x02: 0.5,
            0x03: 1,
            0x04: 2,
            0x05: 3,
            0x06: 4,
            0x07: 5,
            0x08: 6,
            0x09: 7,
            0x0A: 8,
            0x0B: 9,
            0x0C: 10,
            0x0D: 11,
            0x0E: 12,
            0x0F: 13,
        }

        decode.bat = (bytes[1] & 0x0F) === 0xF ? 'err' : (((bytes[1] & 0x0F) * 10) + '%');

        decode.devstat = {};
        decode.devstat.rotEn = (bitfield(bytes[1], 7) === 1) ? 'enabled' : 'disabled';
        decode.devstat.temp = (bitfield(bytes[1], 6) === 0) ? 'ok' : 'err';
        decode.devstat.acc = (bitfield(bytes[1], 5) === 0) ? 'ok' : 'err';


        decode.presetId = bytes[0];
        decode.temp = bytes[2] * 0.5 - 40 + '°C';
        decode.fftInfo = {};
        decode.fftInfo.BwMode = bytes[3] & 0x0F;
        decode.axisInfo = {};
        decode.axisInfo.Axis = String.fromCharCode(88 + (bytes[4] >> 6));
        decode.axisInfo.PeakNb = bytes[4] & 0x3F;
        decode.axisInfo.SigRms = dBDecompression(bytes[5]);

        decode.peaksList = [];



        var peakVal = 0;
        var bitCount = 0;
        for (var i = 0; i < decode.axisInfo.PeakNb * 19; i++) {
            peakVal |= ((bytes[6 + Math.trunc((i / 8))] >> (8 - 1 - (i % 8))) & 0x01) << (19 - bitCount - 1);
            bitCount++;
            if (bitCount === 19) {

                var peak = {};
                peak.Freq = peakVal >> 8;
                peak.Freq_Hz = peak.Freq * BW_MODE_RESOLUTION[decode.fftInfo.BwMode]
                peak.Mag = dBDecompression(peakVal & 0xFF);
                decode.peaksList.push(peak);
                bitCount = 0;
                peakVal = 0;
            }



        }
        return true;

    }


    else if (port === 133 || port === 197) {
        // 133 start fragment, 197 end fragment
        decode.val = '8931 : Fragmented frame NOT SUPPORTED by TTN Live Decoder';
        decode.port = port;
        decode.bytes = arrayToString(bytes);
        return true;
    }
    else {
        return false;
    }
}

function Decode8911EX(decode, port, bytes) {
    if (port === 1) {
        if (bytes.length >= 1) {
            decode.bat = bytes[0] + '%';
        }
        if (bytes.length >= 2) {
            decode.peak_nb = bytes[1];
        }
        if (bytes.length >= 4) {
            decode.temp = arrayConverter(bytes, 2, 2);
            decode.temp = decode.temp === 0x7FFF ? 'err' : round(((decode.temp / 10.0) - 100), 1);
        }
        if (bytes.length >= 6) {
            decode.sig_rms = round(arrayConverter(bytes, 4, 2) / 1000.0, 3);
        }
        if (bytes.length >= 7) {
            decode.preset = bytes[6];
        }
        if (bytes.length >= 8) {
            decode.devstat = {};
            decode.devstat.acc = (bitfield(bytes[7], 5) === 0) ? 'ok' : 'err';
            decode.devstat.temp = (bitfield(bytes[7], 6) === 0) ? 'ok' : 'err';
            decode.devstat.rotEn = (bitfield(bytes[7], 7) === 1) ? 'enabled' : 'disabled';
            decode.devstat.com = (bitfield(bytes[7], 3) === 0) ? 'ok' : 'err';
            decode.devstat.battery = (bitfield(bytes[7], 0) === 0) ? 'ok' : 'err';
        }
        decode.peaks = [];
        for (var i = 0; i < decode.peak_nb && ((i * 5 + 5) < (bytes.length - 8)); i++) {
            var peak = {};
            peak.freq = arrayConverter(bytes, 5 * i + 8, 2);
            peak.mag = round(arrayConverter(bytes, ((i * 5) + 10), 2) / 1000.0, 3);
            peak.ratio = bytes[i * 5 + 12];
            decode.peaks.push(peak);

        } return true;
    }
    else if (port === 129 || port === 193) {
        // 129 start fragment, 193 end fragment
        decode.val = '8911 : Fragmented frame NOT SUPPORTED by TTN Live Decoder';
        decode.port = port;
        decode.bytes = arrayToString(bytes);
        return true;
    }
    return false;
}

function DecodeFwRevision(decode, port, bytes) {
    if (port === 2) {
        decode.firmware_version = arrayToAscii(bytes);
        return true;
    }
    return false;
}

function DecodeU8900(decode, port, bytes) {
    if (port === 4) {
        decode.bat = (bytes[1] & 0x0F) === 0xF ? 'err' : (((bytes[1] & 0x0F) * 10) + '%');

        if (bytes[0] === 0x00) {
            decode.devstat = 'normal';
        }
        else {
            decode.devstat = {};
            decode.devstat.Meas = (bitfield(bytes[0], 7) === 0) ? 'ok' : 'err';
            decode.devstat.Cal = (bitfield(bytes[0], 6) === 0) ? 'ok' : 'err';
            decode.devstat.Unk = (bitfield(bytes[0], 5) === 0) ? 'ok' : 'err';
            decode.devstat.Unsup = (bitfield(bytes[0], 4) === 0) ? 'ok' : 'err';

        }
        decode.temp = isNaN(arrayToFloat(bytes, 2)) ? 'err' : round(arrayToFloat(bytes, 2), 1) + '°C';
        decode.pres = isNaN(arrayToFloat(bytes, 6)) ? 'err' : round(arrayToFloat(bytes, 6), 3) + 'Bar';
        return true;
    }
    return false;
}

function DecodeU8900Pof(decode, port, bytes) {
    if (port === 104) {
        // MCU Flags
        decode.pream = bytes[0] === 0x3C ? 'OK' : 'KO !!!';
        decode.rst_cnt = arrayConverter(bytes, 1, 2, true);
        decode.pof_tx = (bytes[3] & 0x01) === 0x01 ? 'MCU POF !!!' : 'OK';
        decode.pof_idle = (bitfield(bytes[4], 0) === 0) ? 'OK' : 'MCU POF !!!';
        decode.pof_snsmeas = (bitfield(bytes[4], 1) === 0) ? 'OK' : 'MCU POF !!!';
        decode.pof_batmeas = (bitfield(bytes[4], 2) === 0) ? 'OK' : 'MCU POF !!!';


        decode.batt = arrayConverter(bytes, 5, 2, true) + 'mV';

        if (bytes[7] === 0x00) {
            decode.devstat = 'ok';
        }
        else {
            decode.devstat = {};
            decode.devstat.Meas = (bitfield(bytes[7], 7) === 0) ? 'OK' : 'err';
            decode.devstat.Cal = (bitfield(bytes[7], 6) === 0) ? 'OK' : 'err';
            decode.devstat.Unk = (bitfield(bytes[7], 5) === 0) ? 'OK' : 'err';
            decode.devstat.Unsup = (bitfield(bytes[7], 4) === 0) ? 'OK' : 'err';
        }

        decode.batt_lvl = (bytes[8] & 0x0F) === 0xF ? 'ERROR' : (((bytes[8] & 0x0F) * 10) + '%');
        decode.patbatt = bytes[9] === 0xA5 ? 'OK' : 'Corrupted';
        decode.pattemp = bytes[9] === 0xA5 ? 'OK' : 'Corrupted';

        decode.mcu_temp = arrayConverter(bytes, 10, 2, true, true) / 100.0 + '°C';
        decode.pres = isNaN(arrayToFloat(bytes, 13)) ? 'ERROR' : round(arrayToFloat(bytes, 13), 3) + ' Bar';
        decode.patend = bytes[17] === 0x5A ? 'OK' : 'KO !!! ';
        var i = 0;
        decode.zdata = [];
        for (i = 0; i < bytes.length; i++) {
            decode.zdata.push(bytes[i].toString(16));
        }
        return true;
    }
    return false;
}
//port 10  EyEALQhjCgw/gHNj  1321002d08630a0c3f807363    data
//port 20  AComZGU4ZWFiMTdhZDVm  00 2a 26 64 65 38 65 61 62 31 37 61 64 35 66 fw rev
//port 30  /EyEARwhj keep alive 132100470863
function DecodeOperationResponses(decode, port, bytes) {
    var res = false;
    if (port === 20) {
        res = true;
        var OperationRepsType = {
            0: "Read",
            1: "Write",
            2: "Write+Read"
        }
        var OperationFlag = {
            7: "UuidErr",
            6: "OpErr/PayloadErr",
            5: "ReadOnly/WrongOp",
            4: "NetwErr",

        }
        decode.op = OperationRepsType[bytes[0] & 0x3];
        decode.opFlag = [];
        for (var i = 7; i > 4; i--) {
            if (bitfield(bytes[0], i) === 1) {
                decode.opFlag.push(OperationFlag[i]);
            }
        }
        var uuid = arrayToUint16(bytes, 1, false)
        decode.uuid = uuid.toString(16);
        var payload = bytes.slice(3)
        switch (uuid) {
            case 0x2A24:
                decode.model = arrayToAscii(payload);
                break;
            case 0x2A25:
                decode.sn = arrayToAscii(payload);
                break;
            case 0x2A26:
                decode.fwrev = arrayToAscii(payload);
                break;
            case 0x2A27:
                decode.hwrev = arrayToAscii(payload);
                break;
            case 0x2A29:
                decode.manuf = arrayToAscii(payload);
                break;
            case 0xCF01: // Sensor Diagnosis

                var SensorDiagFlag = {
                    7: "TEMP16_OoR_ERR",
                    4: "TEMP16_CIR_ERR",
                    3: "SENSOR32_OoR_ERR",
                    0: "SENSOR32_CIR_ERR",

                }
                decode.sensor_diagnosis = extract_bitfield(payload[0], SensorDiagFlag)

                break;
            case 0xCF02: // Comm Diagnosis

                var CommDiagFlag = {
                    2: "LoRa_Network_Join_Error",
                    1: "LoRa_Power_Error",
                    0: "LoRa_Regional_Restriction",

                }
                decode.comm_diagnosis = extract_bitfield(payload[0], CommDiagFlag)

                break;
            case 0xCF03: // Battery Diagnosis
                var BatteryDiagFlag = {
                    2: "Battery_Warning",
                    1: "Battery_Low",
                    0: "Battery_Change",

                }
                decode.comm_diagnosis = extract_bitfield(payload[0], BatteryDiagFlag)
                break;
            case 0xB301: // Meas Counter
                decode.meas_counter = arrayToInt16(payload, 0, false)
                break;
            case 0xB302: // Meas interval
                decode.measInt = payload[0].toString() + 'h ' + payload[1].toString() + ' min' + payload[2].toString() + ' sec';
                break;
            case 0x2A19: // Battery
                decode.batt = payload[0];
                break;
            case 0xCE01: // Keepalive
                var KeepAliveInterval = {
                    0: "24h",
                    1: "12h",
                    2: "8h",
                    3: "4h",
                    4: "2h"
                }
                var KeepAliveMode = {
                    0: "AnyTime",
                    1: "IfSilent",
                    2: "Disable"
                }
                decode.kaCfg = {};
                decode.kaCfg.mode = KeepAliveMode[(payload[0] >> 3) & 0x3];
                decode.kaCfg.interval = KeepAliveInterval[payload[0] & 0x7];
                break;
            case 0xB201: // Threshold 
                var ThsSrc = {
                    0: "MainRaw",
                    1: "MainDelta",
                    2: "SecondaryRaw",
                    3: "SecondaryDelta",
                    0xFF: "Error"
                }
                var ThsSel = {
                    0: "Config",
                    1: "Level",
                    2: "MeasInterval",
                    3: "ComMode",
                    0xFF: "Error"
                }
                decode.ThsCfg = {};
                decode.ThsCfg.Src = ThsSrc[payload[0]];
                decode.ThsCfg.Sel = ThsSel[payload[1]];
                switch (decode.ThsCfg.Sel) {
                    case "Config":
                        decode.ThsCfg.cfg = {};
                        decode.ThsCfg.cfg.eventFlag = bitfield(payload[2], 7);
                        decode.ThsCfg.cfg.enable = bitfield(payload[2], 6);
                        decode.ThsCfg.cfg.condition = (bitfield(payload[2], 5) === 1) ? '<' : '>';
                        decode.ThsCfg.cfg.autoclr = bitfield(payload[2], 4);
                        decode.ThsCfg.cfg.actionMeasIntEn = bitfield(payload[2], 3)
                        decode.ThsCfg.cfg.actionAdvModeEn = bitfield(payload[2], 2)
                        decode.ThsCfg.cfg.actionUplModeEn = bitfield(payload[2], 1)
                        break;
                    case "Level":
                        decode.ThsCfg.lvl = {};
                        if (payload.length - 2 >= 4) {
                            decode.ThsCfg.lvl.valf32 = arrayToFloat(payload, 2, false);
                            decode.ThsCfg.lvl.vali32 = arrayToInt32(payload, 2, false) / 100.0;

                            decode.ThsCfg.lvl.vali16 = arrayToInt16(payload, 4, false) / 100.0;
                        }
                        else {
                            decode.ThsCfg.lvl.err = "wrong size";
                        }
                        break;
                    case "MeasInterval":
                        decode.ThsCfg.measInt = payload[2].toString() + 'h ' + payload[3].toString() + ' min' + payload[4].toString() + ' sec';
                        break;
                    case "ComMode":
                        var ThsComBleMode = {
                            0: "Periodic",
                            1: "On Measure",
                            2: "ADV Silent"
                        }
                        var ThsComLoraMode = {
                            0: "On Measurement",
                            1: "Silent",
                            2: "Merge"
                        }
                        decode.ThsCfg.ComMode = {};
                        decode.ThsCfg.ComMode.ble = ThsComBleMode[payload[2] & 0x03];
                        decode.ThsCfg.ComMode.lora = ThsComLoraMode[payload[3] & 0x03];
                        break;
                    default:
                        break;
                }
                break;
            case 0xDB01: // Datalog
                var DataLogDataType = {
                    0: "Temperature",
                    1: "MainData",
                    2: "Temperature+MainData"
                }
                var DataLogDataSize = {
                    0: 2,
                    1: 4,
                    2: 6,
                }
                decode.Datalog = {};
                decode.Datalog.type = DataLogDataType[payload[0]];
                decode.Datalog.index = arrayToUint16(payload, 1, false);
                decode.Datalog.length = payload[3];
                var dataSize = DataLogDataSize[payload[0]];
                decode.Datalog.data = [];
                // eslint-disable-next-line
                for (var i = 0; i < decode.Datalog.length && payload.length > (dataSize * (i + 1) + 4); i++) {
                    var dataN = {};
                    dataN.index = decode.Datalog.index + i;
                    switch (decode.Datalog.type) {
                        case "Temperature":
                            dataN.temp = arrayToUint16(payload, dataSize * (i) + 4, false) / 100.0;
                            break;
                        case "MainData":
                            dataN.maini32 = arrayToInt32(payload, dataSize * (i) + 4, false) / 100.0;
                            dataN.mainf32 = arrayToFloat(payload, dataSize * (i) + 4, false);
                            break;
                        case "Temperature+MainData":
                            dataN.temp = arrayToUint16(payload, dataSize * (i) + 4, false) / 100.0;
                            dataN.maini32 = arrayToInt32(payload, dataSize * (i) + 4 + 2, false) / 100.0;
                            dataN.mainf32 = arrayToFloat(payload, dataSize * (i) + 4 + 2, false);
                            break;
                        default: break;
                    }
                    decode.Datalog.data.push(dataN);
                }
                break;
            case 0xF801: // DevEUI
                decode.DevEui = arrayToString(payload);
                break;
            case 0xF802: // AppEUI
                decode.AppEui = arrayToString(payload);
                break;
            case 0xF803: // Region
                var RegionType = {
                    0: "AS923",
                    1: "AU915",
                    2: "CN470",
                    3: "CN779",
                    4: "EU433",
                    5: "EU868",
                    6: "KR920",
                    7: "IN865",
                    8: "US915"
                }
                decode.Region = RegionType[payload[0] & 0x0F];
                break;
            case 0xF804: // NetID
                decode.netId = arrayToString(payload);
                break;
            default:
                decode.payload = []
                decode.payload = arrayToString(payload);

                break;
        }


    }
    else {
        res = false;
    }
    return res;
}
function DecodeKeepAlive(decode, port, bytes) {
    if (port === 30) {
        decode.msgType = "Keep Alive";
        decode.devtype = {}
        decode.devtype = getDevtype(arrayToUint16(bytes, 0, false));
        decode.cnt = arrayToUint16(bytes, 2, false, false);
        decode.devstat = []
        decode.devstat = getDevstat(bytes[4])
        decode.bat = bytes[5];

        return true;
    }
    else {
        return false;
    }
}
function DecodeTiltSensor(decode, port, bytes) {
    decode.size = bytes.length;
    if (port === 10)
        if (0x2411 === arrayToUint16(bytes, 0, false) && bytes.length === 24) {
            decode.cnt = arrayToUint16(bytes, 2, false, false);
            var devstat;
            devstat = [];
            var DevstatDict = {
                7: "Com_Err",
                6: "Crc_Err",
                5: "Timeout_Err",
                4: "Sys_Err",
                3: "Conf_Err"
            }

            if (bytes[4] === 0x00) {
                devstat = 'ok';
            }
            else {

                for (var i = 7; i >= 3; i--) {
                    if (bitfield(bytes[4], i) === 1) {
                        devstat.push(DevstatDict[i]);
                    }
                }
            }
            decode.devstat = devstat
            decode.bat = bytes[5];
            decode.temp = (arrayConverter(bytes, 6, 2, false, true) / 100.0).toString() + "°C";
            decode.angleX = (arrayConverter(bytes, 8, 2, false, true) / 100.0).toString() + "°";
            decode.angleY = (arrayConverter(bytes, 10, 2, false, true) / 100.0).toString() + "°";
            decode.dispX = (arrayToFloat(bytes, 12, false)).toString() + "mm";
            decode.dispY = (arrayToFloat(bytes, 16, false)).toString() + "mm";
            decode.dispZ = (arrayToFloat(bytes, 20, false)).toString() + "mm";
            return true;
        }


    return false;
}

function DecodeSinglePointOrMultiPoint(decode, port, bytes, error) {
    if (port === 10) {

        // Mapping between bw_mode and bin resolution
        var BW_MODE_RESOLUTION = {
            0x00: 0.125,
            0x01: 0.25,
            0x02: 0.5,
            0x03: 1,
            0x04: 2,
            0x05: 3,
            0x06: 4,
            0x07: 5,
            0x08: 6,
            0x09: 7,
            0x0A: 8,
            0x0B: 9,
            0x0C: 10,
            0x0D: 11,
            0x0E: 12,
            0x0F: 13,
        }


        // SINGLEPOINT
        // 0x1321, 0x1222, 0x1422 map to devtype for pressure and temperature and humidity sensors...
        if ([0x1321, 0x1222, 0x1422].includes(arrayToUint16(bytes, 0, false))) {
            decode.devtype = {}
            decode.devtype = getDevtype(arrayToUint16(bytes, 0, false));
            decode.cnt = arrayToUint16(bytes, 2, false, false);
            decode.devstat = []
            decode.devstat = getDevstat(bytes[4])
            decode.bat = bytes[5];

            decode.temp = (arrayConverter(bytes, 6, 2, false, true) / 100.0).toString();
            if (decode.devtype.Output === "Float") {
                decode.data = (arrayToFloat(bytes, 8, false)).toString();
            }
            else {
                decode.data = (arrayToInt32(bytes, 8, false) / 100.0).toString();
            }
            return true;
        }

        // MULTIPOINT
        // 0x1121 should be single axis and 0x1521 should be tri-axis
        else if ([0x1121, 0x1521, 0x152f, 0x112f].includes(arrayToUint16(bytes, 0, false))) {
            decode.devtype = {}
            decode.devtype = getDevtype(arrayToUint16(bytes, 0, false));
            decode.cnt = arrayToUint16(bytes, 2, false, false);
            decode.devstat = []
            decode.devstat = getDevstat(bytes[4])
            decode.bat = bytes[5];
            decode.temp = (arrayConverter(bytes, 6, 2, false, true) / 100.0).toString();

            decode.vibration_information = {}
            decode.vibration_information.frame_format = getBits(bytes[8], 0, 2)
            decode.vibration_information.rotating_mode = getBits(bytes[8], 4, 1)
            decode.vibration_information.axis = []
            if (getBits(bytes[8], 5, 1) === 1)
                decode.vibration_information.axis.push("x");
            if (getBits(bytes[8], 6, 1) === 1)
                decode.vibration_information.axis.push("y");
            if (getBits(bytes[8], 7, 1) === 1)
                decode.vibration_information.axis.push("z");
            decode.preset_id = bytes[9];

            decode.bw_mode = bytes[10];
            if (decode.bw_mode > 0x0F) {
                error.push("BW_Mode must be between 0x00 and 0x0F.")
                return false;
            }

            var isSensorErr = decode.devstat.includes("SnsErr")
            if (isSensorErr) {
                error.push("Sensor measure is not reliable or is out of range (for more detail see sensor diagnosis).")
                return false;
            }

            decode.vibration_data = {}


            switch (decode.vibration_information.frame_format) {
                // DATA FORMAT 0
                case 0:

                    var axisSize = 6
                    // Offset to keep track if an axis existed or not, axis should always come X then Y then Z
                    var offset = 0

                    if (decode.vibration_information.axis.includes("x")) {
                        decode.vibration_data.x = {}
                        decode.vibration_data.x.time_rms = arrayConverter(bytes, 11, 2, false)
                        decode.vibration_data.x.time_p2p = arrayConverter(bytes, 13, 2, false)
                        decode.vibration_data.x.freq_rms = arrayConverter(bytes, 15, 2, false)
                        offset += 1
                    }

                    if (decode.vibration_information.axis.includes("y")) {
                        decode.vibration_data.y = {}
                        decode.vibration_data.y.time_rms = arrayConverter(bytes, offset * axisSize + 11, 2, false)
                        decode.vibration_data.y.time_p2p = arrayConverter(bytes, offset * axisSize + 13, 2, false)
                        decode.vibration_data.y.freq_rms = arrayConverter(bytes, offset * axisSize + 15, 2, false)
                        offset += 1
                    }

                    if (decode.vibration_information.axis.includes("z")) {
                        decode.vibration_data.z = {}
                        decode.vibration_data.z.time_rms = arrayConverter(bytes, offset * axisSize + 11, 2, false)
                        decode.vibration_data.z.time_p2p = arrayConverter(bytes, offset * axisSize + 13, 2, false)
                        decode.vibration_data.z.freq_rms = arrayConverter(bytes, offset * axisSize + 15, 2, false)
                    }

                    break;

                // DATA FORMAT 1 is the default one, because it the format selected in the default preset ID 0
                case 1:
                    decode.vibration_data.spectrum_rms = arrayConverter(bytes, 11, 2, false)
                    decode.vibration_data.time_p2p = arrayConverter(bytes, 13, 2, false)
                    decode.vibration_data.velocity = arrayConverter(bytes, 15, 2, false)
                    decode.vibration_data.windows = []

                    let windowSize = 14
                    // Les fenetre demarrent a partir de cette offset
                    let offsetStartWindows = 17

                    // On enleve tous les bytes de header, on enleve la derniere fenetre si elle est fragmente
                    let windowsNumber = Math.floor((bytes.length - offsetStartWindows) / windowSize)


                    // Parcours de toutes les fenetres, par defaut il y en a 8 en preset ID 0 
                    for (let windowIndex = 0; windowIndex < windowsNumber; windowIndex++) {
                        let window_data = {}
                        // Two first byte of the window
                        window_data.rms_window = arrayConverter(bytes, offsetStartWindows + windowIndex * windowSize, 2, false)

                        let peak1_bin = arrayConverter(bytes, offsetStartWindows + windowIndex * windowSize + 2, 2, false)
                        if (peak1_bin !== 0xFFFF) {
                            window_data.peak1_bin = peak1_bin
                            window_data.peak1_frequency = window_data.peak1_bin * BW_MODE_RESOLUTION[decode.bw_mode]
                            window_data.peak1_rms = arrayConverter(bytes, offsetStartWindows + windowIndex * windowSize + 4, 2, false)
                        }

                        let peak2_bin = arrayConverter(bytes, offsetStartWindows + windowIndex * windowSize + 6, 2, false)
                        if (peak2_bin !== 0xFFFF) {

                            window_data.peak2_bin = peak2_bin
                            window_data.peak2_frequency = window_data.peak2_bin * BW_MODE_RESOLUTION[decode.bw_mode]
                            window_data.peak2_rms = arrayConverter(bytes, offsetStartWindows + windowIndex * windowSize + 8, 2, false)
                        }

                        let peak3_bin = arrayConverter(bytes, offsetStartWindows + windowIndex * windowSize + 10, 2, false)
                        if (peak3_bin !== 0xFFFF) {
                            window_data.peak3_bin = peak3_bin
                            window_data.peak3_frequency = window_data.peak3_bin * BW_MODE_RESOLUTION[decode.bw_mode]
                            window_data.peak3_rms = arrayConverter(bytes, offsetStartWindows + windowIndex * windowSize + 12, 2, false)
                        }

                        decode.vibration_data.windows.push(window_data);

                    }

                    break;

                // DATA FORMAT 2
                case 2:
                    decode.vibration_data.spectrum_rms = arrayConverter(bytes, 11, 2, false)
                    decode.vibration_data.time_p2p = arrayConverter(bytes, 13, 2, false)
                    decode.vibration_data.velocity = arrayConverter(bytes, 15, 2, false)
                    decode.vibration_data.peak_cnt = bytes[17]
                    decode.vibration_data.peaks = []

                    let peak_size = 19;

                    /** Les peaks demarrent a partir de cette offset */
                    let offsetStartPeaks = 18

                    let peaks_bitfield = ""

                    // Where to stop looking for peak
                    const binary_limit = Math.ceil((decode.vibration_data.peak_cnt * peak_size) / 8)
                    for (let i = 0; i < binary_limit; i++) {
                        let byte = bytes[offsetStartPeaks + i];
                        peaks_bitfield += byte.toString(2).padStart(8, '0');
                    }

                    // Hold the cursor for bit indexing inside peaks
                    let current_bit_index = 0;
                    for (let peakIndex = 0; peakIndex < decode.vibration_data.peak_cnt; peakIndex++) {
                        if (current_bit_index + 19 > peaks_bitfield.length) {
                            // Not enough bits left for another (PEAK_BIN, PEAK_MAGNITUDE) pair
                            break;
                        }

                        let peak_data = {}

                        // Bin index is 11 bit wide
                        peak_data.bin_index = parseInt(peaks_bitfield.substring(current_bit_index, current_bit_index + 11), 2)
                        peak_data.frequency = peak_data.bin_index * BW_MODE_RESOLUTION[decode.bw_mode]
                        current_bit_index += 11;

                        // Magnitude is just after, 8 bit wide
                        peak_data.magnitude_compressed = parseInt(peaks_bitfield.substring(current_bit_index, current_bit_index + 8), 2);
                        peak_data.magnitude_rms = dBDecompression(peak_data.magnitude_compressed)
                        current_bit_index += 8;

                        decode.vibration_data.peaks.push(peak_data);
                    }
                    break;
                default:
                    break;
            }

            return true;
        }

        // Unknown product
        else {
            return false
        }


    } else if (port === 138 || port === 202) {
        decode.val = 'Vibration Multipoint : Fragmented frame NOT SUPPORTED by TTN Live Decoder';
        decode.port = port;
        decode.bytes = arrayToString(bytes);
        return true;
    }
    return false;
}
function getDevstat(u8devstat) {
    var devstat;
    devstat = [];
    var DevstatDict = {
        7: "SnsErr",
        6: "CfgErr",
        5: "CommErr",
        4: "Condition",
        3: "PrelPhase",
        2: "Reserved",
        1: "Reserved",
        0: "BattErr"
    }

    if (u8devstat === 0x00) {
        devstat.ok = 'ok';
    }
    else {

        for (var i = 7; i >= 0; i--) {
            if (bitfield(u8devstat, i) === 1) {
                devstat.push(DevstatDict[i]);
            }
        }
    }
    return devstat;
}
function getDevtype(u16devtype) {
    var devtype = {};

    var SwPlatformDict = {
        0: "Error",
        1: "Platform_21"
    }
    var SensorDict = {
        0: "Error",
        1: "Vibration 1-axis",
        2: "Temperature",
        3: "Pressure",
        4: "Humidity",
        5: "Vibration 3-axis"
    }
    var SensorUnitDict = {
        0: "Error",
        1: "g",
        2: "°C",
        3: "Bar",
        4: "%",
        5: "g",
    }
    var WirelessDict = {
        0: "Error",
        1: "BLE",
        2: "BLE/LoRaWAN",
    }
    var OutputDict = {
        0: "Error",
        1: "Float",
        2: "Integer",
        15: "N/A"
    }
    devtype.Platform = SwPlatformDict[((u16devtype >> 12) & 0x0F)];
    devtype.Sensor = SensorDict[((u16devtype >> 8) & 0x0F)];
    devtype.Wireless = WirelessDict[((u16devtype >> 4) & 0x0F)];
    devtype.Output = OutputDict[(u16devtype & 0x0F)];
    devtype.Unit = SensorUnitDict[((u16devtype >> 8) & 0x0F)];
    return devtype;
}
function arrayToString(arr, offset = 0, size = arr.length - offset) {
    var text = ''
    text = arr.slice(offset, offset + size).map(byte => byte.toString(16)).join(',');

    return text
}
function arrayToAscii(arr, offset = 0, size = arr.length - offset) {
    var text = ''
    for (var i = 0; i < size; i++) {
        text += String.fromCharCode(arr[i + offset]);
    }
    return text
}
function round(value, decimal) {
    return Math.round(value * Math.pow(10, decimal)) / Math.pow(10, decimal);

}

function arrayToUint16(arr, offset, littleEndian = true) {
    return (arrayConverter(arr, offset, 2, littleEndian, false));
}
function arrayToInt32(arr, offset, littleEndian = true) {
    return (arrayConverter(arr, offset, 4, littleEndian, true));
}
function arrayToInt16(arr, offset, littleEndian = true) {
    return (arrayConverter(arr, offset, 2, littleEndian, true));
}


function arrayToFloat(arr, offset, littleEndian = true) {
    let view = new DataView(new ArrayBuffer(4));
    for (let i = 0; i < 4; i++) {
        view.setUint8(i, arr[i + offset]);
    }
    return view.getFloat32(0, littleEndian);
}


function arrayConverter(arr, offset, size, littleEndian = true, isSigned = false) {
    // Concatenate bytes from arr[offset] to arr[offset+size] and return the value as decimal. 
    // The reading sense depends on endianess, by default littleEndian (from right to left)
    var outputval = 0;
    for (var i = 0; i < size; i++) {
        if (littleEndian === false) {
            outputval |= arr[offset + size - i - 1] << (i * 8);
        }
        else {
            outputval |= arr[i + offset] << (i * 8);
        }
    }
    if (isSigned && (Math.pow(2, (size) * 8 - 1) < outputval))
        outputval = outputval - Math.pow(2, size * 8);

    return outputval;
}

function bitfield(val, offset) {
    return (val >> offset) & 0x01;
}

function dBDecompression(val) {
    if (val === 0) return 0;
    return Math.pow(10, ((val * 0.3149606) - 49.0298) / 20);
}


/** Extrait les bits d'un nombre
 * 
 * Exemple : 0b00110001 index 2 size 2, -> 0b11 
 * 
 * number peut etre n importe quel representation hexadecimale
 */
function getBits(number, index, size) {
    // Input validation
    if (number < 0) {
        console.error("Invalid input. Please provide a non-negative number.")
        return null;
    }

    if (typeof index !== 'number' || index < 0) {
        console.error("Invalid index input. Please provide a non-negative number.");
        return null;
    }

    if (typeof size !== 'number' || size < 1) {
        console.error("Invalid size input. Please provide a positive number.");
        return null;
    }

    // Convert byte to binary
    let binary = number.toString(2);

    // Add leading zeros if necessary
    while (binary.length % 8 !== 0) {
        binary = '0' + binary;
    }

    // Extract bits specified by index and size
    let extractedBits = binary.slice(index, index + size);

    // Convert extracted bits to integer
    let result = parseInt(extractedBits, 2);

    return result;
}


/**
 * Take a byte, a value_dict and return a list of error for each value in the value_dict
 * @param {byte} byte 
 * @param {dict} value_dict The key is the bit number, and the value is the error string that should be pushed.
 * @returns list
 */
function extract_bitfield(byte, value_dict) {
    var list_flag = []
    for (var i = 7; i >= 0; i--) {
        if (bitfield(byte, i) === 1) {
            if (value_dict[i] != null)
                list_flag.push(value_dict[i]);
        }
    }
    return list_flag
}



// For NPM (module exports), so that it is compliant with TTN
if (typeof exports !== 'undefined') {
    exports.te_decoder = te_decoder; // CommonJS export for NPM
    exports.decodeUplink = decodeUplink;
}