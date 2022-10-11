//  MIT License, see LICENSE.txt
//  Rewritten downlink decoding and encoding for Sensative Lora Strips
//

// Raw data decoder functions
const decodeU32dec = (n) => {
    return n.toString(10);
}

const decodeU32hex = (n) => {
    return 'Ox' + n.toString(16);
}

function d2h(d, bytes) {
    const size = bytes * 2;
    var hex = Number(d).toString(16);
    if (hex.length > size)
        hex = hex.substring(hex.length-size);
    while (hex.length < size)
        hex = '0' + hex;
    return hex;
}

const encodeU32hex = (value) => {
    const n = parseInt(value.substring(2), 16);
    return d2h(n, 4);
}

const encodeU32 = (value) => {
    return d2h(value, 4);
}

// Uplink data decoders

const EMPTY = {
    getsize: (bytes, pos) => 0,
    decode: (bytes, pos) => 0,
}

const UNSIGN1 = {
    getsize : (bytes, pos) => 1,
    decode  : (bytes, pos) => bytes[pos],
}
const UNS1FP2 = {
    getsize : (bytes, pos) => UNSIGN1.getsize(bytes, pos),
    decode  : (bytes, pos) => UNSIGN1.decode(bytes, pos) / 2,
}
const UNSIGN2 = {
    getsize : (bytes, pos) => { return 2; },
    decode  : (bytes, pos) => (bytes[pos++] << 8) + bytes[pos]
}
const SIGNED2 = {
    getsize : (bytes, pos) => 2,
    decode  : (bytes, pos) => ((bytes[pos] & 0x80 ? 0xFFFF<<16 : 0) | (bytes[pos++] << 8) | bytes[pos++])
}
const SI2FP10 = {
    getsize : (bytes, pos) => SIGNED2.getsize(bytes, pos),
    decode  : (bytes, pos) => SIGNED2.decode(bytes, pos)/10
}
const TMPALRM = {
    getsize : (bytes, pos) => 1,
    decode  : (bytes, pos) => { return {high: !!(bytes[pos] & 0x01), low: !!(bytes[pos] & 0x02)}; }
}
const DIGITAL = {
    getsize : (bytes, pos) => 1,
    decode  : (bytes, pos) => !!bytes[pos]
}
const GIT_IDD = {
    getsize : (bytes, pos) => 8,
    decode  : (bytes, pos) => { 
        return {
            version: d2h((bytes[pos++] << 24) + (bytes[pos++] << 16) + (bytes[pos++] << 8) + bytes[pos++], 4),
            idddata: d2h((bytes[pos++] << 24) + (bytes[pos++] << 16) + (bytes[pos++] << 8) + bytes[pos++], 4) }; }
}
const TEMPHUM = {
    getsize : (bytes, pos) => UNS1FP2.getsize(bytes, pos) + SI2FP10.getsize(bytes, pos+1),
    decode  : (bytes, pos) => { return { humidity: { value: UNS1FP2.decode(bytes, pos), unit:'%'}, temp: {value: SI2FP10.decode(bytes, pos+1), unit: 'C'}} ; }
}

const TEMPDOR = {
    getsize : (bytes, pos) => 3,
    decode  : (bytes, pos) => { return { door: {value: DIGITAL.decode(bytes, pos), unit: 'bool'}, temp: { value: SI2FP10.decode(bytes, pos+1), unit: 'C'}}; }
}

// Logical sensors connected to each report, may be used to define products in terms of what sensors are available
// and inversely, only select relevant setttings for a given product.
const STRIPS_SENSOR = {
    BUTTON:    1<<1,
    BATTERY:   1<<2,
    TEMP:      1<<3,
    HUMID:     1<<4,
    LUX:       1<<5,
    DOOR:      1<<6,
    TAMPER:    1<<7,
    CAP:       1<<8,
    PROX:      1<<9,
}

// All report types including what is required for decode and what sensors are required for each

