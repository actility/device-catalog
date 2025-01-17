//Contact steven.jam@thermokon.fr


// Fonction principale de décodage
function Decode(fPort, bytes) {
    if (!Array.isArray(bytes) || bytes.length === 0) {
        return {
            error_message: "Entrée invalide : 'bytes' non défini ou vide"
        };
    }

    // Identifier le type de paquet
    var packetType = getPacketType(fPort);

    switch (packetType) {
        case "ping":
            return {
                type: "ping",
                raw_data: toHexString(bytes)
            };
        case "periodicReport":
        case "alarmReport":
            return decodePeriodicOrAlarmReport(packetType, bytes);
        case "downlinkCommand":
            return decodeDownlinkCommand(bytes);
        default:
            return {
                data: {
                    type: "Unknown"
                },
                errors: ["Type de paquet non pris en charge"]
            };
    }
}

// Décodage des rapports périodiques ou alarmes
function decodePeriodicOrAlarmReport(packetType, bytes) {
    if (bytes.length < 28) {
        return {
            error_message: "Payload trop court pour un rapport périodique ou une alarme"
        };
    }

    var errorCode = (bytes[4] | (bytes[5] << 8));
    var totalVolume = decodeTotalVolume(bytes);
    var batteryLevel = decodeBatteryLevel(bytes[23], bytes[24]);
    var waterTempMin = decodeTemperature_C(bytes[25]);
    var waterTempMax = decodeTemperature_C(bytes[26]);
    var ambientTemp = decodeTemperature_C(bytes[27]);
    var leakState = getLeakState(bytes[22]);

    return {
        type: packetType,
        ambient_temp: ambientTemp,
        total_volume: totalVolume,
        water_temp_max: waterTempMax,
        water_temp_min: waterTempMin,
        battery_level: batteryLevel,
        error_code: errorCode !== 0 ? errorCode : null,
        details: {
            leak_status_numeric: leakState.numeric,
            leak_status_text: leakState.text,
            error_description: errorMessages[errorCode] ? errorMessages[errorCode].description : null,
            error_tips: errorMessages[errorCode] ? errorMessages[errorCode].tips : null
        }
    };
}

// Décodage des commandes downlink
function decodeDownlinkCommand(bytes) {
    if (bytes.length < 1) {
        return {
            error_message: "Payload downlink vide ou incorrect"
        };
    }

    var commandCode = bytes[0];
    var commandValue = bytes.slice(1);

    return {
        type: "downlinkCommand",
        command: commandCode,
        value: toHexString(commandValue),
        interpreted: interpretDownlink(commandCode, commandValue)
    };
}

// Décodage des niveaux de batterie
function decodeBatteryLevel(input1, input2) {
    var level = 1800 + (input2 << 3);
    return Math.round(level / 100) / 10; // Conversion en volts
}

// Décodage de la température
function decodeTemperature_C(input) {
    return Math.round(((input * 0.5) - 20) * 10) / 10; // °C avec 1 décimale
}

// Décodage du volume total
function decodeTotalVolume(bytes) {
    return (bytes[6] & 0xFF) |
           ((bytes[7] & 0xFF) << 8) |
           ((bytes[8] & 0xFF) << 16) |
           ((bytes[9] & 0xFF) << 24);
}

// État des fuites avec description et numérique
function getLeakState(input) {
    if (input <= 2) return { numeric: 0, text: "NoLeak" };
    if (input === 3) return { numeric: 1, text: "Medium" };
    if (input === 4) return { numeric: 2, text: "Large" };
    return { numeric: -1, text: "N/A" };
}

// Conversion en chaîne hexadécimale
function toHexString(byteArray) {
    return byteArray.map(function(byte) {
        return ("0" + (byte & 0xFF).toString(16)).slice(-2).toUpperCase();
    }).join(" ");
}

// Interprétation des commandes downlink
function interpretDownlink(commandCode, commandValue) {
    switch (commandCode) {
        case 0x04:
            return "Réinitialisation de l'appareil";
        case 0x16:
            return "Modification de l'intervalle de mesure";
        default:
            return "Commande inconnue";
    }
}

// Détection du type de paquet
function getPacketType(fPort) {
    switch (fPort) {
        case 0:
            return "ping";
        case 1:
            return "periodicReport";
        case 2:
            return "alarmReport";
        case 102:
            return "downlinkCommand";
        default:
            return "Unknown";
    }
}

