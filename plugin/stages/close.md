# Close

Report the brief and keep going.

Print, in plain words: what a user can now do, how to see it running, how much the brief
added, and the calls you made on it (from `sidekik/calls.md`). Stop only if the review left
an `- [owner]` item: ask it with your recommendation.

Write one line in `sidekik/lessons.md`: `- NN: [cause] ` then the worst moment of this brief
(a correction from the owner, a run that went wrong, something built twice) and the one
change that would have prevented it. Reuse a cause tag already in the file when the cause
is the same. Then fix what allowed it: a check in the project's check command when one is
cheap, since a sentence never reaches what is already built; otherwise rewrite, in place,
the sentence in the project's `CLAUDE.md` that let it happen. `- NN: [none] nothing to
change` is a valid lesson.

Run `state.js mark <NN> done`, land `sidekik/`, then `state.js next`.
