let responseClass = require("../../uplink/responses/response");
let util = require("../../../util");

let RequestType = responseClass.ResponseType
const SENSOR_TYPES = {
   "DO_NOT_USE" :0,
    "ACCELEROMETER": 1
};
function Request(requestType,
    genericConfigurationSet,
    parameterClassConfigurationSet,
    genericConfigurationGet,
    parameterClassConfigurationGet,
    bleStatusConnectivity,
    crc,
    sensorIds
    ){
        this.requestType = requestType;
        this.genericConfigurationSet = genericConfigurationSet;
        this.parameterClassConfigurationSet = parameterClassConfigurationSet;
        this.genericConfigurationGet = genericConfigurationGet;
        this.parameterClassConfigurationGet = parameterClassConfigurationGet;
        this.bleStatusConnectivity = bleStatusConnectivity;
        this.crc = crc;
        this.sensorIds = sensorIds;
}
function ParameterClassConfigurationGet(group, parameters){
    this.group = group
    this.parameters = parameters
}
function encodeRequest(data){
    let encData = [] 
    // encode type and ackToken
    encData[0] = (0x02 <<3) | data.ackToken
    let requestType = encodeRequestType(data.requestType)
    encData[1] = requestType
    switch (requestType){
        case 0:
            encData = encodeRequestGenericConfigurationSet(data.setGenericParameters, encData)
            break;
        case 1:
            encData = encodeRequestParameterClassConfigurationSet(data.setParameterClass, encData)
            break;
        case 2:
            encData = encodeRequestGenericConfigurationGet(data.getGenericParameters, encData)
            break;
        case 3:
            encData = encodeRequestParameterClassConfigurationGet(data.getParameterClass, encData)
            break;
        case 5:
            encData = encodeCrc(data.crc, encData)
            break;
        case 6:
            encData = encodeSensorRequest(data.sensorIds, encData)
            break;
        default:
            throw new Error("Unknown request type")

    }
    return encData
}
function encodeRequestType(value){
    switch (value){
        case "GENERIC_CONFIGURATION_SET":
            return 0;
        case "PARAM_CLASS_CONFIGURATION_SET":
            return 1;
        case "GENERIC_CONFIGURATION_GET":
            return 2;
        case "PARAM_CLASS_CONFIGURATION_GET":
            return 3;
        case "BLE_STATUS_CONNECTIVITY":
            return 4;
        case "CRC_CONFIGURATION_REQUEST":
            return 5;
        case "SENSOR_REQUEST":
            return 6;
        default:
            throw new Error("Unknown request type")

    }
}
function decodeRequest(payload){
    let request = new Request();

    let typeValue  = payload[1]
    switch (typeValue){
        case 0:
            request.requestType = RequestType.GENERIC_CONFIGURATION_SET
            request.genericConfigurationSet = determineRequestGenericConfigurationSet(payload.slice(2))
            break;
        case 1:
            request.requestType = RequestType.PARAM_CLASS_CONFIGURATION_SET
            request.parameterClassConfigurationSet = determineRequestParameterClassConfigurationSet(payload.slice(2))
            break;
        case 2:
            request.requestType = RequestType.GENERIC_CONFIGURATION_GET
            request.genericConfigurationGet = determineRequestGenericConfigurationGet(payload.slice(2))
            break;
        case 3:
            request.requestType = RequestType.PARAM_CLASS_CONFIGURATION_GET
            request.parameterClassConfigurationGet = determineRequestParameterClassConfigurationGet(payload.slice(2))
            break;
        case 4:
            request.requestType = RequestType.BLE_STATUS_CONNECTIVITY
            //TO BE defined
            break;
        case 5:
            request.requestType = RequestType.CRC_CONFIGURATION_REQUEST
            request.crc = decodeCrc(payload.slice(2))
            break;
        case 6:
            request.requestType = RequestType.SENSOR_REQUEST
            request.sensorIds = decodeSensorRequest(payload.slice(2))
           break;
        default:
            throw new Error("Request Type Unknown");
    }
    return request

}

