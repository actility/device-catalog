function MultiFrame(group,
    last,
    frameNumber){
    this.group = group;
    this.last = last;
    this.frameNumber = frameNumber;
}

function determineMultiFrame(payload){
    if (payload.length < 5)
        throw new Error("The payload is not valid to determine multi frame header");
    let multiFrame = new MultiFrame(payload[4]>>5 & 0x07, 
        payload[4]>>4 & 0x01, 
        payload[4] & 0x07);
    return multiFrame;
    
}

module.exports = {
    MultiFrame: MultiFrame,
    determineMultiFrame: determineMultiFrame
}