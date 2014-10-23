'use strict';

var chalk = require('chalk');
var path = require('path');
var util = require('util');
var Promise = require('bluebird');
var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;

module.exports = function transformify(cb, config) {
  if(!config) config = {};
  config.name = config.name || 'gulp-streamify';
  return function (options) {
    if(!options) options = {};
    return through.obj(function(file, encoding, next) {
      Promise.bind(this)
      .then(function() {
        if(typeof config.config === 'function') {
          config.config.call(options, file);
        }
        return Promise.resolve(cb(String(file.contents), options));
      })
      .then(function(result) {
        file.contents = new Buffer(config.returns ? result[config.returns] : result);
        if(config.log) {
          gutil.log(util.format('Processed \'%s\' through %s', chalk.cyan(path.relative(process.cwd(), file.path)), chalk.magenta(config.name)));
        }
        if(config.ext) {
          file.path = gutil.replaceExtension(file.path, config.ext);
        }
        this.push(file);
      })
      .catch(function(err) {
        // Convert the keys so PluginError can read them
        err.lineNumber = err.lineNumber || err.line || NaN;
        err.fileName = err.fileName || err.filename || 'input';
        // Add a better error message
        err.message = err.message + ' in file ' + err.fileName + ' line no. ' + err.lineNumber;
        this.emit('error', new PluginError(config.name, err));
      });
    });
  };
};
