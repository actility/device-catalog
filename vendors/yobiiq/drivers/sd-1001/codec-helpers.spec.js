const path = require("path");
const fs = require("fs-extra");

const codec = require('./index');


describe("Codec Helpers", () => {
    test("isBasicInformation", () => {
        expect(codec.isBasicInformation([255, 9, 1, 0, 255, 10, 1, 0], 50)).toBe(true);
    });
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
});

