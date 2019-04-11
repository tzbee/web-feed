const log = require('../log');

// Start the daemon
module.exports = (dispatcher, pluginRunner, pluginCache) => {
    return () => {
        dispatcher.on('RUN_PLUGIN', ({ pluginID, options }) => {
            pluginRunner
                .run(pluginID, options)
                .then(results => {
                    dispatcher.sendMessage({
                        command: 'CRAWL:RESULTS',
                        results
                    });
                })
                .catch(err => log(err.message + '\n' + err.stack));
        });

        dispatcher.on('LOAD_COMMANDS', () => {
            const commands = pluginCache.get();
            dispatcher.sendMessage({
                command: 'LOAD_COMMANDS:RESPONSE',
                commands
            });
        });

        log('Listening to commands...');
        dispatcher.listen();
    };
};
