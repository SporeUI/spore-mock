const $fs = require('fs');
const $path = require('path');

const $pug = require('pug');
const $cors = require('cors');
const $lodash = require('lodash');
const $express = require('express');
const $colors = require('colors/safe');
const $proxy = require('http-proxy-middleware');
const $type = require('spore-kit-obj/src/type');

const $mockIndex = require('./middleware/mockIndex');
const $mockEntry = require('./middleware/mockEntry');

const startServer = options => {

	const conf = $lodash.merge({
		root: process.cwd(),
		debug: false,
		ip: '127.0.0.1',
		port: 8091,
		// mock 数据文件入口路径
		mock: './',
		// 模板文件入口路径
		template: '',
		// 模板文件统一 route
		templateRoute: '/',
		// mock 服务首页页面路径
		indexPage: $path.resolve(__dirname, './index.pug'),
		// 链接列表，用于显示到首页
		links: [],
		// 二维码链接列表，用于显示到 mock 服务首页
		qrlinks: [],
		// 自定义中间件
		middleware: [],
		// 反向代理配置
		proxy: [],
		// 可指定渲染方式
		render: [],
		// 指定静态文件路径
		statics: [],
		// Mock 数据统一格式化
		mockFormat: mockData => mockData
	}, options);

	if (conf.debug) {
		console.log('----');
		console.log('server config:');
		console.log(conf);
		console.log('\n');
	}

	const app = $express();

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

	app.use($cors());

	if (!conf.template) {
		conf.template = conf.mock;
	}

	if (conf.qrlinks.length <= 0) {
		conf.qrlinks = [{
			href: `http://{{publicIp}}:${conf.port}`,
			text: `mock服务 http://{{publicIp}}:${conf.port}`
		}];
	}

	let render = [];

	// 支持简单静态 html 文件
	render.push({
		extname: 'html',
		parse: (file, data) => $fs.readFileSync(file, 'utf8')
	});

	// 默认使用 pug 模板引擎
	render.push({
		extname: 'pug',
		parse: (file, data, req, res) => $pug.renderFile(file, data)
	});

	render = render.concat(conf.render);

	app.get('/', $mockIndex({
		debug: conf.debug,
		ip: conf.ip,
		port: conf.port,
		links: conf.links,
		qrlinks: conf.qrlinks,
		indexPage: conf.indexPage,
		template: $path.join(conf.root, conf.template),
		templateRoute: conf.templateRoute,
		render: render
	}));

	app.get('/favicon.ico', (req, res) => {
		res.send('');
		res.end();
	});

	app.use('/', $mockEntry({
		debug: conf.debug,
		mock: $path.join(conf.root, conf.mock),
		template: $path.join(conf.root, conf.template),
		templateRoute: conf.templateRoute,
		render: render,
		mockFormat: conf.mockFormat
	}));

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

	app.listen(conf.port, () => {
		console.log($colors.blue(
			`[MOCK] Mock server started at http://${conf.ip}:${conf.port}`)
		);
	});

	return app;
};

module.exports = startServer;
