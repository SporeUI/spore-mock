const $fs = require('fs');

const $chai = require('chai');
const $mocha = require('mocha');
const $request = require('request');

const describe = $mocha.describe;
const it = $mocha.it;
const before = $mocha.before;
const after = $mocha.after;

const host = 'http://127.0.0.1:8091';

const changeTimeStamp = str => {
	str = str || '123123';
	const file = './test/src/mods/timestamp.js';
	let content = $fs.readFileSync(file, 'utf8');
	content = content.replace(/\d+/, str);
	$fs.writeFileSync(file, content);
};

describe('index', function() {

	describe('#page', function() {

		this.timeout(5000);

		let error;
		let body;

		before(done => {
			$request(host, (err, rs, bd) => {
				error = err;
				body = bd;
				done();
			});
		});

		it('正常访问首页', () => {
			$chai.expect(!error).to.be.true;
		});

		it('展示 entry 链接', () => {
			$chai.expect(body).to.include('href="/html/demo/static.html"');
			$chai.expect(body).to.include('href="/html/demo/test.html"');
		});

		it('展示二维码链接', () => {
			$chai.expect(body).to.match(/data-qrlink="http:\/\/[\d\.]+:8090"/);
		});

		it('展示其他链接', () => {
			$chai.expect(body).to.match(/href="http:\/\/[\d\.]+:8091"/);
			$chai.expect(body).to.match(/href="http:\/\/[\d\.]+:8092"/);
		});

	});

	describe('#debug', function() {

		this.timeout(5000);

		let error;
		let body;

		before(done => {
			$request(host + '?fedebug=json', (err, rs, bd) => {
				error = err;
				body = bd;
				done();
			});
		});

		it('正常访问首页的 debug 模式', () => {
			$chai.expect(!error).to.be.true;
		});

		it('得到的内容是一个 json', () => {
			let data = null;
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

		let error;
		let body;

		before(done => {
			$request(host + '/demo/static.html', (err, rs, bd) => {
				error = err;
				body = bd;
				done();
			});
		});

		it('静态页面可正常访问', () => {
			$chai.expect(!error).to.be.true;
		});

		it('静态页面内容正常展示', () => {
			$chai.expect(body).to.include('<title>static</title>');
		});

	});

	describe('pug', function() {

		this.timeout(5000);

		let error;
		let body;

		before(done => {
			$request(host + '/demo/test.html', (err, rs, bd) => {
				error = err;
				body = bd;
				done();
			});
		});

		it('pug 渲染页面可正常访问', () => {
			$chai.expect(!error).to.be.true;
		});

		it('pug 渲染内容正常展示', () => {
			$chai.expect(body).to.include('<title>test.pug</title>');
		});

	});

	describe('debug', function() {

		this.timeout(5000);

		let error;
		let body;

		before(done => {
			changeTimeStamp(456456);
			$request(host + '/demo/test.html?fedebug=json', (err, rs, bd) => {
				error = err;
				body = bd;
				done();
			});
		});

		it('pug debug 模式可正常访问', () => {
			$chai.expect(!error).to.be.true;
		});

		it('pug debug 模式输出一个 json', () => {
			let data = null;
			try {
				data = JSON.parse(body);
			} catch (err) {
				console.log(err);
			}
			$chai.expect(data).to.be.an('object');
			$chai.expect(data.title).to.equal('test.pug');
		});

		it('json 内容可以实时更新', () => {
			let data = null;
			try {
				data = JSON.parse(body);
			} catch (err) {
				console.log(err);
			}
			$chai.expect(data).to.be.an('object');
			$chai.expect(data.timestamp.timestamp).to.equal('456456');
		});

	});

});

describe('api', function() {

	this.timeout(5000);

	describe('ajax', function() {

		this.timeout(5000);

		let error;
		let body;
		let json;

		before(done => {
			$request(host + '/api/test', (err, rs, bd) => {
				error = err;
				body = bd;
				try {
					json = JSON.parse(body);
				} catch (err) {
					console.log(err);
				}
				done();
			});
		});

		it('api 接口正常访问', () => {
			$chai.expect(!error).to.be.true;
		});

		it('接口输出为一个json', () => {
			let data = json;
			$chai.expect(data).to.be.an('object');
			$chai.expect(data.ret).to.equal(0);
			$chai.expect(data.msg).to.equal('test ok');
		});

		it('json 内容可以实时更新', () => {
			let data = json;
			$chai.expect(data).to.be.an('object');
			$chai.expect(data.timestamp.timestamp).to.equal('456456');
		});

		it('json 列表数据自动mock', () => {
			let data = json;
			$chai.expect(data.list).to.be.an('array');
			$chai.expect(data.list.length).to.equal(10);
		});

	});

	describe('jsonp', function() {

		this.timeout(5000);

		let error;
		let body;

		before(done => {
			$request(host + '/api/test?callback=jsonp', (err, rs, bd) => {
				error = err;
				body = bd;
				done();
			});
		});

		it('api 接口正常访问', () => {
			$chai.expect(!error).to.be.true;
		});

		it('为jsonp格式', () => {
			$chai.expect(/^jsonp\(/.test(body)).to.be.true;
		});

	});

	after(done => {
		changeTimeStamp();
		done();
	});

});


describe('auto-match', function() {

	this.timeout(5000);

	describe('ajax', function() {

		this.timeout(5000);

		let error;
		let body;
		let json;

		before(done => {
			$request(host + '/demo/api', (err, rs, bd) => {
				error = err;
				body = bd;
				try {
					json = JSON.parse(body);
				} catch (err) {
					console.log(err);
				}
				done();
			});
		});

		it('api 接口正常访问', () => {
			$chai.expect(!error).to.be.true;
		});

		it('json 内容可修改', () => {
			let data = json;
			$chai.expect(data).to.be.an('object');
			$chai.expect(data.ret).to.equal(1);
			$chai.expect(data.msg).to.equal('modified');
		});

	});

	after(done => {
		changeTimeStamp();
		done();
	});

});

