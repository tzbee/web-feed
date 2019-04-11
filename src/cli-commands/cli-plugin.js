module.exports = pluginCache => {
	return {
		add: ({ module }) => pluginCache.add(module),
		remove: ({ module }) => pluginCache.remove(module)
	};
};
