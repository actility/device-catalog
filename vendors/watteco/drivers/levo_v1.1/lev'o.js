let watteco = require("../../codec/decode_uplink")

let batch_param = [3, [{taglbl: 0,resol: 0.004, sampletype: 12,lblname: "4-20_mA'", divide: 1},
    { taglbl: 1, resol: 1, sampletype: 12,lblname: "0-10_V", divide: 1},
    { taglbl: 2, resol: 100, sampletype: 6,lblname: "battery_voltage", divide: 1000},
    { taglbl: 3, resol: 100, sampletype: 6,lblname: "external_power_voltage", divide: 1000},
    { taglbl: 4, resol: 1, sampletype: 10,lblname: "index", divide: 1}]];
let endpointCorresponder={
    analog:["4-20_mA","0-10_V"]
}
function decodeUplink(input) {
    return watteco.watteco_decodeUplink(input,batch_param,endpointCorresponder);
}
exports.decodeUplink = decodeUplink;

// Make it also globally available as it is TS013 compliant, 
// but keep former diver.decodeUplink format for retrocompatibility
(globalThis || this).decodeUplink = decodeUplink;
