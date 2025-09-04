let watteco = require("../../codec/decode_uplink")
let units = require("./units.auto.js")
let batch_param=[]
let endpointCorresponder ={
    positive_active_energy: ["positive_active_energy_a","positive_active_energy_b","positive_active_energy_c","positive_active_energy_abc"],
    negative_active_energy: ["negative_active_energy_a","negative_active_energy_b","negative_active_energy_c","negative_active_energy_abc"],
    positive_reactive_energy: ["positive_reactive_energy_a","positive_reactive_energy_b","positive_reactive_energy_c","positive_reactive_energy_abc"],
    negative_reactive_energy: ["negative_reactive_energy_a","negative_reactive_energy_b","negative_reactive_energy_c","negative_reactive_energy_abc"],
    positive_active_power: ["positive_active_power_a","positive_active_power_b","positive_active_power_c","positive_active_power_abc"],
    negative_active_power: ["negative_active_power_a","negative_active_power_b","negative_active_power_c","negative_active_power_abc"],
    positive_reactive_power: ["positive_reactive_power_a","positive_reactive_power_b","positive_reactive_power_c","positive_reactive_power_abc"],
    negative_reactive_power: ["negative_reactive_power_a","negative_reactive_power_b","negative_reactive_power_c","negative_reactive_power_abc"],
    Vrms: ["Vrms_a","Vrms_b","Vrms_c"],
    Irms: ["Irms_a","Irms_b","Irms_c"],
    angle: ["angle_a","angle_b","angle_c"],
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


