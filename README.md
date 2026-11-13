# sidekik

Build software with Claude the way a founder works with two partners. You show what you
want through a prototype, and Claude works with you in one of two roles:

- **Product Partner** while the product is shaped: it proposes what the product does and
  how it feels to use, and this phase is a conversation with you.
- **Technical Partner** while it is built: it owns the agent team and the health of the
  code, builds what you decided, talks to you in plain words, and rarely needs you.

Install, in Claude Code:

```
/plugin marketplace add 555ventures/sidekik
/plugin install sidekik@sidekik-tools
```

Then, in any project folder, `/sidekik:go <your idea>` starts the work and `/sidekik:go`
continues it. From a shell, `sidekik status` shows where things stand; the command appears
by itself after the first session with the plugin. On a machine that already has the
plugin, `/plugin marketplace update sidekik-tools` brings the newest version.

The same marketplace holds `style`, an optional plugin that makes Claude reply outcome
first, in plain English, with a work queue at the end: `/plugin install style@sidekik-tools`.

```
idea → briefs → prototype → look → stack → build note → build → review → close → ship
```

One pattern runs through all of it, for the prototype and for the product alike: one hand
builds the shared foundation, independent pieces are built in parallel, a machine checks
every piece, fresh eyes check the result once, and one lesson changes what happens next.

A prototype is a set of concrete examples of the product in use, in the form the product
is judged by: screens to click for a product you look at, exchanges to read for one you
talk to (a command-line tool, an API), cases to check for one that works on its own (an
engine, a pipeline). Confirmed examples become the tests.

Claude comes to the owner when a good partner would. Several of those moments stop the
work until the owner answers; four are held by the scripts, each needing the owner's yes
recorded as a decision: the brief list, each brief's prototype, a yes at the stack and
going live (the marks table says exactly what each accepts). The build between them runs
unattended and reports as it goes. A bug or a small tweak skips the
stages: it is fixed directly and reported in one line.

Every project also keeps itself clean and learns: a tidy stage is scheduled by the script,
and a mistake that repeats three times must get a machine check.

A project also writes down where the plugin itself got in its way, and `/sidekik:learn`,
run in this repo, turns that feedback and the lessons into one change to the plugin and
answers in the project.

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
  questions/<area>.md   guesses waiting for the owner:  - [open] 01: text
  calls.md              calls Claude made, for the owner to overrule
  handoff.md            where the work stands, for the next session
  stack.md              ## Picks, ## Your steps
  model.md              the data design and the product's areas
  lessons.md            - 01: [cause] text   - fix: [cause] text   - guard: [cause] text
  feedback.md           where the plugin itself got in the way:  - [open] stage: text
  prototype/
    INDEX.md            what this is and the rules for anyone adding to it
    kit/                what every example shares, frozen once the foundation is done
    <area>/<example>    a screen (.html), an exchange or a case (any other file type)
    map/<area>.md       | example | brief | status | purpose | links |
    sample/             shared and per-area sample data, neither kit nor example
    shots/              screenshots, candidates, the flows page and the scripts that make them; not checked
  build-notes/01-booking-flow.md   at most 60 lines, has "## Reuse" and a "## Done when" list
  reviews/01.md         - [bug] text   becomes   - [fixed] text  or  - [owner] text
```

A PreToolUse hook (`hooks/hooks.json`, `scripts/guard.js`) refuses Write and Edit on
`state.json` and `decisions.md`; edits made through the shell are not caught. `hooks.json`
also runs `scripts/install.js` at session start.

Line formats, exactly:

- Brief: `- NN slug: sentence` where `NN` is two digits and `slug` is `[a-z0-9-]+`.
- Decision: `- YYYY-MM-DD NN: text`. `NN` is a brief number or `all`.
- Question: `- [open] NN: text`, later `- [answered] NN: text → answer`, or
  `- [settled] NN: text → choice` when the partner settled it without the owner. `all` in place of
  `NN` counts for every brief. `decide.js answer <NN|all> "<match>" "<answer>"` does the rewrite
  and records the decision in one step.
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
{ "check": "npm test", "depsCommand": null, "deps": null, "stack": false, "briefed": false,
  "kitHash": null, "decisionsHash": null, "approved": { "01": "<hash>" }, "approvals": { "01": { "count": 3 } },
  "bases": { "01": "<git sha or null>" },
  "sizes": { "01": { "code": 310, "tests": 60, "removed": 12, "testsRemoved": 0 } },
  "tidied": 0, "tidyBase": null, "shipped": [],
  "history": [ { "brief": "01", "mark": "built", "at": "2026-11-09T10:20:00.000Z", "decisions": 3 } ],
  "briefs": { "01": "built" } }
```

