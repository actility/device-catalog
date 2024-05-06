var driver;(()=>{var e={138:(e,t,r)=>{let n=r(156),s=r(527),i=r(76),o=r(378),a=r(985),S=r(185),R=r(891),E=r(358),_=r(330);const T=e=>(Object.keys(e).forEach((t=>e[t]&&"object"==typeof e[t]&&T(e[t])||!e[t]&&(null===e[t]||void 0===e[t])&&delete e[t])),e);e.exports={decodeUplink:function(e){let t={data:{},errors:[],warnings:[]};try{var r=new n.AbeewayUplinkPayload,s=e.bytes;r.header=i.determineHeader(s);var E=!!(s[0]>>7&1);switch(E&&(r.multiFrame=o.determineMultiFrame(s)),r.payload=R.convertBytesToString(s),r.header.type){case n.messageType.NOTIFICATION:r.notification=a.determineNotification(s);break;case n.messageType.POSITION:r.position=S.determinePosition(s,E);break;case n.messageType.QUERY:r.query=determineQuery(s);break;case n.messageType.RESPONSE:r.response=determineResponse(s)}r=T(r),t.data=r}catch(e){return t.errors.push(e.message),delete t.data,t}return t},decodeDownlink:function(e){let t={data:{},errors:[],warnings:[]};try{var r=e.bytes,n=new s.determineDownlinkHeader(r);switch(n.payload=R.convertBytesToString(r),n.type){case s.MessageType.COMMAND:case s.MessageType.REQUEST:case s.MessageType.ANSWER:}}catch(e){return t.errors.push(e.message),delete t.data,t}return t},encodeDownlink:function(e){let t={errors:[],warnings:[]};try{if(null==e)throw new Error("No data to encode");let n=e;null!=e.data&&(n=e.data);var r=[];if(null==n.type)throw new Error("No downlink message type");switch(n.type){case s.MessageType.COMMAND:r=E.encodeCommand(n);break;case s.MessageType.REQUEST:r=_.encodeRequest(n);case s.MessageType.ANSWER:}t.bytes=r,t.fPort=2}catch(e){return t.errors.push(e.message),delete t.bytes,delete t.fPort,t}return t}}},527:e=>{const t=Object.freeze({COMMAND:"COMMAND",REQUEST:"REQUEST",ANSWER:"ANSWER"});function r(e,t,r,n,s,i){this.type=e,this.ackToken=t,this.appState=r,this.command=n,this.request=s,this.payload=i}e.exports={AbeewayDownlinkPayload:r,MessageType:t,determineDownlinkHeader:function(e){if(e.length<1)throw new Error("The payload is not valid to determine header");var n=7&e[0],s=function(e){switch(e[0]>>3&7){case 1:return t.COMMAND;case 2:return t.REQUEST;case 3:return t.ANSWER}}(e);return new r(s,n,e[0]>>6&3)}}},156:e=>{const t=Object.freeze({NOTIFICATION:"NOTIFICATION",POSITION:"POSITION",QUERY:"QUERY",RESPONSE:"RESPONSE",UNKNOWN:"UNKNOWN"});e.exports={AbeewayUplinkPayload:function(e,t,r,n,s,i,o){this.header=e,this.multiFrame=t,this.notification=r,this.position=n,this.query=s,this.response=i,this.payload=o},messageType:t}},358:e=>{const t=Object.freeze({CLEAR_AND_RESET:"CLEAR_AND_RESET",RESET:"RESET",START_SOS:"START_SOS",STOP_SOS:"STOP_SOS",SYS_STATUS_REQ:"SYS_STATUS_REQ",POSITION_ON_DEMAND:"POSITION_ON_DEMAND"});e.exports={Command:t,determineCommand:function(e){},encodeCommand:function(e){}}},76:(e,t,r)=>{let n=r(156);const s=Object.freeze({CHARGING:"CHARGING",OPERATING:"OPERATING",UNKNOWN:"UNKNOWN"});function i(e,t,r,n,s,i){this.sos=e,this.type=t,this.ackToken=r,this.appState=n,this.batteryLevel=s,this.timestamp=i}e.exports={Header:i,determineHeader:function(e){if(e.length<3)throw new Error("The payload is not valid to determine header");var t=!!(e[0]>>6&1),r=7&e[0],o=function(e){if(e.length<4)throw new Error("The payload is not valid to determine Message Type");switch(e[0]>>3&7){case 1:return n.messageType.NOTIFICATION;case 2:return n.messageType.POSITION;case 3:return n.messageType.QUERY;case 4:return n.messageType.RESPONSE;default:return n.messageType.UNKNOWN}}(e),a=e[1]>>7&1,S=function(e){if(e.length<4)throw new Error("The payload is not valid to determine Battery Level");var t=127&e[1];return 0==t?s.CHARGING:127==t?s.UNKNOWN:t}(e);return new i(t,o,r,a,S,e[2]<<8+e[3])}}},378:e=>{function t(e,t,r){this.group=e,this.last=t,this.frameNumber=r}e.exports={MultiFrame:t,determineMultiFrame:function(e){if(e.length<5)throw new Error("The payload is not valid to determine multi frame header");return new t(e[4]>>5&7,e[4]>>4&1,7&e[4])}}},985:(e,t,r)=>{let n=r(81);const s=Object.freeze({SYSTEM:"SYSTEM",SOS:"SOS",TEMPERATURE:"TEMPERATURE",ACCELEROMETER:"ACCELEROMETER",NETWORK:"NETWORK",GEOZONING:"GEOZONING"}),i=Object.freeze({STATUS:"STATUS",LOW_BATTERY:"LOW_BATTERY",BLE_CONNECTED_SEC:"BLE_CONNECTED_SEC",BLE_DISCONNECTED:"BLE_DISCONNECTED"});function o(e,t,r,n,s,i,o,a){this.notificationClass=e,this.notificationType=t,this.system=r,this.sos=n,this.temperature=s,this.accelerometer=i,this.network=o,this.geofencing=a}Object.freeze({SOS_ON:"SOS_ON",SOS_OFF:"SOS_ON"}),Object.freeze({TEMP_HIGH:"TEMP_HIGH",TEMP_LOW:"TEMP_LOW",TEMP_NORMAL:"TEMP_NORMAL"}),Object.freeze({MOTION_START:"MOTION_START",MOTION_END:"MOTION_END",SHOCK:"SHOCK"}),Object.freeze({MAIN_UP:"MAIN_UP",BACKUP_UP:"BACKUP_UP"}),Object.freeze({ENTRY:"ENTRY",EXIT:"EXIT",IN_HAZARD:"IN_HAZARD",OUT_HAZARD:"OUT_HAZARD",MEETING_POINT:"MEETING_POINT"}),e.exports={Notification:o,determineNotification:function(e){if(e.length<5)throw new Error("The payload is not valid to determine notification message");let t=new o,r=e[4]>>4&15,a=15&e[4];switch(r){case 0:switch(t.notificationClass=s.SYSTEM,a){case 0:t.notificationType=i.STATUS,t.system=new n.System(n.determineStatus(e),null);break;case 1:t.notificationType=i.LOW_BATTERY;break;case 2:t.notificationType=i.BLE_CONNECTED_SEC;break;case 3:t.notificationType=i.BLE_DISCONNECTED;break;default:throw new Error("System Notification Type Unknown")}break;case 1:case 2:case 3:case 4:case 5:break;default:throw new Error("Notification Class Unknown")}return t}}},81:(e,t,r)=>{let n=r(891);const s=Object.freeze({AOS_ERROR_NONE:"AOS_ERROR_NONE",AOS_ERROR_HW_NMI:"AOS_ERROR_HW_NMI",AOS_ERROR_HW_FAULT:"AOS_ERROR_HW_FAULT",AOS_ERROR_HW_MPU:"AOS_ERROR_HW_MPU",AOS_ERROR_HW_BUS:"AOS_ERROR_HW_BUS",AOS_ERROR_HW_USAGE:"AOS_ERROR_HW_USAGE",AOS_ERROR_HW_IRQ:"AOS_ERROR_HW_IRQ",AOS_ERROR_HW_WDOG:"AOS_ERROR_HW_WDOG",AOS_ERROR_HW_BOR:"AOS_ERROR_HW_BOR",AOS_ERROR_SW_ST_HAL_ERROR:"AOS_ERROR_SW_ST_HAL_ERROR",AOS_ERROR_SW_FREERTOS_ASSERT:"AOS_ERROR_SW_FREERTOS_ASSERT",AOS_ERROR_SW_FREERTOS_TASK_OVF:"AOS_ERROR_SW_FREERTOS_TASK_OVF",AOS_ERROR_SW_RTC_FAIL:"AOS_ERROR_SW_RTC_FAIL",AOS_ERROR_SW_LORA_FAIL:"AOS_ERROR_SW_LORA_FAIL",AOS_ERROR_SW_DEBUG:"AOS_ERROR_SW_DEBUG",AOS_ERROR_SW_APP_START:"AOS_ERROR_SW_APP_START"});function i(e,t,r,n,s,i,o,a,S,R,E,_,T,O,c,A,N,h,u,l,g,d){this.AT3Version=e,this.configVersion=t,this.LRHWVersion=r,this.LRGNSSVersion=n,this.consumption=s,this.batteryVoltage=i,this.currentTemperature=o,this.maxTemperature=a,this.minTemperature=S,this.resetCause=R,this.LR1110GpsAlmanacDate=E,this.LR1110GpsOutdated=_,this.LR1110GpsGood=T,this.LR1110BeidouAlmanacDate=O,this.LR1110BeidouOutdated=c,this.LR1110BeidouGood=A,this.MT3333GpsAlmanacDate=N,this.MT3333GpsOutdated=h,this.MT3333GpsGood=u,this.MT3333BeidouAlmanacDate=l,this.MT3333BeidouOutdated=g,this.MT3333BeidouGood=d}e.exports={System:function(e,t){this.status=e,this.lowBattery=t},determineStatus:function(e){if(e.length<40)throw new Error("The payload is not valid to determine status message");return new i(e[5].toString()+"."+e[6].toString()+"."+e[7].toString(),e[8].toString()+"."+e[9].toString()+"."+e[10].toString()+"."+e[11].toString(),e[12].toString()+"."+e[13].toString()+"."+e[14].toString(),e[15],(e[16]<<8)+e[17],(e[18]<<8)+e[19],n.convertNegativeInt(e[20],1),n.convertNegativeInt(e[21],1),n.convertNegativeInt(e[22],1),function(e){switch(e){case 0:return s.AOS_ERROR_NONE;case 1:return s.AOS_ERROR_HW_NMI;case 2:return s.AOS_ERROR_HW_FAULT;case 3:return s.AOS_ERROR_HW_MPU;case 4:return s.AOS_ERROR_HW_BUS;case 5:return s.AOS_ERROR_HW_USAGE;case 6:return s.AOS_ERROR_HW_IRQ;case 7:return s.AOS_ERROR_HW_WDOG;case 8:return s.AOS_ERROR_HW_BOR;case 9:return s.AOS_ERROR_SW_ST_HAL_ERROR;case 10:return s.AOS_ERROR_SW_FREERTOS_ASSERT;case 11:return s.AOS_ERROR_SW_FREERTOS_TASK_OVF;case 12:return s.AOS_ERROR_SW_RTC_FAIL;case 13:return s.AOS_ERROR_SW_LORA_FAIL;case 14:return s.AOS_ERROR_SW_DEBUG;case 15:return s.AOS_ERROR_SW_APP_START;default:throw new Error("Unknown Reset Cause")}}(e[23]),(e[24]<<8)+e[25],e[26],e[27],(e[28]<<8)+e[29],e[30],e[31],(e[32]<<8)+e[33],e[34],e[35],(e[36]<<8)+e[37],e[38],e[39])}}},232:e=>{e.exports={BeaconInfo:function(e,t){this.id=e,this.rssi=t}}},978:e=>{e.exports={BssidInfo:function(e,t){this.mac=e,this.rssi=t}}},185:(e,t,r)=>{let n=r(804),s=r(978),i=r(232),o=r(891),a=r(430);const S=Object.freeze({SUCCESS:"SUCCESS",TIMEOUT:"TIMEOUT",FAILURE:"FAILURE"}),R=Object.freeze({LR1110GNSS:"LR1110GNSS",LR1110SEMTECHNAV1:"LR1110SEMTECHNAV1",LR1110SEMTECHNAV2:"LR1110SEMTECHNAV2",WIFI:"WIFI",BLEMAC:"BLEMAC",BLESHORT:"BLESHORT",BLELONG:"BLELONG",MT3333GNSS:"MT3333GNSS",MT3333LPGNSS:"MT3333LPGNSS"});function E(e,t,r,n,s,i,o,a,S,R,E,_,T){this.motion=e,this.status=t,this.positionType=r,this.triggers=n,this.lr1110gnss=s,this.lr1110semtechNav1=i,this.lr1110semtechNav2=o,this.wifi=a,this.bleMacShort=S,this.bleShort=R,this.bleLong=E,this.mt3333gnss=_,this.mt3333lpgnss=T}e.exports={Position:E,determinePosition:function(e,t){const r=4;t&&(r=5);let _=function(e,t){let r=new E;switch(r.motion=e[t]>>7&1,e[t]>>5&3){case 0:r.status=S.SUCCESS;break;case 1:r.status=S.TIMEOUT;break;case 2:r.status=S.FAILURE}switch(15&e[t]){case 0:r.positionType=R.LR1110GNSS;break;case 1:r.positionType=R.LR1110SEMTECHNAV1;break;case 2:r.positionType=R.LR1110SEMTECHNAV2;break;case 3:r.positionType=R.WIFI;break;case 4:r.positionType=R.BLEMAC;break;case 5:case 6:r.positionType=R.BLESHORT;break;case 7:r.positionType=R.MT3333GNSS;break;case 8:r.positionType=R.MT3333LPGNSS}return r.triggers=new n.TriggerBitMap(1&e[t+2],e[t+2]>>1&1,e[t+2]>>2&1,e[t+2]>>3&1,e[t+2]>>4&1,e[t+2]>>5&1,e[t+2]>>6&1,e[t+2]>>7&1,1&e[t+1],e[t+1]>>1&1),r}(e,r);switch(_.positionType){case R.LR1110GNSS:_.lr1110gnss=function(e){let t={};t.time=16*(e[0]<<8+e[1]);var r=0;let n=[];for(;e.length>=2+4*(r+1);){var s=new a.SatelliteInfo;switch(e[2+4*r]>>6&3){case 0:s.constellation=a.Constellation.GPS;break;case 1:s.constellation=a.Constellation.BEIDOU}switch(e[2+4*r],e[3+4*r]>>6&3){case 0:s.cn=a.CN[0];break;case 1:s.cn=a.CN[1];break;case 2:s.cn=a.CN[2];break;case 3:s.cn=a.CN[3]}s.pseudoRangeValue=(7&e[3+4*r])<<16+e[4+4*r]<<8+e[5+4*r],n.push(s),r++}return t.satelliteInfos=n,t}(e.slice(r+3));break;case R.LR1110SEMTECHNAV1:_.lr1110semtechNav1=o.convertBytesToString(e.slice(r+3));break;case R.LR1110SEMTECHNAV2:_.lr1110semtechNav2=o.convertBytesToString(e.slice(r+3));break;case R.WIFI:_.wifi=function(e){let t=[];for(var r=0;e.length>=7*(r+1);){let n=o.convertByteToString(e[7*r])+":"+o.convertByteToString(e[1+7*r])+":"+o.convertByteToString(e[2+7*r])+":"+o.convertByteToString(e[3+7*r])+":"+o.convertByteToString(e[4+7*r])+":"+o.convertByteToString(e[5+7*r]),i=o.convertNegativeInt(e[6+7*r],1);t.push(new s.BssidInfo(n,i)),r++}return t}(e.slice(r+3));break;case R.BLEMAC:_.bleMacShort=function(e){let t=[];for(var r=0;e.length>=7*(r+1);){let n=o.convertByteToString(e[7*r])+":"+o.convertByteToString(e[1+7*r])+":"+o.convertByteToString(e[2+7*r])+":"+o.convertByteToString(e[3+7*r])+":"+o.convertByteToString(e[4+7*r])+":"+o.convertByteToString(e[5+7*r]),s=o.convertNegativeInt(e[6+7*r],1);t.push(new i.BeaconInfo(n,s)),r++}return t}(e.slice(r+3));break;case R.BLESHORT:_.bleShort=determineBleShortPositionMessage(e.slice(r+3));break;case R.BLELONG:_.bleLong=determineBleLongPositionMessage(e.slice(r+3));break;case R.MT3333GNSS:_.mt3333gnss=void e.slice(r+3);break;case R.MT3333LPGNSS:_.mt3333lpgnss=determineMT3333LPGnssPositionMessage(e.slice(r+3))}return _}}},430:e=>{const t=Object.freeze({GPS:"GPS",BEIDOU:"BEIDOU"}),r=Object.freeze({0:">45dB",1:"[41..45]dB",2:"[37..41]dB",3:"<37dB"});e.exports={SatelliteInfo:function(e,t,r,n){this.constellation=e,this.id=t,this.cn=r,this.pseudoRangeValue=n},Constellation:t,CN:r}},804:e=>{e.exports={TriggerBitMap:function(e,t,r,n,s,i,o,a,S,R){this.geoTriggerPod=e,this.geoTriggerSos=t,this.geoTriggerMotionStart=r,this.geoTriggerMotionStop=n,this.geoTriggerInMotion=s,this.geoTriggerInStatic=i,this.geoTriggerShock=o,this.geoTriggerTempHighThreshold=a,this.geoTriggerTempLowThreshold=S,this.geoTriggerGeoZoning=R}}},330:e=>{const t=Object.freeze({GENERIC_CONF_SET:"GENERIC_CONF_SET",PARAM_CLASS_CONF_SET:"PARAM_CLASS_CONF_SET",GENERIC_CONF_GET:"GENERIC_CONF_GET",PARAM_CLASS_CONF_GET:"PARAM_CLASS_CONF_GET",BLE_STATUS:"BLE_STATUS",GET_GPS_ALMANAC_ENTRY:"GET_GPS_ALMANAC_ENTRY",GET_BEIDOU_ALMANAC_ENTRY:"GET_BEIDOU_ALMANAC_ENTRY",SET_GPS_ALMANAC_ENTRY:"SET_GPS_ALMANAC_ENTRY",SET_BEIDOU_ALMANAC_ENTRY:"SET_BEIDOU_ALMANAC_ENTRY"});e.exports={RequestType:t,encodeRequest:function(e){}}},891:e=>{function t(e){let t=e.toString(16);return t.length<2&&(t="0"+t),t}e.exports={convertToByteArray:function(e){for(var t=[],r=(e.length,0);r<e.length;r+=2)t[r/2]=255&parseInt(e.substring(r,r+2),16);return t},camelToSnake:function(e){return e.replace(/[\w]([A-Z1-9])/g,(function(e){return e[0]+"_"+e[1]})).toUpperCase()},convertBytesToString:function(e){for(var r="",n=0;n<e.length;n++)r+=t(e[n]);return r},convertByteToString:t,decodeCondensed:function(e,t,r,n,s){return(e-s/2)/(((1<<n)-1-s)/(r-t))+t},convertNegativeInt:function(e,t){return e>127<<8*(t-1)&&(e-=1<<8*t),e}}}},t={},r=function r(n){var s=t[n];if(void 0!==s)return s.exports;var i=t[n]={exports:{}};return e[n](i,i.exports,r),i.exports}(138);driver=r})();