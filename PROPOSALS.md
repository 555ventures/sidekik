# Proposals

Changes to how the plugin treats the owner (what it asks, when it stops, what it decides
alone). Learn makes the change it would recommend, describes it here with why, and the
owner can undo it.

## The owner sees the heart of the prototype before the makers start

**Decided 2026-11-09, applied in 0.3.0** in this form: three questions up front that words
can answer (voice, products whose feel they like, what to avoid), one best-guess heart
screen handed to the owner the moment it exists, every reaction a recorded ruling, the
flows shown before the walkers run. Amended the same day in 0.3.1: the heart screen comes
as two or three candidate images before the kit is frozen, the owner picks, then one kit;
variants of a whole prototype are never built.

## How the flows are confirmed

**Decided 2026-11-09, applied in 0.3.7,** by the owner's correction "I prefer more
interactive user flow confirmation": the partner walks the owner through the flows one at
a time, each step with its anchor on the flows page, yes or change per step.

**Narrowed 2026-11-11, applied in 0.7.4 and 0.8.0,** from sumglass, where three small
briefs produced 21 per-step questions in seven dialogs on top of 8 real decisions, and 20
of the 21 came back "Yes (Recommended)": "Why so many confirmations you are asking? I am
getting tired.. I thought Sidekik plugin will have partners that only escalate for things
that needed." And, asked to pick between three options already judged: "I am not even pay
attention anymore, just checking recommended or whatever... I thought you will act as a
partner." The partner never asks what it would recommend without doubt: a yes it can
predict is a call, listed at the next stop. From here, learn makes owner-treatment changes
it would recommend and reports them here; the owner undoes what they disagree with.

**Decided 2026-11-11, applied in 0.9.4,** from Poolyst, where the first walk meant twelve
stops and the owner said yes to all twelve after reading the page once: "when you show me
all the prototype screens, I usually go through in one go.. I don't really check one by
one."

**Narrowed 2026-11-15, applied in 0.15.4,** from sumaro, where one shape was redrawn
across eleven approved briefs and the look stop showed the whole flows page, 14 flows and
391 steps, for a change of 44 steps, with seven calls, two issues and three decisions on
top: "now it has too many that I don't know where to look at... probably this is Sidekik
plugin issues." The stop shows what the owner is deciding, at its size: flows they have
not seen come as the page; a change to flows they have seen comes as the changed steps
before and after, in the order a user meets them, a sentence changed the same way in many
places once with its count, and the page only as the place to look something up.

The rule as it now stands: every brief, a new product's included, goes to the walkers
first and to the owner once, at the look stage, with what is new to them (the flows page
the first time, the changed steps before and after after that), the walkers' findings, the
calls and open questions, and one yes for all or the changes by step; a flow the owner
wants walked gets its steps one at a time (0.3.7, 0.7.4, 0.8.0, 0.9.4, tidied in 0.10.0,
narrowed in 0.15.4).

## The stack stage asks what shapes the architecture, and the owner makes the shaping picks

From sumglass, 2026-11-09. The owner, twice: "these important decision, I wanted you to ask
me, or give me more options" and "are we planning to make mobile app or just web app... how
do you know you want to properly architect?" Decided by that correction and applied in
0.4.1: the owner batch and the shaping picks in stack.md steps 1 and 2.

**Widened 2026-11-13, applied in 0.12.6.** From Sumaro: the guide left the architecture,
the data design and the main libraries as the lead's calls and had the skeleton built right
after one stop; the session showed a 13-row summary with the brief left in a file. The
owner: "framework, tech stack, main libraries, architecture, database pick, UI kits and
other important things MUST BE consulted before you start doing anything." The
architecture as a picture, the main libraries of each part and the data design in short
join the owner's picks; the brief is shown whole on screen; nothing after the picks is
built before they decide.

**Rewritten 2026-11-13, applied in 0.13.0,** on the owner's instruction after Sumaro's three
lines (anchoring on their other repositories, no consultation on the architecture, no
research before the options): criteria agreed with the owner and the decisions named and
marked hard or easy to reverse in one batch; research from dated primary sources with no
pick in mind before any option; one proposal page shown whole, with the architecture and
the data design as pictures, two or three whole designs, and per decision the options,
gain and loss, the recommendation, the strongest argument against it and what would change
it; a yes per hard-to-reverse decision, one word for the easy ones; the risky pieces tried
before the skeleton; every decision kept with its reasons and sources.

