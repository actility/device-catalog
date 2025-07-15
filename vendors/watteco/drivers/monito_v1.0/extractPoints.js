function extractPoints(input) {
    const result = {}
    const data = input.message

    if (input.message != null && Array.isArray(data)) {
        data.forEach((item) => {
            if (item.variable != null) {
                switch (item.variable) {
                    case "0-70_V":
                        if (!result["voltage:1"]) {
                            result["voltage:1"] = { unitId: "mV", records: [] }
                        }
                        result["voltage:1"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "0-100_mV":
                        if (!result["voltage:0"]) {
                            result["voltage:0"] = { unitId: "mV", records: [] }
                        }
                        result["voltage:0"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "battery_voltage":
                        if (!result.batteryVoltage) {
                            result.batteryVoltage = { unitId: "V", records: [] }
                        }
                        result.batteryVoltage.records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break
                        
                    case "disposable_battery_voltage":
                        if (!result.batteryVoltage) {
                            result.batteryVoltage = { unitId: "V", records: [] }
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

    if(result.batteryVoltage != null && result.batteryVoltage.records.length === 1) {
        let val = result.batteryVoltage.records[0].value
        result.batteryVoltage = { unitId: "V", record: val }
    }

    if(result["voltage:1"] != null && result["voltage:1"].records.length === 1) {
        let val = result["voltage:1"].records[0].value
        result["voltage:1"] = { unitId: "mV", record: val }
    }

    if(result["voltage:0"] != null && result["voltage:0"].records.length === 1) {
        let val = result["voltage:0"].records[0].value
        result["voltage:0"] = { unitId: "mV", record: val }
    }

    return result
}

exports.extractPoints = extractPoints