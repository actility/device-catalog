 /*
 * Payload Decoder LoRa Alliance for AIR+ (X850), AIR (X845)
 * Copyright 2025 Nexelec
 * Version : 1.0.2
 *
 * For a BMS integration (one numeric type per field) use BMS/decoderAir+_BMS.js.
 *
 * Changes in 1.0.2:
 * - measurement errors return a string again, as in 1.0.0: coConcentration 1023 = "Error",
 *   temperature 1022 = "Sensor not present", 1023 = "Error",
 *   relativeHumidity 254 = "Sensor not present", 255 = "Error"
 *   (the numeric error value of 1.0.1 is kept in BMS/decoderAir+_BMS.js only)
 * - remainingProductLifetime: "Value" renamed to "value", like every other measurement
 * - swRevision: label is now "V" + code x 0.1 for every code (e.g. 25 = V2.5)
 * - a payload shorter than 2 bytes returns "Payload too short" instead of "Unknown message type"
 *
 * Changes from 1.0.0 to 1.0.1:
 * - coConcentration, temperature and relativeHumidity errors returned the raw
 *   error code as {"value", "unit"} (reverted in 1.0.2)
 * - status and configuration fields stay English strings; unmapped codes
 *   return "Unknown" instead of undefined
 * - hushStatus: now "Not active"/"Active" instead of the hardware-fault labels
 * - regionSelection: value 0 now returns "RFU" instead of undefined
 * - removed the duplicated humidity() function (the first declaration was dead code)
 * - downlinkCounter: removed the wrong 1-bit shift (the 16-bit counter was halved)
 * - only the frame matching the message type is decoded
 * - unknown message type or truncated payload now returns "errors" (LoRa Alliance TS013)
 * - frame 0x04 (SAV Information) returns the product and message type
 * - no more implicit global variables, ES5 syntax only
 */

