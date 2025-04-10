let abeewayUplinkPayloadClass = require("./abeewayUplinkPayload");
const batteryStatus = Object.freeze({
    CHARGING: "CHARGING",
    OPERATING: "OPERATING",
    UNKNOWN: "UNKNOWN"
});

function Header(sos, type, ackToken, multiFrame, batteryLevel, timestamp) {
    this.sos = sos;
    this.type = type;
    this.ackToken = ackToken;
    this.multiFrame = multiFrame;
    this.batteryLevel = batteryLevel;
    this.timestamp = timestamp;
}

function determineHeader(payload, receivedTime) {
    if (payload.length < 3)
        throw new Error("The payload is not valid to determine header");
    var sos = !!(payload[0] >> 6 & 0x01);
    var ackToken = payload[0] & 0x07;
    var type = determineMessageType(payload);
    var multiFrame = !!(payload[0] >> 7 & 0x01);
    var batteryLevel = determineBatteryLevel(payload);
    var timestamp = rebuildTime(receivedTime, ((payload[2] << 8) + payload[3]));
    return new Header(sos, type, ackToken, multiFrame, batteryLevel, timestamp);
}

function rebuildTime(receivedTime, seconds) {
    // Parse the timestamp using native Date object
    const timestamp = new Date(receivedTime);

    // In the case where the tracker hasn't had time yet...
    if (seconds === 65535) {
        return timestamp.toISOString();
    }

    // Create a Date object set to the start of the UTC day
    const utcDate = new Date(Date.UTC(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate(), 0, 0, 0));

    // Calculate the total seconds since the start of the day for the received time
    const referenceTotalSeconds = (timestamp.getUTCHours() * 3600) + (timestamp.getUTCMinutes() * 60) + timestamp.getUTCSeconds();

    // Determine if the reference time is closer to midnight or noon
    let referenceTime;
    if (referenceTotalSeconds < 43200) { // 43200 seconds is 12 hours
        referenceTime = utcDate; // Midnight
    } else {
        referenceTime = new Date(utcDate.getTime() + 43200 * 1000); // Noon
    }

    // Add the given number of seconds to the reference time
    let exactTime = new Date(referenceTime.getTime() + seconds * 1000);

    // Check if the rebuilt time is after the original timestamp (rollover)
    if (exactTime > timestamp) {
        // Rebuilt time is after the received time, so subtract 43200 seconds (12 hours)
        exactTime = new Date(exactTime.getTime() - 43200 * 1000);
    }

    return exactTime.toISOString(); // Return the exact time in ISO 8601 format
}
function determineMessageType(payload){
    if (payload.length < 4)
        throw new Error("The payload is not valid to determine Message Type");
    var messageType = payload[0]>>3 & 0x07
    switch (messageType){
        case 1:
            return abeewayUplinkPayloadClass.messageType.NOTIFICATION;
        case 2:
            return abeewayUplinkPayloadClass.messageType.POSITION;
        case 3:
            return abeewayUplinkPayloadClass.messageType.QUERY;
        case 4:
            return abeewayUplinkPayloadClass.messageType.RESPONSE;
        case 5:
            return abeewayUplinkPayloadClass.messageType.TELEMETRY;
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