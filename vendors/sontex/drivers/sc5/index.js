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


  File:     ParserSC5.js
  Version:  1.2

  Description:
    This js script parses the SC5 M-Bus LoRaWAN frames to make it readable.

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
var deviceType;                     //  DeviceType-0-0-0-0
var versionOfMeter;                 //  Version-0-0-0-0
var fabricationNumber;              //  FabricationNumber-0-0-0-0
var currentDateAndTime;             //  DateAndTime-0-0-0-0
var flow;                           //  VolumeFlow-0-0-0-0 (B & H)
var power;                          //  Power-0-0-0-0 (B & H)
var energyTotalizerTariff0          //  Energy-0-0-0-0
var volumeTotalizerTariff0          //  Volume-0-0-0-0
var energyTotalizerTariff1          //  Energy-0-1-0-0
var volumeTotalizerTariff1          //  Volume-0-1-0-0
var energyTotalizerTariff2          //  Energy-0-2-0-0
var volumeTotalizerTariff2          //  Volume-0-2-0-0
var highTemperature;                //  FlowTemperature-0-0-0-0 (B & H)
var lowTemperature;                 //  ReturnTemperature-0-0-0-0 (B & H)
var detailedErrors;                 //  ManufacturerErrorFlags-0-0-0-0
var counterIn1Totalizer;            //  Dimensionless-1-0-0-0, Volume-1-0-0-0, Energy-1-0-0-0
var counterIn2Totalizer;            //  Dimensionless-2-0-0-0, Volume-2-0-0-0, Energy-2-0-0-0
var counterIn1Identification;       //  IdentificationNumber-1-0-0-0
var counterIn2Identification;       //  IdentificationNumber-2-0-0-0
var setDay;                         //  Date-0-0-1-0
var energyTotalizerTariff0AtSetDay; //  Energy-0-0-1-0
var energyTotalizerTariff1AtSetDay; //  Energy-0-1-1-0
var counterIn1DeviceType;           //  DeviceType-1-0-0-0
var counterIn2DeviceType;           //  DeviceType-2-0-0-0

var ref1_error_ad;
var ref2_error_ad;
var flow_in_saturation;
var application_error_unknown_field_c;
var application_error_unknown_field_ci;
var application_error_unknown_record;
var application_error_access_right;
var application_error_record_size;
var application_error_record_value;
var application_error_bad_password;
var no_error_flags;
var volumeTotalizer;
var daylightSavingTime;
var dateAndTimeValid;
var volumeTotalizerAtSetDay;
var radio_error;
var firmware_checksum_error;
var module_2_error;
var module_1_error;
var main_power_cut;
var case_is_open;
var sum_of_all_temperatures_and_ad;
var temperature_2_above_max;
var temperature_2_below_min;
var temperature_1_above_max;
var temperature_1_below_min;
var pt_sensor_2_ad;
var pt_sensor_1_ad;

var decoded = {};
// Supported languages: raw, en, de
var language = "raw";

// Defines if units are appended directly to the value:
// true: 42 kWh
// or stored in an object:
// false: { value: 42, unit: kWh }
var appendUnits = false;

