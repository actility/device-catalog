# Simple driver guide

This example describes how you to create a simple driver using ThingPark X IoT Flow framework.

The concepts and API is describe [here](../../README.md#api)

-   [Simple driver](#simple-driver-guide)
    -   [Minimal driver](#minimal-driver)
    -   [Encoding and decoding downlinks](#encoding-and-decoding-downlinks)
    -   [Extracting points](#extracting-points)
    -   [Returning errors](#returning-errors)
    -   [Testing](#testing)

You can find the complete code [here](./index.js).

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
    "name": "@actilitypub/simple-driver",
    "version": "1.0.0",
    "description": "My simple driver",
    "main": "index.js",
    "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1"
    },
    "author": "",
    "license": "ISC"
}
```

You can add some additional properties to ease the use of the driver. The `package.json` file will be in this form:

```json
{
    "name": "@actilitypub/simple-driver",
    "version": "1.0.0",
    "description": "My simple driver",
    "specification": "https://github.com/actility/thingpark-iot-flow-js-driver/blob/master/examples/simple-driver/README.md",
    "deviceImageUrl": "https://market.thingpark.com/media/catalog/product/cache/e0c0cc57a7ea4992fdbd34d6aec6829f/r/o/roximity-detection-_-contact-tracing-starter-kit.jpg",
    "manufacturerLogoUrl": "https://www.actility.com/wp-content/uploads/2019/04/Actility_LOGO_color_RGB_WEB.png",
    "providerLogoUrl": "https://www.actility.com/wp-content/uploads/2019/04/Actility_LOGO_color_RGB_WEB.png",
    "main": "index.js",
    "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1"
    },
    "author": "",
    "license": "ISC"
}
```

Add the `driver` object (see [here](../../README.md#driver-definition)) to the `package.json` file containing the description of your driver:

```json
{
    "name": "@actilitypub/simple-driver",
    "version": "1.0.0",
    "description": "My simple driver",
    "specification": "https://github.com/actility/thingpark-iot-flow-js-driver/blob/master/examples/simple-driver/README.md",
    "deviceImageUrl": "https://market.thingpark.com/media/catalog/product/cache/e0c0cc57a7ea4992fdbd34d6aec6829f/r/o/roximity-detection-_-contact-tracing-starter-kit.jpg",
    "manufacturerLogoUrl": "https://www.actility.com/wp-content/uploads/2019/04/Actility_LOGO_color_RGB_WEB.png",
    "providerLogoUrl": "https://www.actility.com/wp-content/uploads/2019/04/Actility_LOGO_color_RGB_WEB.png",
    "main": "index.js",
    "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1"
    },
    "author": "",
    "license": "ISC",
    "driver": {
        "description": "An example of a simple driver that is able to decode/encode data from temperature and humidity sensors with a pulse counter",
        "producerId": "actilitypub",
        "type": "thingpark-x-js",
        "private": false,
        "application": {
            "producerId": "my-app-producer",
            "moduleId": "my-app-module",
            "version": "1"
        }
    }
}
```

***Important:*** make sure to respect the constraints on the length of some fields. [Here](../../README.md#limitations-on-length-of-fields) you can find the details.

Now that we have a valid npm project, we will create the driver itself. Open a new file named `index.js` where we will
define only an uplink decode:

**PS**: In the simple driver, the `require()` method is not allowed to import an external module. 
If your driver is split into several javascript file, you have to switch to a *complex-driver* and use webpack.

_index.js_:

```javascript
function decodeUplink(input) {
    var result = {};
    var bytes = input.bytes;
    if (bytes.length > 8) {
        throw new Error("Invalid uplink payload: length exceeds 8 bytes");
    }
    for (i = 0; i < bytes.length; i++) {
        switch (bytes[i]) {
            // Temperature - 2 bytes
            case 0x00:
                if (bytes.length < i + 3) {
                    throw new Error("Invalid uplink payload: index out of bounds when reading temperature");
                }
                var tmp = (bytes[i + 1] << 8) | bytes[i + 2];
                tmp = readShort(tmp);
                result.temp = tmp / 100;
                i += 2;
                break;
            // Humidity - 2 bytes
            case 0x01:
                if (bytes.length < i + 3) {
                    throw new Error("Invalid uplink payload: index out of bounds when reading humidity");
                }
                var tmp = (bytes[i + 1] << 8) | bytes[i + 2];
                tmp = readShort(tmp);
                result.humidity = tmp / 100;
                i += 2;
                break;
            // Pulse counter - 1 byte
            case 0x02:
                result.pulseCounter = bytes[i + 1];
                i += 1;
                break;
            case 0x03:
                result.volumes = [];
                var volume1 = readShort(bytes[i+1]);
                result.volumes.push({
                    time: new Date("2020-08-02T20:00:00.000+05:00").toISOString(),
                    volume: volume1
                });
                var volume2 = readShort(bytes[i+2]);
                result.volumes.push({
                    time: new Date("2020-08-02T21:00:00.000+05:00").toISOString(),
                    volume: volume2
                });
                i+=2;
                break;
            case 0x04:
                // only an example :)
                result.longitude = readShort(bytes[i + 1]) * 3.56;
                result.latitude = readShort(bytes[i + 2]) * 12.56;
                i+=2;
                break;
            default:
                throw new Error("Invalid uplink payload: unknown id '" + bytes[i] + "'");
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

## Encoding and decoding downlinks

In the previous step we wrote and packaged a simple driver, which implemented the minimal functionality (i.e.: an uplink decode function).
Now lets extend that driver in order to encode and decode downlinks.

First, lets add a `encodDownlink(input)` function in `index.js`:

```javascript
function encodeDownlink(input) {
    var result = {};
    var bytes = [];
    if (typeof input.pulseCounterThreshold !== "undefined") {
        if (input.pulseCounterThreshold > 255) {
            throw new Error("Invalid downlink: pulseCounterThreshold cannot exceed 255");
        }
        bytes.push(0x00);
        bytes.push(input.pulseCounterThreshold);
    }
    if (typeof input.alarm !== "undefined") {
        bytes.push(0x01);
        if (input.alarm) {
            bytes.push(0x01);
        } else {
            bytes.push(0x00);
        }
    }
    result.bytes = bytes;
    result.fPort = 16;
    return result;
}
```

The `encodeDownlink(input)` function takes an object as parameter (see [here](../../README.md#downlink-encode)) containing the object (called `message`)
that will be encoded as a downlink. Then the function only checks for two objects inside `message` (`pulseCounterThreshold` and `alarm`)
and write their contents as well as their id as byte array.

We can also add a `decodeDownlink(input)` function. This function will allow us to decode the bytes as they are returned from
`encodeDownlink(input)` and return us the object that represents the downlink.

Add the following function in `index.js`:

```javascript
function decodeDownlink(input) {
    var result = {};
    var bytes = input.bytes;
    for (i = 0; i < bytes.length; i += 2) {
        switch (bytes[i]) {
            // Pulse counter threshold - 1 byte
            case 0x00:
                if (bytes.length < i + 2) {
                    throw new Error("Invalid downlink payload: index out of bounds when reading pulseCounterThreshold");
                }
                result.pulseCounterThreshold = bytes[i + 1];
                break;
            // Alarm - 1 byte
            case 0x01:
                if (bytes.length < i + 2) {
                    throw new Error("Invalid downlink payload: index out of bounds when reading alarm");
                }
                result.alarm = bytes[i + 1] === 1;
                break;
            default:
                throw new Error("Invalid downlink payload: unknown id '" + bytes[i] + "'");
        }
    }
    return result;
}
```

The function takes an `input` object (see [here](../../README.md#downlink-decode)) that will contain `bytes`. This simple driver will only
decode both objects as returned from `encodeDownlink(input)`: `pulseCounterThreshold` and `alarm`.

After adding `encodeDownlink(input)` and `decodeDownlink(input)` functions you can re-package your driver.

## Extracting points

Now that you have a driver that is able to decode uplinks and downlinks as well as encoding downlinks, lets go further
and extract points from our payloads.

As described [here](../../README.md#point), a thing can have zero or more attributes, and the attributes that you want to extract as points must
be first statically declared on the `package.json` file.

So let's add the points `temperature`, `humidity`, `pulseCounter`, and `airHumidity` points to our package (inside the `driver` object):

```json
{
    "name": "@actilitypub/my-driver",
    "version": "1.0.0",
    "description": "",
    "main": "index.js",
    "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1"
    },
    "author": "",
    "license": "ISC",
    "driver": {
        "description": "An example of a simple driver that is able to decode/encode data from temperature and humidity sensors with a pulse counter",
        "producerId": "actilitypub",
        "type": "thingpark-x-js",
        "private": false,
        "application": {
            "producerId": "my-app-producer",
            "moduleId": "my-app-module",
            "version": "1"
        },
        "points": {
            "temperature": {
                "unitId": "Cel",
                "type": "double"
            },
            "humidity": {
                "unitId": "%RH",
                "type": "double"
            },
            "pulseCounter": {
                "type": "int64"
            },
            "airHumidity": {
                "unitId": "%RH",
                "type": "double",
                "standardNaming": "unsupported"
            },
            "volume": {
                "unitId": "l",
                "type": "double"
            },
            "location": {
                "unitId": "GPS",
                "type": "object"
            }
        }
    }
}
```

As explained in [Point](../../README.md#point) section, a point can contain a `unitId`, which represents its unit (see [Units](../../UNITS.md)) and a `type` (see [Point types](../../README.md#point-types)). 
A `standardNaming` property can be added with the value `unsupported` in case the point uses a unit that does not follow the ontology.
In this case we have two `points` (or "containers") where our values will be grouped: 
- `temperature` which is of type `double` and has unit `Celsius`.
- `humidty` which is of type `double` and has unit `%RH`.
- `pulseCounter` which has type `int64` and has no unit because it is a counter.
- `airHumidty` which is of type `double` and has unit `%RH` and it is standard naming `unsupported`.
- `volume` which is of type `double` and has unit `l` but has several values with several time of the event.
- `location` which is of type `object` and its unit is `GPS`.

After having defined the points' "contract", we can now add the `extractPoints(input)` function that will implement it.

Add the following function in `index.js`:

```javascript
function extractPoints(input) {
    var result = {};
    if (typeof input.message.temp !== "undefined") {
        result.temperature = input.message.temp;
    }
    if (typeof input.message.humidity !== "undefined") {
        result.humidity = input.message.humidity;
    }
    if (typeof input.message.pulseCounter !== "undefined") {
        result.pulseCounter = input.message.pulseCounter;
    }
    if (typeof input.message.humidity !== "undefined") {
        result.airHumidity = input.message.humidity;
    }
    let volumes = input.message.volumes;
    if (typeof volumes !== "undefined") {
        result.volume = [];
        volumes.forEach(element => {
            result.volume.push({
                eventTime: element.time,
                value: element.volume
            })
        });
    }
    if (typeof input.message.longitude !== "undefined" && typeof input.message.latitude !== "undefined") {
        result.location = [input.message.longitude, input.message.latitude];
    }
    return result;
}
```

Here, we simply retrieve the value from the input, for example the `temperature` value is `input.message.temp` to follow the naming convention of the ontology.

When the point refers to several values, its value can be an array.

In case of `location` point, the point is represented in an array: `[longitude, latitude]` as shown in the example above.

The names of points extracted must match the ones in `package.json` to be completed and verified with the `unitId` and `type`.

## Returning errors

As you have noticed, only one kind of error throw is possible when writing Thingpark-X IoT Flow drivers:

```javascript
throw new Error(message);
```

Where `message` is the string that will be catched by the IoT Flow framework.

_Note: All throws that do not throw an `Error` object will be ignored by the IoT Flow framework._

## Testing

We use [Jest](https://jestjs.io/) as our testing framweork.

_Note: when testing, you will need to export the functions that you test (unless of course you copy / paste the functions into the testing file). This is *not* needed in your driver if not tested_.

To exports functions, you can add the following at the end of the `index.js` file:

```javascript
exports.decodeUplink = decodeUplink;
exports.decodeDownlink = decodeDownlink;
exports.encodeDownlink = encodeDownlink;
exports.extractPoints = extractPoints;
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

### Create files

You can use our files `driver-examples.spec.js` and `driver-errors.spec.js` provided in our driver example [here](./test) to test your payload examples and errors to be thrown.

When using these two files, you don't have to make any change inside. Except respecting the folder names of `examples` and `errors` as explained below.

You can create a folder named `test` and copy the test files inside.

**Note:** If your driver does not support a function `encodeDownlink`, all you have to do is to comment/remove the part related to `encodeDownlink` testing inside these two files.

### Test that the errors you should throw are actually thrown

In order to facilitate the errors testing process, we provide the file `driver-errors.spec.js`.

However, this file needs to have errors examples to run the tests automatically. This file will automatically get all your errors examples and test them using [Jest](https://jestjs.io/).

#### Create errors examples

These errors examples has a similar concept of the payloads examples.

To benefit from the automation of the tests, you must create a directory in the driver package named `/errors`. Inside, the name of each error examples file must follow the pattern `*.errors.json`. You can split and organize the errors files according to your own logic.

**Note:** These errors examples will be only used for unit tests and will not be stored in our framework.

An `*.errors.json` file contains an array of several uplink/downlink errors examples.

##### decodeUplink/decodeDownlink error example

The error example used to test `decodeUplink`/`decodeDownlink` function is an object represented by the following json-schema:

```json
"description": {
        "description": "the description of the error example",
        "type": "string",
        "required": true
    },
    "type": {
        "description": "the type of the example",
        "type": "string",
        "enum":  ["uplink", "downlink"],
        "required": true
    },
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
    "time": {
        "description": "the uplink/downlink message time",
        "type": "string",
        "format": "date-time",
        "required": false
    },
    "error": {
        "description": "the error that should be thrown in case of wrong input",
        "type": "string",
        "required": true
    }
```

##### encodeDownlink/extractPoints error example

The error example used to test `encodeDownlink`/`extractPoints` function is an object represented by the following json-schema:

```json
"description": {
        "description": "the description of the error example",
        "type": "string",
        "required": true
    },
    "type": {
        "description": "the type of the example",
        "type": "string",
        "enum":  ["uplink", "downlink"],
        "required": true
    },
    "fPort": {
        "description": "the uplink/downlink message LoRaWAN fPort",
        "type": "number",
        "required": true
    },
    "time": {
        "description": "the uplink/downlink message time",
        "type": "string",
        "format": "date-time",
        "required": false
    },
    "data": {
        "description": "the decoded uplink/downlink view as an input to the function",
        "type": "object",
        "required": true
    },
    "error": {
        "description": "the error that should be thrown in case of wrong input",
        "type": "string",
        "required": true
    }
```

**Important:** `description` field must be unique.


### Test the correct cases of your driver

In order to facilitate the use cases testing process, we provide the file `driver-examples.spec.js`.

This file will automatically get all your examples that match the pattern `*.examples.json` inside the directory `/examples` and test them using [Jest](https://jestjs.io/).

### Execute tests with coverage

To execute tests, you must use the following command:

```shell
npm test
```

This command will give a full report about the coverage of your tests. The most important value in this report is the
percentage of the statements' coverage which appears under `stmts`.

To execute a specific test, you can add the name of the test file in the command:

```shell
npm test driver-examples.spec.js
```

### Add Json Schemas 

To provide the json schemas of your driver, you must create the directory `/json-schemas`. 

Under the directory `/json-schemas`, create a file named `uplink.schema.json` and add the following json schema that describes the structure of the `decodeUplink` output:

```json
{
  "$schema": "http://json-schema.org/draft-04/schema#",
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
    },
    "longitude": {
      "type": "number"
    },
    "latitude": {
      "type": "number"
    }
  },
  "additionalProperties": false
}
```

Under the same directory `/json-schemas`, create a file named `downlink.schema.json` and add the following json schema that describes the structure of the `decodeDownlink` output:

```json
{
  "$schema": "http://json-schema.org/draft-04/schema#",
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