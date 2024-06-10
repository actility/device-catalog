let util = require("../../../util");
const QueryType = Object.freeze({
    AIDING_POSITION: "AIDING_POSITION",
    UPDATE_SYS_TIME: "UPDATE_SYS_TIME",
    UPDATE_GPS_ALMANAC: "UPDATE_GPS_ALMANAC",
    UPDATE_BEIDOU_ALMANAC: "UPDATE_BEIDOU_ALMANAC"
})

function Query(queryType,
    gpsSvid, beidouSvid){
        this.queryType = queryType;
        this.gpsSvid = gpsSvid;
        this.beidouSvid = beidouSvid;
}

function determineQuery(payload){
    let query = new Query();
    let typeValue = payload[4] & 0x1F;
    switch (typeValue){
        case 0:
            query.queryType = QueryType.AIDING_POSITION
            break;
        case 1:
            query.queryType = QueryType.UPDATE_SYS_TIME
            break;
        case 2:
            query.queryType = QueryType.UPDATE_GPS_ALMANAC
            query.gpsSvid = determineSvId(payload.slice(5), 0, 31, "GPS")
            break;
        case 3:
            query.queryType = QueryType.UPDATE_BEIDOU_ALMANAC
            query.beidouSvid = determineSvId(payload.slice(5), 0, 34, "BEIDOU")
            break;
        default:
            throw new Error("Query Type Unknown");
    }
}

function determineSvId(payload, min, max , constellation){
    let Svid = [];
    for (let i = 0; i < payload.length; i++) {
        if (!util.isValueInRange(min, max))
            throw new Error("Invalid "+constellation+" SVID Number");
        gpsSvid.push(payload[i]);
    }
} 
module.exports = {
    Query: Query,
    determineQuery: determineQuery
}