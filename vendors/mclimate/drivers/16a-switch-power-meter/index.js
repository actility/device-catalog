// DataCake
function Decoder(bytes, port){
    var decoded = decodeUplink({ bytes: bytes, fPort: port }).data;
    return decoded;
}

// Milesight
function Decode(port, bytes){
    var decoded = decodeUplink({ bytes: bytes, fPort: port }).data;
    return decoded;
}

// The Things Industries / Main
function decodeUplink(input) {
    try {
        var bytes = input.bytes;
        var data = {};

        function handleKeepalive(bytes, data) {
            data.internalTemperature = bytes[1];

        // Energy data
        var energy = (bytes[2] << 24) | (bytes[3] << 16) | (bytes[4] << 8) | bytes[5];
        data.energy_kWh = energy / 1000;

        // Power data
        var power = (bytes[6] << 8) | bytes[7];
        data.power_W = power;

        // AC voltage
        data.acVoltage_V = bytes[8];

        // AC current data
        var acCurrent = (bytes[9] << 8) | bytes[10];
        data.acCurrent_mA = acCurrent;
        
        // Relay state
        data.relayState = bytes[11] === 0x01 ? "ON" : "OFF";
            return data;
        }

        function handleResponse(bytes, data){
            var commands = bytes.map(function(byte){
                return ("0" + byte.toString(16)).substr(-2); 
            });
            commands = commands.slice(0,-12);
            var command_len = 0;
        
            commands.map(function (command, i) {
                switch (command) {
                    case '04':
                        {
                            command_len = 2;
                            var hardwareVersion = commands[i + 1];
                            var softwareVersion = commands[i + 2];
                            data.deviceVersions = { hardware: Number(hardwareVersion), software: Number(softwareVersion) };
                        }
                    break;
                    case '12':
                        {
                            command_len = 1;
                            data.keepAliveTime = parseInt(commands[i + 1], 16);
                        }
                    break;
                    case '19':
                        {
                            command_len = 1;
                            var commandResponse = parseInt(commands[i + 1], 16);
                            var periodInMinutes = commandResponse * 5 / 60;
                            data.joinRetryPeriod =  periodInMinutes;
                        }
                    break;
                    case '1b':
                        {
                            command_len = 1;
                            data.uplinkType = parseInt(commands[i + 1], 16) ;
                        }
                    break;
                    case '1d':
                        {
                            command_len = 2;
                            var wdpC = commands[i + 1] == '00' ? false : parseInt(commands[i + 1], 16);
                            var wdpUc = commands[i + 2] == '00' ? false : parseInt(commands[i + 2], 16);
                            data.watchDogParams= { wdpC: wdpC, wdpUc: wdpUc } ;
                        }
                    break;
                    case '1f':
                        {
                            command_len = 2;
                            data.overheatingThresholds = {trigger: parseInt(commands[i + 1], 16), recovery: parseInt(commands[i + 2], 16) }
                        }
                    break;
                    case '21':
                        {
                            command_len = 3;
                            data.overvoltageThreshold = {trigger: (parseInt(commands[i + 1], 16) << 8) | parseInt(commands[i + 2], 16), recovery: parseInt(commands[i + 3], 16)};
                        }
                    break;
                    case '23':
                        {
                            command_len = 1;
                            data.overcurrentThreshold = parseInt(commands[i + 1], 16) ;
                        }
                    break;
                    case '25':
                        {
                            command_len = 2;
                            data.overpowerThreshold = (parseInt(commands[i + 1], 16) << 8) | parseInt(commands[i + 2], 16) ;
                        }
                    break;
                    case '5a':
                        {
                            command_len = 1;
                            data.afterOverheatingProtectionRecovery = parseInt(commands[i + 1], 16)
                        }
                    break;
                    case '5c':
                        {
                            command_len = 1;
                            data.ledIndicationMode = parseInt(commands[i + 1], 16)
                        }
                    break;
                    case '5d':
                        {
                            command_len = 1;
                            data.manualChangeRelayState = parseInt(commands[i + 1], 16) === 0x01
                        }
                    break;
                    case '5f':
                        {
                            command_len = 1;
                            data.relayRecoveryState = parseInt(commands[i + 1], 16) ;
                        }
                    break;
                    case '60':
                        {
                            command_len = 2;
                            data.overheatingEvents = { events: parseInt(commands[i + 1], 16), temperature: parseInt(commands[i + 2], 16) } ;
                        }
                    break;
                    case '61':
                        {
                            command_len = 3;
                            data.overvoltageEvents = { events: parseInt(commands[i + 1], 16), voltage: (parseInt(commands[i + 2], 16) << 8) | parseInt(commands[i + 3], 16) };
                        }
                    break;
                    case '62':
                        {
                            command_len = 3;
                            data.overcurrentEvents = { events: parseInt(commands[i + 1], 16), current: (parseInt(commands[i + 2], 16) << 8) | parseInt(commands[i + 3], 16) }
                        }
                    break;
                    case '63':
                        {
                            command_len = 3;
                            data.overpowerEvents = { events: parseInt(commands[i + 1], 16), power: (parseInt(commands[i + 2], 16) << 8) | parseInt(commands[i + 3], 16) };
                        }
                    break;
                    case '70':
                        {
                            command_len = 2;
                            data.overheatingRecoveryTime = (parseInt(commands[i + 1], 16) << 8) | parseInt(commands[i + 2], 16) ;
                        }
                    break;
                    case '71':
                        {
                            command_len = 2;
                            data.overvoltageRecoveryTime = (parseInt(commands[i + 1], 16) << 8) | parseInt(commands[i + 2], 16);
                        }
                    break;
                    case '72':
                        {
                            command_len = 1;
                            data.overcurrentRecoveryTemp = parseInt(commands[i + 1], 16);
                        }
                    break;
                    case '73':
                        {
                            command_len = 1;
                            data.overpowerRecoveryTemp = parseInt(commands[i + 1], 16);
                        }
                    break;
                    case 'b1':
                        {
                            command_len = 1;
                            data.relayState = parseInt(commands[i + 1], 16) === 0x01
                        }
                    break;
                    case 'a0': {
                        command_len = 4;
                        var fuota_address = (parseInt(commands[i + 1], 16) << 24) | 
                                          (parseInt(commands[i + 2], 16) << 16) | 
                                          (parseInt(commands[i + 3], 16) << 8) | 
                                          parseInt(commands[i + 4], 16);
                        var fuota_address_raw = commands[i + 1] + commands[i + 2] + 
                                              commands[i + 3] + commands[i + 4];
                        
                        data.fuota = { fuota_address: fuota_address, fuota_address_raw: fuota_address_raw };
                        break;
                    }
                    default:
                        break;
                }
                commands.splice(i,command_len);
            });
            return data;
            }

        if (bytes[0] == 1) {
            data = handleKeepalive(bytes, data);
        } else {
            data = handleResponse(bytes, data);
            // Handle the remaining keepalive data if required after response
            bytes = bytes.slice(-12);
            data = handleKeepalive(bytes, data);
        }
        return { data: data };
    } catch (e) {
        // console.log(e);
        throw new Error('Unhandled data');
    }
}

