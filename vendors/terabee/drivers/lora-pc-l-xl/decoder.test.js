const { expect, test } = require("@jest/globals");
const {
  bytesToBitsString,
  bitsStringToXYpoints,
  isKthBitSet,
  uint32,
  uint16,
  decodeUplink,
  parseHeader,
  registerCommand,
  getCommand,
  parseCounts,
  parseAccessPointState,
  parseCountDirection,
  parseMountingHeight,
  parsePushPeriod
} = require('./decoder');

test('test passes', () => {
  expect(true).toBeTruthy();
})

test('should check if the bit  0 is set', () => {
    byte = parseInt('00000001', 2);
    expect(isKthBitSet(byte, 0)).toBeTruthy();
});
  
test('should check if bit 0 is not set', () => {
  byte = parseInt('00000000', 2);
  expect(isKthBitSet(byte, 0)).toBeFalsy();
});

test('should check if all bits are set', () => {
  bit_0_set = parseInt('00000001', 2);
  bit_1_set = parseInt('00000010', 2);
  bit_2_set = parseInt('00000100', 2);
  bit_3_set = parseInt('00001000', 2);
  bit_4_set = parseInt('00010000', 2);
  bit_5_set = parseInt('00100000', 2);
  bit_6_set = parseInt('01000000', 2);
  bit_7_set = parseInt('10000000', 2);

  expect(isKthBitSet(bit_0_set, 0)).toBeTruthy();
  expect(isKthBitSet(bit_1_set, 1)).toBeTruthy();
  expect(isKthBitSet(bit_2_set, 2)).toBeTruthy();
  expect(isKthBitSet(bit_3_set, 3)).toBeTruthy();
  expect(isKthBitSet(bit_4_set, 4)).toBeTruthy();
  expect(isKthBitSet(bit_5_set, 5)).toBeTruthy();
  expect(isKthBitSet(bit_6_set, 6)).toBeTruthy();
  expect(isKthBitSet(bit_7_set, 7)).toBeTruthy();
});

test('should check if all bits are not set', () => {
  bit_0_set = parseInt('00000000', 2);
  bit_1_set = parseInt('00000000', 2);
  bit_2_set = parseInt('00000000', 2);
  bit_3_set = parseInt('00000000', 2);
  bit_4_set = parseInt('00000000', 2);
  bit_5_set = parseInt('00000000', 2);
  bit_6_set = parseInt('00000000', 2);
  bit_7_set = parseInt('00000000', 2);

  expect(isKthBitSet(bit_0_set, 0)).toBeFalsy();
  expect(isKthBitSet(bit_1_set, 1)).toBeFalsy();
  expect(isKthBitSet(bit_2_set, 2)).toBeFalsy();
  expect(isKthBitSet(bit_3_set, 3)).toBeFalsy();
  expect(isKthBitSet(bit_4_set, 4)).toBeFalsy();
  expect(isKthBitSet(bit_5_set, 5)).toBeFalsy();
  expect(isKthBitSet(bit_6_set, 6)).toBeFalsy();
  expect(isKthBitSet(bit_7_set, 7)).toBeFalsy();
});

describe('uint32', () => {
  it("should convert arbitrary uint32", () => {
    expect(uint32([0, 0, 1, 200])).toBe(456)
  })

  it("should convert max uint32 ", () => {
    expect(uint32([255, 255, 255, 255])).toBe(4294967295)
  })

  it("should convert min uint32 ", () => {
    expect(uint32([0, 0, 0, 0])).toBe(0)
  })

  it("should fail with too many bytes error", () => {
    expect(() => uint32([0, 2, 2, 4 ,5])).toThrow('uint32 must have exactly 4 bytes')
  })
  
  it("should fail with too little bytes error", () => {
    expect(() => uint32([0, 2, 2])).toThrow('uint32 must have exactly 4 bytes')
  })
})

describe('bytesToBitsString', () => {
  it("should convert bytes to string of combined bits", () => {
    expect(bytesToBitsString([1, 2, 255, 30])).toBe("00000001000000101111111100011110")
  })

  it("should convert empty bytes list", () => {
    expect(bytesToBitsString([])).toBe("")
  })

  it("should convert zeros", () => {
    expect(bytesToBitsString([0, 0, 0])).toBe("000000000000000000000000")
  })
})

