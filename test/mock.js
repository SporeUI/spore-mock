const $fs = require('fs');
const $path = require('path');

module.exports = {

	// 若要进入调试模式，设置为 true , 默认为 false
	debug: true,

	// web服务根路径
	root: $path.resolve(__dirname),

	// mock 服务端口
	port: 8091,

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
	mockFormat: mockData => ({
		htmlWebpackPlugin: {
			options: {
				mock: mockData
			}
		}
	}),

	// 自定义中间件
	middleware: [],

	// 反向代理配置
	proxy: [],

	// 模板解析器，可自定义使用何种模板渲染数据
	// 默认已支持 pug 模板渲染
	render: [{
		extname: 'txt',
		parse: (file, data) => $fs.readFileSync(file, 'utf8')
	}]
};

