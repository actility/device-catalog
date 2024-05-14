let util = require("../../../util");

function System(status,
    lowBattery){
    this.status = status;
    this.lowBattery = lowBattery;
}

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
    AOS_ERROR_SW_RTC_FAIL: "AOS_ERROR_SW_RTC_FAIL",
    AOS_ERROR_SW_LORA_FAIL: "AOS_ERROR_SW_LORA_FAIL",
    AOS_ERROR_SW_DEBUG: "AOS_ERROR_SW_DEBUG",
    AOS_ERROR_SW_APP_START: "AOS_ERROR_SW_APP_START",
})

function Status(AT3Version,
    configVersion,
    LRHWVersion,
    LRGNSSVersion,
    consumption,
    batteryVoltage,
    currentTemperature,
    maxTemperature,
    minTemperature,
    resetCause,
    LR1110GpsAlmanacDate,
    LR1110GpsOutdated,
    LR1110GpsGood,
    LR1110BeidouAlmanacDate,
    LR1110BeidouOutdated,
    LR1110BeidouGood,
    MT3333GpsAlmanacDate,
    MT3333GpsOutdated,
    MT3333GpsGood,
    MT3333BeidouAlmanacDate,
    MT3333BeidouOutdated,
    MT3333BeidouGood){
    this.AT3Version = AT3Version;
    this.configVersion = configVersion;
    this.LRHWVersion = LRHWVersion;
    this.LRGNSSVersion = LRGNSSVersion;
    this.consumption = consumption;
    this.batteryVoltage = batteryVoltage;
    this.currentTemperature = currentTemperature;
    this.maxTemperature = maxTemperature;
    this.minTemperature = minTemperature;
    this.resetCause = resetCause;
    this.LR1110GpsAlmanacDate = LR1110GpsAlmanacDate;
    this.LR1110GpsOutdated = LR1110GpsOutdated;
    this.LR1110GpsGood = LR1110GpsGood;
    this.LR1110BeidouAlmanacDate = LR1110BeidouAlmanacDate;
    this.LR1110BeidouOutdated = LR1110BeidouOutdated;
    this.LR1110BeidouGood = LR1110BeidouGood;
    this.MT3333GpsAlmanacDate = MT3333GpsAlmanacDate;
    this.MT3333GpsOutdated = MT3333GpsOutdated;
    this.MT3333GpsGood = MT3333GpsGood;
    this.MT3333BeidouAlmanacDate= MT3333BeidouAlmanacDate;
    this.MT3333BeidouOutdated = MT3333BeidouOutdated;
    this.MT3333BeidouGood = MT3333BeidouGood;
}

function determineStatus(payload){
    if (payload.length < 40)
        throw new Error("The payload is not valid to determine status message");

    var AT3Version = payload[5].toString()+"."+payload[6].toString()+"."+payload[7].toString();
    var configVersion = payload[8].toString()+"."+payload[9].toString()+"."+payload[10].toString()+"."+payload[11].toString();
    var LRHWVersion = payload[12].toString()+"."+payload[13].toString()+"."+payload[14].toString();
    var LRGNSSVersion = payload[15];
    var consumption = (payload[16] << 8) + payload[17];
    var batteryVoltage = (payload[18] << 8) + payload[19];
    var currentTemperature = util.convertNegativeInt(payload[20],1);
    var maxTemperature = util.convertNegativeInt(payload[21],1);
    var minTemperature = util.convertNegativeInt(payload[22],1);
    var resetCause = determineResetCause(payload[23]);
    var LR1110GpsAlmanacDate = (payload[24] << 8) + payload[25];
    var LR1110GpsOutdated = payload[26];
    var LR1110GpsGood = payload[27];
    var LR1110BeidouAlmanacDate = (payload[28] << 8) + payload[29];
    var LR1110BeidouOutdated = payload[30];
    var LR1110BeidouGood = payload[31];
    var MT3333GpsAlmanacDate = (payload[32] << 8) + payload[33];
    var MT3333GpsOutdated = payload[34];
    var MT3333GpsGood = payload[35];
    var MT3333BeidouAlmanacDate = (payload[36] << 8) + payload[37];
    var MT3333BeidouOutdated = payload[38];
    var MT3333BeidouGood = payload[39];
    return new Status(AT3Version,
        configVersion,
        LRHWVersion,
        LRGNSSVersion,
        consumption,
        batteryVoltage,
        currentTemperature,
        maxTemperature,
        minTemperature,
        resetCause,
        LR1110GpsAlmanacDate,
        LR1110GpsOutdated,
        LR1110GpsGood,
        LR1110BeidouAlmanacDate,
        LR1110BeidouOutdated,
        LR1110BeidouGood,
        MT3333GpsAlmanacDate,
        MT3333GpsOutdated,
        MT3333GpsGood,
        MT3333BeidouAlmanacDate,
        MT3333BeidouOutdated,
        MT3333BeidouGood);
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
            return ResetCause.AOS_ERROR_SW_RTC_FAIL;
        case 13:
            return ResetCause.AOS_ERROR_SW_LORA_FAIL;
        case 14:
            return ResetCause.AOS_ERROR_SW_DEBUG;
        case 15:
            return ResetCause.AOS_ERROR_SW_APP_START;
        default:
            throw new Error("Unknown Reset Cause");
    }
}
    

module.exports = {
    System: System,
    determineStatus: determineStatus
}