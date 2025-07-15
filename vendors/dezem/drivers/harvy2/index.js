// ############################################################
// _ .-') _      ('-.      .-') _     ('-.    _   .-')
// ( (  OO) )   _(  OO)    (  OO) )  _(  OO)  ( '.( OO )_
//  \     .'_  (,------. ,(_)----.  (,------.  ,--.   ,--.)
//  ,`'--..._)  |  .---' |       |   |  .---'  |   `.'   |
//  |  |  \  '  |  |     '--.   /    |  |      |         |
//  |  |   ' | (|  '--.  (_/   /    (|  '--.   |  |'.'|  |
//  |  |   / :  |  .--'   /   /___   |  .--'   |  |   |  |
//  |  '--'  /  |  `---. |        |  |  `---.  |  |   |  |
//  `-------'   `------' `--------'  `------'  `--'   `--'
// deZem GmbH
// ############################################################
// #################### IMPORTANT INFO  #######################
// ############################################################
// Platform: The Things Stack (TTS)
// ############################################################
// #################### IMPORTANT INFO  #######################
// ############################################################
// Version : 1.1.0 (2024-09-10)
// Decoder : port 6 (v0.6 payload)
//           port 10 (v1.0 payload)
//           port 30 (counter message)
//           port 31 (counter message)
//           port 99 (reboot message)
//
// Changelog:
// v1.1.0
// - add rogowski_flag
// ############################################################
// ######################### PARSER  ##########################
// ############################################################

const CONF_LE = true;

const TYPE_U8 = 0;
const TYPE_U16 = 1;
const TYPE_U32 = 2;
const TYPE_U64 = 3;

const TYPE_I8 = 4;
const TYPE_I16 = 5;
const TYPE_I32 = 6;
const TYPE_I64 = 7;

const TYPE_F16 = 8;
const TYPE_F32 = 9;
const TYPE_F64 = 10;

const TYPE_Q8 = 11;
const TYPE_Q16 = 12;
const TYPE_Q32 = 13;

const SIZE_OF_TYPE = [1, 2, 4, 8, 1, 2, 4, 8, 2, 4, 8, 1, 2, 4];

function num_to_fixed(x, digits) {
    return Number(x.toFixed(digits));
}
function uint16_BE(bytes, idx) {
    bytes = bytes.slice(idx || 0);
    return (bytes[0] << 8 | bytes[1] << 0);
}
function uint16_LE(bytes, idx) {
    bytes = bytes.slice(idx || 0);
    return (bytes[1] << 8 | bytes[0] << 0);
}
function uint32_LE(bytes, idx) {
    bytes = bytes.slice(idx || 0);
    return (bytes[3] << 24 | bytes[2] << 16 | bytes[1] << 8 | bytes[0] << 0);
}

function signed(val, bits) {
    if ((val & 1 << (bits - 1)) > 0) {
        var mask = Math.pow(2, bits) - 1;
        val = (~val & mask) + 1;
        val = val * -1;
    }
    return val;
}
function int16_BE(bytes, idx) {
    bytes = bytes.slice(idx || 0);
    return signed(bytes[0] << 8 | bytes[1] << 0, 16);
}
function int16_LE(bytes, idx) {
    bytes = bytes.slice(idx || 0);
    return signed(bytes[1] << 8 | bytes[0] << 0, 16);
}
function int8(bytes, idx) {
    bytes = bytes.slice(idx || 0);
    return signed(bytes[0], 8);
}

function float16_LE(bytes) {
    const h = bytes[1] << 8 | bytes[0];
    const s = (h & 0x8000) >> 15;
    const e = (h & 0x7c00) >> 10;
    const f = h & 0x03ff;

    if (e === 0) {
        return ((s ? -1 : 1) * 0.00006103515625 * (f / 1024.0));
    }

    if (e === 0x1f) {
        return f ? NaN : (s ? -1 : 1) * Infinity;
    }

    return (s ? -1 : 1) * Math.pow(2, (e - 15)) * (1 + f / 1024.0);
}

function decodeType(bytes, type) {
    switch (type) {
        case TYPE_U8:
            return bytes[0];
        case TYPE_U16:
            return new DataView(new Uint8Array(bytes).buffer).getUint16(0, CONF_LE);
        case TYPE_U32:
            return new DataView(new Uint8Array(bytes).buffer).getUint32(0, CONF_LE);
        case TYPE_I8:
            return new DataView(new Uint8Array(bytes).buffer).getInt8(0);
        case TYPE_I16:
            return new DataView(new Uint8Array(bytes).buffer).getInt16(0, CONF_LE);
        case TYPE_I32:
            return new DataView(new Uint8Array(bytes).buffer).getInt32(0, CONF_LE);
        case TYPE_F16:
            return float16_LE(bytes);
        case TYPE_F32:
            return new DataView(new Uint8Array(bytes).buffer).getFloat32(0, CONF_LE);
        case TYPE_F64:
            return new DataView(new Uint8Array(bytes).buffer).getFloat64(0, CONF_LE);
    }
    return undefined;
}

