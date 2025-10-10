let util = require("../../../util");

function System(status,
    lowBattery, bleStatus, tamperDetection, heartbeat, shutdown, dataBufferingStatus){
    this.status = status;
    this.lowBattery = lowBattery;
    this.bleStatus = bleStatus;
    this.tamperDetection = tamperDetection;
    this.heartbeat = heartbeat;
    this.shutdown = shutdown;
    this.dataBufferingStatus = dataBufferingStatus;
}
const SystemType = Object.freeze({
    STATUS: "STATUS",
    LOW_BATTERY: "LOW_BATTERY",
    BLE_STATUS: "BLE_STATUS",
    TAMPER_DETECTION: "TAMPER_DETECTION",
    HEARTBEAT : "HEARTBEAT",
    SHUTDOWN : "SHUTDOWN",
    DATA_BUFFERING_STATUS : "DATA_BUFFERING_STATUS"
})
const ResetCause = Object.freeze({
    AOS_ERROR_NONE: "AOS_ERROR_NONE",
    AOS_ERROR_HW_NMI: "AOS_ERROR_HW_NMI",
    AOS_ERROR_HW_FAULT: "AOS_ERROR_HW_FAULT",
    AOS_ERROR_HW_MPU: "AOS_ERROR_HW_MPU",
    AOS_ERROR_HW_BUS: "AOS_ERROR_HW_BUS",
    AOS_ERROR_HW_USAGE: "AOS_ERROR_HW_USAGE",
    AOS_ERROR_HW_IRQ: "AOS_ERROR_HW_IRQ",
    AOS_ERROR_HW_WDOG: "AOS_ERROR_HW_WDOG",
    AOS_ERROR_HW_BOR: "AOS_ERROR_HW_BOR",
    AOS_ERROR_SW_ST_HAL_ERROR: "AOS_ERROR_SW_ST_HAL_ERROR",
    AOS_ERROR_SW_FREERTOS_ASSERT: "AOS_ERROR_SW_FREERTOS_ASSERT",
    AOS_ERROR_SW_FREERTOS_TASK_OVF: "AOS_ERROR_SW_FREERTOS_TASK_OVF",
    AOS_ERROR_SW_BLE_ASSERT: "AOS_ERROR_SW_BLE_ASSERT",
    AOS_ERROR_SW_RTC_FAIL: "AOS_ERROR_SW_RTC_FAIL",
    AOS_ERROR_SW_LORA_FAIL: "AOS_ERROR_SW_LORA_FAIL",
    AOS_ERROR_SW_DEBUG: "AOS_ERROR_SW_DEBUG",
    AOS_ERROR_SW_APP_START: "AOS_ERROR_SW_APP_START",
})

const ShutdownCause = Object.freeze({
    SHUTDOWN_CAUSE_NONE: "SHUTDOWN_CAUSE_NONE",
    SHUTDOWN_CAUSE_USER_ACTION: "SHUTDOWN_CAUSE_USER_ACTION",
    SHUTDOWN_CAUSE_LOW_BATTERY: "SHUTDOWN_CAUSE_LOW_BATTERY",
})

