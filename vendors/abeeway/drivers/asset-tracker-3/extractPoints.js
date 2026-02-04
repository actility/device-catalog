function extractPoints(input) {
    let result = {};
    if (!input.message) {
        return result;
    }

    let data = input.message;

    if (data.header?.batteryLevel != null && typeof data.header.batteryLevel != "string") {
        result.batteryLevel = { unitId: "%", record: data.header.batteryLevel };
    }

    if (data.header?.notification?.system?.status?.batteryVoltage != null) {
        result.batteryVoltage = { unitId: "V", record: data.header.notification.system.status.batteryVoltage };
    }

    if (data.header?.notification?.system?.status?.currentTemperature != null) {
        result["temperature:0"] = { unitId: "Cel", record: data.header.notification.system.status.currentTemperature, nature: "current" };
    }

    if (data.header?.notification?.system?.status?.maxTemperature != null) {
        result["temperature:1"] = { unitId: "Cel", record: data.header.notification.system.status.maxTemperature, nature: "max" };
    }
    if (data.notification?.accelerometer?.accelerationVector != null) {
        result["acceleration:0"] = { unitId: "mG", record: data.notification.accelerometer.accelerationVector[0], nature: "Acceleration X" };
        result["acceleration:1"] = { unitId: "mG", record: data.notification.accelerometer.accelerationVector[1], nature: "Acceleration Y" };
        result["acceleration:2"] = { unitId: "mG", record: data.notification.accelerometer.accelerationVector[2], nature: "Acceleration Z" };
    }

    if (data.header?.notification?.system?.status?.minTemperature != null) {
        result["temperature:2"] = { unitId: "Cel", record: data.header.notification.system.status.minTemperature, nature: "min" };
    }

    if (data.position?.gnssFix?.longitude != null) {
        result.location = { unitId: "GPS", record: [data.position.gnssFix.longitude, data.position.gnssFix.latitude]};
    }

    if (data.position?.gnssFix?.altitude != null) {
        result.altitude = { unitId: "m", record: data.position.gnssFix.altitude };
    }

    return result;
}

exports.extractPoints = extractPoints;