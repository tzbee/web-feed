const log = require('./log');
const path = require('path');
const fs = require('fs');

const npmWrapper = new (require('./NPMWrapper'))({ log });

const configFilePath = '../plugins.json';

module.exports = class PluginCache {
	constructor() {
		this.plugins = {};
		this._load();
	}

	add(module) {
		return this._installModule(module)
			.then(moduleID => this._registerModule(moduleID))
			.catch(err => log(`${err.message}\n${err.stack}`));
	}

	remove(module) {
		return this._uninstallModule(module)
			.then(moduleID => this._unregisterModule(moduleID))
			.catch(err => log(`${err.message}\n${err.stack}`));
	}

	get() {
		return Object.values(this.plugins);
	}

	_load() {
		log('Loading commands');

		// Get the plugin modules to load
		const pluginModuleIDs = this._loadPluginIDs();

		// Load the plugin modules into the cache
		const commandMap = pluginModuleIDs.reduce((map, pluginID) => {
			const commands = require(pluginID);
			commands.forEach(Command => {
				const command = new Command({ log: log });
				map[command.id] = command;
			});
			return map;
		}, {});

		this.plugins = commandMap;

		log('Command modules loaded');
	}

	getCommandByID(id) {
		log(`Finding command with id ${id}`);
		const command = this.plugins[id];
		if (!command) throw new Error(`Cannot find command with id ${id}`);
		return command;
	}

	serialize() {
		const plugins = this.get();

		return plugins.map(plugin => {
			plugin.commands = plugin.commands.map(command =>
				this._serializeCommand(command)
			);
			return plugin;
		});
	}

	_serializeCommand(command) {
		const commandCopy = Object.assign({}, command);
		delete commandCopy['fn'];
		return commandCopy;
	}

	// Async
	// Returns Promise resolving in the module ID

	_installModule(modulePath) {
		log(`Installing module from ${modulePath}`);
		return npmWrapper.install([modulePath]).then(output => {
			log(output);
			const moduleID = this._getModuleID(modulePath);
			log(`Module ${moduleID} installed`);
			return moduleID;
		});
	}

	// Async
	// Returns Promise
	_uninstallModule(moduleID) {
		log(`Uninstalling module ${moduleID}`);
		return npmWrapper.remove([moduleID]).then(output => {
			log(output);
			log(`Module ${moduleID} removed`);
			return moduleID;
		});
	}

	/*
        Sync
    */
	_loadPluginIDs() {
		log(`Loading plugins from config file ${configFilePath}`);
		return require(configFilePath);
	}

	// Sync
	_getModuleID(packagePath) {
		const packageConfig = require(path.resolve(
			packagePath,
			'package.json'
		));
		return packageConfig && packageConfig.name;
	}

	// Async
	// Returns Promise
	_writeToPluginFile(pluginIDs) {
		return new Promise((resolve, reject) => {
			fs.writeFile(
				path.resolve(__dirname, configFilePath),
				JSON.stringify(pluginIDs),
				err => {
					if (!err) {
						resolve();
					} else {
						reject(err);
					}
				}
			);
		});
	}

	// Async
	// Returns Promise
	_registerModule(moduleID) {
		const pluginIDs = this._loadPluginIDs();
		const pluginIDMap = pluginIDs.reduce(
			(res, pluginID) => (res[pluginID] = pluginID) && res,
			{}
		);
		pluginIDMap[moduleID] = moduleID;
		const newPluginIDs = Object.values(pluginIDMap);
		return this._writeToPluginFile(newPluginIDs);
	}

	_unregisterModule(moduleID) {
		const pluginIDs = this._loadPluginIDs();
		const pluginIDMap = pluginIDs.reduce(
			(res, pluginID) => (res[pluginID] = pluginID) && res,
			{}
		);
		delete pluginIDMap[moduleID];
		const newPluginIDs = Object.values(pluginIDMap);

		return this._writeToPluginFile(newPluginIDs);
	}
};
