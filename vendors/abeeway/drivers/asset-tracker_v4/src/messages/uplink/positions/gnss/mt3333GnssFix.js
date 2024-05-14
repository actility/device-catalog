function MT3333GnssFix(latitude,
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

function MT3333GnssFailure(status,
    satellites){
    this.status = status;
    this.satellites = satellites;
}

module.exports = {
    MT3333GnssFix: MT3333GnssFix
}