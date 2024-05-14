let abeewayUplinkPayloadClass = require("./abeewayUplinkPayload");

const batteryStatus = Object.freeze({
    CHARGING: "CHARGING",
    OPERATING: "OPERATING",
    UNKNOWN: "UNKNOWN"
});

function Header(sos,
    type,
    ackToken,
    appState,
    batteryLevel,
    timestamp){
        this.sos = sos;
        this.type = type;
        this.ackToken = ackToken;
        this.appState = appState;
        this.batteryLevel = batteryLevel;
        this.timestamp = timestamp;
}

function determineHeader(payload){
    if (payload.length < 3)
        throw new Error("The payload is not valid to determine header");
    var sos = !!(payload[0]>>6 & 0x01);
    var ackToken = payload[0] & 0x07;
    var type = determineMessageType(payload);
    var appState = payload[1]>>7 & 0x01;
    var batteryLevel = determineBatteryLevel(payload);
    var timestamp = payload[2]<<8 + payload[3];
    return new Header(sos, type, ackToken, appState, batteryLevel, timestamp)
}

function determineMessageType(payload){
    if (payload.length < 4)
        throw new Error("The payload is not valid to determine Message Type");
    var messageType = payload[0]>>3 & 0x07;
    
    switch (messageType){
        case 1:
            return abeewayUplinkPayloadClass.messageType.NOTIFICATION;
        case 2:
            return abeewayUplinkPayloadClass.messageType.POSITION;
        case 3:
            return abeewayUplinkPayloadClass.messageType.QUERY;
        case 4:
            return abeewayUplinkPayloadClass.messageType.RESPONSE;
        default:
            return abeewayUplinkPayloadClass.messageType.UNKNOWN;
    }
}

function determineBatteryLevel(payload){
    if (payload.length < 4)
        throw new Error("The payload is not valid to determine Battery Level");
    var value = payload[1] & 0x7F;
    if (value == 0)
        return batteryStatus.CHARGING;
    else if (value == 127)
        return batteryStatus.UNKNOWN; 
    return value;
}

module.exports = {
    Header: Header,
    determineHeader: determineHeader
}