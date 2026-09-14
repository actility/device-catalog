/* ==========================================================================
 * Theta DC110-L LoRaWAN driver
 * --------------------------------------------------------------------------
 * Scope: DC series corrosion sensor.
 *   - data blocks listed in section 3.4.5 of the payload specification
 *   - fragmented data blocks used to carry the corrosion waveform
 *     (sections 3.5 and 5.2)
 *
 * Blocks produced by other device families (vibration, tilt, bolt preload,
 * pressure, audio) are not part of this driver.
 *
 * Codec API: LoRa Alliance payload codec API (TS013-1.0.0).
 * ========================================================================== */

(function (root) {
  "use strict";

  var ThetaDecoder = root.ThetaDecoder = root.ThetaDecoder || {};

  var messageTypeNames = {
    0x01: "systemInfo",
    0x02: "heartbeat",
    0x03: "event",
    0x04: "sensorData",
    0x05: "sensorDataQos",
    0x06: "fragmentedData",
    0x21: "rebootResponse",
    0x22: "testResponse",
    0x23: "syncResponse",
    0x25: "getSettingsResponse",
    0x26: "updateSettingsResponse",
    0x27: "restoreSettingsResponse",
    0x28: "resetSensorDataResponse",
    0x29: "getSensorDataResponse",
    0x2A: "calibrateSensorResponse",
    0x39: "temperatureCompensationResponse"
  };

  var messageTypeRegistry = {};
  var typeHandlerRegistry = {};

  function registerMessageType(msgType, handler) {
    messageTypeRegistry[String(msgType)] = handler || null;
  }

  function registerTypeHandler(type, handler) {
    typeHandlerRegistry[String(type)] = handler || null;
  }

  function getMessageTypeHandler(msgType) {
    return messageTypeRegistry[String(msgType)] || null;
  }

  function getTypeHandler(type) {
    return typeHandlerRegistry[String(type)] || null;
  }

  function getMessageTypeName(msgType) {
    return messageTypeNames[msgType] || "";
  }

  ThetaDecoder.registry = {
    registerMessageType: registerMessageType,
    registerTypeHandler: registerTypeHandler,
    getMessageTypeHandler: getMessageTypeHandler,
    getTypeHandler: getTypeHandler,
    getMessageTypeName: getMessageTypeName
  };
})(typeof globalThis === "undefined" ? this : globalThis);


