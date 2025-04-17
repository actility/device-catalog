
/*
 #              ######               #                                                   ######                                               #####                                    #    ######  ###
 #        ####  #     #   ##        # #   #      #      #   ##   #    #  ####  ######    #     #   ##   #   # #       ####    ##   #####     #     #  ####  #####  ######  ####       # #   #     #  #
 #       #    # #     #  #  #      #   #  #      #      #  #  #  ##   # #    # #         #     #  #  #   # #  #      #    #  #  #  #    #    #       #    # #    # #      #    #     #   #  #     #  #
 #       #    # ######  #    #    #     # #      #      # #    # # #  # #      #####     ######  #    #   #   #      #    # #    # #    #    #       #    # #    # #####  #         #     # ######   #
 #       #    # #   #   ######    ####### #      #      # ###### #  # # #      #         #       ######   #   #      #    # ###### #    #    #       #    # #    # #      #         ####### #        #
 #       #    # #    #  #    #    #     # #      #      # #    # #   ## #    # #         #       #    #   #   #      #    # #    # #    #    #     # #    # #    # #      #    #    #     # #        #
 #######  ####  #     # #    #    #     # ###### ###### # #    # #    #  ####  ######    #       #    #   #   ######  ####  #    # #####      #####   ####  #####  ######  ####     #     # #       ###

 https://resources.lora-alliance.org/document/ts013-1-0-0-payload-codec-api
*/

/**
 * @typedef {Object} DecodedUplink
 * @property {Object} data - The open JavaScript object representing the decoded uplink payload when no errors occurred
 * @property {string[]} errors - A list of error messages while decoding the uplink payload
 * @property {string[]} warnings - A list of warning messages that do not prevent the driver from decoding the uplink payload
 */
// Size of a physical value for a scalar measurement
const SCALAR_VALUE_SIZE = 3;

// Size of a physical value for a vector element
const VECTOR_ELEMENT_VALUE_SIZE = 2;

const DB = "dB";
const MmPerSecond = "mm/s";
const G = "g";
const RPM = "rpm";

// Scalar value identifiers
const BATTERY_LEVEL_IDENTIFIER = 0x00;
const CURRENT_LOOP_IDENTIFIER = 0x01;
const TEMPERATURE_IDENTIFIER = 0x0e;
const HUMIDITY_IDENTIFIER = 0x02;

// Vector type identifiers
const SHOCK_DETECTION_VECTOR = 0x0a;
const SIGNATURE_VECTOR = 0x0b;
const SIGNATURE_REFEFENCE = 0x0c;
const SIGNATURE_EXTENSIONS = 0x0d;
const SYSTEM_STATUS_REPORT = 0xff;

const VECTOR_TYPES = [
    SHOCK_DETECTION_VECTOR,
    SIGNATURE_VECTOR,
    SIGNATURE_REFEFENCE,
    SIGNATURE_EXTENSIONS,
    SYSTEM_STATUS_REPORT
];

const SCHEDULING_PERIOD_SCALE_FACTOR = 10;
const SONIC_FREQUENCY_SCALE_FACTOR = 10;
const RPM_SCALE_FACTOR = 60;

// State variable
let inputData;
let decodeResult;
let globalFrame;
let globalView;
let elementCount;
let _segmentedFrame;

const littleEndian = (() => {
    const buffer = new ArrayBuffer(2);
    new DataView(buffer).setInt16(0, 256, true /* littleEndian */);
    // Int16Array uses the platform's endianness.
    return new Int16Array(buffer)[0] === 256;
})();


