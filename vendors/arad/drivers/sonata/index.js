

function msgTypeText(type) {
    switch (type) {
        case 0x06:
            return "Data Log";
        case 0x80:
            return "WT Log Beacon";
        case 0x9d:
            return "Standard";
        case 0x9b:
            return "Alarm Burst";
        default:
            return "";
    }
}

function errorText(code) {
    switch (code) {
        case 0x8000:
        case 0x80000000:
            return "RECORD_EMPTY";
        case 0x8001:
        case 0x80000001:
            return "DELTA_OVER_FLOW";
        case 0x8002:
            return "METER_READ_ERROR";
        case 0x8003:
            return "METER_DIGIT_ERROR";
        default:
            return "";
    }
}


function deviceTypeText(id) {
    switch (id) {
        case 0x52:
            return "Arad LoRa 9xx XTR (Wall mount)";
        case 0x54:
            return "Arad LoRa Glatt";
        case 0x56:
            return "Arad LoRa Sonata 1";
        case 0x57:
            return "Arad LoRa Sonata 2";
        case 0x59:
            return "Arad LoRa/OMS 8xx Sonata 1";
        case 0x5a:
            return "Arad LoRa/OMS 8xx XTR(Wall mount)";
        case 0x5c:
            return "Arad LoRa Interpreter";
        // case 0x59:
        //     return "Sonata";
        // case 0x5a:
        //     return "Octave";
        default:
            return "Unknown";
    }
}

function getAlarms(bitmap) {
    const alarms = []; 
    if ((bitmap>>15) & 1) { alarms.push("smart"); };	
    if ((bitmap>>14) & 1) { alarms.push("slaveInvalidRead"); };	
    if ((bitmap>>13) & 1) { alarms.push("slaveLowBattery"); };	
    if ((bitmap>>12) & 1) { alarms.push("emptyPipe"); };	
    if ((bitmap>>11) & 1) { alarms.push("burstPipe"); };	
    if ((bitmap>>10) & 1) { alarms.push("qmax"); };	
    if ((bitmap>>9) & 1) { alarms.push("tilt"); };	
    if ((bitmap>>8) & 1) { alarms.push("lowTemperature"); };	
    if ((bitmap>>7) & 1) { alarms.push("system"); };	
    if ((bitmap>>6) & 1) { alarms.push("fieldProg"); };	
    if ((bitmap>>5) & 1) { alarms.push("lowBattery"); };	
    if ((bitmap>>4) & 1) { alarms.push("poorRF"); };	
    if ((bitmap>>3) & 1) { alarms.push("leak"); };	
    if ((bitmap>>2) & 1) { alarms.push("backFlow"); };	
    if ((bitmap>>1) & 1) { alarms.push("commFailureCutWire"); };	
    if ((bitmap>>1) & 1) { alarms.push("tamper"); };
    return alarms;
}

function getExtendedAlarms(bitmap) {
    const alarms = []; 
    if ((bitmap>>8) & 1) { alarms.push("highPressure"); };	
    if ((bitmap>>7) & 1) { alarms.push("lowPressure"); };	
    if ((bitmap>>6) & 1) { alarms.push("powerMonitorFailure"); };	
    if ((bitmap>>5) & 1) { alarms.push("chargingFailure"); };	
    if ((bitmap>>4) & 1) { alarms.push("boxSwitchOpen"); };	
    if ((bitmap>>3) & 1) { alarms.push("hwFailure"); };	
    if ((bitmap>>2) & 1) { alarms.push("resetOnPower"); };	
    if ((bitmap>>1) & 1) { alarms.push("hwReset"); };	
    if ((bitmap>>1) & 1) { alarms.push("resetWatchDog"); };
    return alarms;
}

function getAlarms1(bitmap) {
    const alarms = []; 
    if ((bitmap>>15) & 1) { alarms.push("reserved"); };	
    if ((bitmap>>14) & 1) { alarms.push("slaveInvalidRead"); };	
    if ((bitmap>>13) & 1) { alarms.push("slaveLowBattery"); };	
    if ((bitmap>>12) & 1) { alarms.push("emptyPipe"); };	
    if ((bitmap>>11) & 1) { alarms.push("burstPipe"); };	
    if ((bitmap>>10) & 1) { alarms.push("qmax"); };	
    if ((bitmap>>9) & 1) { alarms.push("tilt"); };	
    if ((bitmap>>8) & 1) { alarms.push("lowTemperature"); };	
    if ((bitmap>>7) & 1) { alarms.push("system"); };	
    if ((bitmap>>6) & 1) { alarms.push("fieldProg"); };	
    if ((bitmap>>5) & 1) { alarms.push("lowBattery"); };	
    if ((bitmap>>4) & 1) { alarms.push("poorRF"); };	
    if ((bitmap>>3) & 1) { alarms.push("leak"); };	
    if ((bitmap>>2) & 1) { alarms.push("backFlow"); };	
    if ((bitmap>>1) & 1) { alarms.push("commFailureCutWire"); };	
    if ((bitmap>>1) & 1) { alarms.push("tamper"); };
    return alarms;
}



