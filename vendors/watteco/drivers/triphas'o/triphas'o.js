let watteco = require("../../codec/decode_uplink")
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
function decodeUplink(input) {
    return watteco.watteco_decodeUplink(input,batch_param,endpointCorresponder);
}
exports.decodeUplink = decodeUplink;

// Make it also globally available as it is TS013 compliant, 
// but keep former diver.decodeUplink format for retrocompatibility
(globalThis || this).decodeUplink = decodeUplink;



