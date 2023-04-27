function twosHexToDecimal(input){
    // Convert hex string to integer
    let intVal = parseInt(hexStr, 16);

    // Check if the most significant bit is set (i.e., negative number)
    if ((intVal & 0x80000000) !== 0) {
        // Compute the two's complement by inverting all bits and adding one
        intVal = (~intVal & 0xFFFFFFFF) + 1;
        // Convert back to negative integer
        intVal = -intVal;
    }

    return intVal;
}

function hexToDecimal(input){
    return parseInt(input, 16);
}


function decodeUplink(input){
    var result = {};

    var frameType = input.slice(0, 2);
    var payloadByteLength = input.length/2;

    switch(frameType){
        case 11:
            if(payloadByteLength != 21){
                result.errors = ["Payload ust be 21 bytes long."];
                return result;
            }
            var motionState = "";
            switch(hexToDec(input.slice(28, 30))){
                case 0:
                    motionState = "MOTION_UNKNOWN";
                    break;
                case 1:
                    motionState = "MOTION_START";
                    break;
                case 2:
                    motionState = "MOTION_ACTIVE";
                    break;
                case 3:
                    motionState = "MOTION_STOP";
                    break;
                default:
                    motionState = "Motion state unreadable";
            }
            result.data = {
                frameType: "GNSS frame",
                frameVersion: hexToDecimal(input.slice(2, 4)),
                latitude: twosHexToDecimal(input.slice(4, 12))/1000000,
                longitude: twosHexToDecimal(input.slice(12, 20))/1000000,
                gnssCount: hexToDecimal(input.slice(20, 24)),
                tripID: hexToDecimal(input.slice(24, 28)),
                motionState: motionState,
                TTFF: hexToDecimal(input.slice(30, 32)),
                nbrOfSats: hexToDecimal(input.slice(32, 34)),
                HDOP: hexToDecimal(input.slice(34, 38))/100,
                EPE: hexToDecimal(input.slice(38, 42))/100,
            }
            break;
        case 12:
            if(payloadByteLength != 8){
                result.errors = ["Payload must be 8 bytes long."];
                return result;
            }
            var trackerMode = "";
            switch(hexToDecimal(input.slice(14, 16))){
                case 1:
                    trackerMode = "TRACKER_NORMAL";
                    break;
                case 2:
                    trackerMode = "TRACKER_DYNAMIC";
                    break;
                case 3:
                    trackerMode = "TRACKER_START_STOP";
                    break;
                case 4:
                    trackerMode = "TRACKER_STANDBY";
                    break;
            }
            result.data = {
                frameType: "Life frame",
                version: hexToDecimal(input.slice(2, 4)),
                batteryLevel: hexToDecimal(input.slice(4, 8)),
                accTemp: hexToDecimal(input.slice(8, 10)),
                versionProgram: hexToDecimal(input.slice(10, 14)),
                trackerMode: trackerMode,
            };
            break;
        case 13:
            if(payloadByteLength != 2){
                result.errors = ["Payload must be 2 bytes long."];
                return result;
            }
            result.data = {
                frameType: "Shock frame",
                deviceType: hexToDecimal(input.slice(0, 1)),
                shockHeader: hexToDecimal(input.slice(1, 2)),
                versionShockFrame: hexToDecimal(input.slice(2, 4)),
            };
            break;
        case 14:
            if(payloadByteLength != 4){
                result.errors = ["Payload must be 4 bytes long."];
                return result;
            }
            
            var processState = "";
            var deviceState = "";
            switch(hexToDecimal(input.slice())){
                case 0:
                    processState = "PROCESS_AVAILABLE";
                    break;
                case 1:
                    processState = "PROCESS_TRACKING";
                    break;
                case 2:
                    processState = "PROCESS_SHOCKS";
                    break;
                case 3:
                    processState = "PROCESS_LIFE_FRAME";
                    break;
                case 4:
                    processState = "PROCESS_WATCHDOG_CRASH";
                    break;
                default:
                    processState = "No Process Read";
            }
            switch(hexToDecimal(input.slice())){
                case 0:
                    deviceState = "INIT_FROM_FSTORAGE";
                    break;
                case 1:
                    deviceState = "INIT_FROM_DEFAULT";
                    break;
                case 2:
                    deviceState = "APP_START";
                    break;
                case 3:
                    deviceState = "GNSS_TRACKING_START";
                    break;
                case 4:
                    deviceState = "GNSS_TRACKING_STOP";
                    break;
                case 5:
                    deviceState = "LORA_INIT";
                    break;
                case 6:
                    deviceState = "LORA_JOIN_REQUEST";
                    break;
                case 7:
                    deviceState = "LORA_JOIN_SUCCESSFUL";
                    break;
                case 8:
                    deviceState = "LORA_JOIN_FAILED ";
                    break;
                case 9:
                    deviceState = "LORA_DONE";
                    break;
                case 10:
                    deviceState = "LORA_SEND";
                    break;
                case 11:
                    deviceState = "LIFE_FRAME";
                    break;
                case 12:
                    deviceState = "WATCHDOG_CRASH";
                    break;
                case 13:
                    deviceState = "SLEEP";
                    break;
                default:
                    deviceState = "No Device State Read";
            }

            result.data = {
                frameType: "Log frame",
                versionLogFrame: hexToDecimal(input.slice(2, 4)),
                processState: processState,
                deviceState: deviceState,
                settings: {
                    motionStateBit1: hexToDecimal(input.slice(8, 9)) == 1,
                    motionStateBit2: hexToDecimal(input.slice(9, 10)) == 1,
                    motionStateBit3: hexToDecimal(input.slice(10, 11)) == 1,
                    timerGNSS_on: hexToDecimal(input.slice(11, 12)) == 1,
                    timerLF_on: hexToDecimal(input.slice(12, 13)) == 1,
                    callbackGNSSFrame: hexToDecimal(input.slice(13, 14)) == 1,
                    callbackLifeFrame: hexToDecimal(input.slice(14, 15)) == 1,
                    callbackShockFrame: hexToDecimal(input.slice(15, 16)) == 1,
                }
            };
            break;
        case 15:
            if(payloadByteLength != 8 || payloadByteLength != 10){
                result.errors = ["Payload must be 8 bytes long."];
                return result;
            }
            result.data = {
                frameType: "Ack frame",
                deviceType: hexToDecimal(input.slice(0, 1)),
                ackHeader: hexToDecimal(input.slice(1, 2)),
                ackVersion: hexToDecimal(input.slice(2, 4)),
                ID_downlink: hexToDecimal(input.slice(4, 8)),
                /*
                
                    Frame Type Description is Unclear. To Correct.

                */
            };
            break;
        case 17:
            if(payloadByteLength != 2){
                result.errors = ["Payload must be 2 bytes long."];
                return result;
            }
            result.data = {
                frameType: "Recovery frame",
                deviceType: hexToDecimal(input.slice(0, 1)),
                recoveryHeader: hexToDecimal(input.slice(1, 2)),
                payloadGNSS_1: hexToDecimal(input.slice(2, 46)),
                timeLoc_1: hexToDecimal(input.slice(46, 50)),
                payloadGNSS_2: hexToDecimal(input.slice(50, 94)),
                timeLoc_2: hexToDecimal(input.slice(94)),
            };
            break;
    }
    return result;
}


exports.decodeUplink = decodeUplink;