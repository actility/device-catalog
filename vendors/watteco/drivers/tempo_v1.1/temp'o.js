 let watteco = require("../../codec/decode_uplink.js")

let batch_param = [2, [{ taglbl: 0, resol: 10, sampletype: 7, lblname: "temperature", divide: 100 }]];

let endpointCorresponder={
    pin_state:["violation_detection"]
}
function decodeUplink(input) {
    return watteco.watteco_decodeUplink(input,batch_param,endpointCorresponder);

}
exports.decodeUplink = decodeUplink;

// Make it also globally available as it is TS013 compliant, 
// but keep former diver.decodeUplink format for retrocompatibility
(globalThis || this).decodeUplink = decodeUplink;