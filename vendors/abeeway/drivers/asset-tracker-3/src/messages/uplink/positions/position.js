let TriggerBitMapClass = require("./triggerBitMap");
let bleClass = require("./ble/blePosition");
let util = require("../../../util");
let SatelliteInfoClass = require("./gnss/satelliteInfo");
let gnssFixClass = require("./gnss/gnssFix")
let gnssFailureClass = require("./gnss/gnssFailure")
let wifiClass = require("./wifi/wifiPosition");
const gnssFailure = require("./gnss/gnssFailure");
//let bssidInfoClass = require("./wifi/bssidInfo")

const PositionStatus = Object.freeze({
    SUCCESS: "SUCCESS",
    TIMEOUT: "TIMEOUT",
    FAILURE: "FAILURE",
    NOT_SOLVABLE : "NOT_SOLVABLE"
})

const PositionType = Object.freeze({
    LR11xx_A_GNSS: "LR11xx_A_GNSS",
    LR11xx_GNSS_NAV1: "LR11xx_GNSS_NAV1",
    LR11xx_GNSS_NAV2: "LR11xx_GNSS_NAV2",
    WIFI: "WIFI",
    BLE_SCAN1_MAC: "BLE_SCAN1_MAC",
    BLE_SCAN1_SHORT: "BLE_SCAN1_SHORT",
    BLE_SCAN1_LONG: "BLE_SCAN1_LONG",
    BLE_SCAN2_MAC: "BLE_SCAN2_MAC",
    BLE_SCAN2_SHORT: "BLE_SCAN12_SHORT",
    BLE_SCAN2_LONG: "BLE_SCAN2_LONG",
    GNSS: "GNSS",
    AIDED_GNSS: "AIDED_GNSS"
})

function Position(motion, motionCounter,
    status,
    positionType,
    triggers,
    lr11xxAGnss,
    lr11xxGnssNav1, 
    lr11xxGnssNav2, 
    wifiBssids, 
    bleBeaconMacs,
    bleBeaconIds,
    gnssFix,
    gnssFailure,
    aidedGnss,
    coordinates){
        this.motion = motion;
        this.motionCounter = motionCounter;
        this.status = status;
        this.positionType = positionType;
        this.triggers = triggers;
        this.lr11xxAGnss = lr11xxAGnss;
        this.lr11xxGnssNav1 = lr11xxGnssNav1;
        this.lr11xxGnssNav2 = lr11xxGnssNav2;
        this.wifiBssids = wifiBssids;
        this.bleBeaconMacs =bleBeaconMacs;
        this.bleBeaconIds = bleBeaconIds;
        this.gnssFix = gnssFix;
        this.gnssFailure = gnssFailure;
        this.aidedGnss = aidedGnss;
        this.coordinates = coordinates;
}

/************************ Header position decodage *************************/
/********************************************************************/
function determinePositionHeader(payload, startingByte){
    let positionMessage = new Position();
    positionMessage.motion = payload[startingByte]>>7 & 0x01;
    var statusValue = payload[startingByte]>>5 & 0x03;
    switch (statusValue){
        case 0:
            positionMessage.status = PositionStatus.SUCCESS;
            break;
        case 1:
            positionMessage.status = PositionStatus.TIMEOUT;
            break;
        case 2:
            positionMessage.status = PositionStatus.FAILURE;
            break;
        case 3:
            positionMessage.status = PositionStatus.NOT_SOLVABLE;
            break;
    }

    var typeValue = payload[startingByte] & 0x0F;
    switch (typeValue){
        case 0:
            positionMessage.positionType = PositionType.LR11xx_A_GNSS;
            break;
        case 1:
            positionMessage.positionType = PositionType.LR11xx_GNSS_NAV1;
            break;
        case 2:
            positionMessage.positionType = PositionType.LR11xx_GNSS_NAV2;
            break;
        case 3:
            positionMessage.positionType = PositionType.WIFI;
            break;
        case 4:
            positionMessage.positionType = PositionType.BLE_SCAN1_MAC;
            break;
        case 5:
            positionMessage.positionType = PositionType.BLE_SCAN1_SHORT;
            break;
        case 6:
            positionMessage.positionType = PositionType.BLE_SCAN1_LONG;
            break;
        case 7:
            positionMessage.positionType = PositionType.BLE_SCAN2_MAC;
            break;
        case 8:
            positionMessage.positionType = PositionType.BLE_SCAN2_SHORT;
            break;
        case 9:
            positionMessage.positionType = PositionType.BLE_SCAN2_LONG;
            break;
        case 10:
            positionMessage.positionType = PositionType.GNSS;
            break;
        case 11:
            positionMessage.positionType = PositionType.AIDED_GNSS;
            break;
    }
    positionMessage.motionCounter =  payload[startingByte+1]&0x0F;
    positionMessage.triggers = new TriggerBitMapClass.TriggerBitMap(payload[startingByte+3] & 0x01,
        payload[startingByte+3]>>1 & 0x01,
        payload[startingByte+3]>>2 & 0x01,
        payload[startingByte+3]>>3 & 0x01,
        payload[startingByte+3]>>4 & 0x01,
        payload[startingByte+3]>>5 & 0x01,
        payload[startingByte+3]>>6 & 0x01,
        payload[startingByte+3]>>7 & 0x01,
        payload[startingByte+2] & 0x01,
        payload[startingByte+2]>>1 & 0x01
    )
   
    return positionMessage;
}



