function BssidInfo(mac,
    rssi
){
    this.mac = mac;
    this.rssi = rssi;
}

module.exports = {
    BssidInfo: BssidInfo, 	
}