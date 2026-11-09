'use strict';
// The only writer of sidekik/decisions.md, the record of the owner's rulings.
const fs = require('fs');
const path = require('path');
const { dir, readState, writeState, sha, rootFrom } = require('./lib/store');

const decisionsFile = (root) => path.join(dir(root), 'decisions.md');
const readOrNull = (file) => (fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null);
const today = () => new Date().toLocaleDateString('en-CA');

function seal(root) {
  const text = readOrNull(decisionsFile(root));
  writeState(root, { ...readState(root), decisionsHash: text === null ? null : sha(text) });
}

// Returns the problem when the file was edited by hand, so a new decision cannot bury the edit.
function addDecision(root, brief, text) {
  const { ok, problems } = verifyDecisions(root);
  if (!ok) return problems[0];
  fs.appendFileSync(decisionsFile(root), `- ${today()} ${brief}: ${text}\n`);
  seal(root);
  return null;
}

function verifyDecisions(root) {
  const text = readOrNull(decisionsFile(root));
  const stored = readState(root)?.decisionsHash ?? null;
  if (text === null && stored === null) return { ok: true, problems: [] };
  if (text !== null && sha(text) === stored) return { ok: true, problems: [] };
  const what = text === null ? 'deleted' : 'changed by hand';
  return { ok: false, problems: [`The decisions file was ${what} after the last recorded decision. Ask the owner whether that was them; if it was, run decide.js seal.`] };
}

// The decisions recorded for exactly this brief (NN or all), oldest first.
function decisionsFor(root, brief) {
  return (readOrNull(decisionsFile(root)) ?? '').split('\n')
    .map((line) => /^- (\d{4}-\d\d-\d\d) (\d\d|all): (.+)$/.exec(line))
    .filter((m) => m && m[2] === brief)
    .map(([, date, b, text]) => ({ date, brief: b, text }));
}

function openQuestions(root, brief) {
  const qdir = path.join(dir(root), 'questions');
  if (!fs.existsSync(qdir)) return [];
  return fs.readdirSync(qdir).filter((f) => f.endsWith('.md')).sort()
    .flatMap((f) => fs.readFileSync(path.join(qdir, f), 'utf8').split('\n'))
    .filter((line) => {
      const m = /^- \[open\] (\d\d|all):/.exec(line);
      return m && (brief === undefined || m[1] === brief || m[1] === 'all');
    });
}

if (require.main === module) {
  const root = rootFrom(process.argv);
  const args = process.argv.slice(2);
  if (args.includes('--root')) args.splice(args.indexOf('--root'), 2);
  const [cmd, a, b] = args;
  if (cmd === 'add' && /^(\d\d|all)$/.test(a ?? '') && b) {
    const problem = addDecision(root, a, b);
    console.log(problem ?? 'The decision is recorded.');
    process.exit(problem ? 1 : 0);
  } else if (cmd === 'seal') {
    seal(root);
    console.log('The decisions file is accepted as it stands.');
  } else if (cmd === 'verify') {
    const { ok, problems } = verifyDecisions(root);
    console.log(ok ? 'The decisions file is as it was recorded.' : problems.join('\n'));
    process.exit(ok ? 0 : 1);
  } else if (cmd === 'questions') {
    for (const line of openQuestions(root, a)) console.log(line);
  } else {
    console.log('Use one of: add <NN|all> "<text>", seal, verify, or questions [NN].');
    process.exit(1);
  }
}

module.exports = { addDecision, verifyDecisions, decisionsFor, openQuestions };
