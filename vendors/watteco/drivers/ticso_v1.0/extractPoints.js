function extractPoints(input) {
    const result = {}
    const data = input.message

    if (input.message != null && Array.isArray(data)) {
        data.forEach((item) => {
            if (item.variable != null) {
                switch (item.variable) {
                    case "active_energy":
                        if (!result.powerRate) {
                            result.powerRate = { unitId: "W/h", records: [] }
                        }
                        result.powerRate.records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "reactive_energy":
                        if (!result.reactiveEnergy) {
                            result.reactiveEnergy = { unitId: "var/h", records: [] }
                        }
                        result.reactiveEnergy.records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "nb_samples":
                        if (!result.duration) {
                            result.duration = { unitId: "minute", records: [] }
                        }
                        result.duration.records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "active_power":
                        if (!result.activePower) {
                            result.activePower = { unitId: "W", records: [] }
                        }
                        result.activePower.records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "reactive_power":
                        if (!result.reactivePower) {
                            result.reactivePower = { unitId: "var", records: [] }
                        }
                        result.reactivePower.records.push({
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

    if(result.powerRate != null && result.powerRate.records.length === 1) {
        let val = result.powerRate.records[0].value
        result.powerRate = { unitId: "W/h", record: val }
    }

    if(result.reactiveEnergy != null && result.reactiveEnergy.records.length === 1) {
        let val = result.reactiveEnergy.records[0].value
        result.reactiveEnergy = { unitId: "var/h", record: val }
    }

    if(result.duration != null && result.duration.records.length === 1) {
        let val = result.duration.records[0].value
        result.duration = { unitId: "minute", record: val }
    }

    if(result.activePower != null && result.activePower.records.length === 1) {
        let val = result.activePower.records[0].value
        result.activePower = { unitId: "W", record: val }
    }

    if(result.reactivePower != null && result.reactivePower.records.length === 1) {
        let val = result.reactivePower.records[0].value
        result.reactivePower = { unitId: "var", record: val }
    }

    return result
}

exports.extractPoints = extractPoints