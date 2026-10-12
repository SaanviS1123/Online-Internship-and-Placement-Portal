# Vinyas — Test Engineer Work Pack

**Project:** Online Internship & Placement Preparation Portal  
**Role:** S Vinyas Gangadkar — Test Engineer  
**Sources:** Team SRS v1.0, Software Test Plan v1.0, Mini-Project Deliverables Part-2  
**Prepared for:** 12–16 October 2026 dry-run/preparation week

> **Important status rule:** These are designed test cases, not proof of execution. Leave every case as **Not Run** until it has been executed against a working build. Record actual results and evidence; never mark a test Pass/Fail based only on the expected result.

## 1. Existing GitHub backlog found

The likely team repository is [SaanviS1123/Online-Internship-and-Placement-Portal](https://github.com/SaanviS1123/Online-Internship-and-Placement-Portal). Its current issues include F-001 through F-019 and NF-001 through NF-003. The current repository content is only initial setup/README and .gitignore, so a runnable portal was not visible in the repository during this review. Confirm with your team that this is the intended repository before uploading anything.

The available integration could read this repository but its write operations were rejected with a 403 permission error. Therefore **this pack has not been uploaded or committed to GitHub**. Follow the upload instructions below once the repository is confirmed.

## 2. Test cases — functional requirements

| Test Case ID | SRS requirement | Preconditions / test data | Steps | Expected result | Priority | Initial status |
|---|---|---|---|---|---|---|
| TC-Auth-01 | PORTAL-F-001 Registration | New email/identifier and valid required details | Open registration; complete required fields; submit; attempt login with new account | Account is created; success feedback shown; account can log in | High | Not Run |
| TC-Auth-01-N | PORTAL-F-001, SR-004 | Missing/invalid fields and an already-used email | Submit empty fields, invalid formats and a duplicate registration separately | Invalid/duplicate submissions are safely rejected with clear feedback; no duplicate account is created | High | Not Run |
| TC-Auth-02 | PORTAL-F-002 Login | Registered Student, Recruiter and Admin test accounts | Log in with valid credentials for each role | Access succeeds and correct role dashboard is displayed | High | Not Run |
| TC-Auth-02-N | PORTAL-F-002 | Unknown account and wrong password | Try unknown email, wrong password and missing fields | Login is rejected; useful error message appears; protected content remains inaccessible | High | Not Run |
| TC-Auth-03 | PORTAL-F-003 Role-based access | Test accounts for all three roles | For each role, open permitted and restricted pages; attempt restricted API operations if available | Only permitted actions succeed; server/API enforces role checks, not only UI hiding | High | Not Run |
| TC-Profile-01 | PORTAL-F-004 Student profile | Authenticated Student account | View profile; edit details; save; refresh/reopen profile | Saved information persists and displays correctly | High | Not Run |
| TC-Profile-02 | PORTAL-F-005 Education, skills, resume | Student account; valid and invalid sample resume files | Add/edit education and skills; upload valid resume; try unsupported file type | Valid data persists; invalid file/data rejected with understandable feedback | High | Not Run |
| TC-Intern-01 | PORTAL-F-006 View internships | At least two internship listings; also prepare empty-list scenario | Open listing page; inspect listing details; test empty state if possible | Available listings/details display correctly; empty state is clear | High | Not Run |
| TC-Intern-02 | PORTAL-F-007 Search/filter | Listings with known keywords/locations/organisations | Search keyword; use single and combined filters; clear filters; search for no matches | Only matching items display; reset works; no-results message appears | High | Not Run |
| TC-Intern-03 | PORTAL-F-008 Manage listings | Recruiter/Admin and Student accounts | Recruiter creates, edits and closes a listing; Student/non-owner attempts modification | Authorized changes persist; unauthorized modification is denied | High | Not Run |
| TC-App-01 | PORTAL-F-009 Apply for internship | Authenticated Student with profile; active internship | Apply once to an available internship | One application is recorded with correct student and internship; confirmation is shown | High | Not Run |
| TC-App-02 | PORTAL-F-010 Duplicate prevention | Student and one active internship already applied to | Apply again to same internship; then apply to a different internship | Duplicate is rejected; application to a different internship can succeed | High | Not Run |
| TC-App-03 | PORTAL-F-011 Track application | Student with applications at different statuses | Open tracking page; refresh after status changes | Student sees only own applications and current status | High | Not Run |
| TC-App-04 | PORTAL-F-012 Update application status | Recruiter owns an internship with an application | Update status; log in as student to check; try update as unauthorized role | Authorized status change persists and is shown to student; unauthorized update is rejected | High | Not Run |
| TC-Test-01 | PORTAL-F-013 View aptitude tests | Available test plus unavailable/empty scenario | Open test list; inspect title, description, duration; try unavailable test | Available tests display correctly; unavailable test cannot be started; empty state is clear | High | Not Run |
| TC-Test-02 | PORTAL-F-014 Timed test | Test with known duration and questions | Start test; answer/change answers; submit early; in separate run allow timer to expire | Timer and submission follow configured duration; responses are saved | High | Not Run |
| TC-Test-03 | PORTAL-F-015 Automatic evaluation | Test with known answer key and expected score | Submit all-correct, all-wrong and mixed answers in separate attempts; compare score to answer key | Score and correct/incorrect counts are calculated correctly and saved | High | Not Run |
| TC-Test-04 | PORTAL-F-016 Previous results | Student with a completed test and a student with no history | View history for both accounts; open a result | Correct student's attempts/scores appear; empty history has helpful message | Medium | Not Run |
| TC-Prep-01 | PORTAL-F-017 Preparation resources | Multiple resources in known categories, including one invalid link if available | Browse categories; open resources; try unavailable link | Resources appear under correct category; accessible links work; unavailable links are handled clearly | High | Not Run |
| TC-Prep-02 | PORTAL-F-018 Preparation progress | Student and at least two preparation items | Mark an item complete; navigate away; return; log in as another Student | Completion persists for the right student and pending/completed status is accurate | Medium | Not Run |
| TC-Admin-01 | PORTAL-F-019 Administration | Admin, Student and Recruiter accounts plus test records | Admin creates/updates/removes an allowed record; non-admin attempts same action | Admin operation persists; unauthorized roles are denied; feedback is understandable | High | Not Run |

## 3. Test cases — non-functional and security requirements

| Test Case ID | SRS requirement | Steps / measurement | Expected result | Priority | Initial status |
|---|---|---|---|---|---|
| TC-Perf-01 | PORTAL-NF-001 Response time | Define normal scenarios and environment; measure requests repeatedly with timestamps or suitable tool | At least 90% of normal requests finish within 3 seconds under agreed conditions | High | Not Run |
| TC-Reliability-01 | PORTAL-NF-002 Availability | Agree measurement period and scheduled-maintenance exclusions; record uptime/outages | Measured availability is at least 99%; failures and recovery are documented | High | Not Run |
| TC-UX-01 | PORTAL-NF-003 Usability | Ask representative users to complete registration/login, find internship, apply and find resources; inspect labels, errors and screen sizes | Interface/navigation is consistent; common tasks can be completed without confusing navigation | Medium | Not Run |
| TC-Scale-01 | PORTAL-NF-004 Scalability | With team approval, run a load test in a safe test environment with at least 500 concurrent users and record latency/errors | Test results show whether the 500-concurrent-user target is met; no unsupported Pass claim without load evidence | Medium | Not Run |
| TC-Maint-01 | PORTAL-NF-005 Maintainability | Review module boundaries; after a module change run relevant regression tests across unrelated modules | Modular changes do not affect unrelated modules; observations and evidence are recorded | Medium | Not Run |
| TC-Sec-01 | PORTAL-NF-006 Security | Verify access controls protect profiles, credentials, applications and test results from unauthorized access | Unauthorized access is prevented; findings are logged | High | Not Run |
| TC-Sec-02 | PORTAL-SR-001 Secure password storage | With approved test DB access, inspect stored credential representation; never copy real passwords into reports | Passwords are hashed and not stored as plaintext | High | Not Run |
| TC-Sec-03 | PORTAL-SR-002 Role authorization | Repeat restricted page/API tests for Student, Recruiter and Admin roles | Unauthorized functions are denied by server-side authorization | High | Not Run |
| TC-Sec-04 | PORTAL-SR-003 Token validation | Attempt protected request with missing, malformed, invalid and expired token | Invalid/expired token is rejected; protected data is not returned | High | Not Run |
| TC-Sec-05 | PORTAL-SR-004 Input validation | In a test environment, send invalid values and safe, controlled injection-test strings into input fields/API | Input is rejected or safely handled; no injection behavior/data corruption occurs | High | Not Run |
| TC-Sec-06 | PORTAL-SR-005 HTTPS/TLS | Inspect deployed client-server URLs and transport/security details in browser/network tooling | Client-server communication uses HTTPS/TLS in the deployment being tested | High | Not Run |

## 4. Data to prepare for dry run

Use fictional test data only.

- Student accounts: `student.test1@example.test`, `student.test2@example.test`
- Recruiter account: `recruiter.test1@example.test`
- Administrator account: `admin.test1@example.test`
- Internship fixtures: at least three listings with different titles, organisations, locations, deadlines and eligibility values.
- Applications: one initial application, one duplicate attempt, and applications representing different statuses.
- Aptitude tests: one test with known duration and a small answer key (for example, 5 questions with a known correct-answer count).
- Preparation resources: two or more categories, several valid resources and one deliberately unavailable URL only if safe to test.
- Invalid inputs: missing required values, invalid format, overlong text and unsupported file type.

Do not use real personal data, real passwords, or production accounts.

## 5. Defect report template

Copy this for each actual failure. Keep the actual result and evidence factual.

```text
Defect ID/title:
Related SRS requirement:
Related test case ID:
Environment/build/browser:
Preconditions/test data (no secrets):
Steps to reproduce:
Expected result:
Actual observed result:
Severity: Critical / High / Medium / Low
Priority: High / Medium / Low
Evidence link (redact personal/sensitive data):
Assigned developer:
Status: Open / In Progress / Fixed / Retest / Closed
Retest result:
```

## 6. Test execution log template

| Date | Build/commit | Test Case ID | Tester | Actual result/evidence | Status (Pass/Fail/Blocked/Not Run) | Defect link |
|---|---|---|---|---|---|---|
| — | — | — | Vinyas | Waiting for runnable build | Not Run | — |

## 7. Suggested testing backlog item for GitHub

**Title:** `QA: Prepare SRS-traceable test cases and Sprint dry-run evidence`

**Owner:** `VINYAS10` (confirm the actual GitHub username/assignment with team)  
**Suggested estimate:** 5 story points — proposal only; team must agree and record it in the Project's Story Points field.

**Description to paste into the Issue body:**

Prepare testing deliverables using SRS v1.0 and Software Test Plan v1.0. Design cases for PORTAL-F-001–F-019, PORTAL-NF-001–NF-006 and PORTAL-SR-001–SR-005. Map each test to requirement IDs, include steps and expected results, prepare fictional test data, and create execution-log and defect-report templates. Execute cases only when a working build and test environment are available. Record actual results and evidence; do not mark unexecuted cases Pass/Fail.

**Acceptance criteria:**
- Every in-scope FR/NFR/security requirement is mapped to test case(s).
- Cases have IDs, steps, expected results, priority and initial status Not Run.
- Test data, execution log and defect template are prepared.
- Actual test results are recorded only after execution against a build.

### Additional QA backlog items (proposed; add only after checking with the team)

| Suggested issue title | Scope | Suggested points | Suggested timing |
|---|---|---:|---|
| QA: Prepare fictional test data and test environment checklist | Create role-based test-account plan, internship/application fixtures, aptitude test/answer-key fixtures and environment readiness checklist | 2 | Dry run / 12–16 Oct |
| QA: Execute Sprint 1 smoke and system tests; log and retest defects | Run relevant tests for implemented authentication, profiles, listings and applications; file defects and retest fixes | 5 | Sprint 1 / 19–23 Oct |
| QA: Execute Sprint 2 security, NFR and regression tests; prepare summary | Verify implemented remaining modules; run security/regression checks; conduct performance/load checks only with suitable environment; prepare final summary | 8 | Sprint 2 / 26–30 Oct |

These are proposed QA-work estimates, not estimates for implementing every product feature. Story points are relative estimates; the whole team/QA Lead should agree and then enter points in the Project field. Do not assign Sprint 1/2 until the team confirms scope and build dependencies.

## 8. Suggested sprint placement

The assignment sheet fixes Sprint 1 as 19–23 October and Sprint 2 as 26–30 October, with 12–16 October available for a dry run. Ask your team to confirm the final mapping. Suggested testing sequence:

- **12–16 Oct dry run/preparation:** review existing requirement issues, prepare test cases and fictional data, agree test environment, practice issue → execute → defect → retest workflow.
- **Sprint 1 (19–23 Oct):** smoke/system testing for the features that are actually implemented; authentication, roles, profile, internships and applications are reasonable early candidates if available.
- **Sprint 2 (26–30 Oct):** test remaining implemented modules, execute regression, and perform performance/security/load tests only if a suitable build/environment/tool is available; prepare test summary.

This is a proposal, not a sprint commitment; confirm with the QA Lead and team.

## 9. What belongs in GitHub vs what needs a commit

- GitHub **Issues/Project fields** (assignee, story points, sprint/status) are updated in the browser; they do not require a code commit.
- This Markdown file is a **repository document**. For the simplest browser upload, add it at the repository root as `Vinyas_Test_Engineer_Pack.md`; alternatively, create `docs/testing/test-cases.md`. Follow your team's branch-and-pull-request workflow rather than committing directly to `main`.
- Executing tests against the application does not itself require a commit. Test scripts or documentation changes do.
- The connector could read the repository but rejected write operations with a 403. The file has therefore not been uploaded automatically.
