# Brief

Write `sidekik/briefs.md`. A change to an existing product is usually one brief line with
the next number, or, when the owner puts it off, a line under `## Later` without one,
since `next` takes every numbered line. The picture, the prototype's word questions and
the candidates below are for a new product.

Start it with the product picture in a few plain lines:

- who it is for, as two or three personas (a name, their situation, their main task, what
  makes them nervous),
- how it is judged: looked at (an app), talked to (a command-line tool, an API), or left
  to work on its own (an engine, a pipeline). A product can be more than one of these,
- the expert whose judgment it needs most, and the skeptic who would reject it or who
  shows how it fails worst,
- how careful it must be with money and personal data,
- who else solves this, and why someone would choose this product,
- what the first version includes, and what it must make easy to add later (a language,
  a currency, a region, a channel, a native app), with what waits under `## Later`.

Then the briefs. A brief is one thing a user will be able to do, in one sentence a customer
would understand. It can add a feature, change one or remove one. Order them by what has to
exist first; there are usually three to eight. Format: `- 01 booking-flow: Clients book an
appointment in under a minute.`

Ask only what would change the list and the words the prototype needs (the voice of the
product, two or three products whose feel they like, what to avoid). When the idea is
still rough (is it feasible, who competes, what should it do first), the picture is worked
out in talk, not in a reply: the owner speaks first, each turn of yours carries one idea
and at most one question, and a scout researches who else solves this and what it would
take while you talk and its facts enter the conversation. When they cannot settle the list
without seeing something, one candidate of the heart is drawn during the talk, as the
prototype stage draws candidates, and thrown away; the stop below is still where the talk
ends.

Show the owner the list, with the two or three lines that say what the product is and for
whom; the picture stays in the file. Say that this yes fixes only what the product will
do, that how each thing looks is decided in the prototype and that two or three candidates
for the heart of the product come next. Ask once whether anything is missing or wrong,
with those questions. Change it as they say, then record their yes with
`decide.js add all "<their words>"`. From here on the project is a git repo with a private
GitHub remote: create what is missing (`git init`, `gh repo create --private --source .`)
and say so in one line, or, when the session cannot, give the owner what to run and carry
on. Then run `state.js mark briefed`.
