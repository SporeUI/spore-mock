var $fs = require('fs');

var $chai = require('chai');
var $mocha = require('mocha');
var $request = require('request');

var describe = $mocha.describe;
var it = $mocha.it;
var before = $mocha.before;

var host = 'http://127.0.0.1:8091';

describe('index', function() {

	describe('#page', function() {

		this.timeout(5000);

		var error;
		var body;

		before(function(done) {
			$request(host, function(err, rs, bd) {
				error = err;
				body = bd;
				done();
			});
		});

		it('正常访问首页', function() {
			$chai.expect(!error).to.be.true;
		});

		it('展示 entry 链接', function() {
			$chai.expect(/href="html\/demo\/static.html"/.test(body)).to.be.true;
			$chai.expect(/href="html\/demo\/test.html"/.test(body)).to.be.true;
		});

		it('展示二维码链接', function() {
			$chai.expect(/data-qrlink="http:\/\/[\d\.]+:8090"/.test(body)).to.be.true;
		});

		it('展示其他链接', function() {
			$chai.expect(/href="http:\/\/[\d\.]+:8091"/.test(body)).to.be.true;
			$chai.expect(/href="http:\/\/[\d\.]+:8092"/.test(body)).to.be.true;
		});

	});

	describe('#debug', function() {

		this.timeout(5000);

		var error;
		var body;

		before(function(done) {
			$request(host + '?fedebug=json', function(err, rs, bd) {
				error = err;
				body = bd;
				done();
			});
		});

		it('正常访问首页的 debug 模式', function() {
			$chai.expect(!error).to.be.true;
		});

		it('得到的内容是一个 json', function() {
			var data = null;
			try {
				data = JSON.parse(body);
			} catch (err) {
				console.log(err);
			}
			$chai.expect(data).to.be.an('object');
			$chai.expect(data.pages).to.be.an('array');
		});

	});

});

describe('entry', function() {

	describe('static', function() {

		this.timeout(5000);

		var error;
		var body;

		before(function(done) {
			$request(host + '/html/demo/static.html', function(err, rs, bd) {
				error = err;
				body = bd;
				done();
			});
		});

		it('静态页面可正常访问', function() {
			$chai.expect(!error).to.be.true;
		});

		it('静态页面内容正常展示', function() {
			$chai.expect(/<title>static<\/title>/.test(body)).to.be.true;
		});

	});

	describe('pug', function() {

		this.timeout(5000);

		var error;
		var body;

		before(function(done) {
			$request(host + '/html/demo/test.html', function(err, rs, bd) {
				error = err;
				body = bd;
				done();
			});
		});

		it('pug 渲染页面可正常访问', function() {
			$chai.expect(!error).to.be.true;
		});

		it('pug 渲染内容正常展示', function() {
			$chai.expect(/<title>test.pug<\/title>/.test(body)).to.be.true;
		});

	});

	describe('debug', function() {

		this.timeout(5000);

		var error;
		var body;

		before(function(done) {
			$request(host + '/html/demo/test.html?fedebug=json', function(err, rs, bd) {
				error = err;
				body = bd;
				done();
			});
		});

		it('pug debug 模式可正常访问', function() {
			$chai.expect(!error).to.be.true;
		});

		it('pug debug 模式输出一个 json', function() {
			var data = null;
			try {
				data = JSON.parse(body);
			} catch (err) {
				console.log(err);
			}
			$chai.expect(data).to.be.an('object');
			$chai.expect(data.title).to.equal('test.pug');
		});

	});

});

describe('api', function() {

	this.timeout(5000);

	describe('ajax', function() {

		this.timeout(5000);

		var error;
		var body;

		before(function(done) {
			$request(host + '/api/test', function(err, rs, bd) {
				error = err;
				body = bd;
				done();
			});
		});

		it('api 接口正常访问', function() {
			$chai.expect(!error).to.be.true;
		});

		it('接口输出为一个json', function() {
			var data = null;
			try {
				data = JSON.parse(body);
			} catch (err) {
				console.log(err);
			}
			$chai.expect(data).to.be.an('object');
			$chai.expect(data.ret).to.equal(0);
			$chai.expect(data.msg).to.equal('test ok');
		});

	});

	describe('jsonp', function() {

		this.timeout(5000);

		var error;
		var body;

		before(function(done) {
			$request(host + '/api/test?callback=jsonp', function(err, rs, bd) {
				error = err;
				body = bd;
				done();
			});
		});

		it('api 接口正常访问', function() {
			$chai.expect(!error).to.be.true;
		});

		it('为jsonp格式', function() {
			$chai.expect(/^jsonp\(/.test(body)).to.be.true;
		});

	});

});

