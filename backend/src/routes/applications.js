const express = require("express");
const pool = require("../db");
const authenticateToken = require("../middleware/auth");
const authorizeRole = require("../middleware/authorizeRole");
const { parseId, validateStatus } = require("../validate");

const router = express.Router();

router.use(authenticateToken);

function sendServerError(res, logLabel, error) {
  console.error(`${logLabel}:`, error.message);
  return res.status(500).json({
    success: false,
    message: "Unable to complete the request.",
  });
}

const applicationColumns = `
  a.id,
  a.status,
  a.full_name,
  a.email,
  a.education,
  a.skills,
  a.created_at,
  a.updated_at,
  i.id AS internship_id,
  i.title,
  i.organisation,
  i.location,
  to_char(i.deadline, 'YYYY-MM-DD') AS deadline
`;

function presentApplication(row) {
  return {
    id: row.id,
    status: row.status,
    full_name: row.full_name,
    email: row.email,
    education: row.education,
    skills: row.skills,
    created_at: row.created_at,
    updated_at: row.updated_at,
    internship: {
      id: row.internship_id,
      title: row.title,
      organisation: row.organisation,
      location: row.location,
      deadline: row.deadline,
    },
  };
}

// F-011: a student sees only their own applications and the current status.
router.get("/", authorizeRole("student"), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ${applicationColumns}
       FROM applications a
       JOIN internships i ON i.id = a.internship_id
       WHERE a.student_id = $1
       ORDER BY a.created_at DESC`,
      [req.user.userId]
    );

    res.set("Cache-Control", "no-store");

    return res.status(200).json({
      success: true,
      applications: result.rows.map(presentApplication),
    });
  } catch (error) {
    return sendServerError(res, "Application retrieval failed", error);
  }
});

// F-012: a recruiter sees applications only for listings they own.
router.get("/reviews", authorizeRole("recruiter"), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ${applicationColumns}
       FROM applications a
       JOIN internships i ON i.id = a.internship_id
       WHERE i.recruiter_id = $1
       ORDER BY a.created_at DESC`,
      [req.user.userId]
    );

    res.set("Cache-Control", "no-store");

    return res.status(200).json({
      success: true,
      applications: result.rows.map(presentApplication),
    });
  } catch (error) {
    return sendServerError(res, "Recruiter application retrieval failed", error);
  }
});

router.patch("/:id", authorizeRole("recruiter"), async (req, res) => {
  try {
    const id = parseId(req.params.id, "Application id");

    if (id.error) {
      return res.status(400).json({ success: false, message: id.error });
    }

    const status = validateStatus(req.body?.status);

    if (status.error) {
      return res.status(400).json({ success: false, message: status.error });
    }

    const existing = await pool.query(
      `SELECT a.id, i.recruiter_id
       FROM applications a
       JOIN internships i ON i.id = a.internship_id
       WHERE a.id = $1`,
      [id.value]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    if (Number(existing.rows[0].recruiter_id) !== Number(req.user.userId)) {
      return res.status(403).json({
        success: false,
        message: "You can only update applications for your own listings.",
      });
    }

    await pool.query(
      `UPDATE applications
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [status.value, id.value]
    );

    const updated = await pool.query(
      `SELECT ${applicationColumns}
       FROM applications a
       JOIN internships i ON i.id = a.internship_id
       WHERE a.id = $1`,
      [id.value]
    );

    return res.status(200).json({
      success: true,
      message: "Application status updated.",
      application: presentApplication(updated.rows[0]),
    });
  } catch (error) {
    return sendServerError(res, "Application status update failed", error);
  }
});

module.exports = router;
