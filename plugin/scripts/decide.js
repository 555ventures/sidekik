'use strict';
// The only writer of sidekik/decisions.md, the record of the owner's rulings.
const fs = require('fs');
const path = require('path');
const { dir, readState, writeState, read, sha, day, rootFrom } = require('./lib/store');

const decisionsFile = (root) => path.join(dir(root), 'decisions.md');

function seal(root) {
  const text = read(root, 'decisions.md');
  writeState(root, { ...readState(root), decisionsHash: text === null ? null : sha(text) });
}

// The one append path: dated lines in order, then sealed once.
function record(root, entries) {
  const lines = entries.map(({ brief, text }) => `- ${day()} ${brief}: ${text}\n`);
  fs.appendFileSync(decisionsFile(root), lines.join(''));
  seal(root);
}

// Returns the problem when the file was edited by hand, so a new decision cannot bury the edit.
function addDecisions(root, entries) {
  const { ok, problems } = verifyDecisions(root);
  if (!ok) return problems[0];
  record(root, entries);
  return null;
}

// Lines "NN: text" or "all: text" to entries; the first bad line comes back instead, so nothing is half-written.
function parseDecisions(input) {
  const entries = [];
  for (const line of input.split('\n').map((l) => l.trim()).filter(Boolean)) {
    const m = /^(\d\d|all):\s*(\S.*)$/.exec(line);
    if (!m) return { bad: line };
    entries.push({ brief: m[1], text: m[2] });
  }
  return { entries };
}

function verifyDecisions(root) {
  const text = read(root, 'decisions.md');
  const stored = readState(root)?.decisionsHash ?? null;
  if (text === null && stored === null) return { ok: true, problems: [] };
  if (text !== null && sha(text) === stored) return { ok: true, problems: [] };
  const what = text === null ? 'deleted' : 'changed by hand';
  return { ok: false, problems: [`The decisions file was ${what} after the last recorded decision. Ask the owner whether that was them; if it was, run decide.js seal.`] };
}

// The decisions recorded for exactly these briefs (NN or all), oldest first; for every brief when none is named.
function decisionsFor(root, ...briefs) {
  return (read(root, 'decisions.md') ?? '').split('\n')
    .map((line) => /^- (\d{4}-\d\d-\d\d) (\d\d|all): (.+)$/.exec(line))
    .filter((m) => m && (briefs.length === 0 || briefs.includes(m[2])))
    .map(([, date, b, text]) => ({ date, brief: b, text }));
}

// Every open question line under sidekik/questions/, with its file, brief and text.
function questionLines(root) {
  const qdir = path.join(dir(root), 'questions');
  if (!fs.existsSync(qdir)) return [];
  return fs.readdirSync(qdir).filter((f) => f.endsWith('.md')).sort().flatMap((f) => {
    const file = path.join(qdir, f);
    return fs.readFileSync(file, 'utf8').split('\n').flatMap((line) => {
      const m = /^- \[open\] (\d\d|all): ?(.*)/.exec(line);
      return m ? [{ file, line, brief: m[1], text: m[2] }] : [];
    });
  });
}

function openQuestions(root, brief) {
  return questionLines(root)
    .filter((q) => brief === undefined || q.brief === brief || q.brief === 'all')
    .map(({ line }) => line);
}

// Turns the one open question of exactly this brief that contains `match` into an answered one and records the ruling.
// Returns the problem, or null when done.
function answerQuestion(root, brief, match, answer) {
  const { ok, problems } = verifyDecisions(root);
  if (!ok) return problems[0];
  const hits = questionLines(root).filter((q) => q.brief === brief && q.text.toLowerCase().includes(match.toLowerCase()));
  if (hits.length === 0) return `No open question for ${brief} contains "${match}". Run decide.js questions ${brief} to see them.`;
  if (hits.length > 1) return [`"${match}" fits ${hits.length} open questions for ${brief}:`, ...hits.map(({ line }) => line)].join('\n');
  const { file, line, text } = hits[0];
  fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace(line, () => `- [answered] ${brief}: ${text} → ${answer}`));
  record(root, [{ brief, text: `${answer} [${text}]` }]);
  return null;
}

if (require.main === module) {
  const { root, args } = rootFrom(process.argv);
  const [cmd, a, b, c] = args;
  const brief = /^(\d\d|all)$/;
  const finish = (problem, done) => {
    console.log(problem ?? done);
    process.exit(problem ? 1 : 0);
  };
  if (cmd === 'add' && args.length > 3) {
    finish('add takes one ruling. To record several at once, pipe lines "NN: text" into decide.js add.');
  } else if (cmd === 'add' && args.length === 1) {
    const { entries, bad } = parseDecisions(fs.readFileSync(0, 'utf8'));
    const form = 'The form is "NN: text" or "all: text", with NN two digits. Nothing is recorded.';
    if (bad !== undefined) finish(`Not a decision line: ${bad}\n${form}`);
    if (entries.length === 0) finish(`No lines came in on stdin. ${form}`);
    finish(addDecisions(root, entries), `${entries.length} ${entries.length === 1 ? 'decision is' : 'decisions are'} recorded.`);
  } else if (cmd === 'add' && brief.test(a ?? '') && b) {
    finish(addDecisions(root, [{ brief: a, text: b }]), 'The decision is recorded.');
  } else if (cmd === 'answer' && brief.test(a ?? '') && b && c) {
    finish(answerQuestion(root, a, b, c), 'The question is answered and the decision is recorded.');
  } else if (cmd === 'seal') {
    seal(root);
    console.log('The decisions file is accepted as it stands.');
  } else if (cmd === 'verify') {
    const { ok, problems } = verifyDecisions(root);
    console.log(ok ? 'The decisions file is as it was recorded.' : problems.join('\n'));
    process.exit(ok ? 0 : 1);
  } else if (cmd === 'list') {
    for (const { date, brief: b, text } of decisionsFor(root, ...(a ? [a, 'all'] : []))) console.log(`- ${date} ${b}: ${text}`);
  } else if (cmd === 'questions') {
    for (const line of openQuestions(root, a)) console.log(line);
  } else {
    console.log('Use one of: add <NN|all> "<text>", add (lines "NN: text" on stdin), answer <NN|all> "<match>" "<answer>", seal, verify, list [NN], or questions [NN].');
    process.exit(1);
  }
}

module.exports = { verifyDecisions, decisionsFor, openQuestions };
