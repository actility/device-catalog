const { UintToInt, Bytes2Float32, BytesToInt64, decimalToHex, zeroPad, BytesToHexStr } = require("./convert_tools.js");

/**
 * 
 * @param {number} clustID 
 * @param {number} AttributeID 
 * @param {*} BytesAfterSize 
 * @returns 
 */
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

        /**
         * 
         * @param {*} Bytes 
         * @param {number} i 
         * @param {string[]} Enums 
         * @returns 
         */
    function TICParseEnum(Bytes,i,Enums) {
        let x = "";
        if ((Bytes[i] & 0x80) == 0) { // Really Enum
            let iEnum = Bytes[i] & 0x7F;

            // Palliatif Anomalie 3.5.0.4852 à 3.5.0.5339 (Cf http://support.nke-watteco.com/tic/)
            // Ligne à commenter si le capteur PMEPMI a une version firmware différente de ci-dessus
            //iEnum++;

            x = Enums[iEnum]; i+=1;
        } else { // NString
            const sz = Bytes[i] & 0x7F; i += 1;
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

        let Indexes = [];

        const DescHeader = DescIn[0];
        let DescSize = (DescHeader & 0x1F);
        if (DescSize == 0) {
            DescSize = 8; // Historical fixed size Descriptor
        }
        const IsVarIndexes = ((DescHeader & 0x20) != 0);

        if (IsVarIndexes) {
            for (let i=1; i < DescSize; i++) {
                Indexes.push(DescIn[i]);
            }
        } else {
            // is VarBitfields
            let iField = 0;
            // TODO if historical: 7 LSbit of first byte should be used ... TODO
            for (let i=DescSize; i > 1; i--) {
                for (let b = 0; b < 8; b++) {
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
        const x = zeroPad(BytesToInt64(b,i,"U8"),2) + "/"+ zeroPad(BytesToInt64(b,i+1,"U8"),2) + "/"+ zeroPad(BytesToInt64(b,i+2,"U8"),2) + " " +
            zeroPad(BytesToInt64(b,i+3,"U8"),2) + ":"+ zeroPad(BytesToInt64(b,i+4,"U8"),2) + ":"+ zeroPad(BytesToInt64(b,i+5,"U8"),2);
        i+=6;
        return {x, i}
    }

    function TICParseTimeStamp(b,i,LittleEndian) {
        // EPOCH TIC: 01/01/2000 00:00:00
        // EPOCH UNIX: 01/01/1970 00:00:00
        let ts = BytesToInt64(b,i,"U32",LittleEndian); i += 4;
        ts += (new Date("2000/01/01 00:00:00").getTime()/1000)
        ts += 3600; //TODO: find a way to beter manage this 1h shift due to TZ and DST of running computer
        const a = new Date(ts * 1000);
        const x =
            zeroPad(a.getDate(),2) + "/" + zeroPad(a.getMonth(), 2) + "/" + a.getFullYear() + " " +
            zeroPad(a.getHours(),2) + ":" + zeroPad(a.getMinutes(),2) + ":" + zeroPad(a.getSeconds(),2) ;
        return {x, i};
    }

    function TICParseCString(b,i) {
        const eos = b.slice(i).indexOf(0);
        const x = String.fromCharCode.apply(null, b.slice(i, i + eos)); i += (eos + 1);
        return {x,  i}
    }

    function TICParseNString(b,i, n) {
        const x = String.fromCharCode.apply(null, b.slice(i, i+n)); i+=n;
        return {x,  i}
    }

    // ---------------------------------------------------------
    // FIELD PARSING
    function TYPE_EMPTY(b,i) { return {b,i}; }
    function TYPE_CHAR(b,i)    {
        const x = String.fromCharCode.apply(null, b.slice(0,1)); i+=1;
        return {x , i}
    }
    function TYPE_CSTRING(b,i) { return TICParseCString(b,i); }
    function TYPE_U8(b,i)      { const x = BytesToInt64(b,i,"U8"); i+=1; return { x ,  i} }
    function TYPE_U16(b,i)     { const x = BytesToInt64(b,i,"U16"); i+=2; return { x ,  i} }
    function TYPE_I16(b,i)     { const x = BytesToInt64(b,i,"I16"); i+=2; return { x ,  i} }
    /* Not used
    function TYPE_U24CSTRING(b,i) {
        let x = {};
        x["Value"] = BytesToInt64(b,i,"U24"); i += 3;
        const s = TICParseCString(b,i);
        x["Label"] = s.x; i = s.i;
        return {x, i}
    };
    */
    function TYPE_U24(b,i)     { const x = BytesToInt64(b,i,"U24"); i+=3; return { x , i} }
    function TYPE_4U24(b,i)    {
        let x = {};
        for (i=1;i<=4;i++) { x["Value_"+i] = BytesToInt64(b,i,"U24"); i += 3; }
        return {x, i}
    };
    function TYPE_6U24(b,i)    {
        let x = {};
        for (i=1;i<=4;i++) { x["Value_"+i] = BytesToInt64(b,i,"U24"); i += 3; }
        return {x, i}
    }
    function TYPE_U32(b,i)     { const x = BytesToInt64(b,i,"U32"); i+=4; return { x , i} }
    function TYPE_FLOAT(b,i)   { x = Bytes2Float32(b,i); i+=4; return { x , i} }
    function TYPE_DMYhms(b,i)  { return TICParseDMYhms(b,i); }
    function TYPE_tsDMYhms(b,i){ return TICParseTimeStamp(b,i); };
    /* Not used
    function TYPE_DMYhmsCSTRING(b,i) {
        let x = {};
        const d = TICParseDMYhms(b,i); x["Date"]=d.x; ;
        const s = TICParseCString(b,d.i);x["Label"]=s.x;
        i = s.i;
        return {x, i};
    }
    */
    function TYPE_E_PT(b,i)     { return TICParseEnum(b,i,E_PT); }
    function TYPE_E_STD_PT(b,i) { return TICParseEnum(b,i,E_STD_PT); }
    function TYPE_tsDMYhms_E_PT(b,i) {
        let x = {};
        const d = TICParseTimeStamp(b,i);
        const e = TICParseEnum(b,d.i,E_PT);
        i = e.i;
        return {x , i}
    }
    function TYPE_hmDM(b,i) {
        let x = "";
        const h = zeroPad(BytesToInt64(b,i,"U8"),2); i++;
        const m = zeroPad(BytesToInt64(b,i,"U8"),2); i++;
        const D = zeroPad(BytesToInt64(b,i,"U8"),2); i++;
        const M = zeroPad(BytesToInt64(b,i,"U8"),2); i++;
        x = D + "/" + M + " " + h + ":" + m;
        return {x, i}
    }
    function TYPE_DMh(b,i) {
        let x = "";
        const D = zeroPad(BytesToInt64(b,i,"U8"),2); i++;
        const M = zeroPad(BytesToInt64(b,i,"U8"),2); i++;
        const h = zeroPad(BytesToInt64(b,i,"U8"),2); i++;
        x = D + "/" + M + " " + h ;
        return {x, i}
    }
    function TYPE_hm(b,i) {
        let x = "";
        const h = zeroPad(BytesToInt64(b,i,"U8"),2); i++;
        const m = zeroPad(BytesToInt64(b,i,"U8"),2); i++;
        x = h + ":" + m;
        return {x, i}
    }
    function TYPE_SDMYhms(b,i) {
        let x = {};
        const s = TICParseNString(b,i, 1);
        const d = TICParseDMYhms(b,s.i);
        x["S"]=s.x;
        x["Date"]=d.x;
        i=d.i;
        return {x,i}
    }
    function TYPE_SDMYhmsU8(b,i) {
        let x = {};
        const s = TICParseNString(b,i, 1);
        const d = TICParseDMYhms(b,s.i);
        const n = BytesToInt64(b,i,"U8"); i = d.i + 1;
        x["S"]=s.x;
        x["Date"]=d.x;
        x["Value"]=n;
        return {x , i}
    }
    function TYPE_SDMYhmsU16(b,i) {
        let x = {};
        const s = TICParseNString(b,i, 1);
        const d = TICParseDMYhms(b,s.i);
        const n = BytesToInt64(b,i,"U16"); i = d.i + 1;
        x["S"]=s.x;
        x["Date"]=d.x;
        x["Value"]=n;
        return {x , i}
    }
    function TYPE_SDMYhmsU24(b,i) {
        let x = {};
        const s = TICParseNString(b,i, 1);
        const d = TICParseDMYhms(b,s.i);
        const n = BytesToInt64(b,i,"U24"); i = d.i + 1;
        x["S"]=s.x;
        x["Date"]=d.x;
        x["Value"]=n;
        return {x , i}
    }
    function TYPE_BF32xbe(b,i) {
        const x = BytesToHexStr(b.slice(i,2)); i+=4;
        i+=4
        return {x , i}
    }   /* Bitfield 32 bits heXa Big Endian */
    function TYPE_HEXSTRING(b,i) {
        const x = BytesToHexStr(b.slice(i+1,i+1+b[i]));
        i+=b[i]+1;
        return {x , i}
    }/* displayed as hexadecimal string Stored as <Size>+<byte string> */
    function TYPE_E_DIV(b,i) { return TICParseEnum(b,i,E_DIV); }
    function TYPE_U24_E_DIV(b,i) {
        let x = {};
        const dd = BytesToInt64(b,i,"U24"); i += 3;
        x.Value = dd;
        const e = TICParseEnum(b,i,E_DIV);
        x.Label = e.x; i = e.i;
        return {x, i}
    }
    function TYPE_E_CONTRAT(b,i) { return TICParseEnum(b,i,E_CONTRAT); }
    function TYPE_E_STD_CONTRAT(b,i) { return TICParseEnum(b,i,E_STD_CONTRAT); }
    function TYPE_11hhmmSSSS(b,i) {
        let x = []
        for (let j = 0 ; j < 11; j++) {
            let y = {};
            const h = zeroPad(BytesToInt64(b,i,"U8"),2); i++;
            if (h === 0xFF) {
                y["Status"] = "NONUTILE"
            } else {
                const m = zeroPad(BytesToInt64(b,i,"U8"),2); i++;
                const s = BytesToHexStr(b.slice(i,2)); i++;
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
        const x = BytesToInt64(b,i,"U8"); i++;
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
    /* Not used
    function FMT_d(x)     { return(x); }; // %d
    function FMT_ld(x)    { return(x); }; // %ld
    */
    
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
    let data = []
    let profil = {}
    // Select PROFIL according to cluster/attribute
    if (clustID == 0x0053) {
        if (AttributeID & 0x00FF == 0)	{
            profil = ICE_General;
            data["_TICFrameType"]="ICE Generale";
        } else if (AttributeID & 0x00FF == 1)	{
            profil = ICE_p;
            data["_TICFrameType"]="ICE Periode P";
        } else if (AttributeID & 0x0001 == 2)	{
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
        //TODO: return data et data ?
        return data;
        data["_TICFrameType"]="Unexpected";
    }

    // Start Decoding descriptor
    let {DescSize, Indexes} = TICParseDescToIndexes(BytesAfterSize);

    let DescBytes = BytesAfterSize.slice(0,DescSize);
    let x = {}
    if ((DescBytes[0] & 0x80) == 0x80) {
        x.Obsolete = true;
    }
    x.Bytes = BytesToHexStr(DescBytes);
    x.Indexes = Indexes;
    data["_Descriptor"]= x;

    // Start effective fields decodings
    let bytesIndex = DescSize;
    for (let j=0; j<Indexes.length; j++) {
        const fieldIndex = Indexes[j];
        const d = profil[fieldIndex][1](BytesAfterSize,bytesIndex);
        data[profil[fieldIndex][0]] = profil[fieldIndex][3](d.x);
        bytesIndex=d.i;
    }

    return data;
}

module.exports = {TIC_Decode};