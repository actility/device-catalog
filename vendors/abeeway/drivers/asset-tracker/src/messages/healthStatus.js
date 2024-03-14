function HealthStatus (totalConsumption,
    maxTemperature,
    minTemperature,
    loraPowerConsumption,
    blePowerConsumption,
    gpsPowerConsumption,
    wifiPowerConsumption,
    batteryVoltage){
        this.totalConsumption = totalConsumption;
        this.maxTemperature = maxTemperature;
        this.minTemperature = minTemperature;
        this.loraPowerConsumption = loraPowerConsumption;
        this.blePowerConsumption = blePowerConsumption;
        this.gpsPowerConsumption = gpsPowerConsumption;
        this.wifiPowerConsumption = wifiPowerConsumption;
        this.batteryVoltage = batteryVoltage;
}

module.exports = {
    HealthStatus: HealthStatus
}