
// CMi41xx
const packetTypes = {
    // CMi4110
    0x00: ["CMi4110", "Standard", "Landis+Gyr"],
    0x01: ["CMi4110", "Compact", "Landis+Gyr"],
    0x02: ["CMi4110", "JSON", "Landis+Gyr"],
    0x03: ["CMi4110", "Scheduled Daily Redundant", "Landis+Gyr", ["", "", "", "accAt24", ""]],
    0x04: ["CMi4110", "Scheduled Extended", "Landis+Gyr"],
    0x3F: ["CMi4110", "Scheduled Extended+", "Landis+Gyr", ["", "tariff1", "tariff2", "tariff3", "", ""]],
    0x40: ["CMi4110", "Scheduled Extended+ 2", "Landis+Gyr"],
    0x41: ["CMi4110", "Compact Tariff", "Landis+Gyr", ["", "tariff1", "tariff2", "tariff3", "", ""]],
    0x46: ["CMi4110", "Maximum Flow", "Landis+Gyr"],
    0x47: ["CMi4110", "Scheduled Daily Redundant Tariff", "Landis+Gyr", ["at24", "", "", "", "", ""]],
    0x48: ["CMi4110", "Scheduled Daily Redundant Tariff 2", "Landis+Gyr"],
    0x49: ["CMi4110", "Scheduled Monthly", "Landis+Gyr"],
    0x4A: ["CMi4110", "Scheduled Daily", "Landis+Gyr", ["at24", "", "", "", "", ""]],

    // CMi4111
    0x05: ["CMi4111", "Standard", "Landis+Gyr"],
    0x06: ["CMi4111", "Compact", "Landis+Gyr"],
    0x07: ["CMi4111", "JSON", "Landis+Gyr"],
    0x08: ["CMi4111", "Scheduled - Daily redundant", "Landis+Gyr", ["", "", "", "", "", "accAt24"]],
    0x09: ["CMi4111", "Scheduled - Extended", "Landis+Gyr"],
    0x0A: ["CMi4111", "Combined heat/cooling", "Landis+Gyr"],
    0x0B: ["CMi4111", "Simple billing", "Landis+Gyr"],
    0x0C: ["CMi4111", "Plausibility check", "Landis+Gyr"],
    0x0D: ["CMi4111", "Monitoring", "Landis+Gyr"],

    // CMi4130
    0x0F: ["CMi4130", "Standard", "Itron"],
    0x10: ["CMi4130", "Compact", "Itron"],
    0x11: ["CMi4130", "JSON", "Itron"],
    0x12: ["CMi4130", "Scheduled - Daily redundant", "Itron", ["", "", "", "", "", "accAt24"]],
    0x13: ["CMi4130", "Scheduled - Extended", "Itron"],
    0x14: ["CMi4130", "Combined heat/cooling", "Itron"],

    // CMi4140
    0x15: ["CMi4140", "Standard", "Kamstrup"],
    0x16: ["CMi4140", "Compact", "Kamstrup"],
    0x17: ["CMi4140", "JSON", "Kamstrup"],
    0x18: ["CMi4140", "Scheduled Daily Redundant", "Kamstrup"],
    0x19: ["CMi4140", "Scheduled Extended", "Kamstrup"],
    0x1A: ["CMi4140", "Combined heating/cooling", "Kamstrup"],
    0x1B: ["CMi4140", "Heat Intelligence", "Kamstrup", ["E1", "E3", "", "", "", ""]],
    0x3B: ["CMi4140", "Scheduled Extended+", "Kamstrup"],
    0x3C: ["CMi4140", "Scheduled Extended+ 2", "Kamstrup"],
    0x1C: ["CMi4140", "Pulse", "Kamstrup"],
    0x1D: ["CMi4140", "Pulse 2", "Kamstrup"],
    0x4D: ["CMi4140", "Pulse Extended", "Kamstrup"],
    0x4E: ["CMi4140", "Pulse Extended 2", "Kamstrup"],
    0x4F: ["CMi4140", "DR0 message", "Kamstrup"],

    // CMi4160
    0x1E: ["CMi4160", "Standard", "Diehl"],
    0x1F: ["CMi4160", "Compact", "Diehl"],
    0x20: ["CMi4160", "JSON", "Diehl"],
    0x21: ["CMi4160", "Scheduled - Daily redundant", "Diehl"],
    0x22: ["CMi4160", "Scheduled - Extended", "Diehl"],
    0x23: ["CMi4160", "Combined heat/cooling", "Diehl"],
    0x3D: ["CMi4160", "Scheduled Extended+", "Diehl"],
    0x3E: ["CMi4160", "Scheduled Extended+ 2", "Diehl"],

    // CMi4170
    0x24: ["CMi4170", "Standard", "Engelmann"],
    0x25: ["CMi4170", "Compact", "Engelmann"],
    0x26: ["CMi4170", "JSON", "Engelmann"],
    0x27: ["CMi4170", "Scheduled - daily redundant", "Engelmann"],
    0x28: ["CMi4170", "Scheduled - Extended", "Engelmann"],
    0x29: ["CMi4170", "Combined heat/cooling", "Engelmann"],
    0x2C: ["CMi4170", "Engelmann", "Engelmann"],
    0x2D: ["CMi4170", "Engelmann 2", "Engelmann"],
    0x50: ["CMi4170", "DR0 message", "Engelmann"],
};

