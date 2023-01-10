////// *BROWAN MerryIoT Air Quality CO2 * //////
//hex to binary function
function hex2bin(hex){
    return (parseInt(hex, 16).toString(2)).padStart(8, '0');
}

function decodeUplink(input) {
    let result = {
        data: {},
        errors: [],
        warnings: []
    };
    const raw = Buffer.from(input.bytes);
    result.data.battery_volt = 0;
    result.data.temperature = "";
    result.data.humi = "";
    result.data.button = 0;
    result.data.trigger = 0;
    result.data.co2threshold = 0;
    result.data.co2calibration = 0;
    result.data.co2_ppm = "";
    result.data.bootloader = "";
    result.data.HW_version = "";
    result.data.FW_version = "";
    result.data.cfg_keeplive = "";
    result.data.cfg_detect = "";
    result.data.cfg_buzzer = "";
    result.data.cfg_co2autocail = "";
    result.data.cfg_co2sersor = "";
    result.data.cfg_proxi = "";
    result.data.cfg_co2thresh = "";
    result.data.cfg_co2cailbra = "";

    if(input.fPort==127){
        result.data.fPort = input.fPort;
        result.data.byteLength = raw.byteLength;
        var intput_list = input.bytes;
        if(raw.byteLength==6){
            //keep alive Content (uplink device payload)
            var battery_hex = intput_list[1].toString(16);
            var battery_bin = hex2bin(battery_hex);
            var battery_st = battery_bin.substring(4, 8);
            var battery_volt = (21+(parseInt(battery_st,2)))/10;
            temperature= parseInt(intput_list[2],16);
            humi =  parseInt(intput_list[3],16);
            var co2_hex = intput_list[0].toString(16); // Sensor Status calculate
            var co2_binary = hex2bin(co2_hex);
            var trigger_st = co2_binary.substring(7, 8); 
            var button_st = co2_binary.substring(6, 7); 
            var co2threshold_st = co2_binary.substring(3, 4); 
            var co2calibration_st = co2_binary.substring(2, 3);
            var co2ppm_hex =(intput_list[5].toString(16))+(intput_list[4].toString(16));

            result.data.battery_volt =battery_volt;                     // battery calculate
            result.data.temperature = temperature.toString(16);                      // temperature calculate
            result.data.humi = humi.toString(16);                                    // Humidity calculate
            result.data.button = parseInt(button_st);                   // Button pressed
            result.data.trigger = parseInt(trigger_st);                 // Trigger Event
            result.data.co2threshold = parseInt(co2threshold_st);       // CO2 is over the threshold 
            result.data.co2calibration = parseInt(co2calibration_st);   // CO2 Calibration flag
            result.data.co2_ppm = (parseInt(co2ppm_hex, 16)).toString(10);             // CO2 ppm calculate

            return result;
        }
        else{
            result.errors.push("Invalid uplink payload: not 4 bytes");
            return result;
        }
    }
    else if (input.fPort==204){
        result.data.fPort = input.fPort;
        result.data.byteLength = raw.byteLength;
        var intput_list = input.bytes;
        // Response Content (uplink device configure) (Only for unconfirmed downlink)
        if(raw.byteLength == 11 && (intput_list[0]==0x00)&&(intput_list[3]==0x03)&&(intput_list[5]==0x04)&&(intput_list[8]==0x05)){
            var cfg_co2thresh_hex = (intput_list[7].toString(16))+(intput_list[6].toString(16));
            var cfg_co2cailbra_hex = (intput_list[10].toString(16))+(intput_list[9].toString(16));
            result.data.cfg_keeplive = parseInt(intput_list[1],16);         //Set keepalive interval (sec),0x0C -> 12 (x 5min) = 60 min (Unit:5min)
            result.data.cfg_detect = parseInt(intput_list[2],16);           //Set Detection interval 0x01-> 1 (x 5min) = 5 mins (Unit:5min)
            var co2_hex = intput_list[4].toString(16)
            var co2_binary = hex2bin(co2_hex);
            var buzzer_sc = co2_binary.substring(3, 8);
            var co2autocail_st = co2_binary.substring(2, 3);
            var co2sersor_st = co2_binary.substring(1, 2);
            var proxi_st = co2_binary.substring(0, 1);
            result.data.cfg_buzzer = parseInt(buzzer_sc,2).toString(16);                   //Buzzer alarm period in seconds (sec)
            result.data.cfg_co2autocail = parseInt(co2autocail_st).toString(16);         //Enable/disable CO2 auto calibration , 0: disable, 1: enable(default)
            result.data.cfg_co2sersor = parseInt(co2sersor_st).toString(16);             //Enable/disable CO2 sensor , 0: disable, 1: enable (default)
            result.data.cfg_proxi = parseInt(proxi_st).toString(16);                     //Enable/disable proximity sensor , 0: disable (default)) , 1: enable
            result.data.cfg_co2thresh = parseInt(cfg_co2thresh_hex,16).toString(16);     //Set CO2 threshold: 0x03E8 -> 1000 ppm
            result.data.cfg_co2cailbra = parseInt(cfg_co2cailbra_hex,16).toString(16);   //Set CO2 calibration value: 0x0190 -> 400 ppm
            return result;
        }
        // Frame Count 1 Content (uplink device info)
        else if(raw.byteLength == 9){
            // console.log("Frame Count fPort !!");
            var hwid_hex = (intput_list[4].toString(16))+(intput_list[3].toString(16))+(intput_list[2].toString(16))+(intput_list[1].toString(16));
            var fwid_hex = (intput_list[8].toString(16))+(intput_list[7].toString(16))+(intput_list[6].toString(16))+(intput_list[5].toString(16));
            result.data.HW_version = hwid_hex.toString(16); //Hardware ID
            result.data.FW_version = fwid_hex.toString(16); //Firmware version
            return result;
        }
        else{
            // console.log("Invalid fPort !!");
            result.errors.push("Invalid uplink payload: not 9 or 10 bytes");
            return result;
        }
    }
    else{
        // console.log("Invalid fPort !!");
        result.errors.push("Invalid fPort !!");
        return result;
    }
}
exports.decodeUplink = decodeUplink;
