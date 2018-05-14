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
			$request(host + '/admin', (err, rs, bd) => {
				error = err;
				body = bd;
				res = rs;
				done();
			});
		});

		it('Should disply home page successful.', () => {
			$chai.expect(!error).to.be.true;
			$chai.expect(res.statusCode).to.equal(200);
		});

		it('Should display entries', () => {
			$chai.expect(body).to.include('href="/html/demo/static.html"');
			$chai.expect(body).to.include('href="/html/demo/test.html"');
		});

		it('Should display api links', () => {
			$chai.expect(body).to.include('href="/api/null"');
			$chai.expect(body).to.include('href="/api/test"');
		});

		it('Should display qr links', () => {
			$chai.expect(body).to.match(/data-qrlink="http:\/\/[\d\.]+:8090"/);
		});

		it('Should display other links', () => {
			$chai.expect(body).to.match(/href="http:\/\/[\d\.]+:8091"/);
			$chai.expect(body).to.match(/href="http:\/\/[\d\.]+:8092"/);
		});

		it('Should hide ignore links', () => {
			$chai.expect(body).not.to.include('href="/ignore/test"');
		});

	});

	describe('#debug', function() {

		this.timeout(5000);

		let error;
		let body;
		let res;

		before(done => {
			$request(host + '/admin?fedebug=json', (err, rs, bd) => {
				error = err;
				body = bd;
				res = rs;
				done();
			});
		});

		it('Should support fedebug=json mode', () => {
			$chai.expect(!error).to.be.true;
			$chai.expect(res.statusCode).to.equal(200);
		});

		it('In json mode, should get json from request', () => {
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

		it('Should support static page', () => {
			$chai.expect(!error).to.be.true;
			$chai.expect(res.statusCode).to.equal(200);
		});

		it('Should display static page', () => {
			$chai.expect(body).to.include('<title>static</title>');
		});

	});

	describe('err-page', function() {

		this.timeout(5000);

		let error;
		let body;
		let res;

		before(done => {
			$request(host + '/demo/err.html', (err, rs, bd) => {
				error = err;
				body = bd;
				res = rs;
				done();
			});
		});

		it('Should support err page output', () => {
			$chai.expect(!error).to.be.true;
			$chai.expect(res.statusCode).to.equal(200);
		});

		it('Should display err page', () => {
			$chai.expect(body).to.include('File parse error');
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

		it('Should support pug page', () => {
			$chai.expect(!error).to.be.true;
		});

		it('Should display pug page', () => {
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

		it('Should support pug page fedebug=json mode', () => {
			$chai.expect(!error).to.be.true;
		});

		it('In pug page json mode, should get json from request', () => {
			let data = null;
			try {
				data = JSON.parse(body);
			} catch (err) {
				console.log(err);
			}
			$chai.expect(data).to.be.an('object');
			$chai.expect(data.title).to.equal('test.pug');
		});

		it('In pug page json mode, json should be updated immediately', () => {
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
					error = err;
				}
				done();
			});
		});

		it('Shuold support ajax request', () => {
			$chai.expect(!error).to.be.true;
			$chai.expect(res.statusCode).to.equal(200);
		});

		it('Should get json from ajax request', () => {
			let data = json;
			$chai.expect(data).to.be.an('object');
			$chai.expect(data.ret).to.equal(0);
			$chai.expect(data.msg).to.equal('test ok');
		});

		it('For ajax request, json should be updated immediately', () => {
			let data = json;
			$chai.expect(data).to.be.an('object');
			$chai.expect(data.timestamp.timestamp).to.equal('456456');
		});

		it('Should support mock.js', () => {
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

		it('Should support jsonp', () => {
			$chai.expect(!error).to.be.true;
			$chai.expect(res.statusCode).to.equal(200);
		});

		it('Should get jsonp callback in jsonp request', () => {
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

		it('Should support null display', () => {
			$chai.expect(!error).to.be.true;
			$chai.expect(res.statusCode).to.equal(200);
		});
	});

	describe('undefined', function() {
		this.timeout(5000);

		let error;
		let res;

		before(done => {
			$request(host + '/api/undefined', (err, rs, bd) => {
				error = err;
				res = rs;
				done();
			});
		});

		it('Should support undefined display as 404', () => {
			$chai.expect(!error).to.be.true;
			$chai.expect(res.statusCode).to.equal(404);
		});
	});

	describe('err', function() {

		this.timeout(5000);

		let error;
		let res;

		before(done => {
			$request(host + '/api/err', (err, rs, bd) => {
				error = err;
				res = rs;
				done();
			});
		});

		it('Should support err api display as 404', () => {
			$chai.expect(!error).to.be.true;
			$chai.expect(res.statusCode).to.equal(404);
		});

	});

	describe('promise', function() {

		this.timeout(5000);

		let error;
		let res;
		let body;
		let json;

		before(done => {
			$request(host + '/api/promise', (err, rs, bd) => {
				error = err;
				res = rs;
				body = bd;
				try {
					json = JSON.parse(body);
				} catch (err) {
					error = err;
					console.log(err);
				}
				done();
			});
		});

		it('Should support promise api', () => {
			$chai.expect(!error).to.be.true;
			$chai.expect(res.statusCode).to.equal(200);
		});

		it('Promise result should be outputed', () => {
			$chai.expect(json.code).to.equal(0);
		});

	});

	describe('fnpromise', function() {

		this.timeout(5000);

		let error;
		let res;
		let body;
		let json;

		before(done => {
			$request(host + '/api/fnpromise', (err, rs, bd) => {
				error = err;
				res = rs;
				body = bd;
				try {
					json = JSON.parse(body);
				} catch (err) {
					error = err;
					console.log(err);
				}
				done();
			});
		});

		it('Should support promise as return value', () => {
			$chai.expect(!error).to.be.true;
			$chai.expect(res.statusCode).to.equal(200);
		});

		it('Return promise result should be outputed', () => {
			$chai.expect(json.code).to.equal(0);
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
						error = err;
					}
					done();
				}
			);
		});

		it('Should support post (request.headers["content-type"]="application/x-www-form-urlencoded")', () => {
			$chai.expect(!error).to.be.true;
			$chai.expect(res.statusCode).to.equal(200);
		});

		it('Should get json from post request', () => {
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
						error = err;
					}
					done();
				}
			);
		});

		it('Should Support put (request.headers["content-type"]="application/json")', () => {
			$chai.expect(!error).to.be.true;
			$chai.expect(res.statusCode).to.equal(200);
		});

		it('Should get json from put request', () => {
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
					error = err;
				}
				done();
			});
		});

		it('Api should request succeed', () => {
			$chai.expect(!error).to.be.true;
			$chai.expect(res.statusCode).to.equal(200);
		});

		it('The json should be modified', () => {
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

describe('ignore', function() {

	this.timeout(5000);

	describe('ajax', function() {

		this.timeout(5000);

		let error;
		let res;

		before(done => {
			$request(host + '/ignore/test', (err, rs, bd) => {
				error = err;
				res = rs;
				done();
			});
		});

		it('Ignore page should be displayed as 404', () => {
			$chai.expect(!error).to.be.true;
			$chai.expect(res.statusCode).to.equal(404);
		});

	});

	after(done => {
		changeTimeStamp();
		done();
	});

});

