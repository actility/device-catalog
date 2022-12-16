////// *BROWAN MerryIoT Water Leak Sensor * //////
//hex to binary function
function hex2bin(hex){
    return (parseInt(hex, 16).toString(2)).padStart(8, '0');
}

function decodeUplink(input) {
    let result = {
        data: {
            "fPort" : 0,
            "byteLength" : 0,
            "battery_volt" : 0,
            "temperature" : 0,
            "humi" : 0,
            "water" : 0,
            "button" : 0,
            "tamper" : 0,
            "bootloader" : 0,
            "HW_version" : '',
            "FW_version" : '',
            "cfg_keepalive" : 0,
            "cfg_detect" : 0,
            "cfg_tamper" : 0,
            "cfg_buzzer" : 0,
        },
        errors: [],
        warnings: []
    };
    const raw = Buffer.from(input.bytes);

    if(input.fPort==126){
        result.data.fPort = input.fPort;
        result.data.byteLength = raw.byteLength;
        var intput_list = input.bytes;
        if(raw.byteLength==4){
            //keep alive Content (uplink device payload)
            var battery_int=parseInt(intput_list[1],16);
            battery_volt = (21+battery_int)/10;
            temperature= parseInt(intput_list[2],16);
            humi =  parseInt(intput_list[3],16);
            var water_hex = intput_list[0].toString(16); // Sensor Status calculate
            var water_binary = hex2bin(water_hex); 
            var water_st = water_binary.substring(7, 8); 
            var button_st = water_binary.substring(6, 7); 
            var tamper_st = water_binary.substring(5, 6); 

            result.data.battery_volt = battery_volt;// battery calculate
            result.data.temperature = temperature;//temperature calculate
            result.data.humi = humi; //Humidity calculate
            result.data.water = parseInt(water_st); // water status
            result.data.button = parseInt(button_st); // Button pressed
            result.data.tamper = parseInt(tamper_st); // Tamper detected
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
        if(raw.byteLength == 10 && (intput_list[0]==0x00)&&(intput_list[3]==0x03)&&(intput_list[6]==0x04)&&(intput_list[8]==0x05)){
            // console.log("Response fPort !!");
            var keepalive_hex = (intput_list[2].toString(16))+(intput_list[1].toString(16));
            var detectt_hex = (intput_list[5].toString(16))+(intput_list[4].toString(16));
            result.data.cfg_keepalive = parseInt(keepalive_hex,16); // Keep alive interval (sec)
            result.data.cfg_detect = parseInt(detectt_hex,16); //Set detection interval (sec)
            result.data.cfg_tamper = parseInt(intput_list[7],16); //Enable tamper detection
            result.data.cfg_buzzer = parseInt(intput_list[9],16);; //Buzzer alarm period times(sec)
            return result;
        }
        // Frame Count 1 Content (uplink device info)
        else if(raw.byteLength == 9){
            // console.log("Frame Count fPort !!");
            var hwid_hex = (intput_list[4].toString(16))+(intput_list[3].toString(16))+(intput_list[2].toString(16))+(intput_list[1].toString(16));
            var fwid_hex = (intput_list[8].toString(16))+(intput_list[7].toString(16))+(intput_list[6].toString(16))+(intput_list[5].toString(16));
            result.data.HW_version = hwid_hex; //Hardware ID
            result.data.FW_version = fwid_hex; //Firmware version
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
//////*BROWAN MerryIoT Water Leak Sensor --End!! *//////

////// *** Test layout *** //////

// //****** case 1 - Frame Count:1 payload ****** //
// test_fport = 204;
// test_datas = ['01','04','20','00','00','7f','f1','f1','02']; //Frame Count 1 device info payload

// // ****** case 2 - Response configure payload ****** //
// test_fport = 204;
// test_datas = ['00','10','0E','03','2C','01','04','01','05','03']; //Response configure payload (Applies only after downlink)

//****** case 3 - water sensor uplink payload ****** //
/*
test_fport = 126;
test_datas = ['07','06','16','3f']; //water leak device uplink payload

var test_Datas = {
    "fport" : test_fport,  // lorawan fPort
    "bytes": test_datas, // device payload
};

Test_final = decodeUplink(test_Datas);

if(Test_final.data.fPort==204 && Test_final.data.byteLength==9){
    console.log('========= device info =========');
    console.log('fPort:'+Test_final.data.fPort);
    console.log('HW ID: '+Test_final.data.HW_version);
    console.log('FW version: '+Test_final.data.FW_versi
browan_WL_driver_decoder_forActility.js
Affichage de browan_WL_driver_decoder_forActility.js);
    console.log('===================');
}
else if(test_Datas.fport==204 && Test_final.data.byteLength==10){
    console.log('========= configure =========');
    console.log('fPort:'+Test_final.data.fPort);
    console.log('keepalive: '+Test_final.data.cfg_keepalive+' sec');
    console.log('detect interval: '+Test_final.data.cfg_detect+' sec');
    console.log('tamper enable: '+Test_final.data.cfg_tamper);
    console.log('buzzer alarm time: '+Test_final.data.cfg_buzzer);
    console.log('===================');
}
else{
    console.log('========= uplink payload =========');
    console.log('fPort:'+Test_final.data.fPort);
    console.log('battery_volt: '+Test_final.data.battery_volt+' v');
    console.log('temperature: '+Test_final.data.temperature+' Oc');
    console.log('humidity: '+Test_final.data.humi+' %RH');
    console.log('water: '+Test_final.data.water);
    console.log('button: '+Test_final.data.button);
    console.log('tamper: '+Test_final.data.tamper);
    console.log('===================');
}
*/