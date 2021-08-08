"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.gitPushWithTags = exports.gitAddTag = exports.gitCommitChanges = exports.gitDiffSinceIn = exports.gitUnpulledChanges = exports.gitUncommittedChanges = exports.gitCurBranch = exports.gitLastTag = void 0;

var _shell = require("./shell");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const gitLastTag =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(function* () {
    try {
      let _ref2 = yield (0, _shell.exec)('git rev-list --tags --max-count=1', {
        logLevel: 'trace',
        errorLogLevel: 'info'
      }),
          commit = _ref2.stdout;

      commit = commit.trim();
      if (commit === '') return null;

      let _ref3 = yield (0, _shell.exec)(`git describe --tags ${commit}`, {
        logLevel: 'trace'
      }),
          tag = _ref3.stdout;

      tag = tag.trim();
      tag = tag !== '' ? tag : null;
      return tag;
    } catch (err) {
      return null;
    }
  });

  return function gitLastTag() {
    return _ref.apply(this, arguments);
  };
}();

exports.gitLastTag = gitLastTag;

const gitCurBranch =
/*#__PURE__*/
function () {
  var _ref4 = _asyncToGenerator(function* () {
    const _ref5 = yield (0, _shell.exec)('git symbolic-ref --short HEAD', {
      logLevel: 'trace'
    }),
          stdout = _ref5.stdout;

    return stdout.trim();
  });

  return function gitCurBranch() {
    return _ref4.apply(this, arguments);
  };
}();

exports.gitCurBranch = gitCurBranch;

const gitUncommittedChanges =
/*#__PURE__*/
function () {
  var _ref6 = _asyncToGenerator(function* () {
    const _ref7 = yield (0, _shell.exec)('git status --porcelain', {
      logLevel: 'trace'
    }),
          stdout = _ref7.stdout;

    return stdout.trim();
  });

  return function gitUncommittedChanges() {
    return _ref6.apply(this, arguments);
  };
}(); // Ripped off from: https://github.com/sindresorhus/np/blob/master/lib/git.js


exports.gitUncommittedChanges = gitUncommittedChanges;

const gitUnpulledChanges =
/*#__PURE__*/
function () {
  var _ref8 = _asyncToGenerator(function* () {
    const _ref9 = yield (0, _shell.exec)('git rev-list --count --left-only @{u}...HEAD', {
      logLevel: 'trace'
    }),
          stdout = _ref9.stdout;

    return stdout.trim();
  });

  return function gitUnpulledChanges() {
    return _ref8.apply(this, arguments);
  };
}();

exports.gitUnpulledChanges = gitUnpulledChanges;

const gitDiffSinceIn =
/*#__PURE__*/
function () {
  var _ref10 = _asyncToGenerator(function* (sinceTag, inPath) {
    if (sinceTag == null) return 'CHANGED';

    const _ref11 = yield (0, _shell.exec)(`git diff --name-only ${sinceTag} -- ${inPath}`, {
      logLevel: 'trace'
    }),
          stdout = _ref11.stdout;

    return stdout.trim();
  });

  return function gitDiffSinceIn(_x, _x2) {
    return _ref10.apply(this, arguments);
  };
}();

exports.gitDiffSinceIn = gitDiffSinceIn;

const gitCommitChanges =
/*#__PURE__*/
function () {
  var _ref12 = _asyncToGenerator(function* (msg) {
    yield (0, _shell.exec)('git add .', {
      logLevel: 'trace'
    });
    yield (0, _shell.exec)(`git commit -m ${msg}`, {
      logLevel: 'trace'
    });
  });

  return function gitCommitChanges(_x3) {
    return _ref12.apply(this, arguments);
  };
}();

exports.gitCommitChanges = gitCommitChanges;

const gitAddTag =
/*#__PURE__*/
function () {
  var _ref13 = _asyncToGenerator(function* (tag) {
    yield (0, _shell.exec)(`git tag ${tag}`, {
      logLevel: 'trace'
    });
  });

  return function gitAddTag(_x4) {
    return _ref13.apply(this, arguments);
  };
}();

exports.gitAddTag = gitAddTag;

const gitPushWithTags =
/*#__PURE__*/
function () {
  var _ref14 = _asyncToGenerator(function* () {
    yield (0, _shell.exec)('git push --quiet', {
      logLevel: 'trace'
    });
    yield (0, _shell.exec)('git push --tags --quiet', {
      logLevel: 'trace'
    });
  });

  return function gitPushWithTags() {
    return _ref14.apply(this, arguments);
  };
}();

exports.gitPushWithTags = gitPushWithTags;