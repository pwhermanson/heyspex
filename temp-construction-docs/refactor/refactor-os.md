<!--

Perfect — I’ve taken your uploaded `refactor-os.md` and merged in the **Single Task Enforcement Rule** and **Plan Progress / Resume Behavior** system. This way Cursor:

* Always works on **one task at a time**
* Reads your entire `refactor-plan.md`
* Knows what is checked off and what’s next
* Updates the plan as it completes tasks
* Keeps PR checklists and plan checklists in sync

-->

<!--
Cursor One Line prompt for getting started:

Act as a senior refactor engineer: use refactor-os.md as the rulebook for all refactoring. Load refactor-plan.md, auto-select the next unchecked task (or the task id set by `next:`), re-validate the plan before any edits, enforce single-task focus, run preflight and phased commits, typecheck and lint with zero new warnings, run build and tests after each change, open a draft PR with evidence and rollback steps, check off the PR checklist in real time, and on completion mark the corresponding plan checkbox to [x] with date, commit sha, and notes.
-->

````markdown
# Refactor OS for Cursor

## Executive Summary

This comprehensive refactoring plan addresses code quality, maintainability, and production readiness issues identified in the HeySpex codebase. The plan is organized into phases to minimize risk and ensure systematic improvement. We are aiming for an A+ grade like below:

### Grade: A+ Your codebase demonstrates excellent software engineering practices:

- ✅ Zero duplication of business logic
- ✅ Excellent modular organization
- ✅ Clear separation of concerns
- ✅ Consistent patterns throughout
- ✅ Centralized utilities properly used everywhere
- ✅ Clean architecture with logical module boundaries

---

**Purpose:** Turn Cursor into a reliable senior refactoring engineer that works from written plans, double checks relevance, and ships safe, incremental improvements.

---

## Single Task Enforcement Rule

Cursor must operate on exactly one task at a time. It may not begin a second task until:

1. The current task’s PR checklist is fully checked and the Checklist Completion Report is posted, and
2. The corresponding item in `refactor-plan.md` is updated from `[ ]` to `[x]` with a short completion note and commit hash.

If a prompt includes more than one task, Cursor must stop and ask which single task to proceed, or select the single next task from `refactor-plan.md` as specified in the Plan Progress section.

---

## Plan Progress: Ingest, Resume, Execute

Cursor must treat `refactor-plan.md` as the source of truth for overall sequencing. On every run:

1. **Load plan**

   - Open `refactor-plan.md` and scan for task lists using Markdown checkboxes.
   - Recognize tasks formatted as:
      - `- [ ] <task title>  id:<SOME_ID>`
      - `- [x] <task title>  id:<SOME_ID>  done:<YYYY-MM-DD> sha:<SHORT_SHA> notes:<short note>`

2. **Determine next task**

   - Select the earliest unchecked task `- [ ]` in reading order, unless a `next:` marker exists.

3. **Single task scope**

   - Treat the selected task as the only scope for this session.
   - Produce the Relevance and Self-check Gate output for this task only.

4. **Execute with guardrails**

   - Follow the Operating Workflow, commit policy, and validation steps already defined in this OS.

5. **Close out and persist state**

   - When complete:
      - Update PR checklist items.
      - Post Checklist Completion Report.
      - Update `refactor-plan.md` for the task to `[x]` and append `done`, `sha`, and `notes`.

6. **Branch naming and commits**
   - Continue to use `refactor/<area>/<short-description>-<ticket?>`.
   - Include the task id in the branch or commit, e.g. `refactor(header): extract Menu component  id:menu-extract`.

---

## Required Plan Format Example

```markdown
- [x] Baseline build and TS strict id:baseline done:2025-09-10 sha:a1b2c3d notes:tsconfig tightened
- [ ] Extract Header Menu id:menu-extract
- [ ] Rename getUserPermissions to resolveUserPermissions id:perm-rename
- [ ] Split API client by domain id:api-split

next: menu-extract
```
````

---

## 0. Relevance and self-check gate

Before doing anything, Cursor must do a quick pass to confirm the requested refactor is still the correct next step given the latest context.

- **Inputs to review:**

   - `refactor-plan.md` (your project plan)
   - This `refactor-os.md` document
   - The actual task request from the user
   - Recent diffs, open PRs, flaky tests, and CI state if available

