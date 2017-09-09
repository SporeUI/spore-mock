const $fs = require('fs');
const $path = require('path');
const $lodash = require('lodash');
const $util = require('../util');
const $mock = require('mockjs');
const $colors = require('colors/safe');

const getFile = (filepath, extname) => {
	const obj = $path.parse(filepath);
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
};

const mockEntry = options => {

	const conf = $lodash.assign({
		debug: false,
		template: './',
		templateRoute: '/',
		mock: './',
		render: [],
		// Mock 数据统一格式化
		mockFormat: mockData => ({
			htmlWebpackPlugin: {
				options: {
					mock: mockData
				}
			}
		})
	}, options);

	return (req, res, next) => {

		if (conf.debug) {
			console.log('req.path:', req.path);
		}

		let reqCleanPath = '';
		if (conf.templateRoute && req.path.indexOf(conf.templateRoute) >= 0) {
			let relativePath = $path.relative(conf.templateRoute, req.path);
			if (conf.debug) {
				console.log('relativePath:', relativePath);
			}
			reqCleanPath = $util.cleanPath(relativePath);
		} else {
			reqCleanPath = $util.cleanPath(req.path);
		}

		let templateFilePath = $path.resolve(conf.template, reqCleanPath);
		let mockFilePath = $path.resolve(conf.mock, reqCleanPath);

		if (conf.debug) {
			console.log('reqCleanPath:', reqCleanPath);
			console.log('templateFilePath:', templateFilePath);
			console.log('mockFilePath:', mockFilePath);
		}

		let templateFile = '';
		let mockFile = '';

		mockFile = getFile(mockFilePath, '.js');

		$util.eachRender(conf.render, item => {
			let file = getFile(templateFilePath, '.' + item.extname);
			if (file) {
				templateFile = file;
				return false;
			}
		});

		if (conf.debug) {
			console.log('templateFile:', templateFile);
			console.log('mockFile:', mockFile);
		}

		let mockData = {};
		if (mockFile) {
			$util.clearRequireCache();
			mockData = require(mockFile);

			if (typeof mockData === 'function') {
				mockData = mockData(req, res);
			}

			mockData = $mock.mock(mockData);
		}

		let htmlData = conf.mockFormat(mockData);

		let html = null;

		if (templateFile) {
			if (req.query.fedebug === 'json') {
				html = JSON.stringify(mockData);
			} else {
				$util.eachRender(conf.render, item => {
					let file = getFile(templateFilePath, '.' + item.extname);
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
			const output = JSON.stringify(mockData);
			const callback = req.query.callback;
			if (callback) {
				res.setHeader('Content-Type', 'application/x-javascript');
				html = callback + '(' + output + ');';
			} else {
				res.setHeader('Content-Type', 'application/json');
				html = output;
			}
		}

		if (html) {
			res.send(html);
			res.end();
		} else {
			next();
		}

	};

};

module.exports = mockEntry;

