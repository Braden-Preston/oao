"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _storyboard = require("storyboard");

var _readSpecs = require("./utils/readSpecs");

var _git = require("./utils/git");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const run =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(function* (opts) {
    (0, _storyboard.config)({
      filter: '-*'
    });
    const lastTag = yield gitStatus();
    yield subpackageStatus(opts, lastTag);
    console.log('');
  });

  return function run(_x) {
    return _ref.apply(this, arguments);
  };
}();

const gitStatus =
/*#__PURE__*/
function () {
  var _ref2 = _asyncToGenerator(function* () {
    console.log('');
    console.log('* Git status:');
    console.log('');

    try {
      const branch = yield (0, _git.gitCurBranch)();
      console.log(`    - Current branch: ${_storyboard.chalk.cyan.bold(branch)}`);
    } catch (err) {
      console.log(`    - ${_storyboard.chalk.red.bold('Could not be determined')} (is this a git repo?)`);
    }

    let lastTag;

    try {
      lastTag = yield (0, _git.gitLastTag)();
      console.log(`    - Last tag: ${lastTag != null ? _storyboard.chalk.cyan.bold(lastTag) : _storyboard.chalk.yellow.bold('NONE YET')}`);
    } catch (err) {
      /* ignore */
    }

    try {
      const uncommitted = yield (0, _git.gitUncommittedChanges)();
      console.log(`    - Uncommitted changes: ${uncommitted !== '' ? _storyboard.chalk.yellow.bold('YES') : _storyboard.chalk.cyan.bold('no')}`);
    } catch (err) {
      /* ignore */
    }

    try {
      const unpulled = yield (0, _git.gitUnpulledChanges)();
      console.log(`    - Unpulled changes: ${unpulled !== '0' ? _storyboard.chalk.yellow.bold('YES') : _storyboard.chalk.cyan.bold('no')}`);
    } catch (err) {
      console.log(`    - Unpulled changes: ${_storyboard.chalk.yellow.bold('UNKNOWN (no upstream?)')}`);
    }

    return lastTag;
  });

  return function gitStatus() {
    return _ref2.apply(this, arguments);
  };
}();

const subpackageStatus =
/*#__PURE__*/
function () {
  var _ref3 = _asyncToGenerator(function* (opts, lastTag) {
    const src = opts.src,
          ignoreSrc = opts.ignoreSrc;
    let allSpecs;

    try {
      allSpecs = yield (0, _readSpecs.readAllSpecs)(src, ignoreSrc);
    } catch (err) {
      if (err.message === 'INVALID_DIR_NAME') {
        console.error(`INVALID_DIR_NAME - ${err.details}`);
      }

      throw err;
    }

    const pkgNames = Object.keys(allSpecs);
    console.log('');
    console.log(`* Subpackage status: [${_storyboard.chalk.cyan.bold(pkgNames.length)} package/s, incl. root]`);
    console.log('');
    console.log(_storyboard.chalk.gray('    Name                                     Version        Private Changes Dependencies'));

    for (let i = 0; i < pkgNames.length; i++) {
      const pkgName = pkgNames[i];
      const _allSpecs$pkgName = allSpecs[pkgName],
            pkgPath = _allSpecs$pkgName.pkgPath,
            specs = _allSpecs$pkgName.specs;
      let name = pkgName === _readSpecs.ROOT_PACKAGE ? 'Root' : pkgName;
      name = field(name, 40);
      if (pkgName === _readSpecs.ROOT_PACKAGE) name = _storyboard.chalk.italic(name);

      const version = _storyboard.chalk.cyan.bold(field(specs.version, 14));

      const isPrivate = specs.private ? _storyboard.chalk.cyan.bold(field('yes', 7)) : _storyboard.chalk.yellow.bold(field('NO', 7));
      let changes;

      if (pkgName !== _readSpecs.ROOT_PACKAGE) {
        const diff = yield (0, _git.gitDiffSinceIn)(lastTag, pkgPath);
        changes = diff !== '' ? _storyboard.chalk.yellow.bold(field(String(diff.split('\n').length), 7)) : _storyboard.chalk.gray(field('-', 7));
      } else {
        changes = _storyboard.chalk.gray(field('N/A', 7));
      }

      const dependencies = specs.dependencies,
            devDependencies = specs.devDependencies;
      const numDeps = Object.keys(dependencies || {}).length;
      const numDevDeps = Object.keys(devDependencies || {}).length;
      let deps = `${_storyboard.chalk.cyan.bold(numDeps)}`;
      if (numDevDeps) deps += ` (+ ${_storyboard.chalk.cyan.bold(numDevDeps)} dev)`;
      console.log(`    ${name} ${version} ${isPrivate} ${changes} ${deps}`);
    }
  });

  return function subpackageStatus(_x2, _x3) {
    return _ref3.apply(this, arguments);
  };
}();

const field = (str = '', n) => {
  if (str.length > n) return `${str.slice(0, n - 1)}…`;
  let out = str; // inefficient, slow, etc. but doesn't matter in this case, and easy to read

  while (out.length < n) out += ' ';

  return out;
};

var _default = run;
exports.default = _default;