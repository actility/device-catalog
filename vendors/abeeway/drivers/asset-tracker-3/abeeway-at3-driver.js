(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["driver"] = factory();
	else
		root["driver"] = factory();
})(this, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 33:
/***/ ((module) => {

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// ../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/messages/uplink/abeewayUplinkPayload.js
var require_abeewayUplinkPayload = __commonJS({
  "../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/messages/uplink/abeewayUplinkPayload.js"(exports2, module2) {
    var messageType = Object.freeze({
      NOTIFICATION: "NOTIFICATION",
      POSITION: "POSITION",
      QUERY: "QUERY",
      RESPONSE: "RESPONSE",
      TELEMETRY: "TELEMETRY",
      UNKNOWN: "UNKNOWN"
    });
    function AbeewayUplinkPayload(header, extendedHeader, notification, position, query, response, telemetry, payload) {
      this.header = header;
      this.extendedHeader = extendedHeader;
      this.notification = notification;
      this.position = position;
      this.query = query;
      this.response = response;
      this.telemetry = telemetry;
      this.telemetry = telemetry;
      this.payload = payload;
    }
    module2.exports = {
      AbeewayUplinkPayload,
      messageType
    };
  }
});

// ../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/messages/downlink/abeewayDownlinkPayload.js
var require_abeewayDownlinkPayload = __commonJS({
  "../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/messages/downlink/abeewayDownlinkPayload.js"(exports2, module2) {
    var MessageType = Object.freeze({
      COMMAND: "COMMAND",
      REQUEST: "REQUEST",
      ANSWER: "ANSWER"
    });
    function AbeewayDownlinkPayload(downMessageType, ackToken, command, request, payload) {
      this.downMessageType = downMessageType;
      this.ackToken = ackToken;
      this.command = command;
      this.request = request;
      this.payload = payload;
    }
    function determineDownlinkHeader(payload) {
      if (payload.length < 1)
        throw new Error("The payload is not valid to determine header");
      var ackToken = payload[0] & 7;
      var type = determineMessageType(payload);
      return new AbeewayDownlinkPayload(type, ackToken);
    }
    function determineMessageType(payload) {
      var messageType = payload[0] >> 3 & 7;
      switch (messageType) {
        case 1:
          return MessageType.COMMAND;
        case 2:
          return MessageType.REQUEST;
        case 3:
          return MessageType.ANSWER;
      }
    }
    module2.exports = {
      AbeewayDownlinkPayload,
      MessageType,
      determineDownlinkHeader
    };
  }
});

// ../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/messages/uplink/basicHeader.js
var require_basicHeader = __commonJS({
  "../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/messages/uplink/basicHeader.js"(exports2, module2) {
    var abeewayUplinkPayloadClass2 = require_abeewayUplinkPayload();
    var batteryStatus = Object.freeze({
      CHARGING: "CHARGING",
      OPERATING: "OPERATING",
      UNKNOWN: "UNKNOWN"
    });
    function Header(sos, type, ackToken, multiFrame2, batteryLevel, timestamp, buffering) {
      this.sos = sos;
      this.type = type;
      this.ackToken = ackToken;
      this.multiFrame = multiFrame2;
      this.batteryLevel = batteryLevel;
      this.timestamp = timestamp;
      this.buffering = buffering;
    }
    function determineHeader(payload, receivedTime) {
      var bufferingFlag;
      var timestamp;
      if (payload.length < 3)
        throw new Error("The payload is not valid to determine header");
      var sos = !!(payload[0] >> 6 & 1);
      var ackToken = payload[0] & 7;
      var type = determineMessageType(payload);
      var multiFrame2 = !!(payload[0] >> 7 & 1);
      var batteryLevel = determineBatteryLevel(payload);
      var buffering = payload[1] >> 7 & 1;
      if (buffering == 0) {
        timestamp = rebuildTime(receivedTime, (payload[2] << 8) + payload[3]);
      } else {
        if (payload.length < 6)
          throw new Error("the payload is not valid to determine header with buffering");
        bufferingFlag = true;
        var bufferingTimestamp = payload[2] << 24 | payload[3] << 16 | payload[4] << 8 | payload[5];
        timestamp = new Date(bufferingTimestamp * 1e3).toISOString();
      }
      return new Header(sos, type, ackToken, multiFrame2, batteryLevel, timestamp, bufferingFlag);
    }
    function rebuildTime(receivedTime, seconds) {
      const timestamp = new Date(receivedTime);
      if (seconds === 65535) {
        return timestamp.toISOString();
      }
      const utcDate = new Date(Date.UTC(timestamp.getUTCFullYear(), timestamp.getUTCMonth(), timestamp.getUTCDate(), 0, 0, 0));
      const referenceTotalSeconds = timestamp.getUTCHours() * 3600 + timestamp.getUTCMinutes() * 60 + timestamp.getUTCSeconds();
      let referenceTime;
      if (referenceTotalSeconds < 43200) {
        referenceTime = utcDate;
      } else {
        referenceTime = new Date(utcDate.getTime() + 43200 * 1e3);
      }
      let exactTime = new Date(referenceTime.getTime() + seconds * 1e3);
      const timeDiff = Math.abs(exactTime.getTime() - timestamp.getTime());
      const toleranceMs = 3600 * 1e3;
      if (timeDiff <= toleranceMs) {
        return exactTime.toISOString();
      }
      if (exactTime > timestamp) {
        exactTime = new Date(exactTime.getTime() - 43200 * 1e3);
      }
      return exactTime.toISOString();
    }
    function determineMessageType(payload) {
      if (payload.length < 4)
        throw new Error("The payload is not valid to determine Message Type");
      var messageType = payload[0] >> 3 & 7;
      switch (messageType) {
        case 1:
          return abeewayUplinkPayloadClass2.messageType.NOTIFICATION;
        case 2:
          return abeewayUplinkPayloadClass2.messageType.POSITION;
        case 3:
          return abeewayUplinkPayloadClass2.messageType.QUERY;
        case 4:
          return abeewayUplinkPayloadClass2.messageType.RESPONSE;
        case 5:
          return abeewayUplinkPayloadClass2.messageType.TELEMETRY;
        default:
          return abeewayUplinkPayloadClass2.messageType.UNKNOWN;
      }
    }
    function determineBatteryLevel(payload) {
      if (payload.length < 4)
        throw new Error("The payload is not valid to determine Battery Level");
      var value = payload[1] & 127;
      if (value == 0)
        return batteryStatus.CHARGING;
      else if (value == 127)
        return batteryStatus.UNKNOWN;
      return value;
    }
    module2.exports = {
      Header,
      determineHeader
    };
  }
});

// ../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/messages/uplink/extendedHeader.js
var require_extendedHeader = __commonJS({
  "../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/messages/uplink/extendedHeader.js"(exports2, module2) {
    function ExtendedHeader(groupId, last, frameNumber) {
      this.groupId = groupId;
      this.last = last;
      this.frameNumber = frameNumber;
    }
    function determineExtendedHeader(payload) {
      if (payload.length < 5)
        throw new Error("The payload is not valid to determine multi frame header");
      let extendedHeader = new ExtendedHeader(
        payload[4] >> 5 & 7,
        payload[4] >> 4 & 1,
        payload[4] & 7
      );
      return extendedHeader;
    }
    module2.exports = {
      ExtendedHeader,
      determineExtendedHeader
    };
  }
});

// ../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/util.js
var require_util = __commonJS({
  "../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/util.js"(exports2, module2) {
    function convertToByteArray(payload) {
      var bytes = [];
      var length = payload.length / 2;
      for (var i = 0; i < payload.length; i += 2) {
        bytes[i / 2] = parseInt(payload.substring(i, i + 2), 16) & 255;
      }
      return bytes;
    }
    function isValueInRange(value, min, max) {
      return value >= min && value <= max;
    }
    function camelToSnake(string) {
      return string.replace(/[\w]([A-Z1-9])/g, function(m) {
        return m[0] + "_" + m[1];
      }).toUpperCase();
    }
    function twoComplement(num) {
      if (num > 2147483647) {
        num -= 4294967296;
      }
      return num;
    }
    function convertBytesToString(bytes) {
      var payload = "";
      var hex;
      for (var i = 0; i < bytes.length; i++) {
        hex = convertByteToString(bytes[i]);
        payload += hex;
      }
      return payload;
    }
    function convertByteToString(byte) {
      let hex = byte.toString(16);
      if (hex.length < 2) {
        hex = "0" + hex;
      }
      return hex;
    }
    function decodeCondensed(value, lo, hi, nbits, nresv) {
      return (value - nresv / 2) / (((1 << nbits) - 1 - nresv) / (hi - lo)) + lo;
    }
    function convertNegativeInt(value, length) {
      if (value > 127 << 8 * (length - 1)) {
        value -= 1 << 8 * length;
      }
      return value;
    }
    function hexStringToInt(hexString) {
      if (hexString.startsWith("0x")) {
        hexString = hexString.slice(2);
      }
      return parseInt(hexString, 16);
    }
    function checkParamValueRange(givenValue, minimum, maximum, exclusiveMinimum, exclusiveMaximum, additionalValues, additionalRanges) {
      if (additionalValues != void 0) {
        if (additionalValues.includes(givenValue))
          return true;
      }
      if (additionalRanges != void 0 && additionalRanges.length > 0) {
        for (let additionalRange of additionalRanges) {
          if (givenValue >= additionalRange.minimum && givenValue <= additionalRange.maximum)
            return true;
        }
      }
      if (maximum == void 0 && minimum == void 0) {
        return true;
      }
      if ((minimum == void 0 || exclusiveMinimum != void 0 && exclusiveMinimum == true && givenValue > minimum || givenValue >= minimum) && (maximum == void 0 || (exclusiveMaximum != void 0 && exclusiveMaximum == true && givenValue < maximum || givenValue <= maximum)))
        return true;
      return false;
    }
    function hasNegativeNumber(additionalValues) {
      if (additionalValues == void 0)
        return false;
      for (let el of additionalValues) {
        if (typeof el == "number") {
          if (el < 0)
            return true;
        } else if (typeof el == "object") {
          if (el.minimum < 0)
            return true;
        }
      }
      return false;
    }
    function lengthToHex(length) {
      let hex = 0;
      for (let i = 0; i < length; i++) {
        hex = hex + Math.pow(2, i);
      }
      return hex;
    }
    module2.exports = {
      convertToByteArray,
      camelToSnake,
      convertBytesToString,
      convertByteToString,
      decodeCondensed,
      convertNegativeInt,
      twoComplement,
      isValueInRange,
      hexStringToInt,
      checkParamValueRange,
      hasNegativeNumber,
      lengthToHex
    };
  }
});

// ../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/messages/uplink/notifications/system.js
var require_system = __commonJS({
  "../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/messages/uplink/notifications/system.js"(exports2, module2) {
    var util2 = require_util();
    function System(status, lowBattery, bleStatus, tamperDetection, heartbeat, shutdown, dataBufferingStatus, fuota) {
      this.status = status;
      this.lowBattery = lowBattery;
      this.bleStatus = bleStatus;
      this.tamperDetection = tamperDetection;
      this.heartbeat = heartbeat;
      this.shutdown = shutdown;
      this.dataBufferingStatus = dataBufferingStatus;
      this.fuota = fuota;
    }
    var SystemType = Object.freeze({
      STATUS: "STATUS",
      LOW_BATTERY: "LOW_BATTERY",
      BLE_STATUS: "BLE_STATUS",
      TAMPER_DETECTION: "TAMPER_DETECTION",
      HEARTBEAT: "HEARTBEAT",
      SHUTDOWN: "SHUTDOWN",
      DATA_BUFFERING_STATUS: "DATA_BUFFERING_STATUS",
      FUOTA: "FUOTA"
    });
    var ResetCause = Object.freeze({
      AOS_ERROR_NONE: "AOS_ERROR_NONE",
      AOS_ERROR_HW_NMI: "AOS_ERROR_HW_NMI",
      AOS_ERROR_HW_FAULT: "AOS_ERROR_HW_FAULT",
      AOS_ERROR_HW_MPU: "AOS_ERROR_HW_MPU",
      AOS_ERROR_HW_BUS: "AOS_ERROR_HW_BUS",
      AOS_ERROR_HW_USAGE: "AOS_ERROR_HW_USAGE",
      AOS_ERROR_HW_IRQ: "AOS_ERROR_HW_IRQ",
      AOS_ERROR_HW_WDOG: "AOS_ERROR_HW_WDOG",
      AOS_ERROR_HW_BOR: "AOS_ERROR_HW_BOR",
      AOS_ERROR_SW_ST_HAL_ERROR: "AOS_ERROR_SW_ST_HAL_ERROR",
      AOS_ERROR_SW_FREERTOS_ASSERT: "AOS_ERROR_SW_FREERTOS_ASSERT",
      AOS_ERROR_SW_FREERTOS_TASK_OVF: "AOS_ERROR_SW_FREERTOS_TASK_OVF",
      AOS_ERROR_SW_BLE_ASSERT: "AOS_ERROR_SW_BLE_ASSERT",
      AOS_ERROR_SW_RTC_FAIL: "AOS_ERROR_SW_RTC_FAIL",
      AOS_ERROR_SW_LORA_FAIL: "AOS_ERROR_SW_LORA_FAIL",
      AOS_ERROR_SW_DEBUG: "AOS_ERROR_SW_DEBUG",
      AOS_ERROR_SW_APP_START: "AOS_ERROR_SW_APP_START"
    });
    var ShutdownCause = Object.freeze({
      SHUTDOWN_CAUSE_NONE: "SHUTDOWN_CAUSE_NONE",
      SHUTDOWN_CAUSE_USER_ACTION: "SHUTDOWN_CAUSE_USER_ACTION",
      SHUTDOWN_CAUSE_LOW_BATTERY: "SHUTDOWN_CAUSE_LOW_BATTERY"
    });
    var DataBufferingStatus = Object.freeze({
      SUCCESS: "SUCCESS",
      TIMEOUT: "TIMEOUT",
      NO_DATA_FOUND: "NO_DATA_FOUND"
    });
    var Binary = Object.freeze({
      APPLICATION: "APPLICATION",
      BLE_STACK: "BLE_STACK",
      MT3333: "MT3333",
      LR11XX: "LR11XX"
    });
    var Source = Object.freeze({
      XMODEM: "XMODEM",
      BLE: "BLE",
      CELLULAR: "CELLULAR",
      LORA: "LORA"
    });
    var Raison = Object.freeze({
      NONE: "NONE",
      NETWORK_ISSUE: "NETWORK_ISSUE",
      DOWNLOAD_TIMEOUT: "DOWNLOAD_TIMEOUT",
      MODEM_FAILURE: "MODEM_FAILURE",
      FILE_NOT_FOUND: "FILE_NOT_FOUND",
      PLATFORM_ERROR: "PLATFORM_ERROR",
      PARSING_ERROR: "PARSING_ERROR",
      FLASH_ERROR: "FLASH_ERROR",
      LENGTH_ERROR: "LENGTH_ERROR",
      SIGNATURE_ERROR: "SIGNATURE_ERROR"
    });
    function Status(currentTemperature, resetCause, pageId, AT3Version, configurationVersion, lrHwVersion, hwBatchId, hwBomId, maxTemperature, minTemperature, motionPercent, batteryVoltage, totalConsumption, cellularConsumption, gnssConsumption, wifiConsumption, lrGnssConsumption, bleConsumption, mcuConsumption, globalCrc, lr11xxGpsDate, lr11xxGpsOutdated, lr11xxGpsGood, lr11xxBeidouDate, lr11xxBeidouOutdated, lr11xxBeidouGood, gnssGpsDate, gnssGpsOutdated, gnssGpsGood, gnssBeidouDate, gnssBeidouOutdated, gnssBeidouGood, cellVersion, ICCID, IMSI, EUICCID, IMEISV) {
      this.currentTemperature = currentTemperature;
      this.resetCause = resetCause;
      this.pageId = pageId;
      this.AT3Version = AT3Version;
      this.configurationVersion = configurationVersion;
      this.lrHwVersion = lrHwVersion;
      this.hwBatchId = hwBatchId;
      this.hwBomId = hwBomId;
      this.maxTemperature = maxTemperature;
      this.minTemperature = minTemperature;
      this.motionPercent = motionPercent;
      this.batteryVoltage = batteryVoltage;
      this.totalConsumption = totalConsumption;
      this.cellularConsumption = cellularConsumption;
      this.gnssConsumption = gnssConsumption;
      this.wifiConsumption = wifiConsumption;
      this.lrGnssConsumption = lrGnssConsumption;
      this.bleConsumption = bleConsumption;
      this.mcuConsumption = mcuConsumption;
      this.globalCrc = globalCrc;
      this.lr11xxGpsDate = lr11xxGpsDate;
      this.lr11xxGpsOutdated = lr11xxGpsOutdated;
      this.lr11xxGpsGood = lr11xxGpsGood;
      this.lr11xxBeidouDate = lr11xxBeidouDate;
      this.lr11xxBeidouOutdated = lr11xxBeidouOutdated;
      this.lr11xxBeidouGood = lr11xxBeidouGood;
      this.gnssGpsDate = gnssGpsDate;
      this.gnssGpsOutdated = gnssGpsOutdated;
      this.gnssGpsGood = gnssGpsGood;
      this.gnssBeidouDate = gnssBeidouDate;
      this.gnssBeidouOutdated = gnssBeidouOutdated;
      this.gnssBeidouGood = gnssBeidouGood;
      this.cellVersion = cellVersion;
      this.ICCID = ICCID;
      this.IMSI = IMSI;
      this.EUICCID = EUICCID;
      this.IMEISV = IMEISV;
    }
    function LowBattery(consumption, batteryVoltage) {
      this.consumption = consumption;
      this.batteryVoltage = batteryVoltage;
    }
    function BleStatus(state) {
      this.state = state;
    }
    function TamperDetection(state) {
      this.state = state;
    }
    function Heartbeat(currentTemperature, resetCause, globalCrc) {
      this.currentTemperature = currentTemperature;
      this.resetCause = resetCause;
      this.globalCrc = globalCrc;
    }
    function Shutdown(shutdownCause) {
      this.shutdownCause = shutdownCause;
    }
    function DataBuffering(status, oldestTimestamp, latestTimestamp) {
      this.status = status;
      this.oldestTimestamp = oldestTimestamp;
      this.latestTimestamp = latestTimestamp;
    }
    function Fuota(binary, source, raison) {
      this.binary = binary;
      this.source = source;
      this.raison = raison;
    }
    function determineFuota(payload) {
      var binaryValue = determineFuotaBinary(payload[5] >> 6 & 3);
      var source = determineFuotaSource(payload[5] >> 4 & 3);
      var raison = determineFuotaRaison(payload[5] & 15);
      return new Fuota(binaryValue, source, raison);
    }
    function determineHeartbeat(payload) {
      var currentTemperature = util2.convertNegativeInt(payload[5], 1);
      var resetCause = determineResetCause(payload[6] >> 3 & 31);
      const crcBytes = payload.slice(7, 11);
      const crc = crcBytes.map((b) => b.toString(16).padStart(2, "0")).join("");
      return new Heartbeat(currentTemperature, resetCause, crc);
    }
    function determineLowBattery(payload) {
      var consumption = (payload[5] << 8) + payload[6];
      var batteryVoltage = (payload[7] << 8) + payload[8];
      return new LowBattery(
        consumption,
        batteryVoltage
      );
    }
    function determineStatus(payload) {
      var currentTemperature = util2.convertNegativeInt(payload[5], 1);
      var resetCause = determineResetCause(payload[6] >> 3 & 31);
      var pageId = payload[6] & 7;
      var decodedStatus = new Status(currentTemperature, resetCause, pageId);
      switch (pageId) {
        case 0:
          determinePage0(payload, decodedStatus);
          break;
        case 1:
          determinePage1(payload, decodedStatus);
          break;
        case 2:
          determinePage2(payload, decodedStatus);
          break;
        case 3:
          determinePage3(payload, decodedStatus);
          break;
        default:
          throw new Error("Unknown page identifier");
      }
      return decodedStatus;
    }
    function determineBleStatus(payload) {
      switch (payload[5] & 1) {
        case 0:
          return new BleStatus("BLE_DISCONNECTED");
        case 1:
          return new BleStatus("BLE_CONNECTED");
      }
    }
    function determineTamperDetection(payload) {
      switch (payload[5] & 1) {
        case 0:
          return new TamperDetection("CASING_CLOSED");
        case 1:
          return new TamperDetection("CASING_OPEN");
      }
    }
    function determineShutdownCause(payload) {
      switch (payload[5]) {
        case 0:
          return new Shutdown(ShutdownCause.SHUTDOWN_CAUSE_NONE);
        case 1:
          return new Shutdown(ShutdownCause.SHUTDOWN_CAUSE_USER_ACTION);
        case 2:
          return new Shutdown(ShutdownCause.SHUTDOWN_CAUSE_LOW_BATTERY);
      }
    }
    function determineDataBufferingStatus(payload) {
      switch (payload[5]) {
        case 0:
          return DataBufferingStatus.SUCCESS;
        case 1:
          return DataBufferingStatus.TIMEOUT;
        case 2:
          return DataBufferingStatus.NO_DATA_FOUND;
      }
    }
    function determineDataBuffering(payload) {
      var dataBufferingStatus = determineDataBufferingStatus(payload);
      var oldestTimestamp = new Date((payload[6] << 24 | payload[7] << 16 | payload[8] << 8 | payload[9]) * 1e3).toISOString();
      var latestTimestamp = new Date((payload[10] << 24 | payload[11] << 16 | payload[12] << 8 | payload[13]) * 1e3).toISOString();
      return new DataBuffering(dataBufferingStatus, oldestTimestamp, latestTimestamp);
    }
    function determinePage0(payload, decodedStatus) {
      decodedStatus.AT3Version = payload[7].toString() + "." + payload[8].toString() + "." + payload[9].toString();
      decodedStatus.configurationVersion = payload[10].toString() + "." + payload[11].toString() + "." + payload[12].toString() + "." + payload[13].toString();
      decodedStatus.lrHwVersion = { "hardwareVersion": payload[14].toString(), "hardwareType": payload[15].toString(), "firmwareVersion": payload[16].toString() };
      decodedStatus.hwBatchId = (payload[17] << 8) + payload[18];
      decodedStatus.hwBomId = (payload[19] << 8) + payload[20];
      decodedStatus.maxTemperature = util2.convertNegativeInt(payload[21], 1);
      decodedStatus.minTemperature = util2.convertNegativeInt(payload[22], 1);
      decodedStatus.motionPercent = payload[23];
      decodedStatus.batteryVoltage = (payload[24] << 8) + payload[25];
      decodedStatus.totalConsumption = (payload[26] << 8) + payload[27];
      decodedStatus.cellularConsumption = (payload[28] << 8) + payload[29];
      decodedStatus.gnssConsumption = (payload[30] << 8) + payload[31];
      decodedStatus.wifiConsumption = (payload[32] << 8) + payload[33];
      decodedStatus.lrGnssConsumption = (payload[34] << 8) + payload[35];
      decodedStatus.bleConsumption = (payload[36] << 8) + payload[37];
      decodedStatus.mcuConsumption = (payload[38] << 8) + payload[39];
      const crcBytes = payload.slice(40, 44);
      decodedStatus.globalCrc = crcBytes.map((b) => b.toString(16).padStart(2, "0")).join("");
    }
    function determinePage1(payload, decodedStatus) {
      decodedStatus.lr11xxGpsDate = (payload[7] << 8) + payload[8];
      let value = (payload[9] << 24) + (payload[10] << 16) + (payload[11] << 8) + payload[12];
      decodedStatus.lr11xxGpsOutdated = gpsSatelliteField.filter((bit) => getBit(value, bit.position)).map((bit) => bit.position + 1);
      decodedStatus.lr11xxGpsGood = payload[13];
      decodedStatus.lr11xxBeidouDate = (payload[14] << 8) + payload[15];
      let valueB = payload.slice(16, 21);
      decodedStatus.lr11xxBeidouOutdated = beidouSatelliteField.filter((bit) => getBitFromPayload(valueB, bit.position)).map((bit) => bit.position + 1);
      decodedStatus.lr11xxBeidouGood = payload[21];
      decodedStatus.gnssGpsDate = (payload[22] << 8) + payload[23];
      let valueG = (payload[24] << 24) + (payload[25] << 16) + (payload[26] << 8) + payload[27];
      decodedStatus.gnssGpsOutdated = gpsSatelliteField.filter((bit) => getBit(valueG, bit.position)).map((bit) => bit.position + 1);
      decodedStatus.gnssGpsGood = payload[28];
      decodedStatus.gnssBeidouDate = (payload[29] << 8) + payload[30];
      let valueGB = payload.slice(31, 36);
      decodedStatus.gnssBeidouOutdated = beidouSatelliteField.filter((bit) => getBitFromPayload(valueGB, bit.position)).map((bit) => bit.position + 1);
      decodedStatus.gnssBeidouGood = payload[36];
    }
    function determinePage2(payload, decodedStatus) {
      decodedStatus.cellVersion = { "branch": payload[7].toString(), "mode": payload[8].toString(), "image": payload[9].toString(), "delivery": payload[10].toString(), "release": parseInt(util2.convertBytesToString(payload.slice(11, 13)), 16).toString() };
      decodedStatus.ICCID = buildAscciString(payload.slice(13, 33));
      decodedStatus.IMSI = buildAscciString(payload.slice(33));
    }
    function determinePage3(payload, decodedStatus) {
      decodedStatus.EUICCID = buildAscciString(payload.slice(7, 40));
      decodedStatus.IMEISV = buildAscciString(payload.slice(40));
    }
    function buildAscciString(value) {
      let endIndex = value.length;
      let allZero = true;
      for (let i2 = value.length - 1; i2 >= 0; i2--) {
        if (value[i2] !== 0) {
          endIndex = i2 + 1;
          allZero = false;
          break;
        }
      }
      if (allZero) {
        return "";
      }
      var asciiString = "";
      for (var i = 0; i < endIndex; i++)
        asciiString += String.fromCharCode(value[i]);
      return asciiString;
    }
    function determineResetCause(value) {
      switch (value) {
        case 0:
          return ResetCause.AOS_ERROR_NONE;
        case 1:
          return ResetCause.AOS_ERROR_HW_NMI;
        case 2:
          return ResetCause.AOS_ERROR_HW_FAULT;
        case 3:
          return ResetCause.AOS_ERROR_HW_MPU;
        case 4:
          return ResetCause.AOS_ERROR_HW_BUS;
        case 5:
          return ResetCause.AOS_ERROR_HW_USAGE;
        case 6:
          return ResetCause.AOS_ERROR_HW_IRQ;
        case 7:
          return ResetCause.AOS_ERROR_HW_WDOG;
        case 8:
          return ResetCause.AOS_ERROR_HW_BOR;
        case 9:
          return ResetCause.AOS_ERROR_SW_ST_HAL_ERROR;
        case 10:
          return ResetCause.AOS_ERROR_SW_FREERTOS_ASSERT;
        case 11:
          return ResetCause.AOS_ERROR_SW_FREERTOS_TASK_OVF;
        case 12:
          return ResetCause.AOS_ERROR_SW_BLE_ASSERT;
        case 13:
          return ResetCause.AOS_ERROR_SW_RTC_FAIL;
        case 14:
          return ResetCause.AOS_ERROR_SW_LORA_FAIL;
        case 15:
          return ResetCause.AOS_ERROR_SW_DEBUG;
        case 16:
          return ResetCause.AOS_ERROR_SW_APP_START;
        default:
          throw new Error("Unknown Reset Cause");
      }
    }
    function determineFuotaBinary(bin) {
      switch (bin) {
        case 0:
          return Binary.APPLICATION;
        case 1:
          return Binary.BLE_STACK;
        case 2:
          return Binary.MT3333;
        case 3:
          return Binary.LR11XX;
        default:
          throw new Error("The fuota binary is unknown");
      }
    }
    function determineFuotaSource(source) {
      switch (source) {
        case 0:
          return Source.XMODEM;
        case 1:
          return Source.BLE;
        case 2:
          return Source.CELLULAR;
        case 3:
          return Source.LORA;
        default:
          throw new Error("The fuota source is unknown");
      }
    }
    function determineFuotaRaison(raison) {
      switch (raison) {
        case 0:
          return Raison.NONE;
        case 1:
          return Raison.NETWORK_ISSUE;
        case 2:
          return Raison.DOWNLOAD_TIMEOUT;
        case 3:
          return Raison.MODEM_FAILURE;
        case 4:
          return Raison.FILE_NOT_FOUND;
        case 5:
          return Raison.PLATFORM_ERROR;
        case 6:
          return Raison.PARSING_ERROR;
        case 7:
          return Raison.FLASH_ERROR;
        case 8:
          return Raison.LENGTH_ERROR;
        case 9:
          return Raison.SIGNATURE_ERROR;
        default:
          throw new Error("The fuota raison failure is unknown");
      }
    }
    function getBit(value, position) {
      return value >> position & 1;
    }
    function getBitFromByte(byte, position) {
      return (byte & 1 << position) !== 0 ? 1 : 0;
    }
    function getBitFromPayload(payload, position) {
      const byteIndex = Math.floor(position / 8);
      const bitIndex = position % 8;
      return getBitFromByte(payload[byteIndex], bitIndex);
    }
    var gpsSatelliteField = Array.from({ length: 32 }, (_, i) => ({
      position: i
    }));
    var beidouSatelliteField = Array.from({ length: 40 }, (_, i) => ({
      position: i
    }));
    module2.exports = {
      System,
      determineStatus,
      determineLowBattery,
      determineBleStatus,
      determineTamperDetection,
      determineHeartbeat,
      determineShutdownCause,
      determineDataBuffering,
      determineFuota,
      SystemType
    };
  }
});

// ../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/messages/uplink/notifications/temperature.js
var require_temperature = __commonJS({
  "../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/messages/uplink/notifications/temperature.js"(exports2, module2) {
    var util2 = require_util();
    var TempType = Object.freeze({
      TEMP_HIGH: "TEMP_HIGH",
      TEMP_LOW: "TEMP_LOW",
      TEMP_NORMAL: "TEMP_NORMAL"
    });
    function determineTemperature(payload) {
      return util2.convertNegativeInt(payload[5], 1);
    }
    module2.exports = {
      determineTemperature,
      TempType
    };
  }
});

// ../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/messages/uplink/notifications/accelerometer.js
var require_accelerometer = __commonJS({
  "../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/messages/uplink/notifications/accelerometer.js"(exports2, module2) {
    var util2 = require_util();
    function Accelerometer(accelerationVector, motionPercent, gaddIndex, numberShocks) {
      this.accelerationVector = accelerationVector;
      this.motionPercent = motionPercent;
      this.gaddIndex = gaddIndex;
      this.numberShocks = numberShocks;
    }
    function determineAxis(payload, byteNumber2) {
      if (payload.length < byteNumber2 + 2) {
        throw new Error("The payload is not valid to determine axis value");
      }
      let value = (payload[byteNumber2] << 8) + payload[byteNumber2 + 1];
      value = util2.convertNegativeInt(value, 2);
      return value;
    }
    function determineAccelerationVector(payload, xOffset, yOffset, zOffset) {
      let x = determineAxis(payload, xOffset);
      let y = determineAxis(payload, yOffset);
      let z = determineAxis(payload, zOffset);
      return [x, y, z];
    }
    function determineGaddIndex(payload) {
      if (payload.length < 11) {
        throw new Error("The payload is not valid to determine GADD index");
      }
      return payload[11];
    }
    function determineMotion(payload) {
      if (payload.length < 11) {
        throw new Error("The payload is not valid to determine Motion");
      }
      return payload[11];
    }
    function determineNumberShocks(payload) {
      if (payload.length < 12) {
        throw new Error("The payload is not valid to determine number of shocks");
      }
      return payload[12];
    }
    var AcceleroType = Object.freeze({
      MOTION_START: "MOTION_START",
      MOTION_END: "MOTION_END",
      SHOCK: "SHOCK"
    });
    module2.exports = {
      Accelerometer,
      determineAccelerationVector,
      determineGaddIndex,
      determineNumberShocks,
      determineMotion,
      AcceleroType
    };
  }
});

// ../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/messages/uplink/notifications/network.js
var require_network = __commonJS({
  "../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/messages/uplink/notifications/network.js"(exports2, module2) {
    function Network(activeNetwork, mainNetwork, backupNetwork, psmActiveTime, psmTAU) {
      this.activeNetwork = activeNetwork;
      this.mainNetwork = mainNetwork;
      this.backupNetwork = backupNetwork;
      this.psmActiveTime = psmActiveTime;
      this.psmTAU = psmTAU;
    }
    var NetworkType = Object.freeze({
      MAIN_UP: "MAIN_UP",
      BACKUP_UP: "BACKUP_UP"
    });
    var NetworkInfo = Object.freeze({
      NO_NETWORK: "NO_NETWORK",
      LORA_NETWORK: "LORA_NETWORK",
      CELLULAR_NETWORK_IN_LOW_POWER_MODE: "CELLULAR_NETWORK_IN_LOW_POWER_MODE",
      CELLULAR_NETWORK_IN_HIGH_POWER_MODE: "CELLULAR_NETWORK_IN_HIGH_POWER_MODE"
    });
    function determineNetwork(value) {
      switch (value) {
        case 0:
          return NetworkInfo.NO_NETWORK;
        case 1:
          return NetworkInfo.LORA_NETWORK;
        case 2:
          return NetworkInfo.CELLULAR_NETWORK_IN_LOW_POWER_MODE;
        case 3:
          return NetworkInfo.CELLULAR_NETWORK_IN_HIGH_POWER_MODE;
        default:
          throw new Error("Unknown Network Information");
      }
    }
    function determineNetworkInfo(payload) {
      let psmActiveTime;
      let psmTAU;
      let activeNetwork = determineNetwork(payload[5]);
      let mainNetwork = determineNetwork(payload[6]);
      let backupNetwork = determineNetwork(payload[7]);
      if (payload.length > 7) {
        psmActiveTime = (payload[8] << 8) + payload[9];
        psmTAU = (payload[10] << 24) + (payload[11] << 16) + (payload[12] << 8) + payload[13];
      }
      return new Network(activeNetwork, mainNetwork, backupNetwork, psmActiveTime, psmTAU);
    }
    module2.exports = {
      Network,
      determineNetworkInfo,
      NetworkType
    };
  }
});

// ../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/messages/uplink/notifications/geozoning.js
var require_geozoning = __commonJS({
  "../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/messages/uplink/notifications/geozoning.js"(exports2, module2) {
    var GeozoningType = Object.freeze({
      ENTRY: "ENTRY",
      EXIT: "EXIT",
      IN_HAZARD: "IN_HAZARD",
      OUT_HAZARD: "OUT_HAZARD",
      MEETING_POINT: "MEETING_POINT"
    });
    module2.exports = {
      GeozoningType
    };
  }
});

// ../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/messages/uplink/notifications/telemetry.js
var require_telemetry = __commonJS({
  "../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/messages/uplink/notifications/telemetry.js"(exports2, module2) {
    var util2 = require_util();
    var TelemetryType = Object.freeze({
      TELEMETRY: "TELEMETRY",
      TELEMETRY_MODE_BATCH: "TELEMETRY_MODE_BATCH"
    });
    var OntologyConstants = Object.freeze({
      RESISTANCE: {
        id: 1,
        ontology: "resistance",
        type: "int16",
        unit: "Ohm"
      },
      TEMPERATURE: {
        id: 2,
        ontology: "temperature",
        type: "float",
        unit: "Cel"
      },
      HUMIDITY: {
        id: 3,
        ontology: "humidity",
        type: "int16",
        unit: "%RH",
        factor: 10
      }
    });
    var counters = Object.keys(OntologyConstants).reduce((acc, key) => {
      const ontology = OntologyConstants[key];
      acc[ontology.ontology] = 0;
      return acc;
    }, {});
    function floatFromBytes(bytes) {
      const buffer = new ArrayBuffer(4);
      const view = new DataView(buffer);
      for (let i = 0; i < 4; i++) {
        view.setUint8(i, bytes[i]);
      }
      return view.getFloat32(0, false);
    }
    function formatFloat(float, decimals = 2) {
      return Number(float.toFixed(decimals));
    }
    function determineTelemetryMeasurements(data) {
      let index = 0;
      const ontologies = {};
      const dataLength = data.length;
      while (index < dataLength) {
        if (index >= dataLength) {
          throw new Error("Unexpected end of data.");
        }
        let ontology = determineOntology(data[index] & 127);
        let valueSize = data[index] >> 7 & 1;
        let value;
        if (ontology.type === "float") {
          if (valueSize === 1) {
            if (index + 4 >= dataLength) {
              throw new Error("Not enough data for a 4-byte float.");
            }
            value = floatFromBytes(data.slice(index + 1, index + 5));
            value = formatFloat(value);
            index += 5;
          } else {
            throw new Error("Unexpected value size for float.");
          }
        } else {
          if (valueSize === 1) {
            throw new Error("Unexpected value size for int.");
          }
          if (index + 2 >= dataLength) {
            throw new Error("Not enough data for a 2-byte value.");
          }
          value = util2.convertNegativeInt((data[index + 1] << 8) + data[index + 2], 2);
          index += 3;
        }
        const ontologyName = ontology.ontology;
        const unit = ontology.unit;
        const counter = counters[ontologyName];
        const key = "".concat(ontologyName, ":").concat(counter);
        ontologies[key] = { unitId: unit, record: value };
        counters[ontologyName]++;
      }
      Object.keys(ontologies).forEach((key) => {
        const baseKey = key.split(":")[0];
        if (counters[baseKey] === 1) {
          const value = ontologies[key];
          delete ontologies[key];
          ontologies[baseKey] = value;
        }
      });
      return ontologies;
    }
    function determineOntology(value) {
      const ontology = Object.values(OntologyConstants).find((o) => o.id === value);
      if (ontology) {
        return ontology;
      } else {
        throw new Error("Ontology Unknown");
      }
    }
    module2.exports = {
      TelemetryType,
      determineTelemetryMeasurements
    };
  }
});

// ../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/messages/uplink/notifications/notification.js
var require_notification = __commonJS({
  "../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/messages/uplink/notifications/notification.js"(exports2, module2) {
    var systemClass = require_system();
    var temperatureClass = require_temperature();
    var accelerometerClass = require_accelerometer();
    var networkClass = require_network();
    var geozoningClass = require_geozoning();
    var telemetryClass2 = require_telemetry();
    var Class = Object.freeze({
      SYSTEM: "SYSTEM",
      SOS: "SOS",
      TEMPERATURE: "TEMPERATURE",
      ACCELEROMETER: "ACCELEROMETER",
      NETWORK: "NETWORK",
      GEOZONING: "GEOZONING",
      TELEMETRY: "TELEMETRY"
    });
    var SosType = Object.freeze({
      SOS_ON: "SOS_ON",
      SOS_OFF: "SOS_OFF"
    });
    function Notification(notificationClass2, notificationType, system, sos, temperature, accelerometer, network, geozoning, telemetryMeasurements) {
      this.notificationClass = notificationClass2;
      this.notificationType = notificationType;
      this.system = system;
      this.sos = sos;
      this.temperature = temperature;
      this.accelerometer = accelerometer;
      this.network = network;
      this.geozoning = geozoning;
      this.telemetryMeasurements = telemetryMeasurements;
    }
    function determineNotification(payload) {
      if (payload.length < 5)
        throw new Error("The payload is not valid to determine notification message");
      let notificationMessage = new Notification();
      let classValue = payload[4] >> 4 & 15;
      let typeValue = payload[4] & 15;
      switch (classValue) {
        case 0:
          notificationMessage.notificationClass = Class.SYSTEM;
          switch (typeValue) {
            case 0:
              notificationMessage.notificationType = systemClass.SystemType.STATUS;
              notificationMessage.system = new systemClass.System(systemClass.determineStatus(payload), null, null, null, null, null, null, null);
              break;
            case 1:
              notificationMessage.notificationType = systemClass.SystemType.LOW_BATTERY;
              notificationMessage.system = new systemClass.System(null, systemClass.determineLowBattery(payload), null, null, null, null, null);
              break;
            case 2:
              notificationMessage.notificationType = systemClass.SystemType.BLE_STATUS;
              notificationMessage.system = new systemClass.System(null, null, systemClass.determineBleStatus(payload), null, null, null, null, null);
              break;
            case 3:
              notificationMessage.notificationType = systemClass.SystemType.TAMPER_DETECTION;
              notificationMessage.system = new systemClass.System(null, null, null, systemClass.determineTamperDetection(payload), null, null, null, null);
              break;
            case 4:
              notificationMessage.notificationType = systemClass.SystemType.HEARTBEAT;
              notificationMessage.system = new systemClass.System(null, null, null, null, systemClass.determineHeartbeat(payload), null, null, null);
              break;
            case 5:
              notificationMessage.notificationType = systemClass.SystemType.SHUTDOWN;
              notificationMessage.system = new systemClass.System(null, null, null, null, null, systemClass.determineShutdownCause(payload), null, null);
              break;
            case 6:
              notificationMessage.notificationType = systemClass.SystemType.DATA_BUFFERING_STATUS;
              notificationMessage.system = new systemClass.System(null, null, null, null, null, null, systemClass.determineDataBuffering(payload), null);
              break;
            case 7:
              notificationMessage.notificationType = systemClass.SystemType.FUOTA;
              notificationMessage.system = new systemClass.System(null, null, null, null, null, null, null, systemClass.determineFuota(payload));
              break;
            default:
              throw new Error("System Notification Type Unknown");
          }
          break;
        case 1:
          notificationMessage.notificationClass = Class.SOS;
          switch (typeValue) {
            case 0:
              notificationMessage.notificationType = SosType.SOS_ON;
              break;
            case 1:
              notificationMessage.notificationType = SosType.SOS_OFF;
              break;
            default:
              throw new Error("SOS Notification Type Unknown");
          }
          break;
        case 2:
          notificationMessage.notificationClass = Class.TEMPERATURE;
          switch (typeValue) {
            case 0:
              notificationMessage.notificationType = temperatureClass.TempType.TEMP_HIGH;
              notificationMessage.temperature = temperatureClass.determineTemperature(payload);
              break;
            case 1:
              notificationMessage.notificationType = temperatureClass.TempType.TEMP_LOW;
              notificationMessage.temperature = temperatureClass.determineTemperature(payload);
              break;
            case 2:
              notificationMessage.notificationType = temperatureClass.TempType.TEMP_NORMAL;
              notificationMessage.temperature = temperatureClass.determineTemperature(payload);
              break;
            default:
              throw new Error("Temperature Notification Type Unknown");
          }
          break;
        case 3:
          notificationMessage.notificationClass = Class.ACCELEROMETER;
          switch (typeValue) {
            case 0:
              notificationMessage.notificationType = accelerometerClass.AcceleroType.MOTION_START;
              break;
            case 1:
              notificationMessage.notificationType = accelerometerClass.AcceleroType.MOTION_END;
              notificationMessage.accelerometer = new accelerometerClass.Accelerometer(accelerometerClass.determineAccelerationVector(payload, 5, 7, 9), accelerometerClass.determineMotion(payload), null, null);
              break;
            case 2:
              notificationMessage.notificationType = accelerometerClass.AcceleroType.SHOCK;
              notificationMessage.accelerometer = new accelerometerClass.Accelerometer(accelerometerClass.determineAccelerationVector(payload, 5, 7, 9), null, accelerometerClass.determineGaddIndex(payload), accelerometerClass.determineNumberShocks(payload));
              break;
            default:
              throw new Error("Accelerometer Notification Type Unknown");
          }
          break;
        case 4:
          notificationMessage.notificationClass = Class.NETWORK;
          switch (typeValue) {
            case 0:
              notificationMessage.notificationType = networkClass.NetworkType.MAIN_UP;
              notificationMessage.network = networkClass.determineNetworkInfo(payload);
              break;
            case 1:
              notificationMessage.notificationType = networkClass.NetworkType.BACKUP_UP;
              notificationMessage.network = networkClass.determineNetworkInfo(payload);
              break;
            default:
              throw new Error("Network Notification Type Unknown");
          }
          break;
        case 5:
          notificationMessage.notificationClass = Class.GEOZONING;
          switch (typeValue) {
            case 0:
              notificationMessage.notificationType = geozoningClass.GeozoningType.ENTRY;
              break;
            case 1:
              notificationMessage.notificationType = geozoningClass.GeozoningType.EXIT;
              break;
            case 2:
              notificationMessage.notificationType = geozoningClass.GeozoningType.IN_HAZARD;
              break;
            case 3:
              notificationMessage.notificationType = geozoningClass.GeozoningType.OUT_HAZARD;
              break;
            case 4:
              notificationMessage.notificationType = geozoningClass.GeozoningType.MEETING_POINT;
              break;
            default:
              throw new Error("Geozoning Notification Type Unknown");
          }
          break;
        case 6:
          notificationMessage.notificationClass = Class.TELEMETRY;
          switch (typeValue) {
            case 0:
              notificationMessage.notificationType = telemetryClass2.TelemetryType.TELEMETRY;
              notificationMessage.telemetryMeasurements = telemetryClass2.determineTelemetryMeasurements(payload.slice(5));
              break;
            case 1:
              notificationMessage.notificationType = telemetryClass2.TelemetryType.TELEMETRY_MODE_BATCH;
              break;
            default:
              throw new Error("Telemetry Notification Type Unknown");
          }
          break;
        default:
          throw new Error("Notification Class Unknown");
      }
      return notificationMessage;
    }
    module2.exports = {
      Notification,
      determineNotification,
      Class
    };
  }
});

// ../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/messages/uplink/positions/triggerBitMap.js
var require_triggerBitMap = __commonJS({
  "../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/messages/uplink/positions/triggerBitMap.js"(exports2, module2) {
    function TriggerBitMap(geoTriggerPod, geoTriggerSos, geoTriggerMotionStart, geoTriggerMotionStop, geoTriggerInMotion, geoTriggerInStatic, geoTriggerShock, geoTriggerTempHighThreshold, geoTriggerTempLowThreshold, geoTriggerGeozoning) {
      this.geoTriggerPod = geoTriggerPod;
      this.geoTriggerSos = geoTriggerSos;
      this.geoTriggerMotionStart = geoTriggerMotionStart;
      this.geoTriggerMotionStop = geoTriggerMotionStop;
      this.geoTriggerInMotion = geoTriggerInMotion;
      this.geoTriggerInStatic = geoTriggerInStatic;
      this.geoTriggerShock = geoTriggerShock;
      this.geoTriggerTempHighThreshold = geoTriggerTempHighThreshold;
      this.geoTriggerTempLowThreshold = geoTriggerTempLowThreshold;
      this.geoTriggerGeozoning = geoTriggerGeozoning;
    }
    module2.exports = {
      TriggerBitMap
    };
  }
});

// ../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/messages/uplink/positions/ble/beaconInfo.js
var require_beaconInfo = __commonJS({
  "../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/messages/uplink/positions/ble/beaconInfo.js"(exports2, module2) {
    function BeaconIdInfo(id, rssi) {
      this.id = id;
      this.rssi = rssi;
    }
    function BeaconMacInfo(mac, rssi) {
      this.mac = mac;
      this.rssi = rssi;
    }
    module2.exports = {
      BeaconIdInfo,
      BeaconMacInfo
    };
  }
});

// ../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/messages/uplink/positions/ble/blePosition.js
var require_blePosition = __commonJS({
  "../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/messages/uplink/positions/ble/blePosition.js"(exports2, module2) {
    var util2 = require_util();
    var BeaconInfoClass = require_beaconInfo();
    function determineBleIdShortPositionMessage(payload) {
      return extractBeaconInfos(payload, 3, (payload2, index) => {
        let key = "".concat(util2.convertByteToString(payload2[index * 3]), "-").concat(util2.convertByteToString(payload2[1 + index * 3]));
        let value = util2.convertNegativeInt(payload2[2 + index * 3], 1);
        return new BeaconInfoClass.BeaconIdInfo(key, value);
      });
    }
    function determineBleIdLongPositionMessage(payload) {
      return extractBeaconInfos(payload, 17, (payload2, index) => {
        let key = Array.from({ length: 16 }, (_, i) => util2.convertByteToString(payload2[i + index * 17])).join("-");
        let value = util2.convertNegativeInt(payload2[16 + index * 17], 1);
        return new BeaconInfoClass.BeaconIdInfo(key, value);
      });
    }
    function determineBleMacPositionMessage(payload) {
      return extractBeaconInfos(payload, 7, (payload2, index) => {
        let key = Array.from({ length: 6 }, (_, i) => util2.convertByteToString(payload2[i + index * 7])).join(":");
        let value = util2.convertNegativeInt(payload2[6 + index * 7], 1);
        return new BeaconInfoClass.BeaconMacInfo(key, value);
      });
    }
    function extractBeaconInfos(payload, chunkSize, createBeaconInfo) {
      const beaconInfos = [];
      const count = Math.floor(payload.length / chunkSize);
      for (let i = 0; i < count; i++) {
        beaconInfos.push(createBeaconInfo(payload, i));
      }
      return beaconInfos;
    }
    module2.exports = {
      determineBleMacPositionMessage,
      determineBleIdShortPositionMessage,
      determineBleIdLongPositionMessage
    };
  }
});

// ../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/messages/uplink/positions/gnss/satelliteInfo.js
var require_satelliteInfo = __commonJS({
  "../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/messages/uplink/positions/gnss/satelliteInfo.js"(exports2, module2) {
    var Constellation = Object.freeze({
      GPS: "GPS",
      BEIDOU: "BEIDOU"
    });
    var CN = Object.freeze({
      0: ">45dB",
      1: "[41..45]dB",
      2: "[37..41]dB",
      3: "<37dB"
    });
    function SatelliteInfo(constellation, id, cn, pseudoRangeValue) {
      this.constellation = constellation;
      this.id = id;
      this.cn = cn;
      this.pseudoRangeValue = pseudoRangeValue;
    }
    module2.exports = {
      SatelliteInfo,
      Constellation,
      CN
    };
  }
});

// ../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/messages/uplink/positions/gnss/gnssFix.js
var require_gnssFix = __commonJS({
  "../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/messages/uplink/positions/gnss/gnssFix.js"(exports2, module2) {
    var util2 = require_util();
    function GnssFix(latitude, longitude, altitude, COG, SOG, EHPE, quality) {
      this.latitude = latitude;
      this.longitude = longitude;
      this.altitude = altitude;
      this.COG = COG;
      this.SOG = SOG;
      this.EHPE = EHPE;
      this.quality = quality;
    }
    var fixQuality = Object.freeze({
      INVALID: "INVALID",
      VALID: "VALID",
      FIX_2D: "FIX_2D",
      FIX_3D: "FIX_3D"
    });
    function QualityInfo(fixQuality2, numberSatelliteUsed) {
      this.fixQuality = fixQuality2;
      this.numberSatelliteUsed = numberSatelliteUsed;
    }
    function determineGnssFix(payload) {
      let mt3333GnssFixInfo = new GnssFix();
      mt3333GnssFixInfo.latitude = util2.twoComplement(parseInt(util2.convertBytesToString(payload.slice(0, 4)), 16)) / Math.pow(10, 7);
      mt3333GnssFixInfo.longitude = util2.twoComplement(parseInt(util2.convertBytesToString(payload.slice(4, 8)), 16)) / Math.pow(10, 7);
      mt3333GnssFixInfo.altitude = determineAltitude(payload);
      mt3333GnssFixInfo.COG = determineCourseOverGround(payload);
      mt3333GnssFixInfo.SOG = determineSpeedOverGround(payload);
      mt3333GnssFixInfo.EHPE = determineEstimatedHorizontalPositionError(payload);
      mt3333GnssFixInfo.quality = determineFixQuality(payload);
      return mt3333GnssFixInfo;
    }
    function determineAltitude(payload) {
      if (payload.length < 10)
        throw new Error("The payload is not valid to determine GPS altitude");
      return util2.convertNegativeInt((payload[8] << 8) + payload[9], 2);
    }
    function determineCourseOverGround(payload) {
      if (payload.length < 12)
        throw new Error("The payload is not valid to determine GPS course over ground");
      return (payload[10] << 8) + payload[11];
    }
    function determineSpeedOverGround(payload) {
      if (payload.length < 14)
        throw new Error("The payload is not valid to determine GPS speed over ground");
      return (payload[12] << 8) + payload[13];
    }
    function determineEstimatedHorizontalPositionError(payload) {
      if (payload.length < 15)
        throw new Error("The payload is not valid to determine horizontal accuracy");
      var ehpeValue = payload[14];
      if (ehpeValue > 250) {
        switch (ehpeValue) {
          case 251:
            ehpeValue = "(250,500]";
            break;
          case 252:
            ehpeValue = "(500,1000]";
            break;
          case 253:
            ehpeValue = "(1000,2000]";
            break;
          case 254:
            ehpeValue = "(2000,4000]";
            break;
          case 255:
            ehpeValue = ">4000";
            break;
        }
      }
      return ehpeValue;
    }
    function determineFixQuality(payload) {
      let quality = payload[15] >> 5 & 7;
      let qualityInfo = new QualityInfo();
      switch (quality) {
        case 0:
          qualityInfo.fixQuality = fixQuality.INVALID;
          break;
        case 1:
          qualityInfo.fixQuality = fixQuality.VALID;
          break;
        case 2:
          qualityInfo.fixQuality = fixQuality.FIX_2D;
          break;
        case 3:
          qualityInfo.fixQuality = fixQuality.FIX_3D;
          break;
      }
      qualityInfo.numberSatellitesUsed = payload[15] & 15;
      return qualityInfo;
    }
    module2.exports = {
      GnssFix,
      determineGnssFix
    };
  }
});

// ../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/messages/uplink/positions/gnss/gnssFailure.js
var require_gnssFailure = __commonJS({
  "../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/messages/uplink/positions/gnss/gnssFailure.js"(exports2, module2) {
    function GnssFailure(timeoutCause, satelliteSeen) {
      this.timeoutCause = timeoutCause;
      this.satellitesSeen = satelliteSeen;
    }
    var timeOutCause = Object.freeze({
      T0_TIMEOUT: "T0_TIMEOUT",
      T1_TIMEOUT: "T1_TIMEOUT",
      ACQUISITION_TIMEOUT: "ACQUISITION_TIMEOUT"
    });
    var constellation = Object.freeze({
      GPS: "GPS",
      GLONASS: "GLONASS",
      BEIDOU: "BEIDOU",
      GALILEO: "GALILEO"
    });
    function determineTimeoutCause(timeoutCause) {
      switch (timeoutCause) {
        case 0:
          return timeOutCause.T0_TIMEOUT;
        case 1:
          return timeOutCause.T1_TIMEOUT;
        case 2:
          return timeOutCause.ACQUISITION_TIMEOUT;
        default:
          throw new Error("The timeout cause is unknown");
      }
    }
    function determineConstellation(cons) {
      switch (cons) {
        case 0:
          return constellation.GPS;
        case 1:
          return constellation.GLONASS;
        case 2:
          return constellation.BEIDOU;
        case 3:
          return constellation.GALILEO;
        default:
          throw new Error("The constellation is unknown");
      }
    }
    function determineGnssFailure(payload) {
      let timeoutCause = determineTimeoutCause(payload[0] >> 5 & 7);
      let nbSatSeen = payload[0] & 15;
      payload = payload.slice(1);
      let satelliteSeen = [];
      for (let i = 0; i < nbSatSeen * 2; i += 2) {
        let svId = payload[i];
        let constellation2 = determineConstellation(payload[i] + 1 >> 6 & 3);
        let CN = payload[i + 1] & 63;
        satelliteSeen.push({ svId, constellation: constellation2, CN });
      }
      return new GnssFailure(timeoutCause, satelliteSeen);
    }
    module2.exports = {
      GnssFailure,
      determineGnssFailure
    };
  }
});

// ../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/messages/uplink/positions/wifi/bssidInfo.js
var require_bssidInfo = __commonJS({
  "../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/messages/uplink/positions/wifi/bssidInfo.js"(exports2, module2) {
    function BssidInfo(mac, rssi) {
      this.mac = mac;
      this.rssi = rssi;
    }
    module2.exports = {
      BssidInfo
    };
  }
});

// ../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/messages/uplink/positions/wifi/wifiPosition.js
var require_wifiPosition = __commonJS({
  "../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/messages/uplink/positions/wifi/wifiPosition.js"(exports2, module2) {
    var BssidInfoClass = require_bssidInfo();
    var util2 = require_util();
    function determineWifiPositionMessage(payload) {
      const wifiBssids = [];
      var i = 0;
      while (payload.length >= 7 * (i + 1)) {
        let key = util2.convertByteToString(payload[i * 7]) + ":" + util2.convertByteToString(payload[1 + i * 7]) + ":" + util2.convertByteToString(payload[2 + i * 7]) + ":" + util2.convertByteToString(payload[3 + i * 7]) + ":" + util2.convertByteToString(payload[4 + i * 7]) + ":" + util2.convertByteToString(payload[5 + i * 7]);
        let value = util2.convertNegativeInt(payload[6 + i * 7], 1);
        wifiBssids.push(new BssidInfoClass.BssidInfo(key, value));
        i++;
      }
      return wifiBssids;
    }
    module2.exports = {
      determineWifiPositionMessage
    };
  }
});

// ../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/messages/uplink/positions/position.js
var require_position = __commonJS({
  "../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/messages/uplink/positions/position.js"(exports2, module2) {
    var TriggerBitMapClass = require_triggerBitMap();
    var bleClass = require_blePosition();
    var util2 = require_util();
    var SatelliteInfoClass = require_satelliteInfo();
    var gnssFixClass = require_gnssFix();
    var gnssFailureClass = require_gnssFailure();
    var wifiClass = require_wifiPosition();
    var gnssFailure = require_gnssFailure();
    var PositionStatus = Object.freeze({
      SUCCESS: "SUCCESS",
      TIMEOUT: "TIMEOUT",
      FAILURE: "FAILURE",
      NOT_SOLVABLE: "NOT_SOLVABLE"
    });
    var PositionType = Object.freeze({
      LR11xx_A_GNSS: "LR11xx_A_GNSS",
      LR11xx_GNSS_NAV1: "LR11xx_GNSS_NAV1",
      LR11xx_GNSS_NAV2: "LR11xx_GNSS_NAV2",
      WIFI: "WIFI",
      BLE_SCAN1_MAC: "BLE_SCAN1_MAC",
      BLE_SCAN1_SHORT: "BLE_SCAN1_SHORT",
      BLE_SCAN1_LONG: "BLE_SCAN1_LONG",
      BLE_SCAN2_MAC: "BLE_SCAN2_MAC",
      BLE_SCAN2_SHORT: "BLE_SCAN12_SHORT",
      BLE_SCAN2_LONG: "BLE_SCAN2_LONG",
      GNSS: "GNSS",
      AIDED_GNSS: "AIDED_GNSS"
    });
    function Position(motion, motionCounter, status, positionType, triggers, lr11xxAGnss, lr11xxGnssNav1, lr11xxGnssNav2, wifiBssids, bleBeaconMacs, bleBeaconIds, gnssFix, gnssFailure2, aidedGnss, coordinates) {
      this.motion = motion;
      this.motionCounter = motionCounter;
      this.status = status;
      this.positionType = positionType;
      this.triggers = triggers;
      this.lr11xxAGnss = lr11xxAGnss;
      this.lr11xxGnssNav1 = lr11xxGnssNav1;
      this.lr11xxGnssNav2 = lr11xxGnssNav2;
      this.wifiBssids = wifiBssids;
      this.bleBeaconMacs = bleBeaconMacs;
      this.bleBeaconIds = bleBeaconIds;
      this.gnssFix = gnssFix;
      this.gnssFailure = gnssFailure2;
      this.aidedGnss = aidedGnss;
      this.coordinates = coordinates;
    }
    function determinePositionHeader(payload, startingByte2) {
      let positionMessage = new Position();
      positionMessage.motion = payload[startingByte2] >> 7 & 1;
      var statusValue = payload[startingByte2] >> 5 & 3;
      switch (statusValue) {
        case 0:
          positionMessage.status = PositionStatus.SUCCESS;
          break;
        case 1:
          positionMessage.status = PositionStatus.TIMEOUT;
          break;
        case 2:
          positionMessage.status = PositionStatus.FAILURE;
          break;
        case 3:
          positionMessage.status = PositionStatus.NOT_SOLVABLE;
          break;
      }
      var typeValue = payload[startingByte2] & 15;
      switch (typeValue) {
        case 0:
          positionMessage.positionType = PositionType.LR11xx_A_GNSS;
          break;
        case 1:
          positionMessage.positionType = PositionType.LR11xx_GNSS_NAV1;
          break;
        case 2:
          positionMessage.positionType = PositionType.LR11xx_GNSS_NAV2;
          break;
        case 3:
          positionMessage.positionType = PositionType.WIFI;
          break;
        case 4:
          positionMessage.positionType = PositionType.BLE_SCAN1_MAC;
          break;
        case 5:
          positionMessage.positionType = PositionType.BLE_SCAN1_SHORT;
          break;
        case 6:
          positionMessage.positionType = PositionType.BLE_SCAN1_LONG;
          break;
        case 7:
          positionMessage.positionType = PositionType.BLE_SCAN2_MAC;
          break;
        case 8:
          positionMessage.positionType = PositionType.BLE_SCAN2_SHORT;
          break;
        case 9:
          positionMessage.positionType = PositionType.BLE_SCAN2_LONG;
          break;
        case 10:
          positionMessage.positionType = PositionType.GNSS;
          break;
        case 11:
          positionMessage.positionType = PositionType.AIDED_GNSS;
          break;
      }
      positionMessage.motionCounter = payload[startingByte2 + 1] & 15;
      positionMessage.triggers = new TriggerBitMapClass.TriggerBitMap(
        payload[startingByte2 + 3] & 1,
        payload[startingByte2 + 3] >> 1 & 1,
        payload[startingByte2 + 3] >> 2 & 1,
        payload[startingByte2 + 3] >> 3 & 1,
        payload[startingByte2 + 3] >> 4 & 1,
        payload[startingByte2 + 3] >> 5 & 1,
        payload[startingByte2 + 3] >> 6 & 1,
        payload[startingByte2 + 3] >> 7 & 1,
        payload[startingByte2 + 2] & 1,
        payload[startingByte2 + 2] >> 1 & 1
      );
      return positionMessage;
    }
    function determineLR1110GnssPositionMessage(payload) {
      let lr1110gnss = {};
      lr1110gnss.time = (payload[0] << 8 + payload[1]) * 16;
      var i = 0;
      let satelliteInfos = [];
      while (payload.length >= 2 + 4 * (i + 1)) {
        var satelliteInfo = new SatelliteInfoClass.SatelliteInfo();
        var c = payload[2 + 4 * i] >> 6 & 3;
        switch (c) {
          case 0:
            satelliteInfo.constellation = SatelliteInfoClass.Constellation.GPS;
            break;
          case 1:
            satelliteInfo.constellation = SatelliteInfoClass.Constellation.BEIDOU;
            break;
        }
        var id = payload[2 + 4 * i] & 63;
        var cnValue = payload[3 + 4 * i] >> 6 & 3;
        switch (cnValue) {
          case 0:
            satelliteInfo.cn = SatelliteInfoClass.CN[0];
            break;
          case 1:
            satelliteInfo.cn = SatelliteInfoClass.CN[1];
            break;
          case 2:
            satelliteInfo.cn = SatelliteInfoClass.CN[2];
            break;
          case 3:
            satelliteInfo.cn = SatelliteInfoClass.CN[3];
            break;
        }
        satelliteInfo.pseudoRangeValue = (payload[3 + 4 * i] & 7) << 16 + payload[4 + 4 * i] << 8 + payload[5 + 4 * i];
        satelliteInfos.push(satelliteInfo);
        i++;
      }
      lr1110gnss.satelliteInfos = satelliteInfos;
      return lr1110gnss;
    }
    function determinePosition(payload, multiFrame2) {
      var startingByte2 = 4;
      if (multiFrame2) {
        startingByte2 = 5;
      }
      let positionMessage = determinePositionHeader(payload, startingByte2);
      if (positionMessage.status == PositionStatus.SUCCESS || positionMessage.status == PositionStatus.NOT_SOLVABLE) {
        switch (positionMessage.positionType) {
          case PositionType.LR11xx_A_GNSS:
            positionMessage.lr11xxAGnss = determineLR1110GnssPositionMessage(payload.slice(startingByte2 + 4));
            break;
          case PositionType.LR11xx_GNSS_NAV1:
            positionMessage.lr11xxGnssNav1 = util2.convertBytesToString(payload.slice(startingByte2 + 4));
            break;
          case PositionType.LR11xx_GNSS_NAV2:
            positionMessage.lr11xxGnssNav2 = util2.convertBytesToString(payload.slice(startingByte2 + 4));
            break;
          case PositionType.WIFI:
            positionMessage.wifiBssids = wifiClass.determineWifiPositionMessage(payload.slice(startingByte2 + 4));
            break;
          case PositionType.BLE_SCAN1_MAC:
            positionMessage.bleBeaconMacs = bleClass.determineBleMacPositionMessage(payload.slice(startingByte2 + 4));
            break;
          case PositionType.BLE_SCAN1_SHORT:
            positionMessage.bleBeaconIds = bleClass.determineBleIdShortPositionMessage(payload.slice(startingByte2 + 4));
            break;
          case PositionType.BLE_SCAN1_LONG:
            positionMessage.bleBeaconIds = bleClass.determineBleIdLongPositionMessage(payload.slice(startingByte2 + 4));
            break;
          case PositionType.BLE_SCAN2_MAC:
            positionMessage.bleBeaconMacs = bleClass.determineBleMacPositionMessage(payload.slice(startingByte2 + 4));
            break;
          case PositionType.BLE_SCAN2_SHORT:
            positionMessage.bleBeaconIds = bleClass.determineBleIdShortPositionMessage(payload.slice(startingByte2 + 4));
            break;
          case PositionType.BLE_SCAN2_LONG:
            positionMessage.bleBeaconIds = bleClass.determineBleIdLongPositionMessage(payload.slice(startingByte2 + 4));
            break;
          case PositionType.GNSS:
            positionMessage.gnssFix = gnssFixClass.determineGnssFix(payload.slice(startingByte2 + 4));
            positionMessage.coordinates = [positionMessage.gnssFix.longitude, positionMessage.gnssFix.latitude, positionMessage.gnssFix.altitude];
            break;
          case PositionType.AIDED_GNSS:
            break;
        }
      } else if (positionMessage.status == PositionStatus.TIMEOUT || positionMessage.status == PositionStatus.FAILURE) {
        if (positionMessage.positionType == PositionType.GNSS) {
          positionMessage.gnssFailure = gnssFailureClass.determineGnssFailure(payload.slice(startingByte2 + 4));
        }
      }
      return positionMessage;
    }
    module2.exports = {
      Position,
      determinePosition
    };
  }
});

// ../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/resources/parameters.json
var require_parameters = __commonJS({
  "../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/resources/parameters.json"(exports2, module2) {
    module2.exports = [
      {
        firmwareVersion: "3.0",
        uplinkPort: "19",
        firmwareParameters: [
          {
            driverParameterName: "sysHighestTemperature",
            groupId: "0x00",
            localId: "0x00",
            defaultValue: 0,
            unit: "Cel",
            description: "Highest temperature reached",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: -100,
                maximum: 100
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "sysLowestTemperature",
            groupId: "0x00",
            localId: "0x01",
            defaultValue: 0,
            unit: "Cel",
            description: "Lowest temperature reached",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: -100,
                maximum: 100
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "sysPowerConsumption",
            groupId: "0x00",
            localId: "0x02",
            defaultValue: 0,
            unit: "mAH",
            description: "Total power consumed",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 0
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "coreMonitoringPeriod",
            groupId: "0x01",
            localId: "0x00",
            defaultValue: 300,
            unit: "s",
            description: "Device monitoring period",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 15
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "coreStatusPeriod",
            groupId: "0x01",
            localId: "0x01",
            defaultValue: 3600,
            unit: "s",
            description: "Status monitoring period",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 0
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "coreNotifEnable",
            groupId: "0x01",
            localId: "0x02",
            defaultValue: "{0B,00,00,00,00,00}",
            description: "Enables core notifications for various events.",
            parameterType: {
              type: "ParameterTypeByteArray",
              size: 6,
              distinctValues: true,
              properties: [
                {
                  name: "systemClass",
                  type: "PropertyObject",
                  properties: [
                    {
                      name: "status",
                      type: "PropertyBoolean",
                      description: "System status Versions, temperature, reset cause."
                    },
                    {
                      name: "lowBattery",
                      type: "PropertyBoolean",
                      description: "Low battery alert."
                    },
                    {
                      name: "bleStatus",
                      type: "PropertyBoolean",
                      description: "Bluetooth Low Energy status"
                    },
                    {
                      name: "tamperDetection",
                      type: "PropertyBoolean",
                      description: "Tamper detection alert."
                    },
                    {
                      name: "heartbeat",
                      type: "PropertyBoolean",
                      description: "Heartbeat message."
                    },
                    {
                      name: "shutdown",
                      type: "PropertyBoolean",
                      description: "Shutdown message."
                    },
                    {
                      name: "dataBuffering",
                      type: "PropertyBoolean",
                      description: "Data buffering status"
                    }
                  ]
                },
                {
                  name: "sosClass",
                  type: "PropertyObject",
                  properties: [
                    {
                      name: "sosOn",
                      type: "PropertyBoolean",
                      description: "SOS activated."
                    },
                    {
                      name: "sosOff",
                      type: "PropertyBoolean",
                      description: "SOS deactivated."
                    }
                  ]
                },
                {
                  name: "temperatureClass",
                  type: "PropertyObject",
                  properties: [
                    {
                      name: "tempHigh",
                      type: "PropertyBoolean",
                      description: "Critical high temperature reached"
                    },
                    {
                      name: "tempLow",
                      type: "PropertyBoolean",
                      description: "Critical low temperature reached"
                    },
                    {
                      name: "tempNormal",
                      type: "PropertyBoolean",
                      description: "Temperature back to normal"
                    }
                  ]
                },
                {
                  name: "accelerometerClass",
                  type: "PropertyObject",
                  properties: [
                    {
                      name: "motionStart",
                      type: "PropertyBoolean",
                      description: "Motion start detected."
                    },
                    {
                      name: "motionEnd",
                      type: "PropertyBoolean",
                      description: "Motion end detected."
                    },
                    {
                      name: "shock",
                      type: "PropertyBoolean",
                      description: "Shock detected."
                    }
                  ]
                },
                {
                  name: "networkingClass",
                  type: "PropertyObject",
                  properties: [
                    {
                      name: "mainUp",
                      type: "PropertyBoolean",
                      description: "Main network is up."
                    },
                    {
                      name: "backupUp",
                      type: "PropertyBoolean",
                      description: "Main network down. Backup is up."
                    }
                  ]
                },
                {
                  name: "geozoningClass",
                  type: "PropertyObject",
                  properties: [
                    {
                      name: "geozoningOn",
                      type: "PropertyBoolean",
                      description: "Geozoning is on."
                    }
                  ]
                }
              ],
              byteMask: [
                {
                  valueFor: "systemClass",
                  type: "BitMaskObject",
                  values: [
                    {
                      type: "BitMaskValue",
                      valueFor: "status",
                      bitShift: 0,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "lowBattery",
                      bitShift: 1,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "bleStatus",
                      bitShift: 2,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "tamperDetection",
                      bitShift: 3,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "heartbeat",
                      bitShift: 4,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "shutdown",
                      bitShift: 5,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "dataBuffering",
                      bitShift: 6,
                      length: 1
                    }
                  ]
                },
                {
                  valueFor: "sosClass",
                  type: "BitMaskObject",
                  values: [
                    {
                      type: "BitMaskValue",
                      valueFor: "sosOn",
                      bitShift: 0,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "sosOff",
                      bitShift: 1,
                      length: 1
                    }
                  ]
                },
                {
                  valueFor: "temperatureClass",
                  type: "BitMaskObject",
                  values: [
                    {
                      type: "BitMaskValue",
                      valueFor: "tempHigh",
                      bitShift: 0,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "tempLow",
                      bitShift: 1,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "tempNormal",
                      bitShift: 2,
                      length: 1
                    }
                  ]
                },
                {
                  valueFor: "accelerometerClass",
                  type: "BitMaskObject",
                  values: [
                    {
                      type: "BitMaskValue",
                      valueFor: "motionStart",
                      bitShift: 0,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "motionEnd",
                      bitShift: 1,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "shock",
                      bitShift: 2,
                      length: 1
                    }
                  ]
                },
                {
                  valueFor: "networkingClass",
                  type: "BitMaskObject",
                  values: [
                    {
                      type: "BitMaskValue",
                      valueFor: "mainUp",
                      bitShift: 0,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "backupUp",
                      bitShift: 1,
                      length: 1
                    }
                  ]
                },
                {
                  valueFor: "geozoningClass",
                  type: "BitMaskObject",
                  values: [
                    {
                      type: "BitMaskValue",
                      valueFor: "geozoningOn",
                      bitShift: 0,
                      length: 1
                    }
                  ]
                }
              ]
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "coreTempHighThreshold",
            groupId: "0x01",
            localId: "0x03",
            defaultValue: 60,
            unit: "Cel",
            description: "Highest temperature detection threshold",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: -100,
                maximum: 100
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "coreTempLowThreshold",
            groupId: "0x01",
            localId: "0x04",
            defaultValue: 0,
            unit: "Cel",
            description: "Lowest temperature detection threshold",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: -100,
                maximum: 100
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "coreTempHysteresis",
            groupId: "0x01",
            localId: "0x05",
            defaultValue: 5,
            unit: "Cel",
            description: "Temperature hysteresis",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: -100,
                maximum: 100
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "coreButton1Map",
            groupId: "0x01",
            localId: "0x06",
            description: "Button 1 mapping",
            parameterType: {
              type: "ParameterTypeBitMask",
              properties: [
                {
                  name: "buttonPress",
                  type: "PropertyString",
                  description: "Event to execute with a button press.",
                  possibleValues: [
                    "NO_ACTION",
                    "DISPLAY_BATTERY_LEVEL_ON_THE_LED",
                    "START_STOP_SOS",
                    "REQUEST_A_POSITION_ON_DEMAND",
                    "FORCE_AN_UPLINK_SYSTEM_STATUS_NOTIFICATION_TRANSMISSION",
                    "START_DEVICE",
                    "STOP_DEVICE",
                    "START_ONLY_SOS",
                    "START_BLE_ADVERTISING_FOR_CONNECTIVITY"
                  ],
                  firmwareValues: [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8
                  ]
                },
                {
                  name: "buttonLongPress",
                  type: "PropertyString",
                  description: "Event generated on a button long press.",
                  possibleValues: [
                    "NO_ACTION",
                    "DISPLAY_BATTERY_LEVEL_ON_THE_LED",
                    "START_STOP_SOS",
                    "REQUEST_A_POSITION_ON_DEMAND",
                    "FORCE_AN_UPLINK_SYSTEM_STATUS_NOTIFICATION_TRANSMISSION",
                    "START_DEVICE",
                    "STOP_DEVICE",
                    "START_ONLY_SOS",
                    "START_BLE_ADVERTISING_FOR_CONNECTIVITY"
                  ],
                  firmwareValues: [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8
                  ]
                },
                {
                  name: "buttonSingleClick",
                  type: "PropertyString",
                  description: "Event generated on a button single click.",
                  possibleValues: [
                    "NO_ACTION",
                    "DISPLAY_BATTERY_LEVEL_ON_THE_LED",
                    "START_STOP_SOS",
                    "REQUEST_A_POSITION_ON_DEMAND",
                    "FORCE_AN_UPLINK_SYSTEM_STATUS_NOTIFICATION_TRANSMISSION",
                    "START_DEVICE",
                    "STOP_DEVICE",
                    "START_ONLY_SOS",
                    "START_BLE_ADVERTISING_FOR_CONNECTIVITY"
                  ],
                  firmwareValues: [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8
                  ]
                },
                {
                  name: "buttonDoubleClicks",
                  type: "PropertyString",
                  description: "Event generated on a button double clicks.",
                  possibleValues: [
                    "NO_ACTION",
                    "DISPLAY_BATTERY_LEVEL_ON_THE_LED",
                    "START_STOP_SOS",
                    "REQUEST_A_POSITION_ON_DEMAND",
                    "FORCE_AN_UPLINK_SYSTEM_STATUS_NOTIFICATION_TRANSMISSION",
                    "START_DEVICE",
                    "STOP_DEVICE",
                    "START_ONLY_SOS",
                    "START_BLE_ADVERTISING_FOR_CONNECTIVITY"
                  ],
                  firmwareValues: [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8
                  ]
                },
                {
                  name: "buttonTripleClicksOrAbove",
                  type: "PropertyString",
                  description: "Event generated on a button triple clicks or above.",
                  possibleValues: [
                    "NO_ACTION",
                    "DISPLAY_BATTERY_LEVEL_ON_THE_LED",
                    "START_STOP_SOS",
                    "REQUEST_A_POSITION_ON_DEMAND",
                    "FORCE_AN_UPLINK_SYSTEM_STATUS_NOTIFICATION_TRANSMISSION",
                    "START_DEVICE",
                    "STOP_DEVICE",
                    "START_ONLY_SOS",
                    "START_BLE_ADVERTISING_FOR_CONNECTIVITY",
                    "REST_DEVICE"
                  ],
                  firmwareValues: [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8,
                    9
                  ]
                },
                {
                  name: "buttonSimpleSequence",
                  type: "PropertyString",
                  description: "Event generated on a button simple sequence.",
                  possibleValues: [
                    "NO_ACTION",
                    "DISPLAY_BATTERY_LEVEL_ON_THE_LED",
                    "START_STOP_SOS",
                    "REQUEST_A_POSITION_ON_DEMAND",
                    "FORCE_AN_UPLINK_SYSTEM_STATUS_NOTIFICATION_TRANSMISSION",
                    "START_DEVICE",
                    "STOP_DEVICE",
                    "START_ONLY_SOS",
                    "START_BLE_ADVERTISING_FOR_CONNECTIVITY"
                  ],
                  firmwareValues: [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8
                  ]
                }
              ],
              bitMask: [
                {
                  type: "BitMaskValue",
                  valueFor: "buttonPress",
                  bitShift: 0,
                  length: 4
                },
                {
                  type: "BitMaskValue",
                  valueFor: "buttonLongPress",
                  bitShift: 4,
                  length: 4
                },
                {
                  type: "BitMaskValue",
                  valueFor: "buttonSingleClick",
                  bitShift: 8,
                  length: 4
                },
                {
                  type: "BitMaskValue",
                  valueFor: "buttonDoubleClicks",
                  bitShift: 12,
                  length: 4
                },
                {
                  type: "BitMaskValue",
                  valueFor: "buttonTripleClicksOrAbove",
                  bitShift: 16,
                  length: 4
                },
                {
                  type: "BitMaskValue",
                  valueFor: "buttonSimpleSequence",
                  bitShift: 20,
                  length: 4
                }
              ]
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "coreButton2Map",
            groupId: "0x01",
            localId: "0x07",
            description: "Button 2 mapping",
            parameterType: {
              type: "ParameterTypeBitMask",
              properties: [
                {
                  name: "buttonPress",
                  type: "PropertyString",
                  description: "Event to execute with a button press.",
                  possibleValues: [
                    "NO_ACTION",
                    "DISPLAY_BATTERY_LEVEL_ON_THE_LED",
                    "START_STOP_SOS",
                    "REQUEST_A_POSITION_ON_DEMAND",
                    "FORCE_AN_UPLINK_SYSTEM_STATUS_NOTIFICATION_TRANSMISSION",
                    "START_DEVICE",
                    "STOP_DEVICE",
                    "START_ONLY_SOS",
                    "START_BLE_ADVERTISING_FOR_CONNECTIVITY"
                  ],
                  firmwareValues: [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8
                  ]
                },
                {
                  name: "buttonLongPress",
                  type: "PropertyString",
                  description: "Event generated on a button long press.",
                  possibleValues: [
                    "NO_ACTION",
                    "DISPLAY_BATTERY_LEVEL_ON_THE_LED",
                    "START_STOP_SOS",
                    "REQUEST_A_POSITION_ON_DEMAND",
                    "FORCE_AN_UPLINK_SYSTEM_STATUS_NOTIFICATION_TRANSMISSION",
                    "START_DEVICE",
                    "STOP_DEVICE",
                    "START_ONLY_SOS",
                    "START_BLE_ADVERTISING_FOR_CONNECTIVITY"
                  ],
                  firmwareValues: [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8
                  ]
                },
                {
                  name: "buttonSingleClick",
                  type: "PropertyString",
                  description: "Event generated on a button single click.",
                  possibleValues: [
                    "NO_ACTION",
                    "DISPLAY_BATTERY_LEVEL_ON_THE_LED",
                    "START_STOP_SOS",
                    "REQUEST_A_POSITION_ON_DEMAND",
                    "FORCE_AN_UPLINK_SYSTEM_STATUS_NOTIFICATION_TRANSMISSION",
                    "START_DEVICE",
                    "STOP_DEVICE",
                    "START_ONLY_SOS",
                    "START_BLE_ADVERTISING_FOR_CONNECTIVITY"
                  ],
                  firmwareValues: [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8
                  ]
                },
                {
                  name: "buttonDoubleClicks",
                  type: "PropertyString",
                  description: "Event generated on a button double clicks.",
                  possibleValues: [
                    "NO_ACTION",
                    "DISPLAY_BATTERY_LEVEL_ON_THE_LED",
                    "START_STOP_SOS",
                    "REQUEST_A_POSITION_ON_DEMAND",
                    "FORCE_AN_UPLINK_SYSTEM_STATUS_NOTIFICATION_TRANSMISSION",
                    "START_DEVICE",
                    "STOP_DEVICE",
                    "START_ONLY_SOS",
                    "START_BLE_ADVERTISING_FOR_CONNECTIVITY"
                  ],
                  firmwareValues: [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8
                  ]
                },
                {
                  name: "buttonTripleClicksOrAbove",
                  type: "PropertyString",
                  description: "Event generated on a button triple clicks or above.",
                  possibleValues: [
                    "NO_ACTION",
                    "DISPLAY_BATTERY_LEVEL_ON_THE_LED",
                    "START_STOP_SOS",
                    "REQUEST_A_POSITION_ON_DEMAND",
                    "FORCE_AN_UPLINK_SYSTEM_STATUS_NOTIFICATION_TRANSMISSION",
                    "START_DEVICE",
                    "STOP_DEVICE",
                    "START_ONLY_SOS",
                    "START_BLE_ADVERTISING_FOR_CONNECTIVITY"
                  ],
                  firmwareValues: [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8
                  ]
                },
                {
                  name: "buttonSimpleSequence",
                  type: "PropertyString",
                  description: "Event generated on a button simple sequence.",
                  possibleValues: [
                    "NO_ACTION",
                    "DISPLAY_BATTERY_LEVEL_ON_THE_LED",
                    "START_STOP_SOS",
                    "REQUEST_A_POSITION_ON_DEMAND",
                    "FORCE_AN_UPLINK_SYSTEM_STATUS_NOTIFICATION_TRANSMISSION",
                    "START_DEVICE",
                    "STOP_DEVICE",
                    "START_ONLY_SOS",
                    "START_BLE_ADVERTISING_FOR_CONNECTIVITY"
                  ],
                  firmwareValues: [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8
                  ]
                }
              ],
              bitMask: [
                {
                  type: "BitMaskValue",
                  valueFor: "buttonPress",
                  bitShift: 0,
                  length: 4
                },
                {
                  type: "BitMaskValue",
                  valueFor: "buttonLongPress",
                  bitShift: 4,
                  length: 4
                },
                {
                  type: "BitMaskValue",
                  valueFor: "buttonSingleClick",
                  bitShift: 8,
                  length: 4
                },
                {
                  type: "BitMaskValue",
                  valueFor: "buttonDoubleClicks",
                  bitShift: 12,
                  length: 4
                },
                {
                  type: "BitMaskValue",
                  valueFor: "buttonTripleClicksOrAbove",
                  bitShift: 16,
                  length: 4
                },
                {
                  type: "BitMaskValue",
                  valueFor: "buttonSimpleSequence",
                  bitShift: 20,
                  length: 4
                }
              ]
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "coreButtonsTiming",
            groupId: "0x01",
            localId: "0x08",
            description: "Define the buttons timing parameters.",
            parameterType: {
              type: "ParameterTypeBitMask",
              properties: [
                {
                  name: "durationButtonPress",
                  type: "PropertyNumber",
                  description: "Duration of the button press in seconds."
                },
                {
                  name: "durationButtonLongPress",
                  type: "PropertyNumber",
                  description: "Duration of the button long press in seconds."
                },
                {
                  name: "debounceDurationOnButton1",
                  type: "PropertyNumber",
                  description: "Debounce duration on button 1 in milliseconds."
                },
                {
                  name: "debounceDurationOnButton2",
                  type: "PropertyNumber",
                  description: "Debounce duration on button 2 in milliseconds."
                }
              ],
              bitMask: [
                {
                  type: "BitMaskValue",
                  valueFor: "durationButtonPress",
                  bitShift: 0,
                  length: 4
                },
                {
                  type: "BitMaskValue",
                  valueFor: "durationButtonLongPress",
                  bitShift: 4,
                  length: 4
                },
                {
                  type: "BitMaskValue",
                  valueFor: "debounceDurationOnButton1",
                  bitShift: 8,
                  length: 8
                },
                {
                  type: "BitMaskValue",
                  valueFor: "debounceDurationOnButton2",
                  bitShift: 16,
                  length: 8
                }
              ]
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "coreLed0Map",
            groupId: "0x01",
            localId: "0x09",
            defaultValue: "{00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00}",
            description: "Defines LED patterns for system events. Configurable as 10 slices of 3 bytes each.",
            parameterType: {
              type: "ParameterTypeByteArray",
              size: 30,
              distinctValues: false,
              properties: [
                {
                  name: "slice",
                  type: "PropertByteArray",
                  size: 3,
                  distinctValues: true,
                  properties: [
                    {
                      name: "systemEventClass",
                      type: "PropertyString",
                      description: "System event class.",
                      possibleValues: [
                        "BUTTON1",
                        "BUTTON2",
                        "BUZZER",
                        "ACCELEROMETER",
                        "POWER",
                        "TEMPERATURE",
                        "GEOLOCATION",
                        "CONFIGURATION",
                        "NETWORK",
                        "CORE",
                        "BLE_CONNECTIVITY",
                        "USER"
                      ],
                      firmwareValues: [
                        0,
                        1,
                        2,
                        3,
                        4,
                        5,
                        6,
                        7,
                        8,
                        9,
                        10,
                        11
                      ]
                    },
                    {
                      name: "patternLoopExtension",
                      type: "PropertyNumber",
                      description: "Pattern loop extension."
                    },
                    {
                      name: "patternInversion",
                      type: "PropertyBoolean",
                      description: "Indicates whether the pattern is inverted."
                    },
                    {
                      name: "type",
                      type: "PropertyNumber",
                      description: "System event type."
                    },
                    {
                      name: "patternIdentifier",
                      type: "PropertyString",
                      description: "Defines the LED behavior.",
                      possibleValues: [
                        "NOT_CONFIGURED",
                        "LED_OFF",
                        "LED_ON",
                        "FADE_IN",
                        "FADE_OUT",
                        "BLINK_SLOW",
                        "BLINK_MEDIUM",
                        "BLINK_FAST",
                        "FLASH_SLOW",
                        "FLASH_FAST",
                        "HEART_ON"
                      ],
                      firmwareValues: [
                        0,
                        1,
                        2,
                        3,
                        4,
                        5,
                        6,
                        7,
                        8,
                        9,
                        10
                      ]
                    },
                    {
                      name: "patternLoop",
                      type: "PropertyNumber",
                      description: "Number of times the pattern is displayed."
                    }
                  ],
                  bitMask: [
                    {
                      type: "BitMaskValue",
                      valueFor: "systemEventClass",
                      bitShift: 0,
                      length: 5
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "patternLoopExtension",
                      bitShift: 5,
                      length: 2
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "patternInversion",
                      bitShift: 7,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "type",
                      bitShift: 8,
                      length: 8
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "patternIdentifier",
                      bitShift: 16,
                      length: 4
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "patternLoop",
                      bitShift: 20,
                      length: 4
                    }
                  ]
                }
              ],
              byteMask: [
                {
                  type: "BitMaskValue",
                  valueFor: "slice",
                  bitShift: 0,
                  length: 24
                }
              ]
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "coreLed1Map",
            groupId: "0x01",
            localId: "0x0A",
            defaultValue: "{00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00}",
            description: "Defines LED patterns for system events. Configurable as 10 slices of 3 bytes each.",
            parameterType: {
              type: "ParameterTypeByteArray",
              size: 30,
              distinctValues: false,
              properties: [
                {
                  name: "slice",
                  type: "PropertByteArray",
                  size: 3,
                  distinctValues: true,
                  properties: [
                    {
                      name: "systemEventClass",
                      type: "PropertyString",
                      description: "System event class.",
                      possibleValues: [
                        "BUTTON1",
                        "BUTTON2",
                        "BUZZER",
                        "ACCELEROMETER",
                        "POWER",
                        "TEMPERATURE",
                        "GEOLOCATION",
                        "CONFIGURATION",
                        "NETWORK",
                        "CORE",
                        "BLE_CONNECTIVITY",
                        "USER"
                      ],
                      firmwareValues: [
                        0,
                        1,
                        2,
                        3,
                        4,
                        5,
                        6,
                        7,
                        8,
                        9,
                        10,
                        11
                      ]
                    },
                    {
                      name: "patternLoopExtension",
                      type: "PropertyNumber",
                      description: "Pattern loop extension."
                    },
                    {
                      name: "patternInversion",
                      type: "PropertyBoolean",
                      description: "Indicates whether the pattern is inverted."
                    },
                    {
                      name: "type",
                      type: "PropertyNumber",
                      description: "System event type."
                    },
                    {
                      name: "patternIdentifier",
                      type: "PropertyString",
                      description: "Defines the LED behavior.",
                      possibleValues: [
                        "NOT_CONFIGURED",
                        "LED_OFF",
                        "LED_ON",
                        "FADE_IN",
                        "FADE_OUT",
                        "BLINK_SLOW",
                        "BLINK_MEDIUM",
                        "BLINK_FAST",
                        "FLASH_SLOW",
                        "FLASH_FAST",
                        "HEART_ON"
                      ],
                      firmwareValues: [
                        0,
                        1,
                        2,
                        3,
                        4,
                        5,
                        6,
                        7,
                        8,
                        9,
                        10
                      ]
                    },
                    {
                      name: "patternLoop",
                      type: "PropertyNumber",
                      description: "Number of times the pattern is displayed."
                    }
                  ],
                  bitMask: [
                    {
                      type: "BitMaskValue",
                      valueFor: "systemEventClass",
                      bitShift: 0,
                      length: 5
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "patternLoopExtension",
                      bitShift: 5,
                      length: 2
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "patternInversion",
                      bitShift: 7,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "type",
                      bitShift: 8,
                      length: 8
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "patternIdentifier",
                      bitShift: 16,
                      length: 4
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "patternLoop",
                      bitShift: 20,
                      length: 4
                    }
                  ]
                }
              ],
              byteMask: [
                {
                  type: "BitMaskValue",
                  valueFor: "slice",
                  bitShift: 0,
                  length: 24
                }
              ]
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "coreBuzzerMap",
            groupId: "0x01",
            localId: "0x0B",
            defaultValue: "{00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00}",
            description: "Defines LED patterns for system events. Configurable as 10 slices of 3 bytes each.",
            parameterType: {
              type: "ParameterTypeByteArray",
              size: 30,
              distinctValues: false,
              properties: [
                {
                  name: "slice",
                  type: "PropertByteArray",
                  size: 3,
                  distinctValues: true,
                  properties: [
                    {
                      name: "systemEventClass",
                      type: "PropertyString",
                      description: "System event class.",
                      possibleValues: [
                        "BUTTON1",
                        "BUTTON2",
                        "BUZZER",
                        "ACCELEROMETER",
                        "POWER",
                        "TEMPERATURE",
                        "GEOLOCATION",
                        "CONFIGURATION",
                        "NETWORK",
                        "CORE",
                        "BLE_CONNECTIVITY",
                        "USER"
                      ],
                      firmwareValues: [
                        0,
                        1,
                        2,
                        3,
                        4,
                        5,
                        6,
                        7,
                        8,
                        9,
                        10,
                        11
                      ]
                    },
                    {
                      name: "melodyCountExtension",
                      type: "PropertyNumber",
                      description: "Melody count extension"
                    },
                    {
                      name: "type",
                      type: "PropertyNumber",
                      description: "System event type."
                    },
                    {
                      name: "melodyIdentifier",
                      type: "PropertyString",
                      description: "Defines the LED behavior.",
                      possibleValues: [
                        "NOT_CONFIGURED",
                        "OFF",
                        "MELODY_1",
                        "MELODY_2",
                        "MELODY_3"
                      ],
                      firmwareValues: [
                        0,
                        1,
                        2,
                        3,
                        4
                      ]
                    },
                    {
                      name: "melodyCount",
                      type: "PropertyNumber",
                      description: "Number of times the melody is displayed."
                    }
                  ],
                  bitMask: [
                    {
                      type: "BitMaskValue",
                      valueFor: "systemEventClass",
                      bitShift: 0,
                      length: 5
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "melodyCountExtension",
                      bitShift: 5,
                      length: 3
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "type",
                      bitShift: 8,
                      length: 8
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "melodyIdentifier",
                      bitShift: 16,
                      length: 5
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "patternLoop",
                      bitShift: 21,
                      length: 3
                    }
                  ]
                }
              ],
              byteMask: [
                {
                  type: "BitMaskValue",
                  valueFor: "slice",
                  bitShift: 0,
                  length: 24
                }
              ]
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "coreBuzzerMap",
            groupId: "0x01",
            localId: "0x0B",
            defaultValue: "{00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00}",
            description: "Defines LED patterns for system events. Configurable as 10 slices of 3 bytes each.",
            parameterType: {
              type: "ParameterTypeByteArray",
              size: 30,
              distinctValues: false,
              properties: [
                {
                  name: "slice",
                  type: "PropertByteArray",
                  size: 3,
                  distinctValues: true,
                  properties: [
                    {
                      name: "systemEventClass",
                      type: "PropertyString",
                      description: "System event class.",
                      possibleValues: [
                        "BUTTON1",
                        "BUTTON2",
                        "BUZZER",
                        "ACCELEROMETER",
                        "POWER",
                        "TEMPERATURE",
                        "GEOLOCATION",
                        "CONFIGURATION",
                        "NETWORK",
                        "CORE",
                        "BLE_CONNECTIVITY",
                        "USER"
                      ],
                      firmwareValues: [
                        0,
                        1,
                        2,
                        3,
                        4,
                        5,
                        6,
                        7,
                        8,
                        9,
                        10,
                        11
                      ]
                    },
                    {
                      name: "melodyCountExtension",
                      type: "PropertyNumber",
                      description: "Melody count extension"
                    },
                    {
                      name: "type",
                      type: "PropertyNumber",
                      description: "System event type."
                    },
                    {
                      name: "melodyIdentifier",
                      type: "PropertyString",
                      description: "Defines the LED behavior.",
                      possibleValues: [
                        "NOT_CONFIGURED",
                        "OFF",
                        "MELODY_2",
                        "MELODY_3",
                        "MELODY_4",
                        "MELODY_5",
                        "MELODY_6",
                        "MELODY_7",
                        "MELODY_8",
                        "MELODY_9",
                        "MELODY_10",
                        "MELODY_11",
                        "MELODY_12",
                        "MELODY_13",
                        "MELODY_14",
                        "MELODY_15",
                        "MELODY_16",
                        "MELODY_17",
                        "MELODY_18",
                        "MELODY_19",
                        "MELODY_20",
                        "MELODY_21"
                      ],
                      firmwareValues: [
                        0,
                        1,
                        2,
                        3,
                        4,
                        5,
                        6,
                        7,
                        8,
                        9,
                        10,
                        11,
                        12,
                        13,
                        14,
                        15,
                        16,
                        17,
                        18,
                        19,
                        20,
                        21,
                        22,
                        23
                      ]
                    },
                    {
                      name: "melodyCount",
                      type: "PropertyNumber",
                      description: "Number of times the melody is displayed."
                    }
                  ],
                  bitMask: [
                    {
                      type: "BitMaskValue",
                      valueFor: "systemEventClass",
                      bitShift: 0,
                      length: 5
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "melodyCountExtension",
                      bitShift: 5,
                      length: 3
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "type",
                      bitShift: 8,
                      length: 8
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "melodyIdentifier",
                      bitShift: 16,
                      length: 5
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "patternLoop",
                      bitShift: 21,
                      length: 3
                    }
                  ]
                }
              ],
              byteMask: [
                {
                  type: "BitMaskValue",
                  valueFor: "slice",
                  bitShift: 0,
                  length: 24
                }
              ]
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "coreAlmanacValidity",
            groupId: "0x01",
            localId: "0x0C",
            defaultValue: 120,
            unit: "days",
            description: "Number of days for which the GNSS almanac is considered as valid.",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 7,
                maximum: 365
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "coreAlmanacOutdatedRatio",
            groupId: "0x01",
            localId: "0x0D",
            defaultValue: 100,
            unit: "%",
            description: "Percentage of outdated GNSS almanac entries which will trigger network update requests. A value of 100% disable the network requests. Applicable for both GNSS devices",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 0,
                maximum: 100
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "coreCliPassword",
            groupId: "0x01",
            localId: "0x0E",
            defaultValue: 123,
            description: "User cli password",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 0
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "coreDBTypeMask",
            groupId: "0x01",
            localId: "0x0F",
            description: "Data buffering type mask.",
            parameterType: {
              type: "ParameterTypeByteArray",
              size: 7,
              distinctValues: true,
              properties: [
                {
                  name: "dataBufferingType",
                  type: "PropertyObject",
                  properties: [
                    {
                      name: "position",
                      type: "PropertyBoolean",
                      description: "If set, the positions are stored in the history."
                    }
                  ]
                },
                {
                  name: "systemClass",
                  type: "PropertyObject",
                  properties: [
                    {
                      name: "status",
                      type: "PropertyBoolean",
                      description: "System status Versions, temperature, reset cause."
                    },
                    {
                      name: "lowBattery",
                      type: "PropertyBoolean",
                      description: "Low battery alert."
                    },
                    {
                      name: "bleStatus",
                      type: "PropertyBoolean",
                      description: "Bluetooth Low Energy status"
                    },
                    {
                      name: "tamperDetection",
                      type: "PropertyBoolean",
                      description: "Tamper detection alert."
                    },
                    {
                      name: "heartbeat",
                      type: "PropertyBoolean",
                      description: "Heartbeat message."
                    },
                    {
                      name: "shutdown",
                      type: "PropertyBoolean",
                      description: "Shutdown message."
                    },
                    {
                      name: "dataBuffering",
                      type: "PropertyBoolean",
                      description: "Data buffering status"
                    }
                  ]
                },
                {
                  name: "sosClass",
                  type: "PropertyObject",
                  properties: [
                    {
                      name: "sosOn",
                      type: "PropertyBoolean",
                      description: "SOS activated."
                    },
                    {
                      name: "sosOff",
                      type: "PropertyBoolean",
                      description: "SOS deactivated."
                    }
                  ]
                },
                {
                  name: "temperatureClass",
                  type: "PropertyObject",
                  properties: [
                    {
                      name: "tempHigh",
                      type: "PropertyBoolean",
                      description: "Critical high temperature reached"
                    },
                    {
                      name: "tempLow",
                      type: "PropertyBoolean",
                      description: "Critical low temperature reached"
                    },
                    {
                      name: "tempNormal",
                      type: "PropertyBoolean",
                      description: "Temperature back to normal"
                    }
                  ]
                },
                {
                  name: "accelerometerClass",
                  type: "PropertyObject",
                  properties: [
                    {
                      name: "motionStart",
                      type: "PropertyBoolean",
                      description: "Motion start detected."
                    },
                    {
                      name: "motionEnd",
                      type: "PropertyBoolean",
                      description: "Motion end detected."
                    },
                    {
                      name: "shock",
                      type: "PropertyBoolean",
                      description: "Shock detected."
                    }
                  ]
                },
                {
                  name: "networkingClass",
                  type: "PropertyObject",
                  properties: [
                    {
                      name: "mainUp",
                      type: "PropertyBoolean",
                      description: "Main network is up."
                    },
                    {
                      name: "backupUp",
                      type: "PropertyBoolean",
                      description: "Main network down. Backup is up."
                    }
                  ]
                },
                {
                  name: "geozoningClass",
                  type: "PropertyObject",
                  properties: [
                    {
                      name: "geozoningOn",
                      type: "PropertyBoolean",
                      description: "Geozoning is on."
                    }
                  ]
                }
              ],
              byteMask: [
                {
                  valueFor: "dataBufferingType",
                  type: "BitMaskObject",
                  values: [
                    {
                      type: "BitMaskValue",
                      valueFor: "position",
                      bitShift: 0,
                      length: 1
                    }
                  ]
                },
                {
                  valueFor: "systemClass",
                  type: "BitMaskObject",
                  values: [
                    {
                      type: "BitMaskValue",
                      valueFor: "status",
                      bitShift: 0,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "lowBattery",
                      bitShift: 1,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "bleStatus",
                      bitShift: 2,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "tamperDetection",
                      bitShift: 3,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "heartbeat",
                      bitShift: 4,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "shutdown",
                      bitShift: 5,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "dataBuffering",
                      bitShift: 6,
                      length: 1
                    }
                  ]
                },
                {
                  valueFor: "sosClass",
                  type: "BitMaskObject",
                  values: [
                    {
                      type: "BitMaskValue",
                      valueFor: "sosOn",
                      bitShift: 0,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "sosOff",
                      bitShift: 1,
                      length: 1
                    }
                  ]
                },
                {
                  valueFor: "temperatureClass",
                  type: "BitMaskObject",
                  values: [
                    {
                      type: "BitMaskValue",
                      valueFor: "tempHigh",
                      bitShift: 0,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "tempLow",
                      bitShift: 1,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "tempNormal",
                      bitShift: 2,
                      length: 1
                    }
                  ]
                },
                {
                  valueFor: "accelerometerClass",
                  type: "BitMaskObject",
                  values: [
                    {
                      type: "BitMaskValue",
                      valueFor: "motionStart",
                      bitShift: 0,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "motionEnd",
                      bitShift: 1,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "shock",
                      bitShift: 2,
                      length: 1
                    }
                  ]
                },
                {
                  valueFor: "networkingClass",
                  type: "BitMaskObject",
                  values: [
                    {
                      type: "BitMaskValue",
                      valueFor: "mainUp",
                      bitShift: 0,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "backupUp",
                      bitShift: 1,
                      length: 1
                    }
                  ]
                },
                {
                  valueFor: "geozoningClass",
                  type: "BitMaskObject",
                  values: [
                    {
                      type: "BitMaskValue",
                      valueFor: "geozoningOn",
                      bitShift: 0,
                      length: 1
                    }
                  ]
                }
              ]
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "geolocMotionPeriod",
            groupId: "0x02",
            localId: "0x00",
            defaultValue: 300,
            unit: "s",
            description: "Position acquisition period while in motion",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 10,
                maximum: 86400
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "geolocStaticPeriod",
            groupId: "0x02",
            localId: "0x01",
            defaultValue: 3600,
            unit: "s",
            description: "Position acquisition period while static",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 10,
                maximum: 86400
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "geolocSosPeriod",
            groupId: "0x02",
            localId: "0x02",
            defaultValue: 60,
            unit: "s",
            description: "Position acquisition period while in sos",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 10,
                maximum: 86400
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "geolocMotionNbStart",
            groupId: "0x02",
            localId: "0x03",
            defaultValue: 1,
            description: "Number of acquisitions on motion start event",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 0,
                maximum: 10
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "geolocMotionNbStop",
            groupId: "0x02",
            localId: "0x04",
            defaultValue: 1,
            description: "Number of acquisitions on motion stop event",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 0,
                maximum: 10
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "geolocStartStopPeriod",
            groupId: "0x02",
            localId: "0x05",
            defaultValue: 120,
            unit: "s",
            description: "Position acquisition period while acquiring consecutive positions on motion start or stop",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 10,
                maximum: 86400
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "geolocGnssHoldOnMode",
            groupId: "0x02",
            localId: "0x06",
            description: "Select the GNSS hold on mode. Possible Values are:\n0: Disabled\n1: Always. Hold-on mode always set. Only controlled by the timer.\n2: techno: If the gnss is actually used (meaning GNSS techno not skipped).\n3: moving: Hold-mode set while moving.\n4: techno and moving: if the gnss is actually used (meaning GNSS techno not skipped) and tracker is moving.",
            parameterType: {
              type: "ParameterTypeString",
              possibleValues: [
                "DISABLED",
                "ALWAYS",
                "TECHNO",
                "MOVING",
                "STATIC",
                "TECHNO_AND_MOVING"
              ],
              firmwareValues: [
                0,
                1,
                2,
                3,
                4,
                5
              ]
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "geolocGnssHoldOnTimeout",
            groupId: "0x02",
            localId: "0x07",
            defaultValue: 0,
            unit: "s",
            description: "GNSS hold on mode timeout.",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 0,
                maximum: 86400
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "geolocProfile0Triggers",
            groupId: "0x02",
            localId: "0x08",
            description: "Geolocation event triggers 0",
            parameterType: {
              type: "ParameterTypeBitMask",
              properties: [
                {
                  name: "geoTriggerPod",
                  type: "PropertyBoolean",
                  description: "Geoloc triggered on Position-on-demand via downlink or via button."
                },
                {
                  name: "geoTriggerSos",
                  type: "PropertyBoolean",
                  description: "SOS started"
                },
                {
                  name: "geoTriggerMotionStart",
                  type: "PropertyBoolean",
                  description: "Geoloc triggered on motion start event"
                },
                {
                  name: "geoTriggerMotionStop",
                  type: "PropertyBoolean",
                  description: "Geoloc triggered on motion stop event"
                },
                {
                  name: "geoTriggerInMotion",
                  type: "PropertyBoolean",
                  description: "Periodic geoloc while the tracker is in motion"
                },
                {
                  name: "geoTriggerInStatic",
                  type: "PropertyBoolean",
                  description: "Periodic geoloc running while the tracker is static"
                },
                {
                  name: "geoTriggerShock",
                  type: "PropertyBoolean",
                  description: "Geoloc triggered on shock action"
                },
                {
                  name: "geoTriggerTempHighThreshold",
                  type: "PropertyBoolean",
                  description: "Geoloc triggered on temperature high."
                },
                {
                  name: "geoTriggerTempLowThreshold",
                  type: "PropertyBoolean",
                  description: "Geoloc triggered on temperature high."
                },
                {
                  name: "geoTriggerGeozoning",
                  type: "PropertyBoolean",
                  description: "Geoloc triggered on geoTriggerGeozoning"
                }
              ],
              bitMask: [
                {
                  type: "BitMaskValue",
                  valueFor: "geoTriggerPod",
                  bitShift: 0,
                  length: 1
                },
                {
                  type: "BitMaskValue",
                  valueFor: "geoTriggerSos",
                  bitShift: 1,
                  length: 1
                },
                {
                  type: "BitMaskValue",
                  valueFor: "geoTriggerMotionStart",
                  bitShift: 2,
                  length: 1
                },
                {
                  type: "BitMaskValue",
                  valueFor: "geoTriggerMotionStop",
                  bitShift: 3,
                  length: 1
                },
                {
                  type: "BitMaskValue",
                  valueFor: "geoTriggerInMotion",
                  bitShift: 4,
                  length: 1
                },
                {
                  type: "BitMaskValue",
                  valueFor: "geoTriggerInStatic",
                  bitShift: 5,
                  length: 1
                },
                {
                  type: "BitMaskValue",
                  valueFor: "geoTriggerShock",
                  bitShift: 6,
                  length: 1
                },
                {
                  type: "BitMaskValue",
                  valueFor: "geoTriggerTempHighThreshold",
                  bitShift: 7,
                  length: 1
                },
                {
                  type: "BitMaskValue",
                  valueFor: "geoTriggerTempLowThreshold",
                  bitShift: 8,
                  length: 1
                },
                {
                  type: "BitMaskValue",
                  valueFor: "geoTriggerGeozoning",
                  bitShift: 9,
                  length: 1
                }
              ]
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "geolocProfile1Triggers",
            groupId: "0x02",
            localId: "0x09",
            description: "Geolocation event triggers 1",
            parameterType: {
              type: "ParameterTypeBitMask",
              properties: [
                {
                  name: "geoTriggerPod",
                  type: "PropertyBoolean",
                  description: "Geoloc triggered on Position-on-demand via downlink or via button."
                },
                {
                  name: "geoTriggerSos",
                  type: "PropertyBoolean",
                  description: "SOS started"
                },
                {
                  name: "geoTriggerMotionStart",
                  type: "PropertyBoolean",
                  description: "Geoloc triggered on motion start event"
                },
                {
                  name: "geoTriggerMotionStop",
                  type: "PropertyBoolean",
                  description: "Geoloc triggered on motion stop event"
                },
                {
                  name: "geoTriggerInMotion",
                  type: "PropertyBoolean",
                  description: "Periodic geoloc while the tracker is in motion"
                },
                {
                  name: "geoTriggerInStatic",
                  type: "PropertyBoolean",
                  description: "Periodic geoloc running while the tracker is static"
                },
                {
                  name: "geoTriggerShock",
                  type: "PropertyBoolean",
                  description: "Geoloc triggered on shock action"
                },
                {
                  name: "geoTriggerTempHighThreshold",
                  type: "PropertyBoolean",
                  description: "Geoloc triggered on temperature high."
                },
                {
                  name: "geoTriggerTempLowThreshold",
                  type: "PropertyBoolean",
                  description: "Geoloc triggered on temperature high."
                },
                {
                  name: "geoTriggerGeozoning",
                  type: "PropertyBoolean",
                  description: "Geoloc triggered on temperature low."
                }
              ],
              bitMask: [
                {
                  type: "BitMaskValue",
                  valueFor: "geoTriggerPod",
                  bitShift: 0,
                  length: 1
                },
                {
                  type: "BitMaskValue",
                  valueFor: "geoTriggerSos",
                  bitShift: 1,
                  length: 1
                },
                {
                  type: "BitMaskValue",
                  valueFor: "geoTriggerMotionStart",
                  bitShift: 2,
                  length: 1
                },
                {
                  type: "BitMaskValue",
                  valueFor: "geoTriggerMotionStop",
                  bitShift: 3,
                  length: 1
                },
                {
                  type: "BitMaskValue",
                  valueFor: "geoTriggerInMotion",
                  bitShift: 4,
                  length: 1
                },
                {
                  type: "BitMaskValue",
                  valueFor: "geoTriggerInStatic",
                  bitShift: 5,
                  length: 1
                },
                {
                  type: "BitMaskValue",
                  valueFor: "geoTriggerShock",
                  bitShift: 6,
                  length: 1
                },
                {
                  type: "BitMaskValue",
                  valueFor: "geoTriggerTempHighThreshold",
                  bitShift: 7,
                  length: 1
                },
                {
                  type: "BitMaskValue",
                  valueFor: "geoTriggerTempLowThreshold",
                  bitShift: 8,
                  length: 1
                },
                {
                  type: "BitMaskValue",
                  valueFor: "geoTriggerGeozoning",
                  bitShift: 9,
                  length: 1
                }
              ]
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "geolocProfile2Triggers",
            groupId: "0x02",
            localId: "0x0A",
            description: "Geolocation event triggers 2",
            parameterType: {
              type: "ParameterTypeBitMask",
              properties: [
                {
                  name: "geoTriggerPod",
                  type: "PropertyBoolean",
                  description: "Geoloc triggered on Position-on-demand via downlink or via button."
                },
                {
                  name: "geoTriggerSos",
                  type: "PropertyBoolean",
                  description: "SOS started"
                },
                {
                  name: "geoTriggerMotionStart",
                  type: "PropertyBoolean",
                  description: "Geoloc triggered on motion start event"
                },
                {
                  name: "geoTriggerMotionStop",
                  type: "PropertyBoolean",
                  description: "Geoloc triggered on motion stop event"
                },
                {
                  name: "geoTriggerInMotion",
                  type: "PropertyBoolean",
                  description: "Periodic geoloc while the tracker is in motion"
                },
                {
                  name: "geoTriggerInStatic",
                  type: "PropertyBoolean",
                  description: "Periodic geoloc running while the tracker is static"
                },
                {
                  name: "geoTriggerShock",
                  type: "PropertyBoolean",
                  description: "Geoloc triggered on shock action"
                },
                {
                  name: "geoTriggerTempHighThreshold",
                  type: "PropertyBoolean",
                  description: "Geoloc triggered on temperature high."
                },
                {
                  name: "geoTriggerTempLowThreshold",
                  type: "PropertyBoolean",
                  description: "Geoloc triggered on temperature high."
                },
                {
                  name: "geoTriggerGeozoning",
                  type: "PropertyBoolean",
                  description: "Geoloc triggered on temperature low."
                }
              ],
              bitMask: [
                {
                  type: "BitMaskValue",
                  valueFor: "geoTriggerPod",
                  bitShift: 0,
                  length: 1
                },
                {
                  type: "BitMaskValue",
                  valueFor: "geoTriggerSos",
                  bitShift: 1,
                  length: 1
                },
                {
                  type: "BitMaskValue",
                  valueFor: "geoTriggerMotionStart",
                  bitShift: 2,
                  length: 1
                },
                {
                  type: "BitMaskValue",
                  valueFor: "geoTriggerMotionStop",
                  bitShift: 3,
                  length: 1
                },
                {
                  type: "BitMaskValue",
                  valueFor: "geoTriggerInMotion",
                  bitShift: 4,
                  length: 1
                },
                {
                  type: "BitMaskValue",
                  valueFor: "geoTriggerInStatic",
                  bitShift: 5,
                  length: 1
                },
                {
                  type: "BitMaskValue",
                  valueFor: "geoTriggerShock",
                  bitShift: 6,
                  length: 1
                },
                {
                  type: "BitMaskValue",
                  valueFor: "geoTriggerTempHighThreshold",
                  bitShift: 7,
                  length: 1
                },
                {
                  type: "BitMaskValue",
                  valueFor: "geoTriggerTempLowThreshold",
                  bitShift: 8,
                  length: 1
                },
                {
                  type: "BitMaskValue",
                  valueFor: "geoTriggerGeozoning",
                  bitShift: 9,
                  length: 1
                }
              ]
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "geolocGbeProfile0Techno",
            groupId: "0x02",
            localId: "0x0B",
            description: "Technologies to schedule using the basic engine for events in triggers 0",
            parameterType: {
              type: "ParameterTypeByteArray",
              size: 6,
              properties: [
                {
                  name: "Action",
                  type: "PropertyString",
                  possibleValues: [
                    "SKIP_ON_SUCCESS",
                    "ALWAYS_DONE"
                  ],
                  firmwareValues: [
                    0,
                    1
                  ]
                },
                {
                  name: "Technology",
                  type: "PropertyString",
                  possibleValues: [
                    "NONE",
                    "LR11xx_A_GNSS",
                    "WIFI",
                    "BLE_SCAN1",
                    "BLE_SCAN2",
                    "AIDED_GNSS",
                    "GNSS"
                  ],
                  firmwareValues: [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6
                  ]
                }
              ],
              byteMask: [
                {
                  type: "BitMaskValue",
                  valueFor: "Technology",
                  bitShift: 0,
                  length: 7
                },
                {
                  type: "BitMaskValue",
                  valueFor: "Action",
                  bitShift: 7,
                  length: 1
                }
              ]
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "geolocGbeProfile1Techno",
            groupId: "0x02",
            localId: "0x0C",
            description: "Technologies to schedule using the basic engine for events in triggers 1",
            parameterType: {
              type: "ParameterTypeByteArray",
              size: 6,
              properties: [
                {
                  name: "Action",
                  type: "PropertyString",
                  possibleValues: [
                    "SKIP_ON_SUCCESS",
                    "ALWAYS_DONE"
                  ],
                  firmwareValues: [
                    0,
                    1
                  ]
                },
                {
                  name: "Technology",
                  type: "PropertyString",
                  possibleValues: [
                    "NONE",
                    "LR11xx_A_GNSS",
                    "WIFI",
                    "BLE_SCAN1",
                    "BLE_SCAN2",
                    "AIDED_GNSS",
                    "GNSS"
                  ],
                  firmwareValues: [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6
                  ]
                }
              ],
              byteMask: [
                {
                  type: "BitMaskValue",
                  valueFor: "Technology",
                  bitShift: 0,
                  length: 7
                },
                {
                  type: "BitMaskValue",
                  valueFor: "Action",
                  bitShift: 7,
                  length: 1
                }
              ]
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "geolocGbeProfile2Techno",
            groupId: "0x02",
            localId: "0x0D",
            description: "Technologies to schedule using the basic engine for events in triggers 2",
            parameterType: {
              type: "ParameterTypeByteArray",
              size: 6,
              properties: [
                {
                  name: "Action",
                  type: "PropertyString",
                  possibleValues: [
                    "SKIP_ON_SUCCESS",
                    "ALWAYS_DONE"
                  ],
                  firmwareValues: [
                    0,
                    1
                  ]
                },
                {
                  name: "Technology",
                  type: "PropertyString",
                  possibleValues: [
                    "NONE",
                    "LR11xx_A_GNSS",
                    "WIFI",
                    "BLE_SCAN1",
                    "BLE_SCAN2",
                    "AIDED_GNSS",
                    "GNSS"
                  ],
                  firmwareValues: [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6
                  ]
                }
              ],
              byteMask: [
                {
                  type: "BitMaskValue",
                  valueFor: "Technology",
                  bitShift: 0,
                  length: 7
                },
                {
                  type: "BitMaskValue",
                  valueFor: "Action",
                  bitShift: 7,
                  length: 1
                }
              ]
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "gnssConstellation",
            groupId: "0x03",
            localId: "0x00",
            defaultValue: 2,
            description: "GNSS constellations to be used",
            parameterType: {
              type: "ParameterTypeString",
              possibleValues: [
                "GPS_ONLY",
                "GLONASS_ONLY",
                "GPS_GLONASS",
                "GPS_GALILEO",
                "GPS_GLONASS_GALILEO",
                "BEIDOU_ONLY",
                "BEIDOU_GPS"
              ],
              firmwareValues: [
                0,
                1,
                2,
                3,
                4,
                5,
                6
              ]
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "gnssMaxTime",
            groupId: "0x03",
            localId: "0x01",
            defaultValue: 300,
            unit: "s",
            description: "GNSS max acquisition time.",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 30,
                maximum: 300
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "gnssT0TimeoutStatic",
            groupId: "0x03",
            localId: "0x02",
            defaultValue: 30,
            unit: "s",
            description: "Max time to acquire at least one satellite when tracker is static",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 0,
                maximum: 300
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "gnssEhpeStatic",
            groupId: "0x03",
            localId: "0x03",
            defaultValue: 30,
            unit: "m",
            description: "Expected estimated horizontal position error when the tracker is static",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 0,
                maximum: 100
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "gnssConvergenceStatic",
            groupId: "0x03",
            localId: "0x04",
            defaultValue: 20,
            unit: "s",
            description: "Extra-time after a first fix to refine the fix",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 0,
                maximum: 300
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "gnssT0TimeoutMotion",
            groupId: "0x03",
            localId: "0x05",
            defaultValue: 30,
            unit: "s",
            description: "Max time to acquire at least one satellite when tracker is moving",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 0,
                maximum: 300
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "gnssEhpeMotion",
            groupId: "0x03",
            localId: "0x06",
            defaultValue: 30,
            unit: "m",
            description: "Expected estimated horizontal position error when the tracker is moving",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 0,
                maximum: 100
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "gnssConvergenceMotion",
            groupId: "0x03",
            localId: "0x07",
            defaultValue: 20,
            unit: "s",
            description: "Extra-time after a first fix to refine the fix when the tracker is moving",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 0,
                maximum: 300
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "gnssStandby",
            groupId: "0x03",
            localId: "0x08",
            defaultValue: 604800,
            unit: "s",
            description: "Max time to let the device in standby mode.",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 0
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "gnssAgnssMaxTime",
            groupId: "0x03",
            localId: "0x09",
            defaultValue: 45,
            unit: "s",
            description: "Aided GNSS max acquisition time.",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 15,
                maximum: 240
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "gnssT1Timeout",
            groupId: "0x03",
            localId: "0x0A",
            defaultValue: 0,
            unit: "s",
            description: "Extra time let in Aided GNSS mode to try doing a fix.",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 0,
                maximum: 300
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "lrConstellation",
            groupId: "0x04",
            localId: "0x00",
            description: "GNSS constellations to be used",
            parameterType: {
              type: "ParameterTypeString",
              possibleValues: [
                "GPS_ONLY",
                "BEIDOU_ONLY",
                "BEIDOU_GPS"
              ],
              firmwareValues: [
                0,
                5,
                6
              ]
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "lrScanMode",
            groupId: "0x04",
            localId: "0x01",
            description: "Scan mode (NAV1 / NAV2)",
            parameterType: {
              type: "ParameterTypeString",
              possibleValues: [
                "NAV1_SCAN",
                "NAV2_SCAN"
              ],
              firmwareValues: [
                1,
                2
              ]
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "lrNbScans",
            groupId: "0x04",
            localId: "0x02",
            defaultValue: 2,
            description: "Number of scans for one position acquisition",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 1,
                maximum: 4
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "lrInterScanTime",
            groupId: "0x04",
            localId: "0x03",
            defaultValue: 5,
            unit: "s",
            description: "Time to wait between the scans for a position",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 0,
                maximum: 15
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "lrWifiReportNbBssid",
            groupId: "0x04",
            localId: "0x04",
            defaultValue: 4,
            description: "Max number of WIFI BSSID per scan",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 1,
                maximum: 32
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "lrWifiMinNbBssid",
            groupId: "0x04",
            localId: "0x05",
            defaultValue: 3,
            description: "Minimum number of BSSID to consider the scan as success (solvable)",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 1,
                maximum: 10
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "lrWifiMinRssi",
            groupId: "0x04",
            localId: "0x06",
            defaultValue: 3,
            description: "Minimum number of BSSID to consider the scan as success (solvable)",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: -100,
                maximum: 0
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "lrWifiBssidMacType",
            groupId: "0x04",
            localId: "0x07",
            defaultValue: 1,
            description: "MAC administration type of the BSSID to report.",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 0,
                maximum: 2
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "bleScanDuration",
            groupId: "0x05",
            localId: "0x00",
            defaultValue: 3e3,
            unit: "ms",
            description: "Total time for a BLE scan",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 50,
                maximum: 61440
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "bleScanWindow",
            groupId: "0x05",
            localId: "0x01",
            defaultValue: 120,
            unit: "ms",
            description: "Scan window",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 3,
                maximum: 10240
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "bleScanInterval",
            groupId: "0x05",
            localId: "0x02",
            defaultValue: 130,
            unit: "ms",
            description: "Scan interval",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 1,
                maximum: 10240
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "bleScanType",
            groupId: "0x05",
            localId: "0x03",
            defaultValue: 0,
            description: "Type of beacons to scan",
            parameterType: {
              type: "ParameterTypeString",
              possibleValues: [
                "ALL_BEACONS",
                "EDDYSTONE_UUID",
                "EDDYSTONE_URL",
                "ALL_EDDYSTONE",
                "IBEACON_ONLY",
                "ALTBEACON_ONLY",
                "CUSTOM",
                "EXPOSURE_ADVERTISEMENT"
              ],
              firmwareValues: [
                0,
                1,
                2,
                3,
                4,
                5,
                6,
                7
              ]
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "bleScanMinRssi",
            groupId: "0x05",
            localId: "0x04",
            defaultValue: -80,
            unit: "dB",
            description: "Min RSSI to consider the beacon",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: -120,
                maximum: 0
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "bleScanMinNbBeacons",
            groupId: "0x05",
            localId: "0x05",
            defaultValue: 1,
            description: "Min number of beacons to consider the scan as success (solvable).",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 1,
                maximum: 20
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "bleScanFilter1Mask",
            groupId: "0x05",
            localId: "0x06",
            defaultValue: [0],
            description: "Mask (10 bytes) to be applied to the ADV frame.",
            parameterType: {
              type: "ParameterTypeByteArray",
              size: 10
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "bleScanFilter1Value",
            groupId: "0x05",
            localId: "0x07",
            defaultValue: [0],
            description: "Comparison value (10 bytes) belonging to filter1",
            parameterType: {
              type: "ParameterTypeByteArray",
              size: 10
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "bleScanFilter1Offset",
            groupId: "0x05",
            localId: "0x08",
            defaultValue: 0,
            description: "Offset in the ADV from which we apply the filter1",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 0,
                maximum: 256
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "bleScanFilter2Mask",
            groupId: "0x05",
            localId: "0x09",
            defaultValue: [0],
            description: "Mask (10 bytes) to be applied to the ADV frame.",
            parameterType: {
              type: "ParameterTypeByteArray",
              size: 10
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "bleScanFilter2Value",
            groupId: "0x05",
            localId: "0x0A",
            defaultValue: [0],
            description: "Comparison value (10 bytes) belonging to filter2",
            parameterType: {
              type: "ParameterTypeByteArray",
              size: 10
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "bleScanFilter2Offset",
            groupId: "0x05",
            localId: "0x0B",
            defaultValue: 0,
            description: "Offset in the ADV from which we apply the filter2",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 0,
                maximum: 256
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "bleScanNbBeacons",
            groupId: "0x05",
            localId: "0x0C",
            defaultValue: 4,
            description: "Number of beacons to report",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 1,
                maximum: 20
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "bleScanReportType",
            groupId: "0x05",
            localId: "0x0D",
            defaultValue: 0,
            description: "Scan report type",
            parameterType: {
              type: "ParameterTypeString",
              possibleValues: [
                "MAC_ADDRESS",
                "SHORT_IDENTIFIER",
                "LONG_IDENTIFIER"
              ],
              firmwareValues: [
                0,
                1,
                2
              ]
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "bleScanReportIdOfs",
            groupId: "0x05",
            localId: "0x0E",
            defaultValue: 4,
            description: "Offset in ADV to extract the beacon identifier",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 0,
                maximum: 256
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "bleScanDuration",
            groupId: "0x06",
            localId: "0x00",
            defaultValue: 3e3,
            unit: "ms",
            description: "Total time for a BLE scan",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 50,
                maximum: 61440
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "bleScanWindow",
            groupId: "0x06",
            localId: "0x01",
            defaultValue: 120,
            unit: "ms",
            description: "Scan window",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 3,
                maximum: 10240
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "bleScanInterval",
            groupId: "0x06",
            localId: "0x02",
            defaultValue: 130,
            unit: "ms",
            description: "Scan interval",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 1,
                maximum: 10240
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "bleScanType",
            groupId: "0x06",
            localId: "0x03",
            defaultValue: 0,
            description: "Type of beacons to scan",
            parameterType: {
              type: "ParameterTypeString",
              possibleValues: [
                "ALL_BEACONS",
                "EDDYSTONE_UUID",
                "EDDYSTONE_URL",
                "ALL_EDDYSTONE",
                "IBEACON_ONLY",
                "ALTBEACON_ONLY",
                "CUSTOM",
                "EXPOSURE_ADVERTISEMENT"
              ],
              firmwareValues: [
                0,
                1,
                2,
                3,
                4,
                5,
                6,
                7
              ]
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "bleScanMinRssi",
            groupId: "0x06",
            localId: "0x04",
            defaultValue: -100,
            unit: "dB",
            description: "Min RSSI to consider the beacon",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: -120,
                maximum: 0
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "bleScanMinNbBeacons",
            groupId: "0x06",
            localId: "0x05",
            defaultValue: 1,
            description: "Min number of beacons to consider the scan as success (solvable).",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 1,
                maximum: 20
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "bleScanFilter1Mask",
            groupId: "0x06",
            localId: "0x06",
            defaultValue: [0],
            description: "Mask (10 bytes) to be applied to the ADV frame.",
            parameterType: {
              type: "ParameterTypeByteArray",
              size: 10
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "bleScanFilter1Value",
            groupId: "0x06",
            localId: "0x07",
            defaultValue: [0],
            description: "Comparison value (10 bytes) belonging to filter1",
            parameterType: {
              type: "ParameterTypeByteArray",
              size: 10
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "bleScanFilter1Offset",
            groupId: "0x06",
            localId: "0x08",
            defaultValue: 0,
            description: "Offset in the ADV from which we apply the filter1",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 0,
                maximum: 256
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "bleScanFilter2Mask",
            groupId: "0x06",
            localId: "0x09",
            defaultValue: [0],
            description: "Mask (10 bytes) to be applied to the ADV frame.",
            parameterType: {
              type: "ParameterTypeByteArray",
              size: 10
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "bleScanFilter2Value",
            groupId: "0x06",
            localId: "0x0A",
            defaultValue: [0],
            description: "Comparison value (10 bytes) belonging to filter2",
            parameterType: {
              type: "ParameterTypeByteArray",
              size: 10
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "bleScanFilter2Offset",
            groupId: "0x06",
            localId: "0x0B",
            defaultValue: 0,
            description: "Offset in the ADV from which we apply the filter2",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 0,
                maximum: 256
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "bleScanNbBeacons",
            groupId: "0x06",
            localId: "0x0C",
            defaultValue: 4,
            description: "Number of beacons to report",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 1,
                maximum: 20
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "bleScanReportType",
            groupId: "0x06",
            localId: "0x0D",
            defaultValue: 0,
            description: "Scan report type",
            parameterType: {
              type: "ParameterTypeString",
              possibleValues: [
                "MAC_ADDRESS",
                "SHORT_IDENTIFIER",
                "LONG_IDENTIFIER"
              ],
              firmwareValues: [
                0,
                1,
                2
              ]
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "bleScanReportIdOfs",
            groupId: "0x06",
            localId: "0x0E",
            defaultValue: 4,
            description: "Offset in ADV to extract the beacon identifier",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 0,
                maximum: 256
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "acceleroMotionSensi",
            groupId: "0x07",
            localId: "0x00",
            defaultValue: 1,
            unit: "mg",
            description: "Motion sensitivity. Step 31 mg.",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 1,
                maximum: 96
              },
              multiply: 31
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "acceleroMotionDuration",
            groupId: "0x07",
            localId: "0x01",
            defaultValue: 120,
            unit: "s",
            description: "Motion duration",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 10,
                maximum: 3600
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "acceleroFullScale",
            groupId: "0x07",
            localId: "0x02",
            defaultValue: 3,
            description: "Scale use (2,4,8,16 g).",
            parameterType: {
              type: "ParameterTypeString",
              possibleValues: [
                "2_G",
                "4_G",
                "8_G",
                "16_G"
              ],
              firmwareValues: [
                0,
                1,
                2,
                3
              ]
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "acceleroOutputDataRate",
            groupId: "0x07",
            localId: "0x03",
            defaultValue: 0,
            description: "Output data rate (12.5, 25, 50, 100, 200 Hz).",
            parameterType: {
              type: "ParameterTypeString",
              possibleValues: [
                "12_5_HZ",
                "25_HZ",
                "50_HZ",
                "100_HZ",
                "200_HZ"
              ],
              firmwareValues: [
                0,
                1,
                2,
                3,
                4
              ]
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "acceleroShockThreshold",
            groupId: "0x07",
            localId: "0x04",
            defaultValue: 0,
            description: "Shock threshold. Step 63 mg",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 0,
                maximum: 128
              },
              multiply: 63
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "netSelection",
            groupId: "0x08",
            localId: "0x00",
            defaultValue: 0,
            description: "Define the networking type",
            parameterType: {
              type: "ParameterTypeString",
              possibleValues: [
                "LORA_ONLY",
                "CELLULAR_ONLY",
                "LORA_FALLBACK_CELLULAR",
                "CELLULAR_FALLBACK_LORA"
              ],
              firmwareValues: [
                0,
                1,
                2,
                3
              ]
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "netReconnectionSpacingStatic",
            groupId: "0x08",
            localId: "0x01",
            defaultValue: 600,
            description: "Time to wait before retrying to connect the main network. Applicable when the tracker is static.",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 0,
                maximum: 2147483647
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "netMainProbeTimeoutStatic",
            groupId: "0x08",
            localId: "0x02",
            defaultValue: 600,
            description: "Duration between each attempts reconnect the main network. Applicable when the tracker is static.",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 120,
                maximum: 2147483647
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "netReconnectionSpacingMotion",
            groupId: "0x08",
            localId: "0x03",
            defaultValue: 600,
            description: "Time to wait before retrying to connect the main network. Applicable when the tracker is moving.",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 0,
                maximum: 2147483647
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "netMainProbeTimeoutMotion",
            groupId: "0x08",
            localId: "0x04",
            defaultValue: 600,
            description: "Duration between each attempts reconnect the main network. Applicable when the tracker is moving.",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 120,
                maximum: 2147483647
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "lorawanCnxTimeout",
            groupId: "0x09",
            localId: "0x00",
            defaultValue: 0,
            description: "Max time to wait for joining the network. The value 0 disables the timer.",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 0,
                maximum: 2147483647
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "lorawanHeartbeatPeriod",
            groupId: "0x09",
            localId: "0x01",
            defaultValue: 3600,
            unit: "s",
            description: "Period at which an heartbeat notification is sent to trigger a Rx window for downlinks (if no uplink has been sent within this period). 0 disable the function.",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 0,
                maximum: 2147483647
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "lorawanProbeMaxAttemptsStatic",
            groupId: "0x09",
            localId: "0x02",
            defaultValue: 4,
            description: "Number of link-check sent declaring the network as lost. Applicable when the tracker is static. 0 disable the function.",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 0,
                maximum: 20
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "lorawanProbePeriodStatic",
            groupId: "0x09",
            localId: "0x03",
            defaultValue: 43200,
            description: "Time between link-check requests. Applicable when the tracker is static.",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 120,
                maximum: 2147483647
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "lorawanConfirmNotifMap",
            groupId: "0x09",
            localId: "0x04",
            defaultValue: "{00}",
            description: "Map enabling the LoRaWAN confirmed message for notifications.",
            parameterType: {
              type: "ParameterTypeByteArray",
              size: 6,
              distinctValues: true,
              properties: [
                {
                  name: "systemClass",
                  type: "PropertyObject",
                  properties: [
                    {
                      name: "status",
                      type: "PropertyBoolean",
                      description: "System status Versions, temperature, reset cause."
                    },
                    {
                      name: "lowBattery",
                      type: "PropertyBoolean",
                      description: "Low battery alert."
                    },
                    {
                      name: "bleStatus",
                      type: "PropertyBoolean",
                      description: "Bluetooth Low Energy status"
                    },
                    {
                      name: "tamperDetection",
                      type: "PropertyBoolean",
                      description: "Tamper detection alert."
                    },
                    {
                      name: "heartbeat",
                      type: "PropertyBoolean",
                      description: "Heartbeat message."
                    },
                    {
                      name: "shutdown",
                      type: "PropertyBoolean",
                      description: "Shutdown message."
                    },
                    {
                      name: "dataBuffering",
                      type: "PropertyBoolean",
                      description: "Data buffering status"
                    }
                  ]
                },
                {
                  name: "sosClass",
                  type: "PropertyObject",
                  properties: [
                    {
                      name: "sosOn",
                      type: "PropertyBoolean",
                      description: "SOS activated."
                    },
                    {
                      name: "sosOff",
                      type: "PropertyBoolean",
                      description: "SOS deactivated."
                    }
                  ]
                },
                {
                  name: "temperatureClass",
                  type: "PropertyObject",
                  properties: [
                    {
                      name: "tempHigh",
                      type: "PropertyBoolean",
                      description: "Critical high temperature reached"
                    },
                    {
                      name: "tempLow",
                      type: "PropertyBoolean",
                      description: "Critical low temperature reached"
                    },
                    {
                      name: "tempNormal",
                      type: "PropertyBoolean",
                      description: "Temperature back to normal"
                    }
                  ]
                },
                {
                  name: "accelerometerClass",
                  type: "PropertyObject",
                  properties: [
                    {
                      name: "motionStart",
                      type: "PropertyBoolean",
                      description: "Motion start detected."
                    },
                    {
                      name: "motionEnd",
                      type: "PropertyBoolean",
                      description: "Motion end detected."
                    },
                    {
                      name: "shock",
                      type: "PropertyBoolean",
                      description: "Shock detected."
                    }
                  ]
                },
                {
                  name: "networkingClass",
                  type: "PropertyObject",
                  properties: [
                    {
                      name: "mainUp",
                      type: "PropertyBoolean",
                      description: "Main network is up."
                    },
                    {
                      name: "backupUp",
                      type: "PropertyBoolean",
                      description: "Main network down. Backup is up."
                    }
                  ]
                },
                {
                  name: "geozoningClass",
                  type: "PropertyObject",
                  properties: [
                    {
                      name: "geozoningOn",
                      type: "PropertyBoolean",
                      description: "Geozoning is on."
                    }
                  ]
                }
              ],
              byteMask: [
                {
                  valueFor: "systemClass",
                  type: "BitMaskObject",
                  values: [
                    {
                      type: "BitMaskValue",
                      valueFor: "status",
                      bitShift: 0,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "lowBattery",
                      bitShift: 1,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "bleStatus",
                      bitShift: 2,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "tamperDetection",
                      bitShift: 3,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "heartbeat",
                      bitShift: 4,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "shutdown",
                      bitShift: 5,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "dataBuffering",
                      bitShift: 6,
                      length: 1
                    }
                  ]
                },
                {
                  valueFor: "sosClass",
                  type: "BitMaskObject",
                  values: [
                    {
                      type: "BitMaskValue",
                      valueFor: "sosOn",
                      bitShift: 0,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "sosOff",
                      bitShift: 1,
                      length: 1
                    }
                  ]
                },
                {
                  valueFor: "temperatureClass",
                  type: "BitMaskObject",
                  values: [
                    {
                      type: "BitMaskValue",
                      valueFor: "tempHigh",
                      bitShift: 0,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "tempLow",
                      bitShift: 1,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "tempNormal",
                      bitShift: 2,
                      length: 1
                    }
                  ]
                },
                {
                  valueFor: "accelerometerClass",
                  type: "BitMaskObject",
                  values: [
                    {
                      type: "BitMaskValue",
                      valueFor: "motionStart",
                      bitShift: 0,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "motionEnd",
                      bitShift: 1,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "shock",
                      bitShift: 2,
                      length: 1
                    }
                  ]
                },
                {
                  valueFor: "networkingClass",
                  type: "BitMaskObject",
                  values: [
                    {
                      type: "BitMaskValue",
                      valueFor: "mainUp",
                      bitShift: 0,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "backupUp",
                      bitShift: 1,
                      length: 1
                    }
                  ]
                },
                {
                  valueFor: "geozoningClass",
                  type: "BitMaskObject",
                  values: [
                    {
                      type: "BitMaskValue",
                      valueFor: "geozoningOn",
                      bitShift: 0,
                      length: 1
                    }
                  ]
                }
              ]
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "lorawanConfirmNotifRetry",
            groupId: "0x09",
            localId: "0x05",
            defaultValue: 0,
            description: "Time between link-check requests",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 0,
                maximum: 15
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "lorawanS1TxStrategy",
            groupId: "0x09",
            localId: "0x06",
            defaultValue: 473102,
            description: "Socket 1. Transmission strategy",
            parameterType: {
              type: "ParameterTypeBitMask",
              properties: [
                {
                  name: "ADREnabled",
                  type: "PropertyBoolean",
                  description: "true: to enable the LoRa network ADR if the tracker is static. false: to disable the network ADR regardless the motion state of the tracker"
                },
                {
                  name: "dualTransmissionInStaticEnabled",
                  type: "PropertyBoolean",
                  description: "Control the dual transmission when the tracker is static. true: to enable the dual transmission in static state. false: to disable it"
                },
                {
                  name: "dualTransmissionInMotionEnabled",
                  type: "PropertyBoolean",
                  description: "Control the dual transmission when the tracker is in motion. true: to enable the dual transmission in motion state. false: to disable it in motion state."
                },
                {
                  name: "dataRateModification",
                  type: "PropertyBoolean",
                  description: "Control the DR (Datarate) modification for over-sized messages. true: to allow AOS to adapt the DR for messages not fitting the allowed size for a given datarate.false: to prevent sending of over-sized messages"
                },
                {
                  name: "firstTransmissionDatarate",
                  type: "PropertyObject",
                  properties: [
                    {
                      name: "dr0",
                      type: "PropertyBoolean",
                      description: "false: dr0 is disabled. true: dr0 is enabled."
                    },
                    {
                      name: "dr1",
                      type: "PropertyBoolean",
                      description: "false: dr1 is disabled. true: dr1 is enabled."
                    },
                    {
                      name: "dr2",
                      type: "PropertyBoolean",
                      description: "false: dr2 is disabled. true: dr2 is enabled."
                    },
                    {
                      name: "dr3",
                      type: "PropertyBoolean",
                      description: "false: dr3 is disabled. true: dr3 is enabled."
                    },
                    {
                      name: "dr4",
                      type: "PropertyBoolean",
                      description: "false: dr4 is disabled. true: dr4 is enabled."
                    },
                    {
                      name: "dr5",
                      type: "PropertyBoolean",
                      description: "false: dr5 is disabled. true: dr5 is enabled."
                    },
                    {
                      name: "dr6",
                      type: "PropertyBoolean",
                      description: "false: dr6 is disabled. true: dr6 is enabled."
                    },
                    {
                      name: "dr7",
                      type: "PropertyBoolean",
                      description: "false: dr7 is disabled. true: dr7 is enabled."
                    }
                  ]
                },
                {
                  name: "secondTransmissionDatarate",
                  type: "PropertyObject",
                  properties: [
                    {
                      name: "dr0",
                      type: "PropertyBoolean",
                      description: "false: dr0 is disabled. true: dr0 is enabled."
                    },
                    {
                      name: "dr1",
                      type: "PropertyBoolean",
                      description: "false: dr1 is disabled. true: dr1 is enabled."
                    },
                    {
                      name: "dr2",
                      type: "PropertyBoolean",
                      description: "false: dr2 is disabled. true: dr2 is enabled."
                    },
                    {
                      name: "dr3",
                      type: "PropertyBoolean",
                      description: "false: dr3 is disabled. true: dr3 is enabled."
                    },
                    {
                      name: "dr4",
                      type: "PropertyBoolean",
                      description: "false: dr4 is disabled. true: dr4 is enabled."
                    },
                    {
                      name: "dr5",
                      type: "PropertyBoolean",
                      description: "false: dr5 is disabled. true: dr5 is enabled."
                    },
                    {
                      name: "dr6",
                      type: "PropertyBoolean",
                      description: "false: dr6 is disabled. true: dr6 is enabled."
                    },
                    {
                      name: "dr7",
                      type: "PropertyBoolean",
                      description: "false: dr7 is disabled. true: dr7 is enabled."
                    }
                  ]
                }
              ],
              bitMask: [
                {
                  type: "BitMaskValue",
                  valueFor: "ADREnabled",
                  bitShift: 0,
                  length: 1
                },
                {
                  type: "BitMaskValue",
                  valueFor: "dualTransmissionInStaticEnabled",
                  bitShift: 1,
                  length: 1
                },
                {
                  type: "BitMaskValue",
                  valueFor: "dualTransmissionInMotionEnabled",
                  bitShift: 2,
                  length: 1
                },
                {
                  type: "BitMaskValue",
                  valueFor: "dataRateModification",
                  bitShift: 3,
                  length: 1
                },
                {
                  valueFor: "firstTransmissionDatarate",
                  type: "BitMaskObject",
                  values: [
                    {
                      type: "BitMaskValue",
                      valueFor: "dr0",
                      bitShift: 8,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "dr1",
                      bitShift: 9,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "dr2",
                      bitShift: 10,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "dr3",
                      bitShift: 11,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "dr4",
                      bitShift: 12,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "dr5",
                      bitShift: 13,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "dr6",
                      bitShift: 14,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "dr7",
                      bitShift: 15,
                      length: 1
                    }
                  ]
                },
                {
                  valueFor: "secondTransmissionDatarate",
                  type: "BitMaskObject",
                  values: [
                    {
                      type: "BitMaskValue",
                      valueFor: "dr0",
                      bitShift: 16,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "dr1",
                      bitShift: 17,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "dr2",
                      bitShift: 18,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "dr3",
                      bitShift: 19,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "dr4",
                      bitShift: 20,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "dr5",
                      bitShift: 21,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "dr6",
                      bitShift: 22,
                      length: 1
                    },
                    {
                      type: "BitMaskValue",
                      valueFor: "dr7",
                      bitShift: 23,
                      length: 1
                    }
                  ]
                }
              ]
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "lorawanS1UlPort",
            groupId: "0x09",
            localId: "0x07",
            defaultValue: 19,
            description: "Socket 1. Uplink port",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 1,
                maximum: 252
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "lorawanS1DlPort",
            groupId: "0x09",
            localId: "0x08",
            defaultValue: 3,
            description: "Socket 1. Downlink port",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 1,
                maximum: 252
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "lorawanProbePeriodMotion",
            groupId: "0x09",
            localId: "0x09",
            defaultValue: 43200,
            description: "Time between link-check requests. Applicable when the tracker is moving.",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 120,
                maximum: 2147483647
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "lorawanProbeMaxAttemptsMotion",
            groupId: "0x09",
            localId: "0x0a",
            defaultValue: 4,
            description: "Number of link-check sent declaring the network as lost. Applicable when the tracker is moving.",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 0,
                maximum: 20
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "cellSimInterface",
            groupId: "0x0A",
            localId: "0x00",
            description: "Sim interface.",
            defaultValue: "",
            parameterType: {
              type: "ParameterTypeString",
              possibleValues: [
                "SIM0",
                "E_SIM"
              ],
              firmwareValues: [
                0,
                1
              ]
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "cellNetworkType",
            groupId: "0x0A",
            localId: "0x01",
            description: "Network type",
            defaultValue: "",
            parameterType: {
              type: "ParameterTypeString",
              possibleValues: [
                "CELLULAR_NOT_USED",
                "LTE_M",
                "NB_IOT"
              ],
              firmwareValues: [
                0,
                1,
                2
              ]
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "cellSearchBands",
            groupId: "0x0A",
            localId: "0x02",
            defaultValue: "{00, 00, 00, 00, 00, 00, 00, 00, 00, 00, 00, 00, 00, 00, 00, 00, 00, 00, 00}",
            description: "Radio frequency bands scanned to search a cell.",
            parameterType: {
              type: "ParameterTypeByteArray",
              size: 19
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "cellCnxTimeoutStatic",
            groupId: "0x0A",
            localId: "0x03",
            defaultValue: 180,
            unit: "s",
            description: "Duration during which the modem searches for a cellular network. Applicable when the tracker is static.",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 180,
                maximum: 900
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "cellCnxTimeoutMotion",
            groupId: "0x0A",
            localId: "0x04",
            defaultValue: 300,
            unit: "s",
            description: "Duration during which the modem searches for a cellular network. Applicable when the tracker is motion.",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 180,
                maximum: 900
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "cellCnxNwReconnectTimeout",
            groupId: "0x0A",
            localId: "0x05",
            defaultValue: 60,
            unit: "s",
            description: "Duration let to the modem to automatically recover the network after a network lost.",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 0,
                maximum: 900
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "cellCnxMaxAttempts",
            groupId: "0x0A",
            localId: "0x06",
            defaultValue: 3,
            description: "Number of times the network search is repeated before shutting down the modem.",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 1,
                maximum: 10
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "cellAccessPointName",
            groupId: "0x0A",
            localId: "0x07",
            description: "String providing the service access point name. If not provided, this information is retrieve from the SIM.",
            defaultValue: "",
            parameterType: {
              type: "ParameterTypeAsciiString",
              maxSize: 32
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "cellOperatorSimSlot0",
            groupId: "0x0A",
            localId: "0x08",
            description: "Cellular operator name when using the SIM0",
            defaultValue: "",
            parameterType: {
              type: "ParameterTypeAsciiString",
              maxSize: 32
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "cellOperatorSimSlot1",
            groupId: "0x0A",
            localId: "0x09",
            description: "Cellular operator name when using the SIM1 (E.SIM).",
            defaultValue: "",
            parameterType: {
              type: "ParameterTypeAsciiString",
              maxSize: 32
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "cellLowPowerMode",
            groupId: "0x0A",
            localId: "0x0A",
            description: "Low power mode",
            defaultValue: "",
            parameterType: {
              type: "ParameterTypeString",
              possibleValues: [
                "DISABLED",
                "PSM",
                "EDRX",
                "PSM_EDRX"
              ],
              firmwareValues: [
                0,
                1,
                2,
                3
              ]
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "cellPsmTauPeriod",
            groupId: "0x0A",
            localId: "0x0B",
            description: "Bit-field giving the requested TAU period.",
            defaultValue: 254,
            parameterType: {
              type: "ParameterTypeBitMask",
              properties: [
                {
                  name: "timerValue",
                  type: "PropertyNumber"
                },
                {
                  name: "timerValueUnit",
                  type: "PropertyString",
                  possibleValues: [
                    "VALUE_IS_INCREMENTED_IN_MULTIPLES_OF_10_MINUTES",
                    "VALUE_IS_INCREMENTED_IN_MULTIPLES_OF_1_HOUR",
                    "VALUE_IS_INCREMENTED_IN_MULTIPLES_OF_10_HOURS",
                    "VALUE_IS_INCREMENTED_IN_MULTIPLES_OF_2_SECONDS",
                    "VALUE_IS_INCREMENTED_IN_MULTIPLES_OF_30_SECONDS",
                    "VALUE_IS_INCREMENTED_IN_MULTIPLES_OF_1_MINUTE",
                    "VALUE_IS_INCREMENTED_IN_MULTIPLES_OF_320_HOURS",
                    "THE_TIMER_IS_DEACTIVATED"
                  ],
                  firmwareValues: [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                }
              ],
              bitMask: [
                {
                  type: "BitMaskValue",
                  valueFor: "timerValue",
                  bitShift: 0,
                  length: 5
                },
                {
                  type: "BitMaskValue",
                  valueFor: "timerValueUnit",
                  bitShift: 5,
                  length: 3
                }
              ]
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "cellPsmActiveTime",
            groupId: "0x0A",
            localId: "0x0C",
            description: "Bit-field giving the requested active time.",
            defaultValue: 2,
            parameterType: {
              type: "ParameterTypeBitMask",
              properties: [
                {
                  name: "timerValue",
                  type: "PropertyNumber"
                },
                {
                  name: "timerValueUnit",
                  type: "PropertyString",
                  possibleValues: [
                    "VALUE_IS_INCREMENTED_IN_MULTIPLES_OF_2_SECONDS",
                    "VALUE_IS_INCREMENTED_IN_MULTIPLES_OF_1_MINUTE",
                    "VALUE_IS_INCREMENTED_IN_MULTIPLES_OF_DECI_HOURS",
                    "THE_TIMER_IS_DEACTIVATED"
                  ],
                  firmwareValues: [
                    0,
                    1,
                    2,
                    7
                  ]
                }
              ],
              bitMask: [
                {
                  type: "BitMaskValue",
                  valueFor: "timerValue",
                  bitShift: 0,
                  length: 5
                },
                {
                  type: "BitMaskValue",
                  valueFor: "timerValueUnit",
                  bitShift: 5,
                  length: 3
                }
              ]
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "cellEdrxPcl",
            groupId: "0x0A",
            localId: "0x0D",
            description: "Requested paging cycle length",
            defaultValue: 15,
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 0,
                maximum: 15
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "cellEdrxPtw",
            groupId: "0x0A",
            localId: "0x0E",
            description: "Requested paging time window",
            defaultValue: 3,
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 0,
                maximum: 15
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "cellRaiTimeout",
            groupId: "0x0A",
            localId: "0x0F",
            description: "RAI (Release Assistance Indication) timeout. A null value disables the feature. Use only with UDP protocol.",
            defaultValue: 500,
            unit: "ms",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 0,
                maximum: 1e4
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "cellProbeMaxAttempts",
            groupId: "0x0A",
            localId: "0x10",
            description: "Number of echo-request sent before declaring the network as lost. Set 0 to disable the feature.",
            defaultValue: 0,
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 0,
                maximum: 10
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "cellProbePeriod",
            groupId: "0x0A",
            localId: "0x11",
            description: "Time between echo-request, or since the last downlink activity.",
            defaultValue: 120,
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 120
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "cellS1TransportProto",
            groupId: "0x0A",
            localId: "0x12",
            description: "Socket 1 transport protocol",
            defaultValue: 1,
            parameterType: {
              type: "ParameterTypeString",
              possibleValues: [
                "TCP",
                "UDP"
              ],
              firmwareValues: [
                0,
                1
              ]
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "cellS1IpUrlAddr",
            groupId: "0x0A",
            localId: "0x13",
            description: "Socket 1 remote IP address or URL in string format (max 32 bytes)",
            defaultValue: "",
            parameterType: {
              type: "ParameterTypeAsciiString",
              maxSize: 32
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "cellS1DstIpPort",
            groupId: "0x0A",
            localId: "0x14",
            description: "Socket 1 destination UDP/TCP port",
            defaultValue: 0,
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 0,
                maximum: 65535
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "cellS1SrcIpPort",
            groupId: "0x0A",
            localId: "0x15",
            description: "Socket 1 local UDP/TCP port number. Value 0 means that the modem will choose one.",
            defaultValue: 0,
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 0,
                maximum: 65535
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "cellS1TxAggrTime",
            groupId: "0x0A",
            localId: "0x16",
            description: "Duration in second for which the messages are hold in the socket 1 transmit queue before being transmitted",
            defaultValue: 120,
            unit: "s",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 0,
                maximum: 3600
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "cellApnUserId",
            groupId: "0x0A",
            localId: "0x17",
            description: "String specifying the user identifier for private APN",
            defaultValue: "",
            parameterType: {
              type: "ParameterTypeAsciiString",
              maxSize: 32
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "cellApnUserPwd",
            groupId: "0x0A",
            localId: "0x18",
            description: "String specifying the user password for private APN",
            defaultValue: "",
            parameterType: {
              type: "ParameterTypeAsciiString",
              maxSize: 32
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "cellApnAuthProtocol",
            groupId: "0x0A",
            localId: "0x19",
            description: "String specifying the user password for private APN",
            defaultValue: "",
            parameterType: {
              type: "ParameterTypeString",
              possibleValues: [
                "PAP",
                "CHAP"
              ],
              firmwareValues: [
                1,
                2
              ]
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "cellFuotaServerIpUrlAddr",
            groupId: "0x0A",
            localId: "0x1A",
            description: "FUOTA server IP/URL in string format",
            defaultValue: "",
            parameterType: {
              type: "ParameterTypeAsciiString",
              maxSize: 32
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "bleCnxTxPower",
            groupId: "0x0B",
            localId: "0x00",
            defaultValue: 19,
            description: "BLE Tx power level.",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 0,
                maximum: 31
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "bleCnxAdvDuration",
            groupId: "0x0B",
            localId: "0x01",
            defaultValue: 60,
            description: "Time to wait before stopping advertising or switching to slow advertising",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 30
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "bleCnxBehavior",
            groupId: "0x0B",
            localId: "0x02",
            defaultValue: 1,
            description: "The connectivity configuration.",
            parameterType: {
              type: "ParameterTypeString",
              possibleValues: [
                "DISABLE",
                "ENABLE_NO_PASSKEY",
                "ENABLE_PASSKEY",
                "ENABLE_NO_PASSKEY_NO_SLOW_ADV",
                "ENABLE_PASSKEY_NO_SLOW_ADV"
              ],
              firmwareValues: [
                0,
                1,
                2,
                3,
                4
              ]
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "bleBeaconTxPower",
            groupId: "0x0B",
            localId: "0x03",
            defaultValue: 19,
            description: "Time to wait before stopping advertising or switching to slow advertising",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 0,
                maximum: 31
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "bleBeaconType",
            groupId: "0x0B",
            localId: "0x04",
            defaultValue: 1,
            description: "The connectivity configuration.",
            parameterType: {
              type: "ParameterTypeString",
              possibleValues: [
                "DISABLE",
                "EDDYSTONE_UID",
                "IBEACON",
                "ALTBEACON",
                "QUUPPA",
                "EXPOSURE_ADVERTISEMENT"
              ],
              firmwareValues: [
                0,
                1,
                2,
                3,
                4,
                5,
                6,
                7
              ]
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "bleBeaconIdentifier",
            groupId: "0x0B",
            localId: "0x05",
            description: "BLE beaconing ID parameter",
            parameterType: {
              type: "ParameterTypeByteArray"
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "bleBeaconFastAdvInterval",
            groupId: "0x0B",
            localId: "0x06",
            defaultValue: 333,
            description: "BLE beacon fast advertising interval.",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 20,
                maximum: 10240
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "bleBeaconFastSlowInterval",
            groupId: "0x0B",
            localId: "0x07",
            defaultValue: 1e3,
            description: "BLE beacon slow advertising interval.",
            parameterType: {
              type: "ParameterTypeNumber",
              range: {
                minimum: 20,
                maximum: 10240
              }
            },
            compatibleTrackerModels: [
              {
                producerId: "abeeway",
                moduleId: "compact-tracker",
                version: "2.0"
              },
              {
                producerId: "abeeway",
                moduleId: "combo-compact-tracker",
                version: "1.0"
              }
            ]
          },
          {
            driverParameterName: "nmetaDataperiod",
            groupId: "0x0C",
            localId: "0x00",
            parameterType: { type: "ParameterTypeNumber", range: {
              minimum: 0
            } },
            compatibleTrackerModels: [
              { producerId: "abeeway", moduleId: "compact-tracker", version: "2.0" },
              { producerId: "abeeway", moduleId: "combo-compact-tracker", version: "1.0" }
            ]
          },
          {
            driverParameterName: "sensor0MeasNsampling",
            groupId: "0x0C",
            localId: "0x01",
            parameterType: { type: "ParameterTypeNumber", range: {
              minimum: 0
            } },
            compatibleTrackerModels: [
              { producerId: "abeeway", moduleId: "compact-tracker", version: "2.0" },
              { producerId: "abeeway", moduleId: "combo-compact-tracker", version: "1.0" }
            ]
          },
          {
            driverParameterName: "sensor0HighThreshold",
            groupId: "0x0C",
            localId: "0x02",
            parameterType: { type: "ParameterTypeNumber", range: {
              minimum: 0
            } },
            compatibleTrackerModels: [
              { producerId: "abeeway", moduleId: "compact-tracker", version: "2.0" },
              { producerId: "abeeway", moduleId: "combo-compact-tracker", version: "1.0" }
            ]
          },
          {
            driverParameterName: "sensor0LowThreshold",
            groupId: "0x0C",
            localId: "0x03",
            parameterType: { type: "ParameterTypeNumber", range: {
              minimum: 0
            } },
            compatibleTrackerModels: [
              { producerId: "abeeway", moduleId: "compact-tracker", version: "2.0" },
              { producerId: "abeeway", moduleId: "combo-compact-tracker", version: "1.0" }
            ]
          },
          {
            driverParameterName: "sensor0Hysteresis",
            groupId: "0x0C",
            localId: "0x04",
            parameterType: { type: "ParameterTypeNumber", range: {
              minimum: 0
            } },
            compatibleTrackerModels: [
              { producerId: "abeeway", moduleId: "compact-tracker", version: "2.0" },
              { producerId: "abeeway", moduleId: "combo-compact-tracker", version: "1.0" }
            ]
          },
          {
            driverParameterName: "sensor0MeasNmaxinterval",
            groupId: "0x0C",
            localId: "0x05",
            parameterType: { type: "ParameterTypeNumber", range: {
              minimum: 0
            } },
            compatibleTrackerModels: [
              { producerId: "abeeway", moduleId: "compact-tracker", version: "2.0" },
              { producerId: "abeeway", moduleId: "combo-compact-tracker", version: "1.0" }
            ]
          },
          {
            driverParameterName: "sensor0TelemNmaxinterval",
            groupId: "0x0C",
            localId: "0x06",
            parameterType: { type: "ParameterTypeNumber", range: {
              minimum: 0
            } },
            compatibleTrackerModels: [
              { producerId: "abeeway", moduleId: "compact-tracker", version: "2.0" },
              { producerId: "abeeway", moduleId: "combo-compact-tracker", version: "1.0" }
            ]
          },
          {
            driverParameterName: "sensor0CyclicVersion",
            groupId: "0x0C",
            localId: "0x07",
            parameterType: { type: "ParameterTypeNumber", range: {
              minimum: 0
            } },
            compatibleTrackerModels: [
              { producerId: "abeeway", moduleId: "compact-tracker", version: "2.0" },
              { producerId: "abeeway", moduleId: "combo-compact-tracker", version: "1.0" }
            ]
          },
          {
            driverParameterName: "sensor1MeasNsampling",
            groupId: "0x0C",
            localId: "0x08",
            parameterType: { type: "ParameterTypeNumber", range: {
              minimum: 0
            } },
            compatibleTrackerModels: [
              { producerId: "abeeway", moduleId: "compact-tracker", version: "2.0" },
              { producerId: "abeeway", moduleId: "combo-compact-tracker", version: "1.0" }
            ]
          },
          {
            driverParameterName: "sensor1HighThreshold",
            groupId: "0x0C",
            localId: "0x09",
            parameterType: { type: "ParameterTypeNumber", range: {
              minimum: -254,
              maximum: 256
            }, multiply: 0.1 },
            compatibleTrackerModels: [
              { producerId: "abeeway", moduleId: "compact-tracker", version: "2.0" },
              { producerId: "abeeway", moduleId: "combo-compact-tracker", version: "1.0" }
            ]
          },
          {
            driverParameterName: "sensor1LowThreshold",
            groupId: "0x0C",
            localId: "0x0a",
            parameterType: { type: "ParameterTypeNumber", range: {
              minimum: -254,
              maximum: 256
            }, multiply: 0.1 },
            compatibleTrackerModels: [
              { producerId: "abeeway", moduleId: "compact-tracker", version: "2.0" },
              { producerId: "abeeway", moduleId: "combo-compact-tracker", version: "1.0" }
            ]
          },
          {
            driverParameterName: "sensor1Hysteresis",
            groupId: "0x0C",
            localId: "0x0b",
            parameterType: { type: "ParameterTypeNumber", range: {
              minimum: -254,
              maximum: 256
            }, multiply: 0.1 },
            compatibleTrackerModels: [
              { producerId: "abeeway", moduleId: "compact-tracker", version: "2.0" },
              { producerId: "abeeway", moduleId: "combo-compact-tracker", version: "1.0" }
            ]
          },
          {
            driverParameterName: "sensor1MeasNmaxinterval",
            groupId: "0x0C",
            localId: "0x0c",
            parameterType: { type: "ParameterTypeNumber", range: {
              minimum: 0
            } },
            compatibleTrackerModels: [
              { producerId: "abeeway", moduleId: "compact-tracker", version: "2.0" },
              { producerId: "abeeway", moduleId: "combo-compact-tracker", version: "1.0" }
            ]
          },
          {
            driverParameterName: "sensor1TelemNmaxinterval",
            groupId: "0x0C",
            localId: "0x0d",
            parameterType: { type: "ParameterTypeNumber", range: {
              minimum: 0
            } },
            compatibleTrackerModels: [
              { producerId: "abeeway", moduleId: "compact-tracker", version: "2.0" },
              { producerId: "abeeway", moduleId: "combo-compact-tracker", version: "1.0" }
            ]
          },
          {
            driverParameterName: "sensor1CyclicVersion",
            groupId: "0x0C",
            localId: "0x0e",
            parameterType: { type: "ParameterTypeNumber", range: {
              minimum: 0
            } },
            compatibleTrackerModels: [
              { producerId: "abeeway", moduleId: "compact-tracker", version: "2.0" },
              { producerId: "abeeway", moduleId: "combo-compact-tracker", version: "1.0" }
            ]
          },
          {
            driverParameterName: "sensor2MeasNsampling",
            groupId: "0x0C",
            localId: "0x0f",
            parameterType: { type: "ParameterTypeNumber", range: {
              minimum: 0
            } },
            compatibleTrackerModels: [
              { producerId: "abeeway", moduleId: "compact-tracker", version: "2.0" },
              { producerId: "abeeway", moduleId: "combo-compact-tracker", version: "1.0" }
            ]
          },
          {
            driverParameterName: "sensor2HighThreshold",
            groupId: "0x0C",
            localId: "0x10",
            parameterType: { type: "ParameterTypeNumber", range: {
              minimum: 0
            } },
            compatibleTrackerModels: [
              { producerId: "abeeway", moduleId: "compact-tracker", version: "2.0" },
              { producerId: "abeeway", moduleId: "combo-compact-tracker", version: "1.0" }
            ]
          },
          {
            driverParameterName: "sensor2LowThreshold",
            groupId: "0x0C",
            localId: "0x11",
            parameterType: { type: "ParameterTypeNumber", range: {
              minimum: 0
            } },
            compatibleTrackerModels: [
              { producerId: "abeeway", moduleId: "compact-tracker", version: "2.0" },
              { producerId: "abeeway", moduleId: "combo-compact-tracker", version: "1.0" }
            ]
          },
          {
            driverParameterName: "sensor2Hysteresis",
            groupId: "0x0C",
            localId: "0x12",
            parameterType: { type: "ParameterTypeNumber", range: {
              minimum: 0
            } },
            compatibleTrackerModels: [
              { producerId: "abeeway", moduleId: "compact-tracker", version: "2.0" },
              { producerId: "abeeway", moduleId: "combo-compact-tracker", version: "1.0" }
            ]
          },
          {
            driverParameterName: "sensor2MeasNmaxinterval",
            groupId: "0x0C",
            localId: "0x13",
            parameterType: { type: "ParameterTypeNumber", range: {
              minimum: 0
            } },
            compatibleTrackerModels: [
              { producerId: "abeeway", moduleId: "compact-tracker", version: "2.0" },
              { producerId: "abeeway", moduleId: "combo-compact-tracker", version: "1.0" }
            ]
          },
          {
            driverParameterName: "sensor2TelemNmaxinterval",
            groupId: "0x0C",
            localId: "0x14",
            parameterType: { type: "ParameterTypeNumber", range: {
              minimum: 0
            } },
            compatibleTrackerModels: [
              { producerId: "abeeway", moduleId: "compact-tracker", version: "2.0" },
              { producerId: "abeeway", moduleId: "combo-compact-tracker", version: "1.0" }
            ]
          },
          {
            driverParameterName: "sensor2CyclicVersion",
            groupId: "0x0C",
            localId: "0x15",
            parameterType: { type: "ParameterTypeNumber", range: {
              minimum: 0
            } },
            compatibleTrackerModels: [
              { producerId: "abeeway", moduleId: "compact-tracker", version: "2.0" },
              { producerId: "abeeway", moduleId: "combo-compact-tracker", version: "1.0" }
            ]
          },
          {
            driverParameterName: "sensor3MeasNsampling",
            groupId: "0x0C",
            localId: "0x16",
            parameterType: { type: "ParameterTypeNumber", range: {
              minimum: 0
            } },
            compatibleTrackerModels: [
              { producerId: "abeeway", moduleId: "compact-tracker", version: "2.0" },
              { producerId: "abeeway", moduleId: "combo-compact-tracker", version: "1.0" }
            ]
          },
          {
            driverParameterName: "sensor3HighThreshold",
            groupId: "0x0C",
            localId: "0x17",
            parameterType: { type: "ParameterTypeNumber", range: {
              minimum: 0
            } },
            compatibleTrackerModels: [
              { producerId: "abeeway", moduleId: "compact-tracker", version: "2.0" },
              { producerId: "abeeway", moduleId: "combo-compact-tracker", version: "1.0" }
            ]
          },
          {
            driverParameterName: "sensor3LowThreshold",
            groupId: "0x0C",
            localId: "0x18",
            parameterType: { type: "ParameterTypeNumber", range: {
              minimum: 0
            } },
            compatibleTrackerModels: [
              { producerId: "abeeway", moduleId: "compact-tracker", version: "2.0" },
              { producerId: "abeeway", moduleId: "combo-compact-tracker", version: "1.0" }
            ]
          },
          {
            driverParameterName: "sensor3Hysteresis",
            groupId: "0x0C",
            localId: "0x19",
            parameterType: { type: "ParameterTypeNumber", range: {
              minimum: 0
            } },
            compatibleTrackerModels: [
              { producerId: "abeeway", moduleId: "compact-tracker", version: "2.0" },
              { producerId: "abeeway", moduleId: "combo-compact-tracker", version: "1.0" }
            ]
          },
          {
            driverParameterName: "sensor3MeasNmaxinterval",
            groupId: "0x0C",
            localId: "0x1a",
            parameterType: { type: "ParameterTypeNumber", range: {
              minimum: 0
            } },
            compatibleTrackerModels: [
              { producerId: "abeeway", moduleId: "compact-tracker", version: "2.0" },
              { producerId: "abeeway", moduleId: "combo-compact-tracker", version: "1.0" }
            ]
          },
          {
            driverParameterName: "sensor3TelemNmaxinterval",
            groupId: "0x0C",
            localId: "0x1b",
            parameterType: { type: "ParameterTypeNumber", range: {
              minimum: 0
            } },
            compatibleTrackerModels: [
              { producerId: "abeeway", moduleId: "compact-tracker", version: "2.0" },
              { producerId: "abeeway", moduleId: "combo-compact-tracker", version: "1.0" }
            ]
          },
          {
            driverParameterName: "sensor3CyclicVersion",
            groupId: "0x0C",
            localId: "0x1c",
            parameterType: { type: "ParameterTypeNumber", range: {
              minimum: 0
            } },
            compatibleTrackerModels: [
              { producerId: "abeeway", moduleId: "compact-tracker", version: "2.0" },
              { producerId: "abeeway", moduleId: "combo-compact-tracker", version: "1.0" }
            ]
          }
        ]
      }
    ];
  }
});

// ../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/messages/uplink/responses/response.js
var require_response = __commonJS({
  "../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/messages/uplink/responses/response.js"(exports2, module2) {
    var util2 = require_util();
    var jsonParameters = require_parameters();
    var accelerometer = require_accelerometer();
    var ResponseType = Object.freeze({
      GENERIC_CONFIGURATION_SET: "GENERIC_CONFIGURATION_SET",
      PARAM_CLASS_CONFIGURATION_SET: "PARAM_CLASS_CONFIGURATION_SET",
      GENERIC_CONFIGURATION_GET: "GENERIC_CONFIGURATION_GET",
      PARAM_CLASS_CONFIGURATION_GET: "PARAM_CLASS_CONFIGURATION_GET",
      BLE_STATUS_CONNECTIVITY: "BLE_STATUS_CONNECTIVITY",
      CRC_CONFIGURATION_REQUEST: "CRC_CONFIGURATION_REQUEST",
      SENSOR_REQUEST: "SENSOR_REQUEST",
      DEBUG_INFO_REQUEST: "DEBUG_INFO_REQUEST",
      FUOTA_REQUEST: "FUOTA_REQUEST"
    });
    var StatusType = Object.freeze({
      SUCCESS: "SUCCESS",
      NOT_FOUND: "NOT_FOUND",
      BELOW_LOWER_BOUND: "BELOW_LOWER_BOUND",
      ABOVE_HIGHER_BOUND: "ABOVE_HIGHER_BOUND",
      BAD_VALUE: "BAD_VALUE",
      TYPE_MISMATCH: "TYPE_MISMATCH",
      OPERATION_ERROR: "OPERATION_ERROR",
      READ_ONLY: "READ_ONLY"
    });
    var GroupType = Object.freeze({
      INTERNAL: "INTERNAL",
      SYSTEM_CORE: "SYSTEM_CORE",
      GEOLOC: "GEOLOC",
      GNSS: "GNSS",
      LR11xx: "LR11xx",
      BLE_SCAN1: "BLE_SCAN1",
      BLE_SCAN2: "BLE_SCAN2",
      ACCELEROMETER: "ACCELEROMETER",
      NETWORK: "NETWORK",
      LORAWAN: "LORAWAN",
      CELLULAR: "CELLULAR",
      BLE: "BLE",
      TELEMETRY: "TELEMETRY"
    });
    var ParameterType = Object.freeze({
      DEPREACTED: "DEPREACTED",
      INTEGER: "INTEGER",
      FLOATING_POINT: "FLOATING_POINT",
      ASCCII_STRING: "ASCCII_STRING",
      BYTE_ARRAY: "BYTE_ARRAY"
    });
    function Response(responseType, genericConfigurationSet, parameterClassConfigurationSet, genericConfigurationGet, parameterClassConfigurationGet, bleStatusConnectivity, configurationCrcRequest, sensorRequest, globalCrc, localCrc, fuotaStatus) {
      this.responseType = responseType;
      this.genericConfigurationSet = genericConfigurationSet;
      this.parameterClassConfigurationSet = parameterClassConfigurationSet;
      this.genericConfigurationGet = genericConfigurationGet;
      this.parameterClassConfigurationGet = parameterClassConfigurationGet;
      this.bleStatusConnectivity = bleStatusConnectivity;
      this.configurationCrcRequest = configurationCrcRequest;
      this.sensorRequest = sensorRequest;
      this.globalCrc = globalCrc;
      this.localCrc = localCrc;
      this.fuotaStatus = fuotaStatus;
    }
    function ParameterClassConfigurationSet(group, parameters) {
      this.group = group;
      this.parameters = parameters;
    }
    function determineResponse(payload, multiFrame2) {
      let response = new Response();
      let startingByte2 = 4;
      if (multiFrame2) {
        startingByte2 = 5;
      }
      let typeValue = payload[startingByte2] & 31;
      switch (typeValue) {
        case 0:
          response.responseType = ResponseType.GENERIC_CONFIGURATION_SET;
          response.globalCrc = decodeCrc(payload, startingByte2 + 1, 4);
          response.genericConfigurationSet = determineResponseGenericConfigurationSet(payload.slice(startingByte2 + 5));
          break;
        case 1:
          response.responseType = ResponseType.PARAM_CLASS_CONFIGURATION_SET;
          response.localCrc = decodeCrc(payload, startingByte2 + 2, 3);
          response.parameterClassConfigurationSet = determineResponseParameterClassConfigurationSet(payload.slice(startingByte2 + 1));
          break;
        case 2:
          response.responseType = ResponseType.GENERIC_CONFIGURATION_GET;
          response.genericConfigurationGet = determineResponseGenericConfigurationGet(payload.slice(startingByte2 + 1));
          break;
        case 3:
          response.responseType = ResponseType.PARAM_CLASS_CONFIGURATION_GET;
          response.parameterClassConfigurationGet = determineResponseParameterClassConfigurationGet(payload.slice(startingByte2 + 1));
          break;
        case 4:
          response.responseType = ResponseType.BLE_STATUS_CONNECTIVITY;
          response.bleStatusConnectivity = decodeBLEStatus(payload.slice(startingByte2 + 1));
          break;
        case 5:
          response.responseType = ResponseType.CRC_CONFIGURATION_REQUEST;
          response.crc = decodeBitmapAndCRC(payload.slice(startingByte2 + 1, startingByte2 + 3), payload.slice(startingByte2 + 3));
          break;
        case 6:
          response.responseType = ResponseType.SENSOR_REQUEST;
          response.sensors = decodeSensorResponse(payload.slice(startingByte2 + 1));
          break;
        case 7:
          response.responseType = ResponseType.DEBUG_INFO_REQUEST;
          break;
        case 8:
          response.responseType = ResponseType.FUOTA_REQUEST;
          response.fuotaStatus = decodeFuotaStatus(payload.slice(startingByte2 + 1));
          break;
        default:
          throw new Error("Response Type Unknown");
      }
      return response;
    }
    function decodeSensorResponse(data) {
      let offset = 0;
      const sensors = [];
      while (offset < data.length) {
        const sensorId = data[offset];
        offset += 1;
        switch (sensorId) {
          case 1:
            if (offset + 6 > data.length) {
              throw new Error("Incomplete accelerometer data");
            }
            const accelerationVector = accelerometer.determineAccelerationVector(
              data.slice(offset - 1, offset + 6),
              // Payload slice
              1,
              // X starts at byte 1 (relative to the slice)
              3,
              // Y starts at byte 3 (relative to the slice)
              5
              // Z starts at byte 5 (relative to the slice)
            );
            sensors.push({
              sensorId,
              type: "ACCELEROMETER",
              accelerationVector: [
                accelerationVector[0],
                accelerationVector[1],
                accelerationVector[2]
              ]
            });
            offset += 6;
            break;
          // Add cases for other sensor types here
          // Example:
          // case 2: // Another sensor type
          //     ...
          case 0:
            break;
          default:
            throw new Error("Unknown sensor ID: ".concat(sensorId));
        }
      }
      return sensors;
    }
    function decodeBitmapAndCRC(bitmap, crcBytes) {
      function decodeGroupType(groupIdentifier) {
        switch (groupIdentifier) {
          case 0:
            return "INTERNAL";
          case 1:
            return "SYSTEM_CORE";
          case 2:
            return "GEOLOC";
          case 3:
            return "GNSS";
          case 4:
            return "LR11xx";
          case 5:
            return "BLE_SCAN1";
          case 6:
            return "BLE_SCAN2";
          case 7:
            return "ACCELEROMETER";
          case 8:
            return "NETWORK";
          case 9:
            return "LORAWAN";
          case 10:
            return "CELLULAR";
          case 11:
            return "BLE";
          case 12:
            return "TELEMETRY";
          default:
            throw new Error("Unknown group identifier");
        }
      }
      const isGlobalCRC = Array.isArray(bitmap) && bitmap.length === 2 && bitmap[0] === 0 && bitmap[1] === 0;
      if (isGlobalCRC) {
        if (crcBytes.length !== 4) {
          throw new Error("Invalid global CRC length. Expected 4 bytes.");
        }
        const crcHex = Buffer.from(crcBytes).toString("hex").toUpperCase();
        return ["Global CRC: 0x".concat(crcHex)];
      } else {
        const requestedGroups = [];
        bitmap = bitmap[0] << 8 | bitmap[1];
        for (let i = 0; i < 32; i++) {
          if (bitmap & 1 << i) {
            requestedGroups.push(i);
          }
        }
        if (crcBytes.length !== requestedGroups.length * 3) {
          throw new Error("CRC bytes length does not match the number of requested groups.");
        }
        const result = [];
        for (let i = 0; i < requestedGroups.length; i++) {
          const groupIdentifier = requestedGroups[i];
          const groupName = decodeGroupType(groupIdentifier);
          const crcStartIndex = i * 3;
          const crcHex = Buffer.from(crcBytes.slice(crcStartIndex, crcStartIndex + 3)).toString("hex").toUpperCase();
          result.push("".concat(groupName, ": 0x").concat(crcHex));
        }
        return result;
      }
    }
    function decodeBLEStatus(bleStatusConnectivity) {
      switch (bleStatusConnectivity) {
        case 0:
          return "IDLE";
        case 1:
          return "ADVERTISING";
        case 2:
          return "CONNECTED";
        case 3:
          return "BONDED";
        default:
          return "UNKNOWN";
      }
    }
    function decodeCrc(payload, startingByte2, byteNumber2) {
      if (payload.length < startingByte2 + byteNumber2) {
        throw new Error("Payload is too short to contain a valid CRC.");
      }
      const crcBytes = payload.slice(startingByte2, startingByte2 + byteNumber2);
      const crc = crcBytes.map((b) => b.toString(16).padStart(2, "0")).join("");
      return crc;
    }
    function determineResponseGenericConfigurationSet(payload) {
      let i = 0;
      const step = 3;
      let response = [];
      while (payload.length >= step * (i + 1)) {
        let groupId = payload[i * step];
        let localId = payload[1 + i * step];
        let parameter = getParameterByGroupIdAndLocalId(parametersByGroupIdAndLocalId, groupId, localId);
        let status = determineStatusType(payload[2 + i * step]);
        let group = determineGroupType(groupId);
        let groupObject = response.find((g) => g.group === group);
        if (!groupObject) {
          groupObject = { group, parameters: [] };
          response.push(groupObject);
        }
        groupObject.parameters.push({
          parameterName: parameter.driverParameterName,
          status
        });
        i++;
      }
      return response;
    }
    function determineResponseGenericConfigurationGet(payload) {
      let i = 0;
      let response = [];
      while (payload.length > i) {
        let groupId = payload[i];
        let localId = payload[1 + i];
        let size = payload[2 + i] >> 3 & 31;
        let dataType = payload[2 + i] & 7;
        let parameter = getParameterByGroupIdAndLocalId(parametersByGroupIdAndLocalId, groupId, localId);
        switch (dataType) {
          case 0:
            determineDeprecatedResponse(response, parameter, groupId);
            break;
          case 1:
            determineConfiguration(response, parameter, parseInt(util2.convertBytesToString(payload.slice(3 + i, 3 + i + size)), 16), groupId, size);
            break;
          case 2:
            break;
          case 3:
            determineConfiguration(response, parameter, payload.slice(3 + i, 3 + i + size), groupId, size);
            break;
          case 4:
            determineConfiguration(response, parameter, payload.slice(3 + i, 3 + i + size), groupId, size);
            break;
          case 5:
            determineErrorResponse(response, parameter, groupId);
            break;
        }
        i = i + size + 3;
      }
      return response;
    }
    function determineErrorResponse(response, parameter, groupId) {
      let group = determineGroupType(groupId);
      let paramName = parameter.driverParameterName;
      let groupObject = response.find((g) => g.group === group);
      if (!groupObject) {
        groupObject = { group, parameters: [] };
        response.push(groupObject);
      }
      groupObject.parameters.push({
        parameterName: paramName,
        parameterValue: "ERROR"
      });
    }
    function determineDeprecatedResponse(response, parameter, groupId) {
      let group = determineGroupType(groupId);
      let paramName = parameter.driverParameterName;
      let groupObject = response.find((g) => g.group === group);
      if (!groupObject) {
        groupObject = { group, parameters: [] };
        response.push(groupObject);
      }
      groupObject.parameters.push({
        parameterName: paramName,
        parameterValue: "DEPRECATED"
      });
    }
    function determineConfiguration(response, parameter, paramValue, groupId, parameterSize) {
      let group = determineGroupType(groupId);
      let groupObject;
      let paramName = parameter.driverParameterName;
      let paramType = parameter.parameterType.type;
      switch (paramType) {
        // it can be integer or float
        case "ParameterTypeNumber":
          {
            let range = parameter.parameterType.range;
            let multiply = parameter.parameterType.multiply;
            let additionalValues = parameter.parameterType.additionalValues;
            let additionalRanges = parameter.parameterType.additionalRanges;
            if (range.minimum < 0 || util2.hasNegativeNumber(additionalValues) || util2.hasNegativeNumber(additionalRanges)) {
              if (paramValue > 2147483647) {
                paramValue -= 4294967296;
              }
            }
            if (util2.checkParamValueRange(paramValue, range.minimum, range.maximum, range.exclusiveMinimum, range.exclusiveMaximum, additionalValues, additionalRanges)) {
              if (multiply != void 0) {
                paramValue = paramValue * multiply;
              }
            } else {
              throw new Error(paramName + " parameter value is out of range");
            }
            groupObject = response.find((g) => g.group === group);
            if (!groupObject) {
              groupObject = { group, parameters: [] };
              response.push(groupObject);
            }
            groupObject.parameters.push({
              parameterName: paramName,
              parameterValue: paramValue
            });
          }
          break;
        // A mapping between the firmware values and the possible string values
        case "ParameterTypeString":
          if (parameter.parameterType.firmwareValues.indexOf(paramValue) != -1) {
            groupObject = response.find((g) => g.group === group);
            if (!groupObject) {
              groupObject = { group, parameters: [] };
              response.push(groupObject);
            }
            groupObject.parameters.push({
              parameterName: paramName,
              parameterValue: parameter.parameterType.possibleValues[parameter.parameterType.firmwareValues.indexOf(paramValue)]
            });
          } else {
            throw new Error(paramName + " parameter value is unknown");
          }
          break;
        case "ParameterTypeBitMask":
          {
            let properties = parameter.parameterType.properties;
            let bitMask = parameter.parameterType.bitMask;
            let length = parseInt(1, 16);
            let parameterValue = {};
            for (let property of properties) {
              let propertyName = property.name;
              let propertyType = property.type;
              let bit = bitMask.find((el) => el.valueFor === propertyName);
              switch (propertyType) {
                case "PropertyBoolean":
                  if (bit.length != void 0) {
                    length = util2.lengthToHex(bit.length);
                  }
                  var b = Boolean(paramValue >> bit.bitShift & length);
                  if (bit.inverted != void 0 && bit.inverted) {
                    b = !b;
                  }
                  parameterValue[property.name] = b;
                  break;
                case "PropertyString":
                  {
                    if (bit.length != void 0) {
                      length = util2.lengthToHex(bit.length);
                    }
                    let value = paramValue >> bit.bitShift & length;
                    let possibleValues = property.possibleValues;
                    if (property.firmwareValues.indexOf(value) != -1) {
                      parameterValue[property.name] = possibleValues[property.firmwareValues.indexOf(value)];
                    } else {
                      throw new Error(property.name + " parameter value is not among possible values");
                    }
                  }
                  break;
                case "PropertyNumber":
                  if (bit.length != void 0) {
                    length = util2.lengthToHex(bit.length);
                  }
                  parameterValue[property.name] = paramValue >> bit.bitShift & length;
                  break;
                case "PropertyObject":
                  {
                    let bitValue = {};
                    for (let value of bit.values) {
                      if (value.type == "BitMaskValue") {
                        let length2 = parseInt(1, 16);
                        if (value.length != void 0) {
                          length2 = util2.lengthToHex(value.length);
                        }
                        var b = Boolean(paramValue >> value.bitShift & length2);
                        if (value.inverted != void 0 && value.inverted) {
                          b = !b;
                        }
                        bitValue[value.valueFor] = b;
                      }
                    }
                    parameterValue[property.name] = bitValue;
                  }
                  break;
                default:
                  throw new Error("Property type is unknown");
              }
            }
            groupObject = response.find((g) => g.group === group);
            if (!groupObject) {
              groupObject = { group, parameters: [] };
              response.push(groupObject);
            }
            groupObject.parameters.push({
              parameterName: paramName,
              parameterValue
            });
          }
          break;
        case "ParameterTypeByteArray":
          {
            if (parameter.parameterType.size != void 0 && parameter.parameterType.size != parameterSize) {
              throw new Error("The value of " + paramName + " must have " + parameter.parameterType.size.toString() + " bytes in the array");
            }
            var bytesValue;
            if (parameter.parameterType.properties == void 0) {
              bytesValue = "{" + paramValue.map((value) => {
                return value.toString(16).padStart(2, "0");
              }).join(",") + "}";
            } else {
              let arrayProperties = parameter.parameterType.properties;
              let byteMap = parameter.parameterType.byteMask;
              let arrayLength = parseInt(1, 16);
              bytesValue = [];
              for (let i2 = 0; i2 < parameterSize; i2++) {
                let currentParamValue = paramValue[i2];
                if (parameter.parameterType.distinctValues !== void 0 && parameter.parameterType.distinctValues === true) {
                  let property = arrayProperties[i2];
                  let propertyName = property.name;
                  let propertyValues = {};
                  let bitMapping = byteMap.find((el) => el.valueFor === propertyName);
                  if (!bitMapping) continue;
                  for (let subProperty of property.properties) {
                    let subPropertyName = subProperty.name;
                    let subPropertyType = subProperty.type;
                    let bitValueMapping = bitMapping.values.find((val) => val.valueFor === subPropertyName);
                    if (!bitValueMapping) continue;
                    let bitShift = bitValueMapping.bitShift;
                    let lengthMask = (1 << bitValueMapping.length) - 1;
                    let extractedValue = currentParamValue >> bitShift & lengthMask;
                    switch (subPropertyType) {
                      case "PropertyBoolean":
                        {
                          let booleanValue = Boolean(extractedValue);
                          if (bitValueMapping.inverted) booleanValue = !booleanValue;
                          propertyValues[subPropertyName] = booleanValue;
                        }
                        break;
                      case "PropertyString":
                        {
                          let strIndex = subProperty.firmwareValues.indexOf(extractedValue);
                          if (strIndex !== -1) {
                            propertyValues[subPropertyName] = subProperty.possibleValues[strIndex];
                          } else {
                            throw new Error("".concat(subPropertyName, " value not among possible values"));
                          }
                        }
                        break;
                      case "PropertyNumber":
                        propertyValues[subPropertyName] = extractedValue;
                        break;
                      default:
                        throw new Error("Unknown sub-property type");
                    }
                  }
                  bytesValue.push({ [propertyName]: propertyValues });
                } else {
                  let arrayParameterValue = {};
                  for (let py of arrayProperties) {
                    let propertyName = py.name;
                    let propertyType = py.type;
                    let bit = byteMap.find((el) => el.valueFor === propertyName);
                    if (!bit) continue;
                    if (bit.length !== void 0) {
                      arrayLength = util2.lengthToHex(bit.length);
                    }
                    switch (propertyType) {
                      case "PropertyBoolean":
                        let booleanValue = Boolean(currentParamValue >> bit.bitShift & arrayLength);
                        if (bit.inverted) booleanValue = !booleanValue;
                        arrayParameterValue[propertyName] = booleanValue;
                        break;
                      case "PropertyString":
                        {
                          let stringValue = currentParamValue >> bit.bitShift & arrayLength;
                          let possibleValues = py.possibleValues;
                          if (py.firmwareValues.indexOf(stringValue) !== -1) {
                            arrayParameterValue[propertyName] = possibleValues[py.firmwareValues.indexOf(stringValue)];
                          } else {
                            throw new Error("".concat(propertyName, " value not among possible values"));
                          }
                        }
                        break;
                      case "PropertyNumber":
                        arrayParameterValue[propertyName] = currentParamValue >> bit.bitShift & arrayLength;
                        break;
                      case "PropertyObject":
                        {
                          let bitValue = {};
                          for (let value of bit.values) {
                            if (value.type === "BitMapValue") {
                              let subArrayLength = parseInt(1, 16);
                              if (value.length !== void 0) {
                                subArrayLength = util2.lengthToHex(value.length);
                              }
                              let subBooleanValue = Boolean(currentParamValue >> value.bitShift & subArrayLength);
                              if (value.inverted) subBooleanValue = !subBooleanValue;
                              bitValue[value.valueFor] = subBooleanValue;
                            }
                          }
                          arrayParameterValue[propertyName] = bitValue;
                        }
                        break;
                      case "PropertByteArray":
                        {
                          let byteMask = py.bitMask;
                          if (py.size && py.size > 0) {
                            let currentParamArrayValue = [];
                            for (let j = 0; j < py.size; j++) {
                              if (i2 + j >= paramValue.length) {
                                throw new Error("Parameter size exceeds available data");
                              }
                              currentParamArrayValue.push(paramValue[i2 + j]);
                            }
                            let decodedValues = {};
                            decodedValues = handleArrayProperties(py.properties, byteMask, currentParamArrayValue);
                            arrayParameterValue[propertyName] = decodedValues;
                            i2 += py.size - 1;
                          } else {
                            throw new Error("Invalid size for PropertyByteArray in property ".concat(propertyName));
                          }
                        }
                        break;
                      default:
                        throw new Error("Unknown property type");
                    }
                  }
                  bytesValue.push(arrayParameterValue);
                }
              }
            }
            groupObject = response.find((g) => g.group === group);
            if (!groupObject) {
              groupObject = { group, parameters: [] };
              response.push(groupObject);
            }
            groupObject.parameters.push({
              parameterName: paramName,
              parameterValue: bytesValue
            });
          }
          break;
        case "ParameterTypeAsciiString":
          var paramAsciiString = "";
          for (var i = 0; i < paramValue.length; i++)
            paramAsciiString += String.fromCharCode(paramValue[i]);
          groupObject = response.find((g) => g.group === group);
          if (!groupObject) {
            groupObject = { group, parameters: [] };
            response.push(groupObject);
          }
          groupObject.parameters.push({
            parameterName: paramName,
            parameterValue: paramAsciiString
          });
          break;
        default:
          throw new Error("Parameter type is unknown");
      }
    }
    function handleArrayProperties(properties, bitMask, paramValueArray) {
      let parameterValue = {};
      for (let property of properties) {
        let propertyName = property.name;
        let propertyType = property.type;
        let bit = bitMask.find((el) => el.valueFor === propertyName);
        if (!bit) {
          continue;
        }
        const mask = (1 << bit.length) - 1;
        let paramValue = extractSingleByte(paramValueArray, bit.bitShift);
        const value = paramValue >> bit.bitShift % 8 & mask;
        switch (propertyType) {
          case "PropertyBoolean":
            let booleanValue = Boolean(value);
            if (bit.inverted) booleanValue = !booleanValue;
            parameterValue[propertyName] = booleanValue;
            break;
          case "PropertyString":
            {
              const possibleValues = property.possibleValues || [];
              const firmwareValues = property.firmwareValues || [];
              const index = firmwareValues.indexOf(value);
              if (index !== -1) {
                parameterValue[propertyName] = possibleValues[index];
              } else {
                throw new Error(
                  "".concat(propertyName, " value (").concat(value, ") is not among possible values")
                );
              }
            }
            break;
          case "PropertyNumber":
            parameterValue[propertyName] = value;
            break;
          default:
            throw new Error(
              "Unsupported property type: ".concat(propertyType)
            );
        }
      }
      return parameterValue;
    }
    function extractSingleByte(paramValueArray, bitLength) {
      let byteIndex = 0;
      if (bitLength >= 8) {
        byteIndex = Math.floor(bitLength / 8);
      }
      return paramValueArray[byteIndex];
    }
    function determineResponseParameterClassConfigurationGet(payload) {
      let groupId = payload[0];
      let i = 1;
      let response = [];
      while (payload.length > i) {
        let localId = payload[i];
        let size = payload[1 + i] >> 3 & 31;
        let dataType = payload[1 + i] & 7;
        let parameter = getParameterByGroupIdAndLocalId(parametersByGroupIdAndLocalId, groupId, localId);
        switch (dataType) {
          case 0:
            determineDeprecatedResponse(response, parameter, groupId);
            break;
          case 1:
            determineConfiguration(response, parameter, parseInt(util2.convertBytesToString(payload.slice(2 + i, 2 + i + size)), 16), groupId);
            break;
          case 2:
            break;
          case 3:
            determineConfiguration(response, parameter, payload.slice(2 + i, 2 + i + size), groupId, size);
            break;
          case 4:
            determineConfiguration(response, parameter, payload.slice(2 + i, 2 + i + size), groupId, size);
            break;
          case 5:
            determineErrorResponse(response, parameter, groupId);
            break;
        }
        i = i + size + 2;
      }
      return response;
    }
    function determineResponseParameterClassConfigurationSet(payload) {
      let groupId = payload[0];
      payload = payload.slice(4);
      let i = 0;
      const step = 2;
      let parameters = [];
      while (payload.length >= step * (i + 1)) {
        let parameter = getParameterByGroupIdAndLocalId(parametersByGroupIdAndLocalId, groupId, payload[i * step]);
        parameters.push({
          parameterName: parameter.driverParameterName,
          status: determineStatusType(payload[1 + i * step])
        });
        i++;
      }
      return new ParameterClassConfigurationSet(determineGroupType(groupId), parameters);
    }
    function determineStatusType(value) {
      switch (value) {
        case 0:
          return StatusType.SUCCESS;
        case 1:
          return StatusType.NOT_FOUND;
        case 2:
          return StatusType.BELOW_LOWER_BOUND;
        case 3:
          return StatusType.ABOVE_HIGHER_BOUND;
        case 4:
          return StatusType.BAD_VALUE;
        case 5:
          return StatusType.TYPE_MISMATCH;
        case 6:
          return StatusType.OPERATION_ERROR;
        default:
          throw new Error("Status Type Unknown");
      }
    }
    function determineGroupType(value) {
      switch (value) {
        case 0:
          return GroupType.INTERNAL;
        case 1:
          return GroupType.SYSTEM_CORE;
        case 2:
          return GroupType.GEOLOC;
        case 3:
          return GroupType.GNSS;
        case 4:
          return GroupType.LR11xx;
        case 5:
          return GroupType.BLE_SCAN1;
        case 6:
          return GroupType.BLE_SCAN2;
        case 7:
          return GroupType.ACCELEROMETER;
        case 8:
          return GroupType.NETWORK;
        case 9:
          return GroupType.LORAWAN;
        case 10:
          return GroupType.CELLULAR;
        case 11:
          return GroupType.BLE;
        case 12:
          return GroupType.TELEMETRY;
        default:
          throw new Error("Unknown group");
      }
    }
    function decodeFuotaStatus(value) {
      const v = Number(value);
      switch (v) {
        case 0:
          return "START_ASAP";
        // FUOTA supported and will start ASAP
        case 1:
          return "SCHEDULED";
        // FUOTA supported and scheduled
        case 2:
          return "DENIED_OPERATION_NOT_SUPPORTED";
        // No LTE module or external flash missing
        case 3:
          return "DENIED_CELLULAR_NOT_CONFIGURED";
        // Missing IP/URL or port
        case 4:
          return "DENIED_SERVER_NOT_CONFIGURED";
        // No FUOTA server configured
        case 5:
          return "DENIED_TEMPORARILY_NOT_ALLOWED";
        // Example: SOS active
        case 6:
          return "DENIED_LOW_BATTERY";
        case 7:
          return "DENIED_LOW_TEMPERATURE";
        case 8:
          return "DENIED_HIGH_TEMPERATURE";
        case 9:
          return "DENIED_INCORRECT_USER_REQUEST";
        default:
          throw new Error("Unknown FUOTA status value: " + v);
      }
    }
    function jsonParametersByGroupIdAndLocalId() {
      let parametersByGroupIdAndLocalId2 = {};
      jsonParameters.forEach((entry) => {
        entry.firmwareParameters.forEach((parameter) => {
          let groupId = parseInt(parameter.groupId, 16);
          let localId = parseInt(parameter.localId, 16);
          if (!parametersByGroupIdAndLocalId2[groupId]) {
            parametersByGroupIdAndLocalId2[groupId] = {};
          }
          if (!parametersByGroupIdAndLocalId2[groupId][localId]) {
            parametersByGroupIdAndLocalId2[groupId][localId] = {};
          }
          parametersByGroupIdAndLocalId2[groupId][localId] = parameter;
        });
      });
      return parametersByGroupIdAndLocalId2;
    }
    function getParameterByGroupIdAndLocalId(parameters, groupId, localId) {
      if (parameters[groupId] && parameters[groupId][localId]) {
        return parameters[groupId][localId];
      } else {
        return null;
      }
    }
    var parametersByGroupIdAndLocalId = jsonParametersByGroupIdAndLocalId();
    module2.exports = {
      Response,
      ResponseType,
      determineResponse,
      determineConfiguration,
      parametersByGroupIdAndLocalId,
      getParameterByGroupIdAndLocalId,
      determineGroupType,
      GroupType
    };
  }
});

// ../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/messages/uplink/queries/query.js
var require_query = __commonJS({
  "../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/messages/uplink/queries/query.js"(exports2, module2) {
    var util2 = require_util();
    var QueryType = Object.freeze({
      AIDING_POSITION: "AIDING_POSITION",
      ECHO_REQUEST: "ECHO_REQUEST",
      UPDATE_GPS_ALMANAC: "UPDATE_GPS_ALMANAC",
      UPDATE_BEIDOU_ALMANAC: "UPDATE_BEIDOU_ALMANAC"
    });
    function Query(queryType, gpsSvid, beidouSvid, sequenceNumber) {
      this.queryType = queryType;
      this.gpsSvid = gpsSvid;
      this.beidouSvid = beidouSvid;
      this.sequenceNumber = sequenceNumber;
    }
    function determineQuery(payload) {
      let query = new Query();
      let typeValue = payload[4] & 31;
      switch (typeValue) {
        case 0:
          query.queryType = QueryType.AIDING_POSITION;
          break;
        case 1:
          query.queryType = QueryType.ECHO_REQUEST;
          query.sequenceNumber = payload.slice(5);
          break;
        case 2:
          query.queryType = QueryType.UPDATE_GPS_ALMANAC;
          query.gpsSvid = determineSvId(payload.slice(5), 0, 31, "GPS");
          break;
        case 3:
          query.queryType = QueryType.UPDATE_BEIDOU_ALMANAC;
          query.beidouSvid = determineSvId(payload.slice(5), 0, 34, "BEIDOU");
          break;
        default:
          throw new Error("Query Type Unknown");
      }
      return query;
    }
    function determineSvId(payload, min, max, constellation) {
      let svid = [];
      for (let i = 0; i < payload.length; i++) {
        if (!util2.isValueInRange(payload[i], min, max))
          throw new Error("Invalid " + constellation + " SVID Number");
        svid.push(payload[i]);
      }
      return svid;
    }
    module2.exports = {
      Query,
      determineQuery
    };
  }
});

// ../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/messages/downlink/command.js
var require_command = __commonJS({
  "../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/messages/downlink/command.js"(exports2, module2) {
    var eventClass = require_notification();
    var CommandType = Object.freeze({
      CLEAR_AND_RESET: "CLEAR_AND_RESET",
      RESET: "RESET",
      START_SOS: "START_SOS",
      STOP_SOS: "STOP_SOS",
      SYSTEM_STATUS_REQUEST: "SYSTEM_STATUS_REQUEST",
      POSITION_ON_DEMAND: "POSITION_ON_DEMAND",
      SET_GPS_ALMANAC: "SET_GPS_ALMANAC",
      SET_BEIDOU_ALMANAC: "SET_BEIDOU_ALMANAC",
      START_BLE_CONNECTIVITY: "START_BLE_CONNECTIVITY",
      STOP_BLE_CONNECTIVITY: "STOP_BLE_CONNECTIVITY",
      SYSTEM_EVENT: "SYSTEM_EVENT",
      CLEAR_MOTION_PERCENTAGE: "CLEAR_MOTION_PERCENTAGE",
      GET_DATA_BUFFERING_ENTRIES: "GET_DATA_BUFFERING_ENTRIES",
      CLEAR_ALL_DATA_BUFFERING: "CLEAR_ALL_DATA_BUFFERING",
      CLEAR_BLE_BOND_DATA: "CLEAR_BLE_BOND_DATA"
    });
    function Command(command, classId, eventType, beginUtcTime, duration, bufferedDataType) {
      this.commandType = command;
      this.classId = classId;
      this.eventType = eventType;
      this.beginUtcTime = beginUtcTime;
      this.duration = duration;
      this.bufferedDataType = bufferedDataType;
    }
    function determineCommand(value) {
      const commands = [
        CommandType.CLEAR_AND_RESET,
        CommandType.RESET,
        CommandType.START_SOS,
        CommandType.STOP_SOS,
        CommandType.SYSTEM_STATUS_REQUEST,
        CommandType.POSITION_ON_DEMAND,
        CommandType.SET_GPS_ALMANAC,
        CommandType.SET_BEIDOU_ALMANAC,
        CommandType.START_BLE_CONNECTIVITY,
        CommandType.STOP_BLE_CONNECTIVITY,
        CommandType.SYSTEM_EVENT,
        CommandType.CLEAR_MOTION_PERCENTAGE,
        CommandType.GET_DATA_BUFFERING_ENTRIES,
        CommandType.CLEAR_ALL_DATA_BUFFERING,
        CommandType.CLEAR_BLE_BOND_DATA
      ];
      return commands[value] || null;
    }
    function encodeCommand(data) {
      let encode = [];
      encode[0] = 1 << 3 | data.ackToken;
      let command = Object.values(CommandType).indexOf(data.commandType);
      if (command === -1) {
        throw new Error("Command unknown");
      }
      encode[1] = command;
      if (command === 10) {
        let classId = getClassId(data.classId);
        encode[2] = classId;
        encode[3] = data.eventType;
      }
      if (command === 12) {
        let begin;
        if (data.beginUtcTime) {
          const date = new Date(data.beginUtcTime);
          if (isNaN(date.getTime())) {
            throw new Error("Invalid beginUtcTime format");
          }
          begin = Math.floor(date.getTime() / 1e3);
        } else {
          throw new Error("Missing beginUtcTime");
        }
        encode[2] = begin >>> 24 & 255;
        encode[3] = begin >>> 16 & 255;
        encode[4] = begin >>> 8 & 255;
        encode[5] = begin & 255;
        const dur = data.duration & 65535;
        encode[6] = dur >>> 8 & 255;
        encode[7] = dur & 255;
        encode[8] = encodeBufferedDataType(data.bufferedDataType);
      }
      return encode;
    }
    function decodeCommand(bytes) {
      let decoded = new Command();
      let command = determineCommand(bytes[0]);
      if (!command) {
        throw new Error("Unknown command received");
      }
      decoded.commandType = command;
      if (command === Command.SYSTEM_EVENT) {
        if (bytes.length < 4) {
          throw new Error("Invalid SYSTEM_EVENT byte array length");
        }
        decoded.classId = getClassName(bytes[1]);
        decoded.eventType = bytes[2];
      }
      if (command === CommandType.GET_DATA_BUFFERING_ENTRIES) {
        if (bytes.length < 7) throw new Error("Invalid DATA_BUFFERING_ENTRIES byte array length");
        const begin = bytes[1] << 24 | bytes[2] << 16 | bytes[3] << 8 | bytes[4];
        const beginSeconds = begin >>> 0;
        decoded.beginUtcTime = new Date(beginSeconds * 1e3).toISOString();
        const duration = bytes[5] << 8 | bytes[6];
        decoded.duration = duration;
        decoded.bufferedDataType = decodeBufferedDataType(bytes[7]);
      }
      return decoded;
    }
    function getClassId(className) {
      const classes = {
        [eventClass.Class.SYSTEM]: 0,
        [eventClass.Class.SOS]: 1,
        [eventClass.Class.TEMPERATURE]: 2,
        [eventClass.Class.ACCELEROMETER]: 3,
        [eventClass.Class.NETWORK]: 4,
        [eventClass.Class.GEOZONING]: 5
      };
      if (className in classes) {
        return classes[className];
      }
      throw new Error("Unknown class id");
    }
    function getClassName(classId) {
      const classMap = {
        0: eventClass.Class.SYSTEM,
        1: eventClass.Class.SOS,
        2: eventClass.Class.TEMPERATURE,
        3: eventClass.Class.ACCELEROMETER,
        4: eventClass.Class.NETWORK,
        5: eventClass.Class.GEOZONING
      };
      return classMap[classId] || "UNKNOWN_CLASS";
    }
    function encodeBufferedDataType(flags) {
      let mask = 0;
      if (flags.position) mask |= 1;
      if (flags.notification) mask |= 2;
      if (flags.telemetry) mask |= 4;
      return mask;
    }
    function decodeBufferedDataType(mask) {
      return {
        position: (mask & 1) !== 0,
        // bit 0
        notification: (mask & 2) !== 0,
        // bit 1
        telemetry: (mask & 4) !== 0
        // bit 2
      };
    }
    module2.exports = {
      Command,
      decodeCommand,
      encodeCommand
    };
  }
});

// ../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/messages/downlink/requests/request.js
var require_request = __commonJS({
  "../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/messages/downlink/requests/request.js"(exports2, module2) {
    var responseClass2 = require_response();
    var util2 = require_util();
    var RequestType = responseClass2.ResponseType;
    var SENSOR_TYPES = {
      "DO_NOT_USE": 0,
      "ACCELEROMETER": 1
    };
    function Request(requestType, genericConfigurationSet, parameterClassConfigurationSet, genericConfigurationGet, parameterClassConfigurationGet, bleStatusConnectivity, crc, sensorIds, fuotaBinaryType, filePath, debugInfoType) {
      this.requestType = requestType;
      this.genericConfigurationSet = genericConfigurationSet;
      this.parameterClassConfigurationSet = parameterClassConfigurationSet;
      this.genericConfigurationGet = genericConfigurationGet;
      this.parameterClassConfigurationGet = parameterClassConfigurationGet;
      this.bleStatusConnectivity = bleStatusConnectivity;
      this.crc = crc;
      this.sensorIds = sensorIds;
      this.fuotaBinaryType = fuotaBinaryType;
      this.filePath = filePath;
      this.debugInfoType = debugInfoType;
    }
    function ParameterClassConfigurationGet(group, parameters) {
      this.group = group;
      this.parameters = parameters;
    }
    function encodeRequest(data) {
      let encData = [];
      encData[0] = 2 << 3 | data.ackToken;
      let requestType = encodeRequestType(data.requestType);
      encData[1] = requestType;
      switch (requestType) {
        case 0:
          encData = encodeRequestGenericConfigurationSet(data.setGenericParameters, encData);
          break;
        case 1:
          encData = encodeRequestParameterClassConfigurationSet(data.setParameterClass, encData);
          break;
        case 2:
          encData = encodeRequestGenericConfigurationGet(data.getGenericParameters, encData);
          break;
        case 3:
          encData = encodeRequestParameterClassConfigurationGet(data.getParameterClass, encData);
          break;
        case 5:
          encData = encodeCrc(data.crc, encData);
          break;
        case 6:
          encData = encodeSensorRequest(data.sensorIds, encData);
          break;
        case 7:
          encData = encodeDebugInfoRequest(data.debugInfoType, encData);
          break;
        case 8:
          encData = encodeFuotaRequest(data.fuotaBinaryType, data.filePath, encData);
          break;
        default:
          throw new Error("Unknown request type");
      }
      return encData;
    }
    function encodeDebugInfoRequest(type, encData) {
      encData[2] = type;
      return encData;
    }
    function encodeRequestType(value) {
      switch (value) {
        case "GENERIC_CONFIGURATION_SET":
          return 0;
        case "PARAM_CLASS_CONFIGURATION_SET":
          return 1;
        case "GENERIC_CONFIGURATION_GET":
          return 2;
        case "PARAM_CLASS_CONFIGURATION_GET":
          return 3;
        case "BLE_STATUS_CONNECTIVITY":
          return 4;
        case "CRC_CONFIGURATION_REQUEST":
          return 5;
        case "SENSOR_REQUEST":
          return 6;
        case "DEBUG_INFO_REQUEST":
          return 7;
        case "FUOTA_REQUEST":
          return 8;
        default:
          throw new Error("Unknown request type");
      }
    }
    function encodeFuotaBinaryType(value) {
      switch (value) {
        case "APPLICATION":
          return 0;
        case "BLE_STACK":
          return 1;
        case "MT3333":
          return 2;
        case "LR11XX":
          return 3;
        default:
          throw new Error("Unknown FUOTA binary type");
      }
    }
    function encodeFuotaRequest(binaryType, filePath, encData) {
      encData[2] = encodeFuotaBinaryType(binaryType);
      encData = encodeFuotaFilePath(filePath, encData, 3);
      return encData;
    }
    function decodeRequest(payload) {
      let request = new Request();
      let typeValue = payload[1];
      switch (typeValue) {
        case 0:
          request.requestType = RequestType.GENERIC_CONFIGURATION_SET;
          request.genericConfigurationSet = determineRequestGenericConfigurationSet(payload.slice(2));
          break;
        case 1:
          request.requestType = RequestType.PARAM_CLASS_CONFIGURATION_SET;
          request.parameterClassConfigurationSet = determineRequestParameterClassConfigurationSet(payload.slice(2));
          break;
        case 2:
          request.requestType = RequestType.GENERIC_CONFIGURATION_GET;
          request.genericConfigurationGet = determineRequestGenericConfigurationGet(payload.slice(2));
          break;
        case 3:
          request.requestType = RequestType.PARAM_CLASS_CONFIGURATION_GET;
          request.parameterClassConfigurationGet = determineRequestParameterClassConfigurationGet(payload.slice(2));
          break;
        case 4:
          request.requestType = RequestType.BLE_STATUS_CONNECTIVITY;
          break;
        case 5:
          request.requestType = RequestType.CRC_CONFIGURATION_REQUEST;
          request.crc = decodeCrc(payload.slice(2));
          break;
        case 6:
          request.requestType = RequestType.SENSOR_REQUEST;
          request.sensorIds = decodeSensorRequest(payload.slice(2));
          break;
        case 7:
          request.requestType = RequestType.DEBUG_INFO_REQUEST;
          request.debugInfoType = util2.convertNegativeInt(payload[2], 8);
          break;
        case 8:
          request.requestType = RequestType.FUOTA_REQUEST;
          request.fuotaBinaryType = decodeBinaryFuotaType(payload[2]);
          request.filePath = decodeAsciiString(payload.slice(3));
          break;
        default:
          throw new Error("Request Type Unknown");
      }
      return request;
    }
    function determineRequestGenericConfigurationSet(payload) {
      let i = 0;
      let request = [];
      while (payload.length > i) {
        let groupId = payload[i];
        let localId = payload[1 + i];
        let size = payload[2 + i] >> 3 & 31;
        let dataType = payload[2 + i] & 7;
        let parameter = responseClass2.getParameterByGroupIdAndLocalId(responseClass2.parametersByGroupIdAndLocalId, groupId, localId);
        switch (dataType) {
          case 0:
            determineDeprecatedRequest(request, parameter, groupId);
            break;
          case 1:
            responseClass2.determineConfiguration(request, parameter, parseInt(util2.convertBytesToString(payload.slice(3 + i, 3 + i + size)), 16), groupId, size);
            break;
          case 2:
            break;
          case 3:
            responseClass2.determineConfiguration(request, parameter, payload.slice(3 + i, 3 + i + size), groupId, size);
            break;
          case 4:
            responseClass2.determineConfiguration(request, parameter, payload.slice(3 + i, 3 + i + size), groupId, size);
            break;
          default:
            throw new Error("Unknown parameter type");
        }
        i = i + size + 3;
      }
      return request;
    }
    function encodeCrc(groupNames, encData) {
      if (!Array.isArray(groupNames) || groupNames.length === 0) {
        throw new Error("Group names array is required and cannot be empty");
      }
      let bitmap = 0;
      groupNames.forEach((group) => {
        let index = Object.values(responseClass2.GroupType).indexOf(group);
        if (index !== -1) {
          bitmap |= 1 << index;
        } else {
          console.warn('Group name "'.concat(group, '" not found in GroupType. Skipping.'));
        }
      });
      encData.push(bitmap >> 8, bitmap & 255);
      return encData;
    }
    function decodeCrc(bitmapArray) {
      if (bitmapArray[0] === 0 && bitmapArray[1] === 0) {
        return Object.values(responseClass2.GroupType);
      }
      if (bitmapArray.length < 2) return [];
      let bitmap = bitmapArray[0] << 8 | bitmapArray[1];
      let result = [];
      Object.keys(responseClass2.GroupType).forEach((key, index) => {
        if ((bitmap & 1 << index) !== 0) {
          result.push(responseClass2.GroupType[key]);
        }
      });
      return result;
    }
    function decodeSensorRequest(buffer) {
      return Array.from(buffer).map((id) => {
        let type = Object.keys(SENSOR_TYPES).find((key) => SENSOR_TYPES[key] === id);
        return {
          id,
          type: type || "Unknown"
          // If no match, set it to "Unknown"
        };
      });
    }
    function encodeSensorRequest(sensorIds, encData) {
      if (!Array.isArray(sensorIds)) {
        throw new Error("sensorIds must be an array.");
      }
      if (!Array.isArray(encData)) {
        throw new Error("encData must be an array.");
      }
      sensorIds.forEach((sensor, index) => {
        if (!(sensor.type in SENSOR_TYPES)) {
          throw new Error("Unknown sensor type: ".concat(sensor.type));
        }
        let encodedValue = SENSOR_TYPES[sensor.type];
        encData.push(encodedValue);
      });
      return encData;
    }
    function determineRequestParameterClassConfigurationSet(payload) {
      let groupId = payload[0];
      let i = 1;
      let request = [];
      while (payload.length > i) {
        let localId = payload[i];
        let size = payload[1 + i] >> 3 & 31;
        let dataType = payload[1 + i] & 7;
        let parameter = responseClass2.getParameterByGroupIdAndLocalId(responseClass2.parametersByGroupIdAndLocalId, groupId, localId);
        if (payload.slice(i).length < size) {
          throw new Error(parameter.driverParameterName + " has a wrong type");
        }
        switch (dataType) {
          case 0:
            determineDeprecatedRequest(request, parameter, groupId);
            break;
          case 1:
            responseClass2.determineConfiguration(request, parameter, parseInt(util2.convertBytesToString(payload.slice(2 + i, 2 + i + size)), 16), groupId);
            break;
          case 2:
            break;
          case 3:
            responseClass2.determineConfiguration(request, parameter, payload.slice(2 + i, 2 + i + size), groupId, size);
            break;
          case 4:
            responseClass2.determineConfiguration(request, parameter, payload.slice(2 + i, 2 + i + size), groupId, size);
            break;
          default:
            throw new Error("Unknown parameter type");
        }
        i = i + size + 2;
      }
      return request;
    }
    function determineDeprecatedRequest(request, parameter, groupId) {
      let group = responseClass2.determineGroupType(groupId);
      let paramName = parameter.driverParameterName;
      let groupObject = request.find((g) => g.group === group);
      if (!groupObject) {
        groupObject = { group, parameters: [] };
        request.push(groupObject);
      }
      groupObject.parameters.push({
        parameterName: paramName,
        parameterValue: "DEPRECATED"
      });
    }
    function determineRequestGenericConfigurationGet(payload) {
      let i = 0;
      const step = 2;
      if (payload % 2 === 0) {
        throw new Error("Invalid payload");
      }
      let request = [];
      while (payload.length >= step * (i + 1)) {
        let groupId = payload[i * step];
        let localId = payload[1 + i * step];
        let parameter = responseClass2.getParameterByGroupIdAndLocalId(responseClass2.parametersByGroupIdAndLocalId, groupId, localId);
        let group = responseClass2.determineGroupType(groupId);
        let groupObject = request.find((g) => g.group === group);
        if (!groupObject) {
          groupObject = { group, parameters: [] };
          request.push(groupObject);
        }
        groupObject.parameters.push(
          parameter.driverParameterName
        );
        i++;
      }
      return request;
    }
    function determineRequestParameterClassConfigurationGet(payload) {
      if (payload.length < 2) {
        throw new Error("The payload must contain at least one local identifier");
      }
      let groupId = payload[0];
      payload = payload.slice(1);
      let i = 0;
      const step = 1;
      let parameters = [];
      while (payload.length >= step * (i + 1)) {
        let parameter = responseClass2.getParameterByGroupIdAndLocalId(responseClass2.parametersByGroupIdAndLocalId, groupId, payload[i * step]);
        parameters.push(parameter.driverParameterName);
        i++;
      }
      return new ParameterClassConfigurationGet(responseClass2.determineGroupType(groupId), parameters);
    }
    function encodeRequestGenericConfigurationSet(setGenericParameters, encData) {
      var i = 2;
      for (let [index, entry] of setGenericParameters.entries()) {
        let groupId = determineValueFromGroupType(entry.group);
        for (let param of entry.parameters) {
          let parameter = getParametersByGroupIdAndDriverParameterName(responseClass2.parametersByGroupIdAndLocalId, groupId, param.parameterName);
          encData[i] = groupId;
          encData[i + 1] = parseInt(parameter.localId, 16);
          i = encodeSetParameter(parameter, param.parameterValue, encData, i + 2);
        }
      }
      return encData;
    }
    function encodeRequestParameterClassConfigurationSet(setParameterClass, encData) {
      let groupId = determineValueFromGroupType(setParameterClass.group);
      encData[2] = groupId;
      var i = 3;
      for (let param of setParameterClass.parameters) {
        let parameter = getParametersByGroupIdAndDriverParameterName(responseClass2.parametersByGroupIdAndLocalId, groupId, param.parameterName);
        encData[i] = parseInt(parameter.localId, 16);
        i = encodeSetParameter(parameter, param.parameterValue, encData, i + 1);
      }
      return encData;
    }
    function encodeRequestGenericConfigurationGet(getGenericParameters, encData) {
      var i = 2;
      for (let [index, entry] of getGenericParameters.entries()) {
        let groupId = determineValueFromGroupType(entry.group);
        for (let param of entry.parameters) {
          let parameter = getParametersByGroupIdAndDriverParameterName(responseClass2.parametersByGroupIdAndLocalId, groupId, param);
          encData[i] = groupId;
          encData[i + 1] = parseInt(parameter.localId, 16);
          i = i + 2;
        }
      }
      return encData;
    }
    function encodeRequestParameterClassConfigurationGet(getParameterClass, encData) {
      let groupId = determineValueFromGroupType(getParameterClass.group);
      encData[2] = groupId;
      var i = 3;
      for (let param of getParameterClass.parameters) {
        let parameter = getParametersByGroupIdAndDriverParameterName(responseClass2.parametersByGroupIdAndLocalId, groupId, param);
        encData[i] = parseInt(parameter.localId, 16);
        i++;
      }
      return encData;
    }
    function encodeSetParameter(parameter, paramValue, encData, i) {
      const paramType = parameter.parameterType.type;
      switch (paramType) {
        case "ParameterTypeNumber":
          return encodeNumberParameter(parameter, paramValue, encData, i);
        case "ParameterTypeString":
          return encodeStringParameter(parameter, paramValue, encData, i);
        case "ParameterTypeBitMask":
          return encodeBitMaskParameter(parameter, paramValue, encData, i);
        case "ParameterTypeAsciiString":
          return encodeAsciiStringParameter(parameter, paramValue, encData, i);
        case "ParameterTypeByteArray":
          return encodeByteArrayParameter(parameter, paramValue, encData, i);
        default:
          throw new Error("Parameter type is unknown");
      }
    }
    function encodeNumberParameter(parameter, paramValue, encData, startIndex) {
      const size = 4;
      encData[startIndex] = encodeSizeAndType(size, 1);
      const range = parameter.parameterType.range;
      const multiply = parameter.parameterType.multiply;
      const additionalValues = parameter.parameterType.additionalValues;
      const additionalRanges = parameter.parameterType.additionalRanges;
      if (!util2.checkParamValueRange(paramValue, range.minimum, range.maximum, range.exclusiveMinimum, range.exclusiveMaximum, additionalValues, additionalRanges)) {
        throw new Error("".concat(parameter.driverParameterName, " parameter value is out of range"));
      }
      let value = paramValue;
      if (multiply !== void 0) {
        value /= multiply;
      }
      if (value < 0) {
        value += 4294967296;
      }
      encData[startIndex + 1] = value >> 24 & 255;
      encData[startIndex + 2] = value >> 16 & 255;
      encData[startIndex + 3] = value >> 8 & 255;
      encData[startIndex + 4] = value & 255;
      return startIndex + size + 1;
    }
    function encodeStringParameter(parameter, paramValue, encData, startIndex) {
      const size = 4;
      encData[startIndex] = encodeSizeAndType(size, 1);
      const possibleValues = parameter.parameterType.possibleValues;
      const firmwareValues = parameter.parameterType.firmwareValues;
      const index = possibleValues.indexOf(paramValue);
      if (index === -1) {
        throw new Error("".concat(parameter.driverParameterName, " parameter value is unknown"));
      }
      encData[startIndex + 1] = 0;
      encData[startIndex + 2] = 0;
      encData[startIndex + 3] = 0;
      encData[startIndex + 4] = firmwareValues[index];
      return startIndex + size + 1;
    }
    function encodeBitMaskParameter(parameter, paramValue, encData, startIndex) {
      const size = 4;
      encData[startIndex] = encodeSizeAndType(size, 1);
      const properties = parameter.parameterType.properties;
      const bitMap = parameter.parameterType.bitMask;
      let flags = 0;
      for (let bit of bitMap) {
        const flagName = bit.valueFor;
        const flagValue = paramValue[flagName];
        if (flagValue === void 0) {
          throw new Error("Bit ".concat(flagName, " is missing"));
        }
        const property = properties.find((el) => el.name === flagName);
        if (!property) {
          throw new Error("Property ".concat(flagName, " not found"));
        }
        flags = encodeProperty(property, bit, flagValue, flags);
      }
      encData[startIndex + 1] = flags >> 24 & 255;
      encData[startIndex + 2] = flags >> 16 & 255;
      encData[startIndex + 3] = flags >> 8 & 255;
      encData[startIndex + 4] = flags & 255;
      return startIndex + size + 1;
    }
    function encodeFuotaFilePath(filePath, encData, startIndex) {
      const size = filePath.length;
      if (size > 46) {
        throw new Error("File path length exceeds the maximum allowed size of 46 bytes.");
      }
      for (let j = 0; j < filePath.length; j++) {
        encData[startIndex + j] = filePath.charCodeAt(j) & 255;
      }
      return encData;
    }
    function encodeAsciiStringParameter(parameter, paramValue, encData, startIndex) {
      const size = paramValue.length;
      encData[startIndex] = encodeSizeAndType(size, 3);
      for (let j = 0; j < paramValue.length; j++) {
        encData[startIndex + j + 1] = paramValue.charCodeAt(j) & 255;
      }
      return startIndex + size + 1;
    }
    function encodeByteArrayParameter(parameter, paramValue, encData, startIndex) {
      const size = parameter.parameterType.size;
      encData[startIndex] = encodeSizeAndType(size, 4);
      if (!parameter.parameterType.properties) {
        encodeRawByteArray(paramValue, size, encData, startIndex);
      } else {
        encodeByteArrayWithProperties(parameter, paramValue, size, encData, startIndex);
      }
      return startIndex + size + 1;
    }
    function encodeRawByteArray(paramValue, size, encData, startIndex) {
      const paramValueHex = paramValue.toString().replace(/[{}]/g, "").replace(/,/g, "");
      for (let j = 0; j < size; j++) {
        encData[startIndex + j + 1] = parseInt(paramValueHex.slice(j * 2, j * 2 + 2), 16);
      }
    }
    function encodeByteArrayWithProperties(parameter, paramValue, size, encData, startIndex) {
      const arrayProperties = parameter.parameterType.properties;
      const byteMask = parameter.parameterType.byteMask;
      const distinctValues = parameter.parameterType.distinctValues === true;
      for (let j = 0; j < size; j++) {
        let flags = 0;
        if (distinctValues) {
          const currentParamValue = paramValue[j];
          if (!currentParamValue || typeof currentParamValue !== "object") {
            throw new Error("Invalid parameter value at index ".concat(j, ", expected an object but got ").concat(currentParamValue));
          }
          const propertyName = Object.keys(currentParamValue)[0];
          const propertyValue = currentParamValue[propertyName];
          const bitMapping = byteMask.find((el) => el.valueFor === propertyName);
          const propertyDef = arrayProperties.find((el) => el.name === propertyName);
          if (!bitMapping || !propertyDef) {
            throw new Error("Property ".concat(propertyName, " not found in byteMask or properties"));
          }
          flags = encodeProperty(propertyDef, bitMapping, propertyValue, flags);
        } else {
          flags = encodeProperties(arrayProperties, byteMask, paramValue[j], flags);
        }
        encData[startIndex + j + 1] = flags & 255;
      }
    }
    function encodeProperties(arrayProperties, byteMask, paramValue, flags) {
      for (let bit of byteMask) {
        const flagName = bit.valueFor;
        const flagValue = paramValue[flagName];
        if (flagValue === void 0) {
          throw new Error("Byte ".concat(flagName, " is missing"));
        }
        const property = arrayProperties.find((el) => el.name === flagName);
        if (!property) {
          throw new Error("Property ".concat(flagName, " not found"));
        }
        flags = encodeProperty(property, bit, flagValue, flags);
      }
      return flags;
    }
    function encodeProperty(property, bit, flagValue, flags) {
      switch (property.type) {
        case "PropertyBoolean":
          return encodeBooleanProperty(bit, flagValue, flags);
        case "PropertyString":
          return encodeStringProperty(property, bit, flagValue, flags);
        case "PropertyNumber":
          return encodeNumberProperty(property, bit, flagValue, flags);
        case "PropertyObject":
          return encodeObjectProperty(bit, flagValue, flags);
        default:
          throw new Error("Unknown property type: ".concat(property.type));
      }
    }
    function encodeBooleanProperty(bit, flagValue, flags) {
      let value = flagValue;
      if (bit.inverted) {
        value = !value;
      }
      return flags | Number(value) << bit.bitShift;
    }
    function encodeStringProperty(property, bit, flagValue, flags) {
      const index = property.possibleValues.indexOf(flagValue);
      if (index === -1) {
        throw new Error("".concat(property.name, " value is not among possible values"));
      }
      return flags | property.firmwareValues[index] << bit.bitShift;
    }
    function encodeNumberProperty(property, bit, flagValue, flags) {
      if (property.range) {
        if (!util2.checkParamValueRange(flagValue, property.range.minimum, property.range.maximum, property.range.exclusiveMinimum, property.range.exclusiveMaximum, property.additionalValues, property.additionalRanges)) {
          throw new Error("Value out of range for ".concat(property.name));
        }
      }
      return flags | flagValue << bit.bitShift;
    }
    function encodeObjectProperty(bit, flagValue, flags) {
      for (let b of bit.values) {
        const fValue = flagValue[b.valueFor];
        if (fValue === void 0) {
          throw new Error("Bit ".concat(bit.valueFor, ".").concat(b.valueFor, " is missing"));
        }
        let value = fValue;
        if (b.inverted) {
          value = !value;
        }
        flags |= Number(value) << b.bitShift;
      }
      return flags;
    }
    function encodeSizeAndType(size, type) {
      return size << 3 | type;
    }
    function decodeBinaryFuotaType(value) {
      switch (value) {
        case 0:
          return "APPLICATION";
        case 1:
          return "BLE_STACK";
        case 2:
          return "MT3333";
        case 3:
          return "LR11XX";
        default:
          throw new Error("Unknown binary fuota type: " + value);
      }
    }
    function decodeAsciiString(bytes) {
      let result = "";
      for (let i = 0; i < bytes.length; i++) {
        const b = bytes[i];
        if (b === 0) continue;
        result += String.fromCharCode(b);
      }
      return result;
    }
    function getParametersByGroupIdAndDriverParameterName(parameters, groupId, driverParameterName) {
      if (parameters[groupId]) {
        for (let localId in parameters[groupId]) {
          if (parameters[groupId][localId].driverParameterName === driverParameterName) {
            return parameters[groupId][localId];
          }
        }
      }
      return null;
    }
    function determineValueFromGroupType(groupType) {
      switch (groupType) {
        case responseClass2.GroupType.INTERNAL:
          return 0;
        case responseClass2.GroupType.SYSTEM_CORE:
          return 1;
        case responseClass2.GroupType.GEOLOC:
          return 2;
        case responseClass2.GroupType.GNSS:
          return 3;
        case responseClass2.GroupType.LR11xx:
          return 4;
        case responseClass2.GroupType.BLE_SCAN1:
          return 5;
        case responseClass2.GroupType.BLE_SCAN2:
          return 6;
        case responseClass2.GroupType.ACCELEROMETER:
          return 7;
        case responseClass2.GroupType.NETWORK:
          return 8;
        case responseClass2.GroupType.LORAWAN:
          return 9;
        case responseClass2.GroupType.CELLULAR:
          return 10;
        case responseClass2.GroupType.BLE:
          return 11;
        default:
          throw new Error("Unknown group type");
      }
    }
    module2.exports = {
      RequestType,
      encodeRequest,
      decodeRequest
    };
  }
});

// ../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/messages/uplink/telemetry/telemetry.js
var require_telemetry2 = __commonJS({
  "../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/messages/uplink/telemetry/telemetry.js"(exports2, module2) {
    var CodingPolicy = Object.freeze({
      NO_COMPRESSION: "NO_COMPRESSION",
      DELTA_COMPRESSION: "DELTA_COMPRESSION",
      HUFFMAN_COMPRESSION: "HUFFMAN_COMPRESSION"
    });
    var DataTypes = Object.freeze({
      _8_BIT_UNSIGNED: "8_BIT_UNSIGNED",
      _16_BIT_SIGNED: "16_BIT_SIGNED"
    });
    var RecordingPolicy = Object.freeze({
      INSTANT: "INSTANT",
      MIN: "MIN",
      MAX: "MAX",
      CHANGE_OF_VALUE: "CHANGE_OF_VALUE"
    });
    function convert3BitToSigned(val) {
      return val & 4 ? val - 8 : val;
    }
    function decodeMetadataPayload(telemetryPayload, timestamp) {
      let telemetryMetadataStore = {};
      let offset = 0;
      while (offset + 8 <= telemetryPayload.length) {
        const block = telemetryPayload.slice(offset, offset + 8);
        const payloadType = (block[0] & 128) >> 7;
        if (payloadType !== 1) break;
        const telemetryId = block[0] >> 4 & 7;
        const cyclicVersion = block[0] & 7;
        const fixedTimeInterval = block[1] >> 3 & 3;
        const numMeasurements = block[1] & 7;
        const telemetryIDMaxInterval = telemetryPayload.readUInt16BE(offset + 2);
        const measurementNMaxInterval = telemetryPayload.readUInt16BE(offset + 4);
        const measurementConfigByte1 = block[6];
        const measurementConfigByte2 = block[7];
        const measurementConfig = decodeMeasurementConfigBytes(measurementConfigByte1, measurementConfigByte2);
        telemetryMetadataStore[telemetryId] = {
          telemetryId,
          cyclicVersion,
          fixedTimeInterval,
          numMeasurements,
          telemetryIDMaxInterval,
          measurementNMaxInterval,
          measurementConfig,
          timestamp
        };
        offset += 8;
      }
      if (!context) {
        throw new Error("Context doesn't exist");
      }
      context.length = 0;
      context.push(telemetryMetadataStore);
      return { data: telemetryMetadataStore, errors: [], warnings: [] };
    }
    function decodeMeasurementConfigBytes(byte1, byte2) {
      const measurementId = byte1 >> 6 & 3;
      let codingPolicy = byte1 >> 2 & 3;
      let dataType = byte1 & 3;
      let recordingPolicy = byte2 >> 5 & 7;
      let scalingFactor = byte2 >> 1 & 7;
      scalingFactor = Math.pow(10, convert3BitToSigned(scalingFactor));
      let sampleCompression = byte2 & 1;
      switch (dataType) {
        case 0:
          dataType = DataTypes._8_BIT_UNSIGNED;
          break;
        case 1:
          dataType = DataTypes._16_BIT_SIGNED;
          break;
        default:
          throw new Error('Unsupported data type "'.concat(dataType, '"'));
      }
      switch (codingPolicy) {
        case 0:
          codingPolicy = CodingPolicy.NO_COMPRESSION;
          break;
        case 1:
          codingPolicy = CodingPolicy.DELTA_COMPRESSION;
          break;
        case 2:
          codingPolicy = CodingPolicy.HUFFMAN_COMPRESSION;
          break;
        default:
          throw new Error('Unsupported coding policy "'.concat(codingPolicy, '"'));
      }
      switch (recordingPolicy) {
        case 0:
          recordingPolicy = RecordingPolicy.INSTANT;
          break;
        case 1:
          recordingPolicy = RecordingPolicy.MIN;
          break;
        case 2:
          recordingPolicy = RecordingPolicy.MAX;
          break;
        default:
          recordingPolicy = RecordingPolicy.CHANGE_OF_VALUE;
      }
      sampleCompression = sampleCompression === 0 ? "LINEAR" : "LOGARITHMIC";
      return {
        measurementId,
        codingPolicy,
        dataType,
        recordingPolicy,
        scalingFactor,
        sampleCompression
      };
    }
    function decodeTimeseriesPayload(telemetryPayload, timestamp) {
      if (telemetryPayload.length < 4) {
        throw new Error("Telemetry payload too short for timeseries decoding");
      }
      const byte0 = telemetryPayload[0];
      const telemetryId = byte0 >> 4 & 7;
      const alarmTrigger = (byte0 & 1) === 1;
      const byte1 = telemetryPayload[1];
      const cyclicVersion = byte1 >> 5 & 7;
      const cyclicCounter = byte1 & 31;
      if (!context || context.length === 0) {
        throw new Error("Context is empty, cannot retrieve metadata history");
      }
      const metadataHistory = context[context.length - 1];
      if (!metadataHistory || Object.keys(metadataHistory).length === 0) {
        throw new Error("Metadata history is empty, cannot retrieve telemetry metadata");
      }
      let metadata = Object.values(metadataHistory).find((t) => t.telemetryId === telemetryId);
      if (!metadata || metadata.cyclicVersion !== cyclicVersion) {
        throw new Error("Missing or mismatched metadata for TelemetryID=".concat(telemetryId, ", CyclicVersion=").concat(cyclicVersion, "\u0300\u0300"));
      }
      const measurementNMaxInterval = metadata.measurementNMaxInterval;
      const { codingPolicy, dataType, scalingFactor } = metadata.measurementConfig;
      const measurementData = telemetryPayload.slice(2);
      let measurements = [];
      if (codingPolicy === CodingPolicy.DELTA_COMPRESSION && dataType === DataTypes._16_BIT_SIGNED) {
        const buffer = Buffer.from(measurementData);
        let i = buffer.length - 1;
        let result = [];
        let currentValue = 0;
        while (i >= 0) {
          const byte = buffer[i];
          const isDelta = (byte >> 7 & 1) !== 0;
          if (!isDelta) {
            if (i < 1) {
              throw new Error("Invalid buffer: not enough bytes for 16-bit value");
              break;
            }
            const lsb = buffer[i - 1];
            const msb = buffer[i];
            const raw = msb << 8 | lsb;
            currentValue = raw >= 32768 ? raw - 65536 : raw;
            result.push(currentValue);
            i -= 2;
          } else {
            const signBit = byte >> 6 & 1;
            const num = byte & 63;
            const delta = signBit ? num - 64 : num;
            currentValue += delta;
            result.push(currentValue);
            i -= 1;
          }
        }
        measurements = result.reverse();
      } else {
        throw new Error("Unsupported coding policy or data type for delta decoding");
      }
      const baseTime = new Date(timestamp);
      const scaledMeasurements = measurements.map((m, index) => {
        const secondsAgo = index * measurementNMaxInterval;
        return {
          timestamp: new Date(baseTime.getTime() - secondsAgo * 1e3).toISOString(),
          value: parseFloat((m * scalingFactor).toFixed(2))
        };
      });
      return {
        type: "timeseries",
        telemetryId,
        alarmTrigger,
        cyclicVersion,
        cyclicCounter,
        measurements: scaledMeasurements,
        measurementConfig: metadata.measurementConfig
      };
    }
    function decodeTelemetry(payload, timestamp) {
      if (!(payload instanceof Buffer)) {
        try {
          payload = Buffer.from(payload, typeof payload === "string" ? "hex" : void 0);
        } catch (e) {
          return { errors: ["Invalid payload format"], warnings: [] };
        }
      }
      if (payload.length < 5) {
        return { errors: ["Payload too short"], warnings: [] };
      }
      const headerLength = 4;
      const telemetryPayload = payload.slice(headerLength);
      if (telemetryPayload.length < 1) {
        return { errors: ["No telemetry payload"], warnings: [] };
      }
      const payloadTypeByte = telemetryPayload[0];
      const isMetadata = (payloadTypeByte & 128) !== 0;
      if (isMetadata) {
        const result = decodeMetadataPayload(telemetryPayload, timestamp);
        if (result.data === void 0) {
          return {
            errors: result.errors,
            warnings: result.warnings || []
          };
        }
        return {
          type: "metadata",
          TelemetryIDs: result.data
        };
      } else {
        const telemetryResult = decodeTimeseriesPayload(telemetryPayload, timestamp);
        if (telemetryResult.measurementConfig === void 0) {
          return {
            errors: telemetryResult.errors,
            warnings: telemetryResult.warnings || []
          };
        }
        return telemetryResult;
      }
    }
    module2.exports = {
      decodeTelemetry
    };
  }
});

// ../vendors/charp/drivers/ch02-maxi/extractPoints.js
var require_extractPoints = __commonJS({
  "../vendors/charp/drivers/ch02-maxi/extractPoints.js"(exports2) {
    function extractPoints(input) {
      return null;
    }
    exports2.extractPoints = extractPoints;
  }
});

// ../../device-catalog/vendors/abeeway/drivers/asset-tracker-3/src/index.js
var abeewayUplinkPayloadClass = require_abeewayUplinkPayload();
var abeewayDownlinkPayloadClass = require_abeewayDownlinkPayload();
var basicHeadeClass = require_basicHeader();
var extendedHeaderClass = require_extendedHeader();
var notificationClass = require_notification();
var positionClass = require_position();
var responseClass = require_response();
var queryClass = require_query();
var util = require_util();
var commandClass = require_command();
var requestClass = require_request();
var telemetryClass = require_telemetry2();
var DOWNLINK_PORT_NUMBER = 3;
var removeEmpty = (obj) => {
  Object.keys(obj).forEach(
    (k) => obj[k] && typeof obj[k] === "object" && removeEmpty(obj[k]) || !obj[k] && (obj[k] === null || obj[k] === void 0 || Number.isNaN(obj[k])) && delete obj[k]
  );
  return obj;
};
function isContextUsedInPayload(input) {
  const payload = input.payload || util.convertBytesToString(input.bytes);
  const byteString = payload.slice(0, 2);
  if (typeof byteString !== void 0) {
    const byte0 = parseInt(byteString, 16);
    const payloadType = (byte0 & 56) >> 3;
    const isTelemetry = payloadType === 5;
    return isTelemetry;
  }
  return false;
}
function decodeUplink(input) {
  let result = {
    data: {},
    errors: [],
    warnings: []
  };
  try {
    var decodedData = new abeewayUplinkPayloadClass.AbeewayUplinkPayload();
    var payload = input.bytes;
    var receivedTime = input.recvTime;
    decodedData.header = basicHeadeClass.determineHeader(payload, receivedTime);
    decodedData.payload = util.convertBytesToString(payload);
    if (decodedData.header.buffering) {
      if (payload.length < 6)
        throw new Error("the payload is not valid to determine header with buffering");
      payload.splice(4, 2);
    }
    var multiFrame2 = !!(payload[0] >> 7 & 1);
    if (multiFrame2) {
      decodedData.extendedHeader = extendedHeaderClass.determineExtendedHeader(payload);
    }
    switch (decodedData.header.type) {
      case abeewayUplinkPayloadClass.messageType.NOTIFICATION:
        decodedData.notification = notificationClass.determineNotification(payload);
        break;
      case abeewayUplinkPayloadClass.messageType.POSITION:
        decodedData.position = positionClass.determinePosition(payload, multiFrame2);
        break;
      case abeewayUplinkPayloadClass.messageType.QUERY:
        decodedData.query = queryClass.determineQuery(payload);
        break;
      case abeewayUplinkPayloadClass.messageType.RESPONSE:
        decodedData.response = responseClass.determineResponse(payload, multiFrame2);
        break;
      case abeewayUplinkPayloadClass.messageType.TELEMETRY:
        decodedData.telemetry = telemetryClass.decodeTelemetry(payload, decodedData.header.timestamp);
        break;
    }
    decodedData = removeEmpty(decodedData);
    result.data = decodedData;
  } catch (e) {
    result.errors.push(e.message);
    delete result.data;
    return result;
  }
  return result;
}
function decodeDownlink(input) {
  let result = {
    data: {},
    errors: [],
    warnings: []
  };
  try {
    var payload = input.bytes;
    var decodedData = new abeewayDownlinkPayloadClass.determineDownlinkHeader(payload);
    decodedData.payload = util.convertBytesToString(payload);
    switch (decodedData.downMessageType) {
      case abeewayDownlinkPayloadClass.MessageType.COMMAND:
        decodedData.command = commandClass.decodeCommand(payload.slice(1));
        break;
      case abeewayDownlinkPayloadClass.MessageType.REQUEST:
        decodedData.request = requestClass.decodeRequest(payload);
        break;
      case abeewayDownlinkPayloadClass.MessageType.ANSWER:
        decodedData.response = responseClass.determineResponse(payload, multiFrame);
        break;
    }
    decodedData = removeEmpty(decodedData);
    result.data = decodedData;
  } catch (e) {
    result.errors.push(e.message);
    delete result.data;
    return result;
  }
  return result;
}
function encodeDownlink(input) {
  let result = {
    errors: [],
    warnings: []
  };
  try {
    if (input == null) {
      throw new Error("No data to encode");
    }
    let data = input;
    if (input.data != null) {
      data = input.data;
    }
    var bytes = [];
    if (data.downMessageType == null) {
      throw new Error("No downlink message type");
    }
    switch (data.downMessageType) {
      case abeewayDownlinkPayloadClass.MessageType.COMMAND:
        bytes = commandClass.encodeCommand(data);
        break;
      case abeewayDownlinkPayloadClass.MessageType.REQUEST:
        bytes = requestClass.encodeRequest(data);
        break;
      case abeewayDownlinkPayloadClass.MessageType.ANSWER:
        break;
    }
    result.bytes = bytes;
    result.fPort = DOWNLINK_PORT_NUMBER;
  } catch (e) {
    result.errors.push(e.message);
    delete result.bytes;
    delete result.fPort;
    return result;
  }
  return result;
}
module.exports = {
  decodeUplink,
  decodeDownlink,
  encodeDownlink,
  isContextUsedInPayload
};
module.exports.extractPoints = require_extractPoints().extractPoints;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(33);
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});