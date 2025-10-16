/* let requestClass = require("../../downlink/requests/request");
//response type is the same as request type
const responseType = requestClass.RequestType; */

let util = require("../../../util");
let jsonParameters = require("../../../resources/parameters.json");
let accelerometer = require("../notifications/accelerometer")

const ResponseType = Object.freeze({
    GENERIC_CONFIGURATION_SET: "GENERIC_CONFIGURATION_SET",
    PARAM_CLASS_CONFIGURATION_SET: "PARAM_CLASS_CONFIGURATION_SET",
    GENERIC_CONFIGURATION_GET: "GENERIC_CONFIGURATION_GET",
    PARAM_CLASS_CONFIGURATION_GET: "PARAM_CLASS_CONFIGURATION_GET",
    BLE_STATUS_CONNECTIVITY: "BLE_STATUS_CONNECTIVITY",
    CRC_CONFIGURATION_REQUEST : "CRC_CONFIGURATION_REQUEST",
    SENSOR_REQUEST: "SENSOR_REQUEST"
   
})
const StatusType = Object.freeze({
   SUCCESS: "SUCCESS",
   NOT_FOUND: "NOT_FOUND",
   BELOW_LOWER_BOUND: "BELOW_LOWER_BOUND",
   ABOVE_HIGHER_BOUND: "ABOVE_HIGHER_BOUND",
   BAD_VALUE: "BAD_VALUE",
   TYPE_MISMATCH: "TYPE_MISMATCH",
   OPERATION_ERROR : "OPERATION_ERROR",
   READ_ONLY: "READ_ONLY"
})

const GroupType = Object.freeze({
    INTERNAL: "INTERNAL",
    SYSTEM_CORE: "SYSTEM_CORE",
    GEOLOC: "GEOLOC",
    GNSS: "GNSS",
    LR11xx: "LR11xx",
    BLE_SCAN1: "BLE_SCAN1",
    BLE_SCAN2: "BLE_SCAN2",
    ACCELEROMETER : "ACCELEROMETER",
    NETWORK: "NETWORK",
    LORAWAN: "LORAWAN",
    CELLULAR: "CELLULAR",
    BLE : "BLE",
    TELEMETRY: "TELEMETRY"
 })
const ParameterType = Object.freeze({
    DEPREACTED: "DEPREACTED",
    INTEGER: "INTEGER",
    FLOATING_POINT: "FLOATING_POINT",
    ASCCII_STRING: "ASCCII_STRING",
    BYTE_ARRAY: "BYTE_ARRAY"
})
function Response(responseType,
    genericConfigurationSet,
    parameterClassConfigurationSet,
    genericConfigurationGet,
    parameterClassConfigurationGet,
    bleStatusConnectivity,
    configurationCrcRequest,
    sensorRequest,
    globalCrc,
    localCrc
    ){
        this.responseType = responseType;
        this.genericConfigurationSet = genericConfigurationSet;
        this.parameterClassConfigurationSet = parameterClassConfigurationSet;
        this.genericConfigurationGet = genericConfigurationGet;
        this.parameterClassConfigurationGet = parameterClassConfigurationGet;
        this.bleStatusConnectivity= bleStatusConnectivity;
        this.configurationCrcRequest = configurationCrcRequest;
        this.sensorRequest = sensorRequest;
        this.globalCrc = globalCrc;
        this.localCrc = localCrc;
}
function ParameterClassConfigurationSet(group, parameters){
    this.group = group
    this.parameters = parameters
}