function determineRequestGenericConfigurationSet(payload){
    let i = 0;
    let request = []
    while (payload.length > i) {
        let groupId = payload[i]
        let localId = payload[1+i]
        let size = payload[2+i]>>3 & 0x1F;
        let dataType = payload[2+i] & 0x07;
        let parameter = responseClass.getParameterByGroupIdAndLocalId(responseClass.parametersByGroupIdAndLocalId, groupId, localId)
        switch(dataType){
            case 0: 
                determineDeprecatedRequest(request, parameter,groupId)
                break;
            case 1:
                responseClass.determineConfiguration(request, parameter,  parseInt(util.convertBytesToString(payload.slice(3+i,3+i+size)),16), groupId, size)
                break;
            case 2:
                //we don't have a float parameter now
                break;
            case 3:
                responseClass.determineConfiguration(request, parameter,  payload.slice(3+i,3+i+size), groupId, size)
                break;
            case 4:
                responseClass.determineConfiguration(request, parameter,  payload.slice(3+i,3+i+size), groupId, size)
                break; 
            default:
                throw new Error("Unknown parameter type");
            
        }
        i = i + size + 3 
    }
    return request
}
function encodeCrc(groupNames, encData) {
    // Ensure groupNames is an array and not empty
    if (!Array.isArray(groupNames) || groupNames.length === 0) {
        throw new Error("Group names array is required and cannot be empty");
    }

    let bitmap = 0;

    // Loop through all group names and set the corresponding bit if the group is selected
    groupNames.forEach(group => {
        // Find the index of the group name in the GroupType object
        let index = Object.values(responseClass.GroupType).indexOf(group);
        
        // If the group is valid, set the corresponding bit in the bitmap
        if (index !== -1) {
            bitmap |= (1 << index);
        } else {
            console.warn(`Group name "${group}" not found in GroupType. Skipping.`);
        }
    });

    // Convert the bitmap into a 2-byte array (high byte and low byte)
    // Add the result to encData
    encData.push(bitmap >> 8, bitmap & 0xFF);

    return encData;
}

// Convert bitmap back to group names
function decodeCrc(bitmapArray) {
    // Check if the bitmapArray is [0, 0], meaning all groups are requested
    if (bitmapArray[0] === 0 && bitmapArray[1] === 0) {
        return Object.values(responseClass.GroupType);  // Return all groups if crc is empty
    }
    if (bitmapArray.length < 2) return []; // Avoid out-of-bounds errors

    // Convert 2-byte array into an integer
    let bitmap = (bitmapArray[0] << 8) | bitmapArray[1];

    let result = [];
    Object.keys(responseClass.GroupType).forEach((key, index) => {
        if ((bitmap & (1 << index)) !== 0) {  // Corrected bitwise check
            result.push(responseClass.GroupType[key]);
        }
    });
    return result;
}
function decodeSensorRequest(buffer) {
    return Array.from(buffer).map(id => {
        // Find the type corresponding to the numeric id
        let type = Object.keys(SENSOR_TYPES).find(key => SENSOR_TYPES[key] === id);
        return {
            id,
            type: type || "Unknown"  // If no match, set it to "Unknown"
        };
    });
}

// Encode: Convert sensor objects to binary format and fill encData
function encodeSensorRequest(sensorIds, encData) {

    if (!Array.isArray(sensorIds)) {
        throw new Error("sensorIds must be an array.");
    }
    if (!Array.isArray(encData)) {
        throw new Error("encData must be an array.");
    }

    sensorIds.forEach((sensor, index) => {
        if (!(sensor.type in SENSOR_TYPES)) {
            throw new Error(`Unknown sensor type: ${sensor.type}`);
        }
        let encodedValue = SENSOR_TYPES[sensor.type];
        encData.push(encodedValue);
    });
    return encData;
}


