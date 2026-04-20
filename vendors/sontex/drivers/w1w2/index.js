/*
  ____
 / __ \
| |  | |                      _
| |  |_|    ____    _ ___   _/ |_   ___  __   __
 \ \       / __ \  | /__ \ |_   _| / _ \ \ \ / /
  \ \     | |  | | | /  | |  | |  | | | | \ V /
   \ \    | |  | | | |  | |  | |  | |_| |  \ /
    \ \   | |  | | | |  | |  | |  |  ___|   X
  _  \ \  | |  | | | |  | |  | |  | |  _   / \
 | |  | | | |__| | | |  | |  | |  | |_| | / ^ \
 | |__| |

           Your link to innovative metering

    Copyright (c) 2024 Sontex SA


  File:     JSParserW1W2MbusFrameLoRa.js
  Version:  1.0

  Description:
    This js script parses the W2 M-Bus LoRaWAN frames to make it readable.

  Usage :
    This parser is specially done to work with The Things Stack.
*/

/**
 * If true  -> "42 kWh"
 * If false -> { value: 42, unit: "kWh" }
 */
var appendUnits = false;

/**
 * Main entry point for The Things Stack uplink decoder.
 * Assumption: payload is valid (otherwise JS will throw).
 */
function decodeUplink(input) {
    var bytes = (input && input.bytes) ? input.bytes : [];
    var language = input && input.language && (input.language === "de" || input.language === "en") ? input.language : "raw";
    var LABELS = getLabels(language);

    var decoded = {};
    var i = 0;

    /**
     * Reads n bytes from payload into dataBytes.
     * Note: no bounds check here (payload is assumed valid).
     */
    function readBytes(dataBytes, n) {
        for (var j = 0; j < n; j++) {
            dataBytes.push(bytes[i++]);
        }
    }

    for (; i < bytes.length;) {
        var identifier = bytes[i++];

        var dataBytes = [];
        var unit = "";
        var multiplier = 1;
        var toFixedDigits = 0;
        var byte1 = 0x00, byte2 = 0x00;

        switch (identifier) {
            case 0x78:
                break;
            case 0x04:
                byte1 = bytes[i++];
                readBytes(dataBytes,4);
                if (byte1 === 0x6D) {
                    decoded[LABELS.currentDateAndTime] = formatUnit(getValueCodingF(dataBytes, decoded, LABELS), unit);
                }
                break;
            case 0x0C:
                byte1 = bytes[i++]
                switch (byte1) {
                    case 0x78:
                        readBytes(dataBytes, 4);
                        decoded[LABELS.fabricationNumber] = formatUnit((getValueCodingA(dataBytes) * multiplier), unit);
                        break;
                    case 0x13:
                        readBytes(dataBytes, 4);
                        unit = getUnit(byte1);
                        multiplier = getMultiplier(byte1);
                        toFixedDigits = getNumberOfDigits(multiplier);
                        decoded[LABELS.volumeTotalizer] = formatUnit((getValueCodingA(dataBytes) * multiplier).toFixed(toFixedDigits), unit);
                        break;
                }
                break;
            case 0x02:
                byte1 = bytes[i++];
                byte2 = bytes[i++];
                if (byte1 === 0xFD && byte2 === 0x17) {
                    readBytes(dataBytes,2);
                    decoded[LABELS.detailedErrors] = getErrorFlags(dataBytes, LABELS);
                }
                break;
            case 0x42:
                byte1 = bytes[i++];
                if (byte1 === 0x6C) {
                    readBytes(dataBytes, 2);
                    decoded[LABELS.setDay] = formatUnit(getValueCodingG(dataBytes), unit);
                }
                break;
            case 0x4C:
                byte1 = bytes[i++];
                if (byte1 === 0x13) {
                    readBytes(dataBytes,4);
                    unit = getUnit(byte1);
                    multiplier = getMultiplier(byte1);
                    toFixedDigits = getNumberOfDigits(multiplier);
                    decoded[LABELS.volumeTotalizerAtSetDay] = formatUnit((getValueCodingA(dataBytes) * multiplier).toFixed(toFixedDigits), unit);
                }
                break;
            case 0x8C:
                if (bytes[i++] === 0x40 && bytes[i++] === 0x79) {
                    readBytes(dataBytes, 4);
                    decoded[LABELS.counterIn1Identification] = formatUnit((getValueCodingA(dataBytes) * multiplier), unit);
                }
                break;
            case 0x83:
                if ( bytes[i++] === 0x10 && bytes[i++] === 0xFD && bytes[i++] === 0x31) {
                    readBytes(dataBytes,3);
                    decoded[LABELS.fraudDuration] = formatUnit((getValueCodingB(dataBytes) * multiplier), unit);
                }
                break
        }
    }
    return {
        data: decoded
    };
}

