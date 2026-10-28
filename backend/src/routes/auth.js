
const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../db");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Validate required fields
    if (
      typeof fullName !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !fullName.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, and password are required.",
      });
    }

    const normalizedName = fullName.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedName.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Full name must not exceed 100 characters.",
      });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      normalizedEmail.length > 255 ||
      !emailPattern.test(normalizedEmail)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters and no more than 72 bytes.",
      });
    }

    // Hash the password before storing it
    const passwordHash = await bcrypt.hash(password, 12);

    // Always assign the public registration role as student
    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name, email, role, created_at`,
      [normalizedName, normalizedEmail, passwordHash, "student"]
    );

    return res.status(201).json({
      success: true,
      message: "Registration successful.",
      user: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    console.error("Registration failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to complete registration.",
    });
  }
});

router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (
        typeof email !== "string" ||
        typeof password !== "string" ||
        !email.trim() ||
        !password
      ) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required.",
        });
      }

      const normalizedEmail = email.trim().toLowerCase();

      const result = await pool.query(
        `SELECT id, full_name, email, password_hash, role
         FROM users
         WHERE email = $1`,
        [normalizedEmail]
      );

      // Use the same message for an unknown email and incorrect password
      if (result.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password.",
        });
      }

      const user = result.rows[0];

      const passwordMatches = await bcrypt.compare(
        password,
        user.password_hash
      );

      if (!passwordMatches) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password.",
        });
      }

      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not configured.");

        return res.status(500).json({
          success: false,
          message: "Authentication is not configured.",
        });
      }

      const token = jwt.sign(
        {
          userId: user.id,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return res.status(200).json({
        success: true,
        message: "Login successful.",
        token,
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Login failed:", error.message);

      return res.status(500).json({
        success: false,
        message: "Unable to complete login.",
      });
    }
  });


module.exports = router;
