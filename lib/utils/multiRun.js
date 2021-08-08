"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _os = require("os");

var _storyboard = require("storyboard");

var _storyboardListenerConsoleParallel = _interopRequireDefault(require("storyboard-listener-console-parallel"));

var _readSpecs = require("./readSpecs");

var _shell = require("./shell");

var _helpers = require("./helpers");

var _calcGraph = _interopRequireDefault(require("./calcGraph"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const DELAY_MAIN_LOOP = 20; // [ms]

const PLACEHOLDER_COMMAND = '__OAO_PLACEHOLDER_COMMAND__'; // ------------------------------------------------
// Main
// ------------------------------------------------

const multiRun =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(function* ({
    src,
    ignoreSrc,
    tree: useTree,
    parallel,
    parallelLogs,
    parallelLimit,
    ignoreErrors,
    relativeTime
  }, getCommandsForSubpackage) {
    if (parallel && parallelLogs) {
      (0, _storyboard.removeAllListeners)();
      (0, _storyboard.addListener)(_storyboardListenerConsoleParallel.default, {
        relativeTime
      });
    } // Gather all jobs


    const allJobs = [];
    const allSpecs = yield (0, _readSpecs.readAllSpecs)(src, ignoreSrc, false);
    const pkgNames = useTree ? (0, _calcGraph.default)(allSpecs) : Object.keys(allSpecs);

    for (let i = 0; i < pkgNames.length; i += 1) {
      const pkgName = pkgNames[i];
      const pkg = allSpecs[pkgName];
      const pkgPath = pkg.pkgPath;
      const storySrc = parallel && !parallelLogs ? (0, _helpers.shortenName)(pkgName, 20) : undefined;
      const commands = getCommandsForSubpackage(pkg.specs);

      if (commands.length) {
        commands.forEach(cmd => {
          allJobs.push({
            cmd,
            cwd: pkgPath,
            storySrc,
            status: 'idle',
            pkg
          });
        });
      } else if (useTree) {
        // Suppose A --> B --> C (where --> means "depends on"),
        // and B generates no jobs, whilst A and C do.
        // Creating a placeholder job for B simplifies getNextJob(),
        // since it will only need to check direct dependencies between
        // subpackages
        allJobs.push({
          cmd: PLACEHOLDER_COMMAND,
          cwd: pkgPath,
          status: 'idle',
          pkg
        });
      }
    } // Run in serial or parallel mode


    if (!parallel) {
      yield runSerially(allJobs, {
        ignoreErrors
      });
    } else {
      yield runInParallel(allJobs, {
        ignoreErrors,
        parallelLogs,
        parallelLimit,
        useTree
      });
    }
  });

  return function multiRun(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}(); // ------------------------------------------------
// Serial and parallel runners
// ------------------------------------------------


const runSerially =
/*#__PURE__*/
function () {
  var _ref2 = _asyncToGenerator(function* (allJobs, {
    ignoreErrors
  }) {
    for (let i = 0; i < allJobs.length; i++) {
      const job = allJobs[i];
      executeJob(job, {
        ignoreErrors
      });
      yield job.promise;
    }
  });

  return function runSerially(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();

const runInParallel =
/*#__PURE__*/
function () {
  var _ref3 = _asyncToGenerator(function* (allJobs, {
    ignoreErrors,
    parallelLogs,
    parallelLimit,
    useTree
  }) {
    const maxConcurrency = parallelLimit || Math.max((0, _os.cpus)().length - 1, 1);

    while (true) {
      // No pending idle jobs? We end the loop; Node will wait for them
      // to finish
      if (getIdleJobs(allJobs).length === 0) break; // Get a job!

      const job = getNextJob(allJobs, {
        useTree
      });

      if (job) {
        if (getRunningJobs(allJobs).length >= maxConcurrency) {
          yield (0, _helpers.delay)(DELAY_MAIN_LOOP);
          continue;
        }

        executeJob(job, {
          ignoreErrors
        });
      } else {
        // We still have pending jobs, but cannot run yet (they depend on
        // others). Wait a bit...
        yield (0, _helpers.delay)(DELAY_MAIN_LOOP);
      }
    } // If parallel logs are enabled, we have to manually exit (`process.exit`).
    // We should also show the error again, since the parallel console
    // most probably swallowed it or only showed the final part.


    if (parallelLogs) {
      const pendingPromises = allJobs.filter(o => o.status !== 'done').map(job => job.promise);

      try {
        yield Promise.all(pendingPromises);
      } catch (err) {
        if (err.stderr) {
          console.error(err.message); // eslint-disable-line

          console.error(err.stderr); // eslint-disable-line

          throw new Error(err.message);
        } else {
          throw err;
        }
      }

      process.exit(0);
    }
  });

  return function runInParallel(_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}(); // ------------------------------------------------
// Helpers
// ------------------------------------------------

/* eslint-disable no-param-reassign */


const executeJob = (job, {
  ignoreErrors
}) => {
  job.promise = _executeJob(job, {
    ignoreErrors
  });
};

const _executeJob =
/*#__PURE__*/
function () {
  var _ref4 = _asyncToGenerator(function* (job, {
    ignoreErrors
  }) {
    const cmd = job.cmd,
          cwd = job.cwd,
          storySrc = job.storySrc;

    if (cmd === PLACEHOLDER_COMMAND) {
      job.status = 'done';
      return;
    }

    const promise = (0, _shell.exec)(cmd, {
      cwd,
      storySrc
    });
    job.status = 'running';

    try {
      yield promise;
      job.status = 'done';
    } catch (err) {
      job.status = 'done';
      if (!ignoreErrors) throw err;
    }
  });

  return function _executeJob(_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}();
/* eslint-enable no-param-reassign */


const getNextJob = (jobs, {
  useTree
}) => {
  for (let i = 0; i < jobs.length; i++) {
    const candidateJob = jobs[i];
    if (candidateJob.status !== 'idle') continue;
    const candidateJobPkg = candidateJob.pkg;
    let isFound = true;

    if (useTree) {
      // Check whether a previous job that hasn't finished
      // belongs to a direct dependency of the candidate (notice
      // that we have _placeholder_ jobs, so we don't need to worry
      // about packages that are indirect dependencies.
      for (let k = 0; k < i; k++) {
        const previousJob = jobs[k];
        if (previousJob.status === 'done') continue;
        const previousJobPkg = previousJob.pkg;

        if ((0, _helpers.dependsOn)(candidateJobPkg, previousJobPkg.name)) {
          isFound = false;
          break;
        }
      }
    }

    if (isFound) return candidateJob;
  }

  return null;
};

const getRunningJobs = jobs => jobs.filter(job => job.status === 'running');

const getIdleJobs = jobs => jobs.filter(job => job.status === 'idle'); // ------------------------------------------------
// Public
// ------------------------------------------------


var _default = multiRun;
exports.default = _default;