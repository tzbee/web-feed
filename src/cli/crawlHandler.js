const log = require('./cli-log');


/*
    Options

        plugin the plugin id
        command the command id to run 
        _ The command arguments
*/
module.exports = crawler => {
    return (cliOptions) => {
        const { command } = cliOptions;

        // Isolate the command options
        const crawlerOptions = Object.assign({}, cliOptions);
        delete crawlerOptions['command'];

        crawler.crawl(command, crawlerOptions)
            .then(results => {
                results
                    .map(result => result.title || result.id)
                    .forEach(log);
            })
            .catch(err => log(err.message));
    };
};