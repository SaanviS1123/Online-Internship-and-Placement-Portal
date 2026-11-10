
const express = require("express");
const multer = require("multer");
const path = require("path");
const pool = require("../db");
const authenticateToken = require("../middleware/auth");
const authorizeRole = require("../middleware/authorizeRole");

const router = express.Router();

const MAX_RESUME_SIZE = 5 * 1024 * 1024;

router.use(authenticateToken);
router.use(authorizeRole("student"));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_RESUME_SIZE,
    files: 1,
  },
});

function sendServerError(res, label, error) {
  console.error(`${label}:`, error.message);

  return res.status(500).json({
    success: false,
    message: "Unable to complete the request.",
  });
}

function validateText(value, maxLength, required = false) {
  if (typeof value !== "string") {
    return false;
  }

  const trimmed = value.trim();

  if (required && !trimmed) {
    return false;
  }

  return trimmed.length <= maxLength;
}

function parseYear(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const year = Number(value);

  if (!Number.isInteger(year) || year < 1950 || year > 2100) {
    return undefined;
  }

  return year;
}

async function ensureProfile(userId) {
  await pool.query(
    `INSERT INTO student_profiles (user_id)
     VALUES ($1)
     ON CONFLICT (user_id) DO NOTHING`,
    [userId]
  );
}

// =========================================================
// REFRESH LEGACY COMPATIBILITY EDUCATION SUMMARY
// Preserves legacy education while including structured data.
// =========================================================

async function refreshEducationSummary(userId) {
  await ensureProfile(userId);

  const legacyResult = await pool.query(
    `SELECT legacy_education
     FROM student_profiles
     WHERE user_id = $1`,
    [userId]
  );

  const educationResult = await pool.query(
    `SELECT institution, qualification
     FROM student_education
     WHERE user_id = $1
     ORDER BY start_year DESC NULLS LAST, id DESC`,
    [userId]
  );

  const entries = [];
  const seen = new Set();

  function addEntry(value) {
    const cleaned = String(value || "").trim();

    if (!cleaned) {
      return;
    }

    const key = cleaned.toLowerCase();

    if (!seen.has(key)) {
      seen.add(key);
      entries.push(cleaned);
    }
  }

  addEntry(legacyResult.rows[0]?.legacy_education);

  educationResult.rows.forEach((row) => {
    addEntry(`${row.qualification} - ${row.institution}`);
  });

  const summary = entries.join("; ").slice(0, 255);

  await pool.query(
    `UPDATE student_profiles
     SET education = $1,
         updated_at = CURRENT_TIMESTAMP
     WHERE user_id = $2`,
    [summary || null, userId]
  );
}

// =========================================================
// REFRESH LEGACY COMPATIBILITY SKILLS SUMMARY
// Preserves legacy skills while including structured skills.
// =========================================================

async function refreshSkillsSummary(userId) {
  await ensureProfile(userId);

  const legacyResult = await pool.query(
    `SELECT legacy_skills
     FROM student_profiles
     WHERE user_id = $1`,
    [userId]
  );

  const skillsResult = await pool.query(
    `SELECT skill
     FROM student_skills
     WHERE user_id = $1
     ORDER BY skill ASC`,
    [userId]
  );

  const entries = [];
  const seen = new Set();

  function addEntry(value) {
    const cleaned = String(value || "").trim();

    if (!cleaned) {
      return;
    }

    const key = cleaned.toLowerCase();

    if (!seen.has(key)) {
      seen.add(key);
      entries.push(cleaned);
    }
  }

  const legacySkills = legacyResult.rows[0]?.legacy_skills || "";

  legacySkills.split(",").forEach(addEntry);

  skillsResult.rows.forEach((row) => {
    addEntry(row.skill);
  });

  const summary = entries.join(", ").slice(0, 5000);

  await pool.query(
    `UPDATE student_profiles
     SET skills = $1,
         updated_at = CURRENT_TIMESTAMP
     WHERE user_id = $2`,
    [summary || null, userId]
  );
}

