let watteco = require("../decode.js")

let batch_param = [2, [{ taglbl: 0, resol: 10, sampletype: 7, lblname: "Temperature", divide: 100 },
    { taglbl: 1, resol: 100, sampletype: 6, lblname: "RelativeHumidity", divide: 100 },
    { taglbl: 2, resol: 1, sampletype: 6, lblname: "BatteryLevel", divide: 1000 },
    { taglbl: 3, resol: 1, sampletype: 1, lblname: "violation_detection", divide: 1 }]];


let endpointCorresponder={
    pin_state:["violation_detection"]
}
function decodeUplink(input) {
    return watteco.watteco_decodeUplink(input,batch_param,endpointCorresponder);

}
exports.decodeUplink = decodeUplink;

