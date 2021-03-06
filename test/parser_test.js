/*eslint-env node, mocha */

var chai = require('chai');
var Transform = require('stream').Transform;
var Parser = require('../parser.js');

var assert = chai.assert;

describe('#parser', function () {
  var readable, writable;
  var parser;

  beforeEach(function () {
    parser = new Parser();
    readable = new Transform();
    writable = new Transform();
    writable.result = '';
    writable._transform = function (data, encoding, done) {
      if (data !== undefined) {
        data = data + '';
        this.result += data;
      }
      done();
    };
    readable.pipe(parser).pipe(writable);
  });

  it('takes in a normal string', function (done) {
    var testString = 'hello world';
    readable.push(testString);
    readable.end();
    writable.on('finish', function () {
      assert.strictEqual(testString + '\n', writable.result);
      done();
    });
  });

  it('does not take in beginStub', function (done) {
    readable.push('//STUB');
    readable.end();

    writable.on('finish', function () {
      assert.strictEqual('', writable.result);
      done();
    });
  });

  it('is case insensitive', function (done) {
    readable.push('//stub');
    readable.end();

    writable.on('finish', function () {
      assert.strictEqual('', writable.result);
      done();
    });
  });

  it('does not take in text after beginStub', function (done) {
    readable.push('//STUB');
    readable.push('hello world');
    readable.push('//ENDSTUB');
    readable.end();

    writable.on('finish', function () {
      assert.strictEqual('', writable.result);
      done();
    });
  });

  it('does not take in text before beginStub in same line', function (done) {
    readable.push('hello world //STUB');
    readable.end();

    writable.on('finish', function () {
      assert.strictEqual('', writable.result);
      done();
    });
  });

  it('leaves in text above beginStub', function (done) {
    readable.push('hello world');
    readable.push('//STUB');
    readable.end();

    writable.on('finish', function () {
      assert.strictEqual('hello world\n', writable.result);
      done();
    });
  });

  it('leaves in text below endStub', function (done) {
    readable.push('//STUB');
    readable.push('//ENDSTUB');
    readable.push('hello world');
    readable.end();

    writable.on('finish', function () {
      assert.strictEqual('hello world\n', writable.result);
      done();
    });
  });

  it('can take in two beginStubs', function (done) {
    readable.push('//STUB');
    readable.push('//STUB');
    readable.push('//ENDSTUB');
    readable.push('hello world');
    readable.end();

    writable.on('finish', function () {
      assert.strictEqual('hello world\n', writable.result);
      done();
    });
  });

});