function determineLR1110GnssPositionMessage(payload){
    let lr1110gnss = {};
    lr1110gnss.time = (payload[0] << 8 + payload[1]) * 16;
    var i = 0;
    let satelliteInfos = [];
    while (payload.length >= 2+4*(i+1)){
        var satelliteInfo = new SatelliteInfoClass.SatelliteInfo();
        var c = payload[2+4*i]>>6 & 0x03;
        switch (c){
            case 0:
                satelliteInfo.constellation = SatelliteInfoClass.Constellation.GPS;
                break;
            case 1:
                satelliteInfo.constellation = SatelliteInfoClass.Constellation.BEIDOU;
                break;
        }
        var id = payload[2+4*i] & 0x3F;
        var cnValue = payload[3+4*i]>>6 & 0x03;
        switch (cnValue){
            case 0:
                satelliteInfo.cn = SatelliteInfoClass.CN[0];
                break;
            case 1:
                satelliteInfo.cn = SatelliteInfoClass.CN[1];
                break;
            case 2:
                satelliteInfo.cn = SatelliteInfoClass.CN[2];
                break;
            case 3:
                satelliteInfo.cn = SatelliteInfoClass.CN[3];
                break;
        }
        satelliteInfo.pseudoRangeValue = (payload[3+4*i] & 0x07) << 16 + payload[4+4*i] << 8 + payload[5+4*i];
        
        satelliteInfos.push(satelliteInfo);
        i++;
    }
    lr1110gnss.satelliteInfos = satelliteInfos;
    return lr1110gnss;
}
/************************ Position decodage *************************/
/********************************************************************/
function determinePosition(payload, multiFrame){

    var startingByte = 4;
    if (multiFrame){
        startingByte = 5;
    }
    let positionMessage = determinePositionHeader(payload, startingByte);
    // position status success
    if (positionMessage.status == PositionStatus.SUCCESS || positionMessage.status == PositionStatus.NOT_SOLVABLE){
        switch (positionMessage.positionType){
            case PositionType.LR11xx_A_GNSS:
                positionMessage.lr11xxAGnss = determineLR1110GnssPositionMessage(payload.slice(startingByte+4));
                break;
            case PositionType.LR11xx_GNSS_NAV1:
                positionMessage.lr11xxGnssNav1 = util.convertBytesToString(payload.slice(startingByte+4));
                break;
            case PositionType.LR11xx_GNSS_NAV2:
                positionMessage.lr11xxGnssNav2 = util.convertBytesToString(payload.slice(startingByte+4));
                break;
            case PositionType.WIFI:
                positionMessage.wifiBssids = wifiClass.determineWifiPositionMessage(payload.slice(startingByte+4));
                break;
            case PositionType.BLE_SCAN1_MAC:
                positionMessage.bleBeaconMacs = bleClass.determineBleMacPositionMessage(payload.slice(startingByte+4));
                break;
            case PositionType.BLE_SCAN1_SHORT:
                positionMessage.bleBeaconIds = bleClass.determineBleIdShortPositionMessage(payload.slice(startingByte+4));
                break;
            case PositionType.BLE_SCAN1_LONG:
                positionMessage.bleBeaconIds = bleClass.determineBleIdLongPositionMessage(payload.slice(startingByte+4));
                break;
            case PositionType.BLE_SCAN2_MAC:
                positionMessage.bleBeaconMacs = bleClass.determineBleMacPositionMessage(payload.slice(startingByte+4));
                break;
            case PositionType.BLE_SCAN2_SHORT:
                positionMessage.bleBeaconIds = bleClass.determineBleIdShortPositionMessage(payload.slice(startingByte+4));
                break;
            case PositionType.BLE_SCAN2_LONG:
                positionMessage.bleBeaconIds = bleClass.determineBleIdLongPositionMessage(payload.slice(startingByte+4));
                break;
            case PositionType.GNSS:
                positionMessage.gnssFix = gnssFixClass.determineGnssFix(payload.slice(startingByte+4));
                positionMessage.coordinates = [positionMessage.gnssFix.longitude, positionMessage.gnssFix.latitude, positionMessage.gnssFix.altitude]
                break;
            case PositionType.AIDED_GNSS:
                break;    
        }       
    }else if ((positionMessage.status == PositionStatus.TIMEOUT)||(positionMessage.status == PositionStatus.FAILURE)){
        //only for GNSS
        if (positionMessage.positionType == PositionType.GNSS){
            positionMessage.gnssFailure = gnssFailureClass.determineGnssFailure(payload.slice(startingByte+4))
        }
    }
    return positionMessage;

}

module.exports = {
    Position: Position,
    determinePosition: determinePosition
 	
}
