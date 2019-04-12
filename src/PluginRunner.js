const log = require('./log');
const { isArray, isObject } = require('./utils');

module.exports = class PluginRunner {
    constructor(pluginCache) {
        this.pluginCache = pluginCache;
    }

    // Async
    run(pluginID, options) {
        try {
            const plugin = this.pluginCache.getPluginByID(pluginID);

            const normalizedOptions = this._normalizeCommandProps(
                plugin,
                options
            );

            log(
                `Running plugin ${pluginID} with options ${JSON.stringify(
                    normalizedOptions
                )}`
            );

            return plugin.run(normalizedOptions);
        } catch (err) {
            return Promise.reject(
                new Error(
                    `There was a problem while runing plugin: ${err.message}`
                )
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

    _checkPropType(propValue, type) {
        const map = {
            Array: isArray,
            Selection: isArray,
            Query: isObject
        };

        const typeCheckFn = map[type] || this._isString;
        return (typeCheckFn && typeCheckFn(propValue)) || false;
    }
};
