module.exports = pluginCache => {
	return {
		install: ({ plugin }) => pluginCache.installPlugin(plugin),
		remove: ({ plugin }) => pluginCache.uninstallPlugin(plugin)
	};
};
