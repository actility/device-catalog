let watteco = require("../../codec/decode_uplink")

let batch_param =[2, [{taglbl: 0,resol: 0.1, sampletype: 12,lblname: "Irms", divide: 1},
    { taglbl: 1, resol: 100, sampletype: 6,lblname: "battery_voltage", divide: 1000}]];
let endpointCorresponder={
    analog:["Irms"]
}
function decodeUplink(input) {
    return watteco.watteco_decodeUplink(input,batch_param,endpointCorresponder);
}
exports.decodeUplink = decodeUplink;

// Make it also globally available as it is TS013 compliant, 
// but keep former diver.decodeUplink format for retrocompatibility
(globalThis || this).decodeUplink = decodeUplink;

