// http://127.0.0.1:8091/run
// http://127.0.0.1:8091/run?p=1
let data = {
	code: 0
};
module.exports = function(req, res) {
	var query = req.query;
	if (query.p === '1') {
		data.code = 1;
	}
	return data;
};

