# Stack

The whole prototype is confirmed, so every choice here is made against what the product
really needs. The owner decides what shapes the product; you research, propose and build
what they chose. Never read the owner's other repositories to guess a stack.

1. **Criteria.** One owner batch before anything is researched: the platforms now and
   later (web, native mobile, desktop), who else will call the backend, where the users
   are and how many, the budget per month, who will write and maintain the code (a
   language counts by how well that writer writes and checks it), and the development
   machine as it is (which databases, object stores and mail catchers already run, in
   which containers and on which ports; how env files and secrets are kept), which serves
   only to reuse local services. In the same batch, the decisions this product needs,
   named from the confirmed examples and the questions the prototype settled as stack
   decisions: the architecture, the framework, the main libraries of each part, the data
   design, the UI toolkit the kit becomes and whether it reaches a native app, the
   database and its access layer, login, hosting, storage, email, payments when the
   product charges, analytics, outside feeds, error tracking. Mark each hard or easy to
   reverse; the owner confirms the list with the criteria.
2. **Research.** Before any option, per decision, scouts read current primary sources,
   dated: how products of this kind are built now, the languages and frameworks, data,
   hosting, the product's hardest parts, and what changed in the last year; and each
   candidate's current documentation through Context7. Facts only, no pick in mind; what no
   source settles stays marked "not confirmed". A decision that is hard to reverse gets the
   deeper read.
3. **Proposal.** One page the owner sees whole on screen, never a summary with the brief
   left in a file: the architecture as a picture (which parts exist, who calls whom, where
   data lives), two or three whole designs, the data design in short as a picture (what
   the product stores, the rules every brief shares, the areas and what each owns), and
   per decision, first one plain sentence on what the choice means for the product and its
   users and what it costs to change later, then the options with their gain and loss,
   monthly cost and how hard each is to leave, the recommendation, the strongest argument
   against it and what fact would change it. Written so the owner can decide from the page
   alone: the product's words first, the technical reasons under them. On the same page,
   one batch of questions from walking every example for what it cannot show: who may do
   what, money rules, limits, what happens when something fails, what cannot be undone.
4. **The stop.** Each decision that is hard to reverse is its own line and gets its own
   yes; the easy ones take one word for all. Nothing after this step is built before they
   decide; only tooling with no effect on the product is a call. End your turn.
5. **Data design and areas.** Write `sidekik/model.md` from the data design they approved.
   Do not list there what an area contains: that is read from the code.
6. **Release readiness.** Write what this product needs before real people use it under
   `## Before release` in `sidekik/stack.md`: secrets and personal data kept safe,
   backups, knowing when it breaks, legal pages, platform or store rules, real wording and
   images, the brand mark, favicon and app icon.
7. **Their steps.** Every step only a person can do (accounts, keys, billing) goes in one
   numbered list, given once, so the build never stops to wait for one. A secret never
   passes through the chat, a command argument or a committed file: the skeleton carries a
   small env utility in the product's own language that takes a key from a hidden prompt
   or stdin and puts it where that app and environment keep it (the env file step 1 found,
   or the host's secret store), keeps the example file in step, and reports every key the
   product needs as missing, present, or failing a cheap live test, never the value. Each
   step that needs a key tells the owner to run it; the report tells you which steps are
   done.
8. **Try the risky pieces** before the skeleton: where a decision or a confirmed example
   depends on what an outside service can do, run a small real test against it and show
   the result. One that needs a key waits for its step; write it, or "not tried" and which
   briefs wait on it, into `sidekik/stack.md`.
9. **Best practice for the picks.** From the documentation read in step 2 (the patterns it
   advises, what its current version changed, its known traps), write what a builder must
   follow into `CLAUDE.md`, briefly.
10. **Skeleton.** The smallest product that runs on the chosen stack, laid out as those
   documents recommend, that can be tried without going live. A product with screens gets
   its one design system here, from the prototype kit: the same tokens, and one shared
   component per kit piece that has structure or behaviour, under the same name. Plain
   helper classes stay classes. Its one check command carries the quality
   checks every later change must pass, as far as the stack has tools: tests, style rules,
   type checks, duplicate code, unused code, which area may use which, no raw colours or
   sizes outside the design system, no secrets, no to-do notes. Add an index command that
   prints, from the code, the names and signatures each area exposes. Put the layout and
   all commands in `CLAUDE.md`.

Write `sidekik/stack.md` with `## Picks` (each pick, its reason and its sources) and
`## Your steps`. Run `state.js set-check "<command>"`, then
`state.js set-deps "<a command that prints one library name per line>"`. Then
`state.js mark stack`.
