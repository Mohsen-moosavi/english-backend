const fs = require('fs');
const path = require('path');


function removeFile(filename) {
    if (fs.existsSync(path.join(__dirname, '..', 'public', 'images', filename))) {
        fs.rmSync(path.join(__dirname, '..', 'public', 'images', filename))
    }
}

module.exports = {
    removeFile
}