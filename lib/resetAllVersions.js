"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _timm = require("timm");

var _storyboard = require("storyboard");

var _inquirer = _interopRequireDefault(require("inquirer"));

var _semver = _interopRequireDefault(require("semver"));

var _readSpecs = require("./utils/readSpecs");

var _writeSpecs = _interopRequireDefault(require("./utils/writeSpecs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const run =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(function* (version, {
    src,
    ignoreSrc,
    confirm = true
  }) {
    if (!_semver.default.valid(version)) {
      _storyboard.mainStory.error(`Version ${version} is not valid`);

      throw new Error('INVALID_VERSION');
    }

    const allSpecs = yield (0, _readSpecs.readAllSpecs)(src, ignoreSrc);
    const pkgNames = Object.keys(allSpecs); // Ask for confirmation

    if (confirm) {
      const _ref2 = yield _inquirer.default.prompt([{
        name: 'goAhead',
        type: 'confirm',
        message: 'Are you sure you want to reset the version number of all packages, ' + `including the monorepo root, to ${_storyboard.chalk.cyan.yellow(version)} ` + `(${_storyboard.chalk.cyan.bold(pkgNames.length)} package/s, including monorepo)?`,
        default: false
      }]),
            goAhead = _ref2.goAhead;

      if (!goAhead) process.exit(0);
    }

    for (let i = 0; i < pkgNames.length; i++) {
      const pkgName = pkgNames[i];
      const _allSpecs$pkgName = allSpecs[pkgName],
            specPath = _allSpecs$pkgName.specPath,
            prevSpecs = _allSpecs$pkgName.specs;
      const nextSpecs = (0, _timm.set)(prevSpecs, 'version', version);
      (0, _writeSpecs.default)(specPath, nextSpecs);
    }
  });

  return function run(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

var _default = run;
exports.default = _default;