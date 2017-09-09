var data = {
	timestamp: require('../../mods/timestamp'),
	'list|10': [{
		name: '@name'
	}],
	ret: 0,
	msg: 'test ok'
};

module.exports = (req, res) => {
	data.ret = 1;
	data.msg = 'modified';
	return data;
};

