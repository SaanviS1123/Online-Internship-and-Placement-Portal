Vinyas — Test Engineer Work Pack (Revision 3)
Project: Online Internship & Placement Preparation Portal — Team 12  
Role: S Vinyas Gangadkar — Test Engineer  
Updated: 26 October 2026  
Source baseline: SRS v1.0, Software Test Plan v1.0, Mini-Project Deliverables Part-2  
GitHub follow-up: Pull request #23 — review changes requested on 20 October 2026
> **Execution integrity:** All cases remain **Not Run** until executed against a working build. If a dependency/build/environment prevents execution, use **Blocked** and explain why. Do not invent actual results or evidence.
1. Current status and review follow-up
The team repository is SaanviS1123/Online-Internship-and-Placement-Portal.
The Test Engineer pack is in pull request #23. It is open and has not been merged.
The review requested: (1) an explicit RTM row for every NFR including NF-006 → TC-Sec-01; (2) server-side authorization checks for listing and application-status tests; (3) concrete performance and availability measurement methods; (4) an updated schedule; and (5) agreement on the actual database/stack.
The current repository README identifies React and Node.js/Express but says the database is “to be confirmed.” The submitted SRS specifies MongoDB. The team must confirm the actual database choice and align the README/SRS implementation references before database-specific execution. Do not assume implementation details that have not been confirmed.
2. Test cases — functional requirements
Test case ID	SRS requirement	Preconditions / data	Steps	Expected result	Priority	Initial status
TC-Auth-01	PORTAL-F-001 Registration	New test identity and valid required fields	Register; then attempt login with the new account	Account is created and can subsequently log in	High	Not Run
TC-Auth-01-N	PORTAL-F-001, PORTAL-SR-004	Missing/invalid fields and a duplicate identity	Submit missing fields, invalid formats and duplicate registration separately	Invalid/duplicate submissions are rejected; useful validation feedback appears	High	Not Run
TC-Auth-02	PORTAL-F-002 Login	Student, Recruiter and Admin test accounts	Log in with valid credentials for each role	Login succeeds and the appropriate role dashboard appears	High	Not Run
TC-Auth-02-N	PORTAL-F-002	Unknown account and wrong password	Try unknown account, wrong password and missing fields	Access is denied and protected pages/data remain unavailable	High	Not Run
TC-Auth-03	PORTAL-F-003 Role-based access	Test accounts for all three roles	For each role, request permitted and restricted pages and APIs	Only authorized actions succeed; role checks are enforced server-side, not only by hiding UI controls	High	Not Run
TC-Profile-01	PORTAL-F-004 Student profile	Authenticated Student account	View, edit and save profile; refresh/reopen it	Updated data persists and displays correctly	High	Not Run
TC-Profile-02	PORTAL-F-005 Education, skills, resume	Student account and valid/invalid sample files	Add/update education and skills; upload valid and unsupported resume files	Valid details persist; unsupported files/invalid data are rejected with clear feedback	High	Not Run
TC-Intern-01	PORTAL-F-006 View internships	Multiple listings; include empty-list case if available	View listing page and details	Available listings show expected details; empty state is handled clearly	High	Not Run
TC-Intern-02	PORTAL-F-007 Search/filter	Listings with known titles, organisations and locations	Search keyword; apply single and combined filters; clear filters; search for no matches	Results match criteria; filters reset correctly; no-results feedback appears	High	Not Run
TC-Intern-03	PORTAL-F-008 Manage listings	Recruiter owner, another Recruiter, Student and Admin test accounts	Owner creates/edits/closes own listing; non-owner Recruiter, Student and any unauthorized role attempt the same API/action directly where API access is available	Authorized changes persist; server/API rejects every unauthorized create/update/close attempt even if the UI is bypassed	High	Not Run
TC-App-01	PORTAL-F-009 Apply	Authenticated Student and available internship	Submit one application	Application is stored against the correct student and internship; confirmation is shown	High	Not Run
TC-App-02	PORTAL-F-010 Duplicate prevention	Student has already applied to one internship	Apply again to same internship; separately apply to a different internship	Duplicate is rejected; a different internship can still be applied to	High	Not Run
TC-App-03	PORTAL-F-011 Track status	Student accounts with different applications/statuses	Open and refresh the application tracker	Student sees only their own applications and current statuses	High	Not Run
TC-App-04	PORTAL-F-012 Update application status	Recruiter owner, non-owner Recruiter, Student and application record	Owner updates status; Student checks updated status; non-owner/Student sends a direct unauthorized status-update request to the API where available	Authorized update persists and appears to the relevant student; server/API rejects unauthorized status-update requests	High	Not Run
TC-Test-01	PORTAL-F-013 View aptitude tests	Available test and unavailable/empty scenario	View list, inspect details and try unavailable test	Available tests display expected details; unavailable test cannot start; empty state is clear	High	Not Run
TC-Test-02	PORTAL-F-014 Timed test	Test with known duration	Start test, change answers, submit early; in a separate run let timer expire	Timer and submission follow configured duration; submitted answers are saved	High	Not Run
TC-Test-03	PORTAL-F-015 Automatic evaluation	Test with known answer key and expected scores	Submit all-correct, all-wrong and mixed answers; compare result with answer key	Score and correct/incorrect counts are correct and saved	High	Not Run
TC-Test-04	PORTAL-F-016 Previous results	Student with a completed attempt and Student with none	Review history for both accounts and open a result	Only the correct student's results appear; empty history has a useful message	Medium	Not Run
TC-Prep-01	PORTAL-F-017 Preparation resources	Resources in multiple categories and known valid links	Browse categories and open resources; check a deliberately unavailable link if safe	Resources are categorized and accessible; unavailable links are handled clearly	High	Not Run
TC-Prep-02	PORTAL-F-018 Preparation progress	Student and at least two preparation items	Mark item complete, navigate away, return; check from a second Student account	Completion persists for the correct student; completed/pending status is accurate	Medium	Not Run
TC-Admin-01	PORTAL-F-019 Administration	Admin, Student and Recruiter accounts plus test records	Admin manages an allowed record; non-admin attempts equivalent operation	Authorized admin changes persist; non-admin actions are denied	High	Not Run
3. Non-functional and security test methods
Test case ID	SRS requirement	Method and environment	Acceptance criteria	Priority	Initial status
TC-Perf-01	PORTAL-NF-001 Response time	In the agreed staging/test environment, record build/commit, browser, hardware, network and data set. Select representative normal read and user-action requests. Run 10 warm-up requests, then collect at least 100 timed samples per representative scenario using Postman Runner or an agreed equivalent. Report sample count, median, p90, failures and slowest endpoints. Avoid repeated state-changing requests unless test data is reset between samples.	The SRS target is that at least 90% of normal requests respond within 3 seconds; measured p90 is ≤3 seconds for the agreed request mix. Attach exported results/logs.	High	Not Run
TC-Reliability-01	PORTAL-NF-002 Availability	Proposed method for QA Lead/team approval: monitor the agreed staging/deployed service for a full 30-day measurement window, with an automated health check every minute. Record timestamps, failed checks, incidents/recovery and scheduled maintenance separately. Report environment, check count and formula: successful eligible checks ÷ total eligible checks × 100. A shorter observation is preliminary only, not proof of a monthly 99% target.	At least 99% availability over the approved measurement window, excluding only documented scheduled maintenance. Provide check logs and downtime summary.	High	Not Run
TC-UX-01	PORTAL-NF-003 Usability	Ask at least 5 representative test users to attempt common tasks (register/login, find an internship, submit/view application, find a preparation resource). Record task completion, confusion points and validation-message issues across agreed screen sizes.	Users can complete the agreed core tasks; navigation/labels are consistent and validation is understandable. Report participants, tasks and observations.	Medium	Not Run
TC-Scale-01	PORTAL-NF-004 Scalability	With team approval, in an isolated test environment, use an agreed load tool and safe test data to ramp to at least 500 concurrent users. Record ramp profile, duration, response-time percentiles, error rate and environment/build.	Evidence shows whether 500 concurrent users are supported under agreed load conditions; attach the load report. Do not claim pass without recorded results.	Medium	Not Run
TC-Maint-01	PORTAL-NF-005 Maintainability	Review module boundaries and change history; after a controlled change to one module, run relevant regression tests for adjacent and unrelated modules. Record modules reviewed and tests run.	Changes remain localized and do not break unrelated modules; review and regression evidence is documented.	Medium	Not Run
TC-Sec-01	PORTAL-NF-006 Security	Using dedicated test accounts in a staging environment, attempt unauthorized access to protected profiles, credentials, applications, test results and admin functions. Inspect server/API responses, not only visible UI.	Unauthorized requests are denied and protected data is not disclosed or modified. Record endpoint/role, response and safe evidence.	High	Not Run
TC-Sec-02	PORTAL-SR-001 Secure password storage	After the team confirms the actual database/stack, inspect a test account's stored credential representation with approved test DB access. Never include actual passwords in evidence.	Credentials are hashed and not stored as plaintext.	High	Not Run
TC-Sec-03	PORTAL-SR-002 Role-based authorization	Send protected requests as Student, Recruiter and Admin and compare permissions, including direct API requests.	Server-side authorization rejects roles that lack permission.	High	Not Run
TC-Sec-04	PORTAL-SR-003 Token validation	Send protected requests with missing, malformed, invalid and expired tokens.	Invalid/expired tokens are rejected; protected data is not returned.	High	Not Run
TC-Sec-05	PORTAL-SR-004 Input validation	In staging, send invalid data and safe, controlled injection-test strings through forms/APIs.	Invalid/malicious inputs are rejected or safely handled without injection or data corruption.	High	Not Run
TC-Sec-06	PORTAL-SR-005 HTTPS/TLS	Inspect the actual deployed URLs and browser/network transport details. Do not use a local HTTP-only development server as evidence of deployed HTTPS.	Deployed client-server communication uses HTTPS/TLS. Record the exact environment and evidence.	High	Not Run
4. Requirements Traceability Matrix (RTM)
This matrix explicitly maps all 19 functional requirements, all six non-functional requirements and all five security requirements to test cases.
SRS requirement	Short description	Test case(s)	Initial status
PORTAL-F-001	User registration	TC-Auth-01, TC-Auth-01-N	Not Run
PORTAL-F-002	User login	TC-Auth-02, TC-Auth-02-N	Not Run
PORTAL-F-003	Role-based access	TC-Auth-03, TC-Sec-03	Not Run
PORTAL-F-004	Manage student profile	TC-Profile-01	Not Run
PORTAL-F-005	Education, skills and resume	TC-Profile-02	Not Run
PORTAL-F-006	View internships	TC-Intern-01	Not Run
PORTAL-F-007	Search and filter internships	TC-Intern-02	Not Run
PORTAL-F-008	Manage internship listings	TC-Intern-03	Not Run
PORTAL-F-009	Apply for internship	TC-App-01	Not Run
PORTAL-F-010	Prevent duplicate applications	TC-App-02	Not Run
PORTAL-F-011	Track application status	TC-App-03	Not Run
PORTAL-F-012	Update application status	TC-App-04	Not Run
PORTAL-F-013	View aptitude tests	TC-Test-01	Not Run
PORTAL-F-014	Attempt timed aptitude test	TC-Test-02	Not Run
PORTAL-F-015	Automatic evaluation and scoring	TC-Test-03	Not Run
PORTAL-F-016	View previous results	TC-Test-04	Not Run
PORTAL-F-017	Placement preparation resources	TC-Prep-01	Not Run
PORTAL-F-018	Track preparation progress	TC-Prep-02	Not Run
PORTAL-F-019	Administration	TC-Admin-01	Not Run
PORTAL-NF-001	Response time ≤3 seconds for ≥90% of normal requests	TC-Perf-01	Not Run
PORTAL-NF-002	Availability ≥99% excluding scheduled maintenance	TC-Reliability-01	Not Run
PORTAL-NF-003	Usability	TC-UX-01	Not Run
PORTAL-NF-004	At least 500 concurrent users	TC-Scale-01	Not Run
PORTAL-NF-005	Maintainability	TC-Maint-01	Not Run
PORTAL-NF-006	Security / protect data from unauthorized access	TC-Sec-01	Not Run
PORTAL-SR-001	Secure password storage	TC-Sec-02	Not Run
PORTAL-SR-002	Role-based authorization	TC-Sec-03	Not Run
PORTAL-SR-003	Token validation	TC-Sec-04	Not Run
PORTAL-SR-004	Input validation	TC-Sec-05, TC-Auth-01-N, TC-Profile-02	Not Run
PORTAL-SR-005	HTTPS/TLS communication	TC-Sec-06	Not Run
5. Safe test data checklist
Use fictional test data only:
Student accounts: `student.test1@example.test`, `student.test2@example.test`
Recruiter account: `recruiter.test1@example.test`
Administrator account: `admin.test1@example.test`
At least three internship listings with different title, organisation, location and deadline values.
Application records covering a first application, a duplicate attempt, and multiple statuses.
An aptitude test with a known duration and small answer key (for example, five questions).
Preparation resources in two or more categories, with valid links and a safe unavailable-link scenario if appropriate.
Invalid inputs: missing required fields, malformed formats, overlong text and unsupported file type.
Do not use actual personal information, production credentials or real student passwords in test data or reports.
6. Defect report template
Create a separate defect issue only for a failure that you actually reproduced.
```text
Title / Defect ID:
Related SRS requirement:
Related test case ID:
Environment / build / browser:
Preconditions and test data (no secrets):
Steps to reproduce:
Expected result:
Actual observed result:
Severity: Critical / High / Medium / Low
Priority: High / Medium / Low
Evidence link (redact sensitive data):
Assigned developer:
Status: Open / In Progress / Fixed / Retest / Closed
Retest result and evidence:
```
7. Test execution log template
Date	Build/commit	Test case ID	Tester	Actual result/evidence	Status (Pass/Fail/Blocked/Not Run)	Defect link
—	—	—	Vinyas	Awaiting an available runnable build / execution	Not Run	—
8. Technology and database alignment — action required
The submitted SRS describes the MERN stack: React frontend, Node.js/Express backend and MongoDB.
The current repository README says the database is “to be confirmed.” This conflicts with the SRS baseline.
Before merging this pack, ask the Developer/QA Lead to confirm the actual implementation stack. Then align the README and this document with that decision. If MongoDB is confirmed, retain MongoDB-specific test setup. If another database is agreed, update database-specific test setup and evidence. Until confirmed, database-specific execution remains Blocked; do not state that DB checks were completed.
9. Updated schedule and catch-up status (as of 26 October 2026)
The original dry-run window (12–16 October) and Sprint 1 window (19–23 October) have passed. The planned Sprint 2 window is 26–30 October 2026. Vinyas has reported that his Sprint 1 work was not completed. Record this honestly as incomplete/carry-over pending team agreement; do not backdate work or mark testing tasks complete without evidence.
Sprint 1 (19–23 October): incomplete for Vinyas. Ask the QA Lead/Product Owner to identify which testing tasks were planned for Vinyas, what was implemented in the delivered build, and which tasks should be explicitly carried into Sprint 2. Do not move work silently or claim the Sprint 1 testing was completed.
Sprint 2 (26–30 October): current window. First obtain/confirm a runnable build and test environment. Execute smoke tests only for implemented and available features; record actual results and evidence; log defects; retest fixes where possible. Prioritize authentication/role authorization, core application flows, and any features the team identifies as ready. Tests that cannot run because the build or dependencies are unavailable should be marked Blocked with the reason.
Demonstration/documentation: The assignment calls for a one-minute Sprint 1 video of the working product and a two-minute Sprint 2 video plus completed documentation. Since Sprint 1 was incomplete, coordinate with the Product Owner on what actual working Sprint 1 outcome exists and how it should be represented. Do not fabricate a video/result or describe incomplete work as complete.
End of Sprint 2: prepare the test summary from actual test execution records, defect status, and coverage. Keep all unexecuted cases as Not Run or Blocked.
Availability testing that claims a 30-day result cannot be completed during a short sprint. Record it as pending/ongoing unless the team has pre-existing monitoring evidence covering the approved window.
10. Suggested QA backlog work and Sprint 1 carry-over (estimates are proposals for team agreement)
Proposed QA task	Suggested points	Proposed timing	Notes
Revise requirement-mapped test pack and RTM per PR review	2	Immediate / Sprint 2	This revision addresses review comments; database-stack alignment still depends on team confirmation
Execute outstanding Sprint 1 smoke/system cases and log/retest defects	5	Carry-over candidate for Sprint 2; QA Lead/Product Owner must approve	Sprint 1 work is reported incomplete by Vinyas; agree scope before assigning it to Sprint 2
Execute Sprint 2 regression/security/NFR tests and prepare test summary	8	Sprint 2 (26–30 Oct)	Run only against available implemented features; performance/load tests require an approved environment/tool
These points are suggestions, not values required by the SRS. Agree estimates with the team/QA Lead and enter them in the GitHub Project's Estimate field. Avoid duplicate QA issues if the project already has equivalent tasks. Since Sprint 1 has ended, have the QA Lead/Product Owner decide which incomplete items are carried into Sprint 2; do not assign them to the current sprint without agreement.
11. What requires GitHub UI actions vs code commits
Project board/issue actions: Estimate, status, assignee and iteration fields are changed in the GitHub Project; these do not require a code commit.
This Markdown work pack: update it on the existing PR branch `docs/vinyas-test-engineer-pack`, then request review again. Do not merge PR #23 yourself; follow the repository owner's review/merge process.
Execution results: fill in actual outcomes only after running the cases. Test results alone do not require a code commit unless you also change/add repository files.
