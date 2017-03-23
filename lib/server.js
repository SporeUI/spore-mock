var $path = require('path');

var $cors = require('cors');
var $lodash = require('lodash');
var $express = require('express');
var $colors = require('colors/safe');

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
		indexPage: $path.resolve(__dirname, '../index.pug'),
		// 链接列表，用于显示到首页
		links: [],
		// 二维码链接列表，用于显示到 mock 服务首页
		qrlinks: [],
		// 源文件入口页面集合
		entryPages: {
			path: 'src/entry',
			globs: ['**/*.pug', '**/*.html']
		},
		// 页面所需 mock 数据的入口
		entryMock: {
			route: '/html',
			path: 'src/mock',
			globs: ['**/*.js']
		},
		// 接口所需 mock 数据的入口
		apiMock: {
			route: '/api',
			path: 'src/mock/api',
			globs: ['**/*.js']
		},
		// 指定静态文件路径
		statics: []
	}, options);

	if (conf.debug) {
		console.log('----');
		console.log('server config:');
		console.log(conf);
	}

	var app = $express();

	app.use($cors());

	app.get('/', $mockIndex({
		debug: conf.debug,
		ip: conf.ip,
		port: conf.port,
		links: conf.links,
		qrlinks: conf.qrlinks,
		indexPage: conf.indexPage,
		page: {
			path: $path.join(conf.root, conf.entryPages.path),
			globs: conf.entryPages.globs
		}
	}));

	app.use(conf.entryMock.route, $mockEntry({
		debug: conf.debug,
		entry: {
			path: $path.join(conf.root, conf.entryPages.path),
			globs: conf.entryPages.globs
		},
		mock: {
			path: $path.join(conf.root, conf.entryMock.path),
			globs: conf.entryMock.globs
		}
	}));

	app.use(conf.apiMock.route, $mockApi({
		debug: conf.debug,
		api: {
			path: $path.join(conf.root, conf.apiMock.path),
			globs: conf.apiMock.globs
		}
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
