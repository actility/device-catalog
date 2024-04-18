function AbeewayDownlinkPayload(downMessageType, 
        ackToken,
        modeValue,
        debugCommandType,
        listParameterID,
        listParameterIDNames,
        statusType,
        setParameters,
        resetAction,
        optionalCommand,
        txPowerIndex,
        melodyId,
        buzzerDuration,
        proximityMessage,
        angleDetectionControl,
        bleAdvertisementDuration,
        startupModes,
        sms,
        payload) {
        this.downMessageType = downMessageType;
        this.ackToken = ackToken;
        this.modeValue = modeValue;
        this.debugCommandType = debugCommandType;
        this.listParameterID = listParameterID;
        this.listParameterIDNames = listParameterIDNames;
        this.statusType = statusType;
        this.setParameters = setParameters;
        this.resetAction = resetAction;
        this.optionalCommand = optionalCommand;
        this.txPowerIndex = txPowerIndex;
        this.melodyId = melodyId;
        this.buzzerDuration = buzzerDuration;
        this.proximityMessage = proximityMessage;
        this.angleDetectionControl = angleDetectionControl;
        this.bleAdvertisementDuration = bleAdvertisementDuration;
        this.startupModes = startupModes;
        this.sms = sms;
        this.payload = payload;
}

module.exports = {
    AbeewayDownlinkPayload: AbeewayDownlinkPayload
}