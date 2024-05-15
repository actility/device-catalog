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
module.exports = {
    QualityInfo: QualityInfo, fixQuality: fixQuality
}