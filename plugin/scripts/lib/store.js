'use strict';
// The one reader and writer of sidekik/state.json.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dir = (root) => path.join(root, 'sidekik');
const file = (root) => path.join(dir(root), 'state.json');

function readState(root) {
  try {
    return JSON.parse(fs.readFileSync(file(root), 'utf8'));
  } catch (e) {
    if (e.code === 'ENOENT') return null;
    throw e;
  }
}

function writeState(root, state) {
  fs.mkdirSync(dir(root), { recursive: true });
  const tmp = file(root) + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2) + '\n');
  fs.renameSync(tmp, file(root));
}

const sha = (text) => crypto.createHash('sha256').update(text).digest('hex');

// `--root <dir>` from argv, else the current directory.
function rootFrom(argv) {
  const i = argv.indexOf('--root');
  return path.resolve(i === -1 ? process.cwd() : argv[i + 1]);
}

module.exports = { dir, readState, writeState, sha, rootFrom };
