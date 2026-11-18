'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { spawnSync } = require('child_process');

const script = path.join(__dirname, '..', 'plugin', 'scripts', 'guard.js');
const guard = (input) => spawnSync(process.execPath, [script], { input, encoding: 'utf8' });

test('the guard refuses a write to the file only the scripts may write', () => {
  const r = guard(JSON.stringify({ tool_input: { file_path: '/work/app/sidekik/state.json' } }));
  assert.equal(r.status, 2);
  assert.match(r.stderr, /^sidekik\/state\.json is written only by the plugin's scripts\. Run the script instead of editing the file\.\n$/);
});

const call = (tool, input, mode) => guard(JSON.stringify({
  tool_name: tool, tool_input: input, ...(mode && { permission_mode: mode }),
}));
const said = 'sidekik:maker runs on sonnet, the model its file names, and this call names opus.';
const decision = (r) => JSON.parse(r.stdout).hookSpecificOutput;

test('the guard puts a stronger model on a sidekik agent to the owner where a prompt shows', () => {
  for (const tool of ['Agent', 'Task']) {
    const r = call(tool, { subagent_type: 'sidekik:maker', model: 'opus' }, 'default');
    assert.equal(r.status, 0);
    assert.deepEqual(decision(r), {
      hookEventName: 'PreToolUse',
      permissionDecision: 'ask',
      permissionDecisionReason: `${said} Allow it only if you agreed to the stronger model and its cost for this job.`,
    });
  }
});

test('the guard refuses it where the permission mode shows no prompt', () => {
  const reason = `${said} Start it again without a model. Another model is the owner's decision, and this session's permission mode shows them no prompt: tell them the extra cost, and they can allow it in a mode that asks.`;
  for (const mode of ['bypassPermissions', undefined]) {
    const r = call('Agent', { subagent_type: 'sidekik:maker', model: 'opus' }, mode);
    assert.equal(r.status, 0);
    assert.equal(decision(r).permissionDecision, 'deny');
    assert.equal(decision(r).permissionDecisionReason, reason);
  }
});

test('the guard says nothing on a call that keeps the agent on its own model or is not ours', () => {
  const quiet = [
    { subagent_type: 'sidekik:maker', model: 'sonnet' },
    { subagent_type: 'sidekik:maker', model: 'Sonnet' },
    { subagent_type: 'sidekik:maker' },
    { subagent_type: 'general-purpose', model: 'opus' },
    { subagent_type: 'sidekik:nope', model: 'opus' },
    { subagent_type: 'sidekik:../x', model: 'opus' },
  ];
  for (const input of quiet) {
    const r = call('Agent', input, 'default');
    assert.equal(r.status, 0);
    assert.equal(r.stdout, '');
  }
});

test('the guard lets other files through, and never blocks on input it cannot read', () => {
  assert.equal(guard(JSON.stringify({ tool_input: { file_path: '/work/app/sidekik/briefs.md' } })).status, 0);
  assert.equal(guard('').status, 0);
  assert.equal(guard('not json').status, 0);
});
