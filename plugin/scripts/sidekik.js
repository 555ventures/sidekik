#!/usr/bin/env node
'use strict';
// The command-line entry point: short words for the scripts the owner runs by hand.
const path = require('path');
const { spawnSync } = require('child_process');

const USAGE = `sidekik status             where the work stands
sidekik next               what comes next
sidekik questions [NN]     open questions
sidekik check [freeze]     check the prototype
sidekik state|decide <...>  run that script with the rest
Every form takes --root <dir> (default: the current directory).`;
const [word, ...rest] = process.argv.slice(2);
const ROUTES = {
  status: ['status.js'], next: ['state.js', 'next'], questions: ['decide.js', 'questions'], check: ['proto-check.js'],
  state: ['state.js'], decide: ['decide.js'],
};

if (word === undefined || word === 'help') { console.log(USAGE); process.exit(0); }
if (!ROUTES[word]) { console.error(USAGE); process.exit(1); }
const [script, ...fixed] = ROUTES[word];
const run = spawnSync(process.execPath, [path.join(__dirname, script), ...fixed, ...rest], { stdio: 'inherit' });
process.exit(run.status ?? 1);
