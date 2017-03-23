var $path = require('path');

function clearRequireCache() {
	Object.keys(require.cache).forEach(function(moduleName) {
		// 仅仅清除源文件的 cache 即可
		if (!(/node_modules/).test(moduleName)) {
			delete require.cache[moduleName];
		}
	});
}

function cleanPath(path) {
	if (!path) {
		return path;
	} else {
		return $path.join(
			$path.dirname(path),
			$path.basename(path, $path.extname(path))
		).replace(/^[\/\\]+/, '');
	}
}

exports.cleanPath = cleanPath;
exports.clearRequireCache = clearRequireCache;
