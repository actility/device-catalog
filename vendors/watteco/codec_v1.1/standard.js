const { UintToInt, Bytes2Float32, BytesToInt64, decimalToHex, zeroPad, BytesToHexStr } = require("./convert_tools.js");

class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = "ValidationError";
    }
}

const attribute_types={
    0x10:{
        name:"boolean",
        size:1
    },
    0x08:{
        name:"general8",
        size:1
    },
    0x09:{
        name:"general16",
        size:2
    },
    0x0A:{
        name:"general24",
        size:3
    },
    0x0B:{
        name:"general32",
        size:4
    },
    0x18:{
        name:"bitmap8",
        size:1
    },
    0x19:{
        name:"bitmap16",
        size:2
    },
    0x20:{
        name:"uint8",
        size:1
    },
    0x21:{
        name:"uint16",
        size:2
    },
    0x22:{
        name:"uint24",
        size:3
    },
    0x23:{
        name:"uint32",
        size:4
    },
    0x28:{
        name:"int8",
        size:1
    },
    0x29:{
        name:"int16",
        size:2
    },
    0x2A:{
        name:"int24",
        size:3
    },
    0x2B:{
        name:"int32",
        size:4
    },
    0x30:{
        name:"enum8",
        size:1
    },
    0x42:{
        name:"char string",
        size:1
    },
    0x41:{
        name:"bytes string",
        size:1
    },
    0x43:{
        name:"long bytes string",
        size:2
    },
    0x4C:{
        name:"structured ordered sequence",
        size:2
    },
    0x39:{
        name:"single",
        size:4
    }

}

const field={
    0x800A:{
        0x0000:{
            0:{
                divider:1,
                function_type:"int",
                name:"positive_active_energy",
                size:4
            },
            1:{
                divider:1,
                function_type:"int",
                name:"negative_active_energy",
                size:4
            },
            2:{
                divider:1,
                function_type:"int",
                name:"positive_reactive_energy",
                size:4
            },
            3:{
                divider:1,
                function_type:"int",
                name:"negative_reactive_energy",
                size:4
            },
            4:{
                divider:1,
                function_type:"int",
                name:"positive_active_power",
                size:4
            },
            5:{
                divider:1,
                function_type:"int",
                name:"negative_active_power",
                size:4
            },
            6:{
                divider:1,
                function_type:"int",
                name:"positive_reactive_power",
                size:4
            },
            7:{
                divider:1,
                function_type:"int",
                name:"negative_reactive_power",
                size:4
            },
        }
    },
    0x8010:{
        0x0000:{
            0:{
                divider:1,
                function_type:"int",
                name:"active_energy_a",
                size:4
            },
            1:{
                divider:1,
                function_type:"int",
                name:"reactive_energy_a",
                size:4
            },
            2:{
                divider:1,
                function_type:"int",
                name:"active_energy_b",
                size:4
            },
            3:{
                divider:1,
                function_type:"int",
                name:"reactive_energy_b",
                size:4
            },
            4:{
                divider:1,
                function_type:"int",
                name:"active_energy_c",
                size:4
            },
            5:{
                divider:1,
                function_type:"int",
                name:"reactive_energy_c",
                size:4
            },
            6:{
                divider:1,
                function_type:"int",
                name:"active_energy_abc",
                size:4
            },
            7:{
                divider:1,
                function_type:"int",
                name:"reactive_energy_abc",
                size:4
            },
        },
        0x0001:{
            0:{
                divider:1,
                function_type:"int",
                name:"active_power_a",
                size:4
            },
            1:{
                divider:1,
                function_type:"int",
                name:"reactive_power_a",
                size:4
            },
            2:{
                divider:1,
                function_type:"int",
                name:"active_power_b",
                size:4
            },
            3:{
                divider:1,
                function_type:"int",
                name:"reactive_power_b",
                size:4
            },
            4:{
                divider:1,
                function_type:"int",
                name:"active_power_c",
                size:4
            },
            5:{
                divider:1,
                function_type:"int",
                name:"reactive_power_c",
                size:4
            },
            6:{
                divider:1,
                function_type:"int",
                name:"active_power_abc",
                size:4
            },
            7:{
                divider:1,
                function_type:"int",
                name:"reactive_power_abc",
                size:4
            },
        }
    },
    0x800B:{
        0x0000:{
            0:{
                divider:10,
                function_type:"int",
                name:"Vrms",
                size:2
            },
            1:{
                divider:10,
                function_type:"int",
                name:"Irms",
                size:2
            },
            2:{
                divider:1,
                function_type:"int",
                name:"angle",
                size:2
            },
        }
    },
    0x800D:{
        0x0000:{
            0:{
                divider:10,
                function_type:"int",
                name:"Vrms_a",
                size:2
            },
            1:{
                divider:10,
                function_type:"int",
                name:"Irms_a",
                size:2
            },
            2:{
                divider:1,
                function_type:"int",
                name:"angle_a",
                size:2
            },
            3:{
                divider:10,
                function_type:"int",
                name:"Vrms_b",
                size:2
            },
            4:{
                divider:10,
                function_type:"int",
                name:"Irms_b",
                size:2
            },
            5:{
                divider:1,
                function_type:"int",
                name:"angle_b",
                size:2
            },
            6:{
                divider:10,
                function_type:"int",
                name:"Vrms_c",
                size:2
            },
            7:{
                divider:10,
                function_type:"int",
                name:"Irms_c",
                size:2
            },
            8:{
                divider:1,
                function_type:"int",
                name:"angle_c",
                size:2
            },
        }
    },
    0x8052:{
        0x0000:{
            0:{
                divider:1000,
                function_type:"int",
                name:"frequency",
                size:2
            },
            1:{
                divider:1000,
                function_type:"int",
                name:"frequency_min",
                size:2
            },
            2:{
                divider:1000,
                function_type:"int",
                name:"frequency_max",
                size:2
            },
            3:{
                divider:10,
                function_type:"int",
                name:"Vrms",
                size:2
            },
            4:{
                divider:10,
                function_type:"int",
                name:"Vrms_min",
                size:2
            },
            5:{
                divider:10,
                function_type:"int",
                name:"Vrms_max",
                size:2
            },
            6:{
                divider:10,
                function_type:"int",
                name:"Vpeak",
                size:2
            },
            7:{
                divider:10,
                function_type:"int",
                name:"Vpeak_min",
                size:2
            },
            8:{
                divider:10,
                function_type:"int",
                name:"Vpeak_max",
                size:2
            },
            9:{
                divider:1,
                function_type:"int",
                name:"over_voltage",
                size:2
            },
            10:{
                divider:1,
                function_type:"int",
                name:"sag_voltage",
                size:2
            },
            11:{
                divider:1,
                function_type:"int",
                name:"brownout_number",
                size:2
            }
        }
    },
    0x8005:{
        0x0000:{
            0:{
                divider:1,
                function_type:"none",
                name:"pin_state_1",
                size:1
            },
            1:{
                divider:1,
                function_type:"none",
                name:"pin_state_2",
                size:1
            },
            2:{
                divider:1,
                function_type:"none",
                name:"pin_state_3",
                size:1
            },
            3:{
                divider:1,
                function_type:"none",
                name:"pin_state_4",
                size:1
            },
            4:{
                divider:1,
                function_type:"none",
                name:"pin_state_5",
                size:1
            },
            5:{
                divider:1,
                function_type:"none",
                name:"pin_state_6",
                size:1
            },
            6:{
                divider:1,
                function_type:"none",
                name:"pin_state_7",
                size:1
            },
            7:{
                divider:1,
                function_type:"none",
                name:"pin_state_8",
                size:1
            },
            8:{
                divider:1,
                function_type:"none",
                name:"pin_state_9",
                size:1
            },
            9:{
                divider:1,
                function_type:"none",
                name:"pin_state_10",
                size:1
            },
        }
    },
    0x0050:{
        0x0006:{
            0:{
                divider:1000,
                function_type:"none",
                name:"power_modes",
                size:2
            },
            1:{
                divider:1000,
                function_type:"none",
                name:"current_power_source",
                size:2
            },
            2:{
                divider:1000,
                function_type:"none",
                name:"constant_power",
                size:2
            },
            3:{
                divider:1000,
                function_type:"none",
                name:"rechargeable_battery",
                size:2
            },
            4:{
                divider:1000,
                function_type:"none",
                name:"disposable_battery",
                size:2
            },
            5:{
                divider:1000,
                function_type:"none",
                name:"solar_harvesting",
                size:2
            },
            6:{
                divider:1000,
                function_type:"none",
                name:"TIC_harvesting",
                size:2
            },
        }
    }
}

