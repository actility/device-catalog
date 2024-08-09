/* let requestClass = require("../../downlink/requests/request");
//response type is the same as request type
const responseType = requestClass.RequestType; */

let util = require("../../../util");
let jsonParameters = require("../../../resources/parameters.json");

const ResponseType = Object.freeze({
    GENERIC_CONFIGURATION_SET: "GENERIC_CONFIGURATION_SET",
    PARAM_CLASS_CONFIGURATION_SET: "PARAM_CLASS_CONFIGURATION_SET",
    GENERIC_CONFIGURATION_GET: "GENERIC_CONFIGURATION_GET",
    PARAM_CLASS_CONFIGURATION_GET: "PARAM_CLASS_CONFIGURATION_GET",
    BLE_STATUS_CONNECTIVITY: "BLE_STATUS_CONNECTIVITY",
    GET_GPS_ALMANAC_ENTRY: "GET_GPS_ALMANAC_ENTRY",
    GET_BEIDOU_ALMANAC_ENTRY: "GET_BEIDOU_ALMANAC_ENTRY",
    SET_GPS_ALMANAC_ENTRY: "SET_GPS_ALMANAC_ENTRY",
    SET_BEIDOU_ALMANAC_ENTRY: "SET_BEIDOU_ALMANAC_ENTRY",
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
    CELLULAR: "CELLULAR"

    
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
    getGpsAlmanacEntry,
    getBeidouAlmanacEntry,
    setGpsAlmanacEntry,
    setBeidouAlmanacEntry
    ){
        this.responseType = responseType;
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
            response.genericConfigurationSet = determineResponseGenericConfigurationSet(payload.slice(startingByte+1))
            break;
        case 1:
            response.responseType = ResponseType.PARAM_CLASS_CONFIGURATION_SET
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
            //TO BE defined
            break;
        case 5:
            response.responseType = ResponseType.GET_GPS_ALMANAC_ENTRY
            break;
        case 6:
            response.responseType = ResponseType.GET_BEIDOU_ALMANAC_ENTRY
            break;
        case 7:
            response.responseType = ResponseType.SET_GPS_ALMANAC_ENTRY
            break;
        case 8:
            response.responseType = ResponseType.SET_BEIDOU_ALMANAC_ENTRY
            break;
        default:
            throw new Error("Response Type Unknown");
    }
    return response

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
    case "ParameterTypeNumber":
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
        });
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
    case "ParameterTypeBitMask":
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
                case "PropertyString":
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
                        break;
                case "PropertyNumber":
                    if ((bit.length)!= undefined ) {
                        length = util.lengthToHex(bit.length)
                    }
                    parameterValue[property.name] = paramValue >>bit.bitShift & length ;	

                    break;
                case "PropertyObject":
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
                    break;
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
        });
        break;
    case "ParameterTypeByteArray":

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
        let arrayProperties = parameter.parameterType.properties
        let byteMap = parameter.parameterType.byteMask
        let arrayLength = parseInt(1,16)
        
        bytesValue = []
        for (let i = 0; i < parameterSize; i++) {
            let arrayParameterValue ={}
            for (let py  of arrayProperties) {
                let propertyName = py.name
                let propertyType = py.type
                let bit = byteMap.find(el => el.valueFor === propertyName)

                switch (propertyType)
                {
                    case "PropertyBoolean":
                        
                        if ((bit.length)!= undefined ) {
                            arrayLength = util.lengthToHex(bit.length)
                        }
                        var b =  Boolean((paramValue[i] >>bit.bitShift & length ))
                        if ((bit.inverted != undefined) && (bit.inverted)){
                            b =!b;
                        }
                        arrayParameterValue[py.name] = b
                        break;
                    case "PropertyString":
                        if ((bit.length)!= undefined ) {
                            arrayLength = util.lengthToHex(bit.length)
                        }
                        let value = (paramValue[i] >>bit.bitShift & arrayLength)
                        let possibleValues = py.possibleValues
                        if (py.firmwareValues.indexOf(value) != -1){
                            arrayParameterValue[py.name] = possibleValues[(py.firmwareValues.indexOf(value))]
                        }
                        else {
                            throw new Error(py.name+ " parameter value is not among possible values");
                        }
                            break;
                    case "PropertyNumber":
                        if ((bit.length)!= undefined ) {
                            arrayLength = util.lengthToHex(bit.length)
                        }
                        arrayParameterValue[py.name] = paramValue[i] >>bit.bitShift & arrayLength ;	
                        break;
                    case "PropertyObject":
                        let bitValue ={}
                        for (let value of bit.values)
                            {
                            if (value.type == "BitMapValue")
                                {	
                                    let arrayLength = parseInt(1,16)
                                    if ((value.length)!= undefined ) {arrayLength = (util.lengthToHex(value.length))}
                                    var b = Boolean(paramValue[i]>>value.bitShift & arrayLength)
                                    if ((value.inverted != undefined) && (value.inverted)){
                                        b =!b;
                                    }
                                    bitValue[value.valueFor] = b
                                }
                            }
                            arrayParameterValue[py.name] = bitValue
                        break;
                    default:
                        throw new Error("Property type is unknown");
                        
                    }
                }
                bytesValue.push(arrayParameterValue)
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
    });
    break;
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
    payload = payload.slice(1)
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
    determineResponse: determineResponse,
    determineConfiguration: determineConfiguration,
    parametersByGroupIdAndLocalId: parametersByGroupIdAndLocalId,
    getParameterByGroupIdAndLocalId: getParameterByGroupIdAndLocalId,
    determineGroupType:determineGroupType,
    GroupType: GroupType

}
