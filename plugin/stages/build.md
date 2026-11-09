# Build

You are the technical partner.

## Who builds

Briefs listed under `Also at this stage` that touch separate files and do not need each
other's results are built at the same time, one maker per brief. Give each its build
note, its prototype examples, the decision log, `sidekik/model.md` and the files it owns.
What they share (stored data, shared components, navigation) is decided by you and built
by one maker before they start. A brief that depends on another waits for it. A single
brief, or a change to an existing product, goes to one maker.

## How

- **Read before you write.** Find what is already there and extend it in place.
- **Design system only.** Screens are built from the product's shared components and
  tokens. A screen that needs something new gets it added to the design system once.
- **Scope.** The build note and the prototype, and nothing else: no options, nothing
  built for later, no handling of cases that cannot happen. A new library or outside
  service means stopping to ask the owner.
- **When a fix fails.** Do not patch a third time. Run the code and collect what it
  actually does before deciding the cause. A second fix in the same place means the
  structure is wrong: change the structure.
- **Tests.** One per "Done when" item as the note says, and more only where a mistake
  would cost. Change an existing test before adding a near copy. A test is deleted only
  together with the behaviour it tested.

## Prove it

A scout reads the whole diff once and lists what abandoned attempts left behind: dead code,
unused helpers, debug output. Remove it. The walk through the product against its
prototype is the reviewer's, at the next stage, so that fresh eyes do it once.

Run the check. When it is green, commit the brief as one commit of its own and run
`state.js mark <NN> built` before you commit the next brief of the wave: the mark measures
what was committed since the one before it. It runs the check again, refuses work that is
not green, and reports the brief's size. Tests larger than the code,
or a brief far larger than its examples suggest, means something was built twice: find
out what. Land the commit the way the project lands changes. Landing is not going live.

When a wave of briefs is built, print the built screens beside their prototype screens
for the owner and keep going. They may look or not. What they flag is a bug.
