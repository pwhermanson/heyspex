# Draft PR � Phase 1 Test Stabilization (phase1-task32-next2)

## Summary

- Deep-clone members and projects fixtures, add store-level reset APIs, and expose explicit test helpers so Zustand state no longer bleeds between specs.
- Promote the command palette regression script to a first-class Vitest suite and align selector UX/tests ("No Project" placeholder, multi-node assertions).
- Capture preflight evidence (typecheck, lint, tests, build) and document rollback steps to unblock draft review of Phase 1 stabilization.

## Evidence

- Typecheck: `temp-construction-docs/refactor/evidence/phase1-task32-next2/tsc.log`
- Lint: `temp-construction-docs/refactor/evidence/phase1-task32-next2/lint.log`
- Tests: `temp-construction-docs/refactor/evidence/phase1-task32-next2/tests.log`
- Build: `temp-construction-docs/refactor/evidence/phase1-task32-next2/build.log`
- Preflight JSON records: `temp-construction-docs/refactor/preflight/phase1-task32-next2.json`

## Rollback

- Detailed instructions: `temp-construction-docs/refactor/evidence/phase1-task32-next2/rollback-plan.md`
- Quick command: `git revert HEAD`

## Reviewer Checklist Progress

- [x]  0. Relevance and self-check gate complete and still the right step
- [x]  1. Preflight JSON created and approved (see preflight directory)
- [x]  2. Baseline build, typecheck, lint green (see evidence logs)
- [x]  3. Subtasks defined and mapped to one-intent commits (captured in current HEAD)
- [x]  4. For each subtask: edits done, typecheck + lint + focused tests + build passed (logs above)
- [ ]  5. No new warnings introduced _(React act() advisories persist; see tests log, follow-up optional)_
- [x]  6. Full test suite passed or justified with follow-up ticket (Vitest run green; warnings noted)
- [x]  7. Coverage maintained within threshold or explained (no coverage delta; tests unchanged in scope)
- [ ]  8. Draft PR opened with evidence and reviewer checklist _(pending GitHub authentication)_
- [x]  9. Branch and commit naming follow standards (`refactor0926`, `refactor(stores): ...`)
- [x]  10. Rollback steps documented and tested on a dry run (see rollback plan)
- [x]  11. Post-merge follow-ups created if needed _(none required; warnings already tracked)_
- [ ]  12. Checklist Completion Report posted with final status _(to fill after PR body lands)_

## Next Actions

1. Authenticate with GitHub CLI (`gh auth login`) and run:
   ```bash
   gh pr create --draft --title "refactor: stabilize stores and tests (phase1-task32-next2)" \
      --body-file temp-construction-docs/refactor/draft-pr/phase1-task32-next2.md
   ```
2. Share draft PR link in the project channel and request review once checklist item 5 is resolved or waivered.
