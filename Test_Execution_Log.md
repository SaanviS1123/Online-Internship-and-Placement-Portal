# Test Execution Log — Online Internship & Placement Preparation Portal

**Tester:** Vinyas — Test Engineer\
**Execution date:** 29 October 2026\
**Repository:** `SaanviS1123/Online-Internship-and-Placement-Portal`\
**Local API test build:** `308c1f7890309fd90a6cab10825a423adf2dcae1` (pre-PR-36 authentication/student-profile build)\
**Current main rechecked:** `4d443c138304b7c33a594a4f0db322d6a323c237` (PR #36 internship/application module merge, 29 October 2026)\
**Source documents:** `Test_Engineer_Pack.md`, `Test_Data_Set_.md`\
**Log status:** Updated against the current main branch and locally executed API checks. This is not a final release sign-off.

> **Repository reassessment:** The earlier statement that `main` contained only `README.md` and `.gitignore` was stale. PR #35 added authentication/profile APIs; PR #36 has since merged internship/application APIs and a React/Vite frontend into `main`. The local API requests recorded below were run against the earlier `308c1f7` build before PR #36 was merged, so they are not retest evidence for the current `4d443c1` main. Current-main features are identified in the case notes, but no tests are marked Pass unless they were actually executed. Aptitude tests/results and preparation resources/progress remain on a separate prototype/branch and are not integrated-main evidence.

## 1. Test-case execution summary

There are 32 planned test cases: 21 functional and 11 non-functional/security. A case marked **Partial** has some observed scenarios that passed but the full case has not been completed.

| Status | Count | Meaning |
|---|---:|---|
| Pass | 0 | No complete planned test case has all its required scenarios verified. |
| Fail | 0 | No reproducible product defect has been established by these checks. |
| Partial | 5 | Some included scenarios passed; remaining scenarios are not yet covered or depend on DB/integrated features. |
| Blocked | 26 | A required feature, database/environment, deployed endpoint, or test setup is unavailable. |
| Not Run | 1 | Test is feasible to review from source, but no review/execution evidence has been recorded. |
| **Total** | **32** | |

A **Partial** result is not a full pass. Individual verified API outcomes are listed below so the evidence is not lost.

## 2. Functional test cases

| Test case ID | SRS requirement | Actual result / evidence | Status | Notes / blocker |
|---|---|---|---|---|
| TC-Auth-01 | PORTAL-F-001 | Valid registration and subsequent login were not attempted because database-backed account creation was not configured. | Blocked | Requires working PostgreSQL `DATABASE_URL` and test schema. |
| TC-Auth-01-N | PORTAL-F-001, PORTAL-SR-004 | Empty registration fields → HTTP 400; malformed email → 400; 101-character full name → 400; 6-character password → 400; 73-character ASCII password → 400. Observed messages matched the corresponding validation expectations. | Partial | Duplicate-email behavior was not tested; it requires a working database. |
| TC-Auth-02 | PORTAL-F-002 | Successful login was not tested. | Blocked | Requires database with a registered test user and configured JWT secret. |
| TC-Auth-02-N | PORTAL-F-002 | Login with empty email/password → HTTP 400 and `Email and password are required.` | Partial | Unknown-user and wrong-password scenarios were not tested because they query the database. |
| TC-Auth-03 | PORTAL-F-003 | No-token requests were rejected on protected endpoints, but no authenticated Student/Recruiter/Admin role matrix was executed. | Blocked | Needs valid test accounts/tokens and complete role authorization checks. |
| TC-Profile-01 | PORTAL-F-004 | `GET /api/profile` without a token → HTTP 401. Authenticated profile retrieval and persistence were not tested. | Blocked | Guard behavior is evidenced under the security checks; positive profile flow needs DB and a valid token. |
| TC-Profile-02 | PORTAL-F-005 | `PUT /api/profile` without a token → HTTP 401; with `Bearer invalid-token` → HTTP 401 on the pre-PR-36 build. Profile-field persistence was not tested. Current main accepts a resume URL; no file-upload flow was found in the current implementation. | Blocked | Needs current main checkout, valid student token, PostgreSQL test database, and test data; binary resume upload is not implemented in the inspected profile route. |
| TC-Intern-01 | PORTAL-F-006 | Current main contains the internship browse/detail API and React pages after PR #36. Not executed against the merged `4d443c1` build; the local run used pre-merge `308c1f7`. | Blocked | Requires updating the local checkout to current main and configuring/seeding the PostgreSQL test database before authenticated listing requests can be exercised. |
| TC-Intern-02 | PORTAL-F-007 | Current main contains keyword/location/organisation/eligibility query handling and an internship search page. No search/filter requests were executed against the merged build. | Blocked | Requires current main checkout, valid test token, PostgreSQL test database, and seeded listings. |
| TC-Intern-03 | PORTAL-F-008 | Current main contains recruiter listing create/update/close routes, recruiter UI, and server-side ownership checks. These scenarios were not executed against the merged build. | Blocked | Requires current main checkout, seeded recruiter accounts/listings, PostgreSQL test database, and owner/non-owner authorization execution. |
| TC-App-01 | PORTAL-F-009 | Current main contains the student apply route and internship detail UI. No successful application request was executed against the merged build. | Blocked | Requires current main checkout, PostgreSQL test database, seeded student profile with education details, and open internship fixture. |
| TC-App-02 | PORTAL-F-010 | Current main contains duplicate-application checking in the API and a unique `(student_id, internship_id)` database constraint. Duplicate and second-listing scenarios were not executed. | Blocked | Requires current main checkout, PostgreSQL test database, and repeatable seeded application fixtures. |
| TC-App-03 | PORTAL-F-011 | Current main contains the student applications API and React application-tracking page. No retrieval/refresh/data-isolation checks were executed against the merged build. | Blocked | Requires current main checkout, PostgreSQL test database, student accounts, and application fixtures. |
| TC-App-04 | PORTAL-F-012 | Current main contains recruiter review and status-update routes, with a server-side listing-owner check. These update and unauthorized-role scenarios were not executed. | Blocked | Requires current main checkout, PostgreSQL test database, seeded applications/listings, and owner/non-owner recruiter tokens. |
| TC-Test-01 | PORTAL-F-013 | A separate standalone prototype showed aptitude-test cards and an unavailable-test disabled state. This was not tested in the integrated main application. | Blocked | Prototype-only evidence; not evidence of main-branch integration. |
| TC-Test-02 | PORTAL-F-014 | Standalone prototype checks covered timer behavior, selecting/changing answers, submission, and a 30-second demo auto-submit. Main integration was not tested. | Blocked | Prototype-only evidence; not evidence of main-branch integration. |
| TC-Test-03 | PORTAL-F-015 | Standalone prototype produced a mixed-answer result of 4/5 (80%). This was not tested against an integrated main-branch backend. | Blocked | Prototype-only evidence; end-to-end result persistence in main is unverified. |
| TC-Test-04 | PORTAL-F-016 | No integrated aptitude-result history flow was verified against main. | Blocked | Aptitude test/results history module is not present in the current integrated main tree. Do not infer that prototype persistence proves this requirement. |
| TC-Prep-01 | PORTAL-F-017 | Standalone prototype showed resources, category filtering, and opening an external link. Main integration was not tested. | Blocked | Prototype-only evidence; not evidence of main-branch integration. |
| TC-Prep-02 | PORTAL-F-018 | Not executed against main. | Blocked | Preparation progress tracking is not present in the current integrated main tree. |
| TC-Admin-01 | PORTAL-F-019 | Not executed against main. | Blocked | An administration workflow/API module is not present in current main; the database schema accepting an `admin` role does not implement admin functions. A complete role test setup is also unavailable. |

## 3. Non-functional and security test cases

| Test case ID | SRS requirement | Actual result / evidence | Status | Notes / blocker |
|---|---|---|---|---|
| TC-Perf-01 | PORTAL-NF-001 | One local health request returned `success: true`; this is a smoke check, not the required 100-sample response-time study. | Blocked | Need representative integrated endpoints, stable approved environment, and timed measurements. |
| TC-Reliability-01 | PORTAL-NF-002 | No 30-day monitoring series or downtime evidence was collected. | Blocked | Requires an agreed deployed/staging environment and an approved measurement window. |
| TC-UX-01 | PORTAL-NF-003 | A React/Vite frontend for login, internship browsing, applications, and recruiter workflows is now present in main, but no participant-based usability study was conducted. | Blocked | Requires the current integrated frontend to be runnable with its backend/database and an agreed participant/task protocol. |
| TC-Scale-01 | PORTAL-NF-004 | No 500-concurrent-user load test was run. | Blocked | Requires an approved isolated load environment, data set, tool, and team-approved thresholds. |
| TC-Maint-01 | PORTAL-NF-005 | No structured maintainability review and change/regression exercise has been recorded. | Not Run | Backend source is available, but this test was not performed. |
| TC-Sec-01 | PORTAL-NF-006 | No-token requests to `/api/auth/me`, `/api/profile`, `/api/student/dashboard`, and `PUT /api/profile` returned HTTP 401. Invalid-token checks on `/api/auth/me` and `PUT /api/profile` returned HTTP 401 after JWT configuration was corrected. | Partial | Only selected access-control cases were exercised; this is not a complete security assessment. |
| TC-Sec-02 | PORTAL-SR-001 | Password hash-at-rest was not inspected. | Blocked | Requires approved database access and a test account; DB connection was not configured for this run. |
| TC-Sec-03 | PORTAL-SR-002 | Student/Recruiter/Admin permission matrix was not tested. | Blocked | Requires valid role identities/tokens and protected business endpoints. |
| TC-Sec-04 | PORTAL-SR-003 | Missing token → HTTP 401; invalid token → HTTP 401 after setting a temporary local `JWT_SECRET`. | Partial | Malformed and expired signed tokens were not tested. The first two invalid-token attempts returned HTTP 500 while `JWT_SECRET` was unset; after configuring it in the server terminal and restarting, the subsequent repeat returned the expected 401. Treat the two 500 responses as local setup issues, not confirmed product defects. |
| TC-Sec-05 | PORTAL-SR-004 | Required-field, invalid-email, overlong-name, and password-length checks returned expected HTTP 400 validation responses in registration/login APIs. | Partial | Injection-oriented cases, profile-specific validation and upload validation were not executed. |
| TC-Sec-06 | PORTAL-SR-005 | No deployed HTTPS/TLS URL was inspected. | Blocked | Local development over `http://localhost` does not prove deployed HTTPS/TLS. |

## 4. Observed local API checks (actual request evidence)

**Environment:** Windows PowerShell; local Node.js/Express backend started from the local pre-PR-36 checkout at commit `308c1f7`; base URL `http://localhost:4000`. These requests predate PR #36 merge commit `4d443c1` and do not validate the latest main build. Database-backed success paths were not tested. No credentials or secret values are recorded here.

| # | Request / scenario | Actual observed result | Outcome |
|---:|---|---|---|
| 1 | `GET /api/health` | JSON contained `success: true` and `Online Internship Portal API is running`. | Expected health response observed |
| 2 | `POST /api/auth/register` with empty full name/email/password | HTTP 400; `Full name, email, and password are required.` | Expected validation response |
| 3 | `POST /api/auth/login` with empty email/password | HTTP 400; `Email and password are required.` | Expected validation response |
| 4 | `GET /api/auth/me` without a token | HTTP 401; `Authentication token is required.` | Expected rejection |
| 5 | `GET /api/profile` without a token | HTTP 401 | Expected rejection |
| 6 | `GET /api/student/dashboard` without a token | HTTP 401 | Expected rejection |
| 7 | `GET /api/auth/me` with `Bearer invalid-token` (three attempts) | First two attempts, while the server process lacked `JWT_SECRET`, returned HTTP 500 with `Authentication is not configured.` After setting the temporary secret in the server terminal and restarting, the repeat returned HTTP 401 with `Invalid or expired authentication token.` | Final configured retest behaved as expected; the two earlier attempts were environment-configuration failures |
| 8 | `POST /api/auth/register` with `not-an-email` | HTTP 400; `Please provide a valid email address.` | Expected validation response |
| 9 | `POST /api/auth/register` with password `Short1` | HTTP 400; password must be at least 8 characters and no more than 72 bytes | Expected validation response |
| 10 | `POST /api/auth/register` with a 101-character name | HTTP 400; `Full name must not exceed 100 characters.` | Expected validation response |
| 11 | `POST /api/auth/register` with a 73-character ASCII password | HTTP 400; password must be at least 8 characters and no more than 72 bytes | Expected validation response |
| 12 | `PUT /api/profile` without a token | HTTP 401; `Authentication token is required.` | Expected rejection |
| 13 | `PUT /api/profile` with `Bearer invalid-token` | HTTP 401; `Invalid or expired authentication token.` | Expected rejection |

**Environment setup observation:** The first two invalid-token attempts returned HTTP 500 with `Authentication is not configured` because `JWT_SECRET` was absent in the server process. After the variable was verified in the server terminal, set in that same PowerShell session, and the backend restarted, the subsequent invalid-token request returned 401 as expected. The temporary secret was used for local testing only and must not be committed or reused in production.

## 5. Database and stack status

- The current backend implementation uses **PostgreSQL**: `backend/package.json` includes `pg`, the source has `backend/src/db.js` and `backend/src/schema.sql`, and its DB configuration reads `DATABASE_URL`.
- The submitted SRS still specifies MongoDB, while the base-main README before this QA update said the database was “to be confirmed.” This is a documentation/baseline mismatch. The updated README in this QA PR describes the PostgreSQL implementation and flags the outstanding formal decision; the Product Owner/tech lead should confirm the source-of-truth decision and align the approved SRS baseline accordingly.
- Database-backed registration, login, profile persistence, and password-hash checks remain untested because a working PostgreSQL connection/test schema was not established for this run. Do not imply that `npm install` or a healthy API endpoint proves the DB is working.

## 6. Execution summary and next actions

1. Keep the five cases marked Partial as Partial until their untested scenarios are completed; do not count them as full passes.
2. Resolve PostgreSQL test-environment setup with the developer/tech lead before testing successful registration, login, profile persistence, password hashes, duplicate identities, or role matrix.
3. PR #36 has now merged the internship/application module. Update the local checkout to current main and execute those cases after the approved PostgreSQL test environment and seed data are ready; keep them Blocked until actual execution. For aptitude, preparation-progress, and admin scenarios, wait until those integrated features are added. Standalone prototype results remain separate.
4. Apply the proposed load-test criteria in the work pack only after the Product Owner/tech lead approves them and an isolated test environment is ready.
5. Maintain the 30-day availability test as pending until sufficient monitoring data exists.
6. Create defect issues only for reproduced product failures. The two initial HTTP 500 responses caused by missing local `JWT_SECRET` were corrected by environment configuration and have not been classified as a product defect. Retest relevant auth/profile checks against current main `4d443c1` after updating the local checkout.

This log updates the previous stale “32 blocked because main has only README” statement. It does **not** claim all 32 cases are executed or the product is ready for release.
