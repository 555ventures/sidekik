'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const script = path.join(__dirname, '..', 'plugin', 'scripts', 'install.js');
const sidekikJs = path.join(__dirname, '..', 'plugin', 'scripts', 'sidekik.js');
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'sidekik-install-'));
const install = (home, pathVar) => spawnSync(process.execPath, [script], { encoding: 'utf8', env: { ...process.env, HOME: home, PATH: pathVar } });

test('the installer writes an executable wrapper, silently, and leaves it alone the second time', () => {
  const home = tmp();
  const bin = path.join(home, '.local', 'bin');
  const pathVar = [bin, path.dirname(process.execPath), '/usr/bin', '/bin'].join(path.delimiter);
  const first = install(home, pathVar);
  assert.equal(first.status, 0);
  assert.equal(first.stdout, '');
  const file = path.join(bin, 'sidekik');
  assert.ok(fs.statSync(file).mode & 0o111);
  const content = fs.readFileSync(file, 'utf8');
  assert.equal(content, `#!/bin/sh\nexec node "${sidekikJs}" "$@"\n`);
  const second = install(home, pathVar);
  assert.equal(second.status, 0);
  assert.equal(second.stdout, '');
  assert.equal(fs.readFileSync(file, 'utf8'), content);

  if (process.platform === 'win32') return;
  const proj = tmp();
  fs.mkdirSync(path.join(proj, 'sidekik'));
  fs.writeFileSync(path.join(proj, 'sidekik', 'briefs.md'), '- 01 a: One.\n');
  fs.writeFileSync(path.join(proj, 'sidekik', 'state.json'), '{}');
  const run = spawnSync(file, ['next', '--root', proj], { encoding: 'utf8', shell: false, env: { ...process.env, PATH: pathVar } });
  assert.equal(run.status, 0);
  assert.match(run.stdout, /Stage: brief/);
});

test('the installer says once that ~/.local/bin is not on the PATH', () => {
  const r = install(tmp(), ['/usr/bin', '/bin'].join(path.delimiter));
  assert.equal(r.status, 0);
  assert.equal(r.stdout, 'sidekik: the sidekik command is installed in ~/.local/bin, which is not on your PATH; add it to use it from a shell.\n');
});
