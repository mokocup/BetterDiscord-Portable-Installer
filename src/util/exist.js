const fs = require('fs');

module.exports = function exists(file) {
    try {
        fs.statSync(file);
        return true;
    }
    catch {
        return false;
    }
}