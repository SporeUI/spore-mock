# spore-mock
一个mock服务，支持mock数据模块化

## Getting Start

命令行方式

mock.js 为配置文件路径

```shell
npm install -g spore-mock
spore-mock -c ./mock.js
```

代码方式

```script
var $sporeMock = require('spore-mock');

$sporeMock({
	configFilePath: './mock.js'
});

```

## 配置文件范例

```script
var $path = require('path');

module.exports = {
	// 下面各个路径的根路径
	root: $path.resolve(__dirname),
	// mock 服务端口
	port: '8091',
	// 链接列表，用于显示到首页
	links: [
		{
			href: 'http://{{publicIp}}:8091',
			text: 'Mock服务 http://{{publicIp}}:8091'
		},
		{
			href: 'http://{{publicIp}}:8092',
			text: '代理服务 http://{{publicIp}}:8092'
		}
	],
	// 二维码链接列表，用于显示到 mock 服务首页
	qrlinks: [{
		href: 'http://{{publicIp}}:8090',
		text: '开发服务 http://{{publicIp}}:8090'
	}],

	// 页面默认使用 pug 渲染模板
	// 页面 mock 需要 entryPages, distPages, entryMock 3 个选项
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
	statics: [
		'dist',
		{
			route: 'static',
			path: 'src/mock/static'
		}
	]
};
```

## Release History

 * 2017-03-03 v0.1.0 发布第一个正式版
