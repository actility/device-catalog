
function UintToInt(Uint, Size) {
    if (Size < 1 || Size > 4) {
        throw new Error("Unsupported Size");
    }

    if ((Size === 1) && ((Uint & 0x80) > 0)) {
        Uint -= 0x100;
    } else if ((Size === 2) && ((Uint & 0x8000) > 0)) {
        Uint -= 0x10000;
    } else if ((Size === 3) && ((Uint & 0x800000) > 0)) {
        Uint -= 0x1000000;
    } else if ((Size === 4) && ((Uint & 0x80000000) > 0)) {
        Uint -= 0x100000000;
    }

    return Uint;
}

function Bytes2Float32(bytes_in,Starti1=0) {
    let bytes = (bytes_in[Starti1] << 24) | (bytes_in[Starti1 + 1] << 16) | (bytes_in[Starti1 + 2] << 8) | (bytes_in[Starti1 + 3]);
    const sign = (bytes & 0x80000000) ? -1 : 1;
    let exp = ((bytes >> 23) & 0xFF) - 127;
    let signi = (bytes & ~(-1 << 23));
    if (exp === 128) return sign * ((signi) ? Number.NaN : Number.POSITIVE_INFINITY);
    if (exp === -127) {
        if (signi === 0) return 0;
        exp = -126;
        signi /= (1 << 23);
    } else {
        signi = (signi | (1 << 23)) / (1 << 23);
    }
    return sign * signi * Math.pow(2, exp);
}

function BytesToInt64(InBytes, Starti1, Type, LiEnd) {
    if(typeof(LiEnd) == "undefined") {
        LiEnd = false;
    }
    const Signed  = (Type.substr(0,1) != "U");
    const BytesNb = parseInt(Type.substr(1,2), 10)/8;
    let inc, start;
    let nb = BytesNb;
    if (LiEnd)
    {
        inc = -1;
        start = Starti1 + BytesNb - 1;
    } else {
        inc =  1; 
        start = Starti1 ;
    }
    let tmpInt64 = 0;
    for (let j=start; nb > 0;(j+=inc,nb--))
    {
        tmpInt64 = (tmpInt64 << 8) + InBytes[j];
    }
    if ((Signed) && (BytesNb < 8) && (InBytes[start] & 0x80))
        tmpInt64 = tmpInt64 - (0x01 << (BytesNb * 8));
    return tmpInt64;
}

function decimalToHex(d, pad) {
    let hex = d.toString(16).toUpperCase();
    pad = pad ?? 2;
    while (hex.length < pad) {
        hex = "0" + hex;
    }
    return "0x" + hex;
}
//TODO: Never used ?
/*
function parseHexString(str) {
    let result = [];
    while (str.length >= 2) {
        result.push(parseInt(str.substring(0, 2), 16));
        str = str.substring(2, str.length);
    }
    return result;
}
*/

/**
 * 
 * @param {*} num 
 * @param {number} places 
 * @returns 
 */
function zeroPad(num, places) {
    let str = String(num);
    while (str.length < places) {
        str = "0" + str;
    }
    return str;
}

function BytesToHexStr(InBytes)
{
    let HexStr = "";
    for (let j=0; j < InBytes.length; j++)
    {
        let tmpHex = InBytes[j].toString(16).toUpperCase();
        if (tmpHex.length === 1) tmpHex = "0" + tmpHex;
        HexStr += tmpHex;
    }
    return HexStr;
}
module.exports ={ UintToInt, Bytes2Float32, BytesToInt64, decimalToHex, zeroPad,BytesToHexStr };
