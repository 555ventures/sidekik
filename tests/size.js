'use strict';
// Prints the plugin's size on every test run. It is a measurement, not a limit.
const fs = require('fs');
const path = require('path');

const plugin = path.join(__dirname, '..', 'plugin');

function bytes(dirs, ext) {
  let total = 0;
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (p.endsWith(ext)) total += fs.statSync(p).size;
    }
  };
  dirs.map((d) => path.join(plugin, d)).forEach(walk);
  return total.toLocaleString('en-US');
}

console.log(`sidekik size: scripts ${bytes(['scripts'], '.js')} bytes · guides ${bytes(['commands', 'stages', 'agents'], '.md')} bytes`);