(function (root) {
  "use strict";

  var ThetaDecoder = root.ThetaDecoder = root.ThetaDecoder || {};

  function copyBytes(bytes, start, end) {
    return bytes.slice(start, end);
  }

  function bytesToHex(bytes) {
    var out = "";
    for (var i = 0; i < bytes.length; i++) {
      var h = bytes[i].toString(16).toUpperCase();
      if (h.length === 1) {
        h = "0" + h;
      }
      out += h;
    }
    return out;
  }

  function ByteReader(bytes) {
    this.bytes = Array.isArray(bytes) ? bytes : [];
    this.offset = 0;
  }

  ByteReader.prototype.isEnd = function () {
    return this.offset >= this.bytes.length;
  };

  ByteReader.prototype.canRead = function (len) {
    return this.offset + len <= this.bytes.length;
  };

  ByteReader.prototype.seek = function (offset) {
    this.offset = Math.max(0, Math.min(this.bytes.length, offset));
  };

  ByteReader.prototype.readU8 = function () {
    if (!this.canRead(1)) {
      return null;
    }
    return this.bytes[this.offset++];
  };

  ByteReader.prototype.peekU8 = function () {
    if (!this.canRead(1)) {
      return null;
    }
    return this.bytes[this.offset];
  };

  ByteReader.prototype.readU16LE = function () {
    if (!this.canRead(2)) {
      return null;
    }
    var v = this.bytes[this.offset] | (this.bytes[this.offset + 1] << 8);
    this.offset += 2;
    return v >>> 0;
  };

  ByteReader.prototype.readI16LE = function () {
    var v = this.readU16LE();
    if (v === null) {
      return null;
    }
    return v > 0x7fff ? v - 0x10000 : v;
  };

  ByteReader.prototype.readU32LE = function () {
    if (!this.canRead(4)) {
      return null;
    }
    var v = this.bytes[this.offset] |
      (this.bytes[this.offset + 1] << 8) |
      (this.bytes[this.offset + 2] << 16) |
      (this.bytes[this.offset + 3] << 24);
    this.offset += 4;
    return v >>> 0;
  };

  ByteReader.prototype.readFloat32LE = function () {
    if (!this.canRead(4)) {
      return null;
    }
    var view = new DataView(new ArrayBuffer(4));
    view.setUint8(0, this.bytes[this.offset]);
    view.setUint8(1, this.bytes[this.offset + 1]);
    view.setUint8(2, this.bytes[this.offset + 2]);
    view.setUint8(3, this.bytes[this.offset + 3]);
    this.offset += 4;
    return view.getFloat32(0, true);
  };

  ByteReader.prototype.readBytes = function (len) {
    if (!this.canRead(len)) {
      return null;
    }
    var start = this.offset;
    this.offset += len;
    return copyBytes(this.bytes, start, start + len);
  };

  ByteReader.prototype.readAscii = function (len) {
    if (!this.canRead(len)) {
      return "";
    }
    var s = "";
    for (var i = 0; i < len; i++) {
      s += String.fromCharCode(this.bytes[this.offset++]);
    }
    return s;
  };

  ByteReader.prototype.slice = function (start, len) {
    return copyBytes(this.bytes, start, start + len);
  };

  ThetaDecoder.reader = ThetaDecoder.reader || {};
  ThetaDecoder.reader.ByteReader = ByteReader;
  ThetaDecoder.reader.bytesToHex = bytesToHex;
  ThetaDecoder.reader.copyBytes = copyBytes;
})(typeof globalThis === "undefined" ? this : globalThis);


(function (root) {
  "use strict";

  var ThetaDecoder = root.ThetaDecoder = root.ThetaDecoder || {};

  function getTypePayloadLength(type, reader) {
    if (type >= 0x00 && type <= 0x01) {
      return 0;
    }
    if (type >= 0x02 && type <= 0x1F) {
      return 1;
    }
    if (type >= 0x20 && type <= 0x5F) {
      return 2;
    }
    if (type >= 0x60 && type <= 0x9F) {
      return 4;
    }
    if (type >= 0xA0 && type <= 0xBF) {
      return 6;
    }
    if (type >= 0xC0 && type <= 0xDF) {
      return 12;
    }
    if (type >= 0xE0 && type <= 0xEF) {
      if (!reader || !reader.canRead(1)) {
        return -1;
      }
      return 1 + reader.peekU8();
    }
    if (type >= 0xF0 && type <= 0xFE) {
      if (!reader || !reader.canRead(2)) {
        return -1;
      }
      var len = reader.peekU8() | (reader.slice(reader.offset + 1, 2)[0] << 8);
      return 2 + len;
    }
    if (type === 0xFF) {
      return 0;
    }
    return -1;
  }

  ThetaDecoder.tlv = ThetaDecoder.tlv || {};
  ThetaDecoder.tlv.getTypePayloadLength = getTypePayloadLength;
})(typeof globalThis === "undefined" ? this : globalThis);


