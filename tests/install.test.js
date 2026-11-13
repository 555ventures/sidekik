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
// A PATH with no folder that holds a `node` file, so the wrapper goes to <home>/.local/bin whatever the machine looks like.
const hasNode = (d) => fs.existsSync(path.join(d, 'node'));
const noNode = (...dirs) => [...dirs, '/usr/bin', '/bin'].filter((d) => !hasNode(d)).join(path.delimiter);
const install = (home, pathVar) => spawnSync(process.execPath, [script], { encoding: 'utf8', env: { ...process.env, HOME: home, PATH: pathVar } });

test('the installer writes an executable wrapper, silently', () => {
  const home = tmp();
  const bin = path.join(home, '.local', 'bin');
  const pathVar = noNode(bin);
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

  const proj = tmp();
  fs.mkdirSync(path.join(proj, 'sidekik'));
  fs.writeFileSync(path.join(proj, 'sidekik', 'briefs.md'), '- 01 a: One.\n');
  fs.writeFileSync(path.join(proj, 'sidekik', 'state.json'), '{}');
  const run = spawnSync(file, ['next', '--root', proj], { encoding: 'utf8', shell: false, env: { ...process.env, PATH: [pathVar, path.dirname(process.execPath)].join(path.delimiter) } });
  assert.equal(run.status, 0);
  assert.match(run.stdout, /Stage: brief/);
});

test('the installer says when ~/.local/bin is not on the PATH', () => {
  const r = install(tmp(), noNode());
  assert.equal(r.status, 0);
  assert.equal(r.stdout, 'sidekik: the sidekik command is installed in ~/.local/bin, which is not on your PATH; add it to use it from a shell.\n');
});

test('the installer leaves an npm-style symlink alone, silently', () => {
  const home = tmp();
  const bin = path.join(home, '.local', 'bin');
  fs.mkdirSync(bin, { recursive: true });
  const real = path.join(home, 'real-sidekik');
  fs.writeFileSync(real, 'x');
  const file = path.join(bin, 'sidekik');
  fs.symlinkSync(real, file);
  const r = install(home, noNode(bin));
  assert.equal(r.status, 0);
  assert.equal(r.stdout, '');
  assert.ok(fs.lstatSync(file).isSymbolicLink());
  assert.equal(fs.readFileSync(real, 'utf8'), 'x');
});

test('the installer writes into the first folder on the PATH that holds a node file', () => {
  const home = tmp();
  const bin = tmp();
  fs.writeFileSync(path.join(bin, 'node'), `#!/bin/sh\nexec "${process.execPath}" "$@"\n`);
  fs.chmodSync(path.join(bin, 'node'), 0o755);
  const r = install(home, [bin, noNode()].join(path.delimiter));
  assert.equal(r.status, 0);
  assert.equal(r.stdout, '');
  assert.ok(fs.existsSync(path.join(bin, 'sidekik')));
  assert.ok(!fs.existsSync(path.join(home, '.local', 'bin', 'sidekik')));
});
