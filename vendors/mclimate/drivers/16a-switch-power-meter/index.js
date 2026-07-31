var KEEPALIVE_BYTE_LEN = 12;

function decodeUplink(input) {
    try {
        var bytes = input.bytes;
        var data = {};

        if (!bytes || bytes.length < KEEPALIVE_BYTE_LEN) {
            throw new Error('payload must be at least ' + KEEPALIVE_BYTE_LEN + ' bytes long');
        }

        function handleKeepalive(bytes, data) {
            // Temperature sign and internal temperature
            var isNegative = (bytes[1] & 0x80) !== 0; // Check the 7th bit for the sign
            var temperature = bytes[1] & 0x7F; // Mask out the 7th bit to get the temperature value
            data.internalTemperature = isNegative ? -temperature : temperature;

            // Energy data
            var energy = (bytes[2] << 24) | (bytes[3] << 16) | (bytes[4] << 8) | bytes[5];
            data.energy = energy / 1000;

            // Power data
            data.power = (bytes[6] << 8) | bytes[7];

            // AC voltage
            data.acVoltage = bytes[8];

            // AC current data
            data.acCurrent = (bytes[9] << 8) | bytes[10];

            // Relay state
            data.relayState = bytes[11] === 0x01;

            return data;
        }

        function handleResponse(bytes, data){
            var commands = bytes.map(function(byte){
                return ("0" + byte.toString(16)).substr(-2); 
            });
            commands = commands.slice(0,-KEEPALIVE_BYTE_LEN);
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
                            data.overvoltageThresholds = {trigger: (parseInt(commands[i + 1], 16) << 8) | parseInt(commands[i + 2], 16), recovery: parseInt(commands[i + 3], 16)};
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
                    case '54':
                        {
                            command_len = 1;
                            data.relayStateChangeReason = parseInt(commands[i + 1], 16);
                        }
                    break;
                    case '56':
                        {
                            command_len = 3;
                            data.relayTimerInMilliseconds = {
                                state: parseInt(commands[i + 1], 16),
                                time: (parseInt(commands[i + 2], 16) << 8) | parseInt(commands[i + 3], 16)
                            };
                        }
                    break;
                    case '58':
                        {
                            command_len = 3;
                            data.relayTimerInSeconds = {
                                state: parseInt(commands[i + 1], 16),
                                time: (parseInt(commands[i + 2], 16) << 8) | parseInt(commands[i + 3], 16)
                            };
                        }
                    break;
                    case 'a4':
                        {
                            command_len = 1;
                            data.region = parseInt(commands[i + 1], 16);
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
                        command_len = 0;
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
            data = handleKeepalive(bytes.slice(-KEEPALIVE_BYTE_LEN), data);
        }
        return { data: data };
    } catch (e) {
        return { errors: ['Invalid uplink payload: ' + e.message], warnings: [] };
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
                    // The trigger voltage is transmitted as two bytes.
                    var overvoltageTrigger = input.data.setOvervoltageThresholds.trigger;
                    bytes.push(0x20);
                    bytes.push((overvoltageTrigger >> 8) & 0xff);
                    bytes.push(overvoltageTrigger & 0xff);
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
                    // The power threshold is transmitted as two bytes.
                    var overpowerThreshold = input.data.setOverpowerThreshold;
                    bytes.push(0x24);
                    bytes.push((overpowerThreshold >> 8) & 0xff);
                    bytes.push(overpowerThreshold & 0xff);
                    break;
                case "getOverpowerThreshold":
                    bytes.push(0x25);
                    break;
                case "getRelayStateChangeReason":
                    bytes.push(0x54);
                    break;
                case "setRelayTimerMiliseconds":
                    var msState = input.data.setRelayTimerMiliseconds.state;
                    var msTime = input.data.setRelayTimerMiliseconds.time;
                    bytes.push(0x55);
                    bytes.push(msState);
                    bytes.push((msTime >> 8) & 0xff);
                    bytes.push(msTime & 0xff);
                    break;
                case "getRelayTimerMiliseconds":
                    bytes.push(0x56);
                    break;
                case "setRelayTimerSeconds":
                    var sState = input.data.setRelayTimerSeconds.state;
                    var sTime = input.data.setRelayTimerSeconds.time;
                    bytes.push(0x57);
                    bytes.push(sState);
                    bytes.push((sTime >> 8) & 0xff);
                    bytes.push(sTime & 0xff);
                    break;
                case "getRelayTimerSeconds":
                    bytes.push(0x58);
                    break;
                case "setAfterOverheatingProtectionRecovery":
                    bytes.push(0x59);
                    bytes.push(input.data.setAfterOverheatingProtectionRecovery);
                    break;
                case "getAfterOverheatingProtectionRecovery":
                    bytes.push(0x5a);
                    break;
                case "getRegion":
                    bytes.push(0xa4);
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
