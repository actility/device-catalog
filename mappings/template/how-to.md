# BACnet Integration

## Introduction


## Creating the Mapping

Start by copying the [template-mapping.xlsx file](./template-mapping.xlsx) into [the mappings folder](../../mappings).
All mappings must be found in the mappings folder.

Their naming format must follow one of these 2 patterns:
* {vendorId}-mapping.xlsx
* {vendorId}-{moduleId}-mapping.xlsx

Make sure to replace {vendorId} with the ID of your vendor and {moduleId} with the module ID found in your modelId (vendorId:moduleId:1 - it is the middle field).


## Structure

This document presents the XLSX format that must be used to define a mapping file for BACnet/Modbus drivers.

The XLSX file has three sections:
* General section: defines global parameters
* Models section: defines model filters that must be used to precisely select which model a point belongs to
* Objects section: defines the list of points that should be exposed when creating the device

### General section
* version: The file format version. It must be 1.0 for now
* max_downlink_commands: The number of downlink commands that can be aggregated in a single LoRaWAN downlink packet. The recommended value is 5.

### Models section
Some drivers are common to multiple models, but some points are only available for specific models. This section defines filters that are used during point definition in order to precisely define which model supports each point.
There must be one model scope per line; each filter is composed of a name and a list of models. You can omit the selector field (leave it empty) for a selector that matches nothing (certainly used later).
You should add as many entries as needed, then associate each entry with one or several models, identified by their module-id.

The model syntax is:
• {mId: <your modelId>}[,{...}]

ModelId "mId" corresponds to the middle string of the ModelID field as defined for each model (in model.yaml) on Github: https://github.com/actility/device-catalog/tree/main/vendors (then browse to your manufacturer name).

#### Example:
If modelID is “vendor:tempo:5”
-> Put {mId: tempo}


### Object section

#### id field

“id” must be unique for a given access mode. For instance, setting ‘Temperature’ for 2 ids assigned to “R” access mode should be forbidden.
This is the id of the property that will be exposed, if the property is nested inside another element, you must separate the path using ':'
##### A decoded payload containing :
~~~
    "payload": {
        "messageType": "EVENT",
        "onDemand": true,
        "deviceConfiguration": {
            "mode": "PERMANENT_TRACKING"
        },
        "eventType": "GEOLOC_START"
    }
~~~
For 'messageType' the id will be 'messageType', but for 'mode' which is nested inside deviceConfiguration, the id must be 'deviceConfiguration:mode'.


#### name field
This is a friendly name for that field, this will be exposed in the GUI during mapping field selection.
Like for “id”, the “name” field should be unique for a given access mode.


#### value field
This is the default value at point creation.


#### type field
This specifies the type of the field, 3 values are authorized:
• 'number' for all numeric values, for BACnet, this will be converted to ANALOG object
• 'boolean' for all true/false values, for BACnet, this will be converted to BINARY object
• 'string' for all string values, for BACnet, this will be converted to CHARACTER STRING VALUE object.


#### access mode field
This specifies the direction of the point, 3 values are authorized:
* 'R' for READ-only properties, for BACnet this specified that the point will be an ANALOG INPUT/ BINARY INPUT/ CHARACTER STRING VALUE, the point cannot be writable through commands, uplinks packet will update the values.
* 'W' for WRITE-only properties, for BACnet this specified that the point will be an ANALOG OUTPUT/ BINARY OUTPUT/ CHARACTER STRING VALUE, the point is writable through commands, changing its value through commands will generate a LoRaWAN downlink frame.
* 'RW' for READ/WRITE properties, for BACnet this specified that the point will be an ANALOG VALUE/ BINARY VALUE/ CHARACTER STRING VALUE, the point is writable through commands, uplinks packet will update the values , changing its value through commands will generate a LoRaWAN downlink frame.


#### value_type field
This field specifies the encoding format for a numeric point. The following types can be used :
* for number type: UINT8, INT8, UINT16, INT16, FLOAT
* for boolean type: BOOL
* for string type: STRING
This field is specifically relevant for Modbus, it is currently not used in BACnet mapping.


#### precision field
This field is relevant only for 'number' type, it defines the relevant decimal precision that must be considered.


#### units field
This field is only for 'number' type, the table below shows the string that can be used (see the first column) and the BACnet corresponding unit:

