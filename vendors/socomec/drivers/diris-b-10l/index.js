
function decimalToBinary(decimal) {
    let binary = "";
    let quotient = decimal;
  
    // Handle special cases of input value
    if (decimal === 0) {
      return "0";
    }
  
    // Convert decimal to binary
    while (quotient > 0) {
      let remainder = quotient % 2;
      binary = remainder.toString() + binary;
      quotient = Math.floor(quotient / 2);
    }
  
    return binary;
}

function decimalToHex(decimal) {
    let hex = "";
    let quotient = decimal;

    // Handle special cases of input value
    if (decimal === 0) {
        return "0";
    }

    // Convert decimal to hexadecimal
    while (quotient > 0) {
        let remainder = quotient % 16;
        if (remainder < 10) {
        hex = remainder.toString() + hex;
        } else {
        hex = String.fromCharCode(remainder + 55) + hex;
        }
        quotient = Math.floor(quotient / 16);
    }

    return hex;
}


function decodeUplink(input){
    var result = {};

    var type = input.slice(0, 2);

    if(type != 2){
        result.errors = ["The first hexadecimal character of the payload must be 2 for an uplink"];
        return result;
    }

    result.profileNbr = input.slice(2, 3);
    result.profileVersion = input.slice(3, 4);

    switch(result.profileNbr){
        case 1:
            result.dateTime = ((input.slice(4, 5)*16 + input.slice(5, 6))*16 + input.slice(6, 7))*16 + input.slice(7, 8);

            result["Ea+"] = ((((((input.slice(8, 9)*16 + input.slice(9, 10))*16 + input.slice(10, 11))*16 + input.slice(11, 12))*16 + input.slice(12, 13))*16 + input.slice(13, 14))*16 + input.slice(14, 15))*16 + input.slice(15, 16);
            result["Ea-"] = ((((((input.slice(16, 17)*16 + input.slice(17, 18))*16 + input.slice(18, 19))*16 + input.slice(19, 20))*16 + input.slice(20, 21))*16 + input.slice(21, 22))*16 + input.slice(22, 23))*16 + input.slice(23, 24);
            result["Er+"] = ((((((input.slice(24, 25)*16 + input.slice(25, 26))*16 + input.slice(26, 27))*16 + input.slice(27, 28))*16 + input.slice(28, 29))*16 + input.slice(29, 30))*16 + input.slice(30, 31))*16 + input.slice(31, 32);
            result["Er-"] = ((((((input.slice(32, 33)*16 + input.slice(33, 34))*16 + input.slice(34, 35))*16 + input.slice(35, 36))*16 + input.slice(36, 37))*16 + input.slice(37, 38))*16 + input.slice(38, 39))*16 + input.slice(39, 40);

            result.pulseMeter = ((((((input.slice(40, 41)*16 + input.slice(41, 42))*16 + input.slice(42, 43))*16 + input.slice(43, 44))*16 + input.slice(44, 45))*16 + input.slice(45, 46))*16 + input.slice(46, 47))*16 + input.slice(47, 48);
            
            var decimalInputs = input.slice(48, 49)*16 + input.slice(49, 50);
            var binaryInputs = decimalToBinary(decimalInputs);

            result.native = {digitalInput1: binaryInputs.substring(0, 1), digitalInput2: binaryInputs.substring(1, 2)};
            result.module1 = {digitalInput1: binaryInputs.substring(2, 3), digitalInput2: binaryInputs.substring(3, 4)};
            result.module2 = {digitalInput1: binaryInputs.substring(4, 5), digitalInput2: binaryInputs.substring(5, 6)};
            result.module3 = {digitalInput1: binaryInputs.substring(6, 7), digitalInput2: binaryInputs.substring(7, 8)};
            result.module4 = {digitalInput1: binaryInputs.substring(8, 9), digitalInput2: binaryInputs.substring(9, 10)};
            result.voltageDetection = { 
                iTR1: binaryInputs.substring(10, 11), 
                iTR2: binaryInputs.substring(11, 12), 
                iTR3: binaryInputs.substring(12, 13), 
                iTR4: binaryInputs.substring(13, 14)  
            };
            
            result.statusChangeCounter = {
                native: {
                    input1: decimalToHex(input.slice(50, 51)).substring(0, 4),
                    input2: decimalToHex(input.slice(50, 51)).substring(4, 8),
                },
                module1: {
                    digitalInput1: decimalToHex(input.slice(51, 52)).substring(0, 4),
                    digitalInput2: decimalToHex(input.slice(51, 52)).substring(4, 8),
                }
            };

            break;
        case 2:
            result.dateTime = ((input.slice(4, 5)*16 + input.slice(5, 6))*16 + input.slice(6, 7))*16 + input.slice(7, 8);

            result.load1 = {
                "Ea+": ((input.slice(8, 9)*16 + input.slice(9, 10))*16 + input.slice(10, 11))*16 + input.slice(11, 12),
                "Er+": ((input.slice(12, 13)*16 + input.slice(13, 14))*16 + input.slice(14, 15))*16 + input.slice(15, 16),
            };
            result.load2 = {
                "Ea+": ((input.slice(16, 17)*16 + input.slice(17, 18))*16 + input.slice(18, 19))*16 + input.slice(19, 20),
                "Er+": ((input.slice(20, 21)*16 + input.slice(21, 22))*16 + input.slice(22, 23))*16 + input.slice(23, 24),
            };
            result.load3 = {
                "Ea+": ((input.slice(24, 25)*16 + input.slice(25, 26))*16 + input.slice(26, 27))*16 + input.slice(27, 28),
                "Er+": ((input.slice(28, 29)*16 + input.slice(29, 30))*16 + input.slice(30, 31))*16 + input.slice(31, 32),
            };
            result.load4 = {
                "Ea+": ((input.slice(32, 33)*16 + input.slice(33, 34))*16 + input.slice(34, 35))*16 + input.slice(35, 36),
                "Er+": ((input.slice(36, 37)*16 + input.slice(37, 38))*16 + input.slice(38, 39))*16 + input.slice(39, 40),
            };

            result.pulseMeter = ((((((input.slice(40, 41)*16 + input.slice(41, 42))*16 + input.slice(42, 43))*16 + input.slice(43, 44))*16 + input.slice(44, 45))*16 + input.slice(45, 46))*16 + input.slice(46, 47))*16 + input.slice(47, 48);
            
            var decimalInputs = input.slice(48, 49)*16 + input.slice(49, 50);
            var binaryInputs = decimalToBinary(decimalInputs);

            result.native = {digitalInput1: binaryInputs.substring(0, 1), digitalInput2: binaryInputs.substring(1, 2)};
            result.module1 = {digitalInput1: binaryInputs.substring(2, 3), digitalInput2: binaryInputs.substring(3, 4)};
            result.module2 = {digitalInput1: binaryInputs.substring(4, 5), digitalInput2: binaryInputs.substring(5, 6)};
            result.module3 = {digitalInput1: binaryInputs.substring(6, 7), digitalInput2: binaryInputs.substring(7, 8)};
            result.module4 = {digitalInput1: binaryInputs.substring(8, 9), digitalInput2: binaryInputs.substring(9, 10)};
            result.voltageDetection = { 
                iTR1: binaryInputs.substring(10, 11), 
                iTR2: binaryInputs.substring(11, 12), 
                iTR3: binaryInputs.substring(12, 13), 
                iTR4: binaryInputs.substring(13, 14)  
            };
            
            result.statusChangeCounter = {
                native: {
                    input1: decimalToHex(input.slice(50, 51)).substring(0, 4),
                    input2: decimalToHex(input.slice(50, 51)).substring(4, 8),
                },
                module1: {
                    digitalInput1: decimalToHex(input.slice(51, 52)).substring(0, 4),
                    digitalInput2: decimalToHex(input.slice(51, 52)).substring(4, 8),
                }
            };

            break;
        case 3:
            result.dateTime = ((input.slice(4, 5)*16 + input.slice(5, 6))*16 + input.slice(6, 7))*16 + input.slice(7, 8);
            
            result.load1 = {
                "Ea+": ((input.slice(8, 9)*16 + input.slice(9, 10))*16 + input.slice(10, 11))*16 + input.slice(11, 12),
                "Ea-": ((input.slice(12, 13)*16 + input.slice(13, 14))*16 + input.slice(14, 15))*16 + input.slice(15, 16),
            };
            result.load2 = {
                "Ea+": ((input.slice(16, 17)*16 + input.slice(17, 18))*16 + input.slice(18, 19))*16 + input.slice(19, 20),
                "Ea-": ((input.slice(20, 21)*16 + input.slice(21, 22))*16 + input.slice(22, 23))*16 + input.slice(23, 24),
            };
            result.load3 = {
                "Ea+": ((input.slice(24, 25)*16 + input.slice(25, 26))*16 + input.slice(26, 27))*16 + input.slice(27, 28),
                "Ea-": ((input.slice(28, 29)*16 + input.slice(29, 30))*16 + input.slice(30, 31))*16 + input.slice(31, 32),
            };
            result.load4 = {
                "Ea+": ((input.slice(32, 33)*16 + input.slice(33, 34))*16 + input.slice(34, 35))*16 + input.slice(35, 36),
                "Ea-": ((input.slice(36, 37)*16 + input.slice(37, 38))*16 + input.slice(38, 39))*16 + input.slice(39, 40),
            };
            
            result.pulseMeter = ((((((input.slice(40, 41)*16 + input.slice(41, 42))*16 + input.slice(42, 43))*16 + input.slice(43, 44))*16 + input.slice(44, 45))*16 + input.slice(45, 46))*16 + input.slice(46, 47))*16 + input.slice(47, 48);
            
            var decimalInputs = input.slice(48, 49)*16 + input.slice(49, 50);
            var binaryInputs = decimalToBinary(decimalInputs);

            result.native = {digitalInput1: binaryInputs.substring(0, 1), digitalInput2: binaryInputs.substring(1, 2)};
            result.module1 = {digitalInput1: binaryInputs.substring(2, 3), digitalInput2: binaryInputs.substring(3, 4)};
            result.module2 = {digitalInput1: binaryInputs.substring(4, 5), digitalInput2: binaryInputs.substring(5, 6)};
            result.module3 = {digitalInput1: binaryInputs.substring(6, 7), digitalInput2: binaryInputs.substring(7, 8)};
            result.module4 = {digitalInput1: binaryInputs.substring(8, 9), digitalInput2: binaryInputs.substring(9, 10)};
            result.voltageDetection = { 
                iTR1: binaryInputs.substring(10, 11), 
                iTR2: binaryInputs.substring(11, 12), 
                iTR3: binaryInputs.substring(12, 13), 
                iTR4: binaryInputs.substring(13, 14)  
            };
            
            result.statusChangeCounter = {
                native: {
                    input1: decimalToHex(input.slice(50, 51)).substring(0, 4),
                    input2: decimalToHex(input.slice(50, 51)).substring(4, 8),
                },
                module1: {
                    digitalInput1: decimalToHex(input.slice(51, 52)).substring(0, 4),
                    digitalInput2: decimalToHex(input.slice(51, 52)).substring(4, 8),
                }
            };

            break;
        case 4:
            result.dateTime = ((input.slice(4, 5)*16 + input.slice(5, 6))*16 + input.slice(6, 7))*16 + input.slice(7, 8);
            
            result.plotAvg = ((input.slice(8, 9)*16 + input.slice(9, 10))*16 + input.slice(10, 11))*16 + input.slice(11, 12);
            result.qTotAvg = ((input.slice(12, 13)*16 + input.slice(13, 14))*16 + input.slice(14, 15))*16 + input.slice(15, 16);
            result.sTotAvg = ((input.slice(16, 17)*16 + input.slice(17, 18))*16 + input.slice(18, 19))*16 + input.slice(19, 20);
            result.pFTotAvg = input.slice(20, 21)*16 + input.slice(21, 22);
            result.I1Avg = ((input.slice(22, 23)*16 + input.slice(23, 24))*16 + input.slice(24, 25))*16 + input.slice(25, 26);
            result.I2Avg = ((input.slice(26, 27)*16 + input.slice(27, 28))*16 + input.slice(28, 29))*16 + input.slice(29, 30);
            result.I3Avg = ((input.slice(30, 31)*16 + input.slice(31, 32))*16 + input.slice(32, 33))*16 + input.slice(33, 34);
            result.FAvg = ((input.slice(34, 35)*16 + input.slice(35, 36))*16 + input.slice(36, 37))*16 + input.slice(37, 38);
            
            var decimalInputs = input.slice(38, 39)*16 + input.slice(39, 40);
            var binaryInputs = decimalToBinary(decimalInputs);

            result.native = {digitalInput1: binaryInputs.substring(0, 1), digitalInput2: binaryInputs.substring(1, 2)};
            result.module1 = {digitalInput1: binaryInputs.substring(2, 3), digitalInput2: binaryInputs.substring(3, 4)};
            result.module2 = {digitalInput1: binaryInputs.substring(4, 5), digitalInput2: binaryInputs.substring(5, 6)};
            result.module3 = {digitalInput1: binaryInputs.substring(6, 7), digitalInput2: binaryInputs.substring(7, 8)};
            result.module4 = {digitalInput1: binaryInputs.substring(8, 9), digitalInput2: binaryInputs.substring(9, 10)};
            result.voltageDetection = { 
                iTR1: binaryInputs.substring(10, 11), 
                iTR2: binaryInputs.substring(11, 12), 
                iTR3: binaryInputs.substring(12, 13), 
                iTR4: binaryInputs.substring(13, 14)  
            };
            
            result.temperatureInput1 = input.slice(40, 41)*16 + input.slice(41, 42);
            result.temperatureInput2 = input.slice(42, 43)*16 + input.slice(43, 44);
            result.temperatureInput3 = input.slice(44, 45)*16 + input.slice(45, 46);

            result.statusChangeCounter = {
                native: {
                    input1: decimalToHex(input.slice(46, 47)).substring(0, 4),
                    input2: decimalToHex(input.slice(46, 47)).substring(4, 8),
                },
                module1: {
                    digitalInput1: decimalToHex(input.slice(47, 48)).substring(0, 4),
                    digitalInput2: decimalToHex(input.slice(47, 48)).substring(4, 8),
                }
            };

            break;
        case 5:
            result.dateTimeOfAvgValue = ((input.slice(4, 5)*16 + input.slice(5, 6))*16 + input.slice(6, 7))*16 + input.slice(7, 8);

            result.load1 = {
                plotAvg: ((input.slice(8, 9)*16 + input.slice(9, 10))*16 + input.slice(10, 11))*16 + input.slice(11, 12),
                qTotAvg: ((input.slice(12, 13)*16 + input.slice(13, 14))*16 + input.slice(14, 15))*16 + input.slice(15, 16),
            };
            result.load2 = {
                plotAvg: ((input.slice(16, 17)*16 + input.slice(17, 18))*16 + input.slice(18, 19))*16 + input.slice(19, 20),
                qTotAvg: ((input.slice(20, 21)*16 + input.slice(21, 22))*16 + input.slice(22, 23))*16 + input.slice(23, 24),
            };
            result.load3 = {
                plotAvg: ((input.slice(24, 25)*16 + input.slice(25, 26))*16 + input.slice(26, 27))*16 + input.slice(27, 28),
                qTotAvg: ((input.slice(28, 29)*16 + input.slice(29, 30))*16 + input.slice(30, 31))*16 + input.slice(31, 32),
            };
            result.load4 = {
                plotAvg: ((input.slice(32, 33)*16 + input.slice(33, 34))*16 + input.slice(34, 35))*16 + input.slice(35, 36),
                qTotAvg: ((input.slice(36, 37)*16 + input.slice(37, 38))*16 + input.slice(38, 39))*16 + input.slice(39, 40),
            };

            var decimalInputs = input.slice(40, 41)*16 + input.slice(41, 42);
            var binaryInputs = decimalToBinary(decimalInputs);

            result.native = {digitalInput1: binaryInputs.substring(0, 1), digitalInput2: binaryInputs.substring(1, 2)};
            result.module1 = {digitalInput1: binaryInputs.substring(2, 3), digitalInput2: binaryInputs.substring(3, 4)};
            result.module2 = {digitalInput1: binaryInputs.substring(4, 5), digitalInput2: binaryInputs.substring(5, 6)};
            result.module3 = {digitalInput1: binaryInputs.substring(6, 7), digitalInput2: binaryInputs.substring(7, 8)};
            result.module4 = {digitalInput1: binaryInputs.substring(8, 9), digitalInput2: binaryInputs.substring(9, 10)};
            result.voltageDetection = { 
                iTR1: binaryInputs.substring(10, 11), 
                iTR2: binaryInputs.substring(11, 12), 
                iTR3: binaryInputs.substring(12, 13), 
                iTR4: binaryInputs.substring(13, 14)  
            };
            
            result.statusChangeCounter = {
                native: {
                    input1: decimalToHex(input.slice(42, 43)).substring(0, 4),
                    input2: decimalToHex(input.slice(42, 43)).substring(4, 8),
                },
                module1: {
                    digitalInput1: decimalToHex(input.slice(43, 44)).substring(0, 4),
                    digitalInput2: decimalToHex(input.slice(43, 44)).substring(4, 8),
                },
                virtualMonitor: {
                    iTR1: decimalToHex(input.slice(44, 45)).substring(0, 4),
                    iTR2: decimalToHex(input.slice(44, 45)).substring(4, 8),
                    iTR3: decimalToHex(input.slice(45, 46)).substring(0, 4),
                    iTR4: decimalToHex(input.slice(45, 46)).substring(4, 8)
                }
            };

            break;
        case 6:
            var flagValue = "";
            switch(input.slice(24, 25)*16 + input.slice(25, 26)){
                case 0:
                    flagValue = "Complete period and date configured";
                    break;
                case 1:
                    flagValue = "Incomplete period and date configured";
                    break;
                case 2:
                    flagValue = "Complete period and date not configured";
                    break;
                case 3:
                    flagValue = "Incomplete period and date not configured";
                    break;
                default:
                    flagValue = "Undecodable";
            }

            result.lastPoint = {
                dateTime: ((input.slice(4, 5)*16 + input.slice(5, 6))*16 + input.slice(6, 7))*16 + input.slice(7, 8),
                "pTot+": ((input.slice(8, 9)*16 + input.slice(9, 10))*16 + input.slice(10, 11))*16 + input.slice(11, 12),
                "pTot-": ((input.slice(12, 13)*16 + input.slice(13, 14))*16 + input.slice(14, 15))*16 + input.slice(15, 16),
                "qTot+": ((input.slice(16, 17)*16 + input.slice(17, 18))*16 + input.slice(18, 19))*16 + input.slice(19, 20),
                "qTot-": ((input.slice(20, 21)*16 + input.slice(21, 22))*16 + input.slice(22, 23))*16 + input.slice(23, 24),
                flag: flagValue
            };

            var flagValue = "";
            switch(input.slice(46, 47)*16 + input.slice(47, 48)){
                case 0:
                    flagValue = "Complete period and date configured";
                    break;
                case 1:
                    flagValue = "Incomplete period and date configured";
                    break;
                case 2:
                    flagValue = "Complete period and date not configured";
                    break;
                case 3:
                    flagValue = "Incomplete period and date not configured";
                    break;
                default:
                    flagValue = "Undecodable";
            }

            result.pointBeforeLast = {
                dateTime: ((input.slice(26, 27)*16 + input.slice(27, 28))*16 + input.slice(28, 29))*16 + input.slice(29, 30),
                "pTot+": ((input.slice(30, 31)*16 + input.slice(31, 32))*16 + input.slice(32, 33))*16 + input.slice(33, 34),
                "pTot-": ((input.slice(34, 35)*16 + input.slice(35, 36))*16 + input.slice(36, 37))*16 + input.slice(37, 38),
                "qTot+": ((input.slice(38, 39)*16 + input.slice(39, 40))*16 + input.slice(40, 41))*16 + input.slice(41, 42),
                "qTot-": ((input.slice(42, 43)*16 + input.slice(43, 44))*16 + input.slice(44, 45))*16 + input.slice(45, 46),
                flag: flagValue
            };

            var decimalInputs = input.slice(48, 49)*16 + input.slice(49, 50);
            var binaryInputs = decimalToBinary(decimalInputs);

            result.native = {digitalInput1: binaryInputs.substring(0, 1), digitalInput2: binaryInputs.substring(1, 2)};
            result.module1 = {digitalInput1: binaryInputs.substring(2, 3), digitalInput2: binaryInputs.substring(3, 4)};
            result.module2 = {digitalInput1: binaryInputs.substring(4, 5), digitalInput2: binaryInputs.substring(5, 6)};
            result.module3 = {digitalInput1: binaryInputs.substring(6, 7), digitalInput2: binaryInputs.substring(7, 8)};
            result.module4 = {digitalInput1: binaryInputs.substring(8, 9), digitalInput2: binaryInputs.substring(9, 10)};
            result.voltageDetection = { 
                iTR1: binaryInputs.substring(10, 11), 
                iTR2: binaryInputs.substring(11, 12), 
                iTR3: binaryInputs.substring(12, 13), 
                iTR4: binaryInputs.substring(13, 14)  
            };
            
            result.statusChangeCounter = {
                native: {
                    input1: decimalToHex(input.slice(50, 51)).substring(0, 4),
                    input2: decimalToHex(input.slice(50, 51)).substring(4, 8),
                },
                module1: {
                    digitalInput1: decimalToHex(input.slice(51, 52)).substring(0, 4),
                    digitalInput2: decimalToHex(input.slice(51, 52)).substring(4, 8),
                }
            };

            break;
        case 7:
            var flagValue = "";
            switch(input.slice(24, 25)*16 + input.slice(25, 26)){
                case 0:
                    flagValue = "Complete period and date configured";
                    break;
                case 1:
                    flagValue = "Incomplete period and date configured";
                    break;
                case 2:
                    flagValue = "Complete period and date not configured";
                    break;
                case 3:
                    flagValue = "Incomplete period and date not configured";
                    break;
                default:
                    flagValue = "Undecodable";
            }

            result.lastPoint = {
                dateTime: ((input.slice(4, 5)*16 + input.slice(5, 6))*16 + input.slice(6, 7))*16 + input.slice(7, 8),
                "load1PTot+": ((input.slice(8, 9)*16 + input.slice(9, 10))*16 + input.slice(10, 11))*16 + input.slice(11, 12),
                "load2PTot+": ((input.slice(12, 13)*16 + input.slice(13, 14))*16 + input.slice(14, 15))*16 + input.slice(15, 16),
                "load3PTot+": ((input.slice(16, 17)*16 + input.slice(17, 18))*16 + input.slice(18, 19))*16 + input.slice(19, 20),
                "load4PTot+": ((input.slice(20, 21)*16 + input.slice(21, 22))*16 + input.slice(22, 23))*16 + input.slice(23, 24),
                flag: flagValue
            };

            var flagValue = "";
            switch(input.slice(46, 47)*16 + input.slice(47, 48)){
                case 0:
                    flagValue = "Complete period and date configured";
                    break;
                case 1:
                    flagValue = "Incomplete period and date configured";
                    break;
                case 2:
                    flagValue = "Complete period and date not configured";
                    break;
                case 3:
                    flagValue = "Incomplete period and date not configured";
                    break;
                default:
                    flagValue = "Undecodable";
            }

            result.pointBeforeLast = {
                dateTime: ((input.slice(26, 27)*16 + input.slice(27, 28))*16 + input.slice(28, 29))*16 + input.slice(29, 30),
                "load1PTot+": ((input.slice(30, 31)*16 + input.slice(31, 32))*16 + input.slice(32, 33))*16 + input.slice(33, 34),
                "load2PTot+": ((input.slice(34, 35)*16 + input.slice(35, 36))*16 + input.slice(36, 37))*16 + input.slice(37, 38),
                "load3PTot+": ((input.slice(38, 39)*16 + input.slice(39, 40))*16 + input.slice(40, 41))*16 + input.slice(41, 42),
                "load4PTot+": ((input.slice(42, 43)*16 + input.slice(43, 44))*16 + input.slice(44, 45))*16 + input.slice(45, 46),
                flag: flagValue
            };

            var decimalInputs = input.slice(48, 49)*16 + input.slice(49, 50);
            var binaryInputs = decimalToBinary(decimalInputs);

            result.native = {digitalInput1: binaryInputs.substring(0, 1), digitalInput2: binaryInputs.substring(1, 2)};
            result.module1 = {digitalInput1: binaryInputs.substring(2, 3), digitalInput2: binaryInputs.substring(3, 4)};
            result.module2 = {digitalInput1: binaryInputs.substring(4, 5), digitalInput2: binaryInputs.substring(5, 6)};
            result.module3 = {digitalInput1: binaryInputs.substring(6, 7), digitalInput2: binaryInputs.substring(7, 8)};
            result.module4 = {digitalInput1: binaryInputs.substring(8, 9), digitalInput2: binaryInputs.substring(9, 10)};
            result.voltageDetection = { 
                iTR1: binaryInputs.substring(10, 11), 
                iTR2: binaryInputs.substring(11, 12), 
                iTR3: binaryInputs.substring(12, 13), 
                iTR4: binaryInputs.substring(13, 14)  
            };
            
            result.statusChangeCounter = {
                native: {
                    input1: decimalToHex(input.slice(50, 51)).substring(0, 4),
                    input2: decimalToHex(input.slice(50, 51)).substring(4, 8),
                },
                module1: {
                    digitalInput1: decimalToHex(input.slice(51, 52)).substring(0, 4),
                    digitalInput2: decimalToHex(input.slice(51, 52)).substring(4, 8),
                }
            };
            
            break;
        default:
            result.errors = ["The payload doesn't have a valid profile number."];
            return result;
    }

    return result;
}

function encodeDownlink(input){
    var result = "";

    return result;
}

exports.decodeUplink = decodeUplink;
exports.encodeDownlink = encodeDownlink;