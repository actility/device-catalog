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


  File:     Parser878.js
  Version:  1.3

  Description:
    This js script parses the 878 M-Bus LoRaWAN frames to make it readable.

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
var fraud_switch_closed;
var measure_error;
var invalid_time_clock;
var key_too_long_closed;
var temperature_out_of_range;
var application_error_unknown_field_c;
var application_error_unknown_field_ci;
var application_error_unknown_record;
var application_error_access_right;
var application_error_record_size;
var application_error_record_value;
var application_error_bad_password;
var no_error_flags;

// States
var remote_radiator_sensor_plugged;
var product_scale_enabled;
var operating_mode_normal;
var operating_mode_storage_not_mounted;
var operating_mode_storage_mounted;
var operating_mode_installation;
var measurement_principle_reserved_for_future_use;
var measurement_principle_one_sensor_with_start_sensor;
var measurement_principle_two_sensors;
var communication_type_none;
var communication_type_radio_sontex;
var communication_type_wmbus;
var communication_type_lora;
var hca_currently_covered;
var suppress_counting_activate_now;
var radio_encryption_enabled;
var wmbus_frame_short;
var wmbus_frame_long;
var start_counting_date_not_yet_exceeded;
var no_state_parameters;


// Short frame
var fabricationNumber;
var currentDateAndTime;
var daylightSavingTime;
var dateAndTimeValid;
var totalizerHeating;
var setDay;
var totalizerHeatingStoredAtSetDay;
var detailedErrors;
var radiatorTemperature;
var stateOfParameters;
var internalVersion;
// Long frame
var radiatorMaxTempPrevPeriod;
var radiatorMaxTempCurrPeriod;
var fraudDuration;
var dateOfLastFraud;
var commissioningDate;
var unitsFactorKc;
var unitsFactorKq;
var fraudCounter;
// Extra
var ambientTemperature;
var lowTemperature;


