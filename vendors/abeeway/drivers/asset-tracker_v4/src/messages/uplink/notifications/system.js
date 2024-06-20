let util = require("../../../util");

function System(status,
    lowBattery, bleStatus, tamperDetection){
    this.status = status;
    this.lowBattery = lowBattery;
    this.bleStatus = bleStatus;
    this.tamperDetection = tamperDetection;
}
const SystemType = Object.freeze({
    STATUS: "STATUS",
    LOW_BATTERY: "LOW_BATTERY",
    BLE_STATUS: "BLE_STATUS",
    TAMPER_DETECTION: "TAMPER_DETECTION"
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
}

function determinePage1(payload, decodedStatus){
    decodedStatus.lr11xxGpsDate = (payload[7] << 8) + payload[8];
    let value = (payload[9] << 24) + (payload[10] << 16) + (payload[11] << 8) + payload[12];
    decodedStatus.lr11xxGpsOutdated = gpsSatelliteField
        .filter(bit => getBit(value, bit.position))
        .map(bit => bit.name);
    decodedStatus.lr11xxGpsGood = payload[13]
    decodedStatus.lr11xxBeidouDate = (payload[14] << 8) + payload[15];
    let valueB = payload.slice(16,21)
    decodedStatus.lr11xxBeidouOutdated = beidouSatelliteField
        .filter(bit => getBitFromPayload(valueB, bit.position))
        .map(bit => bit.name);
    decodedStatus.lr11xxBeidouGood = payload[21]
    decodedStatus.gnssGpsDate = (payload[22] << 8) + payload[23];
    let valueG = (payload[24] << 24) + (payload[25] << 16) + (payload[26] << 8) + payload[27];
    decodedStatus.gnssGpsOutdated = gpsSatelliteField
        .filter(bit => getBit(valueG, bit.position))
        .map(bit => bit.name);
    decodedStatus.gnssGpsGood = payload[28]
    decodedStatus.gnssBeidouDate = (payload[29] << 8) + payload[30];
    let valueGB = payload.slice(31,36);
    decodedStatus.gnssBeidouOutdated = beidouSatelliteField
        .filter(bit => getBitFromPayload(valueGB, bit.position))
        .map(bit => bit.name);
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
    for (let i = value.length - 1; i >= 0; i--) {
        if (value[i] !== 0) {
            endIndex = i + 1;
            break;
        }
    }
    // Create the ASCII string up to the last non-zero element
    var ascciiString = ""
    for (var i = 0; i < value.length; i ++)
        ascciiString += String.fromCharCode(value[i]);
    return ascciiString
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

// Define a bit field structure with names and positions
let gpsSatelliteField = [
    { name: 'Satellite 1', position: 0 },
    { name: 'Satellite 2', position: 1 },
    { name: 'Satellite 3', position: 2 },
    { name: 'Satellite 4', position: 3 },
    { name: 'Satellite 5', position: 4 },
    { name: 'Satellite 6', position: 5 },
    { name: 'Satellite 7', position: 6 },
    { name: 'Satellite 8', position: 7 },
    { name: 'Satellite 9', position: 8 },
    { name: 'Satellite 10', position: 9 },
    { name: 'Satellite 11', position: 10 },
    { name: 'Satellite 12', position: 11 },
    { name: 'Satellite 13', position: 12 },
    { name: 'Satellite 14', position: 13 },
    { name: 'Satellite 15', position: 14 },
    { name: 'Satellite 16', position: 15 },
    { name: 'Satellite 17', position: 16 },
    { name: 'Satellite 18', position: 17 },
    { name: 'Satellite 19', position: 18 },
    { name: 'Satellite 20', position: 19 },
    { name: 'Satellite 21', position: 20 },
    { name: 'Satellite 22', position: 21 },
    { name: 'Satellite 23', position: 22 },
    { name: 'Satellite 24', position: 23 },
    { name: 'Satellite 25', position: 24 },
    { name: 'Satellite 26', position: 25 },
    { name: 'Satellite 27', position: 26 },
    { name: 'Satellite 28', position: 27 },
    { name: 'Satellite 29', position: 28 },
    { name: 'Satellite 30', position: 29 },
    { name: 'Satellite 31', position: 30 },
    { name: 'Satellite 32', position: 31 }
];
let beidouSatelliteField = [
    { name: 'Satellite 1', position: 0 },
    { name: 'Satellite 2', position: 1 },
    { name: 'Satellite 3', position: 2 },
    { name: 'Satellite 4', position: 3 },
    { name: 'Satellite 5', position: 4 },
    { name: 'Satellite 6', position: 5 },
    { name: 'Satellite 7', position: 6 },
    { name: 'Satellite 8', position: 7 },
    { name: 'Satellite 9', position: 8 },
    { name: 'Satellite 10', position: 9 },
    { name: 'Satellite 11', position: 10 },
    { name: 'Satellite 12', position: 11 },
    { name: 'Satellite 13', position: 12 },
    { name: 'Satellite 14', position: 13 },
    { name: 'Satellite 15', position: 14 },
    { name: 'Satellite 16', position: 15 },
    { name: 'Satellite 17', position: 16 },
    { name: 'Satellite 18', position: 17 },
    { name: 'Satellite 19', position: 18 },
    { name: 'Satellite 20', position: 19 },
    { name: 'Satellite 21', position: 20 },
    { name: 'Satellite 22', position: 21 },
    { name: 'Satellite 23', position: 22 },
    { name: 'Satellite 24', position: 23 },
    { name: 'Satellite 25', position: 24 },
    { name: 'Satellite 26', position: 25 },
    { name: 'Satellite 27', position: 26 },
    { name: 'Satellite 28', position: 27 },
    { name: 'Satellite 29', position: 28 },
    { name: 'Satellite 30', position: 29 },
    { name: 'Satellite 31', position: 30 },
    { name: 'Satellite 32', position: 31 },
    { name: 'Satellite 33', position: 32 },
    { name: 'Satellite 34', position: 33 },
    { name: 'Satellite 35', position: 34 },
    { name: 'Satellite 36', position: 35 },
    { name: 'Satellite 37', position: 36 },
    { name: 'Satellite 38', position: 37 },
    { name: 'Satellite 39', position: 38 },
    { name: 'Satellite 40', position: 39 }

];

module.exports = {
    System: System,
    determineStatus: determineStatus,
    determineLowBattery: determineLowBattery,
    determineBleStatus: determineBleStatus,
    determineTamperDetection: determineTamperDetection,
    SystemType: SystemType
}