"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _path = _interopRequireDefault(require("path"));

var _rimraf = _interopRequireDefault(require("rimraf"));

var _storyboard = require("storyboard");

var _readSpecs = require("./utils/readSpecs");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const run =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(function* ({
    src,
    ignoreSrc
  }) {
    const allSpecs = yield (0, _readSpecs.readAllSpecs)(src, ignoreSrc);
    const pkgNames = Object.keys(allSpecs);
    yield Promise.all(pkgNames.map(pkgName => new Promise((resolve, reject) => {
      const pkgPath = allSpecs[pkgName].pkgPath;

      const nodeModulesPath = _path.default.join(pkgPath, 'node_modules');

      _storyboard.mainStory.info(`Removing ${_storyboard.chalk.cyan.bold(nodeModulesPath)}...`);

      (0, _rimraf.default)(nodeModulesPath, err => {
        if (err) {
          reject(err);
          return;
        }

        resolve();
      });
    })));
  });

  return function run(_x) {
    return _ref.apply(this, arguments);
  };
}();

var _default = run;
exports.default = _default;