function determineResponse(payload, multiFrame){
    let response = new Response();
    let startingByte = 4;
    if (multiFrame){
        startingByte = 5;
    }
    let typeValue  = payload[startingByte] & 0x1F;
    switch (typeValue){
        case 0:
            response.responseType = ResponseType.GENERIC_CONFIGURATION_SET
            response.globalCrc =  decodeCrc(payload, startingByte+1,4)
            response.genericConfigurationSet = determineResponseGenericConfigurationSet(payload.slice(startingByte+5))
            break;
        case 1:
            response.responseType = ResponseType.PARAM_CLASS_CONFIGURATION_SET
            response.localCrc =  decodeCrc(payload, startingByte+2,3)
            response.parameterClassConfigurationSet = determineResponseParameterClassConfigurationSet(payload.slice(startingByte+1))
            break;
        case 2:
            response.responseType = ResponseType.GENERIC_CONFIGURATION_GET
            response.genericConfigurationGet = determineResponseGenericConfigurationGet(payload.slice(startingByte+1))
            break;
        case 3:
            response.responseType = ResponseType.PARAM_CLASS_CONFIGURATION_GET
            response.parameterClassConfigurationGet = determineResponseParameterClassConfigurationGet(payload.slice(startingByte+1))
            break;
        case 4:
            response.responseType = ResponseType.BLE_STATUS_CONNECTIVITY
            response.bleStatusConnectivity = decodeBLEStatus(payload.slice(startingByte+1))
            break;
        case 5:
            response.responseType = ResponseType.CRC_CONFIGURATION_REQUEST
            response.crc = decodeBitmapAndCRC(payload.slice(startingByte+1,startingByte+3),payload.slice(startingByte+3))
            break;
        case 6:
            response.responseType = ResponseType.SENSOR_REQUEST
            response.sensors = decodeSensorResponse(payload.slice(startingByte+1))
            break;
        default:
            throw new Error("Response Type Unknown");
    }
    return response

}
function decodeSensorResponse(data) {
    let offset = 0;
    const sensors = [];

    while (offset < data.length) {
        // Read the sensor ID (1 byte)
        const sensorId = data[offset];
        offset += 1;

        // Determine the sensor type and decode its value
        switch (sensorId) {
            case 1: // Accelerometer
                if (offset + 6 > data.length) {
                    throw new Error("Incomplete accelerometer data");
                }
                // Pass the correct offsets for X, Y, Z values
                const accelerationVector = accelerometer.determineAccelerationVector(
                    data.slice(offset - 1, offset + 6), // Payload slice
                    1, // X starts at byte 1 (relative to the slice)
                    3, // Y starts at byte 3 (relative to the slice)
                    5  // Z starts at byte 5 (relative to the slice)
                );
                sensors.push({
                    sensorId,
                    type: "ACCELEROMETER",
                    accelerationVector: [
                        accelerationVector[0],
                        accelerationVector[1],
                        accelerationVector[2]
                    ]
                });
                offset += 6; // Move offset by 6 bytes (X, Y, Z values)
                break;

            // Add cases for other sensor types here
            // Example:
            // case 2: // Another sensor type
            //     ...

            case 0: // Do not use
                break;

            default:
                throw new Error(`Unknown sensor ID: ${sensorId}`);
        }
    }

    return sensors;
}

