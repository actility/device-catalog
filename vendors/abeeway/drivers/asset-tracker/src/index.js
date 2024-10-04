let abeewayUplinkPayloadClass = require("./messages/abeewayUplinkPayload");
let abeewayDownlinkPayloadClass = require("./messages/abeewayDownlinkPayload");
let bssidInfoClass = require("./messages/bssidInfo");
let beaconIdInfoClass = require("./messages/beaconIdInfo");
let healthStatusClass = require("./messages/healthStatus");
let measuredTemperatureClass = require("./messages/measuredTemperature");
let scanCollectionClass = require("./messages/scanCollection");
let proximityNotificationClass = require("./messages/proximityNotification");
let proximityDailyReportClass = require("./messages/proximityDailyReport");
let proximityDailyResponseClass = require("./messages/proximityDailyResponse");
let proximityWhiteListingClass = require("./messages/proximityWhiteListing");
let proximityMessageClass = require("./messages/proximityMessage");
let angleDetectionFlagsClass = require("./messages/angleDetectionFlags");
let angleDetectionClass = require("./messages/angleDetection");
let geofencingNotificationClass = require("./messages/geofencingNotification");
let startupModesClass = require("./messages/startupModes");
let smsClass = require("./messages/sms");
let jsonProfiles = require("./resources/profiles.json");
let jsonParameters = require("./resources/parameters.json");
let jsonParametersTable = jsonParametersByIdAndByDriverName()
let jsonParametersById = jsonParametersTable[0]
let jsonParametersByDriverName = jsonParametersTable[1]
const MessageType = require("./enums/messageType");
const MiscDataTag = require("./enums/miscDataTag");
const Mode = require("./enums/mode");
const DynamicMotionState = require("./enums/dynamicMotionState");
const BatteryStatus = require("./enums/batteryStatus");
const RawPositionType = require("./enums/rawPositionType");
const TimeoutCause = require("./enums/timeoutCause");
const BleBeaconFailure = require("./enums/bleBeaconFailure");
const DebugCommandTag = require("./enums/debugCommandTag");
const ShutdownCause = require("./enums/shutdownCause");
const EventType = require("./enums/eventType");
const DownMessageType = require("./enums/downMessageType");
const DebugCommandType = require("./enums/debugCommandType");
const OptionalCommand = require("./enums/optionalCommand");
const ResetAction = require("./enums/resetAction");
const MelodyId = require("./enums/melodyId");
const ErrorCode = require("./enums/errorCode");
const AngleDetectionControl = require("./enums/angleDetectionControl");
const GpsFixStatus = require("./enums/gpsFixStatus");
const pointExtractions = require("../extractPoints");

function convertToByteArray(payload){
    var bytes = [];
    var length = payload.length/2;
    for(var i = 0; i < payload.length; i+=2){
        bytes[i/2] = parseInt(payload.substring(i, i+2),16)&0xFF;
    }
    
    return bytes;
}

const removeEmpty = (obj) => {
    Object.keys(obj).forEach(k =>
      (obj[k] && typeof obj[k] === 'object') && removeEmpty(obj[k]) ||
      (!obj[k] && (obj[k] === null || obj[k] === undefined)) && delete obj[k] 
    );
    return obj;
  };

function determineParamIdNames(parameterIds) {
	let paramNames = [];
	for (let parameterId of parameterIds){
	     let paramName = null;
		 if ((jsonParametersById[parameterId].driverParameterName)== "gpsEHPE"){
			 paramName = "GPS_EHPE"
		 }
		 else if ((jsonParametersById[parameterId].driverParameterName)== "mode"){
			 paramName = "GET_MODE"
		 }
		 else if ((jsonParametersById[parameterId].driverParameterName)== "firmwareVersion"){
			 paramName = "FW_VERSION"
		 }
		 else if ((jsonParametersById[parameterId].driverParameterName)== "bleFirmwareVersion"){
			 paramName = "BLE_VERSION"
		 }
		 else {
			 paramName = camelToSnake(jsonParametersById[parameterId].driverParameterName);
		 }
		
		 paramNames.push(convertByteToString(parameterId).toUpperCase() + ":" + paramName);
	
	}
    return paramNames;

}

function camelToSnake(string) {
       return string.replace(/[\w]([A-Z1-9])/g, function(m) {
           return m[0] + "_" + m[1];
       }).toUpperCase();
   }

function determinDownlinkAckToken(payload){
    if (payload.length < 2)
        throw new Error("The payload is not valid to determine Ack Token");
    return payload[1] & 0x0F;
}

function determineMessageType(payload){
    if (payload.length < 1)
        throw new Error("The payload is not valid to determine Message Type");
    var messageType = payload[0];

    switch (messageType){
        case 0:
            return MessageType.FRAME_PENDING;
        case 3:
            return MessageType.POSITION_MESSAGE;
        case 4:
            if ((payload[4] & 0x0F) ==0)
                return MessageType.ENERGY_STATUS;
            if ((payload[4] & 0x0F) ==1)
                return MessageType.HEALTH_STATUS;
        case 5:
            return MessageType.HEARTBEAT;
        case 7:
            var miscDataTag = determineMiscDataTag(payload);
            switch(miscDataTag){
                case MiscDataTag.ACTIVITY_COUNTER:
                    return MessageType.ACTIVITY_STATUS;
                case MiscDataTag.DEVICE_CONFIGURATION:
                    return MessageType.CONFIGURATION;
                case MiscDataTag.SHOCK_DETECTION:
                    return MessageType.SHOCK_DETECTION;
                case MiscDataTag.PERIODIC_ACTIVITY:
                    return MessageType.ACTIVITY_STATUS;
                case MiscDataTag.BLE_MAC:
                    return MessageType.BLE_MAC;
            }
        case 9:
            return MessageType.SHUTDOWN;
        case 10:
            return MessageType.EVENT;
        case 11:
            return MessageType.DATA_SCAN_COLLECTION;
        case 12:
            return MessageType.PROXIMITY_DETECTION;
        case 13:
            return MessageType.SMS;
        case 14:
            return MessageType.EXTENDED_POSITION_MESSAGE;
        case 15:
            return MessageType.DEBUG;
        default:
            return MessageType.UNKNOWN;
    }
}

function determineMiscDataTag(payload){
    if (payload.length < 6)
        throw new Error("The payload is not valid to determine Misc Data Tag");
    var miscDataTag = payload[5] & 0x07;
    switch (miscDataTag){
        case 1:
            return MiscDataTag.ACTIVITY_COUNTER;
        case 2:
            return MiscDataTag.DEVICE_CONFIGURATION;
        case 3:
            return MiscDataTag.SHOCK_DETECTION;
        case 4:
            return MiscDataTag.PERIODIC_ACTIVITY;
        case 5:
            return MiscDataTag.BLE_MAC;
        default:
            throw new Error("The Misc Data Tag is unknown");
    }
}

function determineTrackingMode(payload){
    if (payload.length < 2)
        throw new Error("The payload is not valid to determine Tracking mode");
    var trackingMode = (payload[1] >> 5) & 0x07;
    switch (trackingMode){
        case 0:
            return Mode.STAND_BY;
        case 1:
            return Mode.MOTION_TRACKING;
        case 2:
            return Mode.PERMANENT_TRACKING;
        case 3:
            return Mode.MOTION_START_END_TRACKING;
        case 4:
            return Mode.ACTIVITY_TRACKING;
        case 5:
            return Mode.OFF;
        default:
            throw new Error("The Mode is unknown");
    }
}

function determineUserAction(payload){
    if (payload.length < 2)
        throw new Error("The payload is not valid to determine User Action");
    return (payload[1] >> 4) & 0x01;
}

function determineAppState(payload){
    if (payload.length < 2)
        throw new Error("The payload is not valid to determine App State");
    return (payload[1] >> 3) & 0x01;
}

function determineMoving(payload){
    if (payload.length < 2)
        throw new Error("The payload is not valid to determine Moving");
    var moving = (payload[1] >> 2) & 0x01;
    switch (moving){
        case 0:
            return DynamicMotionState.STATIC;
        case 1:
            return DynamicMotionState.MOVING;
        default:
            throw new Error("The Dynamic Motion State is unknown");
    }
}

function determineBatteryLevel(payload){
    if (payload.length < 3)
        throw new Error("The payload is not valid to determine Battery Level");
    var value = payload[2];
    if (value == 0 || value == 255)
        return null;
    return value;
}

function determineBatteryStatus(payload){
    if (payload.length < 3)
        throw new Error("The payload is not valid to determine Battery Status");
    var value = payload[2];
    if (value == 0)
        return BatteryStatus.CHARGING;
    else if (value == 255)
        return BatteryStatus.UNKNOWN;
    else 
        return BatteryStatus.OPERATING;
}

function determineBatteryVoltage(payload){
    if (payload.length < 3)
        throw new Error("The payload is not valid to determine Battery Voltage");
    if (payload[2] == 0) {
        return 0;
    }
    var decodedValue = decodeCondensed(payload[2], 2.8, 4.2, 8, 2);
    return Math.round(decodedValue *100) /100;
}

function determineTemperature(payload){
    if (payload.length < 4)
        throw new Error("The payload is not valid to determine Temperature");
    var decodedValue = decodeCondensed(payload[3], -44, 85, 8, 0);
    return Math.round(decodedValue *10) /10;

}

function determinePeriodicPosition(payload){
    if (payload.length < 2)
        throw new Error("The payload is not valid to determine Periodic Position");
    return ((payload[1] >> 1) & 0x01) == 1;
}

function determineOnDemandPosition(payload){
    if (payload.length < 2)
        throw new Error("The payload is not valid to determine On Demand Position");
    return (payload[1] & 0x01) == 1;
}

function determineAckToken(payload, messageType){
	if (messageType==MessageType.SMS)
	{
	    if (payload.length < 2)
	        throw new Error("The payload is not valid to determine Ack Token");
	    return (payload[1] >> 4) & 0x0F;
	}
    if (payload.length < 5)
        throw new Error("The payload is not valid to determine Ack Token");
    return (payload[4] >> 4) & 0x0F;
}

function determineRawPositionType(payload){
    if (payload.length < 5)
        throw new Error("The payload is not valid to determine Raw Position Type");
    var rawPositionType = payload[4] & 0x0F;
    switch (rawPositionType){
        case 0:
            return RawPositionType.GPS;
        case 1:
            return RawPositionType.GPS_TIMEOUT;
        case 2:
            return RawPositionType.ENCRYPTED_WIFI_BSSIDS;
        case 3:
            return RawPositionType.WIFI_TIMEOUT;
        case 4:
            return RawPositionType.WIFI_FAILURE;
        case 5:
            return RawPositionType.XGPS_DATA;
        case 6:
            return RawPositionType.XGPS_DATA_WITH_GPS_SW_TIME;
        case 7:
            return RawPositionType.BLE_BEACON_SCAN;
        case 8:
            return RawPositionType.BLE_BEACON_FAILURE;
        case 9:
            return RawPositionType.WIFI_BSSIDS_WITH_NO_CYPHER;
        case 10:
            return RawPositionType.BLE_BEACON_SCAN_SHORT_ID;
        case 11:
            return RawPositionType.BLE_BEACON_SCAN_LONG_ID;
        default:
            return RawPositionType.UNKNOWN;
    }
}

function determineAge(payload){
    if (payload.length < 6)
        throw new Error("The payload is not valid to determine age");
    return decodeCondensed(payload[5], 0, 2040, 8, 0);
}

function determineExtendedAge(payload){
    if (payload.length < 7)
        throw new Error("The payload is not valid to determine age");
    return ((payload[5]<<8)+payload[6]);
}

function determineGpsFixStatus(payload){
    if (payload.length < 8)
        throw new Error("The payload is not valid to determine GPS fix status");
    
    switch (payload[7] & 0x1){
	    case 0:
	        return GpsFixStatus.FIX_2D;
	    case 1:
	        return GpsFixStatus.FIX_3D
    }
}

function detemindGpsPayloadType(payload){
    if (payload.length < 8)
        throw new Error("The payload is not valid to determine GPS payload type");
    return payload[7] >>1 & 0x1;
}

function determineGpsPrevious(payload){
	if (payload.length < 26)
		throw new Error("The payload is not valid to determine previous gps");
	let gpsPrevious = {}
	gpsPrevious["age"] = decodeCondensed(payload[23], 0, 2040, 8, 0);
    const previousFix = (payload[24] << 8) + payload[25]
    switch (previousFix >> 15){
	    case 0:
	    	gpsPrevious["dynamicMotionState"] =  DynamicMotionState.STATIC;
	    	break;
	    case 1:
	    	gpsPrevious["dynamicMotionState"] = DynamicMotionState.MOVING;
	    	break
	    default:
	        throw new Error("The dynamic motion state of the previous fix is unknown");
    }
    const previousN= (previousFix >> 12) & 0x7
    const previousLatitudeDelta = (previousFix >> 6) & 0x3F
    const previousLongitudeDelta = previousFix & 0x3F
    gpsPrevious["latitude"] = (parseInt(convertBytesToString(payload.slice(8,12)),16) - (decodeCondensed(previousLatitudeDelta, -32, 31, 6, 0) * (1 << previousN)));
    if (gpsPrevious["latitude"] > 0x7FFFFFFF) {
    	gpsPrevious["latitude"] -= 0x100000000;
    }
    gpsPrevious["latitude"] = gpsPrevious["latitude"] / Math.pow(10, 7);
    gpsPrevious["longitude"] = (parseInt(convertBytesToString(payload.slice(12,16)),16) - (decodeCondensed(previousLongitudeDelta, -32, 31, 6, 0) * (1 << previousN)));
    if (gpsPrevious["longitude"] > 0x7FFFFFFF) {
    	gpsPrevious["longitude"] -= 0x100000000;
    }
    gpsPrevious["longitude"] = gpsPrevious["longitude"] / Math.pow(10, 7);
    return gpsPrevious;
}