/**
 * Decodes a LoRaWAN / M-Bus "Type A" value (Unsigned Integer BCD).
 *
 * Type A is NOT a binary integer.
 * It is a BCD (Binary Coded Decimal) number where:
 * - Each decimal digit (0-9) is encoded on 4 bits (one nibble)
 * - One byte contains two decimal digits:
 *  - high nibble = first digit
 *  - low nibble = second digit
 *
 * The bytes are processed from most significant to least significant,
 * and the final value is reconstructed in base 10.
 *
 * Example:
 *  - Input bytes (decimal): [96, 128, 146, 40]
 *  - Input bytes (hex):     [0x60, 0x80, 0x92, 0x28]
 *  - Binary representation:
 *      0110 0000 | 1000 0000 | 1001 0010 | 0010 1000
 *  - BDC digits extracted (MSB -> LSB):
 *      [6, 0, 8, 0, 9, 2, 2, 8]
 *  - Decimal reconstruction:
 *      6x10^7 + 0x10^6 + 8x10^5 + 0x10^4 + 9x10^3 + 2x10^2 + 2x10^1 + 8x10^0
 *  - Result: 28928060
 *
 * Notes:
 * - Values A-F (10-15) are not valid BCD digits and are clamped to 9.
 */
function getValueCodingA(bytes) {
    var binary = getBinaryString(bytes);
    var i = 7;
    var number = 0;
    for (var n = 0; n <= i; n++) {
        var currentDigit = 8 * binary.charAt(n * 4) + 4 * binary.charAt(n * 4 + 1) + 2 * binary.charAt(n * 4 + 2) + 1 * binary.charAt(n * 4 + 3);
        currentDigit = Math.min(currentDigit, 9);
        number += currentDigit * Math.pow(10, i - n);
    }
    number = Math.min(number, Math.pow(10, i + 1) - 1);
    return number;
}

/**
 * Decodes a LoRaWAN / M-Bus "Type B" value (Signed Binary Integer).
 *
 * Type B is a signed binary integer encoded as following:
 * - The most significant bit (MSB) is the sign bit:
 *      - 0 = positive value
 *      - 1 = negative value
 * - The remaining bits represent the Integer value.
 *
 * The bytes are processed as a continuous binary sequence,
 * from most significant bit to the least significant bit.
 *
 * Example:
 *      - Input bytes = [0x7F]
 *      - Binary representation:
 *          0111 1111
 *      - Sign bit: 0 -> positive
 *      - Binary value:
 *          01111111
 *      - Decimal conversion:
 *          1×2^6 + 1×2^5 + 1×2^4 + 1×2^3 + 1×2^2 + 1×2^1 + 1×2^0
 *      - Result: 127
 * Notes:
 * - The decoded value is clamped to the valid signed range:
 *      [-2^(n-1), 2^(n-1) - 1]
 *   where n is the total number of bits.
 */
function getValueCodingB(bytes) {
    var binary = getBinaryString(bytes);
    var i = binary.length - 1;
    var m = 0;
    for (var n = 1; n < binary.length; n++) {
        var currentBit = parseInt(binary.charAt(n));
        m += Math.pow(2, i - n) * currentBit;
    }
    if (binary.charAt(0) === "1") m = m - Math.pow(2, i);
    var floor = -Math.pow(2, i);
    if (m < floor) m = floor;
    var ceiling = Math.pow(2, i) - 1;
    if (m > ceiling) m = ceiling;
    return m;
}

