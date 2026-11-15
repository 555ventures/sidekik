# Close

Report the brief and keep going.

Print, in plain words: what a user can now do, how to see it running, how much the brief
added, and the calls you made on it. Stop if the review left an `- [owner]` item: ask it
with your recommendation.

Write one line in `sidekik/lessons.md`: `- NN: ` then the worst moment of this brief (a
correction from the owner, a run that went wrong, something built twice) and the one
change that would have prevented it, or `- NN: nothing to change`. Then fix what allowed
it: a check in the project's check command when one is cheap, since a sentence never
reaches what is already built; otherwise rewrite, in place, the sentence in the project's
`CLAUDE.md` that let it happen. That check is product code written after the review: it
lands in a commit of its own as soon as the project's check passes, before anything else
starts.

Run `state.js mark <NN> done`, land `sidekik/`, then `state.js next`.
