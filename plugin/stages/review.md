# Review

One review per brief, by someone who did not see it built.

Dispatch `sidekik:reviewer` once per brief. Give it the brief's base commit (`next` prints
it), the build note with its "Done when" list, the prototype files, the decision log and
the index command. It returns a list, and you save it as `sidekik/reviews/<NN>.md`.

Then:

- Check each `- [bug]` yourself and decide the fix at its cause; once it is made, change
  the line to `- [fixed]`. A finding you will not fix, or that is really a product
  decision, becomes `- [owner]`.
- Apply a `- [cut]` only if the check command still passes afterwards.
- Run the check command. If you fixed anything, dispatch the reviewer once more over only
  what the fixes changed, with the affected "Done when" items, and a maker fixes what it
  proves. Nothing else in the brief is reviewed again or can block.

That ends the review of this brief.

Run `state.js mark <NN> reviewed`, then land the fixes.
