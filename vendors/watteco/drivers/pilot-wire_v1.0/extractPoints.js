function extractPoints(input) {
    const result = {}
    const data = input.message

    if (input.message != null && Array.isArray(data)) {
        data.forEach((item) => {
            if (item.variable != null) {
                switch (item.variable) {
                    case "output_value":
                        if (!result.status) {
                            result.status = { unitId: "state", records: [] }
                        }
                        if(item.value === 1 || item.value === 0) {
                            result.status.records.push({
                                eventTime: new Date(item.date).toISOString(),
                                value: item.value === 1,
                                nature: item.value === 1 ? "On" : "Off"
                            })
                        }
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

    if(result.status != null && result.status.records.length === 1) {
        let val = result.status.records[0].value
        result.status = { unitId: "state", record: val, nature: val === 1 ? "On" : "Off"}
    }

    return result
}

exports.extractPoints = extractPoints