function determineRequestParameterClassConfigurationSet(payload){
    let groupId = payload[0]
    let i = 1;
    let request = []
    while (payload.length > i) {
        let localId = payload[i]
        let size = payload[1+i]>>3 & 0x1F;
        let dataType = payload[1+i] & 0x07;
        let parameter = responseClass.getParameterByGroupIdAndLocalId(responseClass.parametersByGroupIdAndLocalId, groupId, localId)
        if (payload.slice(i).length < size){
            throw new Error(parameter.driverParameterName + " has a wrong type")
        } 
        switch(dataType){
            case 0: 
                determineDeprecatedRequest(request, parameter,groupId)
                break;
            case 1:
                responseClass.determineConfiguration(request, parameter,  parseInt(util.convertBytesToString(payload.slice(2+i,2+i+size)),16), groupId)
                break;
            case 2:
                //TO be complted
                break;
            case 3:
                responseClass.determineConfiguration(request, parameter,  payload.slice(2+i,2+i+size), groupId, size)
                break; 
            case 4:
                responseClass.determineConfiguration(request, parameter,  payload.slice(2+i,2+i+size), groupId, size)
                break; 
            default:
                throw new Error("Unknown parameter type");

        }
        i = i + size + 2
        }
        return request
}

function determineDeprecatedRequest(request, parameter, groupId) {
    let group = responseClass.determineGroupType(groupId)
    let paramName = parameter.driverParameterName
    // Find the group in the request object or create a new one if it doesn't exist
    let groupObject = request.find(g => g.group === group);
    if (!groupObject) {
        groupObject = { group: group, parameters: [] };
        request.push(groupObject);
    }

    // Add the parameter to the group's parameters array
    groupObject.parameters.push({
        parameterName: paramName,
        parameterValue: "DEPRECATED"
    });
}

function determineRequestGenericConfigurationGet(payload){
    let i = 0;
    const step = 2;
    if (payload % 2 === 0){
        throw new Error("Invalid payload")
    }
    let request = []
    while (payload.length >= step * (i + 1)) {
        let groupId = payload[i*step]
        let localId = payload[1+i*step]
        let parameter = responseClass.getParameterByGroupIdAndLocalId(responseClass.parametersByGroupIdAndLocalId, groupId, localId)
        let group = responseClass.determineGroupType(groupId)
        // Find the group in the response object or create a new one if it doesn't exist
        let groupObject = request.find(g => g.group === group);
        if (!groupObject) {
            groupObject = { group: group, parameters: [] };
            request.push(groupObject);
        }

        // Add the parameter to the group's parameters array
        groupObject.parameters.push(
            parameter.driverParameterName
        );

    i++;
    }
    return request
}

