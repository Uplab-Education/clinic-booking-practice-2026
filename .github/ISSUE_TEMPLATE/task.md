---
name: Practice task
about: Task for the clinic booking practice project
title: ""
labels: ["task"]
assignees: ""
---

## Context

Explain why this task is needed.

## Use Case

Link the scenario in docs/use-cases.md this task implements (e.g. UC-5).

## Expected Result

Describe what should be true after the task is done.

## Data Contract

Exact data shapes, query functions to call, and formulas. No guessing.

## Files to Touch / Reuse

- Files to create or change.
- Existing components/functions to reuse (src/components/ui, src/lib, src/db/queries).

## Rendering Notes

Which parts are Server Components and which need "use client", and why.

## Suggested Branch

```text
type/issue-number-short-description
```

## Acceptance Criteria

- [ ] Criteria 1
- [ ] Criteria 2
- [ ] All form controls have visible labels; status is not conveyed by color alone; async results are announced via aria-live
- [ ] No horizontal scroll at 390px viewport width
- [ ] Existing UI components from src/components/ui are reused, not copied
- [ ] Types are imported from src/db/schema.ts or src/lib, not duplicated
- [ ] `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` pass

## Checklist

- [ ] Issue is added to the GitHub Project board
- [ ] Branch is created from `main` and named after this issue number
- [ ] Pull request targets `main` and links this issue
- [ ] CI checks pass
- [ ] Assigned practice supervisor reviewed the PR
