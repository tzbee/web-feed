const log = require('./log');

module.exports = class Crawler {
    constructor(commandCache) {
        this.commandCache = commandCache;
    }

    // Async
    crawl(commandID, options) {
        try {
            const command = this.commandCache.getCommandByID(commandID);

            const normalizedOptions = this._normalizeCommandProps(
                command,
                options
            );

            log(
                `Running command ${commandID} with options ${JSON.stringify(
                    normalizedOptions
                )}`
            );

            return command.run(normalizedOptions);
        } catch (err) {
            return Promise.reject(
                new Error(`There was a problem while crawling: ${err.message}`)
            );
        }
    }

    _normalizeCommandProps(command, props) {
        log(`Normalizing command props for command ${command.id}`);

        const normalizedPropList = command.args.map(
            ({ key, type, default: defaultValue }) => {
                const propValue = props[key];

                if (!propValue || !this._checkPropType(propValue, type)) {
                    return { key, value: defaultValue };
                } else {
                    return { key, value: propValue };
                }
            }
        );

        return normalizedPropList.reduce((res, prop) => {
            res[prop.key] = prop.value;
            return res;
        }, {});
    }

    _isArray(arg) {
        return (arg && arg.constructor && arg.constructor.name) === 'Array';
    }

    _isString(arg) {
        return typeof arg === 'string';
    }

    _checkPropType(propValue, type) {
        const map = {
            Array: this._isArray,
            Selection: this._isArray,
            Query: arg => typeof arg === 'object'
        };

        const typeCheckFn = map[type] || this._isString;
        return (typeCheckFn && typeCheckFn(propValue)) || false;
    }
};