(function (root) {
  "use strict";

  var ThetaDecoder = root.ThetaDecoder = root.ThetaDecoder || {};
  var registry = ThetaDecoder.registry;
  var readerNs = ThetaDecoder.reader;

  function pad2(v) {
    return v < 10 ? ("0" + v) : String(v);
  }

  function formatLocalTime(ts) {
    var d = new Date(ts * 1000);
    return d.getFullYear() + "-" +
      pad2(d.getMonth() + 1) + "-" +
      pad2(d.getDate()) + " " +
      pad2(d.getHours()) + ":" +
      pad2(d.getMinutes()) + ":" +
      pad2(d.getSeconds());
  }

  // ---- event decoding (spec 3.3.5, DC series corrosion sensor) ------------
  function getEventTypeName(type) {
    var map = {
      0x10: "temperatureSensorCommunicationFailed",
      0x11: "temperatureReadFailed",
      0x14: "temperatureOverThreshold",
      0x40: "ultrasonicSensorCommunicationFailed",
      0x41: "ultrasonicTemperatureReadFailed",
      0x42: "temperatureCompensationFailed",
      0x43: "ultrasonicAlgorithmError",
      0x44: "ultrasonicTemperatureChangeLarge",
      0x45: "ultrasonicSignalTooSmall",
      0x46: "ultrasonicTimeOfFlightChangeLarge",
      0x47: "ultrasonicScanUnstable",
      0x4A: "thicknessOverThreshold",
      0x4B: "shortPeriodCorrosionRateOverThreshold",
      0x4C: "longPeriodCorrosionRateOverThreshold",
      0x4F: "temperatureCompensationSuccess"
    };
    return map[type] || "";
  }

  function getEventPriorityName(priority) {
    var map = {
      0: "disarmed",
      1: "normal",
      2: "important",
      3: "critical",
      4: "informational"
    };
    return map[priority] || "";
  }

  registry.registerMessageType(0x04, function (data) {
    if (data.msgTypeName === "") {
      data.msgTypeName = "sensorData";
    }
  });

  registry.registerMessageType(0x05, function (data) {
    if (data.msgTypeName === "") {
      data.msgTypeName = "sensorDataQos";
    }
  });

  // ---- system information ------------------------------------------------
  registry.registerTypeHandler(0x60, function (reader, data) {
    var ts = reader.readU32LE();
    data.timestamp = ts;
    data.timestampStr = formatLocalTime(ts);
  });

  registry.registerTypeHandler(0x61, function (reader, data) {
    data.hardwareId = reader.readU32LE();
  });

  registry.registerTypeHandler(0x62, function (reader, data, context) {
    var bytes = reader.slice(context.payloadOffset, context.payloadLength);
    data.firmwareVersion = bytes[0] + "." + bytes[1] + "." + bytes[2] +
      (context.payloadLength >= 4 ? "." + bytes[3] : "");
  });

  registry.registerTypeHandler(0x63, function (reader, data) {
    var ts = reader.readU32LE();
    data.buildTime = ts;
    data.buildTimeStr = formatLocalTime(ts);
  });

  registry.registerTypeHandler(0x64, function (reader, data) {
    data.sessionId = reader.readU32LE();
  });

  registry.registerTypeHandler(0xA0, function (reader, data, context) {
    var bytes = reader.slice(context.payloadOffset, context.payloadLength);
    data.macAddress = readerNs.bytesToHex(bytes);
  });

  registry.registerTypeHandler(0xE1, function (reader, data) {
    var len = reader.readU8();
    data.deviceName = reader.readAscii(Math.max(0, len));
  });

  // ---- common status -----------------------------------------------------
  registry.registerTypeHandler(0x20, function (reader, data) {
    var code = reader.readU16LE();
    var priority = (code >> 13) & 0x07;
    var eventType = code & 0x1fff;
    data.eventPriority = priority;
    data.eventPriorityName = getEventPriorityName(priority);
    data.eventType = eventType;
    data.eventTypeName = getEventTypeName(eventType);
  });

  registry.registerTypeHandler(0x21, function (reader, data) {
    data.batteryVoltageMv = reader.readU16LE();
  });

  registry.registerTypeHandler(0x22, function (reader, data) {
    data.signal = reader.readI16LE();
  });

  registry.registerTypeHandler(0x23, function (reader, data) {
    data.chipTemp = reader.readI16LE() / 10;
  });

  // ---- command response --------------------------------------------------
  // Response code carried by a command response message (0x21, 0x22, 0x23,
  // 0x25 ... 0x2A, 0x39). Signed int8: a negative value means the command
  // failed, and the block is absent when the command succeeded (spec 4.1).
  registry.registerTypeHandler(0x02, function (reader, data) {
    var raw = reader.readU8();
    data.responseCode = raw > 0x7f ? raw - 0x100 : raw;
  });

  // ---- corrosion sensor data (spec 3.4.5) --------------------------------
  registry.registerTypeHandler(0x68, function (reader, data) {
    data.temperature = reader.readFloat32LE();
  });

  registry.registerTypeHandler(0x6A, function (reader, data) {
    data.auxTemperature = reader.readFloat32LE();
  });

  registry.registerTypeHandler(0x6E, function (reader, data) {
    data.thickness = reader.readFloat32LE();
  });

  registry.registerTypeHandler(0x6D, function (reader, data) {
    data.flightTime = reader.readFloat32LE();
  });

  registry.registerTypeHandler(0x2B, function (reader, data) {
    data.corrosionRateShort = reader.readI16LE() * 0.001;
  });

  registry.registerTypeHandler(0x2C, function (reader, data) {
    data.corrosionRateLong = reader.readI16LE() * 0.001;
  });

  registry.registerTypeHandler(0x25, function (reader, data) {
    data.ultrasonicSignalStrength = reader.readU16LE() * 0.1;
  });

  registry.registerTypeHandler(0x26, function (reader, data) {
    data.ultrasonicSignalQuality = reader.readU16LE() * 0.1;
  });

  // ---- fragmented data (spec 3.5 and 5.2) --------------------------------
  //
  // The payload of a fragmented transfer is a byte stream made of a 16 byte
  // header followed by the body. The stream is split across several uplinks.
  //
  //   header: Timestamp(Uint64, ms) | SensorType(Uint32) | BodyInfo(Uint32)
  //   BodyInfo: Version[31:28] | Reserved[27:24] | Length[23:0]
  //   body:    repeated ( MetaLen:1 | DataLen:3 | Meta:MetaLen | Data:DataLen )
  //
  // A fragmented transfer carries one byte stream spread over several uplinks.
  // The driver only exposes the transfer metadata together with the raw
  // fragment bytes; reassembling the stream and decoding the chunk body is
  // left to the application.

  registry.registerTypeHandler(0x9E, function (reader, data) {
    data.packetTotal = reader.readU32LE();
  });

  registry.registerTypeHandler(0x9F, function (reader, data) {
    data.packetIndex = reader.readU32LE();
  });

  registry.registerTypeHandler(0xE2, function (reader, data) {
    var fragmentLen = reader.readU8();
    var fragment = reader.readBytes(Math.max(0, fragmentLen)) || [];
    data.fragmentDataHex = readerNs.bytesToHex(fragment);
    data.fragmentDataLength = fragment.length;
  });
})(typeof globalThis === "undefined" ? this : globalThis);


