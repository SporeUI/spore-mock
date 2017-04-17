var $fs = require('fs');
var $path = require('path');
var $lodash = require('lodash');
var $walkSync = require('walk-sync');
var $util = require('../util');
var $mock = require('mockjs');

function mockApi(options) {

	var conf = $lodash.assign({
		debug: false,
		api: {
			path: '',
			globs: ['**/*.js']
		}
	}, options);

	return function(req, res, next) {

		var apiFiles = $walkSync(conf.api.path, {
			globs: conf.api.globs
		});

		var apiMap = apiFiles.reduce(function(map, file) {
			map[$util.cleanPath(file)] = file;
			return map;
		}, {});

		if (conf.debug) {
			console.log('apiFiles:', apiFiles);
			console.log('apiMap:', apiMap);
		}

		var reqCleanPath = $util.cleanPath(req.path);
		if (apiMap[reqCleanPath]) {
			var apiFile = $path.resolve(conf.api.path, apiMap[reqCleanPath]);

			if (conf.debug) {
				console.log('apiFile:', apiFile, 'exists:', $fs.existsSync(apiFile));
				console.log('query:', req.query);
			}

			if ($fs.existsSync(apiFile)) {
				$util.clearRequireCache();

				var mockData = require(apiFile);
				mockData = $mock.mock(mockData);

				if (typeof mockData === 'function') {
					mockData = mockData(req, res);
				}

				var output = JSON.stringify(mockData);

				var callback = req.query.callback;
				if (callback) {
					res.setHeader('Content-Type', 'application/x-javascript');
					output = callback + '(' + output + ');';
				} else {
					res.setHeader('Content-Type', 'application/json');
				}

				res.send(output);
				res.end();
			}

		} else {
			next();
		}
	};

}

module.exports = mockApi;

