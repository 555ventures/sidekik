# sidekik

Build software with Claude the way a founder works with two partners. You show what you
want through a prototype, and Claude works with you in one of two roles:

- **Product Partner** while the product is shaped: it proposes what the product does and
  how it feels to use, and this phase is a conversation with you.
- **Technical Partner** while it is built: it owns how it is built, the agent team and the
  health of the code, talks to you in plain words, and rarely needs you.

Install:

```
/plugin marketplace add 555ventures/sidekik
/plugin install sidekik@sidekik-tools
```

```
idea → briefs → prototype → stack → build note → build → review → close → ship
```

One pattern runs through all of it, for the prototype and for the product alike: one hand
builds the shared foundation, independent pieces are built in parallel, a machine checks
every piece, fresh eyes check the result once, and one lesson changes what happens next.

A prototype is a set of concrete examples of the product in use, in the form the product
is judged by: screens to click for a product you look at, exchanges to read for one you
talk to (a command-line tool, an API), cases to check for one that works on its own (an
engine, a pipeline). Confirmed examples become the tests.

Claude comes to the owner when a good partner would. Three of those moments are hard gates
in the scripts: the owner's yes on the prototype, their pick of the stack, and their yes
before shipping. The build between them runs unattended and reports as it goes. A bug or a
small tweak skips the stages: it is fixed directly and reported in one line.

Every project also keeps itself clean and learns: a tidy stage is scheduled by the script,
and a mistake that repeats three times must get a machine check.

Two commands: `/sidekik:go` continues from wherever the work stands, `/sidekik:status` shows
where that is. A project also writes down where the plugin itself got in its way, and
`/sidekik:learn`, run in this repo, turns that feedback and the lessons into one change to
the plugin and answers in the project.

## Why it is small

Its predecessors grew to tens of thousands of lines and answered every incident with a new
rule. This one stays small by how it changes, not by a limit. It changes only for a lesson
recorded on a real project. A change rewrites or removes before it adds, and a part that
was already changed once is reshaped, not patched again. A new machine check is earned when
the same lesson appears three times, and every fifth change is a tidy of the plugin itself.
`npm test` prints its size, so growth is seen and never hidden.

## Contract (for whoever builds or changes the plugin)

Everything the plugin knows about a project lives in `sidekik/` in that project, and is
landed with the project's work. Scripts re-read it on every call.

```
sidekik/
  state.json            written only by scripts
  briefs.md             - 01 booking-flow: Clients book in under a minute.
  decisions.md          the owner's rulings; written only by decide.js
  questions/<who>.md    guesses waiting for the owner:  - [open] 01: text
  calls.md              calls Claude made, for the owner to overrule
  handoff.md            where a half-finished stage stands, for the next session
  stack.md              ## Picks, ## Your steps
  model.md              the data design and the product's areas
  lessons.md            - 01: [cause] text   - fix: [cause] text   - guard: [cause] text
  feedback.md           where the plugin itself got in the way:  - [open] stage: text
  prototype/
    INDEX.md            what this is and the rules for anyone adding to it
    kit/                what every example shares, frozen once the foundation is done
    <area>/<example>    a screen (.html), an exchange or a case (any other file type)
    map/<area>.md       | example | brief | status | purpose | links |
    shots/              screenshots, not checked
  build-notes/01-booking-flow.md   at most 60 lines, has "## Reuse" and a "## Done when" list
  reviews/01.md         - [bug] text   becomes   - [fixed] text  or  - [owner] text
```

Line formats, exactly:

- Brief: `- NN slug: sentence` where `NN` is two digits and `slug` is `[a-z0-9-]+`.
- Decision: `- YYYY-MM-DD NN: text`. `NN` is a brief number or `all`.
- Question: `- [open] NN: text`, later `- [answered] NN: text → answer`. `all` in place of
  `NN` counts for every brief.
- Map row: `| area/file.ext | NN | planned or done | purpose | area/other.ext, ... |`. The
  path is relative to `sidekik/prototype/` and has a file extension.
