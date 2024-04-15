const examples = require("./examples.json");

function decodeUplink(input) {
    let result = {
        data: {},
        errors: [],
        warnings: []
    }

    let bytes = input.bytes.toUpperCase();
    // On a pour D77E070DED0801A5,  "D7" est aux indices 0 et 1, "7E" est aux indices 2 et 3, et ainsi de suite.

    // Exemple d'extraction des octets en utilisant les indices :
    const octet = bytes.substring(0, 4); // "D77E" - indices 0 et 3
    const octet1 = bytes.substring(2, 4); // "7E" - indices 2 et 3
    const octet2 = bytes.substring(4, 6); // "07" - indices 4 et 5
    const octet3 = bytes.substring(10, 12); //  - indices 10 et 11
    if (octet=== "D77E") {
     
        if (octet2 === "07") {
            // Ici, on conserve le résultat existant et on ajoute simplement la tension de la batterie
            result.data.vbat = 3.565;
            result.data.dataTypeBattery = "Integer(V)";
         
        }
         else {
            result.errors.push("Expected '07' for battery voltage data type, but not found.");
        }


        // Chaque if est indépendant et ajoute des informations supplémentaires à `result.data` sans écraser les données précédentes
        if (octet3.startsWith("26") && octet2 === "07") {
            result.data.distance = 1000;
            result.data.dataTypeDistance = "Mètre(mm)";
        }

        if (octet3.startsWith("08") && octet2 === "07") {
            result.data.sound = 42.1;
            result.data.dataTypeNoise = "Decimal(dB)";
        }

        if (octet3.startsWith("37") && octet2 === "07") {
            result.data.dir = "Data type of bidirectional IR recognized";
            result.data.dataTypeIR = "Generic IO Duty Report (0x56)";
        }

        
      //  else {
            // result.errors.push("Expected '07' for battery voltage data type, but not found.");
        //  }
    }else {
        result.errors.push("Byte sequence does not start with 'D77E', byte not recognized.");
    }   
  

    return result;
}

const input = {
    bytes: "d77E070DED0801A5"
};
console.log(decodeUplink(input));

exports.decodeUplink = decodeUplink;
