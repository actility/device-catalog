function twosHexToDecimal(input){
    // Convert hex string to integer
    let intVal = parseInt(input, 16);

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

function decimalToHex(input){
    return input.toString(16);
}


function decodeUplink(inputObject){
    var result = {
        data: {

        },
        warnings: [],
        errors: []
    };

    var input = inputObject.bytes;

    var frameType = input[0];
    var payloadByteLength = input.length;

    switch(frameType){
        case 17:
            if(payloadByteLength != 21){
                result.errors = ["Payload ust be 21 bytes long."];
                return result;
            }
            var motionState = "";
            switch(input[14]){
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
                frameVersion: input[1],
                latitude: twosHexToDecimal(decimalToHex(((input[2]*16*16 + input[3])*16*16 + input[4])*16*16 + input[5]))/1000000,
                longitude: twosHexToDecimal(decimalToHex(((input[6]*16*16 + input[7])*16*16 + input[8])*16*16 + input[9]))/1000000,
                gnssCount: input[10]*16*16 + input[11],
                tripID: input[12]*16*16 + input[13],
                motionState: motionState,
                TTFF: input[15],
                nbrOfSats: input[16],
                HDOP: (input[17]*16*16 + input[18])/100,
                EPE: (input[19]*16*16 + input[20])/100,
            }
            break;
        case 18:
            if(payloadByteLength != 8){
                result.errors = ["Payload must be 8 bytes long."];
                return result;
            }
            var trackerMode = "";
            switch(input.slice[7]){
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
                version: input[1],
                batteryLevel: input[2]*16*16 + input[3],
                accTemp: input[4],
                versionProgram: input[5]*16*16 + input[6],
                trackerMode: trackerMode,
            };
            break;
        case 19:
            if(payloadByteLength != 2){
                result.errors = ["Payload must be 2 bytes long."];
                return result;
            }
            result.data = {
                frameType: "Shock frame",
                deviceType: (input[0] & 0b11110000) >> 4,
                shockHeader: (input[0] & 0b00001111),
                versionShockFrame: input[1],
            };
            break;
        case 20:
            if(payloadByteLength != 4){
                result.errors = ["Payload must be 4 bytes long."];
                return result;
            }
            
            var processState = "";
            var deviceState = "";
            switch((input[2] & 0b11110000) >> 4){
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
            switch(input[2] & 0b00001111){
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
                versionLogFrame: input[1],
                processState: processState,
                deviceState: deviceState,
                settings: {
                    motionStateBit1: input[3] & 0b10000000 == 1,
                    motionStateBit2: input[3] & 0b01000000 == 1,
                    motionStateBit3: input[3] & 0b00100000 == 1,
                    timerGNSS_on: input[3] & 0b00010000 == 1,
                    timerLF_on: input[3] & 0b00001000 == 1,
                    callbackGNSSFrame: input[3] & 0b00000100 == 1,
                    callbackLifeFrame: input[3] & 0b00000010 == 1,
                    callbackShockFrame: input[3] & 0b00000001 == 1,
                }
            };
            break;
        case 21:
            if(payloadByteLength != 9){
                result.errors = ["Payload must be 9 bytes long."];
                return result;
            }
            result.data = {
                frameType: "Ack frame",
                deviceType: (input[0] & 0b11110000) >> 4,
                ackHeader: input[0] & 0b00001111,
                ackVersion: input[1],
                ID_downlink: input[2]*16*16 + input[3],
                state: input[4] & 0b00000001,
                index: input[5],
                min_value: input[6],
                max_value: input[7],
                error_value: input[8],
            };

            break;
        case 23:
            if(payloadByteLength != 2){
                result.errors = ["Payload must be 2 bytes long."];
                return result;
            }
            var gnss1 = () => {
                var result = 0;
                for(var i = 1 ; i < 23 ; i++){
                    result += input[i];
                    result = result*16*16;
                }
                result /= 16*16;
                return result;
            }
            var gnss2 = () => {
                var result = 0;
                for(var i = 25 ; i < 47 ; i++){
                    result += input[i];
                    result = result*16*16;
                }
                result /= 16*16;
                return result;
            }

            result.data = {
                frameType: "Recovery frame",
                deviceType: (input[0] & 0b11110000) >> 4,
                recoveryHeader: input[0] & 0b00001111,
                payloadGNSS_1: gnss1(),
                timeLoc_1: input[23]*16*16 + input[24],
                payloadGNSS_2: gnss2(),
                timeLoc_2: input[47]*16*16 + input[48],
            };
            break;
    }
    return result;
}


exports.decodeUplink = decodeUplink;