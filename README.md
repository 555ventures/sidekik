# sidekik

Build software with Claude the way a founder works with two partners. You show what you
want through a prototype, and Claude works with you in one of two roles:

- **Product Partner** while the product is shaped: it proposes what the product does and
  how it feels to use, and this phase is a conversation with you.
- **Technical Partner** while it is built: it owns the agent team and the health of the
  code, builds what you decided, talks to you in plain words, and rarely needs you.

In both it leads the way a senior partner would: answerable for the result and not for
the steps, held to what the best team would ship today and looking that up instead of
trusting its memory, with agents doing the work.

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

One pattern runs through all of it, for the prototype and for the product alike: the
approach is settled first, one hand builds the shared foundation, independent pieces are
built at the same time, a machine checks every piece, fresh eyes check the result once, and
one lesson changes what happens next.

A prototype is a set of concrete examples of the product in use, in the form the product
is judged by: screens to click for a product you look at, exchanges to read for one you
talk to (a command-line tool, an API), cases to check for one that works on its own (an
engine, a pipeline). Confirmed examples become the tests.

Claude comes to the owner when a good partner would. Several of those moments stop the
work until the owner answers; four are asked at the brief list, each brief's prototype,
the stack and going live. The session runs the mark only after the owner's yes, and the
mark is the record of it. The build
between them runs unattended and reports as it goes. An agent runs on the model its file
names; a call that names another goes to the owner's own permission prompt. A bug or a
small tweak skips the stages: it is fixed directly and reported in one line.

Every project also keeps itself clean and learns: a tidy stage is scheduled by the script,
and each finished brief leaves one lesson and the check or sentence that prevents its worst moment.

A project also writes down where the plugin itself got in its way, and `/sidekik:learn`,
run in this repo, fixes a fault of the plugin at once and answers in the project.

## Why it is small

Its predecessors grew to tens of thousands of lines and answered every incident with a new
rule, and for its first week so did this one: 73 of 95 fixes added words and 2 removed
any. It stays small by how it changes, not by a limit. Only a fault (a crash, a wrong
refusal, a dead end, an untrue sentence) is fixed when it is reported. Everything else
waits for a tidy every few days, which starts in the projects: for each thing the plugin
makes a session or the owner do, how often it happened and how often it changed what was
built. What cost more than it caught is taken out, whatever lesson put it there.
`npm test` prints its size, so growth is seen and never hidden.

## Contract (for whoever builds or changes the plugin)

What the scripts read lives in `sidekik/` in that project, and is
landed with the project's work. Scripts re-read it on every call.

```
sidekik/
  state.json            written only by scripts
  briefs.md             - 01 booking-flow: Clients book in under a minute.
  handoff.md            where the work stands and what comes next, replaced whole each time
  stack.md              ## Picks, ## Your steps
  model.md              the data design and the product's areas
  lessons.md            - 01: text   - fix: text
  feedback.md           where the plugin itself got in the way:  - [open] stage: text
  prototype/
    INDEX.md            what this is and the rules for anyone adding to it
    kit/                what every example shares
    <area>/<example>    a screen (.html), an exchange or a case (any other file type)
    map/<area>.md       | example | brief | purpose | links |
    sample/             shared and per-area sample data, neither kit nor example
    shots/              screenshots, candidates, the flows page and the scripts that make them; not checked
  build-notes/01-booking-flow.md   has "## Reuse" and a "## Done when" list
  reviews/01.md         - [bug] text   becomes   - [fixed] text  or  - [owner] text
```

A PreToolUse hook (`hooks/hooks.json`, `scripts/guard.js`) refuses Write and Edit on
`state.json`; edits made through the shell are not caught. The same
hook reads every Agent call: one that starts a `sidekik:` agent on a model other than the
one its file names is sent to the owner's permission prompt, or refused where the
session's permission mode shows no prompt. `hooks.json` also runs `scripts/install.js` at
session start.

Line formats, exactly:

- Brief: `- NN slug: sentence` where `NN` is two digits and `slug` is `[a-z0-9-]+`.
- Map row: `| area/file.ext | NN | purpose | area/other.ext, ... |`. The
  path is relative to `sidekik/prototype/` and has a file extension. Nothing after `NN` is
  read; an older map with `planned` or `done` in the third cell works the same.
- Lesson: `- NN: text` for a brief, `- fix: text` for a bug that escaped. No script reads
  it: the close stage and a bug fix write the line, and `/sidekik:learn` reads it at a tidy.
