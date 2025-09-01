let watteco = require("../../codec_v1.1/decode_uplink.js")
let units = require("./units.auto.js")

let batch_param = [4, [{taglbl: 0,resol: 1, sampletype: 10,lblname: "index_1", divide: 1},
    { taglbl: 1, resol: 1, sampletype: 10,lblname: "index_2", divide: 1},
    { taglbl: 2, resol: 1, sampletype: 10,lblname: "index_3", divide: 1},
    { taglbl: 3, resol: 1, sampletype: 1,lblname: "pin_state_1", divide: 1},
    { taglbl: 4, resol: 1, sampletype: 1,lblname: "pin_state_2", divide: 1},
    { taglbl: 5, resol: 1, sampletype: 1,lblname: "pin_state_3", divide: 1},
    { taglbl: 6, resol: 100, sampletype: 6,lblname: "battery_voltage", divide: 1000},
    { taglbl: 7, resol: 1, sampletype: 6,lblname: "multi_state", divide: 100}]];

let endpointCorresponder={
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
function decodeUplink(input, optBatchParams = null, optEndpointCorresponder = null, optUnits = null) {
	if (optBatchParams) { batch_param = optBatchParams;}
	if (optEndpointCorresponder) { endpointCorresponder = optEndpointCorresponder;}
    if (optUnits) { units = { ...units, ...optUnits };}
	return watteco.watteco_decodeUplink(input, batch_param, endpointCorresponder, units);
}
exports.decodeUplink = decodeUplink;

// Make it also globally available as it is TS013 compliant, 
// but keep former diver.decodeUplink format for retrocompatibility
const globalObject = typeof globalThis !== 'undefined' ? globalThis : this;
globalObject.decodeUplink = decodeUplink;

// Add downlink encoder
let encoder = require("../../codec/encode_downlink")

// Define downlink frame templates below
// Format: commandName: "hexadecimalPrefix<dataType:commandName>"
// Example: sendMSOMode: "11050013005520<U8:sendMSOMode>" where:
//   - "sendMSOMode" is used as the command identifier
//   - "11050013005520" is the hex prefix of the frame
//   - "U8" specifies an unsigned 8-bit integer data type
//   - "sendMSOMode" is the parameter name that will be replaced with the actual value
const dlFrames = {
    
}

function encodeDownlink(input) {
    return encoder.watteco_encodeDownlink({ dlFrames: dlFrames }, input);
}
exports.encodeDownlink = encodeDownlink;

const encodePayload = encoder.encodePayload;
exports.encodePayload = encodePayload;

globalObject.encodeDownlink = encodeDownlink;
globalObject.encodePayload = encodePayload;

