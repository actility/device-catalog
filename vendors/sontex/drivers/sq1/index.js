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


  File:     JSParserSQ1MbusFrameLoRa.js
  Version:  1.3

  Description:
    This js script parses the SQ1 M-Bus LoRaWAN frames to make it readable.

  Usage :
    This parser is specially done to work with The Things Stack.

  Usage example :
  input = {
  "bytes": [
   4,6,0,0,0,0,4,20,0,0,0,0,12,120,64,102,136,38,4,109,22,14,173,44,2,255,44,0,0,132,16,6,0,0,0,0,130,10,108,
   225,241,132,10,6,0,0,0,0,132,10,20,0,0,0,0,2,89,32,10,2,93,42,10,2,59,0,0,3,44,0,0,127,132,26,6,255,0,0,0
  ],"fPort": 2};

  console.log(decodeUplink(input));
  */

// Initialize global variable names
var fraud_manipulation;
var pipe_break;
var leakage;
var qmax;
var backward_flow;
var zero_flow;
var device_end_of_legal_life;
var error_flag_last_60_days;
var application_error_unknown_field_c;
var application_error_unknown_field_ci;
var application_error_unknown_record;
var application_error_access_right;
var application_error_record_size;
var application_error_record_value;
var application_error_bad_password;
var no_error_flags;

var volumeTotalizer;
var fabricationNumber;
var currentDateAndTime;
var daylightSavingTime;
var dateAndTimeValid;
var detailedErrors;
var setDay;
var volumeTotalizerAtSetDay;
var commissioningDay;
var internalVersion;
var volumeAtHourMinus1;
var volumeAtHourMinus2;
var volumeAtHourMinus3;
var volumeAtHourMinus4;

var decoded = {};
// Supported languages: raw, en, de
var language = "raw";

// Defines if units are appended directly to the value:
// 42 kWh
// or stored in an object:
// { value: 42, unit: kWh }
var appendUnits = false;

