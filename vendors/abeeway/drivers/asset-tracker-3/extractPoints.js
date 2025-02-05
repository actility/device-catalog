function extractPoints(input) {
    let result = {}
    if(input.data == null) {
        return result
    }

    let data = input.data

    if(data.header.batteryLevel != null){
        result.batteryLevel = { unitID: "%", record: data.header.batteryLevel }
    }

    if(data.header.notification.system.status.batteryVoltage != null){
        result.batteryVoltage = { unitID: "V", record: data.header.notification.system.status.batteryVoltage }
    }

    if(data.header.notification.system.status.currentTemperature != null){
        result["temperature:0"] = { unitID: "Cel", record: data.header.notification.system.status.currentTemperature, nature:"current" }
    }

    if(data.header.notification.system.status.maxTemperature != null){
        result["temperature:1"] = { unitID: "Cel", record: data.header.notification.system.status.maxTemperature, nature:"max" }
    }

    if(data.header.notification.system.status.minTemperature != null){
        result["temperature:2"] = { unitID: "Cel", record: data.header.notification.system.status.minTemperature, nature:"min" }
    }

    if(data.position.gnssFix.longitude != null){
        result["location:0"] = { unitId : "GPS", record: data.position.gnssFix.longitude, nature:"latitude" }
    }
    if(data.position.gnssFix.latitude != null){
        result["location:1"] = { unitId : "GPS", record: data.position.gnssFix.latitude, nature:"longitude"}
    }
    if(data.position.gnssFix.altitude != null){
        result.altitude = { unitId : "m", record: data.position.gnssFix.longitude }
    }

    return result
}

exports.extractPoints = extractPoints;

message = {
    "data":{
    "header":{
        "ackToken":0,
        "multiFrame":  false,
        "batteryLevel":94,
        "sos":false,
        "timestamp":"2024-06-20T12:51:48.000Z",
        "type":"POSITION"
    },
    "payload":"105e0c248a00000119ff3ff20436458000a10000000a1765",
    "position":{
        "coordinates": [7.06656, 43.615845, 161],
        "motion":1,
        "motionCounter":0,
        "gnssFix":{
            "latitude":43.615845,
            "longitude":7.0665600,
            "altitude":161,
            "COG":0,
            "EHPE":23,
            "SOG":10,
            "quality":{
                "fixQuality":"FIX_3D",
                "numberSatellitesUsed":5
            }
        },
        "positionType":"GNSS",
        "status":"SUCCESS",
        "triggers":{
            "geoTriggerGeozoning":0,
            "geoTriggerInMotion":0,
            "geoTriggerInStatic":0,
            "geoTriggerMotionStart":0,
            "geoTriggerMotionStop":0,
            "geoTriggerPod":1,
            "geoTriggerShock":0,
            "geoTriggerSos":0,
            "geoTriggerTempHighThreshold":0,
            "geoTriggerTempLowThreshold":0
        }
    }
}
}
console.log(extractPoints(message));