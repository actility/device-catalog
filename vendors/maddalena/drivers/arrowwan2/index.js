// Example script to decode ArrowWan2 LoRaWAN payload
// 2022 - Maddalena S.p.A.
// This script is to be used only as an example
// Redistribution is not allowed
//
// v 1.0 - 15/06/2022
// - initial version
//

const process = require('process');
const moment = require('moment');
const winston = require('winston');
const { Command } = require('commander');

const vif2str = (vif) => {
    const _vif_table = {
        0x10: 'ml',
        0x11: 'cl',
        0x12: 'dl',
        0x13: 'l',
        0x14: 'dal',
        0x15: 'hl',
        0x16: 'm3',
        0x17: 'dam3',
        0x38: 'ml/h',
        0x39: 'cl/h',
        0x3A: 'dl/h',
        0x3B: 'l/h',
        0x3C: 'dal/h',
        0x3D: 'hl/h',
        0x3E: 'm3/h',
        0x3F: 'dam3/h',
    };
    return _vif_table[vif] || 'Unknown';
};

const timestamp2datetime = (ts) => {
    const EPOCH2000 = moment('2000-01-01T00:00:00Z').unix();
    return moment.unix(EPOCH2000 + ts).toISOString();
};

const fwver2str = (ver) => {
    return `${ver[1]}.${ver[0]}`;
};

const errors2str = (err) => {
    const _error_string = [
        'Mechanical Fraud',
        'Magnetic Fraud',
        'Leakage',
        'Overflow',
        'Backflow',
        'NoConsumption',
        'Reversed Meter',
        'Out Of Operating Temperature',
        '-',
        '-',
        'Low Battery Voltage',
        'Low Battery Charge',
        'Expired Sealing Period',
        'Config Set To Default Value',
        'Metrological Wrong Checksum',
        '-',
    ];
    const b = err.toString(2).padStart(16, '0').split('').reverse();
    return b.map((v, idx) => (v === '1' ? _error_string[idx] : null)).filter(Boolean).join(',');
};

class ReadingPoint {
    constructor(ts, reading, delta) {
        this._ts = ts;
        this._reading = reading;
        this._delta = delta;
    }

    getReading() {
        return [this._ts, this._reading];
    }

    toString() {
        return `datetime=${this._ts}, reading=${this._reading} (delta=${this._delta} 0x${this._delta.toString(16)})`;
    }

    toJSON() {
        return {
            timestamp: this._ts,
            reading: this._reading,
            delta: this._delta,
        };
    }
}

// Utility function to read integers from a buffer
const readInt = (buf, offset, length, signed = false, littleEndian = true) => {
    let value = 0;
    for (let i = 0; i < length; i++) {
        const byte = buf[offset + i];
        value |= byte << (i * 8);
    }
    if (signed) {
        const limit = 1 << (length * 8 - 1);
        if (value >= limit) {
            value -= limit * 2;
        }
    }
    return value;
};

// Utility function to read unsigned integers from a buffer
const readUInt = (buf, offset, length, littleEndian = true) => {
    return readInt(buf, offset, length, false, littleEndian);
};

class InfoData {
    constructor(inf) {
        this._df = inf;
        this._date = timestamp2datetime(inf.timestamp);
    }

    toString() {
        return `Information data: timestamp=${this._date}, meter serial=${this._df.metrological_serial_number}, firmware version=${fwver2str(this._df.firmware_version)}, battery charge=${this._df.battery_charge}, pod=${this._df.pod}`;
    }

    toDict() {
        return {
            type: 'info',
            timestamp: this._date,
            meter_serial: this._df.metrological_serial_number,
            firmware_version: fwver2str(this._df.firmware_version),
            battery_charge: this._df.battery_charge,
            pod: this._df.pod
        };
    }
}

class AlarmData {
    constructor(inf) {
        this._df = inf;
        this._date = timestamp2datetime(inf.timestamp);
    }

