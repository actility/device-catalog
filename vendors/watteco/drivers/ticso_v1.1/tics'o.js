let watteco = require("../../codec_v1.1/decode_uplink.js");
let TIC_Decode = require("../../codec/tic.js").TIC_Decode;

let batch_param=[]
let endpointCorresponder={}

function decodeUplink(input,optBatchParams = null, optEndpointCorresponder = null) {
    if (optBatchParams) { batch_param = optBatchParams;}
    if (optEndpointCorresponder) { endpointCorresponder = optEndpointCorresponder;}
    return watteco.watteco_decodeUplink(input,batch_param,endpointCorresponder,TIC_Decode);
}

exports.decodeUplink = decodeUplink;

// Make it also globally available as it is TS013 compliant, 
// but keep former diver.decodeUplink format for retrocompatibility
const globalObject = typeof globalThis !== 'undefined' ? globalThis : this;
globalObject.decodeUplink = decodeUplink;