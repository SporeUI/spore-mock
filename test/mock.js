var $path = require('path');

module.exports = {
	root: $path.resolve(__dirname),
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
	// 指定静态文件路径
	statics: [
		'dist',
		{
			route: 'static',
			path: 'src/mock/static'
		}
	]
};
