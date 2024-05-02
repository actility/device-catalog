let systemClass = require("./system");

const Class = Object.freeze({
    SYSTEM: "SYSTEM",
    SOS: "SOS",
    TEMPERATURE: "TEMPERATURE",
    ACCELEROMETER: "ACCELEROMETER",
    NETWORK: "NETWORK",
    GEOZONING: "GEOZONING"
})

const SystemType = Object.freeze({
    STATUS: "STATUS",
    LOW_BATTERY: "LOW_BATTERY",
    BLE_CONNECTED_SEC: "BLE_CONNECTED_SEC",
    BLE_DISCONNECTED: "BLE_DISCONNECTED"
})

const SosType = Object.freeze({
    SOS_ON: "SOS_ON",
    SOS_OFF: "SOS_ON"
})

const TempType = Object.freeze({
    TEMP_HIGH: "TEMP_HIGH",
    TEMP_LOW: "TEMP_LOW",
    TEMP_NORMAL: "TEMP_NORMAL"
})

const AcceleroType = Object.freeze({
    MOTION_START: "MOTION_START",
    MOTION_END: "MOTION_END",
    SHOCK: "SHOCK"
})

const NetworkType = Object.freeze({
    MAIN_UP: "MAIN_UP",
    BACKUP_UP: "BACKUP_UP"
})

const GeozoningType = Object.freeze({
    ENTRY: "ENTRY",
    EXIT: "EXIT",
    IN_HAZARD: "IN_HAZARD",
    OUT_HAZARD: "OUT_HAZARD",
    MEETING_POINT: "MEETING_POINT"
})

function Notification(notificationClass,
    notificationType,
    system,
    sos,
    temperature,
    accelerometer,
    network,
    geofencing){
    this.notificationClass = notificationClass;
    this.notificationType = notificationType;
    this.system = system;
    this.sos = sos;
    this.temperature = temperature;
    this.accelerometer = accelerometer;
    this.network = network;
    this.geofencing = geofencing;
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
                    notificationMessage.notificationType = SystemType.STATUS;
                    notificationMessage.system = new systemClass.System(systemClass.determineStatus(payload),null);
                    //console.log(notificationMessage.system);
                    break;
                case 1:
                    notificationMessage.notificationType = SystemType.LOW_BATTERY;
                    break;
                case 2:
                    notificationMessage.notificationType = SystemType.BLE_CONNECTED_SEC;
                    break;
                case 3:
                    notificationMessage.notificationType = SystemType.BLE_DISCONNECTED;
                    break;
                default:
                    throw new Error("System Notification Type Unknown");
            }
            break;
        case 1:
            //TODO
            break;
        case 2:
            //TODO
            break;
        case 3:
            //TODO
            break;
        case 4:
            //TODO
            break;
        case 5:
            //TODO
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