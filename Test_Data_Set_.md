# Test Data Set — Online Internship & Placement Preparation Portal

**Owner:** Vinyas — Test Engineer  
**Purpose:** Reusable synthetic data for manual QA after a runnable test build and test environment are available.  
**Data classification:** Fictional test data only. Do not replace these entries with real student information or production credentials.

## 1. Test accounts

| Test ID | Role | Email / username | Setup guidance |
|---|---|---|---|
| U-STU-01 | Student | `student.test1@example.test` | Create through registration or seed in the approved test environment. |
| U-STU-02 | Student | `student.test2@example.test` | Separate student to verify user-data isolation. |
| U-REC-01 | Recruiter | `recruiter.test1@example.test` | Create using the team's approved test-account procedure. |
| U-REC-02 | Recruiter | `recruiter.test2@example.test` | Use to test listing ownership and non-owner authorization. |
| U-ADM-01 | Admin | `admin.test1@example.test` | Provision only through the approved admin setup process. |

**Credentials:** Set unique test passwords locally in the approved environment. Do not write passwords, tokens, session cookies, or real secrets into this file, issues, screenshots, or commits.

## 2. Internship listing fixtures

| Test ID | Title | Organisation | Location | Status | Purpose |
|---|---|---|---|---|---|
| INT-01 | Frontend Developer Intern | Sample Tech A | Bengaluru | Open | Positive listing, search by title/location |
| INT-02 | Backend Engineering Intern | Sample Tech B | Remote | Open | Search by keyword and remote location |
| INT-03 | QA Automation Intern | Sample Tech C | Mangaluru | Closed | Closed listing and filter behavior |

Use distinct, synthetic descriptions and deadlines when entering these records. Confirm the app's actual field requirements before creating them.

## 3. Application fixtures

| Test ID | Student | Listing | Initial status | Test purpose |
|---|---|---|---|---|
| APP-01 | U-STU-01 | INT-01 | Submitted | First application succeeds |
| APP-02 | U-STU-01 | INT-01 | Already exists | Duplicate application should be rejected |
| APP-03 | U-STU-01 | INT-02 | Under Review | Student sees own status; recruiter owner can update if permitted |
| APP-04 | U-STU-02 | INT-01 | Shortlisted | Verify another student's application is not disclosed to U-STU-01 |
| APP-05 | U-STU-02 | INT-02 | Rejected | Verify status display and user-data isolation |

The fixture statuses are examples. Use only status values supported by the implemented application.

## 4. Aptitude test fixture

**Test ID:** APT-01  
**Suggested duration:** 5 minutes, if the application allows test configuration  
**Scoring:** 1 point per correct response, no negative marks for this fixture

| Question ID | Question | Options | Expected answer |
|---|---|---|---|
| Q1 | What is 12 × 8? | A) 86; B) 96; C) 108; D) 88 | B |
| Q2 | Which data structure follows FIFO? | A) Stack; B) Queue; C) Tree; D) Graph | B |
| Q3 | What is the next number: 2, 4, 8, 16, __? | A) 18; B) 24; C) 32; D) 34 | C |
| Q4 | Which is commonly used to style web pages? | A) CSS; B) SQL; C) DNS; D) SMTP | A |
| Q5 | What does HTTP 404 generally indicate? | A) Success; B) Unauthorized; C) Not Found; D) Server Started | C |

Expected score checks: all correct = 5/5; all incorrect = 0/5; mixed responses = number of correct answers. Verify saved results and the timer independently.

## 5. Preparation resources

| Test ID | Category | Title | URL fixture | Purpose |
|---|---|---|---|---|
| RES-01 | Resume | Sample Resume Guide | `https://example.test/resources/resume-guide` | Category display and link handling |
| RES-02 | Aptitude | Sample Quantitative Practice | `https://example.test/resources/quant-practice` | Category filter and resource details |
| RES-03 | Interview | Sample Interview Checklist | `https://example.test/resources/interview-checklist` | Multiple categories and list rendering |

The `.test` URLs are placeholders and are not expected to be publicly reachable. Replace with controlled test fixtures or app-supported mock resources in the test environment. Do not classify an intentionally placeholder URL as an application defect unless link validation is in scope.

## 6. Invalid-input scenarios

| Test ID | Input | Expected behavior |
|---|---|---|
| NEG-01 | Required field omitted | Form/API rejects request and clearly identifies the invalid field. |
| NEG-02 | Malformed email such as `not-an-email` | Registration rejects the value. |
| NEG-03 | Duplicate email `student.test1@example.test` | Duplicate account is rejected without exposing sensitive account details. |
| NEG-04 | Unsupported resume file type | Upload is rejected safely with understandable feedback. |
| NEG-05 | Excessively long text in a normal text field | Input is validated or safely bounded; no crash or data corruption. |
| NEG-06 | Student directly requests another student's application | Server/API denies access and does not disclose protected data. |
| NEG-07 | Student or non-owner recruiter sends a status-update request | Server/API denies the unauthorized change. |
| NEG-08 | Missing, malformed, invalid, or expired authentication token | Protected API rejects the request. |

Use benign, controlled strings only in injection-validation tests; run them only in an approved non-production environment.

## 7. Execution record template

| Date | Build/commit | Test case ID | Actual result and evidence | Status | Defect link |
|---|---|---|---|---|---|
| — | — | — | Awaiting a runnable build and approved test environment | Not Run | — |

For each attempted test, record an observed result. Use **Blocked** when a specific test cannot be executed because a required build, environment, account, or dependency is unavailable; state the reason. Keep unattempted tests **Not Run**. Never infer Pass/Fail from expected behavior alone.

## 8. Environment and safety checklist

- [ ] Test URL/build commit and environment are recorded.
- [ ] Test accounts are synthetic and roles are provisioned through the approved process.
- [ ] No production data, real passwords, tokens, or personal information are used.
- [ ] Test records can be reset or recreated for repeatable runs.
- [ ] Authorization tests inspect server/API responses, not only UI visibility.
- [ ] Evidence links and screenshots contain no secrets or personal information.
