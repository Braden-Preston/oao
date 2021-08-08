"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.calcGraphAndReturnAsAllSpecs = void 0;

var _constants = require("./constants");

const calcGraph = allSpecs => {
  const out = [];
  const pkgNames = Object.keys(allSpecs);
  if (!pkgNames.length) return out; // Build virtual root node

  const virtualRootDeps = {};
  pkgNames.forEach(name => {
    virtualRootDeps[name] = true;
  });
  const virtualRootNode = {
    name: '__VIRTUAL_ROOT__',
    specs: {
      dependencies: virtualRootDeps
    }
  }; // Build graph starting from virtual root node, then remove it

  buildGraph(allSpecs, virtualRootNode, pkgNames, out);
  return out.slice(0, out.length - 1);
};

const calcGraphAndReturnAsAllSpecs = allSpecs => {
  const newAllSpecs = {};
  const orderedPackages = calcGraph(allSpecs);
  orderedPackages.forEach(pkg => {
    newAllSpecs[pkg] = allSpecs[pkg];
  });
  return newAllSpecs;
};

exports.calcGraphAndReturnAsAllSpecs = calcGraphAndReturnAsAllSpecs;

const buildGraph = (allSpecs, pkg, pkgNames, out, visited = []) => {
  const name = pkg.name;
  visited.push(name);
  const internalDeps = getInternalDeps(pkg, pkgNames);

  for (let i = 0; i < internalDeps.length; i++) {
    const depName = internalDeps[i];
    if (visited.indexOf(depName) >= 0) continue;
    buildGraph(allSpecs, allSpecs[depName], pkgNames, out, visited);
  }

  out.push(name);
};

const getInternalDeps = (pkg, pkgNames) => {
  const specs = pkg.specs;
  const internalDeps = {};

  for (let i = 0; i < _constants.DEP_TYPES.length; i++) {
    const depType = _constants.DEP_TYPES[i];
    const deps = specs[depType] || {};
    const depNames = Object.keys(deps);

    for (let k = 0; k < depNames.length; k++) {
      const pkgName = depNames[k];
      if (pkgNames.indexOf(pkgName) >= 0) internalDeps[pkgName] = true;
    }
  }

  return Object.keys(internalDeps);
};

var _default = calcGraph;
exports.default = _default;