function decodeUplink(input) {
    // set the language of the output result default is english if no language is not set
    setLanguage(language);
    var bytes = input.bytes
    for (var i = 0; i < bytes.length;) {
        var identifier = bytes[i++];
        var dataBytes = [];
        var unit = "";
        var multiplier = 1;
        var toFixedDigits = 0;
        var byte = 0x00;
        switch (identifier) {
            case 0x78:
                // console.debug("Detected headless MBus frame");
                break;
            case 0x04:
                byte = bytes[i++];
                dataBytes.push(bytes[i++]);
                dataBytes.push(bytes[i++]);
                dataBytes.push(bytes[i++]);
                dataBytes.push(bytes[i++]);
                if (byte === 0x6D) {
                    decoded[currentDateAndTime] = formatUnit(getValueCodingF(dataBytes), unit);
                }
                break;
            case 0x0C:
                var key = bytes[i++];
                switch (key) {
                    case 0x78:
                        dataBytes.push(bytes[i++]);
                        dataBytes.push(bytes[i++]);
                        dataBytes.push(bytes[i++]);
                        dataBytes.push(bytes[i++]);
                        decoded[fabricationNumber] = formatUnit((getValueCodingA(dataBytes) * multiplier), unit);
                        break;
                    case 0x13:
                        dataBytes.push(bytes[i++]);
                        dataBytes.push(bytes[i++]);
                        dataBytes.push(bytes[i++]);
                        dataBytes.push(bytes[i++]);
                        unit = getUnit(key);
                        multiplier = getMultiplier(key);
                        toFixedDigits = getNumberOfDigits(multiplier);
                        decoded[volumeTotalizer] = formatUnit((getValueCodingA(dataBytes) * multiplier).toFixed(toFixedDigits), unit);
                        break;
                }
                break;
            case 0x02:
                byte = bytes[i++];
                var byte2 = bytes[i++];
                if (byte === 0xFD && byte2 === 0x17) {
                    dataBytes.push(bytes[i++]);
                    dataBytes.push(bytes[i++]);
                    decoded[detailedErrors] = getErrorFlags(dataBytes);
                }
                break;
            case 0x82:
                byte = bytes[i++];
                var byte2 = bytes[i++];
                if (byte === 0x20 && byte2 === 0x6C) {
                    dataBytes.push(bytes[i++]);
                    dataBytes.push(bytes[i++]);
                    decoded[commissioningDay] = formatUnit(getValueCodingG(dataBytes), unit);
                }
                break;
            case 0x42:
                byte = bytes[i++];
                if (byte === 0x6C) {
                    dataBytes.push(bytes[i++]);
                    dataBytes.push(bytes[i++]);
                    decoded[setDay] = formatUnit(getValueCodingG(dataBytes), unit);
                }
                break;
            case 0x4C:
                key = bytes[i++];
                if (key === 0x13) {
                    dataBytes.push(bytes[i++]);
                    dataBytes.push(bytes[i++]);
                    dataBytes.push(bytes[i++]);
                    dataBytes.push(bytes[i++]);
                    unit = getUnit(key);
                    multiplier = getMultiplier(key);
                    toFixedDigits = getNumberOfDigits(multiplier);
                    decoded[volumeTotalizerAtSetDay] = formatUnit((getValueCodingA(dataBytes) * multiplier).toFixed(toFixedDigits), unit);
                }
                break;
            case 0xCC:
                byte = bytes[i++];
                key = bytes[i++];
                if (key === 0x13) {
                    dataBytes.push(bytes[i++]);
                    dataBytes.push(bytes[i++]);
                    dataBytes.push(bytes[i++]);
                    dataBytes.push(bytes[i++]);
                    unit = getUnit(key);
                    multiplier = getMultiplier(key);
                    toFixedDigits = getNumberOfDigits(multiplier);
                    switch (byte) {
                        case 0x0C:
                            decoded[volumeAtHourMinus1] = formatUnit((getValueCodingA(dataBytes) * multiplier).toFixed(toFixedDigits), unit);
                            break;
                        case 0x0D:
                            decoded[volumeAtHourMinus3] = formatUnit((getValueCodingA(dataBytes) * multiplier).toFixed(toFixedDigits), unit);
                            break;
                    }
                }
                break;
            case 0x8C:
                byte = bytes[i++];
                key = bytes[i++];
                if (key === 0x13) {
                    dataBytes.push(bytes[i++]);
                    dataBytes.push(bytes[i++]);
                    dataBytes.push(bytes[i++]);
                    dataBytes.push(bytes[i++]);
                    unit = getUnit(key);
                    multiplier = getMultiplier(key);
                    toFixedDigits = getNumberOfDigits(multiplier);
                    switch (byte) {
                        case 0x0D:
                            decoded[volumeAtHourMinus2] = formatUnit((getValueCodingA(dataBytes) * multiplier).toFixed(toFixedDigits), unit);
                            break;
                        case 0x0E:
                            decoded[volumeAtHourMinus4] = formatUnit((getValueCodingA(dataBytes) * multiplier).toFixed(toFixedDigits), unit);
                            break;
                    }
                }
                break;
            case 0x0B:
                byte = bytes[i++];
                var byte2 = bytes[i++];
                if (byte === 0xFD && byte2 === 0x0F) {
                    dataBytes.push(bytes[i++]);
                    dataBytes.push(bytes[i++]);
                    dataBytes.push(bytes[i++]);
                    decoded[internalVersion] = formatUnit((getValueCodingA(dataBytes) * multiplier), unit);
                }
                break;
        }
    }
    return {
        data: decoded
    };
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

function getValueCodingA(bytes) {
    // Convert the input bytes to a binary string (expected order: MSB -> LSB)
    var binary = getBinaryString(bytes);

    // Each byte contains 2 BCD digits (one per nibble)
    var digits = bytes.length * 2;
    var maxIndex = digits - 1;

    var number = 0;
    var negative = false;

    // Iterate over each BCD digit (each digit is a 4-bit nibble)
    for (var n = 0; n < digits; n++) {
        var base = n * 4;

        // Read 4 bits and convert them to a nibble value in range 0..15
        // (binary.charAt(...) returns '0'/'1', or '' if out of range, hence the "|| 0" fallback)
        var nibble =
            8 * Number(binary.charAt(base)     || 0) +
            4 * Number(binary.charAt(base + 1) || 0) +
            2 * Number(binary.charAt(base + 2) || 0) +
            1 * Number(binary.charAt(base + 3) || 0);

        // EN 13757-3 Annex B: if the most significant digit (MSD) is 0xF,
        // it indicates a minus sign. This nibble is NOT part of the value.
        if (n === 0 && nibble === 0xF) {
            negative = true;
            continue;
        }

        // In BCD, only values 0..9 are valid digits.
        // Values A..F (10..15) are invalid, including 0xF if it appears anywhere except the MSD.
        if (nibble > 9) {
            return NaN; // or: throw new Error("Invalid BCD digit");
        }

        // Add this digit to the final number (positional decimal weight)
        number += nibble * Math.pow(10, maxIndex - n);
    }

    return negative ? -number : number;
}

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

function getValueCodingF(bytes) {
    var binary = getBinaryString(bytes);
    calculateDate(binary);
    var dateString = calculateDate(binary);
    var hour = parseInt(binary.charAt(19)) * 16 + parseInt(binary.charAt(20)) * 8
        + parseInt(binary.charAt(21)) * 4 + parseInt(binary.charAt(22)) * 2 + parseInt(binary.charAt(23));
    hour = Math.min(hour, 23);
    if (hour < 10) {
        hour = "0" + hour;
    }
    var minute = parseInt(binary.charAt(26)) * 32 + parseInt(binary.charAt(27)) * 16
        + parseInt(binary.charAt(28)) * 8 + parseInt(binary.charAt(29)) * 4
        + parseInt(binary.charAt(30)) * 2 + parseInt(binary.charAt(31));
    minute = Math.min(minute, 59);
    if (minute < 10) {
        minute = "0" + minute;
    }
    var timeString = hour + ":" + minute;
    decoded[dateAndTimeValid] = binary.charAt(24) === "0";
    decoded[daylightSavingTime] = binary.charAt(16) === "1";
    return dateString + " " + timeString;
}

function getValueCodingG(bytes) {
    var binary = getBinaryString(bytes);
    return calculateDate(binary);
}

function calculateDate(binary) {
    var year = parseInt(binary.charAt(0)) * 64 + parseInt(binary.charAt(1)) * 32
        + parseInt(binary.charAt(2)) * 16 + parseInt(binary.charAt(3)) * 8
        + parseInt(binary.charAt(8)) * 4 + parseInt(binary.charAt(9)) * 2 + parseInt(binary.charAt(10));
    // note: might should be set to 0 (instead of 99) if year is greater than 100
    year = Math.min(year, 99);
    if (year < 10) {
        year = "0" + year;
    }
    var month = parseInt(binary.charAt(4)) * 8 + parseInt(binary.charAt(5)) * 4
        + parseInt(binary.charAt(6)) * 2 + parseInt(binary.charAt(7));
    month = Math.min(month, 12);
    month = Math.max(month, 1);
    if (month < 10) {
        month = "0" + month;
    }
    var day = parseInt(binary.charAt(11)) * 16 + parseInt(binary.charAt(12)) * 8
        + parseInt(binary.charAt(13)) * 4 + parseInt(binary.charAt(14)) * 2 + parseInt(binary.charAt(15));
    day = Math.min(day, 31);
    day = Math.max(day, 1);
    if (day < 10) {
        day = "0" + day;
    }
    return day + "." + month + "." + year;
}

function getErrorFlags(bytes) {
    // getBinaryString returns string as it would be printed out, bit0 is at the
    // last position. The string is therefore first reversed so that character positions
    // match directly the bit positions in the documentation.
    var binary = getBinaryString(bytes).split("").reverse().join("");
    var flags = [];
    // bit15 not used
    if (binary.charAt(14) === "1") flags.push(error_flag_last_60_days);
    if (binary.charAt(13) === "1") flags.push(device_end_of_legal_life);
    if (binary.charAt(12) === "1") flags.push(zero_flow);
    if (binary.charAt(11) === "1") flags.push(backward_flow);
    if (binary.charAt(10) === "1") flags.push(qmax);
    if (binary.charAt(9) === "1") flags.push(leakage);
    if (binary.charAt(8) === "1") flags.push(pipe_break);
    if (binary.charAt(7) === "1") flags.push(fraud_manipulation);
    if (binary.charAt(6) === "1") flags.push(application_error_bad_password);
    if (binary.charAt(5) === "1") flags.push(application_error_record_value);
    if (binary.charAt(4) === "1") flags.push(application_error_record_size);
    if (binary.charAt(3) === "1") flags.push(application_error_access_right);
    if (binary.charAt(2) === "1") flags.push(application_error_unknown_record);
    if (binary.charAt(1) === "1") flags.push(application_error_unknown_field_ci);
    if (binary.charAt(0) === "1") flags.push(application_error_unknown_field_c);
    if (flags === []) {
        flags.push(no_error_flags);
    }
    return flags;
}

function convertToBinary(value) {
    var binary = value.toString(2);
    if (binary.length < 8) {
        var missingBits = 8 - binary.length;
        for (var i = 0; i < missingBits; i++) {
            binary = "0" + binary;
        }
    }
    return binary;
}

function getBinaryString(bytes) {
    var binary = "";
    for (var i = 0; i < bytes.length; i++) {
        binary += convertToBinary(bytes[i]);
    }
    if (binary.length < 9) {
        return binary;
    } else if (binary.length < 17) {
        var first = binary.substring(binary.length / 2, binary.length);
        var second = binary.substring(0, binary.length / 2);
        binary = first + second;
    } else if (binary.length < 25) {
        var first = binary.substring(0, binary.length / 3);
        var second = binary.substring(binary.length / 3, binary.length);

        var first1 = second.substring(second.length / 2, second.length);
        var second1 = second.substring(0, second.length / 2);

        binary = first1 + second1 + first;
    } else if (binary.length === 32) {
        var first = binary.substring(binary.length / 2, binary.length);
        var second = binary.substring(0, binary.length / 2);

        var first1 = first.substring(first.length / 2, first.length);
        var second1 = first.substring(0, first.length / 2);

        var first2 = second.substring(second.length / 2, second.length);
        var second2 = second.substring(0, second.length / 2);
        binary = first1 + second1 + first2 + second2;
    }
    return binary;
}

// Append unit or create object containing value and unit
// depending if appendUnits is true/false
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
            unit: u.trim()
        };
    }
}