function decimalToBitString(dec){
    let bitString = "";
    let bin = dec.toString(2);
    bitString += zeroPad(bin, 8);
    return bitString;
}

function decodeNumber(bytes, startIndex, type) {
    let value = 0;
    let size = 0;

    // Determine size based on type
    switch(type) {
        case 0x08: case 0x18: case 0x20: case 0x28: case 0x30: 
            size = 1; break;
        case 0x09: case 0x19: case 0x21: case 0x29: 
            size = 2; break;
        case 0x0a: case 0x1a: case 0x22: case 0x2a: 
            size = 3; break;
        case 0x0b: case 0x1b: case 0x23: case 0x2b: 
            size = 4; break;
        case 0x0c: 
            size = 5; break;
        case 0x0d: case 0x25: 
            size = 6; break;
        case 0x39:
            return Bytes2Float32(bytes[startIndex]*256*256*256 + bytes[startIndex+1]*256*256 + bytes[startIndex+2]*256 + bytes[startIndex+3]);
        default:
            throw new Error("Unsupported number type: " + type);
    }

    // Read bytes
    for(let i = 0; i < size; i++) {
        value = (value << 8) | bytes[startIndex + i];
    }

    // Handle signed integers
    if(type >= 0x28 && type <= 0x2b) {
        return UintToInt(value, size);
    }

    return value;
}

function int(value){
    return parseInt(value, 2)
}


function decodeAlarms(
	cmdId, clustID, attID, 
    byteArray, startIndex,
    defaultTypeKind, defaultTypeSize, defaultDivider, withFieldIndex
) {

    let decodedData = {
        reportCauses: [],
        causesMessages: []
    };

	if (cmdId===0x8a){
		decodedData.causesMessages.push("alarm triggered")
	}

    let index = startIndex;
    if (index >= byteArray.length) {
        return decodedData;
    }
	
	let isLongCause = false;
	let causeType = (byteArray[startIndex] >>= 4) & 0x03;
	if (causeType == 0x02) isLongCause = true;
	else if (causeType != 0x01) {
        throw new Error(`Alarm decoding: Unexpected cause type. (ReportParams byte = ${byteArray[startIndex]})`);
	}
    
	index++;
    if (index >= byteArray.length) {
        decodedData.causesMessages.push("cause:{}");
        return decodedData;
    }

	let defaultAlarmField = "FieldUndef !";

    function readValue(kind, size, divider) {
        if (index + size - 1 >= byteArray.length) {
            throw new Error("Alarm decoding: Unexpected end of data while reading value.");
        }

        let value = 0;
        for (let i = 0; i < size; i++) {
            value = (value << 8) | byteArray[index++];
        }
        if (kind === "int") {
            value = UintToInt(value, size);

        } else if (kind === "float") {
            if (size !== 4) {
                throw new Error("Alarm decoding: Invalid float size. Only 4 bytes are supported.");
            }
            value = Bytes2Float32(value);

        } else {
            throw new Error("Alarm decoding: Unknown type kind: " + kind);
        }
        return value / divider;
    }

    while (index < byteArray.length) {
        let criterion = {};

        if (index >= byteArray.length) throw new Error("Alarm decoding: Unexpected end of data before reading CSD.");

        let csd = byteArray[index++];
        criterion.criterionIndex = csd & 0x07;
        let mode = (csd >> 3) & 0x03;
        criterion.mode = mode === 1 ? "delta" : mode === 2 ? "threshold" : "unused";
        criterion.hasFallen = (csd & 0x20) !== 0;
        criterion.hasExceeded = (csd & 0x40) !== 0;
        criterion.isAlarm = (csd & 0x80) !== 0;

        let qual = criterion.hasExceeded && criterion.hasFallen ? "exceed&fall" :
            criterion.hasExceeded ? "exceed" : 
			criterion.hasFallen ? "fall": "";

        let value, gap, count, countUp, countDown, alarmField = undefined;
        let fi = null;

        if (isLongCause) {
            if (index >= byteArray.length) throw new Error("Alarm decoding: Unexpected end of data before reading FI.");

            let typeKindFI = defaultTypeKind;
            let sizeFI = defaultTypeSize;
            let dividerFI = defaultDivider;
            criterion.fieldIndex = 0;

            if ((withFieldIndex !== null) && (withFieldIndex !== undefined) && (withFieldIndex === true)) {
                fi = byteArray[index++];
                criterion.fieldIndex = fi;

                if (field[clustID] && field[clustID][attID] && field[clustID][attID][fi]) {
                    let fieldConfig = field[clustID][attID][fi];
                    typeKindFI = fieldConfig.function_type || defaultTypeKind;
                    sizeFI = fieldConfig.size || defaultTypeSize;
                    dividerFI = fieldConfig.divider || defaultDivider;
                    alarmField = fieldConfig.name || defaultAlarmField;
                }
            }

            value = readValue(typeKindFI, sizeFI, dividerFI);

            if (criterion.mode === "threshold") {
                gap = readValue(typeKindFI, sizeFI, dividerFI);
            }
        }

        if (criterion.mode === "threshold" && isLongCause) {
            if (index >= byteArray.length) throw new Error("Alarm decoding: Unexpected end of data before reading Occ.");
            let occ = byteArray[index++];
            count = occ;

            if (occ > 0 && (occ & 0x80) !== 0) {
                if (index + 3 >= byteArray.length) throw new Error("Alarm decoding: Invalid OccH or OccL read.");
                countUp = (byteArray[index++] << 8) | byteArray[index++];
                countDown = (byteArray[index++] << 8) | byteArray[index++];
            }
        }

        decodedData.reportCauses.push(criterion);

        // Construct cause message
        let mess;
        if (!isLongCause) {
            mess = `cause:{alarm:${criterion.isAlarm}, criterion_index: ${criterion.criterionIndex}, mode: ${criterion.mode}`;
            if (criterion.mode === "threshold") mess += `, crossing: ${qual}`;
            mess += "}";
        } else {
            if (criterion.mode === "threshold") {
                if (countUp !== undefined) {
                    mess = `cause:{alarm:${criterion.isAlarm}, criterion_index: ${criterion.criterionIndex}, mode: threshold, crossing: ${qual}, value: ${value}, gap: ${gap}, occurences_up: ${countUp}, occurences_down: ${countDown}`;
                } else {
                    mess = `cause:{alarm:${criterion.isAlarm}, criterion_index: ${criterion.criterionIndex}, mode: threshold, crossing: ${qual}, value: ${value}, gap: ${gap}, occurences: ${count}`;
                }
            } else {
                mess = `cause:{alarm:${criterion.isAlarm}, criterion_index: ${criterion.criterionIndex}, mode: delta, value: ${value}`;
            }

            if (alarmField) mess += `, field: ${alarmField}`;
            mess += "}";
        }

        decodedData.causesMessages.push(mess);
    }

    if (index !== byteArray.length) {
        throw new Error(`Alarm decoding: Remaining unprocessed bytes detected. Expected ${byteArray.length}, but stopped at ${index}.`);
    }

    return decodedData;
}


