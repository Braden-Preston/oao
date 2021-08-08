"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _storyboard = require("storyboard");

var _storyboardListenerConsole = _interopRequireDefault(require("storyboard-listener-console"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const initConsole = (options = {}) => {
  const relativeTime = options.relativeTime;
  (0, _storyboard.addListener)(_storyboardListenerConsole.default, {
    relativeTime
  });
};

var _default = initConsole;
exports.default = _default;