(function (root) {
  "use strict";

  var ThetaDecoder = root.ThetaDecoder = root.ThetaDecoder || {};
  var registry = ThetaDecoder.registry;
  var readerNs = ThetaDecoder.reader;
  var tlv = ThetaDecoder.tlv;

  function parsePayload(reader, data, input) {
    while (!reader.isEnd()) {
      var typeOffset = reader.offset;
      var type = reader.readU8();
      if (type === null) {
        break;
      }

      if (type === 0xFF) {
        if (!reader.canRead(1)) {
          data.truncatedExtension = true;
          data.truncatedOffset = typeOffset;
          break;
        }
        type = reader.readU8();
      }

      var payloadOffset = reader.offset;
      var payloadLength = tlv.getTypePayloadLength(type, reader);

      if (payloadLength < 0 || !reader.canRead(payloadLength)) {
        data.truncatedType = "0x" + type.toString(16).toUpperCase();
        data.truncatedOffset = typeOffset;
        data.truncatedPayloadOffset = payloadOffset;
        data.payloadLengthExpected = payloadLength;
        break;
      }

      var handler = registry.getTypeHandler(type);
      var context = {
        type: type,
        typeOffset: typeOffset,
        payloadOffset: payloadOffset,
        payloadLength: payloadLength,
        input: input
      };

      if (typeof handler === "function") {
        handler(reader, data, context);
      } else {
        var unknownRaw = reader.slice(payloadOffset, payloadLength);
        if (!data.unknownTypes) {
          data.unknownTypes = [];
        }
        data.unknownTypes.push({
          type: "0x" + type.toString(16).toUpperCase(),
          offset: typeOffset,
          payloadOffset: payloadOffset,
          payloadLength: payloadLength,
          rawHex: readerNs.bytesToHex(unknownRaw),
          rawBytes: unknownRaw
        });
      }

      reader.seek(payloadOffset + payloadLength);
    }
  }

  function decodeUplinkInternal(input) {
    if (!input || !Array.isArray(input.bytes) || input.bytes.length === 0) {
      return { data: {} };
    }

    if (input.fPort !== 1) {
      return { data: {} };
    }

    var bytes = input.bytes;
    var reader = new readerNs.ByteReader(bytes);
    var header = reader.readU8();

    if (header === null) {
      return { data: {} };
    }

    var protocolVersion = (header >> 6) & 0x03;
    var msgType = header & 0x3f;

    var data = {
      protocolVersion: protocolVersion,
      msgType: msgType,
      msgTypeName: registry.getMessageTypeName(msgType) || "unknown",
      payloadLength: bytes.length
    };

    var msgHandler = registry.getMessageTypeHandler(msgType);
    if (typeof msgHandler === "function") {
      msgHandler(data, { input: input });
    }

    parsePayload(reader, data, input);

    return { data: data };
  }

  ThetaDecoder.decodeUplink = decodeUplinkInternal;
})(typeof globalThis === "undefined" ? this : globalThis);