const valueMap = {
    // energy
    0x0400: ["energy", "Wh", 0.001],
    0x0401: ["energy", "Wh", 0.01],
    0x0402: ["energy", "Wh", 0.1],
    0x0403: ["energy", "Wh", 1],
    0x0404: ["energy", "Wh", 10],
    0x0405: ["energy", "Wh", 100],
    0x0406: ["energy", "kWh", 1],
    0x0407: ["energy", "kWh", 10],
    0x0408: ["energy", "J", 1],
    0x0409: ["energy", "J", 10],
    0x040a: ["energy", "J", 100],
    0x040b: ["energy", "J", 1000],
    0x040c: ["energy", "J", 10000],
    0x040d: ["energy", "J", 100000],
    0x040e: ["energy", "MJ", 1],
    0x040f: ["energy", "MJ", 10],
    0x04fb: {
        0x0d: ["energy", "MCal", 1],
        0x0e: ["energy", "MCal", 10],
        0x0f: ["energy", "MCal", 100],
        // cooling energy
        0x8d: ["coolingEnergy", "MCal", 1],
        0x8e: ["coolingEnergy", "MCal", 10],
        0x8f: ["coolingEnergy", "MCal", 100],
    },

    0x4400: ["accumulatedEnergy", "Wh", 0.001],
    0x4401: ["accumulatedEnergy", "Wh", 0.01],
    0x4402: ["accumulatedEnergy", "Wh", 0.1],
    0x4403: ["accumulatedEnergy", "Wh", 1],
    0x4404: ["accumulatedEnergy", "Wh", 10],
    0x4405: ["accumulatedEnergy", "Wh", 100],
    0x4406: ["accumulatedEnergy", "kWh", 1],
    0x4407: ["accumulatedEnergy", "kWh", 10],
    0x440e: ["accumulatedEnergy", "MJ", 1],
    0x440f: ["accumulatedEnergy", "MJ", 10],
    0x44fb: {
        0x0d: ["accumulatedEnergy", "MCal", 1],
        0x0e: ["accumulatedEnergy", "MCal", 10],
        0x0f: ["accumulatedEnergy", "MCal", 100],
    },



    // cooling energy, have additional 0xff02 flag
    0x0480: ["coolingEnergy", "Wh", 0.001],
    0x0481: ["coolingEnergy", "Wh", 0.01],
    0x0482: ["coolingEnergy", "Wh", 0.1],
    0x0483: ["coolingEnergy", "Wh", 1],
    0x0484: ["coolingEnergy", "Wh", 10],
    0x0485: ["coolingEnergy", "Wh", 100],
    0x0486: ["coolingEnergy", "kWh", 1],
    0x0487: ["coolingEnergy", "kWh", 10],
    0x048e: ["coolingEnergy", "MJ", 1],
    0x048f: ["coolingEnergy", "MJ", 10],

    // energy E8, E9
    0x04ff: {
        0x07: ["energyE8", "mÂ³*Â°C", 1],
        0x08: ["energyE9", "mÂ³*Â°C", 1],
    },

    // volume
        0x0410: ["volume", "mÂ³", 0.000001],
    0x0411: ["volume", "mÂ³", 0.00001],
    0x0412: ["volume", "mÂ³", 0.0001],
    0x0413: ["volume", "mÂ³", 0.001],
    0x0414: ["volume", "mÂ³", 0.01],
    0x0415: ["volume", "mÂ³", 0.1],
    0x0416: ["volume", "mÂ³", 1],
    0x0417: ["volume", "mÂ³", 10],

    // power
        0x0228: ["power", "W", 0.001],
    0x0229: ["power", "W", 0.01],
    0x022a: ["power", "W", 0.1],
    0x022b: ["power", "W", 1],
    0x022c: ["power", "W", 10],
    0x022d: ["power", "W", 100],
    0x022e: ["power", "kW", 1],
    0x022f: ["power", "kW", 10],

    // flow
    0x023b: ["flow", "mÂ³/h", 0.001],
    0x023c: ["flow", "mÂ³/h", 0.01],
    0x023d: ["flow", "mÂ³/h", 0.1],
    0x023e: ["flow", "mÂ³/h", 1],
    0x023f: ["flow", "mÂ³/h", 10],

    // forwardTemperature
    0x1258: ["maxForwardTemperature", "Â°C", 0.001],
    0x1259: ["maxForwardTemperature", "Â°C", 0.01],
    0x125a: ["maxForwardTemperature", "Â°C", 0.1],
    0x125b: ["maxForwardTemperature", "Â°C", 1],

    0x0258: ["forwardTemperature", "Â°C", 0.001],
    0x0259: ["forwardTemperature", "Â°C", 0.01],
    0x025a: ["forwardTemperature", "Â°C", 0.1],
    0x025b: ["forwardTemperature", "Â°C", 1],

    // returnTemperature
    0x125c: ["maxReturnTemperature", "Â°C", 0.001],
    0x125d: ["maxReturnTemperature", "Â°C", 0.01],
    0x125e: ["maxReturnTemperature", "Â°C", 0.1],
    0x125f: ["maxReturnTemperature", "Â°C", 1],

    0x025c: ["returnTemperature", "Â°C", 0.001],
    0x025d: ["returnTemperature", "Â°C", 0.01],
    0x025e: ["returnTemperature", "Â°C", 0.1],
    0x025f: ["returnTemperature", "Â°C", 1],

    0x07ff: {
        0xa0: ["powerFlows", null, null],
    },
    0x07ff: {
        0x21: ["meterInfo", null, null],
    },

    // bcd values
    0x0a58: ["forwardTemperature", "Â°C", 0.001],
    0x0a59: ["forwardTemperature", "Â°C", 0.01],
    0x0a5a: ["forwardTemperature", "Â°C", 0.1],
    0x0a5b: ["forwardTemperature", "Â°C", 1],

    0x0a5c: ["returnTemperature", "Â°C", 0.001],
    0x0a5d: ["returnTemperature", "Â°C", 0.01],
    0x0a5e: ["returnTemperature", "Â°C", 0.1],
    0x0a5f: ["returnTemperature", "Â°C", 1],

    0x0b2b: ["power", "kW", 0.001],
    0x0b2c: ["power", "kW", 0.01],
    0x0b2d: ["power", "kW", 0.1],
    0x0b2e: ["power", "kW", 1],

    0x0b3b: ["flow", "mÂ³/h", 0.001],
    0x0b3c: ["flow", "mÂ³/h", 0.01],
    0x0b3d: ["flow", "mÂ³/h", 0.1],
    0x0b3e: ["flow", "mÂ³/h", 1],

    0x0c06: ["energy", "kWh", 1],
    0x0c07: ["energy", "MWh", 0.01],
    0x0cfb: {
        0x00: ["energy", "MWh", 0.1],
        0x01: ["energy", "MWh", 1],
        0x08: ["energy", "GJ", 0.1],
        0x09: ["energy", "GJ", 1],
    },
    0x0c0e: ["energy", "GJ", 0.001],
    0x0c0f: ["energy", "GJ", 0.01],

    0x0c14: ["volume", "mÂ³", 0.01],
    0x0c15: ["volume", "mÂ³", 0.1],
    0x0c16: ["volume", "mÂ³", 1],

    0x8402: {
        0x03: ["tarif2energy", "Wh", 1],
    },
    0x8403: {
        0x03: ["tarif3energy", "Wh", 1],
    },
    0x8440: {
        0x13: ["pulse1volume", "mÂ³", 0.001],
        0x14: ["pulse1volume", "mÂ³", 0.01],
        0x15: ["pulse1volume", "mÂ³", 0.1],
        0x06: ["pulse1energy", "MWh", 0.001],
        0x07: ["pulse1energy", "MWh", 0.01],
    },
    0x8480: {
        0x04: {
            0x13: ["pulse2volume", "mÂ³", 0.001],
            0x14: ["pulse2volume", "mÂ³", 0.01],
            0x15: ["pulse2volume", "mÂ³", 0.1],
            0x06: ["pulse2energy", "MWh", 0.001],
            0x07: ["pulse2energy", "MWh", 0.01],
        }
    },
    0x84c0: {
        0x04: {
            0x13: ["pulse3volume", "mÂ³", 0.001],
            0x14: ["pulse3volume", "mÂ³", 0.01],
            0x15: ["pulse3volume", "mÂ³", 0.1],
            0x06: ["pulse3energy", "MWh", 0.001],
            0x07: ["pulse3energy", "MWh", 0.01],
        }
    },
    0x8c01: {
        0x06: ["energyAtDueDate", "kWh", 1]
    },
    0x8c10: ["tariff1energy", null, 1],
    0x8c20: ["tariff2energy", null, 1],
    0x9b01: {
        0x3b: ["maxFlow", "mÂ³/h", 0.001]
    },

    0x4c06: ["energy", "kWh", 1],
    0x4c07: ["energy", "MWh", 0.01],
    0x4cfb: {
        0x00: ["energy", "MWh", 0.1],
        0x01: ["energy", "MWh", 1],
        0x08: ["energy", "GJ", 0.1],
        0x09: ["energy", "GJ", 1],
    },
    0x4c0e: ["energy", "GJ", 0.001],
    0x4c0f: ["energy", "GJ", 0.01],

    0x4c14: ["volume", "mÂ³", 0.01],
    0x4c15: ["volume", "mÂ³", 0.1],
    0x4c16: ["volume", "mÂ³", 1],

    0xb401: {
        0x00: ["previousMonthEnergy", "Wh", 0.001],
        0x01: ["previousMonthEnergy", "Wh", 0.01],
        0x02: ["previousMonthEnergy", "Wh", 0.1],
        0x03: ["previousMonthEnergy", "Wh", 1],
        0x04: ["previousMonthEnergy", "Wh", 10],
        0x05: ["previousMonthEnergy", "Wh", 100],
        0x06: ["previousMonthEnergy", "kWh", 1],
        0x07: ["previousMonthEnergy", "kWh", 10],
        0x0e: ["previousMonthEnergy", "MJ", 1],
        0x0f: ["previousMonthEnergy", "MJ", 10],
    },

    0x0420: ["S", "s", 1],
    0x0421: ["Min", "min", 1],
    0x0422: ["H", "h", 1],
    0x0423: ["Days", "days", 1],

    0xcc10: {
        0x07: ["at24tariff1energy", null, 1],
    },
    0xcc20: {
        0x07: ["at24tariff2energy", null, 1],
    },

    // meterID
    0x0c78: ["meterId", null, null],
    0x0c79: ["customerMeterId", null, null],
    0x06ff: {
        0x21: ["meterId", null, null],
    },
    0x0779: ["enhancedMeterId", null, null],

    // error and warning flags
    0x01fd: {
        0x17: ["errorFlags", null, 1],
    },
    0x02fd: {
        0x17: ["errorFlags", null, 1],
    },
    0x04fd: {
        0x17: ["errorFlags", null, 1],
    }
};



