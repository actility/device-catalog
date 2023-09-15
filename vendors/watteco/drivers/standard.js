let attribute_types={
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

let field={
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

function UintToInt(Uint, Size) {
    if ((Size === 2) && ((Uint & 0x8000) > 0)) Uint -= 0x10000;
    if ((Size === 3) && ((Uint & 0x800000) > 0)) Uint -= 0x1000000;
    if ((Size === 4) && ((Uint & 0x80000000) > 0)) Uint -= 0x100000000;
    return Uint;
}
function Bytes2Float32(bytes) {
    let sign = (bytes & 0x80000000) ? -1 : 1;
    let exp = ((bytes >> 23) & 0xFF) - 127;
    let signi = (bytes & ~(-1 << 23));
    if (exp === 128) return sign * ((signi) ? Number.NaN : Number.POSITIVE_INFINITY);
    if (exp === -127) {
        if (signi === 0) return 0;
        exp = -126;
        signi /= (1 << 23);
    } else signi = (signi | (1 << 23)) / (1 << 23);
    return sign * signi * Math.pow(2, exp);
}
function BytesToInt64(InBytes, Starti1, Type, LiEnd)
{
    if(typeof(LiEnd) == 'undefined') LiEnd = false;
    let Signed  = (Type.substr(0,1) != "U");
    let BytesNb = parseInt(Type.substr(1,2), 10)/8;
    let inc, start;
    let nb = BytesNb;
    if (LiEnd)
    {
        inc = -1;
        start = Starti1 + BytesNb - 1;
    }
    else inc =  1; start = Starti1 ;
    tmpInt64 = 0;
    for (j=start; nb > 0;(j+=inc,nb--))
    {
        tmpInt64 = (tmpInt64 << 8) + InBytes[j];
    }
    if ((Signed) && (BytesNb < 8) && (InBytes[start] & 0x80))
        tmpInt64 = tmpInt64 - (0x01 << (BytesNb * 8));
    return tmpInt64;
}
function decimalToHex(d, pad) {
    let hex = d.toString(16).toUpperCase();
    pad = typeof (pad) === "undefined" || pad === null ? pad = 2 : pad;
    while (hex.length < pad) {
        hex = "0" + hex;
    }
    return "0x" + hex;
}
function parseHexString(str) {
    let result = [];
    while (str.length >= 2) {
        result.push(parseInt(str.substring(0, 2), 16));
        str = str.substring(2, str.length);
    }
    return result;
}
function zeroPad(num, places) {
    return( String(num).padStart(places, '0') );
}
function TIC_Decode(clustID,AttributeID,BytesAfterSize)
{

    // GENERIC ENUMs Management
    //-------------------------
    const E_DIV =
        ["!?!", "*", "",
            " ACTIF", "ACTIF", "CONSO", "CONTROLE", "DEP", "INACTIF", "PROD", "TEST", "kVA", "kW"];
    const E_PT  =
        ["!?!", "*", "",
            " ? ", "000", "HC", "HCD", "HCE", "HCH", "HH", "HH ", "HP", "HP ", "HPD", "HPE", "HPH", "JA", "JA ", "P", "P  ", "PM", "PM ", "XXX"];
    const E_CONTRAT =
        ["!?!", "*", "",
            "BT 4 SUP36", "BT 5 SUP36", "HTA 5     ", "HTA 8     ",
            "TJ EJP    ", "TJ EJP-HH ", "TJ EJP-PM ", "TJ EJP-SD ", "TJ LU     ",
            "TJ LU-CH  ", "TJ LU-P   ", "TJ LU-PH  ", "TJ LU-SD  ", "TJ MU     ",
            "TV A5 BASE", "TV A8 BASE",
            "BASE","H PLEINE-CREUSE","HPHC","HC","HC et Week-End","EJP","PRODUCTEUR"];
    const E_STD_PT =
        ["!?!", "*", "",
            " ? ",
            "000", "HC", "HCD", "HCE", "HCH", "HH", "HH ", "HP", "HP ",
            "HPD", "HPE","HPH", "JA", "JA ",  "P","P  ", "PM",   "PM ", "XXX",
            "INDEX NON CONSO","BASE","HEURE CREUSE","HEURE PLEINE","HEURE NORMALE","HEURE POINTE",
            "HC BLEU","BUHC","HP BLEU","BUHP","HC BLANC","BCHC","HP BLANC","BCHP", "HC ROUGE","RHC","HP ROUGE","RHP",
            "HEURE WEEK-END" ];
    const E_STD_CONTRAT =
        ["!?!", "*", "",
            "BT 4 SUP36", "BT 5 SUP36", "HTA 5     ", "HTA 8     ",
            "TJ EJP    ", "TJ EJP-HH ", "TJ EJP-PM ", "TJ EJP-SD ", "TJ LU     ",
            "TJ LU-CH  ", "TJ LU-P   ", "TJ LU-PH  ", "TJ LU-SD  ", "TJ MU     ",
            "TV A5 BASE", "TV A8 BASE",
            "BASE","H PLEINE-CREUSE","HPHC","HC","HC et Week-End","EJP","PRODUCTEUR"
            /* Todo: Add necessary Enums when known */
        ];

    function TICParseEnum(Bytes,i,Enums) {
        var x = {};
        if ((Bytes[i] & 0x80) == 0) { // Really Enum
            iEnum = Bytes[i] & 0x7F;

            // Palliatif Anomalie 3.5.0.4852 à 3.5.0.5339 (Cf http://support.nke-watteco.com/tic/)
            // Ligne à commenter si le capteur PMEPMI a une version firmware différente de ci-dessus
            iEnum++;

            x = Enums[iEnum]; i+=1;
        } else { // NString
            sz = Bytes[i] & 0x7F; i += 1;
            if (sz > 0) {
                x = String.fromCharCode.apply(null, Bytes.slice(i, i+sz)); i += sz;
            } else {
                x = "";
            }
        }
        return {x, i}
    }

    // DESCRIPTOR Parser
    //------------------
    function TICParseDescToIndexes(DescIn) {

        var Indexes = [];

        var DescHeader = DescIn[0];
        var DescSize = (DescHeader & 0x1F);
        if (DescSize == 0) {
            DescSize = 8; // Historical fixed size Descriptor
        }
        IsVarIndexes = ((DescHeader & 0x20) != 0);

        if (IsVarIndexes) {
            for (i=1; i < DescSize; i++) {
                Indexes.push(DescIn[i]);
            }
        } else {
            // is VarBitfields
            iField = 0;
            // TODO if historical: 7 LSbit of first byte should be used ... TODO
            for (var i=DescSize; i > 1; i--) {
                for (b = 0; b < 8; b++) {
                    if ((DescIn[i-1] >> b) & 0x01) {
                        Indexes.push(iField);
                    }
                    iField++;
                }
            }
        }

        return { DescSize, Indexes }
    }

    function TICParseDMYhms(b,i) {
        x = zeroPad(BytesToInt64(b,i,"U8"),2) + "/"+ zeroPad(BytesToInt64(b,i+1,"U8"),2) + "/"+ zeroPad(BytesToInt64(b,i+2,"U8"),2) + " " +
            zeroPad(BytesToInt64(b,i+3,"U8"),2) + ":"+ zeroPad(BytesToInt64(b,i+4,"U8"),2) + ":"+ zeroPad(BytesToInt64(b,i+5,"U8"),2);
        i+=6;
        return {x, i}
    }

    function TICParseTimeStamp(b,i,LittleEndian) {
        // EPOCH TIC: 01/01/2000 00:00:00
        // EPOCH UNIX: 01/01/1970 00:00:00
        ts = BytesToInt64(b,i,"U32",LittleEndian); i += 4;
        ts += (new Date("2000/01/01 00:00:00").getTime()/1000)
        ts += 3600; //TODO: find a way to beter manage this 1h shift due to TZ and DST of running computer
        var a = new Date( ts * 1000);
        var x =
            zeroPad(a.getDate(),2) + '/' + zeroPad(a.getMonth(), 2) + '/' + a.getFullYear() + ' ' +
            zeroPad(a.getHours(),2) + ':' + zeroPad(a.getMinutes(),2) + ':' + zeroPad(a.getSeconds(),2) ;
        return {x, i};
    }

    function TICParseCString(b,i) {
        eos = b.slice(i).indexOf(0);
        x = String.fromCharCode.apply(null, b.slice(i, i + eos)); i += (eos + 1);
        return {x,  i}
    }

    function TICParseNString(b,i, n) {
        x = String.fromCharCode.apply(null, b.slice(i, i+n)); i+=n;
        return {x,  i}
    }



    // ---------------------------------------------------------
    // FIELD PARSING
    function TYPE_EMPTY(b,i) { return {b,i}; }
    function TYPE_CHAR(b,i)    {
        x = String.fromCharCode.apply(null, b.slice(0,1)); i+=1;
        return {x , i}
    }
    function TYPE_CSTRING(b,i) { return TICParseCString(b,i); }
    function TYPE_U8(b,i)      { x = BytesToInt64(b,i,"U8"); i+=1; return { x ,  i} }
    function TYPE_U16(b,i)     { x = BytesToInt64(b,i,"U16"); i+=2; return { x ,  i} }
    function TYPE_I16(b,i)     { x = BytesToInt64(b,i,"I16"); i+=2; return { x ,  i} }
    function TYPE_U24CSTRING(b,i) {
        var x = {};
        x["Value"] = BytesToInt64(b,i,"U24"); i += 3;
        s = TICParseCString(b,i);
        x["Label"] = s.x; i = s.i;
        return {x, i}
    };
    function TYPE_U24(b,i)     { x = BytesToInt64(b,i,"U24"); i+=3; return { x , i} }
    function TYPE_4U24(b,i)    {
        var x = {};
        for (i=1;i<=4;i++) { x["Value_"+i] = BytesToInt64(b,i,"U24"); i += 3; }
        return {x, i}
    };
    function TYPE_6U24(b,i)    {
        var x = {};
        for (i=1;i<=4;i++) { x["Value_"+i] = BytesToInt64(b,i,"U24"); i += 3; }
        return {x, i}
    }
    function TYPE_U32(b,i)     { x = BytesToInt64(b,i,"U32"); i+=4; return { x , i} }
    function TYPE_FLOAT(b,i)   { x = BytesToFloat32(b,i); i+=4; return { x , i} }
    function TYPE_DMYhms(b,i)  { return TICParseDMYhms(b,i); }
    function TYPE_tsDMYhms(b,i){ return TICParseTimeStamp(b,i); };
    function TYPE_DMYhmsCSTRING(b,i) {
        var x = {};
        var d = TICParseDMYhms(b,i); x["Date"]=d.x; ;
        var s = TICParseCString(b,d.i);x["Label"]=s.x;
        i = s.i;
        return {x, i};
    }
    function TYPE_E_PT(b,i)     { return TICParseEnum(b,i,E_PT); }
    function TYPE_E_STD_PT(b,i) { return TICParseEnum(b,i,E_STD_PT); }
    function TYPE_tsDMYhms_E_PT(b,i) {
        var x = {};
        var d = TICParseTimeStamp(b,i);
        var e = TICParseEnum(b,d.i,E_PT);
        i = e.i;
        return {x , i}
    }
    function TYPE_hmDM(b,i) {
        var x = {};
        h = zeroPad(BytesToInt64(b,i,"U8"),2); i++;
        m = zeroPad(BytesToInt64(b,i,"U8"),2); i++;
        D = zeroPad(BytesToInt64(b,i,"U8"),2); i++;
        M = zeroPad(BytesToInt64(b,i,"U8"),2); i++;
        x = D + "/" + M + " " + h + ":" + m;
        return {x, i}
    }
    function TYPE_DMh(b,i) {
        var x = {};
        D = zeroPad(BytesToInt64(b,i,"U8"),2); i++;
        M = zeroPad(BytesToInt64(b,i,"U8"),2); i++;
        h = zeroPad(BytesToInt64(b,i,"U8"),2); i++;
        x = D + "/" + M + " " + h ;
        return {x, i}
    }
    function TYPE_hm(b,i) {
        var x = {};
        h = zeroPad(BytesToInt64(b,i,"U8"),2); i++;
        m = zeroPad(BytesToInt64(b,i,"U8"),2); i++;
        x = h + ":" + m;
        return {x, i}
    }
    function TYPE_SDMYhms(b,i) {
        var x = {};
        s = TICParseNString(b,i, 1);
        d = TICParseDMYhms(b,s.i);
        x["S"]=s.x;
        x["Date"]=d.x;
        i=d.i;
        return {x,i}
    }
    function TYPE_SDMYhmsU8(b,i) {
        var x = {};
        s = TICParseNString(b,i, 1);
        d = TICParseDMYhms(b,s.i);
        n = BytesToInt64(b,i,"U8"); i = d.i + 1;
        x["S"]=s.x;
        x["Date"]=d.x;
        x["Value"]=n;
        return {x , i}
    }
    function TYPE_SDMYhmsU16(b,i) {
        var x = {};
        s = TICParseNString(b,i, 1);
        d = TICParseDMYhms(b,s.i);
        n = BytesToInt64(b,i,"U16"); i = d.i + 1;
        x["S"]=s.x;
        x["Date"]=d.x;
        x["Value"]=n;
        return {x , i}
    }
    function TYPE_SDMYhmsU24(b,i) {
        var x = {};
        s = TICParseNString(b,i, 1);
        d = TICParseDMYhms(b,s.i);
        n = BytesToInt64(b,i,"U24"); i = d.i + 1;
        x["S"]=s.x;
        x["Date"]=d.x;
        x["Value"]=n;
        return {x , i}
    }
    function TYPE_BF32xbe(b,i) {
        var x = BytesToHexStr(b.slice(i,2)); i+=4;
        i+=4
        return {x , i}
    }   /* Bitfield 32 bits heXa Big Endian */
    function TYPE_HEXSTRING(b,i) {
        var x = BytesToHexStr(b.slice(i+1,i+1+b[i]));
        i+=b[i]+1;
        d = {x, i}
        return {x , i}
    }/* displayed as hexadecimal string Stored as <Size>+<byte string> */
    function TYPE_E_DIV(b,i) { return TICParseEnum(b,i,E_DIV); }
    function TYPE_U24_E_DIV(b,i) {
        var x = {};
        dd = BytesToInt64(b,i,"U24"); i += 3;
        x.Value = dd;
        e = TICParseEnum(b,i,E_DIV);
        x.Label = e.x; i = e.i;
        return {x, i}
    }
    function TYPE_E_CONTRAT(b,i) { return TICParseEnum(b,i,E_CONTRAT); }
    function TYPE_E_STD_CONTRAT(b,i) { return TICParseEnum(b,i,E_STD_CONTRAT); }
    function TYPE_11hhmmSSSS(b,i) {
        var x = []
        for (var j = 0 ; j < 11; j++) {
            y = {};
            h = zeroPad(BytesToInt64(b,i,"U8"),2); i++;
            if (h == 0xFF) {
                y["Status"] = "NONUTILE"
            } else {
                m = zeroPad(BytesToInt64(b,i,"U8"),2); i++;
                s = BytesToHexStr(b.slice(i,2)); i++;
                y["Time"] = h + ":" + m;
                y["Status"] = s;
                i+=b[i]+1;
            }
            x.push(y);
        }
        return {x, i}
    } /* New type for PJOURF+1 / PPOINTE of Linky. */
    /* 11 Blocs of 8 Bytes (hhmmSSSS) space separated values are compressed as follow */
    /* hh 1 byte Hour, mm 1 byte Minute, SSSS two bytes bitfield */
    /* Notes: */
    /* - Delta comparison: */
    /*   hh and mm are usual for delta comparison */
    /*   SSSS is compared as bitfield each bit set may trig an event if changed */
    /* - An unused field is defined as follow: */
    /*   hh = 0xFF and No other bytes used in the binarized form */
    /*   "NONUTILE" string in the TIC ASCII format */
    function TYPE_BF8d(b,i) {
        x = BytesToInt64(b,i,"U8"); i++;
        return {x , i}
    }		/* Bitfield de 8 bit with TIC decimal representation (0 à 255) */



    // ---------------------------------------------------------
    // OUTPUT FORMATS
    // TODO ... At the moment format are not used (Cf c language TIC decoder)
    function FMT_UNDEF(x) { return(x); };

    function FMT_s(x)     { return(x); }; // %s
    function FMT_PREAVIS_PT(x) { return(x); }; // TD-%s
    function FMT_c(x)     { return(x); }; // %c
    function FMT_02X(x)   { return(x); }; // %02x
    function FMT_d(x)     { return(x); }; // %d
    function FMT_ld(x)    { return(x); }; // %ld

    function FMT_02d(x)   { return(x); }; // %02d
    function FMT_03d(x)   { return(x); }; // %03d
    function FMT_05d(x)   { return(x); }; // %05d
    /*
        function FMT_07d(x)   { return(x); // %07d
        function FMT_09d(x)   { return(x); // %09d
    */
    function FMT_05ld(x)  { return(x); }; // %05d
    function FMT_06ld(x)  { return(x); }; // %06d
    function FMT_07ld(x)  { return(x); }; // %07d
    function FMT_09ld(x)  { return(x); }; // %09d

    function FMT_d_percent(x) { return(x); }; // %d%%

    function FMT_d_s(x)    { return(x); }; //%ds

    function FMT_d_kW(x)    { return(x); }; // %dkW
    function FMT_d_kvar(x)  { return(x); }; // %dkvar

    function FMT_05d_kwh(x) { return(x); }; // %05ldkwh
    function FMT_ld_Wh(x)   { return(x); }; // %ldWh
    function FMT_05ld_Wh(x) { return(x); }; // 05ldWh
    function FMT_05ld_varh(x) { return(x); }; // %05ldvarh
    function FMT_ld_varh(x) { return(x); }; // %ldvarh
    function FMT_ld_VAh(x)  { return(x); }; // %ldVAh

    function FMT_d_V(x)     { return(x); }; // %dV

    function FMT_d_kWh(x)   { return(x); }; // %dkWh
    function FMT_ld_kWh(x)  { return(x); }; // %07ldkWh
    function FMT_d_kvarh(x) { return(x); }; // %dkvarh
    function FMT_ld_kvarh(x) { return(x); }; // %07ldkvarh

    function FMT_05_2f(x)      { return(x); }; // %05.2f"

    // ============================================
    // PROFILS DEFINITION
    // ============================================

    // clustID: 0x0053, Attribute ID : 0xii00
    //-----------------------------------------
    const ICE_General = [
        ["CONTRAT",	TYPE_CSTRING,0,FMT_s],
        ["DATECOUR",TYPE_DMYhms,0,FMT_UNDEF],
        ["DATE",TYPE_DMYhms,0,FMT_UNDEF],
        ["EA",		TYPE_U24,0,FMT_05ld_Wh],
        ["ERP",		TYPE_U24,0,FMT_05ld_varh],
        ["PTCOUR",	TYPE_CSTRING,0,FMT_s],
        ["PREAVIS",	TYPE_CSTRING,0,FMT_s],
        ["MODE",	TYPE_EMPTY,0,FMT_s],
        // Byte 1
        ["DATEPA1",	TYPE_DMYhms,0,FMT_UNDEF],
        ["PA1",		TYPE_U16,0,FMT_d_kW],
        ["DATEPA2",	TYPE_DMYhms,0,FMT_UNDEF],
        ["PA2",		TYPE_U16,0,FMT_d_kW],
        ["DATEPA3",	TYPE_DMYhms,0,FMT_UNDEF],
        ["PA3",		TYPE_U16,0,FMT_d_kW],
        ["DATEPA4",	TYPE_DMYhms,0,FMT_UNDEF],
        ["PA4",		TYPE_U16,0,FMT_d_kW],
        // Byte 2
        ["DATEPA5",	TYPE_DMYhms,0,FMT_UNDEF],
        ["PA5",		TYPE_U16,0,FMT_d_kW],
        ["DATEPA6",	TYPE_DMYhms,0,FMT_UNDEF],
        ["PA6",		TYPE_U16,0,FMT_d_kW],
        ["*p*",	TYPE_U24,0,FMT_05ld],
        //["*p*",	TYPE_U24,ATTRIBUTE_NOT_MANAGED_FIELD,FMT_05ld],
        ["KDC",		TYPE_U8,0,FMT_d_percent],
        ["KDCD",	TYPE_U8,0,FMT_d_percent],
        ["TGPHI",	TYPE_FLOAT,0,FMT_05_2f],
        // Byte 3
        ["PSP",		TYPE_U16,0,FMT_d_kW],
        ["PSPM",	TYPE_U16,0,FMT_d_kW],
        ["PSHPH",	TYPE_U16,0,FMT_d_kW],
        ["PSHPD",	TYPE_U16,0,FMT_d_kW],
        ["PSHCH",	TYPE_U16,0,FMT_d_kW],
        ["PSHCD",	TYPE_U16,0,FMT_d_kW],
        ["PSHPE",	TYPE_U16,0,FMT_d_kW],
        ["PSHCE",	TYPE_U16,0,FMT_d_kW],
        // Byte 4
        ["PSJA",	TYPE_U16,0,FMT_d_kW],
        ["PSHH",	TYPE_U16,0,FMT_d_kW],
        ["PSHD",	TYPE_U16,0,FMT_d_kW],
        ["PSHM",	TYPE_U16,0,FMT_d_kW],
        ["PSDSM",	TYPE_U16,0,FMT_d_kW],
        ["PSSCM",	TYPE_U16,0,FMT_d_kW],
        ["MODE",	TYPE_EMPTY,0,FMT_s],
        ["PA1MN",	TYPE_U16,0,FMT_d_kW],
        // Byte 5
        ["PA10MN",	TYPE_U16,0,FMT_d_kW],
        ["PREA1MN",	TYPE_I16,0,FMT_d_kvar],
        ["PREA10MN",TYPE_I16,0,FMT_d_kvar],
        ["TGPHI",	TYPE_FLOAT,0,FMT_05_2f],
        ["U10MN",	TYPE_U16,0,FMT_d_V]
    ];

    // clustID: 0x0053, Attribute ID : 0xii01
    //-----------------------------------------
    const ICE_p = [
        //Byte 0
        ["DEBUTp",	TYPE_DMYhms,0,FMT_UNDEF,0],
        ["FINp",	TYPE_DMYhms,0,FMT_UNDEF,6],
        ["CAFp",	TYPE_U16,0,FMT_05d,12],

        ["DATEEAp",TYPE_DMYhms,0,FMT_UNDEF,14],
        ["EApP",	TYPE_U24,0,FMT_ld_kWh,20],
        ["EApPM",	TYPE_U24,0,FMT_ld_kWh,23],
        ["EApHCE",	TYPE_U24,0,FMT_ld_kWh,26],
        ["EApHCH",	TYPE_U24,0,FMT_ld_kWh,29],
        //Byte 1
        ["EApHH",	TYPE_U24,0,FMT_ld_kWh,32],
        ["EApHCD",	TYPE_U24,0,FMT_ld_kWh,35],
        ["EApHD",	TYPE_U24,0,FMT_ld_kWh,38],
        ["EApJA",	TYPE_U24,0,FMT_ld_kWh,41],
        ["EApHPE",	TYPE_U24,0,FMT_ld_kWh,44],
        ["EApHPH",	TYPE_U24,0,FMT_ld_kWh,47],
        ["EApHPD",	TYPE_U24,0,FMT_ld_kWh,50],
        ["EApSCM",	TYPE_U24,0,FMT_ld_kWh,53],
        // Byte 2
        ["EApHM",	TYPE_U24,0,FMT_ld_kWh,56],
        ["EApDSM",	TYPE_U24,0,FMT_ld_kWh,59],

        ["DATEERPp",TYPE_DMYhms,0,FMT_UNDEF,62],
        ["ERPpP",	TYPE_U24,0,FMT_ld_kvarh,68],
        ["ERPpPM",	TYPE_U24,0,FMT_ld_kvarh,71],
        ["ERPpHCE",	TYPE_U24,0,FMT_ld_kvarh,74],
        ["ERPpHCH",	TYPE_U24,0,FMT_ld_kvarh,77],
        ["ERPpHH",	TYPE_U24,0,FMT_ld_kvarh,80],
        // Byte 3
        ["ERPpHCD",	TYPE_U24,0,FMT_ld_kvarh,83],
        ["ERPpHD",	TYPE_U24,0,FMT_ld_kvarh,86],
        ["ERPpJA",	TYPE_U24,0,FMT_ld_kvarh,89],
        ["ERPpHPE",	TYPE_U24,0,FMT_ld_kvarh,92],
        ["ERPpHPH",	TYPE_U24,0,FMT_ld_kvarh,95],
        ["ERPpHPD",	TYPE_U24,0,FMT_ld_kvarh,98],
        ["ERPpSCM",	TYPE_U24,0,FMT_ld_kvarh,101],
        ["ERPpHM",	TYPE_U24,0,FMT_ld_kvarh,104],
        // Byte 4
        ["ERPpDSM",	TYPE_U24,0,FMT_ld_kvarh,107],

        ["DATEERNp",TYPE_DMYhms,0,FMT_UNDEF,110],
        ["ERNpP",	TYPE_U24,0,FMT_ld_kvarh,116],
        ["ERNpPM",	TYPE_U24,0,FMT_ld_kvarh,119],
        ["ERNpHCE",	TYPE_U24,0,FMT_ld_kvarh,122],
        ["ERNpHCH",	TYPE_U24,0,FMT_ld_kvarh,125],
        ["ERNpHH",	TYPE_U24,0,FMT_ld_kvarh,128],
        ["ERNpHCD",	TYPE_U24,0,FMT_ld_kvarh,131],
        // Byte 5
        ["ERNpHD",	TYPE_U24,0,FMT_ld_kvarh,134],
        ["ERNpJA",	TYPE_U24,0,FMT_ld_kvarh,137],
        ["ERNpHPE",	TYPE_U24,0,FMT_ld_kvarh,140],
        ["ERNpHPH",	TYPE_U24,0,FMT_ld_kvarh,143],
        ["ERNpHPD",	TYPE_U24,0,FMT_ld_kvarh,146],
        ["ERNpSCM",	TYPE_U24,0,FMT_ld_kvarh,149],
        ["ERNpHM",	TYPE_U24,0,FMT_ld_kvarh,152],
        ["ERNpDSM",	TYPE_U24,0,FMT_ld_kvarh,155]
        // Byte 6
    ];

    // clustID: 0x0053, Attribute ID : 0xii02
    //-----------------------------------------
    const ICE_p1 = [
        //Byte 0
        ["DEBUTp1",	TYPE_DMYhms,0,FMT_UNDEF,0],
        ["FINp1",	TYPE_DMYhms,0,FMT_UNDEF,6],
        ["CAFp1",	TYPE_U16,0,FMT_05d,12],

        ["DATEEAp1",TYPE_DMYhms,0,FMT_UNDEF,14],
        ["EAp1P",	TYPE_U24,0,FMT_ld_kWh,20],
        ["EAp1PM",	TYPE_U24,0,FMT_ld_kWh,23],
        ["EAp1HCE",	TYPE_U24,0,FMT_ld_kWh,26],
        ["EAp1HCH",	TYPE_U24,0,FMT_ld_kWh,29],
        //Byte 1
        ["EAp1HH",	TYPE_U24,0,FMT_ld_kWh,32],
        ["EAp1HCD",	TYPE_U24,0,FMT_ld_kWh,35],
        ["EAp1HD",	TYPE_U24,0,FMT_ld_kWh,38],
        ["EAp1JA",	TYPE_U24,0,FMT_ld_kWh,41],
        ["EAp1HPE",	TYPE_U24,0,FMT_ld_kWh,44],
        ["EAp1HPH",	TYPE_U24,0,FMT_ld_kWh,47],
        ["EAp1HPD",	TYPE_U24,0,FMT_ld_kWh,50],
        ["EAp1SCM",	TYPE_U24,0,FMT_ld_kWh,53],
        // Byte 2
        ["EAp1HM",	TYPE_U24,0,FMT_ld_kWh,56],
        ["EAp1DSM",	TYPE_U24,0,FMT_ld_kWh,59],

        ["DATEERPp1",TYPE_DMYhms,0,FMT_UNDEF,62],
        ["ERPp1P",	TYPE_U24,0,FMT_ld_kvarh,68],
        ["ERPp1PM",	TYPE_U24,0,FMT_ld_kvarh,71],
        ["ERPp1HCE",TYPE_U24,0,FMT_ld_kvarh,74],
        ["ERPp1HCH",TYPE_U24,0,FMT_ld_kvarh,77],
        ["ERPp1HH",	TYPE_U24,0,FMT_ld_kvarh,80],
        // Byte 3
        ["ERPp1HCD",TYPE_U24,0,FMT_ld_kvarh,83],
        ["ERPp1HD",	TYPE_U24,0,FMT_ld_kvarh,86],
        ["ERPp1JA",	TYPE_U24,0,FMT_ld_kvarh,89],
        ["ERPp1HPE",TYPE_U24,0,FMT_ld_kvarh,92],
        ["ERPp1HPH",TYPE_U24,0,FMT_ld_kvarh,95],
        ["ERPp1HPD",TYPE_U24,0,FMT_ld_kvarh,98],
        ["ERPp1SCM",TYPE_U24,0,FMT_ld_kvarh,101],
        ["ERPp1HM",	TYPE_U24,0,FMT_ld_kvarh,104],
        // Byte 4
        ["ERPp1DSM",TYPE_U24,0,FMT_ld_kvarh,107],

        ["DATEERNp1",TYPE_DMYhms,0,FMT_UNDEF,110],
        ["ERNp1P",	TYPE_U24,0,FMT_ld_kvarh,116],
        ["ERNp1PM",	TYPE_U24,0,FMT_ld_kvarh,119],
        ["ERNp1HCE",TYPE_U24,0,FMT_ld_kvarh,122],
        ["ERNp1HCH",TYPE_U24,0,FMT_ld_kvarh,125],
        ["ERNp1HH",	TYPE_U24,0,FMT_ld_kvarh,128],
        ["ERNp1HCD",TYPE_U24,0,FMT_ld_kvarh,131],
        // Byte 5
        ["ERNp1HD",	TYPE_U24,0,FMT_ld_kvarh,134],
        ["ERNp1JA",	TYPE_U24,0,FMT_ld_kvarh,137],
        ["ERNp1HPE",TYPE_U24,0,FMT_ld_kvarh,140],
        ["ERNp1HPH",TYPE_U24,0,FMT_ld_kvarh,143],
        ["ERNp1HPD",TYPE_U24,0,FMT_ld_kvarh,146],
        ["ERNp1SCM",TYPE_U24,0,FMT_ld_kvarh,149],
        ["ERNp1HM",	TYPE_U24,0,FMT_ld_kvarh,152],
        ["ERNp1DSM",TYPE_U24,0,FMT_ld_kvarh,155]
        // Byte 6
    ];


    // clustID: 0x0054, Attribute ID : 0xii00
    //-----------------------------------------
    const CBE = [
        // Byte 0
        ["ADIR1",   TYPE_U16,0,FMT_03d],
        ["ADIR2",   TYPE_U16,0,FMT_03d],
        ["ADIR3",   TYPE_U16,0,FMT_03d],
        ["ADCO",    TYPE_CSTRING,0,FMT_s],
        ["OPTARIF", TYPE_CSTRING,0,FMT_s],
        ["ISOUSC",  TYPE_U8,0,FMT_02d],
        ["BASE",    TYPE_U32,0,FMT_09ld],
        ["HCHC",    TYPE_U32,0,FMT_09ld],
        // Byte 1
        ["HCHP",    TYPE_U32,0,FMT_09ld],
        ["EJPHN",   TYPE_U32,0,FMT_09ld],
        ["EJPHPM",	TYPE_U32,0,FMT_09ld],
        ["BBRHCJB",	TYPE_U32,0,FMT_09ld],
        ["BBRHPJB",	TYPE_U32,0,FMT_09ld],
        ["BBRHCJW", TYPE_U32,0,FMT_09ld],
        ["BBRHPJW",	TYPE_U32,0,FMT_09ld],
        ["BBRHCJR", TYPE_U32,0,FMT_09ld],
        // Byte 2
        ["BBRHPJR", TYPE_U32,0,FMT_09ld],
        ["PEJP",    TYPE_U8,0,FMT_02d],
        ["GAZ",    	TYPE_U32,0,FMT_07ld],
        ["AUTRE",   TYPE_U32,0,FMT_07ld],
        ["PTEC",    TYPE_CSTRING,0,FMT_s],
        ["DEMAIN",  TYPE_CSTRING,0,FMT_s],
        ["IINST",   TYPE_U16,0,FMT_03d],
        ["IINST1",  TYPE_U16,0,FMT_03d],
        // Byte 3
        ["IINST2",	TYPE_U16,0,FMT_03d],
        ["IINST3",  TYPE_U16,0,FMT_03d],
        ["ADPS",    TYPE_U16,0,FMT_03d],
        ["IMAX",    TYPE_U16,0,FMT_03d],
        ["IMAX1",   TYPE_U16,0,FMT_03d],
        ["IMAX2",   TYPE_U16,0,FMT_03d],
        ["IMAX3",   TYPE_U16,0,FMT_03d],
        ["PMAX",    TYPE_U32,0,FMT_05ld],
        // Byte 4
        ["PAPP",    TYPE_U32,0,FMT_05ld],
        ["HHPHC",   TYPE_CHAR,0,FMT_c],
        ["MOTDETAT",TYPE_CSTRING,0,FMT_s],
        ["PPOT",    TYPE_U8,0,FMT_02X]
    ];


    // clustID: 0x0055, Attribute ID : 0xii00
    //-----------------------------------------
    const CJE = [
        // Byte 0
        ["JAUNE",	TYPE_hmDM,0,FMT_UNDEF],		// [hh:mn:jj:mm]:pt:dp:abcde:kp
        ["JAUNE",	TYPE_CSTRING,0,FMT_s],	// pt
        ["JAUNE",	TYPE_CSTRING,0,FMT_s],  // dp
        ["JAUNE",	TYPE_U24,0,FMT_05ld],	// abcde
        ["JAUNE",	TYPE_U8,0,FMT_02d],		// kp
        ["ENERG",	TYPE_6U24,0,FMT_06ld],		// 111111:222222:...:666666
        ["ENERG",	TYPE_U24,0,FMT_06ld],		// 222222
        ["ENERG",	TYPE_U24,0,FMT_06ld],		// 333333
        // Byte 1
        ["ENERG",	TYPE_U24,0,FMT_06ld],		// 444444
        ["ENERG",	TYPE_U24,0,FMT_06ld],		// 555555
        ["ENERG",	TYPE_U24,0,FMT_06ld],		// 666666
        ["PERCC",	TYPE_DMh,0,FMT_UNDEF],		// jj:mm:hh[:cg]
        ["PERCC",	TYPE_U8,0,FMT_02d],		// cg
        ["PMAXC",	TYPE_4U24,0,FMT_05ld],		// 11111:22222:...:44444
        ["PMAXC",	TYPE_U24,0,FMT_05ld],		// 22222
        ["PMAXC",	TYPE_U24,0,FMT_05ld],		// 33333
        // Byte 2
        ["PMAXC",	TYPE_U24,0,FMT_05ld],		// 44444
        ["TDEPA",	TYPE_4U24,0,FMT_05ld],		// 11111:22222:...:44444
        ["TDEPA",	TYPE_U24,0,FMT_05ld],		// 22222
        ["TDEPA",	TYPE_U24,0,FMT_05ld],		// 33333
        ["TDEPA",	TYPE_U24,0,FMT_05ld],		// 44444
        ["PERCP",	TYPE_DMh,0,FMT_UNDEF],		// [jj:mm:hh]:cg
        ["PERCP",	TYPE_U8,0,FMT_02d],		// cg
        ["PMAXP",	TYPE_4U24,0,FMT_05ld],		// 11111:22222:...:44444
        // Byte 3
        ["PMAXP",	TYPE_U24,0,FMT_05ld],		// 22222
        ["PMAXP",	TYPE_U24,0,FMT_05ld],		// 33333
        ["PMAXP",	TYPE_U24,0,FMT_05ld],		// 44444
        ["PSOUSC",	TYPE_4U24,0,FMT_05ld],		// 11111:22222:...:44444
        ["PSOUSC",	TYPE_U24,0,FMT_05ld],		// 22222
        ["PSOUSC",	TYPE_U24,0,FMT_05ld],		// 33333
        ["PSOUSC",	TYPE_U24,0,FMT_05ld],		// 44444
        ["PSOUSP",	TYPE_4U24,0,FMT_05ld],		// 11111:22222:...:44444
        // Byte 4
        ["PSOUSP",	TYPE_U24,0,FMT_05ld],		// 22222
        ["PSOUSP",	TYPE_U24,0,FMT_05ld],		// 33333
        ["PSOUSP",	TYPE_U24,0,FMT_05ld],		// 44444
        ["FCOU",	TYPE_hm,0,FMT_UNDEF],		// [hh:mn]:dd
        ["FCOU",	TYPE_U8,0,FMT_02d]		// dd
    ];


    // clustID: 0x0056, Attribute ID : 0xii00
    //-----------------------------------------
    const STD = [
        // Byte 0
        ["ADSC",    TYPE_CSTRING,0,FMT_s],
        ["VTIC",    TYPE_U8,0,FMT_02d],
        ["DATE",    TYPE_SDMYhms,0,FMT_UNDEF],
        ["NGTF",    TYPE_E_STD_CONTRAT,0,FMT_s],
        ["LTARF",   TYPE_E_STD_PT,0,FMT_s],
        ["EAST",    TYPE_U32,0,FMT_09ld],
        ["EASF01",  TYPE_U32,0,FMT_09ld],
        ["EASF02",  TYPE_U32,0,FMT_09ld],
        // Byte 1
        ["EASF03",  TYPE_U32,0,FMT_09ld],
        ["EASF04",  TYPE_U32,0,FMT_09ld],
        ["EASF05",  TYPE_U32,0,FMT_09ld],
        ["EASF06",  TYPE_U32,0,FMT_09ld],
        ["EASF07",  TYPE_U32,0,FMT_09ld],
        ["EASF08",  TYPE_U32,0,FMT_09ld],
        ["EASF09",  TYPE_U32,0,FMT_09ld],
        ["EASF10",  TYPE_U32,0,FMT_09ld],
        // Byte 2
        ["EASD01",  TYPE_U32,0,FMT_09ld],
        ["EASD02",  TYPE_U32,0,FMT_09ld],
        ["EASD03",  TYPE_U32,0,FMT_09ld],
        ["EASD04",  TYPE_U32,0,FMT_09ld],
        ["EAIT",    TYPE_U32,0,FMT_09ld],
        ["ERQ1",    TYPE_U32,0,FMT_09ld],
        ["ERQ2",    TYPE_U32,0,FMT_09ld],
        ["ERQ3",    TYPE_U32,0,FMT_09ld],
        // Byte 3
        ["ERQ4",    TYPE_U32,0,FMT_09ld],
        ["IRMS1",   TYPE_U16,0,FMT_03d],
        ["IRMS2",   TYPE_U16,0,FMT_03d],
        ["IRMS3",   TYPE_U16,0,FMT_03d],
        ["URMS1",   TYPE_U16,0,FMT_03d],
        ["URMS2",   TYPE_U16,0,FMT_03d],
        ["URMS3",   TYPE_U16,0,FMT_03d],
        ["PREF",    TYPE_U8,0,FMT_02d],
        // Byte 4
        ["PCOUP",   TYPE_U8,0,FMT_02d],
        ["SINSTS",  TYPE_U24,0,FMT_05ld],
        ["SINSTS1", TYPE_U24,0,FMT_05ld],
        ["SINSTS2", TYPE_U24,0,FMT_05ld],
        ["SINSTS3", TYPE_U24,0,FMT_05ld],
        ["SMAXSN",   TYPE_SDMYhmsU24,0,FMT_05ld],
        ["SMAXSN1",  TYPE_SDMYhmsU24,0,FMT_05ld],
        ["SMAXSN2",  TYPE_SDMYhmsU24,0,FMT_05ld],
        // Byte 5
        ["SMAXSN3",  TYPE_SDMYhmsU24,0,FMT_05ld],
        ["SMAXSN?1", TYPE_SDMYhmsU24,0,FMT_05ld],
        ["SMAXSN1?1",TYPE_SDMYhmsU24,0,FMT_05ld],
        ["SMAXSN2?1",TYPE_SDMYhmsU24,0,FMT_05ld],
        ["SMAXSN3?1",TYPE_SDMYhmsU24,0,FMT_05ld],
        ["SINSTI",  TYPE_U24,0,FMT_05ld],
        ["SMAXIN",  TYPE_SDMYhmsU24,0,FMT_05ld],
        ["SMAXIN-1",TYPE_SDMYhmsU24,0,FMT_05ld],
        // Byte 6
        ["CCASN",   TYPE_SDMYhmsU24,0,FMT_05ld],
        ["CCASN?1", TYPE_SDMYhmsU24,0,FMT_05ld],
        ["CCAIN",   TYPE_SDMYhmsU24,0,FMT_05ld],
        ["CCAIN?1", TYPE_SDMYhmsU24,0,FMT_05ld],
        ["UMOY1",   TYPE_SDMYhmsU16,0,FMT_03d],
        ["UMOY2",   TYPE_SDMYhmsU16,0,FMT_03d],
        ["UMOY3",   TYPE_SDMYhmsU16,0,FMT_03d],
        ["STGE",    TYPE_BF32xbe,0,FMT_UNDEF],
        // Byte 7
        ["DPM1",    TYPE_SDMYhmsU8,0,FMT_02d],
        ["FPM1",    TYPE_SDMYhmsU8,0,FMT_02d],
        ["DPM2",    TYPE_SDMYhmsU8,0,FMT_02d],
        ["FPM2",    TYPE_SDMYhmsU8,0,FMT_02d],
        ["DPM3",    TYPE_SDMYhmsU8,0,FMT_02d],
        ["FPM3",    TYPE_SDMYhmsU8,0,FMT_02d],
        ["MSG1",    TYPE_CSTRING,0,FMT_s],
        ["MSG2",    TYPE_CSTRING,0,FMT_s],
        // Byte 8
        ["PRM",     TYPE_CSTRING,0,FMT_s ],
        ["RELAIS",  TYPE_BF8d,0,FMT_03d ],
        ["NTARF",   TYPE_U8,0,FMT_02d ],
        ["NJOURF",  TYPE_U8,0,FMT_02d ],
        ["NJOURF+1",TYPE_U8,0,FMT_02d ],
        ["PJOURF+1",TYPE_11hhmmSSSS,0,FMT_UNDEF ],
        ["PPOINTE", TYPE_11hhmmSSSS,0,FMT_UNDEF ]
    ];

    // clustID: 0x0057, Attribute ID : 0xii00
    //-----------------------------------------
    const PMEPMI = [
        //Byte 0
        ["TRAME",   TYPE_E_DIV,0,FMT_s], /* Uniquement Palier 2013 */
        ["ADS",     TYPE_HEXSTRING,0,FMT_UNDEF], /* Uniquement Palier 2013 */
        ["MESURES1",TYPE_E_CONTRAT,0,FMT_s],
        ["DATE",    TYPE_DMYhms,0,FMT_UNDEF],
        ["EA_s",	TYPE_U24,0,FMT_ld_Wh],
        ["ER+_s",	TYPE_U24,0,FMT_ld_varh],
        ["ER-_s",   TYPE_U24,0,FMT_ld_varh],
        ["EAPP_s",	TYPE_U24,0,FMT_ld_VAh],
        //Byte 1
        ["EA_i",    TYPE_U24,0,FMT_ld_Wh],
        ["ER+_i",   TYPE_U24,0,FMT_ld_varh],
        ["ER-_i",   TYPE_U24,0,FMT_ld_varh],
        ["EAPP_i",	TYPE_U24,0,FMT_ld_VAh],
        ["PTCOUR1", TYPE_E_PT,0,FMT_s],
        ["TARIFDYN",TYPE_E_DIV,0,FMT_s],
        ["ETATDYN1",TYPE_E_PT,0,FMT_s],
        ["PREAVIS1",TYPE_E_PT,0,FMT_PREAVIS_PT],
        //Byte 2
        ["TDYN1CD", TYPE_tsDMYhms_E_PT,0,FMT_UNDEF],
        ["TDYN1CF", TYPE_tsDMYhms_E_PT,0,FMT_UNDEF],
        ["TDYN1FD", TYPE_tsDMYhms_E_PT,0,FMT_UNDEF],
        ["TDYN1FF", TYPE_tsDMYhms_E_PT,0,FMT_UNDEF],
        ["MODE",	TYPE_E_DIV,0,FMT_s],
        ["CONFIG",	TYPE_E_DIV,0,FMT_s],
        ["DATEPA1",	TYPE_DMYhms,0,FMT_UNDEF],
        ["PA1_s",	TYPE_U16,0,FMT_d_kW],
        // Byte 3
        ["PA1_i",	TYPE_U16,0,FMT_d_kW],
        ["DATEPA2",	TYPE_tsDMYhms,0,FMT_UNDEF],
        ["PA2_s",	TYPE_U16,0,FMT_d_kW],
        ["PA2_i",	TYPE_U16,0,FMT_d_kW],
        ["DATEPA3",	TYPE_tsDMYhms,0,FMT_UNDEF],
        ["PA3_s",	TYPE_U16,0,FMT_d_kW],
        ["PA3_i",	TYPE_U16,0,FMT_d_kW],
        ["DATEPA4",	TYPE_tsDMYhms,0,FMT_UNDEF],
        //Byte 4
        ["PA4_s",	TYPE_U16,0,FMT_d_kW],
        ["PA4_i",	TYPE_U16,0,FMT_d_kW],
        ["DATEPA5",	TYPE_tsDMYhms,0,FMT_UNDEF],
        ["PA5_s",	TYPE_U16,0,FMT_d_kW],
        ["PA5_i",	TYPE_U16,0,FMT_d_kW],
        ["DATEPA6",	TYPE_tsDMYhms,0,FMT_UNDEF],
        ["PA6_s",	TYPE_U16,0,FMT_d_kW],
        ["PA6_i",	TYPE_U16,0,FMT_d_kW],
        //Byte 5
        ["DebP",    TYPE_tsDMYhms,0,FMT_UNDEF],
        ["EAP_s",	TYPE_U24,0,FMT_d_kWh],
        ["EAP_i",  	TYPE_U24,0,FMT_d_kWh],
        ["ER+P_s",  TYPE_U24,0,FMT_d_kvarh],
        ["ER-P_s",  TYPE_U24,0,FMT_d_kvarh],
        ["ER+P_i",  TYPE_U24,0,FMT_d_kvarh],
        ["ER-P_i",  TYPE_U24,0,FMT_d_kvarh],
        ["DebP-1",  TYPE_tsDMYhms,0,FMT_UNDEF],
        //Byte 6
        ["FinP-1",  TYPE_tsDMYhms,0,FMT_UNDEF],
        ["EaP-1_s",	TYPE_U24,0,FMT_d_kWh],
        ["EaP-1_i",	TYPE_U24,0,FMT_d_kWh],
        ["ER+P-1_s",TYPE_U24,0,FMT_d_kvarh],
        ["ER-P-1_s",TYPE_U24,0,FMT_d_kvarh],
        ["ER+P-1_i",TYPE_U24,0,FMT_d_kvarh],
        ["ER-P-1_i",TYPE_U24,0,FMT_d_kvarh],
        ["PS",	    TYPE_U24_E_DIV,0,FMT_UNDEF],
        //Byte 7
        ["PREAVIS", TYPE_E_DIV,0,FMT_s],
        ["PA1MN",   TYPE_U16,0,FMT_d_kW],
        ["PMAX_s",	TYPE_U24_E_DIV,0,FMT_UNDEF],
        ["PMAX_i",	TYPE_U24_E_DIV,0,FMT_UNDEF],
        ["TGPHI_s",	TYPE_FLOAT,0,FMT_05_2f],
        ["TGPHI_i",	TYPE_FLOAT,0,FMT_05_2f],
        ["MESURES2",TYPE_E_CONTRAT,0,FMT_s],
        ["PTCOUR2",	TYPE_E_PT,0,FMT_s],
        //Byte 8
        ["ETATDYN2",TYPE_E_PT,0,FMT_s],
        ["PREAVIS2",TYPE_E_PT,0,FMT_PREAVIS_PT],
        ["TDYN2CD", TYPE_tsDMYhms_E_PT,0,FMT_UNDEF],
        ["TDYN2CF", TYPE_tsDMYhms_E_PT,0,FMT_UNDEF],
        ["TDYN2FD", TYPE_tsDMYhms_E_PT,0,FMT_UNDEF],
        ["TDYN2FF", TYPE_tsDMYhms_E_PT,0,FMT_UNDEF],
        ["DebP_2",  TYPE_tsDMYhms,0,FMT_UNDEF],
        ["EaP_s2",	TYPE_U24,0,FMT_d_kWh],
        //Byte 9
        ["DebP-1_2",TYPE_tsDMYhms,0,FMT_UNDEF],
        ["FinP-1_2",TYPE_tsDMYhms,0,FMT_UNDEF],
        ["EaP-1_s2",TYPE_U24,0,FMT_d_kWh],
        ["_DDMES1_",TYPE_U24,0,FMT_d_s]
    ];


    // ============================================
    // ============================================
    // DECODING PART
    // ============================================
    // ============================================

    // Init object container for decoded fields
    data = []

    // Select PROFIL according to cluster/attribute
    if (clustID == 0x0053) {
        if (attributeID & 0x00FF == 0)	{
            profil = ICE_General;
            data["_TICFrameType"]="ICE Generale";
        } else if (attributeID & 0x00FF == 1)	{
            profil = ICE_p;
            data["_TICFrameType"]="ICE Periode P";
        } else if (attributeID & 0x0001 == 2)	{
            profil = ICE_p1;
            data["_TICFrameType"]="ICE Periode P moins 1";
        } else {
            return data;
        }
    } else if (clustID == 0x0054) {
        profil = CBE;
        data["_TICFrameType"]="CBE/Historique";
    } else if (clustID == 0x0055) {
        profil = CJE;
        data["_TICFrameType"]="CJE";
    } else if (clustID == 0x0056) {
        profil = STD;
        data["_TICFrameType"]="Standard";
    } else if (clustID == 0x0057) {
        profil = PMEPMI;
        data["_TICFrameType"]="PMEPMI";
    } else {
        return data;
        data["_TICFrameType"]="Unexpected";
    }

    // Start Decoding descriptor
    let {DescSize, Indexes} = TICParseDescToIndexes(BytesAfterSize);

    var DescBytes = BytesAfterSize.slice(0,DescSize);
    var x = {}
    if ((DescBytes[0] & 0x80) == 0x80) {
        x.Obsolete = true;
    }
    x.Bytes = BytesToHexStr(DescBytes);
    x.Indexes = Indexes;
    data["_Descriptor"]= x;

    // Start effective fields decodings
    var bytesIndex = DescSize;
    for (var j=0; j<Indexes.length; j++) {
        fieldIndex = Indexes[j];
        d = profil[fieldIndex][1](BytesAfterSize,bytesIndex);
        data[profil[fieldIndex][0]] = profil[fieldIndex][3](d.x);
        bytesIndex=d.i;
    }

    return data;
}
function decimalToBitString(dec){
    var bitString = "";
    var bin = dec.toString(2);
    bitString += zeroPad(bin, 8);
    return bitString;
}
function int(value){
    return parseInt(value, 2)
}
function alarmShort(length, listMess, flag, bytes, decoded, i1){
    console.log("alarmShort")
    let i = 0
    while(flag === 0) {
        let bi = bytes[(i1+(length*i))]
        if (bi === undefined){
            decoded.zclheader.alarmmsg = listMess
            flag = 1
            break
        }
        let csd = decimalToBitString(bi)
        let index = int(csd[5])*4+int(csd[6])*2+int(csd[7])
        if ((csd[3] === "1") && (csd[4] === "0")) {
            let qual = ""
            if (csd[1] === "1") {
                qual = "exceed"
            } else {
                qual = "fall"
            }

            let mess = "alarm, criterion_index: "+index + ", mode: threshold" + ", crossing: "+qual
            listMess.push(mess)
        }
        if ((csd[3] === "0") && (csd[4] === "1")) {
            let mess = "alarm, criterion_index: "+ index + ", mode: delta"
            listMess.push(mess)
        }
        i+=1

    }
}
function alarmLong(clustID, attID, length, listMess, flag, bytes, decoded, i1, attribute_type, divider, ftype, field_index){
    console.log("alarmLong")
    console.log(ftype)
    let type = attribute_types[attribute_type]
    let function_type = ftype
    let field_driven = 0
    let size = type.size
    let name = type.name
    if (field_index!==undefined){
        field_driven = 1
        size=field[clustID][attID][field_index].size
    }

    if (size===2){
        alarmLong2Bytes(length, listMess, flag, bytes, decoded, i1,divider,name, function_type, field_driven, clustID, attID)
    } else if (size===4){
        alarmLong4Bytes(length, listMess, flag, bytes, decoded, i1,divider,name, function_type, field_driven, clustID, attID)
    } else if (size===1) {
        alarmLong1Bytes(length, listMess, flag, bytes, decoded, i1, divider,name, function_type, field_driven, clustID, attID)
    } else if (size===3){
        alarmLong3Bytes(length, listMess, flag, bytes, decoded, i1, divider,name, function_type, field_driven, clustID, attID)
    }

}

function alarmLong1Bytes(length, listMess, flag, bytes, decoded, i1,divider,name, function_type, field_driven, clustID, attID){
    let i = 0
    let shift = 0
    let count = 0
    let countUp=0
    let countDown=0
    let i2 = 0
    if (field_driven===1){
        length+=1
        i2=1
    }
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
    let bi = bytes[(i1+(length*i))]
    if (bi === undefined){
        decoded.zclheader.alarmmsg = listMess
        flag = 1
    }
    while(flag===0) {
        if (field_driven===1){
            let fi =bytes[(i1+((length)*i))+1+shift]
            divider = field[clustID][attID][fi].divider
            function_type = field[clustID][attID][fi].function_type
        }
        let csd = decimalToBitString(bi)
        let index = int(csd[5])*4+int(csd[6])*2+int(csd[7])
        if ((csd[3] === "1") && (csd[4] === "0")) {
            let temp = ""
            let mess = ""
            let gap = ""
            let qual = ""
            if (csd[1]==="1"){
                qual = "exceed"
            }else{
                qual = "fall"
            }
            if (i2===0){
                if (function_type==="none"){
                    temp = ((bytes[i1 + 1 + ((length)*i)+shift] ) / divider).toString()
                    gap = ((bytes[i1 + 2 + ((length)*i)+shift] ) / divider).toString()
                }
                else if (function_type==="int"){
                    temp = UintToInt((bytes[i1 + 1 + ((length)*i)+shift])/divider).toString()
                    gap = UintToInt((bytes[i1 + 2 + ((length)*i)+shift])/divider).toString()
                }
                else if (function_type==="float"){
                    temp = Bytes2Float32((bytes[i1 + 1 + ((length)*i)+shift] ) / divider).toString()
                    gap = Bytes2Float32((bytes[i1 + 2 + ((length)*i)+shift] ) / divider).toString()
                }
                count = decimalToBitString(bytes[i1 + 3 + ((length)*i)+shift])
                count = parseInt(count, 2)
                if (count>=128){
                    countUp=decimalToBitString(bytes[i1 + 4 + ((length)*i)+shift]*256+bytes[i1 + 5 + ((length)*i)+shift])
                    countUp=parseInt(countUp,2)
                    countDown=decimalToBitString(bytes[i1 + 6 + ((length)*i)+shift]*256+bytes[i1 + 7 + ((length)*i)+shift])
                    countDown=parseInt(countDown,2)
                    shift+=4

                    mess = "alarm, criterion_index: "+index + ", mode: threshold" + ", crossing: "+qual +  ", value: "+temp + ", gap: "+ gap + ", occurences_up: " + countUp + ", occurences_down: " + countDown
                }else{
                    mess = "alarm, criterion_index: "+index + ", mode: threshold" + ", crossing: "+qual +  ", value: "+temp + ", gap: "+ gap + ", occurences: " + count
                }            } else {
                let fi =bytes[(i1+((length)*i))+1+shift]
                let alarm_field = field[clustID][attID][fi].name
                if (function_type==="none"){
                    temp = ((bytes[i1 + 2 + ((length)*i)+shift] ) / divider).toString()
                    gap = ((bytes[i1 + 3 + ((length)*i)+shift] ) / divider).toString()
                }
                else if (function_type==="int"){
                    temp = UintToInt((bytes[i1 + 2 + ((length)*i)+shift] )/divider).toString()
                    gap = UintToInt((bytes[i1 + 3 + ((length)*i)+shift] )/divider).toString()
                }
                else if (function_type==="float"){
                    temp = Bytes2Float32((bytes[i1 + 2 + ((length)*i)+shift] ) / divider).toString()
                    gap = Bytes2Float32((bytes[i1 + 3 + ((length)*i)+shift] ) / divider).toString()
                }
                count = decimalToBitString(bytes[i1 + 4 + ((length)*i)+shift])
                count = parseInt(count, 2)
                if(count>=128){
                    countUp=decimalToBitString(bytes[i1 + 5 + ((length)*i)+shift]*256+bytes[i1 + 6 + ((length)*i)+shift])
                    countUp=parseInt(countUp,2)
                    countDown=decimalToBitString(bytes[i1 + 7 + ((length)*i)+shift]*256+bytes[i1 + 8 + ((length)*i)+shift])
                    countDown=parseInt(countDown,2)
                    shift+=4

                    mess = "alarm, criterion_index: "+index + ", mode: threshold" + ", crossing: "+qual +  ", value: "+temp + ", gap: "+ gap + ", occurences_up: " + countUp + ", occurences_down: " + countDown + ", field: " + alarm_field
                } else {
                    mess = "alarm, criterion_index: "+index + ", mode: threshold" + ", crossing: "+qual +  ", value: "+temp + ", gap: "+ gap + ", occurences: " + count + ", field: " + alarm_field
                }             }
            listMess.push(mess)
        }
        if ((csd[3] === "0") && (csd[4] === "1")) {
            length-=3
            let temp=""
            let mess=""
            if (i2===0){
                if (function_type==="none"){
                    temp = ((bytes[i1 + 1 + ((length)*i)+shift] ) / divider).toString()
                }
                else if (function_type==="int"){
                    temp = UintToInt((bytes[i1 + 1 + ((length)*i)+shift] )/divider).toString()
                }
                else if (function_type==="float"){
                    temp = Bytes2Float32((bytes[i1 + 1 + ((length)*i)+shift] ) / divider).toString()
                }
                mess = "alarm, criterion_index: "+ index + ", mode: delta"+ ", value: " + temp
            } else {
                let fi =bytes[(i1+((length)*i))+1+shift]
                let alarm_field = field[clustID][attID][fi].name
                if (function_type==="none"){
                    temp = ((bytes[i1 + 2 + ((length)*i)+shift] ) / divider).toString()
                }
                else if (function_type==="int"){
                    temp = UintToInt((bytes[i1 + 2 + ((length)*i)+shift] )/divider).toString()
                }
                else if (function_type==="float"){
                    temp = Bytes2Float32((bytes[i1 + 2 + ((length)*i)+shift] ) / divider).toString()
                }
                mess = "alarm, criterion_index: "+ index + ", mode: delta"+ ", value: " + temp + ", field: " + alarm_field
            }
            listMess.push(mess)
        }
        i+=1
        count=0
        countDown=0
        countUp=0
        bi = bytes[(i1+((length)*i))+shift]
        if (bi === undefined){
            decoded.zclheader.alarmmsg = listMess
            flag = 1
            break
        }
    }
}
function alarmLong3Bytes(length, listMess, flag, bytes, decoded, i1,divider,name, function_type, field_driven, clustID, attID){
    let i = 0
    let shift=0
    let count=0
    let countUp=0
    let countDown=0
    let i2 = 0
    if (field_driven===1){
        length+=1
        i2=1
    }
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
    let bi = bytes[(i1+(length*i))]
    if (bi === undefined){
        decoded.zclheader.alarmmsg = listMess
        flag = 1
    }
    while(flag===0) {
        if (field_driven===1){
            let fi =bytes[(i1+((length)*i))+1+shift]
            divider = field[clustID][attID][fi].divider
            function_type = field[clustID][attID][fi].function_type
        }
        let csd = decimalToBitString(bi)
        let index = int(csd[5])*4+int(csd[6])*2+int(csd[7])
        if ((csd[3] === "1") && (csd[4] === "0")) {
            let temp = ""
            let mess=""
            let gap = ""
            let qual =""
            if (csd[1]==="1"){
                qual = "exceed"
            }else{
                qual = "fall"
            }
            if (i2===0){
                if (function_type==="none"){
                    temp = ((bytes[i1 + 1 + ((length)*i)+shift] * 256 + bytes[i1 + 2 + ((length)*i)+shift] + bytes[i1+3+((length)*i)+shift]) / divider).toString()
                    gap = ((bytes[i1 + 4 + ((length)*i)+shift] * 256 + bytes[i1 + 5 + ((length)*i)+shift] + bytes[i1+6+((length)*i)+shift]) / divider).toString()
                }
                else if (function_type==="int"){
                    temp = UintToInt((bytes[i1 + 1 + ((length)*i)+shift] * 256 + bytes[i1 + 2 + ((length)*i)+shift] + bytes[i1+3+((length)*i)+shift])/divider).toString()
                    gap = UintToInt((bytes[i1 + 4 + ((length)*i)+shift] * 256 + bytes[i1 + 5 + ((length)*i)+shift] + bytes[i1+6+((length)*i)+shift])/divider).toString()
                }
                else if (function_type==="float"){
                    temp = Bytes2Float32((bytes[i1 + 1 + ((length)*i)+shift] * 256 + bytes[i1 + 2 + ((length)*i)+shift] + bytes[i1+3+((length)*i)+shift]) / divider).toString()
                    gap = Bytes2Float32((bytes[i1 + 4 + ((length)*i)+shift] * 256 + bytes[i1 + 5 + ((length)*i)+shift] + bytes[i1+6+((length)*i)+shift]) / divider).toString()
                }
                count = decimalToBitString(bytes[i1 + 7 + ((length)*i)+shift])
                count = parseInt(count, 2)
                if (count>=128){
                    countUp=decimalToBitString(bytes[i1 + 8 + ((length)*i)+shift]*256+bytes[i1 + 9 + ((length)*i)+shift])
                    countUp=parseInt(countUp,2)
                    countDown=decimalToBitString(bytes[i1 + 10 + ((length)*i)+shift]*256+bytes[i1 + 11 + ((length)*i)+shift])
                    countDown=parseInt(countDown,2)
                    shift+=4

                    mess = "alarm, criterion_index: "+index + ", mode: threshold" + ", crossing: "+qual +  ", value: "+temp + ", gap: "+ gap + ", occurences_up: " + countUp + ", occurences_down: " + countDown
                }else{
                    mess = "alarm, criterion_index: "+index + ", mode: threshold" + ", crossing: "+qual +  ", value: "+temp + ", gap: "+ gap + ", occurences: " + count
                }
            } else {
                let fi =bytes[(i1+((length)*i))+1+shift]
                let alarm_field = field[clustID][attID][fi].name
                if (function_type==="none"){
                    temp = ((bytes[i1 + 2 + ((length)*i)+shift] * 256 + bytes[i1 + 3 + ((length)*i)+shift] + bytes[i1+4+((length)*i)+shift]) / divider).toString()
                    gap = ((bytes[i1 + 5 + ((length)*i)+shift] * 256 + bytes[i1 + 6 + ((length)*i)+shift] + bytes[i1+7+((length)*i)+shift]) / divider).toString()
                }
                else if (function_type==="int"){
                    temp = UintToInt((bytes[i1 + 2 + ((length)*i)+shift] * 256 + bytes[i1 + 3 + ((length)*i)+shift] + bytes[i1+4+((length)*i)+shift])/divider).toString()
                    gap = UintToInt((bytes[i1 + 5 + ((length)*i)+shift] * 256 + bytes[i1 + 6 + ((length)*i)+shift] + bytes[i1+7+((length)*i)+shift])/divider).toString()
                }
                else if (function_type==="float"){
                    temp = Bytes2Float32((bytes[i1 + 2 + ((length)*i)+shift] * 256 + bytes[i1 + 3 + ((length)*i)+shift]+ bytes[i1+4+((length)*i)+shift]) / divider).toString()
                    gap = Bytes2Float32((bytes[i1 + 5 + ((length)*i)+shift] * 256 + bytes[i1 + 6 + ((length)*i)+shift] + bytes[i1+7+((length)*i)+shift]) / divider).toString()
                }
                count = decimalToBitString(bytes[i1 + 8 + ((length)*i)+shift])
                count = parseInt(count, 2)
                if(count>=128){
                    countUp=decimalToBitString(bytes[i1 + 9 + ((length)*i)+shift]*256+bytes[i1 + 10 + ((length)*i)+shift])
                    countUp=parseInt(countUp,2)
                    countDown=decimalToBitString(bytes[i1 + 11 + ((length)*i)+shift]*256+bytes[i1 + 12 + ((length)*i)+shift])
                    countDown=parseInt(countDown,2)
                    shift+=4

                    mess = "alarm, criterion_index: "+index + ", mode: threshold" + ", crossing: "+qual +  ", value: "+temp + ", gap: "+ gap + ", occurences_up: " + countUp + ", occurences_down: " + countDown + ", field: " + alarm_field
                } else {
                    mess = "alarm, criterion_index: "+index + ", mode: threshold" + ", crossing: "+qual +  ", value: "+temp + ", gap: "+ gap + ", occurences: " + count + ", field: " + alarm_field
                }            }
            listMess.push(mess)
        }
        if ((csd[3] === "0") && (csd[4] === "1")) {
            length-=3
            let temp=""
            let mess = ""
            if (i2===0){
                if (function_type==="none"){
                    temp = ((bytes[i1 + 1 + ((length)*i)+shift] *256*256 + bytes[i1 + 2 + ((length)*i)+shift]*256 + bytes[i1+3+((length)*i)+shift]) / divider).toString()
                }
                else if (function_type==="int"){
                    temp = UintToInt((bytes[i1 + 1 + ((length)*i)+shift] * 256 + bytes[i1 + 2 + ((length)*i)+shift] + bytes[i1+3+((length)*i)+shift])/divider).toString()
                }
                else if (function_type==="float"){
                    temp = Bytes2Float32((bytes[i1 + 1 + ((length)*i)+shift] * 256 + bytes[i1 + 2 + ((length)*i)+shift] + bytes[i1+3+((length)*i)+shift]) / divider).toString()
                }
                mess = "alarm, criterion_index: "+ index + ", mode: delta"+ ", value: " + temp
            } else {
                let fi =bytes[(i1+((length)*i))+1]
                let alarm_field = field[clustID][attID][fi].name
                if (function_type==="none"){
                    temp = ((bytes[i1 + 2 + ((length)*i)+shift] * 256 + bytes[i1 + 3 + ((length)*i)+shift] + bytes[i1+4+((length)*i)+shift]) / divider).toString()
                }
                else if (function_type==="int"){
                    temp = UintToInt((bytes[i1 + 2 + ((length)*i)+shift] * 256 + bytes[i1 + 3 + ((length)*i)+shift] + bytes[i1+4+((length)*i)+shift])/divider).toString()
                }
                else if (function_type==="float"){
                    temp = Bytes2Float32((bytes[i1 + 2 + ((length)*i)+shift] * 256 + bytes[i1 + 3 + ((length)*i)+shift] + bytes[i1+4+((length)*i)+shift]) / divider).toString()
                }
                mess = "alarm, criterion_index: "+ index + ", mode: delta"+ ", value: " + temp + ", field: " + alarm_field
            }
            listMess.push(mess)
        }
        i+=1
        count=0
        countDown=0
        countUp=0
        bi = bytes[(i1+((length)*i))+shift]
        if (bi === undefined){
            decoded.zclheader.alarmmsg = listMess
            flag = 1
            break
        }
    }
}
function alarmLong2Bytes(length, listMess, flag, bytes, decoded, i1,divider,name, function_type, field_driven, clustID, attID){
    console.log("alarmLong2Bytes")
    console.log(function_type)
    let i = 0
    let count = 0
    let countUp=0
    let countDown=0
    let shift=0
    let i2 = 0
    if (field_driven===1){
        length+=1
        i2=1
    }
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
    let bi = bytes[(i1+(length*i))]
    if (bi === undefined){
        decoded.zclheader.alarmmsg = listMess
        flag = 1
    }
    while(flag===0) {
        if (field_driven===1){
            let fi =bytes[(i1+((length)*i))+1+shift]
            divider = field[clustID][attID][fi].divider
            function_type = field[clustID][attID][fi].function_type
        }
        let csd = decimalToBitString(bi)
        let index = int(csd[5])*4+int(csd[6])*2+int(csd[7])
        if ((csd[3] === "1") && (csd[4] === "0")) {
            let temp = ""
            let mess = ""
            let gap = ""
            let qual = ""
            if (csd[1]==="1"){
                qual = "exceed"
            }else{
                qual = "fall"
            }
            if (i2===0){
                if (function_type==="none"){
                    temp = ((bytes[i1 + 1 + ((length)*i)+shift] * 256 + bytes[i1 + 2 + ((length)*i)+shift]) / divider).toString()
                    console.log(bytes[i1 + 1 + ((length)*i)+shift])

                    gap = ((bytes[i1 + 3 + ((length)*i)+shift] * 256 + bytes[i1 + 4 + ((length)*i)+shift]) / divider).toString()
                    console.log(bytes[i1 + 3 + ((length)*i)+shift])
                    console.log(bytes[i1 + 4 + ((length)*i)+shift])

                }
                else if (function_type==="int"){
                    temp = UintToInt((bytes[i1 + 1 + ((length)*i)+shift] * 256 + bytes[i1 + 2 + ((length)*i)+shift])/divider).toString()
                    console.log(bytes[i1 + 1 + ((length)*i)+shift])
                    gap = UintToInt((bytes[i1 + 3 + ((length)*i)+shift] * 256 + bytes[i1 + 4 + ((length)*i)+shift])/divider).toString()
                    console.log(bytes[i1 + 3 + ((length)*i)+shift])

                }
                else if (function_type==="float"){
                    temp = Bytes2Float32((bytes[i1 + 1 + ((length)*i)+shift] * 256 + bytes[i1 + 2 + ((length)*i)]+shift) / divider).toString()
                    gap = Bytes2Float32((bytes[i1 + 3 + ((length)*i)+shift] * 256 + bytes[i1 + 4 + ((length)*i)]+shift) / divider).toString()
                }
                count = decimalToBitString(bytes[i1 + 5 + ((length)*i)+shift])
                count = parseInt(count, 2)
                if (count>=128){
                    countUp=decimalToBitString(bytes[i1 + 6 + ((length)*i)+shift]*256+bytes[i1 + 7 + ((length)*i)+shift])
                    countUp=parseInt(countUp,2)
                    countDown=decimalToBitString(bytes[i1 + 8 + ((length)*i)+shift]*256+bytes[i1 + 9 + ((length)*i)+shift])
                    countDown=parseInt(countDown,2)
                    shift+=4

                    mess = "alarm, criterion_index: "+index + ", mode: threshold" + ", crossing: "+qual +  ", value: "+temp + ", gap: "+ gap + ", occurences_up: " + countUp + ", occurences_down: " + countDown
                }else{
                    mess = "alarm, criterion_index: "+index + ", mode: threshold" + ", crossing: "+qual +  ", value: "+temp + ", gap: "+ gap + ", occurences: " + count
                }
            } else {
                let fi =bytes[(i1+((length)*i))+1+shift]
                let alarm_field = field[clustID][attID][fi].name
                if (function_type==="none"){
                    temp = ((bytes[i1 + 2 + ((length)*i)+shift] * 256 + bytes[i1 + 3 + ((length)*i)+shift]) / divider).toString()
                    gap = ((bytes[i1 + 4 + ((length)*i)+shift] * 256 + bytes[i1 + 5 + ((length)*i)+shift]) / divider).toString()
                }
                else if (function_type==="int"){
                    temp = UintToInt((bytes[i1 + 2 + ((length)*i)+shift] * 256 + bytes[i1 + 3 + ((length)*i)+shift])/divider).toString()
                    gap = UintToInt((bytes[i1 + 4 + ((length)*i)+shift] * 256 + bytes[i1 + 5 + ((length)*i)+shift])/divider).toString()
                }
                else if (function_type==="float"){
                    temp = Bytes2Float32((bytes[i1 + 2 + ((length)*i)+shift] * 256 + bytes[i1 + 3 + ((length)*i)+shift]) / divider).toString()
                    gap = Bytes2Float32((bytes[i1 + 4 + ((length)*i)+shift] * 256 + bytes[i1 + 5 + ((length)*i)+shift]) / divider).toString()
                }
                count = decimalToBitString(bytes[i1 + 6 + ((length)*i)+shift])
                count = parseInt(count, 2)
                if(count>=128){
                    countUp=decimalToBitString(bytes[i1 + 7 + ((length)*i)+shift]*256+bytes[i1 + 8 + ((length)*i)+shift])
                    countUp=parseInt(countUp,2)
                    countDown=decimalToBitString(bytes[i1 + 9 + ((length)*i)+shift]*256+bytes[i1 + 10 + ((length)*i)+shift])
                    countDown=parseInt(countDown,2)
                    shift+=4

                    mess = "alarm, criterion_index: "+index + ", mode: threshold" + ", crossing: "+qual +  ", value: "+temp + ", gap: "+ gap + ", occurences_up: " + countUp + ", occurences_down: " + countDown + ", field: " + alarm_field
                } else {
                    mess = "alarm, criterion_index: "+index + ", mode: threshold" + ", crossing: "+qual +  ", value: "+temp + ", gap: "+ gap + ", occurences: " + count + ", field: " + alarm_field
                }
            }
            listMess.push(mess)
        }
        if ((csd[3] === "0") && (csd[4] === "1")) {
            length-=3
            let temp=""
            let mess=""
            if (i2===0){
                if (function_type==="none"){
                    temp = ((bytes[i1 + 1 + ((length)*i)+shift] * 256 + bytes[i1 + 2 + ((length)*i)+shift]) / divider).toString()
                }
                else if (function_type==="int"){
                    temp = UintToInt((bytes[i1 + 1 + ((length)*i)+shift] * 256 + bytes[i1 + 2 + ((length)*i)+shift])/divider).toString()
                }
                else if (function_type==="float"){
                    temp = Bytes2Float32((bytes[i1 + 1 + ((length)*i)+shift] * 256 + bytes[i1 + 2 + ((length)*i)+shift]) / divider).toString()
                }
                mess = "alarm, criterion_index: "+ index + ", mode: delta"+ ", value: " + temp
            } else {
                let fi =bytes[(i1+((length)*i))+1+shift]
                let alarm_field = field[clustID][attID][fi].name
                if (function_type==="none"){
                    temp = ((bytes[i1 + 2 + ((length)*i)+shift] * 256 + bytes[i1 + 3 + ((length)*i)+shift]) / divider).toString()
                }
                else if (function_type==="int"){
                    temp = UintToInt((bytes[i1 + 2 + ((length)*i)+shift] * 256 + bytes[i1 + 3 + ((length)*i)+shift])/divider).toString()
                }
                else if (function_type==="float"){
                    temp = Bytes2Float32((bytes[i1 + 2 + ((length)*i)+shift] * 256 + bytes[i1 + 3 + ((length)*i)+shift]) / divider).toString()
                }
                mess = "alarm, criterion_index: "+ index + ", mode: delta"+ ", value: " + temp + ", field: " + alarm_field
            }
            listMess.push(mess)
        }
        i+=1
        count=0
        countDown=0
        countUp=0
        bi = bytes[(i1+((length)*i))+shift]
        if (bi === undefined){
            decoded.zclheader.alarmmsg = listMess
            flag = 1
            break
        }
    }
}

function alarmLong4Bytes(length, listMess, flag, bytes, decoded, i1,divider,name, function_type, field_driven, clustID, attID){
    console.log("alarmLong4Bytes")
    let i = 0
    let shift = 0
    let count = 0
    let countUp=0
    let countDown=0
    let i2 = 0
    if (field_driven===1){
        length+=1
        console.log("length:"+length)
        i2=1
    }
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
    let bi = bytes[(i1+(length*i))]
    if (bi === undefined){
        decoded.zclheader.alarmmsg = listMess
        flag = 1
    }
    while(flag===0) {
        if (field_driven===1){
            console.log("field_driven")
            console.log((i1+((length)*i))+1)
            let fi =bytes[(i1+((length)*i)+1)+shift]
            console.log("fi:"+fi)
            divider = field[clustID][attID][fi].divider
            function_type = field[clustID][attID][fi].function_type
        }
        let csd = decimalToBitString(bi)
        let index = int(csd[5])*4+int(csd[6])*2+int(csd[7])
        if ((csd[3] === "1") && (csd[4] === "0")) {
            let temp = ""
            let mess = ""
            let gap = ""
            let qual = ""
            if (csd[1]==="1"){
                qual = "exceed"
            }else{
                qual = "fall"
            }
            if (i2===0){
                if (function_type==="none"){
                    temp = ((bytes[i1 + 1 + ((length)*i)+shift]*256*256*256 + bytes[i1 + 2 + ((length)*i)+shift]*256*256 + bytes[i1 + 3 + ((length)*i)+shift]*256 + bytes[i1 + 4 + ((length)*i)+shift]) / divider).toString()
                    gap = ((bytes[i1 + 5 + ((length)*i)+shift]*256*256*256 + bytes[i1 + 6 + ((length)*i)+shift]*256*256 + bytes[i1 + 7 + ((length)*i)+shift]*256 + bytes[i1 + 8 + ((length)*i)+shift]) / divider).toString()
                }
                else if (function_type==="int"){
                    temp = UintToInt((bytes[i1 + 1 + ((length)*i)+shift]*256*256*256 + bytes[i1 + 2 + ((length)*i)+shift]*256*256 + bytes[i1 + 3 + ((length)*i)+shift]*256 + bytes[i1 + 4 + ((length)*i)+shift]) / divider).toString()
                    gap = UintToInt((bytes[i1 + 5 + ((length)*i)+shift]*256*256*256 + bytes[i1 + 6 + ((length)*i)+shift]*256*256 + bytes[i1 + 7 + ((length)*i)+shift]*256 + bytes[i1 + 8 + ((length)*i)+shift]) / divider).toString()
                }
                else if (function_type==="float"){
                    temp = Bytes2Float32((bytes[i1 + 1 + ((length)*i)+shift]*256*256*256 + bytes[i1 + 2 + ((length)*i)+shift]*256*256 + bytes[i1 + 3 + ((length)*i)+shift]*256 + bytes[i1 + 4 + ((length)*i)+shift]) / divider).toString()
                    gap = Bytes2Float32((bytes[i1 + 5 + ((length)*i)+shift]*256*256*256 + bytes[i1 + 6 + ((length)*i)+shift]*256*256 + bytes[i1 + 7 + ((length)*i)+shift]*256 + bytes[i1 + 8 + ((length)*i)+shift]) / divider).toString()
                }
                count = decimalToBitString(bytes[i1 + 9 + ((length)*i)+shift])
                count = parseInt(count, 2)
                if (count>=128){
                    countUp=decimalToBitString(bytes[i1 + 10 + ((length)*i)+shift]*256+bytes[i1 + 11 + ((length)*i)+shift])
                    countUp=parseInt(countUp,2)
                    countDown=decimalToBitString(bytes[i1 + 12 + ((length)*i)+shift]*256+bytes[i1 + 13 + ((length)*i)+shift])
                    countDown=parseInt(countDown,2)
                    shift+=4

                    mess = "alarm, criterion_index: "+index + ", mode: threshold" + ", crossing: "+qual +  ", value: "+temp + ", gap: "+ gap + ", occurences_up: " + countUp + ", occurences_down: " + countDown
                }else{
                    mess = "alarm, criterion_index: "+index + ", mode: threshold" + ", crossing: "+qual +  ", value: "+temp + ", gap: "+ gap + ", occurences: " + count
                }
            } else {
                let fi =bytes[(i1+((length)*i))+1]
                let alarm_field = field[clustID][attID][fi].name
                if (function_type==="none"){
                    temp = ((bytes[i1 + 2 + ((length)*i)+shift]*256*256*256 + bytes[i1 + 3 + ((length)*i)+shift]*256*256 + bytes[i1 + 4 + ((length)*i)+shift]*256 + bytes[i1 + 5 + ((length)*i)+shift]) / divider).toString()
                    gap = ((bytes[i1 + 6 + ((length)*i)+shift]*256*256*256 + bytes[i1 + 7 + ((length)*i)+shift]*256*256 + bytes[i1 + 8 + ((length)*i)+shift]*256 + bytes[i1 + 9 + ((length)*i)+shift]) / divider).toString()
                }
                else if (function_type==="int"){
                    temp = UintToInt((bytes[i1 + 2 + ((length)*i)+shift]*256*256*256 + bytes[i1 + 3 + ((length)*i)+shift]*256*256 + bytes[i1 + 4 + ((length)*i)+shift]*256 + bytes[i1 + 5 + ((length)*i)+shift]) / divider).toString()
                    gap = UintToInt((bytes[i1 + 6 + ((length)*i)+shift]*256*256*256 + bytes[i1 + 7 + ((length)*i)+shift]*256*256 + bytes[i1 + 8 + ((length)*i)+shift]*256 + bytes[i1 + 9 + ((length)*i)+shift]) / divider).toString()
                }
                else if (function_type==="float"){
                    temp = Bytes2Float32((bytes[i1 + 2 + ((length)*i)+shift]*256*256*256 + bytes[i1 + 3 + ((length)*i)+shift]*256*256 + bytes[i1 + 4 + ((length)*i)+shift]*256 + bytes[i1 + 5 + ((length)*i)+shift]) / divider).toString()
                    gap = Bytes2Float32((bytes[i1 + 6 + ((length)*i)+shift]*256*256*256 + bytes[i1 + 7 + ((length)*i)+shift]*256*256 + bytes[i1 + 8 + ((length)*i)+shift]*256 + bytes[i1 + 9 + ((length)*i)+shift]) / divider).toString()
                }
                count = decimalToBitString(bytes[i1 + 10 + ((length)*i)+shift])
                count = parseInt(count, 2)
                if(count>=128){
                    countUp=decimalToBitString(bytes[i1 + 11 + ((length)*i)+shift]*256+bytes[i1 + 12 + ((length)*i)+shift])
                    countUp=parseInt(countUp,2)
                    countDown=decimalToBitString(bytes[i1 + 13 + ((length)*i)+shift]*256+bytes[i1 + 14 + ((length)*i)+shift])
                    countDown=parseInt(countDown,2)
                    shift+=4

                    mess = "alarm, criterion_index: "+index + ", mode: threshold" + ", crossing: "+qual +  ", value: "+temp + ", gap: "+ gap + ", occurences_up: " + countUp + ", occurences_down: " + countDown + ", field: " + alarm_field
                } else {
                    mess = "alarm, criterion_index: "+index + ", mode: threshold" + ", crossing: "+qual +  ", value: "+temp + ", gap: "+ gap + ", occurences: " + count + ", field: " + alarm_field
                }            }
            console.log(mess)
            listMess.push(mess)
        }
        if ((csd[3] === "0") && (csd[4] === "1")) {
            length-=3
            let temp=""
            let mess=""
            if (i2===0){
                if (function_type==="none"){
                    temp = ((bytes[i1 + 1 + ((length)*i)+shift]*256*256*256 + bytes[i1 + 2 + ((length)*i)+shift]*256*256 + bytes[i1 + 3 + ((length)*i)+shift]*256 + bytes[i1 + 4 + ((length)*i)+shift]) / divider).toString()
                }
                else if (function_type==="int"){
                    temp = UintToInt((bytes[i1 + 1 + ((length)*i)+shift]*256*256*256 + bytes[i1 + 2 + ((length)*i)+shift]*256*256 + bytes[i1 + 3 + ((length)*i)+shift]*256 + bytes[i1 + 4 + ((length)*i)+shift]) / divider).toString()
                }
                else if (function_type==="float"){
                    temp = Bytes2Float32((bytes[i1 + 1 + ((length)*i)+shift]*256*256*256 + bytes[i1 + 2 + ((length)*i)+shift]*256*256 + bytes[i1 + 3 + ((length)*i)+shift]*256 + bytes[i1 + 4 + ((length)*i)+shift]) / divider).toString()
                }
                mess = "alarm, criterion_index: "+ index + ", mode: delta"+ ", value: " + temp
            } else {
                let fi =bytes[(i1+((length)*i))+1]
                let alarm_field = field[clustID][attID][fi].name
                if (function_type==="none"){
                    temp = ((bytes[i1 + 2 + ((length)*i)+shift]*256*256*256 + bytes[i1 + 3 + ((length)*i)+shift]*256*256 + bytes[i1 + 4 + ((length)*i)+shift]*256 + bytes[i1 + 5 + ((length)*i)+shift]) / divider).toString()
                }
                else if (function_type==="int"){
                    temp = UintToInt((bytes[i1 + 2 + ((length)*i)+shift]*256*256*256 + bytes[i1 + 3 + ((length)*i)+shift]*256*256 + bytes[i1 + 4 + ((length)*i)+shift]*256 + bytes[i1 + 5 + ((length)*i)+shift]) / divider).toString()
                }
                else if (function_type==="float"){
                    temp = Bytes2Float32((bytes[i1 + 2 + ((length)*i)+shift]*256*256*256 + bytes[i1 + 3 + ((length)*i)+shift]*256*256 + bytes[i1 + 4 + ((length)*i)+shift]*256 + bytes[i1 + 5 + ((length)*i)+shift]) / divider).toString()
                }
                mess = "alarm, criterion_index: "+ index + ", mode: delta"+ ", value: " + temp +", field: " + alarm_field
            }
            listMess.push(mess)
        }
        i+=1
        count=0
        countDown=0
        countUp=0
        bi = bytes[(i1+((length)*i))+shift]
        if (bi === undefined){
            decoded.zclheader.alarmmsg = listMess
            flag = 1
            break
        }
    }
}

function BytesToHexStr(InBytes)
{
    let HexStr = "";
    for (let j=0; j < InBytes.length; j++)
    {
        let tmpHex = InBytes[j].toString(16).toUpperCase();
        if (tmpHex.length === 1) tmpHex = "0" + tmpHex;
        HexStr += tmpHex;
    }
    return HexStr;
}
function Decoder(bytes, port) {
    let decoded = {};
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
            clustID = bytes[2]*256 + bytes[3]; decoded.zclheader.clustID = decimalToHex(clustID,4);
            if((cmdID === 0x0a)|(cmdID === 0x8a)|(cmdID === 0x01)){
                decoded.data = {};
                attID = bytes[4]*256 + bytes[5];decoded.zclheader.attID = decimalToHex(attID,4);
                let firsthalfattID = bytes[4]
                let i1 = 0
                if ((cmdID === 0x0a) || (cmdID === 0x8a)) i1 = 7;
                if (cmdID === 0x8a) decoded.zclheader.alarm = 1;
                if (cmdID === 0x01)	{i1 = 8; decoded.zclheader.status = bytes[6];}

                if (( clustID === 0x0053 ) || ( clustID === 0x0054 ) || ( clustID === 0x0055 ) || ( clustID === 0x0056 )  || ( clustID === 0x0057 )) {
                    decoded.data = TIC_Decode(clustID,attID,bytes.slice(i1 + 1));
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
                    let length = bytes[i1];
                    decoded.data.kernel=""
                    for (let i = 0; i < length; i++) {
                        decoded.data.kernel += String.fromCharCode(bytes[i1 + 1 + i]);

                    }
                }
                if ((clustID === 0x0000 ) && (attID === 0x0004)){
                    let length = bytes[i1];
                    decoded.data.manufacturer=""
                    for (let i = 0; i < length; i++) {
                        decoded.data.manufacturer += String.fromCharCode(bytes[i1 + 1 + i]);
                    }
                }
                if ((clustID === 0x0000 ) && (attID === 0x0005)){
                    let length = bytes[i1];
                    decoded.data.model=""
                    for (let i = 0; i < length; i++) {
                        decoded.data.model += String.fromCharCode(bytes[i1 + 1 + i]);
                    }
                }
                if ((clustID === 0x0000 ) && (attID === 0x0006)){
                    let length = bytes[i1];
                    decoded.data.date=""
                    for (let i = 0; i < length; i++) {
                        decoded.data.date += String.fromCharCode(bytes[i1 + 1 + i]);
                    }
                }
                if ((clustID === 0x0000 ) && (attID === 0x0010)){
                    let length = bytes[i1];
                    decoded.data.position=""
                    for (let i = 0; i < length; i++) {
                        decoded.data.position += String.fromCharCode(bytes[i1 + 1 + i]);
                    }
                }
                if ((clustID === 0x0000 ) && (attID === 0x8001)){
                    let length = bytes[i1];
                    decoded.data.application_name=""
                    for (let i = 0; i < length; i++) {
                        decoded.data.application_name += String.fromCharCode(bytes[i1 + 1 + i]);
                    }
                }

                if ((clustID === 0x0402 ) && (attID === 0x0000)) {
                    let attribute_type = bytes[i1-1]
                    decoded.data.temperature = (UintToInt(bytes[i1]*256+bytes[i1+1],2))/100;
                    let ia = i1+2
                    if ((cmdID===0x8a)||(bytes[ia]!==undefined)) {
                        let listMess = []
                        let flag = 0
                        let divider = 100
                        let rc = ""
                        let ftype="int"
                        rc = decimalToBitString(bytes[ia])
                        ia+=1
                        if ((rc[2] === "0") && (rc[3] === "0")) {
                            listMess.push("alarm triggered")
                            decoded.zclheader.alarmmsg = listMess
                        }
                        if ((rc[2] === "0") && (rc[3] === "1")) {
                            let length = 1
                            alarmShort(length, listMess, flag, bytes, decoded, ia)
                        }
                        if ((rc[2] === "1") && (rc[3] === "0")) {
                            let length = 6
                            alarmLong(clustID, attID, length, listMess, flag, bytes, decoded, ia,attribute_type, divider, ftype)
                        }
                    }
                }
                if ((clustID === 0x0402 ) && (attID === 0x0001)) {
                    decoded.data.min_temperature = (UintToInt(bytes[i1]*256+bytes[i1+1],2))/100;
                }
                if ((clustID === 0x0402 ) && (attID === 0x0002)) {
                    decoded.data.max_temperature = (UintToInt(bytes[i1]*256+bytes[i1+1],2))/100;
                }
                if ((clustID === 0x0405 ) && (attID === 0x0000)){
                    let attribute_type = bytes[i1-1]
                    decoded.data.humidity = (bytes[i1]*256+bytes[i1+1])/100;
                    console.log(i1)
                    let ia = i1+2
                    console.log(ia)
                    if ((cmdID===0x8a)||(bytes[ia]!==undefined)) {
                        let listMess = []
                        let flag = 0
                        let divider = 100
                        let rc = ""
                        let ftype="none"
                        rc = decimalToBitString(bytes[ia])
                        ia+=1
                        if ((rc[2] === "0") && (rc[3] === "0")) {
                            listMess.push("alarm triggered")
                            decoded.zclheader.alarmmsg = listMess
                        }
                        if ((rc[2] === "0") && (rc[3] === "1")) {
                            let length = 1
                            alarmShort(length, listMess, flag, bytes, decoded, ia)
                        }
                        if ((rc[2] === "1") && (rc[3] === "0")) {
                            let length = 6
                            alarmLong(clustID, attID, length, listMess, flag, bytes, decoded, ia,attribute_type, divider, ftype)
                        }
                    }
                }
                if ((clustID === 0x0405 ) && (attID === 0x0001)) decoded.data.min_humidity = (bytes[i1]*256+bytes[i1+1])/100;
                if ((clustID === 0x0405 ) && (attID === 0x0002)) decoded.data.max_humidity = (bytes[i1]*256+bytes[i1+1])/100;
                if ((clustID === 0x000f ) && (attID === 0x0402)) {
                    let attribute_type = bytes[i1-1]
                    decoded.data.index = (bytes[i1]*256*256*256+bytes[i1+1]*256*256+bytes[i1+2]*256+bytes[i1+3]);
                    let ia = i1+4
                    if ((cmdID===0x8a)||(bytes[ia]!==undefined)) {
                        let listMess = []
                        let flag = 0
                        let divider = 1
                        let rc = ""
                        let ftype="none"
                        rc = decimalToBitString(bytes[ia])
                        ia+=1
                        if ((rc[2] === "0") && (rc[3] === "0")) {
                            listMess.push("alarm triggered")
                            decoded.zclheader.alarmmsg = listMess
                        }
                        if ((rc[2] === "0") && (rc[3] === "1")) {
                            let length = 1
                            alarmShort(length, listMess, flag, bytes, decoded, ia)
                        }
                        if ((rc[2] === "1") && (rc[3] === "0")) {
                            let length = 10
                            alarmLong(clustID, attID, length, listMess, flag, bytes, decoded, ia,attribute_type, divider, ftype)
                        }
                    }
                }
                if ((clustID === 0x000f ) && (attID === 0x0055)) {
                    let attribute_type = bytes[i1-1]
                    decoded.data.pin_state = !(!bytes[i1]);
                    let ia = i1+1
                    if ((cmdID===0x8a)||(bytes[ia]!==undefined)) {
                        let listMess = []
                        let flag = 0
                        let divider = 1
                        let rc = ""
                        let ftype="none"
                        rc = decimalToBitString(bytes[ia])
                        ia+=1
                        if ((rc[2] === "0") && (rc[3] === "0")) {
                            listMess.push("alarm triggered")
                            decoded.zclheader.alarmmsg = listMess
                        }
                        if ((rc[2] === "0") && (rc[3] === "1")) {
                            let length = 1
                            alarmShort(length, listMess, flag, bytes, decoded, ia)
                        }
                        if ((rc[2] === "1") && (rc[3] === "0")) {
                            let length = 4
                            alarmLong(clustID, attID, length, listMess, flag, bytes, decoded, ia,attribute_type, divider, ftype)
                        }
                    }
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
                    let ia = i1+1
                    if ((cmdID===0x8a)||(bytes[ia]!==undefined)) {
                        let listMess = []
                        let flag = 0
                        let divider = 1
                        let rc = ""
                        let ftype="none"
                        rc = decimalToBitString(bytes[ia])
                        ia+=1
                        if ((rc[2] === "0") && (rc[3] === "0")) {
                            listMess.push("alarm triggered")
                            decoded.zclheader.alarmmsg = listMess
                        }
                        if ((rc[2] === "0") && (rc[3] === "1")) {
                            let length = 1
                            alarmShort(length, listMess, flag, bytes, decoded, ia)
                        }
                        if ((rc[2] === "1") && (rc[3] === "0")) {
                            let length = 4
                            alarmLong(clustID, attID, length, listMess, flag, bytes, decoded, ia,attribute_type, divider, ftype)
                        }
                    }
                }
                if ((clustID === 0x0006 ) && (attID === 0x0000)) {
                    let state = bytes[i1]; if(state === 1) decoded.data.output = "ON"; else decoded.data.output = "OFF" ;
                }
                if ((clustID === 0x8008 ) && (attID === 0x0000)){
                    let attribute_type = bytes[i1-1]
                    decoded.data.differential_pressure =bytes[i1]*256+bytes[i1+1];
                    let ia = i1+2
                    if ((cmdID===0x8a)||(bytes[ia]!==undefined)) {
                        let listMess = []
                        let flag = 0
                        let divider = 1
                        let rc = ""
                        let ftype="none"
                        rc = decimalToBitString(bytes[ia])
                        ia+=1
                        if ((rc[2] === "0") && (rc[3] === "0")) {
                            listMess.push("alarm triggered")
                            decoded.zclheader.alarmmsg = listMess
                        }
                        if ((rc[2] === "0") && (rc[3] === "1")) {
                            let length = 1
                            alarmShort(length, listMess, flag, bytes, decoded, ia)
                        }
                        if ((rc[2] === "1") && (rc[3] === "0")) {
                            let length = 6
                            alarmLong(clustID, attID, length, listMess, flag, bytes, decoded, ia,attribute_type, divider, ftype)
                        }
                    }
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
                    let ia = i1+2
                    if ((cmdID===0x8a)||(bytes[ia]!==undefined)) {
                        let listMess = []
                        let flag = 0
                        let divider = 100
                        let rc = ""
                        let ftype="none"
                        rc = decimalToBitString(bytes[ia])
                        ia+=1
                        if ((rc[2] === "0") && (rc[3] === "0")) {
                            listMess.push("alarm triggered")
                            decoded.zclheader.alarmmsg = listMess
                        }
                        if ((rc[2] === "0") && (rc[3] === "1")) {
                            let length = 1
                            alarmShort(length, listMess, flag, bytes, decoded, ia)
                        }
                        if ((rc[2] === "1") && (rc[3] === "0")) {
                            let length = 4
                            alarmLong(clustID, attID, length, listMess, flag, bytes, decoded, ia,attribute_type, divider, ftype)
                        }
                    }
                }
                if ((clustID===0x8006)&&(attID===0x0000)) decoded.data.speed = bytes[i1]*256*256+bytes[i1+1]*256+bytes[i1+2];
                if ((clustID===0x8006)&&(attID===0x0001)) decoded.data.data_bit = bytes[i1]
                if ((clustID===0x8006)&&(attID===0x0002)) decoded.data.parity = bytes[i1];
                if ((clustID===0x8006)&&(attID===0x0003)) decoded.data.stop_bit = bytes[i1];
                if ((clustID === 0x000c ) && (attID === 0x0055)){
                    let attribute_type = bytes[i1-1]
                    decoded.data.analog = Bytes2Float32(bytes[i1]*256*256*256+bytes[i1+1]*256*256+bytes[i1+2]*256+bytes[i1+3]);
                    let ia = i1+4
                    if ((cmdID===0x8a)||(bytes[ia]!==undefined)) {
                        let listMess = []
                        let flag = 0
                        let divider = 1
                        let rc = ""
                        let ftype="float"
                        rc = decimalToBitString(bytes[ia])
                        ia+=1
                        if ((rc[2] === "0") && (rc[3] === "0")) {
                            listMess.push("alarm triggered")
                            decoded.zclheader.alarmmsg = listMess
                        }
                        if ((rc[2] === "0") && (rc[3] === "1")) {
                            let length = 1
                            alarmShort(length, listMess, flag, bytes, decoded, ia)
                        }
                        if ((rc[2] === "1") && (rc[3] === "0")) {
                            let length = 10
                            alarmLong(clustID, attID, length, listMess, flag, bytes, decoded, ia,attribute_type, divider, ftype)
                        }
                    }
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
                    let part1 = decimalToBitString(bytes[i1])
                    let part2 = decimalToBitString(bytes[i1+1])
                    let mode = part1[0]*2+part1[1]
                    if (mode === 0) chockparammetters.mode = "idle"
                    if (mode === 1) chockparammetters.mode = "chock"
                    if (mode === 2) chockparammetters.mode = "click"
                    let frequency = part1[2]*8+part1[3]*4+part1[4]*2+part1[5]
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
                    let range = part1[6]*2+part1[7]
                    if (range === 0) {chockparammetters.range.precision = "+/- 2g"; chockparammetters.range.value = 16}
                    if (range === 1) {chockparammetters.range.precision = "+/- 4g"; chockparammetters.range.value = 32}
                    if (range === 2) {chockparammetters.range.precision = "+/- 8g"; chockparammetters.range.value = 64}
                    if (range === 3) {chockparammetters.range.precision = "+/- 16g"; chockparammetters.range.value = 128}
                    let multiplicator = part2[0]*128+part2[1]*64+part2[2]*32+part2[3]*16+part2[4]*8+part2[5]*4+part2[6]*2+part2[7]
                    chockparammetters.threshold = multiplicator*chockparammetters.range.value
                }
                if ((clustID === 0x8007 ) && (attID === 0x0001))
                {
                    decoded.data.modbus_payload = "";
                    let size = bytes[i1];
                    for( let j = 0; j < size; j++ )
                    {
                        temp_hex_str   = bytes[i1+j+1].toString( 16 ).toUpperCase();
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
                    let b2 = bytes[i1+2]
                    let b3 = bytes[i1+3]
                    decoded.data.modbus_frame_series_sent = bytes[i1+1];
                    decoded.data.modbus_frame_number_in_serie = (b2 & 0xE0) >> 5;
                    decoded.data.modbus_last_frame_of_serie = (b2 & 0x1C ) >> 2;
                    decoded.data.modbus_EP9 = ((b2&0x01) === 0x01);
                    decoded.data.modbus_EP8 = ((b2&0x02) === 0x02);
                    decoded.data.modbus_EP7 = ((b3&0x80) === 0x80);
                    decoded.data.modbus_EP6 = ((b3&0x40) === 0x40);
                    decoded.data.modbus_EP5 = ((b3&0x20) === 0x20);
                    decoded.data.modbus_EP4 = ((b3&0x10) === 0x10);
                    decoded.data.modbus_EP3 = ((b3&0x08) === 0x08);
                    decoded.data.modbus_EP2 = ((b3&0x04) === 0x04);
                    decoded.data.modbus_EP1 = ((b3&0x02) === 0x02);
                    decoded.data.modbus_EP0 = ((b3&0x01) === 0x01);
                    let i2 = i1 + 4;
                    without_header = 0;
                    if (decoded.data.modbus_EP0 === true)
                    {
                        if (without_header === 0){
                            decoded.data.modbus_slaveID_EP0 = bytes[i2];
                            decoded.data.modbus_fnctID_EP0 = bytes[i2+1];
                            decoded.data.modbus_datasize_EP0 = bytes[i2+2];
                            i2 +=3;
                        }
                        decoded.data.modbus_payload_EP0 = ""
                        if (bytes[i2] === undefined ) return decoded;
                        for(let j = 0; j < decoded.data.modbus_datasize_EP0;j++)
                        {
                            temp_hex_str   = bytes[i2+j].toString( 16 ).toUpperCase( );
                            if( temp_hex_str.length === 1 ) temp_hex_str = "0" + temp_hex_str;
                            decoded.data.modbus_payload_EP0 += temp_hex_str;
                        }
                        i2 += decoded.data.modbus_datasize_EP0;
                    }
                    if (decoded.data.modbus_EP1 === true)
                    {
                        if (without_header === 0){
                            decoded.data.modbus_slaveID_EP1 = bytes[i2];
                            decoded.data.modbus_fnctID_EP1 = bytes[i2+1];
                            decoded.data.modbus_datasize_EP1 = bytes[i2+2];
                            i2 +=3
                        }
                        decoded.data.modbus_payload_EP1 = ""
                        if (bytes[i2] === undefined ) return decoded;
                        for( let j = 0; j < decoded.data.modbus_datasize_EP1; j++ )
                        {
                            temp_hex_str   = bytes[i2+j].toString( 16 ).toUpperCase( );
                            if( temp_hex_str.length === 1 ) temp_hex_str = "0" + temp_hex_str;
                            decoded.data.modbus_payload_EP1 += temp_hex_str;
                        }
                        i2 += decoded.data.modbus_datasize_EP1;
                    }
                    if (decoded.data.modbus_EP2 === true)
                    {
                        if (without_header === 0){
                            decoded.data.modbus_slaveID_EP2 = bytes[i2];
                            decoded.data.modbus_fnctID_EP2 = bytes[i2+1];
                            decoded.data.modbus_datasize_EP2 = bytes[i2+2];
                            i2 +=3;
                        }
                        decoded.data.modbus_payload_EP2 = ""
                        if (bytes[i2] === undefined ) return decoded;
                        for( let j = 0; j < decoded.data.modbus_datasize_EP2; j++ )
                        {
                            temp_hex_str   = bytes[i2+j].toString( 16 ).toUpperCase( );
                            if( temp_hex_str.length === 1 ) temp_hex_str = "0" + temp_hex_str;
                            decoded.data.modbus_payload_EP2 += temp_hex_str;
                        }
                        i2 += decoded.data.modbus_datasize_EP2;
                    }
                    if (decoded.data.modbus_EP3 === true)
                    {
                        if (without_header === 0){
                            decoded.data.modbus_slaveID_EP3 = bytes[i2];
                            decoded.data.modbus_fnctID_EP3 = bytes[i2+1];
                            decoded.data.modbus_datasize_EP3 = bytes[i2+2];
                            i2 +=3
                        }
                        decoded.data.modbus_payload_EP3 = ""
                        if (bytes[i2] === undefined ) return decoded;
                        for( let j = 0; j < decoded.data.modbus_datasize_EP3; j++ )
                        {
                            temp_hex_str   = bytes[i2+j].toString( 16 ).toUpperCase( );
                            if( temp_hex_str.length === 1 ) temp_hex_str = "0" + temp_hex_str;
                            decoded.data.modbus_payload_EP3 += temp_hex_str;
                        }
                        i2 += decoded.data.modbus_datasize_EP3;
                    }
                    if (decoded.data.modbus_EP4 === true)
                    {
                        if (without_header === 0){
                            decoded.data.modbus_slaveID_EP4 = bytes[i2];
                            decoded.data.modbus_fnctID_EP4 = bytes[i2+1];
                            decoded.data.modbus_datasize_EP4 = bytes[i2+2];
                            i2 +=3;
                        }
                        decoded.data.modbus_payload_EP4 = ""
                        if (bytes[i2] === undefined ) return decoded;
                        for( let j = 0; j < decoded.data.modbus_datasize_EP4; j++ )
                        {
                            temp_hex_str   = bytes[i2+j].toString( 16 ).toUpperCase( );
                            if( temp_hex_str.length === 1 ) temp_hex_str = "0" + temp_hex_str;
                            decoded.data.modbus_payload_EP4 += temp_hex_str;
                        }
                        i2 += decoded.data.modbus_datasize_EP4;
                    }
                    if (decoded.data.modbus_EP5 === true)
                    {
                        if (without_header === 0){
                            decoded.data.modbus_slaveID_EP5 = bytes[i2];
                            decoded.data.modbus_fnctID_EP5 = bytes[i2+1];
                            decoded.data.modbus_datasize_EP5 = bytes[i2+2];
                            i2 +=3;
                        }
                        decoded.data.modbus_payload_EP5 = ""
                        if (bytes[i2] === undefined ) return decoded;
                        for( let j = 0; j < decoded.data.modbus_datasize_EP5; j++ )
                        {
                            temp_hex_str   = bytes[i2+j].toString( 16 ).toUpperCase( );
                            if( temp_hex_str.length === 1 ) temp_hex_str = "0" + temp_hex_str;
                            decoded.data.modbus_payload_EP5 += temp_hex_str;
                        }
                        i2 += decoded.data.modbus_datasize_EP5;
                    }
                    if (decoded.data.modbus_EP6 === true)
                    {
                        if (without_header === 0){
                            decoded.data.modbus_slaveID_EP6 = bytes[i2];
                            decoded.data.modbus_fnctID_EP6 = bytes[i2+1];
                            decoded.data.modbus_datasize_EP6 = bytes[i2+2];
                            i2 +=3
                        }
                        decoded.data.modbus_payload_EP6 = ""
                        if (bytes[i2] === undefined ) return decoded;
                        for( let j = 0; j < decoded.data.modbus_datasize_EP6; j++ )
                        {
                            temp_hex_str   = bytes[i2+j].toString( 16 ).toUpperCase( );
                            if( temp_hex_str.length === 1 ) temp_hex_str = "0" + temp_hex_str;
                            decoded.data.modbus_payload_EP6 += temp_hex_str;
                        }
                        i2 += decoded.data.modbus_datasize_EP6;
                    }
                    if (decoded.data.modbus_EP7 === true)
                    {
                        if (without_header === 0){
                            decoded.data.modbus_slaveID_EP7 = bytes[i2];
                            decoded.data.modbus_fnctID_EP7 = bytes[i2+1];
                            decoded.data.modbus_datasize_EP7 = bytes[i2+2];
                            i2 +=3
                        }
                        decoded.data.modbus_payload_EP7 = ""
                        if (bytes[i2] === undefined ) return decoded;
                        for( let j = 0; j < decoded.data.modbus_datasize_EP7; j++ )
                        {
                            temp_hex_str   = bytes[i2+j].toString( 16 ).toUpperCase( );
                            if( temp_hex_str.length === 1 ) temp_hex_str = "0" + temp_hex_str;
                            decoded.data.modbus_payload_EP7 += temp_hex_str;
                        }
                        i2 += decoded.data.modbus_datasize_EP7;
                    }
                    if (decoded.data.modbus_EP8 === true)
                    {
                        if (without_header === 0){
                            decoded.data.modbus_slaveID_EP8 = bytes[i2];
                            decoded.data.modbus_fnctID_EP8 = bytes[i2+1];
                            decoded.data.modbus_datasize_EP8 = bytes[i2+2];
                            i2 +=3;
                        }
                        decoded.data.modbus_payload_EP8 = ""
                        if (bytes[i2] === undefined ) return decoded;
                        for( let j = 0; j < decoded.data.modbus_datasize_EP8; j++ )
                        {
                            temp_hex_str   = bytes[i2+j].toString( 16 ).toUpperCase( );
                            if( temp_hex_str.length === 1 ) temp_hex_str = "0" + temp_hex_str;
                            decoded.data.modbus_payload_EP8 += temp_hex_str;
                        }
                        i2 += decoded.data.modbus_datasize_EP8;
                    }
                    if (decoded.data.modbus_EP9 === true)
                    {
                        if (without_header === 0){
                            decoded.data.modbus_slaveID_EP9 = bytes[i2];
                            decoded.data.modbus_fnctID_EP9 = bytes[i2+1];
                            decoded.data.modbus_datasize_EP9 = bytes[i2+2];
                            i2 +=3
                        }
                        decoded.data.modbus_payload_EP9 = ""
                        if (bytes[i2] === undefined ) return decoded;
                        for( let j = 0; j < decoded.data.modbus_datasize_EP9; j++ )
                        {
                            temp_hex_str   = bytes[i2+j].toString( 16 ).toUpperCase( );
                            if( temp_hex_str.length === 1 ) temp_hex_str = "0" + temp_hex_str;
                            decoded.data.modbus_payload_EP9 += temp_hex_str;
                        }
                        i2 += decoded.data.modbus_datasize_EP9;
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
                    let length = bytes[i1]*256+bytes[i1+1];
                    let configuration = {}
                    let nbendpoints = bytes[i1+2];
                    for (let i = 0; i < nbendpoints; i++) {
                        let endpoint = {}
                        endpoint.endpoint = bytes[i1+3+i*7];
                        let nbinput_cluster = bytes[i1+4+i*7];
                        endpoint.input_clusters = []
                        for (let j=0; j < nbinput_cluster; j++){
                            let cluster = {}
                            endpoint.input_clusters[j] = decimalToHex(bytes[i1 + 5 + i * 7 + j * 2] * 256 + bytes[i1 + 6 + i * 7 + j * 2], 4);
                        }
                        let nboutput_cluster = bytes[i1+5+i*7+nbinput_cluster*2];
                        endpoint.output_clusters = []
                        for (let j=0; j < nboutput_cluster; j++){
                            let cluster = {}
                            endpoint.output_clusters[j] = decimalToHex(bytes[i1 + 6 + i * 7 + j * 2] * 256 + bytes[i1 + 7 + i * 7 + j * 2], 4);
                        }
                        configuration[i] = endpoint;
                    }
                    decoded.data.configuration = configuration;
                }
                if ((clustID === 0x0050 ) && (attID === 0x0006)) {
                    let i2 = i1 + 3;
                    let attribute_type = bytes[i1-1];
                    console.log(i2)
                    console.log("attribute_type",attribute_type)
                    if ((bytes[i1+2] &0x01) === 0x01) {decoded.data.main_or_external_voltage = (bytes[i2]*256+bytes[i2+1])/1000;i2=i2+2;}
                    if ((bytes[i1+2] &0x02) === 0x02) {decoded.data.rechargeable_battery_voltage = (bytes[i2]*256+bytes[i2+1])/1000;i2=i2+2;}
                    if ((bytes[i1+2] &0x04) === 0x04) {decoded.data.disposable_battery_voltage = (bytes[i2]*256+bytes[i2+1])/1000;i2=i2+2;}
                    if ((bytes[i1+2] &0x08) === 0x08) {decoded.data.solar_harvesting_voltage = (bytes[i2]*256+bytes[i2+1])/1000;i2=i2+2;}
                    if ((bytes[i1+2] &0x10) === 0x10) {decoded.data.tic_harvesting_voltage = (bytes[i2]*256+bytes[i2+1])/1000;i2=i2+2;}
                    let ia = i2+1
                    if ((cmdID===0x8a)||(bytes[ia]!==undefined)) {
                        let listMess = []
                        let flag = 0
                        let divider = 1000
                        let ftype = "multistate"
                        let rc = ""
                        rc = decimalToBitString(bytes[ia])
                        console.log(rc)
                        ia+=1
                        console.log("ia:"+ia)
                        let field_index = bytes[ia+1]
                        if ((rc[2] === "0") && (rc[3] === "0")) {
                            listMess.push("alarm triggered")
                            decoded.zclheader.alarmmsg = listMess
                        }
                        if ((rc[2] === "0") && (rc[3] === "1")) {
                            let length = 1
                            alarmShort(length, listMess, flag, bytes, decoded, ia)
                        }
                        if ((rc[2] === "1") && (rc[3] === "0")) {
                            let length = 6
                            alarmLong(clustID, attID, length, listMess, flag, bytes, decoded, ia, attribute_type, divider, ftype, field_index)
                        }
                    }
                }
                if ((clustID === 0x0050) && (firsthalfattID === 0xFF)){
                    let secondhalfattID = bytes[5];
                    let action = "action "+secondhalfattID.toString();
                    decoded.data[action]=""
                    let length = bytes[i1+1]
                    let actionvalue = "none"
                    for (let i = 0; i < length; i++) {
                        actionvalue += String.fromCharCode(bytes[i1 + 1 + i])
                    }
                    decoded.data[action] = actionvalue;
                }
                if (  (clustID === 0x800a) && (attID === 0x0000)) {
                    let i2 = i1;
                    let attribute_type = bytes[i2-1];
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
                    let ia = i2+5
                    if ((cmdID===0x8a)||(bytes[ia]!==undefined)) {
                        let listMess = []
                        let flag = 0
                        let divider = 1
                        let ftype = "multistate"
                        let rc = ""
                        rc = decimalToBitString(bytes[ia])
                        console.log(rc)
                        ia+=1
                        console.log("ia:"+ia)
                        let field_index = bytes[ia+1]
                        if ((rc[2] === "0") && (rc[3] === "0")) {
                            listMess.push("alarm triggered")
                            decoded.zclheader.alarmmsg = listMess
                        }
                        if ((rc[2] === "0") && (rc[3] === "1")) {
                            let length = 1
                            alarmShort(length, listMess, flag, bytes, decoded, ia)
                        }
                        if ((rc[2] === "1") && (rc[3] === "0")) {
                            let length = 10
                            alarmLong(clustID, attID, length, listMess, flag, bytes, decoded, ia, attribute_type, divider, ftype, field_index)
                        }
                    }
                }
                if (  (clustID === 0x8010) && (attID === 0x0000)) {
                    let attribute_type = bytes[i1-1];
                    decoded.data.active_energy_a=UintToInt(bytes[i1+1]*256*256*256+bytes[i1+2]*256*256+bytes[i1+3]*256+bytes[i1+4]);
                    decoded.data.reactive_energy_a=UintToInt(bytes[i1+5]*256*256*256+bytes[i1+6]*256*256+bytes[i1+7]*256+bytes[i1+8]);
                    decoded.data.active_energy_b=UintToInt(bytes[i1+9]*256*256*256+bytes[i1+10]*256*256+bytes[i1+11]*256+bytes[i1+12]);
                    decoded.data.reactive_energy_b=UintToInt(bytes[i1+13]*256*256*256+bytes[i1+14]*256*256+bytes[i1+15]*256+bytes[i1+16]);
                    decoded.data.active_energy_c=UintToInt(bytes[i1+17]*256*256*256+bytes[i1+18]*256*256+bytes[i1+19]*256+bytes[i1+20]);
                    decoded.data.reactive_energy_c=UintToInt(bytes[i1+21]*256*256*256+bytes[i1+22]*256*256+bytes[i1+23]*256+bytes[i1+24]);
                    decoded.data.active_energy_abc=UintToInt(bytes[i1+25]*256*256*256+bytes[i1+26]*256*256+bytes[i1+27]*256+bytes[i1+28]);
                    decoded.data.reactive_energy_abc=UintToInt(bytes[i1+29]*256*256*256+bytes[i1+30]*256*256+bytes[i1+31]*256+bytes[i1+32]);
                    let ia = i1 + 33
                    if ((cmdID===0x8a)||(bytes[ia]!==undefined)) {
                        let listMess = []
                        let flag = 0
                        let divider = 1
                        let ftype = "multistate"
                        let rc = ""
                        rc = decimalToBitString(bytes[ia])
                        ia+=1
                        console.log("ia:"+ia)
                        let field_index = bytes[ia+1]
                        if ((rc[2] === "0") && (rc[3] === "0")) {
                            listMess.push("alarm triggered")
                            decoded.zclheader.alarmmsg = listMess
                        }
                        if ((rc[2] === "0") && (rc[3] === "1")) {
                            let length = 1
                            alarmShort(length, listMess, flag, bytes, decoded, ia)
                        }
                        if ((rc[2] === "1") && (rc[3] === "0")) {
                            let length = 10
                            alarmLong(clustID, attID, length, listMess, flag, bytes, decoded, ia, attribute_type, divider, ftype, field_index)
                        }
                    }
                } else if (  (clustID === 0x8010) && (attID === 0x0001)) {
                    let attribute_type = bytes[i1-1];
                    decoded.data.active_power_a= UintToInt(bytes[i1+1]*256*256*256+bytes[i1+2]*256*256+bytes[i1+3]*256+bytes[i1+4]);
                    decoded.data.reactive_power_a= UintToInt(bytes[i1+5]*256*256*256+bytes[i1+6]*256*256+bytes[i1+7]*256+bytes[i1+8]);
                    decoded.data.active_power_b=UintToInt(bytes[i1+9]*256*256*256+bytes[i1+10]*256*256+bytes[i1+11]*256+bytes[i1+12]);
                    decoded.data.reactive_power_b=UintToInt(bytes[i1+13]*256*256*256+bytes[i1+14]*256*256+bytes[i1+15]*256+bytes[i1+16]);
                    decoded.data.active_power_c=UintToInt(bytes[i1+17]*256*256*256+bytes[i1+18]*256*256+bytes[i1+19]*256+bytes[i1+20]);
                    decoded.data.reactive_power_c=UintToInt(bytes[i1+21]*256*256*256+bytes[i1+22]*256*256+bytes[i1+23]*256+bytes[i1+24]);
                    decoded.data.active_power_abc=UintToInt(bytes[i1+25]*256*256*256+bytes[i1+26]*256*256+bytes[i1+27]*256+bytes[i1+28]);
                    decoded.data.reactive_power_abc=UintToInt(bytes[i1+29]*256*256*256+bytes[i1+30]*256*256+bytes[i1+31]*256+bytes[i1+32]);
                    let ia = i1 + 33
                    if ((cmdID===0x8a)||(bytes[ia]!==undefined)) {
                        let listMess = []
                        let flag = 0
                        let divider = 1
                        let ftype = "multistate"
                        let rc = ""
                        rc = decimalToBitString(bytes[ia])
                        ia+=1
                        console.log("ia:"+ia)
                        let field_index = bytes[ia+1]
                        if ((rc[2] === "0") && (rc[3] === "0")) {
                            listMess.push("alarm triggered")
                            decoded.zclheader.alarmmsg = listMess
                        }
                        if ((rc[2] === "0") && (rc[3] === "1")) {
                            let length = 1
                            alarmShort(length, listMess, flag, bytes, decoded, ia)
                        }
                        if ((rc[2] === "1") && (rc[3] === "0")) {
                            let length = 10
                            alarmLong(clustID, attID, length, listMess, flag, bytes, decoded, ia, attribute_type, divider, ftype, field_index)
                        }
                    }
                }
                if (  (clustID === 0x800b) && (attID === 0x0000)) {
                    let i2 = i1;
                    let attribute_type = bytes[i2-1];
                    decoded.data.Vrms = UintToInt(bytes[i2+1]*256+bytes[i2+2],2)/10;
                    i2 = i2 + 2;
                    decoded.data.Irms = UintToInt(bytes[i2+1]*256+bytes[i2+2],2)/10;
                    i2 = i2 + 2;
                    decoded.data.angle = UintToInt(bytes[i2+1]*256+bytes[i2+2],2);
                    let ia = i2+3
                    if ((cmdID===0x8a)||(bytes[ia]!==undefined)) {
                        let listMess = []
                        let flag = 0
                        let divider = 1
                        let ftype = "multistate"
                        let rc = ""
                        rc = decimalToBitString(bytes[ia])
                        console.log(rc)
                        ia+=1
                        console.log("ia:"+ia)
                        let field_index = bytes[ia+1]
                        if ((rc[2] === "0") && (rc[3] === "0")) {
                            listMess.push("alarm triggered")
                            decoded.zclheader.alarmmsg = listMess
                        }
                        if ((rc[2] === "0") && (rc[3] === "1")) {
                            let length = 1
                            alarmShort(length, listMess, flag, bytes, decoded, ia)
                        }
                        if ((rc[2] === "1") && (rc[3] === "0")) {
                            let length = 6
                            alarmLong(clustID, attID, length, listMess, flag, bytes, decoded, ia, attribute_type, divider, ftype, field_index)
                        }
                    }
                }
                if (  (clustID === 0x800d) && (attID === 0x0000)) {
                    let attribute_type = bytes[i1-1]
                    decoded.data.Vrms_a=UintToInt(bytes[i1+1]*256+bytes[i1+2],2)/10;
                    decoded.data.Irms_a=UintToInt(bytes[i1+3]*256+bytes[i1+4],2)/10;
                    decoded.data.angle_a=UintToInt(bytes[i1+5]*256+bytes[i1+6],2);
                    decoded.data.Vrms_b=UintToInt(bytes[i1+7]*256+bytes[i1+8],2)/10;
                    decoded.data.Irms_b=UintToInt(bytes[i1+9]*256+bytes[i1+10],2)/10;
                    decoded.data.angle_b=UintToInt(bytes[i1+11]*256+bytes[i1+12],2);
                    decoded.data.Vrms_c=UintToInt(bytes[i1+13]*256+bytes[i1+14],2)/10;
                    decoded.data.Irms_c=UintToInt(bytes[i1+15]*256+bytes[i1+16],2)/10;
                    decoded.data.angle_c=UintToInt(bytes[i1+17]*256+bytes[i1+18],2);
                    let ia = i1 + 19
                    if ((cmdID===0x8a)||(bytes[ia]!==undefined)) {
                        let listMess = []
                        let flag = 0
                        let divider = 1
                        let ftype = "multistate"
                        let rc = ""
                        rc = decimalToBitString(bytes[ia])
                        ia+=1
                        console.log("ia:"+ia)
                        let field_index = bytes[ia+1]
                        if ((rc[2] === "0") && (rc[3] === "0")) {
                            listMess.push("alarm triggered")
                            decoded.zclheader.alarmmsg = listMess
                        }
                        if ((rc[2] === "0") && (rc[3] === "1")) {
                            let length = 1
                            alarmShort(length, listMess, flag, bytes, decoded, ia)
                        }
                        if ((rc[2] === "1") && (rc[3] === "0")) {
                            let length = 6
                            alarmLong(clustID, attID, length, listMess, flag, bytes, decoded, ia, attribute_type, divider, ftype, field_index)
                        }
                    }
                }
                if ((clustID === 0x800c) && (attID === 0x0000)){
                    let attribute_type = bytes[i1-1]
                    decoded.data.concentration = (bytes[i1]*256+bytes[i1+1]);
                    let ia = i1+2
                    if ((cmdID===0x8a)||(bytes[ia]!==undefined)) {
                        let listMess = []
                        let flag = 0
                        let divider = 1
                        let rc = ""
                        let ftype="none"
                        rc = decimalToBitString(bytes[ia])
                        ia+=1
                        if ((rc[2] === "0") && (rc[3] === "0")) {
                            listMess.push("alarm triggered")
                            decoded.zclheader.alarmmsg = listMess
                        }
                        if ((rc[2] === "0") && (rc[3] === "1")) {
                            let length = 1
                            alarmShort(length, listMess, flag, bytes, decoded, ia)
                        }
                        if ((rc[2] === "1") && (rc[3] === "0")) {
                            let length = 6
                            alarmLong(clustID, attID, length, listMess, flag, bytes, decoded, ia,attribute_type, divider, ftype)
                        }
                    }
                }
                if ((clustID===0x800C)&&(attID===0x0001)) decoded.data.analog=bytes[i1];
                if ((clustID===0x800C)&&(attID===0x0002)) decoded.data.analog=bytes[i1];
                if ((clustID === 0x0400) && (attID === 0x0000)) {
                    let attribute_type = bytes[i1-1]
                    decoded.data.illuminance = (bytes[i1]*256+bytes[i1+1]);
                    let ia = i1+2
                    if ((cmdID===0x8a)||(bytes[ia]!==undefined)) {
                        let listMess = []
                        let flag = 0
                        let divider = 1
                        let rc = ""
                        let ftype="none"
                        rc = decimalToBitString(bytes[ia])
                        ia+=1
                        if ((rc[2] === "0") && (rc[3] === "0")) {
                            listMess.push("alarm triggered")
                            decoded.zclheader.alarmmsg = listMess
                        }
                        if ((rc[2] === "0") && (rc[3] === "1")) {
                            let length = 1
                            alarmShort(length, listMess, flag, bytes, decoded, ia)
                        }
                        if ((rc[2] === "1") && (rc[3] === "0")) {
                            let length = 6
                            alarmLong(clustID, attID, length, listMess, flag, bytes, decoded, ia,attribute_type, divider, ftype)
                        }
                    }
                }
                if ((clustID === 0x0403) && (attID === 0x0000)) {
                    let attribute_type = bytes[i1-1]
                    decoded.data.pressure = (UintToInt(bytes[i1]*256+bytes[i1+1],2));
                    let ia = i1+2
                    if ((cmdID===0x8a)||(bytes[ia]!==undefined)) {
                        let listMess = []
                        let flag = 0
                        let divider = 1
                        let rc = ""
                        let ftype="int"
                        rc = decimalToBitString(bytes[ia])
                        ia+=1
                        if ((rc[2] === "0") && (rc[3] === "0")) {
                            listMess.push("alarm triggered")
                            decoded.zclheader.alarmmsg = listMess
                        }
                        if ((rc[2] === "0") && (rc[3] === "1")) {
                            let length = 1
                            alarmShort(length, listMess, flag, bytes, decoded, ia)
                        }
                        if ((rc[2] === "1") && (rc[3] === "0")) {
                            let length = 6
                            alarmLong(clustID, attID, length, listMess, flag, bytes, decoded, ia,attribute_type, divider, ftype)
                        }
                    }
                }
                if ((clustID === 0x0406) && (attID === 0x0000)) {
                    let attribute_type = bytes[i1-1]
                    decoded.data.occupancy = !(!bytes[i1]);
                    let ia = i1+1
                    if ((cmdID===0x8a)||(bytes[ia]!==undefined)) {
                        let listMess = []
                        let flag = 0
                        let divider = 1
                        let rc = ""
                        let ftype="none"
                        rc = decimalToBitString(bytes[ia])
                        ia+=1
                        if ((rc[2] === "0") && (rc[3] === "0")) {
                            listMess.push("alarm triggered")
                            decoded.zclheader.alarmmsg = listMess
                        }
                        if ((rc[2] === "0") && (rc[3] === "1")) {
                            let length = 1
                            alarmShort(length, listMess, flag, bytes, decoded, ia)
                        }
                        if ((rc[2] === "1") && (rc[3] === "0")) {
                            let length = 4
                            alarmLong(clustID, attID, length, listMess, flag, bytes, decoded, ia,attribute_type, divider, ftype)
                        }
                    }
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
            }
            if(cmdID === 0x07){
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
                        console.log(bytes[14+i*5])
                        decoded.zclheader.powersource = bytes[15+i*5];
                        decoded.zclheader.delta = bytes[16+i*5]*256+bytes[17+i*5];
                        decoded.zclheader.changedpowersource = bytes[18+i*5];
                        i++
                        nb--
                    }
                }
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
function normalisation_standard(input, endpoint_parameters){
    let warning = [""];
    let bytes = input.bytes;
    let flagstandard = true;
    let indent = 0;
    console.log(input)
    let decoded = Decoder(bytes, input.fPort);
    console.log(decoded)
    if (decoded.zclheader !== undefined){
        if (decoded.zclheader.alarmmsg !== undefined){
            warning = decoded.zclheader.alarmmsg
            console.log(warning)
        }

        if (bytes[1] === 0x07 && bytes[0]%2 !== 0){
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
        console.log("je rentre dans le zclheader")
        if (endpoint_parameters !== undefined) {
            let access = decoded.zclheader.endpoint;
            let flagstandard = true;
            let indent = 0;
            let data = []
            let type = ""
            while (flagstandard) {
                console.log("bekbncnien")
                let firstKey = Object.keys(decoded.data)[indent];
                console.log(firstKey)
                if (firstKey === undefined) {
                    flagstandard = false;
                    break;
                } else {
                    console.log("poucevert")
                    console.log(endpoint_parameters[firstKey])
                    if (endpoint_parameters[firstKey] === undefined) {
                        console.log("pas de type")
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
        }
        else{
            let flagstandard = true;
            let indent = 0;
            let data = []
            while(flagstandard){
                let firstKey = Object.keys(decoded.data)[indent];

                if (firstKey === undefined){
                    flagstandard = false;
                    break;
                }
                else{
                    data.push({variable: firstKey,
                        value: decoded.data[firstKey],
                        date: input.recvTime
                    })
                    indent++;
                }
            }
            return {
                data:data,
                type: "standard",
                warning: warning
            }
        }
    }
    console.log("je sort en batch")
    return {
        type: decoded.batch.report,
        payload: decoded.lora.payload,
    }
}
module.exports = {normalisation_standard,};