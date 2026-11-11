# Look

The owner is needed here. This is the design review.

Show every brief that is prototyped and waiting, in one stop:

- `shots/flows.html` as it now stands, and any example no flow reaches,
- one way to open it and try it, and a few lines on what to try,
- the one or two biggest issues you or the walkers found, each with a concrete fix and
  what it costs to build. Smaller ones are calls,
- the open questions (`decide.js questions`).

End your turn.

When they react, a maker changes the examples to match, and you run `proto-check.js`.
Something they accepted that needs a new example gets one before you call the brief
confirmed.

Repeat, using the real thing again each round. Aim for every persona finishing its task
without help and the skeptic's biggest objection answered. Then only the owner's clear yes
counts. For each brief they approved, first record the yes with
`decide.js add NN "<their words>"`, then run `state.js mark <NN> confirmed`. It records
exactly what they approved.
