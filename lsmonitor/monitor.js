const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const networkDrivePath = '/Volumes/JSon/';
const pollInterval = 10000; // Poll every 10 seconds
let fileStates = {};
// Load the config file
const config = require('./config.json');
function pollDirectory(directoryPath) {
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            console.error(err);
            return;
        }
        const newStates = {};
        files.forEach(file => {
            const fullPath = path.join(directoryPath, file);
            const stats = fs.statSync(fullPath);
            newStates[fullPath] = stats.mtime.getTime();
            // Check for file addition or modification
            if (!fileStates[fullPath] || fileStates[fullPath] < newStates[fullPath]) {
                console.log(`File changed: ${fullPath}`);
                // Get the URL for this file from the config
                const url = config[file];
                if (url) {
                    // Execute the curl command
                    exec(`curl -i -X POST -H "authorization: Bearer I.1972.65a6731fced27e5816da16df.Rbox7B3wSoiiTQ535c2pyg" -H "content-type:application/json" -d "@${fullPath}" ${url}`, (error, stdout, stderr) => {
                        if (error) {
                            console.error(`exec error: ${error}`);
                            return;
                        }
                        console.log(`stdout: ${stdout}`);
                        console.error(`stderr: ${stderr}`);
                    });
                } else {
                    console.error(`No URL found for file: ${file}`);
                }
            }
        });
        // Check for file deletion
        for (let filePath in fileStates) {
            if (!newStates[filePath]) {
                console.log(`File deleted: ${filePath}`);
            }
        }
        fileStates = newStates;
    });
}
setInterval(() => pollDirectory(networkDrivePath), pollInterval);
console.log(`Watching for file changes on ${networkDrivePath}`);