function ProximityMessage (type,rollingProximityIdentifier,recordStatus,dayIdentifier){
        this.type = type;
        this.rollingProximityIdentifier = rollingProximityIdentifier;
        this.recordStatus = recordStatus;
        this.dayIdentifier = dayIdentifier;
}

module.exports = {
    ProximityMessage: ProximityMessage,
    Type: {
        GET_RECORD_STATUS: "GET_RECORD_STATUS",
        SET_WHITE_LIST_STATUS: "SET_WHITE_LIST_STATUS",
        GET_DAILY_INFORMATION: "GET_DAILY_INFORMATION",
        CLEAR_DAILY_INFORMATION: "CLEAR_DAILY_INFORMATION"
    },
    SetRecordStatus: {
        RESET_WHITE_LISTING: "RESET_WHITE_LISTING",
        SET_WHITE_LISTING: "SET_WHITE_LISTING"
    }
}