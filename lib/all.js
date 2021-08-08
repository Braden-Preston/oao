"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _multiRun = _interopRequireDefault(require("./utils/multiRun"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const run = (cmd, options) => (0, _multiRun.default)(options, () => [cmd]);

var _default = run;
exports.default = _default;