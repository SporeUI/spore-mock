# spore-mock
一个mock服务，支持mock数据模块化处理

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

配置文件 mock.js
```script
var $path = require('path');

module.exports = {
	root: $path.resolve(__dirname),
	mock: './'
};
```

参见 example 下的极简示例

## 详细配置文件范例

mock.js:

```script
var $fs = require('fs');
var $path = require('path');

module.exports = {

	// 若要进入调试模式，设置为 true , 默认为 false
	debug: true,

	// 下面各个路径的根路径
	root: $path.resolve(__dirname),

	// mock 服务端口
	port: '8091',

	// mock 数据文件所在路径
	mock: './src/mock',

	// 模板文件所在路径
	// 如果 mock 文件的相对路径 与 template 下页面相对路径一致
	// 则该 js 提供的数据服务于对应页面
	template: './src/entry',

	// 模板路径映射到此路由地址
	templateRoute: '/html',

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

	// 指定静态文件路径
	statics: [
		'dist',
		{
			route: 'static',
			path: 'src/mock/static'
		}
	],

	// mock数据渲染前统一格式化函数
	mockFormat: function(mockData) {
		return {
			htmlWebpackPlugin: {
				options: {
					mock: mockData
				}
			}
		};
	},

	// 模板解析器，可自定义使用何种模板渲染数据
	// 默认已支持 pug 模板渲染
	render: [{
		extname: 'txt',
		parse: function(file, data) {
			return $fs.readFileSync(file, 'utf8');
		}
	}]
};
```

## 使用说明

访问的页面添加 fedebug=json 参数可直接查看 json 配置

支持自定义模板渲染方式

模板入口数据为 `htmlWebpackPlugin.options.mock`

接口支持 jsonp , cors

配合代理服务使用可实现任意 mock 需求

提供 mock 数据的文件为 js , 遵循 cmd 规范

更新数据 js 文件，接口数据自动更新

mock 文件可执行，可通过 `module.exports = function(res, req){}` 来动态执行

使用 Mock.js 来协助生成随机数据

## Release History

 * 2017-05-24 v0.3.0 精简配置项，没有对应模板的mock数据访问时以接口形式输出
 * 2017-05-02 v0.2.2 改进默认首页样式
 * 2017-04-17 v0.2.1 使用 mockjs 自动生成 mock 数据
 * 2017-03-23 v0.2.0 不再结合 htmlWebpackPlugin 的生成文件自动引用 js 与 css ，要求模板指定引用文件
 * 2017-03-14 v0.1.1 entry 数据改为使用 exports.resolve 方法来返回动态数据
 * 2017-03-03 v0.1.0 发布第一个正式版
