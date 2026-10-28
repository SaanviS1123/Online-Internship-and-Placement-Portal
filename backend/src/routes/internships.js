const express = require("express");
const pool = require("../db");
const authenticateToken = require("../middleware/auth");
const authorizeRole = require("../middleware/authorizeRole");
const { internshipColumns, availableOnly } = require("../internshipSql");
const {
  validateListing,
  optionalQuery,
  likePattern,
  parseId,
  publicInternship,
} = require("../validate");

const router = express.Router();

router.use(authenticateToken);

function sendServerError(res, logLabel, error) {
  console.error(`${logLabel}:`, error.message);
  return res.status(500).json({
    success: false,
    message: "Unable to complete the request.",
  });
}

// F-006 and F-007: browse available listings, then narrow them.
router.get("/", async (req, res) => {
  try {
    const keyword = optionalQuery(req.query.q, "Keyword");
    const location = optionalQuery(req.query.location, "Location");
    const organisation = optionalQuery(req.query.organisation, "Organisation");
    const eligibility = optionalQuery(req.query.eligibility, "Eligibility");

    for (const field of [keyword, location, organisation, eligibility]) {
      if (field.error) {
        return res.status(400).json({ success: false, message: field.error });
      }
    }

    const result = await pool.query(
      `SELECT ${internshipColumns}
       FROM internships i
       WHERE ${availableOnly}
         AND (
           $1::text IS NULL
           OR i.title ILIKE $1 ESCAPE '\\'
           OR i.organisation ILIKE $1 ESCAPE '\\'
           OR i.description ILIKE $1 ESCAPE '\\'
           OR i.eligibility ILIKE $1 ESCAPE '\\'
         )
         AND ($2::text IS NULL OR i.location ILIKE $2 ESCAPE '\\')
         AND ($3::text IS NULL OR i.organisation ILIKE $3 ESCAPE '\\')
         AND ($4::text IS NULL OR i.eligibility ILIKE $4 ESCAPE '\\')
       ORDER BY i.deadline NULLS LAST, i.title ASC`,
      [
        likePattern(keyword.value),
        likePattern(location.value),
        likePattern(organisation.value),
        likePattern(eligibility.value),
      ]
    );

    return res.status(200).json({
      success: true,
      internships: result.rows.map(publicInternship),
    });
  } catch (error) {
    return sendServerError(res, "Internship search failed", error);
  }
});

// F-008: a recruiter sees every listing they own, including closed and expired.
router.get("/mine", authorizeRole("recruiter"), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ${internshipColumns}
       FROM internships i
       WHERE i.recruiter_id = $1
       ORDER BY i.updated_at DESC`,
      [req.user.userId]
    );

    return res.status(200).json({
      success: true,
      internships: result.rows.map(publicInternship),
    });
  } catch (error) {
    return sendServerError(res, "Recruiter listing retrieval failed", error);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id, "Internship id");

    if (id.error) {
      return res.status(400).json({ success: false, message: id.error });
    }

    const result = await pool.query(
      `SELECT ${internshipColumns},
              EXISTS (
                SELECT 1 FROM applications a
                WHERE a.internship_id = i.id AND a.student_id = $2
              ) AS has_applied
       FROM internships i
       WHERE i.id = $1`,
      [id.value, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Internship not found.",
      });
    }

    const row = result.rows[0];

    return res.status(200).json({
      success: true,
      internship: {
        ...publicInternship(row),
        has_applied: Boolean(row.has_applied),
      },
    });
  } catch (error) {
    return sendServerError(res, "Internship retrieval failed", error);
  }
});

router.post("/", authorizeRole("recruiter"), async (req, res) => {
  try {
    const listing = validateListing(req.body);

    if (listing.error) {
      return res.status(400).json({ success: false, message: listing.error });
    }

    const { title, organisation, description, eligibility, location, deadline } =
      listing.value;

    const result = await pool.query(
      `INSERT INTO internships
         (recruiter_id, title, organisation, description, eligibility, location, deadline)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        req.user.userId,
        title,
        organisation,
        description,
        eligibility,
        location,
        deadline,
      ]
    );

    const created = await pool.query(
      `SELECT ${internshipColumns}
       FROM internships i
       WHERE i.id = $1`,
      [result.rows[0].id]
    );

    return res.status(201).json({
      success: true,
      message: "Internship listing created.",
      internship: publicInternship(created.rows[0]),
    });
  } catch (error) {
    return sendServerError(res, "Internship creation failed", error);
  }
});

