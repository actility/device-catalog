const Constellation = Object.freeze({
    GPS: "GPS",
    BEIDOU: "BEIDOU"
})

const CN = Object.freeze({
    0: ">45dB",
    1: "[41..45]dB",
    2: "[37..41]dB",
    3: "<37dB"
})

function SatelliteInfo(constellation,
    id,
    cn,
    pseudoRangeValue
){
    this.constellation = constellation;
    this.id = id;
    this.cn = cn;
    this.pseudoRangeValue = pseudoRangeValue;
}

module.exports = {
    SatelliteInfo: SatelliteInfo, 
    Constellation: Constellation,
    CN: CN	
}