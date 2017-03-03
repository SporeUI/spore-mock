var $del = require('del');
var $crossSpawn = require('cross-spawn');
var $runSequence = require('run-sequence');

var $gulp = require('gulp');
var $gulpMocha = require('gulp-mocha');
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

var server = null;

$gulp.task('startServer', function(done) {
	server = $crossSpawn('./bin/spore-mock', ['-c', './test/mock.js'], {
		stdio: 'inherit'
	});
	setTimeout(done, 1000);
});

$gulp.task('stopServer', function(done) {
	if (server && server.kill) {
		server.kill('SIGHUP');
	}
	done();
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

$gulp.task('mocha', function(done) {
	$gulp.src('test/test.js').pipe(
		$gulpMocha()
	).on('error', function() {
		done();
	}).on('_result', function() {
		done();
	});
});

$gulp.task('test', function() {
	return $runSequence(
		'lint',
		'startServer',
		'mocha',
		'stopServer'
	);
});


$gulp.task('default', [
	'test'
]);

