let watteco = require("../decode.js")

let batch_param=[]
let endpointCorresponder={}
function decodeUplink(input) {
    return result = watteco.watteco_decodeUplink(input,batch_param,endpointCorresponder);
}
exports.decodeUplink = decodeUplink;

