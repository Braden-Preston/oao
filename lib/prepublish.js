"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _path = _interopRequireDefault(require("path"));

var _timm = require("timm");

var _semver = _interopRequireDefault(require("semver"));

var _storyboard = require("storyboard");

var _readSpecs = require("./utils/readSpecs");

var _writeSpecs = _interopRequireDefault(require("./utils/writeSpecs"));

var _shell = require("./utils/shell");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const run =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(function* ({
    src,
    ignoreSrc,
    copyAttrs: copyAttrsStr
  }) {
    const allSpecs = yield (0, _readSpecs.readAllSpecs)(src, ignoreSrc);
    const pkgNames = Object.keys(allSpecs);
    const rootSpecs = allSpecs[_readSpecs.ROOT_PACKAGE].specs; // Check version numbers!

    const masterVersion = rootSpecs.version;

    for (let i = 0; i < pkgNames.length; i++) {
      const pkgName = pkgNames[i];
      if (pkgName === _readSpecs.ROOT_PACKAGE) continue;
      const specs = allSpecs[pkgName].specs;
      const version = specs.version;
      if (specs.private) continue;

      if (!_semver.default.valid(version)) {
        _storyboard.mainStory.error(`Invalid version for ${_storyboard.chalk.bold(pkgName)}: ${_storyboard.chalk.bold(version)}`);

        throw new Error('INVALID_VERSION');
      }

      if (_semver.default.gt(version, masterVersion)) {
        _storyboard.mainStory.error(`Version for ${pkgName} (${_storyboard.chalk.bold(version)}) > master version (${_storyboard.chalk.bold(masterVersion)})`);

        throw new Error('INVALID_VERSION');
      }
    } // Copy READMEs to all non-private packages


    for (let i = 0; i < pkgNames.length; i++) {
      const pkgName = pkgNames[i];
      if (pkgName === _readSpecs.ROOT_PACKAGE) continue;
      const _allSpecs$pkgName = allSpecs[pkgName],
            pkgPath = _allSpecs$pkgName.pkgPath,
            specs = _allSpecs$pkgName.specs;
      if (specs.private) continue;
      const srcFile = pkgName === rootSpecs.name ? 'README.md' : 'README-LINK.md';

      const dstFile = _path.default.join(pkgPath, 'README.md');

      (0, _shell.cp)(srcFile, dstFile);
    } // Merge common attributes with submodules


    const commonSpecs = {};
    const copyAttrs = copyAttrsStr.split(/\s*,\s*/);
    copyAttrs.forEach(attr => {
      commonSpecs[attr] = rootSpecs[attr];
    });

    _storyboard.mainStory.info('Updating package attributes', {
      attach: commonSpecs
    });

    for (let i = 0; i < pkgNames.length; i++) {
      const pkgName = pkgNames[i];
      if (pkgName === _readSpecs.ROOT_PACKAGE) continue;
      const _allSpecs$pkgName2 = allSpecs[pkgName],
            specPath = _allSpecs$pkgName2.specPath,
            prevSpecs = _allSpecs$pkgName2.specs;
      if (prevSpecs.private) continue;
      const nextSpecs = (0, _timm.merge)(prevSpecs, commonSpecs);
      (0, _writeSpecs.default)(specPath, nextSpecs);
    }

    _storyboard.mainStory.warn('Please make sure you commit all changes before you attempt "oao publish"');
  });

  return function run(_x) {
    return _ref.apply(this, arguments);
  };
}();

var _default = run;
exports.default = _default;