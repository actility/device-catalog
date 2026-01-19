
const SENSOR_SCALES = {
        'e_act_counter': [0, 0.000575, 0.00345, .00805, 0.023, 0.046, 0.115, 0.0115],
        'e_react-_counter': [0, 0.000575, 0.00345, 0.00805, 0.023, 0.046, 0.115, 0.0115],
        'e_react+_counter': [0, 0.000575, 0.00345, 0.00805, 0.023, 0.046, 0.115, 0.0115],
};

const FRAME_CHANNEL_ORDER = {
    0: [1, 3, 2, 1, 3, 2], // Even frames
    1: [2, 1, 3, 2, 1, 3] // Odd frames
};

const FRAME_CONNECTOR_OFFSET = {
    0: [0, 0, 1, 2, 2, 3, 4, 4, 5], // Even frames
    1: [0, 1, 1, 2, 3, 3, 4, 5, 5] // Odd frames
};


function parse_header_byte(header_byte, parsed) {
    parsed.header.type = 3;
    parsed.header.desc = 'Expert frame';
    const version = (header_byte >> 4) - 8;
    if (version != 1) {
        throw new Error('Unknown advanced frame version');
    }
    parsed.header.version = 2; // version de sortie du parser
    parsed.internal.has_map = (header_byte >> 3) & 0x01;
    const frame_number = header_byte & 0x07;
    parsed.header.cycle = frame_number;
    return frame_number;
}


function parse_map_byte(map_byte, parsed) {
    let map_str = '';
    let conn_map = [];
    for (let i=0; i < 6; i++) {
        if (map_byte & 0x01) {
            map_str += '0,';
        } else {
            conn_map.push(i+1);
            map_str += '1,';
        }
        map_byte = map_byte >> 1;
    }
    parsed.internal.map = map_str.slice(0, -1);
    return conn_map;
}


function parse_conn_byte(conn_byte) {
    const sensor = (conn_byte >> 3) & 0x0f;
    return {
        'sensor': sensor,
        'phase': (conn_byte >> 1) & 0x03,
        'mode': conn_byte & 0x01,
    };
}


function parse_3phase(data_view, connector, parsed) {
    const conn_byte = parse_conn_byte(data_view.getUint8(0));
    const channel_data = {
        'sensor': conn_byte.sensor,
        'connector': connector,
        'channel': 0,
        'channel_mode': 8,
        'raw_values': {},
        'values': {}
    };
    channel_data.raw_values['e_act_counter'] = data_view.getUint16(1)*256 + data_view.getUint8(3);
    switch (parsed.internal.frame_decode_type) {
        case 0:
        case 3:
            channel_data.raw_values['e_react+_counter'] = data_view.getUint16(4)*256+data_view.getUint8(6);
            break;
        case 1:
        case 4:
            channel_data.raw_values['e_react-_counter'] = data_view.getUint16(4)*256+data_view.getUint8(6);
            break;
        }
    return channel_data;
}


function parse_1phase(data_view, connector, channel, parsed) {
    const conn_byte = parse_conn_byte(data_view.getUint8(0));
    const channel_data = {
        'sensor': conn_byte.sensor,
        'connector': connector,
        'channel': channel,
        'channel_mode': 7,
        'raw_values': {},
        'values': {}
    };
    if (conn_byte.phase > 0) {
        channel_data['phase'] = conn_byte.phase;
        channel_data.raw_values['e_act_counter'] = data_view.getUint16(1)*256+data_view.getUint8(3);
        switch (parsed.internal.frame_decode_type) {
            case 0:
            case 1:
            case 6:
            case 9:
                channel_data.raw_values['e_react+_counter'] = data_view.getUint16(4)*256+data_view.getUint8(6);
                break;
            case 2:
            case 3:
            case 7:
            case 10:
                channel_data.raw_values['e_react-_counter'] = data_view.getUint16(4)*256+data_view.getUint8(6);
                break;
        }
    } else {
        // Disabled channel on mono connector
        channel_data['channel_mode'] = 0;
    }
    return channel_data;
}


function scale_values(channel_data) {
    const sensor = channel_data.sensor;
    for (let key in channel_data.raw_values) {
        let value = channel_data.raw_values[key];
        channel_data.values[key] = value*SENSOR_SCALES[key][sensor];
    }
}


