"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _timm = require("timm");

var _storyboard = require("storyboard");

var _kebabCase = _interopRequireDefault(require("kebab-case"));

var _readSpecs = require("./utils/readSpecs");

var _constants = require("./utils/constants");

var _helpers = require("./utils/helpers");

var _removeInternalLinks2 = _interopRequireDefault(require("./utils/removeInternalLinks"));

var _writeSpecs = _interopRequireDefault(require("./utils/writeSpecs"));

var _shell = require("./utils/shell");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const PASS_THROUGH_OPTS = ['dev', 'peer', 'optional', 'exact', 'tilde', 'ignoreEngines'];

const run =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(function* (pkgName0, op, deps, opts) {
    const src = opts.src,
          ignoreSrc = opts.ignoreSrc,
          linkPattern = opts.link;
    const pkgName = pkgName0 === '.' || pkgName0 === 'ROOT' ? _readSpecs.ROOT_PACKAGE : pkgName0;
    const allSpecs = yield (0, _readSpecs.readAllSpecs)(src, ignoreSrc);

    if (!allSpecs[pkgName]) {
      _storyboard.mainStory.error(`No such package: ${pkgName}`);

      process.exit(1);
    }

    const _allSpecs$pkgName = allSpecs[pkgName],
          pkgPath = _allSpecs$pkgName.pkgPath,
          specPath = _allSpecs$pkgName.specPath,
          prevSpecs = _allSpecs$pkgName.specs; // Very little to do when using yarn workspaces ;)

    if (opts.workspaces) {
      _storyboard.mainStory.info('Using yarn workspaces...');

      const cmd = getYarnCommand(op, deps, opts);
      yield (0, _shell.exec)(cmd, {
        cwd: pkgPath
      });
      return;
    } // Proceed, the old way


    const pkgNames = Object.keys(allSpecs); // Add/remove/upgrade EXTERNAL dependencies:
    // 1. Remove internal links from package.json
    // 2. Run `yarn add/remove/upgrade` as needed (if it fails, revert to original specs and abort)
    // 3. Add the original internal links back to package.json

    const externalDeps = deps.filter(dep => !isLinked(pkgNames, linkPattern, dep));
    const externalOperation = externalDeps.length || op === 'upgrade' && !deps.length;

    if (externalOperation) {
      const _removeInternalLinks = (0, _removeInternalLinks2.default)(prevSpecs, pkgNames, linkPattern),
            nextSpecs = _removeInternalLinks.nextSpecs,
            removedPackagesByType = _removeInternalLinks.removedPackagesByType;

      let succeeded = false;

      try {
        if (nextSpecs !== prevSpecs) (0, _writeSpecs.default)(specPath, nextSpecs);

        _storyboard.mainStory.info(`Executing 'yarn ${op}'...`);

        const cmd = getYarnCommand(op, externalDeps, opts);
        yield (0, _shell.exec)(cmd, {
          cwd: pkgPath
        });
        succeeded = true;
      } catch (err) {}
      /* ignore */
      // If unsuccessful, revert to the original specs


      if (!succeeded) {
        if (prevSpecs != null) (0, _writeSpecs.default)(specPath, prevSpecs);
        return;
      } // Read the updated package.json, and add the internal deps


      const _readOneSpec = (0, _readSpecs.readOneSpec)(pkgPath),
            updatedSpecs = _readOneSpec.specs;

      let finalSpecs = updatedSpecs;
      Object.keys(removedPackagesByType).forEach(type => {
        const removedPackages = removedPackagesByType[type];
        const nextDeps = (0, _timm.merge)(updatedSpecs[type] || {}, removedPackages);
        finalSpecs = (0, _timm.set)(finalSpecs, type, nextDeps);
      });
      (0, _writeSpecs.default)(specPath, finalSpecs);
    } // Add/remove/upgrade INTERNAL dependencies:


    const internalDeps = deps.filter(dep => isLinked(pkgNames, linkPattern, dep));
    const internalOperation = internalDeps.length || op === 'upgrade' && !deps.length;

    if (internalOperation) {
      _storyboard.mainStory.info(`Processing '${op}' on internal dependencies...`);

      const _readOneSpec2 = (0, _readSpecs.readOneSpec)(pkgPath),
            specs = _readOneSpec2.specs;

      let nextSpecs;

      switch (op) {
        case 'add':
          nextSpecs = yield addInternal(specs, internalDeps, pkgPath, allSpecs, opts);
          break;

        case 'remove':
          nextSpecs = yield removeInternal(specs, internalDeps, pkgPath);
          break;

        case 'upgrade':
          nextSpecs = upgradeInternal(specs, internalDeps, allSpecs, linkPattern);
          break;

        default:
          throw new Error('INVALID_ADD_REMOVE_UPGRADE_COMMAND');
      }

      if (nextSpecs !== prevSpecs) (0, _writeSpecs.default)(specPath, nextSpecs);
    }
  });

  return function run(_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
}();

