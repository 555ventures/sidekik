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

The rule as it now stands: every brief, a new product's included, goes to the walkers
first and to the owner once, at the look stage, with the flows page, the walkers'
findings, the calls and open questions, and one yes for all or the changes
by step; a flow the owner wants walked gets its steps one at a time (0.3.7, 0.7.4, 0.8.0,
0.9.4, tidied in 0.10.0).

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

## Every change to confirmed examples needs the owner's yes again, enforced

**Decided 2026-11-10, applied in 0.5.3 and 0.5.5.** From sumglass: after brief 07 was
confirmed, the partner corrected a one-cent sum and ran `reconfirm` without a recorded
yes. Now every change to confirmed examples, however small, needs the owner's yes again,
recorded with `decide.js add NN` before `reconfirm`, which the script refuses without it;
the ask goes in the owner's next stop, not a separate interruption.

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
