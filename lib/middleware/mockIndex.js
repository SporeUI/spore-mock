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
		page: {
			path: '',
			globs: ['**/*.pug', '**/*.html']
		}
	}, options);

	if (conf.debug) {
		console.log('');
		console.log('index config');
		console.log(conf);
	}

	return function(req, res) {

		var extname = $path.extname(conf.indexPage);
		var pages = $walkSync(conf.page.path, {
			globs: conf.page.globs
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
			if (extname === '.pug') {
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

