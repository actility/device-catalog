
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

function determineAccelerationVector(payload){
    let x = determineAxis(payload, 5);
    let y = determineAxis(payload, 7);
    let z = determineAxis(payload, 9);
    return [x,y,z];
}
function determineGaddIndex(payload){
    if (payload.length < 11){
        throw new Error("The payload is not valid to determine GADD index");
    }
return payload[11]
}  
function determineMotion(payload){
    if (payload.length < 11){
        throw new Error("The payload is not valid to determine Motion");
    }
return payload[11]
}  
function determineNumberShocks(payload){
    if (payload.length < 12){
        throw new Error("The payload is not valid to determine number of shocks");
    }
return payload[12]
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