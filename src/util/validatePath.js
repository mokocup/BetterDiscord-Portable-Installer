const exists = require("./exist");


module.exports = function (discordPath) {
    console.log(`🔎 Checking ${discordPath}`);
    if (exists(discordPath)) {
        // TODO :
        // Vaidate Discord PTB and Portable here
        return true;
    }

    console.log(`❌ Invalid Discord Portable Path`)
    return false;
}
