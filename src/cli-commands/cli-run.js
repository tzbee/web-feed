const log = require('../cli-log');

/*
    Options

        plugin the plugin id
        command the command id to run 
        _ The command arguments
*/
module.exports = pluginRunner => {
    return ({ _options, namedOptions }) => {
        const plugin = _options[0];

        if (!plugin) {
            throw new Error('No plugin command specified');
        }

        pluginRunner.run(plugin, namedOptions).then(results => {
            results.map(result => result.title || result.id).forEach(log);
        });
    };
};
