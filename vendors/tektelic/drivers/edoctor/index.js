function decodeUplink(input){

	var decoded_data = {};
	var decoder = [];
	var errors = [];
	var bytes = convertToUint8Array(input.bytes);
	decoded_data['raw'] = toHexString(bytes).toUpperCase();
	decoded_data['fPort'] = input.fPort;

	if(input.fPort === 101){
		decoder = [
			{
				key: [],
				fn: function(arg) { 
					var size = arg.length;
					var invalid_registers = [];
					var responses = [];
					while(arg.length > 0){
						var downlink_fcnt = arg[0];
						var num_invalid_writes = arg[1];
						arg = arg.slice(2);
						if(num_invalid_writes > 0) {
							for(var i = 0; i < num_invalid_writes; i++){
								invalid_registers.push("0x" + arg[i].toString(16));
							}
							arg = arg.slice(num_invalid_writes);
							responses.push(num_invalid_writes + ' Invalid write command(s) from DL:' + downlink_fcnt + ' for register(s): ' + invalid_registers);
						}
						else {
							responses.push('All write commands from DL:' + downlink_fcnt + 'were successfull');
						}
						invalid_registers = [];
					}
					decoded_data["response"] = responses;
					return size;
				}
			}
		];
	}

if (input.fPort === 100) {
	decoder = [
		{
			key: [0x00],
			fn: function(arg) { 
				decoded_data['device_eui'] = decode_field(arg, 8, 63, 0, "hexstring");
				return 8;
			}
		},
		{
			key: [0x01],
			fn: function(arg) { 
				decoded_data['app_eui'] = decode_field(arg, 8, 63, 0, "hexstring");
				return 8;
			}
		},
		{
			key: [0x02],
			fn: function(arg) { 
				decoded_data['app_key'] = decode_field(arg, 16, 127, 0, "hexstring");
				return 16;
			}
		},
		{
			key: [0x03],
			fn: function(arg) { 
				decoded_data['device_address'] = decode_field(arg, 4, 31, 0, "hexstring");
				return 4;
			}
		},
		{
			key: [0x04],
			fn: function(arg) { 
				decoded_data['network_session_key'] = decode_field(arg, 16, 127, 0, "hexstring");
				return 16;
			}
		},
		{
			key: [0x05],
			fn: function(arg) { 
				decoded_data['app_session_key'] = decode_field(arg, 16, 127, 0, "hexstring");
				return 16;
			}
		},
		{
			key: [0x10],
			fn: function(arg) { 
				var val = decode_field(arg, 2, 7, 7, "unsigned");
				{switch (val){
					case 0:
						decoded_data['join_mode'] = "ABP";
						break;
					case 1:
						decoded_data['join_mode'] = "OTAA";
						break;
					default:
						decoded_data['join_mode'] = "Invalid";
				}}
				return 2;
			}
		},
		{
			key: [0x11],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('loramac_opts')) {
					decoded_data['loramac_opts'] = {};
				}
				var val = decode_field(arg, 2, 3, 3, "unsigned");
				{switch (val){
					case 0:
						decoded_data['loramac_opts']['adr'] = "Disable";
						break;
					case 1:
						decoded_data['loramac_opts']['adr'] = "Enable";
						break;
					default:
						decoded_data['loramac_opts']['adr'] = "Invalid";
				}}
				var val = decode_field(arg, 2, 2, 2, "unsigned");
				{switch (val){
					case 0:
						decoded_data['loramac_opts']['duty_cycle'] = "Disable";
						break;
					case 1:
						decoded_data['loramac_opts']['duty_cycle'] = "Enable";
						break;
					default:
						decoded_data['loramac_opts']['duty_cycle'] = "Invalid";
				}}
				var val = decode_field(arg, 2, 1, 1, "unsigned");
				{switch (val){
					case 0:
						decoded_data['loramac_opts']['sync_word'] = "Private";
						break;
					case 1:
						decoded_data['loramac_opts']['sync_word'] = "Public";
						break;
					default:
						decoded_data['loramac_opts']['sync_word'] = "Invalid";
				}}
				var val = decode_field(arg, 2, 0, 0, "unsigned");
				{switch (val){
					case 0:
						decoded_data['loramac_opts']['confirm_mode'] = "Unconfirmed";
						break;
					case 1:
						decoded_data['loramac_opts']['confirm_mode'] = "Confirmed";
						break;
					default:
						decoded_data['loramac_opts']['confirm_mode'] = "Invalid";
				}}
				return 2;
			}
		},
		{
			key: [0x13],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('loramac_rx2')) {
					decoded_data['loramac_rx2'] = {};
				}
				decoded_data['loramac_rx2']['dr_number'] = decode_field(arg, 5, 7, 0, "unsigned");
				decoded_data['loramac_rx2']['frequency'] = decode_field(arg, 5, 39, 8, "unsigned");
				return 5;
			}
		},
		{
			key: [0x12],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('loramac_dr_tx')) {
					decoded_data['loramac_dr_tx'] = {};
				}
				decoded_data['loramac_dr_tx']['tx_power'] = decode_field(arg, 2, 3, 0, "unsigned");
				return 2;
			}
		},
		{
			key: [0x19],
			fn: function(arg) { 
				decoded_data['loramac_net_id_msb'] = decode_field(arg, 2, 15, 0, "unsigned");
				return 2;
			}
		},
		{
			key: [0x1A],
			fn: function(arg) { 
				decoded_data['loramac_net_id_lsb'] = decode_field(arg, 2, 15, 0, "unsigned");
				return 2;
			}
		},
		{
			key: [0x20],
			fn: function(arg) { 
				decoded_data['normal_report_period'] = decode_field(arg, 1, 7, 0, "unsigned");
				return 1;
			}
		},
		{
			key: [0x21],
			fn: function(arg) { 
				decoded_data['ua_report_period'] = decode_field(arg, 1, 7, 0, "unsigned");
				return 1;
			}
		},
		{
			key: [0x22],
			fn: function(arg) { 
				decoded_data['rest_report_period'] = decode_field(arg, 1, 7, 0, "unsigned");
				return 1;
			}
		},
		{
			key: [0x23],
			fn: function(arg) { 
				decoded_data['metadata_report_period'] = decode_field(arg, 2, 15, 0, "unsigned");
				return 2;
			}
		},
		{
			key: [0x2A],
			fn: function(arg) { 
				var val = decode_field(arg, 1, 0, 0, "unsigned");
				{switch (val){
					case 0:
						decoded_data['enabled'] = "Disable";
						break;
					case 1:
						decoded_data['enabled'] = "Enable";
						break;
					default:
						decoded_data['enabled'] = "Invalid";
				}}
				return 1;
			}
		},
		{
			key: [0x2B],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('transition_parameters')) {
					decoded_data['transition_parameters'] = {};
				}
				decoded_data['transition_parameters']['gamma'] = decode_field(arg, 2, 15, 8, "unsigned");
				decoded_data['transition_parameters']['beta'] = decode_field(arg, 2, 7, 4, "unsigned");
				decoded_data['transition_parameters']['alpha'] = decode_field(arg, 2, 3, 0, "unsigned");
				return 2;
			}
		},
		{
			key: [0x2C],
			fn: function(arg) { 
				decoded_data['transition_threshold_period'] = decode_field(arg, 1, 7, 0, "unsigned");
				return 1;
			}
		},
		{
			key: [0x34],
			fn: function(arg) { 
				decoded_data['a0'] = decode_field(arg, 4, 31, 0, "double");
				return 4;
			}
		},
		{
			key: [0x35],
			fn: function(arg) { 
				decoded_data['a1'] = decode_field(arg, 4, 31, 0, "double");
				return 4;
			}
		},
		{
			key: [0x36],
			fn: function(arg) { 
				decoded_data['a2'] = decode_field(arg, 4, 31, 0, "double");
				return 4;
			}
		},
		{
			key: [0x37],
			fn: function(arg) { 
				decoded_data['bt_count_threshold'] = decode_field(arg, 1, 7, 0, "unsigned");
				return 1;
			}
		},
		{
			key: [0x38],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('bt_limits')) {
					decoded_data['bt_limits'] = {};
				}
				decoded_data['bt_limits']['bt_limits_high'] = decode_field(arg, 2, 15, 8, "unsigned");
				decoded_data['bt_limits']['bt_limits_low'] = decode_field(arg, 2, 7, 0, "unsigned");
				return 2;
			}
		},
		{
			key: [0x39],
			fn: function(arg) { 
				decoded_data['bt_ma_len'] = decode_field(arg, 1, 7, 0, "unsigned");
				return 1;
			}
		},
		{
			key: [0x3B],
			fn: function(arg) { 
				decoded_data['rr_window_size'] = decode_field(arg, 1, 7, 0, "unsigned");
				return 1;
			}
		},
		{
			key: [0x3C],
			fn: function(arg) { 
				decoded_data['rr_limits_high'] = decode_field(arg, 2, 15, 8, "unsigned");
				decoded_data['rr_limits_low'] = decode_field(arg, 2, 7, 0, "unsigned");
				return 2;
			}
		},
		{
			key: [0x3D],
			fn: function(arg) { 
				decoded_data['ce_conversion_factor'] = decode_field(arg, 4, 31, 0, "double");
				return 4;
			}
		},
		{
			key: [0x3E],
			fn: function(arg) { 
				decoded_data['ce_stat_function'] = decode_field(arg, 1, 7, 0, "unsigned");
				return 1;
			}
		},
		{
			key: [0x40],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('sensitivity')) {
					decoded_data['sensitivity'] = {};
				}
				var val = decode_field(arg, 1, 2, 0, "unsigned");
				{switch (val){
					case 1:
						decoded_data['sensitivity']['sample_rate'] = "1 Hz";
						break;
					case 2:
						decoded_data['sensitivity']['sample_rate'] = "10 Hz";
						break;
					case 3:
						decoded_data['sensitivity']['sample_rate'] = "25 Hz";
						break;
					case 4:
						decoded_data['sensitivity']['sample_rate'] = "50 Hz";
						break;
					case 5:
						decoded_data['sensitivity']['sample_rate'] = "100 Hz";
						break;
					case 6:
						decoded_data['sensitivity']['sample_rate'] = "200 Hz";
						break;
					case 7:
						decoded_data['sensitivity']['sample_rate'] = "400 Hz";
						break;
					default:
						decoded_data['sensitivity']['sample_rate'] = "Invalid";
				}}
				var val = decode_field(arg, 1, 5, 4, "unsigned");
				{switch (val){
					case 0:
						decoded_data['sensitivity']['measurement_range'] = "2g";
						break;
					case 1:
						decoded_data['sensitivity']['measurement_range'] = "4g";
						break;
					case 2:
						decoded_data['sensitivity']['measurement_range'] = "8g";
						break;
					case 3:
						decoded_data['sensitivity']['measurement_range'] = "16g";
						break;
					default:
						decoded_data['sensitivity']['measurement_range'] = "Invalid";
				}}
				return 1;
			}
		},
		{
			key: [0x4A],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('parameters')) {
					decoded_data['parameters'] = {};
				}
				decoded_data['parameters']['time_percentage'] = decode_field(arg, 1, 7, 4, "unsigned");
				decoded_data['parameters']['intensity'] = decode_field(arg, 1, 0, 3, "unsigned");
				return 1;
			}
		},
		{
			key: [0x50],
			fn: function(arg) { 
				decoded_data['r_to_r_window_averaging'] = decode_field(arg, 1, 3, 0, "unsigned");
				return 1;
			}
		},
		{
			key: [0x51],
			fn: function(arg) { 
				decoded_data['r_to_r_gain'] = decode_field(arg, 1, 3, 0, "unsigned");
				return 1;
			}
		},
		{
			key: [0x52],
			fn: function(arg) { 
				decoded_data['r_to_r_peak_averaging_weight_factor'] = decode_field(arg, 1, 1, 0, "unsigned");
				return 1;
			}
		},
		{
			key: [0x53],
			fn: function(arg) { 
				decoded_data['r_to_r_peak_threshold_scaling_factor'] = decode_field(arg, 1, 3, 0, "unsigned");
				return 1;
			}
		},
		{
			key: [0x54],
			fn: function(arg) { 
				decoded_data['r_to_r_minimum_hold_off'] = decode_field(arg, 1, 5, 0, "unsigned");
				return 1;
			}
		},
		{
			key: [0x55],
			fn: function(arg) { 
				decoded_data['r_to_r_interval_averaging_weight_factor'] = decode_field(arg, 1, 1, 0, "unsigned");
				return 1;
			}
		},
		{
			key: [0x56],
			fn: function(arg) { 
				decoded_data['r_to_r_interval_hold_off_scaling_factor'] = decode_field(arg, 1, 2, 0, "unsigned");
				return 1;
			}
		},
		{
			key: [0x57],
			fn: function(arg) { 
				decoded_data['hr_window_size'] = decode_field(arg, 1, 7, 0, "unsigned");
				return 1;
			}
		},
		{
			key: [0x58],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('hr_limits')) {
					decoded_data['hr_limits'] = {};
				}
				decoded_data['hr_limits']['hr_step_limit_m'] = decode_field(arg, 2, 15, 8, "unsigned");
				decoded_data['hr_limits']['hr_step_limit_s'] = decode_field(arg, 2, 7, 0, "unsigned");
				return 2;
			}
		},
		{
			key: [0x71],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('metadata')) {
					decoded_data['metadata'] = {};
				}
				decoded_data['metadata']['app_major_version'] = decode_field(arg, 4, 31, 24, "unsigned");
				decoded_data['metadata']['app_minor_version'] = decode_field(arg, 4, 23, 16, "unsigned");
				decoded_data['metadata']['app_revision'] = decode_field(arg, 4, 15, 8, "unsigned");
				var val = decode_field(arg, 4, 7, 0, "unsigned");
				{switch (val){
					case 0:
						decoded_data['metadata']['region'] = "EU868";
						break;
					case 1:
						decoded_data['metadata']['region'] = "US915";
						break;
					case 2:
						decoded_data['metadata']['region'] = "AS923";
						break;
					case 3:
						decoded_data['metadata']['region'] = "AU915";
						break;
					case 4:
						decoded_data['metadata']['region'] = "IN865";
						break;
					case 5:
						decoded_data['metadata']['region'] = "CN470";
						break;
					case 6:
						decoded_data['metadata']['region'] = "KR920";
						break;
					case 7:
						decoded_data['metadata']['region'] = "RU864";
						break;
					case 8:
						decoded_data['metadata']['region'] = "DN915";
						break;
					default:
						decoded_data['metadata']['region'] = "Invalid";
				}}
				return 4;
			}
		},
	];
}
if (input.fPort === 10) {
	decoder = [
		{
			key: [],
			fn: function(arg) { 
				decoded_data['battery'] = (decode_field(arg, 9, 71, 64, "unsigned") * 0.391304348 + 0.608695652).toFixed(2);
				decoded_data['body_temperature'] = (decode_field(arg, 9, 63, 56, "unsigned") * 0.05 + 30).toFixed(2);
				decoded_data['respiratory_rate'] = decode_field(arg, 9, 55, 48, "unsigned");
				decoded_data['ua_mode_active'] = decode_field(arg, 9, 47, 47, "unsigned");
				decoded_data['rest_mode_status'] = decode_field(arg, 9, 46, 46, "unsigned");
				decoded_data['ce'] = decode_field(arg, 9, 43, 40, "unsigned");
				decoded_data['csc'] = decode_field(arg, 9, 39, 32, "unsigned");
				decoded_data['af'] = decode_field(arg, 9, 31, 31, "unsigned");
				decoded_data['position'] = decode_field(arg, 9, 30, 24, "unsigned");
				decoded_data['heart_rate'] = decode_field(arg, 9, 23, 16, "unsigned");
				decoded_data['body_temperature_2'] = decode_field(arg, 9, 15, 8, "unsigned");
				decoded_data['af_2'] = decode_field(arg, 9, 7, 0, "unsigned");
				return 9;
			}
		},
	];
}

	try {
		for (var bytes_left = bytes.length; bytes_left > 0;) {
			var found = false;
			for (var i = 0; i < decoder.length; i++) {
				var item = decoder[i];
				var key = item.key;
				var keylen = key.length;
				var header = slice(bytes, 0, keylen);
				if (is_equal(header, key)) { // Header in the data matches to what we expect
					var f = item.fn;
					var consumed = f(slice(bytes, keylen, bytes.length)) + keylen;
					bytes_left -= consumed;
					bytes = slice(bytes, consumed, bytes.length);
					found = true;
					break;
				}
			}
			if (!found) {
				errors.push("Unable to decode header " + toHexString(header).toUpperCase());
				break;
			}
		}
	} catch (error) {
		errors = "Fatal decoder error";
	}

	function slice(a, f, t) {
		var res = [];
		for (var i = 0; i < t - f; i++) {
			res[i] = a[f + i];
		}
		return res;
	}

	// Extracts bits from a byte array
	function extract_bytes(chunk, startBit, endBit) {
		var array = new Array(0);
		var totalBits = startBit - endBit + 1;
		var totalBytes = Math.ceil(totalBits / 8);
		var endBits = 0;
		var startBits = 0;
		for (var i = 0; i < totalBytes; i++) {
			if(totalBits > 8) {
				endBits = endBit;
				startBits = endBits + 7;
				endBit = endBit + 8;
				totalBits -= 8;
			} else {
				endBits = endBit;
				startBits = endBits + totalBits - 1;
				totalBits = 0;
			}
			var endChunk = chunk.length - Math.ceil((endBits + 1) / 8);
			var startChunk = chunk.length - Math.ceil((startBits + 1) / 8);
			var word = 0x0;
			if (startChunk == endChunk){
				var endOffset = endBits % 8;
				var startOffset = startBits % 8;
				var mask = 0xFF >> (8 - (startOffset - endOffset + 1));
				word = (chunk[startChunk] >> endOffset) & mask;
				array.unshift(word);
			} else {
				var endChunkEndOffset = endBits % 8;
				var endChunkStartOffset = 7;
				var endChunkMask = 0xFF >> (8 - (endChunkStartOffset - endChunkEndOffset + 1));
				var endChunkWord = (chunk[endChunk] >> endChunkEndOffset) & endChunkMask;
				var startChunkEndOffset = 0;
				var startChunkStartOffset = startBits % 8;
				var startChunkMask = 0xFF >> (8 - (startChunkStartOffset - startChunkEndOffset + 1));
				var startChunkWord = (chunk[startChunk] >> startChunkEndOffset) & startChunkMask;
				var startChunkWordShifted = startChunkWord << (endChunkStartOffset - endChunkEndOffset + 1);
				word = endChunkWord | startChunkWordShifted;
				array.unshift(word);
			}
		}
		return array;
	}

	// Applies data type to a byte array
	function apply_data_type(bytes, data_type) {
		var output = 0;
		if (data_type === "unsigned") {
			for (var i = 0; i < bytes.length; ++i) {
				output = (to_uint(output << 8)) | bytes[i];
			}
			return output;
		}
		if (data_type === "signed") {
			for (var i = 0; i < bytes.length; ++i) {
				output = (output << 8) | bytes[i];
			}
			// Convert to signed, based on value size
			if (output > Math.pow(2, 8 * bytes.length - 1)) {
				output -= Math.pow(2, 8 * bytes.length);
			}
			return output;
		}
		if (data_type === "bool") {
			return !(bytes[0] === 0);
		}
		if (data_type === "hexstring") {
			return toHexString(bytes);
		}
		return null; // Incorrect data type
	}

	// Decodes bitfield from the given chunk of bytes
	function decode_field(chunk, size, start_bit, end_bit, data_type) {
		var new_chunk = chunk.slice(0, size);
		var chunk_size = new_chunk.length;
		if (start_bit >= chunk_size * 8) {
			return null; // Error: exceeding boundaries of the chunk
		}
		if (start_bit < end_bit) {
			return null; // Error: invalid input
		}
		var array = extract_bytes(new_chunk, start_bit, end_bit);
		return apply_data_type(array, data_type);
	}

	// Converts value to unsigned
	function to_uint(x) {
		return x >>> 0;
	}

	// Checks if two arrays are equal
	function is_equal(arr1, arr2) {
		if (arr1.length != arr2.length) {
			return false;
		}
		for (var i = 0; i != arr1.length; i++) {
			if (arr1[i] != arr2[i]) {
				return false;
			}
		}
		return true;
	}

	// Converts array of bytes to hex string
	function toHexString(byteArray) {
		var arr = [];
		for (var i = 0; i < byteArray.length; ++i) {
			arr.push(('0' + (byteArray[i] & 0xFF).toString(16)).slice(-2));
		}
		return arr.join(' ');
	}

    // Converts array of bytes to 8 bit array
    function convertToUint8Array(byteArray) {
		var arr = [];
		for (var i = 0; i < byteArray.length; i++) {
			arr.push(to_uint(byteArray[i]) & 0xff);
		}
		return arr;
	}

    var output = {
        "data": decoded_data,
		"errors": errors,
		"warnings": [],
    };

    return output;
}

/************************************
**********ADDED BY ACTILITY**********
************************************/

exports.decodeUplink = decodeUplink;