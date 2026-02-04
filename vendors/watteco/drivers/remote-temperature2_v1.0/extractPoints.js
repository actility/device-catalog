function extractPoints(input) {
    const result = {}
    const data = input.message

    if (input.message != null && Array.isArray(data)) {
        data.forEach((item) => {
            if (item.variable != null) {
                switch (item.variable) {
                    case "temperature_1":
                        if (!result["temperature:0"]) {
                            result["temperature:0"] = {unitId: "Cel", records: [] }
                        }
                        result["temperature:0"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "temperature_2":
                        if (!result["temperature:1"]) {
                            result["temperature:1"] = {unitId: "Cel", records: [] }
                        }
                        result["temperature:1"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break
                    
                    case "battery_voltage":
                        if (!result.batteryVoltage) {
                            result.batteryVoltage = {unitId: "V", records: []}
                        }
                        result.batteryVoltage.records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break
                    case "disposable_battery_voltage":
                        if (!result.batteryVoltage) {
                            result.batteryVoltage = {unitId: "V", records: []}
                        }
                        result.batteryVoltage.records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break
                    default:
                        break
                }
            }
        })
    } else {
        return {}
    }

    if(result["temperature:0"] != null && result["temperature:0"].records.length === 1) {
        let val = result["temperature:0"].records[0].value
        result["temperature:0"] = { unitId: "Cel", record: val }
    }

    if(result["temperature:1"] != null && result["temperature:1"].records.length === 1) {
        let val = result["temperature:1"].records[0].value
        result["temperature:1"] = { unitId: "Cel", record: val }
    }

    if(result.batteryVoltage != null && result.batteryVoltage.records.length === 1) {
        let val = result.batteryVoltage.records[0].value
        result.batteryVoltage = { unitId: "V", record: val }
    }

    return result
}

exports.extractPoints = extractPoints