const STRIPS_REPORTS = {
    CheckInConfirmed:       { reportbit:  0, sensors: STRIPS_SENSOR.BUTTON,                   coding: GIT_IDD, channel: 110, unit:''    },
    EmptyReport:            { reportbit: -1, sensors: STRIPS_SENSOR.BUTTON,                   coding: EMPTY,   channel: 0,   unit:''    },
    BatteryReport:          { reportbit:  1, sensors: STRIPS_SENSOR.BATTERY,                  coding: UNSIGN1, channel: 1,   unit:'%'   },
    TempReport:             { reportbit:  2, sensors: STRIPS_SENSOR.TEMP,                     coding: SI2FP10, channel: 2,   unit:'C'   },
    TempAlarm:              { reportbit:  3, sensors: STRIPS_SENSOR.TEMP,                     coding: TMPALRM, channel: 3,   unit:''    },
    AverageTempReport:      { reportbit:  4, sensors: STRIPS_SENSOR.TEMP,                     coding: SI2FP10, channel: 4,   unit:'C'   },
    AverageTempAlarm:       { reportbit:  5, sensors: STRIPS_SENSOR.TEMP,                     coding: TMPALRM, channel: 5,   unit:''    },
    HumidityReport:         { reportbit:  6, sensors: STRIPS_SENSOR.HUMID,                    coding: UNS1FP2, channel: 6,   unit:'%'   },
    LuxReport:              { reportbit:  7, sensors: STRIPS_SENSOR.LUX,                      coding: UNSIGN2, channel: 7,   unit:'Lux' },
    LuxReport2:             { reportbit:  8, sensors: STRIPS_SENSOR.LUX,                      coding: UNSIGN2, channel: 8,   unit:'Lux' },
    DoorReport:             { reportbit:  9, sensors: STRIPS_SENSOR.DOOR,                     coding: DIGITAL, channel: 9,   unit:''    },
    DoorAlarm:              { reportbit: 10, sensors: STRIPS_SENSOR.DOOR,                     coding: DIGITAL, channel: 10,  unit:''    },
    TamperReport:           { reportbit: 11, sensors: STRIPS_SENSOR.TAMPER,                   coding: DIGITAL, channel: 11,  unit:''    },
    TamperAlarm:            { reportbit: 12, sensors: STRIPS_SENSOR.TAMPER,                   coding: DIGITAL, channel: 12,  unit:''    },
    FloodReport:            { reportbit: 13, sensors: STRIPS_SENSOR.CAP,                      coding: UNSIGN1, channel: 13,  unit:''    },
    FloodAlarm:             { reportbit: 14, sensors: STRIPS_SENSOR.CAP,                      coding: DIGITAL, channel: 14,  unit:''    },
    FoilAlarm:              { reportbit: 15, sensors: STRIPS_SENSOR.CAP,                      coding: DIGITAL, channel: 15,  unit:''    },
    TempHumReport:          { reportbit: 16, sensors: STRIPS_SENSOR.TEMP|STRIPS_SENSOR.HUMID, coding: TEMPHUM, channel: 80,  unit:''    },
    AvgTempHumReport:       { reportbit: 17, sensors: STRIPS_SENSOR.TEMP|STRIPS_SENSOR.HUMID, coding: TEMPHUM, channel: 81,  unit:''    },
    TempDoorReport:         { reportbit: 18, sensors: STRIPS_SENSOR.TEMP|STRIPS_SENSOR.DOOR,  coding: TEMPDOR, channel: 82,  unit:''    },
    CapacitanceFloodReport: { reportbit: 19, sensors: STRIPS_SENSOR.CAP,                      coding: UNSIGN2, channel: 112, unit:''    },
    CapacitancePadReport:   { reportbit: 20, sensors: STRIPS_SENSOR.CAP,                      coding: UNSIGN2, channel: 113, unit:''    },
    CapacitanceEndReport:   { reportbit: 21, sensors: STRIPS_SENSOR.CAP,                      coding: UNSIGN2, channel: 114, unit:''    },
    UserSwitch1Alarm:       { reportbit: 22, sensors: STRIPS_SENSOR.TAMPER,                   coding: DIGITAL, channel: 16,  unit:''    },
    DoorCountReport:        { reportbit: 23, sensors: STRIPS_SENSOR.DOOR,                     coding: UNSIGN2, channel: 17,  unit:''    },
    PresenceReport:         { reportbit: 24, sensors: STRIPS_SENSOR.PROX,                     coding: DIGITAL, channel: 18,  unit:''    },
    IRProximityReport:      { reportbit: 25, sensors: STRIPS_SENSOR.PROX,                     coding: UNSIGN2, channel: 19,  unit:''    },
    IRCloseProximityReport: { reportbit: 26, sensors: STRIPS_SENSOR.PROX,                     coding: UNSIGN2, channel: 20,  unit:''    },
    CloseProximityAlarm:    { reportbit: 27, sensors: STRIPS_SENSOR.PROX,                     coding: DIGITAL, channel: 21,  unit:''    },
    DisinfectAlarm:         { reportbit: 28, sensors: STRIPS_SENSOR.PROX,                     coding: UNSIGN1, channel: 22,  unit:''    },
}


