var $fs = require('fs');
var $path = require('path');

var $del = require('del');
var $crossSpawn = require('cross-spawn');
var $runSequence = require('run-sequence');

var $gulp = require('gulp');
var $gulpUtil = require('gulp-util');
var $gulpEslint = require('gulp-eslint');

var $eslintrc = require('./.eslintrc');

$gulp.task('clean', function(callback) {
	return $del([
		'test/temp'
	]);
});

// 用于解决 windows 下目录删除未及时完成的问题
$gulp.task('wait', function(done) {
	setTimeout(done, 1000);
});


$gulp.task('lint', function() {
	if ($eslintrc.globals && !Array.isArray($eslintrc.globals)) {
		$eslintrc.globals = Object.keys($eslintrc.globals);
	}

	return $gulp.src([
		'index.js',
		'lib/**/*.js'
	]).pipe(
		$gulpEslint($eslintrc)
	).pipe(
		$gulpEslint.formatEach('compact', process.stderr)
    ).pipe(
		$gulpEslint.failAfterError()
    );
});

// =================
// common tasks
// =================
$gulp.task('test', function() {
	return $runSequence(
		'lint'
	);
});


$gulp.task('default', [
	'test'
]);