- Lesson: `- NN: [cause] text` for a brief, `- fix: [cause] text` for a bug that escaped,
  `- guard: [cause] text` for the machine check that now refuses that cause. A cause is a
  short tag such as `built-twice`. `[none]` is the cause of a lesson with nothing to change
  and is never counted.
- Feedback: `- [open] stage: text`, later `- [fixed] stage: text → what changed` or
  `- [declined] stage: text → why`. No script reads it: the project's session writes the
  line, and `/sidekik:learn` answers it.

`state.json`:

```json
{ "check": "npm test", "depsCommand": null, "deps": null, "stack": false,
  "kitHash": null, "decisionsHash": null, "approved": { "01": "<hash>" },
  "bases": { "01": "<git sha or null>" },
  "sizes": { "01": { "code": 310, "tests": 60, "removed": 12, "testsRemoved": 0 } },
  "tidied": 0, "tidyBase": null, "shipped": [],
  "history": [ { "brief": "01", "mark": "built", "at": "2026-11-09T10:20:00.000Z" } ],
  "briefs": { "01": "built" } }
```

A missing field in an older state file counts as its empty value.

A brief's value is its last mark. Marks in order, and what each one requires:

| mark | requires |
|---|---|
| `prototyped` | the brief has map rows, all `done`; the prototype check passes; no open question is filed under a number that is not a brief (the refusal says that `NN` is the brief number) |
| `confirmed` | `prototyped`; decisions file untampered; no open question for the brief. Records in `approved` a hash of the brief's mapped files, paths and contents |
| `noted` | `confirmed`; `stack` is true; the brief's mapped files still match `approved`; the build note exists, is at most 60 lines, has a `## Reuse` section and a `## Done when` section with at least one `- ` item. Records the current git commit as the brief's base (null outside a git repo or before the first commit) |
| `built` | `noted`; the brief's mapped files still match `approved`; the library command lists no name missing from `deps`; something was committed since the base (when there is a base), unless another brief was marked `built` after this one was `noted`, which then measured it; the check command exits 0. Records the brief's size, and moves the base of every brief still at `noted` to the current commit |
| `reviewed` | `built`; the review file exists with no `- [bug]` line left; the check command exits 0 |
| `done` | `reviewed`; `lessons.md` has a line `- NN: [cause] ...` for the brief |

When mapped files no longer match `approved`, the refusal says the prototype changed after
the owner approved it and must be shown to them again, and names `reconfirm`.
`reconfirm <NN>` records the hash again without changing the mark, under the same
requirements as `confirmed`. A brief's marks depend only on that brief, so briefs at the
same stage can move in parallel.

Project marks:

- `stack`: every brief is at least `confirmed`; `stack.md` has `## Picks` and `## Your steps`;
  `model.md` exists; a check command is set and exits 0; the project has a commit and
  nothing outside `sidekik/` is uncommitted, so every brief gets a base.
  `init --existing "<check command>"` sets `stack` true at once.
- `tidying`: records the current git commit as `tidyBase` (null outside a git repo).
- `tidied`: `tidyBase` was recorded by `tidying`; the check command exits 0; and no
  cause appears three or more times in `lessons.md` (on brief and fix lines together)
  without a `- guard: [cause]` line. It sets `tidied` to the number of `done` briefs,
  clears `tidyBase`, and prints the lines added and removed since `tidyBase` (when there
  is a base).
- `shipped`: some `done` brief is not yet in `shipped`; `tidied` equals the number of `done`
  briefs; the check command exits 0. It sets `shipped` to every `done` brief.

Every mark attempt, brief or project, appends `{ brief, mark, at }` to `history` (`brief` is
null for a project mark), with `refused: true` when it was refused.

`set-check "<command>"` refuses a command that contains `;`, saying to join the steps with
`&&` so that a failing step fails the whole check.

