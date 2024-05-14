let requestClass = require("../requests/request");
//response type is the same as request type
const responseType = requestClass.RequestType;

//To be checked with FW team because the listed types do not cover all the payload listed
function Response(responseType,
    genericConfSet,
    parameterClassSet,
    genericConfGet,
    parameterClassGet,
    bleStatus
    ){
        this.responseType = responseType;
}

function determineResponse(payload){
    
}

module.exports = {
    Response: Response,
    determineResponse: determineResponse
}