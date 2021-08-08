"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addVersionLine = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _storyboard = require("storyboard");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const addVersionLine = ({
  changelogPath,
  version,
  _date
}) => {
  let contents;

  try {
    contents = _fs.default.readFileSync(changelogPath, 'utf8');
  } catch (err) {
    _storyboard.mainStory.warn(`Could not find changelog (${_storyboard.chalk.cyan.bold(changelogPath)}). Skipped update`);

    return;
  }

  const date = _date || new Date();
  const line = `## ${version} (${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()})`;
  const finalContents = `${line}\n\n${contents}`;

  try {
    _fs.default.writeFileSync(changelogPath, finalContents, 'utf8');
  } catch (err) {
    throw new Error(`Could not update changelog (${changelogPath})`);
  }
};

exports.addVersionLine = addVersionLine;