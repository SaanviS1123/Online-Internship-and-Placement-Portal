# Test Summary Report — Online Internship & Placement Preparation Portal

**Project:** Team 12 — Online Internship & Placement Preparation Portal\
**Role:** Test Engineer\
**Report date:** 30 October 2026\
**Related files:** `Test_Engineer_Pack.md`, `Test_Data_Set_.md`, `Test_Execution_Log.md`\
**Report status:** Interim — partial API checks executed; full functional and non-functional testing is incomplete.

## 1. Executive summary

The earlier report stated that no runnable backend was present and marked all 32 cases Blocked. That repository assessment is outdated. The main branch now contains an Express API for health, authentication, student profiles, internship listings/search/management, applications, and recruiter application review, plus a React/Vite frontend for login, internship browsing/details, student applications, and recruiter workflows. The local API smoke/negative-validation checks below were run against pre-PR-36 commit `308c1f7`, before the internship/application module was merged; they are not test evidence for the current main commit `4d443c1`.

The executed checks confirmed expected health, required-field validation, email/password/name-length validation, and access rejection for missing/invalid tokens on selected protected endpoints. However, successful account creation/login and data persistence were not tested because a PostgreSQL test connection was not configured. Several planned modules are still absent from main; some aptitude/resource behavior was checked only in a separate standalone prototype and is not evidence of integrated product functionality.

## 2. Current planned-case status (32 test cases)

| Measure | Count | Explanation |
|---|---:|---|
| Planned test cases | 32 | 21 functional + 11 non-functional/security |
| Pass | 0 | No planned case has all its defined scenarios completed. |
| Fail | 0 | No reproducible product defect was established in these checks. |
| Partial | 5 | Auth validation negative cases, NF-006 access guard, token validation, and input validation have observed passing sub-scenarios but incomplete coverage. |
| Blocked | 26 | Feature, DB/environment, deployed endpoint, or load environment prerequisite is absent. |
| Not Run | 1 | Maintainability review was not performed despite source code being available. |
| **Total** | **32** | |

**Important:** These are statuses of the 32 planned test cases, not a count of individual HTTP requests. A Partial case must not be reported as a complete pass.

## 3. Local API execution evidence

Fifteen HTTP requests were attempted across the session. Thirteen produced the expected observed outcome; two early invalid-token attempts returned HTTP 500 because the server process did not have `JWT_SECRET` set. After verifying and setting a temporary local test value in the server terminal and restarting the backend, a subsequent invalid-token request returned the expected HTTP 401.

Verified checks covered:

- `GET /api/health` returned JSON with `success: true` and the expected API-running message.
- Registration with empty required fields returned HTTP 400.
- Login with empty email/password returned HTTP 400.
- Registration rejected a malformed email, a name longer than 100 characters, a password shorter than 8 characters, and a 73-character ASCII password with HTTP 400 validation responses.
- `GET /api/auth/me`, `GET /api/profile`, `GET /api/student/dashboard`, and `PUT /api/profile` rejected requests without a token with HTTP 401.
- Invalid bearer-token requests to `/api/auth/me` and `PUT /api/profile` returned HTTP 401 after local JWT configuration was corrected.

The endpoint-level results and messages are recorded in `Test_Execution_Log.md`. The two initial HTTP 500 responses were caused by local configuration, corrected by setting `JWT_SECRET` in the server session and restarting the backend; they are not classified as confirmed product defects.

## 4. Environment and implementation findings

