/**
 * Parse Device Status
 * Helper function used by the decodeUplink() function
 * @param {number} [statusCode] - A byte, tepresenting thhe device status
 * @returns {Object} The status object
 */

 function parseStatus(statusCode) {
    let status = {
        lowBattery:     (0b00000100 & statusCode) !== 0,
        permanentError: (0b00001000 & statusCode) !== 0,
        temporaryError: false
    }
    if ( (0b00010000 & statusCode) !== 0 ) {
        switch(statusCode >> 5) {
            case 0b000:
                status.temporaryError = 'dry';     
                break;
            case 0b011:
                status.temporaryError = 'backflow';     
                break;
            case 0b101:
                status.temporaryError = 'burst';     
                break;
            case 0b001:
                status.temporaryError = 'leakage';     
                break;
            case 0b100:
                status.temporaryError = 'lowTemperature';     
                break;
        }

    }
    return status;
}

/**
 * Decode uplink
 * @param {Object} input - An object provided by the IoT Flow framework
 * @param {number[]} input.bytes - Array of numbers as it will be sent to the device
 * @param {number} [input.fPort] - The fPort on which the downlink must be sent
 * @returns {Object} The decoded object
 */

function decodeUplink(input) {

    const fPort = input.fPort;
    let bytes = Buffer.from(input.bytes);
    let length = bytes.length;
    let result = {
        data: {},
        errors: [],
        warnings: []
    };

    if (fPort != 100 && fPort != 101 && fPort != 103) {
        result.errors.push("Invalid fPort!");
    }

    if (fPort === 100) {

        const dataInterval = 3600 * 1000;

        const lastLogTimeStamp = 1000 * bytes.readUIntLE(0, 4);
        const lastLogTime = new Date(lastLogTimeStamp).toISOString();

        const status = parseStatus(bytes[4]);
        
        const lastVolume = bytes.readUIntLE(5, 4);
        
        const firstLogTimeStamp = 1000 * bytes.readUIntLE(9, 4);
        // Do we need to round it???
        // const firstLogTimeStamp = new Date(1000 * bytes.readUIntLE(9, 4)).setMinutes(0, 0, 0)

        const firstLogTime = new Date(firstLogTimeStamp).toISOString();
        
        const firstLogVolume = bytes.readUIntLE(13, 4);


        let deltaVolume;
        const deltaVolumes = [];
        let v = firstLogVolume;
        let t = firstLogTimeStamp;
        const volumes = [];

        volumes.push({
            time: firstLogTime, 
            volume: firstLogVolume
        });
        for (let i=17; i < length; i+=2) {
            deltaVolume = bytes.readUIntLE(i, 2);
            deltaVolumes.push(deltaVolume);
            v += deltaVolume;
            t += dataInterval;
            volumes.push({
                time: new Date(t).toISOString(),
                volume: v
            });
        }
        volumes.push({
            time: lastLogTime, 
            volume: lastVolume
        });

        result.data = {
            status: status,
            // lastLogTimeStamp: lastLogTimeStamp,
            lastLogTime: lastLogTime,
            lastVolume: lastVolume,
            // logTimeStamp: logTimeStamp,
            firstLogTime: firstLogTime,
            firstLogVolume: firstLogVolume,
            deltaVolumes: deltaVolumes,
            volumes: volumes,

            payloadType: "Basic"
        }
    }
    else if(fPort === 101) {
        bytes = input.bytes;
        let values = [];

        let VIF = {
            time: 0xFF8913,
            status: 0xFD17,
            totalVolume: 0x13,
            volume: 0x93
        };

        let byteLengths = [[1, 3], [1, 2], [1, 1], [1, 3], [1, 1], [1, 1, 1]];
        let i = 0;
        for(let valueLength of byteLengths) {
            let valueItem = {
                dataType: "",
                bytesLength: 0,
                variableLength: false,
                compactProfile: false,
                withStorage: false,
                imperial: false
            };

            let valueDIF = bytes[i];

            valueItem.withStorage = (valueDIF & 0xF0) === 0x40;

            valueItem.bytesLength = valueDIF & 0x0F;
            if(valueItem.bytesLength === 13) {
                valueItem.bytesLength = null;
                valueItem.variableLength = true;
            }
            i += valueLength[0];

            let valueVIF = 0;
            for(let j = 0 ; j < valueLength[1] ; j++) {
                valueVIF *= 16*16;
                valueVIF += bytes[i++];
            }
            
            valueItem.DIF = valueDIF;
            valueItem.VIF = valueVIF;

            switch(valueVIF) {
                case VIF.time:
                    valueItem.dataType = "Current date and time, Unix time";
                    break;
                case VIF.status:
                    valueItem.dataType = "Status byte";
                    break;
                case VIF.totalVolume:
                    valueItem.dataType = "Current volume, L";
                    break;
                case VIF.volume:
                    valueItem.dataType = "Volume, L";
                    break;
                default:
                    result.errors.push("Unknown data type");
                    valueItem.dataType = "unknown";
            }
            if(bytes[i] === 0xBD) {
                valueItem.imperial = true;
                i++;
            }

            if(valueLength[2]) {
                valueItem.compactProfile = bytes[i] === 0x1E;
                i += valueLength[2];
            }
            values.push(valueItem);
        }

        result.data.values = values;
        result.data.lengthByte = bytes[i++];

        let spacingUnitUnit;
        switch((bytes[i] & 0b00110000) >> 4) {
            case 0:
                spacingUnitUnit = "seconds";
            case 1:
                spacingUnitUnit = "minutes";
            case 2:
                spacingUnitUnit = "hours";
            case 3:
                spacingUnitUnit = "days";
            default:
                result.errors.push("Unknown spacing unit");
                spacingUnitUnit = "unknown";
        }

        result.data.spacingUnit = {
            changeType: (bytes[i] & 0b11000000) >> 6 === 0b01 ? "positive difference" : result.errors.push("Unknown spacing change type"),
            unit: spacingUnitUnit,
            recordSize: bytes[i] & 0b00001111
        };
        i++;
        result.data.spacing = bytes[i];
        result.data.payloadType = "Configuration parameters";
    }
    else if(fPort === 103) {
        bytes = input.bytes;



        result.data.payloadType = "Device alarms";
    }
    

    return result;

}


exports.decodeUplink = decodeUplink;