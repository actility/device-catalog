# Public Catalog

The TPX Device Public Catalog Repository contains information about LoRaWAN end-devices, this acts as a key data source for device catalogs and on-boarding devices on LoRaWAN networks.

Under the **vendors'** directory, you can find all vendors registered.

This repository is designed to be improved by you! For this, in order to add Devices Profiles, Drivers, etc... You can create a pull request, in **vendors** which will be validated by our team to be published.

Thanks to this, the integrity of the catalog is guaranteed and the experience as well.

You can find a sample [here](./template) to get you started, with a **README.md** that explains the overall structure and a step by step guide for developers.
If you already have a driver compliant to the [standard LoRa Alliance CoDec API format](https://resources.lora-alliance.org/home/lorawan-payload-codec-api), or intend to write one, a sample with detailed comments is available [here](https://github.com/actility/device-catalog/blob/main/template/sample-vendor/drivers/README.md).

>Any modification on this repository should be done by creating a new pull request to be reviewed by Actility before submission.

## Testing a driver locally

All driver tests are centralized in the [`tests/`](./tests) directory and use [Jest](https://jestjs.io/) with a shared test harness ([`tests/driver-examples.spec.js`](./tests/driver-examples.spec.js)).

### Prerequisites

Install the test dependencies once (from the `tests/` directory):

```bash
cd tests
npm install
```

### Run tests for a single driver

Use the `run-tests.js` wrapper — pass the driver directory path as a positional argument (you can copy-paste it directly from your terminal or file explorer):

```bash
node tests/run-tests.js vendors/abeeway/drivers/asset-tracker
# or with an absolute path:
node tests/run-tests.js /absolute/path/to/device-catalog/vendors/mclimate/drivers/vicki
```

The `DRIVER_PATH` environment variable is also accepted:

```bash
DRIVER_PATH=vendors/abeeway/drivers/asset-tracker node tests/run-tests.js
```

### Run all drivers (CI)

The full test suite for all catalogs is driven by `device-catalog-private/scripts/check-drivers/run-unit-tests.js`, which iterates all vendor directories and runs the same harness for each driver via the `DRIVER_PATH` environment variable.