const DataBufferingStatus =Object.freeze({
    SUCCESS :"SUCCESS",
    TIMEOUT : "TIMEOUT",
    NO_DATA_FOUND : "NO_DATA_FOUND"
})
function Status(currentTemperature, resetCause, pageId, AT3Version,
    configurationVersion,
    lrHwVersion,
    hwBatchId,
    hwBomId,
    maxTemperature,
    minTemperature,
    motionPercent,
    batteryVoltage,
    totalConsumption,
    cellularConsumption,
    gnssConsumption,
    wifiConsumption,
    lrGnssConsumption,
    bleConsumption,
    mcuConsumption,
    globalCrc,
    lr11xxGpsDate, 
    lr11xxGpsOutdated,
    lr11xxGpsGood,
    lr11xxBeidouDate,
    lr11xxBeidouOutdated,
    lr11xxBeidouGood,
    gnssGpsDate, 
    gnssGpsOutdated,
    gnssGpsGood,
    gnssBeidouDate,
    gnssBeidouOutdated,
    gnssBeidouGood,
    cellVersion,
    ICCID,
    IMSI,
    EUICCID,
    IMEISV
    ){
    this.currentTemperature = currentTemperature;
    this.resetCause = resetCause;
    this.pageId = pageId;
    this.AT3Version = AT3Version;
    this.configurationVersion = configurationVersion;
    this.lrHwVersion = lrHwVersion;
    this.hwBatchId = hwBatchId;
    this.hwBomId = hwBomId;
    this.maxTemperature = maxTemperature;
    this.minTemperature = minTemperature;
    this.motionPercent = motionPercent;
    this.batteryVoltage = batteryVoltage;
    this.totalConsumption = totalConsumption;
    this.cellularConsumption = cellularConsumption;
    this.gnssConsumption = gnssConsumption;
    this.wifiConsumption = wifiConsumption;
    this.lrGnssConsumption = lrGnssConsumption;
    this.bleConsumption = bleConsumption;
    this.mcuConsumption =mcuConsumption;
    this.globalCrc = globalCrc;
    this.lr11xxGpsDate = lr11xxGpsDate;
    this.lr11xxGpsOutdated = lr11xxGpsOutdated;
    this.lr11xxGpsGood = lr11xxGpsGood;
    this.lr11xxBeidouDate = lr11xxBeidouDate;
    this.lr11xxBeidouOutdated = lr11xxBeidouOutdated;
    this.lr11xxBeidouGood = lr11xxBeidouGood;
    this.gnssGpsDate = gnssGpsDate;
    this.gnssGpsOutdated = gnssGpsOutdated;
    this.gnssGpsGood = gnssGpsGood;
    this.gnssBeidouDate = gnssBeidouDate;
    this.gnssBeidouOutdated = gnssBeidouOutdated;
    this.gnssBeidouGood = gnssBeidouGood;   
    this.cellVersion = cellVersion;
    this.ICCID = ICCID;
    this.IMSI = IMSI;
    this.EUICCID = EUICCID;
    this.IMEISV = IMEISV;


}


function LowBattery(consumption, batteryVoltage){
    this.consumption = consumption;
    this.batteryVoltage = batteryVoltage;
}
function BleStatus(state){
    this.state = state
}
function TamperDetection(state){
    this.state = state
}
function Heartbeat(currentTemperature, resetCause, globalCrc){
    this.currentTemperature = currentTemperature;
    this.resetCause = resetCause;
    this.globalCrc = globalCrc;
}
function Shutdown(shutdownCause){
    this.shutdownCause = shutdownCause;
}
function DataBuffering(status, oldestTimestamp, latestTimestamp){
    this.status = status
    this.oldestTimestamp = oldestTimestamp
    this.latestTimestamp = latestTimestamp 
}


function determineHeartbeat(payload) {
    var currentTemperature = util.convertNegativeInt(payload[5],1);
    var resetCause = determineResetCause(((payload[6]>>3)& 0x1F));
    // Extract the n bytes of the CRC (big-endian)
    const crcBytes = payload.slice(7, 11);
    // Convert each byte to a 2-digit hexadecimal string and concatenate
    const crc = crcBytes.map(b => b.toString(16).padStart(2, "0")).join("");
    return new Heartbeat(currentTemperature, resetCause, crc)
}
function determineLowBattery(payload){
    var consumption = (payload[5] << 8) + payload[6];
    var batteryVoltage = (payload[7] << 8) + payload[8];
    return new LowBattery(consumption, batteryVoltage

    )}

