/* 
* Payload Decoder LoRa Alliance for FLOW CORE & FLOW PRO
* Copyright 2026 Nexelec
* Version : 1.0.9
*
* Changes in 1.0.9:
* - error codes are returned as strings, as in the technical guide, instead of raw numbers:
*   temperatures 1023 = "Error", setpoints 63 = "Error", motor position / stroke 8191 = "Error",
*   activation time 1023 = "Error", battery voltage 1021 = "No battery", 1022 = "Reserved",
*   1023 = "Error" (battery error codes were returned multiplied by 5, e.g. 5115)
* - configuration v0: lowBatteryValveOpeningPercent read on bits 91-97; it was read on the
*   bits of temperatureModeAbsent
*
* Changes in 1.0.8:
* - typeOfProduct: 0xD2 is now reported as "FLOW CORE" (was "FLOW") and
*   0xD6 as "FLOW PRO" (was "FLOW+"), the commercial names of the technical guide
*/

function decodeUplink(input) {

    var stringHex = bytesString(input.bytes);

    var octetTypeProduit = parseInt(stringHex.substring(0, 2), 16);
    var octetTypeMessage = parseInt(stringHex.substring(2, 3), 16);
    var octetVersionMessage = parseInt(stringHex.substring(3, 4), 16);

    var data = dataOutput(octetTypeMessage, octetVersionMessage)
    return { data }

    function bytesString(input) {
        var bufferString = '';
        var decToString = '';

        for (var i = 0; i < input.length; i++) {
            decToString = input[i].toString(16).padStart(2, '0')
            bufferString = bufferString.concat(decToString)

        }
        return bufferString;
    }

    function dataOutput(octetTypeMessage, octetVersionMessage) {
        var outputTypeMessage = ["Reserved", periodicOutput(stringHex, octetVersionMessage), productStatusOutput(stringHex, octetVersionMessage), externalProbeStatusOutput(stringHex, octetVersionMessage), productConfigurationOutput(stringHex, octetVersionMessage), dailyProfil1Output(stringHex, octetVersionMessage), dailyProfil2Output(stringHex, octetVersionMessage), dailyProfil3Output(stringHex, octetVersionMessage)]
        return outputTypeMessage[octetTypeMessage]
    }

    function typeOfProduct(octetTypeProduit) {
        if (octetTypeProduit == 0xD2) { return "FLOW CORE" }
        if (octetTypeProduit == 0xD6) { return "FLOW PRO" }
    }

    function typeOfMessage(octetTypeMessage) {
        var message_name = ["Reserved", "Periodic", "Product Status", "External Probe Status", "Product Configuration", "Daily profil n°1", "Daily profil n°2", "Daily profil n°3"]

        return message_name[octetTypeMessage]
    }

    function onOff(octeton) {
        data = ["off", "on"];
        return data[octeton];
    }

    function okError(octetok) {
        data = ["ok", "error"];
        return data[octetok];
    }

    function trueFalse(octetTrue) {
        data = ["false", "true"];
        return data[octetTrue];
    }

    function offOn(octetOn)
    {
        data = ["on","off"];
        return data[octetOn];
    }

    function period(octetPeriod) 
    {
        return { "value": parseFloat(octetPeriod * 10), "unit": "min" }
    }

    function minute(octetMinute){
        return { "value": octetMinute, "unit": "min" }
    }

    function distance_µm(octetdistance) {
        if (octetdistance >= 8191) { return "Error" }
        return { "value": octetdistance, "unit": "µm" }
    }

    function percentage(octetpercentage) {
        return { "value": octetpercentage, "unit": "%" }
    }
    
    function day(octetday) {
        return { "value": octetday, "unit": "day" }
    }

    function month(octetmonth) {
        if (octetmonth == 1023) { return "Error" }
        else { return { "value": octetmonth, "unit": "month" } }
    }

    function fctSourceReconfiguration(octetReconfigurationSource) {
        if (octetReconfigurationSource == 0) { return "nfc" }
        if (octetReconfigurationSource == 1) { return "downlink" }
        if (octetReconfigurationSource == 2) { return "start-up" }
        if (octetReconfigurationSource == 5) { return "local" }
        if (octetReconfigurationSource == 6) { return "manual action" }
        else { return "Reserved" }
    }

    function fctStatusReconfiguration(octetReconfigurationState) {
        if (octetReconfigurationState == 0) { return "total success" }
        if (octetReconfigurationState == 1) { return "partial success" }
        if (octetReconfigurationState == 2) { return "total failure" }
        else { return "Reserved" }
    }

    function temperature(octetTemperatureValue) {
        if (octetTemperatureValue >= 1023) { return "Error" }
        else { return { "value": Math.round(((octetTemperatureValue / 10) - 30) * 10) / 10, "unit": "°C" } }
    }

    function regulationTemperature(octetTemperatureValue) {
        if (octetTemperatureValue >= 63) { return "Error" }
        else { return { "value": octetTemperatureValue * 0.5, "unit": "°C" } }
    }

    function sourceRegulationTemperature(octetSource) {
        if (octetSource == 0) { return "internal" }
        if (octetSource == 1) { return "external node" }
        if (octetSource == 2) { return "reserved" }
        if (octetSource == 3) { return "reserved" }
    }

    function sourceTemperatureSetPointChange(octetSource) {
        if (octetSource == 0) { return "none" }
        if (octetSource == 1) { return "planning" }
        if (octetSource == 2) { return "scroll wheel" }
        if (octetSource == 3) { return "nfc" }
        if (octetSource == 4) { return "downlink" }
        if (octetSource == 5) { return "product time not up to date, degraded mode" }
        if (octetSource == 6 || octetSource == 7) { return "reserved" }
    
    }

    function statusMotorCalibration(octetSource) {
        if (octetSource == 0) { return "calibration done" }
        if (octetSource == 1) { return "calibration failure" }
        if (octetSource == 2) { return "calibration not done, product not on the base" }
        if (octetSource == 3) { return "calibration erase, product remove from the base" }
    }

    function motorDistance(octetMotor) {
        if (octetMotor >= 8191) { return "Error" }
        return { "value": octetMotor, "unit": "µm" }
    }

    function batteryVoltage(octetbatteryVoltage) {
        if (octetbatteryVoltage === 1023) { return "Error" }
        else if (octetbatteryVoltage === 1022) { return "Reserved" }
        else if (octetbatteryVoltage === 1021) { return "No battery" }
        else { return { "value": (octetbatteryVoltage * 5), "unit": "mV" } }
    }

    function batteryLevel(octetbatteryLevel) {
        if (octetbatteryLevel == 0) { return "high" }
        if (octetbatteryLevel == 1) { return "medium" }
        if (octetbatteryLevel == 2) { return "low" }
        if (octetbatteryLevel == 3) { return "critical" }
    }

    function antiTearStatus(octetAntiTear) {
        if (octetAntiTear == 0) { return "not detected" }
        if (octetAntiTear == 1) { return "detected" }
        if (octetAntiTear == 2) { return "just removed from the base" }
        if (octetAntiTear == 3) { return "just placed on the base" }
    }

    function networkLevel(octetNetwork) {
        return { "value": -octetNetwork, "unit": "dBm" }
    }

    function temperatureRegulation(octetTemp) {
        if (octetTemp === 63) { return "Error" }
        else { return { "value": (octetTemp * 0.5), "unit": "°C" } }
    }

    function temperatureDrop(octetTemp) {
        return { "value": (octetTemp * 0.1), "unit": "°C/min" }
    }

    function temperatureOffset(octetTemp) {
        return { "value": ((octetTemp * 0.1) - 5), "unit": "°C" }
    }

    function protocolAndRegion(octetRegion) {
        if (octetRegion == 1) { return "LR-EU868" }
        else { return "reserved" }
    }

    function timeZone(octetTime) {
        var message_name = [
            "UTC -12", "UTC -11", "UTC -10", "UTC -9", "UTC -8", "UTC -7", "UTC -6",
            "UTC -5", "UTC -4", "UTC -3", "UTC -2", "UTC -1", "UTC", "UTC +1",
            "UTC +2", "UTC +3", "UTC +4", "UTC +5", "UTC +6", "UTC +7", "UTC +8",
            "UTC +9", "UTC +10", "UTC +11", "UTC +12", "UTC +13", "UTC +14"
        ]
        return message_name[octetTime]
    }

    function temperatureSlotProfile(octetTemperatureProfile) {
        if (octetTemperatureProfile == 0) { return "frost protect temperature" }
        if (octetTemperatureProfile == 1) { return "confort temperature" }
        if (octetTemperatureProfile == 2) { return "eco temperature" }
        if (octetTemperatureProfile == 3) { return "absent temperature" }
    }

    function profil(octetProfile) {
        data = ["profil 1", "profil 2", "profil 3"];
        return data[octetProfile];
    }

    function childLockOffline(octetChildLock) {
        if (octetChildLock == 0) { return "unchanged when offline" }
        if (octetChildLock == 1) { return "disable when offline " }
    }

    function regulationMode(octetRegulationMode) {
        if (octetRegulationMode == 0) { return "regulation off" }
        if (octetRegulationMode == 1) { return "regulation on" }
        if (octetRegulationMode == 2) { return "confort" }
        if (octetRegulationMode == 3) { return "eco" }
        if (octetRegulationMode == 4) { return "frost protection" }
        if (octetRegulationMode == 5) { return "absent" }
        if (octetRegulationMode == 6) { return "boost" }
        if (octetRegulationMode == 7) { return "open window" }
        if (octetRegulationMode == 8) { return "low batterie" }
        if (octetRegulationMode >= 9) { return "reserved" }

    }

    function minutesToDate(N) {
        const date = new Date(2026, 0, 1, 0, 0, 0);
        date.setMinutes(date.getMinutes() + N);

        const jj = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const aaaa = date.getFullYear();
        const hh = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');

        return `${jj}/${mm}/${aaaa} ${hh}:${min}`;
    }

    function setpointDisplayOrientation(octetOrientation) {
        if (octetOrientation == 0) { return "horizontal" }
        if (octetOrientation == 1) { return "vertical" }
    }

    function periodicOutput(stringHex, octetVersionMessage) {

        var data_temperature;
        var data_regulation_temperature;
        var data_source_regulation_temperature;
        var data_internal_temperature;
        var data_source_temperature_set_point_change;
        var data_open_window_detection;
        var data_anti_freeze;
        var data_motor_position;
        var data_valve_opening_percentage
        let data;

        switch (octetVersionMessage) {
            case 0:
                data_temperature = (parseInt(stringHex.substring(4, 7), 16) >> 2) & 0x3FF;
                data_regulation_temperature = (parseInt(stringHex.substring(6, 8), 16)) & 0x3F;
                data_source_regulation_temperature = (parseInt(stringHex.substring(8, 9), 16) >> 2) & 0x3;
                data_internal_temperature = (parseInt(stringHex.substring(8, 11), 16)) & 0x3FF;
                data_source_temperature_set_point_change = (parseInt(stringHex.substring(11, 12), 16) >> 1) & 0x7;
                data_open_window_detection = (parseInt(stringHex.substring(11, 12), 16)) & 0x1;
                data_anti_freeze = (parseInt(stringHex.substring(12, 13), 16) >> 3) & 0x1;
                data_motor_position = (parseInt(stringHex.substring(12, 16), 16) >> 2) & 0x1FFF;
                data_valve_opening_percentage = (parseInt(stringHex.substring(15, 18), 16) >> 3) & 0x7F;

                data = {
                    "typeOfProduct": typeOfProduct(octetTypeProduit),
                    "typeOfMessage": typeOfMessage(octetTypeMessage),
                    "versionOfMessage": octetVersionMessage,
                    "temperature": temperature(data_temperature),
                    "regulationTemperature": regulationTemperature(data_regulation_temperature),
                    "sourceRegulationTemperature": sourceRegulationTemperature(data_source_regulation_temperature),
                    "internalTemperature": temperature(data_internal_temperature),
                    "sourceTemperatureSetPointChange": sourceTemperatureSetPointChange(data_source_temperature_set_point_change),
                    "isWindowOpenActive": trueFalse(data_open_window_detection),
                    "isFrostProtectActive": trueFalse(data_anti_freeze),
                    "motorDistance": motorDistance(data_motor_position),
                    "valveOpeningPercentage": percentage(data_valve_opening_percentage)
                };
                break;
            case 1:
                data_temperature = (parseInt(stringHex.substring(4, 7), 16) >> 2) & 0x3FF;
                data_regulation_temperature = (parseInt(stringHex.substring(6, 8), 16)) & 0x3F;
                data_source_regulation_temperature = (parseInt(stringHex.substring(8, 9), 16) >> 2) & 0x3;
                data_internal_temperature = (parseInt(stringHex.substring(8, 11), 16)) & 0x3FF;
                data_source_temperature_set_point_change = (parseInt(stringHex.substring(11, 12), 16) >> 1) & 0x7;
                data_motor_position = (parseInt(stringHex.substring(11, 15), 16)) & 0x1FFF;
                data_valve_opening_percentage = (parseInt(stringHex.substring(15, 17), 16) >> 1) & 0x7F;
                var data_regulation_mode = (parseInt(stringHex.substring(16, 18), 16) >> 1) & 0x0F;

                data = {
                    "typeOfProduct": typeOfProduct(octetTypeProduit),
                    "typeOfMessage": typeOfMessage(octetTypeMessage),
                    "versionOfMessage": octetVersionMessage,
                    "temperature": temperature(data_temperature),
                    "regulationTemperature": regulationTemperature(data_regulation_temperature),
                    "sourceRegulationTemperature": sourceRegulationTemperature(data_source_regulation_temperature),
                    "internalTemperature": temperature(data_internal_temperature),
                    "sourceTemperatureSetPointChange": sourceTemperatureSetPointChange(data_source_temperature_set_point_change),
                    "motorDistance": motorDistance(data_motor_position),
                    "valveOpeningPercentage": percentage(data_valve_opening_percentage),
                    "regulationMode": regulationMode(data_regulation_mode)
                };
                break;
        }

        return data;
    }

    function productStatusOutput(stringHex, octetVersionMessage) {
        var data_hardware_version = (parseInt(stringHex.substring(4, 6), 16));
        var data_software_version = (parseInt(stringHex.substring(6, 8), 16));
        var data_battery_voltage1 = (parseInt(stringHex.substring(8, 11), 16) >> 2) & 0x3FF;
        var data_battery_voltage2 = (parseInt(stringHex.substring(10, 13), 16)) & 0x3FF;
        var data_battery_level = (parseInt(stringHex.substring(13, 14), 16) >> 2) & 0x3;
        var data_product_status = (parseInt(stringHex.substring(13, 14), 16) >> 1) & 0x1;
        var data_anti_tear = (parseInt(stringHex.substring(13, 15), 16) >> 3) & 0x3;
        var data_motor_calibration_status = (parseInt(stringHex.substring(14, 15), 16)) & 0x7;
        var data_motor_stroke_distance = (parseInt(stringHex.substring(15, 19), 16) >> 3) & 0x1FFF;
        var data_activation_time = (parseInt(stringHex.substring(18, 21), 16) >> 1) & 0x3FF;
        var data_date_of_product = (parseInt(stringHex.substring(20, 27), 16) >> 1) & 0xFFFFFF;
        var data_interco_with_node = (parseInt(stringHex.substring(26, 27), 16)) & 0x1;

        let data = {
            "typeOfProduct": typeOfProduct(octetTypeProduit),
            "typeOfMessage": typeOfMessage(octetTypeMessage),
            "versionOfMessage": octetVersionMessage,
            "hardwareVersion": data_hardware_version,
            "softwareVersion": data_software_version,
            "batteryVoltageSlot1": batteryVoltage(data_battery_voltage1),
            "batteryVoltageSlot2": batteryVoltage(data_battery_voltage2),
            "batteryLevel": batteryLevel(data_battery_level),
            "statusProduct": okError(data_product_status),
            "statusAntiTear": antiTearStatus(data_anti_tear),
            "statusMotorCalibration": statusMotorCalibration(data_motor_calibration_status),
            "motorStrokeDistance": distance_µm(data_motor_stroke_distance),
            "timeActivation": month(data_activation_time),
            "productDate": minutesToDate(data_date_of_product),
            "isD2Dactive": (data_interco_with_node)
        };


        return data;
    }

    function externalProbeStatusOutput(stringHex, octetVersionMessage) {
        var data_d2d_id = (parseInt(stringHex.substring(4, 10), 16)) & 0xFFFFFF;
        var data_anti_tear = (parseInt(stringHex.substring(10, 11), 16) >> 2) & 0x3;
        var data_status_temperature = (parseInt(stringHex.substring(10, 11), 16) >> 1) & 0x1;
        var data_batterie_level = (parseInt(stringHex.substring(10, 12), 16) >> 3) & 0x3;
        var data_batterie_voltage = (parseInt(stringHex.substring(11, 14), 16) >> 1) & 0x3FF;
        var data_node_message_received = (parseInt(stringHex.substring(13, 16), 16) >> 1) & 0xFF
        var data_node_network_level = (parseInt(stringHex.substring(15, 18), 16) >> 1) & 0xFF

        let data = {
            "typeOfProduct": typeOfProduct(octetTypeProduit),
            "typeOfMessage": typeOfMessage(octetTypeMessage),
            "versionOfMessage": octetVersionMessage,
            "euiExternalProbe": data_d2d_id,
            "statusExternalProbeAntiTear": antiTearStatus(data_anti_tear),
            "statusExternalProbeTemperature": okError(data_status_temperature),
            "statusExternalProbeBatteryLevel": batteryLevel(data_batterie_level),
            "statusExternalProbeBatteryVoltage": batteryVoltage(data_batterie_voltage),
            "ExternalProbeMessageReceived": data_node_message_received,
            "ExternalProbeNetworkLevel": networkLevel(data_node_network_level)
        };
        return data;
    }

    function productConfigurationOutput(stringHex, octetVersionMessage) {

    
        let data = {};
        if (octetVersionMessage == 0) {
            let data_source_reconfig = (parseInt(stringHex.substring(4, 5), 16) >> 1) & 0x7;
            let data_status_reconfig = (parseInt(stringHex.substring(4, 6), 16) >> 3) & 0x3;
            let data_period_Periodic_Transmission_regulation_on = (parseInt(stringHex.substring(5, 6), 16)) & 0x7;
            let data_period_Periodic_Transmission_regulation_off = (parseInt(stringHex.substring(6, 8), 16)) & 0xFF;
            let data_child_lock = (parseInt(stringHex.substring(8, 9), 16) >> 3) & 0x1;
            let data_child_lock_without_connection = (parseInt(stringHex.substring(8, 9), 16) >> 2) & 0x1;
            let data_general_regulation = (parseInt(stringHex.substring(8, 9), 16) >> 1) & 0x1;
            let data_regulation_minimal_temp = (parseInt(stringHex.substring(8, 11), 16) >> 3) & 0x3F;
            let data_regulation_maximal_temp = (parseInt(stringHex.substring(10, 12), 16) >> 1) & 0x3F;
            let data_anti_freeze = (parseInt(stringHex.substring(11, 12), 16)) & 0x1;
            let data_anti_freeze_temperature_threshold = (parseInt(stringHex.substring(12, 14), 16) >> 2) & 0x3F;
            let data_open_window_detection = (parseInt(stringHex.substring(13, 14), 16) >> 1) & 0x1;
            let data_open_window_temperature_drop = (parseInt(stringHex.substring(13, 15), 16)) & 0x1F;
            let data_open_window_pause_duration = (parseInt(stringHex.substring(15, 17), 16) >> 2) & 0x3F;
            let data_internal_temperature_offset = (parseInt(stringHex.substring(16, 19), 16) >> 3) & 0x7F;
            let data_temperature_confort_mode = (parseInt(stringHex.substring(18, 20), 16) >> 1) & 0x3F;
            let data_temperature_eco_mode = (parseInt(stringHex.substring(19, 22), 16) >> 3) & 0x3F;
            let data_temperature_absent_mode = (parseInt(stringHex.substring(21, 23), 16) >> 1) & 0x3F;
            let data_low_battery_valve_opening_percent = (parseInt(stringHex.substring(22, 25), 16) >> 2) & 0x7F; // bits 91-97
            let data_protocol_and_region = (parseInt(stringHex.substring(24, 26), 16) >> 2) & 0xF;
            let data_time_zone = (parseInt(stringHex.substring(25, 27), 16) >> 1) & 0x1F;
            let data_join_scheduled = (parseInt(stringHex.substring(26, 27), 16)) & 0x1;
            let data_nfc_status = (parseInt(stringHex.substring(27, 28), 16) >> 2) & 0x3;
            let data_kp = (parseInt(stringHex.substring(27, 30), 16) >> 3) & 0x7F;
            let data_ki = (parseInt(stringHex.substring(29, 31), 16)) & 0x7F;
            let data_heating_period = (parseInt(stringHex.substring(31, 32), 16) >> 3) & 0x1;
            let data_heating_start_month = (parseInt(stringHex.substring(31, 33), 16) >> 3) & 0xF;
            let data_heating_start_day = (parseInt(stringHex.substring(32, 34), 16) >> 2) & 0x1F;
            let data_heating_end_month = (parseInt(stringHex.substring(33, 35), 16) >> 2) & 0xF;
            let data_heating_end_day = (parseInt(stringHex.substring(34, 36), 16) >> 1) & 0x1F;
            let data_planning = (parseInt(stringHex.substring(35, 36), 16)) & 0x01;
            let data_daily_planning = (parseInt(stringHex.substring(36, 40), 16) >> 1) & 0xFFFF;
            let data_daily_planning_monday = (parseInt(stringHex.substring(36, 37), 16) >> 2) & 0x03;
            let data_daily_planning_tuesday = (parseInt(stringHex.substring(36, 37), 16)) & 0x03;
            let data_daily_planning_wednesday = (parseInt(stringHex.substring(37, 38), 16) >> 2) & 0x03;
            let data_daily_planning_thursday = (parseInt(stringHex.substring(37, 38), 16)) & 0x03;
            let data_daily_planning_friday = (parseInt(stringHex.substring(38, 39), 16) >> 2) & 0x03;
            let data_daily_planning_saturday = (parseInt(stringHex.substring(38, 39), 16)) & 0x03;
            let data_daily_planning_sunday = (parseInt(stringHex.substring(39, 40), 16) >> 2) & 0x03;
            let data_downling_counter = (parseInt(stringHex.substring(40, 44), 16) >> 1) & 0xFFFF;


            data = {
                "typeOfProduct": typeOfProduct(octetTypeProduit),
                "typeOfMessage": typeOfMessage(octetTypeMessage),
                "versionOfMessage": octetVersionMessage,
                "sourceReconfiguration": fctSourceReconfiguration(data_source_reconfig),
                "statusReconfiguration": fctStatusReconfiguration(data_status_reconfig),
                "periodPeriodicTransmissionRegulationOn": period(data_period_Periodic_Transmission_regulation_on),
                "periodPeriodicTransmissionRegulationOff": period(data_period_Periodic_Transmission_regulation_off),
                "enableChildLock": onOff(data_child_lock),
                "childLockOfflineBehavior": childLockOffline(data_child_lock_without_connection),
                "enableRegulation": onOff(data_general_regulation),
                "minimumRegulationTemperature": temperatureRegulation(data_regulation_minimal_temp),
                "maximumRegulationTemperature": temperatureRegulation(data_regulation_maximal_temp),
                "enableFrostProtect": onOff(data_anti_freeze),
                "frostProtectActivationThreshold": temperatureRegulation(data_anti_freeze_temperature_threshold),
                "enableOpenWindowDetection": onOff(data_open_window_detection),
                "openWindowDetectionTemperatureDrop": temperatureDrop(data_open_window_temperature_drop),
                "openWindowDetectionPauseDuration": data_open_window_pause_duration,
                "temperatureInternalOffset": temperatureOffset(data_internal_temperature_offset),
                "temperatureModeConfort": temperatureRegulation(data_temperature_confort_mode),
                "temperatureModeEco": temperatureRegulation(data_temperature_eco_mode),
                "temperatureModeAbsent": temperatureRegulation(data_temperature_absent_mode),
                "lowBatteryValveOpeningPercent": percentage(data_low_battery_valve_opening_percent),
                "protocolAndRegion": protocolAndRegion(data_protocol_and_region),
                "timeZone": timeZone(data_time_zone),
                "isJoinPending": trueFalse(data_join_scheduled),
                "enableNfcDiscover": offOn(data_nfc_status),
                "kp": data_kp,
                "ki": data_ki,
                "enableHeatingPeriod": onOff(data_heating_period),
                "heatingStartMonth": data_heating_start_month,
                "heatingStartDay": data_heating_start_day,
                "heatingEndMonth": data_heating_end_month,
                "heatingEndDay": data_heating_end_day,
                "enablePlanningMode": onOff(data_planning),
                "dailyPlanning": {
                    "monday": profil(data_daily_planning_monday),
                    "tuesday": profil(data_daily_planning_tuesday),
                    "wednesday": profil(data_daily_planning_wednesday),
                    "thursday": profil(data_daily_planning_thursday),
                    "friday": profil(data_daily_planning_friday),
                    "saturday": profil(data_daily_planning_saturday),
                    "sunday": profil(data_daily_planning_sunday),
                },
                "downlinkFcnt": data_downling_counter,
            }
        }

        if (octetVersionMessage == 1) {
            let data_source_reconfig = (parseInt(stringHex.substring(4, 5), 16) >> 1) & 0x7;
            let data_status_reconfig = (parseInt(stringHex.substring(4, 6), 16) >> 3) & 0x3;
            let data_period_Periodic_Transmission_regulation_on = (parseInt(stringHex.substring(5, 6), 16)) & 0x7;
            let data_period_Periodic_Transmission_regulation_off = (parseInt(stringHex.substring(6, 8), 16)) & 0xFF;
            let data_child_lock = (parseInt(stringHex.substring(8, 9), 16) >> 3) & 0x1;
            let data_child_lock_without_connection = (parseInt(stringHex.substring(8, 9), 16) >> 2) & 0x1;
            let data_general_regulation = (parseInt(stringHex.substring(8, 9), 16) >> 1) & 0x1;
            let data_regulation_minimal_temp = (parseInt(stringHex.substring(8, 11), 16) >> 3) & 0x3F;
            let data_regulation_maximal_temp = (parseInt(stringHex.substring(10, 12), 16) >> 1) & 0x3F;
            let data_anti_freeze = (parseInt(stringHex.substring(11, 12), 16)) & 0x1;
            let data_anti_freeze_temperature_threshold = (parseInt(stringHex.substring(12, 14), 16) >> 2) & 0x3F;
            let data_open_window_detection = (parseInt(stringHex.substring(13, 14), 16) >> 1) & 0x1;
            let data_open_window_temperature_drop = (parseInt(stringHex.substring(13, 15), 16)) & 0x1F;
            let data_open_window_pause_duration = (parseInt(stringHex.substring(15, 17), 16) >> 2) & 0x3F;
            let data_internal_temperature_offset = (parseInt(stringHex.substring(16, 19), 16) >> 3) & 0x7F;
            let data_regulation_tolerance = (parseInt(stringHex.substring(18, 20), 16)) & 0x7F;
            let data_temperature_confort_mode = (parseInt(stringHex.substring(20, 22), 16) >> 2) & 0x3F;
            let data_temperature_eco_mode = (parseInt(stringHex.substring(21, 23), 16)) & 0x3F;
            let data_temperature_absent_mode = (parseInt(stringHex.substring(23, 25), 16) >> 2) & 0x3F;
            let data_low_battery_valve_opening_percent = (parseInt(stringHex.substring(24, 27), 16) >> 3) & 0x7F;
            let data_protocol_and_region = (parseInt(stringHex.substring(26, 28), 16) >> 3) & 0xF;
            let data_time_zone = (parseInt(stringHex.substring(27, 29), 16) >> 2) & 0x1F;
            let data_join_scheduled = (parseInt(stringHex.substring(28, 29), 16) >> 1) & 0x1;
            let data_nfc_status = (parseInt(stringHex.substring(28, 30), 16) >> 3) & 0x3;
            let data_kp = (parseInt(stringHex.substring(29, 31), 16)) & 0x7F;
            let data_ki = (parseInt(stringHex.substring(31, 33), 16) >> 1) & 0x7F;
            let data_heating_period = (parseInt(stringHex.substring(32, 33), 16)) & 0x1;
            let data_heating_start_month = (parseInt(stringHex.substring(33, 34), 16)) & 0xF;
            let data_heating_start_day = (parseInt(stringHex.substring(34, 35), 16) >> 3) & 0x1F;
            let data_heating_end_month = (parseInt(stringHex.substring(35, 37), 16) >> 3) & 0xF;
            let data_heating_end_day = (parseInt(stringHex.substring(36, 38), 16) >> 2) & 0x1F;
            let data_planning = (parseInt(stringHex.substring(37, 38), 16) >> 1) & 0x01;
            let data_daily_planning = (parseInt(stringHex.substring(37, 42), 16) >> 1) & 0xFFFF;
            let data_daily_planning_monday = (parseInt(stringHex.substring(37, 38), 16) >> 3) & 0x03;
            let data_daily_planning_tuesday = (parseInt(stringHex.substring(38, 39), 16) >> 1) & 0x03;
            let data_daily_planning_wednesday = (parseInt(stringHex.substring(38, 40), 16) >> 3) & 0x03;
            let data_daily_planning_thursday = (parseInt(stringHex.substring(39, 40), 16) >> 1) & 0x03;
            let data_daily_planning_friday = (parseInt(stringHex.substring(39, 41), 16) >> 3) & 0x03;
            let data_daily_planning_saturday = (parseInt(stringHex.substring(40, 41), 16) >> 1) & 0x03;
            let data_daily_planning_sunday = (parseInt(stringHex.substring(40, 42), 16) >> 3) & 0x03;
            let data_downling_counter = (parseInt(stringHex.substring(41, 46), 16) >> 1) & 0xFFFF;

            data = {
                "typeOfProduct": typeOfProduct(octetTypeProduit),
                "typeOfMessage": typeOfMessage(octetTypeMessage),
                "versionOfMessage": octetVersionMessage,
                "sourceReconfiguration": fctSourceReconfiguration(data_source_reconfig),
                "statusReconfiguration": fctStatusReconfiguration(data_status_reconfig),
                "periodPeriodicTransmissionRegulationOn": period(data_period_Periodic_Transmission_regulation_on),
                "periodPeriodicTransmissionRegulationOff": period(data_period_Periodic_Transmission_regulation_off),
                "enableChildLock": onOff(data_child_lock),
                "childLockOfflineBehavior": childLockOffline(data_child_lock_without_connection),
                "enableRegulation": onOff(data_general_regulation),
                "minimumRegulationTemperature": temperatureRegulation(data_regulation_minimal_temp),
                "maximumRegulationTemperature": temperatureRegulation(data_regulation_maximal_temp),
                "enableFrostProtect": onOff(data_anti_freeze),
                "frostProtectActivationThreshold": temperatureRegulation(data_anti_freeze_temperature_threshold),
                "enableOpenWindowDetection": onOff(data_open_window_detection),
                "openWindowDetectionTemperatureDrop": temperatureDrop(data_open_window_temperature_drop),
                "openWindowDetectionPauseDuration": data_open_window_pause_duration,
                "temperatureInternalOffset": temperatureOffset(data_internal_temperature_offset),
                "regulationTolerance": temperatureDrop(data_regulation_tolerance),
                "temperatureModeConfort": temperatureRegulation(data_temperature_confort_mode),
                "temperatureModeEco": temperatureRegulation(data_temperature_eco_mode),
                "temperatureModeAbsent": temperatureRegulation(data_temperature_absent_mode),
                "lowBatteryValveOpeningPercent": percentage(data_low_battery_valve_opening_percent),
                "protocolAndRegion": protocolAndRegion(data_protocol_and_region),
                "timeZone": timeZone(data_time_zone),
                "isJoinPending": trueFalse(data_join_scheduled),
                "enableNfcDiscover": onOff(data_nfc_status),
                "kp": data_kp,
                "ki": data_ki,
                "enableHeatingPeriod": onOff(data_heating_period),
                "heatingStartMonth": data_heating_start_month,
                "heatingStartDay": data_heating_start_day,
                "heatingEndMonth": data_heating_end_month,
                "heatingEndDay": data_heating_end_day,
                "enablePlanningMode": onOff(data_planning),
                "dailyPlanning": {
                    "monday": profil(data_daily_planning_monday),
                    "tuesday": profil(data_daily_planning_tuesday),
                    "wednesday": profil(data_daily_planning_wednesday),
                    "thursday": profil(data_daily_planning_thursday),
                    "friday": profil(data_daily_planning_friday),
                    "saturday": profil(data_daily_planning_saturday),
                    "sunday": profil(data_daily_planning_sunday),
                },
                "downlinkFcnt": data_downling_counter,
            };
        }

        if  (octetVersionMessage == 2){
        
            let data_source_reconfig = (parseInt(stringHex.substring(4, 5), 16) >> 1) & 0x7;
            let data_status_reconfig = (parseInt(stringHex.substring(4, 6), 16) >> 3) & 0x3;
            let data_period_Periodic_Transmission_regulation_on = (parseInt(stringHex.substring(5, 6), 16)) & 0x7;
            let data_period_Periodic_Transmission_regulation_off = (parseInt(stringHex.substring(6, 8), 16)) & 0xFF;
            let data_child_lock = (parseInt(stringHex.substring(8, 9), 16) >> 3) & 0x1;
            let data_child_lock_without_connection = (parseInt(stringHex.substring(8, 9), 16) >> 2) & 0x1;
            let data_general_regulation = (parseInt(stringHex.substring(8, 9), 16) >> 1) & 0x1;
            let data_regulation_minimal_temp = (parseInt(stringHex.substring(8, 11), 16) >> 3) & 0x3F;
            let data_regulation_maximal_temp = (parseInt(stringHex.substring(10, 12), 16) >> 1) & 0x3F;
            let data_anti_freeze = (parseInt(stringHex.substring(11, 12), 16)) & 0x1;
            let data_anti_freeze_temperature_threshold = (parseInt(stringHex.substring(12, 14), 16) >> 2) & 0x3F;
            let data_open_window_detection = (parseInt(stringHex.substring(13, 14), 16) >> 1) & 0x1;
            let data_open_window_temperature_drop = (parseInt(stringHex.substring(13, 15), 16)) & 0x1F;
            let data_open_window_pause_duration = (parseInt(stringHex.substring(15, 17), 16) >> 2) & 0x3F;
            let data_internal_temperature_offset = (parseInt(stringHex.substring(16, 19), 16) >> 3) & 0x7F;
            let data_regulation_tolerance = (parseInt(stringHex.substring(18, 20), 16)) & 0x7F;
            let data_temperature_confort_mode = (parseInt(stringHex.substring(20, 22), 16) >> 2) & 0x3F;
            let data_temperature_eco_mode = (parseInt(stringHex.substring(21, 23), 16)) & 0x3F;
            let data_temperature_absent_mode = (parseInt(stringHex.substring(23, 25), 16) >> 2) & 0x3F;
            let data_low_battery_valve_opening_percent = (parseInt(stringHex.substring(24, 27), 16) >> 3) & 0x7F;
            let data_protocol_and_region = (parseInt(stringHex.substring(26, 28), 16) >> 3) & 0xF;
            let data_time_zone = (parseInt(stringHex.substring(27, 29), 16) >> 2) & 0x1F;
            let data_join_scheduled = (parseInt(stringHex.substring(28, 29), 16) >> 1) & 0x1;
            let data_nfc_status = (parseInt(stringHex.substring(28, 30), 16) >> 3) & 0x3;
            let data_kp = (parseInt(stringHex.substring(29, 31), 16)) & 0x7F;
            let data_ki = (parseInt(stringHex.substring(31, 33), 16) >> 1) & 0x7F;
            let data_heating_period = (parseInt(stringHex.substring(32, 33), 16)) & 0x1;
            let data_heating_start_month = (parseInt(stringHex.substring(33, 34), 16)) & 0xF;
            let data_heating_start_day = (parseInt(stringHex.substring(34, 36), 16) >> 3) & 0x1F;
            let data_heating_end_month = (parseInt(stringHex.substring(35, 37), 16) >> 3) & 0xF;
            let data_heating_end_day = (parseInt(stringHex.substring(36, 38), 16) >> 2) & 0x1F;
            let data_planning = (parseInt(stringHex.substring(37, 38), 16) >> 1) & 0x01;
            let data_daily_planning = (parseInt(stringHex.substring(37, 42), 16) >> 1) & 0xFFFF;
            let data_daily_planning_monday = (parseInt(stringHex.substring(37, 39), 16) >> 3) & 0x03;
            let data_daily_planning_tuesday = (parseInt(stringHex.substring(38, 39), 16) >> 1) & 0x03;
            let data_daily_planning_wednesday = (parseInt(stringHex.substring(38, 40), 16) >> 3) & 0x03;
            let data_daily_planning_thursday = (parseInt(stringHex.substring(39, 40), 16) >> 1) & 0x03;
            let data_daily_planning_friday = (parseInt(stringHex.substring(39, 41), 16) >> 3) & 0x03;
            let data_daily_planning_saturday = (parseInt(stringHex.substring(40, 41), 16) >> 1) & 0x03;
            let data_daily_planning_sunday = (parseInt(stringHex.substring(40, 42), 16) >> 3) & 0x03;
            let data_downling_counter = (parseInt(stringHex.substring(41, 46), 16) >> 1) & 0xFFFF;
            let data_enable_boost = (parseInt(stringHex.substring(45, 46), 16)) & 0x01;
            let data_boost_activation_duration = (parseInt(stringHex.substring(46, 48), 16) >> 1) & 0x7F;
            let data_valve_Opening_Percent_Control_Disabled = (parseInt(stringHex.substring(47, 50), 16) >> 2) & 0x7F;
        

            data = {
                "typeOfProduct": typeOfProduct(octetTypeProduit),
                "typeOfMessage": typeOfMessage(octetTypeMessage),
                "versionOfMessage": octetVersionMessage,
                "sourceReconfiguration": fctSourceReconfiguration(data_source_reconfig),
                "statusReconfiguration": fctStatusReconfiguration(data_status_reconfig),
                "periodPeriodicTransmissionRegulationOn": period(data_period_Periodic_Transmission_regulation_on),
                "periodPeriodicTransmissionRegulationOff": period(data_period_Periodic_Transmission_regulation_off),
                "enableChildLock": onOff(data_child_lock),
                "childLockOfflineBehavior": childLockOffline(data_child_lock_without_connection),
                "enableRegulation": onOff(data_general_regulation),
                "minimumRegulationTemperature": temperatureRegulation(data_regulation_minimal_temp),
                "maximumRegulationTemperature": temperatureRegulation(data_regulation_maximal_temp),
                "enableFrostProtect": onOff(data_anti_freeze),
                "frostProtectActivationThreshold": temperatureRegulation(data_anti_freeze_temperature_threshold),
                "enableOpenWindowDetection": onOff(data_open_window_detection),
                "openWindowDetectionTemperatureDrop": temperatureDrop(data_open_window_temperature_drop),
                "openWindowDetectionPauseDuration": minute(data_open_window_pause_duration),
                "temperatureInternalOffset": temperatureOffset(data_internal_temperature_offset),
                "regulationTolerance": temperatureDrop(data_regulation_tolerance),
                "temperatureModeConfort": temperatureRegulation(data_temperature_confort_mode),
                "temperatureModeEco": temperatureRegulation(data_temperature_eco_mode),
                "temperatureModeAbsent": temperatureRegulation(data_temperature_absent_mode),
                "lowBatteryValveOpeningPercent": percentage(data_low_battery_valve_opening_percent),
                "protocolAndRegion": protocolAndRegion(data_protocol_and_region),
                "timeZone": timeZone(data_time_zone),
                "isJoinPending": trueFalse(data_join_scheduled),
                "enableNfcDiscover": onOff(data_nfc_status),
                "kp": data_kp,
                "ki": data_ki,
                "enableHeatingPeriod": onOff(data_heating_period),
                "heatingStartMonth": month(data_heating_start_month),
                "heatingStartDay": day(data_heating_start_day),
                "heatingEndMonth": month(data_heating_end_month),
                "heatingEndDay": day(data_heating_end_day),
                "enablePlanningMode": onOff(data_planning),
                "dailyPlanning": {
                    "monday": profil(data_daily_planning_monday),
                    "tuesday": profil(data_daily_planning_tuesday),
                    "wednesday": profil(data_daily_planning_wednesday),
                    "thursday": profil(data_daily_planning_thursday),
                    "friday": profil(data_daily_planning_friday),
                    "saturday": profil(data_daily_planning_saturday),
                    "sunday": profil(data_daily_planning_sunday),
                },
                "downlinkFcnt": data_downling_counter,
                "enableBoost" : onOff(data_enable_boost),
                "boostActivationDuration" : minute(data_boost_activation_duration),
                "valveOpeningPercentControlDisabled": percentage(data_valve_Opening_Percent_Control_Disabled)
            };

        }

        if  (octetVersionMessage == 3){
        
            let data_source_reconfig = (parseInt(stringHex.substring(4, 5), 16) >> 1) & 0x7;
            let data_status_reconfig = (parseInt(stringHex.substring(4, 6), 16) >> 3) & 0x3;
            let data_period_Periodic_Transmission_regulation_on = (parseInt(stringHex.substring(5, 6), 16)) & 0x7;
            let data_period_Periodic_Transmission_regulation_off = (parseInt(stringHex.substring(6, 8), 16)) & 0xFF;
            let data_child_lock = (parseInt(stringHex.substring(8, 9), 16) >> 3) & 0x1;
            let data_child_lock_without_connection = (parseInt(stringHex.substring(8, 9), 16) >> 2) & 0x1;
            let data_general_regulation = (parseInt(stringHex.substring(8, 9), 16) >> 1) & 0x1;
            let data_regulation_minimal_temp = (parseInt(stringHex.substring(8, 11), 16) >> 3) & 0x3F;
            let data_regulation_maximal_temp = (parseInt(stringHex.substring(10, 12), 16) >> 1) & 0x3F;
            let data_anti_freeze = (parseInt(stringHex.substring(11, 12), 16)) & 0x1;
            let data_anti_freeze_temperature_threshold = (parseInt(stringHex.substring(12, 14), 16) >> 2) & 0x3F;
            let data_open_window_detection = (parseInt(stringHex.substring(13, 14), 16) >> 1) & 0x1;
            let data_open_window_temperature_drop = (parseInt(stringHex.substring(13, 15), 16)) & 0x1F;
            let data_open_window_pause_duration = (parseInt(stringHex.substring(15, 17), 16) >> 2) & 0x3F;
            let data_internal_temperature_offset = (parseInt(stringHex.substring(16, 19), 16) >> 3) & 0x7F;
            let data_regulation_tolerance = (parseInt(stringHex.substring(18, 20), 16)) & 0x7F;
            let data_temperature_confort_mode = (parseInt(stringHex.substring(20, 22), 16) >> 2) & 0x3F;
            let data_temperature_eco_mode = (parseInt(stringHex.substring(21, 23), 16)) & 0x3F;
            let data_temperature_absent_mode = (parseInt(stringHex.substring(23, 25), 16) >> 2) & 0x3F;
            let data_low_battery_valve_opening_percent = (parseInt(stringHex.substring(24, 27), 16) >> 3) & 0x7F;
            let data_protocol_and_region = (parseInt(stringHex.substring(26, 28), 16) >> 3) & 0xF;
            let data_time_zone = (parseInt(stringHex.substring(27, 29), 16) >> 2) & 0x1F;
            let data_join_scheduled = (parseInt(stringHex.substring(28, 29), 16) >> 1) & 0x1;
            let data_nfc_status = (parseInt(stringHex.substring(28, 30), 16) >> 3) & 0x3;
            let data_kp = (parseInt(stringHex.substring(29, 31), 16)) & 0x7F;
            let data_ki = (parseInt(stringHex.substring(31, 33), 16) >> 1) & 0x7F;
            let data_heating_period = (parseInt(stringHex.substring(32, 33), 16)) & 0x1;
            let data_heating_start_month = (parseInt(stringHex.substring(33, 34), 16)) & 0xF;
            let data_heating_start_day = (parseInt(stringHex.substring(34, 36), 16) >> 3) & 0x1F;
            let data_heating_end_month = (parseInt(stringHex.substring(35, 37), 16) >> 3) & 0xF;
            let data_heating_end_day = (parseInt(stringHex.substring(36, 38), 16) >> 2) & 0x1F;
            let data_planning = (parseInt(stringHex.substring(37, 38), 16) >> 1) & 0x01;
            let data_daily_planning = (parseInt(stringHex.substring(37, 42), 16) >> 1) & 0xFFFF;
            let data_daily_planning_monday = (parseInt(stringHex.substring(37, 39), 16) >> 3) & 0x03;
            let data_daily_planning_tuesday = (parseInt(stringHex.substring(38, 39), 16) >> 1) & 0x03;
            let data_daily_planning_wednesday = (parseInt(stringHex.substring(38, 40), 16) >> 3) & 0x03;
            let data_daily_planning_thursday = (parseInt(stringHex.substring(39, 40), 16) >> 1) & 0x03;
            let data_daily_planning_friday = (parseInt(stringHex.substring(39, 41), 16) >> 3) & 0x03;
            let data_daily_planning_saturday = (parseInt(stringHex.substring(40, 41), 16) >> 1) & 0x03;
            let data_daily_planning_sunday = (parseInt(stringHex.substring(40, 42), 16) >> 3) & 0x03;
            let data_downling_counter = (parseInt(stringHex.substring(41, 46), 16) >> 1) & 0xFFFF;
            let data_enable_boost = (parseInt(stringHex.substring(45, 46), 16)) & 0x01;
            let data_boost_activation_duration = (parseInt(stringHex.substring(46, 48), 16) >> 1) & 0x7F;
            let data_valve_Opening_Percent_Control_Disabled = (parseInt(stringHex.substring(47, 50), 16) >> 2) & 0x7F;
            let data_enable_fuota = (parseInt(stringHex.substring(49, 50), 16) >> 1) & 0x01;
            let data_setpoint_display_orientation = (parseInt(stringHex.substring(49, 50), 16)) & 0x01;
        

            data = {
                "typeOfProduct": typeOfProduct(octetTypeProduit),
                "typeOfMessage": typeOfMessage(octetTypeMessage),
                "versionOfMessage": octetVersionMessage,
                "sourceReconfiguration": fctSourceReconfiguration(data_source_reconfig),
                "statusReconfiguration": fctStatusReconfiguration(data_status_reconfig),
                "periodPeriodicTransmissionRegulationOn": period(data_period_Periodic_Transmission_regulation_on),
                "periodPeriodicTransmissionRegulationOff": period(data_period_Periodic_Transmission_regulation_off),
                "enableChildLock": onOff(data_child_lock),
                "childLockOfflineBehavior": childLockOffline(data_child_lock_without_connection),
                "enableRegulation": onOff(data_general_regulation),
                "minimumRegulationTemperature": temperatureRegulation(data_regulation_minimal_temp),
                "maximumRegulationTemperature": temperatureRegulation(data_regulation_maximal_temp),
                "enableFrostProtect": onOff(data_anti_freeze),
                "frostProtectActivationThreshold": temperatureRegulation(data_anti_freeze_temperature_threshold),
                "enableOpenWindowDetection": onOff(data_open_window_detection),
                "openWindowDetectionTemperatureDrop": temperatureDrop(data_open_window_temperature_drop),
                "openWindowDetectionPauseDuration": minute(data_open_window_pause_duration),
                "temperatureInternalOffset": temperatureOffset(data_internal_temperature_offset),
                "regulationTolerance": temperatureDrop(data_regulation_tolerance),
                "temperatureModeConfort": temperatureRegulation(data_temperature_confort_mode),
                "temperatureModeEco": temperatureRegulation(data_temperature_eco_mode),
                "temperatureModeAbsent": temperatureRegulation(data_temperature_absent_mode),
                "lowBatteryValveOpeningPercent": percentage(data_low_battery_valve_opening_percent),
                "protocolAndRegion": protocolAndRegion(data_protocol_and_region),
                "timeZone": timeZone(data_time_zone),
                "isJoinPending": trueFalse(data_join_scheduled),
                "enableNfcDiscover": onOff(data_nfc_status),
                "kp": data_kp,
                "ki": data_ki,
                "enableHeatingPeriod": onOff(data_heating_period),
                "heatingStartMonth": month(data_heating_start_month),
                "heatingStartDay": day(data_heating_start_day),
                "heatingEndMonth": month(data_heating_end_month),
                "heatingEndDay": day(data_heating_end_day),
                "enablePlanningMode": onOff(data_planning),
                "dailyPlanning": {
                    "monday": profil(data_daily_planning_monday),
                    "tuesday": profil(data_daily_planning_tuesday),
                    "wednesday": profil(data_daily_planning_wednesday),
                    "thursday": profil(data_daily_planning_thursday),
                    "friday": profil(data_daily_planning_friday),
                    "saturday": profil(data_daily_planning_saturday),
                    "sunday": profil(data_daily_planning_sunday),
                },
                "downlinkFcnt": data_downling_counter,
                "enableBoost" : onOff(data_enable_boost),
                "boostActivationDuration" : minute(data_boost_activation_duration),
                "valveOpeningPercentControlDisabled": percentage(data_valve_Opening_Percent_Control_Disabled),
                "enableFuota" : onOff(data_enable_fuota),
                "setpointDisplayOrientation" : setpointDisplayOrientation(data_setpoint_display_orientation)
            };

        }
        return data
    }

    function dailyProfil1Output(stringHex, octetVersionMessage) {

        var data_source_reconfig = (parseInt(stringHex.substring(4, 5), 16) >> 1) & 0x7;
        var data_status_reconfig = (parseInt(stringHex.substring(4, 6), 16) >> 3) & 0x3;

        var data_slot_00h00_00h30 = (parseInt(stringHex.substring(5, 6), 16) >> 1) & 0x3;
        var data_slot_00h30_01h00 = (parseInt(stringHex.substring(5, 7), 16) >> 3) & 0x3;
        var data_slot_01h00_01h30 = (parseInt(stringHex.substring(6, 7), 16) >> 1) & 0x3;
        var data_slot_01h30_02h00 = (parseInt(stringHex.substring(6, 8), 16) >> 3) & 0x3;

        var data_slot_02h00_02h30 = (parseInt(stringHex.substring(7, 8), 16) >> 1) & 0x3;
        var data_slot_02h30_03h00 = (parseInt(stringHex.substring(7, 9), 16) >> 3) & 0x3;
        var data_slot_03h00_03h30 = (parseInt(stringHex.substring(8, 9), 16) >> 1) & 0x3;
        var data_slot_03h30_04h00 = (parseInt(stringHex.substring(8, 10), 16) >> 3) & 0x3;

        var data_slot_04h00_04h30 = (parseInt(stringHex.substring(9, 10), 16) >> 1) & 0x3;
        var data_slot_04h30_05h00 = (parseInt(stringHex.substring(9, 11), 16) >> 3) & 0x3;
        var data_slot_05h00_05h30 = (parseInt(stringHex.substring(10, 11), 16) >> 1) & 0x3;
        var data_slot_05h30_06h00 = (parseInt(stringHex.substring(10, 12), 16) >> 3) & 0x3;

        var data_slot_06h00_06h30 = (parseInt(stringHex.substring(11, 12), 16) >> 1) & 0x3;
        var data_slot_06h30_07h00 = (parseInt(stringHex.substring(11, 13), 16) >> 3) & 0x3;
        var data_slot_07h00_07h30 = (parseInt(stringHex.substring(12, 13), 16) >> 1) & 0x3;
        var data_slot_07h30_08h00 = (parseInt(stringHex.substring(12, 14), 16) >> 3) & 0x3;

        var data_slot_08h00_08h30 = (parseInt(stringHex.substring(13, 14), 16) >> 1) & 0x3;
        var data_slot_08h30_09h00 = (parseInt(stringHex.substring(13, 15), 16) >> 3) & 0x3;
        var data_slot_09h00_09h30 = (parseInt(stringHex.substring(14, 15), 16) >> 1) & 0x3;
        var data_slot_09h30_10h00 = (parseInt(stringHex.substring(14, 16), 16) >> 3) & 0x3;

        var data_slot_10h00_10h30 = (parseInt(stringHex.substring(15, 16), 16) >> 1) & 0x3;
        var data_slot_10h30_11h00 = (parseInt(stringHex.substring(15, 17), 16) >> 3) & 0x3;
        var data_slot_11h00_11h30 = (parseInt(stringHex.substring(16, 17), 16) >> 1) & 0x3;
        var data_slot_11h30_12h00 = (parseInt(stringHex.substring(16, 18), 16) >> 3) & 0x3;

        var data_slot_12h00_12h30 = (parseInt(stringHex.substring(17, 18), 16) >> 1) & 0x3;
        var data_slot_12h30_13h00 = (parseInt(stringHex.substring(17, 19), 16) >> 3) & 0x3;
        var data_slot_13h00_13h30 = (parseInt(stringHex.substring(18, 19), 16) >> 1) & 0x3;
        var data_slot_13h30_14h00 = (parseInt(stringHex.substring(18, 20), 16) >> 3) & 0x3;

        var data_slot_14h00_14h30 = (parseInt(stringHex.substring(19, 20), 16) >> 1) & 0x3;
        var data_slot_14h30_15h00 = (parseInt(stringHex.substring(19, 21), 16) >> 3) & 0x3;
        var data_slot_15h00_15h30 = (parseInt(stringHex.substring(20, 21), 16) >> 1) & 0x3;
        var data_slot_15h30_16h00 = (parseInt(stringHex.substring(20, 22), 16) >> 3) & 0x3;

        var data_slot_16h00_16h30 = (parseInt(stringHex.substring(21, 22), 16) >> 1) & 0x3;
        var data_slot_16h30_17h00 = (parseInt(stringHex.substring(21, 23), 16) >> 3) & 0x3;
        var data_slot_17h00_17h30 = (parseInt(stringHex.substring(22, 23), 16) >> 1) & 0x3;
        var data_slot_17h30_18h00 = (parseInt(stringHex.substring(22, 24), 16) >> 3) & 0x3;

        var data_slot_18h00_18h30 = (parseInt(stringHex.substring(23, 24), 16) >> 1) & 0x3;
        var data_slot_18h30_19h00 = (parseInt(stringHex.substring(23, 25), 16) >> 3) & 0x3;
        var data_slot_19h00_19h30 = (parseInt(stringHex.substring(24, 25), 16) >> 1) & 0x3;
        var data_slot_19h30_20h00 = (parseInt(stringHex.substring(24, 26), 16) >> 3) & 0x3;

        var data_slot_20h00_20h30 = (parseInt(stringHex.substring(25, 26), 16) >> 1) & 0x3;
        var data_slot_20h30_21h00 = (parseInt(stringHex.substring(25, 27), 16) >> 3) & 0x3;
        var data_slot_21h00_21h30 = (parseInt(stringHex.substring(26, 27), 16) >> 1) & 0x3;
        var data_slot_21h30_22h00 = (parseInt(stringHex.substring(26, 28), 16) >> 3) & 0x3;

        var data_slot_22h00_22h30 = (parseInt(stringHex.substring(27, 28), 16) >> 1) & 0x3;
        var data_slot_22h30_23h00 = (parseInt(stringHex.substring(27, 29), 16) >> 3) & 0x3;
        var data_slot_23h00_23h30 = (parseInt(stringHex.substring(28, 29), 16) >> 1) & 0x3;
        var data_slot_23h30_00h00 = (parseInt(stringHex.substring(28, 30), 16) >> 3) & 0x3;


        let data = {
            "typeOfProduct": typeOfProduct(octetTypeProduit),
            "typeOfMessage": typeOfMessage(octetTypeMessage),
            "versionOfMessage": octetVersionMessage,
            "sourceReconfiguration": fctSourceReconfiguration(data_source_reconfig),
            "statusReconfiguration": fctStatusReconfiguration(data_status_reconfig),
            "temperatureSlot00h00_00h30": temperatureSlotProfile(data_slot_00h00_00h30),
            "temperatureSlot00h30_01h00": temperatureSlotProfile(data_slot_00h30_01h00),
            "temperatureSlot01h00_01h30": temperatureSlotProfile(data_slot_01h00_01h30),
            "temperatureSlot01h30_02h00": temperatureSlotProfile(data_slot_01h30_02h00),
            "temperatureSlot02h00_02h30": temperatureSlotProfile(data_slot_02h00_02h30),
            "temperatureSlot02h30_03h00": temperatureSlotProfile(data_slot_02h30_03h00),
            "temperatureSlot03h00_03h30": temperatureSlotProfile(data_slot_03h00_03h30),
            "temperatureSlot03h30_04h00": temperatureSlotProfile(data_slot_03h30_04h00),
            "temperatureSlot04h00_04h30": temperatureSlotProfile(data_slot_04h00_04h30),
            "temperatureSlot04h30_05h00": temperatureSlotProfile(data_slot_04h30_05h00),
            "temperatureSlot05h00_05h30": temperatureSlotProfile(data_slot_05h00_05h30),
            "temperatureSlot05h30_06h00": temperatureSlotProfile(data_slot_05h30_06h00),
            "temperatureSlot06h00_06h30": temperatureSlotProfile(data_slot_06h00_06h30),
            "temperatureSlot06h30_07h00": temperatureSlotProfile(data_slot_06h30_07h00),
            "temperatureSlot07h00_07h30": temperatureSlotProfile(data_slot_07h00_07h30),
            "temperatureSlot07h30_08h00": temperatureSlotProfile(data_slot_07h30_08h00),
            "temperatureSlot08h00_08h30": temperatureSlotProfile(data_slot_08h00_08h30),
            "temperatureSlot08h30_09h00": temperatureSlotProfile(data_slot_08h30_09h00),
            "temperatureSlot09h00_09h30": temperatureSlotProfile(data_slot_09h00_09h30),
            "temperatureSlot09h30_10h00": temperatureSlotProfile(data_slot_09h30_10h00),
            "temperatureSlot10h00_10h30": temperatureSlotProfile(data_slot_10h00_10h30),
            "temperatureSlot10h30_11h00": temperatureSlotProfile(data_slot_10h30_11h00),
            "temperatureSlot11h00_11h30": temperatureSlotProfile(data_slot_11h00_11h30),
            "temperatureSlot11h30_12h00": temperatureSlotProfile(data_slot_11h30_12h00),
            "temperatureSlot12h00_12h30": temperatureSlotProfile(data_slot_12h00_12h30),
            "temperatureSlot12h30_13h00": temperatureSlotProfile(data_slot_12h30_13h00),
            "temperatureSlot13h00_13h30": temperatureSlotProfile(data_slot_13h00_13h30),
            "temperatureSlot13h30_14h00": temperatureSlotProfile(data_slot_13h30_14h00),
            "temperatureSlot14h00_14h30": temperatureSlotProfile(data_slot_14h00_14h30),
            "temperatureSlot14h30_15h00": temperatureSlotProfile(data_slot_14h30_15h00),
            "temperatureSlot15h00_15h30": temperatureSlotProfile(data_slot_15h00_15h30),
            "temperatureSlot15h30_16h00": temperatureSlotProfile(data_slot_15h30_16h00),
            "temperatureSlot16h00_16h30": temperatureSlotProfile(data_slot_16h00_16h30),
            "temperatureSlot16h30_17h00": temperatureSlotProfile(data_slot_16h30_17h00),
            "temperatureSlot17h00_17h30": temperatureSlotProfile(data_slot_17h00_17h30),
            "temperatureSlot17h30_18h00": temperatureSlotProfile(data_slot_17h30_18h00),
            "temperatureSlot18h00_18h30": temperatureSlotProfile(data_slot_18h00_18h30),
            "temperatureSlot18h30_19h00": temperatureSlotProfile(data_slot_18h30_19h00),
            "temperatureSlot19h00_19h30": temperatureSlotProfile(data_slot_19h00_19h30),
            "temperatureSlot19h30_20h00": temperatureSlotProfile(data_slot_19h30_20h00),
            "temperatureSlot20h00_20h30": temperatureSlotProfile(data_slot_20h00_20h30),
            "temperatureSlot20h30_21h00": temperatureSlotProfile(data_slot_20h30_21h00),
            "temperatureSlot21h00_21h30": temperatureSlotProfile(data_slot_21h00_21h30),
            "temperatureSlot21h30_22h00": temperatureSlotProfile(data_slot_21h30_22h00),
            "temperatureSlot22h00_22h30": temperatureSlotProfile(data_slot_22h00_22h30),
            "temperatureSlot22h30_23h00": temperatureSlotProfile(data_slot_22h30_23h00),
            "temperatureSlot23h00_23h30": temperatureSlotProfile(data_slot_23h00_23h30),
            "temperatureSlot23h30_00h00": temperatureSlotProfile(data_slot_23h30_00h00),
        }
        return data;
    }

    function dailyProfil2Output(stringHex, octetVersionMessage) {

        var data_source_reconfig = (parseInt(stringHex.substring(4, 5), 16) >> 1) & 0x7;
        var data_status_reconfig = (parseInt(stringHex.substring(4, 6), 16) >> 3) & 0x3;

        var data_slot_00h00_00h30 = (parseInt(stringHex.substring(5, 6), 16) >> 1) & 0x3;
        var data_slot_00h30_01h00 = (parseInt(stringHex.substring(5, 7), 16) >> 3) & 0x3;
        var data_slot_01h00_01h30 = (parseInt(stringHex.substring(6, 7), 16) >> 1) & 0x3;
        var data_slot_01h30_02h00 = (parseInt(stringHex.substring(6, 8), 16) >> 3) & 0x3;

        var data_slot_02h00_02h30 = (parseInt(stringHex.substring(7, 8), 16) >> 1) & 0x3;
        var data_slot_02h30_03h00 = (parseInt(stringHex.substring(7, 9), 16) >> 3) & 0x3;
        var data_slot_03h00_03h30 = (parseInt(stringHex.substring(8, 9), 16) >> 1) & 0x3;
        var data_slot_03h30_04h00 = (parseInt(stringHex.substring(8, 10), 16) >> 3) & 0x3;

        var data_slot_04h00_04h30 = (parseInt(stringHex.substring(9, 10), 16) >> 1) & 0x3;
        var data_slot_04h30_05h00 = (parseInt(stringHex.substring(9, 11), 16) >> 3) & 0x3;
        var data_slot_05h00_05h30 = (parseInt(stringHex.substring(10, 11), 16) >> 1) & 0x3;
        var data_slot_05h30_06h00 = (parseInt(stringHex.substring(10, 12), 16) >> 3) & 0x3;

        var data_slot_06h00_06h30 = (parseInt(stringHex.substring(11, 12), 16) >> 1) & 0x3;
        var data_slot_06h30_07h00 = (parseInt(stringHex.substring(11, 13), 16) >> 3) & 0x3;
        var data_slot_07h00_07h30 = (parseInt(stringHex.substring(12, 13), 16) >> 1) & 0x3;
        var data_slot_07h30_08h00 = (parseInt(stringHex.substring(12, 14), 16) >> 3) & 0x3;

        var data_slot_08h00_08h30 = (parseInt(stringHex.substring(13, 14), 16) >> 1) & 0x3;
        var data_slot_08h30_09h00 = (parseInt(stringHex.substring(13, 15), 16) >> 3) & 0x3;
        var data_slot_09h00_09h30 = (parseInt(stringHex.substring(14, 15), 16) >> 1) & 0x3;
        var data_slot_09h30_10h00 = (parseInt(stringHex.substring(14, 16), 16) >> 3) & 0x3;

        var data_slot_10h00_10h30 = (parseInt(stringHex.substring(15, 16), 16) >> 1) & 0x3;
        var data_slot_10h30_11h00 = (parseInt(stringHex.substring(15, 17), 16) >> 3) & 0x3;
        var data_slot_11h00_11h30 = (parseInt(stringHex.substring(16, 17), 16) >> 1) & 0x3;
        var data_slot_11h30_12h00 = (parseInt(stringHex.substring(16, 18), 16) >> 3) & 0x3;

        var data_slot_12h00_12h30 = (parseInt(stringHex.substring(17, 18), 16) >> 1) & 0x3;
        var data_slot_12h30_13h00 = (parseInt(stringHex.substring(17, 19), 16) >> 3) & 0x3;
        var data_slot_13h00_13h30 = (parseInt(stringHex.substring(18, 19), 16) >> 1) & 0x3;
        var data_slot_13h30_14h00 = (parseInt(stringHex.substring(18, 20), 16) >> 3) & 0x3;

        var data_slot_14h00_14h30 = (parseInt(stringHex.substring(19, 20), 16) >> 1) & 0x3;
        var data_slot_14h30_15h00 = (parseInt(stringHex.substring(19, 21), 16) >> 3) & 0x3;
        var data_slot_15h00_15h30 = (parseInt(stringHex.substring(20, 21), 16) >> 1) & 0x3;
        var data_slot_15h30_16h00 = (parseInt(stringHex.substring(20, 22), 16) >> 3) & 0x3;

        var data_slot_16h00_16h30 = (parseInt(stringHex.substring(21, 22), 16) >> 1) & 0x3;
        var data_slot_16h30_17h00 = (parseInt(stringHex.substring(21, 23), 16) >> 3) & 0x3;
        var data_slot_17h00_17h30 = (parseInt(stringHex.substring(22, 23), 16) >> 1) & 0x3;
        var data_slot_17h30_18h00 = (parseInt(stringHex.substring(22, 24), 16) >> 3) & 0x3;

        var data_slot_18h00_18h30 = (parseInt(stringHex.substring(23, 24), 16) >> 1) & 0x3;
        var data_slot_18h30_19h00 = (parseInt(stringHex.substring(23, 25), 16) >> 3) & 0x3;
        var data_slot_19h00_19h30 = (parseInt(stringHex.substring(24, 25), 16) >> 1) & 0x3;
        var data_slot_19h30_20h00 = (parseInt(stringHex.substring(24, 26), 16) >> 3) & 0x3;

        var data_slot_20h00_20h30 = (parseInt(stringHex.substring(25, 26), 16) >> 1) & 0x3;
        var data_slot_20h30_21h00 = (parseInt(stringHex.substring(25, 27), 16) >> 3) & 0x3;
        var data_slot_21h00_21h30 = (parseInt(stringHex.substring(26, 27), 16) >> 1) & 0x3;
        var data_slot_21h30_22h00 = (parseInt(stringHex.substring(26, 28), 16) >> 3) & 0x3;

        var data_slot_22h00_22h30 = (parseInt(stringHex.substring(27, 28), 16) >> 1) & 0x3;
        var data_slot_22h30_23h00 = (parseInt(stringHex.substring(27, 29), 16) >> 3) & 0x3;
        var data_slot_23h00_23h30 = (parseInt(stringHex.substring(28, 29), 16) >> 1) & 0x3;
        var data_slot_23h30_00h00 = (parseInt(stringHex.substring(28, 30), 16) >> 3) & 0x3;


        let data = {
            "typeOfProduct": typeOfProduct(octetTypeProduit),
            "typeOfMessage": typeOfMessage(octetTypeMessage),
            "versionOfMessage": octetVersionMessage,
            "sourceReconfiguration": fctSourceReconfiguration(data_source_reconfig),
            "statusReconfiguration": fctStatusReconfiguration(data_status_reconfig),
            "temperatureSlot00h00_00h30": temperatureSlotProfile(data_slot_00h00_00h30),
            "temperatureSlot00h30_01h00": temperatureSlotProfile(data_slot_00h30_01h00),
            "temperatureSlot01h00_01h30": temperatureSlotProfile(data_slot_01h00_01h30),
            "temperatureSlot01h30_02h00": temperatureSlotProfile(data_slot_01h30_02h00),
            "temperatureSlot02h00_02h30": temperatureSlotProfile(data_slot_02h00_02h30),
            "temperatureSlot02h30_03h00": temperatureSlotProfile(data_slot_02h30_03h00),
            "temperatureSlot03h00_03h30": temperatureSlotProfile(data_slot_03h00_03h30),
            "temperatureSlot03h30_04h00": temperatureSlotProfile(data_slot_03h30_04h00),
            "temperatureSlot04h00_04h30": temperatureSlotProfile(data_slot_04h00_04h30),
            "temperatureSlot04h30_05h00": temperatureSlotProfile(data_slot_04h30_05h00),
            "temperatureSlot05h00_05h30": temperatureSlotProfile(data_slot_05h00_05h30),
            "temperatureSlot05h30_06h00": temperatureSlotProfile(data_slot_05h30_06h00),
            "temperatureSlot06h00_06h30": temperatureSlotProfile(data_slot_06h00_06h30),
            "temperatureSlot06h30_07h00": temperatureSlotProfile(data_slot_06h30_07h00),
            "temperatureSlot07h00_07h30": temperatureSlotProfile(data_slot_07h00_07h30),
            "temperatureSlot07h30_08h00": temperatureSlotProfile(data_slot_07h30_08h00),
            "temperatureSlot08h00_08h30": temperatureSlotProfile(data_slot_08h00_08h30),
            "temperatureSlot08h30_09h00": temperatureSlotProfile(data_slot_08h30_09h00),
            "temperatureSlot09h00_09h30": temperatureSlotProfile(data_slot_09h00_09h30),
            "temperatureSlot09h30_10h00": temperatureSlotProfile(data_slot_09h30_10h00),
            "temperatureSlot10h00_10h30": temperatureSlotProfile(data_slot_10h00_10h30),
            "temperatureSlot10h30_11h00": temperatureSlotProfile(data_slot_10h30_11h00),
            "temperatureSlot11h00_11h30": temperatureSlotProfile(data_slot_11h00_11h30),
            "temperatureSlot11h30_12h00": temperatureSlotProfile(data_slot_11h30_12h00),
            "temperatureSlot12h00_12h30": temperatureSlotProfile(data_slot_12h00_12h30),
            "temperatureSlot12h30_13h00": temperatureSlotProfile(data_slot_12h30_13h00),
            "temperatureSlot13h00_13h30": temperatureSlotProfile(data_slot_13h00_13h30),
            "temperatureSlot13h30_14h00": temperatureSlotProfile(data_slot_13h30_14h00),
            "temperatureSlot14h00_14h30": temperatureSlotProfile(data_slot_14h00_14h30),
            "temperatureSlot14h30_15h00": temperatureSlotProfile(data_slot_14h30_15h00),
            "temperatureSlot15h00_15h30": temperatureSlotProfile(data_slot_15h00_15h30),
            "temperatureSlot15h30_16h00": temperatureSlotProfile(data_slot_15h30_16h00),
            "temperatureSlot16h00_16h30": temperatureSlotProfile(data_slot_16h00_16h30),
            "temperatureSlot16h30_17h00": temperatureSlotProfile(data_slot_16h30_17h00),
            "temperatureSlot17h00_17h30": temperatureSlotProfile(data_slot_17h00_17h30),
            "temperatureSlot17h30_18h00": temperatureSlotProfile(data_slot_17h30_18h00),
            "temperatureSlot18h00_18h30": temperatureSlotProfile(data_slot_18h00_18h30),
            "temperatureSlot18h30_19h00": temperatureSlotProfile(data_slot_18h30_19h00),
            "temperatureSlot19h00_19h30": temperatureSlotProfile(data_slot_19h00_19h30),
            "temperatureSlot19h30_20h00": temperatureSlotProfile(data_slot_19h30_20h00),
            "temperatureSlot20h00_20h30": temperatureSlotProfile(data_slot_20h00_20h30),
            "temperatureSlot20h30_21h00": temperatureSlotProfile(data_slot_20h30_21h00),
            "temperatureSlot21h00_21h30": temperatureSlotProfile(data_slot_21h00_21h30),
            "temperatureSlot21h30_22h00": temperatureSlotProfile(data_slot_21h30_22h00),
            "temperatureSlot22h00_22h30": temperatureSlotProfile(data_slot_22h00_22h30),
            "temperatureSlot22h30_23h00": temperatureSlotProfile(data_slot_22h30_23h00),
            "temperatureSlot23h00_23h30": temperatureSlotProfile(data_slot_23h00_23h30),
            "temperatureSlot23h30_00h00": temperatureSlotProfile(data_slot_23h30_00h00),
        }
        return data;
    }

    function dailyProfil3Output(stringHex, octetVersionMessage) {

        var data_source_reconfig = (parseInt(stringHex.substring(4, 5), 16) >> 1) & 0x7;
        var data_status_reconfig = (parseInt(stringHex.substring(4, 6), 16) >> 3) & 0x3;

        var data_slot_00h00_00h30 = (parseInt(stringHex.substring(5, 6), 16) >> 1) & 0x3;
        var data_slot_00h30_01h00 = (parseInt(stringHex.substring(5, 7), 16) >> 3) & 0x3;
        var data_slot_01h00_01h30 = (parseInt(stringHex.substring(6, 7), 16) >> 1) & 0x3;
        var data_slot_01h30_02h00 = (parseInt(stringHex.substring(6, 8), 16) >> 3) & 0x3;

        var data_slot_02h00_02h30 = (parseInt(stringHex.substring(7, 8), 16) >> 1) & 0x3;
        var data_slot_02h30_03h00 = (parseInt(stringHex.substring(7, 9), 16) >> 3) & 0x3;
        var data_slot_03h00_03h30 = (parseInt(stringHex.substring(8, 9), 16) >> 1) & 0x3;
        var data_slot_03h30_04h00 = (parseInt(stringHex.substring(8, 10), 16) >> 3) & 0x3;

        var data_slot_04h00_04h30 = (parseInt(stringHex.substring(9, 10), 16) >> 1) & 0x3;
        var data_slot_04h30_05h00 = (parseInt(stringHex.substring(9, 11), 16) >> 3) & 0x3;
        var data_slot_05h00_05h30 = (parseInt(stringHex.substring(10, 11), 16) >> 1) & 0x3;
        var data_slot_05h30_06h00 = (parseInt(stringHex.substring(10, 12), 16) >> 3) & 0x3;

        var data_slot_06h00_06h30 = (parseInt(stringHex.substring(11, 12), 16) >> 1) & 0x3;
        var data_slot_06h30_07h00 = (parseInt(stringHex.substring(11, 13), 16) >> 3) & 0x3;
        var data_slot_07h00_07h30 = (parseInt(stringHex.substring(12, 13), 16) >> 1) & 0x3;
        var data_slot_07h30_08h00 = (parseInt(stringHex.substring(12, 14), 16) >> 3) & 0x3;

        var data_slot_08h00_08h30 = (parseInt(stringHex.substring(13, 14), 16) >> 1) & 0x3;
        var data_slot_08h30_09h00 = (parseInt(stringHex.substring(13, 15), 16) >> 3) & 0x3;
        var data_slot_09h00_09h30 = (parseInt(stringHex.substring(14, 15), 16) >> 1) & 0x3;
        var data_slot_09h30_10h00 = (parseInt(stringHex.substring(14, 16), 16) >> 3) & 0x3;

        var data_slot_10h00_10h30 = (parseInt(stringHex.substring(15, 16), 16) >> 1) & 0x3;
        var data_slot_10h30_11h00 = (parseInt(stringHex.substring(15, 17), 16) >> 3) & 0x3;
        var data_slot_11h00_11h30 = (parseInt(stringHex.substring(16, 17), 16) >> 1) & 0x3;
        var data_slot_11h30_12h00 = (parseInt(stringHex.substring(16, 18), 16) >> 3) & 0x3;

        var data_slot_12h00_12h30 = (parseInt(stringHex.substring(17, 18), 16) >> 1) & 0x3;
        var data_slot_12h30_13h00 = (parseInt(stringHex.substring(17, 19), 16) >> 3) & 0x3;
        var data_slot_13h00_13h30 = (parseInt(stringHex.substring(18, 19), 16) >> 1) & 0x3;
        var data_slot_13h30_14h00 = (parseInt(stringHex.substring(18, 20), 16) >> 3) & 0x3;

        var data_slot_14h00_14h30 = (parseInt(stringHex.substring(19, 20), 16) >> 1) & 0x3;
        var data_slot_14h30_15h00 = (parseInt(stringHex.substring(19, 21), 16) >> 3) & 0x3;
        var data_slot_15h00_15h30 = (parseInt(stringHex.substring(20, 21), 16) >> 1) & 0x3;
        var data_slot_15h30_16h00 = (parseInt(stringHex.substring(20, 22), 16) >> 3) & 0x3;

        var data_slot_16h00_16h30 = (parseInt(stringHex.substring(21, 22), 16) >> 1) & 0x3;
        var data_slot_16h30_17h00 = (parseInt(stringHex.substring(21, 23), 16) >> 3) & 0x3;
        var data_slot_17h00_17h30 = (parseInt(stringHex.substring(22, 23), 16) >> 1) & 0x3;
        var data_slot_17h30_18h00 = (parseInt(stringHex.substring(22, 24), 16) >> 3) & 0x3;

        var data_slot_18h00_18h30 = (parseInt(stringHex.substring(23, 24), 16) >> 1) & 0x3;
        var data_slot_18h30_19h00 = (parseInt(stringHex.substring(23, 25), 16) >> 3) & 0x3;
        var data_slot_19h00_19h30 = (parseInt(stringHex.substring(24, 25), 16) >> 1) & 0x3;
        var data_slot_19h30_20h00 = (parseInt(stringHex.substring(24, 26), 16) >> 3) & 0x3;

        var data_slot_20h00_20h30 = (parseInt(stringHex.substring(25, 26), 16) >> 1) & 0x3;
        var data_slot_20h30_21h00 = (parseInt(stringHex.substring(25, 27), 16) >> 3) & 0x3;
        var data_slot_21h00_21h30 = (parseInt(stringHex.substring(26, 27), 16) >> 1) & 0x3;
        var data_slot_21h30_22h00 = (parseInt(stringHex.substring(26, 28), 16) >> 3) & 0x3;

        var data_slot_22h00_22h30 = (parseInt(stringHex.substring(27, 28), 16) >> 1) & 0x3;
        var data_slot_22h30_23h00 = (parseInt(stringHex.substring(27, 29), 16) >> 3) & 0x3;
        var data_slot_23h00_23h30 = (parseInt(stringHex.substring(28, 29), 16) >> 1) & 0x3;
        var data_slot_23h30_00h00 = (parseInt(stringHex.substring(28, 30), 16) >> 3) & 0x3;


        let data = {
            "typeOfProduct": typeOfProduct(octetTypeProduit),
            "typeOfMessage": typeOfMessage(octetTypeMessage),
            "versionOfMessage": octetVersionMessage,
            "sourceReconfiguration": fctSourceReconfiguration(data_source_reconfig),
            "statusReconfiguration": fctStatusReconfiguration(data_status_reconfig),
            "temperatureSlot00h00_00h30": temperatureSlotProfile(data_slot_00h00_00h30),
            "temperatureSlot00h30_01h00": temperatureSlotProfile(data_slot_00h30_01h00),
            "temperatureSlot01h00_01h30": temperatureSlotProfile(data_slot_01h00_01h30),
            "temperatureSlot01h30_02h00": temperatureSlotProfile(data_slot_01h30_02h00),
            "temperatureSlot02h00_02h30": temperatureSlotProfile(data_slot_02h00_02h30),
            "temperatureSlot02h30_03h00": temperatureSlotProfile(data_slot_02h30_03h00),
            "temperatureSlot03h00_03h30": temperatureSlotProfile(data_slot_03h00_03h30),
            "temperatureSlot03h30_04h00": temperatureSlotProfile(data_slot_03h30_04h00),
            "temperatureSlot04h00_04h30": temperatureSlotProfile(data_slot_04h00_04h30),
            "temperatureSlot04h30_05h00": temperatureSlotProfile(data_slot_04h30_05h00),
            "temperatureSlot05h00_05h30": temperatureSlotProfile(data_slot_05h00_05h30),
            "temperatureSlot05h30_06h00": temperatureSlotProfile(data_slot_05h30_06h00),
            "temperatureSlot06h00_06h30": temperatureSlotProfile(data_slot_06h00_06h30),
            "temperatureSlot06h30_07h00": temperatureSlotProfile(data_slot_06h30_07h00),
            "temperatureSlot07h00_07h30": temperatureSlotProfile(data_slot_07h00_07h30),
            "temperatureSlot07h30_08h00": temperatureSlotProfile(data_slot_07h30_08h00),
            "temperatureSlot08h00_08h30": temperatureSlotProfile(data_slot_08h00_08h30),
            "temperatureSlot08h30_09h00": temperatureSlotProfile(data_slot_08h30_09h00),
            "temperatureSlot09h00_09h30": temperatureSlotProfile(data_slot_09h00_09h30),
            "temperatureSlot09h30_10h00": temperatureSlotProfile(data_slot_09h30_10h00),
            "temperatureSlot10h00_10h30": temperatureSlotProfile(data_slot_10h00_10h30),
            "temperatureSlot10h30_11h00": temperatureSlotProfile(data_slot_10h30_11h00),
            "temperatureSlot11h00_11h30": temperatureSlotProfile(data_slot_11h00_11h30),
            "temperatureSlot11h30_12h00": temperatureSlotProfile(data_slot_11h30_12h00),
            "temperatureSlot12h00_12h30": temperatureSlotProfile(data_slot_12h00_12h30),
            "temperatureSlot12h30_13h00": temperatureSlotProfile(data_slot_12h30_13h00),
            "temperatureSlot13h00_13h30": temperatureSlotProfile(data_slot_13h00_13h30),
            "temperatureSlot13h30_14h00": temperatureSlotProfile(data_slot_13h30_14h00),
            "temperatureSlot14h00_14h30": temperatureSlotProfile(data_slot_14h00_14h30),
            "temperatureSlot14h30_15h00": temperatureSlotProfile(data_slot_14h30_15h00),
            "temperatureSlot15h00_15h30": temperatureSlotProfile(data_slot_15h00_15h30),
            "temperatureSlot15h30_16h00": temperatureSlotProfile(data_slot_15h30_16h00),
            "temperatureSlot16h00_16h30": temperatureSlotProfile(data_slot_16h00_16h30),
            "temperatureSlot16h30_17h00": temperatureSlotProfile(data_slot_16h30_17h00),
            "temperatureSlot17h00_17h30": temperatureSlotProfile(data_slot_17h00_17h30),
            "temperatureSlot17h30_18h00": temperatureSlotProfile(data_slot_17h30_18h00),
            "temperatureSlot18h00_18h30": temperatureSlotProfile(data_slot_18h00_18h30),
            "temperatureSlot18h30_19h00": temperatureSlotProfile(data_slot_18h30_19h00),
            "temperatureSlot19h00_19h30": temperatureSlotProfile(data_slot_19h00_19h30),
            "temperatureSlot19h30_20h00": temperatureSlotProfile(data_slot_19h30_20h00),
            "temperatureSlot20h00_20h30": temperatureSlotProfile(data_slot_20h00_20h30),
            "temperatureSlot20h30_21h00": temperatureSlotProfile(data_slot_20h30_21h00),
            "temperatureSlot21h00_21h30": temperatureSlotProfile(data_slot_21h00_21h30),
            "temperatureSlot21h30_22h00": temperatureSlotProfile(data_slot_21h30_22h00),
            "temperatureSlot22h00_22h30": temperatureSlotProfile(data_slot_22h00_22h30),
            "temperatureSlot22h30_23h00": temperatureSlotProfile(data_slot_22h30_23h00),
            "temperatureSlot23h00_23h30": temperatureSlotProfile(data_slot_23h00_23h30),
            "temperatureSlot23h30_00h00": temperatureSlotProfile(data_slot_23h30_00h00),
        }
        return data;
    }
} // end of decoder
/**
 * Payload Encoder LoRa Alliance for FLOW CORE & FLOW PRO (downlink)
 * Copyright 2026 Nexelec
 * Version : 1.0.0
 *
 * LoRaWAN downlink encoder / decoder (TS013 "Payload Codec API": encodeDownlink / decodeDownlink)
 *
 * Reference: D1183C_FLOW_Guide_Technique - public (rev. C)
 *   - frame structure and downlink command list: README-Frames_FLOW.md, section 7
 *
 * Frame format : 0x55 | CmdID | DATA | CmdID | DATA | ...
 *   - byte 0 is always the header 0x55
 *   - several commands can be chained in one frame
 *   - NEXELEC recommends sending command IDs in ASCENDING order
 *     (this encoder sorts them automatically)
 *   - application port: 56 (uplink and downlink)
 *
 * After applying a downlink the device spontaneously sends back its
 * updated configuration frame (0x04).
 */

