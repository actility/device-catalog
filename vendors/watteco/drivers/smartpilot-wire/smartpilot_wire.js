let watteco = require("../../codec/decode_uplink")

let batch_param=[]
let endpointCorresponder={}
function decodeUplink(input) {
    return watteco.watteco_decodeUplink(input, batch_param, endpointCorresponder);
}
exports.decodeUplink = decodeUplink;