Libraries, for any language: `set-deps "<command>"` stores a project command that prints one
library name per line, runs it, and records its output as `deps`. `allow <name>` adds one,
after the owner's yes. `built` runs the command again and refuses a name that is not in
`deps`, naming the first one and the `allow` command. With no library command set, this
requirement is skipped.

A brief's size is what was committed since its base, from `git diff --numstat <base> HEAD`:
lines added, split into tests
(a path with a `test`, `tests`, `__tests__`, `spec` or `e2e` folder, or a file name that
contains `.test.`, `.spec.` or `_test.` or starts with `test_`) and code (everything else),
plus the lines removed and how many of those were test lines. Paths under `sidekik/` and
lock files do not count. With no base, no size is recorded and the "something changed"
requirement is skipped. `mark <NN> built` prints the size in one sentence, for example
`It added 71 lines of code and 15 lines of tests, and removed 20 lines, 4 of them tests.`
It then moves the base of every brief still at `noted` to the current commit, so briefs
built in the same wave and landed one commit each are measured and reviewed one by one.

What `next` answers:

| situation | stage |
|---|---|
| no `briefs.md`, or it has no brief lines | `brief` |
| `stack` false and some brief has no mark | `prototype` (the lowest such brief) |
| `stack` false, every brief has a mark, some brief is not `confirmed` | `look` (the lowest such brief) |
| `stack` false and every brief is `confirmed` | `stack` |
| `stack` true, and five or more briefs became `done` since the last tidy, or `tidyBase` is set | `tidy` (no brief) |
| `stack` true: the lowest brief that is not `done` | by its mark: none `prototype`, `prototyped` `look`, `confirmed` `note`, `noted` `build`, `built` `review`, `reviewed` `close` |
| every brief is `done`, and `tidied` is less than the number of `done` briefs | `tidy` (no brief) |
| every brief is `done`, some are not in `shipped` | `ship` (no brief) |
| every brief is `done` and shipped | `idle` |

`next` prints six lines: `Stage:`, `Brief: NN slug: sentence` or `Brief: none`, `Read:` with
the absolute path of the stage file (`none` for idle), `Also at this stage: 02, 03` listing
the other briefs whose own next stage is the same (`none` when there are none),
`Open questions for this brief: N` (`Open questions for all briefs: N` when no brief is
named), and `Base: <sha>` or `Base: none`.

`scripts/status.js` is the progress screen. It derives everything from the same functions
`next` uses, which `state.js` exports, so the two cannot disagree. The screen, exactly:

```
🗺️ Split the bill
   ✅ 01 even-split          ▓▓▓▓▓▓▓  live                           306 code · 60 tests
   🔨 02 drinks-separately   ▓▓▓▓░░░  built                          71 code · 15 tests
   🎨 03 history             ▓▓░░░░░  design approved
   ⬜ 04 share-link          ░░░░░░░  not started
   📦 05 tip-jar             ▓▓▓▓▓▓░  finished

📈 Progress   4 of 5 designed · 3 of 5 built · 1 of 5 live
   Today      02 built · 03 design approved
   So far     2 finished · 38 min from approval to finished · 9 decisions from you · 3 refused steps · 1 bug escaped
   Repeating  built-twice ×3 · wrong-library ×2

🙋 Waiting on you
   ├─ 2 questions on 03 history
   ├─ 1 review question on 02 drinks-separately
   └─ your sign-off to take 05 live

🎯 Next   review 02 drinks-separately — nothing needed from you
```

- Title: the first `# ` heading in `briefs.md`, else the project folder's name.
- Bar: seven cells, one per step reached: `prototyped`, `confirmed`, `noted`, `built`,
  `reviewed`, `done`, and shipped. Slugs are padded to the longest slug and labels to the
  longest possible label, so the columns line up.
- Icon and label: no mark ⬜ `not started`; `prototyped` 🎨 `prototype ready for your look`;
  `confirmed` 🎨 `design approved`; `noted` 🛠️ `ready to build`; `built` 🔨 `built`;
  `reviewed` 🔍 `reviewed`; `done` 📦 `finished`; shipped ✅ `live`.
