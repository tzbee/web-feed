const log = require('../log');

// Start the daemon
module.exports = (dispatcher, crawler, commandCache) => {
    return () => {
        dispatcher.on('CRAWL', ({ commandID, options }) => {
            crawler
                .crawl(commandID, options)
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