const decodeReports = (n) => {
    let result = '';
    for (var report in STRIPS_REPORTS) {
        if (n & (1 << STRIPS_REPORTS[report].reportbit)) {
            if (result != '')
                result += '|';
            result += report;
        }
    }
    return result;
}

const encodeReports = (str) => {
    const list = str.split('|');
    let res = 0;
    list.map((item) => {
        if (item.length > 0) {
            if (!STRIPS_REPORTS.hasOwnProperty(item))
                throw {message:'Invalid report id: ' + item};
            res |= (1<<STRIPS_REPORTS[item].reportbit)
        }
    });
    return d2h(res, 4);
}

const SENSOR_CONFIG_BITS = {
    INVERT_DOOR:            (1<<0),
    HIGH_POWER_PROXIMITY:   (1<<1),
}

const decodeConfig = (n) => {
    let r = '';
    for (let bitname in SENSOR_CONFIG_BITS)
        if (n & SENSOR_CONFIG_BITS[bitname]) {
            if (r!='') r+='|';
            r+=bitname;
        }
    return r;
}

const encodeConfig = (str) => {
    const list = str.split('|');
    let res = 0;
    list.map((item) => {
        for (let bitname in SENSOR_CONFIG_BITS) {
            if (item == bitname)
                res |= SENSOR_CONFIG_BITS[bitname];
        }
    });
    return d2h(res, 4);
}

