const $del = require('del');
const $crossSpawn = require('cross-spawn');
const $runSequence = require('run-sequence');

const $gulp = require('gulp');
const $gulpMocha = require('gulp-mocha');
const $gulpEslint = require('gulp-eslint');

const $eslintrc = require('./.eslintrc');

$gulp.task('clean', callback => $del([
	'test/temp'
]));

// 用于解决 windows 下目录删除未及时完成的问题
$gulp.task('wait', done => {
	setTimeout(done, 1000);
});

let server = null;

$gulp.task('startServer', done => {
	server = $crossSpawn('./bin/spore-mock', ['-c', './test/mock.js'], {
		stdio: 'inherit'
	});
	setTimeout(done, 1000);
});

$gulp.task('stopServer', done => {
	if (server && server.kill) {
		server.kill('SIGHUP');
	}
	done();
});

$gulp.task('lint', () => {
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

$gulp.task('mocha', () => $gulp.src('test/test.js').pipe(
	$gulpMocha()
));

$gulp.task('test', () => $runSequence(
	'lint',
	'startServer',
	'mocha',
	'stopServer'
));


$gulp.task('default', [
	'test'
]);

