function extractPoints(input) {
  const result = {}

  if (input.message != null && input.message.increments != null && Array.isArray(input.message.increments)) {
    input.message.increments.forEach((item) => {
      if (!result["counter:0"]) {
        result["counter:0"] = {unitId: "count", records: [], nature:"Number of pulses detected for each time period"}
      }
      result["counter:0"].records.push({
        eventTime: item[0],
        value: item[1]
      })
    })
  }

  if (input.message != null && input.message.indexes != null && Array.isArray(input.message.indexes)) {
    input.message.indexes.forEach((item) => {
      if (!result["counter:1"]) {
        result["counter:1"] = {unitId: "count", records: [], nature:"Number of pulses detected since the start of the product"}
      }
      result["counter:1"].records.push({
        eventTime: item[0],
        value: item[1]
      })
    })
  }

  if(result["counter:0"] != null && result["counter:0"].records.length === 1) {
    let val = result["counter:0"].records[0].value
    result["counter:0"] = { unitId: "count", record: val, nature:"Number of pulses detected for each time period" }
  }

  if(result["counter:1"] != null && result["counter:1"].records.length === 1) {
    let val = result["counter:1"].records[0].value
    result["counter:1"] = { unitId: "count", record: val, nature:"Number of pulses detected since the start of the product" }
  }

  return result
}

exports.extractPoints = extractPoints