describe('bitsStringToXYpoints', () => {
  it("should convert bits string to one points", () => {
    expect(bitsStringToXYpoints("0000001000010")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({x: 1, y: 2})
      ])
    )
  })

  it("should convert bits string to multiple points", () => {
    expect(bitsStringToXYpoints("000000100001010100001111000011110011110")).toMatchObject([
        {x: 1, y: 2},
        {x: 80, y: 60},
        {x: 30, y: 30},
    ])
  })

  it("should convert bytes to points", () => {
    const bit_string = bytesToBitsString([
        0,
        14,
        207,
        118,
        127,
        96,
        59
    ])

    expect(bitsStringToXYpoints(bit_string)).toMatchObject([
        {x: 0,  y: 29},
        {x: 79, y: 29},
        {x: 79, y: 59},
        {x: 0,  y: 59}
    ])
  })

  it("should convert empty", () => {
    expect(bitsStringToXYpoints("")).toMatchObject([])
  })
})

describe('uint16', () => {
  it("should convert arbitrary uint16", () => {
    expect(uint16([5, 220])).toBe(1500)
  })

  it("should convert max uint16 ", () => {
    expect(uint16([255, 255])).toBe(65535)
  })

  it("should convert min uint16 ", () => {
    expect(uint16([0, 0])).toBe(0)
  })

  it("should fail with too many bytes error", () => {
    expect(() => uint16([0, 2, 2])).toThrow('uint16 must have exactly 2 bytes')
  })

  it("should fail with too little bytes error", () => {
    expect(() => uint16([1])).toThrow('uint16 must have exactly 2 bytes')
  })
})

describe('parseHeader', () => {
  it("should parse Header with acknowledge", () => {
    expect(parseHeader([255, 1, 0])).toMatchObject({
      cmd_id: 1,
      ack: true,
      type: "acknowledge"
    })
  })
})

describe('registerCommand', () => {
  it("should register command", () => {
    const registered_commands_map = new Map()

    fport = 2
    registerCommand(registered_commands_map, fport, "CMD_CNT_RST", 1)

    expect(registered_commands_map.get("0201")).toMatchObject({
      command_name: "CMD_CNT_RST"
    })

    registerCommand(registered_commands_map, fport, "CMD_CNT_SET", 130)

    expect(registered_commands_map.get("0282")).toMatchObject({
      command_name: "CMD_CNT_SET"
    })
  })

  it("should fail with fport out of bounds", () => {
    const registered_commands_map = new Map()

    fport = 256
    expect(() => registerCommand(
      registered_commands_map, fport, "CMD_ID_FOO", 200
      ).toThrow("fport must be between 1 and 255")
    )
  })

  it("should fail with cmd_id out of bounds", () => {
    const registered_commands_map = new Map()

    fport = 30
    expect(() => registerCommand(fport, "CMD_ID_WRONG", 255
      ).toThrow("cmd_id must be between 0 and 254")
    )
  })

  it("should get handler name and command name", () => {
    const registered_commands_map = new Map()

    fport = 2
    registerCommand(registered_commands_map, fport, "CMD_CNT_RST", 1)

    expect(getCommand(registered_commands_map, 2 , 1)).toMatchObject({
      command_name: "CMD_CNT_RST"
    })
  })

  it("should fail with command not registered", () => {
    const registered_commands_map = new Map()

    expect(() => getCommand(registered_commands_map, 10, 10)).toThrow("command not registered")
  })

  it("should execute the foo command payload parser", () => {
    const registered_commands_map = new Map()

    const fooParser = function(payload) {
      return payload
    }
    fport = 99
    registerCommand(registered_commands_map, fport, "CMD_FOO", 99, parsePayload = fooParser)

    command = getCommand(registered_commands_map, 99, 99)
    expect(command.parsePayload([255, 255])).toStrictEqual([255, 255])
  })
})