// Table des messages d'erreur
var errorMessages = {
    0: { name: "OK", description: "Aucune erreur", tips: "-" },
    1: { name: "USS_MESSAGE_CODE_X", description: "Échec de l'échantillonnage par le module ultrasonique", tips: "Contactez le support." },
    384: { name: "NEGATIVE_FLOW", description: "Flux inversé détecté", tips: "Vérifiez la direction de l'appareil sur le tuyau." },
    385: { name: "POS_OVERFLOW", description: "Débit positif excessif", tips: "Vérifiez le débit ou la présence d'air dans le tuyau." },
    386: { name: "NEG_OVERFLOW", description: "Débit négatif excessif", tips: "Vérifiez le débit ou la présence d'air dans le tuyau." },
    387: { name: "ATOF_LIMIT", description: "Présence d'air ou de particules dans l'eau", tips: "Vérifiez la présence de bulles d'air dans le système d'eau." },
    388: { name: "TEMP_LIMIT", description: "Erreur fatale liée à la température", tips: "Contactez le support." },
    389: { name: "TEMP_ALG_LIMIT", description: "Température de l'eau hors limites", tips: "Vérifiez la température de l'eau." },
    390: { name: "RF_DUTY_CYCLE_LIMIT", description: "Erreur fatale liée au cycle d'utilisation radio", tips: "Contactez le support." },
    391: { name: "LOW_BATTERY", description: "Batterie faible", tips: "Contactez un distributeur agréé pour le remplacement de la batterie ou de l'unité." },
    392: { name: "PARAMS_CRC_MISMATCH", description: "Paramètres corrompus ou altérés", tips: "Remplacez le compteur altéré." },
    393: { name: "AMBIENT_TEMP_LIMIT", description: "Température ambiante hors limites", tips: "Contactez le support si la température ambiante est dans la plage valide." },
    400: { name: "MAX_BATTERY_VOLTAGE_LIMIT", description: "Erreur fatale", tips: "Contactez le support." },
    401: { name: "UART_FAILED", description: "Erreur fatale", tips: "Contactez le support." },
    402: { name: "VOLUME_REGISTER_CORRUPT", description: "Erreur fatale", tips: "Contactez le support." },
    403: { name: "RF_TX_FAILED", description: "Erreur fatale", tips: "Contactez le support." },
    404: { name: "FIRMWARE_CRC_MISMATCH", description: "Firmware du compteur corrompu ou altéré", tips: "Remplacez le compteur." },
    405: { name: "RF_INIT_FAILED", description: "Le module radio n'a pas pu démarrer", tips: "Remplacez le compteur." },
    406: { name: "RF_RX_FAILED", description: "Erreur fatale", tips: "Contactez le support." },
    419: { name: "NO_SIGNAL", description: "Installation défectueuse, mauvais réglage de tuyau ou défaut de l'appareil", tips: "Vérifiez l'installation du dispositif, les paramètres de tuyau et assurez-vous que l'eau est exempte de bulles ou de saleté." },
    421: { name: "CONVOLUTION_OVERRUN", description: "Installation défectueuse, mauvais réglage de tuyau ou défaut de l'appareil", tips: "Vérifiez l'installation du dispositif, les paramètres de tuyau et assurez-vous que l'eau est exempte de bulles ou de saleté." },
    450: { name: "NO_WATER", description: "Aucune eau détectée dans le tuyau", tips: "Assurez-vous de remplir le tuyau avec uniquement de l'eau propre." },
    451: { name: "SIGNAL_OVERRUN", description: "Débit trop élevé ou mauvais réglage de tuyau", tips: "Vérifiez l'installation du dispositif, les paramètres de tuyau et assurez-vous que l'eau est exempte de bulles ou de saleté." },
    452: { name: "SIGNAL_TOO_HIGH", description: "Installation défectueuse, mauvais réglage de tuyau ou défaut de l'appareil", tips: "Vérifiez l'installation du dispositif, les paramètres de tuyau et assurez-vous que l'eau est exempte de bulles ou de saleté." },
    453: { name: "PIPE_INDEX_OUT_OF_BOUNDS", description: "Tentative de sélection d'un réglage de tuyau hors limites", tips: "Essayez de sélectionner un autre réglage de tuyau." },
    454: { name: "LEAK_TESTER_NOT_FOUND", description: "Erreur de l'algorithme de détection de fuite", tips: "Contactez le support." },
    455: { name: "LEAK_TESTER_COUNT_OVERFLOW", description: "Dépassement de capacité de l'algorithme de détection de fuite", tips: "Contactez le support." },
    770: { name: "BOR", description: "Erreur système MCU (BOR)", tips: "Contactez le support." },
    772: { name: "RSTNMI", description: "Erreur système MCU (RSTNMI)", tips: "Contactez le support." },
    774: { name: "PMMSWBOR", description: "Erreur système MCU (PMMSWBOR)", tips: "Contactez le support." },
    776: { name: "LPM5WU", description: "Erreur système MCU (LPM5WU)", tips: "Contactez le support." },
    778: { name: "SECYV", description: "Erreur système MCU (SECYV)", tips: "Contactez le support." },
    780: { name: "Reserved", description: "Erreur réservée", tips: "Contactez le support." },
    782: { name: "SVSHIFG", description: "Erreur système MCU (SVSHIFG)", tips: "Contactez le support." },
    788: { name: "PMMSWPOR", description: "Erreur système MCU (PMMSWPOR)", tips: "Contactez le support." },
    790: { name: "WDTIFG", description: "Erreur système MCU (WDTIFG)", tips: "Contactez le support." },
    794: { name: "FRCTLPW", description: "Erreur système MCU (FRCTLPW)", tips: "Contactez le support." },
    796: { name: "UBDIFG", description: "Erreur système MCU (UBDIFG)", tips: "Contactez le support." },
    798: { name: "PERF", description: "Erreur système MCU (PERF)", tips: "Contactez le support." },
    800: { name: "PMMPW", description: "Erreur système MCU (PMMPW)", tips: "Contactez le support." },
    802: { name: "MPUPW", description: "Erreur système MCU (MPUPW)", tips: "Contactez le support." },
    804: { name: "CSPW", description: "Erreur système MCU (CSPW)", tips: "Contactez le support." },
    806: { name: "MPUSEGPIFG", description: "Erreur système MCU (MPUSEGPIFG)", tips: "Contactez le support." },
    808: { name: "Reserved", description: "Erreur réservée", tips: "Contactez le support." },
    810: { name: "MPUSEG1IFG", description: "Erreur système MCU (MPUSEG1IFG)", tips: "Contactez le support." },
    812: { name: "MPUSEG2IFG", description: "Erreur système MCU (MPUSEG2IFG)", tips: "Contactez le support." },
    814: { name: "MPUSEG3IFG", description: "Erreur système MCU (MPUSEG3IFG)", tips: "Contactez le support." },
    900: { name: "ERROR_MSG_MSP_STATUS_ERROR", description: "Erreur de code MCU", tips: "Contactez le support." },
    910: { name: "ERROR_MSG_MSP_STATUS_ERROR", description: "Erreur de code MCU", tips: "Contactez le support." },
    32768: { name: "NO_SIGNAL", description: "Installation défectueuse, mauvais réglage de tuyau ou défaut de l'appareil", tips: "Vérifiez l'installation du dispositif, les paramètres de tuyau et assurez-vous que l'eau est exempte de bulles ou de saleté." }
};

