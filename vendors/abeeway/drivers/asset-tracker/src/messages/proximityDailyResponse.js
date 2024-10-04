function ProximityDailyResponse(dayIdentifier,
        dailyAlert,
        dailyWarning,
        dailyExposure){
            this.dayIdentifier = dayIdentifier;
            this.dailyAlert = dailyAlert;
            this.dailyWarning = dailyWarning;
            this.dailyExposure = dailyExposure;
}

module.exports = {
    ProximityDailyResponse: ProximityDailyResponse
}