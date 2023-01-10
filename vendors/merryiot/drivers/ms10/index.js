////// *BROWAN MerryIoT Motion Detection * //////
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
    result.data.temperature ="";
    result.data.humi = "";
    result.data.motion = 0;
    result.data.button = 0;
    result.data.tamper = 0;
    result.data.time ="";
    result.data.count ="";
    result.data.bootloader ="";
    result.data.HW_version ="";
    result.data.FW_version ="";
    result.data.cfg_freeitv ="";
    result.data.cfg_occupied ="";
    result.data.cfg_free ="";
    result.data.cfg_tricount ="";
    result.data.cfg_paramet ="";
    result.data.cfg_tamper ="";

    if(input.fPort==122){
        result.data.fPort = input.fPort;
        result.data.byteLength = raw.byteLength;
        var intput_list = input.bytes;
        if(raw.byteLength==9){
            //keep alive Content (uplink device payload)
            var battery_hex = intput_list[1].toString(16);
            var battery_bin = hex2bin(battery_hex);
            var battery_st = battery_bin.substring(4, 8);
            var battery_volt = (21+(parseInt(battery_st,2)))/10;
            temperature= parseInt(intput_list[2],16);
            humi =  parseInt(intput_list[3],16);
            var motion_hex = intput_list[0].toString(16); // Sensor Status calculate
            var motion_binary = hex2bin(motion_hex);
            var motion_st = motion_binary.substring(7, 8);
            var button_st = motion_binary.substring(6, 7);
            var Tamper_st = motion_binary.substring(5, 6);             
            var time_hex = (intput_list[5].toString(16))+(intput_list[4].toString(16));
            var count_hex = (intput_list[8].toString(16))+(intput_list[7].toString(16))+(intput_list[6].toString(16));

            result.data.battery_volt = battery_volt;     // battery calculate
            result.data.temperature = temperature.toString(16);       // temperature calculate
            result.data.humi = humi.toString(16);                     // Humidity calculate
            result.data.motion = parseInt(motion_st); // Motion status
            result.data.button = parseInt(button_st); // Button pressed
            result.data.tamper = parseInt(Tamper_st); // Tamper detected
            result.data.time =  parseInt(time_hex, 16).toString(10);   //Time elapsed since last event trigger
            result.data.count = parseInt(count_hex, 16).toString(10);  //Total count of event triggers
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
        if(raw.byteLength == 18 && (intput_list[0]==0x00)&&(intput_list[3]==0x02)&&(intput_list[6]==0x03)&&(intput_list[8]==0x04)&&(intput_list[11]==0x05)&&(intput_list[16]==0x06)){
            // console.log("Response fPort !!");
            var cfg_freeitv_hex = (intput_list[2].toString(16))+(intput_list[1].toString(16));
            var cfg_occupied_hex = (intput_list[5].toString(16))+(intput_list[4].toString(16));
            var cfg_tricount_hex = (intput_list[10].toString(16))+(intput_list[9].toString(16));
            var cfg_paramet_hex = (intput_list[15].toString(16))+(intput_list[14].toString(16))+(intput_list[13].toString(16))+(intput_list[12].toString(16));
            result.data.cfg_freeitv = parseInt(cfg_freeitv_hex,16).toString(16); // reporting interval (sec) (in free mode)
            result.data.cfg_occupied = parseInt(cfg_occupied_hex,16).toString(16); //Occupied override (sec)
            result.data.cfg_free = parseInt(intput_list[7],16).toString(16); //Free detection time (min)
            result.data.cfg_tricount = parseInt(cfg_tricount_hex,16).toString(16); //Trigger Count in the occupied status
            result.data.cfg_paramet = cfg_paramet_hex.toString(16); //PIR parameter : 0x0021e000 
            result.data.cfg_tamper = parseInt(intput_list[17],16).toString(16); //enable tamper detection
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
