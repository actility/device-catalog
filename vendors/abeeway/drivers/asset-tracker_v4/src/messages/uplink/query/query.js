const QueryType = Object.freeze({
    AIDING_POSITION: "AIDING_POSITION",
    UPDATE_SYS_TIME: "UPDATE_SYS_TIME",
    UPDATE_GPS_ALMANAC: "UPDATE_GPS_ALMANAC",
    UPDATE_BEIDOU_ALMANAC: "UPDATE_BEIDOU_ALMANAC"
})

function Query(queryType,
    almanac){
        this.queryType = queryType;
        this.almanac = almanac;
}

function determineQuery(payload){
    
}

module.exports = {
    Query: Query,
    determineQuery: determineQuery
}