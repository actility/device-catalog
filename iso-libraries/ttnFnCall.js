function getDriverEngineResult(){
    if(typeof driver === 'undefined' || typeof driver.Decoder !== 'function'){
        if (operation === 'decodeUplink') {
            return Decoder(input.bytes, input.fPort);
        }
        else if (operation === 'encodeDownlink' && typeof Encoder === 'function') {
            return Encoder(input.data, input.fPort);
        } else {
            throw new Error(`Unsupported operation ${operation} on ttn driver`);
        }
    }
    else{
        if (operation === 'decodeUplink') {
            return driver.Decoder(input.bytes, input.fPort);
        }
        else if (operation === 'encodeDownlink' && typeof driver.Encoder === 'function') {
            return driver.Encoder(input.data, input.fPort);
        } else {
            throw new Error(`Unsupported operation ${operation} on ttn driver`);
        }
    }
}