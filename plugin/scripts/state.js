'use strict';
// The commands that read and move a project through its marks and stages.
const path = require('path');
const { spawnSync } = require('child_process');
const { readState, writeState, read, sha, day, rootFrom } = require('./lib/store');
const { verifyDecisions, decisionsFor, openQuestions } = require('./decide');
const { checkPrototype, screensFor } = require('./proto-check');

const MARKS = ['prototyped', 'confirmed', 'noted', 'built', 'reviewed', 'done'];
const STAGES = ['prototype', 'look', 'note', 'build', 'review', 'close'];
// An older state file may lack the later fields; each counts as its empty value.
const fresh = () => ({ check: null, depsCommand: null, deps: null, stack: false, briefed: false, kitHash: null, decisionsHash: null, approved: {}, approvals: {},
  bases: {}, sizes: {}, tidied: 0, tidyBase: null, shipped: [], history: [], briefs: {} });

const has = (text, re) => text !== null && re.test(text);
const git = (root, ...args) => {
  const run = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  return run.status === 0 ? run.stdout.trim() : null;
};

// The project's library command prints one name per line; null when it fails.
function libraries(root, command) {
  const run = spawnSync(command, { shell: true, cwd: root, encoding: 'utf8' });
  return run.status === 0 ? run.stdout.split('\n').map((l) => l.trim()).filter(Boolean) : null;
}

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

// A hash of the brief's mapped files, paths and contents, so an approval covers exactly what was shown.
const briefHash = (root, nn) => sha(JSON.stringify(screensFor(root, nn).map(({ screen }) => [screen, read(root, `prototype/${screen}`)])));
const changedSinceApproval = (root, state, nn) => state.approved[nn] !== briefHash(root, nn)
  && `The prototype of brief ${nn} changed after the owner approved it, so it must be shown to them again. After their yes, record it with decide.js add ${nn} "<their words>", then run state.js reconfirm ${nn}.`;
// The briefs with an approval whose mapped files no longer match it, done ones included.
const changedBriefs = (root, state) => readBriefs(root).map((b) => b.nn).filter((nn) => state.approved[nn] && changedSinceApproval(root, state, nn));

// How often each cause appears on brief and fix lessons; [none] is never counted.
function lessonCauses(root) {
  const counts = {};
  for (const [, cause] of (read(root, 'lessons.md') ?? '').matchAll(/^- (?:\d\d|fix): \[([^\]]+)\]/gm)) {
    if (cause !== 'none') counts[cause] = (counts[cause] ?? 0) + 1;
  }
  return counts;
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

