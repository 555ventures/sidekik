# Build

## Who builds

Independent briefs listed under `Also at this stage` are built at the same time, one
maker per brief. Give each its build note,
its prototype examples, `sidekik/briefs.md`, `sidekik/model.md` and the files it owns.

## Prove it

The walk through the product against its prototype is the reviewer's, at the next stage,
so that fresh eyes do it once.

Commit the brief as one commit of its own and run `state.js mark <NN> built` before the
next brief of the wave is committed or merged onto your branch. The mark prints the brief's size. Tests larger than the code, or a brief far
larger than its examples suggest, means something was built twice: find out what. Land
the commit the way the project lands changes.