function decodeBitmapAndCRC(bitmap, crcBytes) {
    // Helper function to decode group type
    function decodeGroupType(groupIdentifier) {
        switch (groupIdentifier) {
            case 0: return "INTERNAL";
            case 1: return "SYSTEM_CORE";
            case 2: return "GEOLOC";
            case 3: return "GNSS";
            case 4: return "LR11xx";
            case 5: return "BLE_SCAN1";
            case 6: return "BLE_SCAN2";
            case 7: return "ACCELEROMETER";
            case 8: return "NETWORK";
            case 9: return "LORAWAN";
            case 10: return "CELLULAR";
            case 11: return "BLE";
            case 12: return "TELEMETRY";
            default: throw new Error("Unknown group identifier");
        }
    }
    // Check if the bitmap is null or [0, 0]
    const isGlobalCRC = (Array.isArray(bitmap) && bitmap.length === 2 && bitmap[0] === 0 && bitmap[1] === 0);
    if (isGlobalCRC) {
        // Global CRC case (4 bytes)
        if (crcBytes.length !== 4) {
            throw new Error("Invalid global CRC length. Expected 4 bytes.");
        }
        const crcHex = Buffer.from(crcBytes).toString('hex').toUpperCase();
        return [`Global CRC: 0x${crcHex}`];
    } else {
        // Group CRC case (bitmap is not null)
        // Extract requested groups from the bitmap
        const requestedGroups = [];
           // Convert 2-byte array into an integer
        bitmap = (bitmap[0] << 8) | bitmap[1];
        for (let i = 0; i < 32; i++) { // Assuming up to 32 groups
            if (bitmap & (1 << i)) {
                requestedGroups.push(i);
            }
        }
        // Check if the number of CRCs matches the number of requested groups
        if (crcBytes.length !== requestedGroups.length * 3) {
            throw new Error("CRC bytes length does not match the number of requested groups.");
        }

        // Map CRCs to groups
        const result = [];
        for (let i = 0; i < requestedGroups.length; i++) {
            const groupIdentifier = requestedGroups[i];
            const groupName = decodeGroupType(groupIdentifier);
            const crcStartIndex = i * 3;
            const crcHex = Buffer.from(crcBytes.slice(crcStartIndex, crcStartIndex + 3)).toString('hex').toUpperCase();
            result.push(`${groupName}: 0x${crcHex}`);
        }

        return result;
    }
}

function decodeBLEStatus(bleStatusConnectivity) {
    switch (bleStatusConnectivity) {
        case 0:
            return "IDLE";
        case 1:
            return "ADVERTISING";
        case 2:
            return "CONNECTED";
        case 3:
            return "BONDED";
        default:
            return "UNKNOWN";
    }
}
function decodeCrc(payload, startingByte, byteNumber) {
    // Ensure the payload has enough bytes for the CRC
    if (payload.length < startingByte + byteNumber) {
        throw new Error("Payload is too short to contain a valid CRC.");
    }

    // Extract the n bytes of the CRC (big-endian)
    const crcBytes = payload.slice(startingByte, startingByte + byteNumber);
    // Convert each byte to a 2-digit hexadecimal string and concatenate
    const crc = crcBytes.map(b => b.toString(16).padStart(2, "0")).join("");
    return crc;
}

