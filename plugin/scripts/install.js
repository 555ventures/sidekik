'use strict';
// A SessionStart hook: writes a small `sidekik` wrapper that runs sidekik.js from where the plugin is installed.
// It goes into the folder on the PATH that holds node, when it is writable, else into ~/.local/bin.
const fs = require('fs');
const os = require('os');
const path = require('path');

if (process.platform === 'win32') process.exit(0);

const onPath = (dir) => (process.env.PATH || '').split(path.delimiter).some((p) => p && path.resolve(p) === path.resolve(dir));
const nodeFolder = () => (process.env.PATH || '').split(path.delimiter).find((dir) => {
  try { return !!dir && fs.statSync(path.join(dir, 'node')).isFile(); } catch { return false; }
});
const writable = (dir) => {
  try { fs.accessSync(dir, fs.constants.W_OK); return true; } catch { return false; }
};

try {
  const nodeBin = nodeFolder();
  const localBin = path.join(os.homedir(), '.local', 'bin');
  const bin = nodeBin && writable(nodeBin) ? nodeBin : localBin;
  const target = path.join(bin, 'sidekik');
  const wrapper = `#!/bin/sh\nexec node "${path.join(__dirname, 'sidekik.js')}" "$@"\n`;
  fs.mkdirSync(bin, { recursive: true });
  const isLink = fs.lstatSync(target, { throwIfNoEntry: false })?.isSymbolicLink() ?? false;
  if (!isLink) {
    fs.writeFileSync(target, wrapper);
    fs.chmodSync(target, 0o755);
    if (bin === localBin && !onPath(bin)) console.log('sidekik: the sidekik command is installed in ~/.local/bin, which is not on your PATH; add it to use it from a shell.');
  }
} catch (err) {
  console.log(`sidekik: could not install the sidekik command: ${err.message}`);
}