function determineLatitude(payload, messageType){
	let lengthCheck;
	let shift;
	var payloadLength = payload.length 
	switch (messageType){
		case MessageType.EXTENDED_POSITION_MESSAGE:
			lengthCheck = 12
			shift =""
			payload = payload.slice(8,12)
			break;
		case MessageType.POSITION_MESSAGE:
			lengthCheck = 9
			shift ="00"
			payload = payload.slice(6,9)
			break;
	}	
    if (payloadLength < lengthCheck)
        throw new Error("The payload is not valid to determine GPS latitude");
    let value = convertBytesToString(payload)+ shift;
    var codedLatitude = parseInt(value,16);
    if (codedLatitude > 0x7FFFFFFF) {
        codedLatitude -= 0x100000000;
    }
    return (codedLatitude / Math.pow(10, 7));
}

function determineLongitude(payload, messageType){
	let lengthCheck;
	let shift;
	var payloadLength = payload.length 
	switch (messageType){
		case MessageType.EXTENDED_POSITION_MESSAGE:
			lengthCheck = 16
			shift =""
			payload = payload.slice(12,16)
			break;
		case MessageType.POSITION_MESSAGE:
			lengthCheck = 12
			shift ="00"
			payload = payload.slice(9,12)
			break;
	}	
	if (payloadLength < lengthCheck)
		throw new Error("The payload is not valid to determine GPS longitude");
	let value = convertBytesToString(payload) + shift;
    var codedLongitude = parseInt(value,16);
    
    if (codedLongitude > 0x7FFFFFFF) {
        codedLongitude -= 0x100000000;
    }
    return (codedLongitude / Math.pow(10, 7));
}

function determineAltitude(payload, payloadType){
    if (payload.length < 18)
        throw new Error("The payload is not valid to determine GPS altitude");
    let rawValue = (payload[16]<<8)+payload[17];
    if(rawValue >= 32768) rawValue -= 65536;
    if (payloadType == 0){
        //the value is encoded in centimeter
        return rawValue / 100
    }
    else if (payloadType == 1){
        //the value is encoded in meter
        return rawValue;
    }
}

function determineCourseOverGround(payload){
    if (payload.length < 21)
        throw new Error("The payload is not valid to determine GPS course over ground");
    // expressed in 1/100 degree
    return ((payload[19]<<8)+payload[20]);
}

function determineSpeedOverGround(payload){
    if (payload.length < 23)
        throw new Error("The payload is not valid to determine GPS speed over ground");
    // expressed in cm/s
    return ((payload[21]<<8)+payload[22]);
}

function determineHorizontalAccuracy(payload, payloadType, messageType){
    let lengthCheck;
    let value;
    switch (messageType){
		case MessageType.EXTENDED_POSITION_MESSAGE:
			lengthCheck = 19
			value = payload[18]
			break;
		case MessageType.POSITION_MESSAGE:
			lengthCheck = 13
			value = payload[12]
			break;
        
    }
    if (payload.length < lengthCheck)
        throw new Error("The payload is not valid to determine horizontal accuracy");
    if (payloadType == 0){
        return Math.round(decodeCondensed(value, 0, 1000, 8, 0) * 100) / 100;
    }
    else if (payloadType == 1){
        let convertedValue = value
        if (value > 250){
            switch (value){
                case 251:
                    convertedValue = "(250,500]"
                    break
                case 252:
                    convertedValue = "(500,1000]"
                    break
                case 253:
                    convertedValue = "(1000,2000]"
                    break;
                case 254:
                    convertedValue = "(2000,4000]"
                    break;
                case 255:
                    convertedValue = "(4000,)"
                    break;
            }
        }
       
        return convertedValue;
    }	
    
}

function determineTimeoutCause(payload, messageType){
	let lengthCheck;
	let timeoutCause;
	switch (messageType){
		case MessageType.EXTENDED_POSITION_MESSAGE:
			lengthCheck = 8
			timeoutCause = payload[7]
			break;
		case MessageType.POSITION_MESSAGE:
			lengthCheck = 6
			timeoutCause = payload[5]
			break;
	}
	if (payload.length < lengthCheck)
        throw new Error("The payload is not valid to determine timeout cause");
    switch (timeoutCause){
	    case 0:
	        return TimeoutCause.USER_TIMEOUT;
	    case 1:
	        return TimeoutCause.T0_TIMEOUT;
	    case 2:
	    	return TimeoutCause.T1_TIMEOUT;
	    default:
	    	throw new Error("The timeout cause is unknown");
    }
}

function determineBestSatellitesCOverN(payload, messageType){
    var bestSatellitesCOverN = [];
    let lengthCheck;
    var payloadLength = payload.length;
    switch (messageType){
		case MessageType.EXTENDED_POSITION_MESSAGE:
			lengthCheck = 12
			payload = payload.slice(8,12)
			break;
		case MessageType.POSITION_MESSAGE:
			lengthCheck = 10
			payload = payload.slice(6,10)
			break;
    }
    if (payloadLength < lengthCheck)
        throw new Error("The payload is not valid to determine Best Satellites C/N");
    bestSatellitesCOverN.push(Math.round(decodeCondensed(payload[0], 0, 50, 8, 0)));
    bestSatellitesCOverN.push(Math.round(decodeCondensed(payload[1], 0, 50, 8, 0)));
    bestSatellitesCOverN.push(Math.round(decodeCondensed(payload[2], 0, 50, 8, 0)));
    bestSatellitesCOverN.push(Math.round(decodeCondensed(payload[3], 0, 50, 8, 0)));
    return bestSatellitesCOverN;
}

function determineBatteryVoltageMeasures(payload, messageType){
    var payloadLength = payload.length;
    let lengthCheck;
    switch (messageType){
		case MessageType.EXTENDED_POSITION_MESSAGE:
			lengthCheck = 13
			payload = payload.slice(7)
			break;
		case MessageType.POSITION_MESSAGE:
			lengthCheck = 11
			payload = payload.slice(5)
			break;
    }
    if (payloadLength < lengthCheck){
    	 throw new Error("The payload is not valid to determine battery voltage measures");
    }
    var measures = [];
    for(var i = 0; i < 6; i++){
        let decodedValue = decodeCondensed(payload[i], 2.8, 4.2, 8, 2);
        measures.push(Math.floor(decodedValue*100)/100);
    }
    return measures;
}

function determineErrorCode(payload, messageType){ 
    var payloadLength = payload.length;
    let lengthCheck;
    switch (messageType){
		case MessageType.EXTENDED_POSITION_MESSAGE:
			lengthCheck = 14
			payload = payload[13]
			break;
		case MessageType.POSITION_MESSAGE:
			lengthCheck = 12
			payload = payload[11]
			break;
    }
    if (payloadLength < lengthCheck){
   	 throw new Error("The payload is not valid to determine error code");
   }
    return payload;
}

function determineBSSIDS(payload, messageType){
    var i = 0;
    var bssids = [];
    let lengthCheck;
    let indexStart;
    switch (messageType){
		case MessageType.EXTENDED_POSITION_MESSAGE:
			lengthCheck = 14
			indexStart = 7
			break;
		case MessageType.POSITION_MESSAGE:
			lengthCheck = 13
			indexStart = 6 
			break;
    }
    while (payload.length >= lengthCheck + 7*i){
        let key = convertByteToString(payload[indexStart + i*7]) + ":" 
                    + convertByteToString(payload[(indexStart+1)+i*7]) + ":"
                    + convertByteToString(payload[(indexStart+2)+i*7]) + ":"
                    + convertByteToString(payload[(indexStart+3)+i*7]) + ":"
                    + convertByteToString(payload[(indexStart+4)+i*7]) + ":"
                    + convertByteToString(payload[(indexStart+5)+i*7]);
        let value = payload[indexStart+6+i*7];
        if (value > 127){
            value -= 256;
        }
        bssids.push(new bssidInfoClass.BssidInfo(key, value));
        i++;
    }
    return bssids;
}

function determineShortBeaconIDs(payload, messageType){
    var i = 0;
    var ids = [];
    let lengthCheck;
    let indexStart;
    switch (messageType){
		case MessageType.EXTENDED_POSITION_MESSAGE:
			lengthCheck = 14
			indexStart = 7
			break;
		case MessageType.POSITION_MESSAGE:
			lengthCheck = 13
			indexStart = 6 
			break;
    }
    while (payload.length >= lengthCheck + 7*i){
        let key = convertByteToString(payload[indexStart + i*7]) + "-" 
                    + convertByteToString(payload[(indexStart+1) + i*7]) + "-"
                    + convertByteToString(payload[(indexStart+2) + i*7]) + "-"
                    + convertByteToString(payload[(indexStart+3) + i*7]) + "-"
                    + convertByteToString(payload[(indexStart+4) + i*7]) + "-"
                    + convertByteToString(payload[(indexStart+5) + i*7]);
        let value = payload[indexStart + 6 + i*7];
        if (value > 127){
            value -= 256;
        }
        //let BeaconIdInfo = beaconIdInfoClass.BeaconIdInfo;
        ids.push(new beaconIdInfoClass.BeaconIdInfo(key, value));
        i++;
    }
    return ids;
}

function determineLongBeaconIDs(payload, messageType){
    var i = 0;
    var ids = [];
    let lengthCheck;
    let indexStart;
    switch (messageType){
		case MessageType.EXTENDED_POSITION_MESSAGE:
			lengthCheck = 24
			indexStart = 7
			break;
		case MessageType.POSITION_MESSAGE:
			lengthCheck = 23
			indexStart = 6 
			break;
    }
    while (payload.length >= lengthCheck + 7*i){
        let key = convertByteToString(payload[indexStart + i*7]) + "-" 
                    + convertByteToString(payload[(indexStart+1) + i*7]) + "-"
                    + convertByteToString(payload[(indexStart+2) + i*7]) + "-"
                    + convertByteToString(payload[(indexStart+3) + i*7]) + "-"
                    + convertByteToString(payload[(indexStart+4) + i*7]) + "-"
                    + convertByteToString(payload[(indexStart+5) + i*7])+ "-" 
                    + convertByteToString(payload[(indexStart+6) + i*7]) + "-"
                    + convertByteToString(payload[(indexStart+7) + i*7]) + "-"
                    + convertByteToString(payload[(indexStart+8) + i*7]) + "-"
                    + convertByteToString(payload[(indexStart+9) + i*7]) + "-" 
                    + convertByteToString(payload[(indexStart+10) + i*7]) + "-"
                    + convertByteToString(payload[(indexStart+11) + i*7]) + "-"
                    + convertByteToString(payload[(indexStart+12) + i*7]) + "-"
                    + convertByteToString(payload[(indexStart+13) + i*7]) + "-" 
                    + convertByteToString(payload[(indexStart+14) + i*7]) + "-"
                    + convertByteToString(payload[(indexStart+15) +i*7]);
        let value = payload[indexStart + 16 + i*7];
        if (value > 127){
            value -= 256;
        }
        ids.push(new beaconIdInfoClass.BeaconIdInfo(key, value));
        i++;
    }
    return ids;
}

function determineBleBeaconFailure(payload, messageType){
    let lengthCheck;
    let index;
    switch (messageType){
		case MessageType.EXTENDED_POSITION_MESSAGE:
			lengthCheck = 8
			index = 7
			break;
		case MessageType.POSITION_MESSAGE:
			lengthCheck = 6
			index = 5 
			break;
	}
    if (payload.length < lengthCheck)
        throw new Error("The payload is not valid to determine Ble Beacon Failure");
    let bleBeaconFailure = payload[index];
    switch (bleBeaconFailure){
        case 0:
            return BleBeaconFailure.BLE_NOT_RESPONDING;
        case 1:
            return BleBeaconFailure.INTERNAL_ERROR;
        case 2:
            return BleBeaconFailure.SHARED_ANTENNA_NOT_AVAILABLE;
        case 3:
            return BleBeaconFailure.SCAN_ALREADY_ON_GOING;
        case 4:
            return BleBeaconFailure.NO_BEACON_DETECTED;
        case 5:
            return BleBeaconFailure.HARDWARE_INCOMPATIBILITY;
        //only for backward compatibility before AT2.3
        case 6: 
            return BleBeaconFailure.HARDWARE_INCOMPATIBILITY;
        //only for backward compatibility before AT2.3
        case 7:
            return BleBeaconFailure.UNKNOWN_BLE_FIRMWARE_VERSION;
        default:
            throw new Error("The Ble Beacon Failure is unknown");
    }
}

function determineResetCause(payload){
    if (payload.length < 6)
        throw new Error("The payload is not valid to determine Reset Cause");
    return payload[5];
}

function determineHeartBeatFirmwareVersion(payload){
    if (payload.length < 9)
        throw new Error("The payload is not valid to determine HeartBeat Firmware Version");
    return payload[6].toString()+"."+payload[7].toString()+"."+payload[8].toString();
}