var FLOW_FPORT = 56;
var FLOW_HEADER = 0x55;

/* -------------------------------------------------------------------------
 * Command table: id -> payload length in bytes (used by the decoder)
 * ---------------------------------------------------------------------- */
var FLOW_COMMANDS = {
  0x01: { len: 0, name: "getConfiguration" },
  0x0a: { len: 1, name: "setNfcEnabled" },
  0x1c: { len: 2, name: "setDelayedNetworkJoin" },
  0x4a: { len: 1, name: "deviceReset" },
  0x4b: { len: 1, name: "factoryReset" },
  0x63: { len: 1, name: "setTimeZone" },
  0x72: { len: 1, name: "setTemperatureOffset" },
  0x73: { len: 1, name: "setOpenWindowDetection" },
  0x74: { len: 1, name: "setOpenWindowDelta" },
  0x75: { len: 1, name: "setOpenWindowPauseDuration" },
  0x76: { len: 1, name: "setChildLock" },
  0x77: { len: 1, name: "setMinTemperature" },
  0x78: { len: 1, name: "setMaxTemperature" },
  0x79: { len: 1, name: "setRegulation" },
  0x7a: { len: 1, name: "setFrostProtection" },
  0x7b: { len: 1, name: "setFrostProtectionTemperature" },
  0x7c: { len: 1, name: "setComfortTemperature" },
  0x7d: { len: 1, name: "setEcoTemperature" },
  0x7e: { len: 1, name: "setAwayTemperature" },
  0x7f: { len: 1, name: "setHeatingSeason" },
  0x80: { len: 2, name: "setHeatingSeasonStart" },
  0x81: { len: 2, name: "setHeatingSeasonEnd" },
  0x82: { len: 2, name: "setWeeklySchedule" },
  0x83: { len: 12, name: "setDailyProfile1" },
  0x84: { len: 12, name: "setDailyProfile2" },
  0x85: { len: 12, name: "setDailyProfile3" },
  0x86: { len: 1, name: "setUplinkPeriodRegulationOn" },
  0x87: { len: 1, name: "setUplinkPeriodRegulationOff" },
  0x8a: { len: 1, name: "setTargetTemperature" },
  0x8b: { len: 1, name: "setLowBatteryValvePosition" },
  0x8c: { len: 0, name: "recalibrateMotor" },
  0x90: { len: 1, name: "setBoost" },
  0x91: { len: 1, name: "setBoostDuration" },
  0x93: { len: 1, name: "setChildLockOnNetworkLoss" },
  0x94: { len: 1, name: "setTemperatureHysteresis" },
  0x95: { len: 1, name: "setSchedules" },
  0x97: { len: 1, name: "setFuotaMode" },
  0x98: { len: 1, name: "setValvePositionWhenRegulationOff" },
  0x9a: { len: 1, name: "setSetpointDisplayOrientation" },
};

