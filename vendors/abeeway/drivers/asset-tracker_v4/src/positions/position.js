function Position(motion,
    status,
    positionType,
    triggers,
    lr1110gnss,
    lr1110semtechNav1, 
    lr1110semtechNav2, 
    wifi, 
    bleMac,
    bleShort,
    bleLong,
    mt3333gnss,
    mt3333lpgnss){
        this.motion = motion;
        this.status = status;
        this.positionType = positionType;
        this.triggers = triggers;
        this.lr1110gnss = lr1110gnss;
        this.lr1110semtechNav1 = lr1110semtechNav1;
        this.lr1110semtechNav2 = lr1110semtechNav2;
        this.wifi = wifi;
        this.bleMac =bleMac;
        this.bleShort = bleShort;
        this.bleLong = bleLong;
        this.mt3333gnss = mt3333gnss;
        this.mt3333lpgnss =mt3333lpgnss;
}

function determinePosition(payload){
    let positionMessage = new Position();
    //TODO
    return positionMessage;

}

module.exports = {
    Position: Position,
    determinePosition: determinePosition
 	
}
