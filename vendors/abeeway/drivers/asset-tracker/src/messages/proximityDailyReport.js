function ProximityDailyReport(dailyAlertDay0,
        dailyWarningDay0,
        dailyExposureDay0,
        dailyAlertDay1,
        dailyWarningDay1,
        dailyExposureDay1,
        dailyAlertDay2,
        dailyWarningDay2,
        dailyExposureDay2){
            this.dailyAlertDay0 = dailyAlertDay0;
            this.dailyWarningDay0 = dailyWarningDay0;
            this.dailyExposureDay0 = dailyExposureDay0;
            this.dailyAlertDay1 = dailyAlertDay1;
            this.dailyWarningDay1 = dailyWarningDay1;
            this.dailyExposureDay1 = dailyExposureDay1;
            this.dailyAlertDay2 = dailyAlertDay2;
            this.dailyWarningDay2 = dailyWarningDay2;
            this.dailyExposureDay2 = dailyExposureDay2;
}

module.exports = {
    ProximityDailyReport: ProximityDailyReport
}