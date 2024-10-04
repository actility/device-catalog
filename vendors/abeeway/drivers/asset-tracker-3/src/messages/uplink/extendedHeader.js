function ExtendedHeader(groupId,
    last,
    frameNumber){
    this.groupId = groupId;
    this.last = last;
    this.frameNumber = frameNumber;
}

function determineExtendedHeader(payload){
    if (payload.length < 5)
        throw new Error("The payload is not valid to determine multi frame header");
    let extendedHeader = new ExtendedHeader(payload[4]>>5 & 0x07, 
        payload[4]>>4 & 0x01, 
        payload[4] & 0x07);
    return extendedHeader;
    
}

module.exports = {
    ExtendedHeader: ExtendedHeader,
    determineExtendedHeader: determineExtendedHeader
}