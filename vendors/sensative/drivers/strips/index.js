const translator = require('./strips-translate');

const hiddenFields = {
    historyStart: true,
};

// Full functionality
function transformStripsDecodeDownlinkToActilityFormat(obj) {
    let result = {}
    for (const key in obj) {
        if (typeof(obj[key] === 'object') && obj[key].hasOwnProperty('value')) {
            result[key] = obj[key].value;
        }
    }
    if (obj.hasOwnProperty('cmd') && obj.cmd.hasOwnProperty('name'))
        result.cmd = obj.cmd.name;
    return result;
}

// Full functionality
function transformStripsEncodeDownlinkFromActilityFormat(obj) {
    let transformed = {};
    for (const key in obj) {
        if (key == 'cmd')
            transformed.cmd = { name: obj.cmd };
        else
            transformed[key] = { value: obj[key] };
    }
    const encoding = translator.encodeLoraStripsDownlink(transformed);
    // Now holds { port: number, data: hexadecimal string }
    // Convert the hex string to an array of numbers
    const buffer = Buffer.from(encoding.data, "hex");
    var bytes = [];
    for (let i = 0; i < buffer.length; ++i)
        bytes.push(buffer.readUInt8(i));

    return { fPort: encoding.port, bytes };
}

// Limited functionality primarily due to possible limitation of actility decoder return format (timed offsets appear not to be possible to represent)
function decodeUplink(input) {
    const bytes = input.bytes; // Assumed to be byte array
    const port = parseInt(input.fPort);
    let returned = null;
    switch(port) {
    case 1: 
        returned = translator.decodeLoraStripsUplink(port, bytes); 
        break;
    case 11: 
        returned = translator.decodeLoraStripsUplink(port, bytes); 
        break;
    case 2: throw new Error("This decoder does not support history data.");
    default: throw new Error("This decoder will only decode data points and status codes, not metadata or mac commands.");
    }
    return returned[0];
}

// Full Strips downlink decoder, all functionality
function decodeDownlink(input) {
    const bytes = input.bytes; // Assumed to be byte array
    const port = parseInt(input.fPort);
    return transformStripsDecodeDownlinkToActilityFormat(translator.decodeLoraStripsDownlink(port, bytes));
}

// Full strips downlink encoder, all functionality
function encodeDownlink(input) {
    return transformStripsEncodeDownlinkFromActilityFormat(input);
}

exports.decodeUplink   = decodeUplink;
exports.decodeDownlink = decodeDownlink;
exports.encodeDownlink = encodeDownlink;
exports.extractPoints  = extractPoints;
