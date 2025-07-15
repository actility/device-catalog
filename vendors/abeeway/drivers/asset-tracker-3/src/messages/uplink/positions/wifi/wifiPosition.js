let BssidInfoClass = require("./bssidInfo");
let util = require("../../../../util");

function determineWifiPositionMessage(payload){
  
    const wifiBssids = [];
    var i = 0;
    while (payload.length >= 7*(i+1)){
        let key = util.convertByteToString(payload[i*7]) + ":" 
                    + util.convertByteToString(payload[1+i*7]) + ":"
                    + util.convertByteToString(payload[2+i*7]) + ":"
                    + util.convertByteToString(payload[3+i*7]) + ":"
                    + util.convertByteToString(payload[4+i*7]) + ":"
                    + util.convertByteToString(payload[5+i*7]);
        let value = util.convertNegativeInt(payload[6+i*7],1);
        
        wifiBssids.push(new BssidInfoClass.BssidInfo(key, value));
        i++;
    }

    return wifiBssids;
}

module.exports = {
    determineWifiPositionMessage : determineWifiPositionMessage	
}