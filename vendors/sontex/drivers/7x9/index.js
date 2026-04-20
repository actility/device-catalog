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


  File:     Parser7x9.js
  Version:  1.6

  Description:
    This js script parses the 7x9 M-Bus LoRaWAN frames to make it readable.

  Usage :
    This parser is specially done to work with the things stack.

  Usage example :
  input = {
  "bytes": [
   4,6,0,0,0,0,4,20,0,0,0,0,12,120,64,102,136,38,4,109,22,14,173,44,2,255,44,0,0,132,16,6,0,0,0,0,130,10,108,
   225,241,132,10,6,0,0,0,0,132,10,20,0,0,0,0,2,89,32,10,2,93,42,10,2,59,0,0,3,44,0,0,127,132,26,6,255,0,0,0
  ],"fPort": 2};

  console.log(decodeUplink(input));
  */

// Initialize global variable names
var ref1_error_ad;
var sensor1_error_ad;
var ref2_error_ad;
var sensor2_error_ad;
var ad_timeout_error;
var temperature_1_out_of_range;
var temperature_2_out_of_range;
var flow_in_saturation;
var application_error_unknown_field_c;
var application_error_unknown_field_ci;
var application_error_unknown_record;
var application_error_access_right;
var application_error_record_size;
var application_error_record_value;
var device_disabled;
var no_error_flags;

