function extractPoints(input) {
  const result = {}

  if (input.message != null && input.message.increments != null && Array.isArray(input.message.increments)) {
    input.message.increments.forEach((item) => {
      if (!result["volume:0"]) {
        result["volume:0"] = {unitId: "m3", records: [], nature:"Volume consumed for each time period (to be multiplied by a factor depending on the selected digit)"}
      }
      result["volume:0"].records.push({
        eventTime: item[0],
        value: item[1]
      })
    })
  }

  if (input.message != null && input.message.indexes != null && Array.isArray(input.message.indexes)) {
    input.message.indexes.forEach((item) => {
      if (!result["volume:1"]) {
        result["volume:1"] = {unitId: "m3", records: [], nature:"Volume consumed since the start of the product (to be multiplied by a factor depending on the selected digit)"}
      }
      result["volume:1"].records.push({
        eventTime: item[0],
        value: item[1]
      })
    })
  }

  if(result["volume:0"] != null && result["volume:0"].records.length === 1) {
    let val = result["volume:0"].records[0].value
    result["volume:0"] = { unitId: "m3", record: val, nature:"Volume consumed for each time period (to be multiplied by a factor depending on the selected digit)" }
  }
  if(result["volume:1"] != null && result["volume:1"].records.length === 1) {
    let val = result["volume:1"].records[0].value
    result["volume:1"] = { unitId: "m3", record: val, nature:"Volume consumed since the start of the product (to be multiplied by a factor depending on the selected digit)" }
  }

  return result
}

exports.extractPoints = extractPoints
