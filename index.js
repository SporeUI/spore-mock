var $fs = require('fs');
var $path = require('path');
var $lodash = require('lodash');
var $server = require('./lib/server');

function SporeMock(options) {
	var conf = $lodash.assign({
		debug: false,
		configFilePath: ''
	}, options);

	var configFilePath = '';
	if (conf.configFilePath) {
		configFilePath = $path.resolve(process.cwd(), conf.configFilePath);
	}

	if (conf.debug) {
		console.log('----');
		console.log('configFilePath:', configFilePath);
	}

	var serverConfig = {};
	if (configFilePath) {
		if ($fs.existsSync(configFilePath)) {
			serverConfig = require(configFilePath);
		}
		serverConfig = serverConfig || {};
	}

	if (conf.debug) {
		console.log('----');
		console.log('serverConfig:');
		console.log(serverConfig);
	}

	serverConfig.debug = conf.debug || serverConfig.debug;

	return $server(serverConfig);
}

module.exports = SporeMock;