var energyTotalizerHeating;
var volumeTotalizer;
var fabricationNumber;
var currentDateAndTime;
var daylightSavingTime;
var dateAndTimeValid;
var detailedErrors;
var complementaryCounter1Totalizer;
var complementaryCounter2Totalizer;
var energyTotalizerCooling;
var setDay;
var energyTotalizerHeatingAtSetDay;
var volumeTotalizerAtSetDay;
var highTemperature;
var lowTemperature;
var flow;
var power;
var complementaryCounter1TotalizerAtSetDay;
var complementaryCounter2TotalizerAtSetDay;
var energyTotalizerCoolingAtSetDay;

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
        var unitKeys = [];
        var unit = "";
        var multiplier = 1;
        var toFixedDigits = 0;
        var byte = 0x00;
        switch (identifier) {
            case 0x04:
                var key = bytes[i++];
                dataBytes.push(bytes[i++]);
                dataBytes.push(bytes[i++]);
                dataBytes.push(bytes[i++]);
                dataBytes.push(bytes[i++]);
                unit = getUnit(key);
                multiplier = getMultiplier(key);
                toFixedDigits = getNumberOfDigits(multiplier);
                switch (key) {
                    case 0x05:
                    case 0x06:
                    case 0x07:
                    case 0x0E:
                    case 0x0F:
                        // decoded[energyTotalizerHeating] = (getValueCodingB(dataBytes) * multiplier) + "" + unit;
                        decoded[energyTotalizerHeating] = formatUnit((getValueCodingB(dataBytes) * multiplier), unit);
                        break;
                    case 0x13:
                    case 0x14:
                        // decoded[volumeTotalizer] = (getValueCodingB(dataBytes) * multiplier) + "" + unit;
                        decoded[volumeTotalizer] = formatUnit((getValueCodingB(dataBytes) * multiplier), unit);
                        break;
                    case 0x6D:
                        // decoded[currentDateAndTime] = getValueCodingF(dataBytes);
                        decoded[currentDateAndTime] = formatUnit(getValueCodingF(dataBytes), "");
                        break;
                    default:
                }
                break;
            case 0x0C:
                byte = bytes[i++];
                if (byte === 0x78) {
                    dataBytes.push(bytes[i++]);
                    dataBytes.push(bytes[i++]);
                    dataBytes.push(bytes[i++]);
                    dataBytes.push(bytes[i++]);
                    // decoded[fabricationNumber] = getValueCondingA(dataBytes);
                    decoded[fabricationNumber] = formatUnit(getValueCodingA(dataBytes), "");
                }
                break;
            case 0x02:
                var key = bytes[i++];
                if (key === 0xFF) {
                    byte = bytes[i++];
                }
                dataBytes.push(bytes[i++]);
                dataBytes.push(bytes[i++]);
                switch (key) {
                    case 0xFF:
                        if (byte === 0x2C) {
                            // decoded[detailedErrors] = getErrorFlags(dataBytes);
                            decoded[detailedErrors] = formatUnit(getErrorFlags(dataBytes), "");
                        }
                        break;
                    case 0x3B:
                        // decoded[flow] = (getValueCodingB(dataBytes) * 0.001).toFixed(3) + " m³/h";
                        decoded[flow] = formatUnit((getValueCodingB(dataBytes) * 0.001).toFixed(3), " m³/h");
                        break;
                    case 0x59:
                        // decoded[highTemperature] = (getValueCodingB(dataBytes) * 0.01).toFixed(2) + " °C";
                        decoded[highTemperature] = formatUnit((getValueCodingB(dataBytes) * 0.01).toFixed(2), " °C");
                        break;
                    case 0x5D:
                        // decoded[lowTemperature] = (getValueCodingB(dataBytes) * 0.01).toFixed(2) + " °C";
                        decoded[lowTemperature] = formatUnit((getValueCodingB(dataBytes) * 0.01).toFixed(2), " °C");
                        break;
                }
                break;
            case 0x03:
                byte = bytes[i++];
                if (byte === 0x2C) {
                    dataBytes.push(bytes[i++]);
                    dataBytes.push(bytes[i++]);
                    dataBytes.push(bytes[i++]);
                    decoded[power] = formatUnit((getValueCodingB(dataBytes) * 0.01).toFixed(2), " kW");
                }
                break;
            case 0x82:
                byte = bytes[i++];
                var byte2 = bytes[i++];
                if (byte === 0x0A && byte2 === 0x6C) {
                    dataBytes.push(bytes[i++]);
                    dataBytes.push(bytes[i++]);
                    decoded[setDay] = formatUnit(getValueCodingG(dataBytes), "");
                }
                break;
            case 0x84:
                var secondIdentifier = bytes[i++];
                switch (secondIdentifier) {
                    case 0x0A:
                    case 0x10:
                    case 0x1A:
                        unitKeys.push(bytes[i++]);
                        break;
                    case 0x80:
                    case 0x8A:
                        byte = bytes[i++];
                        unitKeys.push(bytes[i++]);
                        // for complementary counters the unit key has a variable length (1 or 2 bytes), length of 2
                        // bytes is only the case if the first byte matches 0xFD
                        if (unitKeys[0] === 0xFD) {
                            unitKeys.push(bytes[i++]);
                        }
                        break;
                    case 0x40:
                    case 0x4A:
                        unitKeys.push(bytes[i++]);
                        // for complementary counters the unit key has a variable length (1 or 2 bytes), length of 2
                        // bytes is only the case if the first byte matches 0xFD
                        if (unitKeys[0] === 0xFD) {
                            unitKeys.push(bytes[i++]);
                        }
                        break;
                }

                var isComplementaryCounter2 = secondIdentifier === 0x80 || secondIdentifier === 0x8A;

                if ((isComplementaryCounter2 && byte === 0x40)
                    || !isComplementaryCounter2) {
                    dataBytes.push(bytes[i++]);
                    dataBytes.push(bytes[i++]);
                    dataBytes.push(bytes[i++]);
                    dataBytes.push(bytes[i++]);
                    unit = getUnit(unitKeys[0]);
                    multiplier = getMultiplier(unitKeys[0]);
                    toFixedDigits = getNumberOfDigits(multiplier);
                    switch (secondIdentifier) {
                        case 0x0A:
                            switch (unitKeys[0]) {
                                case 0x05:
                                case 0x06:
                                case 0x07:
                                case 0x0E:
                                case 0x0F:
                                    // decoded[energyTotalizerHeatingAtSetDay] = (getValueCodingB(dataBytes) * multiplier).toFixed(toFixedDigits) + "" + unit;
                                    decoded[energyTotalizerHeatingAtSetDay] = formatUnit((getValueCodingB(dataBytes) * multiplier).toFixed(toFixedDigits), unit);
                                    break;
                                case 0x13:
                                case 0x14:
                                    // decoded[volumeTotalizerAtSetDay] = (getValueCodingB(dataBytes) * multiplier).toFixed(toFixedDigits) + "" + unit;
                                    decoded[volumeTotalizerAtSetDay] = formatUnit((getValueCodingB(dataBytes) * multiplier).toFixed(toFixedDigits), unit);
                            }
                            break;
                        case 0x10:
                            // decoded[energyTotalizerCooling] = (getValueCodingB(dataBytes) * multiplier).toFixed(toFixedDigits) + "" + unit;
                            decoded[energyTotalizerCooling] = formatUnit((getValueCodingB(dataBytes) * multiplier).toFixed(toFixedDigits), unit);
                            break;
                        case 0x1A:
                            // decoded[energyTotalizerCoolingAtSetDay] = (getValueCodingB(dataBytes) * multiplier).toFixed(toFixedDigits) + "" + unit;
                            decoded[energyTotalizerCoolingAtSetDay] = formatUnit((getValueCodingB(dataBytes) * multiplier).toFixed(toFixedDigits), unit);
                            break;
                        case 0x40:
                            // decoded[complementaryCounter1Totalizer] = (getValueCodingB(dataBytes) * multiplier).toFixed(toFixedDigits) + "" + unit;
                            decoded[complementaryCounter1Totalizer] = formatUnit((getValueCodingB(dataBytes) * multiplier).toFixed(toFixedDigits), unit);
                            break;
                        case 0x4A:
                            // decoded[complementaryCounter1TotalizerAtSetDay] = (getValueCodingB(dataBytes) * multiplier).toFixed(toFixedDigits) + "" + unit;
                            decoded[complementaryCounter1TotalizerAtSetDay] = formatUnit((getValueCodingB(dataBytes) * multiplier).toFixed(toFixedDigits), unit);
                            break;
                        case 0x80:
                            // decoded[complementaryCounter2Totalizer] = (getValueCodingB(dataBytes) * multiplier).toFixed(toFixedDigits) + "" + unit;
                            decoded[complementaryCounter2Totalizer] = formatUnit((getValueCodingB(dataBytes) * multiplier).toFixed(toFixedDigits), unit);
                            break;
                        case 0x8A:
                            // decoded[complementaryCounter2TotalizerAtSetDay] = (getValueCodingB(dataBytes) * multiplier).toFixed(toFixedDigits) + "" + unit;
                            decoded[complementaryCounter2TotalizerAtSetDay] = formatUnit((getValueCodingB(dataBytes) * multiplier).toFixed(toFixedDigits), unit);
                            break;
                    }
                }
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

function getValueCodingA(bytes) {
    var binary = getBinaryString(bytes);
    var i = 7;
    var number = 0;
    for (var n = 0; n <= i; n++) {
        var currentDigit = 8 * binary.charAt(n * 4) + 4 * binary.charAt(n * 4 + 1)
            + 2 * binary.charAt(n * 4 + 2) + 1 * binary.charAt(n * 4 + 3);
        currentDigit = Math.min(currentDigit, 9);
        number += currentDigit * Math.pow(10, i - n);
    }
    number = Math.min(number, Math.pow(10, i + 1) - 1);
    return number;
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
    // decoded[dateAndTimeValid] = binary.charAt(24) === "0";
    decoded[dateAndTimeValid] = formatUnit(binary.charAt(24) === "0", "");
    // decoded[daylightSavingTime] = binary.charAt(16) === "1";
    decoded[daylightSavingTime] = formatUnit(binary.charAt(16) === "1", "");
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
    if (binary.charAt(0) === "1") flags.push(ref1_error_ad);
    if (binary.charAt(1) === "1") flags.push(sensor1_error_ad);
    if (binary.charAt(2) === "1") flags.push(ref2_error_ad);
    if (binary.charAt(3) === "1") flags.push(sensor2_error_ad);
    if (binary.charAt(4) === "1") flags.push(ad_timeout_error);
    if (binary.charAt(5) === "1") flags.push(temperature_1_out_of_range);
    if (binary.charAt(6) === "1") flags.push(temperature_2_out_of_range);
    if (binary.charAt(7) === "1") flags.push(flow_in_saturation);
    if (binary.charAt(8) === "1") flags.push(application_error_unknown_field_c);
    if (binary.charAt(9) === "1") flags.push(application_error_unknown_field_ci);
    if (binary.charAt(10) === "1") flags.push(application_error_unknown_record);
    if (binary.charAt(11) === "1") flags.push(application_error_access_right);
    if (binary.charAt(12) === "1") flags.push(application_error_record_size);
    if (binary.charAt(13) === "1") flags.push(application_error_record_value);
    // bit14 not used
    if (binary.charAt(15) === "1") flags.push(device_disabled);
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
        ref1_error_ad = "ref1_error_ad";
        sensor1_error_ad = "Fehler Sensor 1";
        ref2_error_ad = "ref2_error_ad";
        sensor2_error_ad = "Fehler Sensor 2";
        ad_timeout_error = "ad_timeout_error";
        temperature_1_out_of_range = "Temperatur 1 außerhalb des Bereichs";
        temperature_2_out_of_range = "Temperatur 2 außerhalb des Bereichs";
        flow_in_saturation = "Durchfluss ist in Sättigung";
        application_error_unknown_field_c = "application_error_unknown_field_c";
        application_error_unknown_field_ci = "application_error_unknown_field_ci";
        application_error_unknown_record = "application_error_unknown_record";
        application_error_access_right = "Keine Zugriffsrechte vorhanden";
        application_error_record_size = "application_error_record_size";
        application_error_record_value = "application_error_record_value";
        device_disabled = "Gerät deaktiviert";
        no_error_flags = "Keine Fehler vorhanden";

        energyTotalizerHeating = "Wärmenergie";
        volumeTotalizer = "Volumen";
        fabricationNumber = "Fabrikationsnummer";
        currentDateAndTime = "Datum und Zeit";
        daylightSavingTime = "Sommerzeit";
        dateAndTimeValid = "Datum und Zeit valide";
        detailedErrors = "Fehlermeldungen";
        complementaryCounter1Totalizer = "Komplementärer Zähler 1";
        complementaryCounter2Totalizer = "Komplementärer Zähler 2";
        energyTotalizerCooling = "Kühlenergie";
        setDay = "Stichtag";
        energyTotalizerHeatingAtSetDay = "Wärmeenergie zum Stichtag";
        volumeTotalizerAtSetDay = "Volumen zum Stichtag";
        highTemperature = "Temperatur hoch";
        lowTemperature = "Temperatur tief";
        flow = "Durchfluss";
        power = "Leistung";
        complementaryCounter1TotalizerAtSetDay = "Komplementärer Zähler 1 zum Stichtag";
        complementaryCounter2TotalizerAtSetDay = "Komplementärer Zähler 2 zum Stichtag";
        energyTotalizerCoolingAtSetDay = "Kühlenergie zum Stichtag";
    }
    if (language === "en") {
        ref1_error_ad = "ref1_error_ad";
        sensor1_error_ad = "Error Sensor 1";
        ref2_error_ad = "ref2_error_ad";
        sensor2_error_ad = "Error Sensor 2";
        ad_timeout_error = "ad_timeout_error";
        temperature_1_out_of_range = "Temperature 1 out of range";
        temperature_2_out_of_range = "TTemperature 2 out of range";
        flow_in_saturation = "Flow is in saturation";
        application_error_unknown_field_c = "application_error_unknown_field_c";
        application_error_unknown_field_ci = "application_error_unknown_field_ci";
        application_error_unknown_record = "application_error_unknown_record";
        application_error_access_right = "No access rights available";
        application_error_record_size = "application_error_record_size";
        application_error_record_value = "application_error_record_value";
        device_disabled = "Device deactivated";
        no_error_flags = "No errors present";

        energyTotalizerHeating = "Heat energy";
        volumeTotalizer = "Volume";
        fabricationNumber = "Fabrication number";
        currentDateAndTime = "Date and time";
        daylightSavingTime = "Daylight saving time";
        dateAndTimeValid = "Valid Date and time";
        detailedErrors = "Detailed errors";
        complementaryCounter1Totalizer = "Complementary counter 1";
        complementaryCounter2Totalizer = "Complementary counter 2";
        energyTotalizerCooling = "Energy totalizer cooling";
        setDay = "Target day";
        energyTotalizerHeatingAtSetDay = "Energy totalizer heating at target day";
        volumeTotalizerAtSetDay = "Volume totalizer at target day";
        highTemperature = "High temperature";
        lowTemperature = "Low temperature";
        flow = "Flow";
        power = "Power";
        complementaryCounter1TotalizerAtSetDay = "Complementary Counter 1 Totalizer at target day";
        complementaryCounter2TotalizerAtSetDay = "Complementary Counter 2 Totalizer at target day";
        energyTotalizerCoolingAtSetDay = "Energy totalizer cooling at target day";
    }
    if (language === "raw") {
        ref1_error_ad = "ref1_error_ad";
        sensor1_error_ad = "error_sensor_1";
        ref2_error_ad = "ref2_error_ad";
        sensor2_error_ad = "error_sensor_2";
        ad_timeout_error = "ad_timeout_error";
        temperature_1_out_of_range = "temprature_1_out_of_range";
        temperature_2_out_of_range = "temprature_2_out_of_range";
        flow_in_saturation = "flow_is_in_saturation";
        application_error_unknown_field_c = "application_error_unknown_field_c";
        application_error_unknown_field_ci = "application_error_unknown_field_ci";
        application_error_unknown_record = "application_error_unknown_record";
        application_error_access_right = "no_access_rights_available";
        application_error_record_size = "application_error_record_size";
        application_error_record_value = "application_error_record_value";
        device_disabled = "device_deactivated";
        no_error_flags = "no_errors_present";

        energyTotalizerHeating = "heat_energy";
        volumeTotalizer = "volume";
        fabricationNumber = "fabrication_number";
        currentDateAndTime = "date_and_time";
        daylightSavingTime = "daylight_saving_time";
        dateAndTimeValid = "valid_date_and_time";
        detailedErrors = "detailed_errors";
        complementaryCounter1Totalizer = "complementary_counter_1";
        complementaryCounter2Totalizer = "complementary_counter_2";
        energyTotalizerCooling = "energy_totalizer_cooling";
        setDay = "target_day";
        energyTotalizerHeatingAtSetDay = "energy_totalizer_heating_at_target_day";
        volumeTotalizerAtSetDay = "volume_totalizer_at_target_day";
        highTemperature = "high_temperature";
        lowTemperature = "low_temperature";
        flow = "flow";
        power = "power";
        complementaryCounter1TotalizerAtSetDay = "complementary_counter_1_totalizer_at_target_day";
        complementaryCounter2TotalizerAtSetDay = "complementary_counter_2_totalizer_at_target_day";
        energyTotalizerCoolingAtSetDay = "energy_totalizer_cooling_at_target_day";
    }
}

if (typeof exports !== 'undefined') { exports.decodeUplink = decodeUplink; }
