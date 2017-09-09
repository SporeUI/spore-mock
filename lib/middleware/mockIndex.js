const $fs = require('fs');
const $path = require('path');
const $lodash = require('lodash');
const $pug = require('pug');
const $ip = require('ip');
const $colors = require('colors/safe');
const $walkSync = require('walk-sync');
const $substitute = require('spore-kit-str/src/substitute');

const fillLinks = (origin, arr, data) => {
	arr.forEach(item => {
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
};

const mockIndex = options => {

	const conf = $lodash.assign({
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

	let templates = [];
	if (typeof conf.template === 'string') {
		templates.push(conf.template);
	} else if (Array.isArray(conf.template)) {
		templates = templates.concat(conf.template);
	}

	let globs = [];
	if (Array.isArray(conf.render)) {
		globs = conf.render.map(item => {
			if (item && item.extname) {
				return '**/*.' + item.extname;
			} else {
				console.log($colors.red('[spore-mock] render must have property: extname'));
				return '';
			}
		});
	}

	const ignores = [];
	ignores.push('node_modules');
	ignores.push('.git');
	ignores.push('.svn');

	return (req, res) => {

		let pages = [];
		templates.forEach(entry => {
			let files = [];
			if (typeof entry === 'string') {
				files = $walkSync(entry, {
					globs: globs,
					ignore: ignores
				});
			}
			pages = pages.concat(files);
		});

		pages = pages.map(
			page => $path.join(conf.templateRoute, page)
		);

		let data = {
			port: conf.port,
			publicIp: $ip.address('public')
		};

		let mockData = {
			pages: pages,
			qrlinks: fillLinks([], conf.qrlinks, data),
			links: fillLinks([], conf.links, data)
		};

		let html = '';
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
};

module.exports = mockIndex;

