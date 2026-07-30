const SystemEventClass = Object.freeze({
    BUTTON_1: "BUTTON_1",
    BUTTON_2: "BUTTON_2",
    BUZZER: "BUZZER",
    ACCELEROMETER: "ACCELEROMETER",
    POWER: "POWER",
    TEMPERATURE: "TEMPERATURE",
    GEOLOCATION: "GEOLOCATION",
    CONFIGURATION: "CONFIGURATION",
    NETWORK: "NETWORK",
    CORE: "CORE",
    BLE: "BLE",
    USER: "USER",
    FUOTA: "FUOTA"
});
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
    GET_DATA_BUFFERING_ENTRIES: "GET_DATA_BUFFERING_ENTRIES",
    CLEAR_ALL_DATA_BUFFERING: "CLEAR_ALL_DATA_BUFFERING",
    CLEAR_BLE_BOND_DATA: "CLEAR_BLE_BOND_DATA"


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
        CommandType.CLEAR_ALL_DATA_BUFFERING,
        CommandType.CLEAR_BLE_BOND_DATA
    ];
    return commands[value] || null; // Returns null if the command is unknown
}

function encodeCommand(data) {
    let encode = [];
    encode[0] = (0x01 << 3) | data.ackToken;

    let command = Object.values(CommandType).indexOf(data.commandType);
    if (command === -1) {
        throw new Error("Command unknown");
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
    if (command === CommandType.SYSTEM_EVENT) {
        if (bytes.length < 3) {
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
        [SystemEventClass.BUTTON_1]: 0,
        [SystemEventClass.BUTTON_2]: 1,
        [SystemEventClass.BUZZER]: 2,
        [SystemEventClass.ACCELEROMETER]: 3,
        [SystemEventClass.POWER]: 4,
        [SystemEventClass.TEMPERATURE]: 5,
        [SystemEventClass.GEOLOCATION]: 6,
        [SystemEventClass.CONFIGURATION]: 7,
        [SystemEventClass.NETWORK]: 8,
        [SystemEventClass.CORE]: 9,
        [SystemEventClass.BLE]: 10,
        [SystemEventClass.USER]: 11,
        [SystemEventClass.FUOTA]: 12
    };
    if (className in classes) {
        return classes[className];
    }
    throw new Error("Unknown class id");
}

//  Convert classId integer to class name
function getClassName(classId) {
    const classMap = {
        0: SystemEventClass.BUTTON_1,
        1: SystemEventClass.BUTTON_2,
        2: SystemEventClass.BUZZER,
        3: SystemEventClass.ACCELEROMETER,
        4: SystemEventClass.POWER,
        5: SystemEventClass.TEMPERATURE,
        6: SystemEventClass.GEOLOCATION,
        7: SystemEventClass.CONFIGURATION,
        8: SystemEventClass.NETWORK,
        9: SystemEventClass.CORE,
        10: SystemEventClass.BLE,
        11: SystemEventClass.USER,
        12: SystemEventClass.FUOTA
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