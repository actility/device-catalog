let watteco = require("../../codec/decode_uplink")

globalThis.TIC_Decode = require("../../codec/tic.js").TIC_Decode;

let batch_param=[]
let endpointCorresponder={}
function decodeUplink(input) {
    return watteco.watteco_decodeUplink(input, batch_param,endpointCorresponder);

}
exports.decodeUplink = decodeUplink;