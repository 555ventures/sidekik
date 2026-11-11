# Tidy

Run `state.js mark tidying` first. Then:

- Dispatch one `sidekik:reviewer` per area, at the highest effort, over everything built
  since the last tidy, for what only shows across briefs: the same thing built twice,
  parts that no longer fit together, dead code, security holes, tests that protect
  nothing, and prototype examples with nothing built for them.
- Makers fix what the reviewers proved. Findings that overturn a ruling go to the owner in
  one batch while the rest proceeds; their yes is recorded per brief and `reconfirm` run.
- Read `sidekik/lessons.md` and give the same cause the same tag. A cause that has appeared
  three times gets a machine check in the project's check command, a test or a lint rule,
  recorded as `- guard: [cause] what now refuses it`.

Commit the tidy, then run `state.js mark tidied`. Land the commit and report one line to
the owner: what was removed, what was fixed and what is now guarded.
