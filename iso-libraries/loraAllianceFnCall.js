function getDriverEngineResult() {
    let drv = null;

    if (typeof driver !== 'undefined') {
        drv = driver;
    } else if (typeof exports !== 'undefined' && typeof exports.driver !== 'undefined') {
        drv = exports.driver;
    } else if (typeof exports !== 'undefined' && (typeof exports.decodeUplink === 'function' || typeof exports.encodeDownlink === 'function' || typeof exports.decodeDownlink === 'function')) {
        drv = exports;
    }

    let result;

    if (drv && typeof drv.decodeUplink === 'function') {
        if (operation === 'decodeUplink') {
            result = drv.decodeUplink(input);
        } else if (operation === 'decodeDownlink' && typeof drv.decodeDownlink === 'function') {
            result = drv.decodeDownlink(input);
        } else if (operation === 'encodeDownlink' && typeof drv.encodeDownlink === 'function') {
            result = drv.encodeDownlink(input);
        } else {
            throw new Error(`Unsupported operation ${operation}`);
        }
    } else {
        if (operation === 'decodeUplink' && typeof decodeUplink === 'function') {
            result = decodeUplink(input);
        } else if (operation === 'decodeDownlink' && typeof decodeDownlink === 'function') {
            result = decodeDownlink(input);
        } else if (operation === 'encodeDownlink' && typeof encodeDownlink === 'function') {
            result = encodeDownlink(input);
        } else {
            throw new Error(`Unsupported operation ${operation} on fallback context`);
        }
    }

    if (typeof result !== 'object') {
        throw new Error(`Unexpected result type for operation ${operation}`);
    }

    return result;
}