| Unit      | Corresponding BACnet Mapping                  |
|-----------|-----------------------------------------------|
| A         | BACNET.AMPERES                                |
| bar       | BACNET.BARS                                   |
| Bq        | BACNET.BECQUERELS                             |
| cd        | BACNET.CANDELAS                               |
| cd/m2     | BACNET.CANDELAS_PER_SQUARE_METER              |
| Cel       | BACNET.DEGREES_CELSIUS                        |
| cm        | BACNET.CENTIMETERS                            |
| m3        | BACNET.CUBIC_METERS                           |
| m3/h      | BACNET.CUBIC_METERS_PER_HOUR                  |
| m3/s      | BACNET.CUBIC_METERS_PER_SECOND                |
| dB        | BACNET.DECIBELS                               |
| dBm       | BACNET.DECIBELS_MILLIVOLT                     |
| deg       | BACNET.DEGREES_ANGULAR                        |
| Far       | BACNET.DEGREES_FAHRENHEIT                     |
| F         | BACNET.FARADS                                 |
| GW        | BACNET.MEGAWATTS                              |
| g         | BACNET.GRAMS                                  |
| Gy        | BACNET.GRAY                                   |
| hPa       | BACNET.HECTOPASCALS                           |
| H         | BACNET.HENRYS                                 |
| hertz     | BACNET.HERTZ                                  |
| hour      | BACNET.HOURS                                  |
| J         | BACNET.JOULES                                 |
| K         | BACNET.DEGREES_KELVIN                         |
| kg        | BACNET.KILOGRAMS                              |
| km        | BACNET.KILOMETERS                             |
| km/h      | BACNET.KILOMETERS_PER_HOUR                    |
| kPa       | BACNET.KILOPASCALS                            |
| kW        | BACNET.KILOWATTS                              |
| kWh       | BACNET.KILOWATT_HOURS                         |
| l         | BACNET.LITERS                                 |
| l/s       | BACNET.LITERS_PER_SECOND                      |
| lm        | BACNET.LUMENS                                 |
| lx        | BACNET.LUXES                                  |
| MW        | BACNET.MEGAWATTS                              |
| MWh       | BACNET.MEGAWATT_HOURS                         |
| m         | BACNET.METERS                                 |
| m/s       | BACNET.METERS_PER_SECOND                      |
| m/s2      | BACNET.METERS_PER_SECOND_PER_SECOND           |
| ug        | BACNET.MILLIGRAMS                             |
| ug/m3     | BACNET.MICROGRAMS_PER_CUBIC_METER             |
| um        | BACNET.MICROMETERS                            |
| uS/cm     | BACNET.MICROSIEMENS                           |
| mA        | BACNET.MILLIAMPERES                           |
| mbar      | BACNET.MILLIBARS                              |
| ml        | BACNET.MILLILITERS                            |
| mm        | BACNET.MILLIMETERS                            |
| mm/s      | BACNET.MILLIMETERS_PER_SECOND                 |
| ms        | BACNET.MILLISECONDS                           |
| mS/cm     | BACNET.MILLISIEMENS                           |
| mV        | BACNET.MILLIVOLTS                             |
| minute    | BACNET.MINUTES                                |
| N         | BACNET.NEWTON                                 |
| ntu       | BACNET.NEPHELOMETRIC_TURBIDITY_UNIT           |
| Ohm       | BACNET.OHMS                                   |
| ppb       | BACNET.PARTS_PER_BILLION                      |
| ppm       | BACNET.PARTS_PER_MILLION                      |
| Pa        | BACNET.PASCALS                                |
| %         | BACNET.PERCENT                                |
| %RH       | BACNET.PERCENT_RELATIVE_HUMIDITY              |
| pH        | BACNET.PH                                     |
| rad       | BACNET.RADIANS                                |
| rpm       | BACNET.REVOLUTIONS_PER_MINUTE                 |
| s         | BACNET.SECONDS                                |
| S         | BACNET.SIEMENS                                |
| S/m       | BACNET.SIEMENS_PER_METER                      |
| Sv        | BACNET.SIEVERTS                               |
| m2        | BACNET.SQUARE_METERS                          |
| T         | BACNET.TESLAS                                 |
| VA        | BACNET.VOLT_AMPERES                           |
| VAh       | BACNET.VOLT_AMPERE_HOURS                      |
| var       | BACNET.VOLT_AMPERES_REACTIVE                  |
| V         | BACNET.VOLTS                                  |
| W         | BACNET.WATTS                                  |
| W/m2      | BACNET.WATTS_PER_SQUARE_METER                 |
| Wh        | BACNET.WATT_HOURS                             |
| Wb        | BACNET.WEBERS                                 |
|           | BACNET.NO_UNITS                               |


#### cov_increment field
This field is only for 'number' type, it gives the default BACnet COV (Change Of Value) INCREMENT value for that point.


#### min_value /max_value fields
This fields are RFU, they give the minimum / maximum value that the point measurement can take.

#### models field
This is the model scope that the point applies to. If that field is empty, the point will be ignored.


#### description field
This is the string that will be exposed as description in the BACnet description property


### Notes about drivers

BACnet adapter downlinks are encoded using drivers; for that, all the drivers must support the encodeDownlink method that takes an object and encode the downlink as a Buffer (array of bytes) ready to be sent in LoRaWAN.

#### example

~~~
function encodeDownlink(input) {

    var bytes = [];

    var key, i;

    if(!input.hasOwnProperty('data')){
        input.data = input
    }

    for (key in input.data) {
        if (input.data.hasOwnProperty(key)) {
            switch (key) {
                case "setKeepAlive":
                bytes.push(0x02);
                bytes.push(input.data.setKeepAlive);
                break;
    ...

    return {
        bytes: bytes,
        fPort: 1,
        warnings: [],
        errors: []
    }
}


exports.encodeDownlink = encodeDownlink;
~~~

