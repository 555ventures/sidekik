'use strict';
// A PreToolUse hook with two jobs. One: refuses a Write or Edit on sidekik/state.json, the one
// file only the scripts may write. Two: puts to the owner an Agent call that starts a sidekik: agent
// on a model other than the one its file names, or refuses it where no prompt is shown.
const fs = require('fs');
const path = require('path');

const GUARDED = ['/sidekik/state.json'];
const ASKING_MODES = ['default', 'plan', 'acceptEdits', 'auto'];

// The model named in the frontmatter of the plugin's agent file, or null.
function ownModel(name) {
  if (!/^[a-z0-9-]+$/.test(name)) return null;
  try {
    const file = path.join(__dirname, '..', 'agents', `${name}.md`);
    const front = fs.readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
    return front?.[1].match(/^model:[ \t]*(\S+)[ \t]*$/m)?.[1] ?? null;
  } catch {
    return null;
  }
}

function agentCall(data) {
  const { tool_name: toolName, tool_input: tool, permission_mode: mode } = data;
  const type = tool?.subagent_type;
  const asked = tool?.model;
  if (toolName !== 'Agent' && toolName !== 'Task') return null;
  if (typeof type !== 'string' || !type.startsWith('sidekik:')) return null;
  if (typeof asked !== 'string' || asked === '') return null;
  const name = type.slice('sidekik:'.length);
  const own = ownModel(name);
  if (!own || own.toLowerCase() === asked.toLowerCase()) return null;
  const said = `sidekik:${name} runs on ${own}, the model its file names, and this call names ${asked}.`;
  const asking = ASKING_MODES.includes(mode);
  return {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: asking ? 'ask' : 'deny',
      permissionDecisionReason: asking
        ? `${said} Allow it only if you agreed to that model for this job.`
        : `${said} Start it again without a model. Another model is the owner's decision, and this session's permission mode shows them no prompt: tell them the extra cost, and they can allow it in a mode that asks.`,
    },
  };
}

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  let file = null;
  try {
    const data = JSON.parse(input);
    const verdict = agentCall(data);
    if (verdict) {
      console.log(JSON.stringify(verdict));
      process.exit(0);
    }
    const tool = data.tool_input;
    file = tool?.file_path ?? tool?.notebook_path ?? null;
  } catch {
    // A guard that cannot read its input must not block the work.
  }
  const hit = typeof file === 'string' && GUARDED.find((g) => path.resolve(file).endsWith(g));
  if (!hit) process.exit(0);
  console.error(`sidekik/${path.basename(hit)} is written only by the plugin's scripts. Run the script instead of editing the file.`);
  process.exit(2);
});
