let abeewayUplinkPayloadClass = require("./abeewayUplinkPayload");
const { parseISO, addSeconds, isAfter, subSeconds } = require('date-fns');
const batteryStatus = Object.freeze({
    CHARGING: "CHARGING",
    OPERATING: "OPERATING",
    UNKNOWN: "UNKNOWN"
});

function Header(sos,
    type,
    ackToken,
    multiFrame,
    batteryLevel,
    timestamp){
        this.sos = sos;
        this.type = type;
        this.ackToken = ackToken;
        this.multiFrame = multiFrame;
        this.batteryLevel = batteryLevel;
        this.timestamp = timestamp;
}

function determineHeader(payload , receivedTime){
    if (payload.length < 3)
        throw new Error("The payload is not valid to determine header");
    var sos = !!(payload[0]>>6 & 0x01);
    var ackToken = payload[0] & 0x07;
    var type = determineMessageType(payload);
    var multiFrame = !!(payload[0]>>7 & 0x01);
    var batteryLevel = determineBatteryLevel(payload);
    var timestamp = rebuildTime(receivedTime, ((payload[2]<<8) + payload[3]));
    return new Header(sos, type, ackToken, multiFrame, batteryLevel, timestamp)
}


function rebuildTime(receivedTime, seconds) {
    // Parse the timestamp : 
    const timestamp = parseISO(receivedTime);
    const dd = timestamp.getFullYear()
    const hh = timestamp.getMonth();
    const sh = timestamp.getDate();
    const utcDate = new Date(Date.UTC(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate(), 0, 0, 0))


    // Get the reference time's hours, minutes, and seconds
    const referenceHours = timestamp.getHours();
    const referenceMinutes = timestamp.getMinutes();
    const referenceSeconds = timestamp.getSeconds();

    // Convert reference time to total seconds since the start of the day
    const referenceTotalSeconds = (referenceHours * 3600) + (referenceMinutes * 60) + referenceSeconds;	
    // Determine if reference time is midnight or noon
    let referenceTime;

     if (referenceTotalSeconds < 43200) { // 43200 seconds is 12 hours
         referenceTime = utcDate // Midnight
     } else {
         referenceTime = addSeconds(utcDate, 43200); // Noon
     }
    // Add the given number of seconds to the reference time
    let exactTime = addSeconds(referenceTime, seconds);
    
     // Check if the rebuilt time is after the reference time (rollover)

     
     if (isAfter(exactTime, timestamp)) {
     //Rebuilt time is after the received time. Performing subtraction of 43200 seconds.
     exactTime = subSeconds(exactTime, 43200); // Subtract 43200 seconds
  }
 return   exactTime.toISOString(); // Return the exact time in ISO 8601 format
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