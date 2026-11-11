'use strict';
// A SessionStart hook: writes ~/.local/bin/sidekik, a small wrapper that runs sidekik.js from where the plugin is installed.
const fs = require('fs');
const os = require('os');
const path = require('path');

if (process.platform === 'win32') process.exit(0);

try {
  const bin = path.join(os.homedir(), '.local', 'bin');
  const target = path.join(bin, 'sidekik');
  const wrapper = `#!/bin/sh\nexec node "${path.join(__dirname, 'sidekik.js')}" "$@"\n`;
  fs.mkdirSync(bin, { recursive: true });
  const current = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : null;
  if (current !== wrapper) fs.writeFileSync(target, wrapper);
  fs.chmodSync(target, 0o755);
  const onPath = (process.env.PATH || '').split(path.delimiter).some((p) => p && path.resolve(p) === path.resolve(bin));
  if (!onPath) console.log('sidekik: the sidekik command is installed in ~/.local/bin, which is not on your PATH; add it to use it from a shell.');
} catch (err) {
  console.log(`sidekik: could not install the sidekik command: ${err.message}`);
}
