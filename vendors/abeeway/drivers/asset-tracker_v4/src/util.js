function convertToByteArray(payload){
    var bytes = [];
    var length = payload.length/2;
    for(var i = 0; i < payload.length; i+=2){
        bytes[i/2] = parseInt(payload.substring(i, i+2),16)&0xFF;
    }
    
    return bytes;
}


function camelToSnake(string) {
       return string.replace(/[\w]([A-Z1-9])/g, function(m) {
           return m[0] + "_" + m[1];
       }).toUpperCase();
   }

   function lengthToHex(length){  
    let hex =0;
	for (let i  =0; i<length; i++)
	{
		hex = hex + Math.pow(2,i)
	}
	//return parseInt(hex,16)
    return hex
}
function twoComplement(num) {
    if (num > 0x7FFFFFFF) {
        num -= 0x100000000;
    }
    return num
}
function convertBytesToString(bytes){
    var payload = "";
    var hex;
    for(var i = 0; i < bytes.length; i++){
        hex = convertByteToString(bytes[i]);
        payload += hex;
    }
    return payload;
}

function convertByteToString(byte){
    let hex = byte.toString(16);
    if (hex.length < 2){
        hex = "0" + hex;
    }
    return hex;
}

function decodeCondensed(value, lo, hi, nbits, nresv) {
    return ((value - nresv / 2) / ( (((1 << nbits) - 1) - nresv) / (hi - lo)) + lo);
}

function convertNegativeInt(value, length) {
    if (value > (0x7F << 8*(length-1))){
        value -= 0x01<< 8*length;
	}
	return value;
}

module.exports = {
    convertToByteArray: convertToByteArray,
    camelToSnake: camelToSnake,
    convertBytesToString: convertBytesToString,
    convertByteToString: convertByteToString,
    decodeCondensed: decodeCondensed,
    convertNegativeInt: convertNegativeInt,
    twoComplement: twoComplement
}