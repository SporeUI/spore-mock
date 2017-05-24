var $path = require('path');

module.exports = {
	root: $path.resolve(__dirname),
	mock: './mock',
	// 链接列表，用于显示到首页
	links: [
		{
			href: '/api',
			text: 'api 接口'
		},
		{
			href: '/api?p=1',
			text: '携带参数的 api 接口'
		},
		{
			href: '/api?callback=jsonp',
			text: 'jsonp 方式访问 api 接口'
		},
		{
			href: '/test?fedebug=json',
			text: '查看页面数据'
		}
	]
};

