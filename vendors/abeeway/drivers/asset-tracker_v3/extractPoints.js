function extractPoints(input) {
    let points = {};

    if(input.message == null){
        return points;
    }

    if (input.message.batteryLevel != null) {
        points.batteryLevel = {unitId: "%", record: input.message.batteryLevel};
    }
    if (input.message.temperatureMeasure != null) {
        points.temperature = {unitId: "Cel", record: input.message.temperatureMeasure};
    }
    if (input.message.batteryVoltage != null) {
        points.batteryVoltage = {unitId: "V", record: input.message.batteryVoltage};
    }
    if (input.message.angleDetection != null && input.message.angleDetection.angle != null) {
        points.angle = {unitId: "deg", record: input.message.angleDetection.angle};
    }
    if (input.message.gpsLatitude != null && input.message.gpsLongitude) {
        points.location = {unitId: "GPS", record: [input.message.gpsLongitude,input.message.gpsLatitude]};
    }
    if (input.message.gpsAltitude != null) {
        points.altitude = {unitId: "m", record: input.message.gpsAltitude};
    }
    if (input.message.horizontalAccuracy != null) {
        points.accuracy = {unitId: "m", record: input.message.horizontalAccuracy};
    }
    if (input.message.age != null) {
        points.age = {unitId: "s", record: input.message.age};
    }
    if (input.message.gpsSpeedOverGround != null) {
        points.speed = {unitId: "m/s", record: Number((input.message.gpsSpeedOverGround / 100).toFixed(2))};
    }

    return points;
}

exports.extractPoints = extractPoints;