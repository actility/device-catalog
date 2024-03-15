# Abeeway Asset Tracker Driver Package

## Description
The IoT Flow Abeeway Asset Tracker driver implements the specification of javascript IoT flow drivers as described in the chapter below.

## To use in javascript
First install the package: <code> npm install abeeway-asset-tracker </code>

Then:
``` javascript
//import the module
var driver = require("abeeway-asset-tracker");

//common functions
//convert a hex string to a hex array
function parseHexString(str){
    var result = [];
    while (str.length >= 2) { 
        result.push(parseInt(str.substring(0, 2), 16));

        str = str.substring(2, str.length);
    }
    return result;
}
```

- To decode an uplink
```javascript
var input = {
    bytes: parseHexString(uplinkPayloadString),
    fPort: 18 
}

var result = driver.decodeUplink(input)

```

- To decode a downlink

```javascript
var input = {
    bytes: parseHexString(downlinkPayloadString),
}
var result = driver.decodeDownlink(input)
```

- To encode a downlink

```javascript
/*
input is the "data" object without "payload" as presented in the downlink example files
for example
{
    "downMessageType": "DEBUG_COMMAND",
    "ackToken": 2,
    "debugCommandType": "RESET"
}
*/
var result = driver.encodeDownlink(input).bytes
```


## To update and re-publish this package:
1. Clone this repo: https://github.com/actility/device-catalog
2. Go to ./vendors/abeeway/drivers/asset-tracker
3. Copy-paste the up-to-date package.json into the src folder
4. Change the new package.json's "name" property from "asset-tracker" to "abeeway-asset-tracker" and its "main" property from "./main.js" to "./index.js"
5. Create a README.md file inside the src folder and copy-paste the contents from here.
6. Run npm link inside the src folder
7. Test that all the functions are correctly exported by creating a local tmp project, doing npm link asset-tracker in it and running your JS test file to see if all exported functions are available
8. Publish as an unscoped package onto npmjs (refer to the official npmjs documentation: https://docs.npmjs.com/creating-and-publishing-unscoped-public-packages)
9. Discard all changes if on the main branch