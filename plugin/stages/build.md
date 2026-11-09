# Build

## Who builds

Briefs listed under `Also at this stage` that touch separate files and do not need each
other's results are built at the same time, one maker per brief. Give each its build
note, its prototype examples, the decision log, `sidekik/model.md` and the files it owns.
What they share (stored data, shared components, navigation) is built before they start.
A brief that depends on another waits for it. A single brief, or a change to an existing
product, goes to one maker.

## How

When a fix fails, run the code and collect what it actually does before deciding the
cause. A second fix in the same place means the structure is wrong: change the structure.

## Prove it

A scout reads the whole diff once and lists what abandoned attempts left behind: dead code,
unused helpers, debug output. A maker removes it. The walk through the product against its
prototype is the reviewer's, at the next stage, so that fresh eyes do it once.

Run the check. When it is green, commit the brief as one commit of its own and run
`state.js mark <NN> built` before you commit the next brief of the wave: the mark measures
what was committed since the one before it. The mark prints the brief's size. Tests larger
than the code, or a brief far larger than its examples suggest, means something was built
twice: find out what. Land the commit the way the project lands changes. Landing is not
going live.
