let watteco = require("../../codec/decode_uplink.js")
let units = require("./units.auto.js");

let endpointCorresponder={
    pin_state:["pin_state_1","pin_state_2", "pin_state_3", "pin_state_4", "pin_state_5", "pin_state_6", "pin_state_7", "pin_state_8", "pin_state_9", "pin_state_10"],
    index:["index_1", "index_2", "index_3", "index_4", "index_5", "index_6", "index_7", "index_8", "index_9", "index_10"],
    output:["output_1","output_2","output_3","output_4"]

}
let batch_param=[]
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
	sendOnOffStateEP1: "1150000600<U8:sendOnOffStateEP1>",
	sendOnOffStateEP2: "3150000600<U8:sendOnOffStateEP2>",
	sendOnOffStateEP3: "5150000600<U8:sendOnOffStateEP3>",
	sendOnOffStateEP4: "7150000600<U8:sendOnOffStateEP4>"
}

function encodeDownlink(input) {
    return encoder.watteco_encodeDownlink({ dlFrames: dlFrames }, input);
}
exports.encodeDownlink = encodeDownlink;

const encodePayload = encoder.encodePayload;
exports.encodePayload = encodePayload;

globalObject.encodeDownlink = encodeDownlink;
globalObject.encodePayload = encodePayload;