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
	const msglist = [];
	if (title) {
		msglist.push('[spore-mock] ' + title + ':');
	}
	if (err instanceof Error) {
		const stack = new $stacktracey(err);
		msglist.push(err.message);
		msglist.push(stack.pretty);
	} else if (err) {
		msglist.push(err);
	}
	msglist.forEach(msg => {
		console.log($colors.red(msg));
	});
	return msglist.join('\n');
};

const mockEntry = options => {

	const conf = $lodash.assign({
		debug: false,
		template: './',
		ignore: '',
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

		req.query = req.query || {};
		req.body = req.body || {};
		req.para = Object.assign(
			{},
			$lodash.cloneDeep(req.query),
			$lodash.cloneDeep(req.body)
		);

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

		// exclude ignore files
		if (conf.ignore && $util.isIgnored(reqCleanPath, conf.ignore)) {
			next();
			return;
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
		let pm = new Promise((resolve, reject) => {
			if (mockFile) {
				$util.clearRequireCache();
				try {
					let mod = require(mockFile);

					// Execute if module.exports is function
					if (typeof mod === 'function') {
						let result = mod(req, res);
						if (result instanceof Promise) {
							result.then(rs => {
								resolve(rs);
							}).catch(err => reject(err));
						} else {
							resolve(result);
						}
					} else if (mod instanceof Promise) {
						mod.then(rs => {
							resolve(rs);
						}).catch(err => reject(err));
					} else {
						resolve(mod);
					}
				} catch (err) {
					reject(new Error('Get mock data error'));
				}
			} else {
				resolve(null);
				console.log($colors.yellow('Can not find mockFile: /' + reqCleanPath));
			}
		});

		pm.then(mockData => {
			if (mockData) {
				try {
					// Gnenete mock data by mockjs
					mockData = $mock.mock(mockData);
				} catch (err) {
					execErrMsg(err, 'Exec Mock.mock error');
				}
			}

			let html = null;

			try {
				// Wrap mock data with config mockFormat option
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
			} catch (err) {
				console.log('mockData:', mockData);
				execErrMsg(err, 'Render error');
				next();
				return;
			}

			if (html) {
				res.send(html);
				res.end();
			} else {
				next();
			}
		}).catch(err => {
			execErrMsg(err, 'Get mock data error');
			next();
		});
	};
};

module.exports = mockEntry;

