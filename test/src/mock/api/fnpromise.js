module.exports = (req, res) => new Promise(resolve => {
	setTimeout(() => {
		resolve({
			code: 0
		});
	}, 100);
});

