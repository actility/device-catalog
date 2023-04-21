# JavaScript driver structure

> If you have a driver already follows the LoRa Alliance standard codec API, then you need just to add `driver.yaml` file as the one [here](sample-driver/driver.yaml).

This section describes how to build a javascript driver for Actility.

You can either follow the LoRa Alliance standard codec API described [here](https://resources.lora-alliance.org/document/ts013-1-0-0-payload-codec-api), or follow this documentation.

-   [JavaScript driver structure](#JavaScript-driver-structure)
    - [Driver](#driver)
    - [API](#API)
      - [Driver functions](#driver-functions)
          - [Uplink decode](#uplink-decode)
          - [Downlink encode](#downlink-encode)
          - [Downlink decode](#downlink-decode)
      - [Payload examples](#payload-examples)
      - [Json schemas](#json-schemas)
    - [Packaging](#packaging)
    - [Testing](#testing)
    - [Template](./sample-driver)
- [Sample driver developer guide](#sample-driver-developer-guide)


## Driver

The `driver` is the piece of code responsible to decode uplinks/downlinks and to encode downlinks for a single device
communication protocol. It is the core part of the LoRaWAN framework to interact with new devices.

If a device is exposing several incompatible communication protocols, then several drivers needs to be implemented,
one for each.

The programming language used in this codec is the JavaScript which is a lightweight, interpreted, just-in-time compiled programming language with first class functions.

More precisely, the JavaScript ES5 is used as it is simple and widely supported in most communities.

## API

### Driver functions

The following sections describe the three javascript functions that a driver can declare to perform encoding and decoding
tasks.

> A driver must at least declare a `decodeUplink(input)` function to be valid (see next section).

#### Uplink decode

This function is mandatory when creating a codec; without it, the codec is considered invalid.

Uplinks are decoded by calling the following function:

```javascript
function decodeUplink(input) {
    ...
    return output;
}
```

The `input` is an object provided by the Actility framework that is represented by the following json-schema:

```json
{
    "bytes": {
        "description": "The uplink payload byte array, where each byte is represented by an integer between 0 and 255",
        "type": "array",
        "items": {
            "type": "integer"
        },
        "required": true
    },
    "fPort": {
        "description": "The uplink message LoRaWAN fPort",
        "type": "integer",
        "required": true
    },
    "recvTime": {
        "description": "The uplink message datetime recorded by the LoRaWAN network server as a JavaScript Date object",
        "type": "string",
        "format": "date-time",
        "required": true
    }
}
```

The returned `output` is represented by the following json-schema:

```json
{
    "data": {
        "description": "The open JavaScript object representing the decoded payload when no error is encountered while decoding. required if success.",
        "type": "Object",
        "required": false
    },
    "errors": {
        "description": "A list of error messages while decoding the provided payload. required if failed.",
        "type": "array",
        "items": {
          "type": "string"
        },
        "required": false
    },
    "warnings": {
        "description": "A list of warning messages that do not prevent the codec from decoding the payload. optional.",
        "type": "array",
        "items": {
          "type": "string"
        },
        "required": false
    }
}
```
#### Downlink encode

Contrary to the decodeUplink function, the implementation of this function is only mandatory when a device supports downlinks.

Downlinks are encoding by calling the following function:

```javascript
function encodeDownlink(input) {
    ...
    return output;
}
```

The `input` is an object that is represented by the following json-schema:

```json
{
    "data": {
        "description": "The open JavaScript object representing the downlink. It is defined by the codec developer",
        "type": "Object"
    }
}
```

The returned `output` is an object that is represented by the following json-schema:

```json
{
    "fPort": {
      "description": "The downlink LoRaWAN fPort, if no error occurred",
      "type": "integer",
      "required": true
    },
    "bytes": {
        "description": "The downlink payload byte array, where each byte is represented by an integer between 0-255, if no error occurred. required if success.",
        "type": "array",
        "items": {
          "type": "integer"
        },
        "required": false
    },
    "errors": {
        "description": "A list of error messages while decoding the provided payload. required if failed.",
        "type": "array",
        "items": {
          "type": "string"
        },
        "required": false
    },
    "warnings": {
        "description": "A list of warning messages that do not prevent the codec from decoding the payload. optional.",
        "type": "array",
        "items": {
          "type": "string"
        },
        "required": false
    }
}
```

#### Downlink decode

The implementation of this function is optional; it may be present when a device supports downlinks, to ease the monitoring and logs of sent downlinks.

Downlinks are decoded by calling the following function:

```javascript
function decodeDownlink(input) {
    ...
    return output;
}
```

The `input` is an object provided by the LoRaWAN framework that is represented by the following json-schema:

```json
{
  "bytes": {
    "description": "The downlink payload byte array, where each byte is represented by an integer between 0 and 255",
    "type": "array",
    "items": {
      "type": "integer"
    },
    "required": true
  },
  "fPort": {
    "description": "The downlink message LoRaWAN fPort",
    "type": "integer",
    "required": true
  },
  "recvTime": {
    "description": "The downlink message datetime computed by the LoRaWAN platform as a JavaScript Date object",
    "type": "string",
    "format": "date-time",
    "required": true
  }
}
```

The returned `output` is represented by the following json-schema:

```json
{
    "data": {
        "description": "The open JavaScript object representing the decoded payload when no error is encountered while decoding. required if success.",
        "type": "Object",
        "required": false
    },
    "errors": {
        "description": "A list of error messages while decoding the provided payload. required if failed.",
        "type": "array",
        "items": {
          "type": "string"
        },
        "required": false
    },
    "warnings": {
        "description": "A list of warning messages that do not prevent the codec from decoding the payload. optional.",
        "type": "array",
        "items": {
          "type": "string"
        },
        "required": false
    }
}
```

### Payload examples

The following section describes the examples of the payloads of the driver.

An `examples.json` file of uplink and downlink payloads must be declared directly in the driver package.

These examples will be used in order to provide for the users of the driver some examples of the payload to be decoded/encoded to test the driver. In addition, it will be used to facilitate the testing of the driver while development.

#### Example

The uplink/downlink decode example used is an object represented by the following json-schema:

```json
{
    "description": {
        "description": "the description of the uplink/downlink example",
        "type": "string",
        "required": true
    },
    "type": {
        "description": "the type of the uplink/downlink example",
        "type": "string",
        "enum": ["uplink", "downlink-decode"],
        "required": true
    },
    "input": {
        "type": "Object",
        "items": {
          "bytes": {
            "description": "the uplink/downlink payload expressed in hexadecimal",
            "type": "string",
            "required": true
          },
          "fPort": {
            "description": "the uplink/downlink message LoRaWAN fPort",
            "type": "number",
            "required": true
          },
          "recvTime": {
            "description": "the uplink/downlink message time",
            "type": "string",
            "format": "date-time",
            "required": true
          }
        }
    },
    "output": {
      "type": "Object",
      "items": {
        "data": {
          "description": "The open JavaScript object representing the decoded payload when no error is encountered while decoding. required if success.",
          "type": "Object",
          "required": false
        },
        "errors": {
          "description": "A list of error messages while decoding the provided payload. required if failed.",
          "type": "array",
          "items": {
            "type": "string"
          },
          "required": false
        },
        "warnings": {
          "description": "A list of warning messages that do not prevent the codec from decoding the payload. optional.",
          "type": "array",
          "items": {
            "type": "string"
          },
          "required": false
        }
      }
    }
}
```


The downlink encode example used is an object represented by the following json-schema:

```json
{
    "description": {
        "description": "the description of the downlinn encode example",
        "type": "string",
        "required": true
    },
    "type": {
        "description": "the type of the uplink/downlink example",
        "type": "string",
        "enum": ["downlink-encode"],
        "required": true
    },
    "input": {
        "type": "Object",
        "items": {
          "data": {
            "description": "The open JavaScript object representing the decoded payload when no error is encountered while decoding. required if success.",
            "type": "Object",
            "required": false
          }
        }
    },
    "output": {
      "type": "Object",
      "items": {
        "bytes": {
          "description": "the downlink  encoded payload expressed in hexadecimal. required if success.",
          "type": "string",
          "required": false
        },
        "fPort": {
          "description": "the downlink message LoRaWAN fPort",
          "type": "number",
          "required": true
        },
        "errors": {
          "description": "A list of error messages while encoding the provided payload. required if failed.",
          "type": "array",
          "items": {
            "type": "string"
          },
          "required": false
        },
        "warnings": {
          "description": "A list of warning messages that do not prevent the codec from encoding the payload. optional.",
          "type": "array",
          "items": {
            "type": "string"
          },
          "required": false
        }
      }
    }
}
```

### Json Schemas

The following section describes the Json Schema of the decoded payloads of the driver.

As the output data from the decoding payload process is not predictable, it is better to declare Json schemas that defines the structure of this output to ease the use of driver after decoding.

The Json schemas of uplink and downlink payloads must be declared directly in the driver package.
Two Json schemas can be declared following the pattern: `uplink.schema.json` for uplink data, and `downlink.schema.json` for downlink data if supported.

An `*.schema.json` file contains a generic json schema for all types of payload decoded by this driver of several uplink/downlink examples.

## Packaging

To simplify the open distribution and integration with our platform, a packaging leveraging NPMs is defined.

NPM was chosen because it is the most widely used packaging system for JavaScript code. Also, this approach defines a
clear code layout that can be distributed independently using the developer preferred version control tool.

You can find a full description of packaging in the guide of a driver [here](#sample-driver-developer-guide).

## Testing

Testing your driver is a very important process, thus the user is highly encouraged to test the driver in most possible
use cases as well as error cases.

**Important:** The test of your driver is needed to prove a minimum test coverage of 85% to be valid on our framework.

> A pre-implemented [spec file](sample-driver/driver-examples.spec.js) for testing can be copied from the template in order to test the driver with all the provided examples.

##
# Sample driver developer guide

This example describes how you to create a driver for Actility following the LoRa Alliance standard Codec API.

The concept and API is described [here](#api)

-   [Sample driver developer guide](#sample-driver-developer-guide)
    -   [Minimal driver](#minimal-driver)
    -   [Encoding and decoding downlinks](#encoding-and-decoding-downlinks)
    -   [Returning errors](#returning-errorswarnings)
    -   [Testing](#testing-the-driver)

## Minimal driver

Pre-requirements: you need to have npm installed with version > 5. To test the installed version run:

```sh
$ npm -v
```

We'll start by creating a new npm project that will contain the driver. From an empty directory in a terminal run:

```sh
$ npm init
```

After completing all the information requested by npm you will find a new file `package.json` on the directory you ran
`npm init` similar to the following (ignoring the name, version, author, etc):

```json
{
    "name": "driver",
    "version": "1.0.0",
    "description": "My driver",
    "main": "index.js",
    "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1"
    },
    "author": "",
    "license": "ISC"
}
```

***Important:*** Please make sure to NOT scope your package.

**PS**: In the driver, the `require()` method is not allowed to import an external module.
If your driver is split into several javascript file (not recommended), you have to use webpack to generate a single Javascript file.
Here is the webpack configuration to be used in that case: 
```javascript
module.exports = {
  target: "node",
  mode: "production",
  entry: "./index.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "."),
    library: "driver",
  },
}
```

Now that we have a valid npm project, we will create the driver itself. Open a new file named `index.js` where we will
define only an uplink decode:

_index.js_:

```javascript
function decodeUplink(input) {
    let result = {
        data: {},
        errors: [],
        warnings: []
    };
    const raw = Buffer.from(input.bytes);

    if (raw.byteLength > 8) {
        result.errors.push("Invalid uplink payload: length exceeds 8 bytes");
        delete result.data;
        return result;
    }

    for (i = 0; i < raw.byteLength; i++) {
        switch (raw[i]) {
            // Temperature - 2 bytes
            case 0x00:
                if (raw.byteLength < i + 3) {
                    result.errors.push("Invalid uplink payload: index out of bounds when reading temperature");
                    delete result.data;
                    return result;
                }
                result.data.temperature = raw.readInt16BE(i+1)/100;
                if(result.data.temperature > 40){
                    result.warnings = ["temperature exceeded the threshold of 40 degrees."];
                }
                i += 2;
                break;
            // Humidity - 2 bytes
            case 0x01:
                if (raw.byteLength < i + 3) {
                    result.errors.push("Invalid uplink payload: index out of bounds when reading humidity");
                    delete result.data;
                    return result;
                }
                result.data.humidity = raw.readInt16BE(i+1)/100;
                i += 2;
                break;
            // Pulse counter - 1 byte
            case 0x02:
                result.data.pulseCounter = raw.readInt8(i+1);
                i += 1;
                break;
            default:
                result.errors.push("Invalid uplink payload: unknown id '" + raw[i] + "'");
                delete result.data;
                return result;
        }
    }
    return result;
}
```

In this function, we use a utility function called `readShort`, you must add the following code in your `index.js`:

```javascript
function readShort(bin) {
    var result = bin & 0xffff;
    if (0x8000 & result) {
        result = -(0x010000 - result);
    }
    return result;
}
```

As you can see by inspecting the code, the driver defines a very simple decode function where only two
objects can be retrieved from the payload: temperature, humidity (2 bytes each) and pulse counter (1 byte).

Now that your driver is finished you can create the npm package. Simply run:

```shell
npm pack
```

This will create a new file with the `.tgz` extension in the current folder containing the complete driver.

## Encoding and decoding downlinks

In the previous step we wrote and packaged a driver, which implemented the minimal functionality (i.e.: an uplink decode function).
Now let's extend that driver in order to encode and decode downlinks.

First, lets add a `encodDownlink(input)` function in `index.js`:

```javascript
function encodeDownlink(input) {
    let result = {
        errors: [],
        warnings: []
    };
    let raw = new Buffer(4);
    let index = 0;

    if (typeof input.data.pulseCounterThreshold !== "undefined") {
        if (input.data.pulseCounterThreshold > 255) {
            result.errors.push("Invalid downlink: pulseCounterThreshold cannot exceed 255");
            delete result.data;
            return result;
        }
        raw.writeUInt8(0,index);
        index+=1;
        raw.writeUInt8(input.data.pulseCounterThreshold, index);
        index+=1;
    }
    if (typeof input.data.alarm !== "undefined") {
        raw.writeUInt8(1, index);
        index+=1;
        raw.writeUInt8(input.data.alarm === true? 1 : 0, index);
        index+=1;
    }
    result.bytes = Array.from(raw).slice(0,index);
    result.fPort = 16;
    return result;
}
```

The `encodeDownlink(input)` function takes an object as parameter (see [here](#downlink-encode)) containing the object (called `data`)
that will be encoded as a downlink. Then the function only checks for two objects inside `data` (`pulseCounterThreshold` and `alarm`)
and write their contents as well as their id as byte array.

We can also add a `decodeDownlink(input)` function. This function will allow us to decode the bytes as they are returned from
`encodeDownlink(input)` and return us the object that represents the downlink.

Add the following function in `index.js`:

```javascript
function decodeDownlink(input) {
    let result = {
        data: {},
        errors: [],
        warnings: []
    };
    const raw = Buffer.from(input.bytes);

    if (raw.byteLength > 4) {
        result.errors.push("Invalid downlink payload: length exceeds 4 bytes");
        delete result.data;
        return result;
    }

    for (i = 0; i < raw.byteLength; i += 2) {
        switch (raw[i]) {
            // Pulse counter threshold - 1 byte
            case 0x00:
                if (raw.byteLength < i + 2) {
                    result.errors.push("Invalid downlink payload: index out of bounds when reading pulseCounterThreshold");
                    delete result.data;
                    return result;
                }
                result.data.pulseCounterThreshold = raw.readUInt8(i+1);
                break;
            // Alarm - 1 byte
            case 0x01:
                if (raw.byteLength < i + 2) {
                    result.errors.push("Invalid downlink payload: index out of bounds when reading alarm");
                    delete result.data;
                    return result;
                }
                result.data.alarm = raw.readUInt8(i+1) === 1;
                break;
            default:
                result.errors.push("Invalid downlink payload: unknown id '" + raw[i] + "'");
                delete result.data;
                return result;
        }
    }
    return result;
}
```

The function takes an `input` object (see [here](#downlink-decode)) that will contain `bytes`. This driver will only
decode both objects as returned from `encodeDownlink(input)`: `pulseCounterThreshold` and `alarm`.

After adding `encodeDownlink(input)` and `decodeDownlink(input)` functions you can re-package your driver.

## Returning errors/warnings

As you have noticed, the errors must not be thrown, it can be outputed inside the `errors` array in the output.

Same for a warning needed to be exposed, a string can be added to the array `warnings` in the output object.

## Testing the driver

We use [Jest](https://jestjs.io/) as our testing framweork.

_Note: when testing, you will need to export the functions that you test (unless of course you copy / paste the functions into the testing file). This is *not* needed in your driver if not tested_.

To exports functions, you can add the following at the end of the `index.js` file:

```javascript
exports.decodeUplink = decodeUplink;
exports.decodeDownlink = decodeDownlink;
exports.encodeDownlink = encodeDownlink;
```

### Add jest dependency

To add the jest dependency, please run the following command:

```shell
npm install --save-dev jest
```

### Update package.json to add a script

First, you need to add the `test` script in the `package.json`:

```json
  "scripts": {
    "test": "jest --collectCoverage"
  }
```

Then, you will be able to launch tests using command `npm test`.

**Note:** If your driver does not support a function `encodeDownlink`, all you have to do is to comment/remove the part related to `encodeDownlink` testing inside the pre-implemented test file.

### Test the different cases of your driver

In order to facilitate the use cases testing process, we provide the file [driver-examples.spec.js](sample-driver/driver-examples.spec.js).

This file will automatically get all your examples inside `examples.json` and test them using [Jest](https://jestjs.io/).

### Execute tests with coverage

To execute tests, you must use the following command:

```shell
npm run test
```

This command will give a full report about the coverage of your tests. The most important value in this report is the
percentage of the statements' coverage which appears under `stmts`.

### Add Json Schemas

To provide json schemas of your driver, create a file named `uplink.schema.json` and add the following json schema that describes the structure of the `decodeUplink` output:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "temperature": {
      "type": "number"
    },
    "humidity": {
      "type": "number"
    },
    "pulseCounter": {
      "type": "number"
    },
    "volumes": {
      "type": "array",
      "items": [
        {
          "type": "object",
          "properties": {
            "time": {
              "type": "string"
            },
            "volume": {
              "type": "integer"
            }
          },
          "required": [
            "time",
            "volume"
          ]
        }
      ]
    }
  },
  "additionalProperties": false
}
```

Create a file named `downlink.schema.json` and add the following json schema that describes the structure of the `decodeDownlink` output:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "pulseCounterThreshold": {
      "type": "integer"
    },
    "alarm": {
      "type": "boolean"
    }
  },
  "additionalProperties": false
}
```
### Create a tarball from the package

To create a tarball from the already defined package, you must use the following command:

```shell
npm pack
```

This command must be executed in the root folder of the driver. It will generate a `.tgz` file that contains all the
files and directories of the driver.

**Important:** You must avoid including the non-necessary files into the `.tgz` file as the `node_modules`
and `coverage` directories for example. (This can be done by adding a `.npmignore` file).
 the driver 
