function extractPoints(input) {
    const result = {}
    const data = input.message

    if (input.message != null && Array.isArray(data)) {
        data.forEach((item) => {
            if (item.variable != null) {
                switch (item.variable) {
                    case "index":
                        if (!result.counter) {
                            result.counter = {unitId: "count", records: [], nature:"Number of pulse detection on input 1"}
                        }
                        result.counter.records.push({
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

    if(result.counter != null && result.counter.records.length === 1) {
        let val = result.counter.records[0].value
        result.counter = { unitId: "count", record: val, nature:"Number of pulse detection on input 1" }
    }

    if(result.batteryVoltage != null && result.batteryVoltage.records.length === 1) {
        let val = result.batteryVoltage.records[0].value
        result.batteryVoltage = { unitId: "V", record: val }
    }

    return result
}

exports.extractPoints = extractPoints