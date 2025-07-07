const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const testsPath = path.resolve(__dirname, '../../../../tests');
const driverPath = path.resolve(__dirname);

if (!fs.existsSync(path.join(testsPath, 'node_modules'))) {
    console.log('📦 Installing test dependencies...');
    execSync('npm install', { cwd: testsPath, stdio: 'inherit' });
}

execSync(`cross-env DRIVER_PATH="${driverPath}" jest --config=jest.config.js --collectCoverage`, {
    cwd: testsPath,
    stdio: 'inherit'
});
