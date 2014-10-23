'use strict';

var Promise = require('bluebird');
var through = require('through2');
var PluginError = require('gulp-util').PluginError;

module.exports = function transformify(cb, name) {
  return function (config) {
    return through.obj(function(file, encoding, next) {
      Promise.bind(this)
      .then(function() {
        return Promise.resolve(cb(String(file.contents), config));
      })
      .then(function(result) {
        file.contents = new Buffer(result);
        this.push(file);
      })
      .catch(function(err) {
        // Convert the keys so PluginError can read them
        err.lineNumber = err.lineNumber || err.line || NaN;
        err.fileName = err.fileName || err.filename || 'input';
        // Add a better error message
        err.message = err.message + ' in file ' + err.fileName + ' line no. ' + err.lineNumber;
        this.emit('error', new PluginError(name || 'gulp-streamify', err));
      });
    });
  };
};