/* ==========================================================================
 * LoRa Alliance Codec API entry point (TS013-1.0.0)
 * --------------------------------------------------------------------------
 * The decoder above is the product codec. This section only adapts it to the
 * { data, errors, warnings } contract expected by ThingPark.
 *
 * NOTE: the `module.exports = {...}` assignment present in the original
 * theta_decoder.js was intentionally removed. It would take precedence over
 * `exports.decodeUplink` below and expose the raw, non-conforming function.
 * ========================================================================== */

// Bound explicitly on purpose. The decoder above attaches itself to the global
// object instead of declaring a module-scope binding, and the repository ESLint
// config (tests/.eslintrc.js -> eslint:recommended) keeps `no-undef` enabled,
// so a bare reference to it would be rejected.
var ThetaDecoder = globalThis.ThetaDecoder;

/**
 * @param {{bytes: number[], fPort: number, recvTime: string}} input
 * @returns {{data?: Object, errors: string[], warnings: string[]}}
 */
function decodeUplink(input) {
    var result = { data: {}, errors: [], warnings: [] };

    if (!input || !Array.isArray(input.bytes) || input.bytes.length === 0) {
        result.errors.push("Invalid uplink payload: empty payload");
        delete result.data;
        return result;
    }

    if (input.fPort !== 1) {
        result.errors.push("Unsupported fPort: " + input.fPort + " (expected 1)");
        delete result.data;
        return result;
    }

    var decoded = ThetaDecoder.decodeUplink(input);
    result.data = decoded.data;

    // Unknown TLV types are not fatal: keep the decoded fields and warn.
    if (result.data.unknownTypes && result.data.unknownTypes.length > 0) {
        result.warnings.push(
            "Unknown TLV type(s) ignored: " + result.data.unknownTypes.length
        );
    }

    // A truncated TLV means the frame is incomplete -> treat as an error.
    if (result.data.truncatedType || result.data.truncatedExtension) {
        result.errors.push(
            "Truncated payload: incomplete TLV at offset " + result.data.truncatedOffset
        );
        delete result.data;
    }

    return result;
}

exports.decodeUplink = decodeUplink;
