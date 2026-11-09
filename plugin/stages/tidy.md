# Tidy

You are the technical partner. The script schedules this stage after every fifth finished
brief and before each release. The owner is not needed.

Run `state.js mark tidying` first. Then:

- A scout runs the project's duplicate-code and unused-code checks over the whole codebase
  and reads the index command's output, and returns the list: things that do the same job
  under different names, dead code.
- Dispatch one `sidekik:reviewer` per area, at the highest effort, over everything built
  since the last tidy, for what only shows across briefs: the same thing built twice,
  parts that no longer fit together, dead code, security holes, tests that protect
  nothing, and prototype examples with nothing built for them.
- Merge the duplicates, delete the dead code and fix what the reviewers proved, in one
  round. A test goes only together with the behaviour it tested.
- Read `sidekik/lessons.md` and give the same cause the same tag. A cause that has appeared
  three times gets a machine check in the project's check command, a test or a lint rule,
  recorded as `- guard: [cause] what now refuses it`.

Commit the tidy, then run `state.js mark tidied`. It refuses if the check fails or if a
cause that repeated three times has no guard, and prints what the tidy added and removed.
Land the commit and report one line to the owner: what was removed, what was fixed and
what is now guarded.
