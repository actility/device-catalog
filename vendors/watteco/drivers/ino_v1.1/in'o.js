let watteco = require("../../codec/decode_uplink.js");

let endpointCorresponder={
    pin_state:["pin_state_1","pin_state_2", "pin_state_3", "pin_state_4", "pin_state_5", "pin_state_6", "pin_state_7", "pin_state_8", "pin_state_9", "pin_state_10"],
    index:["index_1", "index_2", "index_3", "index_4", "index_5", "index_6", "index_7", "index_8", "index_9", "index_10"],
    output:["output_1","output_2","output_3","output_4"]

}
let batch_param=[]
function decodeUplink(input) {
    return watteco.watteco_decodeUplink(input,batch_param,endpointCorresponder);
}
exports.decodeUplink = decodeUplink;

// Make it also globally available as it is TS013 compliant, 
// but keep former diver.decodeUplink format for retrocompatibility
(globalThis || this).decodeUplink = decodeUplink;
