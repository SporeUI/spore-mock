module.exports = (req, res) => {
	let output = Object.assign({}, req.body);
	output.method = req.method;
	return output;
};
