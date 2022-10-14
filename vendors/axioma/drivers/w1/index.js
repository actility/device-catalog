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
    let result = {};

    if (fPort != 100) {
        throw new Error("Invalid fPort!");
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

        result = {
            status: status,
            // lastLogTimeStamp: lastLogTimeStamp,
            lastLogTime: lastLogTime,
            lastVolume: lastVolume,
            // logTimeStamp: logTimeStamp,
            firstLogTime: firstLogTime,
            firstLogVolume: firstLogVolume,
            deltaVolumes: deltaVolumes,
            volumes: volumes
        }
    }

    return result;

}

/**
 * @typedef {Object} EncodedDownlink
 * @property {number[]} bytes - Array of numbers as it will be sent to the device
 * @property {number} fPort - The fPort on which the downlink must be sent
 */

/**
 * Downlink encode
 * @param {Object} input - An object provided by the IoT Flow framework
 * @param {Object} input.message - The higher-level object representing your downlink
 * @returns {EncodedDownlink} The encoded object
 */
function encodeDownlink(input) {}

/**
 * Downlink decode
 * @param {Object} input - An object provided by the IoT Flow framework
 * @param {number[]} input.bytes - Array of numbers as it will be sent to the device
 * @param {number} [input.fPort] - The fPort on which the downlink must be sent
 * @returns {Object} The decoded object
 */
function decodeDownlink(input) {}


exports.decodeUplink = decodeUplink;
exports.decodeDownlink = decodeDownlink;
exports.encodeDownlink = encodeDownlink;