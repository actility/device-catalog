function decodeUplink(input) {
    var result = {};
    var result = Decoder(input.bytes, input.fPort);
    return result;
}


function Decoder(bytes, port) {
    var decoded = {};

    for (var i = 0; i < bytes.length; ) {
        var channel_id = bytes[i++];
        var channel_type = bytes[i++];
        // BATTERY
        if (channel_id === 0x01 && channel_type === 0x75) {
            decoded.battery = bytes[i];
            i += 1;
        }
        // DOOR / WINDOW STATE
        else if (channel_id === 0x03 && channel_type === 0x00) {
            decoded.state = bytes[i] === 0 ? "close" : "open";
            i += 1;
        }
        //
        else if (channel_id === 0x04 && channel_type === 0x00) {
            decoded.install = bytes[i] === 0 ? "yes" : "no";
            i += 1;
        } else {
            break;
        }
    }

    return decoded;
}

function extractPoints(input) {
    let result = {};
    let elements = input.message.volumes;
    if (typeof elements !== "undefined") {
        result.volume = [];
        elements.forEach(element => {
            result.volume.push({
                eventTime: element.time,
                value: element.volume
            })
        });
    }
    return result;
}




exports.decodeUplink = decodeUplink;
exports.extractPoints = extractPoints;