function determineHeartBeatBleFirmwareVersion(payload){
    if (payload.length < 12)
        throw new Error("The payload is not valid to determine HeartBeat BLE Firmware Version");
    return payload[9].toString()+"."+payload[10].toString()+"."+payload[11].toString();
}

function determineBleMac(payload){
    if (payload.length < 12)
        throw new Error("The payload is not valid to determine BLE MAC");
    return convertByteToString(payload[6]) + ":"
        + convertByteToString(payload[7]) + ":"
        + convertByteToString(payload[8]) + ":"
        + convertByteToString(payload[9]) + ":"
        + convertByteToString(payload[10]) + ":"
        + convertByteToString(payload[11]);
}

function determineGpsOnRuntime(payload){
    if (payload.length < 9)
        throw new Error("The payload is not valid to determine GPS On Runtime");
    return parseInt(convertBytesToString(payload.slice(5,9)),16);
}

function determineGpsStandby(payload){
    if (payload.length < 13)
        throw new Error("The payload is not valid to determine GPS Standby Runtime");
    return parseInt(convertBytesToString(payload.slice(9,13)),16);
}

function determineWifiScanCount(payload){
    if (payload.length < 17)
        throw new Error("The payload is not valid to determine Wifi Scan Count");
    return parseInt(convertBytesToString(payload.slice(13,17)),16);
}

function determinHealthStatus(payload){
    if (payload.length < 19)
        throw new Error("The payload is not valid to determine Health Status");
    let healthStatus = new healthStatusClass.HealthStatus();
    healthStatus.totalConsumption = (payload[5]<<8)+payload[6];
    healthStatus.maxTemperature = Math.round(decodeCondensed(payload[7], -44, 85, 8, 0)*10)/10;
    healthStatus.minTemperature = Math.round(decodeCondensed(payload[8], -44, 85, 8, 0)*10)/10;
    healthStatus.loraPowerConsumption = (payload[9]<<8)+payload[10];
    healthStatus.blePowerConsumption = (payload[11]<<8)+payload[12];
    healthStatus.gpsPowerConsumption = (payload[13]<<8)+payload[14];
    healthStatus.wifiPowerConsumption = (payload[15]<<8)+payload[16];
    healthStatus.batteryVoltage = (payload[17]<<8)+payload[18];
    return healthStatus;
}

function determineActivityCounter(payload){
    if (payload.length < 10)
        throw new Error("The payload is not valid to determine activity counter");
    return parseInt(convertBytesToString(payload.slice(6,10)),16);
}

function determinePeriodicActivity(payload){
    if (payload.length < 18)
        throw new Error("The payload is not valid to determine periodic activity");
    let activities = [];
    for (var i=0; i<6; i++){
        activities.push((payload[6+i*2]<<8)+payload[7+i*2]);
    }
    return activities;
}

function determineActivityCounterPeriodicReport(payload){
    if (payload.length < 22)
        throw new Error("The payload is not valid to determine activity counter in periodic report");
    return parseInt(convertBytesToString(payload.slice(18,22)),16);
}

function determineNbShocks(payload){
    if (payload.length < 7)
        throw new Error("The payload is not valid to determine Nb of shocks");
    return payload[6];
}

function determineAccelerometerShockData(payload){
    let x = determineAxis(payload, 7);
    let y = determineAxis(payload, 9);
    let z = determineAxis(payload, 11);
    return [x,y,z];
}

function determineAxis(payload, byteNumber){
    if (payload.length < (byteNumber + 2)){
        throw new Error("The payload is not valid to determine axis value");
    }
    let value = (payload[byteNumber]<<8)+payload[byteNumber+1];
    value = convertNegativeInt16(value)
    return value
}

function determineDeviceConfiguration(payload){
    let j=0;
    let parameters = {}
    if ((payload.length - 6) % 5 !=0 )
        throw new Error ("The payload is not valid to determine configuration parameters");
    let parametersId = []
    let parametersValue= []
    while (payload.length >= 11+5*j){ 
    	parametersId.push(payload[6+5*j]);
    	parametersValue.push(parseInt(convertBytesToString(payload.slice(7+5*j, 11+5*j)),16));
    	j++;
    }
    determineConfigurations(parameters, parametersId, parametersValue, true, payload)
   
    return parameters;
}

function jsonParametersByIdAndByDriverName() {
	let jsonParametersById = {}
	let jsonParametersByDriverName = {}
	let k=0;
	while ((k< jsonParameters.length))
	{ 

	 for (let parameter = 0; parameter <(jsonParameters[k].firmwareParameters.length); parameter++)
	 {
		 jsonParametersById[(jsonParameters[k].firmwareParameters[parameter].id)] = (jsonParameters[k].firmwareParameters[parameter])
		 jsonParametersByDriverName[(jsonParameters[k].firmwareParameters[parameter].driverParameterName)] = (jsonParameters[k].firmwareParameters[parameter])
	 }
	 k++;
	}
	return [jsonParametersById,jsonParametersByDriverName]
}

function hasNegativeNumber(additionalValues) {
	if (additionalValues == undefined) 
        return false;
	for (let el of additionalValues){
        if (typeof(el)=="number"){
            if (el < 0)
			    return true;
        }
        else if (typeof(el)=="object"){
            if (el.minimum < 0)
                return true;
        }
	}
	return false;
}

function determineConfigurations (parameters, parameterIds, parameterValues, readOnly, payload) {
	for (let id = 0; id < parameterIds.length; id++) 
	{
		let paramValue = parameterValues[id]
		let parameter = (jsonParametersById[parameterIds[id]])
		if (parameter === undefined)
			throw new Error(parameterIds[id]+ " unknown parameter id");
		let paramName = parameter.driverParameterName 
		if (parameter.id == 246){
			if (paramValue == 0)
			{
				parameters[paramName] = "Unknown"
			}
			else
			{
				let result = getNameAndParametersProfileFromJsonByProfileId(jsonProfiles, paramValue)	
				const parametersProfile = result[1]
				const name = result[0]
				
				if ((readOnly) && (paramValue!=0))
				{
						
					for(let parameter of Object.entries(parametersProfile)){
		        		parameters[parameter[0]]= parameter[1]; 
					}
				}
				parameters[paramName]= name
			}
	    } 
		else
			{
				if (((parameter.readOnly != undefined) && (parameter.readOnly) && readOnly) || (parameter.readOnly == undefined) || ((parameter.readOnly != undefined) && (!(parameter.readOnly)))) 
				{  
					
			   		let paramType = parameter.parameterType.type
			   		switch (paramType)
			   		{
			   		case "ParameterTypeNumber":
			   			let range = parameter.parameterType.range
			   			let multiply = parameter.parameterType.multiply
			   			let additionalValues = parameter.parameterType.additionalValues
                        let additionalRanges = parameter.parameterType.additionalRanges
			   			// check negative number
			   			if ((range.minimum < 0 ) || hasNegativeNumber(additionalValues) || hasNegativeNumber(additionalRanges)){
			   				if (paramValue > 0x7FFFFFFF) {
				                paramValue -= 0x100000000;
				            }
			   			}
			   			
			   			if (checkParamValueRange(paramValue, range.minimum, range.maximum, range.exclusiveMinimum, range.exclusiveMaximum, additionalValues, additionalRanges)){
			   				if (multiply != undefined){
			   					paramValue = paramValue * multiply
			   				}
			   				 
			   			}
			   			else {
			   				throw new Error(paramName+ " parameter value "+paramValue+" is out of range");
			   			}
			   			
			   			if (parameter.id == 19)
			   				{ 
			   				
			   				if  (parameters["confirmedUplink"] == undefined)
			   					{
			   					let confirmedUlRetry ={}
			   					confirmedUlRetry[paramName] = paramValue
			   					parameters["confirmedUplink"] = confirmedUlRetry
			   					}
			   				else 
			   					{
			   					let confirmedUplink = parameters["confirmedUplink"]
			   					
			   					confirmedUplink[paramName] =paramValue
			   					parameters["confirmedUplink"] = confirmedUplink
			   					}
			   				}
			   				
			   			else {
			   				parameters[paramName]= paramValue 
			   			}
			   			if (parameter.id == 253 || parameter.id == 254)
			   				{
			   				parameters[paramName] = ((paramValue>>16) & 0xFF).toString() + "."
		                    + ((paramValue>>8) & 0xFF).toString() + "."
		                    + (paramValue & 0xFF).toString(); 
			   				}
			   			break;
			   		case "ParameterTypeString":
			   			if ((parameter.parameterType.firmwareValues).indexOf(paramValue) != -1){
			   				parameters[paramName] = (parameter.parameterType.possibleValues[((parameter.parameterType.firmwareValues).indexOf(paramValue))])
                        }
			   			else {
			   				throw new Error(paramName+ " parameter value is unknown");
			   			}
			   			
			   			break;
			   		case "ParameterTypeBitMap":
			   			let properties = parameter.parameterType.properties
					    let bitMap = parameter.parameterType.bitMap
					    let length = parseInt(1,16)
					    let parameterValue ={}
					    for (let property  of properties) {
					    	let propertyName = property.name
					    	let propertyType = property.type
							let bit = bitMap.find(el => el.valueFor === propertyName)
							switch (propertyType)
							{
							case "PropertyBoolean":
								if ((bit.length)!= undefined ) {
                                    length = lengthToHex(bit.length)
                                }
								var b =  Boolean((paramValue >>bit.bitShift & length ))
								if ((bit.inverted != undefined) && (bit.inverted)){
									b =!b;
								 }
								parameterValue[property.name] = b
								break;
							case "PropertyString":
								if ((bit.length)!= undefined ) {
                                    length = lengthToHex(bit.length)
                                }
								let value = (paramValue >>bit.bitShift & length)
			   				 	let possibleValues = property.possibleValues
                                if (property.firmwareValues.indexOf(value) != -1){
                                    parameterValue[property.name] = possibleValues[(property.firmwareValues.indexOf(value))]
                                }
                                else {
                                    throw new Error(property.name+ " parameter value is not among possible values");
                                }
			   				 	break;
                            case "PropertyNumber":
                                if ((bit.length)!= undefined ) {
                                    length = lengthToHex(bit.length)
                                }
                                parameterValue[property.name] = paramValue >>bit.bitShift & length ;	
                                break;
							case "PropertyObject":
								let bitValue ={}
								for (let value of bit.values)
									{
									if (value.type == "BitMapValue")
										{	
                                            let length = parseInt(1,16)
											if ((value.length)!= undefined ) {length = (lengthToHex(value.length))}
										  	var b = Boolean(paramValue >>value.bitShift & length)
										  	if ((value.inverted != undefined) && (value.inverted)){
										  		b =!b;
										  	}
										  	bitValue[value.valueFor] = b
									    }
									}
								parameterValue[property.name] = bitValue
								break;
							default:
					            throw new Error("Property type is unknown");
								
							}
							}
				    	if (parameter.id == 18)
							{
							parameterValue[paramName] = paramValue
							if (parameters["confirmedUplink"] == undefined)
								{
								parameters["confirmedUplink"] = parameterValue
								}
							else 
								{
								parameters["confirmedUplink"] = Object.assign({}, parameterValue, parameters["confirmedUplink"]);
								}
							
							}
				    	else 
				    		{ parameters[paramName] = parameterValue}
			   			break;
			   		default:
			            throw new Error("Parameter type is unknown");
			   		}
		   		
				}
				else{
					  throw new Error("Parameter is read only, not allowed to be set");
				}
			}
   	}
}

function checkParamValueRange (givenValue, minimum, maximum, exclusiveMinimum, exclusiveMaximum, additionalValues, additionalRanges) {
	if (additionalValues != undefined)
	{
		if (additionalValues.includes(givenValue))
			return true;
	}
    if (additionalRanges != undefined && additionalRanges.length >0)
    {
        for (let additionalRange of additionalRanges)
        {
			if (givenValue>= additionalRange.minimum && givenValue <= additionalRange.maximum)
    			return true;
    	}
    }
	if (((exclusiveMinimum!=undefined && exclusiveMinimum == true && givenValue > minimum) ||
		givenValue>=minimum) &&
		((exclusiveMaximum!=undefined && exclusiveMaximum == true && givenValue < maximum) ||
		givenValue <=maximum))
	    return true;
    return false;
}

function lengthToHex(length){  
    let hex =0;
	for (let i  =0; i<length; i++)
	{
		hex = hex + Math.pow(2,i)
	}
	//return parseInt(hex,16)
    return hex
}

function getNameAndParametersProfileFromJsonByProfileId(jsonProfiles,profileId){
	let p = 0
	let parameters = []
	while (p< jsonProfiles.length)
		{
		  for (let profile = 0; profile <(jsonProfiles[p].profiles.length); profile++)
		 {
	         if ((jsonProfiles[p].profiles[profile].id)==profileId){
	            parameters = jsonProfiles[p].profiles[profile].parameters
	            const name = jsonProfiles[p].profiles[profile].name
	            return [name,parameters];
	         }
	      }
		p ++;
		}
	if ((parameters.length) == 0)
				throw new Error("Dynamic profile value is unknown");

}

