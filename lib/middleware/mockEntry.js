var $fs = require('fs');
var $path = require('path');
var $lodash = require('lodash');
var $pug = require('pug');
var $walkSync = require('walk-sync');
var $util = require('../util');

function mockEntry(options) {

	var conf = $lodash.assign({
		debug: false,
		dist: {
			path: '',
			globs: ['**/*.html']
		},
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

		var distFiles = $walkSync(conf.dist.path, {
			globs: conf.dist.globs
		});

		var distMap = distFiles.reduce(function(map, file) {
			map[$util.cleanPath(file)] = file;
			return map;
		}, {});

		if (conf.debug) {
			console.log('entryFiles:', entryFiles);
			console.log('entryMap:', entryMap);
			console.log('mockFiles:', mockFiles);
			console.log('mockMap:', mockMap);
			console.log('distFiles:', distFiles);
			console.log('distMap:', distMap);
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
					Object.keys(require.cache).forEach(function(moduleName) {
						delete require.cache[moduleName];
					});
					var mockData = require(mockFile);

					if (typeof mockData === 'function') {
						mockData = mockData(req, res);
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

						if (distMap[reqCleanPath]) {
							var distFile = $path.resolve(conf.dist.path, distMap[reqCleanPath]);

							if (conf.debug) {
								console.log('distFile:', distFile, 'exists:', $fs.existsSync(distFile));
							}

							if ($fs.existsSync(distFile)) {
								var distHtml = $fs.readFileSync(distFile, 'utf8');
								var distCss = '';
								var distScript = '';

								var distCssMatch = (/(<link[^>]+)><\/head>/).exec(distHtml);
								if (distCssMatch && distCssMatch[1]) {
									distCss = distCssMatch[0];
								}

								if (distCss) {
									html = html.replace('</head>', distCss);
								}

								var distScriptMath = (/(<script[^>]+><\/script>)<\/body>/).exec(distHtml);
								if (distScriptMath && distScriptMath[1]) {
									distScript = distScriptMath[0];
								}

								if (distScript) {
									html = html.replace('</body>', distScript);
								}

								// 有时 webpack 生成的 html 会呈现错误信息
								// 此时应当呈现错误信息提醒开发者重启 webpack 编译
								var headMatch = /<head>/.exec(distHtml);
								if (!headMatch) {
									html = distHtml;
								}
							}
						}
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