/*
Set the language of the output result function.
language values :
en  :    return the results in english
de  :    return the results in german
raw :   return the results in english, all lowercase without special characters, only a-z and _
        optimized for further processing with tago.io
*/
function setLanguage(language) {
    if (language === "de") {
        fraud_manipulation = "Manipulation";
        pipe_break = "Rohrbruch";
        leakage = "Leck";
        qmax = "Maximaler Volumenstrom";
        backward_flow = "Rückfluss";
        zero_flow = "Kein Druchfluss";
        device_end_of_legal_life = "Zulässige Lebensdauer überschritten";
        error_flag_last_60_days = "Fehler in den letzten 60 Tagen";
        application_error_unknown_field_c = "application_error_unknown_field_c";
        application_error_unknown_field_ci = "application_error_unknown_field_ci";
        application_error_unknown_record = "application_error_unknown_record";
        application_error_access_right = "Keine Zugriffsrechte vorhanden";
        application_error_record_size = "application_error_record_size";
        application_error_record_value = "application_error_record_value";
        application_error_bad_password = "Falsches Passwort";
        no_error_flags = "Keine Fehler vorhanden";

        volumeTotalizer = "Volumen";
        fabricationNumber = "Fabrikationsnummer";
        currentDateAndTime = "Datum und Zeit";
        daylightSavingTime = "Sommerzeit";
        dateAndTimeValid = "Datum und Zeit valide";
        detailedErrors = "Fehlermeldungen";
        setDay = "Stichtag";
        volumeTotalizerAtSetDay = "Volumen zum Stichtag";
        commissioningDay = "Installationsdatum";
        internalVersion = "Version";
        volumeAtHourMinus1 = "Volumen zur vollen Stunde - 1";
        volumeAtHourMinus2 = "Volumen zur vollen Stunde - 2";
        volumeAtHourMinus3 = "Volumen zur vollen Stunde - 3";
        volumeAtHourMinus4 = "Volumen zur vollen Stunde - 4";
    }
    if (language === "en") {
        fraud_manipulation = "Fraud / Manipulation";
        pipe_break = "Pipe break";
        leakage = "Leakage";
        qmax = "Max. flow";
        backward_flow = "Backward flow";
        zero_flow = "Zero flow";
        device_end_of_legal_life = "End of life";
        error_flag_last_60_days = "Error in the last 60 days";
        application_error_unknown_field_c = "application_error_unknown_field_c";
        application_error_unknown_field_ci = "application_error_unknown_field_ci";
        application_error_unknown_record = "application_error_unknown_record";
        application_error_access_right = "No access rights available";
        application_error_record_size = "application_error_record_size";
        application_error_record_value = "application_error_record_value";
        application_error_bad_password = "Bad password";
        no_error_flags = "No errors present";

        volumeTotalizer = "Volume";
        fabricationNumber = "Fabrication number";
        currentDateAndTime = "Date and time";
        daylightSavingTime = "Daylight saving time";
        dateAndTimeValid = "Valid Date and time";
        detailedErrors = "Detailed errors";
        setDay = "Target day";
        volumeTotalizerAtSetDay = "Volume totalizer at target day";
        commissioningDay = "Commissioning date";
        internalVersion = "Version";
        volumeAtHourMinus1 = "Volume on the hour - 1";
        volumeAtHourMinus2 = "Volume on the hour - 2";
        volumeAtHourMinus3 = "Volume on the hour - 3";
        volumeAtHourMinus4 = "Volume on the hour - 4";
    }
    if (language === "raw") {
        fraud_manipulation = "fraud_manipulation";
        pipe_break = "pipe_break";
        leakage = "leakage";
        qmax = "qmax";
        backward_flow = "backward_flow";
        zero_flow = "zero_flow";
        device_end_of_legal_life = "device_end_of_legal_life";
        error_flag_last_60_days = "error_flag_last_60_days";
        application_error_unknown_field_c = "application_error_unknown_field_c";
        application_error_unknown_field_ci = "application_error_unknown_field_ci";
        application_error_unknown_record = "application_error_unknown_record";
        application_error_access_right = "application_error_access_right";
        application_error_record_size = "application_error_record_size";
        application_error_record_value = "application_error_record_value";
        application_error_bad_password = "application_error_bad_password";
        no_error_flags = "no_error_flags";

        volumeTotalizer = "volume_totalizer";
        fabricationNumber = "fabrication_number";
        currentDateAndTime = "current_date_and_time";
        daylightSavingTime = "daylight_saving_time";
        dateAndTimeValid = "date_and_time_valid";
        detailedErrors = "detailed_errors";
        setDay = "set_day";
        volumeTotalizerAtSetDay = "volume_totalizer_at_set_day";
        commissioningDay = "commissioning_day";
        internalVersion = "internal_version";
        volumeAtHourMinus1 = "volume_at_hour_minus_1";
        volumeAtHourMinus2 = "volume_at_hour_minus_2";
        volumeAtHourMinus3 = "volume_at_hour_minus_3";
        volumeAtHourMinus4 = "volume_at_hour_minus_4";
    }
}
if (typeof exports !== 'undefined') { exports.decodeUplink = decodeUplink; }