// The owner's yes counts when a decision for `brief` is dated on or after the day of the last mark it must follow
// (of `markBrief` when given). An older state file may lack that mark, and then any such decision counts.
function decidedSince(root, state, brief, mark, markBrief) {
  const last = state.history.findLast((h) => h.mark === mark && !h.refused && (markBrief === undefined || h.brief === markBrief));
  const since = last && day(last.at);
  return decisionsFor(root, brief).some((d) => !since || d.date >= since);
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
    const decisions = verifyDecisions(root);
    if (!decisions.ok) return decisions.problems[0];
    const open = openQuestions(root, b.nn).length;
    if (open) return `Brief ${b.nn} still has ${open} open question(s) waiting for the owner.`;
    return decidedSince(root, state, b.nn, 'prototyped', b.nn) ? null
      : `Brief ${b.nn} has no decision recording the owner's yes on its prototype. After their yes, run decide.js add ${b.nn} "<their words>" and mark again.`;
  },
  noted(root, state, b) {
    if (!state.stack) return 'The stack is not settled yet.';
    const changed = changedSinceApproval(root, state, b.nn);
    if (changed) return changed;
    const rel = `build-notes/${b.nn}-${b.slug}.md`;
    const note = read(root, rel);
    if (note === null) return `The build note sidekik/${rel} does not exist yet.`;
    if (note.trimEnd().split('\n').length > 60) return `The build note sidekik/${rel} is longer than 60 lines.`;
    if (!has(note, /^## Reuse\s*$/m)) return `The build note sidekik/${rel} needs a "## Reuse" section.`;
    return doneWhenItems(note) ? null : `The build note sidekik/${rel} needs a "## Done when" section with at least one item.`;
  },
  built(root, state, b) {
    const changed = changedSinceApproval(root, state, b.nn);
    if (changed) return changed;
    const names = state.depsCommand ? libraries(root, state.depsCommand) : [];
    if (!names) return `The library command "${state.depsCommand}" did not run.`;
    const extra = names.find((name) => !state.deps.includes(name));
    if (extra) return `The project uses the library ${extra}, which the owner has not agreed to. After the owner's yes, run state.js allow ${extra}.`;
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
    return checkProblem(root, state);
  },
  done(root, state, b) {
    return has(read(root, 'lessons.md'), new RegExp(`^- ${b.nn}: \\[[^\\]]+\\] `, 'm')) ? null
      : `The lessons file has no lesson for brief ${b.nn} yet, written as "- ${b.nn}: [cause] what to change".`;
  },
};

// An approval covers the prototype as it stands, the decisions recorded so far and the day; a later reconfirm needs a yes beyond them.
function approve(root, state, nn) {
  state.approved[nn] = briefHash(root, nn);
  state.approvals[nn] = { count: decisionsFor(root, nn).length, on: day() };
}

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
  if (mark === 'confirmed') approve(root, state, nn);
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
  if (decisionsFor(root, 'all').length === 0) {
    return 'The list has no decision recording the owner\'s yes on it. After their yes, run decide.js add all "<their words>" and mark again.';
  }
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
  if (!decidedSince(root, state, 'all', 'confirmed')) {
    return 'The stack has no decision recording the owner\'s picks. After their yes, run decide.js add all "<their picks>" and mark again.';
  }
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
  const lessons = `\n${read(root, 'lessons.md') ?? ''}`;
  const [cause, n] = Object.entries(lessonCauses(root)).find(([c, count]) => count >= 3 && !lessons.includes(`\n- guard: [${c}]`)) ?? [];
  if (cause) return `The cause [${cause}] appears ${n} times in the lessons file with no machine check. Add a check that refuses it and the line "- guard: [${cause}] ..." to the lessons file.`;
  state.tidied = doneBriefs(root, state).length;
  state.tidyBase = null;
  return null;
}

function markShipped(root, state) {
  const done = doneBriefs(root, state);
  if (done.every((nn) => state.shipped.includes(nn))) return 'There is no finished brief waiting to be shipped.';
  if (state.tidied !== done.length) return 'The codebase has not been tidied since the last briefs were finished, so the tidy comes first.';
  if (!decidedSince(root, state, 'all', 'done')) {
    return 'There is no decision recording the owner\'s yes to go live. After their yes, run decide.js add all "<their words>" and mark again.';
  }
  const problem = checkProblem(root, state);
  if (problem) return problem;
  state.shipped = done;
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
  const brief = briefs.find((b) => state.briefs[b.nn] !== 'done');
  if (brief) return withBrief(brief);
  if (state.tidied < done) return { stage: 'tidy', also: [] };
  return { stage: briefs.some((b) => !state.shipped.includes(b.nn)) ? 'ship' : 'idle', also: [] };
}

function printNext(root, state) {
  const { stage, brief, also } = nextStep(root, state);
  const stageFile = stage === 'idle' ? 'none' : path.join(__dirname, '..', 'stages', `${stage}.md`);
  console.log(`Stage: ${stage}`);
  console.log(`Brief: ${brief ? `${brief.nn} ${brief.slug}: ${brief.sentence}` : 'none'}`);
  console.log(`Read: ${stageFile}`);
  console.log(`Also at this stage: ${also.join(', ') || 'none'}`);
  console.log(`Open questions for ${brief ? 'this brief' : 'all briefs'}: ${openQuestions(root, brief?.nn).length}`);
  console.log(`Base: ${(brief && state.bases[brief.nn]) || 'none'}`);
  const changed = changedBriefs(root, state);
  if (changed.length) console.log(`Changed since approval: ${changed.join(', ')}`);
}

