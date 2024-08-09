let responseClass = require("../../uplink/responses/response");
let util = require("../../../util");

const RequestType = Object.freeze({
    GENERIC_CONFIGURATION_SET: "GENERIC_CONFIGURATION_SET",
    PARAM_CLASS_CONFIGURATION_SET: "PARAM_CLASS_CONFIGURATION_SET",
    GENERIC_CONFIGURATION_GET: "GENERIC_CONFIGURATION_GET",
    PARAM_CLASS_CONFIGURATION_GET: "PARAM_CLASS_CONFIGURATION_GET",
    BLE_STATUS_CONNECTIVITY: "BLE_STATUS",
    GET_GPS_ALMANAC_ENTRY: "GET_GPS_ALMANAC_ENTRY",
    GET_BEIDOU_ALMANAC_ENTRY: "GET_BEIDOU_ALMANAC_ENTRY",
    SET_GPS_ALMANAC_ENTRY: "SET_GPS_ALMANAC_ENTRY",
    SET_BEIDOU_ALMANAC_ENTRY: "SET_BEIDOU_ALMANAC_ENTRY",
})
function Request(requestType,
    genericConfigurationSet,
    parameterClassConfigurationSet,
    genericConfigurationGet,
    parameterClassConfigurationGet,
    bleStatusConnectivity,
    getGpsAlmanacEntry,
    getBeidouAlmanacEntry,
    setGpsAlmanacEntry,
    setBeidouAlmanacEntry
    ){
        this.requestType = requestType;
        this.genericConfigurationSet = genericConfigurationSet;
        this.parameterClassConfigurationSet = parameterClassConfigurationSet;
        this.genericConfigurationGet = genericConfigurationGet;
        this.parameterClassConfigurationGet = parameterClassConfigurationGet;
        this.bleStatusConnectivity= bleStatusConnectivity;
        this.getGpsAlmanacEntry = getGpsAlmanacEntry;
        this.getBeidouAlmanacEntry = getBeidouAlmanacEntry;
        this.setGpsAlmanacEntry = setGpsAlmanacEntry;
        this.setBeidouAlmanacEntry = setBeidouAlmanacEntry; 
        
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
        case "GET_GPS_ALMANAC_ENTRY":
            return 5;
        case "GET_BEIDOU_ALMANAC_ENTRY":
            return 6;
        case "SET_GPS_ALMANAC_ENTRY":
            return 7;
        case "SET_BEIDOU_ALMANAC_ENTRY":
            return 8;
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
            request.requestType = RequestType.GET_GPS_ALMANAC_ENTRY
            break;
        case 6:
            request.requestType = RequestType.GET_BEIDOU_ALMANAC_ENTRY
            break;
        case 7:
            request.requestType = RequestType.SET_GPS_ALMANAC_ENTRY
            break;
        case 8:
            request.requestType = RequestType.SET_BEIDOU_ALMANAC_ENTRY
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

function encodeSetParameter( parameter, paramValue, encData , i){
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
            

    default:
        throw new Error("Parameter type is unknown");
        
    }
}
// Function encode size and type for a parameter
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
        default:
            throw new Error("Unknown group type");
    }
}
module.exports = {
    RequestType: RequestType,
    encodeRequest: encodeRequest,
    decodeRequest: decodeRequest
}