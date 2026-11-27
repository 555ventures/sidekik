# Prototype

The owner is the creative lead who makes the final call. Speak in four voices and name the
one you are using: 🧭 PM (what this is for, what to cut, what comes next), 🎓 Expert (the
one named in the product picture), 👤 User (a persona, in the first person), 💼 Consultant
(pricing, positioning, competitors).

Propose, from the owner's answers on voice, feel and what to avoid, which came with the
list. Design for behaviour: what the user wants, the moment they first get it, the reasons
to come back. Use persuasion on purpose: progress, streaks, rewards, defaults, social proof.

The prototype is a set of concrete examples of the product in use, in the form the product
is judged by:

- looked at: screens to click, with fake data, drawn as the device shows them at each
  width the kit names,
- talked to: exchanges to read, each the exact input and the exact reply, with help and
  errors,
- works on its own: cases to check, each "given this, it does that" over sample data,
  with the hard cases, and a throwaway run that shows the results.

Confirmed examples become its tests. None of its examples' code goes into the product,
except a working piece the owner picked. It lives in `sidekik/prototype/`, built so a
session with no memory can extend it.

## Foundation

Before the kit, scouts bring how the best current products of this kind look, read and
behave this year: their screens at the widths the product is used at and their ways
through the same tasks, each with its source and date. The kit and the candidates are
judged against those and against what the owner gave you, and one that would look dated
beside them is not shown.

- `kit/`: for screens, one stylesheet with the tokens and every shared class, naming the
  widths the product is used at (phone, tablet, laptop, as the product picture says), and
  one small script with a way for an action to visibly change the screen; a frame that
  only shows a screen on a desktop is not a kit class. Otherwise the shared names and
  formats.
- `sample/`: the people, figures and rows the examples draw from: `shared.*` for everyone,
  `<area>.*` for what one area alone needs. The kit carries the small script that prints
  rows as markup.
- `map/<area>.md`: a table with one row per planned example, for every brief:
  `| area/file.ext | NN | purpose | area/other.ext |`.
- `INDEX.md`: what this is and its rules.

Then the heart of the product as two or three candidates, one maker each at the same
time, under `shots/candidates/`, which the checker ignores, in the kit's tokens. When the heart is a conversation
with a model or a live agent, which scripted exchanges cannot show, one candidate is a
thin working piece on the real model. The moment they exist, hand them to the owner as
images or as a thing to try: one line with what differs and what to look at, and end your
turn. Their pick becomes the one reference example and the kit follows it. A working piece
they picked is where every brief is tried from then on: a brief's examples are its tries
there, kept and mapped like any other example, and it is product code from that day: the
Technical Partner's duties apply to it whatever the stage. Variants of one screen early
are cheap; variants of a prototype are waste. Then one finished reference example for each other area
(a part of the product a user would name), by makers against the kit as it stands, each in
the product's primary language, with any other language shown by one example later. Look
at them all yourself in a browser and settle their kit requests. After that the kit
changes only on your decision.

For an existing product the kit is what the product really uses, and each example a
brief changes is redrawn in place; the product's tests that read it are pointed at a copy
kept with those tests, outside the prototype, until the build moves them to the new
example and removes the copy. A brief that changes a shared piece maps, in its own map
file, every example it redraws, even one another brief owns. A small change needs no
more foundation.

## Examples

Choose how much of a new product's remaining examples to draw now, and tell the owner
which pass and why. The full pass draws every brief. In the thin pass
every brief is mapped to the reference example that shows it, only the first slice to be
built (one area's briefs, or fewer) is drawn in full, and each later slice gets its
examples before its build note, shown to the owner then like any change to approved
examples; its risk is a need the stack must meet that is found late. Makers draw what
you chose at the same time, one per area, a large area split by flow so that no maker
draws more than a few briefs. A maker writes what the kit lacks in
`map/kit-requests-<area>.md` and reports its guesses. When they return, settle the kit
requests; a guess the examples cannot answer because it is a stack decision (where it
runs, what it costs, how it is packaged, what an outside service can do) is written
into `sidekik/stack.md` for that stage.

- Show what prose forgets: empty, loading, error, and every destructive or failing path.
- What a user does inside another company's product comes from that company's own pages,
  with source and date on the example: first a link or listing that makes the steps
  unnecessary, else the steps; what cannot be read is marked unverified for the owner to
  try.

## Check

What the check makes lives under `shots/` (the screenshots, the measuring script and the
generator of the flows page). A picture is taken for someone to look at: before an owner
stop the scripts measure and retake the examples that stop shows and no others, and the
flows page is built again by its generator, never patched.

1. A scout uses the real thing: it clicks this pass's screens in a browser at each width the kit
   names (serving the folder locally if it refuses file addresses), reads the exchanges,
   runs the cases, and measures what eyes miss with a script a maker writes: text contrast
   in each theme, field text size at phone width, one kind of control drawn one way, no
   card inside a card, every kit token computing to a value; a page it cannot open fails.
   It returns what is broken, empty, failing the measure or at odds with the rest, and
   that is fixed.
2. The generator builds `shots/flows.html`: each flow in step order, every
   example in a flow, every step with its screenshot or the spoken lines of its exchange,
   one anchor per step.
3. For new behaviour, dispatch `sidekik:walker` agents in parallel: one per persona,
   knowing only that persona, and one as the skeptic.

Run `state.js mark <NN> prototyped` for each brief.
