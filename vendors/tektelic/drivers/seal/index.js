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

if (input.fPort === 10) {
	decoder = [
		{
			key: [0x00, 0xD3],
			fn: function(arg) { 
				decoded_data['battery_voltage'] = (decode_field(arg, 2, 15, 0, "unsigned") * 0.001).toFixed(3);
				return 2;
			}
		},
		{
			key: [0x01, 0xD3],
			fn: function(arg) { 
				decoded_data['battery_lifetime_pct'] = decode_field(arg, 1, 7, 0, "unsigned");
				return 1;
			}
		},
		{
			key: [0x02, 0xD3],
			fn: function(arg) { 
				decoded_data['battery_lifetime_dys'] = decode_field(arg, 2, 15, 0, "unsigned");
				return 2;
			}
		},
		{
			key: [0x00, 0x85],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('utc')) {
					decoded_data['utc'] = {};
				}
				decoded_data['utc']['year_utc'] = decode_field(arg, 4, 31, 26, "unsigned");
				decoded_data['utc']['month_utc'] = decode_field(arg, 4, 25, 22, "unsigned");
				decoded_data['utc']['day_utc'] = decode_field(arg, 4, 21, 17, "unsigned");
				decoded_data['utc']['hour_utc'] = decode_field(arg, 4, 16, 12, "unsigned");
				decoded_data['utc']['minute_utc'] = decode_field(arg, 4, 11, 6, "unsigned");
				decoded_data['utc']['second_utc'] = decode_field(arg, 4, 5, 0, "unsigned");
				return 4;
			}
		},
		{
			key: [0x00, 0x88],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('coordinates')) {
					decoded_data['coordinates'] = {};
				}
				decoded_data['coordinates']['latitude'] = (decode_field(arg, 8, 63, 40, "signed") * 0.0000107).toFixed(7);
				decoded_data['coordinates']['longitude'] = (decode_field(arg, 8, 39, 16, "signed") * 0.0000215).toFixed(7);
				decoded_data['coordinates']['altitude'] = (decode_field(arg, 8, 15, 0, "unsigned") * 0.145 + -500).toFixed(3);
				return 8;
			}
		},
		{
			key: [0x00, 0x92],
			fn: function(arg) { 
				decoded_data['ground_speed'] = decode_field(arg, 1, 7, 0, "unsigned");
				return 1;
			}
		},
		{
			key: [0x00, 0x95],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('gnss_status')) {
					decoded_data['gnss_status'] = {};
				}
				var val = decode_field(arg, 1, 1, 0, "unsigned");
				{switch (val){
					case 0:
						decoded_data['gnss_status']['gnss_status_dz0'] = "Unknown";
						break;
					case 1:
						decoded_data['gnss_status']['gnss_status_dz0'] = "Inside";
						break;
					case 2:
						decoded_data['gnss_status']['gnss_status_dz0'] = "Outside";
						break;
					default:
						decoded_data['gnss_status']['gnss_status_dz0'] = "Invalid";
				}}
				var val = decode_field(arg, 1, 3, 2, "unsigned");
				{switch (val){
					case 0:
						decoded_data['gnss_status']['gnss_status_dz1'] = "Unknown";
						break;
					case 1:
						decoded_data['gnss_status']['gnss_status_dz1'] = "Inside";
						break;
					case 2:
						decoded_data['gnss_status']['gnss_status_dz1'] = "Outside";
						break;
					default:
						decoded_data['gnss_status']['gnss_status_dz1'] = "Invalid";
				}}
				var val = decode_field(arg, 1, 5, 4, "unsigned");
				{switch (val){
					case 0:
						decoded_data['gnss_status']['gnss_status_dz2'] = "Unknown";
						break;
					case 1:
						decoded_data['gnss_status']['gnss_status_dz2'] = "Inside";
						break;
					case 2:
						decoded_data['gnss_status']['gnss_status_dz2'] = "Outside";
						break;
					default:
						decoded_data['gnss_status']['gnss_status_dz2'] = "Invalid";
				}}
				var val = decode_field(arg, 1, 7, 6, "unsigned");
				{switch (val){
					case 0:
						decoded_data['gnss_status']['gnss_status_dz3'] = "Unknown";
						break;
					case 1:
						decoded_data['gnss_status']['gnss_status_dz3'] = "Inside";
						break;
					case 2:
						decoded_data['gnss_status']['gnss_status_dz3'] = "Outside";
						break;
					default:
						decoded_data['gnss_status']['gnss_status_dz3'] = "Invalid";
				}}
				return 1;
			}
		},
		{
			key: [0x01, 0x95],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('ble_status')) {
					decoded_data['ble_status'] = {};
				}
				var val = decode_field(arg, 1, 1, 0, "unsigned");
				{switch (val){
					case 0:
						decoded_data['ble_status']['ble_status_dz0'] = "Near";
						break;
					case 1:
						decoded_data['ble_status']['ble_status_dz0'] = "Inside";
						break;
					case 2:
						decoded_data['ble_status']['ble_status_dz0'] = "Outside";
						break;
					default:
						decoded_data['ble_status']['ble_status_dz0'] = "Invalid";
				}}
				var val = decode_field(arg, 1, 3, 2, "unsigned");
				{switch (val){
					case 0:
						decoded_data['ble_status']['ble_status_dz1'] = "Near";
						break;
					case 1:
						decoded_data['ble_status']['ble_status_dz1'] = "Inside";
						break;
					case 2:
						decoded_data['ble_status']['ble_status_dz1'] = "Outside";
						break;
					default:
						decoded_data['ble_status']['ble_status_dz1'] = "Invalid";
				}}
				var val = decode_field(arg, 1, 5, 4, "unsigned");
				{switch (val){
					case 0:
						decoded_data['ble_status']['ble_status_dz2'] = "Near";
						break;
					case 1:
						decoded_data['ble_status']['ble_status_dz2'] = "Inside";
						break;
					case 2:
						decoded_data['ble_status']['ble_status_dz2'] = "Outside";
						break;
					default:
						decoded_data['ble_status']['ble_status_dz2'] = "Invalid";
				}}
				var val = decode_field(arg, 1, 7, 6, "unsigned");
				{switch (val){
					case 0:
						decoded_data['ble_status']['ble_status_dz3'] = "Near";
						break;
					case 1:
						decoded_data['ble_status']['ble_status_dz3'] = "Inside";
						break;
					case 2:
						decoded_data['ble_status']['ble_status_dz3'] = "Outside";
						break;
					default:
						decoded_data['ble_status']['ble_status_dz3'] = "Invalid";
				}}
				return 1;
			}
		},
		{
			key: [0x00, 0x73],
			fn: function(arg) { 
				decoded_data['atmospheric_pressure'] = (decode_field(arg, 2, 15, 0, "unsigned") * 0.1).toFixed(1);
				return 2;
			}
		},
		{
			key: [0x00, 0x71],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('acceleration_vector')) {
					decoded_data['acceleration_vector'] = {};
				}
				decoded_data['acceleration_vector']['acceleration_x'] = (decode_field(arg, 6, 47, 32, "signed") * 0.001).toFixed(3);
				decoded_data['acceleration_vector']['acceleration_y'] = (decode_field(arg, 6, 31, 16, "signed") * 0.001).toFixed(3);
				decoded_data['acceleration_vector']['acceleration_z'] = (decode_field(arg, 6, 15, 0, "signed") * 0.001).toFixed(3);
				return 6;
			}
		},
		{
			key: [0x00, 0x67],
			fn: function(arg) { 
				decoded_data['temperature'] = (decode_field(arg, 2, 15, 0, "signed") * 0.1).toFixed(1);
				return 2;
			}
		},
		{
			key: [0x02, 0x95],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('safety_status')) {
					decoded_data['safety_status'] = {};
				}
				var val = decode_field(arg, 1, 0, 0, "unsigned");
				{switch (val){
					case 0:
						decoded_data['safety_status']['safety_status_eb'] = "Inactive";
						break;
					case 1:
						decoded_data['safety_status']['safety_status_eb'] = "Active";
						break;
					default:
						decoded_data['safety_status']['safety_status_eb'] = "Invalid";
				}}
				var val = decode_field(arg, 1, 1, 1, "unsigned");
				{switch (val){
					case 0:
						decoded_data['safety_status']['safety_status_fall'] = "Fall Cleared";
						break;
					case 1:
						decoded_data['safety_status']['safety_status_fall'] = "Active";
						break;
					default:
						decoded_data['safety_status']['safety_status_fall'] = "Invalid";
				}}
				var val = decode_field(arg, 1, 2, 2, "unsigned");
				{switch (val){
					case 0:
						decoded_data['safety_status']['safety_status_sh'] = "Off";
						break;
					case 1:
						decoded_data['safety_status']['safety_status_sh'] = "On";
						break;
					default:
						decoded_data['safety_status']['safety_status_sh'] = "Invalid";
				}}
				return 1;
			}
		},
	];
}
if (input.fPort === 25) {
	decoder = [
		{
			key: [0xFF],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('ble')) {
					decoded_data['ble'] = {};
				}
					var data = [];
					var loop = arg.length / 7;
					for (var i = 0; i < loop; i++) {
						var group = {};
						group['ble_bd_addr'] = decode_field(arg, 7, 55, 8, "hexstring");
						group['ble_rssi'] = decode_field(arg, 7, 7, 0, "signed");
						data.push(group);
						arg = arg.slice(7);
					}
					decoded_data['ble'] = data;
					return loop*7;
			}
		},
	];
}
if (input.fPort === 100) {
	decoder = [
		{
			key: [0x10],
			fn: function(arg) { 
				var val = decode_field(arg, 2, 15, 15, "unsigned");
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
						decoded_data['loramac_opts']['loramac_adr'] = "Disable";
						break;
					case 1:
						decoded_data['loramac_opts']['loramac_adr'] = "Enable";
						break;
					default:
						decoded_data['loramac_opts']['loramac_adr'] = "Invalid";
				}}
				var val = decode_field(arg, 2, 2, 2, "unsigned");
				{switch (val){
					case 0:
						decoded_data['loramac_opts']['loramac_duty_cycle'] = "Disable";
						break;
					case 1:
						decoded_data['loramac_opts']['loramac_duty_cycle'] = "Enable";
						break;
					default:
						decoded_data['loramac_opts']['loramac_duty_cycle'] = "Invalid";
				}}
				var val = decode_field(arg, 2, 1, 1, "unsigned");
				{switch (val){
					case 0:
						decoded_data['loramac_opts']['loramac_ul_type'] = "Private";
						break;
					case 1:
						decoded_data['loramac_opts']['loramac_ul_type'] = "Public";
						break;
					default:
						decoded_data['loramac_opts']['loramac_ul_type'] = "Invalid";
				}}
				var val = decode_field(arg, 2, 0, 0, "unsigned");
				{switch (val){
					case 0:
						decoded_data['loramac_opts']['loramac_confirmed'] = "Unconfirmed";
						break;
					case 1:
						decoded_data['loramac_opts']['loramac_confirmed'] = "Confirmed";
						break;
					default:
						decoded_data['loramac_opts']['loramac_confirmed'] = "Invalid";
				}}
				return 2;
			}
		},
		{
			key: [0x12],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('loramac_dr_tx')) {
					decoded_data['loramac_dr_tx'] = {};
				}
				decoded_data['loramac_dr_tx']['loramac_default_dr'] = decode_field(arg, 2, 11, 8, "unsigned");
				decoded_data['loramac_dr_tx']['loramac_default_tx_pwr'] = decode_field(arg, 2, 3, 0, "unsigned");
				return 2;
			}
		},
		{
			key: [0x13],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('loramac_rx2')) {
					decoded_data['loramac_rx2'] = {};
				}
				decoded_data['loramac_rx2']['loramac_rx2_freq'] = decode_field(arg, 5, 39, 8, "unsigned");
				decoded_data['loramac_rx2']['loramac_rx2_dr'] = decode_field(arg, 5, 7, 0, "unsigned");
				return 5;
			}
		},
		{
			key: [0x20],
			fn: function(arg) { 
				decoded_data['seconds_per_core_tick'] = decode_field(arg, 4, 31, 0, "unsigned");
				return 4;
			}
		},
		{
			key: [0x21],
			fn: function(arg) { 
				decoded_data['ticks_battery'] = decode_field(arg, 2, 15, 0, "unsigned");
				return 2;
			}
		},
		{
			key: [0x22],
			fn: function(arg) { 
				decoded_data['ticks_normal_state'] = decode_field(arg, 2, 15, 0, "unsigned");
				return 2;
			}
		},
		{
			key: [0x23],
			fn: function(arg) { 
				decoded_data['ticks_emergency_state'] = decode_field(arg, 2, 15, 0, "unsigned");
				return 2;
			}
		},
		{
			key: [0x24],
			fn: function(arg) { 
				decoded_data['ticks_accelerometer'] = decode_field(arg, 2, 15, 0, "unsigned");
				return 2;
			}
		},
		{
			key: [0x25],
			fn: function(arg) { 
				decoded_data['ticks_temperature'] = decode_field(arg, 2, 15, 0, "unsigned");
				return 2;
			}
		},
		{
			key: [0x26],
			fn: function(arg) { 
				decoded_data['ticks_safety_status_normal'] = decode_field(arg, 2, 15, 0, "unsigned");
				return 2;
			}
		},
		{
			key: [0x27],
			fn: function(arg) { 
				decoded_data['ticks_safety_status_emergency'] = decode_field(arg, 2, 15, 0, "unsigned");
				return 2;
			}
		},
		{
			key: [0x28],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('eb_active_buzz_config')) {
					decoded_data['eb_active_buzz_config'] = {};
				}
				decoded_data['eb_active_buzz_config']['eb_buzz_active_on_time'] = (decode_field(arg, 3, 23, 16, "unsigned") * 0.1).toFixed(1);
				decoded_data['eb_active_buzz_config']['eb_buzz_active_off_time'] = (decode_field(arg, 3, 15, 8, "unsigned") * 0.1).toFixed(1);
				decoded_data['eb_active_buzz_config']['eb_buzz_active_num_on_offs'] = decode_field(arg, 3, 7, 0, "unsigned");
				return 3;
			}
		},
		{
			key: [0x29],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('eb_inactive_buzz_config')) {
					decoded_data['eb_inactive_buzz_config'] = {};
				}
				decoded_data['eb_inactive_buzz_config']['eb_buzz_inactive_on_time'] = (decode_field(arg, 3, 23, 16, "unsigned") * 0.1).toFixed(1);
				decoded_data['eb_inactive_buzz_config']['eb_buzz_inactive_off_time'] = (decode_field(arg, 3, 15, 8, "unsigned") * 0.1).toFixed(1);
				decoded_data['eb_inactive_buzz_config']['eb_buzz_inactive_num_on_offs'] = decode_field(arg, 3, 7, 0, "unsigned");
				return 3;
			}
		},
		{
			key: [0x2A],
			fn: function(arg) { 
				decoded_data['eb_active_timeout'] = decode_field(arg, 1, 7, 0, "unsigned");
				return 1;
			}
		},
		{
			key: [0x2C],
			fn: function(arg) { 
				decoded_data['sh_debounce_interval'] = decode_field(arg, 1, 7, 0, "unsigned");
				return 1;
			}
		},
		{
			key: [0x2D],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('sh_buzz_config')) {
					decoded_data['sh_buzz_config'] = {};
				}
				decoded_data['sh_buzz_config']['sh_buzz_when_to'] = decode_field(arg, 5, 33, 32, "unsigned");
				decoded_data['sh_buzz_config']['sh_buzz_on_time'] = (decode_field(arg, 5, 31, 24, "unsigned") * 0.1).toFixed(1);
				decoded_data['sh_buzz_config']['sh_buzz_off_time'] = (decode_field(arg, 5, 23, 16, "unsigned") * 0.1).toFixed(1);
				decoded_data['sh_buzz_config']['sh_buzz_num_on_offs'] = decode_field(arg, 5, 15, 8, "unsigned");
				decoded_data['sh_buzz_config']['sh_buzz_period'] = decode_field(arg, 5, 7, 0, "unsigned");
				return 5;
			}
		},
		{
			key: [0x30],
			fn: function(arg) { 
				var val = decode_field(arg, 1, 7, 7, "unsigned");
				{switch (val){
					case 0:
						decoded_data['gnss_receiver'] = "Disabled";
						break;
					case 1:
						decoded_data['gnss_receiver'] = "Enabled";
						break;
					default:
						decoded_data['gnss_receiver'] = "Invalid";
				}}
				return 1;
			}
		},
		{
			key: [0x31],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('gnss_report_options')) {
					decoded_data['gnss_report_options'] = {};
				}
				var val = decode_field(arg, 1, 2, 2, "unsigned");
				{switch (val){
					case 0:
						decoded_data['gnss_report_options']['gnss_dz_status_report'] = "Disabled";
						break;
					case 1:
						decoded_data['gnss_report_options']['gnss_dz_status_report'] = "Enabled";
						break;
					default:
						decoded_data['gnss_report_options']['gnss_dz_status_report'] = "Invalid";
				}}
				var val = decode_field(arg, 1, 1, 1, "unsigned");
				{switch (val){
					case 0:
						decoded_data['gnss_report_options']['gnss_ground_speed_report'] = "Disabled";
						break;
					case 1:
						decoded_data['gnss_report_options']['gnss_ground_speed_report'] = "Enabled";
						break;
					default:
						decoded_data['gnss_report_options']['gnss_ground_speed_report'] = "Invalid";
				}}
				var val = decode_field(arg, 1, 0, 0, "unsigned");
				{switch (val){
					case 0:
						decoded_data['gnss_report_options']['gnss_utc_coordinates_report'] = "Disabled";
						break;
					case 1:
						decoded_data['gnss_report_options']['gnss_utc_coordinates_report'] = "Enabled";
						break;
					default:
						decoded_data['gnss_report_options']['gnss_utc_coordinates_report'] = "Invalid";
				}}
				return 1;
			}
		},
		{
			key: [0x32],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('gnss_dz0')) {
					decoded_data['gnss_dz0'] = {};
				}
				decoded_data['gnss_dz0']['gnss_dz0_latitude'] = (decode_field(arg, 8, 63, 40, "signed") * 0.00001073).toFixed(8);
				decoded_data['gnss_dz0']['gnss_dz0_longitude'] = (decode_field(arg, 8, 39, 16, "signed") * 0.00002146).toFixed(8);
				decoded_data['gnss_dz0']['gnss_dz0_radius'] = (decode_field(arg, 8, 15, 0, "signed") * 10).toFixed(1);
				return 8;
			}
		},
		{
			key: [0x33],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('gnss_dz1')) {
					decoded_data['gnss_dz1'] = {};
				}
				decoded_data['gnss_dz1']['gnss_dz1_latitude'] = (decode_field(arg, 8, 63, 40, "signed") * 0.00001073).toFixed(8);
				decoded_data['gnss_dz1']['gnss_dz1_longitude'] = (decode_field(arg, 8, 39, 16, "signed") * 0.00002146).toFixed(8);
				decoded_data['gnss_dz1']['gnss_dz1_radius'] = (decode_field(arg, 8, 15, 0, "signed") * 10).toFixed(1);
				return 8;
			}
		},
		{
			key: [0x34],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('gnss_dz2')) {
					decoded_data['gnss_dz2'] = {};
				}
				decoded_data['gnss_dz2']['gnss_dz2_latitude'] = (decode_field(arg, 8, 63, 40, "signed") * 0.00001073).toFixed(8);
				decoded_data['gnss_dz2']['gnss_dz2_longitude'] = (decode_field(arg, 8, 39, 16, "signed") * 0.00002146).toFixed(8);
				decoded_data['gnss_dz2']['gnss_dz2_radius'] = (decode_field(arg, 8, 15, 0, "signed") * 10).toFixed(1);
				return 8;
			}
		},
		{
			key: [0x35],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('gnss_dz3')) {
					decoded_data['gnss_dz3'] = {};
				}
				decoded_data['gnss_dz3']['gnss_dz3_latitude'] = (decode_field(arg, 8, 63, 40, "signed") * 0.00001073).toFixed(8);
				decoded_data['gnss_dz3']['gnss_dz3_longitude'] = (decode_field(arg, 8, 39, 16, "signed") * 0.00002146).toFixed(8);
				decoded_data['gnss_dz3']['gnss_dz3_radius'] = (decode_field(arg, 8, 15, 0, "signed") * 10).toFixed(1);
				return 8;
			}
		},
		{
			key: [0x38],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('emergency_state_trigger')) {
					decoded_data['emergency_state_trigger'] = {};
				}
				var val = decode_field(arg, 1, 1, 1, "unsigned");
				{switch (val){
					case 0:
						decoded_data['emergency_state_trigger']['emergency_trigger_by_ble_dz'] = "Disabled";
						break;
					case 1:
						decoded_data['emergency_state_trigger']['emergency_trigger_by_ble_dz'] = "Enabled";
						break;
					default:
						decoded_data['emergency_state_trigger']['emergency_trigger_by_ble_dz'] = "Invalid";
				}}
				var val = decode_field(arg, 1, 0, 0, "unsigned");
				{switch (val){
					case 0:
						decoded_data['emergency_state_trigger']['emergency_trigger_by_gnss_dz'] = "Disabled";
						break;
					case 1:
						decoded_data['emergency_state_trigger']['emergency_trigger_by_gnss_dz'] = "Enabled";
						break;
					default:
						decoded_data['emergency_state_trigger']['emergency_trigger_by_gnss_dz'] = "Invalid";
				}}
				return 1;
			}
		},
		{
			key: [0x39],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('emergency_state_led_config')) {
					decoded_data['emergency_state_led_config'] = {};
				}
				decoded_data['emergency_state_led_config']['emergency_led_on_time'] = (decode_field(arg, 4, 31, 24, "unsigned") * 0.1).toFixed(1);
				decoded_data['emergency_state_led_config']['emergency_led_off_time'] = (decode_field(arg, 4, 23, 16, "unsigned") * 0.1).toFixed(1);
				decoded_data['emergency_state_led_config']['emergency_led_num_on_offs'] = decode_field(arg, 4, 15, 8, "unsigned");
				decoded_data['emergency_state_led_config']['emergency_led_period'] = (decode_field(arg, 4, 7, 0, "unsigned") * 0.1).toFixed(1);
				return 4;
			}
		},
		{
			key: [0x3A],
			fn: function(arg) { 
				decoded_data['ear_active_timeout'] = decode_field(arg, 1, 7, 0, "unsigned");
				return 1;
			}
		},
		{
			key: [0x3C],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('barometer_mode')) {
					decoded_data['barometer_mode'] = {};
				}
				var val = decode_field(arg, 1, 7, 7, "unsigned");
				{switch (val){
					case 0:
						decoded_data['barometer_mode']['barometer_report_enabled'] = "Disabled";
						break;
					case 1:
						decoded_data['barometer_mode']['barometer_report_enabled'] = "Enabled";
						break;
					default:
						decoded_data['barometer_mode']['barometer_report_enabled'] = "Invalid";
				}}
				decoded_data['barometer_mode']['barometer_iir_recall_factor'] = decode_field(arg, 1, 3, 0, "unsigned");
				return 1;
			}
		},
		{
			key: [0x41],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('accelerometer_sensitivity')) {
					decoded_data['accelerometer_sensitivity'] = {};
				}
				var val = decode_field(arg, 1, 5, 4, "unsigned");
				{switch (val){
					case 0:
						decoded_data['accelerometer_sensitivity']['accelerometer_measurement_range'] = "ï¿½2 g";
						break;
					case 1:
						decoded_data['accelerometer_sensitivity']['accelerometer_measurement_range'] = "ï¿½4 g";
						break;
					case 2:
						decoded_data['accelerometer_sensitivity']['accelerometer_measurement_range'] = "ï¿½8 g";
						break;
					case 3:
						decoded_data['accelerometer_sensitivity']['accelerometer_measurement_range'] = "ï¿½16 g";
						break;
					default:
						decoded_data['accelerometer_sensitivity']['accelerometer_measurement_range'] = "Invalid";
				}}
				var val = decode_field(arg, 1, 2, 0, "unsigned");
				{switch (val){
					case 1:
						decoded_data['accelerometer_sensitivity']['accelerometer_sample_rate'] = "1 Hz";
						break;
					case 2:
						decoded_data['accelerometer_sensitivity']['accelerometer_sample_rate'] = "10 Hz";
						break;
					case 3:
						decoded_data['accelerometer_sensitivity']['accelerometer_sample_rate'] = "25 Hz";
						break;
					case 4:
						decoded_data['accelerometer_sensitivity']['accelerometer_sample_rate'] = "50 Hz";
						break;
					case 5:
						decoded_data['accelerometer_sensitivity']['accelerometer_sample_rate'] = "100 Hz";
						break;
					case 6:
						decoded_data['accelerometer_sensitivity']['accelerometer_sample_rate'] = "200 Hz";
						break;
					case 7:
						decoded_data['accelerometer_sensitivity']['accelerometer_sample_rate'] = "400 Hz";
						break;
					default:
						decoded_data['accelerometer_sensitivity']['accelerometer_sample_rate'] = "Invalid";
				}}
				return 1;
			}
		},
		{
			key: [0x42],
			fn: function(arg) { 
				decoded_data['sleep_acceleration_threshold'] = (decode_field(arg, 2, 15, 0, "unsigned") * 0.001).toFixed(3);
				return 2;
			}
		},
		{
			key: [0x43],
			fn: function(arg) { 
				decoded_data['timeout_to_sleep'] = decode_field(arg, 1, 7, 0, "unsigned");
				return 1;
			}
		},
		{
			key: [0x48],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('free_fall')) {
					decoded_data['free_fall'] = {};
				}
				decoded_data['free_fall']['free_fall_acceleration_threshold'] = (decode_field(arg, 4, 31, 16, "unsigned") * 0.001).toFixed(3);
				decoded_data['free_fall']['free_fall_acceleration_interval'] = (decode_field(arg, 4, 15, 0, "unsigned") * 0.001).toFixed(3);
				return 4;
			}
		},
		{
			key: [0x49],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('impact')) {
					decoded_data['impact'] = {};
				}
				decoded_data['impact']['impact_threshold'] = (decode_field(arg, 4, 31, 16, "unsigned") * 0.001).toFixed(3);
				decoded_data['impact']['impact_blackout_duration'] = (decode_field(arg, 4, 15, 0, "unsigned") * 0.001).toFixed(3);
				return 4;
			}
		},
		{
			key: [0x4A],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('torpidity')) {
					decoded_data['torpidity'] = {};
				}
				decoded_data['torpidity']['torpidity_threshold'] = (decode_field(arg, 3, 23, 8, "unsigned") * 0.001).toFixed(3);
				decoded_data['torpidity']['torpidity_interval'] = (decode_field(arg, 3, 7, 0, "unsigned") * 0.001).toFixed(3);
				return 3;
			}
		},
		{
			key: [0x4D],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('fall_clearance')) {
					decoded_data['fall_clearance'] = {};
				}
				decoded_data['fall_clearance']['fall_clearance_upright_angle_threshold'] = decode_field(arg, 2, 15, 8, "unsigned");
				decoded_data['fall_clearance']['fall_clearance_upright_time_threshold'] = decode_field(arg, 2, 7, 0, "unsigned");
				return 2;
			}
		},
		{
			key: [0x50],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('ble_mode')) {
					decoded_data['ble_mode'] = {};
				}
				var val = decode_field(arg, 1, 7, 7, "unsigned");
				{switch (val){
					case 0:
						decoded_data['ble_mode']['ble_avg_mode'] = "Disabled";
						break;
					case 1:
						decoded_data['ble_mode']['ble_avg_mode'] = "Enabled";
						break;
					default:
						decoded_data['ble_mode']['ble_avg_mode'] = "Invalid";
				}}
				var val = decode_field(arg, 1, 6, 6, "unsigned");
				{switch (val){
					case 0:
						decoded_data['ble_mode']['ble_dz_status_report'] = "Disabled";
						break;
					case 1:
						decoded_data['ble_mode']['ble_dz_status_report'] = "Enabled";
						break;
					default:
						decoded_data['ble_mode']['ble_dz_status_report'] = "Invalid";
				}}
				decoded_data['ble_mode']['ble_num_reported_devices'] = decode_field(arg, 1, 5, 0, "unsigned");
				return 1;
			}
		},
		{
			key: [0x51],
			fn: function(arg) { 
				decoded_data['ble_scan_duration_periodic'] = decode_field(arg, 1, 7, 0, "unsigned");
				return 1;
			}
		},
		{
			key: [0x52],
			fn: function(arg) { 
				decoded_data['ble_scan_interval'] = decode_field(arg, 2, 15, 0, "unsigned");
				return 2;
			}
		},
		{
			key: [0x53],
			fn: function(arg) { 
				decoded_data['ble_scan_window'] = decode_field(arg, 2, 15, 0, "unsigned");
				return 2;
			}
		},
		{
			key: [0x54],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('ble_range0')) {
					decoded_data['ble_range0'] = {};
				}
				decoded_data['ble_range0']['ble_range0_bd_addr_oui'] = decode_field(arg, 9, 71, 48, "unsigned");
				decoded_data['ble_range0']['ble_range0_bd_addr_start'] = decode_field(arg, 9, 47, 24, "unsigned");
				decoded_data['ble_range0']['ble_range0_bd_addr_end'] = decode_field(arg, 9, 23, 0, "unsigned");
				return 9;
			}
		},
		{
			key: [0x55],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('ble_range1')) {
					decoded_data['ble_range1'] = {};
				}
				decoded_data['ble_range1']['ble_range1_bd_addr_oui'] = decode_field(arg, 9, 71, 48, "unsigned");
				decoded_data['ble_range1']['ble_range1_bd_addr_start'] = decode_field(arg, 9, 47, 24, "unsigned");
				decoded_data['ble_range1']['ble_range1_bd_addr_end'] = decode_field(arg, 9, 23, 0, "unsigned");
				return 9;
			}
		},
		{
			key: [0x56],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('ble_range2')) {
					decoded_data['ble_range2'] = {};
				}
				decoded_data['ble_range2']['ble_range2_bd_addr_oui'] = decode_field(arg, 9, 71, 48, "unsigned");
				decoded_data['ble_range2']['ble_range2_bd_addr_start'] = decode_field(arg, 9, 47, 24, "unsigned");
				decoded_data['ble_range2']['ble_range2_bd_addr_end'] = decode_field(arg, 9, 23, 0, "unsigned");
				return 9;
			}
		},
		{
			key: [0x57],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('ble_range3')) {
					decoded_data['ble_range3'] = {};
				}
				decoded_data['ble_range3']['ble_range3_bd_addr_oui'] = decode_field(arg, 9, 71, 48, "unsigned");
				decoded_data['ble_range3']['ble_range3_bd_addr_start'] = decode_field(arg, 9, 47, 24, "unsigned");
				decoded_data['ble_range3']['ble_range3_bd_addr_end'] = decode_field(arg, 9, 23, 0, "unsigned");
				return 9;
			}
		},
		{
			key: [0x58],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('ble_dz0')) {
					decoded_data['ble_dz0'] = {};
				}
				decoded_data['ble_dz0']['ble_dz0_bd_addr'] = decode_field(arg, 7, 55, 8, "unsigned");
				decoded_data['ble_dz0']['ble_dz0_rssi'] = decode_field(arg, 7, 7, 0, "unsigned");
				return 7;
			}
		},
		{
			key: [0x59],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('ble_dz1')) {
					decoded_data['ble_dz1'] = {};
				}
				decoded_data['ble_dz1']['ble_dz1_bd_addr'] = decode_field(arg, 7, 55, 8, "unsigned");
				decoded_data['ble_dz1']['ble_dz1_rssi'] = decode_field(arg, 7, 7, 0, "unsigned");
				return 7;
			}
		},
		{
			key: [0x5A],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('ble_dz2')) {
					decoded_data['ble_dz2'] = {};
				}
				decoded_data['ble_dz2']['ble_dz2_bd_addr'] = decode_field(arg, 7, 55, 8, "unsigned");
				decoded_data['ble_dz2']['ble_dz2_rssi'] = decode_field(arg, 7, 7, 0, "unsigned");
				return 7;
			}
		},
		{
			key: [0x5B],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('ble_dz3')) {
					decoded_data['ble_dz3'] = {};
				}
				decoded_data['ble_dz3']['ble_dz3_bd_addr'] = decode_field(arg, 7, 55, 8, "unsigned");
				decoded_data['ble_dz3']['ble_dz3_rssi'] = decode_field(arg, 7, 7, 0, "unsigned");
				return 7;
			}
		},
		{
			key: [0x60],
			fn: function(arg) { 
				decoded_data['temperature_sample_period_idle'] = decode_field(arg, 4, 31, 0, "unsigned");
				return 4;
			}
		},
		{
			key: [0x61],
			fn: function(arg) { 
				decoded_data['temperature_sample_period_active'] = decode_field(arg, 4, 31, 0, "unsigned");
				return 4;
			}
		},
		{
			key: [0x62],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('temperature_thresholds')) {
					decoded_data['temperature_thresholds'] = {};
				}
				decoded_data['temperature_thresholds']['temperature_threshold_high'] = decode_field(arg, 2, 15, 8, "signed");
				decoded_data['temperature_thresholds']['temperature_threshold_low'] = decode_field(arg, 2, 7, 0, "signed");
				return 2;
			}
		},
		{
			key: [0x63],
			fn: function(arg) { 
				decoded_data['temperature_thresholds_status'] = decode_field(arg, 1, 0, 0, "unsigned");
				return 1;
			}
		},
		{
			key: [0x68],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('battery_report_options')) {
					decoded_data['battery_report_options'] = {};
				}
				var val = decode_field(arg, 1, 2, 2, "unsigned");
				{switch (val){
					case 0:
						decoded_data['battery_report_options']['battery_lifetime_dys_report'] = "Disabled";
						break;
					case 1:
						decoded_data['battery_report_options']['battery_lifetime_dys_report'] = "Enabled";
						break;
					default:
						decoded_data['battery_report_options']['battery_lifetime_dys_report'] = "Invalid";
				}}
				var val = decode_field(arg, 1, 1, 1, "unsigned");
				{switch (val){
					case 0:
						decoded_data['battery_report_options']['battery_lifetime_pct_report'] = "Disabled";
						break;
					case 1:
						decoded_data['battery_report_options']['battery_lifetime_pct_report'] = "Enabled";
						break;
					default:
						decoded_data['battery_report_options']['battery_lifetime_pct_report'] = "Invalid";
				}}
				var val = decode_field(arg, 1, 0, 0, "unsigned");
				{switch (val){
					case 0:
						decoded_data['battery_report_options']['battery_voltage_report'] = "Disabled";
						break;
					case 1:
						decoded_data['battery_report_options']['battery_voltage_report'] = "Enabled";
						break;
					default:
						decoded_data['battery_report_options']['battery_voltage_report'] = "Invalid";
				}}
				return 1;
			}
		},
		{
			key: [0x69],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('low_battery_threshold')) {
					decoded_data['low_battery_threshold'] = {};
				}
				var val = decode_field(arg, 2, 15, 14, "unsigned");
				{switch (val){
					case 0:
						decoded_data['low_battery_threshold']['low_battery_threshold_type'] = "Voltage (mV)";
						break;
					case 1:
						decoded_data['low_battery_threshold']['low_battery_threshold_type'] = "Percentage";
						break;
					case 2:
						decoded_data['low_battery_threshold']['low_battery_threshold_type'] = "Days";
						break;
					default:
						decoded_data['low_battery_threshold']['low_battery_threshold_type'] = "Invalid";
				}}
				decoded_data['low_battery_threshold']['low_battery_threshold_value'] = decode_field(arg, 2, 13, 0, "unsigned");
				return 2;
			}
		},
		{
			key: [0x6A],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('low_battery_led_config')) {
					decoded_data['low_battery_led_config'] = {};
				}
				decoded_data['low_battery_led_config']['low_battery_led_on_time'] = decode_field(arg, 4, 31, 24, "unsigned");
				decoded_data['low_battery_led_config']['low_battery_led_off_time'] = decode_field(arg, 4, 23, 16, "unsigned");
				decoded_data['low_battery_led_config']['low_battery_led_num_on_offs'] = decode_field(arg, 4, 15, 8, "unsigned");
				decoded_data['low_battery_led_config']['low_battery_led_period'] = decode_field(arg, 4, 7, 0, "unsigned");
				return 4;
			}
		},
		{
			key: [0x6C],
			fn: function(arg) { 
				decoded_data['buzzer_disable_timeout'] = decode_field(arg, 1, 7, 0, "unsigned");
				return 1;
			}
		},
		{
			key: [0x6F],
			fn: function(arg) { 
				var val = decode_field(arg, 1, 7, 0, "unsigned");
				{switch (val){
					case 1:
						decoded_data['resp_format'] = "Legacy (4-byte CRC)";
						break;
					case 2:
						decoded_data['resp_format'] = "Read All";
						break;
					default:
						decoded_data['resp_format'] = "Invalid";
				}}
				return 1;
			}
		},
		{
			key: [0x71],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('metadata')) {
					decoded_data['metadata'] = {};
				}
				decoded_data['metadata']['app_ver_major'] = decode_field(arg, 7, 55, 48, "unsigned");
				decoded_data['metadata']['app_ver_minor'] = decode_field(arg, 7, 47, 40, "unsigned");
				decoded_data['metadata']['app_ver_revision'] = decode_field(arg, 7, 39, 32, "unsigned");
				decoded_data['metadata']['loramac_ver_major'] = decode_field(arg, 7, 31, 24, "unsigned");
				decoded_data['metadata']['loramac_ver_minor'] = decode_field(arg, 7, 23, 16, "unsigned");
				decoded_data['metadata']['loramac_ver_revision'] = decode_field(arg, 7, 15, 8, "unsigned");
				var val = decode_field(arg, 7, 7, 0, "unsigned");
				{switch (val){
					case 0:
						decoded_data['metadata']['lorawan_region_id'] = "EU868";
						break;
					case 1:
						decoded_data['metadata']['lorawan_region_id'] = "US915";
						break;
					case 2:
						decoded_data['metadata']['lorawan_region_id'] = "AS923";
						break;
					case 3:
						decoded_data['metadata']['lorawan_region_id'] = "AU915";
						break;
					case 4:
						decoded_data['metadata']['lorawan_region_id'] = "IN865";
						break;
					case 5:
						decoded_data['metadata']['lorawan_region_id'] = "CN470";
						break;
					case 6:
						decoded_data['metadata']['lorawan_region_id'] = "KR920";
						break;
					case 7:
						decoded_data['metadata']['lorawan_region_id'] = "RU864";
						break;
					default:
						decoded_data['metadata']['lorawan_region_id'] = "Invalid";
				}}
				return 7;
			}
		},
	];
}
if (input.fPort === 15) {
	decoder = [
		{
			key: [0x01],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('log_utc')) {
					decoded_data['log_utc'] = {};
				}
				decoded_data['log_utc']['fragment_number_1'] = decode_field(arg, 5, 39, 32, "unsigned");
				decoded_data['log_utc']['year_1'] = decode_field(arg, 5, 31, 26, "unsigned");
				decoded_data['log_utc']['month_1'] = decode_field(arg, 5, 25, 22, "unsigned");
				decoded_data['log_utc']['day_1'] = decode_field(arg, 5, 21, 17, "unsigned");
				decoded_data['log_utc']['hour_1'] = decode_field(arg, 5, 16, 12, "unsigned");
				decoded_data['log_utc']['minute_1'] = decode_field(arg, 5, 15, 6, "unsigned");
				decoded_data['log_utc']['second_1'] = decode_field(arg, 5, 5, 0, "unsigned");
				return 5;
			}
		},
		{
			key: [0x02],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('log_coordinates')) {
					decoded_data['log_coordinates'] = {};
				}
				decoded_data['log_coordinates']['fragment_number_2'] = decode_field(arg, 9, 71, 64, "unsigned");
				decoded_data['log_coordinates']['lattitude_2'] = (decode_field(arg, 9, 63, 40, "signed") * 0.0000125).toFixed(6);
				decoded_data['log_coordinates']['longitude_2'] = (decode_field(arg, 9, 39, 16, "signed") * 0.0000001).toFixed(7);
				decoded_data['log_coordinates']['altitude_2'] = (decode_field(arg, 9, 15, 0, "signed") * 0.5).toFixed(1);
				return 9;
			}
		},
		{
			key: [0x03],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('log_all')) {
					decoded_data['log_all'] = {};
				}
				decoded_data['log_all']['fragment_number_3'] = decode_field(arg, 13, 103, 96, "unsigned");
					var data = [];
					arg = arg.slice(1);
					var loop = arg.length / 12;
					for (var i = 0; i < loop; i++) {
						var group = {};
						group['year_3'] = decode_field(arg, 12, 95, 90, "unsigned");
						group['month_3'] = decode_field(arg, 12, 89, 86, "unsigned");
						group['day_3'] = decode_field(arg, 12, 85, 81, "unsigned");
						group['hour_3'] = decode_field(arg, 12, 80, 76, "unsigned");
						group['minute_3'] = decode_field(arg, 12, 75, 70, "unsigned");
						group['second_3'] = decode_field(arg, 12, 69, 64, "unsigned");
						group['lattitude_3'] = (decode_field(arg, 12, 63, 40, "signed") * 0.0000125).toFixed(6);
						group['longitude_3'] = (decode_field(arg, 12, 39, 16, "signed") * 0.0000001).toFixed(7);
						group['altitude_3'] = (decode_field(arg, 12, 15, 0, "signed") * 0.5).toFixed(1);
						data.push(group);
						arg = arg.slice(12);
					}
					decoded_data['log_all'] = data;
					return loop*12 + 1;
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