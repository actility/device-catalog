function extractPoints(input) {
    const result = {}
    const data = input.message

    if (input.message != null && Array.isArray(data)) {
        data.forEach((item) => {
            if (item.variable != null) {
                switch (item.variable) {
                    case "pin_state_1":
                        if (!result["status:0"]) {
                            result["status:0"] = { unitId: "state", records: [] }
                        }
                        result["status:0"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "pin_state_2":
                        if (!result["status:1"]) {
                            result["status:1"] = { unitId: "state", records: [] }
                        }
                        result["status:1"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "pin_state_3":
                        if (!result["status:2"]) {
                            result["status:2"] = { unitId: "state", records: []}
                        }
                        result["status:2"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "index_1":
                        if (!result["frequency:0"]) {
                            result["frequency:0"] = { unitId: "pulse/h", records: []}
                        }
                        result["frequency:0"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "index_2":
                        if (!result["frequency:1"]) {
                            result["frequency:1"] = { unitId: "pulse/h", records: []}
                        }
                        result["frequency:1"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "index_3":
                        if (!result["frequency:2"]) {
                            result["frequency:2"] = { unitId: "pulse/h", records: []}
                        }
                        result["frequency:2"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "4-20_mA":
                        if (!result.current) {
                            result.current = { unitId: "mA", records: []}
                        }
                        result.current.records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "0-5_V_1":
                        if (!result["voltage:0"]) {
                            result["voltage:0"] = { unitId: "mV", records: []}
                        }
                        result["voltage:0"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "0-5_V_2":
                        if (!result["voltage:1"]) {
                            result["voltage:1"] = { unitId: "mV", records: []}
                        }
                        result["voltage:1"].records.push({
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

    if(result["status:0"] != null && result["status:0"].records.length === 1) {
        let val = result["status:0"].records[0].value
        result["status:0"] = { unitId: "state", record: val }
    }

    if(result["status:1"] != null && result["status:1"].records.length === 1) {
        let val = result["status:1"].records[0].value
        result["status:1"] = { unitId: "state", record: val }
    }

    if(result["status:2"] != null && result["status:2"].records.length === 1) {
        let val = result["status:2"].records[0].value
        result["status:2"] = { unitId: "state", record: val }
    }

    if(result["frequency:0"] != null && result["frequency:0"].records.length === 1) {
        let val = result["frequency:0"].records[0].value
        result["frequency:0"] = { unitId: "pulse/h", record: val }
    }

    if(result["frequency:1"] != null && result["frequency:1"].records.length === 1) {
        let val = result["frequency:1"].records[0].value
        result["frequency:1"] = { unitId: "pulse/h", record: val }
    }

    if(result["frequency:2"] != null && result["frequency:2"].records.length === 1) {
        let val = result["frequency:2"].records[0].value
        result["frequency:2"] = { unitId: "pulse/h", record: val }
    }

    if(result.current != null && result.current.records.length === 1) {
        let val = result.current.records[0].value
        result.current = { unitId: "mA", record: val }
    }

    if(result["voltage:0"] != null && result["voltage:0"].records.length === 1) {
        let val = result["voltage:0"].records[0].value
        result["voltage:0"] = { unitId: "mV", record: val }
    }

    if(result["voltage:1"] != null && result["voltage:1"].records.length === 1) {
        let val = result["voltage:1"].records[0].value
        result["voltage:1"] = { unitId: "mV", record: val }
    }

    return result
}

exports.extractPoints = extractPoints