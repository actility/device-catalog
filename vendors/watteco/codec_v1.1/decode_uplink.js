/**
 * Standard and batch decoding modules.
 */
const standard = require("./standard.js");
const batch = require("./batch.js");

/**
 * Recursively sorts the keys of an object alphabetically.
 * This function addedto avoid "order" issues in the output data when examples are tested accross different js platforms
 *
 * @param {Object|Array} obj - The object or array to sort.
 * @returns {Object|Array} - The sorted object or array.
 */
function sortObject(obj) {
    // If the input is null or not an object, return it as is.
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    // If the input is an array, recursively sort each element.
    if (Array.isArray(obj)) {
        return obj.map(sortObject);
    }

    // For objects, sort the keys alphabetically and recursively sort nested objects.
    return Object.keys(obj).sort().reduce((acc, key) => {
        acc[key] = sortObject(obj[key]); // Recursively sort the value.
        return acc;
    }, {});
}

/**
 * Ensures the given parameter conforms to the TS013 "data" field specification.
 *
 * @param {*} param - The input data of any type.
 * @returns {Object} - A standardized object conforming to TS013 specifications.
 */
function anyToObj(param) {
    if (param === null || param === undefined) return {}; 
    if (Array.isArray(param)) return { samples: param };
    if (typeof param === 'object') return param;
    if (typeof param === 'string' || typeof param === 'number') return { value: param };
    return {}; 
}

/**
 * Processes input data to extract the most recent values from samples,
 * Add 'last' sample value directly accessible under data object.
 * ensuring that existing fields are not overwritten.
 * If no samples exist, the input data is returned unchanged.
 *
 * @param {Object} dataContentIn - The input data directly (without a "data" wrapper).
 * @returns {Object} - The processed data with latest sample values added.
 */
function postProcessDataContent(dataContentIn) {
    // Add necessary samples layer in a data object if needed
    const dataContent = anyToObj(dataContentIn);

    // If "samples" does not exist, return dataContent unchanged
    if (!dataContent.samples || !Array.isArray(dataContent.samples)) {
        return dataContent;
    }
    
    // Extract samples
    const samples = dataContent.samples;
    
    // Create an object to store the latest values
    const latestValues = {};
    
    // Iterate through the samples to find the most recent value for each variable
    samples.forEach(sample => {
        if (typeof sample === 'object' && sample.variable && sample.value !== undefined && sample.date) {
            const { variable, value, date } = sample;
            
            // If the variable is not recorded yet or the new date is more recent, update it
            if (!latestValues[variable] || new Date(date) > new Date(latestValues[variable].date)) {
                latestValues[variable] = { value, date };
            }
        }
    });
    
    // Add the latest values to the data object without overwriting existing keys
    const processedData = {};
    for (let key in dataContent) {
        if (dataContent.hasOwnProperty(key)) {
            processedData[key] = dataContent[key];
        }
    }
    for (let key in latestValues) {
        if (latestValues.hasOwnProperty(key) && !processedData.hasOwnProperty(key)) {
            processedData[key] = latestValues[key].value;
        }
    }

    
    return processedData;
    // return sortObject(processedData); /* TODO: Evaluate if this could solve the problem of order in the output data in TTN Automatised Tests */
}

/**
 * Decodes uplink messages from Watteco devices and processes the payload data.
 *
 * @param {Object} input - The uplink message containing bytes, fPort, and recvTime.
 * @param {Array} batch_parameters - Parameters for batch decoding.
 * @param {Object} endpoint_parameters - Parameters for endpoint normalization.
 * @returns {Object} - The decoded data with potential warnings or errors.
 */
function watteco_decodeUplink(input, batch_parameters, endpoint_parameters, TIC_Decode=null) {
    let bytes = input.bytes;
    let port = input.fPort;

    // Avoid non valid recvTime. Saw on multitech mPowerEdge Conduit AP, firmware 7.0.0
    if (! input.recvTime) {
        input.recvTime = (new Date()).toISOString();
    }
    let date = input.recvTime;
    
    try {
        let decoded = standard.normalisation_standard(input, endpoint_parameters, TIC_Decode)
        let payload = decoded.payload;
        
        if (decoded.type === "batch") {
            let batchInput = {
                batch1: batch_parameters[0],
                batch2: batch_parameters[1],
                payload: payload,
                date: date,
            }
            
            try {
                let decoded = batch.normalisation_batch(batchInput);
                return {
                    data: postProcessDataContent(decoded),
                    warnings: [],
                };
            } catch (error) {
                return {
                    errors: error.message,
                    warnings: [],
                };
            }
        } else {
            return {
                data: postProcessDataContent(decoded.data),
                warnings: decoded.warning,
            };
        }
    } catch (error) {
        return {
            errors: error.message,
            warnings: [],
        };
    }
}

/**
 * Exports the Watteco uplink decoder function.
 */
module.exports = {
    watteco_decodeUplink: watteco_decodeUplink,
}