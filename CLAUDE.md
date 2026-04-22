# DocFlow — Claude Instructions

## Workflow (MANDATORY after every task)

1. Run tests
2. If pass → `git add`, `git commit`, `git push`
3. If fail → fix, repeat until pass, then push

## Test commands

Update this section as stack evolves:

```bash
# No stack yet — update when configured
# npm test / pytest / cargo test / etc.
```

## Stack

TBD — update as project grows.

## Git

- Branch: `main`
- Remote: origin
- Commit style: conventional commits (`feat:`, `fix:`, `test:`, `chore:`)
- Always push after successful tests

## Rules

- No push if tests fail
- No skip tests
- Fix root cause, not symptoms
- No comments unless WHY is non-obvious
