const path = require('path');
const fs = require('fs');
const stream = require('stream');
const { promisify } = require('util');

const asar = require('asar');
const got = require('got');

const exist = require('../util/exist');
const { BD_REPOSITORY } = require('../const');

let discordPath;
let bdFolder;
// let bdDataFolder;
// let bdPluginsFolder;
// let bdThemesFolder;
let asarPath;

const mapDirectory = (_discordPath) => {
    discordPath = _discordPath;
    bdFolder = path.join(discordPath, "..", "..", "..", "BetterDiscord");
}

const uninstallInject = async () => {
    console.log("🗑️ Removing Better Discord");
    const appPath = path.join(discordPath, "app");

    try {
        if (exist(appPath)) fs.rmdirSync(appPath, { recursive: true });

        console.log("✅ Deletion successful");

    } catch (err) {
        console.log(`❌ Could not delete folder ${appPath}`);
        console.log(`❌ ${err.message}`);
        return err;
    }
}

module.exports = async (discordPath) => {

    mapDirectory(discordPath);

    await uninstallInject();

    console.log("");
    console.log(`Install successful, please restart Discord.`);
    process.exit();
}