const fs = require('fs');
const { execSync } = require('child_process');

if (!fs.existsSync('node_modules')) {
    console.log('node_modules not found. Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
} else {
    console.log('Dependencies already installed. Skipping install.');
}