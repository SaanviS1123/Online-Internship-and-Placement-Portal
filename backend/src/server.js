const authRoutes = require("./routes/auth");
const express = require("express");
const profileRoutes = require("./routes/profile");
const cors = require("cors");
const authenticateToken = require("./middleware/auth");
const authorizeRole = require("./middleware/authorizeRole");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use("/api/profile", profileRoutes);
app.use("/api/auth", authRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Online Internship Portal API is running",
  });
});

app.get("/api/auth/me", authenticateToken, (req, res) => {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  });

  app.get(
    "/api/student/dashboard",
    authenticateToken,
    authorizeRole("student"),
    (req, res) => {
      res.status(200).json({
        success: true,
        message: "Student dashboard access granted.",
        userId: req.user.userId,
        role: req.user.role,
      });
    }
  );

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