**Noted 2026-11-13, in the 0.13.1 tidy.** The reviewer proved that the `stack` mark passes on
any decision recorded after the last prototype was confirmed, so the step-1 criteria
answer opens it before any option exists: the script cannot tell the picks' yes from that
answer. The README and the refusal now say what the gate holds, a yes at the stack. A mark
at the proposal stop would hold the picks themselves; it is an addition and waits for a
lesson. In the same tidy the Technical Partner stopped "owning how it is built": the
architecture, the data design and the main libraries are the owner's, so the role now
owns the agent team and the health of the code and builds what the owner decided.

**Plain first, 2026-11-14, applied in 0.15.1.** The owner, asked honestly: would technical
and architectural questions be better with an easier explanation? Yes. The proposal page was
"written the way a consultant briefs a company's technical people", and sumaro's owner line
said "he got no explanation". Each decision now opens with one plain sentence on what the
choice means for the product and its users and what it costs to change later, with the
options and the technical reasons under it; the page is written so the owner can decide
from it alone. The number of decisions that reach the owner does not change.

## Every change to confirmed examples needs the owner's yes again, enforced

**Decided 2026-11-10, applied in 0.5.3 and 0.5.5.** From sumglass: after brief 07 was
confirmed, the partner corrected a one-cent sum and ran `reconfirm` without a recorded
yes. Now every change to confirmed examples, however small, needs the owner's yes again,
recorded with `decide.js add NN` before `reconfirm`, which the script refuses without it;
the ask goes in the owner's next stop, not a separate interruption.

**Narrowed 2026-11-15, applied in 0.15.6,** from sumaro, where one ruling of the owner (the
tray shape, "Yes, this shape") was drawn across eleven approved briefs and each came back to
him to reconfirm, most for one sentence that only followed his ruling ("held back" became
"not shared"): "I feel you need to change approach for this flow confirmation... how can
the confirmation be made easy or autonomous?" A ruling of theirs in the log is the yes for
every example redrawn only to follow it: the partner checks each redraw against the ruling,
records it per brief in one `decide.js add` batch, and the next stop shows the count and
the changed steps. A change that is in no ruling of theirs, however small, is asked as
before. The scripts do not change: `reconfirm` still needs a decision per brief after the
approval, which the batch is, so the log shows for each brief which ruling re-approved it.

**Reversed in part 2026-11-15, in 0.18.0:** see "One yes per stop, and what the first count took out".

## The gates read the decision log in order, not by day

**Decided 2026-11-12, applied in 0.12.0 (tidy).** The tidy's reviewer proved in scratch
projects that the three dated gates (a brief's `confirmed` mark, the `stack` mark and the
`shipped` mark) passed on any decision from the same calendar day as the mark, even one
recorded before it: a candidate pick confirmed a brief that never reached the look, the
brief-list yes passed the stack with no picks shown, and a close-stage answer put a brief
live with no go-live yes. Decisions carried only a day. Each mark now records how many
decision lines existed when it was made, and a gate needs a decision for its brief
recorded after that point; `reconfirm` works the same way. Nothing is asked that was
not asked before; the yes is now the one given after the mark, as the guides always said.

**Reversed in part 2026-11-15, in 0.18.0:** see "One yes per stop, and what the first count took out".

## Approval and going live are one question

**Decided 2026-11-10, applied in 0.6.1.** From sumglass: after the owner approved a logo,
the deploy needed a second dialog. When taking a change live is a separate step, the
partner asks once: approve and put it live?

**Tightened 2026-11-12, applied in 0.11.0 (tidy).** The yes is recorded for each brief it
covers, never as `all`: the tidy's reviewer proved in a scratch project that a later
brief's list yes, recorded as `all` the way the brief stage records it, let `mark shipped`
put a finished brief live that the owner had never approved. 0.9.0 had closed this in the
guide only; the script now refuses it too. One `decide.js add` call still records several
briefs at once.

