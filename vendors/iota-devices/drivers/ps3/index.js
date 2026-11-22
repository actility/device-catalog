/* IOTA PS3 payload codec - draft, firmware 1D600C */
var REPORTS = [1, 4, 6, 12, 24, 48, 96, 120];
var AVERAGES = [1, 2, 4, 8, 16, 32];
function read16(b, i) { return b[i] * 256 + b[i + 1]; }
function pressure(b, i, scale) {
  var raw = read16(b, i);
  var out = { raw: raw, disconnected: raw === 65535 };
  if (!out.disconnected && typeof scale === 'number' && isFinite(scale) && scale > 0) {
    out.mbar = (raw - 32768) * scale;
  }
  return out;
}
function decodeUplink(input) {
  var b = input.bytes || [];
  if (!Array.isArray(b) || b.some(function(x){return !Number.isInteger(x) || x < 0 || x > 255;})) return { errors: ['Invalid uplink bytes'] };
  if (input.fPort !== 48) return { errors: ['Expected uplink FPort 48'] };
  var scale = input.variables && input.variables.scaleMbarPerCount;
  var d, i;
  if (b.length === 12) {
    d = { messageType: 'measurement', pressures: [] };
    for (i = 0; i < 12; i += 2) d.pressures.push(pressure(b, i, scale));
    return { data: d };
  }
  if (b.length === 8 || b.length === 6) {
    var offset = b.length === 8 ? 2 : 0;
    d = { messageType: b.length === 8 ? 'startup' : 'daily',
      batteryCode: b[offset],
      firmware: b.slice(offset + 1, offset + 4).map(function (x) { return ('0' + x.toString(16)).slice(-2); }).join('').toUpperCase(),
      reportsPerDay: b[offset + 4],
      measurementsPerValue: b[offset + 5] };
    if (b.length === 8) d.pressure = pressure(b, 0, scale);
    return { data: d };
  }
  return { errors: ['Unsupported payload length: ' + b.length] };
}
function encodeDownlink(input) {
  var d = input.data || {};
  if (REPORTS.indexOf(d.reportsPerDay) < 0) return { errors: ['Unsupported reportsPerDay'] };
  if (AVERAGES.indexOf(d.measurementsPerValue) < 0) return { errors: ['Unsupported measurementsPerValue'] };
  var logical = [d.reportsPerDay, d.measurementsPerValue, 0, 0, 0, 0, 0, 0];
  var hex = logical.map(function (x) { return ('0' + x.toString(16)).slice(-2); }).join('').toUpperCase();
  var bytes = [];
  for (var i = 0; i < hex.length; i++) bytes.push(hex.charCodeAt(i));
  return { fPort: 2, bytes: bytes };
}
if (typeof module !== 'undefined') module.exports = { decodeUplink: decodeUplink, encodeDownlink: encodeDownlink };
