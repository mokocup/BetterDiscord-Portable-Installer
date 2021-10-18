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
let bdDataFolder;
let bdPluginsFolder;
let bdThemesFolder;
let asarPath;

const mapDirectory = (_discordPath) => {
    discordPath = _discordPath;

    bdFolder = path.join(discordPath, "..", "..", "..", "BetterDiscord");
    bdDataFolder = path.join(bdFolder, "data");
    bdPluginsFolder = path.join(bdFolder, "plugins");
    bdThemesFolder = path.join(bdFolder, "themes");

    asarPath = path.join(bdFolder, "betterdiscord.asar");
}

const makeDirectories = async (...folders) => {
    for (const folder of folders) {
        if (exist(folder)) {
            console.log(`✅ Directory exists: ${folder}`);
            continue;
        }
        try {
            fs.mkdirSync(folder);
            console.log(`✅ Directory created: ${folder}`);
        }
        catch (err) {
            console.log(`❌ Failed to create directory: ${folder}`);
            console.log(`❌ ${err.message}`);
            return err;
        }
    }
}

const getLatestUrl = async () => {
    const url = BD_REPOSITORY

    const { body } = await got.get(url, {
        responseType: 'json'
    });

    return body.assets.find(v => v.name.includes('betterdiscord.asar')).browser_download_url;
}


const downloadAsar = async () => {
    const url = await getLatestUrl();
    const pipeline = promisify(stream.pipeline);
    await pipeline(
        got.stream(url),
        fs.createWriteStream(asarPath)
    );
}

const migratePortable = async () => {
    const appFolder = path.join(discordPath, "app");
    const appBackup = path.join(discordPath, "app_org");
    const appAsar = path.join(discordPath, "app.asar");

    // Pack app folder to App.asar
    try {
        // Create App.asar
        const isAsarExist = exist(appAsar);
        if (!isAsarExist) {
            console.log("🔨 Creating App.asar");

            await asar.createPackage(appFolder, appAsar);

            console.log("✅ App.asar created");
        }

        // Renamme App folder for backup
        const isBackupExist = exist(appBackup);
        if (!isBackupExist) {
            console.log("🚓 Backup App");

            fs.renameSync(appFolder, appBackup);

            console.log("✅ App backup done");
        }
    }
    catch (err) {
        console.log(`❌ Could not migrate portble to ${discordPath}`);
        console.log(`❌ ${err.message}`);
        return err;
    }
}

const installInject = async () => {
    console.log("💉 Injecting into: " + discordPath);
    const appPath = path.join(discordPath, "app");
    const pkgFile = path.join(appPath, "package.json");
    const indexFile = path.join(appPath, "index.js");

    try {
        if (!(exist(appPath))) fs.mkdirSync(appPath);

        console.log("✅ Wrote package.json");
        fs.writeFileSync(pkgFile, JSON.stringify({ name: "betterdiscord", main: "index.js" }));

        console.log("✅ Wrote index.js");
        fs.writeFileSync(indexFile, `require("${asarPath.replace(/\\/g, "\\\\").replace(/"/g, "\\\"")}");`);
    } catch (err) {
        console.log(`❌ Could not install injector to ${discordPath}`);
        console.log(`❌ ${err.message}`);
        return err;
    }
}

module.exports = async (discordPath) => {

    mapDirectory(discordPath);

    await migratePortable();

    await makeDirectories(bdFolder, bdDataFolder, bdThemesFolder, bdPluginsFolder);

    await downloadAsar();

    await installInject();

    console.log("");
    console.log(`Install successful, please restart Discord.`);
    process.exit();
}