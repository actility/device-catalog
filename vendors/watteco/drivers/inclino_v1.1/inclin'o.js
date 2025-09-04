let watteco = require("../../codec/decode_uplink")
let units = require("./units.auto.js")
let batch_param=[3, [{ taglbl: 0, resol: 1, sampletype: 6,lblname: "ACCmg", divide: 1},
    { taglbl: 1, resol: 0.1, sampletype: 12,lblname: "Deg", divide: 1000}]]
let endpointCorresponder={
    analog:["Deg"]
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
