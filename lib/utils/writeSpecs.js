"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _fs = _interopRequireDefault(require("fs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const writeSpecs = (specPath, specs) => {
  _fs.default.writeFileSync(specPath, `${JSON.stringify(specs, null, 2)}\n`, 'utf8');
};

var _default = writeSpecs;
exports.default = _default;