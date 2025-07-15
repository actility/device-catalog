function extractPoints(input) {
    const result = {}
    const data = input.message

    if (input.message != null && Array.isArray(data)) {
        data.forEach((item) => {
            if (item.variable != null) {
                switch (item.variable) {
                    case "angle":
                        if (!result.angle) {
                            result.angle = { unitId: "deg", records: [] }
                        }
                        result.angle.records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "occupancy":
                        if (!result.presence) {
                            result.presence = { unitId: "state", records: [] }
                        }
                        result.presence.records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "ACCmg":
                        if (!result.acceleration) {
                            result.acceleration = { unitId: "mG", records: [] }
                        }
                        result.acceleration.records.push({
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

    if(result.acceleration != null && result.acceleration.records.length === 1) {
        let val = result.acceleration.records[0].value
        result.acceleration = { unitId: "mG", record: val }
    }

    if(result.presence != null && result.presence.records.length === 1) {
        let val = result.presence.records[0].value
        result.presence = { unitId: "state", record: val }
    }

    if(result.angle != null && result.angle.records.length === 1) {
        let val = result.angle.records[0].value
        result.angle = { unitId: "deg", record: val }
    }

    return result
}

exports.extractPoints = extractPoints