function GnssFailure(timeoutCause,
    satelliteSeen){
    this.timeoutCause = timeoutCause;
    this.satellitesSeen = satelliteSeen
}
const timeoutCause = Object.freeze({
    T0_TIMEOUT: "T0_TIMEOUT",
    T1_TIMEOUT: "T1_TIMEOUT",
    ACQUISITION_TIMEOUT: "ACQUISITION_TIMEOUT"
});
const constellation = Object.freeze({
    GPS: "GPS",
    GLONASS: "GLONASS",
    BEIDOU: "BEIDOU",
    GALILEO: "GALILEO"
});
function determineTimeoutCause(timeoutCause){
    switch (timeoutCause){
	    case 0:
	        return timeoutCause.T0_TIMEOUT;
	    case 1:
	        return timeoutCause.T1_TIMEOUT;
	    case 2:
	    	return timeoutCause.ACQUISITION_TIMEOUT;
	    default:
	    	throw new Error("The timeout cause is unknown");
    }
}
function determineConstellation(cons){

    switch (cons){
	    case 0:
	        return constellation.GPS;
        case 1:
            return constellation.GLONASS;
        case 2:
            return constellation.BEIDOU;
        case 3:
            return constellation.GALILEO;
        default:
            throw new Error("The constellation is unknown" )
}}

function determineGnssFailure(payload){
    let timeoutCause = determineTimeoutCause(payload[0]>>5 & 0x07)
    let nbSatSeen = payload[0] & 0x0F
    payload = payload.slice(1)
    let satelliteSeen = []
    for (let i = 0; i < nbSatSeen*2; i += 2) {
        let svId = payload[i]
        let constellation = determineConstellation(payload[i]+1>>6 & 0x03)
        let CN = payload[i+1] & 0x3F
        satelliteSeen.push({svId, constellation, CN})
    } 
   
    return new GnssFailure(timeoutCause, satelliteSeen)
}

module.exports = {
    GnssFailure: GnssFailure,
    determineGnssFailure: determineGnssFailure
}
