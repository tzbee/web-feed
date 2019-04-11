const log = require('../cli-log');

const displayCommand = ({
    id,
    title,
    description,
    args = [],
    returnFields = []
}) => {
    log('\n');
    log('ID:' + id);
    log('TITLE: ' + title);
    log('DESCRIPTION: ' + description);
    log('INPUT ARGUMENTS: ' + inputArgsToString(args));
    log('RESULT PROPS: ' + resultPropsToString(returnFields));
    log('\n');
};

const inputArgsToString = args => {
    return args.map(arg => arg.key).join(',');
};

const resultPropsToString = props => {
    return props.map(({ label }) => label).join(',');
};

module.exports = pluginCache => {
    return () => {
        try {
            const commands = pluginCache.get();
            log('\n=== COMMANDS ===\n');
            if (commands && commands.length > 0) {
                commands.forEach(displayCommand);
            } else {
                log('NO COMMAND REGISTERED');
            }
        } catch (err) {
            log(`\nCannot find command list: ${err.message}`);
        }
    };
};
