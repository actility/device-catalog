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
    CLEAR_MOTION_PERCENTAGE: "CLEAR_MOTION_PERCENTAGE",
    GET_DATA_BUFFERING_ENTRIES : "GET_DATA_BUFFERING_ENTRIES",
    CLEAR_ALL_DATA_BUFFERING : "CLEAR_ALL_DATA_BUFFERING"

});
function Command(command, classId, eventType, beginUtcTime, duration, bufferedDataType) {
    this.commandType = command;
    this.classId = classId;
    this.eventType = eventType;
    this.beginUtcTime = beginUtcTime;
    this.duration = duration;
    this.bufferedDataType = bufferedDataType;
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
        CommandType.CLEAR_MOTION_PERCENTAGE,
        CommandType.GET_DATA_BUFFERING_ENTRIES,
        CommandType.CLEAR_ALL_DATA_BUFFERING
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
    if (command === 12) { // GET_DATA_BUFFERING_ENTRIES

           // Support either beginDate (number) or beginUtcTime (string)
        let begin;

        if (data.beginUtcTime) {
            const date = new Date(data.beginUtcTime);
            if (isNaN(date.getTime())) {
                throw new Error("Invalid beginUtcTime format");
            }
            begin = Math.floor(date.getTime() / 1000); // convert to Unix timestamp (seconds)
        } else {
            throw new Error("Missing beginUtcTime");
        }
        //const begin = data.beginDate >>> 0;
        encode[2] = (begin >>> 24) & 0xff;
        encode[3] = (begin >>> 16) & 0xff;
        encode[4] = (begin >>> 8) & 0xff;
        encode[5] = begin & 0xff;

        const dur = data.duration & 0xffff;
        encode[6] = (dur >>> 8) & 0xff;
        encode[7] = dur & 0xff;
    
        encode[8] = encodeBufferedDataType(data.bufferedDataType);
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
    if (command === CommandType.GET_DATA_BUFFERING_ENTRIES) {
        if (bytes.length < 7) throw new Error("Invalid DATA_BUFFERING_ENTRIES byte array length");

        const begin =
            (bytes[1] << 24) |
            (bytes[2] << 16) |
            (bytes[3] << 8) |
            bytes[4];
        const beginSeconds = begin >>> 0;
        decoded.beginUtcTime = new Date(beginSeconds * 1000).toISOString();
        const duration = (bytes[5] << 8) | bytes[6];
        decoded.duration = duration;

        decoded.bufferedDataType = decodeBufferedDataType(bytes[7]);
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

function encodeBufferedDataType(flags) {
    let mask = 0;
    if (flags.position)      mask |= 0x01; // bit 0
    if (flags.notification)  mask |= 0x02; // bit 1
    if (flags.telemetry)      mask |= 0x04; // bit 2
    return mask;
}
function decodeBufferedDataType(mask) {
    return {
        position:     (mask & 0x01) !== 0, // bit 0
        notification: (mask & 0x02) !== 0, // bit 1
        telemetry:    (mask & 0x04) !== 0  // bit 2
    };
}

module.exports = {
    Command: Command,
    decodeCommand: decodeCommand,
    encodeCommand: encodeCommand
}