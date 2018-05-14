module.exports = new Promise(resolve => {
	setTimeout(() => {
		resolve({
			code: 0
		});
	}, 100);
});
