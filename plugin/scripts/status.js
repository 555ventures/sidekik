'use strict';
// The progress screen, derived from the same functions as state.js next so the two agree.
const path = require('path');
const { readState, read, rootFrom } = require('./lib/store');
const { openQuestions } = require('./decide');
const { MARKS, fresh, readBriefs, rank, nextStep, changedBriefs } = require('./state');
const { screensFor } = require('./proto-check');

// From closest to live down; each state's icon and label on the screen.
const GROUPS = [
  ['live', '✅', 'Live'], ['done', '📦', 'Finished'], ['reviewed', '🔍', 'Reviewed'], ['built', '🔨', 'Built'], ['noted', '🛠️', 'Ready to build'],
  ['confirmed', '🎨', 'Design approved'], ['prototyped', '🎨', 'Prototype ready for your look'], ['prototyping', '🎨', 'Prototyping'], ['none', '⬜', 'Not started'],
];
// The stages that wait on the owner; every other stage runs without them.
const OWNER_STAGES = ['brief', 'look', 'stack', 'ship'];
const NEXT = {
  brief: 'agree the brief list', prototype: 'prototype', look: 'your look at the prototype', stack: 'choose the stack',
  note: 'build note for', build: 'build', review: 'review', close: 'report', tidy: 'tidy the codebase', ship: 'your sign-off to go live',
  idle: 'nothing to do, everything is live',
};

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

function screen(root) {
  const state = { ...fresh(), ...readState(root) };
  const briefs = readBriefs(root);
  const live = (b) => state.shipped.includes(b.nn);
  const reached = (mark) => (b) => rank(state, b) >= MARKS.indexOf(mark);
  // A brief with no mark but examples on the prototype map is being prototyped.
  const key = (b) => (live(b) ? 'live' : state.briefs[b.nn] ?? (screensFor(root, b.nn).length ? 'prototyping' : 'none'));
  const name = (b) => `${b.nn} ${b.slug}`;
  // One waiting line per brief whose count is above zero.
  const perBrief = (count, word) => briefs.map((b) => [b, count(b)]).filter(([, n]) => n).map(([b, n]) => `${plural(n, word)} on ${name(b)}`);
  const out = [];

  if (!briefs.length) out.push('🗺️ No briefs yet.');
  else out.push(`🗺️ ${/^# (.+)$/m.exec((read(root, 'briefs.md') ?? ''))?.[1] ?? path.basename(root)}`);

  const { stage, brief, also } = nextStep(root, state);
  const prototyped = briefs.filter((b) => state.briefs[b.nn] === 'prototyped').map((b) => b.nn);
  const unshipped = briefs.filter((b) => state.briefs[b.nn] === 'done' && !live(b)).map((b) => b.nn);
  // Questions filed under `all` belong to no one brief, so they get one line of their own.
  const wholeProduct = openQuestions(root, 'all').length;
  const changed = changedBriefs(root, state);
  const waiting = [
    ...(stage === 'brief' ? ['your yes on the brief list'] : []),
    ...(wholeProduct ? [`${plural(wholeProduct, 'question')} on the whole product`] : []),
    ...perBrief((b) => openQuestions(root, b.nn).filter((line) => line.startsWith(`- [open] ${b.nn}:`)).length, 'question'),
    ...(stage === 'look' ? [`your look at the prototype (${prototyped.join(', ')})`] : []),
    ...(stage === 'stack' ? ['your stack picks'] : []),
    ...perBrief((b) => ((read(root, `reviews/${b.nn}.md`) ?? '').match(/^- \[owner\]/gm) ?? []).length, 'review question'),
    ...(unshipped.length ? [`your sign-off to take ${unshipped.join(', ')} live`] : []),
    ...(changed.length ? [`your yes again on ${changed.join(', ')}, changed since approval`] : []),
  ];
  out.push('');
  if (!waiting.length) out.push('🙋 Nothing is waiting on you.');
  else out.push('🙋 Waiting on you', ...waiting.map((line, i) => `   ${i === waiting.length - 1 ? '└─' : '├─'} ${line}`));

  const what = brief && stage !== 'look' ? `${NEXT[stage]} ${name(brief)}` : NEXT[stage];
  const ending = stage === 'idle' ? '' : OWNER_STAGES.includes(stage) ? ' · needs you' : ' · runs without you';
  out.push('', `🎯 Next   ${what}${also.length ? ` (with ${also.join(', ')})` : ''}${ending}`);
  if (!briefs.length) return out.join('\n');

  const groups = GROUPS.map(([k, icon, label]) => [icon, label, briefs.filter((b) => key(b) === k)]).filter(([, , members]) => members.length);
  const width = Math.max(...groups.map(([, label]) => label.length));
  const detail = (b) => {
    if (key(b) !== 'prototyping') return b.nn;
    const rows = screensFor(root, b.nn);
    return `${b.nn} (${rows.filter((r) => r.status === 'done').length} of ${rows.length} examples)`;
  };
  out.push('', ...groups.map(([icon, label, members]) => `${icon} ${label.padEnd(width)}  ${members.map(detail).join(' ')}`));

  const count = (test) => `${briefs.filter(test).length} of ${briefs.length}`;
  const marks = state.history.filter((h) => h.brief && !h.refused);
  const at = (b, mark) => new Date(marks.find((h) => h.brief === b.nn && h.mark === mark)?.at);
  const minutes = briefs.filter((b) => state.briefs[b.nn] === 'done').map((b) => Math.floor((at(b, 'done') - at(b, 'confirmed')) / 60000))
    .filter((m) => !Number.isNaN(m)).sort((x, y) => x - y);
  const median = Math.floor((minutes[(minutes.length - 1) >> 1] + minutes[minutes.length >> 1]) / 2);
  const span = median < 60 ? `${median} min` : `${Math.floor(median / 60)} h ${median % 60} min`;
  out.push('', `📈 Progress   ${count(reached('confirmed'))} designed · ${count(reached('built'))} built · ${count(live)} live`
    + `${minutes.length ? ` · ${span} from your yes to finished` : ''}`);
  return out.join('\n');
}

if (require.main === module) console.log(screen(rootFrom(process.argv).root));
