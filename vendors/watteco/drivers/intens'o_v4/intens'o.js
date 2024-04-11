let watteco = require("../decode.js")

let batch_param =[2, [{taglbl: 0,resol: 0.1, sampletype: 12,lblname: "Irms", divide: 1},
    { taglbl: 1, resol: 100, sampletype: 6,lblname: "battery_voltage", divide: 1000}]];
let endpointCorresponder={
    analog:["Irms"]
}
function decodeUplink(input) {
    return watteco.watteco_decodeUplink(input,batch_param,endpointCorresponder);
}
exports.decodeUplink = decodeUplink;

