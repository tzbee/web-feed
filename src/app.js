#!/usr/bin/env node

const { runCommands } = require('./cli/crawler-cli');
const log = require('./log');

try {
	runCommands();
} catch (err) {
	log(err.message);
}
