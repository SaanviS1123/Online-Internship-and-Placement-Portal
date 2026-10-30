# Sprint 1 integration QA test cases

Run these against a test database and test student accounts after applying `SPRINT1_INTEGRATION_SETUP.md`. Do not use a teammate's account or production student data.

| ID | Feature | Steps | Expected result |
|---|---|---|---|
| QA-APT-001 | F-013 list | Sign in as a student; open Aptitude tests. | Two available sample assessments and one unavailable sample assessment are listed with category, description, duration and question count. |
| QA-APT-002 | F-013 empty state | Use a test DB with no assessment rows and open Aptitude tests. | A clear no-tests message appears; the page does not crash. |
| QA-APT-003 | F-013 role access | Sign out; open `/preparation/tests`. | User is redirected to Login. |
| QA-APT-004 | F-013 unavailable test | Try to start Advanced Mock Assessment. | The action is disabled; the API also rejects a direct start request with 409. |
| QA-APT-005 | F-014 start | Start an available assessment. | A new attempt is created with a server-calculated expiry timestamp and the question list is shown. |
| QA-APT-006 | F-014 timer | Start the 5-minute test and observe the timer. | Time counts down from the server expiry; remaining time cannot be changed by editing browser state. |
| QA-APT-007 | F-014 change answer | Select one option, then select a different option for the same question. | The latest selected option is saved and restored from the server. |
| QA-APT-008 | F-014 resume | Start a test, answer a question, leave the attempt page, then reopen the same test before expiry. | Existing active attempt resumes with the saved answer and original expiry. |
| QA-APT-009 | F-014 manual submit | Submit before the timer expires. | Attempt is marked submitted; further answer updates are rejected. |
| QA-APT-010 | F-014 automatic submit | On a test database, shorten an assessment duration to 30 seconds, start it and let the timer reach zero. | Attempt is submitted automatically and `auto_submitted` is true. |
| QA-APT-011 | F-015 server-side score | Submit a mix of correct, incorrect and unanswered questions. | Score and counts match the DB answer key; the client sends no score value. |
| QA-APT-012 | F-015 answer-key protection | Inspect `/api/preparation/tests` and an in-progress attempt response. | `correct_option_index` is not returned before submission. |
| QA-APT-013 | F-016 history | Submit two attempts and open Previous results. | Both attempts appear with title, time and score, newest first. |
| QA-APT-014 | F-016 detail | Open a saved result. | Question text, selected answer, correct answer and correctness are displayed. |
| QA-APT-015 | Security | Sign in as student B and request student A's result URL and attempt URL. | Both requests return 404; no other student's result or answers are exposed. |
| QA-RES-001 | F-017 catalogue | Open Preparation resources. | Resource titles, categories, descriptions and availability are displayed. |
| QA-RES-002 | F-017 filter | Select each category and then All resources. | Only matching resources appear; All resources restores the full catalogue. |
| QA-RES-003 | F-017 external link | Open an available resource. | Link opens in a separate tab with `noopener noreferrer`. |
| QA-RES-004 | F-017 unavailable link | Open the unavailable demo resource. | Open action is disabled. Direct progress API update is rejected with 409. |
| QA-RES-005 | F-018 completion | Mark an available resource completed and refresh the page. | Completed state remains checked. |
| QA-RES-006 | F-018 student isolation | Complete a resource as student A, then sign in as student B. | Student B's resource is still pending unless B independently completes it. |
| QA-RES-007 | F-018 revert | Uncheck a completed resource and refresh. | Pending state persists for the same student. |
| QA-REG-001 | Regression | As student, open internships, internship details and My applications. | Existing student flows remain usable. |
| QA-REG-002 | Regression | As recruiter, open My listings and Applications. | Existing recruiter flows remain usable; preparation links do not appear. |
| QA-ADM-001 | F-019 access | Request `/api/admin/users` with no token, a student token and a recruiter token. | Requests are rejected with 401/403; only an admin token is accepted. |
| QA-ADM-002 | F-019 user management | As admin, view users and change a test user's role. | Name/email/role are listed without password hashes; the saved role is returned and persists. |
| QA-ADM-003 | F-019 self-protection | As admin, try to change your own role. | API rejects the change with 409. |
| QA-ADM-004 | F-019 last admin | In a test DB with two admins, sign in as admin A and demote admin B; then verify admin A remains able to access `/admin` and cannot demote their own account. | At least one administrator remains; self-demotion is rejected with 409. |
| QA-ADM-005 | F-019 listings | As admin, deactivate and reactivate a test internship. | Status persists; an inactive listing is not shown in the student browse list. |
| QA-ADM-006 | F-019 resource management | As admin, create and edit a preparation resource. | Valid changes persist and appear in the student resource catalogue; invalid URL/slug input is rejected. |

## Evidence to record

Record the test date, branch/commit, browser, API/database environment, tester, actual result, pass/fail/blocked status and defect link for each case. Never label a case Passed without actually executing it against the current branch and configured database.
