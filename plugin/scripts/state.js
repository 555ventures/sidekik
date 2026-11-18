'use strict';
// The commands that read and move a project through its marks and stages.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { dir, readState, writeState, read, rootFrom, NO_SETUP } = require('./lib/store');
const { checkPrototype, screensFor } = require('./proto-check');

const version = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '.claude-plugin', 'plugin.json'), 'utf8')).version;

const MARKS = ['prototyped', 'confirmed', 'noted', 'built', 'reviewed', 'done'];
const STAGES = ['prototype', 'look', 'note', 'build', 'review', 'close'];
// An older state file may lack the later fields, each counted as its empty value, or carry fields
// nothing reads any more, which are kept as they are.
const fresh = () => ({ check: null, stack: false, briefed: false,
  bases: {}, sizes: {}, tidied: 0, tidyBase: null, shipped: [], history: [], briefs: {} });

const has = (text, re) => text !== null && re.test(text);
const git = (root, ...args) => {
  const run = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  return run.status === 0 ? run.stdout.trim() : null;
};

// What is not committed outside sidekik/, in words; '' when everything is.
function uncommitted(root) {
  if (git(root, 'rev-parse', 'HEAD') === null) return 'nothing is committed yet';
  const first = (git(root, 'status', '--porcelain', '--', '.', ':!sidekik') ?? '').split('\n')[0];
  return first && `${first.replace(/^\s*\S+\s+/, '')} is not committed`;
}

const TEST_PATH =/(^|\/)(tests?|__tests__|spec|e2e)\/|(\.test\.|\.spec\.|_test\.)[^/]*$|(^|\/)test_[^/]*$/;
const LOCK_FILE = /(-lock\.\w+|\.lockb?)$/;

function sizeSince(root, base) {
  // Committed work only, so a brief landed in its own commit is measured on its own.
  const out = base ? git(root, 'diff', '--numstat', base, 'HEAD') : null;
  if (out === null) return null;
  const size = { code: 0, tests: 0, removed: 0, testsRemoved: 0 };
  for (const [added, removed, file] of out.split('\n').filter(Boolean).map((l) => l.split('\t'))) {
    if (file.startsWith('sidekik/') || LOCK_FILE.test(file)) continue;
    const isTest = TEST_PATH.test(file);
    size[isTest ? 'tests' : 'code'] += Number(added) || 0; // a binary file shows "-"
    size.removed += Number(removed) || 0;
    if (isTest) size.testsRemoved += Number(removed) || 0;
  }
  return size;
}

// Every open question line under sidekik/questions/, with its brief and text.
function questionLines(root) {
  const qdir = path.join(dir(root), 'questions');
  if (!fs.existsSync(qdir)) return [];
  return fs.readdirSync(qdir).filter((f) => f.endsWith('.md')).sort().flatMap((f) => (
    fs.readFileSync(path.join(qdir, f), 'utf8').split('\n').flatMap((line) => {
      const m = /^- \[open\] (\d\d|all): ?(.*)/.exec(line);
      return m ? [{ line, brief: m[1], text: m[2] }] : [];
    })));
}

// The open question lines, narrowed to one brief and `all` when a brief is given.
function openQuestions(root, brief) {
  return questionLines(root)
    .filter((q) => brief === undefined || q.brief === brief || q.brief === 'all')
    .map(({ line }) => line);
}

function readBriefs(root) {
  return (read(root, 'briefs.md') ?? '').split('\n')
    .map((line) => /^- (\d\d) ([a-z0-9-]+): (.+)$/.exec(line))
    .filter(Boolean)
    .map(([, nn, slug, sentence]) => ({ nn, slug, sentence }))
    .sort((a, b) => a.nn.localeCompare(b.nn));
}

// -1 for a brief with no mark, so rank + 1 indexes STAGES.
const rank = (state, brief) => MARKS.indexOf(state.briefs[brief.nn]);
const doneBriefs = (root, state) => readBriefs(root).filter((b) => state.briefs[b.nn] === 'done').map((b) => b.nn);

const SEMICOLON = 'The check command cannot contain ";". Join the steps with && so that a failing step fails the whole check.';

