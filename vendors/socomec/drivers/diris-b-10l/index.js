/*
 * A javascript template to decode SOCOMEC B10-L "like" standard payload 
 *
 */
 
/*
 * To test simply present codec template on any computer, install Node.js (https://nodejs.org/en/) 
 * 
 * Then you can try decoding ZCL frames, by uncommenting first three lines below and 
 * and then use commands like these in you "terminal/command" window:
 *
 *     node decode_B10L_SJS_v1.js 112854A28101000800 
 *     node decode_B10L_SJS_v1.js 021125E681DE0000000000ba035d0000000000000cae0000000000b8aaec0000000000000f21000000000000000000030011
 *     node decode_B10L_SJS_v1.js 022125E681DE030103111301131123012311330133114301431153015311630163117301731100000000075BCD153C01A15
 *     node decode_B10L_SJS_v1.js 023125E681DE030103111301131123012311330133114301431153015311630163117301731100000000075BCD153C01A15F
 *     node decode_B10L_SJS_v1.js 02412750264400000fb6fffffd9200000fe603dc0001000006770000120c000032980000c3511C007fff7fff04331234A15F
 *     node decode_B10L_SJS_v1.js 025127502644101012341019123410201234102912341030123410391234104012341049123404331234A15F
 *     node decode_B10L_SJS_v1.js 02612750264400000fb6fffffd9200000fe603dc0001000006770000120c000032980000c3511C007fff7fff04331234A15F
 *     node decode_B10L_SJS_v1.js 02712750264400000fb6fffffd9200000fe603dc0001000006770000120c000032980000c3511C007fff7fff04331234A15F
 *     node decode_B10L_SJS_v1.js 02912750264400000fb6fffffd9200000fe603dc0001000006770000120c000032980000c3511C007fff7fff04331234A15F
 *     node decode_B10L_SJS_v1.js 112854A28101000800
 *
 * You could also set the three following lines commented to implement you own Decoder(...) function calls...
 *
 */
 
var argv= process.argv.slice(2);
obj = Decoder(Buffer.from(argv[0],'hex'));
//console.dir(obj,{depth:null});
console.log(
	JSON.stringify(obj, null, 2)
);

// ----------------------------------------------------------------
// ----------------------- FUNCTIONS PART (Deprecated) ------------
// ----------------------------------------------------------------
// marche seulement en 32 bit
function UintToInt32(Uint, Size) {
    if (Size === 2) {
      if ((Uint & 0x8000) > 0) {
        Uint = Uint - 0x10000;
      }
    }
    if (Size === 3) {
      if ((Uint & 0x800000) > 0) {
        Uint = Uint - 0x1000000;
      }
    }
    if (Size === 4) {
      if ((Uint & 0x80000000) < 0) { // attention ce test binaire ne fonctinne qu'en 32 bit
        Uint = Uint - 0x100000000;
      }
    }


    return Uint;
}

function Bytes2Float32(bytes) {
    var sign = (bytes & 0x80000000) ? -1 : 1;
    var exponent = ((bytes >> 23) & 0xFF) - 127;
    var significand = (bytes & ~(-1 << 23));

    if (exponent == 128) 
        return sign * ((significand) ? Number.NaN : Number.POSITIVE_INFINITY);

    if (exponent == -127) {
        if (significand == 0) return sign * 0.0;
        exponent = -126;
        significand /= (1 << 22);
    } else significand = (significand | (1 << 23)) / (1 << 23);

    return sign * significand * Math.pow(2, exponent);
}

// ----------------------------------------------------------------
// ----------------------- FUNCTIONS PART -------------------------
// ----------------------------------------------------------------

/*
 * Int conversion directly from buffer with start index and required endianess 
 *
 * Type must be     : U8,I8,U16,I16,U24,I24,U32,I32,U40,I40,...,U56,I56,I64
 * LittleEndian if true either big endian
 */
