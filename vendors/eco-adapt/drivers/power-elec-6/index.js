const CHANNEL_MODES = {
    1: 'Mono-phase',
    2: 'Three-phase with neutral',
    3: 'Balanced three-phase with neutral',
    4: 'Three-phase without neutral',
    5: 'Balanced three-phase without neutral',
}

function decodeUplink(input) {

    let result = {
        data: {},
        errors: [],
        warnings: []
    };
    let payload = input.bytes

    if(Array.isArray(input.bytes)) {
        payload = input.bytes.toString()
    }

    const buffer = new ArrayBuffer(payload.length / 2)
    const data_view = new DataView(buffer)

    const parsed_payload = {'header': {}, 'channel_data': []};
    for (let i = 0; i < payload.length / 2; i++) {
        data_view.setUint8(i, parseInt(payload.substring(i * 2, 2), 16));
    }

    parsed_payload.header.raw = data_view.getInt8(0)

    if (parsed_payload.header.raw == 1) {
        parsed_payload.header.desc = 'Active energy index'
        parsed_payload.header.unit = 'kWh';
    } else if (parsed_payload.header.raw == 2) {
        parsed_payload.header.desc = 'Reactive energy index'
        parsed_payload.header.unit = 'kvarh';
    }

    let channel_id = 0

    for (let i = 0; i < (buffer.byteLength - 1) / 5; i++) {
        channel_id = data_view.getUint8(1 + i * 5)
        parsed_payload.channel_data.push({
            'channel_id': channel_id,
            'channel_mode': CHANNEL_MODES[channel_id & 0x07],
            'channel': (channel_id >> 3) & 0x03,
            'connector': channel_id >> 5,
            'value': data_view.getFloat32(2 + i * 5, true)
        })

    }
    result.data = format_parsed_pe6(parsed_payload)
    return result
}

function format_parsed_pe6(parsed_payload) {
    let lines = []

    parsed_payload.channel_data.forEach(function (channel_data) {
        lines.push(['connector/channel : ',
            channel_data.connector, '/',
            channel_data.channel, ' (',
            channel_data.channel_mode, ') ',
            parsed_payload.header.desc, ' = ',
            channel_data.value.toFixed(3), ' ',
            parsed_payload.header.unit].join(''))
    })
    return lines
}

exports.decodeUplink = decodeUplink