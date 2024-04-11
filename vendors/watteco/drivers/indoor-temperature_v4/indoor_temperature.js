let watteco = require("../decode.js")

let batch_param =[2, [{taglbl: 0,resol: 10, sampletype: 7,lblname: "Temperature", divide: 100},
    { taglbl: 2, resol: 1, sampletype: 6,lblname: "BatteryVoltage", divide: 1000}]];
let endpointCorresponder={}
function decodeUplink(input) {
    return watteco.watteco_decodeUplink(input,batch_param,endpointCorresponder);
}
exports.decodeUplink = decodeUplink;