router.put("/:id", authorizeRole("recruiter"), async (req, res) => {
  try {
    const id = parseId(req.params.id, "Internship id");

    if (id.error) {
      return res.status(400).json({ success: false, message: id.error });
    }

    const listing = validateListing(req.body);

    if (listing.error) {
      return res.status(400).json({ success: false, message: listing.error });
    }

    const existing = await pool.query(
      "SELECT recruiter_id FROM internships WHERE id = $1",
      [id.value]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Internship not found.",
      });
    }

    if (Number(existing.rows[0].recruiter_id) !== Number(req.user.userId)) {
      return res.status(403).json({
        success: false,
        message: "You can only manage your own listings.",
      });
    }

    const { title, organisation, description, eligibility, location, deadline } =
      listing.value;

    await pool.query(
      `UPDATE internships
       SET title = $1,
           organisation = $2,
           description = $3,
           eligibility = $4,
           location = $5,
           deadline = $6,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND recruiter_id = $8`,
      [
        title,
        organisation,
        description,
        eligibility,
        location,
        deadline,
        id.value,
        req.user.userId,
      ]
    );

    const updated = await pool.query(
      `SELECT ${internshipColumns}
       FROM internships i
       WHERE i.id = $1`,
      [id.value]
    );

    return res.status(200).json({
      success: true,
      message: "Internship listing updated.",
      internship: publicInternship(updated.rows[0]),
    });
  } catch (error) {
    return sendServerError(res, "Internship update failed", error);
  }
});

router.patch("/:id/close", authorizeRole("recruiter"), async (req, res) => {
  try {
    const id = parseId(req.params.id, "Internship id");

    if (id.error) {
      return res.status(400).json({ success: false, message: id.error });
    }

    const existing = await pool.query(
      "SELECT recruiter_id, is_active FROM internships WHERE id = $1",
      [id.value]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Internship not found.",
      });
    }

    if (Number(existing.rows[0].recruiter_id) !== Number(req.user.userId)) {
      return res.status(403).json({
        success: false,
        message: "You can only manage your own listings.",
      });
    }

    if (!existing.rows[0].is_active) {
      return res.status(400).json({
        success: false,
        message: "This listing is already closed.",
      });
    }

    await pool.query(
      `UPDATE internships
       SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND recruiter_id = $2`,
      [id.value, req.user.userId]
    );

    const closed = await pool.query(
      `SELECT ${internshipColumns}
       FROM internships i
       WHERE i.id = $1`,
      [id.value]
    );

    return res.status(200).json({
      success: true,
      message: "Internship listing closed.",
      internship: publicInternship(closed.rows[0]),
    });
  } catch (error) {
    return sendServerError(res, "Internship close failed", error);
  }
});

// F-009 and F-010: students apply once, and the database blocks a second insert.
router.post("/:id/apply", authorizeRole("student"), async (req, res) => {
  try {
    const id = parseId(req.params.id, "Internship id");

    if (id.error) {
      return res.status(400).json({ success: false, message: id.error });
    }

    const internship = await pool.query(
      `SELECT ${internshipColumns}
       FROM internships i
       WHERE i.id = $1`,
      [id.value]
    );

    if (internship.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Internship not found.",
      });
    }

    if (internship.rows[0].availability !== "open") {
      return res.status(400).json({
        success: false,
        message:
          "Applications cannot be submitted for an expired or unavailable internship.",
      });
    }

    const profile = await pool.query(
      `SELECT u.full_name, u.email, p.phone, p.education, p.skills, p.resume_url
       FROM users u
       LEFT JOIN student_profiles p ON p.user_id = u.id
       WHERE u.id = $1`,
      [req.user.userId]
    );

    const student = profile.rows[0];

    if (!student || typeof student.education !== "string" || !student.education.trim()) {
      return res.status(400).json({
        success: false,
        message: "Add your education details to your profile before applying.",
      });
    }

    const duplicate = await pool.query(
      `SELECT id FROM applications
       WHERE student_id = $1 AND internship_id = $2`,
      [req.user.userId, id.value]
    );

    if (duplicate.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this internship.",
      });
    }

    const inserted = await pool.query(
      `INSERT INTO applications
         (student_id, internship_id, full_name, email, phone, education, skills, resume_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, status, full_name, email, education, skills, created_at`,
      [
        req.user.userId,
        id.value,
        student.full_name,
        student.email,
        student.phone,
        student.education.trim(),
        student.skills,
        student.resume_url,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Application submitted.",
      application: {
        ...inserted.rows[0],
        internship: publicInternship(internship.rows[0]),
      },
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this internship.",
      });
    }

    return sendServerError(res, "Application failed", error);
  }
});

module.exports = router;
