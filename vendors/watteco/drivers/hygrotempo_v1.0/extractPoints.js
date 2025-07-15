function extractPoints(input) {
    const result = {}
    const data = input.message
    if (input.message != null && Array.isArray(data)) {
        data.forEach((item) => {
            if (item.variable != null) {
                switch (item.variable) {
                    case "Temperature":
                        result.temperature = { unitId: "Cel", record: item.value}
                        break
                    case "RelativeHumidity":
                        result.humidity = { unitId: "%RH", record: item.value}
                        break
                    case "BatteryLevel":
                        result.batteryVoltage = { unitId: "V", record: item.value }
                        break
                    default:
                        break
                }
            }
        })
    }

    return result
}

exports.extractPoints = extractPoints