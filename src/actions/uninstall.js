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

    // Map global path for compatible
    bdFolder = path.join(discordPath, "..", "..", "..", "BetterDiscord");
    asarPath = path.join(discordPath, "betterdiscord.asar");

    // Unusable since first time run will create them
    // bdDataFolder = path.join(bdFolder, "data");
    // bdPluginsFolder = path.join(bdFolder, "plugins");
    // bdThemesFolder = path.join(bdFolder, "themes");
}

const uninstallInject = async () => {
    console.log("🗑️ Removing Better Discord");
    const appPath = path.join(discordPath, "app");

    try {
        if (exist(appPath)) fs.rmdirSync(appPath, { recursive: true });
        if (exist(asarPath)) fs.rmSync(asarPath);

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