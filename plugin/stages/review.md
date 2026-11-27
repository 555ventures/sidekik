# Review

Dispatch `sidekik:reviewer` once per brief, all at the same time. Give it the brief's own commit (the one after
the base `next` prints), the build note with its "Done when" list, the prototype files,
`sidekik/briefs.md` and the index command. It returns a list, and you save it as
`sidekik/reviews/<NN>.md`.

Then:

- Decide the fix of each `- [bug]` at its cause, several findings with one cause as one
  fix; once it is made, change the line to `- [fixed]`. A finding you will not fix, or that is really a product decision, becomes
  `- [owner]`.
- If you fixed anything, dispatch the reviewer once more over only what the fixes changed,
  with the affected "Done when" items; a fix that changed the structure is reviewed
  whole. That second look is the last: what it finds is fixed, each with a test that
  fails because of it, and nothing is reviewed again or can block.

Run `state.js mark <NN> reviewed`, then land the fixes.