/* -------------------------------------------------------------------------
 * Validation helpers - every out-of-range value is a hard error,
 * never a silently truncated byte.
 * ---------------------------------------------------------------------- */

function flowNum(errors, key, value) {
  var n = typeof value === "string" ? Number(value) : value;
  if (typeof n !== "number" || !isFinite(n)) {
    errors.push(key + ": numeric value expected, got " + JSON.stringify(value));
    return null;
  }
  return n;
}

/** raw integer, must already be in [min,max] */
function flowInt(errors, key, value, min, max) {
  var n = flowNum(errors, key, value);
  if (n === null) return null;
  var r = Math.round(n);
  if (r !== n) errors.push(key + ": integer expected, got " + n);
  if (r < min || r > max) {
    errors.push(key + ": out of range (" + min + ".." + max + "), got " + n);
    return null;
  }
  return r;
}

/** boolean -> 0/1 (accepts true/false, 0/1, "true"/"false") */
function flowBool(errors, key, value) {
  if (value === true || value === 1 || value === "true" || value === "1") return 1;
  if (value === false || value === 0 || value === "false" || value === "0") return 0;
  errors.push(key + ": boolean expected, got " + JSON.stringify(value));
  return null;
}

/** physical value -> raw = round(value * factor + offset), checked against [min,max] */
function flowScaled(errors, warnings, key, value, factor, offset, min, max, unit, step) {
  var n = flowNum(errors, key, value);
  if (n === null) return null;
  var exact = n * factor + offset;
  var raw = Math.round(exact);
  if (Math.abs(exact - raw) > 1e-6) {
    warnings.push(
      key + ": " + n + unit + " is not a multiple of " + step + unit +
      ", rounded to " + ((raw - offset) / factor) + unit
    );
  }
  if (raw < min || raw > max) {
    errors.push(
      key + ": out of range (" + ((min - offset) / factor) + unit + ".." +
      ((max - offset) / factor) + unit + "), got " + n + unit
    );
    return null;
  }
  return raw;
}

