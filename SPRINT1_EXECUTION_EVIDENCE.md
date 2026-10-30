# Sprint 1 QA Execution Evidence

**Project:** Online Internship & Placement Preparation Portal
**Tester:** Test Engineer (Team 12)
**Execution date:** 30 October 2026
**Environment:** Local React/Vite frontend + Node/Express backend + personal Neon PostgreSQL development project (`online-internship-placement-dev`)
**Build result:** `npm run build --prefix frontend` — successful; Vite transformed 54 modules.
**Database setup:** Existing schema command completed successfully; Sprint 1 assessment/resource seed command completed successfully.

> This is a record of the scenarios actually exercised during the local development session. It is not a claim that every acceptance criterion, browser, device size, or production deployment has been tested. Keep this development database separate from the team's shared/production database.

## Execution summary

| Issue | Feature | Observed result | Status |
|---|---|---|---|
| #13 | View aptitude tests | Two available tests and one unavailable test displayed; unavailable test could not be started. | Pass |
| #14 | Attempt timed aptitude tests | Assessment opened; manual submission worked; timer expiry automatically submitted an unanswered test. Saved result showed 0/5 answered and 0%. Editing an answer before manual submission was not separately evidenced in the captured run. | Partial — core paths pass; answer-edit scenario needs explicit retest |
| #15 | Automatic evaluation and scoring | Manual attempt with 2 correct answers out of 5 produced 40%; answer review showed selected and correct answers. Score/key tamper resistance was not tested. | Partial — functional scoring pass; tamper-resistance check outstanding |
| #16 | View previous results | Previous-results page listed the Aptitude Foundations attempt, 40% score and submission timestamp. A page refresh retained the entry. | Pass for history listing/persistence; opening the detailed result should be captured if required by acceptance criteria |
| #17 | Placement preparation resources | Category filter displayed the Interview guidance resources, including one available resource and one unavailable resource. | Pass for listing/filter/availability display; external-link destination verification not recorded |
| #18 | Track preparation progress | Marked Interview Preparation Guidance complete; count changed from 0/6 to 1/6 and remained checked after refresh. | Pass |
| #19 | Administration | Student was redirected away from `/admin`; student API request to `/api/admin/users` returned HTTP 403. Admin console listed users, internships and resources. Internship activation/deactivation persisted; role change persisted and was restored; resource description edit persisted and original description was restored. | Pass for exercised admin flows; see resource-count observation below |
| — | Internship search regression | Search with keyword QA, location Hyderabad, organisation Second Desk and eligibility Testing fundamentals returned QA Intern. | Pass |
| — | Application submission regression | Application submission returned “Application submitted”; item appeared in My applications as Submitted; duplicate application was rejected. | Pass |
| — | Frontend build | Production Vite build completed successfully (54 modules transformed). | Pass |
| — | Database connectivity/schema/seed | PostgreSQL connection query succeeded; table creation and Sprint 1 sample-data seed commands completed successfully. | Pass |

## Evidence captured in the conversation

1. Internship search returned only QA Intern for the four supplied filters.
2. Internship detail page displayed the seeded student profile and application action.
3. Application submission confirmation appeared; duplicate submission was blocked; My applications showed Submitted.
4. Aptitude catalogue showed two available assessments and one unavailable assessment.
5. Manual assessment result showed 40% (2/5) and per-question answer review.
6. Previous-results page showed the 40% attempt and timestamp.
7. Preparation resources displayed category filtering and available/unavailable states.
8. Progress count increased to 1/6; checked state survived refresh.
9. Student navigation to `/admin` returned to Internships; student request to `/api/admin/users` returned 403.
10. Admin console displayed four users and five internships. Design Intern was activated and restored to inactive.
11. Admin resource description edit persisted after refresh; original text was restored.
12. Other Recruiter was temporarily changed to Student and then restored to Recruiter.
13. Timer-expired attempt was automatically submitted and saved with 0% and 0/5 answered.

Screenshots remain in the conversation; attach the relevant screenshots to the GitHub issue or PR before requesting formal review. Do not add secrets, live connection strings, JWT secrets, or personal account credentials to repository evidence.

## Follow-up checks / open observations

- **#14:** Explicitly change an answer, then change it again before submission and verify the final selected value is scored. (Timer expiry auto-submission was observed and passed.)
- **#15:** Verify the server does not accept a client-supplied score or answer key; confirm submitted response data is tied to the authenticated student. Do not expose test answer keys in client-delivered data.
- **#16:** Open the View result action from history and verify detailed result ownership and content.
- **#17:** Open one available external resource and verify it opens the intended destination in a new tab/window. Confirm unavailable links remain disabled.
- **#19 observation:** In the final Users-tab screenshot after restoring Other Recruiter, the tab header displayed `Resources (0)`, although the preceding Resources tab showed six records. Reopen Resources, refresh, and confirm all six are still present. If the count remains zero or resource records are missing, log a defect and do not sign off that portion.
- Test at the agreed desktop and mobile viewport sizes; cross-browser coverage was not performed in this run.
- **NF-003 / issue #22:** Not complete. Conduct the usability study using the separate participant sheet; do not mark it Pass before collecting real participant results.

## Overall disposition

The primary Sprint 1 flows for aptitude catalogue, timed assessment submission, score display, result history, resource presentation, progress persistence, and admin management were demonstrated on the local development environment. Some security/edge acceptance criteria and the NF-003 participant study remain outstanding. Treat #14, #15, #16 and #19 as requiring the listed follow-ups before a strict full-acceptance sign-off; do not infer production readiness from local testing.
