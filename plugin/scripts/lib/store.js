'use strict';
// The one reader and writer of sidekik/state.json, and the reader of the other files in sidekik/.
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

// A file under sidekik/ as text, or null when it does not exist.
function read(root, rel) {
  const target = path.join(dir(root), rel);
  return fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : null;
}

const sha = (text) => crypto.createHash('sha256').update(text).digest('hex');

// The local calendar day of `at` as YYYY-MM-DD, the form decisions are dated in.
const day = (at = Date.now()) => new Date(at).toLocaleDateString('en-CA');

// `--root <dir>` from argv, else the current directory, and the arguments without it.
function rootFrom(argv) {
  const args = argv.slice(2);
  const i = args.indexOf('--root');
  if (i === -1) return { root: process.cwd(), args };
  const root = path.resolve(args[i + 1]);
  args.splice(i, 2);
  return { root, args };
}

module.exports = { dir, readState, writeState, read, sha, day, rootFrom };