- Size is shown once recorded.
- Progress: designed counts briefs at `confirmed` or later, built counts `built` or later,
  live counts shipped briefs. With no briefs the roadmap and progress are replaced by one
  line: `🗺️ No briefs yet.`
- Today: each brief's latest successful mark in `history` dated today (local time), as
  `NN label`, joined by ` · `; `nothing yet` when there are none.
- So far, shown once a brief is `done`: the number of `done` briefs; the median whole
  minutes between a brief's `confirmed` and `done` entries in `history`; the number of
  lines in `decisions.md`; the number of refused entries in `history`; the number of
  `- fix:` lines in `lessons.md`.
- Repeating, shown when a cause other than `none` appears twice or more in `lessons.md` on
  brief and fix lines: each such cause with its count, most frequent first.
- Waiting on you, in this order: one line per brief with open questions (`N question(s) on
  NN slug`); `your look at the prototype (01, 02)` when the stage is `look`, listing every
  `prototyped` brief; `your stack picks` when the stage is `stack`; one line per brief whose
  review file has `- [owner]` lines (`N review question(s) on NN slug`); `your sign-off to
  take 01, 02 live` listing `done` briefs not yet shipped, when there are any. Tree
  connectors `├─` and `└─`. With nothing waiting, the section is the single line
  `🙋 Nothing is waiting on you.`
- Next is the last line: `write the brief list`, `prototype NN slug`, `your look at the
  prototype`, `choose the stack`, `build note for NN slug`, `build NN slug`, `review NN
  slug`, `report NN slug`, `tidy the codebase`, `your sign-off to go live`, or `nothing to
  do, everything is live`. When other briefs are at the same stage it adds ` (with 02, 03)`.
  It ends ` — needs you` for the brief, look, stack and ship stages, ` — nothing needed
  from you` for the others, and nothing for idle.

Scripts are CommonJS, Node 22+, no dependencies, and take `--root <dir>` (default: the
current directory) for the project root that holds `sidekik/`.

- `scripts/lib/store.js` exports `dir(root)`, `readState(root)`, `writeState(root, state)`,
  `sha(text)`, `rootFrom(argv)`.
- `scripts/proto-check.js` exports `checkPrototype(root) → { ok, problems: [string] }`,
  `screensFor(root, brief) → [{ screen, status }]`, `freezeKit(root)`.
  CLI: `proto-check.js` prints problems and exits 1 if any, or one line saying it passed
  and how many examples it checked; `proto-check.js freeze`.
- `scripts/decide.js` exports `addDecision(root, brief, text)`, `verifyDecisions(root) → { ok, problems }`,
  `openQuestions(root, brief?) → [string]`. CLI: `decide.js add <NN|all> "<text>"`, `decide.js verify`,
  `decide.js questions [NN]`, and `decide.js seal`, which accepts a hand edit the owner says is
  theirs. `add` refuses while an unaccepted hand edit is in the file.
- `scripts/state.js` CLI: `init [--existing "<cmd>"]`, `next`, `mark <NN> <mark>`,
  `mark stack|tidying|tidied|shipped`, `reconfirm <NN>`, `set-check "<cmd>"`,
  `set-deps "<cmd>"`, `allow <name>`. A refused mark prints the unmet requirement in one
  plain sentence and exits 1.
- `scripts/status.js` CLI: no arguments but `--root`.

The prototype check covers every file under `sidekik/prototype/` except `INDEX.md` and the
`kit/`, `map/` and `shots/` folders. It fails on: a file with no map row (the message shows
what a map row looks like); a `done` map row with no file; kit files that differ from the
frozen hash; a kit stylesheet with an `@import` or a `url(` that points at `http`. For
`.html` files it also fails on: a class the kit css does not define; a `<style>` block; an
inline `style` that sets anything but `top`, `left`, `width`, `height`, `grid-*` or a
`--custom-property`; `alert(`, `confirm(` or `prompt(`; a stylesheet or script loaded from
`http`; a local link whose file is missing.