function determineRequestParameterClassConfigurationGet(payload){
    if (payload.length < 2){
        throw new Error("The payload must contain at least one local identifier");
    }
    let groupId = payload[0]
    payload = payload.slice(1)
    let i = 0;
    const step = 1;
    let parameters = [];
    while (payload.length >= step * (i + 1)) {
        let parameter = responseClass.getParameterByGroupIdAndLocalId(responseClass.parametersByGroupIdAndLocalId, groupId, payload[i*step])
        parameters.push(parameter.driverParameterName)
        i++;
    }
    return new ParameterClassConfigurationGet(responseClass.determineGroupType(groupId), parameters)
}
function encodeRequestGenericConfigurationSet (setGenericParameters, encData){
    var i = 2
    for (let [index, entry] of setGenericParameters.entries()) {
        let groupId = determineValueFromGroupType(entry.group)
        for (let param of entry.parameters) {
            let parameter = getParametersByGroupIdAndDriverParameterName(responseClass.parametersByGroupIdAndLocalId, groupId, param.parameterName)
            encData[i] = groupId
            encData[i+1] = parseInt(parameter.localId, 16);
            i = encodeSetParameter(parameter, param.parameterValue, encData, i+2)
        }
    }
    return encData
}
function encodeRequestParameterClassConfigurationSet (setParameterClass, encData){
    let groupId = determineValueFromGroupType(setParameterClass.group);
    encData[2] = groupId;
    var i = 3
    for (let param of setParameterClass.parameters) {
        let parameter = getParametersByGroupIdAndDriverParameterName(responseClass.parametersByGroupIdAndLocalId, groupId, param.parameterName);
        encData[i] = parseInt(parameter.localId, 16);
        i = encodeSetParameter(parameter, param.parameterValue, encData, i + 1);
    }
    return encData;
}
function encodeRequestGenericConfigurationGet(getGenericParameters, encData){
    var i = 2
    for (let [index,entry] of getGenericParameters.entries()) {
        let groupId = determineValueFromGroupType(entry.group)
        for (let param of entry.parameters) {
            let parameter = getParametersByGroupIdAndDriverParameterName(responseClass.parametersByGroupIdAndLocalId, groupId, param)
            encData[i] = groupId
            encData[i+1] = parseInt(parameter.localId, 16);
            i = i + 2
        }
    }
    return encData
}
function encodeRequestParameterClassConfigurationGet (getParameterClass, encData){
    let groupId = determineValueFromGroupType(getParameterClass.group);
    encData[2] = groupId;
    var i = 3
    for (let param of getParameterClass.parameters) {
        let parameter = getParametersByGroupIdAndDriverParameterName(responseClass.parametersByGroupIdAndLocalId, groupId, param);
        encData[i] = parseInt(parameter.localId, 16);
        i++
     }
    return encData;
}

