# Shared agent entrypoint

Read [README.md](README.md), [docs/AGENT-WORKFLOW.md](docs/AGENT-WORKFLOW.md),
and [BUILDING.md](BUILDING.md) before editing. They own the task loop, release
policy, and validation rules; this file is a discovery pointer for coding agents.

- Follow the user's current task. For ordinary continuation, the generated
  Product Build Next block in README is the queue authority. Read the owner docs
  it names. Side-lane plans do not override that queue unless the user selects them.
- Check open PRs and continue the active release/product-hardening PR when one
  exists. Keep one coherent ownership area in one normal, non-draft PR.
- Record the goal, acceptance criteria, authored owners, generated outputs,
  validation plan, and scope boundary before implementation. Update the same PR
  with a factual handoff when work pauses or changes models.
- Edit authored sources and regenerate their projections. Review the generated
  diff; do not patch compiled bundles or create release-specific runtime layers.
- Preserve browser-local workspace compatibility and conservative Evidence
  boundaries. Obol does not execute commands. Keep private source material private.
- Use focused local checks while editing. Every PR still needs the complete
  regression and browser gates on its final head before it is merge-ready.

Use [docs/TEST-GOVERNANCE.md](docs/TEST-GOVERNANCE.md) for the live CI contract.
