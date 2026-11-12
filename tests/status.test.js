'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

// A project whose sidekik/ holds `files`; `state` is written as state.json unless null.
function status(state, files = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sidekik-status-'));
  const all = state ? { ...files, 'state.json': JSON.stringify(state) } : files;
  for (const [rel, text] of Object.entries(all)) {
    fs.mkdirSync(path.dirname(path.join(root, 'sidekik', rel)), { recursive: true });
    fs.writeFileSync(path.join(root, 'sidekik', rel), text);
  }
  const r = spawnSync(process.execPath, [path.join(__dirname, '..', 'plugin', 'scripts', 'status.js'), '--root', root], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stdout);
  return { root, out: r.stdout };
}

test('the screen shows what waits on the owner, what comes next, the roadmap and the progress', () => {
  const day = (time, brief, mark, refused) => ({ brief, mark, at: `2020-01-01T${time}:00.000Z`, ...(refused && { refused }) });
  const { out } = status({
    check: 'true', stack: true, shipped: ['01'],
    briefs: { '01': 'done', '02': 'built', '03': 'confirmed', '05': 'done' },
    history: [day('10:00', '01', 'confirmed'), day('10:30', '01', 'done'), day('11:00', '05', 'confirmed'), day('11:20', '05', 'done', true),
      day('11:46', '05', 'done')],
  }, {
    'briefs.md': '# Split the bill\n\n- 01 even-split: Split evenly.\n- 02 drinks-separately: Drinks apart.\n'
      + '- 03 history: Past bills.\n- 04 share-link: Share a link.\n- 05 tip-jar: Add a tip.\n',
    'prototype/map/share.md': '| screen | brief | status | purpose | notes |\n|---|---|---|---|---|\n'
      + '| share/link.html | 04 | done | link | |\n| share/revoke.html | 04 | planned | revoke | |\n',
    'questions/pm.md': '- [open] all: Which currency?\n- [open] 03: Round up?\n- [open] 03: Show tax?\n- [answered] 02: Split tax? → yes\n',
    'reviews/02.md': '- [fixed] Rounding.\n- [owner] Copy tone.\n',
  });
  assert.equal(out, `🙋 Waiting on you
   ├─ 1 question on the whole product
   ├─ 2 questions on 03 history
   ├─ 1 review question on 02 drinks-separately
   └─ your sign-off to take 05 live

🎯 Next   review 02 drinks-separately

🗺️ Split the bill
   ✅ 01 even-split         live
   🔨 02 drinks-separately  ▓▓▓▓░░  built
   🎨 03 history            ▓▓░░░░  design approved
   🎨 04 share-link         ░░░░░░  prototyping, 1 of 2 examples
   📦 05 tip-jar            finished

📈 Progress   4 of 5 designed · 3 of 5 built · 1 of 5 live · 38 min from your yes to finished
`);
});

test('an empty project says there are no briefs and that the brief list comes next', () => {
  assert.equal(status(null).out, '🙋 Waiting on you\n   └─ your yes on the brief list\n\n🎯 Next   agree the brief list\n\n🗺️ No briefs yet.\n');
});

test('with nothing waiting the section is one line, and the title falls back to the folder name', () => {
  const { root, out } = status({ stack: true, shipped: [], briefs: { '01': 'noted', '02': 'noted' } },
    { 'briefs.md': '- 01 a: One.\n- 02 bb: Two.\n' });
  assert.equal(out, `🙋 Nothing is waiting on you.

🎯 Next   build 01 a (with 02)

🗺️ ${path.basename(root)}
   🛠️ 01 a   ▓▓▓░░░  ready to build
   🛠️ 02 bb  ▓▓▓░░░  ready to build

📈 Progress   2 of 2 designed · 0 of 2 built · 0 of 2 live
`);
});

test('runs of briefs in the same resting state collapse to one row, and a brief in motion keeps its own', () => {
  const { out } = status({ stack: true, shipped: ['01', '02', '03'], briefs: { '01': 'done', '02': 'done', '03': 'done', '04': 'done', '07': 'noted' } },
    { 'briefs.md': [...'abcdefgh'].map((c, i) => `- 0${i + 1} ${c}: x.\n`).join('') });
  assert.ok(out.includes(`   ✅ 01–03  live (3 briefs)
   📦 04 d   finished
   ⬜ 05–06  not started (2 briefs)
   🛠️ 07 g   ▓▓▓░░░  ready to build
   ⬜ 08 h   not started
`), out);
});

test('a tidy comes next once every brief is finished and the codebase is not yet tidied', () => {
  const { out } = status({ stack: true, briefs: { '01': 'done' } }, { 'briefs.md': '- 01 a: One.\n' });
  assert.match(out, /🎯 Next   tidy the codebase\n/);
});

test('a brief whose examples changed after approval is listed under Waiting on you', () => {
  const { out } = status({ stack: true, approved: { '01': 'old-hash' }, briefs: { '01': 'done', '02': 'confirmed' } },
    { 'briefs.md': '- 01 a: One.\n- 02 bb: Two.\n' });
  assert.match(out, /└─ your yes again on 01, changed since approval\n\n🎯 Next/);
});
