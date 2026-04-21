// Thermokon Sensortechnik GmbH
// Payload Decoder / Encoder for Thermokon JOY LoRaWAN room controller
// JOY LRW - compatible structure with generic Thermokon driver
// V1

function u16_to_s16(u16) {
    var s16 = u16 & 0xFFFF;
    if (0x8000 & s16) {
        s16 = -(0x010000 - s16);
    }
    return s16;
}

function s16_to_u16(s16) {
    if (s16 < 0) {
        return 0x10000 + s16;
    }
    return s16 & 0xFFFF;
}

function convertFanStage(u16) {
    if (u16 >= 0xFF00) {
        u16 = (u16 - 0xFF00);
    }
    return u16;
}

function encodeUINT16(value) {
    return [(value >> 8) & 0xFF, value & 0xFF];
}

function encodeSINT16(value) {
    return encodeUINT16(s16_to_u16(value));
}

function toTenths(value) {
    return Math.round(value * 10);
}

function pushIdentifierValue(encoded, identifier, value, signed) {
    encoded.push((identifier >> 8) & 0xFF, identifier & 0xFF);
    if (signed) {
        encoded.push.apply(encoded, encodeSINT16(value));
    } else {
        encoded.push.apply(encoded, encodeUINT16(value));
    }
}

function Decode(fPort, bytes) {

    var LPP_PARSER = 0x0000;
    var LPP_DUMMY = 0x0001;
    var LPP_HEARTBEAT = 0xC106;
    var LPP_HEARTBEAT_UPLINK = 0xC000;
    var LPP_FORCED_UPLINK = 0xC230;

    var LPP_SETPOINT_HEAT = 0x0200;
    var LPP_SETPOINT_COOL = 0x0201;
    var LPP_SETPOINT_OFFSET = 0x0202;
    var LPP_SENSOR_INTERN = 0x0203;
    var LPP_SENSOR_EXTERN = 0x0204;
    var LPP_OUTPUT_HEATING = 0x0205;
    var LPP_OUTPUT_COOLING = 0x0206;
    var LPP_OUTPUT_FAN_6WV = 0x0207;
    var LPP_INPUT_1 = 0x0208;
    var LPP_INPUT_2 = 0x0209;
    var LPP_OCCUPANCY = 0x020A;
    var LPP_DEWPOINT = 0x020B;
    var LPP_WINDOW = 0x020C;
    var LPP_CTR_Y = 0x020D;
    var LPP_CTR_STATE = 0x020E;
    var LPP_ECO_MODE = 0x0229;
    var LPP_SETPOINT_ABSOLUTE = 0x022A;
    var LPP_CHANGEOVER_STATE = 0x0236;
    var LPP_HUMIDITY = 0x0237;
    var LPP_CO2_INTERNAL_SENSOR = 0x023B;
    var LPP_CO2_ALARM = 0x023C;

    var LPP_LRW_HEARTBEAT_INTERVAL = 0xC106;
    var LPP_LRW_HYSTERESE = 0xC107;
    var LPP_LRW_PORT = 0xC216;
    var LPP_LRW_ADR = 0xC217;
    var LPP_LRW_DATARATE = 0xC218;
    var LPP_LRW_CONFIRMATION = 0xC21D;

    var decoded = {};
    var data = bytes;
    var i = 0;

    while (i < data.length) {
        if (i + 1 >= data.length) break;

        var lpp = (data[i] << 8) | data[i + 1];
        i += 2;

        if (lpp === LPP_FORCED_UPLINK) {
            while (i < data.length) {
                if (i + 3 >= data.length) break;

                var subLpp = (data[i] << 8) | data[i + 1];
                i += 2;

                switch (subLpp) {
                    case LPP_SETPOINT_HEAT:
                        decoded.SETPOINT_HEAT = u16_to_s16((data[i] << 8) | data[i + 1]) / 10;
                        break;
                    case LPP_SETPOINT_COOL:
                        decoded.SETPOINT_COOL = u16_to_s16((data[i] << 8) | data[i + 1]) / 10;
                        break;
                    case LPP_SETPOINT_OFFSET:
                        decoded.SETPOINT_OFFSET = u16_to_s16((data[i] << 8) | data[i + 1]) / 10;
                        break;
                    case LPP_SENSOR_INTERN:
                        decoded.SENSOR_INTERN = u16_to_s16((data[i] << 8) | data[i + 1]) / 10;
                        break;
                    case LPP_SENSOR_EXTERN:
                        decoded.SENSOR_EXTERN = u16_to_s16((data[i] << 8) | data[i + 1]) / 10;
                        break;
                    case LPP_OUTPUT_HEATING:
                        decoded.OUTPUT_HEATING = (data[i] << 8) | data[i + 1];
                        break;
                    case LPP_OUTPUT_COOLING:
                        decoded.OUTPUT_COOLING = (data[i] << 8) | data[i + 1];
                        break;
                    case LPP_OUTPUT_FAN_6WV:
                        decoded.OUTPUT_FAN_6WV = convertFanStage((data[i] << 8) | data[i + 1]);
                        break;
                    case LPP_INPUT_1:
                        decoded.INPUT_1 = (data[i] << 8) | data[i + 1];
                        break;
                    case LPP_INPUT_2:
                        decoded.INPUT_2 = (data[i] << 8) | data[i + 1];
                        break;
                    case LPP_OCCUPANCY:
                        decoded.OCCUPANCY = (data[i] << 8) | data[i + 1];
                        break;
                    case LPP_DEWPOINT:
                        decoded.DEWPOINT = (data[i] << 8) | data[i + 1];
                        break;
                    case LPP_WINDOW:
                        decoded.WINDOW = (data[i] << 8) | data[i + 1];
                        break;
                    case LPP_CTR_Y:
                        decoded.CTR_Y = (data[i] << 8) | data[i + 1];
                        break;
                    case LPP_CTR_STATE:
                        decoded.CTR_STATE = (data[i] << 8) | data[i + 1];
                        break;
                    case LPP_ECO_MODE:
                        decoded.ECO_MODE = (data[i] << 8) | data[i + 1];
                        break;
                    case LPP_SETPOINT_ABSOLUTE:
                        decoded.SETPOINT_ABSOLUTE = u16_to_s16((data[i] << 8) | data[i + 1]) / 10;
                        break;
                    case LPP_CHANGEOVER_STATE:
                        decoded.CHANGEOVER_STATE = (data[i] << 8) | data[i + 1];
                        break;
                    case LPP_HUMIDITY:
                        decoded.HUMIDITY = u16_to_s16((data[i] << 8) | data[i + 1]) / 10;
                        break;
                    case LPP_CO2_INTERNAL_SENSOR:
                        decoded.CO2_INTERNAL_SENSOR = (data[i] << 8) | data[i + 1];
                        break;
                    case LPP_CO2_ALARM:
                        decoded.CO2_ALARM = (data[i] << 8) | data[i + 1];
                        break;
                    case LPP_LRW_HEARTBEAT_INTERVAL:
                        decoded.LRW_HEARTBEAT_INTERVAL = (data[i] << 8) | data[i + 1];
                        break;
                    case LPP_LRW_HYSTERESE:
                        decoded.LRW_HYSTERESE = (data[i] << 8) | data[i + 1];
                        break;
                    case LPP_LRW_PORT:
                        decoded.LRW_PORT = (data[i] << 8) | data[i + 1];
                        break;
                    case LPP_LRW_ADR:
                        decoded.LRW_ADR = (data[i] << 8) | data[i + 1];
                        break;
                    case LPP_LRW_DATARATE:
                        decoded.LRW_DATARATE = (data[i] << 8) | data[i + 1];
                        break;
                    case LPP_LRW_CONFIRMATION:
                        decoded.LRW_CONFIRMATION = (data[i] << 8) | data[i + 1];
                        break;
                    default:
                        break;
                }
                i += 2;
            }
        } else if (lpp === LPP_HEARTBEAT_UPLINK) {
            if (i + 1 >= data.length) break;
            decoded.HB_DEVICE_TYPE = (data[i] << 8) | data[i + 1];
            i += 2;

            while (i < data.length) {
                if (i + 3 >= data.length) break;

                var subLppHb = (data[i] << 8) | data[i + 1];
                i += 2;

                switch (subLppHb) {
                    case LPP_SETPOINT_HEAT:
                        decoded.SETPOINT_HEAT = u16_to_s16((data[i] << 8) | data[i + 1]) / 10;
                        break;
                    case LPP_SETPOINT_COOL:
                        decoded.SETPOINT_COOL = u16_to_s16((data[i] << 8) | data[i + 1]) / 10;
                        break;
                    case LPP_SETPOINT_OFFSET:
                        decoded.SETPOINT_OFFSET = u16_to_s16((data[i] << 8) | data[i + 1]) / 10;
                        break;
                    case LPP_SETPOINT_ABSOLUTE:
                        decoded.SETPOINT_ABSOLUTE = u16_to_s16((data[i] << 8) | data[i + 1]) / 10;
                        break;
                    case LPP_SENSOR_INTERN:
                        decoded.SENSOR_INTERN = u16_to_s16((data[i] << 8) | data[i + 1]) / 10;
                        break;
                    case LPP_SENSOR_EXTERN:
                        decoded.SENSOR_EXTERN = u16_to_s16((data[i] << 8) | data[i + 1]) / 10;
                        break;
                    case LPP_OUTPUT_HEATING:
                        decoded.OUTPUT_HEATING = (data[i] << 8) | data[i + 1];
                        break;
                    case LPP_OUTPUT_COOLING:
                        decoded.OUTPUT_COOLING = (data[i] << 8) | data[i + 1];
                        break;
                    case LPP_OUTPUT_FAN_6WV:
                        decoded.OUTPUT_FAN_6WV = convertFanStage((data[i] << 8) | data[i + 1]);
                        break;
                    case LPP_CTR_Y:
                        decoded.CTR_Y = (data[i] << 8) | data[i + 1];
                        break;
                    case LPP_CTR_STATE:
                        decoded.CTR_STATE = (data[i] << 8) | data[i + 1];
                        break;
                    case LPP_OCCUPANCY:
                        decoded.OCCUPANCY = (data[i] << 8) | data[i + 1];
                        break;
                    case LPP_DEWPOINT:
                        decoded.DEWPOINT = (data[i] << 8) | data[i + 1];
                        break;
                    case LPP_WINDOW:
                        decoded.WINDOW = (data[i] << 8) | data[i + 1];
                        break;
                    case LPP_ECO_MODE:
                        decoded.ECO_MODE = (data[i] << 8) | data[i + 1];
                        break;
                    case LPP_CHANGEOVER_STATE:
                        decoded.CHANGEOVER_STATE = (data[i] << 8) | data[i + 1];
                        break;
                    case LPP_HUMIDITY:
                        decoded.HUMIDITY = u16_to_s16((data[i] << 8) | data[i + 1]) / 10;
                        break;
                    case LPP_CO2_INTERNAL_SENSOR:
                        decoded.CO2_INTERNAL_SENSOR = (data[i] << 8) | data[i + 1];
                        break;
                    case LPP_CO2_ALARM:
                        decoded.CO2_ALARM = (data[i] << 8) | data[i + 1];
                        break;
                    default:
                        break;
                }
                i += 2;
            }
        } else {
            if (i + 1 >= data.length) break;

            switch (lpp) {
                case LPP_SETPOINT_HEAT:
                    decoded.SETPOINT_HEAT = u16_to_s16((data[i] << 8) | data[i + 1]) / 10;
                    break;
                case LPP_SETPOINT_COOL:
                    decoded.SETPOINT_COOL = u16_to_s16((data[i] << 8) | data[i + 1]) / 10;
                    break;
                case LPP_SETPOINT_OFFSET:
                    decoded.SETPOINT_OFFSET = u16_to_s16((data[i] << 8) | data[i + 1]) / 10;
                    break;
                case LPP_SENSOR_INTERN:
                    decoded.SENSOR_INTERN = u16_to_s16((data[i] << 8) | data[i + 1]) / 10;
                    break;
                case LPP_SENSOR_EXTERN:
                    decoded.SENSOR_EXTERN = u16_to_s16((data[i] << 8) | data[i + 1]) / 10;
                    break;
                case LPP_OUTPUT_HEATING:
                    decoded.OUTPUT_HEATING = (data[i] << 8) | data[i + 1];
                    break;
                case LPP_OUTPUT_COOLING:
                    decoded.OUTPUT_COOLING = (data[i] << 8) | data[i + 1];
                    break;
                case LPP_OUTPUT_FAN_6WV:
                    decoded.OUTPUT_FAN_6WV = convertFanStage((data[i] << 8) | data[i + 1]);
                    break;
                case LPP_INPUT_1:
                    decoded.INPUT_1 = (data[i] << 8) | data[i + 1];
                    break;
                case LPP_INPUT_2:
                    decoded.INPUT_2 = (data[i] << 8) | data[i + 1];
                    break;
                case LPP_OCCUPANCY:
                    decoded.OCCUPANCY = (data[i] << 8) | data[i + 1];
                    break;
                case LPP_DEWPOINT:
                    decoded.DEWPOINT = (data[i] << 8) | data[i + 1];
                    break;
                case LPP_WINDOW:
                    decoded.WINDOW = (data[i] << 8) | data[i + 1];
                    break;
                case LPP_CTR_Y:
                    decoded.CTR_Y = (data[i] << 8) | data[i + 1];
                    break;
                case LPP_CTR_STATE:
                    decoded.CTR_STATE = (data[i] << 8) | data[i + 1];
                    break;
                case LPP_ECO_MODE:
                    decoded.ECO_MODE = (data[i] << 8) | data[i + 1];
                    break;
                case LPP_SETPOINT_ABSOLUTE:
                    decoded.SETPOINT_ABSOLUTE = u16_to_s16((data[i] << 8) | data[i + 1]) / 10;
                    break;
                case LPP_CHANGEOVER_STATE:
                    decoded.CHANGEOVER_STATE = (data[i] << 8) | data[i + 1];
                    break;
                case LPP_HUMIDITY:
                    decoded.HUMIDITY = u16_to_s16((data[i] << 8) | data[i + 1]) / 10;
                    break;
                case LPP_CO2_INTERNAL_SENSOR:
                    decoded.CO2_INTERNAL_SENSOR = (data[i] << 8) | data[i + 1];
                    break;
                case LPP_CO2_ALARM:
                    decoded.CO2_ALARM = (data[i] << 8) | data[i + 1];
                    break;
                case LPP_LRW_HEARTBEAT_INTERVAL:
                    decoded.LRW_HEARTBEAT_INTERVAL = (data[i] << 8) | data[i + 1];
                    break;
                case LPP_LRW_HYSTERESE:
                    decoded.LRW_HYSTERESE = (data[i] << 8) | data[i + 1];
                    break;
                case LPP_LRW_PORT:
                    decoded.LRW_PORT = (data[i] << 8) | data[i + 1];
                    break;
                case LPP_LRW_ADR:
                    decoded.LRW_ADR = (data[i] << 8) | data[i + 1];
                    break;
                case LPP_LRW_DATARATE:
                    decoded.LRW_DATARATE = (data[i] << 8) | data[i + 1];
                    break;
                case LPP_LRW_CONFIRMATION:
                    decoded.LRW_CONFIRMATION = (data[i] << 8) | data[i + 1];
                    break;
                default:
                    break;
            }
            i += 2;
        }
    }

    return decoded;
}

