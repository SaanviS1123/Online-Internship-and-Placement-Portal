const jwt = require("jsonwebtoken");
const pool = require("../db");

async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication token is required.",
    });
  }

  const token = authHeader.slice(7);
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not configured.");
    return res.status(500).json({
      success: false,
      message: "Authentication is not configured.",
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token.",
    });
  }

  try {
    // Read the current role from PostgreSQL so role changes take effect
    // immediately instead of trusting a potentially stale JWT role claim.
    const result = await pool.query(
      "SELECT id, role FROM users WHERE id = $1",
      [decoded.userId]
    );
    if (!result.rows[0]) {
      return res.status(401).json({
        success: false,
        message: "The account for this authentication token no longer exists.",
      });
    }

    req.user = {
      userId: result.rows[0].id,
      role: result.rows[0].role,
    };
    return next();
  } catch (error) {
    console.error("Authentication account lookup failed:", error.message);
    return res.status(503).json({
      success: false,
      message: "Unable to verify the account. Please try again.",
    });
  }
}

module.exports = authenticateToken;
