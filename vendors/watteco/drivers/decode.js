const standard = require("./standard.js");
const batch = require("./batch.js");

function watteco_decodeUplink(input, batch_parameters, endpoint_parameters) {
    let bytes = input.bytes;
    let port = input.fPort;
    let date = input.recvTime;

    try {
        let decoded = standard.normalisation_standard(input, endpoint_parameters)
        let payload = decoded.payload;
        if (decoded.type === "batch") {
            let batchInput = {
                batch1: batch_parameters[0],
                batch2: batch_parameters[1],
                payload: payload,
                date: date,
            }
            try {
                let decoded = batch.normalisation_batch(batchInput)
                return {
                    data: decoded,
                    warnings: [],
                }
            } catch (error) {
                return {
                    error: error.message,
                    warnings: [],
                }
            }
        } else {
            return {
                data: decoded.data,
                warnings: decoded.warning,
            };
        }
    } catch (error) {
        return {
            error: error.message,
            warnings: [],
        };
    }
}
module.exports = {
    watteco_decodeUplink: watteco_decodeUplink,
}