/* function encodeSetParameter( parameter, paramValue, encData , i){
    let size
    let paramType = parameter.parameterType.type
    switch (paramType){ 

    case "ParameterTypeNumber":
        size = 4
        encData[i] = encodeSizeAndType(size, 1)
        let range = parameter.parameterType.range
        let multiply = parameter.parameterType.multiply
        let additionalValues = parameter.parameterType.additionalValues
        let additionalRanges = parameter.parameterType.additionalRanges
        // negative number
    
        if (util.checkParamValueRange(paramValue, range.minimum, range.maximum, range.exclusiveMinimum, range.exclusiveMaximum, additionalValues, additionalRanges)){
            if (multiply != undefined){
                paramValue = paramValue/multiply
            }
            if (paramValue < 0) {
                paramValue += 0x100000000;
            }
            encData[i+1] = (paramValue >> 24) & 0xFF;
            encData[i+2] = (paramValue >> 16) & 0xFF;
            encData[i+3] = (paramValue >> 8) & 0xFF;
            encData[i+4] = paramValue & 0xFF;
            return i + size + 1
        }
        else{

                throw new Error(parameter.driverParameterName +" parameter value is out of range");
        }
    case "ParameterTypeString":
        size = 4
        encData[i] = encodeSizeAndType(size, 1)
        if (((parameter.parameterType.possibleValues).indexOf(paramValue)) != -1)
            {
                encData[i+1] = 0;
                encData[i+2] = 0;
                encData[i+3] = 0;
                encData[i+4]  = (parameter.parameterType.firmwareValues[((parameter.parameterType.possibleValues).indexOf(paramValue))])
                return i + size + 1
            }
        else{
            
            throw new Error(parameter.driverParameterName+" parameter value is unknown");
        }
    case "ParameterTypeBitMask":
        size = 4
        encData[i] = encodeSizeAndType(size, 1)
        let flags =0 
        let properties = parameter.parameterType.properties
        let bitMap = parameter.parameterType.bitMask
        for (let bit of bitMap){
            let flagName = bit.valueFor
            let flagValue = paramValue[flagName]
            if (flagValue == undefined){
                throw new Error("Bit "+ flagName +" is missing");
            }
            let  property = (properties.find(el => el.name === flagName))
            let propertyType = property.type
            switch (propertyType)
            {
                case "PropertyBoolean":
                    if ((bit.inverted != undefined) && (bit.inverted)){
                        flagValue =! flagValue;
                    } 
                    flags |= Number(flagValue) << bit.bitShift
                    break;
                case "PropertyString":
                    if (property.possibleValues.indexOf(flagValue) != -1){
                        flags |= (property.firmwareValues[property.possibleValues.indexOf(flagValue)]) << bit.bitShift
                    }
                    else {
                        throw new Error(property.name+ " parameter value is not among possible values");
                    }
                    
                    break;
                case "PropertyNumber":
                    if (property.range){ 
                        if (util.checkParamValueRange(flagValue, property.range.minimum, property.range.maximum, property.range.exclusiveMinimum, property.range.exclusiveMaximum, property.additionalValues, property.additionalRanges)){
                            flags |= flagValue << bit.bitShift    
                        }
                        else {
                            throw new Error("Value out of range for "+ parameter.driverParameterName+"."+flagName);
                        }
                    }
                    else{
                        flags |= flagValue << bit.bitShift  
                    }
                    break;
                case "PropertyObject":
                    let bitValues = Object.entries(flagValue)
                    for (let b of bit.values){
                        let fValue = flagValue[b.valueFor]
                        if (fValue == undefined){
                            throw new Error("Bit "+ flagName +"."+ b.valueFor+" is missing");
                        }
                        if ((b.inverted != undefined) && (b.inverted)){
                            fValue =! fValue;
                        }
                        flags |= Number(fValue) <<  b.bitShift 

                    }
                    break;
                default:
                    throw new Error("Property type is unknown");
            }
        }
        
        encData[i+1] = (flags >> 24) & 0xFF;
        encData[i+2] = (flags >> 16) & 0xFF;
        encData[i+3] = (flags >> 8) & 0xFF;
        encData[i+4] = flags & 0xFF;
        return i + size + 1 ;
        
    case "ParameterTypeAsciiString":
        size = paramValue.length
        encData[i] = encodeSizeAndType(size, 3)
        for (let j = 0; j < paramValue.length; j++)
            encData[i + j + 1] =paramValue.charCodeAt(j) & 0xFF;

        return i + size + 1 ;
    case "ParameterTypeByteArray":
        size = parameter.parameterType.size
        encData[i] = encodeSizeAndType(size, 4)
        if  (parameter.parameterType.properties == undefined){
            let paramValueHex = paramValue.toString().replace(/[{}]/g, '').replace(/,/g, ''); // Remove braces and commas
            for (let j = 0; j < size; j++) {
                encData[i + j + 1] = parseInt(paramValueHex.slice(j * 2, j * 2 + 2), 16);
            }
            return i + size + 1;
        }else{
            let arrayProperties = parameter.parameterType.properties
            let byteMask = parameter.parameterType.byteMask
            for (let j = 0; j < size; j++) {
                let flags =0 

                for (let bit of byteMask){
                    let flagName = bit.valueFor
                    let flagValue = paramValue[j][flagName]
                    if (flagValue == undefined){
                        throw new Error("byte "+ flagName +" is missing");
                    }
                    let  property = (arrayProperties.find(el => el.name === flagName))
                    let propertyType = property.type
                    switch (propertyType)
                    {
                        case "PropertyBoolean":
                            if ((bit.inverted != undefined) && (bit.inverted)){
                                flagValue =! flagValue;
                            } 
                            flags |= Number(flagValue) << bit.bitShift
                            break;
                        case "PropertyString":
                            if (property.possibleValues.indexOf(flagValue) != -1){
                                flags |= (property.firmwareValues[property.possibleValues.indexOf(flagValue)]) << bit.bitShift
                            }
                            else {
                                throw new Error(property.name+ " parameter value is not among possible values");
                            }
                            
                            break;
                        case "PropertyNumber":
                            if (property.range){ 
                                if (util.checkParamValueRange(flagValue, property.range.minimum, property.range.maximum, property.range.exclusiveMinimum, property.range.exclusiveMaximum, property.additionalValues, property.additionalRanges)){
                                    flags |= flagValue << bit.bitShift    
                                }
                                else {
                                    throw new Error("Value out of range for "+ parameter.driverParameterName+"."+flagName);
                                }
                            }
                            else{
                                flags |= flagValue << bit.bitShift  
                            }
                            break;
                        case "PropertyObject":
                            for (let b of bit.values){
                                let fValue = flagValue[b.valueFor]
                                if (fValue == undefined){
                                    throw new Error("Bit "+ flagName +"."+ b.valueFor+" is missing");
                                }
                                if ((b.inverted != undefined) && (b.inverted)){
                                    fValue =! fValue;
                                }
                                flags |= Number(fValue) <<  b.bitShift 

                            }
                            break;
                        default:
                            throw new Error("Property type is unknown");
                    }
                }
        
                encData[i + j + 1] = flags & 0xFF
        
        }
        return i + size + 1 ;
    }
    case "ParameterTypeByteArray":
        size = parameter.parameterType.size;
        encData[i] = encodeSizeAndType(size, 4);
    
        if (!parameter.parameterType.properties) {
            // Handle raw byte array (no properties)
            encodeRawByteArray(paramValue, size, encData, i);
            return i + size + 1;
        } else {
            // Handle byte array with properties
            encodeByteArrayWithProperties(parameter, paramValue, size, encData, i);
            return i + size + 1;
        }
            
    default:
        throw new Error("Parameter type is unknown");
        
    }
} */
// Function encode size and type for a parameter