function createBitSetMap(uint8array, confMap) {
    const map = new Map();
    for (let i = 0; i < uint8array.length; i++) {
        for (let n = 0; n < 8; n++) {
            const idx = i * 8 + n;
            const isSet = ((uint8array[i] & (1 << n)) !== 0);
            if (Boolean(confMap[idx])) {
                map.set(confMap[idx], isSet);
            }
        }
    }
    return map;
}

function parseChannels(bytes, confMap, chanMask, chanName, chanType, chanScale, chanOffset) {
    const map = new Map();
    let idx = 0;
    for (let i = 0; i < chanMask.length; i++) {
        if (Boolean(confMap.get(chanMask[i]))) {
            let val = (decodeType(bytes.slice(idx), chanType[i]) * chanScale[i]) + chanOffset[i];
            map.set(chanName[i], val);
            idx += SIZE_OF_TYPE[chanType[i]];
        }
    }
    return map;
}

function decodePort6(bytes) {
    const c0_mA = uint16_LE(bytes, 6) / 40;
    const c1_mA = uint16_LE(bytes, 8) / 40;
    const c2_mA = uint16_LE(bytes, 10) / 40;
    const c3_mA = uint16_LE(bytes, 12) / 40;
    const voltage_ac = uint16_LE(bytes, 30) / 10.0;
    const power_s_1 = ((c0_mA * 2) * voltage_ac) || 0;
    const power_s_2 = ((c1_mA * 2) * voltage_ac) || 0;
    const power_s_3 = ((c2_mA * 2) * voltage_ac) || 0;

    const cosphi_3_0 = int8(bytes, 32) / 100.0;
    const cosphi_3_1 = int8(bytes, 33) / 100.0;
    const cosphi_3_2 = int8(bytes, 34) / 100.0;
    const power_p_1 = power_s_1 * cosphi_3_0;
    const power_p_2 = power_s_2 * cosphi_3_1;
    const power_p_3 = power_s_3 * cosphi_3_2;

    const power_q_1 = (Math.sqrt((power_s_1 * power_s_1) - (power_p_1 * power_p_1))) || 0;
    const power_q_2 = (Math.sqrt((power_s_2 * power_s_2) - (power_p_2 * power_p_2))) || 0;
    const power_q_3 = (Math.sqrt((power_s_3 * power_s_3) - (power_p_3 * power_p_3))) || 0;

    return {
        "vbat": uint16_LE(bytes, 2) / 1000,
        "vsys_V": uint16_LE(bytes, 2) / 1000,
        "temp": int16_LE(bytes, 4) / 10,
        "temp_C": int16_LE(bytes, 4) / 10,
        "c0_rms": uint16_LE(bytes, 6) / 100,
        "c1_rms": uint16_LE(bytes, 8) / 100,
        "c2_rms": uint16_LE(bytes, 10) / 100,
        "c3_rms": uint16_LE(bytes, 12) / 100,
        "c0_mA": c0_mA,
        "c1_mA": c1_mA,
        "c2_mA": c2_mA,
        "c3_mA": c3_mA,
        "in1_ac_curr_A": num_to_fixed(c0_mA * 2, 5),
        "in2_ac_curr_A": num_to_fixed(c1_mA * 2, 5),
        "in3_ac_curr_A": num_to_fixed(c2_mA * 2, 5),
        "in4_ac_curr_A": num_to_fixed(c3_mA * 2, 5),
        "c0_avg": int16_LE(bytes, 14) / 100,
        "c1_avg": int16_LE(bytes, 16) / 100,
        "c2_avg": int16_LE(bytes, 18) / 100,
        "c3_avg": int16_LE(bytes, 20) / 100,
        "in1_dc_curr_A": int16_LE(bytes, 14) / 100000,
        "in2_dc_curr_A": int16_LE(bytes, 16) / 100000,
        "in3_dc_curr_A": int16_LE(bytes, 18) / 100000,
        "in4_dc_curr_A": int16_LE(bytes, 20) / 100000,
        "c0_freq": uint16_LE(bytes, 22) / 100.0,
        "c1_freq": uint16_LE(bytes, 24) / 100.0,
        "c2_freq": uint16_LE(bytes, 26) / 100.0,
        "c3_freq": uint16_LE(bytes, 28) / 100.0,
        "in1_grid_freq_Hz": uint16_LE(bytes, 22) / 100.0,
        "in2_grid_freq_Hz": uint16_LE(bytes, 24) / 100.0,
        "in3_grid_freq_Hz": uint16_LE(bytes, 26) / 100.0,
        "in4_grid_freq_Hz": uint16_LE(bytes, 28) / 100.0,
        "cosphi_3_0": cosphi_3_0,
        "cosphi_3_1": cosphi_3_1,
        "cosphi_3_2": cosphi_3_2,
        voltage_ac,
        "in4_grid_voltage_VAC": voltage_ac,
        "in1_cos": cosphi_3_0,
        "in2_cos": cosphi_3_1,
        "in3_cos": cosphi_3_2,
        power_p_1,
        power_p_2,
        power_p_3,
        "in1_pow_W": power_p_1,
        "in2_pow_W": power_p_2,
        "in3_pow_W": power_p_3,
        power_s_1,
        power_s_2,
        power_s_3,
        "in1_a_pow_VA": power_s_1,
        "in2_a_pow_VA": power_s_2,
        "in3_a_pow_VA": power_s_3,
        power_q_1,
        power_q_2,
        power_q_3,
        "in1_r_pow_VAR": num_to_fixed(power_q_1, 2),
        "in2_r_pow_VAR": num_to_fixed(power_q_2, 2),
        "in3_r_pow_VAR": num_to_fixed(power_q_3, 2)
    };
}