/** setpoint 0..31 C, 0.5 C step -> raw 0..62 */
function flowSetpoint(errors, warnings, key, value) {
  return flowScaled(errors, warnings, key, value, 2, 0, 0, 62, "C", 0.5);
}

/** "horizontal"|"vertical" or 0/1 -> 0/1 */
var FLOW_ORIENTATIONS = { horizontal: 0, vertical: 1 };
function flowOrientation(errors, key, value) {
  if (typeof value === "string" && value.toLowerCase() in FLOW_ORIENTATIONS) {
    return FLOW_ORIENTATIONS[value.toLowerCase()];
  }
  if (value === 0 || value === 1) return value;
  errors.push(key + ': expected "horizontal"|"vertical" or 0/1, got ' + JSON.stringify(value));
  return null;
}

/** "frost"|"comfort"|"eco"|"away" or 0..3 -> 0..3 */
var FLOW_SLOT_MODES = { frost: 0, comfort: 1, eco: 2, away: 3 };
function flowSlotMode(errors, key, value) {
  if (typeof value === "string") {
    var k = value.toLowerCase();
    if (k in FLOW_SLOT_MODES) return FLOW_SLOT_MODES[k];
    errors.push(key + ': expected "frost"|"comfort"|"eco"|"away" or 0..3, got "' + value + '"');
    return null;
  }
  return flowInt(errors, key, value, 0, 3);
}