// Settings metadata
const STRIPS_SETTINGS = {
    NONE                              : { id: 0x00, unit: 'none',        decode: decodeU32hex,  encode: encodeU32hex,  name:'None'},
    VERSION                           : { id: 0x01, unit: 'version',     decode: decodeU32hex,  encode: encodeU32hex,  name:'Version'  },
    BASE_POLL_INTERVAL                : { id: 0x02, unit: 'ms',          decode: decodeU32dec,  encode: encodeU32,     name:'Base poll interval'  },
    REPORTS_ENABLED                   : { id: 0x03, unit: 'reports',     decode: decodeReports, encode: encodeReports, name:'Reports enabled'},
    TEMP_POLL_INTERVAL                : { id: 0x04, unit: 's',           decode: decodeU32dec,  encode: encodeU32,     name:'Temp poll interval'  },
    TEMP_SEND_IMMEDIATELY_TRESHOLD    : { id: 0x05, unit: 'mC',          decode: decodeU32dec,  encode: encodeU32,     name:'Temp send immediately treshold'  },
    TEMP_SEND_THROTTLED_TRESHOLD      : { id: 0x06, unit: 'mC',          decode: decodeU32dec,  encode: encodeU32,     name:'Temp send throttled treshold'  },
    TEMP_SEND_THROTTLED_TIME          : { id: 0x07, unit: 's',           decode: decodeU32dec,  encode: encodeU32,     name:'Temp send throttled time'  },
    TEMP_LOW_ALARM                    : { id: 0x08, unit: 'mC',          decode: decodeU32dec,  encode: encodeU32,     name:'Temp low alarm'  },
    TEMP_HIGH_ALARM                   : { id: 0x09, unit: 'mC',          decode: decodeU32dec,  encode: encodeU32,     name:'Temp high alarm'  },
    TEMP_ALARM_HYSTERESIS             : { id: 0x0A, unit: 'mC',          decode: decodeU32dec,  encode: encodeU32,     name:'Temp alarm hysteresis' },
    AVGTEMP_AVERAGE_TIME              : { id: 0x0B, unit: 's',           decode: decodeU32dec,  encode: encodeU32,     name:'Average temp average time' },
    AVGTEMP_MIN_TEMP                  : { id: 0x0C, unit: 'mC',          decode: decodeU32dec,  encode: encodeU32,     name:'Average temp min temp'  },
    AVGTEMP_SEND_IMMEDIATELY_TRESHOLD : { id: 0x0D, unit: 'mC',          decode: decodeU32dec,  encode: encodeU32,     name:'Averate temp send immediately treshold'  },
    AVGTEMP_LOW_ALARM                 : { id: 0x0E, unit: 'mC',          decode: decodeU32dec,  encode: encodeU32,     name:'Average temp low alarm'  },
    AVGTEMP_HIGH_ALARM                : { id: 0x0F, unit: 'mC',          decode: decodeU32dec,  encode: encodeU32,     name:'Average temp high alarm'  },
    AVGTEMP_ALARM_HYSTERESIS          : { id: 0x10, unit: 'mC',          decode: decodeU32dec,  encode: encodeU32,     name:'Average temp hysteresis'  },
    HUMIDITY_POLL_INTERVAL            : { id: 0x11, unit: 's',           decode: decodeU32dec,  encode: encodeU32,     name:'Humidity poll interval'  },
    HUMIDITY_TRESHOLD                 : { id: 0x12, unit: '%',           decode: decodeU32dec,  encode: encodeU32,     name:'Humidity treshold'  },
    LUX_POLL_INTERVAL                 : { id: 0x13, unit: 's',           decode: decodeU32dec,  encode: encodeU32,     name:'Lux poll interval'  },
    LUX_HIGH_LEVEL_1                  : { id: 0x14, unit: 'Lux',         decode: decodeU32dec,  encode: encodeU32,     name:'Lux high level 1'  },
    LUX_LOW_LEVEL_1                   : { id: 0x15, unit: 'Lux',         decode: decodeU32dec,  encode: encodeU32,     name:'Lux low level 1'  },
    LUX_HIGH_LEVEL_2                  : { id: 0x16, unit: 'Lux',         decode: decodeU32dec,  encode: encodeU32,     name:'Lux high level 2'  },
    LUX_LOW_LEVEL_2                   : { id: 0x17, unit: 'Lux',         decode: decodeU32dec,  encode: encodeU32,     name:'Lux low level 2'  },
    FLOOD_POLL_INTERVAL               : { id: 0x18, unit: 's',           decode: decodeU32dec,  encode: encodeU32,     name:'Flood poll interval'  },
    FLOOD_CAPACITANCE_MIN             : { id: 0x19, unit: 'capacitance', decode: decodeU32dec,  encode: encodeU32,     name:'Flood capacitance min'  },
    FLOOD_CAPACITANCE_MAX             : { id: 0x1A, unit: 'capacitance', decode: decodeU32dec,  encode: encodeU32,     name:'Flood capacitance max'  },
    FLOOD_REPORT_INTERVAL             : { id: 0x1B, unit: 's',           decode: decodeU32dec,  encode: encodeU32,     name:'Flood report interval'  },
    FLOOD_ALARM_TRESHOLD              : { id: 0x1C, unit: '%',           decode: decodeU32dec,  encode: encodeU32,     name:'Flood alarm treshold'  },
    FLOOD_ALARM_HYSTERESIS            : { id: 0x1D, unit: '%',           decode: decodeU32dec,  encode: encodeU32,     name:'Flood alarm hysteresis'  },
    SETTINGS_FOIL_TRESHOLD            : { id: 0x1E, unit: 'capacitance', decode: decodeU32dec,  encode: encodeU32,     name:'Foil treshold'  },
    CAPACITANCE_FLOOD_REPORT_INTERVAL : { id: 0x1F, unit: 's',           decode: decodeU32dec,  encode: encodeU32,     name:'Cap flood report interval'  },
    CAPACITANCE_PAD_REPORT_INTERVAL   : { id: 0x20, unit: 's',           decode: decodeU32dec,  encode: encodeU32,     name:'Cap pad report interval'  },
    CAPACITANCE_END_REPORT_INTERVAL   : { id: 0x21, unit: 's',           decode: decodeU32dec,  encode: encodeU32,     name:'Cap end report interval'  },
    SENSORS_COMBINED_1                : { id: 0x22, unit: 'reports',     decode: decodeReports, encode: encodeReports, name:'Combined sensors 1'  },
    SENSORS_COMBINED_2                : { id: 0x23, unit: 'reports',     decode: decodeReports, encode: encodeReports, name:'Combined sensors 2' },
    SENSORS_COMBINED_3                : { id: 0x24, unit: 'reports',     decode: decodeReports, encode: encodeReports, name:'Combined sensors 3' },
    HISTORY_REPORTS                   : { id: 0x25, unit: 'reports',     decode: decodeReports, encode: encodeReports, name:'History reports' },
    DEMO_TRYJOIN_INTERVAL             : { id: 0x26, unit: 'min',         decode: decodeU32dec,  encode: encodeU32,     name:'Try join interval'  },
    LUX_PLASTIC_COMP                  : { id: 0x27, unit: '%',           decode: decodeU32dec,  encode: encodeU32,     name:'Lux plastic comp'  },
    LORA_DATA_RATE                    : { id: 0x28, unit: 'datarate',    decode: decodeU32dec,  encode: encodeU32,     name:'Lora data rate'  },
    LED_LEVEL                         : { id: 0x29, unit: 'ledlevel',    decode: decodeU32dec,  encode: encodeU32,     name:'Led level'  },
    LINK_CHECK_INTERVAL               : { id: 0x2A, unit: 'unknown',     decode: decodeU32dec,  encode: encodeU32,     name:'Link check interval'  },
    RESEND_RESET_TIME                 : { id: 0x2B, unit: 'unknown',     decode: decodeU32dec,  encode: encodeU32,     name:'Resend reset time'  },
    LUX_LOW_CUTOFF                    : { id: 0x2C, unit: 'lux',         decode: decodeU32dec,  encode: encodeU32,     name:'Lux low cutoff'  },
    DOOR_COUNT_REPORT_INTERVAL        : { id: 0x2D, unit: 's',           decode: decodeU32dec,  encode: encodeU32,     name:'Door count interval'  },
    IR_PROXIMITY_REPORT_INTERVAL      : { id: 0x2E, unit: 's',           decode: decodeU32dec,  encode: encodeU32,     name:'IR Proximity report interval'  },
    PRESENCE_POLL_INTERVAL            : { id: 0x2F, unit: 's',           decode: decodeU32dec,  encode: encodeU32,     name:'Presence poll interval'  },
    PRESENCE_TRESHOLD                 : { id: 0x30, unit: 'reflection',  decode: decodeU32dec,  encode: encodeU32,     name:'Presence treshold'  },
    PRESENCE_TIMEOUT                  : { id: 0x31, unit: 's',           decode: decodeU32dec,  encode: encodeU32,     name:'Presence timeout'  },
    SENSOR_CONFIGURATION              : { id: 0x32, unit: 'config',      decode: decodeConfig,  encode: encodeConfig,  name:'Sensor configuration'},
}

