'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const scripts = path.join(__dirname, '..', 'plugin', 'scripts');
const B1 = '01 booking-flow: Clients book in under a minute.';
const B2 = '02 reminders: Clients get a reminder the day before.';
const NOTE = '# Booking flow\n\n## Reuse\n- The kit form.\n\n## Done when\n- A client books in under a minute.\n';
const IN_ROOT = 'test -f sidekik/briefs.md';
const YES = '- 2026-01-01 all: The briefs stand as proposed.\n';
const YES_01 = '- 2026-01-01 01: Looks right.\n';
const proto = (status, extra = '') => ({
  'prototype/kit/kit.css': '.btn { color: black; }\n',
  'prototype/book/start.html': `<link rel="stylesheet" href="../kit/kit.css"><button class="btn">Book</button>${extra}\n`,
  'prototype/map/book.md': `| screen | brief | status | purpose | links |\n|---|---|---|---|---|\n| book/start.html | 01 | ${status} | start | |\n`,
});

// A project with two briefs; `state` is merged into a fresh state (null for none), a null file is left out.
function project(state = {}, files = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sidekik-state-'));
  const all = { 'briefs.md': `- ${B1}\n- ${B2}\n`, 'decisions.md': YES + YES_01, ...files };
  const decisionsHash = all['decisions.md'] === null ? null : require('crypto').createHash('sha256').update(all['decisions.md']).digest('hex');
  if (state) all['state.json'] = JSON.stringify({ check: null, stack: false, kitHash: null, decisionsHash, briefs: {}, ...state });
  for (const [rel, text] of Object.entries(all).filter(([, t]) => t !== null)) {
    fs.mkdirSync(path.dirname(path.join(root, 'sidekik', rel)), { recursive: true });
    fs.writeFileSync(path.join(root, 'sidekik', rel), text);
  }
  const run = (...args) => {
    const r = spawnSync(process.execPath, [path.join(scripts, 'state.js'), '--root', root, ...args], { encoding: 'utf8' });
    return { code: r.status, out: r.stdout };
  };
  const read = () => JSON.parse(fs.readFileSync(path.join(root, 'sidekik', 'state.json'), 'utf8'));
  // A refusal changes nothing but the history.
  const refused = (args, pattern) => {
    const before = read();
    const r = run(...args);
    assert.equal(r.code, 1, r.out);
    assert.match(r.out, pattern);
    assert.deepEqual({ ...read(), history: null }, { ...before, history: null });
  };
  const libs = (...names) => fs.writeFileSync(path.join(root, 'libs.txt'), names.map((n) => `${n}\n`).join(''));
  const write = (rel, text) => fs.writeFileSync(path.join(root, rel), text);
  const git = (...args) => spawnSync('git', ['-C', root, '-c', 'user.name=test', '-c', 'user.email=test@example.com', ...args], { encoding: 'utf8' }).stdout.trim();
  return { root, run, read, refused, libs, write, git };
}

