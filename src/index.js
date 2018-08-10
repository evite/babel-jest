'use strict';

/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var babel = require('babel-core');

var _babelPluginIstanbul = require('babel-plugin-istanbul');

var _babelPluginIstanbul2 = _interopRequireDefault(_babelPluginIstanbul);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}

var BABELRC_FILENAME = '.babelrc';
var BABELRC_JS_FILENAME = '.babelrc.js';
var BABEL_CONFIG_KEY = 'babel';
var PACKAGE_JSON = 'package.json';
var THIS_FILE = _fs2.default.readFileSync(__filename);

var createTransformer = function createTransformer(options) {
  var cache = Object.create(null);

  var getBabelRC = function getBabelRC(filename) {
    var paths = [];
    var directory = filename;
    while (directory !== (directory = _path2.default.dirname(directory))) {
      if (cache[directory]) {
        break;
      }

      paths.push(directory);
      var configFilePath = _path2.default.join(directory, BABELRC_FILENAME);
      if (_fs2.default.existsSync(configFilePath)) {
        cache[directory] = _fs2.default.readFileSync(configFilePath, 'utf8');
        break;
      }
      var configJsFilePath = _path2.default.join(
        directory,
        BABELRC_JS_FILENAME
      );
      if (_fs2.default.existsSync(configJsFilePath)) {
        // $FlowFixMe
        cache[directory] = JSON.stringify(require(configJsFilePath));
        break;
      }
      var resolvedJsonFilePath = _path2.default.join(directory, PACKAGE_JSON);
      var packageJsonFilePath =
        resolvedJsonFilePath === PACKAGE_JSON
          ? _path2.default.resolve(directory, PACKAGE_JSON)
          : resolvedJsonFilePath;
      if (_fs2.default.existsSync(packageJsonFilePath)) {
        // $FlowFixMe
        var packageJsonFileContents = require(packageJsonFilePath);
        if (packageJsonFileContents[BABEL_CONFIG_KEY]) {
          cache[directory] = JSON.stringify(
            packageJsonFileContents[BABEL_CONFIG_KEY]
          );
          break;
        }
      }
    }
    paths.forEach(function(directoryPath) {
      return (cache[directoryPath] = cache[directory]);
    });
    return cache[directory] || '';
  };

  options = Object.assign({}, options, {
    compact: false,
    plugins: (options && options.plugins) || [],
    presets: ((options && options.presets) || []),
    sourceMaps: 'both',
  });
  delete options.cacheDirectory;
  delete options.filename;

  return {
    canInstrument: true,
    getCacheKey: function getCacheKey(fileData, filename, configString, _ref) {
      var instrument = _ref.instrument,
        rootDir = _ref.rootDir;

      return _crypto2.default
        .createHash('md5')
        .update(THIS_FILE)
        .update('\0', 'utf8')
        .update(JSON.stringify(options))
        .update('\0', 'utf8')
        .update(fileData)
        .update('\0', 'utf8')
        .update(_path2.default.relative(rootDir, filename))
        .update('\0', 'utf8')
        .update(configString)
        .update('\0', 'utf8')
        .update(getBabelRC(filename))
        .update('\0', 'utf8')
        .update(instrument ? 'instrument' : '')
        .digest('hex');
    },
    process: function process(src, filename, config, transformOptions) {
      var altExts = config.moduleFileExtensions.map(function(extension) {
        return '.' + extension;
      });
      if (babel.util && !babel.util.canCompile(filename, altExts)) {
        console.log('can compile: ' + filename);
        return src;
      }

      var theseOptions = Object.assign({filename: filename}, options);
      if (transformOptions && transformOptions.instrument) {
        theseOptions.auxiliaryCommentBefore = ' istanbul ignore next ';
        // Copied from jest-runtime transform.js
        theseOptions.plugins = theseOptions.plugins.concat([
          [
            _babelPluginIstanbul2.default,
            {
              // files outside `cwd` will not be instrumented
              cwd: config.rootDir,
              exclude: [],
            },
          ],
        ]);
      }

      // babel v7 might return null in the case when the file has been ignored.
      var transformResult = babel.transformFileSync(filename, theseOptions);
      if (!transformResult) return;

      return transformResult.code;
    },
  };
};

module.exports = createTransformer();
module.exports.createTransformer = createTransformer;
