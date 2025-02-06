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
        result["location:0"] = { unitId: "GPS", record: data.position.gnssFix.longitude, nature: "latitude" };
    }
    if (data.position?.gnssFix?.latitude != null) {
        result["location:1"] = { unitId: "GPS", record: data.position.gnssFix.latitude, nature: "longitude" };
    }
    if (data.position?.gnssFix?.altitude != null) {
        result.altitude = { unitId: "m", record: data.position.gnssFix.altitude };
    }

    return result;
}

exports.extractPoints = extractPoints;

let message = {
    "message": {
        "header":{
            "ackToken":1,
            "multiFrame": false,
            "batteryLevel":"CHARGING",
            "sos":false,
            "timestamp":"2024-06-09T21:18:37.000Z",
            "type":"NOTIFICATION"
        },
        "payload":"090082ed31ff68001d04012f",
        "notification":{
            "notificationClass":"ACCELEROMETER",
            "accelerometer":{
                "accelerationVector":[
                    -152,
                    29,
                    1025
                ],
                "motionPercent":47
            },
            "notificationType":"MOTION_END"
    }
    }
}

console.log(extractPoints(message));