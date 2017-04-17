var $fs = require('fs');
var $path = require('path');
var $lodash = require('lodash');
var $pug = require('pug');
var $walkSync = require('walk-sync');
var $util = require('../util');
var $mock = require('mockjs');

function mockEntry(options) {

	var conf = $lodash.assign({
		debug: false,
		entry: {
			path: '',
			globs: ['**/*.pug', '**/*.html']
		},
		mock: {
			path: '',
			globs: ['**/*.js']
		}
	}, options);

	return function(req, res, next) {

		var entryFiles = $walkSync(conf.entry.path, {
			globs: conf.entry.globs
		});

		var entryMap = entryFiles.reduce(function(map, file) {
			map[$util.cleanPath(file)] = file;
			return map;
		}, {});

		var mockFiles = $walkSync(conf.mock.path, {
			globs: conf.mock.globs
		});

		var mockMap = mockFiles.reduce(function(map, file) {
			map[$util.cleanPath(file)] = file;
			return map;
		}, {});

		if (conf.debug) {
			console.log('entryFiles:', entryFiles);
			console.log('entryMap:', entryMap);
			console.log('mockFiles:', mockFiles);
			console.log('mockMap:', mockMap);
		}

		var reqCleanPath = $util.cleanPath(req.path);

		if (entryMap[reqCleanPath]) {
			var entryFile = $path.resolve(conf.entry.path, entryMap[reqCleanPath]);

			if (conf.debug) {
				console.log('entryFile:', entryFile, 'exists:', $fs.existsSync(entryFile));
			}

			if ($fs.existsSync(entryFile) && mockMap[reqCleanPath]) {
				var mockFile = $path.resolve(conf.mock.path, mockMap[reqCleanPath]);

				if (conf.debug) {
					console.log('mockFile:', mockFile, 'exists:', $fs.existsSync(mockFile));
				}

				var html = '';

				if ($fs.existsSync(mockFile) && $path.extname(entryFile) === '.pug') {
					$util.clearRequireCache();
					var mockData = require(mockFile);

					mockData = $mock.mock(mockData);

					if (typeof mockData.resolve === 'function') {
						mockData = mockData.resolve(req, res);
					}

					if (req.query.fedebug === 'json') {
						html = JSON.stringify(mockData);
					} else {
						html = $pug.renderFile(entryFile, {
							htmlWebpackPlugin: {
								options: {
									mock: mockData
								}
							}
						});
					}

					res.send(html);
					res.end();
				} else {
					next();
				}
			} else {
				next();
			}
		} else {
			next();
		}
	};

}

module.exports = mockEntry;

