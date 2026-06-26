var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// ../../device-catalog/vendors/watteco/drivers/standard.js
var require_standard = __commonJS({
  "../../device-catalog/vendors/watteco/drivers/standard.js"(exports2, module2) {
    var attribute_types = {
      16: {
        name: "boolean",
        size: 1
      },
      8: {
        name: "general8",
        size: 1
      },
      9: {
        name: "general16",
        size: 2
      },
      10: {
        name: "general24",
        size: 3
      },
      11: {
        name: "general32",
        size: 4
      },
      24: {
        name: "bitmap8",
        size: 1
      },
      25: {
        name: "bitmap16",
        size: 2
      },
      32: {
        name: "uint8",
        size: 1
      },
      33: {
        name: "uint16",
        size: 2
      },
      34: {
        name: "uint24",
        size: 3
      },
      35: {
        name: "uint32",
        size: 4
      },
      40: {
        name: "int8",
        size: 1
      },
      41: {
        name: "int16",
        size: 2
      },
      43: {
        name: "int32",
        size: 4
      },
      48: {
        name: "enum8",
        size: 1
      },
      66: {
        name: "char string",
        size: 1
      },
      65: {
        name: "bytes string",
        size: 1
      },
      67: {
        name: "long bytes string",
        size: 2
      },
      76: {
        name: "structured ordered sequence",
        size: 2
      },
      57: {
        name: "single",
        size: 4
      }
    };
    var field = {
      32778: {
        0: {
          0: {
            divider: 1,
            function_type: "int",
            name: "positive_active_energy",
            size: 4
          },
          1: {
            divider: 1,
            function_type: "int",
            name: "negative_active_energy",
            size: 4
          },
          2: {
            divider: 1,
            function_type: "int",
            name: "positive_reactive_energy",
            size: 4
          },
          3: {
            divider: 1,
            function_type: "int",
            name: "negative_reactive_energy",
            size: 4
          },
          4: {
            divider: 1,
            function_type: "int",
            name: "positive_active_power",
            size: 4
          },
          5: {
            divider: 1,
            function_type: "int",
            name: "negative_active_power",
            size: 4
          },
          6: {
            divider: 1,
            function_type: "int",
            name: "positive_reactive_power",
            size: 4
          },
          7: {
            divider: 1,
            function_type: "int",
            name: "negative_reactive_power",
            size: 4
          }
        }
      },
      32784: {
        0: {
          0: {
            divider: 1,
            function_type: "int",
            name: "active_energy_a",
            size: 4
          },
          1: {
            divider: 1,
            function_type: "int",
            name: "reactive_energy_a",
            size: 4
          },
          2: {
            divider: 1,
            function_type: "int",
            name: "active_energy_b",
            size: 4
          },
          3: {
            divider: 1,
            function_type: "int",
            name: "reactive_energy_b",
            size: 4
          },
          4: {
            divider: 1,
            function_type: "int",
            name: "active_energy_c",
            size: 4
          },
          5: {
            divider: 1,
            function_type: "int",
            name: "reactive_energy_c",
            size: 4
          },
          6: {
            divider: 1,
            function_type: "int",
            name: "active_energy_abc",
            size: 4
          },
          7: {
            divider: 1,
            function_type: "int",
            name: "reactive_energy_abc",
            size: 4
          }
        },
        1: {
          0: {
            divider: 1,
            function_type: "int",
            name: "active_power_a",
            size: 4
          },
          1: {
            divider: 1,
            function_type: "int",
            name: "reactive_power_a",
            size: 4
          },
          2: {
            divider: 1,
            function_type: "int",
            name: "active_power_b",
            size: 4
          },
          3: {
            divider: 1,
            function_type: "int",
            name: "reactive_power_b",
            size: 4
          },
          4: {
            divider: 1,
            function_type: "int",
            name: "active_power_c",
            size: 4
          },
          5: {
            divider: 1,
            function_type: "int",
            name: "reactive_power_c",
            size: 4
          },
          6: {
            divider: 1,
            function_type: "int",
            name: "active_power_abc",
            size: 4
          },
          7: {
            divider: 1,
            function_type: "int",
            name: "reactive_power_abc",
            size: 4
          }
        }
      },
      32779: {
        0: {
          0: {
            divider: 10,
            function_type: "int",
            name: "Vrms",
            size: 2
          },
          1: {
            divider: 10,
            function_type: "int",
            name: "Irms",
            size: 2
          },
          2: {
            divider: 1,
            function_type: "int",
            name: "angle",
            size: 2
          }
        }
      },
      32781: {
        0: {
          0: {
            divider: 10,
            function_type: "int",
            name: "Vrms_a",
            size: 2
          },
          1: {
            divider: 10,
            function_type: "int",
            name: "Irms_a",
            size: 2
          },
          2: {
            divider: 1,
            function_type: "int",
            name: "angle_a",
            size: 2
          },
          3: {
            divider: 10,
            function_type: "int",
            name: "Vrms_b",
            size: 2
          },
          4: {
            divider: 10,
            function_type: "int",
            name: "Irms_b",
            size: 2
          },
          5: {
            divider: 1,
            function_type: "int",
            name: "angle_b",
            size: 2
          },
          6: {
            divider: 10,
            function_type: "int",
            name: "Vrms_c",
            size: 2
          },
          7: {
            divider: 10,
            function_type: "int",
            name: "Irms_c",
            size: 2
          },
          8: {
            divider: 1,
            function_type: "int",
            name: "angle_c",
            size: 2
          }
        }
      },
      32850: {
        0: {
          0: {
            divider: 1e3,
            function_type: "int",
            name: "frequency",
            size: 2
          },
          1: {
            divider: 1e3,
            function_type: "int",
            name: "frequency_min",
            size: 2
          },
          2: {
            divider: 1e3,
            function_type: "int",
            name: "frequency_max",
            size: 2
          },
          3: {
            divider: 10,
            function_type: "int",
            name: "Vrms",
            size: 2
          },
          4: {
            divider: 10,
            function_type: "int",
            name: "Vrms_min",
            size: 2
          },
          5: {
            divider: 10,
            function_type: "int",
            name: "Vrms_max",
            size: 2
          },
          6: {
            divider: 10,
            function_type: "int",
            name: "Vpeak",
            size: 2
          },
          7: {
            divider: 10,
            function_type: "int",
            name: "Vpeak_min",
            size: 2
          },
          8: {
            divider: 10,
            function_type: "int",
            name: "Vpeak_max",
            size: 2
          },
          9: {
            divider: 1,
            function_type: "int",
            name: "over_voltage",
            size: 2
          },
          10: {
            divider: 1,
            function_type: "int",
            name: "sag_voltage",
            size: 2
          }
        }
      },
      32773: {
        0: {
          0: {
            divider: 1,
            function_type: "none",
            name: "pin_state_1",
            size: 1
          },
          1: {
            divider: 1,
            function_type: "none",
            name: "pin_state_2",
            size: 1
          },
          2: {
            divider: 1,
            function_type: "none",
            name: "pin_state_3",
            size: 1
          },
          3: {
            divider: 1,
            function_type: "none",
            name: "pin_state_4",
            size: 1
          },
          4: {
            divider: 1,
            function_type: "none",
            name: "pin_state_5",
            size: 1
          },
          5: {
            divider: 1,
            function_type: "none",
            name: "pin_state_6",
            size: 1
          },
          6: {
            divider: 1,
            function_type: "none",
            name: "pin_state_7",
            size: 1
          },
          7: {
            divider: 1,
            function_type: "none",
            name: "pin_state_8",
            size: 1
          },
          8: {
            divider: 1,
            function_type: "none",
            name: "pin_state_9",
            size: 1
          },
          9: {
            divider: 1,
            function_type: "none",
            name: "pin_state_10",
            size: 1
          }
        }
      },
      80: {
        6: {
          0: {
            divider: 1e3,
            function_type: "none",
            name: "power_modes",
            size: 2
          },
          1: {
            divider: 1e3,
            function_type: "none",
            name: "current_power_source",
            size: 2
          },
          2: {
            divider: 1e3,
            function_type: "none",
            name: "constant_power",
            size: 2
          },
          3: {
            divider: 1e3,
            function_type: "none",
            name: "rechargeable_battery",
            size: 2
          },
          4: {
            divider: 1e3,
            function_type: "none",
            name: "disposable_battery",
            size: 2
          },
          5: {
            divider: 1e3,
            function_type: "none",
            name: "solar_harvesting",
            size: 2
          },
          6: {
            divider: 1e3,
            function_type: "none",
            name: "TIC_harvesting",
            size: 2
          }
        }
      }
    };
    function UintToInt(Uint, Size) {
      if (Size === 2 && (Uint & 32768) > 0) Uint -= 65536;
      if (Size === 3 && (Uint & 8388608) > 0) Uint -= 16777216;
      if (Size === 4 && (Uint & 2147483648) > 0) Uint -= 4294967296;
      return Uint;
    }
    function Bytes2Float32(bytes) {
      let sign = bytes & 2147483648 ? -1 : 1;
      let exp = (bytes >> 23 & 255) - 127;
      let signi = bytes & ~(-1 << 23);
      if (exp === 128) return sign * (signi ? Number.NaN : Number.POSITIVE_INFINITY);
      if (exp === -127) {
        if (signi === 0) return 0;
        exp = -126;
        signi /= 1 << 23;
      } else signi = (signi | 1 << 23) / (1 << 23);
      return sign * signi * Math.pow(2, exp);
    }
    function BytesToInt64(InBytes, Starti1, Type, LiEnd) {
      if (typeof LiEnd == "undefined") LiEnd = false;
      let Signed = Type.substr(0, 1) != "U";
      let BytesNb = parseInt(Type.substr(1, 2), 10) / 8;
      let inc, start;
      let nb = BytesNb;
      if (LiEnd) {
        inc = -1;
        start = Starti1 + BytesNb - 1;
      } else inc = 1;
      start = Starti1;
      let tmpInt64 = 0;
      for (let j = start; nb > 0; j += inc, nb--) {
        tmpInt64 = (tmpInt64 << 8) + InBytes[j];
      }
      if (Signed && BytesNb < 8 && InBytes[start] & 128)
        tmpInt64 = tmpInt64 - (1 << BytesNb * 8);
      return tmpInt64;
    }
    function decimalToHex(d, pad) {
      let hex = d.toString(16).toUpperCase();
      pad = typeof pad === "undefined" || pad === null ? pad = 2 : pad;
      while (hex.length < pad) {
        hex = "0" + hex;
      }
      return "0x" + hex;
    }
    function zeroPad(num, places) {
      return String(num).padStart(places, "0");
    }
    function TIC_Decode(clustID, AttributeID, BytesAfterSize) {
      const E_DIV = [
        "!?!",
        "*",
        "",
        " ACTIF",
        "ACTIF",
        "CONSO",
        "CONTROLE",
        "DEP",
        "INACTIF",
        "PROD",
        "TEST",
        "kVA",
        "kW"
      ];
      const E_PT = [
        "!?!",
        "*",
        "",
        " ? ",
        "000",
        "HC",
        "HCD",
        "HCE",
        "HCH",
        "HH",
        "HH ",
        "HP",
        "HP ",
        "HPD",
        "HPE",
        "HPH",
        "JA",
        "JA ",
        "P",
        "P  ",
        "PM",
        "PM ",
        "XXX"
      ];
      const E_CONTRAT = [
        "!?!",
        "*",
        "",
        "BT 4 SUP36",
        "BT 5 SUP36",
        "HTA 5     ",
        "HTA 8     ",
        "TJ EJP    ",
        "TJ EJP-HH ",
        "TJ EJP-PM ",
        "TJ EJP-SD ",
        "TJ LU     ",
        "TJ LU-CH  ",
        "TJ LU-P   ",
        "TJ LU-PH  ",
        "TJ LU-SD  ",
        "TJ MU     ",
        "TV A5 BASE",
        "TV A8 BASE",
        "BASE",
        "H PLEINE-CREUSE",
        "HPHC",
        "HC",
        "HC et Week-End",
        "EJP",
        "PRODUCTEUR"
      ];
      const E_STD_PT = [
        "!?!",
        "*",
        "",
        " ? ",
        "000",
        "HC",
        "HCD",
        "HCE",
        "HCH",
        "HH",
        "HH ",
        "HP",
        "HP ",
        "HPD",
        "HPE",
        "HPH",
        "JA",
        "JA ",
        "P",
        "P  ",
        "PM",
        "PM ",
        "XXX",
        "INDEX NON CONSO",
        "BASE",
        "HEURE CREUSE",
        "HEURE PLEINE",
        "HEURE NORMALE",
        "HEURE POINTE",
        "HC BLEU",
        "BUHC",
        "HP BLEU",
        "BUHP",
        "HC BLANC",
        "BCHC",
        "HP BLANC",
        "BCHP",
        "HC ROUGE",
        "RHC",
        "HP ROUGE",
        "RHP",
        "HEURE WEEK-END"
      ];
      const E_STD_CONTRAT = [
        "!?!",
        "*",
        "",
        "BT 4 SUP36",
        "BT 5 SUP36",
        "HTA 5     ",
        "HTA 8     ",
        "TJ EJP    ",
        "TJ EJP-HH ",
        "TJ EJP-PM ",
        "TJ EJP-SD ",
        "TJ LU     ",
        "TJ LU-CH  ",
        "TJ LU-P   ",
        "TJ LU-PH  ",
        "TJ LU-SD  ",
        "TJ MU     ",
        "TV A5 BASE",
        "TV A8 BASE",
        "BASE",
        "H PLEINE-CREUSE",
        "HPHC",
        "HC",
        "HC et Week-End",
        "EJP",
        "PRODUCTEUR"
        /* Todo: Add necessary Enums when known */
      ];
      function TICParseEnum(Bytes, i, Enums) {
        var x2 = {};
        if ((Bytes[i] & 128) == 0) {
          let iEnum = Bytes[i] & 127;
          iEnum++;
          x2 = Enums[iEnum];
          i += 1;
        } else {
          const sz = Bytes[i] & 127;
          i += 1;
          if (sz > 0) {
            x2 = String.fromCharCode.apply(null, Bytes.slice(i, i + sz));
            i += sz;
          } else {
            x2 = "";
          }
        }
        return { x: x2, i };
      }
      function TICParseDescToIndexes(DescIn) {
        var Indexes2 = [];
        var DescHeader = DescIn[0];
        var DescSize2 = DescHeader & 31;
        if (DescSize2 == 0) {
          DescSize2 = 8;
        }
        const IsVarIndexes = (DescHeader & 32) != 0;
        if (IsVarIndexes) {
          for (i = 1; i < DescSize2; i++) {
            Indexes2.push(DescIn[i]);
          }
        } else {
          let iField = 0;
          for (var i = DescSize2; i > 1; i--) {
            for (let b = 0; b < 8; b++) {
              if (DescIn[i - 1] >> b & 1) {
                Indexes2.push(iField);
              }
              iField++;
            }
          }
        }
        return { DescSize: DescSize2, Indexes: Indexes2 };
      }
      function TICParseDMYhms(b, i) {
        x = zeroPad(BytesToInt64(b, i, "U8"), 2) + "/" + zeroPad(BytesToInt64(b, i + 1, "U8"), 2) + "/" + zeroPad(BytesToInt64(b, i + 2, "U8"), 2) + " " + zeroPad(BytesToInt64(b, i + 3, "U8"), 2) + ":" + zeroPad(BytesToInt64(b, i + 4, "U8"), 2) + ":" + zeroPad(BytesToInt64(b, i + 5, "U8"), 2);
        i += 6;
        return { x, i };
      }
      function TICParseTimeStamp(b, i, LittleEndian) {
        let ts = BytesToInt64(b, i, "U32", LittleEndian);
        i += 4;
        ts += (/* @__PURE__ */ new Date("2000/01/01 00:00:00")).getTime() / 1e3;
        ts += 3600;
        var a = new Date(ts * 1e3);
        var x2 = zeroPad(a.getDate(), 2) + "/" + zeroPad(a.getMonth(), 2) + "/" + a.getFullYear() + " " + zeroPad(a.getHours(), 2) + ":" + zeroPad(a.getMinutes(), 2) + ":" + zeroPad(a.getSeconds(), 2);
        return { x: x2, i };
      }
      function TICParseCString(b, i) {
        let eos = b.slice(i).indexOf(0);
        x = String.fromCharCode.apply(null, b.slice(i, i + eos));
        i += eos + 1;
        return { x, i };
      }
      function TICParseNString(b, i, n) {
        x = String.fromCharCode.apply(null, b.slice(i, i + n));
        i += n;
        return { x, i };
      }
      function TYPE_EMPTY(b, i) {
        return { b, i };
      }
      function TYPE_CHAR(b, i) {
        x = String.fromCharCode.apply(null, b.slice(0, 1));
        i += 1;
        return { x, i };
      }
      function TYPE_CSTRING(b, i) {
        return TICParseCString(b, i);
      }
      function TYPE_U8(b, i) {
        x = BytesToInt64(b, i, "U8");
        i += 1;
        return { x, i };
      }
      function TYPE_U16(b, i) {
        x = BytesToInt64(b, i, "U16");
        i += 2;
        return { x, i };
      }
      function TYPE_I16(b, i) {
        x = BytesToInt64(b, i, "I16");
        i += 2;
        return { x, i };
      }
      function TYPE_U24CSTRING(b, i) {
        var x2 = {};
        x2["Value"] = BytesToInt64(b, i, "U24");
        i += 3;
        const s2 = TICParseCString(b, i);
        x2["Label"] = s2.x;
        i = s2.i;
        return { x: x2, i };
      }
      ;
      function TYPE_U24(b, i) {
        x = BytesToInt64(b, i, "U24");
        i += 3;
        return { x, i };
      }
      function TYPE_4U24(b, i) {
        var x2 = {};
        for (i = 1; i <= 4; i++) {
          x2["Value_" + i] = BytesToInt64(b, i, "U24");
          i += 3;
        }
        return { x: x2, i };
      }
      ;
      function TYPE_6U24(b, i) {
        var x2 = {};
        for (i = 1; i <= 4; i++) {
          x2["Value_" + i] = BytesToInt64(b, i, "U24");
          i += 3;
        }
        return { x: x2, i };
      }
      function TYPE_U32(b, i) {
        x = BytesToInt64(b, i, "U32");
        i += 4;
        return { x, i };
      }
      function TYPE_FLOAT(b, i) {
        x = BytesToFloat32(b, i);
        i += 4;
        return { x, i };
      }
      function TYPE_DMYhms(b, i) {
        return TICParseDMYhms(b, i);
      }
      function TYPE_tsDMYhms(b, i) {
        return TICParseTimeStamp(b, i);
      }
      ;
      function TYPE_DMYhmsCSTRING(b, i) {
        var x2 = {};
        var d = TICParseDMYhms(b, i);
        x2["Date"] = d.x;
        ;
        var s2 = TICParseCString(b, d.i);
        x2["Label"] = s2.x;
        i = s2.i;
        return { x: x2, i };
      }
      function TYPE_E_PT(b, i) {
        return TICParseEnum(b, i, E_PT);
      }
      function TYPE_E_STD_PT(b, i) {
        return TICParseEnum(b, i, E_STD_PT);
      }
      function TYPE_tsDMYhms_E_PT(b, i) {
        var x2 = {};
        var d = TICParseTimeStamp(b, i);
        var e = TICParseEnum(b, d.i, E_PT);
        i = e.i;
        return { x: x2, i };
      }
      function TYPE_hmDM(b, i) {
        var x2 = {};
        const h = zeroPad(BytesToInt64(b, i, "U8"), 2);
        i++;
        const m2 = zeroPad(BytesToInt64(b, i, "U8"), 2);
        i++;
        const D = zeroPad(BytesToInt64(b, i, "U8"), 2);
        i++;
        const M = zeroPad(BytesToInt64(b, i, "U8"), 2);
        i++;
        x2 = D + "/" + M + " " + h + ":" + m2;
        return { x: x2, i };
      }
      function TYPE_DMh(b, i) {
        var x2 = {};
        const D = zeroPad(BytesToInt64(b, i, "U8"), 2);
        i++;
        const M = zeroPad(BytesToInt64(b, i, "U8"), 2);
        i++;
        const h = zeroPad(BytesToInt64(b, i, "U8"), 2);
        i++;
        x2 = D + "/" + M + " " + h;
        return { x: x2, i };
      }
      function TYPE_hm(b, i) {
        var x2 = {};
        const h = zeroPad(BytesToInt64(b, i, "U8"), 2);
        i++;
        const m2 = zeroPad(BytesToInt64(b, i, "U8"), 2);
        i++;
        x2 = h + ":" + m2;
        return { x: x2, i };
      }
      function TYPE_SDMYhms(b, i) {
        var x2 = {};
        const s2 = TICParseNString(b, i, 1);
        const d = TICParseDMYhms(b, s2.i);
        x2["S"] = s2.x;
        x2["Date"] = d.x;
        i = d.i;
        return { x: x2, i };
      }
      function TYPE_SDMYhmsU8(b, i) {
        var x2 = {};
        const s2 = TICParseNString(b, i, 1);
        const d = TICParseDMYhms(b, s2.i);
        const n = BytesToInt64(b, i, "U8");
        i = d.i + 1;
        x2["S"] = s2.x;
        x2["Date"] = d.x;
        x2["Value"] = n;
        return { x: x2, i };
      }
      function TYPE_SDMYhmsU16(b, i) {
        var x2 = {};
        const s2 = TICParseNString(b, i, 1);
        const d = TICParseDMYhms(b, s2.i);
        const n = BytesToInt64(b, i, "U16");
        i = d.i + 1;
        x2["S"] = s2.x;
        x2["Date"] = d.x;
        x2["Value"] = n;
        return { x: x2, i };
      }
      function TYPE_SDMYhmsU24(b, i) {
        var x2 = {};
        const s2 = TICParseNString(b, i, 1);
        const d = TICParseDMYhms(b, s2.i);
        const n = BytesToInt64(b, i, "U24");
        i = d.i + 1;
        x2["S"] = s2.x;
        x2["Date"] = d.x;
        x2["Value"] = n;
        return { x: x2, i };
      }
      function TYPE_BF32xbe(b, i) {
        var x2 = BytesToHexStr(b.slice(i, 2));
        i += 4;
        i += 4;
        return { x: x2, i };
      }
      function TYPE_HEXSTRING(b, i) {
        var x2 = BytesToHexStr(b.slice(i + 1, i + 1 + b[i]));
        i += b[i] + 1;
        const d = { x: x2, i };
        return { x: x2, i };
      }
      function TYPE_E_DIV(b, i) {
        return TICParseEnum(b, i, E_DIV);
      }
      function TYPE_U24_E_DIV(b, i) {
        var x2 = {};
        const dd = BytesToInt64(b, i, "U24");
        i += 3;
        x2.Value = dd;
        const e = TICParseEnum(b, i, E_DIV);
        x2.Label = e.x;
        i = e.i;
        return { x: x2, i };
      }
      function TYPE_E_CONTRAT(b, i) {
        return TICParseEnum(b, i, E_CONTRAT);
      }
      function TYPE_E_STD_CONTRAT(b, i) {
        return TICParseEnum(b, i, E_STD_CONTRAT);
      }
      function TYPE_11hhmmSSSS(b, i) {
        var x2 = [];
        for (var j2 = 0; j2 < 11; j2++) {
          let y = {};
          let h = zeroPad(BytesToInt64(b, i, "U8"), 2);
          i++;
          if (h == 255) {
            y["Status"] = "NONUTILE";
          } else {
            m = zeroPad(BytesToInt64(b, i, "U8"), 2);
            i++;
            s = BytesToHexStr(b.slice(i, 2));
            i++;
            y["Time"] = h + ":" + m;
            y["Status"] = s;
            i += b[i] + 1;
          }
          x2.push(y);
        }
        return { x: x2, i };
      }
      function TYPE_BF8d(b, i) {
        x = BytesToInt64(b, i, "U8");
        i++;
        return { x, i };
      }
      function FMT_UNDEF(x2) {
        return x2;
      }
      ;
      function FMT_s(x2) {
        return x2;
      }
      ;
      function FMT_PREAVIS_PT(x2) {
        return x2;
      }
      ;
      function FMT_c(x2) {
        return x2;
      }
      ;
      function FMT_02X(x2) {
        return x2;
      }
      ;
      function FMT_d(x2) {
        return x2;
      }
      ;
      function FMT_ld(x2) {
        return x2;
      }
      ;
      function FMT_02d(x2) {
        return x2;
      }
      ;
      function FMT_03d(x2) {
        return x2;
      }
      ;
      function FMT_05d(x2) {
        return x2;
      }
      ;
      function FMT_05ld(x2) {
        return x2;
      }
      ;
      function FMT_06ld(x2) {
        return x2;
      }
      ;
      function FMT_07ld(x2) {
        return x2;
      }
      ;
      function FMT_09ld(x2) {
        return x2;
      }
      ;
      function FMT_d_percent(x2) {
        return x2;
      }
      ;
      function FMT_d_s(x2) {
        return x2;
      }
      ;
      function FMT_d_kW(x2) {
        return x2;
      }
      ;
      function FMT_d_kvar(x2) {
        return x2;
      }
      ;
      function FMT_05d_kwh(x2) {
        return x2;
      }
      ;
      function FMT_ld_Wh(x2) {
        return x2;
      }
      ;
      function FMT_05ld_Wh(x2) {
        return x2;
      }
      ;
      function FMT_05ld_varh(x2) {
        return x2;
      }
      ;
      function FMT_ld_varh(x2) {
        return x2;
      }
      ;
      function FMT_ld_VAh(x2) {
        return x2;
      }
      ;
      function FMT_d_V(x2) {
        return x2;
      }
      ;
      function FMT_d_kWh(x2) {
        return x2;
      }
      ;
      function FMT_ld_kWh(x2) {
        return x2;
      }
      ;
      function FMT_d_kvarh(x2) {
        return x2;
      }
      ;
      function FMT_ld_kvarh(x2) {
        return x2;
      }
      ;
      function FMT_05_2f(x2) {
        return x2;
      }
      ;
      const ICE_General = [
        ["CONTRAT", TYPE_CSTRING, 0, FMT_s],
        ["DATECOUR", TYPE_DMYhms, 0, FMT_UNDEF],
        ["DATE", TYPE_DMYhms, 0, FMT_UNDEF],
        ["EA", TYPE_U24, 0, FMT_05ld_Wh],
        ["ERP", TYPE_U24, 0, FMT_05ld_varh],
        ["PTCOUR", TYPE_CSTRING, 0, FMT_s],
        ["PREAVIS", TYPE_CSTRING, 0, FMT_s],
        ["MODE", TYPE_EMPTY, 0, FMT_s],
        // Byte 1
        ["DATEPA1", TYPE_DMYhms, 0, FMT_UNDEF],
        ["PA1", TYPE_U16, 0, FMT_d_kW],
        ["DATEPA2", TYPE_DMYhms, 0, FMT_UNDEF],
        ["PA2", TYPE_U16, 0, FMT_d_kW],
        ["DATEPA3", TYPE_DMYhms, 0, FMT_UNDEF],
        ["PA3", TYPE_U16, 0, FMT_d_kW],
        ["DATEPA4", TYPE_DMYhms, 0, FMT_UNDEF],
        ["PA4", TYPE_U16, 0, FMT_d_kW],
        // Byte 2
        ["DATEPA5", TYPE_DMYhms, 0, FMT_UNDEF],
        ["PA5", TYPE_U16, 0, FMT_d_kW],
        ["DATEPA6", TYPE_DMYhms, 0, FMT_UNDEF],
        ["PA6", TYPE_U16, 0, FMT_d_kW],
        ["*p*", TYPE_U24, 0, FMT_05ld],
        //["*p*",	TYPE_U24,ATTRIBUTE_NOT_MANAGED_FIELD,FMT_05ld],
        ["KDC", TYPE_U8, 0, FMT_d_percent],
        ["KDCD", TYPE_U8, 0, FMT_d_percent],
        ["TGPHI", TYPE_FLOAT, 0, FMT_05_2f],
        // Byte 3
        ["PSP", TYPE_U16, 0, FMT_d_kW],
        ["PSPM", TYPE_U16, 0, FMT_d_kW],
        ["PSHPH", TYPE_U16, 0, FMT_d_kW],
        ["PSHPD", TYPE_U16, 0, FMT_d_kW],
        ["PSHCH", TYPE_U16, 0, FMT_d_kW],
        ["PSHCD", TYPE_U16, 0, FMT_d_kW],
        ["PSHPE", TYPE_U16, 0, FMT_d_kW],
        ["PSHCE", TYPE_U16, 0, FMT_d_kW],
        // Byte 4
        ["PSJA", TYPE_U16, 0, FMT_d_kW],
        ["PSHH", TYPE_U16, 0, FMT_d_kW],
        ["PSHD", TYPE_U16, 0, FMT_d_kW],
        ["PSHM", TYPE_U16, 0, FMT_d_kW],
        ["PSDSM", TYPE_U16, 0, FMT_d_kW],
        ["PSSCM", TYPE_U16, 0, FMT_d_kW],
        ["MODE", TYPE_EMPTY, 0, FMT_s],
        ["PA1MN", TYPE_U16, 0, FMT_d_kW],
        // Byte 5
        ["PA10MN", TYPE_U16, 0, FMT_d_kW],
        ["PREA1MN", TYPE_I16, 0, FMT_d_kvar],
        ["PREA10MN", TYPE_I16, 0, FMT_d_kvar],
        ["TGPHI", TYPE_FLOAT, 0, FMT_05_2f],
        ["U10MN", TYPE_U16, 0, FMT_d_V]
      ];
      const ICE_p = [
        //Byte 0
        ["DEBUTp", TYPE_DMYhms, 0, FMT_UNDEF, 0],
        ["FINp", TYPE_DMYhms, 0, FMT_UNDEF, 6],
        ["CAFp", TYPE_U16, 0, FMT_05d, 12],
        ["DATEEAp", TYPE_DMYhms, 0, FMT_UNDEF, 14],
        ["EApP", TYPE_U24, 0, FMT_ld_kWh, 20],
        ["EApPM", TYPE_U24, 0, FMT_ld_kWh, 23],
        ["EApHCE", TYPE_U24, 0, FMT_ld_kWh, 26],
        ["EApHCH", TYPE_U24, 0, FMT_ld_kWh, 29],
        //Byte 1
        ["EApHH", TYPE_U24, 0, FMT_ld_kWh, 32],
        ["EApHCD", TYPE_U24, 0, FMT_ld_kWh, 35],
        ["EApHD", TYPE_U24, 0, FMT_ld_kWh, 38],
        ["EApJA", TYPE_U24, 0, FMT_ld_kWh, 41],
        ["EApHPE", TYPE_U24, 0, FMT_ld_kWh, 44],
        ["EApHPH", TYPE_U24, 0, FMT_ld_kWh, 47],
        ["EApHPD", TYPE_U24, 0, FMT_ld_kWh, 50],
        ["EApSCM", TYPE_U24, 0, FMT_ld_kWh, 53],
        // Byte 2
        ["EApHM", TYPE_U24, 0, FMT_ld_kWh, 56],
        ["EApDSM", TYPE_U24, 0, FMT_ld_kWh, 59],
        ["DATEERPp", TYPE_DMYhms, 0, FMT_UNDEF, 62],
        ["ERPpP", TYPE_U24, 0, FMT_ld_kvarh, 68],
        ["ERPpPM", TYPE_U24, 0, FMT_ld_kvarh, 71],
        ["ERPpHCE", TYPE_U24, 0, FMT_ld_kvarh, 74],
        ["ERPpHCH", TYPE_U24, 0, FMT_ld_kvarh, 77],
        ["ERPpHH", TYPE_U24, 0, FMT_ld_kvarh, 80],
        // Byte 3
        ["ERPpHCD", TYPE_U24, 0, FMT_ld_kvarh, 83],
        ["ERPpHD", TYPE_U24, 0, FMT_ld_kvarh, 86],
        ["ERPpJA", TYPE_U24, 0, FMT_ld_kvarh, 89],
        ["ERPpHPE", TYPE_U24, 0, FMT_ld_kvarh, 92],
        ["ERPpHPH", TYPE_U24, 0, FMT_ld_kvarh, 95],
        ["ERPpHPD", TYPE_U24, 0, FMT_ld_kvarh, 98],
        ["ERPpSCM", TYPE_U24, 0, FMT_ld_kvarh, 101],
        ["ERPpHM", TYPE_U24, 0, FMT_ld_kvarh, 104],
        // Byte 4
        ["ERPpDSM", TYPE_U24, 0, FMT_ld_kvarh, 107],
        ["DATEERNp", TYPE_DMYhms, 0, FMT_UNDEF, 110],
        ["ERNpP", TYPE_U24, 0, FMT_ld_kvarh, 116],
        ["ERNpPM", TYPE_U24, 0, FMT_ld_kvarh, 119],
        ["ERNpHCE", TYPE_U24, 0, FMT_ld_kvarh, 122],
        ["ERNpHCH", TYPE_U24, 0, FMT_ld_kvarh, 125],
        ["ERNpHH", TYPE_U24, 0, FMT_ld_kvarh, 128],
        ["ERNpHCD", TYPE_U24, 0, FMT_ld_kvarh, 131],
        // Byte 5
        ["ERNpHD", TYPE_U24, 0, FMT_ld_kvarh, 134],
        ["ERNpJA", TYPE_U24, 0, FMT_ld_kvarh, 137],
        ["ERNpHPE", TYPE_U24, 0, FMT_ld_kvarh, 140],
        ["ERNpHPH", TYPE_U24, 0, FMT_ld_kvarh, 143],
        ["ERNpHPD", TYPE_U24, 0, FMT_ld_kvarh, 146],
        ["ERNpSCM", TYPE_U24, 0, FMT_ld_kvarh, 149],
        ["ERNpHM", TYPE_U24, 0, FMT_ld_kvarh, 152],
        ["ERNpDSM", TYPE_U24, 0, FMT_ld_kvarh, 155]
        // Byte 6
      ];
      const ICE_p1 = [
        //Byte 0
        ["DEBUTp1", TYPE_DMYhms, 0, FMT_UNDEF, 0],
        ["FINp1", TYPE_DMYhms, 0, FMT_UNDEF, 6],
        ["CAFp1", TYPE_U16, 0, FMT_05d, 12],
        ["DATEEAp1", TYPE_DMYhms, 0, FMT_UNDEF, 14],
        ["EAp1P", TYPE_U24, 0, FMT_ld_kWh, 20],
        ["EAp1PM", TYPE_U24, 0, FMT_ld_kWh, 23],
        ["EAp1HCE", TYPE_U24, 0, FMT_ld_kWh, 26],
        ["EAp1HCH", TYPE_U24, 0, FMT_ld_kWh, 29],
        //Byte 1
        ["EAp1HH", TYPE_U24, 0, FMT_ld_kWh, 32],
        ["EAp1HCD", TYPE_U24, 0, FMT_ld_kWh, 35],
        ["EAp1HD", TYPE_U24, 0, FMT_ld_kWh, 38],
        ["EAp1JA", TYPE_U24, 0, FMT_ld_kWh, 41],
        ["EAp1HPE", TYPE_U24, 0, FMT_ld_kWh, 44],
        ["EAp1HPH", TYPE_U24, 0, FMT_ld_kWh, 47],
        ["EAp1HPD", TYPE_U24, 0, FMT_ld_kWh, 50],
        ["EAp1SCM", TYPE_U24, 0, FMT_ld_kWh, 53],
        // Byte 2
        ["EAp1HM", TYPE_U24, 0, FMT_ld_kWh, 56],
        ["EAp1DSM", TYPE_U24, 0, FMT_ld_kWh, 59],
        ["DATEERPp1", TYPE_DMYhms, 0, FMT_UNDEF, 62],
        ["ERPp1P", TYPE_U24, 0, FMT_ld_kvarh, 68],
        ["ERPp1PM", TYPE_U24, 0, FMT_ld_kvarh, 71],
        ["ERPp1HCE", TYPE_U24, 0, FMT_ld_kvarh, 74],
        ["ERPp1HCH", TYPE_U24, 0, FMT_ld_kvarh, 77],
        ["ERPp1HH", TYPE_U24, 0, FMT_ld_kvarh, 80],
        // Byte 3
        ["ERPp1HCD", TYPE_U24, 0, FMT_ld_kvarh, 83],
        ["ERPp1HD", TYPE_U24, 0, FMT_ld_kvarh, 86],
        ["ERPp1JA", TYPE_U24, 0, FMT_ld_kvarh, 89],
        ["ERPp1HPE", TYPE_U24, 0, FMT_ld_kvarh, 92],
        ["ERPp1HPH", TYPE_U24, 0, FMT_ld_kvarh, 95],
        ["ERPp1HPD", TYPE_U24, 0, FMT_ld_kvarh, 98],
        ["ERPp1SCM", TYPE_U24, 0, FMT_ld_kvarh, 101],
        ["ERPp1HM", TYPE_U24, 0, FMT_ld_kvarh, 104],
        // Byte 4
        ["ERPp1DSM", TYPE_U24, 0, FMT_ld_kvarh, 107],
        ["DATEERNp1", TYPE_DMYhms, 0, FMT_UNDEF, 110],
        ["ERNp1P", TYPE_U24, 0, FMT_ld_kvarh, 116],
        ["ERNp1PM", TYPE_U24, 0, FMT_ld_kvarh, 119],
        ["ERNp1HCE", TYPE_U24, 0, FMT_ld_kvarh, 122],
        ["ERNp1HCH", TYPE_U24, 0, FMT_ld_kvarh, 125],
        ["ERNp1HH", TYPE_U24, 0, FMT_ld_kvarh, 128],
        ["ERNp1HCD", TYPE_U24, 0, FMT_ld_kvarh, 131],
        // Byte 5
        ["ERNp1HD", TYPE_U24, 0, FMT_ld_kvarh, 134],
        ["ERNp1JA", TYPE_U24, 0, FMT_ld_kvarh, 137],
        ["ERNp1HPE", TYPE_U24, 0, FMT_ld_kvarh, 140],
        ["ERNp1HPH", TYPE_U24, 0, FMT_ld_kvarh, 143],
        ["ERNp1HPD", TYPE_U24, 0, FMT_ld_kvarh, 146],
        ["ERNp1SCM", TYPE_U24, 0, FMT_ld_kvarh, 149],
        ["ERNp1HM", TYPE_U24, 0, FMT_ld_kvarh, 152],
        ["ERNp1DSM", TYPE_U24, 0, FMT_ld_kvarh, 155]
        // Byte 6
      ];
      const CBE = [
        // Byte 0
        ["ADIR1", TYPE_U16, 0, FMT_03d],
        ["ADIR2", TYPE_U16, 0, FMT_03d],
        ["ADIR3", TYPE_U16, 0, FMT_03d],
        ["ADCO", TYPE_CSTRING, 0, FMT_s],
        ["OPTARIF", TYPE_CSTRING, 0, FMT_s],
        ["ISOUSC", TYPE_U8, 0, FMT_02d],
        ["BASE", TYPE_U32, 0, FMT_09ld],
        ["HCHC", TYPE_U32, 0, FMT_09ld],
        // Byte 1
        ["HCHP", TYPE_U32, 0, FMT_09ld],
        ["EJPHN", TYPE_U32, 0, FMT_09ld],
        ["EJPHPM", TYPE_U32, 0, FMT_09ld],
        ["BBRHCJB", TYPE_U32, 0, FMT_09ld],
        ["BBRHPJB", TYPE_U32, 0, FMT_09ld],
        ["BBRHCJW", TYPE_U32, 0, FMT_09ld],
        ["BBRHPJW", TYPE_U32, 0, FMT_09ld],
        ["BBRHCJR", TYPE_U32, 0, FMT_09ld],
        // Byte 2
        ["BBRHPJR", TYPE_U32, 0, FMT_09ld],
        ["PEJP", TYPE_U8, 0, FMT_02d],
        ["GAZ", TYPE_U32, 0, FMT_07ld],
        ["AUTRE", TYPE_U32, 0, FMT_07ld],
        ["PTEC", TYPE_CSTRING, 0, FMT_s],
        ["DEMAIN", TYPE_CSTRING, 0, FMT_s],
        ["IINST", TYPE_U16, 0, FMT_03d],
        ["IINST1", TYPE_U16, 0, FMT_03d],
        // Byte 3
        ["IINST2", TYPE_U16, 0, FMT_03d],
        ["IINST3", TYPE_U16, 0, FMT_03d],
        ["ADPS", TYPE_U16, 0, FMT_03d],
        ["IMAX", TYPE_U16, 0, FMT_03d],
        ["IMAX1", TYPE_U16, 0, FMT_03d],
        ["IMAX2", TYPE_U16, 0, FMT_03d],
        ["IMAX3", TYPE_U16, 0, FMT_03d],
        ["PMAX", TYPE_U32, 0, FMT_05ld],
        // Byte 4
        ["PAPP", TYPE_U32, 0, FMT_05ld],
        ["HHPHC", TYPE_CHAR, 0, FMT_c],
        ["MOTDETAT", TYPE_CSTRING, 0, FMT_s],
        ["PPOT", TYPE_U8, 0, FMT_02X]
      ];
      const CJE = [
        // Byte 0
        ["JAUNE", TYPE_hmDM, 0, FMT_UNDEF],
        // [hh:mn:jj:mm]:pt:dp:abcde:kp
        ["JAUNE", TYPE_CSTRING, 0, FMT_s],
        // pt
        ["JAUNE", TYPE_CSTRING, 0, FMT_s],
        // dp
        ["JAUNE", TYPE_U24, 0, FMT_05ld],
        // abcde
        ["JAUNE", TYPE_U8, 0, FMT_02d],
        // kp
        ["ENERG", TYPE_6U24, 0, FMT_06ld],
        // 111111:222222:...:666666
        ["ENERG", TYPE_U24, 0, FMT_06ld],
        // 222222
        ["ENERG", TYPE_U24, 0, FMT_06ld],
        // 333333
        // Byte 1
        ["ENERG", TYPE_U24, 0, FMT_06ld],
        // 444444
        ["ENERG", TYPE_U24, 0, FMT_06ld],
        // 555555
        ["ENERG", TYPE_U24, 0, FMT_06ld],
        // 666666
        ["PERCC", TYPE_DMh, 0, FMT_UNDEF],
        // jj:mm:hh[:cg]
        ["PERCC", TYPE_U8, 0, FMT_02d],
        // cg
        ["PMAXC", TYPE_4U24, 0, FMT_05ld],
        // 11111:22222:...:44444
        ["PMAXC", TYPE_U24, 0, FMT_05ld],
        // 22222
        ["PMAXC", TYPE_U24, 0, FMT_05ld],
        // 33333
        // Byte 2
        ["PMAXC", TYPE_U24, 0, FMT_05ld],
        // 44444
        ["TDEPA", TYPE_4U24, 0, FMT_05ld],
        // 11111:22222:...:44444
        ["TDEPA", TYPE_U24, 0, FMT_05ld],
        // 22222
        ["TDEPA", TYPE_U24, 0, FMT_05ld],
        // 33333
        ["TDEPA", TYPE_U24, 0, FMT_05ld],
        // 44444
        ["PERCP", TYPE_DMh, 0, FMT_UNDEF],
        // [jj:mm:hh]:cg
        ["PERCP", TYPE_U8, 0, FMT_02d],
        // cg
        ["PMAXP", TYPE_4U24, 0, FMT_05ld],
        // 11111:22222:...:44444
        // Byte 3
        ["PMAXP", TYPE_U24, 0, FMT_05ld],
        // 22222
        ["PMAXP", TYPE_U24, 0, FMT_05ld],
        // 33333
        ["PMAXP", TYPE_U24, 0, FMT_05ld],
        // 44444
        ["PSOUSC", TYPE_4U24, 0, FMT_05ld],
        // 11111:22222:...:44444
        ["PSOUSC", TYPE_U24, 0, FMT_05ld],
        // 22222
        ["PSOUSC", TYPE_U24, 0, FMT_05ld],
        // 33333
        ["PSOUSC", TYPE_U24, 0, FMT_05ld],
        // 44444
        ["PSOUSP", TYPE_4U24, 0, FMT_05ld],
        // 11111:22222:...:44444
        // Byte 4
        ["PSOUSP", TYPE_U24, 0, FMT_05ld],
        // 22222
        ["PSOUSP", TYPE_U24, 0, FMT_05ld],
        // 33333
        ["PSOUSP", TYPE_U24, 0, FMT_05ld],
        // 44444
        ["FCOU", TYPE_hm, 0, FMT_UNDEF],
        // [hh:mn]:dd
        ["FCOU", TYPE_U8, 0, FMT_02d]
        // dd
      ];
      const STD = [
        // Byte 0
        ["ADSC", TYPE_CSTRING, 0, FMT_s],
        ["VTIC", TYPE_U8, 0, FMT_02d],
        ["DATE", TYPE_SDMYhms, 0, FMT_UNDEF],
        ["NGTF", TYPE_E_STD_CONTRAT, 0, FMT_s],
        ["LTARF", TYPE_E_STD_PT, 0, FMT_s],
        ["EAST", TYPE_U32, 0, FMT_09ld],
        ["EASF01", TYPE_U32, 0, FMT_09ld],
        ["EASF02", TYPE_U32, 0, FMT_09ld],
        // Byte 1
        ["EASF03", TYPE_U32, 0, FMT_09ld],
        ["EASF04", TYPE_U32, 0, FMT_09ld],
        ["EASF05", TYPE_U32, 0, FMT_09ld],
        ["EASF06", TYPE_U32, 0, FMT_09ld],
        ["EASF07", TYPE_U32, 0, FMT_09ld],
        ["EASF08", TYPE_U32, 0, FMT_09ld],
        ["EASF09", TYPE_U32, 0, FMT_09ld],
        ["EASF10", TYPE_U32, 0, FMT_09ld],
        // Byte 2
        ["EASD01", TYPE_U32, 0, FMT_09ld],
        ["EASD02", TYPE_U32, 0, FMT_09ld],
        ["EASD03", TYPE_U32, 0, FMT_09ld],
        ["EASD04", TYPE_U32, 0, FMT_09ld],
        ["EAIT", TYPE_U32, 0, FMT_09ld],
        ["ERQ1", TYPE_U32, 0, FMT_09ld],
        ["ERQ2", TYPE_U32, 0, FMT_09ld],
        ["ERQ3", TYPE_U32, 0, FMT_09ld],
        // Byte 3
        ["ERQ4", TYPE_U32, 0, FMT_09ld],
        ["IRMS1", TYPE_U16, 0, FMT_03d],
        ["IRMS2", TYPE_U16, 0, FMT_03d],
        ["IRMS3", TYPE_U16, 0, FMT_03d],
        ["URMS1", TYPE_U16, 0, FMT_03d],
        ["URMS2", TYPE_U16, 0, FMT_03d],
        ["URMS3", TYPE_U16, 0, FMT_03d],
        ["PREF", TYPE_U8, 0, FMT_02d],
        // Byte 4
        ["PCOUP", TYPE_U8, 0, FMT_02d],
        ["SINSTS", TYPE_U24, 0, FMT_05ld],
        ["SINSTS1", TYPE_U24, 0, FMT_05ld],
        ["SINSTS2", TYPE_U24, 0, FMT_05ld],
        ["SINSTS3", TYPE_U24, 0, FMT_05ld],
        ["SMAXSN", TYPE_SDMYhmsU24, 0, FMT_05ld],
        ["SMAXSN1", TYPE_SDMYhmsU24, 0, FMT_05ld],
        ["SMAXSN2", TYPE_SDMYhmsU24, 0, FMT_05ld],
        // Byte 5
        ["SMAXSN3", TYPE_SDMYhmsU24, 0, FMT_05ld],
        ["SMAXSN?1", TYPE_SDMYhmsU24, 0, FMT_05ld],
        ["SMAXSN1?1", TYPE_SDMYhmsU24, 0, FMT_05ld],
        ["SMAXSN2?1", TYPE_SDMYhmsU24, 0, FMT_05ld],
        ["SMAXSN3?1", TYPE_SDMYhmsU24, 0, FMT_05ld],
        ["SINSTI", TYPE_U24, 0, FMT_05ld],
        ["SMAXIN", TYPE_SDMYhmsU24, 0, FMT_05ld],
        ["SMAXIN-1", TYPE_SDMYhmsU24, 0, FMT_05ld],
        // Byte 6
        ["CCASN", TYPE_SDMYhmsU24, 0, FMT_05ld],
        ["CCASN?1", TYPE_SDMYhmsU24, 0, FMT_05ld],
        ["CCAIN", TYPE_SDMYhmsU24, 0, FMT_05ld],
        ["CCAIN?1", TYPE_SDMYhmsU24, 0, FMT_05ld],
        ["UMOY1", TYPE_SDMYhmsU16, 0, FMT_03d],
        ["UMOY2", TYPE_SDMYhmsU16, 0, FMT_03d],
        ["UMOY3", TYPE_SDMYhmsU16, 0, FMT_03d],
        ["STGE", TYPE_BF32xbe, 0, FMT_UNDEF],
        // Byte 7
        ["DPM1", TYPE_SDMYhmsU8, 0, FMT_02d],
        ["FPM1", TYPE_SDMYhmsU8, 0, FMT_02d],
        ["DPM2", TYPE_SDMYhmsU8, 0, FMT_02d],
        ["FPM2", TYPE_SDMYhmsU8, 0, FMT_02d],
        ["DPM3", TYPE_SDMYhmsU8, 0, FMT_02d],
        ["FPM3", TYPE_SDMYhmsU8, 0, FMT_02d],
        ["MSG1", TYPE_CSTRING, 0, FMT_s],
        ["MSG2", TYPE_CSTRING, 0, FMT_s],
        // Byte 8
        ["PRM", TYPE_CSTRING, 0, FMT_s],
        ["RELAIS", TYPE_BF8d, 0, FMT_03d],
        ["NTARF", TYPE_U8, 0, FMT_02d],
        ["NJOURF", TYPE_U8, 0, FMT_02d],
        ["NJOURF+1", TYPE_U8, 0, FMT_02d],
        ["PJOURF+1", TYPE_11hhmmSSSS, 0, FMT_UNDEF],
        ["PPOINTE", TYPE_11hhmmSSSS, 0, FMT_UNDEF]
      ];
      const PMEPMI = [
        //Byte 0
        ["TRAME", TYPE_E_DIV, 0, FMT_s],
        /* Uniquement Palier 2013 */
        ["ADS", TYPE_HEXSTRING, 0, FMT_UNDEF],
        /* Uniquement Palier 2013 */
        ["MESURES1", TYPE_E_CONTRAT, 0, FMT_s],
        ["DATE", TYPE_DMYhms, 0, FMT_UNDEF],
        ["EA_s", TYPE_U24, 0, FMT_ld_Wh],
        ["ER+_s", TYPE_U24, 0, FMT_ld_varh],
        ["ER-_s", TYPE_U24, 0, FMT_ld_varh],
        ["EAPP_s", TYPE_U24, 0, FMT_ld_VAh],
        //Byte 1
        ["EA_i", TYPE_U24, 0, FMT_ld_Wh],
        ["ER+_i", TYPE_U24, 0, FMT_ld_varh],
        ["ER-_i", TYPE_U24, 0, FMT_ld_varh],
        ["EAPP_i", TYPE_U24, 0, FMT_ld_VAh],
        ["PTCOUR1", TYPE_E_PT, 0, FMT_s],
        ["TARIFDYN", TYPE_E_DIV, 0, FMT_s],
        ["ETATDYN1", TYPE_E_PT, 0, FMT_s],
        ["PREAVIS1", TYPE_E_PT, 0, FMT_PREAVIS_PT],
        //Byte 2
        ["TDYN1CD", TYPE_tsDMYhms_E_PT, 0, FMT_UNDEF],
        ["TDYN1CF", TYPE_tsDMYhms_E_PT, 0, FMT_UNDEF],
        ["TDYN1FD", TYPE_tsDMYhms_E_PT, 0, FMT_UNDEF],
        ["TDYN1FF", TYPE_tsDMYhms_E_PT, 0, FMT_UNDEF],
        ["MODE", TYPE_E_DIV, 0, FMT_s],
        ["CONFIG", TYPE_E_DIV, 0, FMT_s],
        ["DATEPA1", TYPE_DMYhms, 0, FMT_UNDEF],
        ["PA1_s", TYPE_U16, 0, FMT_d_kW],
        // Byte 3
        ["PA1_i", TYPE_U16, 0, FMT_d_kW],
        ["DATEPA2", TYPE_tsDMYhms, 0, FMT_UNDEF],
        ["PA2_s", TYPE_U16, 0, FMT_d_kW],
        ["PA2_i", TYPE_U16, 0, FMT_d_kW],
        ["DATEPA3", TYPE_tsDMYhms, 0, FMT_UNDEF],
        ["PA3_s", TYPE_U16, 0, FMT_d_kW],
        ["PA3_i", TYPE_U16, 0, FMT_d_kW],
        ["DATEPA4", TYPE_tsDMYhms, 0, FMT_UNDEF],
        //Byte 4
        ["PA4_s", TYPE_U16, 0, FMT_d_kW],
        ["PA4_i", TYPE_U16, 0, FMT_d_kW],
        ["DATEPA5", TYPE_tsDMYhms, 0, FMT_UNDEF],
        ["PA5_s", TYPE_U16, 0, FMT_d_kW],
        ["PA5_i", TYPE_U16, 0, FMT_d_kW],
        ["DATEPA6", TYPE_tsDMYhms, 0, FMT_UNDEF],
        ["PA6_s", TYPE_U16, 0, FMT_d_kW],
        ["PA6_i", TYPE_U16, 0, FMT_d_kW],
        //Byte 5
        ["DebP", TYPE_tsDMYhms, 0, FMT_UNDEF],
        ["EAP_s", TYPE_U24, 0, FMT_d_kWh],
        ["EAP_i", TYPE_U24, 0, FMT_d_kWh],
        ["ER+P_s", TYPE_U24, 0, FMT_d_kvarh],
        ["ER-P_s", TYPE_U24, 0, FMT_d_kvarh],
        ["ER+P_i", TYPE_U24, 0, FMT_d_kvarh],
        ["ER-P_i", TYPE_U24, 0, FMT_d_kvarh],
        ["DebP-1", TYPE_tsDMYhms, 0, FMT_UNDEF],
        //Byte 6
        ["FinP-1", TYPE_tsDMYhms, 0, FMT_UNDEF],
        ["EaP-1_s", TYPE_U24, 0, FMT_d_kWh],
        ["EaP-1_i", TYPE_U24, 0, FMT_d_kWh],
        ["ER+P-1_s", TYPE_U24, 0, FMT_d_kvarh],
        ["ER-P-1_s", TYPE_U24, 0, FMT_d_kvarh],
        ["ER+P-1_i", TYPE_U24, 0, FMT_d_kvarh],
        ["ER-P-1_i", TYPE_U24, 0, FMT_d_kvarh],
        ["PS", TYPE_U24_E_DIV, 0, FMT_UNDEF],
        //Byte 7
        ["PREAVIS", TYPE_E_DIV, 0, FMT_s],
        ["PA1MN", TYPE_U16, 0, FMT_d_kW],
        ["PMAX_s", TYPE_U24_E_DIV, 0, FMT_UNDEF],
        ["PMAX_i", TYPE_U24_E_DIV, 0, FMT_UNDEF],
        ["TGPHI_s", TYPE_FLOAT, 0, FMT_05_2f],
        ["TGPHI_i", TYPE_FLOAT, 0, FMT_05_2f],
        ["MESURES2", TYPE_E_CONTRAT, 0, FMT_s],
        ["PTCOUR2", TYPE_E_PT, 0, FMT_s],
        //Byte 8
        ["ETATDYN2", TYPE_E_PT, 0, FMT_s],
        ["PREAVIS2", TYPE_E_PT, 0, FMT_PREAVIS_PT],
        ["TDYN2CD", TYPE_tsDMYhms_E_PT, 0, FMT_UNDEF],
        ["TDYN2CF", TYPE_tsDMYhms_E_PT, 0, FMT_UNDEF],
        ["TDYN2FD", TYPE_tsDMYhms_E_PT, 0, FMT_UNDEF],
        ["TDYN2FF", TYPE_tsDMYhms_E_PT, 0, FMT_UNDEF],
        ["DebP_2", TYPE_tsDMYhms, 0, FMT_UNDEF],
        ["EaP_s2", TYPE_U24, 0, FMT_d_kWh],
        //Byte 9
        ["DebP-1_2", TYPE_tsDMYhms, 0, FMT_UNDEF],
        ["FinP-1_2", TYPE_tsDMYhms, 0, FMT_UNDEF],
        ["EaP-1_s2", TYPE_U24, 0, FMT_d_kWh],
        ["_DDMES1_", TYPE_U24, 0, FMT_d_s]
      ];
      let data = [];
      let profil;
      if (clustID == 83) {
        if (attributeID & false) {
          profil = ICE_General;
          data["_TICFrameType"] = "ICE Generale";
        } else if (attributeID & false) {
          profil = ICE_p;
          data["_TICFrameType"] = "ICE Periode P";
        } else if (attributeID & false) {
          profil = ICE_p1;
          data["_TICFrameType"] = "ICE Periode P moins 1";
        } else {
          return data;
        }
      } else if (clustID == 84) {
        profil = CBE;
        data["_TICFrameType"] = "CBE/Historique";
      } else if (clustID == 85) {
        profil = CJE;
        data["_TICFrameType"] = "CJE";
      } else if (clustID == 86) {
        profil = STD;
        data["_TICFrameType"] = "Standard";
      } else if (clustID == 87) {
        profil = PMEPMI;
        data["_TICFrameType"] = "PMEPMI";
      } else {
        return data;
        data["_TICFrameType"] = "Unexpected";
      }
      let { DescSize, Indexes } = TICParseDescToIndexes(BytesAfterSize);
      var DescBytes = BytesAfterSize.slice(0, DescSize);
      var x = {};
      if ((DescBytes[0] & 128) == 128) {
        x.Obsolete = true;
      }
      x.Bytes = BytesToHexStr(DescBytes);
      x.Indexes = Indexes;
      data["_Descriptor"] = x;
      var bytesIndex = DescSize;
      for (var j = 0; j < Indexes.length; j++) {
        const fieldIndex = Indexes[j];
        const d = profil[fieldIndex][1](BytesAfterSize, bytesIndex);
        data[profil[fieldIndex][0]] = profil[fieldIndex][3](d.x);
        bytesIndex = d.i;
      }
      return data;
    }
    function decimalToBitString(dec) {
      var bitString = "";
      var bin = dec.toString(2);
      bitString += zeroPad(bin, 8);
      return bitString;
    }
    function int(value) {
      return parseInt(value, 2);
    }
    function alarmShort(length, listMess, flag, bytes, decoded, i1) {
      let i = 0;
      while (flag === 0) {
        let bi = bytes[i1 + length * i];
        if (bi === void 0) {
          decoded.zclheader.alarmmsg = listMess;
          flag = 1;
          break;
        }
        let csd = decimalToBitString(bi);
        let index = int(csd[5]) * 4 + int(csd[6]) * 2 + int(csd[7]);
        if (csd[3] === "1" && csd[4] === "0") {
          let qual = "";
          if (csd[1] === "1") {
            qual = "exceed";
          } else {
            qual = "fall";
          }
          let mess = "alarm, criterion_index: " + index + ", mode: threshold, crossing: " + qual;
          listMess.push(mess);
        }
        if (csd[3] === "0" && csd[4] === "1") {
          let mess = "alarm, criterion_index: " + index + ", mode: delta";
          listMess.push(mess);
        }
        i += 1;
      }
    }
    function alarmLong(clustID, attID, length, listMess, flag, bytes, decoded, i1, attribute_type, divider, ftype, field_index) {
      let type = attribute_types[attribute_type];
      let function_type = ftype;
      let field_driven = 0;
      let size = type.size;
      let name = type.name;
      if (field_index !== void 0) {
        field_driven = 1;
        size = field[clustID][attID][field_index].size;
      }
      if (size === 2) {
        alarmLong2Bytes(length, listMess, flag, bytes, decoded, i1, divider, name, function_type, field_driven, clustID, attID);
      } else if (size === 4) {
        alarmLong4Bytes(length, listMess, flag, bytes, decoded, i1, divider, name, function_type, field_driven, clustID, attID);
      } else if (size === 1) {
        alarmLong1Bytes(length, listMess, flag, bytes, decoded, i1, divider, name, function_type, field_driven, clustID, attID);
      } else if (size === 3) {
        alarmLong3Bytes(length, listMess, flag, bytes, decoded, i1, divider, name, function_type, field_driven, clustID, attID);
      }
    }
    function alarmLong1Bytes(length, listMess, flag, bytes, decoded, i1, divider, name, function_type, field_driven, clustID, attID) {
      let i = 0;
      let shift = 0;
      let count = 0;
      let countUp = 0;
      let countDown = 0;
      let i2 = 0;
      if (field_driven === 1) {
        length += 1;
        i2 = 1;
      }
      if (function_type === void 0) {
        if (name === "single") {
          function_type = "float";
        } else if (name === "int8" || name === "int16" || name === "int32") {
          function_type = "int";
        } else {
          function_type = "none";
        }
      }
      let bi = bytes[i1 + length * i];
      if (bi === void 0) {
        decoded.zclheader.alarmmsg = listMess;
        flag = 1;
      }
      while (flag === 0) {
        if (field_driven === 1) {
          let fi = bytes[i1 + length * i + 1 + shift];
          divider = field[clustID][attID][fi].divider;
          function_type = field[clustID][attID][fi].function_type;
        }
        let csd = decimalToBitString(bi);
        let index = int(csd[5]) * 4 + int(csd[6]) * 2 + int(csd[7]);
        if (csd[3] === "1" && csd[4] === "0") {
          let temp = "";
          let mess = "";
          let gap = "";
          let qual = "";
          if (csd[1] === "1") {
            qual = "exceed";
          } else {
            qual = "fall";
          }
          if (i2 === 0) {
            if (function_type === "none") {
              temp = (bytes[i1 + 1 + length * i + shift] / divider).toString();
              gap = (bytes[i1 + 2 + length * i + shift] / divider).toString();
            } else if (function_type === "int") {
              temp = UintToInt(bytes[i1 + 1 + length * i + shift] / divider).toString();
              gap = UintToInt(bytes[i1 + 2 + length * i + shift] / divider).toString();
            } else if (function_type === "float") {
              temp = Bytes2Float32(bytes[i1 + 1 + length * i + shift] / divider).toString();
              gap = Bytes2Float32(bytes[i1 + 2 + length * i + shift] / divider).toString();
            }
            count = decimalToBitString(bytes[i1 + 3 + length * i + shift]);
            count = parseInt(count, 2);
            if (count >= 128) {
              countUp = decimalToBitString(bytes[i1 + 4 + length * i + shift] * 256 + bytes[i1 + 5 + length * i + shift]);
              countUp = parseInt(countUp, 2);
              countDown = decimalToBitString(bytes[i1 + 6 + length * i + shift] * 256 + bytes[i1 + 7 + length * i + shift]);
              countDown = parseInt(countDown, 2);
              shift += 4;
              mess = "alarm, criterion_index: " + index + ", mode: threshold, crossing: " + qual + ", value: " + temp + ", gap: " + gap + ", occurences_up: " + countUp + ", occurences_down: " + countDown;
            } else {
              mess = "alarm, criterion_index: " + index + ", mode: threshold, crossing: " + qual + ", value: " + temp + ", gap: " + gap + ", occurences: " + count;
            }
          } else {
            let fi = bytes[i1 + length * i + 1 + shift];
            let alarm_field = field[clustID][attID][fi].name;
            if (function_type === "none") {
              temp = (bytes[i1 + 2 + length * i + shift] / divider).toString();
              gap = (bytes[i1 + 3 + length * i + shift] / divider).toString();
            } else if (function_type === "int") {
              temp = UintToInt(bytes[i1 + 2 + length * i + shift] / divider).toString();
              gap = UintToInt(bytes[i1 + 3 + length * i + shift] / divider).toString();
            } else if (function_type === "float") {
              temp = Bytes2Float32(bytes[i1 + 2 + length * i + shift] / divider).toString();
              gap = Bytes2Float32(bytes[i1 + 3 + length * i + shift] / divider).toString();
            }
            count = decimalToBitString(bytes[i1 + 4 + length * i + shift]);
            count = parseInt(count, 2);
            if (count >= 128) {
              countUp = decimalToBitString(bytes[i1 + 5 + length * i + shift] * 256 + bytes[i1 + 6 + length * i + shift]);
              countUp = parseInt(countUp, 2);
              countDown = decimalToBitString(bytes[i1 + 7 + length * i + shift] * 256 + bytes[i1 + 8 + length * i + shift]);
              countDown = parseInt(countDown, 2);
              shift += 4;
              mess = "alarm, criterion_index: " + index + ", mode: threshold, crossing: " + qual + ", value: " + temp + ", gap: " + gap + ", occurences_up: " + countUp + ", occurences_down: " + countDown + ", field: " + alarm_field;
            } else {
              mess = "alarm, criterion_index: " + index + ", mode: threshold, crossing: " + qual + ", value: " + temp + ", gap: " + gap + ", occurences: " + count + ", field: " + alarm_field;
            }
          }
          listMess.push(mess);
        }
        if (csd[3] === "0" && csd[4] === "1") {
          length -= 3;
          let temp = "";
          let mess = "";
          if (i2 === 0) {
            if (function_type === "none") {
              temp = (bytes[i1 + 1 + length * i + shift] / divider).toString();
            } else if (function_type === "int") {
              temp = UintToInt(bytes[i1 + 1 + length * i + shift] / divider).toString();
            } else if (function_type === "float") {
              temp = Bytes2Float32(bytes[i1 + 1 + length * i + shift] / divider).toString();
            }
            mess = "alarm, criterion_index: " + index + ", mode: delta, value: " + temp;
          } else {
            let fi = bytes[i1 + length * i + 1 + shift];
            let alarm_field = field[clustID][attID][fi].name;
            if (function_type === "none") {
              temp = (bytes[i1 + 2 + length * i + shift] / divider).toString();
            } else if (function_type === "int") {
              temp = UintToInt(bytes[i1 + 2 + length * i + shift] / divider).toString();
            } else if (function_type === "float") {
              temp = Bytes2Float32(bytes[i1 + 2 + length * i + shift] / divider).toString();
            }
            mess = "alarm, criterion_index: " + index + ", mode: delta, value: " + temp + ", field: " + alarm_field;
          }
          listMess.push(mess);
        }
        i += 1;
        count = 0;
        countDown = 0;
        countUp = 0;
        bi = bytes[i1 + length * i + shift];
        if (bi === void 0) {
          decoded.zclheader.alarmmsg = listMess;
          flag = 1;
          break;
        }
      }
    }
    function alarmLong3Bytes(length, listMess, flag, bytes, decoded, i1, divider, name, function_type, field_driven, clustID, attID) {
      let i = 0;
      let shift = 0;
      let count = 0;
      let countUp = 0;
      let countDown = 0;
      let i2 = 0;
      if (field_driven === 1) {
        length += 1;
        i2 = 1;
      }
      if (function_type === void 0) {
        if (name === "single") {
          function_type = "float";
        } else if (name === "int8" || name === "int16" || name === "int32") {
          function_type = "int";
        } else {
          function_type = "none";
        }
      }
      let bi = bytes[i1 + length * i];
      if (bi === void 0) {
        decoded.zclheader.alarmmsg = listMess;
        flag = 1;
      }
      while (flag === 0) {
        if (field_driven === 1) {
          let fi = bytes[i1 + length * i + 1 + shift];
          divider = field[clustID][attID][fi].divider;
          function_type = field[clustID][attID][fi].function_type;
        }
        let csd = decimalToBitString(bi);
        let index = int(csd[5]) * 4 + int(csd[6]) * 2 + int(csd[7]);
        if (csd[3] === "1" && csd[4] === "0") {
          let temp = "";
          let mess = "";
          let gap = "";
          let qual = "";
          if (csd[1] === "1") {
            qual = "exceed";
          } else {
            qual = "fall";
          }
          if (i2 === 0) {
            if (function_type === "none") {
              temp = ((bytes[i1 + 1 + length * i + shift] * 256 + bytes[i1 + 2 + length * i + shift] + bytes[i1 + 3 + length * i + shift]) / divider).toString();
              gap = ((bytes[i1 + 4 + length * i + shift] * 256 + bytes[i1 + 5 + length * i + shift] + bytes[i1 + 6 + length * i + shift]) / divider).toString();
            } else if (function_type === "int") {
              temp = UintToInt((bytes[i1 + 1 + length * i + shift] * 256 + bytes[i1 + 2 + length * i + shift] + bytes[i1 + 3 + length * i + shift]) / divider).toString();
              gap = UintToInt((bytes[i1 + 4 + length * i + shift] * 256 + bytes[i1 + 5 + length * i + shift] + bytes[i1 + 6 + length * i + shift]) / divider).toString();
            } else if (function_type === "float") {
              temp = Bytes2Float32((bytes[i1 + 1 + length * i + shift] * 256 + bytes[i1 + 2 + length * i + shift] + bytes[i1 + 3 + length * i + shift]) / divider).toString();
              gap = Bytes2Float32((bytes[i1 + 4 + length * i + shift] * 256 + bytes[i1 + 5 + length * i + shift] + bytes[i1 + 6 + length * i + shift]) / divider).toString();
            }
            count = decimalToBitString(bytes[i1 + 7 + length * i + shift]);
            count = parseInt(count, 2);
            if (count >= 128) {
              countUp = decimalToBitString(bytes[i1 + 8 + length * i + shift] * 256 + bytes[i1 + 9 + length * i + shift]);
              countUp = parseInt(countUp, 2);
              countDown = decimalToBitString(bytes[i1 + 10 + length * i + shift] * 256 + bytes[i1 + 11 + length * i + shift]);
              countDown = parseInt(countDown, 2);
              shift += 4;
              mess = "alarm, criterion_index: " + index + ", mode: threshold, crossing: " + qual + ", value: " + temp + ", gap: " + gap + ", occurences_up: " + countUp + ", occurences_down: " + countDown;
            } else {
              mess = "alarm, criterion_index: " + index + ", mode: threshold, crossing: " + qual + ", value: " + temp + ", gap: " + gap + ", occurences: " + count;
            }
          } else {
            let fi = bytes[i1 + length * i + 1 + shift];
            let alarm_field = field[clustID][attID][fi].name;
            if (function_type === "none") {
              temp = ((bytes[i1 + 2 + length * i + shift] * 256 + bytes[i1 + 3 + length * i + shift] + bytes[i1 + 4 + length * i + shift]) / divider).toString();
              gap = ((bytes[i1 + 5 + length * i + shift] * 256 + bytes[i1 + 6 + length * i + shift] + bytes[i1 + 7 + length * i + shift]) / divider).toString();
            } else if (function_type === "int") {
              temp = UintToInt((bytes[i1 + 2 + length * i + shift] * 256 + bytes[i1 + 3 + length * i + shift] + bytes[i1 + 4 + length * i + shift]) / divider).toString();
              gap = UintToInt((bytes[i1 + 5 + length * i + shift] * 256 + bytes[i1 + 6 + length * i + shift] + bytes[i1 + 7 + length * i + shift]) / divider).toString();
            } else if (function_type === "float") {
              temp = Bytes2Float32((bytes[i1 + 2 + length * i + shift] * 256 + bytes[i1 + 3 + length * i + shift] + bytes[i1 + 4 + length * i + shift]) / divider).toString();
              gap = Bytes2Float32((bytes[i1 + 5 + length * i + shift] * 256 + bytes[i1 + 6 + length * i + shift] + bytes[i1 + 7 + length * i + shift]) / divider).toString();
            }
            count = decimalToBitString(bytes[i1 + 8 + length * i + shift]);
            count = parseInt(count, 2);
            if (count >= 128) {
              countUp = decimalToBitString(bytes[i1 + 9 + length * i + shift] * 256 + bytes[i1 + 10 + length * i + shift]);
              countUp = parseInt(countUp, 2);
              countDown = decimalToBitString(bytes[i1 + 11 + length * i + shift] * 256 + bytes[i1 + 12 + length * i + shift]);
              countDown = parseInt(countDown, 2);
              shift += 4;
              mess = "alarm, criterion_index: " + index + ", mode: threshold, crossing: " + qual + ", value: " + temp + ", gap: " + gap + ", occurences_up: " + countUp + ", occurences_down: " + countDown + ", field: " + alarm_field;
            } else {
              mess = "alarm, criterion_index: " + index + ", mode: threshold, crossing: " + qual + ", value: " + temp + ", gap: " + gap + ", occurences: " + count + ", field: " + alarm_field;
            }
          }
          listMess.push(mess);
        }
        if (csd[3] === "0" && csd[4] === "1") {
          length -= 3;
          let temp = "";
          let mess = "";
          if (i2 === 0) {
            if (function_type === "none") {
              temp = ((bytes[i1 + 1 + length * i + shift] * 256 * 256 + bytes[i1 + 2 + length * i + shift] * 256 + bytes[i1 + 3 + length * i + shift]) / divider).toString();
            } else if (function_type === "int") {
              temp = UintToInt((bytes[i1 + 1 + length * i + shift] * 256 + bytes[i1 + 2 + length * i + shift] + bytes[i1 + 3 + length * i + shift]) / divider).toString();
            } else if (function_type === "float") {
              temp = Bytes2Float32((bytes[i1 + 1 + length * i + shift] * 256 + bytes[i1 + 2 + length * i + shift] + bytes[i1 + 3 + length * i + shift]) / divider).toString();
            }
            mess = "alarm, criterion_index: " + index + ", mode: delta, value: " + temp;
          } else {
            let fi = bytes[i1 + length * i + 1];
            let alarm_field = field[clustID][attID][fi].name;
            if (function_type === "none") {
              temp = ((bytes[i1 + 2 + length * i + shift] * 256 + bytes[i1 + 3 + length * i + shift] + bytes[i1 + 4 + length * i + shift]) / divider).toString();
            } else if (function_type === "int") {
              temp = UintToInt((bytes[i1 + 2 + length * i + shift] * 256 + bytes[i1 + 3 + length * i + shift] + bytes[i1 + 4 + length * i + shift]) / divider).toString();
            } else if (function_type === "float") {
              temp = Bytes2Float32((bytes[i1 + 2 + length * i + shift] * 256 + bytes[i1 + 3 + length * i + shift] + bytes[i1 + 4 + length * i + shift]) / divider).toString();
            }
            mess = "alarm, criterion_index: " + index + ", mode: delta, value: " + temp + ", field: " + alarm_field;
          }
          listMess.push(mess);
        }
        i += 1;
        count = 0;
        countDown = 0;
        countUp = 0;
        bi = bytes[i1 + length * i + shift];
        if (bi === void 0) {
          decoded.zclheader.alarmmsg = listMess;
          flag = 1;
          break;
        }
      }
    }
    function alarmLong2Bytes(length, listMess, flag, bytes, decoded, i1, divider, name, function_type, field_driven, clustID, attID) {
      let i = 0;
      let count = 0;
      let countUp = 0;
      let countDown = 0;
      let shift = 0;
      let i2 = 0;
      if (field_driven === 1) {
        length += 1;
        i2 = 1;
      }
      if (function_type === void 0) {
        if (name === "single") {
          function_type = "float";
        } else if (name === "int8" || name === "int16" || name === "int32") {
          function_type = "int";
        } else {
          function_type = "none";
        }
      }
      let bi = bytes[i1 + length * i];
      if (bi === void 0) {
        decoded.zclheader.alarmmsg = listMess;
        flag = 1;
      }
      while (flag === 0) {
        if (field_driven === 1) {
          let fi = bytes[i1 + length * i + 1 + shift];
          divider = field[clustID][attID][fi].divider;
          function_type = field[clustID][attID][fi].function_type;
        }
        let csd = decimalToBitString(bi);
        let index = int(csd[5]) * 4 + int(csd[6]) * 2 + int(csd[7]);
        if (csd[3] === "1" && csd[4] === "0") {
          let temp = "";
          let mess = "";
          let gap = "";
          let qual = "";
          if (csd[1] === "1") {
            qual = "exceed";
          } else {
            qual = "fall";
          }
          if (i2 === 0) {
            if (function_type === "none") {
              temp = ((bytes[i1 + 1 + length * i + shift] * 256 + bytes[i1 + 2 + length * i + shift]) / divider).toString();
              gap = ((bytes[i1 + 3 + length * i + shift] * 256 + bytes[i1 + 4 + length * i + shift]) / divider).toString();
            } else if (function_type === "int") {
              temp = UintToInt((bytes[i1 + 1 + length * i + shift] * 256 + bytes[i1 + 2 + length * i + shift]) / divider).toString();
              gap = UintToInt((bytes[i1 + 3 + length * i + shift] * 256 + bytes[i1 + 4 + length * i + shift]) / divider).toString();
            } else if (function_type === "float") {
              temp = Bytes2Float32((bytes[i1 + 1 + length * i + shift] * 256 + bytes[i1 + 2 + length * i] + shift) / divider).toString();
              gap = Bytes2Float32((bytes[i1 + 3 + length * i + shift] * 256 + bytes[i1 + 4 + length * i] + shift) / divider).toString();
            }
            count = decimalToBitString(bytes[i1 + 5 + length * i + shift]);
            count = parseInt(count, 2);
            if (count >= 128) {
              countUp = decimalToBitString(bytes[i1 + 6 + length * i + shift] * 256 + bytes[i1 + 7 + length * i + shift]);
              countUp = parseInt(countUp, 2);
              countDown = decimalToBitString(bytes[i1 + 8 + length * i + shift] * 256 + bytes[i1 + 9 + length * i + shift]);
              countDown = parseInt(countDown, 2);
              shift += 4;
              mess = "alarm, criterion_index: " + index + ", mode: threshold, crossing: " + qual + ", value: " + temp + ", gap: " + gap + ", occurences_up: " + countUp + ", occurences_down: " + countDown;
            } else {
              mess = "alarm, criterion_index: " + index + ", mode: threshold, crossing: " + qual + ", value: " + temp + ", gap: " + gap + ", occurences: " + count;
            }
          } else {
            let fi = bytes[i1 + length * i + 1 + shift];
            let alarm_field = field[clustID][attID][fi].name;
            if (function_type === "none") {
              temp = ((bytes[i1 + 2 + length * i + shift] * 256 + bytes[i1 + 3 + length * i + shift]) / divider).toString();
              gap = ((bytes[i1 + 4 + length * i + shift] * 256 + bytes[i1 + 5 + length * i + shift]) / divider).toString();
            } else if (function_type === "int") {
              temp = UintToInt((bytes[i1 + 2 + length * i + shift] * 256 + bytes[i1 + 3 + length * i + shift]) / divider).toString();
              gap = UintToInt((bytes[i1 + 4 + length * i + shift] * 256 + bytes[i1 + 5 + length * i + shift]) / divider).toString();
            } else if (function_type === "float") {
              temp = Bytes2Float32((bytes[i1 + 2 + length * i + shift] * 256 + bytes[i1 + 3 + length * i + shift]) / divider).toString();
              gap = Bytes2Float32((bytes[i1 + 4 + length * i + shift] * 256 + bytes[i1 + 5 + length * i + shift]) / divider).toString();
            }
            count = decimalToBitString(bytes[i1 + 6 + length * i + shift]);
            count = parseInt(count, 2);
            if (count >= 128) {
              countUp = decimalToBitString(bytes[i1 + 7 + length * i + shift] * 256 + bytes[i1 + 8 + length * i + shift]);
              countUp = parseInt(countUp, 2);
              countDown = decimalToBitString(bytes[i1 + 9 + length * i + shift] * 256 + bytes[i1 + 10 + length * i + shift]);
              countDown = parseInt(countDown, 2);
              shift += 4;
              mess = "alarm, criterion_index: " + index + ", mode: threshold, crossing: " + qual + ", value: " + temp + ", gap: " + gap + ", occurences_up: " + countUp + ", occurences_down: " + countDown + ", field: " + alarm_field;
            } else {
              mess = "alarm, criterion_index: " + index + ", mode: threshold, crossing: " + qual + ", value: " + temp + ", gap: " + gap + ", occurences: " + count + ", field: " + alarm_field;
            }
          }
          listMess.push(mess);
        }
        if (csd[3] === "0" && csd[4] === "1") {
          length -= 3;
          let temp = "";
          let mess = "";
          if (i2 === 0) {
            if (function_type === "none") {
              temp = ((bytes[i1 + 1 + length * i + shift] * 256 + bytes[i1 + 2 + length * i + shift]) / divider).toString();
            } else if (function_type === "int") {
              temp = UintToInt((bytes[i1 + 1 + length * i + shift] * 256 + bytes[i1 + 2 + length * i + shift]) / divider).toString();
            } else if (function_type === "float") {
              temp = Bytes2Float32((bytes[i1 + 1 + length * i + shift] * 256 + bytes[i1 + 2 + length * i + shift]) / divider).toString();
            }
            mess = "alarm, criterion_index: " + index + ", mode: delta, value: " + temp;
          } else {
            let fi = bytes[i1 + length * i + 1 + shift];
            let alarm_field = field[clustID][attID][fi].name;
            if (function_type === "none") {
              temp = ((bytes[i1 + 2 + length * i + shift] * 256 + bytes[i1 + 3 + length * i + shift]) / divider).toString();
            } else if (function_type === "int") {
              temp = UintToInt((bytes[i1 + 2 + length * i + shift] * 256 + bytes[i1 + 3 + length * i + shift]) / divider).toString();
            } else if (function_type === "float") {
              temp = Bytes2Float32((bytes[i1 + 2 + length * i + shift] * 256 + bytes[i1 + 3 + length * i + shift]) / divider).toString();
            }
            mess = "alarm, criterion_index: " + index + ", mode: delta, value: " + temp + ", field: " + alarm_field;
          }
          listMess.push(mess);
        }
        i += 1;
        count = 0;
        countDown = 0;
        countUp = 0;
        bi = bytes[i1 + length * i + shift];
        if (bi === void 0) {
          decoded.zclheader.alarmmsg = listMess;
          flag = 1;
          break;
        }
      }
    }
    function alarmLong4Bytes(length, listMess, flag, bytes, decoded, i1, divider, name, function_type, field_driven, clustID, attID) {
      let i = 0;
      let shift = 0;
      let count = 0;
      let countUp = 0;
      let countDown = 0;
      let i2 = 0;
      if (field_driven === 1) {
        length += 1;
        i2 = 1;
      }
      if (function_type === void 0) {
        if (name === "single") {
          function_type = "float";
        } else if (name === "int8" || name === "int16" || name === "int32") {
          function_type = "int";
        } else {
          function_type = "none";
        }
      }
      let bi = bytes[i1 + length * i];
      if (bi === void 0) {
        decoded.zclheader.alarmmsg = listMess;
        flag = 1;
      }
      while (flag === 0) {
        if (field_driven === 1) {
          let fi = bytes[i1 + length * i + 1 + shift];
          divider = field[clustID][attID][fi].divider;
          function_type = field[clustID][attID][fi].function_type;
        }
        let csd = decimalToBitString(bi);
        let index = int(csd[5]) * 4 + int(csd[6]) * 2 + int(csd[7]);
        if (csd[3] === "1" && csd[4] === "0") {
          let temp = "";
          let mess = "";
          let gap = "";
          let qual = "";
          if (csd[1] === "1") {
            qual = "exceed";
          } else {
            qual = "fall";
          }
          if (i2 === 0) {
            if (function_type === "none") {
              temp = ((bytes[i1 + 1 + length * i + shift] * 256 * 256 * 256 + bytes[i1 + 2 + length * i + shift] * 256 * 256 + bytes[i1 + 3 + length * i + shift] * 256 + bytes[i1 + 4 + length * i + shift]) / divider).toString();
              gap = ((bytes[i1 + 5 + length * i + shift] * 256 * 256 * 256 + bytes[i1 + 6 + length * i + shift] * 256 * 256 + bytes[i1 + 7 + length * i + shift] * 256 + bytes[i1 + 8 + length * i + shift]) / divider).toString();
            } else if (function_type === "int") {
              temp = UintToInt((bytes[i1 + 1 + length * i + shift] * 256 * 256 * 256 + bytes[i1 + 2 + length * i + shift] * 256 * 256 + bytes[i1 + 3 + length * i + shift] * 256 + bytes[i1 + 4 + length * i + shift]) / divider).toString();
              gap = UintToInt((bytes[i1 + 5 + length * i + shift] * 256 * 256 * 256 + bytes[i1 + 6 + length * i + shift] * 256 * 256 + bytes[i1 + 7 + length * i + shift] * 256 + bytes[i1 + 8 + length * i + shift]) / divider).toString();
            } else if (function_type === "float") {
              temp = Bytes2Float32((bytes[i1 + 1 + length * i + shift] * 256 * 256 * 256 + bytes[i1 + 2 + length * i + shift] * 256 * 256 + bytes[i1 + 3 + length * i + shift] * 256 + bytes[i1 + 4 + length * i + shift]) / divider).toString();
              gap = Bytes2Float32((bytes[i1 + 5 + length * i + shift] * 256 * 256 * 256 + bytes[i1 + 6 + length * i + shift] * 256 * 256 + bytes[i1 + 7 + length * i + shift] * 256 + bytes[i1 + 8 + length * i + shift]) / divider).toString();
            }
            count = decimalToBitString(bytes[i1 + 9 + length * i + shift]);
            count = parseInt(count, 2);
            if (count >= 128) {
              countUp = decimalToBitString(bytes[i1 + 10 + length * i + shift] * 256 + bytes[i1 + 11 + length * i + shift]);
              countUp = parseInt(countUp, 2);
              countDown = decimalToBitString(bytes[i1 + 12 + length * i + shift] * 256 + bytes[i1 + 13 + length * i + shift]);
              countDown = parseInt(countDown, 2);
              shift += 4;
              mess = "alarm, criterion_index: " + index + ", mode: threshold, crossing: " + qual + ", value: " + temp + ", gap: " + gap + ", occurences_up: " + countUp + ", occurences_down: " + countDown;
            } else {
              mess = "alarm, criterion_index: " + index + ", mode: threshold, crossing: " + qual + ", value: " + temp + ", gap: " + gap + ", occurences: " + count;
            }
          } else {
            let fi = bytes[i1 + length * i + 1];
            let alarm_field = field[clustID][attID][fi].name;
            if (function_type === "none") {
              temp = ((bytes[i1 + 2 + length * i + shift] * 256 * 256 * 256 + bytes[i1 + 3 + length * i + shift] * 256 * 256 + bytes[i1 + 4 + length * i + shift] * 256 + bytes[i1 + 5 + length * i + shift]) / divider).toString();
              gap = ((bytes[i1 + 6 + length * i + shift] * 256 * 256 * 256 + bytes[i1 + 7 + length * i + shift] * 256 * 256 + bytes[i1 + 8 + length * i + shift] * 256 + bytes[i1 + 9 + length * i + shift]) / divider).toString();
            } else if (function_type === "int") {
              temp = UintToInt((bytes[i1 + 2 + length * i + shift] * 256 * 256 * 256 + bytes[i1 + 3 + length * i + shift] * 256 * 256 + bytes[i1 + 4 + length * i + shift] * 256 + bytes[i1 + 5 + length * i + shift]) / divider).toString();
              gap = UintToInt((bytes[i1 + 6 + length * i + shift] * 256 * 256 * 256 + bytes[i1 + 7 + length * i + shift] * 256 * 256 + bytes[i1 + 8 + length * i + shift] * 256 + bytes[i1 + 9 + length * i + shift]) / divider).toString();
            } else if (function_type === "float") {
              temp = Bytes2Float32((bytes[i1 + 2 + length * i + shift] * 256 * 256 * 256 + bytes[i1 + 3 + length * i + shift] * 256 * 256 + bytes[i1 + 4 + length * i + shift] * 256 + bytes[i1 + 5 + length * i + shift]) / divider).toString();
              gap = Bytes2Float32((bytes[i1 + 6 + length * i + shift] * 256 * 256 * 256 + bytes[i1 + 7 + length * i + shift] * 256 * 256 + bytes[i1 + 8 + length * i + shift] * 256 + bytes[i1 + 9 + length * i + shift]) / divider).toString();
            }
            count = decimalToBitString(bytes[i1 + 10 + length * i + shift]);
            count = parseInt(count, 2);
            if (count >= 128) {
              countUp = decimalToBitString(bytes[i1 + 11 + length * i + shift] * 256 + bytes[i1 + 12 + length * i + shift]);
              countUp = parseInt(countUp, 2);
              countDown = decimalToBitString(bytes[i1 + 13 + length * i + shift] * 256 + bytes[i1 + 14 + length * i + shift]);
              countDown = parseInt(countDown, 2);
              shift += 4;
              mess = "alarm, criterion_index: " + index + ", mode: threshold, crossing: " + qual + ", value: " + temp + ", gap: " + gap + ", occurences_up: " + countUp + ", occurences_down: " + countDown + ", field: " + alarm_field;
            } else {
              mess = "alarm, criterion_index: " + index + ", mode: threshold, crossing: " + qual + ", value: " + temp + ", gap: " + gap + ", occurences: " + count + ", field: " + alarm_field;
            }
          }
          listMess.push(mess);
        }
        if (csd[3] === "0" && csd[4] === "1") {
          length -= 3;
          let temp = "";
          let mess = "";
          if (i2 === 0) {
            if (function_type === "none") {
              temp = ((bytes[i1 + 1 + length * i + shift] * 256 * 256 * 256 + bytes[i1 + 2 + length * i + shift] * 256 * 256 + bytes[i1 + 3 + length * i + shift] * 256 + bytes[i1 + 4 + length * i + shift]) / divider).toString();
            } else if (function_type === "int") {
              temp = UintToInt((bytes[i1 + 1 + length * i + shift] * 256 * 256 * 256 + bytes[i1 + 2 + length * i + shift] * 256 * 256 + bytes[i1 + 3 + length * i + shift] * 256 + bytes[i1 + 4 + length * i + shift]) / divider).toString();
            } else if (function_type === "float") {
              temp = Bytes2Float32((bytes[i1 + 1 + length * i + shift] * 256 * 256 * 256 + bytes[i1 + 2 + length * i + shift] * 256 * 256 + bytes[i1 + 3 + length * i + shift] * 256 + bytes[i1 + 4 + length * i + shift]) / divider).toString();
            }
            mess = "alarm, criterion_index: " + index + ", mode: delta, value: " + temp;
          } else {
            let fi = bytes[i1 + length * i + 1];
            let alarm_field = field[clustID][attID][fi].name;
            if (function_type === "none") {
              temp = ((bytes[i1 + 2 + length * i + shift] * 256 * 256 * 256 + bytes[i1 + 3 + length * i + shift] * 256 * 256 + bytes[i1 + 4 + length * i + shift] * 256 + bytes[i1 + 5 + length * i + shift]) / divider).toString();
            } else if (function_type === "int") {
              temp = UintToInt((bytes[i1 + 2 + length * i + shift] * 256 * 256 * 256 + bytes[i1 + 3 + length * i + shift] * 256 * 256 + bytes[i1 + 4 + length * i + shift] * 256 + bytes[i1 + 5 + length * i + shift]) / divider).toString();
            } else if (function_type === "float") {
              temp = Bytes2Float32((bytes[i1 + 2 + length * i + shift] * 256 * 256 * 256 + bytes[i1 + 3 + length * i + shift] * 256 * 256 + bytes[i1 + 4 + length * i + shift] * 256 + bytes[i1 + 5 + length * i + shift]) / divider).toString();
            }
            mess = "alarm, criterion_index: " + index + ", mode: delta, value: " + temp + ", field: " + alarm_field;
          }
          listMess.push(mess);
        }
        i += 1;
        count = 0;
        countDown = 0;
        countUp = 0;
        bi = bytes[i1 + length * i + shift];
        if (bi === void 0) {
          decoded.zclheader.alarmmsg = listMess;
          flag = 1;
          break;
        }
      }
    }
    function BytesToHexStr(InBytes) {
      let HexStr = "";
      for (let j = 0; j < InBytes.length; j++) {
        let tmpHex = InBytes[j].toString(16).toUpperCase();
        if (tmpHex.length === 1) tmpHex = "0" + tmpHex;
        HexStr += tmpHex;
      }
      return HexStr;
    }
    function Decoder(bytes, port) {
      let decoded = {};
      decoded.lora = {};
      decoded.lora.port = port;
      let bytes_len_ = bytes.length;
      let temp_hex_str = "";
      decoded.lora.payload = "";
      for (let j = 0; j < bytes_len_; j++) {
        temp_hex_str = bytes[j].toString(16).toUpperCase();
        if (temp_hex_str.length === 1) temp_hex_str = "0" + temp_hex_str;
        decoded.lora.payload += temp_hex_str;
        let date = /* @__PURE__ */ new Date();
        decoded.lora.date = date.toISOString();
      }
      if (port === 125) {
        let batch = !(bytes[0] & 1);
        if (batch === false) {
          decoded.zclheader = {};
          decoded.zclheader.report = "standard";
          let attID = -1;
          let cmdID = -1;
          let clustID = -1;
          decoded.zclheader.endpoint = (bytes[0] & 224) >> 5 | (bytes[0] & 6) << 2;
          cmdID = bytes[1];
          decoded.zclheader.cmdID = decimalToHex(cmdID, 2);
          clustID = bytes[2] * 256 + bytes[3];
          decoded.zclheader.clustID = decimalToHex(clustID, 4);
          if (cmdID === 10 | cmdID === 138 | cmdID === 1) {
            decoded.data = {};
            attID = bytes[4] * 256 + bytes[5];
            decoded.zclheader.attID = decimalToHex(attID, 4);
            let firsthalfattID = bytes[4];
            let i1 = 0;
            if (cmdID === 10 || cmdID === 138) i1 = 7;
            if (cmdID === 138) decoded.zclheader.alarm = 1;
            if (cmdID === 1) {
              i1 = 8;
              decoded.zclheader.status = bytes[6];
            }
            if (clustID === 83 || clustID === 84 || clustID === 85 || clustID === 86 || clustID === 87) {
              decoded.data = TIC_Decode(clustID, attID, bytes.slice(i1 + 1));
            }
            if (clustID === 0 && attID === 2) {
              decoded.data.firmware = "";
              for (let i = 0; i < 3; i++) {
                decoded.data.firmware += String(bytes[i1 + i]);
                if (i < 2) decoded.data.firmware += ".";
              }
              let rcbuild = bytes[i1 + 3] * 256 * 256 + bytes[i1 + 4] * 256 + bytes[i1 + 5];
              decoded.data.firmware += "." + rcbuild.toString();
            }
            if (clustID === 0 && attID === 3) {
              let length = bytes[i1];
              decoded.data.kernel = "";
              for (let i = 0; i < length; i++) {
                decoded.data.kernel += String.fromCharCode(bytes[i1 + 1 + i]);
              }
            }
            if (clustID === 0 && attID === 4) {
              let length = bytes[i1];
              decoded.data.manufacturer = "";
              for (let i = 0; i < length; i++) {
                decoded.data.manufacturer += String.fromCharCode(bytes[i1 + 1 + i]);
              }
            }
            if (clustID === 0 && attID === 5) {
              let length = bytes[i1];
              decoded.data.model = "";
              for (let i = 0; i < length; i++) {
                decoded.data.model += String.fromCharCode(bytes[i1 + 1 + i]);
              }
            }
            if (clustID === 0 && attID === 6) {
              let length = bytes[i1];
              decoded.data.date = "";
              for (let i = 0; i < length; i++) {
                decoded.data.date += String.fromCharCode(bytes[i1 + 1 + i]);
              }
            }
            if (clustID === 0 && attID === 16) {
              let length = bytes[i1];
              decoded.data.position = "";
              for (let i = 0; i < length; i++) {
                decoded.data.position += String.fromCharCode(bytes[i1 + 1 + i]);
              }
            }
            if (clustID === 0 && attID === 32769) {
              let length = bytes[i1];
              decoded.data.application_name = "";
              for (let i = 0; i < length; i++) {
                decoded.data.application_name += String.fromCharCode(bytes[i1 + 1 + i]);
              }
            }
            if (clustID === 1026 && attID === 0) {
              let attribute_type = bytes[i1 - 1];
              decoded.data.temperature = UintToInt(bytes[i1] * 256 + bytes[i1 + 1], 2) / 100;
              let ia = i1 + 2;
              if (cmdID === 138 || bytes[ia] !== void 0) {
                let listMess = [];
                let flag = 0;
                let divider = 100;
                let rc = "";
                let ftype = "int";
                rc = decimalToBitString(bytes[ia]);
                ia += 1;
                if (rc[2] === "0" && rc[3] === "0") {
                  listMess.push("alarm triggered");
                  decoded.zclheader.alarmmsg = listMess;
                }
                if (rc[2] === "0" && rc[3] === "1") {
                  let length = 1;
                  alarmShort(length, listMess, flag, bytes, decoded, ia);
                }
                if (rc[2] === "1" && rc[3] === "0") {
                  let length = 6;
                  alarmLong(clustID, attID, length, listMess, flag, bytes, decoded, ia, attribute_type, divider, ftype);
                }
              }
            }
            if (clustID === 1026 && attID === 1) {
              decoded.data.min_temperature = UintToInt(bytes[i1] * 256 + bytes[i1 + 1], 2) / 100;
            }
            if (clustID === 1026 && attID === 2) {
              decoded.data.max_temperature = UintToInt(bytes[i1] * 256 + bytes[i1 + 1], 2) / 100;
            }
            if (clustID === 1029 && attID === 0) {
              let attribute_type = bytes[i1 - 1];
              decoded.data.humidity = (bytes[i1] * 256 + bytes[i1 + 1]) / 100;
              let ia = i1 + 2;
              if (cmdID === 138 || bytes[ia] !== void 0) {
                let listMess = [];
                let flag = 0;
                let divider = 100;
                let rc = "";
                let ftype = "none";
                rc = decimalToBitString(bytes[ia]);
                ia += 1;
                if (rc[2] === "0" && rc[3] === "0") {
                  listMess.push("alarm triggered");
                  decoded.zclheader.alarmmsg = listMess;
                }
                if (rc[2] === "0" && rc[3] === "1") {
                  let length = 1;
                  alarmShort(length, listMess, flag, bytes, decoded, ia);
                }
                if (rc[2] === "1" && rc[3] === "0") {
                  let length = 6;
                  alarmLong(clustID, attID, length, listMess, flag, bytes, decoded, ia, attribute_type, divider, ftype);
                }
              }
            }
            if (clustID === 1029 && attID === 1) decoded.data.min_humidity = (bytes[i1] * 256 + bytes[i1 + 1]) / 100;
            if (clustID === 1029 && attID === 2) decoded.data.max_humidity = (bytes[i1] * 256 + bytes[i1 + 1]) / 100;
            if (clustID === 15 && attID === 1026) {
              let attribute_type = bytes[i1 - 1];
              decoded.data.index = bytes[i1] * 256 * 256 * 256 + bytes[i1 + 1] * 256 * 256 + bytes[i1 + 2] * 256 + bytes[i1 + 3];
              let ia = i1 + 4;
              if (cmdID === 138 || bytes[ia] !== void 0) {
                let listMess = [];
                let flag = 0;
                let divider = 1;
                let rc = "";
                let ftype = "none";
                rc = decimalToBitString(bytes[ia]);
                ia += 1;
                if (rc[2] === "0" && rc[3] === "0") {
                  listMess.push("alarm triggered");
                  decoded.zclheader.alarmmsg = listMess;
                }
                if (rc[2] === "0" && rc[3] === "1") {
                  let length = 1;
                  alarmShort(length, listMess, flag, bytes, decoded, ia);
                }
                if (rc[2] === "1" && rc[3] === "0") {
                  let length = 10;
                  alarmLong(clustID, attID, length, listMess, flag, bytes, decoded, ia, attribute_type, divider, ftype);
                }
              }
            }
            if (clustID === 15 && attID === 85) {
              let attribute_type = bytes[i1 - 1];
              decoded.data.pin_state = !!bytes[i1];
              let ia = i1 + 1;
              if (cmdID === 138 || bytes[ia] !== void 0) {
                let listMess = [];
                let flag = 0;
                let divider = 1;
                let rc = "";
                let ftype = "none";
                rc = decimalToBitString(bytes[ia]);
                ia += 1;
                if (rc[2] === "0" && rc[3] === "0") {
                  listMess.push("alarm triggered");
                  decoded.zclheader.alarmmsg = listMess;
                }
                if (rc[2] === "0" && rc[3] === "1") {
                  let length = 1;
                  alarmShort(length, listMess, flag, bytes, decoded, ia);
                }
                if (rc[2] === "1" && rc[3] === "0") {
                  let length = 4;
                  alarmLong(clustID, attID, length, listMess, flag, bytes, decoded, ia, attribute_type, divider, ftype);
                }
              }
            }
            if (clustID === 15 && attID === 84) {
              if (bytes[i1] === 0) decoded.data.polarity = "normal";
              if (bytes[i1] === 1) decoded.data.polarity = "reverse";
            }
            if (clustID === 15 && attID === 1024) {
              if (bytes[i1] === 0) decoded.data.edge_selection = "none";
              if (bytes[i1] === 1) decoded.data.edge_selection = "falling edge";
              if (bytes[i1] === 2) decoded.data.edge_selection = "rising edge";
              if (bytes[i1] === 3) decoded.data.edge_selection = "both edges";
              if (bytes[i1] === 5) decoded.data.edge_selection = "polling and falling edge";
              if (bytes[i1] === 6) decoded.data.edge_selection = "polling and rising edge";
              if (bytes[i1] === 7) decoded.data.edge_selection = "polling and both edges";
            }
            if (clustID === 15 && attID === 1025) decoded.data.debounce_period = bytes[i1];
            if (clustID === 15 && attID === 1027) decoded.data.poll_period = bytes[i1];
            if (clustID === 15 && attID === 1028) decoded.data.force_notify = bytes[i1];
            if (clustID === 19 && attID === 85) {
              let attribute_type = bytes[i1 - 1];
              decoded.data.output_value = bytes[i1];
              let ia = i1 + 1;
              if (cmdID === 138 || bytes[ia] !== void 0) {
                let listMess = [];
                let flag = 0;
                let divider = 1;
                let rc = "";
                let ftype = "none";
                rc = decimalToBitString(bytes[ia]);
                ia += 1;
                if (rc[2] === "0" && rc[3] === "0") {
                  listMess.push("alarm triggered");
                  decoded.zclheader.alarmmsg = listMess;
                }
                if (rc[2] === "0" && rc[3] === "1") {
                  let length = 1;
                  alarmShort(length, listMess, flag, bytes, decoded, ia);
                }
                if (rc[2] === "1" && rc[3] === "0") {
                  let length = 4;
                  alarmLong(clustID, attID, length, listMess, flag, bytes, decoded, ia, attribute_type, divider, ftype);
                }
              }
            }
            if (clustID === 6 && attID === 0) {
              let state = bytes[i1];
              if (state === 1) decoded.data.output = "ON";
              else decoded.data.output = "OFF";
            }
            if (clustID === 32776 && attID === 0) {
              let attribute_type = bytes[i1 - 1];
              decoded.data.differential_pressure = bytes[i1] * 256 + bytes[i1 + 1];
              let ia = i1 + 2;
              if (cmdID === 138 || bytes[ia] !== void 0) {
                let listMess = [];
                let flag = 0;
                let divider = 1;
                let rc = "";
                let ftype = "none";
                rc = decimalToBitString(bytes[ia]);
                ia += 1;
                if (rc[2] === "0" && rc[3] === "0") {
                  listMess.push("alarm triggered");
                  decoded.zclheader.alarmmsg = listMess;
                }
                if (rc[2] === "0" && rc[3] === "1") {
                  let length = 1;
                  alarmShort(length, listMess, flag, bytes, decoded, ia);
                }
                if (rc[2] === "1" && rc[3] === "0") {
                  let length = 6;
                  alarmLong(clustID, attID, length, listMess, flag, bytes, decoded, ia, attribute_type, divider, ftype);
                }
              }
            }
            if (clustID === 32773 && attID === 0) {
              let attribute_type = bytes[i1 - 1];
              decoded.data.pin_state_1 = (bytes[i1 + 1] & 1) === 1;
              decoded.data.pin_state_2 = (bytes[i1 + 1] & 2) === 2;
              decoded.data.pin_state_3 = (bytes[i1 + 1] & 4) === 4;
              decoded.data.pin_state_4 = (bytes[i1 + 1] & 8) === 8;
              decoded.data.pin_state_5 = (bytes[i1 + 1] & 16) === 16;
              decoded.data.pin_state_6 = (bytes[i1 + 1] & 32) === 32;
              decoded.data.pin_state_7 = (bytes[i1 + 1] & 64) === 64;
              decoded.data.pin_state_8 = (bytes[i1 + 1] & 128) === 128;
              decoded.data.pin_state_9 = (bytes[i1] & 1) === 1;
              decoded.data.pin_state_10 = (bytes[i1] & 2) === 2;
              let ia = i1 + 2;
              if (cmdID === 138 || bytes[ia] !== void 0) {
                let listMess = [];
                let flag = 0;
                let divider = 100;
                let rc = "";
                let ftype = "none";
                rc = decimalToBitString(bytes[ia]);
                ia += 1;
                if (rc[2] === "0" && rc[3] === "0") {
                  listMess.push("alarm triggered");
                  decoded.zclheader.alarmmsg = listMess;
                }
                if (rc[2] === "0" && rc[3] === "1") {
                  let length = 1;
                  alarmShort(length, listMess, flag, bytes, decoded, ia);
                }
                if (rc[2] === "1" && rc[3] === "0") {
                  let length = 4;
                  alarmLong(clustID, attID, length, listMess, flag, bytes, decoded, ia, attribute_type, divider, ftype);
                }
              }
            }
            if (clustID === 32774 && attID === 0) decoded.data.speed = bytes[i1] * 256 * 256 + bytes[i1 + 1] * 256 + bytes[i1 + 2];
            if (clustID === 32774 && attID === 1) decoded.data.data_bit = bytes[i1];
            if (clustID === 32774 && attID === 2) decoded.data.parity = bytes[i1];
            if (clustID === 32774 && attID === 3) decoded.data.stop_bit = bytes[i1];
            if (clustID === 12 && attID === 85) {
              let attribute_type = bytes[i1 - 1];
              decoded.data.analog = Bytes2Float32(bytes[i1] * 256 * 256 * 256 + bytes[i1 + 1] * 256 * 256 + bytes[i1 + 2] * 256 + bytes[i1 + 3]);
              let ia = i1 + 4;
              if (cmdID === 138 || bytes[ia] !== void 0) {
                let listMess = [];
                let flag = 0;
                let divider = 1;
                let rc = "";
                let ftype = "float";
                rc = decimalToBitString(bytes[ia]);
                ia += 1;
                if (rc[2] === "0" && rc[3] === "0") {
                  listMess.push("alarm triggered");
                  decoded.zclheader.alarmmsg = listMess;
                }
                if (rc[2] === "0" && rc[3] === "1") {
                  let length = 1;
                  alarmShort(length, listMess, flag, bytes, decoded, ia);
                }
                if (rc[2] === "1" && rc[3] === "0") {
                  let length = 10;
                  alarmLong(clustID, attID, length, listMess, flag, bytes, decoded, ia, attribute_type, divider, ftype);
                }
              }
            }
            if (clustID === 12 && attID === 256) {
              if (bytes[i1 + 1] === 5) decoded.data.type = "ppm";
              if (bytes[i1 + 1] === 255 && bytes[i1 + 3] === 0) decoded.data.type = "mA";
              if (bytes[i1 + 1] === 255 && bytes[i1 + 3] === 1) decoded.data.type = "mV";
            }
            if (clustID === 12 && attID === 32771) decoded.data.power_duration = bytes[i1] * 256 + bytes[i1 + 1];
            if (clustID === 12 && attID === 32772) {
              let chockparammetters = {};
              let part1 = decimalToBitString(bytes[i1]);
              let part2 = decimalToBitString(bytes[i1 + 1]);
              let mode = part1[0] * 2 + part1[1];
              if (mode === 0) chockparammetters.mode = "idle";
              if (mode === 1) chockparammetters.mode = "chock";
              if (mode === 2) chockparammetters.mode = "click";
              let frequency = part1[2] * 8 + part1[3] * 4 + part1[4] * 2 + part1[5];
              if (frequency === 0) chockparammetters.frequency = "idle";
              if (frequency === 1) chockparammetters.frequency = "1Hz";
              if (frequency === 2) chockparammetters.frequency = "10Hz";
              if (frequency === 3) chockparammetters.frequency = "25Hz";
              if (frequency === 4) chockparammetters.frequency = "50Hz";
              if (frequency === 5) chockparammetters.frequency = "100Hz";
              if (frequency === 6) chockparammetters.frequency = "200Hz";
              if (frequency === 7) chockparammetters.frequency = "400Hz";
              if (frequency === 8) chockparammetters.frequency = "1620Hz";
              if (frequency === 9) chockparammetters.frequency = "5376Hz";
              chockparammetters.range = {};
              let range = part1[6] * 2 + part1[7];
              if (range === 0) {
                chockparammetters.range.precision = "+/- 2g";
                chockparammetters.range.value = 16;
              }
              if (range === 1) {
                chockparammetters.range.precision = "+/- 4g";
                chockparammetters.range.value = 32;
              }
              if (range === 2) {
                chockparammetters.range.precision = "+/- 8g";
                chockparammetters.range.value = 64;
              }
              if (range === 3) {
                chockparammetters.range.precision = "+/- 16g";
                chockparammetters.range.value = 128;
              }
              let multiplicator = part2[0] * 128 + part2[1] * 64 + part2[2] * 32 + part2[3] * 16 + part2[4] * 8 + part2[5] * 4 + part2[6] * 2 + part2[7];
              chockparammetters.threshold = multiplicator * chockparammetters.range.value;
            }
            if (clustID === 32775 && attID === 1) {
              decoded.data.modbus_payload = "";
              let size = bytes[i1];
              for (let j = 0; j < size; j++) {
                temp_hex_str = bytes[i1 + j + 1].toString(16).toUpperCase();
                if (j === 0) decoded.data.modbus_slaveID = bytes[i1 + j + 1];
                else if (j === 1) decoded.data.modbus_fnctID = bytes[i1 + j + 1];
                else if (j === 2) decoded.data.modbus_datasize = bytes[i1 + j + 1];
                else {
                  decoded.data.modbus_payload += temp_hex_str;
                }
              }
            }
            if (clustID === 32777 && attID === 0) {
              let b2 = bytes[i1 + 2];
              let b3 = bytes[i1 + 3];
              decoded.data.modbus_frame_series_sent = bytes[i1 + 1];
              decoded.data.modbus_frame_number_in_serie = (b2 & 224) >> 5;
              decoded.data.modbus_last_frame_of_serie = (b2 & 28) >> 2;
              decoded.data.modbus_EP9 = (b2 & 1) === 1;
              decoded.data.modbus_EP8 = (b2 & 2) === 2;
              decoded.data.modbus_EP7 = (b3 & 128) === 128;
              decoded.data.modbus_EP6 = (b3 & 64) === 64;
              decoded.data.modbus_EP5 = (b3 & 32) === 32;
              decoded.data.modbus_EP4 = (b3 & 16) === 16;
              decoded.data.modbus_EP3 = (b3 & 8) === 8;
              decoded.data.modbus_EP2 = (b3 & 4) === 4;
              decoded.data.modbus_EP1 = (b3 & 2) === 2;
              decoded.data.modbus_EP0 = (b3 & 1) === 1;
              let i2 = i1 + 4;
              let without_header = 0;
              if (decoded.data.modbus_EP0 === true) {
                if (without_header === 0) {
                  decoded.data.modbus_slaveID_EP0 = bytes[i2];
                  decoded.data.modbus_fnctID_EP0 = bytes[i2 + 1];
                  decoded.data.modbus_datasize_EP0 = bytes[i2 + 2];
                  i2 += 3;
                }
                decoded.data.modbus_payload_EP0 = "";
                if (bytes[i2] === void 0) return decoded;
                for (let j = 0; j < decoded.data.modbus_datasize_EP0; j++) {
                  temp_hex_str = bytes[i2 + j].toString(16).toUpperCase();
                  if (temp_hex_str.length === 1) temp_hex_str = "0" + temp_hex_str;
                  decoded.data.modbus_payload_EP0 += temp_hex_str;
                }
                i2 += decoded.data.modbus_datasize_EP0;
              }
              if (decoded.data.modbus_EP1 === true) {
                if (without_header === 0) {
                  decoded.data.modbus_slaveID_EP1 = bytes[i2];
                  decoded.data.modbus_fnctID_EP1 = bytes[i2 + 1];
                  decoded.data.modbus_datasize_EP1 = bytes[i2 + 2];
                  i2 += 3;
                }
                decoded.data.modbus_payload_EP1 = "";
                if (bytes[i2] === void 0) return decoded;
                for (let j = 0; j < decoded.data.modbus_datasize_EP1; j++) {
                  temp_hex_str = bytes[i2 + j].toString(16).toUpperCase();
                  if (temp_hex_str.length === 1) temp_hex_str = "0" + temp_hex_str;
                  decoded.data.modbus_payload_EP1 += temp_hex_str;
                }
                i2 += decoded.data.modbus_datasize_EP1;
              }
              if (decoded.data.modbus_EP2 === true) {
                if (without_header === 0) {
                  decoded.data.modbus_slaveID_EP2 = bytes[i2];
                  decoded.data.modbus_fnctID_EP2 = bytes[i2 + 1];
                  decoded.data.modbus_datasize_EP2 = bytes[i2 + 2];
                  i2 += 3;
                }
                decoded.data.modbus_payload_EP2 = "";
                if (bytes[i2] === void 0) return decoded;
                for (let j = 0; j < decoded.data.modbus_datasize_EP2; j++) {
                  temp_hex_str = bytes[i2 + j].toString(16).toUpperCase();
                  if (temp_hex_str.length === 1) temp_hex_str = "0" + temp_hex_str;
                  decoded.data.modbus_payload_EP2 += temp_hex_str;
                }
                i2 += decoded.data.modbus_datasize_EP2;
              }
              if (decoded.data.modbus_EP3 === true) {
                if (without_header === 0) {
                  decoded.data.modbus_slaveID_EP3 = bytes[i2];
                  decoded.data.modbus_fnctID_EP3 = bytes[i2 + 1];
                  decoded.data.modbus_datasize_EP3 = bytes[i2 + 2];
                  i2 += 3;
                }
                decoded.data.modbus_payload_EP3 = "";
                if (bytes[i2] === void 0) return decoded;
                for (let j = 0; j < decoded.data.modbus_datasize_EP3; j++) {
                  temp_hex_str = bytes[i2 + j].toString(16).toUpperCase();
                  if (temp_hex_str.length === 1) temp_hex_str = "0" + temp_hex_str;
                  decoded.data.modbus_payload_EP3 += temp_hex_str;
                }
                i2 += decoded.data.modbus_datasize_EP3;
              }
              if (decoded.data.modbus_EP4 === true) {
                if (without_header === 0) {
                  decoded.data.modbus_slaveID_EP4 = bytes[i2];
                  decoded.data.modbus_fnctID_EP4 = bytes[i2 + 1];
                  decoded.data.modbus_datasize_EP4 = bytes[i2 + 2];
                  i2 += 3;
                }
                decoded.data.modbus_payload_EP4 = "";
                if (bytes[i2] === void 0) return decoded;
                for (let j = 0; j < decoded.data.modbus_datasize_EP4; j++) {
                  temp_hex_str = bytes[i2 + j].toString(16).toUpperCase();
                  if (temp_hex_str.length === 1) temp_hex_str = "0" + temp_hex_str;
                  decoded.data.modbus_payload_EP4 += temp_hex_str;
                }
                i2 += decoded.data.modbus_datasize_EP4;
              }
              if (decoded.data.modbus_EP5 === true) {
                if (without_header === 0) {
                  decoded.data.modbus_slaveID_EP5 = bytes[i2];
                  decoded.data.modbus_fnctID_EP5 = bytes[i2 + 1];
                  decoded.data.modbus_datasize_EP5 = bytes[i2 + 2];
                  i2 += 3;
                }
                decoded.data.modbus_payload_EP5 = "";
                if (bytes[i2] === void 0) return decoded;
                for (let j = 0; j < decoded.data.modbus_datasize_EP5; j++) {
                  temp_hex_str = bytes[i2 + j].toString(16).toUpperCase();
                  if (temp_hex_str.length === 1) temp_hex_str = "0" + temp_hex_str;
                  decoded.data.modbus_payload_EP5 += temp_hex_str;
                }
                i2 += decoded.data.modbus_datasize_EP5;
              }
              if (decoded.data.modbus_EP6 === true) {
                if (without_header === 0) {
                  decoded.data.modbus_slaveID_EP6 = bytes[i2];
                  decoded.data.modbus_fnctID_EP6 = bytes[i2 + 1];
                  decoded.data.modbus_datasize_EP6 = bytes[i2 + 2];
                  i2 += 3;
                }
                decoded.data.modbus_payload_EP6 = "";
                if (bytes[i2] === void 0) return decoded;
                for (let j = 0; j < decoded.data.modbus_datasize_EP6; j++) {
                  temp_hex_str = bytes[i2 + j].toString(16).toUpperCase();
                  if (temp_hex_str.length === 1) temp_hex_str = "0" + temp_hex_str;
                  decoded.data.modbus_payload_EP6 += temp_hex_str;
                }
                i2 += decoded.data.modbus_datasize_EP6;
              }
              if (decoded.data.modbus_EP7 === true) {
                if (without_header === 0) {
                  decoded.data.modbus_slaveID_EP7 = bytes[i2];
                  decoded.data.modbus_fnctID_EP7 = bytes[i2 + 1];
                  decoded.data.modbus_datasize_EP7 = bytes[i2 + 2];
                  i2 += 3;
                }
                decoded.data.modbus_payload_EP7 = "";
                if (bytes[i2] === void 0) return decoded;
                for (let j = 0; j < decoded.data.modbus_datasize_EP7; j++) {
                  temp_hex_str = bytes[i2 + j].toString(16).toUpperCase();
                  if (temp_hex_str.length === 1) temp_hex_str = "0" + temp_hex_str;
                  decoded.data.modbus_payload_EP7 += temp_hex_str;
                }
                i2 += decoded.data.modbus_datasize_EP7;
              }
              if (decoded.data.modbus_EP8 === true) {
                if (without_header === 0) {
                  decoded.data.modbus_slaveID_EP8 = bytes[i2];
                  decoded.data.modbus_fnctID_EP8 = bytes[i2 + 1];
                  decoded.data.modbus_datasize_EP8 = bytes[i2 + 2];
                  i2 += 3;
                }
                decoded.data.modbus_payload_EP8 = "";
                if (bytes[i2] === void 0) return decoded;
                for (let j = 0; j < decoded.data.modbus_datasize_EP8; j++) {
                  temp_hex_str = bytes[i2 + j].toString(16).toUpperCase();
                  if (temp_hex_str.length === 1) temp_hex_str = "0" + temp_hex_str;
                  decoded.data.modbus_payload_EP8 += temp_hex_str;
                }
                i2 += decoded.data.modbus_datasize_EP8;
              }
              if (decoded.data.modbus_EP9 === true) {
                if (without_header === 0) {
                  decoded.data.modbus_slaveID_EP9 = bytes[i2];
                  decoded.data.modbus_fnctID_EP9 = bytes[i2 + 1];
                  decoded.data.modbus_datasize_EP9 = bytes[i2 + 2];
                  i2 += 3;
                }
                decoded.data.modbus_payload_EP9 = "";
                if (bytes[i2] === void 0) return decoded;
                for (let j = 0; j < decoded.data.modbus_datasize_EP9; j++) {
                  temp_hex_str = bytes[i2 + j].toString(16).toUpperCase();
                  if (temp_hex_str.length === 1) temp_hex_str = "0" + temp_hex_str;
                  decoded.data.modbus_payload_EP9 += temp_hex_str;
                }
                i2 += decoded.data.modbus_datasize_EP9;
              }
            }
            if (clustID === 82 && attID === 0) {
              decoded.data.active_energy = UintToInt(bytes[i1 + 1] * 256 * 256 + bytes[i1 + 2] * 256 + bytes[i1 + 3], 3);
              decoded.data.reactive_energy = UintToInt(bytes[i1 + 4] * 256 * 256 + bytes[i1 + 5] * 256 + bytes[i1 + 6], 3);
              decoded.data.nb_samples = bytes[i1 + 7] * 256 + bytes[i1 + 8];
              decoded.data.active_power = UintToInt(bytes[i1 + 9] * 256 + bytes[i1 + 10], 2);
              decoded.data.reactive_power = UintToInt(bytes[i1 + 11] * 256 + bytes[i1 + 12], 2);
            }
            if (clustID === 32772 && attID === 0) {
              if (bytes[i1] === 1)
                decoded.data.message_type = "confirmed";
              if (bytes[i1] === 0)
                decoded.data.message_type = "unconfirmed";
            }
            if (clustID === 32772 && attID === 1) {
              decoded.data.nb_retry = bytes[i1];
            }
            if (clustID === 32772 && attID === 2) {
              decoded.data.automatic_association = {};
              decoded.data.automatic_association.period_in_minutes = bytes[i1 + 1] * 256 + bytes[i1 + 2];
              decoded.data.automatic_association.nb_err_frames = bytes[i1 + 3] * 256 + bytes[i1 + 4];
            }
            if (clustID === 32772 && attID === 3) {
              decoded.data.data_rate = bytes[i1 + 2];
            }
            if (clustID === 32772 && attID === 4) {
              decoded.data.ABP_dev_address = "";
              for (let i = 0; i < 4; i++) {
                decoded.data.ABP_dev_address += String(bytes[i1 + 1 + i]);
                if (i < 3) decoded.data.ABP_dev_address += ".";
              }
            }
            if (clustID === 32772 && attID === 5) {
              decoded.data.OTA_app_EUI = "";
              for (let i = 0; i < 8; i++) {
                decoded.data.OTA_app_EUI += String(bytes[i1 + 1 + i]);
                if (i < 7) decoded.data.OTA_app_EUI += ".";
              }
            }
            if (clustID === 80 && attID === 4) {
              let length = bytes[i1] * 256 + bytes[i1 + 1];
              let configuration = {};
              let nbendpoints = bytes[i1 + 2];
              for (let i = 0; i < nbendpoints; i++) {
                let endpoint = {};
                endpoint.endpoint = bytes[i1 + 3 + i * 7];
                let nbinput_cluster = bytes[i1 + 4 + i * 7];
                endpoint.input_clusters = [];
                for (let j = 0; j < nbinput_cluster; j++) {
                  let cluster = {};
                  endpoint.input_clusters[j] = decimalToHex(bytes[i1 + 5 + i * 7 + j * 2] * 256 + bytes[i1 + 6 + i * 7 + j * 2], 4);
                }
                let nboutput_cluster = bytes[i1 + 5 + i * 7 + nbinput_cluster * 2];
                endpoint.output_clusters = [];
                for (let j = 0; j < nboutput_cluster; j++) {
                  let cluster = {};
                  endpoint.output_clusters[j] = decimalToHex(bytes[i1 + 6 + i * 7 + j * 2] * 256 + bytes[i1 + 7 + i * 7 + j * 2], 4);
                }
                configuration[i] = endpoint;
              }
              decoded.data.configuration = configuration;
            }
            if (clustID === 80 && attID === 6) {
              let i2 = i1 + 3;
              let attribute_type = bytes[i1 - 1];
              if ((bytes[i1 + 2] & 1) === 1) {
                decoded.data.main_or_external_voltage = (bytes[i2] * 256 + bytes[i2 + 1]) / 1e3;
                i2 = i2 + 2;
              }
              if ((bytes[i1 + 2] & 2) === 2) {
                decoded.data.rechargeable_battery_voltage = (bytes[i2] * 256 + bytes[i2 + 1]) / 1e3;
                i2 = i2 + 2;
              }
              if ((bytes[i1 + 2] & 4) === 4) {
                decoded.data.disposable_battery_voltage = (bytes[i2] * 256 + bytes[i2 + 1]) / 1e3;
                i2 = i2 + 2;
              }
              if ((bytes[i1 + 2] & 8) === 8) {
                decoded.data.solar_harvesting_voltage = (bytes[i2] * 256 + bytes[i2 + 1]) / 1e3;
                i2 = i2 + 2;
              }
              if ((bytes[i1 + 2] & 16) === 16) {
                decoded.data.tic_harvesting_voltage = (bytes[i2] * 256 + bytes[i2 + 1]) / 1e3;
                i2 = i2 + 2;
              }
              let ia = i2 + 1;
              if (cmdID === 138 || bytes[ia] !== void 0) {
                let listMess = [];
                let flag = 0;
                let divider = 1e3;
                let ftype = "multistate";
                let rc = "";
                rc = decimalToBitString(bytes[ia]);
                ia += 1;
                let field_index = bytes[ia + 1];
                if (rc[2] === "0" && rc[3] === "0") {
                  listMess.push("alarm triggered");
                  decoded.zclheader.alarmmsg = listMess;
                }
                if (rc[2] === "0" && rc[3] === "1") {
                  let length = 1;
                  alarmShort(length, listMess, flag, bytes, decoded, ia);
                }
                if (rc[2] === "1" && rc[3] === "0") {
                  let length = 6;
                  alarmLong(clustID, attID, length, listMess, flag, bytes, decoded, ia, attribute_type, divider, ftype, field_index);
                }
              }
            }
            if (clustID === 80 && firsthalfattID === 255) {
              let secondhalfattID = bytes[5];
              let action = "action " + secondhalfattID.toString();
              decoded.data[action] = "";
              let length = bytes[i1 + 1];
              let actionvalue = "none";
              for (let i = 0; i < length; i++) {
                actionvalue += String.fromCharCode(bytes[i1 + 1 + i]);
              }
              decoded.data[action] = actionvalue;
            }
            if (clustID === 32778 && attID === 0) {
              let i2 = i1;
              let attribute_type = bytes[i2 - 1];
              decoded.data.positive_active_energy = UintToInt(bytes[i2 + 1] * 256 * 256 * 256 + bytes[i2 + 2] * 256 * 256 + bytes[i2 + 3] * 256 + bytes[i2 + 4], 4);
              i2 = i2 + 4;
              decoded.data.negative_active_energy = UintToInt(bytes[i2 + 1] * 256 * 256 * 256 + bytes[i2 + 2] * 256 * 256 + bytes[i2 + 3] * 256 + bytes[i2 + 4], 4);
              i2 = i2 + 4;
              decoded.data.positive_reactive_energy = UintToInt(bytes[i2 + 1] * 256 * 256 * 256 + bytes[i2 + 2] * 256 * 256 + bytes[i2 + 3] * 256 + bytes[i2 + 4], 4);
              i2 = i2 + 4;
              decoded.data.negative_reactive_energy = UintToInt(bytes[i2 + 1] * 256 * 256 * 256 + bytes[i2 + 2] * 256 * 256 + bytes[i2 + 3] * 256 + bytes[i2 + 4], 4);
              i2 = i2 + 4;
              decoded.data.positive_active_power = UintToInt(bytes[i2 + 1] * 256 * 256 * 256 + bytes[i2 + 2] * 256 * 256 + bytes[i2 + 3] * 256 + bytes[i2 + 4], 4);
              i2 = i2 + 4;
              decoded.data.negative_active_power = UintToInt(bytes[i2 + 1] * 256 * 256 * 256 + bytes[i2 + 2] * 256 * 256 + bytes[i2 + 3] * 256 + bytes[i2 + 4], 4);
              i2 = i2 + 4;
              decoded.data.positive_reactive_power = UintToInt(bytes[i2 + 1] * 256 * 256 * 256 + bytes[i2 + 2] * 256 * 256 + bytes[i2 + 3] * 256 + bytes[i2 + 4], 4);
              i2 = i2 + 4;
              decoded.data.negative_reactive_power = UintToInt(bytes[i2 + 1] * 256 * 256 * 256 + bytes[i2 + 2] * 256 * 256 + bytes[i2 + 3] * 256 + bytes[i2 + 4], 4);
              let ia = i2 + 5;
              if (cmdID === 138 || bytes[ia] !== void 0) {
                let listMess = [];
                let flag = 0;
                let divider = 1;
                let ftype = "multistate";
                let rc = "";
                rc = decimalToBitString(bytes[ia]);
                ia += 1;
                let field_index = bytes[ia + 1];
                if (rc[2] === "0" && rc[3] === "0") {
                  listMess.push("alarm triggered");
                  decoded.zclheader.alarmmsg = listMess;
                }
                if (rc[2] === "0" && rc[3] === "1") {
                  let length = 1;
                  alarmShort(length, listMess, flag, bytes, decoded, ia);
                }
                if (rc[2] === "1" && rc[3] === "0") {
                  let length = 10;
                  alarmLong(clustID, attID, length, listMess, flag, bytes, decoded, ia, attribute_type, divider, ftype, field_index);
                }
              }
            }
            if (clustID === 32784 && attID === 0) {
              let attribute_type = bytes[i1 - 1];
              decoded.data.active_energy_a = UintToInt(bytes[i1 + 1] * 256 * 256 * 256 + bytes[i1 + 2] * 256 * 256 + bytes[i1 + 3] * 256 + bytes[i1 + 4]);
              decoded.data.reactive_energy_a = UintToInt(bytes[i1 + 5] * 256 * 256 * 256 + bytes[i1 + 6] * 256 * 256 + bytes[i1 + 7] * 256 + bytes[i1 + 8]);
              decoded.data.active_energy_b = UintToInt(bytes[i1 + 9] * 256 * 256 * 256 + bytes[i1 + 10] * 256 * 256 + bytes[i1 + 11] * 256 + bytes[i1 + 12]);
              decoded.data.reactive_energy_b = UintToInt(bytes[i1 + 13] * 256 * 256 * 256 + bytes[i1 + 14] * 256 * 256 + bytes[i1 + 15] * 256 + bytes[i1 + 16]);
              decoded.data.active_energy_c = UintToInt(bytes[i1 + 17] * 256 * 256 * 256 + bytes[i1 + 18] * 256 * 256 + bytes[i1 + 19] * 256 + bytes[i1 + 20]);
              decoded.data.reactive_energy_c = UintToInt(bytes[i1 + 21] * 256 * 256 * 256 + bytes[i1 + 22] * 256 * 256 + bytes[i1 + 23] * 256 + bytes[i1 + 24]);
              decoded.data.active_energy_abc = UintToInt(bytes[i1 + 25] * 256 * 256 * 256 + bytes[i1 + 26] * 256 * 256 + bytes[i1 + 27] * 256 + bytes[i1 + 28]);
              decoded.data.reactive_energy_abc = UintToInt(bytes[i1 + 29] * 256 * 256 * 256 + bytes[i1 + 30] * 256 * 256 + bytes[i1 + 31] * 256 + bytes[i1 + 32]);
              let ia = i1 + 33;
              if (cmdID === 138 || bytes[ia] !== void 0) {
                let listMess = [];
                let flag = 0;
                let divider = 1;
                let ftype = "multistate";
                let rc = "";
                rc = decimalToBitString(bytes[ia]);
                ia += 1;
                let field_index = bytes[ia + 1];
                if (rc[2] === "0" && rc[3] === "0") {
                  listMess.push("alarm triggered");
                  decoded.zclheader.alarmmsg = listMess;
                }
                if (rc[2] === "0" && rc[3] === "1") {
                  let length = 1;
                  alarmShort(length, listMess, flag, bytes, decoded, ia);
                }
                if (rc[2] === "1" && rc[3] === "0") {
                  let length = 10;
                  alarmLong(clustID, attID, length, listMess, flag, bytes, decoded, ia, attribute_type, divider, ftype, field_index);
                }
              }
            } else if (clustID === 32784 && attID === 1) {
              let attribute_type = bytes[i1 - 1];
              decoded.data.active_power_a = UintToInt(bytes[i1 + 1] * 256 * 256 * 256 + bytes[i1 + 2] * 256 * 256 + bytes[i1 + 3] * 256 + bytes[i1 + 4]);
              decoded.data.reactive_power_a = UintToInt(bytes[i1 + 5] * 256 * 256 * 256 + bytes[i1 + 6] * 256 * 256 + bytes[i1 + 7] * 256 + bytes[i1 + 8]);
              decoded.data.active_power_b = UintToInt(bytes[i1 + 9] * 256 * 256 * 256 + bytes[i1 + 10] * 256 * 256 + bytes[i1 + 11] * 256 + bytes[i1 + 12]);
              decoded.data.reactive_power_b = UintToInt(bytes[i1 + 13] * 256 * 256 * 256 + bytes[i1 + 14] * 256 * 256 + bytes[i1 + 15] * 256 + bytes[i1 + 16]);
              decoded.data.active_power_c = UintToInt(bytes[i1 + 17] * 256 * 256 * 256 + bytes[i1 + 18] * 256 * 256 + bytes[i1 + 19] * 256 + bytes[i1 + 20]);
              decoded.data.reactive_power_c = UintToInt(bytes[i1 + 21] * 256 * 256 * 256 + bytes[i1 + 22] * 256 * 256 + bytes[i1 + 23] * 256 + bytes[i1 + 24]);
              decoded.data.active_power_abc = UintToInt(bytes[i1 + 25] * 256 * 256 * 256 + bytes[i1 + 26] * 256 * 256 + bytes[i1 + 27] * 256 + bytes[i1 + 28]);
              decoded.data.reactive_power_abc = UintToInt(bytes[i1 + 29] * 256 * 256 * 256 + bytes[i1 + 30] * 256 * 256 + bytes[i1 + 31] * 256 + bytes[i1 + 32]);
              let ia = i1 + 33;
              if (cmdID === 138 || bytes[ia] !== void 0) {
                let listMess = [];
                let flag = 0;
                let divider = 1;
                let ftype = "multistate";
                let rc = "";
                rc = decimalToBitString(bytes[ia]);
                ia += 1;
                let field_index = bytes[ia + 1];
                if (rc[2] === "0" && rc[3] === "0") {
                  listMess.push("alarm triggered");
                  decoded.zclheader.alarmmsg = listMess;
                }
                if (rc[2] === "0" && rc[3] === "1") {
                  let length = 1;
                  alarmShort(length, listMess, flag, bytes, decoded, ia);
                }
                if (rc[2] === "1" && rc[3] === "0") {
                  let length = 10;
                  alarmLong(clustID, attID, length, listMess, flag, bytes, decoded, ia, attribute_type, divider, ftype, field_index);
                }
              }
            }
            if (clustID === 32779 && attID === 0) {
              let i2 = i1;
              let attribute_type = bytes[i2 - 1];
              decoded.data.Vrms = UintToInt(bytes[i2 + 1] * 256 + bytes[i2 + 2], 2) / 10;
              i2 = i2 + 2;
              decoded.data.Irms = UintToInt(bytes[i2 + 1] * 256 + bytes[i2 + 2], 2) / 10;
              i2 = i2 + 2;
              decoded.data.angle = UintToInt(bytes[i2 + 1] * 256 + bytes[i2 + 2], 2);
              let ia = i2 + 3;
              if (cmdID === 138 || bytes[ia] !== void 0) {
                let listMess = [];
                let flag = 0;
                let divider = 1;
                let ftype = "multistate";
                let rc = "";
                rc = decimalToBitString(bytes[ia]);
                ia += 1;
                let field_index = bytes[ia + 1];
                if (rc[2] === "0" && rc[3] === "0") {
                  listMess.push("alarm triggered");
                  decoded.zclheader.alarmmsg = listMess;
                }
                if (rc[2] === "0" && rc[3] === "1") {
                  let length = 1;
                  alarmShort(length, listMess, flag, bytes, decoded, ia);
                }
                if (rc[2] === "1" && rc[3] === "0") {
                  let length = 6;
                  alarmLong(clustID, attID, length, listMess, flag, bytes, decoded, ia, attribute_type, divider, ftype, field_index);
                }
              }
            }
            if (clustID === 32781 && attID === 0) {
              let attribute_type = bytes[i1 - 1];
              decoded.data.Vrms_a = UintToInt(bytes[i1 + 1] * 256 + bytes[i1 + 2], 2) / 10;
              decoded.data.Irms_a = UintToInt(bytes[i1 + 3] * 256 + bytes[i1 + 4], 2) / 10;
              decoded.data.angle_a = UintToInt(bytes[i1 + 5] * 256 + bytes[i1 + 6], 2);
              decoded.data.Vrms_b = UintToInt(bytes[i1 + 7] * 256 + bytes[i1 + 8], 2) / 10;
              decoded.data.Irms_b = UintToInt(bytes[i1 + 9] * 256 + bytes[i1 + 10], 2) / 10;
              decoded.data.angle_b = UintToInt(bytes[i1 + 11] * 256 + bytes[i1 + 12], 2);
              decoded.data.Vrms_c = UintToInt(bytes[i1 + 13] * 256 + bytes[i1 + 14], 2) / 10;
              decoded.data.Irms_c = UintToInt(bytes[i1 + 15] * 256 + bytes[i1 + 16], 2) / 10;
              decoded.data.angle_c = UintToInt(bytes[i1 + 17] * 256 + bytes[i1 + 18], 2);
              let ia = i1 + 19;
              if (cmdID === 138 || bytes[ia] !== void 0) {
                let listMess = [];
                let flag = 0;
                let divider = 1;
                let ftype = "multistate";
                let rc = "";
                rc = decimalToBitString(bytes[ia]);
                ia += 1;
                let field_index = bytes[ia + 1];
                if (rc[2] === "0" && rc[3] === "0") {
                  listMess.push("alarm triggered");
                  decoded.zclheader.alarmmsg = listMess;
                }
                if (rc[2] === "0" && rc[3] === "1") {
                  let length = 1;
                  alarmShort(length, listMess, flag, bytes, decoded, ia);
                }
                if (rc[2] === "1" && rc[3] === "0") {
                  let length = 6;
                  alarmLong(clustID, attID, length, listMess, flag, bytes, decoded, ia, attribute_type, divider, ftype, field_index);
                }
              }
            }
            if (clustID === 32780 && attID === 0) {
              let attribute_type = bytes[i1 - 1];
              decoded.data.concentration = bytes[i1] * 256 + bytes[i1 + 1];
              let ia = i1 + 2;
              if (cmdID === 138 || bytes[ia] !== void 0) {
                let listMess = [];
                let flag = 0;
                let divider = 1;
                let rc = "";
                let ftype = "none";
                rc = decimalToBitString(bytes[ia]);
                ia += 1;
                if (rc[2] === "0" && rc[3] === "0") {
                  listMess.push("alarm triggered");
                  decoded.zclheader.alarmmsg = listMess;
                }
                if (rc[2] === "0" && rc[3] === "1") {
                  let length = 1;
                  alarmShort(length, listMess, flag, bytes, decoded, ia);
                }
                if (rc[2] === "1" && rc[3] === "0") {
                  let length = 6;
                  alarmLong(clustID, attID, length, listMess, flag, bytes, decoded, ia, attribute_type, divider, ftype);
                }
              }
            }
            if (clustID === 32780 && attID === 1) decoded.data.analog = bytes[i1];
            if (clustID === 32780 && attID === 2) decoded.data.analog = bytes[i1];
            if (clustID === 1024 && attID === 0) {
              let attribute_type = bytes[i1 - 1];
              decoded.data.illuminance = bytes[i1] * 256 + bytes[i1 + 1];
              let ia = i1 + 2;
              if (cmdID === 138 || bytes[ia] !== void 0) {
                let listMess = [];
                let flag = 0;
                let divider = 1;
                let rc = "";
                let ftype = "none";
                rc = decimalToBitString(bytes[ia]);
                ia += 1;
                if (rc[2] === "0" && rc[3] === "0") {
                  listMess.push("alarm triggered");
                  decoded.zclheader.alarmmsg = listMess;
                }
                if (rc[2] === "0" && rc[3] === "1") {
                  let length = 1;
                  alarmShort(length, listMess, flag, bytes, decoded, ia);
                }
                if (rc[2] === "1" && rc[3] === "0") {
                  let length = 6;
                  alarmLong(clustID, attID, length, listMess, flag, bytes, decoded, ia, attribute_type, divider, ftype);
                }
              }
            }
            if (clustID === 1027 && attID === 0) {
              let attribute_type = bytes[i1 - 1];
              decoded.data.pressure = UintToInt(bytes[i1] * 256 + bytes[i1 + 1], 2);
              let ia = i1 + 2;
              if (cmdID === 138 || bytes[ia] !== void 0) {
                let listMess = [];
                let flag = 0;
                let divider = 1;
                let rc = "";
                let ftype = "int";
                rc = decimalToBitString(bytes[ia]);
                ia += 1;
                if (rc[2] === "0" && rc[3] === "0") {
                  listMess.push("alarm triggered");
                  decoded.zclheader.alarmmsg = listMess;
                }
                if (rc[2] === "0" && rc[3] === "1") {
                  let length = 1;
                  alarmShort(length, listMess, flag, bytes, decoded, ia);
                }
                if (rc[2] === "1" && rc[3] === "0") {
                  let length = 6;
                  alarmLong(clustID, attID, length, listMess, flag, bytes, decoded, ia, attribute_type, divider, ftype);
                }
              }
            }
            if (clustID === 1030 && attID === 0) {
              let attribute_type = bytes[i1 - 1];
              decoded.data.occupancy = !!bytes[i1];
              let ia = i1 + 1;
              if (cmdID === 138 || bytes[ia] !== void 0) {
                let listMess = [];
                let flag = 0;
                let divider = 1;
                let rc = "";
                let ftype = "none";
                rc = decimalToBitString(bytes[ia]);
                ia += 1;
                if (rc[2] === "0" && rc[3] === "0") {
                  listMess.push("alarm triggered");
                  decoded.zclheader.alarmmsg = listMess;
                }
                if (rc[2] === "0" && rc[3] === "1") {
                  let length = 1;
                  alarmShort(length, listMess, flag, bytes, decoded, ia);
                }
                if (rc[2] === "1" && rc[3] === "0") {
                  let length = 4;
                  alarmLong(clustID, attID, length, listMess, flag, bytes, decoded, ia, attribute_type, divider, ftype);
                }
              }
            }
            if (clustID === 32850 && attID === 0) {
              let i2 = i1;
              decoded.data.frequency = (UintToInt(bytes[i2 + 1] * 256 + bytes[i2 + 2], 2) + 22232) / 1e3;
              i2 = i2 + 2;
              decoded.data.frequency_min = (UintToInt(bytes[i2 + 1] * 256 + bytes[i2 + 2], 2) + 22232) / 1e3;
              i2 = i2 + 2;
              decoded.data.frequency_max = (UintToInt(bytes[i2 + 1] * 256 + bytes[i2 + 2], 2) + 22232) / 1e3;
              i2 = i2 + 2;
              decoded.data.Vrms = UintToInt(bytes[i2 + 1] * 256 + bytes[i2 + 2], 2) / 10;
              i2 = i2 + 2;
              decoded.data.Vrms_min = UintToInt(bytes[i2 + 1] * 256 + bytes[i2 + 2], 2) / 10;
              i2 = i2 + 2;
              decoded.data.Vrms_max = UintToInt(bytes[i2 + 1] * 256 + bytes[i2 + 2], 2) / 10;
              i2 = i2 + 2;
              decoded.data.Vpeak = UintToInt(bytes[i2 + 1] * 256 + bytes[i2 + 2], 2) / 10;
              i2 = i2 + 2;
              decoded.data.Vpeak_min = UintToInt(bytes[i2 + 1] * 256 + bytes[i2 + 2], 2) / 10;
              i2 = i2 + 2;
              decoded.data.Vpeak_max = UintToInt(bytes[i2 + 1] * 256 + bytes[i2 + 2], 2) / 10;
              i2 = i2 + 2;
              decoded.data.over_voltage = UintToInt(bytes[i2 + 1] * 256 + bytes[i2 + 2], 2);
              i2 = i2 + 2;
              decoded.data.sag_voltage = UintToInt(bytes[i2 + 1] * 256 + bytes[i2 + 2], 2);
            }
            if (clustID === 32783) {
              let i = i1 + 1;
              if (attID === 0) {
                let o = decoded.data.last = {};
                o.NbTriggedAcq = BytesToInt64(bytes, i, "U32");
                i += 4;
                o.Mean_X_G = BytesToInt64(bytes, i, "U16") / 100;
                i += 2;
                o.Max_X_G = BytesToInt64(bytes, i, "U16") / 100;
                i += 2;
                o.Dt_X_ms = BytesToInt64(bytes, i, "U16");
                i += 2;
                o.Mean_Y_G = BytesToInt64(bytes, i, "U16") / 100;
                i += 2;
                o.Max_Y_G = BytesToInt64(bytes, i, "U16") / 100;
                i += 2;
                o.Dt_Y_ms = BytesToInt64(bytes, i, "U16");
                i += 2;
                o.Mean_Z_G = BytesToInt64(bytes, i, "U16") / 100;
                i += 2;
                o.Max_Z_G = BytesToInt64(bytes, i, "U16") / 100;
                i += 2;
                o.Dt_Z_ms = BytesToInt64(bytes, i, "U16");
              } else if (attID === 1 || attID === 2 || attID === 3) {
                let ext = attID === 1 ? "Stats_X" : attID === 2 ? "Stats_Y" : "Stats_Z";
                let o = decoded.data[ext] = {};
                o.NbAcq = BytesToInt64(bytes, i, "U16");
                i += 2;
                o.MinMean_G = BytesToInt64(bytes, i, "U16") / 100;
                i += 2;
                o.MinMax_G = BytesToInt64(bytes, i, "U16") / 100;
                i += 2;
                o.MinDt = BytesToInt64(bytes, i, "U16");
                i += 2;
                o.MeanMean_G = BytesToInt64(bytes, i, "U16") / 100;
                i += 2;
                o.MeanMax_G = BytesToInt64(bytes, i, "U16") / 100;
                i += 2;
                o.MeanDt = BytesToInt64(bytes, i, "U16");
                i += 2;
                o.MaxMean_G = BytesToInt64(bytes, i, "U16") / 100;
                i += 2;
                o.MaxMax_G = BytesToInt64(bytes, i, "U16") / 100;
                i += 2;
                o.MaxDt = BytesToInt64(bytes, i, "U16");
                i += 2;
              } else if (attID === 32768) {
                let o = decoded.data.params = {};
                o.WaitFreq_Hz = BytesToInt64(bytes, i, "U16") / 10;
                i += 2;
                o.AcqFreq_Hz = BytesToInt64(bytes, i, "U16") / 10;
                i += 2;
                let delay = BytesToInt64(bytes, i, "U16");
                i += 2;
                if (delay & 32768) delay = (delay & ~32768) * 60;
                o.NewWaitDelay_s = delay & 32768 ? delay = (delay & ~32768) * 60 : delay;
                o.MaxAcqDuration_ms = BytesToInt64(bytes, i, "U16");
                i += 2;
                o.Threshold_X_G = BytesToInt64(bytes, i, "U16") / 100;
                i += 2;
                o.Threshold_Y_G = BytesToInt64(bytes, i, "U16") / 100;
                i += 2;
                o.Threshold_Z_G = BytesToInt64(bytes, i, "U16") / 100;
                i += 2;
                o.OverThrsh_Dt_ms = BytesToInt64(bytes, i, "U16");
                i += 2;
                o.UnderThrsh_Dt_ms = BytesToInt64(bytes, i, "U16");
                i += 2;
                o.Range_G = BytesToInt64(bytes, i, "U16") / 100;
                i += 2;
                o.FilterSmoothCoef = BytesToInt64(bytes, i, "U8");
                i += 1;
                o.FilterGainCoef = BytesToInt64(bytes, i, "U8");
                i += 1;
                o = decoded.data.Params.working_modes = {};
                o.SignalEachAcq = bytes[i] & 128 ? "true" : "false";
                o.RstAftStdRpt_X = bytes[i] & 1 ? "true" : "false";
                o.RstAftStdRpt_Y = bytes[i] & 2 ? "true" : "false";
                o.RstAftStdRpt_7 = bytes[i] & 4 ? "true" : "false";
              }
            }
          }
          if (cmdID === 7) {
            attID = bytes[6] * 256 + bytes[7];
            decoded.zclheader.attID = decimalToHex(attID, 4);
            decoded.zclheader.status = bytes[4];
            decoded.zclheader.report_parameters = {};
            let bits = decimalToBitString(bytes[5]);
            decoded.zclheader.report_parameters.new_mode_configuration = bits[0];
            if (bits[2] === "0" && bits[3] === "0") {
              decoded.zclheader.report_parameters.cause_request = "none";
            }
            if (bits[2] === "0" && bits[3] === "1") {
              decoded.zclheader.report_parameters.cause_request = "short";
            }
            if (bits[2] === "1" && bits[3] === "0") {
              decoded.zclheader.report_parameters.cause_request = "long";
            }
            if (bits[2] === "1" && bits[3] === "1") {
              decoded.zclheader.report_parameters.cause_request = "reserved";
            }
            decoded.zclheader.report_parameters.secured_if_alarm = bits[4];
            decoded.zclheader.report_parameters.secured = bits[5];
            decoded.zclheader.report_parameters.no_hearde_port = bits[6];
            decoded.zclheader.report_parameters.batch = bits[7];
          }
          if (cmdID === 9) {
            attID = bytes[6] * 256 + bytes[7];
            decoded.zclheader.attID = decimalToHex(attID, 4);
            decoded.zclheader.status = bytes[4];
            decoded.zclheader.report_parameters = {};
            let bits = decimalToBitString(bytes[5]);
            decoded.zclheader.report_parameters.new_mode_configuration = bits[0];
            if (bits[2] === "0" && bits[3] === "0") {
              decoded.zclheader.report_parameters.cause_request = "none";
            }
            if (bits[2] === "0" && bits[3] === "1") {
              decoded.zclheader.report_parameters.cause_request = "short";
            }
            if (bits[2] === "1" && bits[3] === "0") {
              decoded.zclheader.report_parameters.cause_request = "long";
            }
            if (bits[2] === "1" && bits[3] === "1") {
              decoded.zclheader.report_parameters.cause_request = "reserved";
            }
            decoded.zclheader.report_parameters.secured_if_alarm = bits[4];
            decoded.zclheader.report_parameters.secured = bits[5];
            decoded.zclheader.report_parameters.no_hearde_port = bits[6];
            decoded.zclheader.report_parameters.batch = bits[7];
            decoded.zclheader.attribut_type = bytes[8];
            decoded.zclheader.min = {};
            if ((bytes[9] & 128) === 128) {
              decoded.zclheader.min.value = (bytes[9] - 128) * 256 + bytes[10];
              decoded.zclheader.min.unit = "minutes";
            } else {
              decoded.zclheader.min.value = bytes[9] * 256 + bytes[10];
              decoded.zclheader.min.unit = "seconds";
            }
            decoded.zclheader.max = {};
            if ((bytes[11] & 128) === 128) {
              decoded.zclheader.max.value = (bytes[11] - 128) * 256 + bytes[12];
              decoded.zclheader.max.unit = "minutes";
            } else {
              decoded.zclheader.max.value = bytes[11] * 256 + bytes[12];
              decoded.zclheader.max.unit = "seconds";
            }
            decoded.lora.payload = "";
            if (clustID === 80 && attID === 6) {
              let length = bytes[13];
              let nb = length / 5;
              let i = 0;
              while (nb > 0) {
                decoded.zclheader.modepower = bytes[14 + i * 5];
                decoded.zclheader.powersource = bytes[15 + i * 5];
                decoded.zclheader.delta = bytes[16 + i * 5] * 256 + bytes[17 + i * 5];
                decoded.zclheader.changedpowersource = bytes[18 + i * 5];
                i++;
                nb--;
              }
            }
          }
        } else {
          decoded.batch = {};
          decoded.batch.report = "batch";
        }
      }
      return decoded;
    }
    function normalisation_standard(input, endpoint_parameters) {
      let warning = [];
      let bytes = input.bytes;
      let flagstandard = true;
      let indent = 0;
      let decoded = Decoder(bytes, input.fPort);
      if (decoded.zclheader !== void 0) {
        if (decoded.zclheader.alarmmsg !== void 0) {
          warning = decoded.zclheader.alarmmsg;
        }
        if (bytes[1] === 7 && bytes[0] % 2 !== 0) {
          return {
            data: decoded.zclheader,
            warning
          };
        } else if (bytes[1] === 9) {
          return {
            data: decoded.zclheader,
            warning
          };
        } else if (bytes[1] === 1) {
          if (decoded.zclheader.data === void 0) {
            let data = [];
            while (flagstandard) {
              let firstKey = Object.keys(decoded.data)[indent];
              if (firstKey === void 0) {
                flagstandard = false;
                break;
              } else {
                data.push({
                  variable: firstKey,
                  value: decoded.data[firstKey],
                  date: input.recvTime
                });
                indent++;
              }
            }
            return {
              data,
              type: "standard",
              warning
            };
          } else {
            return {
              data: {
                variable: "read reporting configuration response status",
                value: decoded.zclheader.data,
                date: input.recvTime
              },
              warning
            };
          }
        }
      }
      if (decoded.zclheader !== void 0) {
        if (endpoint_parameters !== void 0) {
          let access = decoded.zclheader.endpoint;
          let flagstandard2 = true;
          let indent2 = 0;
          let data = [];
          let type = "";
          while (flagstandard2) {
            let firstKey = Object.keys(decoded.data)[indent2];
            if (firstKey === void 0) {
              flagstandard2 = false;
              break;
            } else {
              if (endpoint_parameters[firstKey] === void 0) {
                data.push({
                  variable: firstKey,
                  value: decoded.data[firstKey],
                  date: input.recvTime
                });
              } else {
                type = endpoint_parameters[firstKey][access];
                if (type === "NA") {
                  data.push({
                    variable: type,
                    value: "NA",
                    date: input.recvTime
                  });
                } else {
                  data.push({
                    variable: type,
                    value: decoded.data[firstKey],
                    date: input.recvTime
                  });
                }
              }
              indent2++;
            }
          }
          return {
            data,
            type: "standard",
            warning
          };
        } else {
          let flagstandard2 = true;
          let indent2 = 0;
          let data = [];
          while (flagstandard2) {
            let firstKey = Object.keys(decoded.data)[indent2];
            if (firstKey === void 0) {
              flagstandard2 = false;
              break;
            } else {
              data.push({
                variable: firstKey,
                value: decoded.data[firstKey],
                date: input.recvTime
              });
              indent2++;
            }
          }
          return {
            data,
            type: "standard",
            warning
          };
        }
      }
      return {
        type: decoded.batch.report,
        payload: decoded.lora.payload
      };
    }
    module2.exports = { normalisation_standard };
  }
});