// Encoder parameter registry
var ENCODERS = {
    // LoRaWAN
    LRW_HEARTBEAT_INTERVAL: { id: 0xC106, type: "u16" },
    LRW_HYSTERESE: { id: 0xC107, type: "u16" },
    LRW_PORT: { id: 0xC216, type: "u16" },
    LRW_ADR: { id: 0xC217, type: "u16" },
    LRW_DATARATE: { id: 0xC218, type: "u16" },
    LRW_CONFIRMATION: { id: 0xC21D, type: "u16" },

    // Daily runtime
    BASIC_SETPOINT: { id: 0x0100, type: "s16_tenths", allowMinusOne: true },
    SETPOINT_OFFSET_RUNTIME: { id: 0x0101, type: "s16_tenths" },
    DEFAULT_OCCUPANCY: { id: 0x0102, type: "s16", allowMinusOne: true },
    DEFAULT_DEWPOINT: { id: 0x0103, type: "s16", allowMinusOne: true },
    DEFAULT_WINDOW_CONTACT: { id: 0x0104, type: "s16", allowMinusOne: true },
    DEFAULT_CHANGEOVER: { id: 0x0105, type: "s16", allowMinusOne: true },
    DEVICE_ON_STANDBY: { id: 0x0106, type: "u16" },
    RELEASE_OF_KEYS: { id: 0x0107, type: "u16" },
    DEFAULT_ALARM: { id: 0x0108, type: "u16" },
    TIME_HOUR: { id: 0x0109, type: "u16" },
    TIME_MINUTE: { id: 0x010A, type: "u16" },
    DATE_DAY: { id: 0x010B, type: "u16" },
    DATE_MONTH: { id: 0x010C, type: "u16" },
    DATE_YEAR: { id: 0x010D, type: "u16" },
    DEFAULT_CONTROLLER: { id: 0x010E, type: "s16", allowMinusOne: true },
    DEFAULT_FAN_COIL: { id: 0x010F, type: "s16", allowMinusOne: true },
    DEFAULT_OUTPUT_HEATING: { id: 0x0110, type: "s16", allowMinusOne: true },
    DEFAULT_OUTPUT_COOLING: { id: 0x0111, type: "s16", allowMinusOne: true },
    DEFAULT_6WAY_VALVE_OUTPUT: { id: 0x0112, type: "s16", allowMinusOne: true },
    DEFAULT_ECO_MODE: { id: 0x0113, type: "u16" },

    // Setpoint / temperature / humidity
    OFFSET_INTERNAL_SENSOR: { id: 0x0005, type: "s16_tenths" },
    OFFSET_EXTERNAL_SENSOR: { id: 0x0006, type: "s16_tenths" },
    UNIT_TEMPERATURE: { id: 0x0007, type: "u16" },
    OFFSET_HUMIDITY: { id: 0x009F, type: "s16_tenths" },
    SETPOINT_AFTER_RESET: { id: 0x0015, type: "u16_tenths" },
    ADJUSTMENT_RANGE_OF_SETPOINT: { id: 0x0016, type: "u16_tenths" },
    SETPOINT_STEP_RANGE: { id: 0x0017, type: "u16_tenths" },
    DEAD_BAND_COMFORT: { id: 0x0018, type: "u16_tenths" },
    DEAD_BAND_ECO_MODE: { id: 0x0019, type: "u16_tenths" },
    SETPOINT_ADJUSTMENT_OCCUPANCY: { id: 0x001A, type: "u16_tenths" },
    FROST_PROTECTION: { id: 0x001B, type: "u16_tenths" },
    HEAT_PROTECTION: { id: 0x001C, type: "u16_tenths" },
    BEHAVIOUR_OF_SETPOINT_OFFSET_AT_OCCUPANCY_CHANGE: { id: 0x0088, type: "u16" },
    SETPOINT_CALCULATION: { id: 0x008E, type: "u16" },

    // Controller
    CONTROLLER_HYSTERESIS: { id: 0x001D, type: "u16_tenths" },
    CONTROLLER_MODE_AFTER_DEVICE_RESET: { id: 0x001E, type: "u16" },
    VALVE_PROTECTION_RELEASE: { id: 0x0022, type: "u16" },
    MODE_SELECTION_MANIPULATING_VARIABLE: { id: 0x006B, type: "u16" },
    PWM_CYCLE_TIME: { id: 0x006C, type: "u16" },
    HEATING_CONTROLLER_TYPE: { id: 0x006D, type: "u16" },
    COOLING_CONTROLLER_TYPE: { id: 0x006E, type: "u16" },
    PROPORTIONAL_BAND_XP_HEATING: { id: 0x0067, type: "u16_tenths" },
    RESET_TIME_TN_HEATING: { id: 0x0068, type: "u16" },
    MINIMUM_MANIPULATING_VARIABLE_HEATING: { id: 0x0069, type: "u16" },
    MAXIMUM_MANIPULATING_VARIABLE_HEATING: { id: 0x006A, type: "u16" },
    PROPORTIONAL_BAND_XP_COOLING: { id: 0x007E, type: "u16_tenths" },
    RESET_TIME_TN_COOLING: { id: 0x007F, type: "u16" },
    MINIMUM_MANIPULATING_VARIABLE_COOLING: { id: 0x0080, type: "u16" },
    MAXIMUM_MANIPULATING_VARIABLE_COOLING: { id: 0x0081, type: "u16" },
    MINIMUM_RUNTIME_CONTROLLER_OUTPUT: { id: 0x0093, type: "u16" },
    DELAY_TIME_CONTROLLER_MODE_CHANGE: { id: 0x0094, type: "u16" },
    MAXIMUM_TEMPERATURE_UNDERFLOOR_CONTROL: { id: 0x00A0, type: "u16_tenths" },
    OFFSET_2ND_CONTROL_LOOP: { id: 0x008D, type: "s16_tenths" },
    MODE_2ND_CONTROL_LOOP: { id: 0x00AA, type: "u16" },
    MINIMUM_MANIPULATING_VARIABLE_2ND_CONTROL_LOOP: { id: 0x00AB, type: "u16" },
    CHANGEOVER_LIMIT_COOLING: { id: 0x00A4, type: "u16_tenths" },
    CHANGEOVER_LIMIT_HEATING: { id: 0x00A5, type: "u16_tenths" },
    START_OF_CHANGEOVER_FIRST_MEASUREMENT_CYCLE: { id: 0x00A6, type: "u16" },
    START_OF_CHANGEOVER_SECOND_MEASUREMENT_CYCLE: { id: 0x00A7, type: "u16" },
    VALVE_OPENING_TIME: { id: 0x00A8, type: "u16" },
    CHANGEOVER_START_MEASUREMENT: { id: 0x00A9, type: "u16" },

    // Outputs / fan / 6-way valve
    TYPE_6WAY_VALVE: { id: 0x0003, type: "u16" },
    HEATING_100_GENERIC_6WAY_VALVE: { id: 0x0099, type: "u16" },
    HEATING_0_GENERIC_6WAY_VALVE: { id: 0x009A, type: "u16" },
    COOLING_100_GENERIC_6WAY_VALVE: { id: 0x009B, type: "u16" },
    COOLING_0_GENERIC_6WAY_VALVE: { id: 0x009C, type: "u16" },
    MAXIMUM_LOAD_HEATING: { id: 0x0064, type: "u16" },
    MAXIMUM_LOAD_COOLING: { id: 0x0065, type: "u16" },
    EFFECTIVE_DIRECTION_OF_RELAY_HEATING: { id: 0x0085, type: "u16" },
    EFFECTIVE_DIRECTION_OF_RELAY_COOLING: { id: 0x0086, type: "u16" },
    EFFECTIVE_DIRECTION_OF_ANALOG_OUTPUT_HEATING: { id: 0x0095, type: "u16" },
    EFFECTIVE_DIRECTION_OF_ANALOG_OUTPUT_COOLING: { id: 0x0096, type: "u16" },
    NUMBER_OF_FAN_COIL_STAGES: { id: 0x000A, type: "u16" },
    THRESHOLD_STAGE_1_ON: { id: 0x001F, type: "u16_tenths" },
    THRESHOLD_STAGE_2_ON: { id: 0x0020, type: "u16_tenths" },
    THRESHOLD_STAGE_3_ON: { id: 0x0021, type: "u16_tenths" },
    FAN_COIL_ASSIGNMENT: { id: 0x0063, type: "u16" },
    STEPS_FAN_COIL_CONTROL: { id: 0x006F, type: "u16" },
    FAN_COIL_MINIMUM: { id: 0x0070, type: "u16" },
    FAN_COIL_MAXIMUM: { id: 0x0071, type: "u16" },
    START_UP_TIME_FAN_COIL: { id: 0x0072, type: "u16" },
    FAN_START_WITH_MANIPULATING_VARIABLE: { id: 0x0082, type: "u16" },
    KEY_FAN_STAGE_WITH_WITHOUT_AUTO: { id: 0x0087, type: "u16" },
    FAN_FOLLOW_UP_TIME: { id: 0x009E, type: "u16" },
    LIMITATION_OF_MAX_FAN_SPEED_IN_AUTOMATIC_MODE: { id: 0x00A1, type: "u16" },

    // Occupancy / inputs / CO2
    OCCUPIED_ECO_OVERRIDE: { id: 0x0089, type: "u16" },
    PARTY_MODE: { id: 0x00AF, type: "u16" },
    INPUT_1_UNIVERSAL: { id: 0x0013, type: "u16" },
    INPUT_2_CONFIG: { id: 0x0014, type: "u16" },
    CO2_ALARM_THRESHOLD: { id: 0x00AC, type: "u16" },
    ALTITUDE_ABOVE_SEA_LEVEL: { id: 0x00AD, type: "u16" },
    ASC_ACTIVATION: { id: 0x00AE, type: "u16" }
};