function getProfileIdByName(jsonProfiles,name){
	let p = 0
	let profileId = null
    //Support of UPPERCASE
    if (name.toUpperCase()!=name){
        name = camelToSnake(name)
    }
    
	if (name == "UNKNOWN")
		return 0;
	while (p< jsonProfiles.length)
	{
		for (let profile = 0; profile <(jsonProfiles[p].profiles.length); profile++)
		{
	        if (camelToSnake(jsonProfiles[p].profiles[profile].name)== name){
	            profileId = jsonProfiles[p].profiles[profile].id
	            return profileId;
	        }
	      }
		p ++;
	}
	
	if (profileId == null)
				throw new Error("Dynamic profile value is unknown");

}

function determineDebugCommandTag(payload){
    if (payload.length<5){
        throw new Error("The payload is not valid to determine Debug Command Tag");
    }
    let debugcommandtag = payload[4] & 0x0F;
    switch (debugcommandtag){
        case 0:
            return DebugCommandTag.DEBUG_CRASH_INFORMATION;
        case 1:
            return DebugCommandTag.TX_POWER_INDEX_VALUE;
        case 2:
            return DebugCommandTag.UPLINK_LENGTH_ERR;
        case 3:
            return DebugCommandTag.GENERIC_ERROR;
        case 4:
        	return DebugCommandTag.SPECIFIC_FIRMWARE_PARAMETERS;
        default:
            throw new Error("The Debug Command Tag is unknown");
    }
}

function determineDebugErrorCode(payload){
    if (payload.length<6){
        throw new Error("The payload is not valid to determine Debug Error Code");
    }
    return payload[5];
}

function determineDebugCrashInfo(payload){
    if (payload.length<6){
        throw new Error("The payload is not valid to determine Debug Error Info");
    }
    let crashInfo = "";
    for (var i=6; i<payload.length; i++){
        crashInfo += String.fromCharCode(payload[i]);
    }
    return crashInfo;
}

function determineTxIndexPower(payload){
    if (payload.length<6){
        throw new Error("The payload is not valid to determine TxIndex Power");
    }
    return payload[5];
}

function determineUlLengthErrCounter(payload){
    if (payload.length<7){
        throw new Error("The payload is not valid to determine Ul Length Error counter");
    }
    return (payload[5]<<8)+payload[6];
}

function determineGenericErrorCode(payload){
    if (payload.length<6){
        throw new Error("The payload is not valid to determine generic error code");
    }
    switch (payload[5]){
    case 0:
        return ErrorCode.INVALID_GEOLOC_SENSOR;
    case 1:
        return ErrorCode.INVALID_GEOLOC_CONFIG;
    default:
        return payload[5];
    }
}

function hex32(val) {
    val &= 0xFFFFFFFF;
    var hex = val.toString(16).toUpperCase();
    return ("00000000" + hex).slice(-8);
}

function determineSpecificFirmwareParameters(payload){
    if (payload.length<17){
       throw new Error("The payload is not valid to determine specific firmware parameters");
    }
    let specificFwParam0 = hex32(((payload[5] << 24) + (payload[6] << 16) + (payload[7] << 8) + payload[8]));
    let specificFwParam1 = hex32(((payload[9] << 24) + (payload[10] << 16) + (payload[11] << 8) + payload[12]));
    let specificFwParam2 = hex32(((payload[13] << 24) + (payload[14] << 16) + (payload[15] << 8) + payload[16]));
    return [specificFwParam0, specificFwParam1, specificFwParam2];
}

function determineShutDownCause(payload){
    if (payload.length<6){
        throw new Error("The payload is not valid to determine ShutDown Cause");
    }
    switch (payload[5]){
        case 0:
            return ShutdownCause.USER_ACTION;
        case 1:
            return ShutdownCause.LOW_BATTERY;
        case 2:
            return ShutdownCause.DOWNLINK_REQUEST;
        case 3:
            return ShutdownCause.BLE_REQUEST;
        case 4:
            return ShutdownCause.BLE_CONNECTED;
        default:
            throw new Error("The ShutDown Cause is unknown");
    }
}

function determineCurrentAckTokenValue(payload){
    if (payload.length<2){
        throw new Error("The payload is not valid to determine Ack Token value");
    }
    return payload[1];
}

function determineEventType(payload){
    if (payload.length<6){
        throw new Error("The payload is not valid to determine event type");
    }
    switch (payload[5]){
        case 0:
            return EventType.GEOLOC_START;
        case 1:
            return EventType.MOTION_START;
        case 2:
            return EventType.MOTION_END;
        case 3:
            return EventType.BLE_CONNECTED;
        case 4:
            return EventType.BLE_DISCONNECTED;
        case 5:
            return EventType.TEMPERATURE_ALERT;
        case 6:
            return EventType.BLE_BOND_DELETED;
        case 7:
            return EventType.SOS_MODE_START;
        case 8:
            return EventType.SOS_MODE_END;
        case 9:
        	return EventType.ANGLE_DETECTION;
        case 10:
        	return EventType.GEOFENCING;
        default:
            throw new Error("The event type is unknown");
    }
}

function determineTrackerOrientation(payload){
    if (payload.length<12){
        throw new Error("The payload is not valid to determine Tracker Orientation");
    }
    let x = determineAxis(payload, 6);
    let y = determineAxis(payload, 8);
    let z = determineAxis(payload, 10);
    return [x,y,z];
}

function determineVectorDetection(payload , xbyteNumber, ybyteNumber, zbyteNumber){
    let x = determineAxis(payload, xbyteNumber);
    let y = determineAxis(payload, ybyteNumber);
    let z = determineAxis(payload, zbyteNumber);
    return [x,y,z];
}

function determineMeasuredTemperature(payload){
    if (payload.length<13){
        throw new Error("The payload is not valid to determine measured temperature");
    }
    let measuredTemp = new measuredTemperatureClass.MeasuredTemperature();
    switch (payload[6]){
        case 0:
            measuredTemp.state = measuredTemperatureClass.TemperatureState.NORMAL;
            break;
        case 1:
            measuredTemp.state = measuredTemperatureClass.TemperatureState.HIGH;
            break;
        case 2:
            measuredTemp.state = measuredTemperatureClass.TemperatureState.LOW;
            break;
        case 3:
            measuredTemp.state = measuredTemperatureClass.TemperatureState.FEATURE_NOT_ACTIVATED;
        default:
            throw new Error("The Temperature state is unknown");
    }
    measuredTemp.max = Math.round(decodeCondensed(payload[7],-44, 85, 8, 0)*10)/10;
    measuredTemp.min = Math.round(decodeCondensed(payload[8],-44, 85, 8, 0)*10)/10;
    measuredTemp.highCounter = (payload[9]<<8)+payload[10];
    measuredTemp.lowCounter = (payload[11]<<8)+payload[12];
    return measuredTemp;
}

function determineDataScanCollection(payload){
    if (payload.length<8){
        throw new Error("The payload is not valid to determine scan collection");
    }
    let dataScanCollection = new scanCollectionClass.ScanCollection();
    switch (payload[4] & 0x0F){
        case 0:
            dataScanCollection.scanType = scanCollectionClass.ScanType.BLE_BEACONS;
            break;
        case 1: 
            dataScanCollection.scanType = scanCollectionClass.ScanType.WIFI_BSSID;
            break;
        case 2:
        	dataScanCollection.scanType = scanCollectionClass.ScanType.BLE_BEACONS_COLLECTION;
        	break;
        default:
            throw new Error("ScanType is unknown");
    }
    let again = (payload[5]>>7) & 0x01;
    dataScanCollection.again = (again == 1);
    switch ((payload[5]>>6) & 0x01){
        case 0:
            dataScanCollection.dataFormat = scanCollectionClass.DataFormat.BEACON_ID;
            break;
        case 1:
            dataScanCollection.dataFormat = scanCollectionClass.DataFormat.MAC_ADDRESS;
            break;
        default:
            throw new Error("DataFormat is unknown");
    }
    dataScanCollection.fragmentIdentification = (payload[5] & 0x1F);
    dataScanCollection.collectionIdentifier = payload[6];
    dataScanCollection.hash = payload[7];
    switch(dataScanCollection.dataFormat){
        case scanCollectionClass.DataFormat.BEACON_ID:
            if ((payload.length - 8)%4 != 0){
                throw new Error("The payload is not valid to determine 4-byte scan result");
            }
            let i = 0;
            let bleBeacons = [];
            while (payload.length >= 12+4*i){
            	let key = null;
            	if (dataScanCollection.scanType == scanCollectionClass.ScanType.BLE_BEACONS_COLLECTION){
            		key = convertBytesToString(payload.slice(9+4*i,12+4*i));
            	}
            	else {
                    key = convertBytesToString(payload.slice(10+4*i,12+4*i));

            	}
                let value = payload[8+4*i];
                if (value > 127) {
                    value -= 256;
                }
                bleBeacons.push(new beaconIdInfoClass.BeaconIdInfo(key,value));
                i++;
            }
            dataScanCollection.beaconIdData = bleBeacons;
            break;
            
        case scanCollectionClass.DataFormat.MAC_ADDRESS:
            if ((payload.length - 8)%7 != 0){
                throw new Error("The payload is not valid to determine 7-byte scan result");
            }
            let j = 0;
            let bssids = [];
            while (payload.length >= 15+7*j){
                let key = convertByteToString(payload[9+7*j])+":"
                        + convertByteToString(payload[10+7*j])+":"
                        + convertByteToString(payload[11+7*j])+":"
                        + convertByteToString(payload[12+7*j])+":"
                        + convertByteToString(payload[13+7*j])+":"
                        + convertByteToString(payload[14+7*j]);
                let value = payload[8+7*j];
                if (value > 127) {
                    value -= 256;
                }
                bssids.push(new bssidInfoClass.BssidInfo(key,value));
                j++;
            }
            dataScanCollection.macAddressData = bssids;
            break;
    }
    return dataScanCollection;
}

function determineProximityDailyReport(payload){
    if (payload.length<42){
        throw new Error("The payload is not valid to determine proximity daily report");
    }
    let proximityDailyReport = new proximityDailyReportClass.ProximityDailyReport();
    proximityDailyReport.dailyAlertDay0 = parseInt(convertBytesToString(payload.slice(6,10)),16);
    proximityDailyReport.dailyWarningDay0 = parseInt(convertBytesToString(payload.slice(10,14)),16);
    proximityDailyReport.dailyExposureDay0 = parseInt(convertBytesToString(payload.slice(14,18)),16);
    proximityDailyReport.dailyAlertDay1 = parseInt(convertBytesToString(payload.slice(18,22)),16);
    proximityDailyReport.dailyWarningDay1 = parseInt(convertBytesToString(payload.slice(22,26)),16);
    proximityDailyReport.dailyExposureDay1 = parseInt(convertBytesToString(payload.slice(26,30)),16);
    proximityDailyReport.dailyAlertDay2 = parseInt(convertBytesToString(payload.slice(30,34)),16);
    proximityDailyReport.dailyWarningDay2 = parseInt(convertBytesToString(payload.slice(34,38)),16);
    proximityDailyReport.dailyExposureDay2 = parseInt(convertBytesToString(payload.slice(38,42)),16);
    return proximityDailyReport;
}

function determineProximityDailyResponse(payload){
    if (payload.length<19){
        throw new Error("The payload is not valid to determine proximity daily response");
    }
    let proximityDailyResponse = new proximityDailyResponseClass.ProximityDailyResponse();
    proximityDailyResponse.dayIdentifier = payload[6];
    proximityDailyResponse.dailyAlert = parseInt(convertBytesToString(payload.slice(7,11)),16);
    proximityDailyResponse.dailyWarning = parseInt(convertBytesToString(payload.slice(11,15)),16);
    proximityDailyResponse.dailyExposure = parseInt(convertBytesToString(payload.slice(15,19)),16);
    return proximityDailyResponse;
}

function determineProximityNotification(payload, notificationType){
    if (payload.length<38){
        throw new Error("The payload is not valid to determine proximity notification");
    }
    let ProximityNotification = proximityNotificationClass.ProximityNotification;
    let proximityNotification = new ProximityNotification();
    proximityNotification.notificationType = notificationType;
    proximityNotification.encrypted = (((payload[5]>>7) & 0x01) !=0);
    switch ((payload[5]>>5) & 0x03){
        case 0:
            proximityNotification.recordAction = proximityNotificationClass.RecordAction.RECORD_START;
            break;
        case 1:
            proximityNotification.recordAction = proximityNotificationClass.RecordAction.RECORD_UPDATE;
            break;
        case 2:
            proximityNotification.recordAction = proximityNotificationClass.RecordAction.RECORD_STOP;
            break;
        default:
            throw new Error("The proximity notification record action is unknown");
    }
    proximityNotification.rollingProximityIdentifier = convertBytesToString(payload.slice(6,22));
    proximityNotification.closestDistanceRecording = ((payload[22]<<8)+payload[23])/10;
    proximityNotification.distanceAverageRecorded = ((payload[24]<<8)+payload[25])/10;
    proximityNotification.cumulatedExposure = ((payload[26]<<8)+payload[27]);
    proximityNotification.metadata = convertBytesToString(payload.slice(28,32));
    proximityNotification.cumulatedContactDuration = ((payload[5]>>3) & 0x03) * PROXIMITY_CCD_ROLLOVER_VALUE + (payload[32]<<8) + payload[33];
    proximityNotification.currentDailyExposure = parseInt(convertBytesToString(payload.slice(34,38)),16);
    return proximityNotification;
}

