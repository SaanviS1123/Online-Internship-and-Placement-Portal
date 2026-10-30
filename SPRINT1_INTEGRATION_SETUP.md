# Sprint 1 aptitude and preparation integration

This patch integrates the existing Sprint 1 prototype into the current React + Express + PostgreSQL portal. It replaces browser-only attempt history with authenticated, database-backed records.

## Included issue coverage

- **F-013**: authenticated students can browse available and unavailable aptitude assessments, including descriptions, duration and question count; an empty state is shown when the catalogue is empty.
- **F-014**: attempts use a server-side expiry timestamp. Students can select answers, change them before submission, resume an active attempt, and submit manually or after the timer expires.
- **F-015**: the API computes scores from the database answer key. The question-list API does not return answer keys. The client cannot submit its own score.
- **F-016**: submitted results and per-question answer reviews are stored and scoped to the authenticated student.
- **F-017**: students can browse preparation resources by category; unavailable resources cannot be opened.
- **F-018**: completion status is saved per student in PostgreSQL and restored on later visits.
- **F-019**: an admin-only console lists users, changes account roles, activates/deactivates internship listings, and creates/edits preparation resources. Admin operations are role-checked by the API and persisted in PostgreSQL.

The formal usability study for **NF-003** is not completed by a code patch. It requires agreed tasks, representative participants, screen sizes and recorded observations.

## Apply and run

1. Extract the ZIP into the root of your local `Portal-Main-Test` repository and allow files to be replaced. Keep your current branch `feat/sprint1-aptitude-resources-integrated` checked out.
2. Open a PowerShell terminal in the repository root and run:

   ```powershell
   git status --short
   ```

   Confirm the changes are the patch files shown below. Do not commit yet.

3. Create the new database tables using the project's existing environment configuration. The `db:tables` script expects `DATABASE_URL_UNPOOLED` as used by the existing repository:

   ```powershell
   cd backend
   npm run db:tables
   npm run db:seed:sprint1
   ```

   The seed adds two available sample assessments, one unavailable assessment, and sample preparation resources. It does not create student accounts or change existing student records.

4. Start the backend in one terminal:

   ```powershell
   npm run dev
   ```

5. In a second terminal, start the frontend:

   ```powershell
   cd frontend
   npm run dev
   ```

6. To provision an administrator, first create/sign in with the designated account, then run a deliberate one-time role assignment in the intended database using that account's verified email:

   ```sql
   UPDATE users SET role = 'admin', updated_at = CURRENT_TIMESTAMP
   WHERE email = 'admin-account@example.com';
   ```

   Sign out and sign back in so the updated role is also reflected in the frontend navigation. Do not promote a public or unverified account. The API reads the current role from PostgreSQL on protected requests. The admin console is available at `/admin`.

7. Sign in with a **student** account. The student navigation should show **Aptitude tests**, **Resources**, and **Results**. Recruiter navigation should remain unchanged.

## Minimum verification before commit

- Sign in as a student and confirm the aptitude list shows the two open assessments and one unavailable assessment.
- Start an assessment, select an answer, refresh, and confirm the selected answer is restored.
- Change an answer and submit. Confirm a score and per-question review appear in Results.
- Confirm a second student account cannot view the first student's result URL.
- Start the 5-minute assessment and verify the timer is based on the server expiry; for a quick expiry test, temporarily set the seeded `aptitude-foundations` duration to 30 seconds in the database and reseed only after you have finished other runs.
- Open Resources, filter categories, mark one resource complete, refresh, and confirm it remains complete.
- Confirm the unavailable sample resource cannot be opened or marked complete.
- Sign in as an administrator and confirm the admin console loads; as student/recruiter, verify `/admin` is denied.
- As admin, change a test user's role, deactivate/reactivate a test listing, and create/edit a preparation resource; verify each change persists after refresh. Confirm the last administrator cannot be demoted.
- Confirm the existing internship, application and recruiter routes still work.

## Important

The seed script contains illustrative sample questions and resource links. Replace or approve this content with the Product Owner before treating it as production material. Run the database table script only against the intended project database. Do not commit `.env`, `.env.local`, tokens, or database credentials.
