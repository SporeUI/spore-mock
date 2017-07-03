var $fs = require('fs');
var $path = require('path');
var $ejs = require('ejs');
var $proxy = require('http-proxy-middleware');

module.exports = {

	// 是否开启调试模式
	debug: true,

	// WEB 服务根路径
	root: $path.resolve(__dirname),

	// mock 服务端口
	port: 8091,

	// mock 数据文件根路径
	mock: './src/mock',

	// 模板文件根路径
	// 如果 mock 文件的相对路径 与 template 下页面相对路径一致
	// 则该 js 提供的数据服务于对应页面
	template: './src/entry',

	// 模板路径映射到此路由地址
	templateRoute: '/html',

	// 链接列表，用于显示到首页
	links: [
		{
			href: 'http://{{publicIp}}:8091/html/home.html',
			text: '首页'
		},
		{
			href: 'http://{{publicIp}}:8091/html/text.html',
			text: '文本页面'
		}
	],

	// 二维码链接列表，用于显示到 mock 服务首页
	qrlinks: [{
		href: 'http://{{publicIp}}:8091',
		text: '开发服务 http://{{publicIp}}:8091'
	}],

	// 指定静态文件路径
	statics: [
		'dist',
		{
			route: '/assets',
			path: './vendor'
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

	proxy: [{
		// 反向代理示例
		// 到 http://127.0.0.1:8090/proxy/index.php 的请求，都会转发到
		// http://m.db.house.qq.com/index.php
		// 例: http://127.0.0.1:8090/proxy/index.php?mod=city&act=geocoderbyip
		route: '/proxy/index.php',
		proxy: {
			target: 'http://openapi.house.qq.com',
			changeOrigin: true,
			logLevel: 'debug',
			secure: false
		}
	}],

	middleware: [{
		// 中间件示例
		// 到 http://127.0.0.1:8090/middleware/index.php 的请求，都会转发到
		// http://m.db.house.qq.com/index.php
		// 例: http://127.0.0.1:8090/middleware/index.php?mod=city&act=geocoderbyip
		route: '/middleware/index.php',
		handle: $proxy({
			target: 'http://openapi.house.qq.com',
			changeOrigin: true,
			logLevel: 'debug',
			secure: false
		})
	}],

	// 模板解析器，可自定义使用何种模板渲染数据
	// 默认已支持 pug 模板渲染
	render: [{
		// 渲染 *.txt 文件
		extname: 'txt',
		parse: function(file, data) {
			return $fs.readFileSync(file, 'utf8');
		}
	}, {
		// 渲染 *.ejs 文件
		extname: 'ejs',
		parse: function(file, data) {
			var str = $fs.readFileSync(file, 'utf8');
			return $ejs.render(str, data);
		}
	}]
};


