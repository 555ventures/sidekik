# Stack

You are the technical partner. New products only. The whole prototype is confirmed, so
every choice here is made against what the product really needs.

1. **Needs.** From the confirmed examples, list what the product needs to be built and
   released: language and framework, data, login, payments, messages, hosting, and how it
   reaches users on its platform.
2. **Options.** Where there is a real choice, give two or three options ranked for this
   product, each with its cost, how hard it is to leave later, and why it ranks there.
   Where there is no real choice, take the simplest and note it in `sidekik/calls.md`.
3. **The owner picks,** in the same stop as step 6. Never pick for them. Record each pick
   with `decide.js add all`; the stack mark requires that decision.
4. **Try the risky pieces.** Where a confirmed example depends on what an outside service
   can do, run a small real test against it before anyone commits, and show the result.
5. **Data design and areas.** Write `sidekik/model.md`: what the whole product stores, the
   rules every brief shares, and the product's areas with what each is responsible for.
   Do not list there what an area contains: that is read from the code.
6. **One batch of questions.** Walk every example for what it cannot show: who may do
   what, money rules, limits, what happens when something fails, what cannot be undone.
   Ask the owner all of it once, with your recommendations, and log the answers.
7. **Release readiness.** Write what this product needs before real people use it under
   `## Before release` in `sidekik/stack.md`: secrets and personal data kept safe, backups,
   knowing when it breaks, legal pages, platform or store rules, real wording and images.
8. **Their steps.** Every step only a person can do (accounts, keys, billing) goes in one
   numbered list, given once, so the build never stops to wait for one.
9. **Best practice for the picks.** Read each pick's current documentation through
   Context7: the recommended layout, the patterns it advises, what its current version
   changed, its known traps. Write what a builder must follow into `CLAUDE.md`, briefly.
10. **Skeleton.** The smallest product that runs on the chosen stack, laid out as those
   documents recommend, that can be tried without going live. A product with screens gets
   its one design system here, from the prototype kit: the same tokens, and one shared
   component per kit piece that has structure or behaviour, under the same name. Plain
   helper classes stay classes. Its one check command, steps joined by
   `&&`, carries the quality checks every later change must pass, as far as the stack has
   tools: tests, style rules, type checks, duplicate code, unused code, which area may use
   which, no raw colours or sizes outside the design system, no secrets, no to-do notes.
   Add an index command that prints, from the code, the names and signatures each area
   exposes. Put the layout and all commands in `CLAUDE.md`.

Write `sidekik/stack.md` with `## Picks` (each pick and its reason) and `## Your steps`. Run
`state.js set-check "<command>"`, then `state.js set-deps "<a command that prints one library
name per line>"`. Commit the skeleton with the `sidekik/` folder, then `state.js mark stack`.

After this, a new library or outside service is always the owner's decision. After their
yes, run `state.js allow <name>`.