function determineProximityWhiteListing(payload, solicited){
    if (payload.length<23){
        throw new Error("The payload is not valid to determine proximity white listing");
    }
    let proximityWhiteListing = new proximityWhiteListingClass.ProximityWhiteListing();
    proximityWhiteListing.solicited = solicited;
    proximityWhiteListing.encrypted = (((payload[5]>>7) & 0x01) !=0);
    proximityWhiteListing.rollingProximityIdentifier = convertBytesToString(payload.slice(6,22));
    switch (payload[22] & 0x07){
        case 0:
            proximityWhiteListing.list = proximityWhiteListingClass.List.PEER_LIST;
            break;
        case 1:
            proximityWhiteListing.list = proximityWhiteListingClass.List.WARNING_LIST;
            break;
        case 2:
            proximityWhiteListing.list = proximityWhiteListingClass.List.ALERT_LIST;
            break;
        default:
            throw new Error("The payload is not valid to determine proximity white listing list");
    }
    switch ((payload[22]>>3) & 0x01){
        case 0:
            proximityWhiteListing.recordStatus = proximityWhiteListingClass.RecordStatus.NOT_WHITE_LISTED;
            break;
        case 1:
            proximityWhiteListing.recordStatus = proximityWhiteListingClass.RecordStatus.WHITE_LISTED;
            break;
    }
    return proximityWhiteListing;
}

function determineDownlinkMessageType(payload){
    if (payload.length<2){
        throw new Error("The payload is not valid to determine downlink message type");
    }
    switch (payload[0]){
        case 1:
            return DownMessageType.POS_ON_DEMAND;
        case 2:
            return DownMessageType.SET_MODE;
        case 3:
            return DownMessageType.REQUEST_CONFIG;
        case 4: 
            return DownMessageType.START_SOS;
        case 5:
            return DownMessageType.STOP_SOS;
        case 6:
            return DownMessageType.REQUEST_TEMPERATURE_STATUS;
        case 7:
            return DownMessageType.PROXIMITY;
        case 8:
        	return DownMessageType.ANGLE_DETECTION;
        case 9:
            return DownMessageType.REQUEST_STATUS;
        case 11:
            return DownMessageType.SET_PARAM;
        case 12:
            return DownMessageType.CLEAR_MOTION_PERCENTAGE;
        case 13:
            return DownMessageType.SMS;
        case 255:
            return DownMessageType.DEBUG_COMMAND;
        default:
            throw new Error("The downlink message type is Unknown");
    }
}

function determineOpMode(payload){
    if (payload.length<3){
        throw new Error("The payload is not valid to determine operational mode");
    }
    switch (payload[2]){
        case 0:
            return Mode.STAND_BY;
        case 1:
            return Mode.MOTION_TRACKING;
        case 2:
            return Mode.PERMANENT_TRACKING;
        case 3:
            return Mode.MOTION_START_END_TRACKING;
        case 4:
            return Mode.ACTIVITY_TRACKING;
        case 5:
            return Mode.OFF;
        default:
            throw new Error("The mode is unknown");
    }
}

function determineParamIds(payload){
	
    let paramIds = [];
    for (var i = 2; i < payload.length; i++){
        paramIds.push(payload[i]);
    }
    return paramIds;
}

function determineAngleDetectionMessage(payload){
    if (payload.length<2){
        throw new Error("The payload is not valid to determine the control of the angle detection");
    } 
    switch (payload[2]){
            case 0:
                return AngleDetectionControl.STOP_ANGLE_DETECTION;
            case 1:
                return AngleDetectionControl.START_ANGLE_DETECTION;  
            default:
                throw new Error("The control angle detection is unknown");
        }
 }

function determineStatusRequestType(payload){
    switch (payload[2]){
        case 0:
            return MessageType.ENERGY_STATUS;
        case 1:
            return MessageType.HEALTH_STATUS;  
        default:
            throw new Error("The status type is unknown");
    }
}

function determineProximityMessage(payload){
    if (payload.length<3){
        throw new Error("The payload is not valid to determine proximity message");
    }
    let proximityMessage = new proximityMessageClass.ProximityMessage();
    switch (payload[2]){
        case 0:
            proximityMessage.type = proximityMessageClass.Type.GET_RECORD_STATUS
            break;
        case 1:
            proximityMessage.type = proximityMessageClass.Type.SET_WHITE_LIST_STATUS;
            break;
        case 2:
            proximityMessage.type = proximityMessageClass.Type.GET_DAILY_INFORMATION;
            break;
        case 3:
            proximityMessage.type = proximityMessageClass.Type.CLEAR_DAILY_INFORMATION;
            break;
        default:
            throw new Error("The proximity message type is Unknown");
    }
    if (proximityMessage.type == proximityMessageClass.Type.GET_RECORD_STATUS || proximityMessage.type == proximityMessageClass.Type.SET_WHITE_LIST_STATUS){
        if (payload.length<19){
            throw new Error("The payload is not valid to determine rolling proximity identifier");
        }
        proximityMessage.rollingProximityIdentifier = convertBytesToString(payload.slice(3,19));
    }
    if (proximityMessage.type == proximityMessageClass.Type.SET_WHITE_LIST_STATUS){
        if (payload.length<20){
            throw new Error("The payload is not valid to determine record status");
        }
        switch (payload[19]){
            case 0:
                proximityMessage.recordStatus = proximityMessageClass.SetRecordStatus.RESET_WHITE_LISTING;
                break;
            case 1:
                proximityMessage.recordStatus = proximityMessageClass.SetRecordStatus.SET_WHITE_LISTING;
                break;
            default:
                throw new Error("The record status is unknown");
        }
    }
    if (proximityMessage.type == proximityMessageClass.Type.GET_DAILY_INFORMATION || proximityMessage.type == proximityMessageClass.Type.CLEAR_DAILY_INFORMATION){
        if (payload.length<4){
            throw new Error("The payload is not valid to determine day identifier");
        }
        proximityMessage.dayIdentifier = payload[3];
    }

    return proximityMessage;
}

function determineSetParameters(payload){
    if (payload.length<7 || payload.length>27){
        throw new Error("The payload is not valid to determine Parameter IDs");
    }
    let parameterIds = []
    let parameterValues= []
    let paramsToSet = {}
    let paramNum = (payload.length -2)/5;
    for (var i = 0; i < paramNum; i++){
    	parameterIds.push(payload[2+5*i]);
    	parameterValues.push(parseInt(convertBytesToString(payload.slice(3+5*i, 7+5*i)),16));
    }

    determineConfigurations(paramsToSet, parameterIds, parameterValues, false, payload);
    return paramsToSet;

}

function determinOptionalCommand(payload){
    switch (payload[2]){
        case 1:
            return OptionalCommand.RESET_COUNTERS;
        case 2:
            return OptionalCommand.RESET_TEMPERATURES;
        case 3:
            return OptionalCommand.RESET_COUNTER;
        default:
            throw new Error("The optional command is unknown");
    }
}

function determineDebugCommand(payload){
    if (payload.length<3){
        throw new Error("The payload is not valid to determine Debug command");
    }
    switch (payload[2]){
        case 1:
            return DebugCommandType.RESET;
        case 2:
            return DebugCommandType.RESET_BLE_PAIRING;
        case 3:
            return DebugCommandType.MAKE_TRACKER_RING;
        case 4:
            return DebugCommandType.READ_CURRENT_ERROR_AND_SEND_IT;
        case 5:
            return DebugCommandType.TRIGGER_HEARTBEAT_MESSAGE;
        case 6:
            return DebugCommandType.READ_TX_POWER_INDEX;
        case 7:
            return DebugCommandType.WRITE_TX_POWER_INDEX;
        case 8:
            return DebugCommandType.TRIGGER_BLE_BOOTLOADER;
        case 9:
        	return DebugCommandType.SPECIFIC_FIRMWARE_PARAMETERS_REQUEST;
        case 10:
        	return DebugCommandType.CONFIGURE_STARTUP_MODES;
        case 11:
        	return DebugCommandType.START_AND_STOP_BLE_ADVERTISEMENT;
        case 241:
            return DebugCommandType.TRIGGER_AN_ERROR;
        default:
            throw new Error("The debug command is unknown");
    }
}

function determineResetAction(payload){
    if (payload.length == 4){
        switch (payload[3]){
            case 0:
                return ResetAction.RESET_DEVICE;
            case 1:
                return ResetAction.DELETE_CONFIG_RESET;
            case 2:
                return ResetAction.DELETE_CONFIG_BLE_BOND_RESET;
            default:
                throw new Error("The ResetAction is unknown");
        }
    }
}

function determineBuzzerMelodyId(payload){
    if (payload.length > 3){
        switch (payload[3]){
            case 0:
                return MelodyId.SWITCH_ON;
            case 1:
                return MelodyId.SWITCH_OFF;
            case 2:
                return MelodyId.FLAT_BATTERY;
            case 3:
                return MelodyId.ALERT;
            case 4:
                return MelodyId.SOS_MODE;
            case 5:
                return MelodyId.SOS_MODE_CLEAR;
            case 6:
                return MelodyId.RESET;
            case 7:
                return MelodyId.BLE_ADVERTISING;
            case 8:
                return MelodyId.BLE_BONDED;
            case 9:
                return MelodyId.BLE_DEBONDED;
            case 10:
                return MelodyId.BLE_LINK_LOSS;
            case 11:
                return MelodyId.PROX_WARNING;
            case 12:
                return MelodyId.PROX_WARNING_REMINDER;
            case 13:
                return MelodyId.PROX_ALARM;
            case 14:
                return MelodyId.PROX_ALARM_REMINDER;
            default:
                throw new Error("The melody ID is unknown");
        }
    } 
}

function determineWriteTxIndex(payload){
    if (payload.length<4){
        throw new Error("The payload is not valid to determine Tx Index Power");
    }
    return payload[3];
}

function determineBuzzerDuration(payload){
    if (payload.length>4){
        return payload[4];
    }
}

function determineBleAdvertisementDuration(payload){
	  if (payload.length<4){
	        throw new Error("The payload is not valid to determine duration of BLE advertisement");
	  }
	  
	  return ((payload[3]<<8) + payload[4]);
}

function determineStartupModes(payload){
      let statupModes = new startupModesClass.StartupModes(((payload[3] & 0x01) == 1),
                                                              (((payload[3] >> 1) & 0x01) == 1));
      return statupModes;
}

function determineUplinkSms(payload){
	  if (payload.length<5){
	        throw new Error("The payload is not valid to determine SMS message");
	  }
	  var message = '';
    
	  for (var i = 5; i < payload.length; i ++)
      	message += String.fromCharCode(payload[i]);
    
      let sms = new smsClass.Sms((payload[2] << 16) + (payload[3] << 8) + payload[4], undefined, message);
      return sms;
}

function determineDownlinkSms(payload){
	  if (payload.length<5){
	        throw new Error("The payload is not valid to determine SMS message");
	  }
	  var message = '';
    
	  for (var i = 5; i < payload.length; i ++)
      	message += String.fromCharCode(payload[i]);
    
      let sms = new smsClass.Sms(undefined, (payload[2] << 16) + (payload[3] << 8) + payload[4], message);
      return sms;
}

function encodeGetPosition(payload){
    let encData = [];
    encData[0] = 0x01;
    encData[1] = payload.ackToken & 0x0F;
    return encData;
}

function encodeChangeTrackerMode(payload){
    let encData = [];
    encData[0] = 0x02;
    encData[1] = payload.ackToken & 0x0F;
    if (payload.modeValue == null){
        throw new Error("No mode value");
    }
    switch (payload.modeValue){
        case Mode.STAND_BY:
            encData[2] = 0x00;
            break;
        case Mode.MOTION_TRACKING:
            encData[2] = 0x01;
            break;
        case Mode.PERMANENT_TRACKING:
            encData[2] = 0x02;
            break;
        case Mode.MOTION_START_END_TRACKING:
            encData[2] = 0x03;
            break;
        case Mode.ACTIVITY_TRACKING:
            encData[2] = 0x04;
            break;
        case Mode.OFF:
            encData[2] = 0x05;
            break;
        default:
            break;
    } 
    return encData;
}

function encodeGetDeviceConfig(payload){
    let encData = [];
    encData[0] = 0x03;
    encData[1] = payload.ackToken & 0x0F;
    let size = 0;
    if (payload.listParameterID != null){
        size = payload.listParameterID.length;
    }
    for (var i =0; i< size; i++){
        encData[2+i] = payload.listParameterID[i];
    }
    return encData;
}

function encodeStartSOSMode(payload){
    let encData = [];
    encData[0] = 0x04;
    encData[1] = payload.ackToken & 0x0F;
    return encData;
}

function encodeStopSOSMode(payload){
    let encData = [];
    encData[0] = 0x05;
    encData[1] = payload.ackToken & 0x0F;
    return encData;
}

function encodeGetTemperatureStatus(payload){
    let encData = [];
    encData[0] = 0x06;
    encData[1] = payload.ackToken & 0x0F;
    if (payload.optionalCommand != null){
        switch (payload.optionalCommand){
            case OptionalCommand.RESET_COUNTERS:
                encData[2] = 0x01;
                break;
            case OptionalCommand.RESET_TEMPERATURES:
                encData[2] = 0x02;
                break;
            case OptionalCommand.RESET_COUNTER:
                encData[2] = 0x03;
                break;
            default:
                throw new Error("The optional command is unknown");
        }
        
    }
    return encData;
}

