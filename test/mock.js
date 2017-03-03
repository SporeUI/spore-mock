var $path = require('path');

module.exports = {
	root: $path.resolve(__dirname),
	port: '8091',
	// 链接列表，用于显示到首页
	links: [
		'127.0.0.1:8090',
		{
			href: '127.0.0.1:8092',
			text: '代理服务'
		}
	],
	// 二维码链接列表，用于显示到 mock 服务首页
	qrlinks: [],
	// 指定静态文件路径
	statics: [
		'dist',
		{
			route: 'static',
			path: 'src/mock/static'
		}
	]
};