/**
 * Daily profile: 48 half-hour slots (00:00-00:30 ... 23:30-24:00),
 * 2 bits per slot, 4 slots per byte, first slot in bits [7..6] -> 12 bytes.
 */
function flowDailyProfile(errors, key, value) {
  if (!Array.isArray(value) || value.length !== 48) {
    errors.push(key + ": array of exactly 48 half-hour slots expected, got " +
      (Array.isArray(value) ? value.length + " entries" : typeof value));
    return null;
  }
  var out = [];
  for (var b = 0; b < 12; b++) {
    var byte = 0;
    for (var s = 0; s < 4; s++) {
      var idx = b * 4 + s;
      var m = flowSlotMode(errors, key + "[" + idx + "]", value[idx]);
      if (m === null) return null;
      byte |= m << (6 - 2 * s);
    }
    out.push(byte);
  }
  return out;
}

/** Weekly schedule: profile 1..3 per day, 2 bits per day, 2 bytes */
var FLOW_WEEK_DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
function flowWeeklySchedule(errors, key, value) {
  if (!value || typeof value !== "object") {
    errors.push(key + ": object with monday..sunday expected");
    return null;
  }
  var p = [];
  for (var i = 0; i < 7; i++) {
    var day = FLOW_WEEK_DAYS[i];
    if (!(day in value)) {
      errors.push(key + ": missing day " + day);
      return null;
    }
    var v = flowInt(errors, key + "." + day, value[day], 1, 3);
    if (v === null) return null;
    p.push(v - 1); // profile 1..3 -> 0..2
  }
  return [
    (p[0] << 6) | (p[1] << 4) | (p[2] << 2) | p[3], // mon tue wed thu
    (p[4] << 6) | (p[5] << 4) | (p[6] << 2),        // fri sat sun + 2 unused bits
  ];
}

