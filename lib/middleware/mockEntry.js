var $fs = require('fs');
var $path = require('path');
var $lodash = require('lodash');
var $util = require('../util');
var $mock = require('mockjs');

function getFile(filepath, extname) {
	var obj = $path.parse(filepath);
	filepath = $path.format({
		dir: obj.dir,
		root: obj.root,
		name: obj.base,
		ext: extname
	});

	if ($fs.existsSync(filepath)) {
		return filepath;
	} else {
		return '';
	}
}

function mockEntry(options) {

	var conf = $lodash.assign({
		debug: false,
		entry: './',
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

	var entries = [];
	if (typeof conf.entry === 'string') {
		entries.push(conf.entry);
	} else if (Array.isArray(conf.entry)) {
		entries = entries.concat(conf.entry);
	}

	return function(req, res, next) {

		var reqCleanPath = $util.cleanPath(req.path);
		var entryFilePath = $path.resolve(conf.entry, reqCleanPath);
		var mockFilePath = $path.resolve(conf.mock, reqCleanPath);

		if (conf.debug) {
			console.log('reqCleanPath:', reqCleanPath);
			console.log('entryFilePath:', entryFilePath);
			console.log('mockFilePath:', mockFilePath);
		}

		var entryFile = '';
		var mockFile = '';

		mockFile = getFile(mockFilePath, '.js');

		$util.eachRender(conf.render, function(item) {
			var file = getFile(entryFilePath, '.' + item.extname);
			if (file) {
				entryFile = file;
				return false;
			}
		});

		if (conf.debug) {
			console.log('entryFile:', entryFile);
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

		if (entryFile) {
			if (req.query.fedebug === 'json') {
				html = JSON.stringify(mockData);
			} else {
				$util.eachRender(conf.render, function(item) {
					var file = getFile(entryFilePath, '.' + item.extname);
					if (file) {
						html = item.parse(file, htmlData);
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

