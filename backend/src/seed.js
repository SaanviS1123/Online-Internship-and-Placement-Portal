require("./env");

const bcrypt = require("bcrypt");
const pool = require("./db");

const PASSWORD = "Testpass123";

const USERS = [
  ["Test Student", "student.test1@example.test", "student"],
  ["Test Recruiter", "recruiter.test1@example.test", "recruiter"],
  ["Other Recruiter", "recruiter.test2@example.test", "recruiter"],
];

const LISTINGS = [
  {
    owner: "recruiter.test1@example.test",
    title: "Backend Intern",
    organisation: "Northwind Labs",
    description:
      "Build and test API endpoints for the campus placement portal with a small product team.",
    eligibility: "BE Computer Science",
    location: "Bengaluru",
    daysAhead: 30,
    isActive: true,
  },
  {
    owner: "recruiter.test1@example.test",
    title: "Data Analyst Intern",
    organisation: "Harbor Analytics",
    description:
      "Prepare internship reports and help the recruiting team read applicant trends.",
    eligibility: "Statistics or related",
    location: "Mumbai",
    daysAhead: 45,
    isActive: true,
  },
  {
    owner: "recruiter.test1@example.test",
    title: "Campus Ambassador",
    organisation: "Paperkite",
    description: "Represent the company on campus. This sample listing is already past its deadline.",
    eligibility: "Any undergraduate",
    location: "Remote",
    daysAhead: -1,
    isActive: true,
  },
  {
    owner: "recruiter.test1@example.test",
    title: "Design Intern",
    organisation: "Northwind Labs",
    description: "This sample listing is closed and should stay out of the student browse list.",
    eligibility: "Design portfolio",
    location: "Pune",
    daysAhead: 20,
    isActive: false,
  },
  {
    owner: "recruiter.test2@example.test",
    title: "QA Intern",
    organisation: "Second Desk",
    description: "Write checks for the application flow and report defects with clear steps.",
    eligibility: "Testing fundamentals",
    location: "Hyderabad",
    daysAhead: 15,
    isActive: true,
  },
];

async function upsertUser(fullName, email, role, passwordHash) {
  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);

  if (existing.rows.length > 0) {
    return existing.rows[0].id;
  }

  const result = await pool.query(
    `INSERT INTO users (full_name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [fullName, email, passwordHash, role]
  );

  return result.rows[0].id;
}

async function seed() {
  const passwordHash = await bcrypt.hash(PASSWORD, 12);
  const ids = {};

  for (const [fullName, email, role] of USERS) {
    ids[email] = await upsertUser(fullName, email, role, passwordHash);
  }

  await pool.query(
    `INSERT INTO student_profiles (user_id, phone, education, skills)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id) DO UPDATE SET
       phone = EXCLUDED.phone,
       education = EXCLUDED.education,
       skills = EXCLUDED.skills,
       updated_at = CURRENT_TIMESTAMP`,
    [
      ids["student.test1@example.test"],
      "9876543210",
      "B.E. Computer Science, BMS College",
      "JavaScript, SQL",
    ]
  );

  for (const listing of LISTINGS) {
    await pool.query(
      `INSERT INTO internships
         (recruiter_id, title, organisation, description, eligibility, location, deadline, is_active)
       SELECT $1::int, $2::varchar, $3::varchar, $4::text, $5::varchar, $6::varchar,
              CURRENT_DATE + $7::int, $8::boolean
       WHERE NOT EXISTS (
         SELECT 1 FROM internships WHERE recruiter_id = $1::int AND title = $2::varchar
       )`,
      [
        ids[listing.owner],
        listing.title,
        listing.organisation,
        listing.description,
        listing.eligibility,
        listing.location,
        listing.daysAhead,
        listing.isActive,
      ]
    );
  }

  console.log("Seed data is ready.");
  console.log("Student: student.test1@example.test");
  console.log("Recruiter: recruiter.test1@example.test");
  console.log("Other recruiter: recruiter.test2@example.test");
  console.log(`Password for each demo account: ${PASSWORD}`);
}

seed()
  .catch((error) => {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