function decodePort30(bytes) {
    const BITSET_BYTE_0 = ["in1_power_en", "in1_cosphi_en", null, null, null, null, null, null];
    const BITSET_BYTE_1 = ["in2_power_en", "in2_cosphi_en", null, null, null, null, null, null];
    const BITSET_BYTE_2 = ["in3_power_en", "in3_cosphi_en", null, null, null, null, null, null];
    const BITSET = [...BITSET_BYTE_0, ...BITSET_BYTE_1, ...BITSET_BYTE_2];

    const CHAN_NAME_SYSTEM = ["in_ctr_count"];
    const CHAN_MASK_SYSTEM = ["dummy"];
    const CHAN_TYPE_SYSTEM = [TYPE_U32];
    const CHAN_SCAL_SYSTEM = [1.0];
    const CHAN_OFFS_SYSTEM = [0];
    const CHAN_FIXD_SYSTEM = [0];


    const CHAN_NAME_IN1 = ["in1_kWh", "in1_cosphi"];
    const CHAN_MASK_IN1 = ["in1_power_en", "in1_cosphi_en"];
    const CHAN_TYPE_IN1 = [TYPE_I32, TYPE_F16];
    const CHAN_SCAL_IN1 = [0.01, 1.0];
    const CHAN_OFFS_IN1 = [0, 0];
    const CHAN_FIXD_IN1 = [2, 3];


    const CHAN_NAME_IN2 = ["in2_kWh", "in2_cosphi"];
    const CHAN_MASK_IN2 = ["in2_power_en", "in2_cosphi_en"];
    const CHAN_TYPE_IN2 = [TYPE_I32, TYPE_F16];
    const CHAN_SCAL_IN2 = [0.01, 1.0];
    const CHAN_OFFS_IN2 = [0, 0];
    const CHAN_FIXD_IN2 = [2, 3];

    const CHAN_NAME_IN3 = ["in3_kWh", "in3_cosphi"];
    const CHAN_MASK_IN3 = ["in3_power_en", "in3_cosphi_en"];
    const CHAN_TYPE_IN3 = [TYPE_I32, TYPE_F16];
    const CHAN_SCAL_IN3 = [0.01, 1.0];
    const CHAN_OFFS_IN3 = [0, 0];
    const CHAN_FIXD_IN3 = [2, 3];

    const CHAN_NAME = [...CHAN_NAME_SYSTEM, ...CHAN_NAME_IN1, ...CHAN_NAME_IN2, ...CHAN_NAME_IN3];
    const CHAN_MASK = [...CHAN_MASK_SYSTEM, ...CHAN_MASK_IN1, ...CHAN_MASK_IN2, ...CHAN_MASK_IN3];
    const CHAN_TYPE = [...CHAN_TYPE_SYSTEM, ...CHAN_TYPE_IN1, ...CHAN_TYPE_IN2, ...CHAN_TYPE_IN3];
    const CHAN_SCAL = [...CHAN_SCAL_SYSTEM, ...CHAN_SCAL_IN1, ...CHAN_SCAL_IN2, ...CHAN_SCAL_IN3];
    const CHAN_OFFS = [...CHAN_OFFS_SYSTEM, ...CHAN_OFFS_IN1, ...CHAN_OFFS_IN2, ...CHAN_OFFS_IN3];
    const CHAN_FIXD = [...CHAN_FIXD_SYSTEM, ...CHAN_FIXD_IN1, ...CHAN_FIXD_IN2, ...CHAN_FIXD_IN3];

    const bitsetMap = createBitSetMap(bytes.slice(0, 3), BITSET);

    bitsetMap.set('dummy', true);
    const flags = Object.fromEntries(bitsetMap);
    flags["dummy"] = true;


    let channels = Object.fromEntries(parseChannels(bytes.slice(3), bitsetMap, CHAN_MASK, CHAN_NAME, CHAN_TYPE, CHAN_SCAL, CHAN_OFFS));

    const CHAN_NAME_POST = ["sum_in123_kWh"];

    const CHAN_FIXD_POST = [2];

    const CHAN_NAME_FINAL = [...CHAN_NAME, ...CHAN_NAME_POST];
    const CHAN_FIXD_FINAL = [...CHAN_FIXD, ...CHAN_FIXD_POST];


    const toFixed = (res, chanNames, chanFixed) => {
        Object.entries(res).map(([k, v]) => {
            const ix = chanNames.indexOf(k);
            if (ix >= 0) {
                res[k] = num_to_fixed(v, chanFixed[ix]);
            };
        });
        return res;
    }

    const sumIfDefined = (channels, channelKeys, sumKey) => {
        const sum = channelKeys.reduce((acc, key) => {
            const value = channels[key];
            return acc + (value !== undefined ? value : 0);
        }, 0);

        if (channelKeys.some(key => channels[key] !== undefined)) {
            channels[sumKey] = sum;
        }
    }


    const kWh_keys = ['in1_kWh', 'in2_kWh', 'in3_kWh', 'in4_kWh'];
    sumIfDefined(channels, kWh_keys, 'sum_in123_kWh');


    // Do counter calculations
    const ctr_days = Math.floor(channels["in_ctr_count"] / (24*3600));
    const ctr_hours = Math.floor((channels["in_ctr_count"] % (24*3600)) / 3600);
    const ctr_minutes = Math.floor((channels["in_ctr_count"] % 3600) / 60);
    const ctr_seconds = channels["in_ctr_count"] % 60;
    channels["in_ctr_time_elapse"] = "[D:"+ctr_days+"|H:"+ctr_hours+"|M:"+ctr_minutes+"|S:"+ctr_seconds+"]";

    channels = toFixed(channels, CHAN_NAME_FINAL, CHAN_FIXD_FINAL);
    return { flags, ...channels };
}


