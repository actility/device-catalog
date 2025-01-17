function u16_to_s16(u16) {
    var s16 = u16 & 0xFFFF;
    if (s16 & 0x8000) {
        s16 = -(0x10000 - s16);
    }
    return s16;
}

function u8_to_s8(u8) {
    var s8 = u8 & 0xFF;
    if (s8 & 0x80) {
        s8 = -(0x100 - s8);
    }
    return s8;
}

function voltageToBatteryPercentage(voltage) {
    var maxVoltage, minVoltage, absoluteMaxVoltage, percentage;

    if (voltage < 2.0) {
        // Batterie de 1.5V
        minVoltage = 1.0;
        maxVoltage = 1.5;
        absoluteMaxVoltage = 1.9; // Toute tension entre 1.5V et 1.9V = 100%

        if (voltage < minVoltage) {
            percentage = 0;
        } else if (voltage >= maxVoltage && voltage <= absoluteMaxVoltage) {
            percentage = 100;
        } else if (voltage > absoluteMaxVoltage) {
            percentage = 100;
        } else {
            percentage = ((voltage - minVoltage) / (maxVoltage - minVoltage)) * 100;
        }
    } else {
        // Batterie de 3.6V
        minVoltage = 2.7;
        maxVoltage = 3.6;
        absoluteMaxVoltage = 4.0; // Toute tension entre 3.6V et 4.0V = 100%

        if (voltage < minVoltage) {
            percentage = 0;
        } else if (voltage >= maxVoltage && voltage <= absoluteMaxVoltage) {
            percentage = 100;
        } else if (voltage > absoluteMaxVoltage) {
            percentage = 100;
        } else {
            percentage = ((voltage - minVoltage) / (maxVoltage - minVoltage)) * 100;
        }
    }

    // Arrondir le pourcentage au multiple de 20 le plus proche
    percentage = Math.round(percentage / 20) * 20;

    // S'assurer que le pourcentage est dans l'intervalle [0, 100]
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;

    return percentage;
}