function encodeDownlink(input) {
    var bytes = [];
    var key, i;
    for (key in input.data) {
        if (input.data.hasOwnProperty(key)) {
            switch (key) {
                case "setKeepAlive":
                    bytes.push(0x02);
                    bytes.push(input.data.setKeepAlive);
                    break;
                case "getKeepAliveTime":
                    bytes.push(0x12);
                    break;
                case "getDeviceVersions":
                    bytes.push(0x04);
                    break;
                case "setJoinRetryPeriod":
                    var periodToPass = Math.floor((input.data.setJoinRetryPeriod * 60) / 5);
                    bytes.push(0x10);
                    bytes.push(periodToPass);
                    break;
                case "getJoinRetryPeriod":
                    bytes.push(0x19);
                    break;
                case "setUplinkType":
                    bytes.push(0x11);
                    bytes.push(input.data.setUplinkType);
                    break;
                case "getUplinkType":
                    bytes.push(0x1b);
                    break;
                case "setWatchDogParams":
                    bytes.push(0x1c);
                    bytes.push(input.data.setWatchDogParams.confirmedUplinks);
                    bytes.push(input.data.setWatchDogParams.unconfirmedUplinks);
                    break;
                case "getWatchDogParams":
                    bytes.push(0x1d);
                    break;
                case "setOverheatingThresholds":
                    bytes.push(0x1e);
                    bytes.push(input.data.setOverheatingThresholds.trigger);
                    bytes.push(input.data.setOverheatingThresholds.recovery);
                    break;
                case "getOverheatingThresholds":
                    bytes.push(0x1f);
                    break;
                case "setOvervoltageThresholds":
                    bytes.push(0x20);
                    bytes.push(input.data.setOvervoltageThresholds.trigger);
                    bytes.push(input.data.setOvervoltageThresholds.recovery);
                    break;
                case "getOvervoltageThresholds":
                    bytes.push(0x21);
                    break;
                case "setOvercurrentThreshold":
                    bytes.push(0x22);
                    bytes.push(input.data.setOvercurrentThreshold);
                    break;
                case "getOvercurrentThreshold":
                    bytes.push(0x23);
                    break;
                case "setOverpowerThreshold":
                    bytes.push(0x24);
                    bytes.push(input.data.setOverpowerThreshold);
                    break;
                case "getOverpowerThreshold":
                    bytes.push(0x25);
                    break;
                case "setAfterOverheatingProtectionRecovery":
                    bytes.push(0x59);
                    bytes.push(input.data.setAfterOverheatingProtectionRecovery);
                    break;
                case "getAfterOverheatingProtectionRecovery":
                    bytes.push(0x5a);
                    break;

                case "setLedIndicationMode":
                    bytes.push(0x5b);
                    bytes.push(input.data.setLedIndicationMode);
                    break;
                case "getLedIndicationMode":
                    bytes.push(0x5c);
                    break;
                case "setRelayRecoveryState":
                    bytes.push(0x5e);
                    bytes.push(input.data.setRelayRecoveryState);
                    break;
                case "getRelayRecoveryState":
                    bytes.push(0x5f);
                    break;
                case "setRelayState":
                    bytes.push(0xc1);
                    bytes.push(input.data.setRelayState);
                    break;
                case "getRelayState":
                    bytes.push(0xb1);
                    break;
                case "getOverheatingEvents":
                    bytes.push(0x60);
                    break;
                case "getOvervoltageEvents":
                    bytes.push(0x61);
                    break;
                case "getOvercurrentEvents":
                    bytes.push(0x62);
                    break;
                case "getOverpowerEvents":
                    bytes.push(0x63);
                    break;
                case "getOverheatingRecoveryTime":
                    bytes.push(0x70);
                    break;
                case "getOvervoltageRecoveryTime":
                    bytes.push(0x71);
                    break;
                case "getOvercurrentRecoveryTemp":
                    bytes.push(0x72);
                    break;
                case "getOverpowerRecoveryTemp":
                    bytes.push(0x73);
                    break;

                case "sendCustomHexCommand":
                    var sendCustomHexCommand = input.data.sendCustomHexCommand;
                    for (i = 0; i < sendCustomHexCommand.length; i += 2) {
                        var byte = parseInt(sendCustomHexCommand.substr(i, 2), 16);
                        bytes.push(byte);
                    }
                    break;
                default:
                    break;
            }
        }
    }
    return {
        bytes: bytes,
        fPort: 1,
        warnings: [],
        errors: [],
    };
}

function decodeDownlink(input) {
    return {
        data: {
            bytes: input.bytes,
        },
        warnings: [],
        errors: [],
    };
}

// example downlink commands
// {"setRelayState":1} --> 0xC101
// {"getDeviceVersions": ""} -->0x04
// {"getKeepAliveTime": ""} --> 0x12

exports.decodeUplink = decodeUplink;
exports.encodeDownlink = encodeDownlink;
exports.decodeDownlink = decodeDownlink;
