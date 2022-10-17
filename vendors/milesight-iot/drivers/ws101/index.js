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
        // PRESS STATE
        else if (channel_id === 0xff && channel_type === 0x2e) {
            switch (bytes[i]) {
                case 1:
                    decoded.press = "short";
                    break;
                case 2:
                    decoded.press = "long";
                    break;
                case 3:
                    decoded.press = "double";
                    break;
                default:
                    console.log("unsupported");
            }
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