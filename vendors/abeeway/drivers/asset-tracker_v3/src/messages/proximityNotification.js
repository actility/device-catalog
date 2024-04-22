/*export default class ProximityNotification{
    constructor(notificationType,
        encrypted,
        recordAction,
        rollingProximityIdentifier,
        closestDistanceRecording,
        distanceAverageRecorded,
        cumulatedExposure,
        metadata,
        cumulatedContactDuration,
        currentDailyExposure){
            this.notificationType = notificationType;
            this.encrypted = encrypted;
            this.recordAction = recordAction;
            this.rollingProximityIdentifier = rollingProximityIdentifier;
            this.closestDistanceRecording = closestDistanceRecording;
            this.distanceAverageRecorded = distanceAverageRecorded;
            this.cumulatedExposure = cumulatedExposure;
            this.metadata = metadata;
            this.cumulatedContactDuration = cumulatedContactDuration;
            this.currentDailyExposure = currentDailyExposure;
    }
}

export const NotificationType = {
    WARNING_MESSAGE: "WARNING_MESSAGE",
    ALERT_MESSAGE: "ALERT_MESSAGE",
    RECORD_MESSAGE: "RECORD_MESSAGE"
};

export const RecordAction = {
    RECORD_START: "RECORD_START",
    RECORD_UPDATE: "RECORD_UPDATE",
    RECORD_STOP: "RECORD_STOP"
};*/
// constructor function for the ProximityNotification class
function ProximityNotification(notificationType,
    encrypted,
    recordAction,
    rollingProximityIdentifier,
    closestDistanceRecording,
    distanceAverageRecorded,
    cumulatedExposure,
    metadata,
    cumulatedContactDuration,
    currentDailyExposure){
        this.notificationType = notificationType;
        this.encrypted = encrypted;
        this.recordAction = recordAction;
        this.rollingProximityIdentifier = rollingProximityIdentifier;
        this.closestDistanceRecording = closestDistanceRecording;
        this.distanceAverageRecorded = distanceAverageRecorded;
        this.cumulatedExposure = cumulatedExposure;
        this.metadata = metadata;
        this.cumulatedContactDuration = cumulatedContactDuration;
        this.currentDailyExposure = currentDailyExposure;
}

module.exports = {
    ProximityNotification: ProximityNotification,
    NotificationType: {
        WARNING_MESSAGE: "WARNING_MESSAGE",
        ALERT_MESSAGE: "ALERT_MESSAGE",
        RECORD_MESSAGE: "RECORD_MESSAGE"
    },
    RecordAction: {
        RECORD_START: "RECORD_START",
        RECORD_UPDATE: "RECORD_UPDATE",
        RECORD_STOP: "RECORD_STOP"
    }
}