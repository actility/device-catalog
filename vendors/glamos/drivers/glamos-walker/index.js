function Decoder(bytes, port) {

    // Decode an uplink message from a buffer (array) of bytes to an object of fields.

    //Decoder for GLAMOS Walker device.

    var decoded = {};

    if (bytes.length < 6 || port != 1) {

        decoded.latitude = 0.0;

        decoded.longitude = 0.0;

        decoded.altitude = 0;

        decoded.ant = 0;

        decoded.accuracy = 3;

        decoded.position_num = 1;

    } else {

        // GPS latitude

        decoded.latitude = ((bytes[0] << 16) >>> 0) + ((bytes[1] << 8) >>> 0) + bytes[2];

        decoded.latitude = (decoded.latitude / 16777215.0 * 180) - 90;

        decoded.latitude = +decoded.latitude.toFixed(7);


        // GPS latitude

        decoded.longitude = ((bytes[3] << 16) >>> 0) + ((bytes[4] << 8) >>> 0) + bytes[5];

        decoded.longitude = (decoded.longitude / 16777215.0 * 360) - 180;

        decoded.longitude = +decoded.longitude.toFixed(7);


        if ((Math.abs(decoded.latitude) < 0.00001) && (Math.abs(decoded.longitude) < 0.000015)) {

            decoded.latitude = 0.0;

            decoded.longitude = 0.0;

        }

// GPS altitude

        if (bytes.length >= 8) {

            var altValue = ((bytes[6] << 8) >>> 0) + bytes[7];

            var sign = bytes[6] & (1 << 7);

            if (sign) {

                decoded.altitude = 0xFFFF0000 | altValue;

            } else {

                decoded.altitude = altValue;

            }

        } else {

            decoded.altitude = 0;

        }

        decoded.accuracy = 3;

// antenna index

        if (bytes.length >= 9)

            decoded.ant = bytes[8];

        else

            decoded.ant = 0;

// position index

        if (bytes.length >= 10)

            decoded.position_num = bytes[9];

        else

            decoded.position_num = 1;

    }

    return decoded;

}

function decodeUplink(input){
    return {
        data: Decoder(input.bytes, input.fPort),
        errors: [],
        warnings: []
    };
}

exports.decodeUplink = decodeUplink;