function encodeProximityMessage(payload){
    let encData = [];
    encData[0] = 0x07;
    encData[1] = payload.ackToken & 0x0F;
    if (payload.proximityMessage == null){
        throw new Error("No Proximity Message");
    }
    switch (payload.proximityMessage.type){
        case proximityMessageClass.Type.GET_RECORD_STATUS:
            encData[2] = 0;
            if (payload.proximityMessage.rollingProximityIdentifier == null)
                throw new Error("Missing rolling proximity identifier");
            encData = encData.concat(convertToByteArray(payload.proximityMessage.rollingProximityIdentifier));
            break;
        case proximityMessageClass.Type.SET_WHITE_LIST_STATUS:
            encData[2] = 1;
            if (payload.proximityMessage.rollingProximityIdentifier == null)
                throw new Error("Missing rolling proximity identifier");
            encData = encData.concat(convertToByteArray(payload.proximityMessage.rollingProximityIdentifier));
            if (payload.proximityMessage.recordStatus== null)
                throw new Error("Missing record status");
        	switch (payload.proximityMessage.recordStatus){
                case proximityMessageClass.SetRecordStatus.RESET_WHITE_LISTING:
                    encData[19]=0x0;
                    break;
                case proximityMessageClass.SetRecordStatus.SET_WHITE_LISTING:
                    encData[19]=0x1;
                    break;
        	}
            break;
        case proximityMessageClass.Type.GET_DAILY_INFORMATION:
            encData[2] = 2;
            if (payload.proximityMessage.dayIdentifier == null)
                throw new Error("Missing day identifier");
            encData[3] = payload.proximityMessage.dayIdentifier & 0xFF;
            break;
        case proximityMessageClass.Type.CLEAR_DAILY_INFORMATION:
            if (payload.proximityMessage.dayIdentifier == null)
                throw new Error("Missing day identifier");
            encData[3] = payload.proximityMessage.dayIdentifier & 0xFF;
            encData[2] = 3;
            break;
        default:
            encData[2] = 3;
            break;
    }
    return encData;
}

function encodeAngleDetectionMessage(payload){
    let encData = [];
    encData[0] = 0x08;
    encData[1] = payload.ackToken & 0x0F;
    if (payload.angleDetectionControl == null){
        throw new Error("No angle detection control");
    }
    
    switch (payload.angleDetectionControl){
        case AngleDetectionControl.STOP_ANGLE_DETECTION:
            encData[2] = 0x00;
            break;
        case AngleDetectionControl.START_ANGLE_DETECTION:
            encData[2] = 0x01;
            break;
        default:
        	throw new Error("The angle detection control is unknown");
      
    } 
    return encData;
}

function encodeStatusRequestMessage(payload){
    let encData = [];
    encData[0] = 0x09;
    encData[1] = payload.ackToken & 0x0F;
    if (payload.statusType != null){
        switch (payload.statusType){
            case MessageType.ENERGY_STATUS:
                encData[2] = 0x00;
                break;
            case MessageType.HEALTH_STATUS:
                encData[2] = 0x01;
                break;
            default:
                throw new Error("The Status Message Type is unknown");
        }
    }
    return encData;
}

function encodeSetParameter(payload){
    let setParameters = payload.setParameters 
    if (Object.keys(setParameters).length > 5){
    	   throw new Error("Too many parameters for one downlink message");
    }
    let encData = [];
    encData[0] = 0x0b;
    encData[1] = payload.ackToken & 0x0F;
    let i = 0;
    
    for (let setParameter of Object.entries( setParameters )) {
    	let parameter =(jsonParametersByDriverName[setParameter[0]])
    	if (parameter == undefined && setParameter[0] != "confirmedUplink" )
    		throw new Error(setParameter[0]+ " unknown parameter name");
    	if (setParameter[0] == "confirmedUplink")
        {
            let confirmedUplinkObject = setParameter[1]
            
            if ("confirmedUlBitmap" in confirmedUplinkObject){
                let confirmedUlBitmapValue = confirmedUplinkObject["confirmedUlBitmap"]
                encData[2+i*5] = ((jsonParametersByDriverName["confirmedUlBitmap"]).id)
                encData[3+i*5] = (confirmedUlBitmapValue >> 24) & 0xFF;
                encData[4+i*5] = (confirmedUlBitmapValue  >> 16) & 0xFF;
                encData[5+i*5] = (confirmedUlBitmapValue  >> 8) & 0xFF;
                encData[6+i*5] = confirmedUlBitmapValue  & 0xFF;
                i++;
            }
            else{
                let bitMap = jsonParametersByDriverName["confirmedUlBitmap"].parameterType.bitMap
                let flags = 0
                
                for (let bit of bitMap){
                    let flag = bit.valueFor
                    let flagValue = confirmedUplinkObject[flag]
                    if (flagValue == undefined){
                        throw new Error("Bit "+ flag +" is missing");
                    }
                    flags |= Number(flagValue) << bit.bitShift
                }
                encData[2+i*5] = ((jsonParametersByDriverName["confirmedUlBitmap"]).id)
                encData[3+i*5] = (flags >> 24) & 0xFF;
                encData[4+i*5] = (flags  >> 16) & 0xFF;
                encData[5+i*5] = (flags  >> 8) & 0xFF;
                encData[6+i*5] = flags  & 0xFF;
                i++;        
            }
            if ("confirmedUlRetry" in confirmedUplinkObject){
                let confirmedUlRetryValue = confirmedUplinkObject["confirmedUlRetry"]
                encData[2+i*5] = ((jsonParametersByDriverName["confirmedUlRetry"]).id)
                encData[3+i*5] = (confirmedUlRetryValue >> 24) & 0xFF;
                encData[4+i*5] = (confirmedUlRetryValue  >> 16) & 0xFF;
                encData[5+i*5] = (confirmedUlRetryValue  >> 8) & 0xFF;
                encData[6+i*5] = confirmedUlRetryValue  & 0xFF;
                i++;
            }
        
        }
    	else if (setParameter[0] == "dynamicProfile")
    	{     	
    		encData[2+i*5] = parameter.id & 0xFF
    		encData[3+i*5] = 0;
   	        encData[4+i*5] = 0;
   	        encData[5+i*5] = 0;
   	        encData[6+i*5]  = getProfileIdByName(jsonProfiles,setParameter[1]);
			i++;
    	}
    	else 
    	{
			let paramValue = setParameter[1]
			let id = parameter.id
	   		let paramType = parameter.parameterType.type
	   		encData[2+i*5] = id & 0xFF
	   		switch (paramType)
	   		{ case "ParameterTypeNumber":
	   			let range = parameter.parameterType.range
	   			let multiply = parameter.parameterType.multiply
	   			let additionalValues = parameter.parameterType.additionalValues
	   			let additionalRanges = parameter.parameterType.additionalRanges
	   			// negative number
	   		
	   			if (checkParamValueRange(paramValue, range.minimum, range.maximum, range.exclusiveMinimum, range.exclusiveMaximum, additionalValues, additionalRanges)){
	   				if (multiply != undefined){
	   					paramValue = paramValue/multiply
	   				}
	   				if (paramValue < 0) {
	   	                paramValue += 0x100000000;
		            }
	   				encData[3+i*5] = (paramValue >> 24) & 0xFF;
	   	            encData[4+i*5] = (paramValue >> 16) & 0xFF;
	   	            encData[5+i*5] = (paramValue >> 8) & 0xFF;
	   	            encData[6+i*5] = paramValue & 0xFF;
	   	            i++;
	   			}
	   			else{
	   	
		   				throw new Error(setParameter[0]+" parameter value is out of range");
	   			}
	   			break;
	   		case "ParameterTypeString":
	   			if (((parameter.parameterType.possibleValues).indexOf(paramValue)) != -1)
	   				{
		   				encData[3+i*5] = 0;
			   	        encData[4+i*5] = 0;
			   	        encData[5+i*5] = 0;
			   	        encData[6+i*5]  = (parameter.parameterType.firmwareValues[((parameter.parameterType.possibleValues).indexOf(paramValue))])
						i++;
	   				}
	   			else{
	   			   	
	   				throw new Error(setParameter[0]+" parameter value is unknown");
	   			}
		   	        
	   	        break;
	   		case "ParameterTypeBitMap":
	   			let flags =0 
	   			let properties = parameter.parameterType.properties
	   			let bitMap = parameter.parameterType.bitMap
                for (let bit of bitMap){
                    let flagName = bit.valueFor
                    let flagValue = setParameter[1][flagName]
                    if (flagValue == undefined){
                        throw new Error("Bit "+ flagName +" is missing");
                    }
                    let  property = (properties.find(el => el.name === flagName))
                    let propertyType = property.type
					switch (propertyType)
					{
                        case "PropertyBoolean":
                            if ((bit.inverted != undefined) && (bit.inverted)){
                                flagValue =! flagValue;
                            } 
                            flags |= Number(flagValue) << bit.bitShift
                            break;
                        case "PropertyString":
                            if (property.possibleValues.indexOf(flagValue) != -1){
                                flags |= (property.firmwareValues[property.possibleValues.indexOf(flagValue)]) << bit.bitShift
                            }
                            else {
                                throw new Error(property.name+ " parameter value is not among possible values");
                            }
                            
                            break;
                        case "PropertyNumber":
                            if (checkParamValueRange(flagValue, property.range.minimum, property.range.maximum, property.range.exclusiveMinimum, property.range.exclusiveMaximum, property.additionalValues, property.additionalRanges)){
                                flags |= flagValue << bit.bitShift
                            }
                            else 
                                throw new Error("Value out of range for "+ setParameter[0]+"."+flagName);
                            break;
                        case "PropertyObject":
                            let bitValues = Object.entries(flagValue)
                            for (let b of bit.values){
                                let fValue = flagValue[b.valueFor]
                                if (fValue == undefined){
                                    throw new Error("Bit "+ flagName +"."+ b.valueFor+" is missing");
                                }
                                if ((b.inverted != undefined) && (b.inverted)){
                                    fValue =! fValue;
                                }
                                flags |= Number(fValue) <<  b.bitShift 

                            }
                            break;
                        default:
                            throw new Error("Property type is unknown");
					}
                }
	   			
	   			encData[3+i*5] = (flags >> 24) & 0xFF;
	   	        encData[4+i*5] = (flags >> 16) & 0xFF;
	   	        encData[5+i*5] = (flags >> 8) & 0xFF;
	   	        encData[6+i*5] = flags & 0xFF;
	   	        i++;
		
	   			break;
	   		default:
	   			throw new Error("Parameter type is unknown");
	   			
	   		}
   		
   		}
    }
    return encData;
}

function encodeClearMotionPercentage(payload) {
    let encData = [];
    encData[0] = 0x0C;
    encData[1] = payload.ackToken & 0x0F;
	return encData;
}

function encodeSms(payload) {
    let encData = [];
    encData[0] = 0x0D;
    encData[1] = payload.ackToken & 0x0F;
    if (payload.sms == null){
        throw new Error("No SMS");
    }
    if (payload.sms.destinationId != undefined || 
    	payload.sms.senderId == undefined || 
    	payload.sms.message == undefined){
        throw new Error("Downlink SMS should include only senderId and message");
    }
	encData[2] = payload.sms.senderId >> 16;
	encData[3] = (payload.sms.senderId >> 8) & 0xFF;
	encData[4] = payload.sms.senderId & 0xFF;
	for (let i = 0; i < payload.sms.message.length; i++)
		encData[i + 5] = payload.sms.message.charCodeAt(i) & 0xFF;
	return encData;
}