function encodeSetParameter(parameter, paramValue, encData, i) {
    const paramType = parameter.parameterType.type;

    switch (paramType) {
        case "ParameterTypeNumber":
            return encodeNumberParameter(parameter, paramValue, encData, i);
        case "ParameterTypeString":
            return encodeStringParameter(parameter, paramValue, encData, i);
        case "ParameterTypeBitMask":
            return encodeBitMaskParameter(parameter, paramValue, encData, i);
        case "ParameterTypeAsciiString":
            return encodeAsciiStringParameter(parameter, paramValue, encData, i);
        case "ParameterTypeByteArray":
            return encodeByteArrayParameter(parameter, paramValue, encData, i);
        default:
            throw new Error("Parameter type is unknown");
    }
}

// Helper Functions

/**
 * Encodes a number parameter.
 */
function encodeNumberParameter(parameter, paramValue, encData, startIndex) {
    const size = 4;
    encData[startIndex] = encodeSizeAndType(size, 1);

    const range = parameter.parameterType.range;
    const multiply = parameter.parameterType.multiply;
    const additionalValues = parameter.parameterType.additionalValues;
    const additionalRanges = parameter.parameterType.additionalRanges;

    if (!util.checkParamValueRange(paramValue, range.minimum, range.maximum, range.exclusiveMinimum, range.exclusiveMaximum, additionalValues, additionalRanges)) {
        throw new Error(`${parameter.driverParameterName} parameter value is out of range`);
    }

    let value = paramValue;
    if (multiply !== undefined) {
        value /= multiply;
    }
    if (value < 0) {
        value += 0x100000000;
    }

    encData[startIndex + 1] = (value >> 24) & 0xFF;
    encData[startIndex + 2] = (value >> 16) & 0xFF;
    encData[startIndex + 3] = (value >> 8) & 0xFF;
    encData[startIndex + 4] = value & 0xFF;

    return startIndex + size + 1;
}

/**
 * Encodes a string parameter.
 */