function determineResponseGenericConfigurationSet(payload){

    let i = 0;
    const step = 3;
    let response = []
    while (payload.length >= step * (i + 1)) {
        let groupId = payload[i*step]
        let localId = payload[1+i*step]
        let parameter = getParameterByGroupIdAndLocalId(parametersByGroupIdAndLocalId, groupId, localId)
        let status = determineStatusType(payload[2+i*step])
        let group = determineGroupType(groupId)
        // Find the group in the response object or create a new one if it doesn't exist
        let groupObject = response.find(g => g.group === group);
        if (!groupObject) {
            groupObject = { group: group, parameters: [] };
            response.push(groupObject);
        }

        // Add the parameter to the group's parameters array
        groupObject.parameters.push({
            parameterName: parameter.driverParameterName,
            status: status
        });

    i++;
    }
    return response
}
function determineResponseGenericConfigurationGet(payload){
    let i = 0;
    let response = []
    while (payload.length > i) {
        let groupId = payload[i]
        let localId = payload[1+i]
        let size = payload[2+i]>>3 & 0x1F;
        let dataType = payload[2+i] & 0x07;
        let parameter = getParameterByGroupIdAndLocalId(parametersByGroupIdAndLocalId, groupId, localId)
        switch(dataType){
            case 0: 
                determineDeprecatedResponse(response, parameter,groupId)
                break;
            case 1:
                determineConfiguration(response, parameter,  parseInt(util.convertBytesToString(payload.slice(3+i,3+i+size)),16), groupId, size)
                break;
            case 2:
                //TO BE COMPLTED
                break;
            case 3:
                determineConfiguration(response, parameter,  payload.slice(3+i,3+i+size), groupId, size)
                break;
            case 4:
                determineConfiguration(response, parameter,  payload.slice(3+i,3+i+size), groupId, size)
                break; 
            case 5:
                determineErrorResponse(response, parameter,groupId)
                break;
        }
        i = i + size + 3 
    }
    return response
}
function determineErrorResponse(response, parameter, groupId) {
    let group = determineGroupType(groupId)
    let paramName = parameter.driverParameterName
    // Find the group in the response object or create a new one if it doesn't exist
    let groupObject = response.find(g => g.group === group);
    if (!groupObject) {
        groupObject = { group: group, parameters: [] };
        response.push(groupObject);
    }

    // Add the parameter to the group's parameters array
    groupObject.parameters.push({
        parameterName: paramName,
        parameterValue: "ERROR"
    });
}
function determineDeprecatedResponse(response, parameter, groupId) {
    let group = determineGroupType(groupId)
    let paramName = parameter.driverParameterName
    // Find the group in the response object or create a new one if it doesn't exist
    let groupObject = response.find(g => g.group === group);
    if (!groupObject) {
        groupObject = { group: group, parameters: [] };
        response.push(groupObject);
    }

    // Add the parameter to the group's parameters array
    groupObject.parameters.push({
        parameterName: paramName,
        parameterValue: "DEPRECATED"
    });
}
function determineConfiguration(response, parameter, paramValue, groupId, parameterSize){
    let group = determineGroupType(groupId)
    let groupObject
    let paramName = parameter.driverParameterName
    let paramType = parameter.parameterType.type
    switch (paramType)
    {
    // it can be integer or float
    case "ParameterTypeNumber":{
        let range = parameter.parameterType.range
        let multiply = parameter.parameterType.multiply
        let additionalValues = parameter.parameterType.additionalValues
        let additionalRanges = parameter.parameterType.additionalRanges
        // check negative number
        if ((range.minimum < 0 ) || util.hasNegativeNumber(additionalValues) || util.hasNegativeNumber(additionalRanges)){
            if (paramValue > 0x7FFFFFFF) {
             paramValue -= 0x100000000;
         }
        }
        if (util.checkParamValueRange(paramValue, range.minimum, range.maximum, range.exclusiveMinimum, range.exclusiveMaximum, additionalValues, additionalRanges)){
            if (multiply != undefined){
                paramValue = paramValue * multiply
            }
             
        }
        else {
            throw new Error(paramName+ " parameter value is out of range");
        }
        
        // Find the group in the response object or create a new one if it doesn't exist
        groupObject = response.find(g => g.group === group);
        if (!groupObject) {
            groupObject = { group: group, parameters: [] };
            response.push(groupObject);
        }

        // Add the parameter to the group's parameters array
        groupObject.parameters.push({
            parameterName: paramName,
            parameterValue: paramValue
        });}
        break;
    // A mapping between the firmware values and the possible string values
    case "ParameterTypeString":
        if ((parameter.parameterType.firmwareValues).indexOf(paramValue) != -1){
            // Find the group in the response object or create a new one if it doesn't exist
            groupObject = response.find(g => g.group === group);
            if (!groupObject) {
                groupObject = { group: group, parameters: [] };
                response.push(groupObject);
            }

            // Add the parameter to the group's parameters array
            groupObject.parameters.push({
                parameterName: paramName,
                parameterValue: parameter.parameterType.possibleValues[((parameter.parameterType.firmwareValues).indexOf(paramValue))]
            });
     }
        else {
            throw new Error(paramName+ " parameter value is unknown");
        }
        
        break;
    case "ParameterTypeBitMask":{
        let properties = parameter.parameterType.properties
        let bitMask = parameter.parameterType.bitMask
        let length = parseInt(1,16)
        let parameterValue ={}
        for (let property  of properties) {
            let propertyName = property.name
            let propertyType = property.type
            let bit = bitMask.find(el => el.valueFor === propertyName)
            switch (propertyType)
            {
                case "PropertyBoolean":
                    if ((bit.length)!= undefined ) {
                        length = util.lengthToHex(bit.length)
                    }
                    var b =  Boolean((paramValue >>bit.bitShift & length ))
                    if ((bit.inverted != undefined) && (bit.inverted)){
                        b =!b;
                    }
                    parameterValue[property.name] = b
                    break;
                case "PropertyString":{
                    if ((bit.length)!= undefined ) {
                        length = util.lengthToHex(bit.length)
                    }
                    let value = (paramValue >>bit.bitShift & length)
                        let possibleValues = property.possibleValues
                    if (property.firmwareValues.indexOf(value) != -1){
                        parameterValue[property.name] = possibleValues[(property.firmwareValues.indexOf(value))]
                    }
                    else {
                        throw new Error(property.name+ " parameter value is not among possible values");
                    }       
                }break;
                case "PropertyNumber":
                    if ((bit.length)!= undefined ) {
                        length = util.lengthToHex(bit.length)
                    }
                    parameterValue[property.name] = paramValue >>bit.bitShift & length ;	

                    break;
                case "PropertyObject":{
                    let bitValue ={}
                    for (let value of bit.values)
                        {
                        if (value.type == "BitMaskValue")
                            {	
                                let length = parseInt(1,16)
                                if ((value.length)!= undefined ) {length = (util.lengthToHex(value.length))}
                                var b = Boolean(paramValue >>value.bitShift & length)
                                if ((value.inverted != undefined) && (value.inverted)){
                                    b =!b;
                                }
                                bitValue[value.valueFor] = b
                            }
                        }
                    parameterValue[property.name] = bitValue
                }break;
                default:
                    throw new Error("Property type is unknown");
                    
                }
            }
 
           // Find the group in the response object or create a new one if it doesn't exist
        groupObject = response.find(g => g.group === group);
        if (!groupObject) {
            groupObject = { group: group, parameters: [] };
            response.push(groupObject);
        }

        // Add the parameter to the group's parameters array
        groupObject.parameters.push({
            parameterName: paramName,
            parameterValue: parameterValue
        });}
        break;
    case "ParameterTypeByteArray":{
        if (parameter.parameterType.size != undefined && parameter.parameterType.size != parameterSize) {
            throw new Error("The value of "+ paramName + " must have "+ parameter.parameterType.size.toString() +" bytes in the array");
        }
        var bytesValue
        if  (parameter.parameterType.properties == undefined){
            // Convert the array values to hexadecimal and store them in a string format
            bytesValue = '{' + paramValue.map(value => {
            // Convert each value to hexadecimal and ensure it has two digits
            return value.toString(16).padStart(2, '0');
            }).join(',') + '}';

        }else{
            let arrayProperties = parameter.parameterType.properties;
            let byteMap = parameter.parameterType.byteMask;
           
            let arrayLength = parseInt(1, 16);
            
            bytesValue = [];
            for (let i = 0; i < parameterSize; i++) {
                let currentParamValue = paramValue[i];
                if (parameter.parameterType.distinctValues !== undefined && parameter.parameterType.distinctValues === true) {
                    // Handling distinct values of byte array
                    let property = arrayProperties[i];
                    let propertyName = property.name;
                    let propertyValues = {}; // Store values for the current property
                    let bitMapping = byteMap.find(el => el.valueFor === propertyName);
                    if (!bitMapping) continue; // Skip if no bit mapping exists for this property
                    for (let subProperty of property.properties) {
                        let subPropertyName = subProperty.name;
                        let subPropertyType = subProperty.type;
                        let bitValueMapping = bitMapping.values.find(val => val.valueFor === subPropertyName);
                        if (!bitValueMapping) continue; // Skip if no bit mapping exists for this sub-property
                        let bitShift = bitValueMapping.bitShift;
                        let lengthMask = (1 << bitValueMapping.length) - 1;
                        let extractedValue = (currentParamValue >> bitShift) & lengthMask;
                        switch (subPropertyType) {
                            case "PropertyBoolean":{
                                let booleanValue = Boolean(extractedValue);
                                if (bitValueMapping.inverted) booleanValue = !booleanValue;
                                propertyValues[subPropertyName] = booleanValue;
                            }break;
                            case "PropertyString":{
                                let strIndex = subProperty.firmwareValues.indexOf(extractedValue);
                                if (strIndex !== -1) {
                                    propertyValues[subPropertyName] = subProperty.possibleValues[strIndex];
                                } else {
                                    throw new Error(`${subPropertyName} value not among possible values`);
                                }
                            }break;
                            case "PropertyNumber":
                                propertyValues[subPropertyName] = extractedValue;
                                break;
                            default:
                                throw new Error("Unknown sub-property type");
                        }
                    }
                    bytesValue.push({ [propertyName]: propertyValues });

                } else {
                    // Handling non-distinct values of byte array
                    let arrayParameterValue = {};
                    for (let py of arrayProperties) {
                        let propertyName = py.name;
                        let propertyType = py.type;
                        let bit = byteMap.find(el => el.valueFor === propertyName);
                        if (!bit) continue; // Skip if no bit mapping exists for this property
                        if (bit.length !== undefined) {
                            arrayLength = util.lengthToHex(bit.length);
                        }
                        switch (propertyType) {
                            case "PropertyBoolean":
                                let booleanValue = Boolean((currentParamValue >> bit.bitShift) & arrayLength);
                                if (bit.inverted) booleanValue = !booleanValue;
                                arrayParameterValue[propertyName] = booleanValue;
                                break;
                            case "PropertyString":{
                                let stringValue = (currentParamValue >> bit.bitShift) & arrayLength;
                                let possibleValues = py.possibleValues;
                                if (py.firmwareValues.indexOf(stringValue) !== -1) {
                                    arrayParameterValue[propertyName] = possibleValues[py.firmwareValues.indexOf(stringValue)];
                                } else {
                                    throw new Error(`${propertyName} value not among possible values`);
                                }
                            }break;
                            case "PropertyNumber":
                                arrayParameterValue[propertyName] = (currentParamValue >> bit.bitShift) & arrayLength;
                                break;
                            case "PropertyObject":{
                                let bitValue = {};
                                for (let value of bit.values) {
                                    if (value.type === "BitMapValue") {
                                        let subArrayLength = parseInt(1, 16);
                                        if (value.length !== undefined) {
                                            subArrayLength = util.lengthToHex(value.length);
                                        }
                                        let subBooleanValue = Boolean((currentParamValue >> value.bitShift) & subArrayLength);
                                        if (value.inverted) subBooleanValue = !subBooleanValue;
                                        bitValue[value.valueFor] = subBooleanValue;
                                    }
                                }
                                arrayParameterValue[propertyName] = bitValue;
                            }break;
                            case "PropertByteArray":{
                                let byteMask = py.bitMask;
                                if (py.size && py.size > 0) {
                                    let  currentParamArrayValue = [];
                                    for (let j = 0; j < py.size; j++) {
                                        if (i + j >= paramValue.length) {
                                            throw new Error("Parameter size exceeds available data");
                                        }
                                        currentParamArrayValue.push(paramValue[i + j]);
                                    }
                                
                                let decodedValues = {};
                                decodedValues = handleArrayProperties(py.properties,byteMask, currentParamArrayValue)
                                arrayParameterValue[propertyName] = decodedValues;
                                i += py.size - 1;
                                } else {
                                    throw new Error(`Invalid size for PropertyByteArray in property ${propertyName}`);
                                }
                            }break;
                            default:
                                throw new Error("Unknown property type");
                        }
                    }
                    bytesValue.push(arrayParameterValue);
                }
            }
        }
        // Find the group in the response object or create a new one if it doesn't exist
    groupObject = response.find(g => g.group === group);
    if (!groupObject) {
        groupObject = { group: group, parameters: [] };
        response.push(groupObject);
    }

    // Add the parameter to the group's parameters array
    groupObject.parameters.push({
        parameterName: paramName,
        parameterValue: bytesValue
    });}break;
    case "ParameterTypeAsciiString":
        var paramAsciiString = "";
    
	    for (var i = 0; i < paramValue.length; i ++)
            paramAsciiString += String.fromCharCode(paramValue[i]);
    
        // Find the group in the response object or create a new one if it doesn't exist
    groupObject = response.find(g => g.group === group);
    if (!groupObject) {
        groupObject = { group: group, parameters: [] };
        response.push(groupObject);
    }

    // Add the parameter to the group's parameters array
    groupObject.parameters.push({
        parameterName: paramName,
        parameterValue: paramAsciiString
    });
    break;
    default:
     throw new Error("Parameter type is unknown");
    }
}
function handleArrayProperties(properties, bitMask, paramValueArray) {
    let parameterValue = {};
    for (let property of properties) {
      let propertyName = property.name;
      let propertyType = property.type;
      let bit = bitMask.find((el) => el.valueFor === propertyName);
  
      if (!bit) {
        continue;
      }
      const mask = (1 << bit.length) - 1; 
  
      // Extract the value by shifting and masking
      let paramValue = extractSingleByte(paramValueArray, bit.bitShift);
      const value = (paramValue >> bit.bitShift % 8) & mask;
  
      switch (propertyType) {
        case "PropertyBoolean":
          let booleanValue = Boolean(value);
          if (bit.inverted) booleanValue = !booleanValue;
          parameterValue[propertyName] = booleanValue;
          break;
  
        case "PropertyString":{
          const possibleValues = property.possibleValues || [];
          const firmwareValues = property.firmwareValues || [];
          const index = firmwareValues.indexOf(value);
          if (index !== -1) {
            parameterValue[propertyName] = possibleValues[index];
          } else {
            throw new Error(
              `${propertyName} value (${value}) is not among possible values`,
            );
          }
        }break;
  
        case "PropertyNumber":
          parameterValue[propertyName] = value; // Directly assign the extracted value
          break;
  
        default:
            throw new Error(
                `Unsupported property type: ${propertyType}`);
      }
    }
    return parameterValue;
  }
  
  function extractSingleByte(paramValueArray, bitLength) {
    let byteIndex = 0;
  
    // Si la longueur des bits est plus grande que 8, il faut extraire le ou les octets nécessaires
    if (bitLength >= 8) {
      // Calculer l'index de l'octet à extraire
      byteIndex = Math.floor(bitLength / 8); // Chaque octet fait 8 bits, donc on choisit l'indice en fonction de la longueur des bits
    }
  
    // Extraire l'octet spécifique
    return paramValueArray[byteIndex];
  } 