const STRIPS_PROFILES = {
    DEFAULT              : { id: 0x00, name: 'Default' },
    COMFORT_TEMP         : { id: 0x01, name: 'Comfort Temp' },
    COMFORT_TEMP_LUX     : { id: 0x02, name: 'Comfort Temp and Lux' },
    COMFORT_AVGTEMP      : { id: 0x03, name: 'Comfort Average Temp' },
    GUARD_STD            : { id: 0x04, name: 'Guard Standard' },
    DRIP_STD             : { id: 0x05, name: 'Drip Standard' },
    PRESENCE_OFFICE      : { id: 0x06, name: 'Presence Office' },
    PRESENCE_PUBLIC      : { id: 0x07, name: 'Presence Public' },
    DISINFECT_OFFICE     : { id: 0x08, name: 'Disinfect Office' },
    CLOSE_PROXIMITY_SLOW : { id: 0x09, name: 'Close Proximity Slow' },
    ALL_CAP_SENSORS_RAW  : { id: 0xF0, name: 'All cap sensors raw' },
}

function decodeSetSetting(bytes, pos) {
    var result = new Object();
    if (pos == bytes.end)
        throw {message: "No settings to set"};

    while (pos < bytes.length) {
        if (bytes.length < pos + 5)
            throw {message: "Set settings: Bad data size"}
        const id = bytes[pos++];
        const val = (bytes[pos++] << 24) + (bytes[pos++] << 16) + (bytes[pos++] << 8) + bytes[pos++];
        let bFound = false;
        for (var setting in STRIPS_SETTINGS) {
            if (STRIPS_SETTINGS[setting].id == id) {
                bFound = true;
                result[setting] = {id:id, name: STRIPS_SETTINGS[setting].name, unit: STRIPS_SETTINGS[setting].unit, value: STRIPS_SETTINGS[setting].decode(val)}
            }
        }
        if (false == bFound)
            throw {message:"Unknown setting: " + id};
    }
    return result;
}

