let watteco = require("../../codec/decode_uplink")
let batch_param=[3, [{ taglbl: 0, resol: 1, sampletype: 6,lblname: "ACCmg", divide: 1},
    { taglbl: 1, resol: 0.1, sampletype: 12,lblname: "Deg", divide: 1000}]]
let endpointCorresponder={
    analog:["angle"]
}
function decodeUplink(input) {
    return watteco.watteco_decodeUplink(input,batch_param,endpointCorresponder);
}
exports.decodeUplink = decodeUplink;

// Make it also globally available as it is TS013 compliant, 
// but keep former diver.decodeUplink format for retrocompatibility
(globalThis || this).decodeUplink = decodeUplink;