function BytesToInt64(InBytes, StartIndex, Type,LittleEndian) 
{
    if( typeof(LittleEndian) == 'undefined' ) LittleEndian = false;
    
	var Signed  = (Type.substr(0,1) != "U");
	var BytesNb = parseInt(Type.substr(1,2), 10)/8;
	var inc, start; 
	var nb = BytesNb;

	if (LittleEndian)
	{
		inc = -1; 
		start = StartIndex + BytesNb - 1;
	}
	else
	{
		inc =  1; start = StartIndex ;
	}
	
	tmpInt64 = 0;
	for (j=start; nb > 0;(j+=inc,nb--)) 
	{
		tmpInt64 = (tmpInt64 << 8) + InBytes[j];
	}
	
	if ((Signed) && (BytesNb < 8) && (InBytes[start] & 0x80)) 
		tmpInt64 = tmpInt64 - (0x01 << (BytesNb * 8)); 

    return tmpInt64;
}

/*
 * Float32 conversion directly from buffer with start index and required endianess 
 *
 * LittleEndian if true either big endian
 */
function BytesToFloat32(InBytes,StartIndex,LittleEndian) {
    
	if( typeof(LittleEndian) == 'undefined' ) LittleEndian = false;
	
	var buf = InBytes.slice(StartIndex,StartIndex+4);
	if (! LittleEndian)	buf.reverse();
	var f32a = new Float32Array((new Int8Array(buf)).buffer);
	return f32a[0];
}


function decimalToHex(d, padding) {
    var hex = Number(d).toString(16).toUpperCase();
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

    while (hex.length < padding) {
        hex = "0" + hex;
    }

    return "0x" + hex;
}

function parseHexString(str) { 
    var result = [];
    while (str.length >= 2) { 
        result.push(parseInt(str.substring(0, 2), 16));

        str = str.substring(2, str.length);
    }

    return result;
}

function byteToHex(b) {
	const hexChar = ["0", "1", "2", "3", "4", "5", "6", "7","8", "9", "A", "B", "C", "D", "E", "F"];
	return hexChar[(b >> 4) & 0x0f] + hexChar[b & 0x0f];
}

function BytesToHexStr(buff) {
	const hexOctets = [];
    for (i = 0; i < buff.length; ++i) {
		hexOctets.push( byteToHex(buff[i],2) );
	}
    return hexOctets.join("");
}

function zeroPad(num, places) {
	return( String(num).padStart(places, '0') );
}

function U32toS32 (number){
	if (number > 2**31) number -= 2**32;
	return number;
}
function U32toS16 (number){
	if (number > 2**15) number -= 2**16;
	return number;
}


function readBytes (bytes, from, count) {
    var result = 0;
    for (i = 0; i < count; i++){
        result += bytes[from + i] * (256**(count - 1 - i));
    }
    return result;
}


