var $fs = require('fs');
var $path = require('path');
var $lodash = require('lodash');
var $pug = require('pug');
var $ip = require('ip');
var $walkSync = require('walk-sync');

function mockIndex(options) {

	var conf = $lodash.assign({
		devPort: '8090',
		mockPort: '8091',
		proxyPort: '8092',
		indexPage: '',
		page: {
			path: '',
			globs: ['**/*.pug', '**/*.html']
		}
	}, options);

	return function(req, res) {

		var extname = $path.extname(conf.indexPage);
		var html = '';

		var pages = $walkSync(conf.page.path, {
			globs: conf.page.globs
		});

		var addr = [];
		addr.push('http://' + $ip.address('public') + ':' + conf.devPort);

		if (extname === '.pug') {
			html = $pug.renderFile(conf.indexPage, {
				htmlWebpackPlugin: {
					options: {
						mock: {
							pages: pages,
							addr: addr
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

