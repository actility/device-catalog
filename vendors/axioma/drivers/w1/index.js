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

        // fPort 100 payloads might sometimes be corrupted. Need to check by comparing the network timestamp and the timestamp provided by the payload
        let checkDates = Math.abs(lastLogTimeStamp - new Date(input.recvTime).getTime());
        if(checkDates > 5*12*30*24*60*60*1000) {
            result.errors.push("This payload has been corrupted. Please contact Axioma support.");
            return result;
        }
        
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

        let i = 0;
        while(i < bytes.length - 3) {

            let valueDIF = bytes[i];

            function dataDIFVIF(index) {
                let dataSize = (valueDIF & 0x0F) !== 0x0D ? valueDIF & 0x0F : "variable";

                if(bytes[index+1] === 0xFF && bytes[index+2] === 0x89 && bytes[index+3] === 0x13) return { dataSize: dataSize, length: 4, type: "Current date and time, Unix time" };

                if(bytes[index+1] === 0xFD && bytes[index+2] === 0x17) return { dataSize: dataSize, length: 3, type: "Status byte" };

                if(bytes[index+1] === 0x13) return { dataSize: dataSize, length: 2, type: "Total volume, L" };
                if(bytes[index+1] === 0x93 && bytes[index+2] === 0x3D) return { dataSize: dataSize, length: 2, type: "Total volume, oz" };

                if(bytes[index+1] === 0xFF && bytes[index+2] === 0x89 && bytes[index+3] === 0x13) return { dataSize: dataSize, length: 4, type: "Log date" };
                
                if(bytes[index+1] === 0x93 && bytes[index+2] === 0xBD && bytes[index+3] === 0x1E) return { dataSize: dataSize, length: 4, type: "Historical total volume, oz" };
                if(bytes[index+1] === 0x93 && bytes[index+2] === 0x1E) return { dataSize: dataSize, length: 3, type: "Historical total volume, L" };

                if(bytes[index+1] === 0x93 && bytes[index+2] !== 0xBD) return { dataSize: dataSize, length: 2, type: "Volume at log date, L" };
                if(bytes[index+1] === 0x93) return { dataSize: dataSize, length: 3, type: "Volume at log date, oz" };
            }

            let obj = dataDIFVIF(i);

            let valueItem = {
                dataType: obj.type,
                size: obj.dataSize,
                compactProfile: obj.type.includes("Historical total volume"),
                withStorage: (bytes[i] & 0xF0) === 0x40,
                imperial: obj.type.includes("oz")
            };

            values.push(valueItem);

            i += obj.length;
        }

        i = (bytes.length - 1) - 2;

        result.data.values = values;
        result.data.lengthByte = bytes[i++];

        let spacingUnitUnit;
        switch((bytes[i] & 0b00110000) >> 4) {
            case 0:
                spacingUnitUnit = "seconds";
                break;
            case 1:
                spacingUnitUnit = "minutes";
                break;
            case 2:
                spacingUnitUnit = "hours";
                break;
            case 3:
                spacingUnitUnit = "days";
                break;
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

        let dateData = 0;
        let i = 0;
        for(i ; i < 4 ; i++) {
            dateData <<= 8;
            dateData += bytes[3-i];
        }
        result.data.date = new Date(dateData*1000).toISOString();
        
        let errors = {
            0x00: "NO ERROR",
            0x04: "POWER LOW",
            0x08: "PERMANENT ERROR",
            0x10: "EMPTY PIPE", 
            0x30: "LEAKAGE",
            0xB0: "BURST",
            0x70: "BACKFLOW",
            0x90: "FREEZE"
        }

        result.data.alarmDescription = errors[bytes[i]];

        result.data.payloadType = "Device alarms";
    }
    

    return result;

}


exports.decodeUplink = decodeUplink;