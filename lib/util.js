const $path = require('path');

let clearRequireCache = () => {
	Object.keys(require.cache).forEach(moduleName => {
		// 仅仅清除源文件的 cache 即可
		if (!(/node_modules/).test(moduleName)) {
			delete require.cache[moduleName];
		}
	});
};

let cleanPath = path => {
	if (!path) {
		return path;
	} else {
		return $path.join(
			$path.dirname(path),
			$path.basename(path, $path.extname(path))
		).replace(/^[\/\\]+/, '');
	}
};

let eachRender = (render, fn) => {
	render.every(item => {
		if (!item) {
			console.error('[spore-mock] render must be an object');
			return false;
		}
		if (!item.extname) {
			console.error('[spore-mock] render must have property: extname');
			return false;
		}
		if (!item.parse) {
			console.error('[spore-mock] render must have property: parse');
			return false;
		}
		if (typeof item.parse !== 'function') {
			console.error('[spore-mock] render.parse must be a function');
			return false;
		}

		let result = fn(item);
		if (typeof result === 'undefined') {
			return true;
		} else {
			return result;
		}
	});
};

exports.eachRender = eachRender;
exports.cleanPath = cleanPath;
exports.clearRequireCache = clearRequireCache;
