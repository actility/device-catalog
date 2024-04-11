////// *BROWAN MerryIoT Open/Close Sensor * //////
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

    result.data.battery_volt= 0;
    result.data.temperature = "";
    result.data.humi = "";
    result.data.open= 0;
    result.data.button= 0;
    result.data.tamper= 0;
    result.data.tilt= 0;
    result.data.time = "";
    result.data.count = "";
    result.data.bootloader = "";
    result.data.HW_version = "";
    result.data.FW_version = "";
    result.data.cfg_keepalive = "";
    result.data.cfg_tamper = "";
    result.data.cfg_buzzer = "";

    if(input.fPort==120){
        result.data.fPort = input.fPort;
        result.data.byteLength = raw.byteLength;
        var intput_list = input.bytes;
        if(raw.byteLength==9){
            //keep alive Content (uplink device payload)
            var battery_hex = intput_list[1].toString(16);
            var battery_bin = hex2bin(battery_hex);
            var battery_st = battery_bin.substring(4, 8);
            var battery_volt = (21+(parseInt(battery_st,2)))/10;
            var temperature= parseInt(intput_list[2],16);
            var humi =  parseInt(intput_list[3],16);
            var door_hex = intput_list[0].toString(16); // Sensor Status calculate
            var door_binary = hex2bin(door_hex); 
            var open_st = door_binary.substring(7, 8); 
            var button_st = door_binary.substring(6, 7); 
            var tamper_st = door_binary.substring(5, 6); 
            var tilt_st = door_binary.substring(4, 5); 
            var time_hex = (intput_list[5].toString(16))+(intput_list[4].toString(16)); 
            var count_hex = (intput_list[8].toString(16))+(intput_list[7].toString(16))+(intput_list[6].toString(16)); 

            result.data.battery_volt =battery_volt;     // battery calculate
            result.data.temperature = temperature.toString(16);       // temperature calculate
            result.data.humi = humi.toString(16);                     // Humidity calculate
            result.data.open = parseInt(open_st);        // Door status
            result.data.button = parseInt(button_st);    // Button pressed
            result.data.tamper = parseInt(tamper_st);    // Tamper detected
            result.data.tilt = parseInt(tilt_st);        // Tilt detected
            result.data.time =  parseInt(time_hex, 16).toString(10);  // Time elapsed since last event trigger
            result.data.count = parseInt(count_hex, 16).toString(10); // Total count of event triggers

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
        if(raw.byteLength == 7 && (intput_list[0]==0x00)&&(intput_list[3]==0x01)&&(intput_list[5]==0x02)){
            // console.log("Response fPort !!");
            var keepalive_hex = (intput_list[2].toString(16))+(intput_list[1].toString(16));
            result.data.cfg_keepalive = parseInt(keepalive_hex,16).toString(16); // Keep alive interval (sec)
            result.data.cfg_tamper = parseInt(intput_list[4],16).toString(16); //Enable tamper detection
            result.data.cfg_buzzer = parseInt(intput_list[6],16).toString(16); //Buzzer alarm period times(sec)
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