function decodePort31(bytes) {
    const BITSET_BYTE_0 = ["in1_amp_h_en", null, null, null, null, null, null, null];
    const BITSET_BYTE_1 = ["in2_amp_h_en", null, null, null, null, null, null, null];
    const BITSET_BYTE_2 = ["in3_amp_h_en", null, null, null, null, null, null, null];
    const BITSET_BYTE_3 = ["in4_amp_h_en", null, null, null, null, null, null, null];

    const BITSET = [...BITSET_BYTE_0, ...BITSET_BYTE_1, ...BITSET_BYTE_2, ...BITSET_BYTE_3];

    const CHAN_NAME_SYSTEM = ["in_ctr_count"];
    const CHAN_MASK_SYSTEM = ["dummy"];
    const CHAN_TYPE_SYSTEM = [TYPE_U32];
    const CHAN_SCAL_SYSTEM = [1.0];
    const CHAN_OFFS_SYSTEM = [0];
    const CHAN_FIXD_SYSTEM = [0];


    const CHAN_NAME_IN1 = ["in1_Ah"];
    const CHAN_MASK_IN1 = ["in1_amp_h_en"];
    const CHAN_TYPE_IN1 = [TYPE_I32];
    const CHAN_SCAL_IN1 = [0.01];
    const CHAN_OFFS_IN1 = [0];
    const CHAN_FIXD_IN1 = [2];

    const CHAN_NAME_IN2 = ["in2_Ah"];
    const CHAN_MASK_IN2 = ["in2_amp_h_en"];
    const CHAN_TYPE_IN2 = [TYPE_I32];
    const CHAN_SCAL_IN2 = [0.01];
    const CHAN_OFFS_IN2 = [0];
    const CHAN_FIXD_IN2 = [2];

    const CHAN_NAME_IN3 = ["in3_Ah"];
    const CHAN_MASK_IN3 = ["in3_amp_h_en"];
    const CHAN_TYPE_IN3 = [TYPE_I32];
    const CHAN_SCAL_IN3 = [0.01];
    const CHAN_OFFS_IN3 = [0];
    const CHAN_FIXD_IN3 = [2];

    const CHAN_NAME_IN4 = ["in4_Ah"];
    const CHAN_MASK_IN4 = ["in4_amp_h_en"];
    const CHAN_TYPE_IN4 = [TYPE_I32];
    const CHAN_SCAL_IN4 = [0.01];
    const CHAN_OFFS_IN4 = [0];
    const CHAN_FIXD_IN4 = [2];

    const CHAN_NAME = [...CHAN_NAME_SYSTEM, ...CHAN_NAME_IN1, ...CHAN_NAME_IN2, ...CHAN_NAME_IN3, ...CHAN_NAME_IN4];
    const CHAN_MASK = [...CHAN_MASK_SYSTEM, ...CHAN_MASK_IN1, ...CHAN_MASK_IN2, ...CHAN_MASK_IN3, ...CHAN_MASK_IN4];
    const CHAN_TYPE = [...CHAN_TYPE_SYSTEM, ...CHAN_TYPE_IN1, ...CHAN_TYPE_IN2, ...CHAN_TYPE_IN3, ...CHAN_TYPE_IN4];
    const CHAN_SCAL = [...CHAN_SCAL_SYSTEM, ...CHAN_SCAL_IN1, ...CHAN_SCAL_IN2, ...CHAN_SCAL_IN3, ...CHAN_SCAL_IN4];
    const CHAN_OFFS = [...CHAN_OFFS_SYSTEM, ...CHAN_OFFS_IN1, ...CHAN_OFFS_IN2, ...CHAN_OFFS_IN3, ...CHAN_OFFS_IN4];
    const CHAN_FIXD = [...CHAN_FIXD_SYSTEM, ...CHAN_FIXD_IN1, ...CHAN_FIXD_IN2, ...CHAN_FIXD_IN3, ...CHAN_FIXD_IN4];

    const bitsetMap = createBitSetMap(bytes.slice(0, 4), BITSET);

    bitsetMap.set('dummy', true);
    const flags = Object.fromEntries(bitsetMap);
    flags["dummy"] = true;


    let channels = Object.fromEntries(parseChannels(bytes.slice(4), bitsetMap, CHAN_MASK, CHAN_NAME, CHAN_TYPE, CHAN_SCAL, CHAN_OFFS));

    const CHAN_NAME_POST = ["sum_in1234_Ah"];


    const sumIfDefined = (channels, channelKeys, sumKey) => {
        const sum = channelKeys.reduce((acc, key) => {
            const value = channels[key];
            return acc + (value !== undefined ? value : 0);
        }, 0);

        if (channelKeys.some(key => channels[key] !== undefined)) {
            channels[sumKey] = sum;
        }
    }


    const amp_h_keys = ['in1_Ah', 'in2_Ah', 'in3_Ah', 'in4_Ah'];
    sumIfDefined(channels, amp_h_keys, 'sum_in1234_Ah');

    const CHAN_FIXD_POST = [2];

    const CHAN_NAME_FINAL = [...CHAN_NAME, ...CHAN_NAME_POST];
    const CHAN_FIXD_FINAL = [...CHAN_FIXD, ...CHAN_FIXD_POST];

    const toFixed = (res, chanNames, chanFixed) => {
        Object.entries(res).map(([k, v]) => {
            const ix = chanNames.indexOf(k);
            if (ix >= 0) {
                res[k] = num_to_fixed(v, chanFixed[ix]);
            };
        });
        return res;
    }

    // Do counter calculations
    const ctr_days = Math.floor(channels["in_ctr_count"] / (24*3600));
    const ctr_hours = Math.floor((channels["in_ctr_count"] % (24*3600)) / 3600);
    const ctr_minutes = Math.floor((channels["in_ctr_count"] % 3600) / 60);
    const ctr_seconds = channels["in_ctr_count"] % 60;
    channels["in_ctr_time_elapse"] = "[D:"+ctr_days+"|H:"+ctr_hours+"|M:"+ctr_minutes+"|S:"+ctr_seconds+"]";

    channels = toFixed(channels, CHAN_NAME_FINAL, CHAN_FIXD_FINAL);
    return { flags, ...channels };
}


