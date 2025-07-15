// Version 0.0.2
// Changelog
//
// 0.0.2 - 2024-09-24
// - Added support for Coils and do not return NaN in some cases.
 
function readVersion(bytes) {
    if (bytes.length<3) {
        return null;
    }
    return "v" + bytes[0] + "." + bytes[1] + "." + bytes[2];
}
   
function int40_BE(bytes, idx) {
    bytes = bytes.slice(idx || 0);
    return bytes[0] << 32 |
        bytes[1] << 24 | bytes[2] << 16 | bytes[3] << 8 | bytes[4] << 0;
}
   
function int16_BE(bytes, idx) {
    bytes = bytes.slice(idx || 0);
    return bytes[0] << 8 | bytes[1] << 0;
}
   
function uint16_BE(bytes, idx) {
    bytes = bytes.slice(idx || 0);
    return bytes[0] << 8 | bytes[1] << 0;
}
   
function port1(bytes) {
    return {
        "port":1,
        "version":readVersion(bytes),
        "flags":bytes[3],
        "temp": int16_BE(bytes, 4) / 10,
        "vBat": int16_BE(bytes, 6) / 1000,
        "timestamp": int40_BE(bytes, 8),
        "operationMode": bytes[13],
        "noData": !!(bytes[3] & 0x01)
    };
}
   
function port2(bytes) {
    var regs = [];
    if (bytes.length > 5) {
        // loop through data packs
        var b = bytes.slice(5);
        while (b.length>=4) {
            var r = {
                "device":b[0],
                "register":int16_BE(b, 1),
                "count":b[3] & 0x3f,
                "error":!!(b[3]>>7),
                "data":null
            };
            var dataLen = r["count"]*2;
            if (b.length >= dataLen+4) {
                r["data"] = b.slice(4, 4 + dataLen);
            }
            regs.push(r);
            b = b.slice(4+dataLen);
        }
    }
    return {
        "port":2,
        "timestamp": int40_BE(bytes, 0),
        "registers": regs
    };
}
   
function modbusErrorString(code) {
    // Modbus exception codes
    // see https://en.wikipedia.org/wiki/Modbus#Exception_responses
    switch (code) {
        case 1:
            return "Illegal Function";
        case 2:
            return "Illegal Data Address";
        case 3:
            return "Illegal Data Value";
        case 4:
            return "Slave Device Failure";
        case 5:
            return "Acknowledge";
        case 6:
            return "Slave Device Busy";
        case 7:
            return "Negative Acknowledge";
        case 8:
            return "Memory Parity Error";
        case 10:
            return "Gateway Path Unavailable";
        case 11:
            return "Gateway Target Device Failed to Respond";
        default:
            return "Unknown error code";
    }
}
   
function parseModbusPayloadRegisters(payload) {
    if (payload.length < 1) {
        return null;
    }
    var byteCnt = payload[0];
    if (payload.length !== byteCnt + 1) {
        return null;
    }
    var fun = payload[1] & 0xf;
    var vals = [];
     
    if (fun == 0x01) {
      // Coils
      for (var i=0; i<byteCnt; i++) {
        vals.push(+payload[i+1])
      }
    } else {
      // 2 Byte Registers
      for (var i=0; i<byteCnt; i+=2) {
        vals.push([+payload[i+1], +payload[i+2]])
      }
    }
 
    return vals;
   
}
function parseModbusResponse(raw) {
    var resp = {};
    if (raw.length >= 6) {
        var fun = raw[1] & 0xf;
        var error = !!(raw[1] & 0x80);
        var rawResp = raw.slice(0, raw.length - 3);
        resp["slave"] = raw[0];
        resp["function"] = fun;
        resp["error"] = error;
        resp["start"] = uint16_BE(raw, raw.length - 3);
        resp["cnt"] = raw[raw.length - 1];
        resp["raw"] = rawResp;
        if (error) {
            resp["errorCode"] = raw[2];
            resp["errorText"] = modbusErrorString(raw[2]);
        } else {
           resp["values"] = parseModbusPayloadRegisters(rawResp.slice(2))
        }
    }
    return resp;
}
   
function FullResponses(bytes, port) {
    var timestamp = int40_BE(bytes);
    var pos = 5;
    var resps = [];
    while (pos < bytes.length) {
        var respLen = bytes[pos++];
        if (bytes.length >= pos + respLen) {
            var rawResponse = bytes.slice(pos, pos + respLen);
            resps.push(parseModbusResponse(rawResponse));
            pos += respLen;
        } else {
            break;
        }
    }
    return {
        "port": port,
        "timestamp" : timestamp,
        "responses": resps
    };
}
   
function bin2String(array) {
    var result = "";
    for (var i = 0; i < array.length; i++) {
        result += String.fromCharCode(array[i]);
    }
    return result;
}
   
function ConfigResponse(data) {
    var t = bin2String(data);
    return {
        "response" : t,
        "error" : (t.length === 0) || (t[0] === '!')
    }
}
   
/**
 * TTN decoder function.
 */
function Decoder(bytes, port) {
    switch (port) {
        case 1:
            // Status message:
            return port1(bytes);
        case 2:
            // not legacy format:
            return port2(bytes);
        case 3:
        case 4:
            // v1.0.0 format, full modbus responses:
            return FullResponses(bytes, port);
        case 5:
            // continuation of previous response:
            return {};
        case 6:
            // dense format with prefixed timestamp:
            return {};
        case 7:
            // dense format without timestamp:
            return {};
        case 128:
            return ConfigResponse(bytes);
    }
    return {"error":"invalid port", "port":port};
}

exports.Decoder = Decoder;