let abeewayUplinkPayloadClass = require("./messages/abeewayUplinkPayload");
let abeewayDownlinkPayloadClass = require("./messages/abeewayDownlinkPayload");
let headerClass = require("./messages/header");
let multiFrameClass = require("./messages/multiFrame");
let notificationClass = require("./notifications/notification");
let positionClass = require("./positions/position");
let util = require("./util");
let commandClass = require("./messages/command");
let requestClass = require("./requests/request");

const DOWNLINK_PORT_NUMBER = 2;

const removeEmpty = (obj) => {
    Object.keys(obj).forEach(k =>
      (obj[k] && typeof obj[k] === 'object') && removeEmpty(obj[k]) ||
      (!obj[k] && (obj[k] === null || obj[k] === undefined)) && delete obj[k] 
    );
    return obj;
  };



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
        var multiFrame = !!(payload[0]>>7 & 0x01);
        if (multiFrame){
            decodedData.multiFrame = multiFrameClass.determineMultiFrame(payload);
        } 
        decodedData.payload = util.convertBytesToString(payload);

        switch (decodedData.header.type){
            case abeewayUplinkPayloadClass.messageType.NOTIFICATION:
                decodedData.notification = notificationClass.determineNotification(payload);
                break;
            case abeewayUplinkPayloadClass.messageType.POSITION:
                decodedData.position = positionClass.determinePosition(payload, multiFrame);
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

function decodeDownlink(input){
    let result = {
        data: {},
        errors: [],
        warnings: []
    }
    try{
        var payload = input.bytes;
        var decodedData = new abeewayDownlinkPayloadClass.determineDownlinkHeader(payload);
        decodedData.payload = util.convertBytesToString(payload);
        switch (decodedData.type){
            case abeewayDownlinkPayloadClass.MessageType.COMMAND:
                break;
            case abeewayDownlinkPayloadClass.MessageType.REQUEST:
                break;
            case abeewayDownlinkPayloadClass.MessageType.ANSWER:
                break;
        }

    }
    catch (e){
        result.errors.push(e.message);
        delete result.data;
        return result;
    }
    return result;
}

function encodeDownlink(input){
    let result = {
        errors: [],
        warnings: []
    };

    try{
        if (input == null) {
            throw new Error("No data to encode");
        }

        let data = input;
        if(input.data != null) {
            data = input.data;
        }

        var bytes = [];

        if(data.type == null){
            throw new Error("No downlink message type");
        }
        switch (data.type){
            case abeewayDownlinkPayloadClass.MessageType.COMMAND:
                bytes = commandClass.encodeCommand(data);
                break;
            case abeewayDownlinkPayloadClass.MessageType.REQUEST:
                bytes = requestClass.encodeRequest(data);
                break;
            case abeewayDownlinkPayloadClass.MessageType.ANSWER:
                
                break;
            
        }

        result.bytes = bytes;
        result.fPort = DOWNLINK_PORT_NUMBER;
    } catch (e){
        result.errors.push(e.message);
        delete result.bytes;
        delete result.fPort;
        return result;
    }
    return result;
}

module.exports = {
    decodeUplink: decodeUplink,
    decodeDownlink: decodeDownlink,
    encodeDownlink: encodeDownlink
}