let eventClass = require("../uplink/notifications/notification")
const CommandType = Object.freeze({
    CLEAR_AND_RESET: "CLEAR_AND_RESET",
    RESET: "RESET",
    START_SOS: "START_SOS",
    STOP_SOS: "STOP_SOS",
    SYSTEM_STATUS_REQUEST: "SYSTEM_STATUS_REQUEST",
    POSITION_ON_DEMAND: "POSITION_ON_DEMAND",
    SET_GPS_ALMANAC: "SET_GPS_ALMANAC",
    SET_BEIDOU_ALMANAC: "SET_BEIDOU_ALMANAC",
    START_BLE_CONNECTIVITY: "START_BLE_CONNECTIVITY",
    STOP_BLE_CONNECTIVITY: "STOP_BLE_CONNECTIVITY",
    SYSTEM_EVENT: "SYSTEM_EVENT",
    CLEAR_MOTION_PERCENTAGE: "CLEAR_MOTION_PERCENTAGE"

});
function Command(command,classId,eventType){
    this.commandType = command;
    this.classId = classId;
    this.eventType = eventType;
}
function determineCommand(value) {
    const commands = [
        CommandType.CLEAR_AND_RESET,
        CommandType.RESET,
        CommandType.START_SOS,
        CommandType.STOP_SOS,
        CommandType.SYSTEM_STATUS_REQUEST,
        CommandType.POSITION_ON_DEMAND,
        CommandType.SET_GPS_ALMANAC,
        CommandType.SET_BEIDOU_ALMANAC,
        CommandType.START_BLE_CONNECTIVITY,
        CommandType.STOP_BLE_CONNECTIVITY,
        CommandType.SYSTEM_EVENT,
        CommandType.CLEAR_MOTION_PERCENTAGE
    ];
    return commands[value] || null; // Returns null if the command is unknown
}

function encodeCommand(data) {
    let encode = [];
    encode[0] = (0x01 << 3) | data.ackToken;

    let command = Object.values(CommandType).indexOf(data.commandType);
    if (command === -1) {
        throw new Error("Unknown command");
    }

    encode[1] = command;

    if (command === 10) { // SYSTEM_EVENT
        let classId = getClassId(data.classId);
        encode[2] = classId;
        encode[3] = data.eventType;
    }

    return encode;
}

function decodeCommand(bytes) {
    let decoded = new Command();
    let command = determineCommand(bytes[0]);

    if (!command) {
        throw new Error("Unknown command received");
    }

    decoded.commandType = command
    if (command === Command.SYSTEM_EVENT) {
        if (bytes.length < 4) {
            throw new Error("Invalid SYSTEM_EVENT byte array length");
        }
        decoded.classId = getClassName(bytes[1]);
        decoded.eventType = bytes[2];
    }
   
    return decoded;
}

// Convert classId to integer
function getClassId(className) {
    const classes = {
        [eventClass.Class.SYSTEM]: 0,
        [eventClass.Class.SOS]: 1,
        [eventClass.Class.TEMPERATURE]: 2,
        [eventClass.Class.ACCELEROMETER]: 3,
        [eventClass.Class.NETWORK]: 4,
        [eventClass.Class.GEOZONING]: 5
    };
    if (className in classes) {
        return classes[className];
    }
    throw new Error("Unknown class id");
}

//  Convert classId integer to class name
function getClassName(classId) {
    const classMap = {
        0: eventClass.Class.SYSTEM,
        1: eventClass.Class.SOS,
        2: eventClass.Class.TEMPERATURE,
        3: eventClass.Class.ACCELEROMETER,
        4: eventClass.Class.NETWORK,
        5: eventClass.Class.GEOZONING
    };
    return classMap[classId] || "UNKNOWN_CLASS";
}


module.exports = {
    Command: Command,
    decodeCommand: decodeCommand,
    encodeCommand: encodeCommand
}