/**
 * @typedef {Object} DecodedUplink
 * @property {Object} data - The open JavaScript object representing the decoded uplink payload when no errors occurred
 * @property {string[]} errors - A list of error messages while decoding the uplink payload
 * @property {string[]} warnings - A list of warning messages that do not prevent the driver from decoding the uplink payload
 */

/**
 * Decode uplink
 * @param {Object} input - An object provided by the IoT Flow framework
 * @param {number[]} input.bytes - Array of bytes represented as numbers as it has been sent from the device
 * @param {number} input.fPort - The Port Field on which the uplink has been sent
 * @param {Date} input.recvTime - The uplink message time recorded by the LoRaWAN network server
 * @returns {DecodedUplink} The decoded object
 */
function decodeUplink(input) {
    let result = {
        data: {},
        errors: [],
        warnings: []
    };
    const raw = Buffer.from(input.bytes);

    switch (raw[0]) {


        // Data Logger - 42 bytes
        case 0x06: {
            if (raw.byteLength != 42) {
                result.errors.push("Invalid 'Arad Data Log' payload: length must be 42 bytes");
                delete result.data;
                return result;
            }

            const msgType = raw[0];
            // const reserved = raw.readUInt16BE(1);
            const deviceTypeID = raw[3];

            const readRawVolume = raw.readUInt32BE(4);
            const factor = Math.pow(10,(raw[8]&0x0f)-7);
            const readVolume = readRawVolume * factor;

            const timeFromLastRecord = raw.readUInt16BE(9);
            const timeBetweenRecords = raw.readUInt16BE(11);

            const alarmBitmap = raw.readUInt16BE(13);

            const batteryLevel = raw.readUInt16BE(15)/1000;

            const deltaFactor = Math.pow(10,(raw[17]&0x0f)-7);


            const recvTime = new Date(input.recvTime);
            let readTime = new Date(recvTime.getTime() - timeFromLastRecord*60_000); 
            // let readTimeRoundedHour = new Date(readTime.getTime());
            // readTimeRoundedHour.setMinutes(0, 0, 0);



            const archieve = [];
            for (let i=0; i<12; i++) {
                const previousVolume = i>0 ? archieve[i-1].volume : readVolume;
                const rawDelta = raw.readUInt16BE(18+2*i)
                const err = errorText(rawDelta);
                archieve.push(
                    {
                        time: (new Date(readTime.getTime() - (i+1)*timeBetweenRecords*60_000)).toISOString(), 
                        volume: previousVolume - (err=="" ? rawDelta * deltaFactor : 0),
                        error: err,
                    }
                );
            }



            result.data = {
                
                msgType,
                msgTypeHex: msgType.toString(16).padStart(2, '0').toUpperCase(),
                msgTypeText: msgTypeText(msgType),

                // reserved,
                // reservedHex: reserved.toString(16),
                
                deviceTypeID,
                deviceTypeIDHex: deviceTypeID.toString(16).padStart(2, '0').toUpperCase(),
                deviceTypeText: deviceTypeText(deviceTypeID),

                batteryLevel,

                alarmBitmap,
                alarms: getAlarms(alarmBitmap),

                timeFromLastRecord,
                timeBetweenRecords,

                readTime: readTime.toISOString(),
                readVolume,

                archieve,

            }
        } break;


        // Standard - 11 bytes
        case 0x9b:
        // Alarm Burst - 11 bytes
        case 0x9d: {

            const msgType = raw[0];
            const deviceTypeID = raw[1];
            const alarmBitmap = raw.readUInt16BE(2);
            const extendedAlarmBitmap = raw.readUInt16BE(4);
                     
            const currentRawVolume = raw.readUInt32BE(6);
            const factor = Math.pow(10,(raw[10]&0x0f)-7);
            const currentVolume = currentRawVolume * factor;

            result.data = {
                
                msgType,
                msgTypeHex: msgType.toString(16).padStart(2, '0').toUpperCase(),
                msgTypeText: msgTypeText(msgType),
                
                deviceTypeID,
                deviceTypeIDHex: deviceTypeID.toString(16).padStart(2, '0').toUpperCase(),
                deviceTypeText: deviceTypeText(deviceTypeID),

                alarmBitmap,
                alarms: getAlarms(alarmBitmap),

                extendedAlarmBitmap,
                extendedAlarms: getExtendedAlarms(extendedAlarmBitmap),

                recvTime: input.recvTime,
                currentVolume,

            }
        } break;


        // WT Data Logger - 50 bytes
        case 0x80: {
            if (raw.byteLength != 50) {
                result.errors.push("Invalid 'WT Log Beacon' payload: length must be 50 bytes");
                delete result.data;
                return result;
            }

            const msgType = raw[0];
            const deviceTypeID = raw[1];
            
            const fwVersion = raw[2] + "." + raw[3]; 

            const rssi = raw.readInt8(4);

            const dateTime = new Date(raw.readUInt32BE(5)*1000);
            let dateTimeRoundedHour = new Date(dateTime.getTime());
            dateTimeRoundedHour.setMinutes(0, 0, 0);
            let dateTimeRoundedDay = new Date(dateTime.getTime());;
            dateTimeRoundedDay.setUTCHours(0, 0, 0, 0);
            
            const currentRawVolume = raw.readUInt32BE(9);
            const factor = Math.pow(10,(raw[13]&0x0f)-7);
            const currentVolume = currentRawVolume * factor;

            const alarmBitmap = raw.readUInt16BE(14);

            const batteryLevel = raw.readUInt16BE(16)/1000;

            const hourlyArchive = [];
            for (let i=0; i<6; i++) {
                const previousVolume = i>0 ? hourlyArchive[i-1].volume : currentVolume;
                const rawDelta = raw.readUInt16BE(18+2*i)
                const err = errorText(rawDelta);
                hourlyArchive.push(
                    {
                        time: (new Date(dateTimeRoundedHour.getTime() - i*3_600_000)).toISOString(),
                        volume: previousVolume - (err=="" ? rawDelta * factor : 0), // TODO: deltaFactor ????
                        error: err,
                    }
                );
            }

            const weeklyArchive = [];
            for (let i=0; i<5; i++) {
                const rawVolume = raw.readUInt32BE(30+4*i)
                const err = errorText(rawVolume);
                weeklyArchive.push(
                    {
                        time: (new Date(dateTimeRoundedDay.getTime() - i*604_800_000)).toISOString(),
                        volume: err=="" ? rawVolume * factor : 0, // TODO: do we need factor here ????
                        error: err,
                    }
                );
            }

            result.data = {

                msgType,
                msgTypeHex: msgType.toString(16).padStart(2, '0').toUpperCase(),
                msgTypeText: msgTypeText(msgType),

                deviceTypeID,
                deviceTypeIDHex: deviceTypeID.toString(16).padStart(2, '0').toUpperCase(),
                deviceTypeText: deviceTypeText(deviceTypeID),

                fwVersion,

                rssi,

                batteryLevel,

                alarmBitmap,
                alarms: getAlarms(alarmBitmap),

                readTime: dateTime.toISOString(),
                readVolume,
                hourlyArchive,
                weeklyArchive,

            };
        } break;


        default: {
            result.errors.push("Invalid uplink payload: unknown id '" + raw[i] + "'");
            delete result.data;
            return result;
        }


    }
    return result;
}

exports.decodeUplink = decodeUplink;



// const exampleDataHex = "80594b58a9636af5d9000004200714400cd400df008700000000008d0035000003cc80000000800000008000000080000000";
// const exampleDataHex = "80592b4ed165797ab90006fcff0700080ce303e803e803e803e803e803e80006d79300044737800000008000000080000000";

// From Doc
// const exampleDataHex = "80590302B26166FCAF00008FD70714140DCA003C006B00A0001A006C008400008B350000874B00006C73000027DB0000257D";

// const exampleDataHex = "9D590C880004001AA94607";
// const exampleDataHex = "0600005910daadf1060000000104080cde06034103420341034103420341034103420341034103420341";
const exampleDataHex = "0600005910daadf1060000000104080cde06034103420341034103420341034103420341034180000341";


const exampleDataBytes = exampleDataHex
    .split('')
    .map((element, index, array) => index % 2 ? null : element + array[index + 1])
    .filter(element => element !== null)
    .map(x => parseInt(x, 16));
const decoded = decodeUplink({
    bytes: exampleDataBytes,
    fPort: 1,
    recvTime: "2022-11-09T00:35:37.000Z"
});
console.log(JSON.stringify(decoded.data, null, 4));