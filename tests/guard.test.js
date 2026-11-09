'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { spawnSync } = require('child_process');

const script = path.join(__dirname, '..', 'plugin', 'scripts', 'guard.js');
const guard = (input) => spawnSync(process.execPath, [script], { input, encoding: 'utf8' });

test('the guard refuses a write to a file only the scripts may write', () => {
  const r = guard(JSON.stringify({ tool_input: { file_path: '/work/app/sidekik/decisions.md' } }));
  assert.equal(r.status, 2);
  assert.match(r.stderr, /^sidekik\/decisions\.md is written only by the plugin's scripts \(state\.js, decide\.js\)\. Run the script instead of editing the file\.\n$/);
});

test('the guard lets other files through, and never blocks on input it cannot read', () => {
  assert.equal(guard(JSON.stringify({ tool_input: { file_path: '/work/app/sidekik/briefs.md' } })).status, 0);
  assert.equal(guard('').status, 0);
  assert.equal(guard('not json').status, 0);
});
