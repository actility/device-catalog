const { mapArrayPoints } = require("C:/Actility/Projets_Tpx/device-catalog-private/scripts/tmp/device-catalog-private/librairies/extractPoints");

function extractPoints(input) {
    const data = input.message || {};
    const array = [];

    let counterIndex = 1;

    if(data.BatteryReport !== undefined ){
        array.push({ontologyFieldName: "batteryLevel", value: data.BatteryReport?.value, unitId: "%"})
    }
    if(data.PresenceReport !== undefined){
        array.push({ontologyFieldName: "presence", value: data.PresenceReport?.value, unitId: "state"})
    }
    if(data.IRProximityReport !== undefined){
        array.push({ontologyFieldName: ["counter:" + counterIndex++], value: data.IRProximityReport?.value, unitId: "count", nature: "IR proximity"})
    }
    if(data.IRCloseProximityReport !== undefined){
        array.push({ontologyFieldName: ["counter:" + counterIndex++], value: data.IRCloseProximityReport?.value, unitId: "count", nature: "IR close proximity"})
    }

    return mapArrayPoints(array);
}

exports.extractPoints = extractPoints;