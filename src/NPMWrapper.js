const { exec } = require('child_process');

const appRoot = require('app-root-path').toString();

const DEFAULT_LOG = message => console.log(message);

module.exports = class NPMWrapper {
	constructor(options = {}) {
		this.log = options.log || DEFAULT_LOG;
	}

	// todo sanitize args before calling the command
	// async @returns Promise resolving in the IDs of the installed modules
	install(packageIDs = []) {
		return new Promise((resolve, reject) => {
			const command = `npm install --save ${packageIDs.join(' ')}`;

			this.log(`Running command ${command}`);

			exec(
				command,
				{
					cwd: appRoot
				},
				(err, stdout, stderr) => {
					if (!err) {
						resolve(stdout);
					} else {
						reject(
							new Error(
								`There was an issue with npm child process, code: ${
									err.code
								}, signal: ${err.signal}\n${stderr}`
							)
						);
					}
				}
			);
		});
	}

	// todo sanitize args before calling the command
	// async @returns Promise resolving in the IDs of the installed modules
	remove(packageIDs = []) {
		return new Promise((resolve, reject) => {
			const command = `npm remove ${packageIDs.join(' ')}`;

			this.log(`Running command ${command}`);

			exec(
				command,
				{
					cwd: appRoot
				},
				(err, stdout, stderr) => {
					if (!err) {
						resolve(stdout);
					} else {
						reject(
							new Error(
								`There was an issue with npm child process, code: ${
									err.code
								}, signal: ${err.signal}\n${stderr}`
							)
						);
					}
				}
			);
		});
	}
};
