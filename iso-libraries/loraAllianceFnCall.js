function getDriverEngineResult() {
    const drv =
        (typeof driver !== 'undefined') ? driver :
            (typeof exports !== 'undefined' && typeof exports.driver !== 'undefined') ? exports.driver :
                (typeof exports !== 'undefined' && typeof exports.decodeUplink === 'function') ? exports :
                    null;

    let fn = null;

    if (drv) {
        if (operation === 'decodeUplink' && typeof drv.decodeUplink === 'function') {
            fn = drv.decodeUplink(input);
        } else if (operation === 'decodeDownlink' && typeof drv.decodeDownlink === 'function') {
            fn = drv.decodeDownlink(input);
        } else if (operation === 'encodeDownlink' && typeof drv.encodeDownlink === 'function') {
            fn = drv.encodeDownlink(input);
        } else {
            throw new Error(`Unsupported operation ${operation}`);
        }
    } else {
        if (operation === 'decodeUplink') {
            if (typeof exports !== 'undefined' && typeof exports.decodeUplink === 'function') {
                fn = exports.decodeUplink(input);
            } else if (typeof decodeUplink === 'function') {
                fn = decodeUplink(input);
            }
        } else if (operation === 'decodeDownlink') {
            if (typeof exports !== 'undefined' && typeof exports.decodeDownlink === 'function') {
                fn = exports.decodeDownlink(input);
            } else if (typeof decodeDownlink === 'function') {
                fn = decodeDownlink(input);
            }
        } else if (operation === 'encodeDownlink') {
            if (typeof exports !== 'undefined' && typeof exports.encodeDownlink === 'function') {
                fn = exports.encodeDownlink(input);
            } else if (typeof encodeDownlink === 'function') {
                fn = encodeDownlink(input);
            }
        }

        if (fn === null) {
            throw new Error(`Unsupported operation ${operation} on fallback context`);
        }
    }

    if (typeof fn !== 'object') {
        throw new Error(`Unexpected result type for operation ${operation}`);
    }

    return fn;
}
