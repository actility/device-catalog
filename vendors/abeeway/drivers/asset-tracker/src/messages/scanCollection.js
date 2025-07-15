function ScanCollection(scanType,
        again,
        dataFormat,
        fragmentIdentification,
        collectionIdentifier,
        hash,
        beaconIdData,
        macAddressData){
            this.scanType = scanType;
            this.again = again;
            this.dataFormat = dataFormat;
            this.fragmentIdentification = fragmentIdentification;
            this.collectionIdentifier = collectionIdentifier;
            this.hash = hash;
            this.beaconIdData = beaconIdData;
            this.macAddressData = macAddressData;
}

module.exports = {
    ScanCollection: ScanCollection,
    ScanType: {
        BLE_BEACONS: "BLE_BEACONS",
        WIFI_BSSID: "WIFI_BSSID",
        BLE_BEACONS_COLLECTION: "BLE_BEACONS_COLLECTION"
    },
    DataFormat: {
        BEACON_ID: "BEACON_ID",
        MAC_ADDRESS: "MAC_ADDRESS"
    }
}