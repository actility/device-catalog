function ProximityWhiteListing (encrypted,
        rollingProximityIdentifier,
        list,
        recordStatus,
        solicited){
            this.encrypted = encrypted;
            this.rollingProximityIdentifier = rollingProximityIdentifier;
            this.list = list;
            this.recordStatus = recordStatus;
            this.solicited = solicited;
}

module.exports = {
    ProximityWhiteListing: ProximityWhiteListing,
    List: {
        PEER_LIST: "PEER_LIST",
        WARNING_LIST: "WARNING_LIST",
        ALERT_LIST: "ALERT_LIST"
    },
    RecordStatus: {
        NOT_WHITE_LISTED: "NOT_WHITE_LISTED",
        WHITE_LISTED: "WHITE_LISTED"
    }
}