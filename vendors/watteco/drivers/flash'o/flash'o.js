let watteco = require("../../codec/decode_uplink.js")

let batch_param = [1, [{ taglbl: 0, resol: 1, sampletype: 10,lblname: "index", divide: 1},
    { taglbl: 1, resol: 100, sampletype: 6,lblname: "battery_voltage", divide: 1000}]];

let endpointCorresponder={}
function decodeUplink(input) {
    return watteco.watteco_decodeUplink(input,batch_param,endpointCorresponder);
}
exports.decodeUplink = decodeUplink;

// Make it also globally available as it is TS013 compliant, 
// but keep former diver.decodeUplink format for retrocompatibility
(globalThis || this).decodeUplink = decodeUplink;