/** {month:1-12, day:1-31} -> 2 bytes */
function flowDate(errors, key, value) {
  if (!value || typeof value !== "object") {
    errors.push(key + ": object {month, day} expected");
    return null;
  }
  var m = flowInt(errors, key + ".month", value.month, 1, 12);
  var d = flowInt(errors, key + ".day", value.day, 1, 31);
  if (m === null || d === null) return null;
  return [m, d];
}

/* -------------------------------------------------------------------------
 * Encoder
 * ---------------------------------------------------------------------- */
function encodeDownlink(input) {
  var errors = [];
  var warnings = [];
  var commands = []; // { id: <number>, data: [<bytes>] }
  var trailing = []; // raw bytes appended after the sorted commands
  var i, j;

  var data = (input && input.data) || {};

  function add(id, dataBytes) {
    // null anywhere means a validation error was already recorded: skip the command
    if (dataBytes === null) return;
    for (var k = 0; k < dataBytes.length; k++) {
      if (dataBytes[k] === null || dataBytes[k] === undefined) return;
    }
    commands.push({ id: id, data: dataBytes });
  }

  var keys = Object.keys(data);
  for (i = 0; i < keys.length; i++) {
    var key = keys[i];
    var v = data[key];
    switch (key) {
      /* --- maintenance / network ------------------------------------- */
      case "getConfiguration": // 0x01 - force a configuration uplink
        add(0x01, []);
        break;

      case "setNfcEnabled": // 0x0A
        add(0x0a, [flowBool(errors, key, v)]);
        break;

      case "setDelayedNetworkJoin": { // 0x1C - 10..10080 min, step 10, 2 bytes
        var raw = flowScaled(errors, warnings, key, v, 0.1, 0, 1, 1008, " min", 10);
        add(0x1c, raw === null ? null : [(raw >> 8) & 0xff, raw & 0xff]);
        break;
      }

      case "deviceReset": // 0x4A
        add(0x4a, [0x01]);
        break;

      case "factoryReset": // 0x4B
        add(0x4b, [0x01]);
        break;

      case "recalibrateMotor": // 0x8C
        add(0x8c, []);
        break;

      case "setFuotaMode": // 0x97
        add(0x97, [flowBool(errors, key, v)]);
        break;

      /* --- measurement / regulation ---------------------------------- */
      case "setTimeZone": // 0x63 - UTC-12..UTC+14
        add(0x63, [flowScaled(errors, warnings, key, v, 1, 12, 0, 26, " h", 1)]);
        break;

      case "setTemperatureOffset": // 0x72 - -5.0..+5.0 C, step 0.1
        add(0x72, [flowScaled(errors, warnings, key, v, 10, 50, 0, 100, "C", 0.1)]);
        break;

      case "setOpenWindowDetection": // 0x73
        add(0x73, [flowBool(errors, key, v)]);
        break;

      case "setOpenWindowDelta": // 0x74 - 0.1..3.0 C
        add(0x74, [flowScaled(errors, warnings, key, v, 10, 0, 1, 30, "C", 0.1)]);
        break;

      case "setOpenWindowPauseDuration": // 0x75 - 1..60 min
        add(0x75, [flowInt(errors, key, v, 1, 60)]);
        break;

      case "setTemperatureHysteresis": // 0x94 - 0.1..9.9 C
        add(0x94, [flowScaled(errors, warnings, key, v, 10, 0, 1, 99, "C", 0.1)]);
        break;

      case "setRegulation": // 0x79
        add(0x79, [flowBool(errors, key, v)]);
        break;

      case "setValvePositionWhenRegulationOff": // 0x98 - 0..100 %
        add(0x98, [flowInt(errors, key, v, 0, 100)]);
        break;

      case "setLowBatteryValvePosition": // 0x8B - 0..99 %
        add(0x8b, [flowInt(errors, key, v, 0, 99)]);
        break;

      /* --- manual setpoint ------------------------------------------- */
      case "setTargetTemperature": // 0x8A
        add(0x8a, [flowSetpoint(errors, warnings, key, v)]);
        break;

      case "setMinTemperature": // 0x77
        add(0x77, [flowSetpoint(errors, warnings, key, v)]);
        break;

      case "setMaxTemperature": // 0x78
        add(0x78, [flowSetpoint(errors, warnings, key, v)]);
        break;

      case "setChildLock": // 0x76
        add(0x76, [flowBool(errors, key, v)]);
        break;

      case "setChildLockOnNetworkLoss": // 0x93
        add(0x93, [flowBool(errors, key, v)]);
        break;

      case "setBoost": // 0x90
        add(0x90, [flowBool(errors, key, v)]);
        break;

      case "setBoostDuration": { // 0x91 - 10..120 min, step 10 (raw = minutes)
        var boost = flowScaled(errors, warnings, key, v, 0.1, 0, 1, 12, " min", 10);
        add(0x91, boost === null ? null : [boost * 10]);
        break;
      }

      case "setSetpointDisplayOrientation": // 0x9A - "horizontal" | "vertical"
        add(0x9a, [flowOrientation(errors, key, v)]);
        break;

      /* --- automatic setpoint / schedules ----------------------------- */
      case "setFrostProtection": // 0x7A
        add(0x7a, [flowBool(errors, key, v)]);
        break;

      case "setFrostProtectionTemperature": // 0x7B
        add(0x7b, [flowSetpoint(errors, warnings, key, v)]);
        break;

      case "setComfortTemperature": // 0x7C
        add(0x7c, [flowSetpoint(errors, warnings, key, v)]);
        break;

      case "setEcoTemperature": // 0x7D
        add(0x7d, [flowSetpoint(errors, warnings, key, v)]);
        break;

      case "setAwayTemperature": // 0x7E - "absence prolongee"
        add(0x7e, [flowSetpoint(errors, warnings, key, v)]);
        break;

      case "setHeatingSeason": // 0x7F
        add(0x7f, [flowBool(errors, key, v)]);
        break;

      case "setHeatingSeasonStart": // 0x80 - {month, day}
        add(0x80, flowDate(errors, key, v));
        break;

      case "setHeatingSeasonEnd": // 0x81 - {month, day}
        add(0x81, flowDate(errors, key, v));
        break;

      case "setSchedules": // 0x95
        add(0x95, [flowBool(errors, key, v)]);
        break;

      case "setWeeklySchedule": // 0x82 - {monday:1..3, ...}
        add(0x82, flowWeeklySchedule(errors, key, v));
        break;

      case "setDailyProfile1": // 0x83 - 48 slots
        add(0x83, flowDailyProfile(errors, key, v));
        break;

      case "setDailyProfile2": // 0x84
        add(0x84, flowDailyProfile(errors, key, v));
        break;

      case "setDailyProfile3": // 0x85
        add(0x85, flowDailyProfile(errors, key, v));
        break;

      /* --- transmission periods --------------------------------------- */
      case "setUplinkPeriodRegulationOn": // 0x86 - 10..60 min, step 10
        add(0x86, [flowScaled(errors, warnings, key, v, 0.1, 0, 1, 6, " min", 10)]);
        break;

      case "setUplinkPeriodRegulationOff": // 0x87 - 10..1440 min, step 10
        add(0x87, [flowScaled(errors, warnings, key, v, 0.1, 0, 1, 144, " min", 10)]);
        break;

      /* --- escape hatch ------------------------------------------------
       * Raw "CmdID + DATA" hex string, appended AFTER the encoded commands
       * (the 0x55 header is added by the encoder, do not include it).
       */
      case "sendCustomHexCommand": {
        var hex = String(v).replace(/[\s:]/g, "");
        if (!/^[0-9a-fA-F]*$/.test(hex) || hex.length % 2 !== 0) {
          errors.push(key + ": even-length hexadecimal string expected, got " + JSON.stringify(v));
          break;
        }
        for (j = 0; j < hex.length; j += 2) {
          trailing.push(parseInt(hex.substring(j, j + 2), 16));
        }
        break;
      }

      default:
        errors.push('unknown command "' + key + '"');
        break;
    }
  }

  if (commands.length === 0 && trailing.length === 0 && errors.length === 0) {
    errors.push("empty downlink: no command provided");
  }

  // NEXELEC recommends ascending command IDs for forward compatibility.
  commands.sort(function (a, b) {
    return a.id - b.id;
  });

  var bytes = [FLOW_HEADER];
  for (i = 0; i < commands.length; i++) {
    bytes.push(commands[i].id);
    for (j = 0; j < commands[i].data.length; j++) bytes.push(commands[i].data[j]);
  }
  for (i = 0; i < trailing.length; i++) bytes.push(trailing[i]);

  if (bytes.length > 51) {
    warnings.push(
      "frame is " + bytes.length + " bytes: it may exceed the max payload size " +
      "of the current data rate (51 bytes at DR0-DR2 in EU868). Split it."
    );
  }

  if (errors.length > 0) {
    return { bytes: [], fPort: FLOW_FPORT, warnings: warnings, errors: errors };
  }

  return { bytes: bytes, fPort: FLOW_FPORT, warnings: warnings, errors: errors };
}

