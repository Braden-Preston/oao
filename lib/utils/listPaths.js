"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _globby = _interopRequireDefault(require("globby"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const listPaths =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(function* (src, ignoreSrc) {
    const patterns = Array.isArray(src) ? src : [src];
    if (ignoreSrc) patterns.push(`!${ignoreSrc}`);
    const paths = yield (0, _globby.default)(patterns);
    return paths.filter(filePath => {
      try {
        return _fs.default.statSync(_path.default.resolve(process.cwd(), filePath)).isDirectory() && _fs.default.existsSync(_path.default.resolve(process.cwd(), filePath, 'package.json'));
      } catch (err) {
        return false;
      }
    }).map(filePath => filePath === '/' || filePath[filePath.length - 1] !== '/' ? filePath : filePath.slice(0, -1));
  });

  return function listPaths(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

var _default = listPaths;
exports.default = _default;