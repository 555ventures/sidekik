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

## The owner confirms flows interactively, not from a one-line hand-off

**Decided 2026-11-09, applied in 0.3.7,** by the owner's correction "I prefer more
interactive user flow confirmation": the partner walks the owner through the flows one at
a time, each step with its anchor on the flows page, yes or change per step.

## The stack stage asks what shapes the architecture, and the owner makes the shaping picks

From sumglass, 2026-11-09. The owner, twice: "these important decision, I wanted you to ask
me, or give me more options" and "are we planning to make mobile app or just web app... how
do you know you want to properly architect?" Decided by that correction and applied in
0.4.1: the owner batch and the shaping picks in stack.md steps 1 and 2.

## Every change to confirmed examples needs the owner's yes again, enforced

**Decided 2026-11-10, applied in 0.5.3 and 0.5.5.** From sumglass: after brief 07 was
confirmed, the partner corrected a one-cent sum and ran `reconfirm` without a recorded
yes. Now every change to confirmed examples, however small, needs the owner's yes again,
recorded with `decide.js add NN` before `reconfirm`, which the script refuses without it;
the ask goes in the owner's next stop, not a separate interruption.

## Approval and going live are one question

**Decided 2026-11-10, applied in 0.6.1.** From sumglass: after the owner approved a logo,
the deploy needed a second dialog. When taking a change live is a separate step, the
partner asks once: approve and put it live?

## Walkers go before the owner's yes on a change to a confirmed screen

**Decided 2026-11-10, applied in 0.6.1.** From sumglass: the owner said yes to a changed
flow, then two walkers found gaps that changed what was approved. For a change to a
confirmed screen the walkers run first and the owner sees their findings with the change;
a new product keeps owner first, since a flow they change makes a walk worthless.

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

## The per-step flow walk is for a new product's first walk; a later brief gets one stop

**Decided 2026-11-11 by the owner's correction, applied in 0.7.4.** From sumglass: Three
small briefs produced 21 per-step questions in seven dialogs on top of 8 real decisions;
20 of the 21 came back "Yes (Recommended)" and the owner stopped the last one: "Why so
many confirmations you are asking? I am getting tired.. I thought Sidekik plugin will have
partners that only escalate for things that needed."

This amends the 0.3.7 decision ("I prefer more interactive user flow confirmation"), which
made every flow a step-by-step walk. Both corrections hold when the walk fits the size of
the change: a new product's first walk is step by step, because every screen is new and a
flow the owner changes makes a walker's walk worthless; a later brief, whose screens mostly
stand already, gets one stop: the flows page, what changed in a few lines, the questions
only the owner can rule, and one yes that covers the rest.

Applied as a phrase edit in prototype.md's check step 2, with the rule behind it in go.md:
the partner never asks what it would recommend without doubt; a yes it can predict is a
call, listed at the next stop. The owner's words on the same day, when asked to pick
between three options already judged: "I am not even pay attention anymore, just checking
recommended or whatever... I thought you will act as a partner." From here, learn makes
owner-treatment changes it would recommend and reports them here; the owner undoes what
they disagree with.

Tidied in 0.8.0: a later brief no longer has a flow stop of its own before the look stage; every brief after a new product's first walk goes to the walkers first and to the owner once, at the look stage, with their findings. The 0.6.1 rule for changes to a confirmed screen is now the rule for every later brief.
