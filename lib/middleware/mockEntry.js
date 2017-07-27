var $fs = require('fs');
var $path = require('path');
var $lodash = require('lodash');
var $util = require('../util');
var $mock = require('mockjs');
var $colors = require('colors/safe');

function getFile(filepath, extname) {
	var obj = $path.parse(filepath);
	filepath = $path.format({
		dir: obj.dir,
		root: obj.root,
		name: obj.base,
		ext: extname
	});

	if ($fs.accessSync(filepath)) {
		return filepath;
	} else {
		return '';
	}
}

function mockEntry(options) {

	var conf = $lodash.assign({
		debug: false,
		template: './',
		templateRoute: '/',
		mock: './',
		render: [],
		// Mock 数据统一格式化
		mockFormat: function(mockData) {
			return {
				htmlWebpackPlugin: {
					options: {
						mock: mockData
					}
				}
			};
		}
	}, options);

	return function(req, res, next) {

		if (conf.debug) {
			console.log('req.path:', req.path);
		}

		var reqCleanPath = '';
		if (conf.templateRoute && req.path.indexOf(conf.templateRoute) >= 0) {
			var relativePath = $path.relative(conf.templateRoute, req.path);
			if (conf.debug) {
				console.log('relativePath:', relativePath);
			}
			reqCleanPath = $util.cleanPath(relativePath);
		} else {
			reqCleanPath = $util.cleanPath(req.path);
		}

		var templateFilePath = $path.resolve(conf.template, reqCleanPath);
		var mockFilePath = $path.resolve(conf.mock, reqCleanPath);

		if (conf.debug) {
			console.log('reqCleanPath:', reqCleanPath);
			console.log('templateFilePath:', templateFilePath);
			console.log('mockFilePath:', mockFilePath);
		}

		var templateFile = '';
		var mockFile = '';

		mockFile = getFile(mockFilePath, '.js');

		$util.eachRender(conf.render, function(item) {
			var file = getFile(templateFilePath, '.' + item.extname);
			if (file) {
				templateFile = file;
				return false;
			}
		});

		if (conf.debug) {
			console.log('templateFile:', templateFile);
			console.log('mockFile:', mockFile);
		}

		var mockData = {};
		if (mockFile) {
			$util.clearRequireCache();
			mockData = require(mockFile);

			if (typeof mockData === 'function') {
				mockData = mockData(req, res);
			}

			mockData = $mock.mock(mockData);
		}

		var htmlData = conf.mockFormat(mockData);

		var html = null;

		if (templateFile) {
			if (req.query.fedebug === 'json') {
				html = JSON.stringify(mockData);
			} else {
				$util.eachRender(conf.render, function(item) {
					var file = getFile(templateFilePath, '.' + item.extname);
					if (file) {
						try {
							html = item.parse(file, htmlData);
						} catch (err) {
							console.log($colors.red('[spore-mock] file parse error:' + file + '\n' + err));
							html = err.msg;
						}
						return false;
					}
				});
			}
		} else if (mockFile) {
			$util.clearRequireCache();
			var output = JSON.stringify(mockData);
			var callback = req.query.callback;
			if (callback) {
				res.setHeader('Content-Type', 'application/x-javascript');
				html = callback + '(' + output + ');';
			} else {
				res.setHeader('Content-Type', 'application/json');
				html = output;
			}
		}

		if (html !== null) {
			res.send(html);
			res.end();
		} else {
			next();
		}

	};

}

module.exports = mockEntry;

