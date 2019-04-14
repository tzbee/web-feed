const log = require('./log');
const path = require('path');
const fs = require('fs-extra');

const DEFAULT_PLUGIN_DIR = path.resolve(
	require('app-root-path').toString(),
	'plugins'
);

module.exports = class PluginCache {
	constructor(pluginsDir = DEFAULT_PLUGIN_DIR) {
		this.pluginsDir = pluginsDir;
		this.plugins = {};
		this._load();
	}

	installPlugin(pluginPath) {
		pluginPath = path.resolve(pluginPath);
		const pluginID = path.parse(pluginPath).name;
		const destPluginPath = path.join(this.pluginsDir, pluginID);

		log(`Installing plugin ${pluginID}`);
		log(`Copying ${pluginPath} to ${destPluginPath}`);

		fs.removeSync(destPluginPath);
		fs.copySync(pluginPath, destPluginPath);

		log(`Plugin ${pluginID} installation complete`);
	}

	uninstallPlugin(pluginID) {
		log(`Uninstalling plugin ${pluginID}`);
		const pluginPath = path.join(this.pluginsDir, pluginID);
		log(`Removing directory ${pluginPath}`);
		fs.removeSync(pluginPath);
		log(`Plugin ${pluginID} uninstallation complete`);
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

		log('Plugin modules loaded');
	}

	getPluginByID(id) {
		log(`Finding plugin with id ${id}`);
		const plugin = this.plugins[id];
		if (!plugin) throw new Error(`Cannot find plugin with id ${id}`);
		return plugin;
	}
};
