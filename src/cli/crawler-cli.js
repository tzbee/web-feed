const log = require('./cli-log');
const args = require('minimist')(process.argv.slice(2));
const path = require('path');

const PluginCache = require('../PluginCache');
const StdioDispatcher = require('../StdioDispatcher');

const pluginCache = new PluginCache();

const dispatcher = new StdioDispatcher();
const Crawler = require('../Crawler');
const crawler = new Crawler(pluginCache);

const listParserHandler = require('./listParserHandler')(pluginCache);
const crawlHandler = require('./crawlHandler')(crawler);
const daemonHandler = require('./daemonHandler')(
    dispatcher,
    crawler,
    pluginCache
);
const cliPlugin = require('./cli-plugin')(pluginCache);
const cliAdd = cliPlugin.add;
const cliRemove = cliPlugin.remove;

const HANDLERS = {
    list: listParserHandler,
    daemon: daemonHandler,
    crawl: crawlHandler,
    add: cliAdd,
    remove: cliRemove
};

// Get the command to run and its arguments
// Throw error if no command or multiple commands are passed
module.exports.runCommands = () => {
    // Get the command id
    const argsCopy = Object.assign({}, args);
    const commandArg = argsCopy['_'];

    if (!commandArg || commandArg.length !== 1) {
        throw new Error('Wrong command count');
    }

    const command = commandArg[0];

    if (!(command in HANDLERS)) {
        throw new Error(`No command ${command} found`);
    }

    // The command is valid,
    // Now get its params
    delete argsCopy['_'];
    const commandParams = argsCopy;

    const handler = HANDLERS[command];

    try {
        handler(commandParams);
    } catch (err) {
        log(err.message);
    }
};
