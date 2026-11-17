
# Development and Pull-Request Workflow

## 1. Purpose

This document defines the team's development, branching, pull-request, review, and integration process for the Online Internship and Placement Preparation Portal.

The objective is to maintain an organized development process and reduce integration issues when multiple team members contribute to the shared repository.

## 2. Branching Strategy

- Keep `main` as the shared integration branch.
- Create a separate branch for each issue or task.
- Use descriptive branch names, for example `sachin/nf005-maintainability`.
- Avoid committing task changes directly to `main`.
- Keep changes focused on the issue or task being addressed.

## 3. Pull-Request Process

1. Create a task branch from the latest `main`.
2. Make the required changes on that branch.
3. Commit changes with clear and meaningful commit messages.
4. Push the task branch to GitHub.
5. Open a pull request targeting `main`.
6. Link the related issue using `Refs #<issue-number>` or the appropriate closing keyword.
7. Describe the changes and checks performed.
8. Request a teammate to review the changes.
9. Resolve review feedback.
10. Merge only after the team has reviewed the pull request and required checks have passed.

## 4. GitHub Actions Workflow

The repository contains a GitHub Actions workflow named `Pull Request Checks`.

The workflow runs when:
- A pull request targets `main`.
- Changes are pushed to `main`.

The current workflow validates that the following documentation files exist and are non-empty:

- `README.md`
- `performance-tests/response-time-test-plan.md`
- `performance-tests/availability-test-plan.md`

The workflow currently performs documentation validation only.

It does not currently establish that the frontend builds successfully, backend tests pass, APIs work correctly, or the application is production-ready.

## 5. Future CI Improvements

The workflow can be extended with additional automated checks as the project and test coverage develop.

Possible improvements include:

- Frontend dependency installation and production build.
- Backend dependency installation.
- Backend unit tests.
- API integration tests.
- Code formatting and linting.
- Security and dependency checks.

These checks should only be described as implemented after they have been added to and verified in the workflow.

## 6. Team Review Responsibilities

- Reviewers should inspect the changes before approving a pull request.
- Contributors should address relevant review feedback.
- Merge decisions should follow the team's agreed process.
- Changes to shared application functionality should be communicated to affected team members.
- Documentation should be updated when implementation or workflows change.

## 7. Current Status

The branching, pull-request, review, and integration workflow has been documented.

A GitHub Actions workflow is present and performs baseline documentation validation.

Further automated application build and test checks remain possible improvements.

This workflow should be reviewed and updated as the team's development process evolves.
