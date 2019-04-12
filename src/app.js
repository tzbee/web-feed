#!/usr/bin/env node

const minimist = require('minimist');
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
const removeCommand = require('./cli-commands/cli-remove')(pluginCache);
const installCommand = require('./cli-commands/cli-install')(pluginCache);
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

const parseArgv = () => {
	const args = minimist(process.argv.slice(2));

	const _args = args['_'];
	const command = _args[0];

	if (!(command in COMMAND_MAP)) {
		throw new Error(`No command ${command} found`);
	}

	const [, ..._options] = _args;
	const { _, ...namedOptions } = args; // eslint-disable-line no-unused-vars

	return {
		command,
		options: { _options, namedOptions }
	};
};

const { command, options } = parseArgv();

const handler = COMMAND_MAP[command];

try {
	handler(options);
} catch (err) {
	log(
		`Error while executing command ${command}:${err.message +
			'\n' +
			err.stack}`
	);
}
