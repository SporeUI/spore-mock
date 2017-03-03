var $path = require('path');

function clearRequireCache() {
	Object.keys(require.cache).forEach(function(moduleName) {
		delete require.cache[moduleName];
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
