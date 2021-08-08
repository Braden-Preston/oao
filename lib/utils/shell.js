"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.exec = exports.mv = exports.cp = void 0;

var _path = _interopRequireDefault(require("path"));

var _shelljs = _interopRequireDefault(require("shelljs"));

var _split = _interopRequireDefault(require("split"));

var _execa = _interopRequireDefault(require("execa"));

var _storyboard = require("storyboard");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const cp = (src, dst, {
  story = _storyboard.mainStory
} = {}) => {
  story.debug(`Copying ${_storyboard.chalk.cyan.bold(src)} -> ${_storyboard.chalk.cyan.bold(dst)}...`);

  _shelljs.default.cp('-rf', _path.default.normalize(src), _path.default.normalize(dst));
};

exports.cp = cp;

const mv = (src, dst, {
  story = _storyboard.mainStory
} = {}) => {
  story.debug(`Moving ${_storyboard.chalk.cyan.bold(src)} -> ${_storyboard.chalk.cyan.bold(dst)}...`);

  _shelljs.default.mv('-rf', _path.default.normalize(src), _path.default.normalize(dst));
};

exports.mv = mv;

const exec =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(function* (cmd, {
    story = _storyboard.mainStory,
    storySrc,
    createChildStory = true,
    logLevel = 'info',
    errorLogLevel = 'error',
    ignoreErrorCode = false,
    cwd
  } = {}) {
    let title = `Run cmd ${_storyboard.chalk.green.bold(cmd)}`;
    if (cwd) title += ` at ${_storyboard.chalk.green(cwd)}`;
    const ownStory = createChildStory ? story.child({
      title,
      level: logLevel
    }) : story || _storyboard.mainStory;

    try {
      return yield _exec(cmd, {
        cwd,
        story: ownStory,
        storySrc,
        errorLogLevel,
        ignoreErrorCode
      });
    } finally {
      if (createChildStory) ownStory.close();
    }
  });

  return function exec(_x) {
    return _ref.apply(this, arguments);
  };
}();

exports.exec = exec;

const _exec =
/*#__PURE__*/
function () {
  var _ref2 = _asyncToGenerator(function* (cmd, {
    cwd,
    story,
    storySrc,
    errorLogLevel,
    ignoreErrorCode
  }) {
    try {
      const src = storySrc || cmd.split(' ')[0].slice(0, 10);

      const child = _execa.default.shell(cmd, {
        cwd: cwd || '.',
        // Workaround for Node.js bug: https://github.com/nodejs/node/issues/10836
        // See also: https://github.com/yarnpkg/yarn/issues/2462
        stdio: process.platform === 'win32' ? ['ignore', 'pipe', 'pipe'] : undefined
      });

      child.stdout.pipe((0, _split.default)()).on('data', line => {
        story.info(src, line);
      });
      child.stderr.pipe((0, _split.default)()).on('data', line => {
        if (line) story[errorLogLevel](src, line);
      });

      const _ref3 = yield child,
            code = _ref3.code,
            stdout = _ref3.stdout,
            stderr = _ref3.stderr;

      if (code !== 0 && !ignoreErrorCode) {
        throw execError(cmd, cwd, code, stdout, stderr);
      }

      return {
        code,
        stdout,
        stderr
      };
    } catch (err) {
      if (err.code && ignoreErrorCode) {
        const code = err.code,
              stdout = err.stdout,
              stderr = err.stderr;
        return {
          code,
          stdout,
          stderr
        };
      }

      const err2 = execError(cmd, cwd, err.code, err.stdout, err.stderr);
      story[errorLogLevel](err2.message);
      throw err2;
    }
  });

  return function _exec(_x2, _x3) {
    return _ref2.apply(this, arguments);
  };
}();

const execError = (cmd, cwd, code, stdout, stderr) => {
  const errorMsg = `Command '${cmd}' failed ${code != null ? `[${code}]` : ''} at ${cwd || "'.'"}`;
  const err = new Error(errorMsg);
  err.code = code;
  err.stdout = stdout;
  err.stderr = stderr;
  return err;
};