// ../../device-catalog/vendors/watteco/drivers/batch.js
var require_batch = __commonJS({
  "../../device-catalog/vendors/watteco/drivers/batch.js"(exports2, module2) {
    var ST_UNDEF = 0;
    var ST_BL = 1;
    var ST_U4 = 2;
    var ST_I4 = 3;
    var ST_U8 = 4;
    var ST_I8 = 5;
    var ST_U16 = 6;
    var ST_I16 = 7;
    var ST_U24 = 8;
    var ST_I24 = 9;
    var ST_U32 = 10;
    var ST_I32 = 11;
    var ST_FL = 12;
    var ST = {};
    ST[ST_UNDEF] = 0;
    ST[ST_BL] = 1;
    ST[ST_U4] = 4;
    ST[ST_I4] = 4;
    ST[ST_U8] = 8;
    ST[ST_I8] = 8;
    ST[ST_U16] = 16;
    ST[ST_I16] = 16;
    ST[ST_U24] = 24;
    ST[ST_I24] = 24;
    ST[ST_U32] = 32;
    ST[ST_I32] = 32;
    ST[ST_FL] = 32;
    var BR_HUFF_MAX_i1_TABLE = 14;
    var NUMBER_OF_SERIES = 16;
    var HUFF = [
      [
        { sz: 2, lbl: 0 },
        { sz: 2, lbl: 1 },
        { sz: 2, lbl: 3 },
        { sz: 3, lbl: 5 },
        { sz: 4, lbl: 9 },
        { sz: 5, lbl: 17 },
        { sz: 6, lbl: 33 },
        { sz: 7, lbl: 65 },
        { sz: 8, lbl: 129 },
        { sz: 10, lbl: 512 },
        { sz: 11, lbl: 1026 },
        { sz: 11, lbl: 1027 },
        { sz: 11, lbl: 1028 },
        { sz: 11, lbl: 1029 },
        { sz: 11, lbl: 1030 },
        { sz: 11, lbl: 1031 }
      ],
      [
        { sz: 7, lbl: 111 },
        { sz: 5, lbl: 26 },
        { sz: 4, lbl: 12 },
        { sz: 3, lbl: 3 },
        { sz: 3, lbl: 7 },
        { sz: 2, lbl: 2 },
        { sz: 2, lbl: 0 },
        { sz: 3, lbl: 2 },
        { sz: 6, lbl: 54 },
        { sz: 9, lbl: 443 },
        { sz: 9, lbl: 441 },
        { sz: 10, lbl: 885 },
        { sz: 10, lbl: 884 },
        { sz: 10, lbl: 880 },
        { sz: 11, lbl: 1763 },
        { sz: 11, lbl: 1762 }
      ],
      [
        { sz: 4, lbl: 9 },
        { sz: 3, lbl: 5 },
        { sz: 2, lbl: 0 },
        { sz: 2, lbl: 1 },
        { sz: 2, lbl: 3 },
        { sz: 5, lbl: 17 },
        { sz: 6, lbl: 33 },
        { sz: 7, lbl: 65 },
        { sz: 8, lbl: 129 },
        { sz: 10, lbl: 512 },
        { sz: 11, lbl: 1026 },
        { sz: 11, lbl: 1027 },
        { sz: 11, lbl: 1028 },
        { sz: 11, lbl: 1029 },
        { sz: 11, lbl: 1030 },
        { sz: 11, lbl: 1031 }
      ]
    ];
    Math.trunc = Math.trunc || function(x) {
      if (isNaN(x)) return NaN;
      if (x > 0) return Math.floor(x);
      return Math.ceil(x);
    };
    function brUncompress(tagsz, argList, hexString, batch_absolute_timestamp) {
      let out = initResult();
      let buffer = createBuffer(parseHexString(hexString));
      let flag = generateFlag(buffer.getNextSample(ST_U8));
      out.batch_counter = buffer.getNextSample(ST_U8, 3);
      buffer.getNextSample(ST_U8, 1);
      let temp = prePopulateOutput(out, buffer, argList, flag, tagsz);
      let last_timestamp = temp.last_timestamp;
      let i1_of_the_first_sample = temp.i1_of_the_first_sample;
      if (flag.hasSample) {
        last_timestamp = uncompressSamplesData(out, buffer, i1_of_the_first_sample, argList, last_timestamp, flag, tagsz);
      }
      out.batch_relative_timestamp = extractTimestampFromBuffer(buffer, last_timestamp);
      return adaptToExpectedFormat(out, argList, batch_absolute_timestamp);
    }
    function initResult() {
      let series = [], i = 0;
      while (i < NUMBER_OF_SERIES) {
        series.push({
          codingType: 0,
          codingTable: 0,
          resolution: null,
          uncompressSamples: []
        });
        i += 1;
      }
      return {
        batch_counter: 0,
        batch_relative_timestamp: 0,
        series
      };
    }
    function createBuffer(byteArray) {
      function bitsBuf2HuffPattern(byteArray2, i1, nb_bits) {
        let sourceBitStart = i1;
        let sz = nb_bits - 1;
        if (byteArray2.length * 8 < sourceBitStart + nb_bits) {
          throw new Error("Batch : Verify that dest buf is large enough");
        }
        let bittoread = 0;
        let pattern = 0;
        while (nb_bits > 0) {
          if (byteArray2[sourceBitStart >> 3] & 1 << (sourceBitStart & 7)) {
            pattern |= 1 << sz - bittoread;
          }
          nb_bits--;
          bittoread++;
          sourceBitStart++;
        }
        return pattern;
      }
      return {
        i1: 0,
        byteArray,
        getNextSample: function(sampleType, nbBitsInput) {
          let nbBits = nbBitsInput || ST[sampleType];
          let sourceBitStart = this.i1;
          this.i1 += nbBits;
          if (sampleType === ST_FL && nbBits !== 32) {
            throw new Error("Batch : Mauvais sampletype");
          }
          let u32 = 0;
          let nbytes = Math.trunc((nbBits - 1) / 8) + 1;
          let nbitsfrombyte = nbBits % 8;
          if (nbitsfrombyte === 0 && nbytes > 0) {
            nbitsfrombyte = 8;
          }
          while (nbytes > 0) {
            let bittoread = 0;
            while (nbitsfrombyte > 0) {
              let idx = sourceBitStart >> 3;
              if (this.byteArray[idx] & 1 << (sourceBitStart & 7)) {
                u32 |= 1 << (nbytes - 1) * 8 + bittoread;
              }
              nbitsfrombyte--;
              bittoread++;
              sourceBitStart += 1;
            }
            nbytes--;
            nbitsfrombyte = 8;
          }
          if ((sampleType == ST_I4 || sampleType == ST_I8 || sampleType == ST_I16 || sampleType == ST_I24) && u32 & 1 << nbBits - 1) {
            for (let i = nbBits; i < 32; i++) {
              u32 |= 1 << i;
              nbBits++;
            }
          }
          return u32;
        },
        getNextBifromHi: function(huff_coding) {
          for (let i = 2; i < 12; i++) {
            let lhuff = bitsBuf2HuffPattern(this.byteArray, this.i1, i);
            for (let j = 0; j < HUFF[huff_coding].length; j++) {
              if (HUFF[huff_coding][j].sz == i && lhuff == HUFF[huff_coding][j].lbl) {
                this.i1 += i;
                return j;
              }
            }
          }
          throw new Error("Bi not found in HUFF table");
        }
      };
    }
    function parseHexString(str) {
      var result = [];
      while (str.length >= 2) {
        result.push(parseInt(str.substring(0, 2), 16));
        str = str.substring(2, str.length);
      }
      return result;
    }
    function generateFlag(flagAsInt) {
      let binbase = flagAsInt.toString(2);
      while (binbase.length < 8) {
        binbase = "0" + binbase;
      }
      return {
        isCommonTimestamp: parseInt(binbase[binbase.length - 2], 2),
        hasSample: !parseInt(binbase[binbase.length - 3], 2),
        batch_req: parseInt(binbase[binbase.length - 4], 2),
        nb_of_type_measure: parseInt(binbase.substring(0, 4), 2)
      };
    }
    function prePopulateOutput(out, buffer, argList, flag, tagsz) {
      let currentTimestamp = 0;
      let i1_of_the_first_sample = 0;
      for (let i = 0; i < flag.nb_of_type_measure; i++) {
        let tag = {
          size: tagsz,
          lbl: buffer.getNextSample(ST_U8, tagsz)
        };
        let samplei1 = findi1FromArgList(argList, tag);
        if (i === 0) i1_of_the_first_sample = samplei1;
        currentTimestamp = extractTimestampFromBuffer(buffer, currentTimestamp);
        out.series[samplei1] = computeSeries(
          buffer,
          argList[samplei1].sampletype,
          tag.lbl,
          currentTimestamp
        );
        if (flag.hasSample) {
          out.series[samplei1].codingType = buffer.getNextSample(ST_U8, 2);
          out.series[samplei1].codingTable = buffer.getNextSample(ST_U8, 2);
        }
      }
      return {
        last_timestamp: currentTimestamp,
        i1_of_the_first_sample
      };
    }
    function computeSeries(buffer, sampletype, label, currentTimestamp) {
      return {
        uncompressSamples: [
          {
            data_relative_timestamp: currentTimestamp,
            data: {
              value: getMeasure(buffer, sampletype),
              label
            }
          }
        ],
        codingType: 0,
        codingTable: 0,
        resolution: null
      };
    }
    function findi1FromArgList(argList, tag) {
      for (let i = 0; i < argList.length; i++) {
        if (argList[i].taglbl === tag.lbl) return i;
      }
      throw new Error("Batch : Cannot find i1 in argList");
    }
    function extractTimestampFromBuffer(buffer, baseTimestamp) {
      if (baseTimestamp) {
        let bi = buffer.getNextBifromHi(1);
        return computeTimestampFromBi(buffer, baseTimestamp, bi);
      }
      return buffer.getNextSample(ST_U32);
    }
    function computeTimestampFromBi(buffer, baseTimestamp, bi) {
      if (bi > BR_HUFF_MAX_i1_TABLE) return buffer.getNextSample(ST_U32);
      if (bi > 0) return computeTimestampFromPositiveBi(buffer, baseTimestamp, bi);
      return baseTimestamp;
    }
    function computeTimestampFromPositiveBi(buffer, baseTimestamp, bi) {
      return buffer.getNextSample(ST_U32, bi) + baseTimestamp + Math.pow(2, bi) - 1;
    }
    function getMeasure(buffer, sampletype) {
      let v = buffer.getNextSample(sampletype);
      return sampletype === ST_FL ? bytes2Float32(v) : v;
    }
    function bytes2Float32(bytes) {
      let sign = bytes & 2147483648 ? -1 : 1, exponent = (bytes >> 23 & 255) - 127, significand = bytes & ~(-1 << 23);
      if (exponent === 128) return sign * (significand ? Number.NaN : Number.POSITIVE_INFINITY);
      if (exponent === -127) {
        if (significand === 0) return sign * 0;
        exponent = -126;
        significand /= 1 << 22;
      } else significand = (significand | 1 << 23) / (1 << 23);
      return sign * significand * Math.pow(2, exponent);
    }
    function uncompressSamplesData(out, buffer, i1_of_the_first_sample, argList, last_timestamp, flag, tagsz) {
      if (flag.isCommonTimestamp) return handleCommonTimestamp(out, buffer, i1_of_the_first_sample, argList, flag, tagsz);
      return handleSeparateTimestamp(out, buffer, argList, last_timestamp, flag, tagsz);
    }
    function handleCommonTimestamp(out, buffer, i1_of_the_first_sample, argList, flag, tagsz) {
      let nb_sample_to_parse = buffer.getNextSample(ST_U8, 8);
      let tag = {};
      let temp = initTimestampCommonTable(out, buffer, nb_sample_to_parse, i1_of_the_first_sample);
      let timestampCommon = temp.timestampCommon;
      let lastTimestamp = temp.lastTimestamp;
      for (let j = 0; j < flag.nb_of_type_measure; j++) {
        let first_null_delta_value = 1;
        tag.lbl = buffer.getNextSample(ST_U8, tagsz);
        let samplei1 = findi1FromArgList(argList, tag);
        for (let i = 0; i < nb_sample_to_parse; i++) {
          let available = buffer.getNextSample(ST_U8, 1);
          if (available) {
            let bi = buffer.getNextBifromHi(out.series[samplei1].codingTable);
            let currentMeasure = {
              data_relative_timestamp: 0,
              data: {}
            };
            if (bi <= BR_HUFF_MAX_i1_TABLE) {
              let precedingValue = out.series[samplei1].uncompressSamples[out.series[samplei1].uncompressSamples.length - 1].data.value;
              if (bi > 0) currentMeasure.data.value = completeCurrentMeasure(buffer, precedingValue, out.series[samplei1].codingType, argList[samplei1].resol, bi);
              else {
                if (first_null_delta_value) {
                  first_null_delta_value = 0;
                  continue;
                } else currentMeasure.data.value = precedingValue;
              }
            } else {
              currentMeasure.data.value = buffer.getNextSample(
                argList[samplei1].sampletype
              );
            }
            currentMeasure.data_relative_timestamp = timestampCommon[i];
            out.series[samplei1].uncompressSamples.push(currentMeasure);
          }
        }
      }
      return lastTimestamp;
    }
    function initTimestampCommonTable(out, buffer, nbSampleToParse, firstSamplei1) {
      let timestampCommon = [];
      let lastTimestamp = 0;
      let timestampCoding = buffer.getNextSample(ST_U8, 2);
      for (let i = 0; i < nbSampleToParse; i++) {
        let bi = buffer.getNextBifromHi(timestampCoding);
        if (bi <= BR_HUFF_MAX_i1_TABLE) {
          if (i === 0) timestampCommon.push(out.series[firstSamplei1].uncompressSamples[0].data_relative_timestamp);
          else {
            if (bi > 0) {
              let precedingTimestamp2 = timestampCommon[i - 1];
              timestampCommon.push(
                buffer.getNextSample(ST_U32, bi) + precedingTimestamp2 + Math.pow(2, bi) - 1
              );
            } else timestampCommon.push(precedingTimestamp);
          }
        } else timestampCommon.push(buffer.getNextSample(ST_U32));
        lastTimestamp = timestampCommon[i];
      }
      return {
        timestampCommon,
        lastTimestamp
      };
    }
    function completeCurrentMeasure(buffer, precedingValue, codingType, resol, bi) {
      let currentValue = buffer.getNextSample(ST_U16, bi);
      if (codingType === 0) return computeAdlcValue(currentValue, resol, precedingValue, bi);
      if (codingType === 1) return (currentValue + Math.pow(2, bi) - 1) * resol + precedingValue;
      return precedingValue - (currentValue + (Math.pow(2, bi) - 1)) * resol;
    }
    function computeAdlcValue(currentValue, resol, precedingValue, bi) {
      if (currentValue >= Math.pow(2, bi - 1)) return currentValue * resol + precedingValue;
      return (currentValue + 1 - Math.pow(2, bi)) * resol + precedingValue;
    }
    function handleSeparateTimestamp(out, buffer, argList, last_timestamp, flag, tagsz) {
      let tag = {};
      for (let i = 0; i < flag.nb_of_type_measure; i++) {
        tag.lbl = buffer.getNextSample(ST_U8, tagsz);
        let samplei1 = findi1FromArgList(argList, tag);
        let compressSampleNb = buffer.getNextSample(ST_U8, 8);
        if (compressSampleNb) {
          let timestampCoding = buffer.getNextSample(ST_U8, 2);
          for (let j = 0; j < compressSampleNb; j++) {
            let precedingRelativeTimestamp = out.series[samplei1].uncompressSamples[out.series[samplei1].uncompressSamples.length - 1].data_relative_timestamp;
            let currentMeasure = {
              data_relative_timestamp: 0,
              data: {}
            };
            let bi = buffer.getNextBifromHi(timestampCoding);
            currentMeasure.data_relative_timestamp = computeTimestampFromBi(buffer, precedingRelativeTimestamp, bi);
            if (currentMeasure.data_relative_timestamp > last_timestamp) last_timestamp = currentMeasure.data_relative_timestamp;
            bi = buffer.getNextBifromHi(out.series[samplei1].codingTable);
            if (bi <= BR_HUFF_MAX_i1_TABLE) {
              let precedingValue = out.series[samplei1].uncompressSamples[out.series[samplei1].uncompressSamples.length - 1].data.value;
              if (bi > 0) currentMeasure.data.value = completeCurrentMeasure(buffer, precedingValue, out.series[samplei1].codingType, argList[samplei1].resol, bi);
              else currentMeasure.data.value = precedingValue;
            } else currentMeasure.data.value = buffer.getNextSample(argList[samplei1].sampletype);
            out.series[samplei1].uncompressSamples.push(currentMeasure);
          }
        }
      }
      return last_timestamp;
    }
    function adaptToExpectedFormat(out, argList, batchAbsoluteTimestamp) {
      let returnedGlobalObject = {
        batch_counter: out.batch_counter,
        batch_relative_timestamp: out.batch_relative_timestamp
      };
      if (batchAbsoluteTimestamp) returnedGlobalObject.batch_absolute_timestamp = batchAbsoluteTimestamp;
      returnedGlobalObject.dataset = out.series.reduce(
        function(acc, current, i1) {
          return acc.concat(
            current.uncompressSamples.map(function(item) {
              let returned = {
                data_relative_timestamp: item.data_relative_timestamp,
                data: {
                  value: argList[i1].divide ? item.data.value / argList[i1].divide : item.data.value,
                  label: argList[i1].taglbl
                }
              };
              if (argList[i1].lblname) returned.data.label_name = argList[i1].lblname;
              if (batchAbsoluteTimestamp) {
                returned.data_absolute_timestamp = computeDataAbsoluteTimestamp(
                  batchAbsoluteTimestamp,
                  out.batch_relative_timestamp,
                  item.data_relative_timestamp
                );
              }
              return returned;
            })
          );
        },
        []
      );
      return returnedGlobalObject;
    }
    function computeDataAbsoluteTimestamp(bat, brt, drt) {
      return new Date(new Date(bat) - (brt - drt) * 1e3).toISOString();
    }
    function normalisation_batch(input) {
      let date = input.date;
      let decoded = brUncompress(input.batch1, input.batch2, input.payload, date);
      let dataListe = [];
      for (let i = 0; i < decoded.dataset.length; i++) {
        let data = decoded.dataset[i];
        let dataObject = {
          "variable": data.data.label_name,
          "value": data.data.value,
          "date": data.data_absolute_timestamp
        };
        dataListe.push(dataObject);
      }
      return dataListe;
    }
    module2.exports = {
      normalisation_batch
    };
  }
});