/* -------------------------------------------------------------------------
 * Decoder (used by the network server to display a downlink it is about to
 * send). Parses the frame back into the same JSON structure.
 * ---------------------------------------------------------------------- */
function decodeDownlink(input) {
  var bytes = input.bytes || [];
  var errors = [];
  var warnings = [];
  var data = {};

  function hex(arr) {
    return arr.map(function (b) { return ("0" + b.toString(16)).slice(-2).toUpperCase(); }).join("");
  }
  function setpoint(b) { return b / 2; }
  function slots(arr) {
    var names = ["frost", "comfort", "eco", "away"];
    var out = [];
    for (var k = 0; k < arr.length; k++) {
      for (var s = 0; s < 4; s++) out.push(names[(arr[k] >> (6 - 2 * s)) & 0x03]);
    }
    return out;
  }

  if (bytes.length === 0) {
    errors.push("empty payload");
    return { data: {}, warnings: warnings, errors: errors };
  }
  if (bytes[0] !== FLOW_HEADER) {
    errors.push("bad header: expected 0x55, got 0x" + hex([bytes[0]]));
    return { data: { raw: hex(bytes) }, warnings: warnings, errors: errors };
  }

  var i = 1;
  while (i < bytes.length) {
    var id = bytes[i++];
    var def = FLOW_COMMANDS[id];
    if (!def) {
      errors.push("unknown command ID 0x" + hex([id]) + " at offset " + (i - 1));
      data.raw = hex(bytes);
      break;
    }
    if (i + def.len > bytes.length) {
      errors.push("truncated payload for command " + def.name);
      break;
    }
    var p = bytes.slice(i, i + def.len);
    i += def.len;

    switch (id) {
      case 0x01: data.getConfiguration = ""; break;
      case 0x0a: data.setNfcEnabled = p[0] === 1; break;
      case 0x1c: data.setDelayedNetworkJoin = ((p[0] << 8) | p[1]) * 10; break;
      case 0x4a: data.deviceReset = ""; break;
      case 0x4b: data.factoryReset = ""; break;
      case 0x63: data.setTimeZone = p[0] - 12; break;
      case 0x72: data.setTemperatureOffset = (p[0] - 50) / 10; break;
      case 0x73: data.setOpenWindowDetection = p[0] === 1; break;
      case 0x74: data.setOpenWindowDelta = p[0] / 10; break;
      case 0x75: data.setOpenWindowPauseDuration = p[0]; break;
      case 0x76: data.setChildLock = p[0] === 1; break;
      case 0x77: data.setMinTemperature = setpoint(p[0]); break;
      case 0x78: data.setMaxTemperature = setpoint(p[0]); break;
      case 0x79: data.setRegulation = p[0] === 1; break;
      case 0x7a: data.setFrostProtection = p[0] === 1; break;
      case 0x7b: data.setFrostProtectionTemperature = setpoint(p[0]); break;
      case 0x7c: data.setComfortTemperature = setpoint(p[0]); break;
      case 0x7d: data.setEcoTemperature = setpoint(p[0]); break;
      case 0x7e: data.setAwayTemperature = setpoint(p[0]); break;
      case 0x7f: data.setHeatingSeason = p[0] === 1; break;
      case 0x80: data.setHeatingSeasonStart = { month: p[0], day: p[1] }; break;
      case 0x81: data.setHeatingSeasonEnd = { month: p[0], day: p[1] }; break;
      case 0x82: {
        var w = {};
        for (var d = 0; d < 7; d++) {
          var byte = p[d < 4 ? 0 : 1];
          var shift = 6 - 2 * (d % 4);
          w[FLOW_WEEK_DAYS[d]] = ((byte >> shift) & 0x03) + 1;
        }
        data.setWeeklySchedule = w;
        break;
      }
      case 0x83: data.setDailyProfile1 = slots(p); break;
      case 0x84: data.setDailyProfile2 = slots(p); break;
      case 0x85: data.setDailyProfile3 = slots(p); break;
      case 0x86: data.setUplinkPeriodRegulationOn = p[0] * 10; break;
      case 0x87: data.setUplinkPeriodRegulationOff = p[0] * 10; break;
      case 0x8a: data.setTargetTemperature = setpoint(p[0]); break;
      case 0x8b: data.setLowBatteryValvePosition = p[0]; break;
      case 0x8c: data.recalibrateMotor = ""; break;
      case 0x90: data.setBoost = p[0] === 1; break;
      case 0x91: data.setBoostDuration = p[0]; break;
      case 0x93: data.setChildLockOnNetworkLoss = p[0] === 1; break;
      case 0x94: data.setTemperatureHysteresis = p[0] / 10; break;
      case 0x95: data.setSchedules = p[0] === 1; break;
      case 0x97: data.setFuotaMode = p[0] === 1; break;
      case 0x98: data.setValvePositionWhenRegulationOff = p[0]; break;
      case 0x9a: data.setSetpointDisplayOrientation = p[0] === 1 ? "vertical" : "horizontal"; break;
      default: break;
    }
  }

  return { data: data, warnings: warnings, errors: errors };
}

