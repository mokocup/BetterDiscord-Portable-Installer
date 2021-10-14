const stream = require('stream');
const { promisify } = require('util');
const fs = require('fs');

const path = require('path');
const prompts = require('prompts');
const got = require('got');

const asar = require('asar');

const validatePath = (discordPath) => {
    console.log(`    🔎 Checking ${discordPath}`);
    if (fs.existsSync(discordPath) && fs.lstatSync(discordPath).isDirectory()) {
        console.log(`    ✅ is Directory`);
        return true;
    }

    console.log(`    ❌ Invalid Discord Portable Path`)
    return false;
}

const getLatestUrl = async () => {

    const url = 'https://api.github.com/repos/BetterDiscord/BetterDiscord/releases/latest';


    const { body } = await got.get(url, {
        responseType: 'json'
    });

    return body.assets.find(v => v.name.includes('betterdiscord.asar')).browser_download_url;
}


const downloadAsar = async (url, path) => {
    const pipeline = promisify(stream.pipeline);
    await pipeline(
        got.stream(url),
        fs.createWriteStream(path)
    );
}

(async () => {
    const answer = await prompts({
        type: 'text',
        name: 'path',
        message: 'Path to Portable Discord Resources (ex: C:/Users/mokocup/Desktop/discord_portable/app/app-1.0.1008/resources)?',
        validate: validatePath
    });

    if (!answer.path) {
        console.log(`    👋 Exit Installer`)
        process.exit();
    }

    const discordPath = answer.path;
    const app = path.join(discordPath, "app");
    const appBackup = path.join(discordPath, "app_bak");
    const packageJson = path.join(app, "package.json");
    const indexJs = path.join(app, "index.js");

    const bdPath = path.join(discordPath, "betterdiscord.asar");
    const appPath = path.join(discordPath, "app.asar");

    if (fs.existsSync(indexJs)) {
        console.log("    ❌ BBD already installed");
        process.exit();
    }

    console.log("    ✅ Download betterdiscord.asar");

    const asarLink = await getLatestUrl();
    await downloadAsar(asarLink, bdPath);

    fs.renameSync(app, appBackup);
    fs.mkdirSync(app);

    fs.writeFileSync(packageJson, JSON.stringify({
        name: "betterdiscord",
        main: "index.js",
    }, null, 4));
    console.log("    ✅ Wrote package.json");

    fs.writeFileSync(indexJs, `require("../betterdiscord.asar")`);
    console.log("    ✅ Wrote index.js");

    console.log("    ✅ Creating app.asar");
    await asar.createPackage(appBackup, appPath);
    console.log("    ✅ Wrote app.asar");

    console.log("");
    console.log(`Install successful, please restart Discord.`);
    process.exit();
})();
