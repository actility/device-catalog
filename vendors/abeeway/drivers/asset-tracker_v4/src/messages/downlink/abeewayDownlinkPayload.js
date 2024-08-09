const MessageType = Object.freeze({
    COMMAND: "COMMAND",
    REQUEST: "REQUEST",
    ANSWER: "ANSWER"
});

function AbeewayDownlinkPayload(downMessageType, 
        ackToken,
        command,
        request,
        payload) {
        this.downMessageType = downMessageType;
        this.ackToken = ackToken;
        this.command = command;
        this.request = request;
        this.payload = payload;
}

function determineDownlinkHeader(payload){
    if (payload.length < 1)
        throw new Error("The payload is not valid to determine header");
    var ackToken = payload[0] & 0x07;
    var type = determineMessageType(payload);
    return new AbeewayDownlinkPayload(type, ackToken)
}

function determineMessageType(payload){
    var messageType = payload[0]>>3 & 0x07;
    
    switch (messageType){
        case 1:
            return MessageType.COMMAND;
        case 2:
            return MessageType.REQUEST;
        case 3:
            return MessageType.ANSWER;
    }
}

module.exports = {
    AbeewayDownlinkPayload: AbeewayDownlinkPayload,
    MessageType: MessageType,
    determineDownlinkHeader: determineDownlinkHeader
}