/* -------------------------------------------------------------------------
 * Examples (port 56)
 *
 * {"setChildLock": true}                         --> 55 76 01   (doc, ex. 1)
 * {"setTargetTemperature": 20}                   --> 55 8A 28
 * {"setTargetTemperature": 19.5}                 --> 55 8A 27
 * {"setMinTemperature": 16, "setMaxTemperature": 24}
 *                                                --> 55 77 20 78 30
 * {"setTemperatureOffset": -1.5}                 --> 55 72 23
 * {"setOpenWindowDetection": true, "setOpenWindowDelta": 1.5,
 *  "setOpenWindowPauseDuration": 15}             --> 55 73 01 74 0F 75 0F
 * {"setUplinkPeriodRegulationOn": 30}            --> 55 86 03
 * {"setDelayedNetworkJoin": 1440}                --> 55 1C 00 90
 * {"recalibrateMotor": ""}                       --> 55 8C
 * {"factoryReset": ""}                           --> 55 4B 01
 * {"setTimeZone": 1}                             --> 55 63 0D
 * {"setWeeklySchedule": {"monday":1,"tuesday":1,"wednesday":2,"thursday":1,
 *                        "friday":1,"saturday":3,"sunday":3}}
 *                                                --> 55 82 04 28
 * {"setFuotaMode": true}                         --> 55 97 01
 * {"setSetpointDisplayOrientation": "vertical"}  --> 55 9A 01
 * {"sendCustomHexCommand": "7601"}               --> 55 76 01
 * ---------------------------------------------------------------------- */

exports.decodeUplink = decodeUplink;
exports.encodeDownlink = encodeDownlink;
exports.decodeDownlink = decodeDownlink;
