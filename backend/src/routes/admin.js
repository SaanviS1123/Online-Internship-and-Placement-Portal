const express = require("express");
const pool = require("../db");
const authenticateToken = require("../middleware/auth");
const authorizeRole = require("../middleware/authorizeRole");

const router = express.Router();
router.use(authenticateToken, authorizeRole("admin"));

function parseId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function sendError(res, label, error) {
  console.error(`${label}:`, error.message);
  return res.status(500).json({ success: false, message: "Unable to complete the administration request." });
}

function validateResource(body) {
  const slug = typeof body?.slug === "string" ? body.slug.trim().toLowerCase() : "";
  const category = typeof body?.category === "string" ? body.category.trim() : "";
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const description = typeof body?.description === "string" ? body.description.trim() : "";
  const url = typeof body?.url === "string" ? body.url.trim() : "";
  const available = body?.is_available;
  const sortOrder = body?.sort_order === undefined ? 0 : Number(body.sort_order);

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 100) {
    return { error: "Slug must use lowercase letters, numbers and hyphens." };
  }
  if (!category || category.length > 100 || !title || title.length > 180 || !description || description.length > 5000) {
    return { error: "Category, title and description are required and must be within their length limits." };
  }
  if (typeof available !== "boolean" || !Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 10000) {
    return { error: "Availability and sort order are invalid." };
  }
  if (available && !/^https?:\/\/\S+$/i.test(url)) {
    return { error: "An available resource must have an HTTP or HTTPS URL." };
  }
  if (url && (!/^https?:\/\/\S+$/i.test(url) || url.length > 2048)) {
    return { error: "Resource URL must be a valid HTTP or HTTPS URL." };
  }
  return { value: { slug, category, title, description, url: url || null, available, sortOrder } };
}

// F-019: user administration; password hashes are never returned.
router.get("/users", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, full_name, email, role, created_at
       FROM users ORDER BY created_at DESC`
    );
    return res.status(200).json({ success: true, users: result.rows });
  } catch (error) {
    return sendError(res, "Admin user list failed", error);
  }
});

router.patch("/users/:id/role", async (req, res) => {
  const id = parseId(req.params.id);
  const role = req.body?.role;
  if (!id || !["student", "recruiter", "admin"].includes(role)) {
    return res.status(400).json({ success: false, message: "A valid user id and role are required." });
  }
  if (id === Number(req.user.userId)) {
    return res.status(409).json({ success: false, message: "You cannot change your own administrator role." });
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const existing = await client.query(
      `SELECT id, role FROM users WHERE id = $1 FOR UPDATE`,
      [id]
    );
    if (!existing.rows[0]) {
      await client.query("ROLLBACK");
      return res.status(404).json({ success: false, message: "User not found." });
    }
    if (existing.rows[0].role === "admin" && role !== "admin") {
      const admins = await client.query(
        `SELECT id FROM users WHERE role = 'admin' FOR UPDATE`
      );
      if (admins.rows.length <= 1) {
        await client.query("ROLLBACK");
        return res.status(409).json({ success: false, message: "The last administrator cannot be demoted." });
      }
    }
    const result = await client.query(
      `UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, full_name, email, role, created_at`,
      [role, id]
    );
    await client.query("COMMIT");
    return res.status(200).json({ success: true, user: result.rows[0] });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    return sendError(res, "Admin user update failed", error);
  } finally {
    client.release();
  }
});

// Recruiter-owned listings remain protected in the recruiter API; administrators can activate/deactivate them.
router.get("/internships", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.id, i.title, i.organisation, i.location, i.deadline,
              i.is_active, i.created_at, u.full_name AS recruiter_name
       FROM internships i JOIN users u ON u.id = i.recruiter_id
       ORDER BY i.created_at DESC`
    );
    return res.status(200).json({ success: true, internships: result.rows });
  } catch (error) {
    return sendError(res, "Admin internship list failed", error);
  }
});

router.patch("/internships/:id/status", async (req, res) => {
  const id = parseId(req.params.id);
  const isActive = req.body?.is_active;
  if (!id || typeof isActive !== "boolean") {
    return res.status(400).json({ success: false, message: "A valid internship id and is_active boolean are required." });
  }
  try {
    const result = await pool.query(
      `UPDATE internships SET is_active = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, title, organisation, is_active`,
      [isActive, id]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ success: false, message: "Internship not found." });
    }
    return res.status(200).json({ success: true, internship: result.rows[0] });
  } catch (error) {
    return sendError(res, "Admin internship update failed", error);
  }
});

router.get("/resources", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, slug, category, title, description, url,
              is_available, sort_order, updated_at
       FROM preparation_resources ORDER BY sort_order ASC, title ASC`
    );
    return res.status(200).json({ success: true, resources: result.rows });
  } catch (error) {
    return sendError(res, "Admin resource list failed", error);
  }
});

router.post("/resources", async (req, res) => {
  const resource = validateResource(req.body);
  if (resource.error) return res.status(400).json({ success: false, message: resource.error });
  try {
    const value = resource.value;
    const result = await pool.query(
      `INSERT INTO preparation_resources
         (slug, category, title, description, url, is_available, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, slug, category, title, description, url, is_available, sort_order`,
      [value.slug, value.category, value.title, value.description, value.url, value.available, value.sortOrder]
    );
    return res.status(201).json({ success: true, resource: result.rows[0] });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ success: false, message: "A resource with this slug already exists." });
    }
    return sendError(res, "Admin resource creation failed", error);
  }
});

router.put("/resources/:id", async (req, res) => {
  const id = parseId(req.params.id);
  const resource = validateResource(req.body);
  if (!id) return res.status(400).json({ success: false, message: "Invalid resource id." });
  if (resource.error) return res.status(400).json({ success: false, message: resource.error });
  try {
    const value = resource.value;
    const result = await pool.query(
      `UPDATE preparation_resources
       SET slug = $1, category = $2, title = $3, description = $4,
           url = $5, is_available = $6, sort_order = $7,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING id, slug, category, title, description, url, is_available, sort_order`,
      [value.slug, value.category, value.title, value.description, value.url,
        value.available, value.sortOrder, id]
    );
    if (!result.rows[0]) return res.status(404).json({ success: false, message: "Resource not found." });
    return res.status(200).json({ success: true, resource: result.rows[0] });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ success: false, message: "A resource with this slug already exists." });
    }
    return sendError(res, "Admin resource update failed", error);
  }
});

module.exports = router;
