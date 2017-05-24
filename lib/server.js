var $fs = require('fs');
var $path = require('path');

var $pug = require('pug');
var $cors = require('cors');
var $lodash = require('lodash');
var $express = require('express');
var $colors = require('colors/safe');

var $mockIndex = require('./middleware/mockIndex');
var $mockEntry = require('./middleware/mockEntry');

function startServer(options) {

	var conf = $lodash.merge({
		root: process.cwd(),
		debug: false,
		ip: '127.0.0.1',
		port: '8091',
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
		// 可指定渲染方式
		render: [],
		// 指定静态文件路径
		statics: [],
		// Mock 数据统一格式化
		mockFormat: function(mockData) {
			return mockData;
		}
	}, options);

	if (conf.debug) {
		console.log('----');
		console.log('server config:');
		console.log(conf);
	}

	var app = $express();

	app.use($cors());

	if (!conf.template) {
		conf.template = conf.mock;
	}

	var render = [];

	// 支持简单静态 html 文件
	render.push({
		extname: 'html',
		parse: function(file, data) {
			return $fs.readFileSync(file, 'utf8');
		}
	});

	// 默认使用 pug 模板引擎
	render.push({
		extname: 'pug',
		parse: function(file, data, req, res) {
			return $pug.renderFile(file, data);
		}
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

	app.use('/', $mockEntry({
		debug: conf.debug,
		mock: $path.join(conf.root, conf.mock),
		template: $path.join(conf.root, conf.template),
		templateRoute: conf.templateRoute,
		render: render,
		mockFormat: conf.mockFormat
	}));

	conf.statics.forEach(function(item) {
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

	app.listen(conf.port, function() {
		console.log($colors.blue('[MOCK] Mock server started at http://' + conf.ip + ':' + conf.port));
	});

	return app;
}

module.exports = startServer;
