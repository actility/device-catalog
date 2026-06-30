var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// ../../device-catalog/vendors/sensative/drivers/strips/strips-translate.js
var require_strips_translate = __commonJS({
  "../../device-catalog/vendors/sensative/drivers/strips/strips-translate.js"(exports2) {
    var decodeU32dec = (n) => {
      return n.toString(10);
    };
    var decodeU32hex = (n) => {
      return "Ox" + n.toString(16);
    };
    function d2h(d, bytes) {
      const size = bytes * 2;
      var hex = Number(d).toString(16);
      if (hex.length > size)
        hex = hex.substring(hex.length - size);
      while (hex.length < size)
        hex = "0" + hex;
      return hex;
    }
    var encodeU32hex = (value) => {
      const n = parseInt(value.substring(2), 16);
      return d2h(n, 4);
    };
    var encodeU32 = (value) => {
      return d2h(value, 4);
    };
    var EMPTY = {
      getsize: (bytes, pos) => 0,
      decode: (bytes, pos) => 0
    };
    var UNSIGN1 = {
      getsize: (bytes, pos) => 1,
      decode: (bytes, pos) => bytes[pos]
    };
    var UNS1FP2 = {
      getsize: (bytes, pos) => UNSIGN1.getsize(bytes, pos),
      decode: (bytes, pos) => UNSIGN1.decode(bytes, pos) / 2
    };
    var UNSIGN2 = {
      getsize: (bytes, pos) => {
        return 2;
      },
      decode: (bytes, pos) => (bytes[pos++] << 8) + bytes[pos]
    };
    var SIGNED2 = {
      getsize: (bytes, pos) => 2,
      decode: (bytes, pos) => (bytes[pos] & 128 ? 65535 << 16 : 0) | bytes[pos++] << 8 | bytes[pos++]
    };
    var SI2FP10 = {
      getsize: (bytes, pos) => SIGNED2.getsize(bytes, pos),
      decode: (bytes, pos) => SIGNED2.decode(bytes, pos) / 10
    };
    var TMPALRM = {
      getsize: (bytes, pos) => 1,
      decode: (bytes, pos) => {
        return { high: !!(bytes[pos] & 1), low: !!(bytes[pos] & 2) };
      }
    };
    var DIGITAL = {
      getsize: (bytes, pos) => 1,
      decode: (bytes, pos) => !!bytes[pos]
    };
    var GIT_IDD = {
      getsize: (bytes, pos) => 8,
      decode: (bytes, pos) => {
        return {
          version: d2h((bytes[pos++] << 24) + (bytes[pos++] << 16) + (bytes[pos++] << 8) + bytes[pos++], 4),
          idddata: d2h((bytes[pos++] << 24) + (bytes[pos++] << 16) + (bytes[pos++] << 8) + bytes[pos++], 4)
        };
      }
    };
    var TEMPHUM = {
      getsize: (bytes, pos) => UNS1FP2.getsize(bytes, pos) + SI2FP10.getsize(bytes, pos + 1),
      decode: (bytes, pos) => {
        return { humidity: { value: UNS1FP2.decode(bytes, pos), unit: "%" }, temp: { value: SI2FP10.decode(bytes, pos + 1), unit: "C" } };
      }
    };
    var TEMPDOR = {
      getsize: (bytes, pos) => 3,
      decode: (bytes, pos) => {
        return { door: { value: DIGITAL.decode(bytes, pos), unit: "bool" }, temp: { value: SI2FP10.decode(bytes, pos + 1), unit: "C" } };
      }
    };
    var STRIPS_SENSOR = {
      BUTTON: 1 << 1,
      BATTERY: 1 << 2,
      TEMP: 1 << 3,
      HUMID: 1 << 4,
      LUX: 1 << 5,
      DOOR: 1 << 6,
      TAMPER: 1 << 7,
      CAP: 1 << 8,
      PROX: 1 << 9
    };
    var STRIPS_REPORTS = {
      CheckInConfirmed: { reportbit: 0, sensors: STRIPS_SENSOR.BUTTON, coding: GIT_IDD, channel: 110, unit: "" },
      EmptyReport: { reportbit: -1, sensors: STRIPS_SENSOR.BUTTON, coding: EMPTY, channel: 0, unit: "" },
      BatteryReport: { reportbit: 1, sensors: STRIPS_SENSOR.BATTERY, coding: UNSIGN1, channel: 1, unit: "%" },
      TempReport: { reportbit: 2, sensors: STRIPS_SENSOR.TEMP, coding: SI2FP10, channel: 2, unit: "C" },
      TempAlarm: { reportbit: 3, sensors: STRIPS_SENSOR.TEMP, coding: TMPALRM, channel: 3, unit: "" },
      AverageTempReport: { reportbit: 4, sensors: STRIPS_SENSOR.TEMP, coding: SI2FP10, channel: 4, unit: "C" },
      AverageTempAlarm: { reportbit: 5, sensors: STRIPS_SENSOR.TEMP, coding: TMPALRM, channel: 5, unit: "" },
      HumidityReport: { reportbit: 6, sensors: STRIPS_SENSOR.HUMID, coding: UNS1FP2, channel: 6, unit: "%" },
      LuxReport: { reportbit: 7, sensors: STRIPS_SENSOR.LUX, coding: UNSIGN2, channel: 7, unit: "Lux" },
      LuxReport2: { reportbit: 8, sensors: STRIPS_SENSOR.LUX, coding: UNSIGN2, channel: 8, unit: "Lux" },
      DoorReport: { reportbit: 9, sensors: STRIPS_SENSOR.DOOR, coding: DIGITAL, channel: 9, unit: "" },
      DoorAlarm: { reportbit: 10, sensors: STRIPS_SENSOR.DOOR, coding: DIGITAL, channel: 10, unit: "" },
      TamperReport: { reportbit: 11, sensors: STRIPS_SENSOR.TAMPER, coding: DIGITAL, channel: 11, unit: "" },
      TamperAlarm: { reportbit: 12, sensors: STRIPS_SENSOR.TAMPER, coding: DIGITAL, channel: 12, unit: "" },
      FloodReport: { reportbit: 13, sensors: STRIPS_SENSOR.CAP, coding: UNSIGN1, channel: 13, unit: "" },
      FloodAlarm: { reportbit: 14, sensors: STRIPS_SENSOR.CAP, coding: DIGITAL, channel: 14, unit: "" },
      FoilAlarm: { reportbit: 15, sensors: STRIPS_SENSOR.CAP, coding: DIGITAL, channel: 15, unit: "" },
      TempHumReport: { reportbit: 16, sensors: STRIPS_SENSOR.TEMP | STRIPS_SENSOR.HUMID, coding: TEMPHUM, channel: 80, unit: "" },
      AvgTempHumReport: { reportbit: 17, sensors: STRIPS_SENSOR.TEMP | STRIPS_SENSOR.HUMID, coding: TEMPHUM, channel: 81, unit: "" },
      TempDoorReport: { reportbit: 18, sensors: STRIPS_SENSOR.TEMP | STRIPS_SENSOR.DOOR, coding: TEMPDOR, channel: 82, unit: "" },
      CapacitanceFloodReport: { reportbit: 19, sensors: STRIPS_SENSOR.CAP, coding: UNSIGN2, channel: 112, unit: "" },
      CapacitancePadReport: { reportbit: 20, sensors: STRIPS_SENSOR.CAP, coding: UNSIGN2, channel: 113, unit: "" },
      CapacitanceEndReport: { reportbit: 21, sensors: STRIPS_SENSOR.CAP, coding: UNSIGN2, channel: 114, unit: "" },
      UserSwitch1Alarm: { reportbit: 22, sensors: STRIPS_SENSOR.TAMPER, coding: DIGITAL, channel: 16, unit: "" },
      DoorCountReport: { reportbit: 23, sensors: STRIPS_SENSOR.DOOR, coding: UNSIGN2, channel: 17, unit: "" },
      PresenceReport: { reportbit: 24, sensors: STRIPS_SENSOR.PROX, coding: DIGITAL, channel: 18, unit: "" },
      IRProximityReport: { reportbit: 25, sensors: STRIPS_SENSOR.PROX, coding: UNSIGN2, channel: 19, unit: "" },
      IRCloseProximityReport: { reportbit: 26, sensors: STRIPS_SENSOR.PROX, coding: UNSIGN2, channel: 20, unit: "" },
      CloseProximityAlarm: { reportbit: 27, sensors: STRIPS_SENSOR.PROX, coding: DIGITAL, channel: 21, unit: "" },
      DisinfectAlarm: { reportbit: 28, sensors: STRIPS_SENSOR.PROX, coding: UNSIGN1, channel: 22, unit: "" }
    };
    var decodeReports = (n) => {
      let result = "";
      for (var report in STRIPS_REPORTS) {
        if (n & 1 << STRIPS_REPORTS[report].reportbit) {
          if (result != "")
            result += "|";
          result += report;
        }
      }
      return result;
    };
    var encodeReports = (str) => {
      const list = str.split("|");
      let res = 0;
      list.map((item) => {
        if (item.length > 0) {
          if (!STRIPS_REPORTS.hasOwnProperty(item))
            throw { message: "Invalid report id: " + item };
          res |= 1 << STRIPS_REPORTS[item].reportbit;
        }
      });
      return d2h(res, 4);
    };
    var SENSOR_CONFIG_BITS = {
      INVERT_DOOR: 1 << 0,
      HIGH_POWER_PROXIMITY: 1 << 1
    };
    var decodeConfig = (n) => {
      let r = "";
      for (let bitname in SENSOR_CONFIG_BITS)
        if (n & SENSOR_CONFIG_BITS[bitname]) {
          if (r != "") r += "|";
          r += bitname;
        }
      return r;
    };
    var encodeConfig = (str) => {
      const list = str.split("|");
      let res = 0;
      list.map((item) => {
        for (let bitname in SENSOR_CONFIG_BITS) {
          if (item == bitname)
            res |= SENSOR_CONFIG_BITS[bitname];
        }
      });
      return d2h(res, 4);
    };
    var STRIPS_SETTINGS = {
      NONE: { id: 0, unit: "none", decode: decodeU32hex, encode: encodeU32hex, name: "None" },
      VERSION: { id: 1, unit: "version", decode: decodeU32hex, encode: encodeU32hex, name: "Version" },
      BASE_POLL_INTERVAL: { id: 2, unit: "ms", decode: decodeU32dec, encode: encodeU32, name: "Base poll interval" },
      REPORTS_ENABLED: { id: 3, unit: "reports", decode: decodeReports, encode: encodeReports, name: "Reports enabled" },
      TEMP_POLL_INTERVAL: { id: 4, unit: "s", decode: decodeU32dec, encode: encodeU32, name: "Temp poll interval" },
      TEMP_SEND_IMMEDIATELY_TRESHOLD: { id: 5, unit: "mC", decode: decodeU32dec, encode: encodeU32, name: "Temp send immediately treshold" },
      TEMP_SEND_THROTTLED_TRESHOLD: { id: 6, unit: "mC", decode: decodeU32dec, encode: encodeU32, name: "Temp send throttled treshold" },
      TEMP_SEND_THROTTLED_TIME: { id: 7, unit: "s", decode: decodeU32dec, encode: encodeU32, name: "Temp send throttled time" },
      TEMP_LOW_ALARM: { id: 8, unit: "mC", decode: decodeU32dec, encode: encodeU32, name: "Temp low alarm" },
      TEMP_HIGH_ALARM: { id: 9, unit: "mC", decode: decodeU32dec, encode: encodeU32, name: "Temp high alarm" },
      TEMP_ALARM_HYSTERESIS: { id: 10, unit: "mC", decode: decodeU32dec, encode: encodeU32, name: "Temp alarm hysteresis" },
      AVGTEMP_AVERAGE_TIME: { id: 11, unit: "s", decode: decodeU32dec, encode: encodeU32, name: "Average temp average time" },
      AVGTEMP_MIN_TEMP: { id: 12, unit: "mC", decode: decodeU32dec, encode: encodeU32, name: "Average temp min temp" },
      AVGTEMP_SEND_IMMEDIATELY_TRESHOLD: { id: 13, unit: "mC", decode: decodeU32dec, encode: encodeU32, name: "Averate temp send immediately treshold" },
      AVGTEMP_LOW_ALARM: { id: 14, unit: "mC", decode: decodeU32dec, encode: encodeU32, name: "Average temp low alarm" },
      AVGTEMP_HIGH_ALARM: { id: 15, unit: "mC", decode: decodeU32dec, encode: encodeU32, name: "Average temp high alarm" },
      AVGTEMP_ALARM_HYSTERESIS: { id: 16, unit: "mC", decode: decodeU32dec, encode: encodeU32, name: "Average temp hysteresis" },
      HUMIDITY_POLL_INTERVAL: { id: 17, unit: "s", decode: decodeU32dec, encode: encodeU32, name: "Humidity poll interval" },
      HUMIDITY_TRESHOLD: { id: 18, unit: "%", decode: decodeU32dec, encode: encodeU32, name: "Humidity treshold" },
      LUX_POLL_INTERVAL: { id: 19, unit: "s", decode: decodeU32dec, encode: encodeU32, name: "Lux poll interval" },
      LUX_HIGH_LEVEL_1: { id: 20, unit: "Lux", decode: decodeU32dec, encode: encodeU32, name: "Lux high level 1" },
      LUX_LOW_LEVEL_1: { id: 21, unit: "Lux", decode: decodeU32dec, encode: encodeU32, name: "Lux low level 1" },
      LUX_HIGH_LEVEL_2: { id: 22, unit: "Lux", decode: decodeU32dec, encode: encodeU32, name: "Lux high level 2" },
      LUX_LOW_LEVEL_2: { id: 23, unit: "Lux", decode: decodeU32dec, encode: encodeU32, name: "Lux low level 2" },
      FLOOD_POLL_INTERVAL: { id: 24, unit: "s", decode: decodeU32dec, encode: encodeU32, name: "Flood poll interval" },
      FLOOD_CAPACITANCE_MIN: { id: 25, unit: "capacitance", decode: decodeU32dec, encode: encodeU32, name: "Flood capacitance min" },
      FLOOD_CAPACITANCE_MAX: { id: 26, unit: "capacitance", decode: decodeU32dec, encode: encodeU32, name: "Flood capacitance max" },
      FLOOD_REPORT_INTERVAL: { id: 27, unit: "s", decode: decodeU32dec, encode: encodeU32, name: "Flood report interval" },
      FLOOD_ALARM_TRESHOLD: { id: 28, unit: "%", decode: decodeU32dec, encode: encodeU32, name: "Flood alarm treshold" },
      FLOOD_ALARM_HYSTERESIS: { id: 29, unit: "%", decode: decodeU32dec, encode: encodeU32, name: "Flood alarm hysteresis" },
      SETTINGS_FOIL_TRESHOLD: { id: 30, unit: "capacitance", decode: decodeU32dec, encode: encodeU32, name: "Foil treshold" },
      CAPACITANCE_FLOOD_REPORT_INTERVAL: { id: 31, unit: "s", decode: decodeU32dec, encode: encodeU32, name: "Cap flood report interval" },
      CAPACITANCE_PAD_REPORT_INTERVAL: { id: 32, unit: "s", decode: decodeU32dec, encode: encodeU32, name: "Cap pad report interval" },
      CAPACITANCE_END_REPORT_INTERVAL: { id: 33, unit: "s", decode: decodeU32dec, encode: encodeU32, name: "Cap end report interval" },
      SENSORS_COMBINED_1: { id: 34, unit: "reports", decode: decodeReports, encode: encodeReports, name: "Combined sensors 1" },
      SENSORS_COMBINED_2: { id: 35, unit: "reports", decode: decodeReports, encode: encodeReports, name: "Combined sensors 2" },
      SENSORS_COMBINED_3: { id: 36, unit: "reports", decode: decodeReports, encode: encodeReports, name: "Combined sensors 3" },
      HISTORY_REPORTS: { id: 37, unit: "reports", decode: decodeReports, encode: encodeReports, name: "History reports" },
      DEMO_TRYJOIN_INTERVAL: { id: 38, unit: "min", decode: decodeU32dec, encode: encodeU32, name: "Try join interval" },
      LUX_PLASTIC_COMP: { id: 39, unit: "%", decode: decodeU32dec, encode: encodeU32, name: "Lux plastic comp" },
      LORA_DATA_RATE: { id: 40, unit: "datarate", decode: decodeU32dec, encode: encodeU32, name: "Lora data rate" },
      LED_LEVEL: { id: 41, unit: "ledlevel", decode: decodeU32dec, encode: encodeU32, name: "Led level" },
      LINK_CHECK_INTERVAL: { id: 42, unit: "unknown", decode: decodeU32dec, encode: encodeU32, name: "Link check interval" },
      RESEND_RESET_TIME: { id: 43, unit: "unknown", decode: decodeU32dec, encode: encodeU32, name: "Resend reset time" },
      LUX_LOW_CUTOFF: { id: 44, unit: "lux", decode: decodeU32dec, encode: encodeU32, name: "Lux low cutoff" },
      DOOR_COUNT_REPORT_INTERVAL: { id: 45, unit: "s", decode: decodeU32dec, encode: encodeU32, name: "Door count interval" },
      IR_PROXIMITY_REPORT_INTERVAL: { id: 46, unit: "s", decode: decodeU32dec, encode: encodeU32, name: "IR Proximity report interval" },
      PRESENCE_POLL_INTERVAL: { id: 47, unit: "s", decode: decodeU32dec, encode: encodeU32, name: "Presence poll interval" },
      PRESENCE_TRESHOLD: { id: 48, unit: "reflection", decode: decodeU32dec, encode: encodeU32, name: "Presence treshold" },
      PRESENCE_TIMEOUT: { id: 49, unit: "s", decode: decodeU32dec, encode: encodeU32, name: "Presence timeout" },
      SENSOR_CONFIGURATION: { id: 50, unit: "config", decode: decodeConfig, encode: encodeConfig, name: "Sensor configuration" }
    };
    var STRIPS_PROFILES = {
      DEFAULT: { id: 0, name: "Default" },
      COMFORT_TEMP: { id: 1, name: "Comfort Temp" },
      COMFORT_TEMP_LUX: { id: 2, name: "Comfort Temp and Lux" },
      COMFORT_AVGTEMP: { id: 3, name: "Comfort Average Temp" },
      GUARD_STD: { id: 4, name: "Guard Standard" },
      DRIP_STD: { id: 5, name: "Drip Standard" },
      PRESENCE_OFFICE: { id: 6, name: "Presence Office" },
      PRESENCE_PUBLIC: { id: 7, name: "Presence Public" },
      DISINFECT_OFFICE: { id: 8, name: "Disinfect Office" },
      CLOSE_PROXIMITY_SLOW: { id: 9, name: "Close Proximity Slow" },
      ALL_CAP_SENSORS_RAW: { id: 240, name: "All cap sensors raw" }
    };
    function decodeSetSetting(bytes, pos) {
      var result = new Object();
      if (pos == bytes.end)
        throw { message: "No settings to set" };
      while (pos < bytes.length) {
        if (bytes.length < pos + 5)
          throw { message: "Set settings: Bad data size" };
        const id = bytes[pos++];
        const val = (bytes[pos++] << 24) + (bytes[pos++] << 16) + (bytes[pos++] << 8) + bytes[pos++];
        let bFound = false;
        for (var setting in STRIPS_SETTINGS) {
          if (STRIPS_SETTINGS[setting].id == id) {
            bFound = true;
            result[setting] = { id, name: STRIPS_SETTINGS[setting].name, unit: STRIPS_SETTINGS[setting].unit, value: STRIPS_SETTINGS[setting].decode(val) };
          }
        }
        if (false == bFound)
          throw { message: "Unknown setting: " + id };
      }
      return result;
    }
    function encodeSetSetting(obj) {
      var res = "";
      for (var field in obj)
        if (STRIPS_SETTINGS.hasOwnProperty(field))
          res += d2h(STRIPS_SETTINGS[field].id, 1) + STRIPS_SETTINGS[field].encode(obj[field].value);
      return res;
    }
    function getSettingById(id) {
      let bFound = false;
      for (var setting in STRIPS_SETTINGS) {
        if (STRIPS_SETTINGS[setting].id == id) {
          return setting;
        }
      }
      return null;
    }
    function decodeGetSetting(bytes, pos) {
      let result = new Object();
      const id = bytes[pos++];
      const setting = getSettingById(id);
      if (null == setting)
        throw { message: "Get settings: Unknown setting " + id };
      result[setting] = { id, name: setting, unit: STRIPS_SETTINGS[setting].unit };
      return result;
    }
    function encodeGetSetting(obj) {
      let res = "";
      for (var field in obj)
        for (var setting in STRIPS_SETTINGS)
          if (field == setting) {
            res += d2h(STRIPS_SETTINGS[setting].id, 1);
            continue;
          }
      return res;
    }
    function decodeGetHistory(bytes, pos) {
      if (bytes.length != 5)
        throw { message: "Get history command: Bad package size" };
      const first = (bytes[pos++] << 8) + bytes[pos++];
      const last = (bytes[pos++] << 8) + bytes[pos++];
      return { first, last, unit: "History sequence number" };
    }
    function encodeGetHistory(obj) {
      if (false == obj.hasOwnProperty("first") || false == obj.hasOwnProperty("last"))
        throw { message: "Expected properties first and last missing" };
      return d2h(obj.first, 2) + d2h(obj.last, 2);
    }
    function decodeSetProfile(bytes, pos) {
      if (bytes.length != 2)
        throw { message: "Set profile command: Bad package size" };
      const profile = bytes[pos++];
      for (var id in STRIPS_PROFILES)
        if (STRIPS_PROFILES[id].id == profile)
          return { profile: STRIPS_PROFILES[id].name, id };
      throw { message: "Unknown profile " + profile };
    }
    function encodeSetProfile(obj) {
      if (false == obj.hasOwnProperty("id"))
        throw { message: "Profile id is missing" };
      const profile = obj.id;
      if (false == STRIPS_PROFILES.hasOwnProperty(profile))
        throw { message: "Unknown profile " + profile };
      return d2h(STRIPS_PROFILES[profile].id, 1);
    }
    function decodeCmdUnjoin(bytes, pos) {
      if (bytes.length != 3)
        throw { message: "Unjoin command: Bad package size" };
      const minutes = (bytes[pos++] << 8) + bytes[pos++];
      return { minutes };
    }
    function encodeCmdUnjoin(obj) {
      if (false == obj.hasOwnProperty("minutes"))
        throw { message: "Unjoin requires minutes field" };
      return d2h(obj.minutes, 2);
    }
    function decodeEndComp(bytes, pos) {
      if (1 != bytes.length)
        throw { message: "End compliance test: Bad package size" };
      return {};
    }
    function encodeEndComp(obj) {
      return "";
    }
    var STRIPS_PORTCOMMANDS = {
      SET_SETTING: { port: 11, cmd: 1, decode: decodeSetSetting, encode: encodeSetSetting, name: "Set setting" },
      GET_SETTING: { port: 11, cmd: 2, decode: decodeGetSetting, encode: encodeGetSetting, name: "Get setting" },
      GET_HISTORY: { port: 2, cmd: 1, decode: decodeGetHistory, encode: encodeGetHistory, name: "Get history" },
      SET_PROFILE: { port: 10, cmd: 1, decode: decodeSetProfile, encode: encodeSetProfile, name: "Set profile" },
      CMD_UNJOIN: { port: 10, cmd: 8, decode: decodeCmdUnjoin, encode: encodeCmdUnjoin, name: "Unjoin" },
      CMD_ENDCOMP: { port: 224, cmd: 6, decode: decodeEndComp, encode: encodeEndComp, name: "End compliance test" }
    };
    var getReportFromByte = (channel) => {
      for (let report in STRIPS_REPORTS)
        if (STRIPS_REPORTS[report].channel == channel)
          return report;
      throw { message: "Unknown channel: " + channel };
    };
    var decodeAndPackItem = (report, bytes, pos, hpos) => {
      const decodedItem = report.coding.decode(bytes, pos);
      let decoded;
      if (typeof decodedItem === "object")
        decoded = decodedItem;
      else
        decoded = { value: decodedItem, unit: report.unit };
      if (hpos != null)
        decoded.historyPosition = hpos;
      return decoded;
    };
    var decodeDirectUplink = (bytes) => {
      if (bytes.length < 2)
        throw "message: Too few bytes";
      let pos = 0;
      const hCount = bytes[pos++] << 8 | bytes[pos++];
      let decoded = {};
      decoded.historyStart = hCount;
      let historyPosition = hCount;
      while (pos < bytes.length) {
        let itemHistoryPosition = null;
        if (bytes[pos] & 128)
          itemHistoryPosition = historyPosition--;
        const reportName = getReportFromByte(bytes[pos++] & 127);
        const report = STRIPS_REPORTS[reportName];
        const size = report.coding.getsize(bytes, pos);
        const nextpos = pos + size;
        if (nextpos > bytes.length)
          throw { message: "Incomplete data" };
        decoded[reportName] = decodeAndPackItem(report, bytes, pos, itemHistoryPosition);
        pos = nextpos;
      }
      return [decoded];
    };
    var decodeHistoryUplink = (bytes) => {
      let pos = 0;
      let reports = [];
      let now = (/* @__PURE__ */ new Date()).getTime();
      if (bytes.length < 2)
        throw { message: "Too small history package" };
      let sequence = bytes[pos++] << 8 | bytes[pos++];
      while (pos < bytes.length - 5) {
        let timeOffsetMS = 1e3 * (bytes[pos++] << 24 | bytes[pos++] << 16 | bytes[pos++] << 8 | bytes[pos++]);
        const reportName = getReportFromByte(bytes[pos++] & 127);
        const report = STRIPS_REPORTS[reportName];
        const size = report.coding.getsize(bytes, pos);
        const nextpos = pos + size;
        if (nextpos > bytes.length)
          throw { message: "Incomplete data" };
        let decoded = {};
        decoded.timestamp = now - timeOffsetMS;
        decoded[report] = decodeAndPackItem(report, bytes, pos, sequence++);
        reports.push(decoded);
        pos = nextpos;
      }
      if (pos != bytes.length)
        throw { message: "Invalid history package size" };
      return reports;
    };
    var STATUS_CODES = [
      "OK",
      // 0
      "Bad setting",
      // 1
      "Bad payload length",
      // 2
      "Value not accepted",
      // 3
      "Unknown command"
      // 4
    ];
    var decodeSettingsUplink = (bytes) => {
      let pos = 0;
      let result = [];
      let now = (/* @__PURE__ */ new Date()).getTime();
      if (bytes.length < 1)
        throw { message: "To small settings package" };
      while (pos < bytes.length) {
        let kind = bytes[pos++];
        if (2 == kind) {
          if (pos + 5 < bytes.length)
            throw { message: "Incomplete settings data" };
          const id = bytes[pos++];
          const setting = getSettingById(id);
          if (null == setting)
            throw { message: "Unknown setting id " + id };
          let decoded = {};
          decoded[setting] = {
            id,
            value: bytes[pos++] << 24 | bytes[pos++] << 16 | bytes[pos++] << 8 | bytes[pos++],
            unit: STRIPS_SETTINGS[setting].unit
          };
          result.push(decoded);
        } else if (3 == kind) {
          if (pos + 1 != bytes.length)
            throw { message: "Bad status code message length" };
          const status = bytes[pos++];
          if (status >= STATUS_CODES.length)
            throw { message: "Unknown status code: " + status };
          let decoded = {};
          decoded["statusCode"] = { value: status, status: STATUS_CODES[status] };
          result.push(decoded);
        } else
          throw { message: "Unknown settings uplink format: " + kind };
      }
      return result;
    };
    var STRIPS_UPLINK_PORTS = {
      DIRECT_PORT: { port: 1, decode: decodeDirectUplink },
      HISTORY_PORT: { port: 2, decode: decodeHistoryUplink },
      SETTINGS_PORT: { port: 11, decode: decodeSettingsUplink }
    };
    var decodeLoraStripsUplink = (port, bytes) => {
      let pos = 0;
      for (let kind in STRIPS_UPLINK_PORTS)
        if (STRIPS_UPLINK_PORTS[kind].port == port)
          return STRIPS_UPLINK_PORTS[kind].decode(bytes);
      throw "No function for decoding uplinks on port " + port;
    };
    var decodeLoraStripsDownlink = (port, bytes) => {
      if (bytes == null || bytes.length < 1)
        throw { message: "Not enough data" };
      const cmd = bytes[0];
      for (var id in STRIPS_PORTCOMMANDS) {
        if (STRIPS_PORTCOMMANDS[id].port == port && STRIPS_PORTCOMMANDS[id].cmd == cmd) {
          let result = STRIPS_PORTCOMMANDS[id].decode(bytes, 1);
          result["cmd"] = STRIPS_PORTCOMMANDS[id];
          return result;
        }
      }
      throw { message: "Unrecognized downlink" };
    };
    var encodeLoraStripsDownlink = (obj) => {
      if (null == obj || false == obj.hasOwnProperty("cmd"))
        throw { message: "Bad object for encode, null or missing cmd." };
      const cmd = obj["cmd"].name;
      for (var c in STRIPS_PORTCOMMANDS) {
        if (cmd == STRIPS_PORTCOMMANDS[c].name) {
          return {
            data: d2h(STRIPS_PORTCOMMANDS[c].cmd, 1) + STRIPS_PORTCOMMANDS[c].encode(obj),
            port: STRIPS_PORTCOMMANDS[c].port
          };
        }
      }
      throw { message: "Unknown command: " + cmd };
    };
    var test_modes = {
      d: { name: "downlink", func: (port, data) => decodeLoraStripsDownlink(port, data) },
      u: { name: "uplink", func: (port, data) => decodeLoraStripsUplink(port, data) }
      // l: { name: 'legacy uplink',     func: (port, data) => rawTranslate(data, port) },
    };
    function test2(rl) {
      rl.question("Select mode (" + Object.keys(test_modes).map((k) => k + "=" + test_modes[k].name) + "): ", (mode) => {
        if (!test_modes[mode]) {
          console.log("** Unknown mode: " + mode);
          test2(rl);
          return;
        }
        const func = test_modes[mode].func;
        const name = test_modes[mode].name;
        rl.question("Enter " + name + " port (decimal): ", (port) => {
          port = Number(port);
          rl.question("Enter " + name + " (hex format): ", (hex) => {
            try {
              let trimmed = hex.replace(/\s/g, "");
              let data = Buffer.from(trimmed, "hex");
              let decoded = func(port, data);
              console.log(JSON.stringify(decoded));
            } catch (err) {
              console.log(err);
            }
            test2(rl);
          });
        });
      });
    }
    function commandLineTest() {
      let readline = null;
      try {
        readline = require("readline");
      } catch (e) {
        console.log(e);
      }
      ;
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      test2(rl);
    }
    exports2.decodeLoraStripsDownlink = decodeLoraStripsDownlink;
    exports2.decodeLoraStripsUplink = decodeLoraStripsUplink;
    exports2.encodeLoraStripsDownlink = encodeLoraStripsDownlink;
    exports2.commandLine = commandLineTest;
  }
});

