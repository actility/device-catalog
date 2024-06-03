# Vendor Devices catalog structure
Each vendor has his own Device Catalog composed of a set of files and directories (A sample vendor directory is provided [here](sample-vendor)):

## Files:
- `vendor.yaml`: Information about the vendor
- `logo.png`: Logo of the vendor

All vendors information are stored in the root directory dedicated to a vendor.

You can find [sample](sample-vendor/vendor.yaml) of `vendor.yaml` in this directory. It is highly recommended to start by copying then customizing it with specific vendor information.

The file `logo.png` presents the logo of the vendor, it should be:
- named `logo.png`
- **.png** format
- _256_ x _256_ pixels size
- transparent or white background


## Directories
1. `models`: Directory contains model information of all devices. [Sample](sample-vendor/models/sample-model/model.yaml)
2. `profiles`: Directory contains LoRaWAN network characteristics of all devices. [Sample](sample-vendor/profiles/sample-vendor_RFGroup1_1.0.2b_classA.yaml)
3. `drivers`: Directory contains the drivers of all devices. [Full Guide with sample](sample-vendor/drivers/README.md)

> All files and folders must be named in lowercase and seperated by dashes '`-`' only.
> The separator underscore '`_`' is reserved for [versioning](#versioning).
> Note: the text between quotation marks ('<' and '>') are free to use, but we recommend the usage of ID.

## Structure
```_
Device catalog
    ├── <Vendor Name #1>
    │      ├── vendor.yaml                       # Vendor information
    │      ├── logo.png                          # Logo of the vendor
    │      ├── models
    │      │      ├── <Model #1>
    │      │      │      ├── model.yaml          # Information about the device
    │      │      │      └── image.png           # Image of the device
    │      │      ├── <Model #2>
    │      │      │      ├── model.yaml
    │      │      │      └── image.png
    │      │      └── ... 
    │      ├── profiles
    │      │      ├── <profileId #1>.yaml    # Specific LoRaWAN characteristics for this ISMBand and model of device
    │      │      ├── <profileId #2>.yaml 
    │      │      └── ... 
    │      └── drivers
    │             ├── <Driver #1>
    │             │      ├── driver.yaml         # Information about your driver
    │             │      └── (driver package)    # Including code, test, examples
    │             ├── <Driver #2>
    │             │      ├── driver.yaml
    │             │      └── (driver package) 
    │             └── ... 
    └── <Vendor Name #2>
```


## Versioning

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
    │      │      ├── <Model #1>
    │      │      │      ├── model.yaml          # Information about the device
    │      │      │      └── image.png           # Image of the device
    │      │      ├── <Model #2>_v<version>
    │      │      │      ├── model.yaml
    │      │      │      └── image.png
    │      │      └── ... 
    │      ├── profiles
    │      │      ├── <profileId #1>.yaml    # Specific LoRaWAN characteristics for this ISMBand and model of device
    │      │      ├── <profileId #2>.yaml 
    │      │      └── ... 
    │      └── drivers
    │             ├── <Driver #1>
    │             │      ├── driver.yaml         # Information about your driver
    │             │      └── (driver package)    # Include code, test, examples, errors
    │             ├── <Driver #2>
    │             │      ├── driver.yaml
    │             │      └── (driver package) 
    │             └── ... 
    └── <Vendor Name #2>
```

The structure is the same as the one presented before, the only added information is the version in the naming.

## Model
Each model represents a specific product and a particular product version of a device. A model identifies a device with a particular hardware or casing version.

Inside each model directory, there is `model.yaml` that describes the model, and a photo of the device.

You can find template(s) of `model.yaml` under `models` directory. It is highly recommended to start by copying one and customize it following your model specifications.

The file `<Model Name>.png` presents the image of the device, it should be:
- named the same as mentioned in `model.yaml`
- **.png** format
- _256_ x _256_ pixels size
- transparent or white background


## Profile
A profile contains the technical LoRaWAN characteristics used by the device, including the LoRaWAN L2 and PHY versions, the RX1/RX2 settings used during boot stage until they are eventually updated by the Network Server through appropriate MAC commands etc.
> Start from the predefined templates to build your own profiles, if your devices do not follow the default LoRaWAN configuration.
> All generic profile templates are defined under [Generic Profiles Templates](Generic Profiles Templates). Pick the right template based on the below information:
> - ISMBand (eu868, us915, as923, ...)
> - LoRaWAN MAC version (1.0.2, 1.0.3b, ...)
> - LoRaWAN Regional Parameters' version (1.0.2revA, 1.0.2revB, 1.0.2revC, RP2-1.0.1, RP2-1.0.2, RP2-1.0.3...)
> - LoRaWAN Class (A, B or C).

Once you select a generic template, you need to create a file named with the profile ID.
This ID of your profile should be used on your `model.yaml` on the field `deviceProfileIds`.

Example: `vendor_RFGroup1_1.0.2revB_classA.yaml`

You can find several generic templates under [here](Generic Profiles Templates). It is highly recommended to start by copying one/several of them according to the characteristics of your models and then customize.


## Driver
A driver decodes binary payload to Json object and encodes Json object to binary, following the recommendations provided by LoRa-Alliance.
This directory contains, for each device model, all the needed files for a driver.
It could be generic for a part of all your devices or device-specific.
A driver could either be public (open-source) or private and not exposed (contact us in this case at **tpx-iot-flow@actility.com**).

The file `driver.yaml` contains the information related to driver.

> Pay attention when choosing a `protocolId`, it should be the same used in `model.yaml`, it is important for establishing a link between the model and the expected driver.