// Convert a byte array into a hex string
function toHexString(byteArray) {
    return Array.from(byteArray, function(byte) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('')
}


// A class to represent the physical values extracted from Sentinel data frames
class PhysicalValue {

    // Signature physical values are identified by their index in this array
    static signaturePhysicalValues = [
        { name: "vibration_frequencyBandS0", unit: DB, value: 0.0, min: -150.0, max: 0.0 },
        { name: "vibration_frequencyBandS1", unit: DB, value: 0.0, min: -150.0, max: 0.0 },
        { name: "vibration_frequencyBandS2", unit: DB, value: 0.0, min: -150.0, max: 0.0 },
        { name: "vibration_frequencyBandS3", unit: DB, value: 0.0, min: -150.0, max: 0.0 },
        { name: "vibration_frequencyBandS4", unit: DB, value: 0.0, min: -150.0, max: 0.0 },
        { name: "vibration_frequencyBandS5", unit: DB, value: 0.0, min: -150.0, max: 0.0 },
        { name: "vibration_frequencyBandS6", unit: DB, value: 0.0, min: -150.0, max: 0.0 },
        { name: "vibration_frequencyBandS7", unit: DB, value: 0.0, min: -150.0, max: 0.0 },
        { name: "vibration_frequencyBandS8", unit: DB, value: 0.0, min: -150.0, max: 0.0 },
        { name: "vibration_frequencyBandS9", unit: DB, value: 0.0, min: -150.0, max: 0.0 },
        { name: "sound_frequencyBandS10", unit: DB, value: 0.0, min: -150.0, max: 0.0 },
        { name: "sound_frequencyBandS11", unit: DB, value: 0.0, min: -150.0, max: 0.0 },
        { name: "sound_frequencyBandS12", unit: DB, value: 0.0, min: -150.0, max: 0.0 },
        { name: "sound_frequencyBandS13", unit: DB, value: 0.0, min: -150.0, max: 0.0 },
        { name: "sound_frequencyBandS14", unit: DB, value: 0.0, min: -150.0, max: 0.0 },
        { name: "sound_frequencyBandS15", unit: DB, value: 0.0, min: -150.0, max: 0.0 },
        { name: "sound_frequencyBandS16", unit: DB, value: 0.0, min: -150.0, max: 0.0 },
        { name: "sound_frequencyBandS17", unit: DB, value: 0.0, min: -150.0, max: 0.0 },
        { name: "sound_frequencyBandS18", unit: DB, value: 0.0, min: -150.0, max: 0.0 },
        { name: "sound_frequencyBandS19", unit: DB, value: 0.0, min: -150.0, max: 0.0 },
        { name: "acceleration_x", unit: G, value: 0.0, min: 0.0, max: 16.0 },
        { name: "velocity_x", unit: MmPerSecond, value: 0.0, min: 0.0, max: 100.0 },
        { name: "acceleration_x_peak", unit: G, value: 0.0, min: 0.0, max: 16.0 },
        { name: "kurtosis_x", unit: "", value: 0.0, min: 0.0, max: 100.0 },
        { name: "vibration_x_root", unit: RPM, value: 0.0, min: 0.0, max: 30000.0 },
        { name: "velocity_x_f1", unit: MmPerSecond, value: 0.0, min: 0.0, max: 100.0 },
        { name: "velocity_x_f2", unit: MmPerSecond, value: 0.0, min: 0.0, max: 100.0 },
        { name: "velocity_x_f3", unit: MmPerSecond, value: 0.0, min: 0.0, max: 100.0 },
        { name: "acceleration_y", unit: G, value: 0.0, min: 0.0, max: 16.0 },
        { name: "velocity_y", unit: MmPerSecond, value: 0.0, min: 0.0, max: 100.0 },
        { name: "acceleration_y_peak", unit: G, value: 0.0, min: 0.0, max: 16.0 },
        { name: "kurtosis_y", unit: "", value: 0.0, min: 0.0, max: 100.0 },
        { name: "vibration_y_root", unit: RPM, value: 0.0, min: 0.0, max: 30000.0 },
        { name: "velocity_y_f1", unit: MmPerSecond, value: 0.0, min: 0.0, max: 100.0 },
        { name: "velocity_y_f2", unit: MmPerSecond, value: 0.0, min: 0.0, max: 100.0 },
        { name: "velocity_y_f3", unit: MmPerSecond, value: 0.0, min: 0.0, max: 100.0 },
        { name: "acceleration_z", unit: G, value: 0.0, min: 0.0, max: 16.0 },
        { name: "velocity_z", unit: MmPerSecond, value: 0.0, min: 0.0, max: 100.0 },
        { name: "acceleration_z_peak", unit: G, value: 0.0, min: 0.0, max: 16.0 },
        { name: "kurtosis_z", unit: "", value: 0.0, min: 0.0, max: 100.0 },
        { name: "vibration_z_root", unit: RPM, value: 0.0, min: 0.0, max: 30000.0 },
        { name: "velocity_z_f1", unit: MmPerSecond, value: 0.0, min: 0.0, max: 100.0 },
        { name: "velocity_z_f2", unit: MmPerSecond, value: 0.0, min: 0.0, max: 100.0 },
        { name: "velocity_z_f3", unit: MmPerSecond, value: 0.0, min: 0.0, max: 100.0 },
        { name: "temperature_machineSurface", unit: "°C", value: 0.0, min: -273.15, max: 2000.0 },
        { name: "", unit: "", value: 0.0, min: 0.0, max: 100.0 },
        { name: "kurtosis_ultrasound", unit: "", value: 0.0, min: 0.0, max: 1.0 },
        { name: "sound_sonicRmslog", unit: DB, value: 0.0, min: -150.0, max: 0.0 },
        { name: "", unit: "", value: 0.0, min: 0.0, max: 65535.0 }
    ];

    constructor(name, unit, value) {
        this._name = name;
        this._unit = unit;
        this._value = value;
    }

    getName() {
        return this._name;
    }

    getUnit() {
        return this._unit;
    }

    getValue() {
        return this._value;
    }
}


const CRC_CCITT_TABLE = [
    0x0000, 0x1021, 0x2042, 0x3063, 0x4084, 0x50A5, 0x60C6, 0x70E7,
    0x8108, 0x9129, 0xA14A, 0xB16B, 0xC18C, 0xD1AD, 0xE1CE, 0xF1EF,
    0x1231, 0x0210, 0x3273, 0x2252, 0x52B5, 0x4294, 0x72F7, 0x62D6,
    0x9339, 0x8318, 0xB37B, 0xA35A, 0xD3BD, 0xC39C, 0xF3FF, 0xE3DE,
    0x2462, 0x3443, 0x0420, 0x1401, 0x64E6, 0x74C7, 0x44A4, 0x5485,
    0xA56A, 0xB54B, 0x8528, 0x9509, 0xE5EE, 0xF5CF, 0xC5AC, 0xD58D,
    0x3653, 0x2672, 0x1611, 0x0630, 0x76D7, 0x66F6, 0x5695, 0x46B4,
    0xB75B, 0xA77A, 0x9719, 0x8738, 0xF7DF, 0xE7FE, 0xD79D, 0xC7BC,
    0x48C4, 0x58E5, 0x6886, 0x78A7, 0x0840, 0x1861, 0x2802, 0x3823,
    0xC9CC, 0xD9ED, 0xE98E, 0xF9AF, 0x8948, 0x9969, 0xA90A, 0xB92B,
    0x5AF5, 0x4AD4, 0x7AB7, 0x6A96, 0x1A71, 0x0A50, 0x3A33, 0x2A12,
    0xDBFD, 0xCBDC, 0xFBBF, 0xEB9E, 0x9B79, 0x8B58, 0xBB3B, 0xAB1A,
    0x6CA6, 0x7C87, 0x4CE4, 0x5CC5, 0x2C22, 0x3C03, 0x0C60, 0x1C41,
    0xEDAE, 0xFD8F, 0xCDEC, 0xDDCD, 0xAD2A, 0xBD0B, 0x8D68, 0x9D49,
    0x7E97, 0x6EB6, 0x5ED5, 0x4EF4, 0x3E13, 0x2E32, 0x1E51, 0x0E70,
    0xFF9F, 0xEFBE, 0xDFDD, 0xCFFC, 0xBF1B, 0xAF3A, 0x9F59, 0x8F78,
    0x9188, 0x81A9, 0xB1CA, 0xA1EB, 0xD10C, 0xC12D, 0xF14E, 0xE16F,
    0x1080, 0x00A1, 0x30C2, 0x20E3, 0x5004, 0x4025, 0x7046, 0x6067,
    0x83B9, 0x9398, 0xA3FB, 0xB3DA, 0xC33D, 0xD31C, 0xE37F, 0xF35E,
    0x02B1, 0x1290, 0x22F3, 0x32D2, 0x4235, 0x5214, 0x6277, 0x7256,
    0xB5EA, 0xA5CB, 0x95A8, 0x8589, 0xF56E, 0xE54F, 0xD52C, 0xC50D,
    0x34E2, 0x24C3, 0x14A0, 0x0481, 0x7466, 0x6447, 0x5424, 0x4405,
    0xA7DB, 0xB7FA, 0x8799, 0x97B8, 0xE75F, 0xF77E, 0xC71D, 0xD73C,
    0x26D3, 0x36F2, 0x0691, 0x16B0, 0x6657, 0x7676, 0x4615, 0x5634,
    0xD94C, 0xC96D, 0xF90E, 0xE92F, 0x99C8, 0x89E9, 0xB98A, 0xA9AB,
    0x5844, 0x4865, 0x7806, 0x6827, 0x18C0, 0x08E1, 0x3882, 0x28A3,
    0xCB7D, 0xDB5C, 0xEB3F, 0xFB1E, 0x8BF9, 0x9BD8, 0xABBB, 0xBB9A,
    0x4A75, 0x5A54, 0x6A37, 0x7A16, 0x0AF1, 0x1AD0, 0x2AB3, 0x3A92,
    0xFD2E, 0xED0F, 0xDD6C, 0xCD4D, 0xBDAA, 0xAD8B, 0x9DE8, 0x8DC9,
    0x7C26, 0x6C07, 0x5C64, 0x4C45, 0x3CA2, 0x2C83, 0x1CE0, 0x0CC1,
    0xEF1F, 0xFF3E, 0xCF5D, 0xDF7C, 0xAF9B, 0xBFBA, 0x8FD9, 0x9FF8,
    0x6E17, 0x7E36, 0x4E55, 0x5E74, 0x2E93, 0x3EB2, 0x0ED1, 0x1EF0
];


// A representation of a segmented frame
class SegmentedFrame {

    constructor(frameChunk) {
        this._currentPayload = frameChunk;
        this._expectedLength = frameChunk[0];
        this._nbOfElements = frameChunk[1];
    }

    getCurrentPayload() {
        return this._currentPayload;
    }

    addPayloadChunk(frameChunk) {
        if (frameChunk.length > 0) {
            const temporary = this._currentPayload;
            this._currentPayload = new Uint8Array(temporary.length + frameChunk.length);
            this._currentPayload.set(temporary);
            this._currentPayload.set(frameChunk, temporary.length);
        }
    }

    isComplete() {
        return this._currentPayload.byteLength == this._expectedLength;
    }

    getLength() {
        return this._currentPayload.length - 4;
    }

    getNbElements() {
        return this._nbOfElements;
    }

    // The useful part of a reconstructed frame start 2 bytes after the frame start
    // (as these bytes contain the whole size and the number of elements) and stops
    // 2 bytes before the frame end (these 2 last bytes contain the CRC)
    getUsefulPayload() {
        return this._currentPayload.slice(2, this._currentPayload.length - 2);
    }

    // Check that the reconstructed frame is valid, i.e. there was no transmission problem
    checkCrc() {
        let inputArray = this._currentPayload;
        let crc = 0xFFFF; // initial value for ccitt_false
        let u16mask = 0xFFFF;
        let u8mask = 0xFF;

        for (let i = 0; i < inputArray.byteLength; i++) {
            let currentByte = inputArray[i] & u8mask;
            crc = (crc ^ (currentByte << 8)) & u16mask;
            let tableIndex = (crc >> 8) & u8mask;
            crc = (crc << 8) & u16mask;
            crc = (crc ^ CRC_CCITT_TABLE[tableIndex]) & u16mask;
        }

        return crc === 0;
    }
}


// A class to represent the Sentinel device health
class SentinelDeviceHealth {
    constructor(description, value) {
        this._description = description;
        this._value = value;
      }

    toString() {
        return `${this._description}`;
    }

    getValue() {
        return this._value;
    }

    static getEnum(value) {
        return Object.values(SentinelDeviceHealth)[value];
    }

    // Specifying the numerical value attached to each enum value is just a safety measure, in case someone would introduce new enum values in between.
    // Indeed, these values represent the precise numerical value uplinked in a beacon data frame.
    static LorawanOk = new SentinelDeviceHealth('LoRaWAN Ok', 0);
    static LorawnUnknownUnsollicitedReception = new SentinelDeviceHealth('LoRaWAN unknown unsollicited reception', 1);
    static LorawanInvalidDoubleDataLength = new SentinelDeviceHealth('LoRaWAN invalid double data length', 2);
    static LorawanUnknownTransmissionError = new SentinelDeviceHealth('LoRaWAN unknown transmission error', 3);
    static LorawanPendingTransmission = new SentinelDeviceHealth('LoRaWAN pending transmission', 4);
    static LorawanLinkCheckFailed = new SentinelDeviceHealth('LoRaWAN link check failed', 5);
    static LorawanConsecutiveUnsollicitedMessageMissed = new SentinelDeviceHealth('LoRaWAN consecutive unsollicited message missed', 6);
    static LorawanInvalidParameterReceived = new SentinelDeviceHealth('LoRaWAN invalid parameter received', 7);
    static LorawanModemWakeupFailed = new SentinelDeviceHealth('LoRaWAN modem wakeup failed', 8);
    static LorawanDataRateTooLow = new SentinelDeviceHealth('LoRaWAN data rate too low', 9);
}


// Convert a byte array into an ArrayBuffer
// Used to get integer values from a byte array, taking into account endianess
function byteArrayToUint8Array(byteArray) {
    let uint8Array = new Uint8Array(byteArray.length);
    uint8Array.set(byteArray);
    return uint8Array;
}


// Prepare the decoding result regarding firmware status
function extractFirmwareStatus(lastBootCausesSoftware, lastBootCausesHardware1stByte, lastBootCausesHardware2ndByte) {
    decodeResult.data.firmwareStatus = {
        lastBootCauses: [],
        softwareStatus: ""
    };

    // Register HW-related boot causes
    if ((lastBootCausesHardware2ndByte & 0x1) != 0) {
        decodeResult.data.firmwareStatus.lastBootCauses.push("Low Leakage Wakeup");
    }

    if ((lastBootCausesHardware2ndByte & (0x1 << 1)) != 0) {
        decodeResult.data.firmwareStatus.lastBootCauses.push("Low Voltage Detect Reset");
    }

    if ((lastBootCausesHardware2ndByte & (0x1 << 2)) != 0) {
        decodeResult.data.firmwareStatus.lastBootCauses.push("Loss of Clock Reset");
    }
    
    if ((lastBootCausesHardware2ndByte & (0x1 << 3)) != 0) {
        decodeResult.data.firmwareStatus.lastBootCauses.push("Loss of Lock Reset");
    }
    
    if ((lastBootCausesHardware2ndByte & (0x1 << 5)) != 0) {
        decodeResult.data.firmwareStatus.lastBootCauses.push("Watchdog");
    }
    
    if ((lastBootCausesHardware2ndByte & (0x1 << 6)) != 0) {
        decodeResult.data.firmwareStatus.lastBootCauses.push("External Reset Pin");
    }
    
    if ((lastBootCausesHardware2ndByte & (0x1 << 7)) != 0) {
        decodeResult.data.firmwareStatus.lastBootCauses.push("Power On Reset");
    }
    
    if ((lastBootCausesHardware1stByte & 0x1) != 0) {
        decodeResult.data.firmwareStatus.lastBootCauses.push("Jtag Generated Reset");
    }
    
    if ((lastBootCausesHardware1stByte & (0x1 << 1)) != 0) {
        decodeResult.data.firmwareStatus.lastBootCauses.push("Core Lockup");
    }
    
    if ((lastBootCausesHardware1stByte & (0x1 << 2)) != 0) {
        decodeResult.data.firmwareStatus.lastBootCauses.push("Software - SYSRESETREQ bit");
    }

    if ((lastBootCausesHardware1stByte & (0x1 << 3)) != 0) {
        decodeResult.data.firmwareStatus.lastBootCauses.push("MDM-AP System Reset Request");
    }

    if ((lastBootCausesHardware1stByte & (0x1 << 5)) != 0) {
        decodeResult.data.firmwareStatus.lastBootCauses.push("Stop Mode Acknowledge Error Reset");
    }

    // Register device software-related boot causes
    let lastBootCauseSoftwareAsEnum;
    try {
        lastBootCauseSoftwareAsEnum = SentinelDeviceHealth.getEnum(lastBootCausesSoftware);
        decodeResult.data.firmwareStatus.softwareStatus = lastBootCauseSoftwareAsEnum.toString();
    }
    catch(ex) {
        decodeResult.data.firmwareStatus.softwareStatus = ex.message;
    }
}


// Extract public settings
function extractSchedulingSettings(schedulingSettingsData, vectorView, indexInVector) {
    decodeResult.data.schedulingSettings = {
        activationBitmask: toHexString(schedulingSettingsData.slice(0, 4)),
        ambientPeriodicity: vectorView.getInt16(indexInVector + 4, littleEndian) * SCHEDULING_PERIOD_SCALE_FACTOR,
        predictionPeriodicity: vectorView.getInt16(indexInVector + 6, littleEndian) * SCHEDULING_PERIOD_SCALE_FACTOR,
        introspectionPeriodicity: vectorView.getInt16(indexInVector + 8, littleEndian) * SCHEDULING_PERIOD_SCALE_FACTOR
    };
}


// Store sensor-related information
function setSensorInformation(bitmask) {
    decodeResult.data.advancedSettings.sensorInformation = {
        enumeration: "",
    };

    let sensorEnumeration = bitmask[0];  // 32-bit status data is stored as little endian on firmware and copied as-is

    if ((sensorEnumeration & 0x3) == 0x3) {
        decodeResult.data.advancedSettings.sensorInformation.enumeration += "AnyAccelerometer\n";
    }

    if ((sensorEnumeration & 0xc) == 0xc) {
        decodeResult.data.advancedSettings.sensorInformation.enumeration += "AnyMicrophone";
    }

    // Only supported sensors are accelerometer and microphone
    // If the bitfield contains nothing, then it's an error
    if ((sensorEnumeration & 0xf) === 0) {
        decodeResult.data.advancedSettings.sensorInformation.enumeration = "NoSensor";
        decodeResult.warnings.push("No sensor information in frame, this is unexpected");
    }

    // To-Do : there is a bug here --> the sensor orientation is expressed on 3 bytes, not 1, and not at this place either
    // This must be tested by specifying the orientation for FFT zoom settings in the Grafana plugin
    // and checking the output hex string in the web browser
    let sensorOrientation = bitmask[2];
    if (sensorOrientation == 0) {
        decodeResult.data.advancedSettings.sensorInformation.orientation = "NoOrientation";
    }
    else if (sensorOrientation == 1) {
        decodeResult.data.advancedSettings.sensorInformation.orientation = "XPreferred";
    }
    else if (sensorOrientation == 2) {
        decodeResult.data.advancedSettings.sensorInformation.orientation = "YPreferred";
    }
    else if (sensorOrientation == 4) {
        decodeResult.data.advancedSettings.sensorInformation.orientation = "ZPreferred\n";
    }
}


// Set Wake_On-Event information
// See firmware header file utils/datamodel.h
function setWoeInfos(woeBytes, vectorView, index) {
    let paramsAndFlagAndMode = vectorView.getInt16(index, littleEndian);
    let thresholdAndProfile = vectorView.getInt16(index + 2, littleEndian);

    decodeResult.data.advancedSettings.wakeOnEventInformation = {
        woeMode: paramsAndFlagAndMode & 0xF,
        woeFlag: ((paramsAndFlagAndMode & 0x10) >> 4) == 1,
        woeParam: (paramsAndFlagAndMode & 0xFFE0) >> 5,
        woeProfile: thresholdAndProfile & 0x3,
        woeThreshold: (thresholdAndProfile & 0xFFFC) >> 2,
        woePretrigThreshold: vectorView.getInt16(index + 4, littleEndian),
        woePostrigThreshold: vectorView.getInt16(index + 6, littleEndian),
    }

    switch(decodeResult.data.advancedSettings.wakeOnEventInformation.woeMode) {
        case 0:
            decodeResult.data.advancedSettings.wakeOnEventInformation.woeModeString = "WoeInactive";
            break;
        case 1:
            decodeResult.data.advancedSettings.wakeOnEventInformation.woeModeString = "WoeMotionTrig";
            break;
        case 2:
            decodeResult.data.advancedSettings.wakeOnEventInformation.woeModeString = "WoeMotionTrigAuto";
            break;
        case 3:
            decodeResult.data.advancedSettings.wakeOnEventInformation.woeModeString = "WoeSchedulerTrig";
            break;
        case 4:
            decodeResult.data.advancedSettings.wakeOnEventInformation.woeModeString = "WoeAnalogTrig";
            break;
        case 5:
            decodeResult.data.advancedSettings.wakeOnEventInformation.woeModeString = "WoeContactTrig";
            break;
        default:
            decodeResult.warnings.push(`Unknown Wake-On-Event mode "${decodeResult.data.advancedSettings.wakeOnEventInformation.woeMode}"`);
            break;
    }
}


// Register LoRaWAN configuration in the frame
function setLorawanConfig(bytes, vectorView, arrayIndex, viewIndex) {
    decodeResult.data.advancedSettings.lorawanConfig = {};

    if ((bytes[arrayIndex] & 0x1) != 0) {
        decodeResult.data.advancedSettings.lorawanConfig.adrIsEnabled = true;
    }
    else {
        decodeResult.data.advancedSettings.lorawanConfig.adrIsEnabled = false;
    }

    if ((bytes[arrayIndex] & (0x1 << 1)) != 0) {
        decodeResult.data.advancedSettings.lorawanConfig.transmissionIsAcked = true;
    }
    else {
        decodeResult.data.advancedSettings.lorawanConfig.transmissionIsAcked = false;
    }

    if ((bytes[arrayIndex] & (0x1 << 2)) != 0) {
        decodeResult.data.advancedSettings.lorawanConfig.networkIsPrivate = true;
    }
    else {
        decodeResult.data.advancedSettings.lorawanConfig.networkIsPrivate = false;
    }

    if ((bytes[arrayIndex] & (0x1 << 3)) != 0) {
        decodeResult.data.advancedSettings.lorawanConfig.lorawanCodingRateIsBase = true;
    }
    else {
        decodeResult.data.advancedSettings.lorawanConfig.lorawanCodingRateIsBase = false;
    }

    if ((bytes[arrayIndex] & (0x1 << 4)) != 0) {
        decodeResult.data.advancedSettings.lorawanConfig.dwellTimeIsOn = true;
    }
    else {
        decodeResult.data.advancedSettings.lorawanConfig.dwellTimeIsOn = false;
    }

    if ((bytes[arrayIndex] & (0x1 << 5)) != 0) {
        decodeResult.data.advancedSettings.lorawanConfig.retransmitAckTwice = true;
    }
    else {
        decodeResult.data.advancedSettings.lorawanConfig.retransmitAckTwice = false;
    }

    if ((bytes[arrayIndex] & (0x1 << 6)) != 0) {
        decodeResult.data.advancedSettings.lorawanConfig.packetSplitIsEnabled = true;
    }
    else {
        decodeResult.data.advancedSettings.lorawanConfig.packetSplitIsEnabled = false;
    }

    decodeResult.data.advancedSettings.lorawanConfig.specialFrequencySettings = vectorView.getInt16(viewIndex + 2, littleEndian);
    decodeResult.data.advancedSettings.lorawanConfig.linkCheckPeriod = vectorView.getInt16(viewIndex + 4, littleEndian);
}


// Extract private settings
function extractAdvancedSettings(advancedSettingsData, vectorView, indexInVector) {
    decodeResult.data.advancedSettings = {
        sensorInformationBitmask: toHexString(advancedSettingsData.slice(0, 4)),
    };

    setSensorInformation(advancedSettingsData);

    decodeResult.data.advancedSettings.frequencies = {
        sonicFrequencyHigh: vectorView.getInt16(indexInVector + 4, littleEndian) * SONIC_FREQUENCY_SCALE_FACTOR,
        sonicFrequencyLow: vectorView.getInt16(indexInVector + 6, littleEndian) * SONIC_FREQUENCY_SCALE_FACTOR,
        vibrationFrequencyHigh: vectorView.getInt16(indexInVector + 8, littleEndian),
        vibrationFrequencyLow: vectorView.getInt16(indexInVector + 10, littleEndian),
    }

    decodeResult.data.advancedSettings.rotationSpeedBoundaries = {
        rpmUpperBoundary: vectorView.getInt16(indexInVector + 12, littleEndian) * RPM_SCALE_FACTOR,
        rpmLowerBoundary: vectorView.getInt16(indexInVector + 14, littleEndian) * RPM_SCALE_FACTOR,
    }

    decodeResult.data.advancedSettings.mileageThreshold = vectorView.getInt16(indexInVector + 16, littleEndian);
    decodeResult.data.advancedSettings.referenceCustomParam = vectorView.getInt16(indexInVector + 18, littleEndian);
    decodeResult.data.advancedSettings.customSpectrumType = vectorView.getInt16(indexInVector + 20, littleEndian);
    decodeResult.data.advancedSettings.customSpectrumParam = vectorView.getInt16(indexInVector + 22, littleEndian);
    decodeResult.data.advancedSettings.woeBitmask = toHexString(advancedSettingsData.slice(24, 4));

    setWoeInfos(advancedSettingsData, vectorView, indexInVector + 24);

    setLorawanConfig(advancedSettingsData, vectorView, 32, indexInVector + 32);
}


// Extract signature settings
function extractExtensionSettings(signatureSettings) {
    // Not implemented yet
}


// Extract system status data
// The "vector" argument points to the start of the status data, i.e. the first byte following the vector type
// Thus it points to the byte representing the data indicator and is followed by the "last boot cause" 32-bit field
function extractSystemStatusData(vector, vectorView) {

    // Prepare result data structure
    decodeResult.data.advancedSettings = {}

    // Get last boot causes (software)
    let lastBootCausesSoftware = vectorView.getInt16(0, littleEndian);

    // Get last boot causes (hardware)
    let lastBootCausesHardware1stByte = vector[2];
    let lastBootCausesHardware2ndByte = vector[3];

    extractFirmwareStatus(lastBootCausesSoftware, lastBootCausesHardware1stByte, lastBootCausesHardware2ndByte);

    // Extract the version number
    let indexInVector = 4;    // 4 bytes for the last boot causes
    let firmwareVersionAsBytes = vector.slice(indexInVector, indexInVector + 5);    // The firmware version is represented by 5 bytes
    decodeResult.data.firmwareVersion = String.fromCharCode(...firmwareVersionAsBytes);

    // Extract scheduling settings
    indexInVector += 5;
    extractSchedulingSettings(vector.slice(indexInVector, indexInVector + 10), vectorView, indexInVector);

    // Extract private settings
    indexInVector += 10;
    extractAdvancedSettings(vector.slice(indexInVector, indexInVector + 38), vectorView, indexInVector);

    // Extract signature settings
    indexInVector += 38;
    extractExtensionSettings(vector.slice(indexInVector));
}


// Process a vector in the data frame
// The "vector" argument points to the first byte following the "vectorType" argument, which represents the type of vector
function processVectorContent(vector, vectorType, nbElements, vectorView) {

    // Case where the vector type is unknown
    if (VECTOR_TYPES.includes(vectorType) === false) {
        decodeResult.errors.push(`Unknown vector type (${vectorType})`);
        return;
    }

    switch(vectorType) {
        case SHOCK_DETECTION_VECTOR:
            break;

        case SIGNATURE_VECTOR:
            decodeResult.data.signatureValues = extractSignatureValues(vectorView, nbElements);
            break;

        case SIGNATURE_REFEFENCE:
            break;

        case SIGNATURE_EXTENSIONS:
            break;

        case SYSTEM_STATUS_REPORT:
            extractSystemStatusData(vector, vectorView);
            break;

        default:
            // Should not occur (except if modified in another thread - ok, forget it !)
            break;
    }
}

function buf2hex(buffer) { // buffer is an ArrayBuffer
    return [...new Uint8Array(buffer)]
        .map(x => x.toString(16).padStart(2, '0'))
        .join('');
}

// Extract physical values from a signature vector
// The input vector argument is a Buffer
function extractSignatureValues(vectorView, nbElements) {
    let signatureValues = [];
    // let arrayBuffer = vectorView.buffer;

    for (let frameIndex = 0, measurementIndex = 0; frameIndex < nbElements*VECTOR_ELEMENT_VALUE_SIZE - 2; frameIndex += VECTOR_ELEMENT_VALUE_SIZE, ++measurementIndex) {
        // let valueBuffer = arrayBuffer.slice(frameIndex, frameIndex + 2);
        // decodeResult.warnings.push(`Buffer value = ${buf2hex(valueBuffer)}`);

        // Check whether architecture is little endian or not
        let valueInFrame = vectorView.getUint16(frameIndex, littleEndian);
        // decodeResult.warnings.push(`For ${PhysicalValue.signaturePhysicalValues[measurementIndex].name} : raw value = ${valueInFrame}`);
        let scale = 65535;
        let physicalValue;

        // Skip values that are not useful anymore
        if (PhysicalValue.signaturePhysicalValues[measurementIndex].name === "") {
            continue;
        }

        physicalValue = valueInFrame * (PhysicalValue.signaturePhysicalValues[measurementIndex].max - PhysicalValue.signaturePhysicalValues[measurementIndex].min) / scale + PhysicalValue.signaturePhysicalValues[measurementIndex].min;

        let valueItem = PhysicalValue.signaturePhysicalValues[measurementIndex];
        valueItem.value = physicalValue;

        signatureValues.push(valueItem);
    }

    return signatureValues;
}


// This method extracts scalar values from the frame.
function extractScalarValues(nbScalars) {
    let scalarValues = [];
    let unit = "";
    let name = "";
    let valueInFrame;

    for (let i = 0; i < nbScalars * SCALAR_VALUE_SIZE; i += SCALAR_VALUE_SIZE) {
        valueInFrame = globalView.getUint16(i+1, littleEndian);

        let min = 0.0, max = 100.0;
        let scale = 65535;
        let physicalValue;

        let valueToCompute = true;

        switch (inputData.bytes[i]) {
            case BATTERY_LEVEL_IDENTIFIER:
                name = "Battery level";
                unit = "Volt";
                break;
            case CURRENT_LOOP_IDENTIFIER:
                name = "Current loop";
                min = 0;        
                max = 30;
                break;
            case HUMIDITY_IDENTIFIER:
                name = "Humidity";
                unit = "% rH";
                break;
            case TEMPERATURE_IDENTIFIER:
                name = "Ambient temperature";
                unit = "°C";
                min = -273.15;
                max = 2000;
                break;
            default:
                decodeResult.warnings.push(`Unindentified scalar value indicator (${globalFrame[i]})`);
                valueToCompute = false;
                break;
        }

        if (valueToCompute) {
            physicalValue = valueInFrame * (max - min) / scale + min;
            let valueItem = new PhysicalValue(name, unit, physicalValue);
            scalarValues.push(valueItem);
        }
    }

    decodeResult.data.scalarValues = scalarValues;
}

/**
 * Decode uplink
 * @param {Object} input - An object provided by the IoT Flow framework
 * @param {number[]} input.bytes - Array of bytes represented as numbers as it has been sent from the device
 * @param {number} input.fPort - The Port Field on which the uplink has been sent
 * @param {Date} input.recvTime - The uplink message time recorded by the LoRaWAN network server
 * @returns {DecodedUplink} The decoded object
 */
function decodeUplink(input) {
    // Set value of some global variables
    decodeResult = {
        data: {
            timeStamp: input.recvTime
        },
        errors: [],
        warnings: [],
    };

    // Case where data seem corrupted
    if (input.fPort > 105) {
        decodeResult.errors.push(`Invalid number of elements in frame (${input.fPort})`);
        return decodeResult;
    }

    // Get first element id
    let elementId = input.bytes[0];

    // Manage system status report from old beacons as system status report from recent ones
    if (input.fPort == 67 && elementId == 0xFF) {
        if (input.bytes.length == 84) {
            input.fPort = 1;
        }
        else {
            decodeResult.errors.push("Inconsistent data from frame (looks partly as a system status report)");
            return decodeResult;
        }
    }

    // Case of the first chunk of a segmented frame
    if (input.fPort == 100) {
        _segmentedFrame = new SegmentedFrame(input.bytes);
        decodeResult.warnings.push("First frame of a segmented data frame; additional data frames are needed");
        return decodeResult;
    }

    // Case of an intermediary or final segmented frame chunk
    if ((input.fPort > 100) && (input.fPort < 105)) {
        if (_segmentedFrame == null) {
            decodeResult.warnings.push("This is a following chunk of a segmented frame, but the first one has been lost");
            return decodeResult;
        }

        _segmentedFrame.addPayloadChunk(input.bytes);

        // Not the final chunk --> current frame chunk fully processed
        if (! _segmentedFrame.isComplete()) {
            decodeResult.warnings.push("Complementary frame of a segmented data frame; additional data frames are needed");
            return decodeResult;
        }

        // Final chunk received --> prepare further processing
        if (_segmentedFrame.checkCrc()) {
            input.bytes = _segmentedFrame.getUsefulPayload();
            input.fPort = _segmentedFrame.getNbElements();
            _segmentedFrame = null;
        }

        // Case where there was a problem during transmission
        else {
            decodeResult.errors.push("Frame segmentation problem (CRC check failed)");
            return decodeResult;
        }
    }

    inputData = input;
    globalFrame = byteArrayToUint8Array(inputData.bytes);
    globalView = new DataView(globalFrame.buffer);
    elementCount = inputData.fPort;

    let nbScalars;
    let vectorInFrame = false;

    // Case where there is no vector
    if (inputData.bytes.length == (elementCount * SCALAR_VALUE_SIZE)) {  // 2 characters are needed to represent a byte in hex format
        nbScalars = elementCount;
    }

    // Possible error case
    else {
        if (inputData.bytes.length < (elementCount * SCALAR_VALUE_SIZE)) {
            decodeResult.errors.push(`Inconsistent number of elements in frame (${elementCount}) and frame length (${inputData.bytes.length / 2})`);
            return decodeResult;
        }

        // There is a vector and possibly some scalars
        else {
            nbScalars = elementCount - 1;
            vectorInFrame = true;
        }
    }

    // Extract scalar values from frame
    if (nbScalars > 0) {
        extractScalarValues(nbScalars);
    }

    // Extract vector content
    if (vectorInFrame) {
        let vectorStart = nbScalars * SCALAR_VALUE_SIZE + 1;
        let vector = inputData.bytes.slice(vectorStart);
        let vectorType = inputData.bytes[nbScalars*SCALAR_VALUE_SIZE];
        let nbElements = vector.length / VECTOR_ELEMENT_VALUE_SIZE;
        let uint8Array = new Uint8Array(vector.length);
        uint8Array.set(vector);
        let vectorView = new DataView(uint8Array.buffer);

        processVectorContent(vector, vectorType, nbElements, vectorView);
    }

    return decodeResult;
}

/**
 * @typedef {Object} EncodedDownlink
 * @property {number[]} bytes - Array of bytes represented as numbers as it will be sent to the device
 * @property {number} fPort - The Port Field on which the downlink must be sent
 * @property {string[]} errors - A list of error messages while encoding the downlink object
 * @property {string[]} warnings - A list of warning messages that do not prevent the driver from encoding the downlink object
 */

/**
 * Downlink encode
 * @param {Object} input - An object provided by the IoT Flow framework
 * @param {Object} input.data - The higher-level object representing your downlink
 * @returns {EncodedDownlink} The encoded object
 */
function encodeDownlink(input) {
    let output = {
        fPort: undefined,
        bytes: undefined,
        errors: "Not yet implemented"
    };
    return output;
}


/**
 * @typedef {Object} DecodedDownlink
 * @property {Object} data - The open JavaScript object representing the decoded downlink payload when no errors occurred
 * @property {string[]} errors - A list of error messages while decoding the downlink payload
 * @property {string[]} warnings - A list of warning messages that do not prevent the driver from decoding the downlink payload
 */

/**
 * Downlink decode
 * @param {Object} input - An object provided by the IoT Flow framework
 * @param {number[]} input.bytes - Array of bytes represented as numbers as it will be sent to the device
 * @param {number} input.fPort - The Port Field on which the downlink must be sent
 * @param {Date} input.recvTime - The uplink message time computed by the IoT Flow framework
 * @returns {DecodedDownlink} The decoded object
 */
function decodeDownlink(input) {
    let output = {
        data: undefined,
        errors: "Not yet implemented"
    };
    return output;
}

exports.decodeUplink = decodeUplink;
exports.decodeDownlink = decodeDownlink;
exports.encodeDownlink = encodeDownlink;