function determineStatus(payload){
    var currentTemperature = util.convertNegativeInt(payload[5],1);
    var resetCause = determineResetCause(((payload[6]>>3)& 0x1F));
    var pageId = payload[6] & 0x07
    var decodedStatus = new Status(currentTemperature, resetCause, pageId)
    switch (pageId){
        case 0:
            determinePage0(payload, decodedStatus)
            break;
        case 1: 
            determinePage1(payload, decodedStatus)
            break;
        case 2:
            determinePage2(payload, decodedStatus)
            break;
        case 3:
            determinePage3(payload, decodedStatus)
            break;
        default:
            throw new Error("Unknown page identifier");
    }
    return decodedStatus
}
function determineBleStatus(payload){
    switch (payload[5] & 0x01){
        case 0:
            return new BleStatus("BLE_DISCONNECTED")
        case 1:
            return new BleStatus("BLE_CONNECTED")

    }
}
function determineTamperDetection(payload){
    switch (payload[5] & 0x01){
        case 0:
            return new TamperDetection("CASING_CLOSED")
        case 1:
            return new TamperDetection("CASING_OPEN")

    }
}
function determineShutdownCause(payload){
    switch (payload[5]){
        case 0:
            //unknown cause 
            return new Shutdown(ShutdownCause.SHUTDOWN_CAUSE_NONE)
        case 1:
            return new Shutdown(ShutdownCause.SHUTDOWN_CAUSE_USER_ACTION)
        case 2:
            return new Shutdown(ShutdownCause.SHUTDOWN_CAUSE_LOW_BATTERY)
    }
}
function determineDataBufferingStatus(payload){
    switch (payload[5]){
        case 0:
            //unknown cause 
            return DataBufferingStatus.SUCCESS
        case 1:
            return DataBufferingStatus.TIMEOUT
        case 2:
            return DataBufferingStatus.NO_DATA_FOUND
    }
}
function determineDataBuffering(payload){
    var dataBufferingStatus =  determineDataBufferingStatus(payload)
    var oldestTimestamp = new Date(((payload[6] << 24) | (payload[7] << 16) | (payload[8] << 8) | payload[9]) * 1000).toISOString();
    var latestTimestamp = new Date(((payload[10] << 24) | (payload[11] << 16) | (payload[12] << 8) | payload[13]) * 1000).toISOString();
    return new DataBuffering(dataBufferingStatus, oldestTimestamp, latestTimestamp)

}
function determinePage0(payload, decodedStatus){
    decodedStatus.AT3Version = payload[7].toString()+"."+payload[8].toString()+"."+payload[9].toString();
    decodedStatus.configurationVersion = payload[10].toString()+"."+payload[11].toString()+"."+payload[12].toString()+"."+payload[13].toString();
    decodedStatus.lrHwVersion = {"hardwareVersion": payload[14].toString(),"hardwareType": payload[15].toString(), "firmwareVersion":payload[16].toString()}
    decodedStatus.hwBatchId = (payload[17] <<8) + payload[18]
    decodedStatus.hwBomId = (payload[19] <<8) + payload[20]
    decodedStatus.maxTemperature = util.convertNegativeInt(payload[21],1);
    decodedStatus.minTemperature = util.convertNegativeInt(payload[22],1);
    decodedStatus.motionPercent = payload[23]
    decodedStatus.batteryVoltage = (payload[24] << 8) + payload[25];
    decodedStatus.totalConsumption = (payload[26] << 8) + payload[27];
    decodedStatus.cellularConsumption = (payload[28] << 8) + payload[29];
    decodedStatus.gnssConsumption = (payload[30] << 8) + payload[31];
    decodedStatus.wifiConsumption = (payload[32] << 8) + payload[33];
    decodedStatus.lrGnssConsumption = (payload[34] << 8) + payload[35];
    decodedStatus.bleConsumption = (payload[36] << 8) + payload[37];
    decodedStatus.mcuConsumption = (payload[38] << 8) + payload[39];
    const crcBytes = payload.slice(40, 44);
    // Convert each byte to a 2-digit hexadecimal string and concatenate
    decodedStatus.globalCrc = crcBytes.map(b => b.toString(16).padStart(2, "0")).join("");
}

function determinePage1(payload, decodedStatus){
    decodedStatus.lr11xxGpsDate = (payload[7] << 8) + payload[8];
    let value = (payload[9] << 24) + (payload[10] << 16) + (payload[11] << 8) + payload[12];
    decodedStatus.lr11xxGpsOutdated = gpsSatelliteField
        .filter(bit => getBit(value, bit.position))
        .map(bit => bit.position+1);
    decodedStatus.lr11xxGpsGood = payload[13]
    decodedStatus.lr11xxBeidouDate = (payload[14] << 8) + payload[15];
    let valueB = payload.slice(16,21)
    decodedStatus.lr11xxBeidouOutdated = beidouSatelliteField
        .filter(bit => getBitFromPayload(valueB, bit.position))
        .map(bit => bit.position+1);
    decodedStatus.lr11xxBeidouGood = payload[21]
    decodedStatus.gnssGpsDate = (payload[22] << 8) + payload[23];
    let valueG = (payload[24] << 24) + (payload[25] << 16) + (payload[26] << 8) + payload[27];
    decodedStatus.gnssGpsOutdated = gpsSatelliteField
        .filter(bit => getBit(valueG, bit.position))
        .map(bit => bit.position+1);
    decodedStatus.gnssGpsGood = payload[28]
    decodedStatus.gnssBeidouDate = (payload[29] << 8) + payload[30];
    let valueGB = payload.slice(31,36);
    decodedStatus.gnssBeidouOutdated = beidouSatelliteField
        .filter(bit => getBitFromPayload(valueGB, bit.position))
        .map(bit => bit.position+1);
    decodedStatus.gnssBeidouGood = payload[36];  
}
function determinePage2(payload, decodedStatus){
    decodedStatus.cellVersion = {"branch": payload[7].toString(),"mode": payload[8].toString(), "image":payload[9].toString(), "delivery": payload[10].toString(), "release": parseInt(util.convertBytesToString(payload.slice(11,13)),16).toString() }
    decodedStatus.ICCID = buildAscciString(payload.slice(13,33))
    decodedStatus.IMSI = buildAscciString(payload.slice(33))
}
function determinePage3(payload, decodedStatus){
    decodedStatus.EUICCID = buildAscciString(payload.slice(7,40))
    decodedStatus.IMEISV = buildAscciString(payload.slice(40))
}

