---
description: Turn lessons from real projects into one change to this plugin
argument-hint: "<path to a project that uses sidekik> [more paths]"
---

Run this inside the sidekik repo. Projects: $ARGUMENTS.

Read `sidekik/lessons.md` and `sidekik/calls.md` in each project, and the `So far` and
`Repeating` lines of its progress screen. Pick the one lesson that cost the owner the most:
a cause that repeats across briefs or projects, the most corrections, or a bug that
escaped. The plugin changes only for a lesson from real use, never for an idea.

Make one change that would have prevented it:

1. A check in a script, once the same lesson has appeared three times.
2. Until then, an edit in place to the sentence in a stage file that let it happen.
3. Removing a rule that did not help.

Never append a rule beside the old ones: a change to a guide rewrites or removes a
sentence before it adds one. There is no size limit to fit under, and size is never a
question for the owner. `npm test` prints the plugin's size, so growth is seen. A change
to how the plugin
treats the owner (what it asks, when it stops, what it decides alone) is theirs to make:
describe it in `PROPOSALS.md` with your recommendation and leave the plugin as it is.

Run `npm test`. Any other change lands now: commit it with the lesson quoted in the message.

After every tenth lesson, and when a new model arrives, the change is a removal: find the
rule the lessons never needed, or the model no longer needs, and delete it.
