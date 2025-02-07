let watteco = require("../../codec/decode_uplink")
let batch_param = [4,[{taglbl: 0,resol: 1, sampletype: 10,lblname: "index_1", divide: 1},
    { taglbl: 1, resol: 1, sampletype: 10,lblname: "index_2", divide: 1},
    { taglbl: 2, resol: 1, sampletype: 10,lblname: "index_3", divide: 1},
    { taglbl: 3, resol: 1, sampletype: 1,lblname: "pin_state_1", divide: 1},
    { taglbl: 4, resol: 1, sampletype: 1,lblname: "pin_state_2", divide: 1},
    { taglbl: 5, resol: 1, sampletype: 1,lblname: "pin_state_3", divide: 1},
    { taglbl: 6, resol: 0.004, sampletype: 12,lblname: "4-20_mA", divide: 1},
    { taglbl: 7, resol: 1, sampletype: 12,lblname: "0-5_V_1", divide: 1},
    {taglbl: 8, resol: 1, sampletype: 12, lblname: "0-5_V_2", divide: 1},
    {taglbl: 9, resol: 1, sampletype: 12, lblname: "ratiometric_0-5_V_1", divide: 1},
    {taglbl: 10, resol: 1, sampletype: 12, lblname: "ratiometric_0-5_V_2", divide: 1},
    {taglbl: 11, resol: 100, sampletype: 6, lblname: "battery_voltage", divide: 1}]];


let endpointCorresponder = {
    analog:["4-20_mA","0-5_V_1","0-5_V_2 ","ratiometric_0-5_V_1","ratiometric_0-5_V_2"],
    index:["index_1","index_2","index_3"],
    pin_state:["pin_state_1","pin_state_2","pin_state_3"],
    pin_state_4:["NA"],
    pin_state_5:["NA"],
    pin_state_6:["NA"],
    pin_state_7:["NA"],
    pin_state_8:["NA"],
    pin_state_9:["NA"],
    pin_state_10:["NA"],
}
function decodeUplink(input) {
    return watteco.watteco_decodeUplink(input,batch_param,endpointCorresponder);
}
exports.decodeUplink = decodeUplink;

// Make it also globally available as it is TS013 compliant, 
// but keep former diver.decodeUplink format for retrocompatibility
(globalThis || this).decodeUplink = decodeUplink;