function pe6_adv_parser(data_view) {
    if (data_view.byteLength < 4) return { 'error': 'Payload too short' };

    const parsed = { 'header': {}, 'channel_data': [], 'internal': {}, };
    let offset = 0;

    // HEADER_BYTE
    parsed.internal.frame_decode_type = parse_header_byte(data_view.getUint8(offset++), parsed);
    const conn_length = ((parsed.internal.frame_decode_type > 5) ? 7 : 8);

    // MAP_BYTE
    if (parsed.internal.has_map) {
        parsed.internal.conn_map = parse_map_byte(data_view.getUint8(offset++), parsed);
    } else {
        parsed.internal.conn_map = [1, 2, 3, 4, 5, 6];
    }
    offset += 2;

    // for pwa, payload length depend on number of tri / mono connectors
    const chann_count = (data_view.byteLength-offset)/conn_length;
    if ((data_view.byteLength-offset)%conn_length !== 0)  {
        throw new Error('Unexpected payload length');
    }
    let first_mono_pos = -1;
    for (let i=0; i < chann_count; i++) {
        let channel_data;
        const conn_info = new DataView(data_view.buffer, offset, conn_length);
        if ((data_view.getUint8(offset) & 0x01) === 0) {
            // Three-phase modes
            const connector = parsed.internal.conn_map[i];
            channel_data = parse_3phase(conn_info, connector, parsed);
        } else {
            // Mono or equivalent modes
            if (first_mono_pos == -1) first_mono_pos = i;
            const connector = parsed.internal.conn_map[FRAME_CONNECTOR_OFFSET[parsed.internal.frame_decode_type % 2][i-first_mono_pos]+first_mono_pos];
            const channel = FRAME_CHANNEL_ORDER[parsed.internal.frame_decode_type % 2][i-first_mono_pos];
            channel_data = parse_1phase(conn_info, connector, channel, parsed);
        }
        scale_values(channel_data);
        parsed.channel_data.push(channel_data);
        offset += conn_length;
    }

    return parsed;
}


function pe6_std_parser(data_view) {
    var parsed_payload = { 'header': {}, 'channel_data': [] };
    let type = '';
    let raw_header = data_view.getUint8(0);
    parsed_payload.header.version = 2;

    if (raw_header == 1) {
        parsed_payload.header.type = 1;
        parsed_payload.header.desc = 'Active energy frame';
        type = 'e_act_index';
    } else if (raw_header == 2) {
        parsed_payload.header.type = 2;
        parsed_payload.header.desc = 'Reactive energy frame';
        type = 'e_react_index';
    } else {
        throw new Error('Unknown standard frame version');
    }

    if ((data_view.byteLength-1)%5 !== 0) {
        throw new Error('Unexpected payload length');
    }
    let channel_id = 0;
    for (let i=0; i < (data_view.byteLength-1)/5; i++) {
        channel_id = data_view.getUint8(1+i*5);
        let values = {};
        values[type] = data_view.getFloat32(2+i*5, true);
        parsed_payload.channel_data.push({
            'channel_mode': channel_id & 0x07,
            'channel': (channel_id >> 3) & 0x03,
            'connector': channel_id >> 5,
            'values': values
        });
    }
    return parsed_payload;
}


function decodeUplink(input) {
    let result = {
        data: {},
        errors: [],
        warnings: []
    };
    let length = input.bytes.length;

    try {
        if (length < 2) {
            throw new Error('Payload too short');
        }

        const buffer = new ArrayBuffer(length);
        const data_view = new DataView(buffer);
        for (let i = 0; i < length; i++) {
            data_view.setUint8(i, input.bytes[i]);
        }

        if (data_view.getUint8(0) >= 128) {
            const parsed = pe6_adv_parser(data_view);
            delete parsed['internal'];
            result.data = parsed;
        } else {
            result.data = pe6_std_parser(data_view);
        }
    }
    catch (error) {
        result.errors.push(error.message);
        delete result.data;
    }

    return result;
}

function helper_decodeUplink_hex(input) {
    let bytes = [];
    for (let i=0; i < input.length/2; i++)
    {
        bytes.push(parseInt(input.substr(i*2,2), 16));
    }
    return decodeUplink({"bytes": bytes, "fPort": 1})
}

function helper_decodeUplink_base64(input) {
    let binstring = atob(input);
    let bytes = [];
    for (let i=0; i < binstring.length; i++)
    {
        bytes.push(binstring[i].codePointAt(0));
    }
    return decodeUplink({"bytes": bytes, "fPort": 1})
}

exports.decodeUplink = decodeUplink;
