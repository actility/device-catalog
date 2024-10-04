
let util = require("../../../../util");
let BeaconInfoClass = require("./beaconInfo");

function determineBleIdShortPositionMessage(payload) {
    return extractBeaconInfos(payload, 3, (payload, index) => {
        let key = `${util.convertByteToString(payload[index * 3])}-${util.convertByteToString(payload[1 + index * 3])}`;
        let value = util.convertNegativeInt(payload[2 + index * 3], 1);
        return new BeaconInfoClass.BeaconIdInfo(key, value);
    });
}

function determineBleIdLongPositionMessage(payload) {
    return extractBeaconInfos(payload, 17, (payload, index) => {
        let key = Array.from({ length: 16 }, (_, i) => util.convertByteToString(payload[i + index * 17])).join('-');
        let value = util.convertNegativeInt(payload[16 + index * 17], 1);
        return new BeaconInfoClass.BeaconIdInfo(key, value);
    });
}

function determineBleMacPositionMessage(payload) {
    return extractBeaconInfos(payload, 7, (payload, index) => {
        let key = Array.from({ length: 6 }, (_, i) => util.convertByteToString(payload[i + index * 7])).join(':');
        let value = util.convertNegativeInt(payload[6 + index * 7], 1);
        return new BeaconInfoClass.BeaconMacInfo(key, value);
    });
}

function extractBeaconInfos(payload, chunkSize, createBeaconInfo) {
    const beaconInfos = [];
    const count = Math.floor(payload.length / chunkSize);
    for (let i = 0; i < count; i++) {
        beaconInfos.push(createBeaconInfo(payload, i));
    }
    return beaconInfos;
}

module.exports = {
    determineBleMacPositionMessage,
    determineBleIdShortPositionMessage,
    determineBleIdLongPositionMessage
};