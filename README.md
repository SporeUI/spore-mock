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

mock.js:

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

	// 源文件入口页面集合
	// 页面默认使用 pug 渲染模板
	// 页面 mock 需要 entryPages, distPages, entryMock 3 个选项
	entryPages: {
		path: 'src/entry',
		globs: ['**/*.pug', '**/*.html']
	},
	// 页面所需 mock 数据的入口
	// 如果 mock 文件相对于 entryMock.path 的相对路径 与 entryPages 下页面相对路径一致
	// 则该 js 提供的数据服务于对应页面
	entryMock: {
		route: '/html',
		path: 'src/mock',
		globs: ['**/*.js']
	},
	// webpack 生成的静态页面，应当为 webpack-html-plugin 生成的文件
	// 如果静态页面文件相对于 entryMock.path 的相对路径 与 entryPages 下页面相对路径一致
	// 则抽取 css 与 js 文件自动替换到输出的页面
	distPages: {
		path: 'dist/html',
		globs: ['**/*.html']
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

## 使用说明

访问的页面添加 fedebug=json 参数可直接查看 json 配置

目前仅支持 pug 模板

pug 模板入口数据为 `htmlWebpackPlugin.options.mock`

接口支持 jsonp , cors

配合代理服务使用可实现任意 mock 需求

提供 mock 数据的文件为 js , 遵循 cmd 规范

更新数据 js 文件，接口数据自动更新

mock 文件可执行，可通过 `module.exports = function(res, req){}` 来动态执行

使用 Mock.js 来协助生成随机数据

## Release History

 * 2017-03-14 v0.1.1 entry 数据改为使用 exports.resolve 方法来返回动态数据
 * 2017-03-03 v0.1.0 发布第一个正式版
