
let util = require("../../../../util");

function GnssFix(latitude,
    longitude,
    altitude,
    COG,
    SOG,
    EHPE,
    quality){
    this.latitude = latitude;
    this.longitude = longitude;
    this.altitude = altitude;
    this.COG = COG;
    this.SOG = SOG;
    this.EHPE = EHPE;
    this.quality = quality;
}

const fixQuality = Object.freeze({
    INVALID: "INVALID",
    VALID: "VALID",
    FIX_2D: "FIX_2D",
    FIX_3D: "FIX_3D",
});

function QualityInfo(fixQuality,
    numberSatelliteUsed
){
    this.fixQuality = fixQuality;
    this.numberSatelliteUsed = numberSatelliteUsed;
}

/****** decoded MT3333 GPS position *******/
/*****************************************/
function determineGnssFix (payload){
    let mt3333GnssFixInfo = new GnssFix();
    mt3333GnssFixInfo.latitude = util.twoComplement(parseInt(util.convertBytesToString(payload.slice(0,4)),16)) /  Math.pow(10, 7) 
    mt3333GnssFixInfo.longitude = util.twoComplement(parseInt(util.convertBytesToString(payload.slice(4,8)),16)) /  Math.pow(10, 7)
    mt3333GnssFixInfo.altitude = determineAltitude(payload)
    mt3333GnssFixInfo.COG = determineCourseOverGround(payload)
    mt3333GnssFixInfo.SOG = determineSpeedOverGround(payload)
    mt3333GnssFixInfo.EHPE = determineEstimatedHorizontalPositionError(payload)
    mt3333GnssFixInfo.quality = determineFixQuality(payload)
 return mt3333GnssFixInfo

}
function determineAltitude(payload){
    if (payload.length < 10)
        throw new Error("The payload is not valid to determine GPS altitude");
    return (payload[8]<<8)+payload[9];
}
function determineCourseOverGround(payload){
    if (payload.length < 12)
        throw new Error("The payload is not valid to determine GPS course over ground");
    // expressed in 1/100 degree
    return ((payload[10]<<8)+payload[11]);
}

function determineSpeedOverGround(payload){
    if (payload.length < 14)
        throw new Error("The payload is not valid to determine GPS speed over ground");
    // expressed in cm/s
    return ((payload[12]<<8)+payload[13]);
}
function determineEstimatedHorizontalPositionError(payload){
        if (payload.length < 15)
            throw new Error("The payload is not valid to determine horizontal accuracy");
        var ehpeValue = payload[14]
        if (ehpeValue > 250){
            switch (ehpeValue){
                case 251:
                    ehpeValue = "(250,500]"
                    break
                case 252:
                    ehpeValue = "(500,1000]"
                    break
                case 253:
                    ehpeValue = "(1000,2000]"
                    break;
                case 254:
                    ehpeValue = "(2000,4000]"
                    break;
                case 255:
                    ehpeValue = ">4000"
                    break;
            }
        }
       
        return ehpeValue;
    }	
    
function determineFixQuality(payload){
    let quality = payload[15]>>5 & 0x07
    let qualityInfo = new QualityInfo()
    
    switch(quality){
        case 0:
            qualityInfo.fixQuality = fixQuality.INVALID
            break
        case 1:
            qualityInfo.fixQuality = fixQuality.VALID
            break
        case 2:
            qualityInfo.fixQuality = fixQuality.FIX_2D
            break
        case 3:
            qualityInfo.fixQuality = fixQuality.FIX_3D
            break
    }
    qualityInfo.numberSatellitesUsed = payload[15] & 0x0F
    return qualityInfo
    

}

module.exports = {
    GnssFix: GnssFix,
    determineGnssFix: determineGnssFix
}