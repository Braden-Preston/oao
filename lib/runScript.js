"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _minimatch = _interopRequireDefault(require("minimatch"));

var _multiRun = _interopRequireDefault(require("./utils/multiRun"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const run = (script, options) => (0, _multiRun.default)(options, specs => {
  const scripts = specs.scripts;
  if (!scripts) return [];
  const scriptNames = Object.keys(scripts).filter(o => (0, _minimatch.default)(o, script));
  if (!scriptNames.length) return [];
  return scriptNames.map(o => `yarn run ${o}`);
});

var _default = run;
exports.default = _default;