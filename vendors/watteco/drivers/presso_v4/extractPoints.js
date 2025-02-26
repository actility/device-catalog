function extractPoints(input) {
    const result = {}
    const data = input.message.data

    if (input.message.data != null && Array.isArray(data)) {
        data.forEach((item) => {
            if (item.variable != null) {
                switch (item.variable) {
                    case "0_10_V":
                        if (!result.voltage) {
                            result.voltage = { unitId: "mV", records: [], nature: "Volt value from 0_10_V input" }
                        }
                        result.voltage.records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "4_20_mA":
                        if (!result.current) {
                            result.current = { unitId: "mA", records: [], nature: "amp value from 4_20mA input"}
                        }
                        result.current.records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "battery_voltage":
                        if (!result.batteryVoltage) {
                            result.batteryVoltage = { unitId: "V", records: []}
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

    if(result.voltage != null && result.voltage.records.length === 1) {
        let val = result.voltage.records[0].value
        result.voltage = { unitId: "mV", record: val, nature: "Volt value from 0_10_V input" }
    }

    if(result.current != null && result.current.records.length === 1) {
        let val = result.current.records[0].value
        result.current = { unitId: "mA", record: val, nature: "amp value from 4_20mA input"}
    }

    return result
}

exports.extractPoints = extractPoints