// ../librairies/extractPoints.js
var require_extractPoints = __commonJS({
  "../librairies/extractPoints.js"(exports2, module2) {
    function mapPoints(ontologyFieldName, value, timestamp, unit, nature, result, isArray = false) {
      var _a;
      if (result[ontologyFieldName] == null) {
        result[ontologyFieldName] = { unitId: unit, records: [] };
      }
      if (nature !== null) result[ontologyFieldName].nature = nature;
      if (Array.isArray(value)) {
        if (value.length === 1 && value[0].value !== void 0 && value[0].value !== void 0) {
          result[ontologyFieldName]["records"].push({
            value: value[0].value,
            eventTime: (_a = value[0].eventTime) != null ? _a : timestamp != null ? timestamp : null
          });
        } else {
          value.forEach((item) => {
            var _a2, _b;
            result[ontologyFieldName]["records"].push({ value: (_a2 = item.value) != null ? _a2 : item, eventTime: (_b = item.eventTime) != null ? _b : timestamp != null ? timestamp : null });
          });
        }
      } else {
        result[ontologyFieldName]["records"].push({ value, eventTime: timestamp != null ? timestamp : null });
      }
      result[ontologyFieldName]["isArray"] = isArray;
    }
    function mapPointGPS(longitude, latitude, altitude, timestamp, ontologyFieldName, nature, result, isArray = false) {
      if (longitude !== void 0 && latitude !== void 0) {
        result[ontologyFieldName] = { unitId: "GPS", records: [] };
        if (nature !== null) result[ontologyFieldName].nature = nature;
        result[ontologyFieldName]["records"].push({
          value: [longitude, latitude],
          eventTime: timestamp
        });
        altitude !== null ? result[ontologyFieldName]["records"][0].value.push(altitude) : "";
      }
      result[ontologyFieldName]["isArray"] = isArray;
    }
    function recordOrRecords(result) {
      var _a, _b, _c;
      for (const [key, item] of Object.entries(result)) {
        if (item.records.length === 1 && !item.isArray) {
          if (item.unitId === "GPS") {
            if (item.records[0].value[2] !== void 0) {
              result[key] = { unitId: item.unitId, record: [item.records[0].value[0], item.records[0].value[1], item.records[0].value[2]] };
            } else {
              result[key] = { unitId: item.unitId, record: [item.records[0].value[0], item.records[0].value[1]] };
            }
          } else {
            if (((_a = item.records[0]) == null ? void 0 : _a.eventTime) !== null) {
              result[key] = { unitId: item.unitId, records: [{ value: item.records[0].value, eventTime: (_b = item.records[0]) == null ? void 0 : _b.eventTime }] };
            } else {
              result[key] = { unitId: item.unitId, record: (_c = item.records[0].value) != null ? _c : null };
            }
          }
          if (item.nature !== void 0) {
            result[key].nature = item.nature;
          }
        }
        delete result[key]["isArray"];
      }
      return result;
    }
    function mapArrayPoints(array) {
      let result = {};
      array.forEach((point) => {
        var _a, _b, _c, _d;
        if (point.value !== null && !isNaN(point.value) && point.value !== void 0 || Array.isArray(point.value)) {
          switch (point.ontologyFieldName) {
            case "location":
              mapPointGPS(point.value[0], point.value[1], point.value[2] ? point.value[2] : null, (_a = point.timestamp) != null ? _a : null, "location", (_b = point.nature) != null ? _b : null, result, point.isArray);
              break;
            default:
              mapPoints(point.ontologyFieldName, point.value, (_c = point.timestamp) != null ? _c : null, point.unitId, (_d = point.nature) != null ? _d : null, result, point.isArray);
          }
        }
      });
      recordOrRecords(result);
      return result;
    }
    module2.exports = { mapArrayPoints };
  }
});

