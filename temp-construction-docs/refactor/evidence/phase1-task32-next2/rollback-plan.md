# Rollback Plan - phase1-task32-next2

1. If the draft PR is still open, run `gh pr close <pr-number>` to halt merge and annotate with rollback reasoning.
2. Once the changes land on `main`, create a fresh branch and run `git revert HEAD` to generate the rollback commit, then push it for review.
3. After the revert merges, run the baseline commands (`npx tsc --noEmit`, `npm run lint -- --max-warnings=0`, `npm test`, `npm run build`) to confirm the platform returns to its pre-refactor state.
4. Restore evidence archives in `temp-construction-docs/refactor/evidence/phase1-task32-next2/` for postmortem context, then update `refactor-plan.md` with a short rollback note.
