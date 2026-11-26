/* IOTA PS-3 payload codec, firmware 1D600C, LoRaWAN mode.
 * Written by IOTA Devices (actility/device-catalog PR #296) and completed by Actility from the
 * IOTA PS-3 Payload & Downlink Specification, revision 2026-11-25: battery indication table,
 * pressure scale read from the device setup, downlink decoding. */
var REPORTS = [1, 4, 6, 12, 24, 48, 96, 120];
var AVERAGES = [1, 2, 4, 8, 16, 32];
// Documented probe ranges (bar) and their scale (mbar per count). Other ranges need their scale.
var RANGE_SCALES = { 10: 5, 20: 10 };
// Battery indication: approximate remaining capacity, "above N %" (0xC1 = above 10 % ... 0xC9 = above 90 %).
var BATTERY_MIN = 0xC1;
var BATTERY_MAX = 0xC9;
function read16(b, i) { return b[i] * 256 + b[i + 1]; }
function toNumber(x) {
  var n = typeof x === 'number' ? x : parseFloat(x);
  return isFinite(n) ? n : undefined;
}
// The device does not transmit the range of its detachable probe: the scale comes from the device
// setup (ThingPark X IoT Flow: input.thing.setup) or from device variables (input.variables).
function pressureScale(input) {
  var sources = [input.thing && input.thing.setup, input.variables];
  for (var s = 0; s < sources.length; s++) {
    var src = sources[s];
    if (!src) continue;
    var scale = toNumber(src.scaleMbarPerCount);
    if (scale !== undefined && scale > 0) return scale;
    var range = toNumber(src.pressureRange);
    if (range !== undefined && RANGE_SCALES[range]) return RANGE_SCALES[range];
  }
  return undefined;
}
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
  var scale = pressureScale(input);
  var warnings = [];
  var d, i;
  if (b.length === 12) {
    d = { messageType: 'measurement', pressures: [] };
    for (i = 0; i < 12; i += 2) d.pressures.push(pressure(b, i, scale));
    if (scale === undefined) warnings.push('Pressure range not set: raw counts only');
    return { data: d, warnings: warnings };
  }
  if (b.length === 8 || b.length === 6) {
    var offset = b.length === 8 ? 2 : 0;
    d = { messageType: b.length === 8 ? 'startup' : 'daily',
      batteryCode: b[offset],
      firmware: b.slice(offset + 1, offset + 4).map(function (x) { return ('0' + x.toString(16)).slice(-2); }).join('').toUpperCase(),
      reportsPerDay: b[offset + 4],
      measurementsPerValue: b[offset + 5] };
    if (d.batteryCode >= BATTERY_MIN && d.batteryCode <= BATTERY_MAX) {
      d.batteryLevel = (d.batteryCode - 0xC0) * 10;
    } else {
      warnings.push('Unknown battery code: ' + d.batteryCode);
    }
    if (b.length === 8) {
      d.pressure = pressure(b, 0, scale);
      if (scale === undefined) warnings.push('Pressure range not set: raw counts only');
    }
    return { data: d, warnings: warnings };
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
// LoRaWAN mode: the 8-byte logical configuration travels as 16 ASCII hexadecimal characters.
function decodeDownlink(input) {
  var b = input.bytes || [];
  if (input.fPort !== 2) return { errors: ['Expected downlink FPort 2'] };
  if (b.length !== 16) return { errors: ['Expected 16 ASCII hexadecimal characters, got ' + b.length + ' bytes'] };
  var hex = String.fromCharCode.apply(null, b);
  if (!/^[0-9A-Fa-f]{16}$/.test(hex)) return { errors: ['Invalid ASCII hexadecimal configuration'] };
  var d = { reportsPerDay: parseInt(hex.slice(0, 2), 16), measurementsPerValue: parseInt(hex.slice(2, 4), 16) };
  var warnings = [];
  if (REPORTS.indexOf(d.reportsPerDay) < 0) warnings.push('Unsupported reportsPerDay');
  if (AVERAGES.indexOf(d.measurementsPerValue) < 0) warnings.push('Unsupported measurementsPerValue');
  return { data: d, warnings: warnings };
}
exports.decodeUplink = decodeUplink;
exports.encodeDownlink = encodeDownlink;
exports.decodeDownlink = decodeDownlink;
