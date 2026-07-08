 /* 
 * Payload Decoder LoRa Alliance for AIR+ (X850), AIR (X845)
 * Copyright 2025 Nexelec
 * Version : 1.0.0
 */

function decodeUplink(input) {

    var stringHex = bytesString(input.bytes);
   
    var octetTypeProduit = parseInt(stringHex.substring(0,2),16);
    var octetTypeMessage = parseInt(stringHex.substring(2,4),16);

    var data = dataOutput(octetTypeMessage)
    return {data}
    
    function bytesString(input){
        var bufferString='';
        decToString='';
        
        for(var i=0; i<input.length;i++)
        {
            decToString = input[i].toString(16).padStart(2,'0')
            bufferString=bufferString.concat(decToString)
            
        }       
        return bufferString;
    }


    function dataOutput(octetTypeMessage)
    {
        var outputTypeMessage=[productStatusOutput(stringHex),coAlarmStatusOutput(stringHex),realTimeOutput(stringHex),
                            productConfigurationOutput(stringHex)]
        return outputTypeMessage[octetTypeMessage]
    }

    function typeOfProduct(octetTypeProduit)
    {
        if(octetTypeProduit==0xAF){return "Air LoRa"}
        if(octetTypeProduit==0xAE){return "Air+ LoRa"}
    }
    
    function typeOfMessage(octetTypeMessage)
    {

        var message_name =["Product Status","CO Alarm Status","Real Time","Product Function Configuration"]

        return message_name[octetTypeMessage]
    }


    function humidity(octetHumidityValue)
    {
       return {"value": (octetHumidityValue*0.5).toFixed(2),"unit":"%RH"}
    }

    function iaqGlobalArgument(octetiaqGlobal)
    {

        var message_name =["Excellent","Good","Fair","Poor",
                            "Bad","Not used","Not used","Error"]

        return message_name[octetiaqGlobal]
    }

    function iaqSourceArgument(octetiaqSource)
    {

        var message_name =["None","Dryness Indicator","Mould Indicator","Dust mites Indicator","CO",
                            "Reserved","Reserved","Reserved","Reserved","Reserved",
                            "Reserved","Reserved","Reserved","Reserved","Reserved","Error"]

        return message_name[octetiaqSource]
    }

    function batterieLevelArgument(octetHCI)
    {

        var message_name =["High","Medium","Low","Critical"]

        return message_name[octetHCI]
    }

    function productHwStatusArgument(octetProductHwStatus)
    {

        var message_name =["Hardware working correctly","Hardware fault detected"]

        return message_name[octetProductHwStatus]
    }

    function battery(octetBattery)
    {
        return {"value":((octetBattery*5)+2000),"unit":"mV"}
    }

    function internalResistance(octetInternalResistance)
    {
        return {"value":((octetInternalResistance*50)),"unit":"mOhm"}
    }

    
    function active(octetActive)
    {
        var data=["Not active","Active"]
        return data[octetActive];
    }

    function reconfigurationSource(octetReconfigurationSource)
    {
        if(octetReconfigurationSource==0){return "NFC"}
        if(octetReconfigurationSource==1){return "Applicative Downlink"}
        if(octetReconfigurationSource==2){return "Start-up product"}
        if(octetReconfigurationSource==5){return "Local"}
        else{return "Reserved"}
    }

    function reconfigurationState(octetReconfigurationState)
    {
        if(octetReconfigurationState==0){return "Total success"}
        if(octetReconfigurationState==1){return "Partial success"}
        if(octetReconfigurationState==2){return "Total failure"}
        else{return "Reserved"}
    }


    function nfcStatusConfiguration(nfcStatus)
    {
        var data=["Discoverable","Not Discoverable","RFU","RFU"]
        return data[nfcStatus];
    }

    function hwRevision(octetHWRevision)
    {
        var data = ["V000","V001","V002","V003"]

        return data[octetHWRevision];
    }

    function swRevision(octetSWRevision)
    {
        switch(octetSWRevision){
            case 0: 
                data="V0.0";
            break;

            case 10:
                data="V1.0";
            break;
        }
        return data;
    }


    
    function pendingJoin(octetPendingJoin)
    {
        if(octetPendingJoin==0){return "No join request scheduled"}
        if(octetPendingJoin==1){return "Join request scheduled"}
    }

    function co(octetCoConcentration)
    {
        if(octetCoConcentration==1023){return "Error"}
        else{return {"value":parseFloat(octetCoConcentration), "unit" :"ppm"}}
    }

    function testAlarm(octetTestAlarm)
    {
        if(octetTestAlarm==0){return "Test Off"}
        if(octetTestAlarm==1){return "Product test is running"}
    }

    function temperature(octetTemperatureValue)
    {
        if(octetTemperatureValue>=1023){return "Error"}
        if(octetTemperatureValue>=1022){return "Sensor not present"}
        else{return {"value":parseFloat(((octetTemperatureValue / 10) - 30).toFixed(2)), "unit":"°C" }}
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
        if(octetRegion>=1){return "RFU"}
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
        if(octetD2DPing==0){return "Not compatible"}
        if(octetD2DPing>=1){return "Compatible"}
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

        //masqué en public
        var battery_voltage = parseInt(stringHex.substring(12, 14), 16);
        var battery_resistance_th = parseInt(stringHex.substring(14, 16), 16);
        var battery_voltage_low_th = parseInt(stringHex.substring(16, 18), 16);
        

        data = { "typeOfProduct": typeOfProduct(octetTypeProduit),
        "typeOfMessage": typeOfMessage(octetTypeMessage),
        "hwRevision": hwRevision(hw_version),
        "swRevision": swRevision(sw_version),
        "remainingProductLifetime" : {"Value":rmg_lifetime,"unit":"month"},
        "coSensorStatus": productHwStatusArgument(co_sensor_status),
        "tempHumSensorStatus": productHwStatusArgument(temp_sensor_status),
        "memoryFault":  productHwStatusArgument(memory_status),
        "hushStatus": productHwStatusArgument(default_hush),
        "energyStatus": batterieLevelArgument(battery_level),
        "batteryVoltage":battery(battery_voltage),
        "batteryResistanceThreshold":internalResistance(battery_resistance_th),
        "batteryLowVoltageThreshold":battery(battery_voltage_low_th),
    
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

        
        data = {"typeOfProduct": typeOfProduct(octetTypeProduit),
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

        data = {"typeOfProduct": typeOfProduct(octetTypeProduit),
        "typeOfMessage": typeOfMessage(octetTypeMessage),
        "coConcentration": co(co_concentration),
        "temperature" : temperature(data_temperature),
        "relativeHumidity" : humidity(data_humidity),
        "iaqGlobal": iaqGlobalArgument(izi_air_global),
        "iaqSource": iaqSourceArgument(izi_air_src),
        }
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
        var downlink_counter = (parseInt(stringHex.substring(18, 22), 16) >> 1) & 0xFFFF;


        data = {"typeOfProduct": typeOfProduct(octetTypeProduit),
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
        "downlinkCounter":downlink_counter,
        };
        return data;
    }
} // end of decoder
exports.decodeUplink = decodeUplink;
