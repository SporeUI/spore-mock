const $fs = require('fs');
const $path = require('path');
const $lodash = require('lodash');
const $util = require('../util');
const $mock = require('mockjs');
const $colors = require('colors/safe');
const $stacktracey = require('stacktracey');

const getFile = (filepath, extname) => {
	const obj = $path.parse(filepath);
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
};

const execErrMsg = (err, title) => {
	const stack = new $stacktracey(err);
	const msglist = [
		'[spore-mock] ' + title + ':',
		err.message,
		stack.pretty
	];
	msglist.forEach(msg => {
		console.error($colors.red(msg));
	});
	return msglist.join('\n');
};

const mockEntry = options => {

	const conf = $lodash.assign({
		debug: false,
		template: './',
		templateRoute: '/',
		mock: './',
		render: [],
		// Format output data for template files
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

		// Get relative path from root
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

		// Support multi type template
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

		// Get mock data from local file
		// Clear require cache
		let mockData = null;
		if (mockFile) {
			$util.clearRequireCache();

			try {
				mockData = require(mockFile);

				// Execute if module.exports is function
				if (typeof mockData === 'function') {
					mockData = mockData(req, res);
				}
			} catch (err) {
				mockData = null;
				execErrMsg(err, 'Get mock data error');
			}

			// By pass if mockData is undefined or null
			if (mockData == null) {
				next();
				return;
			}

			// Gnenete mock data by mockjs
			mockData = $mock.mock(mockData);
		}

		let html = null;

		// Wrap mock data by config
		let htmlData = conf.mockFormat(mockData);

		if (templateFile) {
			// Has same relative path template
			// Render the template
			if (req.query.fedebug === 'json') {
				// If path has query: ?fedebug=json , render the json
				html = JSON.stringify(mockData);
			} else {
				// Find the proper template file
				$util.eachRender(conf.render, item => {
					let file = getFile(templateFilePath, '.' + item.extname);
					if (file) {
						try {
							html = item.parse(file, htmlData);
						} catch (err) {
							html = execErrMsg(err, 'File parse error');
						}
						return false;
					}
				});
			}
		} else if (mockFile) {
			// Can not find template file
			// Render the json
			$util.clearRequireCache();
			const output = JSON.stringify(mockData);
			const callback = req.query.callback;
			if (callback) {
				// Render jsonp format
				res.setHeader('Content-Type', 'application/x-javascript');
				html = callback + '(' + output + ');';
			} else {
				// Render json format
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

