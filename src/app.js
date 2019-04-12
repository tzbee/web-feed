#!/usr/bin/env node

const args = require('minimist')(process.argv.slice(2));
const log = require('./cli-log');

const PluginCache = require('./PluginCache');
const PluginRunner = require('./PluginRunner');
const StdioDispatcher = require('./StdioDispatcher');

const pluginCache = new PluginCache();

const dispatcher = new StdioDispatcher();
const pluginRunner = new PluginRunner(pluginCache);

/*
	CLI commands
*/
const listCommand = require('./cli-commands/cli-list')(pluginCache);
const runCommand = require('./cli-commands/cli-run')(pluginRunner);
const {
	install: installCommand,
	remove: removeCommand
} = require('./cli-commands/cli-plugin')(pluginCache);
const daemonCommand = require('./cli-commands/cli-daemon')(
	dispatcher,
	pluginRunner,
	pluginCache
);

/*
	Map the command names to the commands
*/
const COMMAND_MAP = {
	list: listCommand,
	daemon: daemonCommand,
	run: runCommand,
	install: installCommand,
	remove: removeCommand
};

// Get the command to run and its arguments
// Throw error if no command or multiple commands are passed

// Get the command id
const argsCopy = Object.assign({}, args);
const commandArg = argsCopy['_'];

if (!commandArg || commandArg.length !== 1) {
	throw new Error('Wrong command count');
}

const command = commandArg[0];

if (!(command in COMMAND_MAP)) {
	throw new Error(`No command ${command} found`);
}

// The command is valid,
// Now get its params
delete argsCopy['_'];
const commandParams = argsCopy;

const handler = COMMAND_MAP[command];

try {
	handler(commandParams);
} catch (err) {
	log(err.message + '\n' + err.stack);
}
