# QA Bug Report
## Online Internship and Placement Portal

**Testing dates:** 16–17 November 2026
**Environment:** Local development environment with Neon test database

## BUG-004 — Case-Sensitive Duplicate Skills

**Status:** Open — Requires Product Owner confirmation  
**Severity:** Low–Medium  
**Module:** Student Profile → Skills

### Steps to Reproduce
1. Log in as a student.
2. Open Profile → Skills.
3. Add the skill `Python`.
4. Add the skill `python`.

### Actual Result
Both `Python` and `python` are accepted and displayed as separate skills.

### Expected Result
If skill names are intended to be case-insensitively unique, the second entry should be rejected or normalized.

### Impact
Students can create visually duplicate skills with different capitalization, reducing profile data consistency.

### Suggested Fix
Normalize skill names for duplicate comparison, or enforce case-insensitive uniqueness in the backend/database.

### Notes
Exact duplicate `Python` entries are correctly rejected with HTTP 409 and an error message. Case-insensitive uniqueness needs confirmation before treating this as a confirmed defect.

---

## Closed / Not Reproduced Suspicions

| ID | Initial Concern | Final Finding |
|---|---|---|
| BUG-001 | Duplicate skill error not visible | Error displayed at top of Profile page |
| BUG-002 | Oversized PDF error not visible | Correct validation error displayed |
| BUG-003 | Invalid education year range not rejected | Invalid range rejected |

These three items are not confirmed open defects.

## Evidence

See screenshots in `QA/screenshots/`.

## Final Status

**1 potential issue requiring clarification.**
No other confirmed defects are documented from the executed essential tests.