// =========================================================
// GET PROFILE
// Returns structured records and combined compatibility values.
// =========================================================

router.get("/", async (req, res) => {
  try {
    const userId = req.user.userId;

    await ensureProfile(userId);
    await refreshEducationSummary(userId);
    await refreshSkillsSummary(userId);

    const profileResult = await pool.query(
      `SELECT
         u.id,
         u.full_name,
         u.email,
         p.phone,
         p.education,
         p.skills,
         p.resume_url,
         p.created_at,
         p.updated_at
       FROM users u
       LEFT JOIN student_profiles p ON p.user_id = u.id
       WHERE u.id = $1`,
      [userId]
    );

    if (profileResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const educationResult = await pool.query(
      `SELECT
         id,
         institution,
         qualification,
         field_of_study,
         start_year,
         end_year,
         grade,
         currently_studying,
         created_at,
         updated_at
       FROM student_education
       WHERE user_id = $1
       ORDER BY start_year DESC NULLS LAST, id DESC`,
      [userId]
    );

    const skillsResult = await pool.query(
      `SELECT id, skill, created_at
       FROM student_skills
       WHERE user_id = $1
       ORDER BY skill ASC`,
      [userId]
    );

    const resumeResult = await pool.query(
      `SELECT id, file_name, mime_type, file_size, uploaded_at
       FROM student_resumes
       WHERE user_id = $1`,
      [userId]
    );

    res.set("Cache-Control", "no-store");

    return res.status(200).json({
      success: true,
      profile: profileResult.rows[0],
      educationRecords: educationResult.rows,
      skillRecords: skillsResult.rows,
      resume: resumeResult.rows[0] || null,
    });
  } catch (error) {
    return sendServerError(res, "Profile retrieval failed", error);
  }
});

// =========================================================
// UPDATE BASIC PROFILE
// Only submitted fields are updated.
// Legacy education and skills are stored separately so that
// structured records do not overwrite the original values.
// =========================================================

router.put("/", async (req, res) => {
  try {
    const userId = req.user.userId;
    const { phone, education, skills, resumeUrl } = req.body;

    const fields = [
      ["phone", phone, 20],
      ["education", education, 255],
      ["skills", skills, 5000],
      ["resumeUrl", resumeUrl, 2048],
    ];

    for (const [field, value, maxLength] of fields) {
      if (
        value !== undefined &&
        !validateText(value, maxLength)
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid ${field}.`,
        });
      }
    }

    if (
      resumeUrl !== undefined &&
      resumeUrl.trim() !== "" &&
      !/^https?:\/\/\S+$/i.test(resumeUrl.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Resume URL must use HTTP or HTTPS.",
      });
    }

    await ensureProfile(userId);

    await pool.query(
      `UPDATE student_profiles
       SET
         phone = CASE WHEN $2 THEN $3 ELSE phone END,
         legacy_education = CASE
           WHEN $4 THEN $5
           ELSE legacy_education
         END,
         legacy_skills = CASE
           WHEN $6 THEN $7
           ELSE legacy_skills
         END,
         resume_url = CASE WHEN $8 THEN $9 ELSE resume_url END,
         updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1`,
      [
        userId,
        phone !== undefined,
        phone?.trim() || null,
        education !== undefined,
        education?.trim() || null,
        skills !== undefined,
        skills?.trim() || null,
        resumeUrl !== undefined,
        resumeUrl?.trim() || null,
      ]
    );

    if (education !== undefined) {
      await refreshEducationSummary(userId);
    }

    if (skills !== undefined) {
      await refreshSkillsSummary(userId);
    }

    const result = await pool.query(
      `SELECT user_id, phone, education, skills, resume_url,
              created_at, updated_at
       FROM student_profiles
       WHERE user_id = $1`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      profile: result.rows[0],
    });
  } catch (error) {
    return sendServerError(res, "Profile update failed", error);
  }
});

// =========================================================
// ADD EDUCATION
// =========================================================

router.post("/education", async (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      institution,
      qualification,
      field_of_study,
      start_year,
      end_year,
      grade,
      currently_studying,
    } = req.body;

    if (
      !validateText(institution, 180, true) ||
      !validateText(qualification, 120, true) ||
      !validateText(field_of_study ?? "", 120) ||
      !validateText(grade ?? "", 50)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid education details.",
      });
    }

    if (
      currently_studying !== undefined &&
      typeof currently_studying !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid currently studying value.",
      });
    }

    const startYear = parseYear(start_year);
    const endYear = currently_studying ? null : parseYear(end_year);

    if (
      startYear === undefined ||
      endYear === undefined ||
      (startYear !== null &&
        endYear !== null &&
        endYear < startYear)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid education years.",
      });
    }

    const result = await pool.query(
      `INSERT INTO student_education
       (
         user_id,
         institution,
         qualification,
         field_of_study,
         start_year,
         end_year,
         grade,
         currently_studying
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        userId,
        institution.trim(),
        qualification.trim(),
        field_of_study?.trim() || null,
        startYear,
        endYear,
        grade?.trim() || null,
        currently_studying === true,
      ]
    );

    await refreshEducationSummary(userId);

    return res.status(201).json({
      success: true,
      message: "Education added successfully.",
      education: result.rows[0],
    });
  } catch (error) {
    return sendServerError(res, "Education creation failed", error);
  }
});

// =========================================================
// UPDATE EDUCATION
// =========================================================

router.put("/education/:id", async (req, res) => {
  try {
    const userId = req.user.userId;
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid education record ID.",
      });
    }

    const {
      institution,
      qualification,
      field_of_study,
      start_year,
      end_year,
      grade,
      currently_studying,
    } = req.body;

    if (
      !validateText(institution, 180, true) ||
      !validateText(qualification, 120, true) ||
      !validateText(field_of_study ?? "", 120) ||
      !validateText(grade ?? "", 50)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid education details.",
      });
    }

    if (
      currently_studying !== undefined &&
      typeof currently_studying !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid currently studying value.",
      });
    }

    const startYear = parseYear(start_year);
    const endYear = currently_studying ? null : parseYear(end_year);

    if (
      startYear === undefined ||
      endYear === undefined ||
      (startYear !== null &&
        endYear !== null &&
        endYear < startYear)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid education years.",
      });
    }

    const result = await pool.query(
      `UPDATE student_education
       SET institution = $1,
           qualification = $2,
           field_of_study = $3,
           start_year = $4,
           end_year = $5,
           grade = $6,
           currently_studying = $7,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 AND user_id = $9
       RETURNING *`,
      [
        institution.trim(),
        qualification.trim(),
        field_of_study?.trim() || null,
        startYear,
        endYear,
        grade?.trim() || null,
        currently_studying === true,
        id,
        userId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Education record not found.",
      });
    }

    await refreshEducationSummary(userId);

    return res.status(200).json({
      success: true,
      message: "Education updated successfully.",
      education: result.rows[0],
    });
  } catch (error) {
    return sendServerError(res, "Education update failed", error);
  }
});

