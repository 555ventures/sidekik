# Build note

Write `sidekik/build-notes/<NN>-<slug>.md`, at most 60 lines. It is your working note for
whoever builds and reviews this brief, and the owner does not approve it. The prototype
already shows the behaviour, so the note holds only what an example cannot show. Use these
headings:

```
# <the brief's sentence>
## Examples         the prototype files this brief builds
## Behind them
## Reuse
## Done when        a list, each line starting with "- "
## Not doing
```

- **Behind them.** What is stored (following `sidekik/model.md` when there is one). The
  rules: who may do what, money, limits. What happens when something fails. What cannot be
  undone. For a change to an existing product: what happens to data that already exists
  and to users who know the old behaviour.
- **Reuse.** Run the project's index command and read the signatures of the areas this
  brief touches. Copy in the ones it must use, and name what will be changed in place and
  what will be deleted.
- **Done when.** Three to six things a user can do or see, and each rule or number from
  Behind them that this brief makes true. Each gets a test that can be run again. The test
  meets the rule the way a user or caller does: a refusal or a failure on the screen that
  shows it, a number read back from the running system, never only the layer that enforces
  it or the setting meant to set it. A confirmed exchange or case becomes its test
  directly. Only what cannot be automated is left to a walk by hand, and the note says
  which.

Run `state.js mark <NN> noted`.