function encodeValueByType(def, rawValue) {
    var value = rawValue;

    if (def.allowMinusOne && value === -1) {
        return { value: -1, signed: true };
    }

    switch (def.type) {
        case "u16":
            return { value: value, signed: false };
        case "s16":
            return { value: value, signed: true };
        case "u16_tenths":
            return { value: toTenths(value), signed: false };
        case "s16_tenths":
            return { value: toTenths(value), signed: true };
        default:
            return { value: value, signed: false };
    }
}

function encodeDownlink(input) {
    var result = {
        errors: [],
        warnings: []
    };
    var encoded = [];

    try {
        if (input == null) {
            result.errors.push("No data to encode");
            return result;
        }

        var data = input;
        if (input.data != null) {
            data = input.data;
        }

        // Forced uplink request with raw register identifiers
        if (data.REQUEST_REGISTERS != null) {
            encoded.push(0xC2, 0x30);
            for (var i = 0; i < data.REQUEST_REGISTERS.length; i++) {
                encoded.push.apply(encoded, encodeUINT16(data.REQUEST_REGISTERS[i]));
            }
        }

        // Forced uplink request with symbolic names
        if (data.REQUEST_KEYS != null) {
            encoded.push(0xC2, 0x30);
            for (var j = 0; j < data.REQUEST_KEYS.length; j++) {
                var keyName = data.REQUEST_KEYS[j];
                if (ENCODERS[keyName]) {
                    encoded.push.apply(encoded, encodeUINT16(ENCODERS[keyName].id));
                } else {
                    result.warnings.push("request key not supported: " + keyName);
                }
            }
        }

        for (var key in data) {
            if (key === "REQUEST_REGISTERS" || key === "REQUEST_KEYS") {
                continue;
            }

            if (!ENCODERS[key]) {
                result.warnings.push("encoding for " + key + " not supported");
                continue;
            }

            var def = ENCODERS[key];
            var prepared = encodeValueByType(def, data[key]);
            pushIdentifierValue(encoded, def.id, prepared.value, prepared.signed);
        }

        result.bytes = encoded;
        result.fPort = 2;
        return result;

    } catch (e) {
        result.errors.push(e.message);
        delete result.bytes;
        delete result.fPort;
        return result;
    }
}

function decodeUplink(input) {
    return {
        data: Decode(input.fPort, input.bytes),
        warnings: []
    };
}

exports.decodeUplink = decodeUplink;
exports.encodeDownlink = encodeDownlink;