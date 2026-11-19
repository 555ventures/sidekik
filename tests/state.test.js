'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const scripts = path.join(__dirname, '..', 'plugin', 'scripts');
const { openQuestions } = require(path.join(scripts, 'state.js'));
const version = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'plugin', '.claude-plugin', 'plugin.json'), 'utf8')).version;
const B1 = '01 booking-flow: Clients book in under a minute.';
const B2 = '02 reminders: Clients get a reminder the day before.';
const NOTE = '# Booking flow\n\n## Reuse\n- The kit form.\n\n## Done when\n- A client books in under a minute.\n';
const IN_ROOT = 'test -f sidekik/briefs.md';
const proto = (extra = '', row = '| book/start.html | 01 | start | |') => ({
  'prototype/kit/kit.css': '.btn { color: black; }\n',
  'prototype/book/start.html': `<link rel="stylesheet" href="../kit/kit.css"><button class="btn">Book</button>${extra}\n`,
  'prototype/map/book.md': `| screen | brief | purpose | links |\n|---|---|---|---|\n${row}\n`,
});

// A project with two briefs; `state` is merged into a fresh state (null for none), a null file is left out.
function project(state = {}, files = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sidekik-state-'));
  const all = { 'briefs.md': `- ${B1}\n- ${B2}\n`, ...files };
  if (state) all['state.json'] = JSON.stringify({ check: null, stack: false, briefs: {}, ...state });
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
  const write = (rel, text) => fs.writeFileSync(path.join(root, rel), text);
  const git = (...args) => spawnSync('git', ['-C', root, '-c', 'user.name=test', '-c', 'user.email=test@example.com', ...args], { encoding: 'utf8' }).stdout.trim();
  return { root, run, read, refused, write, git };
}

// The state files here lack the later fields, as an older state file would.
test('next answers every row of the table', () => {
  const rows = [
    [{}, { 'briefs.md': null }, 'brief', 'none'],
    [{}, { 'briefs.md': '# Briefs\n' }, 'brief', 'none'],
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
      { 'briefs.md': ['01', '02', '03', '04', '05', '07', '09'].map((nn) => `- ${nn} b: B.\n`).join('') }, 'review', '09 b: B.'],
    [{ stack: true, briefs: { '01': 'prototyped' } }, {}, 'look', B1],
    [{ stack: true, briefs: { '01': 'confirmed' } }, {}, 'note', B1],
    [{ stack: true, briefs: { '02': 'confirmed' } }, {}, 'note', B2],
    [{ stack: true, briefs: { '01': 'prototyped', '02': 'built' } }, {}, 'review', B2],
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
      `Stage: ${stage}\nBrief: ${brief}\nRead: ${read} (sidekik ${version})\nAlso at this stage: ${also}\nOpen questions for ${questions}: ${open}\nBase: ${base}\n`,
      `${stage} ${JSON.stringify(state)}`);
  }
});

test('mark briefed needs brief lines', () => {
  const p = project({}, { 'briefs.md': '# Briefs\n' });
  p.refused(['mark', 'briefed'], /no brief lines/);
  assert.match(p.run('next').out, /^Stage: brief\n/);
  const q = project();
  const r = q.run('mark', 'briefed');
  assert.equal(r.code, 0, r.out);
  assert.equal(r.out, 'The brief list is now agreed.\n');
  assert.equal(q.read().briefed, true);
  assert.match(q.run('next').out, /^Stage: prototype\n/);
});

