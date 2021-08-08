#!/usr/bin/env node

/* eslint-disable max-len, global-require, import/no-dynamic-require, no-console */
"use strict";

var _path = _interopRequireDefault(require("path"));

var _timm = require("timm");

var _commander = _interopRequireDefault(require("commander"));

var _initConsole = _interopRequireDefault(require("./utils/initConsole"));

var _helpers = require("./utils/helpers");

var _status = _interopRequireDefault(require("./status"));

var _bootstrap = _interopRequireDefault(require("./bootstrap"));

var _clean = _interopRequireDefault(require("./clean"));

var _addRemoveUpgrade = _interopRequireDefault(require("./addRemoveUpgrade"));

var _removeAll = _interopRequireDefault(require("./removeAll"));

var _bump = _interopRequireDefault(require("./bump"));

var _outdated = _interopRequireDefault(require("./outdated"));

var _prepublish = _interopRequireDefault(require("./prepublish"));

var _publish = _interopRequireDefault(require("./publish"));

var _resetAllVersions = _interopRequireDefault(require("./resetAllVersions"));

var _all = _interopRequireDefault(require("./all"));

var _runScript = _interopRequireDefault(require("./runScript"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

process.env.YARN_SILENT = 0;

const pkg = require('../package.json');

const monorepoPkg = require(_path.default.resolve('package.json'));

const OAO_CONFIG = monorepoPkg.oao || {};
const DEFAULT_SRC_DIR = OAO_CONFIG.src || 'packages/*';
const DEFAULT_COPY_ATTRS = 'description,keywords,author,license,homepage,bugs,repository';
const DEFAULT_CHANGELOG = 'CHANGELOG.md';

_commander.default.version(pkg.version); // =========================================
// Helpers
// =========================================


const processOptions = options0 => {
  let options = options0;

  if (options.single) {
    options = (0, _timm.merge)(options, {
      src: []
    });
  } else {
    // If workspaces are enabled in the monorepo, some configuration is
    // overriden by the monorepo package.json
    if (monorepoPkg.workspaces) {
      let src = monorepoPkg.workspaces;
      if ((0, _helpers.isObject)(src)) src = src.packages;

      if (!src) {
        throw new Error('Could not find correct config for Yarn workspaces');
      }

      options = (0, _timm.merge)(options, {
        src,
        workspaces: true
      });
    } // Add extra configuration in the `oao` field of the monorepo package.json


    options = (0, _timm.addDefaults)(options, {
      ignoreSrc: OAO_CONFIG.ignoreSrc
    });
  }

  return options;
}; // Create a command with common options


const createCommand = (syntax, description) => _commander.default.command(syntax).description(description).option('-s --src <glob>', `glob pattern for sub-package paths [${DEFAULT_SRC_DIR}]`, DEFAULT_SRC_DIR).option('-i --ignore-src <glob>', 'glob pattern for sub-package paths that should be ignored').option('-l --link <regex>', 'regex pattern for dependencies that should be linked, not installed').option('--single', 'no subpackages, just the root one').option('--relative-time', 'shorten log dates'); // =========================================
// Commands
// =========================================


createCommand('status', 'Show an overview of the monorepo status').action(cmd => {
  const options = processOptions(cmd.opts());
  return (0, _status.default)(options);
});
createCommand('bootstrap', 'Install external dependencies and create internal links').option('--prod --production', 'skip external and internal development-only dependencies (also via NODE_ENV=production)').option('--no-lockfile', "don't read or generate a lockfile").option('--pure-lockfile', "don't generate a lockfile").option('--frozen-lockfile', "don't generate a lockfile and fail if an update is needed").option('--no-parallel', "don't run yarn install in parallel (use it to debug errors, since parallel logs may be hard to read)").action(cmd => {
  const options = processOptions(cmd.opts());
  (0, _initConsole.default)(options);
  return (0, _bootstrap.default)(options);
});
createCommand('clean', 'Delete all node_modules directories from sub-packages and the root package').action(cmd => {
  const options = processOptions(cmd.opts());
  (0, _initConsole.default)(options);
  return (0, _clean.default)(options);
});
createCommand('add <sub-package> <packages...>', 'Add dependencies to a sub-package').option('-D --dev', 'add to `devDependencies` instead of `dependencies`').option('-P --peer', 'add to `peerDependencies` instead of `dependencies`').option('-O --optional', 'add to `optionalDependencies` instead of `dependencies`').option('-E --exact', 'install the exact version').option('-T --tilde', 'install the most recent release with the same minor version').action((subpackage, deps, cmd) => {
  const options = processOptions(cmd.opts());
  (0, _initConsole.default)(options);
  return (0, _addRemoveUpgrade.default)(subpackage, 'add', deps, options);
});
createCommand('remove <sub-package> <packages...>', 'Remove dependencies from a sub-package').action((subpackage, deps, cmd) => {
  const options = processOptions(cmd.opts());
  (0, _initConsole.default)(options);
  return (0, _addRemoveUpgrade.default)(subpackage, 'remove', deps, options);
});
createCommand('remove-all <packages...>', 'Remove one or several dependencies throughout the monorepo').action(
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(function* (deps, cmd) {
    const options = processOptions(cmd.opts());
    (0, _initConsole.default)(options);
    yield (0, _removeAll.default)(deps, options);
    return (0, _bootstrap.default)(options);
  });

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}());
createCommand('upgrade <sub-package> [packages...]', 'Upgrade some/all dependencies of a package').option('--ignore-engines', 'disregard engines check during upgrade').action((subpackage, deps, cmd) => {
  const options = processOptions(cmd.opts());
  (0, _initConsole.default)(options);
  return (0, _addRemoveUpgrade.default)(subpackage, 'upgrade', deps, options);
});
createCommand('bump <packages...>', 'Upgrade one or several dependencies throughout the monorepo (e.g. react@next, timm)').action(
/*#__PURE__*/
function () {
  var _ref2 = _asyncToGenerator(function* (deps, cmd) {
    const options = processOptions(cmd.opts());
    (0, _initConsole.default)(options);
    yield (0, _bump.default)(deps, options);
    return (0, _bootstrap.default)(options);
  });

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}());
createCommand('outdated', 'Check for outdated dependencies').action(cmd => {
  const options = processOptions(cmd.opts());
  (0, _initConsole.default)(options);
  return (0, _outdated.default)(options);
});
createCommand('prepublish', 'Prepare for a release: validate versions, copy READMEs and package.json attrs').option('--copy-attrs <attrs>', `copy these package.json attrs to sub-packages [${DEFAULT_COPY_ATTRS}]`, DEFAULT_COPY_ATTRS).action(cmd => {
  const options = processOptions(cmd.opts());
  (0, _initConsole.default)(options);
  return (0, _prepublish.default)(options);
});
createCommand('publish', 'Publish all (non-private) sub-packages').option('--no-master', 'allow publishing from a non-master or non-main branch').option('--no-check-uncommitted', 'skip uncommitted check').option('--no-check-unpulled', 'skip unpulled check').option('--no-checks', 'skip all pre-publish checks').option('--no-bump', 'do not increment version numbers (also disables git commit)').option('--bump-dependent-reqs <no|exact|range>', 'bump dependent requirements (inside the monorepo) following this approach: no bumping, exact version, version range (default: range)').option('--no-confirm', 'do not ask for confirmation before publishing').option('--no-git-commit', 'skip the commit-tag-push step before publishing').option('--no-npm-publish', 'skip the npm publish step').option('--new-version <version>', 'use this version for publishing, instead of asking').option('--increment-version-by <major|minor|patch|rc|beta|alpha>', 'increment version by this, instead of asking').option('--publish-tag <tag>', 'publish with a custom tag (instead of `latest`)').option('--changelog-path <path>', `changelog path [${DEFAULT_CHANGELOG}]`, DEFAULT_CHANGELOG).option('--no-changelog', 'skip changelog updates').option('--otp <code>', 'use 2-factor authentication to publish your package').option('--access <public|restricted>', 'publish "public" or "restricted" packages').action(cmd => {
  const options = processOptions(cmd.opts());
  (0, _initConsole.default)(options);
  return (0, _publish.default)(options);
});
createCommand('reset-all-versions <version>', 'Reset all versions (incl. monorepo package) to the specified one').option('--no-confirm', 'do not ask for confirmation').action((version, cmd) => {
  const options = processOptions(cmd.opts());
  (0, _initConsole.default)(options);
  return (0, _resetAllVersions.default)(version, options);
});
createCommand('all <command>', 'Run a given command on all sub-packages').option('--tree', 'follow dependency tree (starting from the tree leaves)').option('--parallel', 'run command in parallel on all sub-packages').option('--no-parallel-logs', 'use chronological logging, even in parallel mode').option('--parallel-limit <#processes>', 'max number of processes to launch').option('--ignore-errors', 'do not stop even if there are errors in some packages').action((command, cmd) => {
  // Extract arguments following the first separator (`--`) and
  // add them to the command to be executed
  const rawArgs = cmd.parent.rawArgs;
  const idxSeparator = rawArgs.indexOf('--');
  const finalCommand = idxSeparator >= 0 ? [command].concat(rawArgs.slice(idxSeparator + 1)).join(' ') : command; // Run the `all` command

  const options = processOptions(cmd.opts());
  (0, _initConsole.default)(options);
  return (0, _all.default)(finalCommand, options);
});
createCommand('run-script <command>', 'Run a given script on all sub-packages').option('--tree', 'follow dependency tree (starting from the tree leaves)').option('--parallel', 'run script in parallel on all sub-packages').option('--no-parallel-logs', 'use chronological logging, even in parallel mode').option('--parallel-limit <#processes>', 'max number of processes to launch').option('--ignore-errors', 'do not stop even if there are errors in some packages').action((command, cmd) => {
  const options = processOptions(cmd.opts());
  (0, _initConsole.default)(options);
  return (0, _runScript.default)(command, options);
});
process.on('unhandledRejection', err => {
  console.error(err); // eslint-disable-line

  process.exit(1);
});
process.on('SIGINT', () => {
  process.exit(0);
}); // Syntax error -> show CLI help

_commander.default.command('*', '', {
  noHelp: true
}).action(() => _commander.default.outputHelp());

if (process.argv.length <= 2) _commander.default.outputHelp(); // Let's go!

_commander.default.parse(process.argv);