**Reversed 2026-11-14, 0.15.0 (tidy).** 0.14.1 had moved the go-live gate's anchor from the
brief's `done` mark to its `reviewed` mark, because a sumglass session asked "put it live
now?" inside the close stop's dialog and recorded the answer before `mark done`. The tidy's
reviewer showed what that opened: an answer to the close stop's `[owner]` question is a
decision for the brief after `reviewed`, so `mark shipped` passed on it with no go-live
question asked, the hole 0.12.0 closed. The anchor is `done` again. The go-live yes is
asked at the ship stop, after the owner has used the real thing (ship.md steps 3 and 4);
a session that batches it into the close dialog runs `mark done` first and records the
yes after it, which is what the refusal already says.

**Reversed in part 2026-11-15, in 0.18.0:** see "One yes per stop, and what the first count took out".

## Walkers go before the owner's yes on a change to a confirmed screen

**Decided 2026-11-10, applied in 0.6.1.** From sumglass: the owner said yes to a changed
flow, then two walkers found gaps that changed what was approved. For a change to a
confirmed screen the walkers run first and the owner sees their findings with the change;
a new product keeps owner first, since a flow they change makes a walk worthless.

**Decided 2026-11-11, applied in 0.10.1.** From sumglass brief 12: both walkers refused a
sentence the owner had ruled ("the rate is fixed when it saves"), and the fix put a
required field on every save, redrawing 17 approved exchanges. Waiting for the look stage
would have meant drawing them twice. A finding that overturns something the owner ruled
goes to them at once as one question, drawn beside the approved example it changes,
before anything is redrawn on it; the same sentence now serves the tidy stage, which had
its own copy. The 0.11.0 tidy merged it into the one rule for approved examples at the top
of go.md: their yes again, recorded per brief and followed by `reconfirm`, asked at the
next stop, or at once when the change overturns something the owner ruled.

## A rough idea is worked out in talk, not in a reply

**Decided 2026-11-12, applied in 0.10.2.** From a new product with no `sidekik/` folder
yet, the second project after Sumaro: the owner arrived with a rough idea and questions
(is it feasible, what is the best UX, who competes), and the brief guide's "work all of
this out from what the owner said, do not interview" produced one long structured reply:
"This is so long. I said I want this to be conversational!" What worked was short turns
with one idea and at most one question, a scout researching the market in the background
whose report changed the priorities, and the owner speaking first.

Applied, guide change only: when the idea is rough, the brief stage works the picture out
in talk, owner first, one question a turn, a scout on competitors and feasibility running
meanwhile. The stop and the yes are the ones that already exist. A skeptic walker on the
idea was added with it and removed in the 0.11.0 tidy: no lesson asked for it, and the
walker tries a prototype, which does not exist yet at the brief. Not a new command or stage: a discovery
step would put a third stop and a third artifact in front of the owner, and the session's
own list of fourteen methods (Double Diamond, Five Whys, the Mom Test and so on) is the
over-engineering the plugin avoids; the four sentences above are what the owner said worked.

**Reversed in part 2026-11-15, in 0.18.0:** see "One yes per stop, and what the first count took out".

## A mock during the brief talk, and a working candidate for a live heart

**Decided 2026-11-14, applied in 0.14.3.** From praxtrade, and before it sumaro: the owner
asked to see a mock before choosing which piece leads, so before the list was agreed, and
then ruled that a product whose heart is a conversation with Claude Code cannot be judged
from scripted exchanges, so the candidate for the heart had to really work. Sumaro's
session had reached the same point in 0.10.4 (a prototype the owner talks to live).

Applied, guide only: brief.md says that when the owner cannot settle the list without
seeing something, one candidate of the heart is drawn during the talk and thrown away, and
the list stop still follows; prototype.md says that when the heart is a conversation with
a model or a live agent, one of the candidates is a thin working piece on the real model,
thrown away like the others, with no stack chosen for it, handed to the owner as a thing to
try. The prototype stays examples with nothing behind them in every other case, and the
stack stage still decides the stack.

