#!/usr/bin/env node
/**
 * run-tests.js
 *
 * Run driver-examples.spec.js against a single driver by passing its path
 * as a positional argument. This lets you copy-paste a driver path directly
 * from your file explorer or terminal.
 *
 * Usage (from anywhere):
 *   node device-catalog/tests/run-tests.js <path-to-driver>
 *
 * Examples:
 *   node tests/run-tests.js ../vendors/abeeway/drivers/asset-tracker
 *   node tests/run-tests.js /absolute/path/to/device-catalog/vendors/mclimate/drivers/vicki
 *
 * The DRIVER_PATH environment variable is also accepted directly:
 *   DRIVER_PATH=/path/to/driver node tests/run-tests.js
 */

const cp = require("child_process");
const path = require("path");
const fs = require("fs");

const testsDir = __dirname;

// Resolve driver path: positional arg takes precedence over env var
const rawPath = process.argv[2] || process.env.DRIVER_PATH;
if (!rawPath) {
    console.error("Usage: node run-tests.js <path-to-driver>");
    console.error("       DRIVER_PATH=<path-to-driver> node run-tests.js");
    process.exit(1);
}

const driverPath = path.resolve(rawPath);

if (!fs.existsSync(driverPath)) {
    console.error(`Error: driver path does not exist: ${driverPath}`);
    process.exit(1);
}

console.log(`Running tests for driver: ${driverPath}\n`);

try {
    cp.execSync("jest driver-examples.spec.js --config=jest.config.js", {
        cwd: testsDir,
        stdio: "inherit",
        env: {
            ...process.env,
            DRIVER_PATH: driverPath,
            TZ: "UTC",
            PATH: `${path.join(testsDir, "node_modules", ".bin")}:${process.env.PATH}`,
        },
    });
} catch {
    process.exit(1);
}