function buildAscciString(value){
    // Find the position of the last non-zero element
    let endIndex = value.length;
    let allZero = true;  // Variable to check if all elements are zero
    for (let i = value.length - 1; i >= 0; i--) {
        if (value[i] !== 0) {
            endIndex = i + 1;
            allZero = false;   // Mark as not all zeros
            break;
        }
    }
    // If all elements are zero, return an empty string
    if (allZero) {
         return "";
    }
    // Create the ASCII string up to the last non-zero element
    var asciiString = ""
    for (var i = 0; i < endIndex; i ++)
        asciiString += String.fromCharCode(value[i]);
    return asciiString
}
function determineResetCause(value){
    switch(value){
        case 0:
            return ResetCause.AOS_ERROR_NONE;
        case 1:
            return ResetCause.AOS_ERROR_HW_NMI;
        case 2:
            return ResetCause.AOS_ERROR_HW_FAULT;
        case 3:
            return ResetCause.AOS_ERROR_HW_MPU;
        case 4:
            return ResetCause.AOS_ERROR_HW_BUS;
        case 5:
            return ResetCause.AOS_ERROR_HW_USAGE;
        case 6:
            return ResetCause.AOS_ERROR_HW_IRQ;
        case 7:
            return ResetCause.AOS_ERROR_HW_WDOG;
        case 8:
            return ResetCause.AOS_ERROR_HW_BOR;
        case 9:
            return ResetCause.AOS_ERROR_SW_ST_HAL_ERROR;
        case 10:
            return ResetCause.AOS_ERROR_SW_FREERTOS_ASSERT;
        case 11:
            return ResetCause.AOS_ERROR_SW_FREERTOS_TASK_OVF;
        case 12:
            return ResetCause.AOS_ERROR_SW_BLE_ASSERT;
        case 13:
            return ResetCause.AOS_ERROR_SW_RTC_FAIL;
        case 14:
            return ResetCause.AOS_ERROR_SW_LORA_FAIL;
        case 15:
            return ResetCause.AOS_ERROR_SW_DEBUG;
        case 16:
            return ResetCause.AOS_ERROR_SW_APP_START;
        default:
            throw new Error("Unknown Reset Cause");
    }
}
    
function getBit(value, position) {
    return (value >> position) & 1;
}
// Define a function to extract the bit value at a specific position from a byte
function getBitFromByte(byte, position) {
    return (byte & (1 << position)) !== 0 ? 1 : 0;
}

// Define a function to extract the bit value at a specific position from the payload
function getBitFromPayload(payload, position) {
    const byteIndex = Math.floor(position / 8);
    const bitIndex = position % 8;
    return getBitFromByte(payload[byteIndex], bitIndex);
}

// Define a bit gps field structure with positions only
let gpsSatelliteField = Array.from({ length: 32 }, (_, i) => ({
    position: i
}));
// Define a bit beidou field structure with positions only
let beidouSatelliteField = Array.from({ length: 40 }, (_, i) => ({
    position: i
}));

module.exports = {
    System: System,
    determineStatus: determineStatus,
    determineLowBattery: determineLowBattery,
    determineBleStatus: determineBleStatus,
    determineTamperDetection: determineTamperDetection,
    determineHeartbeat : determineHeartbeat,
    determineShutdownCause : determineShutdownCause,
    determineDataBuffering: determineDataBuffering,
    SystemType: SystemType
}