let watteco = require("../../codec/decode_uplink")

let batch_param = []
let endpointCorresponder={
    pin_state:["violation_detection","open"]
}
function decodeUplink(input) {
    return watteco.watteco_decodeUplink(input,batch_param,endpointCorresponder);

}
exports.decodeUplink = decodeUplink;

