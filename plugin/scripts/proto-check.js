'use strict';
// Checks the prototype in sidekik/prototype so parallel example authors stay on one kit and one map.
const fs = require('fs');
const path = require('path');
const { dir, readState, writeState, sha, rootFrom } = require('./lib/store');

const protoDir = (root) => path.join(dir(root), 'prototype');
const kitDir = (root) => path.join(protoDir(root), 'kit');

function walk(base, sub = '') {
  const out = [];
  for (const e of fs.readdirSync(path.join(base, sub), { withFileTypes: true })) {
    if (e.name.startsWith('.')) continue; // .DS_Store appears when a person opens the folder
    const rel = sub ? `${sub}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...walk(base, rel));
    else out.push(rel);
  }
  return out.sort();
}

const exampleFiles = (root) => walk(protoDir(root)).filter((f) => f !== 'INDEX.md' && !/^(kit|map|shots)\//.test(f));

function kitHash(root) {
  const kit = kitDir(root);
  if (!fs.existsSync(kit)) return sha('');
  return sha(walk(kit).map((f) => `${f}\0${fs.readFileSync(path.join(kit, f), 'utf8')}\0`).join(''));
}

function mapRows(root) {
  const mapDir = path.join(protoDir(root), 'map');
  if (!fs.existsSync(mapDir)) return [];
  const rows = [];
  for (const f of fs.readdirSync(mapDir).filter((n) => n.endsWith('.md')).sort()) {
    for (const line of fs.readFileSync(path.join(mapDir, f), 'utf8').split('\n')) {
      if (!line.trim().startsWith('|')) continue;
      const cells = line.split('|').slice(1, -1).map((c) => c.trim());
      if (!/\.\w+$/.test(cells[0]) || !/^\d\d$/.test(cells[1] ?? '')) continue;
      rows.push({ map: `map/${f}`, screen: cells[0], brief: cells[1], status: cells[2] });
    }
  }
  return rows;
}

function screensFor(root, brief) {
  return mapRows(root)
    .filter((r) => r.brief === brief)
    .map(({ screen, status }) => ({ screen, status }));
}

const kitSheets = (root) => (fs.existsSync(kitDir(root)) ? walk(kitDir(root)) : [])
  .filter((n) => n.endsWith('.css'))
  .map((f) => ({ f, css: fs.readFileSync(path.join(kitDir(root), f), 'utf8') }));

function kitClasses(sheets) {
  const classes = new Set();
  for (const { css } of sheets) {
    // Escapes such as .md\:flex or .w-1\/2 name the classes md:flex and w-1/2.
    for (const m of css.matchAll(/\.(-?(?:[_a-zA-Z]|\\.)(?:[\w-]|\\.)*)/g)) classes.add(m[1].replace(/\\(.)/g, '$1'));
  }
  return classes;
}

const ALLOWED_STYLE = /^(top|left|width|height|grid-[\w-]+|--[\w-]+)$/;
const NOT_LOCAL = /^(https?:|mailto:|tel:|data:|#|javascript:)/i;

function checkHtml(proto, screen, classes) {
  const problems = [];
  const html = fs.readFileSync(path.join(proto, screen), 'utf8');

  const unknown = new Set();
  for (const m of html.matchAll(/\sclass\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) {
    for (const c of (m[1] ?? m[2]).split(/\s+/).filter(Boolean)) {
      if (!classes.has(c)) unknown.add(c);
    }
  }
  for (const c of unknown) {
    problems.push(`${screen} uses the class "${c}", which the kit does not define.`);
  }

  if (/<style[\s>]/i.test(html)) {
    problems.push(`${screen} has its own <style> block; all styling belongs in the kit.`);
  }

  for (const m of html.matchAll(/\sstyle\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) {
    for (const decl of (m[1] ?? m[2]).split(';')) {
      const prop = decl.split(':')[0].trim().toLowerCase();
      if (prop && !ALLOWED_STYLE.test(prop)) {
        problems.push(`${screen} sets "${prop}" in an inline style; only top, left, width, height, grid-* and --custom properties may be set there.`);
      }
    }
  }

  // A kit helper such as kit.confirm( is not a browser pop-up; window.confirm( is.
  for (const m of html.matchAll(/(?<![.\w])(?:window\.)?(alert|confirm|prompt)\(/g)) {
    problems.push(`${screen} opens a browser pop-up with ${m[1]}(); use the kit's own messages instead.`);
  }

  for (const m of html.matchAll(/<(link|script)\b[^>]*>/gi)) {
    const tag = m[0];
    const isSheet = m[1].toLowerCase() === 'script' || /stylesheet/i.test(tag);
    const url = /\s(?:href|src)\s*=\s*["'](https?:[^"']*)["']/i.exec(tag);
    if (isSheet && url) {
      problems.push(`${screen} loads ${url[1]} from the internet; stylesheets and scripts must come from the kit.`);
    }
  }

  for (const m of html.matchAll(/\s(?:href|src)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) {
    const link = m[1] ?? m[2];
    // Strip ?query and #hash before resolving; an empty remainder points at the page itself.
    const target = link.split(/[?#]/)[0];
    if (NOT_LOCAL.test(link.trim()) || !target) continue;
    if (!fs.existsSync(path.resolve(proto, path.dirname(screen), target))) {
      problems.push(`${screen} links to "${link}", which does not exist.`);
    }
  }
  return problems;
}

function checkPrototype(root) {
  const proto = protoDir(root);
  if (!fs.existsSync(proto)) {
    return { ok: false, problems: ['There is no prototype yet: the folder sidekik/prototype does not exist.'] };
  }
  const problems = [];
  const sheets = kitSheets(root);
  for (const { f, css } of sheets) {
    for (const m of css.matchAll(/(?:@import\s*(?:url\()?|url\()\s*["']?(https?:[^"')\s;]+)/gi)) {
      problems.push(`kit/${f} loads ${m[1]} from the internet; the kit must work without it.`);
    }
  }
  const classes = kitClasses(sheets);
  const examples = exampleFiles(root);
  for (const f of examples.filter((e) => e.endsWith('.html'))) problems.push(...checkHtml(proto, f, classes));

  const rows = mapRows(root);
  for (const r of rows) {
    if (r.status === 'done' && !fs.existsSync(path.join(proto, r.screen))) {
      problems.push(`${r.map} marks ${r.screen} as done, but that file does not exist.`);
    }
  }
  const mapped = new Set(rows.map((r) => r.screen));
  for (const f of examples) {
    if (!mapped.has(f)) problems.push(`${f} is not listed in any map file. A map row looks like: | area/file.ext | NN | planned or done | purpose | area/other.ext, ... |`);
  }

  const state = readState(root);
  if (state && state.kitHash && state.kitHash !== kitHash(root)) {
    problems.push('The kit has changed since it was frozen: undo the change, or run proto-check.js freeze if you decided it.');
  }
  return { ok: problems.length === 0, problems };
}

function freezeKit(root) {
  writeState(root, { ...readState(root), kitHash: kitHash(root) });
}

if (require.main === module) {
  const { root, args } = rootFrom(process.argv);
  if (args.includes('freeze')) {
    freezeKit(root);
    console.log('The kit is frozen.');
  } else {
    const { ok, problems } = checkPrototype(root);
    for (const p of problems) console.log(p);
    if (ok) console.log(`The prototype check passed on all ${exampleFiles(root).length} example(s).`);
    process.exit(ok ? 0 : 1);
  }
}

module.exports = { checkPrototype, screensFor, freezeKit };