/**
 * Decodes a LoRaWAN / M-Bus "Type F" value (Date and Time, 32 bits).
 *
 * Type F encodes date and time information in a fixed 32-bit field:
 * - Year, month, day, hour and minute are encoded on specific bit ranges
 * - Additional control bits indicate validity and daylight saving time
 *
 * This function:
 * - Converts the byte array into a 32-bit binary string
 * - Extracts the validity and DST flags
 * - Delegates date and time decoding to helper functions
 *
 * Bit's usage:
 * - bit 24 : validity flag (0 = valid, 1 = invalid)
 * - bit 16 : daylight saving time flag (1 = summer's time)
 */
function getValueCodingF(bytes, decoded, LABELS) {
    var binary = getBinaryString(bytes);

    decoded[LABELS.dateAndTimeValid] = binary.charAt(24) === "0";
    decoded[LABELS.daylightSavingTime] = binary.charAt(16) === "1";

    return calculateDate(binary) + " " + calculateTime(binary);
}

/**
 * Decodes a LoRaWAN / M-Bus "Type G" value (Date, 16 bits).
 */
function getValueCodingG(bytes) {
    var binary = getBinaryString(bytes);
    return calculateDate(binary);
}

/**
 * Converts a byte array into a binary string (MSB first).
 */
function getBinaryString(bytes) {
    var binary = "";
    for (var i = bytes.length -1; i >= 0; i--) {
        binary += convertToBinary(bytes[i]);
    }
    return binary;
}

/**
 * Converts a single byte to an 8-bit binary string.
 */
function convertToBinary(value) {
    var binary = (value & 0xff).toString(2);
    while (binary.length < 8) {
        binary = "0" + binary;
    }
    return binary;
}

/**
 * Decodes the date part of a Type F value.
 *
 * The date is encoded using individual bits distributed over the 32-bit field:
 *
 * - Year  : bits 0–3 and 8–10  (7 bits, range 0–99)
 * - Month : bits 4–7           (4 bits, range 1–12)
 * - Day   : bits 11–15         (5 bits, range 1–31)
 *
 * Values outside their valid ranges are clamped.
 * The year is returned as a two-digit value (YY).
 */
function calculateDate(binary) {

    function bit(idx) {
        return binary.charAt(idx) === "1" ? 1 : 0;
    }

    var year = bit(0) * 64 +  bit(1) * 32 + bit(2) * 16 + bit(3) * 8 + bit(8) * 4 + bit(9) * 2 + bit(10);

    // note: might should be set to 0 (instead of 99) if year is greater than 100
    year = Math.min(year, 99);
    year = (year < 10) ? ("0" + year) : ("" + year);

    var month = bit(4) * 8 + bit(5) * 4 + bit(6) * 2 + bit(7);
    month = Math.max(1, Math.min(month, 12));
    month = (month < 10) ? ("0" + month) : ("" + month);

    var day = bit(11) * 16 + bit(12) * 8 + bit(13) * 4 + bit(14) * 2 + bit(15);
    day = Math.max(1, Math.min(day, 31));
    day = (day < 10) ? ("0" + day) : ("" + day);
    return day + "." + month + "." + year;
}

/**
 * Decodes the time part of a Type F value.
 *
 * The time is encoded as:
 * - Hour   : bits 19–23 (5 bits, range 0–23)
 * - Minute : bits 26–31 (6 bits, range 0–59)
 *
 * Reserved bits (17, 18, 25) are ignored as specified by the standard.
 * Values exceeding their allowed range are clamped.
 */
function calculateTime(binary) {
    function bit(idx) {
        return binary.charAt(idx) === "1" ? 1 : 0;
    }

    var hour = bit(19) * 16 + bit(20) * 8 + bit(21) * 4 + bit(22) * 2 + bit(23);
    hour = Math.min(hour, 23);
    hour = (hour < 10) ? ("0" + hour) : ("" + hour);

    var minute = bit(26) * 32 + bit(27) * 16 + bit(28) * 8 + bit(29) * 4 + bit(30) * 2 + bit(31);
    minute = Math.min(minute, 59);
    minute = (minute < 10) ? ("0" + minute) : ("" + minute);

    return hour + ":" + minute;
}

