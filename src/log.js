const getLocalTimeString = () => new Date().toLocaleTimeString();

module.exports = message => {
	const time = getLocalTimeString();
	const res = `[${time}] [WebFeed] ${message}\n`;
	process.stderr.write(res, 'utf-8');
};
