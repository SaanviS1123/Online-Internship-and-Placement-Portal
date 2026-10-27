
const express = require("express");
const pool = require("../db");
const authenticateToken = require("../middleware/auth");
const authorizeRole = require("../middleware/authorizeRole");

const router = express.Router();

// GET: Retrieve the logged-in student's profile
router.get("/", authenticateToken, authorizeRole("student"), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.full_name, u.email,
              p.phone, p.education, p.skills, p.resume_url,
              p.created_at, p.updated_at
       FROM users u
       LEFT JOIN student_profiles p ON p.user_id = u.id
       WHERE u.id = $1`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      profile: result.rows[0],
    });
  } catch (error) {
    console.error("Profile retrieval failed:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve profile.",
    });
  }
});

// PUT: Create or update the logged-in student's profile
router.put("/", authenticateToken, authorizeRole("student"), async (req, res) => {
  try {
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
        (typeof value !== "string" || value.length > maxLength)
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

    const result = await pool.query(
      `INSERT INTO student_profiles
         (user_id, phone, education, skills, resume_url)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id)
       DO UPDATE SET
         phone = EXCLUDED.phone,
         education = EXCLUDED.education,
         skills = EXCLUDED.skills,
         resume_url = EXCLUDED.resume_url,
         updated_at = CURRENT_TIMESTAMP
       RETURNING user_id, phone, education, skills, resume_url,
                 created_at, updated_at`,
      [
        req.user.userId,
        phone ?? null,
        education ?? null,
        skills ?? null,
        resumeUrl?.trim() || null,
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      profile: result.rows[0],
    });
  } catch (error) {
    console.error("Profile update failed:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to update profile.",
    });
  }
});

module.exports = router;
