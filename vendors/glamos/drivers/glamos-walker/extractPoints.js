function extractPoints(input) {
    const result = {}
    const data = input.message

    if(data.latitude && data.longitude) {
        result.GPS = {unitId: "GPS", record : [data.latitude, data.longitude]};
    }

    if(data.altitude) {
        result.altitude = { unitId: "m", record : data.altitude };
    }

    if(data.accuracy) {
        result.accuracy = { unitId: "m", record : data.accuracy };
    }

    return result
}
let message = {
    "message" : {
        "latitude": 32.0093287,
        "longitude": -102.232864,
        "altitude": 881,
        "accuracy": 3,
        "ant": 0,
        "position_num": 1
    }
}
console.log(extractPoints(message));
exports.extractPoints = extractPoints;