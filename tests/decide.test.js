'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const script = path.join(__dirname, '..', 'plugin', 'scripts', 'decide.js');
const { decisionsFor } = require(script);

// A fresh project with an empty state and the given files under sidekik/.
function project(files = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sidekik-decide-'));
  const all = { 'state.json': JSON.stringify({ check: null, stack: false, kitHash: null, decisionsHash: null, briefs: {} }), ...files };
  for (const [rel, text] of Object.entries(all)) {
    fs.mkdirSync(path.dirname(path.join(root, 'sidekik', rel)), { recursive: true });
    fs.writeFileSync(path.join(root, 'sidekik', rel), text);
  }
  const run = (...args) => {
    const r = spawnSync(process.execPath, [script, ...args, '--root', root], { encoding: 'utf8' });
    return { code: r.status, out: r.stdout };
  };
  return { root, run, file: path.join(root, 'sidekik', 'decisions.md') };
}

test('a recorded decision is dated, hashed, and a hand edit is caught', () => {
  const p = project();
  assert.equal(p.run('add', '01', 'Clients may cancel up to a day ahead.').code, 0);
  assert.equal(p.run('add', 'all', 'Prices show tax included.').code, 0);
  const today = new Date().toLocaleDateString('en-CA');
  assert.equal(fs.readFileSync(p.file, 'utf8'),
    `- ${today} 01: Clients may cancel up to a day ahead.\n- ${today} all: Prices show tax included.\n`);
  assert.equal(p.run('verify').code, 0);

  fs.appendFileSync(p.file, '- 2026-01-01 01: Something the owner never said.\n');
  const tampered = p.run('verify');
  assert.equal(tampered.code, 1);
  assert.match(tampered.out, /changed by hand/);

  assert.equal(p.run('add', '01', 'A later ruling.').code, 1, 'a new decision must not bury the hand edit');
  assert.doesNotMatch(fs.readFileSync(p.file, 'utf8'), /A later ruling/);
  p.run('seal');
  assert.equal(p.run('verify').code, 0);

  fs.rmSync(p.file);
  assert.match(p.run('verify').out, /deleted/);
  assert.equal(p.run('seal').code, 0);
  assert.equal(p.run('verify').code, 0);
});

test('no decisions file and no stored hash verifies clean', () => {
  assert.equal(project().run('verify').code, 0);
});

test('open questions come from every questions file and can be narrowed to one brief', () => {
  const p = project({
    'questions/designer.md': '- [open] 01: Is a booking ever longer than two hours?\n- [answered] 01: Weekends? → yes\n',
    'questions/engineer.md': '# notes\n- [open] 02: Do reminders go by text?\n- [open] all: Which currency?\n',
  });
  assert.deepEqual(p.run('questions').out.trim().split('\n'), [
    '- [open] 01: Is a booking ever longer than two hours?',
    '- [open] 02: Do reminders go by text?',
    '- [open] all: Which currency?',
  ]);
  assert.equal(p.run('questions', '02').out.trim(), '- [open] 02: Do reminders go by text?\n- [open] all: Which currency?');
});

test('decisionsFor lists the dated decisions of exactly one brief', () => {
  const p = project({ 'decisions.md': '- 2026-01-01 01: First.\n- 2026-01-02 all: For everyone.\n- 2026-01-03 01: Second.\n- 2026-01-03 02: Other.\n' });
  assert.deepEqual(decisionsFor(p.root, '01'), [{ date: '2026-01-01', brief: '01', text: 'First.' }, { date: '2026-01-03', brief: '01', text: 'Second.' }]);
  assert.deepEqual(decisionsFor(p.root, 'all'), [{ date: '2026-01-02', brief: 'all', text: 'For everyone.' }]);
  assert.deepEqual(decisionsFor(project().root, '01'), []);
});
