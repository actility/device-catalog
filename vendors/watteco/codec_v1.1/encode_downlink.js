function encodePayload() { 
  return arguments[0]; 
}

function watteco_encodeDownlink(config, input) {
  const output = {
    fPort: 125,
    bytes: [],
    warnings: []
  };

  if (!input || !input.data || Object.keys(input.data).length === 0) {
    output.errors = ["Invalid or empty data object"];
    return output;
  }

  try {
    const dlFrames = config && config.dlFrames ? config.dlFrames : {};
    dlFrames.sendHexFrame = "<sendHexFrame>";
    dlFrames.sendConfirmedMode = "11058004000008<U8:sendConfirmedMode>";
    dlFrames.sendReboot = "1150005000";
    dlFrames.sendFactoryReset = "1150005007";
    dlFrames.sendLoraRetries = "11058004000120<U8:sendLoraRetries>";
    dlFrames.sendLoraRejoin = "1150800400<U16:sendLoraRejoin>"; //minutes

    let commandKey = null;
    for (const key in input.data) {
      if (dlFrames[key]) {
        commandKey = key;
        break;
      }
    }
    
    if (!commandKey) {
      output.errors = ["Unknown command. No matching command found in downlink frames"];
      return output;
    }
    
    if (commandKey === 'sendHexFrame') {
      let hexFrame = input.data.sendHexFrame;

      if (typeof hexFrame !== 'string') {
        output.errors = ["sendHexFrame must be a string"];
        return output;
      }
      
      if (hexFrame.includes(':')) {
        const parts = hexFrame.split(':');
        if (parts.length !== 2) {
          output.errors = ["Invalid sendHexFrame format. Use 'hexdata:port' format"];
          return output;
        }
        
        hexFrame = parts[0];
        const customPort = parseInt(parts[1], 10);
        
        if (isNaN(customPort) || customPort < 1 || customPort > 223) {
          output.errors = ["Port number must be between 1 and 223"];
          return output;
        }
        
        output.fPort = customPort;
      }
  
      if (!/^[0-9A-Fa-f]+$/.test(hexFrame)) {
        output.errors = ["sendHexFrame must be a valid hexadecimal string"];
        return output;
      }
      
      if (typeof hexFrame !== 'string' || !/^[0-9A-Fa-f]+$/.test(hexFrame)) {
        output.errors = ["sendHexFrame must be a valid hexadecimal string"];
        return output;
      }
      
      if (hexFrame.length % 2 !== 0) {
        output.warnings.push("Odd number of hex characters in sendHexFrame");
      }
      
      for (let i = 0; i < hexFrame.length; i += 2) {
        if (i + 1 >= hexFrame.length) break;
        const byte = parseInt(hexFrame.substr(i, 2), 16);
        output.bytes.push(byte);
      }
      return output;
    }
    
    let frameTemplate = dlFrames[commandKey];

    const placeholderRegex = /<([^:>]+)?:?([^>]+)>/g;
    let allPlaceholders = [];
    
    let match;
    while ((match = placeholderRegex.exec(frameTemplate)) !== null) {
      const typeInfo = match[1] || null;
      const placeholder = match[2];
      allPlaceholders.push({ type: typeInfo, name: placeholder });
    }
    
    for (const placeholderObj of allPlaceholders) {
      const placeholder = placeholderObj.name;
      const typeInfo = placeholderObj.type;
      
      let value;
      if (placeholder === commandKey) {
        value = input.data[commandKey];
      } else if (input.data[placeholder] !== undefined) {
        value = input.data[placeholder];
      } else {
        output.errors = [`Missing required parameter: ${placeholder}`];
        return output;
      }
      
      let hexValue;
      if (typeof value === 'boolean') {
        hexValue = value ? '01' : '00';
      } else if (typeof value === 'number') {
        if (!typeInfo) {
          hexValue = value.toString(16);
          if (hexValue.length % 2 !== 0) {
            hexValue = '0' + hexValue; // Ajoute un zéro si la longueur est impaire
          }
        } else if (typeInfo === 'U8') {
          if (value < 0 || value > 255) {
            output.warnings.push(`Value ${value} out of range for U8, truncating`);
          }
          hexValue = (value & 0xFF).toString(16);
          while (hexValue.length < 2) {
            hexValue = '0' + hexValue;
          }
        } else if (typeInfo === 'U16') {
          if (value < 0 || value > 65535) {
            output.warnings.push(`Value ${value} out of range for U16, truncating`);
          }
          hexValue = (value & 0xFFFF).toString(16);
          while (hexValue.length < 4) {
            hexValue = '0' + hexValue;
          }
        } else if (typeInfo === 'U32') {
          if (value < 0) {
            output.warnings.push(`Negative value ${value} for unsigned type U32, converting to 0`);
            value = 0;
          }
          hexValue = Math.min(value, 0xFFFFFFFF).toString(16);
          while (hexValue.length < 8) {
            hexValue = '0' + hexValue;
          }
        } else {
          output.warnings.push(`Unknown type ${typeInfo}, using default encoding`);
          hexValue = value.toString(16);
          if (hexValue.length % 2 !== 0) {
            hexValue = '0' + hexValue;
          }
        }
      } else {
        output.errors = [`Unsupported type for parameter ${placeholder}: ${typeof value}`];
        return output;
      }

      frameTemplate = frameTemplate.replace(
        typeInfo ? `<${typeInfo}:${placeholder}>` : `<${placeholder}>`, 
        hexValue
      );
    }
    
    for (let i = 0; i < frameTemplate.length; i += 2) {
      if (i + 1 >= frameTemplate.length) {
        output.warnings.push("Odd number of hex characters in template");
        break;
      }
      const byte = parseInt(frameTemplate.substr(i, 2), 16);
      if (isNaN(byte)) {
        throw new Error(`Invalid hex character in template at position ${i}`);
      }
      output.bytes.push(byte);
    }

  } catch (error) {
    output.errors = [`Encoding error: ${error.message}`];
    return output;
  }
  return output;
}

module.exports = {
  watteco_encodeDownlink: watteco_encodeDownlink,
  encodePayload: encodePayload
}