function main(root, [cmd, a, b]) {
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
  if (!stored) return 'This project has no sidekik setup yet; run init first.';
  const state = { ...fresh(), ...stored };
  // An older state file lacks the approval records (count and day); they are completed once from the decisions as they stand.
  // A bare number was written by an earlier version and is completed the same way. The day is that of the brief's last confirmed mark.
  const uncounted = Object.keys(state.approved).filter((nn) => typeof state.approvals[nn] !== 'object');
  if (uncounted.length) {
    const since = (nn) => state.history.findLast((h) => h.brief === nn && h.mark === 'confirmed' && !h.refused)?.at;
    state.approvals = { ...state.approvals, ...Object.fromEntries(uncounted.map((nn) => [nn, { count: decisionsFor(root, nn).length, on: since(nn) ? day(since(nn)) : '0000-00-00' }])) };
    stored.approvals = state.approvals;
    writeState(root, state);
  }
  if (cmd === 'next') {
    printNext(root, state);
    if (uncounted.length) console.log(`Approval records completed for ${uncounted.join(', ')} (older state file).`);
  }
  else if (cmd === 'set-check' && a) {
    if (a.includes(';')) return SEMICOLON;
    writeState(root, { ...state, check: a });
    console.log(`The check command is now "${a}".`);
  } else if (cmd === 'set-deps' && a) {
    const deps = libraries(root, a);
    if (!deps) return `The library command "${a}" did not run, so nothing was changed.`;
    writeState(root, { ...state, depsCommand: a, deps });
    console.log(`The library command is now "${a}", and the ${deps.length} libraries it lists are accepted.`);
  } else if (cmd === 'allow' && a) {
    writeState(root, { ...state, deps: [...(state.deps ?? []), a] });
    console.log(`The library ${a} is now allowed.`);
  } else if (cmd === 'reconfirm' && a) {
    const brief = readBriefs(root).find((x) => x.nn === a);
    if (!brief) return `There is no brief ${a} in the briefs file.`;
    if (rank(state, brief) < 0) return `Brief ${a} has no prototype ready yet, so there is nothing to approve again.`;
    const problem = REQUIRES.confirmed(root, state, brief);
    if (problem) return problem;
    // A new yes is one more decision than at the approval, or one dated after its day. A brief never approved has neither.
    const { count, on } = state.approvals[a] ?? { count: 0, on: '0000-00-00' };
    const decisions = decisionsFor(root, a);
    if (decisions.length <= count && !decisions.some((d) => d.date > on)) {
      return `Brief ${a} changed after the owner approved it, and no new yes is recorded. Record it first with decide.js add ${a} "<their words>", then run state.js reconfirm ${a}.`;
    }
    approve(root, state, a);
    writeState(root, state);
    console.log(`The owner's approval of brief ${a} now covers the prototype as it stands.`);
  } else if (cmd === 'mark' && a) {
    const markProject = { briefed: markBriefed, stack: markStack, tidying: markTidying, tidied: markTidied, shipped: markShipped }[a];
    const problem = markProject ? markProject(root, state) : markBrief(root, state, a, b);
    const entry = { brief: markProject ? null : a, mark: markProject ? a : b, at: new Date().toISOString(), ...(problem && { refused: true }) };
    // A refused attempt leaves the stored state as it was, apart from the history.
    writeState(root, { ...(problem ? stored : state), history: [...state.history, entry] });
    if (problem) return problem;
    const size = b === 'built' && state.sizes[a];
    const tidy = a === 'tidied' && sizeSince(root, stored.tidyBase);
    console.log({ briefed: 'The brief list is now agreed.', stack: 'The stack is now settled.', tidying: 'The tidy has started.', tidied: `The tidy is finished.${tidy ? ` It added ${tidy.code + tidy.tests} lines and removed ${tidy.removed}.` : ''}`,
      shipped: `The finished briefs are now shipped: ${state.shipped.join(', ')}.` }[a]
      ?? `Brief ${a} is now marked ${b}.${size ? ` It added ${size.code} lines of code and ${size.tests} lines of tests, and removed ${size.removed} lines, ${size.testsRemoved} of them tests.` : ''}`);
  } else {
    return 'Use one of: init [--existing "<cmd>"], next, mark <NN> <mark>, mark briefed|stack|tidying|tidied|shipped, reconfirm <NN>, set-check "<cmd>", set-deps "<cmd>", or allow <name>.';
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

module.exports = { MARKS, fresh, readBriefs, rank, nextStep, lessonCauses, changedBriefs };