// The state files here lack the later fields, as an older state file would.
test('next answers every row of the table', () => {
  const rows = [
    [{}, { 'briefs.md': null }, 'brief', 'none'],
    [{}, { 'briefs.md': '# Briefs\n' }, 'brief', 'none'],
    [{}, { 'decisions.md': null }, 'brief', 'none'],
    [{ briefed: false }, {}, 'brief', 'none'],
    [{ briefed: true }, {}, 'prototype', B1, { also: '02' }],
    [{ briefs: { '01': 'prototyped' } }, {}, 'prototype', B2],
    [{ briefs: { '01': 'prototyped', '02': 'confirmed' } }, { 'questions/pm.md': '- [open] 01: Weekly?\n- [open] 02: Text?\n' }, 'look', B1, { open: 1 }],
    [{ briefs: { '01': 'confirmed', '02': 'confirmed' } }, {}, 'stack', 'none'],
    [{ stack: true, briefs: { '01': 'done' } }, {}, 'prototype', B2],
    [{ stack: true, briefs: { '01': 'done' }, tidyBase: 'abc123' }, {}, 'tidy', 'none'],
    [{ stack: true, briefs: { '01': 'done', '02': 'done', '03': 'done', '04': 'done', '05': 'done' } },
      { 'briefs.md': ['01', '02', '03', '04', '05', '06'].map((nn) => `- ${nn} b: B.\n`).join('') }, 'tidy', 'none'],
    [{ stack: true, briefs: { '01': 'done', '02': 'done', '03': 'done', '04': 'done', '05': 'done', '07': 'noted', '09': 'built' } },
      { 'briefs.md': ['01', '02', '03', '04', '05', '07', '09'].map((nn) => `- ${nn} b: B.\n`).join('') }, 'build', '07 b: B.'],
    [{ stack: true, briefs: { '01': 'prototyped' } }, {}, 'look', B1],
    [{ stack: true, briefs: { '01': 'confirmed' } }, {}, 'note', B1],
    [{ stack: true, briefs: { '01': 'noted', '02': 'noted' }, bases: { '01': 'abc123' } }, {}, 'build', B1, { also: '02', base: 'abc123' }],
    [{ stack: true, briefs: { '01': 'built' } }, {}, 'review', B1],
    [{ stack: true, briefs: { '01': 'reviewed' } }, {}, 'close', B1],
    [{ stack: true, briefs: { '01': 'done', '02': 'done' }, tidied: 1 }, {}, 'tidy', 'none'],
    [{ stack: true, briefs: { '01': 'done', '02': 'done' }, tidied: 2 }, {}, 'ship', 'none'],
    [{ stack: true, briefs: { '01': 'done', '02': 'done' }, tidied: 2, shipped: ['01', '02'] }, {}, 'idle', 'none'],
  ];
  for (const [state, files, stage, brief, { open = 0, also = 'none', base = 'none' } = {}] of rows) {
    const read = stage === 'idle' ? 'none' : path.join(scripts, '..', 'stages', `${stage}.md`);
    const questions = brief === 'none' ? 'all briefs' : 'this brief';
    assert.equal(project(state, files).run('next').out,
      `Stage: ${stage}\nBrief: ${brief}\nRead: ${read}\nAlso at this stage: ${also}\nOpen questions for ${questions}: ${open}\nBase: ${base}\n`,
      `${stage} ${JSON.stringify(state)}`);
  }
});

