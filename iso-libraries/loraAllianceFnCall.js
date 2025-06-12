function getDriverEngineResult(){
    let fn = null;

    if(typeof driver === 'undefined' || typeof driver?.decodeUplink !== 'function'){
        if(operation === 'decodeUplink') {
            if(exports?.decodeUplink !== null && typeof exports.decodeUplink === 'function') {
                fn = exports.decodeUplink(input);
            }
            else if(decodeUplink !== null && typeof decodeUplink === 'function') {
                fn = decodeUplink(input);
            }
        }
        
        if(operation === 'encodeDownlink') {
            if(exports?.encodeDownlink !== null && typeof exports.encodeDownlink === 'function') {
                fn = exports.encodeDownlink(input);
            }
            else if(typeof encodeDownlink === 'function') {
                fn = encodeDownlink(input);
            }
        }

        if(operation === 'decodeDownlink') {
            if(exports?.decodeDownlink !== null && typeof exports.decodeDownlink === 'function') {
                fn = exports.decodeDownlink(input);
            }
            else if(decodeDownlink !== null && typeof decodeDownlink === 'function') {
                fn = decodeDownlink(input);
            }
        }
    }
    else {
        if(operation === 'decodeUplink') {
            fn = driver.decodeUplink(input);
        }
        else if(operation === 'decodeDownlink' && typeof driver.decodeDownlink === 'function') {
            fn = driver.decodeDownlink(input);
        }
        else if(operation === 'encodeDownlink' && typeof driver.encodeDownlink === 'function') {
            fn = driver.encodeDownlink(input);
        }
    }

    if(typeof fn !== 'object') {
        throw new Error(`Unsupported operation ${operation} on lora-alliance driver`);
    }

    return fn;
}