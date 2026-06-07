---
description: Start the next undone backlog story (or a named one), scoped and verified.
argument-hint: "[optional story id, e.g. V1-E2-S1]"
---

Read `CLAUDE.md` and `docs/backlog.md` in full before doing anything else.

## Selecting the story
- If a story id was given as an argument (`$ARGUMENTS`), work on that story.
- Otherwise, scan `docs/backlog.md` top to bottom and select the **first story
  that is not marked done**. (Done stories are marked with the project's
  completion convention; treat anything without that marker as not done.)
- State clearly which story you selected and why (e.g. "selected V1-E2-S1; it is
  the first story without a done marker; its epic's dependencies — E1 — are
  complete"). If selection is ambiguous, or the next story's prerequisite epics
  are not done, **stop and ask** rather than guessing.

## Scope discipline
- Work on **that one story only**. Do not start the next story, and do not pull
  any later-phase work forward (see CLAUDE.md).

## Before writing any code
1. Restate the selected story's **acceptance criteria** verbatim from the backlog.
2. Name the **relevant `docs/spec.md` sections and ADRs** for this story, and
   read them.
3. Note any constraints from CLAUDE.md that bear on this story (e.g. opaque IDs,
   derived coverage, generic naming, config-not-inline, state-source boundary).
4. Propose a **short plan** (a few bullets) of what you'll change.
5. **Stop and wait for my go-ahead.** Do not write code until I confirm.

## After I approve, while implementing
- Keep the diff small and scoped to this story.
- Do not modify `docs/` or `CLAUDE.md`.
- Follow existing patterns (e.g. config values live in `src/config.ts`, not
  hardcoded inline).

## Before declaring the story done
- Restate each acceptance criterion and confirm it is met.
- Confirm the CI gates pass locally: `npx tsc -b`, `npm run lint`, `npm run build`.
- Summarise what changed and which criterion each part satisfies.
- Remind me to: review the diff, then branch → PR → let CI pass → review → squash-merge,
  and to mark the story done in `docs/backlog.md` after merge.
