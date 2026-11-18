# Tidy

Run `state.js mark tidying` first. Then:

- Dispatch one `sidekik:reviewer` per area, at the highest effort, over everything built
  since the last tidy, for what only shows across briefs: the same thing built twice,
  parts that no longer fit together, dead code, security holes, tests that protect
  nothing, and prototype examples with nothing built for them.
- Findings with one cause are fixed once, at that cause, by makers at the same time.

Commit the tidy, then run `state.js mark tidied`. Land the commit and report one line to
the owner: what was removed and what was fixed.
