# QA Test Report
## Online Internship and Placement Portal

**Test Engineer:** QA Team  
**Testing dates:** 16–17 November 2026  
**Environment:** Local frontend (localhost:5173), backend (localhost:4000), PostgreSQL (Neon test database)  
**Test type:** Manual functional, API, validation, authorization, and regression testing

## 1. Testing Summary

Manual testing covered student registration, authentication, profile management, education, skills, resume uploads, aptitude assessments, preparation resources, student data isolation, and administrator operations.

**Execution:** Test scenarios numbered through Test 41. Some tests contained multiple subtests. This is not a claim that all 41 scenarios passed or that every project requirement was covered.

## 2. Verified Results

| Area | Verification | Result |
|---|---|---|
| Authentication | Student registration and login | PASS |
| Authentication | Missing and invalid API tokens rejected | PASS |
| Student profile | Personal details and student account separation | PASS |
| Education | Add, edit, delete, required-field validation | PASS |
| Education | Invalid year range rejected | PASS |
| Skills | Add skills and reject exact duplicates | PASS |
| Resume | Upload, download, delete PDF | PASS |
| Resume | Reject invalid file type and files above 5 MB | PASS |
| Resume | Student cannot retrieve or delete another student's resume through their own endpoint | PASS |
| Assessments | Attempt history and student result isolation | PASS |
| Assessments | Server calculates scores; manipulated client scores ignored | PASS |
| Assessments | Answers rejected after submission | PASS |
| Resources | Completion progress saved separately per student | PASS |
| Admin | Student API requests to admin endpoints rejected | PASS |
| Admin | Admin login and console access | PASS |
| Admin | Change and restore a test user's role | PASS |
| Admin | Deactivate and reactivate an internship listing | PASS |
| Admin | Create and edit a preparation resource | PASS |
| Admin | Unavailable resource blocked for student | PASS |
| Admin | Self-demotion blocked in UI and API | PASS |

## 3. Defect Findings

### BUG-004 — Case-sensitive duplicate skills
**Status:** Open / Requires product decision  
**Severity:** Low–Medium

**Steps:** Add `Python` to a student profile, then add `python`.

**Observed:** Both skills are accepted as separate entries.

**Expected:** If skills are intended to be unique regardless of capitalization, the second entry should be rejected or normalized.

**Note:** Exact duplicates are rejected correctly with an error message. Case-insensitive uniqueness requires confirmation from the product owner.

## 4. Resolved Suspicions

- **BUG-001:** Duplicate skill error was visible at the top of the page; missing-feedback suspicion not confirmed.
- **BUG-002:** Oversized resume error was visible; missing-feedback suspicion not confirmed.
- **BUG-003:** Invalid education year range was rejected; missing-feedback suspicion not confirmed.

## 5. Limitations and Pending Coverage

- Full recruiter workflow and all existing internship/application routes were not reverified in this final testing session.
- Formal usability study was not performed.
- Separate last-administrator demotion scenario was not executed.
- Browser/device compatibility, load testing, and automated regression testing were not performed.
- Some results were verified through UI screenshots and manual observations rather than automated assertions.

## 6. Evidence

Screenshots collected during manual testing are available in the `QA/screenshots/` directory. Filenames retain their original capture timestamps.

## 7. Conclusion

The tested student, preparation, resume security, and administrator workflows behaved as expected in the local test environment, except for the case-sensitive skill duplication behavior requiring clarification.

**QA status:** Essential manual verification completed with documented limitations. Not a blanket production-release approval.