// ../../device-catalog/vendors/sensative/drivers/strips/extractPoints.js
var require_extractPoints2 = __commonJS({
  "../../device-catalog/vendors/sensative/drivers/strips/extractPoints.js"(exports2) {
    var { mapArrayPoints } = require_extractPoints();
    function extractPoints(input) {
      var _a, _b, _c, _d;
      const data = input.message || {};
      const array = [];
      let counterIndex = 1;
      if (data.BatteryReport !== void 0) {
        array.push({ ontologyFieldName: "batteryLevel", value: (_a = data.BatteryReport) == null ? void 0 : _a.value, unitId: "%" });
      }
      if (data.PresenceReport !== void 0) {
        array.push({ ontologyFieldName: "presence", value: (_b = data.PresenceReport) == null ? void 0 : _b.value, unitId: "state" });
      }
      if (data.IRProximityReport !== void 0) {
        array.push({ ontologyFieldName: ["counter:" + counterIndex++], value: (_c = data.IRProximityReport) == null ? void 0 : _c.value, unitId: "count", nature: "IR proximity" });
      }
      if (data.IRCloseProximityReport !== void 0) {
        array.push({ ontologyFieldName: ["counter:" + counterIndex++], value: (_d = data.IRCloseProximityReport) == null ? void 0 : _d.value, unitId: "count", nature: "IR close proximity" });
      }
      return mapArrayPoints(array);
    }
    exports2.extractPoints = extractPoints;
  }
});