// =========================================================
// DELETE EDUCATION
// =========================================================

router.delete("/education/:id", async (req, res) => {
  try {
    const userId = req.user.userId;
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid education record ID.",
      });
    }

    const result = await pool.query(
      `DELETE FROM student_education
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Education record not found.",
      });
    }

    await refreshEducationSummary(userId);

    return res.status(200).json({
      success: true,
      message: "Education deleted successfully.",
    });
  } catch (error) {
    return sendServerError(res, "Education deletion failed", error);
  }
});

// =========================================================
// ADD SKILL
// =========================================================

router.post("/skills", async (req, res) => {
  try {
    const userId = req.user.userId;
    const skill = req.body?.skill;

    if (!validateText(skill, 80, true)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid skill (maximum 80 characters).",
      });
    }

    const result = await pool.query(
      `INSERT INTO student_skills (user_id, skill)
       VALUES ($1, $2)
       ON CONFLICT (user_id, skill) DO NOTHING
       RETURNING id, skill, created_at`,
      [userId, skill.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(409).json({
        success: false,
        message: "This skill has already been added.",
      });
    }

    await refreshSkillsSummary(userId);

    return res.status(201).json({
      success: true,
      message: "Skill added successfully.",
      skill: result.rows[0],
    });
  } catch (error) {
    return sendServerError(res, "Skill creation failed", error);
  }
});

// =========================================================
// DELETE SKILL
// =========================================================

router.delete("/skills/:id", async (req, res) => {
  try {
    const userId = req.user.userId;
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid skill ID.",
      });
    }

    const result = await pool.query(
      `DELETE FROM student_skills
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Skill not found.",
      });
    }

    await refreshSkillsSummary(userId);

    return res.status(200).json({
      success: true,
      message: "Skill deleted successfully.",
    });
  } catch (error) {
    return sendServerError(res, "Skill deletion failed", error);
  }
});

