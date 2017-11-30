const $path = require('path');

const clearRequireCache = () => {
	Object.keys(require.cache).forEach(moduleName => {
		// Don't clear require cache of files in node_modules directory
		if (!(/node_modules/).test(moduleName)) {
			delete require.cache[moduleName];
		}
	});
};

const cleanPath = path => {
	if (!path) {
		return path;
	} else {
		return $path.join(
			$path.dirname(path),
			$path.basename(path, $path.extname(path))
		).replace(/^[\/\\]+/, '');
	}
};

const eachRender = (render, fn) => {
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

const isIgnored = (cleanPath, ignore) => {
	let ignores = [];
	if (Array.isArray(ignore)) {
		ignores = ignore.slice(0);
	} else {
		ignores.push(ignore);
	}
	return ignores.some(
		item => {
			let matched = false;
			if (typeof item === 'string') {
				item = item.replace(/^\/+/, '');
				if (item) {
					let reg = new RegExp('^' + item);
					if (reg.test(cleanPath) === true) {
						matched = true;
					}
				}
			}
			return matched;
		}
	);
};

exports.eachRender = eachRender;
exports.cleanPath = cleanPath;
exports.clearRequireCache = clearRequireCache;
exports.isIgnored = isIgnored;
