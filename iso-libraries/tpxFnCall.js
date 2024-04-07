function getDriverEngineResult(){
    if(typeof driver === 'undefined' || typeof driver.decodeUplink !== 'function'){
        if (operation === 'decodeUplink') {
            return decodeUplink(input);
        }
        else if (operation === 'decodeDownlink' && typeof decodeDownlink === 'function') {
            return decodeDownlink(input);
        }
        else if (operation === 'encodeDownlink' && typeof encodeDownlink === 'function') {
            return encodeDownlink(input.data);
        } else {
            throw new Error(`Unsupported operation ${operation} on actility driver`);
        }
    }
    else{
        if (operation === 'decodeUplink') {
            return driver.decodeUplink(input);
        }
        else if (operation === 'decodeDownlink' && typeof driver.decodeDownlink === 'function') {
            return driver.decodeDownlink(input);
        }
        else if (operation === 'encodeDownlink' && typeof driver.encodeDownlink === 'function') {
            return driver.encodeDownlink(input.data);
        } else {
            throw new Error(`Unsupported operation ${operation} on actility driver`);
        }
    }
}