function Network(activeNetwork, mainNetwork, backupNetwork, psmActiveTime, psmTAU){
    this.activeNetwork = activeNetwork;
    this.mainNetwork = mainNetwork;
    this.backupNetwork = backupNetwork;
    this.psmActiveTime = psmActiveTime;
    this.psmTAU = psmTAU;
}
const NetworkType = Object.freeze({
    MAIN_UP: "MAIN_UP",
    BACKUP_UP: "BACKUP_UP"
})

const NetworkInfo = Object.freeze({
    NO_NETWORK: "NO_NETWORK",
    LORA_NETWORK: "LORA_NETWORK",
    CELLULAR_NETWORK_IN_LOW_POWER_MODE: "CELLULAR_NETWORK_IN_LOW_POWER_MODE",
    CELLULAR_NETWORK_IN_HIGH_POWER_MODE: "CELLULAR_NETWORK_IN_HIGH_POWER_MODE"

})

function determineNetwork(value){
    switch(value){
        case 0:
            return NetworkInfo.NO_NETWORK;
        case 1:
            return NetworkInfo.LORA_NETWORK;
        case 2:
            return NetworkInfo.CELLULAR_NETWORK_IN_LOW_POWER_MODE;
        case 3:
            return NetworkInfo.CELLULAR_NETWORK_IN_HIGH_POWER_MODE;
        default:
            throw new Error("Unknown Network Information");
    }

}
function determineNetworkInfo(payload){
    let psmActiveTime
    let psmTAU
    let activeNetwork = determineNetwork(payload[5])
    let mainNetwork =  determineNetwork(payload[6])
    let backupNetwork = determineNetwork(payload[7])
    if (payload.length > 7){
        psmActiveTime = (payload[8] << 8) + payload[9];
        psmTAU = (payload[10] << 24) + (payload[11] << 16) + (payload[12] << 8) + payload[13];
    }
    return new Network(activeNetwork, mainNetwork, backupNetwork, psmActiveTime, psmTAU);
}

module.exports = {
    Network: Network,
    determineNetworkInfo: determineNetworkInfo,
    NetworkType: NetworkType
}