function encodeDebugCommand(payload){
    let encData = [];
    encData[0] = 0xFF;
    encData[1] = payload.ackToken & 0x0F;
    if (payload.debugCommandType == null){
        throw new Error("No debug command type");
    }
    else{
        switch (payload.debugCommandType){
            case DebugCommandType.RESET:
                encData[2] = 0x01;
                if (payload.resetAction != null){
                    switch (payload.resetAction){
                        case ResetAction.RESET_DEVICE:
                            encData[3] = 0x00;
                            break;
                        case ResetAction.DELETE_CONFIG_RESET:
                            encData[3] = 0x01;
                            break;
                        case ResetAction.DELETE_CONFIG_BLE_BOND_RESET:
                            encData[3] = 0x02;
                            break;
                        default:
                            throw new Error("Invalid Reset Action Value");
                    }
                }
                return encData;
            case DebugCommandType.MAKE_TRACKER_RING:
                encData[2] = 0x03;
                if (payload.melodyId != null){
                    switch (payload.melodyId){
                        case MelodyId.SWITCH_ON:
                            encData[3] = 0x00;
                            break;
                        case MelodyId.SWITCH_OFF:
                            encData[3] = 0x01;
                            break;
                        case MelodyId.FLAT_BATTERY:
                            encData[3] = 0x02;
                            break;
                        case MelodyId.ALERT:
                            encData[3] = 0x03;
                            break;
                        case MelodyId.SOS_MODE:
                            encData[3] = 0x04;
                            break;
                        case MelodyId.SOS_MODE_CLEAR:
                            encData[3] = 0x05;
                            break;
                        case MelodyId.RESET:
                            encData[3] = 0x06;
                            break;
                        case MelodyId.BLE_ADVERTISING:
                            encData[3] = 0x07;
                            break;
                        case MelodyId.BLE_BONDED:
                            encData[3] = 0x08;
                            break;
                        case MelodyId.BLE_DEBONDED:
                            encData[3] = 0x09;
                            break;
                        case MelodyId.BLE_LINK_LOSS:
                            encData[3] = 0x0a;
                            break;
                        case MelodyId.PROX_WARNING:
                            encData[3] = 0x0b;
                            break;
                        case MelodyId.PROX_WARNING_REMINDER:
                            encData[3] = 0x0c;
                            break;
                        case MelodyId.PROX_ALARM:
                            encData[3] = 0x0d;
                            break;
                        case MelodyId.PROX_ALARM_REMINDER:
                            encData[3] = 0x0e;
                            break;
                        default:
                            throw new Error("Invalid Melody Id Value");
                    }
                    if (payload.buzzerDuration != null){
                        encData[4] = payload.buzzerDuration;
                    }
                }
                return encData;
            case DebugCommandType.READ_CURRENT_ERROR_AND_SEND_IT:
                encData[2] = 0x04;
                return encData;
            case DebugCommandType.TRIGGER_AN_ERROR:
                encData[2] = 0xf1;
                return encData;
            case DebugCommandType.RESET_BLE_PAIRING:
                encData[2] = 0x02;
                return encData;
            case DebugCommandType.TRIGGER_HEARTBEAT_MESSAGE:
                encData[2] = 0x05;
                return encData;
            case DebugCommandType.READ_TX_POWER_INDEX:
                encData[2] = 0x06;
                return encData;
            case DebugCommandType.WRITE_TX_POWER_INDEX:
                encData[2] = 0x07;
                encData[3] = payload.txPowerIndex;
                return encData;
            case DebugCommandType.TRIGGER_BLE_BOOTLOADER:
            	encData[2] = 0x08;
            	return encData;
            case DebugCommandType.SPECIFIC_FIRMWARE_PARAMETERS_REQUEST:
                encData[2] = 0x09;
                return encData;
            case DebugCommandType.CONFIGURE_STARTUP_MODES:
                encData[2] = 0x0a;
                encData[3] = 0;
                let startupModes = Object.assign(new startupModesClass.StartupModes(), payload.startupModes);
                if (startupModes.manufacturing){
                    encData[3] += 0X01;
                }
                if (startupModes.shipping){
                    encData[3] += 0X02;
                }
                return encData;
            case DebugCommandType.START_AND_STOP_BLE_ADVERTISEMENT:
                encData[2] = 0x0b;
                encData[3] = ((payload.bleAdvertisementDuration)>>8)&0xFF;
                encData[4] = payload.bleAdvertisementDuration & 0xFF;
                return encData;
        }
    }
}

function convertBytesToString(bytes){
    var payload = "";
    var hex;
    for(var i = 0; i < bytes.length; i++){
        hex = convertByteToString(bytes[i]);
        payload += hex;
    }
    return payload;
}

function convertByteToString(byte){
    let hex = byte.toString(16);
    if (hex.length < 2){
        hex = "0" + hex;
    }
    return hex;
}

function decodeCondensed(value, lo, hi, nbits, nresv) {
    return ((value - nresv / 2) / ( (((1 << nbits) - 1) - nresv) / (hi - lo)) + lo);
}

function convertNegativeInt16(value) {	if (value > 0x7FFF) {
    value -= 0x10000;
	}
	return value;
}

function determineAngleDetection(payload) {
	 if (payload.length<13){
        throw new Error("The payload is not valid to determine angle detection");
    }
    let angleDetection = new angleDetectionClass.AngleDetection(); 
    let flags = new angleDetectionFlagsClass.AngleDetectionFlags(); 
    switch (payload[6]>>5){	
    	case 0:
    		flags.transition = angleDetectionFlagsClass.Transition.LEARNING_TO_NORMAL;
    		break;
    	case 1:
    		flags.transition = angleDetectionFlagsClass.Transition.NORMAL_TO_LEARNING;
    		break;
     	case 2:
    		flags.transition = angleDetectionFlagsClass.Transition.NORMAL_TO_CRITICAL;
    		break;
     	case 3:
    		flags.transition = angleDetectionFlagsClass.Transition.CRITICAL_TO_NORMAL;
    		break;
     	case 4:
    		flags.transition = angleDetectionFlagsClass.Transition.CRITICAL_TO_LEARNING;
    		break;
     	 default:
             throw new Error("The transition flag of angle detection is unknown");
    }
    switch ((payload[6]>>3) & 0X3){	
		case 0:
			flags.triggerType = angleDetectionFlagsClass.TriggerType.CRITICAL_ANGLE_REPORTING;
			break;
		case 1:
			flags.triggerType = angleDetectionFlagsClass.TriggerType.ANGLE_DEVIATION_REPORTING;
			break;
	 	case 2:
	 		flags.triggerType = angleDetectionFlagsClass.TriggerType.SHOCK_TRIGGER;
			break;
	 	case 3:
	 		flags.triggerType = angleDetectionFlagsClass.TriggerType.RFU;
			break;	 	
	 	 default:
	         throw new Error("The trigger type flag of angle detection is unknown");
    }
    flags.notificationIdentifier = (payload[6] & 0x7);
    angleDetection.flags = flags;
    angleDetection.age = (payload[7]<<8) + payload[8];
    angleDetection.referenceVector=determineVectorDetection(payload,9,11,13);
    angleDetection.criticalVector=determineVectorDetection(payload,15,17,19);
    angleDetection.angle = convertNegativeInt16(payload[21]);
    return angleDetection
}

function determineGeofencingNotification(payload) {
	let geofencingNotification = new geofencingNotificationClass.GeofencingNotification();
	geofencingNotification.geofencingFormat = (payload[6] >>4) & 0x0F;
	switch (payload[6] & 0x0F){ 
	    case 0:
	    	geofencingNotification.geofencingType = geofencingNotificationClass.GeofencingType.SAFE_AREA;
	        break;
	    case 1:
	    	geofencingNotification.geofencingType = geofencingNotificationClass.GeofencingType.ENTRY;
	        break;
	    case 2:
	    	geofencingNotification.geofencingType = geofencingNotificationClass.GeofencingType.EXIT;
	        break;
	    case 3:
	        geofencingNotification.geofencingType = geofencingNotificationClass.GeofencingType.HAZARD;
	        break;
	    default:
	        throw new Error("The geofencing type is unknown"); 
	     }
	if (geofencingNotification.geofencingFormat == 0)
		{
		    let number = (payload[7] << 16) + (payload[8] << 8) + payload[9];
            geofencingNotification.id = "0x"+number.toString(16).padStart(6, '0');
		}
	return geofencingNotification
}

function determineMotionDutyCycle(payload){
    if (payload.length == 13){
        return payload[12];
    }
}

function determineGaddIndex(payload){
    if (payload.length == 17){
        return  (payload[13] << 24) + (payload[14] << 16) + (payload[15] << 8) + payload[16];
    }
}

const ASSET_TRACKER_2_0_PORT_NUMBER = 18;
const PROXIMITY_CCD_ROLLOVER_VALUE = 65535;
const DOWNLINK_PORT_NUMBER = 2;