// Encode settings, ignore fields that are not same as a particular setting name
function encodeSetSetting(obj) {
    var res = '';
    for (var field in obj)
        if (STRIPS_SETTINGS.hasOwnProperty(field))
            res += d2h(STRIPS_SETTINGS[field].id,1) + STRIPS_SETTINGS[field].encode(obj[field].value);
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
        throw {message: "Get settings: Unknown setting " + id};

    result[setting] = {id:id, name: setting, unit:STRIPS_SETTINGS[setting].unit}
    return result;
}

// Assume object has a number of fields names corresponding to STRIPS_SETTINGS fields. 
// Ignores fields that do not have corresponding setting
function encodeGetSetting(obj) {
    let res = '';
    for (var field in obj)
        for (var setting in STRIPS_SETTINGS)
            if (field == setting) {
                res += d2h(STRIPS_SETTINGS[setting].id, 1);
                continue;
            }
    return res;
}

// 2 bytes first, 2 bytes last history sequence number
function decodeGetHistory(bytes, pos) {
    if (bytes.length != 5)
        throw {message: 'Get history command: Bad package size'}
    const first = (bytes[pos++] << 8) + bytes[pos++];
    const last  = (bytes[pos++] << 8) + bytes[pos++];
    return {first:first, last:last, unit:'History sequence number'};
}

function encodeGetHistory(obj) {
    if (false == obj.hasOwnProperty('first') || false == obj.hasOwnProperty('last'))
        throw {message:'Expected properties first and last missing'}
    return d2h(obj.first,2) + d2h(obj.last,2);
}


function decodeSetProfile(bytes, pos) {
    if (bytes.length != 2)
        throw {message: 'Set profile command: Bad package size'}
    const profile = bytes[pos++];
    for (var id in STRIPS_PROFILES)
        if (STRIPS_PROFILES[id].id == profile)
            return {profile: STRIPS_PROFILES[id].name, id:id}
    throw {message: 'Unknown profile ' + profile}
}

// Checks profile ID
function encodeSetProfile(obj) {
    if (false == obj.hasOwnProperty('id'))
        throw {message:'Profile id is missing'};
    const profile = obj.id;
    if (false == STRIPS_PROFILES.hasOwnProperty(profile))
        throw {message:'Unknown profile ' + profile};
    return d2h(STRIPS_PROFILES[profile].id, 1);
}

function decodeCmdUnjoin(bytes, pos) {
    if (bytes.length != 3)
        throw {message: 'Unjoin command: Bad package size'}
    const minutes = (bytes[pos++] << 8) + bytes[pos++];
    return {minutes: minutes};
} 

function encodeCmdUnjoin(obj) {
    if (false == obj.hasOwnProperty('minutes'))
        throw {message: 'Unjoin requires minutes field'};
    return d2h(obj.minutes, 2);
}

function decodeEndComp(bytes, pos) {
    if (1 != bytes.length)
        throw {message: 'End compliance test: Bad package size'}
    return {};
}

// No data for this command
function encodeEndComp(obj) {
    return '';
}

const STRIPS_PORTCOMMANDS = {
    SET_SETTING : { port: 11,  cmd: 1, decode: decodeSetSetting, encode: encodeSetSetting, name: 'Set setting'          },
    GET_SETTING : { port: 11,  cmd: 2, decode: decodeGetSetting, encode: encodeGetSetting, name: 'Get setting'          },
    GET_HISTORY : { port: 2,   cmd: 1, decode: decodeGetHistory, encode: encodeGetHistory, name: 'Get history'          },
    SET_PROFILE : { port: 10,  cmd: 1, decode: decodeSetProfile, encode: encodeSetProfile, name: 'Set profile'          },
    CMD_UNJOIN  : { port: 10,  cmd: 8, decode: decodeCmdUnjoin,  encode: encodeCmdUnjoin,  name: 'Unjoin'               },
    CMD_ENDCOMP : { port: 224, cmd: 6, decode: decodeEndComp,    encode: encodeEndComp,    name: 'End compliance test'  },
}