test('mark briefed needs brief lines and an all decision', () => {
  project({}, { 'briefs.md': '# Briefs\n' }).refused(['mark', 'briefed'], /no brief lines/);
  const p = project({}, { 'decisions.md': YES_01 });
  p.refused(['mark', 'briefed'], /no decision recording the owner's yes on it/);
  assert.match(p.run('next').out, /^Stage: brief\n/);
  const q = project();
  const r = q.run('mark', 'briefed');
  assert.equal(r.code, 0, r.out);
  assert.equal(r.out, 'The brief list is now agreed.\n');
  assert.equal(q.read().briefed, true);
  assert.match(q.run('next').out, /^Stage: prototype\n/);
});

test('next lists the briefs whose examples changed after approval, and counts an older approval once so only a new yes reconfirms it', () => {
  const decide = (p, ...args) => spawnSync(process.execPath, [path.join(scripts, 'decide.js'), '--root', p.root, ...args]).status;
  const p = project({ briefs: { '01': 'prototyped' } }, proto('done'));
  assert.equal(p.run('mark', '01', 'confirmed').code, 0);
  assert.doesNotMatch(p.run('next').out, /Changed since approval/);
  p.write('sidekik/prototype/book/start.html', '<button class="btn">Book now</button>\n');
  assert.match(p.run('next').out, /Base: none\nChanged since approval: 01\n$/);

  // The state files below were written by older versions: no approvals, or a bare count. The day is that of the confirmed mark.
  const confirmed = [{ brief: '01', mark: 'confirmed', at: new Date().toISOString() }];
  const old = project({ briefs: { '01': 'confirmed' }, approved: { '01': 'old-hash' }, approvals: { '01': 1 }, history: confirmed });
  const completed = 'Approval records completed for 01 (older state file).\n';
  assert.ok(old.run('next').out.endsWith(`Changed since approval: 01\n${completed}`));
  assert.deepEqual(old.read().approvals['01'], { count: 1, on: new Date().toLocaleDateString('en-CA') });
  assert.equal(old.run('next').out.includes('Approval records'), false);
  old.refused(['reconfirm', '01'], /no new yes is recorded/);
  assert.equal(decide(old, 'add', '01', 'Still fine.'), 0);
  assert.equal(old.run('reconfirm', '01').code, 0);
  assert.equal(old.read().approvals['01'].count, 2);
});

test('reconfirm passes on a decision dated after the approval day even when the count did not grow', () => {
  const state = { briefs: { '01': 'confirmed' }, approved: { '01': 'old-hash' } };
  const later = { 'decisions.md': `${YES}${YES_01}- 2026-01-02 01: Fine after the change.\n` };
  project({ ...state, approvals: { '01': { count: 2, on: '2026-01-02' } } }, later).refused(['reconfirm', '01'], /no new yes is recorded/);
  const p = project({ ...state, approvals: { '01': { count: 2, on: '2026-01-01' } } }, later);
  assert.equal(p.run('reconfirm', '01').code, 0);
  assert.equal(p.read().approvals['01'].count, 2);
  const sameDay = { 'decisions.md': `${YES}${YES_01}- 2026-01-01 01: Second yes, same day.\n` };
  assert.equal(project({ ...state, approvals: { '01': { count: 1, on: '2026-01-01' } } }, sameDay).run('reconfirm', '01').code, 0);
  project({ ...state, approvals: { '01': { count: 2, on: '2026-01-01' } } }, sameDay).refused(['reconfirm', '01'], /no new yes is recorded/);
});

test('init writes a fresh state once, and --existing settles the stack', () => {
  const p = project(null);
  assert.equal(p.run('init').code, 0);
  assert.deepEqual(p.read(), { check: null, depsCommand: null, deps: null, stack: false, briefed: false, kitHash: null, decisionsHash: null, approved: {}, approvals: {},
    bases: {}, sizes: {}, tidied: 0, tidyBase: null, shipped: [], history: [], briefs: {} });
  p.run('set-check', 'npm test');
  assert.match(p.run('init', '--existing', 'make test').out, /nothing was changed/);
  assert.equal(p.read().check, 'npm test');

  const existing = project(null);
  existing.run('init', '--existing', 'make test');
  assert.deepEqual([existing.read().stack, existing.read().check, existing.read().deps], [true, 'make test', null]);

  const joined = project(null);
  assert.match(joined.run('init', '--existing', 'lint; test').out, /cannot contain ";"/);
  assert.equal(joined.run('init').code, 0, 'the refused init left no state behind');
});

test('a failing check shows only the tail of its output', () => {
  const p = project({ stack: true, check: 'seq 1 40 && exit 1', briefs: { '01': 'built' } }, { 'reviews/01.md': '- [fixed] a\n' });
  const r = p.run('mark', '01', 'reviewed');
  assert.equal(r.code, 1);
  assert.match(r.out, /did not pass\.\n11\n/);
  assert.doesNotMatch(r.out, /\n10\n/);
});

test('a mark is refused unless it follows the current one', () => {
  project({ briefs: { '01': 'prototyped' } }).refused(['mark', '01', 'built'], /only be marked confirmed/);
});

test('prototyped needs every mapped screen done, a clean prototype check and no question under a number that is not a brief', () => {
  project({}, proto('planned')).refused(['mark', '01', 'prototyped'], /not done/);
  project({}, { ...proto('done'), 'questions/pm.md': '- [open] 07: Which colour?\n' }).refused(['mark', '01', 'prototyped'], /no brief 07\. The number before the colon is the brief number/);
  project({}, proto('done', '<style>b{}</style>')).refused(['mark', '01', 'prototyped'], /style/);
  const p = project({}, proto('done'));
  assert.equal(p.run('mark', '01', 'prototyped').code, 0);
  assert.equal(p.read().briefs['01'], 'prototyped');
});

test('confirmed needs untampered decisions and no open question for the brief', () => {
  const state = { briefs: { '01': 'prototyped' } };
  project(state, { 'questions/pm.md': '- [open] 01: Weekly?\n' }).refused(['mark', '01', 'confirmed'], /open question/);
  project({ ...state, decisionsHash: null }, { 'decisions.md': '- 2026-11-09 01: Edited by hand.\n' }).refused(['mark', '01', 'confirmed'], /changed by hand/);
  const p = project(state, { 'questions/pm.md': '- [answered] 01: Weekly? → yes\n- [open] 02: Text?\n' });
  assert.equal(p.run('mark', '01', 'confirmed').code, 0);
  assert.equal(p.read().briefs['01'], 'confirmed');
});

test('confirmed needs a decision for exactly this brief dated on or after its prototyped mark', () => {
  const at = new Date(2026, 5, 15, 12).toISOString();
  const state = { briefs: { '01': 'prototyped' }, history: [{ brief: '01', mark: 'prototyped', at }] };
  const refusal = /no decision recording the owner's yes on its prototype\. After their yes, run decide\.js add 01 "<their words>" and mark again\./;
  project(state, { 'decisions.md': YES }).refused(['mark', '01', 'confirmed'], refusal);
  project(state, { 'decisions.md': `${YES}- 2026-06-14 01: Before the prototype was done.\n` }).refused(['mark', '01', 'confirmed'], refusal);
  const p = project(state, { 'decisions.md': `${YES}- 2026-06-15 01: Same day.\n` });
  assert.equal(p.run('mark', '01', 'confirmed').code, 0);
});

test('confirmed binds the approval to the mapped files, so noted and built refuse after a change until reconfirm', () => {
  const p = project({ stack: true, briefs: { '01': 'prototyped' } }, { ...proto('done'), 'build-notes/01-booking-flow.md': NOTE, 'questions/pm.md': '' });
  assert.equal(p.run('mark', '01', 'confirmed').code, 0);
  assert.match(p.read().approved['01'], /^[0-9a-f]{64}$/);
  p.write('sidekik/prototype/book/start.html', '<button class="btn">Book now</button>\n');
  p.refused(['mark', '01', 'noted'], /prototype of brief 01 changed after the owner approved it.* reconfirm 01\./);
  p.write('sidekik/questions/pm.md', '- [open] 01: Bigger button?\n');
  p.refused(['reconfirm', '01'], /open question/);
  p.write('sidekik/questions/pm.md', '');
  const before = p.read().approved['01'];
  const noYes = /changed after the owner approved it, and no new yes is recorded\. Record it first with decide\.js add 01 "<their words>", then run state\.js reconfirm 01\./;
  p.refused(['reconfirm', '01'], noYes);
  assert.equal(spawnSync(process.execPath, [path.join(scripts, 'decide.js'), '--root', p.root, 'add', '01', 'Bigger button is fine.']).status, 0);
  assert.equal(p.run('reconfirm', '01').code, 0);
  assert.notEqual(p.read().approved['01'], before);
  p.write('sidekik/prototype/book/start.html', '<button class="btn">Book today</button>\n');
  p.refused(['reconfirm', '01'], noYes);
  p.write('sidekik/prototype/book/start.html', '<button class="btn">Book now</button>\n');
  assert.equal(p.read().briefs['01'], 'confirmed');
  assert.equal(p.run('mark', '01', 'noted').code, 0);
  p.write('sidekik/prototype/book/start.html', '<button class="btn">Book</button>\n');
  p.refused(['mark', '01', 'built'], /changed after the owner approved it/);
});

test('noted needs the stack settled and a build note with a reuse section and a done-when item', () => {
  const state = { stack: true, briefs: { '01': 'confirmed' } };
  project({ ...state, stack: false }, { 'build-notes/01-booking-flow.md': NOTE }).refused(['mark', '01', 'noted'], /stack is not settled/);
  const p = project(state, { 'build-notes/01-booking-flow.md': NOTE.replace('## Reuse', '## Notes') });
  p.run('reconfirm', '01');
  p.refused(['mark', '01', 'noted'], /Reuse/);
  p.write('sidekik/build-notes/01-booking-flow.md', '# Booking flow\n\n## Reuse\n- The kit form.\n\n## Done when\n');
  p.refused(['mark', '01', 'noted'], /Done when/);
  p.write('sidekik/build-notes/01-booking-flow.md', NOTE);
  assert.equal(p.run('mark', '01', 'noted').code, 0);
  assert.equal(p.read().briefs['01'], 'noted');
});

test('noted records the git commit as the base, and built refuses an empty change, measures the commits since it, moves the base of a brief still waiting, and accepts that brief as measured with it', () => {
  const p = project({ check: IN_ROOT, stack: true, briefs: { '01': 'confirmed' } }, { 'build-notes/01-booking-flow.md': NOTE, 'decisions.md': `${YES}${YES_01}- 2026-01-01 02: Looks right.\n` });
  p.run('reconfirm', '01');
  for (const [rel, text] of Object.entries({ 'old.js': 'old\nlines\n', 'tests/old.js': 'x\n', '.gitignore': 'ignored/\n' })) {
    fs.mkdirSync(path.dirname(path.join(p.root, rel)), { recursive: true });
    p.write(rel, text);
  }
  p.git('init', '-q');
  p.git('add', '.');
  p.git('commit', '-qm', 'start');
  assert.equal(p.run('mark', '01', 'noted').code, 0);
  assert.equal(p.read().bases['01'], p.git('rev-parse', 'HEAD'));
  p.refused(['mark', '01', 'built'], /Nothing has been committed/);
  p.write('old.js', 'new\n');
  fs.rmSync(path.join(p.root, 'tests', 'old.js'));
  const files = { 'src/book.js': 'a\nb\nc', 'tests/book.js': 'a\n', 'src/book.spec.js': 'a\n', 'spec/book.rb': 'a\n', 'pkg/book_test.go': 'a\n',
    'app/test_book.py': 'a\n', 'src/latest_book.py': 'a\n', 'package-lock.json': 'a\n', 'sidekik/notes.md': 'a\n', 'ignored/big.js': 'a\n' };
  for (const [rel, text] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(p.root, rel)), { recursive: true });
    p.write(rel, text);
  }
  p.refused(['mark', '01', 'built'], /Nothing has been committed/);
  const waiting = p.read();
  fs.writeFileSync(path.join(p.root, 'sidekik', 'state.json'), JSON.stringify({ ...waiting, briefs: { ...waiting.briefs, '02': 'noted' }, bases: { ...waiting.bases, '02': waiting.bases['01'] },
    history: [...waiting.history, { brief: '02', mark: 'noted', at: new Date().toISOString() }] }));
  p.git('add', '-A');
  p.git('commit', '-qm', '01 booking-flow');
  assert.equal(p.run('mark', '01', 'built').out, 'Brief 01 is now marked built. It added 5 lines of code and 5 lines of tests, and removed 3 lines, 1 of them tests.\n');
  assert.deepEqual(p.read().sizes, { '01': { code: 5, tests: 5, removed: 3, testsRemoved: 1 } });
  assert.equal(p.read().bases['02'], p.git('rev-parse', 'HEAD'));
  // 02 was committed before 01 was marked, so it has nothing of its own left to measure.
  p.run('reconfirm', '02');
  assert.equal(p.run('mark', '02', 'built').code, 0);
});

