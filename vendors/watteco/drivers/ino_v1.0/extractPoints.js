function extractPoints(input) {
    const result = {}
    const data = input.message
    if (input.message != null && Array.isArray(data)) {
        data.forEach((item) => {
            if (item.variable != null) {
                switch (item.variable) {
                    case "pin_state_1":
                        result["status:0"] = { unitId: "state", record: item.value, nature: "Input"}
                        break
                    case "pin_state_2":
                        result["status:1"] = { unitId: "state", record: item.value, nature: "Input"}
                        break
                    case "pin_state_3":
                        result["status:2"] = { unitId: "state", record: item.value, nature: "Input"}
                        break
                    case "pin_state_4":
                        result["status:3"] = { unitId: "state", record: item.value, nature: "Input"}
                        break
                    case "pin_state_5":
                        result["status:4"] = { unitId: "state", record: item.value, nature: "Input"}
                        break
                    case "pin_state_6":
                        result["status:5"] = { unitId: "state", record: item.value, nature: "Input"}
                        break
                    case "pin_state_7":
                        result["status:6"] = { unitId: "state", record: item.value, nature: "Input"}
                        break
                    case "pin_state_8":
                        result["status:7"] = { unitId: "state", record: item.value, nature: "Input"}
                        break
                    case "pin_state_9":
                        result["status:8"] = { unitId: "state", record: item.value, nature: "Input"}
                        break
                    case "pin_state_10":
                        result["status:9"] = { unitId: "state", record: item.value, nature: "Input"}
                        break
                    case "output_1":
                        result["status:10"] = { unitId: "state", record: item.value === "ON", nature: "Output"}
                        break
                    case "output_2":
                        result["status:11"] = { unitId: "state", record: item.value === "ON", nature: "Output"}
                        break
                    case "output_3":
                        result["status:12"] = { unitId: "state", record: item.value === "ON", nature: "Output"}
                        break
                    case "output_4":
                        result["status:13"] = { unitId: "state", record: item.value === "ON" , nature: "Output"}
                        break
                    case "disposable_battery_voltage":
                        result.batteryVoltage = { unitId: "V", record: item.value}
                        break
                    default:
                        break
                }
            }
        })
    }

    return result
}

exports.extractPoints = extractPoints