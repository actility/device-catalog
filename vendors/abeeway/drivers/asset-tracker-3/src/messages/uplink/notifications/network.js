function Network(activeNetwork, mainNetwork, backupNetwork){
    this.activeNetwork = activeNetwork;
    this.mainNetwork = mainNetwork;
    this.backupNetwork = backupNetwork;
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
    let activeNetwork = determineNetwork(payload[5])
    let mainNetwork =  determineNetwork(payload[6])
    let backupNetwork = determineNetwork(payload[7])
    return new Network(activeNetwork, mainNetwork, backupNetwork);
}

module.exports = {
    Network: Network,
    determineNetworkInfo: determineNetworkInfo,
    NetworkType: NetworkType
}