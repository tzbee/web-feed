const log = require('../log');

// Start the daemon
module.exports = (dispatcher, crawler, commandCache) => {
    return () => {
        dispatcher.on('CRAWL', ({ pluginID, options }) => {
            crawler
                .crawl(pluginID, options)
                .then(results => {
                    dispatcher.sendMessage({
                        command: 'CRAWL:RESULTS',
                        results
                    });
                })
                .catch(err => log(err.message + '\n' + err.stack));
        });

        dispatcher.on('LOAD_COMMANDS', () => {
            const commands = commandCache.get();
            dispatcher.sendMessage({
                command: 'LOAD_COMMANDS:RESPONSE',
                commands
            });
        });

        log('Listening to commands...');
        dispatcher.listen();
    };
};