function decodeUplink(input) {
    let r = Buffer.from(input.bytes);
    let pos = 0;
    let measurementNo = 0;
    let data = {};
    let traces = [];
    let trace = {};
    let debug = input.debug || false;

    try {

        // Message Format Identifier (1 byte)
        data.messageFormat = r.readUInt8(pos); pos++;
        const messageFormat = data.messageFormat.toString(16).padStart(2, "0");
        const packetInfo = packetTypes[data.messageFormat];
        if (typeof (packetInfo) === "undefined") {

            throw new Error(`Unsupported message format ${messageFormat}`);
        }

        data.messageFormatInfo = packetInfo.slice(0, 3);

        if (data.messageFormatInfo[1] === "JSON") {
            // specific json format
            const jsonString = r.toString("utf8", 1);
            const measurements = JSON.parse(jsonString);
            const unified = {
                "messageFormat": data.messageFormat.toString(16).padStart(2, "0"),
                "energy": measurements.E,
                "energyUnit": measurements.U,
                "meterId": measurements.ID,
            }

            if (debug) {
                traces.push(
                    {
                        headerStart: 0,
                        headerInfo: jsonString,
                        dataStart: 1,
                        dataEnd: r.length - 2,
                    }
                );
            }

            return {
                data: { ...data, ...unified },
                warnings: [],
                errors: []
            };
        }

        while (pos < (r.length)) {
            // read the dib and size
            let dif = r.readUInt16BE(pos);
            let size = r.readUInt8(pos) & 0xf;
            trace = {
                headerStart: pos
            };
            pos += 2;

            // check for specific timestamp dib
            if (dif == 0x046d || dif == 0x346d) {
                trace.dataStart = pos;
                const ts = r.subarray(pos, pos + 4); pos += 4;
                if (!(ts[1] & 0x01)) {
                    let year = 1900 + 100 * (ts[1] >> 5);
                    year += ((ts[3] >> 4) << 3) | (ts[2] >> 5);
                    data.timeStamp = year + "-" +
                        ("0" + (ts[3] & 0x0f)).substr(-2) + "-" +
                        ("0" + (ts[2] & 0x1f)).substr(-2) + "T" +
                        ("0" + (ts[1] & 0x1f)).substr(-2) + ":" +
                        ("0" + (ts[0] & 0x7f)).substr(-2) + "Z";
                }
                if (debug) {
                    traces.push(
                        {
                            ...trace, ...{
                                headerInfo: ["timeStamp", null, null],
                                dataStart: dataStart,
                                dataEnd: pos - 1,
                            }
                        }
                    );
                }

                measurementNo++;
                continue;
            }

            let map = valueMap[(dif >> 12) === 0x7 ? dif & 0xfff : dif];
            if (typeof (map) === "undefined") {
                dif &= 0x0fff;
                throw new Error(`Unknown measurement ${dif.toString(16)}`);
            }

            while (!Array.isArray(map)) {
                const subType = r.readUInt8(pos); pos++;
                let subMap = map[subType];
                if (typeof (subMap) === "undefined") throw new Error(`Unknown measurement ${dif.toString(16)} subtype ${subType.toString(16)}`);

                map = subMap;
            }

            // get default measurement name, or a specific one from the packet definition
            let name = (packetInfo.length == 3) ? map[0] : packetInfo[3][measurementNo] + map[0];

            // cooling energy can have very special signature 0xff02 and 0xff03
            if (name === "coolingEnergy") {
                const flag = r.readUInt16LE(pos);
                switch (flag) {
                    case 0xff02: pos += 2; break;
                    case 0xff03: name = "error" + name; pos += 2; break;
                }
            }

            trace.headerInfo = [name, map[1], map[2]];
            trace.dataStart = pos;

            // read the value
            let value = 0;
            switch (size) {
                case 0x1: value = r.readUInt8(pos); break;
                case 0x2: value = r.readInt16LE(pos); break;
                case 0x4: value = r.readInt32LE(pos); break;
                case 0x6: {
                    value = r.readBigInt64BE(pos) & 0xffffffffff; size = 6;
                }
                case 0x7: {
                    value = r.readBigInt64BE(pos); size = 8;
                } break;
                case 0xa: {
                    const bcd = r.readUInt16LE(pos).toString(16);
                    value = parseInt(bcd, 10); size = 2;
                } break;
                case 0xb: {
                    const bcd = (r.readUInt32LE(pos) & 0xffffff).toString(16);
                    value = parseInt(bcd, 10); size = 3;
                } break;
                case 0xc: {
                    const bcd = r.readUInt32LE(pos).toString(16);
                    value = parseInt(bcd, 10); size = 4;
                } break;
            }
            pos += size;

            // set units
            if (map[1] != null) {
                data[name + "Unit"] = map[1];
            }

            // apply multiplier
            if (map[2] != null) {
                value *= map[2];
            }

            // set error flag
            if ((dif >> 12) == 0x7) {
                data[name + "Error"] = true
            }
            else {
                // normalize and store the floating point value
                data[name] = (Number.isInteger(value) || typeof (value) === "bigint") ? value : parseFloat(value.toPrecision(8), 10);
                measurementNo++;

                trace.dataEnd = pos - 1;
            }

            if (debug) {
                traces.push(trace);
            }
        }

    } catch (e) {
        traces.push(trace);
        data.messageFormat = data.messageFormat.toString(16).padStart(2, "0"); // change to hex representation

        return {
            data: data,
            warnings: [],
            errors: [e.message]
        }
    }

    data.messageFormat = data.messageFormat.toString(16).padStart(2, "0"); // change to hex representation

    return {
        data: data,
        warnings: [],
        errors: []
    };
}
    