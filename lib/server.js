const $fs = require('fs');
const $path = require('path');

const $pug = require('pug');
const $cors = require('cors');
const $lodash = require('lodash');
const $express = require('express');
const $colors = require('colors/safe');
const $bodyParser = require('body-parser');
const $proxy = require('http-proxy-middleware');
const $type = require('spore-kit-obj/src/type');

const $mockIndex = require('./middleware/mockIndex');
const $mockEntry = require('./middleware/mockEntry');

const startServer = options => {

	const conf = $lodash.merge({
		ip: '127.0.0.1',
		port: 8091,
		// Server root path
		root: process.cwd(),
		// Debug mode
		debug: false,
		// Mock data file root path
		mock: './',
		// Template file root path
		template: '',
		// Template prefix route
		templateRoute: '/',
		// The template path of home page
		indexPage: $path.resolve(__dirname, './index.pug'),
		// Link list, display in home page
		links: [],
		// Qr link list, display in home page
		qrlinks: [],
		// Merge middlewares
		middleware: [],
		// Merge proxy
		proxy: [],
		// Merge render
		render: [],
		// Merge static file path
		statics: [],
		// For template, format the output data
		mockFormat: mockData => mockData
	}, options);

	if (conf.debug) {
		console.log('----');
		console.log('server config:');
		console.log(conf);
		console.log('\n');
	}

	const app = $express();

	// Load middleware list
	const middleware = conf.middleware || [];
	middleware.forEach(item => {
		console.log('[spore-mock] use middleware:', item);
		if ($type(item) !== 'object') {
			console.log($colors.red('[spore-mock] middleware must be an object'));
			return;
		}

		if ($type(item.handle) === 'function') {
			if (typeof item.route === 'string') {
				app.use(item.route, item.handle);
			} else {
				console.log($colors.yellow('[spore-mock] middleware.route is not a string'));
				app.use(item.handle);
			}
		} else {
			console.log($colors.red('[spore-mock] middleware.handle must be an object'));
			return;
		}
	});

	// For header 'Content-Type': 'application/x-www-form-urlencoded'
	app.use(
		$bodyParser.urlencoded({
			extended: true
		})
	);

	// For header 'Content-Type': 'application/json'
	app.use($bodyParser.json());

	// CORS
	// https://en.wikipedia.org/wiki/Cross-origin_resource_sharing
	app.use($cors());

	// Proxy list
	const proxy = conf.proxy || [];
	proxy.forEach(item => {
		console.log('[spore-mock] use proxy:', item);

		if ($type(item) !== 'object') {
			console.log($colors.red('[spore-mock] proxy must be an object'));
			return;
		}

		if ($type(item.proxy) === 'object') {
			if (typeof item.route === 'string') {
				app.use(item.route, $proxy(item.proxy));
			} else {
				console.log($colors.yellow('[spore-mock] proxy.route is not a string'));
				app.use($proxy(item.proxy));
			}
		} else {
			console.log($colors.red('[spore-mock] proxy.proxy must be an object'));
			return;
		}
	});

	// Get default template root path
	if (!conf.template) {
		conf.template = conf.mock;
	}

	// Get default qr links
	if (conf.qrlinks.length <= 0) {
		conf.qrlinks = [{
			href: `http://{{publicIp}}:${conf.port}`,
			text: `mock服务 http://{{publicIp}}:${conf.port}`
		}];
	}

	let render = [];

	// Support html
	render.push({
		extname: 'html',
		parse: (file, data) => $fs.readFileSync(file, 'utf8')
	});

	// Support pug
	render.push({
		extname: 'pug',
		parse: (file, data, req, res) => $pug.renderFile(file, data)
	});

	// Merge render
	render = [...render, ...conf.render];

	// Handle home page
	app.get('/', $mockIndex({
		debug: conf.debug,
		ip: conf.ip,
		port: conf.port,
		links: conf.links,
		qrlinks: conf.qrlinks,
		indexPage: conf.indexPage,
		mock: $path.join(conf.root, conf.mock),
		template: $path.join(conf.root, conf.template),
		templateRoute: conf.templateRoute,
		render: render
	}));

	// Handle favicon.ico
	app.get('/favicon.ico', (req, res) => {
		res.send('');
		res.end();
	});

	// Handle api and page
	app.use('/', $mockEntry({
		debug: conf.debug,
		mock: $path.join(conf.root, conf.mock),
		template: $path.join(conf.root, conf.template),
		templateRoute: conf.templateRoute,
		render: render,
		mockFormat: conf.mockFormat
	}));

	// Handle static files
	conf.statics.forEach(item => {
		if (typeof item === 'string') {
			app.use(
				$express.static(
					$path.join(conf.root, item)
				)
			);
		} else if (typeof item === 'object') {
			app.use(
				item.route,
				$express.static(
					$path.join(conf.root, item.path)
				)
			);
		}
	});

	// Server start
	app.listen(conf.port, () => {
		console.log($colors.blue(
			`[MOCK] Mock server started at http://${conf.ip}:${conf.port}`)
		);
	});

	return app;
};

module.exports = startServer;
