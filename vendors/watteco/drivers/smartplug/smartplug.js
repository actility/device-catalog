let watteco = require("../../codec/decode_uplink")

let batch_param = [1, [{ taglbl: 0, resol: 1, sampletype: 9, lblname: "ActiveEnergy", divide: 1 }]]
let endpointCorresponder={}
function decodeUplink(input) {
    return watteco.watteco_decodeUplink(input,batch_param,endpointCorresponder);
}
exports.decodeUplink = decodeUplink;

// Make it also globally available as it is TS013 compliant, 
// but keep former diver.decodeUplink format for retrocompatibility
(globalThis || this).decodeUplink = decodeUplink;

