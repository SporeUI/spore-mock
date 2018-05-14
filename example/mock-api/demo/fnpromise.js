
module.exports = (req, res) => {
	let query = req.query;
	let time = query.time;
	time = parseInt(time, 10) || 200;
	return new Promise(resolve => {
		setTimeout(() => {
			resolve({
				data: `timeout ${time}ms`,
				code: 0
			});
		}, time);
	});
};

