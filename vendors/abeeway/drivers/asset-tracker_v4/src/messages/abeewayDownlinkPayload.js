function AbeewayDownlinkPayload(type, 
        ackToken,
        appState,
        command,
        request,
        payload) {
        this.type = type;
        this.ackToken = ackToken;
        this.appState = appState;
        this.command = command;
        this.request = request;
        this.payload = payload;
}



module.exports = {
    AbeewayDownlinkPayload: AbeewayDownlinkPayload
}