// DOWNLINK COMMANDS (HEX):
// Intervalle de mesure (FPort=19):
// - 10 min: 58020000
// - 20 min: B0040000
// - 30 min: E8030000
// - 1h: 100E0000
// - 2h: 201C0000
// - 5h: 88130000
// - 12h: 48360000
// - 24h: 90680100

// Commandes spéciales:
// Réinitialisation LoRaWAN: FPort=102, Payload=00 (réinitialise la session et force un nouveau join)
// Effacement des volumes: FPort=101, Payload=00 (efface les données totales affichées)
// Mode tuyau initial: FPort=2, Payload=04 (retourne à la configuration initiale du tuyau)
// Activation immédiate: FPort=2, Payload=05 (active immédiatement le mode mesure)
// Modifier le type de tuyau: FPort=4,
// - Tuyau cuivre 15 mm: Payload=01
// - Tuyau cuivre 18 mm: Payload=02
// - Tuyau cuivre 22 mm: Payload=03
// - Tuyau cuivre chromé 15 mm: Payload=04
// - Tuyau cuivre chromé 18 mm: Payload=05
// - Tuyau PAL 16 mm: Payload=07
// - Tuyau PAL 20 mm: Payload=08
// - Tuyau PAL 25 mm: Payload=09
// - Tuyau PEX ou PE-RT 16 mm: Payload=0E
// - Tuyau PEX ou PE-RT 20 mm: Payload=0F
// - Tuyau PEX ou PE-RT 25 mm: Payload=10
// - Tuyau Distance Pipe 110 mm: Payload=11
// - Réinitialisation au tuyau par défaut: Payload=FA


function decodeUplink(input) {
    return { data: Decode(input.fPort, input.bytes), errors: [], warnings: [] };
}