Not recommended: moving the candidates before the list for every product (the list is what
the product does; most owners can agree it from words, and sumaro's 0.7.2 lesson was the
list stop being too long, not too early), or letting the working candidate's code into the
product (it is a candidate, and the stack is not chosen yet). The second clause is
reversed by the amendment below.

**Amended 2026-11-15, applied in 0.15.5.** From praxtrade: the thin working piece became
the tool the owner uses every day, thirteen briefs were built and reviewed inside it, and
no mark could be reached, because the stage ends only through a kit, a map and examples,
which a working piece did not have. So "thrown away like the others" no longer holds for
it: a working piece the owner picked is the one part of a prototype that goes into the
product. The stack skeleton is built from it, every brief is tried there from then on, and
a brief's tries (the exact input and the exact reply) are kept and mapped as its examples,
so the marks are reached by the same map. Every other candidate is still thrown away, and
the stack stage still decides the stack.

## The Product Partner proposes; the owner decides

**Decided 2026-11-13, applied in 0.14.0 (tidy).** go.md said the Product Partner "owns
what the product does and how it feels to use", while prototype.md says the owner is the
creative lead who makes the final call and the README says the plugin proposes. One
reading now: the Product Partner proposes what the product does and how it feels to use,
and talks it through with the owner. The same shape as the 0.13.1 change to the Technical
Partner, who no longer owns how it is built.

## The repo and its remote are created at the briefed mark, not on the first visit

**Decided 2026-11-13, applied in 0.13.3.** From the owner: an idea was talked through
outside any sidekik project, because `go` created a git repo and a private GitHub remote
before the brief talk, so a rough idea that might never become a product would already own
a repo. The repo is needed by the makers and the commit-based gates, which start at the
prototype stage; the brief stage writes one file and talks, and neither `state.js init`
nor the `briefed` mark reads git. The sentence moved from the first visit in go.md to the
end of brief.md, right before `mark briefed`, with the same fallback when the session
cannot run `gh`. Nothing changes for an existing product.

Not recommended: a brainstorm entry that creates nothing until the list is agreed (a second
entrance to keep true, for what one sentence in the right place gives).

## The brief stop is short, says what comes next, and carries the prototype's word questions

**Decided 2026-11-11, applied in 0.7.2.** From Sumaro: the owner typed "make prototype for
me?" after a long planning talk and got a 130-line picture, eight briefs, nine calls and
two detail questions, with a request for a yes and no image; after `/clear` the same stop
came again, and they asked five times why no design came first.

What went wrong is the stop, not the guard. The guide says "show the owner the picture and
the list", so the whole picture went on screen; it does not say that the yes covers only the
list or that candidate images come next; and the prototype stage opens with a second text
stop (voice, products whose feel they like, what to avoid) before any image can be drawn.

Applied, guide change only, no script change: the stop shows the list and the two
sentences that say what the product is (the picture stays in the file), says that this yes
fixes only what the product will do and that two or three candidate images of the heart
screen come next, and asks in the same stop the prototype's word questions unless the
conversation already answered them. One stop fewer; the first image comes one stop after
the list, which is the earliest the kit can exist. The yes on the list stays recorded and
the scripts stay as they are, because candidates drawn against an unconfirmed list are the
waste the guard exists to prevent.

Not recommended: showing the list beside the candidates with one yes for both (the
foundation is built before anything is confirmed, and `next` would stop gating the
prototype stage), and renaming the early list (the confusion came from the stop text, not
the word). A firm description after the prototype already exists: the build note of the
note stage, written per brief from the confirmed examples.

## Learn fixes a fault at once and cuts at a tidy

**Decided 2026-11-15, applied in 0.16.3.** From a cross-project review the owner brought,
each number reproduced: of 95 fixes in the first week 73 added words to the guides and 2
removed any; 14 tidies took out 1,594 words while the fixes added 8,768; across four
projects 91 feedback lines were answered `[fixed]` and 7 `[declined]`; the approval
paragraph of go.md was rewritten nine times in six days. The owner asked whether the
cause was in each part or in how learn changes parts, and whether the loop had reached
diminishing returns.

