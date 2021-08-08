"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _storyboard = require("storyboard");

var _kebabCase = _interopRequireDefault(require("kebab-case"));

var _semver = _interopRequireDefault(require("semver"));

var _readSpecs = require("./utils/readSpecs");

var _removeInternalLinks2 = _interopRequireDefault(require("./utils/removeInternalLinks"));

var _writeSpecs = _interopRequireDefault(require("./utils/writeSpecs"));

var _shell = require("./utils/shell");

var _promises = require("./utils/promises");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const PASS_THROUGH_OPTS = ['production', 'noLockfile', 'pureLockfile', 'frozenLockfile'];

const run =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(function* (opts) {
    const src = opts.src,
          ignoreSrc = opts.ignoreSrc,
          linkPattern = opts.link;
    const production = opts.production || process.env.NODE_ENV === 'production'; // Almost nothing to do when using yarn workspaces ;)

    if (opts.workspaces) {
      _storyboard.mainStory.info('Using yarn workspaces...');

      yield (0, _shell.exec)('yarn install');
      return;
    } // Proceed, the old way


    const allSpecs = yield (0, _readSpecs.readAllSpecs)(src, ignoreSrc);
    const pkgNames = Object.keys(allSpecs);
    const allRemovedDepsByPackage = {};
    const allRemovedDepsByPackageAndType = {}; // Pass 0: register all subpackages (yarn link) [PARALLEL]

    _storyboard.mainStory.info(`${_storyboard.chalk.bold('PASS 0:')} registering all subpackages...`);

    yield (0, _promises.runInParallel)(pkgNames,
    /*#__PURE__*/
    function () {
      var _ref2 = _asyncToGenerator(function* (pkgName) {
        if (pkgName === _readSpecs.ROOT_PACKAGE) return;
        const _allSpecs$pkgName = allSpecs[pkgName],
              displayName = _allSpecs$pkgName.displayName,
              pkgPath = _allSpecs$pkgName.pkgPath;

        _storyboard.mainStory.info(`  - ${_storyboard.chalk.cyan.bold(displayName)}`);

        yield (0, _shell.exec)('yarn link', {
          cwd: pkgPath,
          logLevel: 'trace',
          errorLogLevel: 'info' // reduce yarn's log level (stderr) when subpackage is already registered

        });
      });

      return function (_x2) {
        return _ref2.apply(this, arguments);
      };
    }()); // Pass 1: install external deps for all subpackages [PARALLEL]

    _storyboard.mainStory.info(`${_storyboard.chalk.bold('PASS 1:')} installing external dependencies...`);

    const installer =
    /*#__PURE__*/
    function () {
      var _ref3 = _asyncToGenerator(function* (pkgName) {
        // if (pkgName === ROOT_PACKAGE) return;
        const _allSpecs$pkgName2 = allSpecs[pkgName],
              displayName = _allSpecs$pkgName2.displayName,
              pkgPath = _allSpecs$pkgName2.pkgPath,
              specPath = _allSpecs$pkgName2.specPath,
              prevSpecs = _allSpecs$pkgName2.specs;

        _storyboard.mainStory.info(`  - ${_storyboard.chalk.cyan.bold(displayName)}`); // Rewrite package.json without own/linked packages, install, and revert changes


        let fModified = false;

        try {
          const _removeInternalLinks = (0, _removeInternalLinks2.default)(prevSpecs, pkgNames, linkPattern),
                nextSpecs = _removeInternalLinks.nextSpecs,
                allRemovedPackages = _removeInternalLinks.allRemovedPackages,
                removedPackagesByType = _removeInternalLinks.removedPackagesByType;

          allRemovedDepsByPackage[pkgName] = allRemovedPackages;
          allRemovedDepsByPackageAndType[pkgName] = removedPackagesByType;

          if (nextSpecs !== prevSpecs) {
            (0, _writeSpecs.default)(specPath, nextSpecs);
            fModified = true;
          }

          let cmd = 'yarn install';
          PASS_THROUGH_OPTS.forEach(key => {
            if (opts[key]) cmd += ` --${(0, _kebabCase.default)(key)}`;
          });
          yield (0, _shell.exec)(cmd, {
            cwd: pkgPath,
            logLevel: 'trace'
          });
        } finally {
          if (prevSpecs != null && fModified) (0, _writeSpecs.default)(specPath, prevSpecs);
        }
      });

      return function installer(_x3) {
        return _ref3.apply(this, arguments);
      };
    }();

    if (opts.parallel) {
      yield (0, _promises.runInParallel)(pkgNames, installer, {
        waitForAllToResolve: true
      });
    } else {
      yield (0, _promises.runInSeries)(pkgNames, installer);
    } // Pass 2: link internal and user-specified deps [PARALLEL]


    _storyboard.mainStory.info(`${_storyboard.chalk.bold('PASS 2:')} Installing all internal dependencies...`);

    yield (0, _promises.runInParallel)(pkgNames,
    /*#__PURE__*/
    function () {
      var _ref4 = _asyncToGenerator(function* (pkgName) {
        const allRemovedPackages = allRemovedDepsByPackage[pkgName];
        const removedPackagesByType = allRemovedDepsByPackageAndType[pkgName];
        const packagesToLink = Object.keys(allRemovedPackages);
        const _allSpecs$pkgName3 = allSpecs[pkgName],
              displayName = _allSpecs$pkgName3.displayName,
              pkgPath = _allSpecs$pkgName3.pkgPath;
        yield (0, _promises.runInParallel)(packagesToLink,
        /*#__PURE__*/
        function () {
          var _ref5 = _asyncToGenerator(function* (depName) {
            if (production && isPureDevDependency(removedPackagesByType, depName)) {
              return;
            }

            _storyboard.mainStory.info(`  - ${_storyboard.chalk.cyan.bold(displayName)} -> ${_storyboard.chalk.cyan.bold(depName)}`);

            const depVersionRange = allRemovedPackages[depName];
            const depSpecs = allSpecs[depName]; // might not exist, if it's a custom link

            const depActualVersion = depSpecs ? depSpecs.specs.version : null;

            if (depActualVersion && !_semver.default.satisfies(depActualVersion, depVersionRange)) {
              _storyboard.mainStory.warn(`    Warning: ${_storyboard.chalk.cyan.bold(`${depName}@${depActualVersion}`)} ` + `does not satisfy specified range: ${_storyboard.chalk.cyan.bold(depVersionRange)}`);
            }

            yield (0, _shell.exec)(`yarn link ${depName}`, {
              cwd: pkgPath,
              logLevel: 'trace'
            });
          });

          return function (_x5) {
            return _ref5.apply(this, arguments);
          };
        }());
      });

      return function (_x4) {
        return _ref4.apply(this, arguments);
      };
    }());
  });

  return function run(_x) {
    return _ref.apply(this, arguments);
  };
}();

const isPureDevDependency = (deps, depName) => !(deps.dependencies && deps.dependencies[depName] || deps.optionalDependencies && deps.optionalDependencies[depName] || deps.peerDependencies && deps.peerDependencies[depName]);

var _default = run;
exports.default = _default;