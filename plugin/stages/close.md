# Close

Report the brief and keep going.

Print, in plain words: what a user can now do, how to see it running, how much the brief
added, and any finding the review left that you chose not to fix. Stop only if the review left an `- [owner]` item that is a product decision:
ask it with your recommendation.

Write one line in `sidekik/lessons.md`: `- NN: ` then the worst moment of this brief (a
correction from the owner, a run that went wrong, something built twice) and the one
change that would have prevented it, or `- NN: nothing to change`. Then fix what allowed
it: a check in the project's check command when one is cheap; otherwise rewrite, in place, the sentence in the project's
`CLAUDE.md` that let it happen. The check lands in a commit of its own, before anything else starts.

Run `state.js mark <NN> done`, land `sidekik/`, then `state.js next`.
