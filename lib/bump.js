"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _timm = require("timm");

var _storyboard = require("storyboard");

var _readSpecs = require("./utils/readSpecs");

var _constants = require("./utils/constants");

var _helpers = require("./utils/helpers");

var _writeSpecs = _interopRequireDefault(require("./utils/writeSpecs"));

var _shell = require("./utils/shell");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const run =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(function* (deps, opts) {
    const src = opts.src,
          ignoreSrc = opts.ignoreSrc,
          linkPattern = opts.link;
    const allSpecs = yield (0, _readSpecs.readAllSpecs)(src, ignoreSrc);
    const pkgNames = Object.keys(allSpecs); // Determine correct version for each dep

    const versions = {};

    for (let i = 0; i < deps.length; i++) {
      const dep = deps[i];

      const _parseDep = (0, _helpers.parseDep)(dep),
            name = _parseDep.name,
            version = _parseDep.version;

      let finalVersion = version;

      if (!finalVersion) {
        if (pkgNames.indexOf(dep) >= 0) {
          finalVersion = `^${allSpecs[dep].specs.version}`;
        } else if (linkPattern && new RegExp(linkPattern).test(dep)) {
          finalVersion = '*';
        } else {
          const _ref2 = yield (0, _shell.exec)(`npm info ${dep} version`, {
            logLevel: 'trace'
          }),
                stdout = _ref2.stdout;

          finalVersion = `^${stdout.trim()}`;
        }
      }

      versions[name] = finalVersion;
    }

    _storyboard.mainStory.info('New versions of these packages:', {
      attach: versions
    }); // Update all package.json files with this version


    pkgNames.forEach(pkgName => {
      const _allSpecs$pkgName = allSpecs[pkgName],
            specPath = _allSpecs$pkgName.specPath,
            prevSpecs = _allSpecs$pkgName.specs;
      let nextSpecs = prevSpecs;
      deps.forEach(dep => {
        const _parseDep2 = (0, _helpers.parseDep)(dep),
              depName = _parseDep2.name;

        _constants.DEP_TYPES.forEach(type => {
          const depsOfType = nextSpecs[type] || {};

          if (depsOfType[depName] != null) {
            nextSpecs = (0, _timm.setIn)(nextSpecs, [type, depName], versions[depName]);
          }
        });
      });
      if (nextSpecs !== prevSpecs) (0, _writeSpecs.default)(specPath, nextSpecs);
    });
  });

  return function run(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

var _default = run;
exports.default = _default;