function decodeUplink(input) {

    var stringHex = bytesString(input.bytes);

    var octetTypeProduit = parseInt(stringHex.substring(0,2),16);
    var octetTypeMessage = parseInt(stringHex.substring(2,4),16);

    // Minimum payload length in bytes for each message type
    var frameLength = [6,5,7,11,2];

    if(input.bytes.length < 2)
    {
        return {"errors": ["Payload too short: " + input.bytes.length + " bytes, at least 2 expected"]};
    }
    if(octetTypeMessage >= frameLength.length)
    {
        return {"errors": ["Unknown message type"]};
    }
    if(input.bytes.length < frameLength[octetTypeMessage])
    {
        return {"errors": ["Payload too short for message type " + octetTypeMessage + ": " +
                            input.bytes.length + " bytes, " + frameLength[octetTypeMessage] + " expected"]};
    }

    var data = dataOutput(octetTypeMessage);
    return {"data": data};

    function bytesString(input){
        var bufferString='';
        var decToString='';

        for(var i=0; i<input.length;i++)
        {
            decToString = ('0' + input[i].toString(16)).slice(-2);
            bufferString=bufferString.concat(decToString);
        }
        return bufferString;
    }


    function dataOutput(octetTypeMessage)
    {
        switch(octetTypeMessage){
            case 0: return productStatusOutput(stringHex);
            case 1: return coAlarmStatusOutput(stringHex);
            case 2: return realTimeOutput(stringHex);
            case 3: return productConfigurationOutput(stringHex);
            case 4: return savInformationOutput();
        }
    }

    // Enumerated field: English label, "Unknown" when the code is not mapped
    function enumeration(table, index)
    {
        var label = table[index];
        if(label === undefined){return "Unknown"}
        return label;
    }

    function typeOfProduct(octetTypeProduit)
    {
        if(octetTypeProduit==0xAF){return "Air LoRa"}
        if(octetTypeProduit==0xAE){return "Air+ LoRa"}
        return "Unknown";
    }

    function typeOfMessage(octetTypeMessage)
    {

        var message_name =["Product Status","CO Alarm Status","Real Time","Product Function Configuration","SAV Information"]

        return enumeration(message_name, octetTypeMessage);
    }

    function iaqGlobalArgument(octetiaqGlobal)
    {

        var message_name =["Excellent","Good","Fair","Poor",
                            "Bad","Not used","Not used","Error"]

        return enumeration(message_name, octetiaqGlobal);
    }

    function iaqSourceArgument(octetiaqSource)
    {

        var message_name =["None","Dryness Indicator","Mould Indicator","Dust mites Indicator","CO",
                            "Reserved","Reserved","Reserved","Reserved","Reserved",
                            "Reserved","Reserved","Reserved","Reserved","Reserved","Error"]

        return enumeration(message_name, octetiaqSource);
    }

    function batterieLevelArgument(octetHCI)
    {

        var message_name =["High","Medium","Low","Critical"]

        return enumeration(message_name, octetHCI);
    }

    function productHwStatusArgument(octetProductHwStatus)
    {

        var message_name =["Hardware working correctly","Hardware fault detected"]

        return enumeration(message_name, octetProductHwStatus);
    }

    function active(octetActive)
    {
        var data=["Not active","Active"]
        return enumeration(data, octetActive);
    }

    function antiTear(octetaAntiTear)
    {
        var data=["No magnetic base detected","Magnetic base detected"]
        return enumeration(data, octetaAntiTear);
    }

    function reconfigurationSource(octetReconfigurationSource)
    {
        var data=["NFC","Applicative Downlink","Start-up product","Reserved",
                  "Reserved","Local","Reserved","Reserved"]
        return enumeration(data, octetReconfigurationSource);
    }

    function reconfigurationState(octetReconfigurationState)
    {
        var data=["Total success","Partial success","Total failure","Reserved"]
        return enumeration(data, octetReconfigurationState);
    }


    function nfcStatusConfiguration(nfcStatus)
    {
        var data=["Discoverable","Not Discoverable","RFU","RFU"]
        return enumeration(data, nfcStatus);
    }

    function hwRevision(octetHWRevision)
    {
        return "V" + ("00" + octetHWRevision).slice(-3);
    }

    function swRevision(octetSWRevision)
    {
        // label = V + code x 0.1 (e.g. 10 = V1.0)
        return "V" + (octetSWRevision / 10).toFixed(1);
    }

    function pendingJoin(octetPendingJoin)
    {
        var data=["No join request scheduled","Join request scheduled"]
        return enumeration(data, octetPendingJoin);
    }

    function co(octetCoConcentration)
    {
        if(octetCoConcentration==1023){return "Error"}
        else{return {"value":parseFloat(octetCoConcentration), "unit" :"ppm"}}
    }

    function testAlarm(octetTestAlarm)
    {
        var data=["Test Off","Product test is running"]
        return enumeration(data, octetTestAlarm);
    }

    function temperature(octetTemperatureValue)
    {
        if(octetTemperatureValue>=1023){return "Error"}
        if(octetTemperatureValue>=1022){return "Sensor not present"}
        else{return {"value":parseFloat(((octetTemperatureValue / 10) - 30).toFixed(2)), "unit":"°C"}}
    }

    function humidity(octetHumidityValue)
    {
        if(octetHumidityValue>=255){return "Error"}
        if(octetHumidityValue>=254){return "Sensor not present"}
        else{return {"value":parseFloat(((octetHumidityValue *0.5)).toFixed(2)), "unit" :"%RH"}}
    }

    function loraRegion(octetRegion)
    {
        if(octetRegion==1){return "EU"}
        return "RFU";
    }

    function deltaTemp(octetDeltaTemperature)
    {
        return {"value":parseFloat((octetDeltaTemperature*0.1 ).toFixed(2)), "unit":"°C" }
    }

    function deltaCo(octetDeltaCo)
    {
       return {"value":parseFloat(octetDeltaCo*5), "unit" :"ppm"}
    }

    function d2dPing(octetD2DPing)
    {
        var data=["Not compatible","Compatible"]
        return enumeration(data, octetD2DPing);
    }

    function period(octetPeriod)
    {
        return {"value":parseFloat(octetPeriod*10), "unit" :"min"}
    }

    function productStatusOutput(stringHex)
    {

        var hw_version = parseInt(stringHex.substring(4, 6), 16);
        var sw_version = parseInt(stringHex.substring(6, 8), 16);
        var rmg_lifetime = parseInt(stringHex.substring(8, 10), 16);

        var co_sensor_status = (parseInt(stringHex.substring(10, 11), 16) >> 3) & 0x01;
        var temp_sensor_status = (parseInt(stringHex.substring(10, 11), 16) >> 2) & 0x01;
        var memory_status = (parseInt(stringHex.substring(10, 11), 16) >> 1) & 0x01;
        var default_hush = (parseInt(stringHex.substring(10, 11), 16)) & 0x01;

        var battery_level = (parseInt(stringHex.substring(11, 12), 16) >> 2) & 0x03;
        var magnet_detection = (parseInt(stringHex.substring(11, 12), 16) >> 1) & 0x01;

        var data = { "typeOfProduct": typeOfProduct(octetTypeProduit),
        "typeOfMessage": typeOfMessage(octetTypeMessage),
        "hwRevision": hwRevision(hw_version),
        "swRevision": swRevision(sw_version),
        "remainingProductLifetime" : {"value":rmg_lifetime,"unit":"month"},
        "coSensorStatus": productHwStatusArgument(co_sensor_status),
        "tempHumSensorStatus": productHwStatusArgument(temp_sensor_status),
        "memoryFault":  productHwStatusArgument(memory_status),
        "hushStatus": active(default_hush),
        "energyStatus": batterieLevelArgument(battery_level),
        "magnetDetection": antiTear(magnet_detection)
        };
        return data;
    }

    function coAlarmStatusOutput(stringHex)
    {
        var co_concentration = (parseInt(stringHex.substring(4, 7), 16) >> 2) & 0x03FF;

        var co_pre_alarm = (parseInt(stringHex.substring(6, 7), 16) >> 1) & 0x01;
        var co_alarm = (parseInt(stringHex.substring(6, 7), 16)) & 0x01;
        var co_alarm_hush = (parseInt(stringHex.substring(7, 8), 16) >> 3) & 0x01;

        var co_product_test = (parseInt(stringHex.substring(7, 8), 16) >> 1) & 0x01;
        var time_since_last_test = (parseInt(stringHex.substring(8, 10), 16));


        var data = {"typeOfProduct": typeOfProduct(octetTypeProduit),
        "typeOfMessage": typeOfMessage(octetTypeMessage),
        "coConcentration": co(co_concentration),
        "preAlarm":active(co_pre_alarm),
        "localAlarm":active(co_alarm),
        "coAlarmHush":active(co_alarm_hush),
        "productTest":testAlarm(co_product_test),
        "timeSinceLastTest":{"value":time_since_last_test,"unit":"week"}
        };
        return data;
    }

    function realTimeOutput(stringHex)
    {
        var co_concentration = (parseInt(stringHex.substring(4, 8), 16) >> 6) & 0x03FF;
        var data_temperature = (parseInt(stringHex.substring(6, 9), 16)) & 0x3FF;
        var data_humidity = (parseInt(stringHex.substring(9, 11), 16)) & 0xFF;
        var izi_air_global = (parseInt(stringHex.substring(10, 12), 16) >> 1) & 0x07;
        var izi_air_src = (parseInt(stringHex.substring(11, 13), 16) >> 1) & 0x0F;

        var data = {"typeOfProduct": typeOfProduct(octetTypeProduit),
        "typeOfMessage": typeOfMessage(octetTypeMessage),
        "coConcentration": co(co_concentration),
        "temperature" : temperature(data_temperature),
        "relativeHumidity" : humidity(data_humidity),
        "iaqGlobal": iaqGlobalArgument(izi_air_global),
        "iaqSource": iaqSourceArgument(izi_air_src)
        };
        return data;
    }

    function productConfigurationOutput(stringHex)
    {
        var config_source = (parseInt(stringHex.substring(4, 5), 16) >> 1) & 0x07;
        var config_state = (parseInt(stringHex.substring(4, 6), 16) >> 3) & 0x03;
        var periodic_on_off = (parseInt(stringHex.substring(5, 6), 16) >> 2) & 0x01;
        var nfc_status = (parseInt(stringHex.substring(5, 6), 16)) & 0x03;
        var region_selection = (parseInt(stringHex.substring(6, 7), 16));

        var periodic_tx_period = (parseInt(stringHex.substring(7, 8), 16)) & 0x0F;

        var delta_temperature = (parseInt(stringHex.substring(8, 10), 16));
        var delta_co = (parseInt(stringHex.substring(10, 12), 16));

        var D2D_ID = (parseInt(stringHex.substring(12, 17), 16) >> 3) & 0x1FFFF;
        var D2D_ping = (parseInt(stringHex.substring(16, 17), 16) >> 2) & 0x1;
        var pending_join = (parseInt(stringHex.substring(16, 17), 16) >> 1) & 0x01;
        var downlink_counter = (parseInt(stringHex.substring(18, 22), 16)) & 0xFFFF;


        var data = {"typeOfProduct": typeOfProduct(octetTypeProduit),
        "typeOfMessage": typeOfMessage(octetTypeMessage),
        "reconfigurationSource": reconfigurationSource(config_source),
        "reconfigurationState": reconfigurationState(config_state),
        "realtimeStatus": active(periodic_on_off),
        "nfcStatus": nfcStatusConfiguration(nfc_status),
        "regionSelection":loraRegion(region_selection),
        "realtimePeriod":period(periodic_tx_period),
        "deltaTemperature":deltaTemp(delta_temperature),
        "deltaCO":deltaCo(delta_co),
        "d2dID":D2D_ID,
        "d2dPing":d2dPing(D2D_ping),
        "pendingJoin":pendingJoin(pending_join),
        "downlinkCounter":downlink_counter
        };
        return data;
    }

    function savInformationOutput()
    {
        var data = {"typeOfProduct": typeOfProduct(octetTypeProduit),
        "typeOfMessage": typeOfMessage(octetTypeMessage)
        };
        return data;
    }
} // end of decoder.

exports.decodeUplink = decodeUplink;
