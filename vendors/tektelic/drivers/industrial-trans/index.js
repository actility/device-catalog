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
				decoded_data['core'] = decode_field(arg, 4, 31, 0, "unsigned");
				return 4;
			}
		},
		{
			key: [0x21],
			fn: function(arg) { 
				decoded_data['per_digital_input'] = decode_field(arg, 2, 15, 0, "unsigned");
				return 2;
			}
		},
		{
			key: [0x22],
			fn: function(arg) { 
				decoded_data['per_temperature'] = decode_field(arg, 2, 15, 0, "unsigned");
				return 2;
			}
		},
		{
			key: [0x23],
			fn: function(arg) { 
				decoded_data['per_humidity'] = decode_field(arg, 2, 15, 0, "unsigned");
				return 2;
			}
		},
		{
			key: [0x24],
			fn: function(arg) { 
				decoded_data['per_input1'] = decode_field(arg, 2, 15, 0, "unsigned");
				return 2;
			}
		},
		{
			key: [0x25],
			fn: function(arg) { 
				decoded_data['per_input2'] = decode_field(arg, 2, 15, 0, "unsigned");
				return 2;
			}
		},
		{
			key: [0x26],
			fn: function(arg) { 
				decoded_data['per_input3'] = decode_field(arg, 2, 15, 0, "unsigned");
				return 2;
			}
		},
		{
			key: [0x27],
			fn: function(arg) { 
				decoded_data['per_mcu_temperature'] = decode_field(arg, 2, 15, 0, "unsigned");
				return 2;
			}
		},
		{
			key: [0x28],
			fn: function(arg) { 
				decoded_data['per_output1'] = decode_field(arg, 2, 15, 0, "unsigned");
				return 2;
			}
		},
		{
			key: [0x29],
			fn: function(arg) { 
				decoded_data['per_output2'] = decode_field(arg, 2, 15, 0, "unsigned");
				return 2;
			}
		},
		{
			key: [0x2A],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('edge')) {
					decoded_data['edge'] = {};
				}
				var val = decode_field(arg, 1, 0, 0, "unsigned");
				{switch (val){
					case 0:
						decoded_data['edge']['rising'] = "Disabled";
						break;
					case 1:
						decoded_data['edge']['rising'] = "Enabled";
						break;
					default:
						decoded_data['edge']['rising'] = "Invalid";
				}}
				var val = decode_field(arg, 1, 1, 1, "unsigned");
				{switch (val){
					case 0:
						decoded_data['edge']['falling'] = "Disabled";
						break;
					case 1:
						decoded_data['edge']['falling'] = "Enabled";
						break;
					default:
						decoded_data['edge']['falling'] = "Invalid";
				}}
				return 1;
			}
		},
		{
			key: [0x2B],
			fn: function(arg) { 
				decoded_data['input1_count_threshold'] = decode_field(arg, 2, 15, 0, "unsigned");
				return 2;
			}
		},
		{
			key: [0x2C],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('report')) {
					decoded_data['report'] = {};
				}
				var val = decode_field(arg, 1, 0, 0, "unsigned");
				{switch (val){
					case 0:
						decoded_data['report']['input_state'] = "Disabled";
						break;
					case 1:
						decoded_data['report']['input_state'] = "Enabled";
						break;
					default:
						decoded_data['report']['input_state'] = "Invalid";
				}}
				var val = decode_field(arg, 1, 1, 1, "unsigned");
				{switch (val){
					case 0:
						decoded_data['report']['counter_value'] = "Disabled";
						break;
					case 1:
						decoded_data['report']['counter_value'] = "Enabled";
						break;
					default:
						decoded_data['report']['counter_value'] = "Invalid";
				}}
				return 1;
			}
		},
		{
			key: [0x30],
			fn: function(arg) { 
				decoded_data['input23_sample_period_idle'] = decode_field(arg, 4, 31, 0, "unsigned");
				return 4;
			}
		},
		{
			key: [0x31],
			fn: function(arg) { 
				decoded_data['input23_sample_period_active'] = decode_field(arg, 4, 31, 0, "unsigned");
				return 4;
			}
		},
		{
			key: [0x32],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('input2_threshold')) {
					decoded_data['input2_threshold'] = {};
				}
				decoded_data['input2_threshold']['input2_current_high_threshold'] = (decode_field(arg, 2, 7, 0, "unsigned") * 0.0001).toFixed(4);
				decoded_data['input2_threshold']['input2_current_low_threshold'] = (decode_field(arg, 2, 15, 8, "unsigned") * 0.0001).toFixed(4);
				return 2;
			}
		},
		{
			key: [0x33],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('input3_threshold')) {
					decoded_data['input3_threshold'] = {};
				}
				decoded_data['input3_threshold']['input3_current_high_threshold'] = (decode_field(arg, 2, 7, 0, "unsigned") * 0.05).toFixed(2);
				decoded_data['input3_threshold']['input3_current_low_threshold'] = (decode_field(arg, 2, 15, 8, "unsigned") * 0.05).toFixed(2);
				return 2;
			}
		},
		{
			key: [0x34],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('input23_threshold_enable')) {
					decoded_data['input23_threshold_enable'] = {};
				}
				var val = decode_field(arg, 1, 0, 0, "unsigned");
				{switch (val){
					case 0:
						decoded_data['input23_threshold_enable']['input2_threshold_enable'] = "Disabled";
						break;
					case 1:
						decoded_data['input23_threshold_enable']['input2_threshold_enable'] = "Enabled";
						break;
					default:
						decoded_data['input23_threshold_enable']['input2_threshold_enable'] = "Invalid";
				}}
				var val = decode_field(arg, 1, 4, 4, "unsigned");
				{switch (val){
					case 0:
						decoded_data['input23_threshold_enable']['input3_threshold_enable'] = "Disabled";
						break;
					case 1:
						decoded_data['input23_threshold_enable']['input3_threshold_enable'] = "Enabled";
						break;
					default:
						decoded_data['input23_threshold_enable']['input3_threshold_enable'] = "Invalid";
				}}
				return 1;
			}
		},
		{
			key: [0x39],
			fn: function(arg) { 
				decoded_data['temperature_relative_humidity_sample_period_idle'] = decode_field(arg, 4, 31, 0, "unsigned");
				return 4;
			}
		},
		{
			key: [0x3A],
			fn: function(arg) { 
				decoded_data['temperature_relative_humidity_sample_period_active'] = decode_field(arg, 4, 31, 0, "unsigned");
				return 4;
			}
		},
		{
			key: [0x3B],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('temp_threshold')) {
					decoded_data['temp_threshold'] = {};
				}
				decoded_data['temp_threshold']['temperature_high_threshold'] = decode_field(arg, 2, 7, 0, "signed");
				decoded_data['temp_threshold']['temperature_low_threshold'] = decode_field(arg, 2, 15, 8, "signed");
				return 2;
			}
		},
		{
			key: [0x3C],
			fn: function(arg) { 
				var val = decode_field(arg, 1, 7, 0, "unsigned");
				{switch (val){
					case 0:
						decoded_data['temperature_threshold_enable'] = "Disabled";
						break;
					case 1:
						decoded_data['temperature_threshold_enable'] = "Enabled";
						break;
					default:
						decoded_data['temperature_threshold_enable'] = "Invalid";
				}}
				return 1;
			}
		},
		{
			key: [0x40],
			fn: function(arg) { 
				decoded_data['mcu_temperature_sample_period_idle'] = decode_field(arg, 4, 31, 0, "unsigned");
				return 4;
			}
		},
		{
			key: [0x41],
			fn: function(arg) { 
				decoded_data['mcu_temperature_sample_period_active'] = decode_field(arg, 4, 31, 0, "unsigned");
				return 4;
			}
		},
		{
			key: [0x42],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('mcu_temp_threshold')) {
					decoded_data['mcu_temp_threshold'] = {};
				}
				decoded_data['mcu_temp_threshold']['mcu_temperature_high_threshold'] = decode_field(arg, 2, 7, 0, "unsigned");
				decoded_data['mcu_temp_threshold']['mcu_temperature_low_threshold'] = decode_field(arg, 2, 15, 8, "unsigned");
				return 2;
			}
		},
		{
			key: [0x43],
			fn: function(arg) { 
				var val = decode_field(arg, 1, 7, 0, "unsigned");
				{switch (val){
					case 0:
						decoded_data['mcu_temperature_threshold_enable'] = "Disabled";
						break;
					case 1:
						decoded_data['mcu_temperature_threshold_enable'] = "Enabled";
						break;
					default:
						decoded_data['mcu_temperature_threshold_enable'] = "Invalid";
				}}
				return 1;
			}
		},
		{
			key: [0x50],
			fn: function(arg) { 
				var val = decode_field(arg, 1, 7, 0, "unsigned");
				{switch (val){
					case 0:
						decoded_data['output1_control'] = "Manual";
						break;
					case 1:
						decoded_data['output1_control'] = "Input 1";
						break;
					case 2:
						decoded_data['output1_control'] = "Input 2";
						break;
					case 3:
						decoded_data['output1_control'] = "Input 3";
						break;
					default:
						decoded_data['output1_control'] = "Invalid";
				}}
				return 1;
			}
		},
		{
			key: [0x51],
			fn: function(arg) { 
				decoded_data['output1_delay'] = decode_field(arg, 2, 15, 0, "unsigned");
				return 2;
			}
		},
		{
			key: [0x52],
			fn: function(arg) { 
				var val = decode_field(arg, 1, 7, 0, "unsigned");
				{switch (val){
					case 0:
						decoded_data['output2_control'] = "Manual";
						break;
					case 1:
						decoded_data['output2_control'] = "Input 1";
						break;
					case 2:
						decoded_data['output2_control'] = "Input 2";
						break;
					case 3:
						decoded_data['output2_control'] = "Input 3";
						break;
					default:
						decoded_data['output2_control'] = "Invalid";
				}}
				return 1;
			}
		},
		{
			key: [0x53],
			fn: function(arg) { 
				decoded_data['output2_delay'] = decode_field(arg, 2, 15, 0, "unsigned");
				return 2;
			}
		},
		{
			key: [0x60],
			fn: function(arg) { 
				var val = decode_field(arg, 1, 7, 0, "unsigned");
				{switch (val){
					case 0:
						decoded_data['serial_interface_type'] = "RS485/RS422";
						break;
					case 1:
						decoded_data['serial_interface_type'] = "RS232";
						break;
					default:
						decoded_data['serial_interface_type'] = "Invalid";
				}}
				return 1;
			}
		},
		{
			key: [0x61],
			fn: function(arg) { 
				decoded_data['serial_baud_rate'] = decode_field(arg, 4, 31, 0, "unsigned");
				return 4;
			}
		},
		{
			key: [0x63],
			fn: function(arg) { 
				var val = decode_field(arg, 1, 7, 0, "unsigned");
				{switch (val){
					case 0:
						decoded_data['serial_parity_bits'] = "No parity";
						break;
					case 1:
						decoded_data['serial_parity_bits'] = "Odd";
						break;
					case 2:
						decoded_data['serial_parity_bits'] = "Even";
						break;
					default:
						decoded_data['serial_parity_bits'] = "Invalid";
				}}
				return 1;
			}
		},
		{
			key: [0x64],
			fn: function(arg) { 
				var val = decode_field(arg, 1, 7, 0, "unsigned");
				{switch (val){
					case 5:
						decoded_data['serial_stop_bits'] = "0.5 bits";
						break;
					case 10:
						decoded_data['serial_stop_bits'] = "1.0 bits";
						break;
					case 15:
						decoded_data['serial_stop_bits'] = "1.5 bits";
						break;
					case 20:
						decoded_data['serial_stop_bits'] = "2.0 bits";
						break;
					default:
						decoded_data['serial_stop_bits'] = "Invalid";
				}}
				return 1;
			}
		},
		{
			key: [0x65],
			fn: function(arg) { 
				var val = decode_field(arg, 1, 7, 0, "unsigned");
				{switch (val){
					case 0:
						decoded_data['serial_duplex_mode'] = "Half duplex";
						break;
					case 1:
						decoded_data['serial_duplex_mode'] = "Full duplex";
						break;
					default:
						decoded_data['serial_duplex_mode'] = "Invalid";
				}}
				return 1;
			}
		},
		{
			key: [0x66],
			fn: function(arg) { 
				decoded_data['serial_upink_format'] = decode_field(arg, 1, 7, 0, "unsigned");
				return 1;
			}
		},
		{
			key: [0x67],
			fn: function(arg) { 
				decoded_data['continuous_serial_receive'] = decode_field(arg, 1, 7, 0, "unsigned");
				return 1;
			}
		},
		{
			key: [0x68],
			fn: function(arg) { 
				decoded_data['modbus_rtu_symbol_timeout'] = decode_field(arg, 2, 15, 0, "unsigned");
				return 2;
			}
		},
		{
			key: [0x69],
			fn: function(arg) { 
				decoded_data['modbus_rtu_rx_timeout'] = decode_field(arg, 2, 15, 0, "unsigned");
				return 2;
			}
		},
		{
			key: [0x71],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('metadata')) {
					decoded_data['metadata'] = {};
				}
				decoded_data['metadata']['app_major_version'] = decode_field(arg, 7, 55, 48, "unsigned");
				decoded_data['metadata']['app_minor_version'] = decode_field(arg, 7, 47, 40, "unsigned");
				decoded_data['metadata']['app_revision'] = decode_field(arg, 7, 39, 32, "unsigned");
				decoded_data['metadata']['loramac_major_version'] = decode_field(arg, 7, 31, 24, "unsigned");
				decoded_data['metadata']['loramac_minor_version'] = decode_field(arg, 7, 23, 16, "unsigned");
				decoded_data['metadata']['loramac_revision'] = decode_field(arg, 7, 15, 8, "unsigned");
				var val = decode_field(arg, 7, 7, 0, "unsigned");
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
				return 7;
			}
		},
	];
}
if (input.fPort === 20) {
	decoder = [
		{
			key: [],
			fn: function(arg) { 
				decoded_data['done'] = decode_field(arg, 1, 7, 7, "unsigned");
				decoded_data['transaction_id'] = decode_field(arg, 1, 6, 5, "unsigned");
				decoded_data['fragment_number'] = decode_field(arg, 1, 4, 0, "unsigned");
				decoded_data['serial_data'] = decode_field(arg, 1, 511, 8, "unsigned");
				return 1;
			}
		},
	];
}
if (input.fPort === 21) {
	decoder = [
		{
			key: [0x6A],
			fn: function(arg) { 
				decoded_data['modbus_rtu_polling_period_6A'] = decode_field(arg, 10, 79, 0, "unsigned");
				return 10;
			}
		},
	];
}
if (input.fPort === 22) {
	decoder = [
		{
			key: [0x6B],
			fn: function(arg) { 
				decoded_data['modbus_rtu_polling_period_6B'] = decode_field(arg, 10, 79, 0, "unsigned");
				return 10;
			}
		},
	];
}
if (input.fPort === 23) {
	decoder = [
		{
			key: [0x6C],
			fn: function(arg) { 
				decoded_data['modbus_rtu_polling_period_6C'] = decode_field(arg, 10, 79, 0, "unsigned");
				return 10;
			}
		},
	];
}
if (input.fPort === 24) {
	decoder = [
		{
			key: [0x6D],
			fn: function(arg) { 
				decoded_data['modbus_rtu_polling_period_6D'] = decode_field(arg, 10, 79, 0, "unsigned");
				return 10;
			}
		},
	];
}
if (input.fPort === 25) {
	decoder = [
		{
			key: [0x6E],
			fn: function(arg) { 
				decoded_data['modbus_rtu_polling_period_6E'] = decode_field(arg, 10, 79, 0, "unsigned");
				return 10;
			}
		},
	];
}
if (input.fPort === 26) {
	decoder = [
		{
			key: [0x6F],
			fn: function(arg) { 
				decoded_data['modbus_rtu_polling_period_6F'] = decode_field(arg, 10, 79, 0, "unsigned");
				return 10;
			}
		},
	];
}
if (input.fPort === 10) {
	decoder = [
		{
			key: [0x00, 0xFF],
			fn: function(arg) { 
				decoded_data['battery_voltage'] = (decode_field(arg, 2, 15, 0, "signed") * 0.01).toFixed(2);
				return 2;
			}
		},
		{
			key: [0x01, 0x01],
			fn: function(arg) { 
				var val = decode_field(arg, 1, 7, 0, "unsigned");
				{switch (val){
					case 0:
						decoded_data['output1'] = "Open";
						break;
					case 255:
						decoded_data['output1'] = "Closed";
						break;
					default:
						decoded_data['output1'] = "Invalid";
				}}
				return 1;
			}
		},
		{
			key: [0x02, 0x01],
			fn: function(arg) { 
				var val = decode_field(arg, 1, 7, 0, "unsigned");
				{switch (val){
					case 0:
						decoded_data['output2'] = "Open";
						break;
					case 255:
						decoded_data['output2'] = "Closed";
						break;
					default:
						decoded_data['output2'] = "Invalid";
				}}
				return 1;
			}
		},
		{
			key: [0x03, 0x67],
			fn: function(arg) { 
				decoded_data['temperature'] = (decode_field(arg, 2, 15, 0, "signed") * 0.1).toFixed(1);
				return 2;
			}
		},
		{
			key: [0x04, 0x68],
			fn: function(arg) { 
				decoded_data['relative_humidity'] = (decode_field(arg, 1, 7, 0, "unsigned") * 0.5).toFixed(1);
				return 1;
			}
		},
		{
			key: [0x05, 0x00],
			fn: function(arg) { 
				var val = decode_field(arg, 1, 7, 0, "unsigned");
				{switch (val){
					case 0:
						decoded_data['input_1'] = "False";
						break;
					case 1:
						decoded_data['input_1'] = "True";
						break;
					default:
						decoded_data['input_1'] = "Invalid";
				}}
				return 1;
			}
		},
		{
			key: [0x06, 0x02],
			fn: function(arg) { 
				decoded_data['input_2'] = (decode_field(arg, 2, 15, 0, "unsigned") * 0.000001).toFixed(6);
				return 2;
			}
		},
		{
			key: [0x07, 0x02],
			fn: function(arg) { 
				decoded_data['input_3'] = (decode_field(arg, 2, 15, 0, "unsigned") * 0.001).toFixed(3);
				return 2;
			}
		},
		{
			key: [0x08, 0x04],
			fn: function(arg) { 
				decoded_data['input_1_count'] = decode_field(arg, 2, 15, 0, "unsigned");
				return 2;
			}
		},
		{
			key: [0x09, 0x67],
			fn: function(arg) { 
				decoded_data['mcu_temperature'] = (decode_field(arg, 2, 15, 0, "signed") * 0.1).toFixed(1);
				return 2;
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