// ../../device-catalog/vendors/watteco/drivers/decode.js
var require_decode = __commonJS({
  "../../device-catalog/vendors/watteco/drivers/decode.js"(exports2, module2) {
    var standard = require_standard();
    var batch = require_batch();
    function watteco_decodeUplink(input, batch_parameters, endpoint_parameters) {
      let bytes = input.bytes;
      let port = input.fPort;
      let date = input.recvTime;
      try {
        let decoded = standard.normalisation_standard(input, endpoint_parameters);
        let payload = decoded.payload;
        if (decoded.type === "batch") {
          let batchInput = {
            batch1: batch_parameters[0],
            batch2: batch_parameters[1],
            payload,
            date
          };
          try {
            let decoded2 = batch.normalisation_batch(batchInput);
            return {
              data: decoded2,
              warnings: []
            };
          } catch (error) {
            return {
              error: error.message,
              warnings: []
            };
          }
        } else {
          return {
            data: decoded.data,
            warnings: decoded.warning
          };
        }
      } catch (error) {
        return {
          error: error.message,
          warnings: []
        };
      }
    }
    module2.exports = {
      watteco_decodeUplink
    };
  }
});

// ../../device-catalog/vendors/watteco/drivers/moveo_v1.0/extractPoints.js
var require_extractPoints = __commonJS({
  "../../device-catalog/vendors/watteco/drivers/moveo_v1.0/extractPoints.js"(exports2) {
    function extractPoints(input) {
      const result = {};
      const data = input.message;
      if (input.message != null && Array.isArray(data)) {
        data.forEach((item) => {
          if (item.variable != null) {
            switch (item.variable) {
              case "temperature":
                if (!result.temperature) {
                  result.temperature = { unitId: "Cel", records: [] };
                }
                result.temperature.records.push({
                  eventTime: new Date(item.date).toISOString(),
                  value: item.value
                });
                break;
              case "humidity":
                if (!result.humidity) {
                  result.humidity = { unitId: "%RH", records: [] };
                }
                result.humidity.records.push({
                  eventTime: new Date(item.date).toISOString(),
                  value: item.value
                });
                break;
              case "illuminance":
                if (!result.illuminance) {
                  result.illuminance = { unitId: "lx", records: [] };
                }
                result.illuminance.records.push({
                  eventTime: new Date(item.date).toISOString(),
                  value: item.value
                });
                break;
              case "occupancy":
                if (!result.presence) {
                  result.presence = { unitId: "state", records: [] };
                }
                result.presence.records.push({
                  eventTime: new Date(item.date).toISOString(),
                  value: item.value
                });
                break;
              case "violation_detection":
                if (!result.status) {
                  result.status = { unitId: "state", records: [], nature: "violation_detection" };
                }
                result.status.records.push({
                  eventTime: new Date(item.date).toISOString(),
                  value: item.value
                });
                break;
              case "battery_voltage":
                if (!result.batteryVoltage) {
                  result.batteryVoltage = { unitId: "V", records: [] };
                }
                result.batteryVoltage.records.push({
                  eventTime: new Date(item.date).toISOString(),
                  value: item.value
                });
                break;
              case "disposable_battery_voltage":
                if (!result.batteryVoltage) {
                  result.batteryVoltage = { unitId: "V", records: [] };
                }
                result.batteryVoltage.records.push({
                  eventTime: new Date(item.date).toISOString(),
                  value: item.value
                });
                break;
              default:
                break;
            }
          }
        });
      } else {
        return {};
      }
      if (result.batteryVoltage != null && result.batteryVoltage.records.length === 1) {
        let val = result.batteryVoltage.records[0].value;
        result.batteryVoltage = { unitId: "V", record: val };
      }
      if (result.presence != null && result.presence.records.length === 1) {
        let val = result.presence.records[0].value;
        result.presence = { unitId: "state", record: val };
      }
      if (result.status != null && result.status.records.length === 1) {
        let val = result.status.records[0].value;
        result.status = { unitId: "state", record: val, nature: "violation_detection" };
      }
      if (result.humidity != null && result.humidity.records.length === 1) {
        let val = result.humidity.records[0].value;
        result.humidity = { unitId: "%RH", record: val };
      }
      if (result.illuminance != null && result.illuminance.records.length === 1) {
        let val = result.illuminance.records[0].value;
        result.illuminance = { unitId: "lx", record: val };
      }
      if (result.temperature != null && result.temperature.records.length === 1) {
        let val = result.temperature.records[0].value;
        result.temperature = { unitId: "Cel", record: val };
      }
      return result;
    }
    exports2.extractPoints = extractPoints;
  }
});

// ../../device-catalog/vendors/watteco/drivers/moveo_v1.0/main.js
var watteco = require_decode();
var batch_param = [3, [
  { taglbl: 0, resol: 1, sampletype: 4, lblname: "OCC", divide: 1 },
  { taglbl: 1, resol: 10, sampletype: 7, lblname: "temperature", divide: 100 },
  { taglbl: 2, resol: 100, sampletype: 6, lblname: "humidity", divide: 100 },
  { taglbl: 5, resol: 10, sampletype: 6, lblname: "luminosity", divide: 100 }
]];
var endpointCorresponder = {
  pin_state: ["violation_detection"]
};
function decodeUplink(input) {
  return watteco.watteco_decodeUplink(input, batch_param, endpointCorresponder);
}
exports.decodeUplink = decodeUplink;
module.exports.extractPoints = require_extractPoints().extractPoints;
