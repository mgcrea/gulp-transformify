var pkg = require('../package.json');
var streamify = require('../' + pkg.main);
var path = require('path');
var File = require('gulp-util').File;
var Buffer = require('buffer').Buffer;
var should = require('should');
var sinon = require('sinon');
require('mocha');

describe('gulp-streamify', function() {

  var defaults = {
    contents: new Buffer('foo();'),
    path: '/tmp/test/fixture/baz.js',
    cwd: '/tmp/test/',
    base: '/tmp/test/fixture/'
  };

  beforeEach(function() {
  });

  describe('gulp-streamify()', function() {

    it('should be correctly called', function(done) {

      var fixture = new File(defaults);

      var spy = sinon.spy();
      var transform = streamify(function(contents) {
        return contents + 'bar();';
      });
      var stream = transform();
      stream.on('data', spy);
      stream.once('end', done);
      spy.called.should.equal.true;
      stream.end();

    });

    it('should transform files content', function(done) {

      var fixture = new File(defaults);

      var transform = streamify(function(contents) {
        return contents + 'bar();';
      });
      var stream = transform();
      stream.on('data', function(file) {
        file.contents.toString().should.equal('foo();bar();');
        done();
      });
      stream.once('end', done);
      stream.write(fixture);
      stream.end();

    });

    it('should merge defaults', function(done) {

      var fixture = new File(defaults);

      var transform = streamify(function(contents) {
        throw new Error('error');
      });
      var stream = transform();
      stream.on('error', function(err) {
        err.message.should.equal('error in file input line no. NaN');
        done();
      });
      stream.once('end', done);
      stream.write(fixture);
      stream.end();

    });

  });

});
