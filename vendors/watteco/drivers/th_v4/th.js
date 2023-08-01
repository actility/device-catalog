let watteco = require("../decode.js");
let batch_param = [2, [{ taglbl: 0, resol: 10, sampletype: 7, lblname: "temperature", divide: 100 }, { taglbl: 1, resol: 100, sampletype: 6, lblname: "humidity", divide: 100 }, { taglbl: 2, resol: 1, sampletype: 6, lblname: "battery_voltage", divide: 1000 }, { taglbl: 3, resol: 1, sampletype: 1, lblname: "open_case", divide: 1 }]];
function decodeUplink(input) {
    return result = watteco.watteco_decodeUplink(input,batch_param);
}
module.exports.decodeUplink = decodeUplink;