- Feedback: `- [open] stage: text`, later `- [fixed] stage: text → what changed` or
  `- [declined] stage: text → why, and what to do meanwhile`. No script reads it: the
  project's session writes the line, and `/sidekik:learn` answers it.

`state.json`:

```json
{ "check": "npm test", "stack": false, "briefed": false,
  "bases": { "01": "<git sha or null>" },
  "sizes": { "01": { "code": 310, "tests": 60, "removed": 12, "testsRemoved": 0 } },
  "tidied": 0, "tidyBase": null, "shipped": [],
  "history": [ { "brief": "01", "mark": "built", "at": "2026-11-09T10:20:00.000Z" } ],
  "briefs": { "01": "built" } }
```

A missing field in an older state file counts as its empty value; a field no script reads any more is kept as it is and ignored.

A brief's value is its last mark. Marks in order, and what each one requires:

| mark | requires |
|---|---|
| `prototyped` | the brief has map rows, every file they name exists; the prototype check passes |
| `confirmed` | `prototyped` |
| `noted` | `confirmed`; `stack` is true; the build note exists, has a `## Reuse` section and a `## Done when` section with at least one `- ` item. Records the current git commit as the brief's base (null outside a git repo or before the first commit) |
| `built` | `noted`; something was committed since the base (when there is a base), unless another brief was marked `built` after this one was `noted`, which then measured it; the check command exits 0. Records the brief's size |
| `reviewed` | `built`; the review file exists with no `- [bug]` line left; when it holds a `- [fixed]` or `- [cut]` line, the check command exits 0 |
| `done` | `reviewed` |

Project marks:

- `briefed`: `briefs.md` has brief lines. It sets `briefed` true.
- `stack`: every brief is at least `confirmed`; `stack.md` has `## Picks` and
  `## Your steps`; `model.md` exists; a
  check command is set and exits 0; the project has a commit and nothing outside
  `sidekik/` is uncommitted, so every brief gets a base.
  `init --existing "<check command>"` sets `stack` true at once. `reopen stack` (refused
  while `stack` is false) sets `stack` false and appends
  `{ brief: null, mark: 'stack', reopen: true, at }`.
- `tidying`: records the current git commit as `tidyBase` (null outside a git repo).
- `tidied`: `tidying` was marked after the last `tidied`, and the check command exits 0. It sets `tidied` to the number of `done` briefs, clears `tidyBase`, and prints the lines added and removed since `tidyBase` (when there is a base).
- `shipped [NN ...]`: each named brief (default: every `done` brief not yet shipped) is `done`; when none is named, at least one `done` brief must be waiting. Adds them to `shipped`.

Every mark attempt, brief or project, appends `{ brief, mark, at }` to
`history` (`brief` is null for a project mark), with `refused: true` when it was refused.

`set-check "<command>"` refuses a command that contains `;`, saying to join the steps with
`&&` so that a failing step fails the whole check.

A brief's size is what was committed since its base, from `git diff --numstat <base> HEAD`:
lines added, split into tests
(a path with a `test`, `tests`, `__tests__`, `spec` or `e2e` folder, or a file name that
contains `.test.`, `.spec.` or `_test.` or starts with `test_`) and code (everything else),
plus the lines removed and how many of those were test lines. Paths under `sidekik/` and
lock files do not count. With no base, no size is recorded. `mark <NN> built` prints the
size in one sentence, for example
`It added 71 lines of code and 15 lines of tests, and removed 20 lines, 4 of them tests.`
It then moves the base of every brief still at `noted` to the current commit, so briefs
built in the same wave and landed one commit each are measured and reviewed one by one.

What `next` answers:

| situation | stage |
|---|---|
| no `briefs.md`, or it has no brief lines, or `briefed` is false and no brief has a mark | `brief` |
| `stack` false and some brief has no mark | `prototype` (the lowest such brief) |
| `stack` false, every brief has a mark, some brief is only `prototyped` | `look` (the lowest such brief) |
| `stack` false and every brief is at least `confirmed` | `stack` |
| `stack` true, and `tidyBase` is set, or five or more briefs became `done` since the last tidy and no brief is `noted`, `built` or `reviewed` | `tidy` (no brief) |
| `stack` true: of the briefs not `done`, the one furthest along, the lowest number among equals | by its mark: none `prototype`, `prototyped` `look`, `confirmed` `note`, `noted` `build`, `built` `review`, `reviewed` `close` |
| every brief is `done`, and `tidied` is less than the number of `done` briefs | `tidy` (no brief) |
| every brief is `done`, some are not in `shipped` | `ship` (no brief) |
| every brief is `done` and shipped | `idle` |