describe('decodeUplink', () => {
  it('should return error unknown command', () => {
    const input = {
      fPort: 255,
      bytes: [1, 2, 3, 4, 5]
    }
    expect(decodeUplink(input))
      .toStrictEqual({"errors": ["unknown command"]})
  })

  it('should return correct uplink frame', () => {
    const input = {
      fPort: 1,
      bytes: [0, 0, 0, 200, 0, 0, 1, 200, 0]
    }
    expect(decodeUplink(input))
      .toMatchObject({data: 
        {
          count_in: 200,
          count_out: 456
        }
      })
  })
  
  it('should return TPC_STOPPED flag', () => {
    const input = {
      fPort: 1,
      bytes: [0, 0, 0, 0, 0, 0, 0, 0, 1]
    }
    expect(decodeUplink(input))
      .toMatchObject({data:
        {
          flags: {
            TPC_STOPPED: 1
          }
        }
      }
    )
  })
  
  it('should return WIFI_AP_ENABLED flag', () => {
    const input = {
      fPort: 1,
      bytes: [0, 0, 0, 0, 0, 0, 0, 0, 7]
    }
    expect(decodeUplink(input))
      .toMatchObject({data:
        {
          flags: {
            TPC_STOPPED: 1
          }
        }
      }
    )
  })
  
  it(`should return WIFI_AP_ENABLED, MULIT_DEV_ISSUE, 
    TPC_STUCK, TPC_STOPPED flags`, () => {
    const input = {
      fPort: 1,
      bytes: [0, 0, 0, 0, 0, 0, 0, 0, 15]
    }
    expect(decodeUplink(input))
      .toMatchObject({data:
        {
          flags: {
            TPC_STOPPED: 1,
            TPC_STUCK: 1,
            MULTI_DEV_ISSUE: 1,
            WIFI_AP_ENABLED: 1
          }
        }
      }
    )
  })

  it('should handle CMD_CNT_GET command', () => {
    const registered_commands_map = new Map()

    fport = 2
    // registerCommand(registered_commands_map, fport, "CMD_CNT_GET", 2, parsePayload = parseCounts)


    const input = {
      fPort: fport,
      bytes: [2, 0, 0, 0, 200, 0, 0, 1, 200]
    }

    expect(decodeUplink(input))
    .toMatchObject({data: {
      cmd: {
        name: "CMD_CNT_GET",
        id: 2,
        success: true,
        value: {
          count_in: 200,
          count_out: 456
        }
      }
    }

    })
  })

  it('should handle CMD_GET_AP_STATE command', () => {
    const registered_commands_map = new Map()

    fport = 5
    // registerCommand(registered_commands_map, fport, "CMD_GET_AP_STATE", 1, parsePayload = parseAccessPointState)

    const input = {
      fPort: fport,
      bytes: [1, 0]
    }

    expect(decodeUplink(input))
    .toMatchObject({data: {
      cmd: {
        name: "CMD_GET_AP_STATE",
        id: 1,
        success: true,
        value: {
          state: "disabled"
        }
      }
    }})
  })

  it('should handle CMD_GET_REVERSE command', () => {
    const registered_commands_map = new Map()

    fport = 100
    // registerCommand(registered_commands_map, fport, "CMD_GET_REVERSE", 2, parsePayload = parseCountDirection)

    const input = {
      fPort: fport,
      bytes: [2, 1]
    }

    expect(decodeUplink(input))
    .toMatchObject({data: {
      cmd: {
        name: "CMD_GET_REVERSE",
        id: 2,
        success: true,
        value: {
          direction: "reversed"
        }
      }
    }})
  })

  it('should handle CMD_GET_HEIGHT command', () => {
    const registered_commands_map = new Map()

    fport = 100
    // registerCommand(registered_commands_map, fport, "CMD_GET_HEIGHT", 1, parsePayload = parseMountingHeight)

    const input = {
      fPort: fport,
      bytes: [1, 5, 220]
    }

    expect(decodeUplink(input))
    .toMatchObject({data: {
      cmd: {
        name: "CMD_GET_HEIGHT",
        id: 1,
        success: true,
        value: {
          mounting_height: 1500
        }
      }
    }})
  })

  it('should handle CMD_GET_PUSH_PERIOD command', () => {
    const registered_commands_map = new Map()

    fport = 100
    // registerCommand(registered_commands_map, fport, "CMD_GET_PUSH_PERIOD", 3, parsePayload = parsePushPeriod)

    const input = {
      fPort: fport,
      bytes: [3, 0, 60]
    }

    expect(decodeUplink(input))
    .toMatchObject({data: {
      cmd: {
        name: "CMD_GET_PUSH_PERIOD",
        id: 3,
        success: true,
        value: {
          push_period_min: 60
        }
      }
    }})
  })

  it('should handle CMD_GET_VER command', () => {

    fport = 4

    let input = {
      fPort: fport,
      bytes: [1, 3, 0, 1]
    }

    expect(decodeUplink(input))
    .toMatchObject({data: {
      cmd: {
        name: "CMD_GET_VER_PEOPLE_COUNTING",
        id: 1,
        success: true,
        value: {
          software_version: "3.0.1"
        }
      }
    }})

    input = {
      fPort: fport,
      bytes: [2, 1, 0, 1]
    }

    expect(decodeUplink(input))
    .toMatchObject({data: {
      cmd: {
        name: "CMD_GET_VER_WEB_GUI",
        id: 2,
        success: true,
        value: {
          software_version: "1.0.1"
        }
      }
    }})

    input = {
      fPort: fport,
      bytes: [3, 2, 0, 1]
    }

    expect(decodeUplink(input))
    .toMatchObject({data: {
      cmd: {
        name: "CMD_GET_VER_LORA_AGENT",
        id: 3,
        success: true,
        value: {
          software_version: "2.0.1"
        }
      }
    }})

    input = {
      fPort: fport,
      bytes: [4, 5, 9, 135]
    }

    expect(decodeUplink(input))
    .toMatchObject({data: {
      cmd: {
        name: "CMD_GET_VER_ACCESS_POINT",
        id: 4,
        success: true,
        value: {
          software_version: "5.9.135"
        }
      }
    }})

    input = {
      fPort: fport,
      bytes: [5, 0, 0, 1]
    }

    expect(decodeUplink(input))
    .toMatchObject({data: {
      cmd: {
        name: "CMD_GET_VER_UPDATER_WEB_GUI",
        id: 5,
        success: true,
        value: {
          software_version: "0.0.1"
        }
      }
    }})

    input = {
      fPort: fport,
      bytes: [6, 0, 0, 0]
    }

    expect(decodeUplink(input))
    .toMatchObject({data: {
      cmd: {
        name: "CMD_GET_VER_FAN_SERVICE",
        id: 6,
        success: true,
        value: {
          software_version: "0.0.0"
        }
      }
    }})
  })

  it('should handle CMD_GET_AREA_PTS command', () => {

    fport = 101

    let input = {
      fPort: fport,
      bytes: [2, 0, 0, 0, 0]
    }

    expect(decodeUplink(input))
    .toMatchObject({data: {
      cmd: {
        name: "CMD_GET_AREA_PTS",
        id: undefined,
        success: true,
        value: {
          nb_of_points: 2,
          points: [
            {x: 0, y: 0},
            {x: 0, y: 0}
          ]
        }
      }
    }})
  })

  it('should handle invalid bytes size for CMD_GET_AREA_PTS command', () => {

    fport = 101

    let input = {
      fPort: fport,
      bytes: [10, 0, 0, 0] // WRONG BYTE SIZE 10 =! 3
    }

    expect(decodeUplink(input))
    .toMatchObject({
      errors: ["Couldn't decode area payload: Inconsistent number of points"]
    })
  })

  // TO DO, mock the global object to manipulte internal object.
  // it('should fail parsePayload function not supplied but called', () => {
  //   const registered_commands_map = new Map()

  //   fport = 200
  //   registerCommand(registered_commands_map, fport, "CMD_FOO", 3, parsePayload = undefined)

  //   const input = {
  //     fPort: fport,
  //     bytes: [0, 0, 0]
  //   }

  //   expect(() => decodeUplink(input)).toThrow("parsePayload not supplied")
  // })
})
