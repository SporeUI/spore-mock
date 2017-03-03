var $fs = require('fs');
var $path = require('path');

var $cors = require('cors');
var $lodash = require('lodash');
var $express = require('express');
var $colors = require('colors/safe');

var $config = require('../config');
var $mockIndex = require('./middleware/mockIndex');
var $mockEntry = require('./middleware/mockEntry');
var $mockApi = require('./middleware/mockApi');

function startServer(options) {

	var conf = $lodash.merge({
		root: process.cwd(),
		debug: false,
		ip: '127.0.0.1',
		port: '8091',
		// mock 服务首页页面路径
		indexPage: $path.resolve(__dirname, './index.pug'),
		// 链接列表，用于显示到首页
		links: [],
		// 二维码链接列表，用于显示到 mock 服务首页
		qrlinks: [],
		// 源文件入口页面集合
		entryPages: {
			path: 'src/entry',
			globs: ['**/*.pug', '**/*.html']
		},
		// webpack 生成的静态页面
		distPages: {
			path: 'dist/html',
			globs: ['**/*.html']
		},
		// 页面所需 mock 数据的入口
		entryMock: {
			route: 'html',
			path: 'src/mock',
			globs: ['**/*.js']
		},
		// 接口所需 mock 数据的入口
		apiMock: {
			route: 'api',
			path: 'src/mock/api',
			globs: ['**/*.js']
		},
		// 指定静态文件路径
		statics: [{
			route: 'static',
			path: 'src/mock/static'
		}]
	}, options);


	var app = $express();

	var indexPage = $path.resolve(__dirname, '../index.pug');
	if (!$fs.existsSync(indexPage)) {
		indexPage = $path.resolve(__dirname, '../index.html');
	}

	app.use($cors());

	app.get('/', $mockIndex({
		indexPage: indexPage,
		page: {
			path: $path.join($config.src, 'entry'),
			globs: ['**/*.pug', '**/*.html']
		}
	}));

	app.use('/html', $mockEntry({
		dist: {
			path: $path.join($config.dist, 'html'),
			globs: ['**/*.html']
		},
		entry: {
			path: $path.join($config.src, 'entry'),
			globs: ['**/*.pug', '**/*.html']
		},
		mock: {
			path: $path.join($config.src, 'mock'),
			globs: ['**/*.js']
		}
	}));

	app.use('/api', $mockApi({
		api: {
			path: $path.join($config.src, 'mock/api'),
			globs: ['**/*.js']
		}
	}));

	app.use('/static', $express.static('src/mock/static'));
	app.use($express.static('dist'));

	app.listen($config.mockServerPort, function() {
		console.log($colors.blue('[MOCK] Mock server started at http://127.0.0.1:' + $config.mockServerPort));
	});

	return app;
}

module.exports = startServer;
