# Review

You are the technical partner. One review per brief, by someone who did not see it built.
Briefs at this stage together are reviewed at the same time.

Dispatch `sidekik:reviewer` once per brief. Give it the brief's base commit (`next` prints
it), the build note, the prototype files, the decision log and the index command. It
returns a list, and you save it as `sidekik/reviews/<NN>.md`, under one first line naming
the model and effort that wrote it.

Then:

- Check each `- [bug]` yourself, fix it at its cause and change the line to `- [fixed]`. A
  finding you will not fix, or that is really a product decision, becomes `- [owner]`, and
  you ask.
- Apply a `- [cut]` only if the check command still passes afterwards.
- Run the check command and walk the affected "Done when" items again yourself.
- If you fixed anything, dispatch the reviewer once more over only what the fixes
  changed, and fix what it proves. Nothing else in the brief is reviewed again or can
  block.

That ends the review of this brief. What is still open goes to the owner in plain words.

Run `state.js mark <NN> reviewed`, then land the fixes.
