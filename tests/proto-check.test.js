'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { checkPrototype, screensFor, freezeKit } = require('../plugin/scripts/proto-check');
const { readState, writeState } = require('../plugin/scripts/lib/store');

const PAGE = (body) => `<!doctype html><html><head>
<link rel="stylesheet" href="../kit/kit.css"><script src="../kit/kit.js"></script></head>
<body>${body}</body></html>`;

// A passing prototype; `files` overrides or adds paths under sidekik/prototype. The case file is free of the HTML rules.
function project(files = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sidekik-proto-'));
  const all = {
    'kit/kit.css': '.card { padding: 1rem; background: url("card.png"); }\n.btn, .btn--primary:hover { color: red; }\n.md\\:flex, .w-1\\/2 { display: flex; }\n',
    'kit/kit.js': 'document.title = document.title;\n',
    'bookings/list.html': PAGE('<div class="card"><a class="btn btn--primary" href="detail.html?id=1#top">Open</a>'
      + '<a href="https://example.com">Help</a><a href="#x">Jump</a>'
      + '<div style="width: 10px; grid-column: 1 / 3; --cols: 7"></div></div>'),
    'bookings/detail.html': PAGE('<a class="btn md:flex w-1/2" href="list.html" onclick="kit.confirm(this)">Back</a>'
      + '<img src="data:image/png;base64,AAAA">'),
    'bookings/cancel.txt': 'Given a booking, cancel <style> confirm(it) shows "Cancelled".\n',
    'INDEX.md': 'A booking app.\n',
    'shots/list.png': 'png',
    'map/bookings.md': '# Bookings\n\n| example | brief | status | purpose | links |\n|---|---|---|---|---|\n'
      + '| bookings/list.html | 01 | done | All bookings | bookings/detail.html |\n'
      + '| bookings/cancel.txt | 01 | done | Cancel a booking | |\n'
      + '| bookings/detail.html | 01 | done | One booking | bookings/list.html |\n'
      + '| bookings/waitlist.html | 02 | planned | Waiting clients | |\n',
    'map/kit-requests.md': '- please add a card-grid class\n',
    ...files,
  };
  for (const [rel, text] of Object.entries(all)) {
    const p = path.join(root, 'sidekik', 'prototype', rel);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, text);
  }
  return root;
}

function fails(root, pattern) {
  const { ok, problems } = checkPrototype(root);
  assert.strictEqual(ok, false);
  assert.ok(problems.some((p) => pattern.test(p)), problems.join('\n'));
}

test('a clean prototype passes and screensFor lists a brief\'s rows', () => {
  // A table in map/ without a brief number, such as a kit request, is not a map.
  const root = project({ 'map/kit-requests-bookings.md': '| class | wanted |\n|---|---|\n| .entry-date | no wrap |\n' });
  assert.deepStrictEqual(checkPrototype(root), { ok: true, problems: [] });
  assert.deepStrictEqual(screensFor(root, '02'), [{ screen: 'bookings/waitlist.html', status: 'planned' }]);
  assert.strictEqual(screensFor(root, '01').length, 3);
});

test('the command line prints one line on a pass, with the number of examples checked', () => {
  const r = spawnSync(process.execPath, [path.join(__dirname, '..', 'plugin', 'scripts', 'proto-check.js'), '--root', project()], { encoding: 'utf8' });
  assert.deepStrictEqual([r.status, r.stdout], [0, 'The prototype check passed on all 3 example(s).\n']);
});

test('no prototype folder is a problem, not a crash', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sidekik-proto-'));
  fails(root, /no prototype yet/);
});

test('a class the kit css does not define fails', () => {
  fails(project({ 'bookings/detail.html': PAGE('<div class="card-grid"></div><a href="list.html">x</a>') }),
    /^bookings\/detail\.html uses the class "card-grid", which the kit does not define\.$/);
});

test('a <style> block fails', () => {
  fails(project({ 'bookings/detail.html': PAGE('<style>p { color: red }</style>') }), /detail\.html has its own <style> block/);
});

test('an inline style setting a disallowed property fails', () => {
  fails(project({ 'bookings/detail.html': PAGE('<p style="width: 2px; color: red">x</p>') }), /detail\.html sets "color"/);
});

test('alert, confirm and prompt fail', () => {
  for (const fn of ['alert', 'confirm', 'prompt', 'window.confirm']) {
    fails(project({ 'bookings/detail.html': PAGE(`<button onclick="${fn}('sure?')">x</button>`) }),
      new RegExp(`pop-up with ${fn.replace('window.', '')}\\(`));
  }
});

test('a stylesheet or script loaded from http fails', () => {
  fails(project({ 'bookings/detail.html': PAGE('<link rel="stylesheet" href="https://cdn.example.com/x.css">') }),
    /loads https:\/\/cdn\.example\.com\/x\.css from the internet/);
  fails(project({ 'bookings/detail.html': PAGE('<script src="http://cdn.example.com/x.js"></script>') }),
    /loads http:\/\/cdn\.example\.com\/x\.js from the internet/);
});

test('a kit stylesheet that imports or points at http fails', () => {
  fails(project({ 'kit/theme.css': '@import "https://fonts.example.com/a.css";\n' }), /^kit\/theme\.css loads https:\/\/fonts\.example\.com\/a\.css from the internet/);
  fails(project({ 'kit/theme.css': '.hero { background: url(http://img.example.com/b.png); }\n' }), /^kit\/theme\.css loads http:\/\/img\.example\.com\/b\.png from the internet/);
});

test('a local link to a missing file fails', () => {
  fails(project({ 'bookings/detail.html': PAGE('<a href="../clients/profile.html#top">x</a>') }),
    /detail\.html links to "\.\.\/clients\/profile\.html#top", which does not exist/);
});

test('a done map row with no file fails', () => {
  fails(project({ 'map/team.md': '| team/staff.html | 03 | done | Staff | |\n' }),
    /map\/team\.md marks team\/staff\.html as done, but that file does not exist/);
});

test('an example of any file type with no map row fails', () => {
  fails(project({ 'bookings/orphan.json': '{}' }), /^bookings\/orphan\.json is not listed in any map file\. A map row looks like: \| area\/file\.ext \| NN \| planned or done \| purpose \| area\/other\.ext, \.\.\. \|$/);
});

test('freezing records the kit hash and a later kit change fails', () => {
  const root = project();
  writeState(root, { check: 'npm test', kitHash: null });
  freezeKit(root);
  const state = readState(root);
  assert.match(state.kitHash, /^[0-9a-f]{64}$/);
  assert.strictEqual(state.check, 'npm test');
  fs.writeFileSync(path.join(root, 'sidekik', 'prototype', 'kit', '.DS_Store'), 'finder');
  assert.strictEqual(checkPrototype(root).ok, true);
  fs.writeFileSync(path.join(root, 'sidekik', 'prototype', 'kit', 'kit.js'), 'changed();\n');
  fails(root, /kit has changed since it was frozen/);
});
