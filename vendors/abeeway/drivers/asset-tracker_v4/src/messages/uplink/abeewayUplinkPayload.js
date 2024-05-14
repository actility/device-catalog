const messageType = Object.freeze({
    NOTIFICATION: "NOTIFICATION",
    POSITION: "POSITION",
    QUERY: "QUERY",
    RESPONSE: "RESPONSE",
    UNKNOWN: "UNKNOWN"
});

function AbeewayUplinkPayload(header,
    extendedHeader,
    notification,
    position,
    query,
    response,
    payload) {
    this.header = header;
    this.extendedHeader = extendedHeader;
    this.notification = notification;
    this.position = position;
    this.query = query;
    this.response = response;
    this.payload = payload
}

module.exports = {
    AbeewayUplinkPayload: AbeewayUplinkPayload,
    messageType: messageType
}