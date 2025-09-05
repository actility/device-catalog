let watteco = require("../../codec_v1.1/decode_uplink.js")
let units = require("./units.auto.js")
let batch_param = [3, [{taglbl: 0,resol: 1, sampletype: 7,lblname: "mean_differential_pressure_since_last_report"},
    { taglbl: 1, resol: 1, sampletype: 7,lblname: "minimal_differential_pressure_since_last_report"},
    { taglbl: 2, resol: 1, sampletype: 7,lblname: "maximal_differential_pressure_since_last_report"},
    { taglbl: 3, resol: 1, sampletype: 6,lblname: "battery_voltage", divide: 1000},
    { taglbl: 4, resol: 10, sampletype: 7,lblname: "temperature", divide: 100},
    { taglbl: 5, resol: 1, sampletype: 7,lblname: "differential_pressure"},
    { taglbl: 6, resol: 1, sampletype: 10,lblname: "index", divide: 1},
    { taglbl: 7, resol: 1, sampletype: 1,lblname: "state", divide: 1}]];

let endpointCorresponder={}
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