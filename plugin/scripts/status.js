'use strict';
// The progress screen, derived from the same functions as state.js next so the two agree.
const path = require('path');
const { readState, read, rootFrom } = require('./lib/store');
const { openQuestions } = require('./decide');
const { MARKS, fresh, readBriefs, rank, nextStep, changedBriefs } = require('./state');
const { screensFor } = require('./proto-check');

// Each state's icon and label on the roadmap. Resting states collapse into runs and carry no bar.
const RESTING = { live: ['✅', 'live'], done: ['📦', 'finished'], none: ['⬜', 'not started'] };
const MOTION = {
  prototyping: ['🎨'], prototyped: ['🎨', 'prototype ready for your look'], confirmed: ['🎨', 'design approved'],
  noted: ['🛠️', 'ready to build'], built: ['🔨', 'built'], reviewed: ['🔍', 'reviewed'],
};
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
  if (!waiting.length) out.push('🙋 Nothing is waiting on you.');
  else out.push('🙋 Waiting on you', ...waiting.map((line, i) => `   ${i === waiting.length - 1 ? '└─' : '├─'} ${line}`));

  const what = brief && stage !== 'look' ? `${NEXT[stage]} ${name(brief)}` : NEXT[stage];
  out.push('', `🎯 Next   ${what}${also.length ? ` (with ${also.join(', ')})` : ''}`);
  if (!briefs.length) return [...out, '', '🗺️ No briefs yet.'].join('\n');

  // Consecutive briefs at the same resting state share one row; every brief in motion has its own.
  const rows = [];
  for (const b of briefs) {
    const k = key(b);
    if (RESTING[k] && rows[rows.length - 1]?.k === k) rows[rows.length - 1].members.push(b);
    else rows.push({ k, members: [b] });
  }
  const lines = rows.map(({ k, members }) => {
    const [first] = members;
    if (RESTING[k]) {
      const [icon, word] = RESTING[k];
      if (members.length === 1) return [icon, name(first), word];
      return [icon, `${first.nn}–${members[members.length - 1].nn}`, `${word} (${members.length} briefs)`];
    }
    const [icon, word] = MOTION[k];
    const cells = rank(state, first) + 1;
    const examples = screensFor(root, first.nn);
    const label = k === 'prototyping' ? `prototyping, ${examples.filter((r) => r.status === 'done').length} of ${examples.length} examples` : word;
    return [icon, name(first), `${'▓'.repeat(cells)}${'░'.repeat(MARKS.length - cells)}  ${label}`];
  });
  const width = Math.max(...lines.map(([, label]) => label.length));
  const title = /^# (.+)$/m.exec(read(root, 'briefs.md') ?? '')?.[1] ?? path.basename(root);
  out.push('', `🗺️ ${title}`, ...lines.map(([icon, label, tail]) => `   ${icon} ${label.padEnd(width)}  ${tail}`));

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
