const {decodeUplink, encodeDownlink, decodeDownlink} = require('./dist')
const fs = require('fs')

const examples = JSON.parse(fs.readFileSync('./examples.json', 'utf8'))

examples.forEach((example) => {
  it(`${example.type}: ${example.description}`, () => {

    switch (example.type) {
      case 'uplink': {
        const bytes = Array.from(Buffer.from(example.input.bytes, 'hex'))
        const fPort = example.input.fPort
        const output = decodeUplink({bytes, fPort})

        expect(output).toEqual(example.output)
        break
      }
      case 'downlink-decode': {
        const bytes = Array.from(Buffer.from(example.input.bytes, 'hex'))
        const fPort = example.input.fPort
        const output = decodeDownlink({bytes, fPort})

        expect(output).toEqual(example.output)
        break
      }
      case 'downlink-encode': {
        const output = encodeDownlink(example.input)

        output.bytes = Buffer.from(output.bytes).toString('hex').toUpperCase()

        expect(output).toEqual(example.output)
        break
      }
    }

  })
})
