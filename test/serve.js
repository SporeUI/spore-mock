const $path = require('path');
const $sporeMock = require('../index');

$sporeMock({
	configFilePath: $path.resolve(__dirname, './mock.js')
});