It was learn. A session writes feedback when a rule blocks it and never when obeying a
rule cost work nobody used, so learn heard only reasons to add; each line was owed one
edit to one sentence; and a rule with a lesson behind it could not be removed by a tidy,
which only read the plugin's own text. A count in three projects then showed what the
feedback never had: of 68 refused marks 4 caught something real, about 270 decision lines
were one yes copied per brief, and no ruling ever cited the calls file, while reviewers
proved about 166 bugs and the owner changed most briefs by looking at them.

Applied: learn has two speeds. A fault of the plugin (a crash, a wrong refusal, a dead
end, an untrue sentence) is fixed when it is reported. Every other line is declined with
what to do meanwhile and read again at a tidy every few days, which starts in the
projects, counts for each mechanism how often it fired and how often it changed what was
built, and takes out what cost more than it caught, whatever lesson put it there. For the
owner of a project this means fewer new rules between tidies and more answers that say
"do this meanwhile".

Not recommended: a size budget or a cap on rules (the owner: they get overridden every
time), stopping the loop (a blocked session should not wait days for a crash to be
fixed), and rewording learn's four change types in place (removal would still have had
no evidence to act on).

## One yes per stop, and what the first count took out

**Decided 2026-11-15, applied in 0.18.0 to 0.18.3 (tidy).** The first tidy that started
in the projects. One reader per project (sumglass, poolyst, sumaro) counted, for each
thing the plugin makes a session or the owner do, how often it happened and how often it
changed what was built. What earned its cost stays untouched: the reviewer (about 166
proven bugs, all fixed), the owner looking at drawn and running things (most briefs
changed before any product code), the walkers, the stack yes and the go-live yes.

Taken out, one version each so each can be undone alone:

- 0.18.0, the yes counted per brief and the approval hash. A yes recorded once after a
  mark, for a brief or for all, covers every brief marked on it; nothing is copied per
  brief (about 270 copied lines in three logs). A change to examples the owner approved
  is no longer hashed, refused or reconfirmed: it is shown at their next stop as the
  changed steps before and after, and one that overturns a ruling is still asked at
  once. Of 68 refused marks 4 caught something real, none of them a missing yes.
- 0.18.1, the calls file. A call is told at the stop it belongs to and kept nowhere
  after; until then it lives in the handoff. In 1,055 entries the owner overturned about
  21, every time through a screen or the conversation.
- 0.18.2, cause tags, the rule that a cause seen three times needs a guard, and the done
  mark's refusal for a missing lesson line. The lesson line and the check written after
  each brief stay.
- 0.18.3, the long handoff: replaced whole at a mark and before stopping, holding where
  things stand, what comes next, what is running and the calls not yet told.

What the owner gives up, said plainly: a decision recorded for all after a mark now
opens that mark's gate whatever it was about, so the script no longer proves that the
yes was about this prototype or this release, only that the owner said something after
it; and a redraw after approval can no longer be listed by a script. The first failure
the gates were built against (a session passing an owner moment with nothing recorded)
is still guarded; the second (a small change to an approved example judged too small to
ask about) is now carried by the guide alone.

Not recommended: one line naming several briefs (a new form in the decision log to save
a gate that caught nothing), and removing the stack or go-live yes (one per project or
per release, and cheap).

## The close stops only for a product decision

**Decided 2026-11-16, applied in 0.18.7.** From poolyst: "close.md says 'Stop if the
review left an `- [owner]` item: ask it with your recommendation', and review.md makes
`[owner]` of two different things: a product decision, and a finding I will not fix.
Brief 18's second look left one of the second kind ... and go.md says a yes I can predict
is a call, not a question." The session stopped and asked the owner something it would
have answered without doubt. The line was first declined to wait for a tidy; the owner
said to fix it now.

Applied: close.md stops only when the review left an `[owner]` item that is a product
decision. A finding the partner chose not to fix is told with the calls at the close,
with no stop. For the owner this is one stop fewer for each such finding, in line with
the 0.7.4 rule that a yes the partner can predict is a call; poolyst's reviews held 14
`[owner]` lines, and how many were of this kind was not counted.

Not recommended: a second tag in the review file for a finding left alone (it would
keep the status screen exact, but it is a new form for a difference one sentence
carries). Until a brief is marked done the status screen still counts such a line as a
review question.

