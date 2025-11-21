const fs = require('fs');
const path = require('path');

function getLongFolderNames(dirPath, minLength = 16) {
    const results = [];

    function traverse(currentPath) {
        const entries = fs.readdirSync(currentPath, { withFileTypes: true });

        for (const entry of entries) {
            if (entry.isDirectory()) {
                const folderName = entry.name;
                if (folderName.length > minLength) {
                    results.push(path.join(currentPath, folderName));
                }
                traverse(path.join(currentPath, folderName));
            }
        }
    }

    traverse(dirPath);
    return results;
}

// Example usage:
const rootDir = './vendors/thermokon'; // change this to your starting directory
const longFolders = getLongFolderNames(rootDir);

console.log('Subfolders with names longer than 16 characters:');
longFolders.forEach(folder => console.log(folder));