    toString() {
        return `Alarm data: timestamp=${this._date}, errors=${errors2str(this._df.error_flags)}, measure vif=${this._df.measure_vif.toString(16)}, current readout=${this._df.current_readout} ${vif2str(this._df.measure_vif)}`;
    }

    toDict() {
        return {
            type: 'alarm',
            timestamp: this._date,
            errors: errors2str(this._df.error_flags),
            measure_vif: this._df.measure_vif,
            current_readout: this._df.current_readout
        };
    }
}

class ReadingData {
    constructor(inf) {
        this._df = inf;
        this._date = timestamp2datetime(inf.timestamp);
    }
}

class DayData extends ReadingData {
    constructor(inf, base_hour) {
        super(inf);
        this._prev_date = moment(this._date).subtract(1, 'day').hours(base_hour).minutes(0).seconds(0).toISOString();
        this._readings = [new ReadingPoint(this._prev_date, this._df.previous_readout_base, 0)];
        for (let i = 0; i < 11; i++) {
            const [prev_ts, prev_rp] = this._readings[this._readings.length - 1].getReading();
            const delta = this._df.delta_values[i];
            this._readings.push(new ReadingPoint(moment(prev_ts).subtract(1, 'hour').toISOString(), prev_rp - delta, delta));
        }
    }

    toString() {
        const unit = vif2str(this._df.measure_vif);
        return `Daily data: timestamp=${this._date}, errors=${errors2str(this._df.error_flags)}, measure vif=${this._df.measure_vif.toString(16)}
Previous day end of the day reading=${this._df.previous_readout_end_of_day} ${vif2str(this._df.measure_vif)}
Previous day base reading=${this._df.previous_readout_base} ${vif2str(this._df.measure_vif)}
Readings:\n${this._readings.map(i => `${i.toString()} ${unit}`).join('\n')}`;
    }

    toDict() {
        return {
            type: 'measure',
            timestamp: this._date,
            errors: errors2str(this._df.error_flags),
            measure_vif: this._df.measure_vif,
            readings: this._readings
        };
    }
}

class WeekData extends ReadingData {
    constructor(inf) {
        super(inf);
        this._prev_date = moment(this._date).subtract(1, 'day').startOf('day').toISOString();
        this._readings = [new ReadingPoint(this._prev_date, this._df.previous_readout_base, 0)];
        for (let i = 0; i < 6; i++) {
            const delta = readInt(this._df.delta_values, i * 3, 3, true);
            const [prev_ts, prev_rp] = this._readings[this._readings.length - 1].getReading();
            this._readings.push(new ReadingPoint(moment(prev_ts).subtract(1, 'day').toISOString(), prev_rp - delta, delta));
        }
    }

    toString() {
        const unit = vif2str(this._df.measure_vif);
        return `Alarm data: timestamp=${this._date}, errors=${errors2str(this._df.error_flags)}, measure vif=${this._df.measure_vif.toString(16)}
Previous day base reading=${this._df.previous_readout_base} ${vif2str(this._df.measure_vif)}
Readings:\n${this._readings.map(i => `${i.toString()} ${unit}`).join('\n')}`;
    }

    toDict() {
        return {
            type: 'measure',
            timestamp: this._date,
            errors: errors2str(this._df.error_flags),
            measure_vif: this._df.measure_vif,
            readings: this._readings
        };
    }
}

class ArrowWan2Decoder {
    constructor(logger) {
        this._logger = logger || winston.createLogger({
            level: 'info',
            format: winston.format.simple(),
            transports: [new winston.transports.Console()]
        });

        this._handlers_dict = {
            1: this.decodeEarlyDayMeasuresFrame,
            2: this.decodeLateDayMeasuresFrame,
            5: this.decodeWeekMeasuresFrame,
            8: this.decodeInfoFrame,
            9: this.decodeAlarmFrame
        };
    }

