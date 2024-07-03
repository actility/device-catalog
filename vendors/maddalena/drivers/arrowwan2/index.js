function vif2str(vif) {
    const vifTable = {
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
    return vifTable[vif] || 'Unknown';
}

function timestamp2datetime(ts) {
    const EPOCH2000 = new Date(Date.UTC(2000, 0, 1, 0, 0, 0));
    const date = new Date(EPOCH2000.getTime() + ts * 1000);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().split('.')[0];
}

function fwver2str(ver) {
    return `${ver[1]}.${ver[0]}`;
}

function errors2str(err) {
    const errorString = [
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
    const b = err.toString(2).padStart(16, '0').split('').reverse().join('');
    return b.split('').map((v, idx) => (v === '1' ? errorString[idx] : null)).filter(Boolean).join(',');
}

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
        return `datetime=${this._ts.toISOString()}, reading=${this._reading} (delta=${this._delta} 0x${this._delta.toString(16).toUpperCase()})`;
    }

    toJSON() {
        return {
            timestamp: this._ts.toISOString(),
            reading: this._reading,
            delta: this._delta,
        };
    }
}

class ArrowWan2Decoder {
    constructor() {
        this.handlers = {
            1: this.decodeEarlyDayMeasuresFrame,
            2: this.decodeLateDayMeasuresFrame,
            5: this.decodeWeekMeasuresFrame,
            8: this.decodeInfoFrame,
            9: this.decodeAlarmFrame,
        };
    }

    decode(fport, frame) {
        if (!this.handlers[fport]) {
            throw new Error(`Missing decoder for frame on port ${fport}`);
        }
        return this.handlers[fport].call(this, frame);
    }

    decodeEarlyDayMeasuresFrame(frame) {
        const dm = this.parseDayMeasureFrame(frame);
        return new DayData(dm, 11);
    }

    decodeLateDayMeasuresFrame(frame) {
        const dm = this.parseDayMeasureFrame(frame);
        return new DayData(dm, 23);
    }

    decodeWeekMeasuresFrame(frame) {
        const dm = this.parseWeekMeasureFrame(frame);
        return new WeekData(dm);
    }

    decodeInfoFrame(frame) {
        const info = this.parseInfoFrame(frame);
        return new InfoData(info);
    }

    decodeAlarmFrame(frame) {
        const alarm = this.parseAlarmFrame(frame);
        return new AlarmData(alarm);
    }

    parseDayMeasureFrame(buf) {
        const timestamp = buf.readUInt32LE(0);
        const error_flags = buf.readUInt16LE(4);
        const measure_vif = buf.readUInt8(6);
        const previous_readout_end_of_day = buf.readInt32LE(7);
        const previous_readout_base = buf.readInt32LE(11);
        const delta_values = [];
        for (let i = 0; i < 11; i++) {
            delta_values.push(buf.readInt16LE(15 + i * 2));
        }
        return { timestamp, error_flags, measure_vif, previous_readout_end_of_day, previous_readout_base, delta_values };
    }

    parseWeekMeasureFrame(buf) {
        const timestamp = buf.readUInt32LE(0);
        const error_flags = buf.readUInt16LE(4);
        const measure_vif = buf.readUInt8(6);
        const previous_readout_base = buf.readInt32LE(7);
        const delta_values = [];
        for (let i = 0; i < 6; i++) {
            const delta = buf.readIntLE(11 + i * 3, 3);
            delta_values.push(delta);
        }
        return { timestamp, error_flags, measure_vif, previous_readout_base, delta_values };
    }

    parseInfoFrame(buf) {
        const timestamp = buf.readUInt32LE(0);
        const metrological_serial_number = buf.slice(4, 24).toString('ascii').trim();
        const firmware_version = [buf.readUInt8(24), buf.readUInt8(25)];
        const battery_charge = buf.readUInt8(26);
        const pod = buf.slice(27, 47).toString('ascii').trim();
        return { timestamp, metrological_serial_number, firmware_version, battery_charge, pod };
    }

    parseAlarmFrame(buf) {
        const timestamp = buf.readUInt32LE(0);
        const error_flags = buf.readUInt16LE(4);
        const measure_vif = buf.readUInt8(6);
        const current_readout = buf.readInt32LE(7);
        return { timestamp, error_flags, measure_vif, current_readout };
    }
}

class ReadingData {
    constructor(inf) {
        this._df = inf;
        this._date = new Date(timestamp2datetime(inf.timestamp));
    }
}