function processAlarm(cmdId, clustID, attID, bytes, decoded, startIndex, attribute_type, divider, ftype, withFieldIndex)
{
    if ((cmdId !== 0x8a) && (cmdId != 0x0a)) return;

    let type = attribute_types[attribute_type]
    let function_type = ftype
    let size = type.size
    let name = type.name
    
    if (function_type===undefined){
        if (name==="single"){
            function_type = "float"
        }
        else if ((name==="int8")||(name==="int16")||(name==="int32")){
            function_type = "int"
        }
        else{
            function_type = "none"
        }
    }

    let alarms = decodeAlarms(
        cmdId, clustID, attID, 
        bytes, startIndex,
        function_type, size, divider,
        withFieldIndex);

    decoded.zclheader.alarmmsg = alarms.causesMessages;

}

function Decoder(bytes, port, TIC_Decode = null) {
    let decoded = {};
    let knowncmdID=0
    decoded.lora = {};
    decoded.lora.port  = port;
    let bytes_len_	= bytes.length;
    let temp_hex_str = ""
    decoded.lora.payload  = "";
    for( let j = 0; j < bytes_len_; j++ )
    {
        temp_hex_str = bytes[j].toString( 16 ).toUpperCase();
        if( temp_hex_str.length === 1 ) temp_hex_str = "0" + temp_hex_str;
        decoded.lora.payload += temp_hex_str;
        let date = new Date();
        decoded.lora.date = date.toISOString();
    }
    if (port === 125)
    {
       let batch = !(bytes[0] & 0x01);
        if (batch === false){
            decoded.zclheader = {};
            decoded.zclheader.report =  "standard";
            let attID = -1;
            let cmdID = -1;
            let clustID = -1;
            decoded.zclheader.endpoint = ((bytes[0]&0xE0)>>5) | ((bytes[0]&0x06)<<2);
            cmdID =  bytes[1]; decoded.zclheader.cmdID = decimalToHex(cmdID,2);
            clustID = bytes[2]*256 + bytes[3]; 
            decoded.zclheader.clustID = decimalToHex(clustID,4);
            if((cmdID === 0x0a)||(cmdID === 0x8a)||(cmdID === 0x01)){
                knowncmdID=1
                decoded.data = {};
                attID = bytes[4]*256 + bytes[5];decoded.zclheader.attID = decimalToHex(attID,4);
                let firsthalfattID = bytes[4]
                let i1 = 0
                if ((cmdID === 0x0a) || (cmdID === 0x8a)) i1 = 7;
                if (cmdID === 0x8a) decoded.zclheader.alarm = 1;
                if (cmdID === 0x01)	{i1 = 8; decoded.zclheader.status = bytes[6];}

                if (( clustID === 0x0053 ) || ( clustID === 0x0054 ) || ( clustID === 0x0055 ) || ( clustID === 0x0056 )  || ( clustID === 0x0057 )) {
                    if (typeof TIC_Decode === "function") {
                        decoded.data = TIC_Decode(clustID,attID,bytes.slice(i1 + 1)); 
                    } else {
                        throw new ValidationError("TIC_Decode function not found")
                    }
                }

                if ((clustID === 0x0000 ) && (attID === 0x0002)){
                    decoded.data.firmware=""
                    for (let i = 0; i < 3; i++) {
                        decoded.data.firmware += String(bytes[i1 + i]);
                        if (i < 2) decoded.data.firmware += "."
                    }
                    let rcbuild = bytes[i1+3]*256*256+bytes[i1+4]*256+bytes[i1+5]
                    decoded.data.firmware += "."+rcbuild.toString()
                }
                if ((clustID === 0x0000 ) && (attID === 0x0003)){
                    const length = bytes[i1];
                    decoded.data.kernel=""
                    for (let i = 0; i < length; i++) {
                        decoded.data.kernel += String.fromCharCode(bytes[i1 + 1 + i]);

                    }
                }
                if ((clustID === 0x0000 ) && (attID === 0x0004)){
                    const length = bytes[i1];
                    decoded.data.manufacturer=""
                    for (let i = 0; i < length; i++) {
                        decoded.data.manufacturer += String.fromCharCode(bytes[i1 + 1 + i]);
                    }
                }
                if ((clustID === 0x0000 ) && (attID === 0x0005)){
                    const length = bytes[i1];
                    decoded.data.model=""
                    for (let i = 0; i < length; i++) {
                        decoded.data.model += String.fromCharCode(bytes[i1 + 1 + i]);
                    }
                }
                if ((clustID === 0x0000 ) && (attID === 0x0006)){
                    const length = bytes[i1];
                    decoded.data.date=""
                    for (let i = 0; i < length; i++) {
                        decoded.data.date += String.fromCharCode(bytes[i1 + 1 + i]);
                    }
                }
                if ((clustID === 0x0000 ) && (attID === 0x0010)){
                    const length = bytes[i1];
                    decoded.data.position=""
                    for (let i = 0; i < length; i++) {
                        decoded.data.position += String.fromCharCode(bytes[i1 + 1 + i]);
                    }
                }
                if ((clustID === 0x0000 ) && (attID === 0x8001)){
                    const length = bytes[i1];
                    decoded.data.application_name=""
                    for (let i = 0; i < length; i++) {
                        decoded.data.application_name += String.fromCharCode(bytes[i1 + 1 + i]);
                    }
                }

                if ((clustID === 0x0402 ) && (attID === 0x0000)) {
                    const attribute_type = bytes[i1-1]
                    decoded.data.temperature = (UintToInt(bytes[i1]*256+bytes[i1+1],2))/100;
                    const RPIndex = i1+2;
                    processAlarm(cmdID, clustID, attID, bytes, decoded, RPIndex, attribute_type, 100, "int", );
                }
                if ((clustID === 0x0402 ) && (attID === 0x0001)) {
                    decoded.data.min_temperature = (UintToInt(bytes[i1]*256+bytes[i1+1],2))/100;
                }
                if ((clustID === 0x0402 ) && (attID === 0x0002)) {
                    decoded.data.max_temperature = (UintToInt(bytes[i1]*256+bytes[i1+1],2))/100;
                }
                if ((clustID === 0x0405 ) && (attID === 0x0000)){
                    const attribute_type = bytes[i1-1]
                    decoded.data.humidity = (bytes[i1]*256+bytes[i1+1])/100;
                    const RPIndex = i1+2;
                    processAlarm(cmdID, clustID, attID, bytes, decoded, RPIndex, attribute_type, 100, "none", );
                }
                if ((clustID === 0x0405 ) && (attID === 0x0001)) decoded.data.min_humidity = (bytes[i1]*256+bytes[i1+1])/100;
                if ((clustID === 0x0405 ) && (attID === 0x0002)) decoded.data.max_humidity = (bytes[i1]*256+bytes[i1+1])/100;
                if ((clustID === 0x000f ) && (attID === 0x0402)) {
                    const attribute_type = bytes[i1-1]
                    decoded.data.index = (bytes[i1]*256*256*256+bytes[i1+1]*256*256+bytes[i1+2]*256+bytes[i1+3]);
                    const RPIndex = i1+4;
                    processAlarm(cmdID, clustID, attID, bytes, decoded, RPIndex, attribute_type, 1, "none", );
                }
                if ((clustID === 0x000f ) && (attID === 0x0055)) {
                    const attribute_type = bytes[i1-1]
                    decoded.data.pin_state = !(!bytes[i1]);
                    const RPIndex = i1+1;
                    processAlarm(cmdID, clustID, attID, bytes, decoded, RPIndex, attribute_type, 1, "none", );
                }
                if ((clustID === 0x000f ) && (attID === 0x0054)){
                    if (bytes[i1] === 0) decoded.data.polarity = "normal";
                    if (bytes[i1] === 1) decoded.data.polarity = "reverse";
                }
                if ((clustID === 0x000f ) && (attID === 0x0400)){
                    if (bytes[i1] === 0) decoded.data.edge_selection = "none";
                    if (bytes[i1] === 1) decoded.data.edge_selection = "falling edge";
                    if (bytes[i1] === 2) decoded.data.edge_selection = "rising edge";
                    if (bytes[i1] === 3) decoded.data.edge_selection = "both edges";
                    if (bytes[i1] === 5) decoded.data.edge_selection = "polling and falling edge";
                    if (bytes[i1] === 6) decoded.data.edge_selection = "polling and rising edge";
                    if (bytes[i1] === 7) decoded.data.edge_selection = "polling and both edges";
                }
                if ((clustID === 0x000f ) && (attID === 0x0401)) decoded.data.debounce_period = bytes[i1]
                if ((clustID === 0x000f ) && (attID === 0x0403)) decoded.data.poll_period = bytes[i1]
                if ((clustID === 0x000f ) && (attID === 0x0404)) decoded.data.force_notify = bytes[i1]
                if ((clustID === 0x0013 ) && (attID === 0x0055)) {
                    let attribute_type = bytes[i1-1]
                    decoded.data.output_value = bytes[i1]
                    const RPIndex = i1+1;
                    processAlarm(cmdID, clustID, attID, bytes, decoded, RPIndex, attribute_type, 1, "none", );
                }
                if ((clustID === 0x0006 ) && (attID === 0x0000)) {
                    let state = bytes[i1];
                    if(state === 1) {
                        decoded.data.output = "ON";
                    } else {
                        decoded.data.output = "OFF" ;
                    }
                }
                if ((clustID === 0x8008 ) && (attID === 0x0000)){
                    let attribute_type = bytes[i1-1]
                    decoded.data.differential_pressure =bytes[i1]*256+bytes[i1+1];
                    const RPIndex = i1+2;
                    processAlarm(cmdID, clustID, attID, bytes, decoded, RPIndex, attribute_type, 1, "none", );
                }
                if ((clustID === 0x8005 ) && (attID === 0x0000))
                {
                    let attribute_type = bytes[i1-1]
                    decoded.data.pin_state_1 = ((bytes[i1+1]&0x01) === 0x01);
                    decoded.data.pin_state_2 = ((bytes[i1+1]&0x02) === 0x02);
                    decoded.data.pin_state_3 = ((bytes[i1+1]&0x04) === 0x04);
                    decoded.data.pin_state_4 = ((bytes[i1+1]&0x08) === 0x08);
                    decoded.data.pin_state_5 = ((bytes[i1+1]&0x10) === 0x10);
                    decoded.data.pin_state_6 = ((bytes[i1+1]&0x20) === 0x20);
                    decoded.data.pin_state_7 = ((bytes[i1+1]&0x40) === 0x40);
                    decoded.data.pin_state_8 = ((bytes[i1+1]&0x80) === 0x80);
                    decoded.data.pin_state_9 = ((bytes[i1]&0x01) === 0x01);
                    decoded.data.pin_state_10 = ((bytes[i1]&0x02) === 0x02);
                    const RPIndex = i1+2;
                    processAlarm(cmdID, clustID, attID, bytes, decoded, RPIndex, attribute_type, 100, "none", );
                }
                if ((clustID===0x8006)&&(attID===0x0000)) decoded.data.speed = bytes[i1]*256*256+bytes[i1+1]*256+bytes[i1+2];
                if ((clustID===0x8006)&&(attID===0x0001)) decoded.data.data_bit = bytes[i1]
                if ((clustID===0x8006)&&(attID===0x0002)) decoded.data.parity = bytes[i1];
                if ((clustID===0x8006)&&(attID===0x0003)) decoded.data.stop_bit = bytes[i1];
                if ((clustID === 0x000c ) && (attID === 0x0055)){
                    let attribute_type = bytes[i1-1]
                    decoded.data.analog = Bytes2Float32(bytes[i1]*256*256*256+bytes[i1+1]*256*256+bytes[i1+2]*256+bytes[i1+3]);
                    const RPIndex = i1+4;
                    processAlarm(cmdID, clustID, attID, bytes, decoded, RPIndex, attribute_type, 1, "float", );
                }
                if ((clustID === 0x000c ) && (attID === 0x0100)){
                    if (bytes[i1+1] === 0x05) decoded.data.type = "ppm";
                    if ((bytes[i1+1] === 0xFF)&&(bytes[i1+3]===0x00)) decoded.data.type = "mA";
                    if ((bytes[i1+1] === 0xFF)&&(bytes[i1+3]===0x01)) decoded.data.type = "mV";
                }
                if ((clustID===0x000C)&&(attID===0x8003)) decoded.data.power_duration = bytes[i1]*256+bytes[i1+1];
                if ((clustID===0x000C)&&(attID===0x8004)){
                    let chockparammetters = {}
                    //byte to bite string
                    const part1 = decimalToBitString(bytes[i1])
                    const part2 = decimalToBitString(bytes[i1+1])
                    const mode = part1[0]*2+part1[1]
                    if (mode === 0) chockparammetters.mode = "idle"
                    if (mode === 1) chockparammetters.mode = "chock"
                    if (mode === 2) chockparammetters.mode = "click"
                    const frequency = part1[2]*8+part1[3]*4+part1[4]*2+part1[5]
                    if (frequency === 0) chockparammetters.frequency = "idle"
                    if (frequency === 1) chockparammetters.frequency = "1Hz"
                    if (frequency === 2) chockparammetters.frequency = "10Hz"
                    if (frequency === 3) chockparammetters.frequency = "25Hz"
                    if (frequency === 4) chockparammetters.frequency = "50Hz"
                    if (frequency === 5) chockparammetters.frequency = "100Hz"
                    if (frequency === 6) chockparammetters.frequency = "200Hz"
                    if (frequency === 7) chockparammetters.frequency = "400Hz"
                    if (frequency === 8) chockparammetters.frequency = "1620Hz"
                    if (frequency === 9) chockparammetters.frequency = "5376Hz"
                    chockparammetters.range={}
                    const range = part1[6]*2+part1[7]
                    if (range === 0) {chockparammetters.range.precision = "+/- 2g"; chockparammetters.range.value = 16}
                    if (range === 1) {chockparammetters.range.precision = "+/- 4g"; chockparammetters.range.value = 32}
                    if (range === 2) {chockparammetters.range.precision = "+/- 8g"; chockparammetters.range.value = 64}
                    if (range === 3) {chockparammetters.range.precision = "+/- 16g"; chockparammetters.range.value = 128}
                    const multiplicator = part2[0]*128+part2[1]*64+part2[2]*32+part2[3]*16+part2[4]*8+part2[5]*4+part2[6]*2+part2[7]
                    chockparammetters.threshold = multiplicator*chockparammetters.range.value
                }
                if ((clustID === 0x800e ) && (attID === 0x0000)){
                    let attribute_type = bytes[i1-1];
                    decoded.data.number = decodeNumber(bytes, i1, attribute_type);
                    const RPIndex = i1 + Math.ceil(attribute_types[attribute_type].size);
                    processAlarm(cmdID, clustID, attID, bytes, decoded, RPIndex, attribute_type, 1, "none", );
                }
                if ((clustID === 0x8007 ) && (attID === 0x0001))
                {
                    decoded.data.modbus_payload = "";
                    const size = bytes[i1];
                    for( let j = 0; j < size; j++ )
                    {
                        temp_hex_str   = bytes[i1+j+1].toString( 16 ).toUpperCase();
                        if (temp_hex_str.length === 1) temp_hex_str = "0" + temp_hex_str;
                        if (j === 0) decoded.data.modbus_slaveID = bytes[i1+j+1];
                        else if (j === 1) decoded.data.modbus_fnctID = bytes[i1+j+1];
                        else if (j === 2) decoded.data.modbus_datasize = bytes[i1+j+1];
                        else{
                            decoded.data.modbus_payload += temp_hex_str;
                        }
                    }
                }
                if ((clustID === 0x8009 ) && (attID === 0x0000))
                {
                    const b2b3 = (bytes[i1+2] << 8) | bytes[i1+3];

                    decoded.data.modbus_frame_series_sent = bytes[i1+1];
                    decoded.data.modbus_frame_number_in_serie = (b2b3 & 0xE000) >> 13;
                    decoded.data.modbus_last_frame_of_serie = (b2b3 & 0x1C00) >> 10;

                    for (let epIndex = 0; epIndex <= 9; epIndex++) {
                        decoded.data[`modbus_EP${epIndex}`] = ((b2b3 & (1 << epIndex)) !== 0);
                    }
                    
                    function processModbusEP(ep, i2, without_header, bytes, decoded, epIndex) {
                        if (ep === true) {
                            if (without_header === 0) {
                                decoded.data[`modbus_slaveID_EP${epIndex}`] = bytes[i2];
                                decoded.data[`modbus_fnctID_EP${epIndex}`] = bytes[i2 + 1];
                                decoded.data[`modbus_datasize_EP${epIndex}`] = bytes[i2 + 2];
                                i2 += 3;
                            }
                            decoded.data[`modbus_payload_EP${epIndex}`] = "";
                            if (bytes[i2] === undefined) return decoded;
                            for (let j = 0; j < decoded.data[`modbus_datasize_EP${epIndex}`]; j++) {
                                let temp_hex_str = bytes[i2 + j].toString(16).toUpperCase();
                                if (temp_hex_str.length === 1) temp_hex_str = "0" + temp_hex_str;
                                decoded.data[`modbus_payload_EP${epIndex}`] += temp_hex_str;
                            }
                            i2 += decoded.data[`modbus_datasize_EP${epIndex}`];
                        }
                        return i2;
                    }

                    let i2 = i1 + 4;
                    const without_header = 0;

                    for (let epIndex = 0; epIndex <= 9; epIndex++) {
                        i2 = processModbusEP(decoded.data[`modbus_EP${epIndex}`], i2, without_header, bytes, decoded, epIndex);
                    }
                }
                if (  (clustID === 0x0052 ) && (attID === 0x0000)) {
                    decoded.data.active_energy = UintToInt(bytes[i1+1]*256*256+bytes[i1+2]*256+bytes[i1+3],3);
                    decoded.data.reactive_energy = UintToInt(bytes[i1+4]*256*256+bytes[i1+5]*256+bytes[i1+6],3);
                    decoded.data.nb_samples = (bytes[i1+7]*256+bytes[i1+8]);
                    decoded.data.active_power = UintToInt(bytes[i1+9]*256+bytes[i1+10],2);
                    decoded.data.reactive_power = UintToInt(bytes[i1+11]*256+bytes[i1+12],2);
                }
                if ((clustID === 0x8004 ) && (attID === 0x0000)) {
                    if (bytes[i1] === 1)
                        decoded.data.message_type = "confirmed";
                    if (bytes[i1] === 0)
                        decoded.data.message_type = "unconfirmed";
                }
                if ((clustID === 0x8004 ) && (attID === 0x0001)) {
                    decoded.data.nb_retry= bytes[i1] ;
                }
                if ((clustID === 0x8004 ) && (attID === 0x0002)) {
                    decoded.data.automatic_association = {};
                    decoded.data.automatic_association.period_in_minutes = bytes[i1+1] *256+bytes[i1+2];
                    decoded.data.automatic_association.nb_err_frames = bytes[i1+3] *256+bytes[i1+4];
                }
                if ((clustID===0x8004) && (attID===0x0003)){
                    decoded.data.data_rate = bytes[i1+2];
                }
                if ((clustID===0x8004) && (attID===0x0004)){
                    decoded.data.ABP_dev_address = "";
                    for (let i = 0; i<4; i++){
                        decoded.data.ABP_dev_address += String(bytes[i1+1+i]);
                        if (i<3) decoded.data.ABP_dev_address += ".";

                    }
                }
                if ((clustID===0x8004) && (attID===0x0005)){
                    decoded.data.OTA_app_EUI = "";
                    for (let i = 0; i<8; i++){
                        decoded.data.OTA_app_EUI += String(bytes[i1+1+i]);
                        if (i<7) decoded.data.OTA_app_EUI += ".";

                    }
                }
                if ((clustID===0x0050) && (attID===0x0004)){
                    const length = bytes[i1]*256+bytes[i1+1];
                    let configuration = {}
                    const nbendpoints = bytes[i1+2];
                    for (let i = 0; i < nbendpoints; i++) {
                        let endpoint = {}
                        endpoint.endpoint = bytes[i1+3+i*7];
                        let nbinput_cluster = bytes[i1+4+i*7];
                        endpoint.input_clusters = []
                        for (let j=0; j < nbinput_cluster; j++){
                            endpoint.input_clusters[j] = decimalToHex(bytes[i1 + 5 + i * 7 + j * 2] * 256 + bytes[i1 + 6 + i * 7 + j * 2], 4);
                        }
                        let nboutput_cluster = bytes[i1+5+i*7+nbinput_cluster*2];
                        endpoint.output_clusters = []
                        for (let j=0; j < nboutput_cluster; j++){
                            endpoint.output_clusters[j] = decimalToHex(bytes[i1 + 6 + i * 7 + j * 2] * 256 + bytes[i1 + 7 + i * 7 + j * 2], 4);
                        }
                        configuration[i] = endpoint;
                    }
                    decoded.data.configuration = configuration;
                }
                if ((clustID === 0x0050 ) && (attID === 0x0006)) {
                    let i2 = i1 + 3;
                    const attribute_type = bytes[i1-1];
                    if ((bytes[i1+2] &0x01) === 0x01) {decoded.data.main_or_external_voltage = (bytes[i2]*256+bytes[i2+1])/1000;i2=i2+2;}
                    if ((bytes[i1+2] &0x02) === 0x02) {decoded.data.rechargeable_battery_voltage = (bytes[i2]*256+bytes[i2+1])/1000;i2=i2+2;}
                    if ((bytes[i1+2] &0x04) === 0x04) {decoded.data.disposable_battery_voltage = (bytes[i2]*256+bytes[i2+1])/1000;i2=i2+2;}
                    if ((bytes[i1+2] &0x08) === 0x08) {decoded.data.solar_harvesting_voltage = (bytes[i2]*256+bytes[i2+1])/1000;i2=i2+2;}
                    if ((bytes[i1+2] &0x10) === 0x10) {decoded.data.tic_harvesting_voltage = (bytes[i2]*256+bytes[i2+1])/1000;i2=i2+2;}
                    const RPIndex = i2+1;
                    processAlarm(cmdID, clustID, attID, bytes, decoded, RPIndex, attribute_type, 1000, "multistate", true);
                }
                if ((clustID === 0x0050) && (firsthalfattID === 0xFF)){
                    const secondhalfattID = bytes[5];
                    const action = "action "+secondhalfattID.toString();
                    decoded.data[action]=""
                    const length = bytes[i1+1]
                    let actionvalue = "none"
                    for (let i = 0; i < length; i++) {
                        actionvalue += String.fromCharCode(bytes[i1 + 1 + i])
                    }
                    decoded.data[action] = actionvalue;
                }
                if (  (clustID === 0x800a) && (attID === 0x0000)) {
                    let i2 = i1;
                    const attribute_type = bytes[i2-1];
                    decoded.data.positive_active_energy = UintToInt(bytes[i2+1]*256*256*256+bytes[i2+2]*256*256+bytes[i2+3]*256+bytes[i2+4],4);
                    i2 = i2 + 4;
                    decoded.data.negative_active_energy = UintToInt(bytes[i2+1]*256*256*256+bytes[i2+2]*256*256+bytes[i2+3]*256+bytes[i2+4],4);
                    i2 = i2 + 4;
                    decoded.data.positive_reactive_energy = UintToInt(bytes[i2+1]*256*256*256+bytes[i2+2]*256*256+bytes[i2+3]*256+bytes[i2+4],4);
                    i2 = i2 + 4;
                    decoded.data.negative_reactive_energy = UintToInt(bytes[i2+1]*256*256*256+bytes[i2+2]*256*256+bytes[i2+3]*256+bytes[i2+4],4);
                    i2 = i2 + 4;
                    decoded.data.positive_active_power = UintToInt(bytes[i2+1]*256*256*256+bytes[i2+2]*256*256+bytes[i2+3]*256+bytes[i2+4],4);
                    i2 = i2 + 4;
                    decoded.data.negative_active_power = UintToInt(bytes[i2+1]*256*256*256+bytes[i2+2]*256*256+bytes[i2+3]*256+bytes[i2+4],4);
                    i2 = i2 + 4;
                    decoded.data.positive_reactive_power = UintToInt(bytes[i2+1]*256*256*256+bytes[i2+2]*256*256+bytes[i2+3]*256+bytes[i2+4],4);
                    i2 = i2 + 4;
                    decoded.data.negative_reactive_power = UintToInt(bytes[i2+1]*256*256*256+bytes[i2+2]*256*256+bytes[i2+3]*256+bytes[i2+4],4);
                    const RPIndex = i2+5;
                    processAlarm(cmdID, clustID, attID, bytes, decoded, RPIndex, attribute_type, 1, "multistate", true);
                }
                if ((clustID === 0x8010) && (attID === 0x0000)) {
                    const attribute_type = bytes[i1-1];
                    decoded.data.active_energy_a=UintToInt(bytes[i1+1]*256*256*256+bytes[i1+2]*256*256+bytes[i1+3]*256+bytes[i1+4]);
                    decoded.data.reactive_energy_a=UintToInt(bytes[i1+5]*256*256*256+bytes[i1+6]*256*256+bytes[i1+7]*256+bytes[i1+8]);
                    decoded.data.active_energy_b=UintToInt(bytes[i1+9]*256*256*256+bytes[i1+10]*256*256+bytes[i1+11]*256+bytes[i1+12]);
                    decoded.data.reactive_energy_b=UintToInt(bytes[i1+13]*256*256*256+bytes[i1+14]*256*256+bytes[i1+15]*256+bytes[i1+16]);
                    decoded.data.active_energy_c=UintToInt(bytes[i1+17]*256*256*256+bytes[i1+18]*256*256+bytes[i1+19]*256+bytes[i1+20]);
                    decoded.data.reactive_energy_c=UintToInt(bytes[i1+21]*256*256*256+bytes[i1+22]*256*256+bytes[i1+23]*256+bytes[i1+24]);
                    decoded.data.active_energy_abc=UintToInt(bytes[i1+25]*256*256*256+bytes[i1+26]*256*256+bytes[i1+27]*256+bytes[i1+28]);
                    decoded.data.reactive_energy_abc=UintToInt(bytes[i1+29]*256*256*256+bytes[i1+30]*256*256+bytes[i1+31]*256+bytes[i1+32]);
                    const RPIndex = i1+33;
                    processAlarm(cmdID, clustID, attID, bytes, decoded, RPIndex, attribute_type, 1, "multistate", true);
                } else if ((clustID === 0x8010) && (attID === 0x0001)) {
                    const attribute_type = bytes[i1-1];
                    decoded.data.active_power_a= UintToInt(bytes[i1+1]*256*256*256+bytes[i1+2]*256*256+bytes[i1+3]*256+bytes[i1+4]);
                    decoded.data.reactive_power_a= UintToInt(bytes[i1+5]*256*256*256+bytes[i1+6]*256*256+bytes[i1+7]*256+bytes[i1+8]);
                    decoded.data.active_power_b=UintToInt(bytes[i1+9]*256*256*256+bytes[i1+10]*256*256+bytes[i1+11]*256+bytes[i1+12]);
                    decoded.data.reactive_power_b=UintToInt(bytes[i1+13]*256*256*256+bytes[i1+14]*256*256+bytes[i1+15]*256+bytes[i1+16]);
                    decoded.data.active_power_c=UintToInt(bytes[i1+17]*256*256*256+bytes[i1+18]*256*256+bytes[i1+19]*256+bytes[i1+20]);
                    decoded.data.reactive_power_c=UintToInt(bytes[i1+21]*256*256*256+bytes[i1+22]*256*256+bytes[i1+23]*256+bytes[i1+24]);
                    decoded.data.active_power_abc=UintToInt(bytes[i1+25]*256*256*256+bytes[i1+26]*256*256+bytes[i1+27]*256+bytes[i1+28]);
                    decoded.data.reactive_power_abc=UintToInt(bytes[i1+29]*256*256*256+bytes[i1+30]*256*256+bytes[i1+31]*256+bytes[i1+32]);
                    let ia = i1 + 33
                    const RPIndex = i1+33;
                    processAlarm(cmdID, clustID, attID, bytes, decoded, RPIndex, attribute_type, 1, "multistate", true);
                }
                if (  (clustID === 0x800b) && (attID === 0x0000)) {
                    let i2 = i1;
                    const attribute_type = bytes[i2-1];
                    decoded.data.Vrms = UintToInt(bytes[i2+1]*256+bytes[i2+2],2)/10;
                    i2 = i2 + 2;
                    decoded.data.Irms = UintToInt(bytes[i2+1]*256+bytes[i2+2],2)/10;
                    i2 = i2 + 2;
                    decoded.data.angle = UintToInt(bytes[i2+1]*256+bytes[i2+2],2);
                    const RPIndex = i2+3;
                    processAlarm(cmdID, clustID, attID, bytes, decoded, RPIndex, attribute_type, 1, "multistate", true);
                }
                if (  (clustID === 0x800d) && (attID === 0x0000)) {
                    const attribute_type = bytes[i1-1]
                    decoded.data.Vrms_a=UintToInt(bytes[i1+1]*256+bytes[i1+2],2)/10;
                    decoded.data.Irms_a=UintToInt(bytes[i1+3]*256+bytes[i1+4],2)/10;
                    decoded.data.angle_a=UintToInt(bytes[i1+5]*256+bytes[i1+6],2);
                    decoded.data.Vrms_b=UintToInt(bytes[i1+7]*256+bytes[i1+8],2)/10;
                    decoded.data.Irms_b=UintToInt(bytes[i1+9]*256+bytes[i1+10],2)/10;
                    decoded.data.angle_b=UintToInt(bytes[i1+11]*256+bytes[i1+12],2);
                    decoded.data.Vrms_c=UintToInt(bytes[i1+13]*256+bytes[i1+14],2)/10;
                    decoded.data.Irms_c=UintToInt(bytes[i1+15]*256+bytes[i1+16],2)/10;
                    decoded.data.angle_c=UintToInt(bytes[i1+17]*256+bytes[i1+18],2);
                    const RPIndex = i1+19;
                    processAlarm(cmdID, clustID, attID, bytes, decoded, RPIndex, attribute_type, 1, "multistate", true);
                }
                if ((clustID === 0x800c) && (attID === 0x0000)){
                    const attribute_type = bytes[i1-1]
                    decoded.data.concentration = (bytes[i1]*256+bytes[i1+1]);
                    const RPIndex = i1+2;
                    processAlarm(cmdID, clustID, attID, bytes, decoded, RPIndex, attribute_type, 1, "none",);
                }
                if ((clustID===0x800C)&&(attID===0x0001)) decoded.data.analog=bytes[i1];
                if ((clustID===0x800C)&&(attID===0x0002)) decoded.data.analog=bytes[i1];
                if ((clustID === 0x0400) && (attID === 0x0000)) {
                    const attribute_type = bytes[i1-1]
                    decoded.data.illuminance = (bytes[i1]*256+bytes[i1+1]);
                    const RPIndex = i1+2;
                    processAlarm(cmdID, clustID, attID, bytes, decoded, RPIndex, attribute_type, 1, "none",);
                }
                if ((clustID === 0x0403) && (attID === 0x0000)) {
                    const attribute_type = bytes[i1-1]
                    decoded.data.pressure = (UintToInt(bytes[i1]*256+bytes[i1+1],2));
                    const RPIndex = i1+2;
                    processAlarm(cmdID, clustID, attID, bytes, decoded, RPIndex, attribute_type, 1, "int",);
                }
                if ((clustID === 0x0406) && (attID === 0x0000)) {
                    const attribute_type = bytes[i1-1]
                    decoded.data.occupancy = !(!bytes[i1]);
                    const RPIndex = i1+1;
                    processAlarm(cmdID, clustID, attID, bytes, decoded, RPIndex, attribute_type, 1, "none",);
                }
                if ((clustID === 0x8052) && (attID === 0x0000)) {
                    let i2 = i1;
                    decoded.data.frequency = (UintToInt(bytes[i2 + 1] * 256 + bytes[i2 + 2],2) + 22232) / 1000;
                    i2 = i2 + 2;
                    decoded.data.frequency_min = (UintToInt(bytes[i2 + 1] * 256 + bytes[i2 + 2],2) + 22232) / 1000;
                    i2 = i2 + 2;
                    decoded.data.frequency_max = (UintToInt(bytes[i2 + 1] * 256 + bytes[i2 + 2],2) + 22232) / 1000;
                    i2 = i2 + 2;
                    decoded.data.Vrms = UintToInt(bytes[i2 + 1] * 256 + bytes[i2 + 2],2) / 10;
                    i2 = i2 + 2;
                    decoded.data.Vrms_min = UintToInt(bytes[i2 + 1] * 256 + bytes[i2 + 2], 2) / 10;
                    i2 = i2 + 2;
                    decoded.data.Vrms_max = UintToInt(bytes[i2 + 1] * 256 + bytes[i2 + 2], 2) / 10;
                    i2 = i2 + 2;
                    decoded.data.Vpeak = UintToInt(bytes[i2 + 1] * 256 + bytes[i2 + 2], 2) / 10;
                    i2 = i2 + 2;
                    decoded.data.Vpeak_min = UintToInt(bytes[i2 + 1] * 256 + bytes[i2 + 2],2) / 10;
                    i2 = i2 + 2;
                    decoded.data.Vpeak_max = UintToInt(bytes[i2 + 1] * 256 + bytes[i2 + 2],2) / 10;
                    i2 = i2 + 2;
                    decoded.data.over_voltage = UintToInt(bytes[i2 + 1] * 256 + bytes[i2 + 2], 2);
                    i2 = i2 + 2;
                    decoded.data.sag_voltage = UintToInt(bytes[i2 + 1] * 256 + bytes[i2 + 2], 2);
                    i2 = i2 + 2;
                    decoded.data.brownout_number = UintToInt(bytes[i2 + 1] * 256 + bytes[i2 + 2], 2);
                }


                if (  (clustID === 0x800f) ) {
                    let i = i1+1;
                    if (attID === 0x0000) {
                        let o = decoded.data.last = {};
                        o.NbTriggedAcq = BytesToInt64(bytes,i,"U32"); i+=4;
                        o.Mean_X_G = BytesToInt64(bytes,i,"U16")/100.0; i+=2;
                        o.Max_X_G  = BytesToInt64(bytes,i,"U16")/100.0; i+=2;
                        o.Dt_X_ms  = BytesToInt64(bytes,i,"U16"); i+=2;
                        o.Mean_Y_G = BytesToInt64(bytes,i,"U16")/100.0; i+=2;
                        o.Max_Y_G  = BytesToInt64(bytes,i,"U16")/100.0; i+=2;
                        o.Dt_Y_ms  = BytesToInt64(bytes,i,"U16"); i+=2;
                        o.Mean_Z_G = BytesToInt64(bytes,i,"U16")/100.0; i+=2;
                        o.Max_Z_G  = BytesToInt64(bytes,i,"U16")/100.0; i+=2;
                        o.Dt_Z_ms  = BytesToInt64(bytes,i,"U16");
                    } else if (attID === 0x0001 || (attID === 0x0002) || (attID === 0x0003)){
                        let ext = (attID === 0x0001 ? "Stats_X" : (attID === 0x0002 ? "Stats_Y" : "Stats_Z"));
                        let o = decoded.data[ext] = {};
                        o.NbAcq     = BytesToInt64(bytes,i,"U16"); i+=2;
                        o.MinMean_G = BytesToInt64(bytes,i,"U16")/100.0; i+=2;
                        o.MinMax_G  = BytesToInt64(bytes,i,"U16")/100.0; i+=2;
                        o.MinDt     = BytesToInt64(bytes,i,"U16"); i+=2;
                        o.MeanMean_G= BytesToInt64(bytes,i,"U16")/100.0; i+=2;
                        o.MeanMax_G = BytesToInt64(bytes,i,"U16")/100.0; i+=2;
                        o.MeanDt    = BytesToInt64(bytes,i,"U16"); i+=2;
                        o.MaxMean_G = BytesToInt64(bytes,i,"U16")/100.0; i+=2;
                        o.MaxMax_G  = BytesToInt64(bytes,i,"U16")/100.0; i+=2;
                        o.MaxDt     = BytesToInt64(bytes,i,"U16"); i+=2;
                    } else if (attID === 0x8000) {
                        let o = decoded.data.params = {};
                        o.WaitFreq_Hz       = BytesToInt64(bytes,i,"U16")/10.0; i+=2;
                        o.AcqFreq_Hz        = BytesToInt64(bytes,i,"U16")/10.0; i+=2;
                        let delay = BytesToInt64(bytes,i,"U16"); i+=2;
                        if (delay & 0x8000) delay = (delay & (~0x8000)) * 60;
                        o.NewWaitDelay_s    = (delay & 0x8000 ? delay = (delay & (~0x8000)) * 60 : delay);
                        o.MaxAcqDuration_ms = BytesToInt64(bytes,i,"U16"); i+=2;
                        o.Threshold_X_G     = BytesToInt64(bytes,i,"U16")/100.0; i+=2;
                        o.Threshold_Y_G     = BytesToInt64(bytes,i,"U16")/100.0; i+=2;
                        o.Threshold_Z_G     = BytesToInt64(bytes,i,"U16")/100.0; i+=2;
                        o.OverThrsh_Dt_ms   = BytesToInt64(bytes,i,"U16"); i+=2;
                        o.UnderThrsh_Dt_ms  = BytesToInt64(bytes,i,"U16"); i+=2;
                        o.Range_G           = BytesToInt64(bytes,i,"U16")/100; i+=2;
                        o.FilterSmoothCoef  = BytesToInt64(bytes,i,"U8"); i+=1;
                        o.FilterGainCoef    = BytesToInt64(bytes,i,"U8"); i+=1;
                        o = decoded.data.Params.working_modes = {};
                        o.SignalEachAcq     = (bytes[i] & 0x80 ? "true" : "false");
                        o.RstAftStdRpt_X    = (bytes[i] & 0x01 ? "true" : "false");
                        o.RstAftStdRpt_Y    = (bytes[i] & 0x02 ? "true" : "false");
                        o.RstAftStdRpt_7    = (bytes[i] & 0x04 ? "true" : "false");
                    }
                }
                let firstKey = Object.keys(decoded.data)[0]
                if (decoded.data[firstKey]===undefined){
                    throw new ValidationError("bad payload1")
                }
                if(bytes.length<=7){
                    throw new ValidationError("bad payload2")
                }
            }
            if(cmdID === 0x07){
                knowncmdID=1
                attID = bytes[6]*256 + bytes[7];decoded.zclheader.attID = decimalToHex(attID,4);
                decoded.zclheader.status = bytes[4];
                decoded.zclheader.report_parameters = {}
                let bits = decimalToBitString(bytes[5]);
                decoded.zclheader.report_parameters.new_mode_configuration = bits[0];
                if ((bits[2]==="0") && (bits[3]==="0")){
                    decoded.zclheader.report_parameters.cause_request = "none";
                }
                if ((bits[2]==="0") && (bits[3]==="1")){
                    decoded.zclheader.report_parameters.cause_request = "short";
                }
                if ((bits[2]==="1") && (bits[3]==="0")){
                    decoded.zclheader.report_parameters.cause_request = "long";
                }
                if ((bits[2]==="1") && (bits[3]==="1")){
                    decoded.zclheader.report_parameters.cause_request = "reserved";
                }
                decoded.zclheader.report_parameters.secured_if_alarm = bits[4];
                decoded.zclheader.report_parameters.secured = bits[5];
                decoded.zclheader.report_parameters.no_hearde_port = bits[6];
                decoded.zclheader.report_parameters.batch = bits[7];
            }
            if(cmdID === 0x09){
                knowncmdID=1
                attID = bytes[6]*256 + bytes[7];decoded.zclheader.attID = decimalToHex(attID,4);
                decoded.zclheader.status = bytes[4];
                decoded.zclheader.report_parameters = {}
                let bits = decimalToBitString(bytes[5]);
                decoded.zclheader.report_parameters.new_mode_configuration = bits[0];
                if ((bits[2]==="0") && (bits[3]==="0")){
                    decoded.zclheader.report_parameters.cause_request = "none";
                }
                if ((bits[2]==="0") && (bits[3]==="1")){
                    decoded.zclheader.report_parameters.cause_request = "short";
                }
                if ((bits[2]==="1") && (bits[3]==="0")){
                    decoded.zclheader.report_parameters.cause_request = "long";
                }
                if ((bits[2]==="1") && (bits[3]==="1")){
                    decoded.zclheader.report_parameters.cause_request = "reserved";
                }
                decoded.zclheader.report_parameters.secured_if_alarm = bits[4];
                decoded.zclheader.report_parameters.secured = bits[5];
                decoded.zclheader.report_parameters.no_hearde_port = bits[6];
                decoded.zclheader.report_parameters.batch = bits[7];
                decoded.zclheader.attribut_type = bytes[8];
                decoded.zclheader.min = {}
                if ((bytes[9] & 0x80) === 0x80) {decoded.zclheader.min.value = (bytes[9]-0x80)*256+bytes[10];decoded.zclheader.min.unit = "minutes";} else {decoded.zclheader.min.value = bytes[9]*256+bytes[10];decoded.zclheader.min.unit = "seconds";}
                decoded.zclheader.max = {}
                if ((bytes[11] & 0x80) === 0x80) {decoded.zclheader.max.value = (bytes[11]-0x80)*256+bytes[12];decoded.zclheader.max.unit = "minutes";} else {decoded.zclheader.max.value = bytes[11]*256+bytes[12];decoded.zclheader.max.unit = "seconds";}
                decoded.lora.payload  = "";

                if ((clustID===0x0050) && (attID===0x0006)){
                    let length = bytes[13];
                    let nb = length/5
                    let i=0
                    while(nb>0){
                        decoded.zclheader.modepower = bytes[14+i*5];
                        decoded.zclheader.powersource = bytes[15+i*5];
                        decoded.zclheader.delta = bytes[16+i*5]*256+bytes[17+i*5];
                        decoded.zclheader.changedpowersource = bytes[18+i*5];
                        i++
                        nb--
                    }
                }
            }
            if(knowncmdID===0){
                throw new ValidationError("bad payload3")
            }
        }
        else
        {
            decoded.batch = {};
            decoded.batch.report = "batch";
        }
    }
    return decoded;
}
function normalisation_standard(input, endpoint_parameters,TIC_Decode=null) {
    let warning = [];
    let bytes = input.bytes;
    let decoded = Decoder(bytes, input.fPort, TIC_Decode);
    if (decoded.zclheader !== undefined){
        if (decoded.zclheader.alarmmsg !== undefined){
            warning = decoded.zclheader.alarmmsg
        }

        if (bytes[1] === 0x07){
            return{
                data: decoded.zclheader,
                warning: warning
            }
        }
        else if (bytes[1] === 0x09){
            return{
                data: decoded.zclheader,
                warning: warning
            }
        }
        else if (bytes[1] === 0x01) {
            if (decoded.zclheader.data === undefined) {
                let data = []
                let flagstandard = true;
                let indent = 0;
                while (flagstandard) {
                    let firstKey = Object.keys(decoded.data)[indent];
                    if (firstKey === undefined) {
                        flagstandard = false;
                        break;
                    } else {
                        data.push({
                            variable: firstKey,
                            value: decoded.data[firstKey],
                            date: input.recvTime
                        })
                        indent++;
                    }
                }
                return {
                    data: data,
                    type: "standard",
                    warning: warning
                }
            } else {
                return {
                    data: {
                        variable: "read reporting configuration response status",
                        value: decoded.zclheader.data,
                        date: input.recvTime
                    },
                    warning: warning
                }
            }
        }
    }
    if (decoded.zclheader !== undefined){
        if (endpoint_parameters !== undefined) {
            let access = decoded.zclheader.endpoint;
            let flagstandard = true;
            let indent = 0;
            let data = []
            let type = ""
            while (flagstandard) {
                let firstKey = Object.keys(decoded.data)[indent];
                if (firstKey === undefined) {
                    flagstandard = false;
                    break;
                } else {
                    if (endpoint_parameters[firstKey] === undefined) {
                        data.push({variable: firstKey,
                            value: decoded.data[firstKey],
                            date: input.recvTime
                        })
                    }else{
                        type = endpoint_parameters[firstKey][access];
                        if (type === "NA"){
                            data.push({
                                variable: type,
                                value: "NA",
                                date: input.recvTime
                            })
                        } else{
                            data.push({
                                variable: type,
                                value: decoded.data[firstKey],
                                date: input.recvTime
                            })
                        }
                    }
                    indent++;
                }
            }
            return {
                data: data,
                type: "standard",
                warning: warning
            }
        }else{
            throw new ValidationError("bad decoding")
        }
    }
    return {
        type: decoded.batch.report,
        payload: decoded.lora.payload,
    }
}
module.exports = {normalisation_standard,};