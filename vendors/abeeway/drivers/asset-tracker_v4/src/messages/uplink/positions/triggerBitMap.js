function TriggerBitMap(geoTriggerPod,
    geoTriggerSos,
    geoTriggerMotionStart,
    geoTriggerMotionStop,
    geoTriggerInMotion,
    geoTriggerInStatic,
    geoTriggerShock,
    geoTriggerTempHighThreshold,
    geoTriggerTempLowThreshold,
    geoTriggerGeozoning
){
    this.geoTriggerPod = geoTriggerPod;
    this.geoTriggerSos = geoTriggerSos;
    this.geoTriggerMotionStart = geoTriggerMotionStart;
    this.geoTriggerMotionStop = geoTriggerMotionStop;
    this.geoTriggerInMotion = geoTriggerInMotion;
    this.geoTriggerInStatic = geoTriggerInStatic;
    this.geoTriggerShock = geoTriggerShock;
    this.geoTriggerTempHighThreshold = geoTriggerTempHighThreshold;
    this.geoTriggerTempLowThreshold = geoTriggerTempLowThreshold;
    this.geoTriggerGeozoning = geoTriggerGeozoning;
}

module.exports = {
    TriggerBitMap: TriggerBitMap, 	
}