test('built needs every library the library command lists agreed and a check command that passes when run from the project root', () => {
  const p = project({ stack: true, briefs: { '01': 'noted' } });
  p.run('reconfirm', '01');
  p.refused(['set-deps', 'exit 1'], /did not run/);
  p.libs('react');
  assert.equal(p.run('set-deps', 'cat libs.txt').code, 0);
  assert.deepEqual([p.read().depsCommand, p.read().deps], ['cat libs.txt', ['react']]);
  p.libs('react', 'dayjs');
  p.refused(['mark', '01', 'built'], /library dayjs, .* run state\.js allow dayjs\./);
  assert.equal(p.run('allow', 'dayjs').code, 0);
  assert.deepEqual(p.read().deps, ['react', 'dayjs']);
  p.refused(['mark', '01', 'built'], /No check command/);
  p.refused(['set-check', 'npm test; npm run lint'], /cannot contain ";"\. Join the steps with &&/);
  p.run('set-check', 'exit 1');
  p.refused(['mark', '01', 'built'], /did not pass/);
  p.run('set-check', IN_ROOT);
  assert.equal(p.run('mark', '01', 'built').code, 0);
  assert.equal(p.read().briefs['01'], 'built');
});

test('reviewed needs every bug in the review resolved', () => {
  const state = { check: IN_ROOT, stack: true, briefs: { '01': 'built' } };
  project(state, { 'reviews/01.md': '- [fixed] a\n- [bug] Double booking.\n' }).refused(['mark', '01', 'reviewed'], /bugs/);
  const p = project(state, { 'reviews/01.md': '- [fixed] Double booking.\n- [owner] Copy tone.\n' });
  assert.equal(p.run('mark', '01', 'reviewed').code, 0);
  assert.equal(p.read().briefs['01'], 'reviewed');
});

