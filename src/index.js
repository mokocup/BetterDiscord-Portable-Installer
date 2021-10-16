#! /usr/bin/env node

const stream = require('stream');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const prompts = require('prompts');
const got = require('got');
const asar = require('asar');

const { ACTION } = require('./const');

const validatePath = require('./util/validatePath');

const install = require('./actions/install');
const uninstall = require('./actions/uninstall');

const questions = [
    {
        type: 'select',
        name: 'action',
        message: 'What do you want to do ?',
        choices: [
            { title: 'Install', value: ACTION.install },
            { title: 'Uninstall', value: ACTION.uninstall },
        ],
        initial: 0
    },
    {
        type: 'text',
        name: 'path',
        message: 'Path to Portable Discord Resources (ex: C:/Users/mokocup/Desktop/discord_portable/app/app-1.0.1008/resources)?',
        validate: validatePath
    }
];

const onCancel = () => {
    console.log(`    👋 Exit Installer`)
    process.exit();
}

(async () => {
    const answer = await prompts(questions, { onCancel });

    const { action, path } = answer;
    switch (action) {
        case ACTION.install:
            await install(path);
            break;
        case ACTION.uninstall:
            await uninstall(path);
            break;
        default:
            break;
    }
})();
