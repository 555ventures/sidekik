'use strict';
// A PreToolUse hook: refuses a Write or Edit on the two files only the scripts may write.
const path = require('path');

const GUARDED = ['/sidekik/state.json', '/sidekik/decisions.md'];

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  let file = null;
  try {
    const { tool_input: tool } = JSON.parse(input);
    file = tool?.file_path ?? tool?.notebook_path ?? null;
  } catch {
    // A guard that cannot read its input must not block the work.
  }
  const hit = typeof file === 'string' && GUARDED.find((g) => path.resolve(file).endsWith(g));
  if (!hit) process.exit(0);
  console.error(`sidekik/${path.basename(hit)} is written only by the plugin's scripts. Run the script instead of editing the file.`);
  process.exit(2);
});
