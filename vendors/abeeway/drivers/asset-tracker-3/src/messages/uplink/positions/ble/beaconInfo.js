function BeaconIdInfo(id,
    rssi
){
    this.id = id;
    this.rssi = rssi;
}
function BeaconMacInfo(mac,
    rssi
){
    this.mac = mac;
    this.rssi = rssi;
}



module.exports = {
    BeaconIdInfo: BeaconIdInfo, 	
    BeaconMacInfo: BeaconMacInfo
}