const getReportFromByte = channel => {
    for (let report in STRIPS_REPORTS) 
        if (STRIPS_REPORTS[report].channel == channel)
            return report;
    throw { message: 'Unknown channel: ' + channel };
}

const decodeAndPackItem = (report, bytes, pos, hpos) => {
    const decodedItem = report.coding.decode(bytes, pos);
    let decoded;
    if (typeof decodedItem === 'object')
        decoded = decodedItem;
    else 
        decoded = { value: decodedItem, unit: report.unit }
    if (hpos != null) 
        decoded.historyPosition = hpos;
    return decoded;
}

const decodeDirectUplink = (bytes) => {
    if (bytes.length < 2)
        throw ('message: Too few bytes');
    let pos = 0;
    const hCount = (bytes[pos++]<<8) | bytes[pos++]; // First history sequence number
    let decoded = {};
    decoded.historyStart = hCount;
    let historyPosition = hCount;
    while (pos < bytes.length) {
        // First a byte with a history bit and a channel ID, record history item count
        let itemHistoryPosition = null;
        if (bytes[pos] & 0x80)
            itemHistoryPosition = historyPosition--;
        const reportName = getReportFromByte(bytes[pos++] & 0x7f);
        const report     = STRIPS_REPORTS[reportName];
        const size       = report.coding.getsize(bytes, pos);
        const nextpos    = pos + size;
        if (nextpos > bytes.length)
            throw {message: 'Incomplete data'};
        decoded[reportName] = decodeAndPackItem(report, bytes, pos, itemHistoryPosition);
        pos = nextpos;
    }
    return [decoded];
}

const decodeHistoryUplink = (bytes) => {
    let pos = 0;
    let reports = [];
    let now = new Date().getTime();
    if (bytes.length < 2)
        throw { message: 'Too small history package'};

    // First sequence number
    let sequence = (bytes[pos++] << 8) | bytes[pos++];

    while (pos < bytes.length - 5 /* 4 time offset, 1 channel */ ) {
        let timeOffsetMS = 1000*((bytes[pos++]<<24) | (bytes[pos++]<<16) | (bytes[pos++]<<8) | bytes[pos++]);
        const reportName = getReportFromByte(bytes[pos++] & 0x7f);
        const report     = STRIPS_REPORTS[reportName];
        const size       = report.coding.getsize(bytes, pos);
        const nextpos    = pos + size;
        if (nextpos > bytes.length)
            throw {message: 'Incomplete data'};
        let decoded       = {};
        decoded.timestamp = now-timeOffsetMS;
        decoded[report] = decodeAndPackItem(report, bytes, pos, sequence++);
        reports.push(decoded);
        pos = nextpos;
    }
    if (pos != bytes.length)
        throw {message: 'Invalid history package size'};
    return reports;
}

const STATUS_CODES = [
    'OK',                 // 0
    'Bad setting',        // 1
    'Bad payload length', // 2
    'Value not accepted', // 3
    'Unknown command'     // 4
];

const decodeSettingsUplink = (bytes) => {
    let pos = 0;
    let result = [];
    let now = new Date().getTime();
    if ( bytes.length < 1)
        throw { message: 'To small settings package' };
    
    while (pos < bytes.length) {
        let kind = bytes[pos++];
        if (2 == kind) {
            // One or several requested setting values
            if (pos+5 < bytes.length)
                throw { message: 'Incomplete settings data' };
            
            const id = bytes[pos++];
            const setting = getSettingById(id);
            if (null == setting)
                throw { message: 'Unknown setting id ' + id };
            let decoded      = {};
            decoded[setting] = { 
                id: id, 
                value: ((bytes[pos++]<<24) | (bytes[pos++]<<16) | (bytes[pos++]<<8) | bytes[pos++]),
                unit: STRIPS_SETTINGS[setting].unit
            };
            result.push(decoded);
        }
        else if (3 == kind) {
            // a single status code from the device when applying settings
            if (pos + 1 != bytes.length)
                throw { message: 'Bad status code message length'}
            const status = bytes[pos++];
            if (status >= STATUS_CODES.length)
                throw { message: 'Unknown status code: ' + status };
            decoded = {};
            decoded['statusCode'] = { value: status, status: STATUS_CODES[status]};
            result.push(decoded);
        } else 
            throw { message: 'Unknown settings uplink format: ' + kind }
    }
    return result;
}