var decoded = {};
// Supported languages: raw, en, de
var language = "raw"

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
        var byte2 = 0x00;
        switch (identifier) {
            case 0x04:
                var key = bytes[i++];
                dataBytes.push(bytes[i++]);
                dataBytes.push(bytes[i++]);
                dataBytes.push(bytes[i++]);
                dataBytes.push(bytes[i++]);
                switch (key) {
                    case 0x05:
                    case 0x06:
                    case 0x07:
                    case 0x0E:
                    case 0x0F:
                    case 0x13:
                    case 0x14:
                    case 0x6D:
                        decoded[currentDateAndTime] = formatUnit(getValueCodingF(dataBytes), unit);
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
                    decoded[fabricationNumber] = formatUnit((getValueCodingA(dataBytes) * multiplier), unit);
                }
                break;
            case 0x02:
                var key = bytes[i++];
                unit = getUnit(key);
                multiplier = getMultiplier(key);
                toFixedDigits = getNumberOfDigits(multiplier);
                if (key === 0xFF) {
                    byte = bytes[i++];
                }
                if (key === 0xFD) {
                    byte = bytes[i++];
                }
                dataBytes.push(bytes[i++]);
                dataBytes.push(bytes[i++]);
                switch (key) {
                    case 0xFD:
                        if (byte === 0x66) {
                            decoded[stateOfParameters] = getStateOfParameters(dataBytes);
                        }
                    case 0xFF:
                        if (byte === 0x2C) {
                            decoded[detailedErrors] = getErrorFlags(dataBytes);
                        }
                        break;
                    case 0x59:
                        decoded[radiatorTemperature] = formatUnit(roundNumber(getValueCodingB(dataBytes) * multiplier), unit);
                        break;
                    case 0x65:
                        decoded[ambientTemperature] = formatUnit(roundNumber(getValueCodingB(dataBytes) * multiplier), unit);
                        break;
                }
                break;
            case 0x03:
                byte = bytes[i++];
                if (byte === 0x6E) {
                    dataBytes.push(bytes[i++]);
                    dataBytes.push(bytes[i++]);
                    dataBytes.push(bytes[i++]);
                    // decoded[totalizerHeating] = (getValueCodingB(dataBytes));
                    decoded[totalizerHeating] = formatUnit((getValueCodingB(dataBytes) * multiplier), unit);
                }
                break;
            case 0x05:
                var key = bytes[i++];
                switch (key) {
                    case 0xFF:
                        byte = bytes[i++]
                        if (byte === 0x2D) {
                            dataBytes.push(bytes[i++]);
                            dataBytes.push(bytes[i++]);
                            dataBytes.push(bytes[i++]);
                            dataBytes.push(bytes[i++]);
                            decoded[unitsFactorKc] = formatUnit((getValueCodingH(dataBytes) * multiplier).toFixed(3), unit);
                        }
                        break;
                }
                break;
            case 0x0B:
                var key = bytes[i++];
                switch (key) {
                    case 0xFD:
                        byte = bytes[i++]
                        if (byte === 0x0F) {
                            dataBytes.push(bytes[i++]);
                            dataBytes.push(bytes[i++]);
                            dataBytes.push(bytes[i++]);
                            decoded[internalVersion] = formatUnit((getValueCodingA(dataBytes) * multiplier), unit);
                        }
                        break;
                }
                break;
            case 0x12:
                key = bytes[i++];
                unit = getUnit(key);
                multiplier = getMultiplier(key);
                toFixedDigits = getNumberOfDigits(multiplier);
                if (key === 0x59) {
                    dataBytes.push(bytes[i++]);
                    dataBytes.push(bytes[i++]);
                    decoded[radiatorMaxTempCurrPeriod] = formatUnit(roundNumber(getValueCodingB(dataBytes) * multiplier), unit);
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
            case 0x43:
                byte = bytes[i++];
                if (byte === 0x6E) {
                    dataBytes.push(bytes[i++]);
                    dataBytes.push(bytes[i++]);
                    dataBytes.push(bytes[i++]);
                    decoded[totalizerHeatingStoredAtSetDay] = formatUnit((getValueCodingB(dataBytes) * multiplier), unit);
                }
                break;
            case 0x52:
                key = bytes[i++];
                unit = getUnit(key);
                multiplier = getMultiplier(key);
                toFixedDigits = getNumberOfDigits(multiplier);
                if (key === 0x59) {
                    dataBytes.push(bytes[i++]);
                    dataBytes.push(bytes[i++]);
                    decoded[radiatorMaxTempPrevPeriod] = formatUnit(roundNumber(getValueCodingB(dataBytes) * multiplier), unit);
                }
                break;
            case 0x78:
                // console.debug("Detected headless MBus frame");
                break;
            case 0x81:
                var key = bytes[i++];
                switch (key) {
                    case 0x10:
                        byte = bytes[i++]
                        byte2 = bytes[i++]
                        if (byte === 0xFD && byte2 === 0x61) {
                            dataBytes.push(bytes[i++]);
                            decoded[fraudCounter] = formatUnit((getValueCodingC(dataBytes) * multiplier), unit);
                        }
                        break;
                }
                break;
            case 0x82:
                var key = bytes[i++];
                switch (key) {
                    case 0x10:
                        byte = bytes[i++]
                        if (byte === 0x6C) {
                            dataBytes.push(bytes[i++]);
                            dataBytes.push(bytes[i++]);
                            decoded[dateOfLastFraud] = formatUnit(getValueCodingG(dataBytes), unit);
                        }
                        break;
                    case 0x20:
                        byte = bytes[i++]
                        if (byte === 0x6C) {
                            dataBytes.push(bytes[i++]);
                            dataBytes.push(bytes[i++]);
                            decoded[commissioningDate] = formatUnit(getValueCodingG(dataBytes), unit);
                        }
                        break;
                }
                break;
            case 0x83:
                var key = bytes[i++];
                switch (key) {
                    case 0x10:
                        byte = bytes[i++]
                        byte2 = bytes[i++]
                        if (byte === 0xFD && byte2 === 0x31) {
                            dataBytes.push(bytes[i++]);
                            dataBytes.push(bytes[i++]);
                            dataBytes.push(bytes[i++]);
                            decoded[fraudDuration] = formatUnit((getValueCodingB(dataBytes) * multiplier), unit);
                        }
                        break;
                }
                break;
            case 0x85:
                var key = bytes[i++];
                switch (key) {
                    case 0x20:
                        byte = bytes[i++]
                        byte2 = bytes[i++]
                        if (byte === 0xFF && byte2 === 0x2D) {
                            dataBytes.push(bytes[i++]);
                            dataBytes.push(bytes[i++]);
                            dataBytes.push(bytes[i++]);
                            dataBytes.push(bytes[i++]);
                            decoded[unitsFactorKq] = formatUnit((getValueCodingH(dataBytes) * multiplier).toFixed(3), unit);
                        }
                        break;
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
        case 0x59: // 1/100 °C
        case 0x65: // 1/100 °C
            return 0.01;
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
        case 0x59: // 1/100 °C
        case 0x65: // 1/100 °C
            return " °C";
        case 0xFD: // 1 without unit
            return "";
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

function getValueCodingC(bytes) {
    var binary = getBinaryString(bytes).split("").reverse().join("");
    var i = binary.length - 1;
    var n = 0
    for (var j = 0; j <= i; j++) {
        var currentBit = parseInt(binary.charAt(i - j));
        n += Math.pow(2, i - j) * currentBit;
    }
    var floor = 0;
    if (n < floor) n = floor;
    var ceiling = Math.pow(2, (i + 1)) - 1;
    if (n > ceiling) n = ceiling;
    return n;
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
    decoded[dateAndTimeValid] = binary.charAt(24) === "0";
    decoded[daylightSavingTime] = binary.charAt(16) === "1";
    return dateString + " " + timeString;
}

function getValueCodingG(bytes) {
    var binary = getBinaryString(bytes);
    return calculateDate(binary);
}

function getValueCodingH(bytes) {
    var binary = getBinaryString(bytes);
    var i = 0;
    var s = Math.pow(-1, parseInt(binary.charAt(i++)));
    var e = 0
    var m = 0

    for (var n = 0; n < 8; n++) {
        var currentBit = parseInt(binary.charAt(i + n));
        e += Math.pow(2, 7 - n) * currentBit;
    }

    for (var n = 1; n < 24; n++) {
        var currentBit = parseInt(binary.charAt((i + 7) + n));
        m += Math.pow(2, (n * -1)) * currentBit;
    }

    if (e > 0 && e < 255) {
        return (s * Math.pow(2, (e - 127)) * (1 + m))
    }

    if (e === 0) {
        if (m !== 0) {
            return (s * Math.pow(2, (e - 126)) * m)
        }
        if (m === 0) {
            return (s * 0)
        }
    }

    if (e === 255) {
        if (m === 0) {
            return "INF"
        }
        if (m !== 0) {
            return "NaN"
        }
    }

    return "UNDEF"
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
    // bit15 Radio transceiver error (from V2.0.0)
    if (binary.charAt(14) === "1") flags.push(application_error_bad_password);
    if (binary.charAt(13) === "1") flags.push(application_error_record_value);
    if (binary.charAt(12) === "1") flags.push(application_error_record_size);
    if (binary.charAt(11) === "1") flags.push(application_error_access_right);
    if (binary.charAt(10) === "1") flags.push(application_error_unknown_record);
    if (binary.charAt(9) === "1") flags.push(application_error_unknown_field_ci);
    if (binary.charAt(8) === "1") flags.push(application_error_unknown_field_c);
    // bit 7 not used
    if (binary.charAt(6) === "1") flags.push(temperature_out_of_range);
    if (binary.charAt(5) === "1") flags.push(key_too_long_closed);
    // bit4 Memory error (from V2.0.0)
    // bit3 System clock error (from V2.0.0)
    if (binary.charAt(2) === "1") flags.push(invalid_time_clock);
    if (binary.charAt(1) === "1") flags.push(measure_error);
    if (binary.charAt(0) === "1") flags.push(fraud_switch_closed);
    if (flags === []) {
        flags.push(no_error_flags);
    }
    return flags;
}


function getStateOfParameters(bytes) {
    var binary = getBinaryString(bytes);
    var flags = [];
    if (binary.charAt(2) === "1") flags.push(start_counting_date_not_yet_exceeded);

    // frame type
    if (binary.charAt(3) === "0" && binary.charAt(4) === "0" ) flags.push(wmbus_frame_short);
    if (binary.charAt(3) === "0" && binary.charAt(4) === "1" ) flags.push(wmbus_frame_long);

    if (binary.charAt(5) === "1") flags.push(radio_encryption_enabled);
    if (binary.charAt(6) === "1") flags.push(suppress_counting_activate_now);
    if (binary.charAt(7) === "1") flags.push(hca_currently_covered);

    // communication type
    if (binary.charAt(8) === "0" && binary.charAt(9) === "0") flags.push(communication_type_none);
    if (binary.charAt(8) === "0" && binary.charAt(9) === "1") flags.push(communication_type_radio_sontex);
    if (binary.charAt(8) === "1" && binary.charAt(9) === "0") flags.push(communication_type_wmbus);
    if (binary.charAt(8) === "1" && binary.charAt(9) === "1") flags.push(communication_type_lora);

    // measurement principle
    if (binary.charAt(10) === "0" && binary.charAt(11) === "0") flags.push(measurement_principle_reserved_for_future_use);
    if (binary.charAt(10) === "0" && binary.charAt(11) === "1") flags.push(measurement_principle_one_sensor_with_start_sensor);
    if (binary.charAt(10) === "1" && binary.charAt(11) === "0") flags.push(measurement_principle_two_sensors);

    // operating mode
    if (binary.charAt(12) === "0" && binary.charAt(13) === "0") flags.push(operating_mode_normal);
    if (binary.charAt(12) === "0" && binary.charAt(13) === "1") flags.push(operating_mode_storage_not_mounted);
    if (binary.charAt(12) === "1" && binary.charAt(13) === "0") flags.push(operating_mode_storage_mounted);
    if (binary.charAt(12) === "1" && binary.charAt(13) === "1") flags.push(operating_mode_installation);

    if (binary.charAt(14) === "1") flags.push(product_scale_enabled);
    if (binary.charAt(15) === "1") flags.push(remote_radiator_sensor_plugged);

    if (flags === []) {
        flags.push(no_state_parameters);
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
// depending on if appendUnits is true/false
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

// Round numbers to fixed positions (.00)
function roundNumber (n) {
    return Math.round(n * 100) / 100
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
        fraud_switch_closed = "Betrugsschalter geschlossen";
        measure_error = "Messfehler";
        invalid_time_clock = "Ungültige Zeit";
        key_too_long_closed = "Schlüssel zu lange geschlossen";
        temperature_out_of_range = "Temperatur ausserhalbs des gültigen Bereichs";
        application_error_unknown_field_c = "application_error_unknown_field_c";
        application_error_unknown_field_ci = "application_error_unknown_field_ci";
        application_error_unknown_record = "application_error_unknown_record";
        application_error_access_right = "Keine Zugriffsrechte vorhanden";
        application_error_record_size = "application_error_record_size";
        application_error_record_value = "application_error_record_value";
        application_error_bad_password = "Falsches Passwort";
        no_error_flags = "Keine Fehler vorhanden";

        remote_radiator_sensor_plugged = "Externer Radiator Sensor verbunden";
        product_scale_enabled = "Produkt Skala aktiviert";
        operating_mode_normal = "Normaler Bertriebsmodus";
        operating_mode_storage_not_mounted = "Lagermodus nicht installiert";
        operating_mode_storage_mounted = "Lagermodus installiert";
        operating_mode_installation = "Installationsmodus";
        measurement_principle_reserved_for_future_use = "Messprinzip für zukünfige Anwendungsfälle";
        measurement_principle_one_sensor_with_start_sensor = "Messprinzip ein Sensor mit Startsensor";
        measurement_principle_two_sensors = "Messprinzip zwei Sensoren";
        communication_type_none = "Kein Kommunikationstyp";
        communication_type_radio_sontex = "Kommunikationstyp Sontex Funk";
        communication_type_wmbus = "Kommunikationstyp WMBus";
        communication_type_lora = "Kommunikationstyp LoRa";
        hca_currently_covered = "HKV unter Abdeckung";
        suppress_counting_activate_now = "Zähler deaktiviert";
        radio_encryption_enabled = "Funkverschlüsselung aktiv";
        wmbus_frame_short = "Kurzes WMBus Telegram";
        wmbus_frame_long = "Langes WMBus Telegram";
        start_counting_date_not_yet_exceeded = "Datum für Start des Zähler noch nicht überschritten";
        no_state_parameters = "Keine Status Parameter vorhanden";

        totalizerHeatingStoredAtSetDay = "Zähler Wärme am Stichtag";
        stateOfParameters = "Parameter Status";
        fabricationNumber = "Fabrikationsnummer";
        currentDateAndTime = "Datum und Zeit";
        daylightSavingTime = "Sommerzeit";
        dateAndTimeValid = "Datum und Zeit valide";
        detailedErrors = "Fehlermeldungen";
        radiatorMaxTempPrevPeriod = "Maximale Radiatortemperatur vorherige Periode";
        radiatorMaxTempCurrPeriod = "Maximale Radiatortemperatur aktuelle Periode";
        setDay = "Stichtag";
        internalVersion = "Interne Version";
        radiatorTemperature = "Radiator Temperatur";
        lowTemperature = "Temperatur tief";
        fraudDuration = "Dauer des Betrugs";
        dateOfLastFraud = "Datum des letzten Betrugs";
        commissioningDate = "Installationsdatum";
        unitsFactorKc = "Faktor Kc";
        unitsFactorKq = "Faktor Kq";
        fraudCounter = "Zähler Betrug";
        totalizerHeating = "Zähler Wärme";
        ambientTemperature = "Raumtemperatur";
    }
    if (language === "en") {
        fraud_switch_closed = "Fraud switch closed";
        measure_error = "Measure error";
        invalid_time_clock = "Invalid time clock";
        key_too_long_closed = "Key too long closed";
        temperature_out_of_range = "Temperature out of range";
        application_error_unknown_field_c = "application_error_unknown_field_c";
        application_error_unknown_field_ci = "application_error_unknown_field_ci";
        application_error_unknown_record = "application_error_unknown_record";
        application_error_access_right = "No access rights available";
        application_error_record_size = "application_error_record_size";
        application_error_record_value = "application_error_record_value";
        application_error_bad_password = "Bad password";
        no_error_flags = "No errors present";

        remote_radiator_sensor_plugged = "Remote radiator sensor plugged";
        product_scale_enabled = "Product scale enabled";
        operating_mode_normal = "Manual operating mode";
        operating_mode_storage_not_mounted = "Storage not mounted operating mode";
        operating_mode_storage_mounted = "Storage mounted operating mode";
        operating_mode_installation = "Installation operating mode";
        measurement_principle_reserved_for_future_use = "Measurement principle reserved for future use";
        measurement_principle_one_sensor_with_start_sensor = "Measurement principle one sensor with start sensor";
        measurement_principle_two_sensors = "Measurement principle two sensors";
        communication_type_none = "Communication type none";
        communication_type_radio_sontex = "Communication type radio Sontex";
        communication_type_wmbus = "Communication type WMBus";
        communication_type_lora = "Communication type LoRa";
        hca_currently_covered = "HCA currently covered";
        suppress_counting_activate_now = "Suppress counting active now";
        radio_encryption_enabled = "Radio encryption enabled";
        wmbus_frame_short = "WMBus frame short";
        wmbus_frame_long = "WMBus frame long";
        start_counting_date_not_yet_exceeded = "Start counting date not yet exceeded";
        no_state_parameters = "No state parameters present";

        totalizerHeatingStoredAtSetDay = "Totalizer of heating at set day";
        stateOfParameters = "State of parameters";
        fabricationNumber = "Fabrication number";
        currentDateAndTime = "Date and time";
        daylightSavingTime = "Daylight saving time";
        dateAndTimeValid = "Valid Date and time";
        detailedErrors = "Detailed errors";
        radiatorMaxTempPrevPeriod = "Radiator max. temperature previous period";
        radiatorMaxTempCurrPeriod = "Radiator max. temperature current period";
        setDay = "Target day";
        internalVersion = "Internal version";
        radiatorTemperature = "Radiator temperature";
        lowTemperature = "Low temperature";
        fraudDuration = "Fraud duration";
        dateOfLastFraud = "Date of last fraud";
        commissioningDate = "Commissioning date";
        unitsFactorKc = "Units factor Kc";
        unitsFactorKq = "Units factor Kq";
        fraudCounter = "Fraud counter";
        totalizerHeating = "Totalizer of heating";
        ambientTemperature = "Abmbient temperature";
    }
    if (language === "raw") {
        fraud_switch_closed = "fraud_switch_closed";
        measure_error = "measure_error";
        invalid_time_clock = "invalid_time_clock";
        key_too_long_closed = "key_too_long_closed";
        temperature_out_of_range = "temperature_out_of_range";
        application_error_unknown_field_c = "application_error_unknown_field_c";
        application_error_unknown_field_ci = "application_error_unknown_field_ci";
        application_error_unknown_record = "application_error_unknown_record";
        application_error_access_right = "application_error_access_right";
        application_error_record_size = "application_error_record_size";
        application_error_record_value = "application_error_record_value";
        application_error_bad_password = "application_error_bad_password";
        no_error_flags = "no_errors_present";

        remote_radiator_sensor_plugged = "remote_radiator_sensor_plugged";
        product_scale_enabled = "product_scale_enabled";
        operating_mode_normal = "operating_mode_normal";
        operating_mode_storage_not_mounted = "operating_mode_storage_not_mounted";
        operating_mode_storage_mounted = "operating_mode_storage_mounted";
        operating_mode_installation = "operating_mode_installation";
        measurement_principle_reserved_for_future_use = "measurement_principle_reserved_for_future_use";
        measurement_principle_one_sensor_with_start_sensor = "measurement_principle_one_sensor_with_start_sensor";
        measurement_principle_two_sensors = "measurement_principle_two_sensors";
        communication_type_none = "communication_type_none";
        communication_type_radio_sontex = "communication_type_radio_sontex";
        communication_type_wmbus = "communication_type_wmbus";
        communication_type_lora = "communication_type_lora";
        hca_currently_covered = "hca_currently_covered";
        suppress_counting_activate_now = "suppress_counting_activate_now";
        radio_encryption_enabled = "radio_encryption_enabled";
        wmbus_frame_short = "wmbus_frame_short";
        wmbus_frame_long = "wmbus_frame_long";
        start_counting_date_not_yet_exceeded = "start_counting_date_not_yet_exceeded";
        no_state_parameters = "no_state_parameters";

        totalizerHeatingStoredAtSetDay = "totalizer_heating_at_set_day";
        stateOfParameters = "state_of_parameters";
        fabricationNumber = "fabrication_number";
        currentDateAndTime = "date_and_time";
        daylightSavingTime = "daylight_saving_time";
        dateAndTimeValid = "valid_date_and_time";
        detailedErrors = "detailed_errors";
        radiatorMaxTempPrevPeriod = "radiator_max_temperature_previous_period";
        radiatorMaxTempCurrPeriod = "radiator_max_temperature_current_period";
        setDay = "set_day";
        internalVersion = "internal_version";
        radiatorTemperature = "radiator_temperature";
        lowTemperature = "low_temperature";
        fraudDuration = "fraud_duration";
        dateOfLastFraud = "date_of_last_fraud";
        commissioningDate = "commissioning_date";
        unitsFactorKc = "units_factor_kc";
        unitsFactorKq = "units_factor_kq";
        fraudCounter = "fraud_counter";
        totalizerHeating = "totalizer_heating";
        ambientTemperature = "ambient_temperature";
    }
}

if (typeof exports !== 'undefined') { exports.decodeUplink = decodeUplink; }
