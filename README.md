# Online Internship and Placement Preparation Portal

## Overview
A Software Engineering mini-project that helps students discover internship opportunities and prepare for placements.

## Objectives
- Secure user registration and login.
- Role-based access for students, recruiters and administrators.
- Student profile management.
- Internship discovery and application tracking.
- Aptitude tests and placement preparation resources.

## Main Modules
1. Authentication and role-based access
2. Student profile management
3. Internship listings and search
4. Internship applications and status tracking
5. Aptitude tests and results
6. Placement preparation resources
7. Administration

## Technology Stack (current implementation)
- Frontend: React 19 with Vite; current main includes login, internship browsing/details, student application tracking, and recruiter listing/review screens.
- Backend: Node.js and Express.
- Database: PostgreSQL in the current backend implementation (`pg` driver, `DATABASE_URL`, `backend/src/db.js`, and `backend/src/schema.sql`).

**Baseline alignment note:** SRS v1.0 describes MongoDB/MERN, while the merged backend implementation uses PostgreSQL. The repository proves the implemented database, but does not by itself prove formal team sign-off. The Product Owner/tech lead should confirm PostgreSQL as the agreed database and update the SRS baseline; until then, treat this README as an implementation description, not a replacement for the approved SRS.

## Team Members
- Saanvi Srivastava
- S Vinyas Gangadkar
- Sachin S
- Sabique Islam

## Project Management
GitHub Issues and GitHub Projects are used to track tasks and sprint progress. Code changes are reviewed through pull requests.

## Project Status
Authentication/student-profile APIs and the internship/application module are merged into main. A React/Vite frontend is present for login, internship discovery, applications, and recruiter workflows. Aptitude tests/results, placement resources/progress, and the administration module are not yet present as integrated features. See the test execution log for the exact tested build, current-main reassessment, and remaining environment blockers.

## Local setup (development/test only)
1. Install Node.js.
2. Install dependencies from the repository root with `npm install`, then install backend and frontend dependencies with `npm install --prefix backend` and `npm install --prefix frontend`.
3. Configure the approved PostgreSQL connection values in the repository-root `.env.local` (`DATABASE_URL` and `DATABASE_URL_UNPOOLED`). Configure `JWT_SECRET` and `PORT` in `backend/.env`, using the names shown in `backend/.env.example`. The backend loads the root `.env.local` and `backend/.env` through `backend/src/env.js`.
4. With the team's approved test database only, run `npm run db:setup --prefix backend` to create tables and seed the synthetic demo users/listings. Do not run this against production data.
5. Start the backend from the repository root with `npm start`; start the frontend separately with `npm run dev --prefix frontend`.
6. Verify `GET /api/health` locally. A healthy response does not prove that database-backed flows work.

Do not commit `.env`, `.env.local`, database credentials, JWT secrets, production data, or test passwords. The `.env.local` file and `backend/.env` must remain local and untracked.