A missing field in an older state file counts as its empty value.

A brief's value is its last mark. Marks in order, and what each one requires:

| mark | requires |
|---|---|
| `prototyped` | the brief has map rows, all `done`; the prototype check passes; no open question is filed under a number that is not a brief (the refusal says that `NN` is the brief number) |
| `confirmed` | `prototyped`; decisions file untampered; no open question for the brief; a decision for exactly this brief (not `all`) recorded after its last `prototyped` mark. Records in `approved` a hash of the brief's mapped files, paths and contents, and in `approvals` how many decisions the file holds |
| `noted` | `confirmed`; `stack` is true; the brief's mapped files still match `approved`; the build note exists, is at most 60 lines, has a `## Reuse` section and a `## Done when` section with at least one `- ` item. Records the current git commit as the brief's base (null outside a git repo or before the first commit) |
| `built` | `noted`; the library command lists no name missing from `deps`; something was committed since the base (when there is a base), unless another brief was marked `built` after this one was `noted`, which then measured it; the check command exits 0. Records the brief's size, and moves the base of every brief still at `noted` to the current commit |
| `reviewed` | `built`; the review file exists with no `- [bug]` line left; when it holds a `- [fixed]` or `- [cut]` line, the check command exits 0 |
| `done` | `reviewed`; the brief's mapped files still match `approved`; `lessons.md` has a line `- NN: [cause] ...` for the brief |

When mapped files no longer match `approved`, the refusal says the prototype changed after
the owner approved it and must be shown to them again, and names `reconfirm`.
`reconfirm <NN>` records the hash again without changing the mark, under the same
requirements as `confirmed`, and it also needs a decision for that brief recorded after the
last approval, so a changed prototype is never approved again on the old yes. Briefs at the
same stage can move in parallel.

Project marks:

