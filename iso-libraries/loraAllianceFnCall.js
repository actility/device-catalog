function getDriverEngineResult() {
    const drv =
        (typeof driver !== 'undefined') ? driver :
            (typeof exports !== 'undefined' && typeof exports.driver !== 'undefined') ? exports.driver :
                (typeof exports !== 'undefined' && typeof exports.decodeUplink === 'function') ? exports :
                    null;
    if (!drv) {
        throw new Error("Driver not found in global or exports");
    }

    if (operation === 'decodeUplink' && typeof drv.decodeUplink === 'function') {
        return drv.decodeUplink(input);
    } else if (operation === 'decodeDownlink' && typeof drv.decodeDownlink === 'function') {
        return drv.decodeDownlink(input);
    } else if (operation === 'encodeDownlink' && typeof drv.encodeDownlink === 'function') {
        return drv.encodeDownlink(input);
    } else {
        throw new Error(`Unsupported operation ${operation}`);
    }
}