function checkProblem(root, state) {
  if (!state.check) return 'No check command is set yet.';
  const run = spawnSync(state.check, { shell: true, cwd: root, encoding: 'utf8' });
  if (run.status === 0) return null;
  // Only the tail reaches the session; the full output is the check's own job to keep.
  const tail = `${run.stdout ?? ''}${run.stderr ?? ''}`.trimEnd().split('\n').slice(-30).join('\n');
  return `The check command "${state.check}" did not pass.${tail ? `\n${tail}` : ''}`;
}

function doneWhenItems(note) {
  const lines = note.split('\n');
  const start = lines.findIndex((l) => l.trim() === '## Done when');
  if (start === -1) return 0;
  const after = lines.slice(start + 1);
  const end = after.findIndex((l) => l.startsWith('## '));
  return (end === -1 ? after : after.slice(0, end)).filter((l) => l.startsWith('- ')).length;
}

const REQUIRES = {
  prototyped(root, state, b) {
    const stray = openQuestions(root).map((q) => /^- \[open\] (\d\d):/.exec(q)?.[1])
      .find((nn) => nn && !readBriefs(root).some((brief) => brief.nn === nn));
    if (stray) return `An open question is filed under ${stray}, but there is no brief ${stray}. The number before the colon is the brief number.`;
    const examples = screensFor(root, b.nn);
    if (!examples.length) return `Brief ${b.nn} has no examples in the prototype map yet.`;
    if (examples.some((e) => e.status !== 'done')) return `Brief ${b.nn} still has examples in the prototype map that are not done.`;
    const { ok, problems } = checkPrototype(root);
    return ok ? null : `The prototype check found ${problems.length} problem(s), the first being: ${problems[0]}`;
  },
  confirmed(root, state, b) {
    const open = openQuestions(root, b.nn).length;
    return open ? `Brief ${b.nn} still has ${open} open question(s) waiting for the owner.` : null;
  },
  noted(root, state, b) {
    if (!state.stack) return 'The stack is not settled yet.';
    const rel = `build-notes/${b.nn}-${b.slug}.md`;
    const note = read(root, rel);
    if (note === null) return `The build note sidekik/${rel} does not exist yet.`;
    if (!has(note, /^## Reuse\s*$/m)) return `The build note sidekik/${rel} needs a "## Reuse" section.`;
    return doneWhenItems(note) ? null : `The build note sidekik/${rel} needs a "## Done when" section with at least one item.`;
  },
  built(root, state, b) {
    const size = sizeSince(root, state.bases[b.nn]);
    // A brief committed before another of its wave was marked built was measured there, so it may be empty here.
    const noted = state.history.findLast((h) => h.brief === b.nn && h.mark === 'noted' && !h.refused)?.at;
    const measuredWithAnother = state.history.some((h) => h.mark === 'built' && !h.refused && h.at > noted);
    if (size && !(size.code + size.tests + size.removed) && !measuredWithAnother) {
      return `Nothing has been committed since brief ${b.nn}'s starting point, so there is nothing built yet. Commit the brief, then mark it built before you commit the next one.`;
    }
    return checkProblem(root, state);
  },
  reviewed(root, state, b) {
    const review = read(root, `reviews/${b.nn}.md`);
    if (review === null) return `The review file sidekik/reviews/${b.nn}.md does not exist yet.`;
    if (has(review, /^- \[bug\]/m)) return `The review of brief ${b.nn} still has bugs that are not fixed.`;
    // A clean review changed nothing, and its commit passed the check at built; fixes and cuts are checked where they stand.
    return has(review, /^- \[(fixed|cut)\]/m) ? checkProblem(root, state) : null;
  },
  // The close stage's lesson line is read by learn at a tidy; no mark waits on it.
  done: () => null,
};

function markBrief(root, state, nn, mark) {
  const brief = readBriefs(root).find((b) => b.nn === nn);
  if (!brief) return `There is no brief ${nn} in the briefs file.`;
  if (!MARKS.includes(mark)) return `"${mark}" is not a mark; the marks are ${MARKS.join(', ')}.`;
  const expected = MARKS[rank(state, brief) + 1];
  if (mark !== expected) {
    return expected ? `Brief ${nn} can only be marked ${expected} next, not ${mark}.` : `Brief ${nn} is already done.`;
  }
  const problem = REQUIRES[mark](root, state, brief);
  if (problem) return problem;
  state.briefs[nn] = mark;
  if (mark === 'noted') state.bases[nn] = git(root, 'rev-parse', 'HEAD');
  const size = mark === 'built' && sizeSince(root, state.bases[nn]);
  if (size) {
    state.sizes[nn] = size;
    // The next brief of the same wave is measured and reviewed from here.
    const head = git(root, 'rev-parse', 'HEAD');
    for (const b of readBriefs(root)) if (state.briefs[b.nn] === 'noted') state.bases[b.nn] = head;
  }
  return null;
}

function markBriefed(root, state) {
  if (!readBriefs(root).length) return 'The briefs file has no brief lines yet.';
  state.briefed = true;
  return null;
}

function markStack(root, state) {
  const briefs = readBriefs(root);
  if (!briefs.length || briefs.some((b) => rank(state, b) < 1)) return 'Every brief must be confirmed before the stack is settled.';
  const stack = read(root, 'stack.md');
  if (!has(stack, /^## Picks\s*$/m) || !has(stack, /^## Your steps\s*$/m)) {
    return 'The stack file needs a "## Picks" section and a "## Your steps" section.';
  }
  if (read(root, 'model.md') === null) return 'The data design file sidekik/model.md does not exist yet.';
  const problem = checkProblem(root, state);
  if (problem) return problem;
  const loose = uncommitted(root);
  if (loose) return `The skeleton must be committed before the stack is settled, so that every brief has a starting point: ${loose}.`;
  state.stack = true;
  return null;
}

function markTidying(root, state) {
  state.tidyBase = git(root, 'rev-parse', 'HEAD');
  return null;
}

function markTidied(root, state) {
  const last = state.history.findLast((h) => !h.brief && !h.refused && ['tidying', 'tidied'].includes(h.mark));
  if (last?.mark !== 'tidying') return 'The tidy has not started yet; mark tidying first.';
  const problem = checkProblem(root, state);
  if (problem) return problem;
  state.tidied = doneBriefs(root, state).length;
  state.tidyBase = null;
  return null;
}

function markShipped(root, state, named = []) {
  const done = doneBriefs(root, state);
  const briefs = named.length ? named : done.filter((nn) => !state.shipped.includes(nn));
  if (!briefs.length) return 'There is no finished brief waiting to be shipped.';
  const notDone = briefs.find((nn) => !done.includes(nn));
  if (notDone) return `Brief ${notDone} is not finished, so it cannot be marked live.`;
  state.shipped = [...new Set([...state.shipped, ...briefs])].sort();
  return null;
}

const stageOf = (state, b) => STAGES[rank(state, b) + 1];

// `also` lists the other briefs whose own next stage is the same.
function nextStep(root, state) {
  const briefs = readBriefs(root);
  const withBrief = (brief) => ({ stage: stageOf(state, brief), brief,
    also: briefs.filter((b) => b.nn !== brief.nn && stageOf(state, b) === stageOf(state, brief)).map((b) => b.nn) });
  // The brief list stands once it is marked briefed, or work on a brief has begun (an older project).
  if (!briefs.length || (!state.briefed && briefs.every((b) => rank(state, b) < 0))) return { stage: 'brief', also: [] };
  if (!state.stack) {
    const open = briefs.find((b) => rank(state, b) < 0) ?? briefs.find((b) => rank(state, b) < 1);
    return open ? withBrief(open) : { stage: 'stack', also: [] };
  }
  const done = doneBriefs(root, state).length;
  // A tidy comes between briefs, never over a half-built one.
  const midBuild = briefs.some((b) => rank(state, b) >= MARKS.indexOf('noted') && state.briefs[b.nn] !== 'done');
  if ((done - state.tidied >= 5 && !midBuild) || state.tidyBase) return { stage: 'tidy', also: [] };
  // The brief furthest along goes first, so approved work reaches live before new work is prototyped; ties by number.
  const open = briefs.filter((b) => state.briefs[b.nn] !== 'done');
  const brief = open.reduce((best, b) => (rank(state, b) > rank(state, best) ? b : best), open[0]);
  if (brief) return withBrief(brief);
  if (state.tidied < done) return { stage: 'tidy', also: [] };
  return { stage: briefs.some((b) => !state.shipped.includes(b.nn)) ? 'ship' : 'idle', also: [] };
}

function printNext(root, state) {
  const { stage, brief, also } = nextStep(root, state);
  const stageFile = stage === 'idle' ? 'none' : path.join(__dirname, '..', 'stages', `${stage}.md`);
  console.log(`Stage: ${stage}`);
  console.log(`Brief: ${brief ? `${brief.nn} ${brief.slug}: ${brief.sentence}` : 'none'}`);
  console.log(`Read: ${stageFile} (sidekik ${version})`);
  console.log(`Also at this stage: ${also.join(', ') || 'none'}`);
  console.log(`Open questions for ${brief ? 'this brief' : 'all briefs'}: ${openQuestions(root, brief?.nn).length}`);
  console.log(`Base: ${(brief && state.bases[brief.nn]) || 'none'}`);
}

function main(root, [cmd, a, b, ...more]) {
  if (cmd === 'init') {
    const existing = a === '--existing' ? b : null;
    if (existing?.includes(';')) return SEMICOLON;
    if (readState(root)) console.log('This project already has sidekik set up, so nothing was changed.');
    else {
      writeState(root, { ...fresh(), check: existing, stack: Boolean(existing) });
      console.log('Sidekik is set up in this project.');
    }
    return null;
  }
  const stored = readState(root);
  if (!stored) return NO_SETUP;
  const state = { ...fresh(), ...stored };
  if (cmd === 'next') {
    printNext(root, state);
  }
  else if (cmd === 'set-check' && a) {
    if (a.includes(';')) return SEMICOLON;
    writeState(root, { ...state, check: a });
    console.log(`The check command is now "${a}".`);
  } else if (cmd === 'reopen' && a === 'stack') {
    if (!state.stack) return 'The stack is not settled, so there is nothing to reopen.';
    state.stack = false;
    state.history.push({ brief: null, mark: 'stack', reopen: true, at: new Date().toISOString() });
    writeState(root, state);
    console.log('The stack is open again.');
  } else if (cmd === 'mark' && a) {
    const markProject = { briefed: markBriefed, stack: markStack, tidying: markTidying, tidied: markTidied, shipped: markShipped }[a];
    const problem = markProject ? markProject(root, state, [b, ...more].filter(Boolean)) : markBrief(root, state, a, b);
    const entry = { brief: markProject ? null : a, mark: markProject ? a : b, at: new Date().toISOString(), ...(problem && { refused: true }) };
    // A refused attempt leaves the stored state as it was, apart from the history.
    writeState(root, { ...(problem ? stored : state), history: [...state.history, entry] });
    if (problem) return problem;
    const size = b === 'built' && state.sizes[a];
    const tidy = a === 'tidied' && sizeSince(root, stored.tidyBase);
    console.log({ briefed: 'The brief list is now agreed.', stack: 'The stack is now settled.', tidying: 'The tidy has started.', tidied: `The tidy is finished.${tidy ? ` It added ${tidy.code + tidy.tests} lines and removed ${tidy.removed}.` : ''}`,
      shipped: `The finished briefs are now live: ${state.shipped.join(', ')}.` }[a]
      ?? `Brief ${a} is now marked ${b}.${size ? ` It added ${size.code} lines of code and ${size.tests} lines of tests, and removed ${size.removed} lines, ${size.testsRemoved} of them tests.` : ''}`);
  } else {
    return 'Use one of: init [--existing "<cmd>"], next, mark <NN> <mark>, mark briefed|stack|tidying|tidied|shipped [NN ...], reopen stack, or set-check "<cmd>".';
  }
  return null;
}

if (require.main === module) {
  const { root, args } = rootFrom(process.argv);
  const problem = main(root, args);
  if (problem) {
    console.log(problem);
    process.exit(1);
  }
}

module.exports = { MARKS, fresh, readBriefs, rank, nextStep, openQuestions };