## A ruling lives where it is built from, and the decision log holds only the yes at a stop

**Decided 2026-11-17 by the owner ("yes"), applied in 0.19.0.** From praxtrade: "I read
it as every message of theirs and logged session housekeeping ... The owner asked why and
sees no benefit", and "the decision log only grows (about 300 lines here after two weeks),
later lines overrule earlier ones, and nothing marks a line as overruled ... the owner
said old decisions 'keep coming back again and again'". Readers counted the four
projects' logs, 1,271 lines: 19 housekeeping, 171 thinking out loud, 454 spent yeses (a
third of sumglass's log is one yes copied onto each brief it covered), 494 live rulings,
at least 111 overruled with nothing marking them. A builder of one brief was handed 80 to
213 of those lines. Three of the four projects had written a digest of current rulings by
hand. The owner's own points shaped the change: an old idea comes back and conflicts with
a newer one, and whatever they said is already in Claude Code's transcript.

Applied: go.md says a ruling about the product is written where it is built from (the
brief's sentence, the kit and the examples, the build note or the model, the picture at
the top of the brief list for a ruling on the whole product), and that one which replaces
an earlier ruling is done only when the earlier one is gone from every file a session or
an agent reads. The later word wins, and the partner asks only when it cannot tell
whether the owner meant to replace the earlier one. The decision log holds only what the
marks read: the yes at a stop, once for every brief it covers, and an answered question.
A session order belongs to the handoff; a thought that rules nothing is written nowhere.
Makers, the reviewer and the reader of the build notes are handed `sidekik/briefs.md`
where they were handed the log. No script changed.

For the owner: fewer lines written, no old ruling handed to a builder, and one new
question, asked only when the partner cannot tell whether a new word replaces an old one.
What is given up: the owner's exact words for a ruling, once Claude Code has deleted the
transcript; the brief and its git history are then the record.

Not recommended: a page of current rulings in front of the log (a new file for what the
briefs already carry), a mark for an overruled line (a new command against a sealed file
that leaves the noise in place), and cleaning the existing logs (the marks count their
lines). Left as it is: a mark accepts any line for `all` recorded after it, so the gate
proves that the owner spoke, not what they meant.

## Tokens are the owner's money: a run of agents is sized, and a large one is a stop

**Asked by the owner 2026-11-17, applied in 0.20.0.** From nikoniko-hub: "the stage says
'a new product gets every brief prototyped in this one pass, with makers on the remaining
areas' and has no budget gate. With 94 briefs that became about 40 agent jobs and over 18
million tokens in one day (the partner also overrode every maker to Opus), most of it on
states and cases pages the owner will never look at." Measured from that project's
transcripts: 58 agent runs in the day, 16 of them started by makers and unseen by the
partner; 30.5 million tokens of fresh input, cache writes and output, and 1.69 billion
with cache reads; 37 runs on Opus (median 666 thousand tokens) against 19 on Sonnet (242
thousand); a median run of 86 turns with a context of 276 to 950 thousand tokens read
again on every turn; 147 screens. No size and no go or no-go was put to the owner before
the pass, and no human message concerned a model.

Applied: go.md says tokens are the owner's money. Before a run of several agents the
partner says its size in one line; the line is a stop, with a thinner way offered first,
when the run covers a whole new product or is far larger than the last one agreed to; an
agent on a stronger model than its file names needs the owner's yes with the extra cost
stated. prototype.md starts a new product's examples pass at that stop and offers the
thin pass: every brief mapped to the reference example that shows it, only the first
slice drawn in full, each later slice drawn before its build note. A large area is split
by flow among makers, and a maker never starts an agent of its own.

For the owner: one new stop per new product, and one whenever a model would be raised;
every other run of agents costs one line to read.

Not recommended: a stop before every run of more than one agent (the owner's ruling in
nikoniko-hub, and what this request asked for: it would stop every build wave and bring
back the predictable yes of 0.7.4; say so and it is one sentence to change), a token cap
(a number the owner overrides), and a digest for makers to read (reading before the
first write was 30 to 100 thousand tokens of a run; the length of the run was the cost).