// =========================================================
// HANDLE MULTER UPLOAD ERRORS
// =========================================================

function handleResumeUpload(req, res, next) {
  upload.single("resume")(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "Resume must not exceed 5 MB.",
        });
      }

      return res.status(400).json({
        success: false,
        message: "Invalid resume upload.",
      });
    }

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Unable to process the uploaded file.",
      });
    }

    next();
  });
}

// =========================================================
// UPLOAD OR REPLACE RESUME
// =========================================================

router.post("/resume", handleResumeUpload, async (req, res) => {
  try {
    const userId = req.user.userId;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Please select a PDF resume.",
      });
    }

    const isPdfMime = file.mimetype === "application/pdf";
    const isPdfSignature =
      file.buffer.length >= 5 &&
      file.buffer.subarray(0, 5).toString("ascii") === "%PDF-";

    if (!isPdfMime || !isPdfSignature) {
      return res.status(400).json({
        success: false,
        message: "Only valid PDF files are accepted.",
      });
    }

    const fileName = path
      .basename(file.originalname)
      .replace(/[\r\n"]/g, "_")
      .slice(0, 255);

    const result = await pool.query(
      `INSERT INTO student_resumes
         (user_id, file_name, mime_type, file_size, file_data)
       VALUES ($1, $2, 'application/pdf', $3, $4)
       ON CONFLICT (user_id)
       DO UPDATE SET
         file_name = EXCLUDED.file_name,
         mime_type = EXCLUDED.mime_type,
         file_size = EXCLUDED.file_size,
         file_data = EXCLUDED.file_data,
         uploaded_at = CURRENT_TIMESTAMP
       RETURNING id, file_name, mime_type, file_size, uploaded_at`,
      [
        userId,
        fileName,
        file.size,
        file.buffer,
      ]
    );

    res.set("Cache-Control", "no-store");

    return res.status(200).json({
      success: true,
      message: "Resume uploaded successfully.",
      resume: result.rows[0],
    });
  } catch (error) {
    return sendServerError(res, "Resume upload failed", error);
  }
});

// =========================================================
// DOWNLOAD RESUME
// =========================================================

router.get("/resume", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT file_name, mime_type, file_data
       FROM student_resumes
       WHERE user_id = $1`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No resume has been uploaded.",
      });
    }

    const resume = result.rows[0];
    const safeName = resume.file_name.replace(/["\r\n]/g, "_");

    res.set({
      "Content-Type": resume.mime_type,
      "Content-Disposition": `attachment; filename="${safeName}"`,
      "Content-Length": resume.file_data.length,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    });

    return res.send(resume.file_data);
  } catch (error) {
    return sendServerError(res, "Resume download failed", error);
  }
});

// =========================================================
// DELETE RESUME
// =========================================================

router.delete("/resume", async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM student_resumes
       WHERE user_id = $1
       RETURNING id`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No resume has been uploaded.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Resume deleted successfully.",
    });
  } catch (error) {
    return sendServerError(res, "Resume deletion failed", error);
  }
});

module.exports = router;