function Decode(fPort, bytes) {
    // Déclaration des constantes LPP
    var LPP_PARSER = 0x0000;
    var LPP_DUMMY = 0x0001;
    var LPP_TEMP = 0x0010;
    var LPP_RHUM = 0x0011;
    var LPP_CO2 = 0x0012;
    var LPP_VOC = 0x0013;
    var LPP_ATM_P = 0x0030;
    var LPP_DP = 0x0031;
    var LPP_FLOW = 0x0032;
    var LPP_VISIBLE_LIGHT = 0x0040;
    var LPP_OCCU0 = 0x0041;
    var LPP_REED0 = 0x0050;
    var LPP_CONDENSATION = 0x0051;
    var LPP_VBAT = 0x0054;
    var LPP_SETPOINT = 0x0063;
    var LPP_VBAT_HI_RES = 0x8540;
    var LPP_OCCU1 = 0x9410;
    var LPP_REED1 = 0x9500;
    var LPP_CONDENSATION_RAW = 0x9510;
    var LPP_DEV_KEY = 0xC000;
    var LPP_CMD = 0xC100;
    var LPP_LEARN = 0xC103;
    var LPP_BAT_TYPE = 0xC105;
    var LPP_HEARTBEAT = 0xC106;
    var LPP_MEAS_INTERVAL = 0xC108;
    var LPP_CNT_MEAS = 0xC10A;
    var LPP_BIN_LATENCY = 0xC10B;
    var LPP_TLF_MODE = 0xC120;
    var LPP_TLF_ONTIME = 0xC121;
    var LPP_TLF_INTERVAL_0 = 0xC123;
    var LPP_TLF_INTERVAL_1 = 0xC125;
    var LPP_TLF_INTERVAL_2 = 0xC127;
    var LPP_TLF_INTERVAL_3 = 0xC129;
    var LPP_TLF_INTERVAL_4 = 0xC12B;
    var LPP_TLF_INTERVAL_5 = 0xC12D;
    var LPP_LED_MODE = 0xC134;
    var LPP_LED_ONTIME = 0xC135;
    var LPP_LED_INTERVAL_0 = 0xC136;
    var LPP_LED_INTERVAL_1 = 0xC137;
    var LPP_LED_INTERVAL_2 = 0xC138;
    var LPP_LED_INTERVAL_3 = 0xC139;
    var LPP_FORCED_UPLINK = 0xC230;

    var decoded = {};
    var data = bytes;
    var tempVBAT = null; 
    var i = 0;

    while (i < data.length) {
        var lpp = 0;
        if (data[i] <= 0x7F) {
            lpp = data[i];
            i++;
        } else {
            if (i + 1 < data.length) {
                lpp = (data[i] << 8) | data[i + 1];
                i += 2;
            } else {
                break; // Sortie de la boucle si les données sont insuffisantes
            }
        }

        switch (lpp) {
            case LPP_PARSER:
                if (i + 1 <= data.length) {
                    decoded.PARSER = u16_to_s16((data[i] << 8) | data[i + 1]);
                    i += 2;
                }
                break;

            case LPP_DUMMY:
                if (i < data.length) {
                    decoded.DUMMY = u8_to_s8(data[i]);
                    i++;
                }
                break;

            case LPP_TEMP:
                if (i + 1 <= data.length) {
                    decoded.TEMP = u16_to_s16((data[i] << 8) | data[i + 1]) / 10;
                    i += 2;
                }
                break;

            case LPP_RHUM:
                if (i < data.length) {
                    decoded.RHUM = data[i];
                    i++;
                }
                break;

            case LPP_CO2:
                if (i + 1 <= data.length) {
                    decoded.CO2 = (data[i] << 8) | data[i + 1];
                    i += 2;
                }
                break;

            case LPP_VOC:
                if (i + 1 <= data.length) {
                    decoded.VOC = (data[i] << 8) | data[i + 1];
                    i += 2;
                }
                break;

            case LPP_ATM_P:
                if (i + 1 <= data.length) {
                    decoded.ATM_P = (data[i] << 8) | data[i + 1];
                    i += 2;
                }
                break;

            case LPP_DP:
                if (i + 1 <= data.length) {
                    decoded.DP = u16_to_s16((data[i] << 8) | data[i + 1]);
                    i += 2;
                }
                break;

            case LPP_FLOW:
                if (i + 1 <= data.length) {
                    decoded.FLOW = (data[i] << 8) | data[i + 1];
                    i += 2;
                }
                break;

            case LPP_VISIBLE_LIGHT:
                if (i + 1 <= data.length) {
                    decoded.VISIBLE_LIGHT = (data[i] << 8) | data[i + 1];
                    i += 2;
                }
                break;

            case LPP_OCCU0:
                if (i < data.length) {
                    decoded.OCCU0_STATE = data[i] & 0x01;
                    decoded.OCCU0_CNT = data[i] >> 1;
                    i++;
                }
                break;

            case LPP_REED0:
                if (i < data.length) {
                    decoded.REED0_STATE = data[i] & 0x01;
                    decoded.REED0_CNT = data[i] >> 1;
                    i++;
                }
                break;

            case LPP_CONDENSATION:
                if (i + 1 <= data.length) {
                    decoded.CONDENSATION_STATE = data[i] >>> 7;
                    decoded.CONDENSATION_RAW = ((data[i] & 0x7F) << 8) | data[i + 1];
                    i += 2;
                }
                break;

            case LPP_VBAT:
                if (i < data.length) {
                    var vbatMillivolts = data[i] * 20; // VBAT en millivolts
                    tempVBAT = vbatMillivolts;
                    i++;
                }
                break;

            case LPP_SETPOINT:
                if (i < data.length) {
                    decoded.SETPOINT = data[i];
                    i++;
                }
                break;

            case LPP_VBAT_HI_RES:
                if (i + 1 <= data.length) {
                    decoded.VBAT_HI_RES = (data[i] << 8) | data[i + 1];
                    i += 2;
                }
                break;

            case LPP_OCCU1:
                if (i < data.length) {
                    decoded.OCCU1_STATE = data[i] & 0x01;
                    decoded.OCCU1_CNT = data[i] >> 1;
                    i++;
                }
                break;

            case LPP_REED1:
                if (i < data.length) {
                    decoded.REED1_STATE = data[i] & 0x01;
                    decoded.REED1_CNT = data[i] >> 1;
                    i++;
                }
                break;

            case LPP_CONDENSATION_RAW:
                if (i + 1 <= data.length) {
                    decoded.CONDENSATION_RAW = u16_to_s16((data[i] << 8) | data[i + 1]);
                    i += 2;
                }
                break;

            case LPP_DEV_KEY:
                if (i + 1 <= data.length) {
                    decoded.DEV_KEY = (data[i] << 8) | data[i + 1];
                    i += 2;
                }
                break;

            case LPP_CMD:
                if (i + 1 <= data.length) {
                    decoded.CMD = (data[i] << 8) | data[i + 1];
                    i += 2;
                }
                break;

            case LPP_LEARN:
                if (i < data.length) {
                    decoded.LEARN = data[i];
                    i++;
                }
                break;

            case LPP_BAT_TYPE:
                
                if (i + 1 <= data.length) {
                    i += 2;
                }
                break;

            case LPP_HEARTBEAT:
                if (i + 1 <= data.length) {
                    decoded.HEARTBEAT = ((data[i] << 8) | data[i + 1]) * 60000; // Convertir en millisecondes
                    i += 2;
                }
                break;

            case LPP_MEAS_INTERVAL:
                if (i + 1 <= data.length) {
                    decoded.MEAS_INTERVAL = ((data[i] << 8) | data[i + 1]) * 1000; // Convertir en millisecondes
                    i += 2;
                }
                break;

            case LPP_CNT_MEAS:
                if (i + 1 <= data.length) {
                    decoded.CNT_MEAS = (data[i] << 8) | data[i + 1];
                    i += 2;
                }
                break;

            case LPP_BIN_LATENCY:
                if (i + 1 <= data.length) {
                    decoded.BIN_LATENCY = ((data[i] << 8) | data[i + 1]) * 1000; // Convertir en millisecondes
                    i += 2;
                }
                break;

            case LPP_TLF_MODE:
                if (i < data.length) {
                    decoded.TLF_MODE = data[i];
                    i++;
                }
                break;

            case LPP_TLF_ONTIME:
                if (i + 1 <= data.length) {
                    decoded.TLF_ONTIME = (data[i] << 8) | data[i + 1];
                    i += 2;
                }
                break;

            case LPP_TLF_INTERVAL_0:
            case LPP_TLF_INTERVAL_1:
            case LPP_TLF_INTERVAL_2:
            case LPP_TLF_INTERVAL_3:
            case LPP_TLF_INTERVAL_4:
            case LPP_TLF_INTERVAL_5:
                if (i + 1 <= data.length) {
                    var intervalIndex = (lpp - LPP_TLF_INTERVAL_0) / 2;
                    decoded['TLF_INTERVAL_' + intervalIndex] = (data[i] << 8) | data[i + 1];
                    i += 2;
                }
                break;

            case LPP_LED_MODE:
                if (i < data.length) {
                    decoded.LED_MODE = data[i];
                    i++;
                }
                break;

            case LPP_LED_ONTIME:
                if (i + 1 <= data.length) {
                    decoded.LED_ONTIME = (data[i] << 8) | data[i + 1];
                    i += 2;
                }
                break;

            case LPP_LED_INTERVAL_0:
            case LPP_LED_INTERVAL_1:
            case LPP_LED_INTERVAL_2:
            case LPP_LED_INTERVAL_3:
                if (i + 1 <= data.length) {
                    var ledIntervalIndex = lpp - LPP_LED_INTERVAL_0;
                    decoded['LED_INTERVAL_' + ledIntervalIndex] = (data[i] << 8) | data[i + 1];
                    i += 2;
                }
                break;

            case LPP_FORCED_UPLINK:
                if (i + 1 <= data.length) {
                    decoded.FORCED_UPLINK = (data[i] << 8) | data[i + 1];
                    i += 2;
                }
                break;

            default:
                // Données inconnues, on sort de la boucle
                i = data.length;
                break;
        }
    }

    // Après avoir parcouru le payload, calculer VBAT et PBAT
    if (tempVBAT !== null) {
        decoded.VBAT = tempVBAT; // En millivolts
        var vbatVolts = tempVBAT / 1000.0; // Convertir en volts

        // Calculer PBAT en fonction de la tension
        decoded.PBAT = voltageToBatteryPercentage(vbatVolts);
    }

    return decoded;
}

function decodeUplink(input) {
	return {
		data: Decode(input.fPort, input.bytes)
	};
}