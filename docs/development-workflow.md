# Development and Pull-Request Workflow

## Branching Strategy

- Keep `main` as the shared integration branch.
- Create a separate branch for each issue or task.
- Use descriptive branch names, for example `sachin/nf005-maintainability`.
- Avoid committing task changes directly to `main`.

## Pull Requests

1. Push task changes to the corresponding remote branch.
2. Open a pull request targeting `main`.
3. Link the related issue using `Refs #<issue-number>`.
4. Describe the changes and the checks performed.
5. Request a teammate to review the changes.
6. Resolve review feedback before merging.
7. Merge only after the team has reviewed the PR and required checks have passed.

## GitHub Actions

The `Pull Request Checks` workflow runs when a pull request targets `main` and when changes are pushed to `main`.

The current workflow verifies that the README and required project documentation files exist and are non-empty.

Application build, unit-test, and integration-test jobs should be added when the corresponding application code and test commands are available.

## Team Review

The team should agree on reviewers, merge permissions, and the merge strategy. Keep pull requests open until the team is ready to review and merge them.