/* ------------------------ Units ------------------------ */

function getUnit(key) {
    switch (key) {
        case 0x05: // 0.1 kWh
        case 0x06: // 1 kWh
            return " kWh";
        case 0x07: // 0.01 MWh
            return " MWh";
        case 0x0E: // 1 MJ
            return " MJ";
        case 0x0F: // 0.01 GJ
            return " GJ";
        case 0x13: // 0.001 m³
        case 0x14: // 0.01 m³
        case 0x15: // 0.1 m³
        case 0x16: // 1 m³
            return " m³";
        case 0xFD: // 1 without unit
            return "";
    }
}

function getMultiplier(key) {
    switch (key) {
        case 0x05: // 0.1 kWh
        case 0x15: // 0.1 m³
            return 0.1;
        case 0x06: // 1 kWh
        case 0x0E: // 1 MJ
        case 0x16: // 1 m³
        case 0xFD: // 1 without unit
            return 1;
        case 0x07: // 0.01 MWh
        case 0x0F: // 0.01 GJ
        case 0x14: // 0.01 m³
            return 0.01;
        case 0x13: // 0.001 m³ or
            return 0.001;
    }
}

function getNumberOfDigits(multiplier) {
    switch (multiplier) {
        case 1:
            return 0;
        case 0.1:
            return 1;
        case 0.01:
            return 2;
        case 0.001:
            return 3;
    }
}

/**
 * Append unit or create object containing value and unit.
 */
function formatUnit(v, u) {
    if (appendUnits) {
        if (u) {
            return v + "" + u;
        } else {
            return v;
        }
    } else {
        return {
            value: v,
            unit: String(u || "").trim()
        };
    }
}

/* ------------------------ Errors flags ------------------------ */

function getErrorFlags(bytes, LABELS) {
    // getBinaryString returns string as it would be printed out, bit0 is at the
    // last position. The string is therefore first reversed so that character positions
    // match directly the bit positions in the documentation.
    var binary = getBinaryString(bytes).split("").reverse().join("");
    var flags = [];
    // bit15 not used
    if (binary.charAt(14) === "1") flags.push(LABELS.error_flag_last_60_days);
    if (binary.charAt(13) === "1") flags.push(LABELS.device_end_of_legal_life);
    if (binary.charAt(12) === "1") flags.push(LABELS.zero_flow);
    if (binary.charAt(11) === "1") flags.push(LABELS.backward_flow);
    if (binary.charAt(10) === "1") flags.push(LABELS.qmax);
    if (binary.charAt(9) === "1") flags.push(LABELS.leakage);
    if (binary.charAt(8) === "1") flags.push(LABELS.pipe_break);
    if (binary.charAt(7) === "1") flags.push(LABELS.fraud_manipulation);
    if (binary.charAt(6) === "1") flags.push(LABELS.application_error_bad_password);
    if (binary.charAt(5) === "1") flags.push(LABELS.application_error_record_value);
    if (binary.charAt(4) === "1") flags.push(LABELS.application_error_record_size);
    if (binary.charAt(3) === "1") flags.push(LABELS.application_error_access_right);
    if (binary.charAt(2) === "1") flags.push(LABELS.application_error_unknown_record);
    if (binary.charAt(1) === "1") flags.push(LABELS.application_error_unknown_field_ci);
    if (binary.charAt(0) === "1") flags.push(LABELS.application_error_unknown_field_c);
    if (flags.length === 0) {
        flags.push(LABELS.no_error_flags);
    }
    return flags;
}

/* ----------------------- i18n labels ----------------------- */

/**
 * Language values:
 * en  :    return the results in english
 * de  :    return the results in german
 * raw :   return the results in english, all lowercase without special characters,
 * only a-z and _ optimized for further processing with "tago.io".
 */
