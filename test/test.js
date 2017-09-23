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
		let res;

		before(done => {
			$request(host, (err, rs, bd) => {
				error = err;
				body = bd;
				res = rs;
				done();
			});
		});

		it('Get home page', () => {
			$chai.expect(!error).to.be.true;
			$chai.expect(res.statusCode).to.equal(200);
		});

		it('Display entries', () => {
			$chai.expect(body).to.include('href="/html/demo/static.html"');
			$chai.expect(body).to.include('href="/html/demo/test.html"');
		});

		it('Display api links', () => {
			$chai.expect(body).to.include('href="/api/null"');
			$chai.expect(body).to.include('href="/api/test"');
		});

		it('Display qr links', () => {
			$chai.expect(body).to.match(/data-qrlink="http:\/\/[\d\.]+:8090"/);
		});

		it('Display other links', () => {
			$chai.expect(body).to.match(/href="http:\/\/[\d\.]+:8091"/);
			$chai.expect(body).to.match(/href="http:\/\/[\d\.]+:8092"/);
		});

	});

	describe('#debug', function() {

		this.timeout(5000);

		let error;
		let body;
		let res;

		before(done => {
			$request(host + '?fedebug=json', (err, rs, bd) => {
				error = err;
				body = bd;
				res = rs;
				done();
			});
		});

		it('Support fedebug=json mode', () => {
			$chai.expect(!error).to.be.true;
			$chai.expect(res.statusCode).to.equal(200);
		});

		it('Get json from request', () => {
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
		let res;

		before(done => {
			$request(host + '/demo/static.html', (err, rs, bd) => {
				error = err;
				body = bd;
				res = rs;
				done();
			});
		});

		it('Support static page', () => {
			$chai.expect(!error).to.be.true;
			$chai.expect(res.statusCode).to.equal(200);
		});

		it('Display static page', () => {
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

		it('Support pug page', () => {
			$chai.expect(!error).to.be.true;
		});

		it('Display pug page', () => {
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

		it('Support pug fedebug=json mode', () => {
			$chai.expect(!error).to.be.true;
		});

		it('Display json in debug mode', () => {
			let data = null;
			try {
				data = JSON.parse(body);
			} catch (err) {
				console.log(err);
			}
			$chai.expect(data).to.be.an('object');
			$chai.expect(data.title).to.equal('test.pug');
		});

		it('Update json immediately', () => {
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
		let res;

		before(done => {
			$request(host + '/api/test', (err, rs, bd) => {
				error = err;
				body = bd;
				res = rs;
				try {
					json = JSON.parse(body);
				} catch (err) {
					console.log(err);
				}
				done();
			});
		});

		it('Support ajax request', () => {
			$chai.expect(!error).to.be.true;
			$chai.expect(res.statusCode).to.equal(200);
		});

		it('Get json from ajax request', () => {
			let data = json;
			$chai.expect(data).to.be.an('object');
			$chai.expect(data.ret).to.equal(0);
			$chai.expect(data.msg).to.equal('test ok');
		});

		it('Update json immediately', () => {
			let data = json;
			$chai.expect(data).to.be.an('object');
			$chai.expect(data.timestamp.timestamp).to.equal('456456');
		});

		it('Support mock.js', () => {
			let data = json;
			$chai.expect(data.list).to.be.an('array');
			$chai.expect(data.list.length).to.equal(10);
		});

	});

	describe('jsonp', function() {

		this.timeout(5000);

		let error;
		let res;
		let body;

		before(done => {
			$request(host + '/api/test?callback=jsonp', (err, rs, bd) => {
				error = err;
				res = rs;
				body = bd;
				done();
			});
		});

		it('Support jsonp', () => {
			$chai.expect(!error).to.be.true;
			$chai.expect(res.statusCode).to.equal(200);
		});

		it('Get jsonp callback in jsonp request', () => {
			$chai.expect(/^jsonp\(/.test(body)).to.be.true;
		});

	});

	describe('null', function() {

		this.timeout(5000);

		let error;
		let res;

		before(done => {
			$request(host + '/api/null', (err, rs, bd) => {
				error = err;
				res = rs;
				done();
			});
		});

		it('Support 404', () => {
			$chai.expect(!error).to.be.true;
			$chai.expect(res.statusCode).to.equal(404);
		});

	});

	describe('post', function() {

		this.timeout(5000);

		let error;
		let res;
		let body;
		let json;

		before(done => {
			$request.post(
				{
					url: host + '/api/post',
					form: {
						s: 'string'
					}
				},
				(err, rs, bd) => {
					error = err;
					res = rs;
					body = bd;
					try {
						json = JSON.parse(body);
					} catch (err) {
						console.log(err);
					}
					done();
				}
			);
		});

		it('Support post (request.headers["content-type"]="application/x-www-form-urlencoded")', () => {
			$chai.expect(!error).to.be.true;
			$chai.expect(res.statusCode).to.equal(200);
		});

		it('Get json from post request', () => {
			let data = json;
			$chai.expect(data).to.be.an('object');
			$chai.expect(data.s).to.equal('string');
		});

	});

	describe('put', function() {

		this.timeout(5000);

		let error;
		let res;
		let body;
		let json;

		before(done => {
			$request.put(
				{
					url: host + '/api/put',
					headers: {
						'content-type': 'application/json'
					},
					body: JSON.stringify({
						a: 1,
						b: 2
					})
				},
				(err, rs, bd) => {
					error = err;
					res = rs;
					body = bd;
					try {
						json = JSON.parse(body);
					} catch (err) {
						console.log(err);
					}
					done();
				}
			);
		});

		it('Support put (request.headers["content-type"]="application/json")', () => {
			$chai.expect(!error).to.be.true;
			$chai.expect(res.statusCode).to.equal(200);
		});

		it('Get json from put request', () => {
			let data = json;
			$chai.expect(data).to.be.an('object');
			$chai.expect(data.method).to.equal('PUT');
			$chai.expect(data.a).to.equal(1);
			$chai.expect(data.b).to.equal(2);
		});

	});

});


describe('auto-match', function() {

	this.timeout(5000);

	describe('ajax', function() {

		this.timeout(5000);

		let error;
		let body;
		let json;
		let res;

		before(done => {
			$request(host + '/demo/api', (err, rs, bd) => {
				error = err;
				body = bd;
				res = rs;
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
			$chai.expect(res.statusCode).to.equal(200);
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