const STRIPS_UPLINK_PORTS = {
    DIRECT_PORT:   { port: 1,  decode: decodeDirectUplink  },
    HISTORY_PORT:  { port: 2,  decode: decodeHistoryUplink },
    SETTINGS_PORT: { port: 11, decode: decodeSettingsUplink  },
}

// Attempt at decoding an uplink (reference is in raw-translate.js)
const decodeLoraStripsUplink = (port, bytes) => {
    let pos = 0;
    for (let kind in STRIPS_UPLINK_PORTS)
        if (STRIPS_UPLINK_PORTS[kind].port == port)
            return STRIPS_UPLINK_PORTS[kind].decode(bytes);
    throw ("No function for decoding uplinks on port " + port);
}


// Either return a structure representing the downlink, or throw an error with message corresponding to the problem
const decodeLoraStripsDownlink = (port, bytes) => {
    if (bytes == null || bytes.length < 1)
        throw { message: 'Not enough data'};
    const cmd = bytes[0];
    for (var id in STRIPS_PORTCOMMANDS) {
        if (STRIPS_PORTCOMMANDS[id].port == port && STRIPS_PORTCOMMANDS[id].cmd == cmd) {
            let result  = STRIPS_PORTCOMMANDS[id].decode(bytes, 1);
            result['cmd'] = STRIPS_PORTCOMMANDS[id];
            return result;
        }
    }
    throw { message: 'Unrecognized downlink'};
}

// Function for encoding a downlink (using object of same format as decodeLoraStripsDownlink),
// Specifically: each field is one of STRIPS_SETTINIGS properties. Only value field is read from each in case of SET_SETTING.
// In addition a "cmd" field should be present to match one of the PORT_COMMANDS. See each function for further data.
const encodeLoraStripsDownlink = (obj) => {
    if (null == obj || false == obj.hasOwnProperty('cmd'))
        throw {message:'Bad object for encode, null or missing cmd.'}
    const cmd = obj['cmd'].name;
    for (var c in STRIPS_PORTCOMMANDS) {
        if (cmd == STRIPS_PORTCOMMANDS[c].name) {
            return { data: d2h(STRIPS_PORTCOMMANDS[c].cmd, 1) + STRIPS_PORTCOMMANDS[c].encode(obj), 
                     port: STRIPS_PORTCOMMANDS[c].port };
        }
    }
    throw {message: 'Unknown command: ' + cmd}
}

// Legacy translator
// const rawTranslate = require('./raw-translate');

const test_modes = {
    d: { name: 'downlink',          func: (port, data) => decodeLoraStripsDownlink(port, data) },
    u: { name: 'uplink',            func: (port, data) => decodeLoraStripsUplink(port, data) },
    // l: { name: 'legacy uplink',     func: (port, data) => rawTranslate(data, port) },
}

// Test/example use code follows
function test2(rl) {
    rl.question('Select mode (' + Object.keys(test_modes).map(k=>k + '=' + test_modes[k].name) + '): ', mode => {
        if (!test_modes[mode]) {
            console.log('** Unknown mode: ' + mode);
            test2(rl);
            return;
        }
        const func = test_modes[mode].func;
        const name = test_modes[mode].name;
        rl.question('Enter '+ name +' port (decimal): ', (port) => {
            port = Number(port);
            rl.question('Enter ' + name +' (hex format): ', (hex) => { 
                try {
                    let trimmed = hex.replace(/\s/g, "");
                    let data = Buffer.from(trimmed, "hex");
                    let decoded = func(port, data);
                    console.log(JSON.stringify(decoded));
                } catch (err) { console.log(err); }
                test2(rl); // Ugly tail recursion, happens callback style
            })
        })
    })
}

function commandLineTest() {
    let readline = null;
    try {
        readline = require("readline");
    } catch (e) { console.log(e) };
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    test2(rl);
}

// These functions are exported from this
exports.decodeLoraStripsDownlink = decodeLoraStripsDownlink;
exports.decodeLoraStripsUplink   = decodeLoraStripsUplink;
exports.encodeLoraStripsDownlink = encodeLoraStripsDownlink;
exports.commandLine              = commandLineTest;
// exports.rawTranslate             = rawTranslate;