function getLabels(language) {
    var de = {
        fraud_manipulation: "Manipulation",
        pipe_break: "Rohrbruch",
        leakage: "Leck",
        qmax: "Maximaler Volumenstrom",
        backward_flow: "Rückfluss",
        zero_flow: "Kein Druchfluss",
        device_end_of_legal_life: "Zulässige Lebensdauer überschritten",
        error_flag_last_60_days: "Fehler in den letzten 60 Tagen",
        application_error_unknown_field_c: "application_error_unknown_field_c",
        application_error_unknown_field_ci: "application_error_unknown_field_ci",
        application_error_unknown_record: "application_error_unknown_record",
        application_error_access_right: "Keine Zugriffsrechte vorhanden",
        application_error_record_size: "application_error_record_size",
        application_error_record_value: "application_error_record_value",
        application_error_bad_password: "Falsches Passwort",
        no_error_flags: "Keine Fehler vorhanden",

        volumeTotalizer: "Volumen",
        fabricationNumber: "Fabrikationsnummer",
        currentDateAndTime: "Datum und Zeit",
        daylightSavingTime: "Sommerzeit",
        dateAndTimeValid: "Datum und Zeit valide",
        detailedErrors: "Fehlermeldungen",
        setDay: "Stichtag",
        volumeTotalizerAtSetDay: "Volumen zum Stichtag",
        counterIn1Identification: "counterIn1Identification",
        fraudDuration: "Dauer des Betrugs"
    };

    var en = {
        fraud_manipulation: "Fraud / Manipulation",
        pipe_break: "Pipe break",
        leakage: "Leakage",
        qmax: "Max. flow",
        backward_flow: "Backward flow",
        zero_flow: "Zero flow",
        device_end_of_legal_life: "End of life",
        error_flag_last_60_days: "Error in the last 60 days",
        application_error_unknown_field_c: "application_error_unknown_field_c",
        application_error_unknown_field_ci: "application_error_unknown_field_ci",
        application_error_unknown_record: "application_error_unknown_record",
        application_error_access_right: "No access rights available",
        application_error_record_size: "application_error_record_size",
        application_error_record_value: "application_error_record_value",
        application_error_bad_password: "Bad password",
        no_error_flags: "No errors present",

        volumeTotalizer: "Volume",
        fabricationNumber: "Fabrication number",
        currentDateAndTime: "Date and time",
        daylightSavingTime: "Daylight saving time",
        dateAndTimeValid: "Valid Date and time",
        detailedErrors: "Detailed errors",
        setDay: "Target day",
        volumeTotalizerAtSetDay: "Volume totalizer at target day",
        counterIn1Identification: "counterIn1Identification",
        fraudDuration: "Fraud duration"
    };

    var raw = {
        fraud_manipulation: "fraud_manipulation",
        pipe_break: "pipe_break",
        leakage: "leakage",
        qmax: "qmax",
        backward_flow: "backward_flow",
        zero_flow: "zero_flow",
        device_end_of_legal_life: "device_end_of_legal_life",
        error_flag_last_60_days: "error_flag_last_60_days",
        application_error_unknown_field_c: "application_error_unknown_field_c",
        application_error_unknown_field_ci: "application_error_unknown_field_ci",
        application_error_unknown_record: "application_error_unknown_record",
        application_error_access_right: "application_error_access_right",
        application_error_record_size: "application_error_record_size",
        application_error_record_value: "application_error_record_value",
        application_error_bad_password: "application_error_bad_password",
        no_error_flags: "no_error_flags",

        volumeTotalizer: "volume_totalizer",
        fabricationNumber: "fabrication_number",
        currentDateAndTime: "current_date_and_time",
        daylightSavingTime: "daylight_saving_time",
        dateAndTimeValid: "date_and_time_valid",
        detailedErrors: "detailed_errors",
        setDay: "set_day",
        volumeTotalizerAtSetDay: "volume_totalizer_at_set_day",
        counterIn1Identification: "counterIn1Identification",
        fraudDuration: "fraud_duration"
    };

    return language === "de" ? de : language === "en" ? en : raw;
}

if (typeof exports !== 'undefined') { exports.decodeUplink = decodeUplink; }
