let watteco = require("../../codec/decode_uplink")
let units = require("./units.auto.js")

let batch_param=[]
let endpointCorresponder={
    modbus_payload:["modbus_payload_EP1","modbus_payload_EP2","modbus_payload_EP3","modbus_payload_EP4","modbus_payload_EP5","modbus_payload_EP6","modbus_payload_EP7","modbus_payload_EP8","modbus_payload_EP9"],
    modbus_slaveID:["modbus_slaveID_EP1","modbus_slaveID_EP2","modbus_slaveID_EP3","modbus_slaveID_EP4","modbus_slaveID_EP5","modbus_slaveID_EP6","modbus_slaveID_EP7","modbus_slaveID_EP8","modbus_slaveID_EP9"],
    modbus_fnctID:["modbus_fnctID_EP1","modbus_fnctID_EP2","modbus_fnctID_EP3","modbus_fnctID_EP4","modbus_fnctID_EP5","modbus_fnctID_EP6","modbus_fnctID_EP7","modbus_fnctID_EP8","modbus_fnctID_EP9"],
    modbus_datasize:["modbus_datasize_EP1","modbus_datasize_EP2","modbus_datasize_EP3","modbus_datasize_EP4","modbus_datasize_EP5","modbus_datasize_EP6","modbus_datasize_EP7","modbus_datasize_EP8","modbus_datasize_EP9"]
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
