# NF-003 Usability Study — Participant Record

**Project:** Online Internship & Placement Preparation Portal
**Issue:** #22 — NF-003 Usability
**Study owner:** Test Engineer
**Status:** Planned / awaiting participant sessions

> Do not mark NF-003 complete until sessions have actually been run and the observations are recorded. Use volunteers from the intended student audience. Obtain permission before taking notes; do not collect passwords, personal documents, or unnecessary personal information.

## Study objective

Check whether a student can find internships, submit an application, attempt an aptitude test, locate a previous result, and find/track preparation resources without avoidable confusion.

## Participants and setup

- Recruit **5 student volunteers** representative of the portal's intended student users. This is a proposed small formative sample; confirm the required sample size with the QA Lead/Product Owner if the sprint acceptance criteria specify one.
- Use the local development build and synthetic test accounts/data only.
- Include at least one desktop/laptop session and one mobile-sized viewport; record viewport/device category, browser and date for each session.
- Reset or use a fresh synthetic account per participant where practical so one participant's application/progress does not influence another's session.
- Do not ask participants to use their real placement credentials or enter sensitive data.

## Moderator introduction

“Thank you for helping test this student portal. We are evaluating the portal, not you. Please think aloud as you work. You may stop at any time. Use only the test account provided, and do not enter real personal information. With your permission, I will record task outcomes and approximate completion times.”

## Participant tasks

Give tasks without demonstrating the workflow first. Record success, time, errors, requests for help and participant comments.

| Task | Participant instruction | Success condition |
|---|---|---|
| U1 — Find an internship | Find the QA Intern opportunity in Hyderabad using the available search controls. | Opens the correct internship detail page. |
| U2 — Apply | Submit an application using the pre-populated test profile. | Receives confirmation and finds the application with Submitted status. |
| U3 — Find and start a test | Locate Aptitude Foundations and start it. | Opens the timed assessment and can identify how to answer a question. |
| U4 — Find a previous result | Locate the result from the completed sample attempt. | Finds the previous-results page and identifies the score. |
| U5 — Find a resource and track progress | Filter to Interview guidance and mark Interview Preparation Guidance complete. | Finds the resource and sees completion progress update. |

Do not let a participant submit multiple applications for the same internship; the portal should block duplicates. If a task is disrupted by test data or environment failure, record it as blocked rather than a usability failure.

## Measures to record

For each task, capture:
- Completion: completed independently / completed with help / not completed / blocked by environment.
- Approximate completion time (minutes:seconds).
- Number and type of errors or backtracks.
- Whether moderator assistance was required.
- Participant comment or observed point of confusion (brief, anonymized).

At the end, ask:
1. Which task was easiest, and why?
2. Which task was hardest or least clear?
3. What would you change first?
4. Did any label, button, status or message confuse you?

## Participant results

| Participant ID (P1–P5) | Device / viewport | Browser | U1 | U2 | U3 | U4 | U5 | Main observation |
|---|---|---|---|---|---|---|---|---|
| P1 |  |  |  |  |  |  |  |  |
| P2 |  |  |  |  |  |  |  |  |
| P3 |  |  |  |  |  |  |  |  |
| P4 |  |  |  |  |  |  |  |  |
| P5 |  |  |  |  |  |  |  |  |

Use concise outcome codes: **I** = independent completion, **H** = completed with help, **N** = not completed, **B** = blocked by environment. Add task times and brief notes in the study log below.

## Session notes

### P1
- Date / device / viewport / browser:
- Task times and outcomes:
- Errors / help required:
- Comments:

### P2
- Date / device / viewport / browser:
- Task times and outcomes:
- Errors / help required:
- Comments:

### P3
- Date / device / viewport / browser:
- Task times and outcomes:
- Errors / help required:
- Comments:

### P4
- Date / device / viewport / browser:
- Task times and outcomes:
- Errors / help required:
- Comments:

### P5
- Date / device / viewport / browser:
- Task times and outcomes:
- Errors / help required:
- Comments:

## Analysis and exit decision

After all sessions, summarize:
- Tasks completed independently / total task attempts.
- Tasks completed with help / total task attempts.
- Tasks not completed and environment-blocked tasks.
- Median or typical completion time per task (where enough data exists).
- Repeated points of confusion and severity.
- Prioritized recommendations, owner and target date.

Suggested reporting thresholds (confirm with the Product Owner/QA Lead before treating as acceptance criteria):
- At least 80% of task attempts completed independently.
- No unresolved critical usability blocker in a core student journey.
- Repeated confusion affecting multiple participants is recorded as a defect or improvement issue.

**Final status:** Leave as **Not Run** until participant sessions and analysis are completed. Attach anonymized notes/results to issue #22 and obtain QA Lead/Product Owner acceptance.