- **Required output:**
  A 5–8 line summary that explains:

   1. The business value of the proposed refactor
   2. Why this is still the right step now
   3. Risks or blockers that changed since the plan was written
   4. What to do if the step is no longer optimal

- If this step shows the task is not optimal, propose a minimal alternative with lower risk and ask for confirmation.

---

## Global guardrails

- Safety first: never merge changes that break the build or tests.
- Minimal delta: make the smallest change that achieves the goal.
- One intent per commit.
- No new type or lint warnings.
- Public API changes require explicit compatibility notes and migration plan.
- Prefer small, reversible steps with clear rollback.

---

## Project command presets

```
BUILD_CMD: npm ci && npm run build
TEST_CMD_FAST: npm test -- -t "<pattern>"
TEST_CMD_FULL: npm test
LINT_CMD: npm run lint -- --max-warnings=0
TYPECHECK_CMD: npx tsc --noEmit
COVERAGE_CMD: npm run test:coverage
PKG_MANAGER: npm
RUN_IN_MONOREPO: false
```

---

## Operating workflow

### 1) Preflight

Produce Preflight JSON, then run `git status`, `git rev-parse --abbrev-ref HEAD`, `git log -5`.
Pause if uncommitted work exists.

### 2) Plan

Break task into 1–5 subtasks, each one atomic commit.

### 3) Baseline validation

Run `BUILD_CMD`, `TYPECHECK_CMD`, `LINT_CMD`.
If failing, fix baseline first.

### 4) Execute per subtask

- Edit
- Run `TYPECHECK_CMD`, `LINT_CMD`
- Run `TEST_CMD_FAST`, then `BUILD_CMD`
- If failures, revert minimal scope
- Commit and push branch

### 5) PR draft

Open draft PR with summary, diffs, evidence, checklist.

### 6) Post-merge

Create small follow-up tickets for deferred items.

---

## Branch, commit, and PR standards

- Branch: `refactor/<area>/<short-description>-<ticket?>`
- Commit template:

   ```
   refactor(scope): short imperative summary

   - why: <short reason>
   - what: <main files/modules>
   - risk: low|medium|high
   - rollback: git revert <sha>
   ```

- PR template provided (summary, preflight, evidence, reviewer checklist, follow-ups).

---

## Static analysis & codemods

- Prefer type-aware changes with ts-morph/jscodeshift
- Always dry run first, show diff
- Only apply if safe scope
- After codemod, run typecheck, lint, build, tests

---

## Test & coverage rules

- Behavioral refactors require updated tests
- Internal refactors require smoke tests
- Coverage drop >1% requires follow-up ticket

---

## Failure handling

- Capture full logs
- Revert minimal scope
- If needed, revert last commit
- Explain root cause & propose safer path

---

## Metrics & quality gates

- Build success on first try
- Files changed count
- Commits count
- Typecheck errors = 0
- Lint warnings = 0
- Test pass rate and coverage delta

Targets:

- ≤5 files per PR
- ≤5 commits per PR
- No new warnings

---

## Final checklist

Cursor must maintain this checklist in the PR body, mark items as complete in real time, and update `refactor-plan.md` when done.

```
[ ] 0. Relevance and self-check gate complete and still the right step
[ ] 1. Preflight JSON created and approved
[ ] 2. Baseline build, typecheck, lint green
[ ] 3. Subtasks defined and mapped to one-intent commits
[ ] 4. For each subtask: edits done, typecheck + lint + focused tests + build passed
[ ] 5. No new warnings introduced
[ ] 6. Full test suite passed or justified with follow-up ticket
[ ] 7. Coverage maintained within threshold or explained with follow-up
[ ] 8. Draft PR opened with evidence and reviewer checklist
[ ] 9. Branch and commit naming follow standards
[ ] 10. Rollback steps documented and tested on a dry run
[ ] 11. Post-merge follow-ups created if needed
[ ] 12. Checklist Completion Report posted with final status
```

**Checklist Completion Report format:**

```
CHECKLIST_COMPLETION_REPORT
- Completed: [list item numbers]
- Remaining: [list item numbers or 'none']
- Notes: <short notes or links to evidence>
```

```

---

Would you like me to also generate a **lightweight `refactor-checklist.md` file** (just the final checklist + report format) so you can drop it directly into every PR description as a template?
```