function Decoder(bytes) {
  // Decode an uplink message from a buffer
  // (array) of bytes to an object of fields.
	var decoded = {};
	decoded.lora = {};

	//decoded.lora.port  = port;
	
	// Get raw payload
	let bytes_len_	= bytes.length;
	let temp_hex_str = "";
	let error_str = "";
	let index;

	decoded.codec = {};
	decoded.codec.codecName = "decodeur SOCOMEC Js B10-L";
	decoded.codec.codecVersion = "v1.0";
	decoded.codec.codecDate = "02/03/2023";


	decoded.lora.payload  = "";

	for( var j = 0; j < bytes_len_; j++ )

	{
		temp_hex_str   = bytes[j].toString( 16 ).toUpperCase( );
		if( temp_hex_str.length == 1 )
		{
		  temp_hex_str = "0" + temp_hex_str;
		}
		decoded.lora.payload += temp_hex_str;
		
	}
	var date = new Date();
	decoded.lora.date = date.toISOString();

	if (bytes.length >= 1) 
	{
	
		MsgType = bytes[0]; // Type of message
		
		if (MsgType == 0x11) //Alarms
		{
			index = 1;
			NbSecond = (bytes[index++]*256*256*256+bytes[index++]*256*256+bytes[index++]*256+bytes[index++]);
			LogicCombi_Alarm = bytes[index++];
			Analogic_Alarm = bytes[index++];
			System_Alarm = bytes[index++];
			Protection_Alarm = bytes[index++];
			
			decoded.socomec = {}; 
			decoded.socomec.data = {};

			decoded.socomec.frame_type = MsgType;
			decoded.socomec.frame_type_label = "Alarm";

			//decoded.periodic_data_content = {};

			decoded.socomec.timestamp = (NbSecond === 0 ) ? "null" : new Date( (NbSecond*1000) + Date.UTC(2000,0,1,0,0,0) );


			decoded.socomec.data = {
				...decoded.socomec.data,
				
				ILogicalAlarmValue1: (LogicCombi_Alarm & 0x01) ? 1 : 0,
				ILogicalAlarmValue2: (LogicCombi_Alarm & 0x02) ? 1 : 0,
				ILogicalAlarmValue3: (LogicCombi_Alarm & 0x04) ? 1 : 0,
				ILogicalAlarmValue4: (LogicCombi_Alarm & 0x08) ? 1 : 0,
				ICombiAlarmValue1: (LogicCombi_Alarm & 0x10) ? 1 : 0,
				ICombiAlarmValue2: (LogicCombi_Alarm & 0x20) ? 1 : 0,
				ICombiAlarmValue3: (LogicCombi_Alarm & 0x40) ? 1 : 0,
				ICombiAlarmValue4: (LogicCombi_Alarm & 0x80) ? 1 : 0,

				IAnalogAlarmValue1: (Analogic_Alarm & 0x01) ? 1 : 0,
				IAnalogAlarmValue2: (Analogic_Alarm & 0x02) ? 1 : 0,
				IAnalogAlarmValue3: (Analogic_Alarm & 0x04) ? 1 : 0,
				IAnalogAlarmValue4: (Analogic_Alarm & 0x08) ? 1 : 0,
				IAnalogAlarmValue5: (Analogic_Alarm & 0x10) ? 1 : 0,
				IAnalogAlarmValue6: (Analogic_Alarm & 0x20) ? 1 : 0,
				IAnalogAlarmValue7: (Analogic_Alarm & 0x40) ? 1 : 0,
				IAnalogAlarmValue8: (Analogic_Alarm & 0x80) ? 1 : 0,

				ISystemAlarmValue1: (System_Alarm & 0x01) ? 1 : 0,
				ISystemAlarmValue2: (System_Alarm & 0x02) ? 1 : 0,
				ISystemAlarmValue3: (System_Alarm & 0x04) ? 1 : 0,
				ISystemAlarmValue4: (System_Alarm & 0x08) ? 1 : 0,
				
				IProtectionAlarmValue1: (Protection_Alarm & 0x01) ? 1 : 0,
				IProtectionAlarmValue2: (Protection_Alarm & 0x02) ? 1 : 0,
				IProtectionAlarmValue3: (Protection_Alarm & 0x04) ? 1 : 0,
				IProtectionAlarmValue4: (Protection_Alarm & 0x08) ? 1 : 0,
				IProtectionAlarmValue5: (Protection_Alarm & 0x10) ? 1 : 0,
				IProtectionAlarmValue6: (Protection_Alarm & 0x20) ? 1 : 0,

			};
		
		}

		if (MsgType == 2) //periodic data
		{
			Profile = ((bytes[1] & 0xF0) >>> 4);
			Profile_version = (bytes[1] & 0x0F);
			
			let Profil_OK = ((Profile >= 0) && (Profile <=  7)) ? true : false;

			Decode_DIaVM = false;
			Decode_CounterStatus = false;

			if  (Profile === 0) decoded.error = "0 - custom Profil ... not managed"; else 
			{
				decoded.socomec = {}; 
				decoded.socomec.data = {};
			}

			if (Profil_OK)
			{
				decoded.socomec.frame_type = MsgType;
				decoded.socomec.frame_type_label = "periodic data";

				decoded.socomec.profileId = Profile; //
				decoded.socomec.profileVersion = Profile_version;
			} else
			{
				decoded.error = "error, Profile type not managed";
			}


			if (Profile === 1) // Single-load – Energies (consumption/production)
			{
				NbSecond = (readBytes(bytes, 2 , 4));
				Ea_plus = (readBytes(bytes, 6, 8));
				Ea_moins = (readBytes(bytes, 14, 8));
				Er_plus = (readBytes(bytes, 22, 8));
				Er_moins = (readBytes(bytes, 30, 8));
				PulseMeter = (readBytes(bytes, 38, 8));

				DIaVM = (readBytes(bytes, 46, 2)); Decode_DIaVM = true;
				CounterStatus = (readBytes(bytes, 48, 2)); Decode_CounterStatus = true;
							
				decoded.socomec.profileLabel =  "1- Single Load Energies (consumption/production)";

				decoded.socomec.data = {
					...decoded.socomec.data,
					
					IEaPInst: Ea_plus/10000,
					IEaPInst_Unit: "kWh",
					IEaNInst: Ea_moins/10000,
					IEaNInst_Unit: "kWh",
					IErPInst: Er_plus/10000,
					IErPInst_Unit: "kVar",
					IErNInst: Er_moins/10000,
					IErNInst_Unit: "kVar",
					ITotalMeter: PulseMeter/10000,
					ITotalMeter_Unit: "pulse"
					
				};

			}


			if (Profile === 2) //Profile 2: Multi-load – Energies (consumption)
			{
				NbSecond = (readBytes(bytes, 2 , 4));
				Ea_plus_Load1 = (readBytes(bytes, 6, 4));
				Er_plus_Load1 = (readBytes(bytes, 10, 4));
				Ea_plus_Load2 = (readBytes(bytes, 14, 4));
				Er_plus_Load2 = (readBytes(bytes, 18, 4));
				Ea_plus_Load3 = (readBytes(bytes, 22, 4));
				Er_plus_Load3 = (readBytes(bytes, 16, 4));
				Ea_plus_Load4 = (readBytes(bytes, 30, 4));
				Er_plus_Load4 = (readBytes(bytes, 34, 4));
				PulseMeter = (readBytes(bytes, 38, 8));

				DIaVM = (readBytes(bytes, 46, 2)); Decode_DIaVM = true;
				CounterStatus = (readBytes(bytes, 48, 2)); Decode_CounterStatus = true;
							
				decoded.socomec.profileLabel = "2- Multi-load – Energies (comsumption)";

				decoded.socomec.data = {
					...decoded.socomec.data,
					
					IEaPInst1: Ea_plus_Load1,
					IEaPInst1_Unit: "kWh",
					IErPInst1: Er_plus_Load1,
					IErPInst1_Unit: "kVar",
					
					IEaPInst2: Ea_plus_Load2,
					IEaPInst2_Unit: "kWh",
					IErPInst2: Er_plus_Load2,
					IErPInst2_Unit: "kVar",

					IEaPInst3: Ea_plus_Load3,
					IEaPInst3_Unit: "kWh",
					IErPInst3: Er_plus_Load3,
					IErPInst3_Unit: "kVar",

					IEaPInst4: Ea_plus_Load4,
					IEaPInst4_Unit: "kWh",
					IErPInst4: Er_plus_Load4,
					IErPInst4_Unit: "kVar",

				};
			
			}

			if (Profile === 3) //Profile 3: Multi-load – Energies (consumption/production)
			{
				NbSecond = (readBytes(bytes, 2 , 4));
				Ea_plus_Load1 = (readBytes(bytes, 6, 4));
				Ea_moins_Load1 = (readBytes(bytes, 10, 4));
				Ea_plus_Load2 = (readBytes(bytes, 14, 4));
				Ea_moins_Load2 = (readBytes(bytes, 18, 4));
				Ea_plus_Load3 = (readBytes(bytes, 22, 4));
				Ea_moins_Load3 = (readBytes(bytes, 16, 4));
				Ea_plus_Load4 = (readBytes(bytes, 30, 4));
				Ea_moins_Load4 = (readBytes(bytes, 34, 4));
				PulseMeter = (readBytes(bytes, 38, 8));

				DIaVM = (readBytes(bytes, 46, 2)); Decode_DIaVM = true;
				CounterStatus = (readBytes(bytes, 48, 2)); Decode_CounterStatus = true;
			
				decoded.socomec.profileLabel = "3- Multi-load – Energies (consumption/production)";

				decoded.socomec.data = {
					...decoded.socomec.data,
					
					IEaPInst1: Ea_plus_Load1,
					IEaPInst1_Unit: "kWh",
					IEaNInst1: Ea_moins_Load1,
					IEaNInst1_Unit: "kWh",
					
					IEaPInst2: Ea_plus_Load2,
					IEaPInst2_Unit: "kWh",
					IEaNInst2: Ea_moins_Load2,
					IEaNInst2_Unit: "kWh",

					IEaPInst3: Ea_plus_Load3,
					IEaPInst3_Unit: "kWh",
					IEaNInst3: Ea_moins_Load3,
					IEaNInst3_Unit: "kWh",

					IEaPInst4: Ea_plus_Load4,
					IEaPInst4_Unit: "kWh",
					IEaNInst4: Ea_moins_Load4,
					IEaNInst4_Unit: "kWh",

				};
				
			}

			if (Profile === 4) //Profile 4: Single-load – Monitoring
			{
				NbSecond = (readBytes(bytes, 2 , 4));
				Pmoy = U32toS32(readBytes(bytes, 6, 4))/1000;
				Qmoy = U32toS32(readBytes(bytes, 10, 4))/1000;
				Smoy = (readBytes(bytes, 14, 4))/1000;
				Pf_Moy = U32toS16(readBytes(bytes, 18, 2));
				Pf_Type = (readBytes(bytes, 20, 2));
				I1_Moy = (readBytes(bytes, 22, 4))/1000;
				I2_Moy = (readBytes(bytes, 26, 4))/1000;
				I3_Moy = (readBytes(bytes, 30, 4))/1000;
				F_moy = (readBytes(bytes, 34, 4))/1000;
				DIaVM = (readBytes(bytes, 38, 2)); Decode_DIaVM = true;
				Temp_1 = U32toS16(readBytes(bytes, 40, 2));
				Temp_2 = U32toS16(readBytes(bytes, 42, 2));
				Temp_3 = U32toS16(readBytes(bytes, 44, 2));
				CounterStatus2 = (readBytes(bytes, 46, 2)); 
				CounterStatus = (readBytes(bytes, 48, 2)); Decode_CounterStatus = true;

				decoded.socomec.profileLabel = "4- Single-load – Monitoring";

				decoded.socomec.data = {
					...decoded.socomec.data,
					
					IPSumAvgInst: Pmoy,
					IPSumAvgInst_Unit: "kW",
					IQSumAvgInst: Qmoy,
					IQSumAvgInst_Unit: "kVar",
					ISSumAvgInst: Smoy,
					ISSumAvgInst_Unit: "kVar",

					IpFSumAvgInst: Pf_Moy,
					IpFSumAvgInst_Unit: "null",
					IpFSumTypeAvg: Pf_Type,
					IpFSumTypeAvg_Unit: "null",

					II1AvgInst: I1_Moy,
					II1AvgInst_Unit: "A",
					II2AvgInst: I2_Moy,
					II2AvgInst_Unit: "A",
					II3AvgInst: I3_Moy,
					II3AvgInst_Unit: "A",

					IFreqAvgInst: F_moy,
					IFreqAvgInst_Unit: "Hz",

					IInstTemperature1: (Temp_1 === 0x7FFF) ? "null" : Temp_1/100,
					IInstTemperature2: (Temp_2 === 0x7FFF) ? "null" : Temp_2/100,
					IInstTemperature3: (Temp_3 === 0x7FFF) ? "null" : Temp_3/100,
					
					IInstTemperature1_unit: "°C",
					IInstTemperature2_unit: "°C",
					IInstTemperature3_unit: "°C",

					CT1Cpt: (CounterStatus2 & 0x000F),
					CT2Cpt: ((CounterStatus2 & 0x00F0) >> 4),
					CT3Cpt: ((CounterStatus2 & 0x0F00) >> 8),
					CT4Cpt: ((CounterStatus2 & 0xF000) >> 12)

				};
				
			}

			if (Profile === 5) //Profile 5- Multi-load – Monitoring
			{
				NbSecond = (readBytes(bytes, 2 , 4));
				Pmoy_Load1 = U32toS32(readBytes(bytes, 6, 4))/1000;
				Qmoy_Load1 = U32toS32(readBytes(bytes, 10, 4))/1000;
				Pmoy_Load2 = U32toS32(readBytes(bytes, 14, 4))/1000;
				Qmoy_Load2 = U32toS32(readBytes(bytes, 18, 4))/1000;
				Pmoy_Load3 = U32toS32(readBytes(bytes, 22, 4))/1000;
				Qmoy_Load3 = U32toS32(readBytes(bytes, 26, 4))/1000;
				Pmoy_Load4 = U32toS32(readBytes(bytes, 30, 4))/1000;
				Qmoy_Load4 = U32toS32(readBytes(bytes, 34, 4))/1000;

				DIaVM = (readBytes(bytes, 38, 2)); Decode_DIaVM = true;
				CounterStatus = (readBytes(bytes, 40, 2)); Decode_CounterStatus = true;
			
				decoded.socomec.profileLabel = "5- Multi-load – Monitoring";

				decoded.socomec.data = {
					...decoded.socomec.data,
					
					IPSumAvgInst1: Pmoy_Load1,
					IPSumAvgInst1_Unit: "kW",
					IQSumAvgInst1: Qmoy_Load1,
					IQSumAvgInst1_Unit: "kVar",

					IPSumAvgInst2: Pmoy_Load2,
					IPSumAvgInst2_Unit: "kW",
					IQSumAvgInst2: Qmoy_Load2,
					IQSumAvgInst2_Unit: "kVar",

					IPSumAvgInst3: Pmoy_Load3,
					IPSumAvgInst3_Unit: "kW",
					IQSumAvgInst3: Qmoy_Load3,
					IQSumAvgInst3_Unit: "kVar",

					IPSumAvgInst4: Pmoy_Load4,
					IPSumAvgInst4_Unit: "kW",
					IQSumAvgInst4: Qmoy_Load4,
					IQSumAvgInst4_Unit: "kVar",
				};
				
			}

			if (Profile === 6) //Profile 6- Single-load – Load curves
			{
				Date_t0 = (readBytes(bytes, 2 , 4));
				P_Plus_t0 = (readBytes(bytes, 6, 4))/1000;
				P_Moins_t0 = (readBytes(bytes, 10, 4))/1000;
				Q_Plus_t0 = (readBytes(bytes, 14, 4))/1000;
				Q_Moins_t0 = (readBytes(bytes, 18, 4))/1000;
				type_t0 = (readBytes(bytes, 22, 2));

				Date_t1 = (readBytes(bytes, 24 , 4));
				P_Plus_t1 = (readBytes(bytes, 28, 4))/1000;
				P_Moins_t1 = (readBytes(bytes, 32, 4))/1000;
				Q_Plus_t1 = (readBytes(bytes, 36, 4))/1000;
				Q_Moins_t1 = (readBytes(bytes, 40, 4))/1000;
				type_t1 = (readBytes(bytes, 44, 2));

				DIaVM = (readBytes(bytes, 46, 2)); Decode_DIaVM = true;
				CounterStatus = (readBytes(bytes, 48, 2)); Decode_CounterStatus = true;
			
				decoded.socomec.profileLabel = "6- Single-load – Load curves";

				decoded.socomec.data = {
					...decoded.socomec.data,
					
					timestamp_t0: (Date_t0 === 0 ) ? "null" : new Date( (Date_t0*1000) + Date.UTC(2000,0,1,0,0,0) ),
					ILastP10ActivePower: P_Plus_t0,
					ILastP10ActivePower_Unit: "kW",
					ILastP10ActivePowerNeg: P_Moins_t0,
					ILastP10ActivePowerNeg_Unit: "kW",
					
					ILastP10ReactivePower: Q_Plus_t0,
					ILastP10ReactivePower_Unit: "kVar",
					ILastP10ReactivePowerNeg  : Q_Moins_t0,
					ILastP10ReactivePowerNeg_Unit: "kVar",
					
					Type_P10 : type_t0,


					timestamp_t1: (Date_t1 === 0 ) ? "null" : new Date( (Date_t1*1000) + Date.UTC(2000,0,1,0,0,0) ),
					ILastP11ActivePower: P_Plus_t1,
					ILastP11ActivePower_Unit: "kW",
					ILastP11ActivePowerNeg: P_Moins_t1,
					ILastP11ActivePowerNeg_Unit: "kW",
					
					ILastP11ReactivePower: Q_Plus_t1,
					ILastP11ReactivePower_Unit: "kVar",
					ILastP11ReactivePowerNeg  : Q_Moins_t1,
					ILastP11ReactivePowerNeg_Unit: "kVar",
					
					Type_P11 : type_t1,
				};
				
			}

			if (Profile === 7) //Profile 7- Multi-load - Load curves
			{
				Date_t0 = (readBytes(bytes, 2 , 4));
				P_Plus_t0_load1 = (readBytes(bytes, 6, 4))/1000;
				P_Plus_t0_load2 = (readBytes(bytes, 10, 4))/1000;
				P_Plus_t0_load3 = (readBytes(bytes, 14, 4))/1000;
				P_Plus_t0_load4 = (readBytes(bytes, 18, 4))/1000;
				type_t0 = (readBytes(bytes, 22, 2));

				Date_t1 = (readBytes(bytes, 24 , 4));
				P_Plus_t1_load1 = (readBytes(bytes, 28, 4))/1000;
				P_Plus_t1_load2 = (readBytes(bytes, 32, 4))/1000;
				P_Plus_t1_load3 = (readBytes(bytes, 36, 4))/1000;
				P_Plus_t1_load4 = (readBytes(bytes, 40, 4))/1000;
				type_t1 = (readBytes(bytes, 44, 2));

				DIaVM = (readBytes(bytes, 46, 2)); Decode_DIaVM = true;
				CounterStatus = (readBytes(bytes, 48, 2)); Decode_CounterStatus = true;
			
				decoded.socomec.profileLabel = "7- Multi-load - Load curves";

				decoded.socomec.data = {
					...decoded.socomec.data,
					
					timestamp_t0: (Date_t0 === 0 ) ? "null" : new Date( (Date_t0*1000) + Date.UTC(2000,0,1,0,0,0) ),
					ILastP10ActivePower_Load1: P_Plus_t0_load1,
					ILastP10ActivePower_Load1_Unit: "kW",
					ILastP10ActivePower_Load2: P_Plus_t0_load2,
					ILastP10ActivePower_Load2_Unit: "kW",
					ILastP10ActivePower_Load3: P_Plus_t0_load3,
					ILastP10ActivePower_Load3_Unit: "kW",
					ILastP10ActivePower_Load4: P_Plus_t0_load4,
					ILastP10ActivePower_Load4_Unit: "kW",

					timestamp_t1: (Date_t1 === 0 ) ? "null" : new Date( (Date_t1*1000) + Date.UTC(2000,0,1,0,0,0) ),
					ILastP11ActivePower_Load1: P_Plus_t1_load1,
					ILastP11ActivePower_Load1_Unit: "kW",
					ILastP11ActivePower_Load2: P_Plus_t1_load2,
					ILastP11ActivePower_Load2_Unit: "kW",
					ILastP11ActivePower_Load3: P_Plus_t1_load3,
					ILastP11ActivePower_Load3_Unit: "kW",
					ILastP11ActivePower_Load4: P_Plus_t1_load4,
					ILastP11ActivePower_Load4_Unit: "kW",
					


				};
				
			}

		
			//-----------------------------------------------------
			// common part of some Profile
			//-----------------------------------------------------

			if (Profil_OK)
			{
				// Date
				if ((Profile !== 0) && (Profile !== 6) && (Profile !== 7)) 
				{
					decoded.socomec.timestamp = (NbSecond === 0 ) ? "null" : new Date( (NbSecond*1000) + Date.UTC(2000,0,1,0,0,0) );
				}
				// Profil
				
				if (Decode_DIaVM)  // Digital Inputs and VirtualMonitor (iTR)
				{
					decoded.socomec.data = {
						...decoded.socomec.data,

						IInputFct01: (DIaVM & 0x0001) ? 1 : 0,
						IInputFct02: (DIaVM & 0x0002) ? 1 : 0,
						IInputFct03: (DIaVM & 0x0004) ? 1 : 0,
						IInputFct04: (DIaVM & 0x0008) ? 1 : 0,
						IInputFct05: (DIaVM & 0x0010) ? 1 : 0,
						IInputFct06: (DIaVM & 0x0020) ? 1 : 0,
						IInputFct07: (DIaVM & 0x0040) ? 1 : 0,
						IInputFct08: (DIaVM & 0x0080) ? 1 : 0,
						IInputFct09: (DIaVM & 0x0100) ? 1 : 0,
						IInputFct10: (DIaVM & 0x0200) ? 1 : 0,

						CT1: (DIaVM & 0x0400) ? 1 : 0,
						CT2: (DIaVM & 0x0800) ? 1 : 0,
						CT3: (DIaVM & 0x1000) ? 1 : 0,
						CT4: (DIaVM & 0x2000) ? 1 : 0


					};

				}

				if (Decode_CounterStatus)  // Digital Inputs and VirtualMonitor (iTR)
				{
					decoded.socomec.data = {
						...decoded.socomec.data,

						Input1Cpt: (CounterStatus & 0x000F),
						Input2Cpt: ((CounterStatus & 0x00F0) >> 4),
						Input3Cpt: ((CounterStatus & 0x0F00) >> 8),
						Input4Cpt: ((CounterStatus & 0xF000) >> 12)
						};


				}
			}

		}

		if (MsgType == 1) // configuration
		{
			decoded.frame_type = 1;
			decoded.frame_type_label = "Configuration settings"

			if (bytes.length == 2)
			{
				if (bytes[1] === 1)
				{
					decoded.Config_settings_content = "B10L ask the date & hour"
				}

			} else decoded.error = "error, payload lenght must be 2 bytes";
		}

	
	}
  return decoded;
}

function decodeUplink(input){
    var bytes = input.bytes;

    var result = Decoder(bytes);

    var output = {
        data: result,
        errors: [],
        warnings: []
    }

    return output;
}

exports.decodeUplink = decodeUplink;