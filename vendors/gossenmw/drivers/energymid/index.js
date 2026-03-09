// Type IDs for easier processing
const TYPE_TIMESTAMP = 0x24; // Timestamp
const TYPE_ENERGY_IN = 0x25; // Import Active Energy
const TYPE_ENERGY_OUT = 0x26; // Export Active Energy
const TYPE_ERROR_STATUS = 0x54; // Error Status

function decodeUplink(input) {
    var data = {};
    var bytes = input.bytes;
    const port = input.fPort;

    // Check data port number (fixed to 2 for now)
    if(port !== 2)
    {
        return { errors: ["Not a data port"] };
    }

    // Check minimum payload length
    if (bytes.length < 26) {
        return { errors: ["Invalid payload"] };
    }

    var index = 0;
    while (index < bytes.length) {
        var type = bytes[index];

        // Skip entry if not enough bytes are available
        if (type === TYPE_TIMESTAMP && index + 7 >= bytes.length) break;
        if ((type === TYPE_ENERGY_IN || type === TYPE_ENERGY_OUT) && index + 8 >= bytes.length) break;
        if (type === TYPE_ERROR_STATUS && index + 1 >= bytes.length) break;

        switch (type) {
            case TYPE_TIMESTAMP:
                data.timestamp = decodeTimestamp(bytes.slice(index + 1, index + 8));
                index += 8;
                break;
            case TYPE_ENERGY_IN:
            case TYPE_ENERGY_OUT:
                var energy = decodeEnergy(bytes.slice(index + 1, index + 9));
                if (type === TYPE_ENERGY_IN) {
                    data.import_active_energy = energy;
                } else {
                    data.export_active_energy = energy;
                }
                index += 9;
                break;
            case TYPE_ERROR_STATUS:
                data.error_status = decodeErrorStatus(bytes[index + 1]);
                index += 2;
                break;
            default:
                index++; // Ignore unknown types
        }
    }

    return { data: data };
}

// 🕒 Decode timestamp
function decodeTimestamp(bytes) {
    var second = bytes[0];
    var minute = bytes[1];
    var hour = bytes[2];
    var day = bytes[3];
    var month = bytes[4];
    var year = bytes[5] + (bytes[6] << 8);

    return {
        second: second,
        minute: minute,
        hour: hour,
        day: day,
        month: month,
        year: year,
        timestamp_iso: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`
    };
}

// ⚡ Decode energy values (IEEE 754 Double)
function decodeEnergy(bytes) {
    var dv = new DataView(new Uint8Array(bytes).buffer);
    return parseFloat((dv.getFloat64(0, true) / 1000).toFixed(3)); // Convert Wh → kWh
}

// 🚨 Decode error status
function decodeErrorStatus(byte) {
    return {
        phase_voltage_too_low: (byte & 0x01) !== 0,
        phase_voltage_too_high: (byte & 0x02) !== 0,
        phase_current_exceeded: (byte & 0x04) !== 0,
        frequency_synchronization_error: (byte & 0x08) !== 0,
        reset_performed: (byte & 0x10) !== 0,
        internal_communication_problem: (byte & 0x60) !== 0,
        dc_offset_too_high: (byte & 0x80) !== 0
    };
}
