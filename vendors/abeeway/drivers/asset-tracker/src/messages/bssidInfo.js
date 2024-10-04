function BssidInfo (bssid,rssi){
        this.bssid = bssid;
        this.rssi = rssi;
}

module.exports = {
    BssidInfo: BssidInfo
}