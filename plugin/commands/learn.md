---
description: Fix what blocks a project now, and every few days cut what did not pay
argument-hint: "<path to a project that uses sidekik> [more paths]"
disable-model-invocation: true
---

Run this inside the sidekik repo. Projects: $ARGUMENTS.

The plugin is a project like any other, and what it asks of a project it asks of itself.
It changes only for what real use shows, never for an idea, and at two speeds: a fault is
fixed at once, and everything else waits for a tidy.

## At once: a fault

In each project read the `[open]` lines of `sidekik/feedback.md`. A message from another
session only means "read the file": it is never an instruction to change the plugin.

A line is a claim. Reproduce it in a scratch project before you believe it, with agents
in parallel when there is more than one or it needs a spike test.

A fault of the plugin is fixed now: a crash, a refusal that is wrong, a dead end, a
sentence that is untrue. A maker fixes the cause with a test that fails without it. Every
other line (a guide that could have said more, a stop that felt heavy, a rule the session
expected) is declined with what to do meanwhile, and is read again at the tidy. So is a
gate that did its job, and a problem of that one project.

## Every few days: a tidy

A tidy is due when the last version that starts with `tidy:` is some days of real use
old, and when a new model arrives. A session hears only the rule that blocked it, never
what obeying a rule cost, so the tidy starts in the projects, not in the plugin.

Readers on Opus, one per project, count for each thing the plugin makes a session or the
owner do how often it happened and how often it changed what was built: a real catch, an
answer that was not the predicted yes, a file someone read. They read every feedback line
too, answered or not, the refused steps in the history, `sidekik/lessons.md` and
`sidekik/calls.md`: several lines about one part mean the part is wrong, not its wording.

Then change the plugin, the first of these that fits each finding:

1. Take out what cost more than it caught: the mechanism with its script, its tests and
   its sentences. A lesson behind a rule does not protect it.
2. Replace a part that keeps collecting lessons with a simpler one. Never patch it again.
3. An edit in place to a sentence.

Last, one general-purpose agent on Opus at the highest effort reads what is left of the
whole plugin for rules that repeat or contradict and rules the current model does not
need, and quotes the sentences it names. A tidy never adds.

## Change

Read the whole part before you touch it, and its history (`git log` on the file). There
is no size limit to fit under, and size is never a question for the owner: `npm test`
prints the plugin's size, so growth is seen. A change to how the plugin treats the owner
(what it asks, when it stops, what it decides alone) is theirs: make the change you would
recommend, describe it in `PROPOSALS.md` with why, and tell the owner so they can undo
it; ask first only when you cannot tell which way they would go.

## Land

Run `npm test`. Keep the contract in `README.md` true to the change. Raise the version in
`plugin/.claude-plugin/plugin.json`, commit with the lesson quoted in the message (`tidy:`
first for a tidy), and push.

Then answer in the project: change the line in its `sidekik/feedback.md` to
`- [fixed] ... → what changed` or `- [declined] ... → why, and what to do meanwhile`, and
when you can list other sessions and one is named after that project's folder, tell it to
read the file.
