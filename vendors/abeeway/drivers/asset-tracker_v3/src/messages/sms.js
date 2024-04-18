function Sms(destinationId,
		senderId,
        message){
            this.destinationId = destinationId;
            this.senderId = senderId;
            this.message = message;
}

module.exports = {
    Sms: Sms
}