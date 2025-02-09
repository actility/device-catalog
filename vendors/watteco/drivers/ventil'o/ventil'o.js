let watteco = require("../../codec/decode_uplink")
let batch_param = [3, [{taglbl: 0,resol: 1, sampletype: 7,lblname: "mean_differential_pressure_since_last_report"},
    { taglbl: 1, resol: 1, sampletype: 7,lblname: "minimal_differential_pressure_since_last_report"},
    { taglbl: 2, resol: 1, sampletype: 7,lblname: "maximal_differential_pressure_since_last_report"},
    { taglbl: 3, resol: 1, sampletype: 6,lblname: "battery_voltage", divide: 1000},
    { taglbl: 4, resol: 10, sampletype: 7,lblname: "temperature", divide: 100},
    { taglbl: 5, resol: 1, sampletype: 7,lblname: "differential_pressure"},
    { taglbl: 6, resol: 1, sampletype: 10,lblname: "index", divide: 1},
    { taglbl: 7, resol: 1, sampletype: 1,lblname: "state", divide: 1}]];

let endpointCorresponder={}
function decodeUplink(input) {
    return watteco.watteco_decodeUplink(input,batch_param,endpointCorresponder);
}
exports.decodeUplink = decodeUplink;

// Make it also globally available as it is TS013 compliant, 
// but keep former diver.decodeUplink format for retrocompatibility
(globalThis || this).decodeUplink = decodeUplink;