const Command = Object.freeze({
    CLEAR_AND_RESET: "CLEAR_AND_RESET",
    RESET: "RESET",
    START_SOS: "START_SOS",
    STOP_SOS: "STOP_SOS",
    SYS_STATUS_REQ: "SYS_STATUS_REQ",
    POSITION_ON_DEMAND: "POSITION_ON_DEMAND"
});

function determineCommand(payload){

}

function encodeCommand(data){

}

module.exports = {
    Command: Command,
    determineCommand: determineCommand,
    encodeCommand: encodeCommand
}