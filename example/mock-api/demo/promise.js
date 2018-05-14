
module.exports = new Promise(resolve => {
	setTimeout(() => {
		resolve({
			data: 'timeout 200ms',
			code: 0
		});
	}, 200);
});
