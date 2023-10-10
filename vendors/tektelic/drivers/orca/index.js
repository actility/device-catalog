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
				decoded_data['device_eui'] = (decode_field(arg, 8, 63, 0, "hexstring")).toFixed(1);
				return 8;
			}
		},
		{
			key: [0x01],
			fn: function(arg) { 
				decoded_data['app_eui'] = (decode_field(arg, 8, 63, 0, "hexstring")).toFixed(1);
				return 8;
			}
		},
		{
			key: [0x02],
			fn: function(arg) { 
				decoded_data['app_key'] = (decode_field(arg, 16, 127, 0, "hexstring")).toFixed(1);
				return 16;
			}
		},
		{
			key: [0x03],
			fn: function(arg) { 
				decoded_data['device_address'] = (decode_field(arg, 4, 31, 0, "hexstring")).toFixed(1);
				return 4;
			}
		},
		{
			key: [0x04],
			fn: function(arg) { 
				decoded_data['network_session_key'] = (decode_field(arg, 16, 127, 0, "hexstring")).toFixed(1);
				return 16;
			}
		},
		{
			key: [0x05],
			fn: function(arg) { 
				decoded_data['app_session_key'] = (decode_field(arg, 16, 127, 0, "hexstring")).toFixed(1);
				return 16;
			}
		},
		{
			key: [0x10],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('loramac_join_mode')) {
					decoded_data['loramac_join_mode'] = {};
				}
				var val = decode_field(arg, 2, 15, 15, "unsigned");
				{switch (val){
					case 0:
						decoded_data['loramac_join_mode']['loramac_join_mode'] = "ABP";
						break;
					case 1:
						decoded_data['loramac_join_mode']['loramac_join_mode'] = "OTAA";
						break;
					default:
						decoded_data['loramac_join_mode']['loramac_join_mode'] = "Invalid";
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
				return 2;
			}
		},
		{
			key: [0x12],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('loramac_dr_tx')) {
					decoded_data['loramac_dr_tx'] = {};
				}
				decoded_data['loramac_dr_tx']['tx_power_number'] = decode_field(arg, 2, 3, 0, "unsigned");
				decoded_data['loramac_dr_tx']['dr_number'] = decode_field(arg, 2, 11, 8, "unsigned");
				return 2;
			}
		},
		{
			key: [0x13],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('loramac_rx2')) {
					decoded_data['loramac_rx2'] = {};
				}
				decoded_data['loramac_rx2']['rx2_dr_number'] = decode_field(arg, 5, 7, 0, "unsigned");
				decoded_data['loramac_rx2']['frequency'] = decode_field(arg, 5, 39, 8, "unsigned");
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
				decoded_data['ticks_per_battery'] = decode_field(arg, 2, 15, 0, "unsigned");
				return 2;
			}
		},
		{
			key: [0x22],
			fn: function(arg) { 
				decoded_data['ticks_per_gnss_stillness'] = decode_field(arg, 2, 15, 0, "unsigned");
				return 2;
			}
		},
		{
			key: [0x23],
			fn: function(arg) { 
				decoded_data['ticks_per_gnss_mobility'] = decode_field(arg, 2, 15, 0, "unsigned");
				return 2;
			}
		},
		{
			key: [0x24],
			fn: function(arg) { 
				decoded_data['ticks_per_accelerometer'] = decode_field(arg, 2, 15, 0, "unsigned");
				return 2;
			}
		},
		{
			key: [0x25],
			fn: function(arg) { 
				decoded_data['ticks_per_ble_default'] = decode_field(arg, 2, 15, 0, "unsigned");
				return 2;
			}
		},
		{
			key: [0x26],
			fn: function(arg) { 
				decoded_data['ticks_per_ble_stillness'] = decode_field(arg, 2, 15, 0, "unsigned");
				return 2;
			}
		},
		{
			key: [0x27],
			fn: function(arg) { 
				decoded_data['ticks_per_ble_mobility'] = decode_field(arg, 2, 15, 0, "unsigned");
				return 2;
			}
		},
		{
			key: [0x28],
			fn: function(arg) { 
				decoded_data['ticks_per_temperature'] = decode_field(arg, 2, 15, 0, "unsigned");
				return 2;
			}
		},
		{
			key: [0x29],
			fn: function(arg) { 
				decoded_data['ticks_per_fsm_state'] = decode_field(arg, 2, 15, 0, "unsigned");
				return 2;
			}
		},
		{
			key: [0x2A],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('reed_switch_tx')) {
					decoded_data['reed_switch_tx'] = {};
				}
				var val = decode_field(arg, 2, 0, 0, "unsigned");
				{switch (val){
					case 0:
						decoded_data['reed_switch_tx']['battery'] = "Disable";
						break;
					case 1:
						decoded_data['reed_switch_tx']['battery'] = "Enable";
						break;
					default:
						decoded_data['reed_switch_tx']['battery'] = "Invalid";
				}}
				var val = decode_field(arg, 2, 1, 1, "unsigned");
				{switch (val){
					case 0:
						decoded_data['reed_switch_tx']['acceleration_vector'] = "Disable";
						break;
					case 1:
						decoded_data['reed_switch_tx']['acceleration_vector'] = "Enable";
						break;
					default:
						decoded_data['reed_switch_tx']['acceleration_vector'] = "Invalid";
				}}
				var val = decode_field(arg, 2, 2, 2, "unsigned");
				{switch (val){
					case 0:
						decoded_data['reed_switch_tx']['temperature_tx'] = "Disable";
						break;
					case 1:
						decoded_data['reed_switch_tx']['temperature_tx'] = "Enable";
						break;
					default:
						decoded_data['reed_switch_tx']['temperature_tx'] = "Invalid";
				}}
				var val = decode_field(arg, 2, 3, 3, "unsigned");
				{switch (val){
					case 0:
						decoded_data['reed_switch_tx']['ble'] = "Disable";
						break;
					case 1:
						decoded_data['reed_switch_tx']['ble'] = "Enable";
						break;
					default:
						decoded_data['reed_switch_tx']['ble'] = "Invalid";
				}}
				var val = decode_field(arg, 2, 4, 4, "unsigned");
				{switch (val){
					case 0:
						decoded_data['reed_switch_tx']['gnss_log'] = "Disable";
						break;
					case 1:
						decoded_data['reed_switch_tx']['gnss_log'] = "Enable";
						break;
					default:
						decoded_data['reed_switch_tx']['gnss_log'] = "Invalid";
				}}
				var val = decode_field(arg, 2, 5, 5, "unsigned");
				{switch (val){
					case 0:
						decoded_data['reed_switch_tx']['fsm_state_tx'] = "Disable";
						break;
					case 1:
						decoded_data['reed_switch_tx']['fsm_state_tx'] = "Enable";
						break;
					default:
						decoded_data['reed_switch_tx']['fsm_state_tx'] = "Invalid";
				}}
				return 2;
			}
		},
		{
			key: [0x30],
			fn: function(arg) { 
				var val = decode_field(arg, 1, 7, 7, "unsigned");
				{switch (val){
					case 0:
						decoded_data['gnss_enabled'] = "Disable";
						break;
					case 1:
						decoded_data['gnss_enabled'] = "Enable";
						break;
					default:
						decoded_data['gnss_enabled'] = "Invalid";
				}}
				return 1;
			}
		},
		{
			key: [0x31],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('speed_threshold')) {
					decoded_data['speed_threshold'] = {};
				}
				decoded_data['speed_threshold']['stillness'] = (decode_field(arg, 2, 7, 0, "unsigned") * 0.1).toFixed(1);
				decoded_data['speed_threshold']['mobility'] = (decode_field(arg, 2, 15, 8, "unsigned") * 0.1).toFixed(1);
				return 2;
			}
		},
		{
			key: [0x33],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('gnss_tx')) {
					decoded_data['gnss_tx'] = {};
				}
				var val = decode_field(arg, 1, 0, 0, "unsigned");
				{switch (val){
					case 0:
						decoded_data['gnss_tx']['utc_tx'] = "Disable";
						break;
					case 1:
						decoded_data['gnss_tx']['utc_tx'] = "Enable";
						break;
					default:
						decoded_data['gnss_tx']['utc_tx'] = "Invalid";
				}}
				var val = decode_field(arg, 1, 1, 1, "unsigned");
				{switch (val){
					case 0:
						decoded_data['gnss_tx']['coordinates'] = "Disable";
						break;
					case 1:
						decoded_data['gnss_tx']['coordinates'] = "Enable";
						break;
					default:
						decoded_data['gnss_tx']['coordinates'] = "Invalid";
				}}
				var val = decode_field(arg, 1, 2, 2, "unsigned");
				{switch (val){
					case 0:
						decoded_data['gnss_tx']['ground_speed_tx'] = "Disable";
						break;
					case 1:
						decoded_data['gnss_tx']['ground_speed_tx'] = "Enable";
						break;
					default:
						decoded_data['gnss_tx']['ground_speed_tx'] = "Invalid";
				}}
				var val = decode_field(arg, 1, 3, 3, "unsigned");
				{switch (val){
					case 0:
						decoded_data['gnss_tx']['geofence'] = "DIsable";
						break;
					case 1:
						decoded_data['gnss_tx']['geofence'] = "Enable";
						break;
					default:
						decoded_data['gnss_tx']['geofence'] = "Invalid";
				}}
				var val = decode_field(arg, 1, 4, 4, "unsigned");
				{switch (val){
					case 0:
						decoded_data['gnss_tx']['num_satellites_tx'] = "DIsable";
						break;
					case 1:
						decoded_data['gnss_tx']['num_satellites_tx'] = "Enable";
						break;
					default:
						decoded_data['gnss_tx']['num_satellites_tx'] = "Invalid";
				}}
				var val = decode_field(arg, 1, 5, 5, "unsigned");
				{switch (val){
					case 0:
						decoded_data['gnss_tx']['avg_satellite_snr_tx'] = "DIsable";
						break;
					case 1:
						decoded_data['gnss_tx']['avg_satellite_snr_tx'] = "Enable";
						break;
					default:
						decoded_data['gnss_tx']['avg_satellite_snr_tx'] = "Invalid";
				}}
				var val = decode_field(arg, 1, 6, 6, "unsigned");
				{switch (val){
					case 0:
						decoded_data['gnss_tx']['fix_type_tx'] = "DIsable";
						break;
					case 1:
						decoded_data['gnss_tx']['fix_type_tx'] = "Enable";
						break;
					default:
						decoded_data['gnss_tx']['fix_type_tx'] = "Invalid";
				}}
				var val = decode_field(arg, 1, 7, 7, "unsigned");
				{switch (val){
					case 0:
						decoded_data['gnss_tx']['log_num_tx'] = "DIsable";
						break;
					case 1:
						decoded_data['gnss_tx']['log_num_tx'] = "Enable";
						break;
					default:
						decoded_data['gnss_tx']['log_num_tx'] = "Invalid";
				}}
				return 1;
			}
		},
		{
			key: [0x34],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('geofence0')) {
					decoded_data['geofence0'] = {};
				}
				decoded_data['geofence0']['fence_radius_0'] = decode_field(arg, 8, 15, 0, "unsigned") * 10;
				decoded_data['geofence0']['fence_rlongitude_0'] = (decode_field(arg, 8, 39, 16, "signed") * 0.000025).toFixed(6);
				decoded_data['geofence0']['fence_rlatitude_0'] = (decode_field(arg, 8, 63, 40, "signed") * 0.0000125).toFixed(7);
				return 8;
			}
		},
		{
			key: [0x35],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('geofence1')) {
					decoded_data['geofence1'] = {};
				}
				decoded_data['geofence1']['fence_rradius_1'] = decode_field(arg, 8, 15, 0, "unsigned") * 10;
				decoded_data['geofence1']['fence_rlongitude_1'] = (decode_field(arg, 8, 39, 16, "signed") * 0.000025).toFixed(6);
				decoded_data['geofence1']['fence_rlatitude_1'] = (decode_field(arg, 8, 63, 40, "signed") * 0.0000125).toFixed(7);
				return 8;
			}
		},
		{
			key: [0x36],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('geofence2')) {
					decoded_data['geofence2'] = {};
				}
				decoded_data['geofence2']['fence_rradius_2'] = decode_field(arg, 8, 15, 0, "unsigned") * 10;
				decoded_data['geofence2']['fence_rlongitude_2'] = (decode_field(arg, 8, 39, 16, "signed") * 0.000025).toFixed(6);
				decoded_data['geofence2']['fence_rlatitude_2'] = (decode_field(arg, 8, 63, 40, "signed") * 0.0000125).toFixed(7);
				return 8;
			}
		},
		{
			key: [0x37],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('geofence3')) {
					decoded_data['geofence3'] = {};
				}
				decoded_data['geofence3']['fence_rradius_3'] = decode_field(arg, 8, 15, 0, "unsigned") * 10;
				decoded_data['geofence3']['fence_rlongitude_3'] = (decode_field(arg, 8, 39, 16, "signed") * 0.000025).toFixed(6);
				decoded_data['geofence3']['fence_rlatitude_3'] = (decode_field(arg, 8, 63, 40, "signed") * 0.0000125).toFixed(7);
				return 8;
			}
		},
		{
			key: [0x40],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('accelerometer_mode')) {
					decoded_data['accelerometer_mode'] = {};
				}
				var val = decode_field(arg, 1, 0, 0, "unsigned");
				{switch (val){
					case 0:
						decoded_data['accelerometer_mode']['xaxis_enabled'] = "Disable";
						break;
					case 1:
						decoded_data['accelerometer_mode']['xaxis_enabled'] = "Enable";
						break;
					default:
						decoded_data['accelerometer_mode']['xaxis_enabled'] = "Invalid";
				}}
				var val = decode_field(arg, 1, 1, 1, "unsigned");
				{switch (val){
					case 0:
						decoded_data['accelerometer_mode']['yaxis_enabled'] = "Disable";
						break;
					case 1:
						decoded_data['accelerometer_mode']['yaxis_enabled'] = "Enable";
						break;
					default:
						decoded_data['accelerometer_mode']['yaxis_enabled'] = "Invalid";
				}}
				var val = decode_field(arg, 1, 2, 2, "unsigned");
				{switch (val){
					case 0:
						decoded_data['accelerometer_mode']['zaxis_enabled'] = "Disable";
						break;
					case 1:
						decoded_data['accelerometer_mode']['zaxis_enabled'] = "Enable";
						break;
					default:
						decoded_data['accelerometer_mode']['zaxis_enabled'] = "Invalid";
				}}
				var val = decode_field(arg, 1, 6, 6, "unsigned");
				{switch (val){
					case 0:
						decoded_data['accelerometer_mode']['assist_enabled'] = "DIsable";
						break;
					case 1:
						decoded_data['accelerometer_mode']['assist_enabled'] = "Enable";
						break;
					default:
						decoded_data['accelerometer_mode']['assist_enabled'] = "Invalid";
				}}
				var val = decode_field(arg, 1, 7, 7, "unsigned");
				{switch (val){
					case 0:
						decoded_data['accelerometer_mode']['poweron'] = "Off";
						break;
					case 1:
						decoded_data['accelerometer_mode']['poweron'] = "On";
						break;
					default:
						decoded_data['accelerometer_mode']['poweron'] = "Invalid";
				}}
				return 1;
			}
		},
		{
			key: [0x41],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('accelerometer_sensitivity')) {
					decoded_data['accelerometer_sensitivity'] = {};
				}
				var val = decode_field(arg, 1, 2, 0, "unsigned");
				{switch (val){
					case 1:
						decoded_data['accelerometer_sensitivity']['sample_rate'] = "1 Hz";
						break;
					case 2:
						decoded_data['accelerometer_sensitivity']['sample_rate'] = "10 Hz";
						break;
					case 3:
						decoded_data['accelerometer_sensitivity']['sample_rate'] = "25 Hz";
						break;
					case 4:
						decoded_data['accelerometer_sensitivity']['sample_rate'] = "50 Hz";
						break;
					case 5:
						decoded_data['accelerometer_sensitivity']['sample_rate'] = "100 Hz";
						break;
					case 6:
						decoded_data['accelerometer_sensitivity']['sample_rate'] = "200 Hz";
						break;
					case 7:
						decoded_data['accelerometer_sensitivity']['sample_rate'] = "400 Hz";
						break;
					default:
						decoded_data['accelerometer_sensitivity']['sample_rate'] = "Invalid";
				}}
				var val = decode_field(arg, 1, 5, 4, "unsigned");
				{switch (val){
					case 0:
						decoded_data['accelerometer_sensitivity']['measurement_range'] = "±2 g";
						break;
					case 1:
						decoded_data['accelerometer_sensitivity']['measurement_range'] = "±4 g";
						break;
					case 2:
						decoded_data['accelerometer_sensitivity']['measurement_range'] = "±8 g";
						break;
					case 3:
						decoded_data['accelerometer_sensitivity']['measurement_range'] = "±16 g";
						break;
					default:
						decoded_data['accelerometer_sensitivity']['measurement_range'] = "Invalid";
				}}
				return 1;
			}
		},
		{
			key: [0x42],
			fn: function(arg) { 
				decoded_data['acceleration_alarm_threshold_count'] = decode_field(arg, 2, 15, 0, "unsigned");
				return 2;
			}
		},
		{
			key: [0x43],
			fn: function(arg) { 
				decoded_data['acceleration_alarm_threshold_period'] = decode_field(arg, 2, 15, 0, "unsigned");
				return 2;
			}
		},
		{
			key: [0x44],
			fn: function(arg) { 
				decoded_data['acceleration_alarm_threshold'] = (decode_field(arg, 2, 15, 0, "unsigned") * 0.001).toFixed(3);
				return 2;
			}
		},
		{
			key: [0x45],
			fn: function(arg) { 
				decoded_data['acceleration_alarm_grace_period'] = decode_field(arg, 2, 15, 0, "unsigned");
				return 2;
			}
		},
		{
			key: [0x46],
			fn: function(arg) { 
				var val = decode_field(arg, 1, 0, 0, "unsigned");
				{switch (val){
					case 0:
						decoded_data['acceleration_alarm_enabled'] = "Disable";
						break;
					case 1:
						decoded_data['acceleration_alarm_enabled'] = "Enable";
						break;
					default:
						decoded_data['acceleration_alarm_enabled'] = "Invalid";
				}}
				return 1;
			}
		},
		{
			key: [0x50],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('ble_mode')) {
					decoded_data['ble_mode'] = {};
				}
				var val = decode_field(arg, 1, 6, 0, "unsigned");
				{switch (val){
					case 0:
						decoded_data['ble_mode']['num_reported_devices'] = "Disable";
						break;
					default:
						decoded_data['ble_mode']['num_reported_devices'] = "Invalid";
				}}
				var val = decode_field(arg, 1, 7, 7, "unsigned");
				{switch (val){
					case 0:
						decoded_data['ble_mode']['repitition_enabled'] = "Disable";
						break;
					case 1:
						decoded_data['ble_mode']['repitition_enabled'] = "Enable";
						break;
					default:
						decoded_data['ble_mode']['repitition_enabled'] = "Invalid";
				}}
				return 1;
			}
		},
		{
			key: [0x51],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('ble_scan_duration')) {
					decoded_data['ble_scan_duration'] = {};
				}
				decoded_data['ble_scan_duration']['periodic'] = decode_field(arg, 2, 7, 0, "unsigned");
				decoded_data['ble_scan_duration']['event_based'] = decode_field(arg, 2, 15, 8, "unsigned");
				return 2;
			}
		},
		{
			key: [0x52],
			fn: function(arg) { 
				decoded_data['ble_scan_interval'] = (decode_field(arg, 2, 15, 0, "unsigned") * 0.001).toFixed(3);
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
				if(!decoded_data.hasOwnProperty('bd_addr_range0')) {
					decoded_data['bd_addr_range0'] = {};
				}
				decoded_data['bd_addr_range0']['lap_end_0'] = decode_field(arg, 9, 23, 0, "unsigned");
				decoded_data['bd_addr_range0']['lap_start_0'] = decode_field(arg, 9, 47, 24, "unsigned");
				decoded_data['bd_addr_range0']['oui_0'] = (decode_field(arg, 9, 71, 48, "unsigned") * 0.001).toFixed(3);
				return 9;
			}
		},
		{
			key: [0x55],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('bd_addr_range1')) {
					decoded_data['bd_addr_range1'] = {};
				}
				decoded_data['bd_addr_range1']['lap_end_1'] = decode_field(arg, 9, 23, 0, "unsigned");
				decoded_data['bd_addr_range1']['lap_start_1'] = decode_field(arg, 9, 47, 24, "unsigned");
				decoded_data['bd_addr_range1']['oui_1'] = decode_field(arg, 9, 71, 48, "unsigned");
				return 9;
			}
		},
		{
			key: [0x56],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('bd_addr_range2')) {
					decoded_data['bd_addr_range2'] = {};
				}
				decoded_data['bd_addr_range2']['lap_end_2'] = decode_field(arg, 9, 23, 0, "unsigned");
				decoded_data['bd_addr_range2']['lap_start_2'] = decode_field(arg, 9, 47, 24, "unsigned");
				decoded_data['bd_addr_range2']['oui_2'] = decode_field(arg, 9, 71, 48, "unsigned");
				return 9;
			}
		},
		{
			key: [0x57],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('bd_addr_range3')) {
					decoded_data['bd_addr_range3'] = {};
				}
				decoded_data['bd_addr_range3']['lap_end_3'] = decode_field(arg, 9, 23, 0, "unsigned");
				decoded_data['bd_addr_range3']['lap_start_3'] = decode_field(arg, 9, 47, 24, "unsigned");
				decoded_data['bd_addr_range3']['oui_3'] = decode_field(arg, 9, 71, 48, "unsigned");
				return 9;
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
				decoded_data['temperature_thresholds']['temp_low'] = decode_field(arg, 2, 7, 0, "signed");
				decoded_data['temperature_thresholds']['temp_high'] = decode_field(arg, 2, 15, 8, "signed");
				return 2;
			}
		},
		{
			key: [0x63],
			fn: function(arg) { 
				decoded_data['temperature_thresholds_enabled'] = decode_field(arg, 1, 0, 0, "unsigned");
				return 1;
			}
		},
		{
			key: [0x71],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('metadata')) {
					decoded_data['metadata'] = {};
				}
				var val = decode_field(arg, 7, 7, 0, "unsigned");
				{switch (val){
					case 0:
						decoded_data['metadata']['loramac_region'] = "EU868";
						break;
					case 1:
						decoded_data['metadata']['loramac_region'] = "US915";
						break;
					case 2:
						decoded_data['metadata']['loramac_region'] = "AS923";
						break;
					case 3:
						decoded_data['metadata']['loramac_region'] = "AU915";
						break;
					case 4:
						decoded_data['metadata']['loramac_region'] = "IN865";
						break;
					case 5:
						decoded_data['metadata']['loramac_region'] = "CN470";
						break;
					case 6:
						decoded_data['metadata']['loramac_region'] = "KR920";
						break;
					case 7:
						decoded_data['metadata']['loramac_region'] = "RU864";
						break;
					default:
						decoded_data['metadata']['loramac_region'] = "Invalid";
				}}
				decoded_data['metadata']['loramac_ver_revision'] = decode_field(arg, 7, 15, 8, "unsigned");
				decoded_data['metadata']['loramac_ver_minor'] = decode_field(arg, 7, 23, 16, "unsigned");
				decoded_data['metadata']['loramac_ver_major'] = decode_field(arg, 7, 31, 24, "unsigned");
				decoded_data['metadata']['app_ver_revision'] = decode_field(arg, 7, 39, 32, "unsigned");
				decoded_data['metadata']['app_ver_minor'] = decode_field(arg, 7, 47, 40, "unsigned");
				decoded_data['metadata']['app_ver_major'] = decode_field(arg, 7, 55, 48, "unsigned");
				return 7;
			}
		},
	];
}
if (input.fPort === 10) {
	decoder = [
		{
			key: [0x00, 0xAA],
			fn: function(arg) { 
				decoded_data['num_satellites'] = decode_field(arg, 1, 7, 0, "unsigned");
				return 1;
			}
		},
		{
			key: [0x00, 0xAB],
			fn: function(arg) { 
				decoded_data['avg_satellite_snr'] = (decode_field(arg, 2, 15, 0, "signed") * 0.1).toFixed(1);
				return 2;
			}
		},
		{
			key: [0x00, 0xAC],
			fn: function(arg) { 
				var val = decode_field(arg, 1, 7, 0, "unsigned");
				{switch (val){
					case 0:
						decoded_data['fix_type'] = "No fix available";
						break;
					case 1:
						decoded_data['fix_type'] = "2D fix";
						break;
					case 2:
						decoded_data['fix_type'] = "3D fix";
						break;
					default:
						decoded_data['fix_type'] = "Invalid";
				}}
				return 1;
			}
		},
		{
			key: [0x00, 0xAD],
			fn: function(arg) { 
				decoded_data['log_num'] = decode_field(arg, 2, 15, 0, "unsigned");
				return 2;
			}
		},
		{
			key: [0x01, 0xBA],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('battery1_status')) {
					decoded_data['battery1_status'] = {};
				}
				decoded_data['battery1_status']['voltage_1'] = (decode_field(arg, 1, 6, 0, "unsigned") * 0.01 + 2.5).toFixed(2);
				var val = decode_field(arg, 1, 7, 7, "unsigned");
				{switch (val){
					case 0:
						decoded_data['battery1_status']['eos_alert_1'] = "Inactive";
						break;
					case 1:
						decoded_data['battery1_status']['eos_alert_1'] = "Active";
						break;
					default:
						decoded_data['battery1_status']['eos_alert_1'] = "Invalid";
				}}
				return 1;
			}
		},
		{
			key: [0x02, 0xBA],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('battery2_status')) {
					decoded_data['battery2_status'] = {};
				}
				decoded_data['battery2_status']['voltage_2'] = (decode_field(arg, 1, 6, 0, "unsigned") * 0.01 + 2.5).toFixed(2);
				var val = decode_field(arg, 1, 7, 7, "unsigned");
				{switch (val){
					case 0:
						decoded_data['battery2_status']['eos_alert_2'] = "Inactive";
						break;
					case 1:
						decoded_data['battery2_status']['eos_alert_2'] = "Active";
						break;
					default:
						decoded_data['battery2_status']['eos_alert_2'] = "Invalid";
				}}
				return 1;
			}
		},
		{
			key: [0x00, 0x85],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('utc')) {
					decoded_data['utc'] = {};
				}
				decoded_data['utc']['second_utc'] = decode_field(arg, 7, 7, 0, "unsigned");
				decoded_data['utc']['minute_utc'] = decode_field(arg, 7, 15, 8, "unsigned");
				decoded_data['utc']['hour_utc'] = decode_field(arg, 7, 23, 16, "unsigned");
				decoded_data['utc']['day_utc'] = decode_field(arg, 7, 31, 24, "unsigned");
				decoded_data['utc']['month_utc'] = decode_field(arg, 7, 39, 32, "unsigned");
				decoded_data['utc']['year_utc'] = decode_field(arg, 7, 55, 40, "unsigned");
				return 7;
			}
		},
		{
			key: [0x00, 0x88],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('coordinates')) {
					decoded_data['coordinates'] = {};
				}
				decoded_data['coordinates']['altitude'] = (decode_field(arg, 9, 15, 0, "signed") * 0.5).toFixed(1);
				decoded_data['coordinates']['longitude'] = (decode_field(arg, 9, 47, 16, "signed") * 0.0000001).toFixed(7);
				decoded_data['coordinates']['latitude'] = (decode_field(arg, 9, 71, 48, "signed") * 0.0000125).toFixed(7);
				return 9;
			}
		},
		{
			key: [0x00, 0x92],
			fn: function(arg) { 
				decoded_data['ground_speed'] = (decode_field(arg, 2, 15, 0, "unsigned") * 0.1).toFixed(1);
				return 2;
			}
		},
		{
			key: [0x00, 0x04],
			fn: function(arg) { 
				var val = decode_field(arg, 1, 7, 0, "unsigned");
				{switch (val){
					case 0:
						decoded_data['fsm_state'] = "GNSS DISABLED State";
						break;
					case 1:
						decoded_data['fsm_state'] = "GNSS SEARCH State";
						break;
					case 2:
						decoded_data['fsm_state'] = "GNSS STILLNESS State";
						break;
					case 3:
						decoded_data['fsm_state'] = "GNSS MOBILITY State";
						break;
					default:
						decoded_data['fsm_state'] = "Invalid";
				}}
				return 1;
			}
		},
		{
			key: [0x00, 0x95],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('fix_status')) {
					decoded_data['fix_status'] = {};
				}
				var val = decode_field(arg, 1, 0, 0, "unsigned");
				{switch (val){
					case 0:
						decoded_data['fix_status']['utc'] = "Invalid";
						break;
					case 1:
						decoded_data['fix_status']['utc'] = "Valid";
						break;
					default:
						decoded_data['fix_status']['utc'] = "Invalid";
				}}
				var val = decode_field(arg, 1, 1, 1, "unsigned");
				{switch (val){
					case 0:
						decoded_data['fix_status']['position'] = "Invalid";
						break;
					case 1:
						decoded_data['fix_status']['position'] = "Valid";
						break;
					default:
						decoded_data['fix_status']['position'] = "Invalid";
				}}
				return 1;
			}
		},
		{
			key: [0x01, 0x95],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('geofence_status')) {
					decoded_data['geofence_status'] = {};
				}
				var val = decode_field(arg, 1, 1, 0, "unsigned");
				{switch (val){
					case 0:
						decoded_data['geofence_status']['num0'] = "Unknown";
						break;
					case 1:
						decoded_data['geofence_status']['num0'] = "Inside";
						break;
					case 2:
						decoded_data['geofence_status']['num0'] = "Outside";
						break;
					default:
						decoded_data['geofence_status']['num0'] = "Invalid";
				}}
				var val = decode_field(arg, 1, 3, 2, "unsigned");
				{switch (val){
					case 0:
						decoded_data['geofence_status']['num1'] = "Unknown";
						break;
					case 1:
						decoded_data['geofence_status']['num1'] = "Inside";
						break;
					case 2:
						decoded_data['geofence_status']['num1'] = "Outside";
						break;
					default:
						decoded_data['geofence_status']['num1'] = "Invalid";
				}}
				var val = decode_field(arg, 1, 5, 4, "unsigned");
				{switch (val){
					case 0:
						decoded_data['geofence_status']['num2'] = "Unknown";
						break;
					case 1:
						decoded_data['geofence_status']['num2'] = "Inside";
						break;
					case 2:
						decoded_data['geofence_status']['num2'] = "Outside";
						break;
					default:
						decoded_data['geofence_status']['num2'] = "Invalid";
				}}
				var val = decode_field(arg, 1, 7, 6, "unsigned");
				{switch (val){
					case 0:
						decoded_data['geofence_status']['num3'] = "Unknown";
						break;
					case 1:
						decoded_data['geofence_status']['num3'] = "Inside";
						break;
					case 2:
						decoded_data['geofence_status']['num3'] = "Outside";
						break;
					default:
						decoded_data['geofence_status']['num3'] = "Invalid";
				}}
				return 1;
			}
		},
		{
			key: [0x00, 0x00],
			fn: function(arg) { 
				var val = decode_field(arg, 1, 7, 0, "unsigned");
				{switch (val){
					case 0:
						decoded_data['acceleration_alarm'] = "Inactive";
						break;
					case 255:
						decoded_data['acceleration_alarm'] = "Active";
						break;
					default:
						decoded_data['acceleration_alarm'] = "Invalid";
				}}
				return 1;
			}
		},
		{
			key: [0x00, 0x71],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('acceleration_vector')) {
					decoded_data['acceleration_vector'] = {};
				}
				decoded_data['acceleration_vector']['xaxis'] = (decode_field(arg, 6, 15, 0, "signed") * 0.001).toFixed(3);
				decoded_data['acceleration_vector']['yaxis'] = (decode_field(arg, 6, 31, 16, "signed") * 0.001).toFixed(3);
				decoded_data['acceleration_vector']['zaxis'] = (decode_field(arg, 6, 47, 32, "signed") * 0.001).toFixed(3);
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
	];
}
if (input.fPort === 25) {
	decoder = [
		{
			key: [0x0A],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('ble_1')) {
					decoded_data['ble_1'] = {};
				}
					var data = [];
					var loop = arg.length / 7;
					for (var i = 0; i < loop; i++) {
						var group = {};
						group['id_01'] = decode_field(arg, 7, 55, 8, "hexstring");
						group['rssi_01'] = decode_field(arg, 7, 7, 0, "signed");
						data.push(group);
						arg = arg.slice(7);
					}
					decoded_data['ble_1'] = data;
					return loop*7;
			}
		},
		{
			key: [0xB0],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('ble_2')) {
					decoded_data['ble_2'] = {};
				}
					var data = [];
					var loop = arg.length / 4;
					for (var i = 0; i < loop; i++) {
						var group = {};
						group['id_02'] = decode_field(arg, 4, 31, 8, "hexstring");
						group['rssi_02'] = decode_field(arg, 4, 7, 0, "signed");
						data.push(group);
						arg = arg.slice(4);
					}
					decoded_data['ble_2'] = data;
					return loop*4;
			}
		},
		{
			key: [0xB1],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('ble_3')) {
					decoded_data['ble_3'] = {};
				}
					var data = [];
					var loop = arg.length / 4;
					for (var i = 0; i < loop; i++) {
						var group = {};
						group['id_03'] = decode_field(arg, 4, 31, 8, "hexstring");
						group['rssi_03'] = decode_field(arg, 4, 7, 0, "signed");
						data.push(group);
						arg = arg.slice(4);
					}
					decoded_data['ble_3'] = data;
					return loop*4;
			}
		},
		{
			key: [0xB2],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('ble_4')) {
					decoded_data['ble_4'] = {};
				}
					var data = [];
					var loop = arg.length / 4;
					for (var i = 0; i < loop; i++) {
						var group = {};
						group['id_04'] = decode_field(arg, 4, 31, 8, "hexstring");
						group['rssi_04'] = decode_field(arg, 4, 7, 0, "signed");
						data.push(group);
						arg = arg.slice(4);
					}
					decoded_data['ble_4'] = data;
					return loop*4;
			}
		},
		{
			key: [0xB3],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('ble_5')) {
					decoded_data['ble_5'] = {};
				}
					var data = [];
					var loop = arg.length / 4;
					for (var i = 0; i < loop; i++) {
						var group = {};
						group['id_05'] = decode_field(arg, 4, 31, 8, "hexstring");
						group['rssi_05'] = decode_field(arg, 4, 7, 0, "signed");
						data.push(group);
						arg = arg.slice(4);
					}
					decoded_data['ble_5'] = data;
					return loop*4;
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
				decoded_data['log_utc']['fragment_number_1'] = decode_field(arg, 8, 63, 56, "unsigned");
				decoded_data['log_utc']['year_1'] = decode_field(arg, 8, 55, 40, "unsigned");
				decoded_data['log_utc']['month_1'] = decode_field(arg, 8, 39, 32, "unsigned");
				decoded_data['log_utc']['day_1'] = decode_field(arg, 8, 31, 24, "unsigned");
				decoded_data['log_utc']['hour_1'] = decode_field(arg, 8, 23, 16, "unsigned");
				decoded_data['log_utc']['minute_1'] = decode_field(arg, 8, 15, 8, "unsigned");
				decoded_data['log_utc']['second_1'] = decode_field(arg, 8, 7, 0, "unsigned");
				return 8;
			}
		},
		{
			key: [0x02],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('log_coordinates')) {
					decoded_data['log_coordinates'] = {};
				}
				decoded_data['log_coordinates']['fragment_number_2'] = decode_field(arg, 10, 79, 72, "unsigned");
				decoded_data['log_coordinates']['lattitude_2'] = (decode_field(arg, 10, 71, 48, "signed") * 0.0000125).toFixed(7);
				decoded_data['log_coordinates']['longitude_2'] = (decode_field(arg, 10, 47, 16, "signed") * 0.0000001).toFixed(7);
				decoded_data['log_coordinates']['altitude_2'] = (decode_field(arg, 10, 15, 0, "signed") * 0.5).toFixed(1);
				return 10;
			}
		},
		{
			key: [0x03],
			fn: function(arg) { 
				if(!decoded_data.hasOwnProperty('log_all')) {
					decoded_data['log_all'] = {};
				}
				var fragment_number_3 = {}
				fragment_number_3['fragment_number_3'] = decode_field(arg, 17, 135, 128, "unsigned");
				arg = arg.slice(1);
					var data = [];
					data.push(fragment_number_3);
					var loop = arg.length / 16;
					for (var i = 0; i < loop; i++) {
						var group = {};
						group['year_3'] = decode_field(arg, 16, 127, 112, "unsigned");
						group['month_3'] = decode_field(arg, 16, 111, 104, "unsigned");
						group['day_3'] = decode_field(arg, 16, 103, 96, "unsigned");
						group['hour_3'] = decode_field(arg, 16, 95, 88, "unsigned");
						group['minute_3'] = decode_field(arg, 16, 87, 80, "unsigned");
						group['second_3'] = decode_field(arg, 16, 79, 72, "unsigned");
						group['lattitude_3'] = (decode_field(arg, 16, 71, 48, "signed") * 0.0000125).toFixed(7);;
						group['longitude_3'] = (decode_field(arg, 16, 47, 16, "signed") * 0.0000001).toFixed(7);
						group['altitude_3'] = (decode_field(arg, 16, 15, 0, "signed") * 0.5).toFixed(1);
						data.push(group);
						arg = arg.slice(16);
					}
					decoded_data['log_all'] = data;
					return loop*16 + 1;
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