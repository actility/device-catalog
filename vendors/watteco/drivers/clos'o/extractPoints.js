function extractPoints(input) {
    const result = {}
    const data = input.message

    if (input.message!= null && Array.isArray(data)) {
        data.forEach((item) => {
            if (item.variable != null) {
                switch (item.variable) {
                    case "open":
                        if (!result.status) {
                            result.status = {unitId: "state", records: [], nature:"Open case detection state"}
                        }
                        result.status.records.push({
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

    if(result.status != null && result.status.records.length === 1) {
        let val = result.status.records[0].value
        result.status = { unitId: "state", record: val, nature:"Open case detection state"}
    }

    if(result.batteryVoltage != null && result.batteryVoltage.records.length === 1) {
        let val = result.batteryVoltage.records[0].value
        result.batteryVoltage = { unitId: "V", record: val }
    }

    return result
}

exports.extractPoints = extractPoints