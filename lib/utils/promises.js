"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.runInParallel = exports.runInSeries = void 0;

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const runInSeries =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(function* (items, cb) {
    const out = [];

    for (let i = 0; i < items.length; i++) {
      out[i] = yield cb(items[i]);
    }

    return out;
  });

  return function runInSeries(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

exports.runInSeries = runInSeries;

const runInParallel =
/*#__PURE__*/
function () {
  var _ref2 = _asyncToGenerator(function* (items, cb, {
    waitForAllToResolve
  } = {}) {
    const promises = items.map(cb);

    try {
      yield Promise.all(promises);
    } catch (err) {
      if (waitForAllToResolve) {
        for (let i = 0; i < promises.length; i++) {
          try {
            yield promises[i];
          } catch (err2) {
            /* ignore */
          }
        }
      }

      throw err;
    }
  });

  return function runInParallel(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();

exports.runInParallel = runInParallel;