function getDriverEngineResult(){
  if(typeof driver === 'undefined' || typeof driver.Decode !== 'function'){
    if (operation === 'decodeUplink') {
      return Decode(input.fPort, input.bytes);
    }
    else if (operation === 'encodeDownlink' && typeof Encode === 'function') {
      return Encode(input.fPort, input.data);
    } else {
      throw new Error(`Unsupported operation ${operation} on chirpstack driver`);
    }
  }
  else{
    if (operation === 'decodeUplink') {
      return driver.Decode(input.fPort, input.bytes);
    }
    else if (operation === 'encodeDownlink' && typeof driver.Encode === 'function') {
      return driver.Encode(input.fPort, input.data);
    } else {
      throw new Error(`Unsupported operation ${operation} on chirpstack driver`);
    }
  }
}