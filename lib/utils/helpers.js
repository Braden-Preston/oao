"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.masterOrMainBranch = exports.parseDep = exports.dependsOn = exports.delay = exports.isObject = exports.shortenName = void 0;

var _constants = require("./constants");

const shortenName = (name, maxLen) => {
  if (name.length <= maxLen) return name;
  return `${name.slice(0, 2)}…${name.slice(-(maxLen - 3))}`;
};

exports.shortenName = shortenName;

const isObject = o => !!o && o.constructor === Object;

exports.isObject = isObject;

const delay = ms => new Promise(resolve => {
  setTimeout(resolve, ms);
});

exports.delay = delay;

const dependsOn = (pkg, possibleDep) => {
  const specs = pkg.specs;

  for (let i = 0; i < _constants.DEP_TYPES.length; i++) {
    const depType = _constants.DEP_TYPES[i];
    const deps = specs[depType] || {};
    if (deps[possibleDep]) return true;
  }

  return false;
};

exports.dependsOn = dependsOn;

const parseDep = dep => {
  // Extract package name from the dependency specs
  // (forget about the first character, for compatibility with scoped packages)
  const idx = dep.indexOf('@', 1);
  const name = idx >= 1 ? dep.slice(0, idx) : dep;
  const version = idx >= 1 ? dep.slice(idx + 1) : '';
  return {
    name,
    version
  };
};

exports.parseDep = parseDep;

const masterOrMainBranch = branch => {
  return branch === 'master' || branch === 'main';
};

exports.masterOrMainBranch = masterOrMainBranch;