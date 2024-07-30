let systemClass = require("./system");
let temperatureClass = require ("./temperature")
let accelerometerClass = require("./accelerometer")
let networkClass = require("./network")
let geozoningClass = require("./geozoning")
let telemetryClass = require("./telemetry")

const Class = Object.freeze({
    SYSTEM: "SYSTEM",
    SOS: "SOS",
    TEMPERATURE: "TEMPERATURE",
    ACCELEROMETER: "ACCELEROMETER",
    NETWORK: "NETWORK",
    GEOZONING: "GEOZONING",
    TELEMETRY: "TELEMETRY"
})

const SosType = Object.freeze({
    SOS_ON: "SOS_ON",
    SOS_OFF: "SOS_OFF"
})



function Notification(notificationClass,
    notificationType,
    system,
    sos,
    temperature,
    accelerometer,
    network,
    geozoning,
    telemetry){
    this.notificationClass = notificationClass;
    this.notificationType = notificationType;
    this.system = system;
    this.sos = sos;
    this.temperature = temperature;
    this.accelerometer = accelerometer;
    this.network = network;
    this.geozoning = geozoning;
    this.telemetry = telemetry;
}

function determineNotification(payload){
    if (payload.length < 5)
        throw new Error("The payload is not valid to determine notification message");
    let notificationMessage = new Notification();
    let classValue = payload[4]>>4 & 0x0F;
    let typeValue = payload[4] & 0x0F;
    switch(classValue){
        case 0:
            notificationMessage.notificationClass = Class.SYSTEM;
            switch (typeValue){
                case 0:
                    notificationMessage.notificationType = systemClass.SystemType.STATUS
                    notificationMessage.system = new systemClass.System(systemClass.determineStatus(payload),null, null, null);
                    break;
                case 1:
                    notificationMessage.notificationType = systemClass.SystemType.LOW_BATTERY
                    notificationMessage.system = new systemClass.System( null, systemClass.determineLowBattery(payload), null);
                    break;
                case 2:
                    notificationMessage.notificationType = systemClass.SystemType.BLE_STATUS;
                    notificationMessage.system = new systemClass.System( null, null, systemClass.determineBleStatus(payload), null);
                    break;
                case 3:
                    notificationMessage.notificationType = systemClass.SystemType.TAMPER_DETECTION;
                    notificationMessage.system = new systemClass.System( null, null, null, systemClass.determineTamperDetection(payload));
                    break;
                default:
                    throw new Error("System Notification Type Unknown");
            }
            break;
        case 1:
            notificationMessage.notificationClass = Class.SOS
            switch (typeValue){
                case 0:
                    notificationMessage.notificationType = SosType.SOS_ON
                    break;
                case 1:
                    notificationMessage.notificationType = SosType.SOS_OFF
                    break;
                default:
                    throw new Error("SOS Notification Type Unknown");
            }
            break;
        case 2:
            notificationMessage.notificationClass = Class.TEMPERATURE
            switch (typeValue){
                case 0:
                    notificationMessage.notificationType = temperatureClass.TempType.TEMP_HIGH
                    notificationMessage.temperature = temperatureClass.determineTemperature(payload);
                    break;
                case 1:
                    notificationMessage.notificationType = temperatureClass.TempType.TEMP_LOW
                    notificationMessage.temperature = temperatureClass.determineTemperature(payload);
                    break;
                case 2:
                    notificationMessage.notificationType = temperatureClass.TempType.TEMP_NORMAL
                    notificationMessage.temperature = temperatureClass.determineTemperature(payload);
                    break;
                default:
                    throw new Error("Temperature Notification Type Unknown");
            }
            break;
        case 3:
            notificationMessage.notificationClass = Class.ACCELEROMETER
            switch (typeValue){
                case 0: 
                    notificationMessage.notificationType = accelerometerClass.AcceleroType.MOTION_START
                    break;
                case 1:
                    notificationMessage.notificationType = accelerometerClass.AcceleroType.MOTION_END
                    notificationMessage.accelerometer = new accelerometerClass.Accelerometer(accelerometerClass.determineAccelerationVector(payload), accelerometerClass.determineMotion(payload), null, null)
                    break;
                case 2:
                    notificationMessage.notificationType = accelerometerClass.AcceleroType.SHOCK
                    notificationMessage.accelerometer = new accelerometerClass.Accelerometer(accelerometerClass.determineAccelerationVector(payload), null, accelerometerClass.determineGaddIndex(payload), accelerometerClass.determineNumberShocks(payload))
                    break;
                default:
                    throw new Error("Accelerometer Notification Type Unknown");
            }
            break;
        case 4:
            notificationMessage.notificationClass = Class.NETWORK
            switch (typeValue){
                case 0: 
                    notificationMessage.notificationType = networkClass.NetworkType.MAIN_UP
                    notificationMessage.network = networkClass.determineNetworkInfo(payload)
                    break;
                case 1:
                    notificationMessage.notificationType = networkClass.NetworkType.BACKUP_UP
                    notificationMessage.network = networkClass.determineNetworkInfo(payload)
                    break;
                default:
                    throw new Error("Network Notification Type Unknown");
            }
            break;
        case 5:
            notificationMessage.notificationClass = Class.GEOZONING
            switch (typeValue){
                case 0: 
                    notificationMessage.notificationType = geozoningClass.GeozoningType.ENTRY;
                    break;
                case 1:
                    notificationMessage.notificationType = geozoningClass.GeozoningType.EXIT;
                    break;
                case 2:
                    notificationMessage.notificationType = geozoningClass.GeozoningType.IN_HAZARD;
                    break;
                case 3:
                    notificationMessage.notificationType = geozoningClass.GeozoningType.OUT_HAZARD;
                    break;
                case 4:
                    notificationMessage.notificationType = geozoningClass.GeozoningType.MEETING_POINT;
                    break;
                default:
                    throw new Error("Geozoning Notification Type Unknown");
            }

            break;
        case 6:
            notificationMessage.notificationClass = Class.TELEMETRY
            switch (typeValue){
                case 0: 
                    notificationMessage.notificationType = telemetryClass.TelemetryType.TELEMETRY;
                    notificationMessage.telemetry =  new telemetryClass.Telemetry(telemetryClass.determineTelemetryMeasurements(payload.slice(5)));
                    break;
                case 1:
                    notificationMessage.notificationType = telemetryClass.TelemetryType.TELEMETRY_MODE_BATCH;
                    break;
                default:
                    throw new Error("Telemetry Notification Type Unknown");
            }

            break;
        default:
            throw new Error("Notification Class Unknown");
    }
    return notificationMessage;


}


module.exports = {
    Notification: Notification,
    determineNotification: determineNotification
}