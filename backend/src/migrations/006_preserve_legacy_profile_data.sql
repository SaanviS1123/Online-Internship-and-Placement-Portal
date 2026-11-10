
-- =========================================================
-- F-005 COMPATIBILITY: PRESERVE LEGACY PROFILE DATA
-- =========================================================

ALTER TABLE student_profiles
ADD COLUMN IF NOT EXISTS legacy_education VARCHAR(255);

ALTER TABLE student_profiles
ADD COLUMN IF NOT EXISTS legacy_skills TEXT;

-- Preserve the existing values before structured records
-- begin updating the compatibility summary columns.

UPDATE student_profiles
SET legacy_education = education
WHERE legacy_education IS NULL
  AND education IS NOT NULL;

UPDATE student_profiles
SET legacy_skills = skills
WHERE legacy_skills IS NULL
  AND skills IS NOT NULL;
