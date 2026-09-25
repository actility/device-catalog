
let util = require("../../../util");

function Accelerometer (accelerationVector, motionPercent, gaddIndex, numberShocks){

    this.accelerationVector = accelerationVector;
    this.motionPercent = motionPercent;
    this.gaddIndex = gaddIndex;
    this.numberShocks = numberShocks;
}
function determineAxis(payload, byteNumber){
    if (payload.length < (byteNumber + 2)){
        throw new Error("The payload is not valid to determine axis value");
    }
    let value = (payload[byteNumber]<<8)+payload[byteNumber+1];
    value = util.convertNegativeInt(value, 2)
    return value
}

function determineAccelerationVector(payload, xOffset, yOffset, zOffset){
    let x = determineAxis(payload, xOffset);
    let y = determineAxis(payload, yOffset);
    let z = determineAxis(payload, zOffset);
    return [x,y,z];
}
function determineGaddIndex(payload){
    if (payload.length >= 16) {
        // fw v1.6+: 4-byte GADD index at offset 11-14
        return ((payload[11] << 24) | (payload[12] << 16) | (payload[13] << 8) | payload[14]) >>> 0;
    } else if (payload.length >= 13) {
        // fw v1.5: 1-byte GADD index at offset 11
        return payload[11];
    }
    throw new Error("The payload is not valid to determine GADD index");
}
function determineMotion(payload){
    if (payload.length < 11){
        throw new Error("The payload is not valid to determine Motion");
    }
return payload[11]
}
function determineNumberShocks(payload){
    if (payload.length >= 16) {
        // fw v1.6+: number of shocks at offset 15
        return payload[15];
    } else if (payload.length >= 13) {
        // fw v1.5: number of shocks at offset 12
        return payload[12];
    }
    throw new Error("The payload is not valid to determine number of shocks");
}

const AcceleroType = Object.freeze({
    MOTION_START: "MOTION_START",
    MOTION_END: "MOTION_END",
    SHOCK: "SHOCK"
})

module.exports = {
    Accelerometer: Accelerometer,
    determineAccelerationVector: determineAccelerationVector,
    determineGaddIndex : determineGaddIndex,
    determineNumberShocks : determineNumberShocks,
    determineMotion: determineMotion,
    AcceleroType: AcceleroType,
}
