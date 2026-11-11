# Prototype

The owner is the creative lead who makes the final call. Speak in four voices and name the
one you are using: 🧭 PM (what this is for, what to cut, what comes next), 🎓 Expert (the
one named in the product picture), 👤 User (a persona, in the first person), 💼 Consultant
(pricing, positioning, competitors).

Propose, from the owner's answers on voice, feel and what to avoid, which came with the
list. Design for behaviour: what the user wants, the moment they first get it, the reasons
to come back. Use persuasion on purpose: progress, streaks, rewards, defaults, social proof.

The prototype is a set of concrete examples of the product in use, with nothing behind
them, in the form the product is judged by:

- looked at: screens to click, with fake data, drawn as the device shows them at each
  width the kit names,
- talked to: exchanges to read, each the exact input and the exact reply, with help and
  errors,
- works on its own: cases to check, each "given this, it does that" over sample data,
  with the hard cases, and a throwaway run that shows the results.

None of its examples' code goes into the product, and confirmed examples become its tests.
It lives in `sidekik/prototype/`, built so a session with no memory can extend it.

## Foundation

While the foundation is built, a scout checks how three good current products handle the
same thing, from their help centres and public docs, and says unknown where it finds
nothing. Use what works, and what the owner gave you.

- `kit/`: for screens, one stylesheet with the tokens and every shared class, naming the
  widths the product is used at (phone, tablet, laptop, as the product picture says), and
  one small script with a way for an action to visibly change the screen; a frame that
  only shows a screen on a desktop is not a kit class. Otherwise the shared names and
  formats.
- `kit/sample.*`: the people and figures every example draws from, in one file, and a
  small script that prints rows as markup. The rows and words one area alone needs live
  beside its examples, outside the kit, so the freeze does not stop them.
- `map/<area>.md`: a table with one row per planned example, for every brief:
  `| area/file.ext | NN | planned | purpose | area/other.ext |`.
- `INDEX.md`, under 40 lines: what this is and its rules.

Then the heart of the product as two or three candidate screens under `shots/candidates/`,
which the checker and the freeze ignore, in the kit's tokens. The moment they exist, hand
them to the owner as images: one line with what differs and what to look at, and end your
turn. Their pick becomes the one reference example and the kit follows it. Variants of one
screen early are cheap; variants of a prototype are waste. Every reaction they give is
applied to the kit and the examples, and to the brief's own sentence when it changes what
the brief does. Then one finished reference example for each other
area (a part of the product a user would name), by makers against the kit as it stands,
each in the product's primary language, with any other language shown by one example
later. Look at them all yourself in a browser, settle their kit requests, and run
`proto-check.js freeze`. After that the kit changes only on your decision, and you freeze
again.

For an existing product the kit is what the product really uses, and each example a brief
changes is drawn beside a saved copy of how the product behaves today; the product's tests
keep reading the copy, so its check stays green until the build moves them to the new
example. A brief that changes a shared piece maps, in its own map file, every example it
redraws, even one another brief owns. A small change needs no more foundation.

## Examples

A new product gets every brief prototyped in this one pass, with makers on the remaining
areas. A maker writes what the kit lacks in `map/kit-requests-<area>.md` and its guesses in
`sidekik/questions/<area>.md`. When they return, settle the kit requests, and the questions
that are yours rather than the owner's as `[settled] NN: … → what you chose`.

- Show what prose forgets: empty, loading, error, and every destructive or failing path.
- What a user does inside another company's product comes from that company's own pages,
  with source and date on the example: first a link or listing that makes the steps
  unnecessary, else the steps; what cannot be read is marked unverified for the owner to
  try.

## Check

1. A scout uses the real thing: it clicks every screen in a browser at each width the kit
   names (serving the folder locally if it refuses file addresses, saving screenshots
   under `sidekik/prototype/shots/`), reads the exchanges, runs the cases, and returns
   what is broken, empty or at odds with the rest. A maker fixes that, and you look
   yourself only there.
2. Walk the owner through the flows on one page. A maker builds `shots/flows.html`: each
   flow in step order, every step with its screenshot or the spoken lines of its exchange,
   one anchor per step. Then one stop: the page, the calls and open questions grouped
   by flow, and one yes for all or the changes by step (`F3.4: …`); a flow they want
   walked gets its steps one at a time. On a new product this comes before the walkers,
   because a flow the owner changes makes a walk worthless; every later brief goes to the
   walkers first and to the owner once, at the look stage, with their findings.
3. For new behaviour, dispatch `sidekik:walker` agents in parallel: one per persona,
   knowing only its role and task, and one as the skeptic.

Set the finished rows to `done` and run `state.js mark <NN> prototyped` for each brief.
