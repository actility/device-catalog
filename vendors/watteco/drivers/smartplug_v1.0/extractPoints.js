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
                            result.reactiveEnergy = { unitId: "VArh", records: [] }
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
                            result.reactivePower = { unitId: "VAr", records: [] }
                        }
                        result.reactivePower.records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "frequency":
                        if (!result["frequency:0"]) {
                            result["frequency:0"] = { unitId: "hertz", records: [], nature: "current frequency" }
                        }
                        result["frequency:0"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value/1000
                        })
                        break

                    case "frequency_min":
                        if (!result["frequency:1"]) {
                            result["frequency:1"] = { unitId: "hertz", records: [], nature: "frequency min" }
                        }
                        result["frequency:1"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value/1000
                        })
                        break

                    case "frequency_max":
                        if (!result["frequency:2"]) {
                            result["frequency:2"] = { unitId: "hertz", records: [], nature: "frequency max" }
                        }
                        result["frequency:2"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value/1000
                        })
                        break

                    case "Vrms":
                        if (!result["rmsVoltage:0"]) {
                            result["rmsVoltage:0"] = { unitId: "V", records: [], nature: "Current Vrms" }
                        }
                        result["rmsVoltage:0"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value/10
                        })
                        break

                    case "Vrms_min":
                        if (!result["rmsVoltage:1"]) {
                            result["rmsVoltage:1"] = { unitId: "V", records: [], nature: "Vrms min" }
                        }
                        result["rmsVoltage:1"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value/10
                        })
                        break

                    case "Vrms_max":
                        if (!result["rmsVoltage:2"]) {
                            result["rmsVoltage:2"] = { unitId: "V", records: [], nature: "Vrms max" }
                        }
                        result["rmsVoltage:2"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value/10
                        })
                        break

                    case "Vpeak":
                        if (!result["voltage:0"]) {
                            result["voltage:0"] = { unitId: "V", records: [], nature: "Current volt peak" }
                        }
                        result["voltage:0"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "Vpeak_min":
                        if (!result["voltage:1"]) {
                            result["voltage:1"] = { unitId: "V", records: [], nature: "volt min" }
                        }
                        result["voltage:1"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value
                        })
                        break

                    case "Vpeak_max":
                        if (!result["voltage:2"]) {
                            result["voltage:2"] = { unitId: "V", records: [], nature: "volt max" }
                        }
                        result["voltage:2"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value/10
                        })
                        break

                    case "over_voltage":
                        if (!result["counter:0"]) {
                            result["counter:0"] = { unitId: "count", records: [], nature:"Over voltage Threshold count"}
                        }
                        result["counter:0"].records.push({
                            eventTime: new Date(item.date).toISOString(),
                            value: item.value/10
                        })
                        break


                    case "sag_voltage":
                        if (!result["counter:1"]) {
                            result["counter:1"] = { unitId: "count", records: [], nature:"Sag voltage Threshold count"}
                        }
                        result["counter:1"].records.push({
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

    if(result.powerRate != null && result.powerRate.records.length === 1) {
        let val = result.powerRate.records[0].value
        result.powerRate = { unitId: "W/h", record: val }
    }

    if(result.reactiveEnergy != null && result.reactiveEnergy.records.length === 1) {
        let val = result.reactiveEnergy.records[0].value
        result.reactiveEnergy = { unitId: "VArh", record: val }
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
        result.reactivePower = { unitId: "VAr", record: val }
    }

    if(result["frequency:0"] != null && result["frequency:0"].records.length === 1) {
        let val = result["frequency:0"].records[0].value
        result["frequency:0"] = { unitId: "hertz", record: val, nature: "current frequency" }
    }

    if(result["frequency:1"] != null && result["frequency:1"].records.length === 1) {
        let val = result["frequency:1"].records[0].value
        result["frequency:1"] = { unitId: "hertz", record: val, nature: "frequency min" }
    }

    if(result["frequency:2"] != null && result["frequency:2"].records.length === 1) {
        let val = result["frequency:2"].records[0].value
        result["frequency:2"] = { unitId: "hertz", record: val, nature: "frequency max" }
    }

    if(result["rmsVoltage:0"] != null && result["rmsVoltage:0"].records.length === 1) {
        let val = result["rmsVoltage:0"].records[0].value
        result["rmsVoltage:0"] = { unitId: "V", record: val, nature: "current Vrms" }
    }

    if(result["rmsVoltage:1"] != null && result["rmsVoltage:1"].records.length === 1) {
        let val = result["rmsVoltage:1"].records[0].value
        result["rmsVoltage:1"] = { unitId: "V", record: val, nature: "Vrms min" }
    }

    if(result["rmsVoltage:2"] != null && result["rmsVoltage:2"].records.length === 1) {
        let val = result["rmsVoltage:2"].records[0].value
        result["rmsVoltage:2"] = { unitId: "V", record: val, nature: "Vrms max" }
    }

    if(result["counter:0"] != null && result["counter:0"].records.length === 1) {
        let val = result["counter:0"].records[0].value
        result["counter:0"] = { unitId: "count", record: val, nature:"Over voltage Threshold count" }
    }

    if(result["counter:1"] != null && result["counter:1"].records.length === 1) {
        let val = result["counter:1"].records[0].value
        result["counter:1"] = { unitId: "count", record: val, nature:"Sag voltage Threshold count" }
    }

    if(result["voltage:0"] != null && result["voltage:0"].records.length === 1) {
        let val = result["voltage:0"].records[0].value
        result["voltage:0"] = { unitId: "V", record: val, nature:"current volt peak" }
    }

    if(result["voltage:1"] != null && result["voltage:1"].records.length === 1) {
        let val = result["voltage:1"].records[0].value
        result["voltage:1"] = { unitId: "V", record: val, nature:"volt min" }
    }

    if(result["voltage:2"] != null && result["voltage:2"].records.length === 1) {
        let val = result["voltage:2"].records[0].value
        result["voltage:2"] = { unitId: "V", record: val, nature:"volt max" }
    }


    return result
}

exports.extractPoints = extractPoints