function encodeStringParameter(parameter, paramValue, encData, startIndex) {
    const size = 4;
    encData[startIndex] = encodeSizeAndType(size, 1);

    const possibleValues = parameter.parameterType.possibleValues;
    const firmwareValues = parameter.parameterType.firmwareValues;

    const index = possibleValues.indexOf(paramValue);
    if (index === -1) {
        throw new Error(`${parameter.driverParameterName} parameter value is unknown`);
    }

    encData[startIndex + 1] = 0;
    encData[startIndex + 2] = 0;
    encData[startIndex + 3] = 0;
    encData[startIndex + 4] = firmwareValues[index];

    return startIndex + size + 1;
}

/**
 * Encodes a bitmask parameter.
 */
function encodeBitMaskParameter(parameter, paramValue, encData, startIndex) {
    const size = 4;
    encData[startIndex] = encodeSizeAndType(size, 1);

    const properties = parameter.parameterType.properties;
    const bitMap = parameter.parameterType.bitMask;

    let flags = 0;
    for (let bit of bitMap) {
        const flagName = bit.valueFor;
        const flagValue = paramValue[flagName];

        if (flagValue === undefined) {
            throw new Error(`Bit ${flagName} is missing`);
        }

        const property = properties.find(el => el.name === flagName);
        if (!property) {
            throw new Error(`Property ${flagName} not found`);
        }

        flags = encodeProperty(property, bit, flagValue, flags);
    }

    encData[startIndex + 1] = (flags >> 24) & 0xFF;
    encData[startIndex + 2] = (flags >> 16) & 0xFF;
    encData[startIndex + 3] = (flags >> 8) & 0xFF;
    encData[startIndex + 4] = flags & 0xFF;

    return startIndex + size + 1;
}

/**
 * Encodes an ASCII string parameter.
 */
function encodeAsciiStringParameter(parameter, paramValue, encData, startIndex) {
    const size = paramValue.length;
    encData[startIndex] = encodeSizeAndType(size, 3);

    for (let j = 0; j < paramValue.length; j++) {
        encData[startIndex + j + 1] = paramValue.charCodeAt(j) & 0xFF;
    }

    return startIndex + size + 1;
}

/**
 * Encodes a byte array parameter.
 */
function encodeByteArrayParameter(parameter, paramValue, encData, startIndex) {
    const size = parameter.parameterType.size;
    encData[startIndex] = encodeSizeAndType(size, 4);

    if (!parameter.parameterType.properties) {
        encodeRawByteArray(paramValue, size, encData, startIndex);
    } else {
        encodeByteArrayWithProperties(parameter, paramValue, size, encData, startIndex);
    }

    return startIndex + size + 1;
}

/**
 * Encodes a raw byte array (no properties).
 */
function encodeRawByteArray(paramValue, size, encData, startIndex) {
    const paramValueHex = paramValue.toString().replace(/[{}]/g, '').replace(/,/g, ''); // Remove braces and commas
    for (let j = 0; j < size; j++) {
        encData[startIndex + j + 1] = parseInt(paramValueHex.slice(j * 2, j * 2 + 2), 16);
    }
}

/**
 * Encodes a byte array with properties.
 */
function encodeByteArrayWithProperties(parameter, paramValue, size, encData, startIndex) {
    const arrayProperties = parameter.parameterType.properties;
    const byteMask = parameter.parameterType.byteMask;

    for (let j = 0; j < size; j++) {
        let flags = 0;
        flags = encodeProperties(arrayProperties, byteMask, paramValue[j], flags);
        encData[startIndex + j + 1] = flags & 0xFF;
    }
}

/**
 * Encodes properties for a single byte in the byte array.
 */
function encodeProperties(arrayProperties, byteMask, paramValue, flags) {
    for (let bit of byteMask) {
        const flagName = bit.valueFor;
        const flagValue = paramValue[flagName];

        if (flagValue === undefined) {
            throw new Error(`Byte ${flagName} is missing`);
        }

        const property = arrayProperties.find(el => el.name === flagName);
        if (!property) {
            throw new Error(`Property ${flagName} not found`);
        }

        flags = encodeProperty(property, bit, flagValue, flags);
    }
    return flags;
}

