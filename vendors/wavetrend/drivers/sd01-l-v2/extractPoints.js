function extractPoints(input) {
    const points = {};
    const message = input.message || {};

    function addTemperature(key, value, nature) {
        if (value === null || value === undefined || Number.isNaN(value)) return;
        points[key] = { unitId: "Cel", record: value };
        if (nature) points[key].nature = nature;
    }

    if (message.minC !== undefined || message.maxC !== undefined) {
        addTemperature("temperature:1", message.minC, "minC");
        addTemperature("temperature:2", message.maxC, "maxC");
    }

    if (message.s1MinC !== undefined || message.s1MaxC !== undefined) {
        addTemperature("temperature:3", message.s1MinC, "s1MinC");
        addTemperature("temperature:4", message.s1MaxC, "s1MaxC");
        addTemperature("temperature:5", message.s2MinC, "s2MinC");
        addTemperature("temperature:6", message.s2MaxC, "s2MaxC");
        addTemperature("temperature:7", message.s3MinC, "s3MinC");
        addTemperature("temperature:8", message.s3MaxC, "s3MaxC");
    }

    if (message.temperature !== undefined) {
        addTemperature("temperature", message.temperature, "temperature");
    }

    if (Array.isArray(message.readings)) {
        message.readings.forEach((reading) => {
            if (!Array.isArray(reading.sensors)) return;

            reading.sensors.forEach((sensor, index) => {
                if (sensor == null || sensor.tempC == null || Number.isNaN(sensor.tempC)) return;
                const key = `temperature:${10 + index}`;
                if (!points[key]) {
                    points[key] = { unitId: "Cel", records: [] };
                }
                points[key].records.push({
                    value: sensor.tempC,
                    eventTime: reading.timestamp ?? null
                });
                points[key].nature = "tempC";
            });
        });
    }

    return points;
}

exports.extractPoints = extractPoints;
