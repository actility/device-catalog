function extractPoints(input) {
    const result = {}
    const data = input.message

    if (input.message != null && Array.isArray(data)) {
        data.forEach((item) => {
            if (item.variable != null) {
                switch (item.variable) {
                    case "output":
                        if (!result.status) {
                            result.status = { unitId: "state", records: [] }
                        }
                        result.status.records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value === "ON"
                        })
                        break

                    case "positive_active_energy_a":
                        if (!result["powerRate:0"]) {
                            result["powerRate:0"] = { unitId: "W/h", records: [], nature: "Positive active energy" }
                        }
                        result["powerRate:0"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "positive_active_energy_b":
                        if (!result["powerRate:1"]) {
                            result["powerRate:1"] = { unitId: "W/h", records: [], nature: "Positive active energy" }
                        }
                        result["powerRate:1"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break


                    case "positive_active_energy_c":
                        if (!result["powerRate:2"]) {
                            result["powerRate:2"] = { unitId: "W/h", records: [], nature: "Positive active energy" }
                        }
                        result["powerRate:2"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "active_energy_a":
                        if (!result["powerRate:0"]) {
                            result["powerRate:0"] = { unitId: "W/h", records: [], nature: "Positive active energy" }
                        }
                        result["powerRate:0"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "active_energy_b":
                        if (!result["powerRate:1"]) {
                            result["powerRate:1"] = { unitId: "W/h", records: [], nature: "Positive active energy" }
                        }
                        result["powerRate:1"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break


                    case "active_energy_c":
                        if (!result["powerRate:2"]) {
                            result["powerRate:2"] = { unitId: "W/h", records: [], nature: "Positive active energy" }
                        }
                        result["powerRate:2"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break


                    case "active_energy_abc":
                        if (!result["powerRate:3"]) {
                            result["powerRate:3"] = { unitId: "W/h", records: [], nature: "Positive active energy" }
                        }
                        result["powerRate:3"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "negative_active_energy_a":
                        if (!result["powerRate:4"]) {
                            result["powerRate:4"] = { unitId: "W/h", records: [], nature: "Negative active energy" }
                        }
                        result["powerRate:4"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "negative_active_energy_b":
                        if (!result["powerRate:5"]) {
                            result["powerRate:5"] = { unitId: "W/h", records: [], nature: "Negative active energy" }
                        }
                        result["powerRate:5"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break


                    case "negative_active_energy_c":
                        if (!result["powerRate:6"]) {
                            result["powerRate:6"] = { unitId: "W/h", records: [], nature: "Negative active energy" }
                        }
                        result["powerRate:6"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break


                    case "negative_active_energy_abc":
                        if (!result["powerRate:7"]) {
                            result["powerRate:7"] = { unitId: "W/h", records: [], nature: "Negative active energy" }
                        }
                        result["powerRate:7"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "positive_reactive_energy_a":
                        if (!result["reactiveEnergy:0"]) {
                            result["reactiveEnergy:0"] = { unitId: "varh", records: [], nature: "Positive reactive energy" }
                        }
                        result["reactiveEnergy:0"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "positive_reactive_energy_b":
                        if (!result["reactiveEnergy:1"]) {
                            result["reactiveEnergy:1"] = { unitId: "varh", records: [], nature: "Positive reactive energy" }
                        }
                        result["reactiveEnergy:1"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break


                    case "positive_reactive_energy_c":
                        if (!result["reactiveEnergy:2"]) {
                            result["reactiveEnergy:2"] = { unitId: "varh", records: [], nature: "Positive reactive energy" }
                        }
                        result["reactiveEnergy:2"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break


                    case "positive_reactive_energy_abc":
                        if (!result["reactiveEnergy:3"]) {
                            result["reactiveEnergy:3"] = { unitId: "varh", records: [], nature: "Positive reactive energy" }
                        }
                        result["reactiveEnergy:3"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "reactive_energy_a":
                        if (!result["reactiveEnergy:0"]) {
                            result["reactiveEnergy:0"] = { unitId: "varh", records: [], nature: "Positive reactive energy" }
                        }
                        result["reactiveEnergy:0"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "reactive_energy_b":
                        if (!result["reactiveEnergy:1"]) {
                            result["reactiveEnergy:1"] = { unitId: "varh", records: [], nature: "Positive reactive energy" }
                        }
                        result["reactiveEnergy:1"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break


                    case "reactive_energy_c":
                        if (!result["reactiveEnergy:2"]) {
                            result["reactiveEnergy:2"] = { unitId: "varh", records: [], nature: "Positive reactive energy" }
                        }
                        result["reactiveEnergy:2"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break


                    case "reactive_energy_abc":
                        if (!result["reactiveEnergy:3"]) {
                            result["reactiveEnergy:3"] = { unitId: "varh", records: [], nature: "Positive reactive energy" }
                        }
                        result["reactiveEnergy:3"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "negative_reactive_energy_a":
                        if (!result["reactiveEnergy:4"]) {
                            result["reactiveEnergy:4"] = { unitId: "varh", records: [], nature: "Negative reactive energy" }
                        }
                        result["reactiveEnergy:4"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "negative_reactive_energy_b":
                        if (!result["reactiveEnergy:5"]) {
                            result["reactiveEnergy:5"] = { unitId: "varh", records: [], nature: "Negative reactive energy" }
                        }
                        result["reactiveEnergy:5"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break


                    case "negative_reactive_energy_c":
                        if (!result["reactiveEnergy:6"]) {
                            result["reactiveEnergy:6"] = { unitId: "varh", records: [], nature: "Negative reactive energy" }
                        }
                        result["reactiveEnergy:6"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break


                    case "negative_reactive_energy_abc":
                        if (!result["reactiveEnergy:7"]) {
                            result["reactiveEnergy:7"] = { unitId: "varh", records: [], nature: "Negative active energy" }
                        }
                        result["reactiveEnergy:7"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "positive_active_power_a":
                        if (!result["activePower:0"]) {
                            result["activePower:0"] = { unitId: "W", records: [], nature: "Positive active power" }
                        }
                        result["activePower:0"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "positive_active_power_b":
                        if (!result["activePower:1"]) {
                            result["activePower:1"] = { unitId: "W", records: [], nature: "Positive active power" }
                        }
                        result["activePower:1"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break


                    case "positive_active_power_c":
                        if (!result["activePower:2"]) {
                            result["activePower:2"] = { unitId: "W", records: [], nature: "Positive active power" }
                        }
                        result["activePower:2"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break


                    case "positive_active_power_abc":
                        if (!result["activePower:3"]) {
                            result["activePower:3"] = { unitId: "W", records: [], nature: "Positive active power" }
                        }
                        result["activePower:3"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break


                    case "active_power_a":
                        if (!result["activePower:0"]) {
                            result["activePower:0"] = { unitId: "W", records: [], nature: "Positive active power" }
                        }
                        result["activePower:0"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "active_power_b":
                        if (!result["activePower:1"]) {
                            result["activePower:1"] = { unitId: "W", records: [], nature: "Positive active power" }
                        }
                        result["activePower:1"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break


                    case "active_power_c":
                        if (!result["activePower:2"]) {
                            result["activePower:2"] = { unitId: "W", records: [], nature: "Positive active power" }
                        }
                        result["activePower:2"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break


                    case "active_power_abc":
                        if (!result["activePower:3"]) {
                            result["activePower:3"] = { unitId: "W", records: [], nature: "Positive active power" }
                        }
                        result["activePower:3"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "negative_active_power_a":
                        if (!result["activePower:4"]) {
                            result["activePower:4"] = { unitId: "W", records: [], nature: "Negative active power" }
                        }
                        result["activePower:4"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "negative_active_power_b":
                        if (!result["activePower:5"]) {
                            result["activePower:5"] = { unitId: "W", records: [], nature: "Negative active power" }
                        }
                        result["activePower:5"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break


                    case "negative_active_power_c":
                        if (!result["activePower:6"]) {
                            result["activePower:6"] = { unitId: "W", records: [], nature: "Negative active power" }
                        }
                        result["activePower:6"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break


                    case "negative_active_power_abc":
                        if (!result["activePower:7"]) {
                            result["activePower:7"] = { unitId: "W", records: [], nature: "Negative active power" }
                        }
                        result["activePower:7"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "positive_reactive_power_a":
                        if (!result["reactivePower:0"]) {
                            result["reactivePower:0"] = { unitId: "var", records: [], nature: "Positive reactive power" }
                        }
                        result["reactivePower:0"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "positive_reactive_power_b":
                        if (!result["reactivePower:1"]) {
                            result["reactivePower:1"] = { unitId: "var", records: [], nature: "Positive reactive power" }
                        }
                        result["reactivePower:1"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break


                    case "positive_reactive_power_c":
                        if (!result["reactivePower:2"]) {
                            result["reactivePower:2"] = { unitId: "var", records: [], nature: "Positive reactive power" }
                        }
                        result["reactivePower:2"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break


                    case "positive_reactive_power_abc":
                        if (!result["reactivePower:3"]) {
                            result["reactivePower:3"] = { unitId: "var", records: [], nature: "Positive reactive power" }
                        }
                        result["reactivePower:3"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "reactive_power_a":
                        if (!result["reactivePower:0"]) {
                            result["reactivePower:0"] = { unitId: "var", records: [], nature: "Positive reactive power" }
                        }
                        result["reactivePower:0"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "reactive_power_b":
                        if (!result["reactivePower:1"]) {
                            result["reactivePower:1"] = { unitId: "var", records: [], nature: "Positive reactive power" }
                        }
                        result["reactivePower:1"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break


                    case "reactive_power_c":
                        if (!result["reactivePower:2"]) {
                            result["reactivePower:2"] = { unitId: "var", records: [], nature: "Positive reactive power" }
                        }
                        result["reactivePower:2"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break


                    case "reactive_power_abc":
                        if (!result["reactivePower:3"]) {
                            result["reactivePower:3"] = { unitId: "var", records: [], nature: "Positive reactive power" }
                        }
                        result["reactivePower:3"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "negative_reactive_power_a":
                        if (!result["reactivePower:4"]) {
                            result["reactivePower:4"] = { unitId: "var", records: [], nature: "Negative reactive power" }
                        }
                        result["reactivePower:4"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "negative_reactive_power_b":
                        if (!result["reactivePower:5"]) {
                            result["reactivePower:5"] = { unitId: "var", records: [], nature: "Negative reactive power" }
                        }
                        result["reactivePower:5"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break


                    case "negative_reactive_power_c":
                        if (!result["reactivePower:6"]) {
                            result["reactivePower:6"] = { unitId: "var", records: [], nature: "Negative reactive power" }
                        }
                        result["reactivePower:6"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break


                    case "negative_reactive_power_abc":
                        if (!result["reactivePower:7"]) {
                            result["reactivePower:7"] = { unitId: "var", records: [], nature: "Negative reactive power" }
                        }
                        result["reactivePower:7"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "Vrms_a":
                        if (!result["rmsVoltage:0"]) {
                            result["rmsVoltage:0"] = { unitId: "V", records: []}
                        }
                        result["rmsVoltage:0"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value/10
                        })
                        break

                    case "Vrms_b":
                        if (!result["rmsVoltage:1"]) {
                            result["rmsVoltage:1"] = { unitId: "V", records: [] }
                        }
                        result["rmsVoltage:1"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value/10
                        })
                        break

                    case "Vrms_c":
                        if (!result["rmsVoltage:2"]) {
                            result["rmsVoltage:2"] = { unitId: "V", records: []}
                        }
                        result["rmsVoltage:2"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value/10
                        })
                        break

                    case "Irms_a":
                        if (!result["current:0"]) {
                            result["current:0"] = { unitId: "A", records: [], nature: "Irms A"}
                        }
                        result["current:0"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "Irms_b":
                        if (!result["current:1"]) {
                            result["current:1"] = { unitId: "A", records: [], nature: "Irms B"}
                        }
                        result["current:1"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "Irms_c":
                        if (!result["current:2"]) {
                            result["current:2"] = { unitId: "A", records: [], nature: "Irms C"}
                        }
                        result["current:2"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value/10
                        })
                        break

                    case "angle_a":
                        if (!result["angle:0"]) {
                            result["angle:0"] = { unitId: "A", records: []}
                        }
                        result["angle:0"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "angle_b":
                        if (!result["angle:1"]) {
                            result["angle:1"] = { unitId: "deg", records: []}
                        }
                        result["angle:1"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "angle_c":
                        if (!result["angle:2"]) {
                            result["angle:2"] = { unitId: "deg", records: []}
                        }
                        result["angle:2"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value/10
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

    if(result.status != null && result.status.records.length === 1) {
        let val = result.status.records[0].value
        result.status = { unitId: "state", record: val }
    }

    if(result["powerRate:0"] != null && result["powerRate:0"].records.length === 1) {
        let val = result["powerRate:0"].records[0].value
        result["powerRate:0"] = { unitId: "W/h", record: val, nature: "Positive active energy" }
    }

    if(result["powerRate:1"] != null && result["powerRate:1"].records.length === 1) {
        let val = result["powerRate:1"].records[0].value
        result["powerRate:1"] = { unitId: "W/h", record: val, nature: "Positive active energy" }
    }

    if(result["powerRate:2"] != null && result["powerRate:2"].records.length === 1) {
        let val = result["powerRate:2"].records[0].value
        result["powerRate:2"] = { unitId: "W/h", record: val, nature: "Positive active energy" }
    }

    if(result["powerRate:3"] != null && result["powerRate:3"].records.length === 1) {
        let val = result["powerRate:3"].records[0].value
        result["powerRate:3"] = { unitId: "W/h", record: val, nature: "Positive active energy" }
    }

    if(result["powerRate:4"] != null && result["powerRate:4"].records.length === 1) {
        let val = result["powerRate:4"].records[0].value
        result["powerRate:4"] = { unitId: "W/h", record: val, nature: "Negative active energy" }
    }

    if(result["powerRate:5"] != null && result["powerRate:5"].records.length === 1) {
        let val = result["powerRate:5"].records[0].value
        result["powerRate:5"] = { unitId: "W/h", record: val, nature: "Negative active energy" }
    }

    if(result["powerRate:6"] != null && result["powerRate:6"].records.length === 1) {
        let val = result["powerRate:6"].records[0].value
        result["powerRate:6"] = { unitId: "W/h", record: val, nature: "Negative active energy" }
    }

    if(result["powerRate:7"] != null && result["powerRate:7"].records.length === 1) {
        let val = result["powerRate:7"].records[0].value
        result["powerRate:7"] = { unitId: "W/h", record: val, nature: "Negative active energy" }
    }

    if(result["reactiveEnergy:0"] != null && result["reactiveEnergy:0"].records.length === 1) {
        let val = result["reactiveEnergy:0"].records[0].value
        result["reactiveEnergy:0"] = { unitId: "varh", record: val, nature: "Positive reactive energy" }
    }

    if(result["reactiveEnergy:1"] != null && result["reactiveEnergy:1"].records.length === 1) {
        let val = result["reactiveEnergy:1"].records[0].value
        result["reactiveEnergy:1"] = { unitId: "varh", record: val, nature: "Positive reactive energy" }
    }

    if(result["reactiveEnergy:2"] != null && result["reactiveEnergy:2"].records.length === 1) {
        let val = result["reactiveEnergy:2"].records[0].value
        result["reactiveEnergy:2"] = { unitId: "varh", record: val, nature: "Positive reactive energy" }
    }

    if(result["reactiveEnergy:3"] != null && result["reactiveEnergy:3"].records.length === 1) {
        let val = result["reactiveEnergy:3"].records[0].value
        result["reactiveEnergy:3"] = { unitId: "varh", record: val, nature: "Positive reactive energy" }
    }

    if(result["reactiveEnergy:4"] != null && result["reactiveEnergy:4"].records.length === 1) {
        let val = result["reactiveEnergy:4"].records[0].value
        result["reactiveEnergy:4"] = { unitId: "varh", record: val, nature: "Negative reactive energy" }
    }

    if(result["reactiveEnergy:5"] != null && result["reactiveEnergy:5"].records.length === 1) {
        let val = result["reactiveEnergy:5"].records[0].value
        result["reactiveEnergy:5"] = { unitId: "varh", record: val, nature: "Negative reactive energy" }
    }

    if(result["reactiveEnergy:6"] != null && result["reactiveEnergy:6"].records.length === 1) {
        let val = result["reactiveEnergy:6"].records[0].value
        result["reactiveEnergy:6"] = { unitId: "varh", record: val, nature: "Negative reactive energy" }
    }

    if(result["reactiveEnergy:7"] != null && result["reactiveEnergy:7"].records.length === 1) {
        let val = result["reactiveEnergy:7"].records[0].value
        result["reactiveEnergy:7"] = { unitId: "varh", record: val, nature: "Negative reactive energy" }
    }

    if(result["activePower:0"] != null && result["activePower:0"].records.length === 1) {
        let val = result["activePower:0"].records[0].value
        result["activePower:0"] = { unitId: "W", record: val, nature: "Positive active power" }
    }

    if(result["activePower:1"] != null && result["activePower:1"].records.length === 1) {
        let val = result["activePower:1"].records[0].value
        result["activePower:1"] = { unitId: "W", record: val, nature: "Positive active power" }
    }

    if(result["activePower:2"] != null && result["activePower:2"].records.length === 1) {
        let val = result["activePower:2"].records[0].value
        result["activePower:2"] = { unitId: "W", record: val, nature: "Positive active power" }
    }

    if(result["activePower:3"] != null && result["activePower:3"].records.length === 1) {
        let val = result["activePower:3"].records[0].value
        result["activePower:3"] = { unitId: "W", record: val, nature: "Positive active power" }
    }

    if(result["activePower:4"] != null && result["activePower:4"].records.length === 1) {
        let val = result["activePower:4"].records[0].value
        result["activePower:4"] = { unitId: "W", record: val, nature: "Negative active power" }
    }

    if(result["activePower:5"] != null && result["activePower:5"].records.length === 1) {
        let val = result["activePower:5"].records[0].value
        result["activePower:5"] = { unitId: "W", record: val, nature: "Negative active power" }
    }

    if(result["activePower:6"] != null && result["activePower:6"].records.length === 1) {
        let val = result["activePower:6"].records[0].value
        result["activePower:6"] = { unitId: "W", record: val, nature: "Negative active power" }
    }

    if(result["activePower:7"] != null && result["activePower:7"].records.length === 1) {
        let val = result["activePower:7"].records[0].value
        result["activePower:7"] = { unitId: "W", record: val, nature: "Negative active power" }
    }

    if(result["reactivePower:0"] != null && result["reactivePower:0"].records.length === 1) {
        let val = result["reactivePower:0"].records[0].value
        result["reactivePower:0"] = { unitId: "var", record: val, nature: "Positive reactive energy" }
    }

    if(result["reactivePower:1"] != null && result["reactivePower:1"].records.length === 1) {
        let val = result["reactivePower:1"].records[0].value
        result["reactivePower:1"] = { unitId: "var", record: val, nature: "Positive reactive energy" }
    }

    if(result["reactivePower:2"] != null && result["reactivePower:2"].records.length === 1) {
        let val = result["reactivePower:2"].records[0].value
        result["reactivePower:2"] = { unitId: "var", record: val, nature: "Positive reactive energy" }
    }

    if(result["reactivePower:3"] != null && result["reactivePower:3"].records.length === 1) {
        let val = result["reactivePower:3"].records[0].value
        result["reactivePower:3"] = { unitId: "var", record: val, nature: "Positive reactive energy" }
    }

    if(result["reactivePower:4"] != null && result["reactivePower:4"].records.length === 1) {
        let val = result["reactivePower:4"].records[0].value
        result["reactivePower:4"] = { unitId: "var", record: val, nature: "Negative reactive energy" }
    }

    if(result["reactivePower:5"] != null && result["reactivePower:5"].records.length === 1) {
        let val = result["reactivePower:5"].records[0].value
        result["reactivePower:5"] = { unitId: "var", record: val, nature: "Negative reactive energy" }
    }

    if(result["reactivePower:6"] != null && result["reactivePower:6"].records.length === 1) {
        let val = result["reactivePower:6"].records[0].value
        result["reactivePower:6"] = { unitId: "var", record: val, nature: "Negative reactive energy" }
    }

    if(result["reactivePower:7"] != null && result["reactivePower:7"].records.length === 1) {
        let val = result["reactivePower:7"].records[0].value
        result["reactivePower:7"] = { unitId: "var", record: val, nature: "Negative reactive energy" }
    }

    if(result["rmsVoltage:0"] != null && result["rmsVoltage:0"].records.length === 1) {
        let val = result["rmsVoltage:0"].records[0].value
        result["rmsVoltage:0"] = { unitId: "V", record: val}
    }

    if(result["rmsVoltage:1"] != null && result["rmsVoltage:1"].records.length === 1) {
        let val = result["rmsVoltage:1"].records[0].value
        result["rmsVoltage:1"] = { unitId: "V", record: val}
    }

    if(result["rmsVoltage:2"] != null && result["rmsVoltage:2"].records.length === 1) {
        let val = result["rmsVoltage:2"].records[0].value
        result["rmsVoltage:2"] = { unitId: "V", record: val}
    }

    if(result["angle:0"] != null && result["angle:0"].records.length === 1) {
        let val = result["angle:0"].records[0].value
        result["angle:0"] = { unitId: "deg", record: val}
    }

    if(result["angle:1"] != null && result["angle:1"].records.length === 1) {
        let val = result["angle:1"].records[0].value
        result["angle:1"] = { unitId: "deg", record: val}
    }

    if(result["angle:2"] != null && result["angle:2"].records.length === 1) {
        let val = result["angle:2"].records[0].value
        result["angle:2"] = { unitId: "deg", record: val}
    }

    if(result["current:0"] != null && result["current:0"].records.length === 1) {
        let val = result["current:0"].records[0].value
        result["current:0"] = { unitId: "A", record: val}
    }

    if(result["current:1"] != null && result["current:1"].records.length === 1) {
        let val = result["current:1"].records[0].value
        result["current:1"] = { unitId: "A", record: val}
    }

    if(result["current:2"] != null && result["current:2"].records.length === 1) {
        let val = result["current:2"].records[0].value
        result["current:2"] = { unitId: "A", record: val}
    }

    return result
}

exports.extractPoints = extractPoints