/**
 * Encodes a single property based on its type.
 */
function encodeProperty(property, bit, flagValue, flags) {
    switch (property.type) {
        case "PropertyBoolean":
            return encodeBooleanProperty(bit, flagValue, flags);
        case "PropertyString":
            return encodeStringProperty(property, bit, flagValue, flags);
        case "PropertyNumber":
            return encodeNumberProperty(property, bit, flagValue, flags);
        case "PropertyObject":
            return encodeObjectProperty(bit, flagValue, flags);
        default:
            throw new Error(`Unknown property type: ${property.type}`);
    }
}

/**
 * Encodes a boolean property.
 */
function encodeBooleanProperty(bit, flagValue, flags) {
    let value = flagValue;
    if (bit.inverted) {
        value = !value;
    }
    return flags | (Number(value) << bit.bitShift);
}

/**
 * Encodes a string property.
 */
function encodeStringProperty(property, bit, flagValue, flags) {
    const index = property.possibleValues.indexOf(flagValue);
    if (index === -1) {
        throw new Error(`${property.name} value is not among possible values`);
    }
    return flags | (property.firmwareValues[index] << bit.bitShift);
}

/**
 * Encodes a number property.
 */
function encodeNumberProperty(property, bit, flagValue, flags) {
    if (property.range) {
        if (!util.checkParamValueRange(flagValue, property.range.minimum, property.range.maximum, property.range.exclusiveMinimum, property.range.exclusiveMaximum, property.additionalValues, property.additionalRanges)) {
            throw new Error(`Value out of range for ${property.name}`);
        }
    }
    return flags | (flagValue << bit.bitShift);
}

/**
 * Encodes an object property.
 */
function encodeObjectProperty(bit, flagValue, flags) {
    for (let b of bit.values) {
        const fValue = flagValue[b.valueFor];
        if (fValue === undefined) {
            throw new Error(`Bit ${bit.valueFor}.${b.valueFor} is missing`);
        }
        let value = fValue;
        if (b.inverted) {
            value = !value;
        }
        flags |= Number(value) << b.bitShift;
    }
    return flags;
}
function encodeSizeAndType(size, type){
    return ((size << 0x03)| type)

}
// Function to get parameters by groupId and driverParameterName
function getParametersByGroupIdAndDriverParameterName(parameters, groupId, driverParameterName) {
    // Check if the parameters object contains the groupId
    if (parameters[groupId]) {
        // Iterate over each localId within the groupId
        for (let localId in parameters[groupId]) {
            // Check if the current parameter's driverParameterName matches the provided name
            if (parameters[groupId][localId].driverParameterName === driverParameterName) {
                return parameters[groupId][localId];
            }
        }
    }

    // Return null if no matching parameter is found
    return null;
}
// give the group as string 
function determineValueFromGroupType(groupType) {
    switch(groupType) {
        case responseClass.GroupType.INTERNAL:
            return 0;
        case responseClass.GroupType.SYSTEM_CORE:
            return 1;
        case responseClass.GroupType.GEOLOC:
            return 2;
        case responseClass.GroupType.GNSS:
            return 3;
        case responseClass.GroupType.LR11xx:
            return 4;
        case responseClass.GroupType.BLE_SCAN1:
            return 5;
        case responseClass.GroupType.BLE_SCAN2:
            return 6;
        case responseClass.GroupType.ACCELEROMETER:
            return 7;
        case responseClass.GroupType.NETWORK:
            return 8;
        case responseClass.GroupType.LORAWAN:
            return 9;
        case responseClass.GroupType.CELLULAR:
            return 10;
        case responseClass.GroupType.BLE:
            return 11;
        default:
            throw new Error("Unknown group type");
    }
}

module.exports = {
    RequestType: RequestType,
    encodeRequest: encodeRequest,
    decodeRequest: decodeRequest
}