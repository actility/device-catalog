let abeewayUplinkPayloadClass = require("./messages/uplink/abeewayUplinkPayload");
let abeewayDownlinkPayloadClass = require("./messages/downlink/abeewayDownlinkPayload");
let basicHeadeClass = require("./messages/uplink/basicHeader");
let extendedHeaderClass = require("./messages/uplink/extendedHeader");
let notificationClass = require("./messages/uplink/notifications/notification");
let positionClass = require("./messages/uplink/positions/position");
let responseClass = require("./messages/uplink/responses/response");
let queryClass = require("./messages/uplink/queries/query");
let util = require("./util");
let commandClass = require("./messages/downlink/command");
let requestClass = require("./messages/downlink/requests/request");

const DOWNLINK_PORT_NUMBER = 3;

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
        var receivedTime = input.recvTime;

        //header decoding
        decodedData.header = basicHeadeClass.determineHeader(payload,receivedTime);

        //if multiframe is true
        var multiFrame = !!(payload[0]>>7 & 0x01);
        if (multiFrame){
            decodedData.extendedHeader = extendedHeaderClass.determineExtendedHeader(payload);
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
                decodedData.query = queryClass.determineQuery(payload);
                break;
            case abeewayUplinkPayloadClass.messageType.RESPONSE:
                decodedData.response = responseClass.determineResponse(payload, multiFrame);
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
        switch (decodedData.downMessageType){
            case abeewayDownlinkPayloadClass.MessageType.COMMAND:
                decodedData.command = commandClass.determineCommand(payload[1])
                break;
            case abeewayDownlinkPayloadClass.MessageType.REQUEST:
                decodedData.request = requestClass.decodeRequest(payload)
                break;
            case abeewayDownlinkPayloadClass.MessageType.ANSWER:
                break;
        }
        decodedData = removeEmpty(decodedData);
        result.data= decodedData;
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

        if(data.downMessageType == null){
            throw new Error("No downlink message type");
        }
        switch (data.downMessageType){
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