function decodeUplink(input) {
    // TODO: [x] Check codings
    // TODO: [x] Check max number of decimal points
    //      - With resolution 0.001 --> 3, 0.01 --> 2, 0.1 --> 1, 1 --> 0
    //      - Without resolution --> 2
    // TODO: [x] Check spelling of tarrif / tariff
    // TODO: [x] Counter IDs (wrong codec?)
    // TODO: [x] Counter device types (should not be in a list)
    // TODO: [x] Power OMS (0x04 0x2B) no unit and precision (should be kW with 3 decimal points)

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
            case 0x02:
                var key = bytes[i++];
                switch (key) {
                    case 0x59:
                        dataBytes.push(bytes[i++]);
                        dataBytes.push(bytes[i++]);
                        unit = " °C"
                        multiplier = 0.01
                        decoded[highTemperature] = formatUnit((getValueCodingB(dataBytes) * multiplier).toFixed(getNumberOfDigits(multiplier)), unit);
                        break;
                    case 0x5D:
                        dataBytes.push(bytes[i++]);
                        dataBytes.push(bytes[i++]);
                        unit = " °C"
                        multiplier = 0.01
                        decoded[lowTemperature] = formatUnit((getValueCodingB(dataBytes) * multiplier).toFixed(getNumberOfDigits(multiplier)), unit);
                        break;
                    case 0xFF:
                        byte = bytes[i++];
                        if (byte === 0x59) {
                        dataBytes.push(bytes[i++]);
                        dataBytes.push(bytes[i++]);
                        // NOTE: Specification is wrong (coding D) real coding is coding C
                        // NOTE: We do not use any codec here but use directly the byte value
                        decoded[deviceType] = formatUnit((dataBytes[0]), unit);
                        // is coding C
                        decoded[versionOfMeter] = formatUnit((dataBytes[1]), unit);
                    }
                        break;
                    default:
                }
                break;
            case 0x03:
                byte = bytes[i++];
                if (byte === 0xFF) {
                    var byte2 = bytes[i++];
                    if (byte2 === 0x2C) {
                        dataBytes.push(bytes[i++]);
                        dataBytes.push(bytes[i++]);
                        dataBytes.push(bytes[i++]);
                        decoded[detailedErrors] = getErrorFlags(dataBytes);
                    }
                }
                break;
            case 0x04:
                var energyOrVolume = getEnergyOrVolume(bytes[i], bytes[i+1], bytes[i+2]);

                // Check if we have energy or volume
                if (energyOrVolume && energyOrVolume.length === 4) {
                    // Set multiplier and unit
                    multiplier = energyOrVolume[0]
                    unit = energyOrVolume[1]

                    // Fill unitKeys
                    for (var j = 0; j < energyOrVolume[2]; j++) {
                        unitKeys.push(bytes[i++]);
                    }

                    // Push data bytes
                    dataBytes.push(bytes[i++]);
                    dataBytes.push(bytes[i++]);
                    dataBytes.push(bytes[i++]);
                    dataBytes.push(bytes[i++]);

                    // See if we got a volume
                    if (energyOrVolume[3] === "vo") {
                        decoded[volumeTotalizerTariff0] = formatUnit((getValueCodingB(dataBytes) * multiplier).toFixed(getNumberOfDigits(multiplier)), unit);
                    }

                    if (energyOrVolume[3] === "en") {
                        decoded[energyTotalizerTariff0] = formatUnit((getValueCodingB(dataBytes) * multiplier).toFixed(getNumberOfDigits(multiplier)), unit);
                    }
                } else {
                    var key = bytes[i++];
                    if (key === 0x39 || key === 0x2B || key === 0x6D) {
                        dataBytes.push(bytes[i++]);
                        dataBytes.push(bytes[i++]);
                        dataBytes.push(bytes[i++]);
                        dataBytes.push(bytes[i++]);

                        switch (key) {
                            case 0x2B:
                                multiplier = 1
                                unit = " W"
                                decoded[power] = formatUnit((getValueCodingB(dataBytes) * multiplier).toFixed(getNumberOfDigits(multiplier)), unit);
                                break;
                            case 0x39:
                                multiplier = 0.01
                                unit = " l/h"
                                decoded[flow] = formatUnit((getValueCodingB(dataBytes) * multiplier).toFixed(getNumberOfDigits(multiplier)), unit);
                                break;
                            case 0x6D:
                                decoded[currentDateAndTime] = formatUnit(getValueCodingF(dataBytes), "");
                                break;
                        }
                    }
                }
                break;
            case 0x05:
                var key = bytes[i++];
                dataBytes.push(bytes[i++]);
                dataBytes.push(bytes[i++]);
                dataBytes.push(bytes[i++]);
                dataBytes.push(bytes[i++]);
                switch (key) {
                    case 0x2B:
                        multiplier = 1
                        unit = " W"
                        decoded[power] = formatUnit((getValueCodingH(dataBytes) * multiplier).toFixed(getNumberOfDigits(multiplier)), unit);
                        break;
                    case 0x5B:
                        multiplier = 1
                        unit = " °C"
                        decoded[highTemperature] = formatUnit((getValueCodingH(dataBytes) * multiplier).toFixed(2), unit);
                        break;
                    case 0x5F:
                        multiplier = 1
                        unit = " °C"
                        decoded[lowTemperature] = formatUnit((getValueCodingH(dataBytes) * multiplier).toFixed(2), unit);
                        break;
                    case 0x3E:
                        multiplier = 1
                        unit = " m3/h"
                        decoded[flow] = formatUnit((getValueCodingH(dataBytes) * multiplier).toFixed(2), unit);
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
                    decoded[fabricationNumber] = formatUnit(getValueCodingA(dataBytes), unit);
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
            case 0x44:
                var energyOrVolume = getEnergyOrVolume(bytes[i], bytes[i+1], bytes[i+2]);

                // Check if we have energy or volume
                if (energyOrVolume && energyOrVolume.length === 4) {
                    // Set multiplier and unit
                    multiplier = energyOrVolume[0]
                    unit = energyOrVolume[1]

                    // Fill unitKeys
                    for (var j = 0; j < energyOrVolume[2]; j++) {
                        unitKeys.push(bytes[i++]);
                    }

                    // Push data bytes
                    dataBytes.push(bytes[i++]);
                    dataBytes.push(bytes[i++]);
                    dataBytes.push(bytes[i++]);
                    dataBytes.push(bytes[i++]);


                    decoded[energyTotalizerTariff0AtSetDay] = formatUnit((getValueCodingB(dataBytes) * multiplier).toFixed(getNumberOfDigits(multiplier)), unit);
                }
                break;
            case 0x81:
                var secondIdentifier = bytes[i++];
                switch (secondIdentifier) {
                    case 0x40:
                        var byte = bytes[i++];
                        var byte2 = bytes[i++];
                        if (byte === 0xFD && byte2 === 0x09) {
                            dataBytes.push(bytes[i++]);
                            decoded[counterIn1DeviceType] = formatUnit(dataBytes[0], unit);
                        }
                        break;
                    case 0x80:
                        var byte = bytes[i++];
                        var byte2 = bytes[i++];
                        var byte3 = bytes[i++];
                        if (byte === 0x40 && byte2 === 0xFD && byte3 === 0x09) {
                            dataBytes.push(bytes[i++]);
                            decoded[counterIn2DeviceType] = formatUnit((dataBytes[0]), unit);
                        }
                }
                break;
            case 0x84:
                var secondIdentifier = bytes[i++];
                switch (secondIdentifier) {
                    case 0x10:
                        var energyOrVolume = getEnergyOrVolume(bytes[i], bytes[i+1], bytes[i+2]);

                        // Check if we have energy or volume
                        if (energyOrVolume && energyOrVolume.length === 4) {
                            // Set multiplier and unit
                            multiplier = energyOrVolume[0]
                            unit = energyOrVolume[1]
                            // Fill unitKeys
                            for (var j = 0; j < energyOrVolume[2]; j++) {
                                unitKeys.push(bytes[i++]);
                            }

                            // Push data bytes
                            dataBytes.push(bytes[i++]);
                            dataBytes.push(bytes[i++]);
                            dataBytes.push(bytes[i++]);
                            dataBytes.push(bytes[i++]);

                            // See if we got a volume
                            if (energyOrVolume[3] === "vo") {
                                decoded[volumeTotalizerTariff1] = formatUnit((getValueCodingB(dataBytes) * multiplier).toFixed(getNumberOfDigits(multiplier)), unit);
                            }

                            if (energyOrVolume[3] === "en") {
                                decoded[energyTotalizerTariff1] = formatUnit((getValueCodingB(dataBytes) * multiplier).toFixed(getNumberOfDigits(multiplier)), unit);
                            }
                        }
                        break;
                    case 0x20:
                        var energyOrVolume = getEnergyOrVolume(bytes[i], bytes[i+1], bytes[i+2]);

                        // Check if we have energy or volume
                        if (energyOrVolume && energyOrVolume.length === 4) {
                            // Set multiplier and unit
                            multiplier = energyOrVolume[0]
                            unit = energyOrVolume[1]

                            // Fill unitKeys
                            for (var j = 0; j < energyOrVolume[2]; j++) {
                                unitKeys.push(bytes[i++]);
                            }

                            // Push data bytes
                            dataBytes.push(bytes[i++]);
                            dataBytes.push(bytes[i++]);
                            dataBytes.push(bytes[i++]);
                            dataBytes.push(bytes[i++]);

                            // See if we got a volume
                            if (energyOrVolume[3] === "vo") {
                                decoded[volumeTotalizerTariff2] = formatUnit((getValueCodingB(dataBytes) * multiplier).toFixed(getNumberOfDigits(multiplier)), unit);
                            }

                            if (energyOrVolume[3] === "en") {
                                decoded[energyTotalizerTariff2] = formatUnit((getValueCodingB(dataBytes) * multiplier).toFixed(getNumberOfDigits(multiplier)), unit);
                            }
                        }
                        break;
                    case 0x40:
                        var energyOrVolume = getEnergyOrVolume(bytes[i], bytes[i+1], bytes[i+2]);

                        // Check if we have energy or volume
                        if (energyOrVolume && energyOrVolume.length === 4) {
                            // Set multiplier and unit
                            multiplier = energyOrVolume[0]
                            unit = energyOrVolume[1]

                            // Fill unitKeys
                            for (var j = 0; j < energyOrVolume[2]; j++) {
                                unitKeys.push(bytes[i++]);
                            }

                            // Push data bytes
                            dataBytes.push(bytes[i++]);
                            dataBytes.push(bytes[i++]);
                            dataBytes.push(bytes[i++]);
                            dataBytes.push(bytes[i++]);

                            decoded[counterIn1Totalizer] = formatUnit((getValueCodingB(dataBytes) * multiplier).toFixed(getNumberOfDigits(multiplier)), unit);
                        }
                    break;
                    case 0x80:
                        var thirdIdentifier = bytes[i++];
                        switch (thirdIdentifier){
                            case 0x40:
                                var energyOrVolume = getEnergyOrVolume(bytes[i], bytes[i+1], bytes[i+2]);

                                // Check if we have energy or volume
                                if (energyOrVolume && energyOrVolume.length === 4) {
                                    // Set multiplier and unit
                                    multiplier = energyOrVolume[0]
                                    unit = energyOrVolume[1]

                                    // Fill unitKeys
                                    for (var j = 0; j < energyOrVolume[2]; j++) {
                                        unitKeys.push(bytes[i++]);
                                    }

                                    // Push data bytes
                                    dataBytes.push(bytes[i++]);
                                    dataBytes.push(bytes[i++]);
                                    dataBytes.push(bytes[i++]);
                                    dataBytes.push(bytes[i++]);

                                    decoded[counterIn2Totalizer] = formatUnit((getValueCodingB(dataBytes) * multiplier).toFixed(getNumberOfDigits(multiplier)), unit);
                                }
                        }
                }
                break;
            case 0x8C:
                var secondIdentifier = bytes[i++];
                switch (secondIdentifier) {
                    case 0x40:
                        var byte = bytes[i++];
                        if (byte === 0x79) {
                            dataBytes.push(bytes[i++]);
                            dataBytes.push(bytes[i++]);
                            dataBytes.push(bytes[i++]);
                            dataBytes.push(bytes[i++]);
                            decoded[counterIn1Identification] = formatUnit((getValueCodingA(dataBytes) * multiplier), unit);
                        }
                        break;
                    case 0x80:
                        var byte = bytes[i++];
                        var byte2 = bytes[i++];
                        if (byte === 0x40 && byte2 === 0x79) {
                            dataBytes.push(bytes[i++]);
                            dataBytes.push(bytes[i++]);
                            dataBytes.push(bytes[i++]);
                            dataBytes.push(bytes[i++]);
                            decoded[counterIn2Identification] = formatUnit((getValueCodingA(dataBytes) * multiplier), unit);
                        }
                }
                break;
            case 0xC4:
                var byte = bytes[i++];
                if (byte === 0x10) {
                    var energyOrVolume = getEnergyOrVolume(bytes[i], bytes[i+1], bytes[i+2]);

                    // Check if we have energy or volume
                    if (energyOrVolume && energyOrVolume.length === 4) {
                        // Set multiplier and unit
                        multiplier = energyOrVolume[0]
                        unit = energyOrVolume[1]

                        // Fill unitKeys
                        for (var j = 0; j < energyOrVolume[2]; j++) {
                            unitKeys.push(bytes[i++]);
                        }

                        // Push data bytes
                        dataBytes.push(bytes[i++]);
                        dataBytes.push(bytes[i++]);
                        dataBytes.push(bytes[i++]);
                        dataBytes.push(bytes[i++]);

                        decoded[energyTotalizerTariff1AtSetDay] = formatUnit((getValueCodingB(dataBytes) * multiplier).toFixed(getNumberOfDigits(multiplier)), unit);
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

function getMultiplier(key1, key2, key3) {
    switch (key1) {
        case 0x03: // 0.001 kWh
        case 0x06: // 0.001 MWh
        case 0x0B: // 0.001 MJ
        case 0x10: // 0.001 L
        case 0x13: // 0.001 m³
            return 0.001;
        case 0x04: // 0.01 kWh
        case 0x07: // 0.01 MWh
        case 0x0C: // 0.01 MJ
        case 0x0F: // 0.01 GJ
        case 0x11: // 0.01 L
        case 0x14: // 0.01 m³
            return 0.01;
        case 0x05: // 0.1 kWh
        case 0x0D: // 0.1 MJ
        case 0x12: // 0.1 L
            return 0.1;
        case 0x0E: // 1 MJ
        case 0x16: // 1 m³
        case 0xFD: // 1 without unit
            return 1;
        case 0x80: // 0.001 kBtu
        case 0x83: // 0.001 MBtu
        case 0x90: // 0.001 gal
        case 0x93: // 0.001 kgal
            switch (key2) {
                case 0x3D:
                    return 0.001;
            }
            break;
        case 0x81: // 0.01 kBtu
        case 0x84: // 0.01 MBtu
        case 0x91: // 0.01 gal
        case 0x94: // 0.01 kgal
        case 0x85:
            switch (key2) {
                case 0x3D:
                case 0x7D:
                    return 0.01;
            }
            break;
        case 0x82: // 0.1 kBtu
        case 0x92: // 0.1 gal
        case 0x95: // 0.1 kgal
            switch (key2) {
                case 0x3D:
                    return 0.1;
            }
            break;
        case 0x86: // 1 MBtu
        case 0x96: // 1 kgal
        case 0xFB: // 1 MWh
            switch (key2) {
                case 0x01:
                case 0x3D:
                    return 1;
                case 0x08: // 0.1 GJ
                    return 0.1;
                case 0x09: // 1 GJ
                    return 1;
                case 0x8C:
                    switch (key3) {
                        case 0x74: // 0.001 Mcal
                            return 0.001;
                        case 0x75: // 0.01 Mcal
                            return 0x01
                    }
                break;
                case 0x0C: // 0.1 Mcal
                    return 0.1;
                case 0x0D: // 1 Mcal
                    return 1;
                case 0x0E: // 0.01 Gcal
                    return 0.01;
                case 0x0F: // 0.1 Gcal
                    return 0.1;
                case 0x8D:
                    switch (key3) {
                        case 0x7D: // 1 Gcal
                            return 1;
                    }
            }
            break;
    }
}

function getUnit(key1, key2) {
    switch (key1) {
        case 0x03: // 0.001 kWh
        case 0x04: // 0.01 kWh
        case 0x05: // 0.1 kWh
        case 0x06: // 1 kWh
            return " kWh";
        case 0x07: // 0.01 MWh
            return " MWh";
        case 0x0B: // 0.001 MJ
        case 0x0C: // 0.01 MJ
        case 0x0D: // 0.1 MJ
        case 0x0E: // 1 MJ
            return " MJ";
        case 0x0F: // 0.01 GJ
            return " GJ";
        case 0x10: // 0.001 L
        case 0x11: // 0.01 L
        case 0x12: // 0.1 L
        case 0x13: // 1 L
            return " L";
        case 0x14: // 0.01 m³
        case 0x15: // 0.1 m³
        case 0x16: // 1 m³
            return " m³";
        case 0x80: // 0.001 kBtu
        case 0x81: // 0.01 kBtu
        case 0x82: // 0.1 kBtu
        case 0x83: // 1 kBtu
            switch (key2) {
                case 0x3D:
                    return " kBtu";
            }
            break;
        case 0x85:
            switch (key2) {
                case 0x3D: // 1 MBtu
                    return " MBtu";
                case 0x7D: // 0.1 MWh
                    return " MWh";
            }
            break;
        case 0x84: // 0.01 MBtu
        case 0x86: // 1 MBtu
            switch (key2) {
                case 0x3D:
                    return " MBtu";
            }
            break;
        case 0x90: // 0.001 gal
        case 0x91: // 0.01 gal
        case 0x92: // 0.1 gal
        case 0x93: // 1 gal
            switch (key2) {
                case 0x3D:
                    return " gal";
            }
            break;
        case 0x94: // 0.01 kgal
        case 0x95: // 0.1 kgal
        case 0x96: // 1 kgal
            switch (key2) {
                case 0x3D:
                    return " kgal";
            }
            break;
        case 0xFB:
            switch (key2) {
                case 0x01: // 1 MWh
                    return " MWh";
                case 0x08: // 0.1 GJ
                case 0x09: // 1 GJ
                    return " GJ";
                case 0x8C:
                case 0x0C:
                    return " Mcal";
                case 0x0D:
                case 0x0E:
                case 0x0F:
                case 0x8D:
                    return " Gcal";
            }
            if (key2 === 0x01) {
                return " MWh";
            }
            break;
        case 0xFD: // 1 without unit
            return "";
    }
}

function getEnergyOrVolume(b1, b2, b3) {
    // Return multiplier and unit
    switch (b1) {
        case 0x03:
        case 0x04:
        case 0x05:
        case 0x06:
        case 0x07:
        case 0x0B:
        case 0x0C:
        case 0x0D:
        case 0x0E:
        case 0x0F:
            return [getMultiplier(b1), getUnit(b1), 1, "en"];
        case 0x10:
        case 0x11:
        case 0x12:
        case 0x13:
        case 0x14:
        case 0x15:
        case 0x16:
            return [getMultiplier(b1), getUnit(b1), 1, "vo"];
        case 0x80:
        case 0x81:
        case 0x82:
        case 0x83:
        case 0x84:
        case 0x85:
        case 0x86:
            return [getMultiplier(b1, b2), getUnit(b1, b2), 2, "en"];
        case 0x90:
        case 0x91:
        case 0x92:
        case 0x93:
        case 0x94:
        case 0x95:
        case 0x96:
            return [getMultiplier(b1, b2), getUnit(b1, b2), 2, "vo"];
        case 0xFB:
            switch (b2) {
                case 0x01:
                case 0x08:
                case 0x09:
                    return [getMultiplier(b1, b2), getUnit(b1, b2), 2, "en"];
                case 0x0C:
                case 0x0D:
                case 0x0E:
                case 0x0F:
                    return [getMultiplier(b1, b2), getUnit(b1, b2), 2, "en"];
                case 0x8C:
                case 0x8D:
                    return [getMultiplier(b1, b2, b3), getUnit(b1, b2, b3), 3, "en"]
            }
            break;
        case 0xFD:
            switch (b2) {
                case 0xBA:
                    switch (b3) {
                        case 0x73:
                            return [0.001, "", 3, "dl"];
                        case 0x74:
                            return [0.01, "", 3, "dl"];
                        case 0x75:
                            return [0.1, "", 3, "dl"];
                    }
                    break;
                case 0x3A:
                    return [1, "", 2, "dl"];
            }

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
            return (0)
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
    // NOTE: might should be set to 0 (instead of 99) if year is greater than 100
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
    return day + "." + month + "." + year
}

function getErrorFlags(bytes) {
    // getBinaryString returns string as it would be printed out, bit0 is at the
    // last position. The string is therefore first reversed so that character positions
    // match directly the bit positions in the documentation.
    var binary = getBinaryString(bytes).split("").reverse().join("");
    var flags = [];
    if (binary.charAt(22) === "1") flags.push(application_error_bad_password);
    if (binary.charAt(21) === "1") flags.push(application_error_record_value);
    if (binary.charAt(20) === "1") flags.push(application_error_record_size);
    if (binary.charAt(19) === "1") flags.push(application_error_access_right);
    if (binary.charAt(18) === "1") flags.push(application_error_unknown_record);
    if (binary.charAt(17) === "1") flags.push(application_error_unknown_field_ci);
    if (binary.charAt(16) === "1") flags.push(application_error_unknown_field_c);
    if (binary.charAt(15) === "1") flags.push(radio_error);
    if (binary.charAt(14) === "1") flags.push(firmware_checksum_error);
    if (binary.charAt(13) === "1") flags.push(module_2_error);
    if (binary.charAt(12) === "1") flags.push(module_1_error);
    if (binary.charAt(11) === "1") flags.push(main_power_cut);
    if (binary.charAt(10) === "1") flags.push(case_is_open);
    if (binary.charAt(9) === "1") flags.push(flow_in_saturation);
    if (binary.charAt(8) === "1") flags.push(sum_of_all_temperatures_and_ad);
    if (binary.charAt(7) === "1") flags.push(temperature_2_above_max);
    if (binary.charAt(6) === "1") flags.push(temperature_2_below_min);
    if (binary.charAt(5) === "1") flags.push(temperature_1_above_max);
    if (binary.charAt(4) === "1") flags.push(temperature_1_below_min);
    if (binary.charAt(3) === "1") flags.push(pt_sensor_2_ad);
    if (binary.charAt(2) === "1") flags.push(pt_sensor_1_ad);
    if (binary.charAt(1) === "1") flags.push(ref2_error_ad);
    if (binary.charAt(0) === "1") flags.push(ref1_error_ad);
    if (flags.length === 0) {
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

        // Error flags
        application_error_bad_password = "application_error_bad_password";
        application_error_record_value = "application_error_record_value";
        application_error_record_size = "application_error_record_size";
        application_error_access_right = "no_access_rights_available";
        application_error_unknown_record = "application_error_unknown_record";
        application_error_unknown_field_ci = "application_error_unknown_field_ci";
        application_error_unknown_field_c = "application_error_unknown_field_c";
        radio_error = "radio_error";
        firmware_checksum_error = "firmware_checksum_error";
        module_2_error = "module_2_error";
        module_1_error = "module_1_error";
        main_power_cut = "main_power_cut";
        case_is_open = "case_is_open";
        flow_in_saturation = "Durchfluss ist in Sättigung";
        sum_of_all_temperatures_and_ad = "sum_of_all_temperatures_and_ad";
        temperature_2_above_max = "temperature_2_above_max";
        temperature_2_below_min = "temperature_2_below_min";
        temperature_1_above_max = "temperature_1_above_max";
        temperature_1_below_min = "temperature_1_below_min";
        pt_sensor_2_ad = "pt_sensor_2_ad";
        pt_sensor_1_ad = "pt_sensor_1_ad";
        ref2_error_ad = "ref2_error_ad";
        ref1_error_ad = "ref1_error_ad";
        no_error_flags = "Keine Fehler vorhanden";

        // Hardcoded payload fields
        deviceType = "deviceType";
        versionOfMeter = "versionOfMeter";
        fabricationNumber = "Fabrikationsnummer";

        // Payload fields
        currentDateAndTime = "Datum und Zeit";
        flow = "Durchfluss";
        power = "Leistung";
        energyTotalizerTariff0 = "energyTotalizerTariff0";
        volumeTotalizerTariff0 = "volumeTotalizerTariff0";
        energyTotalizerTariff1 = "energyTotalizerTariff1";
        volumeTotalizerTariff1 = "volumeTotalizerTariff1";
        energyTotalizerTariff2 = "energyTotalizerTariff2";
        volumeTotalizerTariff2 = "volumeTotalizerTariff2";
        highTemperature = "Temperatur hoch";
        lowTemperature = "Temperatur tief";
        detailedErrors = "Fehlermeldungen";
        counterIn1Totalizer = "counterIn1Totalizer";
        counterIn2Totalizer = "counterIn2Totalizer";
        counterIn1Identification = "counterIn1Identification";
        counterIn2Identification = "counterIn2Identification";
        setDay = "Stichtag";
        energyTotalizerTariff0AtSetDay = "energyTotalizerTariff0AtSetDay";
        energyTotalizerTariff1AtSetDay = "energyTotalizerTariff1AtSetDay";
        counterIn1DeviceType = "counterIn1DeviceType";
        counterIn2DeviceType = "counterIn2DeviceType";

        // Additional date fields
        daylightSavingTime = "Sommerzeit";
        dateAndTimeValid = "Datum und Zeit valide";
    }
    if (language === "en") {
        // Error flags
        application_error_bad_password = "application_error_bad_password";
        application_error_record_value = "application_error_record_value";
        application_error_record_size = "application_error_record_size";
        application_error_access_right = "no_access_rights_available";
        application_error_unknown_record = "application_error_unknown_record";
        application_error_unknown_field_ci = "application_error_unknown_field_ci";
        application_error_unknown_field_c = "application_error_unknown_field_c";
        radio_error = "radio_error";
        firmware_checksum_error = "firmware_checksum_error";
        module_2_error = "module_2_error";
        module_1_error = "module_1_error";
        main_power_cut = "main_power_cut";
        case_is_open = "case_is_open";
        flow_in_saturation = "Flow is in saturation";
        sum_of_all_temperatures_and_ad = "sum_of_all_temperatures_and_ad";
        temperature_2_above_max = "temperature_2_above_max";
        temperature_2_below_min = "temperature_2_below_min";
        temperature_1_above_max = "temperature_1_above_max";
        temperature_1_below_min = "temperature_1_below_min";
        pt_sensor_2_ad = "pt_sensor_2_ad";
        pt_sensor_1_ad = "pt_sensor_1_ad";
        ref2_error_ad = "ref2_error_ad";
        ref1_error_ad = "ref1_error_ad";
        no_error_flags = "No errors present";

        // Hardcoded payload fields
        deviceType = "deviceType";
        versionOfMeter = "versionOfMeter";
        fabricationNumber = "Fabrication number";

        // Payload fields
        currentDateAndTime = "Date and time";
        flow = "Flow";
        power = "Power";
        energyTotalizerTariff0 = "energyTotalizerTariff0";
        volumeTotalizerTariff0 = "volumeTotalizerTariff0";
        energyTotalizerTariff1 = "energyTotalizerTariff1";
        volumeTotalizerTariff1 = "volumeTotalizerTariff1";
        energyTotalizerTariff2 = "energyTotalizerTariff2";
        volumeTotalizerTariff2 = "volumeTotalizerTariff2";
        highTemperature = "High temperature";
        lowTemperature = "Low temperature";
        detailedErrors = "Detailed errors";
        counterIn1Totalizer = "counterIn1Totalizer";
        counterIn2Totalizer = "counterIn2Totalizer";
        counterIn1Identification = "counterIn1Identification";
        counterIn2Identification = "counterIn2Identification";
        setDay = "Target day";
        energyTotalizerTariff0AtSetDay = "energyTotalizerTariff0AtSetDay";
        energyTotalizerTariff1AtSetDay = "energyTotalizerTariff1AtSetDay";
        counterIn1DeviceType = "counterIn1DeviceType";
        counterIn2DeviceType = "counterIn2DeviceType";

        // Additional date fields
        daylightSavingTime = "Daylight saving time";
        dateAndTimeValid = "Valid Date and time";
    }
    if (language === "raw") {
        // Error flags
        application_error_bad_password = "application_error_bad_password";
        application_error_record_value = "application_error_record_value";
        application_error_record_size = "application_error_record_size";
        application_error_access_right = "no_access_rights_available";
        application_error_unknown_record = "application_error_unknown_record";
        application_error_unknown_field_ci = "application_error_unknown_field_ci";
        application_error_unknown_field_c = "application_error_unknown_field_c";
        radio_error = "radio_error";
        firmware_checksum_error = "firmware_checksum_error";
        module_2_error = "module_2_error";
        module_1_error = "module_1_error";
        main_power_cut = "main_power_cut";
        case_is_open = "case_is_open";
        flow_in_saturation = "flow_is_in_saturation";
        sum_of_all_temperatures_and_ad = "sum_of_all_temperatures_and_ad";
        temperature_2_above_max = "temperature_2_above_max";
        temperature_2_below_min = "temperature_2_below_min";
        temperature_1_above_max = "temperature_1_above_max";
        temperature_1_below_min = "temperature_1_below_min";
        pt_sensor_2_ad = "pt_sensor_2_ad";
        pt_sensor_1_ad = "pt_sensor_1_ad";
        ref2_error_ad = "ref2_error_ad";
        ref1_error_ad = "ref1_error_ad";
        no_error_flags = "no_errors_present";

        // Hardcoded payload fields
        deviceType = "deviceType";
        versionOfMeter = "versionOfMeter";
        fabricationNumber = "fabrication_number";

        // Payload fields
        currentDateAndTime = "date_and_time";
        flow = "flow";
        power = "power";
        energyTotalizerTariff0 = "energyTotalizerTariff0";
        volumeTotalizerTariff0 = "volumeTotalizerTariff0";
        energyTotalizerTariff1 = "energyTotalizerTariff1";
        volumeTotalizerTariff1 = "volumeTotalizerTariff1";
        energyTotalizerTariff2 = "energyTotalizerTariff2";
        volumeTotalizerTariff2 = "volumeTotalizerTariff2";
        highTemperature = "high_temperature";
        lowTemperature = "low_temperature";
        detailedErrors = "detailed_errors";
        counterIn1Totalizer = "counterIn1Totalizer";
        counterIn2Totalizer = "counterIn2Totalizer";
        counterIn1Identification = "counterIn1Identification";
        counterIn2Identification = "counterIn2Identification";
        setDay = "target_day";
        energyTotalizerTariff0AtSetDay = "energyTotalizerTariff0AtSetDay";
        energyTotalizerTariff1AtSetDay = "energyTotalizerTariff1AtSetDay";
        counterIn1DeviceType = "counterIn1DeviceType";
        counterIn2DeviceType = "counterIn2DeviceType";

        // Additional date fields
        daylightSavingTime = "daylight_saving_time";
        dateAndTimeValid = "valid_date_and_time";
    }
}

if (typeof exports !== 'undefined') { exports.decodeUplink = decodeUplink; }
