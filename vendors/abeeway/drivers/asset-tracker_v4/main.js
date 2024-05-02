var driver;(()=>{var e={44:(e,t,r)=>{let n=r(760),i=r(496),R=r(47),s=r(720),O=r(248),_=r(94);const o=e=>(Object.keys(e).forEach((t=>e[t]&&"object"==typeof e[t]&&o(e[t])||!e[t]&&(null===e[t]||void 0===e[t])&&delete e[t])),e);e.exports={decodeUplink:function(e){let t={data:{},errors:[],warnings:[]};try{var r=new n.AbeewayUplinkPayload,a=e.bytes;switch(r.header=i.determineHeader(a),a[0]>>7&1&&(r.multiFrame=R.determineMultiFrame(a)),r.payload=_.convertBytesToString(a),r.header.type){case n.messageType.NOTIFICATION:r.notification=s.determineNotification(a);break;case n.messageType.POSITION:r.position=O.determinePosition(a);break;case n.messageType.QUERY:r.query=determineQuery(a);break;case n.messageType.RESPONSE:r.response=determineResponse(a)}r=o(r),t.data=r}catch(e){return t.errors.push(e.message),delete t.data,t}return t}}},760:e=>{const t=Object.freeze({NOTIFICATION:"NOTIFICATION",POSITION:"POSITION",QUERY:"QUERY",RESPONSE:"RESPONSE",UNKNOWN:"UNKNOWN"});e.exports={AbeewayUplinkPayload:function(e,t,r,n,i,R,s){this.header=e,this.multiFrame=t,this.notification=r,this.position=n,this.query=i,this.response=R,this.payload=s},messageType:t}},496:(e,t,r)=>{let n=r(760);const i=Object.freeze({CHARGING:"CHARGING",OPERATING:"OPERATING",UNKNOWN:"UNKNOWN"});function R(e,t,r,n,i,R){this.sos=e,this.type=t,this.ackToken=r,this.appState=n,this.batteryLevel=i,this.timestamp=R}e.exports={Header:R,determineHeader:function(e){if(e.length<3)throw new Error("The payload is not valid to determine header");var t=!!(e[0]>>6&1),r=7&e[0],s=function(e){if(e.length<4)throw new Error("The payload is not valid to determine Message Type");switch(e[0]>>3&7){case 1:return n.messageType.NOTIFICATION;case 2:return n.messageType.POSITION;case 3:return n.messageType.QUERY;case 4:return n.messageType.RESPONSE;default:return n.messageType.UNKNOWN}}(e),O=e[1]>>7&1,_=function(e){if(e.length<4)throw new Error("The payload is not valid to determine Battery Level");var t=127&e[1];return 0==t?i.CHARGING:127==t?i.UNKNOWN:t}(e);return new R(t,s,r,O,_,e[2]<<8+e[3])}}},47:e=>{function t(e,t,r){this.group=e,this.last=t,this.frameNumber=r}e.exports={MultiFrame:t,determineMultiFrame:function(e){if(e.length<5)throw new Error("The payload is not valid to determine multi frame header");return new t(e[4]>>5&7,e[4]>>4&1,7&e[4])}}},720:(e,t,r)=>{let n=r(102);const i=Object.freeze({SYSTEM:"SYSTEM",SOS:"SOS",TEMPERATURE:"TEMPERATURE",ACCELEROMETER:"ACCELEROMETER",NETWORK:"NETWORK",GEOZONING:"GEOZONING"}),R=Object.freeze({STATUS:"STATUS",LOW_BATTERY:"LOW_BATTERY",BLE_CONNECTED_SEC:"BLE_CONNECTED_SEC",BLE_DISCONNECTED:"BLE_DISCONNECTED"});function s(e,t,r,n,i,R,s,O){this.notificationClass=e,this.notificationType=t,this.system=r,this.sos=n,this.temperature=i,this.accelerometer=R,this.network=s,this.geofencing=O}Object.freeze({SOS_ON:"SOS_ON",SOS_OFF:"SOS_ON"}),Object.freeze({TEMP_HIGH:"TEMP_HIGH",TEMP_LOW:"TEMP_LOW",TEMP_NORMAL:"TEMP_NORMAL"}),Object.freeze({MOTION_START:"MOTION_START",MOTION_END:"MOTION_END",SHOCK:"SHOCK"}),Object.freeze({MAIN_UP:"MAIN_UP",BACKUP_UP:"BACKUP_UP"}),Object.freeze({ENTRY:"ENTRY",EXIT:"EXIT",IN_HAZARD:"IN_HAZARD",OUT_HAZARD:"OUT_HAZARD",MEETING_POINT:"MEETING_POINT"}),e.exports={Notification:s,determineNotification:function(e){if(e.length<5)throw new Error("The payload is not valid to determine notification message");let t=new s,r=e[4]>>4&15,O=15&e[4];switch(r){case 0:switch(t.notificationClass=i.SYSTEM,O){case 0:t.notificationType=R.STATUS,t.system=new n.System(n.determineStatus(e),null);break;case 1:t.notificationType=R.LOW_BATTERY;break;case 2:t.notificationType=R.BLE_CONNECTED_SEC;break;case 3:t.notificationType=R.BLE_DISCONNECTED;break;default:throw new Error("System Notification Type Unknown")}break;case 1:case 2:case 3:case 4:case 5:break;default:throw new Error("Notification Class Unknown")}return t}}},102:(e,t,r)=>{let n=r(94);const i=Object.freeze({AOS_ERROR_NONE:"AOS_ERROR_NONE",AOS_ERROR_HW_NMI:"AOS_ERROR_HW_NMI",AOS_ERROR_HW_FAULT:"AOS_ERROR_HW_FAULT",AOS_ERROR_HW_MPU:"AOS_ERROR_HW_MPU",AOS_ERROR_HW_BUS:"AOS_ERROR_HW_BUS",AOS_ERROR_HW_USAGE:"AOS_ERROR_HW_USAGE",AOS_ERROR_HW_IRQ:"AOS_ERROR_HW_IRQ",AOS_ERROR_HW_WDOG:"AOS_ERROR_HW_WDOG",AOS_ERROR_HW_BOR:"AOS_ERROR_HW_BOR",AOS_ERROR_SW_ST_HAL_ERROR:"AOS_ERROR_SW_ST_HAL_ERROR",AOS_ERROR_SW_FREERTOS_ASSERT:"AOS_ERROR_SW_FREERTOS_ASSERT",AOS_ERROR_SW_FREERTOS_TASK_OVF:"AOS_ERROR_SW_FREERTOS_TASK_OVF",AOS_ERROR_SW_RTC_FAIL:"AOS_ERROR_SW_RTC_FAIL",AOS_ERROR_SW_LORA_FAIL:"AOS_ERROR_SW_LORA_FAIL",AOS_ERROR_SW_DEBUG:"AOS_ERROR_SW_DEBUG",AOS_ERROR_SW_APP_START:"AOS_ERROR_SW_APP_START"});function R(e,t,r,n,i,R,s,O,_,o,a,S,E,T,c,A,u,h,N,d,l,p){this.AT3Version=e,this.configVersion=t,this.LRHWVersion=r,this.LRGNSSVersion=n,this.consumption=i,this.batteryVoltage=R,this.currentTemperature=s,this.maxTemperature=O,this.minTemperature=_,this.resetCause=o,this.LR1110GpsAlmanacDate=a,this.LR1110GpsOutdated=S,this.LR1110GpsGood=E,this.LR1110BeidouAlmanacDate=T,this.LR1110BeidouOutdated=c,this.LR1110BeidouGood=A,this.MT3333GpsAlmanacDate=u,this.MT3333GpsOutdated=h,this.MT3333GpsGood=N,this.MT3333BeidouAlmanacDate=d,this.MT3333BeidouOutdated=l,this.MT3333BeidouGood=p}e.exports={System:function(e,t){this.status=e,this.lowBattery=t},determineStatus:function(e){if(e.length<40)throw new Error("The payload is not valid to determine status message");return new R(e[5].toString()+"."+e[6].toString()+"."+e[7].toString(),e[8].toString()+"."+e[9].toString()+"."+e[10].toString()+"."+e[11].toString(),e[12].toString()+"."+e[13].toString()+"."+e[14].toString(),e[15],(e[16]<<8)+e[17],(e[18]<<8)+e[19],n.convertNegativeInt(e[20]),n.convertNegativeInt(e[21]),n.convertNegativeInt(e[22]),function(e){switch(e){case 0:return i.AOS_ERROR_NONE;case 1:return i.AOS_ERROR_HW_NMI;case 2:return i.AOS_ERROR_HW_FAULT;case 3:return i.AOS_ERROR_HW_MPU;case 4:return i.AOS_ERROR_HW_BUS;case 5:return i.AOS_ERROR_HW_USAGE;case 6:return i.AOS_ERROR_HW_IRQ;case 7:return i.AOS_ERROR_HW_WDOG;case 8:return i.AOS_ERROR_HW_BOR;case 9:return i.AOS_ERROR_SW_ST_HAL_ERROR;case 10:return i.AOS_ERROR_SW_FREERTOS_ASSERT;case 11:return i.AOS_ERROR_SW_FREERTOS_TASK_OVF;case 12:return i.AOS_ERROR_SW_RTC_FAIL;case 13:return i.AOS_ERROR_SW_LORA_FAIL;case 14:return i.AOS_ERROR_SW_DEBUG;case 15:return i.AOS_ERROR_SW_APP_START;default:throw new Error("Unknown Reset Cause")}}(e[23]),(e[24]<<8)+e[25],e[26],e[27],(e[28]<<8)+e[29],e[30],e[31],(e[32]<<8)+e[33],e[34],e[35],(e[36]<<8)+e[37],e[38],e[39])}}},248:e=>{function t(e,t,r,n,i,R,s,O,_,o,a,S,E){this.motion=e,this.status=t,this.positionType=r,this.triggers=n,this.lr1110gnss=i,this.lr1110semtechNav1=R,this.lr1110semtechNav2=s,this.wifi=O,this.bleMac=_,this.bleShort=o,this.bleLong=a,this.mt3333gnss=S,this.mt3333lpgnss=E}e.exports={Position:t,determinePosition:function(e){return new t}}},94:e=>{function t(e){let t=e.toString(16);return t.length<2&&(t="0"+t),t}e.exports={convertToByteArray:function(e){for(var t=[],r=(e.length,0);r<e.length;r+=2)t[r/2]=255&parseInt(e.substring(r,r+2),16);return t},camelToSnake:function(e){return e.replace(/[\w]([A-Z1-9])/g,(function(e){return e[0]+"_"+e[1]})).toUpperCase()},convertBytesToString:function(e){for(var r="",n=0;n<e.length;n++)r+=t(e[n]);return r},convertByteToString:t,decodeCondensed:function(e,t,r,n,i){return(e-i/2)/(((1<<n)-1-i)/(r-t))+t},convertNegativeInt:function(e,t){return e>127<<8*(t-1)&&(e-=1<<8*t),e}}}},t={},r=function r(n){var i=t[n];if(void 0!==i)return i.exports;var R=t[n]={exports:{}};return e[n](R,R.exports,r),R.exports}(44);driver=r})();