var decoder = require('./decoder_vb_rev-12.js');
var encoder = require('./encoder_vb_rev-10.js');

function decodeUplink(input) {
  return decoder.decodeUplink(input);
}

function encodeDownlink(input) {
  return encoder.encodeDownlink(input);
}

function decodeDownlink(input) {
  return { errors: ['Not implemented'] };
}

function Decode(fPort, bytes) {
  return decoder.Decode(fPort, bytes);
}

function Decoder(bytes, fPort) {
  return decoder.Decoder(bytes, fPort);
}

function DecodeHexString(fPort, hexString) {
  return decoder.DecodeHexString(fPort, hexString);
}

function Encode(fPort, obj) {
  return encoder.Encode(fPort, obj);
}

function Encoder(obj, fPort) {
  return encoder.Encoder(obj, fPort);
}

if (typeof exports !== 'undefined') {
  exports.decodeUplink = decodeUplink;
  exports.encodeDownlink = encodeDownlink;
  exports.decodeDownlink = decodeDownlink;
  exports.Decode = Decode;
  exports.Decoder = Decoder;
  exports.DecodeHexString = DecodeHexString;
  exports.Encode = Encode;
  exports.Encoder = Encoder;
}
