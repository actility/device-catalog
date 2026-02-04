// Questions or remarks: steven.jam@thermokon.fr or support@thermokon.de

// Fonctions utilitaires de conversion
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

function Decode(fPort, bytes) {
    
    var LPP_PARSER                   = 0x0000;
    var LPP_DUMMY                    = 0x0001;
    var LPP_TEMP                     = 0x0010;
    var LPP_RHUM                     = 0x0011;
    var LPP_CO2                      = 0x0012;
    var LPP_VOC                      = 0x0013;
    var LPP_ATM_P                    = 0x0030;
    var LPP_DP                       = 0x0031;
    var LPP_FLOW                     = 0x0032;
    var LPP_VISIBLE_LIGHT            = 0x0040;
    var LPP_OCCU0                    = 0x0041;
    var LPP_REED0                    = 0x0050;
    var LPP_CONDENSATION             = 0x0051;
    var LPP_VBAT                     = 0x0054;
    var LPP_SETPOINT                 = 0x0063;
    var LPP_VBAT_HI_RES              = 0x8540;
    var LPP_OCCU1                    = 0x9410;
    var LPP_REED1                    = 0x9500;
    var LPP_CONDENSATION_RAW         = 0x9510;
    var LPP_DEV_KEY                  = 0xC000;
    var LPP_CMD                      = 0xC100;
    var LPP_LEARN                    = 0xC103;
    var LPP_BAT_TYPE                 = 0xC105;
    var LPP_HEARTBEAT                = 0xC106;
    var LPP_MEAS_INTERVAL            = 0xC108;
    var LPP_CNT_MEAS                 = 0xC10A;
    var LPP_BIN_LATENCY              = 0xC10B;
    var LPP_TLF_MODE                 = 0xC120;
    var LPP_TLF_ONTIME               = 0xC121;
    var LPP_TLF_INTERVAL_0           = 0xC123;
    var LPP_TLF_INTERVAL_1           = 0xC125;
    var LPP_TLF_INTERVAL_2           = 0xC127;
    var LPP_TLF_INTERVAL_3           = 0xC129;
    var LPP_TLF_INTERVAL_4           = 0xC12B;
    var LPP_TLF_INTERVAL_5           = 0xC12D;
    var LPP_LED_MODE                 = 0xC134;
    var LPP_LED_ONTIME               = 0xC135;
    var LPP_LED_INTERVAL_0           = 0xC136;
    var LPP_LED_INTERVAL_1           = 0xC137;
    var LPP_LED_INTERVAL_2           = 0xC138;
    var LPP_LED_INTERVAL_3           = 0xC139;
    var LPP_FORCED_UPLINK            = 0xC230;
    // Nouveaux paramètres
    var LPP_OCCU0ENABLE              = 0x8415;
    var LPP_BUTTON                   = 0x8550;
    var LPP_TEMP_2                   = 0x9100;
    var LPP_MOISTURE_2               = 0x9140;
    var LPP_BUTTON_2                 = 0x9550;
    var LPP_SETPOINT_2               = 0x9630;
    var LPP_TEMP_3                   = 0xA100;
    var LPP_EPD_VALUE_EXT_OVERLOAD_0 = 0xC194;
    var LPP_EPD_VALUE_EXT_OVERLOAD_1 = 0xC19C;
    var LPP_EPD_VALUE_EXT_OVERLOAD_2 = 0xC1A4;
    var LPP_EPD_VALUE_EXT_OVERLOAD_3 = 0xC1AC;

    var decoded = {};
    var data = bytes;
    var tempVBAT = null;
    var i = 0;

    while (i < data.length) {
        var lpp = 0;
        // L'identifiant peut être sur 1 ou 2 octets
        if (data[i] <= 0x7F) {
            lpp = data[i];
            i++;
        } else {
            if (i + 1 < data.length) {
                lpp = (data[i] << 8) | data[i + 1];
                i += 2;
            } else {
                break;
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
                    decoded.CONDENSATION_RAW = u16_to_s16((data[i] << 8) | data[i + 1]) & 0x0FFF;
                    i += 2;
                }
                break;
            case LPP_VBAT:
                if (i < data.length) {
                    var vbatMillivolts = data[i] * 20; // Conversion en millivolts
                    tempVBAT = vbatMillivolts;
                    i++;
                }
                break;
            case LPP_SETPOINT:
                if (i <= data.length) {
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
                    decoded.BAT_TYPE = (data[i] << 8) | data[i + 1];
                    i += 2;
                }
                break;
            case LPP_HEARTBEAT:
                if (i + 1 <= data.length) {
                    decoded.HEARTBEAT = ((data[i] << 8) | data[i + 1]) / (1.0 / 60000);
                    i += 2;
                }
                break;
            case LPP_MEAS_INTERVAL:
                if (i + 1 <= data.length) {
                    decoded.MEAS_INTERVAL = ((data[i] << 8) | data[i + 1]) / (1.0 / 1000);
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
                    decoded.BIN_LATENCY = ((data[i] << 8) | data[i + 1]) / (1.0 / 1000);
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
                if (i + 1 <= data.length) {
                    decoded.TLF_INTERVAL_0 = (data[i] << 8) | data[i + 1];
                    i += 2;
                }
                break;
            case LPP_TLF_INTERVAL_1:
                if (i + 1 <= data.length) {
                    decoded.TLF_INTERVAL_1 = (data[i] << 8) | data[i + 1];
                    i += 2;
                }
                break;
            case LPP_TLF_INTERVAL_2:
                if (i + 1 <= data.length) {
                    decoded.TLF_INTERVAL_2 = (data[i] << 8) | data[i + 1];
                    i += 2;
                }
                break;
            case LPP_TLF_INTERVAL_3:
                if (i + 1 <= data.length) {
                    decoded.TLF_INTERVAL_3 = (data[i] << 8) | data[i + 1];
                    i += 2;
                }
                break;
            case LPP_TLF_INTERVAL_4:
                if (i + 1 <= data.length) {
                    decoded.TLF_INTERVAL_4 = (data[i] << 8) | data[i + 1];
                    i += 2;
                }
                break;
            case LPP_TLF_INTERVAL_5:
                if (i + 1 <= data.length) {
                    decoded.TLF_INTERVAL_5 = (data[i] << 8) | data[i + 1];
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
                if (i + 1 <= data.length) {
                    decoded.LED_INTERVAL_0 = (data[i] << 8) | data[i + 1];
                    i += 2;
                }
                break;
            case LPP_LED_INTERVAL_1:
                if (i + 1 <= data.length) {
                    decoded.LED_INTERVAL_1 = (data[i] << 8) | data[i + 1];
                    i += 2;
                }
                break;
            case LPP_LED_INTERVAL_2:
                if (i + 1 <= data.length) {
                    decoded.LED_INTERVAL_2 = (data[i] << 8) | data[i + 1];
                    i += 2;
                }
                break;
            case LPP_LED_INTERVAL_3:
                if (i + 1 <= data.length) {
                    decoded.LED_INTERVAL_3 = (data[i] << 8) | data[i + 1];
                    i += 2;
                }
                break;
            case LPP_FORCED_UPLINK:
                if (i + 1 <= data.length) {
                    decoded.FORCED_UPLINK = (data[i] << 8) | data[i + 1];
                    i += 2;
                }
                break;
            case LPP_OCCU0ENABLE:
                if (i <= data.length) {
                    decoded.OCCU0ENABLE = data[i];
                    i++;
                }
                break;
            case LPP_BUTTON:
                if (i <= data.length) {
                    decoded.BUTTON_PRESSED = (data[i] >= 2) ? 1 : 0;
                    decoded.BUTTON_LAST_TYPE = ((data[i] & 0x01) >= 1) ? "Long Press" : "Short Press";
                    decoded.BUTTON_CNT = data[i] >> 1;
                    i++;
                }
                break;
            case LPP_TEMP_2:
                if (i + 1 <= data.length) {
                    decoded.TEMP_2 = u16_to_s16((data[i] << 8) | data[i + 1]) / 10;
                    i += 2;
                }
                break;
            case LPP_MOISTURE_2:
                if (i + 1 <= data.length) {
                    decoded.MOISTURE_2 = (data[i] << 8) | data[i + 1];
                    i += 2;
                }
                break;
            case LPP_BUTTON_2:
                if (i <= data.length) {
                    decoded.BUTTON_2_PRESSED = (data[i] >= 2) ? 1 : 0;
                    decoded.BUTTON_2_LAST_TYPE = ((data[i] & 0x01) >= 1) ? "Long Press" : "Short Press";
                    decoded.BUTTON_2_CNT = data[i] >> 1;
                    i++;
                }
                break;
            case LPP_SETPOINT_2:
                if (i + 1 <= data.length) {
                    decoded.SETPOINT_2 = ((data[i] << 8) | data[i + 1]) / 10;
                    i += 2;
                }
                break;
            case LPP_TEMP_3:
                if (i + 1 <= data.length) {
                    decoded.TEMP_3 = u16_to_s16((data[i] << 8) | data[i + 1]) / 10;
                    i += 2;
                }
                break;
            case LPP_EPD_VALUE_EXT_OVERLOAD_0:
                if (i + 1 <= data.length) {
                    decoded.EPD_VALUE_EXT_OVERLOAD_0 = u16_to_s16((data[i] << 8) | data[i + 1]);
                    i += 2;
                }
                break;
            case LPP_EPD_VALUE_EXT_OVERLOAD_1:
                if (i + 1 <= data.length) {
                    decoded.EPD_VALUE_EXT_OVERLOAD_1 = u16_to_s16((data[i] << 8) | data[i + 1]);
                    i += 2;
                }
                break;
            case LPP_EPD_VALUE_EXT_OVERLOAD_2:
                if (i + 1 <= data.length) {
                    decoded.EPD_VALUE_EXT_OVERLOAD_2 = u16_to_s16((data[i] << 8) | data[i + 1]);
                    i += 2;
                }
                break;
            case LPP_EPD_VALUE_EXT_OVERLOAD_3:
                if (i + 1 <= data.length) {
                    decoded.EPD_VALUE_EXT_OVERLOAD_3 = u16_to_s16((data[i] << 8) | data[i + 1]);
                    i += 2;
                }
                break;
            default:
         
                i = data.length;
                break;
        }
    }

    
    if (tempVBAT !== null) {
        decoded.VBAT = tempVBAT;
    }
    return decoded;
}

function decodeUplink(input) {
    return {
        data: Decode(input.fPort, input.bytes)
    };
}

function encodeUINT16(value) {
    return [(value >> 8) & 0xFF, value & 0xFF];
}

function encodeDownlink(input) {
    let result = {
        errors: [],
        warnings: []
    };
    let encoded = [];

    try {
        if (input == null) {
            result.errors.push("No data to encode");
            return result;
        }

        let data = input
        if (input.data != null) {
            data = input.data;
        }

        for (let key in data) {
            switch (key) {
                case 'CMD':
                    // Commande de contrôle :
                    // 1 = Reset configuration, 2 = Sauvegarder, 3 = Redémarrer l'appareil
                    encoded.push(0xC1, 0x00);
                    encoded.push(...encodeUINT16(data.CMD));
                    break;

                case 'HEARTBEAT_INTERVAL':
                    // Intervalle de heartbeat (en minutes)
                    encoded.push(0xC1, 0x06);
                    encoded.push(...encodeUINT16(data.HEARTBEAT_INTERVAL));
                    break;

                case 'HYSTERESIS_BEHAVIOR':
                    // Mode d’hystérésis pour les mesures :
                    // 0 = aucun, 1 = fort, 2 = moyen, 3 = faible
                    encoded.push(0xC1, 0x07);
                    encoded.push(...encodeUINT16(data.HYSTERESIS_BEHAVIOR));
                    break;

                case 'MEAS_INTERVAL':
                    // Intervalle de mesure en secondes (ou minutes selon le capteur)
                    encoded.push(0xC1, 0x08);
                    encoded.push(...encodeUINT16(data.MEAS_INTERVAL));
                    break;

                case 'CNT_MEAS':
                    // Nombre de mesures prises avant un envoi LoRa
                    encoded.push(0xC1, 0x0A);
                    encoded.push(...encodeUINT16(data.CNT_MEAS));
                    break;

                case 'LATENCY_TIME_DIGITAL_INPUTS':
                    // Latence d’entrée numérique (en secondes)
                    encoded.push(0xC1, 0x0B);
                    encoded.push(...encodeUINT16(data.LATENCY_TIME_DIGITAL_INPUTS));
                    break;

                case 'DISABLE_OCCUPANCY_SENSOR':
                    // Temps de désactivation après détection de présence (en secondes)
                    encoded.push(0x84, 0x13);
                    encoded.push(...encodeUINT16(data.DISABLE_OCCUPANCY_SENSOR));
                    break;

                case 'FOLLOW_UP_TIME_OCCUPANCY_SENSOR':
                    // Durée de suivi après détection de présence (en secondes)
                    encoded.push(0x84, 0x14);
                    encoded.push(...encodeUINT16(data.FOLLOW_UP_TIME_OCCUPANCY_SENSOR));
                    break;

                case 'TLF_MODE':
                    // Mode TLF (LoRa spreading factor)
                    encoded.push(0xC1, 0x20);
                    encoded.push(...encodeUINT16(data.TLF_MODE));
                    break;

                case 'TLF_ONTIME':
                    // Durée d’émission TLF en secondes
                    encoded.push(0xC1, 0x21);
                    encoded.push(...encodeUINT16(data.TLF_ONTIME));
                    break;

                case 'TLF_INTERVAL_0':
                case 'TLF_INTERVAL_1':
                case 'TLF_INTERVAL_2':
                case 'TLF_INTERVAL_3':
                case 'TLF_INTERVAL_4':
                case 'TLF_INTERVAL_5':
                    // Intervalles de slots de transmission TLF (en secondes)
                    let tlfIndex = parseInt(key.split('_')[2]);
                    let base = 0xC123 + (tlfIndex * 2);
                    encoded.push((base >> 8) & 0xFF, base & 0xFF);
                    encoded.push(...encodeUINT16(data[key]));
                    break;

                case 'LED_MODE':
                    // Mode LED (ex : 0 = off, 1 = on on action)
                    encoded.push(0xC1, 0x34);
                    encoded.push(...encodeUINT16(data.LED_MODE));
                    break;

                case 'LED_ONTIME':
                    // Durée d’allumage de la LED (en secondes)
                    encoded.push(0xC1, 0x35);
                    encoded.push(...encodeUINT16(data.LED_ONTIME));
                    break;

                case 'LED_INTERVAL_0':
                case 'LED_INTERVAL_1':
                case 'LED_INTERVAL_2':
                case 'LED_INTERVAL_3':
                    // Intervalles de clignotement LED (ex : LED en impulsion)
                    let ledIndex = parseInt(key.split('_')[2]);
                    encoded.push(0xC1, 0x36 + ledIndex);
                    encoded.push(...encodeUINT16(data[key]));
                    break;

                case 'FORCED_UPLINK':
                    // Forcer un envoi immédiat (1 = oui, 0 = non)
                    encoded.push(0xC2, 0x30);
                    encoded.push(...encodeUINT16(data.FORCED_UPLINK ? 1 : 0));
                    break;

                case 'SCREEN_TEMP_DISPLAY':
                    // Affichage d'une température sur l'écran (0x9630) – encodée en dixièmes de °C
                    // Exemple : 22.3°C => 0x00DF ; 22°C => 0x00DC
                    encoded.push(0x96, 0x30);
                    let tempVal = Math.round(data.SCREEN_TEMP_DISPLAY * 10);
                    encoded.push((tempVal >> 8) & 0xFF, tempVal & 0xFF);
                    break;

                default:
                    result.warnings.push(`encoding for ${key} not supported`);
                    break;
            }
        }
        result.bytes = Array.from(Buffer.from(encoded));
        result.fPort = 2;
        return result;
    } catch (e){
        result.errors.push(e.message);
        delete result.bytes;
        delete result.fPort;
        return result;
    }
}


exports.decodeUplink = decodeUplink;
exports.encodeDownlink = encodeDownlink;

