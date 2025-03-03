let watteco = require("../../codec/decode_uplink")

globalThis.TIC_Decode = require("../../codec/tic.js").TIC_Decode;

let batch_param=[]
let endpointCorresponder={}
function decodeUplink(input) {
    return watteco.watteco_decodeUplink(input, batch_param,endpointCorresponder);

}
exports.decodeUplink = decodeUplink;

// Make it also globally available as it is TS013 compliant, 
// but keep former diver.decodeUplink format for retrocompatibility
(globalThis || this).decodeUplink = decodeUplink;