function decodePort10(bytes) {
    const BITSET_BYTE_0 = ["usb_powered", "ch_vsys_en", "ch_temp_en", null, null, null, null, null];
    const BITSET_BYTE_1 = ["ct_plus_mode", "rogowski_mode", null, null, null, null, null, null];
    const BITSET_BYTE_2 = ["in1_ac_en", "in1_dc_en", "in1_freq_en", "in1_scaled_mode", "in1_voltage_mode", null, null, null];
    const BITSET_BYTE_3 = ["in2_ac_en", "in2_dc_en", "in2_freq_en", "in2_scaled_mode", "in2_voltage_mode", null, null, null];
    const BITSET_BYTE_4 = ["in3_ac_en", "in3_dc_en", "in3_freq_en", "in3_scaled_mode", "in3_voltage_mode", null, null, null];
    const BITSET_BYTE_5 = ["in4_ac_en", "in4_dc_en", "in4_freq_en", "in4_scaled_mode", "in4_voltage_mode", null, null, null];
    const BITSET = [...BITSET_BYTE_0, ...BITSET_BYTE_1, ...BITSET_BYTE_2, ...BITSET_BYTE_3, ...BITSET_BYTE_4, ...BITSET_BYTE_5];

    const CHAN_NAME_SYSTEM = ["vsys_V", "temp_C"];
    const CHAN_MASK_SYSTEM = ["ch_vsys_en", "ch_temp_en"];
    const CHAN_TYPE_SYSTEM = [TYPE_U8, TYPE_U8];
    const CHAN_SCAL_SYSTEM = [0.0075, 0.4];
    const CHAN_OFFS_SYSTEM = [1.8, -22.0];
    const CHAN_FIXD_SYSTEM = [3, 1];

    const CHAN_NAME_IN1 = ["in1_ac_raw_A", "in1_dc_raw_A", "in1_freq", "in1_coeff"];
    const CHAN_MASK_IN1 = ["in1_ac_en", "in1_dc_en", "in1_freq_en", "in1_scaled_mode"];
    const CHAN_TYPE_IN1 = [TYPE_F16, TYPE_F16, TYPE_U16, TYPE_F16];
    const CHAN_SCAL_IN1 = [1.0, 1.0, 0.01, 1.0];
    const CHAN_OFFS_IN1 = [0, 0, 0, 0];
    const CHAN_FIXD_IN1 = [6, 6, 2, 3];

    const CHAN_NAME_IN2 = ["in2_ac_raw_A", "in2_dc_raw_A", "in2_freq", "in2_coeff"];
    const CHAN_MASK_IN2 = ["in2_ac_en", "in2_dc_en", "in2_freq_en", "in2_scaled_mode"];
    const CHAN_TYPE_IN2 = [TYPE_F16, TYPE_F16, TYPE_U16, TYPE_F16];
    const CHAN_SCAL_IN2 = [1.0, 1.0, 0.01, 1.0];
    const CHAN_OFFS_IN2 = [0, 0, 0, 0];
    const CHAN_FIXD_IN2 = [6, 6, 2, 3];

    const CHAN_NAME_IN3 = ["in3_ac_raw_A", "in3_dc_raw_A", "in3_freq", "in3_coeff"];
    const CHAN_MASK_IN3 = ["in3_ac_en", "in3_dc_en", "in3_freq_en", "in3_scaled_mode"];
    const CHAN_TYPE_IN3 = [TYPE_F16, TYPE_F16, TYPE_U16, TYPE_F16];
    const CHAN_SCAL_IN3 = [1.0, 1.0, 0.01, 1.0];
    const CHAN_OFFS_IN3 = [0, 0, 0, 0];
    const CHAN_FIXD_IN3 = [6, 6, 2, 3];

    const CHAN_NAME_IN4 = ["in4_ac_raw_A", "in4_dc_raw_A", "in4_freq", "in4_coeff"];
    const CHAN_MASK_IN4 = ["in4_ac_en", "in4_dc_en", "in4_freq_en", "in4_scaled_mode"];
    const CHAN_TYPE_IN4 = [TYPE_F16, TYPE_F16, TYPE_U16, TYPE_F16];
    const CHAN_SCAL_IN4 = [1.0, 1.0, 0.01, 1.0];
    const CHAN_OFFS_IN4 = [0, 0, 0, 0];
    const CHAN_FIXD_IN4 = [6, 6, 2, 3];

    const CHAN_NAME_PLUS = ["in1_pow_factor", "in2_pow_factor", "in3_pow_factor"];
    const CHAN_MASK_PLUS = ["ct_plus_mode", "ct_plus_mode", "ct_plus_mode"];
    const CHAN_TYPE_PLUS = [TYPE_F16, TYPE_F16, TYPE_F16];
    const CHAN_SCAL_PLUS = [1.0, 1.0, 1.0];
    const CHAN_OFFS_PLUS = [0, 0, 0];
    const CHAN_FIXD_PLUS = [4, 4, 4];

    const CHAN_NAME = [...CHAN_NAME_SYSTEM, ...CHAN_NAME_IN1, ...CHAN_NAME_IN2, ...CHAN_NAME_IN3, ...CHAN_NAME_IN4, ...CHAN_NAME_PLUS];
    const CHAN_MASK = [...CHAN_MASK_SYSTEM, ...CHAN_MASK_IN1, ...CHAN_MASK_IN2, ...CHAN_MASK_IN3, ...CHAN_MASK_IN4, ...CHAN_MASK_PLUS];
    const CHAN_TYPE = [...CHAN_TYPE_SYSTEM, ...CHAN_TYPE_IN1, ...CHAN_TYPE_IN2, ...CHAN_TYPE_IN3, ...CHAN_TYPE_IN4, ...CHAN_TYPE_PLUS];
    const CHAN_SCAL = [...CHAN_SCAL_SYSTEM, ...CHAN_SCAL_IN1, ...CHAN_SCAL_IN2, ...CHAN_SCAL_IN3, ...CHAN_SCAL_IN4, ...CHAN_SCAL_PLUS];
    const CHAN_OFFS = [...CHAN_OFFS_SYSTEM, ...CHAN_OFFS_IN1, ...CHAN_OFFS_IN2, ...CHAN_OFFS_IN3, ...CHAN_OFFS_IN4, ...CHAN_OFFS_PLUS];
    const CHAN_FIXD = [...CHAN_FIXD_SYSTEM, ...CHAN_FIXD_IN1, ...CHAN_FIXD_IN2, ...CHAN_FIXD_IN3, ...CHAN_FIXD_IN4, ...CHAN_FIXD_PLUS];

    const bitsetMap = createBitSetMap(bytes.slice(0, 6), BITSET);
    const flags = Object.fromEntries(bitsetMap);
    let channels = Object.fromEntries(parseChannels(bytes.slice(10), bitsetMap, CHAN_MASK, CHAN_NAME, CHAN_TYPE, CHAN_SCAL, CHAN_OFFS));

    const toFixed = (res, chanNames, chanFixed) => {
        Object.entries(res).map(([k, v]) => {
            const ix = chanNames.indexOf(k);
            if (ix >= 0) {
                res[k] = num_to_fixed(v, chanFixed[ix]);
            }
        });
        return res;
    }

    const { ct_plus_mode } = flags;

    const addScaledChannel = (ix) => {
        if (flags[`in${ix}_scaled_mode`]) {
            const voltage_mode = flags[`in${ix}_voltage_mode`];
            const coeff = (channels[`in${ix}_coeff`] || 1.0) * (voltage_mode ? 1000.0 : 1.0);

            const ac_raw_A = channels[`in${ix}_ac_raw_A`];
            if (ac_raw_A != undefined) {
                channels[voltage_mode ? `in${ix}_voltage_VAC` : `in${ix}_ac_A`] = ac_raw_A * coeff;
            }

            const dc_raw_A = channels[`in${ix}_dc_raw_A`];
            if (dc_raw_A != undefined) {
                channels[voltage_mode ? `in${ix}_voltage_VDC` : `in${ix}_dc_A`] = dc_raw_A * coeff;
            }
        }
    }

    addScaledChannel(1);
    addScaledChannel(2);
    addScaledChannel(3);
    addScaledChannel(4);

    const sumIfDefined = (channels, channelKeys, sumKey) => {
        const sum = channelKeys.reduce((acc, key) => {
            const value = channels[key];
            return acc + (value !== undefined ? value : 0);
        }, 0);

        if (channelKeys.some(key => channels[key] !== undefined)) {
            channels[sumKey] = sum;
        }
    }

    const acKeys = ['in1_ac_A', 'in2_ac_A', 'in3_ac_A', 'in4_ac_A'];
    const dcKeys = ['in1_dc_A', 'in2_dc_A', 'in3_dc_A', 'in4_dc_A'];

    sumIfDefined(channels, acKeys, 'sum_in1234_ac_A');
    sumIfDefined(channels, dcKeys, 'sum_in1234_dc_A');

    const CHAN_NAME_POST = [
        "in1_ac_A", "in2_ac_A", "in3_ac_A", "in4_ac_A",
        "in1_voltage_VAC", "in2_voltage_VAC", "in3_voltage_VAC", "in4_voltage_VAC",
        "sum_in1234_ac_A", "sum_in1234_dc_A"
    ];
    const CHAN_FIXD_POST = [3, 3, 3, 3, 2, 2, 2, 2, 3, 3];

    if (ct_plus_mode) {
        const { in4_voltage_VAC } = channels;
        const { in1_ac_A, in2_ac_A, in3_ac_A } = channels;

        channels["in1_pow_app_VA"] = in4_voltage_VAC * in1_ac_A;
        channels["in2_pow_app_VA"] = in4_voltage_VAC * in2_ac_A;
        channels["in3_pow_app_VA"] = in4_voltage_VAC * in3_ac_A;

        const { in1_pow_app_VA, in2_pow_app_VA, in3_pow_app_VA } = channels;
        const { in1_pow_factor, in2_pow_factor, in3_pow_factor } = channels;

        channels["in1_pow_act_W"] = in1_pow_app_VA * in1_pow_factor;
        channels["in2_pow_act_W"] = in2_pow_app_VA * in2_pow_factor;
        channels["in3_pow_act_W"] = in3_pow_app_VA * in3_pow_factor;

        const { in1_pow_act_W, in2_pow_act_W, in3_pow_act_W } = channels;


        if (Math.abs(in1_pow_factor) > 1)
        {
            channels["in1_pow_react_VAR"] = 0
        }
        else
        {
            channels["in1_pow_react_VAR"] = Math.sqrt((in1_pow_app_VA * in1_pow_app_VA) - (in1_pow_act_W * in1_pow_act_W));
        }
        if (Math.abs(in2_pow_factor) > 1)
        {
            channels["in2_pow_react_VAR"] = 0
        }
        else
        {
            channels["in2_pow_react_VAR"] = Math.sqrt((in2_pow_app_VA * in2_pow_app_VA) - (in2_pow_act_W * in2_pow_act_W));
        }
        if (Math.abs(in3_pow_factor) > 1)
        {
            channels["in3_pow_react_VAR"] = 0
        }
        else
        {
            channels["in3_pow_react_VAR"] = Math.sqrt((in3_pow_app_VA * in3_pow_app_VA) - (in3_pow_act_W * in3_pow_act_W));
        }

        const { in1_pow_react_VAR, in2_pow_react_VAR, in3_pow_react_VAR } = channels;

        channels["sum_in123_pow_app_VA"] = in1_pow_app_VA + in2_pow_app_VA + in3_pow_app_VA;
        channels["sum_in123_pow_act_W"] = in1_pow_act_W + in2_pow_act_W + in3_pow_act_W;
        channels["sum_in123_pow_react_VAR"] = in1_pow_react_VAR + in2_pow_react_VAR + in3_pow_react_VAR;
    }

    const CHAN_NAME_POST2 = [
        "in1_pow_app_VA", "in2_pow_app_VA", "in3_pow_app_VA",
        "in1_pow_act_W", "in2_pow_act_W", "in3_pow_act_W",
        "in1_pow_react_VAR", "in2_pow_react_VAR", "in3_pow_react_VAR",
        "sum_in123_pow_app_VA", "sum_in123_pow_act_W", "sum_in123_pow_react_VAR"
    ];
    const CHAN_FIXD_POST2 = [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2];

    const CHAN_NAME_FINAL = [...CHAN_NAME, ...CHAN_NAME_POST, ...CHAN_NAME_POST2];
    const CHAN_FIXD_FINAL = [...CHAN_FIXD, ...CHAN_FIXD_POST, ...CHAN_FIXD_POST2];

    channels = toFixed(channels, CHAN_NAME_FINAL, CHAN_FIXD_FINAL);
    return { flags, ...channels };
}

function decodePort99(bytes) {
    if (bytes.length < 4) {
        return;
    }
    return {
        "reboot_counter": uint32_LE(bytes, 0),
        "app_version_major": bytes[4] || 0,
        "app_version_minor": bytes[5] || 0,
        "app_version_patch": bytes[6] || 0
    };
}

function decodePortX(bytes, port) {
    switch (port) {
        case 6:
            return decodePort6(bytes);
        case 10:
            return decodePort10(bytes);
        case 30:
            return decodePort30(bytes);
        case 31:
            return decodePort31(bytes);
        case 99:
            return decodePort99(bytes);
    }
    throw new Error("No decoder for port: " + port);
}

function decodeUplink(input) {

    return {
        data: decodePortX(input.bytes, input.fPort),
        warnings: [],
        errors: []
    };
}

exports.decodeUplink = decodeUplink;