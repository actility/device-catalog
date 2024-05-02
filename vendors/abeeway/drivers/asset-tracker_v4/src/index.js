let abeewayUplinkPayloadClass = require("./messages/abeewayUplinkPayload");
let headerClass = require("./messages/header");
let multiFrameClass = require("./messages/multiFrame");
let notificationClass = require("./notifications/notification");
let positionClass = require("./positions/position");
let util = require("./util");
//const MessageType = require("./enums/messageType");


const removeEmpty = (obj) => {
    Object.keys(obj).forEach(k =>
      (obj[k] && typeof obj[k] === 'object') && removeEmpty(obj[k]) ||
      (!obj[k] && (obj[k] === null || obj[k] === undefined)) && delete obj[k] 
    );
    return obj;
  };




const ASSET_TRACKER_2_0_PORT_NUMBER = 18;
const PROXIMITY_CCD_ROLLOVER_VALUE = 65535;
const DOWNLINK_PORT_NUMBER = 2;

function decodeUplink(input) {
    let result = {
        data: {},
        errors: [],
        warnings: []
    }
    try{
        var decodedData = new abeewayUplinkPayloadClass.AbeewayUplinkPayload();
        var payload = input.bytes;

        //header decoding
        decodedData.header = headerClass.determineHeader(payload);
        //if multiframe is true
        if (!!(payload[0]>>7 & 0x01)){
            decodedData.multiFrame = multiFrameClass.determineMultiFrame(payload);
        } 
        decodedData.payload = util.convertBytesToString(payload);

        switch (decodedData.header.type){
            case abeewayUplinkPayloadClass.messageType.NOTIFICATION:
                decodedData.notification = notificationClass.determineNotification(payload);
                break;
            case abeewayUplinkPayloadClass.messageType.POSITION:
                decodedData.position = positionClass.determinePosition(payload);
                break;
            case abeewayUplinkPayloadClass.messageType.QUERY:
                decodedData.query = determineQuery(payload);
                break;
            case abeewayUplinkPayloadClass.messageType.RESPONSE:
                decodedData.response = determineResponse(payload);
                break;
        }
        decodedData = removeEmpty(decodedData);
        result.data = decodedData;
    } catch (e){
        result.errors.push(e.message);
        delete result.data;
        return result;
    }
    return result;
}


module.exports = {
    decodeUplink: decodeUplink
}