function determineResponseParameterClassConfigurationGet(payload){
    let groupId = payload[0]
    let i = 1;
    let response = []
    while (payload.length > i) {
        let localId = payload[i]
        let size = payload[1+i]>>3 & 0x1F;
        let dataType = payload[1+i] & 0x07;
        let parameter = getParameterByGroupIdAndLocalId(parametersByGroupIdAndLocalId, groupId, localId)
        switch(dataType){
            case 0: 
                determineDeprecatedResponse(response, parameter,groupId)
                break;
            case 1:
                determineConfiguration(response, parameter,  parseInt(util.convertBytesToString(payload.slice(2+i,2+i+size)),16), groupId)
                break;
            case 2:
                //TO be complted
                break;
            case 3:
                determineConfiguration(response, parameter,  payload.slice(2+i,2+i+size), groupId, size)
                break; 
            case 4:
                determineConfiguration(response, parameter,  payload.slice(2+i,2+i+size), groupId, size)
                break; 
            case 5:
                determineErrorResponse(response, parameter,groupId)
                break;

        }
        i = i + size + 2
        }
        return response
}
function determineResponseParameterClassConfigurationSet(payload){
    let groupId = payload[0]
    payload = payload.slice(4)
    let i = 0;
    const step = 2;
    let parameters = [];
    while (payload.length >= step * (i + 1)) {
        let parameter = getParameterByGroupIdAndLocalId(parametersByGroupIdAndLocalId, groupId, payload[i*step])
        parameters.push({
            parameterName : parameter.driverParameterName,
            status: determineStatusType(payload[1+i*step])
        })
        i++;
    }
    return new ParameterClassConfigurationSet(determineGroupType(groupId), parameters)
}

