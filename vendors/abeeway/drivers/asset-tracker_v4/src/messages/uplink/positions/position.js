let TriggerBitMapClass = require("./positionHeaderTriggerBitMap");
let BssidInfoClass = require("./wifi/bssidInfo");
let BeaconInfoClass = require("./ble/beaconInfo");
let util = require("../../../util");
let SatelliteInfoClass = require("./gnss/satelliteInfo");

const PositionStatus = Object.freeze({
    SUCCESS: "SUCCESS",
    TIMEOUT: "TIMEOUT",
    FAILURE: "FAILURE"
})

const PositionType = Object.freeze({
    LR1110GNSS: "LR1110GNSS",
    LR1110SEMTECHNAV1: "LR1110SEMTECHNAV1",
    LR1110SEMTECHNAV2: "LR1110SEMTECHNAV2",
    WIFI: "WIFI",
    BLEMAC: "BLEMAC",
    BLESHORT: "BLESHORT",
    BLELONG: "BLELONG",
    MT3333GNSSFIX: "MT3333GNSSFIX",
    MT3333GNSSFAILURE: "MT3333GNSSFAILURE",
    MT3333LPGNSS: "MT3333LPGNSS"
})

function Position(motion,
    status,
    positionType,
    triggers,
    lr1110Gnss,
    lr1110SemtechNav1, 
    lr1110SemtechNav2, 
    wifi, 
    bleMacShort,
    bleShort,
    bleLong,
    mt3333GnssFix,
    mt3333LpGnss){
        this.motion = motion;
        this.status = status;
        this.positionType = positionType;
        this.triggers = triggers;
        this.lr1110Gnss = lr1110Gnss;
        this.lr1110SemtechNav1 = lr1110SemtechNav1;
        this.lr1110SemtechNav2 = lr1110SemtechNav2;
        this.wifi = wifi;
        this.bleMacShort =bleMacShort;
        this.bleShort = bleShort;
        this.bleLong = bleLong;
        this.mt3333GnssFix = mt3333GnssFix;
        this.mt3333LpGnss = mt3333LpGnss;
}

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
    }
    var typeValue = payload[startingByte] & 0x0F;
    switch (typeValue){
        case 0:
            positionMessage.positionType = PositionType.LR1110GNSS;
            break;
        case 1:
            positionMessage.positionType = PositionType.LR1110SEMTECHNAV1;
            break;
        case 2:
            positionMessage.positionType = PositionType.LR1110SEMTECHNAV2;
            break;
        case 3:
            positionMessage.positionType = PositionType.WIFI;
            break;
        case 4:
            positionMessage.positionType = PositionType.BLEMAC;
            break;
        case 5:
            positionMessage.positionType = PositionType.BLESHORT;
            break;
        case 6:
            positionMessage.positionType = PositionType.BLESHORT;
            break;
        case 7:
            positionMessage.positionType = PositionType.MT3333GNSSFIX;
            break;
        case 8:
            positionMessage.positionType = PositionType.MT3333LPGNSS;
            break;
    }
    positionMessage.triggers = new TriggerBitMapClass.TriggerBitMap(payload[startingByte+2] & 0x01,
        payload[startingByte+2]>>1 & 0x01,
        payload[startingByte+2]>>2 & 0x01,
        payload[startingByte+2]>>3 & 0x01,
        payload[startingByte+2]>>4 & 0x01,
        payload[startingByte+2]>>5 & 0x01,
        payload[startingByte+2]>>6 & 0x01,
        payload[startingByte+2]>>7 & 0x01,
        payload[startingByte+1] & 0x01,
        payload[startingByte+1]>>1 & 0x01
    )
    return positionMessage;
}

function determineWifiPositionMessage(payload){
    let wifi = [];
    var i = 0;
    while (payload.length >= 7*(i+1)){
        let key = util.convertByteToString(payload[i*7]) + ":" 
                    + util.convertByteToString(payload[1+i*7]) + ":"
                    + util.convertByteToString(payload[2+i*7]) + ":"
                    + util.convertByteToString(payload[3+i*7]) + ":"
                    + util.convertByteToString(payload[4+i*7]) + ":"
                    + util.convertByteToString(payload[5+i*7]);
        let value = util.convertNegativeInt(payload[6+i*7],1);
        
        wifi.push(new BssidInfoClass.BssidInfo(key, value));
        i++;
    }
    return wifi;
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

function determineBleMacShortPositionMessage(payload){
    let beaconInfos = [];
    var i = 0;
    while (payload.length >= 7*(i+1)){
        let key = util.convertByteToString(payload[i*7]) + ":" 
                    + util.convertByteToString(payload[1+i*7]) + ":"
                    + util.convertByteToString(payload[2+i*7]) + ":"
                    + util.convertByteToString(payload[3+i*7]) + ":"
                    + util.convertByteToString(payload[4+i*7]) + ":"
                    + util.convertByteToString(payload[5+i*7]);
        let value = util.convertNegativeInt(payload[6+i*7],1);
        
        beaconInfos.push(new BeaconInfoClass.BeaconInfo(key, value));
        i++;
    }
    return beaconInfos;
}

function determineMT3333GnssPositionMessage(payload){
}


function determinePosition(payload, multiFrame){
    
    const startingByte = 4;
    if (multiFrame){
        startingByte = 5;
    }
    let positionMessage = determinePositionHeader(payload, startingByte);
    switch (positionMessage.positionType){
        case PositionType.LR1110GNSS:
            positionMessage.lr1110Gnss = determineLR1110GnssPositionMessage(payload.slice(startingByte+3));
            break;
        case PositionType.LR1110SEMTECHNAV1:
            positionMessage.lr1110SemtechNav1 = util.convertBytesToString(payload.slice(startingByte+3));
            break;
        case PositionType.LR1110SEMTECHNAV2:
            positionMessage.lr1110SemtechNav2 = util.convertBytesToString(payload.slice(startingByte+3));
            break;
        case PositionType.WIFI:
            positionMessage.wifi = determineWifiPositionMessage(payload.slice(startingByte+3));
            break;
        case PositionType.BLEMAC:
            positionMessage.bleMacShort = determineBleMacShortPositionMessage(payload.slice(startingByte+3));
            break;
        case PositionType.BLESHORT:
            positionMessage.bleShort = determineBleShortPositionMessage(payload.slice(startingByte+3));
            break;
        case PositionType.BLELONG:
            positionMessage.bleLong = determineBleLongPositionMessage(payload.slice(startingByte+3));
            break;
        case PositionType.MT3333GNSSFIX:
            positionMessage.mt3333GnssFix = determineMT3333GnssPositionMessage(payload.slice(startingByte+3));
            break;
        case PositionType.MT3333LPGNSS:
            positionMessage.mt3333LpGnss = determineMT3333LPGnssPositionMessage(payload.slice(startingByte+3));
            break;    
    }
    //TODO
    return positionMessage;

}

module.exports = {
    Position: Position,
    determinePosition: determinePosition
 	
}
