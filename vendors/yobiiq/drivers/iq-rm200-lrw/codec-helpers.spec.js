const path = require("path");
const fs = require("fs-extra");

const codec = require('./index');


describe("Codec Helpers", () => {
    test("toEvenHEX", () => {
      expect(codec.toEvenHEX("E")).toBe("0E");
    });
    test("getValueFromBytesBigEndianFormat", () => {
      expect(codec.getValueFromBytesBigEndianFormat([0,0,0,0], 0, 4)).toBe(0);
    });
    test("getValueFromBytesLittleEndianFormat", () => {
      expect(codec.getValueFromBytesLittleEndianFormat([0,0,0,0], 0, 4)).toBe(0);
    });
    test("getDigitStringArrayNoFormat", () => {
      expect(codec.getDigitStringArrayNoFormat([0,0,0,0], 0, 4)).toStrictEqual(["0", "0", "0", "0"]);
    });
    test("getDigitStringArrayEvenFormat", () => {
      expect(codec.getDigitStringArrayEvenFormat([0,0,0,0], 0, 4)).toStrictEqual(["00", "00", "00", "00"]);
    });
    test("getDigitStringArrayNoFormat", () => {
      expect(codec.getStringFromBytesBigEndianFormat([48,48,48,49], 0, 4)).toStrictEqual("0001");
    });
    test("getDigitStringArrayEvenFormat", () => {
      expect(codec.getStringFromBytesLittleEndianFormat([48,48,48,49], 0, 4)).toStrictEqual("1000");
    });
    test("getSizeBasedOnChannel", () => {
      expect(codec.getSizeBasedOnChannel([255, 0, 4, 255, 2, 5], 2, 255)).toBe(1);
    });
    test("getSignedIntegerFromInteger", () => {
      expect(codec.getSignedIntegerFromInteger(255, 1)).toBe(-1);
    });
    test("getSignedIntegerFromInteger", () => {
      expect(codec.getSignedIntegerFromInteger(0, 1)).toBe(0);
    });
});

