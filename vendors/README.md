# Device Catalog

This documentation explains how the Actility's Device Catalog is composed.

## 1. Devices catalog structure
Each vendor has his own Device Catalog composed of a set of files and directories:

**Files**:
```python
1. "vendor.yaml": Information about the vendor
2. "logo.png": Logo of the vendor
```

**Directories**
```python
1. "models": Directory contains model information of all devices.
2. "profiles": Directory contains LoRaWAN network characteristics of all devices.
3. "drivers": Directory contains the drivers of all devices.
```

> All files and folders must be named in lowercase and seperated by dashes '`-`' only. 
> The separator underscore '`_`' is reserved for [versioning](#2-versioning).
> Note: the text between quotation marks ('<' and '>') are free to use, but we recommend the usage of ID.

```_
Device catalog
    ├── <Vendor Name #1>
    │      ├── vendor.yaml                       # Vendor information
    │      ├── logo.png                          # Logo of the vendor
    │      ├── models
    │      │      ├── <ModelId #1>
    │      │      │      ├── model.yaml          # Information about the device
    │      │      │      └── image.png           # Image of the device
    │      │      ├── <ModelId #2>
    │      │      │      ├── model.yaml
    │      │      │      └── image.png
    │      │      └── ... 
    │      ├── profiles
    │      │      ├── <ModelId #1>
    │      │      │      ├── <profileId #1>.yaml    # Specific LoRaWAN characteristics for this ISMBand and model of device
    │      │      │      ├── <profileId #2>.yaml          
    │      │      │      └── ...
    │      │      ├── <ModelId #2>
    │      │      │      ├── <profileId #1>.yaml 
    │      │      │      ├── <profileId #2>.yaml 
    │      │      │      └── ... 
    │      │      └── ... 
    │      └── drivers
    │             ├── <ModelId #1>
    │             │      ├── driver.yaml         # Information about your driver
    │             │      └── (driver package)    # Including code, test, examples
    │             ├── <ModelId #2>
    │             │      ├── driver.yaml
    │             │      └── (driver package) 
    │             └── ... 
    └── <Vendor Name #2>
```
## 

### 1.1 Vendor
All vendors information are stored in the root directory dedicated to a vendor.

The file `vendor.yaml` contains:
```yaml
# ID of the vendor to be used as an internal reference for Actility vendors.
# Define your own ID following this rule: Maximum of 8 characters in lowercase. 
id: abeeway
# Official/commercial name of the vendor to be used as a label.
name: Abeeway
# Simple description of the vendor. Maximum 500 characters. Special characters are not allowed ('\n', '\t', '\r', ect...).
description: Abeeway offers a complete low-power geolocation solution for the Internet of Things, based on a  flexible multi-technology location system optimized for low-power LoRaWAN communication, using GPS, own breakthrough Low Power GPS (LP-GPS) and WiFi sniffing; featuring the highest-performance tracking devices available on the market.

# LoRa-Alliance Vendor ID used for QR code https://lora-alliance.org/wp-content/uploads/2020/10/LoRa_Alliance_Vendor_ID_for_QR_Code_02142022.pdf. It consists of 4 upper-case hexadecimal characters.
loRaAllianceVendorID: 000E

# URL to the company website.
websiteURL: https://www.abeeway.com/
# URL to the company marketplace.
marketplaceURL: https://www.abeeway.com/products/
# Priority for an email or a phone number, otherwise an address.
contact: abeeway.support@actility.com
```

The file `logo.png` presents the logo of the vendor, it should be:
- named `logo.png`,
- **.png** format,
- _256_ x _256_ pixels size,
- transparent or white background.
## 

### 1.2 Model
Each model represents a specific product and a particular product version of a device. A model identifies a device with a particular hardware or casing version.

The file `model.yaml` contains:
```yaml
# Commercial name of the model
name: Micro Tracker
# Functional description of the product. Maximum 500 characters.
description: The Abeeway Micro Tracker is a small size multi-mode tracker combining GPS/Low power GPS, WIFI, LoRaWAN, BLE radios with embedded sensors to support accurate outdoor and indoor geolocation. LoRaWAN 1.0.2 revB - class A - European deployments.
# Comma-separated list of regional profiles supported by this model: eu868, us915, as923, au915, eu433, in865, kr920, ru864, cn470.
ISMbands: eu868,us915,as923,au915
# Logo of the model
logo: abeeway-micro-tracker.png
# ID(s) of the profile that defines the LoRaWAN characteristics of this model.
deviceProfileId:
    - eu868_1.0.2revB_classA
    - us915_1.0.2revB_classA
    - as923_1.0.2revB_classA
    - eu868_1.0.2revB_classC

# You may optionally customize any of the following settings to override the generic value set in LoRaWAN device profiles associated with your model. Leave empty if you want to keep the generic Device Profile settings.
# Maximum device TX Conducted output power in dBm.
maxTxPower:
# Minimum device TX Conducted output power in dBm.
minTxPower:
# Maximum device TX Radiated output power in dBm. 
maxTxEIRP:
# Minimum device TX Radiated output power in dBm. 
minTxEIRP:
# Typical mobility profile of the device. Possible values are 'near_static' (also valid for static devices), 'walking_speed', 'vehicular_speed' 
# or 'random' (not known, changes over time).
motionIndicator:

# Is your device certified by the LoRa Alliance? Possible values: true, false.
LoRaWANCertified: true 
# <vendorId>:<modelId>:<modelVersion> // [RSS] Is it really needed?
# (8 char max):(16 char max):(no limit)
modelId: abeeway:asset-tracker:2
# <vendorId>:<protocolId>:<modelVersion> (optional) // [RSS] To be renamed 'driverId'?
protocolId: abeeway:micro-tracker:2
# DataSheet URL (optional)
specificationURL: https://www.abeeway.com/wp-content/uploads/2022/07/Abeeway_Products_Micro_2022-v2.4.pdf
# User Guide URL (optional)
userGuideURL: https://docs.thingpark.com/thingpark-location/B-Feature-Topics/MicroTracker_C/
# Available sensors following Actility's ontology listed at the end of this guide.
sensors:
    - temperature
    - location
    - batteryVoltage
```


The file `image.png` presents the image of the device, it should be:
- named `image.png`,
- **.png** format,
- _256_ x _256_ pixels size,
- transparent or white background.
## 

### 1.3 Profile
A profile contains the technical LoRaWAN characteristics used by the device, including the LoRaWAN L2 and PHY versions, the RX1/RX2 settings used during boot stage until they are eventually updated by the Network Server through appropriate MAC commands etc.
> Start from the predefined templates to build your own profiles, if your devices do not follow the default LoRaWAN configuration.
> All generic profile templates are contained on a directory named `generic` on root. Pick the right template based on the below information:
> - ISMBand (eu868, us915, as923, ...)
> - LoRaWAN MAC version (1.0.2, 1.0.3b, ...)
> - LoRaWAN Regional Parameters' version (1.0.2revA, 1.0.2revB, 1.0.2revC, RP2-1.0.1, RP2-1.0.2, RP2-1.0.3...)
> - LoRaWAN Class (A, B or C).

Once you select a generic template, you need to create a file named with the Device ID.
This ID of your profile should be used on your `model.yaml` on the field `deviceProfileId`. (See previous chapter)

Example: `abeeway_eu868_1.0.2revB_classA.yaml`

The file `<Device ID>.yaml` contains:
```yaml
# ID that represents the profile of your device model.
# Recommended practice: <vendorID> (lowercase) + '_' + <ISM band> + '_' <LoRaWAN L2 & PHY versions> + '_class' + <LoRaWAN class A, B or C> 
id: abeeway_eu868_1.0.2revB_classA
# LoRaWAN class of the Device: Possible values: [ A, B, C ]
# 'A': Class A (Bi-directional end-devices with downlink listening only after uplink transmission)
# 'B': Class B (Bi-directional end-devices with downlink listening on predefined synchronized pingslots)
# 'C': Class C (Bi-directional end-devices with permanent downlink listening)
loRaWANClass: A
# Comma-separated list of regional profiles supported by this device. Possible values are eu868, us915, as923, au915, eu433, in865, kr920, ru864, cn470.
ISMbands: eu868,in865,ru864
# Typical mobility profile of the device. Possible values are 'near_static' (also valid for static devices), 'walking_speed', 'vehicular_speed'
# or 'random' (not known, changes over time).
motionIndicator: random

mac:
    # Activation modes supported by the device (put true where applicable).
    # (ABP)
    activationByPersonalization: false
    #(OTAA)
    overTheAirActivation: true
    # Supported version of the LoRaWAN MAC (Layer-2) specification. Possible values are '1.0.0/1.0.1', '1.0.2', '1.0.3', '1.0.4', '1.1'
    loRaWANMacVersion: 1.0.4
    # Supported version of the LoRaWAN regional parameters (PHY) specification. Possible values are '1.0.2revA', '1.0.2revB', '1.0.2revC', 
    # '1.0.3revA', 'RP2-1.0.0', 'RP2-1.0.1', 'RP2-1.0.2', 'RP2-1.0.3', 'RP2-1.0.4', 'RP2-1.0.5'.
    regionalParameterVersion: 1.0.2revB

    devicesTxPowerCapabilities:
        # Minimum device TX Conducted output power in dBm.
        minTxPower:
        # Maximum device TX Conducted output power in dBm.
        maxTxPower: 14
        # Minimum device TX Radiated output power in dBm.
        minTxEIRP: 
        # Maximum device TX Radiated output power in dBm.
        maxTxEIRP: 16

    uplinkFrameRepetition: 
        # Maximum number of transmissions per uplink frame, supported by the device. 
        maxNbTrans: 15
        # How many uplink transmissions does the device use in Confirmed mode if it doesn’t receive any DL ACK?
        maxRedundancyForConfirmedUL: 5

# The following section defines the default settings used by the device during iniial boot stage. Leave empty if your device respects the 
# default values indicated by LoRaWAN Regional Parameters (PHY) specification. Personalize fields only when different from default PHY values.
bootSettings: 
    # Delay between the end of uplink transmission and the start of downlink RX1 slot, in milliseconds. Refer to 'receiveDelay1' in LoRaWAN 
    # Specification.
    rx1Delay: 1000
    # RX1 data rate offset, defining the offset between uplink data rate and the corresponding downlink data rate used for RX1 slot.
    rx1DROffset: 0
    # Rx2 DataRate, used to send DL packets over RX2 slot. Note: Data Rate encoding is region-specific, see the applicable LoRaWAN Regional 
    # Profile.
    rx2DataRate: 0
    # Rx2 Frequency expressed in MHz, used to send DL packets over RX2 slot.
    rx2Frequency: 869.525
    # Default data rate used for Class B ping slots. Note: Data Rate encoding is region-specific, see the applicable LoRaWAN Regional Profile.
    pingSlotChannelDataRate: 3
    # Default frequency (in MHz) used for Class B ping slots.
    pingSlotChannelFrequency: 869.525
    # Default downlink dwell time (valid only for AS923 and AU915 profiles). Possible values 0 (no limit) or 1 (400ms).
    downlinkDwellTime: 0
    # beaconFrequency is the boot value used by the Device to set the beacon broadcast frequency.
    # This frequency is then aligned by the Network Server to the target value set in the RF region."
    beaconFrequency: 
    # Default uplink dwell time (valid only for AS923 and AU915 profiles). Possible values 0 (no limit) or 1 (400ms).
    uplinkDwellTime: 1

# Which MAC commands are NOT supported by your device?
# Put 'true' only if a command is not supported.
unsupportedMACCommands: 
    linkADRReqAns: false
    devStatusReqAns: false
    joinRequestAccept: false
    dutyCycleReqAns: false
    linkCheckReqAns: false
    rxParamSetupReqAns: false
    rxTimingSetupReqAns: false
    newChannelReqAns: false
    dlChannelReqAns: false
    txParamSetupReqAns: true
    pingSlotChannelReqAns: true
    pingSlotInfoReqAns: false
    deviceTimeReqAns: false
    beaconFreqReqAns: true

    # Does your device support [Technical Recommendation for LoRaWAN L2 1.0.x Join Security] recommending implemeting the DevNonce as a counter for 
    # OTAA devices? See https://lora-alliance.org/resource_hub/technical-recommendations-for-preventing-state-synchronization-issues-around-lorawan-1-0-x-join-procedure/
    # Possible values: true, false. This field is automatically forced to true for LoRaWAN MAC versions 1.0.4 and 1.1.
    devNonceCounterBased: false

# ProfileID as specified by LoRa Alliance in https://lora-alliance.org/wp-content/uploads/2020/10/LoRa_Alliance_Vendor_ID_for_QR_Code_02142022.pdf. 
# This ID consists of 8 upper-case hexadecimal characters, 4 characters for VendorID + 4 characters for VendorProfileID.
lorawanDeviceProfileID: 000E0000

```
## 

### 1.4 Driver
A driver decodes binary payload to Json object and encodes Json object to binary, following the recommendations provided by LoRa-Alliance.
This directory contains, for each device model, all the needed files for a driver.
It could be generic for a part of all your devices or device-specific.
A driver could either be public (Open-source) or private and not exposed (contact us in this case at tpx-iot-flow@actility.com).

This part of documentation describes only the expected metadata related to a driver.
A detailed [**guide**](https://github.com/actility/thingpark-iot-flow-js-driver) helps you to create the driver following Actility and LoRa-Alliance recommandations.

The file `driver.yaml` contains:
```yaml
# Formal driver name
name: asset tracker js driver
# Simple description of the driver functionalities
description: Generic driver of all Abeeway trackers.
# Company that developed the driver
developedBy: Abeeway
# Email of the developer
developerEmail: abeeway.support@actility.com
# In case of a driver per model: `<vendorId>:<protocolName>:<protocolVersion>`
# In case of one driver for all models: `<vendorId>:generic:<protocolVersion>`
protocolId: abeeway:micro-tracker:2
```
> Pay attention when choosing a `protocolId`, this information is important for establishing a link between the model and the expected driver.
## 

### 2. Versioning

There may be several versions for the same model of device, so if this is the case, you will use the same architecture described above, adding the versions. 
To be able to specify without causing duplicates, you should put an underscore ("_") between model name and version.
You **SHALL** respect this naming convention for the version: v1, v2, v3, etc.

> Note: when the version is not specified, it is considered to be v1.
> A new model version2 could continue to use a driver v1, the `protocolId` do the link between model and driver, whatever the version is.
> Same remark between model and profile, the `deviceProfileId` still the link between both. 

```_
Device catalog
    ├── <Vendor Name #1>
    │      ├── vendor.yaml                       # Vendor information
    │      ├── logo.png                          # Logo of the vendor
    │      ├── models
    │      │      ├── <ModelId #1>
    │      │      │      ├── model.yaml          # Information about the device
    │      │      │      └── image.png           # Image of the device
    │      │      ├── <ModelId #2>_v<version>
    │      │      │      ├── model.yaml
    │      │      │      └── image.png
    │      │      └── ... 
    │      ├── profiles
    │      │      ├── <ModelId #1>
    │      │      │      ├── <profileId #1>.yaml    # Specific LoRaWAN characteristics for this ISMBand and model of device
    │      │      │      ├── <profileId #2>.yaml          
    │      │      │      └── ...
    │      │      ├── <ModelId #2>_v<version>
    │      │      │      ├── <profileId #1>.yaml 
    │      │      │      ├── <profileId #2>.yaml 
    │      │      │      └── ... 
    │      │      └── ... 
    │      └── drivers
    │             ├── <ModelId #1>
    │             │      ├── driver.yaml         # Information about your driver
    │             │      └── (driver package)    # Include code, test, examples, errors
    │             ├── <ModelId #2>
    │             │      ├── driver.yaml
    │             │      └── (driver package) 
    │             └── ... 
    └── <Vendor Name #2>
```

The structure is the same as the one presented before, the only added information is the version in the naming.

# JavaScript driver developer guide

This project describes how to build a javascript driver for the ThingPark X IoT Flow framework.

A driver allows to easily integrate new devices in ThingPark X IoT Flow. With it you define
how to decode uplinks/downlinks, how to encode downlinks and how to extract points.

-   [IoT Flow JavaScript driver developer guide](#IoT-Flow-JavaScript-driver-developer-guide)
    - [Concepts](#concepts)
        -   [Driver](#driver)
        -   [Thing](#thing)
        -   [Point](#point)
        -   [Application](#application)
        -   [Uplink](#uplink)
        -   [Downlink](#downlink)
    - [API](#API)
        - [Driver definition](#driver-definition)
        - [Driver functions](#driver-functions)
            - [Uplink decode](#uplink-decode)
            - [Downlink encode](#downlink-encode)
            - [Downlink decode](#downlink-decode)
            - [Points extraction](#points-extraction)
        - [Payload examples](#payload-examples)
        - [Json schemas](#json-schemas)
    - [Packaging](#packaging)
    - [Testing](#testing)
    - [Templates](#templates)
        - [Simple driver](#simple-driver)
        - [Advanced driver](#advanced-driver)
    - [Submission](#submission)

## Concepts

### Driver

The `driver` is the piece of code responsible to decode uplinks/downlinks and to encode downlinks for a single device
communication protocol. It is the core part of the IoT Flow framework to interact with new devices.

If a device is exposing several incompatible communication protocols, then several drivers needs to be implemented,
one for each.

The programming language used in this codec is the JavaScript which is a lightweight, interpreted, just-in-time compiled programming language with first class functions.

More precisely, the JavaScript ES5 is used as it is simple and widely supported in most communities.

### Thing

The `thing` is the cloud representation of a device that can interact with the IoT Flow framework. It can be of two
kinds:

-   A device: a physical device that uses a communication protocol (for example LoRaWAN).
-   A "virtual" device: some application running on an appliance that acts like a physical device or which represents an
    aggregated view of several devices (for example an aggregated temperature).

### Point

The `point` represents a value that could be extracted from a `thing`. It maps directly with a sensor, an
actuator or a configuration variable. It is defined by an `id`, a `unitId` and a `type`.
The `point` extracted by the driver is composed of a list of point in values (although most of the time there is only one of them).

One of two properties `record` or `records` must present according to your needs.

`record` that represents the actual value of the point. 
The `record` can be a string, number, or an array. 
There is two cases where a record can be an array:
- The point extracted contains different values.
- The point extracted define a geolocation value where the first element of the array is the latitude, and the second is the longitude.

`records` represents different values of the same point, in different timestamp.
`records` is an array of `object` where each object has a mandatory `eventTime` and a `value` .
The `value` represents the actual value of the point at the given `eventTime`.


The points defined in each driver must follow a predefined ontology of units if exist. You can find more information in [driver definition](#driver-definition) section.

### Application

The `application` identifies a communication protocol exposed by a device. It is composed of 3 information:

-   `producerId`: who specifies this communication protocol, could be either a manufacturer or an entity defining a
    public standard. **This value must be agreed with Actility**.
-   `moduleId`: an identifier for the communication protocol name. This value is decided by the manufacturer or the
    entity providing the public standard.
-   `version`: the communication protocol version. This value is decided by the manufacturer or the entity providing
    the public standard. It must only identify the major version of the protocol.

This information is important for ThingPark X IoT Flow framework as it allows to identify the protocol exposed by
a device especially when several are possible for a single one.

Here are some examples explaining how the `application` works (we assume we are the acme company providing a fictive
humidity sensor):

#### Example 1

Our humidity sensor is exposing a proprietary communication protocol with any firmware strictly lower than v3. Starting
from v3 the device is now exposing a standard ZCL (ZigBee Cluster Library) payload.

In this case the `application` for pre v3 firmware devices would be:

-   `producerId`: `acme` (decided with Actility).
-   `moduleId`: `generic` (any name convenient to identify the protocol for `acme` company)
-   `version`: `1` (major version of the acme generic protocol).

For post v3 firmware devices the protocol would be:

-   `producerId`: `zba` (decided with Actility to identify the ZigBee Alliance)
-   `moduleId`: `zcl` (name of the protocol in the ZigBee Alliance)
-   `version`: `1` (major ZCL version)

#### Example 2

Our humidity sensor is exposing a proprietary communication protocol with any firmware strictly lower than v4. Starting
from v4 the device is now exposing a new incompatible proprietary communication protocol. It means the new
payload cannot be decoded by the same `driver` even using the payload length or the LoRaWAN context like the `fPort` or
the future `profileID`.

A possible example for this would be:

-   the pre v4 uplink payload is a single byte with an integer value from 0 to 100 representing the humidity in %RH
-   the post v4 uplink payload is a single byte with an integer value from 0 to 254 representing the humidity in %RH
    (from 0 to 100). Therefore, to get the %RH the read value must be multiplied by 100 and divided by 254.

In this example, there is no possible way to know in which case we are when receiving the uplink even looking at the
payload length or the LoRaWAN context. Therefore, we need to declare two `application` and by construction two `driver`.

So for this example, the `application` for pre v4 firmware devices would be:

-   `producerId`: `acme` (decided with Actility).
-   `moduleId`: `generic` (any name convenient to identify the protocol for `acme` company).
-   `version`: `1` (major version of the acme generic protocol).

For post v4 firmware devices the protocol would be:

-   `producerId`: `acme` (decided with Actility).
-   `moduleId`: `generic` (any name convenient to identify the protocol for `acme` company).
-   `version`: `2` (major version of the acme generic protocol).

### Uplink

A packet sent from the `thing` to the cloud.

### Downlink

A packet sent from the cloud to the `thing`.

## API

A driver is composed of 2 parts:

-   a static configuration defining the `driver` metadata.
-   a javascript code made of four possible functions to perform the encoding and decoding tasks.

### Driver definition

The driver definition must be declared in the driver's NPM's `package.json`.

This is the first condition for a driver to be valid: being an NPM package that includes a `driver` object in its
`package.json` which must declare at least a `producerId`, a `type` and an `application`.

Here is an example of a `driver` definition:

```json
{
  "name": "@actility/example-driver",
  "version": "1.0.0",
  "description": "My example driver",
  "specification": "https://github.com/actility/thingpark-iot-flow-js-driver/blob/master/examples/simple-driver/README.md",
  "deviceImageUrl": "https://market.thingpark.com/media/catalog/product/cache/e0c0cc57a7ea4992fdbd34d6aec6829f/r/o/roximity-detection-_-contact-tracing-starter-kit.jpg",
  "manufacturerLogoUrl": "https://www.actility.com/wp-content/uploads/2019/04/Actility_LOGO_color_RGB_WEB.png",
  "providerLogoUrl": "https://www.actility.com/wp-content/uploads/2019/04/Actility_LOGO_color_RGB_WEB.png",
  "main": "index.js",
  "scripts": {
    "test": "jest --collectCoverage"
  },
  "driver": {
    "description": "An example driver that is able to decode/encode data from temperature and humidity sensors with a pulse counter",
    "producerId": "actility",
    "type": "thingpark-x-js",
    "private": false,
    "application": {
      "producerId": "myProducer",
      "moduleId": "myModule",
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
      "airHumidity": {
        "unitId": "%RH",
        "type": "double",
        "standardNaming": "unsupported"
      },
      "pulseCounter": {
        "type": "int64"
      },
      "location": {
        "unitId": "GPS",
        "type": "object"
      }
    }
  },
  "devDependencies": {
    "jest": "^25.4.0"
  }
}
```
The name of the package is scoped by the producerId which is `actility` in the example above, feel free to change it according to your `driver.producerId`.

Here we declare a `driver.producerId` equal to `actility`. It means the `driver` is developed by Actility and it
implements a communication protocol (`driver.application`) coming from a fictive `myManufacturer`. Most of the time,
the `driver` developer is also the manufacturer and therefore `driver.producerId` and `driver.application.producerId`
are the same. Like in the `application` the `driver.producerId` must be agreed with Actility.

We also declare a `driver.type` equal to `thingpark-x-js`. This allows the ThingPark X IoT Flow framework to know what
kind of driver it is as it supports several formats. In this documentation we only describe the `thingpark-x-js`
format therefore the `driver.type` must be set to this value.

In addition, we declare `driver.description` equal to `An example driver that is able to decode/encode data from temperature and humidity sensors with a pulse counter`. This allows the user to see a brief description of the driver. Be careful, this driver description differs from the NPM property `description` (which is described below), this one provides a full description and can be longer than the short friendly name of the driver.

In order to protect your driver code from being visible, you can declare `driver.private` to be `true`, else your driver code is visible in our platform.

This driver also declares that it will extract 6 points which are: `temperature`, `humidity` and `pulseCounter`, `airHumidity`, `location`.

The `points` section is **mandatory** only when using the `extractPoints(input)` function (see [here](#points-extraction)
for a complete description). It describes a "contract" of points that can be extracted with the `driver`. 
The name of the point must follow the ontology naming convention if a `unitId` defined, unless it is declared that standard naming is unsupported. 
[Here](UNITS.md) you can see a list of all possible points names in the property `fields` in each unit.

Our ontology/units follow the form of  [oBIX protocol](http://docs.oasis-open.org/obix/obix/v1.1/csprd01/obix-v1.1-csprd01.pdf)
which provides an extensive database of predefined units that are represented in seven main dimensions.
These seven dimensions are represented in SI respectively as kilogram (kg), meter (m), 
second (sec), Kelvin (K), ampere (A), mole (mol), and candela (cd).

Each point can declare three properties:

- `type`: this is a **mandatory** property representing the [point type](#point-types). 
- `unitId`: this is an optional value that represents the point unit in case its `type` is `double`, `int64`, or `object`. The
    list of possible units are predefined [here](#ontology) according to the ontology. If a `unitId` is missing, you can raise an issue in this project
    to integrate it.
- `standardNaming`: this is an optional property that can take the value `unsupported` in case the point define a unit and does not follow 
    the ontology concerning its `name`.

###### Point types
The only possible values for a point type are:
- `string`
- `int64`
- `double`
- `boolean`
- `object`

Some regular NPM properties in `package.json` are also leveraged by ThingPark X IoT Flow framework. These are:

- `name`: will be used as a module identifier for the `driver`. If you are using an NPM scope in the form
    `@actility/example-driver`, the scope will be removed when building it.
- `version`: will be used as the `driver` version. Therefore, developer is required to build a new version when
    modifying its `driver`.
- `description`: will be used as a short friendly name for the `driver`. It should not be very long.

In ThingPark X IoT Flow framework the unique identifier for the `driver` will be
`{driver.producerId}:{name-without-scope}:{major-version}`.

Some optional properties can be added to ease the use of the driver:

- `specification`: A url that refers to the datasheet/manual of the device that corresponds to this driver.
- `deviceImageUrl`: A url that refers to the image of the device that corresponds to this driver.
- `manufacturerLogoUrl`: A url that refers to the logo image of the manufacturer of the device.
- `providerLogoUrl`: A url that refers to the logo image of the provider of this driver.

#### Limitations on length of fields
**Important:** There is some limitations on the length of fields in `package.json`:

-   `name` must be a string of maximum 16 characters.
-   `producerId` must be a string of maximum 8 characters.
-   `moduleId` must be a string of maximum 16 characters.
-   `driver.producerId` must be a string of maximum 8 characters.
-   `driver.application.producerId` must be a string of maximum 8 characters.
-   `driver.application.moduleId` must be a string of maximum 16 characters.

### Driver functions

The following sections describe the four javascript functions that a driver can declare to perform encoding and decoding
tasks.

A driver must at least declare a `decodeUplink(input)` function to be valid (see next section).

#### Uplink decode

Uplinks are decoded by calling the following function:

```javascript
function decodeUplink(input) {...}
```

_Note:_ _this function is required in order for the driver to be valid_.

The `input` is an object provided by the IoT Flow framework that is represented by the following json-schema:

```json
{
    "bytes": {
        "description": "the uplink payload byte array",
        "type": "array",
        "items": {
            "type": "number"
        },
        "required": true
    },
    "fPort": {
        "description": "the uplink payload fPort",
        "type": "number",
        "required": false
    },
    "time": {
        "description": "the datetime of the uplink message, it is a real javascript Date object",
        "type": "string",
        "format": "date-time",
        "required": true
    }
}
```

and the returned object of the function must be the decoded object.

#### Downlink encode

Downlinks are encoded by calling the following function:

```javascript
function encodeDownlink(input) {...}
```

The `input` is the higher-level open JavaScript object provided by the IoT Flow framework and it represents the downlink payload directly.

The function must return an object containg 2 fields:

-   bytes: array of numbers as it will be sent to the device.
-   fPort: the fPort on which the downlink must be sent.

#### Downlink decode

Downlinks are decoded by calling the following function:

```javascript
function decodeDownlink(input) {...}
```

The `input` is an object provided by the IoT Flow framework that is represented by the following json-schema:

```json
{
    "bytes": {
        "type": "array",
        "items": {
            "type": "number"
        },
        "required": true
    },
    "fPort": {
        "type": "number",
        "required": false
    }
}
```

and the returned object of the function must be the decoded object.

#### Points extraction

Points can be extracted once an uplink has been decoded. In order to extract points, a driver must provide the following function:

```javascript
function extractPoints(input) {...}
```

The `input` is an object provided by the IoT Flow framework that is represented by the following json-schema:

```json
{
    "message": {
        "description": "the object message as returned by the decodeUplink function",
        "type": "object",
        "required": true
    },
    "time": {
        "description": "the datetime of the uplink message, it is a real javascript Date object",
        "type": "string",
        "format": "date-time",
        "required": true
    }
}
```

The returned object must be:
- The wrapped object from the decoded one in case all the event are done at the same time, respecting the ontology.
Here's an example:
```json
{
    "temperature": 31.4,
    "location": [48.875158, 2.333822],
    "fft": [0.32, 0.33, 0.4523, 0.4456, 0.4356]
}
```
- OR, it is defined by the following json-schema in case the point has several values in different timestamp.

```json
{
  "type": "object",
  "additionalProperties": {
    "type": "array",
    "items": {
      "type": "object",
      "properties": {
        "eventTime": {
          "type": "string",
          "format": "date-time",
          "required": true
        },
        "value": {
          "type": ["string", "number", "boolean"],
          "required": false
        }
      }
    }
  }
}
```
Here's an example:
```json
{
  "temperature": [
    {
      "eventTime": "2019-01-01T10:00:00+01:00",
      "value": 31.4
    },
    {
      "eventTime": "2019-01-01T11:00:00+01:00",
      "value": 31.2
    },
    {
      "eventTime": "2019-01-01T12:00:00+01:00",
      "value": 32
    }
  ]
}
```

### Payload examples

The following section describes the examples of the payloads of the driver.

Several examples of uplink and downlink payloads must be declared directly in the driver package and especially in a directory `/example`. The name of each examples file must follow the pattern `*.examples.json`. You can split and organize the examples files according to your own logic.

These examples will be used in order to provide for the users of the driver some examples of the payload to be decoded/encoded to test the driver. In addition, it will be used to facilitate the testing of the driver while development.

An `*.examples.json` file contains an array of several uplink/downlink examples.

#### Example

The uplink/downlink example used is an object represented by the following json-schema:

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
        "enum": ["uplink", "downlink"],
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
        "description": "the uplin/downlink message time",
        "type": "string",
        "format": "date-time",
        "required": false
    },
    "data": {
        "description": "the decoded uplink/downlink view",
        "type": "object",
        "required": true
    },
    "points": {
        "description": "the extracted points. This field is allowed for uplink examples only",
        "type": "object",
        "required": "false",
        "additionalProperties": {
            "type": "object",
            "properties": {
                "unitId": {
                    "description": "the unit of the extracted point",
                    "type": "string",
                    "required": true
                },
                "type": {
                    "description": "the data type of the point extracted",
                    "type": "string",
                    "required": true
                },
                "record": {
                    "type": ["string", "number", "boolean"],
                    "required": false
                },
                "records": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "eventTime": {
                          "type": "string",
                          "format": "date-time",
                          "required": true
                        }, 
                        "value": {
                          "type": ["string", "number", "boolean"],
                          "required": false
                        }
                      }
                },
                "required": false
              }
            }
        }
    }
}
```

**Important**

- `description`: This field must be unique.
- `points`: This field can be used in the `uplink` example if there is some values in the field `data` must be extracted
  as points.

### Json Schemas

The following section describes the Json Schema of the decoded payloads of the driver.

As the output data from the decoding payload process is not predictable, it is better to declare Json schemas that defines the structure of this output to ease the use of driver after decoding.

The Json schemas of uplink and downlink payloads must be declared directly in the driver package and especially in a directory `/json-schemas`.
Two Json schemas can be declared following the pattern: `uplink.schema.json` for uplink data, and `downlink.schema.json` for downlink data if supported.

An `*.schema.json` file contains a generic json schema for all types of payload decoded by this driver of several uplink/downlink examples. 

## Packaging

To simplify the open distribution and integration with our platform, a packaging leveraging NPMs is defined.

NPM was chosen because it is the most widely used packaging system for JavaScript code. Also, this approach defines a
clear code layout that can be distributed independently using the developer preferred version control tool.

You can find a full description of packaging in the guide of simple driver [here](#simple-driver-guide).

## Testing

Testing your driver is a very important process, thus the user is highly encouraged to test the driver in most possible
use cases as well as error cases.

**Important:** The test of your driver is needed to prove a minimum test coverage of 85% to be valid on our framework.

# Simple driver guide

This example describes how you to create a simple driver using ThingPark X IoT Flow framework.

The concepts and API is describe [here](../../README.md#api)

-   [Simple driver](#simple-driver-guide)
    -   [Minimal driver](#minimal-driver)
    -   [Encoding and decoding downlinks](#encoding-and-decoding-downlinks)
    -   [Extracting points](#extracting-points)
    -   [Returning errors](#returning-errors)
    -   [Testing](#testing)

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
    "name": "@actility/simple-driver",
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
    "name": "@actility/simple-driver",
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

Add the `driver` object to the `package.json` file containing the description of your driver:

```json
{
    "name": "@actility/simple-driver",
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
        "producerId": "my-driver-producer",
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

***Important:*** make sure to respect the constraints on the length of some fields. [Here](#limitations-on-length-of-fields) you can find the details.

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

Now that your driver is finished you can create the npm package. Simply run:

```shell
npm pack
```

This will create a new file with the `.tgz` extension in the current folder containing the complete driver.

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

The `encodeDownlink(input)` function takes an object as parameter (see [here](#downlink-encode)) containing the object (called `message`)
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

The function takes an `input` object (see [here](#downlink-decode)) that will contain `bytes`. This simple driver will only
decode both objects as returned from `encodeDownlink(input)`: `pulseCounterThreshold` and `alarm`.

After adding `encodeDownlink(input)` and `decodeDownlink(input)` functions you can re-package your driver.

## Extracting points

Now that you have a driver that is able to decode uplinks and downlinks as well as encoding downlinks, lets go further
and extract points from our payloads.

As described [here](#point), a thing can have zero or more attributes, and the attributes that you want to extract as points must
be first statically declared on the `package.json` file.

So let's add the points `temperature`, `humidity`, `pulseCounter`, and `airHumidity` points to our package (inside the `driver` object):

```json
{
    "name": "@actility/my-driver",
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
        "producerId": "my-driver-producer",
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

As explained in [Point](#point) section, a point can contain a `unitId`, which represents its unit (see [Units](../../UNITS.md)) and a `type` (see [Point types](#point-types)). 
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
### Create a tarball from the package

To create a tarball from the already defined package, you must use the following command:

```shell
npm pack
```

This command must be executed in the root folder of the driver. It will generate a `.tgz` file that contains all the
files and directories of the driver.

**Important:** You must avoid including the non-necessary files into the `.tgz` file as the `node_modules`
and `coverage` directories for example.

## Ontology

| Unit                                   | unitId    | type   | symbol              | fields                                          |
|----------------------------------------|-----------|--------|---------------------|-------------------------------------------------|
| GPS                                    | GPS       | object | GPS                 | location                                        |
| Ampere                                 | A         | double | A                   | current                                         |
| Ampere hour                            | Ah        | double | Ah                  | charge                                          |
| Bar                                    | bar       | double | bar                 | pressure                                        |
| Becquerel                              | Bq        | double | Bq                  | radioactivity                                   |
| Bel                                    | Bspl      | double | bel                 | intensity, snr                                  |
| Bit                                    | bit       | double | bit                 | data, storage                                   |
| Bit per second                         | bit/s     | double | bit/s               | dataSpeed                                       |
| Candela                                | cd        | double | cd                  | intensity                                       |
| Candela per square meter               | cd/m2     | double | cd/m&#178;          | brightness                                      |
| Celsius                                | Cel       | double | &#176;C             | temperature                                     |
| Centimeter                             | cm        | double | cm                  | distance, accuracy, range, altitude             |
| Coulomb                                | C         | double | C                   | electricCharge                                  |
| Count per second                       | count/s   | double | count/s             | eventRate, rate                                 |
| Count per minute                       | count/min | double | count/min           | eventRate, rate                                 |
| Cubic meter                            | m3        | double | m&#179;             | volume                                          |
| Cubic meter per hour                   | m3/h      | double | m&#179;/h           | flowRate                                        |
| Cubic meter per second                 | m3/s      | double | m&#179;/s           | flowRate                                        |
| Decibel                                | dB        | double | dB                  | intensity, snr                                  |
| Decibel relative to 1mW                | dBm       | double | dBm                 | rssi                                            |
| Decibel relative to 1W                 | dBW       | double | dBW                 | powerLevel                                      |
| Degree                                 | deg       | double | &#176;              | angle                                           |
| Degrees per second                     | dps       | double | dps                 | angularVelocity                                 |
| Dillution of precision                 | dop       | double | dop                 | navigation                                      |
| Euro                                   | euro      | double | &#8364;             | price                                           |
| Euro per watthour                      | euro/Wh   | double | &#8364;/Wh          | energyPrice                                     |
| Fahrenheit                             | Far       | double | &#176;F             | temperature                                     |
| Farad                                  | F         | double | F                   | capacitance                                     |
| Gigawatt                               | GW        | double | GW                  | power                                           |
| Gram                                   | g         | double | g                   | mass, weight                                    |
| Acceleration compared to earth gravity | gravity   | double | G                   | acceleration, vibration                         |
| Gray                                   | Gy        | double | Gy                  | radiation                                       |
| Hectopascal                            | hPa       | double | hPa                 | pressure                                        |
| Henry                                  | H         | double | H                   | inductance                                      |
| Hertz                                  | hertz     | double | Hz                  | frequency, sound                                |
| Hour                                   | hour      | double | h                   | time, duration, interval, age                   |
| Joule                                  | J         | double | J                   | energy                                          |
| Katal                                  | kat       | double | kat                 | catalyticActivity                               |
| Kelvin                                 | K         | double | K                   | temperature                                     |
| Kilogram                               | kg        | double | kg                  | mass, weight                                    |
| Kilometer                              | km        | double | km                  | distance, accuracy, range, altitude             |
| Kilometer per hour                     | km/h      | double | km/h                | velocity, speed                                 |
| Kilopascal                             | kPa       | double | kPa                 | pressure                                        |
| Kilowatt                               | kW        | double | kW                  | power                                           |
| Kilowatthour                           | kWh       | double | kWh                 | energy                                          |
| Liter                                  | l         | double | l                   | volume, capacity                                |
| Liter per second                       | l/s       | double | l/s                 | flowRate                                        |
| Lumen                                  | lm        | double | lm                  | flux, illuminance, light                        |
| Lux                                    | lx        | double | lx                  | flux, illuminance                               |
| Megawatt                               | MW        | double | MW                  | power                                           |
| Megawatthour                           | MWh       | double | MWh                 | energy                                          |
| Megawatt per minute                    | MW/m      | double | MW/m                | powerRate                                       |
| Meter                                  | m         | double | m                   | distance, accuracy, range, altitude             |
| Meter per second                       | m/s       | double | m/s                 | velocity, speed                                 |
| Meter per square second                | m/s2      | double | m/s&#178;           | acceleration, vibration                         |
| Microgram                              | ug        | double | &#181;g             | mass, weight                                    |
| Microgram per cubic meter              | ug/m3     | double | &#181;g/m&#179;     | concentration                                   |
| Micrometer                             | um        | double | &#181;m             | distance, accuracy, range, altitude             |
| Micromole per second and square meter  | umol/m2.s | double | &#181;mol/m&#178;.s | fluxDensity, intensity                          |
| Microsiemens per centimeter            | uS/cm     | double | &#181;S/cm          | conductivity                                    |
| Microvolt                              | uV        | double | uV                  | batteryVoltage                                  |
| Milliampere                            | mA        | double | mA                  | current                                         |
| Milliampere hour                       | mAh       | double | mAh                 | charge                                          |
| Millibar                               | mbar      | double | mbar                | pressure                                        |
| Milliliter                             | ml        | double | ml                  | volume, capacity                                |
| Millimeter                             | mm        | double | mm                  | distance, accuracy, range, altitude             |
| Millimeter per second                  | mm/s      | double | mm/s                | velocity, speed                                 |
| Millimeter per hour                    | mm/h      | double | mm/h                | velocity, speed                                 |
| Millisecond                            | ms        | double | ms                  | time, duration, interval, age                   |
| Millisiemens per centimeter            | mS/cm     | double | mS/cm               | conductivity                                    |
| Millivolt                              | mV        | double | mV                  | batteryVoltage                                  |
| Minute                                 | minute    | double | min                 | time, duration, interval, age                   |
| Mole                                   | mol       | double | mol                 | amount, quantity                                |
| Newton                                 | N         | double | N                   | force                                           |
| Nephelometric turbidity                | ntu       | double | ntu                 | nephelometricTurbidity, turbidity               |
| Okta                                   | okta      | int64  | okta                | cloudCover, cover                               |
| Ohm                                    | Ohm       | double | &#8486;             | resistance                                      |
| Parts per billion                      | ppb       | double | ppb                 | amount, quantity, concentration, co2Level       |
| Parts per million                      | ppm       | double | ppm                 | amount, quantity, concentration, co2Level       |
| Pascal                                 | Pa        | double | Pa                  | pressure                                        |
| Percentage                             | %         | double | %                   | batteryLevel, percentage, per, currentUnbalance |
| Percentage relative humidity           | %RH       | double | %RH                 | humidity                                        |
| pH                                     | pH        | double | pH                  | acidity                                         |
| Pulse per hour                         | pulse/h   | double | pulse/h             | frequency, sound                                |
| Radian                                 | rad       | double | rad                 | angle                                           |
| Rate                                   | /         | double | rate                | rate                                            |
| Rotations per minute                   | rpm       | double | rpm                 | angularVelocity                                 |
| Second                                 | s         | double | s                   | time, duration, interval, age                   |
| Siemens                                | S         | double | S                   | conductance                                     |
| Siemens per meter                      | S/m       | double | S/m                 | conductivity                                    |
| Sievert                                | Sv        | double | Sv                  | radiationEffect                                 |
| Square meter                           | m2        | double | m&#178;             | area                                            |
| Steradian                              | sr        | double | sr                  | solidAngle                                      |
| Tesla                                  | T         | double | T                   | magneticDensity                                 |
| Volt-Ampere                            | VA        | double | VA                  | apparentPower                                   |
| Volt-Ampere hour                       | VAh       | double | VAh                 | apparentEnergy                                  |
| Volt-Ampere reactive                   | var       | double | var                 | reactivePower                                   |
| Volt-Ampere reactive hour              | varh      | double | varh                | reactiveEnergy                                  |
| Volt                                   | V         | double | V                   | batteryVoltage, rmsVoltage                      |
| Watt                                   | W         | double | W                   | power, activePower                              |
| Watt per hour                          | W/h       | double | W/h                 | powerRate                                       |
| Watt per second                        | W/s       | double | W/s                 | powerRate                                       |
| Watt per square meter                  | W/m2      | double | W/m&#178;           | irradiance, solarRadiation                      |
| Watthour                               | Wh        | double | Wh                  | energy                                          |
| Weber                                  | Wb        | double | Wb                  | magneticFlux                                    |