test('init writes a fresh state once, and --existing settles the stack', () => {
  const p = project(null);
  assert.equal(p.run('init').code, 0);
  assert.deepEqual(p.read(), { check: null, stack: false, briefed: false,
    bases: {}, sizes: {}, tidied: 0, tidyBase: null, shipped: [], history: [], briefs: {} });
  p.run('set-check', 'npm test');
  assert.match(p.run('init', '--existing', 'make test').out, /nothing was changed/);
  assert.equal(p.read().check, 'npm test');

  const existing = project(null);
  existing.run('init', '--existing', 'make test');
  assert.deepEqual([existing.read().stack, existing.read().check], [true, 'make test']);

  const joined = project(null);
  assert.match(joined.run('init', '--existing', 'lint; test').out, /cannot contain ";"/);
  assert.equal(joined.run('init').out, 'Sidekik is set up in this project.\n', 'the refused init left no state behind');
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

test('prototyped needs every mapped file to exist and a clean prototype check', () => {
  project({}, proto('', '| book/start.html | 01 | start | |\n| book/pay.html | 01 | pay | |')).refused(['mark', '01', 'prototyped'], /Brief 01 names book\/pay\.html in the prototype map, but that file does not exist\./);
  project({}, proto('<style>b{}</style>')).refused(['mark', '01', 'prototyped'], /style/);
  const p = project({}, proto());
  assert.equal(p.run('mark', '01', 'prototyped').code, 0);
  assert.equal(p.read().briefs['01'], 'prototyped');
  // An older map still has a status in the third cell; it is ignored.
  const old = project({}, proto('', '| book/start.html | 01 | planned | start | |'));
  assert.equal(old.run('mark', '01', 'prototyped').code, 0);
});

test('open questions come from every questions file and can be narrowed to one brief', () => {
  const p = project({}, {
    'questions/designer.md': '- [open] 01: Is a booking ever longer than two hours?\n- [answered] 01: Weekends? → yes\n',
    'questions/engineer.md': '# notes\n- [open] 02: Do reminders go by text?\n- [open] all: Which currency?\n',
  });
  assert.deepEqual(openQuestions(p.root), [
    '- [open] 01: Is a booking ever longer than two hours?',
    '- [open] 02: Do reminders go by text?',
    '- [open] all: Which currency?',
  ]);
  assert.deepEqual(openQuestions(p.root, '02'), ['- [open] 02: Do reminders go by text?', '- [open] all: Which currency?']);
});

test('fields of an older state file that nothing reads are kept as they are', () => {
  // An older state file still carries the approval fields; they are kept as they are and read by nothing.
  const old = { approved: { '01': 'old-hash' }, approvals: { '01': { count: 1 } } };
  const p = project({ stack: true, briefs: { '01': 'prototyped', '02': 'prototyped' }, ...old },
    { ...proto('done'), 'build-notes/01-booking-flow.md': NOTE });
  assert.equal(p.run('mark', '01', 'confirmed').code, 0);
  assert.equal(p.run('mark', '02', 'confirmed').code, 0);
  p.write('sidekik/prototype/book/start.html', '<button class="btn">Book now</button>\n');
  assert.doesNotMatch(p.run('next').out, /Changed since approval/);
  assert.equal(p.run('mark', '01', 'noted').code, 0);
  assert.deepEqual([p.read().approved, p.read().approvals], [old.approved, old.approvals]);
  const r = p.run('reconfirm', '01');
  assert.equal(r.code, 1);
  assert.match(r.out, /^Use one of: /);
  assert.doesNotMatch(r.out, /reconfirm/);
});

test('noted needs the stack settled and a build note with a reuse section and a done-when item', () => {
  const state = { stack: true, briefs: { '01': 'confirmed' } };
  project({ ...state, stack: false }, { 'build-notes/01-booking-flow.md': NOTE }).refused(['mark', '01', 'noted'], /stack is not settled/);
  const p = project(state, { 'build-notes/01-booking-flow.md': NOTE.replace('## Reuse', '## Notes') });
  p.refused(['mark', '01', 'noted'], /Reuse/);
  p.write('sidekik/build-notes/01-booking-flow.md', '# Booking flow\n\n## Reuse\n- The kit form.\n\n## Done when\n');
  p.refused(['mark', '01', 'noted'], /Done when/);
  p.write('sidekik/build-notes/01-booking-flow.md', NOTE);
  assert.equal(p.run('mark', '01', 'noted').code, 0);
  assert.equal(p.read().briefs['01'], 'noted');
});

test('noted records the git commit as the base, and built refuses an empty change, measures the commits since it, moves the base of a brief still waiting, and accepts that brief as measured with it', () => {
  const p = project({ check: IN_ROOT, stack: true, briefs: { '01': 'confirmed' } }, { 'build-notes/01-booking-flow.md': NOTE });
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
  assert.equal(p.run('mark', '02', 'built').code, 0);
});

test('built needs a check command that passes when run from the project root', () => {
  const p = project({ stack: true, briefs: { '01': 'noted' } });
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

test('reviewed runs the check only when the review fixed or cut something', () => {
  const state = { check: 'false', stack: true, briefs: { '01': 'built' } };
  assert.equal(project(state, { 'reviews/01.md': 'No proven bugs.\n' }).run('mark', '01', 'reviewed').code, 0);
  project(state, { 'reviews/01.md': '- [fixed] a bug\n' }).refused(['mark', '01', 'reviewed'], /did not pass/);
  project(state, { 'reviews/01.md': '- [cut] dead code\n' }).refused(['mark', '01', 'reviewed'], /did not pass/);
});

test('done needs only the reviewed mark, no lesson line, and every attempt joins the history', () => {
  const p = project({ stack: true, briefs: { '01': 'built' } }, { 'reviews/01.md': 'No proven bugs.\n' });
  p.refused(['mark', '01', 'done'], /only be marked reviewed next, not done/);
  assert.equal(p.run('mark', '01', 'reviewed').code, 0);
  assert.equal(p.run('mark', '01', 'done').code, 0);
  assert.equal(p.read().briefs['01'], 'done');
  const history = p.read().history.filter((h) => h.mark === 'done');
  assert.deepEqual(history.map(({ brief, mark, refused }) => [brief, mark, refused]), [['01', 'done', true], ['01', 'done', undefined]]);
  assert.equal(new Date(history[1].at).toISOString(), history[1].at);
});

test('the stack mark needs confirmed briefs, a complete stack file, a data design, a passing check and a committed skeleton', () => {
  const state = { check: IN_ROOT, briefs: { '01': 'confirmed', '02': 'confirmed' } };
  const stack = { 'stack.md': '## Picks\n- Node\n\n## Your steps\n- None.\n', 'model.md': '# Data\n' };
  project({ ...state, briefs: { '01': 'confirmed' } }, stack).refused(['mark', 'stack'], /Every brief/);
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

test('reopen stack unsettles a settled stack, and it can be marked again', () => {
  project({ stack: false }).refused(['reopen', 'stack'], /nothing to reopen/);
  const state = { stack: true, check: IN_ROOT, briefs: { '01': 'confirmed', '02': 'confirmed' } };
  const stack = { 'stack.md': '## Picks\n- Node\n\n## Your steps\n- None.\n', 'model.md': '# Data\n' };
  const p = project(state, stack);
  p.git('init', '-q');
  p.write('app.js', 'x\n');
  p.git('add', 'app.js');
  p.git('commit', '-qm', 'skeleton');
  assert.equal(p.run('reopen', 'stack').code, 0);
  assert.equal(p.read().stack, false);
  const [entry] = p.read().history;
  assert.deepEqual({ ...entry, at: null }, { brief: null, mark: 'stack', reopen: true, at: null });
  assert.match(p.run('next').out, /stack/);
  assert.equal(p.run('mark', 'stack').code, 0);
  assert.equal(p.read().stack, true);
});

test('the shipped mark records named done briefs, or every done brief not yet shipped, and joins the history with no brief', () => {
  const state = { stack: true, briefs: { '01': 'done', '02': 'done', '03': 'built' } };
  project({ ...state, shipped: ['01', '02'] }).refused(['mark', 'shipped'], /no finished brief waiting/);
  project(state).refused(['mark', 'shipped', '03'], /Brief 03 is not finished/);
  const p = project({ ...state, tidied: 0 });
  const first = p.run('mark', 'shipped', '01');
  assert.equal(first.code, 0);
  assert.match(first.out, /now live: 01\./);
  assert.deepEqual(p.read().shipped, ['01']);
  assert.equal(p.run('mark', 'shipped').code, 0);
  assert.deepEqual(p.read().shipped, ['01', '02']);
  assert.deepEqual(p.read().history.slice(-2).map(({ brief, mark }) => ({ brief, mark })), [{ brief: null, mark: 'shipped' }, { brief: null, mark: 'shipped' }]);
});

test('the tidy stage: tidied needs tidying first and a passing check, and lessons are not counted', () => {
  // An old lessons file with one cause three times and no guard line holds nothing.
  const lessons = '- 01: [built-twice] a\n- fix: [built-twice] b\n- fix: [built-twice] c\n';
  const p = project({ check: IN_ROOT, stack: true, briefs: { '01': 'done', '02': 'done' } }, { 'lessons.md': lessons });
  p.write('a.js', 'a\nb\n');
  p.git('init', '-q');
  p.git('add', '.');
  p.git('commit', '-qm', 'start');
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
  assert.equal(p.run('mark', 'tidied').out, 'The tidy is finished. It added 1 lines and removed 1.\n');
  assert.deepEqual([p.read().tidied, p.read().tidyBase], [2, null]);
});
