function extractPoints(input) {
  const result = {}

  if (input.message != null && input.message.increments != null && Array.isArray(input.message.increments)) {
    input.message.increments.forEach((item) => {
      if (!result["energy:0"]) {
        result["energy:0"] = {unitId: "Wh", records: [], nature:"Energy consumed for each time period (to be multiplied by a specific meter factor)"}
      }
      result["energy:0"].records.push({
        eventTime: item[0],
        value: item[1]
      })
    })
  }

  if (input.message != null && input.message.indexes != null && Array.isArray(input.message.indexes)) {
    input.message.indexes.forEach((item) => {
      if (!result["energy:1"]) {
        result["energy:1"] = {unitId: "Wh", records: [], nature:"Energy consumed since the start of the product (to be multiplied by a specific meter factor)"}
      }
      result["energy:1"].records.push({
        eventTime: item[0],
        value: item[1]
      })
    })
  }

  if (input.message != null && input.message.powers != null && Array.isArray(input.message.powers)) {
    input.message.powers.forEach((item) => {
      if (!result.activePower) {
        result.activePower = {unitId: "W", records: [], nature:"Active power for each time period (to be multiplied by a specific meter factor)"}
      }
      result.activePower.records.push({
        eventTime: item[0],
        value: item[1]
      })
    })
  }

  if(result["energy:0"] != null && result["energy:0"].records.length === 1) {
    let val = result["energy:0"].records[0].value
    result["energy:0"] = { unitId: "Wh", record: val, nature:"Energy consumed for each time period (to be multiplied by a specific meter factor)" }
  }
  if(result["energy:1"] != null && result["energy:1"].records.length === 1) {
    let val = result["energy:1"].records[0].value
    result["energy:1"] = { unitId: "Wh", record: val, nature:"Energy consumed since the start of the product (to be multiplied by a specific meter factor)" }
  }
  if(result["activePower"] != null && result["activePower"].records.length === 1) {
    let val = result["activePower"].records[0].value
    result["activePower"] = { unitId: "W", record: val, nature:"Active power for each time period (to be multiplied by a specific meter factor)" }
  }

  return result
}

exports.extractPoints = extractPoints