const addInternal =
/*#__PURE__*/
function () {
  var _ref2 = _asyncToGenerator(function* (prevSpecs, deps, pkgPath, allSpecs, opts) {
    let nextSpecs = prevSpecs;

    for (let i = 0; i < deps.length; i++) {
      const _parseDep = (0, _helpers.parseDep)(deps[i]),
            depName = _parseDep.name,
            depVersion0 = _parseDep.version;

      try {
        _storyboard.mainStory.info(`Linking ${_storyboard.chalk.cyan.bold(depName)}...`);

        yield (0, _shell.exec)(`yarn link ${depName}`, {
          cwd: pkgPath,
          logLevel: 'trace',
          errorLogLevel: 'trace'
        });
      } catch (err) {
        /* ignore unlink errors */
      }

      let depType;
      if (opts.dev) depType = 'devDependencies';else if (opts.peer) depType = 'peerDependencies';else if (opts.optional) depType = 'optionalDependencies';else depType = 'dependencies';
      let depVersion = depVersion0;

      if (!depVersion) {
        depVersion = allSpecs[depName] ? allSpecs[depName].specs.version : '*';

        if (depVersion !== '*') {
          if (opts.tilde) depVersion = `~${depVersion}`;else if (!opts.exact) depVersion = `^${depVersion}`;
        }
      }

      nextSpecs = (0, _timm.setIn)(nextSpecs, [depType, depName], depVersion);
    }

    return nextSpecs;
  });

  return function addInternal(_x5, _x6, _x7, _x8, _x9) {
    return _ref2.apply(this, arguments);
  };
}();

const removeInternal =
/*#__PURE__*/
function () {
  var _ref3 = _asyncToGenerator(function* (prevSpecs, deps, pkgPath) {
    let nextSpecs = prevSpecs;

    for (let i = 0; i < deps.length; i++) {
      const _parseDep2 = (0, _helpers.parseDep)(deps[i]),
            depName = _parseDep2.name;

      try {
        _storyboard.mainStory.info(`Unlinking ${_storyboard.chalk.cyan.bold(depName)}...`);

        yield (0, _shell.exec)(`yarn unlink ${depName}`, {
          cwd: pkgPath,
          logLevel: 'trace',
          errorLogLevel: 'trace'
        });
      } catch (err) {
        /* ignore unlink errors */
      }

      for (let k = 0; k < _constants.DEP_TYPES.length; k++) {
        const type = _constants.DEP_TYPES[k];
        if (!nextSpecs[type]) continue;
        nextSpecs = (0, _timm.setIn)(nextSpecs, [type, depName], undefined);
      }
    }

    return nextSpecs;
  });

  return function removeInternal(_x10, _x11, _x12) {
    return _ref3.apply(this, arguments);
  };
}();

const upgradeInternal = (prevSpecs, deps, allSpecs, linkPattern) => {
  const pkgNames = Object.keys(allSpecs);
  let nextSpecs = prevSpecs;
  const targetVersions = {};
  deps.forEach(dep => {
    const _parseDep3 = (0, _helpers.parseDep)(dep),
          name = _parseDep3.name,
          version = _parseDep3.version;

    targetVersions[name] = version;
  });

  _constants.DEP_TYPES.forEach(type => {
    Object.keys(nextSpecs[type] || {}).forEach(depName => {
      if (!isLinked(pkgNames, linkPattern, depName)) return;
      let depVersion = targetVersions[depName];

      if (!depVersion && allSpecs[depName]) {
        depVersion = `^${allSpecs[depName].specs.version}`;
      }

      nextSpecs = (0, _timm.setIn)(nextSpecs, [type, depName], depVersion);
    });
  });

  return nextSpecs;
};

const isLinked = (pkgNames, linkPattern, dep) => {
  const _parseDep4 = (0, _helpers.parseDep)(dep),
        pkgName = _parseDep4.name;

  if (pkgNames.indexOf(pkgName) >= 0) return true;
  if (linkPattern && new RegExp(linkPattern).test(pkgName)) return true;
  return false;
};

const getYarnCommand = (op, dependencies, options) => {
  let cmd = `yarn ${op}`;
  if (dependencies.length) cmd += ` ${dependencies.join(' ')}`;
  PASS_THROUGH_OPTS.forEach(key => {
    if (options[key]) cmd += ` --${(0, _kebabCase.default)(key)}`;
  });
  return cmd;
};

var _default = run;
exports.default = _default;