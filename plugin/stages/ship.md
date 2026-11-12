# Ship

The owner is needed here. Nothing goes live without their yes.

1. **Release readiness.** Go through `## Before release` in `sidekik/stack.md`, when there is
   one, and say plainly what is done and what is not.
2. **A way to try it without going live**, through the way this project already releases
   or the way chosen at the stack stage: a preview address, a test build on a device, or
   an install to try. When it cannot be tried except on its real address, use the real
   address with real users kept out.
3. **The owner uses the real product.** Give them how to open it, what to try, the calls
   you made since the last ship, what going live changes for real users and real data, and
   how it can be taken back. End your turn.
4. **After a clear yes,** record it for the briefs it covers (`decide.js add NN` for each
   brief it covers), then take it live the same way: secrets through the env utility,
   health checked on the host's own address before any domain switch, the old version
   retired on the owner's yes, and confirm it is up by using it. An agent that touches
   production names the project, environment and service on every command, prints no value
   and deletes nothing.

Run `state.js mark shipped <NN ...>` for those briefs.