class DayData extends ReadingData {
    constructor(inf, base_hour) {
        super(inf);
        this._date = new Date(this._date);
        this._prev_date = new Date(this._date.getFullYear(), this._date.getMonth(), this._date.getDate(), base_hour, 0, 0);
        this._prev_date.setDate(this._prev_date.getDate() - 1);
        this._readings = [new ReadingPoint(this._prev_date, this._df.previous_readout_base, 0)];
        for (let i = 0; i < 11; i++) {
            const [prev_ts, prev_rp] = this._readings[this._readings.length - 1].getReading();
            const new_ts = new Date(prev_ts);
            new_ts.setHours(new_ts.getHours() - 1);
            this._readings.push(new ReadingPoint(new_ts, prev_rp - this._df.delta_values[i], this._df.delta_values[i]));
        }
    }

    toString() {
        const unit = vif2str(this._df.measure_vif);
        return `Daily data: timestamp=${this._date.toISOString()}, errors=${errors2str(this._df.error_flags)}, measure vif=${this._df.measure_vif}
Previous day end of the day reading=${this._df.previous_readout_end_of_day} ${unit}
Previous day base reading=${this._df.previous_readout_base} ${unit}
Readings:\n${this._readings.map(r => `${r.toString()} ${unit}`).join('\n')}`;
    }

    toJSON() {
        return {
            type: 'measure',
            timestamp: timestamp2datetime(this._df.timestamp),
            errors: errors2str(this._df.error_flags),
            measure_vif: this._df.measure_vif,
            readings: this._readings.map(r => r.toJSON()),
        };
    }
}

class WeekData extends ReadingData {
    constructor(inf) {
        super(inf);
        this._date = new Date(this._date);
        this._prev_date = new Date(this._date.getFullYear(), this._date.getMonth(), this._date.getDate());
        this._prev_date.setDate(this._prev_date.getDate() - 1);
        this._readings = [new ReadingPoint(this._prev_date, this._df.previous_readout_base, 0)];
        for (let i = 0; i < 6; i++) {
            const delta = this._df.delta_values[i];
            const [prev_ts, prev_rp] = this._readings[this._readings.length - 1].getReading();
            const new_ts = new Date(prev_ts);
            new_ts.setDate(new_ts.getDate() - 1);
            this._readings.push(new ReadingPoint(new_ts, prev_rp - delta, delta));
        }
    }

    toString() {
        const unit = vif2str(this._df.measure_vif);
        return `Weekly data: timestamp=${this._date.toISOString()}, errors=${errors2str(this._df.error_flags)}, measure vif=${this._df.measure_vif}
Previous week base reading=${this._df.previous_readout_base} ${unit}
Readings:\n${this._readings.map(r => `${r.toString()} ${unit}`).join('\n')}`;
    }

    toJSON() {
        return {
            type: 'measure',
            timestamp: timestamp2datetime(this._df.timestamp),
            errors: errors2str(this._df.error_flags),
            measure_vif: this._df.measure_vif,
            readings: this._readings.map(r => r.toJSON()),
        };
    }
}

class InfoData extends ReadingData {
    toString() {
        return `Info frame: timestamp=${timestamp2datetime(this._df.timestamp)}, meter_serial=${this._df.metrological_serial_number}, firmware_version=${fwver2str(this._df.firmware_version)}, battery_charge=${this._df.battery_charge}, pod=${this._df.pod}`;
    }

    toJSON() {
        return {
            type: 'info',
            timestamp: timestamp2datetime(this._df.timestamp), // Use the adjusted timestamp function
            meter_serial: this._df.metrological_serial_number,
            firmware_version: fwver2str(this._df.firmware_version),
            battery_charge: this._df.battery_charge,
            pod: this._df.pod,
        };
    }
}


class AlarmData extends ReadingData {
    toString() {
        return `Alarm frame: timestamp=${this._date.toISOString()}, errors=${errors2str(this._df.error_flags)}, measure vif=${this._df.measure_vif}, current_readout=${this._df.current_readout}`;
    }

    toJSON() {
        return {
            type: 'alarm',
            timestamp: timestamp2datetime(this._df.timestamp),
            errors: errors2str(this._df.error_flags),
            measure_vif: this._df.measure_vif,
            current_readout: this._df.current_readout,
        };
    }
}

function decodeUplink(input) {
    try {
        const decoder = new ArrowWan2Decoder();
        const buf = Buffer.from(input.bytes, 'hex');
        const data = decoder.decode(input.fPort, buf);
        return { data: data.toJSON(), errors: [], warnings: [] };
    } catch (err) {
        return { errors: [err.message] };
    }
}

exports.decodeUplink = decodeUplink;