// ../../device-catalog/vendors/sensative/drivers/strips/index.js
var translator = require_strips_translate();
function transformStripsDecodeDownlinkToActilityFormat(obj) {
  let result = {};
  for (const key in obj) {
    if (typeof (obj[key] === "object") && obj[key].hasOwnProperty("value")) {
      result[key] = obj[key].value;
    }
  }
  if (obj.hasOwnProperty("cmd") && obj.cmd.hasOwnProperty("name"))
    result.cmd = obj.cmd.name;
  return result;
}
function transformStripsEncodeDownlinkFromActilityFormat(obj) {
  let transformed = {};
  for (const key in obj) {
    if (key == "cmd")
      transformed.cmd = { name: obj.cmd };
    else
      transformed[key] = { value: obj[key] };
  }
  const encoding = translator.encodeLoraStripsDownlink(transformed);
  const buffer = Buffer.from(encoding.data, "hex");
  var bytes = [];
  for (let i = 0; i < buffer.length; ++i)
    bytes.push(buffer.readUInt8(i));
  return { fPort: encoding.port, bytes };
}
function decodeUplink(input) {
  const bytes = input.bytes;
  const port = parseInt(input.fPort);
  let returned = null;
  switch (port) {
    case 1:
      returned = translator.decodeLoraStripsUplink(port, bytes);
      break;
    case 11:
      returned = translator.decodeLoraStripsUplink(port, bytes);
      break;
    case 2:
      throw new Error("This decoder does not support history data.");
    default:
      throw new Error("This decoder will only decode data points and status codes, not metadata or mac commands.");
  }
  return returned[0];
}
function decodeDownlink(input) {
  const bytes = input.bytes;
  const port = parseInt(input.fPort);
  return transformStripsDecodeDownlinkToActilityFormat(translator.decodeLoraStripsDownlink(port, bytes));
}
function encodeDownlink(input) {
  return transformStripsEncodeDownlinkFromActilityFormat(input);
}
exports.decodeUplink = decodeUplink;
exports.decodeDownlink = decodeDownlink;
exports.encodeDownlink = encodeDownlink;
module.exports.extractPoints = require_extractPoints2().extractPoints;
