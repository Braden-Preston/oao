"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _semver = _interopRequireDefault(require("semver"));

var _inquirer = _interopRequireDefault(require("inquirer"));

var _storyboard = require("storyboard");

var _readSpecs = require("./utils/readSpecs");

var _writeSpecs = _interopRequireDefault(require("./utils/writeSpecs"));

var _shell = require("./utils/shell");

var _git = require("./utils/git");

var _changelog = require("./utils/changelog");

var _helpers = require("./utils/helpers");

var _calcGraph = require("./utils/calcGraph");

var _bump = _interopRequireDefault(require("./bump"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const DEBUG_SKIP_CHECKS = false;
const RELEASE_INCREMENTS = ['major', 'minor', 'patch'];
const PRERELEASE_INCREMENTS = ['rc', 'beta', 'alpha'];
const INCREMENTS = [...RELEASE_INCREMENTS, ...PRERELEASE_INCREMENTS];

const run =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(function* ({
    src,
    ignoreSrc,
    link,
    master,
    checkUncommitted,
    checkUnpulled,
    checks,
    confirm,
    bump,
    bumpDependentReqs,
    gitCommit,
    newVersion,
    npmPublish,
    publishTag,
    incrementVersionBy,
    changelog,
    changelogPath,
    single,
    otp,
    access,
    _date,
    _masterVersion
  }) {
    const allSpecs = (0, _calcGraph.calcGraphAndReturnAsAllSpecs)((yield (0, _readSpecs.readAllSpecs)(src, ignoreSrc))); // Confirm that we have run build and run prepublish checks

    if (confirm && !(yield confirmBuild())) return;
    yield prepublishChecks({
      checks,
      master,
      checkUncommitted,
      checkUnpulled
    }); // Get list of packages to be updated. This is NOT the list of packages to
    // be published, since some of them might be private. But all of them will
    // be version-bumped

    const pkgList = [];
    let numPublic = 0;
    Object.keys(allSpecs).forEach(pkgName => {
      if (pkgName === _readSpecs.ROOT_PACKAGE && !single) return;
      pkgList.push(pkgName);
      const specs = allSpecs[pkgName].specs;
      if (!specs.private) numPublic += 1;
    });

    if (!pkgList.length) {
      _storyboard.mainStory.info('No packages found!');

      return;
    }

    if (bump) {
      // Determine a suitable new version number
      const lastTag = yield (0, _git.gitLastTag)();
      const masterVersion = _masterVersion || (yield getMasterVersion(allSpecs, lastTag));
      if (masterVersion == null) return;
      if (incrementVersionBy) validateVersionIncrement(incrementVersionBy);
      const nextVersion = newVersion || calcNextVersion(masterVersion, incrementVersionBy) || (yield promptNextVersion(masterVersion)); // Confirm before proceeding

      if (confirm && !(yield confirmPublish({
        pkgList,
        numPublic,
        nextVersion
      }))) return; // Update package.json's for pkgList packages AND THE ROOT PACKAGE

      const pkgListPlusRoot = single ? pkgList : pkgList.concat(_readSpecs.ROOT_PACKAGE);
      pkgListPlusRoot.forEach(pkgName => {
        const _allSpecs$pkgName = allSpecs[pkgName],
              specPath = _allSpecs$pkgName.specPath,
              specs = _allSpecs$pkgName.specs;
        specs.version = nextVersion;
        (0, _writeSpecs.default)(specPath, specs);
      }); // Bump dependent requirements

      if (!single && bumpDependentReqs !== 'no') {
        const bumpList = pkgList.map(pkgName => bumpDependentReqs === 'exact' ? `${pkgName}@${nextVersion}` : `${pkgName}@^${nextVersion}`);
        yield (0, _bump.default)(bumpList, {
          src,
          ignoreSrc,
          link
        });
      } // Update changelog


      if (changelog) {
        (0, _changelog.addVersionLine)({
          changelogPath,
          version: nextVersion,
          _date
        });
      } // Commit, tag and push


      if (gitCommit) {
        yield (0, _git.gitCommitChanges)(`\":package: release - v${nextVersion}\"`);
        yield (0, _git.gitAddTag)(`v${nextVersion}`);
        yield (0, _git.gitPushWithTags)();
      }
    } // Publish


    if (npmPublish) {
      for (let i = 0; i < pkgList.length; i++) {
        const pkgName = pkgList[i];
        const _allSpecs$pkgName2 = allSpecs[pkgName],
              pkgPath = _allSpecs$pkgName2.pkgPath,
              specs = _allSpecs$pkgName2.specs;
        if (specs.private) continue; // we don't want npm to complain :)

        let cmd = 'npm publish';
        if (publishTag != null) cmd += ` --tag ${publishTag}`;
        if (otp != null) cmd += ` --otp ${otp}`;
        if (access === 'public' || access === 'restricted') cmd += ` --access ${access}`;
        yield (0, _shell.exec)(cmd, {
          cwd: pkgPath
        });
      }
    }
  });

  return function run(_x) {
    return _ref.apply(this, arguments);
  };
}(); // ------------------------------------------------
// Helpers
// ------------------------------------------------


const prepublishChecks =
/*#__PURE__*/
function () {
  var _ref2 = _asyncToGenerator(function* ({
    checks,
    master,
    checkUncommitted,
    checkUnpulled
  }) {
    if (!checks) return;

    if (DEBUG_SKIP_CHECKS) {
      _storyboard.mainStory.warn('DEBUG_SKIP_CHECKS should be disabled!!');
    } // Check current branch


    const branch = yield (0, _git.gitCurBranch)();

    if (!(0, _helpers.masterOrMainBranch)(branch)) {
      if (master) {
        _storyboard.mainStory.error(`Can't publish from current branch: ${_storyboard.chalk.bold(branch)}`);

        if (!DEBUG_SKIP_CHECKS) throw new Error('BRANCH_CHECK_FAILED');
      }

      _storyboard.mainStory.warn(`Publishing from a non-master or non-main branch: ${_storyboard.chalk.red.bold(branch)}`);
    } else {
      _storyboard.mainStory.info(`Current branch: ${_storyboard.chalk.yellow.bold(branch)}`);
    } // Check that the branch is clean


    const uncommitted = yield (0, _git.gitUncommittedChanges)();

    if (uncommitted !== '') {
      if (checkUncommitted) {
        _storyboard.mainStory.error(`Can't publish with uncommitted changes (stash/commit them): \n${_storyboard.chalk.bold(uncommitted)}`);

        if (!DEBUG_SKIP_CHECKS) throw new Error('UNCOMMITTED_CHECK_FAILED');
      }

      _storyboard.mainStory.warn('Publishing with uncommitted changes');
    } else {
      _storyboard.mainStory.info('No uncommitted changes');
    } // Check remote history


    const unpulled = yield (0, _git.gitUnpulledChanges)();

    if (unpulled !== '0') {
      if (checkUnpulled) {
        _storyboard.mainStory.error('Remote history differs. Please pull changes');

        if (!DEBUG_SKIP_CHECKS) throw new Error('UNPULLED_CHECK_FAILED');
      }

      _storyboard.mainStory.warn('Publishing with unpulled changes');
    } else {
      _storyboard.mainStory.info('Remote history matches local history');
    }
  });

  return function prepublishChecks(_x2) {
    return _ref2.apply(this, arguments);
  };
}();

const confirmBuild =
/*#__PURE__*/
function () {
  var _ref3 = _asyncToGenerator(function* () {
    const _ref4 = yield _inquirer.default.prompt([{
      name: 'confirmBuild',
      type: 'confirm',
      message: 'Have you built all your packages for production?',
      default: false
    }]),
          out = _ref4.confirmBuild;

    return out;
  });

  return function confirmBuild() {
    return _ref3.apply(this, arguments);
  };
}();

const confirmPublish =
/*#__PURE__*/
function () {
  var _ref5 = _asyncToGenerator(function* ({
    pkgList,
    numPublic,
    nextVersion
  }) {
    const _ref6 = yield _inquirer.default.prompt([{
      name: 'confirmPublish',
      type: 'confirm',
      message: `Confirm release (${_storyboard.chalk.yellow.bold(pkgList.length)} package/s, ${_storyboard.chalk.yellow.bold(numPublic)} public, v${_storyboard.chalk.cyan.bold(nextVersion)})?`,
      default: false
    }]),
          out = _ref6.confirmPublish;

    return out;
  });

  return function confirmPublish(_x3) {
    return _ref5.apply(this, arguments);
  };
}();

const validateVersionIncrement = incrementVersionBy => {
  if (INCREMENTS.indexOf(incrementVersionBy) < 0) {
    _storyboard.mainStory.error(`Value specified for --increment-version-by: ${_storyboard.chalk.bold(incrementVersionBy)} is invalid.`);

    _storyboard.mainStory.error(`It should be one of (${INCREMENTS.join(', ')}), or not specified.`);

    if (!DEBUG_SKIP_CHECKS) throw new Error('INVALID_INCREMENT_BY_VALUE');
  }
};

const getMasterVersion =
/*#__PURE__*/
function () {
  var _ref7 = _asyncToGenerator(function* (allSpecs, lastTag) {
    let masterVersion = allSpecs[_readSpecs.ROOT_PACKAGE].specs.version;

    if (lastTag != null) {
      const tagVersion = _semver.default.clean(lastTag);

      _storyboard.mainStory.info(`Last tag found: ${_storyboard.chalk.yellow.bold(lastTag)}`);

      if (tagVersion !== masterVersion) {
        _storyboard.mainStory.warn(`Last tagged version ${_storyboard.chalk.cyan.bold(tagVersion)} does not match package.json version ${_storyboard.chalk.cyan.bold(masterVersion)}`);

        const _ref8 = yield _inquirer.default.prompt([{
          name: 'confirm',
          type: 'confirm',
          message: 'Continue?',
          default: false
        }]),
              confirm = _ref8.confirm;

        if (!confirm) return null;

        if (_semver.default.valid(tagVersion) && _semver.default.gt(tagVersion, masterVersion)) {
          masterVersion = tagVersion;
        }

        _storyboard.mainStory.warn(`Using ${_storyboard.chalk.cyan.bold(masterVersion)} as reference (the highest one of both)`);
      }
    } else {
      _storyboard.mainStory.warn('Repo has no tags yet');
    }

    if (!_semver.default.valid(masterVersion)) {
      _storyboard.mainStory.error(`Master version ${_storyboard.chalk.cyan.bold(masterVersion)} is invalid. Please correct it manually`);

      throw new Error('INVALID_VERSION');
    }

    return masterVersion;
  });

  return function getMasterVersion(_x4, _x5) {
    return _ref7.apply(this, arguments);
  };
}();

const calcNextVersion = (prevVersion, incrementBy = '') => {
  if (!incrementBy) return null;
  const isPreRelease = PRERELEASE_INCREMENTS.indexOf(incrementBy) >= 0;
  const increment = isPreRelease ? 'prerelease' : incrementBy;
  const isNewPreRelease = isPreRelease && prevVersion.indexOf(incrementBy) < 0;
  return isNewPreRelease ? `${_semver.default.inc(prevVersion, 'major')}-${incrementBy}.0` : _semver.default.inc(prevVersion, increment);
};

const promptNextVersion =
/*#__PURE__*/
function () {
  var _ref9 = _asyncToGenerator(function* (prevVersion) {
    const major = _semver.default.inc(prevVersion, 'major');

    const minor = _semver.default.inc(prevVersion, 'minor');

    const patch = _semver.default.inc(prevVersion, 'patch');

    const prerelease = _semver.default.inc(prevVersion, 'prerelease');

    const rc = prevVersion.indexOf('rc') < 0 ? `${major}-rc.0` : prerelease;
    const beta = prevVersion.indexOf('beta') < 0 ? `${major}-beta.0` : prerelease;
    const alpha = prevVersion.indexOf('alpha') < 0 ? `${major}-alpha.0` : prerelease;

    const _ref10 = yield _inquirer.default.prompt([{
      name: 'nextVersion',
      type: 'list',
      message: `Current version is ${_storyboard.chalk.cyan.bold(prevVersion)}. Next one?`,
      choices: [{
        name: `Major (${_storyboard.chalk.cyan.bold(major)})`,
        value: major
      }, {
        name: `Minor (${_storyboard.chalk.cyan.bold(minor)})`,
        value: minor
      }, {
        name: `Patch (${_storyboard.chalk.cyan.bold(patch)})`,
        value: patch
      }, {
        name: `Release candidate (${_storyboard.chalk.cyan.bold(rc)})`,
        value: rc
      }, {
        name: `Beta (${_storyboard.chalk.cyan.bold(beta)})`,
        value: beta
      }, {
        name: `Alpha (${_storyboard.chalk.cyan.bold(alpha)})`,
        value: alpha
      }],
      defaultValue: 2
    }]),
          nextVersion = _ref10.nextVersion;

    return nextVersion;
  });

  return function promptNextVersion(_x6) {
    return _ref9.apply(this, arguments);
  };
}(); // ------------------------------------------------
// Public
// ------------------------------------------------


var _default = run;
exports.default = _default;