function determineStatusType(value){
    switch(value){
        case 0 :
            return StatusType.SUCCESS
        case 1:
            return StatusType.NOT_FOUND
        case 2:
            return StatusType.BELOW_LOWER_BOUND
        case 3:
            return StatusType.ABOVE_HIGHER_BOUND
        case 4:
            return StatusType.BAD_VALUE
        case 5:
            return StatusType.TYPE_MISMATCH
        case 6:
            return StatusType.OPERATION_ERROR
        default:
          throw new Error("Status Type Unknown");
    }
}

function determineGroupType(value)
{  
    switch(value){
        case 0: 
            return GroupType.INTERNAL
        case 1:
            return GroupType.SYSTEM_CORE
        case 2:
            return GroupType.GEOLOC
        case 3:
            return GroupType.GNSS
        case 4:
            return GroupType.LR11xx
        case 5:
            return GroupType.BLE_SCAN1
        case 6: 
            return GroupType.BLE_SCAN2
        case 7:
            return GroupType.ACCELEROMETER
        case 8:
            return GroupType.NETWORK
        case 9:
            return GroupType.LORAWAN
        case 10: 
            return GroupType.CELLULAR
        case 11:
            return GroupType.BLE
        case 12:
            return GroupType.TELEMETRY
        default:
            throw new Error("Unknown group")
    }
}
// Function to create the nested data structure
function jsonParametersByGroupIdAndLocalId() {
    // Initialize an empty object to store parameters grouped by groupId and localId
    let parametersByGroupIdAndLocalId = {};

    // Iterate over each entry in the JSON parameters array
    jsonParameters.forEach(entry => {
        // Iterate over each firmware parameter within the entry
        entry.firmwareParameters.forEach(parameter => {
            // Convert hexadecimal strings to integers for groupId and localId
            let groupId = parseInt(parameter.groupId, 16);
            let localId = parseInt(parameter.localId, 16);

            // Check if the groupId exists in the parametersByGroupIdAndLocalId object
            if (!parametersByGroupIdAndLocalId[groupId]) {
                // If not, create an empty object for the groupId
                parametersByGroupIdAndLocalId[groupId] = {};
            }

            // Check if the localId exists within the groupId object
            if (!parametersByGroupIdAndLocalId[groupId][localId]) {
                // If not, create an empty object for the localId
                parametersByGroupIdAndLocalId[groupId][localId] = {};
            }

            // Store the parameter object within the groupId and localId
            parametersByGroupIdAndLocalId[groupId][localId] = parameter;
        });
    });

    // Return the nested data structure
    return parametersByGroupIdAndLocalId;
}

// Function to get a parameter by groupId and localId
function getParameterByGroupIdAndLocalId(parameters, groupId, localId) {
    // Check if the parameters object contains the groupId
    // and if the groupId object contains the localId
    if (parameters[groupId] && parameters[groupId][localId]) {
        return parameters[groupId][localId];
    } else {
        return null;
    }
}

//create the nested data structure
const parametersByGroupIdAndLocalId = jsonParametersByGroupIdAndLocalId();

module.exports = {
    Response: Response,
    ResponseType : ResponseType,
    determineResponse: determineResponse,
    determineConfiguration: determineConfiguration,
    parametersByGroupIdAndLocalId: parametersByGroupIdAndLocalId,
    getParameterByGroupIdAndLocalId: getParameterByGroupIdAndLocalId,
    determineGroupType:determineGroupType,
    GroupType: GroupType

}