    decode(fport, frame) {
        if (!this._handlers_dict[fport]) {
            throw new Error(`Missing decoder for frame on port ${fport}`);
        }
        const handler = this._handlers_dict[fport].bind(this);
        return handler(frame);
    }

    decodeEarlyDayMeasuresFrame(frame) {
        const dm = DayMeasureFrame(frame);
        return new DayData(dm, 11);
    }

    decodeLateDayMeasuresFrame(frame) {
        const dm = DayMeasureFrame(frame);
        return new DayData(dm, 23);
    }

    decodeWeekMeasuresFrame(frame) {
        const dm = WeekMeasureFrame(frame);
        return new WeekData(dm);
    }

    decodeInfoFrame(frame) {
        const info = InfoFrame(frame);
        return new InfoData(info);
    }

    decodeAlarmFrame(frame) {
        const alarm = AlarmFrame(frame);
        return new AlarmData(alarm);
    }
}
function decodeUplink(input) {
    const program = new Command();

    program
        .option('-f, --frame <string>', 'HEX encoded LoRa payload')
        .option('-p, --fport <number>', 'Payload FPort (in dec)')
        .option('-o, --output-file <string>', 'Data output file (if not provided defaults to stdout')
        .option('-j, --json', 'Output format is JSON')
        .option('-v, --verbose', 'Be verbose');

    program.parse(process.argv);
    const options = program.opts();

    const logger = winston.createLogger({
        level: options.verbose ? 'debug' : 'info',
        format: winston.format.simple(),
        transports: [new winston.transports.Console()]
    });

    if (!input.bytes) {
        logger.error('Missing frame');
        process.exit(1);
    }
    if (!input.fport) {
        logger.error('Missing fport');
        process.exit(1);
    }

    const fport = input.fport;
    const frame = input.bytes.replace(/[^0-9a-f]/gi, '').toLowerCase();

    const payload = Buffer.from(frame, 'hex');
    try {
        const decoder = new ArrowWan2Decoder(logger);
        let result = decoder.decode(fport, payload);
        if (options.json) {
            result = JSON.stringify(result.toDict(), null, 4);
        } else {
            result = result.toString();
        }
        if (options.outputFile) {
            require('fs').writeFileSync(options.outputFile, result);
        } else {
            console.log(result);
        }
    } catch (e) {
        logger.error(`Frame ${frame} on port ${fport} could not be decoded (${e.message}): ${e.stack}`);
        process.exit(1);
    }
}


function DayMeasureFrame(buf) {
    return {
        timestamp: readUInt(buf, 0, 4),
        error_flags: readUInt(buf, 4, 2),
        measure_vif: readUInt(buf, 6, 1),
        previous_readout_end_of_day: readInt(buf, 7, 4, true),
        previous_readout_base: readInt(buf, 11, 4, true),
        delta_values: Array.from({ length: 11 }, (_, i) => readInt(buf, 15 + i * 2, 2, true))
    };
}

function WeekMeasureFrame(buf) {
    return {
        timestamp: readUInt(buf, 0, 4),
        error_flags: readUInt(buf, 4, 2),
        measure_vif: readUInt(buf, 6, 1),
        previous_readout_base: readInt(buf, 7, 4, true),
        delta_values: Array.from({ length: 18 }, (_, i) => buf[11 + i])
    };
}

function InfoFrame(buf) {
    return {
        timestamp: readUInt(buf, 0, 4),
        metrological_serial_number: buf.slice(4, 24).toString('ascii').replace(/\0/g, ''),
        firmware_version: Array.from(buf.slice(24, 28)),
        battery_charge: buf[28],
        pod: buf.slice(29, 49).toString('ascii').replace(/\0/g, '')
    };
}

function AlarmFrame(buf) {
    return {
        timestamp: readUInt(buf, 0, 4),
        error_flags: readUInt(buf, 4, 2),
        measure_vif: readUInt(buf, 6, 1),
        current_readout: readInt(buf, 7, 4, true)
    };
}