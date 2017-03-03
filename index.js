var $fs = require('fs');
var $lodash = require('lodash');
var $server = require('./lib/server');

function SporeMock(options) {
	var conf = $lodash.assign({
		debug: false,
		configFilePath: ''
	}, options);

	var serverConfig = {};
	if (conf.configFilePath) {
		if (!$fs.existsSync(conf.configFilePath)) {
			serverConfig = require(conf.configFilePath);
		}
		serverConfig = serverConfig || {};
	}

	return $server(serverConfig);
}

module.exports = SporeMock;