- `briefed`: `briefs.md` has brief lines and an `all` decision exists (the owner's yes on the list). It sets `briefed` true.
- `stack`: every brief is at least `confirmed`; `stack.md` has `## Picks` and `## Your steps`;
  `model.md` exists; an `all` decision is recorded after the latest `confirmed`
  mark of any brief, or after the latest `reopen stack` when that is later; a check
  command is set and exits 0; the project has a commit and nothing outside `sidekik/` is
  uncommitted, so every brief gets a base.
  `init --existing "<check command>"` sets `stack` true at once.
- `tidying`: records the current git commit as `tidyBase` (null outside a git repo).
- `tidied`: `tidyBase` was recorded by `tidying`; the check command exits 0; and no
  cause appears three or more times in `lessons.md` (on brief and fix lines together)
  without a `- guard: [cause]` line. It sets `tidied` to the number of `done` briefs,
  clears `tidyBase`, and prints the lines added and removed since `tidyBase` (when there
  is a base).
- `shipped [NN ...]`: each named brief (default: every `done` brief not yet shipped) is `done` and has a decision for it recorded after its `done` mark. Adds them to `shipped`.

Every mark attempt, brief or project, appends `{ brief, mark, at, decisions }` to `history`
(`brief` is null for a project mark; `decisions` is how many decisions the file held at that
moment, and an older entry without it counts as 0), with `refused: true` when it was
refused.
`reopen stack` (refused while `stack` is false) sets `stack` false and appends
`{ brief: null, mark: 'stack', reopen: true, at, decisions }`, so `next` goes back to the
stack stage.

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
| no `briefs.md`, or it has no brief lines, or `briefed` is false and no brief has a mark | `brief` |
| `stack` false and some brief has no mark | `prototype` (the lowest such brief) |
| `stack` false, every brief has a mark, some brief is not `confirmed` | `look` (the lowest such brief) |
| `stack` false and every brief is `confirmed` | `stack` |
| `stack` true, and `tidyBase` is set, or five or more briefs became `done` since the last tidy and no brief is `noted`, `built` or `reviewed` | `tidy` (no brief) |
| `stack` true: of the briefs not `done`, the one furthest along, the lowest number among equals | by its mark: none `prototype`, `prototyped` `look`, `confirmed` `note`, `noted` `build`, `built` `review`, `reviewed` `close` |
| every brief is `done`, and `tidied` is less than the number of `done` briefs | `tidy` (no brief) |
| every brief is `done`, some are not in `shipped` | `ship` (no brief) |
| every brief is `done` and shipped | `idle` |

`next` prints six lines: `Stage:`, `Brief: NN slug: sentence` or `Brief: none`, `Read:` with
the absolute path of the stage file (`none` for idle) and the plugin version, as
`(sidekik <version>)`, `Also at this stage: 02, 03` listing
the other briefs whose own next stage is the same (`none` when there are none),
`Open questions for this brief: N` (`Open questions for all briefs: N` when no brief is
named), and `Base: <sha>` or `Base: none`.
When any brief with an `approved` hash has mapped files that no longer match it (finished
briefs included), `next` adds a last line `Changed since approval: 01, 02`, and
`status.js` lists them under Waiting on you as `your yes again on 01, 02, changed since
approval`.

`scripts/status.js` is the progress screen. It derives everything from the same functions
`next` uses, which `state.js` exports, so the two cannot disagree. The screen, exactly:

```
🙋 Waiting on you
   ├─ 1 question on the whole product
   ├─ 2 questions on 03 history
   ├─ 1 review question on 02 drinks-separately
   └─ your sign-off to take 05 live

🎯 Next   review 02 drinks-separately

🗺️ Split the bill
   ✅ 01 even-split         live
   🔨 02 drinks-separately  ▓▓▓▓░░  built
   🎨 03 history            ▓▓░░░░  design approved
   🎨 04 share-link         ░░░░░░  prototyping, 1 of 2 examples
   📦 05 tip-jar            finished

📈 Progress   4 of 5 designed · 3 of 5 built · 1 of 5 live · 38 min from your yes to finished
```

- Order: Waiting on you, a blank line, Next, a blank line, the roadmap (a title line, then
  one row per brief or run of briefs), a blank line, Progress. With no briefs the roadmap is
  the single line `🗺️ No briefs yet.` and there is no Progress line.
- Waiting on you, in this order: `your yes on the brief list` when the stage is `brief`; one line for open questions filed under `all` (`N question(s) on the
  whole product`), counted once; one line per brief with open questions filed under that
  brief's number (`N question(s) on NN slug`); `your look at the prototype (01, 02)` when the stage is `look`, listing every
  `prototyped` brief; `your stack picks` when the stage is `stack`; one line per brief whose
  review file has `- [owner]` lines (`N review question(s) on NN slug`); `your sign-off to
  take 01, 02 live` listing `done` briefs not yet shipped, when there are any; `your yes again on 01, 02, changed since approval` when approved briefs changed. Tree
  connectors `├─` and `└─`. With nothing waiting, the section is the single line
  `🙋 Nothing is waiting on you.`
- Next: `agree the brief list`, `prototype NN slug`, `your look at the
  prototype`, `choose the stack`, `build note for NN slug`, `build NN slug`, `review NN
  slug`, `report NN slug`, `tidy the codebase`, `your sign-off to go live`, or `nothing to
  do, everything is live`. When other briefs are at the same stage it adds ` (with 02, 03)`.
- Roadmap: the title line is `🗺️` and the first `# ` heading in `briefs.md`, else the project
  folder's name. Rows follow the brief order: three spaces, the icon, the label padded to the
  longest label shown, two spaces, the tail. A resting state collapses: ✅ `live` (shipped),
  📦 `finished` (`done`) and ⬜ `not started` (no mark). A run of two or more consecutive briefs
  in the same resting state is one row labelled `NN–MM` with the tail `live (11 briefs)`,
  `finished (2 briefs)` or `not started (4 briefs)`; a run of one is a normal `NN slug` row with
  the bare tail. Every brief in motion gets its own row: 🎨 `prototyping`, 🎨 `prototype ready
  for your look` (`prototyped`), 🎨 `design approved` (`confirmed`), 🛠️ `ready to build`
  (`noted`), 🔨 `built`, 🔍 `reviewed`. Its tail is a six-cell bar, one ▓ for each mark reached
  (prototyped, confirmed, noted, built, reviewed, done), padded with ░, then two spaces and the
  label. A brief with no mark but rows on the prototype map is `prototyping`: its bar is six
  ░ and its label is `prototyping, D of M examples`, done rows of all rows.
- Progress: designed counts briefs at `confirmed` or later, built counts `built` or later,
  live counts shipped briefs. Once a `done` brief has both `confirmed` and `done` entries in
  `history`, it adds ` · 38 min from your yes to finished`: the median whole minutes between
  them, written `5 h 34 min` from 60 minutes up.

Scripts are CommonJS, Node 22+, no dependencies, and take `--root <dir>` (default: the
current directory) for the project root that holds `sidekik/`.

The shell command appears by itself after the first session with the plugin (see
`scripts/install.js` below; `npm install -g <checkout>` is the alternative). Then `sidekik status`, `sidekik next`,
`sidekik questions [NN]` and `sidekik check [freeze]` run the scripts below, and
`sidekik state|decide <...>` passes the rest to that script. `sidekik help` lists them;
`--root <dir>` goes after the word. `sidekik status` clears the terminal first when its
output is one; piped output is left plain.

- `scripts/lib/store.js` exports `dir(root)`, `readState(root)`, `writeState(root, state)`,
  `read(root, rel) → text or null` (a file under `sidekik/`), `sha(text)`,
  `day(at?) → YYYY-MM-DD` (local time), `rootFrom(argv) → { root, args }` (`args` without
  `--root <dir>`).
- `scripts/proto-check.js` exports `checkPrototype(root) → { ok, problems: [string] }`,
  `screensFor(root, brief) → [{ screen, status }]`, `freezeKit(root)`.
  CLI: `proto-check.js` prints problems and exits 1 if any, or one line saying it passed
  and how many examples it checked; `proto-check.js freeze`.
- `scripts/decide.js` exports `verifyDecisions(root) → { ok, problems }`,
  `decisionsFor(root, ...briefs) → [{ date, brief, text }]`, `openQuestions(root, brief?) → [string]`. CLI: `decide.js add <NN|all> "<text>"` (several at once: lines `NN: text` piped into
  `decide.js add`, all or none), `decide.js answer <NN|all> "<match>" "<answer>"`, `decide.js verify`,
  `decide.js list [NN]` (the rulings a brief must honour, its own and `all`, in file order; every ruling without `NN`),
  `decide.js questions [NN]`, and `decide.js seal`, which accepts a hand edit the owner says is
  theirs. `add` and `answer` refuse while an unaccepted hand edit is in the file.
- `scripts/state.js` exports `MARKS`, `fresh()`, `readBriefs(root)`, `rank(state, brief)`,
  `nextStep(root, state)` and `changedBriefs(root, state)` for `status.js`. CLI: `init [--existing "<cmd>"]`, `next`, `mark <NN> <mark>`,
  `mark briefed|stack|tidying|tidied|shipped [NN ...]`, `reconfirm <NN>`, `reopen stack`,
  `set-check "<cmd>"`, `set-deps "<cmd>"`, `allow <name>`. A refused mark prints the unmet
  requirement in one plain sentence and exits 1.
- `scripts/status.js` CLI: no arguments but `--root`.
- `scripts/install.js` is the SessionStart hook: it writes the `sidekik` command (a `sh`
  wrapper that runs `sidekik.js`) into the folder on your PATH that holds `node` when it is
  writable (so it works at once, like an npm command), else into `~/.local/bin`, and says
  so when that folder is not on your PATH. It leaves an `npm install -g` link alone, never
  fails the session, and does nothing on Windows.

The prototype check covers every file under `sidekik/prototype/` except `INDEX.md` and the
`kit/`, `map/`, `shots/` and `sample/` folders. It fails on: a file with no map row (the
message shows what a map row looks like); a `done` map row with no file; kit files that differ from the
frozen hash; a kit stylesheet with an `@import` or a `url(` that points at `http`. For
`.html` files it also fails on: a class the kit css does not define; a `<style>` block; an
inline `style` that sets anything but `top`, `left`, `width`, `height`, `grid-*` or a
`--custom-property`; `alert(`, `confirm(` or `prompt(`; a stylesheet or script loaded from
`http`; a local link whose file is missing.
