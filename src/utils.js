module.exports.isArray = arg =>
	(arg && arg.constructor && arg.constructor.name) === 'Array';
module.exports.isString = arg => arg && typeof arg === 'string';
module.exports.isObject = arg => arg && typeof arg === 'object';
