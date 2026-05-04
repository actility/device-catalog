/*
 * ------------------------------------------------------------
 * microPIMS LoRaWAN codec
 * Maintainer: Actility
 * ------------------------------------------------------------
 */

function unsigned16(bytes, offset) {
  return ((bytes[offset] & 0xff) << 8) | (bytes[offset + 1] & 0xff);
}

function signed16(bytes, offset) {
  const value = unsigned16(bytes, offset);
  return value > 0x7fff ? value - 0x10000 : value;
}

function unsigned24(bytes, offset) {
  return ((bytes[offset] & 0xff) << 16) | ((bytes[offset + 1] & 0xff) << 8) | (bytes[offset + 2] & 0xff);
}

function decodeStatus(statusWord) {
  return {
    raw: statusWord,
    batteryPercentage: Math.round((((statusWord >> 12) & 0x0f) / 15) * 100),
    signalStrength: Math.round((((statusWord >> 8) & 0x0f) / 15) * 100),
    thicknessError: ((statusWord >> 7) & 0x01) === 1,
    temperatureError: ((statusWord >> 6) & 0x01) === 1,
    negative5VSupplyOutOfTolerance: ((statusWord >> 5) & 0x01) === 1,
    positive5VSupplyOutOfTolerance: ((statusWord >> 4) & 0x01) === 1,
    positive1V2SupplyOutOfTolerance: ((statusWord >> 3) & 0x01) === 1,
  };
}

function decodeTnT(payload) {
  if (payload.length < 9) {
    throw new Error("TnT payload must contain at least 9 bytes");
  }

  const calculatedThicknessCounts = unsigned24(payload, 0);
  const materialTemperatureCounts = signed16(payload, 3);
  const dsiTemperatureCounts = signed16(payload, 5);
  const statusWord = unsigned16(payload, 7);

  return {
    calculatedThickness: calculatedThicknessCounts / 1000,
    materialTemperature: materialTemperatureCounts / 16,
    dsiTemperature: dsiTemperatureCounts / 100,
    status: decodeStatus(statusWord),
  };
}

function decodeUplink(input) {
  const result = {
    data: {},
    warnings: [],
    errors: [],
  };

  try {
    if (!input || !Array.isArray(input.bytes)) {
      throw new Error("Input bytes are missing");
    }

    if (input.bytes.length < 2) {
      throw new Error("Payload too short: missing packet header");
    }

    const bytes = input.bytes;
    const readingNumber = bytes[0] & 0xff;
    const headerByte = bytes[1] & 0xff;
    const isFirstPacket = (headerByte & 0x80) === 0x80;
    const packetCounter = headerByte & 0x7f;
    const payload = bytes.slice(2);

    result.data.readingNumber = readingNumber;
    result.data.header = {
      isFirstPacket,
      packetCounter,
      fPort: input.fPort,
    };

    if (payload.length === 9) {
      result.data.messageType = "thicknessAndTemperature";
      result.data = {
        ...result.data,
        ...decodeTnT(payload),
      };
    } else if (payload.length > 0 && payload[0] === 0xa0) {
      result.data.messageType = "uTEMP";
      result.warnings.push("uTEMP payload detected. microPIMS decoding only partially implemented for this format.");
    } else if (payload.length > 0 && payload[0] >= 0x80) {
      result.data.messageType = "ascanOrVersionedFrame";
      result.warnings.push("ASCAN/versioned payload detected. Complete multi-packet reassembly is not handled by this stateless decoder.");
    } else {
      result.data.messageType = "unknown";
      result.warnings.push("Unable to classify payload. Expected 9-byte TnT payload after 2-byte packet header.");
    }
  } catch (error) {
    result.errors.push(error.message || String(error));
    delete result.data;
  }

  return result;
}

function Decoder(bytes, fPort) {
  try {
    const decoded = decodeUplink({ bytes, fPort });
    return decoded.data || null;
  } catch (error) {
    return null;
  }
}


exports.decodeUplink = decodeUplink;
exports.Decoder = Decoder;
