# Brief

Write `sidekik/briefs.md`.

For a new product, start it with the product picture in a few plain lines:

- who it is for, as two or three personas (a name, their situation, their main task, what
  makes them nervous),
- how it is judged: looked at (an app), talked to (a command-line tool, an API), or left
  to work on its own (an engine, a pipeline). A product can be more than one of these,
- the expert whose judgment it needs most, and the skeptic who would reject it or who
  shows how it fails worst,
- how careful it must be with money and personal data,
- who else solves this, and why someone would choose this product,
- what the first version includes, and what it must make easy to add later (a language,
  a currency, a region, a channel, a native app). Under `## Later`, list what waits.

Then the briefs. A brief is one thing a user will be able to do, in one sentence a customer
would understand. It can add a feature, change one or remove one. Order them by what has to
exist first. A new product usually has three to eight. A change to an existing product is
usually one, and takes the next number. Format: `- 01 booking-flow: Clients book an
appointment in under a minute.`

Work all of this out from what the owner said and from the project. Do not interview. Ask
only what you cannot work out: what would change the list and, for a new product, the words
the prototype needs (the voice of the product, two or three products whose feel they like,
what to avoid). When the idea is still rough (is it feasible, who competes, what should it
do first), the picture is worked out in talk, not in a reply: the owner speaks first, each
turn of yours carries one idea and at most one question, a scout researches who else
solves this and what it would take while you talk and its facts enter the conversation,
and a `sidekik:walker` as the skeptic attacks the idea before the list is written. The stop
below is where the talk ends.

Show the owner the list, with the two or three lines that say what the product is and for
whom; the picture stays in the file. Say that this yes fixes only what the product will do,
that how each thing looks is decided in the prototype and, for a new product, that two or
three candidates for the heart of the product come next. Ask once whether anything is
missing or wrong, with those questions. Change it as they say, then record their yes with
`decide.js add all "<their words>"` and run `state.js mark briefed`.
