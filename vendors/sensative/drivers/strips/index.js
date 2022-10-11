const translator = require('./strips-translate');

const transformTable = {
    // Indexed by result's value
    CheckInConfirmed:        { func: (r,o,t)=>{ r.version=o.version; r.idddata = o.idddata; } },
    EmptyReport:             { func: (r,o,t)=>{ }},
    BatteryReport:           { func: (r,o,t)=>{r.battery=o.value} },
    IRProximityReport:       { func: (r,o,t)=>{r.proximity=o.value } },
    PresenceReport:          { func: (r,o,t)=>{r.presence=o.value } },
    IRCloseProximityReport:  { func: (r,o,t)=>{r.closeProximity=o.value} },
    CloseProximityAlarm:     { func: (r,o,t)=>{r.closeProximityAlarm=o.value} },
    DisinfectAlarm:          { func: (r,o,t)=>{r.disinfectAlarm=o.value } },
    statusCode:              { func: (r,o,t)=>{r.statusCode=o.value; r.statusText=o.status}}, 
};

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

// I am confused over the function of this function...
function extractPoints(input) {
    let result = {}
    let message = input.message;
    const time = new Date(input.time);
    for (const key in message) {
        if (transformTable.hasOwnProperty(key)) {
            let transform = transformTable[key];
            transform.func(result, message[key], time);
        } else {
            if (hiddenFields.hasOwnProperty(key))
                continue;
            else
                throw new Error("The message contained '" + key + "' which is currently not supported for point transformation.");
        }
    }
    return result;
}

exports.decodeUplink   = decodeUplink;
exports.decodeDownlink = decodeDownlink;
exports.encodeDownlink = encodeDownlink;
exports.extractPoints  = extractPoints;
