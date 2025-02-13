function extractPoints(input) {
    let result = {};
    if (!input.message) {
        return result;
    }

    let data = input.message;

    if (data.header?.batteryLevel != null) {
        result.batteryLevel = { unitID: "%", record: data.header.batteryLevel };
    }

    if (data.header?.notification?.system?.status?.batteryVoltage != null) {
        result.batteryVoltage = { unitID: "V", record: data.header.notification.system.status.batteryVoltage };
    }

    if (data.header?.notification?.system?.status?.currentTemperature != null) {
        result["temperature:0"] = { unitID: "Cel", record: data.header.notification.system.status.currentTemperature, nature: "current" };
    }

    if (data.header?.notification?.system?.status?.maxTemperature != null) {
        result["temperature:1"] = { unitID: "Cel", record: data.header.notification.system.status.maxTemperature, nature: "max" };
    }
    if (data.notification?.accelerometer?.accelerationVector != null) {
        result["acceleration:0"] = { unitID: "mG", record: data.notification.accelerometer.accelerationVector[0], nature: "Acceleration X" };
        result["acceleration:1"] = { unitID: "mG", record: data.notification.accelerometer.accelerationVector[1], nature: "Acceleration Y" };
        result["acceleration:2"] = { unitID: "mG", record: data.notification.accelerometer.accelerationVector[2], nature: "Acceleration Z" };
    }

    if (data.header?.notification?.system?.status?.minTemperature != null) {
        result["temperature:2"] = { unitID: "Cel", record: data.header.notification.system.status.minTemperature, nature: "min" };
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