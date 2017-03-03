var $fs = require('fs');
var $path = require('path');
var $lodash = require('lodash');
var $pug = require('pug');
var $ip = require('ip');
var $walkSync = require('walk-sync');

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
		var html = '';

		var pages = $walkSync(conf.page.path, {
			globs: conf.page.globs
		});

		var publicPath = 'http://' + $ip.address('public') + ':' + conf.port;
		var qrlinks = [];
		qrlinks.push({
			href: publicPath,
			text: publicPath
		});

		qrlinks = qrlinks.concat(conf.qrlinks);

		if (extname === '.pug') {
			html = $pug.renderFile(conf.indexPage, {
				htmlWebpackPlugin: {
					options: {
						mock: {
							pages: pages,
							qrlinks: qrlinks,
							links: conf.links
						}
					}
				}
			});
			res.send(html);
		} else {
			html = $fs.readFileSync(conf.indexPage, 'utf8');
			res.send(html);
		}

		res.end();
	};
}

module.exports = mockIndex;