function decodeUplink(input) {
    let result = {
        data: {},
        errors: [],
        warnings: []
    }
    try{
        var decodedData = new abeewayUplinkPayloadClass.AbeewayUplinkPayload();
        var payload = input.bytes;

        decodedData.messageType = determineMessageType(payload);

        if (decodedData.messageType != MessageType.FRAME_PENDING &&
            decodedData.messageType != MessageType.SMS)
        {
            decodedData.trackingMode = determineTrackingMode(payload);
            decodedData.deviceConfiguration = {};
            decodedData.deviceConfiguration.mode = decodedData.trackingMode;
            decodedData.sosFlag = determineUserAction(payload);
            decodedData.appState = determineAppState(payload);
            decodedData.dynamicMotionState = determineMoving(payload);
            if (input.fPort == ASSET_TRACKER_2_0_PORT_NUMBER)
            {
                decodedData.batteryLevel = determineBatteryLevel(payload);
                decodedData.batteryStatus = determineBatteryStatus(payload);
            }
            else
                decodedData.batteryVoltage = determineBatteryVoltage(payload);
            decodedData.temperatureMeasure = determineTemperature(payload);
            decodedData.periodicPosition = determinePeriodicPosition(payload);
            decodedData.onDemand = determineOnDemandPosition(payload);
        }
        if (decodedData.messageType != MessageType.FRAME_PENDING)
            decodedData.ackToken = determineAckToken(payload, decodedData.messageType);

        decodedData.payload = convertBytesToString(payload);

        switch (decodedData.messageType){
            case MessageType.POSITION_MESSAGE:
                decodedData.rawPositionType = determineRawPositionType(payload);
                switch (decodedData.rawPositionType){
                    case RawPositionType.GPS:
                        decodedData.age = determineAge(payload);
                        decodedData.gpsLatitude = determineLatitude(payload, MessageType.POSITION_MESSAGE);
                        decodedData.gpsLongitude = determineLongitude(payload, MessageType.POSITION_MESSAGE);
                        decodedData.horizontalAccuracy = determineHorizontalAccuracy(payload, 0, MessageType.POSITION_MESSAGE);
                        break;
                    case RawPositionType.GPS_TIMEOUT:
                        decodedData.timeoutCause = determineTimeoutCause(payload, MessageType.POSITION_MESSAGE);
                        decodedData.bestSatellitesCOverN = determineBestSatellitesCOverN(payload, MessageType.POSITION_MESSAGE);
                        break;
                    case RawPositionType.ENCRYPTED_WIFI_BSSIDS:
                        break;
                    case RawPositionType.WIFI_TIMEOUT:
                        decodedData.batteryVoltageMeasures = determineBatteryVoltageMeasures(payload, MessageType.POSITION_MESSAGE);
                        break;
                    case RawPositionType.WIFI_FAILURE:
                        decodedData.batteryVoltageMeasures = determineBatteryVoltageMeasures(payload, MessageType.POSITION_MESSAGE);
                        decodedData.errorCode = determineErrorCode(payload,  MessageType.POSITION_MESSAGE);
                        break;
                    case RawPositionType.XGPS_DATA:
                        break;
                    case RawPositionType.XGPS_DATA_WITH_GPS_SW_TIME:
                        break;
                    case RawPositionType.WIFI_BSSIDS_WITH_NO_CYPHER:
                        decodedData.age = determineAge(payload);
                        if (payload.length >=13)
                        {decodedData.wifiBssids = determineBSSIDS(payload, MessageType.POSITION_MESSAGE);}
                        break;
                    case RawPositionType.BLE_BEACON_SCAN:
                        decodedData.age = determineAge(payload);
                        decodedData.bleBssids = determineBSSIDS(payload, MessageType.POSITION_MESSAGE);
                        break;
                    case RawPositionType.BLE_BEACON_FAILURE:
                        decodedData.bleBeaconFailure = determineBleBeaconFailure(payload, MessageType.POSITION_MESSAGE);
                        break;
                    case RawPositionType.BLE_BEACON_SCAN_SHORT_ID:
                        decodedData.age = determineAge(payload);
                        decodedData.bleBeaconIds = determineShortBeaconIDs(payload, MessageType.POSITION_MESSAGE);
                        break;
                    case RawPositionType.BLE_BEACON_SCAN_LONG_ID:
                        decodedData.age = determineAge(payload);
                        decodedData.bleBeaconIds = determineLongBeaconIDs(payload, MessageType.POSITION_MESSAGE);
                        break;
                    default:
                        throw new Error("The Fix Type is unknown");
                }
                break;
            case MessageType.EXTENDED_POSITION_MESSAGE:
                decodedData.rawPositionType = determineRawPositionType(payload);
                switch (decodedData.rawPositionType){
                    case RawPositionType.GPS:
                        decodedData.gpsFixStatus = determineGpsFixStatus(payload);
                        decodedData.gpsPayloadType = detemindGpsPayloadType(payload);
                        decodedData.age = determineExtendedAge(payload);
                        decodedData.gpsLatitude = determineLatitude(payload, MessageType.EXTENDED_POSITION_MESSAGE);
                        decodedData.gpsLongitude = determineLongitude(payload, MessageType.EXTENDED_POSITION_MESSAGE);
                        decodedData.horizontalAccuracy = determineHorizontalAccuracy(payload, decodedData.gpsPayloadType, MessageType.EXTENDED_POSITION_MESSAGE);
                        decodedData.gpsCourseOverGround = determineCourseOverGround(payload);
                        decodedData.gpsSpeedOverGround = determineSpeedOverGround(payload);
                        decodedData.gpsAltitude = determineAltitude(payload, decodedData.gpsPayloadType);
                        if (payload.length > 24)
                            decodedData.gpsPrevious = determineGpsPrevious(payload);
                        break;
                    case RawPositionType.GPS_TIMEOUT:
                        decodedData.age = determineExtendedAge(payload);
                        decodedData.timeoutCause = determineTimeoutCause(payload, MessageType.EXTENDED_POSITION_MESSAGE);
                        decodedData.bestSatellitesCOverN = determineBestSatellitesCOverN(payload, MessageType.EXTENDED_POSITION_MESSAGE);
                        break;
                    case RawPositionType.ENCRYPTED_WIFI_BSSIDS:
                        break;
                    case RawPositionType.WIFI_TIMEOUT:
                        decodedData.age = determineExtendedAge(payload);
                        decodedData.batteryVoltageMeasures = determineBatteryVoltageMeasures(payload, MessageType.EXTENDED_POSITION_MESSAGE);
                        break;
                    case RawPositionType.WIFI_FAILURE:
                        decodedData.age = determineExtendedAge(payload);
                        decodedData.batteryVoltageMeasures = determineBatteryVoltageMeasures(payload, MessageType.EXTENDED_POSITION_MESSAGE);
                        decodedData.errorCode = determineErrorCode(payload, MessageType.EXTENDED_POSITION_MESSAGE);
                        break;
                    case RawPositionType.XGPS_DATA:
                        break;
                    case RawPositionType.XGPS_DATA_WITH_GPS_SW_TIME:
                        break;
                    case RawPositionType.WIFI_BSSIDS_WITH_NO_CYPHER:
                        decodedData.age = determineExtendedAge(payload);
                        if (payload.length >=14)
                        {decodedData.wifiBssids = determineBSSIDS(payload, MessageType.EXTENDED_POSITION_MESSAGE)};
                        break;
                    case RawPositionType.BLE_BEACON_SCAN:
                        decodedData.age = determineExtendedAge(payload);
                        decodedData.bleBssids = determineBSSIDS(payload, MessageType.EXTENDED_POSITION_MESSAGE);
                        break;
                    case RawPositionType.BLE_BEACON_FAILURE:
                        decodedData.age = determineExtendedAge(payload);
                        decodedData.bleBeaconFailure = determineBleBeaconFailure(payload, MessageType.EXTENDED_POSITION_MESSAGE);
                        break;
                    case RawPositionType.BLE_BEACON_SCAN_SHORT_ID:
                        decodedData.age = determineExtendedAge(payload);
                        decodedData.bleBeaconIds = determineShortBeaconIDs(payload, MessageType.EXTENDED_POSITION_MESSAGE);
                        break;
                    case RawPositionType.BLE_BEACON_SCAN_LONG_ID:
                        decodedData.age = determineExtendedAge(payload);
                        decodedData.bleBeaconIds = determineLongBeaconIDs(payload, MessageType.EXTENDED_POSITION_MESSAGE);
                        break;
                    default:
                        throw new Error("The Fix Type is unknown");
                }
                break;
            case MessageType.HEARTBEAT:
                decodedData.resetCause = determineResetCause(payload);
                if (payload.length > 6){
                    decodedData.firmwareVersion = determineHeartBeatFirmwareVersion(payload);
                }
                if (payload.length > 9){
                    decodedData.bleFirmwareVersion = determineHeartBeatBleFirmwareVersion(payload);
                }
                break;
            case MessageType.HEALTH_STATUS:
                decodedData.healthStatus = determinHealthStatus(payload);
                break;
            case MessageType.ENERGY_STATUS:
                decodedData.gpsOnRuntime = determineGpsOnRuntime(payload);
                decodedData.gpsStandbyRuntime = determineGpsStandby(payload);
                decodedData.wifiScanCount = determineWifiScanCount(payload);
                break;
            case MessageType.ACTIVITY_STATUS:
                decodedData.miscDataTag = determineMiscDataTag(payload);
                switch (decodedData.miscDataTag){
                    case MiscDataTag.ACTIVITY_COUNTER:
                        decodedData.activityCount = determineActivityCounter(payload);
                        break;
                    case MiscDataTag.PERIODIC_ACTIVITY:
                        decodedData.activityReportingWindow = determinePeriodicActivity(payload);
                        decodedData.activityCount = determineActivityCounterPeriodicReport(payload);
                        break;
                    default:
                        break;
                }
                break;
            case MessageType.SHOCK_DETECTION:
                decodedData.miscDataTag = determineMiscDataTag(payload);
                decodedData.nbOfshock = determineNbShocks(payload);
                decodedData.accelerometerShockData = determineAccelerometerShockData(payload);
                decodedData.gaddIndex = determineGaddIndex(payload);
                break;
            case MessageType.CONFIGURATION:
                decodedData.miscDataTag = determineMiscDataTag(payload);
                decodedData.deviceConfiguration = determineDeviceConfiguration(payload);
                if (decodedData.deviceConfiguration.mode == null) {
                    decodedData.deviceConfiguration.mode = decodedData.trackingMode;
                }

                break;
            case MessageType.BLE_MAC:
                decodedData.miscDataTag = determineMiscDataTag(payload);
                decodedData.bleMac = determineBleMac(payload);
                break;
            case MessageType.DEBUG:
                decodedData.debugCommandTag = determineDebugCommandTag(payload);
                switch (decodedData.debugCommandTag){
                    case DebugCommandTag.DEBUG_CRASH_INFORMATION:
                        decodedData.debugErrorCode = determineDebugErrorCode(payload);
                        decodedData.debugCrashInfo = determineDebugCrashInfo(payload);
                        break;
                    case DebugCommandTag.TX_POWER_INDEX_VALUE:
                        decodedData.txPowerIndex = determineTxIndexPower(payload);
                        break;
                    case DebugCommandTag.UPLINK_LENGTH_ERR:
                        decodedData.lengthErrCounter = determineUlLengthErrCounter(payload);
                        break;
                    case DebugCommandTag.GENERIC_ERROR:
                        decodedData.genericErrorCode = determineGenericErrorCode(payload);
                        break;
                    case DebugCommandTag.SPECIFIC_FIRMWARE_PARAMETERS:
                        decodedData.specificFirmwareParameters = determineSpecificFirmwareParameters(payload);
                        break;
                    default:
                        throw new Error("The Debug Command Tag is unknown");
                }
                break;
            case MessageType.SHUTDOWN:
                decodedData.shutdownCause = determineShutDownCause(payload);
                break;
            case MessageType.FRAME_PENDING:
                decodedData.currentAckTokenValue = determineCurrentAckTokenValue(payload);
                break;
            case MessageType.EVENT:
                decodedData.eventType = determineEventType(payload);
                switch (decodedData.eventType){
                    case EventType.MOTION_END:
                        decodedData.trackerOrientation = determineTrackerOrientation(payload);
                        decodedData.motionDutyCycle = determineMotionDutyCycle(payload);
                        break;
                    case EventType.TEMPERATURE_ALERT:
                        decodedData.measuredTemperature = determineMeasuredTemperature(payload);
                        break;
                    case EventType.ANGLE_DETECTION:
                        decodedData.angleDetection = determineAngleDetection(payload);
                        break;
                    case EventType.GEOFENCING:
                        decodedData.geofencingNotification = determineGeofencingNotification(payload);
                        break;
                    default:
                        break;
                }
                break;
            case MessageType.DATA_SCAN_COLLECTION:
                decodedData.dataScanCollection = determineDataScanCollection(payload);
                break;
            case MessageType.PROXIMITY_DETECTION:
                if (payload.length < 6) {
                    throw new Error("The payload is not valid to determine proximity payload Type");
                }
                let notificationType;
                let solicited;
                switch (payload[5]&0x07){
                    case 0:
                        notificationType = proximityNotificationClass.NotificationType.WARNING_MESSAGE;
                        break;
                    case 1:
                        notificationType = proximityNotificationClass.NotificationType.ALERT_MESSAGE;
                        break;
                    case 2:
                        notificationType = proximityNotificationClass.NotificationType.RECORD_MESSAGE;
                        break;
                    case 3:
                        decodedData.proximityDailyReport = determineProximityDailyReport(payload);
                        break;
                    case 4:
                        solicited = false;
                        break;
                    case 5:
                        solicited = true;
                        break;
                    case 6:
                        decodedData.proximityDailyResponse = determineProximityDailyResponse(payload);
                        break;
                    default:
                        throw new Error("The Proximity Notification Type is unknown");
                }
                if (notificationType != null){
                    decodedData.proximityNotification = determineProximityNotification(payload, notificationType);
                }
                if (solicited != null){
                    decodedData.proximityWhiteListing = determineProximityWhiteListing(payload, solicited);
                }
                break;
            case MessageType.SMS:
                decodedData.sms = determineUplinkSms(payload);
                break;
            default:
                throw new Error("The message type is unknown");
        }
        decodedData = removeEmpty(decodedData);
        result.data = decodedData;
    } catch (e){
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
    }
    try{
        var decodedData = new abeewayDownlinkPayloadClass.AbeewayDownlinkPayload();
        var payload = input.bytes;

        decodedData.payload = convertBytesToString(payload);
        decodedData.ackToken = determinDownlinkAckToken(payload);
        decodedData.downMessageType = determineDownlinkMessageType(payload);

        switch (decodedData.downMessageType){
            case DownMessageType.POS_ON_DEMAND:
                break;
            case DownMessageType.SET_MODE:
                decodedData.modeValue = determineOpMode(payload);
                break;
            case DownMessageType.REQUEST_CONFIG:
                if (payload.length > 2)
                { if (payload.length<3 || payload.length > 22){
                    decodedData.errors.push("The payload is not valid to determine Parameters");
                    return decodedData;
                }
                    decodedData.listParameterID = (determineParamIds(payload));
                    decodedData.listParameterIDNames = (determineParamIdNames(decodedData.listParameterID));
                }
                break;
            case DownMessageType.START_SOS:
                break;
            case DownMessageType.STOP_SOS:
                break;
            case DownMessageType.REQUEST_TEMPERATURE_STATUS:
                if (payload.length == 3){
                    if (payload[2] !=0) {
                        decodedData.optionalCommand = determinOptionalCommand(payload);
                    }
                }
                break;
            case DownMessageType.PROXIMITY:
                decodedData.proximityMessage = determineProximityMessage(payload);
                break;
            case DownMessageType.ANGLE_DETECTION:
                decodedData.angleDetectionControl = determineAngleDetectionMessage(payload);
                break;
            case DownMessageType.REQUEST_STATUS:
                if (payload.length == 3){
                    decodedData.statusType = determineStatusRequestType(payload);
                }
                break;
            case DownMessageType.SET_PARAM:
                decodedData.setParameters = determineSetParameters(payload);
                break;
            case DownMessageType.CLEAR_MOTION_PERCENTAGE:
                break;
            case DownMessageType.SMS:
                decodedData.sms = determineDownlinkSms(payload);
                break;
            case DownMessageType.DEBUG_COMMAND:
                decodedData.debugCommandType = determineDebugCommand(payload);
                switch (decodedData.debugCommandType){
                    case DebugCommandType.RESET:
                        decodedData.resetAction = determineResetAction(payload);
                        break;
                    case DebugCommandType.WRITE_TX_POWER_INDEX:
                        decodedData.txPowerIndex = determineWriteTxIndex(payload);
                        break;
                    case DebugCommandType.MAKE_TRACKER_RING:
                        decodedData.melodyId = determineBuzzerMelodyId(payload);
                        decodedData.buzzerDuration = determineBuzzerDuration(payload);
                        break;
                    case DebugCommandType.START_AND_STOP_BLE_ADVERTISEMENT:
                        decodedData.bleAdvertisementDuration = determineBleAdvertisementDuration(payload);
                        break;
                    case DebugCommandType.CONFIGURE_STARTUP_MODES:
                        decodedData.startupModes = determineStartupModes(payload);
                        break;
                }
                break;
            default:
                throw new Error("The Downlink Message Type is unknown");
        }
        result.data = decodedData;
    } catch (e){
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

    try{
        if (input == null) {
            throw new Error("No data to encode");
        }

        let data = input;
        if(input.data != null) {
            data = input.data;
        }

        var bytes = [];

        if(data.downMessageType == null){
            throw new Error("No downlink message type");
        }
        switch (data.downMessageType){
            case DownMessageType.POS_ON_DEMAND:
                bytes = encodeGetPosition(data);
                break;
            case DownMessageType.SET_MODE:
                bytes = encodeChangeTrackerMode(data);
                break;
            case DownMessageType.REQUEST_CONFIG:
                bytes = encodeGetDeviceConfig(data);
                break;
            case DownMessageType.START_SOS:
                bytes = encodeStartSOSMode(data);
                break;
            case DownMessageType.STOP_SOS:
                bytes = encodeStopSOSMode(data);
                break;
            case DownMessageType.REQUEST_TEMPERATURE_STATUS:
                bytes = encodeGetTemperatureStatus(data);
                break;
            case DownMessageType.PROXIMITY:
                bytes = encodeProximityMessage(data);
                break;
            case DownMessageType.ANGLE_DETECTION:
                bytes = encodeAngleDetectionMessage(data);
                break;
            case DownMessageType.REQUEST_STATUS:
                bytes = encodeStatusRequestMessage(data);
                break;
            case DownMessageType.SET_PARAM:
                bytes = encodeSetParameter(data);
                break;
            case DownMessageType.CLEAR_MOTION_PERCENTAGE:
                bytes = encodeClearMotionPercentage(data);
                break;
            case DownMessageType.SMS:
                bytes = encodeSms(data);
                break;
            case DownMessageType.DEBUG_COMMAND:
                bytes = encodeDebugCommand(data);
                break;
            default:
                throw new Error("Invalid downlink message type");
        }

        result.bytes = bytes;
        result.fPort = DOWNLINK_PORT_NUMBER;
    } catch (e){
        result.errors.push(e.message);
        delete result.bytes;
        delete result.fPort;
        return result;
    }
    return result;
}

function extractPoints(input) {
    return pointExtractions.extractPoints(input);
}

module.exports = {
    decodeUplink: decodeUplink,
    decodeDownlink: decodeDownlink,
    encodeDownlink: encodeDownlink,
    extractPoints: extractPoints
}