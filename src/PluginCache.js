const log = require('./log');
const path = require('path');
const fs = require('fs');

const DEFAULT_PLUGIN_DIR = path.resolve(
	require('app-root-path').toString(),
	'..',
	'plugins'
);

module.exports = class PluginCache {
	constructor(pluginsDir = DEFAULT_PLUGIN_DIR) {
		this.pluginsDir = pluginsDir;
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

	_readPluginDir() {
		const { pluginsDir } = this;
		log(`Reading plugin directory ${pluginsDir}`);

		// for now, we assume the plugin directory content contains valid plugin packages
		// TODO Validity checks
		const dirContent = fs.readdirSync(pluginsDir);

		log(`Found ${dirContent.length} plugins`);
		return dirContent.map(pluginDirName => {
			return {
				id: pluginDirName,
				path: path.join(pluginsDir, pluginDirName)
			};
		});
	}

	// Sync
	_load() {
		log('Loading plugins');

		// Get the plugin modules to load
		const plugins = this._readPluginDir();

		// Load the plugin modules into the cache
		const pluginMap = plugins.reduce(
			(map, { id: pluginID, path: pluginPath }) => {
				try {
					log(`Loading plugin ${pluginID}`);

					const commands = require(pluginPath);
					commands.forEach(Command => {
						const command = new Command({ log: log });
						map[command.id] = command;
					});

					log(`Plugin ${pluginID} loaded`);
					return map;
				} catch (err) {
					log(`Error loading plugin: ${err.message}`);
					return map;
				}
			},
			{}
		);

		this.plugins = pluginMap;

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
	// todo create file if it does not exist
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
