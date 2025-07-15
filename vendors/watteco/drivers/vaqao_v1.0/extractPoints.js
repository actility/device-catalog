function extractPoints(input) {
    const result = {}
    const data = input.message

    if (input.message != null && Array.isArray(data)) {
        data.forEach((item) => {
            if (item.variable != null) {
                switch (item.variable) {
                    case "temperature_1":
                        if (!result["temperature:0"]) {
                            result["temperature:0"] = { unitId: "Cel", records: [] }
                        }
                        result["temperature:0"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "humidity_1":
                        if (!result["humidity:0"]) {
                            result["humidity:0"] = { unitId: "%RH", records: [] }
                        }
                        result["humidity:0"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "temperature_2":
                        if (!result["temperature:1"]) {
                            result["temperature:1"] = { unitId: "Cel", records: [] }
                        }
                        result["temperature:1"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "humidity_2":
                        if (!result["humidity:1"]) {
                            result["humidity:1"] = { unitId: "%RH", records: [] }
                        }
                        result["humidity:1"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "pressure":
                        if (!result.pressure) {
                            result.pressure = { unitId: "mbar", records: [] }
                        }
                        result.pressure.records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "CO2":
                        if (!result.co2Level) {
                            result.co2Level = { unitId: "ppm", records: [] }
                        }
                        result.co2Level.records.push({
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
                        if (!result.occupancy) {
                            result.occupancy = { unitId: "state", records: [] }
                        }
                        result.occupancy.records.push({
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

    if(result.pressure != null && result.pressure.records.length === 1) {
        let val = result.pressure.records[0].value
        result.pressure = { unitId: "mbar", record: val }
    }

    if(result.co2Level != null && result.co2Level.records.length === 1) {
        let val = result.co2Level.records[0].value
        result.co2Level = { unitId: "ppm", record: val }
    }

    if(result.illuminance != null && result.illuminance.records.length === 1) {
        let val = result.illuminance.records[0].value
        result.illuminance = { unitId: "lx", record: val }
    }

    if(result.occupancy != null && result.occupancy.records.length === 1) {
        let val = result.occupancy.records[0].value
        result.occupancy = { unitId: "state", record: val }
    }

    if(result["humidity:0"] != null && result["humidity:0"].records.length === 1) {
        let val = result["humidity:0"].records[0].value
        result["humidity:0"] = { unitId: "%H", record: val }
    }

    if(result["humidity:1"] != null && result["humidity:1"].records.length === 1) {
        let val = result["humidity:1"].records[0].value
        result["humidity:1"] = { unitId: "%H", record: val }
    }

    if(result["temperature:0"] != null && result["temperature:0"].records.length === 1) {
        let val = result["temperature:0"].records[0].value
        result["temperature:0"] = { unitId: "Cel", record: val }
    }

    if(result["temperature:1"] != null && result["temperature:1"].records.length === 1) {
        let val = result["temperature:1"].records[0].value
        result["temperature:1"] = { unitId: "Cel", record: val }
    }

    return result
}

exports.extractPoints = extractPoints