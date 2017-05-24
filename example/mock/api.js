// 可以输出一个函数，来处理请求参数
module.exports = function(req, res) {
	return {
		query: req.query
	};
};
