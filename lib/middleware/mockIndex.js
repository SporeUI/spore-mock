var $fs = require('fs');
var $path = require('path');
var $lodash = require('lodash');
var $pug = require('pug');
var $ip = require('ip');
var $walkSync = require('walk-sync');
var $substitute = require('spore-kit-str/src/substitute');

function fillLinks(origin, arr, data) {
	arr.forEach(function(item) {
		if (typeof item === 'object') {
			origin.push({
				href: $substitute(item.href, data),
				text: $substitute(item.text, data)
			});
		} else if (typeof item === 'string') {
			origin.push({
				href: $substitute(item, data),
				text: $substitute(item, data)
			});
		}
	});

	return origin;
}

function mockIndex(options) {

	var conf = $lodash.assign({
		debug: false,
		ip: '127.0.0.1',
		port: '8091',
		indexPage: '',
		links: [],
		qrlinks: [],
		template: './',
		templateRoute: '/',
		render: []
	}, options);

	if (conf.debug) {
		console.log('');
		console.log('index config');
		console.log(conf);
	}

	var templates = [];
	if (typeof conf.template === 'string') {
		templates.push(conf.template);
	} else if (Array.isArray(conf.template)) {
		templates = templates.concat(conf.template);
	}

	var globs = [];
	if (Array.isArray(conf.render)) {
		globs = conf.render.map(function(item) {
			if (item && item.extname) {
				return '**/*.' + item.extname;
			} else {
				console.error('[spore-mock] render must have property: extname');
				return '';
			}
		});
	}

	var ignores = [];
	ignores.push('node_modules');
	ignores.push('.git');
	ignores.push('.svn');

	return function(req, res) {

		var pages = [];
		templates.forEach(function(entry) {
			var files = [];
			if (typeof entry === 'string') {
				files = $walkSync(entry, {
					globs: globs,
					ignore: ignores
				});
			}
			pages = pages.concat(files);
		});

		pages = pages.map(function(page) {
			return $path.join(conf.templateRoute, page);
		});

		var data = {
			port: conf.port,
			publicIp: $ip.address('public')
		};

		var mockData = {
			pages: pages,
			qrlinks: fillLinks([], conf.qrlinks, data),
			links: fillLinks([], conf.links, data)
		};

		var html = '';
		if (req.query.fedebug === 'json') {
			html = JSON.stringify(mockData);
		} else {
			if ($path.extname(conf.indexPage) === '.pug') {
				html = $pug.renderFile(conf.indexPage, {
					htmlWebpackPlugin: {
						options: {
							mock: mockData
						}
					}
				});
			} else {
				html = $fs.readFileSync(conf.indexPage, 'utf8');
			}
		}

		res.send(html);

		res.end();
	};
}

module.exports = mockIndex;