test('done needs a lesson with a cause for the brief, and every attempt joins the history', () => {
  const p = project({ stack: true, briefs: { '01': 'reviewed' } }, { 'lessons.md': '- 02: [late] Another brief.\n- 01: Prototype the edge cases first.\n' });
  p.refused(['mark', '01', 'done'], /no lesson for brief 01 yet, written as "- 01: \[cause\]/);
  p.write('sidekik/lessons.md', '- 01: [edge-cases] Prototype the edge cases first.\n');
  assert.equal(p.run('mark', '01', 'done').code, 0);
  assert.equal(p.read().briefs['01'], 'done');
  const history = p.read().history;
  assert.deepEqual(history.map(({ brief, mark, refused }) => [brief, mark, refused]), [['01', 'done', true], ['01', 'done', undefined]]);
  assert.equal(new Date(history[1].at).toISOString(), history[1].at);
});

test('the stack mark needs confirmed briefs, a complete stack file, a data design, a passing check and a committed skeleton', () => {
  const state = { check: IN_ROOT, briefs: { '01': 'confirmed', '02': 'confirmed' } };
  const stack = { 'stack.md': '## Picks\n- Node\n\n## Your steps\n- None.\n', 'model.md': '# Data\n' };
  project({ ...state, briefs: { '01': 'confirmed' } }, stack).refused(['mark', 'stack'], /Every brief/);
  const at = new Date(2026, 5, 15, 12).toISOString();
  const history = [{ brief: '01', mark: 'confirmed', at }, { brief: '02', mark: 'confirmed', at }];
  const refusal = /stack has no decision recording the owner's picks\. After their yes, run decide\.js add all "<their picks>" and mark again\./;
  project({ ...state, history }, { ...stack, 'decisions.md': YES_01 }).refused(['mark', 'stack'], refusal);
  project({ ...state, history }, { ...stack, 'decisions.md': `${YES}${YES_01}` }).refused(['mark', 'stack'], refusal);
  project(state, { ...stack, 'stack.md': '## Picks\n- Node\n' }).refused(['mark', 'stack'], /Your steps/);
  project(state, { ...stack, 'model.md': null }).refused(['mark', 'stack'], /model\.md/);
  project({ ...state, check: 'exit 1' }, stack).refused(['mark', 'stack'], /did not pass/);
  const p = project(state, stack);
  p.refused(['mark', 'stack'], /nothing is committed yet/);
  p.git('init', '-q');
  p.write('app.js', 'x\n');
  p.git('add', 'app.js');
  p.git('commit', '-qm', 'skeleton');
  p.write('new.js', 'x\n');
  p.refused(['mark', 'stack'], /new\.js is not committed/);
  p.git('add', 'new.js');
  p.git('commit', '-qm', 'more');
  assert.equal(p.run('mark', 'stack').code, 0);
  assert.equal(p.read().stack, true);
});

test('the shipped mark needs a done brief not yet shipped and a passing check, and joins the history with no brief', () => {
  const state = { check: IN_ROOT, stack: true, tidied: 1, briefs: { '01': 'done', '02': 'built' } };
  project({ ...state, shipped: ['01'] }).refused(['mark', 'shipped'], /no finished brief waiting/);
  project({ ...state, check: 'exit 1' }).refused(['mark', 'shipped'], /did not pass/);
  const at = new Date(2026, 5, 15, 12).toISOString();
  const refusal = /no decision recording the owner's yes to go live\. After their yes, run decide\.js add all "<their words>" and mark again\./;
  project({ ...state, history: [{ brief: '01', mark: 'done', at }] }, { 'decisions.md': YES_01 }).refused(['mark', 'shipped'], refusal);
  project({ ...state, history: [{ brief: '01', mark: 'done', at }] }, { 'decisions.md': `${YES}${YES_01}` }).refused(['mark', 'shipped'], refusal);
  assert.equal(project({ ...state, history: [{ brief: '01', mark: 'done', at }] }, { 'decisions.md': '- 2026-06-15 all: Go live.\n' }).run('mark', 'shipped').code, 0);
  const p = project(state);
  assert.equal(p.run('mark', 'shipped').code, 0);
  assert.deepEqual(p.read().shipped, ['01']);
  assert.deepEqual(p.read().history.map(({ brief, mark }) => ({ brief, mark })), [{ brief: null, mark: 'shipped' }]);
});

test('the tidy stage: tidied needs tidying first, a passing check and a guard for a cause seen three times; shipped needs it', () => {
  const lessons = '- 01: [built-twice] a\n- fix: [built-twice] b\n- fix: [built-twice] c\n- 02: [none] d\n- fix: [none] e\n- fix: [none] f\n';
  const p = project({ check: IN_ROOT, stack: true, briefs: { '01': 'done', '02': 'done' } }, { 'lessons.md': lessons });
  p.write('a.js', 'a\nb\n');
  p.git('init', '-q');
  p.git('add', '.');
  p.git('commit', '-qm', 'start');
  p.refused(['mark', 'shipped'], /not been tidied/);
  p.refused(['mark', 'tidied'], /mark tidying first/);
  assert.equal(p.run('mark', 'tidying').code, 0);
  assert.equal(p.read().tidyBase, p.git('rev-parse', 'HEAD'));
  p.run('set-check', 'exit 1');
  p.refused(['mark', 'tidied'], /did not pass/);
  p.run('set-check', IN_ROOT);
  p.write('b.js', 'b\n');
  p.git('add', '-A');
  p.write('a.js', 'a\n');
  p.git('add', '-A');
  p.git('commit', '-qm', 'tidy');
  p.refused(['mark', 'tidied'], /\[built-twice\] appears 3 times/);
  p.write('sidekik/lessons.md', `${lessons}- guard: [built-twice] state.js refuses a second build.\n`);
  assert.equal(p.run('mark', 'tidied').out, 'The tidy is finished. It added 1 lines and removed 1.\n');
  assert.deepEqual([p.read().tidied, p.read().tidyBase], [2, null]);
  assert.equal(p.run('mark', 'shipped').code, 0);
});
