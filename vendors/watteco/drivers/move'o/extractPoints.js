function extractPoints(input) {
    const result = {}
    const data = input.message

    if (input.message != null && Array.isArray(data)) {
        data.forEach((item) => {
            if (item.variable != null) {
                switch (item.variable) {
                    case "temperature":
                        if (!result.temperature) {
                            result.temperature = { unitId: "Cel", records: [] }
                        }
                        result.temperature.records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "humidity":
                        if (!result.humidity) {
                            result.humidity = { unitId: "%RH", records: [] }
                        }
                        result.humidity.records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "illuminance":
                        if (!result.illuminance) {
                            result.illuminance = { unitId: "lx", records: [] }
                        }
                        result.illuminance.records.push({
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

                    case "violation_detection":
                        if (!result.status) {
                            result.status = { unitId: "state", records: [], nature: "violation_detection" }
                        }
                        result.status.records.push({
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

    if(result.presence != null && result.presence.records.length === 1) {
        let val = result.presence.records[0].value
        result.presence = { unitId: "state", record: val }
    }

    if(result.status != null && result.status.records.length === 1) {
        let val = result.status.records[0].value
        result.status = { unitId: "state", record: val, nature: "violation_detection" }
    }

    if(result.humidity != null && result.humidity.records.length === 1) {
        let val = result.humidity.records[0].value
        result.humidity = { unitId: "%H", record: val }
    }

    if(result.illuminance != null && result.illuminance.records.length === 1) {
        let val = result.illuminance.records[0].value
        result.illuminance = { unitId: "lx", record: val }
    }

    if(result.temperature != null && result.temperature.records.length === 1) {
        let val = result.temperature.records[0].value
        result.temperature = { unitId: "Cel", record: val }
    }

    return result
}

exports.extractPoints = extractPoints