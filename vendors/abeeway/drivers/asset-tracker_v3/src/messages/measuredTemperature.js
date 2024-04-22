function MeasuredTemperature(state, max, min, highCounter, lowCounter){
        this.state = state;
        this.max = max;
        this.min = min;
        this.highCounter = highCounter;
        this.lowCounter = lowCounter;
}

module.exports = {
    MeasuredTemperature: MeasuredTemperature,
    TemperatureState: {
        NORMAL: "NORMAL",
        HIGH: "HIGH",
        LOW: "LOW",
        FEATURE_NOT_ACTIVATED: "FEATURE_NOT_ACTIVATED"
    }
}