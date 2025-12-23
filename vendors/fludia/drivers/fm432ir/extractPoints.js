function extractPoints(input) {
  const result = {}

  if (input.message.meter_type === "Electromechanical (Position A)") {
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
  } else if (input.message.meter_type === "mME (Position B)") {
    if (input.message != null && input.message.indexes != null && Array.isArray(input.message.indexes)) {
      const first = input.message.indexes[0];
      if (Array.isArray(first) && first.length > 0 && Array.isArray(first[0])) {
        // DOUBLE array (E-POS et E-NEG)
        input.message.increments[0].forEach((item) => {
          if (!result["energy:0"]) {
            result["energy:0"] = {unitId: "Wh", records: [], nature: "Energy consumed for each time period (OBIS code 1.8.0)"}
          }
          result["energy:0"].records.push({
            eventTime: item[0],
            value: item[1]
          })
        })
        input.message.indexes[0].forEach((item) => {
          if (!result["energy:1"]) {
            result["energy:1"] = {unitId: "Wh", records: [], nature: "Energy consumed (OBIS code 1.8.0)"}
          }
          result["energy:1"].records.push({
            eventTime: item[0],
            value: item[1]
          })
        })
        input.message.increments[1].forEach((item) => {
          if (!result["energy:2"]) {
            result["energy:2"] = {unitId: "Wh", records: [], nature: "Energy consumed for each time period (OBIS code 2.8.0)"}
          }
          result["energy:2"].records.push({
            eventTime: item[0],
            value: item[1]
          })
        })
        input.message.indexes[1].forEach((item) => {
          if (!result["energy:3"]) {
            result["energy:3"] = {unitId: "Wh", records: [], nature: "Energy consumed (OBIS code 2.8.0)"}
          }
          result["energy:3"].records.push({
            eventTime: item[0],
            value: item[1]
          })
        })
        input.message.powers[0].forEach((item) => {
          if (!result["activePower:0"]) {
            result["activePower:0"] = {unitId: "W", records: [], nature: "Active power (OBIS code 1.8.0)"}
          }
          result["activePower:0"].records.push({
            eventTime: item[0],
            value: item[1]
          })
        })
        input.message.powers[1].forEach((item) => {
          if (!result["activePower:1"]) {
            result["activePower:1"] = {unitId: "W", records: [], nature: "Active power (OBIS code 2.8.0)"}
          }
          result["activePower:1"].records.push({
            eventTime: item[0],
            value: item[1]
          })
        })
      } else {
        // SIMPLE array
        input.message.increments.forEach((item) => {
          if (!result["energy:0"]) {
            result["energy:0"] = {unitId: "Wh", records: [], nature:"Energy consumed for each time period ("+input.message.obis+")"}
          }
          result["energy:0"].records.push({
            eventTime: item[0],
            value: item[1]
          })
        })
        input.message.indexes.forEach((item) => {
          if (!result["energy:1"]) {
            result["energy:1"] = {unitId: "Wh", records: [], nature:"Energy consumed ("+input.message.obis+")"}
          }
          result["energy:1"].records.push({
            eventTime: item[0],
            value: item[1]
          })
        })
        input.message.powers.forEach((item) => {
          if (!result["activePower:0"]) {
            result["activePower:0"] = {unitId: "W", records: [], nature:"Active power ("+input.message.obis+")"}
          }
          result["activePower:0"].records.push({
            eventTime: item[0],
            value: item[1]
          })
        })
      }
    }
    if(result["energy:0"] != null && result["energy:0"].records.length === 1) {
      let val = result["energy:0"].records[0].value
      result["energy:0"] = { unitId: "Wh", record: val, nature: result["energy:0"].records[0].nature }
    }
    if(result["energy:1"] != null && result["energy:1"].records.length === 1) {
      let val = result["energy:1"].records[0].value
      result["energy:1"] = { unitId: "Wh", record: val, nature: result["energy:1"].records[0].nature }
    }
    if(result["energy:2"] != null && result["energy:2"].records.length === 1) {
      let val = result["energy:2"].records[0].value
      result["energy:2"] = { unitId: "Wh", record: val, nature: result["energy:2"].records[0].nature }
    }
    if(result["energy:3"] != null && result["energy:3"].records.length === 1) {
      let val = result["energy:3"].records[0].value
      result["energy:3"] = { unitId: "Wh", record: val, nature: result["energy:3"].records[0].nature }
    }
    if(result["activePower:0"] != null && result["activePower:0"].records.length === 1) {
      let val = result["activePower:0"].records[0].value
      result["activePower:0"] = { unitId: "W", record: val, nature: result["activePower:0"].records[0].nature }
    }
    if(result["activePower:1"] != null && result["activePower:1"].records.length === 1) {
      let val = result["activePower:1"].records[0].value
      result["activePower:1"] = { unitId: "W", record: val, nature: result["activePower:1"].records[0].nature }
    }
  }


  return result
}

exports.extractPoints = extractPoints
