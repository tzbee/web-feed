module.exports = pluginCache => ({ _options }) => {
	_options.forEach(plugin => pluginCache.installPlugin(plugin));
};
