"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _storyboard = require("storyboard");

var _semver = _interopRequireDefault(require("semver"));

var _readSpecs = require("./utils/readSpecs");

var _removeInternalLinks = _interopRequireDefault(require("./utils/removeInternalLinks"));

var _writeSpecs = _interopRequireDefault(require("./utils/writeSpecs"));

var _shell = require("./utils/shell");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const run =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(function* (opts) {
    const src = opts.src,
          ignoreSrc = opts.ignoreSrc,
          linkPattern = opts.link;
    const allSpecs = yield (0, _readSpecs.readAllSpecs)(src, ignoreSrc);
    const pkgNames = Object.keys(allSpecs);

    for (let i = 0; i < pkgNames.length; i++) {
      const pkgName = pkgNames[i];
      const _allSpecs$pkgName = allSpecs[pkgName],
            pkgPath = _allSpecs$pkgName.pkgPath,
            specPath = _allSpecs$pkgName.specPath,
            prevSpecs = _allSpecs$pkgName.specs;

      const story = _storyboard.mainStory.child({
        title: `Outdated dependencies in ${_storyboard.chalk.cyan.bold(pkgName)}`,
        level: 'info'
      }); // Rewrite package.json without own/linked packages, run `yarn outdated`, and revert changes


      let fModified = false;
      let allRemovedPackages;

      try {
        const tmp = (0, _removeInternalLinks.default)(prevSpecs, pkgNames, linkPattern);
        const nextSpecs = tmp.nextSpecs;
        allRemovedPackages = tmp.allRemovedPackages;

        if (nextSpecs !== prevSpecs) {
          (0, _writeSpecs.default)(specPath, nextSpecs);
          fModified = true;
        }

        yield (0, _shell.exec)('yarn outdated', {
          cwd: pkgPath,
          story,
          createChildStory: false,
          ignoreErrorCode: true,
          logLevel: 'trace'
        });
      } catch (err) {
        story.close();
        throw err;
      } finally {
        if (prevSpecs != null && fModified) (0, _writeSpecs.default)(specPath, prevSpecs);
      } // Log warnings when linked sub-packages do not match the specified range


      try {
        Object.keys(allRemovedPackages).forEach(depName => {
          const depVersionRange = allRemovedPackages[depName];
          const depSpecs = allSpecs[depName];
          if (!depSpecs) return; // might not exist, if it's a custom link

          const depActualVersion = depSpecs.specs.version;

          if (!_semver.default.satisfies(depActualVersion, depVersionRange)) {
            story.warn(`| - Warning: ${_storyboard.chalk.cyan.bold(`${depName}@${depActualVersion}`)} ` + `does not satisfy the specified range: ${_storyboard.chalk.cyan.bold(depVersionRange)}`);
          }
        });
      } finally {
        story.close();
      }
    }
  });

  return function run(_x) {
    return _ref.apply(this, arguments);
  };
}();

var _default = run;
exports.default = _default;