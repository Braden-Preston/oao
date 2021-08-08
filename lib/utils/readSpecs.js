"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ROOT_PACKAGE = exports.readOneSpec = exports.readAllSpecs = void 0;

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

var _storyboard = require("storyboard");

var _listPaths = _interopRequireDefault(require("./listPaths"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const ROOT_PACKAGE = '__ROOT_PACKAGE__';
exports.ROOT_PACKAGE = ROOT_PACKAGE;

const readAllSpecs =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(function* (src, ignoreSrc, includeRootPkg = true) {
    const pkgPaths = yield (0, _listPaths.default)(src, ignoreSrc);
    if (includeRootPkg) pkgPaths.push('.');
    const allSpecs = {};

    _storyboard.mainStory.info('Reading all package.json files...');

    pkgPaths.forEach(pkgPath => {
      const pkg = readOneSpec(pkgPath);
      allSpecs[pkg.name] = pkg;
    });
    return allSpecs;
  });

  return function readAllSpecs(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

exports.readAllSpecs = readAllSpecs;

const readOneSpec = pkgPath => {
  const pkg = {};
  pkg.pkgPath = pkgPath;

  try {
    pkg.specPath = _path.default.resolve(process.cwd(), pkgPath, 'package.json');
    pkg.specs = JSON.parse(_fs.default.readFileSync(pkg.specPath, 'utf8'));
  } catch (err) {
    _storyboard.mainStory.error(`Could not read package.json at ${pkg.specPath}`);

    throw err;
  }

  const name = pkgPath === '.' ? ROOT_PACKAGE : pkg.specs.name;
  validatePkgName(pkgPath, name);
  pkg.name = name;
  pkg.displayName = name === ROOT_PACKAGE ? 'MONOREPO ROOT' : name;
  return pkg;
};

exports.readOneSpec = readOneSpec;

const validatePkgName = (pkgPath, name) => {
  if (name == null || name === '') {
    throw new Error(`Package has no name (${pkgPath})`);
  }

  if (pkgPath === '.') return;
  const segments = pkgPath.split('/');

  if (name[0] !== '@' && name !== segments[segments.length - 1]) {
    const errMsg = `Package name (${name}) does not match directory name ${pkgPath}`;

    _storyboard.mainStory.error(errMsg);

    const err = new Error('INVALID_DIR_NAME'); // $FlowFixMe (piggyback on exception)

    err.details = errMsg;
    throw err;
  }
};