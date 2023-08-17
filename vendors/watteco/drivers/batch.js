let ST_UNDEF = 0;
let ST_BL = 1;
let ST_U4 = 2;
let ST_I4 = 3;
let ST_U8 = 4;
let ST_I8 = 5;
let ST_U16 = 6;
let ST_I16 = 7;
let ST_U24 = 8;
let ST_I24 = 9;
let ST_U32 = 10;
let ST_I32 = 11;
let ST_FL = 12;
let ST = {};
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
let BR_HUFF_MAX_i1_TABLE = 14;
let NUMBER_OF_SERIES = 16;
let HUFF = [
    [
        { sz: 2, lbl: 0x000 },
        { sz: 2, lbl: 0x001 },
        { sz: 2, lbl: 0x003 },
        { sz: 3, lbl: 0x005 },
        { sz: 4, lbl: 0x009 },
        { sz: 5, lbl: 0x011 },
        { sz: 6, lbl: 0x021 },
        { sz: 7, lbl: 0x041 },
        { sz: 8, lbl: 0x081 },
        { sz: 10, lbl: 0x200 },
        { sz: 11, lbl: 0x402 },
        { sz: 11, lbl: 0x403 },
        { sz: 11, lbl: 0x404 },
        { sz: 11, lbl: 0x405 },
        { sz: 11, lbl: 0x406 },
        { sz: 11, lbl: 0x407 }
    ],
    [
        { sz: 7, lbl: 0x06f },
        { sz: 5, lbl: 0x01a },
        { sz: 4, lbl: 0x00c },
        { sz: 3, lbl: 0x003 },
        { sz: 3, lbl: 0x007 },
        { sz: 2, lbl: 0x002 },
        { sz: 2, lbl: 0x000 },
        { sz: 3, lbl: 0x002 },
        { sz: 6, lbl: 0x036 },
        { sz: 9, lbl: 0x1bb },
        { sz: 9, lbl: 0x1b9 },
        { sz: 10, lbl: 0x375 },
        { sz: 10, lbl: 0x374 },
        { sz: 10, lbl: 0x370 },
        { sz: 11, lbl: 0x6e3 },
        { sz: 11, lbl: 0x6e2 }
    ],
    [
        { sz: 4, lbl: 0x009 },
        { sz: 3, lbl: 0x005 },
        { sz: 2, lbl: 0x000 },
        { sz: 2, lbl: 0x001 },
        { sz: 2, lbl: 0x003 },
        { sz: 5, lbl: 0x011 },
        { sz: 6, lbl: 0x021 },
        { sz: 7, lbl: 0x041 },
        { sz: 8, lbl: 0x081 },
        { sz: 10, lbl: 0x200 },
        { sz: 11, lbl: 0x402 },
        { sz: 11, lbl: 0x403 },
        { sz: 11, lbl: 0x404 },
        { sz: 11, lbl: 0x405 },
        { sz: 11, lbl: 0x406 },
        { sz: 11, lbl: 0x407 }
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
    let series = [],
        i = 0;
    while (i < NUMBER_OF_SERIES) {
        series.push({codingType: 0,
            codingTable: 0,
            resolution: null,
            uncompressSamples: []
        });
        i += 1;
    }
    return {batch_counter: 0,
        batch_relative_timestamp: 0,
        series: series
    };
}
function createBuffer(byteArray) {
    function bitsBuf2HuffPattern(byteArray, i1, nb_bits) {
        let sourceBitStart = i1;
        let sz = nb_bits - 1;
        if (byteArray.length * 8 < sourceBitStart + nb_bits) {
            throw new Error("Batch : Verify that dest buf is large enough");
        }
        let bittoread = 0;
        let pattern = 0;
        while (nb_bits > 0) {
            if (byteArray[sourceBitStart >> 3] & (1 << (sourceBitStart & 0x07))) {
                pattern |= 1 << (sz - bittoread);
            }
            nb_bits--;
            bittoread++;
            sourceBitStart++;
        }
        return pattern;
    }
    return {
        i1: 0,
        byteArray: byteArray,
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
                    if (this.byteArray[idx] & (1 << (sourceBitStart & 0x07))) {
                        u32 |= 1 << ((nbytes - 1) * 8 + bittoread);
                    }
                    nbitsfrombyte--;
                    bittoread++;
                    sourceBitStart += 1;
                }
                nbytes--;
                nbitsfrombyte = 8;
            }
            if ((sampleType == ST_I4 || sampleType == ST_I8 ||sampleType == ST_I16 ||sampleType == ST_I24) && u32 & (1 << (nbBits - 1))) {
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
                    if (
                        HUFF[huff_coding][j].sz == i &&
                        lhuff == HUFF[huff_coding][j].lbl
                    ) {
                        this.i1 += i;
                        return j;
                    }
                }
            }
            throw new Error("Bi not found in HUFF table");
        }
    }
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
    let binbase = flagAsInt.toString(2)
    while (binbase.length < 8) {
        binbase = "0" + binbase
    }
    return {
        isCommonTimestamp: parseInt(binbase[binbase.length - 2], 2),
        hasSample: !parseInt(binbase[binbase.length - 3], 2),
        batch_req: parseInt(binbase[binbase.length - 4], 2),
        nb_of_type_measure: parseInt(binbase.substring(0, 4), 2)
    }
}
function prePopulateOutput(out, buffer, argList, flag, tagsz) {
    let currentTimestamp = 0
    let i1_of_the_first_sample = 0
    for (let i = 0; i < flag.nb_of_type_measure; i++) {
        let tag = {
            size: tagsz,
            lbl: buffer.getNextSample(ST_U8, tagsz)
        }
        let samplei1 = findi1FromArgList(argList, tag)
        if (i === 0) i1_of_the_first_sample = samplei1
        currentTimestamp = extractTimestampFromBuffer(buffer, currentTimestamp)
        out.series[samplei1] = computeSeries(
            buffer,
            argList[samplei1].sampletype,
            tag.lbl,
            currentTimestamp
        )
        if (flag.hasSample) {
            out.series[samplei1].codingType = buffer.getNextSample(ST_U8, 2)
            out.series[samplei1].codingTable = buffer.getNextSample(ST_U8, 2)
        }
    }
    return {
        last_timestamp: currentTimestamp,
        i1_of_the_first_sample: i1_of_the_first_sample
    }
}
function computeSeries(buffer, sampletype, label, currentTimestamp) {
    return {
        uncompressSamples: [
            {
                data_relative_timestamp: currentTimestamp,
                data: {
                    value: getMeasure(buffer, sampletype),
                    label: label
                }
            }
        ],
        codingType: 0,
        codingTable: 0,
        resolution: null
    }
}
function findi1FromArgList(argList, tag) {
    for (let i = 0; i < argList.length; i++) {
        if (argList[i].taglbl === tag.lbl) return i
    }
    throw new Error("Batch : Cannot find i1 in argList");
}
function extractTimestampFromBuffer(buffer, baseTimestamp) {
    if (baseTimestamp) {
        let bi = buffer.getNextBifromHi(1)
        return computeTimestampFromBi(buffer, baseTimestamp, bi)
    }
    return buffer.getNextSample(ST_U32)
}
function computeTimestampFromBi(buffer, baseTimestamp, bi) {
    if (bi > BR_HUFF_MAX_i1_TABLE) return buffer.getNextSample(ST_U32)
    if (bi > 0) return computeTimestampFromPositiveBi(buffer, baseTimestamp, bi)
    return baseTimestamp
}
function computeTimestampFromPositiveBi(buffer, baseTimestamp, bi) {
    return buffer.getNextSample(ST_U32, bi) + baseTimestamp + Math.pow(2, bi) - 1
}
function getMeasure(buffer, sampletype) {
    let v = buffer.getNextSample(sampletype)
    return sampletype === ST_FL ? bytes2Float32(v) : v
}
function bytes2Float32(bytes) {
    let sign = bytes & 0x80000000 ? -1 : 1,
        exponent = ((bytes >> 23) & 0xff) - 127,
        significand = bytes & ~(-1 << 23)
    if (exponent === 128) return sign * (significand ? Number.NaN : Number.POSITIVE_INFINITY)
    if (exponent === -127) {
        if (significand === 0) return sign * 0.0
        exponent = -126
        significand /= 1 << 22
    } else significand = (significand | (1 << 23)) / (1 << 23)
    return sign * significand * Math.pow(2, exponent)
}
function uncompressSamplesData(out, buffer, i1_of_the_first_sample, argList, last_timestamp, flag, tagsz) {
    if (flag.isCommonTimestamp) return handleCommonTimestamp(out, buffer, i1_of_the_first_sample, argList, flag, tagsz)
    return handleSeparateTimestamp(out, buffer, argList, last_timestamp, flag, tagsz)
}
function handleCommonTimestamp(out, buffer, i1_of_the_first_sample, argList, flag, tagsz) {
    let nb_sample_to_parse = buffer.getNextSample(ST_U8, 8)
    let tag = {}
    let temp = initTimestampCommonTable(out, buffer, nb_sample_to_parse, i1_of_the_first_sample)
    let timestampCommon = temp.timestampCommon
    let lastTimestamp = temp.lastTimestamp
    for (let j = 0; j < flag.nb_of_type_measure; j++) {
        let first_null_delta_value = 1
        tag.lbl = buffer.getNextSample(ST_U8, tagsz)
        let samplei1 = findi1FromArgList(argList, tag)
        for (let i = 0; i < nb_sample_to_parse; i++) {
            let available = buffer.getNextSample(ST_U8, 1)
            if (available) {
                let bi = buffer.getNextBifromHi(out.series[samplei1].codingTable)
                let currentMeasure = {
                    data_relative_timestamp: 0,
                    data: {}
                }
                if (bi <= BR_HUFF_MAX_i1_TABLE) {
                    let precedingValue =
                        out.series[samplei1].uncompressSamples[
                        out.series[samplei1].uncompressSamples.length - 1
                            ].data.value
                    if (bi > 0) currentMeasure.data.value = completeCurrentMeasure(buffer, precedingValue, out.series[samplei1].codingType, argList[samplei1].resol, bi)
                    else {
                        if (first_null_delta_value) {
                            first_null_delta_value = 0
                            continue
                        } else currentMeasure.data.value = precedingValue

                    }
                } else {
                    currentMeasure.data.value = buffer.getNextSample(
                        argList[samplei1].sampletype
                    )
                }
                currentMeasure.data_relative_timestamp = timestampCommon[i]
                out.series[samplei1].uncompressSamples.push(currentMeasure)
            }
        }
    }
    return lastTimestamp
}
function initTimestampCommonTable(out, buffer, nbSampleToParse, firstSamplei1) {
    let timestampCommon = []
    let lastTimestamp = 0
    let timestampCoding = buffer.getNextSample(ST_U8, 2)
    for (let i = 0; i < nbSampleToParse; i++) {
        let bi = buffer.getNextBifromHi(timestampCoding)
        if (bi <= BR_HUFF_MAX_i1_TABLE) {
            if (i === 0) timestampCommon.push(out.series[firstSamplei1].uncompressSamples[0].data_relative_timestamp)
            else {
                if (bi > 0) {
                    let precedingTimestamp = timestampCommon[i - 1]
                    timestampCommon.push(
                        buffer.getNextSample(ST_U32, bi) +
                        precedingTimestamp +
                        Math.pow(2, bi) -
                        1
                    )
                } else timestampCommon.push(precedingTimestamp)
            }
        } else timestampCommon.push(buffer.getNextSample(ST_U32))
        lastTimestamp = timestampCommon[i]
    }
    return {
        timestampCommon: timestampCommon,
        lastTimestamp: lastTimestamp
    }
}
function completeCurrentMeasure(buffer, precedingValue, codingType, resol, bi) {
    let currentValue = buffer.getNextSample(ST_U16, bi)
    if (codingType === 0) return computeAdlcValue(currentValue, resol, precedingValue, bi)
    if (codingType === 1) return (currentValue + Math.pow(2, bi) - 1) * resol + precedingValue
    return precedingValue - (currentValue + (Math.pow(2, bi) - 1)) * resol
}
function computeAdlcValue(currentValue, resol, precedingValue, bi) {
    if (currentValue >= Math.pow(2, bi - 1)) return currentValue * resol + precedingValue
    return (currentValue + 1 - Math.pow(2, bi)) * resol + precedingValue
}
function handleSeparateTimestamp(out, buffer, argList, last_timestamp, flag, tagsz) {
    let tag = {}
    for (let i = 0; i < flag.nb_of_type_measure; i++) {
        tag.lbl = buffer.getNextSample(ST_U8, tagsz)
        let samplei1 = findi1FromArgList(argList, tag)
        let compressSampleNb = buffer.getNextSample(ST_U8, 8)
        if (compressSampleNb) {
            let timestampCoding = buffer.getNextSample(ST_U8, 2)
            for (let j = 0; j < compressSampleNb; j++) {
                let precedingRelativeTimestamp =
                    out.series[samplei1].uncompressSamples[
                    out.series[samplei1].uncompressSamples.length - 1
                        ].data_relative_timestamp
                let currentMeasure = {
                    data_relative_timestamp: 0,
                    data: {}
                }
                let bi = buffer.getNextBifromHi(timestampCoding)
                currentMeasure.data_relative_timestamp = computeTimestampFromBi(buffer, precedingRelativeTimestamp, bi)
                if (currentMeasure.data_relative_timestamp > last_timestamp) last_timestamp = currentMeasure.data_relative_timestamp

                bi = buffer.getNextBifromHi(out.series[samplei1].codingTable)
                if (bi <= BR_HUFF_MAX_i1_TABLE) {
                    let precedingValue =
                        out.series[samplei1].uncompressSamples[
                        out.series[samplei1].uncompressSamples.length - 1
                            ].data.value
                    if (bi > 0) currentMeasure.data.value = completeCurrentMeasure(buffer, precedingValue, out.series[samplei1].codingType, argList[samplei1].resol, bi)
                    else currentMeasure.data.value = precedingValue
                } else currentMeasure.data.value = buffer.getNextSample(argList[samplei1].sampletype)
                out.series[samplei1].uncompressSamples.push(currentMeasure)
            }
        }
    }
    return last_timestamp
}
function adaptToExpectedFormat(out, argList, batchAbsoluteTimestamp) {
    let returnedGlobalObject = {
        batch_counter: out.batch_counter,
        batch_relative_timestamp: out.batch_relative_timestamp
    }
    if (batchAbsoluteTimestamp) returnedGlobalObject.batch_absolute_timestamp = batchAbsoluteTimestamp
    returnedGlobalObject.dataset = out.series.reduce(function(
            acc,
            current,
            i1
        ) {
            return acc.concat(
                current.uncompressSamples.map(function(item) {
                    let returned = {
                        data_relative_timestamp: item.data_relative_timestamp,
                        data: {
                            value: argList[i1].divide
                                ? item.data.value / argList[i1].divide
                                : item.data.value,
                            label: argList[i1].taglbl
                        }
                    }
                    if (argList[i1].lblname) returned.data.label_name = argList[i1].lblname
                    if (batchAbsoluteTimestamp) {
                        returned.data_absolute_timestamp = computeDataAbsoluteTimestamp(
                            batchAbsoluteTimestamp,
                            out.batch_relative_timestamp,
                            item.data_relative_timestamp
                        )
                    }
                    return returned
                })
            )
        },
        [])
    return returnedGlobalObject
}
function computeDataAbsoluteTimestamp(bat, brt, drt) {
    return new Date(new Date(bat) - (brt - drt) * 1000).toISOString()
}
function normalisation_batch(input){
    let date = input.date;
    let decoded = brUncompress(input.batch1, input.batch2, input.payload, date)
    console.log(decoded)
    let dataListe = []
    for (let i = 0; i < decoded.dataset.length; i++) {
        let data = decoded.dataset[i]
        let dataObject = {
            "variable": data.data.label_name,
            "value": data.data.value,
            "date": data.data_absolute_timestamp
        }
        dataListe.push(dataObject)
    }
    return dataListe
}
module.exports = {
    normalisation_batch
}
