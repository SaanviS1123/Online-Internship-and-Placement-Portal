
-- =========================================================
-- F-005: EDUCATION, SKILLS AND RESUME MANAGEMENT
-- =========================================================

-- 1. STUDENT EDUCATION
-- A student can maintain multiple education records.

CREATE TABLE IF NOT EXISTS student_education (
    id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    institution VARCHAR(180) NOT NULL,
    qualification VARCHAR(120) NOT NULL,
    field_of_study VARCHAR(120),

    start_year INTEGER,
    end_year INTEGER,

    grade VARCHAR(50),

    currently_studying BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CHECK (
        start_year IS NULL
        OR start_year BETWEEN 1950 AND 2100
    ),

    CHECK (
        end_year IS NULL
        OR end_year BETWEEN 1950 AND 2100
    ),

    CHECK (
        end_year IS NULL
        OR start_year IS NULL
        OR end_year >= start_year
    )
);

CREATE INDEX IF NOT EXISTS idx_student_education_user
    ON student_education(user_id);


-- 2. STUDENT SKILLS
-- Each skill is stored as an individual record.

CREATE TABLE IF NOT EXISTS student_skills (
    id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    skill VARCHAR(80) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (user_id, skill)
);

CREATE INDEX IF NOT EXISTS idx_student_skills_user
    ON student_skills(user_id);


-- 3. STUDENT RESUMES
-- Resume files are stored privately in PostgreSQL.
-- Maximum file size: 5 MB.
-- Only PDF files are accepted.

CREATE TABLE IF NOT EXISTS student_resumes (
    id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL UNIQUE
        REFERENCES users(id) ON DELETE CASCADE,

    file_name VARCHAR(255) NOT NULL,

    mime_type VARCHAR(100) NOT NULL DEFAULT 'application/pdf',

    file_size INTEGER NOT NULL
        CHECK (file_size > 0 AND file_size <= 5242880),

    file_data BYTEA NOT NULL,

    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CHECK (mime_type = 'application/pdf')
);

CREATE INDEX IF NOT EXISTS idx_student_resumes_user
    ON student_resumes(user_id);