`next` prints five lines: `Stage:`, `Brief: NN slug: sentence` or `Brief: none`, `Read:` with
the absolute path of the stage file (`none` for idle) and the plugin version, as
`(sidekik <version>)`, `Also at this stage: 02, 03` listing
the other briefs whose own next stage is the same (`none` when there are none),
and `Base: <sha>` or `Base: none`.

`scripts/status.js` is the progress screen. It derives everything from the same functions
`next` uses, which `state.js` exports, so the two cannot disagree. The screen, exactly:

```
🙋 Waiting on you
   ├─ 1 review question on 02 drinks-separately
   └─ your sign-off to take 05 live

🎯 Next   review 02 drinks-separately

🗺️ Split the bill
   ✅ 01 even-split         live
   🔨 02 drinks-separately  ▓▓▓▓░░  built
   🎨 03 history            ▓▓░░░░  design approved
   🎨 04 share-link         ░░░░░░  prototyping, 2 examples
   📦 05 tip-jar            finished

📈 Progress   4 of 5 designed · 3 of 5 built · 1 of 5 live · 38 min from your yes to finished
```

- Order: Waiting on you, a blank line, Next, a blank line, the roadmap (a title line, then
  one row per brief or run of briefs), a blank line, Progress. With no briefs the roadmap is
  the single line `🗺️ No briefs yet.` and there is no Progress line.
- Waiting on you, in this order: `your yes on the brief list` when the stage is `brief`; `your look at the prototype (01, 02)` when the stage is `look`, listing every
  `prototyped` brief; `your stack picks` when the stage is `stack`; one line per brief not yet `done`
  whose review file has `- [owner]` lines (`N review question(s) on NN slug`); `your sign-off to
  take 01, 02 live` listing `done` briefs not yet shipped, when there are any. Tree
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
  ░ and its label is `prototyping, M examples`, one for each row.
- Progress: designed counts briefs at `confirmed` or later, built counts `built` or later,
  live counts shipped briefs. Once a `done` brief has both `confirmed` and `done` entries in
  `history`, it adds ` · 38 min from your yes to finished`: the median whole minutes between
  them, written `5 h 34 min` from 60 minutes up.

Scripts are CommonJS, Node 22+, no dependencies, and take `--root <dir>` (default: the
current directory) for the project root that holds `sidekik/`.

`sidekik status`, `sidekik next` and `sidekik check`
run the scripts below, and `sidekik state <...>` passes the rest to that script.
`sidekik help` lists them; `--root <dir>` goes after the word. `sidekik status` clears the
terminal first when its output is one; piped output is left plain.

- `scripts/lib/store.js` exports `dir(root)`, `readState(root)`, `writeState(root, state)`,
  `read(root, rel) → text or null` (a file under `sidekik/`),
  `rootFrom(argv) → { root, args }` (`args` without
  `--root <dir>`).
- `scripts/proto-check.js` exports `checkPrototype(root) → { ok, problems: [string] }`,
  `screensFor(root, brief) → [file]`, the files its map rows name.
  CLI: `proto-check.js` prints problems and exits 1 if any, or one line saying it passed
  and how many examples it checked.
- `scripts/state.js` exports `MARKS`, `fresh()`, `readBriefs(root)`, `rank(state, brief)` and
  `nextStep(root, state)`, for `status.js`. CLI: `init [--existing "<cmd>"]`, `next`, `mark <NN> <mark>`,
  `mark briefed|stack|tidying|tidied|shipped [NN ...]`, `reopen stack`,
  `set-check "<cmd>"`. A refused mark prints the unmet
  requirement in plain words and exits 1.
- `scripts/status.js` CLI: no arguments but `--root`.
- `scripts/install.js` is the SessionStart hook: it writes the `sidekik` command (a `sh`
  wrapper that runs `sidekik.js`) into the folder on your PATH that holds `node` when it is
  writable (so it works at once, like an npm command), else into `~/.local/bin`, and says
  so when that folder is not on your PATH. It leaves an `npm install -g` link alone, never
  fails the session, and does nothing on Windows.

The prototype check covers every file under `sidekik/prototype/` except `INDEX.md` and the
`kit/`, `map/`, `shots/` and `sample/` folders. It fails on: a kit stylesheet with an `@import` or a `url(` that points at `http`. For
`.html` files it also fails on: a class the kit css does not define; a `<style>` block; an
inline `style` that sets anything but `top`, `left`, `width`, `height`, `grid-*` or a
`--custom-property`; `alert(`, `confirm(` or `prompt(`; a stylesheet or script loaded from
`http`; a local link whose file is missing.
