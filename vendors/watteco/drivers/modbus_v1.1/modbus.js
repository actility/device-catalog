let watteco = require("../../codec/decode_uplink")

let batch_param=[]
let endpointCorresponder={
    modbus_payload:["modbus_payload_EP1","modbus_payload_EP2","modbus_payload_EP3","modbus_payload_EP4","modbus_payload_EP5","modbus_payload_EP6","modbus_payload_EP7","modbus_payload_EP8","modbus_payload_EP9"],
    modbus_slaveID:["modbus_slaveID_EP1","modbus_slaveID_EP2","modbus_slaveID_EP3","modbus_slaveID_EP4","modbus_slaveID_EP5","modbus_slaveID_EP6","modbus_slaveID_EP7","modbus_slaveID_EP8","modbus_slaveID_EP9"],
    modbus_fnctID:["modbus_fnctID_EP1","modbus_fnctID_EP2","modbus_fnctID_EP3","modbus_fnctID_EP4","modbus_fnctID_EP5","modbus_fnctID_EP6","modbus_fnctID_EP7","modbus_fnctID_EP8","modbus_fnctID_EP9"],
    modbus_datasize:["modbus_datasize_EP1","modbus_datasize_EP2","modbus_datasize_EP3","modbus_datasize_EP4","modbus_datasize_EP5","modbus_datasize_EP6","modbus_datasize_EP7","modbus_datasize_EP8","modbus_datasize_EP9"]
}
function decodeUplink(input) {
    return watteco.watteco_decodeUplink(input, batch_param, endpointCorresponder);
}
exports.decodeUplink = decodeUplink;

// Make it also globally available as it is TS013 compliant, 
// but keep former diver.decodeUplink format for retrocompatibility
(globalThis || this).decodeUplink = decodeUplink;

