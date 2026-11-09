'use strict';
// The progress screen, derived from the same functions as state.js next so the two agree.
const fs = require('fs');
const path = require('path');
const { dir, readState, rootFrom } = require('./lib/store');
const { openQuestions } = require('./decide');
const { MARKS, fresh, readBriefs, nextStep, lessonCauses } = require('./state');

const LOOK = {
  none: ['⬜', 'not started'], prototyped: ['🎨', 'prototype ready for your look'], confirmed: ['🎨', 'design approved'],
  noted: ['🛠️', 'ready to build'], built: ['🔨', 'built'], reviewed: ['🔍', 'reviewed'], done: ['📦', 'finished'], live: ['✅', 'live'],
};
const LABEL_WIDTH = Math.max(...Object.values(LOOK).map(([, label]) => label.length));
const NEXT = {
  brief: 'agree the brief list', prototype: 'prototype', look: 'your look at the prototype', stack: 'choose the stack',
  note: 'build note for', build: 'build', review: 'review', close: 'report', tidy: 'tidy the codebase', ship: 'your sign-off to go live',
  idle: 'nothing to do, everything is live',
};
const NEEDS_YOU = ['brief', 'look', 'stack', 'ship'];

const readOrEmpty = (root, rel) => {
  const file = path.join(dir(root), rel);
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
};
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

function screen(root) {
  const state = { ...fresh(), ...readState(root) };
  const briefs = readBriefs(root);
  const live = (b) => state.shipped.includes(b.nn);
  const reached = (mark) => (b) => MARKS.indexOf(state.briefs[b.nn]) >= MARKS.indexOf(mark);
  const name = (b) => `${b.nn} ${b.slug}`;
  // One waiting line per brief whose count is above zero.
  const perBrief = (count, word) => briefs.map((b) => [b, count(b)]).filter(([, n]) => n).map(([b, n]) => `${plural(n, word)} on ${name(b)}`);
  const out = [];

  if (!briefs.length) out.push('🗺️ No briefs yet.');
  else {
    const slugWidth = Math.max(...briefs.map((b) => b.slug.length));
    out.push(`🗺️ ${/^# (.+)$/m.exec(readOrEmpty(root, 'briefs.md'))?.[1] ?? path.basename(root)}`);
    for (const b of briefs) {
      const [icon, label] = LOOK[live(b) ? 'live' : state.briefs[b.nn] ?? 'none'];
      const cells = MARKS.indexOf(state.briefs[b.nn]) + 1 + (live(b) ? 1 : 0);
      const size = state.sizes[b.nn];
      out.push(`   ${icon} ${b.nn} ${b.slug.padEnd(slugWidth)}   ${'▓'.repeat(cells)}${'░'.repeat(7 - cells)}  `
        + `${label.padEnd(LABEL_WIDTH)}  ${size ? `${size.code} code · ${size.tests} tests` : ''}`.trimEnd());
    }
    const count = (test) => `${briefs.filter(test).length} of ${briefs.length}`;
    const marks = state.history.filter((h) => h.brief && !h.refused);
    // Each brief's latest step today, so the line never contradicts itself.
    const latest = new Map(marks.filter((h) => new Date(h.at).toDateString() === new Date().toDateString()).map((h) => [h.brief, h]));
    const today = [...latest.values()].map((h) => `${h.brief} ${LOOK[h.mark][1]}`);
    out.push('', `📈 Progress   ${count(reached('confirmed'))} designed · ${count(reached('built'))} built · ${count(live)} live`,
      `   Today      ${today.join(' · ') || 'nothing yet'}`);
    const done = briefs.filter((b) => state.briefs[b.nn] === 'done');
    if (done.length) {
      const at = (b, mark) => new Date(marks.find((h) => h.brief === b.nn && h.mark === mark)?.at);
      const minutes = done.map((b) => Math.floor((at(b, 'done') - at(b, 'confirmed')) / 60000)).filter((m) => !Number.isNaN(m)).sort((x, y) => x - y);
      const median = Math.floor((minutes[(minutes.length - 1) >> 1] + minutes[minutes.length >> 1]) / 2);
      const lines = (rel, re) => readOrEmpty(root, rel).split('\n').filter((l) => re.test(l)).length;
      const parts = [`${done.length} finished`, ...(minutes.length ? [`${median} min from approval to finished`] : []),
        `${plural(lines('decisions.md', /\S/), 'decision')} from you`, plural(state.history.filter((h) => h.refused).length, 'refused step'),
        `${plural(lines('lessons.md', /^- fix:/), 'bug')} escaped`];
      out.push(`   So far     ${parts.join(' · ')}`);
    }
    const repeating = Object.entries(lessonCauses(root)).filter(([, n]) => n >= 2).sort((x, y) => y[1] - x[1]);
    if (repeating.length) out.push(`   Repeating  ${repeating.map(([cause, n]) => `${cause} ×${n}`).join(' · ')}`);
  }

  const { stage, brief, also } = nextStep(root, state);
  const prototyped = briefs.filter((b) => state.briefs[b.nn] === 'prototyped').map((b) => b.nn);
  const unshipped = briefs.filter((b) => state.briefs[b.nn] === 'done' && !live(b)).map((b) => b.nn);
  const waiting = [
    ...perBrief((b) => openQuestions(root, b.nn).length, 'question'),
    ...(stage === 'look' ? [`your look at the prototype (${prototyped.join(', ')})`] : []),
    ...(stage === 'stack' ? ['your stack picks'] : []),
    ...perBrief((b) => (readOrEmpty(root, `reviews/${b.nn}.md`).match(/^- \[owner\]/gm) ?? []).length, 'review question'),
    ...(unshipped.length ? [`your sign-off to take ${unshipped.join(', ')} live`] : []),
  ];
  out.push('');
  if (!waiting.length) out.push('🙋 Nothing is waiting on you.');
  else out.push('🙋 Waiting on you', ...waiting.map((line, i) => `   ${i === waiting.length - 1 ? '└─' : '├─'} ${line}`));

  const what = brief && stage !== 'look' ? `${NEXT[stage]} ${name(brief)}` : NEXT[stage];
  const ending = stage === 'idle' ? '' : NEEDS_YOU.includes(stage) ? ' — needs you' : ' — nothing needed from you';
  out.push('', `🎯 Next   ${what}${also.length ? ` (with ${also.join(', ')})` : ''}${ending}`);
  return out.join('\n');
}

if (require.main === module) console.log(screen(rootFrom(process.argv)));
