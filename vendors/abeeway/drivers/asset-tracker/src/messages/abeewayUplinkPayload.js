function AbeewayUplinkPayload(gpsLatitude, 
    gpsLongitude,
    horizontalAccuracy,
    messageType,
    age,
    trackingMode,
    batteryVoltage,
    batteryLevel,
    batteryStatus,
    ackToken,
    firmwareVersion,
    bleFirmwareVersion,
    bleMac,
    resetCause,
    rawPositionType,
    periodicPosition,
    gpsOnRuntime,
    gpsStandbyRuntime,
    wifiScanCount,
    timeoutCause,
    bestSatellitesCOverN,
    temperatureMeasure,
    miscDataTag,
    sosFlag,
    appState,
    dynamicMotionState,
    onDemand,
    batteryVoltageMeasures,
    errorCode,
    debugErrorCode,
    genericErrorCode,
    shutdownCause,
    currentAckTokenValue,
    payload,
    debugCrashInfo,
    activityCount,
    deviceConfiguration,
    wifiBssids,
    bleBssids,
    bleBeaconIds,
    bleBeaconFailure,
    eventType,
    debugCommandTag,
    txPowerIndex,
    nbOfshock,
    accelerometerShockData,
    trackerOrientation,
    activityReportingWindow,
    measuredTemperature,
    lengthErrCounter,
    dataScanCollection,
    proximityNotification,
    proximityDailyReport,
    proximityWhiteListing,
    proximityDailyResponse,
    angleDetection, 
    geofencingNotification,
    specificFirmwareParameters,
    gpsAltitude,
    gpsCourseOverGround,
    gpsSpeedOverGround,
    gpsFixStatus,
    gpsPayloadType,
    gpsPrevious,
    healthStatus,
    motionDutyCycle,
    gaddIndex,
    sms) {
    this.gpsLatitude = gpsLatitude;
    this.gpsLongitude = gpsLongitude;
    this.gpsAltitude = gpsAltitude;
    this.gpsCourseOverGround = gpsCourseOverGround;
    this.gpsSpeedOverGround = gpsSpeedOverGround;
    this.gpsFixStatus = gpsFixStatus;
    this.gpsPayloadType = gpsPayloadType;
    this.horizontalAccuracy = horizontalAccuracy;
    this.gpsPrevious = gpsPrevious;
    this.messageType = messageType;
    this.age = age;
    this.trackingMode = trackingMode;
    this.batteryVoltage = batteryVoltage;
    this.batteryLevel = batteryLevel;
    this.batteryStatus = batteryStatus;
    this.ackToken = ackToken;
    this.firmwareVersion = firmwareVersion;
    this.bleFirmwareVersion = bleFirmwareVersion;
    this.bleMac = bleMac;
    this.resetCause = resetCause;
    this.rawPositionType = rawPositionType;
    this.periodicPosition = periodicPosition;
    this.gpsOnRuntime = gpsOnRuntime;
    this.gpsStandbyRuntime = gpsStandbyRuntime;
    this.wifiScanCount = wifiScanCount;
    this.timeoutCause = timeoutCause;
    this.bestSatellitesCOverN = bestSatellitesCOverN;
    this.temperatureMeasure = temperatureMeasure;
    this.miscDataTag = miscDataTag;
    this.sosFlag = sosFlag;
    this.appState = appState;
    this.dynamicMotionState = dynamicMotionState;
    this.onDemand = onDemand;
    this.batteryVoltageMeasures = batteryVoltageMeasures;
    this.errorCode = errorCode;
    this.debugErrorCode = debugErrorCode;
    this.genericErrorCode = genericErrorCode;
    this.shutdownCause = shutdownCause;
    this.currentAckTokenValue = currentAckTokenValue;
    this.payload = payload;
    this.debugCrashInfo = debugCrashInfo;
    this.activityCount = activityCount;
    this.deviceConfiguration = deviceConfiguration;
    this.wifiBssids = wifiBssids;
    this.bleBssids = bleBssids;
    this.bleBeaconIds = bleBeaconIds;
    this.bleBeaconFailure = bleBeaconFailure;
    this.eventType = eventType;
    this.debugCommandTag = debugCommandTag;
    this.txPowerIndex = txPowerIndex;
    this.nbOfshock = nbOfshock;
    this.accelerometerShockData = accelerometerShockData;
    this.trackerOrientation = trackerOrientation;
    this.activityReportingWindow = activityReportingWindow;
    this.measuredTemperature = measuredTemperature;
    this.lengthErrCounter = lengthErrCounter;
    this.dataScanCollection = dataScanCollection;
    this.proximityNotification = proximityNotification;
    this.proximityDailyReport = proximityDailyReport;
    this.proximityWhiteListing = proximityWhiteListing;
    this.proximityDailyResponse = proximityDailyResponse;
    this.angleDetection =angleDetection;
    this.geofencingNotification = geofencingNotification;
    this.specificFirmwareParameters = specificFirmwareParameters;
    this.healthStatus = healthStatus;
    this.motionDutyCycle = motionDutyCycle;
    this.gaddIndex = gaddIndex;
    this.sms = sms;
}

module.exports = {
    AbeewayUplinkPayload: AbeewayUplinkPayload
}