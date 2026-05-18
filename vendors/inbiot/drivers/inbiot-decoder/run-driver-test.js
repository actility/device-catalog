const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

let testsPath = path.resolve(__dirname, '../../../../tests');
if(testsPath.includes("device-catalog-private")) {
    testsPath = path.resolve(__dirname, "../../../../../device-catalog/tests");
}

const driverPath = path.resolve(__dirname);

if (!fs.existsSync(path.join(testsPath, 'node_modules'))) {
    console.log('📦 Installing test dependencies...');
    execSync('npm install', { cwd: testsPath, stdio: 'inherit' });
}

execSync(`cross-env DRIVER_PATH="${driverPath}" TZ=UTC jest --config=jest.config.js --collectCoverage`, {
    cwd: testsPath,
    stdio: 'inherit'
});