- **Backend:** Node.js / Express. Local test build: `308c1f7890309fd90a6cab10825a423adf2dcae1`. Current main rechecked after PR #36 merge: `4d443c138304b7c33a594a4f0db322d6a323c237`.
- **Database implementation in code:** PostgreSQL, indicated by the `pg` dependency, `backend/src/db.js`, `backend/src/schema.sql`, and `DATABASE_URL` configuration.
- **Documentation mismatch:** the base-main README before this QA update said the database was “to be confirmed,” while SRS v1.0 describes MongoDB. This QA PR updates the README to describe PostgreSQL as the current implementation and flags the need for Product Owner/tech-lead confirmation; the approved SRS baseline still needs to be synchronized.
- **DB-dependent checks:** not run successfully; a working PostgreSQL test database/connection was not established in this test session. Current main includes a seed script for one student and two recruiter demo accounts, but it still requires the team-approved PostgreSQL environment; no admin demo account is seeded.
- **Features now available in current main but not retested:** internship listings/search/management and application submission/tracking/recruiter status review (merged in PR #36). Those cases remain Blocked because the execution log reflects the pre-merge local build and a PostgreSQL-backed test run against current main has not been performed.
- **Features still not available in current main:** aptitude tests/scoring/history, placement resources/progress, and the admin module. The separate standalone prototype cannot count as integration evidence.
- **Performance plan:** a single successful health response is only a smoke check; no 100-sample performance run or 500-user load test has been performed.
- **Availability:** no complete 30-day monitoring window is available; the 99% metric remains pending.

## 5. Prototype-only evidence (separate from main product status)

A standalone React prototype on `feat/sprint1-aptitude-resources` was manually checked locally. Observed behaviors included aptitude listing cards and unavailable-test disabling; timer, answer selection/change, submission, a mixed score of 4/5 (80%) and demo auto-submit; and preparation-resource category filtering/opening. The Vite build succeeded. These checks support prototype behavior only. They must not be counted as passes for integrated main-branch test cases until the prototype is merged and end-to-end integration is verified.

## 6. Risks and remaining blockers

1. **Database-backed authentication/profile flows:** PostgreSQL test connection and seeded test users are needed for successful registration/login, unknown-user and wrong-password checks, profile persistence, duplicate email handling, and password storage review.
2. **Newly merged internship/application flows:** current main includes these APIs and UI pages, but the QA execution was performed against the prior build. Update the local checkout and establish the approved PostgreSQL test environment before executing listing, search, application, tracking, and recruiter-status tests.
3. **Remaining functional coverage:** aptitude tests/results, preparation resources/progress, and administration remain blocked because the integrated features are not present in current main.
4. **Role/security coverage:** the no-token and invalid-token checks are useful but do not cover all Student/Recruiter/Admin permissions, expired tokens, all input vectors, or deployed TLS.
5. **Non-functional validation:** response-time, 500-concurrent-user scalability, usability study, and 30-day availability measurement have not been performed.
6. **SRS/stack baseline:** PostgreSQL is implemented in code but the SRS and README are not aligned; team confirmation/documentation is needed.

## 7. Load-test acceptance proposal

For `TC-Scale-01`, the Test Engineer work pack proposes a 5-minute ramp to 500 concurrent virtual users followed by a 10-minute steady hold. Pass requires: (a) at least 90% of eligible normal requests complete in 3 seconds or less, matching the SRS response-time target; (b) p95 response time no greater than 5 seconds as an additional guardrail; (c) HTTP 5xx, timeouts and connection failures no greater than 1% of eligible business requests; and (d) no application crash or data-integrity failure. Expected 4xx responses from explicit negative-validation/authorization test scenarios should be excluded from the load-test error denominator and reported separately. The p95, error-rate, ramp, and hold thresholds are QA proposals and require Product Owner/tech lead approval before execution.

## 8. Conclusion

The current evidence demonstrates that selected API health, input-validation and authentication-guard checks behaved as expected on the earlier local build. The current main branch now contains integrated internship/application UI and APIs, but those additions have not yet been retested by QA. The evidence does not demonstrate a working database integration, full role authorization, end-to-end correctness of the integrated workflows, performance at 500 concurrent users, 99% monthly availability, or complete security coverage. The result is therefore **interim / incomplete**, not final sign-off. Continue from the case-by-case statuses in `Test_Execution_Log.md` and update the report when blocked dependencies are resolved and further test evidence is recorded.
