var data = {
	timestamp: require('../../mods/timestamp'),
	'list|10': [{
		name: '@name'
	}],
	ret: 0,
	msg: 'test ok'
};

data.resolve = function(data) {
	data.ret = 1;
	data.msg = 'modified';
	return data;
};

module.exports = data;

