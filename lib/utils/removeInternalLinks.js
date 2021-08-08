"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _timm = require("timm");

var _constants = require("./constants");

const removeInternalLinks = (prevSpecs, pkgNames, linkPattern) => {
  const removedPackagesByType = {};
  const allRemovedPackages = {};
  const regex = linkPattern ? new RegExp(linkPattern) : null;
  let nextSpecs = prevSpecs;

  _constants.DEP_TYPES.forEach(type => {
    const prevDeps = nextSpecs[type];
    if (prevDeps == null) return;
    let nextDeps = prevDeps;
    Object.keys(prevDeps).forEach(name => {
      // Is package to be removed? Only if it belongs to the internal
      // subpackage list (`pkgNames`) or it matches the custom `linkPattern`
      const fRemove = pkgNames.indexOf(name) >= 0 || regex != null && regex.test(name);
      if (!fRemove) return;
      const version = prevDeps[name];
      if (version == null) return;
      nextDeps = (0, _timm.omit)(nextDeps, [name]);
      if (!removedPackagesByType[type]) removedPackagesByType[type] = {};
      removedPackagesByType[type][name] = version;
      allRemovedPackages[name] = version;
    });
    nextSpecs = (0, _timm.set)(nextSpecs, type, nextDeps);
  });

  return {
    nextSpecs,
    removedPackagesByType,
    allRemovedPackages
  };
};

var _default = removeInternalLinks;
exports.default = _default;