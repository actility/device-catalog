let util = require("../../../util");

const TempType = Object.freeze({
    TEMP_HIGH: "TEMP_HIGH",
    TEMP_LOW: "TEMP_LOW",
    TEMP_NORMAL: "TEMP_NORMAL"
})


function determineTemperature(payload){
    return util.convertNegativeInt(payload[5],1)
}
module.exports = {
    determineTemperature: determineTemperature,
    TempType: TempType
}