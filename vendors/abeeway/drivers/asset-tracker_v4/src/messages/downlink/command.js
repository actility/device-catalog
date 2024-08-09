const Command = Object.freeze({
    CLEAR_AND_RESET: "CLEAR_AND_RESET",
    RESET: "RESET",
    START_SOS: "START_SOS",
    STOP_SOS: "STOP_SOS",
    SYS_STATUS_REQ: "SYSTEM_STATUS_REQUEST",
    POSITION_ON_DEMAND: "POSITION_ON_DEMAND"
});

function determineCommand(value){
    switch(value){
        case 0:
            return Command.CLEAR_AND_RESET;
        case 1:
            return Command.RESET;
        case 2:
            return Command.START_SOS;
        case 3:
            return Command.STOP_SOS;
        case 4:
            return Command.SYS_STATUS_REQ;
        case 5:
            return Command.POSITION_ON_DEMAND;
        default:
            throw new Error("Unknown command");
    }

}

function encodeCommand(data){
    let encode = [] 
    // encode type and ackToken
    encode[0] = (0x01 <<3) | data.ackToken
    let value = data.commandType
    let command
    switch(value){
        case "CLEAR_AND_RESET":
            command = 0;
            break;
        case "RESET":
            command = 1;
            break;
        case "START_SOS":
            command = 2;
            break;
        case "STOP_SOS":
            command = 3;
            break;
        case "SYS_STATUS_REQ":
            command = 4;
            break;
        case "POSITION_ON_DEMAND":
            command = 5;
            break;
        default:
            throw new Error("Unknown command");
    }
    encode[1] = command 
    return encode
}

module.exports = {
    Command: Command,
    determineCommand: determineCommand,
    encodeCommand: encodeCommand
}